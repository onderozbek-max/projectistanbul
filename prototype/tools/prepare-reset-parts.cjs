// Mechanical alpha/cell extraction only. The artwork is generated through the authorized ImageGen workflow.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {readPng,encodePng,renderRegion}=require('./lib-art-image');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'prototype/assets/landmarks/first30-reset');
const ids=process.argv.slice(2),out={},version=process.env.RESET_PARTS_VERSION||'1';
for(const id of ids){
 const name=id+'-parts-v'+version+'.png',file=path.join(dir,name),raw=fs.readFileSync(file);
 const saved=path.join(root,'art/commission/in/first30-reset',name);
 fs.mkdirSync(path.dirname(saved),{recursive:true});if(!fs.existsSync(saved))fs.writeFileSync(saved,raw);
 const img=readPng(fs.readFileSync(saved)),small=renderRegion(img,{x0:0,y0:0,x1:img.w,y1:img.h},1024/img.w);
 const cells=[];
 for(let i=0;i<12;i++){
  const x0=Math.round(i%4*small.w/4),x1=Math.round((i%4+1)*small.w/4),y0=Math.round(Math.floor(i/4)*small.h/3),y1=Math.round((Math.floor(i/4)+1)*small.h/3);
  let left=x1,top=y1,right=x0,bottom=y0;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(small.rgba[(y*small.w+x)*4+3]>40){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
  if(right<=left||bottom<=top)throw Error(id+' empty part'+i);
  cells.push([left,top,right-left+1,bottom-top+1]);
 }
 fs.writeFileSync(file,encodePng(small.w,small.h,small.rgba));out[id]={file:'assets/landmarks/first30-reset/'+name,size:[small.w,small.h],cells};
}
const meta=path.join(root,'reviews/telemetry/first30-reset/parts-extraction.json');
const old=fs.existsSync(meta)?JSON.parse(fs.readFileSync(meta)):{};Object.assign(old,out);fs.writeFileSync(meta,JSON.stringify(old,null,2)+'\n');
const cfg='// Measured alpha bounds for authorized ImageGen anatomical parts; not simulation tuning.\nP.CFG.bossParts = '+JSON.stringify(old)+';\n';
fs.writeFileSync(path.join(root,'prototype/js/config-boss-parts.js'),cfg);console.log('Prepared',ids.join(', '));
