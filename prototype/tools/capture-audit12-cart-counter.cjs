// Supplied observer, actual committed cart, lateral escape, physical counter and real exposed hit.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const out=process.env.AUDIT12_COUNTER_OUT||'reviews/media/R1/audit12-implementation/integrated8-cart-counter';fs.mkdirSync(out,{recursive:true});
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8846',manifest=process.env.AUDIT9_MANIFEST||'reviews/telemetry/first30-reset/audit12-integrated8.json';
const code=fs.readFileSync('prototype/tools/capture-experience.cjs','utf8'),prep=code.slice(code.indexOf('function prepareBoss('),code.indexOf('function prepareWorld('));
(async()=>{const b=await openBrowser(origin+'/?level=15&seed=42&skipintro=1&lang=en');try{
 await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'title');
 await b.evaluate('window.nativeStory=P.Story.play;P.Story.play=function(n,w,d,s){if(w==="intro"){d();return false;}return nativeStory(n,w,d,s)}');
 await b.evaluate('document.getElementById("btn-start").click()',true);await b.until(()=>b.evaluate('P.debug.state==="play"'),'play');
 await b.evaluate(`(()=>{${prep}prepareBoss(15);const s=P.debug.sim,e=s.gen.boss;s.hero.invuln=Infinity;s.hero.weapons={};
 s.hero.x=0;s.hero.y=s.geo.holdY+1;e.x=0;e.y=s.hero.y+5.5;s.enemies=[e];s.gen.mi=s.gen.marks.length;s.env.portals=[];P.Progression.addXp=()=>{};
 window.counterEvents=[];window.counterPhase='first';const drain=P.drainEvents;
 P.drainEvents=function(s){const es=drain(s);for(const q of es)if(['bossCounter','bossWindup','hit'].includes(q.type))counterEvents.push({time:s.runT,...q});return es};
 P.Input.get=()=>{const h=s.hero,e=s.gen.boss,tele=s.enemyTele.find(t=>t.then==='dockCarts');
 if(counterPhase==='first')return{x:0,y:0};
 if(tele&&counterPhase==='bait'){window.cartCommit={x:tele.x,y:tele.y,hero:{x:h.x,y:h.y},boss:{x:e.x,y:e.y}};window.counterPhase='evade';}
 if(counterPhase==='evade')return{x:(cartCommit.x>=0?-1:1),y:0};
 const q={x:e.x,y:e.y-(counterPhase==='punish'?1:2.4)},dx=q.x-h.x,dy=q.y-h.y,d=Math.hypot(dx,dy);return d<.2?{x:0,y:0}:{x:dx/d,y:dy/d};};P.Fx.reset(s);})()`);
 await b.until(()=>b.evaluate('!P.SceneFlow.current()'),'entry handback');
 const film=await recordDOM(b,out+'/cart-bait-sidestep-counter-punish.mp4',async()=>{
  await b.until(()=>b.evaluate('counterEvents.some(e=>e.type==="bossWindup"&&e.act==="dockCarts")&&!P.debug.sim.gen.boss.dockCarts?.length&&!P.debug.sim.enemyTele.some(t=>t.then==="dockCarts")'),'first ordinary crossing',18000);
  assert.equal(await b.evaluate('counterEvents.filter(e=>e.type==="bossCounter").length'),0,'First pass cannot automatically rescue the observer');
  await b.evaluate('window.counterPhase="bait"');
  await b.until(()=>b.evaluate('counterEvents.some(e=>e.type==="bossCounter")'),'actual baited cart collision',25000);await b.shot(out+'/counter.png');
  await b.evaluate('window.counterPhase="punish";void P.Progression.debugGrant(P.debug.sim,{weapons:{knife:3}})');
  await b.until(()=>b.evaluate('counterEvents.some(e=>e.type==="hit"&&e.bossHit?.exposed)'), 'real damage during counter recovery',8000);await b.sleep(1300);await b.shot(out+'/punish.png');
  return b.evaluate('({commit:cartCommit,events:counterEvents,boss:{hp:P.debug.sim.gen.boss.hp,opening:P.debug.sim.gen.boss.cartOpening}})');
 });
 assert.equal(b.errors.length,0,b.errors.join('\n'));
 fs.writeFileSync(out+'/index.json',JSON.stringify({source:JSON.parse(fs.readFileSync(manifest)),fixture:true,supplied:'Actual L15 arena/AI with supplied initial aligned observation positions, opaque invulnerability, no initial weapons/ambient waves/XP. Diagnostic input getter follows normal motion; first cart crosses harmlessly, later positioning baits the real committed lane then sidesteps. Knife3 supplied only after actual collision; exposed hits are real. No counter flag, hit, boss death or outcome supplied; not earned difficulty or human play.',...film,errors:b.errors},null,2)+'\n');console.log('PASS ordinary pass, bait, sidestep, physical counter and exposed punish');
 }catch(error){fs.writeFileSync(out+'/failure.json',JSON.stringify({error:String(error),state:await b.evaluate('({t:P.debug.sim.runT,phase:counterPhase,events:counterEvents,commit:window.cartCommit,hero:{x:P.debug.sim.hero.x,y:P.debug.sim.hero.y},boss:{x:P.debug.sim.gen.boss.x,y:P.debug.sim.gen.boss.y,ai:P.debug.sim.gen.boss.ai}})')},null,2)+'\n');throw error;}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
