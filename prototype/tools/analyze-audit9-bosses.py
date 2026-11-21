"""Separate approach attrition, actual boss contact and observed recovery samples."""
from pathlib import Path
import json,copy

ROOT=Path(__file__).resolve().parents[2];DATA=ROOT/'reviews/telemetry/audit9-implementation'
def rows(name):return [json.loads(r) for r in (DATA/(name+'.jsonl')).read_text().splitlines() if r]
cases=[];comparisons=[]
for controlled in [False,True]:
 for policy in ['evasive','punish']:
  prefix='integrated12-'+('controlled-' if controlled else '')+'boss-'
  old=rows(prefix+policy);new=rows(prefix+'positions-'+policy)
  assert len(old)==len(new)==30
  for original,row in zip(old,new):
   cleaned=copy.deepcopy(row)
   cleaned['bossRecord']['entry'].pop('hero');cleaned['bossRecord']['entry'].pop('boss')
   assert cleaned==original,(row['level'],row['band'],policy,'Observer changed simulation result')
   b=row['bossRecord'];recoveries=[]
   for sample in b['openings']:
    if sample['remaining']<=0:continue
    if not recoveries or sample['t']-recoveries[-1]['lastSample']>.65:
     recoveries.append({'firstSample':sample['t'],'lastSample':sample['t'],
      'nearestEdgeDistance':sample['distance'],'maxRemaining':sample['remaining'],'samples':0})
    window=recoveries[-1];window['lastSample']=sample['t'];window['samples']+=1
    window['nearestEdgeDistance']=min(window['nearestEdgeDistance'],sample['distance'])
    window['maxRemaining']=max(window['maxRemaining'],sample['remaining'])
   damage=row.get('damageBy') or {};arena=row.get('arenaDamage') or {}
   approach={k:round(v-arena.get(k,0),6) for k,v in damage.items() if v-arena.get(k,0)>.000001}
   duration=b.get('fightSeconds',row['time']-b['start'])
   result={'level':row['level'],'band':row['band'],'policy':policy,'suppliedFullHP':controlled,
    'file':prefix+'positions-'+policy+'.jsonl','result':row['result'],'deathCause':row.get('deathCause'),
    'entry':b['entry'],'entryHPFraction':b['hpAtEntry'],'bossMaxHP':b['maxHp'],
    'observedFightSeconds':duration,'bossKilled':b.get('deathAt') is not None,
    'attackFamilies':sorted(set(r['act'] for r in b['attacks'])),
    'approachDamageBy':approach,'arenaDamageBy':arena,'observedPositiveRecoveryIntervals':recoveries}
   cases.append(result)
  comparisons.append({'file':prefix+'positions-'+policy+'.jsonl','cases':len(new),'simulationMatchesPreviousRows':True})
out={'runtime':json.loads((DATA/'integrated12.json').read_text())['runtime_manifest_sha256'],
 'method':'Actual initial positions/power at boss spawn. Failed fights end at hero death; successful fights end at boss death. Recovery intervals cluster positive-time samples separated by at most0.65s, not a count of every opportunity or player punish. Approach damage is total minus actual arena damage by source.',
 'limitations':['Supplied HP controls are not earned full-route wins.','Observed proximity/recovery is not perceived intensity, first-time learning or enjoyment.','No weapon reach/damage inference is made from edge distance alone.'],
 'observerEquivalence':comparisons,'cases':cases}
(DATA/'final12-boss-analysis.json').write_text(json.dumps(out,indent=2)+'\n')
print('120 position-aware cases match previous results exactly; failures and approach damage retained.')
