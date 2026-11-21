// Rendered, earned journey through actual CDP mouse/key controls. Automated movement assist is explicitly disclosed.
// No sim stepping, Input replacement, debug grants, unlock supply, injected outcome or save import.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8790',through=+(process.env.AUDIT9_THROUGH||30);
const out=path.resolve(process.env.AUDIT9_WALK_OUT||'reviews/media/R1/audit9-implementation/walkthrough');fs.mkdirSync(out,{recursive:true});
const build=JSON.parse(fs.readFileSync(process.env.AUDIT9_MANIFEST||'reviews/telemetry/audit9-implementation/integrated1.json'));
const bot=fs.readFileSync(path.join(__dirname,'bot.js'),'utf8'),helpers=fs.readFileSync(path.join(__dirname,'lib-bot-play.js'),'utf8').split('module.exports')[0];
const nav=bot.slice(bot.indexOf('function unit('),bot.indexOf('// Diagnostics for a timed-out run'));
const l1=bot.slice(bot.indexOf('function botInput('),bot.indexOf('function runL1('));
const resume=!!process.env.AUDIT9_RESUME,old=resume?JSON.parse(fs.readFileSync(path.join(out,'index.json'))):null;
const records=old?.records||[],actions=old?.actions||[];let held=false,lastMove=null,intentionalFailure=resume;
let interrupted=actions.some(a=>a.kind==='desktop-tab-interruption'),replayed=actions.some(a=>a.selector==='.memory-back');
function saveIndex(){fs.writeFileSync(path.join(out,'index.json'),JSON.stringify({sourceManifest:build.runtime_manifest_sha256,
 method:'Agent-supervised rendered journey; automated navigation reads diagnostic world state and sends normal pointer/keyboard events through the ordinary handlers (frame-cadence DOM generation when enabled), with CDP menu gestures. Actual visible card/mod/chest/menu controls, fresh profile, earned persistent state. This is assisted browser verification, not an uncoached human run, physical phone or headless campaign.',records,actions},null,2)+'\n');}
