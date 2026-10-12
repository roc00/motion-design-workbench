/**
 * 演示内核 v3
 *
 * 设计约束（来自 PLAN 第 3 节）：
 *  - 画面由「当前帧 + 配置」决定：render(t) 是纯函数，任意顺序 seek 到同一 t 结果一致。
 *  - 统一控制器：ready / play / pause / seek / reset / destroy / capabilities。
 *  - 卡片与详情复用同一 renderer 与 preset，只改变尺寸与控件。
 *  - 随机与离散文案不得依赖历史回调：随机用固定种子，文案由 t 计算。
 *  - 资源加载完成才算 ready；减少动态给静态终态。
 */
import gsap from "gsap";

export { gsap };

/* ------------------------------------------------------------------ */
/* 常量                                                                */
/* ------------------------------------------------------------------ */

/** 演示舞台的逻辑尺寸。所有演示都按这个尺寸绘制，再整体缩放到容器。 */
export const LOGICAL_W = 640;
export const LOGICAL_H = 360;

export const GROUP_COLORS = {
  手感控制: "#f0a35c",
  内容进出: "#5b9dff",
  文字动效: "#4fd1a5",
  滚动与空间: "#a78bfa",
  指针与鼠标: "#f472b6",
  组件状态: "#38bdf8",
  等待与反馈: "#fbbf24",
  布局与页面: "#fb923c",
  "UX 规则": "#94a3b8",
  数据叙事: "#22d3ee",
};

export const NATURE_LABEL = { effect: "效果", principle: "原理", rule: "规则" };

export const prefersReduced = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* DOM 与数学工具                                                      */
/* ------------------------------------------------------------------ */

export function h(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text != null) el.textContent = text;
  return el;
}

export const clamp01 = (x) => (Number.isFinite(x) ? (x < 0 ? 0 : x > 1 ? 1 : x) : 0);
export const lerp = (a, b, t) => a + (b - a) * t;
/** 把 t 在 [from,to] 区间内归一化到 0..1 并夹紧 */
export const seg = (t, from, to) => clamp01((t - from) / (to - from || 1e-6));
export const easeOut = (x) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x) => x * x * x;
export const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOutCubic = easeOut;
/** 不超调插值：数值、长度、面积必须用它（图表禁止回弹） */
export const noOvershoot = (x) => easeOut(clamp01(x));
/** 第 i 个元素在一个总时长内的交错进度；dur 为单项动作占总时长的比例 */
export const stagger = (t, i, n, dur = 0.55) => {
  const w = n > 1 ? (1 - dur) / (n - 1) : 0;
  return seg(t, i * w, i * w + dur);
};

/* ------------------------------------------------------------------ */
/* 闭式弹簧物理（纯时间函数，可任意 seek）                                */
/*   下列函数的 t 参数均为「秒」（相对该弹簧启动时刻）；渲染器里          */
/*   只有归一化 t 时，先乘 durationMs/1000 转成秒再传入。               */
/* ------------------------------------------------------------------ */

/** 闭式阻尼弹簧：0→1，t 为秒；纯时间函数，无需逐帧积分即可 seek */
export function spring(t, k = 170, d = 26) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k);
  const z = d / (2 * w0);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

/**
 * 多目标值：keys = [[timeSec, value], ...]，每次目标变化叠加一个独立弹簧，
 * 不重启弹簧，保证运动连续且任意 seek。
 */
export function track(t, keys, k = 170, d = 26) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
  }
  return v;
}

/** 标签/指示条：前缘更刚、后缘更柔，运动中形成拉伸 */
export function indicator(t, stops) {
  const lead = track(t, stops, 320, 30);
  const trail = track(t, stops, 140, 22);
  return { left: Math.min(lead, trail), right: Math.max(lead, trail) + 120 };
}

/** 变形容器内文字：变形开始后进入、下一次变形前离开（t 为秒） */
export function swapAlpha(t, tIn, tOut) {
  return Math.min(clamp01((t - tIn - 0.08) / 0.12), clamp01((tOut - 0.1 - t) / 0.1));
}

