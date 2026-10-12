import { h, pic, clamp01, easeOut, lerp, seeded, LOGICAL_W as W, LOGICAL_H as H } from "../kit.js";

/** 视频演示里的预设光标轨迹：完全由 t 决定，任意 seek 结果一致。 */
const pathOf = (t) => ({
  x: W * (0.5 + 0.33 * Math.sin(t * Math.PI * 2 - Math.PI / 2)),
  y: H * (0.5 + 0.28 * Math.sin(t * Math.PI * 3.2 - 1.2)),
});

function fakeCursor(stage) {
  const c = h("div", "d-cursor");
  c.style.opacity = "0";
  stage.canvas.append(c);
  return c;
}

/** 真实指针模式：直接由指针事件驱动，不经过 t。 */
function pointerInput(stage) {
  return {
    attach(st, api) {
      const onMove = (e) => {
        const r = st.hostEl.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * W;
        const y = ((e.clientY - r.top) / r.height) * H;
        this._onMove && this._onMove(x, y);
        void api;
      };
      const onLeave = () => this._onLeave && this._onLeave();
      st.hostEl.addEventListener("pointermove", onMove);
      st.hostEl.addEventListener("pointerleave", onLeave);
      this._cleanup = () => {
        st.hostEl.removeEventListener("pointermove", onMove);
        st.hostEl.removeEventListener("pointerleave", onLeave);
      };
    },
    detach() {
      if (this._cleanup) this._cleanup();
    },
    set onMove(fn) {
      this._onMove = fn;
    },
    set onLeave(fn) {
      this._onLeave = fn;
    },
  };
}

