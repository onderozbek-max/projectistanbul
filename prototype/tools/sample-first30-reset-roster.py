"""Direct source15 frame samples for material/scale/composition inspection, never fluidity acceptance."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,subprocess,sys
R=Path(__file__).resolve().parents[2];M=R/'reviews/media/R1/first30-reset';D=R/'reviews/telemetry/first30-reset';out=M/'candidate15-roster-frame-review';out.mkdir(exist_ok=True)
source=json.loads((D/'candidate15.json').read_text())['runtime_manifest_sha256'];records=[]
late={'slingshot','chainsaw','extinguisher','olta','cardoor','speargun','fireworks','cable'}
def read(p):
 try:return json.loads(p.read_text())
 except (ValueError,OSError):return []
def entry(id,late=False):
 folder=M/('candidate15-legal-arsenal' if late else 'candidate15-arsenal')
 return folder,next((x for x in read(folder/'index-arsenal.json') if x['id']==id),None)
def sample(q,folder,i,x,y,sheet,draw):
 assert q['sourceManifest']==source
 samples=q.get('recordingSamples',[]);hits=[e for e in q['facts']['events'] if e['type']=='hit']
 targets=[(e,min(samples,key=lambda s:abs(s['t']-e['t']))) for e in hits] if samples else []
 targets=[(e,s,s['wall']-q['viewportStart']) for e,s in targets]
 low,high=(.6,4.5) if i==0 else (8.5,12.5)
 selected=next((v for v in targets if low<=v[2]<=high),None)
 t=selected[2]+.03 if selected else (1.2 if i==0 else 9.8)
 t=min(t,q['seconds']-.2);p=out/(q['id']+'-'+str(i)+'.png')
 subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(folder/q['file']),'-frames:v','1',str(p)],check=True)
 im=Image.open(p).convert('RGB').crop((0,130,390,760));sheet.paste(im,(x,y+25));draw.text((x+5,y+4),q['id']+' @'+str(round(t,2))+'s',fill='white')
 return {'id':q['id'],'sourceManifest':source,'movie':str((folder/q['file']).relative_to(R)),'second':t,'sample':str(p.relative_to(R)),'event':selected[0] if selected else 'Fixed sample: no hit inferred','review':'Frame only; no continuous movement/audio/player verdict'}
weapons=['knife','nailgun','canister','chain','sledge','sawblade','torch','manhole','molotov','slingshot','chainsaw','extinguisher','olta','cardoor','speargun','fireworks','cable']
for w in weapons:
 sheet=Image.new('RGB',(1170,1310),'#151722');draw=ImageDraw.Draw(sheet);shots=[]
 for column,rank in enumerate([1,3,5]):
  folder,q=entry('weapon-'+w+'-r'+str(rank),w in late)
  if not q:raise RuntimeError('Canonical legal record missing: '+w+str(rank))
  for i in range(2):shots.append(sample(q,folder,i,column*390,i*655,sheet,draw))
 p=out/(w+'-ranks.png');sheet.save(p);records.append({'id':w,'sheet':str(p.relative_to(R)),'samples':shots})
 print(w,flush=True)
for offset in range(0,18,6):
 evos=[q for q in read(M/'candidate15-legal-arsenal/index-arsenal.json') if q['id'].startswith('evolution-')][offset:offset+6]
 if len(evos)!=6:raise RuntimeError('Incomplete legal evolved index')
 sheet=Image.new('RGB',(1170,1310),'#151722');draw=ImageDraw.Draw(sheet);shots=[]
 for j,q in enumerate(evos):shots.append(sample(q,M/'candidate15-legal-arsenal',0,j%3*390,j//3*655,sheet,draw))
 p=out/('evolutions-'+str(offset//6+1)+'.png');sheet.save(p);records.append({'id':'evolutions-'+str(offset//6+1),'sheet':str(p.relative_to(R)),'samples':shots})
(out/'index.json').write_text(json.dumps({'sourceManifest':source,'method':'Direct original DOM-film frame at actual recorded hit clock mapped to original viewport wall timestamps where possible; second sample from reacquisition. No re-timing or synthetic frames. Crop0,130,390,760. Samples verify only the pictured state; they do not certify fluidity, every trajectory/contact, audible mix or fun. Legal supplied variants, not earned acquisition.', 'records':records},indent=2)+'\n')
