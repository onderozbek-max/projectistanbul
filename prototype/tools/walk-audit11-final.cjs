// Fresh final-source earned browser journey, after the earlier independent source6 journey finishes.
'use strict';
const fs=require('node:fs'),{spawn}=require('node:child_process');
const candidate=process.env.AUDIT11_CANDIDATE||'8',port=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8833';
const d='reviews/telemetry/audit11-implementation',m='reviews/media/R1/audit11-implementation';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 while(!fs.existsSync(m+'/candidate6-earned-journey/earned-save-final.json'))await sleep(15000);
 console.log('Starting separate fresh final'+candidate+' earned journey; no prior save/profile imported',new Date().toISOString());
 const log=fs.openSync(d+'/candidate'+candidate+'-earned-journey.log','wx');
 const env={...process.env,ISTANBUL_PREVIEW:port,AUDIT9_MANIFEST:'reviews/telemetry/first30-reset/audit11-candidate'+candidate+'.json',AUDIT9_WALK_OUT:m+'/candidate'+candidate+'-earned-journey',AUDIT9_FRAME_INPUT:'1',ISTANBUL_NATIVE_CANVAS:'1'};
 delete env.AUDIT9_PROFILE;delete env.AUDIT9_RESUME;
 const child=spawn(process.execPath,['prototype/tools/walk-audit9.cjs'],{env,stdio:['ignore',log,log]});
 const prune=setInterval(()=>{const c=spawn('python3',['prototype/tools/prune-audit11-frames.py'],{stdio:'ignore'});c.on('error',()=>{});},60000);
 const status=await new Promise(resolve=>{child.on('exit',(code,signal)=>resolve({code,signal}));child.on('error',e=>resolve({error:String(e)}));});
 clearInterval(prune);fs.closeSync(log);fs.writeFileSync(d+'/candidate'+candidate+'-earned-journey.exit',JSON.stringify(status)+'\n');console.log('Final8 earned journey',status);process.exitCode=status.code||0;
})().catch(e=>{console.error(e);process.exitCode=1;});
