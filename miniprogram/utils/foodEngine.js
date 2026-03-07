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

function buildCard(id, staple, protein, veggie, extra, quote, preferredFlavor) {
  const tags = Array.from(new Set([
    ...(staple.tags || []),
    ...(protein.tags || []),
    ...(veggie.tags || [])
  ])).slice(0, 3);

  const image = pickCardImage([
    staple.name,
    protein.name,
    veggie.name,
    extra.name
  ], tags, '/assets/food/dish.jpg');

  return {
    id: `meal_${id}`,
    title: `${protein.name} + ${staple.name}`,
    dishLine: `${veggie.name} · ${extra.name}`,
    staple: staple.name,
    protein: protein.name,
    veggie: veggie.name,
    extra: extra.name,
    tags,
    calories: estimateCalories(staple, protein, veggie, extra),
    reasons: explain(staple, protein, veggie, preferredFlavor),
    quote,
    image,
    shareText: `今天吃这个：${protein.name} + ${staple.name}，再配${veggie.name}。${quote.text}`
  };
}

function generateMealsLocal(profile = {}, count = 4) {
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

  const cards = [];
  for (let i = 0; i < count; i += 1) {
    const staple = safeStaples[i % safeStaples.length];
    const protein = safeProteins[(i + 1) % safeProteins.length];
    const veggie = safeVeggies[(i + 2) % safeVeggies.length];
    const extra = safeExtras[i % safeExtras.length];
    const quote = data.quotes[i % data.quotes.length];
    cards.push(buildCard(i + 1, staple, protein, veggie, extra, quote, preferredFlavor));
  }
  return shuffle(cards);
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

function pickCardImage(parts = [], tags = [], fallback = '/assets/food/dish.jpg') {
  const text = toLowerText(parts);
  const byKeyword = imageKeywordMap.find((row) => includesAny(text, row.keywords));
  if (byKeyword) return byKeyword.image;

  const imageTag = tags.find((t) => data.coverByTag[t]) || '日常';
  return data.coverByTag[imageTag] || fallback;
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

function buildRemoteCard(meal, quote, preferredFlavor, index) {
  const ingredients = extractIngredients(meal);
  const classified = classifyIngredients(ingredients);
  const fallback = pickFallbackLocalNames();
  const tags = buildRemoteTags(meal);

  const staple = classified.staple[0] || fallback.staple;
  const protein = classified.protein[0] || fallback.protein;
  const veggie = classified.veggie[0] || fallback.veggie;
  const extra = classified.extra[0] || fallback.extra;

  const image = /^https?:\/\//.test(meal.strMealThumb || '')
    ? meal.strMealThumb
    : pickCardImage([
      meal.strMeal,
      meal.strCategory,
      meal.strArea,
      ...ingredients
    ], tags, '/assets/food/dish.jpg');

  const safeQuote = quote || pickOne(data.quotes);
  const title = meal.strMeal || `${protein} + ${staple}`;

  return {
    id: `meal_remote_${meal.idMeal || index + 1}`,
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
    shareText: `今天吃这个：${title}（${protein} + ${staple}），再配${veggie}。${safeQuote.text}`
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

async function generateMealsRemote(profile = {}, count = 4) {
  const preferredFlavor = profile.preferredFlavor || '随机';
  const tabooTags = profile.tabooTags || [];

  const [meals, quotes] = await Promise.all([
    remoteContent.fetchRandomMeals(Math.max(5, count * 2)),
    remoteContent.fetchQuotes(Math.max(3, count))
  ]);

  if (!meals.length) return [];

  const noTaboo = meals.filter((meal) => !hitsTaboo(meal, tabooTags));
  const tabooSafe = noTaboo.length ? noTaboo : meals;

  const flavorMatched = tabooSafe.filter((meal) => matchPreferredFlavor(meal, preferredFlavor));
  const picked = shuffle(flavorMatched.length ? flavorMatched : tabooSafe).slice(0, count);

  if (!picked.length) return [];

  return picked.map((meal, idx) => buildRemoteCard(meal, quotes[idx % Math.max(1, quotes.length)], preferredFlavor, idx));
}

async function generateMeals(profile = {}, count = 4, logs = []) {
  const activeMealMode = profile.activeMealMode || personalize.resolveMealMode(profile.mealMode || '智能');
  const expandedCount = Math.max(count + 3, 6);

  // 默认中文优先：走本地结构化数据。
  const useRemote = profile.useRemote === true;

  if (useRemote) {
    try {
      const remoteCards = await withTimeout(generateMealsRemote(profile, expandedCount), REMOTE_BUDGET_MS);
      if (remoteCards.length >= count) {
        const modeCards = applyMealMode(remoteCards, activeMealMode);
        return applySevenDayDedupe(modeCards, logs, count);
      }
    } catch (err) {
      // 网络不可用或超时 -> 回退本地池
    }
  }

  const localCards = generateMealsLocal(profile, expandedCount);
  const modeCards = applyMealMode(localCards, activeMealMode);
  return applySevenDayDedupe(modeCards, logs, count);
}

module.exports = {
  generateMeals,
  generateMealsLocal,
  data
};
