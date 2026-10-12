#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveCanvas, resolveTimeline, timelinePhases } from "../src/runtime-config.js";
import { effectiveConfig } from "../src/output.js";
import { computeCompositionFrame } from "../src/production/composition.js";
import { renderShotRecipeSvg } from "../src/production/shot-recipe-preview.js";
import { renderDirectorPattern, directorMoment } from "../src/production/director-pattern.js";
import { normalizeProductionInput, interactionToTimelineEvent, sampleTimelineEvent } from "../src/production/adapter.js";

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"));
const presets = read("presets.json");
const effects = read("effects.json").effects;
const combos = read("compositions.json").compositions;
const compositionScenes = read("composition-scenes.json");
const shotRecipesFile = read("shot-recipes.json");

const timeline = resolveTimeline({ actionMs: 400, staggerMs: 100, staggerCount: 4, holdMs: 600, exitMs: 200 }, {}, 30);
assert.equal(timeline.staggerSpanMs, 300);
assert.equal(timeline.totalMs, 1500);
assert.equal(timeline.visibleFrames, 45);
assert.equal(timelinePhases(1000 / 1500, timeline).hold, true);

const portrait = resolveCanvas(presets.production, { profileId: "opportunity-ai-vertical" });
assert.deepEqual([portrait.width, portrait.height, portrait.fps, portrait.layoutPreset], [1080, 1920, 30, "portrait-stack"]);

const effect = effects.find((item) => item.id === "text.line-reveal");
const cfg = effectiveConfig({ effect, preset: presets.demos[effect.id], production: presets.production, device: presets.device, scenario: null, params: { profileId: "opportunity-ai-vertical", actionMs: 640 } });
assert.equal(cfg.canvas.format, "9:16");
assert.equal(cfg.timeline.actionMs, 640);
assert.equal(cfg.timeline.staggerCount, 3);
assert.equal(cfg.timeline.visibleFrames, Math.round((cfg.timeline.totalMs / 1000) * 30));

for (const combo of combos) {
  const frames = [0, 1, 17, 3, 17, 0, 41, 9, 41].map((frame) => computeCompositionFrame(combo, frame, 30));
  assert.deepEqual(frames[2], frames[4], `${combo.id}: 随机定位同帧不一致`);
  assert.deepEqual(frames[0], frames[5], `${combo.id}: 返回起点不一致`);
  assert.deepEqual(frames[6], frames[8], `${combo.id}: 倒序定位同帧不一致`);
  assert.ok(combo.keyframes.length >= 2 && combo.keyframes.length <= 6, `${combo.id}: 代表时刻数量非法`);
  assert.ok(combo.conditions.requires.length && combo.conditions.avoidWhen.length, `${combo.id}: 使用条件不完整`);
  assert.ok(combo.attention.subject && combo.continuity.relationship, `${combo.id}: 注意力或衔接语义不完整`);
}

const operationRecipe = combos.find((item) => item.id === "combo.capsule-input-result");
const responseTrack = operationRecipe.tracks.find((item) => item.role === "systemResponse");
const resultTrack = operationRecipe.tracks.find((item) => item.role === "answerHighlight");
const inputTrack = operationRecipe.tracks.find((item) => item.role === "searchInput");
assert.ok(responseTrack.fromMs >= inputTrack.toMs, "系统响应必须发生在输入完成之后");
assert.ok(resultTrack.fromMs >= responseTrack.fromMs, "输入配方必须先出现系统响应，再揭示结果");
assert.match(operationRecipe.sharedElement, /不同对象/, "输入框与结果卡不得宣称为同一容器变形");

const focusRecipe = combos.find((item) => item.id === "combo.phone-focus-return");
assert.match(focusRecipe.attention.viewChange, /二维/, "局部取景必须标明二维推进近似");

const relayPlan = compositionScenes.plans["combo.card-relay"];
assert.equal(relayPlan.shots[0].primarySubject, "task-card", "状态变化必须绑定同一任务对象");
const comparisonPlan = compositionScenes.plans["combo.before-after-confirm"];
assert.equal(comparisonPlan.shots[0].framing, "locked-split", "前后对比必须使用固定同构视野");

for (const recipe of shotRecipesFile.recipes) {
  const demo = shotRecipesFile.demoIndex[recipe.id];
  const start = renderShotRecipeSvg(recipe, demo, 0);
  const middle = renderShotRecipeSvg(recipe, demo, 0.5);
  const end = renderShotRecipeSvg(recipe, demo, 1);
  assert.match(start, /^<svg/, `${recipe.id}: 起点没有生成 SVG`);
  assert.match(end, /<\/svg>$/, `${recipe.id}: 终点 SVG 不完整`);
  assert.notEqual(start, end, `${recipe.id}: 起点与终点画面相同`);
  assert.equal(middle, renderShotRecipeSvg(recipe, demo, 0.5), `${recipe.id}: 同一进度输出不确定`);
}

assert.throws(() => normalizeProductionInput({ frame: 1.5, fps: 30, width: 1080, height: 1920 }), /frame/);
assert.throws(() => normalizeProductionInput({ frame: 0, fps: 30, width: 1080, height: 1920, assets: [{ role: "image", uri: "https://example.com/a.png" }] }), /素材/);
const input = normalizeProductionInput({ frame: 45, fps: 30, width: 1080, height: 1920, params: { quality: "medium" }, assets: [{ role: "image", uri: "/assets/a.png" }] });
assert.equal(input.timeSec, 1.5);

const scroll = interactionToTimelineEvent({ type: "scroll", atMs: 500, durationMs: 1000, target: "phone", from: 0, to: 800 });
assert.equal(sampleTimelineEvent(scroll, 1000), 400);
assert.equal(sampleTimelineEvent(scroll, 2000), 800);

const directorPatterns=JSON.parse(readFileSync(new URL("../data/director-patterns.json",import.meta.url),"utf8")).patterns;
for(const p of directorPatterns){
  // Sampling out of order must not carry the previous shot's state.
  const reference=renderDirectorPattern(p,.57);
  for(const t of [.95,.12,1,0])assert.ok(!/NaN|undefined|Infinity/.test(renderDirectorPattern(p,t)),`${p.id}: invalid frame`);
  assert.equal(renderDirectorPattern(p,.57),reference,`${p.id}: order dependence`);
  assert.equal(directorMoment(p,0).id,p.shots[0].id);
  assert.equal(directorMoment(p,1).id,p.shots.at(-1).id);
  for(let i=1;i<p.shots.length;i++)assert.equal(directorMoment(p,p.shots[i].fromMs/p.durationMs).id,p.shots[i].id,`${p.id}: incorrect shot boundary`);
}

console.log(`运行时测试通过：配置 4 组断言 · 组合镜头 ${combos.length} 个顺/倒/随机定位 · 导演结构 ${directorPatterns.length} 个边界与乱序采样 · 镜头卡 ${shotRecipesFile.recipes.length} 个确定性演示 · 资源门禁与交互时间轨通过。`);
