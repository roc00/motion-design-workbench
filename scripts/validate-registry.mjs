#!/usr/bin/env node
/**
 * 注册表校验。只用 Node 内置能力，不引依赖。
 *
 * 结构性检查：
 *  1. id 唯一，编号从 1 连续到 N
 *  2. nature 合法（effect / principle / rule）
 *  3. 每条动效完整覆盖场景注册表里的全部场景，取值合法
 *  4. trigger 能解析到触发表里的 id 或别名
 *  5. 场景 notes 引用的动效存在，且不落在该场景的 avoid 上
 *  6. 每个场景至少 6 个 core/good
 *  7. 每条动效至少在某个场景是 core 或 good（除非标了 niche）
 *  8. render 落在渲染层注册表里
 *
 * 预设检查：
 *  9. 每个动效都有一条预设；没有多余预设
 * 10. 预设 timeline 字段合法，时长为正
 * 11. 手机镜头预设引用的 effect 存在，步骤时间递增且不超出总时长
 * 12. 图表数据通过各自的业务校验（占比总和、瀑布加法、折线缺失、排名全时段覆盖）
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, "data", p), "utf8"));

const effectsFile = read("effects.json");
const scenariosFile = read("scenarios.json");
const triggersFile = read("triggers.json");
const tools = read("tools.json");
const presets = read("presets.json");
const compositionsFile = read("compositions.json");
const compositionScenesFile = read("composition-scenes.json");
const shotRecipesFile = read("shot-recipes.json");

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const effects = effectsFile.effects;
const SCEN_IDS = scenariosFile.scenarios.map((s) => s.id);
const LEVELS = new Set(Object.keys(scenariosFile.fitLevels));
const NATURES = new Set(Object.keys(scenariosFile.natureLevels));
const ids = effects.map((e) => e.id);

/* ---------- 1. id / 编号 ---------- */
if (new Set(ids).size !== ids.length) fail("存在重复的动效 id");
const nos = effects.map((e) => e.no).sort((a, b) => a - b);
// 编号允许有空缺（词条删除后不改号，沿用原词典编号），但必须唯一且为正整数
if (new Set(nos).size !== nos.length) fail("存在重复的动效编号 no");
nos.forEach((n) => {
  if (!Number.isInteger(n) || n < 1) fail(`非法编号：${n}`);
});

/* ---------- 触发别名 ---------- */
const aliasToTrigger = new Map();
for (const t of triggersFile.triggers) {
  aliasToTrigger.set(t.id, t.id);
  for (const a of t.aliases || []) aliasToTrigger.set(a, t.id);
}

/* ---------- 2~8. 动效条目 ---------- */
const perScenario = Object.fromEntries(SCEN_IDS.map((s) => [s, { core: [], good: [], caution: [], avoid: [] }]));
const layerIds = new Set(tools.renderLayers.map((l) => l.id));

for (const e of effects) {
  if (!NATURES.has(e.nature)) fail(`${e.id}: 非法 nature「${e.nature}」`);
  const keys = Object.keys(e.scenarios || {});
  if (keys.length !== SCEN_IDS.length || SCEN_IDS.some((s) => !keys.includes(s))) {
    fail(`${e.id}: scenarios 未完整覆盖 ${SCEN_IDS.join("/")}`);
  }
  for (const [k, v] of Object.entries(e.scenarios || {})) {
    if (!SCEN_IDS.includes(k)) fail(`${e.id}: 未知场景键 ${k}`);
    if (!LEVELS.has(v)) fail(`${e.id}.${k}: 非法适配度 ${v}`);
    else if (perScenario[k]) perScenario[k][v].push(e.id);
  }
  for (const t of e.trigger || []) {
    if (t !== "all" && !aliasToTrigger.has(t)) fail(`${e.id}: 未知触发方式 ${t}`);
  }
  if (!e.prompt || e.prompt.length < 20) fail(`${e.id}: prompt 缺失或过短`);
  if (!layerIds.has(e.render)) fail(`${e.id}: 未知渲染层 ${e.render}`);
  if (e.nature === "effect") {
    const vals = Object.values(e.scenarios || {});
    if (!vals.includes("core") && !vals.includes("good") && !e.niche) {
      fail(`${e.id}: 四个场景均无 core/good，且未标记 niche`);
    }
  }
  if (e.nature === "rule") {
    if (!e.scenarios || Object.values(e.scenarios).every((v) => v !== "core")) {
      warn(`${e.id}: 规则类条目没有任何场景标 core（若是有意的可忽略）`);
    }
  }
}

