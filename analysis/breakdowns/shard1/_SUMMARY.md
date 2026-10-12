# shard1 分片汇总

本分片共分析 7 个视频：
1. Saas产品宣传动画功能介绍一目了然 - 元意空间MG动画制作（18.8s）
2. panels/panel2_右上（19.5s，ClickUp CEO 演讲片段）
3. 请接收你的动画致幻剂～～ - 动态图形设计motion（Blink*，39.8s）
4. @MarkKnd Launch video we made for @Wayframe（45.4s）
5. Microsoft Windows 365 Cloud PC（66s）
6. 全新AI驱动的视频创作应用：Google Vids - Robinson（86.7s）
7. 「NotReal」顶级动态设计工作室 Showreel（494s，已对 28.7–34s、119.5–128s、443–452s 三处加密抽帧）

---

## 1. 转场实例总表（合并，保留视频 + 时间戳）

| 视频 | 时间戳 | 从 → 到 | 转场标签 |
|---|---|---|---|
| SaaS MG | 0.0→1.0 | 图标+箭头 → 卡片堆叠 | wipe-directional / line-path-carry |
| SaaS MG | 3.0→4.0 | 打卡卡+箭头 → 手机 mockup | line-path-carry / device-frame-continuity |
| SaaS MG | 6.0→7.0 | 浏览器 → 弹窗卡 | ui-drill-in |
| SaaS MG | 9.0→10.0 | 绿色按钮 → 手机弹窗 | hard-cut / device-frame-continuity |
| SaaS MG | 12.0→13.0 | 日程表 → 卡片飞散 | shared-element / clone-multiply |
| SaaS MG | 14.0→15.0 | 卡片散 → 绕 Logo 轨道 | shape-morph / shared-element |
| SaaS MG | 15.0→16.0 | 轨道 → 同心圆 Logo | logo-morph / circle-iris |
| SaaS MG | 17.0→18.0 | 时钟 → 缎带对勾落版 | brand-endcard / glow-light-transition |
| panel2 | 0.0→2.28 | 暗底光点 → 白字卡 | glow-light-transition / cross-dissolve |
| panel2 | 2.28→4.0 | 问句 → 紫色 "hype?" | kinetic-type-match / match-cut-color |
| panel2 | 4.88→6.0 | "hype?" → 人物近景 | hard-cut / kinetic-type-match |
| panel2 | 7.47→8.42 | 近景 → 远景人物 | camera pull-out |
| panel2 | 8.42→10.0 | 远景 → 引号字幕 | kinetic-type-match / bg-continuity |
| panel2 | 11.0→13.0 | "reality is" → 红 "95% fail" | kinetic-type-match / glow-light-transition |
| panel2 | 17.42→18.0 | 近景 → 远景+WTF | camera pull-out / kinetic-type-match |
| Blink | 0.0→3.9 | 发光黑柱 → 粉彩爆炸 | glow-light-transition / push-in-reveal |
| Blink | 6.5→7.8 | 头像墙 → 缎带字 | hard-cut / match-cut-motion |
| Blink | 10.4→15.6 | 缎带字 → 隧道字墙穿越 | zoom-through / parallax-push |
| Blink | 15.6→16.9 | 隧道出 → Behance 立方体 | match-cut-shape / shared-element |
| Blink | 16.9→22.1 | 数据卡 + 奖杯皇冠 | shared-element / clone-multiply |
| Blink | 23.4→24.6 | "WHAT DO WE DO?" → 缩略图墙 | mask-reveal / grid-reveal |
| Blink | 24.6→28.7 | 图墙 → 分类图墙 | split-screen / hard-cut |
| Blink | 29.9→31.2 | "AND MUCH MORE" → 白场 | fade-white |
| Blink | 31.2→36.4 | 白场 → CTA 打字 | bg-continuity / kinetic-type-match |
| Blink | 36.4→37.7 | 白场 → 黑场 Blink Logo | fade-black / brand-endcard |
| Wayframe | 0.0→1.3 | 碎片 → 拼 Logo | shared-element / logo-morph |
| Wayframe | 2.6→5.2 | 标语 → 输入框 | bg-continuity / cursor-carry |
| Wayframe | 6.5→7.8 | 打字 → 发送 | cursor-carry / input-trigger-moves |
| Wayframe | 9.1→11.7 | 空线框 → 按钮→UI 生长 | ui-drill-in / push-in-reveal |
| Wayframe | 13.0→15.6 | 线框 → 手机发牌 | deck-deal-flyin / device-frame-continuity |
| Wayframe | 16.9→18.2 | 字幕 → 手机选框 | cursor-carry / ui-drill-in |
| Wayframe | 19.5→23.4 | 手机内换图 | device-frame-continuity |
| Wayframe | 24.7→27.3 | 桌面 → 字幕 | bg-continuity |
| Wayframe | 28.6→31.2 | 仪表盘 → 代码窗 | match-cut / bg-continuity |
| Wayframe | 32.5→35.1 | 代码 → 终端光轨 | line-path-carry / glow-light-transition |
| Wayframe | 36.4→37.7 | Cursor → "Design Reimagined" | bg-continuity |
| Wayframe | 39.0→41.6 | "Out now" → Logo | logo-morph / brand-endcard |
| Win365 | 0.0→2.6 | 书桌 → 显示器浏览器 | push-in-reveal / zoom-through |
| Win365 | 3.9→5.2 | 地址栏 → 回书桌 | match-cut / zoom-through |
| Win365 | 9.1→11.7 | 设备 → 玻璃缎带+规格卡 | object-occlusion / shared-element |
| Win365 | 13.0→15.6 | 液体波 → Windows 壁纸 | liquid-gradient / glow-light-transition |
| Win365 | 19.5→24.7 | 窗口 → 缎带载图标 | shared-element / line-path-carry |
| Win365 | 26.0→29.9 | PPT 图标 → 点开文档 | cursor-carry / screen-record-punch |
| Win365 | 31.2→32.5 | 文档 → 视频会议窗 | split-screen / hard-cut |
| Win365 | 33.8→36.4 | 视频会议 → 笔记本浏览器 | device-frame-continuity |
| Win365 | 37.7→39.0 | 笔记本 → 规格卡复用 | shared-element |
| Win365 | 40.3→44.2 | 规格 → 等距方块 | parallax-push / isometric-block |
| Win365 | 45.5→50.7 | 方块 → 电路网格推进 | parallax-push |
| Win365 | 52.0→57.2 | 笔记本换办公室/客厅/暗室 | device-frame-continuity / match-cut |
| Win365 | 58.5→62.4 | 多环境 → 白场字卡→Logo | fade-white / brand-endcard |
| Google Vids | 0.0→1.8 | designer → storyteller | kinetic-type-match |
| Google Vids | 3.6→5.4 | +New 按钮 → 播放三角 | shared-element |
| Google Vids | 7.2→9.0 | 打字 → 胶囊标签 | typewriter / kinetic-type-match |
| Google Vids | 10.8→12.6 | 文件夹 → Creating 加载 | input-trigger-moves / loading |
| Google Vids | 14.4→16.2 | 剪辑 → 表格 | hard-cut |
| Google Vids | 18.0→19.8 | 字卡 → 风格面板 | kinetic-type-match / ui-drill-in |
| Google Vids | 21.6→25.2 | 黄模板 → 青模板 | match-cut-color / cards |
| Google Vids | 27.0→30.6 | 字卡 → 麦克风→Script 面板 | ui-drill-in / cursor-carry |
| Google Vids | 32.4→34.2 | 脚本流式出现 | ai-stream-response |
| Google Vids | 41.4→43.2 | 音色列表选中 | input-trigger-moves |
| Google Vids | 45.0→46.8 | 波形 → 评论 | hard-cut |
| Google Vids | 54.0→57.6 | Stock → 搜索→图网格 | type-and-filter / list-reveal |
| Google Vids | 59.4→61.2 | 图拖入时间线 | cursor-carry / drag |
| Google Vids | 64.8→68.4 | 录制 → 倒计时→真人 | countdown / freeze-frame |
| Google Vids | 75.6→77.4 | Play → "AI powered" | shared-element / kinetic-type-match |
| Google Vids | 84.6 | → Google Workspace 落版 | brand-endcard |
| NotReal | 0.0→2.4 | 粉色流体 → 鸡尾酒台 | hard-cut / match-cut-color |
| NotReal | 26.4→28.4 | 紫球滚落 → IDEAS 字卡 | hard-cut / kinetic-type-match |
| NotReal | 28.7→30.5 | 字卡 → 线框隧道 | push-in-reveal / zoom-through |
| NotReal | 30.5→31.5 | 蓝螺旋隧道穿越 | parallax-push / zoom-through |
| NotReal | 31.5→32.0 | 隧道粉圆 → 运动鞋 | match-cut-shape / shape-morph |
| NotReal | 32.0→34.0 | 运动鞋落蛋糕台 | object-continuity |
| NotReal | 34.0→34.4 | 蛋糕台 → NotReal Logo | hard-cut / brand-endcard |
| NotReal | 119.5→120.5 | 空白 → 画笔 Logo+打字 | brush-stroke / kinetic-type-match |
| NotReal | 121.0→122.0 | Logo → 粉紫缎带 | shape-morph / liquid-gradient |
| NotReal | 122.5→123.5 | 缎带托 UI 卡 | shared-element / line-path-carry |
| NotReal | 124.0→125.0 | UI 卡 → 厨房食谱书 | push-in-reveal / object-scale |
| NotReal | 127.5→128.0 | 食谱书 → 饼干特写+搜索栏 | hard-cut / cursor-carry |
| NotReal | 444.0→444.5 | 绿皮带 → 手包+K 字 | kinetic-type-match / hard-cut |
| NotReal | 446.5→447.0 | 蓝皮 L → 紫 M 包 | kinetic-type-match / hard-cut |
| NotReal | 448.5→450.0 | 手比 M 字 | object-formed-letter |
| NotReal | 451.0→451.5 | YSL 包 → 碎裂 | particle-dissolve |
| NotReal | 480→492 | 物件逐层平衡收尾 | object-chain / rube-goldberg（灵感参考）|

