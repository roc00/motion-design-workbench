# shard4 分片汇总

分片覆盖 10 个视频（179.7s×2 超长 showreel + 8 个 16–103s 产品/品牌片）。下面先合并转场实例总表，再按频次排 Pattern 候选，最后做风格差异小结。

## 一、转场实例总表（合并，保留视频+时间戳）

| 视频 | 时间戳 | 从 → 到 | 主要标签 |
|---|---|---|---|
| CDX-GDG | 6.4–11 | 工作台 → 圆形舷窗推穿进太空 | circle-iris / zoom-through |
| CDX-GDG | 12.1–12.5 | 太空 CDX 5 连切到不同 3D 场景 | beat-cut / hard-cut |
| CDX-GDG | 21.6–136 | 几十个 App UI 屏连续硬切 | device-frame-continuity / bg-continuity |
| CDX-GDG | 132–138 | 单卡 → 旋转手机卡阵列 | clone-multiply |
| CDX-GDG | 139.2 / 141.6 | 手机卡阵列 → 橙色对角楔 → 字卡 | wipe-directional（品牌色斜切） |
| CDX-GDG | 141.6–142.5 | 橙色退白 → 打字机 "DIDI SANS" | kinetic-type typewriter |
| CDX-GDG | 166.2–169.3 | 单视频卡 → 多语言卡 → 运动模糊藏切 | clone-multiply / motion-blur-cut |
| CDX-GDG | 172.8 | 波浪 logo → 纸屑"HI!2023" | particle-dissolve |
| TRAE | 2.0–7.2 | 黑方块 → 炸开成点阵 → 聚合 TRAE 字标 | shape-morph / morph-from-primitive（反向粒子聚合） |
| TRAE | 7.2–9.6 | 字标 → "TRAE 2.0 SOLO"版本号 | kinetic-type-match |
| TRAE | 16.8–19.2 | IDE 图标 → 代码编辑器 | ui-drill-in |
| TRAE | 79.2/103/110/120 | 绿色九宫格 TRAE 品牌呼吸卡 | split-screen（九宫格） |
| TRAE | 120.8–122 | 九宫格 → 中央黑块收拢 | grid-collapse-to-brand |
| TRAE | 122.2 | 黑方块 → 深色 UI 卡 | shape-morph（方块→卡片） |
| TRAE | 123.5–125 | UI 卡 → 中心 logo 辐射 agent 连线 | line-path-carry / camera-orbit |
| TRAE | 126.5–130.5 | 缩写逐词绿条扫亮 → 字距拉开+中文打字机 | kinetic-type-match |
| TRAE | 132.5–137 | 横条堆叠组装字标 → 深绿落版 | morph-from-primitive / brand-endcard |
| Riverside | 3.6–5.4 | 紫/绿箭头指向 UI 元素 | line-path-carry（arrow-callout） |
| Riverside | 26.5–32 | 编辑器小窗 → 竖屏 reel 卡扇形展开后推穿 | reel-cards-zoomthrough / parallax-push |
| Riverside | 28–31 | 同人物多景别竖排卡 | split-screen（竖排多卡） |
| Riverside | 86.4–88.2 | 中心 logo + 合作 logo 曲面环绕视差 | logo-constellation-orbit / camera-orbit |
| Riverside | 95.4 | 主持人 → 环形 logo 放大 CTA | logo-morph |
| ColCircle | 11.5–15.5 | 银币 → 手机点阵环 → 实心黑圆 | match-cut-shape（圆）/ shape-morph |
| ColCircle | 15.7–17 | 黑圆 → 人物头像圆环簇 | particle-dissolve / match-cut-shape |
| ColCircle | 46.8–50.4 | 黑粒子 → "Cognitive Banking"发光字 | particle-dissolve / glow-light-transition |
| ColCircle | 51.5–55.8 | 彩色丝带 → 黄点 → 黄色 CTA 按钮 | ribbon-converges-to-button / shared-element |
| ColCircle | 59.4–61.2 | 按钮组件 → 情侣黄横幅 | match-cut-color（黄） |
| ColCircle | 63–68.4 | 房子+车多角度（车右行） | match-cut-motion |
| ColCircle | 72–74.5 | 卡片堆叠 + 绿弧扫底 | arc-sweep-between-cards |
| ColCircle | 74.9–80 | UI 环形图 → 金库圆门 → 穿门进长廊 | ring-to-vault-door-matchcut / zoom-through |
| xAI | 3.6–9 | 内容滚出 → 星野视差淡入+双角字 | scroll-starfield-parallax / parallax-push |
| xAI | 14.4–19.8 / 23.4–25.2 / 55.8 | 段落交界光 bloom 压入 | edge-glow-bloom-section / glow-light-transition |
| xAI | 39.6–43 | 细线地球轨道缓旋 | camera-orbit / line-path |
| xAI | 45.5–47.5 | 巨字 COLOSSUS 低对比隐现→高光扫字 | scroll-giant-type-light-sweep |
| 盒马 | 6.5–9.5 | 双圆相扣 → 花生 → 水滴 → A'字标 | concept-to-logo-shape-chain / shape-morph |
| 盒马 | 9.5–10.4 | 黑斜楔擦入 | wipe-directional |
| 盒马 | 23.4–26 | 河马同方向走切场景 | match-cut-motion |
| 盒马 | 41.6 | UI 方格 → 储物柜方格 | match-cut-shape（方格） |
| 盒马 | 52.3–53.3 | 实景溶黑 → slogan 打字机 | fade-black / kinetic-type typewriter |
| 盒马 | 54.6–56 | "爱"字逐次形变为 AI→A→A'字标 | tagline-final-char-morph-to-logo / logo-morph |
| Amie | 0–7.2 | 弹窗 → 笔记本视频窗拉远 | laptop-frame-zoom-out / device-frame-continuity |
| Amie | 8.4–10.8 | 双画面 → 逐字稿滚动 | ui-drill-in |
| Amie | 15.6–18 | 箭头 → 发光蓝方块 | glow-square-arrow-morph |
| Amie | 25.7–30.5 | 应用图标左右分列 → 虚线向中心粉块辐条连接 | hub-spoke-dotted-connector / line-path-carry |
| Amie | 42–51.6 | 文档 → 回到笔记本视频 | device-frame-continuity |
| MS Designer | 1.3–5.2 | 字标散成紫丝带缠绕白卡 | logo-to-silk-ribbon-to-card / shared-element |
| MS Designer | 5.2–19.5 | 悬浮 3D 窗在紫舞台上微漂、窗内换内容 | floating-window-vertical-deck / device-frame-continuity |
| MS Designer | 20.8–22.1 | 旧窗上滑出、新窗下顶入 | page-slide（纵向叠换） |
| panel3 | 1.8–3.6 | 乱线自绘"all over the place"→收拢托手机 | scribble-line-reveal-product / line-path-carry |
| panel3 | 6.0 / 17.0 | "One place"玻璃字反复出现 | glass-word-recurring-anchor |
| panel3 | 7.0 | "One place"→蓝块右滑"everything" | wipe-directional |
| panel3 | 10–13 | Stocks→ETFs→Crypto→Treasuries 同模板快切 | category-template-montage / list-reveal |
| 三维动画 | 0–11.3 | 辉光 UI 卡在纯黑空间游走溶解 | glow-card-float-reel |
| 三维动画 | 7.0 | 四角星闪光藏切到表格 | sparkle-star-hidden-cut |
| 三维动画 | 12.0–13.0 | 平面卡 → 3D 浮卡+同心发光环绕镜头绕 | orbit-rings-around-card / camera-orbit |

