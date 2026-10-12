/* ===================== FILM: WHIP MONTAGE ===================== */
function wmBg(t,cx,cy){
  g.fillStyle='#0a0e17';g.fillRect(0,0,W,H);
  const gr=g.createRadialGradient(W*0.5,H*0.5,80,W*0.5,H*0.5,720);
  gr.addColorStop(0,'#101a2c');gr.addColorStop(1,'#070a12');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.save();g.globalAlpha=0.4;drawParticles(t,cx||0,cy||0);g.restore();
}
function scWChart(t){
  wmBg(t,0,0);
  /* panel */
  g.fillStyle=C.panel;g.shadowColor='rgba(0,0,0,.4)';g.shadowBlur=20;g.shadowOffsetY=8;
  rr(280,160,720,400,16);g.fill();
  g.shadowBlur=0;g.strokeStyle='rgba(120,150,190,.4)';g.lineWidth=1.4;rr(280,160,720,400,16);g.stroke();
  g.fillStyle=C.fg;g.font='700 24px Inter';g.textAlign='left';g.fillText('实时性能',320,215);
  /* line */
  const pts=[];
  for(let i=0;i<10;i++){
    const x=340+i*68, y=470 - Math.sin(i*0.7+t)*70 - i*12;
    pts.push([x,y]);
  }
  const draw=1;
  g.save();g.beginPath();g.rect(280,160,720*draw,400);g.clip();
  g.strokeStyle=C.cyan;g.lineWidth=4;g.lineJoin='round';g.beginPath();
  g.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke();
  for(const p of pts){g.fillStyle=C.fg;g.beginPath();g.arc(p[0],p[1],5,0,6.28);g.fill();}
  g.restore();
}
function scWCard(t){
  wmBg(t,0,0);
  const flip=clamp(spring(t-0.2,110,16));
  g.save();g.translate(640,360);g.scale(1,Math.abs(Math.cos(flip*Math.PI)));
  g.fillStyle=C.panel;g.shadowColor='rgba(0,0,0,.4)';g.shadowBlur=22;g.shadowOffsetY=10;
  rr(-300,-180,600,360,18);g.fill();
  g.shadowBlur=0;
  g.fillStyle=C.fg;g.font='700 30px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillText('今日概览',0,-110);
  g.fillStyle=C.cyan;g.font='800 72px Inter';g.fillText('1,204',0,10);
  g.fillStyle=C.muted;g.font='600 20px Inter';g.fillText('请求 / 秒',0,80);
  g.restore();
}
function scWInput(t){
  wmBg(t,0,0);
  const x=280,y=300,w=720,h=100;
  g.fillStyle=C.panel;g.shadowColor='rgba(0,0,0,.4)';g.shadowBlur=20;g.shadowOffsetY=8;
  rr(x,y,w,h,14);g.fill();
  g.shadowBlur=0;g.strokeStyle='rgba(120,150,190,.4)';g.lineWidth=1.4;rr(x,y,w,h,14);g.stroke();
  const word='一键回滚';
  const n=clamp(Math.floor(t*5),0,word.length);
  g.fillStyle=C.fg;g.font='600 32px Inter';g.textAlign='left';g.textBaseline='middle';
  g.fillText(word.slice(0,n),x+30,y+h/2);
  const tw=g.measureText(word.slice(0,n)).width;
  g.fillStyle=C.warm;g.fillRect(x+30+tw+4,y+h/2-20,3,40);
  g.fillStyle=C.muted;g.font='600 18px Inter';g.textAlign='center';
  g.fillText('⌘ R', x+w-50, y+h/2);
}
function scWNumber(t){
  wmBg(t,0,0);
  const p=clamp(spring(t-0.2,80,14));
  const val=Math.round(99.99*p*100)/100;
  g.fillStyle=C.fg;g.font='800 200px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillText(val.toFixed(2),640,340);
  g.fillStyle=C.warm;g.font='600 26px Inter';g.textAlign='center';
  g.fillText('可用性 %', 640, 470);
  g.strokeStyle=C.cyan;g.lineWidth=4;g.lineCap='round';
  g.beginPath();g.moveTo(420,470);g.lineTo(420+440*p,470);g.stroke();
}
function scWDeploy(t){
  wmBg(t,0,0);
  const p=clamp(spring(t-0.2,100,15));
  g.fillStyle=C.panel;g.shadowColor='rgba(0,0,0,.4)';g.shadowBlur=20;g.shadowOffsetY=8;
  rr(340,250,600,220,18);g.fill();
  g.shadowBlur=0;
  g.fillStyle=C.fg;g.font='700 28px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillText('发布流程',640,300);
  const steps=['构建','推送','灰度'];
  for(let i=0;i<3;i++){
    const sp=clamp(p*1.6-i*0.3);
    const x=440+i*180,y=360;
    g.strokeStyle=C.cyan;g.lineWidth=3;
    g.beginPath();g.arc(x,y,24,0,6.28*sp);g.stroke();
    if(sp>0.8){g.fillStyle=C.cyan;g.beginPath();g.arc(x,y,8,0,6.28);g.fill();}
    g.fillStyle=C.muted;g.font='600 18px Inter';g.fillText(steps[i],x,y+55);
    if(i<2){g.strokeStyle=C.muted;g.lineWidth=2;g.beginPath();g.moveTo(x+30,y);g.lineTo(x+130,y);g.stroke();}
  }
}
function scWLogo(t){
  wmBg(t,0,0);
  const a=clamp(spring(t-0.3,100,15));
  g.save();g.globalAlpha=a;
  /* ring */
  g.strokeStyle=C.fg;g.lineWidth=4;g.beginPath();g.arc(640,300,70,0,6.28);g.stroke();
  g.fillStyle=C.fg;g.font='800 52px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillText('Studio',640,300);
  g.fillStyle=C.cyan;g.font='600 22px Inter';
  g.fillText('一镜到底，一气呵成',640,410);
  g.restore();
}
const SCENES = [
  { from:0, to:2.5, draw:scWChart, out:'whip-cut' },
  { from:2.5, to:5, draw:scWCard, out:'whip-cut' },
  { from:5, to:7.5, draw:scWInput, out:'whip-cut' },
  { from:7.5, to:10, draw:scWNumber, out:'whip-cut' },
  { from:10, to:12.5, draw:scWDeploy, out:'whip-cut' },
  { from:12.5, to:15, draw:scWLogo, out:'hard-cut' },
];
