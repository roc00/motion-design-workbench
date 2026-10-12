# 《动效框架指南》v0.9「工作室管线 Studio Pipeline」迭代 PRD

> 一份面向**执行模型 / 工程师**的决策包。目标：把本项目从"动效词典"升级为"可重复的成片工作室管线"。
> 执行方应先通读全文，再按第 9 章的 Ticket 顺序施工；第 10 章是验收合同。

| 项 | 内容 |
|---|---|
| 文档版本 | PRD v1.0（2026-09-29） |
| 目标产物版本 | 项目 v0.9.0 |
| 现状基线 | 项目 v0.8.0，git 工作树干净 |
| 技术栈 | Vite 7 + GSAP 3（零重依赖），ES Module，JSON 数据驱动 |
| 目标读者 | 负责落地的编码 Agent / 前端工程师 |
| 强约束 | 另有一个 Agent 在并行修改本仓库；只改被点名文件、最小侵入；**不新增一级导航** |
| **最高目标** | **能力平权**：让 DeepSeek 4.1 flash 这类弱模型结合本框架也能产出接近 Opus 5.5 的成片，详见第 0 章 |

---

## 0. 最高目标：能力平权（Capability Leveling）

### 0.1 一句话目标
v0.9 的成功标准不是"给强模型看的参考"，而是：**让 DeepSeek 4.1 flash 这类能力显著低于 Opus 5.5 的"弱模型"，结合本框架，也能产出接近 Opus 5.5 水平的成片；即使不能完全达到，也不能差太多——绝不允许出现明显的 AI slop（居中渐变 + 全部 fade in）。**

### 0.2 为什么"参考站"本身不够
v0.8 是一个"给人 / 强模型看的参考"。Opus 5.5 的优势大部分是**隐式**的：它自带类型（genre）知识、能自我审美、会自己发明技术、能写长篇导演简报。弱模型没有这些。如果只把"参考原则"丢给弱模型，它仍会退回最省事的默认（居中渐变、fade in）。

因此框架的使命是：**把强模型"脑子里自带的能力"显式化、模板化、自动化**，让弱模型的任务从"创作"降级为"**选择 + 填空 + 复制**"。

### 0.3 能力下沉对照表
| Opus 5.5 自带能力 | 弱模型的短板 | 框架对策 | 落地 Epic |
|---|---|---|---|
| 自带类型知识（showreel / 产品广告 / 数据片） | 不懂类型规则 | 模式库 + 决策路由表（查表） | Epic 1 / Epic 5 |
| 自我审美、会看自己的帧 | 不会自检、审美弱 | 阻断式 gate + 自动 contact sheet + 评分清单 | Epic 2 / Epic 4 |
| 自己发明弹簧 / 相机 / 技术 | 只会写 fade | 复制即用代码库 + 代码脚手架（高级技术内置） | Epic 3 / Epic 5 |
| 长程规划、多章节 | 长程跑偏、漏步骤 | 小步拆解 + 每步验证 + 强制流程 | Epic 5 / Epic 6 |
| 写约 9,500 字导演简报 | 不会组织简报 | 生成器自动产出简报 + prompt + 代码骨架 | Epic 5 |
| 创造 signature moment（高光） | 做不出高光 | 签名时刻库（现成高光片段） | Epic 4 |
| 自觉规避 slop | 容易产生 slop | 模板保底 + 自动化 slop 检测 | Epic 2 / Epic 4 |

### 0.4 为弱模型设计的 6 条原则
1. **模板优先（template-first）**：能用模板 / 现成片段，就不让模型自由创作。
2. **选择优先（choose over create）**：把决策做成选择题 / 填空题，模型查表而非凭空判断。
3. **护栏自动化（automated guardrails）**：质量门必须**阻断**（不通过不能继续），不靠模型自觉。
4. **小步验证（small steps, verify each）**：每一步小、有明确产出、有自动校验。
5. **代码即能力（code as capability）**：高级运动（弹簧 / 相机 / 绘制）内置在可复用代码里，模型调用即可。
6. **保底思维（quality floor first）**：先保证"不烂"（无 slop、有节奏、有相机、有多样性），再追求"惊艳"。

### 0.5 两类产出路径（难度分级）
- **路径 P（模板路径，弱模型默认）**：在 Web 生成器里选模式 → 自动产出代码脚手架（已内置高级技术）→ 弱模型只填内容 → 跑 gate 保底 → 完成。能力要求低、质量有保底。
- **路径 C（创作路径，强模型 / 高级需求）**：自由发挥，框架提供原则与参考（即现有 bang-motion 式用法）。
- 默认把弱模型引导到**路径 P**；只有模板不满足时才升级到路径 C。

---

## 1. 背景：为什么是现在

### 1.1 趋势的本质
2026-09-22 Anthropic 发布 Claude Opus 5.5，随后出现大量"一句话生成"的动效短片、发布视频、MV、历史片。但这些视频**不是模型直接输出的视频**：

- 大模型只产出文本，无法输出 MP4。每个成片本质上是**模型写了一个程序，由别的东西把程序变成帧**。
- 核心技巧是**确定性（determinism）**：模型写一个 `draw(t)` / `seek(t)` 函数，给定任意时刻 t 画出唯一确定的帧。
- 一个 headless 浏览器以 60 fps 调用它 900 次（15 秒），逐帧截图，ffmpeg 合成。
- 渲染不依赖任何计时器，所以**每次渲染结果完全一致**；改片就是改一行代码 + 重新渲染。

### 1.2 最重要的认知：prompt 只占 10%，harness 占 90%
"一次提示词成片"是被夸大的叙事。真实情况是两端：
- 极简端：30 个词的 one-liner（只够测试引擎，不含任何创意）。
- 旗舰端：约 9,500 字符的导演简报、一整套 skills、两个 API key、12 小时的自主运行。

差距不在模型能力，而在**工作框架（harness）**：有没有给它参考、有没有给它渲染引擎、有没有让它**看自己渲染出的帧**。这正是本项目要补齐的部分。

### 1.3 为什么与本项目同源
本项目早已是"浏览器内、JS 代码驱动、确定性帧渲染"的体系，与上述趋势在同一技术路径上，且动手更早：
- `src/kit.js` 第 1–10 行已明确"画面由当前帧+配置决定，`render(t)` 是纯函数，任意顺序 seek 到同一 t 结果一致，随机用固定种子"。
- 已有完整的卡片/详情双形态、固定逻辑舞台、可逐帧 seek 的控制器。

因此本次迭代不是推倒重来，而是**把社区验证过的方法论结构化地补进现有框架**。

---

## 2. 现状盘点

### 2.1 已有资产（v0.8.0）
| 资产 | 规模 | 位置 |
|---|---|---|
| 动效（effects） | 61 个，10 个分组 | `data/effects.json` + `src/engine/*.js` |
| 叙事配方（compositions） | 6 个 | `data/compositions.json`、`data/composition-scenes.json` |
| 镜头卡（shot recipes） | 30 张 | `data/shot-recipes.json` |
| 场景（scenarios） | 5 个：文字展示 / 背景转场 / 卡片展示 / 手机产品演示 / 图表数据叙事 | `data/scenarios.json` |
| 触发方式 / 工具与渲染层 | 齐全 | `data/triggers.json`、`data/tools.json` |
| 渲染内核 | 纯函数舞台 + 控制器 + 固定种子随机 + 自绘 SVG | `src/kit.js` |
| 生产适配层 | 适配器、素材门、能力矩阵、组合渲染、shader 适配、镜头卡预览 | `src/production/*` |

### 2.2 已有的确定性实践（重要，勿重复造轮子）
- `kit.js`：`seeded()` 固定种子随机；`clamp01/seg/ease*/stagger` 等纯函数；`createController` 支持 `seek / seekFrame / reset / setT`。
- `scripts/test-runtime.mjs` 第 33–41 行已对每个组合配方做**跨顺序一致性校验**：同一帧分别在正序、逆序、重复 seek 下断言相等（`随机定位同帧不一致 / 返回起点不一致 / 倒序定位同帧不一致`）。

