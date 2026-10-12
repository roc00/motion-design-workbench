/* Preview transport only. Rendering is fully independent of these clocks. */
const canvas = document.querySelector("canvas");
const cfg = window.STUDIO_CONFIG;
const duration = cfg.end - cfg.start;
const root = document.querySelector("[data-composition-id]");
const audio = document.querySelector("audio");
let current = 0, handle = 0, origin = 0;
const clock = {time: cfg.start};
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({paused:true});
tl.to(clock, {time:cfg.end,duration,ease:"none",onUpdate:()=>window.StudioDirector.render(canvas,cfg.film,clock.time)},0);
window.__timelines[root.dataset.compositionId] = tl;
window.seek = time => {
  current = Math.max(0,Math.min(duration,time));
  tl.seek(current,false);
  // Explicit repaint also covers repeated seeks and exact t=0.
  window.StudioDirector.render(canvas,cfg.film,cfg.start+current);
  return current;
};
window.getTime = () => current;
window.pause = () => { cancelAnimationFrame(handle);handle=0;audio?.pause(); };
window.setMuted = muted => {if(audio)audio.muted=muted;};
window.play = time => {
  window.pause();window.seek(time>=duration?0:(time??current));
  origin=performance.now()-current*1000;
  if(audio){audio.currentTime=cfg.start+current;audio.play().catch(()=>{});}
  const tick=now=>{window.seek((now-origin)/1000);if(current<duration)handle=requestAnimationFrame(tick);else window.pause();};
  handle=requestAnimationFrame(tick);
};
window.ready = Promise.all(['Display','Mono','Chinese'].map(f=>document.fonts.load('16px '+f))).then(()=>{window.seek(0);window.studioReady=true;});
window.seek(0);
