// Real first-30 simulation from earned saves, with the repository's automated input policy and ordinary rewards.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const out=path.resolve('reviews/media/R1/experiential'),origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8775';
const bot=fs.readFileSync(path.join(__dirname,'bot.js'),'utf8');
const navigation=bot.slice(bot.indexOf('function unit('),bot.indexOf('// Diagnostics for a timed-out run'));
const skills=fs.readFileSync(path.join(__dirname,'lib-bot-play.js'),'utf8').split('// Generated levels:')[0];
const rows=fs.readFileSync('reviews/telemetry/experiential/earned-broad.jsonl','utf8').trim().split('\n').map(JSON.parse);
const build=JSON.parse(fs.readFileSync('reviews/telemetry/experiential/build.json','utf8'));
const index=process.env.ISTANBUL_EARNED_LEVELS?JSON.parse(fs.readFileSync(path.join(out,'index-earned.json'),'utf8')):[];
async function install(b,sample){
 await b.evaluate('Object.assign(P.Meta.state(),'+JSON.stringify(sample.saveBefore)+');P.Meta.Save.write(P.Meta.state());');
 await b.send('Page.navigate',{url:origin+'/?level='+sample.level+'&seed='+sample.seed+'&lang=en&skipintro=1'});
 await b.until(()=>b.evaluate("!!window.P?.debug&&P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'earned title');
 await b.evaluate(`window.originalStory=P.Story.play;P.Story.play=function(n,when,done,run){if(when==='intro'){done();return false;}return originalStory(n,when,done,run);};
 document.getElementById('btn-start').click();`,true);
 await b.until(()=>b.evaluate("P.debug.state==='play'"),'earned play');
 await b.evaluate(`(()=>{const args={punish:true},DT=1/60,DROP_KINDS=['xp','chest','simit','jeton'],HACK_REACH=7;
 ${navigation}
 ${skills}
 const s=P.debug.sim,st={ang:0,best:s.hero.y,bestT:0,push:0,side:1,skip:new Set(),dropT:0,dropId:null,threat:Infinity};
 P.Input.get=function(){return useActiveSkills(P,s,genInput(s,st),unit);};
 const drain=P.drainEvents;window.earnedEvents=[];P.drainEvents=function(run){const es=drain(run);for(const e of es)if(['bossIntro','bossDie','bossWindup','win','death','evolve','routeBeat'].includes(e.type))earnedEvents.push({t:run.runT,...e});return es;};
 window.cardTimer=setInterval(()=>{if(P.debug.state==='cards'){const card=document.querySelector('#cards .card:not(.is-disabled)');if(card){const mod=card.querySelector('.mod-opt');(mod||card).click();}}
 if(P.debug.state==='chest'){const option=document.querySelector('#chest-choices button');if(option)option.click();const go=document.getElementById('btn-chest-continue');if(go&&!go.disabled)go.click();}},300);
 })()`);
}
async function main(){
 const b=await openBrowser(origin+'/?lang=en');
 try{
  for(const level of (process.env.ISTANBUL_EARNED_LEVELS||'20,25,30').split(',').map(Number)){
   const sample=rows.find(r=>r.level===level&&r.result==='win');
   if(sample.saveBefore.stars?.[level])throw Error('Expected genuine pre-clear earned save for L'+level);
   await install(b,sample);
   await b.until(()=>b.evaluate("earnedEvents.some(e=>e.type==='bossIntro')||P.debug.state==='down'"),'earned boss L'+level,240000);
   const result=await recordDOM(b,path.join(out,'earned-L'+level+'.mp4'),async()=>{
    const end=Date.now()+180000;let lastTurn=0,staged=false;
    while(Date.now()<end){const state=await b.evaluate('P.debug.state');
     if(state==='results'||state==='down')return state;
     if(!staged&&await b.evaluate('P.SceneFlow.presentingWorld()')){await b.shot(path.join(out,'earned-L'+level+'-world-caption.png'));staged=true;}
     if((state==='storyEnd'||state==='storyRun'||await b.evaluate('!!P.SceneFlow.current()?.ownsStory'))&&Date.now()-lastTurn>=7500){
      await b.shot(path.join(out,'earned-L'+level+'-panel-'+Date.now()+'.png'));
      await b.send('Input.dispatchKeyEvent',{type:'keyDown',code:'Enter',key:'Enter',windowsVirtualKeyCode:13});await b.send('Input.dispatchKeyEvent',{type:'keyUp',code:'Enter',key:'Enter',windowsVirtualKeyCode:13});lastTurn=Date.now();
     }
     await b.sleep(250);
    }return 'capture-timeout';
   });
   await b.evaluate('clearInterval(cardTimer)');await b.shot(path.join(out,'earned-L'+level+'-end.png'));
   const facts=await b.evaluate('({state:P.debug.state,t:P.debug.sim.runT,hp:P.debug.sim.hero.hp,weapons:P.debug.sim.hero.weapons,events:earnedEvents,pending:P.Meta.pendingResult(),music:P.Music.audibleTracks()})');
   if(facts.state==='results'&&!facts.pending?.reward?.first)throw Error('Expected first-clear result for L'+level);
   const prior=index.findIndex(r=>r.level===level);if(prior>=0)index.splice(prior,1);
   index.push({level,file:'earned-L'+level+'.mp4',sourceManifest:build.runtime_manifest_sha256,origin:'earned-broad.jsonl level '+level+' seed '+sample.seed,
    supplied:'Saved permanent progression earned by the no-spend/no-ad/no-revive campaign. No granted ranks or invulnerability. Automated movement, card choices and comic navigation.',...result,facts});
   fs.writeFileSync(path.join(out,'index-earned.json'),JSON.stringify(index,null,2)+'\n');console.log(level,result.outcome);
   if(b.errors.length)throw Error(b.errors.join('\n'));
  }
 }finally{await b.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
