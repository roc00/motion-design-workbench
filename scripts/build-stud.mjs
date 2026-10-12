// Build STUDIO films: concatenate head + body + tail
import { readFileSync, writeFileSync } from "node:fs";

const ROOT = process.cwd();
const K = "snippets/_kit/stud/";

function build(name, out, dark = false) {
  const head = readFileSync(`${ROOT}/${K}${dark ? "head-dark" : "head"}.html`, "utf8");
  const body = readFileSync(`${ROOT}/${K}${name}.body.js`, "utf8");
  const tail = readFileSync(`${ROOT}/${K}tail.html`, "utf8");
  let html = head + body + tail;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${out}</title>`);
  const path = `${ROOT}/films/${out}.html`;
  writeFileSync(path, html);
  console.log("built", path, html.length);
}

build("morph", "stud-morph");
build("orbit", "stud-orbit", true);
