'use strict';

// Optional audit policy exercises the same inputs as a player.
function useActiveSkills(P, s, move, unit) {
  const h = s.hero, k = P.Skills.hud(s);
  const ring = s.enemyTele.find(tg => tg.kind === 'ring' && tg.T - tg.t < 0.46 &&
    Math.hypot(h.x - tg.x, h.y - tg.y) < tg.r + P.CFG.hero.radius);
  const lane = s.enemyTele.find(tg => {
    if (tg.kind !== 'lane' || tg.T - tg.t >= 0.46) return false;
    const dx = h.x - tg.x, dy = h.y - tg.y, forward = dx * tg.dx + dy * tg.dy;
    return forward >= 0 && forward <= tg.len && Math.abs(dx * tg.dy - dy * tg.dx) < tg.w / 2 + P.CFG.hero.radius;
  });
  if (ring && k.dashReady) {
    const d = unit(h.x - ring.x || 1e-4, h.y - ring.y);
    return { x: d.x, y: d.y, dash: true };
  }
  if (lane && k.dashReady) {
    const cross = (h.x - lane.x) * lane.dy - (h.y - lane.y) * lane.dx;
    const side = Math.sign(cross) || (h.x < 0 ? 1 : -1);
    return { x: lane.dy * side, y: -lane.dx * side, dash: true };
  }
  if ((ring || lane) && k.active.ready && k.active.id === 'shield') move.skill = true;
  if(k.active.ready&&k.active.id==='shield'&&
    (h.hp<h.maxHp*.4||s.streetGrab||s.streetWeapon)&&
    s.enemies.some(e=>!e.dead&&e.state==='active'&&Math.hypot(e.x-h.x,e.y-h.y)<1.7))move.skill=true;
  if (k.ultReady && s.enemies.filter(e => !e.dead && Math.hypot(h.x - e.x, h.y - e.y) < 4).length >= 8) move.ult = true;
  return move;
}

// Generated levels: take evolutions, then weapon upgrades, then passives (medkit first when hurt).
function planCard(P, s, log, args) {
  let cards = P.Progression.makeOffer(s).cards;
  if(args['reset-policy']){const selected=require('./lib-reset-policy.cjs').choose(P,s,cards,args['reset-policy']);
    if(log)log.push({at:+s.runT.toFixed(1),policy:args['reset-policy'],cards:cards.map(c=>c.id),pick:selected.id,rank:selected.next});return selected;}
  if (!log) return pickCard(s, cards);
  const families = {
    melee: ['knife', 'chain', 'cardoor', 'chainsaw', 'sledge', 'manhole'],
    ranged: ['nailgun', 'slingshot', 'speargun', 'sawblade', 'olta'],
    terrain: ['canister', 'molotov', 'extinguisher', 'fireworks', 'torch', 'cable'],
  };
  const recipe = P.Progression.buildState(s);
  const desired=args.evolution&&P.CFG.evolutions[args.evolution];
  const family = families[args.intent] || [];
  const matches = id => id && family.includes(id);
  const focus = desired?desired.from:recipe && matches(recipe.weapon) ? recipe.weapon : args.build;
  const suits = c => c.evo ? !desired&&c.evo===focus||desired&&c.item===args.evolution:
    c.item===focus||desired&&c.item===desired.passive||!desired&&recipe&&recipe.weapon===focus&&c.item===recipe.passive&&!recipe.paired;
  const first = cards.map(c => c.id);
  let used = false;
  if (args['focused-reroll'] && !cards.some(suits) && P.Progression.rerollFocus(s) === focus) {
    cards = P.Progression.makeOffer(s, focus).cards;
    s.rerolls--;
    used = true;
  }
  const recover = s.hero.hp < s.hero.maxHp * .4 && cards.find(c => c.item === 'medkit');
  const companion=args['starter-companion']&&Object.keys(s.hero.weapons).length<2&&cards.find(c=>
    c.id.startsWith('w:')&&!s.hero.weapons[c.item]&&['knife','nailgun','chain','slingshot','sawblade','torch'].includes(c.item));
  const alternative=desired?cards.filter(c=>!c.evo&&!Object.values(P.CFG.evolutions).some(e=>e.from===focus&&e.passive===c.item&&e!==desired)):cards;
  const holdIntention=desired&&(alternative.find(c=>c.id.startsWith('p:'))||
    alternative.find(c=>c.id.startsWith('w:')&&!s.hero.weapons[c.item]));
  // A player can leave base rank2 until the first actual crate, which otherwise
  // supplies the regular paired passive once rank3 is reached. No offer is changed.
  const reserve=args['reserve-first-crate']&&args.evolution==='carbomb'&&!s.chestsOpened&&s.hero.weapons.canister===2;
  const sideInvestment=reserve&&alternative.find(c=>c.item!=='canister'&&!c.evo);
  const passiveFirst=args['passive-first']&&cards.find(c=>c.id.startsWith('p:'));
  const pick = recover || companion || sideInvestment || passiveFirst || (!desired&&cards.find(c => c.evo && recipe && matches(recipe.weapon))) ||
    cards.find(suits) || cards.find(c => c.id.startsWith('w:') && matches(c.item)) || holdIntention || pickCard(s,alternative.length?alternative:cards);
  log.push({ at: +s.runT.toFixed(1), first, cards: cards.map(c => c.id), used, pick: pick.id, rank: pick.next, fork: pick.fork, recipe });
  return pick;
}

