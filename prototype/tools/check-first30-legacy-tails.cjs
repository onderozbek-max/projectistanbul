// Actual arbiter/render regression: visible notice retained, offscreen notice omitted,
// important offscreen speech retains its box without an arena-spanning pointer.
'use strict';const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{openBrowser}=require('./lib-experiential-browser.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8827',out=process.env.RESET_CHECK_OUT||'reviews/media/R1/first30-reset/candidate16-legacy-tails';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await openBrowser(origin+'/?level=3&skipintro=1&lang=en');try{
 await b.until(()=>b.evaluate("!!P.debug&&P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'title');
 await b.evaluate("P.Story.play=function(n,w,d){d();return false;};document.getElementById('btn-start').click()",true);await b.until(()=>b.evaluate("P.debug.state==='play'"),'play');
 await b.evaluate(`(()=>{const s=P.debug.sim;s.hero.x=0;s.hero.y=60;s.hero.invuln=Infinity;s.enemies=[];P.Horde.step=()=>{};s.gen.mi=s.gen.marks.length;P.Fx.reset(s);P.Comic.clearRunDialogue();s.dir.barks.cur=null;window.bubbleCalls=[];
 const frame=P.Render.frame,draw=P.Speech.drawPlain;P.Render.frame=function(){bubbleCalls=[];return frame.apply(this,arguments);};P.Speech.drawPlain=function(c,r,lines){bubbleCalls.push({r:{...r},lines:[...lines]});return draw.apply(this,arguments);};
 s.dir.bubbles=[{x:s.hero.x,y:s.hero.y+.8,text:'!',t:99,T:99},{x:s.hero.x,y:s.hero.y+150,text:'!',t:99,T:99}];})()`);
 await b.sleep(800);const visible=await b.evaluate('({calls:bubbleCalls,notices:P.debug.sim.dir.bubbles.length})');
 assert.equal(visible.notices,2,'View must not delete actual timed simulation notices');assert.equal(visible.calls.filter(c=>c.lines.join('')==='!').length,1,'One visible cat notice; offscreen notice is culled');
 await b.shot(path.join(out,'visible-notice.png'));
 await b.evaluate("P.debug.sim.dir.bubbles=[];P.debug.sim.dir.barks.cur={id:'barkRun',who:'shop',t:99,T:99}");await b.sleep(700);const offscreen=await b.evaluate('({calls:bubbleCalls,bark:P.debug.sim.dir.barks.cur})');
 assert(offscreen.calls.length>0,'Important offscreen dialogue keeps its box');assert(offscreen.calls.every(c=>c.r.tx==null&&c.r.ty==null),'Offscreen speech has no false long pointer');await b.shot(path.join(out,'offscreen-dialogue.png'));
 assert.equal(b.errors.length,0,b.errors.join('\n'));fs.writeFileSync(path.join(out,'index.json'),JSON.stringify({source:JSON.parse(fs.readFileSync(process.env.AUDIT9_MANIFEST||'reviews/telemetry/first30-reset/candidate16.json')),method:'Supplied quiet L3 observer, two actual timed notice records and actual native shop bark, real arbiter/render frames; no outcome/power supplied. View must retain sim data. Desktop rendering regression, not natural encounter, phone, audio or player proof.',visible,offscreen},null,2)+'\n');console.log('PASS visible notice, offscreen notice culling, important offscreen box, bounded tail, unchanged actual notices');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
