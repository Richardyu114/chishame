const coverByTag = {
  清淡: '/assets/food/salad.jpg',
  均衡: '/assets/food/dish.jpg',
  下饭: '/assets/food/spicy.jpg',
  浓香: '/assets/food/hotpot.jpg',
  辛辣: '/assets/food/spicy.jpg',
  日常: '/assets/food/dish.jpg',
  面食: '/assets/food/noodle.jpg',
  轻食: '/assets/food/salad.jpg',
  鲜香: '/assets/food/sushi.jpg'
};

const staples = [
  { id: 'st_rice_brown', name: '糙米饭', tags: ['均衡', '下饭'] },
  { id: 'st_rice_purple', name: '紫米饭', tags: ['均衡', '清淡'] },
  { id: 'st_rice_jasmine', name: '香米饭', tags: ['日常', '下饭'] },
  { id: 'st_noodle_buckwheat', name: '荞麦面', tags: ['面食', '清淡'] },
  { id: 'st_noodle_udon', name: '乌冬面', tags: ['面食', '均衡'] },
  { id: 'st_noodle_rice', name: '米粉', tags: ['面食', '轻食'] },
  { id: 'st_wholewheat_pasta', name: '全麦意面', tags: ['均衡'] },
  { id: 'st_potato_corn', name: '红薯玉米拼', tags: ['轻食', '清淡'] },
  { id: 'st_potato_mash', name: '土豆泥', tags: ['浓香', '日常'] },
  { id: 'st_congee_mix', name: '杂粮粥', tags: ['清淡', '日常'] },
  { id: 'st_oat', name: '燕麦饭', tags: ['轻食', '清淡'] },
  { id: 'st_quinoa', name: '藜麦饭', tags: ['轻食', '均衡'] },
  { id: 'st_pumpkin', name: '南瓜饭', tags: ['清淡', '日常'] },
  { id: 'st_bun', name: '全麦馒头', tags: ['日常', '清淡'] }
];

const proteins = [
  { id: 'pr_chicken_pan', name: '香煎鸡胸', tags: ['均衡', '日常'], tabooTags: [] },
  { id: 'pr_chicken_steamed', name: '清蒸鸡腿肉', tags: ['清淡', '均衡'], tabooTags: [] },
  { id: 'pr_egg_soft', name: '溏心鸡蛋', tags: ['清淡', '日常'], tabooTags: ['鸡蛋'] },
  { id: 'pr_egg_tomato', name: '番茄炒蛋', tags: ['下饭', '日常'], tabooTags: ['鸡蛋'] },
  { id: 'pr_tofu_mushroom', name: '香菇豆腐', tags: ['清淡', '均衡'], tabooTags: ['豆制品'] },
  { id: 'pr_tofu_spicy', name: '麻婆豆腐', tags: ['辛辣', '下饭'], tabooTags: ['豆制品', '辛辣'] },
  { id: 'pr_fish_steam', name: '清蒸鱼柳', tags: ['清淡', '鲜香'], tabooTags: ['海鲜'] },
  { id: 'pr_fish_pan', name: '香煎三文鱼', tags: ['浓香', '鲜香'], tabooTags: ['海鲜'] },
  { id: 'pr_beef_tomato', name: '番茄牛肉', tags: ['浓香', '下饭'], tabooTags: ['牛肉'] },
  { id: 'pr_beef_blackpepper', name: '黑椒牛柳', tags: ['浓香', '下饭'], tabooTags: ['牛肉'] },
  { id: 'pr_shrimp_garlic', name: '蒜香虾仁', tags: ['鲜香', '均衡'], tabooTags: ['海鲜'] },
  { id: 'pr_shrimp_pepper', name: '椒盐虾仁', tags: ['下饭', '鲜香'], tabooTags: ['海鲜'] },
  { id: 'pr_pork_lean', name: '青椒里脊', tags: ['下饭', '日常'], tabooTags: [] },
  { id: 'pr_pork_braised', name: '红烧里脊', tags: ['浓香', '下饭'], tabooTags: [] },
  { id: 'pr_duck_roast', name: '香烤鸭胸', tags: ['浓香'], tabooTags: [] },
  { id: 'pr_turkey', name: '迷迭香火鸡', tags: ['均衡', '清淡'], tabooTags: [] }
];

