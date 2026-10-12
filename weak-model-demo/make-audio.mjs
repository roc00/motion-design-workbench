// 纯代码合成音效 WAV（无外部依赖），用法: node make-audio.mjs <cue.json> <out.wav>
import { readFileSync, writeFileSync } from "node:fs";
const SR = 48000;
const cues = JSON.parse(readFileSync(process.argv[2], "utf8"));
const end = Math.max(...cues.map((c) => c.t)) + 2;
const buf = new Float32Array(Math.ceil(end * SR));

let s = 42;
const noise = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2147483648 - 1;
const VOICES = {
  click: [0.06, (t) => Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 90) * 0.45],
  pop: [0.18, (t) => Math.sin(2 * Math.PI * (600 + 900 * t) * t) * Math.exp(-t * 28) * 0.4],
  thump: [0.55, (t) => Math.sin(2 * Math.PI * (110 - 70 * t) * t) * Math.exp(-t * 9) * 0.85],
  whoosh: [0.4, (t) => noise() * Math.sin(Math.PI * Math.min(1, t / 0.4)) * 0.3],
  riser: [0.9, (t) => Math.sin(2 * Math.PI * (300 + 900 * t) * t) * Math.exp(-t * 2.2) * 0.25],
};
for (const c of cues) {
  const [len, fn] = VOICES[c.type];
  const start = Math.floor(c.t * SR);
  for (let i = 0; i < len * SR && start + i < buf.length; i++) buf[start + i] += fn(i / SR);
}
const n = buf.length;
const b = Buffer.alloc(44 + n * 2);
b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVEfmt ", 8);
b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
b.write("data", 36); b.writeUInt32LE(n * 2, 40);
for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[i])) * 32767), 44 + i * 2);
writeFileSync(process.argv[3], b);
console.log("wrote", process.argv[3]);
