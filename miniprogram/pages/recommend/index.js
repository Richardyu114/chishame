const storage = require('../../utils/storage');
const mock = require('../../utils/mock');
const scorer = require('../../utils/scorer');
const cloud = require('../../utils/cloud');

function getTimeSlot() {
  const hour = new Date().getHours();
  if (hour < 11) return '早餐';
  if (hour < 16) return '午餐';
  if (hour < 22) return '晚餐';
  return '夜宵';
}

function getLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => resolve({ lat: res.latitude, lng: res.longitude }),
      fail: (err) => reject(err)
    });
  });
}

Page({
  data: {
    city: '未定位',
    timeSlot: getTimeSlot(),
    radiusOptions: [1, 2],
    radiusKm: 1,
    cards: [],
    loading: false,
    source: 'mock'
  },

  async onShow() {
    const profile = storage.getProfile();
    if (!profile.hasOnboarded) {
      wx.redirectTo({ url: '/pages/onboarding/index' });
      return;
    }

    this.setData({
      city: profile.city || '未定位',
      radiusKm: profile.radiusKm || 1
    });

    await this.generateCards();
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

  async fetchNearbyPlaces(profile) {
    // 优先：云函数 + 腾讯地图；失败则本地 mock 兜底
    try {
      let loc = profile.lastLocation;
      if (!loc) {
        loc = await getLocation();
        profile.lastLocation = loc;
        storage.setProfile(profile);
      }

      const searchRes = await cloud.searchNearby({
        lat: loc.lat,
        lng: loc.lng,
        radiusKm: profile.radiusKm,
        keyword: '餐饮'
      });

      const places = (searchRes && searchRes.data) || [];
      if (places.length > 0) {
        return { places, source: 'cloud' };
      }
    } catch (err) {
      console.warn('cloud search failed, fallback to mock', err);
    }

    return {
      places: mock.getNearbyPlaces(profile.radiusKm),
      source: 'mock'
    };
  },

  async generateCards() {
    this.setData({ loading: true });

    const profile = storage.getProfile();
    const logs = storage.getLogs();
    const { places, source } = await this.fetchNearbyPlaces(profile);

    let cards = [];

    if (source === 'cloud' && cloud.hasCloud()) {
      try {
        const recRes = await cloud.recommend({ places, profile, logs });
        cards = (recRes && recRes.data) || [];
      } catch (err) {
        console.warn('cloud recommend failed, fallback local scorer', err);
      }
    }

    if (!cards.length) {
      cards = scorer.recommendTop3(places, profile, logs);
    }

    this.setData({ cards, source, loading: false });
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

    const log = {
      ts: Date.now(),
      action,
      placeId: item.id,
      placeName: item.name,
      tags: item.tags,
      radiusKm: profile.radiusKm
    };

    storage.setSelected({ ...item, ts: Date.now() });
    storage.appendLog(log);

    cloud.feedback(log).catch(() => {});

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

    const log = {
      ts: Date.now(),
      action: 'reject',
      placeId: item.id,
      placeName: item.name,
      tags: item.tags,
      radiusKm: profile.radiusKm
    };

    storage.appendLog(log);
    cloud.feedback(log).catch(() => {});

    wx.showToast({ title: '已记住偏好', icon: 'none' });
    this.generateCards();
  }
});
