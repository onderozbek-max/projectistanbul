// Spawn entrance checks (AUDIT-7 CR-2, WAVE3 items 2-3) on generated levels, headless and seeded. Budget spawns
// (levels.js spawnBudget) and horde spawns (horde.js, s.routeSpawn) are route spawns: they may rise from a manhole,
// window, balcony or tram and move. Set pieces (event spawns, anchored balconies, elites) never get an entrance and
// never move. Portal doors (env-portal.js) rise in place. Tram entrances need a hood whose journey.js vehicles list
// 'tram'. Every hood runs at stages 1 and 3; the hero walks up the route so marks and set pieces happen.
// Usage: node prototype/tools/check-entrances.js [--seeds=3] [--secs=30]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
// Same module list as bot.js: index.html's sim scripts (view, story and flow files excluded).
const NOT_SIM = /^js\/(view|story|dialogue)\/|^js\/main\.js$|^js\/meta\/meta-(ui|map|hub|gear|stats|arsenal|collect|daily|save)\.js$/;
const FILES = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)]
  .map(m => m[1]).filter(f => !NOT_SIM.test(f));
FILES.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const P = globalThis.P;
const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v === undefined ? true : v]));
const SEEDS = parseInt(args.seeds || '3', 10), SECS = parseFloat(args.secs || '30'), DT = 1 / 60, STAGES = [1, 3];
const KINDS = ['manhole', 'window', 'door', 'balcony', 'tram'];
const fails = [], notes = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };

// Spawn origin: spawnOne (levels.js, a top-level script function, so a global) is the budget spawner's per-enemy call.
// Only spawns made inside spawnBudget count as budget; introGroup's calls do not.
let inBudget = false;
const spawnOne = globalThis.spawnOne;
globalThis.spawnOne = function () {
  const prev = inBudget;
  inBudget = /\bspawnBudget\b/.test(new Error().stack);
  try { return spawnOne.apply(this, arguments); } finally { inBudget = prev; }
};

// Each spawn is classed by its caller: portal (env opening door), set (event, anchored or elite), budget, route (horde),
// plain (the rest: scripted calls, hack and puddle spawns).
function classOf(route, o) {
  if (o.door) return 'portal';
  if (o.ev !== undefined || o.anchored || o.elite) return 'set';
  if (inBudget) return 'budget';
  return route ? 'route' : 'plain';
}
const stats = {}, perHood = {};
const spawnEnemy = P.Combat.spawnEnemy;
P.Combat.spawnEnemy = function (s, type, x, y, opts) {
  const o = opts || {}, cls = classOf(!!s.routeSpawn, o);
  const e = spawnEnemy.call(this, s, type, x, y, o);
  if (!e) return e;                                            // D-056: the hard ceiling refused it
  if (!s.gen || s.gen.arena) return e;                         // E3.entrance skips these too
  const kind = e.entrance ? e.entrance.kind : null, moved = e.x !== x || e.y !== y;
  const st = stats[cls] || (stats[cls] = { n: 0, risen: 0, moved: 0, kinds: {} });
  st.n++;
  if (kind) { st.risen++; st.kinds[kind] = (st.kinds[kind] || 0) + 1; }
  if (moved) st.moved++;
  const H = perHood[s.gen.hood.id] || (perHood[s.gen.hood.id] = { tram: 0 });
  if (kind === 'tram') H.tram++;
  return e;
};

const WALK = { x: 0, y: 1 };
function run(seed, index) {
  const s = P.createSim(seed, { levelIndex: index, loadout: null });
  s.mode = 'play';
  s.hero.hp = s.hero.maxHp = 1e9;
  for (let i = 0; i < SECS * 60; i++) { P.stepSim(s, DT, WALK); s.events.length = 0; }
}
const HOODS = P.Journey.hoods, PER = P.Journey.levelsPerHood;
HOODS.forEach((h, hi) => STAGES.forEach(st => {
  for (let seed = 1; seed <= SEEDS; seed++) run(seed * 101 + hi, hi * PER + st);
}));
const get = c => stats[c] || { n: 0, risen: 0, moved: 0, kinds: {} };

// 1. Budget spawns (the spawnBudget route): manhole, window and balcony entrances happen, and they move the spawn.
const BUDGET = get('budget');
check(BUDGET.n > 0, 'no budget spawns were seen');
['manhole', 'window', 'balcony'].forEach(k => check((BUDGET.kinds[k] || 0) > 0, 'budget (route) spawns never used a ' + k + ' entrance'));
check(BUDGET.moved > 0, 'budget (route) spawns never moved to an entrance');

// 2. Set pieces: seen, and never given an entrance or moved.
const SET = get('set');
check(SET.n > 0, 'no set-piece spawns were seen; the check proves nothing');
check(SET.risen === 0 && SET.moved === 0, 'set pieces got an entrance (' + SET.risen + ') or moved (' + SET.moved + '): ' + JSON.stringify(SET.kinds));

// 3. Horde spawns (route) move too; portal doors rise in place, so they happen and never move.
check(get('route').moved > 0, 'horde (route) spawns never moved to an entrance');
const PORTAL = get('portal');
check((PORTAL.kinds.door || 0) > 0, 'no door entrance from an env portal');
check(PORTAL.moved === 0, 'portal spawns moved (' + PORTAL.moved + ')');

// 4. Tram: only in hoods whose vehicles list 'tram'. Samatya has none; each tram hood gets at least one.
const tramHoods = [];
HOODS.forEach(h => {
  const has = (h.vehicles || []).indexOf('tram') >= 0, n = (perHood[h.id] || { tram: 0 }).tram;
  if (has) tramHoods.push(h.id + ':' + n);
  check(has ? n > 0 : n === 0, h.id + (has ? ': no tram entrance in a tram hood' : ': tram entrance in a hood with no tram (' + n + ')'));
});
notes.push('tram entrances per tram hood: ' + tramHoods.join(' '));

// Summary table over all classes.
const rows = ['budget', 'route', 'set', 'portal', 'plain'].map(c => {
  const st = get(c);
  return '  ' + c.padEnd(7) + ' spawns ' + String(st.n).padStart(6) + '  risen ' + String(st.risen).padStart(5) + '  moved ' +
    String(st.moved).padStart(5) + '  ' + KINDS.map(k => k + ' ' + (st.kinds[k] || 0)).join('  ');
});
console.log(rows.join('\n'));
notes.forEach(n => console.log('  ' + n));
if (fails.length) { console.log('FAIL check-entrances (' + fails.length + '):\n  ' + fails.join('\n  ')); process.exitCode = 1; }
else console.log('PASS check-entrances: budget and horde spawns enter from manholes, windows, balconies and tram stops; ' +
  'set pieces 0; tram only in tram hoods (' + HOODS.length + ' hoods x ' + STAGES.length + ' stages x ' + SEEDS + ' seeds, ' + SECS + ' s)');
