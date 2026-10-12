const clamp = (value) => Math.max(0, Math.min(1, value));
const mix = (a, b, t) => a + (b - a) * clamp(t);
const seg = (t, from, to) => clamp((t - from) / Math.max(0.0001, to - from));
const ease = (t) => { const x = clamp(t); return x * x * (3 - 2 * x); };
const esc = (value) => String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
const n = (value) => Number(value).toFixed(1);
// 确定性伪随机：同一序号永远得到同一值，保证逐帧渲染可复现
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lime = "#9be014";
const ink = "#080a08";
const panel = "#161918";
const panel2 = "#222724";
const muted = "#747b76";
const white = "#f4f6f2";

const rect = (x, y, w, h, fill = panel, rx = 12, extra = "") => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line = (x1, y1, x2, y2, stroke = muted, width = 3, extra = "") => `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" ${extra}/>`;
const circle = (cx, cy, r, fill = lime, extra = "") => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}" ${extra}/>`;
const text = (x, y, value, size = 18, fill = white, anchor = "start", weight = 600, extra = "") => `<text x="${n(x)}" y="${n(y)}" fill="${fill}" font-size="${size}" font-family="Inter, sans-serif" text-anchor="${anchor}" font-weight="${weight}" ${extra}>${esc(value)}</text>`;
const card = (x, y, w, h, label = "", fill = panel, accent = lime) => `${rect(x, y, w, h, fill, 14, `stroke="rgba(255,255,255,.13)"`)}${rect(x + 18, y + 18, Math.min(42, w * .22), 6, accent, 3)}${label ? text(x + 18, y + h - 18, label, 13, white) : ""}`;
const chrome = (title) => `${rect(0, 0, 640, 360, ink, 0)}${text(24, 30, title, 13, muted, "start", 500)}${circle(604, 24, 4, lime)}`;

// 贝塞尔点：通用三次贝塞尔插值
function bezierPoint(u, p0, p1, p2, p3) {
  const mt = 1 - u;
  const a = mt * mt * mt, b = 3 * mt * mt * u, c = 3 * mt * u * u, d = u * u * u;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

/** 每类演示的默认时长（毫秒）。分卡时长写在 data/shot-recipes.json 的 demoIndex，这里只兜底。 */
const KIND_DURATION = {
  "crash-zoom": 2200, "depth-layers": 2400, "overhead": 2800,
  "shot-seams": 4000, "hidden-cut": 2600, "wipe": 2400, "card-flip": 2400, "circle-iris": 3000, "line-carry": 2600,
  "hinge-rise": 2600, "card-stack": 2000, "progressive-assemble": 2600, "list-reveal": 2400, "primitive-morph": 2600,
  "type-filter": 2800, "ai-stream": 3200, "command-palette": 3000, "input-trigger": 2600,
  "before-after": 2800, "chart-live": 2800, "odometer": 3200, "timeline": 2800,
  "beat-cut": 2400, "speed-freeze": 2800, "montage": 2600,
  "spotlight-hero": 3000, "brand-ink": 3000, "paper-title": 2800,
  // 第二批：来自 57 个真实宣传视频拆解的电影化衔接
  "zoom-through-portal": 2400, "match-cut-shape": 1600, "color-veil-cut": 2000, "match-cut-motion": 1500,
  "glow-bloom-scene": 2200, "shared-morph-chain": 2200, "device-frame-swap": 1800, "persistent-cursor": 2400,
  "clone-to-grid": 2200, "liquid-section-divider": 2400, "particles-to-logo": 2800, "word-slot-scramble": 1600,
  "hero-orbit-rings": 3000, "ui-drill-in-out": 2400, "split-split-merge": 2200, "pull-back-overview": 2600,
};

// 两个 #rrggbb 颜色按 t 插值
function mixColor(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(mix(v, pb[i], t)));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
// 确定性星空（穿框穿越/辉光场景复用）
function starField(seedBase = 0, count = 26) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const x = rnd(i + 1 + seedBase) * 640, y = 40 + rnd(i + 99 + seedBase) * 280, r = 0.8 + rnd(i + 7) * 1.6;
    out += circle(x, y, r, `rgba(255,255,255,${n(0.35 + rnd(i + 3) * 0.5)})`);
  }
  return out;
}
// 以某点为锚的缩放包裹
const zoomWrap = (cx, cy, s, inner) => `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(s)}) translate(${n(-cx)} ${n(-cy)})">${inner}</g>`;

