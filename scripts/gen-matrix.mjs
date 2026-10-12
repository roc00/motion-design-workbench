#!/usr/bin/env node
/**
 * 从 data/*.json 生成 docs/01-场景选型矩阵.md。
 * 单一真相源是数据文件，本文档是派生产物 —— 改数据后重跑即可，不要手改生成结果。
 * 场景数量、条目数量都从注册表读取，不写死。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, "data", p), "utf8"));
const effectsFile = read("effects.json");
const scenariosFile = read("scenarios.json");
const triggers = read("triggers.json").triggers;
const presets = read("presets.json");

const effects = effectsFile.effects;
const SCEN = scenariosFile.scenarios;
const SCEN_IDS = SCEN.map((s) => s.id);
const L = { core: "首选", good: "可用", caution: "慎用", avoid: "不用" };
const KIND = { effect: "效果", principle: "原理", rule: "规则" };

const triggerName = new Map();
for (const t of triggers) {
  triggerName.set(t.id, t.zh);
  for (const a of t.aliases || []) triggerName.set(a, t.zh);
}
const triggerCell = (list) => {
  if (list.includes("all")) return "任意";
  const names = list.filter((t) => t !== "all").map((t) => triggerName.get(t) || t);
  const head = names.slice(0, 2).join("、");
  return names.length > 2 ? `${head} +${names.length - 2}` : head;
};
const ms = (id) => {
  const t = presets.demos?.[id]?.timeline;
  if (!t) return "—";
  const total = (t.actionMs || 0) + (t.holdMs || 0) + (t.exitMs || 0);
  return `${total} ms`;
};
const byKind = (k) => effects.filter((e) => e.nature === k);

const out = [];
out.push("# 01 · 场景选型矩阵");
out.push("");
out.push("> 本文件由 `scripts/gen-matrix.mjs` 从 `data/*.json` 生成，**不要手改**。改数据后执行 `npm run docs:matrix`。");
out.push("");
out.push("先按场景选类，再按条目取参数与提示词。适配度定义与默认制片参数见 [00 · 体系总览](./00-体系总览.md)。");
out.push("");
out.push(
  `当前收录 **${effects.length}** 条内容：具体效果 ${byKind("effect").length} 条、基础原理 ${byKind("principle").length} 条、通用规则 ${byKind("rule").length} 条。`,
);
out.push("原理与规则会保留演示，但**不作为任何场景的主效果推荐**——它们是参数的取值方式与约束条件，不是画面动作本身。");
out.push("");

/* ---------- 场景对照 ---------- */
out.push("## 场景对照");
out.push("");
out.push("| | " + SCEN.map((s) => s.name).join(" | ") + " |");
out.push("|---|" + SCEN.map(() => "---").join("|") + "|");
const rows = [
  ["典型镜头", (s) => s.typicalShots.slice(0, 3).join("、")],
  ["默认渲染层", (s) => "`" + s.layer + "`"],
  ["节奏", (s) => s.rhythm],
  ["时长参考", (s) => s.durationHint],
  ["首选效果数", (s) => String(effects.filter((e) => e.scenarios[s.id] === "core" && e.nature === "effect").length)],
];
for (const [label, fn] of rows) {
  out.push(`| **${label}** | ` + SCEN.map(fn).join(" | ") + " |");
}
out.push("");
out.push("---");
out.push("");

