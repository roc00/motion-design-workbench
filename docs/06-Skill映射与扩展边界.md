# 06 · Skill 映射与扩展边界

## 一、最终形态

本项目当前是创建者使用的动效与镜头参考框架，最终会映射为一个可由 Agent 执行的制片 Skill。网页工作台保留为人类检索、比较、调试和验收界面；Skill、工作台和生产执行器必须消费同一份注册表，不能复制出另一套知识。

推荐关系：

```text
Skill 决策层
  读取任务 → 选择叙事/覆盖策略 → 规划 Shot/EditEdge → 选择动效与 renderer → 验收
        ↓
共享知识与数据层
  scenarios / compositions / composition-scenes / effects / triggers / tools / presets
        ↓
执行层
  DOM/SVG/Canvas / Shader / Remotion / 3D / AI Video
        ↓
验证层
  schema / capability / random-frame / visual QA / audience comprehension
```

### 当前框架到 Skill 的映射

| 当前对象 | Skill 中的职责 |
|---|---|
| `scenarios.json` | 判断内容场景与约束 |
| `compositions.json` | 选择 Narrative Pattern 与适用条件 |
| `composition-scenes.json` | 内容槽位、Coverage Strategy、Shot Plan、EditEdge |
| `shot-recipes.json` | 常用镜头卡、所属层、配方/能力映射、来源与接入状态、作用对象/叙事用途、可复制制作描述与逐帧演示索引 |
| `effects.json` | 选择主体/内容动效与视觉处理 |
| `triggers.json` | 把事件转换为时间触发 |
| `tools.json` | renderer 能力路由与降级 |
| `presets.json` | 参数、画幅、时间、资产默认值 |
| `src/production/` | 确定性执行适配层 |
| `scripts/validate-registry.mjs` | Skill 输出的结构与能力闸门 |
| 网页工作台 | 人类查看选择理由和视觉结果 |

Skill 第一版应输出：任务解释、场景与覆盖策略、镜头计划、镜头连接、动效参数、renderer 选择、近似说明和验收清单。当前数据可以作为第一版基础，但多镜头计划、renderer 能力矩阵和画面自动验收仍需继续补齐。

## 二、Shader 测试库的合并决定

`/Users/penn/Desktop/Dev/Shader测试` 当前包含 13 个分类、35 个基础 Shader 卡和 6 个复合效果。主框架只登记了 7 个 Shader 类效果，生产适配器目前只实现 `ambient-gradient`、`wipe`、`dissolve` 三种模式。

决定：**逻辑合并，工程分层；不把 Shader 图鉴整站直接复制进主工作台。**

- Shader 图鉴继续作为 Shader 研发、调参、性能观察和源码实验工作台。
- 可进入生产体系的效果提炼为结构化 Shader 注册表，纳入主框架的统一 id、参数、能力状态、场景适配度和验证记录。
- 主框架通过统一 Shader Adapter 消费已注册效果；不能从图鉴文件中临时抓取 GLSL。
- 只有通过确定性、seek、画幅、性能、素材门禁和导出验证的效果才能升级到 `production-adapted` 或 `production-verified`。
- 颜色/渐变、噪声、纹理、辉光等主要是视觉处理；wipe、dissolve 等可作为 TransitionEffect 的实现；Shader 本身不决定为什么切镜。

建议后续形成：

```text
shader-catalog.json
  id / category / inputs / uniforms / deterministic / cost / formats / capability

src/production/shaders/
  公共运行时 + 已适配 shader 模块

Shader测试/
  研发图鉴、实验实现、参数探索
```

## 三、镜头语言与动效的归类边界

不要用一个“镜头语言”栏目容纳所有可见运动。按以下六层判断：

| 层 | 回答的问题 | 例子 |
|---|---|---|
| Narrative / Coverage | 为什么展示、需要覆盖哪些信息 | 输入→响应→结果；全局→局部→回归 |
| Shot / Camera | 观众从什么视野观看 | wide→close、push-in、virtual reframe、orbit |
| Subject / Content Motion | 画面中的对象怎样动 | 卡片 rotateX 入场、列表错峰、数字翻牌 |
| Edit Relationship | 为什么从 A 切到 B | 新信息尺度、对比、反应、省略时间、回归 |
| Transition Effect | 切点怎样被表现 | hard cut、flash、mask wipe、concealment、dissolve |
| Visual Treatment / Renderer | 像素如何处理、由谁实现 | blur、glow、grain、Shader、DOM、3D |

