// Stop only a browser owned by this explicit verification profile; preserve its earned state and partial film.
'use strict';
const fs=require('node:fs'),path=require('node:path');
(async()=>{for(const tag of process.argv.slice(2)){
 const dir=path.resolve('reviews/media/R1/first30-reset/'+tag+'-journey'),p=JSON.parse(fs.readFileSync(path.join(dir,'profile.json'))),port=fs.readFileSync(p.dir+'/DevToolsActivePort','utf8').split('\n')[0];
 const list=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json(),target=list.find(q=>q.type==='page'&&q.url===p.url);if(!target)throw Error('Owned profile URL mismatch');
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pending=new Map();ws.onmessage=e=>{const r=JSON.parse(e.data);if(pending.has(r.id)){pending.get(r.id)(r);pending.delete(r.id)}};
 const send=(method,params)=>new Promise(resolve=>{const serial=++id;pending.set(serial,resolve);ws.send(JSON.stringify({id:serial,method,params}))});
 const r=await send('Runtime.evaluate',{expression:'({state:P.debug.state,level:P.debug.sim?.levelIndex,t:P.debug.sim?.runT,save:P.Meta.state()})',returnByValue:true});
 fs.writeFileSync(path.join(dir,'supervisor-stop.json'),JSON.stringify({at:new Date().toISOString(),reason:process.env.RESET_STOP_REASON||'Superseded intermediate source. Stop this duplicate capture to keep final verification responsive; this is a supervisor-injected error, not an encountered game failure. Existing completed films, failures and earned save remain.',profile:p,facts:r.result.result.value},null,2)+'\n');
 await send('Runtime.evaluate',{expression:'window.walkMove=()=>({x:0,y:0});console.error("Verification supervisor: stop superseded '+tag+' capture; preserve partial film and earned state")'});ws.close();console.log('Stopped owned capture',tag);
}})().catch(e=>{console.error(e);process.exitCode=1});
