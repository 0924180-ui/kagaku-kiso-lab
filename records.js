document.addEventListener("DOMContentLoaded", async () => {
  if (window.KagakuCloud?.questionsReady) await window.KagakuCloud.questionsReady;
  const data = Storage.getUserData();
  const attempts = data.attempts || {};

  document.getElementById("r-total-time").textContent = `${Math.floor((data.totalTimeSeconds || 0) / 60)}分`;
  let totalCount = 0;
  Object.values(attempts).forEach(att => { totalCount += att.count || 0; });

  document.getElementById("r-total-count").innerHTML = `${totalCount}<span class="unit">問</span>`;
  const overall = Mastery.overallScore(KagakuData.questions, attempts);
  document.getElementById("r-total-mastery").innerHTML = overall ? `${overall}<span class="unit">%・${Mastery.grade(overall)}</span>` : `—<span class="unit">%・—</span>`;
  document.getElementById("r-streak").innerHTML = `${data.streakDays || 1}<span class="unit">日</span>`;

  const tbody = document.querySelector("#unit-table tbody");
  if (tbody) {
    tbody.innerHTML = KagakuData.units.map(u => {
      const uQs = KagakuData.questions.filter(q => q.unitId === u.id);
      const count = uQs.reduce((sum,q) => sum + (attempts[q.id]?.count || 0), 0);
      const score = Mastery.unitScore(u.id, KagakuData.questions, attempts);
      const grade = Mastery.grade(score);
      return `
        <tr>
          <td><strong>${u.title}</strong></td>
          <td>${count}問</td>
          <td><strong>${score}%</strong> <span class="mastery-grade">${grade}</span><br><small>${Mastery.label(score)}</small></td>
          <td><div class="progress-bar"><div class="fill" style="width:${score}%;"></div></div></td>
        </tr>
      `;
    }).join("");
  }

  const weakUnitsDiv = document.getElementById("weak-units");
  if (weakUnitsDiv) {
    const weakList = KagakuData.units.filter(u => Mastery.unitScore(u.id, KagakuData.questions, attempts) < 60);
    weakUnitsDiv.innerHTML = weakList.length === 0
      ? `<div class="panel">定着度60%未満の単元はありません。学習した内容を間隔を空けて復習すると、さらに安定します。</div>`
      : weakList.map(u => {
          const score = Mastery.unitScore(u.id, KagakuData.questions, attempts);
          return `<div class="panel" style="border-left:4px solid var(--danger);"><h4>${u.title}</h4><p style="font-size:.85rem;color:var(--text-secondary);margin:4px 0 12px 0;">定着度 ${score}%（${Mastery.grade(score)}）です。復習をおすすめします。</p><a href="unit.html?id=${u.id}" class="btn btn-outline btn-sm">この単元を復習</a></div>`;
        }).join("");
  }

  if (window.Chart) {
    const ctx = document.getElementById("masteryChart");
    if (ctx) {
      const labels = KagakuData.units.map(u => u.title.split(".")[1] || u.title);
      const scores = KagakuData.units.map(u => Mastery.unitScore(u.id, KagakuData.questions, attempts));
      new Chart(ctx, {
        type: 'radar',
        data: { labels, datasets: [{ label: '単元別定着度 (%)', data: scores, backgroundColor: 'rgba(37, 99, 235, 0.2)', borderColor: '#2563eb', borderWidth: 2 }] },
        options: { scales: { r: { min: 0, max: 100, ticks: { stepSize: 20 } } } }
      });
    }
  }

  document.getElementById("export-data-btn").addEventListener("click", () => Storage.exportJSON());
  document.getElementById("import-data-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onload = (evt) => Storage.importJSON(evt.target.result); reader.readAsText(file); }
  });
  document.getElementById("reset-data-btn").addEventListener("click", () => Storage.resetData());
});
