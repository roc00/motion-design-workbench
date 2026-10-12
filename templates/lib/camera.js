// 可 seek 相机：基准 + 呼吸漂移 + 由 cue 触发的推进；全部为 t 的纯函数
import { seg } from "./util.js";

export function camera(t, cues = {}) {
  const breatheX = Math.sin(t * 0.9) * 0.006;
  const breatheY = Math.cos(t * 1.1) * 0.004;
  const pushAt = cues.pushAt ?? 0;
  const pushAmount = cues.pushAmount ?? 0;
  const push = seg(t, pushAt, pushAt + 1.2);
  return {
    zoom: 1 + push * pushAmount,
    x: breatheX,
    y: breatheY,
  };
}

// 应用相机变换到当前 ctx
export function applyCamera(ctx, W, H, cam) {
  ctx.translate(W / 2, H / 2);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-W / 2 + cam.x * W, -H / 2 + cam.y * H);
}
