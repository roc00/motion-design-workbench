# 导演参考与技术参考

导演侧决定观众理解、叙事顺序、主体身份、视点、表演、剪辑动机与节奏。技术侧决定局部交互、运动原语、Shader、参数与工具。使用工具前，先说明该镜头承担的叙事任务。

工作台的导演案例包含完整影片 2 部、镜头段落 5 个、叙事结构 6 种。完整词典提供技术做法。`directorPatterns` 用于规划叙事；`shotRecipes` 提供镜头语法与表演索引，并通过 `canonicalEffectId` 连接词典。索引不重复计为新内容。

`director.collection` 展示单体展开为群像：一张珊瑚作品变成八张不同作品，再确认原作。此示例为 8.6 秒浏览器演示，无音轨。实际 Shot Plan 需要按素材、阅读时间与交接动机展开。

CSS/Motion/GSAP 组织时间与 DOM；WebGL/Three.js/p5.js 处理图形与空间；Chart.js/ECharts 处理数据图表。Lottie/Rive 仅在有预制素材且可以验证 seek 时考虑。工具是实现选择，渲染层是责任合同。

## 镜头语法与词典入口

| ID | 名称 | 职责 | 维度 / 入口 |
|---|---|---|---|
| `camera.crash-zoom-punch` | 急推强调 | director | `viewpoint` |
| `camera.depth-layer-moves` | 纵深分层运镜 | director | `viewpoint` |
| `camera.overhead-camera-moves` | 俯拍总览运镜 | director | `viewpoint` |
| `transition.shot-transitions` | 镜头交棒组合 | director | `continuity` |
| `transition.transition-hidden-cut` | 遮挡藏切 | director | `continuity` |
| `transition.wipe-transitions` | 方向擦除 | technical | `enter.wipe` |
| `transition.card-flip-reveal` | 卡片翻面揭示 | technical | `pointer.tilt-card` |
| `transition.circle-match-iris` | 圆形匹配开合 | technical | `enter.clip-path-reveal` |
| `transition.line-carry-transition` | 线索接力转场 | director | `continuity` |
| `ui-entrance.platform-hinge-rise` | 平台铰链升起 | technical | `enter.slide` |
| `ui-entrance.card-stack` | 卡片堆叠展开 | technical | `layout.layout-animation` |
| `ui-entrance.product-card-progressive-assemble` | 产品卡渐进组装 | technical | `handling.stagger` |
| `ui-entrance.list-reveal` | 列表渐进揭示 | technical | `handling.stagger` |
| `ui-entrance.morph-from-primitive` | 基础形态生长 | technical | `layout.shared-element` |
| `interaction.type-and-filter` | 输入并筛选 | technical | `text.typewriter` |
| `interaction.ai-stream-response` | AI 流式响应 | technical | `text.typewriter` |
| `interaction.command-palette-summon` | 命令面板唤起 | technical | `component.modal` |
| `interaction.input-trigger-moves` | 输入触发动作 | technical | `ux.feedback` |
| `data.before-after-slider-scrub` | 前后对比滑杆 | technical | `chart.before-after` |
| `data.chart-live-moves` | 图表动态建立 | technical | `chart.line-trend` |
| `data.odometer-digit-roll` | 数字滚轮 | technical | `feedback.counter` |
| `data.timeline-travel` | 时间线穿行 | director | `rhythm` |
| `rhythm.beat-cut-moves` | 节拍硬切 | director | `rhythm` |
| `rhythm.speed-ramp-freeze` | 变速与定格 | director | `rhythm` |
| `rhythm.montage-rhythm-moves` | 蒙太奇节奏组 | director | `rhythm` |
| `opening.spotlight-hero-card` | 聚光主角卡 | technical | `pointer.spotlight` |
| `opening.brand-ink-open` | 品牌墨迹开场 | technical | `enter.mask-reveal` |
| `typography.paper-title-card` | 纸面标题卡 | technical | `text.line-reveal` |
| `transition.zoom-through-portal` | 穿框穿越运镜 | director | `continuity` |
| `transition.match-cut-shape` | 同形匹配剪辑 | director | `continuity` |
| `transition.match-cut-color-veil` | 整屏色幕藏切 | director | `continuity` |
| `transition.match-cut-motion` | 动势方向匹配 | director | `continuity` |
| `transition.glow-bloom-to-scene` | 发光体化开新场景 | technical | `enter.blur-reveal` |
| `transition.shared-element-morph-chain` | 共享元素连续形变跨镜 | director | `performance` |
| `ui-entrance.device-frame-content-swap` | 设备框内换内容 | director | `performance` |
| `interaction.persistent-cursor-cross-shot` | 光标跨镜主角 | director | `performance` |
| `ui-entrance.clone-multiply-to-grid` | 单元素克隆增殖成墙 | director | `performance` |
| `transition.liquid-gradient-section-divider` | 流体光晕章节分隔 | technical | `enter.crossfade` |
| `opening.particles-gather-to-logo` | 粒子聚合品牌字标 | technical | `enter.scale` |
| `typography.word-slot-scramble-swap` | 文字槽乱码换词 | technical | `text.scramble` |
| `camera.hero-orbit-decor-rings` | 中心环绕装饰环 | technical | `scroll.parallax` |
| `transition.ui-drill-in-out` | UI 钻进钻出 | director | `viewpoint` |
| `transition.split-screen-split-merge` | 分屏合分 | director | `continuity` |
| `camera.pull-back-reveal-overview` | 后拉揭示全貌 | director | `viewpoint` |
