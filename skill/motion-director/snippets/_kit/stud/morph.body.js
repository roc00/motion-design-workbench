
/* ============ CANVAS ============ */
const SZ=1080;
const cv=document.getElementById('c');
cv.width=SZ;cv.height=SZ;
const g=cv.getContext('2d');
const BG='#ECEAE4';

/* ============ STATES ============ */
const C=540;
const STATES=[
  {t:0,    cx:C,cy:C,w:300,h:100,r:50,fill:'#0A0A0A'},
  {t:1.7,  cx:C,cy:C,w:100,h:100,r:50,fill:'#0A0A0A'},
  {t:2.8,  cx:C,cy:C,w:100,h:100,r:50,fill:'#0A0A0A'},
  {t:4.0,  cx:C,cy:C,w:560,h:110,r:55,fill:'#0A0A0A'},
  {t:5.2,  cx:C,cy:C,w:150,h:84,r:42,fill:'#0A0A0A'},
  {t:6.4,  cx:C,cy:C,w:820,h:480,r:36,fill:'#0A0A0A'},
  {t:8.8,  cx:C,cy:C,w:820,h:480,r:36,fill:'#0A0A0A'},
  {t:11.0, cx:C,cy:C,w:720,h:240,r:28,fill:'#0A0A0A'},
  {t:12.6, cx:C,cy:C,w:520,h:96,r:48,fill:'#0A0A0A'},
  {t:13.9, cx:C,cy:C,w:300,h:100,r:50,fill:'#0A0A0A'}
];
function activeIndex(t){
  let i=0;
  for(let k=1;k<STATES.length;k++){if(t>=STATES[k].t)i=k;}
  return i;
}