/* ---------- 5. 场景 notes ----------
   notes 说明「在本场景使用（或不使用）该动效时要说清的一点」。
   允许落在 core/good/caution 上（使用注意），也允许落在 avoid 上（说明为什么不用），
   但不允许引用不存在的动效。 */
for (const s of scenariosFile.scenarios) {
  for (const id of Object.keys(s.notes || {})) {
    const target = effects.find((e) => e.id === id);
    if (!target) fail(`scenarios/${s.id}.notes: 未知动效 ${id}`);
    else if (target.scenarios[s.id] === "avoid" && String(s.notes[id]).length < 8) {
      warn(`scenarios/${s.id}.notes.${id}: 该动效在此场景标为 avoid，建议把不用的理由写清楚`);
    }
  }
}

/* ---------- 6. 场景选型数量 ---------- */
for (const s of SCEN_IDS) {
  const usable = perScenario[s].core.length + perScenario[s].good.length;
  if (usable < 6) fail(`场景 ${s} 只有 ${usable} 个 core/good 动效，选型表太空`);
}

/* ---------- 9~11. 预设 ---------- */
const demoPresets = presets.demos || {};
const presetIds = Object.keys(demoPresets);
for (const id of ids) if (!demoPresets[id]) fail(`presets.demos 缺少 ${id}`);
for (const id of presetIds) if (!ids.includes(id)) fail(`presets.demos 有多余条目 ${id}`);

for (const [id, p] of Object.entries(demoPresets)) {
  const t = p.timeline || {};
  for (const k of ["actionMs", "holdMs", "exitMs"]) {
    if (typeof t[k] !== "number" || !Number.isFinite(t[k])) fail(`presets/${id}.timeline.${k}: 必须是数字`);
    else if (t[k] < 0) fail(`presets/${id}.timeline.${k}: 不能为负`);
  }
  if (t.staggerMs != null && (!Number.isFinite(t.staggerMs) || t.staggerMs < 0)) {
    fail(`presets/${id}.timeline.staggerMs: 必须是 >=0 的数字`);
  }
  if (t.staggerMs > 0 && (!Number.isInteger(t.staggerCount) || t.staggerCount < 2)) {
    fail(`presets/${id}.timeline.staggerCount: 使用交错时必须明确 >=2 的元素数`);
  }
  if ((t.actionMs || 0) + (t.holdMs || 0) + (t.exitMs || 0) <= 0) fail(`presets/${id}: 总时长为 0`);
  if (!p.content || typeof p.content !== "object") fail(`presets/${id}.content: 必须是对象`);
}

for (const format of presets.production.formats || []) {
  if (!(format.width > 0) || !(format.height > 0) || !format.layoutPreset) {
    fail(`production.formats/${format.id}: 需要正数尺寸与 layoutPreset`);
  }
}
for (const profile of presets.production.projectProfiles || []) {
  if (!profile.id || !profile.name || !(profile.width > 0) || !(profile.height > 0) || !(profile.fps > 0)) {
    fail(`production.projectProfiles: 项目预设字段不完整`);
  }
}

