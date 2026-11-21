"""Sampled frames for seams/composition only. Never continuous-motion acceptance."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,subprocess,tempfile
R=Path(__file__).resolve().parents[2];M=R/'reviews/media/R1/first30-reset';D=R/'reviews/telemetry/first30-reset';out=M/'candidate15-frame-review';out.mkdir(exist_ok=True);records=[]
for q in json.loads((M/'candidate15-boss-hidden/index-bosses.json').read_text()):
 movie=M/'candidate15-boss-hidden'/q['file'];duration=q['seconds'];times=[.25,1.5,3.4,5.8,9.5,13.8,22,min(duration-.5,27.1)];sheet=Image.new('RGB',(960,710),'#151722');draw=ImageDraw.Draw(sheet)
 for i,t in enumerate(times):
  f=out/(q['id']+'-'+str(i)+'.png');subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(movie),'-frames:v','1',str(f)],check=True)
  im=Image.open(f).convert('RGB').crop((15,155,375,665));im.thumbnail((235,330));x=i%4*240;y=i//4*355;sheet.paste(im,(x,y+20));draw.text((x+4,y+3),str(round(t,2))+'s',fill='white')
 path=out/(q['id']+'-sampled.png');sheet.save(path);records.append({'id':q['id'],'sourceManifest':q['sourceManifest'],'original':str(movie.relative_to(R)),'sampledSeconds':times,'sheet':str(path.relative_to(R)),'method':'Eight direct DOM-film frames cropped to action region for seam/scale/composition review. No interpolated frames. This is sampled-frame evidence, not continuous motion, audible mix or player acceptance.'})
(out/'index.json').write_text(json.dumps(records,indent=2)+'\n');print('Ten boss frame-review sheets prepared')
