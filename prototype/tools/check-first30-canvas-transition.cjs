// Controlled quality transitions reproduce canvas clearing; fixture timing is explicitly supplied.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {openBrowser}=require('./lib-experiential-browser.cjs'),{recordDOM}=require('./lib-experiential-record.cjs'),{weaponFixture}=require('./lib-audit8-fixtures.cjs');
const tag=process.argv[2],url=process.argv[3],manifestFile=process.argv[4];if(!tag||!url||!manifestFile)throw Error('tag origin manifest required');
const out='reviews/media/R1/first30-reset/canvas-transition-'+tag;fs.mkdirSync(out,{recursive:true});const source=JSON.parse(fs.readFileSync(manifestFile));if(tag.endsWith('live')){source.comparisonBase=source.runtime_manifest_sha256;source.runtime_manifest_sha256=null;source.snapshot=null;source.source='Mutable local workspace newer than the comparison manifest; not frozen-source evidence.';}
(async()=>{const b=await openBrowser(url+'/?level=3&skipintro=1&lang=en');try{
 await b.until(()=>b.evaluate('!!window.P?.debug&&P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'title');await b.evaluate('document.getElementById("btn-start").click()',true);await b.until(()=>b.evaluate('P.debug.state==="play"'),'play');
 await b.evaluate(`(()=>{const s=P.debug.sim;s.hero.x=0;s.hero.y=60;s.hero.invuln=Infinity;s.hero.weapons={};s.enemies=[];P.Horde.step=()=>{};s.milestone.open=true;s.gen.mi=s.gen.marks.length;P.Fx.reset(s);(${weaponFixture})('molotov',3,false);window.canvasChecks=[];
 window.canvasMeasure=()=>{const cv=document.getElementById('game'),d=cv.getContext('2d').getImageData(80,280,240,300).data;let v=0;for(let i=0;i<d.length;i+=64)v+=(d[i]+d[i+1]+d[i+2])/3;return v/(d.length/64)};
 })()`);
 const film=await recordDOM(b,path.join(out,'molotov3-tier-steps.mp4'),async()=>{
  await b.sleep(1600);
  for(const tier of[1,2,0]){const r=await b.evaluate('(()=>{const cv=document.getElementById("game"),before=canvasMeasure(),size=[cv.width,cv.height];P.Quality.set('+tier+');const after=canvasMeasure();const q={before,after,size,nextSize:[cv.width,cv.height],tier:'+tier+',t:P.debug.sim.runT};canvasChecks.push(q);return q})()');
   await b.sleep(900);}
  await b.sleep(1200);return b.evaluate('canvasChecks');
 });
 const facts=film.outcome;if(tag!=='baseline')assert(facts.every(q=>q.before>20&&q.after>20),'An unchanged-size tier step cleared the live world');
 assert.equal(b.errors.length,0);fs.writeFileSync(path.join(out,'index.json'),JSON.stringify({source,fixture:true,provenance:'Exact Molotov3/28 live high-HP target geometry, supplied invulnerability. Explicit actual quality-tier calls at DPR1 isolate the backing-store clearing mechanism; these are not measured frame-load transitions or proof of the old film exact timestamp cause. No fake black frame inserted. Before/after canvas pixels read within the same synchronous tier-change task.',...film,facts,errors:b.errors},null,2)+'\n');console.log(tag,facts);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
