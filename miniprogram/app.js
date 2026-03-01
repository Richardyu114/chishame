App({
  onLaunch() {
    const storage = require('./utils/storage');
    storage.ensureDefaults();
  }
});
