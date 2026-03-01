const storage = require('../../utils/storage');

Page({
  data: {
    place: null
  },

  onShow() {
    const place = storage.getSelected();
    this.setData({ place });
  },

  goThere() {
    const place = this.data.place;
    if (!place) return;
    wx.showModal({
      title: '去这里',
      content: `后续接入腾讯地图导航\n目的地：${place.name}`,
      showCancel: false
    });
  },

  pickAgain() {
    wx.navigateBack();
  },

  toRecommend() {
    wx.switchTab({ url: '/pages/recommend/index' });
  }
});
