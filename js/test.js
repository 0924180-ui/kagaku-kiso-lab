document.addEventListener("DOMContentLoaded", async () => {
  if (window.KagakuCloud?.authReady) {
    await window.KagakuCloud.authReady;
  }

  const list = document.getElementById("test-list");
  const area = document.getElementById("test-area");
  const c = window.KagakuCloud?.getClient?.();

  if (!list || !area) return;

  if (!c) {
    list.innerHTML = `
      <div class="test-card">
        Supabase接続が設定されていません。
      </div>
    `;
    return;
  }

  function esc(value) {
    return String(value ?? "").replace(
      /[&<>'"]/g,
      char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      }[char])
    );
  }

  function shuffle(list) {
    const arr = [...list];

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
  }

  /*
   * ------------------------------------------------------------
   * 公開テスト取得
   * ------------------------------------------------------------
   */

  const {
    data: tests,
    error: testsError
  } = await c
    .from("tests")
    .select("*")
    .eq("is_published", true)
    .order("created_at", {
      ascending: false
    });

  if (testsError) {
    console.error("テスト取得エラー:", testsError);

    list.innerHTML = `
      <div class="test-card">
        <p>テストを読み込めませんでした。</p>
        <p style="font-size:.9em;opacity:.7;">
          ${esc(testsError.message)}
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

  /*
   * ------------------------------------------------------------
   * テスト一覧
   * ------------------------------------------------------------
   */

  list.innerHTML = tests.map(test => `
    <article class="test-item">
      <div>
        <h2>${esc(test.title)}</h2>

        <p>
          ${esc(test.description || "")}
        </p>
      </div>

      <button
        type="button"
        class="btn btn-primary"
        data-test-id="${esc(test.id)}"
      >
        挑戦する
      </button>
    </article>
  `).join("");

  document
    .querySelectorAll("[data-test-id]")
    .forEach(button => {

      button.addEventListener("click", async () => {

        const testId = button.dataset.testId;

        const test = tests.find(
          t => String(t.id) === String(testId)
        );

        if (test) {
          await startTest(test);
        }
      });

    });

  /*
   * ------------------------------------------------------------
   * テスト開始
   * ------------------------------------------------------------
   */

  async function startTest(test) {

    /*
     * ここが今回の重要部分。
     *
     * 以前:
     *
     * tests.question_ids
     * ↓
     * KagakuData.questions
     *
     * だったため、テスト専用問題を取得できなかった。
     *
     * 今回:
     *
     * test_questions
     * ↓
     * テスト専用問題を直接取得
     */

    const {
      data: testQuestions,
      error: questionError
    } = await c
      .from("test_questions")
      .select("*")
      .eq("test_id", test.id)
      .order("question_order", {
        ascending: true
      });

    if (questionError) {

      console.error(
        "テスト問題取得エラー:",
        questionError
      );

      alert(
        "テストの問題を読み込めませんでした。\n\n" +
        questionError.message
      );

      return;
    }

    if (!testQuestions?.length) {

      alert(
        "このテストには問題が保存されていません。"
      );

      return;
    }

    /*
     * Supabase → テスト問題形式へ変換
     */

    let questions = testQuestions.map(row => ({
      id: row.id,

      question:
        row.question ??
        "",

      options:
        Array.isArray(row.options)
          ? row.options
          : [],

      answerIndex:
        Number(
          row.answer_index ??
          0
        ),

      explanation:
        row.explanation ??
        ""
    }));

    /*
     * 問題順をランダム化
     */

    questions = shuffle(questions);

    let currentIndex = 0;

    const answers = {};

    let finished = false;

    /*
     * テスト画面
     */

    list.hidden = true;
    area.hidden = false;

    renderQuestion();

    /*
     * ----------------------------------------------------------
     * 問題表示
     * ----------------------------------------------------------
     */

    function renderQuestion() {

      if (finished) return;

      const q =
        questions[currentIndex];

      if (!q) {
        finishTest();
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

          </div>

          <div
            class="test-question"
            style="margin:16px 0;"
          >
            ${esc(q.question)}
          </div>

          <div class="options-grid">

            ${
              q.options.map(
                (option, index) => `

                  <button
                    type="button"
                    class="option-btn ${
                      selected === index
                        ? "selected"
                        : ""
                    }"
                    data-opt="${index}"
                    ${
                      selected !== undefined
                        ? "disabled"
                        : ""
                    }
                  >

                    <strong
                      style="margin-right:8px;"
                    >
                      ${index + 1}.
                    </strong>

                    ${esc(option)}

                  </button>

                `
              ).join("")
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
                font-size:.85em;
                opacity:.7;
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

      /*
       * 選択肢クリック
       */

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

              selectAnswer(index);
            }
          );

        });

      /*
       * 次へ
       */

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
    }

    /*
     * ----------------------------------------------------------
     * 回答
     * ----------------------------------------------------------
     */

    function selectAnswer(index) {

      if (finished) return;

      const q =
        questions[currentIndex];

      if (!q) return;

      /*
       * すでに回答済みなら変更不可
       */

      if (
        answers[q.id] !== undefined
      ) {
        return;
      }

      answers[q.id] = index;

      /*
       * 再描画することで、
       * 選択したボタンに selected クラスを付ける
       */

      renderQuestion();

      const nextButton =
        document.getElementById(
          "test-next"
        );

      if (nextButton) {
        nextButton.focus();
      }
    }

    /*
     * ----------------------------------------------------------
     * 次の問題
     * ----------------------------------------------------------
     */

    function goToNextQuestion() {

      if (finished) return;

      const q =
        questions[currentIndex];

      if (!q) return;

      /*
       * 未回答なら進ませない
       */

      if (
        answers[q.id] === undefined
      ) {

        alert(
          "選択肢を1つ選んでください。"
        );

        return;
      }

      /*
       * 最後の問題
       */

      if (
        currentIndex >=
        questions.length - 1
      ) {

        finishTest();

        return;
      }

      currentIndex++;

      renderQuestion();
    }

    /*
     * ----------------------------------------------------------
     * キーボード
     * ----------------------------------------------------------
     */

    function handleKeydown(event) {

      if (finished) return;

      /*
       * 1～4
       */

      if (
        ["1", "2", "3", "4"]
          .includes(event.key)
      ) {

        const index =
          Number(event.key) - 1;

        const q =
          questions[currentIndex];

        if (!q) return;

        /*
         * 回答済みなら再回答しない
         */

        if (
          answers[q.id] !== undefined
        ) {
          return;
        }

        if (
          index >=
          q.options.length
        ) {
          return;
        }

        event.preventDefault();

        selectAnswer(index);

        return;
      }

      /*
       * Enter
       */

      if (event.key === "Enter") {

        event.preventDefault();

        goToNextQuestion();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeydown,
      true
    );

    /*
     * ----------------------------------------------------------
     * テスト終了
     * ----------------------------------------------------------
     */

    async function finishTest() {

      if (finished) return;

      finished = true;

      document.removeEventListener(
        "keydown",
        handleKeydown,
        true
      );

      let score = 0;

      questions.forEach(q => {

        if (
          answers[q.id] ===
          q.answerIndex
        ) {
          score++;
        }

      });

      /*
       * ログインユーザー
       */

      let userId = null;

      try {

        const {
          data
        } = await c.auth.getSession();

        userId =
          data?.session?.user?.id ||
          null;

      } catch (e) {

        console.warn(
          "ユーザー取得失敗:",
          e
        );
      }

      /*
       * 結果保存
       */

      if (userId) {

        const {
          error: saveError
        } = await c
          .from("test_results")
          .insert({

            test_id:
              test.id,

            user_id:
              userId,

            score,

            total:
              questions.length,

            answers

          });

        if (saveError) {

          console.warn(
            "テスト結果保存失敗:",
            saveError.message
          );
        }
      }

      /*
       * 結果表示
       */

      const percentage =
        questions.length
          ? Math.round(
              score /
              questions.length *
              100
            )
          : 0;

      area.innerHTML = `
        <div class="test-card">

          <div class="eyebrow">
            テスト完了
          </div>

          <h2 style="text-align:center;">
            ${esc(test.title)}
          </h2>

          <div class="result-score">
            ${score} / ${questions.length} 点
          </div>

          <p style="text-align:center;">
            正答率 ${percentage}%
          </p>

          <div class="answer-review">

            ${
              questions.map(
                (q, index) => {

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
                          var(--surface-2,
                          rgba(0,0,0,.03));
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
                        style="margin-top:6px;"
                      >
                        ${
                          userAnswer === undefined
                            ? "未回答"
                            : `あなたの回答：
                               ${userAnswer + 1}番`
                        }
                      </div>

                      <div
                        style="margin-top:6px;"
                      >
                        正解：
                        ${Number(
                          q.answerIndex
                        ) + 1}番
                      </div>

                      <div
                        style="
                          margin-top:8px;
                          opacity:.9;
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
              ).join("")
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

      document
        .getElementById("back-tests")
        ?.addEventListener(
          "click",
          () => location.reload()
        );
    }
  }
});
