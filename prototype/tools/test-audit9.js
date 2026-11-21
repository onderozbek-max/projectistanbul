// Regressions for demonstrated state ownership/contact/staging failures; no claim of artistic acceptance.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {loadP,ROOT}=require('./lib-load'),game=loadP();
const C=game.CFG.experience.people;
function run(level){const s=game.createSim(42,{levelIndex:level,tramRhythm:true,loadout:{kaanJoined:level>20}});game.startPlay(s);return s;}
const s=run(25);s.geo.blocks=[];s.props.routeEdges=[];
s.geo.blocks.push({kind:'crates',x:0,y:10,w:3,h:2,rc:{xMin:-1.5,xMax:1.5,yMin:9,yMax:11}});
const from={x:0,y:7},to={x:0,y:14},path=game.WalkPath.find(s,from,to,C.radius);
assert(path&&path.length>1,'People must route around an actual solid instead of interpolating through it');
const actor={...from},walk=path.map(x=>({...x}));let ticks=0;
while(walk.length&&ticks++<1000){game.WalkPath.move(actor,walk,C.speed,1/60);assert(game.WalkPath.valid(s,actor,C.radius));}
assert.equal(walk.length,0);assert(Math.hypot(actor.x-to.x,actor.y-to.y)<.02);
for(const n of[20,25,30]){
 const s=run(n);s.milestone.open=true;s.hero.x=0;s.hero.y=s.geo.holdY+1;game.World.clampHero(s,s.hero);
 const k=s.companion,near=game.WalkPath.nearest(s,{x:s.hero.x+3,y:s.hero.y+1},C.radius);
 Object.assign(k,near);s.hero.invuln=.48;
 const clock=JSON.stringify([s.t,s.runT,s.hero.hp,s.hero.invuln,s.jeton,s.tally]);
 const stage=game.Companion.beginScene(s,n===25?'farewell':'joining',null);
 assert(stage&&stage.friend.length,'Scene uses actual nearby actor');
 for(let t=0;t<stage.lead+stage.approach+stage.pause+C.leaveT;t+=1/60){
  game.Companion.sceneStep(s,t,1/60);
  assert(game.WalkPath.valid(s,s.hero,game.CFG.hero.radius),'Arda cannot stand inside a prop');
  assert(game.WalkPath.valid(s,k,C.radius),'Kaan cannot stand inside a prop');
 }
 assert.equal(JSON.stringify([s.t,s.runT,s.hero.hp,s.hero.invuln,s.jeton,s.tally]),clock,'Protected acting cannot advance combat/currency');
 game.Companion.endScene(s);assert(k.joined);assert(!(s.loadout.kaanJoined&&n===20),'No pre-Fisher assist granted');
 s.hero.y+=2;for(let i=0;i<180;i++)game.Companion.step(s,1/60);
 assert(Math.hypot(k.x-s.hero.x,k.y-s.hero.y)<2,'Companion persists and follows after reading');
}
const release=run(14),p=release.milestone.point;
const ordinary=game.Combat.spawnEnemy(release,'walker',p.x,p.y-1,{state:'active'});
const committed=game.Combat.spawnEnemy(release,'brute',p.x+1,p.y-1,{state:'active'});committed.windup=.5;
const before=release.enemies.length,hp=ordinary.hp;
game.EncounterSpace.release(release,p,'shutter');
assert(ordinary.lure);assert(!committed.lure);assert.equal(release.enemies.length,before);assert.equal(ordinary.hp,hp);
for(const f of ['boss-joints','boss-gestures','boss-acting'])vm.runInThisContext(fs.readFileSync(ROOT+'/js/view/'+f+'.js','utf8'),{filename:f});
const boss={bossPreset:'switchkeeper',age:1,windup:.8,ai:{m:'windup',act:'switchHook'}};
assert.equal(game.BossActing.pose(boss,{}),3);boss.ai.act='switchRails';assert.equal(game.BossActing.pose(boss,{}),6,'A switch operation cannot share the loaded hook swing');
boss.ai.m='switchRecover';boss.age+=.01;assert.equal(game.BossActing.pose(boss,{}),4);
boss.age+=.3;assert.equal(game.BossActing.pose(boss,{}),5,'The committed tool returns to a spent posture');
for(const act of ['switchHook','switchRails','charge','roast','arcRelay','arcKnot','districtTram','vatmanBell','vatmanLever','counterweights','dockCarts','ropeSweep','bridgeCast','bridgeNet'])
 assert(game.CFG.bossActionGestures[act], 'Every actual atlas-boss action needs its authored gesture: '+act);
