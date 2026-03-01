App({
  globalData: {
    cloudReady: false
  },

  onLaunch() {
    const storage = require('./utils/storage');
    storage.ensureDefaults();

    if (!wx.cloud) {
      console.warn('当前基础库不支持云能力，将使用本地兜底逻辑');
      return;
    }

    try {
      wx.cloud.init({
        traceUser: true
        // env: 'your-cloud-env-id'
      });
      this.globalData.cloudReady = true;
    } catch (err) {
      console.warn('云能力初始化失败，将使用本地兜底逻辑', err);
      this.globalData.cloudReady = false;
    }
  }
});
