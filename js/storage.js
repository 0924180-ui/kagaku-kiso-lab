// LocalStorage データ管理ユーティリティ
const STORAGE_KEY = "kagaku_lab_user_data";

const DefaultUserData = {
  totalTimeSeconds: 0,
  streakDays: 1,
  lastStudyDate: new Date().toISOString().split('T')[0],
  attempts: {}, // qId -> { count, correct, lastAttempt, lastCorrect, saved: bool }
  unitProgress: {}, // uId -> { readExplanation: bool, readExample: bool, saved: bool }
  goals: { dailyQuestions: 10, dailyMinutes: 20, updatedAt: null }
};

const Storage = {
  getUserData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? { ...DefaultUserData, ...JSON.parse(data) } : { ...DefaultUserData };
    } catch(e) {
      return { ...DefaultUserData };
    }
  },

  saveUserData(data, options = {}) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (!options.skipSync && window.KagakuCloud?.queueSync) window.KagakuCloud.queueSync();
    } catch(e) {
      console.error("Save error", e);
    }
  },

  recordQuestionAttempt(questionId, isCorrect) {
    const data = this.getUserData();
    if (!data.attempts[questionId]) {
      data.attempts[questionId] = { count: 0, correct: 0, lastAttempt: null, lastCorrect: null, saved: false };
    }
    const att = data.attempts[questionId];
    att.count += 1;
    if (isCorrect) att.correct += 1;
    att.lastCorrect = !!isCorrect;
    att.lastAttempt = new Date().toISOString();
    
    // ストリーク更新チェック
    const today = new Date().toISOString().split('T')[0];
    if (data.lastStudyDate !== today) {
      data.streakDays += 1;
      data.lastStudyDate = today;
    }
    
    this.saveUserData(data);
  },



  setUnitExplanationRead(unitId, isRead = true) {
    const data = this.getUserData();
    if (!data.unitProgress) data.unitProgress = {};
    if (!data.unitProgress[unitId]) data.unitProgress[unitId] = { readExplanation: false, readExample: false };
    data.unitProgress[unitId].readExplanation = !!isRead;
    this.saveUserData(data);
    return data.unitProgress[unitId];
  },

  setUnitExampleRead(unitId, isRead = true) {
    const data = this.getUserData();
    if (!data.unitProgress) data.unitProgress = {};
    if (!data.unitProgress[unitId]) data.unitProgress[unitId] = { readExplanation: false, readExample: false };
    data.unitProgress[unitId].readExample = !!isRead;
    this.saveUserData(data);
    return data.unitProgress[unitId];
  },

  toggleSaveUnit(unitId) {
    const data = this.getUserData();
    if (!data.unitProgress) data.unitProgress = {};
    if (!data.unitProgress[unitId]) data.unitProgress[unitId] = { readExplanation: false, readExample: false, saved: false };
    data.unitProgress[unitId].saved = !data.unitProgress[unitId].saved;
    this.saveUserData(data);
    return data.unitProgress[unitId].saved;
  },

  isUnitSaved(unitId) {
    return !!this.getUserData().unitProgress?.[unitId]?.saved;
  },

  toggleSaveQuestion(questionId) {
    const data = this.getUserData();
    if (!data.attempts[questionId]) {
      data.attempts[questionId] = { count: 0, correct: 0, lastAttempt: null, lastCorrect: null, saved: true };
    } else {
      data.attempts[questionId].saved = !data.attempts[questionId].saved;
    }
    this.saveUserData(data);
    return data.attempts[questionId].saved;
  },

  exportJSON() {
    const data = this.getUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kagaku_lab_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      this.saveUserData(parsed);
      alert("データを正常に復元しました！");
      location.reload();
    } catch(e) {
      alert("JSONファイルの形式が正しくありません。");
    }
  },

  getGoals() {
    const data = this.getUserData();
    return { dailyQuestions: Math.max(1, Number(data.goals?.dailyQuestions || 10)), dailyMinutes: Math.max(1, Number(data.goals?.dailyMinutes || 20)), updatedAt: data.goals?.updatedAt || null };
  },

  saveGoals(goals) {
    const data = this.getUserData();
    data.goals = { dailyQuestions: Math.max(1, Math.min(100, Number(goals.dailyQuestions) || 10)), dailyMinutes: Math.max(1, Math.min(300, Number(goals.dailyMinutes) || 20)), updatedAt: new Date().toISOString() };
    this.saveUserData(data);
    return data.goals;
  },

  resetData() {
    if (confirm("全ての学習記録を初期化しますか？この操作は取り消せません。")) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  }
};
