/* ------------------------------------------------------------------ */
/* Recipe Builder · 三步向导（Intake → 推荐 → 导出）                    */
/* 弱模型平权核心：组织简报 / 写 prompt / 搭脚手架全部自动完成。         */
/* ------------------------------------------------------------------ */

import directorPatternsData from "../data/director-patterns.json";
import cinematicShotsData from "../data/cinematic-shots.json";
import stylePatternsData from "../data/style-patterns.json";
import tplIndex from "../templates/index.html?raw";
import tplMotion from "../templates/lib/motion.js?raw";
import tplCamera from "../templates/lib/camera.js?raw";
import tplUtil from "../templates/lib/util.js?raw";
import tplCue from "../templates/cue-table.json?raw";
import tplScene from "../templates/scenes/example-scene.js?raw";
import tplRender from "../templates/render.mjs?raw";

const PATTERNS = stylePatternsData;

/* 片型 → 决策路由（保底正确组合，弱模型查表，不做审美判断） */
const GOAL_ROUTES = {
  launch: { style: "cinematic-dark", concept: "problem-gone", conceptAlt: "claim-how-result", medium: "flat-vector" },
  data: { style: "brutalist-mono", styleAlt: "cinematic-dark", concept: "living-number", medium: "chalkboard", mediumAlt: "cyanotype" },
  brand: { style: "pastel-playful", concept: "rhythmic-collage", medium: "marker-comic" },
  premium: { style: "luxury-dark", concept: "one-continuous-shot", medium: "single-line-engraving" },
  editorial: { style: "editorial-light", concept: "pure-typography", medium: "flat-vector" },
  poster: { style: "poster-color-block", concept: "logo-as-stage", medium: "risograph", mediumAlt: "cut-paper" },
  "product-demo": { style: "flat-photo", concept: "journey-inside-ui", conceptAlt: "one-feature-demo", medium: "flat-vector" },
  retro: { style: "retro-analog", concept: "brand-system", conceptAlt: "living-ui-ecosystem", medium: "pixel-art" },
  compare: { style: "cinematic-dark", styleAlt: "poster-color-block", concept: "before-after", medium: "flat-vector" },
};

const GOAL_LABEL = {
  launch: "科技 / 产品发布",
  data: "数据 / 指标故事",
  brand: "品牌 / 温情 / 年轻化",
  premium: "高端 / 质感 / 意境",
  editorial: "编辑 / 文章 / 发布",
  poster: "海报 / 活动 / 促销",
  "product-demo": "复杂产品 / 功能讲解",
  retro: "复古 / 玩梗 / 游戏",
  compare: "流程 / 前后对比",
};

const W = {
  step: 1,
  form: {
    goal: "launch",
    product: "",
    duration: 15,
    ratio: "16:9",
    reference: "none",
    color: "",
    font: "",
    music: "synthesize",
  },
  picked: { style: null, concept: null, medium: null },
};

export function seedWizard(seed) {
  if (!seed) return;
  if (seed.mode === "style") W.picked.style = seed.id;
  if (seed.mode === "concept") W.picked.concept = seed.id;
  if (seed.mode === "medium") W.picked.medium = seed.id;
  W.step = 2;
}

function findItem(kind, id) {
  const key = kind === "style" ? "styles" : kind === "concept" ? "concepts" : "media";
  return PATTERNS[key].find((x) => x.id === id);
}

