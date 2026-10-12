/**
 * 卡片悬停微演示：按动效家族提供一个 8 秒内的循环动画。
 * 只在悬停时挂载、离开时销毁，尺寸按卡片预览区（约 246×129px）设计。
 */
import { h, gsap, GROUP_COLORS, SEEDS } from "../kit.js";

const base = (host, effect) => {
  const wrap = h("div");
  wrap.style.cssText = "position:absolute;inset:0;overflow:hidden;background:#0c0e13";
  host.append(wrap);
  return wrap;
};

const grain = (wrap, color) => {
  const g = h("div");
  g.style.cssText = `position:absolute;inset:0;background:radial-gradient(90% 90% at 50% 10%, ${color}22, transparent 60%)`;
  wrap.append(g);
};

export const builders = {
  handling(host, effect) {
    const wrap = base(host, effect);
    const color = GROUP_COLORS[effect.group] || "#8acd00";
    grain(wrap, color);
    const W = 180;
    const H = 62;
    const ease = gsap.parseEase("power2.out");
    let d = "";
    for (let i = 0; i <= 50; i += 1) {
      const x = (i / 50) * W;
      const y = H - ease(i / 50) * (H - 8) - 4;
      d += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " ";
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.style.cssText = "position:absolute;left:50%;top:50%;width:74%;transform:translate(-50%,-50%)";
    svg.innerHTML = `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`;
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("r", "3.6");
    dot.setAttribute("fill", "#fff");
    dot.setAttribute("stroke", color);
    dot.setAttribute("stroke-width", "2");
    svg.append(dot);
    wrap.append(svg);
    const st = { t: 0 };
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
    tl.to(st, {
      t: 1,
      duration: 1.5,
      ease: "none",
      onUpdate: () => {
        dot.setAttribute("cx", (st.t * W).toFixed(1));
        dot.setAttribute("cy", (H - ease(st.t) * (H - 8) - 4).toFixed(1));
      },
    });
    return { destroy: () => tl.kill() };
  },

  enter(host, effect) {
    const wrap = base(host, effect);
    const a = h("div");
    a.style.cssText = `position:absolute;inset:0;background:url("https://picsum.photos/seed/${SEEDS.mountain}/360/200") center/cover`;
    const b = h("div");
    b.style.cssText = `position:absolute;inset:0;background:url("https://picsum.photos/seed/${SEEDS.ocean}/360/200") center/cover;opacity:0`;
    wrap.append(a, b);
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.9 });
    tl.fromTo(a, { opacity: 1 }, { opacity: 0, duration: 0.7, ease: "power1.inOut" }, 0.6);
    tl.fromTo(b, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power1.inOut" }, 0.6);
    tl.fromTo(b, { opacity: 1 }, { opacity: 0, duration: 0.7, ease: "power1.inOut" }, 2.2);
    tl.fromTo(a, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power1.inOut" }, 2.2);
    return { destroy: () => tl.kill() };
  },

  text(host, effect) {
    const wrap = base(host, effect);
    grain(wrap, GROUP_COLORS[effect.group]);
    const box = h("div");
    box.style.cssText =
      "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;gap:5px";
    const lines = ["把动效", "讲清楚"].map((t) => {
      const clip = h("div");
      clip.style.overflow = "hidden";
      const inner = h("div", null, t);
      inner.style.cssText = "font-size:19px;font-weight:750;color:#fff;letter-spacing:.5px";
      clip.append(inner);
      box.append(clip);
      return inner;
    });
    wrap.append(box);
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.1 });
    tl.fromTo(lines, { yPercent: 112, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.14, ease: "power2.out" });
    tl.to(lines, { opacity: 0, y: -8, duration: 0.3, ease: "power2.in" }, "+=0.9");
    return { destroy: () => tl.kill() };
  },

  scroll(host, effect) {
    const wrap = base(host, effect);
    const sky = h("div");
    sky.style.cssText = `position:absolute;inset:-14%;background:url("https://picsum.photos/seed/${SEEDS.mountain}/420/240") center/cover`;
    const mid = h("div");
    mid.style.cssText =
      "position:absolute;left:-10%;right:-10%;bottom:-6%;height:52%;background:linear-gradient(#2c3f33,#16201a);border-radius:48% 52% 0 0/90% 90% 0 0";
    const fore = h("div");
    fore.style.cssText =
      "position:absolute;left:-14%;right:-14%;bottom:-24%;height:48%;background:linear-gradient(#1e2921,#0e1410);border-radius:52% 48% 0 0/72% 72% 0 0";
    wrap.append(sky, mid, fore);
    const st = { p: 0 };
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(st, {
      p: 1,
      duration: 2.2,
      ease: "sine.inOut",
      onUpdate: () => {
        gsap.set(sky, { y: -st.p * 8 });
        gsap.set(mid, { y: -st.p * 22 });
        gsap.set(fore, { y: -st.p * 44 });
      },
    });
    return { destroy: () => tl.kill() };
  },

  pointer(host, effect) {
    const wrap = base(host, effect);
    grain(wrap, GROUP_COLORS[effect.group]);
    const btn = h("div", "d-btn", "悬停");
    btn.style.cssText += ";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:7px 16px;font-size:11px;z-index:2";
    wrap.append(btn);
    const cur = h("div");
    cur.style.cssText =
      "position:absolute;width:11px;height:11px;border-radius:50%;background:#fff;mix-blend-mode:difference;z-index:3;transform:translate(-50%,-50%)";
    wrap.append(cur);
    const st = { a: 0 };
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(st, {
      a: Math.PI * 2,
      duration: 2.6,
      ease: "none",
      onUpdate: () => {
        const cx = wrap.clientWidth / 2 + Math.cos(st.a) * wrap.clientWidth * 0.3;
        const cy = wrap.clientHeight / 2 + Math.sin(st.a) * wrap.clientHeight * 0.26;
        gsap.set(cur, { left: cx, top: cy });
        const dx = cx - wrap.clientWidth / 2;
        const dy = cy - wrap.clientHeight / 2;
        const pull = Math.max(0, 1 - Math.hypot(dx, dy) / 150);
        gsap.set(btn, { x: dx * 0.22 * pull, y: dy * 0.22 * pull });
      },
    });
    return { destroy: () => tl.kill() };
  },

  component(host, effect) {
    const wrap = base(host, effect);
    grain(wrap, GROUP_COLORS[effect.group]);
    const page = h("div");
    page.style.cssText = "position:absolute;inset:0;padding:10px 12px";
    page.innerHTML =
      '<div style="height:7px;border-radius:4px;background:#1c232d;width:64%;margin-bottom:6px"></div>' +
      '<div style="height:7px;border-radius:4px;background:#1c232d;width:44%"></div>';
    const scrim = h("div");
    scrim.style.cssText = "position:absolute;inset:0;background:#05070a;opacity:0";
    const modal = h("div", "d-modal");
    modal.style.cssText += ";position:absolute;width:56%;left:22%;top:26%;opacity:0;padding:11px";
    modal.innerHTML =
      '<div style="font-size:11px;font-weight:600;color:#dfe5ee;margin-bottom:5px">确认操作？</div>' +
      '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:8px"><div class="d-btn ghost" style="padding:3px 9px;font-size:10px">取消</div><div class="d-btn" style="padding:3px 9px;font-size:10px">确认</div></div>';
    wrap.append(page, scrim, modal);
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.7 });
    tl.to(scrim, { opacity: 0.45, duration: 0.3 });
    tl.fromTo(modal, { opacity: 0, scale: 0.9, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" }, "<0.05");
    tl.to({}, { duration: 1.0 });
    tl.to(modal, { opacity: 0, scale: 0.94, duration: 0.24, ease: "power2.in" });
    tl.to(scrim, { opacity: 0, duration: 0.24 }, "<");
    return { destroy: () => tl.kill() };
  },

  feedback(host, effect) {
    const wrap = base(host, effect);
    grain(wrap, GROUP_COLORS[effect.group]);
    const num = h("div", "d-num", "0");
    num.style.cssText += ";position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);font-size:24px";
    const bar = h("div", "d-progress");
    bar.style.cssText += ";position:absolute;left:18%;right:18%;bottom:26%";
    const fill = h("i");
    bar.append(fill);
    wrap.append(num, bar);
    const st = { v: 0 };
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.7 });
    tl.to(st, {
      v: 12864,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => {
        num.textContent = Math.round(st.v).toLocaleString("en-US");
        fill.style.width = `${(st.v / 12864) * 100}%`;
      },
    });
    tl.to({}, { duration: 0.4 });
    return { destroy: () => tl.kill() };
  },

  layout(host, effect) {
    const wrap = base(host, effect);
    grain(wrap, GROUP_COLORS[effect.group]);
    const mkCard = (seed) => {
      const c = h("div", "d-card2");
      c.style.cssText += ";position:absolute;width:34%;left:33%;top:16%;";
      const p = h("div", "pic");
      const im = new Image();
      im.src = `https://picsum.photos/seed/${seed}/160/90`;
      p.append(im);
      const meta = h("div", "meta");
      meta.append(h("div", "t", "卡片"));
      c.append(p, meta);
      wrap.append(c);
      return c;
    };
    const a = mkCard(SEEDS.mountain);
    const b = mkCard(SEEDS.ocean);
    gsap.set(a, { left: "12%", top: "18%" });
    gsap.set(b, { left: "54%", top: "18%" });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8, yoyo: true });
    tl.to(a, { left: "54%", duration: 0.6, ease: "power2.inOut" }, 0.5);
    tl.to(b, { left: "12%", duration: 0.6, ease: "power2.inOut" }, 0.5);
    return { destroy: () => tl.kill() };
  },

  ux(host, effect) {
    const wrap = base(host, effect);
    grain(wrap, GROUP_COLORS[effect.group]);
    const row = h("div", "d-row");
    row.style.cssText += ";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);gap:12px";
    const els = ["d-btn", "d-btn ghost", "d-btn"].map((cls, i) => {
      const b = h("div", cls, ["保存", "取消", "提交"][i]);
      b.style.cssText += ";padding:5px 12px;font-size:10.5px";
      row.append(b);
      return b;
    });
    wrap.append(row);
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
    els.forEach((el, i) => {
      tl.call(() => {
        els.forEach((x) => (x.style.outline = "none"));
        el.style.outline = "2px solid #8acd00";
        el.style.outlineOffset = "3px";
      }, i * 0.7);
    });
    tl.to({}, { duration: 0.7 });
    return { destroy: () => tl.kill() };
  },
};

/** 把单个动效的微演示挂载到 host（卡片预览区）。 */
export function mountMini(host, effect) {
  host.textContent = "";
  const build = builders[effect.demo] || builders.enter;
  let inst = null;
  try {
    inst = build(host, effect);
  } catch {
    /* 微演示失败时静默回退为静态封面 */
  }
  return {
    destroy() {
      try {
        inst && inst.destroy && inst.destroy();
      } finally {
        host.textContent = "";
      }
    },
  };
}
