// Normal controls and ordinary rewards from fresh or provenance-linked earned saves.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8775';
const out=path.resolve(process.env.AUDIT8_OUT||'reviews/media/R1/audit8-implementation/earned');fs.mkdirSync(out,{recursive:true});
const bot=fs.readFileSync(path.join(__dirname,'bot.js'),'utf8');
const navigation=bot.slice(bot.indexOf('function unit('),bot.indexOf('// Diagnostics for a timed-out run'));
const l1=bot.slice(bot.indexOf('function botInput('),bot.indexOf('function runL1('));
const helpers=fs.readFileSync(path.join(__dirname,'lib-bot-play.js'),'utf8').split('module.exports')[0];
const file=process.env.AUDIT8_CAMPAIGN||'reviews/telemetry/audit8-implementation/final-earned-cover.jsonl';
const rows=fs.existsSync(file)?fs.readFileSync(file,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse):[];
const levels=(process.env.AUDIT8_LEVELS||'20,25,30').split(',').map(Number),lang=process.env.AUDIT8_LANG||'en';
const build=JSON.parse(fs.readFileSync(process.env.AUDIT8_MANIFEST||'reviews/telemetry/audit8-implementation/build.json','utf8'));
async function enter(b,level,fresh,linked=false,attempt=0){
 const input=process.env.AUDIT8_SAVE_INPUT&&JSON.parse(fs.readFileSync(process.env.AUDIT8_SAVE_INPUT));
 const sample=input?{seed:input.seed,saveBefore:input.save,origin:input.origin}:!fresh&&rows.find(r=>r.level===level&&r.result==='win');
 if(sample&&!linked){assert(!(sample.saveBefore.stars?.[level]),'Requires a pre-first-clear earned save');await b.evaluate('Object.assign(P.Meta.state(),'+JSON.stringify(sample.saveBefore)+');P.Meta.Save.write(P.Meta.state())');}
 const selectedFocus=process.env.AUDIT8_WEAPON_FOCUS==='sample'?
  sample?.cardPlan?.offers?.find(x=>x.pick.startsWith('w:')&&x.pick!=='w:knife')?.pick.slice(2)||'':process.env.AUDIT8_WEAPON_FOCUS||'';
 await b.send('Page.navigate',{url:origin+'/?level='+level+'&seed='+((sample?.seed||42)+attempt)+'&lang='+lang+(fresh?'':'&skipintro=1')});
 await b.until(()=>b.evaluate("!!window.P?.debug&&P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'title');
 await b.evaluate(`(()=>{const args={punish:true,help:true,street:true,choice:${JSON.stringify(process.env.AUDIT8_CHOICE||'left')}},DT=1/60,DROP_KINDS=['xp','chest','simit','jeton'],HACK_REACH=7,POLICY='kite',PATH=[[-5,-1.5],[-5,2],[0,60],[-4,140],[-4,165],[-1,192],[1.5,206]];
 ${navigation}
 ${l1}
 ${helpers}
 let st=null,run=null;window.earnedEvents=[];window.earnedSamples=[];
 P.Input.get=function(){const s=P.debug.sim;if(!s)return{x:0,y:0};if(run!==s){run=s;st={wp:0,ang:0,best:s.hero.y,bestT:0,push:0,side:1,skip:new Set(),dropT:0,dropId:null,threat:Infinity};}
 return useActiveSkills(P,s,s.levelIndex===1?botInput(s,st):genInput(s,st),unit);};
 const drain=P.drainEvents;P.drainEvents=function(s){const es=drain(s);for(const e of es)if(!['footstep','xp'].includes(e.type))earnedEvents.push({t:s.runT,...e});return es;};
 const show=P.Screens.showCards;P.Screens.showCards=function(s,offer){window.actualOffer=offer;return show.apply(this,arguments);};
 window.choiceTimer=setInterval(()=>{
  const s=P.debug.sim;if(!s)return;
  earnedSamples.push({wall:Date.now()/1000,t:s.runT,state:P.debug.state,hp:s.hero.hp,x:s.hero.x,y:s.hero.y,scene:P.SceneFlow.current()?.id,music:P.Music.audibleTracks()});
  if(P.debug.state==='cards'&&!document.getElementById('cards').dataset.locked&&window.actualOffer){
   const cards=actualOffer.cards,focus=P.Progression.buildState(s);
   const wanted=${JSON.stringify(selectedFocus)};
   if(${!!process.env.AUDIT8_PLAN_UI}&&wanted&&P.Progression.rerollFocus(s)===wanted&&!cards.some(c=>c.item===wanted||c.evo||c.item===focus?.passive)){
    const button=document.getElementById('btn-reroll-focus');if(button&&!button.disabled&&!button.classList.contains('hidden')){button.click();return;}
   }
   const score=c=>c.evo?100:c.item==='medkit'&&s.hero.hp/s.hero.maxHp<.4?90:wanted&&c.item===wanted?85:wanted&&focus?.weapon===wanted&&c.item===focus.passive?80:c.recipe?70:c.item===focus?.weapon?65:c.id[0]==='w'?50+(c.next||1):0;
   const desired=Object.entries(P.CFG.evolutions).find(([id,e])=>e.from===wanted&&e.passive);
   const suitable=c=>desired&&(c.item===wanted||c.item===desired[1].passive||c.item===desired[0]);
   const alternate=desired?cards.filter(c=>!c.evo&&!Object.values(P.CFG.evolutions).some(e=>e.from===wanted&&e.passive===c.item&&e!==desired[1])):cards;
   const planned=${!!process.env.AUDIT8_PLAN_UI}&&desired&&(cards.find(c=>c.item==='medkit'&&s.hero.hp/s.hero.maxHp<.4)||cards.find(suitable)||alternate.find(c=>c.id.startsWith('p:'))||alternate.find(c=>c.id.startsWith('w:')&&!s.hero.weapons[c.item]));
   const i=planned?cards.indexOf(planned):cards.map((c,i)=>({i,n:score(c)})).sort((a,b)=>b.n-a.n)[0].i;
   const b=document.querySelectorAll('#cards > .card')[i];if(b)(b.querySelector('.mod-opt')||b).click();
  }
  if(P.debug.state==='chest'){const b=document.querySelector('#chest-choices .mod-opt');if(b)b.click();const c=document.getElementById('btn-chest-continue');if(c&&!c.disabled)c.click();}
  const wanted=${JSON.stringify(selectedFocus)};
  if(${!!process.env.AUDIT8_PLAN_UI}&&wanted&&s.hero.weapons[wanted]&&!(s.hero.evolved&&s.hero.evolved[wanted])){
   if(P.debug.state==='play'&&s.recipeFocus!==wanted&&!window.planWait){document.getElementById('btn-pause').click();document.getElementById('pause-plan').open=true;window.planWait=Date.now()+1200;}
   else if(P.debug.state==='paused'&&window.planWait&&Date.now()>planWait){
    const button=document.querySelector('[data-build-plan="'+wanted+'"]');if(button&&!button.disabled)button.click();
    window.planWait=0;window.planResume=Date.now()+1100;
   }else if(P.debug.state==='paused'&&window.planResume&&Date.now()>planResume){document.getElementById('btn-resume').click();window.planResume=0;}
  }
 },350);
 })()`);
 if(process.env.AUDIT8_ACCESSIBLE)await b.evaluate('P.Settings.textSize=150;P.Settings.reduceMotion=true;P.Settings.reduceFlash=true;P.Settings.musicVol=0;P.Settings.sfxVol=0;P.applySettings()');
 return sample;
}
async function play(b,level,fresh,sample,attempt=0){
 const name=(fresh?'fresh-session':'earned-L'+level)+'-'+lang+(process.env.AUDIT8_ACCESSIBLE?'-accessible':'')+(attempt?'-retry'+attempt:'');
 let lastTurn=0,storyStart=0,lastState='',shots=0;
 const saveAtEntry=await b.evaluate('P.Meta.state()');
 const media=await recordDOM(b,path.join(out,name+'.mp4'),async()=>{
  await b.evaluate("document.getElementById('btn-start').click()",true);
  const deadline=Date.now()+600000;
  while(Date.now()<deadline){
   const s=await b.evaluate('({state:P.debug.state,page:P.Comic.active(),world:P.SceneFlow.presentingWorld(),read:P.SceneFlow.current()?.storyStarted})');
   if(s.state!==lastState){lastState=s.state;storyStart=Date.now();if(shots++<20)await b.shot(path.join(out,name+'-'+shots+'-'+s.state+'.png'));}
   if(s.state==='results'||s.state==='down')return s.state;
   if(s.page&&!s.world&&Date.now()-lastTurn>6500&&Date.now()-storyStart>1200){
    await b.send('Input.dispatchKeyEvent',{type:'keyDown',code:'Enter',key:'Enter',windowsVirtualKeyCode:13});
    await b.send('Input.dispatchKeyEvent',{type:'keyUp',code:'Enter',key:'Enter',windowsVirtualKeyCode:13});lastTurn=Date.now();
   }
   await b.sleep(300);
  }
  throw Error('Real play did not finish within ten minutes');
 });
 await b.evaluate('clearInterval(choiceTimer)');
 const facts=await b.evaluate('({state:P.debug.state,events:earnedEvents,samples:earnedSamples,save:P.Meta.state(),pending:P.Meta.pendingResult(),weapons:P.debug.sim.hero.weapons,recipe:P.Progression.buildState(P.debug.sim),evolutionUse:P.debug.sim.evolutionUse,settings:P.Settings})');
 assert.equal(b.errors.length,0,b.errors.join('\n'));
 await b.shot(path.join(out,name+'-end.png'));
 const entry={id:name,level,lang,attempt,seed:(sample?.seed||42)+attempt,saveAtEntry,sourceManifest:build.runtime_manifest_sha256||build.manifest_sha256,file:name+'.mp4',fixture:false,origin:fresh?'New empty browser profile; title through actual cold open, real combat, choices and result':process.env.AUDIT8_CHAIN&&level!==levels[0]?'Actual preceding recorded level in this browser campaign':attempt?'Actual preceding recorded loss and ordinary retry':sample.origin||file+' level '+level+' seed '+sample.seed+' pre-first-clear save',
  assists:'Automated normal movement/skills and visible card/mod/chest/comic button choices. No health, ranks, kills, invulnerability, outcome or story facts supplied.',linkedCampaign:!!process.env.AUDIT8_CHAIN,weaponIntention:process.env.AUDIT8_WEAPON_FOCUS||null,...media,facts,frameErrors:b.errors.slice()};
 fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(entry,null,2)+'\n');console.log(name,media.outcome);
 if((fresh||process.env.AUDIT8_REPLAY_PAGE)&&facts.state==='results')await memory(b,name);
 return facts.state;
}
async function memory(b,name){
 const page=process.env.AUDIT8_REPLAY_PAGE||'l1_outro';
 const earned=await b.evaluate('P.Meta.state().collection');assert(earned['page:'+page]);
 await b.evaluate('P.Meta.open(()=>{});P.Meta.Hub.show("coll")',true);await b.sleep(1000);await b.shot(path.join(out,name+'-memories.png'));
 const before=await b.evaluate('JSON.stringify(P.Meta.state())');
 await b.evaluate('document.querySelector(".meta-coll-item.is-on button")?.click()||document.querySelector("button.meta-coll-item.is-on")?.click()',true);
 await b.sleep(2500);await b.shot(path.join(out,name+'-memory-replay.png'));await b.evaluate('P.Comic.skipPage()');await b.sleep(500);
 assert.equal(await b.evaluate('JSON.stringify(P.Meta.state())'),before,'Replay must not settle again');
 await b.send('Page.reload');await b.until(()=>b.evaluate("!!window.P?.Meta&&P.debug?.state==='title'"),'memory reload');
 assert(await b.evaluate('!!P.Meta.state().collection['+JSON.stringify('page:'+page)+']'));
 fs.writeFileSync(path.join(out,name+'-memory-check.json'),JSON.stringify({archive:earned,afterReload:await b.evaluate('P.Meta.state().collection'),replayIdempotent:true,frameErrors:b.errors.slice()},null,2));
}
(async()=>{const b=await openBrowser(origin+'/?lang='+lang);try{
 if(process.env.AUDIT8_MEMORY_ONLY){const saved=JSON.parse(fs.readFileSync(path.join(out,'fresh-session-'+lang+'.json'))).facts.save;
  await b.evaluate('Object.assign(P.Meta.state(),'+JSON.stringify(saved)+');P.Meta.Save.write(P.Meta.state())');await memory(b,'fresh-session-'+lang);return;}
 for(let i=0;i<levels.length;i++)for(let attempt=0;attempt<(process.env.AUDIT8_RETRIES?3:1);attempt++){
  const n=levels[i],fresh=n===1,sample=await enter(b,n,fresh,!!process.env.AUDIT8_CHAIN&&i>0||attempt>0,attempt);
  if(await play(b,n,fresh,sample,attempt)==='results')break;
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
