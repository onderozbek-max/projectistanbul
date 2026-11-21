// Desktop acceptance checks use an earned ready-rank save. Supplied failure/lifecycle cases are identified per record.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8775',out=path.resolve(process.env.AUDIT8_OUT||'reviews/media/R1/experiential');
const sample=JSON.parse(fs.readFileSync(process.env.AUDIT8_SAVE||'reviews/telemetry/experiential/earned-upgrade-save.json','utf8')),records=[];
async function main(){
 const b=await openBrowser(origin+'/?level=2&skipintro=1&lang=en');
 try{
  await b.until(()=>b.evaluate("P.ArtRaster.heroState()==='ready'"),'art');
  await b.evaluate('Object.assign(P.Meta.state(),'+JSON.stringify(sample.save)+');P.Settings.reduceMotion=true;P.Settings.textSize=150;P.applySettings();P.Meta.open(()=>{},true);',true);
  await b.sleep(900);await b.shot(path.join(out,'upgrade-ready-en.png'));
  const before=await b.evaluate('P.Meta.heroStats("arda")');
  const stat=await b.evaluate('(()=>{const b=document.querySelector(".growth-apply");if(!b)return null;const stat=b.closest("[data-stat]").dataset.stat;b.click();return stat;})()',true);
  assert(stat,'Actual earned save must have a ready attribute');
  const after=await b.evaluate('P.Meta.heroStats("arda")');assert.equal(after.attr[stat],before.attr[stat]+1);assert.equal(after.ready[stat],before.ready[stat]-1);
  await b.shot(path.join(out,'upgrade-applied-en.png'));
  await b.evaluate('document.querySelector(".growth-nav button:nth-child(2)").click()',true);await b.sleep(400);
  await b.shot(path.join(out,'perk-context-en.png'));
  const available=await b.evaluate('(()=>{const b=document.querySelector(".meta-tree-node.is-available");if(!b)return null;b.click();return b.dataset.perk;})()',true);
  assert(available,'Earned sample must offer an eligible perk');
  const scBefore=await b.evaluate('P.Meta.treeState().sc');
  if(available){await b.evaluate('document.querySelector(".meta-tree-learn").click()',true);assert(await b.evaluate('!!P.Meta.state().tree.learned['+JSON.stringify(available)+']'));}
  records.push({id:'earned-upgrade-journey',origin:sample.origin,stat,before,after,perk:available,scBefore,scAfter:await b.evaluate('P.Meta.treeState().sc'),playerComprehension:'Not observed; automation clicked visible controls'});
  await b.evaluate('P.Meta.close();P.Meta.open(()=>{},true);P.lang=P.Settings.lang="tr";P.UI.applyI18n();P.Meta.close();P.Meta.open(()=>{},true);',true);await b.sleep(400);
  await b.shot(path.join(out,'upgrade-ready-tr.png'));
  await b.evaluate('P.Meta.close();P.lang=P.Settings.lang="en";P.UI.applyI18n();const original=P.Story.play;P.Story.play=function(n,when,done,s){if(when==="intro"){done();return false;}return original(n,when,done,s);};document.getElementById("btn-start").click()',true);
  await b.until(()=>b.evaluate('P.debug.state==="play"'),'play');
  await b.evaluate('document.getElementById("btn-pause").click()',true);await b.shot(path.join(out,'pause-scope-en.png'));
  records.push({id:'pause-scope',state:await b.evaluate('P.debug.state'),text:await b.evaluate('document.getElementById("pause-permanent").textContent')});
  await b.evaluate('document.getElementById("btn-resume").click()',true);
  // Real art decoding with one intentionally blocked request, followed by its bounded source retry.
  await b.send('Network.enable');await b.send('Network.setBlockedURLs',{urls:['*characters/walker_shopper.png*']});
  await b.evaluate('P.ArtRaster.rect("characters","walker_shopper","idle")');await b.sleep(150);
  await b.send('Network.setBlockedURLs',{urls:[]});await b.until(()=>b.evaluate('!!P.ArtRaster.rect("characters","walker_shopper","idle")'),'current-source art retry');
  records.push({id:'current-art-retry',fixture:'one deliberately blocked enemy atlas URL; network restored before bounded retry',recovered:true});
  // Protected scene/background with timers including status, cooldown, mission and queued reward counts.
  await b.evaluate('(()=>{const s=P.debug.sim;P.Bosses.spawn(s,"brute",s.hero.x+1,s.hero.y+2,{preset:"cook",archetype:"brute",hoodIdx:0,nameKey:"boss.cook"});s.gen.boss=s.enemies.at(-1);P.SceneFlow.event({type:"bossIntro"},s);window.clock=()=>JSON.stringify({t:s.t,runT:s.runT,hp:s.hero.hp,cd:s.hero.cds,sk:s.sk,status:s.hero.poison,task:s.milestone,pending:[s.pendingLevels,s.pendingChests]});window.beforeClock=clock();P.Input.keys.KeyW=true;P.SceneFlow.background("story");})()');
  await b.sleep(600);assert(await b.evaluate('clock()===beforeClock'));assert(await b.evaluate('Object.keys(P.Input.keys).length===0'));
  await b.evaluate('P.SceneFlow.foreground()');await b.shot(path.join(out,'scene-resume-en.png'));
  await b.evaluate('document.querySelector(".scene-resume button").click();P.SceneFlow.finish(true)',true);
  records.push({id:'protected-background',fixture:'direct visibility lifecycle entry, actual shared clock snapshot',frozen:true,restored:await b.evaluate('P.Input.enabled')});
  await b.evaluate('P.Music.play("boss");P.Music.play("comic");P.Music.play("run_calm")',true);await b.sleep(1000);
  assert((await b.evaluate('P.Music.audibleTracks()')).length<=1);
  await b.evaluate('P.Settings.music=false;P.Music.setVolume(.5)');await b.sleep(400);assert.equal((await b.evaluate('P.Music.audibleTracks()')).length,0);
  await b.evaluate('P.Settings.music=true;P.Music.play("comic")',true);await b.sleep(500);
  records.push({id:'music-transition-mute',audible:await b.evaluate('P.Music.audibleTracks()'),artisticListening:'Not evaluated by this automated check'});
  if(b.errors.length)throw Error(b.errors.join('\n'));
  fs.writeFileSync(process.env.AUDIT8_CHECKS||'reviews/telemetry/experiential/browser-checks.json',JSON.stringify(records,null,2)+'\n');console.log('browser checks passed',records.map(r=>r.id));
 }finally{await b.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
