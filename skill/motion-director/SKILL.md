---
name: motion-director
description: 制作代码驱动的动效短片、产品演示和镜头组合，包含创意方向、状态交接、可定位脚手架、渲染与画面验收。
---

# Motion Director

先确定观众要理解的变化，再把变化写成画面。基础动效查询完整词典；段落编排查询 `references/cinematic-sequences.md` 与 `registry.json`。两者共享 ID，不分别维护时间表。

## 导演与技术职责

导演侧从 `registry.directorCases` 与 `references/cinematic-sequences.md` 选择案例：两支完整影片、四个源时间明确的片段、一段单体展开为群像的独立情境。先理解主角、表演动机、视点和状态交接，再查 `references/narrative-patterns.md` 的六种叙事结构。工作台把这三类合为“导演案例”，并不把完整影片、片段和结构重复计成同一种能力。

原 `directorGrammar` / `directorPerformers` 是知识与溯源索引；21 个旧 SVG 与 10 个历史片段的演示已退役，状态见 `registry.retiredPreviews`。不要把它们当作推荐模板。相关案例只说明可参考的机制，不代表覆盖所有原技法。原 `ui-entrance.clone-multiply-to-grid` 对应新情境 `director.collection`，其余原 ID 保留查阅。

叙事结构源码为 `director-kit/lib/narrative.mjs`，独立演示在 `snippets/narrative-*.html`。群像情境源码为 `director-kit/lib/collection.js`，独立演示为 `snippets/director-collection.html`：固定摄影机；一张珊瑚原作变为八张不同作品，身份保持，最后确认原作。它是 browser-demo，无音轨、无 MP4；六种结构亦为 browser-demo。取用这些示例时，按内容编排 Shot Plan，再实际渲染验证。

技术侧查 `registry.effects`、`technicalRecipes` 与 `tools`。局部打字、卡片入场、数字滚轮、滑杆、Shader 等做法只通过 `canonicalEffectId` 关联已有词条，不在导演库重新建同名条目。关联说明“可从这里实现”，不表示技法完全等价或组件已适配。具体分流与来源见 `references/director-responsibilities.md`。

职责集合是索引，通过 `recipeId` 读取 `shotRecipes` 中的唯一原记录；不要把索引再次计成新知识条目。原 `compositions` / `compositionPlans` 保留旧生产适配合同，导演规划优先使用 `directorPatterns`。

工具由镜头需要决定。CSS/Motion/GSAP 组织动画；WebGL/Three.js/p5.js 处理图形与空间；Chart.js/ECharts 处理精确图表。保留确定性、Shader、生成、混合四个渲染层，工具不等于层。查 `references/implementation-routing.md`，遵守各工具的外部时间/seed/资源合同。新工具目前是选型参考，未安装；Lottie/Rive 只在有预制资产且 seek 可验证时考虑，不默认用于角色表演。

## 输入与授权

沿用用户已有决定。缺少会改变主题的信息才询问；用户允许自由选题时自行选题。默认 15 秒、16:9、中文说明。用户已要求制作视频时，完成本地渲染与验证；只有用户要求先看方案才在方案阶段停下。部署、外部发布与发送消息另行确认。

真实产品使用真实 UI 与有证据的数据。概念样片可以设计虚构 UI，但在交付和制作说明中标注。不要把效果示例中的数字当商业指标。

## 方向与交接

1. 写 `DIRECTION.md`：一句话意图、视觉母题、色板、字体、两三个差异方向与选定理由。参考 `references/director-method.md`；不要仅列出技法名称。
2. 写镜头表：起止秒、主角、观众理解、主体运动、摄影机行为、文字进入/退出、交接对象、阅读停留、声音落点。所有时间从计划读取。
3. 对每次交接说明前一状态留下什么，后一状态如何接住：位置、形状、方向、色彩、动作或信息因果。没有联系时，使用明确切镜也成立。摄影机可以静止；空间层次数量与装饰数量不作为质量门。
4. 长短节拍交替。先完成每段最可读的静帧，再做动作和交接。文字在几何稳定后进入，在下次变化前退出；不要让两套文案叠在同一位置。

## 可执行起点

运行 `node scripts/scaffold-director.mjs --out /绝对路径 --film forma`（或 relay）。它复制可独立播放的 HTML、字体、GSAP、渲染核心和音频生成器。完整示范在 `films/director-forma.html` 与 `films/director-relay.html`。

`director-kit/lib/director.js` 提供闭式 spring、多目标 track、遮罩内容交接、遮罩内数字滚轮、透视投影和深度排序。借这些机制，重新推导内容和编排；不是给所有产品换同一套文案。两支本轮示例分别说明纸片身份保持与信号路径交接。

`references/cinematic-sequences.md` 中新成片与截取段落写明源时间、适用条件和实现近似。历史 cine-* / stud-* 已从推荐案例与交付 Skill 的演示文件中撤下；原知识记录仍可查阅。

## 运行合同

- `seek(t)` 只依赖时间和冻结的内容。随机采用固定种子；渲染路径不读取时钟、网络、输入状态或前一帧结果。
- 预览传输层可以使用 rAF/时钟；它只调用 seek，不参与计算画面。注册一个同步、暂停的 GSAP 主时间轴，ID 与 HyperFrames root 一致。
- 给相机变化如实命名：2D 局部取景、主体 transform、或真实 perspective projection；整画布 scale 不叫摄影机环绕。
- 同一实现用于卡片预览、随机定位与 MP4。字体和资源在渲染前成功加载，失败时报告并停止。
- 正式交付有稳定的首帧与明确终态。只有用途需要循环时才设计循环，不为回到首帧破坏叙事。

## 画面审阅与交付

先输出联系表和关键交接条带，实际查看：主角是否清楚、字是否可读、交接是否连续、有没有错误读数/突跳/不必要叠字、取景是否符合意图。对照参考的画面机制记录具体问题与修复后的时间点；无需凑固定轮数，也不要靠自评分宣称达到某模型水平。

运行项目 gate 和结构检查。至少检验一次乱序 seek 后同帧像素一致、顺播与重播、首末帧、音轨和时长。技术门证明可执行性；审美结果仍需要看成片。交付 MP4、源工程、联系表、poster 和简短记录。音轨未试听、竖屏未另行编排或某项无法验证时如实说明。
