
/* ============ CANVAS ============ */
const W=1920,H=1080;
const cv=document.getElementById('c');
cv.width=W;cv.height=H;
const g=cv.getContext('2d');
const BG='#060606';
const ACC='#FF6B2C';
const CX=W/2,CY=H/2;

/* dot grid background */
const dots=[];
{
  const rr=rng(11);
  for(let y=60;y<H;y+=60)for(let x=60;x<W;x+=60){
    if(rr()<0.5)dots.push({x,y,s:0.6+rr()*1.2});
  }
}
function drawGrid(a){
  for(const d of dots){g.fillStyle=`rgba(255,255,255,${0.05*a})`;g.beginPath();g.arc(d.x,d.y,d.s,0,7);g.fill();}
}
function glow(x,y,r,a){
  const gr=g.createRadialGradient(x,y,0,x,y,r);
  gr.addColorStop(0,`rgba(255,107,44,${a})`);gr.addColorStop(1,'rgba(255,107,44,0)');
  g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);
}

/* particles (converge during beat2) */
const PARTICLES=[];
{
  const rr=rng(23);
  for(let i=0;i<70;i++){
    PARTICLES.push({x:rr()*W,y:rr()*H,del:rr()*0.4});
  }
}
function drawParticles(t,p){
  const x=CX,y=CY;
  for(const q of PARTICLES){
    const u=clamp((p-q.del)/(1-q.del));
    const e=easeInOutCubic(u);
    const px=lerp(q.x,x,e),py=lerp(q.y,y,e);
    g.fillStyle=`rgba(255,${Math.round(lerp(180,107,e))},${Math.round(lerp(120,44,e))},${(1-e)*0.8+0.2})`;
    g.beginPath();g.arc(px,py,2.2,0,7);g.fill();
  }
}

/* orbit rings */
const RINGS=[
  {r:150,tilt:0,rot:0.3,sp:0.25},
  {r:230,tilt:0.0,rot:1.2,sp:-0.18},
  {r:310,tilt:0.0,rot:2.1,sp:0.13},
  {r:400,tilt:0,rot:0.7,sp:-0.09}
];
function drawRings(t,appear,ox,oy){
  const sc=0.6+0.4*spring(appear-0.1,140,18);
  RINGS.forEach((ring,ri)=>{
    const ar=clamp(spring(appear-ri*0.12,140,18));
    const col=ri===1?ACC:'#ffffff';
    g.strokeStyle=ri===1?rgba(ACC,0.55*ar):`rgba(255,255,255,${0.16*ar})`;
    g.lineWidth=ri===1?2:1.2;
    g.save();g.translate(ox,oy);g.scale(sc,sc*0.99);
    g.beginPath();g.arc(0,0,ring.r,0,7);g.stroke();
    // rotating dot markers
    const nm=ri===1?3:6;
    for(let k=0;k<nm;k++){
      const a=t*ring.sp+(k/nm)*2*Math.PI+ring.rot;
      const px=Math.cos(a)*ring.r,py=Math.sin(a)*ring.r;
      g.fillStyle=ri===1?rgba(ACC,ar):`rgba(255,255,255,${0.7*ar})`;
      g.beginPath();g.arc(px,py,ri===1?5:3,0,7);g.fill();
    }
    g.restore();
  });
}

