import { h, pic, seg, clamp01, lerp, easeOut, easeInOut, easeOutCubic, stagger, seeded, svg, svgEl, LOGICAL_W as W, LOGICAL_H as H } from "../kit.js";

/** 交互模式：真实滚动。画布固定逻辑尺寸，宿主可滚，滚动位置映射到 t。 */
function realScroll(stage) {
  return {
    attach(st, api) {
      const host = st.hostEl;
      host.classList.add("scrollable");
      const spacer = h("div", "scroll-spacer");
      host.append(spacer);
      st.canvas.classList.add("canvas-sticky");
      const onScroll = () => {
        const max = host.scrollHeight - host.clientHeight;
        api.setT(max > 0 ? host.scrollTop / max : 0);
      };
      host.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      this._cleanup = () => {
        host.removeEventListener("scroll", onScroll);
        host.classList.remove("scrollable");
        st.canvas.classList.remove("canvas-sticky");
        spacer.remove();
        host.scrollTop = 0;
      };
    },
    detach() {
      if (this._cleanup) this._cleanup();
    },
  };
}

const photoLayer = (stage, seed, w = 900, ht = 520) => {
  const p = pic(seed, w, ht, "");
  p.style.cssText += "position:absolute;inset:-8%;width:116%;height:116%";
  stage.canvas.append(p);
  return p;
};

/**
 * 山脊剪影层：固定种子生成锯齿山脊，近景可在脊线上种树。
 * 返回绝对定位的容器（底部对齐、可向上平移而不露底）。
 */
function ridgeLayer(stage, seedStr, { fill, bottom = "-24%", height = "62%", peaks = 7, trees = 0, treeFill }) {
  const RW = 640;
  const RH = 240;
  const rnd = seeded(seedStr);
  const pts = [];
  const step = RW / peaks;
  for (let i = 0; i <= peaks; i += 1) {
    pts.push([i * step, RH * (0.18 + rnd() * 0.42)]);
    if (i < peaks) pts.push([i * step + step / 2, RH * (0.5 + rnd() * 0.34)]);
  }
  const yAt = (x) => {
    for (let i = 0; i < pts.length - 1; i += 1) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      if (x >= x1 && x <= x2) return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1 || 1e-6);
    }
    return pts[pts.length - 1][1];
  };
  const s = svg(RW, RH);
  s.setAttribute("preserveAspectRatio", "none");
  s.style.cssText = "position:absolute;left:0;bottom:0;width:100%;height:100%;display:block";
  let d = `M0 ${RH} L0 ${pts[0][1].toFixed(1)}`;
  for (const [x, y] of pts) d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  d += ` L${RW} ${RH} Z`;
  s.append(svgEl("path", { d, fill }));
  const rndT = seeded(`${seedStr}:trees`);
  for (let i = 0; i < trees; i += 1) {
    const x = 24 + rndT() * (RW - 48);
    const y = yAt(x);
    const th = 14 + rndT() * 22;
    const tw = th * (0.32 + rndT() * 0.12);
    s.append(
      svgEl("polygon", {
        points: `${x.toFixed(1)},${(y - th).toFixed(1)} ${(x - tw).toFixed(1)},${(y + 2).toFixed(1)} ${(x + tw).toFixed(1)},${(y + 2).toFixed(1)}`,
        fill: treeFill || fill,
      }),
    );
  }
  const wrap = h("div", "d-hill");
  wrap.style.cssText = `position:absolute;left:-6%;right:-6%;bottom:${bottom};height:${height}`;
  wrap.append(s);
  stage.canvas.append(wrap);
  return wrap;
}

