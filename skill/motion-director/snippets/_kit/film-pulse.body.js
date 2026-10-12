/* ===================== FILM 1 · PULSE (dark, dev observability) ===================== */
const CX=W*0.5;

/* scene 1: hook — big word PULSE, right third; complete at t=0 */
function f1Hook(t){
  const camX=Math.sin(t*0.4)*16,camY=Math.cos(t*0.3)*12;
  drawWorld('particle-field',t,camX,camY);
  /* push: zoom slowly into the word */
  const z=1+clamp(t/2.5)*0.10;
  g.save();
  g.translate(W*0.52,H*0.46);g.scale(z,z);g.translate(-W*0.52,-H*0.46);
  /* word fully present at first frame */
  g.font='800 178px Inter,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillStyle=C.fg;g.fillText('PULSE',W*0.52,H*0.46);
  /* accent underline draws */
  const ul=spring(t-0.1,120,18);
  const ux=W*0.52-290,uy=H*0.46+120;
  g.fillStyle=C.cyan;g.fillRect(ux,uy,580*ul,8);
  g.fillStyle=C.warm;g.fillRect(ux+580*ul,uy,11,8);
  /* small kicker */
  const k=spring(t-0.5,100,15);
  g.fillStyle=C.muted;g.font='600 36px Inter';g.globalAlpha=k;
  g.fillText('让每一次信号，都被看见',W*0.52,H*0.46+200);
  g.globalAlpha=1;
  g.restore();
}

/* scene 2: monitoring dashboard — card left third, chart draws */
function f2Dash(t){
  const camX=50+Math.sin(t*0.5)*13,camY=Math.cos(t*0.4)*9;
  drawWorld('grid',t,camX,camY);
  const z=1+clamp(t/3)*0.06;
  g.save();
  const bx=W*0.5,by=H*0.44;
  g.translate(bx,by);g.scale(z,z);g.translate(-bx,-by);
  const x=120,y=470,pw=840,ph=1020;
  const r=spring(t-0.1,130,19);
  g.globalAlpha=clamp(r*1.2);
  g.fillStyle='rgba(11,17,30,.93)';g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=40;g.shadowOffsetY=16;
  rr(x,y,pw,ph,24);g.fill();
  g.shadowBlur=0;g.shadowOffsetY=0;g.shadowColor='transparent';
  g.strokeStyle='rgba(120,150,200,.22)';g.lineWidth=1.5;rr(x,y,pw,ph,24);g.stroke();
  /* header */
  const hd=spring(t-0.3,140,20);
  g.fillStyle=C.fg;g.font='800 44px Inter';g.textAlign='left';
  g.fillText('实时监控',x+40,y+74);
  g.fillStyle=C.green;g.font='600 26px Inter';
  g.fillText('● 在线',x+pw-130,y+70);
  /* metrics rows */
  const rows=[['请求','1,204/s',C.fg],['延迟','38 ms',C.cyan],['错误','0.02%',C.warm],['吞吐','86 MB',C.fg]];
  for(let i=0;i<rows.length;i++){
    const p=spring(t-0.45-i*0.13,120,17);
    const ry=y+150+i*120;
    g.globalAlpha=p;
    g.fillStyle='rgba(255,255,255,.05)';rr(x+34,ry-38,pw-68,92,14);g.fill();
    g.fillStyle=rows[i][2];g.font='700 34px Inter';
    g.fillText(rows[i][0],x+64,ry+8);
    g.textAlign='right';g.fillText(rows[i][1],x+pw-64,ry+8);g.textAlign='left';
  }
  g.globalAlpha=1;
  /* divider */
  const dv=spring(t-0.9,100,15);
  g.globalAlpha=dv;
  g.strokeStyle='rgba(120,150,200,.18)';g.lineWidth=1;
  g.beginPath();g.moveTo(x+40,y+650);g.lineTo(x+pw-40,y+650);g.stroke();
  g.fillStyle=C.muted;g.font='600 28px Inter';
  g.fillText('近 24 小时趋势',x+40,y+700);
  /* sparkline */
  const sp=clamp(spring(t-1.0,90,14));
  const pts=24,gx0=x+40,gx1=x+pw-40,gy0=y+740,gy1=y+960;
  g.beginPath();
  for(let k=0;k<pts;k++){
    const u=k/(pts-1);
    const v=0.35+0.25*noise(k*0.5,3)+0.4*Math.max(0,noise(k*0.3,8));
    const px=lerp(gx0,gx1,u),py=lerp(gy1,gy0,clamp(v));
    if(k===0)g.moveTo(px,py);else{
      if(k<=Math.floor(sp*pts))g.lineTo(px,py);
    }
  }
  g.strokeStyle=C.cyan;g.lineWidth=4;g.lineJoin='round';g.stroke();
  g.globalAlpha=1;
  g.restore();
}

