#!/usr/bin/env node
/* Assemble self-contained cinematic snippets from a shared head + per-film body + generic tail.
   Usage: node scripts/build-cine-snippets.mjs [name ...] */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const head = readFileSync(join(root, 'snippets/_kit/head.html'), 'utf8');
const tail = readFileSync(join(root, 'snippets/_kit/tail.html'), 'utf8');

const FILMS = {
  'cine-particle-converge': { title: '粒子汇聚 · Particle converge' },
  'cine-macro-ui': { title: '微距界面 · Macro UI' },
  'cine-board-flyover': { title: '看板飞越 · Board flyover' },
  'cine-orbit': { title: '环绕集成 · Orbit integrations' },
  'cine-kinetic-slice': { title: '动态切片 · Kinetic slice' },
  'cine-character-field': { title: '字符场 · Character field' },
  'cine-whip-montage': { title: '甩镜快切 · Whip montage' },
};

const wanted = process.argv.slice(2);
const names = wanted.length ? wanted : Object.keys(FILMS);
for (const name of names) {
  const body = readFileSync(join(root, `snippets/_kit/${name}.body.js`), 'utf8');
  let html = head + body + '\n' + tail;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${FILMS[name].title}</title>`);
  writeFileSync(join(root, `snippets/${name}.html`), html);
  console.log('built', name, html.length);
}
