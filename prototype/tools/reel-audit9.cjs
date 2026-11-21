// Source-labelled normal-time excerpts. Requires the actual final earned L30 record; no fixture substitutes.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {openBrowser}=require('./lib-experiential-browser.cjs');
const base=path.resolve('reviews/media/R1/audit9-implementation'),out=path.join(base,'reel'),tag=process.env.AUDIT9_FINAL||'integrated13',walk=process.env.AUDIT9_WALK||'walkthrough-final12';
const read=p=>JSON.parse(fs.readFileSync(p));fs.mkdirSync(out,{recursive:true});
const source=read('reviews/telemetry/audit9-implementation/'+tag+'.json');
const earned=level=>{const index=read(path.join(base,walk,'index.json')),r=index.records.find(r=>r.level===level&&r.outcome==='won');if(!r)throw Error('Earned L'+level+' missing');return read(path.join(base,walk,r.id+'.json'));};
earned(30);
function ff(args){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{encoding:'utf8'});if(r.status)throw Error(r.stderr);}
const sections=[];
for(const family of ['build','memory'])for(const side of ['before','after']){
 const row=read(path.join(base,'ui-comparison/index.json')).find(r=>r.id===family+'-'+side);
 sections.push({title:(family==='build'?'Upgrade choices':'Memories')+' · '+side.toUpperCase(),folder:'ui-comparison',file:row.file,
  start:.1,seconds:Math.min(5,row.seconds-.15),hash:row.sourceManifest,supplied:row.supplied});
}
for(const id of ['knife','chain','chainsaw'])for(const side of ['before','after']){
 const folder=side==='before'?'before-contact-verified':'integrated12-arsenal',row=read(path.join(base,folder,'index-arsenal.json')).find(r=>r.id==='weapon-'+id+'-r5');
 sections.push({title:id+' · '+side.toUpperCase(),folder,file:row.file,start:.4,seconds:5,hash:row.sourceManifest,
  supplied:'Matched supplied rank5 /28 live high-HP targets. Actual contact; no earned-power claim.'});
}
for(const side of ['before','after']){
 const folder=side==='before'?'before':'integrated12-bosses',row=read(path.join(base,folder,'index-bosses.json')).find(r=>r.id==='boss-L25');
 sections.push({title:'Captain · '+side.toUpperCase(),folder,file:row.file,start:2,seconds:7,hash:row.sourceManifest,
  supplied:'Quiet invulnerable observer; actual boss AI. Acting example, not a difficulty comparison.'});
}
for(const [level,phase] of [[20,'world'],[20,'departure'],[25,'world'],[25,'departure'],[30,'world'],[30,'result']]){
 if(level===30&&phase==='result'){
  const files=fs.readdirSync(path.join(base,'ending-final13-earned')).filter(f=>/^earned-result-inspection-\d+\.json$/.test(f)).sort((a,b)=>parseInt(a.match(/\d+/)[0])-parseInt(b.match(/\d+/)[0]));
  const p=files.at(-1);if(!p)throw Error('Current earned result inspection missing');
  const current=read(path.join(base,'ending-final13-earned',p));
  sections.push({title:'Earned L30 · corrected result',folder:'ending-final13-earned',file:current.file,start:.6,seconds:Math.min(4,current.seconds-.8),hash:current.sourceManifest,supplied:current.supplied});continue;
 }
 const row=earned(level),samples=row.facts.samples,world=samples.filter(s=>s.world&&s.scene&&!String(s.scene).includes('entry'));
 if(!world.length)throw Error('Missing earned sceneL'+level);
 const last=world.at(-1),next=samples.find(s=>s.wall>last.wall&&!s.scene&&s.state==='play');
 const selected=phase==='world'?world[0]:phase==='departure'?next:samples.find(s=>s.state==='results');
 if(!selected)throw Error('Missing earned handoff '+level+' '+phase);
 const start=Math.max(0,selected.wall-row.viewportStart),seconds=Math.min(phase==='result'?3:5,row.seconds-start-.1);
 sections.push({title:'Earned L'+level+' · '+phase,folder:walk,file:row.id+'.mp4',start,seconds,hash:row.sourceManifest,
  supplied:'Actual earned profile and ordinary controls; disclosed automated steering. No power/save/outcome supply.'});
}
(async()=>{
 const browser=await openBrowser('about:blank',{waitForGame:false});const files=[];
 try{for(let i=0;i<sections.length;i++){
  const s=sections[i],prefix=String(i).padStart(2,'0'),png=path.join(out,prefix+'.png'),slate=path.join(out,prefix+'-slate.mp4'),clip=path.join(out,prefix+'-play.mp4');
  const input=path.join(base,s.folder,s.file),media=spawnSync('ffprobe',['-v','error','-show_format','-of','json',input],{encoding:'utf8'});
  if(media.status)throw Error(media.stderr);s.sourceSeconds=+JSON.parse(media.stdout).format.duration;s.requestedSeconds=s.seconds;
  s.seconds=Math.min(s.seconds,s.sourceSeconds-s.start-.08);if(s.seconds<.5)throw Error('Insufficient real source interval: '+s.title);
  const context=s.folder===walk?'Earned gameplay · assisted navigation':'Supplied comparison fixture';
  const html='<style>*{box-sizing:border-box}html,body{margin:0;width:390px;height:844px;background:#11141f;color:#faf1dc;font:22px system-ui}main{padding:42px 28px;display:flex;flex-direction:column;justify-content:center;height:844px}h1{font-size:34px;line-height:1.1}p{line-height:1.4}small{font-size:15px;color:#c8c8d1}</style><main><h1>'+s.title+'</h1><p>'+context+'</p><small>Runtime '+s.hash.slice(0,16)+'…<br>Normal speed · original audio<br>Full conditions in reel.json</small></main>';
  await browser.send('Page.setDocumentContent',{frameId:(await browser.send('Page.getFrameTree')).frameTree.frame.id,html});await browser.sleep(100);await browser.shot(png);
  ff(['-loop','1','-i',png,'-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t','2','-r','30','-c:v','libx264','-preset','veryfast','-pix_fmt','yuv420p','-c:a','aac','-ar','48000','-ac','2',slate]);
  ff(['-ss',String(s.start),'-i',input,'-t',String(s.seconds),'-vf','scale=390:844:force_original_aspect_ratio=decrease,pad=390:844:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,setpts=PTS-STARTPTS','-af','asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo','-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-ar','48000','-ac','2',clip]);
  const encoded=spawnSync('ffprobe',['-v','error','-show_format','-of','json',clip],{encoding:'utf8'});if(encoded.status)throw Error(encoded.stderr);
  s.encodedSeconds=+JSON.parse(encoded.stdout).format.duration;if(Math.abs(s.encodedSeconds-s.seconds)>.15)throw Error('Truncated requested clip: '+s.title);
  files.push(slate,clip);console.log(s.title);
 }}finally{await browser.close();}
 fs.writeFileSync(path.join(out,'concat.txt'),files.map(f=>"file '"+f+"'").join('\n')+'\n');
 ff(['-f','concat','-safe','0','-i',path.join(out,'concat.txt'),'-c','copy',path.join(base,'audit9-before-after.mp4')]);
 const reelFile=path.join(base,'audit9-before-after.mp4'),probe=spawnSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',reelFile],{encoding:'utf8'});
 if(probe.status)throw Error(probe.stderr);const info=JSON.parse(probe.stdout),v=info.streams.find(s=>s.codec_type==='video');
 const seconds=+info.format.duration,expected=sections.reduce((a,s)=>a+2+s.encodedSeconds,0);
 if(v.width!==390||v.height!==844||!info.streams.some(s=>s.codec_type==='audio')||Math.abs(seconds-expected)>.15)throw Error('Reel encoding disagrees with encoded source intervals');
 const output={file:'audit9-before-after.mp4',seconds,expectedSeconds:expected,width:v.width,height:v.height,sha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(reelFile)).digest('hex')};
 fs.writeFileSync(path.join(base,'reel.json'),JSON.stringify({finalRuntime:source.runtime_manifest_sha256,sourceApplicability:read('reviews/telemetry/audit9-implementation/boundary-repair-applicability.json'),method:'Selected original-time intervals; 30fps display cadence repeats source frames without optical interpolation or speed changes. Silent source slates. Original clip audio. Earlier full journey/roster source labels retained; current final result captured separately. Frame-sampled review; listening and continuous artistic acceptance pending.',output,sections},null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1});
