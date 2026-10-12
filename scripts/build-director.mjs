import {readFileSync,writeFileSync,mkdirSync,existsSync,copyFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(join(root,p),'utf8');
const source=JSON.parse(read('data/cinematic-shots.json')).sequences.filter(s=>s.collection==='director');
const plan=JSON.parse(read('studio/plan.json'));plan.films=source.filter(s=>s.sequenceKind==='film');plan.excerpts=source.filter(s=>s.sequenceKind==='excerpt');plan.segments=source.filter(s=>s.sequenceKind==='segment');writeFileSync(join(root,'studio/plan.json'),JSON.stringify(plan,null,2)+'\n');
const font=(file,family)=>`@font-face{font-family:${family};src:url(data:font/ttf;base64,${readFileSync(join(root,'studio/assets',file)).toString('base64')}) format('truetype');font-display:block;}`;
const fonts=font('ArchivoBlack-Regular.ttf','Display')+font('IBMPlexMono-Regular.ttf','Mono')+font('Chinese-captions.ttf','Chinese');
const gsap=read(existsSync(join(root,'node_modules/gsap/dist/gsap.min.js'))?'node_modules/gsap/dist/gsap.min.js':'studio/assets/gsap.min.js');
const core=read('studio/lib/director.js'),player=read('studio/lib/player.js');
mkdirSync(join(root,'films'),{recursive:true});
for(const s of source){
  const duration=s.durationMs/1000,id=s.snippet;
  const renderCore=s.film==='collection'?read('studio/lib/collection.js'):core;
  const html=`<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${s.name}</title><style>${fonts}*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:${s.film==='forma'?'#eee9df':'#141719'}}#stage{width:1920px;height:1080px;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(var(--fit,1));transform-origin:center}canvas{position:absolute;inset:0;width:100%;height:100%}</style></head><body><div id="stage" data-composition-id="${id}" data-width="1920" data-height="1080" data-duration="${duration}"><canvas id="c" width="1920" height="1080" class="clip" data-start="0" data-duration="${duration}" data-track-index="0" aria-label="${s.name}"></canvas>${s.sequenceKind!=='segment'?`<audio class="clip" data-start="0" data-duration="${duration}" data-track-index="1" data-media-start="${s.sourceStart}" src="../films/director-${s.film}.wav" muted></audio>`:''}</div><script>${gsap}</script><script>window.STUDIO_CONFIG=${JSON.stringify({film:s.film,start:s.sourceStart,end:s.sourceEnd})};</script><script>${renderCore}</script><script>${player}</script><script>function fit(){document.documentElement.style.setProperty('--fit',Math.min(innerWidth/1920,innerHeight/1080));}fit();addEventListener('resize',fit);</script></body></html>`;
  writeFileSync(join(root,'snippets',id+'.html'),html);
  if(s.sequenceKind==='film'){
    writeFileSync(join(root,'films',id+'.html'),html);
    // Clean HyperFrames entry: transport and managed audio are owned by the framework.
    const project=join(root,'studio/hyperframes',s.film);
    mkdirSync(project,{recursive:true});
    writeFileSync(join(project,'gsap.min.js'),gsap);
    copyFileSync(join(root,'films',id+'.wav'),join(project,'score.wav'));
    const runtime=`const canvas=document.querySelector('canvas'),clock={time:0};window.__timelines=window.__timelines||{};const tl=gsap.timeline({paused:true});tl.to(clock,{time:15,duration:15,ease:'none',onUpdate:()=>StudioDirector.render(canvas,'${s.film}',clock.time)},0);window.__timelines['${id}']=tl;window.seek=t=>{tl.seek(t,false);StudioDirector.render(canvas,'${s.film}',t);};StudioDirector.render(canvas,'${s.film}',0);window.ready=Promise.all(['Display','Mono','Chinese'].map(f=>document.fonts.load('16px '+f))).then(()=>window.seek(0));`;
    writeFileSync(join(project,'index.html'),`<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8"><title>${s.name}</title><style>${fonts}body{margin:0}#stage{position:relative;width:1920px;height:1080px}canvas{width:1920px;height:1080px;display:block}</style></head><body><div id="stage" data-composition-id="${id}" data-start="0" data-width="1920" data-height="1080" data-duration="15"><canvas id="${id}-canvas" width="1920" height="1080" class="clip" data-start="0" data-duration="15" data-track-index="0"></canvas><audio id="${id}-score" class="clip" data-start="0" data-duration="15" data-track-index="1" src="score.wav"></audio></div><script src="gsap.min.js"></script><script>${core}</script><script>${runtime}</script></body></html>`);
  }
}
console.log(`Built ${source.length} director references from one renderer.`);
