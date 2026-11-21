// Deterministic cell measurement only; no generated art is repainted or background-keyed.
'use strict';
const fs=require('fs'),{readPng}=require('./lib-art-codecs.js');
const groups=[['boss-acting-audit8',4,['switchkeeper','roaster','linekeeper','bigFisher']],
 ['boss-heavy-audit8',3,['vatman','bellkeeper','dockBride']]];
const defs={};
for(const [sheet,rows,ids] of groups){
 const p=readPng(fs.readFileSync('prototype/assets/landmarks/'+sheet+'.png')),cw=p.w/8,ch=p.h/rows;
 ids.forEach((id,row)=>{
  const frames=[];
  for(let col=0;col<8;col++){
   const x0=Math.ceil(col*cw),y0=Math.ceil(row*ch),w=Math.floor(cw)-1,h=Math.floor(ch)-1;
   let top=h,bottom=0;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(p.rgba[((y0+y)*p.w+x0+x)*4+3]>100){top=Math.min(top,y);bottom=Math.max(bottom,y);}
   let count=0,sum=0;
   for(let y=Math.max(top,bottom-7);y<=bottom;y++)for(let x=0;x<w;x++)if(p.rgba[((y0+y)*p.w+x0+x)*4+3]>100){count++;sum+=x;}
   frames.push([x0,y0,w,h,Math.round(sum/Math.max(1,count)),bottom,top]);
  }
  defs[id]={sheet,metres:id==='dockBride'?2.40:2.55,heightPx:frames[0][5]-frames[0][6],frames};
 });
}
fs.writeFileSync('prototype/js/config-boss-acting.js','// Measured current ImageGen cells; one idle-based unit scale per actor across every pose.\nP.CFG.bossActing = '+JSON.stringify(defs,null,2)+';\n');
fs.writeFileSync('art/commission/generated/2026-11-18-audit8/cell-measurements.json',JSON.stringify(defs,null,2)+'\n');
console.log(Object.fromEntries(Object.entries(defs).map(([id,d])=>[id,{heightPx:d.heightPx,frames:d.frames.length}])));
