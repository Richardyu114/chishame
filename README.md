# 吃啥么（微信小程序 MVP）

一个帮你 **10 秒决定去哪家吃** 的微信小程序。

## 产品约束
- 产品名：吃啥么
- 推荐半径：默认 **1km**，最远 **2km**
- 仅到店吃（不做外卖链路）
- 不做好友拼饭/投票

## 当前实现进度（可在开发者工具运行）
- 首次引导：定位、预算、口味/忌口
- 推荐页：3 张候选卡片 + 换一批/随机一下
- 快速反馈：就吃这个 / 不想吃这类
- 本地偏好学习：根据选择更新口味权重
- 近 3 天重复惩罚，减少重复吃同一家
- 结果页、偏好页、最近决策记录
- 云函数链路：
  - `searchNearby`：已接腾讯地图 API（需 key）
  - `recommend`：已迁移打分逻辑到云端
  - `feedback`：可写入云数据库 `feedback_logs`
- 低成本特点：附近检索结果本地缓存（默认 2 小时，最高可扩至 6 小时）
- 兜底策略：云函数不可用时自动回退本地 mock

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
│       ├── cloud.js
│       ├── nearbyCache.js
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
2. 选择“导入项目”，目录指向仓库根目录。
3. 初期可用 `touristappid` 体验（不含完整云能力）。
4. 编译后可先走本地 mock 数据流程。

## 云开发初始化（部署前必须）
1. 在微信开发者工具开通云开发环境（记下 `envId`）。
2. 在 `app.js` 的 `wx.cloud.init` 中配置 `env`。
3. 云函数配置：
   - `searchNearby` 设置环境变量：`TENCENT_MAP_KEY`
   - `feedback` 目录执行依赖安装（微信开发者工具里“云函数-安装依赖”）
4. 创建云数据库集合：`feedback_logs`。

## 腾讯地图接入说明
`searchNearby` 云函数已预留并实现调用逻辑：
- 输入：`lat`, `lng`, `radiusKm`（1/2）
- 调用：腾讯地图 Place Search API
- 输出：统一格式 `name/address/distanceKm/avgPrice/tags`

若 API 返回为空或异常，前端会自动降级到本地 mock，保证页面可用。

## 部署清单
- [ ] 替换真实小程序 AppID
- [ ] 配置云环境 envId
- [ ] 配置 `TENCENT_MAP_KEY`
- [ ] 部署并上传 3 个云函数
- [ ] 创建 `feedback_logs` 集合并验证写入
- [ ] 真机测试：定位授权、半径切换、推荐与反馈链路
- [ ] 上传体验版并灰度验证
- [ ] 提交微信审核（如需正式发布）

## 下一步（construct）
- 接入真实反向地理编码，显示城市名而非坐标
- 完善反馈学习（时间段偏好：午餐/晚餐）
- 增加“黑名单店铺”与“收藏店铺”
- 打磨视觉层（更轻、更简洁的卡片排版）
