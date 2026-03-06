const flavorTags = ['清淡', '均衡', '下饭', '浓香', '辛辣', '轻食'];

function resolveMealMode(profileMode = '智能', date = new Date()) {
  if (profileMode === '午餐' || profileMode === '晚餐') return profileMode;
  const hour = date.getHours();
  return hour < 16 ? '午餐' : '晚餐';
}

function buildFlavorDrift(logs = []) {
  const counters = {};
  flavorTags.forEach((tag) => {
    counters[tag] = 0;
  });

  logs.slice(0, 24).forEach((log) => {
    const tags = Array.isArray(log.tags) ? log.tags : [];
    tags.forEach((tag) => {
      if (counters[tag] !== undefined) {
        counters[tag] += 1;
      }
    });
  });

  const rows = Object.entries(counters).sort((a, b) => b[1] - a[1]);
  const [topTag, topCount] = rows[0] || ['', 0];
  const total = rows.reduce((acc, row) => acc + row[1], 0);

  if (!topTag || topCount <= 0 || total < 4) {
    return {
      topTag: '',
      text: '口味画像还在形成中，先多翻几页看看。'
    };
  }

  const ratio = topCount / total;
  if (ratio >= 0.45) {
    return {
      topTag,
      text: `最近明显偏${topTag}，推荐会优先贴近这类风味。`
    };
  }

  return {
    topTag,
    text: `最近轻微偏${topTag}，整体口味仍然比较均衡。`
  };
}

function getRecentProteinSet(logs = [], days = 7) {
  const cutoff = Date.now() - days * 24 * 3600 * 1000;
  const set = new Set();

  logs.forEach((log) => {
    if (!log || Number(log.ts || 0) < cutoff) return;

    if (log.protein) {
      set.add(String(log.protein).toLowerCase());
      return;
    }

    const title = String(log.mealTitle || '');
    if (title.includes('+')) {
      const protein = title.split('+')[0].trim();
      if (protein) set.add(protein.toLowerCase());
    }
  });

  return set;
}

module.exports = {
  resolveMealMode,
  buildFlavorDrift,
  getRecentProteinSet,
  flavorTags
};
