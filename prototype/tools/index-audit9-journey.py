"""Index real rendered input and source-event intervals without calling it an uncoached human run."""
from pathlib import Path
import json,os,html

ROOT=Path(__file__).resolve().parents[2];BASE=ROOT/'reviews/media/R1/audit9-implementation'
DATA=ROOT/'reviews/telemetry/audit9-implementation';WALK=BASE/'walkthrough-final12'
def read(p):return json.loads(p.read_text())
index=read(WALK/'index.json');build=read(DATA/'integrated12.json');levels=[];failures=[];revives=[];settlement=[];scene_chains=[]
def time_for(row,event):
 samples=row['facts']['samples']
 if not samples:return None
 sample=min(samples,key=lambda s:abs(s['t']-event['t']))
 return max(0,min(row['seconds'],sample['wall']-row['viewportStart']))
def link(file,start=None):return file if start is None else file+'#t='+str(round(start,2))
for level in range(1,31):
 attempts=[r for r in index['records'] if r['level']==level]
 won=next((r for r in attempts if r['outcome']=='won'),None)
 for a in attempts:
  r=read(WALK/(a['id']+'.json'))
  assert r['sourceManifest']==build['runtime_manifest_sha256']
  assert not r['errors'],(r['id'],r['errors'])
  for e in r['facts']['events']:
   if e['type']=='revive':revives.append({'attempt':r['id'],'event':e,'source':'actual ordinary game event; not supplied by the harness'})
  before={x['runId'] for x in r['saveBefore']['settledRuns']}
  after=[x['runId'] for x in r['facts']['save']['settledRuns']]
  fresh=set(after)-before
  assert len(fresh)==1 and len(after)==len(set(after)),('Result must settle once',r['id'],fresh)
  settlement.append({'attempt':r['id'],'newSettledRunIds':list(fresh),'actualResult':r['facts']['mode']})
  if a['outcome']!='won':failures.append({'id':r['id'],'file':r['id']+'.mp4',
   'cause':r['facts'].get('deathCause'),'plannedFailure':r['plannedFailure'],
   'simSeconds':r['facts']['t'],'wallSeconds':r['seconds']})
 if not won:continue
 row=read(WALK/(won['id']+'.json'));facts=row['facts'];events=facts['events']
 if level in [20,25,30]:
  samples=facts['samples'];world=[s for s in samples if s.get('world') and s.get('scene') and 'entry' not in str(s['scene'])]
  assert world,('Missing earned world sequence',level)
  after_world=[s for s in samples if s['wall']>world[-1]['wall'] and not s.get('scene') and s['state']=='play']
  assert after_world and any(s.get('companion',{}).get('moving') for s in after_world),('Shared playable departure missing',level)
  assert all(s['heroWalkable'] and s.get('companion',{}).get('walkable') for s in world),('Unwalkable earned staging',level)
  assert max(s['t'] for s in world)==min(s['t'] for s in world),('Protected earned gameplay clock advanced',level)
  assert max(s['hp'] for s in world)==min(s['hp'] for s in world),('Protected earned HP changed',level)
  if level==20:
   defeat=next(e for e in events if e['type']=='bossDie')
   assert not any(e['type']=='kaanSupport' and e['t']<defeat['t'] for e in events),'Kaan cannot help retroactively during Fisher'
  scene_chains.append({'level':level,'file':row['id']+'.mp4','worldSamples':len(world),
   'protectedGameClockSpan':max(s['t'] for s in world)-min(s['t'] for s in world),
   'protectedHPSpan':max(s['hp'] for s in world)-min(s['hp'] for s in world),
   'walkableActors':True,'sharedPlayableDeparture':True,'actualResult':facts['mode'],
   'source':row['sourceManifest']})
 physical=[e for e in events if e['type'] in ['hackStart','hackDone','routeBeat','routeSpace','milestone','signalRestored','shutterOpen']]
 markers=[{'event':e,'videoSeconds':time_for(row,e)} for e in physical]
 selected=[]
 for e in markers:
  if len(selected)<12:selected.append(e)
 earned_flags=facts['save'].get('flags',{})
 levels.append({'level':level,'id':row['id'],'file':row['id']+'.mp4',
  'source':row['sourceManifest'],'attempts':len(attempts),'simSeconds':facts['t'],'wallSeconds':row['seconds'],
  'beforeActionSeconds':max(0,(markers[0]['videoSeconds'] if markers else 1)-2),
  'physicalMarkers':selected,'sceneSamples':[s for s in facts['samples'] if s.get('scene')][::4],
  'localChoice':facts.get('choice'),'kaanRepay':facts.get('kaanRepay'),'earnedFlags':earned_flags,
  'pendingResult':facts.get('pending'),'evolutionUse':facts.get('evolutionUse'),
  'firstRouteFrame':str(next(iter(sorted(WALK.glob(row['id']+'-route-*.png'))),'').name)
   if list(WALK.glob(row['id']+'-route-*.png')) else None})
