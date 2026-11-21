// Deterministic supplied-condition diagnostics. These do not claim earned acquisition or enjoyment.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const tag=process.env.RESET_BUILD||'candidate13',game=require('/private/tmp/istanbul-reset-'+tag+'-checks-20261120/prototype/tools/lib-load.js').loadP(),records=[];
function scenario(id,evolved,condition=true){
 const recipe=game.CFG.evolutions[id],level=Math.max(12,game.CFG.unlock.weapons[recipe.from]||1,recipe.unlock||1);
 const s=game.createSim(42,{levelIndex:level,tramRhythm:true});game.startPlay(s);
 const h=s.hero;h.x=0;h.y=60;h.hp=h.maxHp*.5;h.weapons={[recipe.from]:5};h.passives={};h.invuln=10000;
 if(recipe.passive)h.passives[recipe.passive]=1;
 s.geo.blocks=[];s.env.recs=[];s.enemies=[];
 if(evolved)game.Progression.evolve(s,{evo:recipe.from,item:id});
 for(let i=0;i<24;i++){
  const a=i*2.399,r=.9+i%5*.55,e=game.Combat.spawnEnemy(s,i%8===0?'hardhat':'walker',Math.cos(a)*r,60+Math.sin(a)*r,{state:'active'});
  e.hp=e.maxHp=100000;
 }
 if(condition&&id==='arcchain')s.env.zones.push({kind:'puddle',x:0,y:60,r:8,arcT:0,t:99,T:99});
 if(id==='carbomb'){
  if(condition)assert(game.Env.addSolid(s,'car',1.5,61.5,1.3,2.8),'Actual car insertion');
  s.enemies.forEach((e,i)=>{e.x=1.5+Math.cos(i*2.4)*.55;e.y=61.5+Math.sin(i*2.4)*.55;});
 }
 if(condition&&id==='stormshield'){h.invuln=0;h.passives.nazar=5;}
 const initial=h.hp;
 for(let i=0;i<720;i++){
  const dt=1/60;s.t+=dt;s.runT+=dt;
  if(condition&&id==='foamstorm'&&i%20===0)game.Enemies.lob(s,s.enemies[0],h.x,h.y,game.CFG.enemies.spitter.glob,2,1,'spitter');
  if(condition&&id==='stormshield'&&i%30===0){h.iframes=0;game.Combat.damageHero(s,1,'walker',s.enemies[0]);}
  game.Weapons.step(s,dt);game.Combat.updateBurnAndZones(s,dt);
 }
 const hits=s.events.filter(e=>e.type==='hit'),counts={};for(const e of s.events)counts[e.type]=(counts[e.type]||0)+1;
 return {id,evolved,condition,level,seconds:s.runT,hpBefore:initial,hpAfter:h.hp,damage:hits.reduce((n,e)=>n+(e.dmg||0),0),
  targets:[...new Set(hits.map(e=>e.id))],counts,use:s.evolutionUse?.[id],terrain:s.events.filter(e=>e.type==='envHit').map(e=>e.kind),
  controls:s.enemies.map(e=>({id:e.id,slow:e.slow,stun:e.stun,pin:e.pin,hook:e.hook}))};
}
for(const id of Object.keys(game.CFG.evolutions)){
 const base=scenario(id,false),evolved=scenario(id,true);assert(evolved.use?.hits>0,id+' must hit real targets');
 const row={id,base,evolved};
 if(['arcchain','carbomb','foamstorm','stormshield'].includes(id))row.withoutCondition=scenario(id,true,false);
 if(id==='carbomb'){assert(evolved.terrain.includes('car'));assert(evolved.damage>row.withoutCondition.damage,'Car must change actual blast damage');}
 if(id==='arcchain')assert(evolved.counts.arcZap>row.withoutCondition.counts.arcZap,'Wet must add real arc jumps');
 if(id==='blacksmith')assert(evolved.hpAfter>evolved.hpBefore,'Slam must actually restore HP');
 if(id==='foamstorm')assert(evolved.counts.spitBlock>0,'Foam must intercept actual spit');
 if(id==='stormshield')assert(evolved.counts.nazarDodge>0,'Real Nazar trigger');
 if(id==='lake')assert(evolved.counts.lakeMerge>0,'Real pools merge');
 records.push(row);
}
fs.writeFileSync('reviews/telemetry/first30-reset/'+tag+(process.env.RESET_EVIDENCE_SUFFIX||'')+'-conditional-effects.json',JSON.stringify({
 source:JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/'+tag+'.json')),fixture:true,
 supplied:'Actual legal base/evolution unlock level (minimum12); supplied rank5/paired passive and24 live high-HP stationary targets, no ambient spawns, twelve seconds. Appropriate real car/wet/spit/Nazar contacts; half HP for healing. No earned progression or human-play claim.',records},null,2)+'\n');
console.log('All18 effects attributed; matched car/wet conditions and real heal/foam/Nazar/lake controls verified.');
