let cloud = null;
try {
  cloud = require('wx-server-sdk');
  cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
} catch (err) {
  // 本地调试场景可能没有安装 wx-server-sdk
}

exports.main = async (event = {}) => {
  const payload = {
    ts: event.ts || Date.now(),
    action: event.action || 'unknown',
    placeId: event.placeId || '',
    placeName: event.placeName || '',
    tags: event.tags || [],
    radiusKm: event.radiusKm || 1
  };

  // 优先写云数据库 feedback_logs；失败时返回兜底成功，避免阻塞主流程。
  if (cloud) {
    try {
      const db = cloud.database();
      const wxContext = cloud.getWXContext();
      await db.collection('feedback_logs').add({
        data: {
          ...payload,
          openid: wxContext.OPENID || '',
          appid: wxContext.APPID || '',
          createdAt: db.serverDate()
        }
      });
      return {
        ok: true,
        stored: true,
        message: 'feedback persisted'
      };
    } catch (err) {
      return {
        ok: true,
        stored: false,
        message: `db write skipped: ${err.message || err}`,
        data: payload
      };
    }
  }

  return {
    ok: true,
    stored: false,
    message: 'wx-server-sdk unavailable, feedback accepted without persistence',
    data: payload
  };
};
