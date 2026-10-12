/* Pure frame renderer. Design units: 1920×1080. No playback state here. */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
function spring(t, k = 170, d = 26) {
  if (t <= 0) return 0;
  const w = Math.sqrt(k), z = d / (2 * w);
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + z * w / wd * Math.sin(wd * t));
}
function track(t, keys, k = 170, d = 26) {
  return keys.reduce((v, key, i) => i ? v + (key[1] - keys[i - 1][1]) * spring(t - key[0], k, d) : key[1], 0);
}
function colorMix(a,b,t){const hex=x=>x.slice(1).match(/../g).map(v=>parseInt(v,16));const aa=hex(a),bb=hex(b);return '#'+aa.map((v,i)=>Math.round(lerp(v,bb[i],clamp(t))).toString(16).padStart(2,'0')).join('');}
const envelope = (t, a, b, edge = .2) => Math.min(smooth((t - a) / edge), smooth((b - t) / edge));
const W = 1920, H = 1080;
let ctx;
function layer(alpha, draw) { if (alpha <= .001) return; ctx.save(); ctx.globalAlpha *= clamp(alpha); draw(); ctx.restore(); }
// Complementary masks hand the frame from one scene to the next without ghosted text.
const BOUNDARIES=[0,2.4,5.4,8.4,11.4,13.2,15];
function boundaryMask(progress,index,incoming){
  if(progress<=0){if(incoming)ctx.rect(0,0,.01,.01);else ctx.rect(0,0,W,H);return;}
  if(progress>=1){if(incoming)ctx.rect(0,0,W,H);else ctx.rect(0,0,.01,.01);return;}
  if(index===3){
    if(!incoming)ctx.rect(0,0,W,H);
    const radius=2400*progress;ctx.moveTo(725+radius,780);ctx.arc(725,780,radius,0,Math.PI*2);
    return;
  }
  if(index===2){const y=H*progress;ctx.rect(0,incoming?0:y,W,incoming?y:H-y);return;}
  const x=W*progress;ctx.rect(incoming?0:x,0,incoming?x:W-x,H);
}
function shotLayer(t,index,draw){
  const a=BOUNDARIES[index],b=BOUNDARIES[index+1],edge=.32;
  if(t<a-edge/2||t>b+edge/2)return;
  ctx.save();
  if(index>0){ctx.beginPath();boundaryMask(smooth((t-a+edge/2)/edge),index,true);ctx.clip(index===3?'evenodd':'nonzero');}
  if(index<5){ctx.beginPath();boundaryMask(smooth((t-b+edge/2)/edge),index+1,false);ctx.clip(index+1===3?'evenodd':'nonzero');}
  draw();ctx.restore();
}
function box(x, y, w, h, r, fill, stroke, lw = 2) {
  ctx.beginPath(); ctx.roundRect(x, y, Math.max(.1, w), Math.max(.1, h), Math.max(0, Math.min(r, w / 2, h / 2)));
  if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function circle(x, y, r, fill, stroke, lw = 2) {
  ctx.beginPath(); ctx.arc(x, y, Math.max(.1, r), 0, Math.PI * 2);
  if (fill) {ctx.fillStyle=fill;ctx.fill();} if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}
}
function path(points, color, width = 3) {
  ctx.beginPath(); points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p)); ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap="round";ctx.lineJoin="round";ctx.stroke();
}
function txt(value, x, y, size, color, family = "Display", align = "left", tracking = -2) {
  ctx.fillStyle = color; ctx.font = `${size}px ${family}`; ctx.textAlign = align; ctx.textBaseline = "alphabetic"; ctx.letterSpacing = `${tracking}px`; ctx.fillText(value, x, y); ctx.letterSpacing = "0px";
}
function shadow(draw, opacity = .16, blur = 40, y = 20) {
  ctx.save();ctx.shadowColor=`rgba(30,20,10,${opacity})`;ctx.shadowBlur=blur;ctx.shadowOffsetY=y;draw();ctx.restore();
}
function arrow(x,y,size,color,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);path([[-size/2,0],[size/2,0],[size/2-size*.32,-size*.32]],color,Math.max(3,size*.08));path([[size/2,0],[size/2-size*.32,size*.32]],color,Math.max(3,size*.08));ctx.restore();}
function grain(color) {
  ctx.fillStyle = color;
  for(let i=0;i<1600;i++){const x=((i*719+37)%1920),y=((i*397+17)%1080);ctx.fillRect(x,y,1.5,1.5);}
}
function cutTitle(t, label, y, start, end, color, size=178) {
  const a=1-smooth((t-end+.15)/.2),dy=lerp(size*1.2,0,spring(t-start));
  if(t<start)return;
  layer(a,()=>{ctx.save();ctx.beginPath();ctx.rect(110,y-size*1.08,1500,size*1.14);ctx.clip();txt(label,116,y+dy,size,color);ctx.restore();});
}

