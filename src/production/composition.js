import { waitForProductionAssets } from "./asset-gate.js";
import { createShaderAdapter } from "./shader-adapter.js";

const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => {
  const x = clamp(v);
  return x * x * (3 - 2 * x);
};
const trackP = (ms, track) => smooth((ms - track.fromMs) / Math.max(1, track.toMs - track.fromMs));

export function computeCompositionFrame(definition, frame, fps) {
  const maxFrame = Math.max(1, Math.round((definition.durationMs / 1000) * fps));
  const safeFrame = Math.max(0, Math.min(maxFrame, Math.round(frame)));
  const ms = (safeFrame / fps) * 1000;
  const progress = safeFrame / maxFrame;
  const tracks = Object.fromEntries(definition.tracks.map((track) => [track.role, trackP(ms, track)]));
  return { frame: safeFrame, maxFrame, ms, progress, tracks, terminal: safeFrame === maxFrame };
}

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  node.className = cls || "";
  if (text != null) node.textContent = text;
  return node;
};

function fitCanvas(host, canvas, width, height) {
  const fit = () => {
    const scale = Math.min((host.clientWidth || width) / width, (host.clientHeight || height) / height);
    canvas.style.transform = `translate(-50%,-50%) scale(${scale})`;
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => ro.disconnect();
}

function buildScene(canvas, definition, copy) {
  const content = el("div", "prod-content");
  const eyebrow = el("div", "prod-eyebrow", copy.eyebrow);
  const title = el("div", "prod-title", definition.template === "capsule-input-result" ? copy.inputTitle : definition.name);
  const shared = el("div", "prod-shared");
  const icon = el("span", "prod-icon", "✦");
  const query = el("span", "prod-query");
  const caret = el("span", "prod-caret", "");
  shared.append(icon, query, caret);
  const response = el("div", "prod-response", copy.response);
  const claimLine = el("div", "prod-claim-line");
  const result = el("div", "prod-result");
  result.innerHTML = `<div class="prod-result-kicker"></div><div class="prod-result-main"></div><div class="prod-result-meta"><span></span><span></span></div><svg viewBox="0 0 240 54" aria-hidden="true"><path d="M4 43 C38 40 48 18 82 24 S132 42 158 17 S205 19 236 6" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`;
  result.querySelector(".prod-result-kicker").textContent = copy.resultKicker;
  result.querySelector(".prod-result-main").textContent = copy.resultMain;
  const resultMeta = result.querySelectorAll(".prod-result-meta span");
  resultMeta[0].textContent = copy.resultMetaLeft;
  resultMeta[1].textContent = copy.resultMetaRight;
  const focusViewport = el("div", "prod-focus-viewport");
  const phone = el("div", "prod-phone");
  phone.innerHTML = `<div class="prod-phone-screen"><div class="prod-phone-bar"></div><div class="prod-phone-card"><b></b><span></span><i></i></div><div class="prod-phone-row"></div><div class="prod-phone-row short"></div></div>`;
  phone.querySelector("b").textContent = copy.focusTitle;
  phone.querySelector("span").textContent = copy.focusSubtitle;
  focusViewport.append(phone);
  const relayCard = (kind, state) => {
    const card = el("div", `prod-relay ${kind}`);
    card.append(el("small", "prod-relay-id", copy.taskName), el("strong", "prod-relay-state", state));
    return card;
  };
  const oldCard = relayCard("old", copy.oldState);
  const newCard = relayCard("next", copy.newState);
  const compare = el("div", "prod-compare");
  compare.innerHTML = `<div class="prod-compare-pane before"><span></span><b></b><i></i><i></i><i></i></div><div class="prod-compare-pane after"><span></span><b></b><i></i><i></i><i></i></div><div class="prod-compare-divider"></div><div class="prod-difference"></div>`;
  compare.querySelector(".before span").textContent = copy.beforeLabel;
  compare.querySelector(".before b").textContent = copy.beforeValue;
  compare.querySelector(".after span").textContent = copy.afterLabel;
  compare.querySelector(".after b").textContent = copy.afterValue;
  compare.querySelector(".prod-difference").textContent = copy.difference;
  const overview = el("div", "prod-overview");
  const overviewList = el("div", "prod-overview-list");
  for (const item of copy.overviewItems) overviewList.append(el("span", item === copy.selectedItem ? "selected" : "", item));
  const detailCard = el("div", "prod-detail-card");
  detailCard.append(el("small", "", `← ${copy.selectedItem}`), el("b", "", copy.detailTitle), el("p", "", copy.detailBody), el("i"));
  overview.append(overviewList, detailCard);
  content.append(eyebrow, title, claimLine, shared, response, result, focusViewport, oldCard, newCard, compare, overview);
  canvas.append(content);
  return { content, eyebrow, title, claimLine, shared, icon, query, caret, response, result, focusViewport, phone, oldCard, newCard, compare, overview };
}

function renderScene(nodes, definition, state, copy) {
  const tr = state.tracks;
  nodes.content.dataset.template = definition.template;
  nodes.title.style.opacity = String(tr.titleReveal ?? tr.title ?? Math.min(1, state.progress * 5));
  nodes.title.style.transform = `translateY(${((1 - (tr.titleReveal ?? tr.title ?? 1)) * 34).toFixed(1)}px)`;

  if (definition.template === "capsule-input-result") {
    const capsule = tr.capsuleState || 0;
    const typing = tr.searchInput || 0;
    const answer = tr.answerHighlight || 0;
    const response = tr.systemResponse || 0;
    const phrase = copy.query;
    nodes.shared.style.opacity = String(clamp((tr.titleReveal || 0) * 1.8));
    nodes.shared.style.width = `${38 + capsule * 48}%`;
    nodes.shared.style.borderRadius = `${999 - capsule * 955}px`;
    nodes.shared.style.transform = `translate(-50%, ${answer * -92}%) scale(${(1 - answer * 0.045).toFixed(3)})`;
    nodes.query.textContent = phrase.slice(0, Math.round(phrase.length * typing));
    nodes.caret.style.opacity = typing > 0 && typing < 1 ? "1" : "0";
    nodes.response.style.opacity = String(response * (1 - answer));
    nodes.response.style.transform = `translate(-50%, ${((1 - response) * 10).toFixed(1)}px)`;
    nodes.result.style.opacity = String(answer);
    nodes.result.style.transform = `translate(-50%, ${((1 - answer) * 44).toFixed(1)}px) scale(${(0.96 + answer * 0.04).toFixed(3)})`;
  } else if (definition.template === "phone-focus-return") {
    const enter = tr.phoneWide || 0;
    const focus = tr.sharedCardExpand || 0;
    const back = tr.returnWide || 0;
    const zoom = focus * (1 - back);
    nodes.phone.style.opacity = String(enter);
    nodes.phone.style.transformOrigin = "50% 38%";
    nodes.phone.style.transform = `translate(-50%,-50%) translateY(${(zoom * 7).toFixed(1)}%) scale(${(0.86 + enter * 0.14 + zoom * 0.5).toFixed(3)})`;
    nodes.focusViewport.dataset.focus = zoom > 0.15 ? "1" : "0";
    nodes.phone.dataset.focus = focus > 0.45 && back < 0.9 ? "1" : back > 0.2 ? "returned" : "0";
  } else if (definition.template === "card-relay") {
    const out = tr.oldCard || 0;
    const incoming = tr.cardRelay || 0;
    const terminal = tr.terminalState || 0;
    nodes.oldCard.style.opacity = String(1 - out);
    nodes.oldCard.style.transform = `translate(calc(-50% - ${out * 90}%), -50%) rotate(${(-out * 4).toFixed(2)}deg)`;
    nodes.newCard.style.opacity = String(incoming);
    nodes.newCard.style.transform = `translate(calc(-50% + ${(1 - incoming) * 90}%), -50%) scale(${(0.96 + incoming * 0.04).toFixed(3)})`;
    nodes.newCard.dataset.ready = terminal > 0.5 ? "1" : "0";
  } else if (definition.template === "before-after-confirm") {
    const base = tr.compareBase || 0;
    const reveal = tr.compareReveal || 0;
    const confirm = tr.differenceConfirm || 0;
    nodes.compare.style.opacity = String(base);
    nodes.compare.style.transform = `translate(-50%,-50%) scale(${(0.96 + base * 0.04).toFixed(3)})`;
    nodes.compare.style.setProperty("--compare-reveal", reveal.toFixed(3));
    nodes.compare.dataset.confirm = confirm > 0.5 ? "1" : "0";
  } else if (definition.template === "overview-select-detail") {
    const enter = tr.overviewEnter || 0;
    const select = tr.itemSelect || 0;
    const detail = tr.detailEnter || 0;
    nodes.overview.style.opacity = String(enter);
    nodes.overview.style.transform = `translate(-50%,-50%) scale(${(0.96 + enter * 0.04).toFixed(3)})`;
    nodes.overview.style.setProperty("--select-progress", select.toFixed(3));
    nodes.overview.style.setProperty("--detail-progress", detail.toFixed(3));
    nodes.overview.dataset.selected = select > 0.5 ? "1" : "0";
  } else {
    const product = tr.product || 0;
    const focus = tr.focus || 0;
    nodes.result.style.opacity = String(product);
    nodes.result.style.transform = `translate(-50%, ${((1 - product) * 56).toFixed(1)}px) scale(${(0.9 + product * 0.1 + focus * 0.035).toFixed(3)})`;
    nodes.result.dataset.focus = focus > 0.5 ? "1" : "0";
    nodes.claimLine.style.opacity = String(Math.max(tr.title || 0, product * 0.7));
    nodes.claimLine.style.transform = `scaleX(${Math.max(0.05, tr.title || 0).toFixed(3)})`;
  }
}

export async function mountComposition(host, definition, options) {
  host.textContent = "";
  const { canvas: config, content: copy, scenePlan, assets = [], shader = {} } = options;
  if (!copy || !scenePlan) throw new Error("缺少内容配置或镜头计划");
  const logicalWidth = config.format === "9:16" ? 360 : 640;
  const logicalHeight = config.format === "9:16" ? 640 : 360;
  const root = el("div", "prod-stage");
  root.style.aspectRatio = `${config.width} / ${config.height}`;
  const canvas = el("div", "prod-canvas");
  canvas.dataset.format = config.format;
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;
  const shaderCanvas = el("canvas", "prod-shader");
  canvas.append(shaderCanvas);
  root.append(canvas);
  host.append(root);
  const disconnect = fitCanvas(root, canvas, logicalWidth, logicalHeight);
  const nodes = buildScene(canvas, definition, copy);
  const shaderAdapter = createShaderAdapter({
    canvas: shaderCanvas,
    effect: shader.effect || "ambient-gradient",
    width: logicalWidth,
    height: logicalHeight,
    quality: shader.quality || "medium",
    fallbackElement: canvas,
  });
  let frame = 0;
  let raf = 0;
  let startedAt = 0;
  const fps = config.fps;

  const renderFrame = (nextFrame) => {
    const state = computeCompositionFrame(definition, nextFrame, fps);
    frame = state.frame;
    renderScene(nodes, definition, state, copy);
    shaderAdapter.render({ timeSec: state.ms / 1000, progress: state.progress, alpha: 0.82, blend: "normal" });
    return state;
  };

  await waitForProductionAssets(canvas, assets);
  renderFrame(0);
  const api = {
    ready: true,
    definition,
    scenePlan,
    shaderStatus: shaderAdapter.status,
    get frame() { return frame; },
    get totalFrames() { return Math.round((definition.durationMs / 1000) * fps); },
    renderFrame,
    seekFrame: renderFrame,
    play() {
      cancelAnimationFrame(raf);
      if (frame >= api.totalFrames) frame = 0;
      startedAt = performance.now() - (frame / fps) * 1000;
      const tick = (now) => {
        const next = Math.min(api.totalFrames, Math.floor(((now - startedAt) / 1000) * fps));
        renderFrame(next);
        api.onFrame?.(frame);
        if (next < api.totalFrames) raf = requestAnimationFrame(tick);
        else api.onStateChange?.("end");
      };
      raf = requestAnimationFrame(tick);
      api.onStateChange?.("play");
    },
    pause() { cancelAnimationFrame(raf); raf = 0; api.onStateChange?.("pause"); },
    destroy() { cancelAnimationFrame(raf); disconnect(); shaderAdapter.destroy(); root.remove(); },
  };
  return api;
}
