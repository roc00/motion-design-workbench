import { h, seg, easeOut, easeInOut, stagger, seeded, pic, LOGICAL_W as W, LOGICAL_H as H } from "../kit.js";

const backdrop = (stage, seed) => {
  const b = pic(seed, 900, 500, "");
  b.style.cssText += "position:absolute;inset:0";
  const veil = h("div");
  veil.style.cssText = "position:absolute;inset:0;background:linear-gradient(rgba(12,14,19,.32),rgba(12,14,19,.84))";
  stage.canvas.prepend(b);
  stage.canvas.insertBefore(veil, b.nextSibling);
  return { b, veil };
};

const center = (el, top = "50%") => {
  el.style.position = "absolute";
  el.style.left = "50%";
  el.style.top = top;
  el.style.transform = el.style.transform
    ? `${el.style.transform} translate(-50%,-50%)`
    : "translate(-50%,-50%)";
  return el;
};

/** 详情页控制条：加一个「模糊 → 清晰」开关；改参后通过控制器重绘当前帧 */
function blurToggle(stage) {
  if (!stage.ctrl) return { get on() { return false; }, bind() {} };
  const input = h("input");
  input.type = "checkbox";
  input.checked = true;
  const lab = h("label", "d-ctl");
  lab.append(input, h("span", "trk"), h("span", null, "模糊 → 清晰"));
  stage.ctrl.append(lab);
  return {
    get on() {
      return input.checked;
    },
    bind(ctrl) {
      input.addEventListener("change", () => ctrl.refresh());
    },
  };
}