/* ---------- 组合镜头 ---------- */
const compositionIds = new Set();
const compositionPurposeIds = new Set((compositionsFile.facets?.purposes || []).map((item) => item.id));
const compositionContentIds = new Set((compositionsFile.facets?.contentTypes || []).map((item) => item.id));
const compositionFormats = new Set(compositionsFile.facets?.formats || []);
const compositionCapabilities = new Set(compositionsFile.facets?.capabilities || []);
for (const component of compositionsFile.adaptedComponents || []) {
  if (!ids.includes(component.effectId)) fail(`adaptedComponents/${component.id}: 未知 effectId ${component.effectId}`);
}
for (const combo of compositionsFile.compositions || []) {
  if (compositionIds.has(combo.id)) fail(`组合镜头 id 重复：${combo.id}`);
  compositionIds.add(combo.id);
  if (!(combo.durationMs > 0) || !(combo.readHoldMs >= 0)) fail(`compositions/${combo.id}: 时长非法`);
  if (!combo.primaryAction || !combo.sharedElement) fail(`compositions/${combo.id}: 缺少主动作或共享元素`);
  if (!compositionPurposeIds.has(combo.purposeId)) fail(`compositions/${combo.id}: 未知表达目的 ${combo.purposeId}`);
  if (!compositionCapabilities.has(combo.capability)) fail(`compositions/${combo.id}: 未知能力状态 ${combo.capability}`);
  if (!combo.audienceTakeaway || !combo.goal) fail(`compositions/${combo.id}: 缺少表达目标或观众理解`);
  if (!Array.isArray(combo.contentTypes) || !combo.contentTypes.length || combo.contentTypes.some((id) => !compositionContentIds.has(id))) {
    fail(`compositions/${combo.id}: 内容类型缺失或未知`);
  }
  if (!Array.isArray(combo.formats) || !combo.formats.length || combo.formats.some((id) => !compositionFormats.has(id))) {
    fail(`compositions/${combo.id}: 画幅能力缺失或未知`);
  }
  if (!combo.conditions?.requires?.length || !combo.conditions?.avoidWhen?.length) fail(`compositions/${combo.id}: 缺少使用前提或不适用条件`);
  for (const key of ["subject", "region", "framing", "viewChange", "context"]) {
    if (!combo.attention?.[key]) fail(`compositions/${combo.id}: attention.${key} 缺失`);
  }
  for (const key of ["relationship", "entryState", "exitState", "preferredSeam", "preserve"]) {
    if (!combo.continuity?.[key] || (key === "preserve" && !combo.continuity[key].length)) fail(`compositions/${combo.id}: continuity.${key} 缺失`);
  }
  if (!combo.evidence?.basis?.length || !combo.evidence?.implementation || !combo.evidence?.validation) fail(`compositions/${combo.id}: 依据或验证状态缺失`);
  if (!combo.failureExample) fail(`compositions/${combo.id}: 缺少失败例`);
  if (!Array.isArray(combo.keyframes) || combo.keyframes.length < 2 || combo.keyframes.length > 6) fail(`compositions/${combo.id}: 需要 2–6 个代表时刻`);
  for (const keyframe of combo.keyframes || []) {
    if (!keyframe.label || !(keyframe.atMs >= 0) || keyframe.atMs > combo.durationMs) fail(`compositions/${combo.id}: 关键帧非法`);
  }
  for (const beat of combo.beats || []) {
    if (!beat.id || !beat.label || !beat.action || !(beat.fromMs >= 0) || !(beat.toMs > beat.fromMs) || beat.toMs > combo.durationMs) {
      fail(`compositions/${combo.id}: 动作节拍非法`);
    }
  }
  for (const track of combo.tracks || []) {
    if (!(track.fromMs >= 0) || !(track.toMs > track.fromMs) || track.toMs > combo.durationMs) {
      fail(`compositions/${combo.id}/${track.role}: 时间区间非法`);
    }
  }
  const hold = (combo.tracks || []).find((track) => track.role === "readHold");
  if (!hold || hold.toMs - hold.fromMs !== combo.readHoldMs) fail(`compositions/${combo.id}: readHold 与 readHoldMs 不一致`);

  const plan = compositionScenesFile.plans?.[combo.id];
  if (!plan?.sceneType || !plan?.coverageStrategy || !plan?.cutDecision) fail(`compositionPlans/${combo.id}: 场景计划字段不完整`);
  if (!Array.isArray(plan?.shots) || !plan.shots.length) fail(`compositionPlans/${combo.id}: 至少需要一个镜头`);
  const planShotIds = new Set();
  for (const shot of plan?.shots || []) {
    if (!shot.id || planShotIds.has(shot.id)) fail(`compositionPlans/${combo.id}: 镜头 id 缺失或重复`);
    planShotIds.add(shot.id);
    if (!(shot.fromMs >= 0) || !(shot.toMs > shot.fromMs) || shot.toMs > combo.durationMs) fail(`compositionPlans/${combo.id}/${shot.id}: 镜头时间非法`);
    for (const key of ["purpose", "coverageRole", "primarySubject", "framing", "cameraMotion", "entryState", "exitState"]) {
      if (!shot[key]) fail(`compositionPlans/${combo.id}/${shot.id}: ${key} 缺失`);
    }
    if (!Array.isArray(shot.contentMotion)) fail(`compositionPlans/${combo.id}/${shot.id}: contentMotion 必须是数组`);
  }
  for (const edge of plan?.editEdges || []) {
    if (!planShotIds.has(edge.from) || !planShotIds.has(edge.to) || !edge.reason || !edge.relation) fail(`compositionPlans/${combo.id}: editEdge 非法`);
  }
  if (plan?.cutDecision === "within-shot" && (plan.editEdges?.length || plan.shots?.length !== 1)) fail(`compositionPlans/${combo.id}: 一镜内方案不能包含切镜边`);
}

