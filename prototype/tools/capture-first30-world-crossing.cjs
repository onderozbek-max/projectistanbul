// Correct a diagnostic controller which stopped short of an actual crossing.
// No simulation state, gate, crossing flag, reward or actor outcome is supplied.
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
let code=fs.readFileSync(path.join(__dirname,'capture-audit8.cjs'),'utf8');
const from='const worldSource=original.slice(original.indexOf(\'function prepareWorld(\'),original.indexOf(\'async function actors(\'));';
const to=from.replace('const worldSource','let worldSource')+`\nworldSource=worldSource.replace('const dx=q[0]-s.hero.x,dy=q[1]-s.hero.y', 'if(s.milestone?.lights?.on)q[1]+=.65;const dx=q[0]-s.hero.x,dy=q[1]-s.hero.y');`;
if(!code.includes(from))throw Error('World source loader changed');code=code.replace(from,to).replace('This proves action lifecycle, not ordinary difficulty.','This proves action lifecycle, not ordinary difficulty. Corrected L29 diagnostic input walks .65m beyond each actual illuminated step instead of stopping .35m short; no crossing flag or geometry is supplied.');
if(process.env.AUDIT12_TEXT_HIDDEN){
 const direct='const dx=q[0]-s.hero.x,dy=q[1]-s.hero.y,d=Math.hypot(dx,dy);return d<.35?{x:0,y:0}:{x:dx/d,y:dy/d};';
 const routed='if(Math.hypot(q[0]-s.hero.x,q[1]-s.hero.y)<.35)return{x:0,y:0};const goal=P.WalkPath.nearest(s,{x:q[0],y:q[1]},P.CFG.hero.radius),path=goal&&P.WalkPath.find(s,s.hero,goal,P.CFG.hero.radius),at=path&&path[0]||goal||{x:q[0],y:q[1]},dx=at.x-s.hero.x,dy=at.y-s.hero.y,d=Math.hypot(dx,dy)||1;return{x:dx/d,y:dy/d};';
 code=code.replace(to,to+'\nworldSource=worldSource.replace('+JSON.stringify(direct)+','+JSON.stringify(routed)+');');
 code=code.replace('const limit=Date.now()+65000','const limit=Date.now()+120000');
 code=code.replace('s.hero.y=q[1]-2.7','s.hero.y=q[1]-8');
 code=code.replace('const H=s.gen.tramControl,d=Math.hypot(H.x-s.hero.x,H.y-s.hero.y);return d<.3?{x:0,y:0}:{x:(H.x-s.hero.x)/d,y:(H.y-s.hero.y)/d};',
  'const H=s.gen.tramControl;if(Math.hypot(H.x-s.hero.x,H.y-s.hero.y)<.3)return{x:0,y:0};const path=P.WalkPath.find(s,s.hero,H,P.CFG.hero.radius),p=path&&path[0]||H,x=p.x-s.hero.x,y=p.y-s.hero.y,d=Math.hypot(x,y)||1;return{x:x/d,y:y/d};');
 code=code.replace('window.worldMove=P.Input.get;',`if(\u0024{level}>20){s.loadout.kaanJoined=true;P.Companion.init(s);}
   document.getElementById('hud').style.visibility='hidden';
   CanvasRenderingContext2D.prototype.fillText=function(){};CanvasRenderingContext2D.prototype.strokeText=function(){};
   if(P.Speech){P.Speech.drawPlain=function(){};P.Speech.drawBanners=function(){};}
   window.worldMove=P.Input.get;`);
 code=code.replace('Position supplied at the first real required target;', 'Text-hidden composition review only: HUD/canvas lettering/speech drawing suppressed, joined-companion precondition supplied for21+, initial hero8m before the first required target; L1 remains a Cook-pocket fixture, not an opening-aperture walkthrough;');
}
const m=new Module(path.join(__dirname,'reset-world-crossing-runtime.cjs'),module);m.filename=path.join(__dirname,'reset-world-crossing-runtime.cjs');m.paths=module.paths;m._compile(code,m.filename);