/** 固定种子随机：同样输入永远得到同样结果（用于乱码、粒子等） */
export function seeded(seed) {
  let s = 0;
  for (const c of String(seed)) s = (s * 31 + c.charCodeAt(0)) % 2147483647;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

/* ------------------------------------------------------------------ */
/* 图片素材：Lorem Picsum，种子固定（可确定性复现）                      */
/*   注意：固定 seed 只保证「同一张图」，素材本身仍来自网络。             */
/*   离线或加载失败时退回占位底色，不阻塞 ready。                        */
/* ------------------------------------------------------------------ */

export const SEEDS = {
  hero: "aurora",
  lake: "valley",
  forest: "timber",
  city: "neon-lights",
  desk: "workbench",
  product: "gadget-9",
  mountain: "summit",
  ocean: "tide",
  garden: "bloom",
  arch: "facade",
  camera: "lens",
  watch: "chronograph",
};

export function img(seed, w = 640, ht = 360) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${ht}`;
}

/** 图片元素；宽高比由外层容器决定 */
export function pic(seed, w = 640, ht = 360, alt = "") {
  const wrap = h("div", "ph");
  const im = new Image();
  im.src = img(seed, w, ht);
  im.alt = alt || seed;
  im.decoding = "sync";
  wrap.append(im);
  return wrap;
}

export function picCard(seed, title, body, w = 240, ht = 135) {
  const c = h("div", "d-card2");
  const p = h("div", "pic");
  const im = new Image();
  im.src = img(seed, w, ht);
  im.alt = title;
  p.append(im);
  const meta = h("div", "meta");
  meta.append(h("div", "t", title), h("div", "b", body));
  c.append(p, meta);
  return c;
}

/* ------------------------------------------------------------------ */
/* 场景积木                                                            */
/* ------------------------------------------------------------------ */

/** 真实页面场景：导航 + 内容区 */
export function appScene(stage, opts = {}) {
  const page = h("div", "d-page");
  let nav = null;
  if (opts.nav !== false) {
    nav = h("div", "d-nav");
    nav.append(h("span", "d-logo"), h("span", "brand-t", opts.brand || "Motion Kit"));
    for (const [i, t] of (opts.navLinks || ["产品", "案例", "定价"]).entries()) {
      nav.append(h("a", i === (opts.activeNav || 0) ? "on" : null, t));
    }
    if (opts.cta !== false) nav.append(h("span", "d-btn mini", opts.ctaText || "开始"));
    page.append(nav);
  }
  const body = h("div", "d-hero");
  page.append(body);
  stage.canvas.append(page);
  return { page, nav, body };
}

/** 中性设备框：内屏尺寸与输出画幅分开，这里只负责内屏 */
export function phoneFrame(stage, device = {}, opts = {}) {
  const wrap = h("div", "d-phone");
  const shell = h("div", "d-phone-shell");
  const screen = h("div", "d-phone-screen");
  const inner = h("div", "d-phone-inner");
  screen.append(inner);
  shell.append(screen);
  wrap.append(shell);
  const ratio = (device.innerWidth || 393) / (device.innerHeight || 852);
  const height = opts.height || 300;
  shell.style.height = `${height}px`;
  shell.style.width = `${height * ratio}px`;
  stage.canvas.append(wrap);
  return { wrap, shell, screen, inner };
}

/* ------------------------------------------------------------------ */
/* 舞台：固定逻辑尺寸 + 整体缩放                                        */
/* ------------------------------------------------------------------ */

export function createStage(host, opts = {}) {
  const root = h("div", "stage");
  if (opts.compact) root.classList.add("compact");

  let bar = null;
  let hint = null;
  if (!opts.compact) {
    bar = h("div", "stage-bar");
    bar.append(h("span", "name", opts.title || ""));
    hint = h("span", "hint", "");
    bar.append(hint);
    root.append(bar);
  } else {
    hint = h("span", "hint", "");
  }

  const hostEl = h("div", "canvas-host");
  const canvasCfg = opts.canvas || { width: 1920, height: 1080, format: "16:9" };
  hostEl.style.aspectRatio = `${canvasCfg.width} / ${canvasCfg.height}`;
  hostEl.dataset.format = canvasCfg.format || "16:9";
  const canvas = h("div", "canvas");
  canvas.style.width = `${LOGICAL_W}px`;
  canvas.style.height = `${LOGICAL_H}px`;
  hostEl.append(canvas);
  root.append(hostEl);

  let ctrl = null;
  if (!opts.compact) {
    ctrl = h("div", "stage-ctrl");
    root.append(ctrl);
  }
  host.append(root);

  const fit = () => {
    const w = hostEl.clientWidth || LOGICAL_W;
    const h = hostEl.clientHeight || LOGICAL_H;
    const k = Math.min(w / LOGICAL_W, h / LOGICAL_H);
    const x = (w - LOGICAL_W * k) / 2;
    const y = (h - LOGICAL_H * k) / 2;
    canvas.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(hostEl);

  return {
    root,
    canvas,
    ctrl,
    hostEl,
    compact: !!opts.compact,
    setHint(t) {
      hint.textContent = t;
    },
    el(tag, cls, text) {
      const e = h(tag, cls, text);
      canvas.append(e);
      return e;
    },
    /** 绝对定位子元素：舞台不再用 flex 居中 */
    abs(tag, cls, text) {
      const e = h(tag, cls, text);
      e.dataset.abs = "1";
      canvas.append(e);
      return e;
    },
    destroy() {
      ro.disconnect();
      root.remove();
    },
  };
}

/* ------------------------------------------------------------------ */
/* 控制器：ready / play / pause / seek / reset / destroy / capabilities */
/* ------------------------------------------------------------------ */

/** 同一时刻最多只有一个演示在播放（卡片悬停用） */
const playing = new Set();
export function stopAllExcept(ctrl) {
  for (const c of [...playing]) {
    if (c !== ctrl) c.pause();
  }
}

/**
 * @param {object} build - { durationMs, render(t), interactive?, loop?, assets? }
 */
export function createController(stage, build, opts = {}) {
  const durationMs = Math.max(200, build.durationMs || 2000);
  const reduced = prefersReduced();
  let t = 0;
  let raf = null;
  let proxyTween = null;
  let destroyed = false;
  const frameSubs = new Set();

  const renderAt = (v) => {
    t = clamp01(v);
    if (build.render) build.render(t, { stage, reduced });
    for (const cb of frameSubs) cb(t * durationMs);
  };

  const emitFrame = () => frameSubs.size > 0;

  const stopTween = () => {
    if (proxyTween) {
      proxyTween.kill();
      proxyTween = null;
    }
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  };

  const capabilities = {
    timeline: true,
    seek: build.seek !== false,
    interactive: !!build.interactive,
    loop: !!build.loop,
    scrub: build.seek !== false,
  };

  const api = {
    stage,
    durationMs,
    capabilities,
    get t() {
      return t;
    },
    setInteractive(on) {
      if (!build.interactive) return;
      if (on) build.interactive.attach(stage, { setT: (v) => renderAt(v) });
      else build.interactive.detach && build.interactive.detach();
      api.interactiveOn = !!on;
    },
    play() {
      if (destroyed) return;
      if (reduced) {
        api.seek(1);
        return;
      }
      stopTween();
      if (t >= 1) t = 0;
      const proxy = { v: t };
      proxyTween = gsap.to(proxy, {
        v: 1,
        duration: ((1 - t) * durationMs) / 1000,
        ease: "none",
        onUpdate: () => renderAt(proxy.v),
        onComplete: () => {
          renderAt(1);
          proxyTween = null;
          playing.delete(api);
          api.onStateChange && api.onStateChange("end");
        },
      });
      playing.add(api);
      stopAllExcept(api);
      api.onStateChange && api.onStateChange("play");
    },
    pause() {
      stopTween();
      playing.delete(api);
      api.onStateChange && api.onStateChange("pause");
    },
    toggle() {
      if (proxyTween) api.pause();
      else api.play();
    },
    seek(frameOrMs) {
      stopTween();
      playing.delete(api);
      const v = opts.seekByFrame ? frameOrMs / (opts.totalFrames || 1) : frameOrMs / durationMs;
      renderAt(v);
      api.onStateChange && api.onStateChange("seek");
    },
    seekFrame(frame, fps = 30) {
      api.seek((Math.max(0, frame) / fps) * 1000);
    },
    reset() {
      stopTween();
      playing.delete(api);
      renderAt(0);
      api.onStateChange && api.onStateChange("reset");
    },
    isPlaying() {
      return !!proxyTween;
    },
    onFrame(cb) {
      frameSubs.add(cb);
      return () => frameSubs.delete(cb);
    },
    /** 资源加载完成后重新按当前帧渲染一次（图片尺寸到位会改变布局） */
    refresh() {
      renderAt(t);
    },
    /** 直接设置进度（0..1） */
    setT(v) {
      renderAt(v);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopTween();
      playing.delete(api);
      frameSubs.clear();
      try {
        build.interactive && build.interactive.detach && build.interactive.detach();
      } catch {
        /* 忽略 */
      }
      try {
        build.destroy && build.destroy();
      } catch {
        /* 忽略 */
      }
      stage.destroy();
    },
  };

  /** 演示自带的控制条（如 blur 开关）在这里拿到控制器，用于改参后重绘当前帧 */
  if (build.bindController) build.bindController(api);
  renderAt(opts.initialT != null ? opts.initialT : 0);
  api.state = "idle";
  return api;
}

/** 等待场景中所有图片就绪；失败或超时都算就绪（退回占位底色） */
export function waitForAssets(root, timeoutMs = 4000) {
  const imgs = [...root.querySelectorAll("img")].filter((i) => !i.complete);
  if (!imgs.length) return Promise.resolve();
  return new Promise((resolve) => {
    let left = imgs.length;
    const done = () => {
      left -= 1;
      if (left <= 0) resolve();
    };
    const timer = setTimeout(resolve, timeoutMs);
    for (const i of imgs) {
      i.addEventListener("load", done, { once: true });
      i.addEventListener("error", done, { once: true });
    }
    void timer;
  });
}

/* ------------------------------------------------------------------ */
/* SVG 工具（图表用，自绘不引第三方库）                                 */
/* ------------------------------------------------------------------ */

const NS = "http://www.w3.org/2000/svg";

export function svg(w, ht) {
  const s = document.createElementNS(NS, "svg");
  s.setAttribute("viewBox", `0 0 ${w} ${ht}`);
  s.setAttribute("width", "100%");
  s.setAttribute("height", "100%");
  s.style.display = "block";
  return s;
}

export function svgEl(tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}

export function svgText(x, y, text, attrs = {}) {
  const e = svgEl("text", { x, y, ...attrs });
  e.textContent = text;
  return e;
}

/* ------------------------------------------------------------------ */
/* 统一格式工具                                                        */
/* ------------------------------------------------------------------ */

export const fmtMs = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)}s` : `${ms}ms`);
export const fmtNum = (n, digits = 0) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
/** 等宽数字，避免计数时标签抖动 */
export const tabular = (el) => {
  el.style.fontVariantNumeric = "tabular-nums";
  return el;
};
