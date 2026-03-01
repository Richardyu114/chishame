const storage = require('../../utils/storage');

Page({
  data: {
    budgetMin: 20,
    budgetMax: 60,
    allTasteTags: ['米饭', '面食', '清淡', '辣', '快餐', '粤菜', '川菜', '火锅', '日料'],
    allTabooTags: ['生冷', '海鲜', '牛肉', '乳糖', '重油'],
    tasteTags: ['米饭', '面食'],
    tabooTags: [],
    city: '未定位',
    lastLocation: null
  },

  onLoad() {
    const profile = storage.getProfile();
    this.setData({
      budgetMin: profile.budgetMin,
      budgetMax: profile.budgetMax,
      tasteTags: profile.tasteTags || [],
      tabooTags: profile.tabooTags || [],
      city: profile.city || '未定位',
      lastLocation: profile.lastLocation || null
    });
  },

  requestLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const city = `定位成功(${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)})`;
        this.setData({
          city,
          lastLocation: {
            lat: res.latitude,
            lng: res.longitude
          }
        });
        wx.showToast({ title: '定位成功', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '定位失败，可稍后再试', icon: 'none' });
      }
    });
  },

  onBudgetMinChange(e) {
    this.setData({ budgetMin: Number(e.detail.value) });
  },

  onBudgetMaxChange(e) {
    this.setData({ budgetMax: Number(e.detail.value) });
  },

  toggleTaste(e) {
    const tag = e.currentTarget.dataset.tag;
    const tasteTags = [...this.data.tasteTags];
    const idx = tasteTags.indexOf(tag);
    if (idx >= 0) {
      tasteTags.splice(idx, 1);
    } else {
      tasteTags.push(tag);
    }
    this.setData({ tasteTags });
  },

  toggleTaboo(e) {
    const tag = e.currentTarget.dataset.tag;
    const tabooTags = [...this.data.tabooTags];
    const idx = tabooTags.indexOf(tag);
    if (idx >= 0) {
      tabooTags.splice(idx, 1);
    } else {
      tabooTags.push(tag);
    }
    this.setData({ tabooTags });
  },

  saveAndStart() {
    const profile = storage.getProfile();
    const next = {
      ...profile,
      hasOnboarded: true,
      budgetMin: Math.min(this.data.budgetMin, this.data.budgetMax),
      budgetMax: Math.max(this.data.budgetMin, this.data.budgetMax),
      tasteTags: this.data.tasteTags,
      tabooTags: this.data.tabooTags,
      city: this.data.city,
      lastLocation: this.data.lastLocation,
      radiusKm: 1,
      maxRadiusKm: 2,
      dineInOnly: true
    };

    const weights = { ...(next.tasteWeights || {}) };
    next.tasteTags.forEach(tag => {
      weights[tag] = Math.max(1, weights[tag] || 0);
    });
    next.tasteWeights = weights;

    storage.setProfile(next);
    wx.switchTab({ url: '/pages/recommend/index' });
  }
});
