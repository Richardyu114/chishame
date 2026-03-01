const places = [
  { id: 'p1', name: '阿强牛肉粉', avgPrice: 28, distanceKm: 0.6, tags: ['面食', '快餐', '辣'], address: '科技园南路 12 号' },
  { id: 'p2', name: '粤味小馆', avgPrice: 45, distanceKm: 1.2, tags: ['粤菜', '清淡', '米饭'], address: '创新大道 8 号' },
  { id: 'p3', name: '川渝小炒', avgPrice: 52, distanceKm: 0.9, tags: ['川菜', '辣', '米饭'], address: '创业一路 28 号' },
  { id: 'p4', name: '今日便当', avgPrice: 25, distanceKm: 0.4, tags: ['快餐', '米饭', '清淡'], address: '科兴路 3 号' },
  { id: 'p5', name: '和风食堂', avgPrice: 68, distanceKm: 1.8, tags: ['日料', '清淡'], address: '高新中二道 19 号' },
  { id: 'p6', name: '番茄鸡蛋面', avgPrice: 22, distanceKm: 0.7, tags: ['面食', '清淡'], address: '创客街 22 号' },
  { id: 'p7', name: '小龙坎简餐', avgPrice: 58, distanceKm: 1.5, tags: ['火锅', '辣', '米饭'], address: '软件园路 7 号' },
  { id: 'p8', name: '蒸汽小碗菜', avgPrice: 36, distanceKm: 1.0, tags: ['清淡', '米饭'], address: '云谷一路 2 号' },
  { id: 'p9', name: '拌面工坊', avgPrice: 30, distanceKm: 1.9, tags: ['面食', '辣'], address: '新园路 88 号' },
  { id: 'p10', name: '台式卤肉饭', avgPrice: 33, distanceKm: 0.8, tags: ['米饭', '快餐'], address: '研发三路 5 号' }
];

function getNearbyPlaces(radiusKm) {
  return places.filter(p => p.distanceKm <= radiusKm);
}

module.exports = {
  places,
  getNearbyPlaces
};
