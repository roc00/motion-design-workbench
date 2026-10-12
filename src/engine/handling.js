import { h, seg, lerp, clamp01, stagger, gsap, LOGICAL_W as W } from "../kit.js";

const PAD = 18;
const EASES = [
  ["linear 匀速", "linear", "#94a3b8"],
  ["ease-in 加速", "power2.in", "#f472b6"],
  ["ease-out 减速（最常用）", "power2.out", "#34d399"],
  ["ease-in-out 两头慢", "power2.inOut", "#60a5fa"],
];
const easeOf = (name) => gsap.parseEase(name);

/** 手感控制（原理）：不决定往哪动，只决定速度、顺序、等待与回弹。 */
export const variants = {
  easing({ stage, preset }) {
    const c = preset.content || {};
    const hint = stage.el("div", "d-caption", c.hint || "横轴为时间，纵轴为位移");
    hint.style.cssText = `position:absolute;left:${PAD}px;top:12px`;

    const panels = [];
    const pw = 143;
    const pht = 84;
    EASES.forEach(([label, name, color], i) => {
      const x = PAD + i * (pw + 10);
      const box = h("div", "d-panel");
      box.style.cssText = `position:absolute;left:${x}px;top:34px;width:${pw}px;height:${pht}px`;
      const nm = h("div", "d-caption", label);
      nm.style.cssText = "margin:5px 0 4px 8px";
      const svgWrap = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const iw = pw - 16;
      const ih = pht - 30;
      svgWrap.setAttribute("viewBox", `0 0 ${iw} ${ih}`);
      svgWrap.style.cssText = "display:block;margin:0 8px";
      const ease = easeOf(name);
      let d = "";
      for (let k = 0; k <= 40; k += 1) {
        const xx = (k / 40) * iw;
        const yy = ih - ease(k / 40) * (ih - 4) - 2;
        d += `${k === 0 ? "M" : "L"}${xx.toFixed(1)} ${yy.toFixed(1)} `;
      }
      svgWrap.innerHTML =
        `<line x1="0" y1="${ih - 2}" x2="${iw}" y2="${ih - 2}" stroke="#232b36" stroke-width="1"/>` +
        `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>`;
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("r", "3.4");
      dot.setAttribute("fill", "#fff");
      dot.setAttribute("stroke", color);
      dot.setAttribute("stroke-width", "2");
      svgWrap.append(dot);
      box.append(nm, svgWrap);
      stage.canvas.append(box);
      panels.push({ dot, ease, iw, ih, x: x + 8, top: 34 + 30 - 2 });
    });

    // 同距离移动对比：三个对象走同样距离，横向速度不同
    const CAP = h("div", "d-caption", "同距离移动对比：三个对象走同样的距离，只有曲线不同");
    CAP.style.cssText = `position:absolute;left:${PAD}px;top:132px`;
    stage.canvas.append(CAP);

    const laneW = W - PAD * 2;
    const lanes = EASES.slice(0, 3).map(([label, name, color], i) => {
      const y = 156 + i * 34;
      const lane = h("div", "d-lane");
      lane.style.cssText = `position:absolute;left:${PAD}px;top:${y}px;width:${laneW}px;height:22px`;
      const box = h("div", "d-lane-box", label.split(" ")[0]);
      box.style.cssText = `background:${color};color:#08131f`;
      lane.append(box);
      stage.canvas.append(lane);
      return { box, ease: easeOf(name) };
    });

    const DUR = preset.timeline?.actionMs || 1400;
    return {
      durationMs: DUR,
      render(t) {
        for (const p of panels) {
          p.dot.setAttribute("cx", (p.ease(t) * p.iw).toFixed(1));
          p.dot.setAttribute("cy", (p.ih - p.ease(t) * (p.ih - 4) - 2).toFixed(1));
        }
        for (const l of lanes) {
          l.box.style.transform = `translateX(${(l.ease(t) * (laneW - 44)).toFixed(2)}px)`;
        }
      },
    };
  },

  duration({ stage, preset }) {
    const rows = preset.content?.rows || [
      ["短促 · 按钮 / 图标", 160],
      ["适中 · 卡片 / 弹窗", 320],
      ["偏慢 · 主视觉 / 转场", 900],
    ];
    const maxMs = Math.max(...rows.map((r) => r[1]));
    const laneW = W - PAD * 2 - 130;
    const built = rows.map(([label, ms], i) => {
      const y = 60 + i * 74;
      const t = h("div", "d-caption", `${label}　${ms}ms`);
      t.style.cssText = `position:absolute;left:${PAD}px;top:${y + 4}px`;
      const lane = h("div", "d-lane");
      lane.style.cssText = `position:absolute;left:${PAD + 130}px;top:${y}px;width:${laneW}px;height:30px`;
      const fill = h("div", "d-lane-fill");
      const color = ["#34d399", "#60a5fa", "#fbbf24"][i];
      fill.style.background = color;
      lane.append(fill);
      stage.canvas.append(t, lane);
      return { fill, ms };
    });
    const cap = h("div", "d-caption", "同一个动作（淡入 + 上移）只改 duration，快慢关系就不一样");
    cap.style.cssText = `position:absolute;left:${PAD}px;top:${60 + rows.length * 74 + 6}px`;
    stage.canvas.append(cap);

    const DUR = maxMs;
    return {
      durationMs: DUR,
      render(t) {
        for (const b of built) {
          const p = clamp01(t / (b.ms / DUR));
          b.fill.style.width = `${(p * laneW).toFixed(1)}px`;
        }
      },
    };
  },

  delay({ stage, preset }) {
    const c = preset.content || {};
    const wrap = h("div");
    wrap.style.cssText = `position:absolute;left:${PAD}px;top:70px;width:${W - PAD * 2}px;display:flex;flex-direction:column;gap:10px`;
    const title = h("div", "d-h1", c.title || "把动效讲清楚");
    const sub = h("div", "d-sub", c.sub || "");
    const cta = h("div", "d-btn", c.cta || "开始使用");
    cta.style.alignSelf = "flex-start";
    wrap.append(title, sub, cta);
    stage.canvas.append(wrap);

    const staggerMs = preset.timeline?.staggerMs || 240;
    const DUR = preset.timeline?.actionMs || 1200;
    const starts = [0, staggerMs, staggerMs * 2];
    return {
      durationMs: DUR + staggerMs * 2,
      render(t, { reduced }) {
        const els = [title, sub, cta];
        els.forEach((el, i) => {
          const p = seg(t * (DUR + staggerMs * 2), starts[i], starts[i] + 400);
          el.style.opacity = String(reduced ? (p > 0 ? 1 : 0) : p);
          el.style.transform = reduced ? "none" : `translateY(${((1 - p) * 10).toFixed(1)}px)`;
        });
      },
    };
  },

  stagger({ stage, preset }) {
    const cards = preset.content?.cards || [];
    const seeds = preset.content?.seeds || [];
    const gw = 190;
    const ght = 108;
    const built = cards.map((label, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = PAD + col * (gw + 10);
      const y = 40 + row * (ght + 12);
      const card = h("div", "d-card2");
      card.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${gw}px;height:${ght}px`;
      const p = h("div", "pic");
      const im = new Image();
      im.src = `https://picsum.photos/seed/${seeds[i] || "summit"}/380/200`;
      im.alt = label;
      p.append(im);
      const meta = h("div", "meta");
      meta.append(h("div", "t", label));
      card.append(p, meta);
      stage.canvas.append(card);
      return card;
    });
    const cap = h("div", "d-caption", "整组像一次动作，不是六次");
    cap.style.cssText = `position:absolute;left:${PAD}px;bottom:12px`;
    stage.canvas.append(cap);

    const DUR = preset.timeline?.actionMs || 1400;
    return {
      durationMs: DUR + 400,
      render(t, { reduced }) {
        built.forEach((el, i) => {
          const p = stagger(t, i, built.length, 0.6);
          el.style.opacity = String(reduced ? (p > 0 ? 1 : 0) : p);
          el.style.transform = reduced ? "none" : `translateY(${((1 - p) * 16).toFixed(1)}px) scale(${(0.95 + p * 0.05).toFixed(3)})`;
        });
      },
    };
  },

  spring({ stage, preset }) {
    const lane = h("div", "d-lane");
    lane.style.cssText = `position:absolute;left:${PAD}px;top:150px;width:${W - PAD * 2}px;height:56px`;
    const target = h("div");
    target.style.cssText =
      "position:absolute;right:0;top:50%;width:2px;height:40px;background:#34d399;transform:translateY(-50%)";
    const box = h("div", "d-lane-box", preset.content?.label || "弹窗");
    box.style.cssText = "height:56px;padding:0 18px;background:var(--accent);color:#08131f";
    lane.append(target, box);
    stage.canvas.append(lane);
    const cap = h("div", "d-caption", "绿色竖线是目标位置：少量回弹后必须停稳，不要果冻感");
    cap.style.cssText = `position:absolute;left:${PAD}px;top:222px`;
    stage.canvas.append(cap);

    const ease = gsap.parseEase("elastic.out(1, 0.62)");
    const travel = W - PAD * 2 - 60;
    const DUR = preset.timeline?.actionMs || 850;
    return {
      durationMs: DUR * 1.6,
      render(t) {
        // 去 + 回：各占一半
        const half = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;
        box.style.transform = `translateX(${(ease(clamp01(half)) * travel).toFixed(1)}px)`;
      },
    };
  },
};
