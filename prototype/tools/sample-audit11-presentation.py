"""Original event/phase aligned sparse review frames; never motion or listening acceptance."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,subprocess,sys
R=Path(__file__).resolve().parents[2];M=R/'reviews/media/R1/audit11-implementation';out=M/'additional-frame-review';out.mkdir(exist_ok=True)
rows=[]
def sheet(images,name,cols=3,size=(320,590)):
 w,h=size;pic=Image.new('RGB',(cols*w,((len(images)+cols-1)//cols)*h),'#141922');d=ImageDraw.Draw(pic)
 for i,(p,label) in enumerate(images):
  im=Image.open(p).convert('RGB');im.thumbnail((w,h-24));x=i%cols*w;y=i//cols*h;pic.paste(im,(x,y+24));d.text((x+3,y+4),label,fill='white')
 pic.save(out/(name+'.jpg'),quality=91)
mode=sys.argv[1]
if mode=='comics':
 folder=R/'reviews/media/R1/first30-reset/audit11-candidate7-comics';x=json.loads((folder/'index.json').read_text());shots=[]
 for r in x['records']:
  for s in r['shots']:shots.append((folder/s['file'],r['lang']+' '+r['id']+' '+str(s['revealed'])))
 for i in range(0,len(shots),6):sheet(shots[i:i+6],'comics-'+str(i),3,(320,590))
 rows=[{'frame':str(p.relative_to(R)),'label':label}for p,label in shots]
elif mode=='ui':
 folder=R/'reviews/media/R1/first30-reset/interface-audit11-candidate7';shots=[(p,p.name)for p in sorted(folder.glob('*.png'))]
 for i in range(0,len(shots),6):sheet(shots[i:i+6],'ui-'+str(i),3,(390,870))
 rows=[{'frame':str(p.relative_to(R)),'label':label}for p,label in shots]
elif mode in ['arsenal','advanced']:
 folder=M/'final7-arsenal' if mode=='arsenal' else R/'reviews/media/R1/first30-reset/audit11-candidate7-advanced'
 x=json.loads((folder/'index-arsenal.json').read_text())
 for i,r in enumerate(x):
  samples=r.get('recordingSamples',[]);events=r.get('facts',{}).get('events',[]);phases=r.get('outcome',{}).get('phases',[]);pics=[]
  if not samples:continue
  phaseNames=['stationary','reverse','reacquisition'] if mode=='arsenal' else ['stationary','reverse','reacquisition']
  for phase in phaseNames:
   ps=next((s for s in phases if phase in s['name']),None)
   lower=ps['t']+.05 if ps else samples[0]['t']+.5
   es=[e for e in events if e.get('type')=='hit'and e.get('t',-1)>=lower and e.get('t',0)<lower+3.5]
   ev=es[0] if es else None
   target=ev['t'] if ev else lower+.3
   s=min(samples,key=lambda s:abs(s['t']-target));t=max(.01,s['wall']-r['viewportStart']);p=out/(r['id']+'-'+phase+'.jpg')
   if not p.exists():
    # Original native frames have smooth cadence but no DOM; input time uses the
    # native recording start, unlike the companion viewport's first JPEG.
    movie=Path(r['nativeCanvas']['file']) if r.get('nativeCanvas') else folder/r['file'];start=r['viewportStart']-r.get('audioTrimSeconds',0) if r.get('nativeCanvas') else r['viewportStart'];t=max(.01,s['wall']-start)
    subprocess.run(['ffmpeg','-v','error','-threads','1','-ss',str(t),'-i',str(movie),'-frames:v','1','-q:v','3','-y',str(p)],check=True)
   pics.append((p,r['id']+' '+phase));rows.append({'id':r['id'],'phase':phase,'actualEvent':ev,'simSample':s,'frame':str(p.relative_to(R)),'source':r.get('sourceManifest'),'fixture':True,'method':'Nearest recorded125ms wall-time sample to factual hit after phase; if no hit in3.5s record fallback explicitly. Sparse native frame, not continuity proof.'})
  sheet(pics,mode+'-'+str(i),3,(390,870))
(out/('index-'+mode+'.json')).write_text(json.dumps({'method':'Original sparse captures only. Actual inspection is logged separately. No continuous/audio/player approval.','rows':rows},indent=2)+'\n');print(mode,len(rows),flush=True)
