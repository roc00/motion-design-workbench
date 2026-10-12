/* ===================== FILM: PARTICLE CONVERGE ===================== */
const PC = { cx: 640, cy: 295 };
/* Build the mark: an asterisk (4 strokes) + center diamond + outer ring */
function buildTargets(){
  const tg = [];
  const line = (ang, half, step) => {
    for(let d=-half; d<=half; d+=step){
      tg.push([PC.cx + Math.cos(ang)*d, PC.cy + Math.sin(ang)*d]);
    }
  };
  line(-Math.PI/2, 92, 9);            // vertical
  line(-Math.PI/6, 92, 11);
  line(Math.PI/6, 92, 11);
  line(0, 96, 12);                     // horizontal
  // diamond
  for(let i=0;i<28;i++){
    const a=i/28*6.28, dx=Math.sign(Math.cos(a))*Math.abs(Math.cos(a))*24,
      dy=Math.sign(Math.sin(a))*Math.abs(Math.sin(a))*24;
    tg.push([PC.cx+dx, PC.cy+dy]);
  }
  // outer ring
  for(let i=0;i<60;i++){
    const a=i/60*6.28;
    tg.push([PC.cx+Math.cos(a)*78, PC.cy+Math.sin(a)*78]);
  }
  return tg;
}
const TARGETS = buildTargets();
const P0 = rng(4242);
const STARTS = TARGETS.map(() => {
  const edge = P0();
  const a = P0()*6.28, rad = 300 + P0()*400;
  return { x: PC.cx + Math.cos(a)*rad*(edge<.5?1:0.4), y: PC.cy + Math.sin(a)*rad,
    delay: P0()*0.5, hue: P0() };
});

