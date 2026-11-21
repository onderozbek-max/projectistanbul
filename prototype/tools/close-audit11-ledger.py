"""Evidence-stage ledger. Never collapse implementation, technical checks, sparse frames and human acceptance."""
from pathlib import Path
import json,datetime,re
R=Path(__file__).resolve().parents[2];D=R/'reviews/telemetry/audit11-implementation';M='reviews/media/R1/audit11-implementation';T='reviews/telemetry/audit11-implementation'
path=D/'coverage.json';x=json.loads(path.read_text());old=json.loads((R/'reviews/telemetry/first30-reset/coverage-final.json').read_text());oldrows={r['id']:r for r in old['rows']}
source=json.loads((R/'reviews/telemetry/first30-reset/audit11-candidate10.json').read_text())
bosses={1:1,2:2,3:3,4:4,5:5,6:10,7:15,8:20,9:25,10:30}
p11={
 'P11-01':('Long local text compressed the required objective into a narrow tall column','Independent full-width objective/context rows at actual authored stages','prototype/css/proto.css'),
 'P11-02':('Repeated L1 knife investment transformed after useful encounters','Retained first XP cost8, linear later L1 costs and existing finite budget; optional choices and misses preserved','prototype/js/config.js'),
 'P11-03':('Ordinary entries skipped signatures while Linekeeper/Vatman evasive cases denied contact','Actual live first tells, continuous action sequencing, reachable approaches/recoveries; legal strong quick wins and real deaths retained','prototype/js/sim/bosses.js'),
 'P11-04':('Dark boss/tool silhouettes merged with paving and overhead symbols dominated','Per-arena floor values, reduced redundant star/aura, local safe exposure marks; all ten individually sampled','prototype/js/view/boss-puppet.js'),
 'P11-05':('Large frenzy sentence, remote optional cues, control pulses and older friendly particles competed','Frenzy owns existing streak/trail; relevant proximity cues, safe hit targets, no pulse stack; actual cosmetic pass clips around actors/hostile geometry','prototype/js/view/render.js'),
 'P11-06':('Distinct physical consequences could be outside a caption-dominated corridor frame','Bounded live action framing relates hero to actual carry/flank/cart/guide/crossing; no extra repetitive tasks; local guide foot mark','prototype/js/view/route-milestones-fx.js'),
 'P11-07':('In-fight losses labelled entry-not-reached; L23/L29 driver delays unexplained','Explicit pre-entry/in-fight/timeout/defeated outcomes, retained raw rows and unchanged-runtime driver diagnoses','prototype/tools/audit-experience.cjs')
}
for r in x['rows']:
 id=r['id'];prior=oldrows.get(id)
 if 'preAudit11' not in r and prior:
  r['preAudit11']={'beforeReset':prior['before'],'implementedBeforeAudit11':prior['after']};r['before']=prior['after']
 if prior:r['after']=prior['after'];r['before']=prior['after']
 if id in p11:
  r['before'],r['after'],f=p11[id];r['sourceChanges']=[f];r['disposition']='extend'
 r['evidence']=[];r['playerValidation']='Not performed; owner rejection remains until reassessment'
 r['implemented']='Retained in final10; gameplay/view bytes match9';r['technicallyVerified']='Final10 suite plus the named applicable regression/fixture evidence; see exact counts/exits in verification report';r['presentationReview']='Source inspected; original-time media indexed; continuous review unavailable'
 r['remaining']='Continuous craft, listening where relevant, physical-phone and unfamiliar-player acceptance pending'
 r['disposition']='retain-and-verify'
 if prior and ('Not applicable' in prior.get('remaining','') or prior.get('implemented')=='Not applicable'):
  r['after']=prior['after'];r['remaining']=prior['remaining'];r['implemented']='Not applicable';r['technicallyVerified']='Not applicable; intentionally no synthetic empty/full-health state';r['presentationReview']='Not applicable';r['playerValidation']='Not applicable';continue
 if id.startswith('B') or id.startswith('S02-L'):
  level=bosses[int(id[1:])] if id.startswith('B') else int(id.split('-')[1][1:]);r['disposition']='extend'
  r['after']+='; Audit11 retained the rig, adds arena value separation and removes redundant star/aura; real first tell/phase sequencing and specific reach/recovery corrections, no blanket HP or minimum lifetime'
  r['evidence']=[f'{M}/final7-bosses/boss-L{level}.mp4',f'{M}/final8-stress-default-repair/boss-L{level}.mp4',f'{M}/final8-stress-reduced-repair/boss-L{level}.mp4',T+'/balance-analysis.json','reviews/telemetry/first30-reset/audit11-candidate7-boss-lifecycle.json',f'{M}/final7-frame-review/final7-bosses-boss-L{level}.jpg']
  r['presentationReview']='Inspected eight original-time clean frames per boss and indexed default/reduced/grayscale stress samples; not continuous foot/grip/death acceptance'
 elif id.startswith(('W-','E-')):
  name='weapon-'+id[2:] if id.startswith('W-') else 'evolution-'+id[2:]
  r['evidence']=[f'{M}/final7-arsenal/{name}.mp4','reviews/telemetry/first30-reset/audit11-candidate7-contact-roster.json','reviews/telemetry/first30-reset/audit11-candidate7-evolution-contact.json',T+'/media-index.json']
  r['presentationReview']='Actual final7 moving/rank/evolution frames inspected as indexed; final8/9 only friendly cosmetic overlap/guide-marker changes, physical weapon/sim code identical. Continuous appeal remains pending'
  if id.startswith('E-'):r['evidence']+=[T+'/balance-analysis.json',T+'/evolution-followup-predeclared.json']
  if id=='E-hookpull':r['remaining']+='; targeted earned searches retain availability/rank/offer misses and explicit observer crashes/rechecks. See all original, debut, later and bounded investment policies in balance packet; supplied effects are not earned feasibility proof';r['technicallyVerified']='Actual effect/contact checks pass on identical final simulation; useful ordinary acquisition remains unestablished'
 elif re.fullmatch('L[0-9][0-9]',id):
  level=int(id[1:]);r['disposition']='extend';folder='final7-worlds' if level<22 else 'final7-worlds-remainder'
  r['evidence']=[f'{M}/{folder}/world-L{level}.mp4',f'{M}/final7-frame-review/worlds-{(level-1)//5*5+1}.jpg',f'{M}/candidate9-earned-journey/index.json','reviews/AUDIT11-JOURNEY-2026-11-20.md']
  r['after']+='; bounded live framing relates the actual destination and Arda, preserving steering and authored counts'
  r['presentationReview']='Two objective-hidden native action frames inspected plus earned-route samples as indexed; source/action consequence reviewed; no uncoached variety verdict'
  if level==27:r['evidence'].append(f'{M}/final9-guide-repair/world-L27.mp4');r['after']+='; oversized guide follow-radius ring replaced by local foot/direction marks'
 elif id.startswith('R-'):
  r['evidence']=[f'{M}/final7-roles/enemy-{id[2:]}.mp4',T+'/media-index.json'];r['presentationReview']='Role start/mid/contact samples inspected; current14 natural roles distinguished from supplied introduction/kill fixtures'
 elif id.startswith('A-'):
  weapon,branch=id[2:].rsplit('-',1);r['evidence']=['reviews/media/R1/first30-reset/audit11-candidate7-advanced/index-arsenal.json',T+'/media-index.json']
  r['presentationReview']='Exact branch/signature source and indexed moving frames inspected; numerical-only branches explicitly unfilmed; no sample-to-roster motion approval'
 elif id.startswith('I-'):
  r['evidence']=[f'{M}/final7-interactions/index.json',f'{M}/final7-worlds/index-world.json',f'{M}/final7-worlds-remainder/index-world.json','reviews/telemetry/first30-reset/audit11-candidate7-contact-roster.json']
  r['presentationReview']='Shared actual interaction/health/world frames and source inspected; positions/HP supplied where declared. Not every row has an isolated visible-state film; no fictional N/A state or per-state player-recognition approval'
 elif id.startswith('S'):
  r['evidence']=[f'{M}/final7-scenes/index.json',f'{M}/candidate9-earned-journey/index.json','reviews/AUDIT11-JOURNEY-2026-11-20.md'];r['presentationReview']='Trigger, actor/order/handback source and indexed scene/earned frames inspected; quiet emotion/temporal performance remain unaccepted'
 elif id.startswith('F01'):
  r['evidence']=[f'{M}/final9-health-direct/index.json',f'{M}/final9-health-default/index-health.json',f'{M}/final9-health-reduced/index-health.json',T+'/media-index.json'];r['presentationReview']='Direct actual production-canvas injury/heal/block/critical frames inspected with HUD hidden; saved-at-full then real-injury pickup asserted in corrected quiet fixtures. Old ambient-contaminated and delayed recorder samples rejected as those proofs. Muted uncoached recognition pending'
 elif id in ['F02','P10-04','P11-05']:
  r['disposition']='extend';r['evidence']=[f'{M}/final8-stress-default-repair/index-bosses.json',f'{M}/final8-stress-reduced-repair/index-bosses.json',T+'/final8-clarity.json'];r['presentationReview']='Earlier overlap rejected from actual frames, older particle pass repaired and pixel tested, new crowded/grayscale/reduced samples inspected; recognition not player validated'
 elif id=='F03':
  r['evidence']=[T+'/media-index.json',T+'/native-cadence.json'];r['presentationReview']='Source/mix-owner state and actual recorded stream metadata only; NOT listened to';r['remaining']='Listening acceptance of fatigue, appeal, default balance and phone audio-focus remains pending'
 elif id.startswith('G') or id=='P10-01' or id=='P11-02':
  r['disposition']='extend' if id in ['G03','P10-01','P11-02'] else 'retain-and-verify';r['evidence']=[T+'/balance-analysis.json',f'{M}/final7-transactions-repair/index.json',f'{M}/final7-reward-ownership/index.json',f'{M}/candidate9-earned-journey/index.json'];r['presentationReview']='Actual earned choices/return menus and contextual invitation frames inspected; uncoached discovery/voluntary replay pending'
 if not r['evidence']:r['evidence']=[T+'/media-index.json','reviews/AUDIT11-VERIFICATION-2026-11-20.md']
 if id in ['P11-01','X-ui']:r['evidence']=[T+'/final7-hud-resume.log',f'{M}/hud-final7','reviews/telemetry/first30-reset/ui-checks-audit11-candidate7.json'];r['presentationReview']='Actual authored L4 before/after and long-action HUD matrix frames/measurements inspected;240320/390/TR/EN/100/150 combinations, not tiny-text concealment'
 if id in ['P11-07','X-balance']:r['evidence']=[T+'/balance-analysis.json',T+'/L29-navigation-repair.jsonl','reviews/AUDIT11-BALANCE-2026-11-20.md'];r['presentationReview']='Raw traces reconciled; L23/L29 driver failures retained separately from in-fight death or human pacing'
 if id=='X-native-comics':r['evidence']=['reviews/media/R1/first30-reset/audit11-candidate7-comics/index.json','reviews/telemetry/first30-reset/audit11-candidate7-native-trigger-order.json'];r['presentationReview']='Current native source/trigger order retained; all authored first30 pages/conditional Captain variants exercised at320x568 TR/EN150, inspected full-text stills as indexed; independent native editorial and emotional acceptance not invented'
 if id=='F03':r['technicallyVerified']='Music-owner/source/mix metadata checked; no listening verdict'
 if id=='X-performance':r['technicallyVerified']='Sequential desktop benchmark only; named phone budgets not verified';r['presentationReview']='Actual desktop benchmark/natively recorded cadence reviewed numerically; no physical phone or perceived-fluidity proof';r['remaining']='Named-device sustained heat/frame/audio/input budgets still pending'
 if id=='X-earned-journey':r['evidence']=[f'{M}/candidate6-earned-journey/index.json',f'{M}/candidate9-earned-journey/index.json'];r['presentationReview']='Exact final9 fresh earned flow and earlier source6 including interruption/losses indexed separately; automated controls are not a human playtest'
 if id in ['P11-03','P11-04']:r['evidence']=[f'{M}/final7-bosses/index-bosses.json',f'{M}/final8-stress-reduced-repair/index-bosses.json',T+'/balance-analysis.json'];r['presentationReview']='All ten clean/default/reduced/grayscale original-time samples inspected; no continuous death/foot/grip or player tactical acceptance'
 if id=='P11-06':r['evidence']=['reviews/AUDIT11-JOURNEY-2026-11-20.md',f'{M}/candidate6-earned-journey/frame-review/index.json',f'{M}/candidate9-earned-journey/index.json'];r['presentationReview']='All30 objective-hidden action and earned journey/29 departure samples inspected with exact sources; shared northbound geography and uncoached variety remain open'
 if id.startswith('P11-'):r['disposition']='extend';r['implemented']='Implemented locally in final10; acceptance stages remain separate'
 if id=='E-cleaver':r['disposition']='extend';r['after']+='; final10 corrects stale360 orbit description in TR/EN to match finite alternating cuts';r['evidence'].append(f'{M}/final10-cleaver-copy/index.json')
 # A check result is applied only when its actual final report exists, not on this generator's optimistic inference.
 r['technicalEvidenceReport']='reviews/AUDIT11-VERIFICATION-2026-11-20.md'
