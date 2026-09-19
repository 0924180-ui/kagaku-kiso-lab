document.addEventListener("DOMContentLoaded", async () => {
  if (window.KagakuCloud?.questionsReady) await window.KagakuCloud.questionsReady;
  const data = Storage.getUserData();
  const attempts = data.attempts || {};
  const goals = Storage.getGoals();
  const todayCount = Recommendations.todayCount(attempts);

  document.getElementById("stat-total-time").textContent = `${Math.floor((data.totalTimeSeconds || 0) / 60)}分`;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayScores = [];
  Object.entries(attempts).forEach(([qId, att]) => {
    if (att.lastAttempt && att.lastAttempt.startsWith(todayStr)) todayScores.push(Mastery.questionScore(att));
  });

  document.getElementById("stat-today-count").innerHTML = `${todayCount}<span class="unit">問</span>`;
  const todayMastery = todayScores.length ? Math.round(todayScores.reduce((a,b) => a+b, 0) / todayScores.length) : 0;
  const masteryEl = document.getElementById("stat-today-mastery");
  if (masteryEl) {
    masteryEl.innerHTML = todayScores.length
      ? `${todayMastery}<span class="unit">%・${Mastery.grade(todayMastery)}</span>`
      : `—<span class="unit">%・—</span>`;
  }
  document.getElementById("stat-streak").innerHTML = `${data.streakDays || 1}<span class="unit">日</span>`;

  const goalPanel = document.getElementById("goal-panel");
  function renderGoals() {
    const current = Storage.getGoals();
    const qPct = Math.min(100, Math.round((todayCount / current.dailyQuestions) * 100));
    goalPanel.innerHTML = `<div class="goal-card"><div><div class="eyebrow">今日の問題目標</div><strong>${todayCount} / ${current.dailyQuestions} 問</strong><div class="progress"><i style="width:${qPct}%"></i></div><small>${qPct >= 100 ? '目標達成！' : `あと ${Math.max(0,current.dailyQuestions-todayCount)} 問`}</small></div><div class="goal-side"><span>目標学習時間</span><b>${current.dailyMinutes}分</b></div></div>`;
  }
  renderGoals();
  document.getElementById("edit-goal-btn")?.addEventListener("click", () => {
    const current = Storage.getGoals();
    const q = prompt("1日の問題目標（1〜100問）", current.dailyQuestions);
    if (q === null) return;
    const m = prompt("1日の学習時間目標（1〜300分）", current.dailyMinutes);
    if (m === null) return;
    Storage.saveGoals({ dailyQuestions: q, dailyMinutes: m });
    location.reload();
  });

  const recommendedArea = document.getElementById("recommended-study");
  if (recommendedArea) {
    const ranked = KagakuData.units.map(u => ({
      unit: u,
      score: Mastery.unitScore(u.id, KagakuData.questions, attempts)
    })).sort((a,b) => a.score - b.score);
    const target = ranked[0]?.unit || KagakuData.units[0];
    const score = Mastery.unitScore(target.id, KagakuData.questions, attempts);
    const recQs = Recommendations.getRecommended(KagakuData.questions, attempts, 5);
    recommendedArea.innerHTML = `
      <div class="panel">
        <div class="eyebrow">定着度からおすすめ</div>
        <h3 style="margin-bottom:8px;">${target.title}</h3>
        <p style="color:var(--text-secondary); margin-bottom:8px;">現在の定着度：<strong>${score}%（${Mastery.grade(score)}）</strong></p>
        <p style="color:var(--text-secondary); margin-bottom:16px;">${target.summary}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><a href="unit.html?id=${target.id}" class="btn btn-primary">この単元を学習する</a><a href="practice.html?recommended=1" class="btn btn-outline">おすすめ問題を5問</a></div>
      </div>
    `;
  }

  const unitListArea = document.getElementById("unit-progress-list");
  if (unitListArea) {
    unitListArea.innerHTML = KagakuData.units.map(u => {
      const uQs = KagakuData.questions.filter(q => q.unitId === u.id);
      const solved = uQs.filter(q => attempts[q.id]?.count > 0).length;
      const pct = Mastery.unitScore(u.id, KagakuData.questions, attempts);
      const grade = Mastery.grade(pct);
      return `
        <a href="unit.html?id=${u.id}" class="unit-card">
          <div>
            <div class="unit-card-title">${u.title}</div>
            <div class="unit-card-desc">${u.summary}</div>
          </div>
          <div style="text-align:right; min-width:105px;">
            <div style="font-weight:700; color:var(--primary);">${pct}% <span style="font-size:.8rem;">${grade}</span></div>
            <div style="font-size:0.75rem; color:var(--text-muted);">定着度・${solved}/${uQs.length}問確認</div>
          </div>
        </a>
      `;
    }).join("");
  }
});


async function loadHomeAnnouncements(){const el=document.getElementById('announcements');if(!el)return;const c=window.KagakuCloud?.getClient?.();if(!c){el.textContent='';return}const {data,error}=await c.rpc('get_published_announcements');if(error||!data?.length){el.innerHTML='<span class="muted">現在お知らせはありません。</span>';return}el.innerHTML=data.map(a=>`<article style="padding:10px 0;border-bottom:1px solid var(--border-color)"><strong>${String(a.title).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}</strong><p style="margin:5px 0;white-space:pre-wrap">${String(a.body).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}</p></article>`).join('')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadHomeAnnouncements);else loadHomeAnnouncements();