## 二、Pattern 候选按频次排序（≥2 个不同视频标「高频」）

1. **device-frame-continuity-reel**（高频）：统一样机/设备框+统一背景，框内硬切换内容，把几十屏缝成一条翻阅流。证据：CDX 21.6–136、Riverside 2–7.2、盒马 27–29.9、Amie 0–7.2、panel3 3–5、MS Designer 5.2–19.5。
2. **camera-orbit-with-decor**（高频）：中心主体不动，镜头缓慢环绕，常配轨道/装饰环。证据：Riverside 86.4–88.2（合作 logo 曲面）、TRAE 123.5–125（agent 连线）、xAI 39.6–43（地球轨道）、三维动画 12.0–13.0（同心环）。
3. **line-path-carry 引导/连接**（高频）：线/箭头/虚线承担注意力或拓扑。证据：Riverside 3.6–5.4（箭头指 UI）、Amie 25.7–30.5（辐条虚线）、ColCircle 72–74.5（弧扫卡）、panel3 1.8–3.6（乱线）、TRAE 123.5。
4. **shared-element-flow-ribbon**（高频）：一条流动色带/丝带/弧线跨镜头飞行串场。证据：ColCircle 51.5–55.8（丝带汇聚成按钮）、MS Designer 1.3–5.2（紫丝带缠卡）、CDX 72–74.5（绿弧）。
5. **kinetic-type-reveal**（高频）：打字机/字距拉开/逐词高亮/末字形变。证据：CDX 141.6、TRAE 126.5–130.5、盒马 54.6–56（末字形变 logo）、panel3、Amie。
6. **match-cut-shape 几何母题**（高频）：用一个形状（圆/方格）对齐硬切。证据：ColCircle 圆形链、盒马 41.6（方格→储物柜）、CDX、panel3 品类物体。
7. **clone-multiply**（高频）：单元素克隆增殖成阵列/集合。证据：CDX 132–138 & 166.2、Riverside 28–31、盒马 15–16、TRAE 九宫格、panel3 多手机。
8. **glow-light-transition**（高频）：辉光/闪光/星 bloom 藏切。证据：xAI 14.4–25.2、ColCircle 46.8、三维动画 7.0、Amie 15.6。
9. **shape-morph / logo 生长链**（高频）：从基础几何或概念图形连续形变到字标。证据：TRAE 2–7.2 & 132.5、盒马 6.5–9.5 & 54.6、ColCircle 11.5–17、MS Designer 1.3。
10. **zoom-through 穿过开口**：穿过圆形/卡片阵列进入新空间。证据：CDX 6.4（舷窗）、ColCircle 74.9（金库门）、Riverside 26.5（竖屏卡阵）、panel3 3.2（线托手机）。
11. **ui-drill-in**：图标/输入框放大钻进真实界面。证据：TRAE 16.8、Amie 8.4–14、Riverside 21.6。
12. **wipe-directional 品牌色斜切**：品牌色楔形斜向擦除。证据：CDX 139.2/141.6、盒马 9.5、panel3 7.0。
13. **hard-cut 快切蒙太奇**：同背景/同模板下节拍快切。证据：CDX、盒马、panel3（category-template-montage）。

