// Original Molotov3 supplied geometry, preserving framebuffer samples beside native and DOM recording.
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
process.argv[2]='arsenal';process.env.AUDIT9_WEAPONS='molotov';process.env.AUDIT9_RANKS='3';process.env.AUDIT9_NO_EVOS='1';process.env.ISTANBUL_NATIVE_CANVAS='1';
let s=fs.readFileSync(path.join(__dirname,'capture-audit8.cjs'),'utf8');
const old="await b.evaluate('auditSamples.length=0;auditEvents.length=0');";
if(!s.includes(old))throw Error('Capture harness changed');
s=s.replace(old,old+`await b.evaluate('(()=>{window.framebufferSamples=[];window.framebufferTimer=setInterval(()=>{const cv=document.getElementById("game"),c=cv.getContext("2d"),d=c.getImageData(Math.floor(cv.width*.15),Math.floor(cv.height*.30),Math.floor(cv.width*.70),Math.floor(cv.height*.45)),a=d.data;let dark=0,sum=0,n=0;for(let i=0;i<a.length;i+=64){const v=.2126*a[i]+.7152*a[i+1]+.0722*a[i+2];sum+=v;if(v<12)dark++;n++;}framebufferSamples.push({wall:Date.now()/1000,t:P.debug.sim.runT,state:P.debug.state,mean:sum/n,dark:dark/n,width:cv.width,height:cv.height});},100)})()');`);
s=s.replace('settings:P.Settings})','settings:P.Settings,framebufferSamples})');
const m=new Module(path.join(__dirname,'reset-blackworld-runtime.cjs'),module);m.filename=path.join(__dirname,'reset-blackworld-runtime.cjs');m.paths=module.paths;m._compile(s,m.filename);
