// Paired real lethal-contact fixture; unlike earlier staging fixtures, no invulnerability hides post-defeat damage.
'use strict';const fs=require('node:fs'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const out='reviews/media/R1/audit12-implementation/Fisher-defeat-regression-retry1';fs.mkdirSync(out,{recursive:true});const rows=[];
const text=fs.readFileSync('prototype/tools/capture-experience.cjs','utf8'),prep=text.slice(text.indexOf('function prepareBoss('),text.indexOf('function prepareWorld('));
(async()=>{for(const [tag,port]of[['audit12-integrated9',8847],['audit12-integrated10',8848]]){
 const b=await openBrowser('http://127.0.0.1:'+port+'/?level=20&seed=42&skipintro=1&lang=en');try{
 await b.until(()=>b.evaluate('P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'ready');
 await b.evaluate('P.Settings.firstRunDone=true;window.oldStory=P.Story.play;P.Story.play=function(n,w,d,s){if(w==="intro"){d();return false}return oldStory(n,w,d,s)};document.getElementById("btn-start").click()',true);await b.until(()=>b.evaluate('P.debug.state==="play"'),'play');
 await b.evaluate(`(()=>{${prep}prepareBoss(20);const s=P.debug.sim;s.enemies=[s.gen.boss];s.env.portals=[];s.gen.mi=s.gen.marks.length;P.Progression.addXp=()=>{};P.Input.get=()=>({x:0,y:0});window.defeatEvents=[];const drain=P.drainEvents;P.drainEvents=function(s){const es=drain(s);for(const e of es)if(['bossDie','heroHit','win','revive'].includes(e.type))defeatEvents.push({t:s.runT,...e});return es};})()`);
 await b.until(()=>b.evaluate('P.SceneFlow.current()?.kind==="entry"'),'entry');await b.until(()=>b.evaluate('!P.SceneFlow.current()'),'entry handback');
 const media=await recordDOM(b,out+'/'+tag+'.mp4',async()=>{
  await b.evaluate('(()=>{const s=P.debug.sim,e=s.gen.boss;s.hero.hp=1;s.hero.invuln=0;s.hero.iframes=0;s.hero.x=e.x+.7;s.hero.y=e.y-1.3;P.Combat.damageEnemy(s,e,e.hp*30,1,0,0,false,"knife")})()');
  await b.sleep(900);await b.shot(out+'/'+tag+'-defeat.png');const immediate=await b.evaluate('({mode:P.debug.sim.mode,hp:P.debug.sim.hero.hp,bossDead:P.debug.sim.gen.boss.dead,state:P.debug.state,events:defeatEvents})');
  await b.sleep(3500);return immediate;
 },{nativeCanvas:false});
 assert(media.outcome.bossDead);assert.equal(media.outcome.hp,port===8847?0:1);assert.equal(media.outcome.events.some(e=>e.type==='heroHit'),port===8847);assert.equal(b.errors.length,0,b.errors.join('\n'));
 rows.push({build:tag,source:JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/'+tag+'.json')),fixture:true,supplied:'Same real L20 boss/arena/seed, quiet supplied observation state and already-completed-first-run setting (so the fresh-profile automatic first-run rescue does not conceal the damage), no weapons/ambient spawns/XP, actual protected entry, then supplied1HP/near position and real lethal knife contact. Hero invulnerability/iframes explicitly zero. No death/outcome flag supplied. Original-time viewport/audio; not an earned fight or human acceptance.',...media,errors:b.errors});fs.writeFileSync(out+'/index.json',JSON.stringify(rows,null,2)+'\n');console.log(tag,media.outcome.mode,media.outcome.hp);
 }finally{await b.close();}
}})().catch(e=>{console.error(e);process.exitCode=1});
