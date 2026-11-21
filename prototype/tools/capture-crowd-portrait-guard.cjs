// Ordinary L1 preview: real seeded crowd and real booster interruption, no debug power or supplied actors.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const out=path.resolve('reviews/media/R1/crowd-portrait-guard-2026-11-18'),origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8775';
const build=JSON.parse(fs.readFileSync('reviews/telemetry/crowd-portrait-guard-2026-11-18/build.json','utf8'));
const bot=fs.readFileSync(path.join(__dirname,'bot.js'),'utf8'),navigation=bot.slice(bot.indexOf('function botInput('),bot.indexOf('function runL1('));
const index=[];
async function capture(b,id,action){
 const result=await recordDOM(b,path.join(out,id+'.mp4'),action);
 const facts=await b.evaluate('({t:P.debug.sim.runT,hp:P.debug.sim.hero.hp,secondWind:P.debug.sim.secondWindUsed,state:P.debug.state,portraits:portraitLog,crowd:crowdLog})');
 await b.shot(path.join(out,id+'.png'));
 index.push({id,file:id+'.mp4',still:id+'.png',sourceManifest:build.runtime_manifest_sha256,platform:'Desktop Chrome 390×844 DPR1, normal speed and real post-master audio; seed42; TR',
  origin:'Fresh ordinary L1; current sim-spawned civilians and normal booster/call. Automated navigation/card selection; no granted HP/ranks, supplied actors or sim time scaling.',...result,facts});
 fs.writeFileSync(path.join(out,'index.json'),JSON.stringify(index,null,2)+'\n');
 if(b.errors.length)throw Error(b.errors.join('\n'));console.log(id,result.outcome);
}
async function main(){
 const b=await openBrowser(origin+'/?level=1&seed=42&lang=tr&skipintro=1');
 try{
  await b.until(()=>b.evaluate("P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'title');
  await b.evaluate(`window.portraitLog=[];const originalBust=P.ComicRaster.bust;P.ComicRaster.bust=function(c,who,mood){portraitLog.push({who,actor:P.ComicRaster.actorId(who),t:P.debug.sim?.runT,boosting:!!P.debug.sim?.dir.call.boosting,line:P.debug.sim?.dir.call.sub?.id});return originalBust.apply(this,arguments);};document.getElementById('btn-start').click()`,true);
  await b.until(()=>b.evaluate("P.debug.state==='play'"),'play');
  await b.evaluate(`(()=>{const PATH=[[-5,-1.5],[-5,2],[0,60],[-4,140],[-4,165],[-1,192],[1.5,206]],POLICY='kite',HACK_REACH=7;
   ${navigation}
   const s=P.debug.sim,st={wp:0,ang:0};window.autoInput=()=>botInput(s,st);P.Input.get=autoInput;
   window.cards=setInterval(()=>{if(P.debug.state==='cards'){const card=document.querySelector('#cards .card:not(.is-disabled)');if(card)(card.querySelector('.mod-opt')||card).click();}},250);
   window.crowdLog=[];window.crowdTimer=setInterval(()=>{if(P.debug.state!=='play')return;const a=s.dir.civilians;a.forEach((v,i)=>a.slice(i+1).forEach(w=>{if(Math.abs(v.x-w.x)<2.7&&Math.abs(v.y-w.y)<1.7)crowdLog.push({a:P.CivilianActing.look(v),b:P.CivilianActing.look(w)});}));},100);
  })()`);
  await b.until(()=>b.evaluate('P.debug.sim.dir.civilians.length>0'),'natural crowd');
  await capture(b,'mixed-neighbor-crowd',async()=>{await b.sleep(1700);await b.shot(path.join(out,'mixed-neighbor-crowd-active.png'));await b.sleep(5000);const stats=await b.evaluate('({pairs:crowdLog.length,repeats:crowdLog.filter(p=>p.a===p.b).length})');assert(stats.pairs>0);assert.equal(stats.repeats,0);return stats;});
  await b.until(()=>b.evaluate('!!P.debug.sim.dir.call.boosting||P.debug.state===\'down\''),'real booster interruption',100000);
  assert(await b.evaluate('P.debug.sim.dir.call.boosting'),'Did not reach real booster');
  await b.evaluate('P.Input.get=()=>({x:0,y:0})');
  await capture(b,'signal-booster-correct-portraits',async()=>{
   await b.sleep(300);await b.shot(path.join(out,'signal-booster-interrupted-call.png'));
   await b.until(()=>b.evaluate('!P.debug.sim.dir.call.boosting||P.debug.state===\'down\''),'booster restored',50000);
   assert.equal(await b.evaluate('P.debug.state'),'play');
   await b.evaluate('window.restoredAt=P.debug.sim.runT;P.Input.get=autoInput');
   await b.until(()=>b.evaluate("P.debug.state==='play'&&portraitLog.some(p=>p.t>=restoredAt&&!p.boosting&&p.actor==='arda'&&p.line&&P.Dialogue.get(p.line)?.spk==='spk.arda')"),'real Arda reply after restoring the call',30000);
   await b.sleep(250);await b.shot(path.join(out,'signal-booster-call-resumed.png'));
   const portraits=await b.evaluate('portraitLog');assert(portraits.some(p=>p.boosting&&p.actor==='anne'),'The interrupted caller must actually draw Mom');
   assert(portraits.every(p=>p.actor!=='stranger'),'The stranger must not impersonate either participant');
   return{interruptionActor:'anne',strangerDraws:portraits.filter(p=>p.actor==='stranger').length,observedActors:[...new Set(portraits.map(p=>p.actor))]};
  });
  await b.evaluate('clearInterval(cards);clearInterval(crowdTimer)');
 }finally{await b.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
