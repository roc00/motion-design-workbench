import { validateProductionAssets, ProductionAssetError } from "./asset-gate.js";

/**
 * 渲染器无关的薄适配合同。Remotion、离屏浏览器或其他渲染器只需要
 * 把自己的帧号与本地素材引用转换为这份输入，不复制演示逻辑。
 */
export function normalizeProductionInput(input) {
  const frame = Number(input?.frame);
  const fps = Number(input?.fps);
  const width = Number(input?.width);
  const height = Number(input?.height);
  if (!Number.isInteger(frame) || frame < 0) throw new TypeError("frame 必须是 >=0 的整数");
  if (!(fps > 0) || !(width > 0) || !(height > 0)) throw new TypeError("fps、width、height 必须是正数");
  const assets = Array.isArray(input.assets) ? input.assets : [];
  const failures = validateProductionAssets(assets);
  if (failures.length) throw new ProductionAssetError("生产输入包含不可用素材", failures);
  return {
    frame,
    fps,
    width,
    height,
    timeSec: frame / fps,
    params: { ...(input.params || {}) },
    assets,
  };
}

/** 网页交互在视频模式里只保存为确定的时间轨事件，不读取实时鼠标/滚动状态。 */
export function interactionToTimelineEvent({ type, atMs, durationMs = 0, from = 0, to = 1, target }) {
  if (!new Set(["scroll", "pointer", "click", "gesture"]).has(type)) throw new TypeError(`不支持的交互类型：${type}`);
  if (!(atMs >= 0) || !(durationMs >= 0)) throw new TypeError("交互事件时间不能为负");
  return {
    type,
    target: target || "scene",
    fromMs: atMs,
    toMs: atMs + durationMs,
    from,
    to,
    source: "preset-time-track",
  };
}

export function sampleTimelineEvent(event, timeMs) {
  if (event.toMs === event.fromMs) return timeMs >= event.fromMs ? event.to : event.from;
  const p = Math.max(0, Math.min(1, (timeMs - event.fromMs) / (event.toMs - event.fromMs)));
  return event.from + (event.to - event.from) * p;
}
