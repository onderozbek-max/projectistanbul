"""Sample the actual earned films and complete scene/control handoffs; never claim temporal viewing."""
from pathlib import Path
import concurrent.futures,json,math,subprocess,tempfile
ROOT=Path(__file__).resolve().parents[2];BASE=ROOT/'reviews/media/R1/audit9-implementation'
OUT=BASE/'review-earned-final12';OUT.mkdir(exist_ok=True)
WALK=BASE/'walkthrough-final12';index=json.loads((WALK/'index.json').read_text());jobs=[]

def event_time(row,event):
    samples=row['facts']['samples']
    sample=min(samples,key=lambda s:abs(s['t']-event['t']))
    return sample['wall']-row['viewportStart']

for level in range(1,31):
    entry=next((r for r in index['records'] if r['level']==level and r['outcome']=='won'),None)
    if not entry:continue
    row=json.loads((WALK/(entry['id']+'.json')).read_text());events=row['facts']['events']
    action=next((e for e in events if e['type'] in ['hackStart','hackDone','routeSpace','routeBeat'] and e['t']>8),None)
    boss=next((e for e in events if e['type'] in ['bossWindup','bossIntro','bruteRoar']),None)
    samples=row['facts']['samples'];world=[s for s in samples if s.get('world') and s.get('scene') and 'entry' not in str(s['scene'])]
    scene=world[0]['wall']-row['viewportStart'] if world else row['seconds']*.70
    departure=next((s for s in samples if world and s['wall']>world[-1]['wall'] and not s.get('scene') and s['state']=='play'),None)
    times=[.6,max(0,event_time(row,action)-2) if action else row['seconds']*.18,
        event_time(row,action)+.5 if action else row['seconds']*.28,
        event_time(row,boss)+.7 if boss else row['seconds']*.45,
        scene+.7,scene+3,departure['wall']-row['viewportStart']+.6 if departure else row['seconds']*.85,row['seconds']-.4]
    jobs.append(('earned-L'+str(level),WALK/(entry['id']+'.mp4'),times,row['sourceManifest'],row['seconds']))

for folder,key in [('integrated12-cold','cold'),('integrated12-dense','dense'),('integrated12-accessible-dense','dense'),
    ('integrated12-health','health'),('integrated12-accessible-health','health'),('ui-comparison',None)]:
    path=BASE/folder/('index-'+key+'.json' if key else 'index.json')
    for row in json.loads(path.read_text()):
        jobs.append((folder+'-'+row['id'],BASE/folder/(row.get('file') or row['id']+'.mp4'),
            [row['seconds']*f for f in [.08,.2,.33,.46,.59,.72,.85,.96]],row['sourceManifest'],row['seconds']))

for path in sorted((BASE/'conditional-earned23').glob('L*-attempt*.json')):
    row=json.loads(path.read_text())
    if row['facts']['mode']!='won':continue
    world=[s for s in row['facts']['samples'] if s.get('world') and s.get('scene') and 'entry' not in str(s['scene'])]
    reading=next((s for s in row['facts']['samples'] if world and s['wall']>world[-1]['wall'] and s.get('scene')),None)
    if reading:
        start=reading['wall']-row['viewportStart']
        times=[world[0]['wall']-row['viewportStart']+.7,world[0]['wall']-row['viewportStart']+3,
            start+1,start+6,start+12,start+18,start+24,row['seconds']-.4]
    else:times=[row['seconds']*f for f in [.08,.2,.33,.46,.59,.72,.85,.96]]
    jobs.append(('imported-earned-'+row['id'],path.with_suffix('.mp4'),times,row['sourceManifest'],row['seconds']))

if __import__('os').environ.get('AUDIT9_JOURNEY_SAMPLE_SCOPE'):
    scope=__import__('os').environ['AUDIT9_JOURNEY_SAMPLE_SCOPE'].split(',')
    jobs=[j for j in jobs if any(j[0].startswith(p) for p in scope)]

def sheet(job):
    name,path,times,source,duration=job;tmp=Path(tempfile.mkdtemp(prefix='audit9-earned-sheet-'))
    for i,t in enumerate(times):
        subprocess.check_call(['ffmpeg','-v','error','-ss',str(round(max(0,min(t,duration-.12)),3)),
            '-i',str(path),'-frames:v','1','-vf','scale=195:422','-threads','1',str(tmp/('f%02d.png'%i))])
    subprocess.check_call(['ffmpeg','-v','error','-framerate','1','-i',str(tmp/'f%02d.png'),
        '-vf','tile=4x2','-frames:v','1','-threads','1','-y',str(OUT/(name+'.jpg'))])
    print(name,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(sheet,jobs))
(OUT/'manifest.json').write_text(json.dumps({'method':'Eight full-viewport frame samples. Event-to-wall seeking is approximate500ms. '
    'Complete original-time films retained. Not continuous-motion or listening acceptance.',
    'samples':[{'sheet':n+'.jpg','file':str(p.relative_to(ROOT)),'times':ts,'runtime':h} for n,p,ts,h,d in jobs]},indent=2)+'\n')
