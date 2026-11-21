"""Retain all declared attempts and unused/late transformations; no selected-success frequency claims."""
from pathlib import Path
from collections import Counter,defaultdict
import json,statistics,datetime
R=Path(__file__).resolve().parents[2];D=R/'reviews/telemetry/first30-reset'
def read(p,default=None):
 try:return json.loads(Path(p).read_text())
 except (OSError,ValueError):return default
def jl(p):
 if not p.exists():return []
 rows=[]
 for line in p.read_text().splitlines():
  try:rows.append(json.loads(line))
  except ValueError:pass
 return rows
policies=list(read(D/'balance-predeclared.json')['approaches']);seeds=[42,149,20261119];boss_levels=[1,2,3,4,5,10,15,20,25,30]
evos=['cleaver','nailstorm','cluster','carbomb','cyclone','arcchain','blacksmith','lake','fireball','finale','stormshield','netspear','foamstorm','twinsaw','forge','hookpull','minibus','grinder']
def campaigns(phase):
 out=[]
 for policy in policies:
  for seed in seeds:
   file=D/(phase+'-'+policy+'-'+str(seed)+'.jsonl');rows=[r for r in jl(file) if r.get('kind')=='earnedCampaign'];wins=[r for r in rows if r['result']=='win'];loss=[r for r in rows if r['result']!='win'];cards=Counter(c.get('item','?') for r in rows for c in r.get('experienceTrace',{}).get('cards',[]));e=Counter(id for r in rows for id in r.get('evolutionUse',{}))
   out.append({'policy':policy,'seed':seed,'source':str(file.relative_to(R)),'attempts':len(rows),'wins':len(wins),'losses':len(loss),'clearedLevels':[r['level'] for r in wins],'lossesRetained':[{'level':r['level'],'attempt':r['attempt'],'seed':r['seed'],'time':r['time'],'cause':r.get('deathCause'),'damageBy':r.get('damageBy'),'hp':r.get('hp'),'weapons':r.get('weapons')} for r in loss],'actualCardItemCounts':dict(cards),'evolutionRuns':dict(e),'rows':rows})
 return out
baseline=campaigns('baseline-v2');current=campaigns('candidate15-v2');allrows=[r for c in current for r in c['rows']];allbase=[r for c in baseline for r in c['rows']]
frequency=[]
for id in evos:
 acqs=[]
 for c in current:
  for r in c['rows']:
   u=r.get('evolutionUse',{}).get(id)
   if not u:continue
   meaningful=(u.get('hits',0)>=3 and u.get('first_encounter_s') is not None and r['time']-u.get('acquired_s',r['time'])>=8 and any(k!='cleanup' and v>0 for k,v in u.get('encounters',{}).items()))
   acqs.append({'policy':c['policy'],'campaignSeed':c['seed'],'level':r['level'],'attempt':r['attempt'],'result':r['result'],'acquired':u.get('acquired_s'),'firstMeaningfulEffect':u.get('first_encounter_s'),'remainingAfterAcquisition':r['time']-u.get('acquired_s',r['time']),'hits':u.get('hits',0),'damage':u.get('damage',0),'control':u.get('control',{}),'encounters':u.get('encounters',{}),'usefulByDeclaredDiagnostic':meaningful})
 targeted=[r for r in jl(D/'candidate15-evolution-search.jsonl') if r.get('target')==id];success=[r for r in targeted if r.get('usefulRemainingEngagement')]
 frequency.append({'id':id,'campaignAttemptsDenominator':len(allrows),'acquisitions':len(acqs),'useful':sum(a['usefulByDeclaredDiagnostic'] for a in acqs),'lateOrUnused':sum(not a['usefulByDeclaredDiagnostic'] for a in acqs),'outcomes':acqs,'targetedAttempts':len(targeted),'targetedSuccess':len(success),'targetedLatest':[{'level':r['level'],'seed':r['seed'],'attempt':r['attempt'],'result':r['result'],'useful':r['usefulRemainingEngagement'],'use':r.get('evolutionUse',{}).get(id)} for r in targeted[-2:]]})
supplement=[]
for file in sorted(D.glob('candidate15-*.jsonl')):
 if not any(term in file.name for term in ['grinder-selected','carbomb-revisit','hook-history-','l1-owned-plan','l1-cleaver-search']):continue
 attempts=jl(file)
 supplement.append({'file':str(file.relative_to(R)),'method':'Selected diagnostic policy/history/seed; failures retained. Not added to natural campaign frequency. L1 owned-plan invokes the real public plan choice only; car revisit is actual bounded navigation, not a supplied vehicle or contact.','attempts':len(attempts),'useful':sum(bool(a.get('usefulRemainingEngagement')) for a in attempts),'outcomes':[{'level':a['level'],'seed':a['seed'],'result':a['result'],'target':a['target'],'useful':a.get('usefulRemainingEngagement'),'time':a['time'],'use':a.get('evolutionUse',{}).get(a['target']),'planActions':a.get('experienceTrace',{}).get('planActions',[])} for a in attempts]})
