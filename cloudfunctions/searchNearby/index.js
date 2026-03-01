const https = require('https');

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw || '{}'));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });
}

function estimatePrice(name = '') {
  if (/日料|寿司|烤肉|牛排/.test(name)) return 80;
  if (/火锅|烤鱼|海鲜/.test(name)) return 65;
  if (/快餐|粉|面|饺子|麻辣烫|便当/.test(name)) return 30;
  return 45;
}

function inferTags(name = '', category = '') {
  const seed = `${name} ${category}`;
  const tags = [];
  if (/面|粉/.test(seed)) tags.push('面食');
  if (/饭|盖浇|便当/.test(seed)) tags.push('米饭');
  if (/川|湘|麻辣|火锅/.test(seed)) tags.push('辣');
  if (/粤|清汤|粥|蒸/.test(seed)) tags.push('清淡');
  if (/快餐|便当|小吃|粉面/.test(seed)) tags.push('快餐');
  if (/川/.test(seed)) tags.push('川菜');
  if (/粤/.test(seed)) tags.push('粤菜');
  if (/日|寿司/.test(seed)) tags.push('日料');
  if (!tags.length) tags.push('米饭');
  return Array.from(new Set(tags));
}

exports.main = async (event = {}) => {
  const lat = Number(event.lat);
  const lng = Number(event.lng);
  const radiusKm = Math.min(2, Math.max(1, Number(event.radiusKm || 1)));
  const keyword = encodeURIComponent(event.keyword || '餐饮');

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return {
      ok: false,
      message: 'lat/lng 缺失，无法检索附近餐饮',
      data: []
    };
  }

  const key = process.env.TENCENT_MAP_KEY;
  if (!key) {
    return {
      ok: false,
      message: '未配置 TENCENT_MAP_KEY，返回空结果（前端会自动兜底到 mock）',
      data: []
    };
  }

  try {
    const radiusMeter = radiusKm * 1000;
    const boundary = encodeURIComponent(`nearby(${lat},${lng},${radiusMeter},0)`);
    const url = `https://apis.map.qq.com/ws/place/v1/search?keyword=${keyword}&boundary=${boundary}&orderby=_distance&page_size=20&page_index=1&key=${key}`;

    const data = await httpGetJson(url);
    if (data.status !== 0) {
      return {
        ok: false,
        message: `腾讯地图 API 异常: ${data.message || 'unknown'}`,
        data: []
      };
    }

    const places = (data.data || []).map((item) => {
      const distanceKm = Number((item._distance / 1000).toFixed(2));
      return {
        id: String(item.id || item.title),
        name: item.title,
        address: item.address || '',
        distanceKm,
        avgPrice: estimatePrice(item.title),
        tags: inferTags(item.title, item.category)
      };
    });

    return {
      ok: true,
      message: 'ok',
      data: places
    };
  } catch (err) {
    return {
      ok: false,
      message: `searchNearby 失败: ${err.message || err}`,
      data: []
    };
  }
};
