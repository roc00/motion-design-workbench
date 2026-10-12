#!/usr/bin/env node
/* Build flagship 9:16 films: head + body + tail -> films/<name>.html */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const KIT = join(ROOT, "snippets/_kit");
const FILMS = [
  { name: "pulse", title: "Pulse · 让每一次信号都被看见" },
  { name: "margin", title: "Margin · 让每一句话都有位置" },
];

const head = readFileSync(join(KIT, "film-head.html"), "utf8");
const tail = readFileSync(join(KIT, "tail.html"), "utf8");

for (const f of FILMS) {
  const body = readFileSync(join(KIT, `film-${f.name}.body.js`), "utf8");
  let html = head + "\n" + body + "\n" + tail;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${f.title}</title>`);
  const out = join(ROOT, "films", `${f.name}.html`);
  writeFileSync(out, html);
  console.log("built", out, html.length);
}
