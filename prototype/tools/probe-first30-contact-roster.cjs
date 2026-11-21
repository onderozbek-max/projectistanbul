// Supplemental actual weapon-vs-boss/prop checks. Supplied scenes, never earned campaign or visual acceptance.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const tag=process.env.RESET_BUILD||'candidate13',{loadP}=require('/private/tmp/istanbul-reset-'+tag+'-checks-20261120/prototype/tools/lib-load.js'),app=loadP(),dt=1/60,rows=[];
const source=JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/'+tag+'.json'));
for(const id of app.CFG.arsenal.weapons)for(const rank of[1,3,5])for(const type of['boss','prop']){
 const s=app.createSim(42,{levelIndex:Math.max(3,app.CFG.unlock.weapons[id]||1),tramRhythm:true});app.startPlay(s);
 s.hero.x=0;s.hero.y=60;s.hero.invuln=Infinity;s.hero.weapons={[id]:rank};s.hero.passives={};s.obj=null;s.gen.marks=[];s.gen.routeSpent=Infinity;s.enemyTele=[];s.enemies=[];s.events=[];
 if(s.milestone){s.milestone.open=true;s.milestone.opening=1;}s.env.recs=[];s.env.cables=[];s.env.portals=[];s.geo.blocks=[];s.props.routeEdges=[];
 let target;
 if(type==='boss'){target=app.Bosses.spawn(s,'brute',1.1,60,{preset:'switchkeeper',hoodIdx:0,nameKey:'boss.switchkeeper'});target.hp=target.maxHp=1e6;target.state='active';target.speed=0;target.ai.cd=99;}
 else{const block={kind:'bench',x:1.1,y:60,w:.6,h:1.8,rc:{xMin:.8,xMax:1.4,yMin:59.1,yMax:60.9}};s.geo.blocks.push(block);target=app.Env.adopt(s,block,'bench');target.hp=target.max=1e6;}
 const before={x:target.x,y:target.y,hp:target.hp},events=[];
 for(let i=0;i<600;i++){app.stepSim(s,dt,{x:Math.sin(i/17)*.04,y:0});events.push(...app.drainEvents(s));}
 const fires=events.filter(e=>e.type==='wfire'),hits=events.filter(e=>e.type==='hit'&&e.boss),propEvents=events.filter(e=>/^(envHit|envBreak|streetSwing|streetThrow|envExplode)$/.test(e.type));
 assert(fires.every(e=>e.variant===id),'Unrelated weapon in '+id+' '+type);
 assert(!events.some(e=>e.type==='nailFire'&&id!=='nailgun'),'Unrelated nails in '+id);
 const outcome={type,id,rank,before,after:{x:target.x,y:target.y,hp:target.hp,alive:!target.dead&&target.alive!==false,status:target.status},fired:fires.length,bossHitEvents:hits.length,propEvents:propEvents.length,damage:before.hp-target.hp,eventCounts:events.reduce((o,e)=>(o[e.type]=(o[e.type]||0)+1,o),{})};
 if(type==='boss'){assert(fires.length>0,id+' no boss action');assert(hits.length>0,id+' no actual boss contact');}
 rows.push(outcome);
}
fs.writeFileSync('reviews/telemetry/first30-reset/'+tag+'-contact-roster.json',JSON.stringify({source,method:'Supplied unlocked-level solo base rank1/3/5, static high-HP real Switchkeeper or high-HP actual bench record, 10 seconds real sim and slight ordinary movement. Existing route/spawns suppressed; no claim of ordinary balance or visible craft. Prop inability is retained in data rather than fabricated as a hit.',records:rows},null,2)+'\n');
console.log('All51 solo base/rank combinations reached a real boss; no unrelated weapon or nails. Prop outcomes recorded separately.');
