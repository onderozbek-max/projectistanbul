// Reuse the actual bot/earned-settlement observer with a declared snapshot and card policy.
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const original=fs.readFileSync(path.join(__dirname,'audit-experience.cjs'),'utf8');
let code=original.replace("const source = fs.readFileSync(path.join(__dirname, 'bot.js'), 'utf8').split('// ---------- entry ----------')[0];",
 "const source = fs.readFileSync(path.join(__dirname, 'bot.js'), 'utf8').split('// ---------- entry ----------')[0].replace(\"require('./lib-load')\",\"require('./lib-reset-load.cjs')\");");
if(code===original)throw Error('Existing observer loader changed; inspect before adapting');
// L1's older route helper does not call auditChoiceInput. This optional,
// separately labelled policy performs only the public owned-plan action which
// the player can select in pause; no cards, ranks, encounters or XP are supplied.
code=code.replace('const before=s.runT; step(s,dt,input);',`const before=s.runT;
 if(args['commit-owned-plan']&&args.evolution){
  const target=P.CFG.evolutions[args.evolution];
  if(target&&s.hero.weapons[target.from]&&s.recipeFocus!==target.from&&!(s.hero.evolved&&s.hero.evolved[target.from])){
   P.Progression.setBuildPlan(s,target.from);
   (experienceTrace.planActions||(experienceTrace.planActions=[])).push({t:s.runT,base:target.from,method:'Public setBuildPlan; explicit optional diagnostic input policy'});
  }
 }
 step(s,dt,input);`);
if(process.env.AUDIT11_MATCH_ENTRY){
 // Matched counterfactual: earn the original L1 build on the original XP curve, then restore final XP at real boss spawn.
 // Final boss AI/config are active throughout; no HP/rank/card/offer/outcome is supplied.
 code=code.replace('let forcedLoadout = null,', 'const finalL1Xp=JSON.parse(JSON.stringify(P.CFG.xp.l1));P.CFG.xp.l1={base:5,mult:3,exp:1.6};let forcedLoadout = null,');
 code=code.replace(' const e=spawn(s,type,x,y,options);', ' if(s.levelIndex===1)P.CFG.xp.l1=finalL1Xp;const e=spawn(s,type,x,y,options);');
}
const compiled=new Module(path.join(__dirname,'reset-earned-runtime.cjs'),module);compiled.filename=path.join(__dirname,'reset-earned-runtime.cjs');compiled.paths=Module._nodeModulePaths(__dirname);compiled._compile(code,compiled.filename);
