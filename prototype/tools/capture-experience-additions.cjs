// Supplemental desktop evidence, with supplied scene/crowd states explicitly identified.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {openBrowser}=require('./lib-experiential-browser.cjs');
const {recordDOM}=require('./lib-experiential-record.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8775';
const out=path.resolve(process.env.AUDIT8_OUT||'reviews/media/R1/experiential');
const manifest=JSON.parse(fs.readFileSync(process.env.AUDIT8_MANIFEST||'reviews/telemetry/experiential/build.json','utf8'));
const old=fs.readFileSync(path.join(__dirname,'capture-experience.cjs'),'utf8');
const bossSource=old.slice(old.indexOf('function prepareBoss('),old.indexOf('function prepareWorld('));
const results=fs.existsSync(path.join(out,'index-additions.json'))?JSON.parse(fs.readFileSync(path.join(out,'index-additions.json'),'utf8')):[];
async function start(b,level,lang='en'){
 await b.send('Page.navigate',{url:origin+'/?level='+level+'&seed=42&lang='+lang+'&skipintro=1'});
 await b.until(()=>b.evaluate("!!window.P?.debug&&P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'title');
 await b.evaluate("window.keepStory=P.Story.play;P.Story.play=function(n,when,done,s){if(when==='intro'){done();return false;}return keepStory(n,when,done,s);};document.getElementById('btn-start').click()",true);
 await b.until(()=>b.evaluate("P.debug.state==='play'"),'normal play');
 await b.evaluate(`window.evidenceEvents=[];window.evidenceDrain=P.drainEvents;P.drainEvents=function(s){const events=evidenceDrain(s);events.forEach(e=>{if(['dash','heroHit','death','bossDie','hit'].includes(e.type))evidenceEvents.push({t:s.runT,...e});});return events;};`);
}
async function capture(b,id,act,supplied){
 const captured=new Date().toISOString();
 const r=await recordDOM(b,path.join(out,id+'.mp4'),act);
 await b.shot(path.join(out,id+'.png'));
 const facts=await b.evaluate(`({state:P.debug.state,t:P.debug.sim?.runT,settings:P.Settings,quality:P.Quality.tier,
  events:window.evidenceEvents||[],weapons:P.debug.sim?.hero.weapons,scene:P.SceneFlow.current()?.id,music:P.Music.audibleTracks()})`);
 if(b.errors.length)throw Error(b.errors.join('\n'));
 const i=results.findIndex(x=>x.id===id);if(i>=0)results.splice(i,1);
 results.push({id,file:id+'.mp4',still:id+'.png',captured,sourceManifest:manifest.runtime_manifest_sha256,
  provenance:'Desktop Chrome, 390×844, DPR1, original viewport timestamps and post-master audio; seed42',fixture:true,supplied,...r,facts});
 fs.writeFileSync(path.join(out,'index-additions.json'),JSON.stringify(results,null,2)+'\n');console.log(id,r.outcome);
}
async function key(b,key,down=true){
 await b.send('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',code:key===' '?'Space':key==='Enter'?'Enter':'Key'+key.toUpperCase(),key,
  windowsVirtualKeyCode:key===' '?32:key==='Enter'?13:key.toUpperCase().charCodeAt(0)});
}
async function quiet(b){
 await b.evaluate(`(()=>{const s=P.debug.sim;s.enemies=[];s.hero.weapons={};s.hero.invuln=0;s.hero.iframes=0;
  P.Horde.step=()=>{};if(s.env)s.env.portals=[];if(s.milestone)s.milestone.open=true;if(s.gen)s.gen.mi=s.gen.marks.length;
  P.Comic.clearRunDialogue();P.Barks.clear();P.Barks.setEnabled(false);s.hero.x=0;s.hero.y=60;P.Fx.reset(s);})()`);
}
async function movement(b){
 await start(b,3);await quiet(b);
 await capture(b,'hero-dash-hit-defeat',async()=>{
  await key(b,'d');await b.sleep(1200);await key(b,' ');await key(b,' ',false);await b.sleep(600);
  await key(b,'d',false);await key(b,'a');await b.sleep(900);
  await b.evaluate(`(()=>{const s=P.debug.sim;s.hero.invuln=0;s.hero.iframes=0;P.Combat.damageHero(s,7,'walker',{id:999,type:'walker',x:s.hero.x+1,y:s.hero.y});})()`);
  await b.sleep(800);await key(b,'a',false);await b.sleep(650);await key(b,'w');await b.sleep(1000);await key(b,'w',false);
  await b.evaluate(`(()=>{const s=P.debug.sim;s.hero.invuln=0;s.hero.iframes=0;P.Settings.firstRunDone=true;P.Combat.damageHero(s,s.hero.hp+1000,'walker');})()`);
  await b.sleep(2500);return b.evaluate('({state:P.debug.state,dashes:evidenceEvents.filter(e=>e.type==="dash").length,hp:P.debug.sim.hero.hp})');
 },'Quiet valid L3 lane, disabled ambient spawns, no weapon; real keyboard movement/reversal/Space Dash; supplied positive real damage and lethal hit. Not an earned defeat.');
 const outcome=results.at(-1).outcome;if(!outcome.dashes||outcome.state!=='down'||outcome.hp>0)throw Error('Actual Dash and defeat were not both recorded');
}
async function multi(b){
 for(const low of [false,true]){
  await start(b,3);await quiet(b);
  await b.evaluate(`(()=>{const s=P.debug.sim;s.hero.invuln=10000;P.Progression.debugGrant(s,{weapons:{knife:5,chain:5,chainsaw:5,cable:5,sledge:5,nailgun:5}});
   P.Settings.reduceMotion=${low};P.Settings.reduceFlash=${low};P.applySettings();P.Quality.set(${low?2:0});
   for(let i=0;i<96;i++){const a=i*2.39996323,r=2+(i%7)*.45;P.Combat.spawnEnemy(s,i%3?'walker':'runner',s.hero.x+Math.cos(a)*r,s.hero.y+Math.sin(a)*r,{state:'active'});}
   s.enemies.forEach(e=>{e.hp=e.maxHp=10000;});
   const realStep=P.stepSim;P.stepSim=function(run,dt,input){realStep(run,dt,input);run.drops=run.drops.filter(d=>d.kind!=='xp');run.xp=0;run.pendingLevels=0;run.pendingChests=0;};
  })()`);
  await capture(b,'multiweapon-'+(low?'minimum-reduced':'default'),async()=>{
   await key(b,'d');await b.sleep(1900);await key(b,'d',false);await key(b,'w');await b.sleep(1900);
   await key(b,'w',false);await key(b,'a');await b.sleep(1900);await key(b,'a',false);await b.sleep(2000);
   return b.evaluate('({slots:Object.keys(P.debug.sim.hero.weapons).length,hits:evidenceEvents.filter(e=>e.type==="hit").length})');
  },'Six legal base weapon slots, all supplied rank5; 96 supplied live high-HP enemies, invulnerable hero, no XP/card interruption or ambient spawns; real keyboard run+automatic attacks. Not earned progression.');
  const result=results.at(-1).outcome;if(result.slots!==6||!result.hits)throw Error('Actual six-weapon hits were not observed');
 }
}
async function major(b,level,lang,deferDefeat=false){
 await start(b,level,lang);
 await b.evaluate(`P.Settings.textSize=150;P.Settings.reduceMotion=true;P.Settings.reduceFlash=true;P.Settings.sound=false;P.Settings.musicVol=0;P.Settings.sfxVol=0;P.Quality.set(2);Object.keys(P.Settings.sceneSeen||{}).forEach(k=>delete P.Settings.sceneSeen[k]);P.applySettings();P.saveSettings();`);
 await b.evaluate(`(()=>{${bossSource} prepareBoss(${level});})()`);
 await b.until(()=>b.evaluate('P.SceneFlow.running(P.debug.sim)'),'boss entry');
 await b.evaluate('P.SceneFlow.finish(true)');
 if(!deferDefeat){
  await b.evaluate(`(()=>{const s=P.debug.sim,b=s.gen.boss;P.Combat.damageEnemy(s,b,b.hp*20,1,0,1,false,'knife');})()`);
  await b.until(()=>b.evaluate('!!P.SceneFlow.current()?.ownsStory'),'actual defeat aftermath');
 }
}
async function scenes(b){
 for(const level of [20,25,30])for(const lang of ['tr','en']){
  await major(b,level,lang,true);
  await capture(b,'major-L'+level+'-'+lang+'-accessible',async()=>{
   await b.evaluate(`(()=>{const s=P.debug.sim,b=s.gen.boss;P.Combat.damageEnemy(s,b,b.hp*20,1,0,1,false,'knife');})()`);
   await b.until(()=>b.evaluate('!!P.SceneFlow.current()?.ownsStory'),'actual defeat aftermath');
   const runT=await b.evaluate('P.debug.sim.runT');
   await b.until(()=>b.evaluate('P.SceneFlow.current()?.t>=3&&!P.SceneFlow.current()?.storyStarted'),'unobstructed human world action');
   await b.shot(path.join(out,'major-L'+level+'-'+lang+'-world.png'));
   await b.until(()=>b.evaluate('!!P.SceneFlow.current()?.storyStarted'),'native reading phase');await b.sleep(1600);
   await b.shot(path.join(out,'major-L'+level+'-'+lang+'-reading.png'));
   const held=await b.evaluate('!P.Input.enabled&&P.debug.sim.runT==='+runT);
   await b.evaluate('P.Comic.skipPage()');await b.sleep(800);
   const restored=await b.evaluate('!P.SceneFlow.running(P.debug.sim)&&P.Input.enabled');
   if(!held||!restored)throw Error('Protected reading/restoration failed');return{held,restored};
  },'Actual bossDie supplied by real lethal damage to a real spawned boss; supplied hero invulnerability/position, no weapons/ambient horde, skipped intro. TR/EN max text150, mute, reduced motion/flash, quality2; no win/result supplied.');
 }
}
async function failure(){
 const b=await openBrowser('about:blank',{waitForGame:false});
 try{
  await b.send('Network.enable');await b.send('Network.setBlockedURLs',{urls:['*assets/comic/cast-core.webp*','*assets/comic/kaan-farewell.webp*']});
  await major(b,25,'en');
  await b.until(()=>b.evaluate("document.querySelectorAll('.cm-art-notice button').length===2"),'current-art failure buttons');
  await b.shot(path.join(out,'comic-current-art-failure.png'));
  await capture(b,'comic-current-art-neutral',async()=>{
   await b.evaluate("document.querySelector('.cm-art-notice button:last-child').click()",true);await b.sleep(6900);
   await key(b,'Enter');await key(b,'Enter',false);await b.sleep(1500);
   await b.shot(path.join(out,'comic-current-art-neutral-reading.png'));await b.evaluate('P.Comic.skipPage()');await b.sleep(500);
   return b.evaluate('({input:P.Input.enabled,protected:P.SceneFlow.running(P.debug.sim)})');
  },'Real blocked approved comic requests; explicit Read without art yields neutral composition and current native text, no retired character fallback. Supplied boss defeat; accessibility settings as major fixtures.');
  await major(b,25,'tr');
  await b.until(()=>b.evaluate("document.querySelectorAll('.cm-art-notice button').length===2"),'retry notice');
  await capture(b,'comic-current-art-retry',async()=>{
   await b.send('Network.setBlockedURLs',{urls:[]});await b.evaluate("document.querySelector('.cm-art-notice button').click()",true);
   await b.until(()=>b.evaluate("!document.querySelector('.cm-art-notice')"),'approved images recovered');await b.sleep(7300);
   await key(b,'Enter');await key(b,'Enter',false);await b.sleep(1500);await b.shot(path.join(out,'comic-current-art-recovered.png'));
   await b.evaluate('P.Comic.skipPage()');await b.sleep(400);return{recovered:true};
  },'Same required-current-art network failure; unblock then actual Retry reloads missing approved assets. No substituted source; supplied boss defeat.');
 }finally{await b.close();}
}
async function reload(b){
 const sample=fs.readFileSync('reviews/telemetry/experiential/earned-broad.jsonl','utf8').trim().split('\n').map(JSON.parse).find(r=>r.level===25&&r.result==='win');
 await b.evaluate('Object.assign(P.Meta.state(),'+JSON.stringify(sample.saveBefore)+');P.Meta.Save.write(P.Meta.state());');
 await major(b,25,'en');
 const before=await b.evaluate('({stars:P.Meta.state().stars[25]||0,unlocked:P.Meta.state().unlocked,scene:P.SceneFlow.current().id,seen:!!P.Settings.sceneSeen[P.SceneFlow.current().id]})');
 await b.shot(path.join(out,'scene-reload-before.png'));
 await b.send('Page.reload');
 await b.until(()=>b.evaluate("!!window.P?.debug&&P.ArtRaster.heroState()==='ready'&&['title','map'].includes(P.debug.state)"),'supported reload boundary');
 await b.shot(path.join(out,'scene-reload-after.png'));
 const after=await b.evaluate('({state:P.debug.state,stars:P.Meta.state().stars[25]||0,unlocked:P.Meta.state().unlocked,seen:!!P.Settings.sceneSeen['+JSON.stringify(before.scene)+'],protected:P.SceneFlow.running(P.debug.sim)})');
 if(before.stars!==0||after.stars!==0||before.seen||after.seen||after.protected||after.unlocked!==before.unlocked)throw Error('Reload invented a clear or scene completion');
 const i=results.findIndex(x=>x.id==='protected-reload');if(i>=0)results.splice(i,1);
 results.push({id:'protected-reload',fixture:true,sourceManifest:manifest.runtime_manifest_sha256,captured:new Date().toISOString(),
  provenance:'Desktop Chrome 390×844 DPR1, actual Page.reload during protected native aftermath. Earned pre-clear permanent save; supplied boss defeat, not an earned fight.',
  before,after,images:['scene-reload-before.png','scene-reload-after.png'],limit:'Existing permanent-state recovery returns to title/map; no new arbitrary mid-simulation resume is claimed.'});
 fs.writeFileSync(path.join(out,'index-additions.json'),JSON.stringify(results,null,2)+'\n');console.log('protected reload',after);
}
async function main(){
 const mode=process.argv[2]||'movement';if(mode==='failure')return failure();
 const b=await openBrowser(origin+'/?lang=en');try{if(mode==='movement')await movement(b);else if(mode==='multi')await multi(b);else if(mode==='scenes')await scenes(b);else if(mode==='reload')await reload(b);else throw Error('Unknown mode');}finally{await b.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
