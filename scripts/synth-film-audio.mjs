#!/usr/bin/env node
/* Synthesize full soundtracks (music + SFX) for the two flagship films.
   Pure additive/noise synthesis -> 48k mono WAV -> ffmpeg -> AAC.
   Output: films/pulse.m4a, films/margin.m4a (+ .wav) */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const SR = 48000;
const DUR = 15.2;
const N = Math.ceil(DUR * SR);

function mulberry(seed){ return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}; }

/* ---------------- voice graph (rendered into a buffer) ---------------- */
function makeTrack(){
  const buf = new Float32Array(N);
  const rand = mulberry(1234);
  let noiseBuf = new Float32Array(N);
  for(let i=0;i<N;i++) noiseBuf[i]=rand()*2-1;
  let nPos = 0;
  const noise = ()=> noiseBuf[(nPos++) % N];

  /* add an oscillator with frequency fn, envelope, harmonics */
  function osc(start,len,type,f0,vol,happen,glideTo){
    const s=Math.floor(start*SR), e=Math.min(N,Math.floor((start+len)*SR));
    for(let i=s;i<e;i++){
      const t=(i-s)/SR, lt=t/len;
      const f = glideTo? f0+(glideTo-f0)*Math.min(1,lt*3): f0;
      const ph=2*Math.PI*f*t;
      let v=0;
      if(type==='sine') v=Math.sin(ph);
      else if(type==='tri') v=2/Math.PI*Math.asin(Math.sin(ph));
      else if(type==='saw'){for(let h=1;h<=8;h++) v+=Math.sin(ph*h)/h;v*=2/Math.PI;}
      else if(type==='square'){v=Math.sin(ph);v=v>=0?1:-1;}
      const env = happen? happen(lt): (1-lt);
      buf[i]+=v*vol*env;
    }
  }
  /* filtered noise burst */
  function nburst(start,len,vol,happen,hp=0,lp=1,res=0){
    const s=Math.floor(start*SR), e=Math.min(N,Math.floor((start+len)*SR));
    let prev=0;
    for(let i=s;i<e;i++){
      const t=(i-s)/SR, lt=t/len;
      const x=noise();
      let val=x;
      if(hp>0){ val=x-prev; prev=prev+hp*val; }
      if(lp<1){ val=prev2+(x-prev2)*lp; }
      let v=val;
      const env=happen? happen(lt):(1-lt);
      buf[i]+=v*vol*env;
    }
  }
  let prev2=0;
  /* kick: pitch-dropped sine + click */
  function kick(start,vol=1){
    const len=0.32;
    const s=Math.floor(start*SR),e=Math.min(N,s+Math.floor(len*SR));
    for(let i=s;i<e;i++){
      const t=(i-s)/SR;
      const f=120*Math.exp(-t*22)+45;
      const ph=2*Math.PI*f*t;
      const env=Math.exp(-t*7);
      buf[i]+=Math.sin(ph)*env*vol*0.9;
    }
    nburst(start,0.03,vol*0.5,lt=>1-lt,0,0.5);
  }
  /* hat */
  function hat(start,vol=1,open=false){
    const len=open?0.18:0.05;
    const s=Math.floor(start*SR),e=Math.min(N,s+Math.floor(len*SR));
    let lp=0;
    for(let i=s;i<e;i++){
      const t=(i-s)/SR,lt=t/len;
      const x=noise();
      const high=x-lp;lp+=x*0.06;
      buf[i]+=high*0.5*vol*Math.exp(-lt*(open?10:60));
    }
  }
  /* snare/clap */
  function snare(start,vol=1){
    nburst(start,0.18,vol*0.5,lt=>Math.exp(-lt*12),0.4,0.8);
    const s=Math.floor(start*SR),e=s+Math.floor(0.18*SR);
    for(let i=s;i<e;i++){const t=(i-s)/SR;buf[i]+=Math.sin(2*Math.PI*190*t)*Math.exp(-t*16)*vol*0.4;}
  }
  /* whoosh: bandpass-ish noise swell */
  function whoosh(start,len=0.7,vol=1){
    const s=Math.floor(start*SR),e=Math.min(N,s+Math.floor(len*SR));
    let lp=0;
    for(let i=s;i<e;i++){
      const t=(i-s)/SR,lt=t/len;
      const x=noise();
      const cut=0.2+0.6*lt;
      const v=lp+(x-lp)*cut;
      const env=Math.sin(Math.PI*lt);
      buf[i]+=v*vol*0.4*env;
    }
  }
  /* UI click / type tick */
  function click(start,vol=1,freq=2200){
    const len=0.05;
    const s=Math.floor(start*SR),e=Math.min(N,s+Math.floor(len*SR));
    for(let i=s;i<e;i++){const t=(i-s)/SR;buf[i]+=Math.sin(2*Math.PI*freq*t)*Math.exp(-t*80)*vol*0.4;}
    nburst(start,0.02,vol*0.2,lt=>1-lt,0.2,0.6);
  }
  /* soft piano note (sine + harmonics, percussive decay) */
  function piano(start,freq,vol=1,len=1.6){
    const harmonics=[[1,1],[2,0.4],[3,0.18],[4,0.08]];
    const s=Math.floor(start*SR),e=Math.min(N,s+Math.floor(len*SR));
    for(let i=s;i<e;i++){
      const t=(i-s)/SR;
      const env=Math.exp(-t*3.2)*(1-Math.min(1,t*30));
      let v=0;
      for(const [h,a] of harmonics) v+=Math.sin(2*Math.PI*freq*h*t)*a;
      buf[i]+=v*env*vol*0.4;
    }
  }
  /* pad chord: detuned sines slow attack */
  function pad(start,len,freqs,vol=1){
    const s=Math.floor(start*SR),e=Math.min(N,s+Math.floor(len*SR));
    for(let i=s;i<e;i++){
      const t=(i-s)/SR,lt=t/len;
      const a=Math.min(1,t*2.2)*Math.min(1,(len-t)*1.5);
      let v=0;
      for(const f of freqs){
        v+=Math.sin(2*Math.PI*f*t)*0.5;
        v+=Math.sin(2*Math.PI*f*1.005*t)*0.5;
      }
      buf[i]+=v/freqs.length*vol*a*0.22;
    }
  }
  /* bass note */
  function bass(start,len,freq,vol=1){
    const s=Math.floor(start*SR),e=Math.min(N,s+Math.floor(len*SR));
    for(let i=s;i<e;i++){
      const t=(i-s)/SR,lt=t/len;
      const a=Math.min(1,t*20)*Math.min(1,(len-t)*10);
      let v=Math.sin(2*Math.PI*freq*t)+Math.sin(2*Math.PI*freq*2*t)*0.3;
      buf[i]+=v*vol*a*0.28;
    }
  }
  return {buf, kick,hat,snare,whoosh,click,piano,pad,bass,osc};
}

