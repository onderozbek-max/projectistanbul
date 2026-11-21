// Evidence summaries retain every attempt; none of these measurements establishes enjoyment.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'reviews/telemetry/audit9-implementation');
const rows=name=>{const p=path.join(out,name+'.jsonl');return fs.existsSync(p)?fs.readFileSync(p,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse):[];};
const tag=process.env.AUDIT9_TAG||'integrated6';
const campaigns={},failures=[],levels=Array.from({length:30},(_,i)=>({level:i+1,policies:{}}));
for(const id of ['broad','cover','offense','banked-growth']){
 const data=rows(tag+'-earned-'+id).filter(r=>r.kind==='earnedCampaign');
 campaigns[id]={attempts:data.length,clears:data.filter(r=>r.result==='win').length,losses:data.filter(r=>r.result==='lose').length,timeouts:data.filter(r=>r.result==='timeout').length,evolutions:{}};
 for(const r of data){
  const boss=r.bossRecord;
  if(r.result!=='win')failures.push({profile:id,level:r.level,seed:r.seed,result:r.result,cause:r.deathCause,time:r.time,
   bossReached:!!boss,entryHP:boss?.hpAtEntry,damageBy:r.damageBy,arenaDamage:r.arenaDamage,driverError:r.err,stuck:r.stuck});
  const uses=Object.entries(r.evolutionUse||{}).map(([id,u])=>({id,...u,remainingSeconds:+(r.time-u.acquired_s).toFixed(2),
   meaningful:Object.entries(u.encounters||{}).some(([kind,n])=>kind!=='cleanup'&&n>0)}));
  for(const u of uses)campaigns[id].evolutions[u.id]=(campaigns[id].evolutions[u.id]||0)+1;
  const cell=levels[r.level-1].policies[id]||(levels[r.level-1].policies[id]={attempts:[],clear:null});
  cell.attempts.push({seed:r.seed,result:r.result,time:r.time,cause:r.deathCause});
  if(r.result==='win')cell.clear={seed:r.seed,seconds:r.time,evolutions:uses,choice:r.saveAfter?.flags,kaanHelp:r.saveAfter?.flags?.kaanMarketCover,
   boss:boss?{entryHP:boss.hpAtEntry,seconds:boss.fightSeconds,attacks:[...new Set(boss.attacks.map(a=>a.act))],exposureSamples:boss.openings.length}:null};
 }
}
const comparisons=['boss-evasive','boss-punish'].flatMap(name=>rows(tag+'-'+name).map(r=>({file:name+'.jsonl',level:r.level,band:r.band,policy:r.policy,result:r.result,
 cause:r.deathCause,time:r.time,entryHP:r.bossRecord?.hpAtEntry,
 fightSeconds:r.bossRecord?(r.bossRecord.fightSeconds??r.time-r.bossRecord.start):null,
 bossKilled:r.bossRecord?.deathAt!=null,
 attacks:[...new Set((r.bossRecord?.attacks||[]).map(a=>a.act))],
 arenaDamage:r.arenaDamage,exposureSamples:(r.bossRecord?.openings||[]).length})));
const focused=rows(tag+'-earned-focused-evolutions'),evolutions={};
for(const r of focused){const e=evolutions[r.target]||(evolutions[r.target]={trials:0,losses:0,misses:0,useful:[]});e.trials++;e.losses+=r.result==='lose';
 const u=r.evolutionUse?.[r.target];if(!u)e.misses++;
 if(r.usefulRemainingEngagement)e.useful.push({level:r.level,seed:r.seed,attempt:r.attempt,acquired:u.acquired_s,firstAttack:u.first_attack_s,
  firstEffect:u.first_effect_s,firstEncounter:u.first_encounter,firstEncounterAt:u.first_encounter_s,remaining:r.time-u.acquired_s,encounters:u.encounters,result:r.result});}
const summary={created:new Date().toISOString(),runtime:tag+'.json',campaigns,failures,bossComparisons:comparisons,focusedEvolutions:evolutions,
 limitations:['Headless diagnostic policies, not a human or rendered walkthrough.','Banked growth withholds attribute/perk spending, but retains earned gear/mastery.','Encounter-context damage/control is a bounded usefulness measurement, not enjoyment or unbiased discovery frequency.','Boss comparisons run full routes with earned permanent bands; low entry HP is retained instead of reset.','Exposure samples are repeated measurements, not a count of distinct openings or successful punishes.']};
fs.writeFileSync(path.join(out,'diagnostic-summary-'+tag+'.json'),JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(path.join(out,'pacing-'+tag+'.json'),JSON.stringify(levels,null,2)+'\n');
console.log(JSON.stringify({campaigns,failures:failures.length,bossCases:comparisons.length,bossWins:comparisons.filter(r=>r.result==='win').length,focusedTrials:focused.length,usefulFamilies:Object.values(evolutions).filter(e=>e.useful.length).length}));
