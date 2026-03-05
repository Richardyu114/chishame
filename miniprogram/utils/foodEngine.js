const data = require('./foodData');

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

  const imageTag = tags.find((t) => data.coverByTag[t]) || '日常';
  const image = data.coverByTag[imageTag] || '/assets/food/dish.jpg';

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

function generateMeals(profile = {}, count = 4) {
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

module.exports = {
  generateMeals,
  data
};
