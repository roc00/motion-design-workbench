# 原 30 张开源镜头卡 · 真实视频证据覆盖审计（ORIGINAL30-AUDIT）

> 审计对象：`data/shot-recipes.json` 中前 30 张 `sourcePath` 指向开源仓库的卡。
> 证据来源（只读）：`analysis/breakdowns/shard1..6/` 下 57 个 `<slug>.md` 的「转场实例表」+ 6 个 `_SUMMARY.md` + `analysis/MOTION-TRANSITION-LIBRARY.md`。
> 后 16 张（`sourcePath: video-analysis/*`）仅用于查重对照，不审计。
> 时间戳均照抄自上述 breakdown/报告；看不清或未出现的一律标「本批未出现 / 待核」，不硬凑。
> 分类口径：**A 视频佐证**（≥2 个不同视频真实出现）｜**B 重复/变体**（与另一张卡实质同一手法）｜**C 本批未出现**（57 支产品宣传片未观察到，保留并加「仓库模式·本批视频未覆盖」标签）。

---

## 一、30 行主表

| # | id | 中文名 | 分类 | 证据视频数 | 一句话结论 | 建议动作 |
|---|---|---|---|---|---|---|
| 1 | camera.crash-zoom-punch | 急推强调 | A | 3 | 急推真实存在，但都打在**字卡/字符**上聚焦，终帧接 rack 模糊，不是「数字卡+强调框」 | 保留；演示改为「字卡急推聚焦一个字符/词→rack 模糊切下一章」 |
| 2 | camera.depth-layer-moves | 纵深分层运镜 | A | 3 | 真实用法是**独立慢视差层 / 等距纵深推进**，不是「三张横移卡差速」 | 保留；演示改为「独立层慢漂 + 等距纵深」 |
| 3 | camera.space-camera-moves | 空间穿行运镜 | B | 1（被新卡吸收） | 其「沿路径穿多卡到目标」的抽象意图本批未独立出现；具体运镜已被新卡 hero-orbit / zoom-through / pull-back 瓜分 | 降级为通用占位卡；环绕证据迁 hero-orbit-decor-rings，穿行证据迁 zoom-through-portal |
| 4 | camera.overhead-camera-moves | 俯拍总览运镜 | C | 0 | 无「俯视网格+虚线路径+推节点」实例；仅有的俯视镜头实为 zoom-through / match-cut | 保留，加「仓库模式·本批未覆盖」标签 |
| 5 | transition.shot-transitions | 镜头交棒组合 | A | 多（硬切/叠化遍地） | 它是**接缝词典**而非单一手法；真实片靠硬切+底色连续，而非四种接缝轮播 | 保留但降级为「接缝词典」参考卡，不做单镜生产演示 |
| 6 | transition.transition-hidden-cut | 遮挡藏切 | A | 4 | 真实高频：运动模糊藏切 / 亮度峰值藏切 / 甩镜藏切都有实例 | 保留；演示补「亮度峰值(glow-flip)藏深浅」与「运动模糊横甩藏切」两式 |
| 7 | transition.wipe-transitions | 方向擦除 | A | 4 | 高频，真实多为**品牌色楔形/横条擦除**，与章节推进绑定 | 保留；演示用「品牌色对角楔/横条 wipe」 |
| 8 | transition.card-flip-reveal | 卡片翻面揭示 | A | 3 | 真实存在：纸/卡绕轴翻面换面，正反语义明确 | 保留；演示贴近「同一张卡绕竖轴翻面换正反」 |
| 9 | transition.circle-match-iris | 圆形匹配开合 | B | 1（真 iris）/ 2（实为 portal） | 真「圆形遮罩开合」仅瑞幸 1 例；CDX/ creatoroly 的圆实为 zoom-through portal，阿里/ColCircle 的圆是 match-cut-shape | 并入 match-cut-shape 作「圆形」变体；portal 圆迁 zoom-through-portal |
| 10 | transition.line-carry-transition | 线索接力转场 | A | 4 | 高频且与现有卡重合：一条线/光轨/箭头跨切点维持方向 | 保留；演示用「箭头/光轨从一镜画进下一镜」 |
| 11 | ui-entrance.platform-hinge-rise | 平台铰链升起 | C | 0 | 无「屏幕绕底边铰链 rotateX 翻起」实例；「从底部升起」均为浮起而非铰链翻 | 保留，加「本批未覆盖」标签 |
| 12 | ui-entrance.deck-deal-flyin | 发牌式飞入 | B | 并入 #13 | 与 card-stack 在真实片里被同样标注、机制近同（多卡成组入场） | 并入 card-stack 作「发牌式旋转飞入」别名 |
| 13 | ui-entrance.card-stack | 卡片堆叠展开 | A | 3 | 高频：多卡/UI 块不同景深飞入、错落叠放 | canonical 卡，接收 deck-deal-flyin 证据 |
| 14 | ui-entrance.product-card-progressive-assemble | 产品卡渐进组装 | C | 0 | 无「图→标题→指标→按钮按阅读顺序组装单卡」实例；真实错峰是多卡/多行 | 保留，加「本批未覆盖」标签；可参考 list-reveal 的 stagger |
| 15 | ui-entrance.list-reveal | 列表渐进揭示 | A | 2 | 真实：结果列表逐行揭示、末行高亮；模板同构快切 | 保留；演示用「搜索结果逐行 reveal，末行高亮」 |
| 16 | ui-entrance.morph-from-primitive | 基础形态生长 | A | 3 | 真实：方块/字/柔块在**单镜内**生长成界面；与跨镜链条是两件事 | 保留；边界收窄为「单镜内单次生长」 |
| 17 | interaction.type-and-filter | 输入并筛选 | A | 2 | 真实：输入词后结果集收敛（Google Vids 搜素材库、ISUX 搜索框） | 保留；演示用「逐字输入→列表按匹配收敛」 |
| 18 | interaction.ai-stream-response | AI 流式响应 | A | 3 | 真实：等待→逐字流式生成→完成态（脚本/结果长文/聊天气泡） | 保留；演示补「流式长文卡浮现」这一真实形态 |
| 19 | interaction.command-palette-summon | 命令面板唤起 | C | 1（弱） | 仅 Riverside 1 处「弹出命令面板」，且标 ui-drill-in；无「唤起→高亮移动→执行」完整链 | 保留，加「本批未覆盖」标签 |
| 20 | interaction.input-trigger-moves | 输入触发动作 | A | 3 | 真实高频：触发→加载/反馈→结果（与新卡 cursor-cross-shot 相邻但单镜） | 保留；单镜「点按钮→反馈→结果卡」 |
| 21 | data.before-after-slider-scrub | 前后对比滑杆 | C | 0 | 无「同一锁定构图+分界滑杆扫前后」实例；真实前后对比走 device-frame 换图/分屏 | 保留，加「本批未覆盖」标签；与 split-screen 区分 |
| 22 | data.chart-live-moves | 图表动态建立 | C | 0（1 个隐喻） | 图表多为**已做好的 UI 卡被换内容**，非「坐标→数据生长→标峰值」；仅 panel4 一个隐喻线→图 | 保留，加「本批未覆盖」标签 |
| 23 | data.odometer-digit-roll | 数字滚轮 | A | 2 | 真实：数字逐位滚动（TME 65→64；panel1 数字滚动+线生长） | 保留；演示补「滚动同时底部渐变线生长」的真实变体 |
| 24 | data.timeline-travel | 时间线穿行 | C | 0 | 无「镜头沿时间轴穿行、节点依次点亮」实例；相关镜头是拖片段进时间线 UI / pull-back | 保留，加「本批未覆盖」标签 |
| 25 | rhythm.beat-cut-moves | 节拍硬切 | A | 3 | 真实：角色 walk-through、周边快闪、连切按重音切 | 保留；演示用「背景大词+前景角色 pose 按拍切」 |
| 26 | rhythm.speed-ramp-freeze | 变速与定格 | A | 2 | 真实：倒计时→真人定格；高速运动模糊连续藏切 | 保留；注意与 hidden-cut 的速度模糊分支划界 |
| 27 | rhythm.montage-rhythm-moves | 蒙太奇节奏组 | A | 3 | 真实：长短镜压缩多动作，末镜落可读结果 | 保留；与 beat-cut 是「段落 vs 单切」两层 |
| 28 | opening.spotlight-hero-card | 聚光主角卡 | A（薄） | 2 | 真实聚光是**跟随光标的光圈在暗仪表盘上只照亮一个数据点**，不是「聚光落到主角产品卡」 | 保留；演示改为「暗环境+移动光圈锁定一个阅读点」 |
| 29 | opening.brand-ink-open | 品牌墨迹开场 | C | 0 | 无「品牌墨迹向外扩散成遮罩再露标题」实例；品牌开场是粒子聚合/碎片拼/笔画成字 | 保留，加「本批未覆盖」标签；与 particles-gather 一聚一散互补 |
| 30 | typography.paper-title-card | 纸面标题卡 | A | 3 | 高频章节字卡：白字卡/章节套版/黑场淡入字卡 | 保留；演示用「章节字卡落位停足再切」 |