/* odometer (comma grouped; fast columns blur like a real counter) */
function drawOdometer(n,nRate,cx,cy,fs){
  const maxLen=7;
  const dw=fs*0.62,dh=fs*1.25,gap=fs*0.4;
  const cols=[];
  for(let place=0;place<maxLen;place++)cols.push({place,groupStart:place%3===2});
  let total=0;cols.forEach(c=>{total+=dw;if(c.groupStart)total+=gap;});
  cols.reverse();
  let xpos=cx-total/2;
  g.textBaseline='middle';g.textAlign='center';
  g.font='700 '+fs+'px Inter,system-ui';
  for(const c of cols){
    if(c.groupStart)xpos+=gap;
    const place=c.place;
    const reached=Math.round(n)>=Math.pow(10,place);
    if(reached||place===0){
      const raw=n/Math.pow(10,place);
      const colRate=nRate/Math.pow(10,place);
      g.save();
      g.beginPath();g.rect(xpos,cy-dh/2,dw,dh);g.clip();
      if(colRate>12){
        // spinning: soft blur band + sampled digits
        const gr=g.createLinearGradient(0,cy-dh/2,0,cy+dh/2);
        gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,.16)');gr.addColorStop(1,'rgba(255,255,255,0)');
        g.fillStyle=gr;g.fillRect(xpos,cy-dh/2,dw,dh);
        for(let s=0;s<5;s++){
          const yOff=-dh/2+(s/4)*dh;
          const digit=Math.floor(raw - s/4 + 100)%10;
          g.fillStyle='rgba(255,255,255,.14)';
          g.fillText(digit,xpos+dw/2,cy+yOff);
        }
      }else{
        const v=n/Math.pow(10,place);
        const floor=Math.floor(v);
        const r=v-floor;
        const carry=smooth(0.82,1,r);
        const cur=floor%10,nxt=(cur+1)%10;
        const off=carry*dh;
        g.fillStyle='#fff';g.fillText(cur,xpos+dw/2,cy+off);
        g.fillStyle='rgba(255,255,255,.28)';g.fillText(nxt,xpos+dw/2,cy+off-dh);
      }
      g.restore();
    }
    xpos+=dw;
  }
}

/* sphere */
const SP=spherePoints(240);
function drawSphere(t,rise,cx,cy,R){
  const ar=clamp(rise);
  const yRise=lerp(H+300,cy,easeOutCubic(ar));
  const ang=t*0.4;
  // faint boundary + equator rings
  g.save();
  g.strokeStyle=`rgba(255,255,255,${0.12*ar})`;g.lineWidth=1;
  g.beginPath();g.arc(cx,yRise,R,0,7);g.stroke();
  g.strokeStyle=rgba(ACC,0.22*ar);
  for(let k=1;k<=2;k++){
    const ry=R*Math.sin(k*Math.PI/4);
    const rx=R*Math.cos(k*Math.PI/4);
    g.beginPath();g.ellipse(cx,yRise,R,ry,0,0,7);g.stroke();
  }
  g.restore();
  const proj=[];
  for(const p0 of SP){
    let p=rotY(p0,ang);
    p=rotX(p,0.4);
    const pers=2.6/(2.6+p.z);
    proj.push({x:cx+p.x*R*pers,y:yRise+p.y*R*pers,z:p.z});
  }
  proj.sort((a,b)=>a.z-b.z);
  for(const q of proj){
    const depth=(q.z+1)/2;
    const isAcc=((q.x*7+q.y*5)%1>0.86);
    g.fillStyle=isAcc?rgba(ACC,ar*(0.35+0.6*depth)):`rgba(255,255,255,${ar*(0.12+0.6*depth)})`;
    const sz=1.5+depth*2.8;
    g.beginPath();g.arc(q.x,q.y,sz,0,7);g.fill();
  }
}

/* ============ BEAT TIMELINE ============ */
const B=[0,2.5,5.2,9.4,12.4,15];
function beatAlpha(t,start,end,{inT=0.45,outT=0.45}={}){
  return clamp(smooth(start,start+inT,t))*clamp(1-smooth(end-outT,end,t));
}

