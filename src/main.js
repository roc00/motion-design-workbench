import "@fontsource-variable/inter";
import "./styles/main.css";
import effectsData from "../data/effects.json";
import scenariosData from "../data/scenarios.json";
import triggersData from "../data/triggers.json";
import toolsData from "../data/tools.json";
import presetsData from "../data/presets.json";
import compositionsData from "../data/compositions.json";
import compositionScenesData from "../data/composition-scenes.json";
import shotRecipesData from "../data/shot-recipes.json";
import stylePatternsData from "../data/style-patterns.json";
import cinematicShotsData from "../data/cinematic-shots.json";
import cinematicGrammarData from "../data/cinematic-grammar.json";
import directorPatternsData from "../data/director-patterns.json";
import {mountDirectorPattern, directorMoment} from "./production/director-pattern.js";
import { wizardBody, bindWizard, seedWizard } from "./wizard.js";
import { mountDemo, variantCount } from "./engine/index.js";
import { GROUP_COLORS, NATURE_LABEL, prefersReduced, fmtMs } from "./kit.js";
import { effectiveConfig, buildInstruction, buildConfigJson, SCHEMA_VERSION } from "./output.js";
import { runtimePreset } from "./runtime-config.js";
import { validateChart } from "./chart-rules.js";
import { mountShotRecipePreview, renderShotRecipeSvg } from "./production/shot-recipe-preview.js";
import { CAPABILITY_LABEL, capabilityFor } from "./production/capabilities.js";

/* ------------------------------------------------------------------ */
/* 数据                                                                */
/* ------------------------------------------------------------------ */

const EFFECTS = effectsData.effects;
const SCENARIOS = scenariosData.scenarios;
const TRIGGERS = triggersData.triggers;
const TOOLS = toolsData;
const PRESETS = presetsData;
const PRODUCTION = presetsData.production;
const DEVICE = presetsData.device;
const COMPOSITIONS = compositionsData.compositions;
const COMPOSITION_PLANS = compositionScenesData.plans;
const SHOT_RECIPES = shotRecipesData.recipes;
const DIRECTOR_PATTERNS = directorPatternsData.patterns;
const directorPatternById = new Map(DIRECTOR_PATTERNS.map(p=>[p.id,p]));
const DIRECTOR_RECIPES = SHOT_RECIPES.filter(r=>r.presentation?.role==='director');
const TECHNICAL_RECIPES = SHOT_RECIPES.filter(r=>r.presentation?.role==='technical');
const SHOT_RECIPE_CATEGORIES = shotRecipesData.categories;
const SHOT_RECIPE_LAYERS = shotRecipesData.layers;
const SHOT_RECIPE_STATES = shotRecipesData.integrationStates;
const SHOT_RECIPE_OBJECTS = shotRecipesData.objects;
const SHOT_RECIPE_USES = shotRecipesData.narrativeUses;
const SHOT_RECIPE_SOURCE = shotRecipesData.source;
const VIDEO_SOURCE = SHOT_RECIPE_SOURCE.videoSource || null;
const CINE_SEQS = cinematicShotsData.sequences;
const CINE_GRAMMAR = cinematicGrammarData;
const CINE_FACETS = cinematicShotsData.facets;
const isVideoRecipe = (recipe) => Boolean(VIDEO_SOURCE && typeof recipe.sourcePath === "string" && recipe.sourcePath.startsWith("video-analysis/"));
const SHOT_TAG_SHORT = { "仓库模式·本批视频未覆盖": "本批未覆盖", "稀有语法·本批仅 1 例": "稀有·1例", "接缝词典·参考卡": "参考卡" };
const shotTagList = (recipe) => (Array.isArray(recipe.tags) ? recipe.tags : []);
const shotTagClass = (tag) => (tag.includes("未覆盖") ? "tag-uncovered" : tag.includes("稀有") ? "tag-rare" : "tag-ref");
const shotTagChips = (recipe, short = false) => shotTagList(recipe).map((tag) => `<span class="shot-chip ${shotTagClass(tag)}">${esc(short ? (SHOT_TAG_SHORT[tag] || tag) : tag)}</span>`).join("");
const SHOT_RECIPE_DEMOS = shotRecipesData.demoIndex;

const effectById = new Map(EFFECTS.map((e) => [e.id, e]));
const scenarioById = new Map(SCENARIOS.map((s) => [s.id, s]));
const triggerById = new Map();
for (const t of TRIGGERS) {
  triggerById.set(t.id, t);
  for (const a of t.aliases || []) triggerById.set(a, t);
}
const layerById = new Map(TOOLS.renderLayers.map((l) => [l.id, l]));
const compositionById = new Map(COMPOSITIONS.map((item) => [item.id, item]));
const shotCategoryById = new Map(SHOT_RECIPE_CATEGORIES.map((item) => [item.id, item]));
const shotLayerById = new Map(SHOT_RECIPE_LAYERS.map((item) => [item.id, item]));
const shotStateById = new Map(SHOT_RECIPE_STATES.map((item) => [item.id, item]));
const shotObjectById = new Map(SHOT_RECIPE_OBJECTS.map((item) => [item.id, item]));
const shotUseById = new Map(SHOT_RECIPE_USES.map((item) => [item.id, item]));
const GROUPS = [...new Set(EFFECTS.map((e) => e.group))];
const groupColor = (g) => GROUP_COLORS[g] || "#8acd00";
const presetOf = (id) => PRESETS.demos[id] || { still: 0.55, content: {}, timeline: {} };
const FIT_LABEL = { core: "首选", good: "可用", caution: "慎用", avoid: "不用" };
const FIT_VAR = { core: "--fit-core", good: "--fit-good", caution: "--fit-caution", avoid: "--fit-avoid" };

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function copyTextNow(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  if (copied) return Promise.resolve();
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  return Promise.reject(new Error("clipboard unavailable"));
}

/** 只有「效果」才作为场景的主效果推荐；原理与规则分开列出 */
const isEffect = (e) => e.nature === "effect";

/* ------------------------------------------------------------------ */
/* 状态与路由                                                          */
/* ------------------------------------------------------------------ */

const state = {
  view: "dictionary",
  scenario: SCENARIOS[0].id,
  query: "",
  fit: "all",
  detail: null,
  detailCtx: null,
};

let listKeyCache = "";
const scrollTops = new Map();
let activeDemo = null;
let hoverDemo = null;
let hoverTimer = null;
let activeCard = null;
let lastFocus = null;
let playerUnsub = null;
let detailParams = {};
let compositionControllers = [];
let shotRecipeControllers = [];
const compositionView = {
  subview: "main", // main | grammar | performers | cine | patterns | wizard
  patternMode: "style", // style | concept | medium
  patternSelected: null, // 三维选型中展开的条目 id
  cineCategory: "all",
  cineSelected: null,
  profileId: "generic",
  purpose: "all",
  contentType: "all",
  format: "all",
  capability: "all",
  shotCategory: "all",
  grammarDomain: "all",
  shotPattern: "all",
  shotLayer: "all",
  shotIntegration: "all",
  shotObject: "all",
  shotUse: "all",
  shotQuery: "",
};

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [pathPart, queryPart] = raw.split("?");
  const q = new URLSearchParams(queryPart || "");
  const [head, param] = pathPart.split("/");
  const base = { view: "dictionary", scenario: SCENARIOS[0].id, query: "", fit: "all", detail: null, detailCtx: null, shotDetail: null, cineDetail: null, technicalRecipe: null };
  if (!head) return base;
  if (head === "effect") {
    const from = q.get("from") || "dictionary";
    const scenario = q.get("scenario");
    return {
      ...base,
      view: from,
      scenario: scenario && scenarioById.has(scenario) ? scenario : SCENARIOS[0].id,
      query: q.get("q") || "",
      fit: q.get("fit") || "all",
      detail: param || null,
      technicalRecipe: q.get("recipe"),
      detailCtx: { from, scenario, q: q.get("q") || "", fit: q.get("fit") || "all" },
    };
  }
  if (head === "sequences") {
    compositionView.subview='main';
    const sequence=CINE_SEQS.find(s=>s.id===param);
    compositionView.cineCategory='all';
    return {...base,view:'compositions',cineDetail:param||null};
  }
  if (head === "shots") {
    const recipe=SHOT_RECIPES.find(r=>r.id===param);
    if(recipe?.presentation?.role==='technical')return {...base,view:'dictionary',detail:recipe.presentation.canonicalEffectId,technicalRecipe:recipe.id,detailCtx:{from:'dictionary'}};
    return { ...base, view: "compositions", shotDetail: param || null };
  }
  if (head === "scenario" && scenarioById.has(param)) {
    return { ...base, view: "scenario", scenario: param, query: q.get("q") || "", fit: q.get("fit") || "all" };
  }
  if (head === "dictionary" || head === "triggers" || head === "tools" || head === "compositions") {
    return { ...base, view: head, query: q.get("q") || "", fit: q.get("fit") || "all" };
  }
  return base;
}

function listHash(view = state.view, scenario = state.scenario, extra = {}) {
  const q = new URLSearchParams();
  const query = extra.q ?? state.query;
  const fit = extra.fit ?? state.fit;
  if (query) q.set("q", query);
  if (fit && fit !== "all") q.set("fit", fit);
  const suffix = q.toString() ? `?${q}` : "";
  if (view === "scenario") return `#/scenario/${scenario}${suffix}`;
  return `#/${view}${suffix}`;
}

function effectHash(id, focus) {
  const q = new URLSearchParams();
  q.set("from", state.view);
  if (state.view === "scenario") q.set("scenario", state.scenario);
  if (state.query) q.set("q", state.query);
  if (state.fit !== "all") q.set("fit", state.fit);
  return `#/effect/${id}?${q}${focus ? `&focus=${focus}` : ""}`;
}

function go(hash, { replace = false } = {}) {
  if (replace) history.replaceState(null, "", hash);
  if (location.hash === hash) render();
  else location.hash = hash;
}

/* ------------------------------------------------------------------ */
/* 筛选与排序                                                          */
/* ------------------------------------------------------------------ */

function matchesQuery(e, q) {
  if (!q) return true;
  const s = q.trim().toLowerCase();
  return (
    e.zh.toLowerCase().includes(s) ||
    e.en.toLowerCase().includes(s) ||
    e.core.toLowerCase().includes(s) ||
    e.group.toLowerCase().includes(s)
  );
}

function fitOf(e, view, scenarioId) {
  if (view !== "scenario") return null;
  return e.scenarios[scenarioId] || null;
}

/** 当前视图可见的效果列表（保持稳定顺序，用于上一条/下一条与计数） */
function visibleEffects() {
  const q = state.query;
  if (state.view === "scenario") {
    const sid = state.scenario;
    return EFFECTS.filter((e) => {
      const f = e.scenarios[sid];
      if (f === "avoid") return false;
      if (state.fit !== "all" && f !== state.fit) return false;
      return matchesQuery(e, q);
    }).sort((a, b) => {
      const order = ["core", "good", "caution", "avoid"];
      return (
        order.indexOf(a.scenarios[sid]) - order.indexOf(b.scenarios[sid]) ||
        (isEffect(b) ? 1 : 0) - (isEffect(a) ? 1 : 0) ||
        a.no - b.no
      );
    });
  }
  return EFFECTS.filter((e) => matchesQuery(e, q)).sort((a, b) => a.no - b.no);
}

function chartDataFor(e) {
  return e.demo === "chart" ? PRESETS.charts[e.id] : null;
}

function chartError(e) {
  const d = chartDataFor(e);
  if (!d) return null;
  const errs = validateChart(e.id, d);
  return errs.length ? errs : null;
}

/* ------------------------------------------------------------------ */
/* 卡片                                                                */
/* ------------------------------------------------------------------ */

function fitBadge(e, sid) {
  if (!sid) return "";
  const f = e.scenarios[sid];
  return `<span class="badge ${f}" style="color:var(${FIT_VAR[f]})">${FIT_LABEL[f]}</span>`;
}

function cardHTML(e, sid, focusId) {
  const color = groupColor(e.group);
  const err = chartError(e);
  return `
  <button class="card" data-effect="${e.id}" style="--card-c:${color}" data-focus="${esc(focusId)}">
    <div class="card-preview">
      <div class="card-live" data-preview></div>
      <div class="card-static" data-static>${esc(e.zh)}</div>
    </div>
    <div class="card-info">
      <div class="card-row">
        <span class="card-no">${e.no}</span>
        <span class="card-zh">${esc(e.zh)}</span>
        <span class="card-nature">${NATURE_LABEL[e.nature] || ""}</span>
        ${e.niche ? '<span class="badge niche">专精</span>' : ""}
      </div>
      <div class="card-en">${esc(e.en)}</div>
      <div class="card-core">${esc(e.core)}</div>
      <div class="card-tag">
        <i style="background:${color}"></i>${esc(e.group)}
        ${sid ? `可 ${FIT_LABEL[e.scenarios[sid]]}` : ""}
        ${err ? '<span class="card-warn" title="示例数据校验未通过">数据校验未通过</span>' : ""}
        <span class="hi">悬停播一次 · 点击看详情</span>
      </div>
    </div>
  </button>`;
}

/* ------------------------------------------------------------------ */
/* 列表渲染                                                            */
/* ------------------------------------------------------------------ */

const app = document.getElementById("app");

function scenarioViewBody() {
  const s = scenarioById.get(state.scenario);
  const list = visibleEffects();
  const effectsOnly = list.filter(isEffect);
  const others = list.filter((e) => !isEffect(e));
  const byFit = (f) => effectsOnly.filter((e) => e.scenarios[s.id] === f);
  const out = [];

  out.push(`<div class="page-head">
    <h1 class="h1">${esc(s.name)}</h1>
    <p class="sub">${esc(s.subtitle)}</p>
    <p class="advice">${esc(s.advice || "")}</p>
  </div>`);

  if (state.fit === "all" && !state.query) {
    const core = byFit("core");
    const good = byFit("good");
    const caution = byFit("caution");
    out.push(`<div class="section-title" style="--sec-c:var(--fit-core)"><span class="bar"></span>首选效果<span class="n">${core.length}</span></div>`);
    out.push(`<div class="cards">${core.map((e) => cardHTML(e, s.id)).join("")}</div>`);
    out.push(`<div class="section-title" style="--sec-c:var(--fit-good)"><span class="bar"></span>可用效果<span class="n">${good.length}</span></div>`);
    out.push(`<div class="cards">${good.map((e) => cardHTML(e, s.id)).join("")}</div>`);
    if (caution.length) {
      out.push(
        collapsedFact(
          `慎用（${caution.length}）`,
          `<div class="cards">${caution.map((e) => cardHTML(e, s.id)).join("")}</div>` +
            cautionNoteHTML(s, caution),
          false,
        ),
      );
    }
  } else {
    out.push(`<div class="section-title"><span class="bar"></span>筛选结果<span class="n">${list.length}</span></div>`);
    out.push(list.length ? `<div class="cards">${list.map((e) => cardHTML(e, s.id)).join("")}</div>` : emptyState(s.id));
  }

  if (!state.query && others.length) {
    out.push(
      collapsedFact(
        `原理与规则（${others.length}）· 保留演示，但不作为本场景的主效果推荐`,
        `<div class="cards">${others.map((e) => cardHTML(e, s.id)).join("")}</div>`,
        false,
      ),
    );
  }

  // 场景规范放在最后：首屏优先呈现效果本身
  out.push(collapsedFact("场景规范、提示词模板与实现说明", scenarioSpecHTML(s), false));
  return out.join("");
}

