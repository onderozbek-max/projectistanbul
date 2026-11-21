"""Technical file/interval verification only; never a listening or artistic approval."""
from pathlib import Path
import concurrent.futures,hashlib,json,subprocess

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'reviews/media/R1/audit9-implementation'
DATA=ROOT/'reviews/telemetry/audit9-implementation'
index=json.loads((BASE/'media-index.json').read_text())
app=json.loads((DATA/'boundary-repair-applicability.json').read_text())
assert app['finalRuntime']==index['finalRuntime'] and app['exactGuardOnly']

def validate(item):
    path=BASE/item['file'];metadata=BASE/item['index']
    rows=json.loads(metadata.read_text())
    row=next(r for r in rows if r['id']==item['id']) if isinstance(rows,list) else rows
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams',
        '-show_format','-of','json',str(path)]))
    video=next(s for s in probe['streams'] if s['codec_type']=='video')
    audio=[s for s in probe['streams'] if s['codec_type']=='audio']
    duration=float(probe['format']['duration']);errors=[]
    if (video['width'],video['height'])!=(390,844):errors.append('wrong viewport dimensions')
    if not audio:errors.append('missing recorded audio stream')
    if not duration>0:errors.append('empty recording')
    if row.get('seconds') and abs(duration-row['seconds'])>.65:errors.append('duration disagrees with recorder')
    if row.get('errors') or row.get('frameErrors'):errors.append('capture/browser errors')
    if row['sourceManifest']!=item['source']:errors.append('source label mismatch')
    if item['file'].startswith(('integrated12','walkthrough-final12','conditional-earned23','scenes-final12')) and item['source']!=app['earlierRuntime']:
        errors.append('qualified earlier evidence uses the wrong runtime')
    if item['file'].startswith('ending-final13-earned') and item['source']!=index['finalRuntime']:
        errors.append('corrected ending evidence uses the wrong runtime')
    samples=row.get('recordingSamples',row.get('facts',{}).get('samples',[]))
    times=[s['t'] for s in samples if 't' in s]
    facts=row.get('facts',{});events=facts.get('events',[])
    real_hits=[e for e in events if e.get('type')=='hit' and times and min(times)<=e['t']<=max(times)]
    if item['file'].startswith('integrated12-arsenal/') and not real_hits:
        errors.append('arsenal has no actual hit inside recording interval')
    if item['file'].startswith('integrated12-nazar/'):
        dodges=[e for e in events if e['type']=='nazarDodge' and times and min(times)<=e['t']<=max(times)]
        if not dodges or not any(e['type']=='stormZap' and abs(e['t']-dodges[0]['t'])<.04 for e in events):
            errors.append('actual Nazar-linked discharge not inside film')
    digest=hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda:stream.read(1024*1024),b''):digest.update(chunk)
    return {'file':item['file'],'source':item['source'],'fixture':item['fixture'],
        'sha256':digest.hexdigest(),'bytes':path.stat().st_size,'seconds':duration,
        'width':video['width'],'height':video['height'],'audioStreams':len(audio),
        'actualHitsWithinSampledInterval':len(real_hits),'errors':errors}

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    results=list(pool.map(validate,index['entries']))
bad=[r for r in results if r['errors']]
out={'runtime':index['finalRuntime'],'files':len(results),'failures':bad,
    'method':'ffprobe, SHA256, source/recorder consistency and actual-hit interval checks. '
        'Audio presence does not mean listening. Dimensions do not mean continuous-motion quality. '
        'Frame-sampled artistic review is recorded separately.','records':results}
(DATA/'final-media-validation.json').write_text(json.dumps(out,indent=2)+'\n')
print(len(results),'indexed files;',len(bad),'technical failures')
for r in bad:print(r['file'],r['errors'])
assert not bad,'Do not treat invalid media as positive proof'
