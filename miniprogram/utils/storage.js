const PROFILE_KEY = 'chishame_profile';
const LOG_KEY = 'chishame_decision_logs';
const SELECTED_KEY = 'chishame_selected_item';
const CONTENT_HISTORY_KEY = 'chishame_content_history';

const defaultProfile = {
  hasOnboarded: false,
  preferredFlavor: '随机',
  tasteTags: ['均衡', '日常'],
  tabooTags: [],
  quoteStyle: '经典',
  mealMode: '智能',
  shareCopyStyle: '克制版',
  posterTheme: '极简',
  useRemote: true,
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

const defaultContentHistory = {
  mealSignatures: [],
  quoteTexts: [],
  imageKeys: [],
  remoteMealIds: []
};

const HISTORY_LIMITS = {
  mealSignatures: 80,
  quoteTexts: 60,
  imageKeys: 50,
  remoteMealIds: 80
};

function pushUniqueFront(list = [], values = [], limit = 50) {
  const existing = Array.isArray(list) ? [...list] : [];
  const incoming = Array.isArray(values) ? values : [values];

  incoming.forEach((row) => {
    const item = String(row || '').trim();
    if (!item) return;
    const foundIdx = existing.indexOf(item);
    if (foundIdx >= 0) existing.splice(foundIdx, 1);
    existing.unshift(item);
  });

  return existing.slice(0, limit);
}

function normalizeContentHistory(history = {}) {
  return {
    mealSignatures: pushUniqueFront([], history.mealSignatures || [], HISTORY_LIMITS.mealSignatures),
    quoteTexts: pushUniqueFront([], history.quoteTexts || [], HISTORY_LIMITS.quoteTexts),
    imageKeys: pushUniqueFront([], history.imageKeys || [], HISTORY_LIMITS.imageKeys),
    remoteMealIds: pushUniqueFront([], history.remoteMealIds || [], HISTORY_LIMITS.remoteMealIds)
  };
}

function buildMealSignature(item = {}) {
  const title = String(item.title || '').toLowerCase();
  const protein = String(item.protein || '').toLowerCase();
  const staple = String(item.staple || '').toLowerCase();
  const veggie = String(item.veggie || '').toLowerCase();
  return [title, protein, staple, veggie].filter(Boolean).join('|');
}

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

  // v0.8 起固定网络优先：旧版本遗留的 false 统一迁移为 true。
  merged.useRemote = true;

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

  const history = wx.getStorageSync(CONTENT_HISTORY_KEY);
  if (!history) {
    wx.setStorageSync(CONTENT_HISTORY_KEY, defaultContentHistory);
  } else {
    wx.setStorageSync(CONTENT_HISTORY_KEY, normalizeContentHistory(history));
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

function getContentHistory() {
  return normalizeContentHistory(wx.getStorageSync(CONTENT_HISTORY_KEY) || {});
}

function setContentHistory(next = {}) {
  wx.setStorageSync(CONTENT_HISTORY_KEY, normalizeContentHistory(next));
}

function rememberGeneratedCards(cards = []) {
  if (!Array.isArray(cards) || !cards.length) return;

  const history = getContentHistory();
  const mealSignatures = cards.map((item) => buildMealSignature(item)).filter(Boolean);
  const quoteTexts = cards.map((item) => (item.quote && item.quote.text) || '').filter(Boolean);
  const imageKeys = cards.map((item) => item.image || '').filter(Boolean);
  const remoteMealIds = cards
    .map((item) => item.remoteMealId || '')
    .filter(Boolean);

  setContentHistory({
    ...history,
    mealSignatures: pushUniqueFront(history.mealSignatures, mealSignatures, HISTORY_LIMITS.mealSignatures),
    quoteTexts: pushUniqueFront(history.quoteTexts, quoteTexts, HISTORY_LIMITS.quoteTexts),
    imageKeys: pushUniqueFront(history.imageKeys, imageKeys, HISTORY_LIMITS.imageKeys),
    remoteMealIds: pushUniqueFront(history.remoteMealIds, remoteMealIds, HISTORY_LIMITS.remoteMealIds)
  });
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
  getSelected,
  getContentHistory,
  setContentHistory,
  rememberGeneratedCards
};