/* note frequencies (equal temperament), A4=440 */
const NOTE={};
(function(){
  const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  for(let oct=0;oct<8;oct++)for(let i=0;i<12;i++){
    const midi=(oct+1)*12+i;
    NOTE[names[i]+oct]=440*Math.pow(2,(midi-69)/12);
  }
})();
const Nn=(n)=>NOTE[n];

/* ---------------- PULSE (dark electronic, 120 BPM) ---------------- */
function buildPulse(){
  const T=makeTrack();
  const beat=0.5; // 120bpm
  /* progression: Am - F - C - G, 2 bars each chord (4s), 15s ~ 4 chords */
  const chords=[
    {t:0,  root:['A2','C4','E4','A3'], bass:'A2'},
    {t:3.8,root:['F2','A3','C4','F3'], bass:'F2'},
    {t:7.6,root:['C3','E4','G4','C4'], bass:'C3'},
    {t:11.4,root:['G2','D4','G4','B3'], bass:'G2'},
  ];
  for(const c of chords){
    T.pad(c.t,3.9,c.root.slice(1).map(Nn),0.9);
    T.bass(c.t,3.9,Nn(c.bass),0.9);
  }
  /* drums + arp over 30 beats */
  const arpNotes=['A4','C5','E5','G5','E5','C5'];
  for(let b=0;b<30;b++){
    const t=b*beat;
    T.kick(t,0.9);
    T.hat(t+beat*0.5,0.7);
    if(b%4===2)T.snare(t,0.7);
    if(b>2){
      const an=arpNotes[b%arpNotes.length];
      T.osc(t,0.28,'sine',Nn(an),0.16,lt=>Math.exp(-lt*5));
    }
  }
  /* scene-cut whooshes (slightly before cut) */
  for(const c of [2.35,5.35,7.85,10.35,12.35])T.whoosh(c,0.6,0.9);
  /* UI clicks during deploy (scene 4, 8-10.5) */
  for(let i=0;i<5;i++)T.click(8.3+i*0.38,0.8,2000+((i*137)%800));
  /* success ding at 10.2 */
  T.osc(10.15,0.6,'sine',Nn('E5'),0.2,lt=>Math.exp(-lt*3));
  T.osc(10.15,0.6,'sine',Nn('A5'),0.18,lt=>Math.exp(-lt*3));
  /* logo swell */
  T.whoosh(12.3,0.9,0.8);
  T.osc(12.6,1.2,'sine',Nn('A3'),0.12,lt=>Math.min(1,lt*4)*Math.min(1,(1.2-lt)*1.5));
  return T.buf;
}

