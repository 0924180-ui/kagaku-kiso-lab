/* 学習者のアカウント・クラウド進捗同期 + 管理者編集問題の配信 */
(function(){
  const CFG = {
    url: window.SUPABASE_URL || '',
    anonKey: window.SUPABASE_ANON_KEY || ''
  };

  let client = null;
  let currentUser = null;
  let syncing = false;
  let restored = false;
  let timer = null;

  function configured(){
    return !!(CFG.url && CFG.anonKey && window.supabase);
  }

  function getClient(){
    if (!client && configured()) {
      client = window.supabase.createClient(
        CFG.url,
        CFG.anonKey
      );
    }
    return client;
  }

  /*
   * Supabaseから公開問題を取得して
   * KagakuData.questions に追加する
   */
  async function loadQuestions(){
    const c = getClient();

    if (!c || !window.KagakuData?.questions) {
      console.warn('SupabaseまたはKagakuDataが準備されていません。');
      return;
    }

    try {
      /*
       * 問題本体と公開状態を別々に取得します。
       *
       * 以前は Promise.all() を使っていたため、
       * 公開状態の取得だけ失敗しても問題本体まで
       * 読み込み失敗になっていました。
       */
      const { data: rows, error } =
        await c.rpc('get_published_questions');

      if (error) {
        console.error(
          'クラウド問題の取得に失敗:',
          error
        );
        return;
      }

      console.log(
        'Supabaseから取得した問題:',
        rows || []
      );

      /*
       * 既存の問題をMapに入れる
       * → 同じIDの問題はクラウド側で上書き
       */
      const byId = new Map(
        (window.KagakuData.questions || [])
          .map(q => [q.id, q])
      );

      /*
       * Supabaseのデータ形式を
       * KagakuDataの形式に変換
       */
      (rows || []).forEach(r => {
        const q = {
          id: r.id,

          unitId: r.unit_id,

          difficulty:
            r.difficulty || 'basic',

          question:
            r.question || '',

          options:
            Array.isArray(r.options)
              ? r.options
              : [],

          answerIndex:
            Number(r.answer_index) || 0,

          explanation:
            r.explanation || '',

          tags:
            Array.isArray(r.tags)
              ? r.tags
              : []
        };

        byId.set(q.id, q);
      });

      /*
       * 公開状態・削除状態を確認
       *
       * ここは問題本体の取得とは分離しています。
       * この処理が失敗しても、取得済みの問題は利用できます。
       */
      try {
        const {
          data: statuses,
          error: statusError
        } = await c.rpc('get_question_statuses');

        if (statusError) {
          console.warn(
            '問題の公開状態取得に失敗しました。' +
            '問題本体はそのまま読み込みます:',
            statusError.message
          );
        } else {
          (statuses || []).forEach(r => {
            if (
              r.is_published === false ||
              r.is_deleted === true
            ) {
              byId.delete(r.id);
            }
          });
        }

      } catch (statusError) {
        console.warn(
          '問題の公開状態取得に失敗しました。' +
          '問題本体はそのまま読み込みます:',
          statusError
        );
      }

      /*
       * 最終的な問題一覧をKagakuDataへ反映
       */
      window.KagakuData.questions =
        Array.from(byId.values());

      console.log(
        'KagakuData.questions 更新完了:',
        window.KagakuData.questions.length,
        '問'
      );

      /*
       * クラウド問題が実際に入ったか確認
       */
      console.log(
        'クラウド問題:',
        (rows || []).map(q => q.question)
      );

    } catch(e) {
      console.error(
        'クラウド問題の読み込みに失敗:',
        e
      );
    }
  }

  /*
   * 学習進捗をSupabaseへ保存
   */
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
        unitMastery[u.id] =
          Mastery.unitScore(
            u.id,
            KagakuData.questions,
            data.attempts || {}
          );
      });

      const values =
        Object.values(data.attempts || {});

      const mastery =
        values.length
          ? Math.round(
              values.reduce(
                (a, b) =>
                  a + Mastery.questionScore(b),
                0
              ) / values.length
            )
          : 0;

      const attemptCount =
        values.reduce(
          (a, b) =>
            a + (Number(b.count) || 0),
          0
        );

      const lastStudy =
        data.lastStudyDate
          ? new Date(
              data.lastStudyDate + 'T23:59:59'
            ).toISOString()
          : null;

      const now =
        new Date().toISOString();

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

      const { error } =
        await c
          .from('progress_snapshots')
          .upsert(
            payload,
            {
              onConflict: 'user_id'
            }
          );

      if (error) {
        console.warn(
          'クラウド同期に失敗:',
          error.message
        );
      }

      /*
       * 管理者が学習推移を確認できるよう、
       * 1日1件の履歴を保存
       */
      const recordedDate =
        data.lastStudyDate ||
        now.slice(0, 10);

      const {
        error: historyError
      } = await c
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
            onConflict:
              'user_id,recorded_date'
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
    if (!currentUser || !restored) {
      return;
    }

    clearTimeout(timer);

    timer = setTimeout(
      syncSnapshot,
      350
    );
  }

  /*
   * Supabaseに保存されている進捗を復元
   */
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
      const {
        data: row,
        error
      } = await c
        .from('progress_snapshots')
        .select('data')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (
        !error &&
        row?.data
      ) {
        Storage.saveUserData(
          row.data,
          {
            skipSync: true
          }
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

  /*
   * 現在のログイン状態を確認
   */
  async function refreshAuth(){
    const c = getClient();

    if (!c) {
      return null;
    }

    const { data } =
      await c.auth.getSession();

    currentUser =
      data.session?.user || null;

    if (currentUser) {
      await restoreSnapshot();
    }

    return currentUser;
  }

  /*
   * ログイン
   */
  async function signIn(
    email,
    password
  ){
    const c = getClient();

    if (!c) {
      throw new Error(
        'Supabaseの設定がありません。'
      );
    }

    return c.auth.signInWithPassword({
      email,
      password
    });
  }

  /*
   * 新規登録
   */
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

    return c.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name:
            displayName || '学習者'
        }
      }
    });
  }

  /*
   * ログアウト
   */
  async function signOut(){
    const c = getClient();

    if (c) {
      await c.auth.signOut();
    }

    currentUser = null;
    restored = false;
  }

  function user(){
    return currentUser;
  }

  function isConfigured(){
    return configured();
  }

  /*
   * 外部から利用できる機能
   */
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
    questionsReady: null
  };

  /*
   * ページ読み込み時に
   * Supabaseの問題を取得
   */
  window.KagakuCloud.questionsReady =
    loadQuestions();

  /*
   * 認証状態の監視
   */
  document.addEventListener(
    'DOMContentLoaded',
    async () => {
      const c = getClient();

      if (!c) {
        return;
      }

      c.auth.onAuthStateChange(
        async (_event, session) => {
          currentUser =
            session?.user || null;

          restored = false;

          if (currentUser) {
            await restoreSnapshot();
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
      );

      await refreshAuth();

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
  );

})();
