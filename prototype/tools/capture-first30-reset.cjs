// Reuse existing capture/fixtures with explicit adversarial movement, target loss and pause phases.
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
if(process.env.RESET_ADVANCED&&process.env.AUDIT9_WEAPONS==='')throw Error('Empty advanced roster is not coverage');
let source=fs.readFileSync(path.join(__dirname,'capture-audit8.cjs'),'utf8');
function replace(a,b){if(!source.includes(a))throw Error('Capture harness changed: '+a);source=source.replace(a,b);}
const action=`async function weaponActions(b){
 const phases=[];async function phase(name,input,ms){phases.push({name,wall:Date.now()/1000,t:await b.evaluate('P.debug.sim.runT')});
  if(input)await b.evaluate('P.Input.get=()=>('+JSON.stringify(input)+')');await b.sleep(ms);}
 await phase('stationary real contacts',null,2200);
 await phase('diagonal travel',{x:.70,y:.70},1400);
 await phase('reverse and rear approach',{x:-.70,y:-.70},1400);
 await phase('Dash while moving',{x:.70,y:.70,dash:true},450);
 await phase('release Dash; sideways movement',{x:-1,y:0},900);
 await b.evaluate('window.resetTargets=P.debug.sim.enemies;P.debug.sim.enemies=[]');
 await phase('target loss and miss',{x:0,y:0},1700);
 await b.evaluate('P.debug.sim.enemies=resetTargets;const h=P.debug.sim.hero;P.debug.sim.enemies.forEach((e,i)=>{const a=i*2.399;e.x=h.x+Math.cos(a)*(i<8?1.1:3);e.y=h.y+Math.sin(a)*(i<8?1.1:3)});');
 await phase('reacquisition and multi-hit',{x:0,y:0},2400);
 await b.evaluate('document.getElementById("btn-pause").click()');
 const before=await b.evaluate('P.debug.sim.runT');await b.sleep(900);
 if(await b.evaluate('P.debug.sim.runT')!==before)throw Error('Pause advanced weapon clock');
 await b.evaluate('document.getElementById("btn-resume").click()');
 await phase('resumed contact',{x:0,y:0},1900);
 const e=await b.evaluate('P.debug.sim.enemies.find(e=>!e.dead)?.id');
 if(e)await b.evaluate('(()=>{const s=P.debug.sim,e=s.enemies.find(e=>e.id==='+e+');if(e)P.Combat.damageEnemy(s,e,e.hp*2,1,0,0,false,"knife")})()');
 await phase('supplied mid-action target death; recovery',{x:.70,y:-.70},1300);
 return{phases,casesNotInClip:['Boss contact and prop contact are indexed separately; not inferred from these walkers.'],input:'Supplied P.Input.get movement plus actual pause/resume controls; not ordinary or earned play.'};
}
`;
replace('async function arsenal(b){',action+'\nasync function arsenal(b){');
replace("async()=>{await b.sleep(6500);}","async()=>weaponActions(b)");
replace("async()=>{await b.sleep(10000);}","async()=>weaponActions(b)");
replace("Full ordinary HUD.'","Full ordinary HUD. Adversarial sequence: stationary/diagonal/reverse/Dash/lost-target/miss/reacquire/pause/mid-action supplied death. Boss/prop coverage remains separate.'");
replace("if(checkActive){assert", "if(checkActive&&mode!=='arsenal'){assert");
// Passive rank labels are supplied only for their actual conditional fixtures. No unlock or earned claim.
replace("const old=index.findIndex", "const old=index.findIndex");
if(process.env.RESET_ADVANCED){
 process.env.AUDIT9_RANKS='5';process.env.AUDIT9_NO_EVOS='1';
 replace('evo:Object.keys(P.CFG.evolutions)','evo:Object.keys(P.CFG.evolutions),unlock:P.CFG.unlock.weapons');
 replace("await start(b);await quiet(b);await b.evaluate('('+weaponFixture+')('+JSON.stringify(id)+','+rank+',false)');",`await start(b,Math.max(3,roster.unlock[id]||1));await quiet(b);await b.evaluate('('+weaponFixture+')('+JSON.stringify(id)+','+rank+',false)');
  await b.evaluate('(()=>{const s=P.debug.sim,id='+JSON.stringify(id)+',branch='+JSON.stringify(process.env.RESET_ADVANCED)+';s.hero.mods={[id]:[id+"."+branch,id+"."+branch+"1"]};s.loadout=s.loadout||{};s.loadout.mastery={[id]:5};P.Weapons.state(s).acts={[id]:4};s.hero.cds[id]=2.5;})()');`);
 replace("'weapon-'+id+'-r'+rank","'weapon-'+id+'-r'+rank+'-fork-'+process.env.RESET_ADVANCED+'-mastery5'");
 replace('Named supplied base/rank only;','Supplied legal-unlock level, rank5, actual '+process.env.RESET_ADVANCED+'/'+process.env.RESET_ADVANCED+'1 fork IDs, mastery5 and four prior action counts so the real next signature can be inspected. Not earned mastery or a natural-frequency claim. Named supplied base/rank only;');
}
if(process.env.RESET_LEGAL_ROSTER&&!process.env.RESET_ADVANCED){
 replace('evo:Object.keys(P.CFG.evolutions)','evo:Object.keys(P.CFG.evolutions),unlock:P.CFG.unlock.weapons,evolutionDefs:P.CFG.evolutions');
 replace("await start(b);await quiet(b);await b.evaluate('('+weaponFixture+')('+JSON.stringify(id)+','+rank+',false)');","await start(b,Math.max(3,roster.unlock[id]||1));await quiet(b);await b.evaluate('('+weaponFixture+')('+JSON.stringify(id)+','+rank+',false)');");
 replace("await start(b);await quiet(b);await b.evaluate('('+weaponFixture+')('+JSON.stringify(id)+',5,true)');","await start(b,Math.max(12,roster.unlock[roster.evolutionDefs[id].from]||1));await quiet(b);await b.evaluate('('+weaponFixture+')('+JSON.stringify(id)+',5,true)');");
 replace('Named supplied base/rank only;','Actual legal-unlock level; supplied base/rank only;');
 replace('Supplied evolution and 28 real high-HP targets;','Actual legal base-unlock level (minimum12 for conditional scenery); supplied evolution and28 real high-HP targets;');
}
if(process.env.RESET_MOD_TAIL&&process.env.RESET_MOD_TAIL!=='1'){
 source=source.replaceAll('branch+"1"','branch+'+JSON.stringify(process.env.RESET_MOD_TAIL));
 source=source.replace('actual '+process.env.RESET_ADVANCED+'/'+process.env.RESET_ADVANCED+'1 fork IDs','actual '+process.env.RESET_ADVANCED+'/'+process.env.RESET_ADVANCED+process.env.RESET_MOD_TAIL+' fork IDs');
 source=source.replace("'-mastery5'","'-mastery5-tail"+process.env.RESET_MOD_TAIL+"'");
}
source=source.replace('weapons:P.debug.sim.hero.weapons,evolutionUse:','weapons:P.debug.sim.hero.weapons,mods:P.debug.sim.hero.mods,mastery:P.debug.sim.loadout&&P.debug.sim.loadout.mastery,evolutionUse:');
const mod=new Module(path.join(__dirname,'first30-reset-capture-runtime.cjs'),module);mod.filename=path.join(__dirname,'first30-reset-capture-runtime.cjs');mod.paths=module.paths;mod._compile(source,mod.filename);
