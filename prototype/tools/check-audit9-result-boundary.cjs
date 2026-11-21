// Actual rendered result components with declared supplied data; earned result/return is recorded separately.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8801',base='reviews/media/R1/audit9-implementation/results-final13';
const build=JSON.parse(fs.readFileSync('reviews/telemetry/audit9-implementation/integrated13.json')),records=[];
fs.mkdirSync(base,{recursive:true});
(async()=>{
 for(const [width,height]of[[390,844],[320,568]])for(const lang of['tr','en'])for(const textSize of[100,150]){
  const b=await openBrowser(origin+'/?lang='+lang,{width,height});try{
   await b.until(()=>b.evaluate("P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'title');
   await b.evaluate('P.Settings.textSize='+textSize+';P.Settings.reduceMotion=true;P.applySettings()');
   const before=await b.evaluate('JSON.stringify(P.Meta.state())');
   for(const [level,win,firstClear]of[[29,true,false],[30,false,false],[30,true,false],[30,true,true]]){
    const facts=await b.evaluate(`(()=>{const r={hoodN:6,stage:${level-25},hood:'Sirkeci',mode:'normal',win:${win},hasNext:${level===29&&win},stars:[true,true,true],goals:[],firstClear:${firstClear},jeton:0,hurda:0,level:8,kills:185,streak:175,time:93,km:4.8,hpPct:91};
     P.Screens.showResults(r);const recap=document.getElementById('res-recap');return{last:recap.lastElementChild.textContent,boundary:P.t('exp.boundary'),viewport:[innerWidth,innerHeight],nextVisible:!!document.getElementById('btn-next').getClientRects().length};})()`);
    if(level===30&&win)assert(facts.last.includes(facts.boundary),'Winning30 must end with the actual slice boundary, not31');
    else assert(facts.last.includes('30')&&!facts.last.includes(facts.boundary),'29 advance and30 retry must still point to30');
    assert(!facts.last.includes('31'));assert.equal(facts.nextVisible,level===29&&win);
    await b.evaluate(`(()=>{const root=document.querySelector('#scr-results .res-body'),r=root.getBoundingClientRect(),n=document.getElementById('res-recap').lastElementChild.getBoundingClientRect(),scale=r.height/root.offsetHeight;root.scrollTop+=(n.bottom-r.bottom+16)/scale;})()`);
    assert(await b.evaluate("(()=>{const n=document.getElementById('res-recap').lastElementChild.getBoundingClientRect(),r=document.querySelector('#scr-results .res-body').getBoundingClientRect();return n.top>=r.top&&n.bottom<=r.bottom-8})()"),'Result recap must fit inside its own visible scroll area');
    await b.sleep(180);const id='result-L'+level+'-'+(win?'win':'loss')+'-'+lang+'-'+width+'-'+textSize+'-'+(firstClear?'first':'repeat');
    await b.shot(path.join(base,id+'.png'));records.push({id,level,win,firstClear,width,height,lang,textSize,fixture:true,sourceManifest:build.runtime_manifest_sha256,facts});
   }
   assert.equal(await b.evaluate('JSON.stringify(P.Meta.state())'),before,'Rendering a result cannot pay rewards');assert.equal(b.errors.length,0);
  }finally{await b.close();}
 }
 fs.writeFileSync('reviews/telemetry/audit9-implementation/final13-result-boundary-checks.json',JSON.stringify({origin,runtime:build.runtime_manifest_sha256,
  supplied:'Only result presentation data; actual current DOM, native text, viewport and scroll. No reward settlement, eligibility or earned-clear claim.',records},null,2)+'\n');
 console.log('PASS32 native/viewport/text result cases;29advance/30retry/30first-clear/30replay boundary, no state mutation');
})().catch(e=>{console.error(e);process.exitCode=1});
