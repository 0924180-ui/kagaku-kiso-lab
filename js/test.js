document.addEventListener("DOMContentLoaded", async () => {
  // Supabaseの問題・ログイン状態の読み込みが完了してから開始
  if (window.KagakuCloud?.authReady) {
    await window.KagakuCloud.authReady;
  }

  if (window.KagakuCloud?.questionsReady) {
    await window.KagakuCloud.questionsReady;
  }

  const list = document.getElementById("test-list");
  const area = document.getElementById("test-area");
  const c = window.KagakuCloud?.getClient?.();

  if (!list || !area) {
    console.warn("test-list または test-area が見つかりません。");
    return;
  }

  if (!c) {
    list.innerHTML = `
      <div class="test-card">
        Supabase接続が設定されていません。
      </div>
    `;
    return;
  }

  // ------------------------------------------------------------
  // 共通関数
  // ------------------------------------------------------------

  function toIds(value) {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value || "[]");
        return Array.isArray(parsed)
          ? parsed
          : [];
      } catch (e) {
        console.warn(
          "question_ids の解析に失敗:",
          e
        );

        return [];
      }
    }

    return [];
  }

  function esc(value) {
    return String(value ?? "").replace(
      /[&<>'"]/g,
      char =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;"
        }[char])
    );
  }

  // Fisher-Yatesシャッフル
  function shuffle(list) {
    const arr = [...list];

    for (let i = arr.length - 1; i > 0; i--) {
      const j =
        Math.floor(
          Math.random() * (i + 1)
        );

      [arr[i], arr[j]] =
        [arr[j], arr[i]];
    }

    return arr;
  }

  // ------------------------------------------------------------
  // 制限時間表示
  // ------------------------------------------------------------

  function formatTimeLimit(seconds) {
    const total =
      Math.max(
        0,
        Number(seconds) || 0
      );

    if (total < 60) {
      return `${total}秒`;
    }

    const minutes =
      Math.floor(total / 60);

    const secs =
      total % 60;

    if (secs === 0) {
      return `${minutes}分`;
    }

    return `${minutes}分${secs}秒`;
  }

  // ------------------------------------------------------------
  // 公開テスト取得
  // ------------------------------------------------------------

  const {
    data: tests,
    error
  } = await c.rpc(
    "get_published_tests"
  );

  if (error) {
    console.error(
      "公開テスト取得エラー:",
      error
    );

    list.innerHTML = `
      <div class="test-card">

        <p>
          テスト機能の設定がまだ完了していません。
        </p>

        <p
          style="
            font-size:0.9em;
            opacity:0.8;
          "
        >
          管理者に設定を確認してもらってください。
        </p>

      </div>
    `;

    return;
  }

  if (!tests?.length) {
    list.innerHTML = `
      <div class="test-card">
        現在公開されているテストはありません。
      </div>
    `;

    return;
  }

  // ------------------------------------------------------------
  // テスト一覧表示
  // ------------------------------------------------------------

  list.innerHTML = tests
    .map(test => {
      const ids =
        toIds(test.question_ids);

      const limit =
        Number(
          test.time_limit_seconds
        ) || 0;

      return `
        <article class="test-item">

          <div>

            <h2>
              ${esc(test.title)}
            </h2>

            <p>
              ${esc(
                test.description || ""
              )}
            </p>

            <div class="test-meta">

              ${ids.length}問 ・

              ${
                limit
                  ? `${formatTimeLimit(limit)}制限`
                  : "時間制限なし"
              }

            </div>

          </div>

          <button
            class="btn btn-primary"
            data-test="${esc(test.id)}"
          >
            挑戦する
          </button>

        </article>
      `;
    })
    .join("");

  document
    .querySelectorAll("[data-test]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const test =
            tests.find(
              item =>
                String(item.id) ===
                String(
                  button.dataset.test
                )
            );

          if (test) {
            startTest(test);
          }

        }
      );

    });

  // ------------------------------------------------------------
  // テスト開始
  // ------------------------------------------------------------

  async function startTest(test) {

    const ids =
      toIds(test.question_ids);

    // ----------------------------------------------------------
    // ローカル問題を取得
    // ----------------------------------------------------------

    const localQuestions =
      window.KagakuData?.questions || [];

    const localMap =
      new Map(
        localQuestions.map(
          q => [
            String(q.id),
            q
          ]
        )
      );

    const questionMap =
      new Map();

    // ローカルにある問題を取得
    ids.forEach(id => {

      const q =
        localMap.get(
          String(id)
        );

      if (q) {
        questionMap.set(
          String(id),
          q
        );
      }

    });

    // ----------------------------------------------------------
    // ローカルにない問題をSupabaseから取得
    // ----------------------------------------------------------

    const missingIds =
      ids.filter(
        id =>
          !questionMap.has(
            String(id)
          )
      );

    if (missingIds.length > 0) {

      try {

        const {
          data: cloudQuestions,
          error
        } =
          await c
            .from("questions")
            .select(
              [
                "id",
                "unit_id",
                "difficulty",
                "question",
                "options",
                "answer_index",
                "explanation",
                "tags",
                "is_published",
                "is_deleted"
              ].join(",")
            )
            .in(
              "id",
              missingIds
            );

        if (error) {

          console.error(
            "テスト問題の取得に失敗:",
            error
          );

        } else {

          (
            cloudQuestions || []
          ).forEach(q => {

            /*
             * 削除済み問題や非公開問題は
             * テストには出さない
             */

            if (
              q.is_deleted === true ||
              q.is_published === false
            ) {
              return;
            }

            questionMap.set(
              String(q.id),
              {
                id: q.id,

                unitId:
                  q.unit_id,

                difficulty:
                  q.difficulty ||
                  "basic",

                question:
                  q.question ||
                  "",

                options:
                  Array.isArray(
                    q.options
                  )
                    ? q.options
                    : [],

                answerIndex:
                  Number(
                    q.answer_index
                  ) || 0,

                explanation:
                  q.explanation ||
                  "",

                tags:
                  Array.isArray(
                    q.tags
                  )
                    ? q.tags
                    : []
              }
            );

          });

        }

      } catch (e) {

        console.error(
          "Supabaseからテスト問題を取得できませんでした:",
          e
        );

      }

    }

    // ----------------------------------------------------------
    // question_idsの順番で問題を作成
    // ----------------------------------------------------------

    let questions =
      ids
        .map(
          id =>
            questionMap.get(
              String(id)
            )
        )
        .filter(Boolean);

    // ----------------------------------------------------------
    // 問題が見つからない場合
    // ----------------------------------------------------------

    if (!questions.length) {

      alert(
        "このテストに登録された問題が見つかりません。\n\n" +
        "管理者画面で問題が登録されているか、" +
        "問題が公開されているか確認してください。"
      );

      return;
    }

    // ----------------------------------------------------------
    // 問題順をランダム化
    // ----------------------------------------------------------

    questions =
      shuffle(questions);

    let currentIndex = 0;

    // q.id → 選択した選択肢番号
    const answers = {};

    const startedAt =
      Date.now();

    const timeLimit =
      Number(
        test.time_limit_seconds
      ) || 0;

    let timer = null;

    let finished = false;

    // ----------------------------------------------------------
    // テスト画面表示
    // ----------------------------------------------------------

    list.hidden = true;

    area.hidden = false;

    renderQuestion();

    // ----------------------------------------------------------
    // タイマー開始
    // ----------------------------------------------------------

    if (timeLimit > 0) {

      timer =
        setInterval(
          () => {

            if (finished) {
              return;
            }

            const elapsed =
              Math.floor(
                (
                  Date.now() -
                  startedAt
                ) / 1000
              );

            const remaining =
              Math.max(
                0,
                timeLimit -
                  elapsed
              );

            updateTimer(
              remaining
            );

            if (
              remaining <= 0
            ) {

              clearInterval(
                timer
              );

              finishTest(true);
            }

          },
          250
        );

    }

    // ----------------------------------------------------------
    // タイマー表示
    // ----------------------------------------------------------

    function updateTimer(
      remaining
    ) {

      const timerElement =
        document.getElementById(
          "test-timer"
        );

      if (!timerElement) {
        return;
      }

      if (!timeLimit) {

        timerElement.textContent =
          "制限時間：なし";

        return;
      }

      /*
       * 右上は常に
       *
       * 制限時間：10分
       *
       * のように表示。
       *
       * 残り時間表示に変えない。
       */

      timerElement.textContent =
        `制限時間：${formatTimeLimit(
          timeLimit
        )}`;

      timerElement.classList.remove(
        "warn"
      );
    }

    // ----------------------------------------------------------
    // 問題表示
    // ----------------------------------------------------------

    function renderQuestion() {

      if (finished) {
        return;
      }

      const q =
        questions[
          currentIndex
        ];

      if (!q) {

        finishTest(false);

        return;
      }

      const selected =
        answers[q.id];

      area.innerHTML = `
        <div class="test-card">

          <div
            style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              gap:12px;
            "
          >

            <span class="eyebrow">

              第${currentIndex + 1}問 /
              ${questions.length}

            </span>

            <span
              id="test-timer"
              class="timer"
            >

              ${
                timeLimit > 0
                  ? `制限時間：${formatTimeLimit(
                      timeLimit
                    )}`
                  : "制限時間：なし"
              }

            </span>

          </div>

          <div
            class="test-question"
            style="
              margin:16px 0;
            "
          >

            ${esc(q.question)}

          </div>

          <div class="options-grid">

            ${
              (q.options || [])
                .map(
                  (
                    option,
                    index
                  ) => `

                    <button
                      type="button"
                      class="option-btn ${
                        selected === index
                          ? "selected"
                          : ""
                      }"
                      data-opt="${index}"
                      ${
                        selected !==
                        undefined
                          ? "disabled"
                          : ""
                      }
                    >

                      <strong
                        style="
                          margin-right:8px;
                        "
                      >
                        ${index + 1}.
                      </strong>

                      ${esc(option)}

                    </button>

                  `
                )
                .join("")
            }

          </div>

          <div
            style="
              display:flex;
              justify-content:flex-end;
              align-items:center;
              gap:10px;
              margin-top:18px;
            "
          >

            <span
              style="
                font-size:0.85em;
                opacity:0.7;
              "
            >
              数字キー 1～4で回答 / Enterで次へ
            </span>

            <button
              type="button"
              id="test-next"
              class="btn btn-primary"
            >

              ${
                currentIndex ===
                questions.length - 1
                  ? "採点する"
                  : "次の問題"
              }

            </button>

          </div>

        </div>
      `;

      // --------------------------------------------------------
      // 選択肢クリック
      // --------------------------------------------------------

      document
        .querySelectorAll(
          "#test-area [data-opt]"
        )
        .forEach(button => {

          button.addEventListener(
            "click",
            () => {

              const index =
                Number(
                  button.dataset.opt
                );

              selectAnswer(
                index
              );

            }
          );

        });

      // --------------------------------------------------------
      // 次へボタン
      // --------------------------------------------------------

      const nextButton =
        document.getElementById(
          "test-next"
        );

      if (nextButton) {

        nextButton.addEventListener(
          "click",
          goToNextQuestion
        );

      }

      // --------------------------------------------------------
      // タイマーを現在値に更新
      // --------------------------------------------------------

      if (timeLimit) {

        const elapsed =
          Math.floor(
            (
              Date.now() -
              startedAt
            ) / 1000
          );

        updateTimer(
          Math.max(
            0,
            timeLimit -
              elapsed
          )
        );

      }

    }

    // ----------------------------------------------------------
    // 回答
    // ----------------------------------------------------------

    function selectAnswer(
      index
    ) {

      if (finished) {
        return;
      }

      const q =
        questions[
          currentIndex
        ];

      if (!q) {
        return;
      }

      // すでに回答済みなら変更不可
      if (
        answers[q.id] !==
        undefined
      ) {

        return;
      }

      // 選択肢の範囲チェック
      if (
        index < 0 ||
        index >=
          (
            q.options || []
          ).length
      ) {

        return;
      }

      answers[q.id] =
        index;

      renderQuestion();

      // 回答後は次へボタンへフォーカス
      const nextButton =
        document.getElementById(
          "test-next"
        );

      if (nextButton) {

        nextButton.focus();

      }

    }

    // ----------------------------------------------------------
    // 次の問題
    // ----------------------------------------------------------

    function goToNextQuestion() {

      if (finished) {
        return;
      }

      const q =
        questions[
          currentIndex
        ];

      if (!q) {
        return;
      }

      // 未回答なら進ませない
      if (
        answers[q.id] ===
        undefined
      ) {

        alert(
          "選択肢を1つ選んでください。"
        );

        return;
      }

      // 最後の問題
      if (
        currentIndex >=
        questions.length - 1
      ) {

        finishTest(false);

        return;
      }

      currentIndex++;

      renderQuestion();

    }

    // ----------------------------------------------------------
    // キーボード操作
    // ----------------------------------------------------------

    function handleKeydown(
      event
    ) {

      if (finished) {
        return;
      }

      /*
       * 入力欄ではショートカットを発動させない
       */

      const target =
        event.target;

      if (
        target &&
        (
          target.tagName ===
            "INPUT" ||
          target.tagName ===
            "TEXTAREA" ||
          target.tagName ===
            "SELECT"
        )
      ) {

        return;
      }

      const q =
        questions[
          currentIndex
        ];

      if (!q) {
        return;
      }

      // --------------------------------------------------------
      // 数字キー1～4
      // --------------------------------------------------------

      const keyMap = {

        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,

        "Digit1": 0,
        "Digit2": 1,
        "Digit3": 2,
        "Digit4": 3,

        "Numpad1": 0,
        "Numpad2": 1,
        "Numpad3": 2,
        "Numpad4": 3

      };

      const answerIndex =
        keyMap[event.key] ??
        keyMap[event.code];

      if (
        answerIndex !==
        undefined
      ) {

        /*
         * すでに回答済みなら
         * 再回答しない
         */

        if (
          answers[q.id] !==
          undefined
        ) {

          return;
        }

        const optionButtons =
          document.querySelectorAll(
            "#test-area [data-opt]"
          );

        const button =
          optionButtons[
            answerIndex
          ];

        if (
          !button ||
          button.disabled
        ) {

          return;
        }

        event.preventDefault();

        event.stopPropagation();

        /*
         * 実際のボタンをクリック。
         * マウス操作と同じ処理を通す。
         */

        button.click();

        return;
      }

      // --------------------------------------------------------
      // Enter
      // --------------------------------------------------------

      if (
        event.key ===
          "Enter" ||
        event.code ===
          "Enter" ||
        event.code ===
          "NumpadEnter"
      ) {

        /*
         * 未回答なら進まない
         */

        if (
          answers[q.id] ===
          undefined
        ) {

          return;
        }

        event.preventDefault();

        event.stopPropagation();

        goToNextQuestion();

      }

    }

    /*
     * window + capture=true
     *
     * Chromebookなどでキー入力が
     * 他の処理に奪われにくくする。
     */

    window.addEventListener(
      "keydown",
      handleKeydown,
      true
    );

    // ----------------------------------------------------------
    // テスト終了
    // ----------------------------------------------------------

    async function finishTest(
      timeout
    ) {

      if (finished) {
        return;
      }

      finished = true;

      if (timer) {

        clearInterval(
          timer
        );

        timer = null;
      }

      // windowに登録したものをwindowから削除
      window.removeEventListener(
        "keydown",
        handleKeydown,
        true
      );

      const elapsed =
        Math.round(
          (
            Date.now() -
            startedAt
          ) / 1000
        );

      // --------------------------------------------------------
      // 採点
      // --------------------------------------------------------

      let score = 0;

      questions.forEach(
        q => {

          if (
            answers[q.id] ===
            q.answerIndex
          ) {

            score++;

          }

        }
      );

      // --------------------------------------------------------
      // ログインユーザー取得
      // --------------------------------------------------------

      let userId =
        null;

      try {

        const sessionResult =
          await c.auth.getSession();

        userId =
          sessionResult
            ?.data
            ?.session
            ?.user
            ?.id ||
          null;

      } catch (e) {

        console.warn(
          "ログインユーザー取得に失敗:",
          e
        );

      }

      // --------------------------------------------------------
      // テスト結果保存
      // --------------------------------------------------------

      if (userId) {

        const {
          error: saveError
        } =
          await c
            .from(
              "test_results"
            )
            .insert({

              test_id:
                test.id,

              user_id:
                userId,

              score:
                score,

              total:
                questions.length,

              time_seconds:
                elapsed,

              answers:
                answers

            });

        if (saveError) {

          console.warn(
            "テスト結果の保存に失敗:",
            saveError.message
          );

        }

      }

      // --------------------------------------------------------
      // 正答率
      // --------------------------------------------------------

      const percentage =
        questions.length > 0
          ? Math.round(
              (
                score /
                questions.length
              ) * 100
            )
          : 0;

      // --------------------------------------------------------
      // 結果画面
      // --------------------------------------------------------

      area.innerHTML = `

        <div class="test-card">

          <div class="eyebrow">

            ${
              timeout
                ? "時間終了"
                : "テスト完了"
            }

          </div>

          <h2
            style="
              text-align:center;
            "
          >

            ${esc(test.title)}

          </h2>

          <div class="result-score">

            ${score} /
            ${questions.length} 点

          </div>

          <p
            style="
              text-align:center;
            "
          >

            正答率
            ${percentage}%

            ・

            所要
            ${Math.floor(
              elapsed / 60
            )}分${elapsed % 60}秒

          </p>

          <div class="answer-review">

            ${
              questions
                .map(
                  (
                    q,
                    index
                  ) => {

                    const isCorrect =
                      answers[q.id] ===
                      q.answerIndex;

                    const userAnswer =
                      answers[q.id];

                    return `

                      <div
                        style="
                          margin-bottom:16px;
                          padding:12px;
                          border-radius:8px;
                          background:
                            var(
                              --surface-2,
                              rgba(
                                0,
                                0,
                                0,
                                0.03
                              )
                            );
                        "
                      >

                        <strong>

                          第${index + 1}問

                          ${
                            isCorrect
                              ? "⭕ 正解"
                              : "❌ 不正解"
                          }

                        </strong>

                        <div
                          style="
                            margin-top:6px;
                          "
                        >

                          ${
                            userAnswer ===
                            undefined
                              ? "未回答"
                              : `あなたの回答：
                                 ${userAnswer + 1}番`
                          }

                        </div>

                        <div
                          style="
                            margin-top:6px;
                          "
                        >

                          正解：

                          ${
                            Number(
                              q.answerIndex
                            ) + 1
                          }番

                        </div>

                        <div
                          style="
                            margin-top:8px;
                            opacity:0.9;
                          "
                        >

                          ${esc(
                            q.explanation ||
                            "解説なし"
                          )}

                        </div>

                      </div>

                    `;

                  }
                )
                .join("")
            }

          </div>

          <div
            style="
              text-align:center;
              margin-top:18px;
            "
          >

            <button
              type="button"
              class="btn btn-outline"
              id="back-tests"
            >
              テスト一覧へ
            </button>

          </div>

        </div>

      `;

      // --------------------------------------------------------
      // テスト一覧へ戻る
      // --------------------------------------------------------

      const backButton =
        document.getElementById(
          "back-tests"
        );

      if (backButton) {

        backButton.addEventListener(
          "click",
          () => {

            location.reload();

          }
        );

      }

    }

  }

});