**汇总：A = 19 张，B = 3 张，C = 8 张。**

---

## 二、A 类逐卡证据清单（视频名 + 时间戳）+ 校准提示

> 视频名取 breakdown 文件名的可读简称；时间戳照抄 breakdown/ SUMMARY。

### 1. camera.crash-zoom-punch（急推强调）
- `NextLevel 阿里设计 Showreel` 43.8→44.6 —— 橙底「1688」镜头急推，只放大首位「1」，其余数字滑出。
- `Google 60 秒讲新功能（Gemini Canvas）` 9.1→11.0 —— 急推单词「collaboration」糊成「llaborati」再淡入「Introducing」。
- `快手 2022 设计年鉴` 9.0→12.6 —— 倾斜字标推近做章节重音。
- **校准提示**：当前演示是「中景数字卡(+67%) 急推 + 强调框锁定」。真实急推**全部打在字卡/字符上**，目的是从一串字里抽出一个主角，且终帧接 rack/blur 再切下一章，不是停在一个强调框上。演示应改成「字卡急推聚焦一个字符/词 → 径向/横移模糊 → 下一章」。

### 2. camera.depth-layer-moves（纵深分层运镜）
- `马斯克 xAI 官网` 3.6→9 —— 黑底星野各层独立缓慢漂移，「星层独立滚动制造深空纵深」。
- `Stripe 支付短片` 1.0→5.0 —— 镜头在 3D 卡片展厅平移/环绕，多块产品卡以**不同景深**漂浮排布。
- `Microsoft Windows 365` 40.3→50.7 —— 规格数字物化成等距方块，沿电路网格纵深推进。
- **校准提示**：当前演示是「前中后景三张横移卡差速」。真实片里「纵深」要么是**独立层慢漂**（星野），要么是**等距/网格纵深推进**（方块/城市），不是横移差速。演示应改为「两层独立慢视差」或「等距纵深推进」。

