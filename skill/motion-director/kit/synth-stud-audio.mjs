#!/usr/bin/env node
/* Soundtracks for the two STUDIO films (stud-morph, stud-orbit).
   Pure additive/noise synthesis -> 48k WAV -> ffmpeg AAC. */
import { writeFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const SR = 48000;
const DUR = 15.1;
const N = Math.ceil(DUR * SR);

function mulberry(seed){ return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}; }

function makeTrack(){
  const buf=new Float32Array(N);
  const rand=mulberry(99);
  let noiseBuf=new Float32Array(N);
  for(let i=0;i<N;i++)noiseBuf[i]=rand()*2-1;
  let nPos=0;const noise=()=>noiseBuf[(nPos++)%N];

  function osc(start,len,type,f0,vol,happen,glideTo){
    const s=Math.floor(start*SR),e=Math.min(N,Math.floor((start+len)*SR));
    for(let i=s;i<e;i++){
      const t=(i-s)/SR,lt=t/len;
      const f=glideTo?f0+(glideTo-f0)*Math.min(1,lt*3):f0;
      const ph=2*Math.PI*f*t;let v=0;
      if(type==='sine')v=Math.sin(ph);
      else if(type==='tri')v=2/Math.PI*Math.asin(Math.sin(ph));
      else if(type==='saw'){for(let h=1;h<=8;h++)v+=Math.sin(ph*h)/h;v*=2/Math.PI;}
      else if(type==='square'){v=Math.sin(ph)>=0?1:-1;}
      const env=happen?happen(lt):(1-lt);
      buf[i]+=v*vol*env;
    }
  }
  let prev2=0;
  function nburst(start,len,vol,happen,cut=0.6){
    const s=Math.floor(start*SR),e=Math.min(N,Math.floor((start+len)*SR));
    for(let i=s;i<e;i++){
      const t=(i-s)/SR,lt=t/len;
      const x=noise();const v=prev2+(x-prev2)*cut;
      const env=happen?happen(lt):(1-lt);
      buf[i]+=v*vol*env;
    }
  }
  function kick(start,vol=1){
    const len=0.3;const s=Math.floor(start*SR),e=Math.min(N,s+Math.floor(len*SR));
    for(let i=s;i<e;i++){
      const t=(i-s)/SR,f=130*Math.exp(-t*24)+46;
      buf[i]+=Math.sin(2*Math.PI*f*t)*Math.exp(-t*7)*vol*0.9;
    }
  }
  function hat(start,vol=1){
    const len=0.05;const s=Math.floor(start*SR),e=Math.min(N,s+Math.floor(len*SR));
    for(let i=s;i<e;i++){const t=(i-s)/SR;buf[i]+=noise()*0.4*vol*Math.exp(-t*60);}
  }
  function whoosh(start,len=0.7,vol=1){
    const s=Math.floor(start*SR),e=Math.min(N,s+Math.floor(len*SR));
    let lp=0;
    for(let i=s;i<e;i++){
      const t=(i-s)/SR,lt=t/len,x=noise();
      const cut=0.18+0.6*lt;const v=lp+(x-lp)*cut;
      buf[i]+=v*vol*0.4*Math.sin(Math.PI*lt);
    }
  }
  // UI click: short high blip
  function click(start,vol=1,freq=2100){
    const len=0.045;const s=Math.floor(start*SR),e=Math.min(N,s+Math.floor(len*SR));
    for(let i=s;i<e;i++){const t=(i-s)/SR;buf[i]+=Math.sin(2*Math.PI*freq*t)*Math.exp(-t*85)*vol*0.4;}
  }
  // soft pop: short sine with pitch rise, rounded
  function pop(start,vol=1){
    const len=0.22;const s=Math.floor(start*SR),e=Math.min(N,s+Math.floor(len*SR));
    for(let i=s;i<e;i++){
      const t=(i-s)/SR,lt=t/len;
      const f=300+500*easeOutCubic(lt);
      buf[i]+=Math.sin(2*Math.PI*f*t)*Math.exp(-lt*9)*vol*0.5;
    }
  }
  function pad(start,len,freqs,vol=1){
    const s=Math.floor(start*SR),e=Math.min(N,s+Math.floor(len*SR));
    for(let i=s;i<e;i++){
      const t=(i-s)/SR;
      const a=Math.min(1,t*2)*Math.min(1,(len-t)*1.4);
      let v=0;for(const f of freqs){v+=Math.sin(2*Math.PI*f*t)*0.5;v+=Math.sin(2*Math.PI*f*1.005*t)*0.5;}
      buf[i]+=v/freqs.length*vol*a*0.2;
    }
  }
  function bass(start,len,freq,vol=1){
    const s=Math.floor(start*SR),e=Math.min(N,s+Math.floor(len*SR));
    for(let i=s;i<e;i++){
      const t=(i-s)/SR,lt=t/len;
      const a=Math.min(1,t*20)*Math.min(1,(len-t)*10);
      buf[i]+=(Math.sin(2*Math.PI*freq*t)+Math.sin(2*Math.PI*freq*2*t)*0.3)*vol*a*0.26;
    }
  }
  return {buf,osc,nburst,kick,hat,whoosh,click,pop,pad,bass};
}
const easeOutCubic=x=>1-Math.pow(1-x,3);

