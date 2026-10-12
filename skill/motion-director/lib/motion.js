// 运动物理原语：闭式弹簧（纯时间函数，可任意 seek）+ 基础缓动
import { clamp01 } from "./util.js";

// 闭式阻尼弹簧：0 → 1，t 为秒
export function spring(t, k = 170, d = 26) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k);
  const z = d / (2 * w0);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  }
  // 临界 / 过阻尼
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

// 多目标值：keys = [[time, value], ...]；每个目标变化叠加一个弹簧，不重启
export function track(t, keys, k = 170, d = 26) {
  if (!keys.length) return 0;
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
  }
  return v;
}

// 标签 / 指示条：前缘更刚、后缘更柔，形成拉伸
export function indicator(t, stops) {
  const lead = track(t, stops, 320, 30);
  const trail = track(t, stops, 140, 22);
  return { left: Math.min(lead, trail), right: Math.max(lead, trail) + 120 };
}

// 变形容器内文字：变形开始后进入、下一次变形前离开
export function swapAlpha(t, tIn, tOut) {
  return Math.min(clamp01((t - tIn - 0.08) / 0.12), clamp01((tOut - 0.1 - t) / 0.1));
}

// 弹簧档位预设（k, d）
export const SPRING = {
  snappy: [320, 30], // 按钮 / 开关 / 前缘
  default: [170, 26], // 卡片 / 容器 / 相机
  heavy: [90, 20], // 大字号 / 3D / Logo
  playful: [120, 12], // 吉祥物 / 贴纸（明显过冲）
};

// 基础缓动（用于不需要质量感的非核心运动）
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t) => t * t * t;
export const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
