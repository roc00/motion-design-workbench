// Render a STUDIO film frame-by-frame via ego-browser + ffmpeg pipe.
// Config read from .render-cfg.json (env vars do not pass through ego runtime).
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync(process.cwd() + "/.render-cfg.json", "utf8"));
const film = cfg.film;
const W = Number(cfg.rw);
const H = Number(cfg.rh);
const FPS = Number(cfg.fps || 60);
const DUR = 15;
console.log("RENDER", film, W, H, FPS);

mkdirSync("films", { recursive: true });

const task = await taskSpace("render-" + film);
const page = task.page("p1");
await page.goto(`http://localhost:5199/films/${film}.html`);
await page.waitForTimeout(1000);

const out = `films/${film}.mp4`;
const ff = spawn("ffmpeg", [
  "-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
  "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p",
  "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
  out
], { stdio: ["pipe", "inherit", "inherit"] });

const total = DUR * FPS;
let drain = Promise.resolve();
for (let i = 0; i < total; i++) {
  const t = i / FPS;
  const b64 = await page.evaluate((x) => {
    window.seek(x);
    return document.getElementById("c").toDataURL("image/png").split(",")[1];
  }, t);
  const buf = Buffer.from(b64, "base64");
  if (!ff.stdin.write(buf)) {
    await new Promise((r) => ff.stdin.once("drain", r));
  }
  if (i % (FPS) === 0) console.log(`${film} ${t}s / ${DUR}s`);
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await task.finish({ keep: [] });
console.log("rendered", out);