/** 文字动效：优先保证阅读，字数越多越要减少逐字动画。 */
export const variants = {
  "line-reveal"({ stage, preset }) {
    const c = preset.content || {};
    backdrop(stage, c.seed || "facade");
    const lines = c.lines || [];
    const box = h("div");
    box.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;gap:6px;align-items:flex-start";
    const inners = lines.map((txt) => {
      const clip = h("div");
      clip.style.overflow = "hidden";
      const inner = h("div", "d-h1", txt);
      inner.style.fontSize = "34px";
      clip.append(inner);
      box.append(clip);
      return inner;
    });
    stage.canvas.append(box);
    const DUR = preset.timeline?.actionMs || 520;
    const st = preset.timeline?.staggerMs || 120;
    return {
      durationMs: DUR + st * Math.max(0, lines.length - 1),
      render(t, { reduced }) {
        inners.forEach((el, i) => {
          const p = stagger(t, i, inners.length, 0.62);
          el.style.opacity = String(reduced ? (p > 0 ? 1 : 0) : p);
          el.style.transform = reduced ? "none" : `translateY(${((1 - p) * 112).toFixed(1)}%)`;
        });
      },
    };
  },

  "word-reveal"({ stage, preset }) {
    const c = preset.content || {};
    backdrop(stage, c.seed || "workbench");
    const groups = c.groups || [];
    const row = h("div", "d-h1");
    row.style.cssText =
      "position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);display:flex;gap:12px;flex-wrap:wrap;justify-content:center;max-width:540px;font-size:26px";
    const spans = groups.map((g) => {
      const s = h("span", null, g);
      s.style.display = "inline-block";
      row.append(s);
      return s;
    });
    const cap = h("div", "d-caption");
    cap.style.cssText = "position:absolute;left:50%;top:60%;transform:translateX(-50%)";
    cap.textContent = `分组：${groups.map((g) => `「${g}」`).join("")}`;
    stage.canvas.append(row, cap);
    const blur = blurToggle(stage);
    const DUR = preset.timeline?.actionMs || 360;
    const st = preset.timeline?.staggerMs || 110;
    return {
      durationMs: DUR + st * Math.max(0, spans.length - 1) + 400,
      bindController(ctrl) {
        blur.bind(ctrl);
      },
      render(t, { reduced }) {
        spans.forEach((el, i) => {
          const p = stagger(t, i, spans.length, 0.6);
          el.style.opacity = String(reduced ? (p > 0 ? 1 : 0) : p);
          el.style.transform = reduced ? "none" : `translateY(${((1 - p) * 9).toFixed(1)}px)`;
          el.style.filter = !reduced && blur.on ? `blur(${((1 - p) * 7).toFixed(1)}px)` : "none";
        });
      },
    };
  },

  "character-reveal"({ stage, preset }) {
    const c = preset.content || {};
    backdrop(stage, c.seed || "workbench");
    const word = c.word || "MOTION";
    const row = h("div", "d-h1");
    row.style.cssText =
      "position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);display:flex;gap:5px;font-family:var(--mono);font-size:48px;letter-spacing:3px";
    const chars = [...word].map((ch) => {
      const s = h("span", null, ch === " " ? "\u00a0" : ch);
      s.style.display = "inline-block";
      row.append(s);
      return s;
    });
    const cap = h("div", "d-caption", "字数越多等待越久 —— 中文长句不要用");
    cap.style.cssText = "position:absolute;left:50%;top:62%;transform:translateX(-50%)";
    stage.canvas.append(row, cap);
    const blur = blurToggle(stage);
    const DUR = preset.timeline?.actionMs || 300;
    const st = preset.timeline?.staggerMs || 60;
    return {
      durationMs: DUR + st * Math.max(0, chars.length - 1) + 400,
      bindController(ctrl) {
        blur.bind(ctrl);
      },
      render(t, { reduced }) {
        chars.forEach((el, i) => {
          const p = stagger(t, i, chars.length, 0.55);
          el.style.opacity = String(reduced ? (p > 0 ? 1 : 0) : p);
          el.style.transform = reduced ? "none" : `translateY(${((1 - p) * 14).toFixed(1)}px)`;
          el.style.filter = !reduced && blur.on ? `blur(${((1 - p) * 7).toFixed(1)}px)` : "none";
        });
      },
    };
  },

  typewriter({ stage, preset }) {
    const command = preset.content?.command || "";
    const box = h("div");
    box.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:470px;background:#0d1117;border:1px solid #2b3340;border-radius:10px;overflow:hidden";
    const bar = h("div");
    bar.style.cssText = "display:flex;gap:5px;padding:8px 11px;border-bottom:1px solid #222a34;background:#11161d";
    ["#f87171", "#fbbf24", "#34d399"].forEach((col) => {
      const d = h("div");
      d.style.cssText = `width:8px;height:8px;border-radius:50%;background:${col};opacity:.85`;
      bar.append(d);
    });
    const body = h("div");
    body.style.cssText = "padding:14px;font-family:var(--mono);font-size:14px;color:#cbd3de;display:flex;align-items:center;min-height:48px";
    const pre = h("span", null, "$ ");
    pre.style.color = "#34d399";
    const txt = h("span");
    const caret = h("span", null, "▌");
    caret.style.cssText = "margin-left:2px;color:var(--accent)";
    body.append(pre, txt, caret);
    box.append(bar, body);
    stage.canvas.append(box);

    const DUR = preset.timeline?.actionMs || 1000;
    const typeEnd = 0.75;
    return {
      durationMs: DUR,
      render(t) {
        const p = t / typeEnd;
        const n = Math.round(Math.min(1, p) * command.length);
        txt.textContent = command.slice(0, n);
        const typing = t < typeEnd;
        // 光标闪烁按帧计算，不依赖定时器
        caret.style.opacity = typing ? "1" : Math.round(t * DUR / 500) % 2 === 0 ? "1" : "0";
      },
    };
  },

  scramble({ stage, preset }) {
    const c = preset.content || {};
    backdrop(stage, c.seed || "neon-lights");
    const target = c.text || "SEEDANCE 2.5";
    const t1 = h("div", "d-h1");
    t1.style.cssText =
      "position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);font-family:var(--mono);font-size:36px;letter-spacing:4px";
    const cap = h("div", "d-caption", "整段保持乱码 → 落盘时从前到后依次清晰");
    cap.style.cssText = "position:absolute;left:50%;top:62%;transform:translateX(-50%)";
    stage.canvas.append(t1, cap);

    const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@";
    const DUR = preset.timeline?.actionMs || 1050;
    return {
      durationMs: DUR,
      render(t) {
        // 前 55% 整段保持乱码（不停露出原文）；随后从前到后逐字落盘
        const scrambleEnd = 0.55;
        const settleEnd = 0.96;
        const done =
          t <= scrambleEnd
            ? 0
            : Math.floor(target.length * easeInOut(seg(t, scrambleEnd, settleEnd)));
        let out = "";
        for (let i = 0; i < target.length; i += 1) {
          if (i < done) {
            out += target[i];
            continue;
          }
          const ch = target[i];
          if (ch === " " || ch === ".") {
            out += ch;
            continue;
          }
          // 固定种子：同一 t 永远得到同一串乱码，与历史无关；
          // 频率系数 18 ≈ 原刷新频率的 75%（24fps 下每秒约 18 次刷新），比每 2 帧一次略快
          const rnd = seeded(`${i}:${Math.floor(t * 18)}`);
          out += POOL[Math.floor(rnd() * POOL.length)];
        }
        t1.textContent = t >= settleEnd ? target : out;
      },
    };
  },

  morph({ stage, preset }) {
    const c = preset.content || {};
    backdrop(stage, c.seed || "workbench");
    const lead = c.lead || "";
    const words = c.words || [];
    const row = h("div", "d-h1");
    // 左对齐锚定：词槽宽度变化时前缀不移动，切换文字不再跳动
    row.style.cssText =
      "position:absolute;left:60px;top:46%;transform:translateY(-50%);display:flex;gap:10px;font-size:26px;align-items:baseline;justify-content:flex-start";
    const leadEl = h("span", null, lead);
    const slot = h("span");
    slot.style.cssText = "display:inline-block;overflow:hidden;white-space:nowrap;vertical-align:bottom;color:var(--accent)";
    const wordEl = h("span", null, words[0] || "");
    slot.append(wordEl);
    row.append(leadEl, slot);
    stage.canvas.append(row);

    const CHAR_W = 26; // 1em at font-size 26
    const DUR = preset.timeline?.actionMs || 620;
    return {
      durationMs: DUR,
      render(t) {
        // 由 t 计算当前词与切换进度，完全不依赖回调
        const n = Math.max(1, words.length);
        const pos = t * (n - 1);
        const idx = Math.min(n - 1, Math.floor(pos));
        const local = n > 1 ? pos - idx : 0;
        const cur = words[idx] || "";
        const nxt = words[Math.min(n - 1, idx + 1)] || cur;
        const swap = Math.max(0, (local - 0.68) / 0.32); // 前 68% 停顿展示，后 32% 变形切换
        wordEl.textContent = swap > 0.5 ? nxt : cur;
        const from = cur.length * CHAR_W;
        const to = nxt.length * CHAR_W;
        slot.style.width = `${(from + (to - from) * swap).toFixed(1)}px`;
        wordEl.style.opacity = String(1 - Math.sin(swap * Math.PI) * 0.85);
        wordEl.style.filter = `blur(${Math.sin(swap * Math.PI) * 4}px)`;
        void easeInOut;
      },
    };
  },
};

void W;
void H;
