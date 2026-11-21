// Supplied pose diagnostics only; these images do not establish ordinary gameplay, fluidity or fun.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {openBrowser}=require('./lib-experiential-browser.cjs');
const out=path.resolve(process.env.RESET_ANATOMY_OUT||'reviews/media/R1/first30-reset/anatomy');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await openBrowser(process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8803/');
 try{
  await b.until(()=>b.evaluate('!!P.BossPuppet'),'rig boot');
  await b.evaluate('new Promise(resolve=>{const ids=Object.keys(P.CFG.bossParts).map(id=>"boss-parts-"+id);if(P.StreetArt.awaitList(ids,resolve))resolve(true);})');
  const ids=await b.evaluate('Object.keys(P.CFG.bossParts)');
  for(const id of ids){
   const data=await b.evaluate(`(()=>{const id=${JSON.stringify(id)},cv=document.createElement('canvas');cv.width=960;cv.height=360;
    const c=cv.getContext('2d');c.fillStyle='#b6aaa0';c.fillRect(0,0,960,360);
    const acts={cook:'combo',switchkeeper:'switchHook',roaster:'charge',linekeeper:'arcKnot',vatman:'vatmanLever',bellkeeper:'counterweights',dockBride:'ropeSweep',bigFisher:'bridgeCast',quayCaptain:'captainAnchor',ticketMan:'stationSignal'};
    for(let i=0;i<4;i++){const e={x:0,y:0,age:3,walk:.25,boss:true,bossPreset:id,ai:{m:i===0?'walk':'windup',act:acts[id],dir:{x:1,y:.25},t:.6,W:1,combo:2},windup:i===1?.6:1,dvx:i===0?1:0,dvy:0};
      const o={};if(i===3){e.deathPose=P.BossDeathState.capture(e);e.ai.m='defeat';o.defeatProgress=.8;}
      P.BossPuppet.draw(c,e,o,120+i*240,325,92,1);
    }return cv.toDataURL('image/png').split(',')[1];})()`);
   fs.writeFileSync(path.join(out,id+'.png'),Buffer.from(data,'base64'));console.log(id);
  }
  fs.writeFileSync(path.join(out,'conditions.json'),JSON.stringify({purpose:'Supplied anatomy/anchor debugging at enlarged scale. Not motion or ordinary HUD acceptance.',ids,errors:b.errors},null,2)+'\n');
  if(b.errors.length)throw Error(b.errors.join('\n'));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
