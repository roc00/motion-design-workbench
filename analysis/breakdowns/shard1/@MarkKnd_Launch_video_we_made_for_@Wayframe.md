# @MarkKnd Launch video we made for @Wayframe.mp4

## 基础信息
- 类型：App/产品发布片（AI 设计工具 Wayframe）
- 风格：深蓝夜空 + 细网格线，极简科技感，光标始终可见
- 适用场景：开发者工具、AI 生产力产品的 Launch 预告片
- 时长 / 大致镜头数：45.4s，cuts 0（全片无缝），约 12–15 个段落

## 镜头结构
开场两个白色对角碎片拼出 Wayframe 标志；暗蓝网格背景上浮现标语"Design that can talk to your code"，光标在底部输入框打字发指令；空白画面长出线框，手机 mockup 依次滑入展示笔记类 App；光标选中图片、用对话改图；再切到桌面浏览器同步代码、仪表盘、CLI 复制、在 Cursor 里跑起来；最后"Design Reimagined / Out now"落版、Logo 收束。全片零硬切，靠暗蓝网格底色 + 光标 + 设备框连续串场。

## 转场实例表
| 时间戳 | 从什么画面 | 到什么画面 | 转场类型(标签) | 前镜留下的锚点 | 后镜如何接入 | 为何自然 |
|---|---|---|---|---|---|---|
| 0.0→1.3 | 两个白色对角碎片 | 碎片拼成 "Wayframe" 字标 | shared-element / logo-morph | 对角碎片 | 碎片位移拼合成完整字标 | 同一元素的装配动画，天然连续 |
| 2.6→5.2 | 标语 "Design that can talk to your code" | 底部出现输入框、光标 | bg-continuity / cursor-carry | 暗蓝网格底 | 背景不变，输入框从下方滑入 | 底色连续，新元素入场不切场 |
| 6.5→7.8 | 输入框打字 | 光标点发送按钮 | cursor-carry / input-trigger-moves | 光标 | 光标移到发送键并按下 | 光标把"输入→提交"因果连起来 |
| 9.1→11.7 | 空线框 + 小箭头 | 蓝色按钮 → 线框块逐步搭建 | ui-drill-in / push-in-reveal | 蓝色按钮 | 按钮触发线框图逐块生长 | 从空状态到 UI 生长，层级钻进 |
| 13.0→15.6 | 线框完成 | 多台手机 mockup 从左依次滑入 | deck-deal-flyin / device-frame-continuity | 手机外框 | 手机按槽位依次滑入 | 同设备框集合，发牌式节奏 |
| 16.9→18.2 | 字幕 "Refine and adjust just by chatting" | 手机上出现蓝色选框 + 光标 | cursor-carry / ui-drill-in | 字幕退去 | 光标落到手机图片上拉出选框 | 字幕让位给真实交互 |
| 19.5→23.4 | 手机内图片 | 同手机框内图片被 AI 替换 | device-frame-continuity | 手机外框不变 | 仅框内画面换图 | 设备框稳定，内容更新不切场 |
| 24.7→27.3 | 桌面浏览器多手机预览 | 字幕 "And sync up with your code" | bg-continuity / hard-cut | 桌面布局 | 切到字幕，底色仍暗蓝 | 底色统一，字幕承担段落过渡 |
| 28.6→31.2 | 仪表盘图表 | 代码编辑器窗口 | match-cut / bg-continuity | 暗蓝底 | 切到代码窗，底色连续 | 同属工作流，硬切被底色掩盖 |
| 32.5→35.1 | 代码窗 | 终端 "Copy CLI Command" → 蓝色 > 按钮 + 光轨 | line-path-carry / glow-light-transition | 代码内容 | 一道光轨从按钮射出 | 光轨把"复制命令"动作可视化 |
| 36.4→37.7 | Cursor 中运行 | 字幕 "Design Reimagined" | bg-continuity / brand-endcard | 暗蓝底 | 字幕居中 | 底色连续，进入收尾 |
| 39.0→41.6 | "Out now" | 对角碎片 Logo 收束 | logo-morph / brand-endcard | "Out now" 字幕 | 字幕退，Logo 碎片再现 | 首尾用同一 Logo 碎片呼应 |

## 动势
- 0→1.3 碎片拼 Logo：Movement 对角位移；Timing Fast Start；Easing ease-out；Feeling Premium
- 13→15.6 手机发牌：Movement 左→右依次；Timing staggered；Easing ease-out；Feeling Technical
- 32.5→35.1 光轨：Movement 横向射出；Timing Fast Start；Easing ease-out；Feeling Dynamic

## 空间与布局
暗蓝网格是全片唯一空间容器，所有 UI（手机、浏览器、代码、终端）都在同一底色里"浮"起来。光标是贯穿全片的注意力锚点：它打字、它点选、它拉框、它按发送。信息层级按"指令→生成→迭代→同步代码→上线"的工作流推进，每段用一句字幕换挡。

## 可沉淀的 Pattern 候选
- `grid-bg-continuity-cursor`：深色网格底全程不变，光标带着注意力跨界面移动（5–23s 反复出现）。解决"产品多个 UI 页面如何不切场地连起来"，是本片最核心、最可参数化的衔接。
- `fragment-logo-assemble`：Logo 拆成碎片再拼合，首尾呼应（0→1.3、39→41.6）。解决发布片开场与落版的品牌记忆。
- `light-stream-carry-action`：一道光轨从按钮射出连接终端/代码（32.5–35.1s）。解决"动作→结果"的因果可视化。
- `device-frame-content-swap`：同一设备框内只换内容、外框不动（19.5–23.4s）。解决"AI 改图/改 UI"的前后对比，比双屏对比更紧凑。
