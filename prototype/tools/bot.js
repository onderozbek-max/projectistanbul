// Headless bot (prototype analog of tools/bot_sim.gd). Runs the pure sim with a kiting bot, no graphics.
// Usage:
//   node prototype/tools/bot.js [--seeds=50] [--policy=kite|straight] [--verbose]     Level 1 (scripted)
//   node prototype/tools/bot.js --level=N [--seeds=20] [--verbose]                    one generated level (2..100)
//   node prototype/tools/bot.js --levels=2,3,5,10,20,25,50,75,100 [--seeds=20]        summary table
// Generated levels: generic policy (corridor centre, kite, dodge lanes/puddles/rings/stomps, pick up drops,
// circle the hold and the boss, push through stalls). One revive is allowed (as in L1).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
['js/config.js', 'js/config-weapons.js', 'js/config-levels.js', 'js/strings.js', 'js/journey.js', 'js/strings-weapons.js', 'js/sim/rng.js', 'js/sim/world.js', 'js/sim/combat.js', 'js/sim/weapons.js', 'js/sim/weapons2.js', 'js/sim/weapons3.js', 'js/sim/enemies.js', 'js/sim/skills.js', 'js/sim/bosses.js', 'js/sim/levels.js', 'js/sim/progression.js', 'js/sim/director.js', 'js/sim/sim.js'].forEach(function (f) {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
});
const P = globalThis.P;

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v === undefined ? true : v]));
const SEEDS = parseInt(args.seeds || '50', 10), POLICY = args.policy || 'kite';
const PATH = [[-5, -1.5], [-5, 2], [0, 60], [-4, 140], [-4, 165], [-1, 192], [1.5, 206]];
const MAX_T = 600, DT = 1 / 60, DROP_KINDS = ['xp', 'chest', 'simit', 'jeton'];
const med = a => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : 0; };

// ---------- Level 1 (unchanged behaviour) ----------
function botInput(s, st) {
  const h = s.hero;
  let tx, ty;
  if (s.props.shutterOpen) { tx = 7.8; ty = 226; }
  else if (!s.props.doorOpen) {
    const e = s.enemies.filter(x => x.type === 'diner' && x.state === 'active')[0];
    if (e) { tx = e.x; ty = e.y; } else { tx = h.x; ty = h.y; }
  } else if (s.dir.hold.active) {
    st.ang += 0.016 * 0.55;
    tx = 1 + Math.cos(st.ang) * 4; ty = 212 + Math.sin(st.ang) * 4;
  } else {
    while (st.wp < PATH.length - 1 && Math.hypot(PATH[st.wp][0] - h.x, PATH[st.wp][1] - h.y) < 1.2) st.wp++;
    [tx, ty] = PATH[st.wp];
  }
  const tr = P.CFG.level.tram, inTram = x => x.x > tr.xMin - 0.5 && x.x < tr.xMax + 0.5 && x.y > tr.yMin - 0.5 && x.y < tr.yMax + 0.5;
  const near = s.drops.filter(x => Math.hypot(x.x - h.x, x.y - h.y) < 5 && x.y > h.y - 4 && !inTram(x))
    .sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
  const threat = s.enemies.some(e => e.state === 'active' && Math.hypot(e.x - h.x, e.y - h.y) < 2.5);
  if (near && !threat && !s.props.shutterOpen) { tx = near.x; ty = near.y; }
  if (h.y > tr.yMin - 0.6 && h.y < tr.yMax + 0.6 && Math.abs(h.x) > 1 && Math.sign(tx) !== Math.sign(h.x)) { tx = h.x; ty = tr.yMax + 1.2; }
  let vx = tx - h.x, vy = ty - h.y;
  const d = Math.hypot(vx, vy) || 1;
  vx /= d; vy /= d;
  if (d < 0.3) { vx = 0; vy = 0; }
  if (POLICY === 'kite') {
    let rx = 0, ry = 0;
    s.enemies.forEach(e => {
      if (e.state !== 'active') return;
      const dx = h.x - e.x, dy = h.y - e.y, dd = Math.hypot(dx, dy);
      if (dd < 1.2 && dd > 0.01) { rx += dx / dd * (1.2 - dd); ry += dy / dd * (1.2 - dd); }
    });
    vx += rx * 1.5; vy += ry * 1.5;
  }
  return { x: vx, y: vy };
}

