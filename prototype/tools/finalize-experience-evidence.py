import json,hashlib,subprocess,re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
R=Path.cwd();D=R/'reviews/telemetry/experiential';M=R/'reviews/media/R1/experiential'
b=json.loads((D/'build.json').read_text());h=b['runtime_manifest_sha256']
rows=[]
for p in sorted(M.glob('index-*.json')):
 if p.name=='index-additions.json':continue
 for r in json.loads(p.read_text()):
  if r.get('id')=='lifecycle' and not r.get('file'):
   r.update({'sourceManifest':h,'provenance':'Direct shared-clock/input assertion in final frozen lifecycle capture batch; no media file for this assertion.'})
  rows.append(r)
for r in json.loads((M/'index-additions.json').read_text()):rows.append(r)
assert all(r.get('sourceManifest')==h for r in rows),'Mixed runtime hashes'
ids=[r.get('id')or 'earned-L'+str(r['level'])for r in rows];assert len(set(ids))==len(ids),'Duplicate records'
for r in rows:
 for key in ['file','still']:
  if r.get(key):assert (M/r[key]).is_file()and(M/r[key]).stat().st_size>0,r[key]
def probe(r):
 if not r.get('file'):return None
 p=M/r['file'];v=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_type,codec_name','-of','json',str(p)],text=True))
 types=[x['codec_type']for x in v['streams']];assert 'video'in types and 'audio'in types,p.name
 seconds=v.get('format',{}).get('duration');basis='container duration'
 if seconds is None:
  packets=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','packet=pts_time,duration_time','-of','json',str(p)],text=True))['packets']
  seconds=float(packets[-1]['pts_time'])+float(packets[-1].get('duration_time',0))-float(packets[0]['pts_time']);basis='last video packet; streaming MediaRecorder WebM has no finalized duration header'
 seconds=float(seconds);assert seconds>.25,p.name
 return {'file':p.name,'seconds':seconds,'durationBasis':basis,'streams':v['streams'],'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
with ThreadPoolExecutor(max_workers=4)as pool:media=[r for r in pool.map(probe,rows)if r]
(M/'index.json').write_text(json.dumps(rows,indent=2)+'\n')
(D/'media-validation.json').write_text(json.dumps({'sourceManifest':h,'indexedRecords':len(rows),'normalSpeedAudiovisualFiles':len(media),'files':media},indent=2)+'\n')
(D/'media.sha256').write_text(''.join(x['sha256']+'  '+str((M/x['file']).relative_to(R))+'\n'for x in media))
print(len(rows),'records;',len(media),'valid AV files; single frozen runtime',h)
