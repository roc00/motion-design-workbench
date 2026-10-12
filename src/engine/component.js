import { h, pic, seg, clamp01, easeOut, easeInOut, stagger, LOGICAL_W as W, LOGICAL_H as H } from "../kit.js";
import { timelinePhases } from "../runtime-config.js";

const layer = (stage, el) => {
  el.style.position = "absolute";
  stage.canvas.append(el);
  return el;
};
/** 隐藏层必须同时退出命中测试与无障碍树 */
const setHidden = (el, hidden) => {
  el.style.pointerEvents = hidden ? "none" : "";
  el.style.visibility = hidden ? "hidden" : "visible";
  el.setAttribute("aria-hidden", hidden ? "true" : "false");
};

function questionList(items) {
  const list = h("div");
  list.style.cssText = "display:flex;flex-direction:column;gap:7px";
  const rows = items.map((it) => {
    const wrap = h("div", "d-qa");
    const head = h("div", "d-qa-head");
    const sign = h("span", "d-qa-sign", "＋");
    head.append(sign, h("span", null, it.q));
    const panel = h("div", "d-qa-panel");
    const inner = h("div", "d-sub", it.a);
    panel.append(inner);
    wrap.append(head, panel);
    list.append(wrap);
    return { wrap, sign, panel, inner };
  });
  return { list, rows };
}