function runL1(seed, firstRun) {
  const s = P.createSim(seed);
  P.startPlay(s);
  const st = { wp: 0, ang: 0 }, dt = DT, segT = {}, deaths = [];
  let result = 'timeout';
  while (s.runT < MAX_T) {
    while (s.pendingChests > 0) P.Progression.openChest(s, P.Progression.chestReward(s));
    if (s.pendingLevels > 0) {
      const offer = P.Progression.makeOffer(s);
      P.Progression.choose(s, offer.cards[0]);
      continue;
    }
    P.stepSim(s, dt, botInput(s, st));
    P.drainEvents(s).forEach(ev => { if (ev.type === 'segment') segT[ev.id] = s.runT; });
    if (s.mode === 'dead') {
      deaths.push({ t: s.runT, cause: s.deathCause, y: s.hero.y });
      if (firstRun && !s.secondWindUsed) P.revive(s, 'secondWind');
      else if (!s.reviveUsed) P.revive(s, 'ad');
      else { result = 'lose'; break; }
    }
    if (s.mode === 'won') { result = 'win'; break; }
  }
  const firstLvInA = s.levelUps.length && segT.A !== undefined ? s.levelUps[0] - segT.A : null;
  return { seed, result, t: s.runT, chests: s.chestsOpened, kills: s.kills, level: s.level, levelUps: s.levelUps.length,
    firstLvInA, peak: s.peakAlive, hp: Math.round(s.hero.hp), deaths, segT,
    build: Object.assign({}, s.hero.weapons, s.hero.passives) };
}

// ---------- Generated levels: generic kiting policy ----------
function unit(dx, dy) {
  const d = Math.hypot(dx, dy);
  return d < 0.3 ? { x: 0, y: 0 } : { x: dx / d, y: dy / d };
}

// Where the hero wants to go (ignoring drops and repulsion).
function targetOf(s, st) {
  const h = s.hero, G = s.geo, b = s.gen.boss;
  // Circle speed kept under the hero's 3.2 m/s at the circle radius (~0.5 rad/s at 6 m).
  if (b && !b.dead) {
    st.ang += 0.008;
    return [Math.max(-5.5, Math.min(5.5, b.x + Math.cos(st.ang) * 6)), Math.max(b.y - 7, Math.min(b.y + 7, b.y + Math.sin(st.ang) * 6))];
  }
  if (s.dir.hold.active) { st.ang += 0.01; return [Math.cos(st.ang) * 3, G.exitY - 4 + Math.sin(st.ang) * 2.5]; }
  if (s.props.shutterOpen) return [0, G.exitY + 2.5];
  return [0, Math.min(G.holdY + 1.5, h.y + 8)];
}

// Repulsion from enemies and telegraphed danger (lanes, rings, stomps), zones, and blocks.
function repulsion(s, h) {
  const acc = { x: 0, y: 0 };
  const rep = (dx, dy, R, w) => {
    const d = Math.hypot(dx, dy);
    if (d < R && d > 0.01) { const k = (R - d) / R * w; acc.x += dx / d * k; acc.y += dy / d * k; }
  };
  for (const e of s.enemies) {
    if (e.dead || e.state !== 'active') continue;
    const dx = h.x - e.x, dy = h.y - e.y;
    if (e.boss) rep(dx, dy, 4.2, 2.5);
    // Stiff repulsion: the equilibrium distance must sit outside the enemy's hit radius (burst 2.2, stomp 2.4).
    else if (e.type === 'bloater') rep(dx, dy, e.swell > 0 ? 4.5 : 4.0, 5.0);
    else if (e.type === 'brute') rep(dx, dy, 4.0, 5.0);
    else if (e.type === 'spitter') rep(dx, dy, 2.2, 1.5);
    else rep(dx, dy, 2.2, 1.5);   // walkers and runners: keep out of the crowd edge
  }
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
  for (const b of s.geo.blocks) {
    if (Math.abs(h.y - b.y) >= 6) continue;
    const cx = Math.max(b.rc.xMin, Math.min(b.rc.xMax, h.x)), cy = Math.max(b.rc.yMin, Math.min(b.rc.yMax, h.y));
    rep(h.x - cx, h.y - cy, 1.0, 2);
  }
  return acc;
}

// Nearest drop worth a detour (none while the gate is open, the boss is near, or enemies are close).
function dropTarget(s, st, h, bossAlive) {
  if (s.props.shutterOpen || st.threat <= 2.2 || (bossAlive && st.threat <= 4)) return null;
  let best = null, bd = 4.5;
  for (const d of s.drops) {
    if (st.skip.has(d) || !DROP_KINDS.includes(d.kind)) continue;
    const dd = Math.hypot(d.x - h.x, d.y - h.y);
    if (dd < bd && d.y > h.y - 2 && d.y < s.geo.exitY) { bd = dd; best = d; }
  }
  return best;
}

