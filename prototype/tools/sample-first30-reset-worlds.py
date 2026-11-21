"""All30 before/after action-region samples; objective-hidden grouping is not a blind player test."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,subprocess,datetime
R=Path(__file__).resolve().parents[2];M=R/'reviews/media/R1/first30-reset';out=M/'candidate15-world-frame-review';out.mkdir(exist_ok=True);rows=[]
a=json.loads((M/'candidate15-worlds/index-world.json').read_text());correction=json.loads((M/'candidate15-world-L29-crossing/index-world.json').read_text())[0]
assert correction['outcome']['opened'];a=[correction if x['id']=='world-L29' else x for x in a]
for district in range(6):
 sheet=Image.new('RGB',(1950,1310),'#171923');draw=ImageDraw.Draw(sheet)
 for col,q in enumerate(a[district*5:district*5+5]):
  folder=M/('candidate15-world-L29-crossing' if q['id']=='world-L29' else 'candidate15-worlds');assert q['outcome']['opened']
  for j,t in enumerate([.4,max(.5,q['seconds']-1.25)]):
   p=out/(q['id']+'-'+str(j)+'.png');subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(folder/q['file']),'-frames:v','1',str(p)],check=True)
   im=Image.open(p).convert('RGB').crop((0,130,390,760));sheet.paste(im,(col*390,j*655+25));draw.text((col*390+5,j*655+4),q['id']+' @'+str(round(t,2))+'s',fill='white');rows.append({'id':q['id'],'sourceManifest':q['sourceManifest'],'sample':str(p.relative_to(R)),'original':str((folder/q['file']).relative_to(R)),'second':t,'opened':q['outcome']['opened']})
 p=out/('district-'+str(district+1)+'.png');sheet.save(p);print('district',district+1,flush=True)
(out/'index.json').write_text(json.dumps({'method':'Two direct original film frame samples per level, early and after real opening, arena crop0,130,390,760 removes objective HUD. These are supplied action-lifecycle fixtures and source/frame review, not a blind adjacent-level recognition task or ordinary difficulty. L29 original short-stopping diagnostic retained; corrected actual-crossing policy explicitly labelled. No continuous motion or audio verdict.', 'rows':rows},indent=2)+'\n')