export const variants = {
  accordion({ stage, preset }) {
    const items = preset.content?.items || [];
    const page = layer(stage, h("div", "d-page-pad"));
    page.append(h("div", "d-h2", "常见问题"));
    const { list, rows } = questionList(items);
    list.style.marginTop = "12px";
    page.append(list);

    const n = Math.max(1, items.length);
    // 每个问题的开合由 t 的两段决定：依次展开，最后全部收起
    const openAt = (i) => 0.06 + (i / n) * 0.55;
    return {
      durationMs: preset.timeline?.actionMs || 3200,
      render(t) {
        rows.forEach((r, i) => {
          const o = openAt(i);
          const close = 0.72 + (i / n) * 0.2;
          const p = clamp01(Math.min(seg(t, o, o + 0.14), 1 - seg(t, close, close + 0.1)));
          const open = p > 0.5;
          r.sign.textContent = p > 0.5 ? "－" : "＋";
          r.wrap.style.borderColor = p > 0.5 ? "#8acd00" : "#242d3a";
          // 高度由 p 决定：不做历史回调
          const target = r.inner.offsetHeight + 12;
          r.panel.style.height = `${(p * target).toFixed(1)}px`;
          r.panel.style.opacity = String(p);
        });
      },
    };
  },

  popover({ stage, preset }) {
    const c = preset.content || {};
    const nav = layer(stage, h("div", "d-nav"));
    nav.style.cssText += ";left:0;right:0;top:0";
    nav.append(h("span", "d-logo"), h("span", "brand-t", "Motion Kit"));
    const trigger = h("a", "on", `${c.trigger || "产品"} ▾`);
    nav.append(trigger, h("a", null, "定价"));
    const body = layer(stage, h("div", "d-hero"));
    body.style.cssText += ";inset:38px 0 0 0";
    const tip = h("div", "d-sub", "点击「产品」看浮层");
    tip.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)";
    body.append(tip);

    const menu = layer(stage, h("div", "d-menu"));
    menu.style.cssText += ";top:42px;left:64px";
    (c.items || []).forEach((t) => {
      const r = h("div", "d-menu-item");
      const dot = h("span", "d-menu-dot");
      r.append(dot, h("span", null, t));
      menu.append(r);
    });

    return {
      durationMs: preset.timeline?.actionMs || 1800,
      render(t) {
        const p = clamp01(Math.min(seg(t, 0.08, 0.22), 1 - seg(t, 0.72, 0.86)));
        menu.style.opacity = String(p);
        menu.style.transform = `translateY(${((1 - p) * -6).toFixed(1)}px) scale(${(0.96 + p * 0.04).toFixed(3)})`;
        setHidden(menu, p < 0.02);
        trigger.style.background = p > 0.5 ? "#242c37" : "transparent";
        tip.textContent = p > 0.5 ? "浮层从触发点附近出现，关闭时回到同一位置" : "点击「产品」看浮层";
      },
    };
  },

  modal({ stage, preset }) {
    const c = preset.content || {};
    const page = layer(stage, h("div", "d-page-pad"));
    page.append(h("div", "d-h2", "作品列表"));
    const grid = h("div", "d-cards2");
    grid.style.marginTop = "12px";
    const thumb = h("div", "d-card2");
    thumb.style.width = "150px";
    const p = h("div", "pic");
    const im = new Image();
    im.src = `https://picsum.photos/seed/${c.seed || "summit"}/300/170`;
    im.alt = c.title || "";
    p.append(im);
    const meta = h("div", "meta");
    meta.append(h("div", "t", c.title || "点击预览"));
    thumb.append(p, meta);
    grid.append(thumb);
    page.append(grid);

    const scrim = layer(stage, h("div", "d-scrim"));
    const dialog = layer(stage, h("div", "d-modal"));
    dialog.style.cssText += ";left:50%;top:50%;width:380px;padding:10px";
    const dp = h("div");
    dp.style.cssText = "height:190px;border-radius:8px;overflow:hidden";
    const dim = new Image();
    dim.src = `https://picsum.photos/seed/${c.seed || "summit"}/700/380`;
    dim.alt = "";
    dim.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
    dp.append(dim);
    dialog.append(dp);

    return {
      timelineManaged: true,
      durationMs: (preset.timeline?.actionMs || 260) + (preset.timeline?.holdMs || 1500) + (preset.timeline?.exitMs || 260),
      render(t, { reduced }) {
        const phase = timelinePhases(t, preset.timeline);
        const p = clamp01(easeOut(phase.action) * (1 - easeInOut(phase.exit)));
        const inside = p > 0.02;
        setHidden(scrim, !inside);
        setHidden(dialog, !inside);
        scrim.style.opacity = String(0.5 * p);
        dialog.style.opacity = String(p);
        const sc = reduced ? 1 : 0.9 + p * 0.1;
        dialog.style.transform = `translate(-50%,-50%) scale(${sc.toFixed(3)})`;
      },
    };
  },

  drawer({ stage, preset }) {
    const c = preset.content || {};
    const page = layer(stage, h("div", "d-page-pad"));
    page.append(h("div", "d-h2", c.pageTitle || "商品列表"));
    const cards = h("div", "d-cards2");
    cards.style.marginTop = "12px";
    (c.seeds || []).forEach((seed, i) => {
      const card = h("div", "d-card2");
      card.style.width = "132px";
      const p = h("div", "pic");
      const im = new Image();
      im.src = `https://picsum.photos/seed/${seed}/260/150`;
      im.alt = "";
      p.append(im);
      const meta = h("div", "meta");
      meta.append(h("div", "t", `商品 ${i + 1}`));
      card.append(p, meta);
      cards.append(card);
    });
    page.append(cards);

    const scrim = layer(stage, h("div", "d-scrim"));
    const drawer = layer(stage, h("div", "d-drawer"));
    drawer.style.cssText += ";width:250px";
    drawer.append(h("div", "d-h2", c.drawerTitle || "购物车"));
    const list = h("div", "d-col");
    list.style.marginTop = "12px";
    (c.items || []).forEach((label, i) => {
      const row = h("div", "d-row");
      const th = h("div", "d-thumb");
      const ti = new Image();
      ti.src = `https://picsum.photos/seed/${(c.seeds || [])[i] || "summit"}/80/80`;
      ti.alt = "";
      th.append(ti);
      row.append(th, h("div", "d-sub", label));
      list.append(row);
    });
    drawer.append(list);

    return {
      timelineManaged: true,
      durationMs: (preset.timeline?.actionMs || 340) + (preset.timeline?.holdMs || 1400) + (preset.timeline?.exitMs || 300),
      render(t, { reduced }) {
        const phase = timelinePhases(t, preset.timeline);
        const p = clamp01(easeOut(phase.action) * (1 - easeInOut(phase.exit)));
        const inside = p > 0.02;
        setHidden(scrim, !inside);
        setHidden(drawer, !inside);
        scrim.style.opacity = String(0.38 * p);
        drawer.style.transform = reduced ? `translateX(${inside ? 0 : 100}%)` : `translateX(${((1 - p) * 104).toFixed(1)}%)`;
      },
    };
  },

  tabs({ stage, preset }) {
    const tabs = preset.content?.tabs || [];
    const wrap = layer(stage, h("div", "d-center-col"));
    const bar = h("div", "d-tabbar");
    const ind = h("div", "ind");
    const ts = tabs.map((tb) => {
      const e = h("div", "t", tb.label);
      bar.append(e);
      return e;
    });
    bar.append(ind);
    const panel = h("div", "d-card2");
    panel.style.cssText += ";width:400px";
    const pp = h("div", "pic");
    pp.style.height = "150px";
    const pim = new Image();
    pim.alt = "";
    pp.append(pim);
    const pmeta = h("div", "meta");
    const pt = h("div", "t");
    const pb = h("div", "b");
    pmeta.append(pt, pb);
    panel.append(pp, pmeta);
    wrap.append(bar, panel);
    stage.canvas.append(wrap);

    const n = Math.max(1, tabs.length);
    return {
      durationMs: preset.timeline?.actionMs || n * 2500,
      render(t) {
        const pos = t * n;
        const idx = Math.min(n - 1, Math.floor(pos));
        const local = pos - idx;
        // 每个标签停留约 2s，只在槽位最后 20% 完成切换（指示器先动、内容后动）
        const moving = local > 0.8 && idx < n - 1;
        const k = moving ? (local - 0.8) / 0.2 : 0;
        const fromEl = ts[idx];
        const toEl = ts[Math.min(n - 1, idx + 1)];
        const target = moving ? toEl : fromEl;
        const l1 = fromEl.offsetLeft;
        const l2 = target.offsetLeft;
        const w1 = fromEl.offsetWidth;
        const w2 = target.offsetWidth;
        ind.style.left = `${(l1 + (l2 - l1) * k).toFixed(1)}px`;
        ind.style.width = `${(w1 + (w2 - w1) * k).toFixed(1)}px`;
        const shown = moving && k > 0.5 ? Math.min(n - 1, idx + 1) : idx;
        ts.forEach((e, i) => (e.dataset.on = i === shown ? "1" : "0"));
        const item = tabs[shown];
        if (item) {
          pt.textContent = item.title;
          pb.textContent = item.sub;
          const url = `https://picsum.photos/seed/${item.seed}/600/300`;
          if (pim.dataset.seed !== item.seed) {
            pim.dataset.seed = item.seed;
            pim.src = url;
          }
        }
        // 内容交叉淡化
        const fade = moving ? Math.abs(k - 0.5) * 2 : 1;
        panel.style.opacity = String(0.25 + 0.75 * fade);
      },
    };
  },

  carousel({ stage, preset }) {
    const slides = preset.content?.slides || [];
    const viewport = layer(stage, h("div", "d-viewport"));
    viewport.style.cssText += ";left:60px;right:60px;top:44px;bottom:56px";
    const row = h("div");
    row.style.cssText = "display:flex;height:100%";
    const cards = slides.map((s, i) => {
      const c = h("div");
      c.style.cssText = "flex:0 0 100%;height:100%;position:relative";
      const im = new Image();
      im.src = `https://picsum.photos/seed/${s.seed}/700/380`;
      im.alt = "";
      im.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
      const cap = h("div", "d-caption");
      cap.style.cssText = "position:absolute;left:10px;bottom:8px;color:#fff;text-shadow:0 1px 5px rgba(0,0,0,.7)";
      cap.textContent = `案例 ${i + 1} / ${slides.length}`;
      c.append(im, cap);
      row.append(c);
      return c;
    });
    viewport.append(row);
    const dots = layer(stage, h("div", "d-row"));
    dots.style.cssText += ";left:50%;bottom:22px;transform:translateX(-50%);gap:6px";
    const ds = cards.map(() => {
      const d = h("div", "d-dot");
      dots.append(d);
      return d;
    });

    const n = Math.max(1, cards.length);
    return {
      durationMs: preset.timeline?.actionMs || n * 2500,
      render(t, { reduced }) {
        const pos = t * n;
        const idx = Math.min(n - 1, Math.floor(pos));
        const local = pos - idx;
        // 每张图停留约 2s，只在槽位最后 20% 滑向下一张
        const mv = idx < n - 1 ? easeInOut(seg(local, 0.8, 1)) : 0;
        const cur = idx + mv;
        const x = -(cur * 100);
        row.style.transform = reduced ? `translateX(${-(Math.round(cur) * 100)}%)` : `translateX(${x.toFixed(3)}%)`;
        const active = Math.round(cur);
        ds.forEach((d, i) => (d.style.opacity = i === active ? "1" : "0.3"));
      },
    };
  },

  toast({ stage, preset }) {
    const c = preset.content || {};
    const page = layer(stage, h("div", "d-page-pad"));
    page.append(h("div", "d-h2", "分享"));
    const row = h("div", "d-row");
    row.style.marginTop = "12px";
    const input = h("div", "d-input", c.url || "");
    input.style.width = "300px";
    const btn = h("div", "d-btn", "复制链接");
    row.append(input, btn);
    page.append(row);

    const host = layer(stage, h("div", "d-toast-host"));
    const toast = h("div", "d-toast");
    toast.append(h("span", "ic", "✓"), h("span", null, c.message || "已复制"));
    host.append(toast);

    return {
      timelineManaged: true,
      durationMs: (preset.timeline?.actionMs || 260) + (preset.timeline?.holdMs || 1700) + (preset.timeline?.exitMs || 300),
      render(t) {
        const phase = timelinePhases(t, preset.timeline);
        const p = clamp01(easeOut(phase.action) * (1 - easeInOut(phase.exit)));
        setHidden(host, p < 0.02);
        toast.style.opacity = String(p);
        toast.style.transform = `translateY(${((1 - p) * 14).toFixed(1)}px)`;
      },
    };
  },
};

void pic;
void easeOut;
void easeInOut;
void stagger;
void W;
void H;
