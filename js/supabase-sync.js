/* 学習者のアカウント・クラウド進捗同期 + 管理者編集問題の配信 */
(function(){
  const CFG = { url: window.SUPABASE_URL || '', anonKey: window.SUPABASE_ANON_KEY || '' };
  let client = null;
  let currentUser = null;
  let syncing = false;
  let restored = false;
  let timer = null;
  let authInitialized = false;
  let resolveAuthReady;

  // ページごとの初期化タイミングの差で、practice.jsが先に動かないようにします。
  const authReady = new Promise(resolve => { resolveAuthReady = resolve; });

  function configured(){ return !!(CFG.url && CFG.anonKey && window.supabase); }

  function getClient(){
    if (!client && configured()) {
      client = window.supabase.createClient(CFG.url, CFG.anonKey);
    }
    return client;
  }

  async function loadQuestions(){
    const c = getClient();
    if (!c || !window.KagakuData?.questions) return;

    try {
      const [{ data: rows, error }, { data: statuses }] = await Promise.all([
        c.rpc('get_published_questions'),
        c.rpc('get_question_statuses')
      ]);

      if (error) {
        console.warn('クラウド問題の取得に失敗:', error.message);
        return;
      }

      console.log('Supabaseから取得した問題:', rows || []);

      const byId = new Map(
        (window.KagakuData.questions || []).map(q => [q.id, q])
      );

      (rows || []).forEach(r => {
        const q = {
          id: r.id,
          unitId: r.unit_id,
          difficulty: r.difficulty || 'basic',
          question: r.question || '',
          options: Array.isArray(r.options) ? r.options : [],
          answerIndex: Number(r.answer_index) || 0,
          explanation: r.explanation || '',
          tags: Array.isArray(r.tags) ? r.tags : []
        };
        byId.set(q.id, q);
      });

      (statuses || []).forEach(r => {
        if (r.is_published === false || r.is_deleted === true) {
          byId.delete(r.id);
        }
      });

      window.KagakuData.questions = Array.from(byId.values());

      console.log(
        'KagakuData.questions 更新完了:',
        window.KagakuData.questions.length,
        '問'
      );

      console.log(
        'クラウド問題:',
        (rows || []).map(q => q.question)
      );
    } catch(e) {
      console.warn('クラウド問題の読み込みに失敗:', e);
    }
  }

  async function syncSnapshot(){
    const c = getClient();

    if (
      !c ||
      !currentUser ||
      !window.Storage ||
      !window.Mastery ||
      !window.KagakuData
    ) {
      return;
    }

    if (syncing) return;

    syncing = true;

    try {
      const data = Storage.getUserData();

      const unitMastery = {};

      (KagakuData.units || []).forEach(u => {
        unitMastery[u.id] = Mastery.unitScore(
          u.id,
          KagakuData.questions,
          data.attempts || {}
        );
      });

      const values = Object.values(data.attempts || {});

      const mastery = values.length
        ? Math.round(
            values.reduce(
              (a,b) => a + Mastery.questionScore(b),
              0
            ) / values.length
          )
        : 0;

      // 同じ問題を複数回解いた場合も、すべてのattemptを合計します。
      const attemptCount = values.reduce(
        (a,b) => a + (Number(b.count) || 0),
        0
      );

      const lastStudy = data.lastStudyDate
        ? new Date(
            data.lastStudyDate + 'T23:59:59'
          ).toISOString()
        : null;

      const now = new Date().toISOString();

      const payload = {
        user_id: currentUser.id,
        mastery,
        attempt_count: attemptCount,
        total_time_seconds:
          Number(data.totalTimeSeconds) || 0,
        last_study_at: lastStudy,
        unit_mastery: unitMastery,
        data,
        updated_at: now
      };

      const { error } = await c
        .from('progress_snapshots')
        .upsert(
          payload,
          { onConflict:'user_id' }
        );

      if (error) {
        console.warn(
          'クラウド同期に失敗:',
          error.message
        );
      }

      const recordedDate =
        data.lastStudyDate || now.slice(0,10);

      const { error: historyError } = await c
        .from('progress_history')
        .upsert(
          {
            user_id: currentUser.id,
            recorded_date: recordedDate,
            mastery,
            attempt_count: attemptCount,
            total_time_seconds:
              Number(data.totalTimeSeconds) || 0,
            unit_mastery: unitMastery,
            updated_at: now
          },
          {
            onConflict:'user_id,recorded_date'
          }
        );

      if (historyError) {
        console.warn(
          '学習履歴の保存に失敗:',
          historyError.message
        );
      }

    } finally {
      syncing = false;
    }
  }

  function queueSync(){
    if (!currentUser || !restored) return;

    clearTimeout(timer);

    timer = setTimeout(
      syncSnapshot,
      350
    );
  }

  async function restoreSnapshot(){
    const c = getClient();

    if (
      !c ||
      !currentUser ||
      !window.Storage
    ) {
      restored = true;
      return;
    }

    try {
      const { data: row, error } = await c
        .from('progress_snapshots')
        .select('data')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (!error && row?.data) {
        Storage.saveUserData(
          row.data,
          { skipSync: true }
        );
      } else if (error) {
        console.warn(
          'クラウド進捗の取得に失敗:',
          error.message
        );
      }

    } catch(e) {
      console.warn(
        'クラウド進捗の復元に失敗:',
        e
      );

    } finally {
      restored = true;
    }
  }

  async function refreshAuth(){
    const c = getClient();

    if (!c) {
      currentUser = null;
      restored = true;
      return null;
    }

    const { data, error } =
      await c.auth.getSession();

    if (error) {
      console.warn(
        'Supabase認証状態の取得に失敗:',
        error.message
      );
    }

    currentUser =
      data.session?.user || null;

    if (currentUser) {
      await restoreSnapshot();
    } else {
      restored = true;
    }

    return currentUser;
  }

  async function handleAuthSession(session){
    currentUser =
      session?.user || null;

    restored = false;

    if (currentUser) {
      await restoreSnapshot();
    } else {
      restored = true;
    }

    document.dispatchEvent(
      new CustomEvent(
        'kagaku-auth-change',
        {
          detail: {
            user: currentUser
          }
        }
      )
    );
  }

  async function initializeAuth(){
    if (authInitialized) {
      return authReady;
    }

    authInitialized = true;

    const c = getClient();

    if (!c) {
      currentUser = null;
      restored = true;
      resolveAuthReady(null);
      return authReady;
    }

    c.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'INITIAL_SESSION') {
          return;
        }

        // Supabaseの認証イベントコールバック内でawaitしないようにします。
        void handleAuthSession(session);
      }
    );

    const user = await refreshAuth();

    resolveAuthReady(user);

    document.dispatchEvent(
      new CustomEvent(
        'kagaku-auth-change',
        {
          detail: {
            user: currentUser
          }
        }
      )
    );

    return user;
  }

  async function signIn(email,password){
    const c = getClient();

    if (!c) {
      throw new Error(
        'Supabaseの設定がありません。'
      );
    }

    const result =
      await c.auth.signInWithPassword({
        email,
        password
      });

    if (
      !result.error &&
      result.data?.session
    ) {
      await handleAuthSession(
        result.data.session
      );
    }

    return result;
  }

  async function signUp(
    email,
    password,
    displayName
  ){
    const c = getClient();

    if (!c) {
      throw new Error(
        'Supabaseの設定がありません。'
      );
    }

    const result =
      await c.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name:
              displayName || '学習者'
          }
        }
      });

    if (
      !result.error &&
      result.data?.session
    ) {
      await handleAuthSession(
        result.data.session
      );
    }

    return result;
  }

  async function signOut(){
    const c = getClient();

    if (c) {
      await c.auth.signOut();
    }

    currentUser = null;
    restored = false;

    document.dispatchEvent(
      new CustomEvent(
        'kagaku-auth-change',
        {
          detail: {
            user: null
          }
        }
      )
    );
  }

  function user(){
    return currentUser;
  }

  function isConfigured(){
    return configured();
  }

  window.KagakuCloud = {
    getClient,
    configured: isConfigured,
    user,
    signIn,
    signUp,
    signOut,
    syncSnapshot,
    queueSync,
    refreshAuth,
    loadQuestions,
    authReady,
    questionsReady: null
  };

  // 問題取得と認証復元の両方が終わってから、
  // 演習ページが開始できるようにします。
  const questionsPromise =
    loadQuestions();

  window.KagakuCloud.questionsReady =
    Promise.all([
      questionsPromise,
      authReady
    ]).then(() => undefined);

  // scriptがbody末尾にあっても、
  // 他ページの読み込み方式に依存しないよう即時初期化します。
  void initializeAuth();
})();