---

## 2. Pattern 候选按频次排序（≥2 个不同视频标「高频」）

| 排序 | 工作名 | 机制一句话 | 出现视频 / 时间 | 级别 |
|---|---|---|---|---|
| 1 | `grid-bg-continuity-cursor` | 单一底色/网格全程不变，光标带注意力跨 UI 移动 | Wayframe 5–23s；Win365 整片蓝调；Google Vids 浅色 UI；panel2 白场 | 高频 |
| 2 | `outline-letter-product-alphabet` | 每镜叠一个大号细轮廓字母，硬切但字母母题串成序列 | NotReal 444–451；Blink 隧道字墙 10–15；panel2 字卡换词 | 高频 |
| 3 | `tunnel-word-wall-flight` / `wireframe-vanishing-point-tunnel` | 平面字卡向消失点收缩成隧道，镜头 Z 轴穿越后在新场景中心出产品 | NotReal 28.7–32（加密确认）；Blink 10.4–15.6 | 高频 |
| 4 | `device-frame-content-or-env-swap` | 同一设备框外框不动，框内换内容，或框不变背景环境换 | Wayframe 19.5–23.4（换内容）；Win365 52–57.2（换环境）；SaaS MG 3–4 | 高频 |
| 5 | `glow-bloom-to-scene` | 单发光体过曝膨胀/化开成新场景或品牌 | panel2 0–2.28、13；Blink 0–3.9；Win365 13–15.6；NotReal 开场 | 高频 |
| 6 | `logo-stroke-to-ribbon-card-to-object` | 品牌笔画自绘→抹成流动缎带→缎带托出 UI 卡→卡放大成实物 | NotReal 119.5–125（加密确认）；Win365 19.5–24.7 缎带载图标 | 高频 |
| 7 | `fragment-logo-assemble` | Logo 拆成碎片再拼合，首尾呼应 | Wayframe 0–1.3、39–41.6；SaaS MG 14–16 卡片收 Logo | 高频 |
| 8 | `screen-zoom-in-out-loop` | 镜头推进屏幕进 UI，再退出回真实设备 | Win365 0–5.2；NotReal 隧道穿越同原理 | 高频 |
| 9 | `cursor-carry-action-result` | 光标把"触发→结果"动作成对可视化 | Wayframe 多处；Win365 26–29.9；Google Vids 59.4–61.2；NotReal 127.5 | 高频（与现有 `interaction.input-trigger-moves` 相邻，增量在跨镜连续） |
| 10 | `line-path-carry` | 一条线/箭头/光轨跨镜维持方向 | SaaS MG 0–4；Win365 19.5–24.7；Wayframe 32.5–35.1 | 高频（与现有 `transition.line-carry-transition` 重合，不另立卡） |
| 11 | `accent-word-glow-punch` | 句末重音词用对比色+辉光打成视觉重音 | panel2 4s/13s/18s；Blink 22s 数据字 | 中频 |
| 12 | `speaker-scale-pull-quote` | 人物景别近/远切换区分"本人观点 vs 引用" | panel2 7–10、17.4 | 单次 |
| 13 | `card-explode-orbit-to-logo` | 卡片炸成散点再绕 Logo 收成光圈 | SaaS MG 12–16 | 单次 |
| 14 | `ribbon-checkmark-endcard` | 品牌色 3D 缎带斜扫出对勾落版 | SaaS MG 17–18 | 单次 |
| 15 | `liquid-surface-to-os` | 液体波纹化开成系统界面 | Win365 13–15.6；NotReal 121–122 | 中频 |
| 16 | `spec-to-isometric-blocks` | 规格数字物化成等距方块纵深推进 | Win365 40.3–50.7 | 单次 |
| 17 | `type-prompt-to-chip` | 口语输入打字收成结构化胶囊 | Google Vids 7.2–9 | 单次 |
| 18 | `countdown-to-recorded-face` | 录制红点→倒计时→真人出镜 | Google Vids 64.8–68.4 | 单次 |
| 19 | `fade-white-type-campaign` | 过曝白场后打字机出 CTA | Blink 29.9–36.4 | 单次 |
| 20 | `light-stream-carry-action` | 一道光轨从按钮射出连接下一步 | Wayframe 32.5–35.1 | 单次 |
| 21 | `prop-reused-data-grid` | 同组陈列道具在多张数据卡间复用 | Blink 16.9–22.1 | 单次 |
| 22 | `object-balance-rube-end` | 物件链式堆叠平衡收尾 | NotReal 480–492（灵感参考） | 单次 |

