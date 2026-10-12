# 视频镜头/转场拆解 · 子代理任务简报

## 0. 任务背景（必读）

我们在为一个「面向 Agent 制片的动效选型框架」补充**电影化镜头衔接语言**。框架已有基础移动转场、文字动画、Shader、UI 动效，但镜头组合缺少「镜头之间的电影化连接」。本任务：分析 `/Users/penn/Desktop/Dev/0915宣传视频测试材料/风格参考` 下的真实优秀宣传视频，**从证据中提炼可程序化、可复用的转场/运镜 Pattern**，最终沉淀为框架里的「常用镜头语言卡」。

分析原则（来自任务书，严格遵守）：
1. 不做视频点评/观后感；只提炼**规则**。
2. 不只描述「用了什么动画」，必须讲清**视觉连续性机制**：前一镜留下什么（锚点：形状/颜色/UI 元素/运动方向/位置/文字/光），后一镜如何接入（放大成新场景/方向继承/色彩连续/空间位置继承），以及**为什么自然**。
3. 每个结论都要有**时间戳证据**（联系表左上角黄字即秒数）。看不到细节就加密重抽，禁止臆测。
4. 区分：灵感参考（不可程序化）/ 可实现 Pattern / 可进 Framework 组件。我们只要后两类。
5. 不追求复制某个视频，目标是跨视频反复出现的**通用 Motion Language**。

## 1. 你拿到的分片

- 分片清单读 `/Users/penn/Desktop/Dev/动效框架指南/analysis/manifest.json` 的 `shards[k]`（k 为你的片号，0 起）。每条含 `file`（相对风格参考目录的路径，`panels/` 开头的是已裁好的四分屏片段）、`dur`（秒）、`interval`（建议抽帧间隔）。
- 风格参考根目录：`/Users/penn/Desktop/Dev/0915宣传视频测试材料/风格参考`
- 另外补分析根目录下的 `Stripe 支付产品功能短片.gif`（12.8s，ffmpeg 可直接读，按 interval=1.0 处理），由 shard 2 负责。

## 2. 抽帧管线（已验证可用，直接调用）

```bash
cd /Users/penn/Desktop/Dev/动效框架指南
./analysis/extract.sh "视频文件名.mp4" 1.3
# 第二个参数是抽帧间隔秒；panels/ 下的文件请直接把 "panels/panel1_左上.mp4" 作为第一个参数
```

产物在 `analysis/contact-sheets/<slug>/`：
- `sheet_01.jpg, sheet_02.jpg …`：5 列 × 8 行的联系表，每格左上角黄色标签是该帧时间戳（秒）。用 Read 工具逐张打开查看（thumbnail_size 用 large）。
- `cuts.txt`：ffmpeg 场景检测出的硬切时间点（阈值 0.25）。**注意**：叠化/形变类无缝转场在 cuts 里很少甚至为 0，这不是错误，恰恰说明该片以无缝转场为主——以联系表肉眼为准。
- 脚本有 `done.sheets` 缓存，重复跑不会重抽；想换间隔重抽，先删掉该 slug 目录。

### 看不清转场时：局部加密抽帧

联系表是均匀采样，可能恰好错过转场中点。当你在两个采样帧之间发现画面突变/疑似转场，对该 2–4 秒区间加密（示例：15.2s–18.5s，每秒 8 帧）：

```bash
SRC="/Users/penn/Desktop/Dev/0915宣传视频测试材料/风格参考"
mkdir -p /tmp/dense && rm -f /tmp/dense/*.jpg
ffmpeg -nostdin -v error -ss 15.2 -to 18.5 -i "$SRC/视频文件名.mp4" -vf "fps=8,scale=480:-2" -q:v 3 /tmp/dense/f_%03d.jpg
magick montage /tmp/dense/f_*.jpg -tile 6x -geometry 240x135+3+18 -background black -fill yellow -pointsize 18 /tmp/dense_sheet.jpg
# 然后 Read /tmp/dense_sheet.jpg
```

长视频（>120s 的 showreel）转场密集，至少对其中 **3 处最典型的衔接**各做一次加密抽帧，看清机制再下结论。

## 3. 每个视频输出（写到文件）

为每个视频创建 `/Users/penn/Desktop/Dev/动效框架指南/analysis/breakdowns/shard<N>/<slug>.md`（slug 与 contact-sheets 目录名一致），严格按下面结构：

