const PROFILE_KEY = 'chishame_profile';
const LOG_KEY = 'chishame_decision_logs';
const SELECTED_KEY = 'chishame_selected_place';

const defaultProfile = {
  hasOnboarded: false,
  budgetMin: 20,
  budgetMax: 60,
  radiusKm: 1,
  maxRadiusKm: 2,
  dineInOnly: true,
  tasteTags: ['米饭', '面食'],
  tabooTags: [],
  tasteWeights: {
    米饭: 1,
    面食: 1,
    清淡: 0,
    辣: 0,
    快餐: 0,
    火锅: 0,
    粤菜: 0,
    川菜: 0,
    日料: 0
  },
  city: '未定位',
  lastLocation: null
};

function ensureDefaults() {
  const profile = wx.getStorageSync(PROFILE_KEY);
  if (!profile) {
    wx.setStorageSync(PROFILE_KEY, defaultProfile);
  }
  const logs = wx.getStorageSync(LOG_KEY);
  if (!logs) {
    wx.setStorageSync(LOG_KEY, []);
  }
}

function getProfile() {
  return wx.getStorageSync(PROFILE_KEY) || { ...defaultProfile };
}

function setProfile(next) {
  wx.setStorageSync(PROFILE_KEY, next);
}

function getLogs() {
  return wx.getStorageSync(LOG_KEY) || [];
}

function appendLog(log) {
  const logs = getLogs();
  logs.unshift(log);
  wx.setStorageSync(LOG_KEY, logs.slice(0, 200));
}

function setSelected(place) {
  wx.setStorageSync(SELECTED_KEY, place);
}

function getSelected() {
  return wx.getStorageSync(SELECTED_KEY) || null;
}

module.exports = {
  PROFILE_KEY,
  LOG_KEY,
  defaultProfile,
  ensureDefaults,
  getProfile,
  setProfile,
  getLogs,
  appendLog,
  setSelected,
  getSelected
};
