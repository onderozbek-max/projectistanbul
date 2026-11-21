// Bounded later-encounter follow-up; all earlier misses remain visible.
'use strict';
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const out='reviews/telemetry/audit11-implementation';
const manifest=JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/audit11-candidate9.json'));
const policy={declaredBeforeExecution:new Date().toISOString(),manifest,seeds:[3,42,43,97,101,8020,15939,23858,31777,39696,47615,55534],cases:[['grinder',[10,15,25]],['hookpull',[10,20,30]],['stormshield',[23,25,30]]],minimumHits:3,minimumRemainingSeconds:8,nonCleanupRequired:true,method:'At most12 declared seed/level attempts per target, stopping on first useful outcome. Each case uses the unchanged actual pre-first-clear broad-mixed42 permanent save for that level; only public offers, owned-plan/reroll and normal movement/skills. No ranks, XP, HP, offers, outcomes or free revives supplied. This later-budget probe is selected diagnostic evidence, not a natural rate. All original196 and follow-up46 records retained.'};
fs.writeFileSync(out+'/evolution-late-predeclared.json',JSON.stringify(policy,null,2)+'\n',{flag:'wx'});
for(const[id,levels]of policy.cases){
 const name=out+'/evolution-late-'+id,fd=fs.openSync(name+'.jsonl','wx'),err=fs.openSync(name+'.stderr','wx');
 const result=spawnSync(process.execPath,['prototype/tools/audit-first30-reset.cjs','--audit=evolutions','--saves=reviews/telemetry/first30-reset/audit11-final6-broad-mixed-42.jsonl','--target='+id,'--evo-levels='+levels.join(','),'--evoseeds=12','--focus-seeds='+policy.seeds.join(','),'--punish','--street','--help','--meaningful-hits=3','--meaningful-remaining=8','--focused-reroll','--commit-owned-plan'],{env:{...process.env,ISTANBUL_SIM_ROOT:manifest.snapshot},stdio:['ignore',fd,err]});
 fs.closeSync(fd);fs.closeSync(err);fs.writeFileSync(name+'.exit',String(result.status)+'\n');console.log(id,result.status);
}