### 2.3 结论
项目在"**数据层的确定性**"上已经做得相当扎实；缺口集中在**渲染层的系统校验、成片视角的选型、运动物理与自检流程**。

---

## 3. 核心设计哲学（本次迭代的"宪法"）

以下 6 条原则从优秀案例中提炼，是后续所有功能的判断依据。

1. **每帧是事实（Determinism）**：`render(t)` 是 `(帧号, 种子, 配置)` 的纯函数；不携带跨帧状态；正序、逆序、单独渲染同一帧结果一致。
2. **是视频，不是幻灯片（Video, not slides）**：
   - 一个**连续世界**：不是"一个 idea 一块幻灯片 + 淡入淡出"，场景在同一个世界里连续演化。
   - **相机会真的动**：有呼吸式漂移 + 有动机的推进，而不是静止机位。
   - **主体持续存在**：同一对象在镜头间持续，而不是每段换一个。
   - **文字生活在场景内**：文字是场景中的物体，有空间、有透视、被相机影响，而不是浮在最上层的标签。
   - **背景不静止**：背景持续有细微运动，颜色变化要有可见触发。
   - **素材层锁定时间轴**：视频/图片素材跟随时间轴时钟，保证逐帧精确。
3. **一次编写，永远重绘（Pay once, draw forever）**：把 token 花在程序上而不是每帧像素；同一源码在任意机器、任意尺寸重绘同一画面。
4. **让模型看自己的帧（Critique loop）**：全量渲染前先出 contact sheet，以苛刻导演视角评分，列出最差的 3 个问题并修复，重复直到每项 8+ 分。迭代是方法，不是失败。
5. **风格先行，菜单选型（Style before code / Structure from menu）**：写代码前先出风格简报与概念候选；结构从菜单中选取，每个项目的"结构指纹"要与上一个不同，避免同质化。
6. **昂贵的运动有质量（Motion has mass）**：好的运动有质量——加速、轻微超调、稳定；用**闭式弹簧**而非固定曲线；运动要能被 seek（纯函数）。

### 3.1 反模式清单（Banned defaults，UI 默认要规避）
- 居中标题 + 渐变背景；一切都靠 fade in。
- 四角标签、画面边框、给 UI chrome 加 glow、通用粒子爆发。
- 弹跳缓动用在不该用的地方（数字/图表/面积禁止回弹）。
- 死帧：连续 2–4 秒没有任何新事件。
- 相机缩放经过的元素使用 `will-change`（导致文字发虚）。
- 循环接缝处的卡顿、最后一帧与第一帧不相等。

---

## 4. 差距分析

| # | 差距 | 社区参考解法 | 对应 Epic |
|---|---|---|---|
| G1 | 无"视觉风格 / 叙事概念"选型入口，只能从动效分类找 | bang-motion 10 风格 × 19 概念；anidoodle 31 媒介 | Epic 1 |
| G2 | 无"video, not slides"成片判据，无法在 UI 里自检 | bang-motion 六原则 | Epic 1 / Epic 4 |
| G3 | 渲染层（`src/engine`）无确定性静态扫描与系统质量门 | framewright 7 顺序像素 + 扫时钟；anidoodle gate | Epic 2 |
| G4 | 无闭式弹簧（纯函数、可 seek、多目标叠加） | 12-step 的 spring/track | Epic 3 |
| G5 | 无"绘制/描边生长"过程原语（drawing timelapse） | anidoodle 每笔生长、无 fade | Epic 3 |
| G6 | 无成片自检清单与节奏（dead air）检测 | anidoodle gate 的 dead air；12-step 评分 | Epic 4 |
| G7 | 无感知色彩（OKLCH）与渲染色彩管理（BT.709） | motion-design-skills color-motion；framewright BT.709 | 非本期（v1.0） |
| G8 | 无音频/beat 网格（项目当前为纯视觉） | 12-step 合成与 librosa 节拍 | 非本期（v1.0，视觉成片不阻塞） |
| G9 | 每个模式只有"原则"，没有**复制即用的完整代码片段**；弱模型无法自行实现高级技术 | anidoodle 每媒介配实现；12-step 给完整代码 | Epic 1 / Epic 3 |
| G10 | 没有一键生成的**制作包 / 代码脚手架**（导演简报、prompt、骨架靠模型自己组织） | 12-step 的 CLAUDE.md + scaffold | Epic 5 |
| G11 | 质量门是"建议"而非"**阻断**"；弱模型会跳过自检；且没有"出问题怎么修"的 runbook | anidoodle gate；12-step critique | Epic 2 / Epic 4 |
| G12 | 没有定义最终交付、**为弱模型设计的 Skill**（可逐步执行的 SOP / 路由表 / 黄金示例） | 12-step motion-reel skill | Epic 6 |
| G13 | 缺少 **signature moment（高光片段）库**，弱模型做不出"惊艳瞬间" | 每风格的签名时刻 | Epic 4 |
| G14 | 缺少"**弱模型实测**"验收（无法证明平权目标真的达成） | 12-step 多端实测 | 第 10 章 |

---

## 5. 三维选型模型（核心信息架构）

把"做一个视频"拆为三个正交维度，分别对应**皮肤 / 骨架 / 笔触**：

```
        视觉风格                叙事概念                媒介质感
     Art Direction  ×      Narrative Concept  ×     Medium Texture
        （皮肤）                （骨架）               （笔触，可选）
   决定背景/字体/色彩       决定镜头如何组织         决定表面的"材质手感"
   相机基调/调色          开场/转场/收尾结构        （扁平矢量为默认）
        10 项                  19 项              精选 14 项手绘媒介
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  ▼
              每一格映射到现有 effect / combo / shot 的 id
```

### 5.1 维度 A：视觉风格方向（Art Direction，10）
来自 bang-motion，决定整体基调。

| # | 风格 | 视觉关键词 | 建议签名动效（映射 id） |
|---|---|---|---|
| A1 | Cinematic dark 电影暗色 | 深色背景、冷暖对比、镜头推进、暗角 | `scroll.zoom` `enter.mask-reveal` `pointer.spotlight` `combo.title-product-focus` |
| A2 | Poster color-block 海报色块 | 大块纯色、硬切、粗体、几何 | `enter.wipe` `enter.clip-path-reveal` `layout.page-transition` |
| A3 | Editorial light 编辑亮色 | 浅色底、衬线、细分隔线、留白 | `text.line-reveal` `enter.slide` `component.accordion` |
| A4 | Paper & print 纸张印刷 | 纸张纹理、油墨、叠印、撕边 | `enter.blur-reveal` `feedback.skeleton`（叠纸感）|
| A5 | Retro·analog 复古模拟 | 噪点、扫描线、色差、CRT | `scroll.image-sequence` `enter.fade` `feedback.loading` |
| A6 | Brutalist mono 粗野极简 | 等宽、黑白、强网格、无圆角 | `text.scramble` `text.morph` `layout.layout-animation` |
| A7 | Pastel playful 粉彩玩趣 | 低饱和粉彩、圆角、弹性、贴纸 | `enter.scale` `component.carousel` `handling.spring` |
| A8 | Luxury dark 奢华深色 | 近黑、金色细线、缓慢、克制 | `enter.crossfade` `scroll.parallax` `feedback.icon-morph` |
| A9 | Flat pop with photos 扁平照片拼贴 | 扁平色块 + 照片、明快、pop | `enter.slide` `component.tabs` `combo.card-relay` |
| A10 | Grainy gradient 颗粒渐变 | 渐变 + 颗粒、流体、光晕 | `scroll.multi-layer-parallax` `pointer.reactive-bg` `pointer.3d-follow` |

### 5.2 维度 B：叙事开场概念（Narrative Concept，19）
来自 bang-motion，决定结构骨架。每个概念提供"开场 / 转场 / 收尾"原则，不是可照抄脚本。

