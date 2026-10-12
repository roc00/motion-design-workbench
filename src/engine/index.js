/**
 * 演示引擎注册表。
 * effects.json 的 demo + demoVariant 唯一确定一个渲染器；
 * 卡片与详情使用同一个 renderer 与同一份 preset，只改变尺寸与控件（PLAN 第 3 节）。
 */
import { createStage, createController, waitForAssets, prefersReduced } from "../kit.js";
import { timelinePhases } from "../runtime-config.js";
import * as handling from "./handling.js";
import * as enter from "./enter.js";
import * as text from "./text.js";
import * as scroll from "./scroll.js";
import * as pointer from "./pointer.js";
import * as component from "./component.js";
import * as feedback from "./feedback.js";
import * as layout from "./layout.js";
import * as ux from "./ux.js";
import * as chart from "./chart.js";

export const engines = { handling, enter, text, scroll, pointer, component, feedback, layout, ux, chart };

export function hasVariant(effect) {
  const engine = engines[effect.demo];
  return !!(engine && engine.variants[effect.demoVariant]);
}

export function variantCount() {
  return Object.values(engines).reduce((n, e) => n + Object.keys(e.variants).length, 0);
}

function fallback(host, effect, msg) {
  const box = document.createElement("div");
  box.className = "empty";
  box.style.margin = "12px";
  box.textContent = `${msg}。动效名称与提示词不受影响，可在下方直接取用。`;
  host.append(box);
  return { destroy: () => (host.textContent = ""), capabilities: {}, durationMs: 0 };
}

/**
 * 挂载一个演示。
 * @param {HTMLElement} host
 * @param {object} effect   effects.json 条目
 * @param {object} opts     { compact, preset, chart, mode: 'video'|'interactive', initialT }
 * @returns {Promise<object>} 控制器（ready 已满足：资源加载完成、代表帧已渲染）
 */
export async function mountDemo(host, effect, opts = {}) {
  host.textContent = "";
  const preset = opts.preset || {};
  const engine = engines[effect.demo];
  if (!engine) return fallback(host, effect, `未知演示引擎：${effect.demo}`);
  const variant = engine.variants[effect.demoVariant];
  if (!variant) return fallback(host, effect, `引擎 ${effect.demo} 缺少变体：${effect.demoVariant}`);

  const stage = createStage(host, {
    compact: opts.compact,
    title: `${effect.zh} · ${effect.en}`,
    canvas: opts.resolvedConfig?.canvas,
  });

  let build;
  try {
    build = variant({ stage, effect, preset, chart: opts.chart });
  } catch (err) {
    stage.destroy();
    window.__lastDemoError = err && err.stack;
    return fallback(host, effect, `演示构建出错：${err.message}`);
  }

  // 预览与输出只消费同一份已解析时间轴。普通演示只负责动作段，
  // 控制器在动作后保持终态；自行处理进入/停留/退场的演示声明 timelineManaged。
  if (opts.resolvedConfig?.timeline) {
    const timeline = opts.resolvedConfig.timeline;
    const render = build.render;
    if (!build.timelineManaged && render) {
      build.render = (t, context) => render(timelinePhases(t, timeline).action, context);
    }
    build.durationMs = timeline.totalMs;
  }

  const initialT = opts.initialT != null ? opts.initialT : opts.compact ? preset.still ?? 0.55 : 0;
  const ctrl = createController(stage, build, { initialT });

  // 资源加载完成才算 ready
  await waitForAssets(stage.canvas);
  if (ctrl.__destroyed) return ctrl;
  ctrl.refresh();

  // 交互模式
  if (opts.mode === "interactive" && build.interactive) {
    ctrl.setInteractive(true);
  }
  ctrl.ready = true;
  return ctrl;
}

/** 卡片与详情共用的预设取值 */
export function presetFor(presets, id) {
  return presets?.[id] || { still: 0.55, content: {}, timeline: {} };
}

export { prefersReduced };
