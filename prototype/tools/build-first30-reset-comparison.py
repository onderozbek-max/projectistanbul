"""Three matched normal-time before/after pairs; no artistic verdict from file presence."""
from pathlib import Path
import json,html
R=Path(__file__).resolve().parents[2];M=R/'reviews/media/R1/first30-reset';before=M/'matched-before-source13';after=M/'candidate17-matched-after'
b=json.loads((before/'index-bosses.json').read_text());a=json.loads((after/'index-bosses.json').read_text());rows=[]
for level in [1,15,25]:
 id='boss-L'+str(level);old=next(x for x in b if x['id']==id);new=next(x for x in a if x['id']==id)
 rows.append({'level':level,'before':{'source':old['sourceManifest'],'movie':str((before/old['file']).relative_to(R))},'after':{'source':new['sourceManifest'],'movie':str((after/new['file']).relative_to(R))},'conditions':'Same supplied portrait boss observer/seed42 and observation policy. These are synthetic comparison fixtures, not earned balance. New mechanics/death timing can diverge; original timestamps retained. Continuous motion/audio verdict and human acceptance pending.'})
(M/'matched-comparison.json').write_text(json.dumps(rows,indent=2)+'\n')
s=['<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content="width=device-width"><title>First30 before / after</title><style>body{background:#161824;color:#faf0df;font:16px system-ui;margin:24px}section{max-width:1000px;margin:30px auto}.pair{display:flex;gap:16px}.pair>div{flex:1;min-width:0}video{width:100%;max-height:650px}a{color:#9edfff}</style><h1>Matched before / after</h1><p>Original wall-time films, no interpolation. Supplied fixtures show the same boss under the same observation policy. They are separate from the fresh earned first30 journey. File presence is not acceptance of fluidity, sound or fun.</p><a href=index.html>Complete indexed evidence</a>']
for row in rows:
 s.append('<section><h2>Bölüm '+str(row['level'])+'</h2><div class=pair>')
 for side in ['before','after']:
  movie=Path(row[side]['movie']).relative_to(M.relative_to(R));s.append('<div><h3>'+side+'</h3><video controls preload=none src="'+html.escape(str(movie),quote=True)+'"></video><p>'+row[side]['source'][:16]+'…</p></div>')
 s.append('</div><p>'+row['conditions']+'</p></section>')
(M/'matched-comparison.html').write_text('\n'.join(s)+'\n');print('Three exact-source matched pairs indexed')
