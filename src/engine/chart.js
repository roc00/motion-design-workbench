import { h, svg, svgEl, svgText, seg, clamp01, lerp, easeOut, easeInOut, noOvershoot, fmtNum, seeded } from "../kit.js";
import { validateChart } from "../chart-rules.js";

/* 逻辑画布 640×360 的图表排版 */
const PAD_L = 62;
const PAD_R = 24;
const PAD_T = 78;
const PAD_B = 44;
const PLOT_W = 640 - PAD_L - PAD_R;
const PLOT_H = 360 - PAD_T - PAD_B;
const BASE_Y = PAD_T + PLOT_H;
const ACCENT = "#22d3ee";
const NEUTRAL = "#3b4a5f";
const MUTED = "#7b8694";

const niceMax = (v) => {
  if (!Number.isFinite(v) || v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return m * p;
};

function frame(stage, c) {
  const title = h("div", "d-chart-title", c.title || "");
  title.style.cssText = "position:absolute;left:20px;top:20px;right:120px;font-size:16px;font-weight:700;color:#fff;line-height:1.3";
  const meta = h("div", "d-chart-meta");
  meta.style.cssText = "position:absolute;right:20px;top:22px;text-align:right;font-size:10px;color:#7b8694;line-height:1.6";
  meta.append(
    h("div", "d-chart-mark", c.mark || "示例数据"),
    h("div", null, `${c.unit || ""}${c.unit ? " · " : ""}${c.timeRange || ""}`),
  );
  const mark = meta.firstChild;
  mark.style.cssText =
    "display:inline-block;border:1px dashed #3a4653;border-radius:20px;padding:0 7px;font-size:9.5px;color:#8d97a5;margin-bottom:3px";
  stage.canvas.append(title, meta);

  const s = svg(640, 360);
  s.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%";
  stage.canvas.append(s);
  return { s, title, meta };
}

/** 错误数据不启动播放：直接渲染一个明确的错误面板 */
function errorPanel(stage, errs) {
  const box = h("div", "d-chart-error");
  box.style.cssText =
    "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:520px;border:1px solid #6b4a4a;background:#1a1418;border-radius:10px;padding:16px 18px";
  box.append(h("div", "d-h2", "示例数据校验未通过，已停止播放"));
  const ul = h("ul", "list");
  for (const e of errs) ul.append(h("li", null, e));
  box.append(ul);
  const tip = h("div", "d-caption", "修正 data/presets.json 的 charts 数据后刷新；界面不会静默修改数据。");
  tip.style.marginTop = "8px";
  box.append(tip);
  stage.canvas.append(box);
  return {
    durationMs: 1000,
    render() {},
  };
}

const axis = (s, maxV, fmt = (v) => fmtNum(v)) => {
  for (let i = 0; i <= 4; i += 1) {
    const y = BASE_Y - (i / 4) * PLOT_H;
    s.append(svgEl("line", { x1: PAD_L, y1: y, x2: PAD_L + PLOT_W, y2: y, stroke: i === 0 ? "#2c3644" : "#1d2531", "stroke-width": 1 }));
    s.append(svgText(PAD_L - 8, y + 3, fmt((maxV * i) / 4), { fill: MUTED, "font-size": 9.5, "text-anchor": "end" }));
  }
};

export const variants = {
  barCompare({ stage, preset, chart }) {
    const errs = validateChart("chart.bar-compare", chart);
    if (errs.length) return errorPanel(stage, errs);
    const { s } = frame(stage, chart);
    const data = chart.data;
    const max = niceMax(Math.max(...data.map((d) => Math.max(0, d.value))));
    axis(s, max);
    const slot = PLOT_W / data.length;
    const barW = Math.min(62, slot * 0.5);

    const bars = data.map((d, i) => {
      const x = PAD_L + slot * i + slot / 2;
      const rect = svgEl("rect", {
        x: x - barW / 2,
        y: BASE_Y,
        width: barW,
        height: 0,
        rx: 4,
        fill: NEUTRAL,
      });
      const val = svgText(x, BASE_Y - 6, "", { fill: "#e9edf4", "font-size": 11.5, "text-anchor": "middle", "font-weight": 600 });
      const cat = svgText(x, BASE_Y + 16, d.label, { fill: MUTED, "font-size": 10.5, "text-anchor": "middle" });
      s.append(rect, val, cat);
      return { rect, val, cat, d, x };
    });

    const DUR = preset.timeline?.actionMs || 3000;
    const growEnd = 0.66;
    const highlightAt = 0.72;
    return {
      durationMs: DUR,
      render(t) {
        const axesIn = easeOut(seg(t, 0, 0.12));
        s.style.opacity = "1";
        bars.forEach((b, i) => {
          const p = noOvershoot(seg(t, 0.12 + (i / bars.length) * (growEnd - 0.2), 0.12 + (i / bars.length) * (growEnd - 0.2) + 0.22));
          const ht = (Math.max(0, b.d.value) / max) * PLOT_H * p;
          b.rect.setAttribute("height", ht.toFixed(1));
          b.rect.setAttribute("y", (BASE_Y - ht).toFixed(1));
          const on = t > highlightAt && b.d.label === chart.highlight;
          const dim = t > highlightAt && chart.highlight && b.d.label !== chart.highlight;
          b.rect.setAttribute("fill", on ? ACCENT : NEUTRAL);
          b.rect.setAttribute("opacity", dim ? "0.45" : "1");
          b.val.setAttribute("y", (BASE_Y - ht - 6).toFixed(1));
          b.val.textContent = fmtNum(Math.round(b.d.value * (p >= 1 ? 1 : p)));
          b.val.setAttribute("opacity", String(axesIn * (p > 0.05 ? 1 : 0)));
          b.cat.setAttribute("opacity", String(axesIn));
        });
      },
    };
  },

  lineTrend({ stage, preset, chart }) {
    const errs = validateChart("chart.line-trend", chart);
    if (errs.length) return errorPanel(stage, errs);
    const { s } = frame(stage, chart);
    const vals = chart.values;
    const labels = chart.labels;
    const maxRaw = Math.max(...vals.filter((v) => typeof v === "number"));
    const maxV = niceMax(maxRaw * 1.1);
    axis(s, maxV);
    const stepX = PLOT_W / (vals.length - 1);
    const px = (i) => PAD_L + i * stepX;
    const py = (v) => BASE_Y - (v / maxV) * PLOT_H;

    // 缺失值断开：按连续段拆成多条折线
    const segmentsArr = [];
    let cur = [];
    vals.forEach((v, i) => {
      if (typeof v === "number") cur.push(i);
      else {
        if (cur.length) segmentsArr.push(cur);
        cur = [];
      }
    });
    if (cur.length) segmentsArr.push(cur);
    const paths = segmentsArr.map(() =>
      svgEl("path", { d: "", fill: "none", stroke: ACCENT, "stroke-width": 2.2, "stroke-linecap": "round", "stroke-linejoin": "round" }),
    );
    paths.forEach((p) => s.append(p));

    labels.forEach((lb, i) => {
      s.append(svgText(px(i), BASE_Y + 16, lb, { fill: MUTED, "font-size": 10, "text-anchor": "middle" }));
    });

    const dots = vals.map((v, i) => {
      const c = svgEl("circle", { cx: px(i), cy: py(typeof v === "number" ? v : 0), r: 3, fill: "#0d1017", stroke: ACCENT, "stroke-width": 2, opacity: 0 });
      s.append(c);
      return c;
    });

    const endLabel = svgText(0, 0, "", { fill: "#e9edf4", "font-size": 11.5, "font-weight": 600, "text-anchor": "end" });
    s.append(endLabel);

    const annots = (chart.annotations || []).map((a) => {
      const g = svgEl("g", { opacity: 0 });
      const x = px(a.index);
      const y = py(vals[a.index]);
      g.append(svgEl("line", { x1: x, y1: y, x2: x, y2: y - 20, stroke: "#fbbf24", "stroke-width": 1 }));
      g.append(svgText(x, y - 24, a.label, { fill: "#fbbf24", "font-size": 10, "text-anchor": "middle" }));
      s.append(g);
      return { g, index: a.index };
    });

    const DUR = preset.timeline?.actionMs || 4000;
    return {
      durationMs: DUR,
      render(t) {
        const drawEnd = 0.68;
        const p = noOvershoot(seg(t, 0.08, drawEnd));
        const reach = p * (vals.length - 1);
        segmentsArr.forEach((segIdx, k) => {
          let d = "";
          let started = false;
          for (let j = 0; j < segIdx.length; j += 1) {
            const idx = segIdx[j];
            if (idx > reach) {
              if (started && j > 0) {
                const prev = segIdx[j - 1];
                const f = (reach - prev) / (idx - prev);
                d += ` L${px(reach)} ${lerp(py(vals[prev]), py(vals[idx]), f).toFixed(1)}`;
              }
              break;
            }
            d += `${started ? " L" : "M"}${px(idx)} ${py(vals[idx]).toFixed(1)}`;
            started = true;
          }
          paths[k].setAttribute("d", d);
        });
        dots.forEach((c, i) => {
          const visible = i <= reach && typeof vals[i] === "number" && seg(t, 0.08, drawEnd) > 0;
          c.setAttribute("opacity", visible ? "1" : "0");
          if (typeof vals[i] === "number") c.setAttribute("cy", py(vals[i]).toFixed(1));
        });
        const lastIdx = vals.length - 1;
        const visibleEnd = reach >= lastIdx - 0.001;
        endLabel.textContent = visibleEnd ? `${fmtNum(vals[lastIdx])} ${chart.unit || ""}` : "";
        endLabel.setAttribute("x", px(lastIdx));
        endLabel.setAttribute("y", py(vals[lastIdx]) - 12);
        endLabel.setAttribute("opacity", visibleEnd ? "1" : "0");
        annots.forEach((a) => a.g.setAttribute("opacity", reach >= a.index ? "1" : "0"));
      },
    };
  },

  share({ stage, preset, chart }) {
    const errs = validateChart("chart.share", chart);
    if (errs.length) return errorPanel(stage, errs);
    const { s } = frame(stage, chart);
    const segs = chart.segments;
    const total = segs.reduce((n, x) => n + x.value, 0);
    const barY = PAD_T + 46;
    const barH = 46;
    const COLORS = ["#22d3ee", "#8acd00", "#a78bfa", "#f472b6", "#fbbf24", "#34d399"];

    let acc = 0;
    const parts = segs.map((sg, i) => {
      const w = (sg.value / total) * PLOT_W;
      const x = PAD_L + acc;
      acc += w;
      const rect = svgEl("rect", { x, y: barY, width: 0, height: barH, fill: COLORS[i % COLORS.length] });
      const lab = svgText(x + w / 2, barY + barH / 2 + 4, "", { fill: "#08131f", "font-size": 11.5, "text-anchor": "middle", "font-weight": 700 });
      const outer = svgText(x + w / 2, barY + barH + 18, sg.label, { fill: MUTED, "font-size": 10.5, "text-anchor": "middle" });
      s.append(rect, lab, outer);
      return { rect, lab, outer, sg, w, x };
    });

    const base = svgEl("rect", { x: PAD_L, y: barY, width: PLOT_W, height: barH, rx: 6, fill: "#161d26" });
    s.insertBefore(base, parts[0].rect);

    const DUR = preset.timeline?.actionMs || 2600;
    return {
      durationMs: DUR,
      render(t) {
        const p = noOvershoot(seg(t, 0.1, 0.78));
        const revealX = PAD_L + p * PLOT_W;
        parts.forEach((pt) => {
          const w = clamp01((revealX - pt.x) / pt.w) * pt.w;
          pt.rect.setAttribute("width", w.toFixed(1));
          const done = w >= pt.w - 0.5;
          const on = t > 0.82 && chart.highlight === pt.sg.label;
          const dim = t > 0.82 && chart.highlight && chart.highlight !== pt.sg.label;
          pt.rect.setAttribute("opacity", dim ? "0.42" : "1");
          pt.lab.textContent = done || w > pt.w * 0.55 ? `${fmtNum(pt.sg.value, pt.sg.value % 1 ? 1 : 0)}%` : "";
          pt.lab.setAttribute("opacity", w > 24 ? "1" : "0");
          pt.outer.setAttribute("opacity", done ? (on ? "1" : "0.8") : "0");
          pt.outer.setAttribute("fill", on ? ACCENT : MUTED);
        });
      },
    };
  },

  beforeAfter({ stage, preset, chart }) {
    const errs = validateChart("chart.before-after", chart);
    if (errs.length) return errorPanel(stage, errs);
    const { s } = frame(stage, chart);
    const b = chart.before;
    const a = chart.after;
    const max = niceMax(Math.max(b.value, a.value) * 1.15);
    axis(s, max);
    const barW = 96;
    const x1 = PAD_L + PLOT_W * 0.28 - barW / 2;
    const x2 = PAD_L + PLOT_W * 0.68 - barW / 2;
    const mk = (x, cfg, color) => {
      const rect = svgEl("rect", { x, y: BASE_Y, width: barW, height: 0, rx: 4, fill: color });
      const val = svgText(x + barW / 2, BASE_Y - 6, "", { fill: "#e9edf4", "font-size": 12, "font-weight": 600, "text-anchor": "middle" });
      const cat = svgText(x + barW / 2, BASE_Y + 16, cfg.label, { fill: MUTED, "font-size": 10.5, "text-anchor": "middle" });
      s.append(rect, val, cat);
      return { rect, val, cfg };
    };
    const r1 = mk(x1, b, "#8acd00");
    const r2 = mk(x2, a, "#34d399");
    const connector = svgEl("line", { x1: 0, y1: 0, x2: 0, y2: 0, stroke: "#fbbf24", "stroke-width": 1.4, "stroke-dasharray": "4 3", opacity: 0 });
    s.append(connector);
    const delta = svgText(0, 0, "", { fill: "#fbbf24", "font-size": 11.5, "font-weight": 700, "text-anchor": "middle", opacity: 0 });
    s.append(delta);

    const DUR = preset.timeline?.actionMs || 2600;
    return {
      durationMs: DUR,
      render(t) {
        const p1 = noOvershoot(seg(t, 0.1, 0.4));
        const p2 = noOvershoot(seg(t, 0.42, 0.72));
        const h1 = (b.value / max) * PLOT_H * p1;
        const h2 = (a.value / max) * PLOT_H * p2;
        r1.rect.setAttribute("height", h1.toFixed(1));
        r1.rect.setAttribute("y", (BASE_Y - h1).toFixed(1));
        r1.val.setAttribute("y", (BASE_Y - h1 - 6).toFixed(1));
        r1.val.textContent = p1 > 0.05 ? fmtNum(Math.round(b.value * (p1 >= 1 ? 1 : p1) * 10) / 10, b.value % 1 ? 1 : 0) : "";
        r2.rect.setAttribute("height", h2.toFixed(1));
        r2.rect.setAttribute("y", (BASE_Y - h2).toFixed(1));
        r2.val.setAttribute("y", (BASE_Y - h2 - 6).toFixed(1));
        r2.val.textContent = p2 > 0.05 ? fmtNum(Math.round(a.value * (p2 >= 1 ? 1 : p2) * 10) / 10, a.value % 1 ? 1 : 0) : "";
        const show = t > 0.74;
        connector.setAttribute("opacity", show ? "1" : "0");
        const y1 = BASE_Y - h1;
        const y2 = BASE_Y - h2;
        const cx1 = x1 + barW / 2;
        const cx2 = x2 + barW / 2;
        connector.setAttribute("x1", cx1 + barW / 2 - 6);
        connector.setAttribute("y1", y1);
        connector.setAttribute("x2", cx2 - barW / 2 + 6);
        connector.setAttribute("y2", y2);
        delta.setAttribute("opacity", show ? "1" : "0");
        delta.setAttribute("x", (cx1 + cx2) / 2);
        delta.setAttribute("y", Math.min(y1, y2) - 12);
        const diff = a.value - b.value;
        const pctv = b.value !== 0 ? (diff / b.value) * 100 : 0;
        const better = chart.lowerIsBetter ? diff < 0 : diff > 0;
        delta.setAttribute("fill", better ? "#34d399" : "#f87171");
        delta.textContent = `${diff >= 0 ? "+" : ""}${fmtNum(Math.round(diff * 100) / 100, 1)} ${chart.unit || ""}（${pctv >= 0 ? "+" : ""}${fmtNum(Math.round(pctv * 10) / 10, 1)}%）`;
      },
    };
  },

  waterfall({ stage, preset, chart }) {
    const errs = validateChart("chart.waterfall", chart);
    if (errs.length) return errorPanel(stage, errs);
    const { s } = frame(stage, chart);
    const rows = [chart.start, ...chart.items, chart.end];
    const n = rows.length;
    const rowH = PLOT_H / n;
    const barH = Math.min(24, rowH * 0.52);

    // 累计值序列
    const cum = [chart.start.value];
    for (const it of chart.items) cum.push(cum[cum.length - 1] + it.delta);
    const maxV = niceMax(Math.max(...cum, ...cum.map((v) => Math.abs(v))) * 1.05);
    const scale = PLOT_W / maxV;

    const built = rows.map((r, i) => {
      const y = PAD_T + i * rowH + rowH / 2 - barH / 2;
      let from = 0;
      let to = 0;
      let color = NEUTRAL;
      if (i === 0 || i === n - 1) {
        from = 0;
        to = r.value;
        color = "#8acd00";
      } else {
        const prev = cum[i - 1];
        const cur = cum[i];
        from = Math.min(prev, cur);
        to = Math.max(prev, cur);
        color = r.delta >= 0 ? "#34d399" : "#f87171";
      }
      const rect = svgEl("rect", { x: PAD_L + from * scale, y, width: 0, height: barH, rx: 3, fill: color });
      const lab = svgText(0, y + barH / 2 + 4, "", { fill: "#e9edf4", "font-size": 10.5, "font-weight": 600 });
      const cat = svgText(PAD_L - 10, y + barH / 2 + 4, i === 0 || i === n - 1 ? r.label : r.label, { fill: MUTED, "font-size": 10, "text-anchor": "end" });
      s.append(rect, lab, cat);
      return { rect, lab, r, from, to, i, n };
    });

    const DUR = preset.timeline?.actionMs || 4200;
    return {
      durationMs: DUR,
      render(t) {
        const p = noOvershoot(seg(t, 0.08, 0.82));
        built.forEach((b) => {
          const local = clamp01((p * b.n - b.i) / 1);
          const w = (b.to - b.from) * scale * local;
          b.rect.setAttribute("width", Math.max(0, w).toFixed(1));
          const showVal = local > 0.6;
          const txt =
            b.i === 0 || b.i === b.n - 1
              ? `${fmtNum(b.r.value)}`
              : `${b.r.delta >= 0 ? "+" : ""}${fmtNum(b.r.delta)}`;
          b.lab.textContent = showVal ? txt : "";
          b.lab.setAttribute("x", (PAD_L + (b.from + (b.to - b.from) * local) * scale + 8).toFixed(1));
        });
      },
    };
  },

  rankRace({ stage, preset, chart }) {
    const errs = validateChart("chart.rank-race", chart);
    if (errs.length) return errorPanel(stage, errs);
    const { s } = frame(stage, chart);
    const entities = chart.entities;
    const frames = chart.frames;
    // 固定全时段尺度：避免每帧自动缩放制造假变化
    const maxV = niceMax(Math.max(...frames.flatMap((f) => entities.map((e) => f.values[e.name]))) * 1.05);
    const scale = PLOT_W / maxV;
    const rowH = PLOT_H / entities.length;
    const barH = Math.min(26, rowH * 0.55);

    const built = entities.map((e) => {
      const rect = svgEl("rect", { x: PAD_L, width: 0, height: barH, rx: 3, fill: e.color });
      const val = svgText(0, 0, "", { fill: "#e9edf4", "font-size": 11, "font-weight": 600 });
      const name = svgText(PAD_L - 10, 0, e.name, { fill: MUTED, "font-size": 11, "text-anchor": "end", "font-weight": 600 });
      s.append(rect, val, name);
      return { rect, val, name, e };
    });

    const timeLabel = svgText(0, 0, "", { fill: MUTED, "font-size": 11, "text-anchor": "end" });
    timeLabel.setAttribute("x", PAD_L + PLOT_W);
    timeLabel.setAttribute("y", BASE_Y + 20);
    s.append(timeLabel);

    const DUR = preset.timeline?.actionMs || 7000;
    return {
      durationMs: DUR,
      render(t) {
        const pos = t * (frames.length - 1);
        const fi = Math.min(frames.length - 2, Math.floor(pos));
        const local = easeInOut(clamp01(pos - fi));
        const fa = frames[fi];
        const fb = frames[fi + 1];
        const rows = entities
          .map((e) => ({
            e,
            v: lerp(fa.values[e.name], fb.values[e.name], local),
          }))
          .sort((x, y) => y.v - x.v || x.e.name.localeCompare(y.e.name)); // 并列按名称稳定排序
        const top = rows[0]?.e.name;
        rows.forEach((r, rank) => {
          const b = built.find((x) => x.e.name === r.e.name);
          const y = PAD_T + rank * rowH + rowH / 2 - barH / 2;
          b.rect.setAttribute("y", y.toFixed(1));
          b.rect.setAttribute("width", (r.v * scale).toFixed(1));
          b.rect.setAttribute("opacity", t > 0.94 && r.e.name !== top ? "0.5" : "1");
          b.val.setAttribute("x", (PAD_L + r.v * scale + 8).toFixed(1));
          b.val.setAttribute("y", (y + barH / 2 + 4).toFixed(1));
          b.val.textContent = fmtNum(Math.round(r.v * 10) / 10, r.v % 1 ? 1 : 0);
          b.name.setAttribute("y", (y + barH / 2 + 4).toFixed(1));
        });
        timeLabel.textContent = `${local < 0.5 ? fa.t : fb.t}　·　全时段统一尺度 ${fmtNum(maxV)} ${chart.unit || ""}`;
        void seeded;
      },
    };
  },
};