for (const id of Object.keys(compositionScenesFile.plans || {})) {
  if (!compositionIds.has(id)) fail(`compositionPlans: 未知组合 ${id}`);
}
for (const [profileId, content] of Object.entries(compositionScenesFile.contentProfiles || {})) {
  for (const key of ["eyebrow", "inputTitle", "query", "response", "resultKicker", "resultMain", "taskName", "selectedItem", "detailTitle"]) {
    if (!content[key]) fail(`compositionContentProfiles/${profileId}: ${key} 缺失`);
  }
  if (!Array.isArray(content.overviewItems) || !content.overviewItems.includes(content.selectedItem)) fail(`compositionContentProfiles/${profileId}: selectedItem 必须存在于 overviewItems`);
}

/* ---------- 常用镜头语言卡 ---------- */
const shotRecipeIds = new Set();
const shotRecipePaths = new Set();
const shotRecipeCategoryIds = new Set((shotRecipesFile.categories || []).map((item) => item.id));
const shotRecipeLayerIds = new Set((shotRecipesFile.layers || []).map((item) => item.id));
const shotRecipeStateIds = new Set((shotRecipesFile.integrationStates || []).map((item) => item.id));
const shotObjectIds = new Set((shotRecipesFile.objects || []).map((item) => item.id));
const shotUseIds = new Set((shotRecipesFile.narrativeUses || []).map((item) => item.id));
const SHOT_STATUS_KEYS = { source: new Set(["verified", "pending"]), demo: new Set(["verified", "needs-calibration"]), production: new Set(["ready", "planned", "blocked"]) };
const SHOT_SHOT_KEYS = ["intent", "subject", "camera", "subjectAction", "timing", "seams", "constraints"];
const shotRecipeDemos = shotRecipesFile.demoIndex || {};
const expectedShotCards = shotRecipesFile.recipes?.length || 0;
if (!expectedShotCards || shotRecipesFile.source?.selectedCards !== expectedShotCards) {
  fail(`shotRecipes: selectedCards 声明 ${shotRecipesFile.source?.selectedCards} 与 recipes 实际数量 ${expectedShotCards} 不一致`);
}
if (shotRecipesFile.source?.totalCards !== 157 || !shotRecipesFile.source?.commit) {
  fail("shotRecipes.source: 需要固定 157 张来源总量和 commit");
}
for (const recipe of shotRecipesFile.recipes || []) {
  if (!recipe.id || shotRecipeIds.has(recipe.id)) fail(`shotRecipes: id 缺失或重复 ${recipe.id}`);
  shotRecipeIds.add(recipe.id);
  if (!recipe.sourcePath || shotRecipePaths.has(recipe.sourcePath)) fail(`shotRecipes/${recipe.id}: sourcePath 缺失或重复`);
  shotRecipePaths.add(recipe.sourcePath);
  if (!shotRecipeCategoryIds.has(recipe.sourceCategory)) fail(`shotRecipes/${recipe.id}: 未知来源类型 ${recipe.sourceCategory}`);
  if (!shotRecipeStateIds.has(recipe.implementationState)) fail(`shotRecipes/${recipe.id}: 未知接入状态 ${recipe.implementationState}`);
  for (const layer of recipe.layers || []) if (!shotRecipeLayerIds.has(layer)) fail(`shotRecipes/${recipe.id}: 未知层级 ${layer}`);
  if (!recipe.layers?.length || !recipe.patternIds?.length || !recipe.effectIds?.length) fail(`shotRecipes/${recipe.id}: 层级、配方或能力映射为空`);
  for (const patternId of recipe.patternIds || []) if (!compositionIds.has(patternId)) fail(`shotRecipes/${recipe.id}: 未知配方 ${patternId}`);
  for (const effectId of recipe.effectIds || []) if (!ids.includes(effectId)) fail(`shotRecipes/${recipe.id}: 未知 effectId ${effectId}`);
  for (const key of ["name", "nameZh", "summary", "applicable", "duration", "energy", "selectionReason", "avoidWhen"]) {
    if (!recipe[key]) fail(`shotRecipes/${recipe.id}: ${key} 缺失`);
  }
  if (!shotObjectIds.has(recipe.object)) fail(`shotRecipes/${recipe.id}: 未知作用对象 ${recipe.object}`);
  if (!shotUseIds.has(recipe.narrativeUse)) fail(`shotRecipes/${recipe.id}: 未知叙事用途 ${recipe.narrativeUse}`);
  if (!recipe.patternUsage) fail(`shotRecipes/${recipe.id}: patternUsage 缺失`);
  for (const axis of Object.keys(SHOT_STATUS_KEYS)) {
    if (!recipe.status?.[axis] || !SHOT_STATUS_KEYS[axis].has(recipe.status[axis])) fail(`shotRecipes/${recipe.id}: 状态 ${axis} 非法`);
  }
  for (const key of SHOT_SHOT_KEYS) {
    if (!recipe.shot?.[key]) fail(`shotRecipes/${recipe.id}: 制作描述 shot.${key} 缺失`);
  }
  const demo = shotRecipeDemos[recipe.id];
  if (!demo?.previewKind || !demo?.description || !Array.isArray(demo?.beats) || demo.beats.length !== 3) {
    fail(`shotRecipes/${recipe.id}: 演示索引需要 previewKind、description 和 3 个 beats`);
  }
  if (!(demo.durationMs > 0)) fail(`shotRecipes/${recipe.id}: 演示时长必须为正`);
  let lastAt = -1;
  for (const beat of demo.beats) {
    if (!beat?.label || typeof beat.at !== "number" || beat.at <= 0 || beat.at > 1 || beat.at <= lastAt) {
      fail(`shotRecipes/${recipe.id}: beats 需为 {label, at} 且 at 严格递增、落在 (0,1]`);
    }
    lastAt = beat.at;
  }
}
for (const id of Object.keys(shotRecipeDemos)) if (!shotRecipeIds.has(id)) fail(`shotRecipeDemos: 未知镜头卡 ${id}`);
// Presentation responsibility is independent of source taxonomy.
const directorGroups=new Set(shotRecipesFile.presentationGroups.map(g=>g.id));
for(const recipe of shotRecipesFile.recipes){
  const placement=recipe.presentation;
  if(!placement || !["director","technical"].includes(placement.role))fail(`${recipe.id}: 缺少导演/技术职责`);
  else if(placement.role==="technical"){
    if(!ids.includes(placement.canonicalEffectId))fail(`${recipe.id}: 技术做法没有有效词典入口`);
    if(!recipe.effectIds.includes(placement.canonicalEffectId))fail(`${recipe.id}: 词典入口不在关联能力中`);
    if(recipe.performer)fail(`${recipe.id}: 技术做法不能同时登记为导演角色`);
  }else if(!directorGroups.has(placement.domain))fail(`${recipe.id}: 导演维度不存在`);
}
const directorPatterns=read("director-patterns.json").patterns;
const patternIds=new Set();
for(const pattern of directorPatterns){
  if(patternIds.has(pattern.id) || !compositionIds.has(pattern.id))fail(`${pattern.id}: 叙事结构 ID 重复或缺少适配记录`);
  patternIds.add(pattern.id);
  let previous=0;
  for(const shot of pattern.shots){
    if(shot.fromMs!==previous || shot.toMs<=shot.fromMs || !shot.audience || !shot.camera)fail(`${pattern.id}/${shot.id}: 导演时间轨或观众理解缺失`);
    previous=shot.toMs;
  }
  if(previous!==pattern.durationMs || pattern.editEdges.length!==pattern.shots.length-1)fail(`${pattern.id}: 时间或交接覆盖不完整`);
  for(let i=0;i<pattern.editEdges.length;i++){
    const edge=pattern.editEdges[i];
    if(edge.from!==pattern.shots[i].id || edge.to!==pattern.shots[i+1].id || !edge.reason || !edge.preserve.length)fail(`${pattern.id}: EditEdge 与镜头不匹配`);
  }
  if(pattern.capability!=="browser-demo")fail(`${pattern.id}: 当前结构演示不得提前声称生产已验证`);
}
for(const tool of tools.implementations){
  if(!tools.groups.some(g=>g.id===tool.group) || !tool.seekRule || !tool.status)fail(`${tool.id}: 工具分组或逐帧合同缺失`);
  if(tool.renderLayers.some(id=>!layerIds.has(id)))fail(`${tool.id}: 引用了不存在的渲染层`);
}
if (Object.keys(shotRecipeDemos).length !== shotRecipeIds.size) fail("shotRecipeDemos: 必须与镜头卡一一对应");
// previewKind 必须有专属 SVG 渲染器：任何卡都不允许退回静态占位动画
const shotPreviewSource = readFileSync(join(root, "src/production/shot-recipe-preview.js"), "utf8");
const renderedKinds = new Set([...shotPreviewSource.matchAll(/case\s+"([\w-]+)":/g)].map((m) => m[1]));
for (const dk of Object.values(shotRecipeDemos)) {
  if (!renderedKinds.has(dk.previewKind)) fail(`shotRecipes 演示 ${dk.previewKind} 缺少专属渲染器（会退回静态占位）`);
}
for (const rk of renderedKinds) {
  if (!Object.values(shotRecipeDemos).some((d) => d.previewKind === rk)) fail(`shot-recipe-preview.js 渲染器 ${rk} 没有对应 demoIndex`);
}