function pickCard(s, cards) {
  const h = s.hero;
  const rank = c => c.evo ? 4 : (c.item === 'medkit' && h.hp < 0.4 * h.maxHp) ? 3 : c.id.startsWith('w:') ? 2 : c.id.startsWith('p:') ? 1 : 0;
  return cards.slice().sort((a, b) => rank(b) - rank(a))[0];
}

// A bounded geometry-only fallback when local repulsion pins the bot against a corner.
// It uses the same hero clamp as real movement and never moves/teleports the actor.
function routeEscape(P,s,st,goal) {
  if (!st.nav && s.runT-st.bestT<5.5) return null;
  const h=s.hero,step=.5;
  if (!st.nav) {
    const valid=(x,y)=>{const p={x,y};P.World.clampHero(s,p);if(s.milestone)P.RouteMilestones.clamp(s,p);return Math.hypot(p.x-x,p.y-y)<.04;};
    const start={x:h.x,y:h.y,prev:null},queue=[start],seen=new Set(['0,0']);let best=start,score=Infinity;
    for(let at=0;at<queue.length&&at<1300;at++){
      const q=queue[at],d=Math.hypot(q.x-goal[0],q.y-goal[1]);if(d<score){best=q;score=d;}
      if(d<.6)break;
      for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
        const x=q.x+dx*step,y=q.y+dy*step,key=Math.round((x-h.x)/step)+','+Math.round((y-h.y)/step);
        if(seen.has(key)||Math.abs(x)>P.CFG.view.heroClampX||Math.abs(y-h.y)>8)continue;
        seen.add(key);if(![.25,.5,.75,1].every(t=>valid(q.x+dx*step*t,q.y+dy*step*t)))continue;
        queue.push({x,y,prev:q});
      }
    }
    const path=[];while(best.prev){path.unshift([best.x,best.y]);best=best.prev;}
    if(!path.length)return null;st.nav={path,until:s.runT+4};
  }
  while(st.nav.path.length&&Math.hypot(st.nav.path[0][0]-h.x,st.nav.path[0][1]-h.y)<.22)st.nav.path.shift();
  if(s.runT>st.nav.until||!st.nav.path.length){st.nav=null;st.bestT=s.runT;return null;}
  const q=st.nav.path[0],d=Math.hypot(q[0]-h.x,q[1]-h.y)||1;
  return {x:(q[0]-h.x)/d,y:(q[1]-h.y)/d};
}
function auditChoiceInput(P,s,st,args,unit,inBlock,punishWindow) {
  const approach=(x,y)=>Math.hypot(x-s.hero.x,y-s.hero.y)<.22?{x:0,y:0}:
    routeEscape(P,s,st,[x,y])||unit(x-s.hero.x,y-s.hero.y);
  // Optional diagnostic policy: collect already dropped investment XP behind
  // the route before entering a boss. Never spawn XP, wait for more enemies,
  // change a timer, or grant the wanted weapon. All ordinary hazards remain.
  const invest=args['collect-investment']&&P.CFG.evolutions[args.evolution];
  if(invest&&s.hero.weapons[invest.from]&&!s.hero.evolved?.[invest.from]&&!s.gen?.boss){
    if(st.investUntil===undefined)st.investUntil=s.runT+45;
    const drops=s.drops.filter(d=>['xp','chest'].includes(d.kind)&&!inBlock(s,d)&&
      !P.RouteMilestones.pastClosedGate(s,d.y)&&Math.hypot(d.x-s.hero.x,d.y-s.hero.y)<10);
    const d=drops.sort((a,b)=>Math.hypot(a.x-s.hero.x,a.y-s.hero.y)-Math.hypot(b.x-s.hero.x,b.y-s.hero.y))[0];
    if(d&&s.runT<st.investUntil){
      const u=approach(d.x,d.y),r=repulsion(P,s,s.hero,args,punishWindow);
      return{x:u.x+r.x,y:u.y+r.y};
    }
  }
  // A lit crossing needs movement beyond the threshold, not the generic stop-within-.8m hold policy.
  const lights=s.milestone?.lights,next=lights?.on&&!s.milestone.open&&lights.steps[lights.passed];
  if(next)return approach(next.x,next.y+.65);
  // A declared advanced conditional-build policy: walking past an early supply
  // avoids auto-committing a different evolution's paired passive. The real
  // chest remains available; there is no reward, offer or rank injection.
  if(args.evolution==='carbomb'&&args['defer-terrain-chests'])for(const drop of s.drops)if(drop.kind==='chest'){
    if((s.hero.weapons.canister||0)<(+args['terrain-chest-rank']||3))st.skip.add(drop);else st.skip.delete(drop);
  }
  const terrain=args.evolution&&P.CFG.evolutions[args.evolution];
  if(terrain&&s.hero.weapons[terrain.from]&&s.recipeFocus!==terrain.from&&!(s.hero.evolved&&s.hero.evolved[terrain.from]))
    P.Progression.setBuildPlan(s,terrain.from); // Same explicit action exposed by the pause-screen plan control.
  const revisit=args['terrain-revisit']&&terrain?.terrain==='car',rankReady=!revisit||(s.hero.weapons[terrain?.from]||0)>=5;
  if(rankReady&&['car','gas'].includes(terrain?.terrain)&&s.hero.weapons[terrain.from]&&!P.Weapons6.seen(s,terrain.from,terrain.terrain)){
    const r=(s.env?.recs||[]).find(r=>r.alive&&(terrain.terrain==='car'?P.Env.isCar(r.kind):r.kind==='gascan')&&(revisit||Math.hypot(r.x-s.hero.x,r.y-s.hero.y)<12));
    if(r){
      if(st.terrainObject!==r){st.terrainObject=r;st.terrainEnd=s.runT+(revisit?50:8);}
      if(s.runT<st.terrainEnd&&s.hero.hp>s.hero.maxHp*.3)
        return approach(r.x-Math.sign(r.x)*(r.b.w/2+P.CFG.hero.radius+P.CFG.env.propIntent.reach+.35),r.y);
    }
  }
  if (args.help && s.levelIndex===23 && P.KaanSupport.canRepay(s)) {
    const a=s.kaanSupport,e=s.enemies.filter(e=>!e.dead&&!e.boss&&e.state==='active'&&Math.hypot(e.x-a.x,e.y-a.y)<P.CFG.bond.kaan.support.repay.radius)
      .sort((a,b)=>Math.hypot(a.x-s.hero.x,a.y-s.hero.y)-Math.hypot(b.x-s.hero.x,b.y-s.hero.y))[0];
    if(e){const d=unit(e.x-s.hero.x,e.y-s.hero.y),near=Math.hypot(e.x-s.hero.x,e.y-s.hero.y)<P.CFG.skills.dash.dist-.5;return {...d,dash:near};}
  }
  if (args.choice && args.choice!=='neutral' && !s.localChoice && s.milestone && !s.milestone.open) {
    const pads=P.LocalChoices.pads(s),at=pads[args.choice==='right'?1:0];
    if(at && Math.abs(at.y-s.hero.y)<8)return approach(at.x,at.y);
  }
  const intentional=args.choice&&args.choice!=='neutral'&&[12,17,22].includes(s.levelIndex)||args.street&&s.levelIndex===3;
  if (!intentional || !s.milestone || s.milestone.open || s.localChoice) return null;
  const h=s.hero,site=s.streetSite,r=site?.prop||
    (args['site-first']&&[12,17,22].includes(s.levelIndex)?null:s.env.recs.find(r=>r.street&&!r.street.spent&&r.alive));
  if(!r || r.street?.remaining<=0 || !r.alive&&s.streetWeapon?.r!==r)return null;
  const w=s.streetWeapon;
  if(w && w.r===r) {
    if(args.choice==='left'&&site&&!site.used)return approach(site.x,site.gripY);
    if(args['cart-flank']&&s.dramaSpace?.domino?.alive)return approach(s.dramaSpace.domino.x,s.dramaSpace.domino.y-1.1);
    const enemy=P.Weapons.nearestEnemy(s,h.x,h.y,8);
    if(enemy&&Math.hypot(enemy.x-h.x,enemy.y-h.y)-enemy.r>P.StreetWeapon.reach(w)*.8)return unit(enemy.x-h.x,enemy.y-h.y);
    if(enemy)return{x:0,y:0};
    return null;
  }
  if(s.streetChoiceHit)return null;
  if(Math.abs(r.y-h.y)>8&&!args['site-early'])return null;
  return approach(r.x,r.b.rc.yMin-P.CFG.hero.radius-.10);
}
function repulsion(P,s,h,args,punishWindow) {
  const acc = { x: 0, y: 0 };
  const opening = punishWindow(s);
  const rep = (dx, dy, R, w) => {
    const d = Math.hypot(dx, dy);
    if (d < R && d > 0.01) { const k = (R - d) / R * w; acc.x += dx / d * k; acc.y += dy / d * k; }
  };
  for (const e of s.enemies) {
    if (e.dead || e.state !== 'active') continue;
    const dx = h.x - e.x, dy = h.y - e.y;
    if (e.boss) rep(dx, dy, opening === e ? 1.8 : 4.2, 2.5);
    // Stiff repulsion: the equilibrium distance must sit outside the enemy's hit radius (burst 2.2, stomp 2.4).
    else if (e.type === 'bloater') rep(dx, dy, e.swell > 0 ? 4.5 : 4.0, 5.0);
    else if (e.type === 'brute') rep(dx, dy, 4.0, 5.0);
    else if (e.type === 'spitter') rep(dx, dy, 2.2, 1.5);
    else if (e.type === 'screamer') rep(dx, dy, 3.0, 2.0);   // stay out of its ring (windup)
    else if (e.type === 'kasap') rep(dx, dy, 3.2, 4.0);      // cleaver reach 2.0 m plus its ring: keep out
    else if(args['lob-spacing']&&s.hero.weapons.canister&&Object.keys(s.hero.weapons).length===1)rep(dx,dy,3.4,3.2);
    else rep(dx, dy, 2.2, 1.5);   // walkers, runners, hardhats: keep out of the crowd edge
  }
  // --nododge: the bot keeps out of enemy bodies and blocks but does not react to shots, telegraphs, stomps or zones.
  if (!args.nododge) {
    for (const q of s.enemyShots) rep(h.x - q.tx, h.y - q.ty, 1.6, 2);
    for (const tg of s.enemyTele) {
      if (tg.kind === 'ring' && tg.T - tg.t < 0.8) rep(h.x - tg.x, h.y - tg.y, tg.r + 0.8, 2.5);
      if (tg.kind === 'lane') {
        const nx = -tg.dy, ny = tg.dx, perp = (h.x - tg.x) * nx + (h.y - tg.y) * ny, along = (h.x - tg.x) * tg.dx + (h.y - tg.y) * tg.dy;
        if (along > -0.5 && along < tg.len + 0.5 && Math.abs(perp) < tg.w / 2 + 0.7) {
          const side = perp < 0 ? -1 : 1; acc.x += nx * side * 3; acc.y += ny * side * 3;
        }
      }
    }
    for (const tg of s.dir.telegraphs) if (tg.then === 'stomp' && tg.T - tg.t < 1.5) rep(h.x - tg.x, h.y - tg.y, tg.r + 0.8, 2.5);
    for (const z of s.zones) if (z.kind === 'acid' || z.kind === 'toxic' || z.kind === 'fire') rep(h.x - z.x, h.y - z.y, z.r + 0.5, 1.2);
  }
  for (const b of s.geo.blocks) {
    if (Math.abs(h.y - b.y) >= 6) continue;
    const cx = Math.max(b.rc.xMin, Math.min(b.rc.xMax, h.x)), cy = Math.max(b.rc.yMin, Math.min(b.rc.yMax, h.y));
    rep(h.x - cx, h.y - cy, 1.0, 2);
  }
  return acc;
}

module.exports = { planCard, useActiveSkills, routeEscape, auditChoiceInput, repulsion };
