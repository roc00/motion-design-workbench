export const ADAPTED_EFFECTS = new Set([
  "text.line-reveal",
  "text.typewriter",
  "enter.mask-reveal",
  "layout.shared-element",
  "layout.layout-animation",
]);

export function capabilityFor(effectId, { verified = false } = {}) {
  if (verified) return "production-verified";
  if (ADAPTED_EFFECTS.has(effectId)) return "production-adapted";
  return "browser-demo";
}

export const CAPABILITY_LABEL = {
  "browser-demo": "浏览器演示",
  "production-adapted": "已适配，待成片验证",
  "production-verified": "生产已验证",
};
