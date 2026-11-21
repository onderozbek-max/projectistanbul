'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8788';
const tag=process.env.AUDIT9_UI_TAG||'current';
const out=path.resolve('reviews/media/R1/audit9-implementation/interface-'+tag);fs.mkdirSync(out,{recursive:true});
const records=[];
async function tap(b,selector,click=true){
 await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing control');let a=e.parentElement;
 while(a&&(!/auto|scroll/.test(getComputedStyle(a).overflowY)||a.scrollHeight<=a.clientHeight))a=a.parentElement;
 if(a){const r=e.getBoundingClientRect(),b=a.getBoundingClientRect(),scale=b.height/a.offsetHeight;a.scrollTop+=(r.y+r.height/2-b.y-b.height/2)/scale;}})()`);
 await b.sleep(100);
 const p=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);return{x,y,hit:e===h||e.contains(h),hitClass:h&&h.className,hitHTML:h&&h.outerHTML.slice(0,180),w:r.width,h:r.height,phone:document.getElementById('phone').getBoundingClientRect().toJSON(),screenScroll:document.getElementById('scr-cards').scrollTop}})()`);
 if(!p.hit)await b.shot(path.join(out,'hittest-failure.png'));
 assert(p.hit&&p.w>0&&p.h>0,'Control is not hittable: '+selector+' '+JSON.stringify(p));
 if(!click)return p;
 await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x:p.x,y:p.y,button:'left',clickCount:1});
 await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:p.x,y:p.y,button:'left',clickCount:1});return p;
}
async function start(b){
 await b.until(()=>b.evaluate("P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'title');
 await tap(b,'#btn-start');await b.until(()=>b.evaluate("P.debug.state==='play'"),'play');await tap(b,'#btn-pause');
}
async function layout(b,rank,evolved){
 await b.evaluate(`(()=>{const s=P.debug.sim;s.recipeFocus='knife';s.hero.weapons={knife:${rank},nailgun:3,chain:3,sledge:3,torch:3,chainsaw:3};s.hero.passives={shoes:3,jacket:3,gloves:3,energy:3,medkit:3,nazar:3};s.hero.evolved={};if(${evolved}){delete s.hero.weapons.knife;s.hero.weapons.cleaver=5;s.hero.evolved.knife='cleaver';}s.hero.mods={knife:${rank===3?'["knife.A"]':'["knife.A","knife.A1"]'},nailgun:['nailgun.A'],chain:['chain.B']};s.pendingLevels=1;P.Screens.showCards(s,{cards:[P.Progression.cardFor(s,'p:energy'),P.Progression.cardFor(s,'w:nailgun'),P.Progression.cardFor(s,'p:medkit')],scripted:false},()=>{},()=>{});})()`);
 await b.sleep(180);
 const shapes=await b.evaluate(`(()=>{const e=document.getElementById('cards-build');return{width:e.clientWidth,scroll:e.scrollWidth,slots:e.querySelectorAll('button.slot').length,tags:Array.from(e.querySelectorAll('.slot-tags')).map(e=>({text:e.textContent,height:e.getBoundingClientRect().height}))}})()`);
 assert(shapes.scroll<=shapes.width+2,'Horizontal build overflow');assert.equal(shapes.slots,12);
 assert(shapes.tags.every(t=>t.height<30&&/^\d+$/.test(t.text)),'Full text leaked into compact inventory');
 await tap(b,'#cards-build [data-build-item='+JSON.stringify(evolved?'cleaver':'knife')+']');
 assert(await b.evaluate("document.querySelector('.build-detail').textContent.includes(P.t('moddesc.knife.A'))"),'Complete mod explanation missing');
 await tap(b,'.build-detail button');
 if(!await b.evaluate('document.getElementById("cards-plan").open'))await tap(b,'#cards-plan summary');
 const before=await b.evaluate('JSON.stringify({r:P.debug.sim.rerolls,w:P.debug.sim.hero.weapons,h:P.debug.sim.hero.hp})');
 await tap(b,'#cards-plan [data-build-plan=chainsaw]');
 assert.equal(await b.evaluate('P.debug.sim.recipeFocus'),'chainsaw');
 assert.equal(await b.evaluate('JSON.stringify({r:P.debug.sim.rerolls,w:P.debug.sim.hero.weapons,h:P.debug.sim.hero.hp})'),before);
 // Reach every choice and its real mod selection; no fixture callback grants a reward.
 const controls=await b.evaluate("Array.from(document.querySelectorAll('#cards .card')).map((e,i)=>'#cards .card:nth-child('+(i+1)+')'+(e.querySelector('.mod-opt')?' .mod-opt':''))");
 for(const selector of controls){
  const exists=await b.evaluate('!!document.querySelector('+JSON.stringify(selector)+')');
  assert(exists);await tap(b,selector,false);
 }
 return shapes;
}
async function growth(b){
 await b.evaluate('P.debug.openMap()');await b.sleep(400);await tap(b,'.meta-prep');await b.sleep(250);
 await tap(b,'.meta-attr:not(.meta-hidden) .growth-path-link');await b.sleep(300);
 const positions=await b.evaluate('({phone:document.getElementById("phone").scrollTop,meta:document.querySelector(".meta-root").scrollTop,document:document.scrollingElement.scrollTop})');
 await b.shot(path.join(out,'growth-perk.png'));
 assert.deepEqual(positions,{phone:0,meta:0,document:0},'Opening a preferred perk must scroll only its owning panel');
 const training=await b.evaluate('!!document.querySelector(".meta-tree:not(.meta-hidden) .growth-path-link")');
 if(training){await tap(b,'.meta-tree:not(.meta-hidden) .growth-path-link');await b.sleep(250);}
 const selector=training?'.meta-attr:not(.meta-hidden) .meta-iconbtn':'.meta-tree:not(.meta-hidden) .meta-iconbtn';
 await tap(b,selector);await b.sleep(400);await tap(b,'.meta-next .meta-play',false);
 records.push({id:'growth-preferred-perk-return',positions,trainingLink:training,visibleMapReturn:true});
}
async function replay(b){
 await b.evaluate("P.Meta.state().collection['page:l1_outro']=true;P.Meta.state().stars[1]=3;P.Meta.state().unlocked=2;P.Meta.state().pending=null;P.Meta.Save.write(P.Meta.state());P.debug.openMap()");await b.sleep(450);
 await tap(b,'[data-tab=coll]');await b.sleep(180);
 const save=await b.evaluate('JSON.stringify(P.Meta.state())'),clock=await b.evaluate('P.debug.sim.runT');
 for(const ending of ['complete','skip','back']){
  await tap(b,'.meta-coll-item.is-on');await b.until(()=>b.evaluate('!!document.querySelector(".cm-page")'),'real replay');
  assert(await b.evaluate('P.MemoryReplay.active()&&document.querySelector(".meta-root").hidden&&document.querySelector(".meta-root").inert'));
  assert.equal(await b.evaluate('P.Meta.openDaily()'),false,'A replay cannot launch gameplay or spend a daily attempt');
  await b.sleep(200);
  if(ending==='complete'){
   for(let i=0;i<24&&await b.evaluate('P.MemoryReplay.active()');i++){
    const p=await b.evaluate('(()=>{const r=document.querySelector(".cm-page").getBoundingClientRect();return{x:r.x+r.width*.7,y:r.y+r.height*.6}})()');
    await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});await b.sleep(180);
   }
  }else if(ending==='skip'){
   const p=await b.evaluate('(()=>{const r=document.querySelector(".cm-skip").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');
   assert(await b.evaluate('(()=>{const e=document.querySelector(".cm-skip"),r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})()'));
   await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await b.sleep(850);await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});
  }else await tap(b,'.memory-back');
  await b.until(()=>b.evaluate('!P.MemoryReplay.active()&&!document.querySelector(".cm-page")&&!document.querySelector(".memory-back")'),'clean return');
  assert.equal(await b.evaluate('P.debug.sim.runT'),clock,'Gameplay cannot advance behind replay');
  assert.equal(await b.evaluate('JSON.stringify(P.Meta.state())'),save,'Replay cannot alter rewards or campaign facts');
  records.push({id:'memory-'+ending,visibleReturn:await b.evaluate('!document.querySelector(".meta-root").hidden&&!document.querySelector(".meta-root").inert'),noRewardOrClockChange:true});
 }
 await b.evaluate("history.replaceState({},'', '/?lang=en')");await b.send('Page.reload');await b.until(()=>b.evaluate("typeof P!=='undefined'&&P.debug?.state==='title'&&P.ArtRaster.heroState()==='ready'"),'reload');
 await tap(b,'#btn-start');await b.until(()=>b.evaluate("P.debug.state==='map'"),'real saved map');await b.sleep(350);await tap(b,'[data-tab=coll]');await tap(b,'.meta-coll-item.is-on');await b.until(()=>b.evaluate('P.MemoryReplay.active()'),'reloaded replay');await tap(b,'.memory-back');
 await tap(b,'.meta-hub .meta-iconbtn');await b.sleep(250);await tap(b,'.meta-next .meta-play');
 await b.until(()=>b.evaluate("P.debug.state==='play'&&P.debug.sim.levelIndex===2"),'next actual run',15000);
 assert(!await b.evaluate('!!document.querySelector(".cm-page")||P.MemoryReplay.active()'),'Stale story leaked into next run');
 records.push({id:'replay-reload-next-run',actualLevel:2,staleOverlay:false});
}
(async()=>{
 for(const [width,height]of[[390,844],[320,568]])for(const lang of['tr','en'])for(const textSize of[100,150]){
  if(process.env.AUDIT9_GROWTH_ONLY&&(width!==320||lang!=='tr'||textSize!==150))continue;
  const b=await openBrowser(origin+'/?level=3&skipintro=1&lang='+lang,{width,height});try{
   await start(b);await b.evaluate(`P.Settings.textSize=${textSize};P.Settings.reduceMotion=true;P.applySettings()`);
   const viewport=await b.evaluate('({width:innerWidth,height:innerHeight,phone:document.getElementById("phone").getBoundingClientRect().toJSON()})');
   assert.equal(viewport.width,width);assert.equal(viewport.height,height);
   for(const [rank,evolved]of[[3,false],[5,false],[5,true]]){const r=await layout(b,rank,evolved);records.push({id:'populated-build',viewportWidth:width,viewportHeight:height,viewport,lang,textSize,rank,evolved,...r,buildClientWidth:r.width});}
   await b.shot(path.join(out,'populated-'+lang+'-'+width+'-'+textSize+'.png'));
   if(width===390&&lang==='en'&&textSize===100)await replay(b);
   await growth(b);
   assert.equal(b.errors.length,0,b.errors.join('\n'));
  }finally{await b.close();}
 }
 fs.writeFileSync('reviews/telemetry/audit9-implementation/ui-checks-'+tag+'.json',JSON.stringify({origin,provenance:'Supplied populated run and story-eligibility fixtures; actual rendered click/hit-test/reload/next-run flow. Earned-flow proof remains separately required.',records},null,2)+'\n');
 console.log('PASS: 24 populated build layouts, full descriptions/plan, actual Memories completion/skip/back/reload/next-run.');
})().catch(e=>{console.error(e);process.exitCode=1});
