/* テストページ: テスト専用問題方式 */
document.addEventListener("DOMContentLoaded", async () => {
  if (window.KagakuCloud?.authReady) await window.KagakuCloud.authReady;

  const list = document.getElementById("test-list");
  const area = document.getElementById("test-area");
  const c = window.KagakuCloud?.getClient?.();

  if (!list || !area) {
    console.warn("test-list または test-area が見つかりません。");
    return;
  }
  if (!c) {
    list.innerHTML = `<div class="test-card">Supabase接続が設定されていません。</div>`;
    return;
  }

  const esc = value => String(value ?? "").replace(/[&<>'"]/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;"
  }[char]));

  const shuffle = list => {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const { data: tests, error } = await c
    .from("tests")
    .select("id,title,description,time_limit_seconds,is_published,created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("公開テスト取得エラー:", error);
    list.innerHTML = `<div class="test-card"><p>テストを取得できませんでした。</p><p class="muted">${esc(error.message)}</p></div>`;
    return;
  }

  if (!tests?.length) {
    list.innerHTML = `<div class="test-card">現在公開されているテストはありません。</div>`;
    return;
  }

  const testIds = tests.map(t => t.id);
  const { data: counts, error: countError } = await c
    .from("test_questions")
    .select("test_id")
    .in("test_id", testIds);

  if (countError) {
    console.error("テスト問題数取得エラー:", countError);
    list.innerHTML = `<div class="test-card"><p>テスト問題の設定がまだ完了していません。</p><p class="muted">${esc(countError.message)}</p></div>`;
    return;
  }

  const countMap = new Map();
  (counts || []).forEach(row => countMap.set(row.test_id, (countMap.get(row.test_id) || 0) + 1));

  list.innerHTML = tests.map(test => `
    <article class="test-item">
      <div>
        <h2>${esc(test.title)}</h2>
        <p>${esc(test.description || "")}</p>
        <div class="test-meta">${countMap.get(test.id) || 0}問</div>
      </div>
      <button class="btn btn-primary" type="button" data-test-id="${esc(test.id)}">挑戦する</button>
    </article>
  `).join("");

  document.querySelectorAll("[data-test-id]").forEach(button => {
    button.addEventListener("click", () => startTest(tests.find(t => String(t.id) === String(button.dataset.testId))));
  });

  async function startTest(test) {
    if (!test) return;

    const { data: rows, error: questionError } = await c
      .from("test_questions")
      .select("id,question,options,answer_index,explanation,sort_order")
      .eq("test_id", test.id)
      .order("sort_order", { ascending: true });

    if (questionError) {
      alert("テスト問題を取得できませんでした。\n" + questionError.message);
      return;
    }

    let questions = (rows || []).map(q => ({
      id: q.id,
      question: q.question || "",
      options: Array.isArray(q.options) ? q.options : [],
      answerIndex: Number(q.answer_index) || 0,
      explanation: q.explanation || ""
    }));

    if (!questions.length) {
      alert("このテストには問題が登録されていません。");
      return;
    }

    questions = shuffle(questions);
    let currentIndex = 0;
    const answers = {};
    let finished = false;
    let timer = null;
    const startedAt = Date.now();
    const timeLimit = Math.max(0, Number(test.time_limit_seconds) || 0);

    list.hidden = true;
    area.hidden = false;

    function cleanupKeyboard() {
      document.removeEventListener("keydown", handleKeydown, true);
    }

    function renderQuestion() {
      if (finished) return;
      const q = questions[currentIndex];
      if (!q) return finishTest(false);
      const selected = answers[q.id];

      area.innerHTML = `
        <div class="test-card">
          <div class="eyebrow">第${currentIndex + 1}問 / ${questions.length}</div>
          <div class="test-question" style="margin:16px 0;">${esc(q.question)}</div>
          <div class="options-grid">
            ${(q.options || []).map((option, index) => `
              <button type="button" class="option-btn ${selected === index ? "selected" : ""}" data-opt="${index}" ${selected !== undefined ? "disabled" : ""}>
                <strong style="margin-right:8px;">${index + 1}.</strong>${esc(option)}
              </button>
            `).join("")}
          </div>
          <div style="display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:18px;">
            <span style="font-size:.85em;opacity:.7;">数字キー 1～4で回答 / Enterで次へ</span>
            <button type="button" id="test-next" class="btn btn-primary">${currentIndex === questions.length - 1 ? "採点する" : "次の問題"}</button>
          </div>
        </div>
      `;

      document.querySelectorAll("#test-area [data-opt]").forEach(button => {
        button.addEventListener("click", () => selectAnswer(Number(button.dataset.opt)));
      });
      document.getElementById("test-next")?.addEventListener("click", goToNextQuestion);
    }

    function selectAnswer(index) {
      if (finished) return;
      const q = questions[currentIndex];
      if (!q || answers[q.id] !== undefined) return;
      if (index < 0 || index >= q.options.length) return;
      answers[q.id] = index;
      renderQuestion();
      document.getElementById("test-next")?.focus();
    }

    function goToNextQuestion() {
      if (finished) return;
      const q = questions[currentIndex];
      if (!q) return;
      if (answers[q.id] === undefined) {
        alert("選択肢を1つ選んでください。");
        return;
      }
      if (currentIndex >= questions.length - 1) {
        finishTest(false);
        return;
      }
      currentIndex++;
      renderQuestion();
    }

    function handleKeydown(event) {
      if (finished) return;
      const target = event.target;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (["1", "2", "3", "4"].includes(event.key)) {
        const q = questions[currentIndex];
        if (!q || answers[q.id] !== undefined) return;
        event.preventDefault();
        selectAnswer(Number(event.key) - 1);
        return;
      }

      if (event.key === "Enter") {
        const nextButton = document.getElementById("test-next");
        if (!nextButton) return;
        event.preventDefault();
        event.stopPropagation();
        goToNextQuestion();
      }
    }

    document.addEventListener("keydown", handleKeydown, true);
    renderQuestion();

    if (timeLimit > 0) {
      timer = setTimeout(() => finishTest(true), timeLimit * 1000);
    }

    async function finishTest(timeout) {
      if (finished) return;
      finished = true;
      if (timer) clearTimeout(timer);
      cleanupKeyboard();

      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      const score = questions.reduce((total, q) => total + (answers[q.id] === q.answerIndex ? 1 : 0), 0);

      try {
        const { data: sessionData } = await c.auth.getSession();
        const userId = sessionData?.session?.user?.id || null;
        if (userId) {
          const { error: saveError } = await c.from("test_results").insert({
            test_id: test.id,
            user_id: userId,
            score,
            total: questions.length,
            time_seconds: elapsed,
            answers
          });
          if (saveError) console.warn("テスト結果の保存に失敗:", saveError.message);
        }
      } catch (e) {
        console.warn("テスト結果保存中にエラー:", e);
      }

      const percentage = questions.length ? Math.round(score / questions.length * 100) : 0;
      area.innerHTML = `
        <div class="test-card">
          <div class="eyebrow">${timeout ? "時間終了" : "テスト完了"}</div>
          <h2 style="text-align:center;">${esc(test.title)}</h2>
          <div class="result-score">${score} / ${questions.length} 点</div>
          <p style="text-align:center;">正答率 ${percentage}%</p>
          <div class="answer-review">
            ${questions.map((q, index) => {
              const userAnswer = answers[q.id];
              const correct = userAnswer === q.answerIndex;
              return `<div style="margin-bottom:16px;padding:12px;border-radius:8px;background:var(--surface-2,rgba(0,0,0,.03));">
                <strong>第${index + 1}問 ${correct ? "⭕ 正解" : "❌ 不正解"}</strong>
                <div style="margin-top:6px;">あなたの回答：${userAnswer === undefined ? "未回答" : `${userAnswer + 1}番`}</div>
                <div style="margin-top:6px;">正解：${q.answerIndex + 1}番</div>
                <div style="margin-top:8px;opacity:.9;">${esc(q.explanation || "解説なし")}</div>
              </div>`;
            }).join("")}
          </div>
          <div style="text-align:center;margin-top:18px;"><button type="button" class="btn btn-outline" id="back-tests">テスト一覧へ</button></div>
        </div>
      `;
      document.getElementById("back-tests")?.addEventListener("click", () => location.reload());
    }
  }
});
