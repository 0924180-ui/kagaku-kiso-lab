document.addEventListener("DOMContentLoaded", async () => {
  if (window.KagakuCloud?.questionsReady) await window.KagakuCloud.questionsReady;
  const container = document.getElementById("unit-list");
  if (!container) return;

  container.innerHTML = KagakuData.units.map(u => `
    <a href="unit.html?id=${u.id}" class="unit-card">
      <div>
        <div class="unit-card-title">${u.title}</div>
        <div class="unit-card-desc">${u.summary}</div>
      </div>
      <div class="btn btn-outline btn-sm">学習する &rarr;</div>
    </a>
  `).join("");
});
