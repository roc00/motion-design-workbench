# panels/panel4_右下.mp4（深色 UI 设计演示右下四分屏段）

## 基础信息
- 类型：UI Demo / 设计工具演示（Figma 风格，跑步 App UI 展示）
- 风格：深灰底 + 紫色高亮光标/虚线框/贝塞尔线；Technical/Premium
- 适用场景：设计工具宣传片、UI 交互动效 demo、"像在 Figma 里设计"的隐喻镜头
- 时长 19.5s / 大致镜头数：cuts 24（大量密集在 3.7–4.4 的一次快速蒙太奇），约 14 镜

## 镜头结构
0–3s 紫色光标在黑底上画贝塞尔曲线，曲线长成一张山形数据图；3–5s 光标变 I-beam，打出 "ANNUAL RUNS"；5–7s 切到白色 UI，虚线框选中一个卡片元素；7–9s I-beam 打字 "Explore new screen"；9–12s 紫色虚线横条扫过，"Wondering..." 字在上方，虚线选择框自画，手机屏从框里长出；12–18s 手机屏滑过展示，最后落到一笔账单列表，虚线框选中 Nike 行。整段主角是**紫色自定义光标**，它贯穿所有镜头。

## 转场实例表
| 时间戳 | 从什么画面 | 到什么画面 | 转场类型(标签) | 前镜留下的锚点 | 后镜如何接入 | 为何自然 |
|---|---|---|---|---|---|---|
| 0.0→1.0 | 黑底角落光标 | 紫色贝塞尔线自画、节点弹出 | line-path-carry / cursor-carry | 紫色三角光标 | 光标拖出一条紫色曲线，白圆点沿线依次 pop | 光标轨迹本身就是新图形 |
| 1.0→2.5 | 单条曲线 | 多座山峰状数据图 | match-cut-shape / line-path-carry | 曲线与节点 | 曲线复制出多段相连，长成折线图 | 一条线扩展成数据结构 |
| 2.5→3.5 | 折线图 | 光标居中成 I-beam 文本光标 | cursor-carry / shape-morph | 紫色光标 | 光标飞到中心，从三角变成 I-beam | 同一个光标换形态进入打字 |
| 3.5→4.5 | I-beam | "ANNUAL RUNS" 大字打字 | typewriter / kinetic-type-match | I-beam | 字符逐位敲出，I-beam 跟随 | 打字动作直接产出标题 |
| 4.0→5.0 | 白背景 UI | 紫色虚线选择框围住 logo 卡 | mask-reveal / cursor-carry | 白场 + 紫色光标 | 虚线框从四角画出，光标停在框内 | Figma 选框隐喻 |
| 5.0→6.0 | logo 卡选框 | "Home Screen 9:41 / CURRENT RUNS" 卡片 | shared-element / device-frame-continuity | 虚线框与光标 | 框拖到下一个卡片元素，内容替换 | 同一选框工具连续操作 |
| 6.0→7.0 | UI 卡 | I-beam 打字 "@" | cursor-carry / typewriter | I-beam | 回到打字状态 | 光标再次换形 |
| 7.0→8.5 | "@" | "Explore ne|w screen" 打字 | typewriter / kinetic-type-match | I-beam 跟随 | 字符逐位敲出，光标竖线闪烁 | 模拟真实输入 |
| 8.5→9.5 | 打字行 | 紫色虚线横条横扫 | wipe-directional / line-path-carry | 紫色虚线 | 一条紫色虚线水平扫过画面 | 虚线作为 wipe 引导线 |
| 9.5→10.5 | 虚线横条 | "Wondering..." 字 + 虚线框自画 | mask-reveal / cursor-carry | 紫色虚线 | 虚线从横线扩展成矩形选框，字在框上方淡入 | 线变框，框变画布 |
| 10.5→12.0 | 空虚线框 | 手机屏从框内滑入 | ui-drill-in / shared-element | 空矩形选框 | 手机屏从左侧滑入，正好填入虚线框 | 空框=占位符，内容填入 |
| 12.0→15.0 | 单部手机 | 多部手机横排滑过 | deck-deal-flyin / match-cut-motion | 手机框 + 紫色光标 | 更多同款手机从右滑入排成一排，光标在底部 "Wondee" pill 上 | 一列屏幕建立多页感 |
| 15.0→17.0 | 手机排 | 账单列表 On Running/Strava/Nike | hard-cut / bg-continuity | 紫色 UI 元素 | 硬切到列表，紫色光标在 | 节拍点切到下一功能 |
| 17.0→18.5 | 列表 | 虚线框选中 Nike 行 + 光标 | cursor-carry / mask-reveal | 紫色光标 | 虚线框从四角画出围住 Nike 行 | 收束回"选框"母题 |

## 动势
- 光标画线成图（0→2.5）：Movement 沿贝塞尔轨迹 / Timing Fast Draw / Ease ease-out / Feeling Technical
- 虚线框自画（9.5→12）：Movement 四角向内收成矩形 / Timing Slow Draw / Ease ease-in-out / Feeling Precise
- 手机排滑过（12→15）：Movement 右→左 / Timing Continuous / Ease linear / Feeling Catalog

## 空间与布局
所有镜头都以"紫色光标"为视觉主角，它在三角指针、I-beam、选框工具之间换形，但永远是画面里唯一的高饱和物体；背景要么纯黑要么纯白，把紫色衬成"设计师的笔"。信息层级是「光标轨迹→图形→文字→UI 屏幕」逐级落地。

## 可沉淀的 Pattern 候选
- **cursor-character-stays**：一个紫色自定义光标在三角指针 / I-beam / 选框四角点之间换形，但颜色与尺寸恒定，贯穿所有镜头（0–18）。解决"无人物的 UI demo 如何保持主角连续"。
- **cursor-draws-line-then-graph**：光标拖出贝塞尔曲线，曲线自复制长成多峰折线图（0→2.5）。解决"从空黑场到数据图的隐喻建立"。
- **dashed-marquee-self-draw**：紫色虚线矩形从四角画出，像 Figma 框选（4→5、9.5→12、17→18）。解决"如何在 UI 演示中表达'正在选中某个元素'"。
- **dashed-line-wipe**：一条紫色虚线水平扫过作为段落 wipe（8.5→9.5）。解决"打字行到下一段的过渡"。
- **empty-frame-then-content-slides-in**：先出现空的虚线占位框，手机屏/卡片随后从边滑入填进框（10.5→12、15→17）。解决"先暗示版面再填入内容的预告式转场"。
- 注：Figma 选框、贝塞尔节点为视觉语言，可程序化复刻。