x['finalSource']=source;x['statusPolicy']='Implemented/technical/presentation/player remain separate. No automatic green status from a generated recording. Exact actual inspection inventory and final test results govern. N/A is not a passed fake state.';x['updated']=datetime.datetime.now(datetime.timezone.utc).isoformat();path.write_text(json.dumps(x,indent=2)+'\n')
lines=['# Audit11 complete requirement ledger','',f"Final source `{source['runtime_manifest_sha256']}`.328 named rows. Read [implementation](AUDIT11-IMPLEMENTATION-2026-11-20.md), [exact tests](AUDIT11-VERIFICATION-2026-11-20.md), [actual frame review](AUDIT11-RENDERED-REVIEW-2026-11-20.md) and [pending acceptance](AUDIT11-ACCEPTANCE-2026-11-20.md). The [JSON ledger](telemetry/audit11-implementation/coverage.json) retains source files, actual before/after, evidence links and separate statuses. No row receives player approval from automation.",'','| Requirement | Disposition / implemented | Technical evidence | Presentation actually inspected | Player / remaining |','|---|---|---|---|---|']
for r in x['rows']:
 esc=lambda s:str(s).replace('|','/').replace('\n',' ')
 evidence=r['evidence'][0] if r['evidence'] else 'reviews/AUDIT11-VERIFICATION-2026-11-20.md';link='['+r['id']+']('+str(Path(evidence).relative_to('reviews'))+')' if evidence.startswith('reviews/') else r['id']
 lines.append('| '+link+' '+esc(r['requirement'])+' | '+esc(r['disposition']+'; '+r['implemented'])+' | '+esc(r['technicallyVerified'])+' | '+esc(r['presentationReview'])+' | '+esc(r['playerValidation']+'; '+r['remaining'])+' |')
(R/'reviews/AUDIT11-COVERAGE-2026-11-20.md').write_text('\n'.join(lines)+'\n');print('328 separate stage rows written; no player acceptance inferred')
