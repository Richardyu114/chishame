function within3Days(tsA, tsB) {
  const THREE_DAYS = 3 * 24 * 3600 * 1000;
  return Math.abs(tsA - tsB) <= THREE_DAYS;
}

function calcRepeatPenalty(place, logs, nowTs) {
  const recentSelect = logs.find(
    (l) => l.action === 'choose' && l.placeId === place.id && within3Days(nowTs, l.ts)
  );
  return recentSelect ? 100 : 0;
}

function calcTasteMatch(place, tasteWeights = {}) {
  return (place.tags || []).reduce((acc, tag) => acc + (tasteWeights[tag] || 0), 0);
}

function calcBudgetMatch(place, profile) {
  if (place.avgPrice >= profile.budgetMin && place.avgPrice <= profile.budgetMax) return 20;
  const delta = Math.min(
    Math.abs(place.avgPrice - profile.budgetMin),
    Math.abs(place.avgPrice - profile.budgetMax)
  );
  return Math.max(0, 16 - delta);
}

function calcDistanceScore(place, profile) {
  if (place.distanceKm > profile.radiusKm) return -40;
  return Math.round((profile.radiusKm - place.distanceKm) * 12 + 8);
}

function calcFreshness(place, logs) {
  const hit = logs.find((l) => l.placeId === place.id && l.action === 'choose');
  if (!hit) return 10;
  const days = Math.floor((Date.now() - hit.ts) / (24 * 3600 * 1000));
  return Math.min(8, days);
}

function calcExploreBonus(place, logs) {
  const count = logs.filter((l) => l.placeId === place.id && l.action === 'choose').length;
  return count === 0 ? 4 : 0;
}

function scorePlace(place, profile, logs) {
  const nowTs = Date.now();
  const tasteMatch = calcTasteMatch(place, profile.tasteWeights || {});
  const budgetMatch = calcBudgetMatch(place, profile);
  const distanceScore = calcDistanceScore(place, profile);
  const freshness = calcFreshness(place, logs);
  const repeatPenalty = calcRepeatPenalty(place, logs, nowTs);
  const exploreBonus = calcExploreBonus(place, logs);

  const score = tasteMatch + budgetMatch + distanceScore + freshness - repeatPenalty + exploreBonus;

  return {
    ...place,
    score,
    reason: [
      budgetMatch >= 16 ? '预算匹配' : '预算接近',
      place.distanceKm <= profile.radiusKm ? '距离合适' : '距离稍远',
      repeatPenalty > 0 ? '近期吃过（已惩罚）' : '最近3天没吃过'
    ]
  };
}

exports.main = async (event = {}) => {
  const places = Array.isArray(event.places) ? event.places : [];
  const logs = Array.isArray(event.logs) ? event.logs : [];
  const profile = event.profile || {};

  if (!places.length) {
    return {
      ok: true,
      message: 'empty places',
      data: []
    };
  }

  const normalizedProfile = {
    budgetMin: Number(profile.budgetMin || 20),
    budgetMax: Number(profile.budgetMax || 60),
    radiusKm: Math.min(2, Math.max(1, Number(profile.radiusKm || 1))),
    tasteWeights: profile.tasteWeights || {},
    tabooTags: profile.tabooTags || []
  };

  const taboo = new Set(normalizedProfile.tabooTags || []);
  const filtered = places.filter((p) => !(p.tags || []).some((tag) => taboo.has(tag)));
  const source = filtered.length ? filtered : places;

  const scored = source.map((p) => scorePlace(p, normalizedProfile, logs));
  scored.sort((a, b) => b.score - a.score);

  const stable = scored.slice(0, 2);
  const rest = scored.slice(2);
  const explore = rest.length > 0 ? rest[Math.floor(Math.random() * rest.length)] : scored[2];

  const picks = [...stable];
  if (explore) picks.push(explore);

  return {
    ok: true,
    message: 'ok',
    data: picks.slice(0, 3)
  };
};