/* ---------------- MARGIN (light editorial, 96 BPM) ---------------- */
function buildMargin(){
  const T=makeTrack();
  const beat=0.625; // 96bpm
  /* progression: C - G - Am - F, warm */
  const chords=[
    {t:0,  tones:['C4','E4','G4'], pad:['C4','E4','G4'], bass:'C3'},
    {t:3.75,tones:['G3','B3','D4'], pad:['G3','B3','D4'], bass:'G2'},
    {t:7.5,tones:['A3','C4','E4'], pad:['A3','C4','E4'], bass:'A2'},
    {t:11.25,tones:['F3','A3','C4'], pad:['F3','A3','C4'], bass:'F2'},
  ];
  for(const c of chords){
    T.pad(c.t,3.8,c.pad.map(Nn),0.7);
  }
  /* gentle piano arpeggio + bass */
  for(let b=0;b<24;b++){
    const t=b*beat;
    const ci=Math.min(3,Math.floor(t/3.75));
    const chord=chords[ci];
    if(b%2===0){
      const tone=chord.tones[b%chord.tones.length];
      T.piano(t,Nn(tone),0.9,1.4);
    }
    if(b%8===0)T.bass(t,2.4,Nn(chord.bass),0.6);
    if(b%4===2)T.hat(t,0.25,false);
  }
  /* soft pen/whoosh on scene cuts */
  for(const c of [2.35,5.35,7.85,10.35,12.35])T.whoosh(c,0.55,0.5);
  /* typing ticks during writing scene (2.5-5.5) */
  for(let i=0;i<7;i++)T.click(2.7+i*0.34,0.3,1500+((i*97)%400));
  /* gentle swell into logo */
  T.piano(12.6,Nn('C4'),0.8,1.8);
  T.piano(12.6,Nn('E4'),0.7,1.8);
  T.piano(12.6,Nn('G4'),0.7,2.0);
  return T.buf;
}

/* ---------------- write WAV ---------------- */
function writeWav(path,buf){
  const n=buf.length;
  const b=Buffer.alloc(44+n*2);
  b.write('RIFF',0);b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);
  b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);
  b.writeUInt32LE(SR,24);b.writeUInt32LE(SR*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);
  b.write('data',36);b.writeUInt32LE(n*2,40);
  for(let i=0;i<n;i++){
    let v=Math.max(-1,Math.min(1,buf[i]));
    /* soft clip */
    v=Math.tanh(v*1.1);
    b.writeInt16LE(Math.round(v*32767),44+i*2);
  }
  writeFileSync(path,b);
}

mkdirSync('films',{recursive:true});
for(const [name,build] of [['pulse',buildPulse],['margin',buildMargin]]){
  const buf=build();
  const wav=join('films',name+'.wav');
  writeWav(wav,buf);
  /* encode AAC, loudness normalize */
  const r=spawnSync('ffmpeg',['-y','-i',wav,'-af','loudnorm=I=-14:TP=-1.5:LRA=11','-c:a','aac','-b:a','192k',join('films',name+'.m4a')],{stdio:'inherit'});
  console.log('audio',name,'exit',r.status);
}