// Progress watchdog: if the hero has not gained 0.5 m in 6 s on the route, push through for 1.5 s (sideways bias).
function progress(s, st, h, bossAlive) {
  if (s.dir.hold.active || bossAlive) { st.bestT = s.runT; return; }
  if (h.y > st.best + 0.5) { st.best = h.y; st.bestT = s.runT; }
  if (s.runT - st.bestT > 6) { st.push = 1.5; st.side = -st.side; st.bestT = s.runT; }
}

function genInput(s, st) {
  const h = s.hero, bossAlive = !!(s.gen.boss && !s.gen.boss.dead);
  progress(s, st, h, bossAlive);
  st.threat = Infinity;
  for (const e of s.enemies) if (!e.dead && e.state === 'active') st.threat = Math.min(st.threat, Math.hypot(e.x - h.x, e.y - h.y));
  let drop = dropTarget(s, st, h, bossAlive);
  st.dropT = drop && drop === st.dropId ? st.dropT + 1 : 0;   // frames chasing the same drop
  st.dropId = drop;
  if (drop && st.dropT > 240) { st.skip.add(drop); drop = null; st.dropId = null; st.dropT = 0; }   // unreachable (inside a block): give up
  const [tx, ty] = drop ? [drop.x, drop.y] : targetOf(s, st);
  const u = unit(tx - h.x, ty - h.y);
  if (st.push > 0) { st.push -= DT; return { x: u.x + st.side * 0.9, y: u.y }; }
  const r = repulsion(s, h);
  return { x: u.x + r.x, y: u.y + r.y };
}

// Diagnostics for a timed-out run: blocks, enemies, zones and the last input around the hero.
function snapshot(s, last) {
  const h = s.hero, r2 = v => +v.toFixed(2);
  return {
    blocks: s.geo.blocks.filter(b => Math.abs(b.y - h.y) < 8).map(b => [b.kind, r2(b.rc.xMin), r2(b.rc.xMax), r2(b.rc.yMin), r2(b.rc.yMax)]),
    enemies: s.enemies.filter(e => !e.dead && Math.hypot(e.x - h.x, e.y - h.y) < 5).map(e => [e.type, r2(e.x), r2(e.y), e.state, e.swell ? r2(e.swell) : 0]),
    zones: s.zones.filter(z => Math.hypot(z.x - h.x, z.y - h.y) < 3).map(z => [z.kind, r2(z.x), r2(z.y), r2(z.r)]),
    input: last ? [r2(last.x), r2(last.y)] : null,
  };
}

function runGen(index, seed) {
  const s = P.createSim(seed, { levelIndex: index });
  P.startPlay(s);
  const st = { ang: 0, best: s.hero.y, bestT: 0, push: 0, side: 1, skip: new Set(), dropT: 0, dropId: null, threat: Infinity, last: null };
  const segT = {}, deaths = [], dmgBy = {}, evBy = {};
  let result = 'timeout', revived = false, err = null, stuck = null;
  try {
    while (s.runT < MAX_T) {
      while (s.pendingChests > 0) P.Progression.openChest(s, P.Progression.chestReward(s));
      if (s.pendingLevels > 0) { P.Progression.choose(s, pickCard(s, P.Progression.makeOffer(s).cards)); continue; }
      st.last = genInput(s, st);
      P.stepSim(s, DT, st.last);
      P.drainEvents(s).forEach(ev => {
        if (ev.type === 'segment') segT[ev.id] = s.runT;
        if (ev.type === 'heroHit') dmgBy[ev.cause] = (dmgBy[ev.cause] || 0) + ev.dmg;
        if (ev.type.startsWith('brute') || ev.type.startsWith('boss')) evBy[ev.type] = (evBy[ev.type] || 0) + 1;
      });
      if (s.mode === 'dead') {
        deaths.push({ t: +s.runT.toFixed(1), cause: s.deathCause, y: +s.hero.y.toFixed(1) });
        if (revived) { result = 'lose'; break; }
        revived = true; P.revive(s, 'ad');
      }
      if (s.mode === 'won') { result = 'win'; break; }
    }
  } catch (e) { err = e.stack.split('\n').slice(0, 3).join(' | '); result = 'crash'; }
  if (result === 'timeout') stuck = snapshot(s, st.last);
  return { seed, index, id: s.levelInfo.id, result, t: s.runT, kills: s.kills, levelUps: s.levelUps.length, stuck,
    peak: s.peakAlive, deaths, dmgBy, evBy, segT, err, bossKilled: !!(s.gen && s.gen.boss && s.gen.boss.dead),
    hp: Math.round(s.hero.hp), exitY: s.geo.exitY, holdY: s.geo.holdY, stage: s.levelInfo.stage,
    at: { x: +s.hero.x.toFixed(2), y: +s.hero.y.toFixed(2), hold: !!s.dir.hold.active, gate: !!s.props.shutterOpen } };
}

