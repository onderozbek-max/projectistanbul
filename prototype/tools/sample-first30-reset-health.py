"""Actual impact-window samples; late named stills do not demonstrate brief feedback."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,subprocess
R=Path(__file__).resolve().parents[2];M=R/'reviews/media/R1/first30-reset';out=M/'candidate15-feedback-frame-review';out.mkdir(exist_ok=True);rows=[]
for mode in ['default','reduced']:
 folder=M/('candidate15-health-'+mode);r=json.loads((folder/'index-health.json').read_text())[0];samples=r['recordingSamples'];events=r['facts']['events'];cases=[]
 for label,event in [(e['cause'],e) for e in events if e['type']=='heroHit'][:5]:cases.append((label,event))
 cases += [('block',next(e for e in events if e['type']=='shieldBlock')),('heal',next(e for e in events if (e['type']=='pickup' and e.get('healed',0)>0) or e['type']=='healPulse')),('simultaneous',next(e for e in events if e['type']=='heroHit' and e['t']>9))]
 sheet=Image.new('RGB',(1170,950),'#171923');draw=ImageDraw.Draw(sheet)
 for i,(label,e) in enumerate(cases):
  sample=min(samples,key=lambda s:abs(s['t']-(e['t']+.065)));t=max(0,min(r['seconds']-.1,sample['wall']-r['viewportStart']));p=out/(mode+'-impact-'+str(i)+'.png')
  subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(folder/r['file']),'-frames:v','1',str(p)],check=True)
  im=Image.open(p).convert('RGB').crop((0,305,390,595));sheet.paste(im,(i%3*390,i//3*315+25));draw.text((i%3*390+5,i//3*315+3),mode+' '+label+' @'+str(round(t,2))+'s',fill='white');rows.append({'setting':mode,'event':e,'movieSecond':t,'sample':str(p.relative_to(R)),'sourceManifest':r['sourceManifest'],'method':'Nearest retained sample to actual event +65ms, original wall-time mapping;125ms observer cadence bounds precision. Frame only, not continuous movement or noticeability proof.'})
 sheet.save(out/('health-impact-'+mode+'.png'))
(out/'impact-index.json').write_text(json.dumps(rows,indent=2)+'\n');print('Actual event-window health samples prepared')
