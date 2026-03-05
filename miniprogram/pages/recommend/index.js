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

  onShow() {
    const profile = storage.getProfile();
    this.setData({ preferredFlavor: profile.preferredFlavor || '随机' });
    this.generateCards();
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

  generateCards() {
    this.setData({ loading: true });
    const profile = storage.getProfile();

    setTimeout(() => {
      const cards = foodEngine.generateMeals(profile, 4);
      this.setData({
        cards,
        loading: false,
        currentCardIndex: 0,
        cardsVisible: true,
        preferredFlavor: profile.preferredFlavor || '随机'
      });
    }, 180);
  },

  refreshCards() {
    this.setData({ pressedAction: '', cardsVisible: false });
    setTimeout(() => this.generateCards(), 140);
  },

  switchFlavor() {
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
    this.setData({ pressedAction: '' });
    const item = this.getCurrentCard();
    if (!item) return;
    this.chooseWithItem(item, 'choose');
  },

  randomOne() {
    this.setData({ pressedAction: '' });
    const cards = this.data.cards;
    if (!cards.length) return;
    const randomIndex = Math.floor(Math.random() * cards.length);
    const item = cards[randomIndex];
    this.setData({ currentCardIndex: randomIndex });
    wx.showToast({ title: '天意已定', icon: 'none' });
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
