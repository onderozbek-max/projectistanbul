"""Mechanical samples of original-time films; frame inspection never certifies fluid motion or audio."""
from pathlib import Path
import subprocess,json
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[2];base=root/'reviews/media/R1/audit11-implementation';out=base/'boss-frame-review';out.mkdir(exist_ok=True)
levels=[1,2,3,4,5,10,15,20,25,30];rows=[]
for tag in ['baseline22','pilot4']:
 d=base/('bosses-'+tag)
 for level in levels:
  movie=d/('boss-L'+str(level)+'.mp4');index=json.loads((d/'index-bosses.json').read_text());entry=next(r for r in index if r['id']=='boss-L'+str(level))
  for t in [1,3,5,8,12,16,18.8]:
   target=out/(tag+'-L'+str(level)+'-'+str(t)+'.png');subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',str(movie),'-frames:v','1','-y',str(target)],check=True)
   rows.append({'source':entry['sourceManifest'],'tag':tag,'level':level,'movie':str(movie.relative_to(root)),'sampleSecond':t,'frame':str(target.relative_to(root)),'fixture':True})
 for start in [0,5]:
  sheet=Image.new('RGB',(5*260,2*580),(24,25,30));draw=ImageDraw.Draw(sheet)
  for i,level in enumerate(levels[start:start+5]):
   for j,t in enumerate([3,8]):
    im=Image.open(out/(tag+'-L'+str(level)+'-'+str(t)+'.png')).convert('RGB');im.thumbnail((260,550));x=i*260;y=j*580
    sheet.paste(im,(x,y+25));draw.text((x+4,y+5),'L'+str(level)+' / '+tag+' / '+str(t)+'s',fill='white')
  sheet.save(out/(tag+'-'+str(start)+'.jpg'),quality=90)
(out/'index.json').write_text(json.dumps({'method':'Original DOM film timestamps, unchanged normal HUD except deliberately hidden boss name/bar. Invulnerable no-weapon observer and real AI; supplied lethal end contact. Sparse frames only, no motion/audio acceptance.','rows':rows},indent=2)+'\n')
print('Sampled',len(rows),'retained actual film frames')