const shotIds = new Set();
for (const s of presets.shots || []) {
  if (shotIds.has(s.id)) fail(`镜头预设 id 重复：${s.id}`);
  shotIds.add(s.id);
  if (!SCEN_IDS.includes(s.scenario)) fail(`presets.shots/${s.id}: 未知场景 ${s.scenario}`);
  let last = -1;
  for (const st of s.steps || []) {
    if (typeof st.at !== "number" || st.at <= last) fail(`presets.shots/${s.id}: 步骤时间必须严格递增（${st.at}）`);
    last = st.at;
    if (st.effect && !ids.includes(st.effect)) fail(`presets.shots/${s.id}: 未知动效 ${st.effect}`);
  }
  const totalMs = (s.durationSec || 0) * 1000;
  if (last > totalMs) fail(`presets.shots/${s.id}: 最后一步 ${last}ms 超出总时长 ${totalMs}ms`);
  if (!(s.durationSec > 0)) fail(`presets.shots/${s.id}: durationSec 必须为正`);
  if (!s.device || !(s.device.innerWidth > 0) || !(s.device.innerHeight > 0)) {
    fail(`presets.shots/${s.id}: device 内屏尺寸缺失`);
  }
}

/* ---------- 12. 图表数据 ---------- */
const chartIds = effects.filter((e) => e.demo === "chart").map((e) => e.id);
const charts = presets.charts || {};
const isNum = (v) => typeof v === "number" && Number.isFinite(v);

