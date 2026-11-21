"""Preserve the exact served bytes locally, without Git publication or new packages."""
from pathlib import Path
import tarfile,hashlib,json,io

ROOT=Path(__file__).resolve().parents[2];DATA=ROOT/'reviews/telemetry/audit9-implementation'
build=json.loads((DATA/'integrated13.json').read_text());snapshot=Path(build['snapshot'])
manifest=(DATA/'integrated13-runtime.sha256').read_text();records=[r.split('  ',1) for r in manifest.splitlines()]
archive=DATA/('audit9-runtime-'+build['runtime_manifest_sha256'][:12]+'.tar.gz')
def extra(tf,name,data):
 info=tarfile.TarInfo(name);info.size=len(data);info.mode=0o644;tf.addfile(info,io.BytesIO(data))
if not archive.exists():
 with tarfile.open(archive,'x:gz',compresslevel=3) as tf:
  for expected,name in records:
   p=snapshot/Path(name).relative_to('prototype')
   assert hashlib.sha256(p.read_bytes()).hexdigest()==expected,name
   tf.add(p,arcname=name,recursive=False)
  extra(tf,'runtime.sha256',manifest.encode())
  extra(tf,'build.json',json.dumps(build,indent=2).encode())
  extra(tf,'RUN.txt',b'Project Istanbul Audit9, active JS prototype first30. Local review bundle, not an iOS build or release.\nFrom this extracted folder: shasum -a 256 -c runtime.sha256 --quiet\nThen: python3 tools/serve-snapshot.py 8801 prototype\nOpen http://127.0.0.1:8801/ on this Mac. External phone/listening/player gates remain open.\n')
  tf.add(ROOT/'prototype/tools/serve-snapshot.py',arcname='tools/serve-snapshot.py',recursive=False)
with tarfile.open(archive,'r:gz') as tf:
 for expected,name in records:
  assert hashlib.sha256(tf.extractfile(name).read()).hexdigest()==expected,name
result={'archive':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),
 'runtime':build['runtime_manifest_sha256'],'verifiedRuntimeFiles':len(records),'published':False,
 'contents':'Exact served runtime plus declared manifest/build/readme/local server helper. No .git, secrets, dependency installation or production publication.'}
(DATA/'final-runtime-archive.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