仅单视频出现的特色候选（仍可复用）：
- **logo-constellation-orbit**（Riverside）：中心品牌+客户 logo 曲面环绕。
- **reel-cards-zoomthrough**（Riverside）：竖屏卡扇形展开后推穿。
- **grid-collapse-to-brand**（TRAE）：九宫格向中心品牌块收拢。
- **ring-to-vault-door-matchcut**（ColCircle）：环形图→金库门穿入。
- **ribbon-converges-to-button**（ColCircle）：丝带汇聚成 CTA。
- **scroll-starfield-parallax** / **scroll-giant-type-light-sweep**（xAI）：深色长滚动的星野与巨字光扫。
- **tagline-final-char-morph-to-logo**（盒马）：slogan 末字形变字标。
- **concept-to-logo-shape-chain**（盒马）：双圆→字标推导。
- **hub-spoke-dotted-connector**（Amie）：应用图标辐条连中心。
- **logo-to-silk-ribbon-to-card**（MS Designer）：字标散成丝带缠卡。
- **category-template-montage**（panel3）：左物体右词模板循环。
- **orbit-rings-around-card**（三维动画）：同心发光环绕卡。
- **scribble-line-reveal-product**（panel3）：乱线收拢托产品。

## 三、风格差异小结

- **浅色 UI 蒙太奇派（CDX、Amie、盒马中段）**：以白底/浅底 + 设备框连续翻页为主，转场偏硬切与溶解，靠统一样机和品牌色缝场；Programmable 重点在 device-frame-continuity 与列表/卡入场。
- **深色电影派（xAI、三维动画、TRAE、ColCircle 尾段）**：纯黑/深炭底，用星野、光束、同心环、辉光做纵深，节奏慢、留白大；重点在 scroll/光 bloom/轨道运镜。
- **3D 渲染品牌片派（ColCircle、MS Designer、Riverside）**：超写实或玻璃拟态 3D，靠形状母题（圆）、丝带、立体卡做共享元素；重点在 match-cut-shape 与 ribbon/shared-element。
- **真人主持+录屏派（Riverside）**：实拍与 UI 频繁交切，重点在 arrow-callout、竖屏卡推穿、笔记本框连续。
- **快切 kinetic type 派（panel3、盒马开场/尾）**：蓝白或黑白高对比，字卡+模板循环，重点在 category-template-montage 与 concept-to-logo 推导。

跨片最稳定的"可程序化通货"是：**设备框连续翻页、中心主体环绕（带装饰环/连线）、引导线/辐条、流动色带串场、字卡揭示与 logo 生长链**——这些在 ≥3 个视频里以不同包装反复出现，是本 shard 最值得抽成通用镜头卡的部分。