async function key(b,key,code,num){await b.send('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:num});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:num});}
async function release(b){if(held)await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:60,y:650,button:'left',clickCount:1});held=false;lastMove=null;}
async function tap(b,selector,optional=false){
 const p=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled||!e.getClientRects().length)return null;return true})()`);
 if(!p){if(optional)return false;throw Error('Unavailable player control: '+selector);}
 for(let i=0;i<4;i++){
  const s=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();let a=e.parentElement;
   while(a&&(!/auto|scroll/.test(getComputedStyle(a).overflowY)||a.scrollHeight<=a.clientHeight))a=a.parentElement;
   if(!a)return null;const b=a.getBoundingClientRect(),lo=Math.max(20,b.top+90),hi=Math.min(824,b.bottom-30),cy=r.y+r.height/2;
   return cy<lo||cy>hi?{x:Math.max(30,Math.min(360,b.x+b.width/2)),y:Math.max(60,Math.min(780,(lo+hi)/2)),delta:cy-(lo+hi)/2}:null;})()`);
  if(!s)break;
  await b.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:s.x,y:s.y,deltaX:0,deltaY:s.delta});await b.sleep(150);
 }
 await b.sleep(80);
 const q=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);return{x,y,hit:e===h||e.contains(h),text:e.innerText}})()`);
 if(!q.hit){if(optional)return false;await b.shot(path.join(out,'blocked-control-'+Date.now()+'.png'));throw Error('Obscured player control: '+selector);}
 await release(b);await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x:q.x,y:q.y,button:'left',clickCount:1});
 await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:q.x,y:q.y,button:'left',clickCount:1});
 actions.push({at:new Date().toISOString(),selector,text:q.text});return true;
}
async function install(b){
 await b.evaluate(`(()=>{const args={punish:true,help:true,street:false,choice:'left'},DT=1/60,DROP_KINDS=['xp','chest','simit','jeton'],HACK_REACH=7,POLICY='kite',PATH=[[-5,-1.5],[-5,2],[0,60],[-4,140],[-4,165],[-1,192],[1.5,206]];
 ${nav}\n${l1}\n${helpers}
 let run=null,st,moveTime=null,moveCache=null;window.walkEvents=[];window.walkSamples=[];window.actualOffer=null;
 window.walkMove=function(){const s=P.debug.sim;if(!s)return{x:0,y:0};if(run!==s){run=s;moveTime=null;moveCache=null;st={wp:0,ang:0,best:s.hero.y,bestT:0,push:0,side:1,skip:new Set(),dropT:0,dropId:null,threat:Infinity};}
 if(moveTime===s.runT&&moveCache)return moveCache;moveTime=s.runT;
 const light=s.milestone?.lights,next=light?.on&&!s.milestone.open&&light.steps[light.passed];
 // Cross a movement threshold rather than apply the generic hold-near-target
 // policy. Only the ordinary pointer/key controller receives this vector.
 const move=next?unit(next.x-s.hero.x,next.y+.65-s.hero.y):s.levelIndex===1?botInput(s,st):genInput(s,st);
 moveCache=useActiveSkills(P,s,move,unit);return moveCache;};
 const drain=P.drainEvents;P.drainEvents=function(s){const es=drain(s);for(const e of es)if(!['footstep','xp'].includes(e.type))walkEvents.push({t:s.runT,...e});return es;};
 const cards=P.Screens.showCards;P.Screens.showCards=function(s,offer){actualOffer=offer;return cards.apply(this,arguments);};
 window.walkObserver=setInterval(()=>{const s=P.debug.sim;if(!s)return;const k=s.companion,a=P.SceneFlow.current();walkSamples.push({wall:Date.now()/1000,t:s.runT,state:P.debug.state,hp:s.hero.hp,x:s.hero.x,y:s.hero.y,
 scene:a?.id,sceneTime:a?.t,world:P.SceneFlow.presentingWorld(),companion:k?{x:k.x,y:k.y,joined:k.joined,moving:k.moving,walkable:P.WalkPath.valid(s,k,P.CFG.experience.people.radius)}:null,
 heroWalkable:P.WalkPath.valid(s,s.hero,P.CFG.hero.radius),music:P.Music.audibleTracks()});},500);
 })()`);
 if(process.env.AUDIT9_FRAME_INPUT){const src=fs.readFileSync(path.join(__dirname,'enable-audit9-rendered-input.cjs'),'utf8').match(/const source=`([\s\S]*?)`;/)[1];fs.writeFileSync(path.join(out,'input-controller.js'),src);await b.evaluate(src);}
}
async function steer(b,move){
 const m=Math.hypot(move.x,move.y),x=move.x/Math.max(1,m),y=move.y/Math.max(1,m);
 if(!held){await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x:60,y:650,button:'left',clickCount:1});held=true;}
 const p=1;
 const sx=60+x*31*p,sy=650-y*31*p;
 await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:sx,y:sy,button:'left',buttons:1});lastMove={x,y};
 if(move.dash)await key(b,' ','Space',32);if(move.skill)await key(b,'e','KeyE',69);if(move.ult)await key(b,'q','KeyQ',81);
}
function focus(level){return level===4?'nailgun':level<6?'knife':level<11?'nailgun':level<16?'canister':level<21?'speargun':level<26?'molotov':'sawblade';}
async function choose(b,level){
 const wanted=focus(level),q=await b.evaluate(`(()=>{const s=P.debug.sim,c=actualOffer?.cards||[],plan=P.Progression.buildState(s),wanted=${JSON.stringify(wanted)};
 const firstUnsafe=${level===1}&&window.walkUnsafeBuild;
 const starterOnly=Object.keys(s.hero.weapons).length<2;
 const complementary=x=>${!!process.env.AUDIT12_BALANCED_STARTERS}&&starterOnly&&s.hero.weapons.canister&&x.id.startsWith('w:')&&!s.hero.weapons[x.item];
 const score=x=>firstUnsafe?(x.id.startsWith('p:')?100:0):x.item==='medkit'&&s.hero.hp/s.hero.maxHp<.4?115:complementary(x)?110:x.evo?100:x.item===wanted?90:plan?.weapon===wanted&&x.item===plan.passive?85:x.item===plan?.weapon&&s.recipeFocus===plan?.weapon?60:x.id.startsWith('w:')?(starterOnly&&!s.hero.weapons[x.item]?50:40)+(x.next||1):0;
 const order=c.map((x,i)=>({i,n:score(x)})).sort((a,b)=>b.n-a.n);return{locked:document.getElementById('cards').dataset.locked,index:order[0]?.i,
 needsPlan:!!s.hero.weapons[wanted]&&s.recipeFocus!==wanted&&!s.hero.evolved?.[wanted],wanted};})()`);
 if(q.locked)return;
 if(q.needsPlan){
  if(!await b.evaluate('document.getElementById("cards-plan")?.open'))await tap(b,'#cards-plan summary',true);
  if(await tap(b,'#cards-plan [data-build-plan='+JSON.stringify(wanted)+']',true))return;
 }
 if(q.index===undefined)throw Error('No actual upgrade choices');
 const selector='#cards > .card:nth-child('+(q.index+1)+')';
 const fork=await b.evaluate('!!document.querySelector('+JSON.stringify(selector+' .mod-opt')+')');
 if(!await tap(b,selector+(fork?' .mod-opt':''),true)){
  if(!await tap(b,'#btn-ci-close',true))await b.shot(path.join(out,'choice-wait-'+level+'.png'));
 }
}
async function background(b){
 await release(b);const target=(await b.send('Target.getTargetInfo')).targetInfo.targetId;
 const other=(await b.send('Target.createTarget',{url:'about:blank'})).targetId;
 const before=await b.evaluate('({state:P.debug.state,t:P.debug.sim.runT,hp:P.debug.sim.hero.hp})');
 await b.send('Target.activateTarget',{targetId:other});await b.sleep(2200);await b.send('Target.activateTarget',{targetId:target});await b.send('Target.closeTarget',{targetId:other});await b.sleep(300);
 const after=await b.evaluate('({state:P.debug.state,t:P.debug.sim.runT,hp:P.debug.sim.hero.hp,hidden:document.hidden})');
 actions.push({kind:'desktop-tab-interruption',before,after});await b.shot(path.join(out,'interruption-return.png'));
 if(after.state==='paused')await tap(b,'#btn-resume');
 await tap(b,'.scene-resume button',true);
}
async function play(b,level,attempt){
 const id='L'+String(level).padStart(2,'0')+'-attempt'+attempt;
 await b.evaluate('walkEvents.length=0;walkSamples.length=0;window.walkForceBoss=false;window.walkUnsafeBuild='+(level===1&&attempt===0)+'');
 const saveBefore=await b.evaluate('P.Meta.state()');let lastState='',entered=0,lastTurn=0,lastShot=-1,cardAt=0;
 const media=await recordDOM(b,path.join(out,id+'.mp4'),async()=>{
  const deadline=Date.now()+900000;
  while(Date.now()<deadline){
   if(b.errors.length)throw Error(b.errors.join('\n'));
   const q=await b.evaluate('(()=>{const s=P.debug.sim,a=P.SceneFlow.current();return{state:P.debug.state,level:s?.levelIndex,t:s?.runT,y:s?.hero.y,page:!!document.querySelector(".cm-page"),world:P.SceneFlow.presentingWorld(),protected:!!a,boss:s?.dir.trialBoss||s?.gen?.boss,milestone:s?.milestone?{open:s.milestone.open,y:s.milestone.y}:null}})()');
   fs.writeFileSync(path.join(out,'live-status.json'),JSON.stringify({id,at:Date.now(),...q}));
   if(await tap(b,'.scene-resume:not([hidden]) button',true))continue;
   if(q.state!==lastState){lastState=q.state;entered=Date.now();await release(b);await b.shot(path.join(out,id+'-'+q.state+'.png'));}
   if(q.state==='results'){await b.sleep(1400);return 'results';}
   if(q.state==='down'){await b.sleep(1800);await tap(b,'#btn-giveup');continue;}
   if(q.state==='title'){await tap(b,'#btn-start');continue;}
   if(q.state==='map'){await tap(b,'.meta-next .meta-play');continue;}
   if(q.state==='cards'){if(Date.now()-entered>1600&&Date.now()-cardAt>600){await choose(b,level);cardAt=Date.now();}await b.sleep(180);continue;}
   if(q.state==='chest'){await release(b);if(Date.now()-entered>1600){await tap(b,'#chest-choices .mod-opt',true);await tap(b,'#btn-chest-continue',true);}await b.sleep(200);continue;}
   if(q.state==='paused'){await tap(b,'#btn-resume');continue;}
   if(q.page&&!q.world){await release(b);if(Date.now()-lastTurn>5500){await key(b,'Enter','Enter',13);lastTurn=Date.now();}await b.sleep(150);continue;}
   if(q.protected){await release(b);await b.sleep(150);continue;}
   if(q.state==='play'){
    if(level===2&&!interrupted&&q.t>12){interrupted=true;await background(b);continue;}
    let move=await b.evaluate('walkMove()');
    if(level===1&&attempt===0&&q.boss&&q.y>175){
     intentionalFailure=true;if(process.env.AUDIT9_FRAME_INPUT)await b.evaluate('window.walkForceBoss=true');move=await b.evaluate('(()=>{const s=P.debug.sim,e=s.dir.trialBoss||s.gen?.boss||s.enemies.find(e=>!e.dead&&e.state==="active");if(!e)return{x:0,y:0};const dx=e.x-s.hero.x,dy=e.y-s.hero.y,d=Math.hypot(dx,dy);return d<.45?{x:0,y:0}:{x:dx/d,y:dy/d}})()');
    }
    if(!process.env.AUDIT9_FRAME_INPUT)await steer(b,move);
    const bucket=Math.floor(q.y/12);if(bucket!==lastShot){lastShot=bucket;await b.shot(path.join(out,id+'-route-'+bucket+'.png'));}
   }
   await b.sleep(100);
  }
  return 'wall-timeout';
 });
 await release(b);
 const facts=await b.evaluate('({state:P.debug.state,level:P.debug.sim.levelIndex,mode:P.debug.sim.mode,t:P.debug.sim.runT,hp:P.debug.sim.hero.hp,deathCause:P.debug.sim.deathCause,weapons:P.debug.sim.hero.weapons,mods:P.debug.sim.hero.mods,choice:P.debug.sim.localChoice,kaanRepay:P.debug.sim.kaanRepay,evolutionUse:P.debug.sim.evolutionUse,events:walkEvents,samples:walkSamples,save:P.Meta.state(),pending:P.Meta.pendingResult()})');
 const row={id,level,attempt,sourceManifest:build.runtime_manifest_sha256,...media,saveBefore,plannedFailure:level===1&&attempt===0&&intentionalFailure,assists:'Automated diagnostic navigation through normal pointer/key event handlers: frame-cadence mode dispatches synthetic DOM events; other navigation and visible upgrade/mod/chest choices use CDP. No grants, stepping, forced outcomes, save import or supplied/prototype revives. Ordinary automatic first-run Second Wind, if used, remains in actual events. This is earned automated play, not a human or phone test.',inputPolicy:{frameCadence:!!process.env.AUDIT9_FRAME_INPUT,L4Plan:'nailgun when actually offered',complementaryStarter:!!process.env.AUDIT12_BALANCED_STARTERS,companionPool:'Any actually offered unowned base weapon; prior10 driver preferred six faster families only.',noPowerOrSaveSupply:true},facts,errors:b.errors.slice()};
 fs.writeFileSync(path.join(out,id+'.json'),JSON.stringify(row,null,2)+'\n');records.push({id,level,attempt,file:id+'.mp4',outcome:facts.mode,seconds:media.seconds,simSeconds:facts.t,plannedFailure:row.plannedFailure,errors:row.errors});saveIndex();
 console.log(id,facts.mode,Math.round(facts.t)+' sim seconds');assert.equal(b.errors.length,0,b.errors.join('\n'));
 return facts.mode==='won';
}
async function earnedGear(b,level){
 await tap(b,'.meta-top button.meta-iconbtn',true);await b.sleep(250);
 const slot=await b.evaluate(`(()=>{const M=P.Meta,order=['gloves','sneakers','charm','hoodie'];return order.map(id=>({id,level:M.itemLevel(M.equippedIn(id))})).sort((a,b)=>a.level-b.level||order.indexOf(a.id)-order.indexOf(b.id))[0].id})()`);
 await tap(b,'.meta-gear:not(.meta-hidden) [data-slot='+JSON.stringify(slot)+']',true);
 await b.sleep(180);await tap(b,'.meta-gear:not(.meta-hidden) .meta-gd-act:not(:disabled):not(.is-need)',true);
 await b.shot(path.join(out,'L'+level+'-earned-gear.png'));await tap(b,'.meta-gear:not(.meta-hidden) .meta-iconbtn',true);await b.sleep(450);
}
async function inspectEarnedArsenal(b,level){
 await tap(b,'[data-tab=ars]');await b.sleep(350);await b.shot(path.join(out,'earned-skill-hierarchy.png'));
 for(let group=0;group<2;group++){
  const selection=await b.evaluate(`(()=>{const g=document.querySelectorAll('.meta-arsenal .meta-ars-ults')[${group}],on=g.querySelector('.is-on'),alt=Array.from(g.querySelectorAll('button')).find(e=>!e.disabled&&!e.classList.contains('is-on')&&!e.classList.contains('is-locked'));if(!on||!alt)return null;alt.setAttribute('data-audit-skill','alternative');return{original:on.querySelector('.meta-ars-name').textContent,alternative:alt.querySelector('.meta-ars-name').textContent}})()`);
  if(!selection)continue;
  await tap(b,'[data-audit-skill=alternative]');await b.sleep(200);await b.shot(path.join(out,'earned-skill-'+group+'-alternative.png'));
  await b.evaluate(`(()=>{const g=document.querySelectorAll('.meta-arsenal .meta-ars-ults')[${group}],e=Array.from(g.querySelectorAll('button')).find(e=>e.querySelector('.meta-ars-name').textContent===${JSON.stringify(selection.original)});e.setAttribute('data-audit-skill','restore');})()`);
  await tap(b,'[data-audit-skill=restore]');actions.push({kind:'earned-skill-equip-and-restore',group,...selection});
 }
 await tap(b,'.meta-ars-collection summary');await b.sleep(300);await tap(b,'.meta-ars-card');await b.shot(path.join(out,'earned-next-mastery.png'));
 await tap(b,'.meta-arsenal:not(.meta-hidden) .meta-iconbtn');await b.sleep(400);
 actions.push({kind:'earned-arsenal-inspection',level});
}
async function growthBody(b,level){
 await tap(b,'#btn-res-growth',true);await b.sleep(550);
 if(await b.evaluate('P.debug.state!=="map"'))await tap(b,'#btn-to-title');await b.sleep(800);
 if(await b.evaluate('document.querySelector(".meta-attr")?.classList.contains("meta-hidden")'))await tap(b,'.meta-prep',true);
 await b.sleep(250);
 for(let i=0;i<24;i++)if(!await tap(b,'.meta-attr:not(.meta-hidden) .growth-apply',true))break;
 const alreadyTree=await b.evaluate('!!document.querySelector(".meta-tree:not(.meta-hidden)")');
 if(alreadyTree||await tap(b,'.meta-attr:not(.meta-hidden) .growth-nav button:nth-child(2)',true)){
  for(let i=0;i<20;i++){
   if(!await tap(b,'.meta-tree:not(.meta-hidden) .meta-tree-node.is-available',true))break;
   if(!await tap(b,'.meta-tree:not(.meta-hidden) .meta-tree-learn:not(:disabled)',true))break;
  }
  await tap(b,'.meta-tree:not(.meta-hidden) .meta-iconbtn');
 }else await tap(b,'.meta-attr:not(.meta-hidden) .meta-iconbtn');
 await b.sleep(600);
 await earnedGear(b,level);
 if(process.env.AUDIT12_STARTERS&&[5,10].includes(level)){
  await tap(b,'[data-tab=ars]');await b.sleep(350);
  const id=level===5?'nailgun':'canister',n=level===5?2:3;
  await tap(b,'.a12-starters .a12-starter:nth-of-type('+n+')');await b.sleep(2200);
  await tap(b,'.a12-starters > .meta-btn:not(.secondary)');
  assert.equal(await b.evaluate('P.Meta.starter()'),id,'Actual earned starter selection must persist');
  await b.shot(path.join(out,'earned-starter-'+id+'.png'));await tap(b,'.meta-arsenal:not(.meta-hidden) .meta-iconbtn');
  actions.push({kind:'earned-starter-selected',level,id,method:'Actual visible selector, real preview and Save controls after earned district unlock. No grant or save import.'});
 }
 if((level===1&&!replayed||level>=13&&!actions.some(a=>a.kind==='earned-memory-film'))&&await b.evaluate('Object.keys(P.Meta.state().collection).some(k=>k.startsWith("page:"))')){
  await tap(b,'[data-tab=coll]');await tap(b,'.meta-coll-item.is-on');await b.sleep(1500);
  await b.shot(path.join(out,'earned-memory-L'+level+'-visit'+records.length+'.png'));const before=await b.evaluate('JSON.stringify(P.Meta.state())');
  await tap(b,'.memory-back');assert.equal(await b.evaluate('JSON.stringify(P.Meta.state())'),before);
  await tap(b,'.meta-hub .meta-iconbtn');replayed=true;actions.push({kind:'earned-memory-film',level});
 }
 if(level>=13&&!actions.some(a=>a.kind==='earned-arsenal-inspection'))await inspectEarnedArsenal(b,level);
 await b.shot(path.join(out,'L'+level+'-return-map.png'));
}
async function growth(b,level){
 const id='growth-L'+level+'-'+Date.now(),before=await b.evaluate('P.Meta.state()');
 // Menu-only returns draw in the DOM; the suspended gameplay canvas emits no
 // frames. Keep full viewport/audio evidence without claiming native motion.
 const film=await recordDOM(b,path.join(out,id+'.mp4'),async()=>{await growthBody(b,level);return{state:await b.evaluate('P.debug.state')};},{nativeCanvas:false});
 const after=await b.evaluate('P.Meta.state()');assert.deepEqual(after.stars,before.stars,'Growth cannot add another clear');assert.deepEqual(after.settledRuns,before.settledRuns,'Menu return cannot settle the run twice');
 const row={id,level,file:id+'.mp4',sourceManifest:build.runtime_manifest_sha256,fixture:false,method:'Actual earned map/attribute/perk/gear/skill/archive controls; no grants or imported save. Early1–12 growth uses retained actions/stills; later returns have these full-viewport films.',before,after,...film};
 fs.writeFileSync(path.join(out,id+'.json'),JSON.stringify(row,null,2)+'\n');actions.push({kind:'earned-growth-film',id,level,file:row.file});saveIndex();
}
async function replayEarned(b,level,alternate=false){
 const hood=Math.floor((level-1)/5),district='.meta-hood[data-h="'+hood+'"]';
 // First map tap may finish the existing return animation and recenter its
 // camera. Observe that normal Skip outcome, refocus, then click again.
 await tap(b,'.meta-banner.is-in .meta-ban-card',true);await b.sleep(300);
 let opened=false;
 for(let pass=0;pass<2&&!opened;pass++){
  await b.evaluate('P.Meta.Map.focusHood('+hood+',.2,false)');
  await b.until(()=>b.evaluate('(()=>{const e=document.querySelector('+JSON.stringify(district)+'),r=e.getBoundingClientRect(),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e===h||e.contains(h)})()'),'actual replay district target',10000);
  await tap(b,district);await b.sleep(400);
  opened=await b.evaluate('!!document.querySelector('+JSON.stringify('.meta-sheet.is-open [data-lv="'+level+'"]')+')');
 }
 assert(opened,'Actual replay sheet must be open after normal return Skip/refocus');
 await tap(b,'[data-lv="'+level+'"]');if(alternate)await tap(b,'[data-variant=alternate]');await tap(b,'.meta-sheet.is-open .meta-play');
 actions.push({kind:'actual-earned-replay',level,method:'Actual map/district/level/play mouse controls; only map camera positioned through public view focus; no save/power/outcome supply.'});
}
(async()=>{
 const b=await openBrowser(origin+'/?seed=42&lang=en',resume?{profileDir:process.env.AUDIT9_PROFILE}:{});fs.writeFileSync(path.join(out,'profile.json'),JSON.stringify({dir:b.dir,url:origin+'/?seed=42&lang=en'}));try{
  await b.until(()=>b.evaluate("P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'fresh title');
  if(!resume){assert.equal(await b.evaluate('P.Meta.unlockedLevel()'),1);assert.equal(await b.evaluate('Object.keys(P.Meta.state().stars).length'),0);}
  await install(b);
  const earnedUnlocked=resume?await b.evaluate('P.Meta.unlockedLevel()'):1;
  const first=resume&&process.env.AUDIT9_REPLAY_FROM?+process.env.AUDIT9_REPLAY_FROM:earnedUnlocked;
  assert(first>=1&&first<=earnedUnlocked,'A resumed replay must already be earned');
  if(resume){await tap(b,'#btn-start');await b.sleep(700);if(await b.evaluate('P.debug.state==="map"'))await growth(b,first);actions.push({kind:'resume-earned-profile',level:first,source:build.runtime_manifest_sha256,policy:'Retain actual earned state and spend only available resources through ordinary menus. No imported save.'});}
  for(let level=first;level<=through;level++){
   let won=false;
   const offset=records.filter(r=>r.level===level).length;
   for(let trial=0;trial<8&&!won;trial++){
    const attempt=offset+trial;
    if(trial>0)await growth(b,level);
    if(level>1||trial>0){
     if(resume&&level<earnedUnlocked)await replayEarned(b,level);
     else await tap(b,'.meta-next .meta-play');
    }
    won=await play(b,level,attempt);
   }
   if(!won)throw Error('Rendered journey blocked at L'+level+' after six actual attempts');
   await growth(b,level);saveIndex();
  }
  if(process.env.AUDIT12_REMATCHES)for(const level of [5,15,25]){
   let won=false;for(let trial=0;trial<3&&!won;trial++){
    await replayEarned(b,level,true);won=await play(b,level,records.filter(r=>r.level===level).length);
    await growth(b,level);
   }
   actions.push({kind:'earned-tactical-rematch',level,won});saveIndex();if(!won)throw Error('Tactical rematch remained uncleared L'+level);
  }
  fs.writeFileSync(path.join(out,'earned-save-final.json'),JSON.stringify(await b.evaluate('P.Meta.state()'),null,2)+'\n');
 }finally{await release(b).catch(()=>{});saveIndex();await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