---

## 3. 风格差异小结

| 视频 | 基调 | 转场主力 | 对框架的贡献 |
|---|---|---|---|
| SaaS MG | 浅蓝扁平 3D，轻快 | 箭头引导、卡片飞散收拢、缎带落版 | 轻量 SaaS 收尾 Pattern |
| panel2 | 白场真人+大字，观点型 | 景别拉远+字卡换词+辉光重音 | 演讲/Keynote 衔接 |
| Blink | 粉彩高能量蒙太奇 | 隧道穿越、爆炸开场、白场 CTA | 机构片爆点与口号串接 |
| Wayframe | 深蓝网格，极简科技 | 底色连续+光标贯穿+光轨 | AI 工具多 UI 无缝串联的范本 |
| Win365 | 微软高端 3D CGI | 屏幕推进闭环、缎带载体、设备框换环境、等距方块 | 企业片虚实交替叙事 |
| Google Vids | Google 浅色 UI 实拍 | 工作流硬切+打字/流式/倒计时 | 与现有 UI 卡重合度高，增量少 |
| NotReal | 多客户合集快切 | 隧道穿越、Logo 笔画→缎带→实物、字母母题硬切 | 最具电影化增量的两段无缝长运镜 |

**共性结论**：本分片最稳定的跨片衔接语言是「单一底色/容器做 bg-continuity + 一个贯穿性锚点（光标 / 缎带 / 字母 / 设备框）」，它让多个 UI 或产品镜头不靠硬切也能连起来。电影化增量主要集中在三处：① 字卡→隧道穿越→产品的 Z 轴推进；② Logo 笔画流成缎带再托出 UI/实物；③ 设备框内换内容或换环境。Google Vids 类纯 UI 导览片与现有 30 卡重合度最高，不建议重复立卡。
