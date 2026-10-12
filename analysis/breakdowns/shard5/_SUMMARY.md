# shard5 分片汇总

本分片共拆解 10 个视频，全部完成。

## 1. 转场实例总表（合并各视频实例表，保留视频+时间戳）

| 视频 | 时间戳 | 从→到 | 主要标签 |
|---|---|---|---|
| Zelios LangEase | 3.9→5.0 | 文件夹嵌套方块→白场新词 | zoom-through / glow |
| Zelios | 5.2→6.5 | "Just"→手机环绕 | kinetic-type / shared-element |
| Zelios | 11.7→13.0 | 进度条→对勾+彩带 | shape-morph / particle |
| Zelios | 13.0→14.3 | 对勾→结果卡 | shape-morph / ui-drill-in |
| Zelios | 16.9→18.2 | 点课卡→卡翻转乘法 | cursor-carry / card-flip-3d / clone |
| Zelios | 19.5→20.8 | 卡片云→桌面UI | blur-rack-focus / motion-blur-cut |
| Zelios | 23.4→24.7 | CTA按钮→星形 logo | shape-morph / logo-morph |
| panel1 左上(Lovable) | 5.5→6.5 | 旧句乱码→"Meet" | text.scramble |
| panel1 | 13.5→15.5 | 数字滚动+渐变线生长 | odometer / line-path-carry |
| panel1 | 17.5→18.5 | 巨型"day"→花形星 | letter-zoom / logo-morph |
| panel1 | 7→10 | 粉橙波浪段落分隔 | liquid-gradient |
| panel4 右下(Figma风) | 0→2.5 | 光标画贝塞尔→折线图 | line-path-carry / cursor-carry |
| panel4 | 4→12 | 虚线选框自画→手机滑入 | mask-reveal / empty-frame |
| panel4 | 8.5→9.5 | 紫色虚线横条 wipe | wipe-directional |
| panel4 | 全程 | 紫色光标换形贯穿 | cursor-character-stays |
| 支小宝 | 18.5→21.5 | 输入框→星星→卡片放射 | shared-element / clone |
| 支小宝 | 28.6→31.2 | 标题页→推近角 icon | corner-icon-drill-in |
| 支小宝 | 52.76→55 | App UI→拉回书桌 | camera-pull-out / bookend |
| 支小宝 | 35.5→40 | 角色+卡片堆叠 | character-plus-card-stack |
| 瑞幸 lucky | 1.3→3.9 | 咖啡杯→角色举杯 | object-becomes-character-prop |
| 瑞幸 | 21→34 | 7 组关键词 walk-through | match-cut-motion / beat-cut |
| 瑞幸 | 35→39 | 脸特写→表情九宫格 | glow / clone-multiply |
| 瑞幸 | 40→41.6 | 表情网格→双胞胎 | circle-iris |
| 每日品牌(Excited!) | 9→18 | 光标画矩形→圆角→星标 | cursor-build-shape-to-brand |
| 每日品牌 | 21→32 | 大字贝塞尔构造→定版 | type-as-wireframe |
| 每日品牌 | 37.8→41.4 | UI 组件墙横滑 | component-wall |
| 每日品牌 | 67→71 | 品牌周边快闪 | touchpoint-catalog-beat-cut |
| Stitch AI | 18→25.2 | 输入框→loading→回复→三卡 | input-box-becomes-response-card |
| Stitch | 32.4→34.6 | 落地页翻开门→模特图 | webpage-peels-to-reveal-assets |
| Stitch | 38.77→61.2 | 紫青流体 3 次段落分隔 | liquid-gradient-section-divider |
| Stitch | 81→86.4 | 粒子汇聚→白脸→字 | particles-converge-to-logo-face |
| a16z | 25→34 | 金球线稿→3D→太空 | orb-match-cut-series |
| a16z | 55→62 | 钢球→机器人眼→机器手 | table-object-becomes-eye |
| a16z | 94→97.5 | logo 格繁殖满屏 | logo-grid-multiply |
| deCode deSign | 50.4→52.8 | 玻璃胶囊分裂成工具栏 | pill-splits-into-toolbar |
| deCode | 66.3→76.8 | 液体流入玻璃托盘 | liquid-into-glass-tray |
| deCode | 120→129 | 同 UI 浮在花/沙丘/花上 | glass-ui-on-scene |
| deCode | 136.8→146.4 | 线框→实体图标 | wireframe-to-solid-icon |
| MG793(ALTEN) | 0→4.8 | 头像飞入连成对话链 | avatars-link-to-chain |
| MG793 | 4.8→9.6 | 中心球爆开成气泡宇宙 | center-orb-explodes-to-universe |
| MG793 | 30→36 | 方块拼 S→透视隧道 | blocks-assemble-then-tunnel |
| MG793 | 96→104 | UI 簇展开成满屏墙 | cluster-to-full-wall |
| MG793 | 104→113 | UI 墙溶解成用户头像 | wall-dissolves-to-users |
| MG793 | 122→136 | 方块拼文档→旗标→字 | blocks-compose-document-then-logo |

