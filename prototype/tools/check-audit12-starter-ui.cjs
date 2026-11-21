// Supplied unlocked profile: menu, layout, cancellation and save/reload; no earned unlock claim.
const {openBrowser}=require(process.cwd()+'/prototype/tools/lib-experiential-browser.cjs');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const tag=process.env.RESET_BUILD||'audit12-integrated9',origin=process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8847';const out='reviews/media/R1/audit12-implementation/'+tag.replace('audit12-','')+'-ui',rows=[];fs.mkdirSync(out,{recursive:true});
for(const [width,lang] of [[390,'en'],[320,'tr']]){const b=await openBrowser(origin+'/?lang='+lang,{width,height:844});
try{await b.until(()=>b.evaluate('P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'ready');
assert.equal(await b.evaluate('P.Meta.setStarter("canister")'),false);
await b.evaluate('P.Meta.debugUnlockAll(); P.Settings.textSize=150;P.Settings.reduceMotion=true;P.Settings.reduceFlash=true;P.applySettings();P.Meta.open(()=>{},"arsenal")');
for(const id of ['knife','nailgun','canister']){
 await b.evaluate(`document.querySelectorAll('.a12-starter')[${['knife','nailgun','canister'].indexOf(id)}].click()`);await b.sleep(950);
 assert.equal(await b.evaluate('P.Meta.starter()'),'knife','Draft is not saved by preview');
 await b.shot(out+'/'+lang+'-'+id+'.png');
}
await b.evaluate('document.querySelector(".a12-starters .meta-btn.secondary").click()');
assert.equal(await b.evaluate('document.querySelector(".a12-starter[aria-pressed=true] strong").textContent'),await b.evaluate('P.t("item.knife")'));
await b.evaluate('document.querySelectorAll(".a12-starter")[1].click();document.querySelector(".a12-starters .meta-btn:not(.secondary)").click()');
assert.equal(await b.evaluate('P.Meta.starter()'),'nailgun');
assert.equal(await b.evaluate('P.Meta.loadout({mode:"normal"}).startWeapon'),'nailgun');
assert.equal(await b.evaluate('P.Meta.loadout({mode:"nightmare"}).startWeapon'),'knife');
assert.equal(await b.evaluate('P.Meta.loadout({mode:"nightshift",nightshift:true}).startWeapon'),'knife');
await b.send('Page.reload');await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"'),'reloaded');
assert.equal(await b.evaluate('P.Meta.starter()'),'nailgun','Saved choice survives reload');
for(const level of [5,15,25]){
 await b.evaluate(`P.Meta.open(()=>{},'rematch:${level}')`);await b.sleep(250);
 assert.equal(await b.evaluate('document.querySelector("[data-variant=alternate]").getAttribute("aria-pressed")'),'true');
 assert.equal(await b.evaluate('getComputedStyle(document.querySelector(".a12-rematch p")).color'),'rgb(52, 49, 58)','Replay description stays readable on the cream sheet');
 await b.shot(out+'/'+lang+'-rematch'+level+'.png');
 await b.evaluate('document.querySelector("[data-variant=standard]").click()');
 assert.equal(await b.evaluate('document.querySelector("[data-variant=standard]").getAttribute("aria-pressed")'),'true');
 await b.evaluate('P.Meta.close()');
}
rows.push({width,lang,largeText:150,reduced:true,fixture:'Disposable unlocked save for menu/save/layout checks; no earned unlock claim',errors:b.errors});assert.equal(b.errors.length,0,b.errors.join('\n'));
}finally{await b.close();}}
fs.writeFileSync(out+'/checks.json',JSON.stringify({source:JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/'+tag+'.json')),records:rows},null,2));console.log(rows);})().catch(e=>{console.error(e);process.exitCode=1;});