function cautionNoteHTML(s, list) {
  const noted = list.filter((e) => s.notes && s.notes[e.id]);
  if (!noted.length) return "";
  return `<div class="chips" style="margin-top:10px">${noted
    .map((e) => `<span class="chip warn">${esc(e.zh)} — ${esc(s.notes[e.id])}</span>`)
    .join("")}</div>`;
}

function scenarioSpecHTML(s) {
  const avoid = EFFECTS.filter((e) => e.scenarios[s.id] === "avoid");
  return `
  <div class="spec-grid">
    <div><h4>目标</h4><p>${esc(s.goal)}</p></div>
    <div><h4>硬约束</h4><p>${esc(s.constraint)}</p></div>
    <div><h4>节奏</h4><p>${esc(s.rhythm)}</p></div>
    <div><h4>时长参考</h4><p>${esc(s.durationHint)}</p></div>
    <div><h4>渲染层</h4><p><code>${esc(s.layer)}</code> — ${esc(s.layerNote)}</p></div>
    <div><h4>提示词模板</h4><p class="mono">${esc(s.promptTemplate)}</p></div>
  </div>
  <h4 class="mt">本场景不推荐（${avoid.length}）</h4>
  <p class="sub">${esc(s.avoidReason)}</p>
  <div class="chips">${avoid.map((e) => `<span class="chip bad">${esc(e.zh)}</span>`).join("")}</div>
  ${
    s.id === "screen"
      ? `<h4 class="mt">三个镜头预设</h4><div class="shots">${(PRESETS.shots || []).map(shotHTML).join("")}</div>`
      : ""
  }`;
}

function shotHTML(sh) {
  return `<div class="shot">
    <div class="shot-head"><strong>${esc(sh.name)}</strong><span class="chip">${sh.durationSec}s</span></div>
    <p class="sub">${esc(sh.goal)}</p>
    <ol class="list">${sh.steps
      .map((st) => `<li>${st.at}ms · ${esc(st.action)}${st.effect ? ` <code>${esc(st.effect)}</code>` : ""}</li>`)
      .join("")}</ol>
    <div class="shot-facts">
      <span class="chip">内屏 ${sh.device.innerWidth}×${sh.device.innerHeight}</span>
      <span class="chip">输出 ${sh.output.width}×${sh.output.height} @${sh.output.fps}fps</span>
    </div>
    <button class="btn" data-copy-shot="${esc(sh.id)}">复制镜头配置</button>
  </div>`;
}

function dictionaryBody() {
  const list = visibleEffects();
  if (!list.length) return emptyState(null);
  const out = [];
  for (const g of GROUPS) {
    const items = list.filter((e) => e.group === g);
    if (!items.length) continue;
    out.push(`<div class="section-title" style="--sec-c:${groupColor(g)}"><span class="bar"></span>${esc(g)}<span class="n">${items.length}</span></div>`);
    out.push(`<div class="cards">${items.map((e) => cardHTML(e, null)).join("")}</div>`);
  }
  return out.join("");
}

function emptyState(sid) {
  const where = state.view === "scenario" ? scenarioById.get(sid || state.scenario).name : "完整词典";
  return `<div class="empty-state">
    <p>没有匹配的结果。</p>
    <p class="sub">条件：${state.query ? `关键词「${esc(state.query)}」` : "无关键词"}${state.fit !== "all" ? ` · 适配度「${FIT_LABEL[state.fit]}」` : ""} · 范围「${esc(where)}」</p>
    <div class="row">
      <button class="btn" data-clear>清除条件</button>
      ${state.view === "scenario" ? `<button class="btn" data-goto="dictionary">到完整词典搜索</button>` : ""}
    </div>
  </div>`;
}

function triggersBody() {
  const p = [`<div class="page-head"><h1 class="h1">触发方式</h1><p class="sub">${esc(triggersData.note)}</p></div>`];
  p.push(`<div class="spec-grid">
    <div><h4>检查顺序</h4><p class="mono">${esc(triggersData.checkOrder)}</p></div>
    <div><h4>最容易混写的一处</h4><p>${esc(triggersData.keyDistinction)}</p></div>
  </div>`);
  for (const t of TRIGGERS) {
    p.push(`<div class="section-title" id="trig-${esc(t.id)}"><span class="bar"></span>${t.no}. ${esc(t.zh)}<span class="n">${esc(t.en)}</span></div>`);
    p.push(`<div class="fact">
      <p>${esc(t.what)}</p>
      <h4>常见类型</h4><div class="chips">${t.variants.map((v) => `<span class="chip">${esc(v)}</span>`).join("")}</div>
      <h4>常用组合</h4><div class="chips">${t.combos.map((v) => `<span class="chip">${esc(v)}</span>`).join("")}</div>
      <h4>提示词例子</h4><div class="prompt">${esc(t.promptExample)}</div>
      <h4>做动效视频时</h4><p>${esc(t.videoNote)}</p>
    </div>`);
  }
  return p.join("");
}

function toolsBody() {
  const p = [`<div class="page-head"><h1 class="h1">工具与渲染层</h1><p class="sub">${esc(TOOLS.note)}</p></div>`];
  p.push(`<div class="fact"><h4>复用的第一原则</h4><p>${esc(TOOLS.promptTip)}</p></div>`);
  p.push(`<div class="section-title" id="tool-impl"><span class="bar"></span>${TOOLS.implementations.length} 种实现工具<span class="n">第一层</span></div>`);
  for(const group of TOOLS.groups){
    p.push(`<h3 class="tool-group-title">${esc(group.name)}</h3><div class="tool-reference-grid">${TOOLS.implementations.filter(t=>t.group===group.id).map(t=>`<article class="fact tool-reference" id="tool-${esc(t.id)}"><h4>${esc(t.name)} <span class="chip">${t.status==='in-use'?'当前使用':'选型参考 · 未接入'}</span></h4><p>${t.fits.map(esc).join(' / ')}</p><p>${esc(t.note)}</p><details><summary>使用条件与逐帧合同</summary><p>${esc(t.when)}</p><p>${esc(t.seekRule)}</p><p>可归层：${t.renderLayers.map(id=>esc(TOOLS.renderLayers.find(l=>l.id===id)?.name)).join(' / ')}</p>${t.source?`<a href="${esc(t.source)}" target="_blank" rel="noopener">官方参考 ↗</a>`:''}</details></article>`).join('')}</div>`);
  }
  p.push(`<details class="collapse"><summary>素材按需播放器 · Lottie / Rive</summary><div class="collapse-body">${TOOLS.optionalAssetPlayers.map(t=>`<div class="fact" id="tool-${esc(t.id)}"><h4>${esc(t.name)}</h4><p>${esc(t.condition)}</p><p>${esc(t.seekRule)}</p></div>`).join('')}</div></details>`);
  p.push(`<div class="section-title"><span class="bar"></span>四个渲染层<span class="n">决定交给谁做</span></div>`);
  for (const l of TOOLS.renderLayers) {
    const n = EFFECTS.filter((e) => e.render === l.id).length;
    p.push(`<div class="fact" id="layer-${esc(l.id)}">
      <h4>${esc(l.name)} · ${n} 个条目落在这里</h4>
      <p>${esc(l.why)}</p>
      <p><strong>判据：</strong>${esc(l.rule)}</p>
      <div class="chips">${l.covers.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>
    </div>`);
  }
  p.push(`<div class="fact accent"><h4>总判据</h4><p>${esc(TOOLS.routingRule)}</p></div>`);
  p.push(`<div class="fact"><h4>已产出的注册表</h4><p><a href="registry.json" target="_blank" rel="noopener">registry.json</a> · schema ${SCHEMA_VERSION} · 构建期生成，可直接读取；未新增服务端 API。</p></div>`);
  return p.join("");
}

function compositionInstruction(combo) {
  const p=directorPatternById.get(combo.id);
  return [`【${p.name}】导演目标：${p.goal}`,`观众理解：${p.shots.map(s=>s.audience).join(' → ')}`,`主体：${p.subject}。`,...p.shots.map(s=>`${(s.fromMs/1000).toFixed(1)}–${(s.toMs/1000).toFixed(1)}s：${s.label}；观众应理解「${s.audience}」；视点 ${s.camera}。`),...p.editEdges.map(e=>`交接 ${e.from}→${e.to}：${e.relationship}；保留 ${e.preserve.join('、')}；动机 ${e.reason}。`),`约束：${p.constraint}`,`导演 / 技术分工：${p.division}`,`范围：${p.scope}；当前 ${p.capability}。`].join('\n');
}

function facetOptions(items, value, allLabel) {
  return `<option value="all">${esc(allLabel)}</option>${items.map((item) => {
    const id = typeof item === "string" ? item : item.id;
    const name = typeof item === "string" ? item : item.name;
    return `<option value="${esc(id)}" ${value === id ? "selected" : ""}>${esc(name)}</option>`;
  }).join("")}`;
}

function shotSourceUrl(recipe) {
  return `${SHOT_RECIPE_SOURCE.repository}/blob/${SHOT_RECIPE_SOURCE.commit}/${recipe.sourcePath}`;
}

function shotHash(id) {
  return `#/shots/${id}`;
}

function compositionsBody() {
  if (compositionView.subview === 'patterns') return patternsBody();
  if (compositionView.subview === 'wizard') return wizardBody();
  return cineBody();
}

function narrativeCardsHTML() {
  const q=state.query.trim().toLowerCase();
  const visible=DIRECTOR_PATTERNS.filter(p=>!q || [p.id,p.name,p.goal,p.intent,p.subject].join(' ').toLowerCase().includes(q));
  return `<div class="director-section-title"><h2>叙事拆解</h2><span>六种信息推进结构 · 独立情境演示</span></div>
  <div class="combo-grid director-narrative-grid">${visible.map(p=>`<article class="combo-card" data-combo="${p.id}" tabindex="0" role="button" aria-label="查看叙事结构：${esc(p.name)}"><div class="combo-preview" data-combo-host></div><div class="combo-info compact"><div><span class="chip">${esc(p.intent)}</span><span class="chip">${p.shots.length} 段 / ${p.editEdges.length} 次交接</span><span class="chip">${p.durationMs/1000}s · 情境演示</span></div><h2>${esc(p.name)}</h2><p>${esc(p.goal)}</p><div class="narrative-stage-labels">${p.shots.map((s,i)=>`<span>${i+1}. ${esc(s.label)}</span>`).join('')}</div><div class="open-hint">播放情境 · 查看观众理解与 Shot / EditEdge →</div></div></article>`).join('')}</div>`;
}

/* ------------------------------------------------------------------ */
/* 三维选型：风格 / 概念 / 媒介（Epic 1 视图）                          */
/* ------------------------------------------------------------------ */

const PATTERN_SECTION = {
  style: { key: "styles", tab: "视觉风格", tabEn: "Art Direction" },
  concept: { key: "concepts", tab: "叙事概念", tabEn: "Narrative Concept" },
  medium: { key: "media", tab: "媒介质感", tabEn: "Medium Texture" },
};

function patternSectionItems() {
  return stylePatternsData[PATTERN_SECTION[compositionView.patternMode].key];
}

