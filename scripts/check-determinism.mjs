#!/usr/bin/env node
/**
 * 确定性质量门（Determinism Gate）。只用 Node 内置能力。
 *
 * FAIL（阻断，exit 1）
 *  1. 渲染核心 src/engine 下所有 .js（递归）命中 BANNED（随机/时钟/定时器/rAF/网络/动态 import），
 *     除非该行含 gate:allow 白名单标记。
 *  2. style-patterns.json 的 mapsTo 引用了不存在的 effect/combo。
 *  3. spring 进度助手不收敛（t<=0 应=0；t 足够大应≈1）。
 *
 * WARN（不阻断）
 *  4. 渲染核心出现非白名单外部 URL（默认允许 picsum.photos 与 SVG namespace）。
 *  5. presets.shots 相邻步骤间隔 > 4s（dead air / 停留阅读）。
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/* ---------- 1. 渲染核心静态扫描 ---------- */
function walk(dir) {
  const out = [];
  let ents = [];
  try {
    ents = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of ents) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name.endsWith(".js")) out.push(p);
  }
  return out;
}

const BANNED = [
  [/\bMath\.random\s*\(/, "Math.random() — 必须用 seeded(seed) 固定种子"],
  [/\bDate\.now\s*\(|\bnew\s+Date\b/, "Date.now/new Date — 渲染核心禁用时钟"],
  [/\bperformance\.now\s*\(/, "performance.now() — 渲染核心禁用"],
  [/\bsetTimeout\s*\(|\bsetInterval\s*\(/, "setTimeout/setInterval — 渲染核心禁用定时器"],
  [/\brequestAnimationFrame\s*\(/, "requestAnimationFrame — 渲染核心禁用 rAF（仅预览层允许）"],
  [/\bfetch\s*\(|\bXMLHttpRequest\b/, "fetch/XHR — 渲染路径禁止网络请求"],
  [/\bimport\s*\(/, "import() — 渲染路径禁止动态 import"],
];

const URL_OK = /picsum\.photos|w3\.org\/2000\/svg/;
const URL_RE = /https?:\/\/[^\s'"`)]+/g;

const engineDir = join(root, "src", "engine");
for (const file of [...walk(engineDir), join(root,"studio/lib/director.js"), join(root,"src/production/director-pattern.js")]) {
  const lines = readFileSync(file, "utf8").split("\n");
  const rel = relative(root, file);
  lines.forEach((line, i) => {
    const allowed = /gate:allow/.test(line);
    for (const [re, msg] of BANNED) {
      if (!allowed && re.test(line)) fail(`${rel}:${i + 1}  ${msg}`);
    }
    // 外部 URL（跳过纯注释行）
    const trimmed = line.trim();
    const isCommentLine = trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*");
    if (!isCommentLine) {
      for (const m of line.match(URL_RE) || []) {
        if (!URL_OK.test(m)) warn(`${rel}:${i + 1}  非白名单外部 URL：${m}`);
      }
    }
  });
}

/* ---------- 2. style-patterns mapsTo 存在性 ---------- */
const effects = readJson("data/effects.json").effects;
const effectIds = new Set(effects.map((e) => e.id));
const combos = readJson("data/compositions.json").compositions;
const comboIds = new Set(combos.map((c) => c.id));
const patterns = readJson("data/style-patterns.json");

for (const section of ["styles", "concepts", "media"]) {
  for (const item of patterns[section] || []) {
    for (const m of item.mapsTo || []) {
      const ref = typeof m === "object" ? m : { type: "effect", id: m };
      const set = ref.type === "combo" ? comboIds : effectIds;
      if (!set.has(ref.id)) fail(`${section}/${item.id}: mapsTo 引用不存在的 ${ref.type}「${ref.id}」`);
    }
  }
}

/* ---------- 3. spring 进度助手完备性 ---------- */
function checkSpring(mod, label) {
  const spring = mod.spring;
  if (typeof spring !== "function") {
    fail(`${label}: 未导出 spring`);
    return;
  }
  if (spring(0) !== 0) fail(`${label}: spring(0) 应为 0，实际 ${spring(0)}`);
  if (spring(-2) !== 0) fail(`${label}: spring(负数) 应为 0，实际 ${spring(-2)}`);
  // t=3s 应收敛到 ≈1（允许极轻微过冲，但必须稳定）
  const settled = spring(3);
  if (!(settled >= 1 - 1e-3 && settled <= 1.02)) {
    fail(`${label}: spring(3)=${settled} 未收敛到 1（不收敛或过冲过大）`);
  }
  // 再 seek 到更晚，必须仍稳定（不能发散）
  if (Math.abs(spring(6) - 1) > 1e-3) fail(`${label}: spring(6) 未稳定在 1`);
}
await checkSpring(await import("../src/kit.js"), "src/kit.js");
await checkSpring(await import("../templates/lib/motion.js"), "templates/lib/motion.js");

/* ---------- 5. dead air（presets.shots） ---------- */
const presets = readJson("data/presets.json");
for (const shot of presets.shots || []) {
  const ats = (shot.steps || []).map((s) => s.at).filter((a) => Number.isFinite(a));
  if (!ats.length) continue;
  const durMs = (shot.durationSec ?? 0) * 1000;
  for (let i = 1; i < ats.length; i++) {
    const gap = ats[i] - ats[i - 1];
    if (gap > 4000) warn(`${shot.id}: 步骤 ${ats[i - 1]}–${ats[i]} 间隔 ${(gap / 1000).toFixed(1)}s > 4s（可能空镜）`);
  }
  if (durMs && durMs - ats[ats.length - 1] > 4000) {
    warn(`${shot.id}: 末步骤到结束 ${((durMs - ats[ats.length - 1]) / 1000).toFixed(1)}s > 4s（可能空镜）`);
  }
}

/* ---------- 汇总 ---------- */
for (const w of warnings) console.log("⚠", w);
for (const e of errors) console.log("✗", e);
console.log("");
console.log(`Determinism Gate: ${errors.length} FAIL, ${warnings.length} WARN`);
if (errors.length) {
  process.exit(1);
}
console.log("PASS");
