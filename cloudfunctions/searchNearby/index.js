// 云函数占位：后续接入腾讯地图 POI 检索
// 需要环境变量：TENCENT_MAP_KEY
exports.main = async (event) => {
  const { lat, lng, radiusKm = 1 } = event || {};
  return {
    ok: true,
    message: 'searchNearby 占位函数，后续接腾讯地图 POI。',
    input: { lat, lng, radiusKm },
    data: []
  };
};
