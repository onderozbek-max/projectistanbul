// Sequential local-browser jobs avoid competing capture sessions inside this batch. Preserve each failure.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const data='reviews/telemetry/first30-reset',media='reviews/media/R1/first30-reset',base={...process.env,ISTANBUL_PREVIEW:'http://127.0.0.1:8811',ISTANBUL_NATIVE_CANVAS:'1',AUDIT8_BUILD:'candidate7',AUDIT8_MANIFEST:data+'/candidate7.json',AUDIT9_MANIFEST:data+'/candidate7.json'},jobs=[
 ['scenes','check-audit9-scenes.cjs',[],{AUDIT9_SCENE_OUT:media+'/candidate7-scenes'}],
 ['bosses','capture-audit8.cjs',['bosses'],{AUDIT9_OUT:media+'/candidate7-bosses',AUDIT9_BOSS_CLEAN:'1',AUDIT9_PHASES:'1',AUDIT9_BOSS_MS:'26000'}],
 ['roles','capture-first30-feedback.cjs',['roles'],{AUDIT9_OUT:media+'/candidate7-roles'}],
 ['health-default','capture-first30-feedback.cjs',['health'],{AUDIT9_OUT:media+'/candidate7-health-default',RESET_HIDE_HUD:'1'}],
 ['health-reduced','capture-first30-feedback.cjs',['health'],{AUDIT9_OUT:media+'/candidate7-health-reduced',RESET_HIDE_HUD:'1',AUDIT8_ACCESSIBLE:'1'}],
 ['overlap-default','capture-first30-feedback.cjs',['dense'],{AUDIT9_OUT:media+'/candidate7-overlap-default'}],
 ['overlap-reduced','capture-first30-feedback.cjs',['dense'],{AUDIT9_OUT:media+'/candidate7-overlap-reduced',AUDIT8_ACCESSIBLE:'1'}],
 ['worlds','capture-audit8.cjs',['world'],{AUDIT9_OUT:media+'/candidate7-worlds'}],
 ['blackworld','reproduce-first30-blackworld.cjs',[],{AUDIT9_OUT:media+'/candidate7-blackworld'}]
],results=[];
for(const[id,script,args,env]of jobs){const file=data+'/candidate7-'+id,stdout=fs.openSync(file+'.log','w'),stderr=fs.openSync(file+'.stderr','w');console.log('START',id,new Date().toISOString());
 const result=spawnSync(process.execPath,[path.join(__dirname,script),...args],{env:{...base,...env},stdio:['ignore',stdout,stderr]});fs.closeSync(stdout);fs.closeSync(stderr);fs.writeFileSync(file+'.exit',String(result.status)+'\n');results.push({id,script,args,env,exit:result.status,at:new Date().toISOString()});fs.writeFileSync(data+'/candidate7-presentation-jobs.json',JSON.stringify(results,null,2)+'\n');console.log('END',id,result.status);
}
process.exitCode=results.some(r=>r.exit!==0)?1:0;