for(const id of Object.keys(game.CFG.bossActing))for(const pose of[0,3,4,6]){
 const mark=game.BossGestures.mark({bossPreset:id},pose);assert(mark.every(Number.isFinite));
}
const evo=run(6);game.Progression.debugGrant(evo,{weapons:{knife:5}});evo.hero.passives.gloves=1;
game.Progression.evolve(evo,{evo:'knife',item:'cleaver'});
const target=game.Combat.spawnEnemy(evo,'walker',0,7,{state:'active',elite:true});
game.Combat.damageEnemy(evo,target,3,1,0,0,false,'cleaver');
assert(evo.evolutionUse.cleaver.encounters.elite>0);assert.equal(evo.evolutionUse.cleaver.first_encounter,'elite');
assert(!evo.loadout.kaanJoined,'New measurements must not grant relationship facts');
const carRun=run(13),car=carRun.env.recs.find(r=>game.Env.isCar(r.kind)&&r.bomb);
assert(car,'Use an actual authored explosive car');
const landing={id:'canister',x:car.x-car.r-1,y:car.y,r:1.2,tag:'gas'};
assert(!game.Weapons6.terrainAt(carRun,landing.x,landing.y).includes('car'),'Point-only probe genuinely misses this landing');
game.EnvRules.lob(carRun,landing);
assert(car.fuseT>0,'The existing actual landing/blast rule lit the car');
assert(game.Weapons6.seen(carRun,'canister','car'),'Credit the weapon that actually lit the car');
assert(!game.Weapons6.seen(carRun,'knife','car'),'Never transfer terrain credit to an unrelated weapon');
const actual=run(13),actualCar=actual.env.recs.find(r=>game.Env.isCar(r.kind)&&r.bomb);
game.Progression.debugGrant(actual,{weapons:{canister:1}});
game.Mods.blast(actual,actualCar.x-actualCar.r-1,actualCar.y,1.2,1,0,'canister',game.Mods.act(actual,'canister'));
assert(game.Weapons6.seen(actual,'canister','car'),'Accepted real canister damage must retain car attribution before the fuse suppresses follow-up hits');
const manual=run(13),manualCar=manual.env.recs.find(r=>game.Env.isCar(r.kind)&&r.bomb);
game.Combat.damageProp(manual,manualCar,1,'sledge');
assert(!game.Weapons6.seen(manual,'canister','car'),'A deliberate proximity strike cannot pretend a canister hit the car');
// A transient zero viewport must not poison the cached vignette after return.
const drawn=[],gradient={addColorStop(){}};
const context={fillRect(){},setTransform(){},createRadialGradient(){return gradient;},drawImage(cv){assert(cv.width>0&&cv.height>0,'Never draw a zero-sized cached canvas');drawn.push([cv.width,cv.height]);}};
const doc={createElement(){return{width:0,height:0,getContext(){return context;}};}};
vm.runInNewContext(fs.readFileSync(ROOT+'/js/view/render.js','utf8'),{P:game,document:doc,window:{devicePixelRatio:1},performance:{now(){return 0;}}});
game.Fx={};const screen=run(1);screen.hero.hp=screen.hero.maxHp;
const view={ctx:context,W:0,H:0,dpr:1};game.RenderOverlay.screen(view,screen);assert.equal(drawn.length,0);
Object.assign(view,{W:390,H:844});game.RenderOverlay.screen(view,screen);assert.deepEqual(drawn.at(-1),[390,844]);
Object.assign(view,{W:320,H:568});game.RenderOverlay.screen(view,screen);assert.deepEqual(drawn.at(-1),[320,568],'Viewport resize invalidates the vignette dimensions');
Object.assign(view,{W:390,H:844,dpr:.001184834123222749});game.RenderOverlay.screen(view,screen);assert.deepEqual(drawn.at(-1),[1,1],'Positive subpixel viewport cannot create a zero-pixel cached source');
const mainCanvas={width:0,height:0,getContext(){return context;}};game.Render.init(mainCanvas);game.Render.resize(.001184834123222749);assert.deepEqual([mainCanvas.width,mainCanvas.height],[1,1],'Main render target also stays valid at the observed resize scale');
game.Fx={get cam(){throw Error('A subpixel viewport must not enter any world/cache layer');}};assert.equal(game.Render.frame(screen),false);
console.log('Audit9 obstacle routing, protected clocks, persistent companion, local release, distinct boss actions and evolution context pass.');
