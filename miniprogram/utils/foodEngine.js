const data = require('./foodData');
const remoteContent = require('./remoteContent');
const personalize = require('./personalize');

const flavorKeywords = {
  清淡: ['light', 'steam', 'steamed', 'salad', 'soup', 'boiled', '清淡', '蒸', '汤'],
  下饭: ['curry', 'stew', 'fried', 'braised', 'sauce', '下饭', '红烧'],
  浓香: ['butter', 'cream', 'cheese', 'roast', 'bbq', '浓香', '芝士'],
  辛辣: ['spicy', 'chili', 'pepper', 'hot', 'masala', '辛辣', '麻辣', '辣'],
  轻食: ['vegetarian', 'vegan', 'salad', 'light', '轻食']
};

const tabooKeywords = {
  海鲜: ['fish', 'shrimp', 'prawn', 'crab', 'squid', 'clam', 'mussel', 'oyster', 'seafood', '海鲜', '鱼', '虾', '蟹', '鱿鱼'],
  牛肉: ['beef', 'veal', '牛肉', '牛腩'],
  豆制品: ['tofu', 'soy', 'bean curd', '豆腐', '豆制品', '黄豆'],
  鸡蛋: ['egg', 'omelette', '鸡蛋', '蛋'],
  生冷: ['raw', 'cold', 'salad', 'sashimi', '生冷', '凉拌'],
  辛辣: ['spicy', 'chili', 'pepper', 'hot', 'curry', '辛辣', '麻辣', '辣椒']
};

const stapleWords = [
  'rice', 'risotto', 'noodle', 'pasta', 'bread', 'bun', 'dumpling', 'potato', 'corn', 'oat', 'quinoa',
  '米饭', '面', '粉', '粥', '馒头', '饺', '土豆', '红薯', '玉米', '杂粮'
];

const proteinWords = [
  'chicken', 'beef', 'pork', 'fish', 'shrimp', 'prawn', 'egg', 'tofu', 'duck', 'lamb', 'mutton', 'turkey',
  '鸡肉', '牛肉', '猪肉', '鱼', '虾', '鸡蛋', '豆腐', '鸭肉', '羊肉'
];

const imageKeywordMap = [
  { keywords: ['noodle', 'pasta', 'ramen', '面', '粉'], image: '/assets/food/noodle.jpg' },
  { keywords: ['sushi', 'fish', 'shrimp', 'prawn', 'seafood', '寿司', '鱼', '虾', '海鲜'], image: '/assets/food/sushi.jpg' },
  { keywords: ['spicy', 'chili', 'pepper', 'curry', 'hot', '辣', '麻辣', '咖喱'], image: '/assets/food/spicy.jpg' },
  { keywords: ['hotpot', 'stew', 'braised', 'roast', '锅', '炖', '红烧'], image: '/assets/food/hotpot.jpg' },
  { keywords: ['salad', 'vegetable', 'veggie', 'light', '轻食', '蔬菜', '沙拉'], image: '/assets/food/salad.jpg' }
];

const REMOTE_BUDGET_MS = 1600;

const veggieWords = [
  'broccoli', 'lettuce', 'spinach', 'cabbage', 'carrot', 'onion', 'tomato', 'pepper', 'mushroom', 'cucumber',
  'zucchini', 'aubergine', 'eggplant', 'greens', 'vegetable',
  '西兰花', '生菜', '菠菜', '白菜', '胡萝卜', '洋葱', '番茄', '青椒', '菌菇', '黄瓜', '茄子', '蔬菜'
];

const relatedImageMap = {
  '/assets/food/noodle.jpg': ['/assets/food/noodle.jpg', '/assets/food/dish.jpg'],
  '/assets/food/sushi.jpg': ['/assets/food/sushi.jpg', '/assets/food/dish.jpg'],
  '/assets/food/spicy.jpg': ['/assets/food/spicy.jpg', '/assets/food/hotpot.jpg', '/assets/food/dish.jpg'],
  '/assets/food/hotpot.jpg': ['/assets/food/hotpot.jpg', '/assets/food/spicy.jpg', '/assets/food/dish.jpg'],
  '/assets/food/salad.jpg': ['/assets/food/salad.jpg', '/assets/food/dish.jpg'],
  '/assets/food/dish.jpg': ['/assets/food/dish.jpg']
};