function principlesBanner() {
  return `<details class="collapse principles-banner">
    <summary>Video, not slides · 六原则（让画面是"拍出来"的，不是"幻灯片"）</summary>
    <div class="principles-grid">
      ${stylePatternsData.principles
        .map(
          (p) => `<div class="principle"><strong>${esc(p.label)}</strong><span>${esc(p.detail)}</span>
        <ul>${p.checks.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>`
        )
        .join("")}
    </div>
  </details>`;
}

function patternModeTabs() {
  return `<div class="pattern-tabs" role="tablist">
    ${Object.entries(PATTERN_SECTION)
      .map(
        ([mode, s]) =>
          `<button class="pattern-tab" role="tab" data-pattern-mode="${mode}" aria-selected="${compositionView.patternMode === mode}">
          <span class="tab-zh">${s.tab}</span><span class="tab-en">${s.tabEn}</span></button>`
      )
      .join("")}
  </div>`;
}

function patternMapChips(mapsTo) {
  return mapsTo
    .map((m) => {
      const ref = typeof m === "object" ? m : { type: "effect", id: m };
      const label = ref.role ? `${ref.role} · ${ref.id}` : ref.id;
      const attr = ref.type === "combo" ? "data-pattern-goto-combo" : "data-pattern-goto-effect";
      return `<button class="map-chip" ${attr}="${esc(ref.id)}">${esc(label)}</button>`;
    })
    .join("");
}

function patternExpanded(item) {
  return `<div class="pattern-body">
    <div class="pattern-cols">
      <div class="pattern-col">
        ${item.whenToUse ? `<h4>适用</h4><ul>${item.whenToUse.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        ${item.avoidWhen ? `<h4>避免</h4><ul>${item.avoidWhen.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        ${
          item.structure
            ? `<h4>结构</h4><p>${esc(item.structure)}</p>
          <dl class="concept-beats"><dt>开场</dt><dd>${esc(item.opening)}</dd>
          <dt>转场</dt><dd>${esc(item.transition)}</dd><dt>收尾</dt><dd>${esc(item.ending)}</dd></dl>`
            : ""
        }
        ${item.drawOrder ? `<h4>逐笔绘制顺序</h4><ol class="draw-order">${item.drawOrder.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}
      </div>
      <div class="pattern-col preview-col">
        <h4>内嵌预览（可 seek）</h4>
        <iframe class="pattern-iframe" src="/${item.snippet}" loading="lazy"></iframe>
        <div class="snippet-actions">
          <button class="btn" data-open-snippet="${esc(item.snippet)}">新标签打开片段</button>
          <button class="btn primary" data-pattern-use="${esc(item.id)}">用此模式生成制作包 →</button>
        </div>
      </div>
    </div>
    <div class="pattern-maps">
      <h4>映射到现有动效 / 配方（可点击跳转）</h4>
      <div class="map-chips">${patternMapChips(item.mapsTo)}</div>
    </div>
  </div>`;
}

function patternCard(item) {
  const selected = compositionView.patternSelected === item.id;
  return `<article class="pattern-card ${selected ? "expanded" : ""}" data-pattern-id="${item.id}" tabindex="0">
    <header class="pattern-card-head" data-pattern-toggle="${item.id}">
      <span class="pattern-no">${item.index}</span>
      <div class="pattern-title"><h3>${esc(item.label)}</h3><span class="pattern-en">${esc(item.en)}</span></div>
      <div class="pattern-keywords">${(item.keywords || []).slice(0, 4).map((t) => `<span class="kw">${esc(t)}</span>`).join("")}</div>
      <span class="expand-chevron">${selected ? "−" : "+"}</span>
    </header>
    ${selected ? patternExpanded(item) : ""}
  </article>`;
}

function patternsBody() {
  const items = patternSectionItems();
  const sec = PATTERN_SECTION[compositionView.patternMode];
  return `<div class="page-head">
    <h1 class="h1">三维选型 · ${sec.tab} <span class="en">${sec.tabEn}</span></h1>
    <p class="sub">成片视角：先定视觉风格，再选叙事概念，最后指定媒介质感。每个模式都配可复制片段与可播放预览。</p>
  </div>
  ${patternModeTabs()}
  ${principlesBanner()}
  <p class="combo-count">共 ${items.length} 个 · 点击卡片展开片段、预览与映射。</p>
  <div class="pattern-grid">${items.map(patternCard).join("")}</div>`;
}

function selfCheckHTML() {
  const P = stylePatternsData.principles;
  const D = stylePatternsData.scoringDimensions;
  const Rb = stylePatternsData.fixRunbook;
  return `<details class="collapse self-check">
    <summary>成片自检清单 · 未过 gate / contact sheet 不得全量渲染</summary>
    <div class="self-check-body">
      <div class="check-block"><strong>① Video, not slides · 六原则（逐项勾选）</strong>
      ${P.map((p) => `<label class="check-row"><input type="checkbox" data-self-check /><span class="check-label">${esc(p.label)}</span><small>${esc(p.detail)}</small></label>`).join("")}</div>
      <div class="check-block"><strong>② 评分维度（1–10，目标每项 ≥8）</strong>
      <div class="score-grid">${D.map((d) => `<div class="score-item"><span class="score-label">${esc(d.label)}</span><small>${esc(d.detail)}</small><input type="number" min="1" max="10" placeholder="—" data-self-score /></div>`).join("")}</div></div>
      <div class="check-block"><strong>③ 修复 Runbook（按症状查精确修法）</strong>
      <div class="runbook">${Rb.map((r) => `<details class="runbook-item"><summary><span class="r-id">${esc(r.id)}</span>${esc(r.symptom)}</summary>
        <div class="runbook-body"><p><b>如何发现</b>${esc(r.detect)}</p><p><b>修法</b>${esc(r.fix)}</p></div></details>`).join("")}</div></div>
    </div>
  </details>`;
}

function collapsedFact(title, inner, open = false) {
  return `<details class="collapse" ${open ? "open" : ""}><summary>${esc(title)}</summary><div class="collapse-body">${inner}</div></details>`;
}

function renderListBody() {
  if (state.view === "scenario") return scenarioViewBody();
  if (state.view === "dictionary") return dictionaryBody();
  if (state.view === "triggers") return triggersBody();
  if (state.view === "tools") return toolsBody();
  return compositionsBody();
}

function railHTML() {
  if (state.view === "compositions") {
    const activeCases=CINE_SEQS.filter(q=>q.collection==='director');
    return `<div class="rail-head">总导演制作参考</div><div class="rail-note">看案例 → 拆结构 → 编排镜头</div>
    <div class="rail-group"><div class="rail-label">导演工作台</div>${[['main','导演案例',activeCases.length+DIRECTOR_PATTERNS.length],['patterns','美术方向',''],['wizard','生成制作包','']].map(([id,label,count])=>`<button class="rail-item" data-subview="${id}" aria-current="${compositionView.subview===id}"><span class="no">${count}</span>${label}</button>`).join('')}</div>
    ${compositionView.subview==='main'?`<div class="rail-group"><div class="rail-label">案例范围</div>${[['all','全部参考',activeCases.length+6],['director','完整影片',2],['handoff','镜头段落',activeCases.length-2],['structures','叙事拆解',6]].map(([id,label,count])=>`<button class="rail-item" data-cine-category="${id}" aria-current="${compositionView.cineCategory===id}"><span class="no">${count}</span>${label}</button>`).join('')}</div>`:''}
    <div class="rail-group"><div class="rail-label">技术交接</div><a class="rail-item" href="#/dictionary">完整词典 · 局部交互与视效 →</a><a class="rail-item" href="#/tools">工具与四个渲染层 →</a></div>`;
  }
  if (state.view === "triggers") {
    return `<div class="rail-head">触发方式 · ${TRIGGERS.length} 类</div>
      <div class="rail-group"><div class="rail-label">触发类别</div>
      ${TRIGGERS.map((t) => `<button class="rail-item" data-scroll-target="trig-${esc(t.id)}"><span class="no">${t.no}</span>${esc(t.zh)}</button>`).join("")}
      </div>`;
  }
  if (state.view === "tools") {
    return `<div class="rail-head">工具与渲染层</div>
      <div class="rail-group"><div class="rail-label">实现工具<span class="cnt">${TOOLS.implementations.length}</span></div>
      ${TOOLS.implementations.map((t) => `<button class="rail-item" data-scroll-target="tool-${esc(t.id)}"><span class="no">${t.id}</span>${esc(t.name)}</button>`).join("")}
      </div>
      <div class="rail-group"><div class="rail-label">渲染层<span class="cnt">${TOOLS.renderLayers.length}</span></div>
      ${TOOLS.renderLayers.map((l) => `<button class="rail-item" data-scroll-target="layer-${esc(l.id)}"><span class="no">${TOOLS.renderLayers.indexOf(l) + 1}</span>${esc(l.name.split(" · ")[0])}</button>`).join("")}
      </div>`;
  }
  const list = visibleEffects();
  const head = `<div class="rail-head">${state.view === "scenario" ? esc(scenarioById.get(state.scenario).name) : "完整词典"} · ${list.length} 个</div>`;
  // 二级目录：完整词典内选择场景（或全部词典）
  const scenNav = `<div class="rail-group rail-scen">
    <div class="rail-label">场景<span class="cnt">${SCENARIOS.length}</span></div>
    <button class="rail-item scen" data-scenario="all" aria-current="${state.view === "dictionary"}"><span class="no">≡</span>全部词典</button>
    ${SCENARIOS.map((s) => `<button class="rail-item scen" data-scenario="${s.id}" aria-current="${state.view === "scenario" && state.scenario === s.id}"><span class="no">${s.no || "·"}</span>${esc(s.name)}</button>`).join("")}
  </div>`;
  const groups = [];
  if (state.view === "scenario") {
    for (const f of ["core", "good", "caution"]) {
      const items = list.filter((e) => e.scenarios[state.scenario] === f && isEffect(e));
      if (items.length) groups.push([FIT_LABEL[f], `var(${FIT_VAR[f]})`, items]);
    }
    const others = list.filter((e) => !isEffect(e));
    if (others.length) groups.push(["原理与规则", "var(--muted)", others]);
  } else {
    for (const g of GROUPS) {
      const items = list.filter((e) => e.group === g);
      if (items.length) groups.push([g, groupColor(g), items]);
    }
  }
  return (
    head + scenNav +
    groups
      .map(
        ([label, color, items]) => `<div class="rail-group">
      <div class="rail-label"><span class="dot" style="background:${color}"></span>${esc(label)}<span class="cnt">${items.length}</span></div>
      ${items
        .map(
          (e) =>
            `<button class="rail-item" data-effect="${e.id}" aria-current="${state.detail === e.id}"><span class="no">${e.no}</span>${esc(e.zh)}</button>`,
        )
        .join("")}
    </div>`,
      )
      .join("")
  );
}

function bindRailActions(rail) {
  rail.onclick = ev => {
    if(!ev.target.closest('button,a'))return;
    app.classList.remove('rail-open');
    const toggle=app.querySelector('[data-rail-toggle]');
    if(toggle){toggle.setAttribute('aria-expanded','false');toggle.textContent='目录与筛选';}
  };
  rail.querySelectorAll("[data-effect]").forEach((b) => {
    b.onclick = () => go(effectHash(b.dataset.effect, "rail"));
  });
  rail.querySelectorAll("[data-scenario]").forEach((b) => {
    b.onclick = () => {
      const sid = b.dataset.scenario;
      go(sid === "all" ? listHash("dictionary", state.scenario, { q: "", fit: "all" }) : listHash("scenario", sid, { q: "", fit: "all" }));
    };
  });
  rail.querySelectorAll("[data-combo-jump]").forEach((b) => {
    b.onclick = () => {
      if (compositionView.subview !== "main") setCompositionSubview("main");
      openComboDetail(b.dataset.comboJump);
    };
  });
  rail.querySelectorAll("[data-subview]").forEach((b) => {
    b.onclick = () => setCompositionSubview(b.dataset.subview);
  });
  rail.querySelectorAll("[data-cine-category]").forEach((b) => {
    b.onclick = () => {
      compositionView.cineCategory = b.dataset.cineCategory;
      if (compositionView.subview !== "main") {
        setCompositionSubview("main");
        return;
      }
      rail.querySelectorAll("[data-cine-category]").forEach((btn) => {
        btn.setAttribute("aria-current", String(btn.dataset.cineCategory === compositionView.cineCategory));
      });
      const main = app.querySelector(".main");
      if (main) {
        destroyCompositions();
        main.innerHTML = compositionsBody();
        main.scrollTop = 0;
        bindCompositions(main);
      }
    };
  });
  rail.querySelectorAll("[data-scroll-target]").forEach((b) => {
    b.onclick = () => {
      const main = app.querySelector(".main");
      const el = main?.querySelector(`#${b.dataset.scrollTarget}`);
      if (!el || !main) return;
      main.scrollTo({ top: el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop - 10, behavior: "smooth" });
    };
  });
}

const wizardCtx = {
  inspect(kind) {
    compositionView.patternMode = kind === "medium" ? "medium" : kind;
    compositionView.patternSelected = null;
    setCompositionSubview("patterns");
  },
};

function setCompositionSubview(sub) {
  compositionView.subview = ['cine','grammar','performers'].includes(sub)?'main':sub;
  if (sub !== "patterns") compositionView.patternSelected = null;
  if (sub === "wizard") seedWizard(compositionView.wizardSeed);
  const rail = app.querySelector(".rail");
  const main = app.querySelector(".main");
  if (rail) {
    rail.innerHTML = railHTML();
    bindRailActions(rail);
  }
  if (main) {
    destroyHoverPreviews(main);
    destroyCompositions();
    main.innerHTML = renderListBody();
    main.scrollTop = 0;
    bindCards(main);
    bindCompositions(main);
  }
}

/* ------------------------------------------------------------------ */
/* 顶部栏                                                              */
/* ------------------------------------------------------------------ */

function topbarHTML() {
  const links = [
    ["compositions", "镜头组合"],
    ["dictionary", "完整词典"],
    ["triggers", "触发方式"],
    ["tools", "工具与渲染层"],
  ]
    .map(([id, label]) => `<button class="topnav-btn" data-tab="${id}" aria-selected="${state.view === id || (id === "dictionary" && state.view === "scenario")}">${esc(label)}</button>`)
    .join("");
  const showSearch = state.view === "scenario" || state.view === "dictionary" || state.view === "compositions";
  const fitOptions =
    state.view === "scenario"
      ? `<select class="fit-select" data-fit>
          <option value="all">全部适配度</option>
          <option value="core">首选</option>
          <option value="good">可用</option>
          <option value="caution">慎用</option>
        </select>`
      : "";
  return `
  <header class="topbar">
    <div class="brand"><span class="brand-mark"></span><strong>动效选型工作台</strong></div>
    <nav class="topnav" aria-label="一级导航">${links}</nav>
    ${showSearch
      ? `<div class="search-wrap">
           <label class="search">
             <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5.2" cy="5.2" r="3.6" stroke="currentColor" stroke-width="1.4"/><path d="M8 8l2.4 2.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
             <input type="search" placeholder="${state.view === 'compositions' ? '搜索参考 / ID / 主题' : '搜索动效 / English / 分组'}" value="${esc(state.query)}" data-search />
             <kbd>/</kbd>
           </label>
           ${fitOptions}
         </div>`
      : ""}
    <button class="rail-toggle" data-rail-toggle aria-expanded="false">目录与筛选</button>
  </header>`;
}

function destroyCompositions() {
  for (const ctrl of compositionControllers) ctrl.destroy();
  compositionControllers = [];
  for (const ctrl of shotRecipeControllers) ctrl.destroy();
  shotRecipeControllers = [];
  closeComboDetail();
  closeShotDetail();
  closeCineDetail();
}

async function bindCompositions(root) {
  bindCine(root);
  if (compositionView.subview === "patterns") { bindPatterns(root); return; }
  if (compositionView.subview === "wizard") { bindWizard(root, wizardCtx); return; }
  for (const card of root.querySelectorAll("[data-combo]")) {
    const definition = COMPOSITIONS.find((item) => item.id === card.dataset.combo);
    if (!definition) continue;
    const open = () => openComboDetail(definition.id);
    card.__open = open;
    card.onclick = open;
    card.onkeydown = (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(); } };
    const host = card.querySelector("[data-combo-host]");
    try {
      const pattern=directorPatternById.get(definition.id);
      const ctrl = mountDirectorPattern(host,pattern,{fps:24});
      if(!host.isConnected){ctrl.destroy();continue;}
      compositionControllers.push(ctrl);
      // 卡片停在该叙事的结果帧，完整过程进入详情
      ctrl.seekFrame(Math.round(directorPatternById.get(definition.id).representativeMs/1000*24));
    } catch (error) {
      host.innerHTML = `<div class="empty">情境演示加载失败：${esc(error.message)}</div>`;
    }
  }

}

