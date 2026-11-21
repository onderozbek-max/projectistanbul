// Direct original rendered frames avoid assuming a delayed MediaRecorder's first-frame wall origin.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs');
const out=process.env.AUDIT11_HEALTH_OUT||'reviews/media/R1/audit11-implementation/final9-health-direct',rows=[];
fs.mkdirSync(out,{recursive:true});
async function frame(b,id,trigger){
 const r=await b.evaluate(`(async()=>{${trigger};await new Promise(r=>setTimeout(r,55));
  return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const s=P.debug.sim;resolve({wall:Date.now()/1000,t:s.runT,hp:s.hero.hp,
    feedback:P.HealthFeedback.state(),events:window.healthEvents.slice(-5),image:document.getElementById('game').toDataURL('image/png')});
  })));})()`);
 fs.writeFileSync(path.join(out,id+'.png'),Buffer.from(r.image.split(',')[1],'base64'));delete r.image;
 rows.push({id,file:id+'.png',...r});return r;
}
(async()=>{
 for(const reduced of [false,true]){
  const b=await openBrowser((process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8834')+'/?level=3&skipintro=1&lang=en');
  try{
   await b.until(()=>b.evaluate("P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'loaded');
   await b.evaluate("P.Story.play=function(n,w,d){d();return false};document.getElementById('btn-start').click()",true);
   await b.until(()=>b.evaluate("P.debug.state==='play'"),'playing');
   await b.evaluate(`(()=>{const s=P.debug.sim;s.enemies=[];s.enemyTele=[];s.drops=[];
    s.hero.weapons={};s.hero.x=0;s.hero.y=60;s.hero.invuln=0;s.hero.iframes=0;
    P.Horde.step=()=>{};P.Director.step=()=>{};s.env.portals=[];s.milestone.open=true;
    s.gen.mi=s.gen.marks.length;P.Comic.clearRunDialogue();P.Barks.clear();P.Barks.setEnabled(false);
    P.Input.get=()=>({x:0,y:0});P.Fx.reset(s);P.Settings.reduceMotion=${reduced};P.Settings.reduceFlash=${reduced};
    P.Settings.musicVol=0;P.Settings.sfxVol=0;P.applySettings();document.getElementById('hud').style.visibility='hidden';
    window.healthEvents=[];const old=P.drainEvents;P.drainEvents=function(s){const es=old(s);healthEvents.push(...es);return es};})()`);
   await b.sleep(250);
   const mode=reduced?'reduced':'default';
   for(const [label,damage,cause,source]of [['light',4,'walker',{type:'walker',x:1,y:60}],['heavy',19,'walker',{type:'walker',x:-1,y:60}],['offscreen',8,'spitter',{type:'spitter',x:12,y:60}],['hazard',4,'acid',null],['critical',84,'walker',{type:'walker',x:1,y:60}]]){
    const r=await frame(b,mode+'-'+label,`const s=P.debug.sim;s.hero.hp=s.hero.maxHp;s.hero.invuln=0;s.hero.iframes=0;P.HealthFeedback.reset(s);P.Combat.damageHero(s,${damage},${JSON.stringify(cause)},${JSON.stringify(source)})`);
    assert(r.feedback.hurt>0&&r.hp<108,'Actual rendered hurt window missing');if(label==='critical')assert(r.feedback.critical);
   }
   const heal=await frame(b,mode+'-heal',"const s=P.debug.sim;s.drops.push({kind:'simit',value:35,uncapped:true,x:s.hero.x,y:s.hero.y,mag:false,pop:0})");
   assert(heal.feedback.heal>0&&heal.hp>24,'Actual healing absent');
   await b.evaluate("const s=P.debug.sim;s.sk.act.cd=0;P.Input.get=()=>({x:0,y:0,skill:true})");await b.sleep(100);
   const block=await frame(b,mode+'-block',"const s=P.debug.sim;P.Input.get=()=>({x:0,y:0});s.hero.invuln=0;s.hero.iframes=0;P.Combat.damageHero(s,10,'walker',{type:'walker',x:1,y:60})");
   assert(block.feedback.shield>0,'Actual block absent');assert.equal(b.errors.length,0,b.errors.join('\n'));
  }finally{await b.close();}
 }
 fs.writeFileSync(path.join(out,'index.json'),JSON.stringify({source:JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/audit11-candidate9.json')),method:'Supplied quiet L3 lane, HP resets and empty weapon/ambient set; default and reduced/muted. Real Combat damage, actual food pickup and real shield input; direct production canvas encoded after55ms and two actual animation callbacks in the same page operation. No movie PTS or screenshot-latency inference. HUD hidden. Not earned play, temporal fluency, phone or uncoached recognition proof.',rows},null,2)+'\n');
 console.log('PASS14 direct rendered light/heavy/offscreen/hazard/critical/heal/shield windows');
})().catch(e=>{console.error(e);process.exitCode=1});
