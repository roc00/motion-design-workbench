import { h, seg, clamp01, easeOut, easeInOut, tabular, fmtNum, LOGICAL_W as W } from "../kit.js";

const centerCol = (stage, gap = 0) => {
  const wrap = h("div");
  wrap.style.cssText = `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:${gap}px`;
  stage.canvas.append(wrap);
  return wrap;
};

export const variants = {
  counter({ stage, preset }) {
    const c = preset.content || {};
    const card = h("div", "d-kpi");
    card.style.cssText += ";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)";
    const label = h("div", "d-caption", c.label || "指标");
    const row = h("div", "d-kpi-row");
    const num = tabular(h("div", "d-num"));
    const unit = h("span", "d-sub", c.unit || "");
    row.append(num, unit);
    const bar = h("div", "d-progress");
    bar.style.marginTop = "12px";
    const fill = h("i");
    bar.append(fill);
    const delta = h("div", "d-caption", c.delta || "");
    delta.style.cssText += ";margin-top:6px;color:#34d399";
    card.append(label, row, bar, delta);
    stage.canvas.append(card);

    const target = c.value ?? 0;
    const DUR = preset.timeline?.actionMs || 1150;
    return {
      durationMs: DUR + (preset.timeline?.holdMs || 600),
      render(t) {
        const p = easeOut(clamp01((t * (DUR + 600)) / DUR));
        num.textContent = fmtNum(Math.round(target * p));
        fill.style.width = `${(p * 100).toFixed(1)}%`;
        delta.style.opacity = String(seg(t, 0.82, 1));
        if (t >= 1) num.textContent = fmtNum(target);
      },
    };
  },

  skeleton({ stage, preset }) {
    const c = preset.content || {};
    const card = h("div", "d-card2");
    card.style.cssText += ";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:340px";
    const skPic = h("div", "d-skel");
    skPic.style.cssText += ";height:150px;border-radius:0";
    const skMeta = h("div", "d-skel-meta");
    const l1 = h("div", "d-skel");
    l1.style.cssText += ";height:11px;width:52%";
    const l2 = h("div", "d-skel");
    l2.style.cssText += ";height:9px;width:78%";
    skMeta.append(l1, l2);
    const realPic = h("div", "pic d-real");
    const rim = new Image();
    rim.src = `https://picsum.photos/seed/${c.seed || "valley"}/680/300`;
    rim.alt = "";
    realPic.append(rim);
    const realMeta = h("div", "d-real-meta");
    realMeta.append(h("div", "t", c.title || ""), h("div", "b", c.sub || ""));
    card.append(skPic, skMeta, realPic, realMeta);
    stage.canvas.append(card);

    return {
      durationMs: preset.timeline?.actionMs || 1600,
      render(t) {
        const swap = easeInOut(seg(t, 0.62, 0.86));
        [skPic, skMeta].forEach((el) => (el.style.opacity = String(1 - swap)));
        realPic.style.opacity = String(swap);
        realMeta.style.opacity = String(swap);
        // 骨架高光按帧移动，不用 CSS 无限动画
        const shine = ((t * 1.6) % 1) * 140 - 30;
        [skPic, l1, l2].forEach((el) => {
          el.style.background = `linear-gradient(90deg,#202833 ${shine - 12}%,#2b3542 ${shine}%,#202833 ${shine + 12}%)`;
        });
      },
    };
  },

  loading({ stage, preset }) {
    const wrap = centerCol(stage, 16);
    const spinner = h("div", "d-spinner");
    const cap = h("div", "d-caption", "不知道何时完成 · 只表达「还在工作」");
    const barBox = h("div");
    barBox.style.cssText = "width:360px;display:flex;flex-direction:column;gap:7px";
    const bar = h("div", "d-progress");
    const fill = h("i");
    bar.append(fill);
    const pct = tabular(h("div", "d-caption", "0%"));
    barBox.append(bar, pct);
    wrap.append(spinner, cap, barBox);

    const DUR = preset.timeline?.actionMs || 2400;
    const spinStart = 0.6; // 前半段转圈（停留足够久让人看清），后半段切进度
    return {
      durationMs: DUR,
      render(t) {
        const phase2 = t > spinStart;
        spinner.style.display = phase2 ? "none" : "";
        // 旋转角度由帧决定，不用无限动画
        spinner.style.transform = `rotate(${(t * DUR * 0.36).toFixed(1)}deg)`;
        cap.textContent = phase2 ? "知道完成比例 · 用进度条" : "不知道何时完成 · 只表达「还在工作」";
        barBox.style.opacity = phase2 ? "1" : "0.25";
        const p = phase2 ? easeOut((t - spinStart) / (1 - spinStart)) : 0;
        fill.style.width = `${(p * 100).toFixed(1)}%`;
        pct.textContent = t >= 1 ? "完成 · 100%" : `${Math.round(p * 100)}%`;
      },
    };
  },

  result({ stage, preset }) {
    const c = preset.content || {};
    const wrap = centerCol(stage, 12);
    wrap.style.width = "380px";
    const input = h("div", "d-input");
    input.style.cssText += ";width:100%";
    input.textContent = c.value || "";
    const btn = h("div", "d-btn");
    btn.style.cssText += ";width:100%;justify-content:center";
    const msg = h("div", "d-caption");
    msg.style.height = "16px";
    wrap.append(input, btn, msg);

    const DUR = (preset.timeline?.actionMs || 700) * 2 + 600;
    let lastPhase = -1;
    return {
      durationMs: DUR,
      render(t) {
        const ms = t * DUR;
        let phase;
        if (ms < 600) phase = 0;
        else if (ms < 1300) phase = 1;
        else if (ms < 1900) phase = 2;
        else phase = 3;
        if (phase !== lastPhase) {
          lastPhase = phase;
          btn.style.background = "";
          btn.textContent = ["提交", "处理中…", "✓ " + (c.ok || "已保存"), "提交"][phase];
          msg.style.color = "";
          input.style.borderColor = "#333c48";
          if (phase === 2) {
            btn.style.background = "#34d399";
            msg.textContent = "成功：颜色 + 图标 + 文字，三重编码";
            msg.style.color = "#34d399";
          } else if (phase === 3) {
            input.style.borderColor = "#b4544a";
            msg.textContent = c.err || "格式不正确，请检查后重试";
            msg.style.color = "#f87171";
          } else {
            msg.textContent = "";
          }
        }
        // 抖动幅度由帧决定：只抖一次，不重复
        const shake = phase === 3 ? Math.sin(seg(t, 1900 / DUR, 1) * Math.PI * 8) * 5 * (1 - seg(t, 1900 / DUR, 1)) : 0;
        input.style.transform = `translateX(${shake.toFixed(2)}px)`;
      },
    };
  },

  "icon-morph"({ stage, preset }) {
    void preset;
    const row = centerCol(stage, 0);
    row.style.flexDirection = "row";
    row.style.gap = "36px";
    const mkMenu = () => {
      const b = h("div", "d-iconbtn");
      const bars = [0, 1, 2].map(() => {
        const l = h("div", "d-iconbar");
        b.append(l);
        return l;
      });
      return { b, bars };
    };
    const menu = mkMenu();
    const mkPlus = () => {
      const b = h("div", "d-iconbtn");
      // 加号两条线都在 48px 按钮的几何中心：横 22px、竖 22px，交于中心
      const hbar = h("div", "d-iconbar");
      hbar.style.cssText += ";left:13px;top:23px";
      const vbar = h("div", "d-iconbar");
      vbar.style.cssText += ";left:23px;top:13px;width:2px;height:22px";
      b.append(hbar, vbar);
      return { b, hbar, vbar };
    };
    const plus = mkPlus();
    row.append(menu.b, plus.b);
    const cap = h("div", "d-caption", "汉堡 ↔ 叉号 / 加号 ↔ 减号，两种状态共用同一个按钮位置");
    cap.style.cssText = "position:absolute;left:50%;bottom:16px;transform:translateX(-50%)";
    stage.canvas.append(cap);

    return {
      durationMs: 2000,
      render(t) {
        // 一个来回：0 → 开 → 0（sin 正半波），不再做两个来回
        const k = Math.sin(t * Math.PI);
        const on = k > 0.35;
        const top = 15 + (21 - 15) * k;
        const bot = 27 + (21 - 27) * k;
        menu.bars[0].style.transform = `translateY(${top - 15}px) rotate(${(45 * k).toFixed(1)}deg)`;
        menu.bars[2].style.transform = `translateY(${bot - 27}px) rotate(${(-45 * k).toFixed(1)}deg)`;
        menu.bars[1].style.opacity = String(1 - k);
        menu.bars.forEach((b) => (b.style.background = on ? "#8acd00" : "#cbd3de"));
        plus.vbar.style.transform = `scaleY(${(1 - k).toFixed(2)})`;
        plus.hbar.style.background = on ? "#8acd00" : "#cbd3de";
      },
    };
  },
};

void W;
void clamp01;