const paper = {bg:"#eee9df",ink:"#26251f",accent:"#ed4935",line:"#d0c9bd",muted:"#827d72"};
const dark = {bg:"#141719",ink:"#f0eee8",accent:"#5878ff",line:"#343a40",muted:"#9b9fa8"};

function noteCard(x,y,w,h,r,label,sub,selected=false,angle=0) {
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  shadow(()=>box(-w/2,-h/2,w,h,r,selected?paper.accent:"#faf7f0"),selected?.15:.1,30,15);
  const c=selected?"#fff5e8":paper.ink;
  circle(-w/2+43,-h/2+48,10,selected?"#fff5e8":paper.accent);
  txt(label,-w/2+30,-h/2+116,Math.min(36,w*.075),c,"Mono","left",-1);
  txt(sub,-w/2+30,h/2-35,22,selected?"#ffd9ca":paper.muted,"Mono","left",0);
  ctx.restore();
}

function forma(t) {
  const c=paper;ctx.fillStyle=c.bg;ctx.fillRect(0,0,W,H);
  grain("rgba(77,55,30,.07)");
  // Oversized typographic question; cards are its actual material.
  shotLayer(t,0,()=>{
    txt("TOO",112,354,238,c.ink);txt("MUCH.",112,598,238,c.ink);
    txt("32 THOUGHTS. ONE MIND.",122,705,26,c.muted,"Mono","left",0);
    const focus=smooth(t/.65);circle(1080,560,lerp(9,32,focus),c.accent);
  });
  // Continuous paper identities, shared between the establishing and selection views.
  if(t<5.25){
    const p=spring(t-2.25,120,21);
    const origins=[[1290,230,-.12],[1530,445,.13],[1260,660,-.09]];
    origins.forEach(([ox,oy,angle],i)=>{
      const selected=i===1,sel=spring(t-3.8);
      const x=lerp(ox,420+i*545,p),y=lerp(oy,590,p)-(selected?sel*42:0);
      const a=selected?1:1-smooth((t-5)/.25);
      layer(a,()=>noteCard(x,y,lerp(380,470,p),lerp(230,300,p),lerp(18,22,p),['COLLECT','FOCUS','SHIP'][i],['Everything in one place','One important thing','Make it happen'][i],selected,lerp(angle,0,p)));
      if(selected)layer(envelope(t,4.05,5.15,.2),()=>{circle(x,y+205,25,c.ink);path([[x-10,y+205],[x-2,y+213],[x+13,y+194]],c.bg,4);});
    });
    layer(1-smooth((t-2.1)/.5),()=>noteCard(1570,815,380,230,18,'INBOX','32 unread',false,.1));
  }
  layer(envelope(t,2.4,5.15,.3),()=>{
    const dy=lerp(50,0,spring(t-2.4,120,23));
    ctx.save();ctx.beginPath();ctx.rect(100,70,1500,245);ctx.clip();
    txt('MAKE ROOM.',116,218+dy,118,c.ink);txt('Choose what matters.',122,288+dy,29,c.muted,'Mono','left',-1);ctx.restore();
  });
  // Continuous shared card: selected paper expands into the focus panel.
  const sharedCardLayer=draw=>{if(t>=5.25&&t<8.24){draw();}else if(t>=8.24)shotLayer(t,2,draw);};
  sharedCardLayer(()=>{
    const p=spring(t-5.25,110,21),w=lerp(470,1110,p),h=lerp(300,595,p),x=lerp(965,1015,p),y=lerp(548,555,p);
    shadow(()=>box(x-w/2,y-h/2,w,h,lerp(22,36,p),colorMix(c.accent,"#faf7f0",smooth((t-5.25)/.5))),.18,70,32);
    const inset=x-w/2+65;
    layer(smooth((t-5.55)/.35),()=>{
      txt("YOUR ONE THING",inset,y-h/2+80,25,c.muted,"Mono","left",0);
      txt("Build something",inset,y-h/2+185,68,c.ink);txt("worth finishing.",inset,y-h/2+265,68,c.ink);
      path([[inset,y+84],[x+w/2-65,y+84]],c.line,2);
      txt("TODAY",inset,y+140,22,c.muted,"Mono","left",0);txt("No distractions.",inset+190,y+140,27,c.ink,"Mono","left",0);
    });
    const bw=lerp(410,400,p),by=y+h/2-105;
    box(inset,by,bw,66,33,c.accent);
    layer(smooth((t-5.8)/.3)*(1-smooth((t-8.25)/.4)),()=>txt("Start focus  ↗",inset+35,by+44,27,"#fff5e8","Mono","left",-1));
    layer(smooth((t-6)/.4),()=>{
      const cy=by+42,cx=lerp(1700,inset+bw-48,spring(t-6.1));
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+5,cy+33);ctx.lineTo(cx+14,cy+24);ctx.lineTo(cx+27,cy+22);ctx.closePath();ctx.fillStyle=c.ink;ctx.fill();
      const pulse=envelope(t,7.7,8.25,.15);circle(cx+7,cy+12,12+pulse*27,null,`rgba(237,73,53,${pulse*.6})`,3);
    });
    // Functional side marks have semantic content, not ornamental borders.
    layer(smooth((t-5.9)/.4),()=>{txt("01",175,530,140,c.accent);txt("PRIORITY",183,576,25,c.muted,"Mono","left",0);});
  });
  // Rectangle-to-ring handoff: same accent, position, then expanded view.
  shotLayer(t,3,()=>{
    const p=spring(t-8.4,125,22),cx=lerp(725,1110,p),cy=lerp(780,565,p),r=lerp(33,260,p);
    const bw=lerp(400,520,p),bh=lerp(66,520,p);
    box(cx-bw/2,cy-bh/2,bw,bh,r,colorMix(c.accent,'#faf7f0',p),c.line,3);
    ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+Math.PI*2*clamp((t-8.5)/2.55));ctx.strokeStyle=c.accent;ctx.lineWidth=18;ctx.lineCap="round";ctx.stroke();
    layer(smooth((t-8.85)/.35),()=>{txt("25:00",cx,cy+25,92,c.ink,"Display","center",-5);txt("FOCUS SESSION",cx,cy+90,24,c.muted,"Mono","center",0);});
    cutTitle(t,"LESS.",430,8.5,11.6,c.ink,120);cutTitle(t,"BETTER.",570,8.55,11.6,c.ink,120);
    layer(smooth((t-9)/.35),()=>txt("One task. All your attention.",120,660,26,c.muted,"Mono","left",-1));
  });
  shotLayer(t,4,()=>{
    const p=spring(t-11.2,105,19);txt("ONE.",lerp(400,115,p),718,420,c.accent);txt("IS ENOUGH.",128,837,76,c.ink);
    circle(1485,520,130,null,c.ink,15);path([[1420,521],[1470,569],[1557,461]],c.ink,18);
  });
  shotLayer(t,5,()=>{
    const p=spring(t-13.15,95,20);txt("FORMA",lerp(190,115,p),610,250,c.ink);txt("Space for what matters.",125,720,34,c.muted,"Mono","left",-1);
    txt("收起杂念。留住重点。",126,790,31,c.ink,"Chinese","left",1);
    ctx.save();ctx.translate(1550,525);ctx.rotate(lerp(-.4,-.15,p));box(-100,-135,200,270,12,c.accent);path([[-52,48],[0,-50],[52,48]],c.bg,14);ctx.restore();
  });
}

