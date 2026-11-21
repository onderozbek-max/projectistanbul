"""Original-speed, full-viewport comparison; titles never cover gameplay."""
import json, subprocess, textwrap
from pathlib import Path
R=Path(__file__).resolve().parents[2]
M=R/'reviews/media/R1/audit8-implementation';work=M/'reel-work';work.mkdir(exist_ok=True)
font='/System/Library/Fonts/Supplemental/Arial.ttf'
def game_time(file,t):
 r=json.loads((M/file).with_suffix('.json').read_text());samples=r['facts']['samples']
 s=min(samples,key=lambda s:abs(s['t']-t))
 return max(0,(s['wall']-r['viewportStart']) if 'wall' in s else samples.index(s)*.35)
cases=[
 ('Health: injury, food, block','before-final/health-critical-heal-full.mp4','release-accessible/health-critical-heal-full.mp4',0,0,8,'Fixture: supplied HP/food; AFTER muted/reduced'),
 ('A cart changes a real fight','before-earned/earned-L3-en.mp4','final-earned-street/earned-L3-en.mp4',game_time('before-earned/earned-L3-en.mp4',23.3),game_time('final-earned-street/earned-L3-en.mp4',24.5),8,'Earned replay; same permanent save, different real choices'),
 ('Cook: body, cleaver, recovery','before-final/boss-L1.mp4','final/boss-L1.mp4',2,2,6,'Fixture: opaque invulnerable observer; real AI'),
 ('Captain: anchor load and reset','before-final/boss-L25.mp4','final/boss-L25.mp4',2,2,6,'Fixture: opaque invulnerable observer; real AI'),
 ('Knife: rank 1 contact','before-final/contact-knife-r1.mp4','final/contact-knife-r1.mp4',1,1,5,'Fixture: only Knife R1; supplied high-HP targets'),
 ('Chain: rank 5 links and source','before-final/contact-chain-r5.mp4','final/contact-chain-r5.mp4',1,1,5,'Fixture: only Chain R5; supplied high-HP targets'),
 ('Chainsaw: rank 1 grip and bite','before-final/contact-chainsaw-r1.mp4','final/contact-chainsaw-r1.mp4',0,0,6,'Fixture: only Chainsaw R1; supplied high-HP targets'),
 ('Farewell: world acting, then reading','before-final/boss-L25.mp4','final-supplemental/major-L25-en-accessible.mp4',13.4,0,9,'Fixture: scripted lethal hit; AFTER muted/reduced'),
 ('Useful evolution before the encounter','before-earned/earned-L3-en.mp4','final-earned/earned-L3-en.mp4',game_time('before-earned/earned-L3-en.mp4',77),game_time('final-earned/earned-L3-en.mp4',85),8,'Earned Cleaver; BEFORE acquired75.4s, AFTER83.4s; no timing guarantee'),
]
caption_rows=[]
for i,(title,before,after,bs,ast,duration,note) in enumerate(cases):
 for n,side in enumerate(['BEFORE','AFTER']):
  h='be2bee472a' if n==0 else '565e59688f' if after.startswith('release') else 'b997555a77'
  caption_rows.append({'file':str(work/f'caption-{i}-{n}.png'),'title':side+' · '+title+'\n'+note,'footer':h+' · desktop 390×844 · original speed'})
request=work/'captions.json';request.write_text(json.dumps(caption_rows))
subprocess.run(['node',str(R/'prototype/tools/draw-audit8-captions.cjs'),str(request)],check=True)
segments=[];index=[]
for i,(title,before,after,bs,ast,duration,note) in enumerate(cases):
 titlefiles=[]
 for side in ['BEFORE','AFTER']:
  p=work/f'title-{i}-{side}.txt';p.write_text(side+' · '+title+'\n'+'\n'.join(textwrap.wrap(note,49)));titlefiles.append(p)
 f=work/f'{i:02d}.mp4';segments.append(f)
 labels=['be2bee472a · seed42 / earned seed as indexed','565e59688f release or identical V1 component b997555a']
 filters=[]
 for n in range(2):
  foot=work/f'foot-{i}-{n}.txt';foot.write_text(labels[n])
  filters.append(f"[{n}:v]trim=duration={duration},setpts=PTS-STARTPTS,scale=390:844,fps=30,pad=390:980:0:80:color=0x15151e[g{n}];[g{n}][{n+2}:v]overlay=0:0:format=auto[v{n}]")
 filters+=['[v0][v1]hstack=inputs=2[v]',f'[1:a]atrim=duration={duration},asetpts=PTS-STARTPTS,afade=t=in:d=0.04,afade=t=out:st={duration-.08}:d=0.08[a]']
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(bs),'-i',str(M/before),'-ss',str(ast),'-i',str(M/after),'-loop','1','-i',str(work/f'caption-{i}-0.png'),'-loop','1','-i',str(work/f'caption-{i}-1.png'),'-filter_complex',';'.join(filters),'-map','[v]','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','24','-c:a','aac','-b:a','96k','-t',str(duration),str(f)],check=True)
 index.append({'title':title,'before':before,'after':after,'beforeStart':bs,'afterStart':ast,'seconds':duration,'note':note})
concat=work/'concat.txt';concat.write_text(''.join(f"file '{p}'\n" for p in segments))
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(concat),'-c','copy','-movflags','+faststart',str(M/'before-after.mp4')],check=True)
(M/'before-after-index.json').write_text(json.dumps({'framing':'390×844 per column, unchanged original playback speed; captions outside viewport. AFTER audio only; health/farewell muted/reduced. No phone/human/listener claim.','comparisons':index},indent=2))
print('Built',sum(c[5] for c in cases),'second honest before/after reel.')
