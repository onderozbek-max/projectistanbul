"""Compile observed Audit8 evidence; preserve failures and provenance, never infer enjoyment."""
import collections, glob, hashlib, json, os, statistics
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
T=ROOT/'reviews/telemetry/audit8-implementation'
M=ROOT/'reviews/media/R1/audit8-implementation'
def read(name,default=None):
 p=T/name
 return json.loads(p.read_text()) if p.exists() else default
def rows(name):
 p=T/name
 return [json.loads(l) for l in p.read_text().splitlines() if l.strip()] if p.exists() else []
def median(a):return round(statistics.median(a),1) if a else '—'
def link(label,path):return f'[{label}]({path})'
def save(name,text):(ROOT/'reviews'/name).write_text(text+'\n')
profiles={n:rows('audit8-earned-'+n+'.jsonl') for n in ['broad','cover','offense','banked-growth']}
all_runs=[r for rs in profiles.values() for r in rs if r.get('kind')=='earnedCampaign']
bosses={p:rows('audit8-boss-'+p+'.jsonl') for p in ['evasive','punish']}
content=read('content-current.json',{})
effects={r['id']:r for r in read('evolution-conditional-effects.json',{}).get('records',[])}
natural=all_runs+rows('audit8-earned-evolutions.jsonl')
level_names=['Restaurant and Cook','Tram and Switchkeeper','Street cart and Roaster','Cable anchors and Linekeeper','Depot and Vatman',
 'Galata hoist','Musician escort','Bell diversion','Weighted bridge','Keeper courtyard','Cargo hook','Mooring release','Points and traffic',
 'Three shutters','Loading dock and Bride','Snagged rods','Bridge rescue','Wind screens','Braces and waves','Bridge lift, Fisher and Kaan',
 'Awning with Kaan','Spend cart on cover/offense','Sacks and reciprocal cover','Signal trolley','Captain and farewell','Departure lever',
 'Light/shelter guide','Fuse and clock interval','Light/lure circuit','Points, Ticket Man and walking passage']
actions=['Authored eating/attention/grip/first strike; real Cook/door/call; illustrated shelter shutter.',
 'Accepted live approach → protected tram payoff retained; rail/hook phase reset no longer repeats the opening.',
 'Illustrated porter pushes real cart; physical cart footprint and street lift/contact/throw remain distinct actions.',
 'Two real anchors joined by cable and control contact. Phase two begins with knot, then relay.',
 'Actual depot control and departing tram retained; failed route diagnosed as bot navigation, not an impassable level.',
 'Rope joins actual hoist control to illustrated load; raised collision opens the landing; existing portable cover remains useful.',
 'Actual guide takes chosen lane; shelter redirects local pressure, direct is faster; neutral remains viable.',
 'Bell control tied to real lure; eligible enemies turn toward the lure; resolution suppresses immediate new ambient pressure.',
 'Carried weight/socket and illustrated short deck share existing gap/collision; no art-only walkable bridge.',
 'Keeper loses leverage and plants during reachable opening; lateral safe lane and falling weights remain real.',
 'Hand/control/rope/load connected; illustrated cargo reveals the actual dock opening.',
 'Actual departing boat, rope release and cover/offense ownership retained; illustrated dock landing.',
 'Actual points/traffic and lateral clearance retained; one current illustrated car in a legal roadside pocket restores a real terrain-combo opportunity; failed source was a walker, not invented boss rails.',
 'Three shutters expose usable space; second/third work shortened; illustrated stalls and continuous operating contact.',
 'Existing first supply moved into entry room without duplication; rope/cart lessons retained; Bride has authored heavy acting.',
 'Visible safe line/rod control; existing snag release changes the approach. No fictitious rod damage added.',
 'Authored rope grip, supported step, recovery/offer; real food flies from rescuer to pickup during existing collection delay.',
 'Actual secured screen and wind-direction consequence retained; anonymous stranger remains unnamed.',
 'Existing directional crests and refuge intervals retained; illustrated braced deck; no extra empty time added.',
 'Lift/Fisher cast/net tied to real bridge; obsolete hazards resolve; Kaan approaches, lowers fish, recognizes Arda, then reading.',
 'Existing genuine joined-Kaan support remains tied to visible task pressure and actual Dash follow-up.',
 'Same cart can be spent offensively or placed with wear preserved; actual first-clear fact remembered for L24.',
 'Three real sacks retained with shorter trips. Real Kaan pressure must be relieved inside existing response window.',
 'Trolley actually damages/shoves each swept regular target once; hero safe-side choice remains real; factual L22 callback.',
 'Grounded haul/anchor/spice; optional roadside car outside the arena; released threat; world reaction and departure precede dedicated native variant reading.',
 'Actual railcar departure retained as relief; no boarding implication or invented wait.',
 'Guide uses actual selected lit/sheltered lane; existing stair visibility and recovery destination retained.',
 'Fuse visibly carried at belt then inserted in actual socket; real interval and cancel state preserved.',
 'Optional preview stays separate from mandatory circuit; lure attracts actual eligible enemies; first-clear fact preserved.',
 'Points moved to arena approach and actual service path linked; signals resolve with real boss death; both face walking route.']