| # | 概念 | 一句话结构 | 建议映射（combo / effect / shot） |
|---|---|---|---|
| B1 | One continuous shot 一镜到底 | 全程不切，场景在同一世界累加 | `layout.shared-element` `scroll.zoom` `scroll.sticky-story` |
| B2 | Pure typography 纯排版 | 仅靠字体与节奏叙事 | `text.word-reveal` `text.character-reveal` `text.morph` |
| B3 | Problem→gone 问题→消失 | 痛点呈现，产品出现后痛点消失 | `combo.title-product-focus` `enter.wipe` |
| B4 | Before/after 前后对比 | 同构视野左右/前后对照 | `chart.before-after` `combo.before-after-confirm` `chart.waterfall` |
| B5 | Journey inside the UI 进入 UI 之旅 | 相机飞入界面层层深入 | `combo.phone-focus-return` `scroll.zoom` `scroll.parallax` |
| B6 | Product macro 产品微距 | 产品特写、材质细节、缓推 | `scroll.zoom` `pointer.tilt-card` `scroll.multi-layer-parallax` |
| B7 | Object metaphor 物体隐喻 | 用一个具象物体承载概念 | `feedback.icon-morph` `layout.shared-element` |
| B8 | Living number 会呼吸的数字 | 数字作为主角持续生长 | `feedback.counter` `chart.rank-race` `chart.bar-compare` |
| B9 | One feature fully demoed 单功能完整演示 | 一个功能从头到尾真实操作 | `combo.capsule-input-result` `component.modal` `component.drawer` |
| B10 | Diegetic question→answer 场景内问答 | 场景内提出问题并就地解答 | `component.popover` `component.toast` `component.tabs` |
| B11 | Rhythmic collage 节奏拼贴 | 多素材按节拍快速拼贴 | `enter.crossfade` `component.carousel` `scroll.snap` |
| B12 | Logo as stage 舞台即 Logo | Logo 演化成舞台再回到 Logo | `feedback.icon-morph` `enter.scale` `layout.shared-element` |
| B13 | Object relay 物体接力 | 同一物体在镜头间接力传递 | `combo.card-relay` `layout.shared-element` |
| B14 | Brand system showcase 品牌系统展示 | 系统组件依次陈列 | `layout.layout-animation` `component.tabs` `component.toast` |
| B15 | Claim→how→result 主张→原理→结果 | 先抛主张，再演示，再给结果 | `combo.overview-select-detail` `chart.line-trend` |
| B16 | Living UI ecosystem 活的 UI 生态 | 多组件同时运转的生态 | `scroll.sticky-story` `component.tabs` `layout.page-transition` |
| B17 | Flat pop with photos 扁平照片 | 照片在扁平色块里 pop | `enter.slide` `component.carousel` `scroll.snap` |
| B18 | Through the gradient shapes 穿过渐变形体 | 相机穿过层层渐变形体 | `scroll.zoom` `scroll.multi-layer-parallax` `pointer.reactive-bg` |
| B19 | Product tour with claims 产品巡览+主张 | 巡览各模块，每站配一句主张 | `combo.overview-select-detail` `scroll.horizontal` `scroll.snap` |

> 概念与风格可自由组合，但**禁止**把社区示例的具体颜色、形状、签名时刻照抄；只取语法。

### 5.3 维度 C：媒介质感（Medium Texture，精选 14，默认 Flat vector）
来自 anidoodle 31 媒介，作为可选叠加层。决定"画面是什么手感"。

| # | 媒介 | 质感关键词 | 适合的风格/场景 |
|---|---|---|---|
| C1 | Flat vector 扁平矢量（默认） | 干净几何、长投影、轻颗粒 | 全部 |
| C2 | Pencil & watercolour 铅笔水彩 | 浅色晕染、铅笔轮廓 | A3 / A7、讲解 |
| C3 | Ink & line-wash 水墨淡彩 | 淡墨、柔笔尖 | A3 / A8、叙事 |
| C4 | Marker comic 马克笔漫画 | 平涂色块、粗轮廓 | A2 / A7、广告 |
| C5 | Risograph 孔版印刷 | 套色网点、错位叠印 | A2 / A4、海报 |
| C6 | Cut-paper collage 剪纸拼贴 | 撕纸、分层、投影 | A2 / A4、概念 |
| C7 | Newsprint halftone 报纸网点 | 黑网点 + 一个专色 | A6 / A4、严肃 |
| C8 | Pixel art 像素 | 16 色低分辨率网格 | A5 / A6、复古 |
| C9 | Sumi-e 水墨画 | 一笔成形、宣纸、留白 | A8、意境 |
| C10 | Single-line engraving 单线雕刻 | 一条螺旋线宽度即明暗 | A3 / A8、精致 |
| C11 | Chalkboard 黑板 | 粉笔侧涂、粉尘 | A6、教育/讲解 |
| C12 | Cyanotype blueprint 蓝晒蓝图 | 蓝图、制图笔、白线 | A6、技术/工程 |
| C13 | Rubber-hose 橡皮管卡通 | 30 年代卡通、软肢体、胶片颗粒 | A7、玩趣 |
| C14 | Woodcut/ukiyo-e 木刻浮世绘 | 主版 + 色块、和纸 | A8、叙事 |

> 完整 31 媒介见 anidoodle 仓库；本期只精选与 motion graphic 最相关的 14 种。媒介质感与"绘制过程原语"（Epic 3）天然搭配：每种媒介的入场都应**按该媒介艺术家的真实绘制顺序逐笔生长**，而不是 fade in。

---

## 6. 迭代范围：六个 Epic

### Epic 1 — 风格与概念模式库（Pattern Library）
**目标**：把第 5 章的三维模型落成数据 + 一个可浏览的选型视图。

- 新增 `data/style-patterns.json`，结构见第 8 章。
- 内容：6 条成片哲学、10 风格、19 概念、14 媒介，每项含 `keywords / whenToUse / avoidWhen / mapsTo[]`（引用现有 effect/combo/shot id）。
- 新增一个视图（信息架构见第 7 章），支持：
  - 按维度浏览（风格 / 概念 / 媒介三个子页签或分组）。
  - 每个卡片展示名称、关键词、映射到的动效（点击可跳转到对应 effect/combo/shot 详情）。
  - 顶部显著呈现"video, not slides"六原则。
- **弱模型关键：每个模式必须配"复制即用实现片段"（copy-ready snippet）**：
  - 风格 / 概念 / 媒介卡片除了原则，还提供一段**完整可运行的示例代码**（可 seek、固定种子、含该模式的签名运动），配"复制代码"按钮与内嵌预览。
  - 设计取向：bang-motion 对强模型是"原则不是脚本"；但为了弱模型平权，本框架采用"**原则 + 脚本**"——弱模型直接抄代码改参数，不需要自己发明。
  - 片段统一基于第 8 章的脚手架内核，保证风格、命名、质量门一致。

### Epic 2 — 确定性质量门（Determinism Gate）
**目标**：把项目既有的纯函数理念，升级为一条命令可执行的系统质量门。

- 新增 `scripts/check-determinism.mjs`，检查项：
  1. **渲染层静态扫描**：扫描 `src/engine/*.js` 的 `render` 实现路径，禁止出现 `Math.random`、`Date.now`、`new Date(`、`performance.now`、`setTimeout`、`setInterval`、`requestAnimationFrame`、`fetch(`、`XMLHttpRequest`、`import(` 等；随机必须走 `kit.seeded()`。
  2. **外部资源约束**：渲染器内不应 hardcode 第三方 URL；图片必须走 `kit.img/pic`；新增渲染器若需外部资源要显式声明。
  3. **数据层跨顺序一致性**：整合 `test-runtime.mjs` 已有的组合/镜头卡正逆序 seek 校验（不重复实现，复用或引用）。
  4. **进度函数完备性**：扫描/测试所有 progress helper 在 `t >= 1` 时精确返回 1（避免 0.999 残留）。
- 输出：人类可读报告（每项 PASS/WARN/FAIL + 文件:行号），任一 FAIL 退出码非 0。
- 接入 `package.json`：新增 `"gate": "node scripts/check-determinism.mjs"`；建议 `check` 串入 `gate`（改动 `package.json` 一个字段，属于显式点名，安全）。
- 说明：真正的像素级跨顺序渲染需要 headless 浏览器（Playwright），**本期不引入该重依赖**；像素级 PSNR 校验列为 v1.0。本期 gate 以"静态扫描 + 纯数据层多顺序校验"为主。

