// One sequential final-source queue; fixture outcomes never substitute for earned play or human acceptance.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const tag='audit11-candidate7',d='reviews/telemetry/audit11-implementation',m='reviews/media/R1/audit11-implementation';
const manifest='reviews/telemetry/first30-reset/'+tag+'.json',origin='http://127.0.0.1:8832';
const base={...process.env,ISTANBUL_PREVIEW:origin,RESET_BUILD:tag,AUDIT8_BUILD:tag,AUDIT8_MANIFEST:manifest,AUDIT9_MANIFEST:manifest,ISTANBUL_NATIVE_CANVAS:'1'},rows=[];
const jobs=[
 ['bosses','capture-audit8.cjs',['bosses'],{AUDIT9_OUT:m+'/final7-bosses',AUDIT9_BOSS_CLEAN:'1',RESET_BOSS_NO_PROP_ACTIONS:'1',RESET_BOSS_HIDE_HUD:'1',AUDIT9_PHASES:'1',AUDIT9_BOSS_MS:'26000'}],
 ['stress-default','capture-first30-boss-stress.cjs',['bosses'],{AUDIT9_OUT:m+'/final7-stress-default',AUDIT9_BOSS_CLEAN:'1',AUDIT9_PHASES:'1',AUDIT9_BOSS_MS:'16000'}],
 ['stress-reduced','capture-first30-boss-stress.cjs',['bosses'],{AUDIT9_OUT:m+'/final7-stress-reduced',AUDIT9_BOSS_CLEAN:'1',AUDIT9_PHASES:'1',AUDIT9_BOSS_MS:'16000',AUDIT8_ACCESSIBLE:'1'}],
 ['worlds','capture-audit8.cjs',['world'],{AUDIT9_OUT:m+'/final7-worlds'}],
 ['scenes','check-audit9-scenes.cjs',[],{AUDIT9_SCENE_OUT:m+'/final7-scenes'}],
 ['interactions','check-first30-interactions.cjs',[],{RESET_CHECK_OUT:m+'/final7-interactions'}],
 ['transactions','check-first30-transactions.cjs',[],{RESET_CHECK_OUT:m+'/final7-transactions'}],
 ['reward-ownership','check-first30-reward-ownership.cjs',[],{RESET_CHECK_OUT:m+'/final7-reward-ownership'}],
 ['health-default','capture-first30-feedback.cjs',['health'],{AUDIT9_OUT:m+'/final7-health-default',RESET_HIDE_HUD:'1'}],
 ['health-reduced','capture-first30-feedback.cjs',['health'],{AUDIT9_OUT:m+'/final7-health-reduced',RESET_HIDE_HUD:'1',AUDIT8_ACCESSIBLE:'1'}],
 ['overlap-default','capture-first30-feedback.cjs',['dense'],{AUDIT9_OUT:m+'/final7-overlap-default'}],
 ['overlap-reduced','capture-first30-feedback.cjs',['dense'],{AUDIT9_OUT:m+'/final7-overlap-reduced',AUDIT8_ACCESSIBLE:'1'}],
 ['touch-art','check-first30-touch-art.cjs',[],{RESET_CHECK_OUT:m+'/final7-touch-art',RESET_EXTENDED_ART:'1'}],
 ['controls','check-first30-burst-label.cjs',[],{RESET_CHECK_OUT:m+'/final7-controls'}],
 ['hud','check-audit11-hud.cjs',['final7'],{}],
 ['interface','check-first30-reset-ui.cjs',[],{AUDIT9_UI_TAG:tag}],
 ['comics','inspect-first30-comics.cjs',[],{}],
 ['roles','capture-first30-feedback.cjs',['roles'],{AUDIT9_OUT:m+'/final7-roles'}],
 ['blackworld','reproduce-first30-blackworld.cjs',[],{AUDIT9_OUT:m+'/final7-blackworld'}],
 ['arsenal','capture-first30-reset.cjs',['arsenal'],{AUDIT9_OUT:m+'/final7-arsenal',RESET_LEGAL_ROSTER:'1'}],
 ['advanced','run-first30-advanced.cjs',[tag],{}]
];
if(process.env.AUDIT11_RESUME){
 const prior=d+'/final7-jobs.json';rows.push(...JSON.parse(fs.readFileSync(prior)).rows);
 fs.copyFileSync(prior,d+'/final7-jobs-before-interruption.json');
}
for(const[id,script,args,extra]of jobs){
 if(process.env.AUDIT11_RESUME&&fs.existsSync(d+'/final7-'+id+'.exit'))continue;
 if(process.env.AUDIT11_RESUME&&id==='worlds'){extra.AUDIT8_LEVELS='22,23,24,25,26,27,28,29,30';extra.AUDIT9_OUT=m+'/final7-worlds-remainder';}
 const file=d+'/final7-'+id;if(fs.existsSync(file+'.exit'))throw Error('Retain prior output '+file);
 const out=fs.openSync(file+(process.env.AUDIT11_RESUME?'-resume':'')+'.log','wx'),err=fs.openSync(file+(process.env.AUDIT11_RESUME?'-resume':'')+'.stderr','wx'),at=new Date().toISOString();console.log('START',id,at);
 const r=spawnSync(process.execPath,[path.join(__dirname,script),...args],{env:{...base,...extra},stdio:['ignore',out,err]});fs.closeSync(out);fs.closeSync(err);fs.writeFileSync(file+'.exit',String(r.status)+'\n');
 rows.push({id,script,args,env:extra,started:at,finished:new Date().toISOString(),exit:r.status});fs.writeFileSync(d+'/final7-jobs.json',JSON.stringify({source:JSON.parse(fs.readFileSync(manifest)),origin,rows},null,2)+'\n');console.log('END',id,r.status);
 const pruned=spawnSync('python3',[path.join(__dirname,'prune-audit11-frames.py')],{encoding:'utf8'});console.log(pruned.stdout.trim());
}
process.exitCode=rows.some(r=>r.exit!==0)?1:0;
