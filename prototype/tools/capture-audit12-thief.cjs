// Actual gull theft/return with explicitly supplied actor/loot preconditions, never earned difficulty proof.
'use strict';const fs=require('node:fs'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const out='reviews/media/R1/audit12-implementation/integrated9-thief';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await openBrowser('http://127.0.0.1:8847/?level=22&seed=42&skipintro=1&lang=en');try{
 await b.until(()=>b.evaluate('P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'ready');
 await b.evaluate('window.nativeStory=P.Story.play;P.Story.play=function(n,w,d,s){if(w==="intro"){d();return false}return nativeStory(n,w,d,s)};document.getElementById("btn-start").click()',true);
 await b.until(()=>b.evaluate('P.debug.state==="play"'),'play');
 await b.evaluate(`(()=>{const s=P.debug.sim;s.hero.weapons={};s.hero.invuln=Infinity;s.hero.x=0;s.hero.y=60;s.enemies=[];s.drops=[];s.env.portals=[];s.gen.mi=s.gen.marks.length;s.milestone.open=true;P.Horde.step=()=>{};P.Progression.addXp=()=>{};P.Comic.clearRunDialogue();P.Barks.clear();P.Barks.setEnabled(false);P.Input.get=()=>({x:0,y:0});window.thiefEvents=[];const drain=P.drainEvents;P.drainEvents=function(s){const es=drain(s);for(const e of es)if(['martiShadow','martiSteal','martiReturn','martiGone','heroHit'].includes(e.type))thiefEvents.push({t:s.runT,...e});return es};P.Fx.reset(s);})()`);
 const film=await recordDOM(b,out+'/actual-gull-theft-return.mp4',async()=>{
  await b.evaluate(`(()=>{const s=P.debug.sim,e=P.Combat.spawnEnemy(s,'walker',1.5,62,{state:'active'});P.Combat.damageEnemy(s,e,10000,1,0,0,false,'knife');window.thief=P.Combat.spawnEnemy(s,'marti',1.4,64,{state:'active'});thief.hp=thief.maxHp=10000;window.thiefHp=s.hero.hp;})()`);
  await b.until(()=>b.evaluate('thiefEvents.some(e=>e.type==="martiSteal"&&e.id===thief.id)'),'same gull actual XP theft',15000);await b.shot(out+'/stolen.png');await b.sleep(700);
  await b.evaluate('P.Combat.damageEnemy(P.debug.sim,thief,thief.hp*2,1,0,0,false,"knife")');
  await b.until(()=>b.evaluate('thiefEvents.some(e=>e.type==="martiReturn"&&e.id===thief.id)'),'actual returned loot',5000);await b.sleep(900);await b.shot(out+'/returned.png');
  return b.evaluate('({id:thief.id,events:thiefEvents,hpBefore:thiefHp,hpAfter:P.debug.sim.hero.hp,drops:P.debug.sim.drops.map(d=>({kind:d.kind,value:d.value,x:d.x,y:d.y}))})');
 },{nativeCanvas:false});
 const es=film.outcome.events,a=es.find(e=>e.type==='martiSteal'),z=es.find(e=>e.type==='martiReturn');assert(a&&z&&z.value>=a.value);assert(!es.some(e=>e.type==='heroHit'));
 fs.writeFileSync(out+'/index.json',JSON.stringify({source:JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/audit12-integrated9.json')),fixture:true,
 supplied:'Quiet natural-L22 gull, no weapons/ambient horde, invulnerable stationary observer, real walker death from supplied lethal hit creates actual loot, gull HP supplied only for observation. Actual same-ID dive/theft/flee then supplied lethal contact and actual returned XP/bonus; no carried-XP/AI/outcome flags supplied. Viewport original time/audio, no native-canvas or earned/player claim.',...film,errors:b.errors},null,2)+'\n');assert.equal(b.errors.length,0,b.errors.join('\n'));console.log('PASS same gull steals and returns actual XP; no damaging contact');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
