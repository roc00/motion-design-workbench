# 实现工具与四个渲染层

工具参考不代表已经安装。角色是一种导演职责，不意味着必须使用角色动画状态机。

## CSS · in-use

平台原生交互与样式；逐帧渲染将状态直接设为 t 对应的值，不依赖 transition 自己运行。

- 条件：根据主体与时间合同选择，不能替代叙事决定。
- 逐帧合同：所有动画由外部 t 或可 seek 时间线求值；不依赖上一次状态。
- 归层：deterministic

## Motion · reference

React 项目已有该库时使用；本项目没有安装 Motion。

- 条件：根据主体与时间合同选择，不能替代叙事决定。
- 逐帧合同：所有动画由外部 t 或可 seek 时间线求值；不依赖上一次状态。
- 归层：deterministic

## GSAP · in-use

时间轴可 seek，天然适合帧级确定的视频渲染。做动效视频时优先它。

- 条件：根据主体与时间合同选择，不能替代叙事决定。
- 逐帧合同：所有动画由外部 t 或可 seek 时间线求值；不依赖上一次状态。
- 归层：deterministic

## Three.js · reference

需要真正的相机、空间遮挡、模型或场景时考虑。当前工作台的透视网络是手写投影，没有接入 Three.js。

- 条件：根据主体与时间合同选择，不能替代叙事决定。
- 逐帧合同：所有动画由外部 t 或可 seek 时间线求值；不依赖上一次状态。
- 归层：deterministic, shader

## WebGL · reference

浏览器底层图形 API；Shader 像素处理与三维场景要按实际责任分别归层。

- 条件：平台原语或已有引擎无法表达所需 GPU 图形时
- 逐帧合同：时间 uniform、seed、纹理与视口固定；状态模拟需可重置或预计算。
- 归层：deterministic, shader
- 官方参考：https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API

## p5.js · reference

适合用规则形成画面；当前项目未安装 p5.js。

- 条件：代码图形、形态系统与粒子规则是视觉母题时
- 逐帧合同：关闭自动 loop，令 draw 从外部 t 重建画面并等待 redraw 完成；不累计位置或将 frameCount 当时间。
- 归层：deterministic, shader
- 官方参考：https://p5js.org/reference/p5/redraw/

## Chart.js · reference

图表的数据与标注属于精确信息层；当前图表示例使用原生 SVG，没有安装 Chart.js。

- 条件：需要标准图表且项目已有该库时
- 逐帧合同：关闭库内动画，按 t 计算数据与视图后 update；固定刻度、尺寸、字体与排序。
- 归层：deterministic
- 官方参考：https://www.chartjs.org/docs/latest/configuration/animations.html

## Apache ECharts · reference

可选择 Canvas 或 SVG；根据数据规模与取景需求决定，当前项目未安装 ECharts。

- 条件：标准图表以外的数据关系、组合视图或复杂系列需要时
- 逐帧合同：关闭自动动画，按 t 设置数据；固定轴范围、容器尺寸、渲染器与字体，等待画面完成。
- 归层：deterministic
- 官方参考：https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/

## 按素材引入

- **Lottie**：仅在用户提供或项目已有预制 Lottie JSON / dotLottie 素材时考虑；当前调用链未接入运行时。 必须冻结资产、状态输入与播放位置，并单独验证 seek；没有素材时不进入默认制作路线。
- **Rive**：仅在用户提供或项目已有预制 .riv 素材时考虑；当前调用链未接入运行时。 必须冻结资产、状态输入与播放位置，并单独验证 seek；没有素材时不进入默认制作路线。