/* ============ CONTENT RENDERERS ============ */
function contentButton(g,cx,cy,lt){
  g.fillStyle='#fff';g.font='600 38px Inter,system-ui';g.textAlign='center';g.textBaseline='middle';
  g.fillText('Generate',cx,cy+2);
}
function contentLoader(g,cx,cy,lt){
  g.save();g.translate(cx,cy);g.rotate(lt*3.2);
  g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=6;
  g.beginPath();g.arc(0,0,26,0,7);g.stroke();
  g.strokeStyle='#fff';g.beginPath();g.arc(0,0,26,-Math.PI/2,Math.PI/2);g.stroke();
  g.restore();
}
function contentCheck(g,cx,cy,lt){
  g.strokeStyle='#fff';g.lineWidth=7;g.lineCap='round';g.lineJoin='round';
  const p=clamp(lt*3);
  g.beginPath();
  g.moveTo(cx-20,cy+2);
  g.lineTo(cx-6,cy+16*Math.min(p,1));
  if(p>0.5)g.lineTo(cx+22,cy-16);
  g.stroke();
}
function contentSearch(g,cx,cy,lt){
  g.textAlign='left';g.textBaseline='middle';
  g.fillStyle='#fff';
  // magnifier
  g.strokeStyle='#fff';g.lineWidth=4;
  g.beginPath();g.arc(cx-210,cy,12,0,7);g.stroke();
  g.beginPath();g.moveTo(cx-200,cy+10);g.lineTo(cx-188,cy+22);g.stroke();
  g.font='500 32px Inter,system-ui';g.fillStyle='rgba(255,255,255,.72)';
  g.fillText('Search anything…',cx-165,cy+1);
}
function contentToggle(g,cx,cy,lt){
  const w=150,h=84,x=cx-w/2,y=cy-h/2;
  // track
  g.fillStyle='#fff';
  // knob slides
  const p=clamp(spring(lt-0.1,140,18));
  const kx=lerp(x+26,x+w-26,clamp(p*2+0.2));
  g.fillStyle='#fff';
  g.beginPath();g.arc(kx,cy,26,0,7);g.fill();
}
function contentPlayer(g,cx,cy,lt){
  const w=820,h=480,x=cx-w/2,y=cy-h/2;
  /* album gradient */
  const grd=g.createLinearGradient(x+44,y+40,x+150,y+150);
  grd.addColorStop(0,'#FF9A5B');grd.addColorStop(.5,'#FF5C7A');grd.addColorStop(1,'#8B5CF6');
  g.fillStyle=grd;rr(g,x+44,y+44,110,110,18);g.fill();
  /* title */
  g.textAlign='left';g.fillStyle='#fff';g.font='600 34px Inter,system-ui';
  g.fillText('motion study 02',x+184,y+78);
  g.fillStyle='rgba(255,255,255,.5)';g.font='400 26px Inter,system-ui';
  g.fillText('made in code',x+184,y+114);
  /* progress */
  const py=y+240,px0=x+50,px1=x+w-50;
  const prog=clamp(lt/6);
  g.strokeStyle='rgba(255,255,255,.2)';g.lineWidth=5;g.lineCap='round';
  g.beginPath();g.moveTo(px0,py);g.lineTo(px1,py);g.stroke();
  g.strokeStyle='#fff';
  g.beginPath();g.moveTo(px0,py);g.lineTo(lerp(px0,px1,prog),py);g.stroke();
  g.fillStyle='#fff';g.beginPath();g.arc(lerp(px0,px1,prog),py,9,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.6)';g.font='400 22px Inter';
  g.fillText('0:48',px0,py-26);
  g.textAlign='right';g.fillText('-2:11',px1,py-26);
  /* controls */
  g.textAlign='center';g.fillStyle='#fff';g.strokeStyle='#fff';
  const ccy=y+340;
  // rewind
  g.beginPath();g.moveTo(cx-80,ccy-12);g.lineTo(cx-80,ccy+12);g.lineTo(cx-58,ccy);g.closePath();g.fill();
  g.beginPath();g.moveTo(cx-104,ccy-12);g.lineTo(cx-104,ccy+12);g.lineTo(cx-82,ccy);g.closePath();g.fill();
  // play/pause morph
  if(lt<2){
    g.beginPath();g.moveTo(cx-8,ccy-14);g.lineTo(cx-8,ccy+14);g.lineTo(cx+14,ccy);g.closePath();g.fill();
  }else{
    g.fillRect(cx-10,ccy-14,8,28);g.fillRect(cx+4,ccy-14,8,28);
  }
  // forward
  g.beginPath();g.moveTo(cx+58,ccy-12);g.lineTo(cx+58,ccy+12);g.lineTo(cx+80,ccy);g.closePath();g.fill();
  g.beginPath();g.moveTo(cx+82,ccy-12);g.lineTo(cx+82,ccy+12);g.lineTo(cx+104,ccy);g.closePath();g.fill();
}
function contentChart(g,cx,cy,lt){
  const w=820,h=480,x=cx-w/2,y=cy-h/2;
  g.textAlign='left';g.fillStyle='#fff';g.font='600 32px Inter,system-ui';
  g.fillText('Weekly active',x+50,y+52);
  g.fillStyle='rgba(255,255,255,.5)';g.font='400 24px Inter';
  g.fillText('Last 8 days',x+50,y+84);
  /* axis */
  const ay0=y+120,ay1=y+h-60,ax0=x+60,ax1=x+w-60;
  g.strokeStyle='rgba(255,255,255,.15)';g.lineWidth=2;
  for(let i=0;i<4;i++){
    const yy=lerp(ay0,ay1,i/3);
    g.beginPath();g.moveTo(ax0,yy);g.lineTo(ax1,yy);g.stroke();
  }
  /* area line */
  const N=9;
  const draw=clamp(lt*1.2);
  g.beginPath();
  for(let k=0;k<N;k++){
    const u=k/(N-1);
    const v=0.45+0.3*Math.sin(k*0.9)+0.12*k;
    const px=lerp(ax0,ax1,u),py=lerp(ay1,ay0,clamp(v));
    if(k<=draw*(N-1)){if(k===0)g.moveTo(px,py);else g.lineTo(px,py);}
  }
  g.strokeStyle='#fff';g.lineWidth=4;g.lineJoin='round';g.stroke();
  /* dots */
  for(let k=0;k<N;k++){
    const u=k/(N-1);
    const v=0.45+0.3*Math.sin(k*0.9)+0.12*k;
    const px=lerp(ax0,ax1,u),py=lerp(ay1,ay0,clamp(v));
    if(k<=draw*(N-1)){g.fillStyle='#fff';g.beginPath();g.arc(px,py,5,0,7);g.fill();}
  }
}
function contentPalette(g,cx,cy,lt){
  const w=720,h=240,x=cx-w/2,y=cy-h/2;
  g.fillStyle='#fff';
  g.beginPath();g.arc(x+46,y+46,12,0,7);g.stroke();
  g.beginPath();g.moveTo(x+56,y+56);g.lineTo(x+68,y+68);g.stroke();
  g.textAlign='left';g.font='500 30px Inter,system-ui';g.fillStyle='rgba(255,255,255,.7)';
  g.fillText('Type a command or search…',x+90,y+54);
  const rows=['New project','Switch workspace','Export settings'];
  rows.forEach((r,i)=>{
    const ry=y+100+i*42;
    const hl=i===0;
    g.fillStyle=hl?'rgba(255,255,255,.14)':'transparent';
    if(hl){rr(g,x+24,ry-24,w-48,36,10);g.fill();}
    g.fillStyle=hl?'#fff':'rgba(255,255,255,.6)';g.font='400 27px Inter';
    g.fillText(r,x+44,ry);
    g.textAlign='right';g.fillStyle='rgba(255,255,255,.4)';g.font='400 22px Inter';
    g.fillText('⌘'+(i+5),x+w-44,ry);
    g.textAlign='left';
  });
}
function contentToast(g,cx,cy,lt){
  g.strokeStyle='#fff';g.lineWidth=5;g.lineCap='round';g.lineJoin='round';
  g.beginPath();g.moveTo(cx-200,cy-2);g.lineTo(cx-188,cy+10);g.lineTo(cx-170,cy-12);g.stroke();
  g.fillStyle='#fff';g.font='500 32px Inter';g.textAlign='left';
  g.fillText('Saved · changes deployed',cx-148,cy+2);
}
const CONTENTS=[contentButton,contentLoader,contentCheck,contentSearch,contentToggle,contentPlayer,contentChart,contentPalette,contentToast,contentButton];

