"""Index retained original-time media with exact provenance; never turn a fixture into earned play."""
from pathlib import Path
import json,html,datetime
R=Path(__file__).resolve().parents[2];M=R/'reviews/media/R1/audit11-implementation';D=R/'reviews/telemetry/audit11-implementation'
records=[];seen=set()
def add(folder,row,parent):
 name=row.get('file') or row.get('id','')+'.mp4';movie=folder/name
 if not movie.is_file():return
 key=str(movie.relative_to(R))
 if key in seen:return
 seen.add(key)
 source=row.get('sourceManifest') or parent.get('sourceManifest')
 if not source:
  m=parent.get('manifest') or parent.get('source') or {};source=m.get('runtime_manifest_sha256') if isinstance(m,dict) else m
 native=row.get('nativeCanvas') or {};native=native.get('file')
 if native:
  n=Path(native);native=str(n.relative_to(R)) if n.is_absolute() else native
 records.append({'id':row.get('id',movie.stem),'folder':folder.name,'file':key,'source':source,'fixture':row.get('fixture',not 'earned-journey' in folder.name),
  'provenance':row.get('supplied') or row.get('provenance') or parent.get('method') or 'See original indexed metadata; not an uncoached-player claim.',
  'seconds':row.get('seconds'),'actualDOMHz':row.get('actualCaptureHz'),'native':native,'sourceIndex':str((folder/'index.json').relative_to(R)) if (folder/'index.json').exists() else None})
for base in [M,R/'reviews/media/R1/first30-reset']:
 for folder in sorted(base.iterdir()):
  if not folder.is_dir():continue
  if base!=M and not(folder.name.startswith('audit11-candidate7') or folder.name.startswith('interface-audit11-candidate7') or folder.name.startswith('comics-audit11-candidate7')):continue
  for file in sorted(folder.glob('index*.json')):
   try:x=json.loads(file.read_text())
   except (ValueError,OSError):continue
   parent=x if isinstance(x,dict) else {};rs=x if isinstance(x,list) else x.get('records',[])
   for row in rs:
    if not isinstance(row,dict):continue
    # Earned index is compact; the per-film record owns the capture data and exact source.
    detail=folder/(row.get('id','')+'.json')
    if 'earned-journey' in folder.name and detail.exists():row={**json.loads(detail.read_text()),**row}
    add(folder,row,parent)
# Retain completed menu-only earned films, which live in the walkthrough actions rather than run records.
for folder in M.glob('*-earned-journey'):
 for file in folder.glob('growth-L*.json'):
  try:add(folder,json.loads(file.read_text()),{'method':'Actual earned return/growth/gear/skill/archive controls. Menu-only full viewport/audio, no native gameplay-frame claim.'})
  except (ValueError,OSError):pass
