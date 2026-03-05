const coverByTag = {
  清淡: '/assets/food/salad.jpg',
  均衡: '/assets/food/dish.jpg',
  下饭: '/assets/food/spicy.jpg',
  浓香: '/assets/food/hotpot.jpg',
  辛辣: '/assets/food/spicy.jpg',
  日常: '/assets/food/dish.jpg',
  面食: '/assets/food/noodle.jpg',
  轻食: '/assets/food/salad.jpg'
};

const staples = [
  { id: 'st_rice', name: '糙米饭', tags: ['均衡', '下饭'] },
  { id: 'st_noodle', name: '荞麦面', tags: ['面食', '清淡'] },
  { id: 'st_potato', name: '红薯玉米拼', tags: ['轻食', '清淡'] },
  { id: 'st_wheat', name: '全麦意面', tags: ['均衡'] },
  { id: 'st_congee', name: '杂粮粥', tags: ['清淡', '日常'] }
];

const proteins = [
  { id: 'pr_chicken', name: '香煎鸡胸', tags: ['均衡', '日常'], tabooTags: [] },
  { id: 'pr_egg', name: '溏心鸡蛋', tags: ['清淡', '日常'], tabooTags: ['鸡蛋'] },
  { id: 'pr_tofu', name: '香菇豆腐', tags: ['清淡', '均衡'], tabooTags: ['豆制品'] },
  { id: 'pr_fish', name: '清蒸鱼柳', tags: ['清淡'], tabooTags: ['海鲜'] },
  { id: 'pr_beef', name: '番茄牛肉', tags: ['浓香', '下饭'], tabooTags: ['牛肉'] },
  { id: 'pr_shrimp', name: '蒜香虾仁', tags: ['鲜香'], tabooTags: ['海鲜'] },
  { id: 'pr_spicy_tofu', name: '麻婆豆腐', tags: ['辛辣', '下饭'], tabooTags: ['豆制品', '辛辣'] }
];

const veggies = [
  { id: 'vg_broccoli', name: '蒜蓉西兰花', tags: ['清淡', '均衡'], tabooTags: [] },
  { id: 'vg_lettuce', name: '清炒生菜', tags: ['清淡'], tabooTags: [] },
  { id: 'vg_mushroom', name: '菌菇拼盘', tags: ['均衡', '日常'], tabooTags: [] },
  { id: 'vg_cucumber', name: '凉拌黄瓜', tags: ['轻食', '清淡'], tabooTags: ['生冷'] },
  { id: 'vg_pepper', name: '青椒木耳', tags: ['下饭'], tabooTags: [] },
  { id: 'vg_spinach', name: '麻酱菠菜', tags: ['均衡'], tabooTags: [] }
];

const extras = [
  { id: 'ex_soup', name: '海带豆腐汤', tags: ['清淡'] },
  { id: 'ex_fruit', name: '一份时令水果', tags: ['轻食'] },
  { id: 'ex_yogurt', name: '无糖酸奶', tags: ['均衡'] },
  { id: 'ex_nuts', name: '一小把坚果', tags: ['均衡'] }
];

const quotes = [
  { text: '民以食为天。', from: '《汉书》' },
  { text: '食不厌精，脍不厌细。', from: '《论语》' },
  { text: '五谷为养，五果为助，五畜为益，五菜为充。', from: '《黄帝内经》' },
  { text: '安身之本，必资于食。', from: '《千金要方》' },
  { text: '知味者，能养其身。', from: '《吕氏春秋》（意译）' }
];

module.exports = {
  coverByTag,
  staples,
  proteins,
  veggies,
  extras,
  quotes
};
