// Separately declared pickup-route comparison, retaining all prior target misses.
'use strict';
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const out=process.env.AUDIT11_INVESTMENT_OUT||'reviews/telemetry/audit11-implementation',manifest=JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/audit11-candidate9.json'));
fs.mkdirSync(out,{recursive:true});
const policy={declaredBeforeExecution:new Date().toISOString(),manifest,seeds:[3,42,43,97,101,8020,15939,23858,31777,39696,47615,55534],cases:[['grinder',[10,28,30]],['hookpull',[8,23,28]]],minimumHits:3,minimumRemainingSeconds:8,method:'New selected diagnostic policy after retained availability misses: once the wanted base is actually acquired, for at most45sim seconds collect existing nearby XP/chests within10m including behind the route, before a boss exists. No idle farming, new drops/enemies, timer or HP changes, grants, imported/generated permanent state, forced offers or outcomes. Uses actual broad-mixed42 pre-first-clear permanent save. Stops target after first useful result; every attempt retained. Not natural frequency or a bot-to-player enjoyment inference.'};
fs.writeFileSync(out+'/evolution-investment-predeclared.json',JSON.stringify(policy,null,2)+'\n',{flag:'wx'});
for(const[id,levels]of policy.cases){
 const p=out+'/evolution-investment-'+id,log=fs.openSync(p+'.jsonl','wx'),err=fs.openSync(p+'.stderr','wx');
 const r=spawnSync(process.execPath,['prototype/tools/audit-first30-reset.cjs','--audit=evolutions','--saves=reviews/telemetry/first30-reset/audit11-final6-broad-mixed-42.jsonl','--target='+id,'--evo-levels='+levels.join(','),'--evoseeds=12','--focus-seeds='+policy.seeds.join(','),'--punish','--street','--help','--meaningful-hits=3','--meaningful-remaining=8','--focused-reroll','--commit-owned-plan','--collect-investment'],{env:{...process.env,ISTANBUL_SIM_ROOT:manifest.snapshot},stdio:['ignore',log,err]});
 fs.closeSync(log);fs.closeSync(err);fs.writeFileSync(p+'.exit',String(r.status)+'\n');console.log(id,r.status);
}
