/* ===================== FILM: MACRO UI (light paper) ===================== */
const P = { paper:'#f4f1ea', card:'#fffdf8', ink:'#262932', muted:'#8b8578',
  accent:'#c9623f', blue:'#3a6ea5', line:'#e3ddcf', green:'#4f9a72' };
function paperBg(t, camX=0, camY=0){
  g.fillStyle=P.paper;g.fillRect(0,0,W,H);
  /* faint ruled grid */
  const gap=48;
  g.strokeStyle=P.line;g.lineWidth=1;
  for(let x=(-camX*0.3)%gap;x<W;x+=gap){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}
  for(let y=(-camY*0.3)%gap;y<H;y+=gap){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
  /* warm corner glow */
  const gr=g.createRadialGradient(W*0.7,H*0.3,60,W*0.7,H*0.3,600);
  gr.addColorStop(0,'rgba(201,98,63,.10)');gr.addColorStop(1,'rgba(201,98,63,0)');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
}
const WORDS = 'deploy to production';
function fieldFrame(x,y,w,h){
  g.fillStyle=P.card;g.shadowColor='rgba(60,50,30,.15)';g.shadowBlur=24;g.shadowOffsetY=8;
  rr(x,y,w,h,14);g.fill();
  g.shadowBlur=0;g.shadowOffsetY=0;g.shadowColor='transparent';
  g.strokeStyle=P.line;g.lineWidth=1.5;rr(x,y,w,h,14);g.stroke();
}
function scMUEmpty(t){
  const camX=Math.sin(t*0.3)*8,camY=Math.cos(t*0.25)*6;
  paperBg(t,camX,camY);
  /* hero present at t=0; subtle settle only */
  const ap=1;
  g.save();g.globalAlpha=ap;
  /* label */
  g.fillStyle=P.ink;g.font='700 26px Inter';g.textAlign='left';g.textBaseline='middle';
  g.fillText('命令 / Command', 240, 250);
  g.fillStyle=P.muted;g.font='500 18px Inter';
  g.fillText('输入要执行的操作，支持自然语言', 240, 288);
  /* field */
  const x=240,y=320,w=800,h=92;
  fieldFrame(x,y,w,h);
  g.fillStyle=P.muted;g.font='600 30px Inter';
  g.fillText('告诉我要做什么…', x+30, y+h/2);
  /* blinking caret */
  const blink=Math.floor(t*2)%2;
  g.fillStyle=P.accent;g.globalAlpha=ap*(blink?1:0.2);
  g.fillRect(x+30,y+h/2-18,2.5,36);
  g.restore();
}
function scMUType(t){
  paperBg(t,0,0);
  const x=240,y=320,w=800,h=92;
  fieldFrame(x,y,w,h);
  /* typed text */
  const n=clamp(Math.floor(t*7.2),0,WORDS.length);
  const txt=WORDS.slice(0,n);
  g.fillStyle=P.ink;g.font='600 30px Inter';g.textAlign='left';g.textBaseline='middle';
  g.fillText(txt, x+30, y+h/2);
  /* caret after text */
  const tw=g.measureText(txt).width;
  const blink=Math.floor(t*2)%2;
  g.fillStyle=P.accent;g.globalAlpha=blink?1:0.2;
  g.fillRect(x+30+tw+3,y+h/2-18,2.5,36);
  g.globalAlpha=1;
  /* hint chip */
  g.fillStyle=P.line;rr(x+30,y-46,120,32,8);g.fill();
  g.fillStyle=P.muted;g.font='600 14px Inter';g.textAlign='center';
  g.fillText('⌘ K 唤起', x+90, y-30);g.textAlign='left';
}
function scMUSuggest(t){
  paperBg(t,0,0);
  const x=240,y=320,w=800,h=92;
  fieldFrame(x,y,w,h);
  g.fillStyle=P.ink;g.font='600 30px Inter';g.textAlign='left';g.textBaseline='middle';
  g.fillText(WORDS, x+30, y+h/2);
  /* dropdown suggestions */
  const items=['部署到生产环境','部署到预发环境','回滚到上一个版本'];
  const dp=clamp(spring(t-0.2,120,18));
  for(let i=0;i<3;i++){
    const dy=(i+1)*0.16;
    const row=clamp((dp-i*0.18)/0.7);
    g.save();g.globalAlpha=row;
    const ry=y+h+10+i*64;
    g.fillStyle=i===0?P.card:'rgba(255,253,248,.9)';
    g.shadowColor='rgba(60,50,30,.1)';g.shadowBlur=14;g.shadowOffsetY=4;
    rr(x,ry,w,56,10);g.fill();
    g.shadowBlur=0;g.shadowColor='transparent';
    g.strokeStyle=i===0?P.accent:P.line;g.lineWidth=i===0?2:1.2;rr(x,ry,w,56,10);g.stroke();
    g.fillStyle=i===0?P.accent:P.ink;g.font='600 21px Inter';g.textAlign='left';
    g.fillText(items[i], x+28, ry+28);
    g.fillStyle=P.muted;g.font='500 16px Inter';g.textAlign='right';
    g.fillText(['Enter','↓','↓'][i], x+w-26, ry+28);g.textAlign='left';
    g.restore();
  }
}
function scMUResult(t){
  paperBg(t,0,0);
  /* field collapses to a success banner */
  const x=240,y=300,w=800,h=110;
  const rp=spring(t-0.1,110,16);
  g.save();g.globalAlpha=rp;
  g.fillStyle=P.card;g.shadowColor='rgba(60,50,30,.16)';g.shadowBlur=24;g.shadowOffsetY=8;
  rr(x,y,w,h,14);g.fill();
  g.shadowBlur=0;g.shadowColor='transparent';
  g.strokeStyle='rgba(79,154,114,.6)';g.lineWidth=2;rr(x,y,w,h,14);g.stroke();
  /* check */
  const ck=clamp(spring(t-0.4,130,18));
  g.strokeStyle=P.green;g.lineWidth=4;g.lineCap='round';
  g.beginPath();g.arc(x+54,y+h/2,28,-.6,4.2);g.stroke();
  g.save();g.globalAlpha=ck;
  g.beginPath();g.moveTo(x+38,y+h/2);g.lineTo(x+50,y+h/2+12);g.lineTo(x+72,y+h/2-14);g.stroke();
  g.restore();
  g.fillStyle=P.ink;g.font='700 26px Inter';g.textAlign='left';g.textBaseline='middle';
  g.fillText('部署到生产环境 · 成功', x+100, y+h/2-16);
  g.fillStyle=P.muted;g.font='500 18px Inter';
  g.fillText('构建 0.8s · 推送 1.2s · 灰度 100%', x+100, y+h/2+20);
  g.restore();
}
function scMULockup(t){
  paperBg(t,0,0);
  const a=clamp(spring(t-0.2,100,15));
  g.save();g.globalAlpha=a;
  /* small terminal mark */
  g.fillStyle=P.ink;g.font='800 60px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillText('> run', 640, 330);
  g.fillStyle=P.accent;g.font='600 22px Inter';
  g.fillText('一句自然语言，完成一次部署', 640, 390);
  g.restore();
}
const SCENES = [
  { from:0, to:2.6, draw:scMUEmpty, out:'match-cut' },
  { from:2.6, to:5.2, draw:scMUType, out:'match-cut' },
  { from:5.2, to:9.2, draw:scMUSuggest, out:'match-cut' },
  { from:9.2, to:12.2, draw:scMUResult, out:'match-cut' },
  { from:12.2, to:15, draw:scMULockup, out:'hard-cut' },
];
