"""Packet-time cadence, not fluid-motion or physical-phone acceptance."""
from pathlib import Path
import json,subprocess,statistics
R=Path(__file__).resolve().parents[2];D=R/'reviews/telemetry/audit11-implementation';M=R/'reviews/media/R1/audit11-implementation';rows=[]
files=[M/'final7-bosses/boss-L25.canvas.webm',M/'final8-stress-default-repair/boss-L1.canvas.webm',M/'final8-stress-reduced-repair/boss-L30.canvas.webm',M/'candidate6-earned-journey/L20-attempt0.canvas.webm']
for file in files:
 if not file.exists():continue
 p=subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','packet=pts_time','-of','json',str(file)],capture_output=True,text=True,check=True)
 stamps=sorted(float(q['pts_time']) for q in json.loads(p.stdout)['packets'] if 'pts_time' in q);gaps=[(b-a)*1000 for a,b in zip(stamps,stamps[1:])];gaps.sort()
 if not gaps:continue
 rows.append({'file':str(file.relative_to(R)),'frames':len(stamps),'spanSeconds':stamps[-1]-stamps[0],'meanHz':(len(stamps)-1)/(stamps[-1]-stamps[0]),'p50PacketGapMs':statistics.median(gaps),'p95PacketGapMs':gaps[int((len(gaps)-1)*.95)],'maxPacketGapMs':max(gaps),'interpretation':'Original video packet timestamps under capture load. Not display-frame timing, phone budgets or observed fluidity.'})
(D/'native-cadence.json').write_text(json.dumps({'method':'ffprobe original video packet PTS; no re-encoding/interpolation. Requested60Hz is not a measured60fps guarantee. Headless capture load and scene/menu canvas suspension affect gaps.','rows':rows},indent=2)+'\n');print('Measured',len(rows),'original native streams')
