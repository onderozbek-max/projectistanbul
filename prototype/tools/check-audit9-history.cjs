// Session reload/first-sighting fixture; no earned-campaign or human-comprehension claim.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8789',baseline=!!process.env.AUDIT9_HISTORY_BASELINE;
const tag=process.env.AUDIT9_HISTORY_TAG||'working',out=path.resolve('reviews/media/R1/audit9-implementation/history-'+tag);fs.mkdirSync(out,{recursive:true});
const source=process.env.AUDIT9_MANIFEST?JSON.parse(fs.readFileSync(process.env.AUDIT9_MANIFEST)):null;
const records=[];
async function clickStart(b){
 await b.evaluate(`window.nativeStory=P.Story.play;P.Story.play=function(n,w,d,s){if(w==='intro'){d();return false;}return nativeStory(n,w,d,s)};
 window.picked=[];const auditHistoryLine=P.Dialogue.line;P.Dialogue.line=function(id,o){const r=auditHistoryLine.apply(this,arguments);if(r)picked.push({id:r.id,i:r.i,t:r.t});return r;};`);
 const p=await b.evaluate('(()=>{const r=document.getElementById("btn-start").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');
 await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});
 await b.until(()=>b.evaluate('P.debug.state==="play"'),'actual Start');
 await b.evaluate(`(()=>{const s=P.debug.sim;P.Horde.step=()=>{};P.Story.playInRun=()=>false;s.enemies=[];s.hero.weapons={};s.hero.invuln=Infinity;if(s.env)s.env.portals=[];P.Comic.clearRunDialogue();if(s.dir.call){s.dir.call.active=false;s.dir.call.sub=null;s.dir.call.queue=[];}P.Barks.reset(42);P.Barks.setEnabled(true);
 window.auditHistorySpitter=P.Combat.spawnEnemy(s,'spitter',s.hero.x+2,s.hero.y+2,{state:'active'});auditHistorySpitter.hp=auditHistorySpitter.maxHp=10000;})()`);
}
(async()=>{const b=await openBrowser(origin+'/?level=3&seed=42&lang=en&skipintro=1');try{
 await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'title');
 await b.evaluate('P.Meta.reset()');const first=await b.evaluate('P.Dialogue.line("BK.self",{lang:"en",rng:()=>0})');
 await clickStart(b);await b.until(()=>b.evaluate('picked.some(r=>r.id==="BK.fk.spitter")'),'actual live first sighting',20000);
 await b.shot(path.join(out,'first-sighting.png'));
 const before=await b.evaluate('({firstWarning:picked.filter(r=>r.id==="BK.fk.spitter"),knowledge:P.Dialogue.knowledge?.(),stored:sessionStorage.getItem("nsi.dialogue.session.v1")})');
 await b.send('Page.reload');await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'actual reload');
 const second=await b.evaluate('P.Dialogue.line("BK.self",{lang:"en",rng:()=>0})');const native=await b.evaluate('P.Dialogue.line("BK.self",{lang:"tr",rng:()=>0})');
 await clickStart(b);await b.sleep(5500);await b.shot(path.join(out,'reloaded-known-enemy.png'));
 const after=await b.evaluate('({warnings:picked.filter(r=>r.id==="BK.fk.spitter"),knowledge:P.Dialogue.knowledge?.(),alive:!auditHistorySpitter.dead,state:auditHistorySpitter.state,distance:Math.hypot(auditHistorySpitter.x-P.debug.sim.hero.x,auditHistorySpitter.y-P.debug.sim.hero.y),stored:sessionStorage.getItem("nsi.dialogue.session.v1")})');
 assert(after.alive&&after.state==='active'&&after.distance<7,'The reloaded acquaintance probe must contain a real living nearby enemy');
 if(baseline){assert.equal(second.i,first.i);assert(after.warnings.length>0,'Baseline must reproduce the repeated first-sighting warning');}
 else{assert.notEqual(second.i,first.i,'No immediate ambient repeat across reload');assert.equal(native.i,0,'Independent Turkish variant history');assert.equal(after.warnings.length,0,'Known living type cannot introduce itself again after reload');assert(after.knowledge.met.spitter);}
 await b.send('Page.reload');await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'reset at title');
 const reset=await b.evaluate('(()=>{P.Meta.reset();return{stored:sessionStorage.getItem("nsi.dialogue.session.v1"),knowledge:P.Dialogue.knowledge?.()}})()');
 if(!baseline){assert.equal(reset.stored,null);assert.equal(Object.keys(reset.knowledge.met).length,0);}
 assert.equal(b.errors.length,0,b.errors.join('\n'));
 records.push({baseline,origin,fixture:true,supplied:'Direct L3 entry and skipped intro for a quiet live-spitter first-sighting probe; supplied invulnerability/high-HP actor/no weapons/no horde; unrelated call/comic queue cleared to isolate the actual first-sighting event. Ambient variation uses a declared deterministic view RNG at title. Actual Start/reload; no imported save, first-clear fact or outcome claim.',first,second,native,before,after,reset,errors:b.errors});
 records[0].sourceManifest=source?.runtime_manifest_sha256||null;
 fs.writeFileSync(path.join(out,'index.json'),JSON.stringify(records,null,2)+'\n');console.log(baseline?'Confirmed baseline reload repeats ambient variant and enemy introduction':'PASS actual reload retains acquaintance/ambient variation, independent native pools and explicit profile reset');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
