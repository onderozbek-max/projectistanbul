'use strict';
const fs=require('node:fs'),path=require('node:path'),{readPng,encodePng,renderRegion}=require('./lib-art-image');
const file='prototype/assets/landmarks/first30-reset/boss-controls-v1.png',raw='art/commission/in/first30-reset/boss-controls-v1.png';
if(!fs.existsSync(raw)){fs.mkdirSync(path.dirname(raw),{recursive:true});fs.copyFileSync(file,raw);}
const img=readPng(fs.readFileSync(raw)),small=renderRegion(img,{x0:0,y0:0,x1:img.w,y1:img.h},1024/img.w),cells=[];
for(let i=0;i<4;i++){
 let x0=Math.round(i*small.w/4),x1=Math.round((i+1)*small.w/4),left=x1,top=small.h,right=x0,bottom=0;
 for(let y=0;y<small.h;y++)for(let x=x0;x<x1;x++)if(small.rgba[(y*small.w+x)*4+3]>40){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 cells.push([left,top,right-left+1,bottom-top+1]);
}
fs.writeFileSync(file,encodePng(small.w,small.h,small.rgba));
fs.writeFileSync('prototype/js/config-boss-controls.js','// Measured bounds for authorized ImageGen handheld mechanism controls.\nP.CFG.bossControls='+JSON.stringify({file:file.slice(10),cells})+';\n');
console.log({cells,size:[small.w,small.h]});
