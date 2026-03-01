function hasCloud() {
  return !!(wx.cloud && typeof wx.cloud.callFunction === 'function');
}

function callFunction(name, data = {}) {
  return new Promise((resolve, reject) => {
    if (!hasCloud()) {
      reject(new Error('cloud unavailable'));
      return;
    }

    wx.cloud.callFunction({
      name,
      data,
      success: (res) => resolve(res.result || {}),
      fail: (err) => reject(err)
    });
  });
}

async function searchNearby(payload) {
  return callFunction('searchNearby', payload);
}

async function recommend(payload) {
  return callFunction('recommend', payload);
}

async function feedback(payload) {
  try {
    return await callFunction('feedback', payload);
  } catch (err) {
    return { ok: false, message: String(err && err.message ? err.message : err) };
  }
}

module.exports = {
  hasCloud,
  searchNearby,
  recommend,
  feedback
};