policy={'generated':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'Original wall-time DOM/Opus-AAC films and native VP8/Opus canvas partners. No retiming/interpolation. DOM requested10Hz; per-film actual rate is metadata. Native requested60Hz is NOT measured60fps. Sparse frame inspection and technical assertions are separate from continuous/listening/player acceptance. All failed/interrupted raw captures remain; this index includes playable indexed exports and does not erase failures.','records':records}
(D/'media-index.json').write_text(json.dumps(policy,indent=2)+'\n')
e=lambda s:html.escape(str(s or ''))
parts=['<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Project Istanbul Audit11 evidence</title>',
 '<style>body{font:16px system-ui;background:#141722;color:#f2ede2;margin:24px;max-width:1500px}a{color:#9ee6ee}p{max-width:100ch}input{font:inherit;padding:10px;width:min(90%,600px)}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px}article{background:#212633;padding:14px;border-radius:8px;overflow-wrap:anywhere}video{width:100%;max-height:600px;background:black}small{display:block}summary{cursor:pointer}code{font-size:11px}h2{margin-top:40px}</style>',
 '<h1>Audit11 — original-time evidence</h1><p>'+e(policy['method'])+'</p><p>Current Mac build: <a href="http://127.0.0.1:8828/?lang=en">final10</a>. Source 0230642ec5e42eb26aee7eb3427a3e7837f3f263ea6f6c6f3feb99a5e028cd5f. Final10 changes only two Cleaver description strings; all prior films retain their actual source. No masterpiece, phone or player acceptance is inferred. See the implementation,328-row ledger and targeted external acceptance script.</p>',
 '<p><a href="../../../AUDIT11-IMPLEMENTATION-2026-11-20.md">Implementation</a> · <a href="../../../AUDIT11-COVERAGE-2026-11-20.md">Coverage</a> · <a href="../../../AUDIT11-BALANCE-2026-11-20.md">Retained balance/payoff</a> · <a href="../../../AUDIT11-ACCEPTANCE-2026-11-20.md">Pending checks</a></p>',
 '<h2>Matched comparisons</h2><p>Baseline22 → candidate7 clean bosses: same seed42, no-weapon invulnerable observer, actual AI and supplied final lethal contact. Observation lengths/phase probe differ and are disclosed in the original index. Candidate7 →8 stress: same supplied legal slots/critical HP/real frenzy/40 high-HP threats/grayscale halfway policy. Random cosmetic particles and live AI do not make identical frames; compare the body/danger hierarchy at1×. Neither fixture is earned difficulty. HUD comparisons use the actual authored L4 instruction at320px,EN,150%.</p>',
 '<p><a href="hud-baseline22-authored/L4-320-en-150.png">L4 before</a> · <a href="hud-pilot3-authored/L4-320-en-150.png">L4 after</a> · <a href="guide-comparison/guide-before-after-event.jpg">L27 guide, actual join+2s before/after</a> · <a href="candidate9-earned-journey/frame-review/index.json">Final9 all30/29 transition samples</a> · <a href="final9-health-direct/index.json">Direct actual health render samples</a></p><p>Native captureStream start/frame delivery can be delayed; nominal wall-mapped contact sheets are sparse state samples, not guaranteed exact-contact or audio-sync proof. Direct same-page health samples resolve the observed brief-effect ambiguity. Original movies/timestamps remain unchanged.</p><input id="filter" placeholder="Find a level, boss, weapon, scene or source folder"><div class="grid">']
for r in records:
 href=Path(r['file']).relative_to('reviews/media/R1');href=Path('..')/href
 label=('SUPPLIED FIXTURE' if r['fixture'] else 'AUTOMATED EARNED CONTROLS')+' · '+r['folder']
 parts.append('<article data-search="'+e(r['id']+' '+r['folder'])+'"><h3>'+e(r['id'])+'</h3><small>'+e(label)+'</small><video controls preload="none" src="'+e(href)+'"></video><small>'+e(r['seconds'])+' seconds; DOM actual '+e(round(r['actualDOMHz'],2) if r['actualDOMHz'] else 'see index')+'Hz</small><code>'+e(r['source'])+'</code><details><summary>Exact conditions</summary><p>'+e(r['provenance'])+'</p></details>')
 if r['native']:
  n=Path('..')/Path(r['native']).relative_to('reviews/media/R1');parts.append('<a href="'+e(n)+'">Original native canvas/audio</a>')
 parts.append('</article>')
parts.append('</div><h2>Retained failures and interruptions</h2><p>Superseded source6/7/8 checks, original transaction/stress exporter failures, final9 L3 observer interruption and failed health claims remain in the telemetry packet. They are not silent passes.</p><ul>')
for f in sorted(M.rglob('*.error.json')):
 parts.append('<li><a href="'+e(f.relative_to(M))+'">'+e(f.relative_to(M))+'</a></li>')
parts.append('</ul><p><a href="../../../telemetry/audit11-implementation/candidate9-earned-interruption.json">Final9 original L3 observer interruption</a> · <a href="../../../telemetry/audit11-implementation/final9-health-direct-wrapper.json">Health check wrapper failure</a></p><script>document.getElementById("filter").oninput=function(){let s=this.value.toLowerCase();document.querySelectorAll("article").forEach(e=>e.hidden=!e.dataset.search.toLowerCase().includes(s))}</script>')
(M/'index.html').write_text('\n'.join(parts)+'\n');print('Indexed',len(records),'original media exports')