# Pacing is measured behavior, not a fun score.
lines=['# Audit8 · all-30 pacing and failure review','',
 'Earned campaign simulation: `e538c15a99ddf5e625079bc5ddb394b56a2bf0638d93493f34312ab2574cb642`; '+
 'final runtime: `81a885795a562dd930b3428f5531548de69f03b6119ba7c2e4d19d5e587c3ce3`. '+
 'The final change fixes asset-await startup in the benchmark/weapon preview; all simulation, art and native voice files match the campaign build. '+
 'Times are simulation seconds. “Nearby pressure” means a live active enemy within 7m, a proximity proxy; it is not a measure of human intensity. '+
 'Stationary time includes real work. No duration target, forced wait or replacement crowd was added to make a fast route longer.','',
 '| Bölüm / action | Final spatial/physical decision | Broad clear / stationary / nearby % | Cover / offense / banked clear | Evidence |',
 '|---|---|---|---|---|']
for n in range(1,31):
 wins={p:next((r for r in rs if r.get('level')==n and r.get('result')=='win'),None) for p,rs in profiles.items()}
 r=wins['broad'];tr=r.get('experienceTrace',{}) if r else {};secs=r.get('time',0) if r else 0
 metrics=f"{secs:.1f}s / {tr.get('wait',0):.1f}s / {100*tr.get('combat',0)/secs:.0f}%" if secs else 'pending'
 others=' / '.join(f"{wins[p]['time']:.1f}s" if wins[p] else 'pending' for p in ['cover','offense','banked-growth'])
 proof=link('world fixture',f'media/R1/audit8-implementation/final/world-L{n}.mp4')+'; '+link('earned trace','telemetry/audit8-implementation/audit8-earned-broad.jsonl')
 lines.append(f'| {n} · {level_names[n-1]} | {actions[n-1]} | {metrics} | {others} | {proof} |')
lines+=['','## Failures retained and investigated','',
 'The campaigns use normal input and actual rewards. Automatic allocation and systematic card choices are stronger planning than an unfamiliar player. '+
 '“Banked growth” really leaves earned Attributes/Perks unspent; equipment/mastery are still genuinely earned. No revive, ad or purchase was used.','',
 '| Profile | Attempts / wins / losses / timeouts | Failed cases |','|---|---|---|']
for p,rs in profiles.items():
 counts=collections.Counter(r.get('result') for r in rs)
 failed=[]
 for r in rs:
  if r.get('result')!='win':
   cause=','.join(d['cause'] for d in r.get('deaths',[])) or r.get('result','unknown')
   failed.append(f"L{r.get('level')} seed{r.get('seed')}: {cause} at {r.get('time',0):.1f}s")
 lines.append(f"| {p} | {len(rs)} / {counts['win']} / {counts['lose']} / {counts['timeout']} | {'; '.join(failed) or 'none'} |")
