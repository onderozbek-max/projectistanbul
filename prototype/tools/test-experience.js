// Regressions for truthful feedback, articulated joints, live input and protected scene ownership.
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const {loadP,ROOT}=require('./lib-load');
const game=loadP();
game.Settings={reduceMotion:false};
let resets=0, saved=0, settled=0;
game.Input={enabled:true,reset(){resets++;}};
game.saveSettings=()=>saved++;
game.Music={duck(){},play(){}};
game.Fx={cam:{x:0,y:0,w:10}};
game.Tel={log(){}};
for(const file of ['health-feedback','actor-rig','hero-motion','boss-joints','scene-flow','interaction-acting','civilian-acting'])
 vm.runInThisContext(fs.readFileSync(ROOT+'/js/view/'+file+'.js','utf8'),{filename:file});
const H=game.HealthFeedback, C=game.SceneFlow;
let s=game.createSim(42,{levelIndex:3});game.startPlay(s);
H.reset(s);const maximum=s.hero.maxHp;
s.hero.hp-=1;H.event({type:'heroHit',dmg:1,hp:s.hero.hp,cause:'poison'},s);H.update(s,.01);
assert(H.state().hurt>0);assert.equal(H.state().direction,null);assert.equal(H.state().hp,maximum-1);
assert.equal(H.state().trail,maximum);
H.reset(s);H.event({type:'shieldBlock'},s);H.update(s,.01);
assert(H.state().shield>0);assert.equal(H.state().hurt,0);assert.equal(H.state().hp,maximum-1);
H.reset(s);H.event({type:'pickup',healed:0,kind:'simit'},s);assert.equal(H.state().heal,0);
s.hero.hp=maximum*.2;H.update(s,.01);assert(H.state().critical);
s.hero.hp=maximum*.3;H.update(s,.01);assert(H.state().critical);
s.hero.hp=maximum*.4;H.update(s,.01);assert(!H.state().critical);
H.reset(s);s.hero.hp+=4;H.event({type:'pickup',healed:4},s);
s.hero.hp-=3;H.event({type:'heroHit',dmg:3,hp:s.hero.hp},s);H.update(s,.01);
assert.equal(H.state().hp,s.hero.hp);assert(H.state().heal>0&&H.state().hurt>0);
assert(H.state().restored.to>H.state().hp,'the benefit and subsequent loss retain their separate history');
H.event({type:'heroHit',dmg:2,hp:s.hero.hp,from:{x:s.hero.x+2,y:s.hero.y}},s);
assert.equal(H.state().direction,0);
s.hero.hp=2;H.reset(s);s.hero.hp=0;
H.event({type:'heroHit',dmg:20,beforeHp:2,hp:0},s);H.update(s,.01);
assert.equal(H.state().trail,2,'overkill cannot invent an earlier HP segment');
const joint=game.ActorRig.solveKnee({x:0,y:0},{x:0,y:8},5,5,1);
assert(Math.abs(Math.hypot(joint.x,joint.y)-5)<1e-8);
assert(Math.abs(Math.hypot(joint.x,joint.y-8)-5)<1e-8);
let pose={};game.HeroMotion.apply(s,pose);s.hero.moving=true;s.hero.y+=.1;s.t+=.02;pose={};game.HeroMotion.apply(s,pose);
assert(pose.phase>0&&pose.gaitGain>0);const phase=pose.phase;s.hero.moving=false;s.t+=.02;pose={};game.HeroMotion.apply(s,pose);
assert.equal(pose.phase,phase);assert(pose.settling,'settlement has no extra simulated movement');
s.hero.dashing=true;s.hero.x+=.6;s.t+=.02;pose={};game.HeroMotion.apply(s,pose);
assert(pose.motion.dash);assert.equal(pose.phase,Math.PI*.15,'Dash extends its prepared stride without running in place');
s.hero.dashing=false;
const enemy={x:s.hero.x+1,y:s.hero.y+2,bossPreset:'roaster',dead:false};s.gen.boss=enemy;
C.event({type:'routeBeat',phase:'boss'},s);assert(!C.running(s));
C.event({type:'bossIntro'},s);assert(C.running(s));assert(!game.Input.enabled);
const timers=JSON.stringify({t:s.t,runT:s.runT,h:s.hero.cds,sk:s.sk,enemy:enemy});
C.step(s,.4);assert.equal(JSON.stringify({t:s.t,runT:s.runT,h:s.hero.cds,sk:s.sk,enemy:enemy}),timers);
assert.equal(saved,0,'starting a scene does not mark it seen');
C.background('cold');const t=C.current().t;C.step(s,2);assert.equal(C.current().t,t);
C.resume();C.finish(true);C.finish(true);assert.equal(saved,1);assert(game.Input.enabled);
C.event({type:'bossIntro'},s);assert.equal(C.current().T,game.CFG.experience.scenes.retryT);C.reset();assert.equal(saved,1);
s.levelIndex=20;s.mode='play';assert(!C.result(s,()=>settled++));
s.mode='won';assert(C.result(s,()=>settled++));C.step(s,1);C.finish(true);C.finish(true);assert.equal(settled,1);
C.reset();assert(!C.running(s));assert(resets>=4);
// A true late-boss defeat starts its native aftermath at the defeated actor, before exit travel.
// Reading may outlast the acting; the shared gameplay clock remains suspended until both finish.
let finishBook;game.Comic={clearPops(){},active(){return !!finishBook;},skipPage(){finishBook();}};
const nativePlay=game.Story.play;game.Story.play=(level,when,done)=>{finishBook=done;return true;};
s.levelIndex=25;s.mode='play';const finalBody={x:s.hero.x+1,y:s.hero.y+2,bossPreset:'quayCaptain'};
C.event({type:'bossDie',body:finalBody},s);C.step(s,.1);assert(C.running(s));assert(C.current().ownsStory);
const fixed=s.runT;C.step(s,8);assert.equal(s.runT,fixed);assert(C.running(s),'Reading retains the protected lock');
finishBook();C.step(s,.01);assert(!C.running(s));assert(C.endingShown(s));
s.mode='won';assert(!C.result(s,()=>settled++),'The exit cannot replay an already shown aftermath');
const neutralId=Object.keys(game.Settings.sceneSeen).find(k=>k.includes('captain_end'));
assert(neutralId,'The completed neutral native variant must have a real seen key');
C.reset();s.mode='play';s.kaanCovered=true;
C.event({type:'bossDie',body:finalBody},s);C.step(s,.1);
assert.notEqual(C.current().id,neutralId,'A newly earned help variant cannot inherit neutral presentation history');
finishBook();C.finish(true);s.kaanCovered=false;
game.Story.play=nativePlay;delete game.Comic;C.reset();
// A task load and a portable street weapon cannot own the same hands.
s=game.createSim(42,{levelIndex:23,tramRhythm:true});game.startPlay(s);s.milestone.carry=true;
pose={};const work=game.InteractionActing.pose(s,pose);assert.equal(work.kind,'carry');assert(pose.noArms);
// Exercise the captain's ordinary walk and staged entry through the real view module.
// This caught a browser-only missing-options crash that simulation tests cannot observe.
global.document={baseURI:'http://localhost/'};
global.Image=class{set src(value){this.onload();}};
game.BossFootwork={stride(){}};
vm.runInThisContext(fs.readFileSync(ROOT+'/js/view/eminonu-boss-fx.js','utf8'),{filename:'eminonu-boss-fx'});
const canvas=new Proxy({}, {get(){return function(){};}});
const captain={id:8,x:0,y:0,r:1,bossPreset:'quayCaptain',vx:1,vy:0,dvx:1,dvy:0,walk:1,ai:{m:'walk'}};
game.EminonuBossFx.bossBody(canvas,captain,{},0,0,40,1);
game.EminonuBossFx.bossBody(canvas,captain,{sceneEntry:.2,phase:1},0,0,40,1);
s.gen.boss=captain;s.enemyTele=[];
game.EminonuBossFx.air({ctx:canvas,ppm:40,X:x=>x,Y:y=>y},s);
delete global.document;delete global.Image;
// Fleeing groups keep a stable identity through their stride, with six distinct source rows.
const painted=[],texture={};game.StreetArt={image:()=>texture};
const paint=new Proxy({}, {get(_target,key){return function(){if(key==='drawImage')painted.push(Array.from(arguments));};}});
for(let variant=0;variant<6;variant++){
 game.CivilianActing.flee(paint,0,0,50,1,0,variant);
 const initial=game.CivilianActing.frame(variant,0);
 for(let q=0;q<4;q++)assert.equal(game.CivilianActing.frame(variant,q*Math.PI/2+.01).row,initial.row);
}
assert.equal(new Set(painted.map(args=>args[2])).size,6,'The crowd must not collapse into one restaurant-patron row');
// The hero's lower silhouette comes intact from its illustrated stride, not a splayed two-knee reconstruction.
painted.length=0;
const body={img:texture,sx:0,sy:0,sw:80,sh:160,px:40,py:160};
const stride={img:texture,sx:256,sy:0,sw:90,sh:160,px:45,py:160};
game.ActorRig.draw(paint,body,0,0,1,1,'front',1,1,{lowerBody:{rect:stride,cut:110,hip:45,upperCut:110,upperHip:40}},null);
assert(painted.some(a=>a[1]===256&&a[2]===110&&a[3]===90&&a[4]===50),'The complete authored lower pose remains intact');
assert.equal(game.ActorRig.pose.waist,110,'The torso must join at the actual painted hip line');
assert(Number.isFinite(game.ActorRig.hand(10,100).x),'Hand ownership survives the corrected pelvis origin');
// Real seeded fleeing groups must avoid adjacent copies without mutating sim actors or changing identity later.
let neighborObservations=0;
for(let seed=1;seed<=200;seed++){
 const run=game.createSim(seed);game.startPlay(run);run.props.doorOpen=true;run.hero.y=4;run.enemies=[];
 game.Director.step(run,0);const before=JSON.stringify(run.dir.civilians);
 game.CivilianActing.prepare(run.dir.civilians);assert.equal(JSON.stringify(run.dir.civilians),before);
 const identity=new Map(run.dir.civilians.map(v=>[v,game.CivilianActing.look(v)]));
 for(let tick=0;tick<80;tick++){
  game.Director.decor(run,.1);game.CivilianActing.prepare(run.dir.civilians);
  const crowd=run.dir.civilians;
  crowd.forEach((v,i)=>{
   assert.equal(game.CivilianActing.look(v),identity.get(v),'A runner cannot change clothes as neighbors leave');
   crowd.slice(i+1).forEach(other=>{
    if(Math.abs(v.x-other.x)<2.7&&Math.abs(v.y-other.y)<1.7){neighborObservations++;
     assert.notEqual(game.CivilianActing.look(v),game.CivilianActing.look(other),'Adjacent repeated civilian at seed '+seed);}
   });
  });
 }
}
assert(neighborObservations>50000,'The test must include actual crowded encounters, not only separated figures');
console.log('experience regressions passed');
