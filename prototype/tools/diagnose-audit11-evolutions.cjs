// Follow-up to the retained196-case search: narrower legal debut pools, explicit owned-plan/reroll/terrain inputs.
'use strict';
const fs=require('node:fs'),{spawnSync}=require('node:child_process'),path=require('node:path');
const out='reviews/telemetry/audit11-implementation',source='reviews/telemetry/first30-reset/audit11-candidate7.json';
const cases=[['grinder',6],['hookpull',8],['stormshield',21],['carbomb',13]];
const policy={source:JSON.parse(fs.readFileSync(source)),declaredBeforeExecution:new Date().toISOString(),seeds:[3,42,43,97,101,8020,15939,23858,31777,39696,47615,55534],cases,meaningfulHits:3,meaningfulRemaining:8,
 method:'Reuse the actual broad-mixed42 pre-first-clear permanent save for each legal debut/terrain level. New declared policy uses only public owned-build commitment, available focused rerolls, walking past early terrain-incompatible chests and actual car revisits. No offers/ranks/XP/HP/terrain facts supplied. Selected diagnostics, not natural frequency. All prior196 misses/late/deaths remain.'};
fs.writeFileSync(out+'/evolution-followup-predeclared.json',JSON.stringify(policy,null,2),{flag:'wx'});
for(const[id,level]of cases){
 const name=out+'/evolution-followup-'+id,fd=fs.openSync(name+'.jsonl','wx'),err=fs.openSync(name+'.stderr','wx');
 const args=['prototype/tools/audit-first30-reset.cjs','--audit=evolutions','--saves=reviews/telemetry/first30-reset/audit11-final6-broad-mixed-42.jsonl','--target='+id,'--evo-levels='+level,'--evoseeds=12','--focus-seeds='+policy.seeds.join(','),'--punish','--street','--help','--meaningful-hits=3','--meaningful-remaining=8','--focused-reroll','--commit-owned-plan','--defer-terrain-chests','--terrain-revisit'];
 const result=spawnSync(process.execPath,args,{env:{...process.env,ISTANBUL_SIM_ROOT:policy.source.snapshot},stdio:['ignore',fd,err]});
 fs.closeSync(fd);fs.closeSync(err);fs.writeFileSync(name+'.exit',String(result.status)+'\n');console.log(id,result.status);
}
