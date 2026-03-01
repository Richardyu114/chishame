const storage = require('../../utils/storage');
const mock = require('../../utils/mock');
const scorer = require('../../utils/scorer');
const cloud = require('../../utils/cloud');
const nearbyCache = require('../../utils/nearbyCache');

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

function pickCoverImage(place) {
  if (place.coverImage) return place.coverImage;
  const tags = place.tags || [];

  if (tags.includes('日料')) return 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=1200&q=80';
  if (tags.includes('火锅')) return 'https://images.unsplash.com/photo-1633321702518-7feccafb94d5?auto=format&fit=crop&w=1200&q=80';
  if (tags.includes('川菜') || tags.includes('辣')) return 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1200&q=80';
  if (tags.includes('面食')) return 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=1200&q=80';
  if (tags.includes('快餐')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80';
  return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80';
}

function pickDishName(place) {
  if (place.dishName) return place.dishName;
  const tags = place.tags || [];
  if (tags.includes('日料')) return '主打：轻和风拼盘';
  if (tags.includes('火锅')) return '主打：鲜香锅底';
  if (tags.includes('川菜') || tags.includes('辣')) return '主打：下饭辣味';
  if (tags.includes('面食')) return '主打：热汤面';
  if (tags.includes('米饭')) return '主打：现做盖饭';
  return '主打：今日人气菜';
}

function decorateCards(cards) {
  return (cards || []).map((card) => ({
    ...card,
    coverImage: pickCoverImage(card),
    dishName: pickDishName(card)
  }));
}

Page({
  data: {
    city: '未定位',
    timeSlot: getTimeSlot(),
    radiusOptions: [1, 2],
    radiusKm: 1,
    cards: [],
    currentCardIndex: 0,
    loading: false,
    locating: false,
    locationRequired: true,
    source: 'mock',
    cacheAgeMin: 0,
    cardsVisible: true,
    emptyHint: '',
    skeletonCards: [1, 2, 3],
    pressedAction: ''
  },

  async onShow() {
    const profile = storage.getProfile();
    this.setData({
      city: profile.city || '未定位',
      radiusKm: profile.radiusKm || 1
    });

    await this.ensureLocationReady();
  },

  async ensureLocationReady() {
    const hasPermission = await this.hasLocationPermission();
    if (!hasPermission) {
      this.setData({
        locationRequired: true,
        cards: [],
        emptyHint: '需要先授权定位，才能给你推荐附近好吃的。',
        loading: false
      });
      return;
    }

    this.setData({ locationRequired: false });
    await this.updateLocationFromSystem();
    await this.generateCards();
  },

  hasLocationPermission() {
    return new Promise((resolve) => {
      wx.getSetting({
        success: (res) => {
          resolve(!!res.authSetting['scope.userLocation']);
        },
        fail: () => resolve(false)
      });
    });
  },

  async updateLocationFromSystem() {
    try {
      const loc = await getLocation();
      const profile = storage.getProfile();
      profile.lastLocation = loc;
      profile.city = '当前位置';
      storage.setProfile(profile);
      this.setData({ city: profile.city });
      return loc;
    } catch (err) {
      this.setData({ city: '定位失败' });
      throw err;
    }
  },

  async requestLocationPermission() {
    this.setData({ locating: true });
    try {
      await new Promise((resolve, reject) => {
        wx.authorize({
          scope: 'scope.userLocation',
          success: resolve,
          fail: reject
        });
      });

      this.setData({ locationRequired: false });
      await this.updateLocationFromSystem();
      await this.generateCards();
    } catch (err) {
      wx.showToast({ title: '未授权定位，暂不可使用', icon: 'none' });
      this.setData({ locationRequired: true });
    } finally {
      this.setData({ locating: false });
    }
  },

  openLocationSettings() {
    wx.openSetting({
      success: async () => {
        await this.ensureLocationReady();
      }
    });
  },

  onRadiusChange(e) {
    if (this.data.locationRequired) return;

    const selectedIndex = Number(e.detail.value);
    const radiusKm = this.data.radiusOptions[selectedIndex];
    const profile = storage.getProfile();
    profile.radiusKm = radiusKm;
    storage.setProfile(profile);

    this.setData({ radiusKm, cardsVisible: false });
    setTimeout(() => this.generateCards(), 140);
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

  async fetchNearbyPlaces(profile) {
    try {
      let loc = profile.lastLocation;
      if (!loc) {
        loc = await this.updateLocationFromSystem();
        profile = storage.getProfile();
      }

      const cached = nearbyCache.getNearby({
        lat: loc.lat,
        lng: loc.lng,
        radiusKm: profile.radiusKm
      });

      if (cached.hit && cached.places.length > 0) {
        return {
          places: cached.places,
          source: 'cache',
          cacheAgeMin: Math.max(1, Math.floor(cached.ageMs / 60000))
        };
      }

      const searchRes = await cloud.searchNearby({
        lat: loc.lat,
        lng: loc.lng,
        radiusKm: profile.radiusKm,
        keyword: '餐饮'
      });

      const places = (searchRes && searchRes.data) || [];
      if (places.length > 0) {
        nearbyCache.setNearby({
          lat: loc.lat,
          lng: loc.lng,
          radiusKm: profile.radiusKm,
          places,
          ttlMs: nearbyCache.DEFAULT_TTL_MS
        });

        return { places, source: 'cloud', cacheAgeMin: 0 };
      }
    } catch (err) {
      console.warn('cloud search failed, fallback to mock', err);
    }

    return {
      places: mock.getNearbyPlaces(profile.radiusKm),
      source: 'mock',
      cacheAgeMin: 0
    };
  },

  async generateCards() {
    if (this.data.locationRequired) return;

    this.setData({ loading: true });

    const profile = storage.getProfile();
    const logs = storage.getLogs();
    const { places, source, cacheAgeMin } = await this.fetchNearbyPlaces(profile);

    let cards = [];

    if ((source === 'cloud' || source === 'cache') && cloud.hasCloud()) {
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

    cards = decorateCards(cards);

    let emptyHint = '';
    if (!cards.length) {
      if (source === 'cloud') {
        emptyHint = '放宽到 2km 或刷新定位，再抽一轮';
      } else if (source === 'cache') {
        emptyHint = '缓存里暂无结果，刷新后再看天意';
      } else {
        emptyHint = '当前条件太严，放宽范围再试一次';
      }
    }

    this.setData({
      cards,
      source,
      cacheAgeMin: cacheAgeMin || 0,
      emptyHint,
      currentCardIndex: 0,
      loading: false,
      cardsVisible: true
    });
  },

  refreshCards() {
    this.setData({ pressedAction: '', cardsVisible: false });
    setTimeout(() => this.generateCards(), 140);
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

  chooseCurrentCard() {
    this.setData({ pressedAction: '' });
    const item = this.getCurrentCard();
    if (!item) return;
    this.chooseWithItem(item, 'choose');
  },

  rejectCurrentCard() {
    this.setData({ pressedAction: '' });
    const item = this.getCurrentCard();
    if (!item) return;

    const profile = storage.getProfile();
    const weights = { ...(profile.tasteWeights || {}) };
    (item.tags || []).forEach((tag) => {
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
    this.refreshCards();
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

  useMaxRadius() {
    const profile = storage.getProfile();
    if (profile.radiusKm === 2) {
      this.generateCards();
      return;
    }

    profile.radiusKm = 2;
    storage.setProfile(profile);
    this.setData({ radiusKm: 2, cardsVisible: false });
    setTimeout(() => this.generateCards(), 140);
  },

  async retryLocate() {
    try {
      await this.updateLocationFromSystem();
      this.setData({ cardsVisible: false });
      setTimeout(() => this.generateCards(), 140);
    } catch (err) {
      wx.showToast({ title: '定位失败，请检查权限', icon: 'none' });
      this.setData({ locationRequired: true });
    }
  }
});
