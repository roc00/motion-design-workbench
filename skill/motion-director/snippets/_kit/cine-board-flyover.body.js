/* ===================== FILM: BOARD FLYOVER (manual 3D) ===================== */
const F = 760;
const B = { cx:640, cy:560 };
/* Project a 3D board point. rotX: tilt (flat=high, head-on=low). push: forward dolly. */
function proj(x,y,z, rotX, push){
  const cxr=Math.cos(rotX), sxr=Math.sin(rotX);
  const y1 = y*cxr - z*sxr;
  const z1 = y*sxr + z*cxr;
  const d = z1 + push;
  const s = F/d;
  return { x: B.cx + x*s, y: B.cy + y1*s, s, d };
}
/* Build board data: 3 columns x cards */
const COLS = [
  { x:-430, title:'待办 To-do', cards:['设计落地页','接入埋点','修复支付 bug','文案审校'] },
  { x:0, title:'进行中 Doing', cards:['登录模块','看板拖拽'] },
  { x:430, title:'已完成 Done', cards:['需求评审','原型设计','CI 流水线','接口联调'] },
];
function cardCorners(col,ci, rotX, push, lift){
  const cw=360, ch=120, gap=16;
  const top = -60;                 // board surface y (negative = away)
  const y0 = top - ci*(ch+gap);
  const zz = lift||0;
  const a = proj(col.x-cw/2, y0-ch, zzz(zz), rotX, push);
  const b1 = proj(col.x+cw/2, y0-ch, zzz(zz), rotX, push);
  const c2 = proj(col.x+cw/2, y0, zzz(zz), rotX, push);
  const d3 = proj(col.x-cw/2, y0, zzz(zz), rotX, push);
  return { a, b:b1, c:c2, d:d3 };
}
function zzz(z){ return z; }
function drawQuad(q, fill, stroke, lw){
  g.beginPath();g.moveTo(q.a.x,q.a.y);g.lineTo(q.b.x,q.b.y);g.lineTo(q.c.x,q.c.y);
  g.lineTo(q.d.x,q.d.y);g.closePath();
  if(fill){g.fillStyle=fill;g.fill();}
  if(stroke){g.strokeStyle=stroke;g.lineWidth=lw||1;g.stroke();}
}
function boardWorld(t, rotX, push){
  g.fillStyle='#0b0f18';g.fillRect(0,0,W,H);
  const gr=g.createRadialGradient(W*0.5,H*0.35,100,W*0.5,H*0.5,800);
  gr.addColorStop(0,'#101a2c');gr.addColorStop(1,'#060912');g.fillStyle=gr;g.fillRect(0,0,W,H);
}
function drawBoard(rotX, push, t, opts){
  opts = opts||{};
  /* floor grid */
  g.save();g.globalAlpha=0.25;
  for(let gx=-900;gx<=900;gx+=180){
    const p1=proj(gx, 40, 0, rotX, push), p2=proj(gx,-1200,0,rotX,push);
    g.strokeStyle='#3a5a8a';g.lineWidth=1;
    g.beginPath();g.moveTo(p1.x,p1.y);g.lineTo(p2.x,p2.y);g.stroke();
  }
  for(let gy=-1200;gy<=40;gy+=180){
    const p1=proj(-900,gy,0,rotX,push), p2=proj(900,gy,0,rotX,push);
    g.beginPath();g.moveTo(p1.x,p1.y);g.lineTo(p2.x,p2.y);g.stroke();
  }
  g.restore();
  /* board surface */
  const surf={ a:proj(-620,40,0,rotX,push), b:proj(620,40,0,rotX,push),
    c:proj(620,-1150,0,rotX,push), d:proj(-620,-1150,0,rotX,push) };
  drawQuad(surf,'rgba(20,30,50,.85)','rgba(90,130,190,.35)',1.5);
  /* column divider lines + headers */
  for(const col of COLS){
    const p1=proj(col.x,40,0,rotX,push), p2=proj(col.x,-1150,0,rotX,push);
    g.save();g.globalAlpha=0.18;g.strokeStyle='#6a8fc0';g.lineWidth=1;
    g.beginPath();g.moveTo(p1.x,p1.y);g.lineTo(p2.x,p2.y);g.stroke();g.restore();
    const h = proj(col.x, -1090, 6, rotX, push);
    g.save();
    g.fillStyle=C.fg;g.font='700 '+(Math.round(26*h.s))+'px Inter';
    g.textAlign='center';g.textBaseline='middle';
    g.fillText(col.title, h.x, h.y);
    g.restore();
  }
  /* cards */
  const all=[];
  for(let ci=0;ci<COLS.length;ci++){
    const col=COLS[ci];
    for(let k=0;k<col.cards.length;k++){
      all.push({ci, k, col, text:col.cards[k]});
    }
  }
  all.sort((p,q)=>{ const pa=cardCorners(p.col,p.k,rotX,push).a, qa=cardCorners(q.col,q.k,rotX,push).a; return qa.d-pa.d; });
  for(const item of all){
    const base = item.ci*1.2 + item.k*0.5;
    const pop = opts.appear===undefined?1:clamp(opts.appear - base*0.12);
    if(pop<=0)continue;
    let lift=0;
    if(opts.drag && item.ci===0 && item.k===1){ lift=opts.drag; }
    const q=cardCorners(item.col,item.k,rotX,push,lift);
    const depth=q.a.s;
    const dragged = lift>0;
    g.save();g.globalAlpha=pop;
    if(dragged){g.shadowColor='rgba(69,209,230,.6)';g.shadowBlur=30;g.shadowOffsetY=-10;}
    drawQuad(q, dragged?'rgba(69,209,230,.95)':'rgba(226,233,243,.95)',
      dragged?'#bff4fa':'rgba(140,165,205,.55)', 1.2);
    g.shadowBlur=0;
    /* accent bar */
    const acc=item.ci===2?C.cyan:(item.ci===1?C.warm:C.indigo);
    const bL=q.a, bR=q.b;
    g.strokeStyle=acc;g.lineWidth=Math.max(2,4*depth);g.lineCap='round';
    g.beginPath();g.moveTo(bL.x+12*depth,bL.y+14*depth);g.lineTo(bR.x-12*depth,bR.y+14*depth);g.stroke();
    /* text */
    const ctr=proj(item.col.x, -60-item.k*136, lifted(lift), rotX, push);
    g.fillStyle='#10182a';g.font='800 '+Math.round(22*depth)+'px Inter';
    g.textAlign='center';g.textBaseline='middle';
    g.fillText(item.text, ctr.x, ctr.y);
    g.restore();
  }
}
function lifted(z){return z;}
function scBF1(t){ boardWorld(t); drawBoard(1.05, 1100, t, {appear:1}); }
function scBF2(t){
  const e=easeInOutCubic(clamp(t/3));
  const rot=lerp(1.05,0.55,e), push=lerp(1100,900,e);
  boardWorld(t);drawBoard(rot,push,t,{appear:1});
}
function scBF3(t){
  const e=easeInOutCubic(clamp(t/3));
  const rot=lerp(0.55,0.42,e), push=lerp(900,820,e);
  boardWorld(t);drawBoard(rot,push,t,{appear:clamp(spring(t-0.2,90,16))});
}
function scBF4(t){
  const e=easeInOutCubic(clamp(t/3));
  const rot=lerp(0.42,0.40,e), push=lerp(820,820,e);
  const drag=clamp(spring(t-0.3,70,15));
  boardWorld(t);drawBoard(rot,push,t,{appear:1, drag:drag*120});
}
function scBF5(t){
  boardWorld(t);drawBoard(0.5,880,t,{appear:1});
  const a=clamp(spring(t-0.3,100,15));
  g.save();g.globalAlpha=a;
  g.fillStyle=C.fg;g.font='800 54px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillText('一块看板，掌握全局',640,120);
  g.restore();
}
const SCENES = [
  { from:0, to:3, draw:scBF1, out:'match-cut' },
  { from:3, to:6, draw:scBF2, out:'match-cut' },
  { from:6, to:9, draw:scBF3, out:'match-cut' },
  { from:9, to:12, draw:scBF4, out:'match-cut' },
  { from:12, to:15, draw:scBF5, out:'hard-cut' },
];