export const variants = {
  parallax({ stage, preset }) {
    const c = preset.content || {};
    const sky = photoLayer(stage, c.seed || "summit");
    // 远景山脊（无树、色浅）与近景山脊（有树、色深）：速度差要肉眼可辨
    const mid = ridgeLayer(stage, "ridge-mid", { fill: "#1a2a20", bottom: "-18%", height: "54%", peaks: 6 });
    const fore = ridgeLayer(stage, "ridge-fore", { fill: "#0b130e", bottom: "-42%", height: "56%", peaks: 8, trees: 14, treeFill: "#0b130e" });
    const title = h("div", "d-h1", c.title || "视差滚动");
    title.style.cssText = "position:absolute;left:50%;top:24%;transform:translateX(-50%);font-size:32px;text-shadow:0 2px 14px rgba(0,0,0,.6)";
    stage.canvas.append(title);
    return {
      durationMs: preset.timeline?.actionMs || 2400,
      interactive: realScroll(stage),
      render(t, { reduced }) {
        const k = reduced ? 0 : 1;
        sky.style.transform = `translateY(${(-t * 16 * k).toFixed(1)}px) scale(${(1 + t * 0.04 * k).toFixed(4)})`;
        mid.style.transform = `translateY(${(-t * 60 * k).toFixed(1)}px)`;
        fore.style.transform = `translateY(${(-t * 150 * k).toFixed(1)}px)`;
        title.style.transform = `translateX(-50%) translateY(${(-t * 190 * k).toFixed(1)}px)`;
        title.style.opacity = String(Math.max(0, 1 - t * 1.6));
      },
    };
  },

  "multi-layer-parallax"({ stage, preset }) {
    const c = preset.content || {};
    const sky = photoLayer(stage, c.seed || "valley");
    // 四层：照片远景 → 三道山脊，越远越浅色、越慢；最近一层带树
    const far = ridgeLayer(stage, "ml-far", { fill: "#20342a", bottom: "-10%", height: "44%", peaks: 5 });
    const mid2 = ridgeLayer(stage, "ml-mid", { fill: "#14231b", bottom: "-20%", height: "50%", peaks: 7 });
    const near = ridgeLayer(stage, "ml-near", { fill: "#0a120d", bottom: "-38%", height: "56%", peaks: 9, trees: 16, treeFill: "#0a120d" });
    const layers = [sky, far, mid2, near];
    const speeds = [10, 26, 58, 120];
    const cap = h("div", "d-caption", `${layers.length} 层 · 层数越多，每层位移越小`);
    cap.style.cssText = "position:absolute;left:18px;top:14px;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.7);z-index:5";
    stage.canvas.append(cap);
    return {
      durationMs: preset.timeline?.actionMs || 2600,
      interactive: realScroll(stage),
      render(t, { reduced }) {
        const k = reduced ? 0 : 1;
        layers.forEach((d, i) => {
          d.style.transform = `translateY(${(-t * speeds[i] * k).toFixed(1)}px)`;
        });
      },
    };
  },

  horizontal({ stage, preset }) {
    const c = preset.content || {};
    const seeds = c.seeds || [];
    const labels = c.cards || [];
    const row = h("div");
    row.style.cssText = "position:absolute;left:24px;top:96px;display:flex;gap:12px";
    seeds.forEach((seed, i) => {
      const card = h("div", "d-card2");
      card.style.cssText = "width:190px;flex:none";
      const p = h("div", "pic");
      const im = new Image();
      im.src = `https://picsum.photos/seed/${seed}/380/200`;
      im.alt = labels[i] || "";
      p.append(im);
      const meta = h("div", "meta");
      meta.append(h("div", "t", labels[i] || `作品 ${i + 1}`));
      card.append(p, meta);
      row.append(card);
    });
    const cap = h("div", "d-caption", "纵向滚动 → 横向浏览");
    cap.style.cssText = "position:absolute;left:24px;top:52px";
    stage.canvas.append(row, cap);
    const dist = Math.max(0, seeds.length * 202 - (W - 48));
    return {
      durationMs: preset.timeline?.actionMs || 2600,
      interactive: realScroll(stage),
      render(t) {
        row.style.transform = `translateX(${(-t * dist).toFixed(1)}px)`;
      },
    };
  },

  zoom({ stage, preset }) {
    const c = preset.content || {};
    const photo = h("div");
    photo.style.cssText = "position:absolute;overflow:hidden;will-change:transform,width,height";
    const im = new Image();
    im.src = `https://picsum.photos/seed/${c.seed || "gadget-9"}/1000/620`;
    im.alt = c.title || "";
    im.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
    photo.append(im);
    const title = h("div", "d-h1", c.title || "滚动缩放");
    title.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:28px;text-shadow:0 2px 14px rgba(0,0,0,.6)";
    stage.canvas.append(photo, title);
    // 从中心小尺寸放大到铺满：几何按画布中心计算，终点严格居中
    const w0 = 180;
    const h0 = 112;
    return {
      durationMs: preset.timeline?.actionMs || 2400,
      interactive: realScroll(stage),
      render(t) {
        const p = easeInOut(clamp01(t));
        const w = lerp(w0, W, p);
        const ht = lerp(h0, H, p);
        photo.style.width = `${w.toFixed(1)}px`;
        photo.style.height = `${ht.toFixed(1)}px`;
        photo.style.left = `${((W - w) / 2).toFixed(1)}px`;
        photo.style.top = `${((H - ht) / 2).toFixed(1)}px`;
        photo.style.borderRadius = `${(12 - p * 12).toFixed(1)}px`;
        title.style.opacity = String(Math.max(0, 1 - t * 3));
      },
    };
  },

  "sticky-story"({ stage, preset }) {
    const c = preset.content || {};
    const steps = c.steps || [];
    const seeds = c.seeds || [];
    const left = h("div");
    left.style.cssText = "position:absolute;left:20px;top:50%;transform:translateY(-50%);width:190px;display:flex;flex-direction:column;gap:10px";
    const items = steps.map((t) => {
      const d = h("div", "d-step", t);
      left.append(d);
      return d;
    });
    const right = h("div");
    right.style.cssText = "position:absolute;right:26px;top:50%;transform:translateY(-50%);width:330px;height:230px;border-radius:11px;overflow:hidden;border:1px solid #2b3340";
    const im = new Image();
    im.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
    right.append(im);
    const cap = h("div", "d-caption");
    cap.style.cssText = "position:absolute;left:12px;bottom:10px;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.7)";
    right.append(cap);
    stage.canvas.append(left, right);
    const n = Math.max(1, steps.length);
    return {
      durationMs: preset.timeline?.actionMs || 3000,
      interactive: realScroll(stage),
      render(t) {
        const active = Math.min(n - 1, Math.floor(t * n * 0.999));
        items.forEach((d, i) => {
          const on = i === active;
          d.style.borderColor = on ? "#8acd00" : "#232b36";
          d.style.color = on ? "#e9edf4" : "#8d97a5";
          d.style.background = on ? "#16202e" : "#12161d";
        });
        const seed = seeds[active];
        if (seed && im.dataset.seed !== seed) {
          im.dataset.seed = seed;
          im.src = `https://picsum.photos/seed/${seed}/660/460`;
        }
        cap.textContent = `固定区域 · 第 ${active + 1} / ${n} 段`;
      },
    };
  },

  "image-sequence"({ stage, preset }) {
    const c = preset.content || {};
    const total = c.totalFrames || 24;
    const wrap = h("div");
    wrap.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:150px;height:230px;perspective:800px";
    const device = h("div", "d-seq-device");
    device.style.cssText =
      "width:100%;height:100%;border-radius:16px;border:1px solid #35486a;background:linear-gradient(150deg,#22303f,#141a22);position:relative;transform-style:preserve-3d";
    const screen = h("div");
    screen.style.cssText =
      "position:absolute;inset:9px;border-radius:10px;background:linear-gradient(160deg,#2b3b56,#16202e);overflow:hidden";
    const stripe = h("div");
    stripe.style.cssText =
      "position:absolute;top:12%;left:12%;right:12%;height:26%;border-radius:6px;background:rgba(255,255,255,.14)";
    const stripe2 = h("div");
    stripe2.style.cssText =
      "position:absolute;top:44%;left:12%;right:34%;height:12%;border-radius:5px;background:rgba(255,255,255,.1)";
    screen.append(stripe, stripe2);
    device.append(screen);
    wrap.append(device);
    const readout = h("div", "d-num sm");
    readout.style.cssText = "position:absolute;left:50%;top:26px;transform:translateX(-50%);font-size:15px";
    const cap = h("div", "d-caption", `${c.caption || "确定性绘制序列"} · 共 ${total} 帧`);
    cap.style.cssText = "position:absolute;left:50%;bottom:14px;transform:translateX(-50%)";
    stage.canvas.append(wrap, readout, cap);
    return {
      durationMs: preset.timeline?.actionMs || 2600,
      interactive: realScroll(stage),
      render(t, { reduced }) {
        const frame = Math.round(t * (total - 1));
        readout.textContent = `F ${String(frame).padStart(3, "0")} / ${String(total).padStart(3, "0")}`;
        device.style.transform = reduced ? "none" : `rotateY(${(frame * (360 / total)).toFixed(1)}deg)`;
        if (frame > 0 && frame < 6 && device.firstElementChild) {
          // 前几帧给一点进入感，仍由帧决定
        }
        screen.style.opacity = "1";
      },
    };
  },

  snap({ stage, preset }) {
    const c = preset.content || {};
    const seeds = c.seeds || [];
    const sections = c.sections || [];
    const wrap = h("div");
    wrap.style.cssText = "position:absolute;inset:0";
    const blocks = sections.map((label, i) => {
      const b = h("div");
      b.style.cssText = "position:absolute;inset:0;overflow:hidden";
      const p = pic(seeds[i] || "summit", 900, 500, "");
      p.style.cssText += "position:absolute;inset:0";
      const t = h("div", "d-h2", label);
      t.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:26px;text-shadow:0 2px 14px rgba(0,0,0,.7)";
      b.append(p, t);
      wrap.append(b);
      return b;
    });
    stage.canvas.append(wrap);
    const cap = h("div", "d-caption", "停止滚动后对齐到最近区块");
    cap.style.cssText = "position:absolute;left:18px;bottom:14px;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.7)";
    stage.canvas.append(cap);
    const n = Math.max(1, blocks.length);
    return {
      durationMs: preset.timeline?.actionMs || 1800,
      interactive: realScroll(stage),
      render(t) {
        const pos = t * (n - 1);
        blocks.forEach((b, i) => {
          const off = i - pos;
          b.style.display = Math.abs(off) < 1 ? "" : "none";
          b.style.opacity = String(clamp01(1 - Math.abs(off)));
          b.style.transform = `translateY(${(off * 18).toFixed(1)}px)`;
        });
      },
    };
  },

  progress({ stage, preset }) {
    const c = preset.content || {};
    const bar = h("div");
    bar.style.cssText = "position:absolute;left:0;right:0;top:0;height:3px;background:#1b212a;z-index:4";
    const fill = h("i");
    fill.style.cssText = "display:block;height:100%;width:0;background:var(--accent)";
    bar.append(fill);
    const label = h("div", "d-caption");
    label.style.cssText = "position:absolute;right:14px;top:12px;z-index:4";
    const col = h("div");
    col.style.cssText = "position:absolute;left:26px;right:26px;top:52px;display:flex;flex-direction:column;gap:11px";
    (c.paragraphs || []).forEach((txt, i) => {
      const p = h("div", "d-sub", `${i + 1}. ${txt}`);
      p.style.cssText += ";background:#12161d;border:1px solid #222a34;border-radius:8px;padding:10px 12px";
      col.append(p);
    });
    stage.canvas.append(bar, label, col);
    return {
      durationMs: preset.timeline?.actionMs || 2200,
      interactive: realScroll(stage),
      render(t) {
        fill.style.width = `${(t * 100).toFixed(1)}%`;
        label.textContent = `阅读进度 ${Math.round(t * 100)}%`;
      },
    };
  },
};

void seg;
void easeOut;
void easeOutCubic;
void stagger;
