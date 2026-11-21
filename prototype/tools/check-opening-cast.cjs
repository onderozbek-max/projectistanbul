// Actual fresh opening and first movement; no supplied actor, power, time, completion or save.
'use strict';const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs');
const out=process.env.CAST_OUT||'reviews/media/R1/opening-cast-2026-11-20/after';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await openBrowser((process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8829')+'/?level=1&seed=42&lang=en');try{
 await b.until(()=>b.evaluate("P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'title');
 await b.evaluate(`(()=>{window.castCheck={time:0,samples:[],last:{},kills:[],dust:0};const update=P.ColdOpen.update,draw=CanvasRenderingContext2D.prototype.drawImage,emit=P.Feel.emit,event=P.Fx.onEvent,cache={};
 P.ColdOpen.update=function(dt){castCheck.time+=dt;return update.apply(this,arguments);};
 P.Feel.emit=function(p){if(P.ColdOpen.active()&&p.k==='dust')castCheck.dust++;return emit.apply(this,arguments);};
 P.Fx.onEvent=function(ev){if(ev.type==='kill')castCheck.kills.push({id:ev.id,type:ev.enemy});return event.apply(this,arguments);};
 CanvasRenderingContext2D.prototype.drawImage=function(img,...a){
  if(img.src?.includes('restaurant-cast-v2')&&a.length===8){const row=a[1]/256,col=a[0]/256,key=row+':'+col;
   if(!cache[key]){const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d');draw.call(c,img,a[0],a[1],256,256,0,0,256,256);const px=c.getImageData(0,0,256,256).data;let top=256,bottom=0;for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(px[(y*256+x)*4+3]>=32){top=Math.min(top,y);bottom=Math.max(bottom,y+1);}cache[key]={top,bottom};}
   if(castCheck.time-(castCheck.last[row]||-1)>.25){castCheck.last[row]=castCheck.time;const m=this.getTransform(),q=cache[key],height=(q.bottom-q.top)/256*a[7]*Math.hypot(m.c,m.d);castCheck.samples.push({time:castCheck.time,state:P.debug.state,row,column:col,drawHeight:height,paintedMetres:height/(P.Render.ppm*P.Render.dpr),ppm:P.Render.ppm,alpha:this.globalAlpha,sim:P.debug.sim.runT});}
  }return draw.call(this,img,...a);};})()`);
 const media=await recordDOM(b,path.join(out,'opening.mp4'),async()=>{
  await b.evaluate("document.getElementById('btn-start').click()",true);
  for(const t of [4,12,14.5,16.2,24.8,26.4]){await b.until(()=>b.evaluate('castCheck.time>'+t),'opening '+t);await b.shot(path.join(out,'at-'+t+'.png'));}
  await b.until(()=>b.evaluate("P.debug.state==='play'&&P.Input.enabled"),'control return');
  const start=await b.evaluate('({y:P.debug.sim.hero.y,t:P.debug.sim.runT})');
  await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW',windowsVirtualKeyCode:87});await b.sleep(700);
  await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW',windowsVirtualKeyCode:87});
  const moved=await b.evaluate('({y:P.debug.sim.hero.y,t:P.debug.sim.runT})');assert(moved.y>start.y&&moved.t>start.t);
  await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x:60,y:650,button:'left',clickCount:1});
  const until=Date.now()+10000;while(Date.now()<until){
   const v=await b.evaluate('(()=>{const s=P.debug.sim,e=s.enemies.find(e=>!e.dead&&e.dinerIndex!==undefined);if(!e)return null;const dx=e.x-s.hero.x,dy=e.y-s.hero.y,d=Math.hypot(dx,dy)||1;return{x:dx/d,y:dy/d};})()');if(!v)break;
   await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:60+v.x*31,y:650-v.y*31,button:'left',buttons:1});await b.sleep(100);
  }
  await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:60,y:650,button:'left',clickCount:1});await b.sleep(800);
  await b.shot(path.join(out,'control-and-customer-corpses.png'));return{start,moved,mode:await b.evaluate('P.debug.sim.mode')};
 });
 const trace=await b.evaluate('castCheck');fs.writeFileSync(path.join(out,'capture-facts.json'),JSON.stringify({trace,media,errors:b.errors},null,2)+'\n');
 assert.equal(trace.dust,0);assert.equal(b.errors.length,0,b.errors.join('\n'));
 const standing=trace.samples.filter(s=>s.time>2&&s.time<12&&s.column===0);assert.deepEqual([...new Set(standing.map(s=>s.row))].sort(),[0,1,2]);
 const heights=standing.map(s=>s.drawHeight);assert(Math.max(...heights)/Math.min(...heights)<1.03,'Actual painted adults must share world scale');
 const converted=trace.samples.filter(s=>s.row===0&&s.time>14&&s.time<26&&s.column>=2);assert(converted.length>5&&converted.every(s=>s.alpha>.99));
 assert(converted.every(s=>Math.abs(s.paintedMetres/standing[0].paintedMetres-1)<.04),'Conversion cannot shrink/replace the body under the shared camera zoom');
 assert(trace.kills.some(k=>k.id===1)&&trace.kills.some(k=>k.id===2),'Both real residents killed through ordinary attacks');
 const source=JSON.parse(fs.readFileSync(process.env.CAST_MANIFEST||'reviews/telemetry/first30-reset/candidate19.json'));
 fs.writeFileSync(path.join(out,'index.json'),JSON.stringify({source,method:'Fresh isolated desktop browser, actual Start, original wall-time recording, native canvas/post-master audio, actual keyboard and pointer steering to the two real residents. No time jump, actor/power/save/outcome supply. Actual source-alpha height/transform measurements, distinct identities, conversion and ordinary control checked. Not continuous artistic listening or phone/player acceptance.',trace,media,errors:b.errors},null,2)+'\n');
 console.log('PASS actual three-person cast, equal painted heights, continuous identity through conversion, both earned resident kills and responsive control');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