## 2. Pattern 候选（按出现频次排序）

### 高频（≥2 个不同视频）
1. **liquid-gradient-section-divider** — 流体/渐变光晕涌满画作为段落分隔，再散开露出下一节。证据：panel1 7→10、Stitch 38.77/50.4/57.93。解决深色/浅色氛围片的章节呼吸。
2. **text-scramble-word-slot** — 中央文字槽位内旧词乱码抖动后逐位解码成新词。证据：panel1 5.5→6.5/12→13、deCode 7→10。解决"一句话卖点切换不硬切"。
3. **cursor-carry / cursor-character-stays** — 一个光标（手型/三角/I-beam）换形但颜色尺寸恒定贯穿所有镜头。证据：panel4 全程、Zelios 16.9/20.8/22.1、每日品牌 9→12、deCode 52.8/74.3。解决"无人物 UI demo 保持主角连续"。
4. **shared-object-morph-chain** — 同一物体（进度条→对勾→卡；输入框→星星；杯→角色；方块→文档→logo）连续形变承担转场。证据：Zelios 11.7→14.3、支小宝 18.5→21.5、瑞幸 1.3→3.9、MG793 122→136。解决"元素连续携带叙事"。
5. **card-deal-flyin / card-stack** — 卡片从边滑入堆叠成摞。证据：Zelios 13→14、支小宝 35.5→40、MG793 81.6、瑞幸 character walk。与现有 `deck-deal-flyin`/`card-stack` 卡互补，新增"玻璃卡从中心星星放射"变体。
6. **ui-drill-in / screen-record-punch** — 卡片或行放大成完整 UI 页。证据：Zelios 14.3/20.8、panel4 10.5、支小宝 23.4、Stitch 19.8/41.4。与现有 `ui-drill-in` 一致。
7. **particle-dissolve / particles-converge** — 粒子聚合成品牌符号或散开成下一场。证据：Stitch 81→86.4、MG793 9.6、a16z、瑞幸 13→15。
8. **match-cut-shape** — 圆形/方形物体跨片匹配（球、框、花形）。证据：a16z 25→34、panel1 17.5→18.5、Zelios 3.9、MG793 30→36。
9. **brand-endcard logo 落版** — 字/图形 logo 在最后落版。证据：几乎所有视频。
10. **hard-cut beat-cut montage** — 节拍点硬切。证据：瑞幸 21→34、a16z 全程、每日品牌 67→71。与现有 `beat-cut-moves` 一致。

