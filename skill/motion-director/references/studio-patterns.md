# Studio 级范式（shape morph / diegetic launch）

这份文档记录从 Opus 5.5 真实爆款（twoclipping 的 shape morph、steventey 的 Dub 深色发射）拆解出来的"高级感"范式。比"基础元素出现"更高级的是**元素持续变形、由界面内的光标驱动**。

## 0. 最高原则：one shape never cuts
不要让每个元素各自"出现（fade/scale）"。让**一个主形状连续地 morph 尺寸、圆角、填充**，从按钮→loader→勾→搜索→开关→播放器→图表→命令面板→toast→回到按钮。观众看到的是"同一个物体在变形"，而不是"一堆物体在切换"。

- 状态表 = `{t, w, h, r}`，几何用闭式 spring 插值，内容用 settle/new alpha 控制。
- 内容在**变形开始后进入、下一次变形开始前离开**，alpha 过渡带做 100–150ms 模糊。
- 末帧必须等于首帧（形状+内容+光标位置），形成无缝 loop。

## 1. 光标是主角（diegetic cursor）
不是镜头替用户演示，而是**画面里有一个真实光标在移动、点击、拖拽**。
- 光标沿路径插值移动（先快后慢），每次状态变化由一次点击触发。
- 点击时加一个 200–400ms 的脉冲涟漪；拖拽时用真实的 down→move→up。
- 光标要有小投影、点击有轻微下压。

## 2. 质感层（缺了就"廉价"）
高级感 80% 来自这几个原语，缺一不可：
- **软投影**：主形状用多层径向/盒状模糊的黑色投影（`shadowBlur` 或预渲染模糊），不是硬边。
- **渐变**：封面/封面图用多色线性渐变（如 orange→pink→purple），文字用中性色。
- **模糊**：内容交换、快速运动、失焦元素用 `ctx.filter='blur(npx)'`。
- **颗粒（grain）**：极轻的 seeded 噪点叠在背景上，消除纯色的塑料感。
- **背景不是纯白/纯黑**：浅色用暖灰 `#ECEAE4` + 中心提亮；深色用近黑 `#060606` + 点阵。

## 3. 机械里程表（carry-model odometer）
不要用 `frac(n/10^place)` 让所有列连续旋转——那是错的。真实计数器每列只在**进位窗口**转动：
- 每列进度 `r`，`r < 0.82` 静止、`0.82–1` 做一次 `smooth(0.82,1)` 进位。
- 高速列（>12 次/秒）渲染成**垂直模糊带**（渐变 + 5 个低透明度采样数字），低速列清晰。
- 千分位分组：从右往左每 3 位放一个分隔（不是固定 `place%3`）。
- 落定后 snap 到目标值并停止，干净显示，无鬼影。

## 4. 深色发射（orbit / converge）
- 一个**中心胶囊**带橙色辉光（外发光），URL 打字进入。
- **同心轨道环**：旋转的点标记 + 一圈强调色环，粒子向中心汇聚。
- **数字翻滚**（见第 3 节）作为中段主体，落定有 ding。
- **点阵 3D 球体**：fibonacci 球面 240 点、按深度着色、加边界圆 + 经纬椭圆；从底部升起。
- 结尾 logo 居中，副标语在下，swell 音效收尾。

## 5. 运动：全部用闭式 spring
- UI 小物（按钮/开关/前导边）：k=300,d=30（利落）。
- 卡片/容器/相机：k=160–220,d=20–26（默认）。
- 大标题/3D/定版：k=120,d=20（稳重）。
- 多目标值用 `track()`：每段位移叠加一个 spring，**不重启**，保持连续、可随机 seek。
- 前导边比后随边更硬，指示器会"拉伸"。

## 6. 节奏（beat grid）
- 深色片 ~112 BPM，浅色 UI ~108–109 BPM；状态变化落在 beat 上。
- 每 2–4 秒必须有一个新视觉事件，不允许死帧。
- 音效：click 落在光标点击、pop 落在 morph、whoosh 落在大展开/转场、kick 落在深色 beat；整体 loudnorm -14 LUFS。

## 7. 范例与可复用件
- `films/stud-morph.html`：方形浅色 one-shape morph 全流程（10 状态）。
- `films/stud-orbit.html`：16:9 深色 diegetic 发射（轨道环→odometer→3D sphere→logo）。
- `kit/head.html`（浅色）、`kit/head-dark.html`（深色）：spring/track/morph/光标/质感原语。
- `kit/morph.body.js`、`kit/orbit.body.js`：场景编排；`kit/tail.html`：seek/rAF。
- `kit/render-stud.mjs`：逐帧 ffmpeg 渲染；`kit/synth-stud-audio.mjs`：配乐。