### Epic 3 — 运动物理与绘制原语（Motion Primitives）
**目标**：补齐可 seek 的高级运动语法，并引入"绘制过程"作为新原语。

- 在 `src/kit.js` 新增**闭式弹簧**（纯函数，参考实现见附录 B）：
  - `spring(t, k, d)`：0→1 闭式阻尼弹簧，纯时间函数。
  - `track(t, keys, k, d)`：多目标值——每个目标变化叠加一个独立弹簧，不重启，支持任意 seek。
  - `indicator(t, stops)`：标签/指示条，前缘与后缘用不同刚度，形成拉伸。
  - `swapAlpha(t, tIn, tOut)`：变形容器内文字的进出场透明度（在变形开始后进入、下一次变形前离开）。
- 新增**绘制/描边生长原语**（drawing timelapse）：
  - 至少 1 个新动效变体（建议归入 `enter` 或 `text`，例如 `enter.draw-on` / `text.stroke-grow`）：用 SVG `stroke-dasharray/stroke-dashoffset` 或 `clip-path` 让线条/图形**逐笔生长**，最后一帧等于完成态；可 seek、固定种子。
  - 关键：**不使用 fade in**；笔画从起笔点生长；多条笔画用 `stagger`/`track` 按顺序。
- 预设：给新动效补 `data/presets.json` 的 `still`（建议落在笔画大部分完成、有代表性的时刻）。

### Epic 4 — 成片自检与节奏（Critique & Pacing）
**目标**：把"导演自检"嵌入现有详情与组合视图。

- 在 **combo 详情 / shot 详情**中新增"成片自检清单"区块：
  - video-not-slides 六原则的可勾选清单（连续世界 / 真动相机 / 持续主体 / 场景内文字 / 背景不静止 / 素材锁时间轴）。
  - 评分维度（1–10）：前 2 秒钩子、手机尺寸可读性、运动质量、多样性（每 2–4 秒新事件）、品牌一致性、（如有）声画同步。
- **节奏（dead air）检测**：在 `check-determinism.mjs` 或独立校验中，对组合/镜头卡的时间轴检查"相邻事件间隔"，超过阈值（默认 4 秒无事件）报 WARN（数据层可做，不依赖渲染）。
- **质量门必须"阻断"而非"建议"**：流程上规定未跑通 gate / 未过 contact sheet 不得进入全量渲染（写进 Skill 与脚手架，弱模型无法跳过）。
- **签名时刻库（Signature Moment Library）**：每个风格配 1–2 个现成的"高光片段"实现（如 A1 的镜头推进穿字、A6 的乱码定格、A10 的穿层），弱模型可直接嵌入，保证片中有"惊艳瞬间"。
- **修复 runbook（Fix Cookbook）**：把常见问题 → 精确修法写成表（文字 swap 重叠、该缓动却在滑动、发虚的缩放文字、循环接缝卡顿、死帧等），模型按图索骥，而不是自己猜。
- 本期不实现自动化截图打分（需要 headless 浏览器）；contact sheet 与评分以"Web 端关键帧拼装 + 结构化核对"为主，清单写进数据，便于 v1.0 自动化。

### Epic 5 — 制作包生成器（Recipe Builder / 代码脚手架）
**目标（弱模型平权的核心）**：把"组织导演简报、写 prompt、搭项目骨架"这些弱模型不擅长的工作，在 Web 端自动完成。弱模型拿到的是**半成品**，只需填内容。

- 一个交互式向导（Wizard，挂在「镜头组合」内，见第 7 章）：
  1. **Intake（问卷/选择题）**：产品与目标、时长、格式（9:16 / 1:1 / 16:9）、是否有参考（帧/视频/库）、品牌色与字体、是否需要音乐。
  2. **推荐（决策路由表）**：系统按第 8.4 的路由表自动给出 风格 + 概念 + 媒介 组合与理由，用户可改选。
  3. **生成（一键产出制作包）**：
     - **自动导演简报**：填充好的 director brief（含 logline、参考、调色、镜头表、工作流门、评分表）。
     - **可直接喂给模型的完整 prompt**：自带全部上下文、六原则、DO/DON'T、交付物清单（弱模型不需要自己组织）。
     - **代码脚手架**：标准项目结构 + `index.html` 模板（route A 零依赖路线）+ `lib/motion.js`（弹簧/缓动）+ `lib/camera.js`（呼吸+推进）+ `cue table`，且已按所选模式预置（见 8.3）。
     - **任务清单**：拆好的小步骤，每步含输入/输出/验收，弱模型按顺序执行。
     - **gate 配置**：对应命令与必须通过的检查项。
- 复用现有 `src/output.js` 的 `buildInstruction / buildConfigJson` 与 `effectiveConfig`，在此基础上扩展为"整包生成"。
- 交付形态：一键下载（zip 或文件夹）或分区复制（prompt / 脚手架 / 简报各一块）。

### Epic 6 — 交付 Skill 规格（为弱模型设计）
**目标**：把整套管线打包成可安装、可复用、弱模型可逐步执行的 Skill（最终物，不只是网站）。

- **分层结构**：
  - 主控 skill `motion-director`：负责触发判断 → 强制 intake → 路由决策（查表）→ 分派执行 → 把每道 gate。
  - 执行 skill：按场景类型 / 模式复用引擎与脚手架（或单一 skill 内分节），负责把配方实例化。
- Skill 必须包含的要素（详见 8.4）：
  1. 触发条件（何时用）；2. 强制 intake（带默认值）；3. 决策路由表（目标 → 风格/概念/媒介，弱模型查表）；4. 标准项目结构（scaffold）；5. 每步精确指令 + 黄金示例（输入/输出/验收）；6. 复制即用代码库；7. 阻断式 gate 流程；8. 修复 runbook；9. DO / DON'T 与 slop 黑名单；10. 完成定义。
- 难度分级：弱模型默认走"模板路径"（Epic 5 产物），模板不满足才升级到创作路径。

---

## 7. 信息架构与导航（已决策）

### 7.1 维持 4 个一级导航（硬约束）
镜头组合 / 完整词典 / 触发方式 / 工具与渲染层——**不新增一级导航**。

### 7.2 Epic 1 视图落点：方案 A（推荐，已采纳）
- 「风格与概念」归入 **镜头组合** 页：在左侧 rail 顶部新增「风格与概念」入口，与现有"叙事配方 / 常用卡分类"并列。
- 点击后右侧内容区切换到三维选型视图（在 `compositions` 视图下新增子模式，沿用现有 `compositionView` 状态对象的模式，新增如 `patternMode: 'style'|'concept'|'medium'`）。
- 理由：风格/概念是"成片视角"，归属镜头组合最自然；不破坏导航。

### 7.3 Recipe Builder（Epic 5）落点
- 同为「镜头组合」内的子功能，**不新增导航**：
  - rail 顶部在「风格与概念」旁再放一个「生成制作包」入口；
  - 三维选型视图中选好模式后，内容区末端放显著的「生成制作包」主按钮（向导 → 产出）。
- 向导用镜头组合页内的子状态管理（沿用 `compositionView` 模式，新增如 `wizard: 'intake'|'recommend'|'export'`），不新增顶层路由。
- 片段查看 / 复制、signature moment、contact sheet 均内嵌在风格概念视图内。

### 7.4 路由（原 7.3）
- 复用现有 hash 路由；风格/概念视图通过镜头组合页内状态切换，不强制新增顶层路由。
- 若需要可分享链接，可在 `compositions` 上扩展 query（如 `#/compositions?tab=patterns&mode=style`），保持向后兼容；**不**改动 effect/shots 既有路由。

### 7.5 不做
- 不新增一级导航、不改变现有 4 视图的既有交互（键盘 ←/→、卡片起点帧、"全部"选项等保持）。
- 不把二级维度做成顶部导航。

