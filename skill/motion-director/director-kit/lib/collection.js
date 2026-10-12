/* A continuous ensemble scene. Every pose derives only from t. No frame history. */
(() => {
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = (t,a,b) => {const p=clamp((t-a)/(b-a));return p*p*p*(p*(p*6-15)+10);};
  const mix = (a,b,p) => a+(b-a)*p;
  const colours = ['#94a896','#e35d43','#edc75f','#8e9fc0','#b9aac6','#ce9681','#719896','#bcc981'];
  function text(c,s,x,y,size,colour,font='Display') {c.fillStyle=colour;c.font=`${size}px ${font}`;c.fillText(s,x,y);}
  function artwork(c,i,w,h,labelAlpha=1) {
    c.fillStyle=colours[i];c.fillRect(-w/2,-h/2,w,h);
    c.save();c.beginPath();c.rect(-w/2,-h/2,w,h);c.clip();
    c.translate(0,-h*.03);
    if(i%4===1) {
      c.fillStyle='#f1dfbd';c.beginPath();c.arc(0,-h*.08,h*.27,0,Math.PI*2);c.fill();
      c.fillStyle='#242922';c.beginPath();c.moveTo(-w*.5,h*.4);c.lineTo(0,-h*.2);c.lineTo(w*.5,h*.4);c.fill();
      c.fillStyle='#e35d43';c.beginPath();c.arc(0,h*.18,h*.13,0,Math.PI*2);c.fill();
    } else if(i%4===0) {
      for(let k=0;k<5;k++){c.strokeStyle=k%2?'#ece8d9':'#203b31';c.lineWidth=h*.09;c.beginPath();c.arc(-w*.23,h*.15,h*(.12+k*.17),Math.PI*1.03,Math.PI*1.93);c.stroke();}
    } else if(i%4===2) {
      c.translate(w*.05,0);c.rotate(-.35);for(let k=0;k<4;k++){c.fillStyle=k%2?'#f4edd5':'#b9523e';c.fillRect(-w*.42+k*w*.22,-h*.7,w*.14,h*1.4);}
    } else {
      c.fillStyle='#283945';c.beginPath();c.arc(-w*.16,-h*.05,h*.31,0,Math.PI*2);c.fill();
      c.fillStyle='#e9e5db';c.beginPath();c.arc(w*.18,h*.06,h*.31,0,Math.PI*2);c.fill();
    }
    c.restore();
    c.fillStyle='rgba(245,242,234,.94)';c.fillRect(-w/2,h*.31,w,h*.19);
    c.save();c.globalAlpha*=labelAlpha;
    text(c,['FIELD STUDY','SOLAR FORMS','COLOUR NOTES','IN BALANCE','AFTER HOURS','NEW TERRAIN','QUIET SPACE','DAYLIGHT'][i],-w*.45,h*.425,h*.062,'#262922','Mono');
    text(c,`0${i+1}` ,w*.34,h*.425,h*.062,'#262922','Mono');c.restore();
  }
  function card(c,i,x,y,w,h,angle,alpha=1,labelAlpha=1) {
    c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(angle);
    c.shadowColor='rgba(32,36,28,.18)';c.shadowBlur=24;c.shadowOffsetY=14;
    c.fillStyle=colours[i];c.fillRect(-w/2,-h/2,w,h);c.shadowColor='transparent';
    artwork(c,i,w,h,labelAlpha);c.restore();
  }
  function render(canvas,film,time) {
    const c=canvas.getContext('2d'); const t=Math.max(0,Math.min(8.6,time));
    c.setTransform(canvas.width/1920,0,0,canvas.height/1080,0,0);
    c.clearRect(0,0,1920,1080);c.fillStyle='#eeeae0';c.fillRect(0,0,1920,1080);
    // Frozen fine paper pattern, independent of time and viewport.
    c.fillStyle='rgba(50,55,42,.045)';for(let i=0;i<1800;i++){const x=(i*719)%1920,y=(i*487)%1080;c.fillRect(x,y,1.6,1.6);}
    text(c,'ATELIER / COLLECTION',92,84,21,'#50574b','Mono');
    text(c,'DESIGN STUDY · 2026',1510,84,21,'#50574b','Mono');
    const expansion=ease(t,1.8,4.4), titleOut=1-ease(t,1.6,2.1), titleIn=ease(t,4.4,4.9);
    c.save();c.globalAlpha=titleOut;
    text(c,'ONE',90,410,176,'#242a22');text(c,'IDEA.',90,581,176,'#242a22');
    text(c,'Start with something worth keeping.',96,666,24,'#50574b','Mono');c.restore();
    c.save();c.globalAlpha=titleIn;
    text(c,'ROOM FOR MORE.',92,233,115,'#242a22');
    text(c,'A collection, with one recognisable origin.',96,285,23,'#50574b','Mono');c.restore();
    // Companions depart from the exact hero pose; each receives its own content.
    const order=[0,2,5,4,6,3,7];
    for(let k=0;k<order.length;k++) {
      const i=order[k],p=ease(t,2.12+k*.13,3.8+k*.13);
      if(p<=0)continue;
      const x=292+(i%4)*445,y=467+Math.floor(i/4)*307;
      card(c,i,mix(1340,x,p),mix(566,y,p),mix(660,390,p),mix(495,252,p),mix(-.07,(i%2?.018:-.018)*(1-expansion),p),ease(t,2.12+k*.13,2.35+k*.13),ease(t,3.8+k*.13,4.0+k*.13));
    }
    // The coral origin keeps content, colour and identity throughout the move.
    const heroX=mix(1340,737,expansion),heroY=mix(566,467,expansion),w=mix(660,390,expansion),h=mix(495,252,expansion);
    card(c,1,heroX,heroY,w,h,mix(-.07,0,expansion),1,1-ease(t,1.8,2.1)+ease(t,4.35,4.65));
    const focus=ease(t,5.55,6.15);
    c.save();c.globalAlpha=focus;c.strokeStyle='#e35d43';c.lineWidth=3;c.strokeRect(heroX-w/2-9,heroY-h/2-9,w+18,h+18);
    text(c,'ORIGINAL',heroX-w/2,heroY+h/2+36,17,'#a84231','Mono');c.restore();
    c.strokeStyle='#c8cabe';c.lineWidth=1;c.beginPath();c.moveTo(92,955);c.lineTo(1828,955);c.stroke();
    text(c,t<4.4?'ONE WORK. MANY POSSIBILITIES.':'EIGHT WORKS. ONE COLLECTION.',92,1005,22,'#50574b','Mono');
    const n=1+order.filter((_,k)=>t>=3.8+k*.13).length;
    text(c,`${String(n).padStart(2,'0')} / 08`,1660,1005,27,'#242a22','Mono');
  }
  window.StudioDirector={render};
})();
