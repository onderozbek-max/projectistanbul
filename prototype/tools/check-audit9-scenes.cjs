// Supplied lifecycle/staging fixtures. Earned first-30 flow is recorded separately by walk-audit9.cjs.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8798',base=process.env.AUDIT9_SCENE_OUT||'reviews/media/R1/audit9-implementation/scenes-final9',out=path.resolve(base);
fs.mkdirSync(out,{recursive:true});const manifest=JSON.parse(fs.readFileSync(process.env.AUDIT9_MANIFEST||'reviews/telemetry/audit9-implementation/integrated9.json'));
const original=fs.readFileSync(path.join(__dirname,'capture-experience.cjs'),'utf8'),prep=original.slice(original.indexOf('function prepareBoss('),original.indexOf('function prepareWorld('));
const rows=[];const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function tap(b,selector,optional=false){const q=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,hit:e.contains(document.elementFromPoint(x,y))}})()`);if(!q){if(optional)return false;throw Error('Unavailable '+selector);}assert(q.hit,'Obscured '+selector);await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x:q.x,y:q.y,button:'left',clickCount:1});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:q.x,y:q.y,button:'left',clickCount:1});return true;}
async function key(b,key,code,num){await b.send('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:num});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:num});}
async function background(b){const target=(await b.send('Target.getTargetInfo')).targetInfo.targetId,other=(await b.send('Target.createTarget',{url:'about:blank'})).targetId;
 const before=await b.evaluate('({t:P.debug.sim.runT,hp:P.debug.sim.hero.hp,scene:P.SceneFlow.current()?.t})');
 await b.send('Target.activateTarget',{targetId:other});await sleep(1800);const hidden=await b.evaluate('document.hidden');
 await b.send('Target.activateTarget',{targetId:target});await b.send('Target.closeTarget',{targetId:other});await sleep(200);
 const after=await b.evaluate('({t:P.debug.sim.runT,hp:P.debug.sim.hero.hp,scene:P.SceneFlow.current()?.t})');
 assert.equal(after.t,before.t,'Protected gameplay clock advanced');assert.equal(after.hp,before.hp);
 await tap(b,'.scene-resume button',true);return{before,after,hidden,method:'Actual second desktop tab activation, not a fabricated visibility event. No phone claim.'};}
async function run(level,lang,skip){const b=await openBrowser(origin+'/?level='+level+'&seed=42&skipintro=1&lang='+lang),id='L'+level+'-'+lang+'-'+(skip?'skip-reduced-muted':'normal');
 try{
  await b.until(()=>b.evaluate("P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'title');
  await b.evaluate(`window.viewportDiagnostics=[];const warn=console.warn;console.warn=function(){if(String(arguments[0]).includes('boot_error'))viewportDiagnostics.push({args:Array.from(arguments).map(String),w:P.Render.W,h:P.Render.H,dpr:P.Render.dpr,canvas:[P.Render.canvas.width,P.Render.canvas.height],rect:document.getElementById('phone').getBoundingClientRect().toJSON()});return warn.apply(console,arguments)}`);
  await b.evaluate("window.storyNative=P.Story.play;P.Story.play=function(n,w,d,s){if(w==='intro'){d();return false;}return storyNative(n,w,d,s)}");await tap(b,'#btn-start');await b.until(()=>b.evaluate("P.debug.state==='play'"),'play');
  await b.evaluate(`(()=>{${prep}prepareBoss(${level});const s=P.debug.sim;s.hero.invuln=Infinity;s.enemies=[s.gen.boss];if(s.env)s.env.portals=[];s.gen.mi=s.gen.marks.length;P.Progression.addXp=()=>{};
   if(${level}>20){s.loadout=s.loadout||{};s.loadout.kaanJoined=true;}P.Companion.init(s);
   P.Comic.clearRunDialogue();window.sceneSamples=[];window.sceneEvents=[];
   const drain=P.drainEvents;P.drainEvents=function(s){const es=drain(s);for(const e of es)if(['bossDie','win','chestOpened'].includes(e.type))sceneEvents.push({t:s.runT,...e});return es};
   window.sceneObserve=setInterval(()=>{const a=P.SceneFlow.current(),k=s.companion;sceneSamples.push({wall:Date.now()/1000,t:s.runT,hp:s.hero.hp,scene:a?.id,presentation:a?.t,world:P.SceneFlow.presentingWorld(),page:!!document.querySelector('.cm-page'),hero:{x:s.hero.x,y:s.hero.y,walkable:P.WalkPath.valid(s,s.hero,P.CFG.hero.radius)},friend:k?{x:k.x,y:k.y,joined:k.joined,walkable:P.WalkPath.valid(s,k,P.CFG.experience.people.radius)}:null,music:P.Music.audibleTracks(),state:P.debug.state})},125);
   if(${skip}){P.Settings.reduceMotion=true;P.Settings.reduceFlash=true;P.Settings.textSize=150;P.Settings.musicVol=0;P.Settings.sfxVol=0;P.applySettings();}
  })()`);
  await b.until(()=>b.evaluate('P.SceneFlow.current()?.kind==="entry"'),'real boss entry');await b.until(()=>b.evaluate('!P.SceneFlow.current()'),'entry finish');
  const prior=await b.evaluate('({save:P.Meta.state(),t:P.debug.sim.runT,hp:P.debug.sim.hero.hp})');let interruption;
  const film=await recordDOM(b,path.join(out,id+'.mp4'),async()=>{
   await b.evaluate("(()=>{const s=P.debug.sim,e=s.gen.boss;P.Combat.damageEnemy(s,e,e.hp*30,1,0,0,false,'knife')})()");
   await b.until(()=>b.evaluate('P.SceneFlow.current()&&P.SceneFlow.current().kind!=="entry"'),'true defeat aftermath');
   // Supplied recent-hit appearance state tests opacity without changing combat rules.
   await b.evaluate('P.debug.sim.hero.invuln=.48;P.debug.sim.hero.flash=.06');
   await b.sleep(450);await b.shot(path.join(out,id+'-world.png'));
   interruption=process.env.AUDIT9_SCENE_NO_BACKGROUND?{performed:false,reason:'Uninterrupted visual/audio recapture; the separate five background cases remain.'}:await background(b);
   if(skip){const p=await b.evaluate('(()=>{const r=document.querySelector(".scene-skip").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await b.sleep(800);await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});}
   const end=Date.now()+150000;let next=0;
   while(Date.now()<end&&await b.evaluate('!!P.SceneFlow.current()')){
    if(await b.evaluate('!!document.querySelector(".cm-page")')&&Date.now()>next){await key(b,'Enter','Enter',13);next=Date.now()+1300;}
    await tap(b,'.scene-resume button',true);await b.sleep(150);
   }
   assert(!await b.evaluate('!!P.SceneFlow.current()'),'Story did not release control');assert(!await b.evaluate('!!document.querySelector(".cm-page")'));
   const control=await b.evaluate('({enabled:P.Input.enabled,joined:P.debug.sim.companion.joined,t:P.debug.sim.runT})');assert(control.enabled&&control.joined);
   await b.shot(path.join(out,id+'-control.png'));
   const depart=Date.now()+60000;let held=false;
   while(Date.now()<depart&&await b.evaluate('P.debug.state!=="results"')){
    const q=await b.evaluate('(()=>{const s=P.debug.sim,h=s.hero,goal={x:0,y:s.geo.exitY+1.1},route=P.WalkPath.find(s,h,goal,P.CFG.hero.radius),p=route?.[0]||goal,x=p.x-h.x,y=p.y-h.y,m=Math.hypot(x,y)||1;return{x:x/m,y:y/m,state:P.debug.state}})()');
    if(q.state==='chest'||q.state==='cards'){
     if(held){await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:60,y:650,button:'left',clickCount:1});held=false;}
     if(q.state==='chest'){await tap(b,'#chest-choices .mod-opt',true);await tap(b,'#btn-chest-continue',true);}
     else await tap(b,'#cards button.card,#cards .card .mod-opt');continue;
    }
    if(!held){await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x:60,y:650,button:'left',clickCount:1});held=true;}
    await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:60+q.x*31,y:650-q.y*31,buttons:1,button:'left'});await b.sleep(100);
   }
   await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:60,y:650,button:'left',clickCount:1});
   const exit=await b.evaluate('({state:P.debug.state,mode:P.debug.sim.mode,hero:{x:P.debug.sim.hero.x,y:P.debug.sim.hero.y},exitY:P.debug.sim.geo.exitY,open:P.debug.sim.props.shutterOpen,input:P.Input.vec,enabled:P.Input.enabled})');
   fs.writeFileSync(path.join(out,id+'-exit-state.json'),JSON.stringify(exit,null,2)+'\n');
   assert.equal(exit.state,'results','Playable departure did not reach the actual result');await b.shot(path.join(out,id+'-result.png'));await b.sleep(600);return control;
  });
  const facts=await b.evaluate('({samples:sceneSamples,events:sceneEvents,save:P.Meta.state(),mode:P.debug.sim.mode,t:P.debug.sim.runT})');
  const protectedSamples=facts.samples.filter(s=>s.scene&&s.world);assert(protectedSamples.length>3);assert(protectedSamples.every(s=>s.hero.walkable&&s.friend?.walkable),'Protected actor crossed a solid');
  const earned=facts.save.settledRuns||[];assert.equal(new Set(earned.map(r=>r.runId)).size,earned.length,'Duplicate result settlement');assert.equal(earned.length,1,'Exactly one result expected from this fixture');
  fs.writeFileSync(path.join(out,id+'-viewport-diagnostics.json'),JSON.stringify(await b.evaluate('viewportDiagnostics'),null,2)+'\n');
  assert.equal(b.errors.length,0,b.errors.join('\n'));
  rows.push({id,level,lang,skip,sourceManifest:manifest.runtime_manifest_sha256,fixture:true,supplied:'Direct level entry, supplied quiet arena/invulnerability/no XP, joined precondition for L25/30, actual lethal hit and supplied recent-hit appearance. Actual native page controls, '+(process.env.AUDIT9_SCENE_NO_BACKGROUND?'uninterrupted recapture':'desktop tab interruption')+', ordinary pointer departure and real result. Not an earned campaign or human/phone check.',prior,interruption,...film,facts,errors:b.errors});
  fs.writeFileSync(path.join(out,'index.json'),JSON.stringify(rows,null,2)+'\n');console.log('PASS',id);
 }finally{await b.close();}}
(async()=>{for(const [level,lang,skip]of(process.env.AUDIT9_SCENE_CASES?process.env.AUDIT9_SCENE_CASES.split(',').map(v=>{const q=v.split(':');return[+q[0],q[1],q[2]==='1']}):[[20,'en',false],[20,'tr',true],[25,'tr',false],[25,'en',true],[30,'en',false],[30,'tr',true]]))await run(level,lang,skip)})().catch(e=>{console.error(e);process.exitCode=1});