for (const id of chartIds) {
  const c = charts[id];
  if (!c) {
    fail(`presets.charts 缺少 ${id}`);
    continue;
  }
  for (const k of ["mark", "title", "unit", "timeRange"]) {
    if (!c[k]) fail(`charts/${id}: 缺少 ${k}`);
  }
  if (c.mark !== "示例数据") warn(`charts/${id}: mark 建议为「示例数据」，当前为「${c.mark}」`);

  switch (id) {
    case "chart.bar-compare": {
      if (!Array.isArray(c.data) || !c.data.length) fail(`charts/${id}: data 不能为空`);
      else {
        for (const d of c.data) {
          if (!d.label) fail(`charts/${id}: 数据项缺少 label`);
          if (!isNum(d.value)) fail(`charts/${id}: ${d.label} 的 value 必须是有限数字`);
        }
        if (c.highlight && !c.data.some((d) => d.label === c.highlight)) {
          fail(`charts/${id}: highlight「${c.highlight}」不在 data 里`);
        }
      }
      break;
    }
    case "chart.line-trend": {
      if (!Array.isArray(c.labels) || !Array.isArray(c.values)) fail(`charts/${id}: 需要 labels 与 values`);
      else {
        if (c.labels.length !== c.values.length) {
          fail(`charts/${id}: labels(${c.labels.length}) 与 values(${c.values.length}) 长度不一致`);
        }
        if (!c.values.some((v) => isNum(v))) fail(`charts/${id}: 至少要有一个非缺失值`);
        c.values.forEach((v, i) => {
          if (v !== null && !isNum(v)) fail(`charts/${id}: values[${i}] 必须是数字或 null`);
        });
      }
      for (const a of c.annotations || []) {
        if (!isNum(a.index) || a.index < 0 || a.index >= (c.values || []).length) {
          fail(`charts/${id}: 标注索引越界 ${a.index}`);
        }
      }
      break;
    }
    case "chart.share": {
      if (!Array.isArray(c.segments) || !c.segments.length) fail(`charts/${id}: segments 不能为空`);
      else {
        const sum = c.segments.reduce((n, s) => n + (isNum(s.value) ? s.value : NaN), 0);
        for (const s of c.segments) {
          if (!s.label) fail(`charts/${id}: 段缺少 label`);
          if (!isNum(s.value)) fail(`charts/${id}: 段 ${s.label} 的 value 必须是有限数字`);
          else if (s.value < 0) fail(`charts/${id}: 段 ${s.label} 为负值，占比不允许为负`);
        }
        if (isNum(sum) && sum <= 0) fail(`charts/${id}: 总和必须大于 0`);
        if (isNum(sum) && Math.abs(sum - 100) > 0.5) {
          warn(`charts/${id}: 总和为 ${sum}，不是 100；界面会按原值展示而不是静默归一化`);
        }
      }
      break;
    }
    case "chart.before-after": {
      for (const k of ["before", "after"]) {
        if (!c[k] || !isNum(c[k].value)) fail(`charts/${id}: ${k}.value 必须是有限数字`);
      }
      if (isNum(c.before?.value) && isNum(c.after?.value) && c.before.value === c.after.value) {
        warn(`charts/${id}: 前后值相同，差值会是 0`);
      }
      break;
    }
    case "chart.waterfall": {
      if (!isNum(c.start?.value) || !isNum(c.end?.value)) fail(`charts/${id}: start / end 必须是有限数字`);
      if (!Array.isArray(c.items) || !c.items.length) fail(`charts/${id}: items 不能为空`);
      else {
        for (const it of c.items) {
          if (!it.label) fail(`charts/${id}: 项缺少 label`);
          if (!isNum(it.delta)) fail(`charts/${id}: 项 ${it.label} 的 delta 必须是有限数字`);
        }
        const calc = c.start.value + c.items.reduce((n, it) => n + it.delta, 0);
        if (isNum(calc) && Math.abs(calc - c.end.value) > 0.01) {
          fail(`charts/${id}: 起点(${c.start.value}) + 各项增减(${calc - c.start.value}) = ${calc}，与终点 ${c.end.value} 不一致`);
        }
      }
      break;
    }
    case "chart.rank-race": {
      if (!Array.isArray(c.entities) || !c.entities.length) fail(`charts/${id}: entities 不能为空`);
      if (!Array.isArray(c.frames) || c.frames.length < 2) fail(`charts/${id}: 至少需要两帧`);
      const names = (c.entities || []).map((e) => e.name);
      if (new Set(names).size !== names.length) fail(`charts/${id}: 实体名重复`);
      const colors = (c.entities || []).map((e) => e.color);
      if (new Set(colors).size !== colors.length) fail(`charts/${id}: 实体颜色必须唯一（排名变化靠颜色识别实体）`);
      for (const f of c.frames || []) {
        if (!f.t) fail(`charts/${id}: 帧缺少时间标签`);
        for (const n of names) {
          const v = f.values ? f.values[n] : undefined;
          if (!isNum(v)) fail(`charts/${id}: 帧 ${f.t} 缺少实体 ${n} 的数值（全时段必须覆盖同一批实体）`);
        }
      }
      break;
    }
    default:
      warn(`charts/${id}: 没有对应的数据校验规则`);
  }
}