### 5. transition.shot-transitions（镜头交棒组合）
- 硬切：`CDX-GDG 2022` 21.6→136（统一样机框内几十屏连续硬切）；cross-dissolve：`Stripe` 0.0→1.0（白底手机→深蓝手机叠化）；fade：`Microsoft Windows 365` 58.5→62.4（多环境→白场字卡）。
- **校准提示**：这张卡本质是「接缝词典」，不是单镜手法。真实片压倒性依赖**硬切 + 底色/容器连续(bg-continuity)**，很少刻意轮播「硬切/闪白/暗场/遮罩」四种。建议把它降级为参考图例（什么时候用哪种接缝），而不是一张要做生产演示的镜头卡。

### 6. transition.transition-hidden-cut（遮挡藏切）
- `TME Design Showreel 2025` 9.0→9.6 —— 横甩+运动模糊藏切。
- `三维动画视觉设计` 7.0 —— 四角星闪光藏切到表格。
- `Google AI 搜索（数字拾光者）` 31.0→32.4 —— 亮度峰值藏深↔浅（glow-flip）。
- `NextLevel 阿里 Showreel` 199.7→200.5 —— 大屏 UI→实拍实验台，rack 焦藏切。
- **校准提示**：当前演示是「前景遮挡物扫全屏→全遮瞬间换场景」。真实片更常用的是**运动模糊横甩**和**亮度峰值**两种藏切，遮挡物藏切反而少。演示应补这两式。

