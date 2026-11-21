// Temporary working-source inspection; explicit pose/time samples, no ordinary-earned or acceptance claim.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const level=+(process.env.RESET_PILOT_LEVEL||20),out=process.env.RESET_CHECK_OUT||'reviews/media/R1/first30-reset/kaan-pilot';fs.mkdirSync(out,{recursive:true});
const old=fs.readFileSync(path.join(__dirname,'capture-experience.cjs'),'utf8'),prep=old.slice(old.indexOf('function prepareBoss('),old.indexOf('function prepareWorld('));
(async()=>{const b=await openBrowser('http://127.0.0.1:8803/?level='+level+'&skipintro=1&lang=en');try{
 await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'title');await b.evaluate('document.getElementById("btn-start").click()',true);await b.until(()=>b.evaluate('P.debug.state==="play"&&P.KaanActor.ready()'),'new actor');
 await b.evaluate('(()=>{'+prep+'prepareBoss('+level+');const s=P.debug.sim;s.enemies=[s.gen.boss];s.hero.invuln=Infinity;if(s.levelIndex>20){s.loadout=s.loadout||{};s.loadout.kaanJoined=true;}P.Companion.init(s);window.kaanSamples=[];setInterval(()=>{if(P.KaanActor.last)kaanSamples.push(JSON.parse(JSON.stringify(P.KaanActor.last)))},60)})()');
 await b.until(()=>b.evaluate('P.SceneFlow.current()?.kind==="entry"'),'entry');await b.until(()=>b.evaluate('!P.SceneFlow.current()'),'entry release');
 await b.shot(path.join(out,'guard-before-recognition.png'));
 const r=await recordDOM(b,path.join(out,'guard-lower-recognize-depart.mp4'),async()=>{
  await b.evaluate('(()=>{const s=P.debug.sim;P.Combat.damageEnemy(s,s.gen.boss,s.gen.boss.hp*30,1,0,0,false,"knife")})()');
  for(let i=0;i<16;i++){await b.sleep(500);await b.shot(path.join(out,'sequence-'+i+'.png'));}
 });
 fs.writeFileSync(path.join(out,'index.json'),JSON.stringify({source:'Mutable working source after candidate12, Kaan physical pilot; NOT final manifest',fixture:true,supplied:'Quiet boss/observer, actual lethal hit and true scene flow; no earned claim',...r,samples:await b.evaluate('kaanSamples'),errors:b.errors},null,2)+'\n');if(b.errors.length)throw Error(b.errors.join('\n'));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
