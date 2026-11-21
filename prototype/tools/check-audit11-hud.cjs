// Actual production HUD strings/status functions; supplied positions/stages, never earned play.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs');
const tag=process.argv[2]||'development',origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8829';
const out=path.resolve('reviews/media/R1/audit11-implementation/hud-'+tag);fs.mkdirSync(out,{recursive:true});
const rows=[];
(async()=>{const b=await openBrowser(origin+'/?level=4&skipintro=1&lang=en');try{
 await b.until(()=>b.evaluate("P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'ready');
 await b.evaluate("document.getElementById('btn-start').click()",true);await b.until(()=>b.evaluate("P.debug.state==='play'"),'play');
 await b.evaluate("document.getElementById('btn-pause').click()");
 for(const width of [320,390])for(const lang of ['tr','en'])for(const text of [100,150]){
  await b.send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:false});
  await b.evaluate(`P.lang=${JSON.stringify(lang)};P.Settings.textSize=${text};P.applySettings();document.getElementById('scr-pause').classList.add('hidden');document.getElementById('hud').classList.remove('hidden');`);
  for(let level=1;level<=30;level++){
   const result=await b.evaluate(`(()=>{const s=P.createSim(42,{levelIndex:${level},tramRhythm:true,loadout:P.Power.expectedLoadout(${level})});P.startPlay(s);window.hudCase=s;
    const m=s.milestone,p=P.RouteMilestones.target(s);if(s.levelIndex>1&&!m)throw Error('Missing authored milestone '+s.levelIndex);if(p){s.hero.x=p[0];s.hero.y=p[1]-1.2;}
    if(m&&m.point)m.point.progress=.45;
    if(m&&m.sacks){m.carry=m.sacks[0];m.delivered=1;}
    P.UI.update(s);P.UI.routeContext(s);document.getElementById('hud').classList.remove('hidden');
    const row=document.getElementById('hud-route'),r=row.getBoundingClientRect(),d=document.getElementById('route-distance'),dr=d.getBoundingClientRect(),label=document.getElementById('route-label'),lr=label.getBoundingClientRect();
    const range=document.createRange();range.selectNodeContents(label);const words=Array.from(range.getClientRects()).map(q=>({x:q.x,y:q.y,w:q.width,h:q.height}));
    return{level:s.levelIndex,kind:m&&m.kind,text:row.innerText,hidden:row.classList.contains('hidden'),rect:r.toJSON(),label:lr.toJSON(),detail:dr.toJSON(),scroll:row.scrollWidth,client:row.clientWidth,words,phone:document.getElementById('phone').getBoundingClientRect().toJSON()};})()`);
   rows.push({...result,width,lang,textSize:text});
   fs.writeFileSync(path.join(out,'measurements.json'),JSON.stringify({origin,tag,method:'Production strings/status/DOM; supplied seed42 expected permanent power/positions/stages, paused gameplay. No source modification or font downscaling.',rows},null,2));
   if(!result.hidden&&!process.env.AUDIT11_OBSERVE_ONLY){assert(result.scroll<=result.client+2,'Horizontal overflow '+JSON.stringify(rows.at(-1)));assert(result.rect.width>width*.75,'Narrow required objective');
    assert(result.detail.width>=result.rect.width*.85||!result.detail.height,'Context must have an independent row');
    assert(result.words.every(q=>q.x>=result.phone.x-1&&q.x+q.w<=result.phone.x+result.phone.width+1),'Clipped essential text');}
   if([4,12,23,28,29].includes(level))await b.shot(path.join(out,`L${level}-${width}-${lang}-${text}.png`));
  }
 }
 assert.equal(b.errors.length,0,b.errors.join('\n'));console.log(process.env.AUDIT11_OBSERVE_ONLY?'240 HUD combinations observed; assertions deliberately disabled for retained baseline':'240 actual HUD combinations pass');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