### 中频（单视频但机制独特、值得候选）
11. **icon-portal-drill-in**（Zelios 3.9→5.0）— 产品图标持续放大，内部嵌套 UI 层钻到白场。
12. **progress-to-achievement-morph**（Zelios 11.7→13.0）— 进度条收缩成对勾+彩带。
13. **click-to-card-multiplication**（Zelios 16.9→18.2）— 点一张卡翻转复制出多张放射。
14. **odometer-with-drawing-line**（panel1 13.5→15.5）— 数字滚动同时底部渐变线生长、光点沿线走。
15. **letter-zoom-through-logo**（panel1 17.5→18.5）— 句尾词放大出血→白场弹品牌图形。
16. **empty-frame-then-content-slides-in**（panel4 10.5→12）— 虚线空框先画，内容后填入。
17. **corner-icon-drill-in**（支小宝 28.6→31.2）— 卖点页四角 icon，相机选一个角推近进入下段。
18. **bookend-desk-pull-out**（支小宝 52.76→55）— 结尾从 UI 拉回开场同一张书桌。
19. **character-walk-through-wipe**（瑞幸 21→34）— 角色走出画左、从画右走入，方向连续藏硬切。
20. **pose-keyword-card**（瑞幸 21→34）— 背景大关键词+前景角色举对应道具 pose，每 2s。
21. **face-closeup-to-emoticon-grid**（瑞幸 35→39）— 脸特写白闪→取景框→8 表情网格。
22. **cursor-build-shape-to-brand**（每日品牌 9→18）— 光标画矩形→圆角→星标→选色板，把 logo 做出来。
23. **type-as-wireframe-then-resolve**（每日品牌 21→32）— 大字先以贝塞尔手柄/辅助线出现再定版。
24. **ui-character-emerge**（每日品牌 36→41）— 红方块 UI 缩中心长眼变角色。
25. **touchpoint-catalog-beat-cut**（每日品牌 67→71）— 品牌周边 0.3s/切快闪。
26. **input-box-becomes-response-card**（Stitch 18→25.2）— 输入框原地变大→loading→聊天气泡→三卡。
27. **webpage-peels-to-reveal-assets**（Stitch 32.4→34.6）— 落地页卡片像门翻开露模特图。
28. **pill-splits-into-toolbar**（deCode 50.4→52.8）— 玻璃胶囊内部分裂成 ○△Done 三段。
29. **glass-ui-on-scene**（deCode 120→129）— 同一玻璃 UI 浮在不同摄影背景上，背景切 UI 不动。
30. **liquid-into-glass-tray**（deCode 66→76）— 液体流入玻璃托盘填充。
31. **wireframe-to-solid-icon**（deCode 136→146）— 线框图标长出实体。
32. **avatars-link-to-chain**（MG793 0→4.8）— 头像圆飞入，胶囊在节点间生长。
33. **center-orb-explodes-to-universe**（MG793 4.8→9.6）— 中心球放大吞画爆成气泡轨道。
34. **cluster-to-full-wall**（MG793 96→104）— UI 簇倾斜拉远展开成满屏墙。
35. **wall-dissolves-to-users**（MG793 104→113）— UI 墙溶解成用户头像漂浮。

## 3. 风格差异小结

- **浅色极简 UI 产品**（Zelios、支小宝）：白底/浅蓝底，字卡快闪+玻璃卡，转场靠中心锚点物体形变，节奏快但情绪软。
- **深色氛围 AI 产品**（Stitch、panel4）：深黑底+紫青/紫辉光，流体光晕做段落呼吸，转场靠 blur-rack-focus 与粒子聚合，情绪 Premium/Cinematic。
- **角色 IP 片**（瑞幸、支小宝）：角色作为主角，转场靠角色走动/变身/道具交接；瑞幸双色板硬切蒙太奇，支小宝 3D 书桌首尾书挡。
- **设计系统/品牌升级**（每日品牌、deCode）：把 UI 组件"做出来"（画矩形→圆角→星标；线框→实体），强调构造过程；deCode 偏材质（玻璃/液体），每日品牌偏极客工具美学。
- **MG 概念动画**（MG793、panel1 Lovable）：几何形状自拼装、粒子/胶囊/方块生长，转场靠形变与隧道，无真实 UI 界面。
- **档案素材蒙太奇**（a16z）：纯硬切+match-cut，靠物体母题（球/手）串联，本类多为灵感参考，仅 logo 格繁殖与球 match-cut 可程序化。
