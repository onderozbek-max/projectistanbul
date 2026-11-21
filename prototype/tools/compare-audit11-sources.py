"""Exact applicability; no relabeling old captures as a new candidate."""
from pathlib import Path
import hashlib,json,datetime
R=Path(__file__).resolve().parents[2];base=R/'reviews/telemetry/first30-reset';out=R/'reviews/telemetry/audit11-implementation'
def manifest(tag):
 p=base/(tag+'-runtime.sha256');rows={line.split('  ',1)[1]:line.split('  ',1)[0] for line in p.read_text().splitlines()};return rows
final=manifest('audit11-candidate9');rows=[]
for tag in ['candidate22','audit11-pilot4','audit11-candidate6','audit11-candidate7','audit11-candidate8']:
 source=manifest(tag);changed=[p for p in final if source.get(p)!=final[p]]
 rows.append({'source':tag,'sourceIdentity':json.loads((base/(tag+'.json')).read_text())['runtime_manifest_sha256'],'final':'audit11-candidate9','changedFiles':changed,'simAndConfigIdentical':not any('/sim/' in p or '/config' in p for p in changed),'meaning':'Use exact original identity. Identical simulation/config supports numerical applicability, not falsely relabeled final presentation or human acceptance.'})
(out/'source-applicability-final9.json').write_text(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'final':json.loads((base/'audit11-candidate9.json').read_text()),'comparisons':rows},indent=2)+'\n');print([(r['source'],len(r['changedFiles']),r['simAndConfigIdentical']) for r in rows])
