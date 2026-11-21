// Original partial stress failures remain; normalize supplied phase damage and validate every passive unlock.
'use strict';
const fs=require('node:fs'),{spawnSync}=require('node:child_process');const rows=[],candidate=process.env.AUDIT11_CANDIDATE||'7';
for(const mode of ['default','reduced']){
 const id='final'+candidate+'-stress-'+mode+'-repair'+(process.env.AUDIT11_STRESS_RETRY||''),f='reviews/telemetry/audit11-implementation/'+id;
 const out=fs.openSync(f+'.log','wx'),err=fs.openSync(f+'.stderr','wx');
 const env={...process.env,ISTANBUL_PREVIEW:process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8832',AUDIT8_BUILD:'audit11-candidate'+candidate,AUDIT8_MANIFEST:'reviews/telemetry/first30-reset/audit11-candidate'+candidate+'.json',AUDIT9_OUT:'reviews/media/R1/audit11-implementation/'+id,AUDIT9_BOSS_CLEAN:'1',AUDIT9_PHASES:'1',AUDIT9_BOSS_MS:'22000',ISTANBUL_NATIVE_CANVAS:'1'};
 if(mode==='reduced')env.AUDIT8_ACCESSIBLE='1';
 const r=spawnSync(process.execPath,['prototype/tools/capture-first30-boss-stress.cjs','bosses'],{env,stdio:['ignore',out,err]});fs.closeSync(out);fs.closeSync(err);fs.writeFileSync(f+'.exit',String(r.status)+'\n');rows.push({id,exit:r.status,env});fs.writeFileSync('reviews/telemetry/audit11-implementation/stress-repair'+(candidate==='7'?'':'-final'+candidate)+'-jobs.json',JSON.stringify(rows,null,2));console.log(id,r.status);
 const p=spawnSync('python3',['prototype/tools/prune-audit11-frames.py'],{encoding:'utf8'});console.log(p.stdout.trim());
}
process.exitCode=rows.some(r=>r.exit!==0)?1:0;