function visual(kind, t, uid) {
  const p = ease(t);
  const enter = ease(seg(t, 0.08, 0.72));
  switch (kind) {
    case "crash-zoom": {
      // 真实用法：急推打在字卡字符上，抽出一个主角词，终帧过曝/模糊切下一章
      const q = ease(seg(t, .14, .56));
      const z = mix(1, 2.8, q);
      const fade = n(1 - seg(t, .5, .72));
      let out = text(150, 182, "让", 42, "#aab2ac", "middle", 700, `opacity="${fade}" transform="translate(${n(-q * 70)} 0)"`);
      out += text(490, 182, "发生", 42, "#aab2ac", "middle", 700, `opacity="${fade}" transform="translate(${n(q * 70)} 0)"`);
      out += zoomWrap(320, 182, z, text(320, 182, "协作", 42, lime, "middle", 800));
      for (let i = 0; i < 7; i++) { const yy = 70 + i * 38, len = (140 + rnd(i + 9) * 180) * q, o = q * (.12 + rnd(i) * .22); out += line(320, yy, 320 - len, yy, `rgba(255,255,255,${n(o)})`, 2) + line(320, yy, 320 + len, yy, `rgba(255,255,255,${n(o)})`, 2); }
      const flash = Math.sin(seg(t, .7, .92) * Math.PI);
      if (flash > 0) out += rect(0, 0, 640, 360, `rgba(255,255,255,${n(flash * .9)})`, 0);
      const next = ease(seg(t, .9, 1));
      if (next > 0) out += rect(60, 96, 520, 168, panel2, 18, `opacity="${n(next)}" stroke="${lime}"`) + text(320, 188, "下一章节", 26, white, "middle", 700, `opacity="${n(next)}"`);
      return out;
    }
    case "depth-layers": {
      // 真实用法：远/中/近层独立漂移（慢视差），近快远慢，而非三张横移卡差速
      const drift = ease(t);
      let far = "";
      for (let i = 0; i < 26; i++) { const bx = rnd(i + 1) * 760 - 60; const x = (((bx - drift * 34) % 760) + 760) % 760 - 60; const y = 40 + rnd(i + 9) * 280; far += circle(x, y, .8 + rnd(i + 3) * 1.4, `rgba(255,255,255,${n(.22 + rnd(i + 5) * .4)})`); }
      const mid = circle(mix(128, 64, drift), 118, 60, "#16221a") + circle(mix(566, 506, drift), 252, 84, "#131d17");
      const nx = mix(440, 276, drift), nz = mix(.88, 1.08, drift);
      const near = zoomWrap(nx, 182, nz, card(nx - 110, 118, 220, 128, "核心产品", "#29312c"));
      return far + mid + near + text(320, 332, "远慢 · 近快：独立层慢视差", 12, muted, "middle", 500);
    }

    case "overhead": {
      const route = ease(seg(t, .08, .5));
      const zoomT = ease(seg(t, .55, .88));
      const z = mix(.72, 1.35, zoomT);
      const panX = mix(0, -28, zoomT), panY = mix(0, -53, zoomT);
      let nodes = "";
      for (let i = 0; i < 8; i++) {
        const isTarget = i === 6;
        const lit = isTarget ? route > .7 : route > (i === 0 ? .02 : i === 4 ? .36 : 9);
        nodes += card(72 + (i % 4) * 138, 70 + Math.floor(i / 4) * 124, 108, 78, isTarget ? "目标" : `${i + 1}`, isTarget ? "#223018" : panel) +
          (lit ? rect(72 + (i % 4) * 138, 70 + Math.floor(i / 4) * 124, 108, 78, "none", 12, `stroke="${lime}" stroke-width="2"`) : "");
      }
      const routePath = "M126 109 L126 233 L348 233";
      return `<g transform="translate(${n(panX)} ${n(panY)}) translate(320 180) scale(${n(z)}) translate(-320 -180)">` +
        `${nodes}` +
        `<path d="${routePath}" fill="none" stroke="${lime}" stroke-width="3" stroke-linecap="round" pathLength="1" stroke-dasharray="${n(route)} 1"/>` +
        `${circle(126, 109, 7, route > .02 ? lime : "#4b534e")}${circle(126, 233, 7, route > .36 ? lime : "#4b534e")}${circle(348, 233, 9, route > .7 ? lime : "#4b534e")}` +
        `</g>`;
    }
    case "shot-seams": {
      const phase = Math.min(3, Math.floor(t * 4));
      const local = (t * 4) % 1;
      const names = ["硬切", "闪白", "暗场", "遮罩"];
      const sceneA = `${rect(38, 58, 564, 242, "#2d241d", 18)}${text(320, 150, "前镜 A", 30, white, "middle", 700)}${text(320, 186, "主张 · 旧信息", 13, muted, "middle", 500)}`;
      const sceneB = `${rect(38, 58, 564, 242, "#21301c", 18)}${text(320, 150, "后镜 B", 30, lime, "middle", 700)}${text(320, 186, "证据 · 新信息", 13, muted, "middle", 500)}`;
      let body = "";
      if (phase === 0) {
        // 硬切：无过渡，瞬间替换 + 单帧微闪
        body = local < .74 ? sceneA : sceneB;
        const flash = seg(local, .72, .76);
        if (flash > 0 && flash < 1) body += rect(0, 0, 640, 360, `rgba(255,255,255,${n(Math.sin(flash * Math.PI) * .55)})`, 0);
      } else if (phase === 1) {
        const w = Math.sin(seg(local, .3, .62) * Math.PI) * .9;
        body = local < .46 ? sceneA : sceneB;
        body += rect(0, 0, 640, 360, `rgba(255,255,255,${n(w)})`, 0);
      } else if (phase === 2) {
        const d = Math.sin(seg(local, .3, .62) * Math.PI) * .88;
        body = local < .46 ? sceneA : sceneB;
        body += rect(0, 0, 640, 360, `rgba(0,0,0,${n(d)})`, 0);
      } else {
        // 遮罩：扩张的圆揭示后镜，前镜留在圆外
        const r = mix(26, 460, ease(seg(local, .2, .72)));
        body = `${sceneA}<defs><clipPath id="mask-clip-${uid}"><circle cx="320" cy="178" r="${n(r)}"/></clipPath></defs><g clip-path="url(#mask-clip-${uid})">${sceneB}</g>${local > .8 ? "" : circle(320, 178, Math.min(24, r), "none", `stroke="${lime}" stroke-width="2"`)}`;
      }
      return `${body}${text(320, 330, `${names[phase]} · 前镜 A → 后镜 B`, 13, phase === 3 ? lime : muted, "middle", 600)}`;
    }
    case "hidden-cut": {
      // 真实高频：横甩运动模糊叠一次亮度峰值，在最糊/最亮的不可读帧换场景
      const scene = (bg, label, sub) => rect(30, 48, 580, 258, bg, 18) + text(320, 174, label, 38, white, "middle", 700) + text(320, 210, sub, 13, muted, "middle", 500);
      let out = t < .5 ? scene("#30231b", "场景 A", "动作完成") : scene("#1b2a30", "场景 B", "新场景开始");
      const whip = Math.sin(seg(t, .36, .62) * Math.PI);
      if (whip > 0) {
        for (let i = 0; i < 9; i++) { const o = whip * (.08 + rnd(i + 2) * .14); out += rect(0, 60 + i * 28, 640, 12, `rgba(220,228,224,${n(o)})`, 0, `transform="translate(${n((i - 4) * 10 * whip)} 0)"`); }
        out += rect(0, 0, 640, 360, `rgba(255,255,255,${n(whip * .5)})`, 0);
      }
      out += text(320, 330, whip > .5 ? "最糊 / 最亮 · 在此藏切" : "横甩运动模糊 →", 12, whip > .5 ? lime : muted, "middle", 600);
      return out;
    }
    case "wipe": {
      // 真实用法：绑定品牌色的对角楔/横条沿方向扫过，承担章节推进；新区域是对角前缘左侧的半平面
      const q = ease(seg(t, .12, .9));
      const d = mix(-200, 900, q);
      let out = rect(0, 0, 640, 360, "#241c28", 0) + text(170, 190, "旧章节", 32, white, "middle");
      out += `<polygon points="-420,0 ${n(d + 120)},0 ${n(d - 120)},360 -420,360" fill="#1c3320"/>`;
      out += `<polygon points="${n(d + 104)},0 ${n(d + 120)},0 ${n(d - 120)},360 ${n(d - 136)},360" fill="${lime}"/>`;
      if (q > .42) out += text(320, 190, "新章节", 32, lime, "middle");
      return out;
    }
    case "card-flip": {
      // 绕竖轴翻面：宽度随 cos 收窄，最窄处换面；画轴与明暗以体现空间
      const theta = Math.PI * ease(seg(t, .1, .9));
      const w = Math.max(3, 250 * Math.abs(Math.cos(theta)));
      const back = theta >= Math.PI / 2;
      const nearSpine = w < 30;
      const shade = Math.round((1 - Math.abs(Math.cos(theta))) * .5 * 255);
      const side = theta < Math.PI / 2 ? "right" : "left";
      const edgeX = side === "right" ? 320 + w / 2 : 320 - w / 2;
      const cardBody = nearSpine
        ? `${rect(320 - 5, 72, 10, 216, "#0c0e0d", 3, `stroke="rgba(255,255,255,.18)"`)}${rect(side === "right" ? 320 + 2 : 320 - 4, 72, 2, 216, "rgba(255,255,255,.28)", 1)}`
        : `${rect(320 - w / 2, 72, w, 216, back ? "#21321d" : panel2, 18, `stroke="${back ? lime : muted}" stroke-width="2"`)}` +
          `${rect(320 - w / 2, 72, w, 216, `rgba(0,0,0,${n(shade / 255)})`, 18)}` +
          `${w > 46 ? text(320, 170, back ? "结果" : "功能", 34, back ? lime : white, "middle", 700) : ""}` +
          `${w > 46 ? text(320, 204, back ? "提升 67%" : "自动分析", 15, muted, "middle", 500) : ""}`;
      return `${rect(318, 56, 4, 260, "rgba(155,224,20,.35)", 2)}${line(320, 56, 320, 316, "rgba(155,224,20,.5)", 2)}${rect(150, 330, 340, 5, "rgba(0,0,0,.4)", 3)}${cardBody}${text(320, 336, "绕竖轴翻面 · 最窄处换面", 11, muted, "middle", 500)}`;
    }
    case "circle-iris": {
      // A 场景通过圆形遮罩交给 B：收束 → 匹配切点 → 扩张揭示
      const close = ease(seg(t, .1, .45));
      const open = ease(seg(t, .55, .9));
      const r = t < .5 ? mix(520, 30, close) : mix(30, 520, open);
      const after = t >= .5;
      const scene = after
        ? `${rect(0, 0, 640, 360, "#19301f", 0)}${text(320, 166, "场景 B", 36, lime, "middle", 700)}${text(320, 202, "新场景 · 圆形内", 13, muted, "middle", 500)}`
        : `${rect(0, 0, 640, 360, "#30231c", 0)}${text(320, 166, "场景 A", 36, white, "middle", 700)}${text(320, 202, "焦点 · 圆形内", 13, muted, "middle", 500)}`;
      return `<defs><clipPath id="iris-clip-${uid}"><circle cx="320" cy="180" r="${n(r)}"/></clipPath></defs>` +
        `${rect(0, 0, 640, 360, "#050505", 0)}` +
        `<g clip-path="url(#iris-clip-${uid})">${scene}</g>` +
        `${circle(320, 180, 22, "none", `stroke="${lime}" stroke-width="3"`)}${circle(320, 180, 7, lime)}` +
        `${text(320, 322, t < .5 ? "收束到焦点 · 准备交接" : after && t < .9 ? "圆形扩张 · 揭示场景 B" : "交接完成", 12, muted, "middle", 500)}`;
    }
    case "line-carry": {
      // 一条箭头/光轨从前镜画出，跨切点方向连续，落到后镜结果上
      const q = ease(seg(t, .08, .86));
      let out = rect(28, 56, 270, 244, "#171d1a", 16) + rect(342, 56, 270, 244, "#171d1a", 16)
        + text(163, 84, "前镜", 13, muted, "middle", 600) + text(477, 84, "后镜", 13, muted, "middle", 600);
      const x0 = 70, y0 = 250, x1 = 572, y1 = 120;
      const x = mix(x0, x1, q), y = mix(y0, y1, q);
      const path = `M${x0} ${y0} L${x1} ${y1}`;
      out += `<path d="${path}" stroke="#2b332e" stroke-width="5" fill="none"/>`;
      out += `<path d="${path}" stroke="${lime}" stroke-width="5" stroke-linecap="round" pathLength="1" stroke-dasharray="${n(q)} 1"/>`;
      out += circle(x, y, 7, lime);
      if (q > .05) { const ang = Math.atan2(y1 - y0, x1 - x0); out += line(x, y, x + 16 * Math.cos(ang + 2.6), y + 16 * Math.sin(ang + 2.6), lime, 4) + line(x, y, x + 16 * Math.cos(ang - 2.6), y + 16 * Math.sin(ang - 2.6), lime, 4); }
      if (t >= .42 && t <= .58) out += text(320, 40, "切点 · 线索跨镜", 12, lime, "middle", 600);
      if (q >= .98) out += rect(516, 96, 100, 48, "#223018", 10, `stroke="${lime}"`) + text(566, 125, "结果", 14, white, "middle", 600);
      return out;
    }
    case "hinge-rise": {
      // 绕底边铰链翻起：高度 = H·sinθ，顶边略收窄，带厚度与投影
      const theta = (Math.PI / 2) * ease(seg(t, .12, .78));
      const H = 200;
      const topY = 274 - H * Math.sin(theta);
      const inset = 26 * Math.cos(theta);
      const thick = Math.max(2, 13 * Math.cos(theta));
      const showFace = Math.cos(theta) < .62;
      return `${ellipse(320, 288, 190, 14, `rgba(0,0,0,${n(.12 + .3 * Math.cos(theta))})`)}` +
        `${rect(140, 274, 360, thick, "#3a403c", 2)}` +
        `<polygon points="${140 + inset},${n(topY)} ${500 - inset},${n(topY)} 500,274 140,274" fill="#202824" stroke="${lime}" stroke-width="2"/>` +
        `${showFace ? text(320, mix(274, topY + 60, .5), "产品界面", 28, white, "middle", 700, `opacity="${n(ease(seg(t, .4, .7)))}"`) : ""}` +
        `${circle(140, 274, 5, lime)}${circle(500, 274, 5, lime)}` +
        `${text(320, 336, "铰链轴贴底 · 向上翻起", 11, muted, "middle", 500)}`;
    }

    case "card-stack": {
      // 卡片从顶部同一发牌点旋转飞入（deal-flyin 变体），归位成错落堆叠
      const home = [[150, 196], [320, 184], [490, 196]];
      let out = "";
      for (let i = 0; i < 3; i++) {
        const q = ease(seg(t, .08 + i * .12, .56 + i * .12));
        const x = mix(320, home[i][0], q), y = mix(96, home[i][1], q), rot = mix(16 - i * 12, (i - 1) * 4, q);
        out += `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(rot)})">${card(-75, -86, 150, 172, i === 2 ? "结果卡" : `卡 ${i + 1}`, i === 2 ? "#223018" : panel)}</g>`;
      }
      const deck = 1 - seg(t, .05, .4);
      if (deck > 0) out += rect(286, 74, 68, 22, "#0f1311", 6, `opacity="${n(deck)}"`);
      out += text(320, 300, t < .5 ? "发牌式旋转飞入" : "错落叠放 · 成组集合", 12, muted, "middle", 500);
      return out;
    }
    case "progressive-assemble": {
      const q1 = ease(seg(t, .08, .35)), q2 = ease(seg(t, .25, .55)), q3 = ease(seg(t, .45, .75)), q4 = ease(seg(t, .65, .92));
      return `${rect(112, 54, 416, 252, panel, 18, `stroke="rgba(255,255,255,.12)"`)}${rect(132, 74, 142, 212, "#222925", 14, `opacity="${n(q1)}"`)}${text(300, 112, "智能产品", 28, white, "start", 700, `opacity="${n(q2)}"`)}${rect(300, 136, 190, 10, "#404843", 5, `opacity="${n(q2)}"`)}${text(300, 202, "+67%", 38, lime, "start", 700, `opacity="${n(q3)}"`)}${rect(300, 246, 138, 34, lime, 17, `opacity="${n(q4)}"`)}${text(369, 269, "查看结果", 12, ink, "middle", 700, `opacity="${n(q4)}"`)}`;
    }
    case "list-reveal": {
      return `${rect(116, 52, 408, 256, panel, 18)}${[0,1,2,3].map(i=>{const q=ease(seg(t,.08+i*.12,.45+i*.12)); return `${rect(138,78+i*52,364,40,i===2&&t>.72?"#25351d":"#222724",10,`opacity="${n(q)}" transform="translate(${n((1-q)*34)} 0)"`)}${text(158,104+i*52,`结果 ${i+1}`,13,i===2&&t>.72?lime:white,"start",600,`opacity="${n(q)}"`)}`}).join("")}`;
    }
    case "primitive-morph": {
      const w = t < .45 ? mix(52, 180, ease(t / .45)) : mix(180, 360, ease((t - .45) / .55));
      const h = t < .45 ? 52 : mix(52, 184, ease((t - .45) / .55));
      return `${rect(320-w/2,180-h/2,w,h,t>.45?panel2:lime,Math.min(26,h/2),`stroke="${t>.45?lime:"none"}" stroke-width="2"`)}${w>120?text(320,182,t>.55?"完整信息卡":"开始",t>.55?24:14,t>.45?white:ink,"middle",700):""}${t>.72?text(320,216,"由同一对象连续扩展",12,muted,"middle",500):""}`;
    }
    case "type-filter": {
      const word = "AI".slice(0, Math.ceil(seg(t,.18,.46)*2));
      return `${rect(100,48,440,48,"#111512",24,`stroke="${t>.15?lime:muted}"`)}${text(128,78,word||"输入关键词",15,word?white:muted)}${[0,1,2,3].map(i=>{const keep=i===1||i===3;const q=t<.5?1:keep?1:1-ease(seg(t,.5,.78));const y=120+i*48-(t>.5&&!keep?0:(t>.5&&i===3?48:0));return `${rect(110,y,420,36,keep&&t>.72?"#21301c":panel,9,`opacity="${n(q)}"`)}${text(128,y+23,keep?`AI 匹配结果 ${i+1}`:`普通结果 ${i+1}`,12,keep&&t>.72?lime:white,"start",500,`opacity="${n(q)}"`)}`}).join("")}`;
    }
    case "ai-stream": {
      const q1=seg(t,.25,.48),q2=seg(t,.42,.68),q3=seg(t,.58,.84);
      return `${rect(74,50,492,258,panel,18)}${rect(96,74,330,38,"#222724",18)}${text(114,98,"总结今天的关键信息",13,white)}${t<.28?`${circle(112,146,5,lime)}${circle(130,146,5,"#536052")}${circle(148,146,5,"#536052")}`:""}${rect(96,132,Math.max(0,360*q1),8,"#aeb5b0",4)}${rect(96,158,Math.max(0,410*q2),8,"#707872",4)}${rect(96,184,Math.max(0,290*q3),8,"#707872",4)}${t>.84?`${circle(106,232,7,lime)}${text(124,237,"回答完成",12,lime)}`:""}`;
    }
    case "command-palette": {
      const open=ease(seg(t,.08,.35)), select=ease(seg(t,.45,.72)), done=seg(t,.75,.95);
      return `${rect(0,0,640,360,"#0c0e0d",0)}${rect(120,58+(1-open)*40,400,238,panel,18,`opacity="${n(open)}" stroke="rgba(255,255,255,.16)"`)}${rect(142,82+(1-open)*40,356,42,"#101411",10,`opacity="${n(open)}"`)}${text(160,108+(1-open)*40,"导出镜头配置",13,white,"start",500,`opacity="${n(open)}"`)}${[0,1,2].map(i=>`${rect(142,140+i*44,356,34,i===1?`rgba(155,224,20,${n(.08+.2*select)})`:"#1c211e",8,`opacity="${n(open)}"`)}${text(158,162+i*44,i===1?"生成视频镜头":"其他命令",12,i===1&&select>.5?lime:muted,"start",500,`opacity="${n(open)}"`)}`).join("")}${done?text(498,286,"已执行",11,lime,"end",600,`opacity="${n(done)}"`):""}`;
    }
    case "input-trigger": {
      const click=seg(t,.25,.48), result=ease(seg(t,.5,.88)); const cx=mix(180,315,ease(seg(t,.05,.32))),cy=mix(260,184,ease(seg(t,.05,.32)));
      return `${rect(244,154,152,58,click>.2?"#b5f13d":lime,29)}${text(320,190,"开始分析",14,ink,"middle",700)}${result?`${rect(166,238-(result*34),308,78,panel2,14,`opacity="${n(result)}" stroke="${lime}"`)}${text(320,248,"分析完成 · 发现 3 项",14,white,"middle",600,`opacity="${n(result)}"`)}`:""}<path d="M${n(cx)} ${n(cy)} l16 38 8-15 16 8 -24-31z" fill="${white}" stroke="${ink}" stroke-width="2"/>`;
    }
    case "before-after": {
      const x=mix(96,544,ease(seg(t,.12,.86)));
      return `<defs><clipPath id="after-clip-${uid}"><rect x="96" y="60" width="${n(x-96)}" height="240"/></clipPath></defs>${rect(96,60,448,240,"#2e2320",16)}${text(320,184,"之前 · 6 步",30,white,"middle",700)}<g clip-path="url(#after-clip-${uid})">${rect(96,60,448,240,"#1e3020",16)}${text(320,184,"现在 · 2 步",30,lime,"middle",700)}</g>${line(x,60,x,300,white,3)}${circle(x,180,14,white)}`;
    }
    case "chart-live": {
      const axis=ease(seg(t,.05,.28)), data=ease(seg(t,.24,.72)), mark=ease(seg(t,.7,.94)); const pts=[[112,250],[196,212],[278,224],[370,148],[456,166],[534,94]];
      const path=pts.map((pt,i)=>`${i?"L":"M"}${pt[0]} ${pt[1]}`).join(" ");
      return `${line(86,274,556,274,"#4a514c",2,`opacity="${n(axis)}"`)}${line(86,274,86,62,"#4a514c",2,`opacity="${n(axis)}"`)}<path d="${path}" fill="none" stroke="${lime}" stroke-width="5" pathLength="1" stroke-dasharray="${n(data)} 1"/>${circle(534,94,8,lime,`opacity="${n(mark)}"`)}${text(518,72,"峰值",12,lime,"middle",600,`opacity="${n(mark)}"`)}`;
    }
    case "odometer": {
      // 数字沿纵向滚动：每位一根数字条，进位逐列传递，终值停稳
      const roll = ease(seg(t, .14, .82));
      const start = [1, 2, 8]; // 百 / 十 / 个：128
      const steps = [8, 4, 9];  // 百 1→9、十 2→6、个 8→9→0→…→7
      const H = 102;
      const cols = start.map((s, i) => {
        const pos = s + steps[i] * roll;
        const d = Math.floor(pos) % 10;
        const frac = pos - Math.floor(pos);
        const prev = (d + 9) % 10, next = (d + 1) % 10;
        const x = 194 + i * 86;
        const active = i === 2;
        return `${rect(x, 118, 70, H, "#1c211e", 12)}` +
          `<defs><clipPath id="odo-clip-${uid}-${i}"><rect x="${x}" y="118" width="70" height="${H}" rx="12"/></clipPath></defs>` +
          `<g clip-path="url(#odo-clip-${uid}-${i})"><g transform="translate(0 ${n(-frac * H)})">` +
          `${text(x + 35, 118 - H + 69, String(prev), 54, active ? lime : white, "middle", 700)}` +
          `${text(x + 35, 118 + 69, String(d), 54, active ? lime : white, "middle", 700)}` +
          `${text(x + 35, 118 + H + 69, String(next), 54, active ? lime : white, "middle", 700)}` +
          `</g></g>`;
      }).join("");
      return `${text(320, 92, "活跃用户", 15, muted, "middle", 500)}${cols}${text(320, 256, t > .88 ? "新值已确认" : "数值滚动中 · 进位逐列传递", 12, t > .88 ? lime : muted, "middle", 500)}`;
    }
    case "timeline": {
      const x=mix(74,566,p); return `${line(72,184,568,184,"#3d443f",4)}${[0,1,2,3,4].map(i=>{const nx=80+i*120,active=x>=nx;return `${circle(nx,184,active?10:7,active?lime:"#4b534e")}${text(nx,222,`${2022+i}`,11,active?white:muted,"middle",500)}`}).join("")}${circle(x,184,5,white)}${text(x,142,t>.82?"当前":"穿行",12,lime,"middle",600)}`;
    }
    case "beat-cut": {
      const phase=Math.min(2,Math.floor(t*3)); const labels=["主张","产品","证据"], colors=["#2e241d","#1a2930","#21301c"];
      return `${rect(42,50,556,260,colors[phase],18)}${text(320,176,labels[phase],44,phase===2?lime:white,"middle",750)}${[0,1,2].map(i=>rect(262+i*42,252,28,5,i===phase?lime:"#4c534f",3)).join("")}`;
    }
    case "speed-freeze": {
      const travel=t<.68?Math.pow(t/.68,.45):1; const x=mix(56,478,travel); const freeze=seg(t,.68,.86);
      return `${[0,1,2].map(i=>line(x-32-i*26,180,x-8-i*18,180,`rgba(155,224,20,${n((1-freeze)*(.5-i*.12))})`,6)).join("")}${rect(x,132,106,96,"#26301f",16,`stroke="${lime}" stroke-width="2"`)}${text(x+53,187,"目标",18,white,"middle",700)}${freeze?`${line(x+53,126,x+53,84,lime,2)}${text(x+53,70,"关键结果",12,lime,"middle",600,`opacity="${n(freeze)}"`)}`:""}`;
    }
    case "montage": {
      const phase=Math.min(3,Math.floor(t*5)); const items=[["输入","#2d241d"],["分析","#1b2930"],["筛选","#292236"],["结果","#21301c"]]; const item=items[Math.min(3,phase)];
      return `${rect(38,48,564,264,item[1],18)}${text(320,174,item[0],42,phase===3?lime:white,"middle",750)}${text(320,208,phase===3?"完整结果停留":"短镜快速组接",13,muted,"middle",500)}`;
    }
    case "spotlight-hero": {
      // 真实用法：暗仪表盘上圆形光圈跟随光标扫过，只点亮一个数据点/榜单行
      const sweep = ease(seg(t, .1, .72));
      let lx = mix(108, 320, sweep), ly = 172 + Math.sin(sweep * Math.PI * 2.2) * 52;
      const lock = ease(seg(t, .72, .94));
      lx = mix(lx, 320, lock); ly = mix(ly, 206, lock);
      const R = mix(122, 96, lock);
      let out = `<defs><radialGradient id="spot-${uid}"><stop offset="0" stop-color="rgba(155,224,20,.26)"/><stop offset="0.7" stop-color="rgba(155,224,20,.06)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient></defs>`;
      out += rect(70, 64, 500, 232, "#0c0f0d", 18, "stroke=\"rgba(255,255,255,.08)\"");
      for (let i = 0; i < 5; i++) { const ry = 86 + i * 40, target = i === 3; out += rect(92, ry, 456, 32, target && lock > .2 ? `rgba(155,224,20,${n(.16 * lock)})` : "#141815", 8) + text(112, ry + 21, target ? "关键指标" : `数据 ${i + 1}`, 14, target ? (lock > .4 ? lime : "#6b736d") : "#5d655f", "start", 600); }
      out += circle(lx, ly, R, `url(#spot-${uid})`);
      out += circle(lx, ly, 4, white) + line(lx - 9, ly, lx + 9, ly, white, 1.5) + line(lx, ly - 9, lx, ly + 9, white, 1.5);
      out += text(320, 330, lock > .5 ? "光圈锁定唯一一个阅读点" : "暗仪表盘 · 光圈跟随光标", 12, lock > .5 ? lime : muted, "middle", 500);
      return out;
    }
    case "brand-ink": {
      const r=mix(10,430,ease(seg(t,.05,.66))), reveal=ease(seg(t,.6,.92));
      return `${circle(320,180,r,"#263b18")}${circle(270,150,r*.42,"#304a1c")}${circle(380,205,r*.33,"#1d3013")}${text(320,168,"MOTION",42,white,"middle",750,`opacity="${n(reveal)}"`)}${text(320,204,"让信息按镜头发生",14,lime,"middle",600,`opacity="${n(reveal)}"`)}`;
    }
    case "paper-title": {
      const y=mix(390,64,enter), title=ease(seg(t,.38,.7));
      return `${rect(92,y,456,232,"#eceee8",4,`transform="rotate(${n(mix(4,0,enter))} 320 180)"`)}${text(126,y+64,"CHAPTER 03",12,"#687066","start",600,`opacity="${n(title)}"`)}${text(126,y+122,"让结果成为证据",32,"#111511","start",750,`opacity="${n(title)}"`)}${line(126,y+150,470,y+150,"#9be014",5,`opacity="${n(title)}"`)}`;
    }
    /* ============ 第二批：来自真实宣传视频拆解的电影化衔接 ============ */
    case "zoom-through-portal": {
      // 工作台中央的圆形开口放大到满屏（径向拉伸），穿入后落入深色新场景
      if (t < .5) {
        const q = ease(seg(t, .08, .5)), r = mix(14, 470, q);
        let s = rect(0, 0, 640, 360, "#e9ede7", 0);
        s += card(36, 84, 150, 86, "面板 A", "#dfe6dc") + card(454, 84, 150, 86, "面板 B", "#dfe6dc") +
             card(36, 206, 150, 86, "列表", "#dfe6dc") + card(454, 206, 150, 86, "图表", "#dfe6dc");
        s += `<defs><clipPath id="zp-${uid}"><circle cx="320" cy="180" r="${n(r)}"/></clipPath></defs>` +
             `<g clip-path="url(#zp-${uid})">${rect(0, 0, 640, 360, "#0a1026", 0)}${starField(3)}</g>`;
        s += circle(320, 180, r, "none", `stroke="${lime}" stroke-width="4"`);
        if (q > .55) for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, r1 = r * .92, r2 = r * (1.04 + (q - .55) * .6);
          s += line(320 + Math.cos(a) * r1, 180 + Math.sin(a) * r1 * .56, 320 + Math.cos(a) * r2, 180 + Math.sin(a) * r2 * .56, "rgba(155,224,20,.7)", 3); }
        return s;
      }
      const q = ease(seg(t, .5, .92)), z = mix(1.9, 1, q);
      return rect(0, 0, 640, 360, "#0a1026", 0) + starField(3) +
        zoomWrap(320, 180, z, `${card(252, 118, 136, 124, "新功能", "#16203a", lime)}${text(320, 178, "✦", 32, lime, "middle", 700)}`) +
        (q > .9 ? text(320, 292, "穿过开口 · 落入新场景", 12, "#8b97b8", "middle", 500) : "");
    }
    case "match-cut-shape": {
      // 同一形状（橙底白字）放大出血，切点后换成新物体，背景形状不变
      let digit, z;
      if (t < .5) { z = mix(1, 3.2, ease(seg(t, .1, .5))); digit = "1"; }
      else { z = mix(3.2, 1, ease(seg(t, .5, .82))); digit = "6"; }
      const flash = Math.sin(seg(t, .46, .54) * Math.PI);
      return rect(0, 0, 640, 360, "#f0821c", 0) + zoomWrap(320, 190, z, text(320, 216, digit, 170, "#ffffff", "middle", 800)) +
        (flash > 0 ? rect(0, 0, 640, 360, `rgba(255,255,255,${n(flash * .6)})`, 0) : "") +
        text(320, 330, t < .5 ? "同形放大 · 充满画面" : "同形同字号 · 换成新物体", 12, "#5b3408", "middle", 600);
    }
    case "color-veil-cut": {
      // 整屏品牌紫幕涌满又散开，中央紫色锚点始终保留，新卡在原位浮出
      const purple = "#7c3aed";
      const veil = Math.sin(seg(t, .1, .9) * Math.PI);
      const aOut = 1 - seg(t, .12, .42), bIn = ease(seg(t, .6, .9));
      let s = rect(0, 0, 640, 360, "#ecefea", 0);
      s += `<g opacity="${n(aOut)}">${rect(200, 98, 240, 164, "#ffffff", 14, `stroke="#d7dcd4"`)}${rect(224, 126, 90, 10, purple, 5)}${rect(224, 150, 190, 8, "#d9dee0", 4)}${rect(224, 172, 150, 8, "#d9dee0", 4)}${rect(224, 194, 170, 8, "#d9dee0", 4)}</g>`;
      s += zoomWrap(320, 180, mix(1.06, 1, bIn), `<g opacity="${n(bIn)}">${rect(196, 94, 248, 172, "#efe9ff", 14, `stroke="${purple}" stroke-width="2"`)}${text(320, 152, "新章节", 24, "#4c1d95", "middle", 800)}${rect(232, 178, 176, 8, purple, 4)}${rect(232, 200, 140, 8, "#c4b5fd", 4)}${rect(232, 222, 160, 8, "#c4b5fd", 4)}</g>`);
      s += circle(320, 180, mix(8, 16, veil), purple, `opacity="${n(.3 + .7 * Math.max(aOut, bIn, veil))}"`);
      s += rect(0, 0, 640, 360, purple, 0, `opacity="${n(veil)}"`);
      return s;
    }
    case "match-cut-motion": {
      // 动势方向跨切点延续：A 向右出画，切点后 B 从左入画继续向右
      let s = rect(0, 0, 640, 360, "#eef0ea", 0);
      for (let k = 0; k < 3; k++) s += line(70, 120 + k * 60, 570, 120 + k * 60, "#dfe4dc", 2);
      if (t < .5) {
        const x = mix(120, 596, ease(seg(t, .08, .5))), blur = seg(t, .3, .5);
        s += circle(x - 36, 180, 22, `rgba(239,68,68,${n(.22 * blur)})`) + circle(x - 18, 180, 24, `rgba(239,68,68,${n(.45 * blur)})`) + circle(x, 180, 26, "#ef4444");
      } else {
        const q = ease(seg(t, .5, .88)), x = mix(30, 300, q), blur = 1 - seg(t, .5, .72);
        s += rect(x - 44, 154, 52, 52, "#ef4444", 8, `opacity="${n(.35 * blur + .2)}"`) + rect(x - 26, 154, 52, 52, "#ef4444", 8);
      }
      const flash = Math.sin(seg(t, .47, .53) * Math.PI);
      return s + (flash > 0 ? rect(0, 0, 640, 360, `rgba(255,255,255,${n(flash * .7)})`, 0) : "") +
        text(320, 300, t < .5 ? "主体向右出画 · 动势不停" : "新主体从左入画 · 方向继承", 13, "#6b7268", "middle", 600);
    }
    case "glow-bloom-scene": {
      // 发光点过曝铺满（藏切），白光退去后同方向主光打亮新产品场景
      const bloom = Math.sin(seg(t, .08, .72) * Math.PI), scene = ease(seg(t, .5, .82));
      let s = rect(0, 0, 640, 360, "#0c1014", 0);
      s += `<g opacity="${n(scene)}">${rect(0, 0, 640, 360, "#eef1ea", 0)}<polygon points="0,0 280,0 130,250 0,210" fill="rgba(255,255,255,.55)"/>${rect(40, 250, 560, 110, "#dfe6d8", 0)}${rect(232, 96, 176, 150, "#ffffff", 14, `stroke="#cdd4c8"`)}${rect(256, 122, 128, 12, "#cdd4c8", 6)}${rect(256, 148, 96, 8, "#dde2d8", 4)}${rect(256, 170, 110, 8, "#dde2d8", 4)}${rect(262, 198, 116, 34, lime, 17)}${text(320, 220, "产品", 13, ink, "middle", 700)}</g>`;
      const r = mix(6, 430, ease(seg(t, .1, .5)));
      s += circle(320, 180, r * .5, `rgba(180,230,255,${n(.5 * bloom)})`) + circle(320, 180, r, `rgba(255,255,255,${n(.85 * bloom)})`);
      s += rect(0, 0, 640, 360, `rgba(255,255,255,${n(bloom * .5)})`, 0);
      if (t < .14) s += circle(320, 180, 6, "#cfe8ff");
      return s + text(320, 330, t < .45 ? "发光点过曝 · 藏起切点" : "光退去 · 同方向打亮产品", 12, scene > .5 ? "#6b7268" : "#8b93a8", "middle", 600);
    }
    case "shared-morph-chain": {
      // 同一中心元素：进度条收缩成对勾，对勾再长成结果卡
      let s = rect(0, 0, 640, 360, "#eef1ea", 0);
      const barQ = 1 - seg(t, .4, .6), checkQ = ease(seg(t, .42, .62)), cardQ = ease(seg(t, .66, .92));
      const wb = 300 * barQ;
      s += rect(320 - wb / 2, 167, wb, 26, "#d7ded6", 13) + rect(320 - wb / 2, 167, wb * .96, 26, "#3b82f6", 13, `opacity="${n(barQ)}"`);
      const conf = ["#3b82f6", "#f59e0b", "#ef4444", "#22c55e"];
      for (let i = 0; i < 12; i++) { const q = ease(seg(t, .52, .8)), a = i / 12 * Math.PI * 2, d = q * (40 + rnd(i) * 70);
        s += rect(320 + Math.cos(a) * d - 3, 180 + Math.sin(a) * d - 3, 6, 6, conf[i % 4], 1, `opacity="${n((1 - q) * .9)}"`); }
      s += zoomWrap(320, 180, .2 + .8 * cardQ, `${rect(210, 105, 220, 150, "#ffffff", 14, `stroke="${lime}" stroke-width="2"`)}${text(320, 160, "结果卡片", 18, "#1b201c", "middle", 800)}${rect(250, 182, 140, 8, "#dde2d8", 4)}${rect(250, 206, 100, 8, "#dde2d8", 4)}${rect(250, 230, 120, 22, lime, 11)}`);
      const cr = Math.max(0, mix(0, 26, checkQ) * (1 - cardQ * .5)), cy = mix(180, 128, cardQ);
      s += circle(320, cy, cr, lime) + (cr > 8 ? `<path d="M${n(320 - cr * .45)} ${n(cy)} l${n(cr * .3)} ${n(cr * .36)} l${n(cr * .62)} ${n(-cr * .72)}" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : "");
      return s + text(320, 300, "同一元素：进度条 → 对勾 → 结果卡", 12, "#6b7268", "middle", 600);
    }
    case "device-frame-swap": {
      // 手机外框/阴影/反光完全不动，只在屏幕裁切区内交叉淡化换内容
      const cross = seg(t, .4, .62);
      const sceneA = `${rect(0, 0, 120, 150, "#8fc6f5", 0)}${circle(90, 36, 16, "#fff3b0")}${ellipse(56, 168, 130, 64, "#5f9e54")}${rect(0, 150, 120, 86, "#54904c", 0)}`;
      const sceneB = `${rect(0, 0, 120, 236, "#f4f6f2", 0)}${rect(12, 16, 96, 24, "#111512", 6)}${rect(12, 54, 96, 10, lime, 5)}${rect(12, 76, 72, 7, "#d7dcd4", 4)}${rect(12, 94, 86, 7, "#d7dcd4", 4)}${rect(12, 112, 62, 7, "#d7dcd4", 4)}${rect(12, 134, 96, 7, "#d7dcd4", 4)}${rect(12, 168, 96, 26, "#3b82f6", 9)}${rect(12, 206, 60, 8, "#d7dcd4", 4)}`;
      let s = rect(0, 0, 640, 360, mixColor("#e7ece5", "#dfe6dc", cross), 0);
      s += ellipse(320, 332, 150, 12, "rgba(0,0,0,.18)");
      // 先画不透明机身，再在屏幕裁切区内画内容，最后叠刘海/边框/反光，避免机身盖住屏幕
      s += rect(250, 36, 140, 292, "#151816", 28, `stroke="rgba(255,255,255,.16)" stroke-width="2"`);
      s += `<defs><clipPath id="df-${uid}"><rect x="260" y="64" width="120" height="236" rx="18"/></clipPath></defs>` +
           `<g clip-path="url(#df-${uid})"><g opacity="${n(1 - cross)}"><g transform="translate(260 64)">${sceneA}</g></g><g opacity="${n(cross)}"><g transform="translate(260 64)">${sceneB}</g></g></g>`;
      // 恒定的刘海、侧键、屏幕描边、玻璃反光
      s += rect(300, 46, 40, 14, "#050706", 7) + rect(388, 120, 4, 40, "#2a2f2c", 2) +
           rect(260, 64, 120, 236, "none", 18, `stroke="rgba(0,0,0,.25)" stroke-width="2"`) +
           `<polygon points="262,70 296,70 276,300 262,300" fill="rgba(255,255,255,.10)"/>`;
      return s + text(320, 356, "设备框不动 · 框内交叉淡化", 11, "#6b7268", "middle", 600);
    }
    case "persistent-cursor": {
      // 同一个紫色光标跨三个场景连续操作：输入框 → 点选卡片 → 拖滑块
      const aOp = 1 - seg(t, .34, .46), bOp = seg(t, .3, .42) * (1 - seg(t, .66, .78)), cOp = seg(t, .66, .8);
      let cx, cy;
      if (t < .34) { const q = ease(seg(t, .06, .3)); cx = mix(176, 468, q); cy = mix(250, 286, q); }
      else if (t < .5) { const q = ease(seg(t, .34, .5)); cx = mix(468, 330, q); cy = mix(286, 168, q); }
      else if (t < .68) { cx = 330; cy = 168; }
      else if (t < .82) { const q = ease(seg(t, .68, .82)); cx = mix(330, 210, q); cy = mix(168, 214, q); }
      else { const q = ease(seg(t, .82, .98)); cx = mix(210, 430, q); cy = 214; }
      let s = rect(0, 0, 640, 360, "#eef1ea", 0);
      s += `<g opacity="${n(aOp)}">${rect(140, 262, 360, 48, "#ffffff", 24, `stroke="#cdd4c8"`)}${text(164, 292, "输入消息…", 15, "#9aa29a")}</g>`;
      const click = Math.sin(seg(t, .46, .58) * Math.PI);
      s += `<g opacity="${n(bOp)}">${rect(224, 118, 192, 104, "#ffffff", 14, `stroke="${click > 0 ? "#7c3aed" : "#cdd4c8"}" stroke-width="2"`)}${rect(244, 140, 90, 10, "#7c3aed", 5)}${rect(244, 164, 150, 8, "#dde2d8", 4)}${rect(244, 184, 120, 8, "#dde2d8", 4)}${rect(244, 204, 80, 8, "#dde2d8", 4)}</g>`;
      s += `<g opacity="${n(cOp)}">${rect(150, 96, 340, 170, "#ffffff", 16, `stroke="#cdd4c8"`)}${text(172, 132, "调整面板", 16, "#1b201c", "start", 800)}${line(190, 214, 450, 214, "#d7dcd4", 6)}${rect(190, 176, 120, 8, "#dde2d8", 4)}${rect(190, 240, 180, 8, "#dde2d8", 4)}</g>`;
      const knobX = cOp ? cx : 210;
      s += cOp > .5 ? circle(knobX, 214, 12, "#7c3aed", `opacity="${n(cOp)}"`) : "";
      if (click > 0) s += circle(330, 168, 14 + click * 16, "none", `stroke="#7c3aed" stroke-width="2" opacity="${n(click)}"`);
      s += `<g transform="translate(${n(cx)} ${n(cy)})"><path d="M0 0 L0 24 L7 17 L11 29 L16 27 L12 16 L20 16 Z" fill="#7c3aed" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/></g>`;
      return s + text(320, 336, "同一光标跨镜连续操作 · 无人物也有操作者", 11, "#6b7268", "middle", 600);
    }
    case "clone-to-grid": {
      // 中央单卡向四周克隆、错落飞入，最终对齐成整墙网格，起始卡居中可辨
      const xs = [150, 320, 490], ys = [106, 182, 258];
      let s = rect(0, 0, 640, 360, "#eef1ea", 0);
      for (let i = 0; i < 9; i++) {
        const q = ease(seg(t, .1 + i * .045, .5 + i * .045));
        const tx = xs[i % 3], ty = ys[Math.floor(i / 3)];
        const x = mix(320, tx, q), y = mix(182, ty, q), sc = mix(.5, 1, q);
        const origin = i === 4;
        s += zoomWrap(x, y, sc, `${rect(x - 64, y - 28, 128, 56, origin ? "#eaf8d8" : "#ffffff", 10, `stroke="${origin && q > .9 ? lime : "#d4dad2"}" stroke-width="${origin ? 2 : 1}"`)}${rect(x - 50, y - 12, 56, 7, origin ? lime : "#cdd4c8", 4)}${rect(x - 50, y + 4, 80, 6, "#e2e7df", 3)}${rect(x - 50, y + 16, 60, 6, "#e2e7df", 3)}`);
      }
      return s + text(320, 330, t > .8 ? "单元素克隆增殖 · 成整面库墙" : "单张缩略图", 12, "#6b7268", "middle", 600);
    }
    case "liquid-section-divider": {
      // 紫青流体从边缘涌满再散开，承担章节切分
      const grow = t < .5 ? ease(seg(t, .1, .5)) : 1 - ease(seg(t, .5, .88));
      const darkQ = 1 - seg(t, .12, .34), lightQ = seg(t, .68, .94);
      let s = rect(0, 0, 640, 360, "#11140f", 0);
      s += `<g opacity="${n(darkQ)}">${[96, 132, 168, 204].map((y, i) => rect(96, y, i === 0 ? 220 : 300 - i * 40, 10, i === 0 ? "#9be014" : "#3a403c", 5)).join("")}</g>`;
      const blobs = [["#7c3aed", 80, 120, 1], ["#22d3ee", 560, 90, 1.2], ["#7c3aed", 120, 300, 1.3], ["#22d3ee", 540, 290, 1], ["#5b21b6", 320, -40, 1.5], ["#0e7490", 320, 400, 1.5]];
      for (const [col, bx0, by0, k] of blobs) {
        const bx = bx0 + Math.sin(t * 4 + bx0) * 18 * grow, by = by0 + Math.cos(t * 3 + by0) * 14 * grow;
        s += ellipse(bx, by, mix(0, 300, grow) * k, mix(0, 210, grow) * k, col, `opacity="${n(.92 * grow)}"`);
      }
      s += `<g opacity="${n(lightQ)}">${rect(0, 0, 640, 360, "#eef1ea", 0)}${[0, 1, 2].map((i) => rect(86 + i * 176, 120, 140, 120, "#ffffff", 14, `stroke="#d7dcd4"`)).join("")}${rect(86, 268, 468, 10, "#cdd4c8", 5)}</g>`;
      return s + text(320, 332, "流体涌满藏切 · 散开露出新章节", 11, lightQ > .5 ? "#6b7268" : "#aeb8c8", "middle", 600);
    }
    case "particles-to-logo": {
      // 满屏散点向内聚合，咬合出品牌字标
      const q = ease(seg(t, .1, .62));
      const targets = [];
      for (let i = 0; i < 7; i++) targets.push([252, 124 + i * 20]);
      for (let i = 0; i < 7; i++) targets.push([388, 124 + i * 20]);
      for (let i = 0; i <= 5; i++) targets.push([252 + i * 13.6, 124 + i * 13]);
      for (let i = 0; i <= 5; i++) targets.push([320 + i * 13.6, 189 - i * 13]);
      const palette = [lime, "#ffffff", "#7c3aed", "#22d3ee", "#f59e0b"];
      let s = rect(0, 0, 640, 360, "#0b0e14", 0);
      s += circle(320, 186, mix(0, 118, seg(t, .6, .92)), `rgba(155,224,20,${n(.12 * seg(t, .6, .9))})`);
      targets.forEach((tg, i) => {
        const sx = 40 + rnd(i + 1) * 560, sy = 50 + rnd(i + 50) * 270;
        const x = mix(sx, tg[0], q), y = mix(sy, tg[1], q), r2 = mix(2.6, 4.2, q);
        s += circle(x, y, r2, palette[i % palette.length], q < 1 ? "" : `stroke="rgba(255,255,255,.4)"`);
      });
      s += text(320, 268, "MARK", 22, white, "middle", 800, `opacity="${n(seg(t, .72, .92))}" letter-spacing="6"`);
      return s + text(320, 330, q < 1 ? "散点向心聚拢" : "聚合成品牌字标", 11, "#8b93a8", "middle", 600);
    }
    case "word-slot-scramble": {
      // 字槽版式静止，字符原地乱码抖动后逐位解码成新词
      const GLYPH = "ABCDEFGHJKLMNPQRSTUVWXYZ#@%&*";
      const oldW = "Build", newW = "Create";
      let s = rect(0, 0, 640, 360, "#eceee8", 0) + rect(120, 132, 400, 100, "#ffffff", 14, `stroke="#d7dcd4"`);
      for (let i = 0; i < 6; i++) {
        const lock = seg(t, .58 + i * .05, .68 + i * .05);
        let ch, col;
        if (lock >= 1) { ch = newW[i]; col = lime; }
        else if (t < .38) { ch = oldW[i] || ""; col = "#1b201c"; }
        else { ch = GLYPH[(Math.floor(t * 40) + i * 5) % GLYPH.length]; col = "#6b7268"; }
        const jitter = lock < 1 && t >= .38 ? (rnd(i + Math.floor(t * 30)) - .5) * 6 : 0;
        s += text(208 + i * 44, 200 + jitter, ch, 42, col, "middle", 800);
      }
      return s + line(180, 226, 460, 226, "#cdd4c8", 2) + text(320, 286, "字槽静止 · 原地乱码解码换词", 12, "#6b7268", "middle", 600);
    }
    case "hero-orbit-rings": {
      // 镜头绕中心产品缓慢环绕，装饰环逐圈点亮后回正
      const a = -Math.PI * .8 + t * Math.PI * 1.25;
      const tilt = Math.sin(seg(t, .05, .95) * Math.PI);
      const ringProg = ease(seg(t, .12, .8));
      let s = rect(0, 0, 640, 360, "#0c0f0d", 0);
      const rings = [[90, 36, .25], [132, 54, .5], [176, 72, .75]];
      for (const [rx, ry, ph] of rings) {
        s += ellipse(320, 180, rx, ry, "none", `stroke="rgba(155,224,20,.14)" stroke-width="2"`);
        s += `<ellipse cx="320" cy="180" rx="${rx}" ry="${ry}" fill="none" stroke="${lime}" stroke-width="2.5" pathLength="1" stroke-dasharray="${n(Math.max(0, ringProg - ph) / (1 - ph))} 1" transform="rotate(${n(-28 + t * 56)} 320 180)"/>`;
        const sx = 320 + rx * Math.cos(a + ph * 3), sy = 180 + ry * Math.sin(a + ph * 3);
        s += circle(sx, sy, 4.5, ph === .75 ? lime : "#cfe8a0");
      }
      const cardSx = 1 - .05 * tilt;
      s += `<g transform="translate(320 180) scale(${n(cardSx)} 1) translate(-320 -180)">${rect(268, 132, 104, 96, "#22301f", 16, `stroke="${lime}" stroke-width="2"`)}${text(320, 178, "HERO", 26, lime, "middle", 800)}${rect(292, 194, 56, 8, "#5d7048", 4)}</g>`;
      s += text(320, 300, "环绕拱出主角 · 回正落幅", 12, "#8b93a8", "middle", 600, `opacity="${n(seg(t, .5, .9))}"`);
      return s;
    }
    case "ui-drill-in-out": {
      // 总览角标被推近钻透，展开成该功能完整面板
      const aOut = 1 - seg(t, .4, .55), sA = 1 + 1.7 * seg(t, .34, .55);
      const bIn = seg(t, .55, .8), sB = mix(2, 1, ease(seg(t, .55, .9)));
      let s = rect(0, 0, 640, 360, "#eef1ea", 0);
      const overview = `${rect(60, 80, 220, 90, "#ffffff", 12, `stroke="#d7dcd4"`)}${rect(60, 190, 220, 90, "#ffffff", 12, `stroke="#d7dcd4"`)}${rect(300, 80, 220, 90, "#ffffff", 12, `stroke="#d7dcd4"`)}${rect(300, 190, 220, 90, "#ffffff", 12, `stroke="#d7dcd4"`)}${rect(452, 56, 84, 30, "#eaf8d8", 10, `stroke="${lime}" stroke-width="2"`)}${text(494, 76, "角标", 13, "#3c5a12", "middle", 700)}`;
      s += zoomWrap(500, 96, sA, `<g opacity="${n(aOut)}">${overview}</g>`);
      const ringQ = seg(t, .4, .66);
      if (ringQ > 0 && ringQ < 1) for (let k = 0; k < 3; k++) { const rr = mix(20, 360, ease(seg(t, .4 + k * .07, .62 + k * .07))); s += circle(320, 180, rr, "none", `stroke="rgba(155,224,20,${n(.5 * (1 - ringQ) + .2)})" stroke-width="3"`); }
      const panel = `${rect(70, 60, 500, 240, "#ffffff", 16, `stroke="#cdd4c8"`)}${rect(70, 60, 500, 44, "#111512", 16)}${rect(96, 78, 120, 12, lime, 6)}${rect(96, 130, 130, 10, "#cdd4c8", 5)}${rect(96, 156, 200, 8, "#e2e7df", 4)}${rect(96, 176, 170, 8, "#e2e7df", 4)}${rect(96, 196, 190, 8, "#e2e7df", 4)}${rect(330, 130, 210, 120, "#f1f4ee", 12)}${line(350, 220, 520, 150, lime, 4)}`;
      s += zoomWrap(320, 180, sB, `<g opacity="${n(bIn)}">${panel}</g>`);
      return s + text(320, 330, "角标成为门洞 · 钻进详情", 11, "#6b7268", "middle", 600);
    }
    case "split-split-merge": {
      // 一张卡沿中线裂成左右（任务/结果），再合回一张结论卡
      const d = t < .5 ? mix(0, 150, ease(seg(t, .12, .5))) : mix(150, 0, ease(seg(t, .5, .88)));
      const split = t >= .12 && t < .86, merged = t >= .86;
      const label = merged ? text(320, 192, "结论", 28, lime, "middle", 800)
        : split ? text(235, 192, "任务", 26, "#1b201c", "middle", 800) + text(405, 192, "结果", 26, lime, "middle", 800)
        : text(320, 192, "完整卡片", 28, "#1b201c", "middle", 800);
      const content = `${rect(150, 96, 340, 168, "#ffffff", 14, `stroke="${merged ? lime : "#d7dcd4"}" stroke-width="${merged ? 3 : 1}"`)}${label}${rect(200, 222, 240, 8, "#e2e7df", 4)}`;
      let s = rect(0, 0, 640, 360, "#eef1ea", 0);
      s += `<defs><clipPath id="sl-${uid}"><rect x="150" y="96" width="170" height="168"/></clipPath><clipPath id="sr-${uid}"><rect x="320" y="96" width="170" height="168"/></clipPath></defs>`;
      s += `<g transform="translate(${n(-d)} 0)"><g clip-path="url(#sl-${uid})">${content}</g></g>`;
      s += `<g transform="translate(${n(d)} 0)"><g clip-path="url(#sr-${uid})">${content}</g></g>`;
      s += line(320, 96, 320, 264, lime, 3, `opacity="${n(split ? .9 : 0)}"`);
      return s + text(320, 312, split ? "裂成左右 · 对照可见" : "中缝收回 · 合回一张", 12, "#6b7268", "middle", 600);
    }
    case "pull-back-overview": {
      // 从单卡特写后拉，四周卡片按层差速展开成工作流全景
      const z = mix(2.7, 1, ease(seg(t, .1, .82))), side = ease(seg(t, .42, .82));
      let s = rect(0, 0, 640, 360, "#eef1ea", 0);
      const sideCard = (tx, ty, label) => { const x = mix(320, tx, side), y = mix(180, ty, side), sc = mix(1.5, 1, side);
        return zoomWrap(x, y, sc, `${rect(x - 80, y - 48, 160, 96, "#ffffff", 12, `stroke="#d7dcd4"`)}${text(x, y + 6, label, 16, "#1b201c", "middle", 800)}${rect(x - 56, y - 16, 112, 7, "#e2e7df", 4)}`); };
      s += sideCard(110, 180, "输入") + sideCard(530, 180, "结果");
      s += line(196, 180, 244, 180, "#9aa29a", 3, `opacity="${n(seg(t, .6, .85))}"`) + line(396, 180, 444, 180, "#9aa29a", 3, `opacity="${n(seg(t, .6, .85))}"`);
      s += zoomWrap(320, 180, z, `${rect(224, 120, 192, 120, "#eaf8d8", 12, `stroke="${lime}" stroke-width="2"`)}${rect(250, 152, 70, 9, lime, 5)}${rect(250, 172, 120, 8, "#cdd8c2", 4)}${rect(250, 192, 96, 8, "#cdd8c2", 4)}${text(320, 224, "当前卡片", 13, "#3c5a12", "middle", 700)}`);
      return s + text(320, 300, side > .9 ? "后拉揭示 · 工作流全景" : "局部特写", 12, "#6b7268", "middle", 600);
    }
    default:
      return `${card(170,78,300,204,"镜头参考")}${text(320,170,"PREVIEW",30,lime,"middle",700)}`;
  }
}

function ellipse(cx, cy, rx, ry, fill, extra = "") {
  return `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}" ${extra}/>`;
}

/** 底部节拍条：动作节点 + 当前进度，让观众看到「什么节点在动、何时停」。 */
function beatBar(beats, t) {
  if (!Array.isArray(beats) || !beats.length) return "";
  const x0 = 20, w = 600;
  const nodes = beats.map((beat, i) => {
    const bx = x0 + beat.at * w;
    const active = t >= beat.at;
    return `<circle cx="${n(bx)}" cy="346" r="${active ? 4 : 3}" fill="${active ? lime : "#3a403c"}" stroke="${active ? lime : "none"}" stroke-width="1"/>`;
  }).join("");
  const px = x0 + t * w;
  return `${line(x0, 346, x0 + w, 346, "#232823", 2)}${nodes}${line(x0, 346, Math.min(x0 + w, px), 346, lime, 2)}${circle(px, 346, 5, lime)}`;
}

export function renderShotRecipeSvg(recipe, demo, progress) {
  const t = clamp(progress);
  const uid = String(recipe.id || "shot").replace(/[^a-z0-9-]/gi, "-");
  return `<svg viewBox="0 0 640 360" role="img" aria-label="${esc(recipe.nameZh)}效果演示" preserveAspectRatio="xMidYMid meet">${chrome(recipe.nameZh)}${visual(demo.previewKind, t, uid)}${beatBar(demo.beats, t)}</svg>`;
}

export function mountShotRecipePreview(host, recipe, demo, options = {}) {
  const fps = options.fps || 24;
  const durationMs = options.durationMs || demo?.durationMs || KIND_DURATION[demo?.previewKind] || 2400;
  const totalFrames = Math.round((durationMs / 1000) * fps);
  let frame = 0;
  let raf = 0;
  let startedAt = 0;
  const renderFrame = (nextFrame) => {
    frame = Math.max(0, Math.min(totalFrames, Math.round(nextFrame)));
    host.innerHTML = renderShotRecipeSvg(recipe, demo, frame / totalFrames);
    return { frame, totalFrames, progress: frame / totalFrames };
  };
  const api = {
    get frame() { return frame; },
    get totalFrames() { return totalFrames; },
    renderFrame,
    seekFrame: renderFrame,
    play() {
      cancelAnimationFrame(raf);
      if (frame >= totalFrames) frame = 0;
      startedAt = performance.now() - (frame / fps) * 1000;
      const tick = (now) => {
        const next = Math.min(totalFrames, Math.floor(((now - startedAt) / 1000) * fps));
        renderFrame(next);
        api.onFrame?.(frame);
        if (next < totalFrames) raf = requestAnimationFrame(tick);
        else api.onStateChange?.("end");
      };
      raf = requestAnimationFrame(tick);
      api.onStateChange?.("play");
    },
    pause() { cancelAnimationFrame(raf); raf = 0; api.onStateChange?.("pause"); },
    destroy() { cancelAnimationFrame(raf); host.textContent = ""; },
  };
  renderFrame(options.representativeFrame ?? Math.round(totalFrames * .72));
  return api;
}
