"""Original-time final Audit11 frame inventory. Sparse frames never certify motion or audio."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,subprocess,sys,os
candidate=os.environ.get('AUDIT11_CANDIDATE','7')
R=Path(__file__).resolve().parents[2];M=R/'reviews/media/R1/audit11-implementation';out=M/('final'+candidate+'-frame-review');out.mkdir(exist_ok=True)
mode=sys.argv[1] if len(sys.argv)>1 else 'bosses';rows=[];durations={}
def sample(d,r,t,native=False):
 movie=Path(r['nativeCanvas']['file']) if native else d/r['file']
 if not movie.is_absolute():movie=R/movie
 if str(movie) not in durations:
  probe=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(movie)],capture_output=True,text=True,check=True)
  durations[str(movie)]=float(json.loads(probe.stdout)['format']['duration'])
 t=min(t,max(.01,durations[str(movie)]-.25))
 name=d.name+'-'+r['id']+'-'+str(round(t,3))+('-native' if native else '')+'.jpg';p=out/name
 if not p.exists():subprocess.run(['ffmpeg','-threads','1','-v','error','-ss',str(t),'-i',str(movie),'-frames:v','1','-q:v','3','-y',str(p)],check=True)
 rows.append({'id':r['id'],'source':r.get('sourceManifest'),'movie':str(movie.relative_to(R)),'seconds':t,'frame':str(p.relative_to(R)),'fixture':r.get('fixture',True),'nativeNoDOM':native})
 return Image.open(p).convert('RGB')
def sheet(images,name,cols=4,cell=(300,650),crop=None):
 if not images:return
 w,h=cell;im=Image.new('RGB',(cols*w,((len(images)+cols-1)//cols)*h),'#161924');dr=ImageDraw.Draw(im)
 for i,(pic,label) in enumerate(images):
  if crop:pic=pic.crop(crop)
  pic.thumbnail((w,h-25));x=i%cols*w;y=i//cols*h;im.paste(pic,(x,y+25));dr.text((x+4,y+5),label,fill='white')
 im.save(out/(name+'.jpg'),quality=90)
if mode=='bosses':
 dirs=[M/'final7-bosses',M/'final7-stress-default-repair2',M/'final7-stress-reduced-repair2'] if candidate=='7' else [M/'final8-stress-default-repair',M/'final8-stress-reduced-repair']
 for d in dirs:
  f=d/'index-bosses.json'
  if not f.exists():continue
  for r in json.loads(f.read_text()):
   times=[.35,1.5,3.2,5.8,9,13.5,max(14,r['seconds']-3.2),max(15,r['seconds']-1.1)]
   imgs=[(sample(d,r,t),r['id']+' '+str(round(t,2))+'s') for t in times if t<r['seconds']]
   sheet(imgs,d.name+'-'+r['id'],4,(300,485),(0,130,390,730))
elif mode=='worlds':
 worlds=[]
 for d in [M/'final7-worlds',M/'final7-worlds-remainder']:
  for r in json.loads((d/'index-world.json').read_text()):worlds.append((d,r))
 worlds.sort(key=lambda x:int(x[1]['id'].split('L')[1]))
 for start in range(0,30,5):
  imgs=[]
  for d,r in worlds[start:start+5]:
   for t in [min(1,r['seconds']*.2),max(.5,r['seconds']-.9)]:imgs.append((sample(d,r,t,True),r['id']+' noHUD '+str(round(t,2))+'s'))
  sheet(imgs,'worlds-'+str(start+1),5,(300,650))
elif mode=='earned':
 d=M/'candidate6-earned-journey';index=json.loads((d/'index.json').read_text())
 for start in range(1,31,5):
  imgs=[]
  for level in range(start,start+5):
   rs=[r for r in index['records'] if r['level']==level and r['outcome']=='won']
   if not rs:continue
   r=json.loads((d/(rs[0]['id']+'.json')).read_text());r['file']=rs[0]['file'];r['fixture']=False
   samples=r['facts']['samples'];ts=[s for s in samples if s['state']=='play' and s['t']>12]
   for frac in [.35,.70]:
    if not ts:continue
    s=ts[int((len(ts)-1)*frac)];t=max(.1,s['wall']-r['viewportStart'])
    if t<r['seconds']:imgs.append((sample(d,r,t),r['id']+' '+str(round(t,2))+'s'))
  sheet(imgs,'earned-'+str(start),5,(300,650))
elif mode=='roster':
 for name,indexfile in [('final7-arsenal','index-arsenal.json'),('final7-roles','index-roles.json')]:
  d=M/name
  if not (d/indexfile).exists():continue
  rs=json.loads((d/indexfile).read_text())
  for start in range(0,len(rs),5):
   imgs=[]
   for r in rs[start:start+5]:
    for frac in [.28,.62]:
     t=r['seconds']*frac;imgs.append((sample(d,r,t),r['id']+' '+str(round(t,2))+'s'))
   sheet(imgs,name+'-'+str(start),5,(300,650))
elif mode=='misc':
 for name in ['final7-health-default','final7-health-reduced','final7-overlap-default','final7-overlap-reduced','final7-scenes']:
  d=M/name
  f=next(d.glob('index*.json'),None)
  if not f:continue
  rs=json.loads(f.read_text());rs=rs if isinstance(rs,list) else rs['records']
  for r in rs:
   if not r.get('file') and (d/(r['id']+'.mp4')).exists():r['file']=r['id']+'.mp4'
   if not r.get('file'):continue
   imgs=[]
   for frac in [.05,.20,.40,.60,.80,.94]:
    t=r['seconds']*frac;imgs.append((sample(d,r,t),r['id']+' '+str(round(t,2))+'s'))
   sheet(imgs,name+'-'+r['id'],3,(390,870))
(out/('index-'+mode+'.json')).write_text(json.dumps({'method':'Direct original-time frames. Inspection must be separately recorded; extracting a frame is not viewing, motion/listening or player validation. Native world rows exclude DOM objective to inspect composition. Source6 earned films are explicitly source6; all JS/config/sim equal7, only two unused CSS keyframes removed.','records':rows},indent=2)+'\n')
print(mode,len(rows),'frames')
