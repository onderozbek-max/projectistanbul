// Twelve predeclared earned campaigns, preserving every retry and failed/late evolution case.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const phase=process.argv[2],root=process.argv[3];if(!phase||!root)throw Error('phase and immutable runtime root required');
const data=path.resolve('reviews/telemetry/first30-reset'),declared=JSON.parse(fs.readFileSync(path.join(data,'balance-predeclared.json'))),records=[];
for(const policy of Object.keys(declared.approaches))for(const seed of declared.campaignSeeds){
 const id=phase+'-'+policy+'-'+seed,file=path.join(data,id),args=[path.join(__dirname,'audit-first30-reset.cjs'),'--audit=campaign','--reset-policy='+policy,'--build=broad','--seed-base='+seed,'--punish','--street','--help'];
 const stdout=fs.openSync(file+'.jsonl','w'),stderr=fs.openSync(file+'.log','w'),at=new Date().toISOString();
 const r=spawnSync(process.execPath,args,{env:{...process.env,ISTANBUL_SIM_ROOT:path.resolve(root)},stdio:['ignore',stdout,stderr]});fs.closeSync(stdout);fs.closeSync(stderr);
 const rows=fs.readFileSync(file+'.jsonl','utf8').trim().split('\n').filter(Boolean).map(JSON.parse),wins=rows.filter(r=>r.result==='win');
 records.push({id,policy,seed,at,root:path.resolve(root),command:args,exit:r.status,cleared:wins.map(r=>r.level),attempts:rows.filter(r=>r.kind==='earnedCampaign').length,blocked:rows.find(r=>r.kind==='campaignBlocked')||null});
 fs.writeFileSync(path.join(data,phase+'-campaign-provenance.json'),JSON.stringify(records,null,2)+'\n');console.log(id,r.status,wins.length+'/30',rows.length+' records');if(r.status)process.exit(r.status||1);
}
