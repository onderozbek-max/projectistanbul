// Scene contracts exported from the integrated source and actual earned event records.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const P=require('./lib-load').loadP(),root=path.resolve(__dirname,'../..');
const dir=path.join(root,'reviews/telemetry/experiential');
const coverage=JSON.parse(fs.readFileSync(path.join(dir,'coverage.json'),'utf8'));
const dialogue=fs.readFileSync(path.join(dir,'dialogue-en.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
const pacing=fs.readFileSync(path.join(root,'reviews/EXPERIENTIAL-PACING-2026-11-18.md'),'utf8');
const intentions=Object.fromEntries(pacing.split('\n').filter(x=>/^\| \d+ \//.test(x)).map(x=>{const p=x.split('|');return[Number(p[1].trim().split(' ')[0]),p[2].trim()];}));
const records=[];
const groups=[['galataRoutes','galataMilestones'],['karakoyRoutes','karakoyMilestones'],['bridgeRoutes','bridgeMilestones'],['eminonuRoutes','eminonuMilestones'],['sirkeciRoutes','sirkeciMilestones']];
const viewSources=['route-milestones-fx.js','galata-milestones-fx.js','karakoy-milestones-fx.js','bridge-milestones-fx.js','eminonu-milestones-fx.js','sirkeci-fx.js'];
const fallback='Retry the required approved current source; readable neutral/text composition if unavailable. Never substitute retired bodies or invent completed work.';
const knowledge=level=>level<20?'Arda is going home; no future Kaan/letter knowledge.':level<25?'Kaan joins only after the Fisher; no Captain revelation before its current native scene.':'Captain/actual useful-help facts only; family safety/destination follows the current native order. No letter contents invented.';
for(const row of coverage.levels){
 const level=row.level,s=P.createSim(42,{levelIndex:level,tramRhythm:true});
 const group=groups.find(([routes])=>P.CFG.levels[routes][level]);
 const config=group?{route:P.CFG.levels[group[0]][level],district:P.CFG.levels[group[1]]}:P.CFG.levels.routeMilestones;
 records.push({id:'E10-world-L'+level,level,actualTrigger:level===1?'Actual Cook defeat → shutter exit release; opening and optional active-call booster are separate.':'Actual in-range route work/carry/escort/brace/circuit state in RouteMilestones and district trial; required ready state → milestoneLift → routeBeat milestone_<kind>_open.',
  prerequisites:{knowledge:knowledge(level),route:row.route,objective:row.objective,requiredState:'Current route task must actually complete; no presentation-only open flag.'},
  mode:level===2?'LIVE approach/call; retained PROTECTED tram crowd/payoff':'LIVE',
  actors:{hero:'Actual hero; interaction reach/tool contact follows sim work state.',anchors:s.milestone||{heroStart:{x:s.hero.x,y:s.hero.y},source:'L1 restaurant/director anchors'},other:'Current district prop/guide/load as present in the real task; not a floating progress ring.'},
  phaseTimings:{authoritative:config,note:'Config seconds for holds/openings; traversal/escort/carry/brace duration depends on actual input and hazard state. No fixed cinematic duration is invented.'},
  bodyActions:intentions[level],camera:{source:viewSources[group?groups.indexOf(group)+1:0],policy:'Ordinary single portrait projection; existing cable/tram contact focus returns smoothly; reduced motion suppresses decorative movement, not threat geometry.'},
  lightAudio:'Actual machinery/contact/routeBeat cues; no fake completion sound or safety promise before actual ready/open. Existing world light, no new global overlay substituted for acting.',
  dialogueIds:dialogue.filter(r=>r.level===level).map(r=>({id:r.id,trigger:r.trigger,variant:r.variant})),
  skipRetry:'No task skip. Moving away follows the current sim hold/reset policy; retry must perform required work again. L2 retained protected tram payoff has its existing cinematic completion policy.',
  semanticEnd:'Only the authoritative required task opens the actual collision passage; local choice/relationship resolution remains with sim and qualifying result.',
  saveResume:'Existing supported run-recovery contract; no new arbitrary mid-task checkpoint. Ordinary background pauses play; protected payoff suspends shared gameplay clocks and stale input.',fallback,
  earnedEvents:row.beats,capture:'media/R1/experiential/world-L'+String(level).padStart(2,'0')+'.webm',
  provenance:'First-action supplied fixture for view; separate full earned campaign event/timing record. Not every substep/choice branch was filmed as human play.'});
}
for(const level of [1,2,3,4,5,10,15,20,25,30]){
 const rows=fs.readFileSync(path.join(dir,'boss-evasive.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
 const preset=rows.find(r=>r.level===level).bossRecord.preset;
 records.push({id:'E05-L'+level+'-'+preset,level,actualTrigger:'Actual bossIntro emitted by the active boss/arena sim, never elapsed travel alone.',prerequisites:knowledge(level),mode:'PROTECTED entry; LIVE fight',
  actors:{hero:'Real hero point',boss:'Actual live dir.trialBoss or gen.boss, stable current-art pose scale'},phaseTimings:{first:P.CFG.experience.scenes.entryT,seen:P.CFG.experience.scenes.retryT},
  bodyActions:'Current role-specific entry/preparation; weight and settled stance, then authoritative live telegraph/commitment/recovery. No boss damage clock advances during the entry lock.',
  camera:'Shared frame includes hero, boss and escape floor in current portrait projection; no sim reposition/size change.',lightAudio:'Existing boss cue/music duck; no incidental voice over essential entry.',
  dialogueIds:dialogue.filter(r=>r.level===level&&r.trigger==='boss').map(r=>r.id),skipRetry:'0.6 s deliberate skip; seen repeat 0.38 s. Mark only completion/deliberate skip.',
  semanticEnd:'Input restored only after camera/control return; boss fight proceeds under unchanged sim.',saveResume:'Scene clock/audio freeze on background; explicit resume discards held keys/Dash. Reload follows supported existing run recovery.',fallback,
  capture:'media/R1/experiential/boss-L'+level+'-'+preset+'.webm',provenance:'Supplied no-attack/invulnerable view fixture; earned power/policy table is separate.'});
}
records.push({id:'E10-L1-opening',level:1,actualTrigger:'Fresh uncompleted cold open on starting L1; first useful input is movement.',prerequisites:'Dinner/stranger/rules only; no future companion/letter facts.',mode:'PROTECTED',
 actors:{hero:'Current illustrated Arda',cook:[-3.7,-9.2],stranger:[-7.2,-5.3],diner:'Actual first diner, using approved current patron source'},
 phaseTimings:{dinner:0,cook:2.5,news:6.5,turn:13,rules:16.5,grip:23.5,strike:24.2,outro:3.2},
 bodyActions:'Arda approaches with steps, reaches/grips, planted automatic knife strike, diner recoil, stranger retreats; no manual attack tutorial.',camera:'Current single projection/letterbox, no gameplay displacement.',lightAudio:'Current dialogue/memory panels, click/hurt/stab/swish at actual directed contact.',
 dialogueIds:['s2','s4','s3','rule1','rule2','rule3','barkGrab','pardon'],skipRetry:'Deliberate 0.6s skip finishes the opening; current first-view persistence retained.',semanticEnd:'Play/input unlocked; automatic attack loop and real movement begin.',saveResume:'No scene time advances while hidden; explicit return; existing recovery.',fallback,
 capture:'media/R1/experiential/cold-open.webm',provenance:'Fresh save, normal timeline, no supplied power.'});
for(const [level,kind,key]of [[20,'joining','kaanT'],[25,'farewell','farewellT'],[30,'passage','passageT']]){
 const neutral=P.Story.beat(level,'end',{});
 records.push({id:'E10-L'+level+'-'+kind+'-<actual native variant>',level,actualTrigger:'Actual bossDie stores defeated body; starts after BossDefeatFx finishes, before exit travel. Neither elapsed time nor a supplied win is the production trigger.',
  prerequisites:knowledge(level),mode:'PROTECTED through both physical acting AND native reading',actors:{hero:'Actual hero',boss:'Actual defeated body retained',kaan:'Current assist-sheet calm walking/low posture; duplicate live support actor hidden'},
  phaseTimings:{world:P.CFG.experience.scenes[key],seen:P.CFG.experience.scenes.retryT,reading:'Current native text, player-paced; first caption overlaps world action. World duration is not a forced reading deadline.'},
  bodyActions:kind==='joining'?'Kaan approaches from route, lowers hands, meets Arda, then both face route.':kind==='farewell'?'Captain remains fallen; Kaan lowers beside the body, rises/turns toward route; Arda gives space.':'Ticket Man ceases; shared route direction/family call follows current native sequence; no boarding or future destination event is fabricated.',
  camera:'Fit both axes/actual anchors; reserve top caption space with 0.18 screen-height bias. No dramatic tilt, no sim movement; reduced motion preserves composition.',
  lightAudio:kind==='farewell'?'Current quiet comic bed, clear fighting transients, hold incidental quips; no stale boss phase celebration.':'Duck current music and hold incidental speech; actual native first caption over world, then current illustrated panels.',
  dialogueIds:dialogue.filter(r=>r.level===level&&r.trigger==='end').map(r=>({id:r.id,variant:r.variant})),nativePage:neutral.id,
  skipRetry:'0.6s world skip safely finishes current book; normal native panel/skip behavior after world phase. Seen key includes current native outcome variant; neutral viewing cannot suppress qualifying Kaan variant.',
  semanticEnd:'Control returns for the real remaining exit. Existing clear/reward transaction settles exactly once there; no scene grants relationship facts, loot or another win.',
  saveResume:'Background freezes scene/audio and full sim/status/cooldown/task clocks; explicit resume. Reload follows existing recovery, never manufactures a completed result.',fallback,
  capture:'media/R1/experiential/earned-L'+level+'.mp4',provenance:'Actual earned broad-campaign save; automatic input/card/navigation, no invulnerability/rank grant. Additional TR/EN accessibility/failure captures are supplied-defeat fixtures.'});
}
fs.writeFileSync(path.join(dir,'scene-contracts.json'),JSON.stringify(records,null,2)+'\n');
const lines=['# Scene contracts and review walkthrough · 2026-11-18','','[Complete machine-readable records](telemetry/experiential/scene-contracts.json) contain the true trigger, prerequisites/knowledge, live/protected mode, actors/anchors, authoritative phase timings, physical action, camera, light/audio, native dialogue IDs, skip/retry, semantic end, save/resume, failure fallback and capture provenance for **30 world beats, ten boss entries and four major sequences**. Voice text remains exclusively in the native dialogue sources.','','## Live/protected reconciliation','','L2 is an explicit retained exception to the appendix’s all-live wording: approach and calling are live, but the previously owner-accepted staged crowd/tram payoff protects control and the shared gameplay clock. This preserves the working cinematic rather than silently enabling damage/collision during it. Its staged zombies are not presented as ordinary killable combat. The other required street tasks retain live control and danger; boss entries and major aftermath/native reading are protected.','','## Indexed world records','','| L / mode | Actual action and consequence | Evidence |','|---|---|---|'];
for(const r of records.slice(0,30))lines.push(`| ${r.level} / ${r.mode} | ${r.bodyActions} | [action fixture](${r.capture}) · [timings/earned pacing](EXPERIENTIAL-PACING-2026-11-18.md) |`);
lines.push('','## Player journey and observation boundaries','','1. Start fresh L1: opening, first movement, actual hit/food/prop invitation, first run-card choice; Mom begins at her actual existing trigger. Optional booster only interrupts/restores an already active call. Cook and street exit follow actual conditions.','2. L2–5: tram, cart, cables and depot/Vatman each release a real route barrier. Check movement during work and actual boss opening; no endless ambient farm is needed to advance.','3. L6–10: hoist, musician, bell, carried bridge weight and courtyard; first-clear local decisions persist and the Keeper closes the district.','4. L11–15: cargo, mooring, points, shutters and dock ramp; Bride has her own rope/cart pressure.','5. L16–20: rods, rescue, screens, wave braces and bridge lift; actual Fisher defeat presents Kaan joining beside the body, then control returns for the real exit.','6. L21–25: cooperative awning, cart commitment, useful sack/cover help, trolley and Captain. L22→24 and L23→25 facts remain distinct; actual Captain defeat selects neutral/current-help/stored-help native farewell without invented gratitude.','7. L26–30: departure, guide, fuse/clock, lights and points/Ticket Man. Actual defeat presents the current family/route call; exit/result then offers replay, not L31 production.','8. On pause/result/return, distinguish temporary card ranks from permanent practice, Street Cred perks, gear/mastery and relationships. The upgrade browser fixture applies earned Strength 0→1, then spends earned SC 1→0 on str.1; it grants neither resource.','','All 30 routes were observed in earned deterministic simulation. The normal-speed world recordings jump to supplied first-action states; they are not a single first-30 human walkthrough. Earned L20/25/30 films play real boss, scene, native reading and exit/result with automated navigation. Remaining holistic human pacing/comprehension and physical phone checks are in [the evidence checklist](EXPERIENTIAL-EVIDENCE-2026-11-18.md).');
fs.writeFileSync(path.join(root,'reviews/EXPERIENTIAL-SCENES-2026-11-18.md'),lines.join('\n')+'\n');
console.log(records.length,'explicit scene records');