out={'runtime':build['runtime_manifest_sha256'],'method':index['method'],
 'notHumanOrPhoneProof':True,'completedLevels':[r['level'] for r in levels],
 'actualRevives':revives,'settlementChecks':settlement,'majorSceneChains':scene_chains,
 'controllerQualifications':['First planned failure contains retained controller detour/idle and ordinary keyboard reorientation.',
  'Same-build/origin/profile controller restart after the finalized result; no imported save/power/outcome supply.',
  'A second same-profile controller restart at earnedL13 changes only actual-card strategy and affordable earned gear selection.',
  'Controller re-anchors its pointer after actual menu clicks. Any supervised real offered choice is separately recorded.',
  'The ordinary first-run automatic Second Wind occurs in L01-attempt0 at46.55s. Legacy raw assists wording says no revives; that means no supplied/prototype revive action, and is corrected explicitly here.',
  'Raw recording outcome may say results because that is the recorder callback return; simulation facts.mode and the attempt index determine actual won/dead outcomes.',
  'Early1–12 growth has actual action logs/stills; later returns have full viewport growth films, including earned Memory/skills/mastery at13.'],
 'timing':'Event times are mapped to the nearest500ms wall/game-clock sample. Protected clock plateaus make this an approximate seeking aid, not frame-exact onset.',
 'levels':levels,'failures':failures,'actions':index['actions']}
(DATA/'final12-rendered-journey.json').write_text(json.dumps(out,indent=2)+'\n')
body='<!doctype html><meta charset="utf-8"><title>Audit9 · earned journey</title><style>body{font:16px system-ui;line-height:1.5;background:#151923;color:#f5eddc;margin:24px}a{color:#93dfec}video{width:min(390px,100%);max-height:72vh;background:black}details{padding:12px;border:1px solid #586273;margin:16px 0}code{word-break:break-all}</style>'
body+='<h1>Earned rendered journey · '+str(len(levels))+'/30</h1><p>Actual ordinary UI and pointer/key handlers; disclosed automated navigation and supervised choices. No power/save/outcome injection. Not uncoached human, phone or enjoyment evidence. Runtime <code>'+build['runtime_manifest_sha256']+'</code>.</p><p>Every real retry is retained. The first planned failure includes a test-controller detour, so its duration is not a game-pacing benchmark. Source-event links are approximate seeking aids; watch the complete approach/action/consequence.</p>'
for r in levels:
 body+='<details><summary>L'+str(r['level'])+' · '+str(r['attempts'])+' attempts · '+str(round(r['simSeconds']))+' simulation seconds</summary><video controls preload="none" src="'+r['file']+'"></video><p><a href="'+r['id']+'.json">Actual save, source, events and conditions</a> · <a href="'+link(r['file'],r['beforeActionSeconds'])+'">Approach before first source marker</a></p><ul>'
 for m in r['physicalMarkers']:
  e=m['event'];label=e['type']+' '+str(e.get('phase',e.get('kind','')))
  body+='<li><a href="'+link(r['file'],m['videoSeconds'])+'">'+html.escape(label)+'</a></li>'
 body+='</ul></details>'
body+='<h2>All actual losses</h2>'
for r in failures:body+='<p><a href="'+r['file']+'">'+r['id']+'</a> · '+html.escape(str(r['cause']))+(' · planned unsafe input' if r['plannedFailure'] else '')+'</p>'
(WALK/'journey.html').write_text(body)
print('Indexed',len(levels),'earned clears,',len(failures),'real non-winning attempts.')
if os.environ.get('AUDIT9_REQUIRE_COMPLETE'):
 assert len(levels)==30,'Final rendered walkthrough is incomplete'
 final=read(WALK/'earned-save-final.json')
 assert len(final['stars'])>=30,'Final save does not contain all first30 clear records'
