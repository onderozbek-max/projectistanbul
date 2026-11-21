// Exercise the production render hook: cosmetic fill yields to bodies/hostile geometry; real projectiles stay truthful.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{openBrowser}=require('./lib-experiential-browser.cjs');
const out='reviews/telemetry/audit11-implementation/final8-clarity.json';
(async()=>{const b=await openBrowser('http://127.0.0.1:8833/?lang=en&skipintro=1');try{
 await b.until(()=>b.evaluate('P.debug.state==="title"&&P.ArtRaster.heroState()==="ready"'),'ready');
 await b.evaluate('document.getElementById("btn-start").click()');await b.until(()=>b.evaluate('P.debug.state==="play"'),'play');
 const facts=await b.evaluate(`(()=>{const c=document.createElement('canvas');c.width=390;c.height=844;const ctx=c.getContext('2d'),R={ctx,W:390,H:844,ppm:30,X:x=>195+x*30,Y:y=>422-y*30};
 const saved={};Object.keys(R).forEach(k=>{saved[k]=P.Render[k];P.Render[k]=R[k];});
 const s={hero:{x:0,y:0,hp:19,maxHp:100,weapons:{knife:5,chain:5,canister:5,molotov:5,nailgun:5,sledge:5}},enemies:[{boss:true,x:3,y:5}],enemyTele:[{kind:'lane',x:-4,y:3,dx:0,dy:1,len:3,w:1}]};
 const original=P.WFx.drawParts,projectile=P.WFx.drawProjectiles;
 const pixel=(x,y)=>Array.from(ctx.getImageData(R.X(x),R.Y(y),1,1).data);
 const fill=()=>{ctx.fillStyle='#ffffff';ctx.fillRect(0,0,390,844);};const base=()=>{ctx.fillStyle='#14151f';ctx.fillRect(0,0,390,844);};
 P.WFx.drawParts=fill;base();P.Render.hook(P.WFx,'drawParts',s);
 const protectedPixels={hero:pixel(0,.7),boss:pixel(3,6),danger:pixel(-4,4),open:pixel(4,0)};
 P.WFx.drawProjectiles=fill;base();P.Render.hook(P.WFx,'drawProjectiles',s);const realProjectile= pixel(0,.7);
 P.WFx.drawParts=original;P.WFx.drawProjectiles=projectile;Object.assign(P.Render,saved);
 return{protectedPixels,realProjectile,source:'Production Render.hook/CombatClarity with an adversarial opaque cosmetic fill and real-projectile pass. Supplied six-weapon/critical/boss/lane state. Pixel probe only, not a motion/recognition verdict.'};})()`);
 for(const key of['hero','boss','danger'])assert.deepEqual(facts.protectedPixels[key],[20,21,31,255],key+' must retain the original body/danger pixels');
 assert.notDeepEqual(facts.protectedPixels.open,[20,21,31,255],'Cosmetic effect must still draw outside the protected region');assert.deepEqual(facts.realProjectile,[255,255,255,255],'Real physical projectile must not be masked by this cosmetic filter');assert.equal(b.errors.length,0);
 fs.writeFileSync(out,JSON.stringify({source:JSON.parse(fs.readFileSync('reviews/telemetry/first30-reset/audit11-candidate8.json')),facts},null,2)+'\n');console.log('PASS real renderer preserves body/danger pixels through opaque friendly cosmetic bursts; physical projectiles unchanged.');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
