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
   * Supabaseから公開問題を取得
   * data.jsのKagakuData.questionsへ追加
   */
  async function loadQuestions(){
    const c = getClient();

    /*
     * KagakuDataはwindow.KagakuDataではなく、
     * data.jsでグローバル変数として定義されているため
     * 直接KagakuDataを参照する。
     */
    if (
      !c ||
      typeof KagakuData === 'undefined' ||
      !KagakuData.questions
    ) {
      console.warn(
        'SupabaseまたはKagakuDataが準備されていません。'
      );
      return;
    }

    try {
      /*
       * 問題本体を取得
       */
      const {
        data: rows,
        error
      } = await c.rpc(
        'get_published_questions'
      );

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
       * 現在ある問題をMapへ入れる
       */
      const byId = new Map(
        KagakuData.questions.map(
          q => [q.id, q]
        )
      );

      /*
       * Supabase形式
       *
       * unit_id
       * answer_index
       *
       * ↓
       *
       * サイト形式
       *
       * unitId
       * answerIndex
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
       * 公開状態を確認
       *
       * ここでエラーになっても
       * 問題本体は読み込む。
       */
      try {
        const {
          data: statuses,
          error: statusError
        } = await c.rpc(
          'get_question_statuses'
        );

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
       * KagakuData.questionsを更新
       */
      KagakuData.questions =
        Array.from(byId.values());

      console.log(
        'KagakuData.questions 更新完了:',
        KagakuData.questions.length,
        '問'
      );

      console.log(
        'クラウド問題:',
        (rows || []).map(
          q => q.question
        )
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
      typeof Storage === 'undefined' ||
      typeof Mastery === 'undefined' ||
      typeof KagakuData === 'undefined'
    ) {
      return;
    }

    if (syncing) return;

    syncing = true;

    try {
      const data =
        Storage.getUserData();

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
        Object.values(
          data.attempts || {}
        );

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
              data.lastStudyDate +
              'T23:59:59'
            ).toISOString()
          : null;

      const now =
        new Date().toISOString();

      const payload = {
        user_id:
          currentUser.id,

        mastery,

        attempt_count:
          attemptCount,

        total_time_seconds:
          Number(
            data.totalTimeSeconds
          ) || 0,

        last_study_at:
          lastStudy,

        unit_mastery:
          unitMastery,

        data,

        updated_at:
          now
      };

      const {
        error
      } = await c
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

      const recordedDate =
        data.lastStudyDate ||
        now.slice(0, 10);

      const {
        error: historyError
      } = await c
        .from('progress_history')
        .upsert(
          {
            user_id:
              currentUser.id,

            recorded_date:
              recordedDate,

            mastery,

            attempt_count:
              attemptCount,

            total_time_seconds:
              Number(
                data.totalTimeSeconds
              ) || 0,

            unit_mastery:
              unitMastery,

            updated_at:
              now
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
    if (
      !currentUser ||
      !restored
    ) {
      return;
    }

    clearTimeout(timer);

    timer = setTimeout(
      syncSnapshot,
      350
    );
  }

  /*
   * Supabaseから進捗を復元
   */
  async function restoreSnapshot(){
    const c = getClient();

    if (
      !c ||
      !currentUser ||
      typeof Storage === 'undefined'
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
        .eq(
          'user_id',
          currentUser.id
        )
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
   * 認証状態を確認
   */
  async function refreshAuth(){
    const c = getClient();

    if (!c) {
      return null;
    }

    const {
      data
    } = await c.auth.getSession();

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
   * 外部公開
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
   * Supabase問題を取得
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
        async (
          _event,
          session
        ) => {
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
                  user:
                    currentUser
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
              user:
                currentUser
            }
          }
        )
      );
    }
  );

})();
