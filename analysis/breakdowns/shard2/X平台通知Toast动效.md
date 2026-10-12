# X平台通知Toast动效

## 基础信息
- 类型：UI Demo / 交互反馈演示（纯黑底通知级联）
- 风格：极简黑底 + X 深色胶囊 Toast，圆角半透明卡片
- 适用场景：社交/IM 类产品通知系统的交互动效演示，或用于演示"消息排队"反馈
- 时长 / 大致镜头数：8.1s；cuts.txt 为 0（全程无硬切，连续单镜）

## 镜头结构
全片一个固定黑底镜头：顶部不断滑入新的胶囊形通知 Toast（"sent you a message"、"liked your post"、"reposted your post"、"just followed you"等），新 Toast 入画后把旧 Toast 向下推挤，旧 Toast 堆叠数条后依次淡出/被挤出画。约每秒一条新通知，重复演示"新通知抵达—旧通知让位"的排队逻辑。无开场、无品牌落版，纯组件行为循环。
节奏：均匀间隔、固定镜头，典型组件循环演示。

## 转场实例表
| 时间戳 | 从什么画面 | 到什么画面 | 转场类型(标签) | 前镜留下的锚点 | 后镜如何接入 | 为何自然 |
|---|---|---|---|---|---|---|
| 0.0→1.0 | 第一条通知（message+repost 堆叠） | 第二条通知（liked+followed） | layout-animation（在受控词表外，自定义名为 toast-stack-displace） | 顶部已有 2 条 Toast 胶囊 | 新胶囊从顶部滑入，旧胶囊整体被向下挤压让位 | 同一区域内元素位移，像真实通知系统的队列 |
| 1.0→2.0 | liked+followed | followed+reposted | toast-stack-displace | 顶部堆叠胶囊群 | 新胶囊入栈，旧胶囊下移，最老的淡出 | 队列 FIFO 视觉化 |
| 2.0→4.0 | reposted+followed | followed+liked 轮换 | toast-stack-displace | 胶囊群整体位置 | 持续入栈出栈，保持 2 条可见 | 密度恒定，演示节奏稳定 |
| 5.0→7.0 | 新一轮 message 起头 | reposted 收尾 | toast-stack-displace / cross-dissolve | 黑底 + 胶囊 | 循环新一轮，旧通知淡出 | 无场景切换，仅组件内部状态流转 |

注：本片无镜头级转场，"转场"全部是组件内通知级联位移，已在 effectIds 中对应 `component.toast` 与 `layout.layout-animation`。

## 动势（挑 2–4 个最典型转场写）
- Movement：新 Toast 自上而下滑入，旧 Toast 整体向下平移让位，最老的向下移出画
- Timing：新通知 Fast Start 弹入，旧通知 Slow 让位/淡出
- Easing：新入 ease-out 带轻微弹性（spring），让位 ease-in-out
- Feeling：Technical / Playful（轻快、克制）

## 空间与布局
信息全部集中在屏幕顶部窄带，黑底保证注意力只在胶囊群；空间关系靠"垂直堆叠序"表达新旧——越靠上越新、越靠下越旧，退出即消失。无前后景深度，纯平面队列。

## 可沉淀的 Pattern 候选
- **toast-stack-displace**（通知堆叠让位）：新通知从顶部滑入，触发既有通知队列整体向下位移，超出可视条数的旧通知淡出，保证屏幕上同时可见条数恒定。时间戳 0.0–7.0（全程）。解决"多通知并发时如何不遮挡内容、又能表达先后次序"。
- 本片镜头语言极薄，其余均为组件内部细节，不另立 Pattern。