function bindPatterns(root) {
  const rerender = () => {
    const main = app.querySelector(".main");
    if (!main) return null;
    main.innerHTML = patternsBody();
    bindPatterns(main);
    return main;
  };
  root.querySelectorAll("[data-pattern-mode]").forEach((b) => {
    b.onclick = () => {
      compositionView.patternMode = b.dataset.patternMode;
      compositionView.patternSelected = null;
      rerender();
    };
  });
  root.querySelectorAll("[data-pattern-toggle]").forEach((h) => {
    h.onclick = () => {
      const id = h.dataset.patternToggle;
      compositionView.patternSelected = compositionView.patternSelected === id ? null : id;
      const main = rerender();
      if (main && compositionView.patternSelected) {
        requestAnimationFrame(() => {
          main.querySelector(`[data-pattern-id="${compositionView.patternSelected}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
        });
      }
    };
  });
  root.querySelectorAll("[data-pattern-id]").forEach((card) => {
    card.onkeydown = (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        const id = card.dataset.patternId;
        if (compositionView.patternSelected === id) return;
        compositionView.patternSelected = id;
        const main = rerender();
        if (main) requestAnimationFrame(() => {
          main.querySelector(`[data-pattern-id="${id}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
        });
      }
    };
  });
  root.querySelectorAll("[data-pattern-goto-effect]").forEach((b) => {
    b.onclick = (ev) => {
      ev.stopPropagation();
      go(effectHash(b.dataset.patternGotoEffect, "card"));
    };
  });
  root.querySelectorAll("[data-pattern-goto-combo]").forEach((b) => {
    b.onclick = (ev) => {
      ev.stopPropagation();
      setCompositionSubview("main");
      openComboDetail(b.dataset.patternGotoCombo);
    };
  });
  root.querySelectorAll("[data-open-snippet]").forEach((b) => {
    b.onclick = (ev) => {
      ev.stopPropagation();
      window.open(`/${b.dataset.openSnippet}`, "_blank");
    };
  });
  root.querySelectorAll("[data-pattern-use]").forEach((b) => {
    b.onclick = (ev) => {
      ev.stopPropagation();
      compositionView.wizardSeed = { mode: compositionView.patternMode, id: b.dataset.patternUse };
      setCompositionSubview("wizard");
    };
  });
}

/* ------------------------------------------------------------------ */
/* 电影序列：可 seek 的电影感组合（真实运镜 / 纵深 / 世界 / 连续剪辑）   */
/* ------------------------------------------------------------------ */

const cineFramingById = new Map(CINE_GRAMMAR.framing.map((x) => [x.id, x]));
const cineCameraById = new Map(CINE_GRAMMAR.cameraMoves.map((x) => [x.id, x]));
const cineWorldById = new Map(CINE_GRAMMAR.worlds.map((x) => [x.id, x]));
const cineTransById = new Map(CINE_GRAMMAR.transitions.map((x) => [x.id, x]));

function cineVisible() {
  return CINE_SEQS.filter((q) => {
    const category = compositionView.cineCategory;
    const categoryMatch = q.collection === 'director' && (category === 'all' || q.category === category);
    const needle=state.query.trim().toLowerCase();
    return categoryMatch && (!needle || [q.name,q.id,q.logline,q.useWhen].join(' ').toLowerCase().includes(needle));
  });
}
function cineCard(seq) {
  const cat = CINE_FACETS.categories.find((c) => c.id === seq.category);
  return `<article class="cine-card" data-cine="${seq.id}" tabindex="0" role="button" aria-label="查看制作参考：${esc(seq.name)}">
    <div class="cine-preview">
      ${seq.collection === 'director' ? `<img class="cine-poster" src="${import.meta.env.BASE_URL}studio/evidence/${seq.snippet}-poster.png" loading="lazy" alt="${esc(seq.name)}代表帧"><span class="cine-preview-play">▶ ${seq.sequenceKind === 'film' ? '完整影片' : seq.sequenceKind === 'segment'?'全新情境':'镜头段落'}</span>` : `<iframe class="cine-iframe" title="${esc(seq.name)}原理预览" src="${import.meta.env.BASE_URL}snippets/${seq.snippet}.html" loading="lazy" data-cine-static></iframe>`}
    </div>
    <div class="cine-info">
      <div class="cine-meta"><span class="chip">${esc(cat.label)}</span><span class="chip">${seq.durationMs / 1000}s</span><span class="chip">${seq.shots.length} 段</span>${seq.collection === "study" ? `<span class="chip">原理练习</span>` : ""}</div>
      <h3>${esc(seq.name)}</h3>
      <p>${esc(seq.logline)}</p>
      <div class="open-hint">播放、查看交接与复制制作说明 →</div>
    </div>
  </article>`;
}
function cineBody() {
  const visible = cineVisible();
  const films=visible.filter(s=>s.sequenceKind==='film');
  const excerpts=visible.filter(s=>s.sequenceKind!=='film');
  const showStructures=['all','structures'].includes(compositionView.cineCategory);
  return `<div class="page-head director-head">
    <span class="director-eyebrow">DIRECTOR / CASES</span>
    <h1 class="h1">导演案例</h1>
    <p class="sub">从完整影片进入镜头段落，再对照叙事结构。每个案例都说明主角是谁、观众理解什么，以及下一状态如何接住前一状态。</p>
  </div>
  <div class="director-workflow"><span><b>01</b> 确定观众理解</span><span><b>02</b> 保留主体身份</span><span><b>03</b> 编排状态交接</span><span><b>04</b> 检查实际画面</span></div>
  ${films.length ? `<div class="director-section-title"><h2>两种完整表达</h2><span>原创概念样片 · 15s · 16:9 · 60fps</span></div><div class="cine-grid director-films">${films.map(cineCard).join('')}</div>` : ''}
  ${excerpts.length ? `<div class="director-section-title"><h2>镜头段落</h2><span>四个同源片段 + 一段全新群像情境</span></div><div class="cine-grid">${excerpts.map(cineCard).join('')}</div>` : ''}
  ${showStructures?narrativeCardsHTML():''}
  ${!visible.length&&!showStructures?'<div class="empty">没有匹配的参考。</div>':''}
  ${cineGrammarSummaryHTML()}`;
}
function cineGrammarSummaryHTML() {
  return `<details class="collapse cine-grammar">
    <summary>电影语法速查 · 景别 / 运镜 / 世界 / 转场（点击展开）</summary>
    <div class="cine-grammar-grid">
      <div class="cg-block"><h4>景别</h4>${CINE_GRAMMAR.framing.map((f) => `<div class="cg-row"><strong>${esc(f.label)}</strong><span>${esc(f.en)}</span></div>`).join("")}</div>
      <div class="cg-block"><h4>运镜</h4>${CINE_GRAMMAR.cameraMoves.map((f) => `<div class="cg-row"><strong>${esc(f.label)}</strong><span>${esc(f.en)}</span></div>`).join("")}</div>
      <div class="cg-block"><h4>世界</h4>${CINE_GRAMMAR.worlds.map((f) => `<div class="cg-row"><strong>${esc(f.label)}</strong><span>${esc(f.expresses)}</span></div>`).join("")}</div>
      <div class="cg-block"><h4>转场</h4>${CINE_GRAMMAR.transitions.map((f) => `<div class="cg-row"><strong>${esc(f.label)}</strong><span>${esc(f.useWhen)}</span></div>`).join("")}</div>
    </div>
  </details>`;
}

/* freeze iframe on first frame */
function freezeCineIframe(iframe) {
  const freeze = () => {
    try {
      const w = iframe.contentWindow;
      if (w && typeof w.seek === "function") { w.seek(0); return true; }
    } catch {}
    return false;
  };
  if (!freeze()) iframe.addEventListener("load", () => freeze(), { once: true });
}

let cineDetailEl = null;
let cineDetailCurrentId = null;
let cineDetailPoll = null;
function ensureCineDialog() {
  if (cineDetailEl && cineDetailEl.isConnected) return cineDetailEl;
  cineDetailEl = document.createElement("dialog");
  cineDetailEl.className = "detail cine-detail";
  cineDetailEl.addEventListener("click", (ev) => { if (ev.target === cineDetailEl) closeCineDetail(); });
  cineDetailEl.addEventListener("cancel", (ev) => { ev.preventDefault(); closeCineDetail(); });
  document.body.append(cineDetailEl);
  return cineDetailEl;
}
function fmtMsRange(ms) {
  const s = ms / 1000;
  return `${s.toFixed(1)}s`;
}
function cineShotRowHTML(shot, index, seq) {
  const fr = cineFramingById.get(shot.framing);
  const cm = cineCameraById.get(shot.cameraMove);
  const wd = cineWorldById.get(shot.world);
  const tin = cineTransById.get(shot.transitionIn);
  const depthEntries = Array.isArray(shot.depth)
    ? shot.depth.map((d) => [d.layer, d.content])
    : Object.entries(shot.depth || {});
  const depth = depthEntries.map(([layer, content]) =>
    `<span class="depth-pill ${layer}">${esc(layer === "foreground" ? "前" : layer === "midground" ? "中" : "后")} · ${esc(content)}</span>`).join("");
  return `<div class="story-shot" data-shot-index="${index}">
    <div class="story-shot-head">
      <span class="shot-no">${index + 1}</span>
      <span class="shot-time">${fmtMsRange(shot.fromMs)} – ${fmtMsRange(shot.toMs)}</span>
      <span class="shot-anchor">${esc(shot.anchor)}</span>
    </div>
    <div class="story-shot-tags">
      <span class="tag">景别 · ${esc(fr ? fr.label : shot.framing)}</span>
      <span class="tag">运镜 · ${esc(cm ? cm.label : shot.cameraMove)}</span>
      <span class="tag">世界 · ${esc(wd ? wd.label : shot.world)}</span>
      <span class="tag">入 · ${esc(tin ? tin.label : shot.transitionIn)}</span>
    </div>
    <p class="story-shot-note">${esc(shot.note)}</p>
    <div class="story-depth">${depth}</div>
  </div>`;
}
function cineBeatBandHTML(seq) {
  return `<div class="beat-band">
    ${seq.shots.map((shot, i) => `<button class="beat-seg" data-cine-seek="${((shot.fromMs + shot.toMs) / 2) / 1000}" style="flex:${(shot.toMs - shot.fromMs)}" aria-label="定位第 ${i+1} 段：${esc(shot.name || shot.note)}" title="${esc(shot.name || shot.note)} · ${fmtMsRange(shot.fromMs)}"><span>${i+1}. ${esc(shot.name || shot.note)}</span></button>`).join("")}
  </div>`;
}
function cineDetailHTML(seq) {
  const cat = CINE_FACETS.categories.find((c) => c.id === seq.category);
  const mapped = directorPatternById.get(seq.mapsToCombo);
  return `<div class="detail-card">
    <div class="detail-head">
      <div class="meta">
        <h2>${esc(seq.name)}</h2>
        <div class="en">${esc(seq.en)} · ${esc(cat.label)} · ${seq.durationMs / 1000}s · ${seq.shots.length} 段</div>
      </div>
      <div class="detail-nav">
        <button class="btn" data-cine-prev aria-label="上一个">← 上一个</button>
        <button class="btn" data-cine-next aria-label="下一个">下一个 →</button>
        <button class="close" data-cine-close aria-label="关闭">×</button>
      </div>
    </div>
    <div class="detail-body">
      <div class="cine-detail-player">
        <div class="cine-player-frame">
          <iframe class="cine-detail-iframe" title="${esc(seq.name)}可定位预览" src="${import.meta.env.BASE_URL}snippets/${seq.snippet}.html"></iframe>
        </div>
        <div class="player">
          <button class="btn primary" data-cine-play>播放</button>
          <button class="btn" data-cine-reset>起点</button><button class="btn" data-cine-expand>展开画面</button><button class="btn" data-cine-sound ${seq.sequenceKind === 'segment' ? 'disabled title="此情境无音轨"' : ''}>声音关闭</button>
          <input type="range" min="0" max="1000" value="0" data-cine-scrub aria-label="镜头进度" />
          <span class="t-label" data-cine-tlabel>0.0s</span>
        </div>
        ${cineBeatBandHTML(seq)}
      </div>
      <div class="cine-detail-side">
        <div class="logline"><h4>一句话</h4><p>${esc(seq.logline)}</p></div>
        <div class="maps"><h4>关联叙事结构</h4><p>${mapped ? esc(mapped.name) : esc(seq.mapsToCombo)}</p>${mapped?`<button class="btn" data-cine-pattern="${mapped.id}">查看叙事结构</button>`:""}</div>
        ${seq.performers?`<div><h4>主体与表演角色</h4>${seq.performers.map(a=>`<p><strong>${esc(a.name)} · ${esc(a.role)}</strong></p><p>${esc(a.action)}</p>`).join('')}</div>`:''}
        <div class="derived"><h4>为什么这样交接</h4><ul>${(Array.isArray(seq.derivedFrom) ? seq.derivedFrom : [seq.derivedFrom]).map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div>
        ${seq.collection === 'director' ? `<div><h4>适用 / 避免</h4><p>${esc(seq.useWhen)}</p><p>避免：${esc(seq.avoidWhen)}</p><p>实现：${esc(seq.renderModel)}</p>${seq.sequenceKind === 'excerpt' ? `<p>源片 ${seq.film.toUpperCase()} · ${seq.sourceStart.toFixed(1)}–${seq.sourceEnd.toFixed(1)}s</p>` : ''}</div>` : ''}
        <div class="cine-production-actions"><button class="btn" data-cine-copy>复制制作描述</button><button class="btn" data-cine-copy-spec>复制镜头 JSON</button><button class="btn" data-cine-link>复制参考链接</button><button class="btn" data-cine-open-snippet>打开可编辑源预览</button>${seq.deliverables?.video ? `<a class="btn" href="${import.meta.env.BASE_URL}${seq.deliverables.video}" download>下载完整成片</a>` : ''}<span class="sub">${seq.collection === 'director' ? seq.sequenceKind==='segment'?'原创概念情境 · 浏览器演示 · 无音轨，未导出 MP4。':'概念 UI 与概念数据。成片可用不代表任意内容替换都已验证。' : '历史原理示例'}</span></div>
      </div>
      <div class="cine-storyboard">
        <h4>分镜与逐镜语法</h4>
        ${seq.shots.map((shot, i) => cineShotRowHTML(shot, i, seq)).join("")}
      </div>
    </div>
  </div>`;
}
function openCineDetail(id) {
  const seq = CINE_SEQS.find((q) => q.id === id);
  if (!seq) return;
  closeCineDetail();
  if(seq.previewStatus==='retired'){cineDetailCurrentId=id;openRetiredReference(seq.name,seq.logline,[seq.mapsToCombo],id);return;}
  cineDetailCurrentId = id;
  const dlg = ensureCineDialog();
  dlg.classList.remove('expanded-player');
  dlg.innerHTML = cineDetailHTML(seq);
  dlg.showModal();
  bindCineDetail(dlg, seq);
}
function closeCineDetail() {
  try { cineDetailEl?.querySelector('iframe')?.contentWindow?.pause?.(); } catch {}
  if (cineDetailPoll) { clearInterval(cineDetailPoll); cineDetailPoll = null; }
  if (cineDetailEl && cineDetailEl.open) cineDetailEl.close();
  cineDetailCurrentId = null;
}
function bindCineDetail(dlg, seq) {
  const iframe = dlg.querySelector(".cine-detail-iframe");
  const scrub = dlg.querySelector("[data-cine-scrub]");
  const tlabel = dlg.querySelector("[data-cine-tlabel]");
  let playing = false;
  const getWin = () => {
    try { return iframe.contentWindow; } catch { return null; }
  };
  const seekTo = (t) => {
    const w = getWin();
    if (w && typeof w.seek === "function") { w.seek(t); }
    scrub.value = String(Math.round((t / seq.durationMs * 1000) * 1000));
    tlabel.textContent = `${t.toFixed(1)}s`;
  };
  const stopPlay = () => {
    playing = false;
    if (cineDetailPoll) { clearInterval(cineDetailPoll); cineDetailPoll = null; }
    const w = getWin(); if (w && typeof w.pause === "function") w.pause();
    dlg.querySelector("[data-cine-play]").textContent = "播放";
  };
  const startPlay = () => {
    const w = getWin();
    if (!w) return;
    const t = Number(scrub.value) / 1000 * (seq.durationMs / 1000);
    w.play(t);
    playing = true;
    dlg.querySelector("[data-cine-play]").textContent = "暂停";
    cineDetailPoll = setInterval(() => {
      const ct = w.getTime ? w.getTime() : 0;
      scrub.value = String(Math.round(ct / (seq.durationMs / 1000) * 1000));
      tlabel.textContent = `${ct.toFixed(1)}s`;
      if (ct >= (seq.durationMs / 1000) - 0.02) stopPlay();
    }, 100);
  };
  /* wait for iframe to be ready then set frame 0 */
  const initSeek = () => seekTo(0);
  iframe.addEventListener("load", () => {
    const w = getWin();
    if (w && typeof w.seek === "function") Promise.resolve(w.ready).then(initSeek);
  });
  setTimeout(initSeek, 400);
  dlg.querySelector("[data-cine-play]").onclick = () => { playing ? stopPlay() : startPlay(); };
  dlg.querySelector("[data-cine-reset]").onclick = () => { stopPlay(); seekTo(0); };
  scrub.oninput = () => { stopPlay(); seekTo(Number(scrub.value) / 1000 * (seq.durationMs / 1000)); };
  dlg.querySelectorAll("[data-cine-seek]").forEach((b) => {
    b.onclick = () => { stopPlay(); seekTo(Number(b.dataset.cineSeek)); };
  });
  dlg.querySelector("[data-cine-close]").onclick = closeCineDetail;
  dlg.querySelector("[data-cine-open-snippet]").onclick = () => window.open(`${import.meta.env.BASE_URL}snippets/${seq.snippet}.html`, "_blank");
  const patternButton=dlg.querySelector('[data-cine-pattern]');
  if(patternButton)patternButton.onclick=()=>{closeCineDetail();setCompositionSubview('main');openComboDetail(patternButton.dataset.cinePattern);};
  dlg.querySelector('[data-cine-expand]').onclick=ev=>{const expanded=dlg.classList.toggle('expanded-player');ev.currentTarget.textContent=expanded?'返回说明':'展开画面';};
  let muted=true;
  dlg.querySelector('[data-cine-sound]').onclick=ev=>{muted=!muted;getWin()?.setMuted?.(muted);ev.currentTarget.textContent=muted?'声音关闭':'声音开启';};
  const productionSpec={id:seq.id,durationMs:seq.durationMs,source:{film:seq.film,start:seq.sourceStart,end:seq.sourceEnd},intent:seq.logline,renderModel:seq.renderModel,shots:seq.shots,capability:seq.capability};
  dlg.querySelector('[data-cine-copy]').onclick=async ev=>{const b=ev.currentTarget;try{await copyTextNow(seq.prompt || `${seq.name}。${seq.logline}`);b.textContent='已复制制作描述';}catch{b.textContent='复制失败';}};
  dlg.querySelector('[data-cine-copy-spec]').onclick=async ev=>{const b=ev.currentTarget;try{await copyTextNow(JSON.stringify(productionSpec,null,2));b.textContent='已复制镜头 JSON';}catch{b.textContent='复制失败';}};
  dlg.querySelector('[data-cine-link]').onclick=async ev=>{const b=ev.currentTarget;try{await copyTextNow(`${location.origin}${location.pathname}#/sequences/${seq.id}`);b.textContent='已复制参考链接';}catch{b.textContent='复制失败';}};
  dlg.querySelector("[data-cine-prev]").onclick = () => {
    const list = cineVisible();
    const i = list.findIndex((q) => q.id === seq.id);
    const prev = list[(i - 1 + list.length) % list.length];
    stopPlay(); openCineDetail(prev.id);
  };
  dlg.querySelector("[data-cine-next]").onclick = () => {
    const list = cineVisible();
    const i = list.findIndex((q) => q.id === seq.id);
    const next = list[(i + 1) % list.length];
    stopPlay(); openCineDetail(next.id);
  };
}
function bindCine(root) {
  root.querySelectorAll(".cine-iframe[data-cine-static]").forEach(freezeCineIframe);
  root.querySelectorAll(".cine-card").forEach((card) => {
    const id = card.dataset.cine;
    const open = () => openCineDetail(id);
    card.onclick = open;
    card.onkeydown = (ev) => {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(); }
    };
  });
}
/* grid-level keyboard navigation */
function bindCineGridKeys() {
  document.addEventListener("keydown", (ev) => {
    if (state.view !== "compositions" || compositionView.subview !== "main") return;
    if (cineDetailEl && cineDetailEl.open) return; // dialog handles its own keys
    const list = cineVisible();
    if (!list.length) return;
    const focus = document.activeElement?.closest?.(".cine-card");
    let idx = focus ? list.findIndex((q) => q.id === focus.dataset.cine) : -1;
    if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
      ev.preventDefault();
      const dir = ev.key === "ArrowRight" ? 1 : -1;
      const next = idx < 0 ? list[0] : list[(idx + dir + list.length) % list.length];
      const card = document.querySelector(`.cine-card[data-cine="${next.id}"]`);
      card?.focus();
      card?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
}
bindCineGridKeys();

/* ------------------------------------------------------------------ */
/* 组合 / 镜头卡详情：分步式——外层只展示预览与简述，点击后进详情       */
/* ------------------------------------------------------------------ */

let comboDialogEl = null;
let comboDialogCtrl = null;
let comboDialogCurrentId = null;
let shotDialogEl = null;
let shotDialogCtrl = null;
let shotDialogCurrentId = null;

function ensureComboDialog() {
  if (comboDialogEl && comboDialogEl.isConnected) return comboDialogEl;
  comboDialogEl = document.createElement("dialog");
  comboDialogEl.className = "detail combo-detail";
  comboDialogEl.addEventListener("click", (ev) => { if (ev.target === comboDialogEl) closeComboDetail(); });
  comboDialogEl.addEventListener("cancel", (ev) => { ev.preventDefault(); closeComboDetail(); });
  document.body.append(comboDialogEl);
  return comboDialogEl;
}

function comboDetailHTML(combo) {
  const p=directorPatternById.get(combo.id);
  const grammars=DIRECTOR_RECIPES.filter(r=>r.patternIds.includes(combo.id));
  const examples=CINE_SEQS.filter(s=>s.collection==='director'&&s.mapsToCombo===combo.id);
  return `<div class="detail-card"><div class="detail-head"><div class="meta"><h2>${esc(p.name)}</h2><div class="en">导演结构 · ${p.durationMs/1000}s · ${p.shots.length} 段 / ${p.editEdges.length} 次交接 · 原创概念情境</div></div><button class="close" data-combo-close aria-label="关闭">×</button></div>
  <div class="detail-body"><div class="detail-left"><div class="director-demo-host" data-combo-demo-host></div><div class="player"><button class="btn primary" data-combo-play>播放情境</button><button class="btn" data-combo-reset>起点</button><button class="btn" data-director-standalone>独立演示</button><input type="range" min="0" max="1000" value="0" data-combo-scrub aria-label="叙事进度"><span class="readout" data-combo-readout></span></div><div class="narrative-beats">${p.shots.map((s,i)=>`<button class="btn" data-director-shot="${s.fromMs+250}">${i+1}. ${esc(s.label)}</button>`).join('')}</div><div class="fact director-current" data-director-current></div><p class="sub">${esc(p.scope)} · 当前能力：浏览器参考演示。${esc(p.executionBoundary)}</p></div>
  <div class="detail-right"><p class="director-goal">${esc(p.goal)}</p><dl class="combo-detail-dl"><dt>主体</dt><dd>${esc(p.subject)}</dd><dt>导演决定</dt><dd>${esc(p.division)}</dd><dt>成立条件</dt><dd>${esc(p.constraint)}</dd><dt>失败方式</dt><dd>${esc(p.failure)}</dd></dl>
  <section class="director-shot-plan"><h3>观众理解与镜头交接</h3>${p.shots.map((s,i)=>`<div class="story-shot"><strong>${i+1}. ${esc(s.label)} · ${s.fromMs/1000}–${s.toMs/1000}s</strong><p>${esc(s.audience)}</p><span class="chip">${s.camera==='fixed-view'?'固定视点':'二维取景'}</span><span class="chip">阅读停留 ${s.readingHoldMs}ms</span>${i<p.editEdges.length?`<p class="director-handoff">交给下一段：${esc(p.editEdges[i].relationship)}；保留主体身份与信息上下文。</p>`:''}</div>`).join('')}</section>
  ${grammars.length?`<details class="collapse"><summary>可采用的导演语法 / 表演角色（${grammars.length}）</summary><div class="collapse-body director-links">${grammars.map(r=>`<button class="btn" data-combo-shot="${r.id}">${esc(r.nameZh)}</button>`).join('')}</div></details>`:''}
  ${examples.length?`<div class="fact"><h4>关联成片 / 段落</h4><div class="director-links">${examples.map(e=>`<button class="btn" data-narrative-example="${e.id}">${esc(e.name)}</button>`).join('')}</div><p class="sub">关联体现可借鉴的结构，不表示自动替换内容即可达到同样效果。</p></div>`:''}
  <div class="combo-actions"><button class="btn" data-combo-copy-instruction>复制导演制作说明</button><button class="btn" data-combo-copy>复制 Shot / EditEdge</button></div>
  <details class="collapse"><summary>原底层适配记录（历史技术合同）</summary><div class="collapse-body"><p class="sub">保留原有组件和适配状态，与当前导演情境演示分别验收。</p><pre class="contract-record">${esc(JSON.stringify({composition:combo.id,capability:combo.capability,plan:COMPOSITION_PLANS[combo.id]},null,2))}</pre></div></details>
  </div></div></div>`;
}

async function openComboDetail(id) {
  const combo=COMPOSITIONS.find(c=>c.id===id),p=directorPatternById.get(id);
  if(!combo || !p)return;
  closeComboDetail();comboDialogCurrentId=id;
  const dlg=ensureComboDialog();dlg.innerHTML=comboDetailHTML(combo);dlg.showModal();
  const ctrl=mountDirectorPattern(dlg.querySelector('[data-combo-demo-host]'),p,{fps:24});
  comboDialogCtrl=ctrl;compositionControllers.push(ctrl);
  const play=dlg.querySelector('[data-combo-play]'),scrub=dlg.querySelector('[data-combo-scrub]');
  const sync=f=>{scrub.value=String(Math.round(f/ctrl.totalFrames*1000));dlg.querySelector('[data-combo-readout]').textContent=`${(f/24).toFixed(1)}s / ${p.durationMs/1000}s`;const m=directorMoment(p,f/ctrl.totalFrames);dlg.querySelector('[data-director-current]').innerHTML=`<h4>当前观众理解 · ${esc(m.label)}</h4><p>${esc(m.audience)}</p>`;};
  ctrl.onFrame=sync;ctrl.onStateChange=s=>{play.textContent=s==='play'?'暂停':ctrl.frame>=ctrl.totalFrames?'重播情境':'播放情境';};
  play.onclick=()=>play.textContent==='暂停'?ctrl.pause():ctrl.play();
  dlg.querySelector('[data-combo-reset]').onclick=()=>{ctrl.pause();sync(ctrl.seekFrame(0).frame);};
  scrub.oninput=()=>{ctrl.pause();sync(ctrl.seekFrame(Number(scrub.value)/1000*ctrl.totalFrames).frame);};
  dlg.querySelectorAll('[data-director-shot]').forEach(b=>{b.onclick=()=>{ctrl.pause();sync(ctrl.seekFrame(Number(b.dataset.directorShot)/1000*24).frame);};});
  dlg.querySelector('[data-combo-close]').onclick=closeComboDetail;
  dlg.querySelector('[data-director-standalone]').onclick=()=>window.open(`${import.meta.env.BASE_URL}snippets/${p.demoSnippet}.html`,'_blank');
  const bindCopy=(selector,value)=>{dlg.querySelector(selector).onclick=async e=>{const button=e.currentTarget;try{await copyTextNow(value);button.textContent='已复制';}catch{button.textContent='复制失败';}};};
  bindCopy('[data-combo-copy-instruction]',compositionInstruction(combo));
  bindCopy('[data-combo-copy]',JSON.stringify({schemaVersion:SCHEMA_VERSION,kind:'director-pattern',capability:p.capability,canvas:{width:1920,height:1080,fps:24},intent:p.goal,subject:p.subject,shots:p.shots,editEdges:p.editEdges,constraint:p.constraint,implementationContractId:combo.id},null,2));
  dlg.querySelectorAll('[data-combo-shot]').forEach(b=>{b.onclick=()=>{closeComboDetail();openShotDetail(b.dataset.comboShot);};});
  dlg.querySelectorAll('[data-narrative-example]').forEach(b=>{b.onclick=()=>{closeComboDetail();setCompositionSubview('cine');openCineDetail(b.dataset.narrativeExample);};});
  sync(ctrl.seekFrame(0).frame);play.focus();
}

function closeComboDetail() {
  comboDialogCurrentId = null;
  if (comboDialogCtrl) {
    const i = compositionControllers.indexOf(comboDialogCtrl);
    if (i >= 0) compositionControllers.splice(i, 1);
    comboDialogCtrl.destroy();
    comboDialogCtrl = null;
  }
  if (comboDialogEl && comboDialogEl.open) comboDialogEl.close();
}

function ensureShotDialog() {
  if (shotDialogEl && shotDialogEl.isConnected) return shotDialogEl;
  shotDialogEl = document.createElement("dialog");
  shotDialogEl.className = "detail shot-detail";
  shotDialogEl.addEventListener("click", (ev) => { if (ev.target === shotDialogEl) closeShotDetail(); });
  shotDialogEl.addEventListener("cancel", (ev) => { ev.preventDefault(); closeShotDetail(); });
  document.body.append(shotDialogEl);
  return shotDialogEl;
}

function shotDetailHTML(recipe) {
  const category = shotCategoryById.get(recipe.sourceCategory)?.name || recipe.sourceCategory;
  const stateLabel = shotStateById.get(recipe.implementationState)?.name || recipe.implementationState;
  const patternNames = recipe.patternIds.map((id) => compositionById.get(id)?.name || id);
  const layerNames = recipe.layers.map((id) => shotLayerById.get(id)?.name || id);
  const objectName = shotObjectById.get(recipe.object)?.name || recipe.object;
  const useName = shotUseById.get(recipe.narrativeUse)?.name || recipe.narrativeUse;
  const demo = SHOT_RECIPE_DEMOS[recipe.id];
  const statusBadges = [
    ["来源", recipe.status?.source === "verified" ? "已核对" : "待核对", recipe.status?.source === "verified"],
    ["演示", recipe.status?.demo === "verified" ? "已验证" : "待校准", recipe.status?.demo === "verified"],
    ["生产", recipe.status?.production === "ready" ? "实现可用" : "未接入", recipe.status?.production === "ready"],
  ].map(([k, v, ok]) => `<span class="shot-status ${ok ? "ok" : "warn"}">${esc(k)} · ${esc(v)}</span>`).join("");
  const shot = recipe.shot || {};
  const prodDesc = [
    `镜头卡 ID：${recipe.id}`,
    `适用意图：${shot.intent || recipe.summary}`,
    `主体：${shot.subject || "—"}`,
    `摄影机行为：${shot.camera || "—"}`,
    `主体行为：${shot.subjectAction || "—"}`,
    `时间节点：${shot.timing || recipe.duration}`,
    `前后镜头衔接：${shot.seams || "—"}`,
    `关键约束：${shot.constraints || recipe.avoidWhen}`,
  ].join("\n");
  return `<div class="detail-card">
    <div class="detail-head">
      <div class="meta"><h2>${recipe.presentation?.role==='technical'?'技术做法 · ':''}${esc(recipe.nameZh)}</h2><div class="en">${esc(recipe.name)} · ${esc(category)} · ${esc(stateLabel)}</div></div>
      <button class="close" data-shot-close aria-label="关闭">×</button>
    </div>
    <div class="detail-body">
      <div class="detail-left">
        <div class="shot-player-frame" data-shot-demo-host></div>
        <div class="player">
          <button class="btn primary" data-shot-play>播放演示</button>
          <button class="btn" data-shot-reset>起点</button>
          <input type="range" min="0" max="1000" value="0" data-shot-scrub aria-label="演示进度" />
          <span class="readout" data-shot-readout>F 0</span>
        </div>
        <div class="shot-demo-beats">${demo ? demo.beats.map((beat, index) => `<button data-shot-beat="${beat.at}">${index + 1}. ${esc(beat.label)} · ${Math.round(beat.at * 100)}%</button>`).join("") : ""}</div>
      </div>
      <div class="detail-right">
        <div class="shot-tags">${statusBadges}<span class="shot-chip shot-object">${esc(objectName)}</span><span class="shot-chip shot-use">${esc(useName)}</span>${shotTagChips(recipe)}</div>
        <p>${esc(recipe.summary)}</p>
        <div class="shot-demo-description"><strong>示意范围</strong>当前是二维 SVG 原理图；运镜与表演文字描述是目标语法，实际生产需单独选择并验证实现。</div><div class="shot-demo-description"><strong>演示内容</strong>${demo ? esc(demo.description) : "—"}</div>
        <details class="collapse" open><summary>验收三问 · 观众应该回答什么</summary>
          <ol class="shot-qa">
            <li><strong>画面中的什么在动</strong>${esc(shot.subjectAction || "—")}</li>
            <li><strong>视点有没有动</strong>${esc(shot.camera || "—")}</li>
            <li><strong>何时切换 / 观众最终看哪里</strong>${esc(shot.timing || recipe.duration)}；${esc(shot.seams || "—")}</li>
          </ol>
        </details>
        ${selfCheckHTML()}
        <div class="shot-prod-desc"><strong>可复制制作描述</strong><pre>${esc(prodDesc)}</pre>
          <div class="shot-actions"><button class="btn" data-shot-copy-description>复制制作描述</button><button class="btn" data-shot-copy-link>复制卡片链接</button></div>
        </div>
        <dl class="shot-detail-dl">
          <dt>适用</dt><dd>${esc(recipe.applicable)}</dd>
          <dt>建议时长</dt><dd>${esc(recipe.duration)}</dd>
          <dt>避免</dt><dd>${esc(recipe.avoidWhen)}</dd>
          <dt>入选理由</dt><dd>${esc(recipe.selectionReason)}</dd>
        </dl>
        <div class="shot-recipe-group"><strong>所属层</strong><div class="chips">${layerNames.map((name) => `<span class="chip">${esc(name)}</span>`).join("")}</div></div>
        <div class="shot-recipe-group"><strong>映射配方</strong><div class="chips">${patternNames.map((name) => `<span class="chip">${esc(name)}</span>`).join("")}</div></div>
        <div class="shot-recipe-group"><strong>适用配方说明</strong><p class="shot-pattern-usage">${esc(recipe.patternUsage || "—")}</p></div>
        <div class="shot-recipe-group"><strong>可复用能力</strong><div class="chips">${recipe.effectIds.map((id) => `<span class="chip mono">${esc(id)}</span>`).join("")}</div></div>
        ${Array.isArray(recipe.aliases) && recipe.aliases.length ? `<div class="shot-recipe-group"><strong>合并变体（${recipe.aliases.length}）</strong><div class="shot-evidence">${recipe.aliases.map((a) => `<div class="shot-evidence-item"><span class="chip mono">${esc(a.nameZh)}</span><span>${esc(a.note)}<small>原卡 ${esc(a.id)}</small></span></div>`).join("")}</div></div>` : ""}
        ${Array.isArray(recipe.evidence) && recipe.evidence.length ? `<div class="shot-recipe-group"><strong>视频证据（${recipe.evidence.length}）</strong><div class="shot-evidence">${recipe.evidence.map((e) => `<div class="shot-evidence-item"><span class="chip mono">${esc(e.at || "")}</span><span>${esc(e.video)}${e.note ? `<small>${esc(e.note)}</small>` : ""}</span></div>`).join("")}</div></div>` : ""}
        ${isVideoRecipe(recipe)
          ? `<div class="shot-source video-source">来源：第二批卡片，提炼自 ${VIDEO_SOURCE.videoCount} 支真实产品宣传视频的逐帧拆解（本地资料，非开源仓库）；证据见上。</div>`
          : `<a class="shot-source" href="${esc(shotSourceUrl(recipe))}" target="_blank" rel="noopener">查看固定提交来源 ↗</a>`}
      </div>
    </div>
  </div>`;
}

function openRetiredReference(name,summary,patternIds,id,recipe=null) {
  closeShotDetail();
  shotDialogCurrentId=id;
  const dlg=ensureShotDialog();
  const related=CINE_SEQS.filter(q=>q.collection==='director'&&patternIds.includes(q.mapsToCombo));
  dlg.innerHTML=`<div class="detail-card"><div class="detail-head"><div><h2>${esc(name)}</h2><p class="sub">原理索引 · ${esc(id)}</p></div><button class="close" data-shot-close aria-label="关闭">×</button></div>
  <div class="retired-reference"><p class="sub">旧演示已撤下。这里保留原理与来源，便于查阅；下面的案例是相关参考，并非此技法的完整替代。</p><p>${esc(summary)}</p>
  ${recipe?.shot?`<dl class="shot-detail-dl"><dt>观众理解</dt><dd>${esc(recipe.shot.intent)}</dd><dt>主体动作</dt><dd>${esc(recipe.shot.subjectAction)}</dd><dt>视点</dt><dd>${esc(recipe.shot.camera)}</dd><dt>衔接</dt><dd>${esc(recipe.shot.seams)}</dd></dl>`:''}
  ${related.length?`<h3>相关案例</h3><div class="director-links">${related.map(q=>`<button class="btn" data-related-case="${q.id}">${esc(q.name)}</button>`).join('')}</div>`:''}
  <h3>相关叙事结构</h3><div class="director-links">${patternIds.map(pid=>directorPatternById.get(pid)).filter(Boolean).map(q=>`<button class="btn" data-related-pattern="${q.id}">${esc(q.name)}</button>`).join('')}</div>
  ${recipe&&!isVideoRecipe(recipe)?`<p><a href="${esc(shotSourceUrl(recipe))}" target="_blank" rel="noopener">查看固定提交来源 ↗</a></p>`:''}</div></div>`;
  dlg.showModal();
  dlg.querySelector('[data-shot-close]').onclick=closeShotDetail;
  dlg.querySelectorAll('[data-related-case]').forEach(b=>b.onclick=()=>{closeShotDetail();openCineDetail(b.dataset.relatedCase);});
  dlg.querySelectorAll('[data-related-pattern]').forEach(b=>b.onclick=()=>{closeShotDetail();openComboDetail(b.dataset.relatedPattern);});
}

async function openShotDetail(id, {technicalContext=false}={}) {
  const recipe = SHOT_RECIPES.find((x) => x.id === id);
  if (!recipe) return;
  if(recipe.presentation?.role==='technical' && !technicalContext){go(`#/effect/${recipe.presentation.canonicalEffectId}?from=dictionary&recipe=${encodeURIComponent(recipe.id)}`);return;}
  if(recipe.presentation?.role==='director'){
    if(recipe.presentation.replacementCaseId){shotDialogCurrentId=id;openCineDetail(recipe.presentation.replacementCaseId);return;}
    openRetiredReference(recipe.nameZh,recipe.summary,recipe.patternIds,id,recipe);return;
  }
  if(technicalContext)activeDemo?.pause();
  shotDialogCurrentId = id;
  const dlg = ensureShotDialog();
  dlg.innerHTML = shotDetailHTML(recipe);
  dlg.showModal();
  const demo = SHOT_RECIPE_DEMOS[recipe.id];
  const host = dlg.querySelector("[data-shot-demo-host]");
  const play = dlg.querySelector("[data-shot-play]");
  const reset = dlg.querySelector("[data-shot-reset]");
  const scrub = dlg.querySelector("[data-shot-scrub]");
  const readout = dlg.querySelector("[data-shot-readout]");
  dlg.querySelector("[data-shot-close]").onclick = closeShotDetail;
  if (demo) {
    const ctrl = mountShotRecipePreview(host, recipe, demo, { fps: 24, durationMs: demo.durationMs, representativeFrame: 0 });
    shotDialogCtrl = ctrl;
    shotRecipeControllers.push(ctrl);
    const sync = (frame) => {
      scrub.value = String(Math.round((frame / ctrl.totalFrames) * 1000));
      readout.textContent = `F ${frame} / ${ctrl.totalFrames}`;
    };
    ctrl.onFrame = sync;
    ctrl.onStateChange = (next) => { play.textContent = next === "play" ? "暂停" : ctrl.frame >= ctrl.totalFrames ? "重播演示" : "播放演示"; };
    play.onclick = () => play.textContent === "暂停" ? ctrl.pause() : ctrl.play();
    reset.onclick = () => { ctrl.pause(); sync(ctrl.seekFrame(0).frame); play.textContent = "播放演示"; };
    scrub.oninput = () => { ctrl.pause(); sync(ctrl.seekFrame((Number(scrub.value) / 1000) * ctrl.totalFrames).frame); play.textContent = "播放演示"; };
    dlg.querySelectorAll("[data-shot-beat]").forEach((button) => {
      button.onclick = () => { ctrl.pause(); sync(ctrl.seekFrame(Number(button.dataset.shotBeat) * ctrl.totalFrames).frame); play.textContent = "播放演示"; };
    });
    dlg.querySelector("[data-shot-copy-description]").onclick = async (event) => {
      const shot = recipe.shot || {};
      const desc = [
        `镜头卡 ID：${recipe.id}`,
        `适用意图：${shot.intent || recipe.summary}`,
        `主体：${shot.subject || "—"}`,
        `摄影机行为：${shot.camera || "—"}`,
        `主体行为：${shot.subjectAction || "—"}`,
        `时间节点：${shot.timing || recipe.duration}`,
        `前后镜头衔接：${shot.seams || "—"}`,
        `关键约束：${shot.constraints || recipe.avoidWhen}`,
        `演示时长：${demo.durationMs}ms · 动作节点：${demo.beats.map((b) => `${b.label}@${Math.round(b.at * 100)}%`).join(" → ")}`,
      ].join("\n");
      const button=event.currentTarget;
      try { await copyTextNow(desc); button.textContent = "已复制"; }
      catch { button.textContent = "复制失败"; }
    };
    dlg.querySelector("[data-shot-copy-link]").onclick = async (event) => {
      const button=event.currentTarget;
      try { await copyTextNow(`${location.origin}${location.pathname}${shotHash(recipe.id)}`); button.textContent = "已复制"; }
      catch { button.textContent = "复制失败"; }
    };
    sync(ctrl.frame);
    play.focus();
  } else {
    host.innerHTML = `<div class="empty">该镜头卡没有独立演示预览。</div>`;
  }
}

function closeShotDetail() {
  shotDialogCurrentId = null;
  if (shotDialogCtrl) {
    const i = shotRecipeControllers.indexOf(shotDialogCtrl);
    if (i >= 0) shotRecipeControllers.splice(i, 1);
    shotDialogCtrl.destroy();
    shotDialogCtrl = null;
  }
  if (shotDialogEl && shotDialogEl.open) shotDialogEl.close();
}

/* ------------------------------------------------------------------ */
/* 详情：原生 dialog + 单侧更新                                        */
/* ------------------------------------------------------------------ */

let dialogEl = null;

function ensureDialog() {
  if (dialogEl && dialogEl.isConnected) return dialogEl;
  dialogEl = document.createElement("dialog");
  dialogEl.className = "detail";
  dialogEl.innerHTML = `<div class="detail-card" data-card></div>`;
  dialogEl.addEventListener("click", (ev) => {
    if (ev.target === dialogEl) closeDetail();
  });
  dialogEl.addEventListener("cancel", (ev) => {
    ev.preventDefault();
    closeDetail();
  });
  document.body.append(dialogEl);
  return dialogEl;
}

function closeDetail() {
  const ctx = state.detailCtx || {};
  const view = ctx.from && ctx.from !== "effect" ? ctx.from : "dictionary";
  const scenario = ctx.scenario && scenarioById.has(ctx.scenario) ? ctx.scenario : state.scenario;
  const q = ctx.q ?? "";
  const fit = ctx.fit || "all";
  const target = view === "scenario" ? listHash("scenario", scenario, { q, fit }) : listHash(view, scenario, { q, fit });
  go(target, { replace: true });
}

function outputBlocks(cfg) {
  return `
  <div class="out-block">
    <h4>制作指令（中文）</h4>
    <div class="out-text" data-instruction>${esc(buildInstruction(cfg))}</div>
    <button class="btn primary" data-copy="instruction">复制制作指令</button>
  </div>
  <div class="out-block">
    <h4>镜头配置（JSON）</h4>
    <div class="out-text mono small" data-config>${esc(fmtJsonShort(cfg))}</div>
    <button class="btn" data-copy="config">复制镜头配置</button>
  </div>`;
}

function fmtJsonShort(cfg) {
  const txt = buildConfigJson(cfg);
  return txt.length > 1800 ? `${txt.slice(0, 1800)}\n… （复制得到完整 JSON）` : txt;
}

function technicalRecipesHTML(effect){
  const recipes=TECHNICAL_RECIPES.filter(r=>r.presentation.canonicalEffectId===effect.id);
  if(!recipes.length)return '';
  return `<section class="dsec technical-recipes"><h3>关联技术做法 <span class="chip">${recipes.length}</span></h3><p class="sub">这些记录提供有来源的局部实现组合，不增加同名词条；关联本词条不表示技术完全等价或已适配。</p>${recipes.map(r=>`<details class="collapse" ${state.technicalRecipe===r.id?'open':''}><summary>${esc(r.nameZh)}</summary><div class="collapse-body"><p>${esc(r.summary)}</p><p><strong>使用条件：</strong>${esc(r.applicable)}</p><p><strong>限制：</strong>${esc(r.avoidWhen)}</p><button class="btn" data-technical-open="${r.id}">查看技术原理示意与来源</button><p class="sub">记录 ${esc(r.id)}；${esc(r.presentation.reason)}</p></div></details>`).join('')}</section>`;
}

function detailHTML(e) {
  const sid = state.view === "scenario" ? state.scenario : state.detailCtx?.scenario;
  const scenario = sid ? scenarioById.get(sid) : null;
  const preset = presetOf(e.id);
  const params = detailParams[e.id] || {};
  const selectedProfile = PRODUCTION.projectProfiles?.find((item) => item.id === params.profileId);
  const cfg = effectiveConfig({ effect: e, preset: { ...preset, content: { ...preset.content, ...(params.content || {}) } }, production: PRODUCTION, device: DEVICE, scenario, params, chart: chartDataFor(e) });
  const errs = chartError(e);
  const list = visibleEffects();
  let idx = list.findIndex((x) => x.id === e.id);
  let navList = list;
  if (idx < 0) {
    navList = EFFECTS.slice().sort((a, b) => a.no - b.no);
    idx = navList.findIndex((x) => x.id === e.id);
  }
  const prev = idx > 0 ? navList[idx - 1] : null;
  const next = idx < navList.length - 1 ? navList[idx + 1] : null;
  const scenNotes = SCENARIOS.map((s) => ({ s, fit: e.scenarios[s.id], note: s.notes && s.notes[e.id] }));

  return `
  <div class="detail-head">
    <div class="meta">
      <h2>${esc(e.zh)}</h2>
      <div class="en">${esc(e.en)} · #${e.no}</div>
      <div class="subrow">
        <span class="badge" style="color:${groupColor(e.group)};border-color:${groupColor(e.group)}">${esc(e.group)}</span>
        <span class="badge niche">${NATURE_LABEL[e.nature]}</span>
        ${sid ? `<span class="badge ${e.scenarios[sid]}" style="color:var(${FIT_VAR[e.scenarios[sid]]})">本场景 · ${FIT_LABEL[e.scenarios[sid]]}</span>` : ""}
        ${e.niche ? '<span class="badge niche">专精</span>' : ""}
        <span class="badge ${capabilityFor(e.id) === "production-adapted" ? "core" : "niche"}">${CAPABILITY_LABEL[capabilityFor(e.id)]}</span>
      </div>
    </div>
    <button class="close" data-close aria-label="关闭">×</button>
  </div>

  <div class="detail-body">
    <div class="detail-left">
      <div data-demo-host></div>
      <div class="player">
        <button class="btn" data-play>播放</button>
        <button class="btn" data-reset>回到起点</button>
        <input type="range" min="0" max="1000" value="0" data-scrub aria-label="进度" />
        <span class="readout" data-readout>F 0 / 0</span>
        <button class="btn mode" data-mode hidden>切换到交互原理</button>
      </div>
      ${errs ? `<div class="fact warn"><h4>示例数据校验未通过，已停止播放</h4><ul class="list">${errs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><p class="sub">界面不会静默修改数据。</p></div>` : ""}
    </div>

    <div class="detail-right">
      <section class="dsec">
        <h4>当前参数</h4>
        <div class="params">
          <label class="p-hide">画幅
            <select data-param="format">
              ${PRODUCTION.formats.map((f) => `<option value="${f.id}" ${(params.format || selectedProfile?.format || "16:9") === f.id ? "selected" : ""}>${f.id}（${f.width}×${f.height}）</option>`).join("")}
            </select>
          </label>
          <label class="p-hide">项目预设
            <select data-param="profileId">
              <option value="">通用默认</option>
              ${(PRODUCTION.projectProfiles || []).map((p) => `<option value="${p.id}" ${params.profileId === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("")}
            </select>
          </label>
          <label>帧率
            <select data-param="fps">
              ${PRODUCTION.fpsOptions.map((f) => `<option value="${f}" ${(params.fps || selectedProfile?.fps || PRODUCTION.fps) === f ? "selected" : ""}>${f}</option>`).join("")}
            </select>
          </label>
          <label>动作 <output data-out="actionMs">${cfg.timeline.actionMs}</output>ms
            <input type="range" min="120" max="4000" step="20" value="${cfg.timeline.actionMs}" data-param="actionMs" />
          </label>
          <label>停留 <output data-out="holdMs">${cfg.timeline.holdMs}</output>ms
            <input type="range" min="0" max="3000" step="20" value="${cfg.timeline.holdMs}" data-param="holdMs" />
          </label>
          ${editableContentFields(e, preset.content, params.content)}
        </div>
      </section>

      ${outputBlocks(cfg)}
      ${technicalRecipesHTML(e)}

      <section class="dsec">
        <h4>核心动作</h4>
        <p>${esc(e.core)}</p>
        <h4>常见类型</h4>
        <ul class="list">${e.variants.map((v) => `<li>${esc(v)}</li>`).join("")}</ul>
        <h4>适合 / 禁忌</h4>
        <div class="chips">${e.fits.map((v) => `<span class="chip ok">${esc(v)}</span>`).join("")}</div>
        <div class="chips">${e.avoid.map((v) => `<span class="chip warn">避开：${esc(v)}</span>`).join("")}</div>
        <h4>落地到动效视频</h4>
        <p>${esc(e.video)}</p>
        <h4>场景适配度</h4>
        <table class="matrix"><tbody>
          ${scenNotes
            .map(
              ({ s, fit, note }) => `<tr><td>${esc(s.name)}</td><td class="fit" style="color:var(${FIT_VAR[fit]})">${FIT_LABEL[fit]}</td><td>${note ? esc(note) : "—"}</td></tr>`,
            )
            .join("")}
        </tbody></table>
        <h4>案例${e.cases?.length ? `（${e.cases.length}）` : ""}</h4>
        ${
          e.cases?.length
            ? e.cases
                .map(
                  (c) => `<div class="fact"><h4>${esc(c.title)}</h4>
                    ${c.source ? `<p><a href="${esc(c.source)}" target="_blank" rel="noopener">${esc(c.source)}</a></p>` : ""}
                    ${c.scenario ? `<p class="sub">所属场景：${esc(c.scenario)}</p>` : ""}
                    ${c.preview ? `<p class="sub">预览：<code>${esc(c.preview)}</code></p>` : ""}
                    <p>${esc(c.why || "")}</p>
                    ${c.borrow ? `<p class="sub">可借鉴：${esc(c.borrow)}</p>` : ""}
                    ${c.params ? `<p class="mono small">观察参数：${esc(JSON.stringify(c.params))}</p>` : ""}
                  </div>`,
                )
                .join("")
            : `<div class="empty">还没有收集案例。案例可写在 <code>data/effects.json</code> 的 <code>${esc(e.id)}</code> → <code>cases</code>。演示素材不会被当作真实案例。</div>`
        }
      </section>
    </div>
  </div>

  <div class="detail-foot">
    <button class="nav-btn" data-prev ${prev ? "" : "disabled"}>‹ 上一个</button>
    <span class="pos">${idx + 1} / ${navList.length}</span>
    <button class="nav-btn" data-next ${next ? "" : "disabled"}>下一个 ›</button>
  </div>`;
}

function editableContentFields(e, baseContent, overrides) {
  const merged = { ...baseContent, ...(overrides || {}) };
  const fields = [];
  const ARRAYS = ["lines", "groups", "words", "cards", "steps", "paragraphs", "sections"];
  const arrKey = ARRAYS.find((k) => Array.isArray(merged[k]));
  if (arrKey) {
    fields.push([arrKey, `${arrKey}（每行一项）`, "array", merged[arrKey].join("\n")]);
  } else if (typeof merged.title === "string") fields.push(["title", "标题", "text", merged.title]);
  else if (typeof merged.text === "string") fields.push(["text", "文本", "text", merged.text]);
  else if (typeof merged.word === "string") fields.push(["word", "文字", "text", merged.word]);
  else if (typeof merged.command === "string") fields.push(["command", "命令", "text", merged.command]);
  else if (typeof merged.value === "number") fields.push(["value", "数值", "number", merged.value]);
  if (typeof merged.sub === "string") fields.push(["sub", "说明", "text", merged.sub]);
  if (!fields.length) {
    return `<p class="sub">该演示没有可编辑的文案或数值字段（它的内容由参数与数据决定）。</p>`;
  }
  return fields
    .map(([k, label, type, value]) => {
      if (type === "array") {
        return `<label>${label}<textarea data-content="${k}" data-type="array" rows="4">${esc(value)}</textarea></label>`;
      }
      return `<label>${label}<input type="${type === "number" ? "number" : "text"}" data-content="${k}" data-type="${type}" value="${esc(value)}" /></label>`;
    })
    .join("");
}

/* ------------------------------------------------------------------ */
/* 详情挂载                                                            */
/* ------------------------------------------------------------------ */

async function openDetail(id, { focusCard } = {}) {
  const e = effectById.get(id);
  const dlg = ensureDialog();
  const card = dlg.querySelector("[data-card]");

  if (!e) {
    card.innerHTML = `<div class="detail-head"><div class="meta"><h2>找不到这个条目</h2><div class="en">${esc(id)}</div></div><button class="close" data-close>×</button></div>
      <div class="detail-body"><div class="empty">链接里的词条 id 不存在。可能是链接写错了，或该条目已被重命名。<div class="row mt"><button class="btn primary" data-close>返回列表</button></div></div></div>`;
    card.querySelector("[data-close]").onclick = closeDetail;
    if (!dlg.open) dlg.showModal();
    return;
  }

  card.innerHTML = detailHTML(e);
  card.querySelectorAll('[data-technical-open]').forEach(b=>{b.onclick=()=>openShotDetail(b.dataset.technicalOpen,{technicalContext:true});});
  if (!dlg.open) dlg.showModal();
  // 初始焦点放在主操作上，而不是关闭按钮
  const firstPlay = card.querySelector("[data-play]");
  if (firstPlay) firstPlay.focus();

  // 播放器
  const host = card.querySelector("[data-demo-host]");
  const playBtn = card.querySelector("[data-play]");
  const resetBtn = card.querySelector("[data-reset]");
  const scrub = card.querySelector("[data-scrub]");
  const readout = card.querySelector("[data-readout]");
  const modeBtn = card.querySelector("[data-mode]");
  const preset = presetOf(e.id);
  const params = detailParams[e.id] || {};
  const baseContent = { ...preset.content, ...(params.content || {}) };
  const chart = chartDataFor(e);

  await mountPreview();

  async function mountPreview() {
    if (activeDemo) {
      activeDemo.destroy();
      activeDemo = null;
    }
    if (playerUnsub) {
      playerUnsub();
      playerUnsub = null;
    }
    const p = detailParams[e.id] || {};
    const resolvedConfig = effectiveConfig({
      effect: e,
      preset: { ...preset, content: { ...preset.content, ...(p.content || {}) } },
      production: PRODUCTION,
      device: DEVICE,
      scenario: state.view === "scenario" ? scenarioById.get(state.scenario) : state.detailCtx?.scenario ? scenarioById.get(state.detailCtx.scenario) : null,
      params: p,
      chart,
    });
    // 重挂期间先给出目标总帧数，避免进度读数停在初始化时的 0/0
    readout.textContent = `F 0 / ${resolvedConfig.timeline.visibleFrames}`;
    playBtn.disabled = true;
    scrub.disabled = true;
    activeDemo = await mountDemo(host, e, {
      preset: runtimePreset(preset, resolvedConfig),
      resolvedConfig,
      chart,
      mode: "video",
    });
    const ctrl = activeDemo;
    // 总帧数直接取自已解析配置，避免与预览/输出的时间解释分叉
    const totalFrames = Math.max(1, resolvedConfig.timeline.visibleFrames);
    ctrl.onStateChange = () => syncPlay();
    playBtn.textContent = prefersReduced() ? "显示终态" : "播放";
    // 没有交互模式的演示：按钮保持可见但置灰（hidden 会被 .btn 的 display 覆盖，不能靠它）
    const canInteract = !!ctrl.capabilities.interactive;
    modeBtn.hidden = false;
    modeBtn.disabled = !canInteract;
    modeBtn.classList.toggle("inactive", !canInteract);
    modeBtn.title = canInteract ? "" : "该演示为自动播放，没有可切换的交互原理";
    // 重挂后总是回到视频演示模式，清掉上一次交互模式的禁用态
    playBtn.disabled = false;
    scrub.disabled = false;
    playerUnsub = ctrl.onFrame((ms) => {
      const f = Math.round((ms / ctrl.durationMs) * totalFrames);
      readout.textContent = `F ${f} / ${totalFrames} · ${Math.round((ms / ctrl.durationMs) * 100)}%`;
      scrub.value = String(Math.round((ms / ctrl.durationMs) * 1000));
    });

    function syncPlay() {
      playBtn.textContent = ctrl.isPlaying() ? "暂停" : ctrl.t >= 1 ? "重播" : prefersReduced() ? "显示终态" : "播放";
    }
    playBtn.onclick = () => {
      if (ctrl.isPlaying()) ctrl.pause();
      else if (ctrl.t >= 1) {
        ctrl.reset();
        ctrl.play();
      } else ctrl.play();
      syncPlay();
    };
    resetBtn.onclick = () => {
      ctrl.reset();
      syncPlay();
    };
    scrub.oninput = () => {
      ctrl.seek((Number(scrub.value) / 1000) * ctrl.durationMs);
      syncPlay();
    };
    if (canInteract) {
      modeBtn.onclick = () => {
        const toInteractive = modeBtn.dataset.mode !== "interactive";
        modeBtn.dataset.mode = toInteractive ? "interactive" : "video";
        modeBtn.textContent = toInteractive ? "切换到视频演示" : "切换到交互原理";
        if (toInteractive) {
          ctrl.pause();
          ctrl.setInteractive(true);
          playBtn.disabled = true;
          scrub.disabled = true;
          readout.textContent = "交互模式（由真实滚动 / 指针驱动，无进度条）";
        } else {
          ctrl.setInteractive(false);
          playBtn.disabled = false;
          scrub.disabled = false;
          ctrl.reset();
          syncPlay();
        }
      };
      modeBtn.dataset.mode = "video";
      modeBtn.hidden = false;
    }
    syncPlay();
    // 打开详情即播放一次：默认展示「进入—动作—停留—结束」。
    // 减少动态时 controller.play() 会直接给静态终态，不做位移动画。
    ctrl.play();
    syncPlay();
  }

  // 参数编辑
  const refreshOutputs = () => {
    const p = detailParams[e.id] || {};
    const cfg = effectiveConfig({
      effect: e,
      preset: { ...preset, content: { ...preset.content, ...(p.content || {}) } },
      production: PRODUCTION,
      device: DEVICE,
      scenario: state.view === "scenario" ? scenarioById.get(state.scenario) : state.detailCtx?.scenario ? scenarioById.get(state.detailCtx.scenario) : null,
      params: p,
      chart,
    });
    card.querySelector("[data-instruction]").textContent = buildInstruction(cfg);
    card.querySelector("[data-config]").textContent = fmtJsonShort(cfg);
    const a = card.querySelector('[data-out="actionMs"]');
    const hh = card.querySelector('[data-out="holdMs"]');
    if (a) a.textContent = String(cfg.timeline.actionMs);
    if (hh) hh.textContent = String(cfg.timeline.holdMs);
    return cfg;
  };

  card.querySelectorAll("[data-param]").forEach((el) => {
    el.oninput = () => {
      const p = (detailParams[e.id] = detailParams[e.id] || {});
      p[el.dataset.param] = el.type === "range" ? Number(el.value) : el.value;
      if (el.dataset.param === "profileId" && el.value) {
        const profile = PRODUCTION.projectProfiles.find((item) => item.id === el.value);
        if (profile) {
          p.format = profile.format;
          p.fps = profile.fps;
          card.querySelector('[data-param="format"]').value = profile.format;
          card.querySelector('[data-param="fps"]').value = String(profile.fps);
        }
      }
      refreshOutputs();
      if (el.dataset.param === "actionMs" || el.dataset.param === "holdMs") {
        // 时长直接影响演示节奏：重挂一次
      }
    };
    el.onchange = () => {
      if (el.dataset.param === "actionMs" || el.dataset.param === "holdMs" || el.dataset.param === "format" || el.dataset.param === "fps" || el.dataset.param === "profileId") {
        mountPreview();
      }
    };
  });
  card.querySelectorAll("[data-content]").forEach((el) => {
    el.onchange = () => {
      const p = (detailParams[e.id] = detailParams[e.id] || {});
      p.content = { ...(p.content || {}) };
      const kind = el.dataset.type;
      if (kind === "array") {
        p.content[el.dataset.content] = el.value
          .split("\n")
          .map((s) => s.trimEnd())
          .filter((s) => s.length);
      } else {
        p.content[el.dataset.content] = kind === "number" ? Number(el.value) : el.value;
      }
      refreshOutputs();
      mountPreview();
    };
  });

  // 复制
  card.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.onclick = async () => {
      const p = detailParams[e.id] || {};
      const cfg = effectiveConfig({
        effect: e,
        preset: { ...preset, content: { ...preset.content, ...(p.content || {}) } },
        production: PRODUCTION,
        device: DEVICE,
        scenario: state.view === "scenario" ? scenarioById.get(state.scenario) : null,
        params: p,
        chart,
      });
      const text = btn.dataset.copy === "instruction" ? buildInstruction(cfg) : buildConfigJson(cfg);
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "已复制";
      } catch {
        btn.textContent = "复制失败，请手动选择";
      }
      setTimeout(() => (btn.textContent = btn.dataset.copy === "instruction" ? "复制制作指令" : "复制镜头配置"), 1600);
    };
  });

  // 导航
  const list = visibleEffects();
  let idx = list.findIndex((x) => x.id === e.id);
  let navList = list;
  if (idx < 0) {
    navList = EFFECTS.slice().sort((a, b) => a.no - b.no);
    idx = navList.findIndex((x) => x.id === e.id);
  }
  const prevBtn = card.querySelector("[data-prev]");
  const nextBtn = card.querySelector("[data-next]");
  if (prevBtn && idx > 0) prevBtn.onclick = () => go(effectHash(navList[idx - 1].id));
  if (nextBtn && idx < navList.length - 1) nextBtn.onclick = () => go(effectHash(navList[idx + 1].id));
  card.querySelectorAll("[data-close]").forEach((b) => (b.onclick = closeDetail));

  if (focusCard !== undefined) card.scrollTop = 0;
  dlg.querySelector(".detail-body")?.scrollTo?.({ top: 0 });
}

function renderDetail() {
  const dlg = ensureDialog();
  if (state.detail) {
    openDetail(state.detail);
    return;
  }
  if (dlg.open) {
    // 关闭时必须销毁演示与订阅，否则动画与监听会残留
    if (activeDemo) {
      activeDemo.destroy();
      activeDemo = null;
    }
    if (playerUnsub) {
      playerUnsub();
      playerUnsub = null;
    }
    const card = dlg.querySelector("[data-card]");
    if (card) card.innerHTML = "";
    dlg.close();
  }
}

/* ------------------------------------------------------------------ */
/* 卡片悬停预览                                                        */
/* ------------------------------------------------------------------ */

let cardObserver = null;

function bindCards(root) {
  if (cardObserver) cardObserver.disconnect();
  // 只给进入视口的卡片挂载真实代表帧：既满足「默认就能看到效果」，又不让上百个演示同时存活
  cardObserver = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        const card = en.target;
        if (en.isIntersecting) card.__mountStill && card.__mountStill();
        else card.__unmountStill && card.__unmountStill();
      }
    },
    { root: root.closest(".main") || null, rootMargin: "220px 0px" },
  );

  root.querySelectorAll(".card[data-effect]").forEach((card) => {
    const live = card.querySelector("[data-preview]");
    const e = effectById.get(card.dataset.effect);
    if (!live || !e) return;
    const still = presetOf(e.id).still ?? 0.55;
    let ctrl = null;
    let mounting = null;

    const ensure = async () => {
      if (ctrl) return ctrl;
      if (mounting) return mounting;
      mounting = mountDemo(live, e, {
        compact: true,
        preset: presetOf(e.id),
        chart: chartDataFor(e),
        initialT: still,
      }).then((c) => {
        ctrl = c;
        mounting = null;
        card.classList.add("has-preview");
        return c;
      });
      return mounting;
    };
    const release = () => {
      if (ctrl) {
        ctrl.destroy();
        ctrl = null;
      }
      card.classList.remove("has-preview");
    };

    card.__mountStill = () => {
      ensure();
    };
    card.__unmountStill = () => {
      if (ctrl && ctrl.isPlaying()) return;
      release();
    };

    const play = () => {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(async () => {
        if (hoverDemo && hoverDemo !== ctrl) {
          try {
            hoverDemo.pause();
          } catch {
            /* 忽略 */
          }
        }
        const c = await ensure();
        c.reset();
        c.play();
        hoverDemo = c;
      }, 90);
    };
    const stop = () => {
      clearTimeout(hoverTimer);
      if (!ctrl) return;
      ctrl.pause();
      ctrl.seek(still * ctrl.durationMs);
    };

    card.addEventListener("mouseenter", play);
    card.addEventListener("mouseleave", stop);
    card.addEventListener("focus", play);
    card.addEventListener("blur", stop);
    card.__cleanup = release;
    cardObserver.observe(card);
  });
}

function destroyHoverPreviews(root) {
  if (cardObserver) {
    cardObserver.disconnect();
    cardObserver = null;
  }
  root.querySelectorAll(".card").forEach((c) => {
    if (c.__unmountStill) c.__unmountStill();
    if (c.__cleanup) c.__cleanup();
  });
}

/* ------------------------------------------------------------------ */
/* 渲染                                                                */
/* ------------------------------------------------------------------ */

function render({ force = false } = {}) {
  const parsed = parseHash();
  Object.assign(state, parsed);

  const key = `${state.view}|${state.scenario}|${state.query}|${state.fit}|${state.view==='compositions'?compositionView.subview:''}`;
  const listChanged = force || key !== listKeyCache;
  const main = app.querySelector(".main");
  const rail = app.querySelector(".rail");

  if (listChanged) {
    if (main) scrollTops.set(listKeyCache, main.scrollTop);
    if (rail) rail.innerHTML = railHTML();
    if (main) {
      destroyHoverPreviews(main);
      destroyCompositions();
      main.innerHTML = renderListBody();
      main.scrollTop = scrollTops.get(key) || 0;
    }
    listKeyCache = key;
  }

  // 顶部栏状态
  app.querySelectorAll("[data-tab]").forEach((b) => {
    const [v, s] = b.dataset.tab.split("/");
    const on = v === "scenario" ? state.view === "scenario" && state.scenario === s : state.view === v || (v === "dictionary" && state.view === "scenario");
    b.setAttribute("aria-selected", String(on));
  });
  const search = app.querySelector("[data-search]");
  if (search && search.value !== state.query) search.value = state.query;
  if (search) search.placeholder = state.view === "compositions" ? "搜索参考 / ID / 主题" : "搜索动效 / English / 分组";
  const fitSel = app.querySelector("[data-fit]");
  if (fitSel && fitSel.value !== state.fit) fitSel.value = state.fit;

  if (listChanged && main) {
    bindCards(main);
    if (state.view === "compositions") {
      bindCompositions(main);

    }
  }
  if(state.shotDetail && shotDialogCurrentId!==state.shotDetail)openShotDetail(state.shotDetail);
  if (state.cineDetail && cineDetailCurrentId !== state.cineDetail) openCineDetail(state.cineDetail);
  if (listChanged && rail) bindRailActions(rail);
  if (main && listChanged) {
    main.querySelectorAll("[data-effect]").forEach((b) => {
      b.onclick = () => {
        activeCard = b;
        go(effectHash(b.dataset.effect, "card"));
      };
    });
    main.querySelectorAll("[data-clear]").forEach((b) => {
      b.onclick = () => {
        state.query = "";
        state.fit = "all";
        go(listHash(state.view, state.scenario, { q: "", fit: "all" }));
      };
    });
    main.querySelectorAll("[data-goto]").forEach((b) => {
      b.onclick = () => go(listHash(b.dataset.goto, state.scenario, { q: "", fit: "all" }));
    });
    main.querySelectorAll("[data-copy-shot]").forEach((b) => {
      b.onclick = async () => {
        const shot = (PRESETS.shots || []).find((s) => s.id === b.dataset.copyShot);
        try {
          await navigator.clipboard.writeText(JSON.stringify(shot, null, 2));
          b.textContent = "已复制";
        } catch {
          b.textContent = "复制失败";
        }
        setTimeout(() => (b.textContent = "复制镜头配置"), 1500);
      };
    });
  }

  renderDetail();
}

function shellHTML() {
  return `
  <div class="shell">
    ${topbarHTML()}
    <div class="body">
      <aside class="rail">${railHTML()}</aside>
      <main class="main">${renderListBody()}</main>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* 事件                                                                */
/* ------------------------------------------------------------------ */

function bindShell() {
  app.querySelectorAll("[data-tab]").forEach((b) => {
    b.onclick = () => {
      const [v, s] = b.dataset.tab.split("/");
      if (v === "scenario") go(listHash("scenario", s, { q: "", fit: "all" }));
      else go(listHash(v, state.scenario, { q: "", fit: "all" }));
    };
  });
  const search = app.querySelector("[data-search]");
  if (search) {
    search.oninput = () => {
      state.query = search.value;
      // 搜索不逐字写入历史：用 replaceState 保持 URL 与状态一致
      history.replaceState(null, "", listHash(state.view, state.scenario));
      const key = `${state.view}|${state.scenario}|${state.query}|${state.fit}|${state.view==='compositions'?compositionView.subview:''}`;
      const main = app.querySelector(".main");
      const rail = app.querySelector(".rail");
      if (main) {
        destroyHoverPreviews(main);
        main.innerHTML = renderListBody();
        main.scrollTop = 0;
      }
      if (rail) rail.innerHTML = railHTML();
      listKeyCache = key;
      if (main) {
        bindCards(main);
        if(state.view === 'compositions')bindCompositions(main);
        main.querySelectorAll("[data-effect]").forEach((b) => {
          b.onclick = () => go(effectHash(b.dataset.effect, "card"));
        });
        main.querySelectorAll("[data-clear]").forEach((b) => {
          b.onclick = () => {
            search.value = "";
            state.query = "";
            state.fit = "all";
            go(listHash(state.view, state.scenario, { q: "", fit: "all" }));
          };
        });
        main.querySelectorAll("[data-goto]").forEach((b) => {
          b.onclick = () => go(listHash(b.dataset.goto, state.scenario, { q: "", fit: "all" }));
        });
      }
      if (rail) bindRailActions(rail);
    };
  }
  const fitSel = app.querySelector("[data-fit]");
  if (fitSel) {
    fitSel.onchange = () => {
      state.fit = fitSel.value;
      go(listHash(state.view, state.scenario));
    };
  }
  const railToggle = app.querySelector("[data-rail-toggle]");
  if (railToggle) {
    railToggle.onclick = () => {
      const open = app.classList.toggle("rail-open");
      railToggle.setAttribute("aria-expanded", String(open));
      railToggle.textContent = open ? "收起目录与筛选" : "目录与筛选";
    };
  }
}

window.addEventListener("hashchange", () => {
  const wasDetail = state.detail;
  render();
  if (wasDetail && !state.detail && lastFocus && document.contains(lastFocus)) {
    lastFocus.focus();
    lastFocus = null;
  }
  if (!wasDetail && state.detail) lastFocus = activeCard || document.activeElement;
});

document.addEventListener("keydown", (e) => {
  const inField = /^(input|textarea|select)$/i.test(document.activeElement?.tagName || "");
  const inDialog = !!(dialogEl && dialogEl.open);
  if (e.key === "/" && !inField && !inDialog) {
    e.preventDefault();
    app.querySelector("[data-search]")?.focus();
    return;
  }
  if (inDialog && !inField && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
    const list = visibleEffects();
    let idx = list.findIndex((x) => x.id === state.detail);
    let navList = list;
    if (idx < 0) {
      navList = EFFECTS.slice().sort((a, b) => a.no - b.no);
      idx = navList.findIndex((x) => x.id === state.detail);
    }
    const to = e.key === "ArrowLeft" ? navList[idx - 1] : navList[idx + 1];
    if (to) {
      e.preventDefault();
      go(effectHash(to.id));
    }
  }
  const inComboDialog = !!(comboDialogEl && comboDialogEl.open);
  const inShotDialog = !!(shotDialogEl && shotDialogEl.open);
  if ((inComboDialog || inShotDialog) && !inField && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
    if (inComboDialog) {
      const comboList = [...app.querySelectorAll("[data-combo]")].map((c) => c.dataset.combo);
      const idx = comboList.indexOf(comboDialogCurrentId);
      const to = e.key === "ArrowLeft" ? comboList[idx - 1] : comboList[idx + 1];
      if (to) {
        e.preventDefault();
        closeComboDetail();
        openComboDetail(to);
      }
    } else {
      const shotList = [...app.querySelectorAll("[data-shot-recipe]")].filter((c) => !c.hidden).map((c) => c.dataset.shotRecipe);
      const idx = shotList.indexOf(shotDialogCurrentId);
      const to = e.key === "ArrowLeft" ? shotList[idx - 1] : shotList[idx + 1];
      if (to) {
        e.preventDefault();
        closeShotDetail();
        openShotDetail(to);
      }
    }
  }
});

/* ------------------------------------------------------------------ */
/* 启动                                                                */
/* ------------------------------------------------------------------ */

Object.assign(state, parseHash());
app.innerHTML = shellHTML();
listKeyCache = `${state.view}|${state.scenario}|${state.query}|${state.fit}`;
bindShell();
bindCards(app.querySelector(".main"));
app.querySelectorAll(".rail [data-effect]").forEach((b) => {
  b.onclick = () => go(effectHash(b.dataset.effect, "rail"));
});
Object.assign(state, parseHash());
render({ force: true });
