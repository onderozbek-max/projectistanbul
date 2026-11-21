"""Byte snapshot for reproducible local verification; excludes Git, tools and review media."""
from pathlib import Path
import hashlib,json,shutil,subprocess,datetime,sys
root=Path(__file__).resolve().parents[2];tag=sys.argv[1];proto=root/'prototype';out=root/'reviews/telemetry/first30-reset';dest=Path('/private/tmp/istanbul-reset-'+tag+'-20261120');dest.mkdir(exist_ok=False)
files=sorted(p for p in proto.rglob('*') if p.is_file() and (p.parts[len(proto.parts)] in ['js','css','assets','audio','fonts'] or p.name in ['index.html','README.md','sw.js','manifest.json','manifest.webmanifest']))
lines=[]
for p in files:
 rel=p.relative_to(proto);q=dest/rel;q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q);lines.append(hashlib.sha256(p.read_bytes()).hexdigest()+'  prototype/'+str(rel))
manifest='\n'.join(lines)+'\n';(out/(tag+'-runtime.sha256')).write_text(manifest)
build={'date':datetime.datetime.now(datetime.timezone.utc).isoformat(),'runtime_manifest_sha256':hashlib.sha256(manifest.encode()).hexdigest(),'runtimeFiles':len(files),'snapshot':str(dest),'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'branch':subprocess.check_output(['git','branch','--show-current'],cwd=root,text=True).strip(),'dirty':True,'source':'Local retained dirty workspace. No commit/push/merge. Native dialogue/accepted Arda gait retained.'}
(out/(tag+'.json')).write_text(json.dumps(build,indent=2)+'\n');print(json.dumps(build),flush=True)
check=Path('/private/tmp/istanbul-reset-'+tag+'-checks-20261120');shutil.copytree(dest,check/'prototype');shutil.copytree(proto/'tools',check/'prototype/tools')
# Art-generation tests intentionally resolve the repository root above prototype/tools.
# Freeze only their small source inventories/prompts; never symlink mutable runtime or raw art.
commission=check/'art/commission';commission.mkdir(parents=True)
for name in ['asset-inventory.json','TRACKER.csv']:
    shutil.copy2(root/'art/commission'/name,commission/name)
shutil.copytree(root/'art/commission/chatgpt/prompts',commission/'chatgpt/prompts')
print('Test copy',check,flush=True)
