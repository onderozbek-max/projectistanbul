"""Matched, explicitly supplied mechanism comparisons. The earned journey is separate."""
from pathlib import Path
import json,html
ROOT=Path(__file__).resolve().parents[2];BASE=ROOT/'reviews/media/R1/audit9-implementation'
def read(folder,name):return json.loads((BASE/folder/name).read_text())
before=read('before-world','index-world.json');after=read('integrated12-world','index-world.json')
assert len(before)==len(after)==30
rows=[]
for level in range(1,31):
 pair=[]
 for folder,items in [('before-world',before),('integrated12-world',after)]:
  row=next(r for r in items if r['id']=='world-L'+str(level));assert row['outcome']['opened']
  samples=row['recordingSamples'];events=[e for e in row['facts']['events'] if e['type'] in ['hackStart','hackDone','routeBeat','routeSpace','milestone','shutterOpen']]
  marks=[]
  for event in events:
   at=min(samples,key=lambda s:abs(s['t']-event['t']))['wall']-row['viewportStart']
   marks.append({'event':event,'seconds':max(0,min(row['seconds']-.1,at))})
  pair.append({'folder':folder,'file':folder+'/'+row['file'],'source':row['sourceManifest'],'seconds':row['seconds'],
   'fixture':True,'conditions':row['supplied'],'markers':marks,'opened':True})
 rows.append({'level':level,'before':pair[0],'after':pair[1]})
qualifications=['These are quiet direct-entry mechanism fixtures, not ordinary difficulty or discovery.',
 'Position/rank5 knife/invulnerability are supplied; ambient spawning and in-run story are suppressed.',
 'L1 uses an actual supplied lethal hit to inspect shutter release. Fresh L1/earned Cook are separate.',
 'L2 approach marks are bypassed, so the existing tram controller is constructed with Hack.place by the fixture fallback. The fresh rendered L2 proves its natural creation and ordinary ring/gathering/tram/exit flow.',
 'Direct-entry later levels do not supply earned companionship. Main/conditional earned runs prove that relationship.',
 'Event links use nearest125ms clock samples. They aid seeking; full normal-speed films and continuous human review remain necessary.']
(BASE/'world-comparison.json').write_text(json.dumps({'method':qualifications,'levels':rows},indent=2)+'\n')
body='<!doctype html><meta charset="utf-8"><title>Audit9 ·30 mechanism comparisons</title><style>body{font:16px system-ui;background:#161b24;color:#f4eedf;line-height:1.5;margin:24px}a{color:#94deee}video{width:min(390px,45%);max-height:75vh}details{border:1px solid #626b7e;padding:12px;margin:16px 0}</style><h1>All30 mechanism comparisons</h1>'
for q in qualifications:body+='<p>'+html.escape(q)+'</p>'
for row in rows:
 body+='<details><summary>L'+str(row['level'])+' · approach/action/opened consequence</summary>'
 for side in ['before','after']:
  r=row[side];body+='<h3>'+side+'</h3><video controls preload="none" src="'+r['file']+'"></video><p>Source '+r['source']+'</p><ul>'
  for m in r['markers'][:12]:
   event=m['event'];label=event['type']+' '+str(event.get('phase',event.get('kind','')))
   body+='<li><a href="'+r['file']+'#t='+str(round(m['seconds'],2))+'">'+html.escape(label)+'</a></li>'
  body+='</ul>'
 body+='</details>'
(BASE/'world-comparison.html').write_text(body)
print('All30 before/after fixture actions open; qualifications retained.')
