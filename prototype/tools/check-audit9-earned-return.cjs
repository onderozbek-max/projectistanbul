// Reopen the actual completed profile. No imported save, unlock, power or settlement injection.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const mainRoot=path.resolve('reviews/media/R1/audit9-implementation/walkthrough-final12');
const root=path.resolve(process.env.AUDIT9_RETURN_ROOT||mainRoot);
const index=JSON.parse(fs.readFileSync(path.join(mainRoot,'index.json')));
const sourceManifest=root===mainRoot?index.sourceManifest:JSON.parse(fs.readFileSync('reviews/telemetry/audit9-implementation/integrated13.json')).runtime_manifest_sha256;
const save=JSON.parse(fs.readFileSync(path.join(root,'earned-save-final.json')));
assert.equal(new Set(index.records.filter(r=>r.outcome==='won').map(r=>r.level)).size,30);
assert.equal(root===mainRoot?JSON.parse(fs.readFileSync(path.join(root,'final-process-exit.json'))).exit:+fs.readFileSync('reviews/telemetry/audit9-implementation/final13-earned-ending.exit','utf8'),0);
const profile=JSON.parse(fs.readFileSync(path.join(root,'profile.json'))),origin=new URL(profile.url).origin;
const fields=['unlocked','coins','hurda','stars','heroes','tree','gear','equipped','mastery','bonds','settledRuns'];
const select=s=>Object.fromEntries(fields.map(k=>[k,s[k]]));
async function click(b,selector){
 const q=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,hit:e.contains(document.elementFromPoint(x,y))}})()`);
 assert(q.hit,'Visible control must receive actual input');
 await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x:q.x,y:q.y,button:'left',clickCount:1});
 await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:q.x,y:q.y,button:'left',clickCount:1});
}
(async()=>{
 const b=await openBrowser(origin+'/?lang=en',{profileDir:profile.dir});
 try{
  await b.until(()=>b.evaluate("P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'earned title');
  assert.deepEqual(select(await b.evaluate('P.Meta.state()')),select(save),'Reopening cannot change earned progression');
  let map;
  const film=await recordDOM(b,path.join(root,'earned-final-return.mp4'),async()=>{
   await click(b,'#btn-start');await b.until(()=>b.evaluate("P.debug.state==='map'"),'earned boundary map');await b.sleep(700);
   map=await b.evaluate('(()=>{const e=document.querySelector(".meta-next .meta-play");return{state:P.debug.state,unlocked:P.Meta.unlockedLevel(),text:document.querySelector(".meta-next").textContent,disabled:e.disabled,visible:!!e.getClientRects().length,boundary:P.t("exp.boundary"),simLevel:P.debug.sim?.levelIndex,staleComic:!!document.querySelector(".cm-page")||P.MemoryReplay.active()}})()');
   fs.writeFileSync(path.join(root,'earned-boundary-observation.json'),JSON.stringify(map,null,2)+'\n');
   await b.shot(path.join(root,'earned-final-boundary.png'));
   assert((map.disabled||!map.visible)&&map.text.includes(map.boundary)&&!map.staleComic,'Boundary must be explicit with no visible enabled next level');
   await b.sleep(4500);return map;
  });
  assert.deepEqual(select(await b.evaluate('P.Meta.state()')),select(save),'Return must not settle twice');
  await b.send('Page.navigate',{url:origin+'/?level=31&skipintro=1&lang=en'});
  await b.until(()=>b.evaluate("!!window.P?.debug&&P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'direct31 title');
  await click(b,'#btn-start');await b.sleep(900);
  const refused=await b.evaluate('({state:P.debug.state,level:P.debug.sim?.levelIndex,save:P.Meta.state()})');
  assert.equal(refused.state,'map','Direct31 must return to the boundary map');
  assert.notEqual(refused.level,31);assert.deepEqual(select(refused.save),select(save));
  await b.shot(path.join(root,'earned-direct31-refused.png'));assert.equal(b.errors.length,0);
  const row={id:'earned-final-return',file:'earned-final-return.mp4',sourceManifest,fixture:false,
   supplied:'Actual completed fresh-earned profile reopened. Ordinary Start→boundary map, unchanged earned currency/stars/perks/gear/settlement. A separate direct31 URL attempt is rejected without starting31. Not phone or uncoached-player proof.',
   map,direct31:{state:refused.state,level:refused.level,rewardsUnchanged:true},...film,errors:b.errors};
  fs.writeFileSync(path.join(root,'earned-final-return.json'),JSON.stringify(row,null,2)+'\n');console.log('PASS earned return/boundary/direct31 refusal; no reward mutation');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
