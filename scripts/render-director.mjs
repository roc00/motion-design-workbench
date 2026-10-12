/* Run through ego-browser nodejs < scripts/render-director.mjs.
   Resume the task space in studio/render-config.json; never create a second space. */
import {spawn} from 'node:child_process';
import {readFileSync,renameSync,unlinkSync,existsSync} from 'node:fs';
const cfg=JSON.parse(readFileSync('studio/render-config.json','utf8'));
const task=await taskSpace(cfg.spaceId),page=task.page('p1');
const fps=cfg.fps||60,width=cfg.width||1920,height=cfg.height||1080;
for(const film of cfg.films){
  await page.goto(`http://localhost:${cfg.port||5199}/films/director-${film}.html`);
  await page.waitForFunction(()=>window.studioReady);
  await page.evaluate(({width,height})=>{const c=document.querySelector('canvas');c.width=width;c.height=height;}, {width,height});
  const dest=`films/director-${film}${cfg.draft?'-animatic':''}.mp4`;
  const temporary=dest.replace(/\.mp4$/,'.rendering.mp4');
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-i','-','-i',`films/director-${film}.wav`,'-c:v','libx264','-preset','fast','-crf',cfg.draft?'22':'17','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-af','loudnorm=I=-16:TP=-1.5:LRA=8','-t','15','-movflags','+faststart',temporary],{stdio:['pipe','inherit','inherit']});
  const closed=new Promise((resolve,reject)=>{ff.once('error',reject);ff.once('close',code=>code===0?resolve():reject(new Error('ffmpeg exit '+code)));});
  closed.catch(()=>{});
  try {
  for(let i=0;i<15*fps;i++){
    const frame=await page.evaluate(t=>{window.seek(t);return document.querySelector('canvas').toDataURL('image/png').split(',')[1];},i/fps);
    if(!ff.stdin.write(Buffer.from(frame,'base64')))await new Promise(r=>ff.stdin.once('drain',r));
    if(i%fps===0)console.log(`${film}: ${i/fps}s /15s`);
  }
  ff.stdin.end();await closed;renameSync(temporary,dest);console.log('rendered',dest);
  } catch(error) {
    ff.stdin.destroy();ff.kill('SIGTERM');await closed.catch(()=>{});
    if(existsSync(temporary))unlinkSync(temporary);
    throw error;
  }
}