function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(arr) {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function normalizeSet(rows = []) {
  return new Set((Array.isArray(rows) ? rows : [])
    .map((row) => String(row || '').trim())
    .filter(Boolean));
}

function hashString(text = '') {
  let hash = 0;
  const source = String(text || '');
  for (let i = 0; i < source.length; i += 1) {
    hash = ((hash << 5) - hash) + source.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickBySeed(pool = [], seedText = '') {
  if (!pool.length) return '';
  const idx = hashString(seedText || `${Date.now()}`) % pool.length;
  return pool[idx];
}

function includeByFlavor(item, preferredFlavor) {
  if (!preferredFlavor || preferredFlavor === '随机') return true;
  if (preferredFlavor === '均衡') return true;
  return (item.tags || []).includes(preferredFlavor);
}

function notTaboo(item, tabooTags = []) {
  if (!tabooTags.length) return true;
  const itemTaboos = item.tabooTags || [];
  return !itemTaboos.some((tag) => tabooTags.includes(tag));
}

function estimateCalories(staple, protein, veggie, extra) {
  const base = 320;
  const stapleScore = staple.tags.includes('轻食') ? -70 : 40;
  const proteinScore = protein.tags.includes('浓香') ? 90 : 40;
  const veggieScore = veggie.tags.includes('轻食') ? -20 : 10;
  const extraScore = extra.name.includes('水果') ? 20 : extra.name.includes('酸奶') ? 35 : 50;
  return Math.max(360, base + stapleScore + proteinScore + veggieScore + extraScore);
}

function explain(staple, protein, veggie, preferredFlavor) {
  const hints = ['主食 + 蛋白 + 蔬菜结构完整'];
  if (preferredFlavor && preferredFlavor !== '随机') {
    hints.push(`贴近你的${preferredFlavor}口味`);
  }
  if ((veggie.tags || []).includes('清淡')) {
    hints.push('蔬菜比例更友好');
  }
  return hints.slice(0, 3);
}

function includesAny(text, keywords = []) {
  return keywords.some((key) => text.includes(key));
}

function toLowerText(parts = []) {
  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getImageCandidates(parts = [], tags = [], fallback = '/assets/food/dish.jpg') {
  const text = toLowerText(parts);
  const keywordImages = imageKeywordMap
    .filter((row) => includesAny(text, row.keywords))
    .map((row) => row.image);

  const tagImages = tags
    .map((tag) => data.coverByTag[tag])
    .filter(Boolean);

  const base = Array.from(new Set([
    ...keywordImages,
    ...tagImages,
    fallback
  ].filter(Boolean)));

  // 语义扩展：仅在同类图池中轮换，避免“食材与背景图不对应”。
  const expanded = [];
  base.forEach((img) => {
    const related = relatedImageMap[img] || [img];
    expanded.push(...related);
  });

  return Array.from(new Set(expanded.filter(Boolean)));
}

function pickCardImage(parts = [], tags = [], fallback = '/assets/food/dish.jpg', options = {}) {
  const avoidImageSet = options.avoidImageSet || new Set();
  const candidates = getImageCandidates(parts, tags, fallback);
  if (!candidates.length) return fallback;

  const semanticFreshPool = candidates.filter((src) => !avoidImageSet.has(src));
  const semanticPool = semanticFreshPool.length ? semanticFreshPool : candidates;
  return pickBySeed(semanticPool, options.seedText || toLowerText(parts));
}

function buildMealSignatureByParts(title = '', protein = '', staple = '', veggie = '') {
  return [title, protein, staple, veggie]
    .map((row) => String(row || '').toLowerCase().trim())
    .filter(Boolean)
    .join('|');
}

function buildMealSignature(card = {}) {
  return buildMealSignatureByParts(card.title, card.protein, card.staple, card.veggie);
}

function buildCard(id, staple, protein, veggie, extra, quote, preferredFlavor, options = {}) {
  const tags = Array.from(new Set([
    ...(staple.tags || []),
    ...(protein.tags || []),
    ...(veggie.tags || [])
  ])).slice(0, 3);

  const title = `${protein.name} + ${staple.name}`;
  const dishLine = `${veggie.name} · ${extra.name}`;
  const signature = buildMealSignatureByParts(title, protein.name, staple.name, veggie.name);

  const image = pickCardImage([
    title,
    dishLine,
    staple.name,
    protein.name,
    veggie.name,
    extra.name
  ], tags, '/assets/food/dish.jpg', {
    avoidImageSet: options.avoidImageSet,
    seedText: options.seedText || signature
  });

  return {
    id: `meal_${id}`,
    title,
    dishLine,
    staple: staple.name,
    protein: protein.name,
    veggie: veggie.name,
    extra: extra.name,
    tags,
    calories: estimateCalories(staple, protein, veggie, extra),
    reasons: explain(staple, protein, veggie, preferredFlavor),
    quote,
    image,
    shareText: `今日本席：${title}，辅以${veggie.name}。${quote.text}`
  };
}

function scoreCardFreshness(card = {}, history = {}) {
  const mealSet = normalizeSet(history.mealSignatures || []);
  const quoteSet = normalizeSet(history.quoteTexts || []);
  const imageSet = normalizeSet(history.imageKeys || []);

  let score = Math.random();
  const signature = buildMealSignature(card);

  if (signature && !mealSet.has(signature)) score += 4;
  if (card.quote && card.quote.text && !quoteSet.has(card.quote.text)) score += 2;
  if (card.image && !imageSet.has(card.image)) score += 1.8;

  return score;
}

function pickFreshQuote(quotePool = [], recentQuoteSet = new Set(), usedQuoteSet = new Set()) {
  if (!quotePool.length) {
    return { text: '民以食为天。', from: '《汉书》' };
  }

  const firstRound = quotePool.filter((quote) => {
    const text = String((quote && quote.text) || '');
    return text && !recentQuoteSet.has(text) && !usedQuoteSet.has(text);
  });
  if (firstRound.length) {
    const picked = pickOne(firstRound);
    usedQuoteSet.add(picked.text);
    return picked;
  }

  const secondRound = quotePool.filter((quote) => {
    const text = String((quote && quote.text) || '');
    return text && !usedQuoteSet.has(text);
  });
  if (secondRound.length) {
    const picked = pickOne(secondRound);
    usedQuoteSet.add(picked.text);
    return picked;
  }

  const fallback = pickOne(quotePool);
  if (fallback && fallback.text) usedQuoteSet.add(fallback.text);
  return fallback || { text: '民以食为天。', from: '《汉书》' };
}

function assignDistinctImages(cards = [], history = {}) {
  if (!cards.length) return cards;

  const imageSet = normalizeSet(history.imageKeys || []);
  const usedInBatch = new Set();

  return cards.map((card) => {
    if (!card) return card;

    if (/^https?:\/\//.test(card.image || '')) {
      return card;
    }

    const nextImage = pickCardImage(
      [card.title, card.dishLine, card.staple, card.protein, card.veggie, card.extra],
      card.tags || [],
      '/assets/food/dish.jpg',
      {
        avoidImageSet: new Set([...imageSet, ...usedInBatch]),
        seedText: `${card.id || ''}|${card.title || ''}`
      }
    );

    usedInBatch.add(nextImage);
    return { ...card, image: nextImage };
  });
}

function generateMealsLocal(profile = {}, count = 4, history = {}) {
  const preferredFlavor = profile.preferredFlavor || '随机';
  const tabooTags = profile.tabooTags || [];

  const staples = shuffle(data.staples).filter((item) => includeByFlavor(item, preferredFlavor));
  const proteins = shuffle(data.proteins).filter((item) => includeByFlavor(item, preferredFlavor) && notTaboo(item, tabooTags));
  const veggies = shuffle(data.veggies).filter((item) => includeByFlavor(item, preferredFlavor) && notTaboo(item, tabooTags));
  const extras = shuffle(data.extras);

  const safeStaples = staples.length ? staples : data.staples;
  const safeProteins = proteins.length ? proteins : data.proteins.filter((item) => notTaboo(item, tabooTags));
  const safeVeggies = veggies.length ? veggies : data.veggies.filter((item) => notTaboo(item, tabooTags));
  const safeExtras = extras.length ? extras : data.extras;

  const recentQuoteSet = normalizeSet(history.quoteTexts || []);
  const quotePool = shuffle(data.quotes);
  const usedQuoteSet = new Set();
  const avoidImageSet = normalizeSet(history.imageKeys || []);

  const candidateTarget = Math.max(count * 8, 24);
  const attempts = candidateTarget * 3;
  const candidateMap = new Map();

  for (let i = 0; i < attempts; i += 1) {
    const staple = pickOne(safeStaples);
    const protein = pickOne(safeProteins);
    const veggie = pickOne(safeVeggies);
    const extra = pickOne(safeExtras);
    const quote = pickFreshQuote(quotePool, recentQuoteSet, usedQuoteSet);

    const card = buildCard(i + 1, staple, protein, veggie, extra, quote, preferredFlavor, {
      avoidImageSet,
      seedText: `${protein.name}|${staple.name}|${veggie.name}|${extra.name}|${i}`
    });

    const signature = buildMealSignature(card);
    if (!signature || candidateMap.has(signature)) continue;

    candidateMap.set(signature, card);
    if (candidateMap.size >= candidateTarget) break;
  }

  const candidates = [...candidateMap.values()];
  if (!candidates.length) return [];

  const scored = candidates
    .map((card) => ({ card, score: scoreCardFreshness(card, history) }))
    .sort((a, b) => b.score - a.score)
    .map((row) => row.card);

  const picked = scored.slice(0, count);
  const filled = picked.length >= count
    ? picked
    : [...picked, ...shuffle(candidates).slice(0, Math.max(0, count - picked.length))];

  return shuffle(assignDistinctImages(filled.slice(0, count), history));
}

function extractIngredients(meal = {}) {
  const list = [];
  for (let i = 1; i <= 20; i += 1) {
    const key = `strIngredient${i}`;
    const value = String(meal[key] || '').trim();
    if (value) list.push(value);
  }
  return list;
}

function classifyIngredients(ingredients = []) {
  const staple = [];
  const protein = [];
  const veggie = [];
  const extra = [];

  ingredients.forEach((row) => {
    const lower = row.toLowerCase();
    if (includesAny(lower, stapleWords)) {
      staple.push(row);
      return;
    }
    if (includesAny(lower, proteinWords)) {
      protein.push(row);
      return;
    }
    if (includesAny(lower, veggieWords)) {
      veggie.push(row);
      return;
    }
    extra.push(row);
  });

  return {
    staple,
    protein,
    veggie,
    extra
  };
}

function buildRemoteTags(meal = {}) {
  const text = toLowerText([meal.strMeal, meal.strCategory, meal.strArea, meal.strTags]);
  const tags = ['均衡'];

  if (includesAny(text, flavorKeywords.辛辣)) tags.push('辛辣', '下饭');
  if (includesAny(text, flavorKeywords.清淡)) tags.push('清淡');
  if (includesAny(text, flavorKeywords.轻食)) tags.push('轻食');
  if (includesAny(text, flavorKeywords.浓香)) tags.push('浓香');
  if (includesAny(text, flavorKeywords.下饭)) tags.push('下饭');

  if (!tags.includes('清淡') && !tags.includes('辛辣')) {
    tags.push('日常');
  }

  return Array.from(new Set(tags)).slice(0, 4);
}

function hitsTaboo(meal = {}, tabooTags = []) {
  if (!tabooTags.length) return false;
  const ingredients = extractIngredients(meal);
  const text = toLowerText([meal.strMeal, meal.strCategory, meal.strTags, ...ingredients]);

  return tabooTags.some((tag) => includesAny(text, tabooKeywords[tag] || []));
}

function matchPreferredFlavor(meal = {}, preferredFlavor = '随机') {
  if (!preferredFlavor || preferredFlavor === '随机' || preferredFlavor === '均衡') return true;
  const tags = buildRemoteTags(meal);
  if (tags.includes(preferredFlavor)) return true;

  const text = toLowerText([meal.strMeal, meal.strCategory, meal.strTags]);
  return includesAny(text, flavorKeywords[preferredFlavor] || []);
}

function estimateRemoteCalories(tags = [], ingredients = []) {
  let calories = 420;
  if (tags.includes('轻食') || tags.includes('清淡')) calories -= 55;
  if (tags.includes('浓香') || tags.includes('下饭')) calories += 70;
  if (tags.includes('辛辣')) calories += 25;
  calories += Math.min(90, ingredients.length * 8);
  return Math.max(340, calories);
}

function buildRemoteReasons(tags = [], preferredFlavor) {
  const reasons = ['来自在线菜谱库，减少重复感'];
  if (preferredFlavor && preferredFlavor !== '随机') {
    reasons.push(`贴近你的${preferredFlavor}口味`);
  }
  if (tags.includes('清淡') || tags.includes('轻食')) {
    reasons.push('整体负担相对更轻');
  } else {
    reasons.push('满足感更强，适合工作日补能');
  }
  return reasons.slice(0, 3);
}

function pickFallbackLocalNames() {
  return {
    staple: pickOne(data.staples).name,
    protein: pickOne(data.proteins).name,
    veggie: pickOne(data.veggies).name,
    extra: pickOne(data.extras).name
  };
}

function buildRemoteCard(meal, quote, preferredFlavor, index, options = {}) {
  const ingredients = extractIngredients(meal);
  const classified = classifyIngredients(ingredients);
  const fallback = pickFallbackLocalNames();
  const tags = buildRemoteTags(meal);

  const staple = classified.staple[0] || fallback.staple;
  const protein = classified.protein[0] || fallback.protein;
  const veggie = classified.veggie[0] || fallback.veggie;
  const extra = classified.extra[0] || fallback.extra;

  const defaultImage = pickCardImage([
    meal.strMeal,
    meal.strCategory,
    meal.strArea,
    ...ingredients
  ], tags, '/assets/food/dish.jpg', {
    avoidImageSet: options.avoidImageSet,
    seedText: `${meal.idMeal || index + 1}|${meal.strMeal || ''}`
  });

  const image = /^https?:\/\//.test(meal.strMealThumb || '')
    ? meal.strMealThumb
    : defaultImage;

  const safeQuote = quote || pickOne(data.quotes);
  const title = meal.strMeal || `${protein} + ${staple}`;

  return {
    id: `meal_remote_${meal.idMeal || index + 1}`,
    remoteMealId: String(meal.idMeal || ''),
    title,
    dishLine: `${veggie} · ${extra}`,
    staple,
    protein,
    veggie,
    extra,
    tags: tags.slice(0, 3),
    calories: estimateRemoteCalories(tags, ingredients),
    reasons: buildRemoteReasons(tags, preferredFlavor),
    quote: safeQuote,
    image,
    shareText: `今日本席：${title}（${protein} + ${staple}），辅以${veggie}。${safeQuote.text}`
  };
}

function applyMealMode(cards = [], activeMealMode = '午餐') {
  return cards.map((card) => {
    const reasons = Array.isArray(card.reasons) ? [...card.reasons] : [];
    const next = { ...card };

    if (activeMealMode === '午餐') {
      next.calories = Math.max(320, Number(next.calories || 0) - 45);
      reasons.push('午餐模式：口味更清爽');
    } else if (activeMealMode === '晚餐') {
      next.calories = Math.max(360, Number(next.calories || 0) + 35);
      reasons.push('晚餐模式：满足感更强');
    }

    next.reasons = reasons.slice(0, 3);
    next.mealMode = activeMealMode;
    return next;
  });
}

function applySevenDayDedupe(cards = [], logs = [], count = 4) {
  if (!cards.length) return [];
  const proteinSet = personalize.getRecentProteinSet(logs, 7);
  if (!proteinSet.size) return shuffle(cards).slice(0, count);

  const fresh = [];
  const repeat = [];

  cards.forEach((card) => {
    const protein = String(card.protein || '').toLowerCase();
    if (protein && proteinSet.has(protein)) {
      repeat.push(card);
      return;
    }
    fresh.push(card);
  });

  return shuffle([...fresh, ...repeat]).slice(0, count);
}

function withTimeout(promise, timeoutMs = REMOTE_BUDGET_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('remote timeout')), timeoutMs))
  ]);
}

