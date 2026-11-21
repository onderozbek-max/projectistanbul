// Reproduce deliberately selected useful source9 recipe runs on the exact repaired candidate.
// Known seeds are a reachability check, not a frequency/discoverability sample. Every miss remains.
'use strict';const fs=require('node:fs'),{spawnSync}=require('node:child_process');const dir='reviews/telemetry/audit12-implementation',jobs=[];
const tag=process.env.RESET_BUILD||'audit12-integrated10',label=tag.replace('audit12-',''),prefix=process.env.AUDIT12_CAMPAIGN_PREFIX||'distinct10';
const a=fs.readFileSync(dir+'/integrated9-all-evolutions-investment.jsonl','utf8').trim().split('\n').map(JSON.parse);
a.push(...fs.readFileSync(dir+'/integrated9-carbomb-balanced-starter.jsonl','utf8').trim().split('\n').map(JSON.parse));
const targets=[...new Set(a.map(r=>r.target))];
for(const id of targets){const prior=a.find(r=>r.target===id&&r.usefulRemainingEngagement);if(!prior)throw Error('No actual prior useful '+id);
 for(let stage=0;stage<2;stage++){
  const caseLabel=label+'-evolution-'+id+(stage?'-bounded-followup':'-known'),file=dir+'/'+caseLabel;
  const args=['prototype/tools/audit-first30-reset.cjs','--audit=evolutions','--saves='+dir+'/'+prefix+'-broad-mixed42.jsonl','--target='+id,'--evoseeds='+(stage?24:1),'--evo-levels='+(stage?'23,28,13,15':prior.level),
   '--commit-owned-plan','--focused-reroll','--collect-investment','--terrain-revisit','--defer-terrain-chests','--meaningful-hits=3','--meaningful-remaining=8','--punish','--street','--help'];
  if(!stage)args.push('--focus-seeds='+prior.seed);
  if(id==='carbomb')args.push('--evo-starter=canister','--starter-companion');
  const out=fs.openSync(file+'.jsonl','wx'),err=fs.openSync(file+'.stderr','wx');const r=spawnSync(process.execPath,args,{env:{...process.env,ISTANBUL_SIM_ROOT:'/private/tmp/istanbul-reset-'+tag+'-20261120'},stdio:['ignore',out,err]});fs.closeSync(out);fs.closeSync(err);fs.writeFileSync(file+'.exit',String(r.status)+'\n');
  const rows=fs.readFileSync(file+'.jsonl','utf8').trim().split('\n').filter(Boolean).map(JSON.parse),useful=rows.some(q=>q.usefulRemainingEngagement);jobs.push({id,stage,selectedPrior:{level:prior.level,seed:prior.seed},args,exit:r.status,attempts:rows.length,useful});fs.writeFileSync(dir+'/'+label+'-evolution-jobs.json',JSON.stringify(jobs,null,2)+'\n');console.log(id,stage,r.status,useful);if(useful||r.status!==0)break;
 }
}
process.exitCode=targets.some(id=>!jobs.some(r=>r.id===id&&r.useful))?1:0;
