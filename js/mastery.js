// 定着度の計算ユーティリティ
// 正答率だけでなく「繰り返し解いているか」「最近もできているか」を合わせて評価します。
const Mastery = {
  questionScore(att) {
    if (!att || !att.count) return 0;

    const accuracy = Math.max(0, Math.min(1, (att.correct || 0) / att.count));
    // 4回程度の確認で「十分な反復」とみなす。回数だけで過大評価しない。
    const repetition = Math.min(1, att.count / 4);

    let recency = 0.35;
    if (att.lastAttempt) {
      const days = Math.max(0, (Date.now() - new Date(att.lastAttempt).getTime()) / 86400000);
      // 最近確認した知識ほど高く、時間が空くほど少しずつ低下。
      recency = Math.max(0.25, Math.exp(-days / 21));
    }

    // 「できた割合」だけでなく、反復と最近の確認を評価。
    const score = (accuracy * 0.60 + repetition * 0.20 + recency * 0.20) * 100;
    return Math.round(Math.max(0, Math.min(100, score)));
  },

  grade(score) {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    return 'E';
  },

  label(score) {
    const grade = this.grade(score);
    const labels = { A: 'よく定着', B: '定着', C: 'あと一歩', D: '要復習', E: '未定着' };
    return labels[grade];
  },

  unitScore(unitId, questions, attempts) {
    const scores = questions.filter(q => q.unitId === unitId).map(q => this.questionScore(attempts[q.id]));
    if (!scores.length) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  },

  overallScore(questions, attempts) {
    const scores = questions.map(q => this.questionScore(attempts[q.id])).filter(s => s > 0);
    if (!scores.length) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }
};
