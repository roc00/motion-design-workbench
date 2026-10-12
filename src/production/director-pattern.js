import { createController, clamp01, lerp, spring } from "../kit.js";

const n=v=>Number(v).toFixed(3);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const smooth=x=>{x=clamp01(x);return x*x*(3-2*x);};
const rect=(x,y,w,h,fill,r=12,extra="")=>`<rect x="${n(x)}" y="${n(y)}" width="${n(Math.max(.01,w))}" height="${n(Math.max(.01,h))}" rx="${n(Math.max(0,r))}" fill="${fill}" ${extra}/>`;
const text=(x,y,s,size=20,color="#28251f",extra="")=>`<text x="${n(x)}" y="${n(y)}" font-size="${size}" font-weight="650" fill="${color}" ${extra}>${esc(s)}</text>`;
const circle=(x,y,r,c,extra="")=>`<circle cx="${n(x)}" cy="${n(y)}" r="${n(Math.max(.01,r))}" fill="${c}" ${extra}/>`;
const line=(pts,c="#918b7d",w=2,extra="")=>`<polyline points="${pts.map(p=>p.map(n).join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const alpha=(a,s)=>`<g opacity="${n(clamp01(a))}">${s}</g>`;
const arrow=(x,y,color)=>line([[x-7,y-6],[x,y],[x-7,y+6]],color,2.5);
const cursor=(x,y)=>`<path d="M${n(x)} ${n(y)} l4 24 7-7 10-3z" fill="#faf6ee" stroke="#26251f" stroke-width="1.5"/>`;
const paper={bg:"#eee9df",fg:"#26251f",muted:"#797367",accent:"#e54834",panel:"#faf7f1",line:"#d0c8ba"};
const carbon={bg:"#15181b",fg:"#f3efe7",muted:"#a8aaa9",accent:"#6b88ff",panel:"#252b30",line:"#464c51"};

export function directorMoment(pattern,progress){
  const ms=clamp01(progress)*pattern.durationMs;
  const index=pattern.shots.findIndex(s=>ms>=s.fromMs&&ms<s.toMs);
  return pattern.shots[index<0?pattern.shots.length-1:index];
}

function windowBox(c,x,y,w,h,title){return `${rect(x,y,w,h,c.panel,15,'stroke="'+c.line+'"')}${text(x+20,y+30,title,12,c.muted)}${line([[x+15,y+44],[x+w-15,y+44]],c.line,1)}`;}
function check(x,y,c,r=12){return `${circle(x,y,r,c.accent)}${line([[x-r*.5,y],[x-r*.1,y+r*.35],[x+r*.5,y-r*.4]],c.bg,2.5)}`;}
function header(s,c,small){return `${text(38,61,s,small?27:38,c.fg)}${text(40,89,"DIRECTOR STUDY / CONCEPT",10,c.muted,'letter-spacing="1"')}`;}
function phases(pattern,t){return pattern.shots.map(s=>clamp01((t*1000-s.fromMs)/(s.toMs-s.fromMs)));}

function claim(c,t,ps,pattern){
  const b=pattern.shots[1].fromMs/1000,e=pattern.shots[2].fromMs/1000;
  const p=clamp01(spring(t-b,95,20)),proof=clamp01(spring(t-e,140,23));
  const x=lerp(450,340,p),y=lerp(120,108,p),w=lerp(110,265,p),h=lerp(158,214,p);
  let out=alpha(1-p,`${text(38,142,"LESS BUSY.",43,c.fg)}${text(38,196,"MORE DONE.",43,c.accent)}${text(40,231,"A claim needs a visible reason.",13,c.muted)}`);
  out+=alpha(p,`${header("One priority. A clear plan.",c,true)}${windowBox(c,38,116,246,206,"FORMA / TODAY")}${text(58,183,"Write the launch brief",18,c.fg)}${text(58,217,"Choose the next action",13,c.muted)}${rect(58,254,168,34,c.accent,17)}${text(78,276,"Show the priority",12,c.bg)}`);
  out+=`${rect(x,y,w,h,c.panel,16,'stroke="'+c.line+'"')}${circle(x+24,y+26,7,c.accent)}${text(x+21,y+69,p>.3?"PRIORITY":"ONE",p>.3?14:24,c.fg)}${text(x+21,y+126,"01",52,c.accent)}`;
  out+=alpha(proof,`${rect(x+13,y+145,w-26,48,c.accent,9)}${text(x+28,y+174,"One task, all attention.",15,c.bg)}${line([[275,272],[315,272],[315,y+169],[x,y+169]],c.accent,2)}${arrow(x,y+169,c.accent)}`);
  return out;
}
function action(c,t,ps,pattern){
  const b=pattern.shots[1].fromMs/1000,e=pattern.shots[2].fromMs/1000;
  const process=clamp01(spring(t-b,130,24)),result=clamp01(spring(t-e,110,22));
  let out=header(result>.3?"The input becomes a plan.":process>.3?"The system responds.":"A character makes a choice.",c,true);
  out+=windowBox(c,45,115,550,211,"BRIEF → PLAN");
  const typed="Launch a calm workspace.".slice(0,Math.floor(clamp01((t-.3)/1.6)*24));
  out+=alpha(1-result,`${rect(70,174,340,48,c.bg,9)}${text(86,204,typed,16,c.fg)}${rect(435,174,130,48,c.accent,24)}${text(458,204,process>.15?"Working":"Create",16,c.bg)}`);
  out+=alpha(process*(1-result),`${text(72,255,"Extract the goal",14,c.muted)}${line([[72,272],[560,272]],c.line,2)}${circle(72+clamp01((t-b)/1.5)*488,272,5,c.accent)}${text(72,298,"3 constraints · 1 direction",12,c.fg)}`);
  out+=alpha(result,`${text(73,184,"Launch brief",27,c.fg)}${text(73,216,"A calm space for focused work.",16,c.muted)}${rect(72,244,390,47,c.accent,9)}${text(92,273,"Next action: build the opening.",17,c.bg)}${check(529,264,c,21)}`);
  const cx=lerp(140,494,clamp01(spring(t-1.7,100,20))),cy=lerp(300,201,clamp01(spring(t-1.7,100,20)));
  out+=alpha(1-result,cursor(cx,cy));return out;
}
function context(c,t,ps,pattern){
  const b=pattern.shots[1].fromMs/1000,e=pattern.shots[2].fromMs/1000;
  const focus=clamp01(spring(t-b,65,17))*(1-clamp01(spring(t-e,80,19))),z=lerp(1,2.3,focus);
  // Virtual reframe: zoom around the known target; the scene itself remains unchanged.
  const tx=lerp(495,320,focus)-495*z,ty=lerp(189,230,focus)-189*z;
  let board=windowBox(c,44,106,552,220,"PROJECT MAP / SIX AREAS");
  const names=["Research","Outline","Draft","Review","Publish","Measure"];
  names.forEach((name,i)=>{const x=64+(i%3)*176,y=158+Math.floor(i/3)*79,selected=i===2;board+=rect(x,y,158,62,selected?c.accent:c.bg,9)+text(x+12,y+24,name,15,selected?c.bg:c.fg)+text(x+12,y+46,selected?(t>e?"Updated":"Priority"):"In context",10,selected?c.bg:c.muted);});
  let out=header(t>e?"Return with a changed understanding.":focus>.4?"Enter the important detail.":"First, establish the map.",c,true);
  out+=`<defs><clipPath id="context-stage"><rect x="0" y="105" width="640" height="245"/></clipPath></defs><g clip-path="url(#context-stage)"><g transform="translate(${n(tx)} ${n(ty)}) scale(${n(z)})">${board}</g></g>`;
  if(t>e)out+=alpha(clamp01(spring(t-e)),`${circle(561,168,7,c.fg)}${line([[547,144],[561,168],[582,144]],c.fg,2)}`);
  return out;
}
function state(c,t,ps,pattern){
  const b=pattern.shots[1].fromMs/1000,e=pattern.shots[2].fromMs/1000;
  const p=clamp01(spring(t-b,45,13)),done=clamp01(spring(t-e));
  let out=header(done>.4?"The same pieces. A better system.":p>.1?"Make the relationships visible.":"Scattered information.",c,true);
  const origins=[[146,207,-12],[349,159,9],[475,263,-7]],names=["BRIEF","DRAFT","REVIEW"];
  origins.forEach(([ox,oy,r],i)=>{const x=lerp(ox,138+i*182,p),y=lerp(oy,211,p),angle=lerp(r,0,p);out+=`<g transform="translate(${n(x)} ${n(y)}) rotate(${n(angle)})">${rect(-64,-52,128,104,i===1?c.accent:c.panel,12,'stroke="'+c.line+'"')}${circle(-36,-23,6,i===1?c.bg:c.accent)}${text(-44,15,names[i],18,i===1?c.bg:c.fg)}${text(-44,35,"Same object",9,i===1?c.bg:c.muted)}</g>`;});
  out+=alpha(p,`${line([[204,211],[254,211]],c.accent,3)}${arrow(254,211,c.accent)}${line([[386,211],[436,211]],c.accent,3)}${arrow(436,211,c.accent)}`);
  out+=alpha(done,`${text(111,312,"Organized into a visible sequence.",18,c.fg)}${check(531,306,c,13)}`);return out;
}
function compare(c,t,ps,pattern){
  const b=pattern.shots[1].fromMs/1000,e=pattern.shots[2].fromMs/1000;
  const explain=clamp01(spring(t-b,90,20)),confirm=clamp01(spring(t-e));
  let out=header(confirm>.3?"Less handoff. Same destination.":explain>.3?"Explain what changed.":"Compare the same task.",c,true);
  const ys=[137,187,237,287];const old=["Collect","Copy","Review","Publish"];
  out+=text(65,115,"BEFORE",12,c.muted)+text(405,115,"AFTER",12,c.accent);
  old.forEach((label,i)=>{const removed=i===1||i===2,fade=removed?1-explain*.65:1;out+=alpha(fade,`${rect(61,ys[i],175,35,c.panel,8)}${text(75,ys[i]+24,label,15,c.fg)}`);if(removed)out+=alpha(explain,line([[66,ys[i]+18],[225,ys[i]+18]],c.accent,2));});
  const y1=163,y2=259;out+=`${rect(389,y1,187,49,c.accent,9)}${text(410,y1+30,"Collect + review",15,c.bg)}${rect(389,y2,187,49,c.panel,9)}${text(410,y2+31,"Publish",17,c.fg)}${line([[480,y1+49],[480,y2]],c.accent,3)}`;
  out+=alpha(explain,line([[240,202],[308,202],[308,187],[380,187]],c.accent,2)+arrow(380,187,c.accent));
  out+=alpha(confirm,`${rect(268,252,75,60,c.accent,12)}${text(280,279,"4 → 2",17,c.bg)}${text(280,299,"steps",11,c.bg)}`);return out;
}
function selection(c,t,ps,pattern){
  const b=pattern.shots[1].fromMs/1000,e=pattern.shots[2].fromMs/1000;
  const choose=clamp01(spring(t-b,170,25)),detail=clamp01(spring(t-e,80,18));
  let out=header(detail>.4?"The chosen subject takes the stage.":choose>.2?"Give the choice a clear motive.":"Show the available directions.",c,true);
  [0,1,2].forEach(i=>{const selected=i===1,x=selected?lerp(237,146,detail):lerp(52+i*184,i===0?-160:690,detail),w=selected?lerp(164,350,detail):164,y=selected?lerp(126,110,detail):126,h=selected?lerp(184,213,detail):184;out+=alpha(selected?1:1-detail,`${rect(x,y,w,h,selected?c.accent:c.panel,13)}${text(x+17,y+36,["LOUD","CALM","PLAYFUL"][i],18,selected?c.bg:c.fg)}${circle(x+w/2,y+98,selected?25:16,selected?c.bg:c.accent)}${text(x+17,y+h-23,selected?(detail>.5?"Room for what matters.":"Selected direction"):"Alternative",11,selected?c.bg:c.muted)}`);if(selected)out+=alpha(choose*(1-detail),check(x+w-19,y+17,c,10));});
  out+=alpha(choose*(1-detail),cursor(324,279));out+=alpha(detail,`${text(518,173,"ONE",27,c.fg)}${text(518,198,"CHOICE",18,c.fg)}${line([[498,210],[582,210]],c.accent,3)}${text(512,242,"Same subject",10,c.muted)}`);return out;
}

const scenes={claim,action,context,state,compare,selection};
export function renderDirectorPattern(pattern,progress,namespace=pattern.id.replace(/[^a-z0-9]/gi,'-')){
  const t=clamp01(progress)*pattern.durationMs/1000,c=pattern.palette==="carbon"?carbon:paper;
  const body=scenes[pattern.demo](c,t,phases(pattern,t),pattern);
  return `<svg viewBox="0 0 640 360" role="img" aria-label="${esc(pattern.name)}导演情境演示" style="font-family:Inter,system-ui,sans-serif"><defs><pattern id="director-grain" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="4" cy="6" r=".45" fill="${c.fg}" opacity=".12"/></pattern></defs>${rect(0,0,640,360,c.bg,0)}${rect(0,0,640,360,"url(#director-grain)",0)}${body}</svg>`.replaceAll("director-grain",`${namespace}-grain`).replaceAll("context-stage",`${namespace}-context`);
}

let mountSerial=0;
export function mountDirectorPattern(host,pattern,{fps=24,initialProgress=0}={}){
  const namespace=`narrative-${++mountSerial}`;
  host.innerHTML='<div class="director-pattern-stage"></div>';
  const node=host.firstElementChild;
  const stage={destroy(){host.textContent="";}};
  const ctrl=createController(stage,{durationMs:pattern.durationMs,render:t=>{node.innerHTML=renderDirectorPattern(pattern,t,namespace);}} ,{initialT:initialProgress});
  let frame=0;
  const totalFrames=Math.round(pattern.durationMs/1000*fps);
  const renderFrame=f=>{frame=Math.max(0,Math.min(totalFrames,Math.round(f)));ctrl.seek(frame/totalFrames*pattern.durationMs);return{frame,totalFrames};};
  ctrl.onFrame(ms=>{frame=Math.round(ms/pattern.durationMs*totalFrames);api.onFrame?.(frame);});
  const api={get frame(){return frame;},totalFrames,play:()=>ctrl.play(),pause:()=>ctrl.pause(),seekFrame:renderFrame,renderFrame,destroy:()=>ctrl.destroy()};
  ctrl.onStateChange=s=>api.onStateChange?.(s);
  return api;
}
