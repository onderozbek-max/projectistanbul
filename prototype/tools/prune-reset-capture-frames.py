"""Remove only redundant successful-frame JPEGs after verified playable exports; retain timing/audio and failures."""
from pathlib import Path
import json,subprocess,re,datetime,sys
root=Path(__file__).resolve().parents[2];media=root/'reviews/media/R1/first30-reset';seen=set();rows=[]
def scan(x,folder):
 if isinstance(x,dict):
  native_info=x.get('nativeCanvas')
  # Earned per-level rows name their sibling movie by id; compact index rows
  # contain file but no capture metadata. Only accept the exact safe walk id.
  walk_id=x.get('id','');walk_id=walk_id if isinstance(walk_id,str) else ''
  film_name=x.get('file') or (walk_id+'.mp4' if re.fullmatch(r'L\d{2}-attempt\d+',walk_id) else None)
  menu_only='nativeCanvas' in x and native_info is None and x.get('captureMethod') and film_name
  if x.get('temporaryFrames') and not x.get('error') and (native_info or menu_only):
   d=Path(x['temporaryFrames']).resolve();native=Path(native_info['file']) if native_info else None
   movie=Path(str(native).replace('.canvas.webm','.mp4')) if native else folder/film_name
   if not movie.is_absolute():movie=root/movie
   if native and not native.is_absolute():native=root/native
   if d not in seen and d.name.startswith('istanbul-viewport-') and d.parent==Path('/private/var/folders/cy/m9q20js10t9bvtd05b9lk35w0000gp/T') and movie.is_file() and (native is None or native.is_file()):
    candidates=[p for p in d.glob('frame-*.jpg') if re.fullmatch(r'frame-\d+\.jpg',p.name) and not p.is_symlink()]
    if not candidates:return
    seen.add(d);q=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(movie)],capture_output=True,text=True)
    if q.returncode==0 and float(q.stdout or 0)>0:
     files=candidates;size=sum(p.stat().st_size for p in files)
     for p in files:p.unlink()
     if files:rows.append({'directory':str(d),'movie':str(movie.relative_to(root)),'originalNative':str(native.relative_to(root)) if native else None,'removedJPEGs':len(files),'bytes':size,'retained':['frames.txt exact VFR timing','original audio.webm','valid original-time DOM MP4; original native when actually requested','all metadata and failed-capture raw frames']})
  if x.get('temporaryFrames') and (native_info or menu_only):return
  for v in x.values():scan(v,folder)
 elif isinstance(x,list):
  for v in x:scan(v,folder)
roots=[p for p in media.iterdir() if p.is_dir() and any(p.name.startswith(tag) for tag in sys.argv[1:])] if len(sys.argv)>1 else [media]
for p in (file for directory in roots for file in directory.rglob('*.json')):
 if '.error.' in p.name:continue
 try:scan(json.loads(p.read_text()),p.parent)
 except (ValueError,OSError):pass
out=root/'reviews/telemetry/first30-reset'/('successful-frame-prune-'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')+'.json')
out.write_text(json.dumps({'scope':'Only this task successful indexed exports; original failed evidence and original audio/timing remain','rows':rows,'bytes':sum(r['bytes'] for r in rows)},indent=2)+'\n');print('Redundant successful JPEG bytes freed',sum(r['bytes'] for r in rows),'across',len(rows),'exports')
