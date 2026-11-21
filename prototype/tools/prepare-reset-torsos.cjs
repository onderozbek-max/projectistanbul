// Mechanical atlas extraction only; original ImageGen alpha and source file are retained.
'use strict';
const fs=require('node:fs'),{readPng,encodePng,renderRegion}=require('./lib-art-image');
const file='prototype/assets/landmarks/first30-reset/boss-torsos-v2.png',raw='art/commission/in/first30-reset/boss-torsos-v2.png';
if(!fs.existsSync(raw))fs.copyFileSync(file,raw);
const img=readPng(fs.readFileSync(raw)),s=renderRegion(img,{x0:0,y0:0,x1:img.w,y1:img.h},1024/img.w),cells={};
const ids=['cook','switchkeeper','roaster','linekeeper','vatman','bellkeeper','dockBride','bigFisher','quayCaptain','ticketMan'];
ids.forEach((id,i)=>{const xa=Math.round(i%4*s.w/4),xb=Math.round((i%4+1)*s.w/4),ya=Math.round(Math.floor(i/4)*s.h/3),yb=Math.round((Math.floor(i/4)+1)*s.h/3);let l=xb,r=xa,t=yb,b=ya;
for(let y=ya;y<yb;y++)for(let x=xa;x<xb;x++)if(s.rgba[(y*s.w+x)*4+3]>40){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}cells[id]=[l,t,r-l+1,b-t+1];});
fs.writeFileSync(file,encodePng(s.w,s.h,s.rgba));fs.writeFileSync('prototype/js/config-boss-torsos.js','// Closed shoulder artwork, measured from the authorized ImageGen repair.\nP.CFG.bossTorsos='+JSON.stringify({file:file.slice(10),cells})+';\n');
console.log(cells);
