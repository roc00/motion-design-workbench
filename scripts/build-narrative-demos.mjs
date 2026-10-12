import {build} from "esbuild";
import {readFileSync,writeFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const patterns=JSON.parse(readFileSync(join(root,"data/director-patterns.json"),"utf8")).patterns;
const font=readFileSync(join(root,"node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2")).toString("base64");
for(const pattern of patterns){
  const entry=`import {renderDirectorPattern} from './src/production/director-pattern.js';
const pattern=${JSON.stringify(pattern)};
const duration=pattern.durationMs/1000;
let t=0,raf=0,origin=0;
window.seek=value=>{t=Math.max(0,Math.min(duration,value));document.getElementById('stage').innerHTML=renderDirectorPattern(pattern,t/duration);return t;};
window.getTime=()=>t;
window.pause=()=>{cancelAnimationFrame(raf);raf=0;};
window.play=(value=t)=>{window.pause();window.seek(value>=duration?0:value);origin=performance.now()-t*1000;const tick=now=>{window.seek((now-origin)/1000);if(t<duration)raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);};
window.ready=document.fonts.load('16px Inter').then(()=>{window.seek(0);window.narrativeReady=true;});window.seek(0);`;
  const result=await build({stdin:{contents:entry,resolveDir:root,sourcefile:"narrative-entry.js"},bundle:true,write:false,format:"iife",platform:"browser",target:"es2022",legalComments:"inline"});
  const script=result.outputFiles[0].text.replaceAll("</script","<\\/script");
  const html=`<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${pattern.name} · 导演情境参考</title><style>@font-face{font-family:Inter;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900}html,body,#stage{margin:0;width:100%;height:100%;overflow:hidden;background:${pattern.palette==='carbon'?'#15181b':'#eee9df'}}svg{display:block;width:100%;height:100%}</style></head><body><div id="stage"></div><script>${script}</script></body></html>`;
  writeFileSync(join(root,"snippets",pattern.demoSnippet+".html"),html);
}
console.log(`Built ${patterns.length} self-contained director studies from the workbench renderer.`);
