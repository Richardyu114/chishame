const storage = require('../../utils/storage');
const personalize = require('../../utils/personalize');

const flavorOptions = ['随机', '清淡', '均衡', '下饭', '浓香', '辛辣', '轻食'];
const tabooOptions = ['海鲜', '牛肉', '豆制品', '鸡蛋', '生冷', '辛辣'];
const mealModeOptions = ['智能', '午餐', '晚餐'];

Page({
  data: {
    profile: null,
    logs: [],
    flavorOptions,
    tabooOptions,
    mealModeOptions,
    flavorIndex: 0,
    mealModeIndex: 0,
    flavorDriftHint: '口味画像还在形成中，先多翻几页看看。'
  },

  hydrateView() {
    const profile = storage.getProfile();
    const logs = storage.getLogs().slice(0, 12);
    const flavorIndex = Math.max(0, flavorOptions.indexOf(profile.preferredFlavor || '随机'));
    const mealModeIndex = Math.max(0, mealModeOptions.indexOf(profile.mealMode || '智能'));
    const drift = personalize.buildFlavorDrift(storage.getLogs());

    this.setData({
      profile,
      logs,
      flavorIndex,
      mealModeIndex,
      flavorDriftHint: drift.text
    });
  },

  onShow() {
    this.hydrateView();
  },

  onFlavorChange(e) {
    const idx = Number(e.detail.value);
    const profile = storage.getProfile();
    profile.preferredFlavor = flavorOptions[idx] || '随机';
    storage.setProfile(profile);
    this.hydrateView();
  },

  onMealModeChange(e) {
    const idx = Number(e.detail.value);
    const profile = storage.getProfile();
    profile.mealMode = mealModeOptions[idx] || '智能';
    storage.setProfile(profile);
    this.hydrateView();
  },

  toggleTaboo(e) {
    const tag = e.currentTarget.dataset.tag;
    const profile = storage.getProfile();
    const tabooTags = [...(profile.tabooTags || [])];
    const idx = tabooTags.indexOf(tag);
    if (idx >= 0) {
      tabooTags.splice(idx, 1);
    } else {
      tabooTags.push(tag);
    }
    profile.tabooTags = tabooTags;
    storage.setProfile(profile);
    this.hydrateView();
  },

  clearLogs() {
    wx.showModal({
      title: '清空记录',
      content: '确定清空最近的吃饭决策记录吗？',
      success: (res) => {
        if (!res.confirm) return;
        wx.setStorageSync(storage.LOG_KEY, []);
        this.hydrateView();
      }
    });
  }
});
