// Normal-speed desktop browser recordings. All lab power/crowds are explicitly supplied fixtures.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {openBrowser}=require('./lib-experiential-browser.cjs');
const out=path.resolve(process.env.ISTANBUL_CAPTURE||'reviews/media/R1/experiential');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8775';
const build=JSON.parse(fs.readFileSync('reviews/telemetry/experiential/build.json','utf8'));
fs.mkdirSync(out,{recursive:true});
const resume=process.env.ISTANBUL_CAPTURE_RESUME,only=process.env.ISTANBUL_CAPTURE_ONLY;
const index=resume?JSON.parse(fs.readFileSync(path.join(out,resume),'utf8')):[];
const selected=name=>!only||only.split(',').includes(name);
async function record(b,name,duration,action,details={}) {
 const start=Date.now();
 await b.evaluate(`(() => {
  const output=P.Sfx.captureOutput(),destination=output.context.createMediaStreamDestination();
  output.connect(destination);const stream=document.getElementById('game').captureStream(30);
  destination.stream.getAudioTracks().forEach(track=>stream.addTrack(track));
  const chunks=[],recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,opus',videoBitsPerSecond:700000});
  window.experienceRecording={recorder,chunks,stream,destination,output};
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.start(250);
 })()`,true);
 if(action)await action();else await b.sleep(duration*1000);
 const encoded=await b.evaluate(`new Promise(resolve=>{const r=experienceRecording;
  r.recorder.onstop=()=>{const reader=new FileReader();reader.onload=()=>{resolve(reader.result.split(',')[1]);
   r.output.disconnect(r.destination);r.stream.getTracks().forEach(t=>t.stop());};reader.readAsDataURL(new Blob(r.chunks,{type:'video/webm'}));};r.recorder.stop();})`);
 fs.writeFileSync(path.join(out,name+'.webm'),Buffer.from(encoded,'base64'));
 await b.shot(path.join(out,name+'.png'));
 const facts=await b.evaluate(`({state:P.debug.state,t:P.debug.sim?.runT,events:window.experienceEvents||[],quality:P.Quality.tier,
  art:P.ArtRaster.status(),settings:P.Settings,evolutionUse:P.debug.sim?.evolutionUse})`);
 facts.frameErrors=b.errors.slice();if(facts.frameErrors.length)throw Error(facts.frameErrors.join("\n"));
 const prior=index.findIndex(r=>r.id===name);if(prior>=0)index.splice(prior,1);
 index.push({id:name,file:name+'.webm',still:name+'.png',captured:new Date(start).toISOString(),wallSeconds:(Date.now()-start)/1000,
  provenance:'Desktop Chrome, 390×844, DPR 1, normal presentation speed',sourceManifest:build.runtime_manifest_sha256,seed:42,...details,facts});
 fs.writeFileSync(path.join(out,'index.json'),JSON.stringify(index,null,2)+'\n');
 console.log(name);
}
async function events(b){await b.evaluate(`window.experienceEvents=[];if(!window.experienceDrain){window.experienceDrain=P.drainEvents;P.drainEvents=function(s){const es=experienceDrain(s);es.forEach(e=>{if(['hit','kill','evolve','nazarDodge','dash','bossWindup','heroHit','pickup','routeBeat','revive'].includes(e.type))experienceEvents.push({t:s.runT,...e});});return es;};}`);}
async function start(b,level=1,cold=false){
 await b.send('Page.navigate',{url:origin+'/?level='+level+'&seed=42&lang=en'+(cold?'':'&skipintro=1')});
 await b.until(()=>b.evaluate("!!window.P?.debug&&P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'title');
 if(!cold)await b.evaluate("window.scenePlay=P.Story.play;P.Story.play=function(n,when,done,s){if(when==='intro'){done();return false;}return scenePlay(n,when,done,s);};");
 await b.evaluate("document.getElementById('btn-start').click()",true);
 await b.until(()=>b.evaluate(cold?"P.ColdOpen.active()":"P.debug.state==='play'"),'play');await events(b);
}
async function lab(b,id,rank) {
 await b.evaluate(`document.getElementById('weapon-lab-weapon').value=${JSON.stringify(id)};
 document.getElementById('weapon-lab-weapon').dispatchEvent(new Event('change'));
 document.getElementById('weapon-lab-'+${JSON.stringify(['one','two','three','four','five'][rank-1])}).click();
 document.getElementById('weapon-lab-start').click();`,true);
 await b.until(()=>b.evaluate("P.debug.state==='play'"),'lab');await events(b);await b.evaluate('experienceEvents.length=0');
}
function prepareBoss(level) {
 const s=P.debug.sim;
 P.Horde.step=()=>{};P.Story.playInRun=()=>false;
 const story=P.Story.play;P.Story.play=function(n,when,done,run){if(when==='boss'){done();return false;}return story(n,when,done,run);};
 s.hero.weapons={};s.hero.invuln=1e5;s.enemies=[];
 if(s.milestone)s.milestone.open=true;
 if(level<=5){if(s.gen)s.gen.mi=s.gen.marks.length;P.IstiklalTrial.startBoss(s);}
 else{const at=s.gen.marks.findIndex(m=>m.kind==='arena');s.gen.mi=at;s.hero.x=0;s.hero.y=s.gen.marks[at].y;P.Levels.step(s,0);}
 const boss=s.gen&&s.gen.boss||s.dir.trialBoss;
 s.hero.x=boss.x+.7;s.hero.y=boss.y-2.7;P.Fx.reset(s);P.Comic.clearRunDialogue();P.Barks.clear();
 return boss.bossPreset;
}
function prepareWorld(level) {
 const s=P.debug.sim,m=s.milestone;
 P.Horde.step=()=>{};P.Story.playInRun=()=>false;
 if(s.gen)s.gen.mi=s.gen.marks.length;
 s.enemies=[];s.hero.weapons={};s.hero.invuln=1e5;
 if(level===1){P.IstiklalTrial.startBoss(s);const b=s.dir.trialBoss;s.hero.x=b.x+1;s.hero.y=b.y-2.3;
  setTimeout(()=>P.Combat.damageEnemy(s,b,b.hp*10,1,0,0,false,'knife'),2100);
 }else{
  const q=P.RouteMilestones.target(s);if(q){s.hero.x=q[0];s.hero.y=q[1]-.4;P.World.clampHero(s,s.hero);}
  P.Input.get=function(){const q=P.RouteMilestones.target(s);if(!q)return{x:0,y:0};
   const dx=q[0]-s.hero.x,dy=q[1]-s.hero.y,d=Math.hypot(dx,dy);return d<.35?{x:0,y:0}:{x:dx/d,y:dy/d};};
 }
 P.Fx.reset(s);P.Comic.clearRunDialogue();P.Barks.clear();
 return {route:s.routeTrial,kind:m&&m.kind};
}
async function actors(b) {
 await start(b,3);await b.evaluate(`(()=>{const s=P.debug.sim;s.hero.invuln=1e5;s.hero.weapons={};s.enemies=[];if(s.env)s.env.portals=[];if(s.milestone)s.milestone.open=true;P.Horde.step=()=>{};s.gen.mi=s.gen.marks.length;P.Comic.clearRunDialogue();P.Barks.clear();P.Barks.setEnabled(false);})()`);
 const directions=[['w',87],['d',68],['s',83],['a',65],['w,d',87],['s,d',83],['s,a',83],['w,a',87]];
 await record(b,'hero-eight-directions',18,async()=>{
  for(const [keys]of directions){for(const key of keys.split(','))await b.send('Input.dispatchKeyEvent',{type:'keyDown',code:'Key'+key.toUpperCase(),key,windowsVirtualKeyCode:key.toUpperCase().charCodeAt(0)});
   await b.sleep(1300);for(const key of keys.split(','))await b.send('Input.dispatchKeyEvent',{type:'keyUp',code:'Key'+key.toUpperCase(),key,windowsVirtualKeyCode:key.toUpperCase().charCodeAt(0)});await b.sleep(350);}
 },{fixture:true,assists:'invulnerability, quiet lane, real keyboard input, eight directions and settlement'});
 const roles=await b.evaluate('Object.keys(P.CFG.experience.roleGait)');
 for(const role of roles){
  await b.evaluate(`(()=>{const s=P.debug.sim;s.enemies=[];s.enemyTele=[];s.hero.x=0;s.hero.y=60;P.Combat.spawnEnemy(s,${JSON.stringify(role)},2,65,{state:'active'});P.Fx.reset(s);})()`);
  await record(b,'enemy-'+role,10,async()=>{await b.sleep(7000);await b.evaluate(`(()=>{const s=P.debug.sim,e=s.enemies.find(e=>!e.dead&&e.type===${JSON.stringify(role)});if(e)P.Combat.damageEnemy(s,e,e.maxHp*20,1,0,1,false,'knife');})()`);await b.sleep(3000);},
   {fixture:true,role,assists:'one supplied live enemy, invulnerable observer; real lethal hit supplied after 7s to include death; natural burst may precede it'});
 }
}
async function main(){
 const mode=process.argv[2]||'weapons';
 const b=await openBrowser(origin+(mode==='weapons'||mode==='conditions'?'/?weaponlab=1&lang=en':'/?lang=en'));
 try{
  if(mode==='conditions') {
   await b.until(()=>b.evaluate("!!document.getElementById('weapon-lab-weapon')?.options.length&&P.ArtRaster.heroState()==='ready'"),'lab assets');
   for(const id of ['blacksmith','foamstorm','arcchain','carbomb','stormshield','lake']) {
    await lab(b,id,1);
    await b.evaluate(`(()=>{const s=P.debug.sim,h=s.hero;P.Progression.evolve(s,{evo:P.CFG.evolutions[${JSON.stringify(id)}].from,item:${JSON.stringify(id)}});h.hp=h.maxHp*.5;s.enemies.forEach(e=>{e.hp=e.maxHp=10000;e.speed=0;});
     if(['arcchain','stormshield'].includes(${JSON.stringify(id)}))s.enemies.slice(0,12).forEach((e,i)=>{const a=i*2.4,r=1.15+.3*(i%4);e.x=h.x+Math.cos(a)*r;e.y=h.y+Math.sin(a)*r;});
     if(${JSON.stringify(id)}==='stormshield'){h.invuln=0;h.iframes=0;h.hp=h.maxHp;h.passives.nazar=5;const e=s.enemies.find(e=>e.type==='walker');if(e){e.x=h.x+.58;e.y=h.y;}}
     if(${JSON.stringify(id)}==='arcchain')s.env.zones.push({kind:'puddle',x:h.x,y:h.y,r:8,arcT:0,t:99,T:99});
     if(${JSON.stringify(id)}==='carbomb')P.Env.addSolid(s,'car',h.x+2,h.y+.5,1.3,2.8);
     if(${JSON.stringify(id)}==='foamstorm')window.conditionTimer=setInterval(()=>{const t=s.enemies.filter(e=>!e.dead).sort((a,b)=>Math.hypot(a.x-h.x,a.y-h.y)-Math.hypot(b.x-h.x,b.y-h.y))[0];if(t)P.Enemies.lob(s,t,h.x,h.y,P.CFG.enemies.spitter.glob,2,1,'spitter');},350);
    })()`);
    await record(b,'condition-'+id,8,null,
     {fixture:true,evolution:id,assists:'Supplied evolution, high-HP live crowd; half-health for true capped healing; actual wet/car/spit geometry; Stormshield has supplied Nazar5, no invulnerability and one real contact attacker'});
    await b.evaluate('clearInterval(window.conditionTimer)');
    if(id==='foamstorm'&&!await b.evaluate("(P.debug.sim.evolutionUse.foamstorm?.control?.blocked_spit||0)>0"))throw Error('No actual spit interception observed');
    if(!await b.evaluate('(P.debug.sim.evolutionUse['+JSON.stringify(id)+']?.hits||0)>0'))throw Error('No actual target effect observed: '+id);
    if(id==='stormshield'&&!index.at(-1).facts.events.some(e=>e.type==='nazarDodge'))throw Error('No real Nazar dodge observed');
   }
  }else if(mode==='weapons') {
   await b.until(()=>b.evaluate("!!document.getElementById('weapon-lab-weapon')?.options.length&&P.ArtRaster.heroState()==='ready'"),'lab assets');
   const roster=await b.evaluate('({base:P.CFG.arsenal.weapons,evolutions:Object.keys(P.CFG.evolutions)})');
   for(const id of roster.base)for(const rank of [1,3,5]) {
    if(!selected('weapon-'+id+'-r'+rank))continue;
    await lab(b,id,rank);
    await record(b,'weapon-'+id+'-r'+rank,6,null,{fixture:true,assists:'rank supplied, 84 seeded enemies, invulnerability, no XP',weapon:id,rank});
   }
   for(const id of roster.evolutions){if(!selected('evolution-'+id))continue;await lab(b,id,1);await record(b,'evolution-'+id,8,null,{fixture:true,assists:'evolution supplied, seeded crowd, invulnerability',evolution:id});}
  }else if(mode==='actors'){
   await actors(b);
  }else if(mode==='bosses'){
   for(const level of [1,2,3,4,5,10,15,20,25,30]){await start(b,level);const boss=await b.evaluate('('+prepareBoss+')('+level+')');
    await record(b,'boss-L'+level+'-'+boss,15,null,{fixture:true,boss,assists:'arena supplied through real trigger, invulnerability, no player attacks, no ambient horde'});}
  }else if(mode==='world'){
   for(let level=1;level<=30;level++){if(!selected('world-L'+String(level).padStart(2,'0')))continue;await start(b,level);const setup=await b.evaluate('('+prepareWorld+')('+level+')');
    await record(b,'world-L'+String(level).padStart(2,'0'),12,null,{fixture:true,level,...setup,assists:'position supplied at first required action, no ambient horde/player weapons, invulnerability, required-target input policy; L1 supplied lethal hit at 2.1s'});}
  }else if(mode==='conflict'){
   for(const level of [3,27])for(const reduced of [false,true]){
    await start(b,level);await b.evaluate(`const s=P.debug.sim;P.Settings.reduceMotion=${reduced};P.Settings.reduceFlash=${reduced};P.Settings.textSize=150;P.Settings.joySide=${reduced?"'left'":"'right'"};P.applySettings();P.Quality.set(2);s.hero.invuln=1e5;s.hero.hp=s.hero.maxHp*.2;s.sk.frenzyT=8;
     P.Combat.spawnEnemy(s,'brute',s.hero.x+3,s.hero.y+2,{state:'active'});P.Enemies.ring(s,s.hero.x+1,s.hero.y+1,2,5,'swing','slam',{dmg:10,owner:555});
     s.hero.hp+=3;P.Fx.onEvent({type:'pickup',kind:'simit',healed:3},s);P.Comic.pop('barkGrab');P.Env.addSolid(s,'cart',s.hero.x-2,s.hero.y,1.1,.8);`);
    await record(b,'conflict-L'+level+'-'+(reduced?'reduced':'default'),7,null,{fixture:true,level,reduced,assists:'critical HP, real positive heal, frenzy, attack ring, cart, pending dialogue supplied concurrently; minimum quality'});
   }
  }else if(mode==='opening'){
   await start(b,1,true);await record(b,'cold-open',29,null,{fixture:false,assists:'fresh browser save, seed42; no movement input during intro'});
   await b.send('Input.dispatchKeyEvent',{type:'keyDown',code:'KeyW',key:'w',windowsVirtualKeyCode:87});await record(b,'first-control',2,null,{fixture:false});
  }else if(mode==='lifecycle'){
   await start(b);await b.evaluate(`window.experienceEvents=[];const s=P.debug.sim;P.Bosses.spawn(s,'brute',s.hero.x+2,s.hero.y+3,{preset:'cook',archetype:'brute',hoodIdx:0,nameKey:'boss.cook'});s.dir.trialBoss=s.enemies[s.enemies.length-1];P.SceneFlow.event({type:'bossIntro'},s);window.clockBefore=JSON.stringify({t:s.t,runT:s.runT,cds:s.hero.cds,sk:s.sk,hp:s.hero.hp});`);
   await b.sleep(500);const frozen=await b.evaluate("clockBefore===JSON.stringify({t:P.debug.sim.t,runT:P.debug.sim.runT,cds:P.debug.sim.hero.cds,sk:P.debug.sim.sk,hp:P.debug.sim.hero.hp})");
   if(!frozen)throw Error('Protected clocks advanced');await b.evaluate('P.SceneFlow.finish(true)');
   const restored=await b.evaluate('P.Input.enabled');if(!restored)throw Error('Input stayed locked '+JSON.stringify(await b.evaluate('({state:P.debug.state,mode:P.debug.sim.mode,scene:P.SceneFlow.current()?.id})')));
   index.push({id:'lifecycle',fixture:true,protectedClocksFrozen:frozen,inputRestored:restored});
   for(const level of [20,25,30]){
    await start(b,level);await b.evaluate(`const s=P.debug.sim;s.mode='won';P.SceneFlow.result(s,()=>window.sceneDone=(window.sceneDone||0)+1);`);
    await record(b,'aftermath-L'+level,7,null,{fixture:true,assists:'won state supplied to exercise presentation only, no reward proof'});
   }
  }
  if(b.errors.length)throw Error(b.errors.join('\n'));
 }finally{fs.writeFileSync(path.join(out,'index-'+mode+'.json'),JSON.stringify(index,null,2)+'\n');await b.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
