// Mechanical resampling and measured alpha bounds only; ImageGen owns every painted pixel.
'use strict';
const fs=require('node:fs'),{readPng,renderRegion,encodePng}=require('./lib-art-image');
const raw='art/commission/in/first30-reset/kaan/kaan-parts-v2.png',dest='prototype/assets/landmarks/first30-reset/kaan-parts-v2.png';
const im=readPng(fs.readFileSync(raw)),p=renderRegion(im,{x0:0,y0:0,x1:im.w,y1:im.h},1024/im.w),cells=[];
for(let i=0;i<16;i++){const x0=Math.round(i%4*p.w/4),x1=Math.round((i%4+1)*p.w/4),y0=Math.round(Math.floor(i/4)*p.h/4),y1=Math.round((Math.floor(i/4)+1)*p.h/4);let l=x1,r=x0,t=y1,b=y0;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(p.rgba[(y*p.w+x)*4+3]>40){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}if(r<=l||b<=t)throw Error('Empty part '+i);cells.push([l,t,r-l+1,b-t+1]);}
fs.writeFileSync(dest,encodePng(p.w,p.h,p.rgba));
const data={file:dest.slice(10),cells,style:{height:1.33,wide:.4875,stride:1,hip:.615,torso:.4125,head:.30,arm:.2625,forearm:.255,thigh:.2775,shin:.2925,tool:.5025,grip:[.5,.08],tip:[.5,.91],footBase:[-.09,.09],hipOffset:[-.09,.10],ankleHeight:.06,contactShare:.30,stepReach:.17,stepLift:.08,sameArms:true,forearmAnchors:[.17,.16,.77,.70]}};
fs.writeFileSync('prototype/js/config-kaan-parts.js','// Current ImageGen Kaan identity, movable cutouts; no simulation or narrative changes.\nP.CFG.kaanParts='+JSON.stringify(data)+';\n');console.log('Prepared16 actual alpha-bounded Kaan parts.');
