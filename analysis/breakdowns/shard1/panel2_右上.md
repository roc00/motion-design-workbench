# panels/panel2_右上.mp4

## 基础信息
- 类型：演讲者/Keynote 片段（ClickUp CEO Zeb Evans 谈 AI 落地）+ 动态字卡
- 风格：极简白背景 + 写实人物 + 大号 kinetic type，四段屏之一
- 适用场景：B2B 思想领导力、CEO 演讲剪辑、观点型短视频
- 时长 / 大致镜头数：19.5s，cuts 5（2.28、4.88、7.47、8.42、17.42），约 6–7 个段落

## 镜头结构
开场用暗底发光粒子 + "incredible" 字铺垫情绪；切白后用排比问句"Has it actually lived up to the hype?"建立悬念；人物出镜，近景推近讲"Everyone says / Don't be afraid of AI / Just adopt it"；再用字幕"But the reality is"打出重音"95% fail"；结尾人物拉开距离，背后打出"WTF"渐变大字收束。整段靠人物景别（近→远）和字卡叠放控制节奏。

## 转场实例表
| 时间戳 | 从什么画面 | 到什么画面 | 转场类型(标签) | 前镜留下的锚点 | 后镜如何接入 | 为何自然 |
|---|---|---|---|---|---|---|
| 0.0→2.28 | 暗底发光紫蓝光点、手触光、"incredible" | 白底 "Has it" | glow-light-transition / cross-dissolve | 蓝紫高光 | 高光过曝成白，字幕淡入 | 用亮度峰值藏切点，从情绪暗场进入说理白场 |
| 2.28→4.0 | "Has it actually lived up" | 紫色渐变大字 "hype?" | kinetic-type-match / match-cut-color | 句子逐词补齐 | 句末词"hype?"放大成紫色重音 | 文字本身是衔接锚点，问句落到重音词 |
| 4.88→6.0 | "hype?" | 人物近景 + "I can promise you TODAY" | hard-cut / kinetic-type-match | 紫色重音词 | 切到人物，"TODAY"大字叠在身后 | 重音词引出人物承诺 |
| 7.47→8.42 | 人物近景 "Everyone says" | 人物远景 + 引号字幕 | camera pull-out / hard-cut | 人物居中 | 人物缩小到画面中远景，字幕浮起 | 景别拉开表示"旁人观点"的距离感 |
| 8.42→10.0 | 远景人物 | 引号 "Don't be afraid of AI" / "Just adopt it" | kinetic-type-match / bg-continuity | 人物 + 引号 | 引号字幕直接叠在远景人物前 | 人物作为稳定背景，字幕换内容 |
| 11.0→13.0 | 远景人物 | "But the reality is" → 红色 "95% fail" | kinetic-type-match / glow-light-transition | 字幕行 | "reality is"后红色辉光打出"95% fail" | 用红 vs 白色彩反差制造论点重音 |
| 17.42→18.0 | 人物近景 | 人物远景 + 背后 "WTF" 渐变大字 | camera pull-out / kinetic-type-match | 人物 | 人物后拉，渐变大字从背后升起 | 拉开景别让情绪词占据画面 |

## 动势
- 0→2.28 暗→白：Movement 亮度上升；Timing Slow Reveal；Easing ease-out；Feeling Cinematic
- 7.47→8.42 近→远：Movement Z 轴拉远；Timing Fast Start；Easing ease-in；Feeling Premium
- 17.42→18 远景+WTF：Movement Z 轴拉远 + 大字升起；Easing ease-out；Feeling Dynamic

## 空间与布局
人物始终在画面中轴，景别在近景（强调观点）和远景（引用旁人）之间切换；字卡永远叠在人物前层或身后，不抢占人物口型。信息层级是"人=说话者，字=被强调的词"，靠景别和字色（白/紫/红）区分情绪。

## 可沉淀的 Pattern 候选
- `glow-to-white-keynote-open`：暗底发光过曝成白场再进字卡（0–2.3s）。解决演讲型视频从情绪段进入说理段的过渡。
- `speaker-scale-pull-quote`：人物景别在近景/远景间切换，引号字卡随论点换词（7–10s）。解决"本人观点 vs 旁人引用"的视觉区分，比硬切字幕更有空间感。
- `accent-word-glow-punch`：句末重音词用对比色 + 辉光打出（4s "hype?"、13s "95% fail"、18s "WTF"）。解决论点重音，可参数化（颜色、辉光半径）。
