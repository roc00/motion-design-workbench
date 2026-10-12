# Microsoft 365（新应用发布片）

## 基础信息
- 类型：产品宣传 / 3D UI Demo（Microsoft 365 新 app）
- 风格：马卡龙粉彩（薰衣草紫/粉）+ 柔焦 3D，治愈系
- 适用场景：办公/效率套件发布片，「实体道具→UI」连续形变的手法可直接借鉴。
- 时长 / 大致镜头数：37.7s，cuts 6 个，实为一镜到底 3D 漫游；约 8 个状态。

## 镜头结构
- 开场（0–3.9s）：温馨房间，镜头推近桌上笔记本。
- 品牌（3.9–6.5s）：Microsoft 365 logo + 各 app 图标环绕，「Introducing the Microsoft 365 app」。
- 功能段（6.5–31.2s）：一张透明卡片旋转展开成书/手机，内容从浏览器邀请函→纸质 guest list→彩色清单→UI 列表连续形变；随后纸飞机、蛋糕照片、文件夹、聊天界面依次出现，每个动作配「to create / to plan / to invite / to celebrate」。
- 收尾（31.2–36.4s）：回到房间笔记本「all in one place」→ Microsoft 365 logo 落版。
- 节奏：长镜无缝，慢而柔。

## 转场实例表（宁多勿漏）
| 时间戳 | 从什么画面 | 到什么画面 | 转场类型(标签) | 前镜留下的锚点 | 后镜如何接入 | 为何自然 |
|---|---|---|---|---|---|---|
| 0.0–2.6s | 房间全景 | 笔记本屏幕 | push-in-reveal | 房间 | 镜头推近笔记本 | 由生活进入产品 |
| 3.9–6.5s | 笔记本 | Microsoft 365 logo + app 图标环绕 | shape-morph / shared-element | 屏幕内容 | 各 app 图标聚合成 logo | 产品矩阵 |
| 6.5–9.1s | logo | 透明玻璃卡片旋转展开 | shared-element / card-flip-3d | 透明质感 | 卡片旋成立体 | 进入核心道具 |
| 10.4–11.7s | 玻璃卡 | 「Create」UI 页（DOG WALKER/PARTY INVITATION） | ui-drill-in / shared-element | 卡片 | 卡片变成 UI 页 | 道具变界面 |
| 12.5–14.0s | 浏览器邀请函「to create」 | 浏览器飞散，透明卡片旋入 | shared-element / card-flip-3d | 邀请函内容 | 内容留在新卡片上 | 内容跨道具 |
| 14.0–15.5s | 透明卡片 | 卡片展开成一本翻开的书「to plan」 | shape-morph / shared-element | 同一张卡 | 卡翻成书，书页有手写字 | 平面→书页 |
| 15.5–17.0s | 翻开的书 | 手机从左侧滑入并排，显示同款手写清单 | device-frame-continuity / shared-element | 书页上手写清单 | 清单内容继承到手机 | 书页→手机 |
| 17.0–18.5s | 手机/书页手写清单 | 手写清单变彩色结构化清单 | shape-morph / shared-element | 同一 guest list | 字形变彩色条目 | 手写→结构化 |
| 18.5–19.5s | 彩色清单 | 白色 UI 列表应用 | ui-drill-in / shared-element | 清单条目 | 条目变成 UI 列表 | 纸质→界面 |
| 19.5–22.1s | UI 列表 | 卡片翻转 + 红心/日历图标 | card-flip-3d / shared-element | 卡片 | 卡片翻面 | 道具翻面 |
| 22.1–23.4s | 翻面卡 | 手机「to invite」 | device-frame-continuity / cross-dissolve | 卡片 | 手机立起 | 设备换 |
| 23.4–26.0s | 手机 | 纸飞机飞出「to invite」 | match-cut-motion / shared-element | 邀请动作 | 纸飞机代替手机飞出 | 动势连续 |
| 26.0–27.3s | 纸飞机 | 蛋糕 + 照片「to celebrate」 | match-cut-color / hard-cut | 粉彩 | 切到庆祝场景 | 章节 |
| 28.6–29.9s | 蛋糕照片 | 文件夹 UI → 聊天 UI | ui-drill-in / shared-element | 粉彩 | 钻到文件/聊天 | 功能连场 |
| 31.2s | 聊天 UI | 回到房间笔记本「all in one place」 | bg-continuity / push-in-reveal | 房间 | 拉回开场空间 | 闭环 |
| 32.5–36.4s | 笔记本 | Microsoft 365 logo 落版 | brand-endcard / cross-dissolve | 白场 | logo 淡入 | 收尾 |

自造标签：
- prop-to-ui-morph：同一份内容（一张 guest list）在浏览器→卡片→书页→手机→结构化 UI 之间连续形变，载体全换内容不变（12.5–19.5s）。

## 动势（挑最典型）
- **prop-to-ui-morph（12.5–19.5s）**
  - Movement：平面旋转（卡→书）+ 横向滑入（手机）+ Z 轴钻取（UI）。
  - Timing：Slow Reveal（全程 ~7s，让观众读形变）。
  - Easing：ease-in-out（柔），翻面带轻微 spring。
  - Feeling：Premium / Playful。
- **纸飞机段（23.4–26.0s）**
  - Movement：斜向飞出。
  - Timing：Medium。
  - Easing：ease-out。
  - Feeling：Playful。

## 空间与布局
- 全程一个粉彩柔焦的 3D 空间，道具（卡/书/手机）在同一视平面上旋转、滑入，背景始终是浅紫粉；内容（guest list）是真正的视觉主角，载体只是它的外壳，形变时内容位置几乎不动。

## 可沉淀的 Pattern 候选
1. **prop-to-ui-morph（道具变界面，内容守恒）**：让同一份内容在浏览器→卡片→书页→手机→结构化 UI 之间连续形变，载体全换、内容位置不变。证据 12.5–19.5s。解决「实体道具演示→数字界面」的衔接，比硬切更有「一件事的不同形态」感。
2. **verb-label-sections（动词字卡分章）**：每个功能段角落打一个「to create / to plan / to invite / to celebrate」动词小标签。证据 12.5s、14.0s、23.4s、26.0s。解决「多段功能如何分章」，用极轻的字卡不抢画面。
3. **object-assembly-logo（图标聚合成 logo）**：各产品图标环绕聚合成主 logo。证据 3.9–6.5s。解决「产品矩阵→主品牌」的开场。
4. **prop-flip-to-next（道具翻面换下一个道具）**：卡片翻个面，背面就是下一个道具/图标。证据 19.5–22.1s。解决「同位置换道具」的连续。
- 灵感参考：房间/蛋糕/纸飞机的 3D 渲染质感为美术炫技，不另立机制。
