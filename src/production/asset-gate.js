export class ProductionAssetError extends Error {
  constructor(message, failures = []) {
    super(message);
    this.name = "ProductionAssetError";
    this.failures = failures;
  }
}

const isRemote = (uri) => /^https?:\/\//i.test(uri || "");

export function validateProductionAssets(assets = []) {
  const failures = [];
  for (const asset of assets) {
    if (!asset?.uri) failures.push(`${asset?.role || "asset"}: 缺少 uri`);
    else if (isRemote(asset.uri)) failures.push(`${asset.role || "asset"}: 生产模式不允许远程素材 ${asset.uri}`);
  }
  return failures;
}

function waitMedia(el, timeoutMs) {
  const ready = el instanceof HTMLImageElement ? el.complete && el.naturalWidth > 0 : el.readyState >= 2;
  if (ready) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const ok = () => cleanup(resolve);
    const bad = () => cleanup(() => reject(new Error(el.currentSrc || el.src || "未知媒体加载失败")));
    const timer = setTimeout(() => bad(), timeoutMs);
    const cleanup = (done) => {
      clearTimeout(timer);
      el.removeEventListener("load", ok);
      el.removeEventListener("loadeddata", ok);
      el.removeEventListener("error", bad);
      done();
    };
    el.addEventListener("load", ok, { once: true });
    el.addEventListener("loadeddata", ok, { once: true });
    el.addEventListener("error", bad, { once: true });
  });
}

/** 生产模式的 ready：字体、图片、视频全部成功；失败时拒绝，不使用占位图继续。 */
export async function waitForProductionAssets(root, assets = [], timeoutMs = 8000) {
  const failures = validateProductionAssets(assets);
  if (failures.length) throw new ProductionAssetError("生产素材校验失败", failures);
  const tasks = [];
  if (document.fonts?.ready) tasks.push(document.fonts.ready);
  for (const el of root.querySelectorAll("img,video")) tasks.push(waitMedia(el, timeoutMs));
  try {
    await Promise.all(tasks);
  } catch (error) {
    throw new ProductionAssetError("生产资源未能完整就绪", [error.message]);
  }
}
