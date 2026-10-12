# 每日灵感 · Dia 浏览器的新手引导着陆（Make something wonderful）

## 基础信息
- 类型：UI Demo / 产品着陆片（Dia 浏览器新手引导）
- 风格：深空黑 + 地球地平线，极简玻璃 UI，一个圆形母题贯穿
- 适用场景：浏览器/AI 助手类产品的开屏与新手引导，「天体→logo→发送键→输入框」的圆形形变可直接借鉴。
- 时长 / 大致镜头数：19.7s，cuts 仅 1 个硬切，一镜到底；约 6 个状态。

## 镜头结构
- 开场（0–2s）：地球地平线，一行小字「THE BROWSER COMPANY OF NEW YORK」。
- 母题登场（2–5s）：一轮红日升起，由亮变白再渐变成蓝紫半球，下方出现「Dia」字，成为 logo。
- 产品化（5–13s）：半球缩小成圆形发送键，再横向展开成输入框；框内依次敲出 Chat / Explain / Compare / Shopping / Tabs 等提示语，下方建议 chip 逐个弹出。
- 收束（13–19.7s）：输入框展开成完整「Welcome to Dia」引导页，再淡黑出「Welcome to your new home on the Internet」。
- 节奏：长镜无缝，慢而贵。

## 转场实例表（宁多勿漏）
| 时间戳 | 从什么画面 | 到什么画面 | 转场类型(标签) | 前镜留下的锚点 | 后镜如何接入 | 为何自然 |
|---|---|---|---|---|---|---|
| 0.0–2.0s | 地球地平线 | 红日从地平线升起 | glow-light-transition / push-in-reveal | 地平线 | 太阳自下而上升起 | 建立「日/Dia」隐喻 |
| 2.0–3.5s | 亮白太阳 | 太阳渐变成蓝紫半球 logo | shape-morph / shared-element | 那个正圆 | 圆的颜色从亮白过渡到蓝紫渐变 | 同形同位置，仅换色 |
| 3.5–4.5s | 蓝紫半球 | 半球下方出现「Dia」字 | kinetic-type-match | 半球 | 字落位 | logo 成型 |
| 4.5–5.5s | Dia 半球 logo | 半球缩小成圆形发送键（内含向上箭头） | shape-morph / shared-element | 同一正圆 | 圆缩小并叠加箭头 | logo 即按钮 |
| 5.5–6.5s | 圆形发送键 | 圆横向展开成圆角输入框，敲出「Chat」 | shared-element / ui-drill-in | 圆 + 箭头 | 圆横向拉伸成框，箭头留作发送钮 | 按钮即输入框 |
| 6.5–9.0s | 空输入框 | 框内依次敲出多条提示语（Chat/Explain/Compare/Shopping） | kinetic-type-match / ui-drill-in | 输入框 | 文字逐字键入，下方弹 chip | 同框换内容演示能力 |
| 9.0–12.5s | 输入框 | 建议 chip 在框下方排队弹出 | card-stack / ui-drill-in | 输入框 | chip 从框下冒出 | 引导式提示 |
| 12.5–14.0s | 输入框 + chip | 「Welcome to Dia」完整引导页 | ui-drill-in / shared-element | 输入框位置 | 框展开成全页 | 局部→全局 |
| 14.0–16.5s | 引导页 | 引导页停留 | bg-continuity | 引导页 | 仅停留 | 阅读 |
| 16.5–19.7s | 引导页 | 淡黑出「Welcome to your new home on the Internet」 | fade-black / brand-endcard | 黑场 | 字浮起 | 收尾 |

自造标签：
- circle-sun-to-input：一颗升起的太阳（正圆）在同一位置连续渐变成半球 logo → 发送键 → 横向展开成输入框（2.0–6.5s）。

## 动势（挑最典型）
- **circle-sun-to-input（2.0–6.5s）**
  - Movement：垂直升起（太阳）→ 原地换色 → 缩小（键）→ 横向拉伸（框）。
  - Timing：Slow Rise（~2s）/ Slow Transform（~3s）。
  - Easing：全程 ease-in-out（极柔）。
  - Feeling：Premium / Cinematic。
- **输入框打字（6.5–9.0s）**
  - Movement：水平向（文字键入）。
  - Timing：Medium。
  - Easing：linear（打字机）。
  - Feeling：Technical。

## 空间与布局
- 全程深空黑底 + 地球地平线作背景，所有 UI 居中悬浮；真正的视觉锚点是那一颗正圆——它从天升起到变成按钮再展开成框，位置几乎不动，只在形状/颜色/尺寸上连续变化，因此「日」与「输入框」被焊成一体。

## 可沉淀的 Pattern 候选
1. **circle-sun-to-input（天体→logo→按钮→输入框）**：让一个正圆（升起的太阳）在同一位置连续渐变成品牌 logo 半球、发送按钮，再横向展开成输入框。证据 2.0–6.5s。解决「开屏隐喻→产品核心交互」的无缝引入，用一个圆形把诗意和 UI 焊死。
2. **input-bar-rotating-prompts（同框轮播提示）**：同一个输入框内逐字键入多条不同提示语，下方 chip 排队弹出。证据 6.5–12.5s。解决「新手引导如何在一个框里演示多种用法」。
3. **input-to-welcome-drill-in（输入框展开成全页）**：输入框向四周展开成完整引导页。证据 12.5–14.0s。解决「局部交互→全局引导页」的钻取。
4. **fade-black-tagline（淡黑落字收尾）**：功能页淡到黑，一句话 slogan 浮起。证据 16.5–19.7s。解决短着陆片的收束。
