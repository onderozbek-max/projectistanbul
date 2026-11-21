// Reuse exact earned saves/seed histories; retain outliers and compare two movement policies.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const data=path.resolve('reviews/telemetry/first30-reset'),root='/private/tmp/istanbul-reset-candidate5-20261120';
const histories=fs.readdirSync(data).filter(f=>/^integration4-v2-.*\.jsonl$/.test(f));
const all=histories.flatMap(file=>fs.readFileSync(path.join(data,file),'utf8').trim().split('\n').map(JSON.parse).filter(r=>r.kind==='earnedCampaign').map(r=>({...r,file,policy:file.replace(/^integration4-v2-/,'').replace(/-\d+\.jsonl$/,'')})));
const bosses=[1,2,3,4,5,10,15,20,25,30],manifest=[];
function execute(name,args){const fd=fs.openSync(path.join(data,name+'.jsonl'),'w'),err=fs.openSync(path.join(data,name+'.log'),'w');
 const res=spawnSync(process.execPath,[path.join(__dirname,'audit-first30-reset.cjs'),...args],{env:{...process.env,ISTANBUL_SIM_ROOT:root},stdio:['ignore',fd,err]});fs.closeSync(fd);fs.closeSync(err);if(res.status)throw Error(name+' failed '+res.status);}
for(const level of bosses){
 const cases=all.filter(r=>r.level===level&&r.bossRecord).sort((a,b)=>a.bossRecord.hpAtEntry-b.bossRecord.hpAtEntry);
 const picks=[['injured-earned',cases[0]],['typical-earned',cases[Math.floor(cases.length/2)]]];
 const last=all.filter(r=>r.level===30&&r.result==='win').at(-1);
 picks.push(['strong-legal-rematch',{...last,level,seed:42,loadout:null,saveBefore:last.saveAfter,policy:'close-investment',file:last.file+' post30 permanent save'}]);
 for(const [band,r]of picks){
  if(!r)throw Error('No earned boss entry '+level+' '+band);
  const id='boss-L'+level+'-'+band,loadout=r.loadout;
  // Rematch derives its permanent loadout from the earned post30 save in the observer below.
  const item={origin:r.file+' L'+r.level+' seed'+r.seed+' '+band,profile:r.policy,priorResult:r.result,level,seed:r.seed,loadout,saveBefore:r.saveBefore};
  if(band==='strong-legal-rematch'){
   const {loadP}=require('./lib-load');const P=loadP();P.Meta.reset();Object.assign(P.Meta.state(),r.saveBefore);item.loadout=P.Meta.loadout();
  }
  const file=path.join(data,id+'-case.json');fs.writeFileSync(file,JSON.stringify([item],null,2));
  for(const movement of ['punish','evasive']){const name=id+'-'+movement,args=['--audit=cases','--saves='+file,'--reset-policy='+r.policy,'--build=broad','--street','--help'];if(movement==='punish')args.push('--punish');
   execute(name,args);manifest.push({name,level,band,movement,origin:item.origin,policy:r.policy,file:name+'.jsonl'});
   fs.writeFileSync(path.join(data,'candidate5-boss-power-cases.json'),JSON.stringify({root,method:'Actual earned permanent state plus complete route replay from original seed; weak/typical bands selected from retained predeclared entry HP. Strong legal rematches use actual earned post30 permanent state, no supplied run ranks/HP/outcomes. Two navigation policies. Selected cases are diagnostics, not natural frequency or human fairness.',cases:manifest},null,2));console.log(name);
  }
 }
}
const saves=path.join(data,'integration4-v2-broad-mixed-42.jsonl');
execute('candidate5-evolution-search',['--audit=evolutions','--saves='+saves,'--evoseeds=24','--punish','--street','--help','--meaningful-hits=3','--meaningful-remaining=8']);
console.log('All earned cases and18 evolution searches completed; failures remain in their JSONL denominators.');
