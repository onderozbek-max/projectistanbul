"""Pair actual run/return frames without synthesizing outcomes or importing saves."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,subprocess
R=Path(__file__).resolve().parents[2];candidate=sys.argv[1] if len(sys.argv)>1 else '6';d=R/f'reviews/media/R1/audit11-implementation/candidate{candidate}-earned-journey';o=d/'frame-review';o.mkdir(exist_ok=True);idx=json.loads((d/'index.json').read_text());rows=[]
def first_control(r):
 detail=d/(r['id']+'.json')
 if not detail.exists():return None
 q=json.loads(detail.read_text());samples=q.get('facts',{}).get('samples',[])
 candidates=[s for s in samples if s.get('state')=='play'and not s.get('scene')and not s.get('world')and s.get('t',0)>3]
 if not candidates:return None
 sample=candidates[0];p=o/(r['id']+'-first-control.jpg');t=max(.01,sample['wall']-q['viewportStart'])
 if not p.exists():subprocess.run(['/opt/homebrew/bin/ffmpeg','-v','error','-threads','1','-ss',str(t),'-i',str(d/r['file']),'-frames:v','1','-q:v','3','-y',str(p)],check=True)
 rows.append({'level':r['level'],'role':'first-recorded-unprotected-control','source':idx['sourceManifest'],'file':str(p.relative_to(R)),'actualSample':sample,'movieSeconds':t,'method':'Existing -play.png can be overwritten after each card screen; never treat that PNG as first entry. Extract the actual earliest recorded unprotected control sample.'})
 return p
entries={r['level']:first_control(r)for r in idx['records']if r.get('outcome')=='won'}
for base in range(1,31,5):
 im=Image.new('RGB',(4*300,5*665),'#141924');dr=ImageDraw.Draw(im)
 for level in range(base,min(31,base+5)):
  rs=[r for r in idx['records'] if r['level']==level and r['outcome']=='won']
  if not rs:continue
  r=rs[-1];ident=r['id'];routes=list(d.glob(ident+'-route-*.png'));routes.sort(key=lambda p:int(p.stem.rsplit('-',1)[1]));mid=routes[len(routes)//2] if routes else None
  paths=[entries.get(level),mid,d/(ident+'-exit.png'),d/('L'+str(level)+'-return-map.png')]
  for col,p in enumerate(paths):
   if not p or not p.exists():continue
   pic=Image.open(p).convert('RGB');pic.thumbnail((300,635));x=col*300;y=(level-base)*665;im.paste(pic,(x,y+26));dr.text((x+3,y+5),ident+' '+['entry','route','exit','earned map'][col],fill='white');rows.append({'level':level,'id':ident,'role':['entry','route','exit','earned-map'][col],'source':idx['sourceManifest'],'file':str(p.relative_to(R)),'fixture':False})
 im.save(o/('levels-'+str(base)+'.jpg'),quality=91)
# Actual level-end to next playable departure, distinct from a scene fixture.
for base in range(1,30,5):
 im=Image.new('RGB',(4*300,5*665),'#141924');dr=ImageDraw.Draw(im)
 for level in range(base,min(30,base+5)):
  a=[r for r in idx['records'] if r['level']==level and r['outcome']=='won'];b=[r for r in idx['records'] if r['level']==level+1 and r['outcome']=='won']
  if not a or not b:continue
  a,b=a[-1],b[-1]
  paths=[d/(a['id']+'-results.png'),d/('L'+str(level)+'-return-map.png'),d/(b['id']+'-story.png'),entries.get(level+1)]
  for col,p in enumerate(paths):
   if not p or not p.exists():continue
   pic=Image.open(p).convert('RGB');pic.thumbnail((300,635));x=col*300;y=(level-base)*665;im.paste(pic,(x,y+26));dr.text((x+3,y+5),f'L{level} to L{level+1} '+['result','return','next story','next play'][col],fill='white');rows.append({'transition':[level,level+1],'role':['result','return','next-story','next-play'][col],'source':idx['sourceManifest'],'file':str(p.relative_to(R)),'fixture':False})
 im.save(o/('transitions-'+str(base)+'.jpg'),quality=91)
(o/'index.json').write_text(json.dumps({'source':idx['sourceManifest'],'method':'Existing actual earned screenshots. Blank cell means unavailable state screenshot, not invented image. First30 stages and29 departures require actual inspection; no continuous/player claim.','rows':rows},indent=2)+'\n');print('earned',candidate,'frames',len(rows))
