"""Close the reconciliation ledger against actual artifacts, without granting artistic approval."""
from pathlib import Path
import datetime,json,os
ROOT=Path(__file__).resolve().parents[2];REV=ROOT/'reviews';DATA=REV/'telemetry/audit9-implementation'
MEDIA=REV/'media/R1/audit9-implementation'
def read(p):return json.loads(p.read_text())
initial=read(DATA/'coverage-initial.json');build=read(DATA/'integrated13.json')
walk=read(MEDIA/'walkthrough-final12/index.json');clears={r['level']:r for r in walk['records'] if r['outcome']=='won'}
tests=read(DATA/'final-tests.json');validation=read(DATA/'final-media-validation.json')
runtime=read(DATA/'final-runtime-verification.json');ui=read(DATA/'ui-checks-integrated12.json')
scene=read(DATA/'final12-scene-summary.json')
assert tests['full']['count']==54 and tests['full']['exit']==0
assert tests['runtime']==build['runtime_manifest_sha256'],'Final suite must apply to the final repair'
assert tests['affectedFinalization']['exit']==0 and not runtime['failures']
assert not validation['failures'] and scene['cases']==6 and scene['errors']==0
assert len(ui['records'])==36
evidence={
 'P9-01':['telemetry/audit9-implementation/ui-checks-integrated12.json','media/R1/audit9-implementation/ui-comparison/index.json'],
 'P9-02':['telemetry/audit9-implementation/ui-checks-integrated12.json','media/R1/audit9-implementation/walkthrough-final12/index.json'],
 'P9-03':['AUDIT9-ROSTER-AND-SCENES-2026-11-19.md','media/R1/audit9-implementation/integrated12-bosses/index-bosses.json','media/R1/audit9-implementation/review-final12-actions/manifest.json','telemetry/audit9-implementation/final12-boss-analysis.json'],
 'P9-04':['media/R1/audit9-implementation/scenes-final12/index.json','telemetry/audit9-implementation/final12-rendered-journey.json'],
 'P9-05':['AUDIT9-PACING-AND-BALANCE-2026-11-19.md','media/R1/audit9-implementation/world-comparison.json','telemetry/audit9-implementation/final12-rendered-journey.json'],
 'P9-06':['media/R1/audit9-implementation/integrated12-dense/index-dense.json','media/R1/audit9-implementation/integrated12-accessible-dense/index-dense.json','media/R1/audit9-implementation/integrated12-health/index-health.json','media/R1/audit9-implementation/integrated12-accessible-health/index-health.json'],
 'P9-07':['telemetry/audit9-implementation/integrated12-earned-focused-evolutions.jsonl','telemetry/audit9-implementation/integrated12-nailstorm-encounter.jsonl','telemetry/audit9-implementation/integrated12-carbomb-known.jsonl','telemetry/audit9-implementation/ui-checks-integrated12.json'],
 'P9-08':['media/R1/audit9-implementation/integrated12-arsenal/index-arsenal.json','media/R1/audit9-implementation/integrated12-car/index-car.json','media/R1/audit9-implementation/review-final12-actions/manifest.json'],
 'P9-09':['telemetry/audit9-implementation/ui-checks-integrated12.json','media/R1/audit9-implementation/integrated12-cold/index-cold.json','media/R1/audit9-implementation/history-final12/index.json','media/R1/audit9-implementation/walkthrough-final12/index.json'],
 'P9-10':['AUDIT9-SOURCE-AND-EVIDENCE-2026-11-19.md','telemetry/audit9-implementation/final-tests.json','telemetry/audit9-implementation/final-diagnostic-summary.json','telemetry/audit9-implementation/final12-rendered-journey.json','AUDIT9-EXTERNAL-ACCEPTANCE-2026-11-19.md']}
aliases={'E01':['P9-08'],'E02':['P9-05','P9-06'],'E03':['P9-06'],'E04':['P9-05','P9-06'],
 'E05':['P9-03'],'E06':['P9-06'],'E07':['P9-05','P9-07'],'E08':['P9-10'],
 'E09':['P9-08'],'E10':['P9-04','P9-09'],'E11':['P9-04','P9-06'],'E12':['P9-10'],
 'E13':['P9-01','P9-02','P9-09'],'E14':['P9-10'],
 'P8-01':['P9-09'],'P8-02':['P9-02'],'P8-03':['P9-04'],'P8-04':['P9-08'],
 'P8-05':['P9-08'],'P8-06':['P9-03'],'P8-07':['P9-05','P9-07'],
 'P8-08':['P9-05','P9-06'],'P8-09':['P9-05'],'P8-10':['P9-07'],
 'P8-11':['P9-09'],'P8-12':['P9-09'],'P8-13':['P9-06'],'P8-14':['P9-10'],'P8-15':['P9-06']}
for key,refs in aliases.items():evidence[key]=list(dict.fromkeys(p for r in refs for p in evidence[r]))
evidence['E06'].append('media/R1/audit9-implementation/integrated12-roles/index-roles.json')
evidence['P8-15']=evidence['E06'][:]
evidence['E12']+= ['telemetry/audit9-implementation/final12-full-test-logs/proto_test_music.log','telemetry/audit9-implementation/final-media-validation.json','media/R1/audit9-implementation/media-index.json']
for key in ['E09','P8-05','P8-10','P9-08']:
 evidence[key].append('media/R1/audit9-implementation/integrated12-nazar/index-trigger.json')