/* scene 3: macro number — 99.99% rolls up */
function f3Number(t){
  const camX=Math.sin(t*0.3)*10,camY=Math.cos(t*0.25)*8;
  drawWorld('gradient-field',t,camX,camY);
  /* rack focus: zoom in */
  const z=1+clamp(t/2.5)*0.14;
  g.save();
  const bx=W*0.5,by=H*0.46;
  g.translate(bx,by);g.scale(z,z);g.translate(-bx,-by);
  /* number rolls from 99.0 to 99.99 */
  const p=clamp(spring(t-0.2,90,15));
  const val=99.0+p*0.99;
  g.textAlign='center';g.textBaseline='middle';
  g.font='800 200px Inter';
  g.fillStyle=C.fg;
  g.fillText(val.toFixed(2)+'%',bx,by);
  /* soft glow behind */
  const gl=g.createRadialGradient(bx,by,20,bx,by,520);
  gl.addColorStop(0,'rgba(69,209,230,.18)');gl.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gl;g.fillRect(0,0,W,H);
  const k=spring(t-0.7,100,15);
  g.fillStyle=C.muted;g.font='600 40px Inter';g.globalAlpha=k;
  g.fillText('服务可用性，稳定在线',bx,by+170);
  g.globalAlpha=1;
  g.restore();
}

/* scene 4: deploy log — text streams, cursor clicks, check */
function deployBg(t,camX,camY){
  g.fillStyle=C.ink;g.fillRect(0,0,W,H);
  const gr=g.createRadialGradient(W*0.5,H*0.4,120,W*0.5,H*0.5,1200);
  gr.addColorStop(0,'#0e1525');gr.addColorStop(1,'#060912');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  /* sparse drifting characters */
  const cell=80,cols=Math.ceil(W/cell)+1,rows=Math.ceil(H/cell)+1;
  g.font='18px ui-monospace,Menlo,monospace';g.textAlign='center';g.textBaseline='middle';
  for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
    const n=noise(i*0.7,j*0.7+t*0.08);
    if(n>0.5){
      const x=i*cell-camX*0.3,y=j*cell-camY*0.3;
      g.globalAlpha=0.16;g.fillStyle='#5fd6e6';
      g.fillText(GLYPH[Math.floor(Math.abs(n*997))%GLYPH.length],x,y);
    }
  }g.globalAlpha=1;
}
function f4Deploy(t){
  const camX=Math.sin(t*0.4)*12,camY=Math.cos(t*0.3)*9;
  deployBg(t,camX,camY);
  const z=1+clamp(t/2.5)*0.05;
  g.save();
  const bx=W*0.5,by=H*0.44;
  g.translate(bx,by);g.scale(z,z);g.translate(-bx,-by);
  const x=120,y=460,pw=840,ph=900;
  g.fillStyle='rgba(9,14,25,.96)';g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=36;g.shadowOffsetY=14;
  rr(x,y,pw,ph,22);g.fill();
  g.shadowBlur=0;g.shadowOffsetY=0;g.shadowColor='transparent';
  g.strokeStyle='rgba(120,150,200,.2)';g.lineWidth=1.5;rr(x,y,pw,ph,22);g.stroke();
  /* title */
  g.fillStyle=C.fg;g.font='800 40px Inter';g.textAlign='left';
  g.fillText('一键部署',x+38,y+72);
  /* env chips */
  const env=['构建','推送','灰度'];
  for(let i=0;i<3;i++){
    const p=spring(t-0.2-i*0.12,120,17);
    g.globalAlpha=p;
    const cx2=x+38+i*150,cy2=y+150;
    g.fillStyle=i<1?'rgba(69,209,230,.2)':'rgba(255,255,255,.06)';
    rr(cx2-10,cy2-30,130,64,12);g.fill();
    g.fillStyle=i<1?C.cyan:C.muted;g.font='600 28px Inter';
    g.fillText(env[i],cx2,cy2+8);
  }
  g.globalAlpha=1;
  /* log lines */
  const LOG=['> npm run build','✓ compiled in 1.2s','> pushing to registry','> rolling out (canary)','✓ deployed · healthy'];
  const n=clamp(Math.floor(t*2.2),0,LOG.length);
  for(let i=0;i<n;i++){
    const ly=y+280+i*74;
    const ok=LOG[i].includes('✓');
    g.fillStyle=ok?C.green:(i===n-1?C.cyan:C.muted);
    g.font=(ok?'700':'600')+' 30px ui-monospace,Menlo,monospace';
    g.fillText(LOG[i],x+38,ly);
  }
  /* success check */
  if(n>=LOG.length){
    const p=spring(t-2.1,160,16);
    g.save();g.globalAlpha=p;
    g.translate(x+pw-110,y+72);
    g.strokeStyle=C.green;g.lineWidth=7;g.lineCap='round';g.lineJoin='round';
    g.beginPath();g.moveTo(-24,4);g.lineTo(-6,24);g.lineTo(30,-22);g.stroke();
    g.restore();
  }
  g.restore();
}

