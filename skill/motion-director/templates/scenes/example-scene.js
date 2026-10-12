// 示例场景模块：从 index.html 抽离的写法
import { spring, SPRING } from "../lib/motion.js";
import { clamp01, roundRectPath } from "../lib/util.js";

// 每个场景导出 { from, to, draw }
export default {
  from: 0,
  to: 6,
  draw(t, ctx, W, H) {
    const s = spring(t - 0.1, ...SPRING.snappy);
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    ctx.globalAlpha = clamp01(t * 4);
    ctx.fillStyle = "#f0eee6";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 120px Georgia, serif";
    ctx.fillText("HOOK", 0, 0);
    ctx.restore();
  },
};
