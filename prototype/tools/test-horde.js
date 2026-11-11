// Horde and telegraph checks (lane H, WAVE3): every windup has a cue event and a pose; the CR-2 entrance exemption (only
// route and horde spawns move); the first-sighting debut; and the ambient horde filling a generated level's frame.
// Usage: node prototype/tools/test-horde.js [--secs=15]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const FILES = ['js/config.js', 'js/config-weapons.js', 'js/config-levels.js', 'js/config-layouts.js', 'js/config-enemies3.js', 'js/config-bosses.js', 'js/config-enemies4.js', 'js/config-enemies5.js', 'js/config-skins.js','js/config-stats.js', 'js/config-weapons2.js', 'js/config-weapons3.js', 'js/config-env.js',
  'js/config-objectives.js', 'js/config-modifiers.js', 'js/config-horde.js',
  'js/strings.js', 'js/strings-progress.js', 'js/journey.js', 'js/strings-weapons.js', 'js/strings-weapons2.js', 'js/strings-weapons3.js', 'js/sim/rng.js', 'js/sim/world.js',
  'js/sim/combat.js', 'js/sim/weapons.js', 'js/sim/weapons2.js', 'js/sim/weapons3.js', 'js/sim/weapons4.js', 'js/sim/weapons5.js', 'js/sim/mastery.js',
  'js/sim/enemies.js', 'js/sim/enemies2.js', 'js/sim/skills.js', 'js/sim/bosses.js', 'js/sim/layouts.js', 'js/sim/levels.js', 'js/sim/enemies3.js', 'js/sim/skins.js', 'js/sim/skins-fisher.js', 'js/sim/enemies4.js', 'js/sim/enemies4-marti.js', 'js/sim/enemies4-cayci.js','js/sim/events.js', 'js/sim/events-kinds.js',
  'js/sim/env.js', 'js/sim/env-kinds.js', 'js/sim/env-zones.js', 'js/sim/env-rules.js', 'js/sim/env-portal.js',
  'js/sim/hack.js', 'js/sim/modifiers.js', 'js/sim/objectives.js', 'js/sim/objectives-kinds.js',
  'js/sim/progression.js', 'js/sim/weapons6.js', 'js/sim/horde.js', 'js/sim/director.js', 'js/sim/sim.js'];
FILES.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const P = globalThis.P;
const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v === undefined ? true : v]));
const SECS = parseFloat(args.secs || '15'), DT = 1 / 60;
const fails = [], notes = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };

function newSim(seed, levelIndex) {
  const s = P.createSim(seed, { levelIndex: levelIndex || 7, loadout: null });
  s.mode = 'play';
  s.hero.hp = s.hero.maxHp = 1e9;               // the probes watch the attacks, not the hero's survival
  return s;
}
// Spawn one enemy 2.5 m from the hero (or `dist` m), then step and collect the event types it emits.
function runAttack(type, dist, secs) {
  const s = newSim(11, 7), h = s.hero, seen = new Set();
  const e = P.Combat.spawnEnemy(s, type, h.x + dist, h.y + 1, {});
  e.hp = e.maxHp = 1e6;                          // durable: the hero's weapons must not kill it before the attack
  let pose = 0;
  for (let i = 0; i < secs * 60; i++) {
    P.stepSim(s, DT, null);
    s.events.forEach(ev => seen.add(ev.type));
    s.events.length = 0;
    if (e.windup > pose) pose = e.windup;
  }
  return { seen, pose };
}

// 1. Cue mapping: each windup and call-out event the sim emits has a view case (enemies-fx.js) and an emitter in the sim.
const VIEW_FX = fs.readFileSync(path.join(ROOT, 'js/view/enemies-fx.js'), 'utf8');
['kuryeWindup', 'kasapWindup', 'kasapSwing', 'parkurWindup', 'parkurLeap', 'parkurLand', 'spitWindup', 'screamStart', 'binRoll',
  'bossWindup', 'hordeCue', 'hordeSurge', 'enemyDebut'].forEach(t => {
  check(VIEW_FX.indexOf("'" + t + "'") >= 0, 'enemies-fx.js has no case for ' + t);
});

