/* ===================== FILM 2 · MARGIN (light, writing / notes) ===================== */

function paperBg(t,camX=0,camY=0){
  g.fillStyle=P.paper;g.fillRect(0,0,W,H);
  /* soft warm light */
  const gr=g.createRadialGradient(W*0.5,H*0.4,120,W*0.5,H*0.5,1200);
  gr.addColorStop(0,'rgba(255,253,247,.9)');gr.addColorStop(1,'rgba(228,220,205,.6)');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  /* faint ruled lines */
  const gap=92;
  const oy=(-camY*0.3)%gap;
  g.strokeStyle='rgba(150,140,118,.16)';g.lineWidth=1.5;
  for(let y=oy;y<H;y+=gap){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
  /* left margin line */
  g.strokeStyle='rgba(201,98,63,.3)';g.lineWidth=2;
  g.beginPath();g.moveTo(150-camX*0.3,0);g.lineTo(150-camX*0.3,H);g.stroke();
}

/* scene 1: hook — big word WRITE, paper, complete at t=0 */
function m1Hook(t){
  const camX=Math.sin(t*0.3)*10,camY=Math.cos(t*0.25)*8;
  paperBg(t,camX,camY);
  const z=1+clamp(t/2.5)*0.08;
  g.save();
  const bx=W*0.52,by=H*0.46;
  g.translate(bx,by);g.scale(z,z);g.translate(-bx,-by);
  /* word complete at first frame */
  g.font='800 176px Georgia,"Times New Roman",serif';g.textAlign='center';g.textBaseline='middle';
  g.fillStyle=P.ink;
  g.fillText('WRITE',bx,by);
  /* accent stroke through */
  const ul=spring(t-0.1,120,18);
  g.strokeStyle=P.accent;g.lineWidth=8;g.lineCap='round';
  g.beginPath();g.moveTo(bx-280,by+118);g.lineTo(bx-280+560*ul,by+118);g.stroke();
  const k=spring(t-0.5,100,15);
  g.fillStyle=P.soft;g.font='600 38px Inter';g.globalAlpha=k;
  g.fillText('把想法，放到它该在的位置',bx,by+205);
  g.globalAlpha=1;
  g.restore();
}

/* scene 2: macro typing — cursor types text on a paper card */
function m2Type(t){
  const camX=Math.sin(t*0.3)*9,camY=Math.cos(t*0.2)*7;
  paperBg(t,camX,camY);
  const z=1+clamp(t/3)*0.05;
  g.save();
  const bx=W*0.5,by=H*0.44;
  g.translate(bx,by);g.scale(z,z);g.translate(-bx,-by);
  const x=110,y=520,pw=860,ph=780;
  const r=spring(t-0.1,120,18);
  g.globalAlpha=r;
  g.fillStyle=P.card;g.shadowColor='rgba(90,80,60,.22)';g.shadowBlur=34;g.shadowOffsetY=14;
  rr(x,y,pw,ph,20);g.fill();
  g.shadowBlur=0;g.shadowOffsetY=0;g.shadowColor='transparent';
  g.strokeStyle=P.line;g.lineWidth=1.5;rr(x,y,pw,ph,20);g.stroke();
  g.globalAlpha=1;
  /* typed text */
  const TEXT='今天要写的，是关于节奏。';
  const n=clamp(Math.floor(t*5.2),0,TEXT.length);
  g.fillStyle=P.ink;g.font='700 44px Georgia,serif';g.textAlign='left';g.textBaseline='middle';
  /* wrap into 2 lines */
  const l1=TEXT.slice(0,Math.min(n,9));
  const l2=TEXT.slice(9,Math.max(9,n));
  g.fillText(l1,x+48,y+110);
  if(n>9)g.fillText(l2,x+48,y+190);
  /* caret */
  const tw=g.measureText(n>9?l2:l1).width;
  const caretX=x+48+(n>9?tw:0),caretY=y+(n>9?190:110);
  const blink=Math.floor(t*2)%2;
  g.globalAlpha=blink?1:0.2;g.fillStyle=P.accent;
  g.fillRect(caretX+2,caretY-26,3,52);
  g.globalAlpha=1;
  /* small margin note */
  const note=spring(t-1.2,100,15);
  g.globalAlpha=note;
  g.fillStyle=P.accent;g.font='italic 600 28px Georgia';
  g.save();g.translate(x+40,y+ph-110);
  g.fillText('↳ 节奏，是引导的语言',0,0);
  g.restore();
  g.globalAlpha=1;
  g.restore();
}

/* scene 3: phrase resolves — word swaps */
function m3Swap(t){
  paperBg(t,0,0);
  const z=1+clamp(t/2.5)*0.06;
  g.save();
  const bx=W*0.5,by=H*0.46;
  g.translate(bx,by);g.scale(z,z);g.translate(-bx,-by);
  g.textAlign='center';g.textBaseline='middle';
  /* static frame words */
  g.fillStyle=P.soft;g.font='600 40px Inter';
  g.fillText('它不是',bx,by-120);
  const pairs=[['装饰','语言'],['噪音','信号'],['停顿','呼吸']];
  const slot=Math.floor(t/0.8);
  const lt=clamp((t%0.8)/0.8);
  const word=pairs[Math.min(slot,pairs.length-1)];
  /* old word out, new word in */
  for(let w=0;w<2;w++){
    const wp=w===0?clamp(1-lt*1.6):clamp((lt-0.3)*1.8);
    const yo=by+(w*140);
    g.globalAlpha=wp;
    const col=w===0?P.soft:P.accent;
    g.fillStyle=col;g.font=(w===0?'600':'800')+' 110px Georgia';
    g.fillText(w===0?word[0]:word[1],bx,yo+20);
  }
  g.globalAlpha=1;
  g.restore();
}

/* scene 4: thought — a sentence with highlighted word */
function m4Think(t){
  paperBg(t,Math.sin(t*0.3)*8,0);
  const z=1+clamp(t/2.5)*0.04;
  g.save();
  const bx=W*0.5,by=H*0.46;
  g.translate(bx,by);g.scale(z,z);g.translate(-bx,-by);
  g.textAlign='center';g.textBaseline='middle';
  const r=spring(t-0.1,110,17);
  g.globalAlpha=r;
  g.fillStyle=P.ink;g.font='700 52px Georgia';
  g.fillText('好的节奏，让人',bx,by-60);
  /* highlighted word */
  const hp=spring(t-0.6,120,17);
  g.globalAlpha=hp;
  const hw='专注';
  g.font='800 120px Georgia';
  const hwW=g.measureText(hw).width;
  g.fillStyle='rgba(201,98,63,.18)';
  rr(bx-hwW/2-24,by+20,hwW+48,140,14);g.fill();
  g.fillStyle=P.accent;
  g.fillText(hw,bx,by+88);
  g.globalAlpha=spring(t-1.1,100,15);
  g.fillStyle=P.ink;g.font='700 52px Georgia';
  g.fillText('而不是分神',bx,by+210);
  g.globalAlpha=1;
  g.restore();
}

/* scene 5: hard cuts of margin notes */
function m5Cuts(t){
  paperBg(t,0,0);
  const notes=[
    {x:130,y:560,w:360,h:280,t:'慢一点'},
    {x:540,y:560,w:380,h:280,t:'留白'},
    {x:130,y:920,w:360,h:300,t:'停在重点'},
    {x:540,y:920,w:380,h:300,t:'再推进'},
  ];
  for(let i=0;i<notes.length;i++){
    const n=notes[i];
    const p=spring(t-0.1-i*0.35,130,18);
    g.globalAlpha=p;
    g.fillStyle=P.card;g.save();
    g.translate(n.x+n.w/2,n.y+n.h/2);g.scale(0.92+0.08*p,0.92+0.08*p);g.translate(-(n.x+n.w/2),-(n.y+n.h/2));
    g.shadowColor='rgba(90,80,60,.18)';g.shadowBlur=24;g.shadowOffsetY=10;
    rr(n.x,n.y,n.w,n.h,18);g.fill();
    g.shadowBlur=0;g.shadowOffsetY=0;g.strokeStyle=P.line;g.lineWidth=1.5;rr(n.x,n.y,n.w,n.h,18);g.stroke();
    g.fillStyle=i%2?P.accent2:P.accent;g.font='800 56px Georgia';g.textAlign='center';g.textBaseline='middle';
    g.fillText(n.t,n.x+n.w/2,n.y+n.h/2+6);
    g.restore();
  }
  g.globalAlpha=1;
}

/* scene 6: logo lockup */
function m6Logo(t){
  g.fillStyle=P.paper;g.fillRect(0,0,W,H);
  const gr=g.createRadialGradient(W*0.5,H*0.42,120,W*0.5,H*0.5,1000);
  gr.addColorStop(0,'rgba(255,253,247,.9)');gr.addColorStop(1,'rgba(226,218,205,.5)');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  const cx=W*0.5,cy=H*0.44;
  const p=spring(t-0.0,130,18);
  g.save();g.translate(cx,cy);g.globalAlpha=p;
  /* margin mark: a bracket / paragraph glyph */
  g.strokeStyle=P.accent;g.lineWidth=8;g.lineCap='round';
  g.beginPath();
  g.moveTo(-30,-70);g.lineTo(-30,70);
  g.moveTo(-30,-70);g.lineTo(6,-70);
  g.moveTo(-30,70);g.lineTo(6,70);
  g.stroke();
  g.fillStyle=P.ink;g.font='800 110px Georgia';g.textAlign='center';g.textBaseline='middle';
  g.fillText('M',34,4);
  g.restore();
  const tp=spring(t-0.3,120,17);
  g.globalAlpha=tp;g.textAlign='center';g.textBaseline='middle';
  g.fillStyle=P.ink;g.font='800 74px Georgia';
  g.fillText('Margin',cx,cy+170);
  g.fillStyle=P.soft;g.font='500 32px Inter';
  g.fillText('让每一句话，都有位置',cx,cy+240);
  g.globalAlpha=1;
}

const SCENES=[
  {from:0,to:2.5,draw:m1Hook,out:'push-through'},
  {from:2.5,to:5.5,draw:m2Type,out:'match-cut'},
  {from:5.5,to:8,draw:m3Swap,out:'match-cut'},
  {from:8,to:10.5,draw:m4Think,out:'match-cut'},
  {from:10.5,to:12.5,draw:m5Cuts,out:'match-cut'},
  {from:12.5,to:15,draw:m6Logo,out:'hold'},
];
