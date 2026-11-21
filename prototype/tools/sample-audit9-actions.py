"""Timer-relative boss/priority-weapon detail samples; full viewport films remain the primary source."""
from pathlib import Path
import subprocess,json,tempfile,concurrent.futures

ROOT=Path(__file__).resolve().parents[2];BASE=ROOT/'reviews/media/R1/audit9-implementation'
OUT=BASE/'review-final12-actions';OUT.mkdir(exist_ok=True)
jobs=[]
def read(p):return json.loads(p.read_text())
for row in read(BASE/'integrated12-boss-clean/index-bosses.json'):
 samples=row['recordingSamples'];first,last=samples[0]['t'],samples[-1]['t'];families=set()
 for event in row['facts']['events']:
  if event['type'] not in ['bossWindup','bruteRoar']:continue
  act=event.get('act') or event.get('move') or 'charge'
  if act in families or not first<=event['t']<=last:continue
  duration=event.get('T',.9)
  times=[]
  for offset in [.1,max(.15,duration-.08),duration+.1,duration+.5]:
   sample=min(samples,key=lambda s:abs(s['t']-(event['t']+offset)))
   at=sample['wall']-row['viewportStart']
   times.append(max(0,min(row['seconds']-.12,at)))
  families.add(act);jobs.append({'id':row['id']+'-'+act,'file':BASE/'integrated12-boss-clean'/row['file'],
   'source':row['sourceManifest'],'event':event,'times':times})
for row in read(BASE/'integrated12-arsenal/index-arsenal.json'):
 if not any(row['id'].startswith('weapon-'+w+'-') for w in ['knife','chain','chainsaw']):continue
 samples=row['recordingSamples'];first,last=samples[0]['t'],samples[-1]['t']
 hit=next(e for e in row['facts']['events'] if e['type']=='hit' and first+.3<e['t']<last-.6)
 times=[]
 for offset in [-.22,-.08,.08,.32]:
  sample=min(samples,key=lambda s:abs(s['t']-hit['t']-offset))
  times.append(max(0,min(row['seconds']-.1,sample['wall']-row['viewportStart'])))
 jobs.append({'id':row['id'],'file':BASE/'integrated12-arsenal'/row['file'],'source':row['sourceManifest'],
  'event':hit,'times':times})
def make(job):
 tmp=Path(tempfile.mkdtemp(prefix='audit9-actions-'))
 for i,t in enumerate(job['times']):
  subprocess.check_call(['ffmpeg','-v','error','-ss',str(t),'-i',str(job['file']),'-frames:v','1',
   '-vf','crop=390:450:0:100','-threads','1',str(tmp/('f%02d.png'%i))])
 subprocess.check_call(['ffmpeg','-v','error','-framerate','1','-i',str(tmp/'f%02d.png'),'-vf','tile=4x1',
  '-frames:v','1','-threads','1','-y',str(OUT/(job['id']+'.jpg'))])
 return job['id']
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 for name in pool.map(make,jobs):print(name,flush=True)
(OUT/'manifest.json').write_text(json.dumps({'method':'Four timer-relative frames, cropped only for detail review. Full390x844 normal-speed source films retained. Not continuous-motion or listening approval. Approximate125ms source sampling.',
 'samples':[{**j,'file':str(j['file'].relative_to(ROOT))} for j in jobs]},indent=2)+'\n')
