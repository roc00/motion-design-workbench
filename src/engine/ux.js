import { h, seg, clamp01, easeOut, stagger, LOGICAL_W as W } from "../kit.js";

export const variants = {
  feedback({ stage, preset }) {
    const c = preset.content || {};
    const steps = c.steps || [];
    const notes = c.notes || [];
    const track = h("div");
    track.style.cssText = "position:absolute;left:50%;top:120px;transform:translateX(-50%);display:flex";
    const cells = steps.map((label, i) => {
      const cell = h("div", "d-uxstep");
      const link = i < steps.length - 1 ? h("div", "d-uxlink") : null;
      const dot = h("div", "d-uxdot");
      cell.append(dot, h("div", "d-caption", label));
      if (link) cell.append(link);
      track.append(cell);
      return { cell, dot };
    });
    const line = h("div", "d-sub");
    line.style.cssText = "position:absolute;left:50%;top:226px;transform:translateX(-50%);text-align:center;width:520px";
    stage.canvas.append(track, line);

    const n = Math.max(1, cells.length);
    return {
      durationMs: preset.timeline?.actionMs || 3400,
      render(t) {
        const active = Math.min(n - 1, Math.floor(t * n * 0.999));
        cells.forEach((s, i) => {
          const passed = i <= active;
          s.cell.style.opacity = String(passed ? 1 : 0.3);
          s.dot.style.background = passed ? (i === 0 ? "#8acd00" : "#34d399") : "#333d49";
          s.dot.style.transform = `scale(${i === active ? 1.5 : 1})`;
        });
        const done = t > 0.92;
        line.textContent = done ? "四段齐全，这个操作才可信" : notes[active] || "";
        if (done) {
          cells.forEach((s) => {
            s.dot.style.background = "#8acd00";
            s.dot.style.transform = "scale(1.5)";
          });
        }
      },
    };
  },

  affordance({ stage, preset }) {
    const rows = preset.content?.rows || [];
    const box = h("div");
    box.style.cssText = "position:absolute;left:60px;top:78px;width:520px;display:flex;flex-direction:column;gap:16px";
    const built = rows.map((label, i) => {
      const r = h("div");
      r.style.cssText = "display:flex;align-items:center;gap:18px";
      const l = h("div", "d-caption", label);
      l.style.width = "120px";
      const host = h("div");
      const mk = [
        () => {
          const b = h("div", "d-btn", "按钮");
          b.style.cssText += ";padding:6px 16px;font-size:12px";
          return b;
        },
        () => {
          const a = h("div", null, "查看详情");
          a.style.cssText = "color:#8fbcff;font-size:12px;text-decoration:underline;text-underline-offset:3px";
          return a;
        },
        () => {
          const g = h("div", null, "⠿");
          g.style.cssText = "color:#8d97a5;font-size:18px;cursor:grab";
          return g;
        },
        () => {
          const a = h("div", null, "更多选项 ▾");
          a.style.cssText = "font-size:12px;color:#cbd3de";
          return a;
        },
      ][i % 4];
      host.append(mk());
      r.append(l, host);
      box.append(r);
      return r;
    });
    const cap = h("div", "d-sub", "动效只能强化已有信号，不能把关键操作藏到悬停之后");
    cap.style.cssText = "position:absolute;left:60px;bottom:26px;width:520px";
    stage.canvas.append(box, cap);

    const DUR = preset.timeline?.actionMs || 300;
    const st = preset.timeline?.staggerMs || 240;
    return {
      durationMs: DUR + st * Math.max(0, built.length - 1) + 600,
      render(t) {
        built.forEach((r, i) => {
          const p = stagger(t, i, built.length, 0.5);
          r.style.opacity = String(0.22 + 0.78 * easeOut(p));
        });
      },
    };
  },

  focus({ stage, preset }) {
    const c = preset.content || {};
    const scrim = h("div", "d-scrim");
    const dialog = h("div", "d-modal");
    dialog.style.cssText += ";position:absolute;left:50%;top:50%;width:360px;transform:translate(-50%,-50%)";
    dialog.append(h("div", "d-h2", c.title || "确认提交订单？"));
    const acts = h("div", "d-row");
    acts.style.cssText = "justify-content:flex-end;margin-top:14px;gap:9px";
    const sec = h("div", "d-btn ghost", c.secondary || "取消");
    const pri = h("div", "d-btn", c.primary || "确认");
    acts.append(sec, pri);
    dialog.append(acts);
    const trigger = h("div", "d-btn ghost", "打开弹窗");
    trigger.style.cssText += ";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)";
    stage.canvas.append(trigger, scrim, dialog);

    const ring = (el, on) => {
      el.style.outline = on ? "2px solid #8acd00" : "none";
      el.style.outlineOffset = "3px";
    };
    const DUR = 2600;
    return {
      durationMs: DUR,
      render(t) {
        const p = clamp01(Math.min(seg(t, 0.06, 0.22), 1 - seg(t, 0.82, 0.98)));
        const inside = p > 0.02;
        scrim.style.pointerEvents = inside ? "" : "none";
        scrim.style.visibility = inside ? "visible" : "hidden";
        dialog.style.pointerEvents = inside ? "" : "none";
        dialog.style.visibility = inside ? "visible" : "hidden";
        dialog.setAttribute("aria-hidden", inside ? "false" : "true");
        scrim.style.opacity = String(0.5 * p);
        dialog.style.opacity = String(p);
        const f1 = t >= 0.28 && t < 0.52;
        const f2 = t >= 0.52 && t < 0.82;
        ring(sec, f1);
        ring(pri, f2);
        ring(trigger, !inside);
        trigger.style.opacity = inside ? "0.25" : "1";
      },
    };
  },

  "reduced-motion"({ stage, preset }) {
    const c = preset.content || {};
    const wrap = h("div");
    wrap.style.cssText = "position:absolute;left:50%;top:60px;transform:translateX(-50%);display:flex;gap:30px";
    const mk = (title) => {
      const box = h("div", "d-rm-box");
      const cap = h("div", "d-caption", title);
      cap.style.cssText = "position:absolute;top:8px;left:10px;z-index:3";
      const layer = h("div", "d-rm-layer");
      const other = h("div", "d-rm-other");
      box.append(cap, layer, other);
      wrap.append(box);
      return { layer, other, cap };
    };
    const bad = mk(c.before || "开启前 · 大幅视差");
    const good = mk(c.after || "开启后 · 短促淡化");
    const note = h("div", "d-caption");
    note.style.cssText = "position:absolute;left:50%;bottom:22px;transform:translateX(-50%);text-align:center;width:540px";
    stage.canvas.append(wrap, note);

    return {
      durationMs: preset.timeline?.actionMs || 2400,
      render(t) {
        // 左侧：大幅位移 + 持续循环；右侧：短促淡化后静止
        const loop = (t * 2) % 1;
        bad.layer.style.transform = `translateY(${(easeOut(loop) * 44).toFixed(1)}px)`;
        bad.other.style.opacity = String(seg(t, 0.35, 0.55));
        good.other.style.opacity = String(easeOut(seg(t, 0.35, 0.45)));
        bad.cap.style.color = "#fbbf24";
        good.cap.style.color = "#34d399";
        note.textContent = "减少动态不是「减速」，而是换成静态终态或短促淡化，并取消大幅位移、旋转与自动循环";
      },
    };
  },

  modality({ stage, preset }) {
    const pairs = preset.content?.pairs || [];
    const box = h("div");
    box.style.cssText = "position:absolute;left:48px;top:66px;width:544px;display:flex;flex-direction:column;gap:9px";
    const built = pairs.map(([a, b, note]) => {
      const r = h("div");
      r.style.cssText = "display:flex;align-items:center;gap:9px;font-size:11.5px";
      const left = h("div", "d-mod-l", a);
      const arrow = h("div", null, "↔");
      arrow.style.color = "#8acd00";
      const right = h("div", "d-mod-r", b);
      const nt = h("div", "d-mod-n", note);
      r.append(left, arrow, right, nt);
      box.append(r);
      return r;
    });
    const cap = h("div", "d-caption", "关键功能不能只靠鼠标悬停：鼠标、触屏、键盘三种输入都要有入口");
    cap.style.cssText = "position:absolute;left:48px;bottom:22px";
    stage.canvas.append(box, cap);

    const DUR = preset.timeline?.actionMs || 300;
    const st = preset.timeline?.staggerMs || 160;
    void W;
    return {
      durationMs: DUR + st * Math.max(0, built.length - 1) + 600,
      render(t) {
        built.forEach((r, i) => {
          const p = stagger(t, i, built.length, 0.5);
          r.style.opacity = String(p);
          r.style.transform = `translateX(${((1 - p) * -9).toFixed(1)}px)`;
        });
      },
    };
  },
};
