// 学習状況から「次に解くとよい問題」を作る共通ロジック
const Recommendations = {
  questionPriority(q, att) {
    if (!att || !att.count) return 100; // 未演習を最優先
    const score = Mastery.questionScore(att);
    const recentPenalty = att.lastAttempt ? Math.min(20, ((Date.now() - new Date(att.lastAttempt).getTime()) / 86400000) * 0.7) : 0;
    const wrongPenalty = att.lastCorrect === false ? 20 : 0;
    return Math.max(0, 100 - score + recentPenalty + wrongPenalty);
  },

  getRecommended(questions, attempts, limit = 5) {
    return [...questions]
      .map(q => ({ q, priority: this.questionPriority(q, attempts[q.id]) }))
      .sort((a, b) => b.priority - a.priority || a.q.id.localeCompare(b.q.id))
      .slice(0, limit)
      .map(x => x.q);
  },

  todayCount(attempts) {
    const today = new Date().toISOString().split('T')[0];
    return Object.values(attempts || {}).filter(a => a.lastAttempt?.startsWith(today)).length;
  },

  todayMinutes(data) {
    // totalTimeSecondsは累積値のため、ホームでは問題数の達成状況を中心に表示する。
    // 学習時間の正確な日次集計は履歴テーブル側で管理する。
    return 0;
  }
};
