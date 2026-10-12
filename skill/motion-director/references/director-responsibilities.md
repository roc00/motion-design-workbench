# 导演参考与技术参考 · 2026-10-11

导演侧决定观众理解、叙事顺序、主体身份、视点、表演、剪辑动机与节奏。技术侧决定局部交互、运动原语、Shader、参数与工具。相同技术可以服务多种叙事，导演不能用工具名称替代叙事理由。

工作台结构：叙事结构 → 镜头语法 / 角色与表演 → 完整案例与段落 → 制作包。完整词典是技术做法的唯一入口；技术做法只挂在对应 effect 详情中，不增加同名顶层卡。

原 44 卡按 presentation.role 分流。sourceCategory 仅记录开源来源，不再作为产品主分类。technical 记录 canonicalEffectId；它是关联实现入口，不意味着语义完全等价或生产已适配。director 记录 viewpoint / continuity / rhythm / performance。来源、证据、ID 与旧链接保留。

六种叙事结构记录在 director-patterns.json，与旧的生产适配合同 compositions.json 分别表达不同能力：新演示是 browser-demo 的导演结构参考，旧合同继续作为底层适配记录。每个导演结构有三段叙事节拍（shots 数组的 unitType 为 narrative-beat）、两条交接关系、观众理解与阅读停留。实际 Shot Plan 根据内容再展开，不强制每个节拍都是切镜；实际演示展示情境和主体变化。不得把浏览器示例标成已验证成片。

工具与渲染层保留四层。CSS/Motion/GSAP 组织时间与 DOM；WebGL/Three.js/p5.js 处理图形与空间；Chart.js/ECharts 处理数据图表。工具是实现选择，渲染层是责任合同。Lottie/Rive 放到素材按需播放器：当前项目未接入其运行时，只有提供预制素材时才考虑。新增库仅记录参考与路由，没有新增生产依赖。

注册表职责集合是索引，通过 recipeId 读取 shotRecipes 中的唯一原文。不得把索引重复计数。当前分流：镜头语法 17、表演角色 4、技术做法 23；共 44 条原记录。


## v0.14：案例优先与旧演示退役

工作台将“叙事结构 / 镜头语法 / 角色与表演 / 成片与段落”整合为一个导演案例入口。观看范围为完整影片 2、镜头段落 5、叙事拆解 6；主角、视点、交接动机是案例注释，不再各建一个低质量演示库。此结构取代上文的旧导航描述。

21 条导演原理保留原 ID、来源、语义与映射，`presentation.previewStatus=retired`；10 条历史序列保留来源与时间，`previewStatus=retired`。旧链接进入原理说明与相关案例，不自动播放旧演示。相关案例不宣称为原技法的完整替代。23 条技术做法继续通过 canonicalEffectId 关联完整词典。

“单元素克隆增殖成墙”单独重建为 director.collection：一张珊瑚作品 → 八张不同作品组成群像 → 在群像中确认原作。固定摄影机，使用主体走位与尺寸变化；每张作品的内容不同，原作身份不丢失。8.6 秒独立概念演示，无音轨、未导出 MP4。

UI、registry.directorCases、Skill 的 cinematic-sequences 只推荐当前案例。原知识放 registry.shotRecipes；退役清单为 registry.retiredPreviews。Skill 构建会清除以前复制进去的历史演示文件，避免重建后重新出现。

指南与最终 Skill 保持共享 ID / 原理 / 案例 / 实现 / 验收的映射，未来继续以此共享数据源维护，不把页面分类机械复制为 Skill 指令。

## 原卡归属与词典入口

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
