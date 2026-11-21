// Discover real AI phases, then replay each to a factual lethal contact. Protected phases stay protected.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const tag=process.env.RESET_BUILD||'candidate12';
const app=require('/private/tmp/istanbul-reset-'+tag+'-checks-20261120/prototype/tools/lib-load.js').loadP(),dt=1/60;
const source=JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/'+tag+'.json')),records=[];
const defs=[[1,'cook','kasapBoss'],[2,'switchkeeper','brute'],[3,'roaster','brute'],[4,'linekeeper','brute'],[5,'vatman','brute'],[10,'bellkeeper','brute'],[15,'dockBride','brute'],[20,'bigFisher','brute'],[25,'quayCaptain','brute'],[30,'ticketMan','brute']],director=app.Director.step;
function init(level,id,type){const s=app.createSim(42,{levelIndex:level,tramRhythm:true});app.startPlay(s);s.enemies=[];s.events=[];s.hero.weapons={};s.hero.invuln=Infinity;s.hero.x=0;s.hero.y=s.geo?s.geo.holdY:210;
 s.obj=null;if(s.env){s.env.recs=[];s.env.portals=[];s.env.zones=[];}s.props.routeEdges=[];
 if(s.milestone){s.milestone.open=true;s.milestone.opening=1;}if(s.gen){s.gen.marks=[];s.gen.mi=0;s.gen.arena=true;}app.Horde.step=function(){};
 app.Director.step=level===1?function(){}:director;
 const e=app.Bosses.spawn(s,type,.8,s.hero.y+2.7,{preset:id,hoodIdx:Math.floor((level-1)/5),nameKey:'boss.'+id});e.state='active';e.hp=e.maxHp=1e7;
 if(s.gen)s.gen.boss=e;else s.dir.trialBoss=e;return{s,e};}
function key(e){const a=e.ai;return[e.phase,a.m,a.act||'-',a.combo||0,!!(a.cookToss&&a.cookToss.released),e.captainTow&&e.captainTow.phase||'-',!!e.bridgeCast,!!e.dockRope].join('|');}
function tick(s,e,i){if(i>2700&&e.phase===1)app.Combat.damageEnemy(s,e,e.maxHp*.56,1,0,0,false,'knife');app.stepSim(s,dt,{x:Math.sin(i/80)*.35,y:0});app.drainEvents(s);}
for(const[level,id,type]of defs){const seen=new Map();let q=init(level,id,type);
 for(let i=0;i<7200;i++){tick(q.s,q.e,i);const k=key(q.e);if(!seen.has(k))seen.set(k,i);}
 for(const[phase,step]of seen){q=init(level,id,type);for(let i=0;i<=step;i++)tick(q.s,q.e,i);
  assert.equal(key(q.e),phase,'Deterministic actual AI phase replay '+id);const a=q.e.ai,before={phase,mode:a.m,act:a.act,t:a.t,windup:q.e.windup,x:q.e.x,y:q.e.y};
  const hp=q.e.hp;app.Combat.damageEnemy(q.s,q.e,hp*20,1,0,0,false,'knife');
  if(!q.e.dead){records.push({id,level,before,lethalAccepted:false,reason:'Actual boss protection rejects contact; no HP/phase override was used.',remainingHp:q.e.hp});continue;}
  const death=q.s.events.find(e=>e.type==='bossDie');assert(death,'Actual lethal contact must emit the protected defeat trigger');assert.equal(death.body.deathPose.ai.m,before.mode);assert.equal(death.body.deathPose.ai.act,before.act);assert.equal(death.body.deathPose.ai.t,before.t);
  assert(!q.s.enemyTele.some(e=>e.owner===q.e.id));assert(!q.s.e3?.blades.some(e=>e.owner===q.e.id));assert(!q.e.bridgeCast&&!q.e.bridgeNet&&!q.e.dockRope&&!q.e.captainTow&&!q.e.captainDust);assert(!q.e.dockCarts?.length);
  q.s.enemies=q.s.enemies.filter(e=>e.boss);q.s.hero.invuln=0;q.s.hero.iframes=0;q.s.hero.hp=q.s.hero.maxHp=1e6;const h=q.s.hero.hp;
  const aftermath=[];for(let i=0;i<120;i++){app.stepSim(q.s,dt,{x:0,y:0});aftermath.push(...app.drainEvents(q.s));}
  if(q.s.hero.hp!==h)fs.writeFileSync('reviews/telemetry/first30-reset/'+tag+'-boss-lifecycle-failure.json',JSON.stringify({id,before,events:aftermath.filter(e=>e.type==='heroHit'),zones:q.s.zones,gen:q.s.gen,props:q.s.props},null,2));
  assert.equal(q.s.hero.hp,h,'No ghost boss damage after '+id+' '+phase);
  records.push({id,level,before,lethalAccepted:true,deathSnapshot:death.body.deathPose,ownedWarningsCleared:true,ownedToolsCancelled:true,noGhostDamageNext2Seconds:true});
 }
 console.log(id,seen.size,'actual phase states');
}
fs.writeFileSync('reviews/telemetry/first30-reset/'+tag+'-boss-lifecycle.json',JSON.stringify({source,fixture:true,method:'Supplied high-health no-weapon observer and high-health boss, native AI first and later HP phase, ordinary slight movement. Discover natural phase states then deterministic replay and actual lethal Combat contact. Protected phases remain protected, explicitly recorded. Snapshot and two seconds no-ghost-damage checks are simulation evidence, not animated-death or normal difficulty acceptance.',records},null,2)+'\n');console.log('All killable sampled native phases preserved their factual death snapshot and cancelled owned damage.');