function scPCVoid(t){
  const camX = Math.sin(t*0.2)*14, camY=Math.cos(t*0.15)*10;
  g.save();g.globalAlpha=0.9;drawWorld('particle-field',t,camX,camY);g.restore();
}
function scPCConverge(t){
  const conv = clamp(spring(t-0.2, 60, 13));
  // fade background world as particles take formation
  g.save();g.globalAlpha=0.9*(1-conv*0.8);drawWorld('particle-field',t,0,0);g.restore();
  for(let i=0;i<TARGETS.length;i++){
    const s=STARTS[i];
    const lag = clamp((conv - s.delay*0.0 - i*0.0015)/0.92);
    const drift = lag*lag*(3-2*lag);
    const x=lerp(s.x,TARGETS[i][0],drift), y=lerp(s.y,TARGETS[i][1],drift);
    const col = s.hue<0.12?C.warm : (s.hue<0.24?C.indigo:C.cyan);
    g.fillStyle=col;g.globalAlpha=0.35+drift*0.65;
    g.beginPath();g.arc(x,y,0.8+drift*1.5,0,6.28);g.fill();
  }
  g.globalAlpha=1;
}
function scPCCrisp(t){
  const appear = clamp(spring(t-0.1, 120, 18));
  g.fillStyle=C.ink;g.fillRect(0,0,W,H);
  const gr=g.createRadialGradient(PC.cx,PC.cy,80,PC.cx,PC.cy,700);
  gr.addColorStop(0,'#0e1525');gr.addColorStop(1,'#070a12');g.fillStyle=gr;g.fillRect(0,0,W,H);
  // a faint converged particle halo
  g.globalAlpha=(1-appear)*0.9;
  for(let i=0;i<TARGETS.length;i++){
    const s=STARTS[i];
    g.fillStyle=s.hue<0.12?C.warm:C.cyan;g.beginPath();
    g.arc(TARGETS[i][0],TARGETS[i][1],1.8,0,6.28);g.fill();
  }
  // crisp strokes
  g.globalAlpha=appear;
  g.strokeStyle=C.fg;g.lineWidth=3.2;g.lineCap='round';
  const stroke=(ang,half)=>{g.beginPath();g.moveTo(PC.cx-Math.cos(ang)*half,PC.cy-Math.sin(ang)*half);
    g.lineTo(PC.cx+Math.cos(ang)*half,PC.cy+Math.sin(ang)*half);g.stroke();};
  stroke(-Math.PI/2,92);stroke(-Math.PI/6,92);stroke(Math.PI/6,92);stroke(0,96);
  // diamond
  g.beginPath();g.moveTo(PC.cx,PC.cy-24);g.lineTo(PC.cx+24,PC.cy);
  g.lineTo(PC.cx,PC.cy+24);g.lineTo(PC.cx-24,PC.cy);g.closePath();
  g.fillStyle=C.ink;g.fill();g.strokeStyle=C.cyan;g.lineWidth=2;g.stroke();
  // outer ring
  g.beginPath();g.arc(PC.cx,PC.cy,78,0,6.28);g.strokeStyle=C.fg;g.lineWidth=2.4;g.stroke();
  // construction annotations
  g.globalAlpha=appear*0.55;
  g.strokeStyle=C.muted;g.lineWidth=1;g.setLineDash([4,5]);
  g.beginPath();g.moveTo(PC.cx-150,PC.cy);g.lineTo(PC.cx+150,PC.cy);g.stroke();
  g.beginPath();g.moveTo(PC.cx,PC.cy-150);g.lineTo(PC.cx,PC.cy+150);g.stroke();
  g.setLineDash([]);
  g.fillStyle=C.muted;g.font='600 12px Inter';g.textAlign='left';
  g.fillText('R 78', PC.cx+90, PC.cy-60);
  g.fillText('45°', PC.cx+60, PC.cy+60);
  g.globalAlpha=1;
}
function scPCWord(t){
  // keep crisp mark, move it up a touch, bring wordmark
  const w = clamp(spring(t-0.2,110,17));
  g.fillStyle=C.ink;g.fillRect(0,0,W,H);
  const gr=g.createRadialGradient(PC.cx,300,80,PC.cx,300,700);
  gr.addError=0;gr.addColorStop(0,'#0e1525');gr.addColorStop(1,'#070a12');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.save();g.globalAlpha=0.9;g.translate(PC.cx,230);g.scale(0.72,0.72);g.translate(-PC.cx,-230);
  g.strokeStyle=C.fg;g.lineWidth=3;g.lineCap='round';
  const stroke=(ang,half)=>{g.beginPath();g.moveTo(PC.cx-Math.cos(ang)*half,230-Math.sin(ang)*half);
    g.lineTo(PC.cx+Math.cos(ang)*half,230+Math.sin(ang)*half);g.stroke();};
  stroke(-Math.PI/2,92);stroke(-Math.PI/6,92);stroke(Math.PI/6,92);stroke(0,96);
  g.beginPath();g.arc(PC.cx,230,78,0,6.28);g.stroke();
  g.restore();
  g.globalAlpha=w;
  g.fillStyle=C.fg;g.font='800 64px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillText('NOVA', PC.cx, 470);
  g.fillStyle=C.cyan;g.font='600 22px Inter';
  g.fillText('让每一次构建都被看见', PC.cx, 525);
  g.globalAlpha=1;
}
function scPCHold(t){
  const fade = clamp(1 - (t/2.5)*0.0);
  g.fillStyle=C.ink;g.fillRect(0,0,W,H);
  const gr=g.createRadialGradient(PC.cx,300,80,PC.cx,300,700);
  gr.addColorStop(0,'#0e1525');gr.addColorStop(1,'#070a12');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.save();g.globalAlpha=0.9;g.translate(PC.cx,230);g.scale(0.72,0.72);g.translate(-PC.cx,-230);
  g.strokeStyle=C.fg;g.lineWidth=3;g.lineCap='round';
  const stroke=(ang,half)=>{g.beginPath();g.moveTo(PC.cx-Math.cos(ang)*half,230-Math.sin(ang)*half);
    g.lineTo(PC.cx+Math.cos(ang)*half,230+Math.sin(ang)*half);g.stroke();};
  stroke(-Math.PI/2,92);stroke(-Math.PI/6,92);stroke(Math.PI/6,92);stroke(0,96);
  g.beginPath();g.arc(PC.cx,230,78,0,6.28);g.stroke();
  g.restore();
  g.fillStyle=C.fg;g.font='800 64px Inter';g.textAlign='center';g.textBaseline='middle';
  g.fillText('NOVA', PC.cx, 470);
  g.fillStyle=C.cyan;g.font='600 22px Inter';
  g.fillText('让每一次构建都被看见', PC.cx, 525);
}
const SCENES = [
  { from:0, to:2.5, draw:scPCVoid, out:'match-cut' },
  { from:2.5, to:7, draw:scPCConverge, out:'match-cut' },
  { from:7, to:10, draw:scPCCrisp, out:'match-cut' },
  { from:10, to:12.5, draw:scPCWord, out:'match-cut' },
  { from:12.5, to:15, draw:scPCHold, out:'hard-cut' },
];