### 7.6 视图布局规格（给前端实现，对齐现有结构）

**A. 左侧 rail（`railHTML` 的 compositions 分支）**——自上而下分 3 组，用分组小标题区分：
1. **视图（新增）**：「风格与概念」`data-patterns`、「生成制作包」`data-wizard`。
2. **叙事配方（现有）**：6 个 combo。
3. **镜头库（现有）**：「全部」+ 分类。

**B. 风格与概念视图（内容区，`patternMode`）**
- 顶部：维度切换（风格 / 概念 / 媒介）+ 「video, not slides」六原则横幅（可折叠）。
- 主体：该维度卡片网格；卡片含编号、名称、关键词 chips、映射动效。
- 选中卡片后展开（或进详情）：描述、whenToUse / avoidWhen、**复制即用片段**（代码块 + 复制按钮）、**内嵌可播放/seek 预览**、可点击的映射项。
- 底部主按钮：「用此模式生成制作包」。

**C. Recipe Builder 向导（内容区，`wizard`）**——顶部进度条 1/2/3：
1. **Intake**：产品/目标、时长、格式（9:16/1:1/16:9）、参考、品牌色/字体、音乐；全部为选择题/填空题并带默认值。
2. **推荐**：路由表给出 风格+概念+媒介 组合与理由，可改选。
3. **导出**：制作包分区预览（简报 / prompt / 脚手架 / 任务清单 / gate）；操作=「下载整包（zip）」或「分项复制」。

**D. 详情（现有 combo/shot detail）增强**
- 新增「成片自检清单」（六原则勾选 + 评分）与「修复 runbook」折叠区；保留现有复制按钮。

---

## 8. 数据结构规格

### 8.1 `data/style-patterns.json`（新增）
```jsonc
{
  "version": 1,
  "principles": [
    {
      "id": "continuous-world",
      "label": "一个连续世界",
      "detail": "场景在同一个世界里连续演化，而非一段段幻灯片。",
      "checks": ["同一场景内的元素跨镜头持续", "切换靠相机/变形而非整屏淡入淡出"]
    }
    // 其余 5 条：moving-camera / persisting-subject / text-in-scene /
    // moving-background / footage-locked-timeline
  ],
  "styles": [
    {
      "id": "cinematic-dark",
      "index": "A1",
      "label": "电影暗色",
      "en": "Cinematic dark",
      "keywords": ["深色", "冷暖对比", "镜头推进", "暗角"],
      "whenToUse": ["科技/产品发布", "需要电影感与高级感"],
      "avoidWhen": ["轻松/童趣主题", "需要大留白的编辑型内容"],
      "snippet": "snippets/style-cinematic-dark.js",
      "signatureMoments": ["push-through-headline", "spotlight-reveal"],
      "mapsTo": [
        { "type": "effect", "id": "scroll.zoom", "role": "镜头推进" },
        { "type": "effect", "id": "enter.mask-reveal", "role": "遮罩揭示" },
        { "type": "combo", "id": "combo.title-product-focus", "role": "标题→产品" }
      ]
    }
    // 其余 9 个风格……
  ],
  "concepts": [
    {
      "id": "one-continuous-shot",
      "index": "B1",
      "label": "一镜到底",
      "en": "One continuous shot",
      "structure": "全程不切，场景在同一世界里累加。",
      "opening": "从一个细节或全貌起幅",
      "transition": "靠相机移动与元素变形，不硬切",
      "ending": "回到起幅或揭示整体",
      "mapsTo": [
        { "type": "effect", "id": "layout.shared-element", "role": "神奇移动" }
      ]
    }
    // 其余 18 个概念……
  ],
  "media": [
    {
      "id": "pencil-watercolour",
      "index": "C2",
      "label": "铅笔水彩",
      "en": "Pencil & watercolour",
      "keywords": ["浅色晕染", "铅笔轮廓"],
      "drawOrder": ["先铅笔起稿", "再由浅到深色晕染", "最后勾线"],
      "mapsTo": [{ "type": "effect", "id": "enter.draw-on", "role": "逐笔生长" }]
    }
    // 其余 13 种媒介……
  ]
}
```

### 8.2 引用约束
- `mapsTo[].id` 必须是现有 `effects.json` / `compositions.json` / `shot-recipes.json` 中存在的 id；执行方应在 `validate-registry` 或 gate 中加一条"映射 id 存在性"校验，避免悬空引用。
- 新增动效 `enter.draw-on`（Epic 3）若在媒介 `drawOrder` 中被引用，需先在 `effects.json`/引擎注册后再引用。

### 8.3 代码脚手架结构（Route A，零依赖，生成器按模式预填）
```
my-video/
├─ index.html        # 单文件：canvas + seek(t) + 场景注册（离线预览用，webdriver 下自停）
├─ lib/
│  ├─ motion.js      # spring / track / indicator / swapAlpha + 缓动（附录 B）
│  ├─ camera.js      # 相机：呼吸漂移 + 有动机推进（纯函数，可 seek）
│  └─ util.js        # clamp01 / seg / seeded
├─ cue-table.json    # 唯一 cue 表：cuts / events 登记的帧号
├─ scenes/           # 每个场景一个模块（也可内联进 index.html）
├─ render.mjs        # 机械逐帧渲染（标配，见 F.3；需环境有 Playwright/ffmpeg）
└─ README.md
```
- 关键：高级运动（弹簧 / 相机 / 绘制）**已内置在 lib 里**，弱模型不在此处创作，只需在 `scenes/` 填内容并登记 cue 表。
- 可 seek 相机模型（纯函数，示意）：
  ```js
  // 相机 = 基准 + 呼吸漂移 + 由 cue 触发的推进；全部为 t 的函数
  export function camera(t, cues) {
    const breatheX = Math.sin(t * 0.9) * 0.006;
    const breatheY = Math.cos(t * 1.1) * 0.004;
    const push = seg(t, cues.pushAt, cues.pushAt + 1.2); // 0..1
    return { zoom: 1 + push * 0.18, x: breatheX, y: breatheY };
  }
  ```

### 8.4 交付 Skill 规格与决策路由表（Epic 6）
**Skill 目录结构**：
```
motion-director/
├─ SKILL.md                # 触发条件 + 强制流程（intake→路由→执行→gate）
├─ references/
│  ├─ principles.md        # 六原则 + slop 黑名单
│  ├─ routing-table.md     # 决策路由表（下）
│  ├─ fix-cookbook.md      # 问题 → 修法
│  └─ review-rubric.md     # 评分维度与 contact sheet 用法
├─ lib/                    # motion.js / camera.js / util.js（同脚手架）
├─ templates/              # index.html / 各场景骨架 / cue-table 模板
└─ snippets/               # 每模式 + signature moment 的复制即用片段
```
**决策路由表（弱模型查表，不做审美判断）**：
| 目标 / 片型 | 风格 | 概念 | 媒介 |
|---|---|---|---|
| 科技 / 产品发布 | A1 电影暗色 | B3 问题→消失 / B15 | C1 |
| 数据 / 指标故事 | A6 粗野极简 / A1 | B8 活数字 | C11 黑板 / C12 蓝图 |
| 品牌 / 温情 / 年轻化 | A7 粉彩 | B11 节奏拼贴 | C4 马克笔 |
| 高端 / 质感 / 意境 | A8 奢华深色 | B1 一镜到底 | C10 单线雕刻 |
| 编辑 / 文章 / 发布 | A3 编辑亮色 | B2 纯排版 | C1 |
| 海报 / 活动 / 促销 | A2 海报色块 | B12 舞台即 logo | C5 孔版 / C6 剪纸 |
| 复杂产品 / 功能讲解 | A9 扁平照片 | B5 进入 UI / B9 单功能 | C1 |
| 复古 / 玩梗 / 游戏 | A5 复古 | B14 / B16 | C8 像素 |
| 流程 / 前后对比 | A1 / A2 | B4 前后对比 | C1 |

> 路由表给出"保底正确"的组合；`mapsTo` 提供该组合下的具体动效；片段与脚手架提供实现。弱模型只需：intake → 查表 → 生成 → 填内容 → 跑 gate。

