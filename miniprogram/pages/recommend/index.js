const storage = require('../../utils/storage');
const mock = require('../../utils/mock');
const scorer = require('../../utils/scorer');

function getTimeSlot() {
  const hour = new Date().getHours();
  if (hour < 11) return '早餐';
  if (hour < 16) return '午餐';
  if (hour < 22) return '晚餐';
  return '夜宵';
}

Page({
  data: {
    city: '未定位',
    timeSlot: getTimeSlot(),
    radiusOptions: [1, 2],
    radiusKm: 1,
    cards: [],
    loading: false
  },

  onShow() {
    const profile = storage.getProfile();
    if (!profile.hasOnboarded) {
      wx.redirectTo({ url: '/pages/onboarding/index' });
      return;
    }
    this.setData({
      city: profile.city || '未定位',
      radiusKm: profile.radiusKm || 1
    });
    this.generateCards();
  },

  onRadiusChange(e) {
    const selectedIndex = Number(e.detail.value);
    const radiusKm = this.data.radiusOptions[selectedIndex];
    const profile = storage.getProfile();
    profile.radiusKm = radiusKm;
    storage.setProfile(profile);
    this.setData({ radiusKm });
    this.generateCards();
  },

  generateCards() {
    this.setData({ loading: true });
    const profile = storage.getProfile();
    const logs = storage.getLogs();
    const nearby = mock.getNearbyPlaces(profile.radiusKm);
    const cards = scorer.recommendTop3(nearby, profile, logs);
    this.setData({ cards, loading: false });
  },

  refreshCards() {
    this.generateCards();
  },

  randomOne() {
    const cards = this.data.cards;
    if (!cards.length) return;
    const item = cards[Math.floor(Math.random() * cards.length)];
    this.chooseWithItem(item, 'random');
  },

  chooseCard(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.cards.find(c => c.id === id);
    if (!item) return;
    this.chooseWithItem(item, 'choose');
  },

  chooseWithItem(item, action) {
    const profile = storage.getProfile();
    const weights = { ...(profile.tasteWeights || {}) };
    item.tags.forEach(tag => {
      weights[tag] = (weights[tag] || 0) + 1;
    });
    profile.tasteWeights = weights;
    storage.setProfile(profile);

    storage.setSelected({ ...item, ts: Date.now() });
    storage.appendLog({
      ts: Date.now(),
      action,
      placeId: item.id,
      placeName: item.name,
      tags: item.tags,
      radiusKm: profile.radiusKm
    });

    wx.navigateTo({ url: '/pages/result/index' });
  },

  rejectCard(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.cards.find(c => c.id === id);
    if (!item) return;

    const profile = storage.getProfile();
    const weights = { ...(profile.tasteWeights || {}) };
    item.tags.forEach(tag => {
      weights[tag] = (weights[tag] || 0) - 1;
    });
    profile.tasteWeights = weights;
    storage.setProfile(profile);

    storage.appendLog({
      ts: Date.now(),
      action: 'reject',
      placeId: item.id,
      placeName: item.name,
      tags: item.tags,
      radiusKm: profile.radiusKm
    });

    wx.showToast({ title: '已记住偏好', icon: 'none' });
    this.generateCards();
  }
});
