// Predeclare selected earned entry bands before replay; never supply run HP/ranks or discard failed replays.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const data=path.resolve('reviews/telemetry/first30-reset'),phase=process.argv[2]||'candidate10',root='/private/tmp/istanbul-reset-'+phase+'-20261120';
const source=JSON.parse(fs.readFileSync(path.join(data,phase+'.json')));
const files=fs.readdirSync(data).filter(f=>/^candidate9-v2-.*\.jsonl$/.test(f));
const all=files.flatMap(file=>fs.readFileSync(path.join(data,file),'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).filter(r=>r.kind==='earnedCampaign').map(r=>({...r,file,policy:file.replace(/^candidate9-v2-/,'').replace(/-\d+\.jsonl$/,'')})));
const evolutions=new Set(['cleaver','nailstorm','cluster','carbomb','cyclone','arcchain','blacksmith','twinsaw','forge','lake','fireball','grinder','foamstorm','hookpull','minibus','netspear','finale','stormshield']);
function investment(r){const e=r.bossRecord.entry;return Object.entries(e.weapons).reduce((n,[id,k])=>n+(evolutions.has(id)?36:k*k),0)+Object.values(e.passives).reduce((n,k)=>n+k,0);}
const selection=[];
for(const level of[1,2,3,4,5,10,15,20,25,30]){
 const entries=all.filter(r=>r.level===level&&r.bossRecord),injured=entries.slice().sort((a,b)=>a.bossRecord.hpAtEntry-b.bossRecord.hpAtEntry)[0];
 const healthy=entries.filter(r=>r.bossRecord.hpAtEntry>=.4).sort((a,b)=>investment(a)-investment(b)),ordered=entries.slice().sort((a,b)=>investment(a)-investment(b));
 const typical=(healthy.length?healthy:ordered)[Math.floor((healthy.length?healthy:ordered).length/2)],strong=ordered.at(-1);
 for(const[band,r]of[['injured-earned',injured],['typical-investment',typical],['strong-investment',strong]]){
  if(!r)throw Error('No actual entry '+level+' '+band);
  selection.push({level,band,file:r.file,policy:r.policy,seed:r.seed,attempt:r.attempt,priorResult:r.result,hpFraction:r.bossRecord.hpAtEntry,investmentProxy:investment(r),entry:r.bossRecord.entry,case:{origin:r.file+' actual L'+r.level+' attempt'+r.attempt,profile:r.policy,level:r.level,seed:r.seed,loadout:r.loadout,saveBefore:r.saveBefore}});
 }
}
const declaration={source,method:'Selected before replay from all retained candidate9 predeclared-policy histories. Injured = lowest actual entry HP; typical = median squared-rank investment proxy among HP>=40%; strong = highest proxy. Evolutions count36, base ranks squared, passive ranks add. This is NOT measured DPS, not a natural frequency estimate, not proof of fairness. Both movement policies replay complete original routes from earned permanent saves; no supplied run HP/ranks/outcomes.',selection};
fs.writeFileSync(path.join(data,phase+'-boss-case-declaration.json'),JSON.stringify(declaration,null,2)+'\n');
const results=[];
for(const row of selection){const caseFile=path.join(data,phase+'-boss-L'+row.level+'-'+row.band+'-case.json');fs.writeFileSync(caseFile,JSON.stringify([row.case],null,2));
 for(const movement of ['punish','evasive']){
  const id=phase+'-boss-L'+row.level+'-'+row.band+'-'+movement,args=[path.join(__dirname,'audit-first30-reset.cjs'),'--audit=cases','--saves='+caseFile,'--reset-policy='+row.policy,'--build=broad','--street','--help'];if(movement==='punish')args.push('--punish');
  const out=fs.openSync(path.join(data,id+'.jsonl'),'w'),err=fs.openSync(path.join(data,id+'.log'),'w');
  const r=spawnSync(process.execPath,args,{env:{...process.env,ISTANBUL_SIM_ROOT:root},stdio:['ignore',out,err]});fs.closeSync(out);fs.closeSync(err);
  results.push({id,level:row.level,band:row.band,movement,exit:r.status,file:id+'.jsonl'});fs.writeFileSync(path.join(data,phase+'-boss-power-results.json'),JSON.stringify({source,declaration:phase+'-boss-case-declaration.json',cases:results},null,2)+'\n');console.log(id,r.status);if(r.status)process.exit(r.status||1);
 }
}
