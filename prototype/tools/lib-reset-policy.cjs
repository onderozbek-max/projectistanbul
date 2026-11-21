// Declared ordinary-card policies; no supplied offers, ranks, power or outcomes.
'use strict';
const close=['knife','chain','sledge','chainsaw','cardoor','manhole'];
const ranged=['nailgun','slingshot','speargun','sawblade','olta','fireworks'];
const mixed=['canister','sledge','nailgun','chain','torch','molotov'];
const control=['extinguisher','cable','chain','olta','manhole'];
function choose(P,s,cards,policy){
 const h=s.hero,level=s.levelIndex||1,groups={'close-investment':close,'ranged-investment':ranged,'broad-mixed':mixed,'defensive-control':control};
 const group=groups[policy];if(!group)throw Error('Unknown reset policy '+policy);
 const pivot=policy==='broad-mixed'?Math.floor((level-1)/5)%group.length:policy==='close-investment'?Math.floor((level-1)/10)%3:0;
 const target=group[pivot],owned=Object.keys(h.weapons),hurt=h.hp<h.maxHp*.45;
 function score(c){
  const family=c.evo||c.item,rank=h.weapons[family]||0,isWeapon=!!P.CFG.weapons[c.item];
  if(c.item==='medkit'&&hurt)return 150;
  if(policy==='defensive-control'&&c.item==='knife'&&(h.weapons.knife||0)<3)return 130;
  if(policy==='defensive-control'&&['jacket','nazar','medkit','shoes','kask'].includes(c.item))return 105-(h.passives[c.item]||0)*7;
  if(c.evo)return group.includes(family)?125:60;
  if(family===target)return 110+rank;
  if(group.includes(family)&&isWeapon)return 80+rank-(owned.length>=4&&!rank?55:0);
  const recipe=Object.values(P.CFG.evolutions).find(e=>e.from===target&&e.passive===c.item);
  if(recipe&&(h.weapons[target]||0)>=3)return 100;
  if(!isWeapon)return 45-(h.passives[c.item]||0)*2;
  return rank?35+rank:owned.length<3?40:15;
 }
 return cards.map((card,i)=>({card,i,score:score(card)})).sort((a,b)=>b.score-a.score||a.i-b.i)[0].card;
}
module.exports={choose};
