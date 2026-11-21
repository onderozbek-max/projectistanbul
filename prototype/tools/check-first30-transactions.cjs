// Actual main-loop/menu callbacks with disclosed earned-state import and supplied queued rewards.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8811',out=process.env.RESET_CHECK_OUT||'reviews/media/R1/first30-reset/candidate7-transactions';fs.mkdirSync(out,{recursive:true});
const manifest=JSON.parse(fs.readFileSync(process.env.AUDIT9_MANIFEST||'reviews/telemetry/first30-reset/candidate7.json')),rows=[];
async function tap(b,selector){const q=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,hit:e.contains(document.elementFromPoint(x,y))}})()`);assert(q.hit,'Obscured '+selector);await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...q,button:'left',clickCount:1});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:q.x,y:q.y,button:'left',clickCount:1});}
async function start(b,level){await b.send('Page.navigate',{url:origin+'/?level='+level+'&skipintro=1&lang=en'});await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'title');await tap(b,'#btn-start');await b.until(()=>b.evaluate('P.debug.state==="play"'),'play');}
(async()=>{const b=await openBrowser(origin);try{
 await start(b,3);
 const earned=JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/candidate5-earned-upgrade.jsonl','utf8').trim()).save;
 await b.evaluate('Object.assign(P.Meta.state(),'+JSON.stringify(earned)+');P.Meta.Save.write(P.Meta.state());P.Horde.step=()=>{};P.debug.sim.enemies=[];P.debug.sim.hero.iframes=0;P.debug.sim.hero.invuln=0;P.Combat.damageHero(P.debug.sim,99999,"walker")');
 await b.until(()=>b.evaluate('P.debug.state==="down"||P.debug.sim.secondWindUsed'),'defeat or real first-run assistance');
 if(await b.evaluate('P.debug.state!=="down"'))await b.evaluate('P.debug.sim.hero.iframes=0;P.debug.sim.hero.invuln=0;P.Combat.damageHero(P.debug.sim,99999,"walker")');
 await b.until(()=>b.evaluate('P.debug.state==="down"'),'actual defeat after assistance');await tap(b,'#btn-giveup');await b.until(()=>b.evaluate('P.debug.state==="results"'),'loss result');
 const loss=await b.evaluate('({title:document.getElementById("res-title").textContent,expected:P.t("ui.res.fail"),stat:document.getElementById("btn-res-growth").dataset.stat,save:P.Meta.state()})');assert.equal(loss.title,loss.expected);assert(loss.stat);
 const growth=await recordDOM(b,path.join(out,'earned-state-loss-growth.mp4'),async()=>{
  await tap(b,'#btn-res-growth');await b.until(()=>b.evaluate('P.debug.state==="map"&&!!document.querySelector(".meta-attr:not(.meta-hidden)")'),'direct ready attribute');await b.sleep(400);
  const id=loss.stat,before=await b.evaluate('({stats:P.Meta.heroStats("arda"),sc:P.Meta.treeState().sc})');
  const selector='.meta-attr:not(.meta-hidden) [data-stat="'+id+'"] .growth-apply';
  await b.evaluate('window.applyButton=document.querySelector('+JSON.stringify(selector)+')');await tap(b,selector);
  await b.evaluate('applyButton.click()');await b.sleep(300);
  const after=await b.evaluate('({stats:P.Meta.heroStats("arda"),sc:P.Meta.treeState().sc,receipt:document.querySelector(".growth-applied")?.textContent,legacy:!!document.querySelector(".meta-lvl")})');
  assert.equal(after.stats.attr[id],before.stats.attr[id]+1);assert.equal(after.stats.ready[id],before.stats.ready[id]-1);assert.equal(after.sc,before.sc);assert(after.receipt);assert(!after.legacy);
  await b.shot(path.join(out,'actual-attribute-receipt.png'));await b.sleep(1500);return{id,before,after};
 },{nativeCanvas:false});rows.push({id:'loss-growth',sourceManifest:manifest.runtime_manifest_sha256,fixture:true,provenance:'Imported actual no-spend earned pre-allocation Meta from candidate5 upgrade-save search, then actual damaging defeat/give-up/result/direct growth callbacks. No readiness, rank or SC grant. Menu-only DOM/audio recording: suspended gameplay canvas emits no native frames. Not a fresh earned campaign.',loss,...growth});
 await b.evaluate('history.replaceState({},"","/?lang=en")');await b.send('Page.reload');await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"'),'reloaded title');await tap(b,'#btn-start');await b.until(()=>b.evaluate('P.debug.state==="map"'),'saved return');
 const saved=await b.evaluate('P.Meta.state()');assert.equal(saved.heroes.arda.stats.attr[loss.stat],growth.outcome.after.stats.attr[loss.stat]);assert.equal(saved.settledRuns.length,loss.save.settledRuns.length,'Reload must not settle the defeat again');
 assert.equal(b.errors.length,0,b.errors.join('\n'));
 fs.writeFileSync(path.join(out,'index.json'),JSON.stringify({manifest,records:rows,errors:b.errors},null,2)+'\n');console.log('PASS actual defeat/result/growth/direct ready rank/double-click/receipt/SC/reload settlement.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
