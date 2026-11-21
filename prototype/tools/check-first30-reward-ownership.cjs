// Reproduction of Knife5 + gloves + Cook + queued chest, exercising actual main-loop ownership.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8811',out=process.env.RESET_CHECK_OUT||'reviews/media/R1/first30-reset/candidate7-reward-ownership';fs.mkdirSync(out,{recursive:true});
const manifest=JSON.parse(fs.readFileSync(process.env.AUDIT9_MANIFEST||'reviews/telemetry/first30-reset/candidate7.json'));
const old=fs.readFileSync(path.join(__dirname,'capture-experience.cjs'),'utf8'),prep=old.slice(old.indexOf('function prepareBoss('),old.indexOf('function prepareWorld('));
async function tap(b,selector){await b.evaluate('document.querySelector('+JSON.stringify(selector)+').scrollIntoView({block:"center"})');await b.sleep(80);const q=await b.evaluate('(()=>{const e=document.querySelector('+JSON.stringify(selector)+'),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,hit:e.contains(document.elementFromPoint(x,y))}})()');assert(q.hit,selector);await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x:q.x,y:q.y,button:'left',clickCount:1});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:q.x,y:q.y,button:'left',clickCount:1});}
(async()=>{const b=await openBrowser(origin+'/?level=1&skipintro=1&lang=en');try{
 await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'title');await tap(b,'#btn-start');await b.until(()=>b.evaluate('P.debug.state==="play"'),'opening');
 await b.evaluate(`(()=>{${prep}prepareBoss(1);const s=P.debug.sim;s.hero.invuln=Infinity;s.enemies=[s.dir.trialBoss];s.dir.tut.done.t_move=true;s.dir.tut.active=null;s.dir.tut.queue=[];
 const show=P.Screens.showCards;P.Screens.showCards=function(s,offer){window.ownershipOffer=offer;return show.apply(this,arguments)};
 window.ownershipSamples=[];window.ownershipTimer=setInterval(()=>ownershipSamples.push({wall:Date.now()/1000,t:s.runT,state:P.debug.state,reveal:P.SkillsFx.evolutionActive(),chestVisible:!!document.getElementById('scr-chest').getClientRects().length,pending:s.pendingChests,levels:s.pendingLevels}),80);})()`);
 await b.until(()=>b.evaluate('P.SceneFlow.current()?.kind==="entry"'),'Cook entry');await b.until(()=>b.evaluate('!P.SceneFlow.current()'),'entry finish');
 const film=await recordDOM(b,path.join(out,'cook-evolution-chest-background4.mp4'),async()=>{
  await b.evaluate('(()=>{const s=P.debug.sim;s.hero.weapons={knife:5};s.hero.passives={gloves:1};s.recipeFocus="knife";s.recipeAssistance=true;s.cardPicks=5;s.pendingChests=1;P.Progression.addXp(s,(P.xpNeed(s.level)-s.xp+1)*P.Progression.crowdCost(s));const e=s.dir.trialBoss;P.Combat.damageEnemy(s,e,e.hp*30,1,0,0,false,"knife");})()');
  await b.until(()=>b.evaluate('P.debug.state==="cards"'),'real card foreground');
  const index=await b.evaluate('ownershipOffer.cards.findIndex(c=>c.evo==="knife")');assert(index>=0,'Actual eligible recipe offer must contain Cleaver');
  await tap(b,'#cards > .card:nth-child('+(index+1)+')');await b.until(()=>b.evaluate('P.debug.state==="reveal"'),'exclusive evolution');await b.shot(path.join(out,'exclusive-reveal4.png'));
  const target=(await b.send('Target.getTargetInfo')).targetInfo.targetId,other=(await b.send('Target.createTarget',{url:'about:blank'})).targetId;
  const before=await b.evaluate('P.debug.sim.runT');await b.send('Target.activateTarget',{targetId:other});await b.sleep(2200);await b.send('Target.activateTarget',{targetId:target});await b.send('Target.closeTarget',{targetId:other});await b.sleep(100);
  const after=await b.evaluate('({t:P.debug.sim.runT,reveal:P.SkillsFx.evolutionActive(),state:P.debug.state})');assert.equal(after.t,before);assert(after.reveal,'Covered evolution may not expire');
  await tap(b,'.scene-resume button');await b.until(()=>b.evaluate('P.debug.state==="chest"'),'queued chest after visible reveal');
  assert(!await b.evaluate('P.SkillsFx.evolutionActive()'));await b.sleep(2400);
  if(await b.evaluate('!!document.querySelector("#chest-choices .mod-opt")'))await tap(b,'#chest-choices .mod-opt');
  const count=await b.evaluate('P.debug.sim.chestsOpened');await b.evaluate('window.ownershipContinue=document.getElementById("btn-chest-continue")');await tap(b,'#btn-chest-continue');await b.evaluate('ownershipContinue.click()');await b.sleep(600);
  const facts=await b.evaluate('({opened:P.debug.sim.chestsOpened,pending:P.debug.sim.pendingChests,weapons:P.debug.sim.hero.weapons,evolved:P.debug.sim.hero.evolved})');assert.equal(facts.opened,count+1);assert.equal(facts.pending,0);assert.equal(facts.evolved.knife,'cleaver');await b.sleep(1200);return{background:{before,after},count,facts};
 });
 assert.equal(b.errors.length,0,b.errors.join('\n'));
 const samples=await b.evaluate('ownershipSamples');assert(samples.filter(s=>s.state==='reveal').every(s=>!s.chestVisible),'Chest masked an evolution frame');
 fs.writeFileSync(path.join(out,'index.json'),JSON.stringify({sourceManifest:manifest.runtime_manifest_sha256,fixture:true,provenance:'Supplied Knife5/gloves1/one queued chest/XP and actual Cook lethal contact; actual makeOffer and visible card/chest callbacks, background tab, main-loop timing and result counters. Not an earned evolution or campaign. Pending completed-result reload is checked separately; active-run full reload starts a fresh run under current save design.',...film,samples,errors:b.errors},null,2)+'\n');console.log('PASS evolution owns foreground; covered reveal time retained; chest follows exactly once.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
