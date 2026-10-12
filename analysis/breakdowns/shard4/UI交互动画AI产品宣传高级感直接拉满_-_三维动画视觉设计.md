# UI交互动画+AI产品宣传高级感直接拉满 - 三维动画视觉设计.mp4

## 基础信息
- 类型：深色高级感 3D UI 产品宣传（Kosmo / AI 财务 + NFT 概念）
- 风格：深底蓝/红辉光、玻璃拟态浮卡、同心发光环、镜头 3D 环绕
- 适用场景：Web3/AI 财务、高端感 UI 概念展示
- 时长 / 大致镜头数：16.8s；cuts.txt 2 个切点，约 10 个镜头（3D 相机游走）

## 镜头结构
全片在深底上让一张张 UI 卡片以 3D 方式悬浮游走：开场蓝色辉光卡片展示费用柱状图、搜索框"List of Top Customers"、蓝绿环形图；中间一颗四角星闪过后切到数据表格与状态 chip；接着蓝色输入框（Kosmo）。后半段（12–14s）卡片切到红色调，以同心发光环（土星环式）环绕并做镜头环绕，展示"Claim your executive NFT pass / Claim NFT to Stake"卡，最后落到 Discord 按钮群。整体为 3D 相机慢游，单镜约 1.5–2s。

## 转场实例表
| 时间戳 | 从什么画面 | 到什么画面 | 转场类型(标签) | 前镜留下的锚点 | 后镜如何接入 | 为何自然 |
|---|---|---|---|---|---|---|
| 0–1.0 | 费用柱状图卡 | 同一卡换数据 | device-frame-continuity / bg-continuity | 蓝辉光卡 | 卡不动换内容 | 同卡翻阅 |
| 1.0–2.0 | 柱状图卡 | 搜索框"List of Top Customers" | cross-dissolve / hard-cut | 蓝辉光 | 溶解到新卡 | 同蓝调 |
| 2.0–5.0 | 搜索框 | 蓝绿环形图 | cross-dissolve / camera-orbit | 蓝绿 | 环形图缓慢旋转 | 图形过渡 |
| 5.0–6.0 | 环形图 | 搜索框"28 records missing" | cross-dissolve | 蓝 | 溶解回搜索框 | 同底 |
| 7.0 | 搜索框 | 数据表格卡 | glow-light-transition（四角星闪） | 星闪光 | 星形闪光藏切，露出表格 | 闪光藏切 |
| 8.0–9.0 | 表格 | 表格换行 | device-frame-continuity | 表卡 | 高亮行切换 | 同卡 |
| 10.0–11.3 | 表格 | 蓝色输入框 Kosmo | cross-dissolve | 蓝辉光 | 溶解到输入框 | 蓝调 |
| 11.3–12.0 | 平面蓝输入框 | 红色 3D 浮卡 + 同心发光环 | hard-cut / camera-orbit | 卡 | 硬切到同一卡的 3D 视角，外加同心发光环环绕 | 卡不变，空间从平面升到 3D |
| 12.0–13.0 | 3D 浮卡 | 卡内容填充 + 顶字 | camera-orbit | 同心环 | 镜头绕卡缓转，环转动，卡内容淡入 | 镜头运动藏住内容更新 |
| 13.0–14.6 | NFT 卡 | "Simple"字 | push-in-reveal / cursor-carry | 红光标 | 镜头缓推近，红光标指向元素，"Simple"字出 | 聚焦 |
| 15.0–16.0 | NFT 卡 | Discord 按钮群 | hard-cut | 红黑 | 切到按钮列表 | 收尾 |

> 自造标签：**orbit-rings-around-card**（给平面 UI 卡硬切到 3D 视角，外加同心发光环环绕并随镜头转动，词表 camera-orbit 的装饰环变体）。

## 动势（挑典型）
- **同心环环绕卡（12.0–13.0s）**：Movement=镜头绕卡水平环绕 + 环自转；Timing=Slow Orbit；Easing=线性；Feeling=Premium/Cinematic。
- **四角星闪切（7.0s）**：Movement=星形闪光扩开；Timing=快；Easing=ease-out；Feeling=Premium。
- **辉光卡游走（0–11s）**：Movement=Z 微移 + 平移；Timing=Slow；Easing=线性；Feeling=Premium。

## 空间与布局
- 全片纯黑空间，每张 UI 卡都是悬浮 3D 物体，靠辉光与同心环制造纵深。
- 蓝调段（财务 UI）与红调段（NFT）用闪光/溶解分隔，但都保持"卡悬浮+辉光"的统一语言。

## 可沉淀的 Pattern 候选
- **orbit-rings-around-card**：把一张平面 UI 卡硬切到 3D 视角，外加一圈或多圈同心发光环环绕卡片，镜头缓慢水平环绕卡片同时环自转。证据 12.0–13.0s。解决：给普通卡片一个高级感"展示台"，让数据/NFT 卡有重量。
- **sparkle-star-hidden-cut**：一颗四角星闪光扩开满屏，借闪光峰值藏住切点到下一张卡。证据 7.0s。解决：深色 UI 段之间的轻量高级藏切。
- **glow-card-float-reel**：一组带辉光的 UI 卡在纯黑空间里以微 Z 移游走、交叉溶解，不硬切。证据 0–11.3s。解决：多张 UI 卡的连续高级展示。
- 灵感参考：3D 卡片与同心环为美术渲染，不单独做转场候选。
