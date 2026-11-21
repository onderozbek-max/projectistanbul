// Correct the supplied quiet health fixture; do not count an ambient-damaged food pickup as saved food.
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
let s=fs.readFileSync(path.join(__dirname,'capture-first30-feedback.cjs'),'utf8');
const anchor='const m=new Module(';
if(!s.includes(anchor))throw Error('Feedback adapter changed');
s=s.replace(anchor,`replace("P.Horde.step=()=>{};if(s.env)","P.Horde.step=()=>{};P.Director.step=()=>{};if(s.env)");
replace("return b.evaluate(\\\"({saved:P.debug.sim.drops.some(d=>d.kind==='simit'),gains:auditEvents.filter(e=>e.type==='pickup'&&e.healed>0).map(e=>e.healed)})\\\");", "const saved=await b.evaluate(\\\"P.debug.sim.drops.some(d=>d.kind==='simit')&&P.debug.sim.hero.hp===P.debug.sim.hero.maxHp\\\");assert(saved,'Full-health food must remain, with actual full health');await b.evaluate(\\\"(()=>{const s=P.debug.sim;s.hero.invuln=0;s.hero.iframes=0;P.Combat.damageHero(s,20,'walker',{type:'walker',x:s.hero.x+1,y:s.hero.y});})()\\\");await b.sleep(600);const healedAfter=await b.evaluate(\\\"P.debug.sim.hero.hp===P.debug.sim.hero.maxHp&&!P.debug.sim.drops.some(d=>d.kind==='simit')\\\");assert(healedAfter,'Previously saved food must heal actual later injury');await b.shot(path.join(out,'health-saved-food-used-after-injury.png'));return{savedAtFullHealth:saved,healedAfterActualInjury:healedAfter};");
replace("Quiet supplied L3 lane; supplied HP", "Supplied L3 lane with ambient Horde/Director spawning disabled in this page fixture; actual Combat damage/food/shield logic and renderer unchanged; supplied HP");
`+anchor);
const m=new Module(path.join(__dirname,'audit11-health-fixture-runtime.cjs'),module);m.filename=path.join(__dirname,'audit11-health-fixture-runtime.cjs');m.paths=module.paths;m._compile(s,m.filename);
