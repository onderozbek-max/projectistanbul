// Normal wall-time full viewport samples, with actual post-master audio. Never a phone-performance claim.
'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
function jpegSize(b){
 for(let i=2;i+9<b.length;){if(b[i++]!==255)continue;const m=b[i++];if(m===216||m===217)continue;
  const n=b.readUInt16BE(i);if([192,193,194].includes(m))return{width:b.readUInt16BE(i+5),height:b.readUInt16BE(i+3)};i+=n;}
 throw Error('Invalid JPEG viewport frame');
}
async function recordDOM(browser,file,action,options={}) {
 if(fs.existsSync(file)||fs.existsSync(file.replace(/\.mp4$/,'.canvas.webm')))throw Error('Capture exists; choose a new ID/folder to retain its evidence: '+file);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'istanbul-viewport-')),frames=[],layoutChecks=[],nativeCanvas=options.nativeCanvas!==false&&process.env.ISTANBUL_NATIVE_CANVAS==='1';
 const ackMs=Math.max(10000,+(process.env.ISTANBUL_CAPTURE_ACK_MS||10000));
 // Chrome's screencast surface can change to a clipped physical window after a
 // tab interruption while the emulated layout remains 390x844. Explicit viewport
 // screenshots avoid that mismatch; every encoded image is dimension-checked.
 let active=null,captureFailure=null;
 function sample(){
  if(active)return active;
  active=(async()=>{
   if(frames.length%10===0){
    const size=await browser.evaluate('(()=>{const r=document.getElementById("phone").getBoundingClientRect();return{w:innerWidth,h:innerHeight,phoneW:r.width,phoneH:r.height}})()');
    layoutChecks.push({wall:Date.now()/1000,...size});
    if(size.w!==390||size.h!==844||size.phoneW<350||size.phoneH<750)throw Error('Viewport content collapsed: '+JSON.stringify(size));
   }
   const begin=Date.now()/1000,r=await browser.send('Page.captureScreenshot',{
   format:'jpeg',quality:78,fromSurface:true,captureBeyondViewport:false});
   const end=Date.now()/1000,bytes=Buffer.from(r.data,'base64'),size=jpegSize(bytes);
   if(size.width!==390||size.height!==844)throw Error('Clipped viewport: '+JSON.stringify(size));
   const name='frame-'+frames.length+'.jpg';fs.writeFileSync(path.join(dir,name),bytes);
   frames.push({name,time:(begin+end)/2,captureMs:(end-begin)*1000});
  })().catch(e=>{captureFailure=e;}).finally(()=>{active=null;});return active;
 }
 await sample();if(captureFailure)throw captureFailure;
 const nativeFile=file.replace(/\.mp4$/,'.canvas.webm'),audioFile=path.join(dir,'audio.webm');
 fs.mkdirSync(path.dirname(file),{recursive:true});
 const chunks={audio:{bytes:0,n:0},canvas:{bytes:0,n:0}};
 const unbind=await browser.binding('__istanbulCaptureChunk',payload=>{
  const p=JSON.parse(payload),stats=chunks[p.kind];
  if(!stats||p.seq!==stats.n)throw Error('Out-of-order capture chunk');
  const bytes=Buffer.from(p.data,'base64');
  fs.appendFileSync(p.kind==='audio'?audioFile:nativeFile,bytes);stats.n++;stats.bytes+=bytes.length;
  browser.evaluate('window.__istanbulCaptureAck('+JSON.stringify(p.kind)+','+p.seq+')').catch(error=>{captureFailure=error;});
 });
 const audioStart=await browser.evaluate(`(async()=>{const output=P.Sfx.captureOutput();if(output.context.state!=='running')await output.context.resume();const dest=output.context.createMediaStreamDestination();output.connect(dest);
 const rec=new MediaRecorder(dest.stream,{mimeType:'audio/webm;codecs=opus'});
 const state=window.auditAudio={output,dest,rec,queues:{audio:Promise.resolve(),canvas:Promise.resolve()},stats:{audio:{bytes:0,n:0},canvas:{bytes:0,n:0}},acks:{}};
 window.__istanbulCaptureAck=(kind,seq)=>{const key=kind+seq,ack=state.acks[key];if(ack){delete state.acks[key];ack();}};
 function emit(kind,seq,data){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Capture chunk not acknowledged')),${ackMs});state.acks[kind+seq]=()=>{clearTimeout(timer);resolve();};__istanbulCaptureChunk(JSON.stringify({kind,seq,data}));});}
 function stream(rec,kind){rec.ondataavailable=e=>{if(!e.data.size)return;state.queues[kind]=state.queues[kind].then(async()=>{
  const data=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result.slice(r.result.indexOf(';base64,')+8));r.readAsDataURL(e.data);});
  const stats=state.stats[kind];await emit(kind,stats.n,data);stats.n++;stats.bytes+=e.data.size;
 });};}
 stream(rec,'audio');rec.start(250);
 if(${nativeCanvas}){const video=document.getElementById('game').captureStream(60),stream=new MediaStream([...video.getVideoTracks(),...dest.stream.getAudioTracks()]);
 const native=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,opus',videoBitsPerSecond:2500000});
 state.native=native;state.video=video;
 native.ondataavailable=e=>{if(!e.data.size)return;state.queues.canvas=state.queues.canvas.then(async()=>{
  const data=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result.slice(r.result.indexOf(';base64,')+8));r.readAsDataURL(e.data);});
  const stats=state.stats.canvas;await emit('canvas',stats.n,data);stats.n++;stats.bytes+=e.data.size;
 });};native.start(500);}
 return Date.now()/1000;})()`,true);
 const targetHz=Math.max(1,Math.min(30,+(process.env.ISTANBUL_CAPTURE_HZ||10)));
 const timer=setInterval(()=>{if(!captureFailure)sample();},1000/targetHz);
 let outcome,failure;
 try{outcome=await action();}catch(error){failure=error;}finally{clearInterval(timer);if(active)await active;}
 // Persist the original viewport timestamps before recorder shutdown can fail.
 while(frames.length&&frames[0].time<audioStart)frames.shift();
 const list=['ffconcat version 1.0'];
 frames.forEach((f,i)=>{list.push("file '"+f.name+"'");list.push('duration '+(frames[i+1]?Math.max(.001,frames[i+1].time-f.time):.05));});
 fs.writeFileSync(path.join(dir,'frames.txt'),list.join('\n')+'\n');
 fs.writeFileSync(path.join(dir,'capture-checkpoint.json'),JSON.stringify({file,audioStart,frames,layoutChecks,chunks,method:'Original screenshot midpoint timestamps and incrementally streamed original MediaRecorder chunks; no interpolation.'},null,2));
 const encoded=await browser.evaluate(`(async()=>{const a=auditAudio;
 const stop=rec=>new Promise((resolve,reject)=>{if(rec.state==='inactive'){resolve();return;}const timer=setTimeout(()=>reject(Error('Recorder stop did not complete')),15000);rec.onstop=()=>{clearTimeout(timer);resolve();};rec.stop();});
 await Promise.all([stop(a.rec),a.native?stop(a.native):Promise.resolve()]);
 await Promise.all([a.queues.audio,a.queues.canvas]);
 a.output.disconnect(a.dest);a.dest.stream.getTracks().forEach(t=>t.stop());if(a.video)a.video.getTracks().forEach(t=>t.stop());return a.stats;})()`);
 await unbind();
 fs.writeFileSync(path.join(dir,'capture-consistency.json'),JSON.stringify({encoded,chunks},null,2));
 for(const kind of ['audio','canvas'])if(encoded[kind].bytes!==chunks[kind].bytes||encoded[kind].n!==chunks[kind].n)throw Error('Capture chunk count/byte mismatch: '+kind+' '+JSON.stringify({page:encoded[kind],disk:chunks[kind]}));
 if(frames.length<8)throw Error('Insufficient viewport frames after audio alignment'+(failure?'; action failed: '+failure.stack:''));
 const audioTrim=Math.max(0,frames[0].time-audioStart);
 const probe=spawnSync('ffprobe',['-v','error','-show_entries','stream=codec_type','-of','json',audioFile],{encoding:'utf8'});
 const audioValid=probe.status===0&&JSON.parse(probe.stdout||'{}').streams?.some(q=>q.codec_type==='audio');
 const args=['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',path.join(dir,'frames.txt')];
 if(audioValid)args.push('-ss',String(audioTrim),'-i',audioFile);
 args.push('-fps_mode','vfr','-c:v','libx264','-preset','veryfast','-crf','24','-pix_fmt','yuv420p');
 // A suspended AudioContext can end its media timeline before the last DOM
 // frame. Preserve the whole original-time viewport instead of truncating the
 // killing blow/menu handback to the shorter audio stream. No audio is invented.
 if(audioValid)args.push('-c:a','aac','-b:a','96k');else args.push('-an');args.push(file);
 const result=spawnSync('ffmpeg',args,{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);
 const evidence={outcome,audioCapture:{status:audioValid?'Valid original post-master stream':'Unavailable: original capture produced no decodable audio; video-only film. No silent substitute synthesized.',bytes:chunks.audio.bytes,original:audioFile},frames:frames.length,seconds:frames.at(-1).time-frames[0].time,audioStart:new Date(audioStart*1000).toISOString(),audioTrimSeconds:audioTrim,captureChunks:chunks,
  nativeCanvas:nativeCanvas?{file:nativeFile,requestedHz:60,method:'Original game canvas.captureStream(60), VP8/Opus. Native gameplay frames and actual post-master audio; DOM HUD/modals are in the companion full-viewport film. Requested cadence is not measured 60fps or motion acceptance.'}:null,
  viewportStart:frames[0].time,captureMethod:'Dimension-checked 390x844 JPEG screenshots, target'+targetHz+'Hz, midpoint request timestamps, original wall-time duration. No speedup or missing-frame interpolation.',
  targetCaptureHz:targetHz,captureAckTimeoutMs:ackMs,actualCaptureHz:(frames.length-1)/(frames.at(-1).time-frames[0].time),
  captureMsMax:Math.max(...frames.map(f=>f.captureMs)),layoutChecks,sync:'Actual post-master audio aligned to first retained viewport timestamp. Screenshot request latency bounds timestamp precision; not an audio-listening or performance acceptance claim.',temporaryFrames:dir};
 failure=failure||captureFailure;
 if(nativeCanvas&&chunks.canvas.bytes<1000)failure=failure||Error('Requested native recorder produced no usable stream; retained DOM/metadata are not a native-motion pass');
 if(failure){fs.writeFileSync(file+'.error.json',JSON.stringify({error:String(failure),...evidence},null,2)+'\n');throw failure;}
 return evidence;
}
module.exports={recordDOM,jpegSize};
