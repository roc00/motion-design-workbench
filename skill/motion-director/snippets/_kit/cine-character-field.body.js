/* ===================== FILM: CHARACTER FIELD ===================== */
function cfWorld(t,camX,camY,alpha){
  g.fillStyle='#070a12';g.fillRect(0,0,W,H);
  g.save();if(alpha!==undefined)g.globalAlpha=alpha;drawChars(t,camX||0,camY||0);g.restore();
}
function cfGlow(t){
  const gr=g.createRadialGradient(W*0.5,H*0.5,120,W*0.5,H*0.5,700);
  gr.addColorStop(0,'rgba(69,209,230,.06)');gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
}
function scCF1(t){
  const camX=Math.sin(t*0.4)*20,camY=Math.cos(t*0.3)*14;
  g.fillStyle='#070a12';g.fillRect(0,0,W,H);
  g.save();drawChars(t,camX,camY);g.restore();
  cfGlow(t);
  /* small label */
  const a=clamp(spring(t-0.4,100,15));
  g.save();g.globalAlpha=a;g.fillStyle=C.cyan;g.font='600 16px Inter';
  g.textAlign='center';g.fillText('STREAM · 实时字符流',640,120);g.restore();
}
function scCF2(t){
  const resolve=clamp(spring(t-0.3,80,14));
  g.fillStyle='#070a12';g.fillRect(0,0,W,H);
  g.save();g.globalAlpha=0.85*(1-resolve*0.75);drawChars(t,0,0);g.restore();
  cfGlow(t);
  /* sentence resolves character by character */
  const sentence='信号从未消失';
  const size=86;
  g.font='800 '+size+'px Inter';g.textAlign='center';g.textBaseline='middle';
  let totalW=0;
  const ws=[];
  for(const ch of sentence){const w=g.measureText(ch).width;ws.push(w);totalW+=w;}
  let x=640-totalW/2;
  for(let i=0;i<sentence.length;i++){
    const p=clamp((resolve-i*0.07)/0.6);
    if(p<=0)continue;
    g.save();g.globalAlpha=p;
    g.beginPath();g.rect(x-2,300-size/2,ws[i]+4,size);g.clip();
    g.fillStyle=i%3===0?C.cyan:C.fg;
    g.fillText(sentence[i],x+ws[i]/2,300+(1-p)*30);
    g.restore();
    x+=ws[i];
  }
}
function scCF3(t){
  g.fillStyle='#070a12';g.fillRect(0,0,W,H);
  g.save();g.globalAlpha=0.2;drawChars(t,0,0);g.restore();
  cfGlow(t);
  /* resolved sentence */
  const sentence='信号从未消失';
  g.font='800 86px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillStyle=C.fg;
  /* recolor every 3rd char */
  let totalW=0;const ws=[];
  for(const ch of sentence){const w=g.measureText(ch).width;ws.push(w);totalW+=w;}
  let x=640-totalW/2;
  for(let i=0;i<sentence.length;i++){
    g.fillStyle=i%3===0?C.cyan:C.fg;
    g.fillText(sentence[i],x+ws[i]/2,300);x+=ws[i];
  }
  /* chars streaming toward the sentence from below */
  const r=rng(31);
  for(let i=0;i<40;i++){
    const ph=((t*0.5+r())%1);
    const sx=r()*W, sy=lerp(640,300,ph);
    const col=r()<0.2?C.warm:C.cyan;
    g.fillStyle=col;g.font='600 '+Math.round(10+ph*8)+'px ui-monospace';
    g.globalAlpha=Math.sin(ph*Math.PI)*0.7;
    g.fillText(GLYPH[Math.floor(r()*GLYPH.length)],sx,sy);
  }
  g.globalAlpha=1;
}
function scCF4(t){
  g.fillStyle='#070a12';g.fillRect(0,0,W,H);
  g.save();g.globalAlpha=0.15;drawChars(t,0,0);g.restore();
  cfGlow(t);
  g.font='800 86px Inter';g.textAlign='center';g.textBaseline='middle';
  const sentence='信号从未消失';
  let totalW=0;const ws=[];
  for(const ch of sentence){const w=g.measureText(ch).width;ws.push(w);totalW+=w;}
  let x=640-totalW/2;
  for(let i=0;i<sentence.length;i++){
    g.fillStyle=i%3===0?C.cyan:C.fg;g.fillText(sentence[i],x+ws[i]/2,300);x+=ws[i];
  }
  const a=clamp(spring(t-0.3,100,15));
  g.save();g.globalAlpha=a;
  g.fillStyle=C.muted;g.font='600 24px Inter';
  g.fillText('它们只是，在等待被看见', 640, 400);
  g.restore();
}
function scCF5(t){
  g.fillStyle='#070a12';g.fillRect(0,0,W,H);
  g.save();g.globalAlpha=0.12;drawChars(t,0,0);g.restore();
  cfGlow(t);
  const a=clamp(spring(t-0.3,100,15));
  g.save();g.globalAlpha=a;
  g.font='800 48px Inter';g.fillStyle=C.fg;g.textAlign='center';g.textBaseline='middle';
  g.fillText('让数据，自己说话',640,340);
  g.strokeStyle=C.cyan;g.lineWidth=3;
  g.beginPath();g.moveTo(460,390);g.lineTo(820,390);g.stroke();
  g.restore();
}
const SCENES = [
  { from:0, to:2.5, draw:scCF1, out:'match-cut' },
  { from:2.5, to:6, draw:scCF2, out:'match-cut' },
  { from:6, to:9, draw:scCF3, out:'match-cut' },
  { from:9, to:12, draw:scCF4, out:'match-cut' },
  { from:12, to:15, draw:scCF5, out:'hard-cut' },
];