### 7. transition.wipe-transitions（方向擦除）
- `SaaS MG（元意空间）` 0.0→1.0 —— 图标+箭头方向引导 wipe。
- `panel3 左下` 7.0 —— 「One place」玻璃字→蓝块右滑「everything」。
- `panel4 右下（Figma 风）` 8.5→9.5 —— 紫色虚线横条 wipe。
- `CDX-GDG 2022` 139.2 / 141.6 —— 品牌橙对角楔斜切。
- **校准提示**：当前演示是「无方向感的分界线扫过」。真实 wipe 几乎都**绑定品牌色 + 对角/横条**，且承担章节推进。演示应改成「品牌色对角楔 wipe」。

### 8. transition.card-flip-reveal（卡片翻面揭示）
- `设计工作室品牌展示转场` 0–2.0 —— 小卡片绕 Y 轴翻面。
- `NextLevel 阿里 Showreel` 3.8→4.6 —— 红底 IP→纸翻面露卡通。
- `Microsoft 365` 19.5→22.1 —— 卡片翻面露红心/日历。
- **校准提示**：与当前演示高度一致，保留即可；可补「正反语义闭环」的真实例子（功能面→结果面）。

### 10. transition.line-carry-transition（线索接力转场）
- `SaaS MG（元意空间）` 0.0→4.0 —— 图标+箭头线一路引导跨镜。
- `Wayframe Launch` 32.5→35.1 —— 代码→终端光轨线跨切点。
- `Microsoft Windows 365` 19.5→24.7 —— 缎带载图标沿线跨镜。
- `panel1 左上（Lovable）` 13.5→15.5 —— 数字滚动同时底部渐变线生长、光点沿线走。
- **校准提示**：shard1 已明确「line-path-carry 高频，与现有 line-carry-transition 重合」。真实线可以是**箭头/光轨/缎带/渐变线**，不一定是「轨迹从左图表长到右结果」。演示应泛化到「任意一条可见的线/轨跨切点」。

### 13. ui-entrance.card-stack（卡片堆叠展开）【B 对的 canonical】
- `Wayframe Launch` 13.0→15.6 —— 线框→手机发牌式成组。
- `flowith 1.0` 36→48 —— 结果卡滑落到工作台成摞。
- `@creatoroly showreel 25` 24.7→28.6 —— 人物海报→polaroid→订阅卡堆叠。
- **校准提示**：作为 canonical，它同时吃掉 deck-deal-flyin。真实「多卡成组入场」既包括发牌旋转飞入，也包括错落叠放，建议演示两种变体。

### 15. ui-entrance.list-reveal（列表渐进揭示）
- `Google Vids` 54.0→57.6 —— Stock→搜索→图网格逐行 reveal。
- `panel3 左下` 10→13 —— Stocks/ETFs/Crypto 同模板循环快切（list-reveal）。
- **校准提示**：当前演示是「4 行列表从上到下错峰、末行高亮」。真实片里列表 reveal 常和**同模板循环快切**结合。保留即可。

### 16. ui-entrance.morph-from-primitive（基础形态生长）
- `TRAE solo` 2.0→7.2 —— 黑方块→炸开成点阵→聚合 TRAE 字标。
- `平安知鸟 2022` 4.5→6 —— 3D 知字直接变形成浏览器窗。
- `flowith 1.0` 16.2→19.8 —— 空卡同状态生长出对话字。
- **校准提示**：与新卡 shared-element-morph-chain 的差别是「**单镜内单次**生长」，不跨镜。演示应强调起止是同一对象、在同一镜内完成一次形变，不要跨 3–4 镜。

### 17. interaction.type-and-filter（输入并筛选）
- `Google Vids` 54.0→57.6 —— 搜素材库，输入后结果网格收敛。
- `ISUX「六月」设计趋势` 7.2→12.6 —— 搜索框逐字输入问题，旁侧浮起 AI 图标。
- **校准提示**：与当前演示一致（输入→结果集收敛）。可补「输入框本身成为注意力载体」的真实形态。

### 18. interaction.ai-stream-response（AI 流式响应）
- `Google Vids` 32.4→34.2 —— Script 面板脚本文字逐字流式打出。
- `Google AI 搜索（数字拾光者）` 36.0→37.8 —— 搜索结果长文卡从搜索栏下方流式浮现。
- `Stitch AI` 18→25.2 —— 输入框→loading→聊天气泡→三卡。
- **校准提示**：真实流式多为**长文卡/聊天气泡逐行浮现**，不只是「回答逐行生成 + 完成标记」。演示应补「结果长文卡流式浮现」。

