'use strict';const fs=require('node:fs'),assert=require('node:assert/strict'),{openBrowser}=require('./lib-experiential-browser.cjs');
const out='reviews/media/R1/opening-cast-2026-11-20/final22';
(async()=>{const b=await openBrowser((process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8829')+'/?level=1&lang=en');try{
 await b.send('Network.enable');await b.send('Network.setCacheDisabled',{cacheDisabled:true});const cases=[];
 for(const file of ['restaurant-cast-v2.png','civilian-idle-v1.png']){
  await b.send('Network.setBlockedURLs',{urls:['*'+file+'*']});await b.send('Page.reload',{ignoreCache:true});
  await b.until(()=>b.evaluate("window.P?.debug?.state==='title'&&P.ArtRaster.heroState()==='ready'"),'title');
  await b.evaluate("document.getElementById('btn-start').click()",true);await b.sleep(5500);
  const blocked=await b.evaluate('({state:P.debug.state,t:P.debug.sim?.runT,cold:P.ColdOpen.active(),title:document.getElementById("scr-title").getClientRects().length>0})');
  assert.equal(blocked.state,'title');assert.equal(blocked.t,0);assert(!blocked.cold);
  cases.push({file,...blocked});await b.shot(out+'/blocked-'+file+'.png');
 }
 await b.send('Network.setBlockedURLs',{urls:[]});await b.evaluate("document.getElementById('btn-start').click()",true);
 await b.until(()=>b.evaluate("P.debug.state==='cold'&&!!P.StreetArt.image('restaurant-cast')&&!!P.StreetArt.image('civilian-idle')"),'current art retry');await b.sleep(1800);
 const p=await b.evaluate('(()=>{const r=document.getElementById("btn-skip").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');
 await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x:p.x,y:p.y,button:'left',clickCount:1});await b.sleep(800);
 await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:p.x,y:p.y,button:'left',clickCount:1});
 await b.until(()=>b.evaluate("P.debug.state==='play'&&P.Input.enabled"),'actual hold skip');
 const skipped=await b.evaluate('({state:P.debug.state,t:P.debug.sim.runT,enabled:P.Input.enabled,diners:P.debug.sim.enemies.filter(e=>e.dinerIndex!==undefined).map(e=>({index:e.dinerIndex,state:e.state}))})');
 assert(!b.errors.some(e=>e.includes('TypeError')));await b.shot(out+'/actual-skip-return.png');
 fs.writeFileSync('reviews/telemetry/opening-cast-2026-11-20/recovery22.json',JSON.stringify({source:JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/candidate22.json')),method:'Exact current cast and idle URLs each blocked before actual Start. Neither can start invisible actors: safe title/frozen run. Unblock/retry and real pointer hold-to-skip return enabled control. No supplied actor/power/clock/outcome. Desktop only.',cases,skipped,errors:b.errors},null,2)+'\n');
 console.log('PASS both current-art failure/retries and actual hold-to-skip handback');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
