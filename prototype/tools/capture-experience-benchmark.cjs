// Three standard measured scenes; desktop-only and deliberately run after the other captures finish.
'use strict';
const fs=require('node:fs'),{openBrowser}=require('./lib-experiential-browser.cjs');
(async()=>{const b=await openBrowser((process.env.ISTANBUL_PREVIEW||'http://127.0.0.1:8775')+'/?bench=1&art=raster&lang=en');try{
 await b.until(()=>b.evaluate("P.ArtRaster.heroState()==='ready'&&!!document.getElementById('bench-start')"),'benchmark ready');
 await b.evaluate("window.benchRecords=[];const log=P.Tel.log;P.Tel.log=function(name,data){if(name.startsWith('bench_'))benchRecords.push({event:name,...data});return log.apply(this,arguments);};document.getElementById('bench-start').click()",true);
 await b.until(()=>b.evaluate("benchRecords.filter(r=>r.event==='bench_result').length===3||benchRecords.some(r=>r.event==='bench_interrupted')"),'three desktop scenes',240000);
 const records=await b.evaluate('benchRecords'),complete=records.filter(r=>r.event==='bench_result').length===3&&!records.some(r=>r.event==='bench_interrupted');
 const source=process.env.AUDIT8_MANIFEST?JSON.parse(fs.readFileSync(process.env.AUDIT8_MANIFEST)):null;
 fs.writeFileSync(process.env.AUDIT8_BENCH||'reviews/telemetry/experiential/desktop-benchmark.json',JSON.stringify({source,complete,platform:'Desktop Chrome headless, Mac, 390x844 DPR1, approved raster art; not physical phone proof',browserErrors:b.errors,records},null,2)+'\n');
 if(!complete||b.errors.length)throw Error('Benchmark did not complete all three active scenes; see exported interruption/errors.');
 console.log('desktop benchmark exported');}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
