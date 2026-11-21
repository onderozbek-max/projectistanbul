// Collision reachability diagnostics use the runtime clamp and actual movement speed; no alternative balance engine.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),game=require('./lib-load').loadP();
const results=[],dt=1/60,step=.2;
function make(level,seed=42){const s=game.createSim(seed,{levelIndex:level,tramRhythm:true});game.startPlay(s);return s;}
function search(s,start,goal,range,allow=()=>true){
 const key=p=>Math.round(p.x/step)+','+Math.round(p.y/step),queue=[{...start,path:[],distance:0}],seen=new Set([key(start)]);
 for(let i=0;i<queue.length&&i<80000;i++){
  const p=queue[i];if(goal(p))return p;
  for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
   const q={x:p.x+dx*step,y:p.y+dy*step};if(q.y<range[0]||q.y>range[1]||!allow(q))continue;
   const intended={...q};game.World.clampHero(s,q);
   if(Math.hypot(q.x-intended.x,q.y-intended.y)>.025||seen.has(key(q)))continue;
   seen.add(key(q));queue.push({...q,path:p.path.concat([[q.x,q.y]]),distance:p.distance+Math.hypot(dx,dy)*step});
  }
 }return null;
}
// Reproduce the only campaign navigation timeout and test its physically reachable flank.
{
 const s=make(5),start={x:-4.4,y:45.24};s.hero.x=start.x;s.hero.y=start.y;
 const route=search(s,start,p=>p.y>51,[42,53]);assert(route,'The tram shelter must have a walkable flank');
 results.push({id:'L5-seed42-shelter',provenance:'Exact observed timeout position; runtime collision search, no damage or teleport claim',
  distance:route.distance,secondsAtActualSpeed:route.distance/game.Hero.speed(s),start,end:[route.x,route.y],path:route.path});
}
for(const level of [13,16,19]){
 const s=make(level),m=s.milestone,c=game.CFG.levels.bridgeMilestones,speed=game.Hero.speed(s),y=m.point.y;
 if(level===13){
  // This is deliberately supplied overlap. L13's authored points action has no damaging rail cast.
  const rail=game.CFG.bosses.switchkeeper.rails,spit=game.CFG.enemies.spitter;
  const start={x:0,y:y-1.5},acid={x:-1.2,y:y-1.5,r:spit.glob.r},blast={x:-1.6,y:y+1,r:game.CFG.ev.car.blastR};
  const safe=p=>Math.abs(p.x)>rail.w/2+game.CFG.hero.radius&&Math.hypot(p.x-acid.x,p.y-acid.y)>acid.r+game.CFG.hero.radius&&Math.hypot(p.x-blast.x,p.y-blast.y)>blast.r+game.CFG.hero.radius;
  const route=search(s,start,safe,[y-5,y-.5]);assert(route);const seconds=route.distance/speed;assert(seconds<rail.windup);
  s.hero.x=route.x;s.hero.y=route.y;const hp=s.hero.hp;
  game.Bosses.hitRails(s,{x:0,y:y-7,dx:0,dy:1,len:16,w:rail.w,dmg:rail.dmg,life:rail.sparkT});assert.equal(s.hero.hp,hp);
  results.push({id:'L13-supplied-rail-acid-blast',provenance:'Supplied Switchkeeper rail/acid/car overlap on actual L13 geometry; not a naturally spawned L13 attack',distance:route.distance,seconds,warning:rail.windup,remaining:rail.windup-seconds,end:[route.x,route.y],path:route.path});
 }else if(level===16){
  const start={x:0,y:y-4},route=search(s,start,p=>Math.hypot(p.x-m.point.x,p.y-y)<m.point.r*.7,[y-6,y+.5]);assert(route);
  results.push({id:'L16-safe-end-rod-approach',provenance:'Actual authored rod task is a live hold/release, not an independently damaging rod attack. Collision approach only; enemies remain a separate threat.',distance:route.distance,seconds:route.distance/speed,useT:m.useT,openT:m.openT,path:route.path});
 }else{
  for(const offset of [[0,-3.4],[2,-2],[-2,-2]]){
   const start={x:m.point.x+offset[0],y:y+offset[1]};game.World.clampHero(s,start);
   const route=search(s,start,p=>Math.hypot(p.x-m.point.x,p.y-y)<m.point.r*.85,[y-5,y+.3]);assert(route);
   const seconds=route.distance/speed;assert(seconds<c.waveWarn);s.hero.x=route.x;s.hero.y=route.y;const hp=s.hero.hp;
   for(let t=0;t<c.waveWarn+.03;t+=dt)game.RouteMilestones.step(s,dt);
   assert.equal(s.hero.hp,hp);assert(m.waves>=1);
   results.push({id:'L19-wave-'+offset.join(','),provenance:'Actual brace and real wave crest on authored deck; geometric arrival excludes human reaction delay',distance:route.distance,seconds,warning:c.waveWarn,remaining:c.waveWarn-seconds,path:route.path});
   m.waves=0;m.wave=0;m.warn=false;m.waveStarted=false;
  }
 }
}
fs.writeFileSync('reviews/telemetry/experiential/overlap-reachability.json',JSON.stringify(results,null,2)+'\n');
console.log(results.map(r=>({id:r.id,seconds:r.seconds||r.secondsAtActualSpeed,warning:r.warning})));