/* ---------- 制作参考合同：时间范围与实际预览必须一致 ---------- */
const sequences = read("cinematic-shots.json").sequences;
const sequenceIds = new Set();
for (const seq of sequences) {
  if (sequenceIds.has(seq.id)) fail(`镜头组合参考 id 重复：${seq.id}`);
  sequenceIds.add(seq.id);
  if (!compositionIds.has(seq.mapsToCombo)) fail(`${seq.id}: 映射配方不存在`);
  if (!existsSync(join(root, "snippets", `${seq.snippet}.html`))) fail(`${seq.id}: 实际预览文件缺失`);
  if (seq.collection !== "director") continue;
  if (Math.abs((seq.sourceEnd-seq.sourceStart)*1000-seq.durationMs)>.01) fail(`${seq.id}: 源时间与时长不一致`);
  let previous=0;
  for (const shot of seq.shots) {
    if (shot.fromMs !== previous || shot.toMs <= shot.fromMs) fail(`${seq.id}/${shot.id}: 时间轨有空隙、重叠或倒置`);
    previous=shot.toMs;
  }
  if (previous !== seq.durationMs) fail(`${seq.id}: 最后一段未覆盖到结束`);
  if (!seq.useWhen || !seq.avoidWhen || !seq.renderModel || !seq.prompt) fail(`${seq.id}: 缺少制作说明或实现边界`);
}