### 8.5 与现有数据的关系
- `style-patterns.json` 是**只读选型层**，不改动 effects/compositions/shot-recipes 的既有字段。
- 如需在动效详情反向显示"属于哪些风格/概念"，可在运行时由 `style-patterns` 反向构建索引，不回写动效数据。

---

## 9. 任务拆解（给执行模型的 Tickets）

按依赖顺序排列。每个 Ticket 独立可验收；建议同色（同一 Agent）串行做数据与引擎，视图可随后。

| Ticket | 改动文件 | 内容 | 依赖 | 验收 |
|---|---|---|---|---|
| **T1** | `data/style-patterns.json`（新增） | 6 原则 + 10 风格 + 19 概念 + 14 媒介；含 `snippet`、`signatureMoments`、`mapsTo` | 无 | JSON 合法；`mapsTo.id` 全部存在（draw-on 除外，T3 后补） |
| **T2** | `src/kit.js` | 加入 `spring / track / indicator / swapAlpha`（附录 B） | 无 | 纯函数；端点值正确；`node --check` 通过 |
| **T3** | `src/engine/enter.js`（或新建 `draw.js`）、`data/effects.json`、`data/presets.json` | 绘制生长动效 `enter.draw-on`：SVG 路径逐笔生长、可 seek、固定种子；注册并补 preset.still | T2 | seek 稳定；首帧起笔、末帧=完成态；无 fade in |
| **T4** | `snippets/`（新增，随项目分发） | 每模式 + signature moment 的**复制即用片段**（可独立运行、统一基于内核）；视图可查看/复制 | T1–T3 | 每片段可运行；与模式一一对应、数量齐全 |
| **T5** | `templates/`（新增，脚手架模板） | 标准脚手架：`index.html` + `lib/motion.js` + `lib/camera.js` + `cue-table`（供生成器预填） | T2 | 模板可被实例化并预览；相机/弹簧已内置 |
| **T6** | `scripts/check-determinism.mjs`（新增） | 质量门：渲染层静态扫描 + 外部资源约束 + progress helper 完备性 + 映射 id 存在性 + dead air（附录 C） | T1 | 干净代码 PASS；故意违例能 FAIL 并定位 |
| **T7** | `package.json` | 新增 `"gate"`；把 `gate` 串入 `check`（`validate` 之后、`build` 之前） | T6 | `npm run gate` 可运行；`check` 含 gate |
| **T8** | `src/main.js`（镜头组合段落）、`src/styles/main.css` | 三维选型视图：三维度浏览、片段查看/复制、内嵌预览、contact sheet、映射可跳转；rail 入口 | T1、T4 | 三维度可切换；视觉与现有一致；既有交互不回归 |
| **T9** | `src/main.js`（详情段落）、`src/styles/main.css` | 详情加「成片自检清单」+ 评分维度；嵌入修复 runbook 入口 | T1 | 详情显示清单；可定位问题与修法 |
| **T10** | `src/main.js`（Recipe Builder）、`src/styles/main.css`、（必要时 `src/output.js`） | 向导（intake→推荐→导出）；一键生成并下载/复制：简报 + prompt + 脚手架 + 任务清单 + gate 配置 | T5、T8、T9 | 走完向导可产出完整制作包；包可直接用 |
| **T11** | `skill/`（新增，motion-director 交付物） | 按 8.4 打包 skill：SKILL.md + references + lib + templates + snippets | T4–T10 | 目录齐全；在目标 harness 中可被识别与执行 |
| **T12** | （无新增文件） | **弱模型实测**：用 DeepSeek 4.1 flash 跑制作包成片，按评分表打分并记录差距 | T11 | 见 10.5 验收阈值 |

> 建议执行顺序：T2 → T3 → T1 → T4 → T5 → T6 → T7 → T8 → T9 → T10 → T11 → T12。
> 分批交付：**第一批 T1–T7（内核 + 资产 + 护栏）**，**第二批 T8–T10（Web 演示层）**，**第三批 T11–T12（Skill 打包 + 弱模型实测）**。

---

## 10. 验收标准（Acceptance Contract）

### 10.1 自动化验收（必须全部通过，且不跑会动 registry/dist 的 `build`）
```bash
node --check src/kit.js
npm run validate      # 注册表校验
npm run gate          # 新增：确定性质量门
npm run test:runtime  # 现有运行时测试不回归
```
- 以上命令退出码均为 0。
- **避免**在验证阶段跑 `npm run build`（会重生成 `registry.json`/`dist`，可能与并行 Agent 冲突）。

### 10.2 功能验收（逐项）
- [ ] 镜头组合 rail 有「风格与概念」入口；点击切换到三维选型视图。
- [ ] 风格 / 概念 / 媒介三个维度可分别浏览，卡片展示关键词与映射。
- [ ] 点击任一映射项可跳转到对应 effect/combo/shot 详情；返回正常。
- [ ] combo/shot 详情显示成片自检清单与评分维度。
- [ ] 新动效 `enter.draw-on`：首帧在起笔点、逐笔生长、末帧等于完成态；可逐帧 seek 且正逆序一致；无 fade in。
- [ ] 质量门对禁用写法（Math.random/时钟/定时器/外部 fetch/hardcode URL）能准确报 FAIL 并定位文件:行号。
- [ ] 时间轴相邻事件间隔 >4s 时给出 dead air 提示。
- [ ] 每个模式卡片可查看「复制即用片段」与内嵌预览，"复制代码"可用。
- [ ] Recipe Builder 向导能走完 intake→推荐→导出，产出完整制作包（简报 + prompt + 脚手架 + 任务清单 + gate 配置）。
- [ ] 制作包可被直接使用：脚手架能预览、prompt 自包含、任务清单可执行。
- [ ] signature moment 片段可被查看并嵌入；修复 runbook 可定位问题与修法。
- [ ] motion-director skill 目录完整（SKILL.md/references/lib/templates/snippets），在目标 harness 中可被识别。

### 10.3 回归与一致性
- [ ] 现有键盘 ←/→、卡片起点帧、"全部"选项、hover 预览等交互不受影响。
- [ ] 未新增一级导航；4 个一级导航保持。
- [ ] 仅改动点名文件；未触碰第 11.3 节列出的协作禁区。

### 10.4 各 Epic 的完成定义（DoD）
- Epic 1：数据齐全、视图可浏览、映射可跳转、片段可复制。
- Epic 2：`npm run gate` 一条命令完成，报告清晰、退出码正确。
- Epic 3：弹簧为纯函数并可 seek；绘制原语落地为可演示动效。
- Epic 4：自检清单进入详情；dead air 可检测；签名时刻与 runbook 就位。
- Epic 5：向导可一键产出完整、可用的制作包。
- Epic 6：skill 打包完整并可被识别执行。

### 10.5 弱模型平权实测（证明第 0 章目标达成，关键验收）
**方法**：
1. 固定使用 **DeepSeek 4.1 flash**（记录具体版本与参数）。
2. 选 3 个有代表性的片型：科技/产品发布、数据/指标故事、品牌/温情（对应路由表 3 行）。
3. 弱模型**严格使用 Recipe Builder 产出的制作包（路径 P）**，不额外给强提示或代劳；每个片型产出成片。
4. 对照：用同一份简报让 Opus 5.5 产出对照片（或采用社区标杆片），由同一份评分表盲评。

**评分维度（1–10）**：前 2 秒钩子、手机尺寸可读性、运动质量（弹簧/无死帧）、多样性（每 2–4 秒新事件）、品牌一致性、（如有）声画同步。

**通过阈值（建议，可由用户调整）**：
- 弱模型每个片型：**各项 ≥ 7**；其中「运动质量 / 多样性 / 手机可读性」三项 **≥ 8**。
- **零 slop 红线**：不出现居中渐变+全 fade、死帧、循环接缝卡顿、缩放发虚文字、通用粒子。
- 与 Opus 对照片相比：**总分差距 ≤ 15%**（或每项平均差 ≤ 1.5 分）。
- 任一阈值不达标，记录差距并回到对应 Epic 补强（通常是模板/片段/护栏不足），不视为平权完成。

