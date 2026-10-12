#!/usr/bin/env node
/**
 * 生成 docs/04-验收记录.md。
 * 逐项演示验收表从 data/ 派生，避免手抄错；其余章节是本次工作的记录。
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, "data", p), "utf8"));
const effects = read("effects.json").effects;
const presets = read("presets.json");
const compositions = read("compositions.json");
const SCEN = read("scenarios.json").scenarios;
const L = { core: "首选", good: "可用", caution: "慎用", avoid: "不用" };
const KIND = { effect: "效果", principle: "原理", rule: "规则" };

const out = [];
out.push("# 04 · 验收记录");
out.push("");
out.push("第四版生产适配基础能力的验收结果；保留第三版既有验收记录，并增加统一配置、组合镜头、帧定位、资源门禁与 Shader 检查。");
out.push("");
out.push("## 一、工程检查");
out.push("");
out.push("| 检查 | 命令 | 结果 |");
out.push("|---|---|---|");
out.push(`| 注册表与组合校验 | \`npm run validate\` | 通过；61 条预设、${compositions.compositions.length} 个叙事配方、${compositions.adaptedComponents.length} 个适配组件 |`);
out.push("| 生产运行时测试 | `npm run test:runtime` | 通过；配置、顺/倒/随机定位、资源门禁、交互时间轨 |");
out.push("| 选型矩阵生成 | `npm run docs:matrix` | 通过，派生文档与数据一致 |");
out.push("| 绑定闸门 + 注册表导出 | `npm run build` | 通过，`demo`/`demoVariant` 全部可解析 |");
out.push("| 生产构建 | `vite build` | 通过；本机 Node 20.12.2 低于 Vite 建议版本，保留升级风险提示 |");
out.push("");
out.push("**构建通过的不能单独当作完成标准**，下面是实际执行的浏览与演示验收。");
out.push("");

out.push("## 二、验收场景与结果");
out.push("");
out.push("| 范围 | 验收场景 | 实测结果 |");
out.push("|---|---|---|");
out.push("| 浏览连续性 | 列表滚动 1400px → 打开详情 → 关闭 | 滚动位置 1400 → 1400，列表 DOM 未重建（同一节点） |");
out.push("| 浏览连续性 | 关闭详情后焦点 | 回到打开它的那张卡片 |");
out.push("| 刷新与分享 | `#/effect/component.accordion?from=scenario&scenario=card` 直接打开 | 上下文恢复，角标显示「本场景 · 可用」，不再默认套用文字场景 |");
out.push("| 键盘 | 打开详情后按 Tab | 焦点留在 `<dialog>` 内（原生模态），不会进入背景按钮 |");
out.push("| 键盘 | 在进度滑杆上按 ←/→ | 不触发上一条/下一条切换 |");
out.push("| 键盘 | 详情内按 `/` | 不聚焦背景搜索框 |");
out.push("| 键盘 | Esc | 关闭详情并回到原卡片焦点 |");
out.push("| 时间控制 | 0% → 100% → 0% → 50% → 10% → 50% | 两次 50% 画面逐字符一致；两次 0% 一致 |");
out.push("| 时间控制 | 播放结束后回到起点 | 文案与位移完全复原（离散文案由帧计算，不依赖回调） |");
out.push("| 生命周期 | 连续开关弹窗演示 20 次 + 图表/3D 互切 20 次 | 残留舞台 0、残留画布 0、残留 dialog 0 |");
out.push("| 响应式 | 1440×900 / 1024×768 / 768×1024 / 390×844 | 四档均无横向溢出；首屏均出现真实预览（预览顶部 y=258 / 309 / 366 / 387）；≤960px 目录收为「目录与筛选」按钮 |");
out.push("| 演示语义 | 62 条逐项打开详情并测量 | 挂载异常 0；画面空白 0（画布子节点与可见元素数均 > 0） |");
out.push("| 图表边界 | 18 个边界用例（零值、合法负值、全缺失、长度不符、占比负数、占比总和不足、瀑布加法不成立、排名并列、颜色重复、缺实体、缺数据…） | 规则引擎全部给出明确结论，10 个被正确拒绝，无一抛异常 |");
out.push("| Agent 输出 | 改文案 / 数值 / 时长 / 画幅 | 预览与两种复制结果同步；JSON 可解析 |");
out.push("| 竖屏项目预设 | 选择 `opportunity-ai-vertical` | 预览 9:16；指令与 JSON 同步为 1080×1920、30fps、`portrait-stack` |");
out.push(`| 叙事配方 | ${compositions.compositions.length} 个配方实际挂载、关键帧定位、播放、回起点 | 画面内无说明控件；代表帧和三个关键时刻可检查；播放到终帧后可复位 |`);
out.push("| 镜头语义 | 表达目的、条件、注意力、节拍、衔接、失败例 | 六个配方字段齐全；输入先响应后出结果；局部特写明确标为二维取景近似 |");
out.push("| 原有演示回归 | 61 条逐项挂载，并顺/倒定位 | 挂载失败 0；时长与已解析配置不一致 0 |");
out.push("| 素材策略 | 词典演示加载失败 / 生产组合加载失败 | 前者可退占位；后者由资源门禁报错并阻止播放 |");
out.push("");

out.push("## 三、逐项演示验收表");
out.push("");
out.push("每一条都核对：**名称 → 卡片代表帧 → 详情标题 → 演示引擎与变体**。词典演示仍以 640×360 逻辑画布为基础；新增组合使用独立的横/竖屏布局运行时。");
out.push("");
out.push("| # | 条目 | 类型 | 引擎 / 变体 | 代表帧 | 文字/背景/卡片/手机/图表 | 交互模式 |");
out.push("|---|---|---|---|---|---|---|");
for (const e of effects) {
  const p = presets.demos[e.id] || {};
  const scen = ["text", "bg", "card", "screen", "chart"].map((k) => e.scenarios[k] === "core" || e.scenarios[k] === "good" ? "●" : "·").join("");
  const interactive = e.demo === "scroll" || e.demo === "pointer" ? "视频 + 交互原理" : "视频演示";
  out.push(
    `| ${e.no} | ${e.zh}${e.niche ? "〔专精〕" : ""} | ${KIND[e.nature]} | \`${e.demo}.${e.demoVariant}\` | ${p.still ?? 0.55} | ${scen} | ${interactive} |`,
  );
}
out.push("");
out.push("卡列顺序：文字 / 背景 / 卡片 / 手机 / 图表。● = 首选或可用，· = 慎用或不用。");
out.push("");

out.push("## 四、两份实际复制出的制作配置");
out.push("");
out.push("### 4.1 制作指令（中文）—— 图表数据叙事 · 瀑布归因");
out.push("");
out.push("```text");
out.push(`【瀑布归因（Waterfall）· 效果】场景：图表数据叙事。
画布 1920×1080（16:9）、24fps；动作 5000ms（120 帧）、停留 1000ms（24 帧）；
可见镜头共 144 帧，前后各留 12 帧 handles（单列，不计入可见时长）。
结束状态：停在准确终值并保留阅读停留，不循环、不回弹。
实现：推荐渲染层 deterministic；当前能力状态为 browser-demo，支持按帧定位。
约束：图元用不超调插值；结束必须停在准确值，不循环、不回弹；避免：增减项之间没有加法关系。
提示词参考：瀑布归因，5000ms 动作 + 1000ms 停留，结束停在终态不回弹。`);
out.push("```");
out.push("");
out.push("### 4.2 镜头配置（JSON）—— 手机产品演示 · 轻提示消息");
out.push("");
out.push("```jsonc");
out.push(`{
  "schemaVersion": "0.5.0",
  "configLabel": "制作配置",
  "configNote": "保留 ShotSpec 的字段形状；不声称已完成 HyperFrames 或 Remotion 适配。",
  "effect": { "id": "component.toast", "zh": "轻提示消息", "en": "Toast / Snackbar", "nature": "effect", "natureLabel": "效果", "group": "组件状态" },
  "scenario": { "id": "screen", "name": "手机产品演示" },
  "canvas": { "width": 1920, "height": 1080, "fps": 24, "format": "16:9", "layoutPreset": "landscape-stage", "profileId": null, "colorSpace": "rec709" },
  "timeline": {
    "actionMs": 260, "staggerMs": 0, "staggerMode": "between-item-starts", "staggerCount": 1,
    "staggerSpanMs": 0, "actionSpanMs": 260, "holdMs": 1700, "exitMs": 300,
    "actionFrames": 6, "staggerFrames": 0, "holdFrames": 41, "exitFrames": 7,
    "visibleFrames": 54, "handlesInFrames": 12, "handlesOutFrames": 12,
    "totalFramesExcludingHandles": 54,
    "note": "staggerMs 是相邻元素开始时间间隔；staggerSpanMs 是整组跨度。handles 单列，不计入可见镜头时长。"
  },
  "endState": "动画播放一次后停在终态并保持；用户可重播。",
  "content": { "url": "https://motion.kit/share/abc", "message": "已复制到剪贴板" },
  "device": { "innerWidth": 393, "innerHeight": 852, "frame": "neutral", "note": "内屏比例与输出画幅分开配置。" },
  "assets": [],
  "renderLayerRecommend": "deterministic",
  "exampleCapability": { "status": "browser-demo", "type": "frame-addressable-browser-runtime", "seekable": true, "layout": "landscape-stage", "reducedMotion": "static-terminal-or-short-fade" },
  "constraints": ["停留 3–5 秒；错误类 6 秒以上或需手动关闭", "避免：关键错误只闪一下就消失（必须给处理入口）", "避免：多条消息同时出现遮住页面"],
  "version": "0.5.0"
}`);
out.push("```");
out.push("");

out.push("## 五、来源偏差与未完成项");
out.push("");
out.push("### 与 PLAN 的偏差（已按实际情况调整）");
out.push("");
out.push("1. **第五场景的条目**：PLAN 说「六个图表词条追加编号」。实际按 57–62 追加，原 1–56 编号未动，校验器改为「编号从 1 连续到 N」而不是写死 56。");
out.push("2. **占比总和不为 100**：PLAN 要求「不静默修改数据」。实现为：校验器给警告、界面按原值展示，**不做归一化**，也不阻止播放（总和为 0 或出现负值才拒绝）。这是有意的分级。");
out.push("3. **图片序列**：无法获得某一主体的真实连续帧，改用**确定性绘制序列**（24 帧对应 24 个旋转角度，帧号与画面严格对应），并在界面上标注为「设备旋转 · 确定性绘制序列」，不冒充实拍序列帧。");
out.push("4. **交互原理模式的素材**：真实滚动用宿主 `overflow` + `position: sticky` 实现（真的能滚），指针类用真实 `pointermove`；这两种模式下进度条与播放按钮按能力禁用，不伪装成可定位。");
out.push("");

out.push("### 未完成项");
out.push("");
out.push("1. **案例库仍是空的**。61 条条目的 `cases` 全部为空；本轮按要求不推进外部经典案例。");
out.push("2. **没有真机触屏验证**。响应式是在无头浏览器里用同源 iframe 按 1440×900 / 1024×768 / 768×1024 / 390×844 四档测量 CSS 布局，没有在真实手机上验证触摸手感与惯性滚动。");
out.push("3. **素材未本地化**。演示图片仍走 `picsum.photos` 网络请求，固定 seed 只保证同一张图，不保证可复现资产；离线时是占位底色。");
out.push("4. **尚未跑实际 MP4 渲染路径**。已有渲染器无关的帧输入合同、竖屏组合运行时和资源门禁，但尚未接到 Remotion/离屏渲染并输出技术样片，所以没有组件标记为 `production-verified`。");
out.push("5. **无障碍只做了键盘与焦点**。没有做屏幕阅读器朗读顺序的完整验证，配色的对比度也未逐项测量。");
out.push("6. **性能未做量化**。卡片预览用 IntersectionObserver 限制在视口附近挂载，但没有测过同时挂载上限与长时间运行的内存曲线。");
out.push("");

out.push("## 六、已知的复现注意");
out.push("");
out.push("无头浏览器截图在演示自动播放期间会等待页面稳定而超时；截图前先暂停演示即可（这是工具行为，不是应用缺陷）。");
out.push("");

writeFileSync(join(root, "docs", "04-验收记录.md"), out.join("\n"), "utf8");
console.log(`已生成 docs/04-验收记录.md（${out.length} 行）`);
if (!existsSync(join(root, "docs", "04-验收记录.md"))) process.exit(1);
