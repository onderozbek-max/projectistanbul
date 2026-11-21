// Read the actual completed static fixture; virtual-time CLI dumping can stop during file loading.
'use strict';
const path=require('node:path'),{pathToFileURL}=require('node:url');
const {openBrowser}=require('./lib-experiential-browser.cjs');
(async()=>{
 const url=pathToFileURL(path.join(__dirname,'enemy-lineup.html')).href+'?mode=masks';
 const b=await openBrowser(url,{waitForGame:false});
 try{
  await b.until(()=>b.evaluate('document.body?.dataset.done==="1"'),'completed enemy mask fixture',90000);
  if(b.errors.length)throw Error(b.errors.join('\n'));
  process.stdout.write(await b.evaluate('document.getElementById("out").textContent'));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