### 20. interaction.input-trigger-moves（输入触发动作）
- `Wayframe Launch` 6.5→7.8 —— 打字→发送，光标触发。
- `Google Vids` 10.8→12.6 —— 文件夹触发→「Creating...」加载按钮。
- `Google Vids` 41.4→43.2 —— 音色列表选中触发反馈。
- **校准提示**：与新卡 persistent-cursor-cross-shot 的差别是「**单镜内**一次触发→结果」，不是光标跨镜当主角。边界收窄即可。

### 23. data.odometer-digit-roll（数字滚轮）
- `TME Design Showreel 2025` 71.5→73 —— 「65→64」数字滚轮。
- `panel1 左上（Lovable）` 13.5→15.5 —— 数字滚动同时底部渐变线生长。
- **校准提示**：当前演示是纯三位数字(128→967)滚动。真实片里数字滚动常**和一条生长线/光点绑定**（panel1），演示可加这一增量。

### 25. rhythm.beat-cut-moves（节拍硬切）
- `瑞幸 lucky 首席幸运官` 21→34 —— 7 组关键词角色 walk-through，按拍切。
- `每日品牌（Excited!）` 67→71 —— 品牌周边 0.3s/切快闪。
- `CDX-GDG 2022` 12.1→12.5 —— 太空 CDX 连切到不同 3D 场景。
- **校准提示**：真实拍切常配「背景大词 + 前景角色 pose」同构模板，而非「主张/产品/证据」三画面。演示可贴近同构模板快切。

### 26. rhythm.speed-ramp-freeze（变速与定格）
- `Google Vids` 64.8→68.4 —— 录制红点→倒计时→真人出镜（定格感）。
- `AGIC 芯片达人` 90→102 —— 高速运动模糊连续藏切多场景。
- **校准提示**：真实「变速」更多是**高速运动模糊藏切**，与 hidden-cut 的速度模糊分支相邻；「急停钉住关键结果」的定格较少。需与 hidden-cut 划界。

### 27. rhythm.montage-rhythm-moves（蒙太奇节奏组）
- `瑞幸 lucky` 21→34 —— 长短镜压缩角色多 pose，末镜落表情网格。
- `a16z 科技创投` 全程 —— 档案素材纯硬切+match-cut 压缩多镜头。
- `Waytoagi 通往 AGI` 18.2→32.5 —— 名画/地标同构图逐幅叠化蒙太奇。
- **校准提示**：与 beat-cut 是「段落 vs 单切」两层。真实蒙太奇常用**同构图叠化**而非纯硬切。

### 28. opening.spotlight-hero-card（聚光主角卡，薄 A）
- `Similarweb Gen AI` 15.6→24.7（及 32.5→36.4）—— 暗色仪表盘上，圆形聚光灯跟随光标只照亮一个数据点/榜单行，圈外全暗。
- `瑞幸 lucky` 10.4→11.7 —— 圆形光圈从角色身后张开（聚光强调）。
- **校准提示**：当前演示是「聚光移动到主角产品卡并放大提亮」。真实聚光是**暗环境里一个移动光圈只锁定一个阅读点**（偏数据/界面，不是产品 hero）。演示应改成「暗仪表盘 + 移动光圈锁定一个数据点」，否则证据对不上。

### 30. typography.paper-title-card（纸面标题卡）
- `ISUX「六月」设计趋势` 0→5.4 —— 纯白叠字卡换字。
- `TME Design Showreel 2025` 5.0→7.0 —— 章节卡套版换字。
- `NextLevel 阿里 Showreel` 1.5→2.6 —— 白底字卡→黑底 Taobao Showreel（字卡章节切）。
- **校准提示**：与当前演示一致。真实章节字卡常**套版同构换字**，可补这一变体。

---

## 三、B 类逐对合并论证（对照证据 + canonical / 别名 + 证据迁移）

### B-1 ｜ ui-entrance.deck-deal-flyin  ↔  ui-entrance.card-stack
- **对照证据**：
  - deck-deal-flyin 自身意图是「三张卡从同一发牌点飞入不同槽位、旋转归正」。真实实例 `Wayframe` 13.0→15.6（线框→手机发牌）在 breakdown 里直接标注 `deck-deal-flyin`。
  - card-stack 实例 `flowith` 36→48、`@creatoroly` 24.7→28.6、`支小宝` 35.5→40（角色+卡堆叠）、`平安知鸟` 16。shard2/shard5 SUMMARY 均把它们合并统计为同一类 `card-stack / card-fly-in 卡片飞入堆叠`（高频，6+ 视频）。
