# 智能AI软件宣发动画（参考 Google 丝滑宣传，元意空间 MG 动画制作）

## 基础信息
- 类型：MG 动画 / 产品宣传（Gemini 风格 AI 软件）
- 风格：白底极简 + 品牌四色，玻璃拟态 pill，丝滑 MG
- 适用场景：AI 工具/浏览器类宣发，「logo 字母变工具栏 + 工具栏跨场携带」可直接借鉴。
- 时长 / 大致镜头数：19.2s，cuts 14 个，MG 快节奏；约 12 个状态。

## 镜头结构
- 开场（0–4s）：Google 风搜索页 logo，字母「o」变形为 app 图标滑入，整个 logo 变成一条工具栏。
- 中段（4–14s）：工具栏滑到屏幕底部并跨多个 3D 场景携带（分子/水滴/代码），星芒分隔段，依次演示 draw kers / Summarize email / Ask Gemini。
- 收尾（14–19.2s）：粉色辉光搜索栏 → 搜索结果 →「Welcome to the Gemini era」落版。
- 节奏：MG 快切，每段 1–2s，星芒做章节点。

## 转场实例表（宁多勿漏）
| 时间戳 | 从什么画面 | 到什么画面 | 转场类型(标签) | 前镜留下的锚点 | 后镜如何接入 | 为何自然 |
|---|---|---|---|---|---|---|
| 0.0–1.5s | 搜索页 Google logo | 「o」开始变形 | shape-morph / shared-element | 字母 o 的形状 | o 变成 + / 图标 | 字母=图标位置 |
| 1.5–3.0s | logo | app 图标逐个滑入字母间隙 | shared-element / card-stack | Go...gle 字母位 | 图标滑入填位 | 字形被工具栏替换 |
| 3.0–4.0s | 字母间图标 | 完整「工具栏」夹在 Go...gle 之间 | shape-morph / shared-element | 字母位置 | logo 进化成工具栏 | 品牌名=工具集合 |
| 4.0–5.0s | 顶部工具栏 | 工具栏滑到屏幕底部，露出 3D 分子场景 | shared-element / line-path-carry | 同一条工具栏 | 工具栏沿轨迹下移并跨场 | 工具栏当穿越锚点 |
| 5.0s | 白底 | 蓝色星芒爆点 | glow-light-transition | 白底 | 星芒闪过 | 章节点 |
| 6.0s | 星芒 | 代码行「Explain th...」 | ui-drill-in / cross-dissolve | 黑底 | 代码浮现 | 功能演示 |
| 7.0s | 代码 | 紫色星芒 | glow-light-transition | 星芒母题 | 再次爆点 | 重复章节点 |
| 8.0s | 星芒 | 「G Search」pill + 星 | shared-element / card-stack | 星 | pill 弹出 | 入口 |
| 9.0s | pill | 「Hi I'm Gemini,」 | kinetic-type-match | 黑底 | 字浮现 | 角色登场 |
| 10.0s | 字 | 红色星芒「Generati...」 | glow-light-transition / shape-morph | 星芒 | 红星芒+字 | 章节点 |
| 11.0s | 星芒 | 深色底「draw kers|」打字 | kinetic-type-match / ui-drill-in | 黑底 | 打字 | 演示创作 |
| 12.0s | 打字 | 红条 +「Sure, here is a kersploooosh」+ 两张水滴图 | ui-drill-in / shared-element | 黑底 | 结果图出现 | 查询→结果 |
| 14.0s | 结果图 | Gemini 聊天窗「Summarize this email」 | ui-drill-in / cross-dissolve | 深色 | 聊天窗淡入 | 换功能 |
| 15.0s | 聊天窗 | 粉色辉光搜索栏 | glow-light-transition / shape-morph | 辉光 | 粉辉化作搜索栏 | 氛围连续 |
| 16.0s | 搜索栏 | 搜索结果页 | ui-drill-in | 搜索栏 | 结果填入 | 查询→结果 |
| 17.0s | 结果页 | 下拉「re」+「Ask Gemini」+ 头像 | ui-drill-in / shared-element | 界面 | 下拉展开 | 功能入口 |
| 18.0–19.2s | 入口 | 「Welcome to the Gemini era」落版 | brand-endcard / fade-black | 黑场 | 字浮现 | 收尾 |

自造标签：
- letters-to-toolbar：品牌名里的字母逐个变形为 app 图标滑入，整个 logo 进化成一条工具栏，再沿轨迹下移跨场景携带（0–5s）。

## 动势（挑最典型）
- **letters-to-toolbar（0–5s）**
  - Movement：字母位局部形变（o→图标）→ 图标水平滑入 → 整条工具栏沿对角线下移到底部。
  - Timing：Medium Build（~3s）/ Fast Carry（~1s）。
  - Easing：图标滑入 ease-out，工具栏下移 ease-in-out。
  - Feeling：Premium / Technical。
- **星芒章节点（5/7/10s）**
  - Movement：中心向外爆。
  - Timing：Fast Burst。
  - Easing：ease-out。
  - Feeling：Dynamic。

## 空间与布局
- 开场白底居中，logo 字母是视觉骨架；工具栏成型后成为一条横贯屏幕的「道具」，被带到屏幕底部并在后续每个 3D 场景底部重复出现，相当于一条穿越所有场景的 UI 底栏。

## 可沉淀的 Pattern 候选
1. **letters-to-toolbar（字母变工具栏）**：品牌名里的字母（尤其 o/圆）变形为 app 图标逐个滑入，整个 logo 进化成一条工具栏，再沿轨迹下移到底部。证据 0–5s。解决「品牌 logo→产品功能入口」的无缝引入。
2. **toolbar-carry（工具栏跨场携带）**：成型的工具栏沿轨迹滑到屏幕底部，在后续所有场景底部重复出现，成为穿越锚点。证据 4–5s、贯穿中段。解决「多场景演示中如何保持 UI 连续」。
3. **starburst-section-marker（星芒章节点）**：在白底/黑底之间用一个彩色四角星芒爆点作章节分隔，星芒颜色随段变化。证据 5.0s、7.0s、10.0s。解决「MG 快切段间分隔」，比硬切更有节奏。
4. **glow-to-searchbar（辉光变搜索栏）**：一团彩色辉光凝聚成搜索输入栏。证据 15.0s。解决「氛围→输入框」的衔接。
5. **cursor-typing-result（打字出结果）**：搜索栏逐字键入，结果图/聊天窗随后出现。证据 11.0s、14.0s。解决「输入→结果」因果演示。