const NOTE={};
(function(){
  const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  for(let oct=0;oct<8;oct++)for(let i=0;i<12;i++){
    const midi=(oct+1)*12+i;NOTE[names[i]+oct]=440*Math.pow(2,(midi-69)/12);
  }
})();
const Nn=n=>NOTE[n];

/* ============ STUD-MORPH: light playful UI (108 BPM) ============ */
function buildMorph(){
  const T=makeTrack();
  // gentle light bed: C major / F / G / Am soft pad, bright
  const chords=[
    {t:0,pad:['C4','E4','G4']},
    {t:3.7,pad:['F3','A3','C4']},
    {t:7.4,pad:['G3','B3','D4']},
    {t:11.1,pad:['A3','C4','E4']}
  ];
  for(const c of chords)T.pad(c.t,3.9,c.pad.map(Nn),0.55);
  // soft mallet pulse every beat (0.55s, ~109bpm), sparse
  const scale=['C5','E5','G5','A5','G5','E5'];
  for(let b=0;b<27;b++){
    const t=b*0.55;
    T.osc(t,0.3,'sine',Nn(scale[b%scale.length]),0.1,lt=>Math.exp(-lt*5));
  }
  // pops on each morph (state times)
  for(const m of [1.7,2.8,4.0,5.2,6.4,8.8,11.0,12.6,13.9])T.pop(m-0.05,0.7);
  // clicks on cursor clicks
  for(const c of [1.5,3.95,5.15,6.3,9.6,11.0,12.4])T.click(c,0.7,2000+((c*1000)%600));
  // small whoosh on big player expansion
  T.whoosh(6.3,0.6,0.4);
  T.whoosh(13.8,0.5,0.4);
  return T.buf;
}

/* ============ STUD-ORBIT: dark electronic launch (112 BPM) ============ */
function buildOrbit(){
  const T=makeTrack();
  // dark pad bed: Am / F / C / G
  const chords=[
    {t:0,pad:['A2','C4','E4'],bass:'A2'},
    {t:3.7,pad:['F2','A3','C4'],bass:'F2'},
    {t:7.4,pad:['C3','E4','G4'],bass:'C3'},
    {t:11.1,pad:['G2','D4','G4'],bass:'G2'}
  ];
  for(const c of chords){T.pad(c.t,3.9,c.pad.map(Nn),0.8);T.bass(c.t,3.9,Nn(c.bass),0.8);}
  // beat grid 0.535s (~112bpm), drums
  for(let b=0;b<28;b++){
    const t=b*0.535;
    T.kick(t,0.85);
    T.hat(t+0.27,0.6);
  }
  // BEAT2 ring convergence whoosh + particle shimmer
  T.whoosh(2.4,1.0,0.9);
  for(let i=0;i<10;i++)T.click(2.6+i*0.18,0.35,2400-((i*60)%600));
  // BEAT3 number: rapid rolling ticks that decelerate
  for(let i=0;i<26;i++){
    const tt=5.4+i*0.13;
    const v=0.6*Math.exp(-i*0.05);
    T.click(tt,v,2000-((i*40)%900));
  }
  // settle ding when number locks (8.4)
  T.osc(8.4,0.7,'sine',Nn('E5'),0.18,lt=>Math.exp(-lt*3));
  T.osc(8.4,0.7,'sine',Nn('A5'),0.15,lt=>Math.exp(-lt*3));
  // BEAT4 sphere: deep rising whoosh
  T.whoosh(9.3,1.3,0.8);
  T.kick(9.4,0.9);
  // BEAT5 logo swell
  T.whoosh(12.3,1.0,0.7);
  T.osc(12.6,1.3,'sine',Nn('A3'),0.1,lt=>Math.min(1,lt*4)*Math.min(1,(1.3-lt)*1.4));
  return T.buf;
}

function writeWav(path,buf){
  const n=buf.length,b=Buffer.alloc(44+n*2);
  b.write('RIFF',0);b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);
  b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);
  b.writeUInt32LE(SR,24);b.writeUInt32LE(SR*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);
  b.write('data',36);b.writeUInt32LE(n*2,40);
  for(let i=0;i<n;i++){let v=Math.tanh(buf[i]*1.15);b.writeInt16LE(Math.round(v*32767),44+i*2);}
  writeFileSync(path,b);
}

mkdirSync('films',{recursive:true});
for(const [name,build] of [['stud-morph',buildMorph],['stud-orbit',buildOrbit]]){
  const wav=join('films',name+'.wav');
  writeWav(wav,build());
  const r=spawnSync('ffmpeg',['-y','-i',wav,'-af','loudnorm=I=-14:TP=-1.5:LRA=11','-c:a','aac','-b:a','192k',join('films',name+'.m4a')],{stdio:'inherit'});
  console.log('audio',name,'exit',r.status);
}