/* 推荐：进入 step 2 时若未手动选则按路由填 */
function applyRoute() {
  const r = GOAL_ROUTES[W.form.goal];
  if (!W.picked.style) W.picked.style = r.style;
  if (!W.picked.concept) W.picked.concept = r.concept;
  if (!W.picked.medium) W.picked.medium = r.medium;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------------- 渲染 ---------------- */

function field(label, hint, control) {
  return `<div class="wz-field"><span class="wz-label">${label}${hint ? `<small>${hint}</small>` : ""}</span>${control}</div>`;
}

function intakeBody() {
  const f = W.form;
  const goalCards = Object.keys(GOAL_ROUTES)
    .map((g) => `<button type="button" class="wz-goal ${f.goal === g ? "on" : ""}" data-wz-goal="${g}">${GOAL_LABEL[g]}</button>`)
    .join("");
  return `<div class="wz-form">
    <div class="wz-field span2">
      <span class="wz-label">片型 / 目标<small>决定路由表给哪种 风格 + 概念 + 媒介 组合</small></span>
      <div class="wz-goal-grid">${goalCards}</div>
    </div>
    ${field("产品 / 主题", "成片讲什么", `<input type="text" data-wz-input="product" value="${esc(f.product)}" placeholder="如：Doubao 协作功能">`)}
    ${field("时长", "秒", `<select data-wz-input="duration">${[10, 15, 20, 30, 45].map((d) => `<option value="${d}" ${f.duration === d ? "selected" : ""}>${d} 秒</option>`).join("")}</select>`)}
    ${field("画幅", "", `<div class="wz-seg">${["9:16", "1:1", "16:9"].map((r) => `<button type="button" class="wz-opt ${f.ratio === r ? "on" : ""}" data-wz-ratio="${r}">${r}</button>`).join("")}</div>`)}
    ${field("参考素材", "", `<select data-wz-input="reference">${[["none", "无参考"], ["frame", "单帧参考"], ["video", "视频参考"], ["library", "自有图库"]].map(([v, l]) => `<option value="${v}" ${f.reference === v ? "selected" : ""}>${l}</option>`).join("")}</select>`)}
    ${field("品牌色", "hex，可留空", `<input type="text" data-wz-input="color" value="${esc(f.color)}" placeholder="#8ACD00">`)}
    ${field("品牌字体", "可留空", `<input type="text" data-wz-input="font" value="${esc(f.font)}" placeholder="Inter / PingFang">`)}
    ${field("音乐", "", `<select data-wz-input="music">${[["synthesize", "代码合成"], ["supply", "自备音轨"], ["none", "不要音乐"]].map(([v, l]) => `<option value="${v}" ${f.music === v ? "selected" : ""}>${l}</option>`).join("")}</select>`)}
  </div>`;
}

function pickSelect(kind, current) {
  const key = kind === "style" ? "styles" : kind === "concept" ? "concepts" : "media";
  return `<select data-wz-pick="${kind}">${PATTERNS[key].map((x) => `<option value="${x.id}" ${current === x.id ? "selected" : ""}>${x.index} · ${x.label}</option>`).join("")}</select>`;
}

function recommendCard(kind, id) {
  const item = findItem(kind, id);
  const kindLabel = { style: "视觉风格", concept: "叙事概念", medium: "媒介质感" }[kind];
  const why = item.whenToUse?.[0] || item.structure || item.drawOrder?.[0] || item.keywords?.[0] || "";
  return `<div class="wz-rec">
    <div class="wz-rec-top"><span class="wz-rec-kind">${kindLabel}</span><span class="wz-rec-index">${item.index}</span></div>
    <h3>${item.label}</h3><span class="wz-rec-en">${item.en}</span>
    <p class="wz-rec-why">${esc(why)}</p>
    <div class="wz-rec-controls">${pickSelect(kind, id)}
      <button type="button" class="btn small" data-wz-inspect="${kind}">片段详情</button></div>
  </div>`;
}

function recommendBody() {
  applyRoute();
  const p = W.picked;
  return `<div class="wz-rec-grid">
      ${recommendCard("style", p.style)}
      ${recommendCard("concept", p.concept)}
      ${recommendCard("medium", p.medium)}
    </div>
    <p class="wz-note">系统按片型「${GOAL_LABEL[W.form.goal]}」给出保底组合；可下拉改选，或点"片段详情"预览。</p>`;
}

function exportBody() {
  const files = buildFiles();
  const fileCount = Object.keys(files).length;
  const list = Object.entries(files)
    .map(
      ([path, content]) =>
        `<details class="wz-file"><summary><span class="wz-file-path">${path}</span><span class="wz-file-size">${content.length} B</span></summary><pre>${esc(content)}</pre></details>`
    )
    .join("");
  return `<div class="wz-export-head">
      <p class="wz-pkg-name">制作包：<b>${pkgName()}</b> · ${W.form.ratio} · ${W.form.duration}s · ${fileCount} 个文件</p>
      <div class="wz-export-actions">
        <button type="button" class="btn primary" data-wz-download>下载整包 zip</button>
        <button type="button" class="btn" data-wz-copy-brief>复制简报</button>
        <button type="button" class="btn" data-wz-copy-prompt>复制 prompt</button>
      </div>
    </div>
    <div class="wz-files">${list}</div>`;
}

export function wizardBody() {
  const steps = ["Intake 问卷", "推荐组合", "导出制作包"];
  const body = W.step === 1 ? intakeBody() : W.step === 2 ? recommendBody() : exportBody();
  return `<div class="page-head">
    <h1 class="h1">生成制作包 · Recipe Builder</h1>
    <p class="sub">自动产出导演简报、完整 prompt、代码脚手架；参考完整段落，明确主体与交接，再生成制作起点。</p>
  </div>
  <div class="wz-steps">
    ${steps
      .map(
        (s, i) =>
          `<div class="wz-step ${W.step === i + 1 ? "cur" : W.step > i + 1 ? "done" : ""}"><span class="wz-step-no">${i + 1}</span>${s}</div>`
      )
      .join("")}
  </div>
  <div class="wz-step-body">${body}</div>
  <div class="wz-footer">
    ${W.step > 1 ? '<button type="button" class="btn" data-wz-back>← 上一步</button>' : ""}
    ${W.step < 3 ? '<button type="button" class="btn primary" data-wz-next>下一步 →</button>' : '<button type="button" class="btn" data-wz-restart>重新开始</button>'}
  </div>`;
}

/* ---------------- 产出物 ---------------- */

function pkgName() {
  const slug = (W.form.product || "my-video")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 28);
  return slug || "my-video";
}

