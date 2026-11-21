// Actual earned permanent histories; supplied movement normalization is separately labelled.
'use strict';
const fs=require('node:fs'),{spawnSync}=require('node:child_process'),P=require('./lib-load').loadP();
const tag=process.env.RESET_BUILD||'audit12-integrated7',label=tag.replace('audit12-',''),prefix=process.env.AUDIT12_CAMPAIGN_PREFIX||'distinct7';
const caseLabel=process.env.AUDIT12_CASE_PREFIX||label;
const dir='reviews/telemetry/audit12-implementation',root='/private/tmp/istanbul-reset-'+tag+'-20261120',levels=[1,2,3,4,5,10,15,20,25,30];
const rows=[],jobs=[];P.Settings=P.Settings||{};
for(const file of fs.readdirSync(dir).filter(n=>n.startsWith(prefix+'-')&&n.endsWith('.jsonl'))){
 const policy=file.replace(prefix+'-','').replace(/(20261119|149|42)\.jsonl$/,'');
 for(const line of fs.readFileSync(dir+'/'+file,'utf8').trim().split('\n')){const r=JSON.parse(line);if(r.kind==='earnedCampaign')rows.push({...r,sourceFile:file,policy});}
}
if(!rows.some(r=>r.level===30&&r.result==='win'))throw Error('Wait for completed earned current-source histories');
function power(r){return Object.values(r.bossRecord?.entry.weapons||{}).reduce((a,b)=>a+b,0);}
const last=rows.filter(r=>r.level===30&&r.result==='win').sort((a,b)=>Object.values(b.loadout.stats).reduce((n,x)=>n+x,0)-Object.values(a.loadout.stats).reduce((n,x)=>n+x,0))[0];
P.Meta.reset();Object.assign(P.Meta.state(),JSON.parse(JSON.stringify(last.saveAfter)));const strong=P.Meta.loadout();
for(const level of levels){
 const all=rows.filter(r=>r.level===level&&r.bossRecord),injured=all.slice().sort((a,b)=>a.bossRecord.hpAtEntry-b.bossRecord.hpAtEntry)[0];
 const invested=all.slice().sort((a,b)=>power(a)-power(b)),ordinary=invested[Math.floor(invested.length/2)];
 if(!injured||!ordinary)throw Error('Missing actual boss entry '+level);
 for(const band of ['injured-earned','ordinary-earned','strong-replay','base-speed-control'])for(const policy of ['close-investment','ranged-investment']){
  const prior=band==='injured-earned'?injured:ordinary,lo=band==='strong-replay'?strong:prior.loadout;
  const sample={level,seed:prior.seed,loadout:lo,saveBefore:band==='strong-replay'?last.saveAfter:prior.saveBefore,
   profile:policy,priorResult:prior.result,origin:{band,actualHistory:prior.sourceFile,attempt:prior.attempt,policy,
    supplied:band==='base-speed-control'?'Only permanent movement and Shoes speed bonus normalized to base; actual hazards/slow/Dash and all other build/contact/rules remain. Controlled access test, not ordinary earned power.':null,
    replay:band==='strong-replay'?'Actual post30 permanent state from '+last.sourceFile+'; run weapons/ranks are acquired normally on replay, no rank/HP/outcome grant.':null}};
  const id=caseLabel+'-L'+level+'-'+band+'-'+policy,file=dir+'/'+id;
  if(fs.existsSync(file+'.jsonl'))throw Error('Retain existing '+file);
  fs.writeFileSync(file+'-case.json',JSON.stringify([sample],null,2)+'\n');
  const args=['prototype/tools/audit-first30-reset.cjs','--audit=cases','--saves='+file+'-case.json','--build=broad','--reset-policy='+policy,'--punish','--street','--help',...(band==='base-speed-control'?['--base-speed-control']:[])];
  const fd=fs.openSync(file+'.jsonl','wx'),err=fs.openSync(file+'.stderr','wx'),r=spawnSync(process.execPath,args,{env:{...process.env,ISTANBUL_SIM_ROOT:root},stdio:['ignore',fd,err]});fs.closeSync(fd);fs.closeSync(err);
  fs.writeFileSync(file+'.exit',String(r.status)+'\n');jobs.push({id,command:args,exit:r.status});fs.writeFileSync(dir+'/'+caseLabel+'-power-jobs.json',JSON.stringify(jobs,null,2)+'\n');console.log(id,r.status);
 }
}
process.exitCode=jobs.some(j=>j.exit!==0)?1:0;
