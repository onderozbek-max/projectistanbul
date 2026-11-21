// Every authored first30 page/conditional Captain page at the smallest portrait and largest text.
// Direct page-open fixture, native Enter progression, sampled full text; not an earned trigger or emotional acceptance.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{openBrowser}=require('./lib-experiential-browser.cjs');
const tag=process.env.RESET_BUILD||'candidate12',out='reviews/media/R1/first30-reset/'+tag+'-comics';fs.mkdirSync(out,{recursive:true});
const source=JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/'+tag+'.json')),records=[],readings=[];
async function enter(b){await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await b.sleep(140);}
(async()=>{for(const lang of ['tr','en']){
 const b=await openBrowser((process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8819')+'/?lang='+lang,{width:320,height:568});try{
  await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"&&P.ComicArt.ready&&P.ComicRaster.ready()'),'native page art/fonts');
  await b.evaluate('P.Settings.textSize=150;P.Settings.reduceMotion=true;P.applySettings()');
  const inventory=await b.evaluate(`(()=>{const pages=[],beats=[];for(let level=1;level<=30;level++)for(const when of ['intro','start','mid','boss','end']){const beat=P.Story.beat(level,when);if(!beat)continue;beats.push({level,when,...beat});if(beat.kind==='page')pages.push(...[].concat(beat.id));}pages.push('captain_end_covered','captain_end_market');return{pages:[...new Set(pages)],beats}})()`);
  readings.push({lang,...await b.evaluate('('+function(inv){function line(id){return{id,portrait:P.Story.forLine(id),variants:P.DLG[P.lang][id]};}return{opening:['s1','s2','s3','s4','rule1','rule2','rule3'].map(line),beats:inv.beats.map(b=>({...b,reading:b.kind==='page'?[].concat(b.id).map(id=>({id,panels:P.Story.pages[id].panels.map(p=>({background:p.bg,actors:p.ch,lines:p.it.filter(x=>typeof x[1]==='string'&&P.DLG.beats[x[1]]).map(x=>line(x[1]))}))})):b.kind==='call'?b.lines.map(line):[line(b.line),...(b.reply?[line(b.reply)]:[])]}))};}+')('+JSON.stringify(inventory)+')')});
  for(const id of inventory.pages){await b.evaluate('window.comicEnded=false;P.Comic.page('+JSON.stringify(id)+',()=>window.comicEnded=true)');await b.until(()=>b.evaluate('!!document.querySelector(".cm-panel")'),'page '+id);
   const shots=[],seen=new Set();let steps=0;
   while(await b.evaluate('!window.comicEnded')&&steps++<80){await enter(b);const state=await b.evaluate('(()=>{const r=document.querySelector(".cm-page");return r?{text:r.querySelector(".cm-sr").textContent,revealed:r.querySelectorAll(".cm-panel.in").length,notice:!!r.querySelector(".cm-art-notice")}:null})()');if(!state)break;assert(!state.notice,'Current illustrated art unavailable '+id);const key=state.revealed+'|'+state.text;if(!seen.has(key)){seen.add(key);const file=lang+'-'+id+'-'+shots.length+'.png';await b.shot(path.join(out,file));shots.push({file,...state});}}
   assert(await b.evaluate('window.comicEnded'),'Page did not release '+id);records.push({id,lang,width:320,height:568,textSize:150,reducedMotion:true,fixture:true,shots,steps});console.log(lang,id,shots.length);
  }
  const audit=await b.evaluate('P.Comic.audit()');fs.writeFileSync(path.join(out,lang+'-layout-audit.json'),JSON.stringify(audit.filter(r=>inventory.pages.some(id=>r.id===id||r.id.startsWith(id+' #'))),null,2)+'\n');assert.equal(b.errors.length,0,b.errors.join('\n'));
 }finally{await b.close();}
}
fs.writeFileSync(path.join(out,'index.json'),JSON.stringify({source,method:'All authored first30 page IDs and two factual Captain-help variants; direct page open at320x568, text150, native TR/EN, actual Enter progression and current assets. Still samples and measured layout, not continuous performance, normal earned triggers or a native editor verdict.',records},null,2)+'\n');fs.writeFileSync('reviews/telemetry/first30-reset/'+tag+'-native-trigger-order.json',JSON.stringify({source,method:'Authored Story.beat scheduling in level/trigger order; opening and all line variants retained per native language. A scheduled optional beat is not evidence that every run speaks it. Actual earned events are in the separate journey.',readings},null,2)+'\n');console.log('Complete first30 comic/native inventory.');
})().catch(e=>{console.error(e);process.exitCode=1});