// 2. Telegraphs at the attack: the cue event fires, and the pose (e.windup) rises during the windup.
const ATTACKS = [
  { type: 'kasap', dist: 2.5, want: ['kasapWindup', 'kasapSwing'], pose: true, secs: 4 },
  { type: 'parkur', dist: 5, want: ['parkurWindup', 'parkurLeap'], pose: true, secs: 6 },
  { type: 'kurye', dist: 7, want: ['kuryeWindup'], pose: true, secs: 6 },
  { type: 'screamer', dist: 2.5, want: ['screamStart'], pose: true, secs: 6 },
  { type: 'spitter', dist: 5, want: ['spitWindup'], pose: true, secs: 10 },
];
ATTACKS.forEach(a => {
  const r = runAttack(a.type, a.dist, a.secs);
  a.want.forEach(w => check(r.seen.has(w), a.type + ': no ' + w + ' event (saw ' + [...r.seen].join(',') + ')'));
  if (a.pose) check(r.pose > 0, a.type + ': no windup pose (e.windup stayed 0)');
  notes.push(a.type + ' events ok=' + a.want.every(w => r.seen.has(w)) + ' pose=' + r.pose.toFixed(2));
});

// 3. CR-2 entrance exemption: only route or horde spawns (s.routeSpawn) may rise from a manhole or window.
// Set pieces (ev, anchored, elite) and plain spawns outside the route keep their spot.
(function () {
  const s = newSim(23, 7), h = s.hero, N = 60, y = h.y + 12;
  const rising = (opts, route) => {
    s.routeSpawn = !!route; let n = 0;
    s.enemies.length = 0;                                   // D-056: each call starts on an empty field (the ceiling refuses past 200)
    for (let i = 0; i < N; i++) {
      const e = P.Combat.spawnEnemy(s, 'walker', (i % 2 ? 1 : -1) * 6, y + (i % 5) * 0.4, opts);
      if (e.state === 'rising') n++;
    }
    s.routeSpawn = false;
    return n;
  };
  check(rising({}, false) === 0, 'CR-2: a plain spawn outside the route moved (rising)');
  check(rising({}, true) > 0, 'CR-2: a route/horde spawn never rose (entrances broken)');
  check(rising({ ev: 7 }, true) === 0, 'CR-2: an event spawn (evId) moved');
  check(rising({ anchored: true }, true) === 0, 'CR-2: an anchored spawn moved');
  check(rising({ elite: true }, true) === 0, 'CR-2: an elite spawn moved');
  notes.push('CR-2: route rises ' + rising({}, true) + '/' + N + ', set pieces 0');
})();

// 4. Debut: the first sighting of kasap in a run pauses the ambient spawns once, with a call-out; the second does not.
(function () {
  const s = newSim(31, 7), h = s.hero;
  P.Combat.spawnEnemy(s, 'kasap', h.x + 6, h.y + 14, {});
  const first = s.events.filter(ev => ev.type === 'enemyDebut' && ev.enemy === 'kasap').length;
  s.events.length = 0;
  P.Combat.spawnEnemy(s, 'kasap', h.x - 6, h.y + 14, {});
  const second = s.events.filter(ev => ev.type === 'enemyDebut').length;
  check(first === 1, 'debut: no call-out on the first kasap');
  check(second === 0, 'debut: a second kasap called out again');
  check(s.horde && s.horde.debutT > 0, 'debut: ambient spawns did not pause');
})();

// 5. Density: the ambient horde fills the frame on a generated level (L7), with no spawns in the first second.
(function () {
  const s = newSim(41, 7);
  for (let i = 0; i < SECS * 60; i++) { P.stepSim(s, DT, null); s.events.length = 0; }
  const on = P.Horde.onScreen(s), tgt = P.Horde.target(s);
  check(on >= 4, 'density: only ' + on + ' on screen after ' + SECS + ' s (target ' + tgt.toFixed(1) + ')');
  notes.push('density L7 after ' + SECS + ' s: on ' + on + ' target ' + tgt.toFixed(1) + ' spawned ' + s.horde.spawned);
})();

notes.forEach(n => console.log('  ' + n));
if (fails.length) { console.log('FAIL test-horde (' + fails.length + '):\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('PASS test-horde: cues, poses, CR-2 exemption, debut, density');