// Generated levels: take evolutions, then weapon upgrades, then passives (medkit first when hurt).
function pickCard(s, cards) {
  const h = s.hero;
  const rank = c => c.evo ? 4 : (c.item === 'medkit' && h.hp < 0.4 * h.maxHp) ? 3 : c.id.startsWith('w:') ? 2 : c.id.startsWith('p:') ? 1 : 0;
  return cards.slice().sort((a, b) => rank(b) - rank(a))[0];
}

function summarize(list) {
  const wins = list.filter(r => r.result === 'win'), noDeath = list.filter(r => r.deaths.length === 0 && r.result === 'win');
  return { n: list.length, clear: wins.length, noDeath: noDeath.length, medT: med(list.map(r => r.t)),
    deaths: list.reduce((a, r) => a + r.deaths.length, 0) / list.length, lvls: med(list.map(r => r.levelUps)),
    peak: med(list.map(r => r.peak)), timeouts: list.filter(r => r.result === 'timeout').length,
    crashes: list.filter(r => r.result === 'crash').length };
}

function runLevels(indices, seeds) {
  const rows = [];
  indices.forEach(idx => {
    const list = [];
    const seedList = args.seed ? [parseInt(args.seed, 10)] : Array.from({ length: seeds }, (_, i) => i + 1);
    seedList.forEach(sd => list.push(runGen(idx, sd)));
    const sm = summarize(list), info = P.Journey.level(idx);
    rows.push({ idx, id: info.id, boss: info.boss, sm, list });
  });
  console.log(`generated levels, policy=kite-generic seeds=${seeds} (clear = win with one revive)`);
  console.log('level  id       type   clear      no-death   median s  deaths/run  lvl-ups  peak  timeouts crashes');
  rows.forEach(r => {
    const c = r.sm;
    console.log(`${String(r.idx).padEnd(6)} ${r.id.padEnd(8)} ${(r.boss ? 'BOSS' : 'route').padEnd(6)} ` +
      `${(c.clear + '/' + c.n + ' ' + Math.round(100 * c.clear / c.n) + '%').padEnd(10)} ` +
      `${(Math.round(100 * c.noDeath / c.n) + '%').padEnd(10)} ${c.medT.toFixed(0).padStart(8)}  ` +
      `${c.deaths.toFixed(2).padStart(10)}  ${String(c.lvls).padStart(7)}  ${String(c.peak).padStart(4)}  ` +
      `${String(c.timeouts).padStart(8)} ${String(c.crashes).padStart(7)}`);
  });
  if (args.verbose) rows.forEach(r => r.list.forEach(x => console.log(JSON.stringify(x))));
}

// ---------- entry ----------
if (args.levels || args.level) {
  const indices = args.levels ? String(args.levels).split(',').map(x => parseInt(x, 10)) : [parseInt(args.level, 10)];
  const seeds = parseInt(args.seeds || '20', 10);
  runLevels(indices, seeds);
} else {
  const runs = [];
  for (let i = 1; i <= SEEDS; i++) runs.push(runL1(i, true));
  const wins = runs.filter(r => r.result === 'win');
  const noDeath = runs.filter(r => r.deaths.length === 0);
  console.log(`policy=${POLICY} seeds=${SEEDS}`);
  console.log(`clear: ${wins.length}/${SEEDS}  clear without dying: ${noDeath.length}/${SEEDS}`);
  console.log(`median time ${med(runs.map(r => r.t)).toFixed(1)} s · kills ${med(runs.map(r => r.kills))} · level-ups ${med(runs.map(r => r.levelUps))} · peak alive ${med(runs.map(r => r.peak))} · end HP ${med(runs.map(r => r.hp))} · chests ${med(runs.map(r => r.chests))}`);
  const fl = runs.map(r => r.firstLvInA).filter(x => x !== null);
  console.log(`first level-up into A: median ${med(fl).toFixed(1)} s (target ≤15 s)`);
  const segs = ['A', 'B', 'C', 'D'];
  console.log('median segment reach (s): ' + segs.map(k => k + '=' + med(runs.map(r => r.segT[k] || 0)).toFixed(0)).join(' '));
  const causes = {};
  runs.forEach(r => r.deaths.forEach(d => { causes[d.cause] = (causes[d.cause] || 0) + 1; }));
  console.log('deaths by cause: ' + JSON.stringify(causes));
  if (args.verbose) runs.forEach(r => console.log(JSON.stringify(r)));
}
