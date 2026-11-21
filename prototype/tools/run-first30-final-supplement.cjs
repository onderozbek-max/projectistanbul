// Final-source replay of lifecycle, progression, accessibility, density and missing-art checks.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const d='reviews/telemetry/first30-reset',m='reviews/media/R1/first30-reset',env={...process.env,ISTANBUL_PREVIEW:'http://127.0.0.1:8817',AUDIT8_BUILD:'final11',AUDIT8_MANIFEST:d+'/final11.json',AUDIT9_MANIFEST:d+'/final11.json',ISTANBUL_NATIVE_CANVAS:'1'},rows=[];
const jobs=[
 ['scenes','check-audit9-scenes.cjs',[],{AUDIT9_SCENE_OUT:m+'/final11-scenes'}],
 ['transactions','check-first30-transactions.cjs',[],{RESET_CHECK_OUT:m+'/final11-transactions'}],
 ['reward-ownership','check-first30-reward-ownership.cjs',[],{RESET_CHECK_OUT:m+'/final11-reward-ownership'}],
 ['touch-art','check-first30-touch-art.cjs',[],{RESET_CHECK_OUT:m+'/final11-touch-art'}],
 ['interface','check-first30-reset-ui.cjs',[],{AUDIT9_UI_TAG:'final11'}],
 ['health-default','capture-first30-feedback.cjs',['health'],{AUDIT9_OUT:m+'/final11-health-default',RESET_HIDE_HUD:'1'}],
 ['health-reduced','capture-first30-feedback.cjs',['health'],{AUDIT9_OUT:m+'/final11-health-reduced',RESET_HIDE_HUD:'1',AUDIT8_ACCESSIBLE:'1'}],
 ['overlap-default','capture-first30-feedback.cjs',['dense'],{AUDIT9_OUT:m+'/final11-overlap-default'}],
 ['overlap-reduced','capture-first30-feedback.cjs',['dense'],{AUDIT9_OUT:m+'/final11-overlap-reduced',AUDIT8_ACCESSIBLE:'1'}]
];
for(const[id,script,args,extra]of jobs){const base=d+'/final11-'+id,out=fs.openSync(base+'.log','w'),err=fs.openSync(base+'.stderr','w');console.log('START',id,new Date().toISOString());const r=spawnSync(process.execPath,[path.join(__dirname,script),...args],{env:{...env,...extra},stdio:['ignore',out,err]});fs.closeSync(out);fs.closeSync(err);fs.writeFileSync(base+'.exit',String(r.status)+'\n');rows.push({id,script,args,env:extra,exit:r.status,at:new Date().toISOString()});fs.writeFileSync(d+'/final11-supplement-jobs.json',JSON.stringify(rows,null,2)+'\n');console.log('END',id,r.status);}
process.exitCode=rows.some(r=>r.exit!==0)?1:0;
