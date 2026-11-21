// Explicit supplied observation positions, ordinary proximity verbs and real state transitions. Not earned/player acceptance.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const tag=process.env.RESET_BUILD||'candidate14',origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8823',out=process.env.RESET_CHECK_OUT||'reviews/media/R1/first30-reset/'+tag+'-interactions';fs.mkdirSync(out,{recursive:true});
const cases=new Set((process.env.RESET_INTERACTION_CASES||'station,breakable,portable,cover').split(','));
const source=JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/'+tag+'.json')),records=[];
async function setup(b,level){
 await b.send('Page.navigate',{url:origin+'/?level='+level+'&seed=42&skipintro=1&lang=en'});
 await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'title');
 await b.evaluate('window.nativeStory=P.Story.play;P.Story.play=function(n,w,d,s){if(w==="intro"){d();return false;}return nativeStory(n,w,d,s)}');await b.evaluate('document.getElementById("btn-start").click()',true);await b.until(()=>b.evaluate('P.debug.state==="play"'),'play');
 await b.evaluate(`(()=>{const s=P.debug.sim;P.Horde.step=()=>{};P.Story.playInRun=()=>false;P.Progression.addXp=()=>{};s.enemies=[];s.enemyTele=[];s.gen.mi=s.gen.marks.length;s.gen.routeSpent=Infinity;s.hero.weapons={};s.hero.invuln=Infinity;s.hero.sinceHit=99;s.streetWeapon=null;s.streetGrab=null;s.drops=[];s.env.portals=[];if(s.milestone)s.milestone.open=true;
 P.Comic.clearRunDialogue();P.Barks.clear();P.Barks.setEnabled(false);P.Input.get=()=>({x:0,y:0});window.interactionEvents=[];window.interactionStates=[];const drain=P.drainEvents;P.drainEvents=function(s){const es=drain(s);for(const e of es)if(['pickup','propStrike','envHit','envBreak','envFuse','envExplode','streetWeapon','heroHit'].includes(e.type))interactionEvents.push({t:s.runT,...e});return es};
 window.stateTimer=setInterval(()=>{const s=P.debug.sim;interactionStates.push({wall:Date.now()/1000,t:s.runT,hp:s.hero.hp,holding:s.hero.streetHolding,phase:s.streetWeapon?.phase,grab:s.streetGrab?.t,intent:s.propIntent?.t,station:s.eczane?.list.map(z=>({used:z.used,dwell:z.dwell})),prop:window.testProp?{alive:testProp.alive,hp:testProp.hp,fuseT:testProp.fuseT}:null,site:s.streetSite?{used:s.streetSite.used,until:s.streetSite.until,fill:s.streetSite.fill}:null})},80)})()`);
}
async function film(b,id,run,supplied){let r;try{r=await recordDOM(b,path.join(out,id+'.mp4'),run);}catch(error){const failure=await b.evaluate('(()=>{const s=P.debug.sim,h=s.hero,r=window.testProp;return{time:s.runT,hero:{x:h.x,y:h.y,moving:h.moving,dashing:h.dashing,sinceHit:h.sinceHit,holding:h.streetHolding},prop:r?{alive:r.alive,hp:r.hp,x:r.x,y:r.y,street:r.street,gripAfter:r.gripAfter,box:r.b.rc,eligible:P.StreetWeapon.eligible(s,r)}:null,phase:s.streetWeapon?.phase,grab:s.streetGrab?.t,events:interactionEvents,states:interactionStates}})()');fs.writeFileSync(path.join(out,id+'-failure.json'),JSON.stringify({error:String(error),failure},null,2));await b.shot(path.join(out,id+'-failure.png'));throw error;}const facts=await b.evaluate('({events:interactionEvents,states:interactionStates,mode:P.debug.sim.mode})');assert.equal(b.errors.length,0,b.errors.join('\n'));records.push({id,fixture:true,sourceManifest:source.runtime_manifest_sha256,supplied,...r,facts,errors:b.errors});fs.writeFileSync(path.join(out,'index.json'),JSON.stringify({source,method:'Actual rendered proximity verbs and state transitions in supplied quiet/positioned scenes; no earned/human/phone claim.',records},null,2)+'\n');console.log('PASS',id);}
(async()=>{
 const b=await openBrowser(origin);try{
 if(cases.has('station')){
 await setup(b,6);await b.evaluate('(()=>{const s=P.debug.sim,z=s.eczane.list[0];window.testStation=z;s.hero.x=z.b.x+z.b.w/2+1.4;s.hero.y=z.b.y;s.hero.hp=s.hero.maxHp*.45;P.Fx.reset(s)})()');
 await film(b,'station-approach-interrupt-resume-empty',async()=>{
  await b.evaluate('(()=>{const s=P.debug.sim;s.hero.x=testStation.b.x+testStation.b.w/2+.25;window.interruptedUse=false;P.Input.get=()=>{if(testStation.dwell>0)interruptedUse=true;return{x:interruptedUse?1:0,y:0};};})()');
  await b.until(()=>b.evaluate('interruptedUse&&!testStation.used&&testStation.dwell===0'),'ordinary movement interruption after actual use begins');await b.shot(path.join(out,'station-interrupted.png'));
  const before=await b.evaluate('P.debug.sim.hero.hp');await b.evaluate('(()=>{const s=P.debug.sim,z=testStation;P.Input.get=()=>({x:0,y:0});s.hero.x=z.b.x+z.b.w/2+.25;s.hero.y=z.b.y})()');
  await b.until(()=>b.evaluate('testStation.used'),'actual heal');const hp=await b.evaluate('P.debug.sim.hero.hp');assert(hp>before);await b.sleep(800);await b.shot(path.join(out,'station-empty.png'));await b.sleep(1500);assert.equal(await b.evaluate('P.debug.sim.hero.hp'),hp);return{before,hp,empty:true};
 },'Actual authored L6 pharmacy; observation position and45%HP supplied; ambient threats/XP suppressed. Real stationary use, actual movement interruption, supplied return position, real healing and empty refusal.');
 }
 if(cases.has('breakable')){
 await setup(b,3);await b.evaluate('(()=>{const s=P.debug.sim;s.geo.blocks=[];s.env.recs=[];s.eczane=null;s.streetSite=null;s.props.routeEdges=[];let placed=false;for(let y=36;y<100&&!placed;y+=4)for(const x of [-3.8,3.8,0])if(P.Env.addSolid(s,"kiosk",x,y,2,1.7)){placed=true;break;}if(!placed)throw Error("No valid kiosk fixture placement");window.testProp=s.env.recs.at(-1);s.hero.x=testProp.x-1.3;s.hero.y=testProp.y;P.Fx.reset(s)})()');
 await film(b,'breakable-near-contact-break',async()=>{await b.sleep(120);await b.shot(path.join(out,'breakable-available.png'));await b.until(()=>b.evaluate('!testProp.alive'),'actual proximity break');assert(await b.evaluate('interactionEvents.some(e=>e.type==="propStrike")'));await b.sleep(1600);await b.shot(path.join(out,'breakable-settled-drops.png'));return b.evaluate('({dropKinds:P.debug.sim.drops.map(d=>d.kind),alive:testProp.alive})');},'One supplied legal-size nonportable kiosk, quiet observer at legal proximity, no weapon/hit/outcome supply. Actual local propStrike and material break. Loot follows actual seeded chance; no drop guarantee or invented pickup.');
 }
 if(cases.has('portable')){
 await setup(b,6);await b.evaluate('(()=>{const s=P.debug.sim;window.testProp=s.streetSite.prop;s.streetSite=null;s.hero.x=testProp.x;s.hero.y=testProp.y-testProp.b.h/2-.30;P.Fx.reset(s)})()');
 await film(b,'portable-dash-drop-three-swings-throw',async()=>{
  await b.until(()=>b.evaluate('P.debug.sim.streetWeapon?.phase==="carry"'),'actual lift');await b.shot(path.join(out,'portable-carried.png'));
  await b.evaluate('P.Input.get=()=>({x:1,y:0,dash:true})');await b.sleep(250);assert(!await b.evaluate('P.debug.sim.hero.streetHolding'));await b.shot(path.join(out,'portable-dash-drop.png'));
  await b.evaluate('(()=>{const s=P.debug.sim;P.Input.get=()=>({x:0,y:0});s.hero.x=testProp.x;s.hero.y=testProp.y-testProp.b.h/2-.30;})()');await b.until(()=>b.evaluate('P.debug.sim.streetWeapon?.phase==="carry"'),'real regrip');
  await b.evaluate('(()=>{const s=P.debug.sim;for(let i=0;i<20;i++){const a=i*2.399,e=P.Combat.spawnEnemy(s,"walker",s.hero.x+Math.cos(a)*1.25,s.hero.y+Math.sin(a)*1.25,{state:"active"});e.hp=e.maxHp=10000;e.speed=.03;}})()');
  await b.until(()=>b.evaluate('interactionEvents.some(e=>e.type==="streetWeapon"&&e.beat==="land")'),'real three swings/throw/land',18000);await b.sleep(850);await b.shot(path.join(out,'portable-land.png'));
  const events=await b.evaluate('interactionEvents.filter(e=>e.type==="streetWeapon")');assert(events.some(e=>e.beat==='drop'));assert(events.filter(e=>e.beat==='swing').length>=3);assert(events.some(e=>e.beat==='contact'&&e.targets>0));return{events};
 },'Actual authored L6 bench; starting/return observation positions supplied, ordinary automatic lift and real Dash drop/regrip. Twenty supplied high-HP slow targets exercise actual swing/contact/throw/landing; no contact or hit result supplied. No earned or human-input claim.');
 }
 if(cases.has('cover')){
 await setup(b,6);await b.evaluate('(()=>{const s=P.debug.sim;window.testProp=s.streetSite.prop;s.hero.x=testProp.x;s.hero.y=testProp.y-testProp.b.h/2-.30;P.Fx.reset(s)})()');
 await film(b,'placed-cover-actual-duration-expiry',async()=>{
  await b.until(()=>b.evaluate('P.debug.sim.streetWeapon?.phase==="carry"'),'lift for shelter');
  await b.evaluate('P.Input.get=()=>{const s=P.debug.sim,h=s.hero,p=s.streetSite,dx=p.x-h.x,dy=p.gripY-h.y,d=Math.hypot(dx,dy);return d<.15?{x:0,y:0}:{x:dx/d,y:dy/d}}');
  await b.until(()=>b.evaluate('P.debug.sim.streetSite.used'),'real shelter placement',15000);const before=await b.evaluate('({t:P.debug.sim.t,until:P.debug.sim.streetSite.until,alive:testProp.alive})');await b.shot(path.join(out,'cover-placed.png'));assert(before.alive);await b.sleep(9000);await b.shot(path.join(out,'cover-expired.png'));
  assert.equal(await b.evaluate('P.debug.sim.streetSite.until'),0);assert(!await b.evaluate('testProp.alive'));return{before,duration:before.until-before.t};
 },'Actual authored L6 bench and valid marked shelter site, supplied starting position/invulnerability; ordinary automatic lift and fixture navigation through actual Input handler. Real placement/duration8s/expiration, no duration extension or protection grant.');
 }
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
