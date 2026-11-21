// Export actual runtime bindings and earned-save diagnostics for the first-30 review packet.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const game=require('./lib-load').loadP();
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'reviews/telemetry/experiential');
const profiles=['broad','melee','ranged','terrain'];
const read=n=>fs.readFileSync(path.join(dir,n),'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const campaigns=Object.fromEntries(profiles.map(n=>[n,read('earned-'+n+'.jsonl')]));
const all=Object.values(campaigns).flat();
if(profiles.some(n=>!campaigns[n].some(r=>r.level===30&&r.result==='win')))throw Error('Campaign collection incomplete');
const write=(name,data)=>fs.writeFileSync(path.join(dir,name),JSON.stringify(data,null,2)+'\n');
const median=a=>a.slice().sort((a,b)=>a-b)[Math.floor(a.length/2)];
const bosses=[1,2,3,4,5,10,15,20,25,30];
const bands=[];
for(const level of bosses){
 const low=campaigns.broad.find(r=>r.level===level&&r.attempt===0);
 const typical=campaigns.melee.find(r=>r.level===level&&r.attempt===0);
 const strong=campaigns.terrain.find(r=>r.level===Math.min(30,level+5)&&r.result==='win');
 Object.assign(game.Meta.state(),strong.saveAfter);
 for(const [band,loadout,origin]of [['struggling',low.loadout,'broad L'+level+' first attempt'],['typical',typical.loadout,'melee L'+level+' first attempt'],
  ['strong',game.Meta.loadout(),'terrain L'+strong.level+' post-clear replay save']])bands.push({level,band,loadout,origin});
}
write('earned-boss-loadouts.json',bands);
const roster={};
for(const r of all)for(const [id,data]of Object.entries(r.experienceTrace.roles)){
 if(!roster[id]||r.level<roster[id].firstLevel)roster[id]={firstLevel:r.level,firstSeconds:data.first,exampleId:data.id};
}
const looks={};for(const r of all)for(const [id,count]of Object.entries(r.experienceTrace.looks||{}))looks[id]=(looks[id]||0)+count;
const atlas={runner:'runner',crawler:'crawler',diner:'diner',spitter:'spitter',screamer:'screamer',bloater:'bloater',hardhat:'hardhat',copci:'copci',
 kurye:'kurye',brute:'brute',cayci:'cayci',parkur:'parkur',kasap:'kasap',zehirli:'zehirli',marti:'marti'};
for(const [id,row]of Object.entries(roster))row.firstRegularLevel=(()=>{const levels=all.filter(r=>(r.experienceTrace.looks?.[id]||0)>0).map(r=>r.level);return levels.length?Math.min(...levels):null;})();
for(const [id,row]of Object.entries(roster))row.binding=id==='walker'?'characters/walker_<hashed outfit>.png':id==='kasapBoss'?'landmarks/cook-poses.webp':
 'characters/'+atlas[id]+'.png; bosses may use their explicit preset override';
const levels=[];
for(let i=1;i<=30;i++){
 const s=game.createSim(42,{levelIndex:i,tramRhythm:true}),runs=all.filter(r=>r.level===i),wins=runs.filter(r=>r.result==='win');
 levels.push({level:i,id:s.levelInfo.id,hood:s.levelInfo.hood.id,route:s.routeTrial,milestone:s.milestone&&s.milestone.kind,
  objective:s.obj&&s.obj.id,anchor:s.milestone&&s.milestone.point,seed:42,attempts:runs.length,wins:wins.length,
  medianSeconds:median(wins.map(r=>r.time)),movementSeconds:median(wins.map(r=>r.experienceTrace.move)),
  stationarySeconds:median(wins.map(r=>r.experienceTrace.wait)),nearEnemySeconds:median(wins.map(r=>r.experienceTrace.combat)),
  beats:wins.find(r=>r.profile==='broad')?.experienceTrace.beats.map(e=>({at:e.t,type:e.type,phase:e.phase}))||wins[0].experienceTrace.beats.map(e=>({at:e.t,type:e.type,phase:e.phase}))});
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'prototype/assets/art/manifest.json'),'utf8'));
const weapons=game.CFG.arsenal.weapons.map(id=>({id,recipe:Object.entries(game.CFG.evolutions).filter(([,r])=>r.from===id).map(([e])=>e),
 iconAtlas:manifest.weapons[id]?.atlas,held:'FireAnimHeld.'+id,body:'HeroAttacks/HeroFootwork '+id,
 silhouette:game.CFG.wtier.weapons[id],ranks:[1,3,5].map(n=>({rank:n,actualConfig:game.CFG.weapons[id].levels[n-1]}))}));
