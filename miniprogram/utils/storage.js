const PROFILE_KEY = 'chishame_profile';
const LOG_KEY = 'chishame_decision_logs';
const SELECTED_KEY = 'chishame_selected_item';

const defaultProfile = {
  hasOnboarded: false,
  preferredFlavor: '随机',
  tasteTags: ['均衡', '日常'],
  tabooTags: [],
  quoteStyle: '经典',
  mealMode: '智能',
  shareCopyStyle: '克制版',
  posterTheme: '极简',
  tasteWeights: {
    清淡: 0,
    均衡: 1,
    下饭: 0,
    浓香: 0,
    辛辣: 0,
    轻食: 0,
    日常: 1
  }
};

function normalizeProfile(profile = {}) {
  const merged = {
    ...defaultProfile,
    ...profile,
    tasteWeights: {
      ...defaultProfile.tasteWeights,
      ...(profile.tasteWeights || {})
    }
  };

  // 兼容旧字段
  if (!merged.preferredFlavor) {
    merged.preferredFlavor = '随机';
  }
  return merged;
}

function ensureDefaults() {
  const profile = wx.getStorageSync(PROFILE_KEY);
  if (!profile) {
    wx.setStorageSync(PROFILE_KEY, defaultProfile);
  } else {
    wx.setStorageSync(PROFILE_KEY, normalizeProfile(profile));
  }

  const logs = wx.getStorageSync(LOG_KEY);
  if (!Array.isArray(logs)) {
    wx.setStorageSync(LOG_KEY, []);
  }
}

function getProfile() {
  return normalizeProfile(wx.getStorageSync(PROFILE_KEY) || {});
}

function setProfile(next) {
  wx.setStorageSync(PROFILE_KEY, normalizeProfile(next));
}

function getLogs() {
  return wx.getStorageSync(LOG_KEY) || [];
}

function appendLog(log) {
  const logs = getLogs();
  logs.unshift(log);
  wx.setStorageSync(LOG_KEY, logs.slice(0, 200));
}

function setSelected(item) {
  wx.setStorageSync(SELECTED_KEY, item);
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