- **判定**：实质同一手法——「多张卡片成组入场并形成可读集合」。「发牌旋转飞入」只是「错落叠放」的一个动作变体。
- **建议**：**canonical = ui-entrance.card-stack**；deck-deal-flyin 降级为其别名/变体标签（`card-stack` 的 `variant: deal-flyin`）。证据全部迁到 card-stack；deck-deal-flyin 不单独保留生产 demo。

### B-2 ｜ transition.circle-match-iris  ↔  transition.match-cut-shape（新 16）
- **对照证据**：
  - 真「圆形遮罩开合(iris)」仅 1 例：`瑞幸 lucky` 40→41.6（表情网格→双胞胎，circle-iris）；另有 `瑞幸` 10.4→11.7 圆形光圈张开。
  - 被误标为「circle-iris」的其实是 **zoom-through portal**：`CDX-GDG` 6.4→11（俯视工作台→圆形舷窗推穿进太空）、`@creatoroly` 10.4→14.3（蓝环穿过进 Portal）。
  - 被误标为「圆形」的其实是 **match-cut-shape**：`ColCircle` 11.5→15.5（银币→点阵环→实心黑圆，圆形状一路对齐）、`阿里` 45.4→49.6（数字 1→6→8 同形切）。
- **判定**：circle-match-iris 的「圆形遮罩开合」在本批证据极薄；圆形母题真正承担的是两种别的手法——「沿圆/环推穿」(zoom-through) 与「锁定圆形硬切换物」(match-cut-shape)。它与 match-cut-shape 不是「开合 vs 开合」，而是「遮罩动画 vs 静态形状硬切」，但作为一张卡它没有独立证据厚度。
- **建议**：**canonical = transition.match-cut-shape**（新卡，4 个强证据，圆/方/数字皆可）；circle-match-iris 收窄为 match-cut-shape 下的「圆形」变体，仅保留 `瑞幸` 真 iris 那 1 例作「遮罩开合」备注；**CDX/ creatoroly 的「圆环推穿」证据迁到 transition.zoom-through-portal**。

### B-3 ｜ camera.space-camera-moves  ↔  hero-orbit-decor-rings / zoom-through-portal / pull-back-reveal-overview（新 16，一对多吸收）
- **对照证据**：space-camera-moves 当前演示是「视野沿空间路径穿过 A/B 环境卡、途经对象短暂停留、抵达目标卡定格」。本批里没有任何一支片按这个抽象意图运镜；真实「相机在空间里动」的证据被新卡瓜分：
  - 居中慢环绕：`Riverside` 86.4→88.2、`TRAE` 123.5→125、`xAI` 39.6→43、`三维动画` 12→13、`蚂蚁` 134→140 —— 全部已归 `camera.hero-orbit-decor-rings`。
  - 沿开口/隧道推穿：`Microsoft Windows 365` 0→5.2、`Blink` 10.4→15.6、`NotReal` 28.7→32.0、`CDX` 6.4→11 —— 已归 `transition.zoom-through-portal`。
  - 单特写后拉顿悟全貌：`flowith` 82.8→84.6、`Stripe` 1.0→5.0 —— 已归 `camera.pull-back-reveal-overview`。
- **判定**：space-camera-moves 是一张「通用相机移动伞卡」，其具体工作已被三张更具体的新卡接管，本批没有它独立的演示实例。
- **建议**：**canonical 不另立**；space-camera-moves 降级为通用占位/别名卡，加「仓库模式·本批视频未覆盖」标签；环绕证据留 hero-orbit-decor-rings、穿行证据留 zoom-through-portal、后拉证据留 pull-back-reveal-overview。**此对为 1 对多吸收，需用户拍板是否保留旧 id 作伞卡。**

---

## 四、C 类清单与保留理由