lines+=['',
 '- L5 seed42 ranged stall: local repulsion trapped the audit driver near a corner. The same earned state clears via a bounded collision-checked input path; no wall or player collision was removed.',
 '- L7 offense seed42: the optional-choice driver tried to walk through the wall. Ordinary-input pathfinding now goes around it; [original failure and successful replay](telemetry/audit8-implementation/l7-offense-path-recheck.jsonl) remain.',
 '- L22 offense seeds43/44: the driver kept waiting at a destroyed object’s old grip. The corrected normal-input policy abandons the absent object; the exact original earned saves/seeds both clear. No collision or player rule changed. [Rechecks](telemetry/audit8-implementation/l22-offense-recheck-43.jsonl).',
 '- L10: exposed Keeper previously chased during the supposed punish. He now plants, the opening is 2.35s and weight reset is 1.65s. Both real policies clear all three earned power samples; this is not a human difficulty verdict.',
 '- L13/L28: actual failed traces distinguish ordinary walkers/heavies and approach pressure from the synthetic rail-overlap fixture. Genuine retries clear; nonexistent boss rails were not added to L13 or L16.',
 '- L15: first existing supply is at y6 and awarded only once. Some optimized/low-investment runs still lose later to runners; broad and other approaches clear. No blanket enemy/HP nerf was applied.',
 '- Browser losses, including the original offensive L22/L24 recordings, are retained. They are not counted as successful choice/callback evidence. See the release retry files in the evidence index.',
 '- Early encounters now alternate on a phase reset: Rails→Hook, Charge→Roast, Relay→Knot. A sufficiently efficient build may still finish without seeing every family. No hidden scaling, mandatory HP lock or invulnerability phase was added.']
save('AUDIT8-PACING-2026-11-18.md','\n'.join(lines))

boss_names={1:'Cook',2:'Switchkeeper',3:'Roaster',4:'Linekeeper',5:'Vatman',10:'Keeper',15:'Bride',20:'Fisher',25:'Captain',30:'Ticket Man'}
cards={1:'Close cleaver combo / far throw; planted step and release, then apron-side recovery.',2:'Committed hook / crossing rails; braced pull, lateral escape and spent reset.',3:'Charge / roast; forward loaded weight, then safe heat-side approach.',4:'Relay lanes / knot ring; held cable/tool, locked source, then lateral recovery.',5:'District tram / bell / lever; heavy brace, visible lane crossing and resetting lever.',10:'Counterweight lanes / charge; loaded apparatus, planted exposed stance within approach reach.',15:'Dock carts / rope sweep; dress/feet retain mass, lowered rope and specific spent posture.',20:'Rod cast / net; rod-hand-line source, backward load and slack recovery.',25:'Anchor haul / spice; grounded boots and torso, real chain from hand to anchor, weighted release.',30:'Punch / station signal; different tools and directions, actual rail lanes, returning neutral stance.'}
lines=['# Audit8 · complete roster and scene coverage','',
 'These are source-linked implementation and diagnostic observations. Illustrated poses and changing simulation are not independent artistic approval. '+
 'Full ordinary-HUD movies keep their actual runtime hashes. [Exact source deltas](telemetry/audit8-implementation/candidate-deltas.json) distinguish L4 phase ordering, the two real roadside cars, food-cart terrain rejection, explicit owned-weapon planning and final asset-await startup. '+
 'L4, all enemy-role captures, muted health, identities, cars, plan, native scenes and compact UI have targeted later evidence. Final earned campaigns/boss comparisons use unchanged simulation relative to the verified runtime; the final full suite and cold preview/benchmark use that latest runtime.','',
 '## Ten encounter cards and earned policy comparisons','',
 'Each power column gives evasive / punish fight seconds, seed3. Both policies traverse the level and select ordinary cards first; '+
 'these are earned permanent-power cohorts, not equal-DPS controlled loadouts. Weak/typical L1 share the same genuinely empty initial state. '+
 '“Strong” is an earned L30 rematch save, not a promise that every random run is faster.','',
 '| Boss | Intention / source / reachable answer | Weak | Typical | Strong | Actual families in typical evasive / punish |','|---|---|---|---|---|---|']
