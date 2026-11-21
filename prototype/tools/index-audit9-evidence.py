"""A source-labelled local index; never turns a supplied fixture into an earned run."""
from pathlib import Path
import json,html
ROOT=Path(__file__).resolve().parents[2];BASE=ROOT/'reviews/media/R1/audit9-implementation';DATA=ROOT/'reviews/telemetry/audit9-implementation';FINAL='integrated13';WALK='walkthrough-final12'
def read(p,default=None):return json.loads(p.read_text()) if p.exists() else default
def esc(s):return html.escape(str(s),quote=True)
manifest=read(DATA/(FINAL+'.json'));entries=[];sections=[]
def add(name,folder,indexname,select=lambda x:True):
 rows=read(BASE/folder/indexname,[]) or [];items=[]
 for r in rows:
  if not select(r):continue
  f=r.get('file') or r['id']+'.mp4'
  if not (BASE/folder/f).exists():continue
  item={'id':r['id'],'file':folder+'/'+f,'source':r['sourceManifest'],'fixture':r.get('fixture',True),'conditions':r.get('supplied',''),
   'seconds':r.get('seconds'),'index':folder+'/'+indexname,'captureMethod':r.get('captureMethod','Original Chrome viewport timestamps; older source retained.')}
  if folder.endswith('world') and r['id']=='world-L2':item['conditions']+=' Fixture bypasses approach marks and constructs the existing tram control with Hack.place. Natural creation is verified by the fresh earned L2.'
  entries.append(item);items.append(item)
 sections.append((name,items))
def cards(items):
 return '<div class="grid">'+''.join('<figure><video controls preload="none" src="'+esc(x['file'])+'"></video><figcaption><b>'+esc(x['id'])+'</b><br>'+('Supplied fixture' if x['fixture'] else 'Fresh ordinary input')+' · '+esc(x['source'][:16])+'…<p>'+esc(x['conditions'])+'</p><a href="'+esc(x['index'])+'">Exact capture/source facts</a></figcaption></figure>' for x in items)+'</div>'
walk=read(BASE/WALK/'index.json',{'records':[],'actions':[]});earned=[]
for r in walk['records']:
 p=BASE/WALK/(r['id']+'.json')
 if not p.exists():continue
 x=read(p);item={'id':r['id'],'file':WALK+'/'+r['file'],'source':x['sourceManifest'],'fixture':False,'conditions':'Earned persistent state, actual visible menus/choices, disclosed automated navigation through normal pointer/key handlers. Outcome '+r['outcome']+'. No power grants, imported save, simulation stepping or outcome injection. Ordinary first-run Second Wind is retained in L01-attempt0; no supplied/prototype revive action.','seconds':x['seconds'],'index':WALK+'/'+r['id']+'.json','captureMethod':x.get('captureMethod')}
 earned.append(item);entries.append(item)
sections.append(('Complete earned input journey · actual retries retained',earned))
current=[]
for p in sorted((BASE/'ending-final13-earned').glob('L*-attempt*.json')):
 r=read(p);item={'id':r['id'],'file':'ending-final13-earned/'+r['id']+'.mp4','source':r['sourceManifest'],'fixture':False,'conditions':'Actual normal replay via earned Sirkeci/level30/Play controls, same completed profile and origin; no save import or grants. Candidate13 only corrects the final result recommendation. This is an earned rematch, not a fresh first clear.','seconds':r['seconds'],'index':'ending-final13-earned/'+p.name,'captureMethod':r['captureMethod']};current.append(item);entries.append(item)
for p in sorted((BASE/'ending-final13-earned').glob('earned-result-inspection-*.json'))[-1:]:
 r=read(p);item={'id':r['id'],'file':'ending-final13-earned/'+r['file'],'source':r['sourceManifest'],'fixture':False,'conditions':r['supplied'],'seconds':r['seconds'],'index':'ending-final13-earned/'+p.name,'captureMethod':r['captureMethod']};current.append(item);entries.append(item)
if (BASE/'ending-final13-earned/earned-final-return.json').exists():
 r=read(BASE/'ending-final13-earned/earned-final-return.json');item={'id':'current-earned-return','file':'ending-final13-earned/'+r['file'],'source':r['sourceManifest'],'fixture':False,'conditions':r['supplied'],'seconds':r['seconds'],'index':'ending-final13-earned/earned-final-return.json','captureMethod':r['captureMethod']};current.append(item);entries.append(item)
sections.append(('Final13 actual earned ending/result/return · current boundary correction',current))
growth=[]
for p in sorted((BASE/WALK).glob('growth-L*.json')):
 r=read(p);item={'id':r['id'],'file':WALK+'/'+r['file'],'source':r['sourceManifest'],'fixture':False,'conditions':r['method'],'seconds':r['seconds'],'index':WALK+'/'+p.name,'captureMethod':r.get('captureMethod')};growth.append(item);entries.append(item)
sections.append(('Earned progression, gear, skills, replay and return · later full-viewport menus',growth))
if (BASE/WALK/'earned-final-return.json').exists():
 r=read(BASE/WALK/'earned-final-return.json');item={'id':r['id'],'file':WALK+'/'+r['file'],'source':r['sourceManifest'],'fixture':False,'conditions':r['supplied'],'seconds':r['seconds'],'index':WALK+'/earned-final-return.json','captureMethod':r['captureMethod']}
 entries.append(item);sections.append(('Final earned map boundary and direct31 refusal',[item]))
