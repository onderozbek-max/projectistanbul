// Predeclared cases preserve complete earned histories, misses, retries and exact source provenance.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const [tag,root,mode='bosses']=process.argv.slice(2);if(!tag||!root)throw Error('tag immutable-runtime mode required');
const out=path.resolve('reviews/telemetry/audit11-implementation'),prior=path.resolve('reviews/telemetry/first30-reset');
fs.mkdirSync(out,{recursive:true});const runs=[];
function run(id,args){const file=path.join(out,tag+'-'+id);if(fs.existsSync(file+'.jsonl'))throw Error('Retain original '+file);
 const fd=fs.openSync(file+'.jsonl','wx'),err=fs.openSync(file+'.log','wx'),command=[path.join(__dirname,'audit-first30-reset.cjs'),...args];
 const res=spawnSync(process.execPath,command,{env:{...process.env,ISTANBUL_SIM_ROOT:path.resolve(root),AUDIT11_MATCH_ENTRY:mode==='bosses'?'1':''},stdio:['ignore',fd,err]});fs.closeSync(fd);fs.closeSync(err);
 runs.push({id,source:path.resolve(root),command,exit:res.status,file:file+'.jsonl'});fs.writeFileSync(path.join(out,tag+'-'+mode+'-runs.json'),JSON.stringify(runs,null,2));console.log(id,res.status);if(res.status)process.exit(res.status);}
if(mode==='bosses')for(const level of [1,2,3,4,5,10,15,20,25,30])for(const band of ['injured-earned','typical-investment','strong-investment'])for(const movement of ['punish','evasive']){
 let file=path.join(prior,'candidate15-boss-L'+level+'-'+band+'-case.json');
 if(!fs.existsSync(file))file=path.join(prior,'boss-L'+level+'-'+band+'-case.json');
 if(!fs.existsSync(file))throw Error('Original history missing: '+file);
 const sample=JSON.parse(fs.readFileSync(file))[0];run('boss-L'+level+'-'+band+'-'+movement,['--audit=cases','--saves='+file,'--reset-policy='+sample.profile,'--build=broad','--street','--help',...(movement==='punish'?['--punish']:[])]);
}else if(mode==='payoff')for(const policy of ['close-investment','ranged-investment','broad-mixed','defensive-control'])for(const seed of [42,149,20261119,3,43,97,101,1499])
 run('L1-'+policy+'-'+seed,['--audit=campaign','--reset-policy='+policy,'--build=broad','--seed-base='+seed,'--through=1','--punish','--street','--help']);
else throw Error('Unknown mode '+mode);
