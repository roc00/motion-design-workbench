# 全新AI驱动的视频创作应用：Google Vids - Robinson.mp4

## 基础信息
- 类型：Google 产品 UI 功能导览片（Google Vids AI 视频创作）
- 风格：Google  Material 浅色 UI 实拍 + 手写光标，干净高效
- 适用场景：AI 工具/云产品的"输入→生成→结果"工作流演示
- 时长 / 大致镜头数：86.7s，cuts 23，约 20 个功能镜头，以硬切为主

## 镜头结构
开场字卡 "Meet your new designer/storyteller"，加号按钮引出蓝色播放三角 Logo；用户在输入框用自然语言提需求，AI 生成草稿；"Let's choose a style"在黄/青两套模板间选；"Let's write"用麦克风/脚本面板流式生成旁白；选音色、加评论、搜素材库拖入时间线、录真人镜头；最后点 Play 播放成品，"AI powered / product demo / coming soon to Google Workspace"落版。整体是一条完整的"提示词→风格→脚本→音色→素材→录制→播放"工作流，每步一个硬切。

## 转场实例表
| 时间戳 | 从什么画面 | 到什么画面 | 转场类型(标签) | 前镜留下的锚点 | 后镜如何接入 | 为何自然 |
|---|---|---|---|---|---|---|
| 0.0→1.8 | "Meet your new designer" | "Meet your new storyteller" | kinetic-type-match | 字卡结构 | 仅换尾部词 | 同构字卡换词，节奏轻快 |
| 3.6→5.4 | "+New" 按钮 + 光标 | 蓝色播放三角 Logo | shared-element | "+New"按钮 | 按钮演变成播放三角 | 操作入口→品牌符号 |
| 7.2→9.0 | 输入框打字 "create a sa..." | "sales training video" 胶囊词 | typewriter / kinetic-type-match | 打字光标 | 整句收成一个胶囊标签 | 自然语言→结构化标签 |
| 10.8→12.6 | 文件夹图标 | "Creating..." 蓝色按钮 | input-trigger-moves / loading | 文件夹 | 触发后进入加载态 | 动作→加载因果 |
| 14.4→16.2 | 剪辑界面 | 电子表格界面 | hard-cut | — | 硬切展示另一功能 | 功能点并列 |
| 18.0→19.8 | "Let's choose" | "choose a style" + 光标 | kinetic-type-match / ui-drill-in | 字卡 | 字卡退，风格面板浮现 | 字卡引出面板 |
| 21.6→25.2 | 风格缩略图墙 | 黄色模板 → 青色模板 | match-cut-color / cards | 模板卡片 | 在两个风格间切换预览 | 卡片形状一致，只换色 |
| 27.0→30.6 | "Let's writ" | 麦克风按钮 → Script 面板 | ui-drill-in / cursor-carry | 字卡 | 光标点麦克风，脚本面板展开 | 字卡→交互面板 |
| 32.4→34.2 | Script 面板 | 脚本文字流式出现 | ai-stream-response | 脚本框 | 文字逐字流式打出 | AI 生成的因果感 |
| 41.4→43.2 | 音色列表 | 选中 Voice 2 | input-trigger-moves / cards | 列表 | 光标选中一项 | 选择反馈 |
| 45.0→46.8 | 音频波形 | 评论 "Any input?" | hard-cut | — | 硬切到协作评论 | 功能点并列 |
| 54.0→57.6 | Stock media 面板 | 搜 "Landscape" → 图片网格 | type-and-filter / list-reveal | 搜索框 | 输入关键词，网格收敛出图 | 输入→筛选因果 |
| 59.4→61.2 | 图片网格 | 图片拖入时间线 | cursor-carry / drag | 图片 | 光标拖图到时间线 | 拖拽因果可视化 |
| 64.8→68.4 | 红点录制 | 倒计时 "2" → 真人出镜 | freeze-frame / countdown | 录制按钮 | 倒计时后真人画面出现 | 录制因果 |
| 75.6→77.4 | "Play" 按钮 | "AI powered" 字卡 | shared-element / kinetic-type-match | Play 按钮 | 播放→总结字卡 | 成果引出总结 |
| 84.6 | "Google Workspace" | 落版 | brand-endcard | Logo | 品牌落版 | 标准收尾 |

## 动势
- 7.2→9 打字→胶囊：Movement 横向收束；Timing Fast；Easing ease-out；Feeling Technical
- 54→57.6 搜索→网格：Movement 垂直刷新；Timing staggered；Easing ease-out；Feeling Efficient
- 64.8→68.4 倒计时→真人：Movement 定格→突然起；Easing 硬切；Feeling Dynamic

## 空间与布局
Google 浅色 UI 全程作为统一容器，所有面板（脚本、音色、素材、时间线）在同一界面框架内切换。手写光标是注意力引导，配合打字/流式/拖拽把 AI 工作流的因果可视化。信息层级严格按工作流顺序：提示词→风格→脚本→音色→素材→录制→播放。

## 可沉淀的 Pattern 候选
- `type-prompt-to-chip`：自然语言输入打字后收成结构化胶囊标签（7.2–9s）。解决"用户口语→产品标签"的过渡。
- `countdown-to-recorded-face`：录制红点→倒计时→真人出镜画面（64.8–68.4s）。解决"开始录制"到"真人素材"的因果，倒计时制造期待。
- `search-then-grid-converge`：搜索关键词后图片网格刷新收敛（54–57.6s）。与已有 `interaction.type-and-filter` 重合度高，仅作 UI 演示参考，不另立卡。
- 说明：本片大部分转场（输入触发、AI 流式、拖拽、列表揭示）已被现有框架 `interaction.type-and-filter`、`interaction.ai-stream-response`、`ui-entrance.list-reveal` 等覆盖，不重复提出；真正有增量的是字卡换词节奏与倒计时录制。