for n,name in boss_names.items():
 values=[];typ=[]
 for band in ['weak','typical','strong']:
  pair=[]
  for policy in ['evasive','punish']:
   r=next((r for r in bosses[policy] if r.get('level')==n and r.get('band')==band),{})
   b=r.get('bossRecord') or {};pair.append(f"{b.get('fightSeconds',0):.1f}s" if b else 'pending')
   if band=='typical':typ.append(', '.join(dict.fromkeys(e.get('act','?') for e in b.get('attacks',[]))))
  values.append(' / '.join(pair))
 lines.append(f"| L{n} {link(name,('media/R1/audit8-implementation/release/' if n==4 else 'media/R1/audit8-implementation/final/')+'boss-L'+str(n)+'.mp4')} | {cards[n]} | {' | '.join(values)} | {' / '.join(typ)} |")
lines+=['',
 'All ten retain one idle-based scale and measured feet across anticipation/contact/recovery/hit/defeat. Cook, Captain and Ticket Man use authored parts plus grounded upper-body pivots; the other seven have eight-pose atlases. '+
 'Heavy actors remain heavy. The hit rule, aim locking and damage geometry remain authoritative. Boss defeat resolves owned threats before protected world acting.','',
 '## Seventeen base weapons','',
 '| Weapon | Active rank 1 / 3 / 5 evidence | Treatment |','|---|---|---|']
for w in content.get('weapons',[]):
 clips=' / '.join(link('R'+str(rank),f'media/R1/audit8-implementation/final/weapon-{w}-r{rank}.mp4') for rank in [1,3,5])
 treatment={'knife':'Attack-only hand target, recognizable blade and decisive leading edge; true swing range retained.',
 'chain':'Continuous weighted links/lag retained; active attack uses hand, secondary automatic orbit deploys from belt spool instead of vanishing.',
 'chainsaw':'Two-handed bracing and bar match actual 2.2m bite reach; real rev/tick/contact remains authoritative.',
 'cable':'Successful cartoon electrocution identity retained, with actual target reaction/attribution.'}.get(w,'Current distinct tool/rank/effect retained; clean raster identity icons, actual hits and rank progression re-recorded.')
 lines.append(f'| {w} | {clips} | {treatment} |')
lines+=['','## Eighteen evolutions','',
 'The conditional diagnostic supplies prerequisites/power openly. Natural rows below use real offers, rerolls and actual earned pre-clear power; '+
 'no debug weapon, passive, terrain-seen flag or outcome is granted. Targeted runs use the actual explicit owned-weapon plan action, equivalent to the visible Pause control. Focused-intention trials are skilled automated choices, not prevalence in an uncoached campaign. '+
 '“Useful” is a quantitative proxy (over 10s remaining, at least five affected targets), not proof of fun. All attempts, misses and losses remain in JSONL.','',
 '| Evolution | Conditional fixture: hits / targets / distinct control | Earned acquisition → first effect; remaining engagement | Video |','|---|---|---|---|']