conditional=[]
for p in sorted((BASE/'conditional-earned23').glob('L*-attempt*.json')):
 r=read(p);item={'id':r['id'],'file':'conditional-earned23/'+r['id']+'.mp4','source':r['sourceManifest'],'fixture':True,'conditions':'Supplied actual earned pre23 Meta from final12 cover campaign; actual23–25 inputs, help, choices and results. No world/HP/help/outcome injection. All failed24 melee retries retained. '+r.get('sourceOrigin',''),'seconds':r['seconds'],'index':'conditional-earned23/'+p.name,'captureMethod':r.get('captureMethod')};conditional.append(item);entries.append(item)
sections.append(('Supplied earned-state23–25 continuation · true help and later native acknowledgment',conditional))
add('Major scenes · normal and skip/reduced/muted interruption chains','scenes-final12','index.json')
add('Matched build and actual Memories before/after · supplied inventory/archive','ui-comparison','index.json')
# Final recaptures retain supplied conditions and actual source labels.
add('17 bases at ranks1/3/5 and18 evolutions · final supplied contact fixtures','integrated12-arsenal','index-arsenal.json')
add('All ten bosses · final action-specific fixtures','integrated12-bosses','index-bosses.json')
add('Cook close-range supplement','integrated12-cook-close','index-bosses.json')
add('16 enemy roles ·14 natural roles and2 labelled extras','integrated12-roles','index-roles.json')
add('30 world-action fixtures · L1 includes a supplied lethal hit; fresh opening below','integrated12-world','index-world.json')
add('Retained baseline world mechanisms · matched supplied comparison','before-world','index-world.json')
add('Retained baseline native opening · fresh bounded sequence','before-cold','index-cold.json')
add('Verified normal-time baseline priority contacts · replaces a duration-mismatched original','before-contact-verified','index-arsenal.json')
add('Clean boss action supplement · tutorial/ambient speech disabled in fixture only','integrated12-boss-clean','index-bosses.json')
add('Fresh native TR/EN opening · no supplied actor/power/save','integrated12-cold','index-cold.json')
for prefix in ['integrated12','integrated12-accessible']:
 add('Legal six-slot mixed-crowd stress · '+prefix,prefix+'-dense','index-dense.json')
 add('Truthful health · '+prefix,prefix+'-health','index-health.json')
add('Actual authored parked-car combo · supplied weapon/targets','integrated12-car','index-car.json')
add('Automatic Nazar dodge → connected discharge · trigger delayed until inside recording','integrated12-nazar','index-trigger.json')
reel='<video class="reel" controls preload="none" src="audit9-before-after.mp4"></video><p><a href="reel.json">Reel intervals/source/fixture facts</a></p>' if (BASE/'audit9-before-after.mp4').exists() else '<p>Reel is pending the final earned L30 recording.</p>'
cleared=sorted({r['level'] for r in walk['records'] if r['outcome']=='won'});losses=[r for r in walk['records'] if r['outcome']!='won']
body='<!doctype html><meta charset="utf-8"><title>Project Istanbul · Audit9 evidence</title><style>body{font:16px system-ui;line-height:1.5;background:#131620;color:#f5eedb;margin:24px}a{color:#8fdded}h1,h2{line-height:1.2}details{margin:18px 0;border:1px solid #5d6578;padding:14px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,390px));gap:18px}figure{margin:0;background:#222735;padding:10px}video{width:100%;max-height:70vh;background:#050506}figcaption{padding:10px 0;font-size:14px}.reel{max-width:390px}.note{max-width:1000px}</style>'
body+='<h1>Audit9 · evidence</h1><p class="note">Final runtime <code>'+manifest['runtime_manifest_sha256']+'</code>. The fresh all30 journey remains labelled source12; final13 changes only the winning30 result recommendation, independently rechecked in a real earned rematch/return. All other1141 served files are identical. The old30 future-level recap is superseded, not relabelled as corrected. Supplied fixtures, headless diagnostics and rendered earned input are separate. Automated steering is disclosed; this is not an uncoached human run or physical-phone proof. Only frames were inspected by the agent. Continuous-motion artistic review and actual listening remain pending. Older films retain their own source.</p><p><a href="../../../AUDIT9-IMPLEMENTATION-2026-11-19.md">Complete closure packet</a> · <a href="../../../AUDIT9-EXTERNAL-ACCEPTANCE-2026-11-19.md">Exact pending acceptance scripts</a></p>'
body+='<h2>Normal-speed comparison and earned continuation</h2>'+reel
body+='<p>The source12 rendered record contains '+str(len(cleared))+'/30 earned clears and '+str(len(losses))+' non-winning attempts. Every actual result remains linked. '+('The fresh earned journey is complete; final13 boundary replay and unchanged-file applicability are separate. External artistic/device/player acceptance remains open.' if len(cleared)==30 else 'Current progress is not a completion claim.')+'</p>'
for title,items in sections:body+='<details><summary>'+esc(title)+' ('+str(len(items))+')</summary>'+cards(items)+'</details>'
body+='<h2>Failures and rejected evidence</h2><p>Clipped post-interruption screencasts, controller errors, superseded builds and original failed suites remain in their original folders/logs. They are not included as positive final scene/journey proof. See the source/evidence appendix for causes and replacements.</p>'
(BASE/'index.html').write_text(body);(BASE/'media-index.json').write_text(json.dumps({'finalRuntime':manifest['runtime_manifest_sha256'],'earnedClears':cleared,'method':'Positive indexed files only; source/conditions preserved. Rejected versions remain outside the positive index.','entries':entries},indent=2)+'\n')
print('Indexed',len(entries),'files;',len(cleared),'earned source12 levels; current13 boundary separately labelled.')