| id | 中文名 | 为什么本批未出现 | 它可能服务的体裁/场景 | 建议 |
|---|---|---|---|---|
| camera.overhead-camera-moves | 俯拍总览运镜 | 无「俯视网格+虚线路径绘制+推到节点」实例；仅有的俯视镜头是 CDX 舷窗(zoom-through)、不具名公路(match-cut) | 流程/卡片矩阵/对象地图的总览导航 | 保留，加「仓库模式·本批未覆盖」标签 |
| ui-entrance.platform-hinge-rise | 平台铰链升起 | 无「屏幕绕底边铰链 rotateX 翻起」实例；「从底部升起」均为浮起叠加，非铰链翻 | 设备屏幕/数据面板从平躺翻起立起的舞台感入场 | 保留，加标签 |
| ui-entrance.product-card-progressive-assemble | 产品卡渐进组装 | 无「图→标题→指标→按钮按阅读顺序组装单卡」实例；真实错峰是多卡/多行 | 单张产品卖点卡按阅读顺序逐段长成 | 保留，加标签；可参考 list-reveal 的 stagger |
| interaction.command-palette-summon | 命令面板唤起 | 仅 `Riverside` 59 一处「弹出命令面板」且标 ui-drill-in；无「唤起→高亮移动→执行」完整链 | 专业工具/快捷操作的快捷键唤出面板 | 保留，加标签 |
| data.before-after-slider-scrub | 前后对比滑杆 | 无「同一锁定构图+分界滑杆扫前后」实例；真实前后对比走 device-frame 换图 / 分屏 | 优化前后、修复前后、版本差异的单屏对比 | 保留，加标签；与 split-screen 严格区分（交互滑杆 vs 叙事分屏） |
| data.chart-live-moves | 图表动态建立 | 图表多为**已做好的 UI 卡被换内容**，非「坐标→数据生长→标峰值」；仅 panel4 1.0→2.5 一个隐喻线→图 | 趋势/对比/占比图表按阅读顺序动态建立 | 保留，加标签 |
| data.timeline-travel | 时间线穿行 | 无「镜头沿时间轴穿行、节点依次点亮」实例；相关镜头是拖片段进时间线 UI、或 flowith 后拉 | 产品演进/历史路线/流程的时间叙事 | 保留，加标签 |
| opening.brand-ink-open | 品牌墨迹开场 | 无「品牌墨迹向外扩散成遮罩再露标题」实例；品牌开场是粒子聚合/碎片拼/笔画成字 | 品牌片头、视觉主题建立 | 保留，加标签；与 particles-gather-to-logo 一聚一散互补，**不合并** |

---

## 五、9 个疑似重复对的证伪/证实结论

| 疑似对 | 结论 | 理由 |
|---|---|---|
| space-camera-moves ↔ zoom-through-portal | **不重复**（但 space-camera 被 1 对多吸收） | zoom-through = 沿开口/隧道 Z 轴推穿藏切；space-camera = 多对象间建立空间关系。机制不同；只是 space-camera 本批无独立实例，证据被新卡瓜分（见 B-3） |
| circle-match-iris ↔ match-cut-shape | **证实为变体，建议合并** | 真 iris 仅 1 例；圆形母题真实承担的是「锁定形状硬切」(match-cut-shape) 或「圆环推穿」(zoom-through)。circle-match-iris 收窄为 match-cut-shape 的圆形变体（见 B-2） |
| deck-deal-flyin ↔ card-stack | **证实重复，建议合并** | 两者在真实片被同一标注、机制近同（多卡成组入场）。canonical = card-stack（见 B-1） |
| morph-from-primitive ↔ shared-element-morph-chain | **不重复** | 前者单镜内单次生长；后者同一元素跨 3–4 镜连续形变。证据可分（TRAE/平安 vs Zelios/支小宝/Dia），保留两者，收窄边界 |
| before-after-slider-scrub ↔ split-screen-split-merge | **不重复** | 交互滑杆（单构图分界扫动）本批未出现=C；叙事分屏（真一分为二再合回，荣耀/Conduit/Riverside）已由新卡承担。两者是不同手法，不是重复 |
| shot-transitions ↔ montage-rhythm / beat-cut | **不重复（三层）** | shot-transitions = 接缝词典(词汇层)；beat-cut = 单切对齐重音；montage = 长短镜段落节奏。层级不同，保留三者；shot-transitions 建议降级为参考图例 |
| line-carry-transition ↔ match-cut-motion | **不重复** | line-carry = 一条可见的线/光轨/箭头跨切点；match-cut-motion = 主体运动方向出画/入画连续。一个是图形线索，一个是主体动势。证据可分（SaaS MG/Wayframe vs 盒马/瑞幸） |
| depth-layer-moves ↔ pull-back-reveal-overview | **不重复** | depth-layer = 多层连续差速/慢视差建立层级；pull-back = 单个特写后拉一次顿悟全貌（落点是总览）。Library 已明确区分。保留两者 |
| brand-ink-open ↔ particles-gather-to-logo | **不重复（互补）** | brand-ink-open = 墨迹**向外扩散**成遮罩（本批未出现=C）；particles-gather = 粒子**向心聚合**成 logo（新卡，强证据）。一散一聚，方向相反，互补而非重复 |

