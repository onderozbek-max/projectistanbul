// Repair only this task's live diagnostic steering; never set power, flags, position or outcome.
'use strict';const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const base='reviews/media/R1/first30-reset/candidate17-journey',profile=JSON.parse(fs.readFileSync(path.join(base,'profile.json')));
 const port=fs.readFileSync(path.join(profile.dir,'DevToolsActivePort'),'utf8').split('\n')[0];
 const pages=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json(),page=pages.find(p=>p.type==='page'&&p.url.startsWith('http://127.0.0.1:8828/'));
 if(!page)throw Error('Exact owned final17 page absent');
 const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
 const expression=`(()=>{const s=P.debug.sim;if(s.levelIndex!==29||!s.milestone?.lights?.on)throw Error('Only actual lit29 steering is authorized');
 const before={t:s.runT,x:s.hero.x,y:s.hero.y,point:P.RouteMilestones.target(s),passed:s.milestone.lights.passed,steps:s.milestone.lights.steps,input:walkMove()};
 const original=window.walkMove;window.walkMove=function(){const s=P.debug.sim,q=s?.milestone?.lights,p=q?.on&&!s.milestone.open&&q.steps[q.passed];
  if(s?.levelIndex!==29||!p)return original();const dx=p.x-s.hero.x,dy=p.y+.65-s.hero.y,d=Math.hypot(dx,dy);return d<.1?{x:0,y:0}:{x:dx/d,y:dy/d};};return before;})()`;
 const result=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Owned diagnostic attach timed out')),15000);ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id===1){clearTimeout(timer);m.error||m.result.exceptionDetails?reject(Error(JSON.stringify(m))):resolve(m.result.result.value)}};ws.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression,returnByValue:true}}))});
 ws.close();fs.writeFileSync('reviews/telemetry/first30-reset/candidate17-L29-input-repair.json',JSON.stringify({at:new Date().toISOString(),before:result,method:'Read actual lit step and steer .65m beyond its crossing threshold via the existing normal frame-cadence pointer handlers. Generic hold policy stopped .23m short. Original long stalled interval retained in same movie. No sim step, position, completion flag, HP, reward, save or outcome write; source17 runtime unchanged.'},null,2)+'\n');console.log(result);
})().catch(e=>{console.error(e);process.exitCode=1});