const REF_LABEL = { frame: "单帧参考（提取帧、只取风格）", video: "视频参考（先 ffmpeg 抽帧、逐镜分析）", library: "自有图库（写 style_guide）" };
const MUSIC_LABEL = { synthesize: "代码合成，卡点 120 BPM", supply: "自备音轨（先 librosa 测 beats）", none: "不要音乐" };

function buildBrief() {
  const f = W.form, p = W.picked;
  const s = findItem("style", p.style), c = findItem("concept", p.concept), m = findItem("medium", p.medium);
  return `# 导演简报 · ${f.product || "未命名"}

## 一句话
${f.product || "—"} · ${GOAL_LABEL[f.goal]} · ${f.duration}s · ${f.ratio}

## 三维选型
- 视觉风格：${s.index} ${s.label}（${s.en}）
- 叙事概念：${c.index} ${c.label}（${c.en}）
- 媒介质感：${m.index} ${m.label}（${m.en}）

## 参考
${f.reference === "none" ? "无外部参考（先比较 FORMA / RELAY 的交接机制，并重新推导本片方向）" : REF_LABEL[f.reference]}

## 品牌
- 强调色：${f.color || "从主题推导一个强调色"}
- 字体：${f.font || "明确选择并冻结本地字体"}
- 音乐：${MUSIC_LABEL[f.music]}

## 工作流门（不可跳过）
1. 写 style_guide / shotlist
2. 逐场景静帧 → contact sheet
3. 检查主角、状态交接、叠字、读字时间，记录具体时间点与修复
4. 用已验证的 motion-director Skill 脚手架完成渲染；技术通过不等于审美通过
`;
}