export const variants = {
  magnetic({ stage, preset }) {
    const c = preset.content || {};
    const bgi = pic(c.seed || "aurora", 900, 500, "");
    bgi.style.cssText += "position:absolute;inset:0;opacity:.32";
    const veil = h("div");
    veil.style.cssText = "position:absolute;inset:0;background:radial-gradient(90% 90% at 50% 45%, rgba(10,12,16,.25), rgba(10,12,16,.8))";
    stage.canvas.append(bgi, veil);
    const btn = h("div", "d-btn", c.cta || "开始使用");
    btn.style.cssText += ";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:14px 30px;font-size:15px;z-index:3;box-shadow:0 8px 26px rgba(138,205,0,.32)";
    const cur = fakeCursor(stage);
    const hint = h("div", "d-caption", "光标靠近时按钮被吸引");
    hint.style.cssText = "position:absolute;left:50%;bottom:16px;transform:translateX(-50%);z-index:3";
    stage.canvas.append(btn, hint);

    const cxx = W / 2;
    const cyy = H / 2;
    const apply = (x, y) => {
      const dx = x - cxx;
      const dy = y - cyy;
      const pull = Math.max(0, 1 - Math.hypot(dx, dy) / 175);
      btn.style.transform = `translate(-50%,-50%) translate(${(dx * 0.24 * pull).toFixed(1)}px, ${(dy * 0.24 * pull).toFixed(1)}px)`;
      const r = Math.round(pull * 100);
      hint.textContent = r > 2 ? `吸引强度 ${r}%` : "光标靠近时按钮被吸引";
    };
    const input = pointerInput(stage);
    input.onMove = apply;
    input.onLeave = () => apply(9999, 9999);

    return {
      durationMs: preset.timeline?.actionMs || 1800,
      interactive: input,
      render(t, { reduced }) {
        const p = pathOf(t);
        cur.style.opacity = "1";
        cur.style.left = `${p.x}px`;
        cur.style.top = `${p.y}px`;
        cur.style.transform = "translate(-50%,-50%)";
        if (reduced) {
          btn.style.transform = "translate(-50%,-50%)";
          hint.textContent = "减少动态：不做位移";
          return;
        }
        apply(p.x, p.y);
      },
    };
  },

  "tilt-card"({ stage, preset }) {
    const c = preset.content || {};
    const card = h("div", "d-card2");
    card.style.cssText =
      "position:absolute;left:50%;top:50%;width:330px;height:212px;transform-style:preserve-3d;will-change:transform";
    const p = h("div", "pic");
    const im = new Image();
    im.src = `https://picsum.photos/seed/${c.seed || "timber"}/660/380`;
    im.alt = c.title || "";
    p.append(im);
    const meta = h("div", "meta");
    meta.append(h("div", "t", c.title || "作品卡片"), h("div", "b", c.sub || ""));
    const glare = h("div", "d-glare");
    card.append(p, meta, glare);
    stage.canvas.append(card);
    stage.canvas.style.perspective = "760px";

    // 高光是卡片的子元素，坐标要换算到卡片局部系（卡片 330×212 居中）
    const CARD_W = 330;
    const CARD_H = 212;
    const cardL = (W - CARD_W) / 2;
    const cardT = (H - CARD_H) / 2;
    const apply = (x, y) => {
      const nx = x / W - 0.5;
      const ny = y / H - 0.5;
      card.style.transform = `translate(-50%,-50%) rotateY(${(nx * 15).toFixed(2)}deg) rotateX(${(-ny * 15).toFixed(2)}deg)`;
      glare.style.opacity = "1";
      glare.style.left = `${(x - cardL).toFixed(1)}px`;
      glare.style.top = `${(y - cardT).toFixed(1)}px`;
    };
    const input = pointerInput(stage);
    input.onMove = apply;
    input.onLeave = () => {
      card.style.transform = "translate(-50%,-50%)";
      glare.style.opacity = "0";
    };

    return {
      durationMs: preset.timeline?.actionMs || 1800,
      interactive: input,
      render(t, { reduced }) {
        if (reduced) {
          card.style.transform = "translate(-50%,-50%)";
          glare.style.opacity = "0";
          return;
        }
        const p2 = pathOf(t);
        apply(p2.x, p2.y);
      },
    };
  },

  "cursor-follower"({ stage, preset }) {
    const c = preset.content || {};
    const gal = h("div");
    gal.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;gap:10px";
    (c.seeds || []).forEach((seed) => {
      const card = h("div", "d-card2");
      card.style.cssText = "width:150px";
      const p = h("div", "pic");
      const im = new Image();
      im.src = `https://picsum.photos/seed/${seed}/300/170`;
      im.alt = c.label || "";
      p.append(im);
      const meta = h("div", "meta");
      meta.append(h("div", "t", c.label || "查看"));
      card.append(p, meta);
      gal.append(card);
    });
    const ring = h("div", "d-ring");
    const dot = h("div", "d-dotcursor");
    stage.canvas.append(gal, ring, dot);

    const apply = (x, y) => {
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
      const over = y > H * 0.3 && y < H * 0.72;
      ring.style.width = over ? "52px" : "34px";
      ring.style.height = over ? "52px" : "34px";
      ring.style.borderColor = over ? "#96d60c" : "#8acd00";
    };
    const input = pointerInput(stage);
    input.onMove = apply;

    return {
      durationMs: preset.timeline?.actionMs || 2000,
      interactive: input,
      render(t, { reduced }) {
        const p = pathOf(t);
        apply(p.x, p.y);
        if (reduced) {
          ring.style.transform = "translate(-50%,-50%)";
          dot.style.transform = "translate(-50%,-50%)";
        }
      },
    };
  },

  spotlight({ stage, preset }) {
    const c = preset.content || {};
    // 经典聚光灯：整图压深色遮罩，遮罩在光标处开一个圆形软边孔，露出下面的照片
    const photo = pic(c.seed || "neon-lights", 900, 500, "");
    photo.style.cssText += "position:absolute;inset:0";
    const shade = h("div");
    shade.style.cssText = "position:absolute;inset:0;background:rgba(3,4,7,.93);z-index:2";
    const R = 118;
    const maskAt = (x, y) =>
      `radial-gradient(circle ${R}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, transparent 0 ${R - 46}px, black ${R}px)`;
    const setMask = (x, y) => {
      const m = maskAt(x, y);
      shade.style.maskImage = m;
      shade.style.webkitMaskImage = m;
    };
    setMask(W / 2, H / 2);
    // 光圈描边，让聚光灯边缘可读
    const ring = h("div");
    ring.style.cssText = `position:absolute;width:${R * 2 - 40}px;height:${R * 2 - 40}px;border-radius:50%;border:1.5px solid rgba(138,205,0,.55);transform:translate(-50%,-50%);z-index:3;pointer-events:none`;
    const title = h("div", "d-h1", c.title || "光标聚光灯");
    title.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:26px;z-index:4;text-shadow:0 2px 14px rgba(0,0,0,.85)";
    stage.canvas.append(photo, shade, ring, title);

    const apply = (x, y) => {
      setMask(x, y);
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
    };
    const input = pointerInput(stage);
    input.onMove = apply;
    input.onLeave = () => apply(W / 2, H / 2);

    return {
      durationMs: preset.timeline?.actionMs || 2000,
      interactive: input,
      render(t, { reduced }) {
        if (reduced) {
          apply(W / 2, H / 2);
          return;
        }
        const p = pathOf(t);
        apply(p.x, p.y);
      },
    };
  },

  eyes({ stage, preset }) {
    void preset;
    const face = h("div");
    face.style.cssText =
      "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:14px;padding:22px 26px;background:#151b24;border:1px solid #263040;border-radius:20px";
    const row = h("div", "d-eye2");
    const eyes = [0, 1].map(() => {
      const e = h("div", "d-eye");
      const p = h("div", "d-pupil");
      e.append(p);
      row.append(e);
      return { e, p };
    });
    const mouth = h("div");
    mouth.style.cssText = "width:28px;height:12px;border:2px solid #8d97a5;border-top:0;border-radius:0 0 15px 15px";
    face.append(row, mouth);
    const cap = h("div", "d-caption", "瞳孔只在眼白内部移动，始终不越过眼睛边缘");
    cap.style.cssText = "position:absolute;left:50%;bottom:16px;transform:translateX(-50%)";
    stage.canvas.append(face, cap);

    const apply = (x, y) => {
      const cb = stage.canvas.getBoundingClientRect();
      eyes.forEach(({ e, p }) => {
        const b = e.getBoundingClientRect();
        const cx = b.left - cb.left + b.width / 2;
        const cy = b.top - cb.top + b.height / 2;
        const ang = Math.atan2(y - cy, x - cx);
        const max = b.width / 2 - 13;
        const sc = (stage.canvas.clientWidth || W) / W;
        p.style.transform = `translate(${(Math.cos(ang) * max * 0.9 / (sc || 1)).toFixed(1)}px, ${(Math.sin(ang) * max * 0.9 / (sc || 1)).toFixed(1)}px)`;
      });
    };
    const input = pointerInput(stage);
    input.onMove = apply;
    input.onLeave = () => apply(W / 2, H / 2);

    return {
      durationMs: 2000,
      interactive: input,
      render(t, { reduced }) {
        if (reduced) {
          apply(W / 2, H / 2);
          cap.textContent = "减少动态：瞳孔保持居中";
          return;
        }
        const p = pathOf(t);
        apply(p.x, p.y);
      },
    };
  },

  trail({ stage, preset }) {
    const c = preset.content || {};
    const bgi = pic(c.seed || "tide", 900, 500, "");
    bgi.style.cssText += "position:absolute;inset:0;opacity:.3";
    const title = h("div", "d-h1", c.title || "光标拖尾");
    title.style.cssText = "position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);font-size:26px;text-shadow:0 2px 12px rgba(0,0,0,.6)";
    const cap = h("div", "d-caption", "正文与按钮附近要暂停拖尾");
    cap.style.cssText = "position:absolute;left:50%;bottom:16px;transform:translateX(-50%)";
    stage.canvas.append(bgi, title, cap);

    const N = 14;
    const dots = Array.from({ length: N }, (_, i) => {
      const d = h("div", "d-trail");
      d.style.cssText = `background:${i % 2 ? "#b3ec35" : "#8acd00"}`;
      stage.canvas.append(d);
      return d;
    });
    const rnd = seeded("trail");
    const sizes = Array.from({ length: N }, () => 6 + rnd() * 5);

    const place = (x, y, scale = 1, alpha = 1) => {
      dots.forEach((d, i) => {
        d.style.width = `${sizes[i]}px`;
        d.style.height = `${sizes[i]}px`;
        d.style.left = `${x}px`;
        d.style.top = `${y}px`;
        d.style.transform = `translate(-50%,-50%) scale(${(scale * (1 - i / (N + 4))).toFixed(2)})`;
        d.style.opacity = String(Math.max(0, alpha * (1 - i / N)));
      });
    };
    const input = pointerInput(stage);
    let last = { x: W / 2, y: H / 2, alpha: 1 };
    input.onMove = (x, y) => {
      place(x, y, 1, 1);
      last = { x, y, alpha: 1 };
    };
    input.onLeave = () => place(last.x, last.y, 0.4, 0);

    return {
      durationMs: preset.timeline?.actionMs || 2200,
      interactive: input,
      render(t, { reduced }) {
        if (reduced) {
          dots.forEach((d) => (d.style.opacity = "0"));
          cap.textContent = "减少动态：关闭拖尾";
          return;
        }
        // 轨迹按 t 回看历史位置：完全由 t 决定
        for (let i = 0; i < N; i += 1) {
          const back = Math.max(0, t - i * 0.022);
          const p = pathOf(back);
          const d = dots[i];
          d.style.width = `${sizes[i]}px`;
          d.style.height = `${sizes[i]}px`;
          d.style.left = `${p.x}px`;
          d.style.top = `${p.y}px`;
          d.style.transform = `translate(-50%,-50%) scale(${(1 - i / (N + 4)).toFixed(2)})`;
          d.style.opacity = String(Math.max(0, 1 - i / N) * clamp01(t * 4));
        }
      },
    };
  },

  "reactive-bg"({ stage, preset }) {
    const c = preset.content || {};
    const bgi = pic(c.seed || "facade", 1000, 560, "");
    bgi.style.cssText += "position:absolute;inset:-8%;width:116%;height:116%;opacity:.42";
    const grid = h("div");
    grid.style.cssText =
      "position:absolute;inset:-10%;background-image:linear-gradient(#202a37 1px,transparent 1px),linear-gradient(90deg,#202a37 1px,transparent 1px);background-size:32px 32px";
    const glow = h("div", "d-spot");
    glow.style.cssText += ";width:360px;height:360px";
    const title = h("div", "d-h1", c.title || "指针响应背景");
    title.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:26px;z-index:3;text-shadow:0 2px 12px rgba(0,0,0,.6)";
    const cap = h("div", "d-caption", "响应要慢于光标，停止后缓慢恢复");
    cap.style.cssText = "position:absolute;left:50%;bottom:16px;transform:translateX(-50%);z-index:3";
    stage.canvas.append(bgi, grid, glow, title, cap);

    const apply = (x, y) => {
      const nx = x / W - 0.5;
      const ny = y / H - 0.5;
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
      glow.style.transform = "translate(-50%,-50%)";
      grid.style.transform = `translate(${(nx * 18).toFixed(1)}px, ${(ny * 18).toFixed(1)}px) skewY(${(nx * 1).toFixed(2)}deg)`;
      bgi.style.transform = `translate(${(nx * 12).toFixed(1)}px, ${(ny * 12).toFixed(1)}px)`;
    };
    const input = pointerInput(stage);
    input.onMove = apply;

    return {
      durationMs: preset.timeline?.actionMs || 2200,
      interactive: input,
      render(t, { reduced }) {
        const p = pathOf(t);
        if (reduced) {
          apply(W / 2, H / 2);
          cap.textContent = "减少动态：背景保持静止";
          return;
        }
        apply(p.x, p.y);
      },
    };
  },

  "3d-follow"({ stage, preset }) {
    const c = preset.content || {};
    const wrap = h("div");
    wrap.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:132px;height:132px;perspective:760px";
    const box = h("div");
    box.style.cssText = "width:100%;height:100%;position:relative;transform-style:preserve-3d;will-change:transform";
    const transforms = [
      "translateZ(66px)",
      "rotateY(180deg) translateZ(66px)",
      "rotateY(90deg) translateZ(66px)",
      "rotateY(-90deg) translateZ(66px)",
      "rotateX(90deg) translateZ(66px)",
      "rotateX(-90deg) translateZ(66px)",
    ];
    (c.seeds || []).slice(0, 6).forEach((seed, i) => {
      const f = h("div");
      f.style.cssText = `position:absolute;inset:0;transform:${transforms[i]};overflow:hidden;border-radius:6px;border:1px solid rgba(255,255,255,.09)`;
      const im = new Image();
      im.src = `https://picsum.photos/seed/${seed}/264/264`;
      im.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
      f.append(im);
      box.append(f);
    });
    wrap.append(box);
    const cap = h("div", "d-caption", "大幅旋转只用于展示；主要信息不应跟着转");
    cap.style.cssText = "position:absolute;left:50%;bottom:16px;transform:translateX(-50%)";
    stage.canvas.append(wrap, cap);

    const apply = (x, y) => {
      const nx = x / W - 0.5;
      const ny = y / H - 0.5;
      box.style.transform = `rotateY(${(nx * 46).toFixed(2)}deg) rotateX(${(-ny * 28).toFixed(2)}deg)`;
    };
    const input = pointerInput(stage);
    input.onMove = apply;
    input.onLeave = () => apply(W / 2, H / 2);

    void easeOut;
    void lerp;
    return {
      durationMs: preset.timeline?.actionMs || 2400,
      interactive: input,
      render(t, { reduced }) {
        if (reduced) {
          box.style.transform = "rotateY(18deg)";
          cap.textContent = "减少动态：只做轻微固定角度";
          return;
        }
        const p = pathOf(t);
        apply(p.x, p.y);
      },
    };
  },
};
