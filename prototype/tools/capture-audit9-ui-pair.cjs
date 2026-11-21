// Matched supplied inventory/archive fixtures, real rendered menu clicks. Not earned progression.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const base=path.resolve('reviews/media/R1/audit9-implementation/ui-comparison'),data='reviews/telemetry/audit9-implementation/';
fs.mkdirSync(base,{recursive:true});const rows=[];
async function tap(b,selector){
 const p=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);return{x,y,hit:e===h||e.contains(h)}})()`);
 assert(p.hit,selector+' is obscured');for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});
}
(async()=>{for(const side of ['before','after']){
 const tag=side==='before'?'before':'integrated12',build=JSON.parse(fs.readFileSync(data+tag+'.json'));
 const b=await openBrowser('http://127.0.0.1:'+(side==='before'?8787:8801)+'/?level=3&lang=en&skipintro=1');try{
  await b.until(()=>b.evaluate('P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'title');await tap(b,'#btn-start');
  await b.until(()=>b.evaluate('P.debug.state==="play"'),'play');await tap(b,'#btn-pause');
  await b.evaluate(`(()=>{const s=P.debug.sim;s.recipeFocus='knife';s.hero.weapons={knife:5,nailgun:3,chain:3,sledge:3,torch:3,chainsaw:3};s.hero.passives={shoes:3,jacket:3,gloves:3,energy:3,medkit:3,nazar:3};s.hero.evolved={};s.hero.mods={knife:['knife.A','knife.A1'],nailgun:['nailgun.A'],chain:['chain.B']};s.pendingLevels=1;P.Screens.showCards(s,{cards:[P.Progression.cardFor(s,'p:energy'),P.Progression.cardFor(s,'w:nailgun'),P.Progression.cardFor(s,'p:medkit')],scripted:false},()=>{},()=>{});})()`);
  const id='build-'+side,film=await recordDOM(b,path.join(base,id+'.mp4'),async()=>{
   await b.sleep(1300);await b.shot(path.join(base,id+'.png'));
   if(side==='after'){await tap(b,'#cards-build [data-build-item="knife"]');await b.sleep(1800);await tap(b,'.build-detail button');}
   await b.sleep(1700);return b.evaluate('({clock:P.debug.sim.runT,slots:document.getElementById("cards-build").innerText})');
  });
  rows.push({id,file:id+'.mp4',sourceManifest:build.runtime_manifest_sha256,fixture:true,supplied:'Matched six weapons/six passives, rank5 knife and actual modifier IDs supplied solely to inspect the ordinary build UI. No earned power or difficulty claim.',...film});
  await b.evaluate("P.Meta.state().collection['page:l1_outro']=true;P.Meta.state().stars[1]=3;P.Meta.state().unlocked=2;P.Meta.state().pending=null;P.Meta.Save.write(P.Meta.state());P.debug.openMap()");
  await b.sleep(450);await tap(b,'[data-tab=coll]');await b.sleep(250);
  const memory='memory-'+side,save=await b.evaluate('JSON.stringify(P.Meta.state())');
  const replay=await recordDOM(b,path.join(base,memory+'.mp4'),async()=>{
   await b.sleep(800);await tap(b,'.meta-coll-item.is-on');await b.until(()=>b.evaluate('!!document.querySelector(".cm-page")'),'actual replay');await b.sleep(2500);
   await b.shot(path.join(base,memory+'.png'));
   const visible=await b.evaluate('(()=>{const p=document.querySelector(".cm-page"),r=p.getBoundingClientRect(),e=document.elementFromPoint(r.x+r.width*.6,r.y+r.height*.5);return{pageAbove:p===e||p.contains(e),hubHidden:document.querySelector(".meta-root").hidden,state:P.debug.state,t:P.debug.sim.runT}})()');
   if(side==='after'){assert(visible.pageAbove&&visible.hubHidden);await tap(b,'.memory-back');await b.sleep(1400);assert(!await b.evaluate('!!document.querySelector(".cm-page")'));}
   else assert(!visible.pageAbove&&!visible.hubHidden,'Baseline must reproduce the covered replay');
   return visible;
  });
  assert.equal(await b.evaluate('JSON.stringify(P.Meta.state())'),save,'Replay changes save/reward');
  rows.push({id:memory,file:memory+'.mp4',sourceManifest:build.runtime_manifest_sha256,fixture:true,supplied:'Supplied L1 archive eligibility/star/unlock fixture. Actual collection click and final Back; no earned-clear or reward claim.',...replay});
  fs.writeFileSync(path.join(base,'index.json'),JSON.stringify(rows,null,2)+'\n');console.log(side,'build and actual Memories flow',b.errors);
  assert.equal(b.errors.length,0);
 }finally{await b.close();}
}})().catch(e=>{console.error(e);process.exitCode=1});
