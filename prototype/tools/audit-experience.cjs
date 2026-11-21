// First-30 evidence uses the existing bot, sim and meta. JSONL distinguishes earned saves from supplied fixtures.
const fs = require('fs'), path = require('path'), Module = require('module');
const root = path.resolve(__dirname, '../..');
process.argv.push('--rhythm', '--skills', '--no-revive', '--campaign=30');
const source = fs.readFileSync(path.join(__dirname, 'bot.js'), 'utf8').split('// ---------- entry ----------')[0];
const extra = `
if(args['no-auto-skills'])args.skills=false; // Declared input policy; manual buttons are not automatically pressed.
let current, experienceTrace, bossRecord, openingSnapshot;
const create = P.createSim, step = P.stepSim, drain = P.drainEvents, spawn = P.Bosses.spawn;
const hitProp=P.Combat.damageProp;
P.Combat.damageProp=function(s,r,damage,source){const before=r.hp,alive=r.alive;const value=hitProp.apply(this,arguments);
 if(r.domino)(experienceTrace.materialContacts||(experienceTrace.materialContacts=[])).push({t:s.runT,source,before,after:r.hp,aliveBefore:alive,aliveAfter:r.alive,x:r.x,y:r.y});return value;};
let forcedLoadout = null, observedIds = new Set(), lastOffer = [];
P.createSim = function(seed, options) {
 if(forcedLoadout) options = Object.assign({},options,{loadout:forcedLoadout});
 current=create(seed,options);
 if(args['base-speed-control'])current.hero.baseMove=0; // Explicit counterfactual, never an earned-power claim.
 experienceTrace={move:0,wait:0,combat:0,quiet:0,roles:{},looks:{},cards:[],evolvedTargets:{},beats:[],deaths:0,secondWind:false};observedIds=new Set();lastOffer=[];
 bossRecord=null; openingSnapshot=null; return current;
};
if(args['base-speed-control']){
 const speed=P.Hero.speed;
 P.Hero.speed=function(s){const rank=s.hero.passives.shoes;s.hero.passives.shoes=0;const value=speed(s);if(rank===undefined)delete s.hero.passives.shoes;else s.hero.passives.shoes=rank;return value;};
}
P.stepSim = function(s,dt,input) {
 const before=s.runT; step(s,dt,input);
 if(s.levelIndex===23&&(!experienceTrace.routeSamples||s.runT-experienceTrace.routeSamples.at(-1).t>=5)){
  const m=s.milestone; (experienceTrace.routeSamples||(experienceTrace.routeSamples=[])).push({t:s.runT,x:s.hero.x,y:s.hero.y,hp:s.hero.hp,target:P.RouteMilestones.target(s),open:m&&m.open,carrying:!!(m&&m.carry),delivered:m&&m.delivered,sacks:m&&m.sacks&&m.sacks.map(q=>({x:q.x,y:q.y,delivered:q.delivered})),input});
 }
 const elapsed=s.runT-before;
 if(args['trace-boss-position']&&bossRecord&&(!bossRecord.positions||s.runT-bossRecord.positions.at(-1).t>=.5)){
  const e=s.dir.trialBoss||s.gen&&s.gen.boss;
  if(e)(bossRecord.positions||(bossRecord.positions=[])).push({t:s.runT,hero:{x:s.hero.x,y:s.hero.y,hp:s.hero.hp},boss:{x:e.x,y:e.y,hp:e.hp,act:e.ai.act,mode:e.ai.m,timer:e.ai.t,exposed:e.exposed,stun:e.stun,vx:e.vx,vy:e.vy},crowd:s.enemies.filter(a=>!a.dead&&a!==e&&Math.hypot(a.x-s.hero.x,a.y-s.hero.y)<5).length});
 }
 if(elapsed>0) {
  experienceTrace[s.hero.moving?'move':'wait']+=elapsed;
  experienceTrace[s.enemies.some(e=>!e.dead&&e.state==='active'&&Math.hypot(e.x-s.hero.x,e.y-s.hero.y)<7)?'combat':'quiet']+=elapsed;
  for(const e of s.enemies){
   const look=e.type==='walker'?P.CFG.enemyLook.walkerVariants[Math.imul((e.id|0)+1,0x9E3779B1)>>>30]:e.bossPreset||e.type;
   if(!experienceTrace.roles[e.type])experienceTrace.roles[e.type]={first:s.runT,id:e.id,state:e.state,variant:look};
   if(!observedIds.has(e.id)){observedIds.add(e.id);experienceTrace.looks[look]=(experienceTrace.looks[look]||0)+1;}
  }
 }
};
P.Bosses.spawn = function(s,type,x,y,options) {
 const e=spawn(s,type,x,y,options);
 if(args['boss-full-health'])s.hero.hp=s.hero.maxHp; // Explicit supplied control; never an earned-run claim.
 openingSnapshot=JSON.parse(JSON.stringify({weapons:s.hero.weapons,passives:s.hero.passives,gear:s.hero.gear,stats:s.hero.stats,mods:s.hero.mods,mastery:s.hero.mastery,signatures:s.hero.signatures,
  hero:{x:s.hero.x,y:s.hero.y,hp:s.hero.hp,maxHp:s.hero.maxHp},boss:{x:e.x,y:e.y,r:e.r}}));
 bossRecord={preset:e.bossPreset||type,start:s.runT,maxHp:e.maxHp,hpAtEntry:s.hero.hp/s.hero.maxHp,entry:openingSnapshot,attacks:[],phases:[],openings:[]};return e;
};
P.drainEvents = function(s) {
 const events=drain(s);
 for(const e of events) {
  if(['routeBeat','routeSpace','milestone','shutterOpen','bossIntro','bossDown','bossDie','bossCounter','win','evolve','localChoice','streetWeapon','hackDone','signalRestored','chestOpened','kaanSupport','heroHit','envHit','envExplode'].includes(e.type))experienceTrace.beats.push({t:s.runT,...e});
  if(e.type==='hit'&&s.evolutionUse&&s.evolutionUse[e.weaponVariant]){
   const ids=experienceTrace.evolvedTargets[e.weaponVariant]||(experienceTrace.evolvedTargets[e.weaponVariant]=[]);if(!ids.includes(e.id))ids.push(e.id);
  }
  if(e.type==='death')experienceTrace.deaths++;
  if(e.type==='revive'&&s.secondWindUsed)experienceTrace.secondWind=true;
  if(bossRecord&&e.type==='hit'&&e.bossHit){
   const key=(e.weaponVariant||e.src||'unknown')+':'+(e.delivery||'direct');
   bossRecord.damageSources=bossRecord.damageSources||{};
   const parts=e.dotSources&&Object.keys(e.dotSources),total=parts&&parts.reduce((n,id)=>n+e.dotSources[id],0);
   if(total>0)for(const id of parts){const source=id+':dot';bossRecord.damageSources[source]=(bossRecord.damageSources[source]||0)+e.bossHit.applied*e.dotSources[id]/total;}
   else bossRecord.damageSources[key]=(bossRecord.damageSources[key]||0)+e.bossHit.applied;
   (bossRecord.contacts||(bossRecord.contacts=[])).push({t:s.runT-bossRecord.start,source:key,applied:e.bossHit.applied,exposed:!!e.bossHit.exposed});
  }
  if(bossRecord&&(e.type==='bossWindup'||e.type==='bruteRoar'&&e.boss))bossRecord.attacks.push({t:s.runT-bossRecord.start,act:e.act||e.move||e.attack||'charge',...e});
  if(bossRecord&&e.type==='bossDie'){bossRecord.deathAt=s.runT;bossRecord.fightSeconds=s.runT-bossRecord.start;}
  if(bossRecord&&e.type==='bossPhase')bossRecord.phases.push({t:s.runT-bossRecord.start,...e});
 }
 const b=s.dir.trialBoss||s.gen&&s.gen.boss;
 if(bossRecord&&b&&!b.dead&&b.exposed&&(!bossRecord.openings.length||s.runT-bossRecord.openings[bossRecord.openings.length-1].t>.3))bossRecord.openings.push({t:s.runT,distance:Math.hypot(b.x-s.hero.x,b.y-s.hero.y)-b.r,remaining:b.ai.t});
 return events;
};
const makeOffer=P.Progression.makeOffer,choose=P.Progression.choose;
P.Progression.makeOffer=function(s){const offer=makeOffer.apply(this,arguments);lastOffer=offer.cards.map(c=>({id:c.id,item:c.item,rank:c.next,recipe:!!c.recipe}));return offer;};
P.Progression.choose=function(s,c){experienceTrace.cards.push({at:s.runT,chosen:c.id,item:c.item,rank:c.next,evolution:c.evo,offerProvenance:"Most recent makeOffer snapshot; a direct chest choice can have a separate source. Not a choice-ownership assertion.",offerContainsChosenId:lastOffer.some(o=>o.id===c.id),offer:lastOffer});return choose.apply(this,arguments);};
function output(data){console.log(JSON.stringify(data));}
function play(level,seed,lo,first=false){forcedLoadout=lo||null;const r=level===1?runL1(seed,first):runGen(level,seed,lo);forcedLoadout=null;return r;}
function compact(r){return {terminal:{mode:current.mode,x:current.hero.x,y:current.hero.y,hp:current.hero.hp,pendingLevels:current.pendingLevels,pendingChests:current.pendingChests,milestone:current.milestone?{kind:current.milestone.kind,open:current.milestone.open,target:P.RouteMilestones.target(current),carrying:!!current.milestone.carry,delivered:current.milestone.delivered}:null},bossOutcome:!bossRecord?(![1,2,3,4,5,10,15,20,25,30].includes(current.levelIndex)?'no-authored-boss':r.result==='lose'?'death-before-entry':'entry-not-reached'):bossRecord.deathAt!=null?'boss-defeated':r.result==='lose'?'death-in-fight':r.result==='timeout'?'timeout-in-fight':'fight-unresolved',fightElapsed:bossRecord?(bossRecord.deathAt!=null?bossRecord.fightSeconds:current.runT-bossRecord.start):null,result:r.result,time:r.t,deaths:r.deaths,hp:r.hp,kills:r.kills,err:r.err,stuck:r.stuck,deathCause:current.deathCause,
 damageBy:r.dmgBy,arenaDamage:r.arenaDmg,arenaSource:r.arenaSrc,showdown:r.showdown,levelUps:r.lvTimes,
 evolutionUse:current.evolutionUse,evolvedAt:current.evolvedAt,weapons:current.hero.weapons,passives:current.hero.passives,
 terrainSeen:current.ws&&current.ws.seen,envStats:current.env&&current.env.stats,
 worldDecision:{choice:P.LocalChoices.record(current),site:current.streetSite?{used:!!current.streetSite.used,x:current.streetSite.x,y:current.streetSite.y,propAlive:current.streetSite.prop.alive,propX:current.streetSite.prop.x,propY:current.streetSite.prop.y,placed:!!current.streetSite.prop.street.placed}:null,
 domino:current.dramaSpace&&current.dramaSpace.domino?{alive:current.dramaSpace.domino.alive,hp:current.dramaSpace.domino.hp,x:current.dramaSpace.domino.x,y:current.dramaSpace.domino.y}:null},experienceTrace,bossRecord};}
if(args.audit==='upgrade-save') {
 P.Settings=P.Settings||{};const M=P.Meta;M.reset();let last=null,finished=false;
 for(let level=1;level<=5&&!finished;level++)for(let attempt=0;attempt<5&&!finished;attempt++){
  const r=play(level,42+attempt,M.loadout(),false),s=current,won=r.result==='win';
  M.onResults({runId:'experience-upgrade-'+level+'-'+attempt,outcome:won?'win':'lose',levelIndex:level,won,stars:won?P.Objectives.goals(s,true).filter(g=>g.on).length:0,
   coins:s.jeton,kills:s.kills,timeS:s.runT,tally:s.tally,reviveUsed:false,hero:'arda',mode:'normal'});
  last={level,attempt,...compact(r)};if(won&&level===1)P.Settings.l1Cleared=true;
  const stats=M.heroStats('arda');finished=M.treeState().sc>0&&Object.values(stats.ready).some(n=>n>0);
  if(won)break;
 }
 if(!finished)throw Error('No earned ready-rank/eligible-perk save');
 output({origin:'Real no-spend/no-ad/no-revive L1 onward progression, stopping at earned readiness and SC; no rank allocation or perk purchase yet',save:M.state(),result:last});
} else if(args.audit==='campaign') {
 P.Settings=P.Settings||{}; const M=P.Meta;M.reset();
 if(args['resume-save'])Object.assign(M.state(),JSON.parse(fs.readFileSync(args['resume-save'],'utf8')));
 if(args.starter&&!M.setStarter(args.starter))throw Error('Requested starter is not earned in the resumed save');
 for(let level=+args['from-level']||1;level<=Math.min(30,+args.through||30);level++) {
  let won=false;
  for(let attempt=0;attempt<Math.min(12,+args.attempts||5)&&!won;attempt++) {
   const seed=(+args['seed-base']||42)+attempt,lo=M.loadout(), saveBefore=JSON.parse(JSON.stringify(M.state())), r=play(level,seed,lo,level===1&&attempt===0);
   won=r.result==='win';const s=current,record=compact(r),goals=P.Objectives.goals(s,won),stars=won?goals.filter(g=>g.on).length:0;
   M.onResults({runId:'experience-'+(args.build||'broad')+'-'+level+'-'+attempt,outcome:won?'win':'lose',levelIndex:level,won,stars,
    coins:s.jeton,kills:s.kills,timeS:s.runT,tally:s.tally,reviveUsed:!!s.reviveUsed,hero:'arda',mode:'normal',marketCover:!!s.kaanRepay,localChoice:P.LocalChoices.record(s)});
   if(won&&level===1)P.Settings.l1Cleared=true;
   const p=M.heroStats('arda'),draft={};
   for(const id of P.CFG.stats.ids){const n=Math.min(p.ready[id]|0,P.CFG.stats.max-p.attr[id]);if(n>0)draft[id]=n;}
   if(!args['bank-growth']&&Object.keys(draft).length)M.allocate(draft);
   const order=P.Tree.ids().sort((a,b)=>P.Tree.node(a).tier-P.Tree.node(b).tier||a.localeCompare(b));
   let changed=!args['bank-growth'];while(changed){changed=false;for(const id of order)if(M.treeLearn(id))changed=true;}
   output({kind:'earnedCampaign',profile:args.build||'broad',resume:args['resume-save']||null,level,attempt,seed,loadout:lo,saveBefore,saveAfter:M.state(),...record,cardPlan:r.auditBuild});
  }
  if(!won){output({kind:'campaignBlocked',level});break;}
 }
} else if(args.audit==='cases') {
 const cases=JSON.parse(fs.readFileSync(args.saves,'utf8'));
 for(const sample of cases){
  P.Meta.reset();if(sample.saveBefore)Object.assign(P.Meta.state(),sample.saveBefore);
  const r=play(sample.level,sample.seed,sample.loadout,false);
  output({kind:'observedCaseReplay',origin:sample.origin,originalProfile:sample.profile,comparisonPolicy:args.build||'broad',priorResult:sample.priorResult,level:sample.level,seed:sample.seed,...compact(r),cardPlan:r.auditBuild});
 }
} else if(args.audit==='sweep') {
 for(let level=1;level<=30;level++)for(const seed of [1,3,42,97]) {
  const r=play(level,seed,P.Power.expectedLoadout(level),false);
  output({kind:'suppliedExpectedPowerSweep',level,seed,...compact(r)});
 }
} else if(args.audit==='boss') {
 const file=args.saves;if(!file)throw Error('--saves required');
 const saves=JSON.parse(fs.readFileSync(file,'utf8'));
 for(const sample of saves) {
  const r=play(sample.level,3,sample.loadout,false);
  output({kind:args['boss-full-health']?'suppliedFullHealthBossComparison':'earnedBossComparison',origin:sample.origin,band:sample.band,policy:args.punish?'punish':'evasive',supplied:args['boss-full-health']?'Only HP restored to actual maximum at actual boss spawn; earned permanent state/run acquisitions retained. No boss HP, invulnerability or outcome supply.':null,level:sample.level,seed:3,...compact(r)});
 }
} else if(args.audit==='evolutions') {
 const rows=fs.readFileSync(args.saves,'utf8').trim().split('\\n').map(JSON.parse).filter(r=>r.result==='win');
 for(const [id,E] of Object.entries(P.CFG.evolutions)){
  if(args.target&&!String(args.target).split(',').includes(id))continue;
  args.evolution=id;args.build=E.from;args.intent='';
  const eligible=(args['evo-levels']?String(args['evo-levels']).split(',').map(Number):[23,28,13,15]).filter(n=>(P.CFG.unlock.weapons[E.from]||1)<=n&&(!E.unlock||E.unlock<=n));
  let useful=false;
  for(let attempt=0;attempt<Math.min(128,+args.evoseeds||16)&&!useful;attempt++){
   const level=eligible[Math.floor(attempt/4)%eligible.length],sample=rows.find(r=>r.level===level);
   P.Meta.reset();Object.assign(P.Meta.state(),sample.saveBefore);
   if(args['evo-starter']&&!P.Meta.setStarter(args['evo-starter']))throw Error('Requested evolution starter was not earned');
   const actualLoadout=args['evo-starter']?P.Meta.loadout():sample.loadout;
   const declared=args['focus-seeds']?String(args['focus-seeds']).split(',').map(Number):null;
   const seed=declared?declared[attempt%declared.length]:attempt<16?[3,42,43,97][attempt%4]:101+(attempt-16)*7919,r=play(level,seed,actualLoadout,false),record=compact(r),use=current.evolutionUse&&current.evolutionUse[id];
   useful=!!(use&&use.hits>0&&use.first_encounter_s!=null&&Object.entries(use.encounters||{}).some(([kind,amount])=>kind!=='cleanup'&&amount>0));
   if(args['meaningful-hits']||args['meaningful-remaining'])useful=!!(useful&&use.hits>=(+args['meaningful-hits']||1)&&r.t-use.acquired_s>=(+args['meaningful-remaining']||0));
   output({kind:'earnedFocusedEvolution',target:id,attempt,origin:args.saves+' L'+level+' seed'+sample.seed+' pre-first-clear earned save',
    level,seed,usefulRemainingEngagement:useful,starterAction:args['evo-starter']?{id:args['evo-starter'],method:'Public Meta.setStarter on the actual earned pre-level history; one rank1 starter replaces Knife. No rank or recipe grant.'}:null,declaredUseCriteria:{minimumHits:+args['meaningful-hits']||1,minimumRemainingSeconds:+args['meaningful-remaining']||0,nonCleanupContextRequired:true},loadout:actualLoadout,...record,cardPlan:r.auditBuild});
  }
 }
} else throw Error('--audit=campaign|sweep|boss|evolutions required');
`;
const mod = new Module(path.join(__dirname,'experience-runtime.cjs'),module);
mod.filename=path.join(__dirname,'experience-runtime.cjs');mod.paths=Module._nodeModulePaths(__dirname);
mod._compile(source+extra,mod.filename);
