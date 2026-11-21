// Actual delayed contacts, pre-death ownership, spatial consequences and planted view contacts.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {loadP,ROOT}=require('./lib-load'),app=loadP(),dt=1/60;
function run(id,rank){const s=app.createSim(42,{levelIndex:1,tramRhythm:true});app.startPlay(s);
 s.enemies=[];s.hero.x=0;s.hero.y=50;s.hero.weapons={[id]:rank};s.hero.passives={};s.events=[];return s;}
function target(s,x,y){const e=app.Combat.spawnEnemy(s,'walker',x,50+y,{state:'active'});e.hp=e.maxHp=10000;return e;}
function step(s,fn,time){for(let i=0;i<Math.ceil(time/dt);i++){fn(s,dt);s.t+=dt;}}
for(const rank of[1,3,5]){
 const s=run('knife',rank),front=target(s,1,0),rear=target(s,-1.1,0);
 step(s,app.WeaponsKnife.step,.02);assert.equal(front.hp,front.maxHp,'No contact during load');
 step(s,app.WeaponsKnife.step,.15);assert(front.hp<front.maxHp,'The real front cut lands');
 assert(s.events.filter(e=>e.type==='swing').every(e=>e.tag==='blade'),'Actual cut events retain their blade synergy/material category');
 assert.equal(rear.hp,rear.maxHp,'A rear target is not hit by the front cut');
 step(s,app.WeaponsKnife.step,.23);
 assert.equal(rear.hp<rear.maxHp,rank>=3,'Rear coverage requires the real second backhand');
}
{
 const s=run('knife',1),e=target(s,1,0);step(s,app.WeaponsKnife.step,.02);e.x=9;
 step(s,app.WeaponsKnife.step,.40);assert.equal(e.hp,e.maxHp,'Target loss does not produce a remote hit');
 assert.equal(s.ws.knifeSwing,null,'Miss finishes its recovery');
}
{
 const s=run('cleaver',1),front=target(s,1,0),rear=target(s,-1.4,.01);
 step(s,app.WeaponsCleaver.step,.12);assert.equal(front.hp,front.maxHp);
 step(s,app.WeaponsCleaver.step,.42);assert(front.hp<front.maxHp);
 assert.equal(rear.hp,rear.maxHp,'240-degree committed cut is not the retired 360-degree orbit');
 const dealt=front.maxHp-front.hp;step(s,app.WeaponsCleaver.step,.15);
 assert.equal(front.maxHp-front.hp,dealt,'One cut cannot repeatedly hit the same body');
}
{
 const s=run('sledge',1),e=target(s,5,0);step(s,app.Weapons2.step,.51);
 const slam=s.ws.slams[0];assert(slam.ground,'Slam has an actual local ground-strike source');
 assert(slam.ground.x<1&&slam.ground.x>0);assert.equal(e.hp,e.maxHp,'Distant damage waits for propagation');
 step(s,app.Weapons2.step,.4);assert(e.hp<e.maxHp,'The arriving pulse hits the actual target');
}
const ids=['cook','switchkeeper','roaster','linekeeper','vatman','bellkeeper','dockBride','bigFisher','quayCaptain','ticketMan'];
{
 const s=run('knife',1),e=app.Bosses.spawn(s,'kasapBoss',.8,52,{preset:'cook',hoodIdx:0});
 e.state='active';e.ai.cd=0;e.hp=1;s.hero.invuln=0;
 app.Combat.damageEnemy(s,e,10000,1,0,0,false,'knife');assert(e.dead);
 const age=e.age,walk=e.walk,hp=s.hero.hp;
 app.Combat.updateEnemies(s,dt);app.Enemies.frame(s,2);
 assert.equal(e.age,age,'An actor killed before the AI pass cannot act again');assert.equal(e.walk,walk);
 assert(!s.enemyTele.some(t=>t.owner===e.id),'A dead boss cannot re-arm a warning after death cleanup');
 assert.equal(s.hero.hp,hp,'A pre-AI lethal contact cannot leave a ghost strike');
}
{
 const s=app.createSim(42,{levelIndex:3,tramRhythm:true});app.startPlay(s);
 const e=app.Bosses.spawn(s,'brute',1,s.geo.holdY,{preset:'roaster',hoodIdx:0});
 app.IstiklalTrial.attack(s,e,e.ai,app.CFG.bosses.roaster,'roast',function(t){return t;});
 assert(s.e3.blades.length>0,'Actual Roaster attack releases embers');
 assert(s.e3.blades.every(b=>b.owner===e.id),'Every released ember retains its factual owner');
 app.Bosses.onDeath(s,e);assert.equal(s.e3.blades.length,0,'Defeat removes released embers before the protected clock stops');
}
for(const id of ids){
 const s=run('knife',1),e=app.Bosses.spawn(s,'brute',1,52,{preset:id,hoodIdx:0});
 Object.assign(e.ai,{m:'windup',act:id==='cook'?'throw':'charge',t:.43,W:1.1,dir:{x:.6,y:.8}});e.windup=.39;
 e.dockRope={x:1,y:52,start:.2,span:4,r:3,t:.3,T:.9};e.dockCarts=[{x:2,y:55}];
 s.enemyTele=[{owner:e.id,then:'swing'},{owner:999,then:'swing'}];
 s.e3={blades:[{owner:e.id},{owner:999}]};app.Bosses.onDeath(s,e);
 const body=s.events.find(q=>q.type==='bossDie').body;
 assert.equal(body.deathPose.ai.m,'windup');assert.equal(body.deathPose.ai.t,.43);
 assert.equal(body.deathPose.windup,.39);assert.equal(body.deathPose.dockRope.t,.3);
 e.ai.dir.x=99;assert.equal(body.deathPose.ai.dir.x,.6,'Death snapshot owns its factual direction');
 assert.deepEqual(s.enemyTele.map(q=>q.owner),[999]);assert.deepEqual(s.e3.blades.map(q=>q.owner),[999]);
 assert.equal(e.dockRope,null);assert.deepEqual(e.dockCarts,[]);
}
{
 const s=app.createSim(42,{levelIndex:23,tramRhythm:true});app.startPlay(s);const m=s.milestone,q=m.sacks[0];
 assert(s.props.routeEdges.some(r=>q.x>r.xMin&&q.x<r.xMax&&q.y>r.yMin&&q.y<r.yMax));
 Object.assign(s.hero,{x:q.x,y:q.y});app.RouteMilestones.step(s,dt);assert.equal(m.carry,q);
 assert(!s.props.routeEdges.some(r=>q.x>r.xMin&&q.x<r.xMax&&q.y>r.yMin&&q.y<r.yMax),'Pickup clears that painted sack footprint');
 Object.assign(s.hero,{x:m.pallet.x,y:m.pallet.y-.8});app.RouteMilestones.step(s,dt);assert.equal(m.delivered,1);
 assert(s.props.routeEdges.some(r=>m.pallet.x>r.xMin&&m.pallet.x<r.xMax),'Delivered pallet becomes a real obstruction');
}
{
 const s=app.createSim(42,{levelIndex:28,tramRhythm:true});app.startPlay(s);const m=s.milestone,K=app.CFG.levels.sirkeciMilestones.clock;
 m.open=true;m.opening=1;s.hero.y=m.y-3;
 app.SirkeciTrial.post(s,m,.1);assert.equal(m.clockGate.opening,1);
 m.clockGate.t=K.openT+K.closeT+.1;app.SirkeciTrial.post(s,m,dt);assert.equal(s.props.routeEdges.length,1);
 s.hero.y=m.y;app.SirkeciTrial.post(s,m,dt);assert.equal(m.clockGate.opening,1,'A body in the threshold prevents closing');assert.equal(s.props.routeEdges.length,0,'Safety also releases the actual collision');
 s.hero.y=m.y+2;app.SirkeciTrial.post(s,m,dt);assert(m.clockGate.passed);assert.equal(s.props.routeEdges.length,0);
}
{
 const s=app.createSim(42,{levelIndex:4,tramRhythm:true});app.startPlay(s);
 const m=s.milestone;assert.equal(m.wireScreens.length,2);assert.equal(s.props.routeEdges.length,2);
 const first=m.wireScreens[0].box,second=m.wireScreens[1].box;assert(first.xMin<second.xMin&&first.xMax<second.xMax,'Cuts control different sides of the approach');
 for(let i=0;i<3;i++){const it=s.obj.items[i];s.hero.x=it.x;s.hero.y=it.y;s.hero.moving=false;
  assert(app.RouteMilestones.cut(s,it,2));it.got=true;
  assert.equal(s.props.routeEdges.length,Math.max(0,1-i),'Each real cable cut removes its own physical screen');}
}
{
 const s=app.createSim(42,{levelIndex:13,tramRhythm:true});app.startPlay(s);const car=s.env.recs.find(r=>app.Env.isCar(r.kind));assert(car);
 s.hero.weapons={canister:5};app.Env.fuse(s,car,'hit',1.5);const hp=car.hp,t=car.fuseT,A=app.Mods.act(s,'canister');
 app.Mods.blast(s,car.x-2,car.y,1.6,20,0,'canister',A);
 assert(app.Weapons6.seen(s,'canister','car'),'A real blast touching a still-live burning car records actual terrain contact');
 assert.equal(car.hp,hp,'Contact credit cannot damage a fused car');assert.equal(car.fuseT,t,'Contact credit cannot shorten the actual fuse');
 delete s.ws.seen['canister:car'];app.Mods.blast(s,car.x-8,car.y,1.6,20,0,'canister',A);
 assert(!app.Weapons6.seen(s,'canister','car'),'A miss never credits the nearby scenery');
 car.alive=false;app.Mods.blast(s,car.x,car.y,1.6,20,0,'canister',A);assert(!app.Weapons6.seen(s,'canister','car'),'An exploded car cannot grant future contact credit');
}
app.StreetArt={current:()=>true,image:()=>({})};
{
 const s=app.createSim(42,{levelIndex:6,tramRhythm:true});app.startPlay(s);
 const r=s.streetSite.prop,home={x:r.x,y:r.y};s.streetSite=null;
 app.Env.liftCover(s,r);app.Env.step(s,dt);
 assert(!s.env.recs.includes(r),'Ordinary environment cleanup prunes the lifted prop record');
 assert(app.Env.returnCover(s,r,home.x,home.y));
 assert.equal(s.env.recs.filter(p=>p===r).length,1,'A dropped object must rejoin world rendering, damage and proximity queries exactly once');
 assert(!app.Env.returnCover(s,r,home.x,home.y));assert.equal(s.env.recs.filter(p=>p===r).length,1);
 s.hero.x=r.x;s.hero.y=r.y-r.b.h/2-.3;s.hero.moving=false;s.hero.dashing=false;s.hero.sinceHit=99;
 step(s,app.StreetWeapon.step,.65);assert.equal(s.streetWeapon.r,r,'A real dropped object can be picked up again after cleanup');
}
for(const file of['boss-performance','boss-puppet'])vm.runInThisContext(fs.readFileSync(ROOT+'/js/view/'+file+'.js','utf8'),{filename:file});
for(const id of ids)for(const mode of ['walk','windup','charge','pause']){
 const e={bossPreset:id,x:1,y:52,age:3,walk:.3,windup:.63,ai:{m:mode,act:id==='cook'?'throw':'charge',dir:{x:1,y:0},t:.3,W:1}};
 const original=app.BossPerformance.pose(e,{}),body={bossPreset:id,deathPose:app.BossDeathState.capture(e)};
 const dead=app.BossPerformance.pose(body,{defeatProgress:0});
 for(const key of ['hand','off'])assert.deepEqual(dead[key],original[key],id+' '+mode+' starts defeat at the factual '+key);
 assert.equal(dead.roll,original.roll,id+' '+mode+' has no killing-blow torso snap');
}
const c=new Proxy({},{get(){return function(){};}});
vm.runInThisContext(fs.readFileSync(ROOT+'/js/view/kaan-actor.js','utf8'),{filename:'kaan-actor'});
{
 const s=app.createSim(42,{levelIndex:20,tramRhythm:true});app.startPlay(s);app.Companion.init(s);
 const k=s.companion,a={kind:'joining',t:2,stage:{lead:1.2,approach:2,pause:1.8,leaving:false}};
 const facts=()=>JSON.stringify({t:s.t,runT:s.runT,hero:s.hero,companion:s.companion,loadout:s.loadout});
 const before=facts(),guard=app.KaanActor.pose(s,k,a);
 assert.equal(guard.lowering,0,'Fish stays raised while Kaan is still approaching');
 a.t=3.6;assert.equal(app.KaanActor.pose(s,k,a).lowering,0,'Kaan keeps the fish raised until the native response has been read');
 a.storyDone=true;const arriving=app.KaanActor.pose(s,k,a);assert(arriving.lowering>0&&arriving.lowering<1,'Recognition lowers through connected intermediate hand/tool positions after the response');
 a.t=4.7;const relaxed=app.KaanActor.pose(s,k,a);assert.equal(relaxed.lowering,1);
 assert.notEqual(guard.tool,relaxed.tool);assert.notDeepEqual(guard.hand,relaxed.hand);
 assert.equal(facts(),before,'Acting does not grant join facts, change clocks or move actors');
 app.BossPuppet.reset();const R={ctx:c,ppm:40,X:x=>40*x,Y:y=>-40*y};
 app.KaanActor.draw(R,s,k,a);const first=app.KaanActor.last.contacts;
 k.x+=.02;k.walk+=.02;k.moving=true;a.t+=.02;app.KaanActor.draw(R,s,k,a);const next=app.KaanActor.last.contacts;
 assert(Math.abs(first.feet[0].x-next.feet[0].x)<1e-8,'Kaan keeps a real support contact while his body advances');
 assert(Number.isFinite(next.tipX)&&Number.isFinite(next.tipY));
 a.kind='farewell';a.t=1;assert.equal(app.KaanActor.pose(s,k,a).headCell,12,'Farewell uses the bowed current head rather than an idle front swap');
 assert(!k.joined,'Drawing the recognition cannot settle the relationship');
}
for(const id of ids){
 app.BossPuppet.reset();const e={id:7,x:0,y:0,age:0,walk:.1,dvx:1,dvy:0,bossPreset:id,ai:{m:'walk',dir:{x:1,y:0}}};
 app.BossPuppet.draw(c,e,{},0,0,40,1);const first=app.BossPuppet.contact(e);
 e.x=.02;e.age=.02;e.walk+=.02;app.BossPuppet.draw(c,e,{},.02*40,0,40,1);const next=app.BossPuppet.contact(e);
 assert(Math.abs(first.feet[0].x-next.feet[0].x)<1e-8,'Supporting foot stays at its world contact while '+id+' advances');
 assert(Number.isFinite(next.x)&&Number.isFinite(next.tipX),'Painted grip/tool anchors remain finite');
 e.dvx=0;e.ai={m:'windup',act:'charge',dir:{x:-1,y:0}};const support=next.feet[0].x;
 for(let i=0;i<15;i++){e.age+=.02;app.BossPuppet.draw(c,e,{},e.x*40,0,40,1);
  assert(Math.abs(app.BossPuppet.contact(e).feet[0].x-support)<1e-8,'Turning '+id+' does not drag its planted support contact');}
 const living=app.BossPuppet.contact(e);e.deathPose=app.BossDeathState.capture(e);e.ai={m:'defeat',dir:{x:-1,y:0}};
 app.BossPuppet.draw(c,e,{defeatProgress:0},e.x*40,0,40,1);const dead=app.BossPuppet.contact(e);
 assert(Math.abs(dead.x-living.x)<1e-8&&Math.abs(dead.y-living.y)<1e-8,'Defeat '+id+' begins at the last rendered hand, including recovery blend');


}
{
 const original=global.performance;let time=0;global.performance={now:()=>time*1000};app.Settings={reduceMotion:false};
 for(const file of['feel','presentation-budget'])vm.runInThisContext(fs.readFileSync(ROOT+'/js/view/'+file+'.js','utf8'),{filename:file});
 let stopped=0;for(time=0;time<1;time+=.26){app.HitStop=0;app.Feel.hitStop('boss');stopped+=app.HitStop;}
 assert(stopped<=app.CFG.feel2.hitStop.budget+1e-9,'Repeated heavy contacts share the total pause budget');
 let lost=0;app.PresentationBudget.reset();for(time=0;time<1;time+=.1){const q=app.PresentationBudget.slow(.4,.25);if(q)lost+=q.T*(1-q.k);}
 assert(lost<=.18+1e-9,'Mastery/ultimate emphasis cannot keep extending slow time');
 app.Settings.reduceMotion=true;time=3;assert.equal(app.PresentationBudget.slow(.4,.25),null);global.performance=original;
}
console.log('first30-reset: delayed Knife/backhand/Cleaver contacts, propagated hammer, ten factual deaths, sack geometry, safe clock gate and ten planted support contacts passed');
// Audit11: real tells begin after the protected entrance, and HP transitions do not repeat an action by resetting its list.
for(const id of ids){
 const level={cook:1,switchkeeper:2,roaster:3,linekeeper:4,vatman:5,bellkeeper:10,dockBride:15,bigFisher:20,quayCaptain:25,ticketMan:30}[id];
 const s=app.createSim(42,{levelIndex:level,tramRhythm:true});app.startPlay(s);
 const y=s.geo?s.geo.holdY+2:210;s.hero.x=0;s.hero.y=y-2;
 const e=app.Bosses.spawn(s,'brute',0,y,{preset:id,hoodIdx:0});
 assert.equal(e.state,'active','Protected authored entrance must not be followed by a second helpless spawn: '+id);
 app.Bosses.think(s,e,.15);
 assert.equal(e.ai.m,'windup','Live handback begins with a real readable tell: '+id);
 assert(e.ai.W>=app.CFG.enemies4.telegraphMin,'No shortened warning: '+id);
 const previous=e.ai.act;e.hp=e.maxHp*.1;e.ai.m='walk';e.ai.cd=0;e.ai.needPause=false;
 app.Bosses.think(s,e,0);app.Bosses.think(s,e,2);app.Bosses.think(s,e,0);
 if(app.CFG.bosses[id].phases.at(-1).seq.some(q=>q!==previous))assert.notEqual(e.ai.act,previous,'HP phase must advance from the actual previous action: '+id);
}
{
 const s=run('knife',1);s.hero.y=208;
 const e=app.Bosses.spawn(s,'kasapBoss',0,210,{preset:'cook',hoodIdx:0});e.ai.cd=0;s.hero.y=200;
 app.Bosses.think(s,e,0);assert.equal(e.ai.act,'throw');app.Bosses.think(s,e,e.ai.W);
 assert(e.exposed,'A released cleaver creates a factual punish opening');
 assert(e.ai.t>=Math.hypot(s.hero.x-e.x,s.hero.y-e.y)/app.Hero.speed(s)*.3,'Throw recovery is usable rather than instant');
}
