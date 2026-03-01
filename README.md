# 吃啥么（微信小程序 MVP）

一个帮你 **10 秒决定去哪家吃** 的微信小程序。

## 已确认产品约束
- 产品名：吃啥么
- 推荐半径：默认 1km，最远 2km
- 仅到店吃（不做外卖链路）
- 不做好友拼饭/投票

## 当前能力（MVP）
- 首次引导：定位、预算、口味/忌口
- 推荐页：3 张候选卡片 + 换一批/随机一下
- 快速反馈：就吃这个 / 不想吃这类
- 本地偏好学习：根据选择调整 taste weights
- 近 3 天重复惩罚，减少重复吃同一家
- 结果页、偏好页、最近决策记录
- 云函数占位：searchNearby / recommend / feedback

## 目录结构
```
.
├── miniprogram/
│   ├── app.js app.json app.wxss sitemap.json
│   ├── pages/
│   │   ├── onboarding/
│   │   ├── recommend/
│   │   ├── result/
│   │   └── profile/
│   └── utils/
│       ├── storage.js
│       ├── scorer.js
│       └── mock.js
├── cloudfunctions/
│   ├── searchNearby/
│   ├── recommend/
│   └── feedback/
└── project.config.json
```

## 本地运行（微信开发者工具）
1. 安装并打开微信开发者工具。
2. 选择“导入项目”，目录指向本仓库根目录（`/home/chishame`）。
3. AppID 可先使用 `touristappid`（体验版）。
4. 编译后先走本地 mock 数据流程。

## 云开发初始化（用于后续可部署）
1. 在微信开发者工具开通云开发环境（获取 envId）。
2. 在项目中启用云函数目录 `cloudfunctions/`。
3. 给 `searchNearby` 绑定腾讯地图 key（建议云环境变量）：
   - `TENCENT_MAP_KEY`
4. 将推荐与反馈日志逐步迁移到云函数 + 云数据库。

## 腾讯地图 API 接入建议（后续）
- 接口：附近检索（POI）
- 输入：lat/lng + radius(1000/2000m) + category=餐饮
- 输出标准化字段：name/address/distanceKm/avgPrice/tags
- 在 `cloudfunctions/searchNearby` 中请求腾讯地图并做字段清洗。

## 部署清单（必须走完）
- [ ] 替换真实小程序 AppID
- [ ] 创建并绑定云环境
- [ ] 配置腾讯地图 Key（云函数可读）
- [ ] 真机测试：定位授权、半径切换、推荐逻辑、结果页跳转
- [ ] 上传版本并提交微信审核（如需上架）

## Git 推进建议
- 本地已完成 MVP 骨架，可按你仓库 remote 配置后执行：
  - `git remote add origin <your-ssh-url>`
  - `git push -u origin main`
