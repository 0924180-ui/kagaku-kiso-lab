document.addEventListener("DOMContentLoaded", async () => {
  if (window.KagakuCloud?.questionsReady) await window.KagakuCloud.questionsReady;
  const tabs = document.querySelectorAll(".segment button");
  const reviewArea = document.getElementById("review-area");

  let currentView = "wrong";

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      currentView = tab.dataset.view;
      renderReview();
    });
  });

  function renderReview() {
    const userData = Storage.getUserData();
    let questionsToReview = [];

    if (currentView === "wrong") {
      questionsToReview = KagakuData.questions.filter(q => {
        const att = userData.attempts[q.id];
        return att && att.count > att.correct;
      });
    } else {
      questionsToReview = KagakuData.questions.filter(q => {
        const att = userData.attempts[q.id];
        return att && att.saved;
      });
    }

    if (questionsToReview.length === 0) {
      reviewArea.innerHTML = `
        <div class="panel" style="text-align:center; color:var(--text-muted);">
          ${currentView === "wrong" ? "間違えた問題はありません！順調です👏" : "復習リストに保存された問題はありません。"}
        </div>
      `;
      return;
    }

    reviewArea.innerHTML = questionsToReview.map(q => `
      <div class="question-box">
        <div class="eyebrow">${q.unitId} - ${q.difficulty}</div>
        <div class="q-title">${q.question}</div>
        <div class="explanation-box" style="margin-top:12px;">
          <p><strong>正解:</strong> ${q.options[q.answerIndex]}</p>
          <p style="margin-top:4px;">${q.explanation}</p>
        </div>
      </div>
    `).join("");
  }

  renderReview();
});
