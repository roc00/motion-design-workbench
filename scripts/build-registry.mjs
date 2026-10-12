#!/usr/bin/env node
/**
 * 构建期注册表导出：把 data/ 下的文件合并成一份可直接读取的 JSON。
 * 同时做一道绑定闸门：effects.json 的 demo + demoVariant 必须能在 src/engine/ 里解析到，
 * 避免「数据里写了 clip、代码里叫 clip-path-reveal」这类静默错配。
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, "data", p), "utf8"));

const effects = read("effects.json");
const scenarios = read("scenarios.json");
const triggers = read("triggers.json");
const tools = read("tools.json");
const presets = read("presets.json");
const compositions = read("compositions.json");
const compositionScenes = read("composition-scenes.json");
const shotRecipes = read("shot-recipes.json");

/* ---------- 绑定闸门：engine -> variant 必须存在 ---------- */
const engineDir = join(root, "src", "engine");
const variantMap = new Map();
for (const file of readdirSync(engineDir)) {
  if (!file.endsWith(".js") || file === "index.js") continue;
  const name = file.replace(/\.js$/, "");
  const src = readFileSync(join(engineDir, file), "utf8");
  const m = src.match(/export\s+const\s+variants\s*=\s*\{/);
  if (!m) {
    variantMap.set(name, null);
    continue;
  }
  // 取 variants 对象体内的顶层键（缩进 2 空格的 `key(` 或 `"key"(`）
  const body = src.slice(m.index);
  const keys = new Set();
  const re = /^\s{2}(?:"([^"]+)"|([A-Za-z_$][\w$]*))\s*[(:]/gm;
  for (const mm of body.matchAll(re)) keys.add(mm[1] || mm[2]);
  variantMap.set(name, keys);
}

const missing = [];
for (const e of effects.effects) {
  const keys = variantMap.get(e.demo);
  if (!keys) {
    missing.push(`${e.id}: 找不到引擎 src/engine/${e.demo}.js 的 variants`);
    continue;
  }
  if (!keys.has(e.demoVariant)) {
    missing.push(`${e.id}: 引擎 ${e.demo} 没有变体「${e.demoVariant}」`);
  }
}
if (missing.length) {
  console.error("演示绑定校验失败：");
  for (const m of missing) console.error(`  ✗ ${m}`);
  process.exit(1);
}

const registry = {
  schemaVersion: "0.8.0",
  generatedAt: new Date().toISOString(),
  scenarioKeys: scenarios.scenarios.map((s) => s.id),
  natureLevels: scenarios.natureLevels,
  fitLevels: scenarios.fitLevels,
  production: presets.production,
  device: presets.device,
  scenarios: scenarios.scenarios,
  triggers: triggers.triggers,
  tools,
  effects: effects.effects,
  presets: presets.demos,
  shots: presets.shots,
  charts: presets.charts,
  projectProfiles: presets.production.projectProfiles || [],
  adaptedComponents: compositions.adaptedComponents,
  compositions: compositions.compositions,
  compositionContentProfiles: compositionScenes.contentProfiles,
  compositionPlans: compositionScenes.plans,
  shotRecipeSource: shotRecipes.source,
  shotRecipeCategories: shotRecipes.categories,
  shotRecipeLayers: shotRecipes.layers,
  shotRecipeIntegrationStates: shotRecipes.integrationStates,
  shotRecipeDemos: shotRecipes.demoIndex,
  shotRecipes: shotRecipes.recipes,
  directorPatterns: read("director-patterns.json").patterns,
  directorCases: read("cinematic-shots.json").sequences.filter(s=>s.collection==='director').map(s=>({id:s.id,kind:s.sequenceKind,patternId:s.mapsToCombo,snippet:s.snippet,capability:s.capability})),
  retiredPreviews: [
    ...shotRecipes.recipes.filter(r=>r.presentation.previewStatus==='retired').map(r=>({id:r.id,kind:'recipe',replacementCaseId:r.presentation.replacementCaseId})),
    ...read("cinematic-shots.json").sequences.filter(s=>s.previewStatus==='retired').map(s=>({id:s.id,kind:'sequence'})),
  ],
  directorRecipeGroups: shotRecipes.presentationGroups,
  directorGrammar: shotRecipes.recipes.filter(r => r.presentation.role === "director" && !r.performer).map(r => ({ recipeId:r.id, domain:r.presentation.domain, previewStatus:r.presentation.previewStatus })),
  directorPerformers: shotRecipes.recipes.filter(r => r.performer).map(r => ({ recipeId:r.id, previewStatus:r.presentation.previewStatus, replacementCaseId:r.presentation.replacementCaseId, ...r.performer })),
  technicalRecipes: shotRecipes.recipes.filter(r => r.presentation.role === "technical").map(r => ({ recipeId:r.id, canonicalEffectId:r.presentation.canonicalEffectId })),
  cinematicGrammar: read("cinematic-grammar.json"),
  cinematicFacets: read("cinematic-shots.json").facets,
  cinematicSequences: read("cinematic-shots.json").sequences,
};

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(join(root, "public", "registry.json"), JSON.stringify(registry, null, 2), "utf8");

const variantTotal = [...variantMap.values()].reduce((n, s) => n + (s ? s.size : 0), 0);
console.log(
  `public/registry.json 已生成 · schema ${registry.schemaVersion} · ` +
    `${registry.effects.length} 条内容 · ${registry.scenarioKeys.length} 个场景 · ` +
    `${Object.keys(registry.presets).length} 条预设 · ${Object.keys(registry.charts).length} 组图表数据 · ` +
    `${shotRecipes.recipes.length} 张常用镜头卡 · ${variantMap.size} 个引擎 / ${variantTotal} 个变体（绑定校验通过）`,
);
