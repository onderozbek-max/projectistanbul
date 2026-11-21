// Actual call/booster lifecycle and a genuinely earned rank-five badge, with supplied positioning labelled.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8781',out=path.resolve('reviews/media/R1/audit8-implementation/release-identities');fs.mkdirSync(out,{recursive:true});
const build=JSON.parse(fs.readFileSync('reviews/telemetry/audit8-implementation/release-build.json')),records=[];
async function call(lang){
 const b=await openBrowser(origin+'/?level=1&skipintro=1&lang='+lang);try{
  await b.until(()=>b.evaluate("P.ArtRaster.heroState()==='ready'"),'art');
  await b.evaluate("P.Story.play=(n,w,d)=>{d();return false;};document.getElementById('btn-start').click()",true);
  await b.until(()=>b.evaluate("P.debug.state==='play'"),'play');
  await b.evaluate(`(()=>{const s=P.debug.sim;s.hero.invuln=Infinity;s.enemies=[];s.hero.weapons={};P.Horde.step=()=>{};
   s.dir.tut.done.t_move=true;s.dir.tut.active=null;s.cardPicks=1;s.props.doorOpen=true;s.hero.x=-5.9;s.hero.y=63.3;
   P.Fx.reset(s);P.Input.get=()=>({x:0,y:0});window.events=[];const drain=P.drainEvents;
   P.drainEvents=s=>{const es=drain(s);events.push(...es);return es;};})()`);
  await b.until(()=>b.evaluate('P.debug.sim.dir.call.active&&P.debug.sim.hacks.some(h=>h.kind==="cell")'),'real director call and booster');
  const media=await recordDOM(b,path.join(out,'mom-broken-restored-'+lang+'.mp4'),async()=>{
   await b.evaluate('P.Input.get=()=>({x:0,y:P.debug.sim.hero.y<66?1:0})');
   await b.until(()=>b.evaluate('P.debug.sim.dir.call.boosting'),'actual booster interruption');
   await b.sleep(250);await b.shot(path.join(out,'mom-static-'+lang+'.png'));
   assert.equal(await b.evaluate('P.ComicRaster.actorId("mom")'),'anne');
   await b.until(()=>b.evaluate('P.debug.sim.dir.call.restored'),'real hack restoration');
   await b.sleep(850);await b.shot(path.join(out,'mom-restored-'+lang+'.png'));
   return b.evaluate('({bars:P.debug.sim.dir.call.bars,boosting:P.debug.sim.dir.call.boosting,restored:P.debug.sim.dir.call.restored,events})');
  });
  assert(media.outcome.events.some(e=>e.type==='signalRestored'&&e.mom));assert.equal(b.errors.length,0);
  records.push({id:'mom-'+lang,sourceManifest:build.runtime_manifest_sha256,fixture:true,
   supplied:'Quiet opaque observer, street position and one prerequisite card pick supplied; real Director call, actual movement into existing booster, real hack work/interruption/restoration. No forged subtitle or successful hack.',...media,frameErrors:b.errors});
 }finally{await b.close();}
}
async function badge(){
 const source=JSON.parse(fs.readFileSync('reviews/telemetry/audit8-implementation/earned-badge-save.json'));
 const b=await openBrowser(origin+'/?lang=en');try{
  await b.evaluate('Object.assign(P.Meta.state(),'+JSON.stringify(source.save)+');P.Meta.state().pending=null;P.Meta.Save.write(P.Meta.state());P.Meta.open(()=>{});P.Meta.Hub.show("coll")',true);
  const badges=await b.evaluate('({entries:P.Meta.Collect.catalogue().filter(e=>e.kind==="badge").length,earned:Object.keys(P.Meta.state().collection).filter(k=>k.startsWith("badge:")),rank:P.Meta.masteryRank("knife")})');
  assert.equal(badges.entries,17);assert(badges.earned.includes('badge:knife'));assert(badges.rank>=5);
  await b.shot(path.join(out,'earned-badge-catalogue.png'));await b.send('Page.reload');
  await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"'),'reload');
  assert(await b.evaluate('!!P.Meta.state().collection["badge:knife"]'));assert.equal(b.errors.length,0);
  records.push({id:'earned-badge',source:source.origin,supplied:'No kills/ranks/badge supplied: use linked replay save. Pending recap consumed for layout inspection only.',...badges,reloaded:true,frameErrors:b.errors});
 }finally{await b.close();}
}
(async()=>{await call('tr');await call('en');await badge();fs.writeFileSync('reviews/telemetry/audit8-implementation/release-identities.json',JSON.stringify(records,null,2));console.log('Real broken/restored Mom calls TR/EN and actual earned badge/reload passed.');})().catch(e=>{console.error(e);process.exitCode=1;});
