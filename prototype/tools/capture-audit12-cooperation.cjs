// Supplied observation scene, actual sack delivery, pressure, weapon kill and optional resumed work.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const out=process.env.AUDIT12_COOP_OUT||'reviews/media/R1/audit12-implementation/integrated7-cooperation';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await openBrowser((process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8843')+'/?level=23&seed=42&skipintro=1&lang=en');try{
 await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'title');
 await b.evaluate('window.nativeStory=P.Story.play;P.Story.play=function(n,w,d,s){if(w==="intro"){d();return false;}return nativeStory(n,w,d,s)}');
 await b.evaluate('document.getElementById("btn-start").click()',true);await b.until(()=>b.evaluate('P.debug.state==="play"'),'play');
 await b.evaluate(`(()=>{const s=P.debug.sim,m=s.milestone;s.loadout.kaanJoined=true;P.Companion.init(s);
 P.Horde.step=()=>{};P.Story.playInRun=()=>false;P.Progression.addXp=()=>{};s.gen.mi=s.gen.marks.length;s.enemies=[];s.env.portals=[];
 s.hero.weapons={};s.hero.invuln=Infinity;s.hero.x=m.sacks[0].x;s.hero.y=m.sacks[0].y-.25;s.companion.x=s.hero.x+1;s.companion.y=s.hero.y-.5;P.Fx.reset(s);
 P.Comic.clearRunDialogue();P.Barks.clear();window.helpEvents=[];window.workSamples=[];const drain=P.drainEvents;
 P.drainEvents=function(s){const es=drain(s);helpEvents.push(...es.filter(e=>['routeBeat','hit','kill'].includes(e.type)));return es};
 P.Input.get=()=>{const h=s.hero,p=m.delivered?{x:m.pallet.x-.9,y:m.pallet.y-1}:m.pallet;
 const at=P.WalkPath.nearest(s,p,P.CFG.hero.radius),path=at&&P.WalkPath.find(s,h,at,P.CFG.hero.radius),q=path?.[0]||at||p;
 const x=q.x-h.x,y=q.y-h.y,d=Math.hypot(x,y);return d<.18?{x:0,y:0}:{x:x/d,y:y/d};};
 window.workTimer=setInterval(()=>workSamples.push({wall:Date.now()/1000,t:s.runT,hero:{x:s.hero.x,y:s.hero.y},kaan:{x:s.companion.x,y:s.companion.y},work:m.work&&JSON.parse(JSON.stringify(m.work)),repay:!!s.kaanRepay}),100);
 })()`);
 const film=await recordDOM(b,out+'/L23-work-interrupted-and-helped.mp4',async()=>{
  await b.until(()=>b.evaluate('P.debug.sim.milestone.work?.blocked'),'actual loading blocked by arriving enemy',45000);
  await b.sleep(1800);await b.shot(out+'/blocked.png');
  const before=await b.evaluate('({t:P.debug.sim.runT,work:P.debug.sim.milestone.work,help:P.debug.sim.kaanRepay})');assert(!before.help);
  // Supply only weapon/rank after the interruption is visible; never supply a hit/death/help flag.
  await b.evaluate('void P.Progression.debugGrant(P.debug.sim,{weapons:{knife:5}})');
  await b.until(()=>b.evaluate('!!P.debug.sim.kaanRepay'),'actual weapon contact removes pressure and resumes work',30000);
  await b.sleep(500);await b.shot(out+'/resuming.png');
  await b.until(()=>b.evaluate('P.debug.sim.milestone.work.finished===1'),'one actual load finished');await b.sleep(2200);await b.shot(out+'/loaded.png');
  return{before,after:await b.evaluate('({t:P.debug.sim.runT,work:P.debug.sim.milestone.work,help:P.debug.sim.kaanRepay,delivered:P.debug.sim.milestone.delivered,open:P.debug.sim.milestone.open})')};
 });
 assert(!film.outcome.after.open&&film.outcome.after.delivered===1,'Optional help cannot auto-complete the three-sack task');
 assert.equal(b.errors.length,0,b.errors.join('\n'));
 fs.writeFileSync(out+'/index.json',JSON.stringify({source:JSON.parse(fs.readFileSync(process.env.AUDIT9_MANIFEST||'reviews/telemetry/first30-reset/audit12-integrated7.json')),fixture:true,
 supplied:'L23 observation position/joined precondition/opaque invulnerability/quiet ambient and no XP; no initial weapon. Actual first sack pickup/delivery spawns authored finite pressure. Knife5 supplied after real blockage, actual automatic hits/kill/help/work completion. Not earned difficulty or human motion acceptance.',...film,facts:await b.evaluate('({events:helpEvents,samples:workSamples})'),errors:b.errors},null,2)+'\n');console.log('PASS factual L23 loading interrupted, helped and resumed');
 }catch(error){fs.writeFileSync(out+'/failure-state.json',JSON.stringify({error:String(error),state:await b.evaluate('({t:P.debug.sim.runT,hero:P.debug.sim.hero,work:P.debug.sim.milestone.work,companion:P.debug.sim.companion,events:helpEvents,samples:workSamples})')},null,2)+'\n');throw error;}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
