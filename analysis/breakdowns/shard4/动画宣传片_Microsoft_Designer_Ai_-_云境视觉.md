# 动画宣传片_Microsoft Designer Ai - 云境视觉.mp4

## 基础信息
- 类型：AI 设计工具（Microsoft Designer）产品宣传 MG 动画
- 风格：淡紫/薰衣草渐变 + 3D 柔边卡片 + 流动丝绸丝带，玻璃拟态、柔和高级
- 适用场景：设计/创意类 SaaS 的品牌产品宣传、UI 漂浮展示
- 时长 / 大致镜头数：33s；cuts.txt 2 个切点，约 8 个镜头

## 镜头结构
开场（0–1.3s）紫色工具图标聚成 Microsoft Designer 字标。紧接着（1.3–5.2s）字标散成流动紫色丝带，丝带缠绕住一张"Brand Kit Creator"白卡，把 logo 过渡到产品卡。中段（5.2–19.5s）一张悬浮 3D 桌面窗在紫色舞台上缓慢漂移，窗内依次切换网站模板、品牌套件、色板；舞台周围散落画笔、颜料等设计道具。尾段（20.8–31s）窗口纵向叠换为"Lightning fast creation with AI"与书籍封面卡片，最后回到 Microsoft Designer 字标落版，多张 UI 卡散开。整体长镜漂浮，节奏舒缓。

## 转场实例表
| 时间戳 | 从什么画面 | 到什么画面 | 转场类型(标签) | 前镜留下的锚点 | 后镜如何接入 | 为何自然 |
|---|---|---|---|---|---|---|
| 0–1.3 | 紫工具图标 | Microsoft Designer 字标 | shape-morph / logo-morph | 紫工具 | 聚成 U 形字标 | 品牌登场 |
| 1.3–2.6 | 字标 | 紫色丝带 + Brand Kit 白卡 | shared-element / liquid-gradient / shape-morph | 字标 | 字标散成流动紫丝带，丝带缠绕住一张白卡 | 丝带=字标解体后的"流"，无缝进入产品卡 |
| 2.6–5.2 | Brand Kit 卡 | 桌面 UI 窗 | shared-element（丝带）/ push-in-reveal | 紫丝带 | 丝带持续飘动，白卡滑出，桌面 UI 从下滑入 | 丝带不断=空间连续 |
| 5.2–19.5 | 桌面 UI 窗 | 窗内切色板/品牌套件 | device-frame-continuity / bg-continuity | 悬浮窗 + 紫舞台 | 窗不动，仅窗内内容切换，镜头微漂 | 同一悬浮窗里翻页 |
| 20.8–22.1 | 色板窗 | "Lightning fast creation"新窗 | page-slide（纵向叠换）/ wipe-directional | 紫舞台 | 旧窗上滑出，新窗从下顶入 | 卡片像一叠纸纵向翻 |
| 22.1–27.3 | 新窗 | 书籍封面卡 | shared-element / bg-continuity | 紫舞台 | 窗内内容切到书籍封面 | 同舞台 |
| 28.6 | 卡片 | Microsoft Designer 字标 | logo-morph / fade | 紫 | 淡入白字标 | 落版 |
| 29.9–31.2 | 字标 | 多 UI 卡散开 | clone-multiply | 无 | 多张卡散开 | 收尾蒙太奇 |

> 自造标签：`logo-to-silk-ribbon-to-card`（品牌字标散成流动丝带，丝带缠绕并带入产品卡，词表 liquid-gradient + shared-element 的组合范式）。

## 动势（挑典型）
- **字标→丝带→卡（1.3–2.6s）**：Movement=解体后绕卡流动；Timing=Slow Flow；Easing=ease-in-out；Feeling=Premium/Cinematic。
- **窗口纵向叠换（20.8–22.1s）**：Movement=上出下入；Timing=中速；Easing=ease-in-out；Feeling=Smooth。
- **悬浮窗漂移（5.2–19.5s）**：Movement=Z 轴微动 + 平移；Timing=Slow；Easing=线性；Feeling=Premium。

## 空间与布局
- 全片在一个淡紫 3D 舞台上，悬浮窗与道具（画笔/颜料）共享同一空间，镜头只做微漂。
- 丝带作为贯穿全片的流动元素，把字标、卡片、舞台缝成一体。

## 可沉淀的 Pattern 候选
- **logo-to-silk-ribbon-to-card**：品牌字标先散成一条流动丝绸/丝带，丝带缠绕并托住一张产品卡，丝带持续飘动完成后续镜头。证据 1.3–5.2s。解决：把"品牌 logo"优雅地过渡到"具体产品界面"，比硬切高级。
- **floating-window-vertical-deck**：一张悬浮 3D 窗口固定在彩色舞台上，窗内内容切换；需要换大段时旧窗上滑出、新窗从下顶入，舞台与道具不动。证据 5.2–19.5s、20.8–22.1s。解决：把多段 UI 装进一个"漂浮展示台"，避免碎切。
- **stage-props-parallax**：彩色舞台上散落与产品相关的小道具（画笔/颜料），镜头微漂时道具视差。证据 5.2–19.5s。解决：给纯 UI 漂浮场景增加质感与主题感。
- 灵感参考：丝绸丝带与 3D 渲染为美术风格，不单独做转场候选。
