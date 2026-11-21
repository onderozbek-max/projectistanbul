// Player-facing follow-up: real opening/crowd, then clearly supplied movement/contact fixtures.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const out=path.resolve('reviews/media/R1/visual-corrections-2026-11-18');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8775';
const manifest=JSON.parse(fs.readFileSync('reviews/telemetry/visual-corrections-2026-11-18/build.json','utf8'));
const only=process.argv[2],index=only&&fs.existsSync(path.join(out,'index.json'))?JSON.parse(fs.readFileSync(path.join(out,'index.json'),'utf8')):[];
const bot=fs.readFileSync(path.join(__dirname,'bot.js'),'utf8');
const botInput=bot.slice(bot.indexOf('function botInput('),bot.indexOf('function runL1('));
async function start(b,level,lang='tr',cold=false){
 await b.send('Page.navigate',{url:origin+'/?level='+level+'&seed=42&lang='+lang+(cold?'':'&skipintro=1')});
 await b.until(()=>b.evaluate("!!window.P?.debug&&P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'title');
 if(!cold)await b.evaluate("window.originalStory=P.Story.play;P.Story.play=function(n,when,done,s){if(when==='intro'){done();return false;}return originalStory(n,when,done,s);};");
 await b.evaluate(`window.portraits=[];window.bust=P.ComicRaster.bust;P.ComicRaster.bust=function(c,who){if(P.ColdOpen.active())portraits.push(who);return bust.apply(this,arguments);};document.getElementById('btn-start').click()`,true);
 await b.until(()=>b.evaluate(cold?'P.ColdOpen.active()':"P.debug.state==='play'"),'started');
}
async function record(b,id,action,provenance){
 const r=await recordDOM(b,path.join(out,id+'.mp4'),action);
 await b.shot(path.join(out,id+'.png'));
 const facts=await b.evaluate('({state:P.debug.state,locale:P.lang,quality:P.Quality.tier,settings:P.Settings,hero:{x:P.debug.sim.hero.x,y:P.debug.sim.hero.y,hp:P.debug.sim.hero.hp,weapons:P.debug.sim.hero.weapons},civilians:P.debug.sim.dir.civilians.map(v=>({variant:v.variant,x:v.x,y:v.y})),portraits})');
 const previous=index.findIndex(r=>r.id===id);if(previous>=0)index.splice(previous,1);
 index.push({id,file:id+'.mp4',still:id+'.png',captured:new Date().toISOString(),sourceManifest:manifest.runtime_manifest_sha256,
  platform:'Desktop Chrome 390×844 DPR1, original timestamps and post-master audio; seed42',provenance,...r,facts});
 fs.writeFileSync(path.join(out,'index.json'),JSON.stringify(index,null,2)+'\n');
 if(b.errors.length)throw Error(b.errors.join('\n'));console.log(id,r.outcome);
}
async function key(b,k,down){await b.send('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',code:'Key'+k.toUpperCase(),key:k,windowsVirtualKeyCode:k.toUpperCase().charCodeAt(0)});}
async function opening(b,lang){
 await start(b,1,lang,true);
 await record(b,'opening-'+lang,async()=>{
  await b.sleep(22600);await b.shot(path.join(out,'three-rules-'+lang+'.png'));
  const actors=await b.evaluate('portraits.slice(0,3)');assert.deepEqual(actors,['arda','arda','arda']);
  await b.until(()=>b.evaluate("!P.ColdOpen.active()&&P.debug.state==='play'"),'first control');return{rulePortraits:actors};
 },'Fresh isolated save, real cold-open timeline; no supplied power or altered dialogue. Actual portrait renderer calls verified.');
}
async function naturalCrowd(b){
 await b.evaluate(`(()=>{const PATH=[[-5,-1.5],[-5,2],[0,60],[-4,140],[-4,165],[-1,192],[1.5,206]],POLICY='kite',HACK_REACH=7;
 ${botInput}
 const s=P.debug.sim,st={wp:0,ang:0};P.Input.get=()=>botInput(s,st);
 window.cards=setInterval(()=>{if(P.debug.state==='cards')document.querySelector('#cards .card:not(.is-disabled)')?.click();},250);})()`);
 await b.until(()=>b.evaluate('P.debug.sim.dir.civilians.length>0'),'naturally spawned civilians',90000);
 await record(b,'natural-fleeing-crowd',async()=>{
  await b.sleep(2000);await b.shot(path.join(out,'natural-fleeing-crowd-active.png'));
  await b.sleep(5000);return b.evaluate('({segment:P.debug.sim.dir.seg,suppliedActors:false,secondWind:P.debug.sim.secondWindUsed})');
 },'Ordinary L1 opening progression and sim-spawned fleeing groups; existing automated navigation/card clicks, no granted ranks/HP/actors. No claim of human play.');
 await b.evaluate('clearInterval(cards)');
}
async function movement(b,reduced){
 await start(b,3);
 await b.evaluate(`(()=>{const s=P.debug.sim;P.Horde.step=()=>{};if(s.env)s.env.portals=[];s.gen.mi=s.gen.marks.length;s.milestone.open=true;s.enemies=[];s.hero.weapons={};s.hero.x=0;s.hero.y=60;
 P.Settings.reduceMotion=${reduced};P.Settings.reduceFlash=${reduced};P.applySettings();P.Quality.set(${reduced?2:0});P.Comic.clearRunDialogue();P.Barks.clear();P.Barks.setEnabled(false);P.Fx.reset(s);})()`);
 await record(b,'hero-eight-directions-'+(reduced?'reduced':'default'),async()=>{
  for(const keys of ['w','s','a','d','w,a','w,d','s,a','s,d']){
   for(const k of keys.split(','))await key(b,k,true);await b.sleep(1200);
   for(const k of keys.split(','))await key(b,k,false);await b.sleep(320);
  }return{directions:8,reduced};
 },'Supplied quiet valid L3 lane/position, ambient spawns removed, no weapons; real keyboard input. Four authored leg poses per facing remain active on minimum quality/reduced motion.');
}
async function allCivilians(b){
 await start(b,3);
 await b.evaluate(`(()=>{const s=P.debug.sim;P.Horde.step=()=>{};s.env.portals=[];s.gen.mi=s.gen.marks.length;s.milestone.open=true;s.enemies=[];s.hero.weapons={};s.hero.x=-4.5;s.hero.y=57;
 s.dir.civilians=Array.from({length:6},(_,i)=>({x:(i%3-1)*3,y:58+Math.floor(i/3)*3,variant:i,walk:0,scream:0,drift:0,sp:0,life:100,delay:0}));
 const old=P.stepSim;P.stepSim=function(run,dt,input){old(run,dt,input);run.dir.civilians.forEach(v=>{v.x=(v.variant%3-1)*3;v.y=58+Math.floor(v.variant/3)*3;v.walk+=dt*3.4;});};P.Fx.reset(s);P.Comic.clearRunDialogue();P.Barks.clear();P.Barks.setEnabled(false);})()`);
 await record(b,'six-civilian-identities',async()=>{await b.sleep(5000);return b.evaluate('P.debug.sim.dir.civilians.map(v=>v.variant)');},
  'Explicit supplied lineup of all six civilian variants at fixed positions with normal-speed animation; no claim of natural simultaneous grouping. Alpha/composition check.');
}
async function combat(b){
 await start(b,3);
 await b.evaluate(`(()=>{const s=P.debug.sim;P.Horde.step=()=>{};s.env.portals=[];s.gen.mi=s.gen.marks.length;s.milestone.open=true;s.enemies=[];s.hero.weapons={};s.hero.invuln=10000;s.hero.x=0;s.hero.y=60;
 P.Progression.debugGrant(s,{weapons:{knife:3,chainsaw:3,sledge:3}});
 for(let i=0;i<24;i++){const a=i*Math.PI/12;P.Combat.spawnEnemy(s,'walker',Math.cos(a)*3,60+Math.sin(a)*3,{state:'active'});}s.enemies.forEach(e=>{e.hp=e.maxHp=10000;});
 const old=P.stepSim;P.stepSim=function(run,dt,input){old(run,dt,input);run.drops=[];run.pendingLevels=0;run.pendingChests=0;};
 P.Fx.reset(s);P.Comic.clearRunDialogue();P.Barks.clear();P.Barks.setEnabled(false);})()`);
 await record(b,'run-and-three-weapons',async()=>{
  for(const k of ['d','w','a','s']){await key(b,k,true);await b.sleep(1600);await key(b,k,false);}return{actualWeaponSlots:3};
 },'Supplied rank3 knife/chainsaw/hammer and 24 high-HP live enemies, invulnerable hero, no XP/cards/ambient horde; real movement and automatic attacks. Checks continued grip/contact ownership.');
}
async function main(){
 const b=await openBrowser(origin+'/?lang=tr');
 try{if(only==='civilians')await allCivilians(b);else{await opening(b,'tr');await naturalCrowd(b);await opening(b,'en');await movement(b,false);await movement(b,true);await allCivilians(b);await combat(b);}}
 finally{await b.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