// Perspective projection of a genuinely rotated 3D point, not whole-frame zoom.
function project(x,y,z,rx,ry,scale=1,cx=960,cy=570){
  const a=x*Math.cos(ry)+z*Math.sin(ry),b=-x*Math.sin(ry)+z*Math.cos(ry);
  const yy=y*Math.cos(rx)-b*Math.sin(rx),zz=y*Math.sin(rx)+b*Math.cos(rx);
  const perspective=1100/(1400+zz);return {x:cx+a*perspective*scale,y:cy+yy*perspective*scale,z:zz,s:perspective*scale};
}
function signal(t,x,y,width,amp,alpha=1){layer(alpha,()=>{const points=[];for(let i=0;i<=140;i++){const u=i/140;points.push([x+u*width,y+Math.sin(u*Math.PI*12-t*5)*amp*Math.pow(Math.sin(u*Math.PI),2)]);}path(points,dark.accent,8);});}
function rollingNumber(t,value,x,y,size){
  const p=clamp((t-8.45)/1.9),n=lerp(0,value,smooth(p)),digitWidth=size*.72,str=String(value),count=str.length;
  ctx.save();ctx.beginPath();ctx.rect(x-8,y-size*1.03,digitWidth*count+20,size*1.3);ctx.clip();
  for(let i=0;i<count;i++){
    const pow=10**(count-i-1),base=Math.floor(n/pow);
    // A higher column rolls only during the final unit before its carry.
    const fraction=pow===1?n-base:clamp(n-base*pow-(pow-1));
    const xx=x+i*digitWidth;
    // At the settled value, all columns share exact aligned baselines.
    txt(String(base%10),xx,y-fraction*size*1.3,size,dark.ink,"Display","left",-2);
    txt(String((base+1)%10),xx,y+(1-fraction)*size*1.3,size,dark.ink,"Display","left",-2);
  }ctx.restore();
}
function relay(t){
  const c=dark;ctx.fillStyle=c.bg;ctx.fillRect(0,0,W,H);grain("rgba(255,255,255,.07)");
  // Beginning is a complete statement, with a single signal passing through it.
  shotLayer(t,0,()=>{
    txt("A",116,330,192,c.ink);txt("SIGNAL.",106,582,245,c.ink);
    txt("EVERY CONNECTION STARTS SOMEWHERE.",124,714,26,c.muted,"Mono","left",0);
    signal(t,1020,415,740,150);circle(1040+clamp(t/2.4)*670,415,22,c.accent);
    path([[1020,815],[1750,815]],c.line,3);txt("01 → MANY",1020,872,26,c.accent,"Mono","left",0);
  });
  // Routing is literal: packets traverse the existing line into the next node.
  shotLayer(t,1,()=>{
    txt("PASS IT ON.",116,232,115,c.ink);txt("An idea becomes a connection.",120,298,26,c.muted,"Mono","left",-1);
    const branches=[-1,0,1];
    branches.forEach((b,i)=>{
      const yy=570+b*160;
      path([[270,570],[690,570],[850,yy],[1450,yy]],c.line,5);
      const p=clamp((t-2.4-i*.18)/1.1),xx=p<.5?lerp(270,690,p*2):lerp(690,1450,(p-.5)*2),py=p<.5?570:lerp(570,yy,clamp((xx-690)/160));
      path([[270,570],[Math.min(xx,690),570]],c.accent,5);circle(xx,py,14,c.accent);
      const a=spring(t-3.8-i*.1);circle(1450,yy,lerp(6,28,a),c.accent);circle(1450,yy,lerp(7,52,a),null,c.line,2);
      layer(smooth((t-4)/.3),()=>txt(["IDEA","TEAM","WORLD"][i],1540,yy+9,25,c.ink,"Mono","left",0));
    });
    circle(270,570,64,c.accent);arrow(270,570,68,c.ink);circle(690,570,35,c.bg,c.accent,5);
  });
  // Network view: camera rotates; x/y/z and depth ordering are recomputed each seek.
  shotLayer(t,2,()=>{
    txt("CONNECTED.",116,210,104,c.ink);
    const nodes=[],rx=.6+.08*Math.sin((t-5)*.9),ry=lerp(-.45,.42,clamp((t-5.3)/3));
    const handoff=spring(t-5.4,85,18),cx=lerp(1450,1060,handoff),cy=lerp(570,630,handoff),zoom=lerp(.64,1.15,handoff);
    for(let row=0;row<5;row++)for(let col=0;col<9;col++){
      const x=(col-4)*205,y=(row-2)*205,z=Math.sin(col*.7+row*.5)*75;
      nodes.push({...project(x,y,z,rx,ry,zoom,cx,cy),row,col});
    }
    for(const a of nodes){for(const b of nodes){if((b.row===a.row&&b.col===a.col+1)||(b.col===a.col&&b.row===a.row+1)){path([[a.x,a.y],[b.x,b.y]],c.line,2);}}}
    const ordered=[...nodes].sort((a,b)=>b.z-a.z);
    ordered.forEach(n=>{const active=clamp((t-5.35-(n.row+n.col)*.06)/.25);circle(n.x,n.y,9*n.s,c.bg,c.line,2);circle(n.x,n.y,5*n.s,c.accent);layer(active,()=>circle(n.x,n.y,(8+3*Math.sin(t*4-n.col))*n.s,c.accent));});
    const center=nodes.find(n=>n.row===2&&n.col===4);circle(center.x,center.y,55*center.s,c.accent);arrow(center.x,center.y,55*center.s,c.ink,ry*.25);
    txt("ONE SYSTEM. MANY POSSIBILITIES.",120,925,26,c.muted,"Mono","left",0);
  });
  shotLayer(t,3,()=>{
    txt("SMALL START.",116,223,108,c.ink);txt("BIG REACH.",116,349,108,c.accent);
    rollingNumber(t,1024,160,784,300);
    txt("CONNECTIONS / CONCEPT DATA",172,890,24,c.muted,"Mono","left",0);
    const p=spring(t-8.4);for(let i=0;i<12;i++){const h=(80+(i%4)*40)*p;box(1360+(i%3)*125,410+Math.floor(i/3)*110-h/10,80,h/3,9,i%4===0?c.accent:c.line);}
  });
  shotLayer(t,4,()=>{
    const p=spring(t-11.25,95,20);ctx.save();ctx.translate(lerp(200,0,p),0);txt("NETWORK",95,540,250,c.ink);txt("EFFECT.",105,790,250,c.accent);ctx.restore();
    path([[1240,250],[1490,250],[1650,100],[1780,100]],c.accent,18);
  });
  shotLayer(t,5,()=>{
    const p=spring(t-13.2,110,21);txt("RELAY",115,625,263,c.ink);txt("From one. To everyone.",125,738,32,c.muted,"Mono","left",-1);txt("让每一次连接，继续向前。",126,809,30,c.ink,"Chinese","left",1);
    ctx.save();ctx.translate(1525,535);ctx.rotate(lerp(-.2,0,p));path([[-150,85],[-55,-10],[20,65],[160,-75]],c.accent,49);path([[40,-75],[160,-75],[160,45]],c.accent,49);ctx.restore();
  });
}

window.StudioDirector = { spring, track, render(canvas, film, time) {
  ctx=canvas.getContext("2d");ctx.save();ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
  ctx.globalAlpha=1;ctx.clearRect(0,0,W,H);(film==="forma"?forma:relay)(clamp(time,0,15));ctx.restore();
}};
