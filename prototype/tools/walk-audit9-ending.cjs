// Actual normal replay from the completed earned profile, on candidate13. No save import.
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const root=path.resolve('reviews/media/R1/audit9-implementation'),out=path.join(root,'ending-final13-earned');
const profile=JSON.parse(fs.readFileSync(path.join(root,'walkthrough-final12/profile.json')));
fs.mkdirSync(out,{recursive:true});
if(!fs.existsSync(path.join(out,'index.json')))fs.writeFileSync(path.join(out,'index.json'),JSON.stringify({records:[],actions:[]}));
Object.assign(process.env,{ISTANBUL_PREVIEW:new URL(profile.url).origin,AUDIT9_MANIFEST:'reviews/telemetry/audit9-implementation/integrated13.json',AUDIT9_WALK_OUT:out,AUDIT9_FRAME_INPUT:'1',AUDIT9_RESUME:'1',AUDIT9_PROFILE:profile.dir,AUDIT9_THROUGH:'30'});
let source=fs.readFileSync(path.join(__dirname,'walk-audit9.cjs'),'utf8');
source=source.replace("const first=resume?await b.evaluate('P.Meta.unlockedLevel()'):1;","const first=30;");
const initial="if(await b.evaluate('P.debug.state===\"map\"'))await growth(b,first);";
if(!source.includes(initial))throw Error('Ending harness resume contract changed');
source=source.replace(initial,'');
const start="if(level>1&&trial===0)await tap(b,'.meta-next .meta-play');";
if(!source.includes(start))throw Error('Ending harness ordinary start contract changed');
source=source.replace(start,`if(trial===0){
 await tap(b,'.meta-hood[data-h="5"]');
 await b.until(()=>b.evaluate("Array.from(document.querySelectorAll('[data-lv]')).some(e=>e.dataset.lv==='30')"),'actual Sirkeci level sheet');
 await b.sleep(700);await tap(b,'[data-lv="30"]');await b.sleep(250);await tap(b,'[data-act="play"]');
 }`);
const play="won=await play(b,level,attempt);";
source=source.replace(play,play+`
 if(won){
  const before=await b.evaluate('JSON.stringify(P.Meta.state())'),id='earned-result-inspection-'+attempt;
  const film=await recordDOM(b,path.join(out,id+'.mp4'),async()=>{
   for(let i=0;i<8;i++){
    const q=await b.evaluate("(()=>{const e=document.getElementById('res-recap').lastElementChild,r=e.getBoundingClientRect(),a=document.querySelector('#scr-results .res-body').getBoundingClientRect();return{fits:r.top>=a.top+4&&r.bottom<=a.bottom-12,delta:r.bottom-a.bottom+18,x:a.x+a.width/2,y:a.y+a.height/2,text:e.textContent,boundary:P.t('exp.boundary')}})()");
    assert(q.text.includes(q.boundary)&&!q.text.includes('31'),'Actual earned result must explain the first30 boundary');
    if(q.fits)break;
    await b.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:q.x,y:q.y,deltaX:0,deltaY:q.delta});await b.sleep(200);
   }
   assert(await b.evaluate("(()=>{const r=document.getElementById('res-recap').lastElementChild.getBoundingClientRect(),a=document.querySelector('#scr-results .res-body').getBoundingClientRect();return r.top>=a.top&&r.bottom<=a.bottom-8})()"),'Entire actual boundary recap must be visible above the fixed action footer');
   await b.shot(path.join(out,id+'.png'));await b.sleep(4500);return{state:await b.evaluate('P.debug.state')};
  });
  assert.equal(await b.evaluate('JSON.stringify(P.Meta.state())'),before,'Inspection cannot settle a second reward');
  fs.writeFileSync(path.join(out,id+'.json'),JSON.stringify({id,file:id+'.mp4',sourceManifest:build.runtime_manifest_sha256,fixture:false,supplied:'Actual earned current-build result, ordinary mouse-wheel scroll, no reconstituted result or save/reward grant. This rematch follows the completed fresh source12 campaign.',...film},null,2)+String.fromCharCode(10));
 }
`);
fs.writeFileSync(path.join(out,'executed-harness.cjs'),source);
new (require('node:vm').Script)(Module.wrap(source),{filename:'ending-runtime.cjs'});
fs.writeFileSync(path.join(out,'provenance.json'),JSON.stringify({runtime:JSON.parse(fs.readFileSync(process.env.AUDIT9_MANIFEST)).runtime_manifest_sha256,
 origin:'Same actual completed fresh-earned browser profile and same localhost origin; candidate13 changes only the final result-recommendation guard.',
 supplied:false,importedSave:false,selection:'Actual map click on Sirkeci, actual level30 and Play controls. Earned replay/rematch, not a fresh first clear. No power, offer, outcome or eligibility writes.'},null,2)+'\n');
const instance=new Module(path.join(__dirname,'ending-runtime.cjs'),module);instance.filename=path.join(__dirname,'ending-runtime.cjs');instance.paths=Module._nodeModulePaths(__dirname);instance._compile(source,instance.filename);