function buildPrompt() {
  const f = W.form, p = W.picked;
  const s = findItem("style", p.style), c = findItem("concept", p.concept), m = findItem("medium", p.medium);
  return `你是 ${f.duration} 秒代码动效短片的导演 / 动画 / 渲染工程师。

## 任务
为「${f.product || "[产品]"}」做一支 ${f.ratio}、${f.duration}s 的动效短片。
风格：${s.label}；叙事概念：${c.label}；媒介：${m.label}。

## 渲染契约（必须遵守）
- 影片是时间的纯函数：window.seek(t) 画出第 t 秒；不要 CSS transition / setTimeout / requestAnimationFrame（渲染时）；随机用 seeded，不要 Math.random。
- 动作按内容选择：闭式弹簧用于状态交接，匀速可用于持续路径；摄影机可保持静止。
- 每 2–4 秒有新事件；禁止：居中文字渐变、全 fade、角标、UI 发光、通用粒子。

## 流程门
先写 DIRECTION.md 和镜头表，逐镜说明主体、摄影机、状态变化、交接对象与阅读停留。
先查 registry.directorPatterns / directorGrammar / directorPerformers，确定意图、角色、Shot 和 EditEdge；再查 effects / technicalRecipes / tools 选实现。\n参考 motion-director 的 director-kit/lib/director.js、references/director-method.md；将纸片身份保持、信号路径交接等机制改写为本片内容。
先出关键静帧与 contact sheet，再审阅交接条带。记录具体错误与修复，不以自评分替代实际画面。

## 交付
final.mp4（${f.ratio}）、contact sheet、poster、README。
`;
}

function buildTasks() {
  return `# 任务清单（按顺序，每步含验收）
1. 采集素材（真实截图 / Logo），列出 assets/
2. 写 style_guide.md（调色 / 字体 / 镜头语言）
3. 写 cue-table.json（cuts / events 帧号）
4. 逐场景在 scenes/ 填内容（只填内容，不改 lib）
5. 逐场景静帧 → contact sheet
6. 审阅关键交接与 360px 读字图，修复具体问题
7. node render.mjs 全量渲染
8. 音效 / 混音（-14 LUFS），导出 final.mp4

验收：手机 360px 主信息可读、状态交接无叠字、顺播与乱序定位一致；仅需要循环时检查循环接缝。
`;
}

function buildReadme() {
  return `# ${pkgName()}
由 Recipe Builder 生成。

运行：
  npm i && node render.mjs
编辑 scenes/ 填内容，时间轴登记在 cue-table.json。
质量门：npm run gate（确定性 / 死帧 / 映射）。
`;
}

function loadScaffold() {
  if (W.scaffold) return;
  W.scaffold = {
    "index.html": tplIndex,
    "lib/motion.js": tplMotion,
    "lib/camera.js": tplCamera,
    "lib/util.js": tplUtil,
    "cue-table.json": tplCue,
    "scenes/example-scene.js": tplScene,
    "render.mjs": tplRender,
  };
}

function buildFiles() {
  const files = {
    "00-director-brief.md": buildBrief(),
    "01-master-prompt.md": buildPrompt(),
    "02-director-patterns.json": JSON.stringify(directorPatternsData.patterns,null,2),
    "03-sequence-references.json": JSON.stringify(cinematicShotsData.sequences.filter(s=>s.collection==='director').map(s=>({id:s.id,intent:s.logline,prompt:s.prompt,source:{film:s.film,start:s.sourceStart,end:s.sourceEnd},shots:s.shots,capability:s.capability})),null,2),
    "TASKS.md": buildTasks(),
    "README.md": buildReadme(),
  };
  for (const [p, c] of Object.entries(W.scaffold || {})) files[p] = c;
  return files;
}

/* ---------------- 纯 JS zip（stored，无依赖） ---------------- */

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
const enc = new TextEncoder();

