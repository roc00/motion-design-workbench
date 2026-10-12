/* ===================== FILM: ORBIT INTEGRATIONS ===================== */
const O = { cx:640, cy:360, R:250 };
const INTEG = ['GitHub','Slack','Figma','Vercel','Linear','Notion','Stripe','Postgres'];
const INTEG_COLOR = { GitHub:'#e0e3ea', Slack:'#7cc3ff', Figma:'#f0b95c', Vercel:'#eef2f7',
  Linear:'#7c8cff', Notion:'#e8e4d8', Stripe:'#8ac6ff', Postgres:'#45d1e6' };
function orbitPos(i, rot, k){
  const n = INTEG.length;
  const a = i/n*6.28 + rot;
  const x = O.cx + Math.cos(a)*O.R;
  const y = O.cy + Math.sin(a)*O.R*0.46;
  const z = Math.sin(a);
  return { x, y, z, a };
}
function orbitWorld(t){
  g.fillStyle='#0a0e17';g.fillRect(0,0,W,H);
  const gr=g.createRadialGradient(O.cx,O.cy,40,O.cx,O.cy,620);
  gr.addColorStop(0,'#111b2e');gr.addColorStop(1,'#070a12');g.fillStyle=gr;g.fillRect(0,0,W,H);
}
function drawChip(x,y,z,name,scale,glow){
  const w=120*scale,h=44*scale;
  g.save();
  if(glow){g.shadowColor='rgba(69,209,230,.7)';g.shadowBlur=24;}
  g.fillStyle=glow?'rgba(255,255,255,.96)':'rgba(22,30,46,.92)';
  rr(x-w/2,y-h/2,w,h,12);g.fill();
  g.shadowBlur=0;
  g.strokeStyle=glow?C.cyan:'rgba(120,150,190,.5)';g.lineWidth=1.4;
  rr(x-w/2,y-h/2,w,h,12);g.stroke();
  const dot=INTEG_COLOR[name];
  g.fillStyle=glow?dot:dot;g.globalAlpha=glow?1:0.9;
  g.beginPath();g.arc(x-w/2+18*scale,y,5*scale,0,6.28);g.fill();
  g.fillStyle=glow?'#0e1525':'#dfe6f2';g.font='700 '+Math.round(15*scale)+'px Inter';
  g.textAlign='left';g.textBaseline='middle';
  g.fillText(name, x-w/2+30*scale, y);
  g.restore();
}
function scOHub(t){
  orbitWorld(t);
  /* hero present at first frame; subtle pulse only */
  const p=1;
  /* orbit rings */
  g.strokeStyle='rgba(90,130,190,.28)';g.lineWidth=1.5;
  g.beginPath();g.ellipse(O.cx,O.cy,O.R,O.R*0.46,0,0,6.28);g.stroke();
  g.strokeStyle='rgba(90,130,190,.15)';
  g.beginPath();g.ellipse(O.cx,O.cy,O.R*0.7,O.R*0.7*0.46,0,0,6.28);g.stroke();
  /* center hub */
  const pulse=1+Math.sin(t*2)*0.015;
  g.save();g.translate(O.cx,O.cy);g.scale(pulse,pulse);g.translate(-O.cx,-O.cy);
  g.fillStyle='#101a2c';g.shadowColor='rgba(69,209,230,.5)';g.shadowBlur=30;
  g.beginPath();g.arc(O.cx,O.cy,62,0,6.28);g.fill();
  g.shadowBlur=0;g.strokeStyle=C.cyan;g.lineWidth=2.5;g.stroke();
  g.fillStyle=C.fg;g.font='800 26px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillText('Hub',O.cx,O.cy-8);
  g.fillStyle=C.muted;g.font='600 13px Inter';g.fillText('已连接',O.cx,O.cy+14);
  g.restore();
}
function scOChips(t){
  orbitWorld(t);
  const rot = -0.2 + t*0.18;
  g.strokeStyle='rgba(90,130,190,.28)';g.lineWidth=1.5;
  g.beginPath();g.ellipse(O.cx,O.cy,O.R,O.R*0.46,0,0,6.28);g.stroke();
  const list=[];
  for(let i=0;i<INTEG.length;i++){
    const arrive=clamp(spring(t-0.3-i*0.12,110,16));
    list.push({i,arrive,pos:orbitPos(i,rot)});
  }
  list.sort((a,b)=>a.pos.z-b.pos.z);
  /* hub */
  g.fillStyle='#101a2c';g.beginPath();g.arc(O.cx,O.cy,62,0,6.28);g.fill();
  g.strokeStyle=C.cyan;g.lineWidth=2.5;g.stroke();
  g.fillStyle=C.fg;g.font='800 26px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillText('Hub',O.cx,O.cy-8);g.fillStyle=C.muted;g.font='600 13px Inter';
  g.fillText('8 个应用',O.cx,O.cy+14);
  for(const it of list){
    if(it.arrive<=0)continue;
    const scale=0.5+0.5*it.arrive;
    const from={x:O.cx,y:O.cy};
    const x=lerp(from.x,it.pos.x,it.arrive),y=lerp(from.y,it.pos.y,it.arrive);
    /* connector */
    g.save();g.globalAlpha=it.arrive*0.35;g.strokeStyle=C.muted;g.lineWidth=1;
    g.beginPath();g.moveTo(O.cx,O.cy);g.lineTo(it.pos.x,it.pos.y);g.stroke();g.restore();
    drawChip(x,y,it.pos.z,INTEG[it.i],scale,false);
  }
}
function scOFocus(t){
  orbitWorld(t);
  const rot=0.2;
  g.strokeStyle='rgba(90,130,190,.2)';g.lineWidth=1.5;
  g.beginPath();g.ellipse(O.cx,O.cy,O.R,O.R*0.46,0,0,6.28);g.stroke();
  for(let i=0;i<INTEG.length;i++){
    const p=orbitPos(i,rot);
    if(i===0)continue;
    g.save();g.globalAlpha=0.4;g.strokeStyle=C.muted;g.lineWidth=1;
    g.beginPath();g.moveTo(O.cx,O.cy);g.lineTo(p.x,p.y);g.stroke();g.restore();
    drawChip(p.x,p.y,p.z,INTEG[i],0.85,false);
  }
  g.fillStyle='#101a2c';g.beginPath();g.arc(O.cx,O.cy,62,0,6.28);g.fill();
  g.strokeStyle=C.cyan;g.lineWidth=2;g.stroke();
  g.fillStyle=C.fg;g.font='800 24px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillText('Hub',O.cx,O.cy);
  /* highlighted GitHub chip with bright connector */
  const p=orbitPos(0,rot);
  const pulse=clamp(spring(t-0.2,110,17));
  g.save();g.strokeStyle=C.cyan;g.lineWidth=2.5;g.globalAlpha=p;
  g.setLineDash([6,5]);g.beginPath();g.moveTo(O.cx,O.cy);g.lineTo(p.x,p.y);g.stroke();
  g.setLineDash([]);g.restore();
  drawChip(p.x,p.y,p.z,'GitHub',1+pulse*0.12,true);
}
function scOFlow(t){
  orbitWorld(t);
  const rot=0.2;
  for(let i=0;i<INTEG.length;i++){
    const p=orbitPos(i,rot);
    if(i===0)continue;
    drawChip(p.x,p.y,p.z,INTEG[i],0.82,false);
  }
  g.fillStyle='#101a2c';g.beginPath();g.arc(O.cx,O.cy,62,0,6.28);g.fill();
  g.strokeStyle=C.cyan;g.lineWidth=2;g.stroke();
  g.fillStyle=C.fg;g.font='800 24px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillText('Hub',O.cx,O.cy);
  const p=orbitPos(0,rot);
  drawChip(p.x,p.y,p.z,'GitHub',1,true);
  /* flowing data packets */
  for(let k=0;k<4;k++){
    const ph=((t*0.6+k*0.25)%1);
    const x=lerp(p.x,O.cx,ph),y=lerp(p.y,O.cy,ph);
    g.fillStyle=C.cyan;g.globalAlpha=Math.sin(ph*Math.PI)*0.9;
    g.beginPath();g.arc(x,y,4,0,6.28);g.fill();
  }
  g.globalAlpha=1;
}
function scOLockup(t){
  orbitWorld(t);
  const a=spring(t-0.2,100,15);
  for(let i=0;i<INTEG.length;i++){
    const p=orbitPos(i,0.2);
    g.save();g.globalAlpha=0.5;drawChip(p.x,p.y,p.z,INTEG[i],0.8,false);g.restore();
  }
  g.fillStyle='#101a2c';g.beginPath();g.arc(O.cx,O.cy,58,0,6.28);g.fill();
  g.strokeStyle=C.cyan;g.lineWidth=2;g.stroke();
  g.fillStyle=C.fg;g.font='800 22px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillText('Hub',O.cx,O.cy);
  g.save();g.globalAlpha=a;
  g.fillStyle=C.fg;g.font='800 48px Inter';g.textAlign='center';
  g.fillText('一处接入，处处协同',640,640);
  g.restore();
}
const SCENES = [
  { from:0, to:2.6, draw:scOHub, out:'match-cut' },
  { from:2.6, to:6.2, draw:scOChips, out:'match-cut' },
  { from:6.2, to:9.4, draw:scOFocus, out:'match-cut' },
  { from:9.4, to:12.2, draw:scOFlow, out:'match-cut' },
  { from:12.2, to:15, draw:scOLockup, out:'hard-cut' },
];
