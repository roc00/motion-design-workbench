# Framer 网页设计 Agent

## 基础信息
- 类型：设计工具产品发布片（Framer 3.0 / Agent）
- 风格：深色科技感 + 荧光蓝光效，UI 录屏与光效粒子交织
- 适用场景：设计工具/AI 编程工具发布、深色系 SaaS 产品演示
- 时长 / 大致镜头数：75s / cuts 11 个，约 15 镜

## 镜头结构
- 0–9s：暗场 UI，一道蓝色垂直光束作为锚点，文件浏览器展开，蓝色 Publish 按钮发光。
- 10–16s：Publish/Invite 按钮组、Agent/Style 标签、"Ask Framer..." 输入框，HAUS 网站浮现。
- 18–25s：MERIDIAN 模板 → AI 对话气泡叠加在画布上（"Use these new text styles..."）→ 点 Match → 网站更新。
- 27–35s：HAUS 多页面 → "Build a Framer code component..." 提示 → 图片拼贴 → 粒子点阵。
- 36–43s：文字 scramble（chatoyant idyll lagoon lullaby）→ "Works everywhere" → 文件浏览器。
- 45–48s：快速 UI 缩略图蒙太奇（ROBBIE CAMARO）。
- 50–52s：蓝色光束 + "Welcome to a / whole new Framer"。
- 54–62s：蓝色光带电影感滑行，文字逐句（Design with agents / Refine on the canvas / Ship with / with your team / Framer 3.0）。
- 63–70s：蓝光粒子聚合成 Framer F logo 落版。
- 节奏：UI 演示段 4–6s 可读，光效段 2s 一句口号。

## 转场实例表（最重要，宁多勿漏）
| 时间戳 | 从什么画面 | 到什么画面 | 转场类型(标签) | 前镜留下的锚点 | 后镜如何接入 | 为何自然 |
|---|---|---|---|---|---|---|
| 0.0–3.6s | 暗场 UI | 蓝色垂直光束 | glow-light-transition | 蓝色光束 | 光束从文件列表中垂直长出 | 光做锚 |
| 5.4–7.2s | 文件浏览器 | 蓝色竖线持续 | shared-element | 蓝色竖线 | 竖线不动，周围 UI 切换 | 光做桥 |
| 9.0s | 暗场 | 大蓝 Publish 按钮发光 | glow-light-transition | 蓝色光 | 按钮被蓝光包裹点亮 | CTA 焦点 |
| 10.8–16.2s | 按钮组 | Agent 标签页→HAUS 网站 | ui-drill-in / shared-element | 顶部按钮栏 | 顶部 UI 不变，下方从按钮区钻到画布 | 顶层 UI 不动，下层换内容 |
| 18.0–21.6s | MERIDIAN 模板 | AI 对话气泡叠加 | shared-element / cursor-carry | 设计画布 | 气泡从画布上方浮起，指向"Match"按钮 | 气泡做交互锚 |
| 23.4–25.2s | 气泡+Match | 网站自动更新 | ui-drill-out / screen-record-punch | 画布 | 点 Match 后画布内容连续变化 | 录屏缩放 |
| 27.0–32.4s | HAUS 多页 | 代码组件提示→图片拼贴 | shared-element | 提示气泡 | 气泡换内容，下方图片网格展开 | 气泡复用 |
| 34.2–36.0s | 图片拼贴 | 粒子点阵 | particle-dissolve | 图片 | 图片散成粒子点阵 | 粒子化 |
| 36.0–37.8s | 粒子点阵 | scramble 文字 → "Works everywhere" | kinetic-type-match / blur-rack-focus | 粒子 | 粒子聚成 scramble 文字，解码后显示 | 粒子→文字 |
| 39.6–46.8s | 文件浏览器 | 多文件视图→UI 蒙太奇 | split-screen / montage-rhythm | UI 网格 | 多个 UI 缩略图快速拼接 | 蒙太奇 |
| 50.4–52.2s | UI 蒙太奇 | 蓝色光束+口号 | glow-light-transition / line-path-carry | 蓝色水平光带 | 光带横扫，文字随光带出 | 光做 transport |
| 54.0–61.2s | 光带 | 逐句口号（Design with agents...） | glow-light-transition / kinetic-type-match | 蓝色光带 | 光带持续滑行，文字一句句浮现其上 | 光做载体 |
| 63.0–68.4s | 口号 | 蓝光粒子→Framer F logo | particle-dissolve / logo-morph | 蓝光粒子 | 粒子聚合成 F logo | logo 聚合 |

## 动势
- 蓝色光束（0–7s / 50–61s）：垂直→水平，线性高速滑行，光带带辉光。Easing 线性。Feeling Premium / Cinematic。
- 粒子聚合（36s / 68s）：粒子先散后聚，ease-in。Feeling Technical。
- AI 气泡指向（21s）：气泡浮起，箭头指向 Match 按钮，spring。Feeling Technical。

## 空间与布局
- 全片深色底，蓝色光束是贯穿始终的视觉主线：垂直开场、水平中段、收尾聚合成 logo；UI 演示始终叠加在暗背景上，用辉光做焦点。

## 可沉淀的 Pattern 候选
1. **light-beam-as-transport**：一道荧光色光束（垂直/水平）贯穿全片，UI 在光周围出现/消失，光即转场轨道（0–7s / 50–61s）。解决：深色产品片需要一个贯穿性视觉主角。
2. **floating-ai-bubble-over-canvas**：AI 对话气泡叠加在设计画布上，气泡内是指令，箭头指向"执行"按钮，点完画布自动更新（18–25s）。解决：AI Agent 编辑设计的"指令→执行"可视化。
3. **scramble-to-slogan**：粒子点阵→scramble 文字→解码成口号（36–38s）。解决：口号登场的科技感。
4. **particle-logo-aggregate**：光粒子聚合成品牌 logo 落版（63–68s）。解决：品牌收尾。
5. **ui-montage-flash-grid**：多个 UI 缩略图快速拼接成蒙太奇表达"多能力"（45–48s）。解决：产品功能集合的快速罗列。
