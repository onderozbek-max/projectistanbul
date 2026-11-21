// Additional local actual-damage and overlap diagnostics, with every supplied precondition disclosed.
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
let s=fs.readFileSync(path.join(__dirname,'capture-audit8.cjs'),'utf8');
function replace(a,b){if(!s.includes(a))throw Error('Feedback harness changed: '+a);s=s.replace(a,b);}
replace("'spitter','zehirli','screamer','bloater','kasap','parkur'","'spitter','screamer','bloater','parkur'");
replace("async function health(b){",`async function health(b){`);
replace("await capture(b,'health-critical-heal-full',async()=>{",`if(process.env.RESET_HIDE_HUD)await b.evaluate('document.getElementById("hud").style.visibility="hidden"');
 await capture(b,'health-critical-heal-full',async()=>{
  for(const [label,dmg,cause,source]of [['light',4,'walker',{type:'walker',x:1,y:60}],['heavy',19,'walker',{type:'walker',x:-1,y:60}],['offscreen-source',8,'spitter',{type:'spitter',x:12,y:60}],['hazard-tick',4,'acid',null]]){
   await b.evaluate('(()=>{const s=P.debug.sim;s.hero.invuln=0;s.hero.iframes=0;P.Combat.damageHero(s,'+dmg+','+JSON.stringify(cause)+','+JSON.stringify(source)+');})()');
   await b.sleep(700);await b.shot(path.join(out,'health-'+label+'.png'));
  }
  await b.evaluate('P.debug.sim.hero.hp=P.debug.sim.hero.maxHp');`);
replace("'Quiet supplied L3 lane; real positive damage,", "'Quiet supplied L3 lane; supplied HP reset after real light/heavy/offscreen-source/hazard damage probes, HUD hidden when declared; real positive damage,");
replace("P.Progression.addXp=()=>{};\n })()`);\n const row=await capture(b,'dense-six-slots'",`P.Progression.addXp=()=>{};
  h.hp=h.maxHp*.19;s.sk.frenzyT=P.CFG.skills.frenzy.time;s.events.push({type:'frenzy',on:true,t:s.sk.frenzyT});
  const boss=P.Bosses.spawn(s,'brute',h.x+2.8,h.y+4,{preset:'linekeeper',hoodIdx:0,nameKey:'boss.linekeeper'});s.gen.boss=boss;s.gen.arena=true;
  P.Env.addSolid(s,'crates',-2.6,h.y+2,1.1,.8);
 })()\u0060);\n const row=await capture(b,'dense-six-slots'`);
replace("'Supplied legal six weapon/six passive slots at rank5, 64", "'Supplied actual critical HP/frenzy/Linekeeper/crate overlap, legal six weapon/six passive slots at rank5, 64");
const m=new Module(path.join(__dirname,'reset-feedback-runtime.cjs'),module);m.filename=path.join(__dirname,'reset-feedback-runtime.cjs');m.paths=module.paths;m._compile(s,m.filename);
