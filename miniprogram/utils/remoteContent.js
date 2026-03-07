const RANDOM_MEAL_API = 'https://www.themealdb.com/api/json/v1/1/random.php';
const CLASSIC_QUOTE_API = 'https://v1.jinrishici.com/all.json';
const DEFAULT_TIMEOUT = 2200;

const foodQuoteKeywords = [
  '食', '饭', '饥', '饱', '味', '羹', '菜', '酒', '茶', '厨', '烹', '炊', '馔', '粥', '肴', '饼'
];

function requestJSON(url, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    if (typeof wx === 'undefined' || typeof wx.request !== 'function') {
      reject(new Error('wx.request unavailable'));
      return;
    }

    wx.request({
      url,
      method: 'GET',
      timeout,
      success: (res) => {
        const code = Number(res.statusCode || 0);
        if (code >= 200 && code < 300) {
          resolve(res.data || {});
          return;
        }
        reject(new Error(`request failed: ${code}`));
      },
      fail: (err) => reject(err)
    });
  });
}

async function fetchRandomMeal() {
  const payload = await requestJSON(RANDOM_MEAL_API);
  const meals = Array.isArray(payload.meals) ? payload.meals : [];
  return meals[0] || null;
}

async function fetchRandomMeals(count = 8) {
  const tasks = Array.from({ length: Math.max(1, count) }).map(() =>
    fetchRandomMeal().catch(() => null)
  );

  const rows = await Promise.all(tasks);
  const dedup = [];
  const seen = new Set();

  rows.forEach((meal) => {
    if (!meal || !meal.idMeal || seen.has(meal.idMeal)) return;
    seen.add(meal.idMeal);
    dedup.push(meal);
  });

  return dedup;
}

function isFoodRelatedQuote(text = '') {
  if (!text) return false;
  return foodQuoteKeywords.some((word) => text.includes(word));
}

function normalizeQuote(raw = {}) {
  const text = String(raw.content || '').trim();
  const origin = String(raw.origin || '').trim();
  const author = String(raw.author || '').trim();

  if (!text || !isFoodRelatedQuote(text)) return null;

  const from = [origin ? `《${origin}》` : '', author].filter(Boolean).join(' · ') || '古诗文';
  return { text, from };
}

async function fetchQuote() {
  const payload = await requestJSON(CLASSIC_QUOTE_API);
  return normalizeQuote(payload);
}

async function fetchQuotes(count = 4) {
  const tries = Math.max(4, count * 4);
  const tasks = Array.from({ length: tries }).map(() =>
    fetchQuote().catch(() => null)
  );
  const rows = await Promise.all(tasks);
  const dedup = [];
  const seen = new Set();

  rows.forEach((item) => {
    if (!item || !item.text || seen.has(item.text)) return;
    seen.add(item.text);
    dedup.push(item);
  });

  return dedup.slice(0, Math.max(1, count));
}

module.exports = {
  fetchRandomMeals,
  fetchQuotes
};
