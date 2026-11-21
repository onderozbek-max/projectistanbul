// Full HUD, original-time viewport recordings. Every supplied fixture is labelled; no phone claim.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const {weaponFixture}=require('./lib-audit8-fixtures.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8775',label=process.env.AUDIT8_BUILD||'after';
const build=JSON.parse(fs.readFileSync(process.env.AUDIT8_MANIFEST||'reviews/telemetry/audit8-implementation/build.json','utf8'));
const out=path.resolve(process.env.AUDIT9_OUT||'reviews/media/R1/audit8-implementation/'+label),mode=process.argv[2]||'priority';
fs.mkdirSync(out,{recursive:true});
const original=fs.readFileSync(path.join(__dirname,'capture-experience.cjs'),'utf8');
const bossSource=original.slice(original.indexOf('function prepareBoss('),original.indexOf('function prepareWorld('));
const worldSource=original.slice(original.indexOf('function prepareWorld('),original.indexOf('async function actors('));
const indexFile=path.join(out,'index-'+mode+'.json'),index=fs.existsSync(indexFile)?JSON.parse(fs.readFileSync(indexFile)):[];
async function start(b,level=3,cold=false,lang='en'){
 await b.send('Page.navigate',{url:origin+'/?level='+level+'&seed=42&lang='+lang+(cold?'':'&skipintro=1')});
 await b.until(()=>b.evaluate("!!window.P?.debug&&P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'ready');
 if(!cold)await b.evaluate("window.nativePlay=P.Story.play;P.Story.play=function(n,w,d,s){if(w==='intro'){d();return false;}return nativePlay(n,w,d,s);};");
 await b.evaluate("document.getElementById('btn-start').click()",true);
 await b.until(()=>b.evaluate(cold?'P.ColdOpen.active()':"P.debug.state==='play'"),'start');
 if(process.env.AUDIT8_ACCESSIBLE)await b.evaluate('P.Settings.textSize=150;P.Settings.reduceMotion=true;P.Settings.reduceFlash=true;P.Settings.musicVol=0;P.Settings.sfxVol=0;P.applySettings()');
 await b.evaluate(`window.auditEvents=[];window.auditSamples=[];const originalDrain=P.drainEvents;
 P.drainEvents=function(s){const events=originalDrain(s);for(const e of events)if(!['footstep','xp'].includes(e.type))auditEvents.push({t:s.runT,...e});return events;};
 window.auditTimer=setInterval(()=>{const s=P.debug.sim;if(!s)return;const actor=window.auditActor;
 const screen=actor?P.Render?.toScreen?.(actor.x,actor.y):null;
 auditSamples.push({wall:Date.now()/1000,t:s.runT,clock:s.t,state:P.debug.state,hp:s.hero.hp,actor:actor?{id:actor.id,age:actor.age,alive:!actor.dead,x:actor.x,y:actor.y,mode:actor.ai?.m,windup:actor.windup}:null,
 visible:actor?Math.abs(actor.x-P.Fx.cam.x)<P.Fx.cam.w*.47&&Math.abs(actor.y-P.Fx.cam.y)<P.viewHalfH(P.Fx.cam.w)*.8:null});},125);`);
}
async function quiet(b){
 await b.evaluate(`(()=>{const s=P.debug.sim;s.hero.weapons={};s.hero.invuln=Infinity;s.enemies=[];s.enemyTele=[];
 s.hero.x=0;s.hero.y=60;P.Horde.step=()=>{};if(s.env)s.env.portals=[];if(s.milestone)s.milestone.open=true;
 if(s.gen)s.gen.mi=s.gen.marks.length;P.Comic.clearRunDialogue();P.Barks.clear();P.Barks.setEnabled(false);
 P.Fx.reset(s);P.Input.get=()=>({x:0,y:0});})()`);
}
async function capture(b,id,act,supplied,checkActive=true){
 await b.evaluate('auditSamples.length=0;auditEvents.length=0');
 const start=await b.evaluate('P.debug.sim.runT'),r=await recordDOM(b,path.join(out,id+'.mp4'),act);
 await b.shot(path.join(out,id+'.png'));
 const facts=await b.evaluate('({t:P.debug.sim.runT,state:P.debug.state,events:auditEvents,samples:auditSamples,hp:P.debug.sim.hero.hp,weapons:P.debug.sim.hero.weapons,evolutionUse:P.debug.sim.evolutionUse,settings:P.Settings})');
 const inside=facts.samples.filter(x=>x.wall>=r.viewportStart&&x.wall<=r.viewportStart+r.seconds);
 if(checkActive){assert(inside.length>3,'Missing samples inside the actual recording');assert(inside.at(-1).clock-inside[0].clock>r.seconds*.65,'Simulation froze inside the actual video interval');assert(inside.filter(x=>x.state==='play').length>inside.length*.85,'Recorded gameplay obscured by a menu');}
 const frameErrors=b.errors.slice();assert.equal(frameErrors.length,0,frameErrors.join('\n'));
 const row={id,build:label,sourceManifest:(build.runtime_manifest_sha256||build.manifest_sha256),file:id+'.mp4',still:id+'.png',origin,seed:42,framing:'390×844 DPR1, normal HUD, original viewport timestamps, real post-master audio',
 fixture:true,supplied,captured:new Date().toISOString(),...r,startSim:start,recordingSamples:inside,facts,frameErrors};
 const old=index.findIndex(x=>x.id===id);if(old>=0)index.splice(old,1);index.push(row);
 fs.writeFileSync(indexFile,JSON.stringify(index,null,2)+'\n');console.log(id,{seconds:r.seconds,sim: facts.t-start,events:facts.events.length});return row;
}
async function priority(b){
 for(const weapon of ['knife','chain','chainsaw'])for(const rank of [1,5]){
  await start(b);await quiet(b);
  await b.evaluate(`(()=>{const s=P.debug.sim;P.Progression.debugGrant(s,{weapons:{${weapon}:${rank}}});
  for(let i=0;i<8;i++){const a=i*2.399,r=1.1+(i%3)*.35;const e=P.Combat.spawnEnemy(s,'walker',s.hero.x+Math.cos(a)*r,s.hero.y+Math.sin(a)*r,{state:'active'});e.hp=e.maxHp=10000;e.speed=.04;}})()`);
  const r=await capture(b,'contact-'+weapon+'-r'+rank,async()=>{await b.sleep(8000);return{rank,weapon};},'Only the named supplied weapon/rank; eight supplied high-HP walkers, opaque invulnerability, no ambient spawns or XP interruption. Isolated contact diagnostic, not earned power.');
  assert(r.facts.events.some(e=>e.type==='hit'),'No actual contact event');
 }
}
async function bosses(b){
 const levels=(process.env.AUDIT8_LEVELS||'1,2,3,4,5,10,15,20,25,30').split(',').map(Number);
 for(const level of levels){
  await start(b,level);await b.evaluate(`(()=>{${bossSource}prepareBoss(${level});const s=P.debug.sim;s.hero.invuln=Infinity;s.dir.tut.done.t_move=true;
   if(${!!process.env.AUDIT9_BOSS_CLEAN}){s.dir.tut.active=null;s.dir.tut.queue=[];P.Comic.clearRunDialogue();P.Barks.clear();P.Barks.setEnabled(false);
    if(!s.geo)P.Director.step=function(){}; // L1 relocation must not retrigger its approach spawns in this supplied isolation.
   }
   if(${level}>=20&&P.Companion){if(${level}>20){s.loadout=s.loadout||{};s.loadout.kaanJoined=true;}P.Companion.init(s);}
   window.auditActor=s.dir.trialBoss||s.gen?.boss;s.enemies=[auditActor];
   if(${!!process.env.AUDIT9_CLOSE}){s.hero.x=auditActor.x+.65;s.hero.y=auditActor.y-.85;P.World.clampHero(s,s.hero);P.Fx.reset(s);}
   if(s.env)s.env.portals=[];if(s.gen)s.gen.mi=s.gen.marks.length;
   if(${!!process.env.RESET_BOSS_NO_PROP_ACTIONS}&&s.env)s.env.recs.forEach(r=>{r.gripAfter=Infinity});
   if(${!!process.env.RESET_BOSS_HIDE_HUD}){const style=document.createElement('style');style.textContent='#boss-bar{visibility:hidden!important}';document.head.appendChild(style);}
   P.Progression.addXp=()=>{};
   })()`);
  await b.until(()=>b.evaluate('P.SceneFlow.running(P.debug.sim)'),'actual boss entry');
  await b.sleep(2000);
  const row=await capture(b,'boss-L'+level+(process.env.AUDIT9_CLOSE?'-close':''),async()=>{const length=+(process.env.AUDIT9_BOSS_MS||14000);
   if(process.env.AUDIT9_PHASES){await b.sleep(length/2);await b.evaluate('P.Combat.damageEnemy(P.debug.sim,auditActor,auditActor.maxHp*.56,1,0,0,false,"knife")');await b.sleep(length/2);}
   else await b.sleep(length);
   // Keeper can reject contact while its real weight phase is protected. Use the
   // next actual opening rather than mutating HP or bypassing its exposure rule.
   const end=Date.now()+30000;
   while(Date.now()<end){
    const dead=await b.evaluate("(()=>{const s=P.debug.sim,e=window.auditActor;if(!e.dead)P.Combat.damageEnemy(s,e,e.hp*20,1,0,1,false,'knife');return e.dead;})()");
    if(dead)break;await b.sleep(150);
   }
   await b.sleep(level>=20?8500:2000);
   return{level,realDefeat:true};
  },'Real boss entry/AI; supplied observation position, opaque invulnerable observer without weapons, no XP interruption and joined-companion starting preconditions for L25/30. '+(process.env.RESET_BOSS_NO_PROP_ACTIONS?'Automatic optional prop lift/strike disabled for this supplied observer by grip lock; actual scene geometry/props and boss-owned summons remain. ':'')+(process.env.AUDIT9_BOSS_CLEAN?'Stale tutorial/ambient speech and L1 approach Director updates disabled solely for clean tool/body inspection; actual boss AI and boss-owned summons remain. Ordinary earned counterparts retain their native route/dialogue. ':'')+(process.env.RESET_BOSS_HIDE_HUD?'Boss name/health strip hidden for silhouette/source review. ':'')+(process.env.AUDIT9_PHASES?'Actual supplied hit at midpoint attempts the later HP phase. ':'')+'Actual supplied lethal contact after '+(+(process.env.AUDIT9_BOSS_MS||14000)/1000)+' seconds, waiting for real protection to end if needed. Not an earned fight.',false);
  assert(row.facts.events.some(e=>e.type==='bossDie'));
  assert(row.facts.t-row.startSim>10,'Boss fixture clock did not advance');
  assert(row.facts.samples.filter(x=>x.state==='play'&&x.visible).length>45,'Boss action not visibly active');
 }
}
async function cold(b){
 for(const lang of ['tr','en']){
  await b.send('Page.navigate',{url:origin+'/?level=1&seed=42&lang='+lang});
  await b.until(()=>b.evaluate("!!window.P?.debug&&P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'fresh opening title');
  const save=await b.evaluate('P.Meta.state()'),id='fresh-opening-'+lang;
  const film=await recordDOM(b,path.join(out,id+'.mp4'),async()=>{
   await b.sleep(800);const p=await b.evaluate('(()=>{const r=document.getElementById("btn-start").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');
   await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});
   await b.until(()=>b.evaluate('P.ColdOpen.active()'),'opening starts');
   await b.until(()=>b.evaluate('P.debug.sim.enemies.some(e=>e.dinerIndex===0&&e.state==="turning")'),'resident conversion');
   await b.sleep(500);await b.shot(path.join(out,id+'-conversion.png'));
   await b.until(()=>b.evaluate('!P.ColdOpen.active()'),'knife and return to play',60000);
   const before=await b.evaluate('({x:P.debug.sim.hero.x,y:P.debug.sim.hero.y})');
   await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW',windowsVirtualKeyCode:87});await b.sleep(1800);
   await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW',windowsVirtualKeyCode:87});
   await b.shot(path.join(out,id+'-control.png'));return{before,after:await b.evaluate('({x:P.debug.sim.hero.x,y:P.debug.sim.hero.y})')};
  });
  index.push({id,file:id+'.mp4',sourceManifest:build.runtime_manifest_sha256,fixture:false,lang,seed:42,saveBefore:save,
   supplied:'No power/save/actor/outcome supply. Fresh first-entry cutscene and actual Start/keyboard movement; audio recorder setup unlocks the capture context. This is a bounded opening sample, not a level clear.',...film,errors:b.errors.slice()});
  fs.writeFileSync(indexFile,JSON.stringify(index,null,2)+'\n');console.log(id,film.seconds);
 }
}
async function roles(b){
 const list=['walker','diner','runner','crawler','brute','hardhat','spitter','zehirli','screamer','bloater','kasap','parkur','copci','cayci','kurye','marti'];
 for(const role of list){
  // Each role starts a completely new simulation. No cards, tally, actor clock or events leak from the previous fixture.
  await start(b);await quiet(b);
  await b.evaluate(`(()=>{const s=P.debug.sim;window.auditActor=P.Combat.spawnEnemy(s,${JSON.stringify(role)},1.4,64,{state:'active'});auditActor.hp=auditActor.maxHp=10000;})()`);
  const row=await capture(b,'enemy-'+role,async()=>{await b.sleep(7000);await b.shot(path.join(out,'enemy-'+role+'-active.png'));
   await b.evaluate("(()=>{const s=P.debug.sim,e=auditActor;if(!e.dead)P.Combat.damageEnemy(s,e,e.hp*20,1,0,1,false,'knife');})()");await b.sleep(1800);
  },'One supplied live role, opaque invulnerable observer, no weapons/ambient spawns. Actual supplied lethal hit after seven seconds if the role did not naturally burst. Additional zehirli/kasap fixtures are not claims of natural first-30 spawns.');
  assert(row.facts.samples.filter(x=>x.visible&&x.actor?.alive).length>20,'Named actor absent/frozen');
  assert(row.facts.t-row.startSim>7,'Role time did not advance through the expected interval');
 }
}
async function health(b){
 await start(b);await quiet(b);
 await capture(b,'health-critical-heal-full',async()=>{
  await b.evaluate("(()=>{const s=P.debug.sim;s.hero.invuln=0;s.hero.iframes=0;P.Combat.damageHero(s,s.hero.hp*.78,'walker',{type:'walker',x:1,y:60});})()");await b.sleep(2000);
  await b.evaluate("(()=>{const s=P.debug.sim;s.drops.push({kind:'simit',value:35,uncapped:true,x:.7,y:60,mag:false,pop:0});P.Input.get=()=>({x:P.debug.sim.hero.x<.6?1:0,y:0});})()");await b.sleep(2200);
  await b.shot(path.join(out,'health-recovered.png'));
  await b.evaluate("(()=>{const s=P.debug.sim;P.Input.get=()=>({x:0,y:0,skill:s.sk.act.t<=0&&s.sk.act.cd<=0});})()");await b.sleep(180);
  await b.evaluate("(()=>{const s=P.debug.sim;P.Input.get=()=>({x:0,y:0});s.hero.iframes=0;s.hero.invuln=0;P.Combat.damageHero(s,10,'walker',{type:'walker',x:1,y:60});})()");await b.sleep(800);
  await b.shot(path.join(out,'health-real-shield-block.png'));
  const left=await b.evaluate('P.debug.sim.sk.act.t');await b.sleep((left+.2)*1000);
  await b.evaluate("(()=>{const s=P.debug.sim;s.hero.iframes=0;s.hero.invuln=0;P.Combat.damageHero(s,5,'walker',{type:'walker',x:1,y:60});s.drops.push({kind:'simit',value:10,uncapped:true,x:s.hero.x,y:s.hero.y,mag:false,pop:0});})()");await b.sleep(1200);
  await b.shot(path.join(out,'health-simultaneous-delta.png'));
  await b.evaluate("(()=>{const s=P.debug.sim;P.Input.get=()=>({x:0,y:0});s.hero.hp=s.hero.maxHp;s.drops.push({kind:'simit',value:20,x:s.hero.x,y:s.hero.y,mag:false,pop:0});})()");await b.sleep(2000);
  await b.shot(path.join(out,'health-full-saved.png'));
  return b.evaluate("({saved:P.debug.sim.drops.some(d=>d.kind==='simit'),gains:auditEvents.filter(e=>e.type==='pickup'&&e.healed>0).map(e=>e.healed)})");
 },'Quiet supplied L3 lane; real positive damage, actual food pickup by movement, real active shield and blocked contact, positive damage plus food together, then explicitly supplied full HP for zero-benefit saved-food. Not earned healing evidence.');
}
async function car(b){
 await start(b,13);await quiet(b);
 await b.evaluate(`(()=>{const s=P.debug.sim,r=s.env.recs.find(r=>P.Env.isCar(r.kind));if(!r)throw Error('No authored roadside car');
  window.actualCar=r;s.hero.x=r.x-2;s.hero.y=r.y-2.8;P.World.clampHero(s,s.hero);P.Fx.reset(s);
 })()`);
 const r=await capture(b,'parked-car-real-combo',async()=>{
  await b.sleep(1800);await b.shot(path.join(out,'parked-car-aligned.png'));
  await b.evaluate(`(()=>{const s=P.debug.sim,c=actualCar;P.Progression.debugGrant(s,{weapons:{canister:5}});P.Progression.evolve(s,{evo:'canister',item:'carbomb'});
   for(let i=0;i<12;i++){const e=P.Combat.spawnEnemy(s,'walker',c.x-.7+Math.cos(i)*.3,c.y+Math.sin(i)*.5,{state:'active'});e.hp=e.maxHp=2000;e.speed=.03;}})()`);
  await b.sleep(7200);return b.evaluate('({carKind:actualCar.kind,alive:actualCar.alive,source:{x:actualCar.x,y:actualCar.y,w:actualCar.b.w,h:actualCar.b.h},seen:P.Weapons6.seen(P.debug.sim,"canister","car")})');
 },'Actual authored L13 roadside car; supplied nearby opaque observer and CarBomb/targets solely for combo inspection. Current north-up art and true footprint; no car, terrain-seen flag, fuse or explosion supplied.');
 assert(r.facts.events.some(e=>e.type==='envHit'&&e.kind==='car'),'Real car contact missing');
 assert(r.facts.events.some(e=>e.type==='envExplode'),'Actual car consequence missing');
}
async function dense(b){
 await start(b,14);await quiet(b);
 await b.evaluate(`(()=>{const s=P.debug.sim,h=s.hero;
  h.weapons={};h.passives={};P.Progression.debugGrant(s,{weapons:{knife:5,canister:5,chain:5,extinguisher:5,molotov:5,chainsaw:5},passives:{jacket:5,gloves:5,nazar:5,magnet:5,medkit:5,kolonya:5}});
  const roles=['walker','runner','bloater','spitter','brute','screamer','hardhat','crawler'];
  for(let i=0;i<64;i++){const a=i*2.399,r=1.7+(i%9)*.36,e=P.Combat.spawnEnemy(s,roles[i%roles.length],h.x+Math.cos(a)*r,h.y+Math.sin(a)*r,{state:'active'});e.hp=e.maxHp=10000;}
  P.Progression.addXp=()=>{};
 })()`);
 const row=await capture(b,'dense-six-slots',async()=>{await b.sleep(12000);await b.shot(path.join(out,'dense-six-slots-action.png'));},
  'Supplied legal six weapon/six passive slots at rank5, 64 high-HP mixed live AI enemies, opaque invulnerable observer and no XP. Actual enemy commitments/weapon contacts; default or declared reduced/muted settings. Not earned difficulty or phone proof.');
 assert.equal(Object.keys(row.facts.weapons).length,6);assert(row.facts.events.some(e=>e.type==='hit'));
}
async function arsenal(b){
 const roster=await b.evaluate('({base:P.CFG.arsenal.weapons,evo:Object.keys(P.CFG.evolutions)})');
 const selected=process.env.AUDIT9_WEAPONS?.split(','),ranks=(process.env.AUDIT9_RANKS||'1,3,5').split(',').map(Number);
 for(const id of roster.base.filter(id=>!selected||selected.includes(id)))for(const rank of ranks) {
  await start(b);await quiet(b);await b.evaluate('('+weaponFixture+')('+JSON.stringify(id)+','+rank+',false)');
  const r=await capture(b,'weapon-'+id+'-r'+rank,async()=>{await b.sleep(6500);},'Named supplied base/rank only; 28 supplied live high-HP enemies, opaque invulnerability, no cards/ambient spawns. Full ordinary HUD.');
  assert(r.facts.events.some(e=>e.type==='hit'),'No target contact: '+id);
 }
 for(const id of process.env.AUDIT9_NO_EVOS?[]:roster.evo){
  await start(b);await quiet(b);await b.evaluate('('+weaponFixture+')('+JSON.stringify(id)+',5,true)');
  const r=await capture(b,'evolution-'+id,async()=>{await b.sleep(10000);},'Supplied evolution and 28 real high-HP targets; actual suitable hardhat, wet patch, car, spit or Nazar contact as applicable; half HP for capped healing. No earned-acquisition claim.');
  await b.evaluate('clearInterval(window.conditionTimer)');
  assert((r.facts.evolutionUse[id]?.hits||0)>0,'No attributed evolution effect: '+id);
  if(id==='foamstorm')assert((r.facts.evolutionUse[id]?.control?.blocked_spit||0)>0,'No intercepted real spit');
  if(id==='stormshield')assert(r.facts.events.some(e=>e.type==='nazarDodge'),'No real defensive trigger');
  if(id==='carbomb')assert(r.facts.events.some(e=>e.type==='envHit'&&e.kind==='car'),'No actual car contact');
 }
}
async function nazarTrigger(b){
 await start(b);await quiet(b);
 await b.evaluate(`(()=>{(${weaponFixture})('stormshield',5,true);const s=P.debug.sim,h=s.hero;h.invuln=Infinity;
 s.enemies.forEach((e,i)=>{const a=i*2.399;e.x=h.x+Math.cos(a)*1.8;e.y=h.y+Math.sin(a)*1.8;});})()`);
 await b.sleep(2500); // Let the ordinary evolution announcement finish before inspecting a later real dodge.
 const r=await capture(b,'nazar-connected-discharge',async()=>{
  await b.sleep(850);
  await b.evaluate(`(()=>{const s=P.debug.sim,h=s.hero;h.invuln=0;h.iframes=0;
   s.enemies.slice(0,6).forEach((e,i)=>{e.x=h.x+Math.cos(i)*.58;e.y=h.y+Math.sin(i)*.58;});})()`);
  await b.sleep(8500);
 },'Supplied Stormshield/Nazar5 and 28 high-HP live targets. Contact geometry is moved next to Arda only after the recorder starts; actual enemy contact and real Nazar roll cause the discharge. No forced dodge, manual Dash trigger or earned-acquisition claim.');
 const lo=r.recordingSamples[0].t,hi=r.recordingSamples.at(-1).t;
 const dodge=r.facts.events.find(e=>e.type==='nazarDodge'&&lo<=e.t&&e.t<=hi);
 assert(dodge,'Nazar dodge must occur inside the retained film, not during preparation');
 assert(r.facts.events.some(e=>e.type==='stormZap'&&Math.abs(e.t-dodge.t)<.04),'Dodge did not cause the actual connected discharge');
}
async function world(b){
 const levels=(process.env.AUDIT8_LEVELS||Array.from({length:30},(_,i)=>i+1).join(',')).split(',').map(Number);
 for(const level of levels){
  await start(b,level);await b.evaluate(`(()=>{${worldSource}prepareWorld(${level});const s=P.debug.sim;s.dir.tut.done.t_move=true;s.hero.invuln=Infinity;P.Progression.debugGrant(s,{weapons:{knife:5}});
   if(${level}===2&&!s.gen.tramControl){const C=P.CFG.levels.tramStop,H=P.Hack.place(s,'tram',C.x,C.y);H.trackX=C.trackX;H.r=C.r;s.gen.tramControl=H;}
   const q=P.RouteMilestones.target(s);if(q){s.hero.x=q[0];s.hero.y=q[1]-2.7;P.World.clampHero(s,s.hero);}
   window.worldMove=P.Input.get;P.Input.get=()=>({x:0,y:0});
   if(${level}===2)worldMove=()=>{const H=s.gen.tramControl,d=Math.hypot(H.x-s.hero.x,H.y-s.hero.y);return d<.3?{x:0,y:0}:{x:(H.x-s.hero.x)/d,y:(H.y-s.hero.y)/d};};
  })()`);
  const row=await capture(b,'world-L'+level,async()=>{
   const limit=Date.now()+65000;let opened=false;
   await b.evaluate('P.Input.get=worldMove');
   while(Date.now()<limit){
    const q=await b.evaluate('({done:P.debug.sim.milestone?P.debug.sim.milestone.open:P.debug.sim.props.shutterOpen,state:P.debug.state})');
    if(q.state==='cards')await b.evaluate('document.querySelector("#cards .card .mod-opt,#cards button.card")?.click()');
    if(q.state==='chest')await b.evaluate('document.querySelector("#chest-choices .mod-opt")?.click();document.getElementById("btn-chest-continue").click()');
    if(q.done){opened=true;await b.sleep(8000);break;}await b.sleep(250);
   }
   return{opened};
  },'Position supplied at the first real required target; actual route-action inputs, supplied rank5 knife and opaque invulnerability for guard clearance, no ambient horde. L1 uses a labelled supplied lethal hit. This proves action lifecycle, not ordinary difficulty.',false);
  assert(row.outcome.opened,'L'+level+' actual world action did not open its route');
 }
}
async function main(){
 const b=await openBrowser(origin+'/?lang=en');
 try{if(mode==='priority')await priority(b);else if(mode==='bosses')await bosses(b);else if(mode==='roles')await roles(b);else if(mode==='health')await health(b);else if(mode==='car')await car(b);else if(mode==='dense')await dense(b);else if(mode==='arsenal')await arsenal(b);else if(mode==='trigger')await nazarTrigger(b);else if(mode==='world')await world(b);else if(mode==='cold')await cold(b);else throw Error('Unknown mode: '+mode);}
 finally{await b.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
