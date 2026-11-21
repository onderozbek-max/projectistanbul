// Actual production evolution-card layout; supplied legal recipe, not earned acquisition evidence.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{openBrowser}=require('./lib-experiential-browser.cjs');
const out='reviews/media/R1/audit11-implementation/final10-cleaver-copy',rows=[];fs.mkdirSync(out,{recursive:true});
(async()=>{
 for(const width of [320,390])for(const lang of ['tr','en']){
  const b=await openBrowser('http://127.0.0.1:8828/?level=3&skipintro=1&lang='+lang,{width,height:width===320?568:844});
  try{
   await b.until(()=>b.evaluate("P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"),'title');
   await b.evaluate("P.Story.play=function(n,w,d){d();return false};document.getElementById('btn-start').click()",true);
   await b.until(()=>b.evaluate("P.debug.state==='play'"),'run');
   for(const size of [100,150]){
    await b.evaluate(`(()=>{const s=P.debug.sim;s.hero.weapons={knife:5};s.hero.passives={gloves:1};s.pendingLevels=1;
     P.Settings.textSize=${size};P.applySettings();P.Screens.showCards(s,{cards:[{id:'w:cleaver',item:'cleaver',next:5,evo:'knife'},P.Progression.cardFor(s,'p:medkit'),P.Progression.cardFor(s,'p:jacket')],scripted:false},()=>{},()=>{});
     document.querySelector('#cards .card').scrollIntoView({block:'center'});})()`);await b.sleep(100);
    const facts=await b.evaluate(`(()=>{const e=document.querySelector('#cards .card'),r=e.getBoundingClientRect();return{text:e.textContent,expected:P.t('desc.cleaver'),width:e.clientWidth,scroll:e.scrollWidth,hit:e.contains(document.elementFromPoint(r.x+r.width/2,Math.max(1,Math.min(innerHeight-1,r.y+r.height/2))))}})()`);
    assert(facts.text.includes(facts.expected)&&!facts.text.includes('360'));assert(facts.scroll<=facts.width+2&&facts.hit);
    const file=lang+'-'+width+'-'+size+'.png';await b.shot(out+'/'+file);rows.push({file,width,lang,textSize:size,...facts});
   }
   assert.equal(b.errors.length,0,b.errors.join('\n'));
  }finally{await b.close();}
 }
 fs.writeFileSync(out+'/index.json',JSON.stringify({source:JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/audit11-candidate10.json')),method:'Supplied legal knife5/gloves1 evolution offer rendered through actual P.Screens.showCards; untouched production copy/layout; no earned-feasibility or damage/animation claim.320/390,TR/EN,100/150; actual hit test and horizontal bounds.',rows},null,2)+'\n');console.log('PASS8 actual bilingual Cleaver evolution cards, no stale orbit description or horizontal overflow');
})().catch(e=>{console.error(e);process.exitCode=1});