for id in content.get('evolutions',{}):
 e=effects.get(id,{}).get('evolved',{});use=e.get('use') or {};count=e.get('counts') or {}
 control=', '.join(f'{k}:{count[k]}' for k in ['arcZap','lakeMerge','spitBlock','nazarDodge','healPulse','hookReel','ropePin','grinderStack'] if count.get(k)) or ', '.join((use.get('control') or {}).keys()) or 'actual attributed hit effect'
 candidates=[r for r in natural if (r.get('evolutionUse') or {}).get(id,{}).get('hits',0)>0]
 candidates.sort(key=lambda r:(r.get('result')!='win',not r.get('usefulRemainingEngagement',False),-(r['time']-r['evolutionUse'][id]['acquired_s'])))
 if candidates:
  r=candidates[0];u=r['evolutionUse'][id];earned=f"L{r['level']} seed{r['seed']} {r['result']}: {u['acquired_s']}s → {u.get('first_effect_s')}s; {r['time']-u['acquired_s']:.1f}s left; {len(r['experienceTrace']['evolvedTargets'].get(id,[]))} targets"
 else:earned='Not observed naturally in recorded runs. Supplied conditional/contact proof only; no fabricated acquisition claim.'
 lines.append(f"| {id} | {use.get('hits','pending')} / {len(e.get('targets',[]))} / {control} | {earned} | {link('active effect',f'media/R1/audit8-implementation/final/evolution-{id}.mp4')} |")
lines+=['',
 'Matched dry/wet Arc Chain and car/no-car Car Bomb cases prove actual extra jumps/damage; Blacksmith restores real HP, Foam blocks real spit, Storm Shield triggers on actual Nazar dodge, and Lake merges real pools. '+
 'No generic blast or a manual Dash is substituted for these conditions. [Actual matched outcomes](telemetry/audit8-implementation/evolution-conditional-effects.json).','',
 '## Ordinary roles · bounded work','',
 '| Role | Evidence | Boundary |','|---|---|---|']
for role in ['walker','diner','runner','crawler','brute','hardhat','spitter','zehirli','screamer','bloater','kasap','parkur','copci','cayci','kurye','marti']:
 lines.append(f"| {role} | {link('active full-HUD movie',f'media/R1/audit8-implementation/release/enemy-{role}.mp4')} | "+('Additional conditional role; no natural first-30 spawn claim.' if role in ['zehirli','kasap'] else 'Existing role art/tell retained; fresh simulation, active actor/clock/visibility and real death checked.')+' |')
lines+=['',
 'Four walker clothing variants and all six fleeing civilian identities remain. Neighbour-aware civilian selection and canonical portrait mapping are retained. '+
 'The only bounded crowd-facing correction is turning lured enemies toward the actual lure; no ordinary-zombie limb overhaul.','',
 '## Major scene shot list','',
 '| Sequence | What is visible before reading | Actual facts / evidence |','|---|---|---|',
 '| L1 | Eating hands; news gaze/head lead; authored reach/grip/strike after knife leaves counter; same reachable door; operator closes shelter shutter | '+link('fresh normal session','media/R1/audit8-implementation/final-earned/fresh-session-en.mp4')+'; '+link('Memories/replay/reload','media/R1/audit8-implementation/final-earned/fresh-session-en-memory-check.json')+' |',
 '| L20 | Rod/body relax, Kaan approaches from safe mark with fish lowered; Arda turns; shared onward orientation; then full comic | '+link('earned flow','media/R1/audit8-implementation/final-earned/earned-L20-en.mp4')+'; no retroactive Fisher companion help |',
 '| L25 | Body/tool settle; Kaan stops and lowers shoulders; Arda attends; both turn onward; no loot/comic over world acting | '+link('linked actual help → farewell','media/R1/audit8-implementation/final-earned-help-chain/earned-L25-en.mp4')+'; neutral/current/stored native variants retained |',
 '| L30 | Actual points/service track connects; signals resolve; both orient to walking passage; native family call then first-30 results | '+link('earned flow','media/R1/audit8-implementation/final-earned/earned-L30-en.mp4')+'; Sarıyer safe / Ataköy useful / highway unsafe / Bazaar next; no train boarding or future letter spoiler |','',
 'All three later aftermaths have TR/EN text150, mute, reduced motion/flash variants in '+link('supplemental index','media/R1/audit8-implementation/final-supplemental/index-additions.json')+'. '+
 'World acting is recorded from the actual lethal event, then held protected reading; later screenshots are not mislabelled as world acting. '+
 'New illustrations: seven boss pose sets, Kaan approach/grief/departure, Arda cold-open contact, shelter action, nine mechanism controls, six landings and six helper poses. '+
 link('Exact ImageGen sources/prompts/rejected intermediate ledger','../art/commission/generated/2026-11-18-audit8/IMPORT.json')+'.']
