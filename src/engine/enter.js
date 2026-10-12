import { h, pic, seg, clamp01, easeOut, easeInOut, spring, LOGICAL_W as W, LOGICAL_H as H } from "../kit.js";
import { timelinePhases } from "../runtime-config.js";

const C = (el) => {
  el.style.position = "absolute";
  el.style.left = "50%";
  el.style.top = "50%";
  el.style.transform = "translate(-50%,-50%)";
  return el;
};

/** 内容进出：在真实页面内容上演示出现与消失。 */
export const variants = {
  fade({ stage, preset }) {
    const c = preset.content || {};
    const wrap = h("div");
    wrap.style.cssText = "position:absolute;left:80px;top:120px;width:480px;display:flex;flex-direction:column;gap:9px";
    const t1 = h("div", "d-h1", c.title || "淡入 / 淡出");
    const t2 = h("div", "d-sub", c.sub || "");
    wrap.append(t1, t2);
    stage.canvas.append(wrap);
    return {
      durationMs: preset.timeline?.actionMs || 900,
      render(t) {
        t1.style.opacity = String(easeOut(seg(t, 0, 0.55)));
        t2.style.opacity = String(easeOut(seg(t, 0.18, 0.75)));
      },
    };
  },

  crossfade({ stage, preset }) {
    const c = preset.content || {};
    const box = h("div");
    box.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:400px;height:225px;border-radius:10px;overflow:hidden;border:1px solid #2a3441";
    const a = pic(c.a?.seed || "summit", 800, 450, c.a?.label);
    a.style.cssText += "position:absolute;inset:0";
    const b = pic(c.b?.seed || "tide", 800, 450, c.b?.label);
    b.style.cssText += "position:absolute;inset:0";
    const tag = h("div", "d-caption");
    tag.style.cssText = "position:absolute;left:10px;bottom:8px;color:#fff;text-shadow:0 1px 5px rgba(0,0,0,.7)";
    box.append(a, b, tag);
    C(box);
    stage.canvas.append(box);
    return {
      durationMs: preset.timeline?.actionMs || 1000,
      render(t) {
        const p = easeInOut(seg(t, 0.12, 0.72));
        a.style.opacity = String(1 - p);
        b.style.opacity = String(p);
        tag.textContent = p < 0.5 ? `${c.a?.label || "A"} → ${c.b?.label || "B"}` : `${c.b?.label || "B"}（已切换）`;
      },
    };
  },

  slide({ stage, preset }) {
    const c = preset.content || {};
    const page = h("div");
    page.style.cssText = `position:absolute;inset:0;padding:16px 18px`;
    page.append(h("div", "d-h2", "页面内容"));
    const l1 = h("div", "d-skel");
    l1.style.cssText = "height:9px;width:78%;margin-top:10px;border-radius:5px";
    const l2 = h("div", "d-skel");
    l2.style.cssText = "height:9px;width:60%;margin-top:7px;border-radius:5px";
    page.append(l1, l2);
    const scrim = h("div", "d-scrim");
    const sheet = h("div", "d-sheet");
    sheet.append(h("div", "grab"));
    const t1 = h("div", "d-h2", c.title || "从下方升起的面板");
    const t2 = h("div", "d-sub", c.sub || "");
    t2.style.marginTop = "5px";
    const btn = h("div", "d-btn", c.cta || "确认");
    btn.style.cssText += ";margin-top:12px;width:100%";
    sheet.append(t1, t2, btn);
    stage.canvas.append(page, scrim, sheet);
    const sheetH = 168;
    sheet.style.height = `${sheetH}px`;
    return {
      timelineManaged: true,
      durationMs: (preset.timeline?.actionMs || 420) + (preset.timeline?.holdMs || 700) + (preset.timeline?.exitMs || 340),
      render(t) {
        const phase = timelinePhases(t, preset.timeline);
        const inP = easeOut(phase.action);
        const outP = easeInOut(phase.exit);
        const y = (1 - inP) * (sheetH + 30) + outP * (sheetH + 30);
        sheet.style.transform = `translateY(${y.toFixed(1)}px)`;
        scrim.style.opacity = String(0.42 * inP * (1 - outP));
      },
    };
  },

  scale({ stage, preset }) {
    const c = preset.content || {};
    const card = h("div", "d-card2");
    card.style.cssText = "width:300px;height:200px;transform-origin:center";
    const p = h("div", "pic");
    const im = new Image();
    im.src = `https://picsum.photos/seed/${c.seed || "timber"}/600/340`;
    im.alt = c.title || "";
    p.append(im);
    const meta = h("div", "meta");
    meta.append(h("div", "t", c.title || "卡片"), h("div", "b", c.sub || "Scale in"));
    card.append(p, meta);
    C(card);
    stage.canvas.append(card);
    const inMs = preset.timeline?.actionMs || 340;
    const holdMs = preset.timeline?.holdMs || 600;
    const exitMs = preset.timeline?.exitMs || 240;
    const total = inMs + holdMs + exitMs;
    return {
      timelineManaged: true,
      durationMs: total,
      render(t, { reduced }) {
        const phase = timelinePhases(t, preset.timeline);
        const enter = easeOut(phase.action);
        const leave = easeInOut(phase.exit);
        const s = 0.82 + enter * 0.18 - leave * 0.12;
        const o = enter * (1 - leave);
        card.style.transform = `translate(-50%,-50%) ${reduced ? "" : `scale(${s.toFixed(3)})`}`;
        card.style.opacity = String(reduced ? (phase.exit < 1 ? 1 : 0) : o);
      },
    };
  },

  blur({ stage, preset }) {
    const c = preset.content || {};
    const box = h("div");
    box.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:400px;height:225px;border-radius:10px;overflow:hidden;border:1px solid #2a3441";
    const im = new Image();
    im.src = `https://picsum.photos/seed/${c.seed || "bloom"}/800/450`;
    im.alt = c.title || "";
    im.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
    const title = h("div", "d-h2", c.title || "从模糊恢复清晰");
    title.style.cssText += ";position:absolute;left:14px;bottom:12px;text-shadow:0 2px 10px rgba(0,0,0,.6)";
    box.append(im, title);
    C(box);
    stage.canvas.append(box);
    return {
      durationMs: preset.timeline?.actionMs || 900,
      render(t, { reduced }) {
        const p = easeOut(seg(t, 0, 0.8));
        im.style.filter = reduced ? "none" : `blur(${((1 - p) * 16).toFixed(1)}px)`;
        im.style.transform = reduced ? "none" : `scale(${(1 + (1 - p) * 0.05).toFixed(3)})`;
        title.style.opacity = String(easeOut(seg(t, 0.35, 0.95)));
      },
    };
  },

  "clip-path-reveal"({ stage, preset }) {
    const c = preset.content || {};
    const box = h("div");
    box.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:400px;height:225px;border-radius:10px;overflow:hidden;border:1px solid #2a3441";
    const im = new Image();
    im.src = `https://picsum.photos/seed/${c.seed || "neon-lights"}/800/450`;
    im.alt = c.title || "";
    im.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
    const title = h("div", "d-h2", c.title || "裁剪揭示");
    title.style.cssText += ";position:absolute;left:14px;bottom:12px;text-shadow:0 2px 10px rgba(0,0,0,.6)";
    box.append(im, title);
    C(box);
    stage.canvas.append(box);
    return {
      durationMs: preset.timeline?.actionMs || 850,
      render(t, { reduced }) {
        const p = reduced ? 1 : easeInOut(seg(t, 0, 0.85));
        box.style.clipPath = `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0 round 10px)`;
      },
    };
  },

  "mask-reveal"({ stage, preset }) {
    const c = preset.content || {};
    const box = h("div");
    box.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:400px;height:225px;border-radius:10px;overflow:hidden;border:1px solid #2a3441";
    const im = new Image();
    im.src = `https://picsum.photos/seed/${c.seed || "tide"}/800/450`;
    im.alt = c.title || "";
    im.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
    const title = h("div", "d-h2", c.title || "蒙版显现");
    title.style.cssText += ";position:absolute;left:14px;bottom:12px;text-shadow:0 2px 10px rgba(0,0,0,.6)";
    box.append(im, title);
    C(box);
    stage.canvas.append(box);
    return {
      durationMs: preset.timeline?.actionMs || 1050,
      render(t, { reduced }) {
        if (reduced) {
          box.style.maskImage = "none";
          box.style.webkitMaskImage = "none";
          return;
        }
        const p = easeInOut(seg(t, 0, 0.9));
        const x = -26 + p * 152;
        const m = `radial-gradient(circle at ${x.toFixed(1)}% 50%, #000 24%, transparent 50%)`;
        box.style.maskImage = m;
        box.style.webkitMaskImage = m;
      },
    };
  },

  wipe({ stage, preset }) {
    const c = preset.content || {};
    const box = h("div");
    box.style.cssText = "position:absolute;inset:0;overflow:hidden";
    const a = pic(c.a?.seed || "summit", 900, 500, c.a?.label);
    a.style.cssText += "position:absolute;inset:0";
    const b = pic(c.b?.seed || "tide", 900, 500, c.b?.label);
    b.style.cssText += "position:absolute;inset:0";
    const curtain = h("div");
    curtain.style.cssText = "position:absolute;top:0;bottom:0;background:#0d1017;border-right:2px solid var(--accent);z-index:3";
    box.append(a, b, curtain);
    stage.canvas.append(box);
    return {
      durationMs: preset.timeline?.actionMs || 760,
      render(t, { reduced }) {
        if (reduced) {
          curtain.style.display = "none";
          a.style.opacity = t < 0.5 ? "1" : "0";
          b.style.opacity = t < 0.5 ? "0" : "1";
          return;
        }
        curtain.style.display = "";
        const p = t / 0.5;
        if (p <= 1) {
          // 遮罩入场：从左向右覆盖，ease-in-out（而非 Linear）
          const e = easeInOut(p);
          curtain.style.left = "0%";
          curtain.style.width = `${(e * 100).toFixed(2)}%`;
          b.style.opacity = "0";
        } else {
          // 遮罩完全覆盖后，画面已切换为 B；退场同样 ease-in-out
          b.style.opacity = "1";
          const q = clamp01((t - 0.5) / 0.5);
          const e2 = easeInOut(q);
          curtain.style.left = `${(e2 * 100).toFixed(2)}%`;
          curtain.style.width = `${((1 - e2) * 100).toFixed(2)}%`;
        }
      },
    };
  },

  /** 内容进出：逐笔绘制生长（draw-on）——矢量描边按真实运笔顺序生长，不 fade in。 */
  "draw-on"({ stage, preset }) {
    const c = preset.content || {};
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 640 360");
    svg.style.cssText = "position:absolute;inset:0;width:100%;height:100%;overflow:visible";

    const color = c.color || "var(--accent)";
    const mk = (d, w) => {
      const p = document.createElementNS(svgNS, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", color);
      p.setAttribute("stroke-width", String(w));
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("stroke-linejoin", "round");
      svg.appendChild(p);
      return p;
    };
    // 圆（从 12 点方向起笔）→ 勾两笔 → 完成闪光
    const circle = mk("M 320 108 a 72 72 0 1 1 -0.01 0", 9);
    const tick1 = mk("M 286 182 L 312 208", 9);
    const tick2 = mk("M 312 208 L 358 158", 9);
    const spark1 = mk("M 320 22 L 320 44", 6);
    const spark2 = mk("M 226 50 L 240 64", 6);
    const spark3 = mk("M 414 50 L 400 64", 6);

    stage.canvas.append(svg);

    const strokes = [
      { el: circle, at: 0.05 },
      { el: tick1, at: 0.5 },
      { el: tick2, at: 0.7 },
      { el: spark1, at: 0.95 },
      { el: spark2, at: 0.95 },
      { el: spark3, at: 0.95 },
    ].map((s) => ({ ...s, L: s.el.getTotalLength() }));
    for (const s of strokes) {
      s.el.style.strokeDasharray = `${s.L}`;
      s.el.style.strokeDashoffset = `${s.L}`;
    }

    const durationMs = preset.timeline?.actionMs || 1700;
    return {
      durationMs,
      render(t, { reduced }) {
        if (reduced) {
          for (const s of strokes) s.el.style.strokeDashoffset = "0";
          return;
        }
        const sec = (t * durationMs) / 1000;
        for (const s of strokes) {
          const p = spring(sec - s.at, 150, 20);
          s.el.style.strokeDashoffset = (s.L * (1 - p)).toFixed(2);
        }
      },
    };
  },
};

void seg;
void H;
