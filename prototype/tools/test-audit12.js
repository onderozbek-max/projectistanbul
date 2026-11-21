// Real impact fragments must leave their source victim; neighboring bodies still take shard contacts.
'use strict';
const assert=require('node:assert/strict'),app=require('./lib-load').loadP();
function setup(){const s=app.createSim(42,{levelIndex:1,tramRhythm:true});app.startPlay(s);
 s.enemies=[];s.hero.x=0;s.hero.y=50;s.events=[];return s;}
function victim(s,x,y){const e=app.Combat.spawnEnemy(s,'walker',x,50+y);e.hp=e.maxHp=10000;e.r=.86;return e;}
{
 const s=setup(),source=victim(s,1,0),neighbor=victim(s,2.5,0);
 const A={M:{shards:{n:3,dmg:.4,pierce:1}},variant:'knife',fam:'knife'};
 app.Mods.hit(s,source,100,1,0,0,'knife',A);
 for(let i=0;i<25;i++){app.Mods.update(s,1/60);s.t+=1/60;}
 assert.equal(source.hp,9900,'Impact fragments cannot immediately re-hit the body that emitted them');
 assert(neighbor.hp<10000,'The same fragments still hit other bodies along their actual paths');
}
{
 const s=setup(),a=victim(s,-2,0),b=victim(s,2,0),before=s.enemies.map(e=>({id:e.id,x:e.x,y:e.y,hp:e.hp}));
 const boss=app.Bosses.spawn(s,'kasap',0,53,{preset:'cook',hoodIdx:0,nameKey:'boss.cook'});
 for(const old of before){const e=s.enemies.find(e=>e.id===old.id);assert.equal(e.x,old.x);assert.equal(e.y,old.y);assert.equal(e.hp,old.hp);}
 assert.equal(boss.maxHp,app.CFG.bosses.cook.hp,'Budget is fixed configuration, independent of hero damage');
 assert(s.enemies.includes(a)&&s.enemies.includes(b),'Arrival preserves survivors');
}
{
 const s=setup(),e=app.Bosses.spawn(s,'brute',0,53,{preset:'ticketMan',hoodIdx:0,nameKey:'boss.ticketMan'});
 e.ai.cd=0;s.hero.x=1;s.hero.y=52;app.Bosses.think(s,e,1/60);
 const aim={...e.ai.dir};s.hero.x=-2;app.Bosses.think(s,e,1/60);
 assert.deepEqual(e.ai.dir,aim,'Punch direction remains committed after the physical load begins');
 e.hp=1;app.Combat.damageEnemy(s,e,10000,1,0,0,false,'knife');
 assert(!s.enemyTele.some(t=>t.owner===e.id),'Lethal interruption cancels owned danger');
 assert(s.events.find(q=>q.type==='bossDie').body.deathPose,'Defeat retains the factual lethal pose');
}
for(const id of ['knife','nailgun','canister']){
 const first=app.createSim(42,{levelIndex:1,loadout:{startWeapon:id}});
 assert.deepEqual(Object.keys(first.hero.weapons),['knife'],'First restaurant retains canonical acquisition');
 const replay=app.createSim(42,{levelIndex:2,tramRhythm:true,loadout:{startWeapon:id,l1Cleared:true}});
 assert.deepEqual(Object.keys(replay.hero.weapons),[id],'An alternate starter replaces Knife');
 assert.equal(replay.hero.weapons[id],1,'Run rank resets');
}
{
 app.Meta.reset();app.Meta.state().stars[5]=1;app.Meta.state().stars[1]=3;app.Meta.state().unlocked=6;
 assert(app.Meta.setStarter('nailgun'));assert.equal(app.Meta.loadout({mode:'normal'}).startWeapon,'nailgun');
 for(const opts of [{mode:'nightmare'},{mode:'nightshift',nightshift:true},{daily:true}])
  assert.equal(app.Meta.loadout(opts).startWeapon,'knife','The new Normal starter cannot change an existing challenge-mode kit');
 assert.equal(app.Meta.tacticalAllowed(5,'nightmare'),false);assert.equal(app.Meta.tacticalAllowed(5,'nightshift'),false);
 app.Meta.reset();
}
{
 const raw=app.Meta.Save.defaults();raw.heroes.arda.starter='nailgun';
 assert.equal(app.Meta.Save.normalize(raw).heroes.arda.starter,'knife','An unearned saved selection cannot unlock a starter');
 raw.stars[5]=1;assert.equal(app.Meta.Save.normalize(raw).heroes.arda.starter,'nailgun');
 raw.heroes.arda.starter='cleaver';assert.equal(app.Meta.Save.normalize(raw).heroes.arda.starter,'knife','Evolution is not a legal starter');
}
{
 const s=setup(),e=app.Bosses.spawn(s,'kasap',0,53,{preset:'cook',hoodIdx:0,nameKey:'boss.cook'});
 s.dir.trialBoss=e;e.ai.m='windup';e.ai.W=1;e.ai.t=0;e.ai.act='throw';
 s.pendingLevels=1;s.pendingChoiceAt=s.t;
 const before=s.t;app.stepSim(s,1/60,{x:0,y:0});assert(s.t>before,'Earned choice does not freeze a committed attack before its recovery seam');
 s.t=s.pendingChoiceAt+app.CFG.experience.choiceMaxDelay;const at=s.t;
 app.stepSim(s,1/60,{x:1,y:0});assert.equal(s.t,at,'Maximum deferral consistently suspends gameplay for the choice');
 e.exposed=true;assert.equal(app.Progression.choiceCanWait(s),false,'Recovery immediately releases a ready choice');
}
for(const seed of [42,149,20261119]){
 for(let i=2;i<=30;i++)assert(app.createSim(seed,{levelIndex:i,tramRhythm:true}).milestone,'Every generated route initializes');
 const s=app.createSim(seed,{levelIndex:22,tramRhythm:true}),r=s.dramaSpace.domino;
 assert(r&&r.alive&&r.hp>0,'The market flank has a real destructible obstruction');
 app.startPlay(s);app.Env.liftCover(s,s.streetSite.prop);s.hero.streetHolding=true;
 s.streetWeapon={r:s.streetSite.prop,phase:'flight',t:0,to:{x:r.x,y:r.y}};
 app.StreetWeapon.step(s,app.CFG.env.streetWeapon.flight+.01);
 assert(!r.alive&&!s.geo.blocks.includes(r.b),'Actual cart landing breaks the obstruction and removes collision');
 assert.equal(s.mode,'play','Optional material impact does not settle the level');
}
{
 function run(reverse,commandRecovery){const s=app.createSim(42,{levelIndex:15,tramRhythm:true,loadout:reverse?{tacticalLevel:15}:null});
  app.startPlay(s);s.enemies=[];s.hero.x=3;s.hero.y=s.geo.holdY+3;
  const b=app.Bosses.spawn(s,'brute',0,s.geo.holdY+3,{preset:'dockBride',hoodIdx:2,nameKey:'boss.dockBride'});s.gen.boss=b;
  b.ai.dir={x:0,y:-1};b.ai.side=1;b.ai.wm=1;
  app.KarakoyBoss.attack(s,b,b.ai,'dockCarts',w=>w);const tele=s.enemyTele.find(t=>t.then==='dockCarts');
  assert.equal(tele.dy,reverse?1:-1,'The real cart source/flight reverses');
  app.KarakoyBoss.launch(s,{...tele,x:b.x});b.dockRope={t:0,T:1};
  if(commandRecovery)app.Bosses.exposeFor(s,b,app.CFG.bosses.dockBride.carts.reset);
  for(let i=0;i<180&&!b.cartOpening;i++)app.KarakoyBoss.step(s,b,1/60);
  assert(b.exposed&&b.cartOpening&&!b.dockRope,'A real cart interrupts the rope and opens a damage window');
 }
 run(false);run(true);run(false,true);run(true,true);
}
{
 const s=app.createSim(42,{levelIndex:15,tramRhythm:true});app.startPlay(s);s.enemies=[];
 s.hero.x=0;s.hero.y=s.geo.holdY;
 const b=app.Bosses.spawn(s,'brute',0,s.hero.y+5.5,{preset:'dockBride',hoodIdx:2,nameKey:'boss.dockBride'});s.gen.boss=b;
 b.ai.dir={x:0,y:-1};b.ai.side=1;b.ai.wm=1;
 app.KarakoyBoss.attack(s,b,b.ai,'dockCarts',w=>w);
 app.KarakoyBoss.launch(s,s.enemyTele.find(t=>t.then==='dockCarts'));
 for(let i=0;i<180;i++)app.KarakoyBoss.step(s,b,1/60);
 assert(!b.cartOpening,'The first cart teaches a crossing; it cannot automatically hit a stationary distant Bride');
}
console.log('Audit12 actual fragment contact, survivor continuity, starter migration, earned-choice boundaries, all30 initialization, cart material impact and reversible Bride counter pass');
{
 const s=app.createSim(42,{levelIndex:20,tramRhythm:true});app.startPlay(s);s.enemies=[];
 const boss=app.Bosses.spawn(s,'bloater',0,53,{preset:'bigFisher',hoodIdx:3,nameKey:'boss.bridge'});
 s.gen.boss=boss;s.hero.x=boss.x;s.hero.y=boss.y;s.hero.hp=1;s.hero.invuln=0;s.hero.iframes=0;s.events=[];
 app.Combat.damageEnemy(s,boss,boss.hp*100,1,0,0,false,'knife');
 assert(boss.dead);assert.equal(s.hero.hp,1,'Defeated Fisher cannot kill Arda through an inherited Bloater burst');
 assert(!s.events.some(e=>e.type==='bloaterPop'||e.type==='heroHit'),'Authored physical defeat must not emit legacy damaging death effects');
 assert.equal(s.events.filter(e=>e.type==='bossDie').length,1);
 app.Combat.killEnemy(s,boss,false,'knife');assert.equal(s.events.filter(e=>e.type==='bossDie').length,1,'Repeated lethal observation cannot settle twice');
 const normal=app.Combat.spawnEnemy(s,'bloater',0,53,{state:'active'});s.events=[];
 app.Combat.damageEnemy(s,normal,normal.hp*100,1,0,0,false,'knife');
 assert(s.events.some(e=>e.type==='bloaterPop'),'Ordinary Bloaters retain their real death consequence');
}
{
 const s=app.createSim(42,{levelIndex:15,tramRhythm:true});app.startPlay(s);s.enemies=[];
 const e=app.Bosses.spawn(s,'brute',0,s.geo.holdY+3,{preset:'dockBride',hoodIdx:2,nameKey:'boss.dockBride'});
 s.gen.boss=e;s.hero.x=0;s.hero.y=e.y-8;e.ai.k=1;e.ai.cd=0;
 for(let i=0;i<245;i++)app.Bosses.think(s,e,1/60);
 assert.equal(e.ai.act,'dockCarts','A distant opponent cannot leave the Bride indefinitely approaching for a rope attack');
 assert(s.enemyTele.some(t=>t.then==='dockCarts'&&t.owner===e.id),'Fallback remains a fully warned real cart action');
 for(let i=0;i<100;i++)app.Bosses.think(s,e,1/60);
 assert(e.exposed&&e.ai.m==='switchRecover','Working the carts gives a real reachable punish window');
}
for(const source of ['knife','bridgeWave']){
 const s=app.createSim(42,{levelIndex:23,tramRhythm:true,loadout:{kaanJoined:true}});app.startPlay(s);
 const m=s.milestone,k=s.companion;Object.assign(k,{x:m.pallet.x+.7,y:m.pallet.y+.6});
 Object.assign(s.hero,{x:m.pallet.x,y:m.pallet.y});m.delivered=1;m.work={finished:0,progress:0,targets:[]};s.enemies=[];
 const e=app.Combat.spawnEnemy(s,'walker',m.pallet.x,m.pallet.y+1,{state:'active'});
 app.EminonuTrial.work(s,.2);assert(m.work.blocked&&m.work.progress===0,'Actual nearby pressure interrupts loading');
 app.Combat.damageEnemy(s,e,1000,1,0,0,false,source);app.EminonuTrial.work(s,.2);
 assert(!m.work.blocked&&m.work.progress>0,'Loading visibly resumes after the real threat clears');
 assert.equal(!!s.kaanRepay,source==='knife','Only actual player help earns the contextual memory');
 for(let i=0;i<120;i++)app.EminonuTrial.work(s,1/60);
 assert.equal(m.work.finished,1);assert.equal(m.open,false,'Optional loading cannot auto-complete the three-sack objective');
 m.delivered=2;s.hero.y+=20;assert.equal(app.EminonuTrial.work(s,.1),false,'Kaan can leave the job and follow; no escort obligation');
}
for(const side of [-1,1]){
 const s=app.createSim(42,{levelIndex:8,tramRhythm:true}),m=s.milestone;app.startPlay(s);
 const post=m.bellPosts.find(q=>Math.sign(q.x)===side);s.hero.x=post.x;s.hero.y=post.y;
 app.RouteMilestones.step(s,m.useT);assert.equal(m.point,post,'Approach selects a real stationary bell on that side');
 assert(m.bellGroup.every(e=>app.WalkPath.valid(s,e,e.r)),'The finite group enters from real walkable positions');
 const before=m.bellGroup.reduce((n,e)=>n+e.x,0)/m.bellGroup.length;
 for(let i=0;i<240;i++){s.t+=1/60;app.Combat.updateEnemies(s,1/60);}
 const after=m.bellGroup.reduce((n,e)=>n+e.x,0)/m.bellGroup.length;
 assert(side*(after-before)>.1,'The chosen bell changes actual group flow without teleporting it');
}
{
 const s=app.createSim(42,{levelIndex:23,tramRhythm:true,loadout:{kaanJoined:true}});app.startPlay(s);
 const m=s.milestone,k=s.companion;s.enemies=[];
 s.hero.x=m.sacks[0].x;s.hero.y=m.sacks[0].y;app.EminonuTrial.ready(s,m,.02);
 s.hero.x=m.pallet.x;s.hero.y=m.pallet.y;app.EminonuTrial.ready(s,m,.02);
 assert.equal(m.delivered,1,'Use actual sack pickup/delivery to create the pallet collision');
 const at=app.WalkPath.nearest(s,{x:m.sacks[0].x+1,y:m.sacks[0].y-.5},app.CFG.experience.people.radius);
 k.x=at.x;k.y=at.y;s.hero.y=m.pallet.y-1;s.hero.invuln=Infinity;
 for(let i=0;i<600&&!m.work.blocked;i++){s.t+=1/60;app.Combat.updateEnemies(s,1/60);app.Companion.step(s,1/60);}
 assert(m.work.blocked&&m.work.finished===0,'The actual offscreen pressure must reach the pallet before the first loading job finishes');
 const threat=s.enemies.find(e=>m.work.targets.includes(e.id));app.Combat.damageEnemy(s,threat,10000,1,0,0,false,'knife');
 for(let i=0;i<240;i++){s.t+=1/60;app.Companion.step(s,1/60);}
 assert(m.work.finished===1,'Kaan must walk to a reachable job and actually finish loading');
 assert(app.WalkPath.valid(s,k,app.CFG.experience.people.radius),'Work cannot put Kaan inside the delivered pallet');
}
{
 const s=setup(),b=app.Bosses.spawn(s,'kasap',0,53,{preset:'cook',hoodIdx:0,nameKey:'boss.cook'});
 b.hp=b.maxHp=10000;app.Combat.addBurn(b,'molotov');
 s.zones.push({kind:'fire',x:b.x,y:b.y,r:2,t:10,dps:6});s.events=[];
 for(let i=0;i<31;i++)app.Combat.updateBurnAndZones(s,1/60);
 const hits=s.events.filter(e=>e.type==='hit'&&e.delivery==='dot');assert.equal(hits.length,1,'Mixed DoT remains one authoritative armour/proc application');
 assert(hits[0].dotSources.molotov>0&&hits[0].dotSources['terrain:fire']>0,'Batched damage preserves its actual contributing sources');
 assert(Math.abs(10000-b.hp-hits[0].bossHit.applied)<1e-8,'Attribution does not add or duplicate damage');
}
