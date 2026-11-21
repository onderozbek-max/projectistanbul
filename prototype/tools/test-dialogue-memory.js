// Real reload boundaries, native separation, repeatable urgent cues and reset/storage failure behavior.
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../js/dialogue/dialogue.js'),'utf8'),saved={};
const storage={getItem:k=>saved[k]||null,setItem:(k,v)=>{saved[k]=v;},removeItem:k=>{delete saved[k];}};
function boot(store=storage){
 const ctx=vm.createContext({sessionStorage:store});vm.runInContext('var P={lang:"en",t:function(k){return k;}};',ctx);vm.runInContext(code,ctx);
 vm.runInContext(`P.DLG.beats={'BK.self':{},'BK.low':{},'BK.fk.runner':{},'BK.fk.spitter':{}};
 P.DLG.en={'BK.self':[{t:'A'},{t:'B'},{t:'C'}],'BK.low':[{t:'Danger'}],'BK.fk.runner':[{t:'Runner'}],'BK.fk.spitter':[{t:'Spitter'}]};
 P.DLG.tr={'BK.self':[{t:'X'},{t:'Y'},{t:'Z'}],'BK.low':[{t:'Tehlike'}]};`,ctx);return ctx;
}
(async()=>{
 const first=boot(),D=first.P.Dialogue;assert.equal(D.line('BK.self',{rng:()=>0}).i,0);
 D.rememberEnemy('runner','met');D.rememberEnemy('spitter','seen');D.line('BK.low',{rng:()=>0});
 await Promise.resolve();assert(saved['nsi.dialogue.session.v1']);
 const reload=boot(),R=reload.P.Dialogue;assert.equal(R.line('BK.self',{rng:()=>0}).i,1,'Reload cannot repeat the immediately previous ambient variant');
 assert.equal(R.knowledge().met.runner,true);assert.equal(R.knowledge().seen.spitter,true);assert.equal(R.knowledge().met.spitter,undefined,'Killing a type cannot invent a living first sighting');
 assert.equal(R.line('BK.self',{lang:'tr',rng:()=>0}).i,0,'Independent native variant history');
 assert.equal(R.line('BK.low',{rng:()=>0}).i,0,'Urgent tell remains repeatable after reload');
 R.rememberEnemy('not-a-real-enemy','met');assert.equal(R.knowledge().met['not-a-real-enemy'],undefined);
 const reference=R.knowledge().met;R.line('BK.self',{rng:()=>0});R.clearSessionHistory();await Promise.resolve();
 assert.equal(Object.keys(reference).length,0,'Existing bark-state references clear with the profile');assert.equal(saved['nsi.dialogue.session.v1'],undefined,'A queued old write cannot resurrect reset history');
 assert.equal(boot().P.Dialogue.line('BK.self',{rng:()=>0}).i,0);
 const denied=boot({getItem(){throw Error('denied')},setItem(){throw Error('denied')},removeItem(){throw Error('denied')}}).P.Dialogue;
 assert(denied.line('BK.self',{rng:()=>0}));denied.rememberEnemy('runner','met');await Promise.resolve();assert(denied.knowledge().met.runner);denied.clearSessionHistory();
 console.log('dialogue-memory: actual fresh-context reload, native variants, acquaintance, urgent repeat, reset and denied storage pass');
})().catch(e=>{console.error(e);process.exitCode=1});
