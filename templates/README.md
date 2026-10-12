# Motion Scaffold · 代码脚手架（Route A，零依赖）

确定性的成片模板。每部片子都是**时间的纯函数**：`window.seek(t)` 画第 t 秒。

## 目录
```
├─ index.html      # canvas + 场景注册 + seek；浏览器直接打开即循环预览
├─ lib/
│  ├─ motion.js    # spring / track / indicator / swapAlpha + 缓动 + 弹簧档位
│  ├─ camera.js    # 呼吸漂移 + cue 触发推进（可 seek）
│  └─ util.js      # clamp01 / seg / lerp / seeded / roundRectPath
├─ cue-table.json  # 唯一 cue 表：时长 / 推进点 / cuts / events
├─ scenes/         # （可选）每个场景一个模块，也可内联进 index.html
└─ render.mjs      # 机械逐帧渲染 → out/silent.mp4
```

## 怎么用（弱模型：只填内容，不发明运动）
1. 打开 `index.html`，在 `SCENES` 数组里填/改场景内容；每个场景 `{from,to,draw(t)}`。
2. 运动一律用 `lib/motion.js`：
   - 进入/缩放用 `spring(t - at, ...SPRING.snappy)`；
   - 多次变化的值用 `track()`；容器内文字用 `swapAlpha()`。
3. 相机推进在 `CUES` 里设 `pushAt`（秒）、`pushAmount`（0.15 左右）。
4. 所有事件登记到 `cue-table.json`，保证**每 2–4 秒有新东西**，无 >4s 空镜。

## 渲染成 MP4（需要 shell 环境）
```
npm i -D playwright && npx playwright install chromium   # 仅首次
node render.mjs                # 读取 cue-table.json 的 duration
# 可选参数：--fps 60 --dur 12 --sub 4 --width 1280 --height 720
```
`render.mjs` 会逐帧调用 seek、用 ffmpeg 合成（H.264，CRF16，4 子帧运动模糊）。

## 硬性规则（gate 会阻断，不能跳过）
- 渲染核心**禁止** `Math.random`（用 `seeded(seed)`）、`Date.now`/`performance.now`、
  `setTimeout`/`setInterval`/`requestAnimationFrame`、`fetch`、动态 `import()`。
- 浏览器预览里的 rAF 是唯一例外（仅在 `!navigator.webdriver` 下，headless 渲染不启动）。
- 规避默认 slop：居中标题+渐变、全场 fade、角标/边框、UI 泛光、通用粒子爆发。
