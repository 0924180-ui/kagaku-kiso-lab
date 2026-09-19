document.addEventListener("DOMContentLoaded", async () => {
  // 問題取得だけでなく、Supabaseのログイン状態と進捗復元も完了してから演習を開始します。
  if (window.KagakuCloud?.authReady) await window.KagakuCloud.authReady;
  if (window.KagakuCloud?.questionsReady) await window.KagakuCloud.questionsReady;

  if (!window.Recommendations) console.warn("Recommendations not loaded");
  const unitSelect = document.getElementById("filter-unit");
  const countSelect = document.getElementById("filter-count");
  const diffSelect = document.getElementById("filter-difficulty");
  const startBtn = document.getElementById("start-session-btn");
  const sessionArea = document.getElementById("session-area");

  // 単元ドロップダウン生成
  KagakuData.units.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.id;
    opt.textContent = u.title;
    unitSelect.appendChild(opt);
  });

  // URLパラメータの反映
  const params = new URLSearchParams(location.search);
  if (params.get("unit")) unitSelect.value = params.get("unit");
  if (params.get("diff")) diffSelect.value = params.get("diff");

  let currentQuestions = [];
  let currentIndex = 0;

  startBtn.addEventListener("click", startSession);

  function startSession() {
    const uVal = unitSelect.value;
    const dVal = diffSelect.value;
    const cVal = countSelect.value;

    let filtered = KagakuData.questions.filter(q => {
      if (uVal !== "all" && q.unitId !== uVal) return false;
      if (dVal !== "all" && q.difficulty !== dVal) return false;
      return true;
    });

    if (filtered.length === 0) {
      sessionArea.innerHTML = `<div class="panel">該当する問題がありません。条件を変更してください。</div>`;
      return;
    }

    if (params.get("recommended") === "1" && window.Recommendations) {
      const attempts = Storage.getUserData().attempts || {};
      filtered = Recommendations.getRecommended(filtered, attempts, 5);
    } else if (cVal !== "all") {
      filtered = filtered.slice(0, parseInt(cVal));
    }

    currentQuestions = filtered;
    currentIndex = 0;
    renderQuestion();
  }

  function renderQuestion() {
    if (currentIndex >= currentQuestions.length) {
      sessionArea.innerHTML = `
        <div class="panel" style="text-align:center;">
          <h2>🎉 お疲れ様でした！</h2>
          <p style="margin: 12px 0;">選択した演習セッションが完了しました。</p>
          <button class="btn btn-primary" onclick="location.reload()">もう一度解く</button>
        </div>
      `;
      return;
    }

    const q = currentQuestions[currentIndex];
    const userData = Storage.getUserData();
    const isSaved = userData.attempts[q.id] ? userData.attempts[q.id].saved : false;

    sessionArea.innerHTML = `
      <div class="question-box">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span class="eyebrow">問題 ${currentIndex + 1} / ${currentQuestions.length} (${q.difficulty})</span>
          <button class="btn btn-outline btn-sm" id="save-q-btn">${isSaved ? "⭐ 復習リストから外す" : "☆ 復習リストに保存"}</button>
        </div>
        <div class="q-title">${q.question}</div>
        <div class="options-grid">
          ${q.options.map((opt, idx) => `
            <button class="option-btn" data-index="${idx}">
              <strong style="margin-right:8px;">${idx + 1}.</strong> ${opt}
            </button>
          `).join("")}
        </div>
        <div id="q-feedback"></div>
      </div>
    `;

    document.getElementById("save-q-btn").addEventListener("click", () => {
      const nowSaved = Storage.toggleSaveQuestion(q.id);
      document.getElementById("save-q-btn").textContent = nowSaved ? "⭐ 復習リストから外す" : "☆ 復習リストに保存";
    });

    document.querySelectorAll(".option-btn").forEach(btn => {
      btn.addEventListener("click", (e) => handleAnswer(parseInt(e.currentTarget.dataset.index), q));
    });
  }

  function handleAnswer(selectedIndex, q) {
    const isCorrect = selectedIndex === q.answerIndex;
    Storage.recordQuestionAttempt(q.id, isCorrect);

    const buttons = document.querySelectorAll(".option-btn");
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.answerIndex) btn.classList.add("selected-correct");
      else if (idx === selectedIndex && !isCorrect) btn.classList.add("selected-wrong");
    });

    const feedback = document.getElementById("q-feedback");
    feedback.innerHTML = `
      <div class="explanation-box">
        <h4 style="color:${isCorrect ? "var(--accent)" : "var(--danger)"}; margin-bottom:6px;">
          ${isCorrect ? "⭕ 正解！" : "❌ 不正解…"}
        </h4>
        <p>${q.explanation}</p>
        <button class="btn btn-primary" id="next-q-btn" style="margin-top:12px;">次へ進む [Enter]</button>
      </div>
    `;

    document.getElementById("next-q-btn").addEventListener("click", goToNextQuestion);
    // 次へボタンを表示したらキーボード操作にすぐ移れるようにする
    document.getElementById("next-q-btn").focus();
  }

  function goToNextQuestion() {
    currentIndex++;
    renderQuestion();
  }

  // キーボードショートカット (1~4で選択, Enterで次へ)
  // capture=true にして、ブラウザやフォーカス中の要素に処理を奪われにくくする。
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const nextBtn = document.getElementById("next-q-btn");
      if (nextBtn && !nextBtn.disabled) {
        e.preventDefault();
        e.stopPropagation();
        goToNextQuestion();
      }
      return;
    }

    if (["1", "2", "3", "4"].includes(e.key)) {
      const idx = Number(e.key) - 1;
      const optionBtns = document.querySelectorAll(".option-btn");
      if (optionBtns[idx] && !optionBtns[idx].disabled) {
        e.preventDefault();
        optionBtns[idx].click();
      }
    }
  }, true);
});