/* ---------- 每个场景 ---------- */
for (const s of SCEN) {
  out.push(`## ${s.name} \`${s.id}\``);
  out.push("");
  out.push(`**${s.subtitle}**`);
  out.push("");
  out.push(`- **目标**：${s.goal}`);
  if (s.advice) out.push(`- **一句建议**：${s.advice}`);
  out.push(`- **硬约束**：${s.constraint}`);
  out.push(`- **典型镜头**：${s.typicalShots.join(" · ")}`);
  out.push(`- **节奏**：${s.rhythm}`);
  out.push(`- **时长参考**：${s.durationHint}`);
  out.push(`- **渲染层**：\`${s.layer}\` — ${s.layerNote}`);
  out.push("");

  const pool = effects.filter((e) => e.nature === "effect");
  for (const level of ["core", "good", "caution", "avoid"]) {
    const list = pool.filter((e) => e.scenarios[s.id] === level);
    if (!list.length) continue;
    out.push(`### ${L[level]}（${level}）· ${list.length} 个`);
    out.push("");
    if (level === "avoid") {
      out.push(`> ${s.avoidReason}`);
      out.push("");
      out.push(list.map((e) => `\`${e.zh}\``).join("、"));
      out.push("");
      continue;
    }
    out.push("| 动效 | English | 分组 | 触发方式 | 建议总时长 | 一句话 | 本场景注意事项 |");
    out.push("|---|---|---|---|---|---|---|");
    for (const e of list) {
      const note = (s.notes && s.notes[e.id]) || "";
      out.push(
        `| **${e.zh}** | ${e.en} | ${e.group} | ${triggerCell(e.trigger)} | ${ms(e.id)} | ${e.core} | ${note} |`,
      );
    }
    out.push("");
  }

  const nonEffects = effects.filter((e) => e.nature !== "effect");
  if (nonEffects.length) {
    out.push(`### 原理与规则（本场景适配度，不作主效果推荐）· ${nonEffects.length} 条`);
    out.push("");
    out.push("| 条目 | 类型 | 适配度 | 说明 |");
    out.push("|---|---|---|---|");
    for (const e of nonEffects) {
      const note = (s.notes && s.notes[e.id]) || e.core;
      out.push(`| **${e.zh}** | ${KIND[e.nature]} | ${L[e.scenarios[s.id]]} | ${note} |`);
    }
    out.push("");
  }

  out.push("### 提示词模板");
  out.push("");
  out.push("```text");
  out.push(s.promptTemplate);
  out.push("```");
  out.push("");
  out.push("可直接取用的本场景首选示例：");
  out.push("");
  for (const e of pool.filter((x) => x.scenarios[s.id] === "core").slice(0, 3)) {
    out.push(`- **${e.zh}（${e.en}）**：${e.prompt}`);
  }
  out.push("");
  out.push("---");
  out.push("");
}

/* ---------- 手机镜头预设 ---------- */
out.push("## 附录 A · 手机产品演示的三个镜头预设");
out.push("");
out.push("来自 `data/presets.json`，组合现有效果，不另造重复术语。");
out.push("");
out.push("| 预设 | 时长 | 目标 | 步骤 |");
out.push("|---|---|---|---|");
for (const sh of presets.shots || []) {
  const steps = (sh.steps || [])
    .map((st) => `${st.at}ms ${st.action}${st.effect ? `（${st.effect}）` : ""}`)
    .join("<br>");
  out.push(`| **${sh.name}** \`${sh.id}\` | ${sh.durationSec}s | ${sh.goal} | ${steps} |`);
}
out.push("");

/* ---------- 图表数据 ---------- */
out.push("## 附录 B · 图表示例数据");
out.push("");
out.push("示例数据集中在 `data/presets.json` 的 `charts`，可编辑、可校验、可恢复默认。");
out.push("");
out.push("| 图表 | 结论标题 | 单位 | 时间范围 | 标记 |");
out.push("|---|---|---|---|---|");
for (const [id, c] of Object.entries(presets.charts || {})) {
  out.push(`| \`${id}\` | ${c.title} | ${c.unit} | ${c.timeRange} | ${c.mark} |`);
}
out.push("");

/* ---------- 全量附录 ---------- */
out.push(`## 附录 C · ${effects.length} 条内容全景`);
out.push("");
out.push(
  "| # | 条目 | English | 类型 | 分组 | 渲染层 | " + SCEN.map((s) => s.name).join(" | ") + " |",
);
out.push("|---|---|---|---|---|---|" + SCEN.map(() => "---").join("|") + "|");
for (const e of effects) {
  const cell = (k) => ({ core: "● 首选", good: "○ 可用", caution: "△ 慎用", avoid: "· 不用" })[e.scenarios[k]];
  out.push(
    `| ${e.no} | ${e.zh}${e.niche ? " 〔专精〕" : ""} | ${e.en} | ${KIND[e.nature]} | ${e.group} | \`${e.render}\` | ` +
      SCEN.map((s) => cell(s.id)).join(" | ") +
      " |",
  );
}
out.push("");
out.push("〔专精〕= 适用场景很窄，选型时需要额外判断。");
out.push("");

writeFileSync(join(root, "docs", "01-场景选型矩阵.md"), out.join("\n"), "utf8");
console.log(`已生成 docs/01-场景选型矩阵.md（${out.length} 行，${effects.length} 条内容，${SCEN_IDS.length} 个场景）`);
