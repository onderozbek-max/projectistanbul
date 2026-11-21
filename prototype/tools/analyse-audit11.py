"""Retain every declared result, late/missed evolution and in-fight loss; no bot-fun inference."""
from pathlib import Path
import json,collections,statistics,datetime
root=Path(__file__).resolve().parents[2];D=root/'reviews/telemetry/audit11-implementation';old=root/'reviews/telemetry/first30-reset'
def jl(p):
 if not p.exists():return []
 return [json.loads(l) for l in p.read_text().splitlines() if l]
def summarize(tag):
 rows=[];origins=[]
 for p in sorted(old.glob(tag+'-*.jsonl')):
  for r in jl(p):
   if r.get('kind')=='earnedCampaign':rows.append({**r,'file':str(p.relative_to(root))})
 wins=[r for r in rows if r['result']=='win'];loss=[r for r in rows if r['result']!='win']
 pacing=[]
 for n in range(1,31):
  rs=[r for r in rows if r['level']==n];ts=[r['time'] for r in rs]
  pacing.append({'level':n,'wins':sum(r['result']=='win' for r in rs),'attempts':len(rs),'min':min(ts),'median':statistics.median(ts),'max':max(ts),'outliers':[{'file':r['file'],'seed':r['seed'],'result':r['result'],'time':r['time'],'terminal':r.get('terminal'),'stuck':r.get('stuck')} for r in rs if r['time']>300]})
 return{'tag':tag,'attempts':len(rows),'wins':len(wins),'outcomes':dict(collections.Counter(r['result'] for r in rows)),'complete30':sum(r['level']==30 for r in wins),'pacing':pacing,'losses':[{'file':r['file'],'level':r['level'],'attempt':r['attempt'],'seed':r['seed'],'result':r['result'],'time':r['time'],'cause':r.get('deathCause'),'bossOutcome':r.get('bossOutcome'),'entry':(r.get('bossRecord')or{}).get('entry'),'terminal':r.get('terminal')} for r in loss],'rows':rows}
def useful(r,u):
 # Same earlier diagnostic retained; actual boss/wave contribution is also reported, never replaced by a quota.
 return u.get('hits',0)>=3 and r['time']-u['acquired_s']>=8 and any(k!='cleanup' and v>0 for k,v in u.get('encounters',{}).items())
base=summarize('audit11-baseline-navigation2');final=summarize('audit11-final6')
boss=[]
for level in [1,2,3,4,5,10,15,20,25,30]:
 for band in ['injured-earned','typical-investment','strong-investment']:
  for move in ['punish','evasive']:
   pair={}
   for phase in ['baseline22','pilot4']:
    p=D/f'{phase}-boss-L{level}-{band}-{move}.jsonl';r=jl(p)[0];b=r.get('bossRecord') or {};entry=b.get('entry')
    outcome='boss-defeated' if b.get('deathAt') is not None else 'death-in-fight' if b and r['result']=='lose' else 'timeout-in-fight' if b else 'entry-not-reached'
    pair[phase]={'file':str(p.relative_to(root)),'result':r['result'],'outcome':outcome,'cause':r.get('deathCause'),'entry':entry,'fightSeconds':b.get('fightSeconds',r['time']-b['start'] if b else None),'actualHP':entry and entry['hero']['hp'],'families':dict(collections.Counter(a['act'] for a in b.get('attacks',[]))),'openings':len(b.get('openings',[]))}
   boss.append({'level':level,'band':band,'movement':move,**pair})
evos=[]
for r in final['rows']:
 for id,u in r.get('evolutionUse',{}).items():evos.append({'file':r['file'],'level':r['level'],'seed':r['seed'],'attempt':r['attempt'],'result':r['result'],'id':id,'use':u,'remaining':r['time']-u['acquired_s'],'usefulOldDiagnostic':useful(r,u),'actualBossContribution':u.get('encounters',{}).get('boss',0),'actualWaveContribution':u.get('encounters',{}).get('wave',0)})
early=[]
for p in sorted(D.glob('final7-L1-*.jsonl')):
 for r in jl(p):
  if r.get('kind')=='earnedCampaign':early.append({'file':str(p.relative_to(root)),'seed':r['seed'],'attempt':r['attempt'],'result':r['result'],'time':r['time'],'investments':r['experienceTrace']['cards'],'weapons':r['weapons'],'evolutions':[{'id':id,'use':u,'remaining':r['time']-u['acquired_s'],'usefulOldDiagnostic':useful(r,u)} for id,u in r.get('evolutionUse',{}).items()]})
search=jl(D/'final7-evolution-search.jsonl')
# Raw rows remain separate rather than burying failures in a single average.
for x in [base,final]:x.pop('rows')
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseline':base,'final':final,'bosses':boss,'naturalEvolutions':evos,'earlyPayoff':early,'selectedEvolutionSearch':search,'interpretation':'All are automated earned or disclosed earned-history counterfactual diagnostics. Not human fairness, fun, audio, fluidity or retention. Every failed/late/unused outcome remains. Source6 simulation and source4 boss simulation equal final7 by the exact applicability manifest.'}
(D/'balance-analysis.json').write_text(json.dumps(out,indent=2)+'\n');print('Campaigns',base['attempts'],base['outcomes'],'vs',final['attempts'],final['outcomes'],'boss comparisons',len(boss),'natural evolutions',len(evos),'early cases',len(early),'selected attempts',len(search))
