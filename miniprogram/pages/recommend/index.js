const storage = require('../../utils/storage');
const foodEngine = require('../../utils/foodEngine');

function getTimeSlot() {
  const hour = new Date().getHours();
  if (hour < 11) return '早餐灵感';
  if (hour < 16) return '午餐灵感';
  if (hour < 22) return '晚餐灵感';
  return '夜宵灵感';
}

const flavorCycle = ['随机', '清淡', '均衡', '下饭', '浓香', '辛辣', '轻食'];

Page({
  data: {
    timeSlot: getTimeSlot(),
    cards: [],
    currentCardIndex: 0,
    loading: false,
    cardsVisible: true,
    pressedAction: '',
    preferredFlavor: '随机'
  },

  onLoad() {
    this._loadToken = 0;
  },

  onShow() {
    const profile = storage.getProfile();
    this.setData({ preferredFlavor: profile.preferredFlavor || '随机' });
    this.generateCards();
  },

  onHide() {
    this._loadToken += 1;
  },

  onUnload() {
    this._loadToken += 1;
  },

  onCardChange(e) {
    this.setData({ currentCardIndex: Number(e.detail.current || 0) });
  },

  onPressAction(e) {
    this.setData({ pressedAction: e.currentTarget.dataset.action || '' });
  },

  onReleaseAction() {
    this.setData({ pressedAction: '' });
  },

  getCurrentCard() {
    const idx = this.data.currentCardIndex || 0;
    return this.data.cards[idx] || null;
  },

  triggerLightHaptic() {
    if (typeof wx === 'undefined' || typeof wx.vibrateShort !== 'function') return;
    wx.vibrateShort({ type: 'light', fail: () => {} });
  },

  preloadCardImages(cards = []) {
    const urls = cards
      .map((item) => item && item.image)
      .filter(Boolean)
      .slice(0, 2)
      .filter((url) => /^https?:\/\//.test(url));

    urls.forEach((src) => {
      wx.getImageInfo({
        src,
        success: () => {},
        fail: () => {}
      });
    });
  },

  generateCards() {
    const startedAt = Date.now();
    const currentToken = startedAt;
    this._loadToken = currentToken;
    this.setData({ loading: true });

    const profile = storage.getProfile();

    foodEngine
      .generateMeals(profile, 4)
      .then((cards) => {
        if (this._loadToken !== currentToken) return;

        const normalizedCards = Array.isArray(cards) ? cards : [];
        this.preloadCardImages(normalizedCards);

        const minLoading = 180;
        const delay = Math.max(0, minLoading - (Date.now() - startedAt));

        setTimeout(() => {
          if (this._loadToken !== currentToken) return;
          this.setData({
            cards: normalizedCards,
            loading: false,
            currentCardIndex: 0,
            cardsVisible: true,
            preferredFlavor: profile.preferredFlavor || '随机'
          });
        }, delay);
      })
      .catch(() => {
        if (this._loadToken !== currentToken) return;
        this.setData({
          cards: [],
          loading: false,
          currentCardIndex: 0,
          cardsVisible: true,
          preferredFlavor: profile.preferredFlavor || '随机'
        });
      });
  },

  refreshCards() {
    this.triggerLightHaptic();
    this.setData({ pressedAction: '', cardsVisible: false });
    setTimeout(() => this.generateCards(), 140);
  },

  switchFlavor() {
    this.triggerLightHaptic();
    this.setData({ pressedAction: '' });
    const profile = storage.getProfile();
    const current = profile.preferredFlavor || '随机';
    const idx = flavorCycle.indexOf(current);
    const nextFlavor = flavorCycle[(idx + 1 + flavorCycle.length) % flavorCycle.length];
    profile.preferredFlavor = nextFlavor;
    storage.setProfile(profile);
    wx.showToast({ title: `口味：${nextFlavor}`, icon: 'none' });
    this.setData({ preferredFlavor: nextFlavor, cardsVisible: false });
    setTimeout(() => this.generateCards(), 140);
  },

  pickCurrent() {
    this.triggerLightHaptic();
    this.setData({ pressedAction: '' });
    const item = this.getCurrentCard();
    if (!item) return;
    this.chooseWithItem(item, 'choose');
  },

  randomOne() {
    this.triggerLightHaptic();
    this.setData({ pressedAction: '' });
    const cards = this.data.cards;
    if (!cards.length) return;
    const randomIndex = Math.floor(Math.random() * cards.length);
    const item = cards[randomIndex];
    this.setData({ currentCardIndex: randomIndex });
    wx.showToast({ title: '今日有口福', icon: 'none' });
    this.chooseWithItem(item, 'random');
  },

  chooseWithItem(item, action) {
    const profile = storage.getProfile();
    const weights = { ...(profile.tasteWeights || {}) };
    (item.tags || []).forEach((tag) => {
      weights[tag] = (weights[tag] || 0) + 1;
    });
    profile.tasteWeights = weights;
    storage.setProfile(profile);

    const log = {
      ts: Date.now(),
      action,
      mealId: item.id,
      mealTitle: item.title,
      tags: item.tags
    };

    storage.setSelected({ ...item, ts: Date.now() });
    storage.appendLog(log);
    wx.navigateTo({ url: '/pages/result/index' });
  }
});
