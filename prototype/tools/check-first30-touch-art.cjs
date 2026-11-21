// Desktop CDP touch-handler and blocked-current-art recovery checks. Never physical iPhone proof.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8814',out=process.env.RESET_CHECK_OUT||'reviews/media/R1/first30-reset/candidate9-touch-art';fs.mkdirSync(out,{recursive:true});
const source=JSON.parse(fs.readFileSync(process.env.AUDIT9_MANIFEST||'reviews/telemetry/first30-reset/candidate9.json')),rows=[];
async function point(b,selector){return b.evaluate('(()=>{const e=document.querySelector('+JSON.stringify(selector)+'),r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');}
async function touch(b,type,points){await b.send('Input.dispatchTouchEvent',{type,touchPoints:points.map((p,i)=>({...p,id:p.id||i+1,radiusX:10,radiusY:10,force:1}))});}
async function tap(b,selector){const q=await point(b,selector);await touch(b,'touchStart',[q]);await touch(b,'touchEnd',[]);}
async function boot(b){await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'title');}
(async()=>{
 for(const[width,height]of[[390,844],[320,568]])for(const lang of['en','tr'])for(const side of['left','right']){
  const b=await openBrowser(origin+'/?level=3&skipintro=1&lang='+lang,{width,height});try{
   await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});await boot(b);await b.evaluate('P.Settings.textSize=150;P.Settings.joySide='+JSON.stringify(side)+';P.applySettings()');await tap(b,'#btn-start');await b.until(()=>b.evaluate('P.debug.state==="play"'),'actual touch Start');
   const rect=await b.evaluate('document.getElementById("phone").getBoundingClientRect().toJSON()'),anchor={id:1,x:rect.x+rect.width*(side==='left'?.40:.60),y:rect.y+rect.height*.76},move={...anchor,y:anchor.y-rect.width*.085};
   const before=await b.evaluate('({x:P.debug.sim.hero.x,y:P.debug.sim.hero.y,t:P.debug.sim.runT})');await touch(b,'touchStart',[anchor]);await touch(b,'touchMove',[move]);await b.sleep(1400);
   const moved=await b.evaluate('({x:P.debug.sim.hero.x,y:P.debug.sim.hero.y,t:P.debug.sim.runT,vector:P.Input.vec})');if(!(moved.y>before.y+.4)){const detail=await b.evaluate('({state:P.debug.state,enabled:P.Input.enabled,vec:P.Input.vec,scene:P.SceneFlow.current()?.id,overlay:P.UI.isOverlay(),mode:P.debug.sim.mode})');fs.writeFileSync(path.join(out,'touch-failure.json'),JSON.stringify({width,height,lang,side,rect,anchor,move,before,moved,detail},null,2));await b.shot(path.join(out,'touch-failure.png'));}assert(moved.y>before.y+.4,'Touch movement did not reach actual hero');
   await touch(b,'touchCancel',[]);await b.sleep(100);assert(await b.evaluate('Math.hypot(P.Input.vec.x,P.Input.vec.y)<.001'),'Touch cancel left steering active');
   await tap(b,'#btn-pause');await b.until(()=>b.evaluate('P.debug.state==="paused"'),'touch pause');const clock=await b.evaluate('P.debug.sim.runT');await b.sleep(650);assert.equal(await b.evaluate('P.debug.sim.runT'),clock);await tap(b,'#btn-resume');await b.sleep(200);assert(await b.evaluate('Math.hypot(P.Input.vec.x,P.Input.vec.y)<.001'),'Resume reused stale steering');
   await touch(b,'touchStart',[anchor]);await touch(b,'touchMove',[move]);await b.sleep(450);
   const dash=await point(b,'#dash-chip');await touch(b,'touchStart',[move,{...dash,id:2}]);await touch(b,'touchEnd',[move]);await b.sleep(100);
   const dashed=await b.evaluate('!!P.debug.sim.sk.dash||P.debug.sim.tally.dashes>0');assert(dashed,'Dash could not be tapped while moving');await touch(b,'touchEnd',[]);
   const id=lang+'-'+width+'-'+side;await b.shot(path.join(out,id+'.png'));assert.equal(b.errors.length,0,b.errors.join('\n'));rows.push({id,width,height,lang,side,text:150,before,moved,dashed,clockFrozen:true,cancelCleared:true,resumeNoStaleInput:true,method:'Desktop Chrome CDP-generated two-touch events through actual DOM handlers; no input getter replacement, power grant or physical-device claim.'});
  }finally{await b.close();}
 }
 const failures=[[1,'boss-torsos-v2.png','boss-torsos-reset'],[20,'kaan-parts-v2.png','kaan-parts-reset']];
 if(process.env.RESET_EXTENDED_ART)failures.push([23,'market-carry-v1.png','market-carry-reset'],[18,'weather-controls-v1.png','weather-controls-reset'],[19,'work-stages-audit8.png','work-stages-audit8']);
 for(const[level,file,key]of failures){
 const b=await openBrowser(origin+'/?level='+level+'&skipintro=1&lang=en');try{
  await b.send('Network.enable');await b.send('Network.setCacheDisabled',{cacheDisabled:true});await b.send('Network.setBlockedURLs',{urls:['*'+file+'*']});await b.send('Page.reload',{ignoreCache:true});await boot(b);await b.evaluate('document.getElementById("btn-start").click()',true);await b.sleep(5400);
  const failed=await b.evaluate('({state:P.debug.state,mode:P.debug.sim?.mode,t:P.debug.sim?.runT,title:document.getElementById("scr-title").getClientRects().length>0})');assert.equal(failed.state,'title');assert(failed.title);assert.equal(failed.t,0,'Unavailable required art cannot start an invisible actor run');await b.shot(path.join(out,'missing-'+key+'-recovery.png'));
  await b.send('Network.setBlockedURLs',{urls:[]});await b.evaluate('document.getElementById("btn-start").click()',true);await b.until(()=>b.evaluate('P.debug.state==="play"&&!!P.StreetArt.image('+JSON.stringify(key)+')'),'successful actual art retry');
  assert(!b.errors.some(e=>e.includes('TypeError')));rows.push({id:'missing-current-'+key,level,blocked:file,failed,recovered:true,noRetiredFightFallback:true,method:'Blocked exact current URL before Start; actual failure returns safely to title, then unblocked URL and ordinary retry. No asset substituted.'});await b.shot(path.join(out,key+'-retry-play.png'));
 }finally{await b.close();}
 }
 fs.writeFileSync(path.join(out,'index.json'),JSON.stringify({source,physicalPhone:false,records:rows},null,2)+'\n');console.log('PASS eight native/size/left-right touch cases plus current-art failure/retry.');
})().catch(e=>{console.error(e);process.exitCode=1});
