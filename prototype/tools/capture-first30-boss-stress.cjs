// All ten bodies under the same legal early six-weapon load; supplied observer/targets, never earned balance.
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
let source=fs.readFileSync(path.join(__dirname,'capture-audit8.cjs'),'utf8');
function replace(a,b){if(!source.includes(a))throw Error('Boss capture changed: '+a);source=source.replace(a,b);}
replace('window.auditActor=s.dir.trialBoss||s.gen?.boss;s.enemies=[auditActor];',`window.auditActor=s.dir.trialBoss||s.gen?.boss;s.enemies=[auditActor];
   const names=['knife','nailgun','canister','chain','sledge','sawblade'];
   if(names.some(id=>(P.CFG.unlock.weapons[id]||1)>s.levelIndex))throw Error('Illegal weapon unlock in stress fixture');
   const passiveNames=['jacket','gloves','nazar','energy','shoes','lokum'];
   if(passiveNames.some(id=>(P.CFG.unlock.passives[id]||1)>s.levelIndex))throw Error('Illegal passive unlock in stress fixture');
   P.Progression.debugGrant(s,{weapons:{knife:5,nailgun:5,canister:5,chain:5,sledge:5,sawblade:5},passives:{jacket:5,gloves:5,nazar:5,energy:5,shoes:5,lokum:5}});
   auditActor.hp=auditActor.maxHp=auditActor.maxHp*1000;s.hero.hp=s.hero.maxHp*.19;
   s.sk.frenzyT=P.CFG.skills.frenzy.time;s.events.push({type:'frenzy',on:true,t:s.sk.frenzyT});
   for(let i=0;i<40;i++){const angle=i*2.399,r=2+(i%8)*.4,e=P.Combat.spawnEnemy(s,i%4===0?'runner':'walker',s.hero.x+Math.cos(angle)*r,s.hero.y+Math.sin(angle)*r,{state:'active'});e.hp=e.maxHp=1e5;}
   let prop=false;if(s.env)for(const dx of[-2.7,2.7,-3.6,3.6])if(P.Env.addSolid(s,'crates',s.hero.x+dx,s.hero.y+2,.8,.6)){prop=true;break;}
   window.resetBossStress={supplied:true,criticalFraction:.19,legalWeaponIDs:names,legalPassiveIDs:passiveNames,rank:5,slots:6,passiveSlots:6,crowd:40,propPlaced:prop,bossHPMultiplier:1000,reachability:'Slot/unlock/rank legal supplied peak configuration; not claimed earnable during each finite level.',frenzy:'Actual six-second timer; second-half grayscale is not relabelled sustained frenzy.',grayscale:'DOM canvas CSS filter enabled after7s; original native canvas stream remains color'};
   setTimeout(()=>{document.getElementById('game').style.filter='grayscale(1)'},7000);`);
replace('settings:P.Settings})','settings:P.Settings,stress:window.resetBossStress})');
replace('P.Combat.damageEnemy(P.debug.sim,auditActor,auditActor.maxHp*.56,1,0,0,false,"knife")',
 '(()=>{const s=P.debug.sim,e=auditActor,f=(1+P.Combat.might(s))*(e.armour||1)*P.Skins.hitMul(s,e);if(f>0)P.Combat.damageEnemy(s,e,e.maxHp*.56/f,1,0,0,false,"knife")})()');
replace('opaque invulnerable observer without weapons, no XP interruption','opaque invulnerable observer at supplied19%HP with six actual legally unlocked rank5 weapons/six passives, actual frenzy, forty supplied high-HP walkers/runners, actual optional crate where legal, supplied bossHP×1000 to retain visibility under the build, no XP interruption');
replace('Not an earned fight.','Not an earned fight or balance result. Second half DOM world is grayscale; native canvas stream remains original color.');
const mod=new Module(path.join(__dirname,'first30-boss-stress-runtime.cjs'),module);mod.filename=path.join(__dirname,'first30-boss-stress-runtime.cjs');mod.paths=module.paths;mod._compile(source,mod.filename);
