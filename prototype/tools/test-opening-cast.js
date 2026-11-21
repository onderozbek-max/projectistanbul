// Regression: distinct opening identities, adult scale through conversion, and no corpse identity leak across runs.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {loadP,ROOT}=require('./lib-load'),game=loadP(),{readPng}=require('./lib-art-codecs');
const image={src:'restaurant-cast'},K=game.CFG.experience.openingCast;
const loadedKeys=[];game.StreetArt={image(key){loadedKeys.push(key);return image;}};
vm.runInNewContext(fs.readFileSync(ROOT+'/js/view/civilian-acting.js','utf8'),{P:game});
const draws=[],c={globalAlpha:1,save(){},restore(){},translate(){},scale(){},rotate(){},drawImage(...a){draws.push(a);}};
const A=game.CivilianActing,first={id:1,type:'diner',dinerIndex:0,state:'dormant'},second={id:2,type:'diner',dinerIndex:1,state:'dormant'};
A.diner(c,first,{stopped:true},0,0,40,1);A.diner(c,second,{stopped:true},0,0,40,1);
A.restaurant(c,0,0,40,1,2,0);
assert.deepEqual(draws.map(d=>d[2]),[0,256,512],'Three different identity rows, rather than one repeated human');
assert(draws.every(d=>Math.abs(d[8]-draws[0][8])<1e-9),'Shared scale rather than friend/adversary legacy units');
first.state='turning';A.diner(c,first,{stopped:true},0,0,40,1);assert.equal(draws.at(-1)[1],256);
first.state='active';first.walk=.8;A.diner(c,first,{stopped:false},0,0,40,1);
assert([768,1024].includes(draws.at(-1)[1]));assert.equal(draws.at(-1)[2],0);
assert.equal(draws.at(-1)[8],draws[0][8],'Conversion never renormalizes body size');
assert(A.restaurantCorpse(c,{etype:'diner',id:2,t:.2,T:.55},1,1,0,0,40));
assert.equal(draws.at(-1)[1],1280);assert.equal(draws.at(-1)[2],256,'Blue-shirt customer keeps his own fallen pose');
A.resetResidents();assert(!A.restaurantCorpse(c,{etype:'diner',id:2,t:0,T:1},1,1,0,0,40),'An ID reused in a later level cannot inherit the restaurant identity');
assert(!A.diner(c,{id:5,type:'diner',state:'active'},{},0,0,40,1),'Ordinary nonresident enemy behavior stays unchanged');
const png=readPng(fs.readFileSync(ROOT+'/assets/streets/restaurant-cast-v2.png'));
assert.equal(png.w,1536);assert.equal(png.h,768);
const pixels=png.data||png.rgba;assert(pixels,'Decoded RGBA available');
function bounds(row,col){let top=256,bottom=0,left=256,right=0;
 for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(pixels[((row*256+y)*png.w+col*256+x)*4+3]>=32){top=Math.min(top,y);bottom=Math.max(bottom,y+1);left=Math.min(left,x);right=Math.max(right,x+1);}
 return{height:bottom-top,top,bottom,left,right};}
const alive=[0,1,2].map(row=>bounds(row,0));
assert(alive.every(b=>Math.abs(b.height-K.height)<=1&&b.bottom===K.pivotY),'Actual alpha crown/sole dimensions are equal, not just the cell rectangles');
for(let row=0;row<2;row++)for(let col=1;col<5;col++)assert(Math.abs(bounds(row,col).height-K.height)<=4,'Pose/identity retains adult size');
for(let row=0;row<6;row++){
 A.draw(c,0,0,A.height(40),1,0,false,false,row);const idle=draws.at(-1);
 A.draw(c,0,0,A.height(40),1,0,true,false,row);const run=draws.at(-1);
 assert.equal(idle[2],row*256);assert.equal(run[2],row*256,'Standing and running keep the same assigned identity');
 assert.deepEqual(loadedKeys.slice(-2),['civilian-idle','civilian-runners']);
 assert.equal(idle[8],run[8],'Stopping must not shrink a civilian');
}
assert(!loadedKeys.includes('restaurant-patron'),'Generic people must never revive the retired shared man');
const stopped={x:0,y:0,walk:3};A.moving(stopped,0);
assert(!A.moving(stopped,1),'Accumulated walk distance does not mean a person is still running');
stopped.x=.1;assert(A.moving(stopped,2));assert(A.moving(stopped,2),'Frozen clock retains the displayed stride');
assert(!A.moving(stopped,3),'A stopped person returns to their own standing pose');
console.log('PASS distinct restaurant cast, actual painted adult heights, conversion/death identity and fresh-run cache');
