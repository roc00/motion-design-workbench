/**
 * 运行配置解析器。
 * 预览、制作指令、镜头 JSON 与生产适配器只能消费这里产出的结果，
 * 避免各自重新解释时间、画幅与项目预设。
 */

export const STAGGER_MODE = "between-item-starts";

const num = (value, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export function formatById(production, id) {
  return (production.formats || []).find((item) => item.id === id) || production.formats?.[0] || {
    id: "16:9",
    width: production.width || 1920,
    height: production.height || 1080,
    layoutPreset: "landscape-stage",
  };
}

export function profileById(production, id) {
  return (production.projectProfiles || []).find((item) => item.id === id) || null;
}

export function resolveCanvas(production, params = {}) {
  const profile = profileById(production, params.profileId);
  const formatId = params.format || profile?.format || "16:9";
  const format = formatById(production, formatId);
  return {
    width: num(params.width, profile?.width || format.width || production.width),
    height: num(params.height, profile?.height || format.height || production.height),
    fps: num(params.fps, profile?.fps || production.fps),
    format: formatId,
    layoutPreset: params.layoutPreset || profile?.layoutPreset || format.layoutPreset || "landscape-stage",
    profileId: profile?.id || null,
    profileName: profile?.name || null,
    colorSpace: "rec709",
  };
}

export function resolveTimeline(timeline = {}, params = {}, fps = 24) {
  const actionMs = num(params.actionMs, num(timeline.actionMs, 500));
  const staggerMs = num(params.staggerMs, num(timeline.staggerMs, 0));
  const staggerCount = Math.max(1, Math.round(num(params.staggerCount, num(timeline.staggerCount, 1))));
  const holdMs = num(params.holdMs, num(timeline.holdMs, 600));
  const exitMs = num(params.exitMs, num(timeline.exitMs, 0));
  const staggerSpanMs = staggerMs * Math.max(0, staggerCount - 1);
  const actionSpanMs = actionMs + staggerSpanMs;
  const totalMs = actionSpanMs + holdMs + exitMs;
  const toFrames = (ms) => Math.round((ms / 1000) * fps);

  return {
    actionMs,
    staggerMs,
    staggerMode: STAGGER_MODE,
    staggerCount,
    staggerSpanMs,
    actionSpanMs,
    holdMs,
    exitMs,
    totalMs,
    actionFrames: toFrames(actionMs),
    staggerFrames: toFrames(staggerMs),
    staggerSpanFrames: toFrames(staggerSpanMs),
    actionSpanFrames: toFrames(actionSpanMs),
    holdFrames: toFrames(holdMs),
    exitFrames: toFrames(exitMs),
    visibleFrames: toFrames(totalMs),
  };
}

export function runtimePreset(preset, resolvedConfig) {
  return {
    ...preset,
    content: { ...(resolvedConfig.content || {}) },
    timeline: { ...resolvedConfig.timeline },
    canvas: { ...resolvedConfig.canvas },
    assets: [...(resolvedConfig.assets || [])],
  };
}

/** 把全局时间映射到「进入/动作 → 停留 → 退场」三个确定区间。 */
export function timelinePhases(progress, timeline) {
  const total = Math.max(1, timeline.totalMs || 1);
  const ms = Math.max(0, Math.min(1, progress)) * total;
  const actionEnd = timeline.actionSpanMs;
  const holdEnd = actionEnd + timeline.holdMs;
  const action = actionEnd > 0 ? Math.min(1, ms / actionEnd) : 1;
  const exit = timeline.exitMs > 0 ? Math.max(0, Math.min(1, (ms - holdEnd) / timeline.exitMs)) : 0;
  return {
    ms,
    action,
    hold: ms >= actionEnd && ms < holdEnd,
    exit,
    visible: exit < 1,
  };
}