---

## 11. 非目标与边界（Non-goals）

### 11.1 本期不做
- 不引入 Playwright/Puppeteer 等 headless 重依赖；不做像素级 PSNR/跨顺序渲染截图（列为 v1.0）。
- 不做真实音频合成、librosa beat 检测、声画同步（项目本期保持纯视觉）。
- 不做 WebGL/Three.js 3D 引擎、不做粒子系统大改。
- 不实现自动化截图打分（critique 自动化）；仅落地结构化清单。
- 不做 OKLCH 色彩系统与 BT.709 编码（v1.0）。
- 不新增一级导航。

### 11.2 技术约束
- 保持零重依赖（除 GSAP / Inter 字体）；新逻辑优先纯函数 + ES Module。
- 所有新动效必须满足"可 seek、固定种子、不携带跨帧状态"。
- 图表/数字/面积相关值禁止回弹（用 `noOvershoot`）。

### 11.3 协作禁区（另一 Agent 可能在改）
- 不修改 `src/production/shot-recipe-preview.js`。
- 不手改 `public/registry.json`、`dist/`、`docs/*` 中由脚本生成的内容。
- 不修改 `CHANGELOG.md`（除非明确要求）。
- 不跑 `npm run build`（会重生成 registry/dist）。
- 视图改动只在 `main.js` 镜头组合 / 详情相关段落与 `main.css`，不扩散到无关分支。

---

## 12. 风险与权衡

| 风险 | 影响 | 缓解 |
|---|---|---|
| 与并行 Agent 改同一文件（main.js / package.json） | 合并冲突、互相覆盖 | 只改点名段落；提交前 `git status` 并拉取；禁区文件不碰 |
| 静态扫描误报（如注释中出现禁用词） | gate 假失败 | 提供显式白名单注释（如 `/* gate:allow reason */`）；只在 render 相关范围匹配 |
| 弹簧/绘制原语在 DOM 下逐帧成本高 | 预览卡顿 | 仅在需要时用；复用 SVG dashoffset（GPU 友好）；避免每帧创建节点 |
| 映射表与实际效果不符（id 存在但语义偏差） | 选型误导 | 加映射 id 存在性校验；PRD 注明映射为建议起点，以实际 variant 为准 |
| 一次铺开范围过大 | 交付质量下降 | 按第 9 章分批：先 T1–T5，再 T6/T7 |
| 过度追求"花哨"违背克制原则 | 出现反模式 | 以第 3 章六原则与反模式清单为评审标准 |

---

## 13. 参考来源

### 13.1 收集册
- **awesome-claude-video-skills**（183 仓库总索引，含 11 个 motion graphics）：https://github.com/zhuyansen/awesome-claude-video-skills

### 13.2 重点参考仓库（各自贡献）
- **bangtutorial/bang-motion**：video-not-slides 六原则；10 风格方向 × 19 开场概念 × 6 讲解风格；风格简报先行。https://github.com/bangtutorial/bang-motion
- **alexgreensh/anidoodle**：31 手绘媒介与"逐笔生长"绘制电影；合成音乐；gate 质量门；确定性契约（cue table、cache key、PSNR 45）；art core 多后端。https://github.com/alexgreensh/anidoodle
- **smwbev/framewright**：帧=纯函数；7 顺序渲染像素一致；扫描时钟/随机；禁外部文件；照片转多边形；BT.709。https://github.com/smwbev/framewright
- **iart-ai/motion-design-skills**：动画原则、色彩（OKLCH/Lab）、镜头构图、艺术指导、节拍同步、logo、动态背景。https://github.com/iart-ai/motion-design-skills
- **heygen-com/hyperframes**：HTML/CSS 写动画、确定性渲染 MP4。https://github.com/heygen-com/hyperframes

### 13.3 方法论文章
- 12 步工作室管线课程（movez.substack.com）：seek(t) 引擎、闭式弹簧、beat grid、合成声音、critique loop、导演简报、多格式、skill 化。

---

## 附录 A：风格/概念/媒介映射总表（落地核对用）

执行方在填充 `style-patterns.json` 时，可直接使用第 5.1 / 5.2 / 5.3 节表格；映射为建议起点，落地后须用实际 variant 校验，并保证 `mapsTo.id` 全部存在。

## 附录 B：闭式弹簧参考实现（纯函数，可直接放入 kit.js）

```js
const clamp01 = (x) => (Number.isFinite(x) ? (x < 0 ? 0 : x > 1 ? 1 : x) : 0);

// 闭式阻尼弹簧：0 → 1，纯时间函数（t 为秒）
export function spring(t, k = 170, d = 26) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k);
  const z = d / (2 * w0);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  }
  // 临界/过阻尼
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

// 多目标值：keys = [[time, value], ...]；每个目标变化叠加一个弹簧，不重启
export function track(t, keys, k = 170, d = 26) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
  }
  return v;
}

// 标签/指示条：前缘更刚、后缘更柔，形成拉伸
export function indicator(t, stops) {
  const lead = track(t, stops, 320, 30);
  const trail = track(t, stops, 140, 22);
  return { left: Math.min(lead, trail), right: Math.max(lead, trail) + 120 };
}

// 变形容器内文字：变形开始后进入、下一次变形前离开
export function swapAlpha(t, tIn, tOut) {
  return Math.min(clamp01((t - tIn - 0.08) / 0.12), clamp01((tOut - 0.1 - t) / 0.1));
}
```

弹簧档位建议：snappy（按钮/开关/前缘，k≈320）、default（卡片/容器/相机，k≈170）、heavy（大字号/3D/Logo，k≈90）、playful（吉祥物/贴纸，允许明显超调）。

## 附录 C：质量门检查规则伪代码

```js
// scripts/check-determinism.mjs
import { readFileSync } from "node:fs";

const BANNED = [
  [/\bMath\.random\b/, "随机必须用 kit.seeded()"],
  [/\bDate\.now\b|\bnew Date\b/, "渲染核心禁用时钟"],
  [/\bperformance\.now\b/, "渲染核心禁用 performance.now"],
  [/\bsetTimeout\b|\bsetInterval\b/, "渲染模式禁用定时器"],
  [/\brequestAnimationFrame\b/, "渲染模式禁用 rAF"],
  [/\bfetch\s*\(|\bXMLHttpRequest\b/, "渲染路径禁止网络请求"],
  [/\bimport\s*\(/, "渲染路径禁止动态 import"],
];
// 1) 遍历 src/engine/*.js（必要时含 src/kit.js 的渲染相关段）
// 2) 逐行匹配 BANNED；命中且无 "/* gate:allow ... */" 白名单 → FAIL，记录 文件:行号
// 3) 匹配 https?:// 硬编码 URL（注释与 kit 引用除外）→ WARN/FAIL
// 4) 校验 style-patterns.json 的 mapsTo.id 存在性
// 5) 校验 progress helper：spring/seg/stagger 在 t>=1 时返回值 >= 1-1e-6
// 6) 复用 test-runtime 的组合/镜头卡正逆序 seek 校验
// 7) dead air：解析各 timeline，相邻事件间隔 > 4s → WARN
// 汇总 PASS/WARN/FAIL；任一 FAIL → process.exit(1)
```

## 附录 D：术语表
- **seek(t)**：给定归一化时间 t（0..1）直接渲染对应帧的能力。
- **闭式弹簧（closed-form spring）**：由时间解析式直接算出弹簧位置，无需逐帧积分，因此可任意 seek。
- **contact sheet（联系表）**：把每个节拍的代表帧拼成一张图，用于快速整体审阅。
- **cue table**：唯一的时间线索引表，所有镜头/事件都登记其上。
- **结构指纹（structure fingerprint）**：一个项目在开场/转场/收尾上的组合特征，用于反同质化。
- **generate-then-trace**：先用视频模型生成基础镜头，再用代码层重绘覆盖，兼顾运动与统一风格。

## 附录 E：主控 Skill 的 `SKILL.md` 完整模板（可直接复制）