for key in ['E13','P9-09','P9-10','P8-11']:
 evidence[key]+=['telemetry/audit9-implementation/boundary-repair-applicability.json','telemetry/audit9-implementation/final13-result-boundary-checks.json','media/R1/audit9-implementation/ending-final13-earned/index.json']
for key in ['P8-09','P9-05']:
 evidence[key]+= ['telemetry/audit9-implementation/integrated12-intentional-street-chain.jsonl','media/R1/audit9-implementation/conditional-earned23/index.json']
rows=[]
for row in initial['requirements']:
 r=dict(row);key=r['id'];r['evidence']=evidence[key]
 assert all((REV/p).exists() for p in r['evidence']),(key,'missing linked artifact')
 r['status']='Independent implementation and accessible technical verification complete; external acceptance pending'
 if len(clears)<30:r['status']='Implementation present; final earned rendered journey still running'
 r['implementedOrRetained']=True;r['desktopTechnicalVerified']=True;r['frameSampled']=True
 r['humanDeviceListeningVerified']=False
 r['pendingGates']=['Physical iPhone one-thumb/interruption/sustained performance',
    'Normal-speed continuous artistic observation and actual listening',
    '5–8 consenting unfamiliar players, including an uncoached earned first30 run']
 r['scopeNote']='Original before-edit treatment and prior finding retained. Current result and exact limits are in AUDIT9-IMPLEMENTATION, not inferred from this boolean.'
 rows.append(r)
assert len(rows)==39
arsenal=read(MEDIA/'integrated12-arsenal/index-arsenal.json')
bosses=read(MEDIA/'integrated12-bosses/index-bosses.json');world=read(MEDIA/'integrated12-world/index-world.json')
levels=[]
for n in range(1,31):
 w=next(r for r in world if r['id']=='world-L'+str(n));won=clears.get(n)
 levels.append({'level':n,'decisionAndDeviation':'AUDIT9-PACING-AND-BALANCE-2026-11-19.md',
    'suppliedBeforeAfter':'media/R1/audit9-implementation/world-comparison.html#L'+str(n),
    'actualWorldSource':w['sourceManifest'],'earnedFilm':'media/R1/audit9-implementation/walkthrough-final12/'+won['file'] if won else None,
    'attempts':len([r for r in walk['records'] if r['level']==n]),
    'firstEncounterHumanLearning':'pending; assisted input is not human evidence'})
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'runtime':build['runtime_manifest_sha256'],
 'requirements':rows,'levels':levels,'bosses':[{'id':r['id'],'index':'media/R1/audit9-implementation/integrated12-bosses/index-bosses.json','runtime':r['sourceManifest']} for r in bosses],
 'arsenal':[{'id':r['id'],'index':'media/R1/audit9-implementation/integrated12-arsenal/index-arsenal.json','runtime':r['sourceManifest']} for r in arsenal],
 'majorScenes':['L1 TR/EN fresh native diner/knife/street','L20 recognition/shared departure','L25 tool settle/grief/departure','L30 points/service intention/result/boundary'],
 'menus':'Actual earned results/give-up/retry, attribute/perk/gear spending, equipped active/ultimate alternatives, next mastery, collected Memory/Back/map; early1–12 actions/stills and later growth films. Fresh source12 all30 remains labelled; source13 only fixes the winning30 result boundary, with actual earned ending replay/return and native/viewport checks.',
 'sourceApplicability':read(DATA/'boundary-repair-applicability.json'),
 'allScopeReconciled':True,'independentWorkComplete':len(clears)==30,
 'independentChecks':{'fullTestGroups':54,'fullSuiteExit':0,'affectedTestGroups':len(tests['affectedFinalization']['groups']),'affectedExit':0,
    'positiveMediaFilesTechnicallyValidated':validation['files'],'mediaFailures':0,
    'sourceFilesVerified':runtime['files'],'sourceMismatches':0,'majorSceneCases':6,
    'actualDesktopBackgroundSceneCases':scene['actualDesktopBackgroundCases']},
 'externalAcceptanceComplete':False,'masterpieceOrExpansionApproval':False,
 'retainedDeferred':['N1 alternative starters','N2 new environmental boss counter','N3 curated replays','Production beyondL30']}
(DATA/'coverage-final.json').write_text(json.dumps(out,indent=2)+'\n')
print('Reconciled39 requirements,30 level rows,',len(bosses),'bosses,',len(arsenal),'rank/evolution cases;',len(clears),'earned clears')
if os.environ.get('AUDIT9_REQUIRE_COMPLETE'):
 assert len(clears)==30
 media_index=read(MEDIA/'media-index.json')
 assert {r['file'] for r in media_index['entries']}=={r['file'] for r in validation['records']},'Stale media validation'
 assert {r['file'] for r in validation['records']} >= {'walkthrough-final12/'+r['file'] for r in walk['records']},'Unvalidated earned attempt'
