"""Verify the frozen served runtime, copied test runtime, and retained historical applicability."""
from pathlib import Path
import hashlib,json,datetime

ROOT=Path(__file__).resolve().parents[2]
DATA=ROOT/'reviews/telemetry/audit9-implementation'
TAG='integrated13'
TEST=Path('/private/tmp/istanbul-audit9-tests13-20261119/prototype')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read_manifest(tag):
 return dict((p,h) for h,p in (r.split('  ',1) for r in (DATA/(tag+'-runtime.sha256')).read_text().splitlines()))
def put(name,value):(DATA/name).write_text(json.dumps(value,indent=2)+'\n')
build=json.loads((DATA/(TAG+'.json')).read_text());manifest=read_manifest(TAG)
failures=[]
for label,base in [('snapshot',Path(build['snapshot'])),('test-copy',TEST),('workspace',ROOT/'prototype')]:
 for name,want in manifest.items():
  p=base/Path(name).relative_to('prototype')
  if not p.is_file() or sha(p)!=want:failures.append({'where':label,'path':name})
put('final-runtime-verification.json',{'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'runtime':build['runtime_manifest_sha256'],'files':len(manifest),'verified':['snapshot','test-copy','workspace'],
 'testIsolation':'Runtime byte copies, not hardlinks. Generated prototype/reviews and tools are excluded from runtime identity.',
 'failures':failures})
deltas={}
for tag in ['before','integrated4','integrated5','integrated7','integrated8','integrated11','integrated12']:
 old=read_manifest(tag)
 changed=sorted(p for p in old.keys()|manifest.keys() if old.get(p)!=manifest.get(p))
 sim=[p for p in changed if '/js/sim/' in p or '/js/config' in p]
 native=[p for p in changed if '/js/dialogue/' in p and p!='prototype/js/dialogue/dialogue.js']
 deltas[tag]={'runtime':json.loads((DATA/(tag+'.json')).read_text())['runtime_manifest_sha256'],
  'changed':changed,'simOrConfigChanges':sim,'nativeTextChanges':native}
put('source-deltas-to-final13.json',deltas)
tools={str(p.relative_to(ROOT)):sha(p) for p in sorted((ROOT/'prototype/tools').iterdir()) if p.is_file()}
put('final-tool-manifest.json',tools)
hidden=[]
for base in ['art','assets']:
 d=ROOT/'prototype'/base
 if d.exists():
  for p in sorted(d.rglob('.*')):
   if p.is_file():
    q=TEST/p.relative_to(ROOT/'prototype')
    hidden.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p),'testPresent':q.is_file(),
     'testMatches':q.is_file() and sha(q)==sha(p)})
put('final13-nonruntime-art-dependencies.json',hidden)
print('Final runtime',build['runtime_manifest_sha256'],len(manifest),'files;',len(failures),'mismatches')
print('Source12 delta:',deltas['integrated12']['changed'])
assert not failures,failures
assert not deltas['integrated7']['simOrConfigChanges'],'Headless source applicability changed'
assert all(r['testMatches'] for r in hidden),'Missing nonruntime art dependencies'