function buildZip(files) {
  const entries = Object.entries(files);
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const [name, content] of entries) {
    const nameB = enc.encode(name);
    const data = enc.encode(content);
    const crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);
    lh.setUint16(8, 0, true);
    lh.setUint32(14, crc, true);
    lh.setUint32(18, data.length, true);
    lh.setUint32(22, data.length, true);
    lh.setUint16(26, nameB.length, true);
    chunks.push(new Uint8Array(lh.buffer), nameB, data);
    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true);
    cd.setUint16(4, 20, true);
    cd.setUint16(6, 20, true);
    cd.setUint32(16, crc, true);
    cd.setUint32(20, data.length, true);
    cd.setUint32(24, data.length, true);
    cd.setUint16(28, nameB.length, true);
    cd.setUint32(42, offset, true);
    central.push(new Uint8Array(cd.buffer), nameB);
    offset += 30 + nameB.length + data.length;
  }
  let cdSize = 0;
  for (const c of central) cdSize += c.length;
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(8, entries.length, true);
  eocd.setUint16(10, entries.length, true);
  eocd.setUint32(12, cdSize, true);
  eocd.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, new Uint8Array(eocd.buffer)], { type: "application/zip" });
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function copyFeedback(btn, text) {
  const p = navigator.clipboard?.writeText(text);
  if (!p) { btn.textContent = "复制失败"; return; }
  p.then(() => {
    const o = btn.textContent;
    btn.textContent = "已复制";
    setTimeout(() => (btn.textContent = o), 1300);
  }).catch(() => (btn.textContent = "复制失败"));
}

/* ---------------- 事件绑定 ---------------- */

export function bindWizard(root, ctx) {
  const rerender = () => {
    const main = document.querySelector(".main");
    if (!main) return;
    main.innerHTML = wizardBody();
    bindWizard(main, ctx);
    main.scrollTop = 0;
  };
  root.querySelectorAll("[data-wz-goal]").forEach((b) => {
    b.onclick = () => {
      W.form.goal = b.dataset.wzGoal;
      W.picked = { style: null, concept: null, medium: null };
      rerender();
    };
  });
  root.querySelectorAll("[data-wz-ratio]").forEach((b) => {
    b.onclick = () => { W.form.ratio = b.dataset.wzRatio; rerender(); };
  });
  root.querySelectorAll("[data-wz-input]").forEach((b) => {
    b.addEventListener("input", () => { W.form[b.dataset.wzInput] = b.value; });
    b.addEventListener("change", () => { W.form[b.dataset.wzInput] = b.value; });
  });
  root.querySelectorAll("[data-wz-pick]").forEach((b) => {
    b.onchange = () => { W.picked[b.dataset.wzPick] = b.value; rerender(); };
  });
  root.querySelectorAll("[data-wz-inspect]").forEach((b) => {
    b.onclick = () => ctx.inspect(b.dataset.wzInspect);
  });
  const next = root.querySelector("[data-wz-next]");
  if (next)
    next.onclick = () => {
      if (W.step === 2) loadScaffold();
      W.step += 1;
      rerender();
    };
  const back = root.querySelector("[data-wz-back]");
  if (back) back.onclick = () => { W.step -= 1; rerender(); };
  const restart = root.querySelector("[data-wz-restart]");
  if (restart)
    restart.onclick = () => {
      W.step = 1;
      W.picked = { style: null, concept: null, medium: null };
      rerender();
    };
  const dl = root.querySelector("[data-wz-download]");
  if (dl) dl.onclick = () => downloadBlob(buildZip(buildFiles()), pkgName() + ".zip");
  const cb = root.querySelector("[data-wz-copy-brief]");
  if (cb) cb.onclick = () => copyFeedback(cb, buildBrief());
  const cp = root.querySelector("[data-wz-copy-prompt]");
  if (cp) cp.onclick = () => copyFeedback(cp, buildPrompt());
}

export { GOAL_LABEL, GOAL_ROUTES, W, findItem };
