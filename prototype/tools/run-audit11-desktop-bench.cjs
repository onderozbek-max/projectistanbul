// Sequential desktop source comparison after this task's concurrent captures/checks finish; not phone proof.
'use strict';
const fs=require('node:fs'),os=require('node:os'),{spawnSync}=require('node:child_process');
const D='reviews/telemetry/audit11-implementation',prefix=process.env.AUDIT11_BENCH_PREFIX||'desktop';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 while(!fs.existsSync(D+'/candidate9-full-suite.exit')||!fs.existsSync(D+'/candidate9-earned-journey.exit')||!fs.existsSync(D+'/candidate9-earned-boundary.exit')||!fs.existsSync(D+'/final7-advanced.exit'))await sleep(15000);
 const rows=[];
 for(const[tag,origin,manifest]of [['baseline22','http://127.0.0.1:8835','reviews/telemetry/first30-reset/candidate22.json'],['final9','http://127.0.0.1:8834','reviews/telemetry/first30-reset/audit11-candidate9.json']]){
  const log=fs.openSync(D+'/'+prefix+'-'+tag+'.log','wx'),start={at:new Date().toISOString(),load:os.loadavg(),freeBytes:os.freemem()};
  const r=spawnSync(process.execPath,['prototype/tools/capture-experience-benchmark.cjs'],{env:{...process.env,ISTANBUL_PREVIEW:origin,AUDIT8_MANIFEST:manifest,AUDIT8_BENCH:D+'/'+prefix+'-'+tag+'.json'},stdio:['ignore',log,log]});fs.closeSync(log);
  rows.push({tag,origin,start,end:{at:new Date().toISOString(),load:os.loadavg(),freeBytes:os.freemem()},exit:r.status});fs.writeFileSync(D+'/'+prefix+'-'+tag+'.exit',String(r.status)+'\n');
  fs.writeFileSync(D+'/'+prefix+'-benchmark-jobs.json',JSON.stringify({conditions:'Task-owned browser captures/full-suite/earned journey completed before benchmark; documentation and small metadata reads may continue. Other owner/system work is uncontrolled. Same Mac/headless390x844 DPR1 approved art, all three60s scenes, sequential baseline then final. Not phone heat/memory/input/audio proof.',rows},null,2)+'\n');
 }
})().catch(e=>{console.error(e);process.exitCode=1});
