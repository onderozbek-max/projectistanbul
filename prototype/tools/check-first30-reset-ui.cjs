// Current actual DOM with disclosed populated fixtures. Earned growth proof is separately indexed.
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
let source=fs.readFileSync(path.join(__dirname,'check-audit9-ui.cjs'),'utf8');
function replace(a,b){if(!source.includes(a))throw Error('UI harness changed: '+a);source=source.replace(a,b);}
replace("const out=path.resolve('reviews/media/R1/audit9-implementation/interface-'+tag)","const out=path.resolve('reviews/media/R1/first30-reset/interface-'+tag)");
replace("'reviews/telemetry/audit9-implementation/ui-checks-'+tag+'.json'","'reviews/telemetry/first30-reset/ui-checks-'+tag+'.json'");
replace("await tap(b,'#btn-pause');","await tap(b,'#btn-pause');await b.evaluate('(()=>{const old=P.Screens.showCards;P.Screens.showCards=function(){window.resetOfferArgs=Array.from(arguments);return old.apply(this,arguments)}})()');");
replace("await tap(b,'.build-detail button');",`const caption=await b.evaluate('getComputedStyle(document.querySelector(".build-detail .caption")).color');
 assert.equal(caption,'rgb(52, 49, 58)','Build explanation must retain dark readable text');await tap(b,'.build-detail button');`);
replace(' return shapes;',` const scroll=await b.evaluate('(()=>{const e=document.getElementById("scr-cards");e.scrollTop=250;const before=e.scrollTop;P.Screens.showCards.apply(P.Screens,resetOfferArgs);return{before,after:e.scrollTop}})()');
 assert.equal(scroll.after,scroll.before,'Inspecting the same offer preserves its scroll');
 const fresh=await b.evaluate('(()=>{const args=resetOfferArgs.slice();args[1]=Object.assign({},args[1]);P.Screens.showCards.apply(P.Screens,args);return{scroll:document.getElementById("scr-cards").scrollTop,focus:document.activeElement.id}})()');
 assert.equal(fresh.scroll,0,'A new offer starts at its heading');assert.equal(fresh.focus,'cards-title');
 records.push({id:'new-offer-scroll-focus',rank,evolved,scroll,fresh,caption});return shapes;`);
const mod=new Module(path.join(__dirname,'first30-reset-ui-runtime.cjs'),module);mod.filename=path.join(__dirname,'first30-reset-ui-runtime.cjs');mod.paths=module.paths;mod._compile(source,mod.filename);