/* ============ CURSOR ============ */
const WP=[
 {t:-0.6,x:820,y:700},
 {t:1.2,x:610,y:500},
 {t:1.5,x:540,y:540},
 {t:2.1,x:660,y:650},
 {t:3.7,x:590,y:545},
 {t:3.95,x:540,y:540},
 {t:4.5,x:680,y:660},
 {t:5.0,x:610,y:540},
 {t:5.15,x:612,y:540},
 {t:5.7,x:690,y:680},
 {t:6.1,x:580,y:560},
 {t:6.3,x:560,y:610},
 {t:7.0,x:260,y:590},
 {t:7.6,x:600,y:590},
 {t:8.2,x:700,y:680},
 {t:9.4,x:580,y:540},
 {t:9.6,x:560,y:540},
 {t:10.3,x:700,y:680},
 {t:10.8,x:580,y:560},
 {t:11.0,x:540,y:540},
 {t:11.8,x:700,y:680},
 {t:12.4,x:560,y:540},
 {t:13.2,x:780,y:700},
 {t:14.5,x:820,y:700}
];
const CLICKS=[1.5,3.95,5.15,6.3,9.6,11.0,12.4];
function clickPulse(t){
  let p=0;
  for(const ct of CLICKS){if(t>=ct&&t<ct+0.35)p=Math.max(p,1-(t-ct)/0.35);}
  return p;
}

/* ============ DRAW ============ */
function draw(t){
  g.fillStyle=BG;g.fillRect(0,0,SZ,SZ);
  /* subtle vignette */
  const vg=g.createRadialGradient(C,C,300,C,C,780);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(60,55,45,.10)');
  g.fillStyle=vg;g.fillRect(0,0,SZ,SZ);

  const geo=morphGeo(t,STATES);
  const x=geo.cx-geo.w/2,y=geo.cy-geo.h/2;
  /* shadow */
  g.fillStyle=geo.fill;
  g.shadowColor='rgba(20,18,12,.35)';g.shadowBlur=50;g.shadowOffsetY=18;
  rr(g,x,y,geo.w,geo.h,geo.r);g.fill();
  g.shadowBlur=0;g.shadowOffsetY=0;g.shadowColor='transparent';

  /* content */
  g.save();
  rr(g,x,y,geo.w,geo.h,geo.r);g.clip();
  const ai=activeIndex(t);
  const settle=morphSettle(t,STATES);
  const na=morphNewAlpha(t,STATES);
  // old content
  if(settle>0.02&&CONTENTS[ai]){
    g.globalAlpha=settle;
    CONTENTS[ai](g,geo.cx,geo.cy,t-STATES[ai].t);
  }
  // new content
  if(na>0.02&&ai<STATES.length-1&&CONTENTS[ai+1]){
    g.globalAlpha=na;
    CONTENTS[ai+1](g,geo.cx,geo.cy,t-STATES[ai+1].t);
  }
  g.globalAlpha=1;
  g.restore();

  /* cursor */
  const cp=cursorPos(t,WP);
  drawCursor(g,cp.x,cp.y,clickPulse(t));
}