function draw(t){
  g.fillStyle=BG;g.fillRect(0,0,W,H);
  drawGrid(1);
  /* ambient glow */
  glow(CX,CY,500,0.12);

  /* ----- BEAT 1: pill ----- */
  const a1=clamp(1-smooth(B[1]-0.5,B[1],t));
  let py=CY;
  if(t>B[1]){ // move up a touch as it hands off
    const e=clamp((t-B[1])/0.5);
    py=lerp(CY,CY-20,easeInOutCubic(e));
  }
  if(a1>0.02){
    const push=clamp(smooth(B[1]-0.4,B[1],t)); // streak into camera
    g.save();g.globalAlpha=a1;
    g.translate(CX,py);
    const z=1+push*0.25;g.scale(z,z);
    if(push>0.4)g.filter='blur('+((push-0.4)*20)+'px)';
    drawPill(0,0,0);
    g.restore();
  }

  /* ----- BEAT 2: rings + converge ----- */
  const p=clamp((t-2.6)/1.8);
  drawParticles(t,spring(p,120,16));
  {
    // rings around pill
    const ringA=clamp(spring(t-2.4,140,18));
    const fade=clamp(1-smooth(4.8,5.3,t));
    if(ringA>0.02&&fade>0.02){
      g.save();g.globalAlpha=ringA*fade;
      drawRingsStatic(t,CX,py,1);
      g.restore();
    }
  }

  /* ----- BEAT 3: number ----- */
  const a3=beatAlpha(t,5.0,9.5,{inT:0.5,outT:0.4});
  if(a3>0.02){
    g.save();g.globalAlpha=a3;
    let prog=clamp((t-5.4)/3.0);
    let nval,nRate;
    if(prog>0.985){nval=1271680;nRate=0;}
    else{
      nval=1271680*easeOutExpo(prog);
      const dExp=6.931*Math.pow(2,-10*prog);
      nRate=1271680*dExp/3.0;
    }
    drawOdometer(nval,nRate,CX,CY+10,120);
    g.fillStyle=rgba(ACC,0.9);g.font='600 30px Inter';g.textAlign='center';
    g.fillText('LINKS CREATED · TODAY',CX,CY+150);
    g.restore();
  }

  /* ----- BEAT 4: sphere ----- */
  const a4=beatAlpha(t,9.2,12.5,{inT:0.4,outT:0.5});
  if(a4>0.02){
    g.save();g.globalAlpha=a4;
    drawSphere(t,(t-9.4)/1.2,CX,CY-30,330);
    g.restore();
  }

  /* ----- BEAT 5: logo ----- */
  const a5=beatAlpha(t,12.2,15,{inT:0.5,outT:0.01});
  if(a5>0.02){
    g.save();g.globalAlpha=a5;
    drawLogo(t-12.2);
    g.restore();
  }
}

/* pill */
function drawPill(cx,cy,lt){
  const w=360,h=88,x=cx-w/2,y=cy-h/2;
  g.fillStyle='rgba(16,16,16,.9)';
  g.shadowColor='rgba(255,107,44,.35)';g.shadowBlur=30;
  rr(g,x,y,w,h,44);g.fill();
  g.shadowBlur=0;
  g.strokeStyle=rgba(ACC,.5);g.lineWidth=1.5;rr(g,x,y,w,h,44);g.stroke();
  g.fillStyle='#fff';
  g.beginPath();g.arc(x+44,cy,9,0,7);g.fill();
  g.font='600 34px Inter';g.textAlign='left';g.textBaseline='middle';
  g.fillText('dub.sh/launch',x+68,cy+1);
}

/* static rings helper (reuse drawRings with own alpha already) */
function drawRingsStatic(t,ox,oy,mult){
  RINGS.forEach((ring,ri)=>{
    const ar=clamp(spring((t-2.4)-ri*0.1,140,18));
    g.strokeStyle=ri===1?rgba(ACC,0.5*ar):`rgba(255,255,255,${0.14*ar})`;
    g.lineWidth=ri===1?2:1.2;
    g.beginPath();g.arc(ox,oy,ring.r,0,7);g.stroke();
    const nm=ri===1?3:6;
    for(let k=0;k<nm;k++){
      const a=t*ring.sp+(k/nm)*2*Math.PI+ring.rot;
      g.fillStyle=ri===1?rgba(ACC,ar):`rgba(255,255,255,${0.7*ar})`;
      g.beginPath();g.arc(ox+Math.cos(a)*ring.r,oy+Math.sin(a)*ring.r,ri===1?5:3,0,7);g.fill();
    }
  });
}

/* logo */
function drawLogo(lt){
  const c=spring(lt-0.1,150,18);
  const s=0.8+0.2*c;
  g.save();g.translate(CX,CY-10);g.scale(s,s);
  g.fillStyle='#fff';g.font='800 130px Inter,system-ui';g.textAlign='center';g.textBaseline='middle';
  g.fillText('dub',0,0);
  g.restore();
  const t2=clamp(spring(lt-0.5,140,16));
  g.globalAlpha=t2;
  g.fillStyle=rgba(ACC,1);g.font='500 34px Inter';g.textAlign='center';
  g.fillText('Short links, big results.',CX,CY+110);
  g.globalAlpha=1;
}
