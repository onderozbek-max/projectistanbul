// Headless Level 1 bot (prototype analog of tools/bot_sim.gd). Runs the pure sim with a kiting bot.
// Usage: node prototype/tools/bot.js [--seeds=50] [--policy=kite|straight] [--verbose]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
['js/config.js', 'js/config-weapons.js', 'js/config-levels.js', 'js/strings.js', 'js/journey.js', 'js/strings-weapons.js', 'js/sim/rng.js', 'js/sim/world.js', 'js/sim/combat.js', 'js/sim/weapons.js', 'js/sim/weapons2.js', 'js/sim/weapons3.js', 'js/sim/enemies.js', 'js/sim/skills.js', 'js/sim/bosses.js', 'js/sim/levels.js', 'js/sim/progression.js', 'js/sim/director.js', 'js/sim/sim.js']].forEach(function (f) {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
});
const P = globalThis.P;

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v === undefined ? true : v]));
const SEEDS = parseInt(args.seeds || '50', 10), POLICY = args.policy || 'kite';
const PATH = [[-5, -1.5], [-5, 2], [0, 60], [-4, 140], [-4, 165], [-1, 192], [1.5, 206]];

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

function run(seed, firstRun) {
  const s = P.createSim(seed);
  P.startPlay(s);
  const st = { wp: 0, ang: 0 }, dt = 1 / 60, segT = {}, deaths = [];
  let result = 'timeout';
  while (s.runT < 600) {
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

const runs = [];
for (let i = 1; i <= SEEDS; i++) runs.push(run(i, true));
const med = a => { const b = a.slice().sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
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
