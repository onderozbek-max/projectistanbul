// One sequential, exact-source browser verification queue. Every job retains stdout/stderr/exit and metadata.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const tag=process.argv[2]||'candidate12',d='reviews/telemetry/first30-reset',m='reviews/media/R1/first30-reset',url=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8819';
const env={...process.env,ISTANBUL_PREVIEW:url,RESET_BUILD:tag,AUDIT8_BUILD:tag,AUDIT8_MANIFEST:d+'/'+tag+'.json',AUDIT9_MANIFEST:d+'/'+tag+'.json',ISTANBUL_NATIVE_CANVAS:'1'},rows=[];
const jobs=[
 ['boss-hidden','capture-audit8.cjs',['bosses'],{AUDIT9_OUT:m+'/'+tag+'-boss-hidden',AUDIT9_BOSS_CLEAN:'1',RESET_BOSS_HIDE_HUD:'1',AUDIT9_PHASES:'1',AUDIT9_BOSS_MS:'26000'}],
 ['matched-after','capture-audit8.cjs',['bosses'],{AUDIT9_OUT:m+'/'+tag+'-matched-after',AUDIT8_LEVELS:'1,15,25',AUDIT9_BOSS_CLEAN:'1',AUDIT9_PHASES:'1',AUDIT9_BOSS_MS:'26000'}],
 ['arsenal','capture-first30-reset.cjs',['arsenal'],{AUDIT9_OUT:m+'/'+tag+'-arsenal'}],
 ['roles','capture-first30-feedback.cjs',['roles'],{AUDIT9_OUT:m+'/'+tag+'-roles'}],
 ['worlds','capture-audit8.cjs',['world'],{AUDIT9_OUT:m+'/'+tag+'-worlds'}],
 ['scenes','check-audit9-scenes.cjs',[],{AUDIT9_SCENE_OUT:m+'/'+tag+'-scenes'}],
 ['transactions','check-first30-transactions.cjs',[],{RESET_CHECK_OUT:m+'/'+tag+'-transactions'}],
 ['reward-ownership','check-first30-reward-ownership.cjs',[],{RESET_CHECK_OUT:m+'/'+tag+'-reward-ownership'}],
 ['touch-art','check-first30-touch-art.cjs',[],{RESET_CHECK_OUT:m+'/'+tag+'-touch-art'}],
 ['interface','check-first30-reset-ui.cjs',[],{AUDIT9_UI_TAG:tag}],
 ['health-default','capture-first30-feedback.cjs',['health'],{AUDIT9_OUT:m+'/'+tag+'-health-default',RESET_HIDE_HUD:'1'}],
 ['health-reduced','capture-first30-feedback.cjs',['health'],{AUDIT9_OUT:m+'/'+tag+'-health-reduced',RESET_HIDE_HUD:'1',AUDIT8_ACCESSIBLE:'1'}],
 ['overlap-default','capture-first30-feedback.cjs',['dense'],{AUDIT9_OUT:m+'/'+tag+'-overlap-default'}],
 ['overlap-reduced','capture-first30-feedback.cjs',['dense'],{AUDIT9_OUT:m+'/'+tag+'-overlap-reduced',AUDIT8_ACCESSIBLE:'1'}],
 ['comics','inspect-first30-comics.cjs',[],{}],
 ['blackworld','reproduce-first30-blackworld.cjs',[],{AUDIT9_OUT:m+'/'+tag+'-blackworld'}]
];
for(const[id,script,args,extra]of jobs){const base=d+'/'+tag+'-'+id,out=fs.openSync(base+'.log','w'),err=fs.openSync(base+'.stderr','w');console.log('START',id,new Date().toISOString());const r=spawnSync(process.execPath,[path.join(__dirname,script),...args],{env:{...env,...extra},stdio:['ignore',out,err]});fs.closeSync(out);fs.closeSync(err);fs.writeFileSync(base+'.exit',String(r.status)+'\n');rows.push({id,script,args,env:extra,exit:r.status,at:new Date().toISOString()});fs.writeFileSync(d+'/'+tag+'-integration-jobs.json',JSON.stringify({source:JSON.parse(fs.readFileSync(d+'/'+tag+'.json')),jobs:rows},null,2)+'\n');console.log('END',id,r.status);}
process.exitCode=rows.some(r=>r.exit!==0)?1:0;
