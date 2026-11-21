'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs');
const origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8779',out=path.resolve('reviews/media/R1/audit8-implementation/interface');fs.mkdirSync(out,{recursive:true});
const rows=fs.readFileSync('reviews/telemetry/audit8-implementation/final-earned-broad.jsonl','utf8').trim().split('\n').map(JSON.parse);
const sample={saveBefore:JSON.parse(fs.readFileSync('reviews/telemetry/audit8-implementation/earned-upgrade-save.json','utf8')).save},records=[];
async function layout(b,selector){return b.evaluate(`(()=>{const p=document.querySelector(${JSON.stringify(selector)}),r=p.getBoundingClientRect();return{width:r.width,scroll:p.scrollWidth,client:p.clientWidth,height:r.height,visible:getComputedStyle(p).display!=='none',buttons:Array.from(p.querySelectorAll('button')).filter(b=>!b.disabled&&b.getBoundingClientRect().height).length};})()`);}
(async()=>{
 for(const [width,height] of [[390,844],[320,568]])for(const lang of ['tr','en']){
  const b=await openBrowser(origin+'/?lang='+lang,{width,height});try{
   await b.until(()=>b.evaluate("P.ArtRaster.heroState()==='ready'"),'current art');
   await b.evaluate('Object.assign(P.Meta.state(),'+JSON.stringify(sample.saveBefore)+');P.Meta.state().pending=null;P.Meta.Save.write(P.Meta.state());P.Settings.reduceMotion=true;P.Settings.textSize=150;P.applySettings();P.Meta.open(()=>{},true)',true);
   await b.sleep(650);
   for(const page of ['attributes','perks','arsenal','memories','gear']){
    await b.evaluate('P.Meta.Attr.hide(true);P.Meta.TreeUI.hide();P.Meta.Arsenal.hide();P.Meta.Hub.hide();P.Meta.Gear.hide()');
    const command={attributes:'P.Meta.Attr.show(null,true)',perks:'P.Meta.TreeUI.show()',arsenal:'P.Meta.Arsenal.show()',memories:'P.Meta.Hub.show("coll")',gear:'P.Meta.Gear.show()'}[page];
    await b.evaluate(command,true);await b.sleep(200);
    const selector={attributes:'.meta-attr',perks:'.meta-tree',arsenal:'.meta-arsenal',memories:'.meta-hub',gear:'.meta-gear'}[page],r=await layout(b,selector);
    assert(r.visible&&r.buttons>0);assert(r.scroll<=r.client+2,page+' horizontal overflow '+JSON.stringify(r));
    if(page==='gear'){
     const edges=await b.evaluate('(()=>{const a=document.querySelector(".meta-gsum").getBoundingClientRect(),c=document.querySelector(".meta-bust canvas").getBoundingClientRect();return{summaryTop:a.top,bustBottom:c.bottom};})()');
     assert(edges.bustBottom<=edges.summaryTop+2,'Hero canvas covers gear stats');r.edges=edges;
    }
    await b.shot(path.join(out,page+'-'+lang+'-'+width+'.png'));records.push({id:page,lang,width,height,textSize:150,...r});
   }
   if(width===390&&lang==='en'){
    await b.evaluate('P.Meta.Gear.hide();P.Meta.Attr.show(null,true)');
    const before=await b.evaluate('P.Meta.heroStats("arda")');
    const stat=await b.evaluate('(()=>{const b=document.querySelector(".growth-apply");if(!b)return null;const id=b.closest("[data-stat]").dataset.stat;b.click();return id;})()',true);
    assert(stat,'Earned pre-L3 save needs an actionable rank');const after=await b.evaluate('P.Meta.heroStats("arda")');
    assert.equal(after.attr[stat],before.attr[stat]+1);assert.equal(after.ready[stat],before.ready[stat]-1);
    await b.shot(path.join(out,'earned-rank-applied.png'));records.push({id:'actual-earned-upgrade',source:'earned-upgrade-save: ordinary no-spend L1–2, before allocation',stat,before,after});
    await b.send('Page.reload');await b.until(()=>b.evaluate("!!window.P?.Meta&&P.debug?.state==='title'"),'rank reload');
    assert.equal(await b.evaluate('P.Meta.heroStats("arda").attr['+JSON.stringify(stat)+']'),after.attr[stat]);
   }
   await b.evaluate(`P.Meta.Attr.hide(true);P.Meta.TreeUI.hide();P.Meta.Arsenal.hide();P.Meta.Hub.hide();P.Meta.Gear.hide();P.Meta.close();
    window.planRun=P.createSim(42,{levelIndex:12,tramRhythm:true});P.Progression.debugGrant(planRun,{weapons:{knife:4,chainsaw:1,cardoor:2,extinguisher:1,slingshot:1,cable:1}});
    planRun.recipeFocus='knife';P.Screens.showPause(planRun);document.getElementById('pause-plan').open=true;`,true);
   const plan=await layout(b,'#pause-plan');assert(plan.scroll<=plan.client+2,'Plan controls overflow');assert.equal(plan.buttons,5);
   const beforePlan=await b.evaluate('JSON.stringify({hp:planRun.hero.hp,weapons:planRun.hero.weapons,rerolls:planRun.rerolls})');
   await b.evaluate('document.querySelector("[data-build-plan=chainsaw]").click()',true);
   assert.equal(await b.evaluate('planRun.recipeFocus'),'chainsaw');
   assert.equal(await b.evaluate('JSON.stringify({hp:planRun.hero.hp,weapons:planRun.hero.weapons,rerolls:planRun.rerolls})'),beforePlan);
   await b.shot(path.join(out,'pause-plan-'+lang+'-'+width+'.png'));
   records.push({id:'pause-owned-weapon-plan',lang,width,height,textSize:150,fixture:'Supplied six owned base weapons for layout/action only; no earned-power claim',...plan,actualPlanSelected:'chainsaw',ranksHpRerollsUnchanged:true});
   assert.equal(b.errors.length,0,b.errors.join('\n'));
  }finally{await b.close();}
 }
 fs.writeFileSync('reviews/telemetry/audit8-implementation/interface-checks.json',JSON.stringify({records,scope:'Desktop 390×844 and 320×568, TR/EN text150. Earned save used for upgrade; no phone or unfamiliar-player claim.'},null,2));console.log('24 interface layouts, explicit plan and earned apply/reload passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
