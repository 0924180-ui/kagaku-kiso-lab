document.addEventListener("DOMContentLoaded", async () => {
  if (window.KagakuCloud?.questionsReady) await window.KagakuCloud.questionsReady;
  const params = new URLSearchParams(location.search);
  const unitId = params.get("id") || "u1";
  const unit = KagakuData.units.find(u => u.id === unitId) || KagakuData.units[0];

  document.getElementById("page-title").textContent = `${unit.title} | 化学基礎ラボ`;
  document.getElementById("unit-title").textContent = unit.title;
  document.getElementById("unit-summary").textContent = unit.summary;
  const breadcrumb = document.getElementById("breadcrumb-current");
  if (breadcrumb) breadcrumb.textContent = unit.title;
  const railWarning = document.getElementById("rail-warning-text");
  const railPoints = document.getElementById("rail-points");
  const pointNames = [...unit.explanation.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)]
    .map(m => m[1].replace(/<[^>]+>/g, "").replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").trim())
    .slice(0, 6);
  if (railPoints) {
    railPoints.innerHTML = pointNames.length ? pointNames.map((name, i) => `<li data-index="${i}">${name}</li>`).join("") : `<li>重要ポイントを確認</li>`;
  }
  if (railWarning) {
    const warningMap = {
      u1: "状態変化の名称と向きを混同しない。凝華は気体→固体。",
      u2: "原子番号・質量数・電子数を混同しない。イオンでは電子数が変わる。",
      u3: "分子結晶では、分子内の共有結合と分子間力を区別する。",
      u4: "g・mol・Lなどの単位を途中で確認し、式の向きを間違えない。",
      u5: "濃度と物質量を混同しない。中和では反応式の係数比を見る。",
      u6: "pHは水素イオン濃度との関係で考え、対数の向きに注意する。",
      u7: "酸化数の特殊パターンでは、まず全体の酸化数の和を使う。"
    };
    railWarning.textContent = warningMap[unit.id] || "定義・例外・単位を確認してから問題を解きましょう。";
  }

  // タブ処理
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => {
        t.setAttribute("aria-selected", "false");
        t.classList.remove("is-active");
      });
      panels.forEach(p => p.hidden = true);

      tab.setAttribute("aria-selected", "true");
      tab.classList.add("is-active");
      const targetPanel = document.getElementById(`panel-${tab.dataset.tab}`);
      if (targetPanel) targetPanel.hidden = false;
    });
  });

  // コンテンツ設定
  const explanationContent = document.getElementById("explanation-content");
  explanationContent.innerHTML = unit.explanation;

  // 解説を「読む順番」が分かる学習ナビに変換
  const explanationSections = [...explanationContent.querySelectorAll(".explain-card h3")];
  const explanationNav = document.createElement("div");
  explanationNav.className = "explanation-nav";
  explanationNav.innerHTML = `
    <div class="explanation-nav-head">
      <div>
        <span class="explanation-nav-kicker">LEARNING MAP</span>
        <strong>この単元で押さえるポイント</strong>
      </div>
      <span class="explanation-read-state" id="explanation-read-state">未読</span>
    </div>
    <div class="explanation-nav-list" id="explanation-nav-list"></div>
  `;
  explanationContent.prepend(explanationNav);

  const navList = explanationNav.querySelector("#explanation-nav-list");
  const railPointItems = document.querySelectorAll("#rail-points li");
  railPointItems.forEach((item, index) => item.addEventListener("click", () => {
    const target = explanationSections[index]?.closest(".explain-card");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
  explanationSections.forEach((heading, index) => {
    const card = heading.closest(".explain-card");
    const id = `explain-section-${unit.id}-${index + 1}`;
    card.id = id;
    heading.classList.add("explain-heading");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "explanation-nav-item";
    button.innerHTML = `<span class="explanation-nav-number">${index + 1}</span><span>${heading.textContent.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").trim()}</span>`;
    button.addEventListener("click", () => {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    navList.appendChild(button);
  });

  // 最初に「何を覚えるか」を提示
  const focusBox = document.createElement("section");
  focusBox.className = "explanation-focus";
  focusBox.innerHTML = `
    <div class="focus-icon">✓</div>
    <div>
      <span class="focus-kicker">FIRST STEP</span>
      <h2>まずここだけ覚える</h2>
      <p>${unit.summary}</p>
    </div>
  `;
  explanationNav.after(focusBox);

  // 解説全体の読了率を表示
  const progressWrap = document.createElement("div");
  progressWrap.className = "explanation-reading-progress";
  progressWrap.innerHTML = `<span id="explanation-progress-fill"></span>`;
  explanationContent.prepend(progressWrap);

  const explanationUserData = Storage.getUserData();
  const read = !!(explanationUserData.unitProgress?.[unit.id]?.readExplanation);
  const readState = explanationContent.querySelector("#explanation-read-state");

  const completeButton = document.createElement("button");
  completeButton.type = "button";
  completeButton.className = "btn btn-primary explanation-complete-btn";
  completeButton.textContent = read ? "✓ 解説を学習済みにしました" : "この解説を学習済みにする";
  completeButton.addEventListener("click", () => {
    Storage.setUnitExplanationRead(unit.id, true);
    completeButton.textContent = "✓ 解説を学習済みにしました";
    readState.textContent = "学習済み";
    readState.classList.add("is-read");
  });
  explanationContent.appendChild(completeButton);
  if (read) {
    readState.textContent = "学習済み";
    readState.classList.add("is-read");
  }

  const railCompleteBtn = document.getElementById("rail-complete-btn");
  if (railCompleteBtn) {
    railCompleteBtn.textContent = read ? "✓ この単元は学習済み" : "✓ この単元を学習済みにする";
    railCompleteBtn.addEventListener("click", () => {
      Storage.setUnitExplanationRead(unit.id, true);
      railCompleteBtn.textContent = "✓ この単元は学習済み";
      completeButton.textContent = "✓ 解説を学習済みにしました";
      readState.textContent = "学習済み";
      readState.classList.add("is-read");
      updateProgressRail();
    });
  }

  const bookmark = document.getElementById("rail-bookmark");
  if (bookmark) {
    const saved = Storage.isUnitSaved(unit.id);
    bookmark.textContent = saved ? "★ 復習候補に追加済み" : "☆ 復習候補にする";
    bookmark.addEventListener("click", () => {
      const next = Storage.toggleSaveUnit(unit.id);
      bookmark.textContent = next ? "★ 復習候補に追加済み" : "☆ 復習候補にする";
    });
  }

  function updateProgressRail() {
    const progressData = Storage.getUserData().unitProgress?.[unit.id] || {};
    const uQuestions = KagakuData.questions.filter(q => q.unitId === unit.id);
    let attempts = 0;
    uQuestions.forEach(q => { attempts += Storage.getUserData().attempts[q.id]?.count || 0; });
    const done = (progressData.readExplanation ? 1 : 0) + (progressData.readExample ? 1 : 0) + (uQuestions.length ? Math.min(1, attempts / uQuestions.length) : 1);
    const pct = Math.round(done / 3 * 100);
    const fill = document.getElementById("rail-progress-fill");
    const value = document.getElementById("rail-progress-value");
    if (fill) fill.style.width = `${pct}%`;
    if (value) value.textContent = `${pct}%`;
  }
  updateProgressRail();

  function updateReadingProgress() {
    const rect = explanationContent.getBoundingClientRect();
    const total = Math.max(1, rect.height - Math.min(window.innerHeight * 0.55, 420));
    const passed = Math.max(0, Math.min(total, -rect.top + window.innerHeight * 0.28));
    const pct = Math.round((passed / total) * 100);
    const fill = document.getElementById("explanation-progress-fill");
    if (fill) fill.style.width = `${pct}%`;
  }
  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  updateReadingProgress();

  // 現在読んでいるポイントをナビに反映
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const idx = explanationSections.indexOf(entry.target.querySelector("h3"));
        const navItems = navList.querySelectorAll(".explanation-nav-item");
        if (idx >= 0 && entry.isIntersecting) {
          navItems.forEach(item => item.classList.remove("is-current"));
          navItems[idx]?.classList.add("is-current");
        }
      });
    }, { rootMargin: "-25% 0px -60% 0px" });
    explanationSections.forEach(h => observer.observe(h.closest(".explain-card")));
  }

  // 例題
  document.getElementById("example-question").innerHTML = unit.example.question;

  const revealBtn = document.getElementById("reveal-solution-btn");
  const solBox = document.getElementById("example-solution");
  revealBtn.addEventListener("click", () => {
    solBox.style.display = "block";
    solBox.innerHTML = unit.example.solution;
    Storage.setUnitExampleRead(unit.id, true);
    revealBtn.textContent = "✓ 解答・解説を表示済み";
  });

  // 練習問題ボタン生成
  const btnGroup = document.getElementById("practice-difficulty-buttons");
  btnGroup.innerHTML = `
    <a href="practice.html?unit=${unit.id}&diff=all" class="btn btn-primary">すべての問題を解く</a>
    <a href="practice.html?unit=${unit.id}&diff=basic" class="btn btn-outline">基礎</a>
    <a href="practice.html?unit=${unit.id}&diff=standard" class="btn btn-outline">標準</a>
  `;

  // 進捗情報
  const userData = Storage.getUserData();
  const uQs = KagakuData.questions.filter(q => q.unitId === unit.id);
  let attemptsCount = 0;
  uQs.forEach(q => {
    const att = userData.attempts[q.id];
    if (att) attemptsCount += att.count || 0;
  });

  const mastery = Mastery.unitScore(unit.id, KagakuData.questions, userData.attempts || {});
  document.getElementById("progress-attempts").textContent = `${attemptsCount} 回`;
  document.getElementById("progress-accuracy").textContent = `${mastery} %（${Mastery.grade(mastery)}・${Mastery.label(mastery)}）`;

  const progressData = userData.unitProgress?.[unit.id] || {};
  document.getElementById("progress-explanation").textContent = progressData.readExplanation ? "✓ 学習済み" : "未完了";
  document.getElementById("progress-example").textContent = progressData.readExample ? "✓ 確認済み" : "未確認";

  const explanationDone = progressData.readExplanation ? 1 : 0;
  const exampleDone = progressData.readExample ? 1 : 0;
  const practiceDone = uQs.length > 0 ? Math.min(1, attemptsCount / uQs.length) : 1;
  const progressPct = Math.round(((explanationDone + exampleDone + practiceDone) / 3) * 100);
  document.getElementById("unit-progress-fill").style.width = `${progressPct}%`;
  document.getElementById("unit-progress-text").textContent = `進捗 ${progressPct}%`;
});
