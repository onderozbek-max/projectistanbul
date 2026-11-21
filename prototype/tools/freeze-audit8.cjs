// Freeze only the served runtime, retaining source/tool manifests separately from generated evidence.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),target=process.argv[2],name=process.argv[3]||'build';if(!target)throw Error('snapshot directory required');
const dest=path.resolve(root,process.argv[4]||'reviews/telemetry/audit8-implementation');
const previous=process.argv[5]?JSON.parse(fs.readFileSync(path.join(dest,process.argv[5]+'.json'))):null;
const old=previous?new Map(fs.readFileSync(path.join(dest,process.argv[5]+'-runtime.sha256'),'utf8').trim().split('\n').map(l=>{const [h,p]=l.split('  ');return[p,h]})):new Map();
const sum=x=>crypto.createHash('sha256').update(x).digest('hex'),records=[];
function walk(dir,rel=''){
 for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
  if(e.name.startsWith('.')||!rel&&(e.name==='tools'||e.name==='reviews'))continue;
  const p=path.join(dir,e.name),r=path.join(rel,e.name),out=path.join(target,r);
  if(e.isDirectory()){fs.mkdirSync(out,{recursive:true});walk(p,r);}else if(e.isFile()){
   const bytes=fs.readFileSync(p),hash=sum(bytes);fs.mkdirSync(path.dirname(out),{recursive:true});
   // Only link from an already immutable snapshot, never from mutable workspace
   // files. New/changed bytes get their own file. No previous snapshot is edited.
   if(previous&&old.get('prototype/'+r)===hash){try{fs.linkSync(path.join(previous.snapshot,r),out);}catch(e){fs.writeFileSync(out,bytes);}}
   else fs.writeFileSync(out,bytes);
   records.push([hash,'prototype/'+r]);
  }
 }
}
fs.mkdirSync(target,{recursive:true});walk(path.join(root,'prototype'));
const manifest=records.map(([h,p])=>h+'  '+p+'\n').join('');
fs.mkdirSync(dest,{recursive:true});
fs.writeFileSync(path.join(dest,name+'-runtime.sha256'),manifest);
const build={date:new Date().toISOString(),runtime_manifest_sha256:sum(manifest),runtimeFiles:records.length,snapshot:target,
 head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),branch:execFileSync('git',['branch','--show-current'],{cwd:root,encoding:'utf8'}).trim(),dirty:true,
 source:'Current local workspace, including retained preexisting changes. No commit, push or merge.'};
fs.writeFileSync(path.join(dest,name+'.json'),JSON.stringify(build,null,2)+'\n');
fs.mkdirSync(path.join(target,'tools'),{recursive:true});fs.copyFileSync(path.join(root,'prototype/tools/serve.py'),path.join(target,'tools/serve.py'));console.log(JSON.stringify(build,null,2));