/* scene 5: particle convergence */
function f5Converge(t){
  const cx=W*0.5,cy=H*0.46;
  /* background fades from world to dark */
  const conv=clamp(t/2.0);
  drawWorld('particle-field',t,Math.sin(t)*10,Math.cos(t)*8);
  /* fade world particles */
  g.fillStyle='rgba(6,9,16,'+conv*0.86+')';g.fillRect(0,0,W,H);
  /* a ring of converging particles */
  const R=190;
  for(let i=0;i<60;i++){
    const ang=i/60*6.28;
    const tx=cx+Math.cos(ang)*R,ty=cy+Math.sin(ang)*R;
    const lag=clamp(conv*1.2-i*0.006);
    const sx=((i*97)%W),sy=((i*211)%H);
    const px=lerp(sx,tx,lag),py=lerp(sy,ty,lag);
    g.globalAlpha=0.9;g.fillStyle=i%6?C.fg:C.cyan;
    g.beginPath();g.arc(px,py,5,0,6.28);g.fill();
  }
  g.globalAlpha=1;
  /* star */
  if(conv>0.8){
    const p=clamp((conv-0.8)/0.2);
    g.save();g.translate(cx,cy);g.globalAlpha=p;
    g.fillStyle=C.fg;
    g.beginPath();
    for(let k=0;k<10;k++){
      const r=k%2?22:54,a=k/10*6.28-Math.PI/2;
      g.lineTo(Math.cos(a)*r,Math.sin(a)*r);
    }
    g.closePath();g.fill();
    g.restore();
  }
  g.globalAlpha=1;
}

/* scene 6: logo lockup */
function f6Logo(t){
  g.fillStyle=C.ink;g.fillRect(0,0,W,H);
  const gr=g.createRadialGradient(W*0.5,H*0.42,100,W*0.5,H*0.5,1000);
  gr.addColorStop(0,'#0e1525');gr.addColorStop(1,'#060912');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  drawParticles(t,0,0,0.3);
  const cx=W*0.5,cy=H*0.44;
  const p=spring(t-0.0,140,18);
  /* ring mark present */
  g.save();g.translate(cx,cy);g.globalAlpha=p;
  g.strokeStyle=C.cyan;g.lineWidth=7;
  g.beginPath();g.arc(0,0,70,0,2*Math.PI);g.stroke();
  g.fillStyle=C.fg;
  g.beginPath();
  for(let k=0;k<10;k++){
    const r=k%2?14:34,a=k/10*6.28-Math.PI/2;
    g.lineTo(Math.cos(a)*r,Math.sin(a)*r);
  }
  g.closePath();g.fill();
  g.restore();
  const tp=spring(t-0.3,120,17);
  g.globalAlpha=tp;g.textAlign='center';g.textBaseline='middle';
  g.fillStyle=C.fg;g.font='800 76px Inter';
  g.fillText('Pulse',cx,cy+160);
  g.fillStyle=C.muted;g.font='500 32px Inter';
  g.fillText('看见每一个信号',cx,cy+230);
  g.globalAlpha=1;
}

const SCENES=[
  {from:0,to:2.5,draw:f1Hook,out:'push-through'},
  {from:2.5,to:5.5,draw:f2Dash,out:'push-through'},
  {from:5.5,to:8,draw:f3Number,out:'push-through'},
  {from:8,to:10.5,draw:f4Deploy,out:'match-cut'},
  {from:10.5,to:12.5,draw:f5Converge,out:'match-cut'},
  {from:12.5,to:15,draw:f6Logo,out:'hold'},
];