const veggies = [
  { id: 'vg_broccoli', name: '蒜蓉西兰花', tags: ['清淡', '均衡'], tabooTags: [] },
  { id: 'vg_lettuce', name: '清炒生菜', tags: ['清淡'], tabooTags: [] },
  { id: 'vg_mushroom_mix', name: '菌菇拼盘', tags: ['均衡', '日常'], tabooTags: [] },
  { id: 'vg_cucumber', name: '凉拌黄瓜', tags: ['轻食', '清淡'], tabooTags: ['生冷'] },
  { id: 'vg_pepper_blackfungus', name: '青椒木耳', tags: ['下饭'], tabooTags: [] },
  { id: 'vg_spinach', name: '麻酱菠菜', tags: ['均衡'], tabooTags: [] },
  { id: 'vg_tomato', name: '炖番茄', tags: ['清淡', '日常'], tabooTags: [] },
  { id: 'vg_carrot', name: '橄榄油胡萝卜', tags: ['清淡', '轻食'], tabooTags: [] },
  { id: 'vg_asparagus', name: '芦笋炒蘑菇', tags: ['轻食', '均衡'], tabooTags: [] },
  { id: 'vg_cauliflower', name: '孜然花菜', tags: ['下饭'], tabooTags: [] },
  { id: 'vg_cabbage', name: '手撕包菜', tags: ['下饭', '日常'], tabooTags: [] },
  { id: 'vg_okra', name: '白灼秋葵', tags: ['清淡', '轻食'], tabooTags: [] },
  { id: 'vg_eggplant', name: '蒜香茄子', tags: ['下饭', '浓香'], tabooTags: [] },
  { id: 'vg_kale', name: '羽衣甘蓝沙拉', tags: ['轻食', '清淡'], tabooTags: ['生冷'] },
  { id: 'vg_bokchoy', name: '香菇小油菜', tags: ['清淡', '均衡'], tabooTags: [] },
  { id: 'vg_pumpkin', name: '清蒸南瓜', tags: ['清淡', '轻食'], tabooTags: [] }
];

const extras = [
  { id: 'ex_soup_seaweed', name: '海带豆腐汤', tags: ['清淡'] },
  { id: 'ex_soup_miso', name: '味噌蔬菜汤', tags: ['清淡', '鲜香'] },
  { id: 'ex_soup_tomato', name: '番茄蛋花汤', tags: ['均衡'] },
  { id: 'ex_fruit', name: '一份时令水果', tags: ['轻食'] },
  { id: 'ex_yogurt', name: '无糖酸奶', tags: ['均衡'] },
  { id: 'ex_nuts', name: '一小把坚果', tags: ['均衡'] },
  { id: 'ex_edamame', name: '毛豆小碗', tags: ['均衡'] },
  { id: 'ex_pickles', name: '低盐小菜', tags: ['下饭'] },
  { id: 'ex_kimchi', name: '轻辣泡菜', tags: ['辛辣', '下饭'] },
  { id: 'ex_tea', name: '热乌龙茶', tags: ['清淡'] }
];

const quotes = [
  { text: '民以食为天。', from: '《汉书》' },
  { text: '食不厌精，脍不厌细。', from: '《论语》' },
  { text: '五谷为养，五果为助，五畜为益，五菜为充。', from: '《黄帝内经》' },
  { text: '安身之本，必资于食。', from: '《千金要方》' },
  { text: '治大国，若烹小鲜。', from: '《道德经》' },
  { text: '仓廪实而知礼节，衣食足而知荣辱。', from: '《管子》' },
  { text: '朝朝盐米无他事，日日风云有所思。', from: '《随园诗话》' },
  { text: '人间有味是清欢。', from: '苏轼《浣溪沙》' },
  { text: '长江绕郭知鱼美，好竹连山觉笋香。', from: '苏轼《初到黄州》' },
  { text: '夜雨剪春韭，新炊间黄粱。', from: '杜甫《赠卫八处士》' },
  { text: '小饼如嚼月，中有酥和饴。', from: '苏轼《留别廉守》' },
  { text: '莫笑农家腊酒浑，丰年留客足鸡豚。', from: '陆游《游山西村》' },
  { text: '山暖已无梅可折，江清独有蟹堪持。', from: '陆游《初冬》' },
  { text: '霜余蔬甲淡中甜，春近录苗嫩不蔹。', from: '杨万里《蔬圃》' },
  { text: '雪沫乳花浮午盏，蓼茸蒿笋试春盘。', from: '苏轼《浣溪沙》' },
  { text: '黄鸡白酒，君去村社一番秋。', from: '辛弃疾《水调歌头》' },
  { text: '蒌蒿满地芦芽短，正是河豚欲上时。', from: '苏轼《惠崇春江晚景》' },
  { text: '且将新火试新茶，诗酒趁年华。', from: '苏轼《望江南》' },
  { text: '未晚先投宿，鸡鸣早看天。', from: '王绩《野望》（意摘）' },
  { text: '世间万事，吃饭最大。', from: '民间俗语' },
  { text: '好好吃饭，就是认真生活。', from: '现代语录' },
  { text: '三餐烟火暖，四季皆安然。', from: '现代语录' },
  { text: '锅里有食，心里不慌。', from: '民间俗语' },
  { text: '一粥一饭，当思来处不易。', from: '《朱子家训》' },
  { text: '粗茶淡饭亦有真味。', from: '《菜根谭》' },
  { text: '欲得长生，肠中常清。', from: '《养生类纂》（意摘）' },
  { text: '食能排邪而安脏腑，悦神爽志。', from: '《本草纲目》' },
  { text: '知味者，能养其身。', from: '《吕氏春秋》（意译）' },
  { text: '能吃饭的人，最懂得珍惜日常。', from: '现代语录' },
  { text: '今日好好吃饭，明日更有力气追梦。', from: '现代语录' }
];

module.exports = {
  coverByTag,
  staples,
  proteins,
  veggies,
  extras,
  quotes
};
