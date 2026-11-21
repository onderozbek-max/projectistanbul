// Every actual geometry-changing fork branch and mastery signature; numerical-only paths stay in the full arsenal suite.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const tag=process.argv[2]||'candidate12',origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8819',d='reviews/telemetry/first30-reset',m='reviews/media/R1/first30-reset/'+tag+'-advanced',rows=[];
for(const branch of ['A','B'])for(const tail of ['1','2']){
 const selected=tail==='2'?fs.readFileSync(d+'/advanced-'+branch+'2.txt','utf8').trim():null;if(selected==='')throw Error('Empty geometry coverage');
 const id=tag+'-advanced-'+branch+tail,stdout=fs.openSync(d+'/'+id+'.log','w'),stderr=fs.openSync(d+'/'+id+'.stderr','w');
 const env={...process.env,ISTANBUL_PREVIEW:origin,AUDIT8_BUILD:tag,AUDIT8_MANIFEST:d+'/'+tag+'.json',AUDIT9_MANIFEST:d+'/'+tag+'.json',AUDIT9_OUT:m,RESET_ADVANCED:branch,RESET_MOD_TAIL:tail,ISTANBUL_NATIVE_CANVAS:'1'};if(selected)env.AUDIT9_WEAPONS=selected;
 console.log('START',id,new Date().toISOString());const r=spawnSync(process.execPath,[path.join(__dirname,'capture-first30-reset.cjs'),'arsenal'],{env,stdio:['ignore',stdout,stderr]});fs.closeSync(stdout);fs.closeSync(stderr);fs.writeFileSync(d+'/'+id+'.exit',String(r.status)+'\n');rows.push({id,branch,tail,selected: selected||'all17',exit:r.status});fs.writeFileSync(d+'/'+tag+'-advanced-jobs.json',JSON.stringify({source:JSON.parse(fs.readFileSync(d+'/'+tag+'.json')),jobs:rows},null,2)+'\n');console.log('END',id,r.status);
}
process.exitCode=rows.some(r=>r.exit!==0)?1:0;