phases=[]
for q in read(D/'candidate15-boss-power-results.json',{}).get('cases',[]):
 r=next((r for r in jl(D/q['file']) if r.get('kind')=='observedCaseReplay'),{});b=r.get('bossRecord') or {};acts=Counter(a.get('act','?') for a in b.get('attacks',[]));entry=b.get('entry',{})
 phases.append({**q,'result':r.get('result'),'entryReached':bool(b),'actualEntryHP':entry.get('hero',{}).get('hp'),'actualMaxHP':entry.get('hero',{}).get('maxHp'),'entryHPFraction':b.get('hpAtEntry'),'actualEntry':entry,'fightSeconds':b.get('fightSeconds'),'attackFamilies':dict(acts),'phases':b.get('phases'),'openings':len(b.get('openings',[])),'wholeRouteTime':r.get('time'),'damageBy':r.get('damageBy'),'deathCause':r.get('deathCause')})
levels=[]
for level in range(1,31):
 rows=[r for r in allrows if r['level']==level];valid=[r['time'] for r in rows];levels.append({'level':level,'attempts':len(rows),'wins':sum(r['result']=='win' for r in rows),'timeMin':min(valid) if valid else None,'timeMedian':statistics.median(valid) if valid else None,'timeMax':max(valid) if valid else None,'averageMove':statistics.mean(r['experienceTrace']['move'] for r in rows) if rows else None,'averageWait':statistics.mean(r['experienceTrace']['wait'] for r in rows) if rows else None,'averageCombat':statistics.mean(r['experienceTrace']['combat'] for r in rows) if rows else None,'averageQuiet':statistics.mean(r['experienceTrace']['quiet'] for r in rows) if rows else None,'label':'Headless actual sim approach; includes no human reading/menu time. Quiet travel is not necessarily empty atmosphere.'})
roles=[]
for role in ['walker','diner','runner','crawler','brute','hardhat','spitter','screamer','bloater','parkur','copci','cayci','kurye','marti']:
 seen=[]
 for c in current:
  for r in c['rows']:
   info=r.get('experienceTrace',{}).get('roles',{}).get(role)
   if info:seen.append({'policy':c['policy'],'campaignSeed':c['seed'],'level':r['level'],'attempt':r['attempt'],**info})
 seen.sort(key=lambda r:(r['level'],r['first']));roles.append({'role':role,'naturalObservations':len(seen),'earliest':seen[0] if seen else None,'firstEachCampaign':[next((r for r in seen if r['policy']==p and r['campaignSeed']==s),None) for p in policies for s in seeds]})
(D/'final-roster-introductions.json').write_text(json.dumps({'source':'candidate15 actual sealed final simulation','method':'Actual enemies observed by the declared headless earned-campaign observer, not supplied role fixtures. First time is run seconds in that specific level, not campaign elapsed. Bots do not establish fair/player-recognized introduction.','roles':roles},indent=2)+'\n')
for c in baseline+current:c.pop('rows')
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baselineSource':read(D/'baseline.json'),'candidateSource':read(D/'candidate17.json'),'numericRunsSource':read(D/'candidate15.json'),'sourceApplicability':read(D/'candidate17-applicability.json'),'applicability':'Exact candidate15 numerical runs apply to candidate17: every config/sim byte is identical. Runtime17 route-art/offscreen-text changes and earned rendered journey are separately identified. Historical source13 comparisons retained separately','method':'All declared v2 policies/seeds/attempts, original losses retained; no ads/payment/revive. V1 defensive failure and v2 amendment remain separately documented. Numerical automation is not player fairness, enjoyment, readable signature or retention.','baseline':baseline,'current':current,'summary':{'baselineAttempts':len(allbase),'baselineWins':sum(r['result']=='win' for r in allbase),'currentAttempts':len(allrows),'currentWins':sum(r['result']=='win' for r in allrows),'currentLosses':sum(r['result']!='win' for r in allrows),'currentCampaignsComplete30':sum(len(c['clearedLevels'])==30 for c in current)},'bossReplays':phases,'evolutions':frequency,'levelPacing':levels}
result['selectedSupplementalSearches']=supplement
(D/'balance-final-analysis.json').write_text(json.dumps(result,indent=2)+'\n')
print(result['summary']);print('Boss cases',len(phases),'role rows',len(roles),'targeted search lines',sum(x['targetedAttempts'] for x in frequency))
