# 动效选型工作台

[在线工作台](https://roc00-motion-workbench.pennnnnnn-d.chatgpt.site) · [GitHub 公开仓库](https://github.com/roc00/motion-design-workbench)

默认首页为**完整词典**。配套 Skill 在 [skill/motion-director](skill/motion-director)，发布与维护方式见 [发布文档](docs/08-发布与维护.md)。

把「网页动效词典」改造成一套**给 Agent 制⽤动效视频时查阅和引用的选型体系**：数据源 + 规范文档 + 可交互预览站。

当前导演入口为“导演案例”：完整影片 2、镜头段落 5、叙事拆解 6。旧导演示意与历史序列已撤下演示入口；原理和来源保留。指南与最终 Skill 的映射持续维护在共享注册表中，见文末 v0.14 和职责文档。

技术词典的三条正交轴：

- **描述轴**（怎么把它说清楚）：技术工具 → 触发方式 → 动效类型 → UX 规则
- **选型轴**（这个镜头该用什么）：文字展示 / 背景转场 / 卡片展示 / 手机产品演示 / 图表数据叙事
- **性质轴**（它是什么）：效果 `effect` / 原理 `principle` / 规则 `rule`

## 快速开始

```bash
npm install
npm run dev            # 本地开发
npm run check          # 校验 + 生成文档 + 构建（一条命令跑完所有闸门）
npm run preview        # 预览构建产物
```

单条命令：

```bash
npm run validate        # 注册表校验：编号、结构、场景、预设、图表（有错退出非零）
npm run test:runtime    # 已解析配置、帧定位、资源门禁、交互时间轨
npm run docs:matrix     # 从数据生成 docs/01-场景选型矩阵.md
npm run docs:acceptance # 从数据生成 docs/04-验收记录.md
npm run registry        # 只导出 public/registry.json
npm run build           # 绑定闸门 + 导出注册表 + 构建
```

部署到子目录：`VITE_BASE_PATH=/motion-lab/ npm run build`。

## 目录

```text
data/                     唯一真相源（Agent 可直接读）
  effects.json            61 条内容：四层归类 + nature + 五场景适配度 + 参数 + 提示词 + 案例位
  scenarios.json          5 个场景：目标 / 一句建议 / 硬约束 / 节奏 / 注意事项 / 提示词模板
  presets.json            实际运行值：演示内容与时间安排、代表帧、手机三镜头、图表示例数据
  compositions.json       原六个底层适配合同：组件能力与历史技术样片
  director-patterns.json  六个导演叙事结构：观众理解、情境演示、叙事节拍与交接
  composition-scenes.json 可替换内容配置、Coverage Strategy 与最小 Shot Plan
  shot-recipes.json       44 条来源记录：17 镜头语法 + 4 表演角色 + 23 技术做法；职责与词典入口独立于来源分类
  triggers.json           10 种触发方式：别名、变体、组合、提示词示例、视频注记
  tools.json              6 种实现工具 + 4 个渲染层 + 路由判据
  cinematic-grammar.json  电影语法词表：景别 / 运镜 / 世界 / 转场（镜头组合用）
  cinematic-shots.json    制作参考：2 支完整成片 + 4 个交接段落 + 10 个历史原理练习
  style-patterns.json     风格与概念母题

films/                    旗舰成片（H.264 + AAC，seek(t) 纯函数渲染）
  pulse.mp4 / margin.mp4     早期 9:16 两片
  stud-morph.mp4          1080×1080 · one-shape 连续变形（按钮→loader→勾→搜索→开关→播放器→图表→命令面板→toast→回按钮）
  stud-orbit.mp4          1920×1080 · 深色发射（URL 胶囊→轨道环→翻滚数字 1,271,680→点阵 3D 球体→logo）

snippets/_kit/stud/       Studio 高质感渲染 kit（被 build-stud 拼接为 films/*.html）
  head.html / head-dark.html  闭式 spring、track、morph 引擎、界面光标、软阴影/渐变/模糊/颗粒、3D 球面
  morph.body.js / orbit.body.js  场景编排（状态时间线、内容渲染器、光标路径）
  tail.html               通用 seek / play / pause / getTime（DUR=15）

skill/motion-director/    给 Agent 制片用的 Skill（含导演脚手架与共享注册表）
  SKILL.md                路由与铁律：选型 → 分镜 → 脚手架 → 填内容 → 并排对照评审 → 渲染
  kit/                    与 snippets/_kit/stud 同步的可复用件 + 渲染/合成脚本
  references/             cinematic-grammar / cinematic-sequences / studio-patterns / review-rubric / fix-cookbook / routing-table
  films/                  4 部旗舰范例 HTML
  templates/              cue-table / render.mjs / index.html

docs/
  00-体系总览.md           三个轴、默认制片参数、演示可信度约定
  01-场景选型矩阵.md       ← 由脚本生成，不要手改
  02-动效注册表规范.md      数据结构、预设、图表规则、新增条目、补充案例
  03-提示词与ShotSpec衔接.md 提示词公式与两种交付格式
  04-验收记录.md           ← 由脚本生成
  05-生产适配与组合镜头.md  叙事配方、镜头术语、衔接语法、生产合同与能力状态
  06-Skill映射与扩展边界.md 最终 Skill 映射、Shader 合并边界与镜头分类

src/
  kit.js                  演示内核：固定逻辑画布 640×360 + 统一控制器（ready/play/pause/seek/reset/destroy）
  chart-rules.js          图表数据规则（Node 校验脚本与浏览器演示共用同一份）
  output.js               制作指令与镜头配置生成
  runtime-config.js       唯一配置解析：画幅 / 项目预设 / 时间语义 / 帧数
  production/             组合镜头、44 张镜头卡 SVG 预览、资产门禁、Shader、渲染器输入合同
  engine/                 10 个演示引擎（61 个变体）+ mini.js 卡片微预览
  main.js                 视图、路由、详情、参数编辑
  styles/main.css         设计令牌与全部界面样式

scripts/                  校验、矩阵生成、验收记录、注册表导出
  build-stud.mjs / render-stud.mjs / synth-stud-audio.mjs  Studio 片：拼接 HTML、逐帧 ffmpeg 渲染、配乐合成
public/registry.json      构建期产出的完整注册表（带 schemaVersion）
```

根目录下三个原始资料（两篇 PDF、一篇 DOCX）与研究文档是**来源**，不参与构建。
`Astra PLAN.md` 是第三版的决策包，保留在仓库里作为取舍依据。版本与迭代记录见 `CHANGELOG.md`。

## 关键约定

- **单一真相源**：适配度只写在 `effects.json` 的 `scenarios`；运行值只写在 `presets.json`；派生文档一律由脚本生成。
- **演示节奏改预设，不改代码**：`staggerMs` 固定表示「相邻元素开始时间间隔」，`staggerCount` 明确元素数；整组跨度为 `staggerMs × (staggerCount - 1)`。动作、整组交错、停留、退场共同组成可见时长。
- **预览与输出共用已解析配置**：`runtime-config.js` 的结果同时进入预览、中文指令和镜头 JSON；不允许各自重新解释时间或画幅。
- **项目预设不污染通用默认值**：通用默认仍为 1920×1080 / 24fps；`opportunity-ai-vertical` 单独保存 1080×1920 / 30fps / `portrait-stack`。
- **绑定闸门**：`npm run build` 会检查 `demo` + `demoVariant` 是否能在 `src/engine/` 解析到，不一致直接失败。
- **画面由当前帧决定**：每个演示的 `render(t)` 是纯函数，任意顺序 seek 到同一帧结果一致；离散文案与随机效果都由帧计算（固定种子）。
- **卡片与详情同一实现**：固定逻辑画布整体缩放，卡片只改变尺寸与控件。
- **两种模式**：视频演示（可任意定位）与交互原理（真实滚动 / 指针，按实际能力显示控件）。演示没有交互能力时，「切换到交互原理」按钮置灰而不是隐藏。
- **演示内控制条**：需要「改参后重绘当前帧」的演示，在 `stage.ctrl` 放控件并通过 `build.bindController(ctrl)` 在 `kit.js` 拿到控制器；`render(t)` 仍保持纯函数。
- **编号不改号**：词条删除后编号留空缺，不重排；校验器要求编号唯一且为正整数。
- **推荐 ≠ 已接入**：`renderLayerRecommend` 是推荐渲染层，`exampleCapability` 说明当前示例能力，不声称已完成 HyperFrames / Remotion 适配。
- **能力状态分三级**：`browser-demo` / `production-adapted` / `production-verified`。当前六个组件处于已适配待成片验证；还没有组件被提前标成生产已验证。
- **生产资源必须成功**：浏览器词典演示可以用占位底色降级；生产组合会等待字体、图片和视频，本地资源缺失或远程 URI 会阻止播放。
- **镜头先选表达再选动作**：表达目标 → 素材与状态条件 → 配方候选 → 常用镜头卡 → Coverage / Shot / EditEdge → 动效参数。配方语义写在 `compositions.json`，内容与镜头计划写在 `composition-scenes.json`，首批镜头知识写在 `shot-recipes.json`；最终与 Skill 使用同一份注册表。
- **职责分流**：导演侧有 6 个叙事结构、17 项镜头语法、4 类表演角色；23 条技术做法通过 canonicalEffectId 挂到完整词典已有词条。44 条来源记录与旧链接保留，不在两侧重复建卡。sourceCategory 仅作来源信息。
- **镜头卡参考演示可定位**：44 张卡各有独立 SVG 演示、三段关键时刻、播放/复位/拖动控制和制作描述；它们用于检索和描述，不自动升级为生产适配组件。

## 视觉与风格

工作型工具：**密集、安静、可读**，视觉动效本身才是内容。

- 近黑单色底（`#060607`）+ 单一 lime 强调色（`#8acd00`），强调色只用于选中态、主按钮与当前状态。
- 西文 Inter Variable（本地依赖 `@fontsource-variable/inter`，离线可用），中文走 PingFang；不引 CDN。
- 正文 ≥ 14px、次要信息 ≥ 12px、触屏热区 ≥ 44px；减少渐变与无含义装饰色。
- 适配度语义色：首选 lime / 可用中性灰 / 慎用琥珀 / 不推荐深灰。
- 分组图例色（`GROUP_COLORS`）与图表多实体配色保留，它们承担分类语义。

## 图片素材

词典演示统一用 **Lorem Picsum**（`https://picsum.photos/seed/{seed}/{w}/{h}`）：开源、免 key、**种子固定**，每次拿到同一张图。种子常量在 `src/kit.js` 的 `SEEDS`。

注意：**固定 seed 只保证同一张图，不等于可复现资产**——素材仍来自网络，离线时退回占位底色。生产请把这批图本地化后再进流水线。
生产适配层不会沿用这个宽松降级策略：远程素材或加载失败会直接报错。
视差类演示的山脊剪影是**固定种子生成的 SVG**（不用图片），不依赖网络。

## 补充案例

案例写在**对应条目**的 `cases` 里，不要另建文件——查一个动效时它的案例就在旁边。字段见 `docs/02`。补完跑 `npm run validate`。

## 当前规模

| 项 | 数量 |
|---|---:|
| 内容条目 | 62（效果 54 / 原理 3 / 规则 5；本轮未修改完整词典源数据） |
| 动效词典演示 | 62（11 个引擎，全部绑定校验通过） |
| 镜头卡参考演示 | 44（逐帧确定性 SVG，可播放与定位） |
| 视频场景 | 5 |
| 触发方式 | 10 |
| 主实现工具 | 8（时间线 / 图形空间 / 数据图表）；Lottie/Rive 为素材按需选项 |
| 渲染层 | 4 |
| 手机镜头预设 | 3 |
| 图表示例数据 | 6 组 |
| 专精条目 | 5 |
| 导演叙事结构 | 6（独立情境演示，浏览器参考） |
| 导演语法 / 表演角色 | 17 / 4 |
| 词典关联技术做法 | 23（不新增重复词条） |
| 常用镜头语言卡 | 44（仓库精选 28 + 视频拆解 16） |
| 首批生产适配组件 | 6（待成片验证） |
| 独立项目预设 | 1（1080×1920 / 30fps） |
| 镜头组合制作参考 | 6（2 支完整成片 + 4 个交接段落）；历史原理练习 10 |
| Studio 旗舰成片 | 4（pulse / margin / stud-morph / stud-orbit） |
| motion-director Skill | 源文件、共享注册表、可执行脚手架与验收方法 |

## 项目目标与最终形态

项目最终不是单纯的动效展示站，而是一套 **Agent 可检索、可选择、可执行、可验证** 的视频制作知识框架。人类工作台、后续 Skill 和生产执行器必须消费同一份注册表：

```text
任务解释
→ 场景与叙事配方
→ Coverage / Shot / EditEdge
→ 镜头语言卡与动效参数
→ renderer 路由
→ 输出和验收
```

三层之间的关系：

```text
人类工作台
  浏览、比较、调参、查看选择理由和能力状态
          ↓
共享注册表
  场景、配方、镜头计划、镜头卡、动效、触发、工具、预设
          ↓
Agent / Skill / 执行器
  选择 → 规划 → 执行 → 验收
```

当前不应宣称的能力：

- 浏览器演示不等于已经完成视频渲染器适配；
- `production-adapted` 不等于 `production-verified`；
- 2D 缩放和位移不等于真实摄影机透视运动；
- 概念相近不等于已经吸收外部参考卡；
- 固定图片 seed 不等于素材已经本地化或可长期复现。

## 镜头语言分层

镜头语言不等于所有可见运动。新增或选择条目时按以下层级判断：

| 层 | 回答的问题 | 例子 |
|---|---|---|
| Narrative / Coverage | 为什么展示、要覆盖哪些信息 | 输入 → 响应 → 结果 |
| Shot / Camera | 观众从什么视野观看 | wide → close、push-in |
| Subject / Content Motion | 对象或内容怎样动 | 卡片 rotateX、列表错峰 |
| Edit Relationship | 为什么从 A 到 B | 比较、反应、回归、省略时间 |
| Transition Effect | 切点怎样表现 | hard cut、wipe、flash、dissolve |
| Visual Treatment / Renderer | 像素怎样处理、由谁实现 | blur、Shader、DOM、3D |

转场效果不自动构成切镜理由；主体 transform 也不自动等于摄影机运动。二维模拟需要明确标为 `virtual-reframe` 或 2D 近似。

## 首批镜头语言卡

`data/shot-recipes.json` 从 `video-shotcraft` 固定提交 `5e71af35a2daee492dd3ea93e5e8903f32dcd13c` 的 157 张卡中选择 30 张高频卡：Camera 4、Transition 6、UI Entrance 6、Interaction 4、Data 4、Rhythm 3、Opening 2、Typography 1。

每张卡至少包含来源路径、适用与避免条件、能量、建议时长、所属镜头层、映射配方、可复用 effect 和接入状态：

- `knowledge-integrated`：规则已进入注册表，没有独立生产预览；
- `example-linked`：已经关联现有配方或演示；
- `production-adapted`：已有生产适配实现，仍需继续验证。

不要把来源库 157 张卡直接变成 157 个顶层类型。新增卡时先拆解意图、机位、主体运动、剪辑原因、转场表现、节奏、renderer、失败条件和来源，再决定放在哪一层。

## 版本演进

项目有两套历史命名：早期产品迭代使用“第一版 / 第二版 / 第三版 / v3.x”，生产框架扩展使用 `v0.4` 至 `v0.7`。它们不是同一条语义化版本线。

| 阶段 | 主要变化 | 结论 |
|---|---|---|
| 第一版 | 建立数据、文档、预览站三层结构 | 基础成立，视觉和演示较粗糙 |
| 第二版 | 重做界面、交互和 56 个演示 | 形成可用工作台 |
| 第三版 | 帧决定模型、第五场景、图表、双格式输出 | 能力提升，但整体体验曾被回退 |
| v3.1 | 取回第三版能力并采用 Watermelon 视觉 | 保留能力并重做视觉系统 |
| v3.2 | 集中修复 24 项演示问题 | 61 个演示成为现行基础 |
| v0.4 | 配置统一、组合镜头、薄生产适配、Shader 合同 | 建立生产接口 |
| v0.5 | 六个叙事配方、注意力、节拍、衔接和失败例 | 从动作词典进入表达配方 |
| v0.6 | 内容、Coverage、Shot Plan 和画面一致性 | 配方语义与业务内容解耦 |
| v0.7 | 接入首批 30 张常用镜头卡 | 建立可供 Skill 消费的镜头知识层 |

详细提交、标签、回退方法、真实缺陷和验证证据见 [CHANGELOG.md](./CHANGELOG.md)。

## Agent 接手与修改流程

### 开始前

1. 阅读本 README、`CHANGELOG.md` 和任务相关的 `docs/`。
2. 运行 `git status --short` 和 `git diff --stat`，区分已有修改与自己的修改。
3. 从数据、校验器和真实调用链确认现状，不只相信历史文档。
4. 明确任务改的是知识、展示、执行、验证还是多个层。

当前仓库可能存在未提交的功能迭代。不要使用 `reset --hard`、覆盖整个文件或批量格式化来清理工作树。

### 修改时

1. 先修改唯一真相源，再同步注册表导出和结构校验。
2. UI 负责呈现数据，不复制业务判断。
3. 新能力明确写出实现近似和 capability 状态。
4. 不手改脚本生成的 `docs/01-场景选型矩阵.md`、`docs/04-验收记录.md` 和 `public/registry.json`。
5. 保持修改范围最小，不顺手重构无关代码。

### 完成前

1. 运行最相关的局部检查，再运行 `npm run check`。
2. 前端修改必须实际检查桌面、窄屏、项目竖屏、播放、定位和裁切。
3. 确认随机定位、顺播、重播和终态一致。
4. 更新 `CHANGELOG.md`，说明改了什么、为什么、验证程度和剩余风险。
5. 在交付说明中区分“已实现”“已验证”和“仍是假设”。

## 常见错误

| 错误 | 后果 | 防护 |
|---|---|---|
| 在多个文件重复同一事实 | 文档、UI、注册表漂移 | 指定唯一真相源，其他出口生成 |
| `demoVariant` 与引擎命名不同 | 静默显示错误或空白 | 保留构建期绑定闸门 |
| 用历史回调驱动画面 | 随机 seek 结果不同 | `render(t)` 只依赖当前帧和固定输入 |
| 用 DOM 测量决定关键几何 | 不同画幅和任意帧定位时漂移 | 使用确定性布局参数 |
| 把 scale 当真实推镜 | 错误声称透视关系 | 明确标记二维取景近似 |
| 把转场效果当切镜理由 | 画面花哨但叙事不连续 | 先记录 Edit Relationship |
| 把浏览器样片标成生产完成 | 下游依赖未验证能力 | 使用三级 capability 状态 |
| 只跑 build 不看画面 | 裁切、遮挡、空白无法发现 | 实际渲染和代表帧检查 |

## 已知限制与后续方向

- 六个新导演结构有独立情境与交接演示，属于 browser-demo；原六个适配合同保留历史技术记录。实际多镜头生产计划需按内容展开；
- 44 张镜头语言卡已完成知识/映射接入与逐帧 SVG 演示：16 张视频拆解卡与 20 张开源卡带真实视频证据，8 张开源模式诚实标注「本批视频未覆盖·假设式演示」；生产适配组件仍待成片验证；
- 实际 MP4 输出和跨 renderer 对齐尚未形成完整自动验收；
- 生产素材本地化、字体许可、音频设计和真实素材 QA 仍需补齐；
- Shader 研究库尚未整理成主框架可消费的完整注册表；
- FORMA / RELAY 两支指定内容成片已验证，不能把此状态扩展到所有组件和参数；
- 真机触屏、屏幕阅读器顺序和长时间性能曲线没有完整量化。

推荐优先级：高频镜头卡生产样片 → 多镜头 Shot Plan / EditEdge → renderer 能力矩阵和真实视频输出验证 → Shader 注册表 → 第一版制片 Skill。

## 文档地图

| 文档 | 用途 |
|---|---|
| [CHANGELOG.md](./CHANGELOG.md) | 版本历史、回退、缺陷和验证证据 |
| [docs/00-体系总览.md](./docs/00-体系总览.md) | 三个轴、真相源和演示可信度 |
| [docs/01-场景选型矩阵.md](./docs/01-场景选型矩阵.md) | 五个场景的完整适配矩阵 |
| [docs/02-动效注册表规范.md](./docs/02-动效注册表规范.md) | 新增或修改动效条目 |
| [docs/03-提示词与ShotSpec衔接.md](./docs/03-提示词与ShotSpec衔接.md) | 制作指令和结构化镜头配置 |
| [docs/04-验收记录.md](./docs/04-验收记录.md) | 脚本生成的验收摘要 |
| [docs/05-生产适配与组合镜头.md](./docs/05-生产适配与组合镜头.md) | 叙事配方、镜头计划和生产合同 |
| [docs/06-Skill映射与扩展边界.md](./docs/06-Skill映射与扩展边界.md) | Skill、Shader 和镜头语言扩展 |
| [docs/07-导演与技术职责.md](./docs/07-导演与技术职责.md) | 叙事 / 语法 / 表演 / 技术做法的定位与工具路由 |

## 交接模板

每轮工作结束时记录：

```text
目标：这一轮解决什么
范围：修改了哪些数据、页面、运行时或文档
决定：有哪些无法直接从代码看出的取舍
验证：运行了哪些命令，检查了哪些页面和画幅
能力：达到 browser-demo / production-adapted / production-verified 的哪一级
风险：哪些内容仍未验证或依赖外部素材
版本：schema、package、registry 和 CHANGELOG 是否同步
```

完成标准不是“多了一个效果”，而是下一位 Agent 能理解为什么选它、怎样执行、何时不用，以及如何验证。


## Codex 镜头组合与导演脚手架更新（2026-10-11）

这轮重新检查了用户的 Pipeline 文档、归藏仓库的 SKILL/影片方向文档，以及 Prompt Motion 的 UI morph、动态排版、Dub 案例。采用状态交接、内容推导手法、纯时间渲染与实际画面审阅；独立实现，未复制外部仓库代码或品牌资产。参考与取舍见 `studio/docs/DIRECTION.md`。

- **工作台**：镜头组合默认进入「成片与交接参考」，展示 FORMA / RELAY 两支完整影片和四个由同一实现截取的段落。保留原有六个叙事配方、44 张卡与十个历史示例；历史例明确标为原理练习。完整词典源数据未修改。
- **可操作参考**：逐段定位、声音开关、制作描述/镜头 JSON/参考链接复制；修复进度条与续播的百分比换算、异步复制反馈、关闭弹窗后声音继续播放等问题。新参考使用静帧封面，不在列表同时运行多个渲染器。
- **两支影片**：`films/director-forma.mp4` / `films/director-relay.mp4`，均 15 秒 / 1920×1080 / 60fps / 900 帧 / H.264 + AAC。FORMA 用纸片与选中卡连续变形、按钮到圆环、问题到结果的对照；RELAY 用信号路径、真实网络透视投影、机械进位数字与方向交接。界面和数字均为原创概念演示。
- **Skill**：主流程由“强制运镜、强制三层、凑评分”改成意图 → 主体 → 状态交接 → 可执行起点 → 具体画面验收。`registry.json` 与工作台共享 sequences；`director-kit/` 冻结示例字体和渲染核心。构建脚本保留此前 Studio kit，新内容再次构建不会丢失。
- **可复现起点**：`node skill/motion-director/scripts/scaffold-director.mjs --out /新目录 --film forma`，然后按生成 README 运行音频和 HTML 构建。独立生成工程已实际构建通过。
- **两个入口**：工作台 standalone HTML 含播放传输层；`studio/hyperframes/{forma,relay}/index.html` 是干净的生产入口，时间线与音轨由框架管理。两者使用同一渲染核心。
- **验证**：`npm run check`；两支生产入口的 HyperFrames lint/validate/inspect；六个新参考的乱序定位；工作台桌面/390px 窄屏与构建后页面；实际联系表、转场条带与手机尺寸图。证据与已知边界见 `studio/evidence/verification.md`。

技术门只证明结构、执行和可复现性。Canvas 内部文本不能靠自动 DOM overflow/contrast 检查证明可读，已另看实际画面。配乐为本地原创代码合成，音轨与落点做技术检查，未进行人工听感验收。只验证本轮横屏与指定示例内容；更换中文文案时需要覆盖新字符的本地字体（目前中文字体是示例字幕子集），竖屏须重新编排。


## 导演 / 技术职责重构（2026-10-11 · v0.13）

用户明确镜头组合服务总导演，完整词典服务技术/视效总监。本轮从职责重构展示和 Skill，不再沿开源仓库的八个来源分类堆放所有技法。

- **六种叙事结构重做**：主张→场景→证据、行动→响应→结果、建立→聚焦→回归、旧态→变化→新态、对照→归因→确认、总览→选择→详情。每种都有不同情境、三段观众理解与两次交接；展示主体变化与场景上下文。详情支持播放、定位、复制导演说明与结构 JSON。演示的段落是叙事节拍，不强制每段都切镜，不冒充实际生产 Shot Plan。
- **“常用卡”拆开归位**：原 44 条记录保留：17 项视点/衔接/节奏进入「镜头语法」，4 类共享容器/窗口/光标/群组进入「角色与表演」；23 条局部技术做法挂到完整词典已有词条。旧的技术卡 URL 自动进入对应词条并展开关联做法，完整词典仍为 62 项。
- **完整案例与段落保留**：两支已认可影片与四个片段保持同一实现，增加主体/角色描述和关联叙事入口；旧电影分类放在历史原理练习中。影片文件 SHA256 与上一轮一致。
- **工具结构保留四层**：主工具 8 项按时间线、图形空间、数据图表分类。补 WebGL、p5.js、Chart.js、ECharts 的用途、外部时间合同和官方参考。新库是选型参考，没有新增生产依赖。Lottie/Rive 当前没有运行时接入，仅在有预制资产时按需考虑。
- **Skill 同步**：先查 directorPatterns / directorGrammar / directorPerformers 做导演决定，再查 effects / technicalRecipes / tools 做技术选择。职责集合是 recipeId 索引，shotRecipes 保存唯一原文，避免重复计数。新增 narrative-patterns.md / director-responsibilities.md / implementation-routing.md；六个 snippets/narrative-*.html 是从工作台渲染器构建的自包含演示；director-kit/lib/narrative.mjs 是可阅读、可执行的纯渲染源码，30 个采样与工作台一致。制作包增加六种导演结构。
- **验证**：项目 check、六结构边界与乱序采样、全部 18 个阶段实际渲染、播放/暂停/复位/复制、词典深链接、角色和工具分类、390px 窄屏、构建后页面与 Skill 构建验证。证据在 analysis/verification-v0.13/。

能力边界：六结构是导演情境演示，镜头语法图保留为二维原理示意；本轮没有把全部历史图示逐条重做成成片。已验证的两支影片保持原样。库的选型参考不等于运行时已接入。


## v0.14 · 导演案例与播放器（2026-10-11）

- 顶部删除“Agent 制片参考”。导演侧合并为“导演案例”：完整影片 2、镜头段落 5、叙事拆解 6。主角、视点、节奏、剪辑动机在案例里说明。
- 撤下 21 个旧导演 SVG 演示与 10 个历史序列的浏览入口；保留知识、来源与旧链接。旧链接显示原理说明与相关案例。技术词典的 23 条关联做法保留。
- 重建“单元素增殖成墙”：8.6 秒 ATELIER 群像情境，原创纸感作品从单体展开到八张作品，贯穿主角可追踪。浏览器演示，无音轨、未导出 MP4。
- 播放器保持完整 16:9 画幅，使用单一滚动区域，提供“展开画面”。两支原 FORMA / RELAY 成片保留。
- Skill、共享注册表与生成器同步；退役演示不再被复制进 Skill。指南到最终 Skill 的映射见 [导演与技术职责](docs/07-导演与技术职责.md)。
