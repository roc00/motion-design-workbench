/**
 * 输出层：预览、中文制作指令、结构化镜头配置，三者由同一份「当前配置」生成。
 * 具体运行值来自 data/presets.json；推荐范围来自 data/effects.json。
 */
import { resolveCanvas, resolveTimeline } from "./runtime-config.js";
import { capabilityFor } from "./production/capabilities.js";

const fmtNum = (n, digits = 0) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const SCHEMA_VERSION = "0.8.0";

const NATURE_LABEL = { effect: "效果", principle: "原理", rule: "规则" };

/** 当前配置：默认值 ⊕ 预设 ⊕ 用户在界面上的改动 */
export function effectiveConfig({ effect, preset, production, device, scenario, params = {}, chart }) {
  const p = params;
  const canvas = resolveCanvas(production, p);
  const timeline = resolveTimeline(preset.timeline || {}, p, canvas.fps);

  const content = { ...(preset.content || {}), ...(p.content || {}) };

  return {
    schemaVersion: SCHEMA_VERSION,
    configLabel: production.configLabel || "制作配置",
    configNote: production.configNote,
    effect: {
      id: effect.id,
      zh: effect.zh,
      en: effect.en,
      nature: effect.nature,
      natureLabel: NATURE_LABEL[effect.nature] || effect.nature,
      group: effect.group,
    },
    scenario: scenario ? { id: scenario.id, name: scenario.name } : null,
    canvas,
    timeline: {
      ...timeline,
      handlesInFrames: production.handlesFrames,
      handlesOutFrames: production.handlesFrames,
      totalFramesExcludingHandles: timeline.visibleFrames,
      note: "staggerMs 是相邻元素开始时间间隔；staggerSpanMs 是整组跨度。handles 单列，不计入可见镜头时长。",
    },
    endState: p.endState || endStateOf(effect),
    content,
    data: chart || null,
    device: effect.scenarios?.screen && scenario?.id === "screen" ? device : null,
    assets: assetsOf(effect, preset),
    renderLayerRecommend: effect.render,
    exampleCapability: {
      status: capabilityFor(effect.id),
      type: "frame-addressable-browser-runtime",
      seekable: true,
      layout: canvas.layoutPreset,
      reducedMotion: "static-terminal-or-short-fade",
      notes: production.configNote,
    },
    constraints: constraintsOf(effect),
    version: SCHEMA_VERSION,
  };
}

function endStateOf(effect) {
  if (effect.nature === "rule") return "静态终态：规则本身不产生画面动作，只作为检查项。";
  if (effect.demo === "chart") return "停在准确终值并保留阅读停留，不循环、不回弹。";
  if (effect.id === "feedback.counter") return "停在准确数值上，等宽数字，不抖。";
  if (effect.group === "内容进出") return "停在可见终态，不再循环。";
  return "动画播放一次后停在终态并保持；用户可重播。";
}

function assetsOf(effect, preset) {
  const out = [];
  const walk = (v, path) => {
    if (v == null) return;
    if (typeof v === "string" && /^[a-z0-9-]+$/.test(v) && path.some((k) => /seed|seeds/.test(k))) {
      out.push({ role: "image", seed: v, uri: `https://picsum.photos/seed/${v}/`, note: "固定 seed 只保证同一张图，素材仍来自网络；生产请本地化。" });
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, [...path, String(i)]));
    else if (typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x, [...path, k]));
  };
  walk(preset.content || {}, ["content"]);
  const uniq = new Map();
  for (const a of out) uniq.set(a.seed, a);
  return [...uniq.values()];
}

function constraintsOf(effect) {
  const list = [];
  if (effect.timing?.note) list.push(effect.timing.note);
  for (const a of effect.avoid || []) list.push(`避免：${a}`);
  if (effect.niche && effect.nicheNote) list.push(effect.nicheNote);
  return list;
}

/** 中文制作指令：一条可以直接交给做片子的人或 Agent 的话 */
export function buildInstruction(cfg) {
  const lines = [];
  const sc = cfg.scenario ? cfg.scenario.name : "通用";
  lines.push(
    `【${cfg.effect.zh}（${cfg.effect.en}）· ${cfg.effect.natureLabel}】场景：${sc}。`,
  );
  lines.push(
    `画布 ${cfg.canvas.width}×${cfg.canvas.height}（${cfg.canvas.format}）、${cfg.canvas.fps}fps；` +
      `动作 ${cfg.timeline.actionMs}ms（${cfg.timeline.actionFrames} 帧）` +
      (cfg.timeline.staggerMs ? `、相邻交错 ${cfg.timeline.staggerMs}ms × ${Math.max(0, cfg.timeline.staggerCount - 1)}（整组 ${cfg.timeline.staggerSpanMs}ms）` : "") +
      `、停留 ${cfg.timeline.holdMs}ms（${cfg.timeline.holdFrames} 帧）` +
      (cfg.timeline.exitMs ? `、退场 ${cfg.timeline.exitMs}ms（${cfg.timeline.exitFrames} 帧）` : "") +
      `；可见镜头共 ${cfg.timeline.visibleFrames} 帧，前后各留 ${cfg.timeline.handlesInFrames} 帧 handles（单列，不计入可见时长）。`,
  );

  const contentBits = contentToText(cfg.content);
  if (contentBits) lines.push(`内容：${contentBits}`);

  lines.push(`结束状态：${cfg.endState}`);
  lines.push(`实现：推荐渲染层 ${cfg.renderLayerRecommend}；当前能力状态为 ${cfg.exampleCapability.status}，支持按帧定位。`);

  if (cfg.constraints.length) lines.push(`约束：${cfg.constraints.slice(0, 3).join("；")}。`);
  lines.push(`提示词参考：${cfgPrompt(cfg)}`);
  return lines.join("\n");
}

function contentToText(content) {
  const pick = [];
  for (const k of ["title", "sub", "text", "word", "command", "lead", "message", "value", "label"]) {
    if (content[k] != null && content[k] !== "") pick.push(`${k}="${content[k]}"`);
  }
  for (const k of ["lines", "groups", "words", "cards", "steps"]) {
    if (Array.isArray(content[k]) && content[k].length) pick.push(`${k}=[${content[k].join(" / ")}]`);
  }
  return pick.join("，");
}

function cfgPrompt(cfg) {
  const n = cfg.content?.value != null ? `数据值 ${fmtNum(cfg.content.value)}` : "";
  return `${cfg.effect.zh}，${cfg.timeline.actionMs}ms 动作${cfg.timeline.holdMs ? ` + ${cfg.timeline.holdMs}ms 停留` : ""}${n ? `，${n}` : ""}，结束停在终态不回弹。`;
}

/** 结构化镜头配置的 JSON 文本 */
export function buildConfigJson(cfg) {
  return JSON.stringify(cfg, null, 2);
}