```markdown
---
name: motion-director
description: 用代码驱动的方式制作 motion graphic 短片（产品发布 / 数据故事 / 品牌 / 海报 / 讲解）。当用户要做"动效视频、发布视频、showreel、产品短片、动效讲解"时使用。为弱模型设计：严格按"选型→脚手架→填内容→质量门"流程，禁止退回居中渐变 + 全 fade 的 slop。
---

# Motion Director

你是用代码产出 motion graphic 的导演 + 渲染工程师。目标：即使是弱模型，也能产出接近 Opus 5.5 的成片。

## 铁律（任何时候不得违反）
1. 成片是时间的纯函数：`seek(t)` 给定 t 画唯一帧；渲染模式无 CSS transition、无 setTimeout / rAF、无跨帧状态；随机只用 seeded，禁用 Math.random。
2. 是视频不是幻灯片：连续世界、相机真的动（呼吸+推进）、主体持续、文字在场景内、背景不静止、每 2–4 秒有新事件。
3. 不做 slop：居中标题+渐变、全 fade、四角标签/边框、chrome glow、通用粒子、死帧、发虚的缩放文字、循环接缝卡顿。
4. 质量门是阻断的：没跑通 gate、没看完 contact sheet，不准全量渲染。

## 工作流程（严格按顺序，每步完成才能下一步）
1. **收集 intake**：用选择题确认（缺啥问啥、给默认值）：产品+一句话目标、时长(默认15s)、格式(默认9:16)、参考(帧/视频/库)、品牌色/字体/一个强调色、是否要音乐。
2. **选型（查表，不自己发明）**：按 references/routing-table.md 选 风格+概念+媒介；给 1 推荐 + 1 备选与理由；确认要用的 snippets。
3. **脚手架（复制模板，不从零写）**：用 templates 生成 index.html + lib/motion.js + lib/camera.js + cue-table；弹簧/相机/绘制已内置，不要重写。
4. **填内容（填空）**：在 scenes 填镜头；按 cue-table 登记事件；文字在变形开始后进入、下一次变形前离开；多目标值用 track()，不重启弹簧。
5. **自检 critique（阻断）**：出 contact sheet，逐项 1–10 评分（前2秒钩子 / 手机可读性 / 运动质量 / 多样性 / 品牌 / 声画）；列最差 3 项，查 fix-cookbook 修；重复到每项 ≥8（保底 ≥7）。
6. **渲染交付**：跑 gate 全绿；交付 final + contact sheet + poster + README；说明可改进点。

## 卡住 / 不达标时
- gate 报错：看文件:行号 + fix-cookbook，不要绕过。
- 模板不满足：先说清哪里不满足，再考虑创作路径，不要直接乱写。
- 能力不足：把任务拆得更小，一次只做一个镜头并验证。

## 你不能做
- 不跳过任何一步；渲染路径不用 Math.random / 时钟 / 定时器 / 网络请求。
- 不照抄参考的颜色/内容/角色，只取语法；没看完 contact sheet 不得声称完成。
```

## 附录 F：路径 P 端到端走查 + 最小 index.html

### F.1 一个完整走查（科技发布片示例）
1. intake：产品=「X」、目标=上线发布、时长 15s、格式 9:16、无参考、品牌强调色橙、无声。
2. 查表 → A1 电影暗色 + B3 问题→消失 + C1 扁平矢量。
3. 生成脚手架（已含相机呼吸+推进、弹簧）。
4. 填镜头：钩子大字(2s)→产品逐件拼装(3s)→三个功能各 2s→一个数字证据(2s)→logo+CTA(2s)。
5. 出 contact sheet：发现 2 个问题（中段功能切换太像 fade、一处文字 swap 重叠）→ 查 fix-cookbook 改为 mask/wipe + 错开 swap 时间。
6. 复评各项 ≥8 → 跑 gate 全绿 → 交付。

### F.2 最小 `index.html`（canvas 2d + seek + 弹簧，成片导向，可直接运行）
```html
<!doctype html>
<html><head><meta charset="utf-8"><style>
  html,body{margin:0;background:#141413}
  canvas{display:block}
</style></head><body>
<canvas id="c" width="1080" height="1920"></canvas>
<script>
const W=1080,H=1920,DUR=15,g=document.getElementById('c').getContext('2d');
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
// 闭式弹簧（纯时间函数）
function spring(t,k=170,d=26){
  if(t<=0)return 0;const w0=Math.sqrt(k),z=d/(2*w0);
  if(z<1){const wd=w0*Math.sqrt(1-z*z);
    return 1-Math.exp(-z*w0*t)*(Math.cos(wd*t)+(z*w0/wd)*Math.sin(wd*t));}
  return 1-Math.exp(-w0*t)*(1+w0*t);
}
// 固定种子随机（禁 Math.random）
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;
  let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;
  return((t^t>>>14)>>>0)/4294967296;};}
const SCENES=[
  {from:0,to:3,draw(t){ // 钩子大字，弹簧缩放
    const s=spring(t-0.1,220,22);
    g.save();g.translate(W/2,H/2);g.scale(0.6+0.4*s,0.6+0.4*s);
    g.globalAlpha=clamp(t*4);
    g.fillStyle='#F0EEE6';g.textAlign='center';
    g.font='700 190px Georgia,serif';g.fillText('HOOK',0,0);
    g.fillStyle='#D97757';g.fillRect(-320*s,50,640*s,18);
    g.restore();}},
  // 后续场景在此追加（每个一个对象）
];
function draw(t){
  g.fillStyle='#141413';g.fillRect(0,0,W,H);
  for(const s of SCENES)if(t>=s.from&&t<s.to)s.draw(t-s.from);
}
window.seek=(t)=>{draw(t);return true;};
// 普通浏览器实时预览；headless 下不启动
if(!navigator.webdriver){
  const t0=performance.now();
  (function loop(){draw(((performance.now()-t0)/1000)%DUR);requestAnimationFrame(loop);})();
}
</script></body></html>
```
> 说明：`render.mjs` 是脚手架的**标配**（代码完整给，见 F.3），它做的是机械逐帧渲染、不需要模型能力；是否安装 Playwright 取决于执行环境。这样"弱模型成片"在有 shell 的 Agent 环境（Claude Code/Codex）下是闭环的。

### F.3 `render.mjs`（脚手架标配，精简可用；需环境装有 Playwright + ffmpeg）
```js
// node render.mjs   （一次性安装：npm i -D playwright && npx playwright install chromium）
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const FPS=60,DUR=15,SUB=4;
mkdirSync('out',{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1080,height:1920}});
await page.goto('file://'+process.cwd()+'/index.html');
await page.evaluate(()=>document.fonts.ready);
// SUB 子帧混合出运动模糊，再每组取末帧
const vf=`tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB-1})',setpts=N/${FPS}/TB`;
const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',String(FPS*SUB),'-i','-',
  '-vf',vf,'-r',String(FPS),'-c:v','libx264','-crf','16','-pix_fmt','yuv420p','out/silent.mp4'],
  {stdio:['pipe','inherit','inherit']});
const total=Math.round(DUR*FPS*SUB);
for(let i=0;i<total;i++){
  await page.evaluate((t)=>window.seek(t),i/(FPS*SUB));
  const png=await page.locator('#c').screenshot({type:'png'});
  if(!ff.stdin.write(png))await new Promise(r=>ff.stdin.once('drain',r));
  if(i%(FPS*SUB)===0)console.log(`rendered ${i/(FPS*SUB)}s`);
}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await browser.close();
```
> 能力平权的含义：**运动/审美/发明**由框架（模板+片段+生成器+gate）兜底，弱模型只需"填内容"；**渲染 MP4** 是任何有 shell 的环境都能跑的机械步骤。纯浏览器（无 shell）时至少得到同等质量、可交互的 index.html。

---

**执行提示**：先做 T1–T5 形成"数据 + 物理 + 质量门"的可用内核，再做视图 T6/T7；每个 Ticket 完成后立即跑第 10.1 命令；全程遵守第 11.3 协作禁区。
