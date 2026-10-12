import { h, pic, seg, clamp01, lerp, easeInOut, easeOut, LOGICAL_W as W, LOGICAL_H as H } from "../kit.js";
import { timelinePhases } from "../runtime-config.js";

const CARD_W = 190;
const CARD_H = 108;
const GAP = 12;

export const variants = {
  "layout-animation"({ stage, preset }) {
    const c = preset.content || {};
    const seeds = c.seeds || [];
    const labels = c.cards || [];
    const hide = new Set(c.hide || []);
    const total = seeds.length;

    const grid = h("div");
    grid.style.cssText = "position:absolute;left:20px;top:40px;width:604px;height:280px";
    const cards = seeds.map((seed, i) => {
      const card = h("div", "d-card2");
      card.style.cssText = `position:absolute;width:${CARD_W}px;height:${CARD_H}px;will-change:transform`;
      const p = h("div", "pic");
      const im = new Image();
      im.src = `https://picsum.photos/seed/${seed}/380/200`;
      im.alt = labels[i] || "";
      p.append(im);
      const meta = h("div", "meta");
      meta.append(h("div", "t", labels[i] || `卡 ${i + 1}`));
      card.append(p, meta);
      grid.append(card);
      return card;
    });
    stage.canvas.append(grid);
    const cap = h("div", "d-caption", "隐藏项淡出，剩余卡片从旧位置平滑移动到新位置");
    cap.style.cssText = "position:absolute;left:20px;bottom:14px";
    stage.canvas.append(cap);

    const posOf = (index) => ({ x: (index % 3) * (CARD_W + GAP), y: Math.floor(index / 3) * (CARD_H + GAP) });
    const keep = [...Array(total).keys()].filter((i) => !hide.has(i));

    return {
      durationMs: preset.timeline?.actionMs || 1400,
      render(t, { reduced }) {
        const p = reduced ? (t > 0.5 ? 1 : 0) : easeInOut(seg(t, 0.22, 0.78));
        cards.forEach((card, i) => {
          const isHidden = hide.has(i);
          if (isHidden) {
            // 隐藏项留在原地淡出并略缩小：不飞向负数坐标，避免扫过保留卡片造成闪烁
            const from = posOf(i);
            card.style.transform = `translate(${from.x}px, ${from.y}px) scale(${(1 - p * 0.12).toFixed(3)})`;
            card.style.opacity = String(1 - p);
            card.style.zIndex = "0";
            card.style.pointerEvents = p > 0.5 ? "none" : "";
            card.style.visibility = p >= 1 ? "hidden" : "visible";
            return;
          }
          const from = posOf(i);
          const to = posOf(keep.indexOf(i));
          const x = lerp(from.x, to.x, p);
          const y = lerp(from.y, to.y, p);
          card.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
          card.style.opacity = "1";
          card.style.zIndex = "1";
          card.style.visibility = "visible";
        });
      },
    };
  },

  "shared-element"({ stage, preset }) {
    const c = preset.content || {};
    const list = h("div");
    list.style.cssText = "position:absolute;left:60px;top:50%;transform:translateY(-50%);display:flex;gap:12px;align-items:center";
    const thumb = h("div", "d-card2");
    thumb.style.cssText = "width:96px";
    const tp = h("div", "pic");
    const tim = new Image();
    tim.src = `https://picsum.photos/seed/${c.seed || "summit"}/200/130`;
    tim.alt = "";
    tp.append(tim);
    const tmeta = h("div", "meta");
    tmeta.append(h("div", "t", "山峰"));
    thumb.append(tp, tmeta);
    const meta = h("div", "d-col");
    meta.append(h("div", "d-h2", c.listTitle || "从列表进入详情"), h("div", "d-sub", c.sub || ""));
    list.append(thumb, meta);
    stage.canvas.append(list);

    const detail = h("div", "d-detailpage");
    const hero = h("div", "d-detail-hero");
    const him = new Image();
    him.src = `https://picsum.photos/seed/${c.seed || "summit"}/700/380`;
    him.alt = "";
    hero.append(him);
    detail.append(h("div", "d-h2", c.detailTitle || "详情页"), hero);
    stage.canvas.append(detail);

    const ghost = h("div", "d-ghost");
    const gim = new Image();
    gim.src = `https://picsum.photos/seed/${c.seed || "summit"}/700/380`;
    gim.alt = "";
    ghost.append(gim);
    stage.canvas.append(ghost);

    // 几何在首帧实测（布局与图片比例是确定性的，测量结果同样确定）；
    // 画布有整体缩放，除以缩放系数换算回逻辑坐标。
    let geo = null;
    const measure = () => {
      const cb = stage.canvas.getBoundingClientRect();
      const sc = cb.width / W || 1;
      const tpic = tp.getBoundingClientRect();
      const hrect = hero.getBoundingClientRect();
      geo = {
        from: { x: (tpic.left - cb.left) / sc, y: (tpic.top - cb.top) / sc, w: tpic.width / sc, ht: tpic.height / sc },
        to: { x: (hrect.left - cb.left) / sc, y: (hrect.top - cb.top) / sc, w: hrect.width / sc, ht: hrect.height / sc },
      };
    };

    return {
      timelineManaged: true,
      durationMs: preset.timeline?.actionMs || 1600,
      render(t, { reduced }) {
        if (!geo) measure();
        const { from, to } = geo;
        const phase = timelinePhases(t, preset.timeline);
        // 展开进度（action：小图 → hero）与返回进度（exit：hero → 小图），
        // 同一个 ghost 元素往返，不做第二张卡片
        const p = reduced ? (phase.action > 0 ? 1 : 0) : easeInOut(phase.action);
        const q = reduced ? (phase.exit >= 1 ? 0 : 1) : 1 - easeInOut(phase.exit);
        const g = p * q;
        const x = lerp(from.x, to.x, g);
        const y = lerp(from.y, to.y, g);
        const w = lerp(from.w, to.w, g);
        const ht = lerp(from.ht, to.ht, g);
        ghost.style.left = `${x.toFixed(1)}px`;
        ghost.style.top = `${y.toFixed(1)}px`;
        ghost.style.width = `${w.toFixed(1)}px`;
        ghost.style.height = `${ht.toFixed(1)}px`;
        ghost.style.borderRadius = `${(8 - g * 2).toFixed(1)}px`;
        // 详情内容只在展开到位（hold 阶段）后淡入，展开过程中不提前出现终点卡片
        const detailIn = reduced ? 1 : easeOut(seg(phase.hold, 0, 0.35));
        detail.style.opacity = String(clamp01(detailIn * q));
        // ghost 与详情 hero 同图同位：展开到位后交给 detail 呈现，往返两端隐藏
        const ghostVisible = g > 0.001 && g < 0.999;
        ghost.style.opacity = ghostVisible ? "1" : "0";
        ghost.style.visibility = ghostVisible ? "visible" : "hidden";
        // 缩略图：展开中隐藏（被放大中的 ghost 覆盖），返回接近完成时恢复
        thumb.style.visibility = g > 0.05 && q > 0.5 ? "hidden" : "visible";
      },
    };
  },

  "page-transition"({ stage, preset }) {
    const c = preset.content || {};
    const mk = (cfg) => {
      const p = h("div", "d-page-full");
      const im = new Image();
      im.src = `https://picsum.photos/seed/${cfg.seed}/900/500`;
      im.alt = "";
      im.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.5";
      const t = h("div", "d-h1", cfg.title);
      t.style.cssText = "position:absolute;left:28px;bottom:34px;font-size:30px;text-shadow:0 2px 12px rgba(0,0,0,.6)";
      const s = h("div", "d-sub", cfg.sub);
      s.style.cssText = "position:absolute;left:28px;bottom:16px;color:#c3cbd6;text-shadow:0 1px 6px rgba(0,0,0,.7)";
      p.append(im, t, s);
      return p;
    };
    const a = mk(c.a || { title: "页面 A", sub: "", seed: "summit" });
    const b = mk(c.b || { title: "页面 B", sub: "", seed: "tide" });
    stage.canvas.append(a, b);

    return {
      timelineManaged: true,
      durationMs: (preset.timeline?.actionMs || 440) + 500 + (preset.timeline?.exitMs || 380),
      render(t, { reduced }) {
        const phase = timelinePhases(t, preset.timeline);
        const inP = reduced ? (phase.action > 0 ? 1 : 0) : easeOut(phase.action);
        const outP = reduced ? (phase.exit >= 1 ? 1 : 0) : easeInOut(phase.exit);
        const x = (1 - inP) * 100 + outP * 100;
        b.style.transform = `translateX(${x.toFixed(2)}%)`;
        b.style.opacity = "1";
        void pic;
      },
    };
  },
};
