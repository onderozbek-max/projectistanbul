// Code-native editorial labels, outside the untouched gameplay viewport. Uses the existing local Chrome helper.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{openBrowser}=require('./lib-experiential-browser.cjs');
(async()=>{const file=process.argv[2],rows=JSON.parse(fs.readFileSync(file)),b=await openBrowser('about:blank',{waitForGame:false});try{
 for(const r of rows){
  const data=await b.evaluate(`(()=>{const q=${JSON.stringify(r)},c=document.createElement('canvas');c.width=390;c.height=980;const x=c.getContext('2d');
   x.fillStyle='#15151e';x.fillRect(0,0,390,80);x.fillRect(0,924,390,56);x.fillStyle='#fff';x.font='bold 14px Arial';
   const lines=[];for(const line of q.title.split('\\n')){let s='';for(const w of line.split(' ')){if(x.measureText(s+' '+w).width>370){lines.push(s);s=w;}else s+=(s?' ':'')+w;}lines.push(s);}
   lines.slice(0,4).forEach((s,i)=>x.fillText(s,9,18+i*17));x.fillStyle='#ffd268';x.font='11px Arial';x.fillText(q.footer,8,950);return c.toDataURL('image/png').split(',')[1];})()`);
  fs.writeFileSync(r.file,Buffer.from(data,'base64'));
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