const evolutions=Object.entries(game.CFG.evolutions).map(([id,recipe])=>({id,recipe,body:'HeroAttacks '+id,signature:game.CFG.wtier.evos[id],
 actualConfig:game.CFG.weapons[id].levels[0],natural:all.filter(r=>r.evolutionUse&&r.evolutionUse[id]).map(r=>({profile:r.profile,level:r.level,attempt:r.attempt,
 acquired:r.evolutionUse[id].acquired_s,firstHit:r.evolutionUse[id].first_hit_s,firstEffect:r.evolutionUse[id].first_effect_s,
 playableAfter:r.time-r.evolutionUse[id].acquired_s,hits:r.evolutionUse[id].hits,damage:r.evolutionUse[id].damage,control:r.evolutionUse[id].control,
 uniqueTargets:(r.experienceTrace.evolvedTargets?.[id]||[]).length}))}));
write('coverage.json',{scope:'first30',levels,roster,looks,weapons,evolutions});
write('campaign-summary.json',profiles.map(profile=>{
 const runs=campaigns[profile],wins=runs.filter(r=>r.result==='win');
 return{profile,attempts:runs.length,wins:wins.length,losses:runs.filter(r=>r.result==='lose').length,timeouts:runs.filter(r=>r.result==='timeout').map(r=>({level:r.level,seed:r.seed,stuck:r.stuck})),
 secondWind:runs.some(r=>r.experienceTrace.secondWind),ordinaryRevives:0,simulatedSeconds:runs.reduce((a,r)=>a+r.time,0),
 medianClearSeconds:median(wins.map(r=>r.time)),evolutions:Object.fromEntries(evolutions.map(e=>[e.id,e.natural.filter(r=>r.profile===(profile==='melee'?'knife':profile==='ranged'?'nailgun':profile==='terrain'?'canister':'broad')).length]).filter(([,n])=>n))};
}));
function appendLines(out,level,trigger,ids,variant){
 for(const id of ids)for(const lang of ['tr','en']){
  game.lang=lang;const line=game.Dialogue.get(id,lang);if(line)out[lang].push({level,trigger,variant,id,speaker:line.spk,text:line.text,
   knowledge:level<20?'Arda is heading home; no future companion/letter facts':level<25?'Kaan is introduced only after the Fisher; family safety follows current call order':'Captain outcome and actual help facts; family safe in Sariyer, Atakoy useful for supplies, letter contents unknown',
   provenance:'current native source, declared trigger order; ordinary on-screen observation is separately indexed'});
 }
}
const script={tr:[],en:[]};
appendLines(script,1,'cold open',['s2','s4','s3','rule1','rule2','rule3','barkGrab','pardon'],'first view');
for(const [trigger,ids]of [['first card',['callA1','callA2','callA3']],['segment B',['callB1','callB2','callB3','callB4']],
 ['segment C',['callC1','callC2']],['segment D',['callD1']],['optional active call restored',['callHack1','callHack2']],['shutter exit',['exit1','exit2']]])appendLines(script,1,trigger,ids,'source-declared route/optional event; not a mandatory booster');
game.Meta.state().flags.kaanMarketCover=false;
for(let level=1;level<=30;level++)for(const when of ['intro','start','mid','boss','end']){
 const beat=game.Story.beat(level,when,{});if(!beat)continue;
 const ids=beat.kind==='page'?[].concat(beat.id).flatMap(id=>game.Story.pages[id].panels.flatMap(p=>p.it.map(it=>it[1]))):beat.kind==='call'?beat.lines:[beat.line];
 appendLines(script,level,when,ids,'neutral first-clear');
}
for(const [variant,remembered,covered]of [['current useful help',false,true],['stored useful help',true,false]]){
 game.Meta.state().flags.kaanMarketCover=remembered;const b=game.Story.beat(25,'end',{kaanCovered:covered});
 appendLines(script,25,'end',game.Story.pages[b.id].panels.flatMap(p=>p.it.map(it=>it[1])),variant);
}
for(const lang of ['tr','en'])fs.writeFileSync(path.join(dir,'dialogue-'+lang+'.jsonl'),script[lang].map(r=>JSON.stringify(r)).join('\n')+'\n');
console.log('exported',levels.length,'levels',weapons.length,'base',evolutions.length,'evolutions',Object.keys(roster).length,'live types');
