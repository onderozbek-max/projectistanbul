"""Small navigable gallery of exact final-source evidence; media probes are not artistic review."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json,subprocess,datetime,html,os
R=Path(__file__).resolve().parents[2];D=R/'reviews/telemetry/first30-reset';M=R/'reviews/media/R1/first30-reset';tag='candidate17';items=[];seen=set();rejected=[]
def read(p,d=None):
 try:return json.loads(Path(p).read_text())
 except (OSError,ValueError):return d
source=read(D/(tag+'.json'));cache=read(D/'media-probe-cache.json',{})
def exists(p):return p and Path(p).is_file()
def absolute(p,parent):
 p=Path(p);return p if p.is_absolute() else parent/p

def add(row,index,parent,group,ownerSource):
 if not isinstance(row,dict):return
 id=row.get('id') or row.get('level') or parent.name
 movie=absolute(row['file'],parent) if row.get('file') else None
 if not exists(movie) and row.get('nativeCanvas',{}):movie=Path(str(absolute(row['nativeCanvas']['file'],R)).replace('.canvas.webm','.mp4'))
 if not exists(movie):movie=None
 stills=[]
 for s in [row.get('still'),str(id)+'.png']:
  p=absolute(s,parent) if s else None
  if exists(p) and p not in stills:stills.append(p)
 for shot in row.get('shots',[])[:1]:
  p=absolute(shot['file'],parent)
  if exists(p) and p not in stills:stills.append(p)
 if not movie and not stills:return
 key=(str(movie),tuple(str(p) for p in stills),str(index),str(id))
 if key in seen:return
 seen.add(key);native=row.get('nativeCanvas',{});n=absolute(native['file'],R) if native and native.get('file') else None
 rate=row.get('actualCaptureHz');samples=row.get('recordingSamples',[])
 ratio=(samples[-1]['clock']-samples[0]['clock'])/(samples[-1]['wall']-samples[0]['wall']) if len(samples)>1 and samples[-1]['wall']>samples[0]['wall'] and 'clock' in samples[0] else None
 conditions=row.get('supplied') or row.get('provenance') or row.get('method') or 'See full linked record; not an uncoached player acceptance claim.'
 if row.get('errors'):conditions+=' Retained errors/export limits: '+'; '.join(row['errors'])
 items.append({'id':str(id),'group':('historical15 / '+group if parent.name.startswith('candidate15-') else group),'index':str(index.relative_to(R)),'sourceManifest':row.get('sourceManifest') or ownerSource or source['runtime_manifest_sha256'],'fixture':row.get('fixture',not('journey' in group or 'cold' in group)),'conditions':conditions,'movie':str(movie.relative_to(R)) if movie else None,'native':str(n.relative_to(R)) if exists(n) else None,'stills':[str(p.relative_to(R)) for p in stills],'targetViewportHz':row.get('targetCaptureHz'),'actualViewportHz':rate,'simClockPerWallSecondInsideMovie':ratio,'audio':row.get('audioCapture',{}),'continuousArtisticReview':'Not performed by agent; source/frames and measured stream only','playerAcceptance':'Pending'})
for parent in sorted(list(M.glob('candidate15-*'))+list(M.glob(tag+'-*'))):
 if not parent.is_dir():continue
 if parent.name=='candidate17-streaming-recorder-pilot':
  rejected.append({'index':str((parent/'index-car.json').relative_to(R)),'reason':'Original pre-repair streaming pilot asserted car behavior but produced no usable native/audio stream; retained DOM/metadata are excluded from completed-coverage counts. Later actual long earned17 captures use repaired acknowledged streaming with matching original byte counts.'})
  continue
 for index in sorted(parent.glob('index*.json')):
  q=read(index);group=parent.name.removeprefix(tag+'-');ownerSource=q.get('sourceManifest') if isinstance(q,dict) else None
  if isinstance(q,dict) and isinstance(q.get('source'),dict):ownerSource=q['source'].get('runtime_manifest_sha256')
  rows=q if isinstance(q,list) else q.get('records',[q]) if isinstance(q,dict) else []
  for row in rows:
   add(row,index,parent,group,ownerSource)
   if isinstance(row,dict) and row.get('shots'):
    for step,shot in enumerate(row['shots']):
     add({'id':str(row.get('id'))+'-'+str(row.get('lang',''))+'-reading'+str(step),'still':shot['file'],'fixture':row.get('fixture',True),'method':str(q.get('method',''))+' Native rendered text: '+shot.get('text','')},index,parent,group+'-reading',ownerSource)
  if isinstance(q,dict):
   for action in q.get('actions',[]):
    if action.get('file'):add(action,index,parent,group+'-menus',q.get('sourceManifest'))
   if 'earned-boundary' in parent.name:
    for still in parent.glob('*.png'):
     add({'id':still.stem,'still':still.name,'fixture':False,'method':q['method']},index,parent,group,ownerSource)
# Matched before uses the preserved old source. It is deliberately not labelled as final.
parent=M/('interface-'+tag);index=D/('ui-checks-'+tag+'.json')
for still in sorted(parent.glob('*.png')):
 add({'id':still.stem,'still':still.name,'fixture':True,'sourceManifest':source['runtime_manifest_sha256'],'method':'Supplied populated TR/EN interface, actual rendered controls, largest-text/layout/AX checks. Linked telemetry keeps all variants; these images are frames, not earned discovery or human comprehension proof.'},index,parent,'interface',source['runtime_manifest_sha256'])
parent=M/'matched-before-source13';index=parent/'index-bosses.json'
for q in read(index,[]):add(q,index,parent,'matched-before-baseline',q.get('sourceManifest'))
paths=sorted({str(R/x[k]) for x in items for k in ['movie','native'] if x.get(k)})
def probe(path):
 p=Path(path);key=str(p.relative_to(R));signature=str(p.stat().st_size)+':'+str(p.stat().st_mtime_ns)
 if cache.get(key,{}).get('signature')==signature and cache[key].get('probeVersion')==2:return key,cache[key]
 args=['ffprobe','-v','error','-count_packets','-show_entries','stream=codec_type,codec_name,nb_read_packets,width,height,duration','-show_entries','format=duration,size','-of','json',path]
 try:
  r=subprocess.run(args,capture_output=True,text=True,timeout=45);q=json.loads(r.stdout or '{}');duration=float(q.get('format',{}).get('duration',0));v=next((s for s in q.get('streams',[]) if s['codec_type']=='video'),{});n=int(v.get('nb_read_packets',0));method='Original packet count/container wall duration.'
  if not duration and v:
   stamp=subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_packets','-show_entries','packet=pts_time','-of','csv=p=0',path],capture_output=True,text=True,timeout=45)
   times=[]
   for line in stamp.stdout.splitlines():
    try:times.append(float(line.split(',')[0]))
    except ValueError:pass
   if len(times)>1:duration=max(times)-min(times);n=len(times)-1;q['videoPacketRangeSeconds']=duration
   method='Streaming WebM has no declared duration; original video packet PTS range and count used.'
  q.update(exit=r.returncode,signature=signature,probeVersion=2,videoPacketsPerSecond=n/duration if duration else None,method=method+' No frame interpolation; not a fluidity or phone-performance verdict.');return key,q
 except Exception as e:return key,{'signature':signature,'error':str(e)}
with ThreadPoolExecutor(max_workers=2) as pool:
 for key,q in pool.map(probe,paths):cache[key]=q
(D/'media-probe-cache.json').write_text(json.dumps(cache,indent=2)+'\n')
for x in items:
 for k in ['movie','native']:
  if x.get(k):x[k+'Probe']=cache.get(x[k])
q={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'finalSource':source,'sourceApplicability':read(D/'candidate17-applicability.json'),'status':'Only completed indexed exports are listed; unfinished/failed jobs remain in retained telemetry and are not counted as accepted films.','rejectedCapturePilots':rejected,'methods':'Full DOM films use original screenshot request timestamps, typically target10Hz. Native VP8/Opus canvas streams request60Hz; actual packets/duration reported individually. Audio status says whether the original capture contained a decodable stream, never whether the agent listened. Under-load recordings are not device benchmarks. Supplied/bot/earned labels remain explicit.','items':items}
(D/'evidence-index.json').write_text(json.dumps(q,indent=2)+'\n')
styles='body{font:16px system-ui;background:#171923;color:#f8f0df;margin:24px}a{color:#a5dfff}header{max-width:1000px}input{padding:12px;width:min(800px,90%)}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:16px}.card{background:#282b39;border:1px solid #646778;padding:12px;border-radius:10px}.card img{width:100%;height:220px;object-fit:contain}.card video{width:100%;max-height:430px}.meta{color:#e9c46a;font-size:13px}small{display:block;margin:8px 0;color:#d5d5dd}button{margin:4px;padding:8px}'
lines=['<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>First30 reset evidence</title><style>'+styles+'</style>', '<header><h1>First30 reset · evidence</h1><p>Final source '+source['runtime_manifest_sha256']+'. Completed files only. Fixtures, automated earned journeys and real player acceptance are different evidence. No continuous motion/audio or physical-phone approval is implied.</p><p>DOM films target10Hz; original canvas files request60Hz with measured packet cadence below. Original audio status is reported. Under-load capture is not a performance benchmark.</p><p><a href="../../../FIRST30-EXPERIENCE-RESET-IMPLEMENTATION-2026-11-19.md">Implementation and limitations</a> · <a href="../../../telemetry/first30-reset/evidence-index.json">Exact JSON index</a></p><input id="filter" placeholder="Filter boss, weapon, rank, level, scene or group" aria-label="Filter evidence"></header><p>'+str(len(items))+' completed indexed records</p><main class="grid">']
for x in items:
 esc=html.escape;links=[]
 def url(p):return os.path.relpath(R/p,M)
 content='<h2>'+esc(x['id'])+'</h2><p class="meta">'+esc(x['group'])+' · '+('SUPPLIED FIXTURE' if x['fixture'] else 'AUTOMATED ORDINARY/ EARNED — NOT HUMAN')+'</p>'
 if x['movie']:content+='<video controls preload="none" src="'+esc(url(x['movie']),quote=True)+'"></video>'
 elif x['stills']:content+='<img loading="lazy" alt="'+esc(x['id'],quote=True)+' sample" src="'+esc(url(x['stills'][0]),quote=True)+'">'
 for k,label in [('movie','DOM film'),('native','Original canvas/audio'),('index','Full conditions/telemetry')]:
  if x.get(k):links.append('<a href="'+esc(url(x[k]),quote=True)+'">'+label+'</a>')
 content+='<p>'+' · '.join(links)+'</p><small>Source '+esc(str(x['sourceManifest'])[:16])+'…; viewport '+str(round(x['actualViewportHz'],2) if x['actualViewportHz'] else 'not a film')+'Hz; canvas packets/s '+str(round(x.get('nativeProbe',{}).get('videoPacketsPerSecond') or 0,2))+'</small><small>'+esc(x['audio'].get('status','See original record; no listening claim'))+'</small><details><summary>Conditions and limits</summary><p>'+esc(x['conditions'])+'</p><p>Agent continuous artistic/audio verdict and uncoached player acceptance: pending.</p></details>'
 lines.append('<article class="card" data-search="'+esc(x['id']+' '+x['group'],quote=True)+'">'+content+'</article>')
lines+=['</main><script>document.getElementById("filter").addEventListener("input",function(){var q=this.value.toLowerCase();document.querySelectorAll(".card").forEach(function(el){el.hidden=el.dataset.search.toLowerCase().indexOf(q)<0;});});</script></html>']
(M/'index.html').write_text('\n'.join(lines)+'\n');print('Indexed',len(items),'records and',len(paths),'media streams')