save('AUDIT8-COVERAGE-2026-11-18.md','\n'.join(lines))

# A portable, dependency-free normal-speed video index; opening it does not load every movie.
media=[]
for p in sorted(M.glob('*/index-*.json')):
 if p.parent.name not in ['final','release','review','candidate','audit8','release-accessible','final-supplemental','before-final']:continue
 for r in json.loads(p.read_text()):
  if not r.get('file'):continue
  media.append({'id':p.parent.name+' / '+r['id'],'file':str(p.parent.relative_to(M)/r['file']),
    'source':r.get('sourceManifest'), 'provenance':r.get('supplied') or r.get('provenance'),'fixture':r.get('fixture',False)})
for p in sorted(M.glob('*/earned-*.json'))+sorted(M.glob('*/fresh-session-*.json')):
 r=json.loads(p.read_text())
 if not r.get('file') or not p.parent.name.startswith(('final-earned','release-earned','review-earned','candidate-earned','audit8-earned','before-earned')):continue
 media.append({'id':p.parent.name+' / '+r['id'],'file':str(p.parent.relative_to(M)/r['file']),
   'source':r.get('sourceManifest'),'provenance':r.get('origin','')+' '+r.get('assists',''),'fixture':r.get('fixture',False),
   'outcome':r.get('facts',{}).get('state')})
media=[r for r in media if not r['id'].startswith('candidate-earned-plan /')]
media.sort(key=lambda r:(0 if r['id'].startswith('audit8-earned-plan /') else 1 if r['id'].startswith('audit8 /') else 9 if r['id'].startswith('before-') else 4,r['id']))
payload=json.dumps(media).replace('</','<\\/')
html='''<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Project Istanbul · Audit8 evidence</title><style>body{font:16px system-ui;background:#15151e;color:#f7eddb;max-width:1000px;margin:24px auto;padding:12px}select{width:100%;padding:12px;font:inherit}video{display:block;max-height:80vh;max-width:100%;margin:20px auto;background:#000}p{line-height:1.5}a{color:#ffd268}code{overflow-wrap:anywhere}</style>
<h1>Audit8: normal-speed player view</h1><p>Desktop recordings at 390 × 844, ordinary HUD, original timestamps and actual post-master audio. Supplied fixtures and real earned runs are labelled. Desktop footage is not physical-phone proof or a player-enjoyment verdict.</p>
<p><a href="before-after.mp4">Short before/after reel</a> · <a href="../../../AUDIT8-IMPLEMENTATION-2026-11-18.md">Implementation report</a></p><select id="pick"></select><video id="movie" controls playsinline preload="metadata"></video><h2 id="name"></h2><p id="detail"></p><code id="source"></code><script>
const records=PAYLOAD,pick=document.querySelector('#pick'),movie=document.querySelector('#movie');records.forEach((r,i)=>{const o=document.createElement('option');o.value=i;o.textContent=r.id+(r.outcome?' ['+r.outcome+']':'');pick.append(o)});function show(){const r=records[pick.value];movie.src=r.file;document.querySelector('#name').textContent=r.id;document.querySelector('#detail').textContent=(r.fixture?'SUPPLIED DIAGNOSTIC. ':'EARNED PLAY. ')+r.provenance;document.querySelector('#source').textContent='Runtime manifest: '+r.source;}pick.onchange=show;show();</script>'''.replace('PAYLOAD',payload)
(M/'index.html').write_text(html)
print('Wrote all-30 pacing, complete roster/scene coverage, and',len(media),'indexed movies.')
