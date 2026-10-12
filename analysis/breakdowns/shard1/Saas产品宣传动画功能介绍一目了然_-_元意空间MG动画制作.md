# Saas产品宣传动画功能介绍一目了然 - 元意空间MG动画制作.mp4

## 基础信息
- 类型：SaaS 产品宣传（Naver Work 类办公套件）
- 风格：浅蓝极简扁平 3D MG，圆角卡片、玻璃拟态手机/笔记本 mockup
- 适用场景：办公协作 / HR / 审批类 SaaS 的功能导览片，节奏轻快、信息干净
- 时长 / 大致镜头数：18.8s，cuts 2（9.3、16.7），实际约 10–12 个视觉段落

## 镜头结构
开场用一排应用图标 + 一句标语建立"办公平台"概念；中段用手机/笔记本 mockup 依次演示打卡、审批、日程三个功能，UI 卡片在 3D 空间里飞散组合；结尾把卡片收拢成环绕 Logo 的轨道，再用蓝色缎带划落出品牌落版。整体是"图标→功能演示→品牌"的标准 SaaS 结构，单镜约 1.5–2s，以无缝滑入/缩放为主，仅两次硬切。

## 转场实例表
| 时间戳 | 从什么画面 | 到什么画面 | 转场类型(标签) | 前镜留下的锚点 | 后镜如何接入 | 为何自然 |
|---|---|---|---|---|---|---|
| 0.0→1.0 | 桌面图标排 + 标语 + 右向箭头 | 一叠倾斜卡片飞来，绿色横线扫过 | wipe-directional / line-path-carry | 右向箭头 + 绿色横线 | 横线变成卡片堆叠的中轴，卡片沿横向推入 | 箭头指明方向，横线作为运动轨道延续 |
| 3.0→4.0 | "출퇴근 ON" 卡片 + 右向箭头 | 手机 mockup 出现 NAVER Cloud 仪表盘 | line-path-carry / device-frame-continuity | 右向箭头 | 箭头方向延续，卡片收起成手机外框 | 箭头引导视线落到下一个设备框 |
| 6.0→7.0 | 笔记本浏览器表单 | 白色弹窗卡片浮起 | ui-drill-in / card-flip-3d | 浏览器表单内容 | 表单内容被一张弹窗卡片"拾取"浮起 | 卡片是表单的浮层，空间关系未变 |
| 9.0→10.0 | 绿色"결재 진행하기"全屏按钮 | 手机 mockup 弹窗 | hard-cut / device-frame-continuity | 绿色按钮 | 切到手机上同类弹窗 | 同是审批动作，动作对象换到手机端 |
| 12.0→13.0 | 日程表格选中某日 | 多张卡片在 3D 空间向四周飞散 | shared-element / clone-multiply | 日程卡片 | 表格行"炸开"成一堆独立卡片 | 卡片从平面行扩展为立体集合 |
| 14.0→15.0 | 卡片四散 | 卡片绕中心 Logo 做圆周轨道运动 | shape-morph / shared-element | 散开的卡片 | 卡片位置收束成圆环 | 平面散点收束为旋转轨道 |
| 15.0→16.0 | 卡片绕 W Logo 轨道 | 同心圆波纹扩散、Logo 居中 | logo-morph / circle-iris | W Logo + 圆环 | 圆环放大成同心波纹 | 轨道圆直接演变为品牌光圈 |
| 17.0→18.0 | 时钟图标 + 绿叶箭头 + 浮动卡片 | 蓝色 3D 缎带划落、打出对勾落版 | brand-endcard / glow-light-transition | 蓝色缎带轨迹 | 缎带扫过完成对勾 | 品牌色缎带收束全片 |

## 动势
- 0→1 图标→卡片：Movement 横向右→左推入；Timing Fast Start；Easing ease-out；Feeling Dynamic
- 14→16 卡片→轨道→Logo：Movement 中心向外再收束；Timing Slow Reveal；Easing ease-in-out；Feeling Premium
- 17→18 缎带落版：Movement 斜向扫落；Timing Fast Start；Easing ease-out；Feeling Premium

## 空间与布局
整片用浅蓝无限背景做 bg-continuity，主视觉在"平面图标层"和"3D 卡片层"之间切换：前半信息贴在屏幕平面上，中段卡片 Z 轴飞散建立纵深，末段收拢回中心品牌位。信息层级从"图标阵列"→"单功能手机屏"→"卡片集合"→"品牌 Logo"逐级聚焦。

## 可沉淀的 Pattern 候选
- `arrow-to-device-carry`：右向箭头/横线作为运动轨道，把前镜卡片引导成后镜设备框（0–4s）。解决"从概念到产品 UI"的跳跃问题。
- `card-explode-orbit-to-logo`：平面卡片行炸成 3D 散点，再绕 Logo 收拢成同心光圈（12–16s）。解决"功能集合→品牌收束"的落版问题，比直接 fade 更有设计感。
- `ribbon-checkmark-endcard`：品牌色 3D 缎带斜扫打出对勾完成落版（17–18s）。解决 SaaS 结尾的品牌记忆点。