因此：

- “卡片或手机屏幕沿 rotateX 进入”默认是主体入场动效，归入动效词典。
- 当 rotateX 表达铰链、翻面、空间方向或前后因果，并承担整个镜头的主要叙事动作时，它可以成为一张 Shot Recipe，但底层动作仍属于 Subject Motion。
- “转场”不是自动等于镜头语言原理。Edit Relationship 是镜头语言；wipe、flash、dissolve 是其可选表现。没有切镜时，它们也可能只是同一镜头内的状态揭示。
- push-in、orbit、景别变化属于 Camera/Framing；对象 scale、rotate、translate 属于 Subject/Content Motion。二维 CSS 近似必须标记为 `virtual-reframe` 或 `2d-transform-approximation`。

## 四、video-shotcraft 的吸收现状

固定研究快照：`5e71af35a2daee492dd3ea93e5e8903f32dcd13c`。

该快照共有 157 张镜头卡，分布为：camera 10、data 13、effects 17、interaction 15、opening 11、outro 7、rhythm 11、transition 19、typography 26、ui-entrance 28；另有 1 个 sequence 配方 `promo-energy-arc`。

首批已从 157 张中选取 30 张高频卡写入 `data/shot-recipes.json`，并映射到现有六个叙事配方与 61 条动效能力。分布为：Camera 4、Transition 6、UI Entrance 6、Interaction 4、Data 4、Rhythm 3、Opening 2、Typography 1。

30 张卡现在都配有逐帧确定的 SVG 参考演示、三段关键时刻、制作描述以及播放/复位/拖动控制。每张卡统一带**作用对象**（camera / subject / edit / rhythm）、**叙事用途**（establish / guide / reveal / confirm）、**配方使用说明**（`patternUsage`）和**三态接入状态**（`status.source / demo / production`），并导出可复制的制作描述字段 `shot.{intent,subject,camera,subjectAction,timing,seams,constraints}`；`demoIndex.beats` 从字符串升级为 `{label, at}` 真实动作节点，`durationMs` 改为分卡时长。这套结构就是后续 Skill 消费镜头卡的标准数据形状。其中 `interaction/type-and-filter` 和 `data/before-after-slider-scrub` 还关联现有配方示例；其余 28 张仍处于“知识已嵌入”。参考演示用于说明动作和建立索引，不表示已经完成生产适配或真实素材成片验证。所有卡都保留固定提交下的源文件路径。

### 6 个配方与 30 张卡的关系

```text
6 个 Narrative Pattern
  决定表达目标、Coverage 和信息顺序
        ↓ 选择并组合（多对多）
30 张 Shot Recipe
  决定 Camera、主体运动、剪辑关系、转场和节奏
        ↓ 映射
61 条 Effect / Principle / Rule
  提供参数、renderer 建议和可执行动作
```

例如“全局 → 局部 → 回归上下文”可以组合纵深分层、俯拍总览、急推强调和圆形匹配开合；“输入 → 响应 → 结果”可以组合输入筛选、AI 流式响应、列表揭示和线索接力。配方是叙事骨架，镜头卡是实现骨架中某一段的方法。

本批覆盖了急推、纵深、空间和俯拍取景；镜头交棒、藏切、擦除、翻面和匹配转场；铰链、发牌、堆叠、渐进组装、列表和共享形态入场；输入、AI 响应、命令面板；前后对比、动态图表、数字滚轮和时间线；节拍硬切、变速定格、蒙太奇；以及两个开场和一个基础字卡。

尚未进入首批的内容包括剩余 127 张卡、完整 Outro、Effects 大类、更细的 Typography、Sequence 能量弧、声音设计、素材采集和成片 QA。后续扩展应继续沿用 `shot-recipes.json` 的字段与能力状态，不能把概念相近记作完成适配。

## 五、下一步提取规则

不应把 157 张卡直接变成 157 个顶层镜头类型。每张卡拆成以下字段，再决定放入哪一层：

```text
intent / coverageRole / primarySubject
framing / cameraMotion / subjectMotion / contentMotion
editReason / transitionEffect
beats / timing / readHold / energy
renderer / inputs / parameters / capability
continuityRequirements / knownFailures / provenance
```

首批已经按上述字段完成 30 张核心卡。第二批优先补 Outro、Effects、Typography 和剩余高价值 Camera / Transition；完整宣传片流水线与 sequence 在多镜头计划和成片验证稳定后再接入 Skill。
