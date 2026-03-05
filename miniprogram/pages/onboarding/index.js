const storage = require('../../utils/storage');

const flavors = ['随机', '清淡', '均衡', '下饭', '浓香', '辛辣', '轻食'];
const allTabooTags = ['海鲜', '牛肉', '豆制品', '鸡蛋', '生冷', '辛辣'];

Page({
  data: {
    flavors,
    flavorIndex: 0,
    tabooTags: [],
    allTabooTags
  },

  onLoad() {
    const profile = storage.getProfile();
    if (profile.hasOnboarded) {
      wx.switchTab({ url: '/pages/recommend/index' });
      return;
    }

    this.setData({
      flavorIndex: Math.max(0, flavors.indexOf(profile.preferredFlavor || '随机')),
      tabooTags: profile.tabooTags || []
    });
  },

  onFlavorChange(e) {
    this.setData({ flavorIndex: Number(e.detail.value) });
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
      preferredFlavor: flavors[this.data.flavorIndex] || '随机',
      tabooTags: this.data.tabooTags
    };

    storage.setProfile(next);
    wx.switchTab({ url: '/pages/recommend/index' });
  }
});
