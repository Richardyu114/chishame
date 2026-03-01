const CACHE_KEY = 'chishame_nearby_cache_v1';
const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000; // 2h（可扩到6h）
const MAX_ENTRIES = 30;

function normalizeCoord(v) {
  return Number(v).toFixed(3); // ~100m 粒度，提升命中率
}

function makeKey({ lat, lng, radiusKm }) {
  return `${normalizeCoord(lat)}:${normalizeCoord(lng)}:${radiusKm}`;
}

function readCacheMap() {
  return wx.getStorageSync(CACHE_KEY) || {};
}

function writeCacheMap(map) {
  wx.setStorageSync(CACHE_KEY, map);
}

function prune(map) {
  const now = Date.now();
  const entries = Object.entries(map)
    .filter(([, v]) => v && v.expireAt > now && Array.isArray(v.places))
    .sort((a, b) => b[1].ts - a[1].ts)
    .slice(0, MAX_ENTRIES);

  const next = {};
  entries.forEach(([k, v]) => {
    next[k] = v;
  });
  return next;
}

function getNearby({ lat, lng, radiusKm }) {
  const key = makeKey({ lat, lng, radiusKm });
  const map = prune(readCacheMap());
  const hit = map[key];
  writeCacheMap(map);

  if (!hit) return { hit: false, places: [], ageMs: 0 };

  return {
    hit: true,
    places: hit.places,
    ageMs: Date.now() - hit.ts,
    key
  };
}

function setNearby({ lat, lng, radiusKm, places, ttlMs = DEFAULT_TTL_MS }) {
  const key = makeKey({ lat, lng, radiusKm });
  const now = Date.now();
  const map = prune(readCacheMap());

  map[key] = {
    ts: now,
    expireAt: now + Math.min(6 * 60 * 60 * 1000, Math.max(10 * 60 * 1000, ttlMs)),
    places: Array.isArray(places) ? places : []
  };

  writeCacheMap(prune(map));
}

function clearAll() {
  wx.removeStorageSync(CACHE_KEY);
}

module.exports = {
  DEFAULT_TTL_MS,
  getNearby,
  setNearby,
  clearAll
};
