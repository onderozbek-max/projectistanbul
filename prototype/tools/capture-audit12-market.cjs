// Three actual-input market outcomes from one declared earned pre-L22 history. No state/outcome or power supply.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const out='reviews/media/R1/audit12-implementation/integrated9-market-retry1',manifest=JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/audit12-integrated9.json'));
fs.mkdirSync(out,{recursive:true});
const sample=JSON.parse(fs.readFileSync('reviews/telemetry/audit12-implementation/integrated9-market-case.json'))[0];
const bot=fs.readFileSync(path.join(__dirname,'bot.js'),'utf8'),helpers=fs.readFileSync(path.join(__dirname,'lib-bot-play.js'),'utf8').split('module.exports')[0];
const nav=bot.slice(bot.indexOf('function unit('),bot.indexOf('// Diagnostics for a timed-out run'));
const controller=fs.readFileSync(path.join(__dirname,'enable-audit9-rendered-input.cjs'),'utf8').match(/const source=`([\s\S]*?)`;/)[1];
const cardPolicy=fs.readFileSync(path.join(__dirname,'lib-reset-policy.cjs'),'utf8').split('module.exports')[0];
const rows=[];
(async()=>{for(const decision of ['left','right','neutral']){
 const b=await openBrowser('http://127.0.0.1:8847/?level=22&seed=42&skipintro=1&lang=en');try{
 await b.until(()=>b.evaluate('P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'ready');
 await b.evaluate(`Object.assign(P.Meta.state(),${JSON.stringify(sample.saveBefore)})`);
 await b.evaluate(`(()=>{const args={punish:true,help:true,street:true,choice:${JSON.stringify(decision)},'site-first':true,'site-early':true,'cart-flank':true},DT=1/60,DROP_KINDS=['xp','chest','simit','jeton'],HACK_REACH=7,POLICY='kite';
 ${nav}\n${helpers}
 let st=null,run=null;window.marketEvents=[];window.marketMaterial=[];window.actualOffer=null;window.stopStreetSample=false;
 window.walkMove=()=>{const s=P.debug.sim;if(!s||stopStreetSample)return{x:0,y:0};if(s!==run){run=s;st={wp:0,ang:0,best:s.hero.y,bestT:0,push:0,side:1,skip:new Set(),dropT:0,dropId:null,threat:Infinity};}const m=useActiveSkills(P,s,genInput(s,st),unit);delete m.dash;return m;};
 const damage=P.Combat.damageProp;P.Combat.damageProp=function(s,r,n,src){const before=r.hp,alive=r.alive,value=damage.apply(this,arguments);if(r.domino)marketMaterial.push({t:s.runT,src,before,after:r.hp,aliveBefore:alive,aliveAfter:r.alive,collisionRemoved:!s.geo.blocks.includes(r.b)});return value;};
 const drain=P.drainEvents;P.drainEvents=function(s){const es=drain(s);for(const e of es)if(['streetWeapon','routeBeat','heroHit','kill'].includes(e.type))marketEvents.push({t:s.runT,...e});return es;};
 const cards=P.Screens.showCards;P.Screens.showCards=function(s,offer){actualOffer=offer;return cards.apply(this,arguments);};
 window.marketFacts=()=>{const s=P.debug.sim,p=s?.streetSite,r=s?.dramaSpace?.domino;return{state:P.debug.state,t:s?.runT,hp:s?.hero.hp,choice:s?.localChoice,open:s?.milestone?.open,
 site:p?{used:p.used,alive:p.prop.alive,until:p.until,collision:s.geo.blocks.includes(p.prop.b)}:null,domino:r?{alive:r.alive,hp:r.hp,collision:s.geo.blocks.includes(r.b)}:null,events:marketEvents,material:marketMaterial};};})()`);
 await b.evaluate(`window.marketChoose=(function(){${cardPolicy};return(s,c)=>choose(P,s,c,'broad-mixed')})()`);
 await b.evaluate(controller);
 const media=await recordDOM(b,out+'/market-'+decision+'.mp4',async()=>{
  await b.evaluate('document.getElementById("btn-start").click()',true);let done=false;const end=Date.now()+260000;
  while(Date.now()<end){const q=await b.evaluate('marketFacts()');
   if(q.state==='dead'||q.state==='results')break;
   if(q.state==='cards')await b.evaluate(`(()=>{const s=P.debug.sim,c=actualOffer?.cards||[],pick=marketChoose(s,c),i=c.indexOf(pick),el=document.querySelector('#cards > .card:nth-child('+(i+1)+')');(el.querySelector('.mod-opt')||el).click();})()`,true);
   if(q.state==='chest')await b.evaluate('document.querySelector("#chest-choices .mod-opt")?.click();document.getElementById("btn-chest-continue")?.click()',true);
   if(await b.evaluate('!!document.querySelector(".cm-page")&&!P.SceneFlow.presentingWorld()'))await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13}).then(()=>b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13}));
   done=!!(decision==='left'?q.site?.used&&q.site.alive&&q.site.collision:decision==='right'?q.material.some(r=>r.src==='streetCart'&&r.aliveBefore&&!r.aliveAfter):q.open&&!q.choice);
   if(done){await b.shot(out+'/market-'+decision+'-consequence.png');await b.evaluate('window.stopStreetSample=true');await b.sleep(900);break;}
   await b.sleep(170);
  }
  return{done,facts:await b.evaluate('marketFacts()')};
 },{nativeCanvas:false});
 const row={decision,sourceManifest:manifest.runtime_manifest_sha256,origin:sample.origin,saveBefore:sample.saveBefore,
 method:'Real earned pre-L22 permanent history imported into a fresh disposable profile. Automatic attacks, real enemy pressure and HP remain. Frame-cadence synthetic DOM pointer navigation; ordinary visible card/chest controls. No stepping, Input.get replacement, debug ranks, invulnerability or supplied prop impact/outcome. Ordinary shield/ultimate buttons may be used; Dash intentionally not used while carrying. Real broad-mixed card policy. Not a fresh campaign, human or phone check.',...media,errors:b.errors};
 rows.push(row);fs.writeFileSync(out+'/index.json',JSON.stringify(rows,null,2)+'\n');console.log(decision,media.outcome.done,media.outcome.facts.choice);assert(media.outcome.done,'Actual outcome not demonstrated: '+decision);assert.equal(b.errors.length,0,b.errors.join('\n'));
 }finally{await b.close();}
}})().catch(e=>{console.error(e);process.exitCode=1});
