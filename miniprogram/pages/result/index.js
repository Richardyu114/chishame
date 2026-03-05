const storage = require('../../utils/storage');

Page({
  data: {
    meal: null
  },

  onShow() {
    const meal = storage.getSelected();
    this.setData({ meal });
  },

  pickAgain() {
    wx.navigateBack();
  },

  toRecommend() {
    wx.switchTab({ url: '/pages/recommend/index' });
  },

  copyShareText() {
    const meal = this.data.meal;
    if (!meal) return;
    wx.setClipboardData({
      data: meal.shareText,
      success: () => {
        wx.showToast({ title: '分享文案已复制', icon: 'success' });
      }
    });
  }
});
