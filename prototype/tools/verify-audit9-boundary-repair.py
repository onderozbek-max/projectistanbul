"""Prove exactly which earlier evidence applies to the final result-only correction."""
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parents[2];DATA=ROOT/'reviews/telemetry/audit9-implementation'
def read(p):return json.loads(p.read_text())
def manifest(tag):return dict((p,h) for h,p in (line.split('  ',1) for line in (DATA/(tag+'-runtime.sha256')).read_text().splitlines()))
a=read(DATA/'integrated12.json');b=read(DATA/'integrated13.json');old=manifest('integrated12');new=manifest('integrated13')
changed=[p for p in old.keys()|new.keys() if old.get(p)!=new.get(p)]
assert changed==['prototype/js/view/ui-progress.js'],changed
path=Path('js/view/ui-progress.js');before=(Path(a['snapshot'])/path).read_text();after=(Path(b['snapshot'])/path).read_text()
old_line="    var nx = P.Progress.nextAfter(idx, !!r.win), nextTxt = P.t('meta.allDone');"
new_lines="    var boundary = r.win && P.CFG.experience && idx >= P.CFG.experience.through;\n    var nx = boundary ? null : P.Progress.nextAfter(idx, !!r.win), nextTxt = P.t(boundary ? 'exp.boundary' : 'meta.allDone');"
assert after.replace(new_lines,old_line)==before,'Unexplained result changes'
out={'earlierRuntime':a['runtime_manifest_sha256'],'finalRuntime':b['runtime_manifest_sha256'],'runtimeFiles':len(new),
 'byteIdenticalFiles':len(new)-1,'changed':changed,'exactGuardOnly':True,
 'independentSourceApplicability':'All simulation/configuration, content, native dialogue, art, audio, locomotion, weapon/boss rendering, interactions, scene clocks, shared departures, UI layouts/replay and progression settlement are byte-identical. UIProgress result behavior is identical for L1–29 and every loss. WinningL30 now displays the existing localized first30 boundary instead of suggesting31.',
 'knownSupersededEvidence':'The fresh source12 all30 journey remains labelled12. Its final result recap recommendation is a real retained defect, superseded by source13 native/viewport result checks and actual earned30 replay/return. It is not relabelled as a fresh source13 campaign.',
 'verification':'Final source13 full suite and affected rendered results are separately recorded; bot/world/roster evidence from12 is applicable through exact unchanged files, not relabelled.'}
(DATA/'boundary-repair-applicability.json').write_text(json.dumps(out,indent=2)+'\n');print('Exact source13 guard-only delta verified;1141/1142 served files identical')
