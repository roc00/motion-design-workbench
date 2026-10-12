/* Original score + action cues. Generated locally; no third-party recording. */
import {writeFileSync,readFileSync} from 'node:fs';
const sr=48000,n=sr*15,plan=JSON.parse(readFileSync('studio/plan.json','utf8'));
for(const film of plan.films){
  const music=new Float32Array(n),fx=new Float32Array(n);let seed=734;
  const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
  function add(buf,start,len,fn){const a=Math.max(0,Math.round(start*sr)),b=Math.min(n,Math.round((start+len)*sr));for(let i=a;i<b;i++)buf[i]+=fn((i-a)/sr,(i-a)/(b-a));}
  function note(at,midi,len=.55,vol=.08){const f=440*2**((midi-69)/12);add(music,at,len,(t,p)=>Math.sin(2*Math.PI*f*t)*(Math.exp(-t*8)+.15*Math.exp(-t*2))*(Math.min(1,t/.006))*vol);}
  const isForma=film.film==='forma';
  for(let beat=0;beat<30;beat++){
    const at=beat*.5;
    if(at>13.5)break;
    if(isForma){note(at,[60,67,64,72,67,64,62,69][beat%8],.7,.12);if(beat%2===0)note(at,beat<16?48:53,.8,.13);}
    else {note(at,[36,36,43,36,39,46,43,39][beat%8],.32,.2);if(beat%3===0)note(at+.25,[72,75,79][beat%3],.16,.08);}
    if(beat%2===0)add(music,at,.23,t=>Math.sin(2*Math.PI*(48*t+1.5*(1-Math.exp(-t*25))))*Math.exp(-t*19)*.26);
    if(beat%2===1)add(music,at,.1,t=>noise()*Math.exp(-t*50)*.13+Math.sin(t*2*Math.PI*180)*Math.exp(-t*45)*.06);
    if(!isForma)for(const off of [0,.25])add(music,at+off,.04,t=>noise()*Math.exp(-t*110)*.04);
  }
  for(const shot of film.shots.slice(1)){
    const at=shot.fromMs/1000;
    add(fx,at-.12,.28,(t,p)=>noise()*Math.sin(p*Math.PI)**2*(isForma?.04:.075));
    add(fx,at,.16,t=>Math.sin(2*Math.PI*(isForma?880:1320)*t)*Math.exp(-t*36)*.16);
  }
  [60,64,67,72].forEach((m,i)=>note(13.3+i*.09,m,1.5,.1));
  function wav(buf,path){const b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(36+n*2,4);b.write('WAVE',8);b.write('fmt ',12);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(sr,24);b.writeUInt32LE(sr*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);for(let i=0;i<n;i++){const fade=Math.min(1,(n-i)/(sr*.18));b.writeInt16LE(Math.round(Math.max(-.96,Math.min(.96,buf[i]*fade))*32767),44+i*2);}writeFileSync(path,b);}
  const mix=Float32Array.from(music,(v,i)=>v+fx[i]);
  wav(music,`studio/evidence/${film.film}-music.wav`);wav(fx,`studio/evidence/${film.film}-sfx.wav`);wav(mix,`films/director-${film.film}.wav`);
}
console.log('Original music and independent action stems generated (48 kHz / 15s).');
