/* ===================== FILM: KINETIC SLICE (light editorial) ===================== */
const K = { paper:'#f4f1eb', ink:'#23262e', muted:'#8a8577', accent:'#c9623f',
  line:'#e3ddcf', blue:'#3a6ea5' };
function kBg(t){
  g.fillStyle=K.paper;g.fillRect(0,0,W,H);
  /* margin column guide */
  g.strokeStyle=K.line;g.lineWidth=1;
  g.beginPath();g.moveTo(180,0);g.lineTo(180,H);g.stroke();
  /* warm glow */
  const gr=g.createRadialGradient(W*0.8,H*0.2,60,W*0.8,H*0.2,560);
  gr.addColorStop(0,'rgba(201,98,63,.09)');gr.addColorStop(1,'rgba(201,98,63,0)');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
}
function scK1(t){
  kBg(t);
  const word='MOTION';
  const base=300,size=150;
  g.font='800 '+size+'px Inter';g.textAlign='left';g.textBaseline='middle';
  let x=230;
  const widths=[];
  for(let i=0;i<word.length;i++){const w=g.measureText(word[i]).width;widths.push(w);}
  /* hero fully present at t=0; a tiny per-letter settle animates immediately */
  for(let i=0;i<word.length;i++){
    const settle=clamp(spring(t+0.2-i*0.04,150,20));
    const bob=Math.sin(settle*Math.PI)*4;
    g.save();
    g.beginPath();g.rect(x-6,base-size/2-10,widths[i]+12,size+20);g.clip();
    g.fillStyle=i%3===2?K.accent:K.ink;
    g.fillText(word[i],x,base+bob);
    g.restore();
    /* thin baseline tick */
    g.strokeStyle=i%3===2?K.accent:K.line;g.lineWidth=2;
    g.beginPath();g.moveTo(x,base+size/2+12);g.lineTo(x+widths[i]-8,base+size/2+12);g.stroke();
    x+=widths[i];
  }
  /* a slice bar sweeps across behind the word */
  const sweep=clamp((t-0.15)/1.0);
  if(sweep>0 && sweep<1){
    const sx=230+sweep*620;
    const bar=g.createLinearGradient(sx-30,0,sx+30,0);
    bar.addColorStop(0,'rgba(201,98,63,0)');bar.addColorStop(.5,'rgba(201,98,63,.35)');
    bar.addColorStop(1,'rgba(201,98,63,0)');
    g.fillStyle=bar;g.fillRect(sx-30,base-size/2,60,size);
  }
  g.fillStyle=K.muted;g.font='600 20px Inter';g.textAlign='left';
  const sub=clamp(spring(t-0.6,100,15));
  g.globalAlpha=sub;
  g.fillText('动效，是界面的节奏', 230, base+size/2+60);
  g.globalAlpha=1;
}
function scK2(t){
  kBg(t);
  const lines=['不是装饰','而是','引导注意力的语言'];
  const sizes=[100,56,100];
  let y=240;
  for(let i=0;i<3;i++){
    const p=clamp((t-0.2-i*0.5)/0.5);
    const wipe=easeOutCubic(clamp(p));
    g.save();
    g.font=(i===1?'700':'800')+' '+sizes[i]+'px '+(i===2?'Inter':'Inter');
    const w=g.measureText(lines[i]).width;
    const x=230;
    g.beginPath();g.rect(x-8,y-sizes[i]/2-8,w*wipe+16,sizes[i]+16);g.clip();
    g.fillStyle=i===1?K.muted:(i===2?K.accent:K.ink);
    g.textAlign='left';g.textBaseline='middle';
    g.fillText(lines[i],x,y);
    g.restore();
    y+=sizes[i]*1.18;
  }
}
function scK3(t){
  kBg(t);
  /* quick word swaps in a single large slot */
  const pairs=[['快','慢'],['进','出'],['聚焦','流动']];
  g.font='800 140px Inter';g.textAlign='center';g.textBaseline='middle';
  const cycle=(t*1.5)%3;
  const idx=Math.floor(cycle);
  const phase=cycle-idx;
  const A=pairs[idx][0], B=pairs[idx][1];
  const slot=280;
  g.fillStyle=K.ink;
  /* outgoing sliced up */
  g.save();g.beginPath();g.rect(0,slot-120,W,120);g.clip();
  g.globalAlpha=1-phase*1.4;
  g.fillText(A,640,slot+(phase*90));
  g.restore();
  /* incoming sliced */
  g.save();g.beginPath();g.rect(0,slot,W,120);g.clip();
  g.globalAlpha=phase*1.4;
  g.fillStyle=K.accent;
  g.fillText(B,640,slot+90-(phase*90));
  g.restore();
  g.fillStyle=K.muted;g.font='600 22px Inter';g.textAlign='left';
  g.fillText('一组反义词，定义一种节奏', 230, 480);
  g.strokeStyle=K.accent;g.lineWidth=3;
  g.beginPath();g.moveTo(230,460);g.lineTo(230+380,460);g.stroke();
}
function scK4(t){
  kBg(t);
  const p=clamp(spring(t-0.3,100,15));
  /* big number */
  g.font='800 220px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillStyle=K.ink;
  g.save();g.beginPath();g.rect(0,150,W*p,260);g.clip();
  g.fillText('90%', 600, 300);
  g.restore();
  /* accent underline draws */
  g.strokeStyle=K.accent;g.lineWidth=6;g.lineCap='round';
  const ln=clamp(spring(t-0.8,90,14));
  g.beginPath();g.moveTo(420,440);g.lineTo(420+360*ln,440);g.stroke();
  g.fillStyle=K.muted;g.font='600 24px Inter';g.textAlign='center';
  g.fillText('注意力，被引导到正确的地方', 600, 490);
}
function scK5(t){
  kBg(t);
  const a=clamp(spring(t-0.3,100,15));
  g.save();g.globalAlpha=a;
  g.font='800 52px Inter';g.fillStyle=K.ink;g.textAlign='center';g.textBaseline='middle';
  g.fillText('让节奏，为内容服务', 640, 320);
  g.strokeStyle=K.accent;g.lineWidth=4;
  g.beginPath();g.moveTo(440,380);g.lineTo(840,380);g.stroke();
  g.fillStyle=K.muted;g.font='600 20px Inter';
  g.fillText('KINETIC · TYPE · SYSTEM', 640, 430);
  g.restore();
}
const SCENES = [
  { from:0, to:3, draw:scK1, out:'match-cut' },
  { from:3, to:6, draw:scK2, out:'match-cut' },
  { from:6, to:9, draw:scK3, out:'match-cut' },
  { from:9, to:12, draw:scK4, out:'match-cut' },
  { from:12, to:15, draw:scK5, out:'hard-cut' },
];