```markdown
# <视频文件名>

## 基础信息
- 类型：（产品宣传 / 品牌片 / UI Demo / 科技感展示 / App 发布 / 设计 Showreel / MG 动画 / 角色 IP 片 等）
- 风格：（极简留白 / 高能量蒙太奇 / 3D 写实 / 扁平 MG / 玻璃拟态 / 复古 …）
- 适用场景：这种镜头语言适合用在哪类产品视频
- 时长 / 大致镜头数：（依据 cuts.txt 与联系表估算）

## 镜头结构
- 用 3–6 句话描述段落结构（开场如何建立 → 中段如何组织功能/信息 → 结尾如何收束/品牌落版）。
- 典型单镜时长与整体节奏（快切蒙太奇 / 长镜无缝 / 混合）。

## 转场实例表（最重要，宁多勿漏）
| 时间戳 | 从什么画面 | 到什么画面 | 转场类型(标签) | 前镜留下的锚点 | 后镜如何接入 | 为何自然 |
|---|---|---|---|---|---|---|

转场类型标签从下列受控词表选（可多选，用 `/` 分隔；遇到词表外但可程序化的新机制，用简短英文 kebab-case 自造并在表下用一句话定义）：
`hard-cut` `cross-dissolve` `fade-black` `fade-white` `zoom-through`（穿过物体/屏幕进入下一镜）`push-in-reveal`（推近放大成新场景）`crash-zoom` `whip-pan`（甩镜，运动模糊藏切）`motion-blur-cut` `object-occlusion`（前景遮挡物扫过藏切）`match-cut-shape`（形状匹配剪辑）`match-cut-motion`（运动方向/动势匹配）`match-cut-color`（色彩匹配）`shared-element`（同一元素跨镜飞行/形变，FLIP 式）`shape-morph`（几何形态连续形变）`logo-morph` `ui-drill-in`（UI 层级钻进：总览→点进详情）`ui-drill-out` `parallax-push`（多层视差推进）`camera-orbit`（环绕）`screen-record-punch`（录屏缩放聚焦某区域再退回）`cursor-carry`（光标/指针带着注意力跨镜）`line-path-carry`（线/轨迹跨镜）`circle-iris` `wipe-directional` `mask-reveal` `card-flip-3d` `page-fold` `split-screen`（分屏合并/拆分）`clone-multiply` `particle-dissolve` `glow-light-transition`（光/辉光/漏光/闪白藏切）`liquid-gradient`（流体/渐变形变）`blur-rack-focus`（虚实焦点转换）`speed-ramp` `freeze-frame` `kinetic-type-match`（文字/字卡成为衔接锚点）`bg-continuity`（背景/场景连续仅换内容）`device-frame-continuity`（同一设备框内换画面）`brand-endcard`

## 动势（挑 2–4 个最典型转场写）
对最典型的几个转场，按下面格式写（参考任务书）：
- Movement：方向（如 右→左 / 中心向外 / Z 轴推进）
- Timing：起步/收尾速度（Fast Start / Slow Reveal …）
- Easing：ease-in / ease-out / ease-in-out / 弹性 / 线性
- Feeling：Premium / Cinematic / Dynamic / Playful / Technical

## 空间与布局
- 转场中主视觉如何移动、信息层级如何变化、前后空间如何衔接（1–3 句）。

## 可沉淀的 Pattern 候选
列出本视频里**可程序化、可复用**的衔接机制（每条：工作名 kebab-case + 一句话机制 + 时间戳证据 + 它解决什么叙事问题）。只写机制不写实现代码。明确标注哪些只是「灵感参考」（如写实 3D 角色表演、实拍特效）不候选。
```

## 4. 分片汇总（也写到文件）

分析完分片内全部视频后，写 `/Users/penn/Desktop/Dev/动效框架指南/analysis/breakdowns/shard<N>/_SUMMARY.md`：
1. 本分片**转场实例总表**（把各视频的实例表合并，保留「视频 + 时间戳」列）。
2. 本分片出现的 Pattern 候选，按**出现频次**排序，每条注明在哪些视频/时间点出现（≥2 个不同视频出现的标为「高频」）。
3. 该分片视频的风格差异小结。

## 5. 边界与纪律

- **只**在 `analysis/` 目录下写文件；**禁止**修改 `src/`、`data/`、`scripts/`、`docs/`，**禁止**运行 `npm` 任何命令，**禁止**启动 dev server（集成由主代理负责）。
- 联系表看完即可，不要删除 contact-sheets。加密抽帧的临时文件放 `/tmp`。
- 时间戳必须来自联系表/加密表，不允许编造；某个转场机制看不清就如实写「采样不足，疑似 X」，不要当确定结论。
- 重点是**信息型/产品型视频的 UI 与镜头衔接**（这是框架的主战场）；纯实拍、纯角色表演的炫技段落标为灵感参考即可，不必硬拆。
- 现有框架已有 30 张卡（见 `analysis/REFERENCE-appendix.md`），提炼候选时先读它，**避免把已有卡换个名字重复提出**；要找的是它们没覆盖的电影化衔接（尤其：穿过式运镜、动势/形状/色彩匹配剪辑、共享元素连续形变、光标/设备框/屏幕录制连续性、辉光藏切、分屏、视差推进等）。
- 全部用简体中文书写（Pattern 工作名与标签用英文 kebab-case）。
