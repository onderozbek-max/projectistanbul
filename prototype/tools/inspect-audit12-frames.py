"""Indexed still samples from original-time films. Never continuous-motion or audio acceptance."""
from pathlib import Path
import json,sys,subprocess,io
from PIL import Image,ImageDraw

root=Path(__file__).resolve().parents[2]
source=root/'reviews/media/R1/audit12-implementation'/(sys.argv[1] if len(sys.argv)>1 else 'integrated5-arsenal')
out=root/'reviews/media/R1/audit12-implementation'/(sys.argv[2] if len(sys.argv)>2 else 'arsenal-sampled-review')
out.mkdir(exist_ok=True)
rows=json.loads((source/'index-arsenal.json').read_text());groups={};records=[]
for row in rows:
    group=row['id'].rsplit('-r',1)[0] if row['id'].startswith('weapon-') else row['id']
    groups.setdefault(group,[]).append(row)
for group,clips in groups.items():
    sheet=Image.new('RGB',(390*len(clips),434*3),'#24242c');draw=ImageDraw.Draw(sheet)
    for col,row in enumerate(clips):
        samples=row['recordingSamples'];lo=samples[0]['t'];hi=samples[-1]['t']
        hit=next((e for e in row['facts']['events'] if e['type']=='hit' and lo+1<e['t']<hi-1),None)
        t=hit['t'] if hit else (lo+hi)/2
        at=min(samples,key=lambda q:abs(q['t']-t))['wall']-row['viewportStart']
        times=[max(.05,min(row['seconds']-.1,at+offset)) for offset in [-.2,0,.35]]
        for n,sec in enumerate(times):
            result=subprocess.run(['ffmpeg','-v','error','-ss',str(sec),'-i',str(source/row['file']),'-frames:v','1','-f','image2pipe','-vcodec','png','-'],capture_output=True,check=True)
            pic=Image.open(io.BytesIO(result.stdout)).convert('RGB').crop((0,225,390,625))
            sheet.paste(pic,(390*col,434*n+30));draw.text((390*col+8,434*n+8),row['id']+' @ '+str(round(sec,2))+'s',fill='white')
        records.append({'id':row['id'],'sourceManifest':row['sourceManifest'],'film':str(source/row['file']),'sampleSeconds':times,'actualHitSimulationTime':hit['t'] if hit else None,'method':'Nearest recorded clock/wall sample around actual hit when available; approximately +/- screenshot/sample latency. No motion inference.'})
    file=out/(group+'.jpg');sheet.save(file,quality=86);print(file,flush=True)
(out/'index.json').write_text(json.dumps({'method':'Three original-film stills per attack, cropped to world for inspection; not animation, audio, human or phone acceptance.','records':records},indent=2)+'\n')