---

## 六、建议合并清单 & 合并后总卡数

**建议合并/吸收（共 3 组，均以证据为准）：**

1. `ui-entrance.deck-deal-flyin` → 并入 `ui-entrance.card-stack`（canonical：card-stack，deck-deal 为 `variant: deal-flyin` 别名）。
2. `transition.circle-match-iris` → 并入 `transition.match-cut-shape`（canonical：match-cut-shape；真「圆环推穿」证据迁 `transition.zoom-through-portal`）。
3. `camera.space-camera-moves` → 降级为通用占位伞卡（证据被 `camera.hero-orbit-decor-rings` / `transition.zoom-through-portal` / `camera.pull-back-reveal-overview` 三张新卡吸收）。

> 未凑满「4–5 对」：其余 6 个疑似对经证据证伪，不建议合并（见第五节）。以证据为准，不强行多并。

**预计合并后总卡数：**
- 当前 46 张 = 原 30 + 新 16。
- 按本建议：deck-deal-flyin 与 card-stack 合一（−1）、circle-match-iris 并入 match-cut-shape（−1）；space-camera-moves 若降级为占位别名再 −1（视拍板）。
- **保守口径（仅并两张单镜卡）：46 − 2 = 44 张。**
- **激进口径（space-camera-moves 也退役）：46 − 3 = 43 张。**

---

## 七、需用户拍板的争议配对

1. **circle-match-iris 是否彻底退役**：真 iris 开合仅 1 例（瑞幸），但「圆形遮罩开合」作为一种老电影语法仍可能在非产品宣传片（品牌片头）用到。是并入 match-cut-shape，还是保留为稀有「遮罩开合」独立卡？
2. **deck-deal-flyin 的「旋转发牌」动作是否值得独立保留**：它和 card-stack 的唯一差别是「从同一发牌点旋转飞入」，若产品真要做「发牌」仪式感动效，可保留为 variant 而非纯别名。
3. **space-camera-moves 这张伞卡去留**：它的活已被三张新卡接管，是否允许退役（43 张口径），还是保留作「多对象空间关系」的抽象占位（44 张口径）？
4. **morph-from-primitive vs shared-element-morph-chain**：本审计判为「单镜 vs 跨镜」可分，但若团队认为二者演示成本接近，也可考虑把 morph-from-primitive 收为 shared-element-morph-chain 的「单步」变体——倾向于保留，待用户定。

## 八、证据最薄、最该重写演示的 5 张卡

1. **ui-entrance.platform-hinge-rise**（C，0 实例）——「绕底边铰链 rotateX 翻起」本批零出现，演示需重做为「设备屏平躺→翻起立起」的假设式 demo，并加本批未覆盖标签。
2. **camera.overhead-camera-moves**（C，0 实例）——演示里的「俯视网格+虚线路径+推节点」无任何视频支撑，现有「俯视」镜头全是别的手法。
3. **interaction.command-palette-summon**（C，1 弱实例）——「唤起→高亮移动→执行」完整链未出现，仅 Riverside 一次弹窗；演示偏 IDE/专业工具场景，本批产品宣传片不覆盖。
4. **data.chart-live-moves**（C，0 实例）——「坐标→数据生长→标峰值」未出现，真实图表都是做好的 UI 卡被换内容；演示与真实用法脱节。
5. **data.timeline-travel**（C，0 实例）——「沿时间轴穿行、节点点亮」未出现，相关镜头是拖片段/后拉；演示需重写或加标签。

> 次薄（并列，供参考）：`opening.brand-ink-open`、`data.before-after-slider-scrub`、`ui-entrance.product-card-progressive-assemble`、`camera.space-camera-moves`。
