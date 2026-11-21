"""Direct frame review of final role silhouettes and changed route art, not motion acceptance."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,subprocess
R=Path(__file__).resolve().parents[2];M=R/'reviews/media/R1/first30-reset'
out=M/'candidate17-frame-review';out.mkdir(exist_ok=True);records=[]
def sample(row,folder,t):
 p=out/(row['id']+'-'+str(t)+'.png')
 subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(folder/row['file']),'-frames:v','1',str(p)],check=True)
 records.append({'id':row['id'],'source':row['sourceManifest'],'original':str((folder/row['file']).relative_to(R)),'second':t,'sample':str(p.relative_to(R))})
 return Image.open(p).convert('RGB')
folder=M/'candidate17-roles';roles=json.loads((folder/'index-roles.json').read_text())
for group in range(2):
 sheet=Image.new('RGB',(1365,1350),'#171923');d=ImageDraw.Draw(sheet)
 for col,row in enumerate(roles[group*7:group*7+7]):
  for j,t in enumerate([.6,2,4.5]):
   im=sample(row,folder,t).resize((195,422));sheet.paste(im,(col*195,j*450+25));d.text((col*195+3,j*450+5),row['id']+' '+str(t)+'s',fill='white')
 sheet.save(out/('roles-'+str(group+1)+'.png'))
folder=M/'candidate17-worlds';worlds=json.loads((folder/'index-world.json').read_text())
sheet=Image.new('RGB',(1950,1310),'#171923');d=ImageDraw.Draw(sheet)
for col,level in enumerate([1,18,19,23,25]):
 row=next(r for r in worlds if r['id']=='world-L'+str(level));assert row['outcome']['opened']
 for j,t in enumerate([.4,max(.5,row['seconds']-1.25)]):
  im=sample(row,folder,t).crop((0,130,390,760));sheet.paste(im,(col*390,j*655+25));d.text((col*390+5,j*655+5),row['id']+' '+str(round(t,2))+'s',fill='white')
sheet.save(out/'changed-worlds.png')
(out/'index.json').write_text(json.dumps({'method':'Direct unretimed original film samples, role full viewport shown at half display size, changed-world arena crop0,130,390,760. Role early/mid frames precede the original seven-second lethal probe. These are supplied fixtures, not fair-introduction or continuous-motion/player proof.','records':records},indent=2)+'\n')
print('Final17 roles and changed-world frame sheets exported')
