// Actual evolved contact/status against a real boss and prop, with all conditional fixtures explicit.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),tag=process.env.RESET_BUILD||'candidate15';
const app=require('/private/tmp/istanbul-reset-'+tag+'-checks-20261120/prototype/tools/lib-load.js').loadP(),dt=1/60,records=[];
for(const id of Object.keys(app.CFG.evolutions))for(const type of['boss','prop']){
 const E=app.CFG.evolutions[id],s=app.createSim(42,{levelIndex:Math.max(12,app.CFG.unlock.weapons[E.from]||1,E.unlock||1),tramRhythm:true});app.startPlay(s);
 s.hero.x=0;s.hero.y=60;s.hero.invuln=Infinity;s.hero.hp=s.hero.maxHp*.5;s.hero.weapons={[E.from]:5};s.hero.passives=E.passive?{[E.passive]:1}:{};s.enemies=[];s.enemyTele=[];s.geo.blocks=[];s.geo.zones=[];s.env.recs=[];s.env.portals=[];s.env.cables=[];s.env.zones=[];s.props.routeEdges=[];s.streetSite=null;s.gen.marks=[];s.gen.routeSpent=Infinity;s.obj=null;
 s.milestone=null;app.Horde.step=()=>{};
 app.Progression.evolve(s,{evo:E.from,item:id});s.events=[];
 let target;if(type==='boss'){target=app.Bosses.spawn(s,'brute',1.1,60,{preset:'switchkeeper',hoodIdx:0,nameKey:'boss.switchkeeper'});target.hp=target.maxHp=1e6;target.state='active';target.speed=0;target.ai.cd=99;}
 else{const b={kind:'bench',x:1.1,y:60,w:.6,h:1.8,rc:{xMin:.8,xMax:1.4,yMin:59.1,yMax:60.9}};s.geo.blocks.push(b);target=app.Env.adopt(s,b,'bench');target.hp=target.max=1e6;}
 if(type==='prop'||id==='carbomb')for(let i=0;i<8;i++){const a=i*2.4,e=app.Combat.spawnEnemy(s,'walker',1.2+Math.cos(a)*.4,60+Math.sin(a)*.4,{state:'active'});e.hp=e.maxHp=1e6;e.speed=.01;}
 if(id==='arcchain')s.env.zones.push({kind:'puddle',x:0,y:60,r:8,t:99,T:99,arcT:0});
 if(id==='carbomb'){assert(app.Env.addSolid(s,'car',2.8,61.4,1.3,2.4));}
 if(id==='stormshield'){s.hero.invuln=0;s.hero.passives.nazar=5;}
 const initial=target.hp,events=[];
 for(let i=0;i<900;i++){
  if(id==='stormshield'&&i%30===0){s.hero.iframes=0;app.Combat.damageHero(s,1,'walker',s.enemies[0]||target);}
  if(id==='foamstorm'&&i%20===0)app.Enemies.lob(s,s.enemies[0]||target,s.hero.x,s.hero.y,app.CFG.enemies.spitter.glob,2,1,'spitter');
  app.stepSim(s,dt,{x:Math.sin(i/23)*.04,y:0});events.push(...app.drainEvents(s));
 }
 const hits=events.filter(e=>e.type==='hit'&&e.boss&&e.weaponVariant===id);
 if(type==='boss')assert(hits.length>0,id+' must damage the actual boss with its own attributed behavior');
 records.push({id,type,seconds:s.runT,damage:initial-target.hp,bossHits:hits.length,evolutionUse:s.evolutionUse?.[id],actualTarget:{x:target.x,y:target.y,stun:target.stun,pin:target.pin,hook:target.hook,status:target.status,alive:!target.dead&&target.alive!==false},counts:events.reduce((o,e)=>(o[e.type]=(o[e.type]||0)+1,o),{})});
}
fs.writeFileSync('reviews/telemetry/first30-reset/'+tag+'-evolution-contact.json',JSON.stringify({source:JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/'+tag+'.json')),fixture:true,conditions:'Supplied legally unlocked base5/paired passive and actual evolve, halfHP observer, actual static high-HP Switchkeeper or actual high-HP bench,15s normal sim. Appropriate wet/car/spit/Nazar source conditions supplied, no hit/result supplied. Prop misses are retained. Not earned acquisition, presentation or player acceptance.',records},null,2)+'\n');console.log('All18 evolutions reached a real boss; separate prop/status/conditional outcomes retained.');