function dedupeQuotes(quotes = []) {
  const map = new Map();
  quotes.forEach((quote) => {
    const text = String((quote && quote.text) || '').trim();
    if (!text || map.has(text)) return;
    map.set(text, {
      text,
      from: String((quote && quote.from) || '').trim() || '古诗文'
    });
  });
  return [...map.values()];
}

async function generateMealsRemote(profile = {}, count = 4, history = {}) {
  const preferredFlavor = profile.preferredFlavor || '随机';
  const tabooTags = profile.tabooTags || [];

  const [meals, quotes] = await Promise.all([
    remoteContent.fetchRandomMeals(Math.max(10, count * 3)),
    remoteContent.fetchQuotes(Math.max(6, count * 2))
  ]);

  if (!meals.length) return [];

  const noTaboo = meals.filter((meal) => !hitsTaboo(meal, tabooTags));
  const tabooSafe = noTaboo.length ? noTaboo : meals;

  const recentRemoteSet = normalizeSet(history.remoteMealIds || []);
  const recentQuoteSet = normalizeSet(history.quoteTexts || []);
  const imageHistorySet = normalizeSet(history.imageKeys || []);

  const freshRemote = tabooSafe.filter((meal) => !recentRemoteSet.has(String(meal.idMeal || '')));
  const freshnessPool = freshRemote.length >= count ? freshRemote : tabooSafe;

  const flavorMatched = freshnessPool.filter((meal) => matchPreferredFlavor(meal, preferredFlavor));
  const pickedPool = flavorMatched.length ? flavorMatched : freshnessPool;
  const picked = shuffle(pickedPool).slice(0, count);

  if (!picked.length) return [];

  const quotePool = dedupeQuotes([...(quotes || []), ...(data.quotes || [])]);
  const usedQuoteSet = new Set();
  const usedImageSet = new Set();

  return picked.map((meal, idx) => {
    const quote = pickFreshQuote(quotePool, recentQuoteSet, usedQuoteSet);
    const card = buildRemoteCard(meal, quote, preferredFlavor, idx, {
      avoidImageSet: new Set([...imageHistorySet, ...usedImageSet]),
      seedText: `${meal.idMeal || ''}|${meal.strMeal || ''}|${idx}`
    });

    usedImageSet.add(card.image);
    return card;
  });
}

async function generateMeals(profile = {}, count = 4, logs = [], history = {}) {
  const activeMealMode = profile.activeMealMode || personalize.resolveMealMode(profile.mealMode || '智能');
  const expandedCount = Math.max(count + 3, 6);

  // 网络优先：先拉远端内容，不可用时自动回退本地池。
  try {
    const remoteCards = await withTimeout(generateMealsRemote(profile, expandedCount, history), REMOTE_BUDGET_MS);
    if (remoteCards.length >= count) {
      const modeCards = applyMealMode(remoteCards, activeMealMode);
      return applySevenDayDedupe(modeCards, logs, count);
    }
  } catch (err) {
    // 网络不可用或超时 -> 回退本地池
  }

  const localCards = generateMealsLocal(profile, expandedCount, history);
  const modeCards = applyMealMode(localCards, activeMealMode);
  return applySevenDayDedupe(modeCards, logs, count);
}

module.exports = {
  generateMeals,
  generateMealsLocal,
  data
};