/* ---------- 输出 ---------- */
const counts = effects.reduce((acc, e) => ((acc[e.nature] = (acc[e.nature] || 0) + 1), acc), {});
console.log(
  `动效 ${effects.length} 个（effect ${counts.effect || 0} · principle ${counts.principle || 0} · rule ${counts.rule || 0}）` +
    ` · 触发 ${triggersFile.triggers.length} 种 · 工具 ${tools.implementations.length} 种 · 场景 ${SCEN_IDS.length} 个`,
);
for (const s of SCEN_IDS) {
  const d = perScenario[s];
  console.log(
    `  ${s.padEnd(7)} core ${String(d.core.length).padStart(2)} · good ${String(d.good.length).padStart(2)} · caution ${String(d.caution.length).padStart(2)} · avoid ${String(d.avoid.length).padStart(2)}`,
  );
}
console.log(`预设 ${presetIds.length} 条 · 手机镜头 ${shotIds.size} 个 · 图表数据 ${Object.keys(charts).length} 组`);
console.log(`组合镜头 ${compositionIds.size} 个 · 常用镜头卡 ${shotRecipeIds.size} 张 · 生产适配组件 ${(compositionsFile.adaptedComponents || []).length} 个 · 外部案例 ${effects.reduce((n, e) => n + (e.cases?.length || 0), 0)} 个`);
console.log(`niche 专精动效 ${effects.filter((e) => e.niche).length} 个`);

if (warnings.length) {
  console.log("\n警告：");
  for (const w of warnings) console.log(`  · ${w}`);
}
if (errors.length) {
  console.error("\n校验失败：");
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log("\n校验通过。");
