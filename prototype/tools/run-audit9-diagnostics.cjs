'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const tag=process.env.AUDIT9_TAG||'integrated6',dest='reviews/telemetry/audit9-implementation/',
 harness=process.env.AUDIT9_HARNESS||path.join(__dirname,'audit-experience.cjs');
const runs=[];
function job(id,args){const file=dest+tag+'-'+id,out=fs.openSync(file+'.jsonl','w'),err=fs.openSync(file+'.log','w');
 const r=spawnSync('node',[harness,...args],{stdio:['ignore',out,err]});fs.closeSync(out);fs.closeSync(err);
 runs.push({id,args,exit:r.status,manifest:JSON.parse(fs.readFileSync(dest+tag+'.json')).runtime_manifest_sha256});
 fs.writeFileSync(dest+tag+'-diagnostics-provenance.json',JSON.stringify({harness,runs},null,2)+'\n');console.log(id,r.status);if(r.status)process.exit(r.status||1);}
for(const[id,args]of[
 ['broad',['--build=broad']],['cover',['--build=ranged','--intent=ranged','--choice=left','--street','--help']],
 ['offense',['--build=terrain','--intent=terrain','--choice=right','--street','--help']],
 ['banked-growth',['--build=melee','--intent=melee','--bank-growth','--choice=neutral','--help']]])
 job('earned-'+id,['--audit=campaign','--punish',...args]);
const read=id=>fs.readFileSync(dest+tag+'-earned-'+id+'.jsonl','utf8').trim().split('\n').map(JSON.parse).filter(r=>r.result==='win');
const bank=read('banked-growth'),cover=read('cover'),levels=[1,2,3,4,5,10,15,20,25,30],bands=[];
for(const level of levels)for(const band of ['weak','typical','strong']){
 const sample=(band==='weak'?bank:cover).find(r=>r.level===(band==='strong'?30:level));
 bands.push({level,band,loadout:sample.loadout,origin:tag+' earned '+(band==='weak'?'banked-growth':'cover')+' L'+sample.level+' seed'+sample.seed+' pre-first-clear save; '+(band==='strong'?'earned late permanent rematch':'retained actual early permanent band')});
}
const file=dest+tag+'-boss-saves.json';fs.writeFileSync(file,JSON.stringify(bands,null,2)+'\n');
job('boss-evasive',['--audit=boss','--saves='+file]);job('boss-punish',['--audit=boss','--saves='+file,'--punish']);
job('earned-focused-evolutions',['--audit=evolutions','--saves='+dest+tag+'-earned-broad.jsonl','--evoseeds=64','--focused-reroll','--punish']);
