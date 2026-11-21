// Explicitly supplied diagnostic geometry; never reused as earned-play evidence.
'use strict';
function weaponFixture(id,rank,evolution){
 const s=P.debug.sim,h=s.hero;h.weapons={};h.passives={};
 const base=evolution?P.CFG.evolutions[id].from:id;
 P.Progression.debugGrant(s,{weapons:{[base]:evolution?5:rank}});
 if(evolution)P.Progression.evolve(s,{evo:base,item:id});
 for(let i=0;i<28;i++){
  const a=i*2.399,r=i<8?1.2+i%3*.28:2.5+(i%6)*.55;
  const e=P.Combat.spawnEnemy(s,i%9===0?'hardhat':'walker',h.x+Math.cos(a)*r,h.y+Math.sin(a)*r,{state:'active'});
  e.hp=e.maxHp=10000;e.speed=.04;
 }
 if(evolution){
  h.hp=h.maxHp*.5;
  if(id==='arcchain')s.env.zones.push({kind:'puddle',x:h.x,y:h.y,r:8,arcT:0,t:99,T:99});
  if(id==='carbomb'){
   let car=null;
   for(const x of [3.8,-3.8,0])for(const dy of [2,5,-3]){
    if(!car&&P.Env.addSolid(s,'car',x,h.y+dy,1.3,2.8))car=s.env.recs.at(-1);
   }
   if(!car||car.kind!=='car')throw Error('Conditional fixture requires an actual inserted live car');
   s.enemies.slice(0,18).forEach((e,i)=>{e.x=car.x+Math.cos(i*2.4)*.65;e.y=car.y+Math.sin(i*2.4)*.65;});
  }
  if(id==='stormshield'){h.invuln=0;h.iframes=0;h.hp=h.maxHp;h.passives.nazar=5;s.enemies.slice(0,6).forEach((e,i)=>{e.x=h.x+Math.cos(i)*.58;e.y=h.y+Math.sin(i)*.58;});}
  if(id==='foamstorm')window.conditionTimer=setInterval(()=>{const e=s.enemies.find(e=>!e.dead);if(e)P.Enemies.lob(s,e,h.x,h.y,P.CFG.enemies.spitter.glob,2,1,'spitter');},350);
 }
}
module.exports={weaponFixture};
