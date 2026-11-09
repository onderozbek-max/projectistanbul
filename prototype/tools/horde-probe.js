// Horde probe (lane H, WAVE3): on-screen enemy counts over generated levels, measured on the bot's own runs.
// It runs tools/bot.js unchanged and wraps P.stepSim to sample the camera frame. "On screen" = inside the frame the view
// draws (generated levels: cam.x = 0, cam.w = widthM, or holdWidthM when zoomed out; cam.y = hero y with look-ahead,
// clamped as fx.js targetY does). Counts active, non-dead, non-dormant enemies. Samples are binned by tenth of the route.
// Usage: same flags as bot.js, plus:
//   node prototype/tools/horde-probe.js --levels=2,7,12,22,5,25,50 --seeds=4 [--root=/path/to/prototype] [--sample=0.5] [--perf]
// --root runs a different copy (e.g. a `git archive` of the baseline). Sim ms per step is measured with --perf.
'use strict';
const path = require('path');
const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v === undefined ? true : v]));
const ROOT = args.root ? path.resolve(args.root) : path.join(__dirname, '..');
const SAMPLE = parseFloat(args.sample || '0.5'), DEC = 10;

// Route-level sampling: each sim object is one run. Bosses are tracked apart from the route.
const runs = [], perf = new Map();
let last = { t: -1e9, seed: null, idx: null };
function onScreen(s) {
  const h = s.hero, G = s.geo, V = P.CFG.view;
  const w = s.dir.zoomOut ? V.holdWidthM : V.widthM, half = P.viewHalfH(w);
  const look = h.moving ? h.fy * V.lookAhead : 0;
  const cy = Math.min(Math.max(h.y + look, half - 3), G.length + 2 - half);
  let n = 0;
  for (const e of s.enemies) {
    if (e.dead || e.state === 'dormant') continue;
    if (Math.abs(e.x) <= w / 2 && Math.abs(e.y - cy) <= half) n++;
  }
  return n;
}
let cur = null;                                // the run being sampled (one sim object per bot run)
function sample(s, ms) {
  if (!s.geo) return;                          // generated levels only (L1 is scripted)
  if (!cur || cur.sim !== s) { cur = { sim: s, idx: s.levelIndex, next: 0, samples: [] }; runs.push(cur); }
  if (ms !== null) { if (!perf.has(s.levelIndex)) perf.set(s.levelIndex, []); perf.get(s.levelIndex).push(ms); }
  if (s.runT >= cur.next) {
    cur.next = s.runT + SAMPLE;
    const prog = Math.min(DEC - 1, Math.floor(DEC * s.hero.y / Math.max(1, s.geo.exitY)));
    cur.samples.push({ prog, on: onScreen(s), tgt: P.Horde && P.Horde.target ? P.Horde.target(s) : 0, boss: !!(s.gen && s.gen.boss && !s.gen.boss.dead && s.gen.arena) });
    cur.hz = s.horde ? { spawned: s.horde.spawned, miss: s.horde.miss, surges: s.horde.surges } : { spawned: 0, miss: 0, surges: 0 };
  }
}

// bot.js loads the sim files with vm into globalThis.P. The hook below sees every stepSim, before and after the real one.
const real = { fn: null };
const hook = {};
Object.defineProperty(hook, 'stepSim', { configurable: true, enumerable: true, get() { return wrapped; }, set(fn) { real.fn = fn; } });
globalThis.P = hook;
function wrapped(s, dt, input) {
  const t0 = process.hrtime.bigint();
  const res = real.fn(s, dt, input);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  sample(s, args.perf ? ms : null);
  return res;
}

const med = a => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : 0; };
const pct = (a, p) => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.min(b.length - 1, Math.floor(p * b.length))] : 0; };

process.on('exit', () => {
  const byLevel = new Map();
  runs.forEach(r => { if (!byLevel.has(r.idx)) byLevel.set(r.idx, []); byLevel.get(r.idx).push(r); });
  const levels = [...byLevel.keys()].sort((a, b) => a - b);
  console.log(`\nhorde-probe root=${ROOT} sample=${SAMPLE}s (on = enemies inside the camera frame, median/p95/max over samples)`);
  console.log('level  runs  on-med  on-p95  on-max  boss-on(med/max)  ' + Array.from({ length: DEC }, (_, k) => ' d' + k).join(' ') + '   (median on-screen per tenth of route)');
  levels.forEach(idx => {
    const list = byLevel.get(idx), all = [].concat(...list.map(r => r.samples.filter(x => !x.boss).map(x => x.on)));
    const boss = [].concat(...list.map(r => r.samples.filter(x => x.boss).map(x => x.on)));
    const bins = [];
    for (let k = 0; k < DEC; k++) {
      const v = [].concat(...list.map(r => r.samples.filter(x => x.prog === k && !x.boss).map(x => x.on)));
      bins.push(v.length ? String(med(v)).padStart(3) : '  -');
    }
    console.log(`${String(idx).padEnd(6)} ${String(list.length).padEnd(5)} ${String(med(all)).padStart(6)}  ${String(pct(all, 0.95)).padStart(6)}  ${String(Math.max(0, ...all)).padStart(6)}  ` +
      `${(boss.length ? med(boss) + '/' + Math.max(...boss) : '-').padStart(16)}  ${bins.join(' ')}`);
    const route = list.map(r => r.samples.filter(x => !x.boss && x.tgt > 0 && x.prog >= 2 && x.prog <= 7)).flat();
    const ratio = route.length ? med(route.map(x => x.on)) / Math.max(1, med(route.map(x => x.tgt))) : 0;
    const hz = list.map(r => r.hz || { spawned: 0, miss: 0, surges: 0 });
    console.log(`       horde (d2-d7): target ${med(route.map(x => x.tgt)).toFixed(0)} on/target ${ratio.toFixed(2)} · spawns/run ${med(hz.map(x => x.spawned))} · misses ${med(hz.map(x => x.miss))} · surges ${med(hz.map(x => x.surges))}`);
  });
  if (args.perf) levels.forEach(idx => {
    const m = perf.get(idx) || [];
    console.log(`L${idx} stepSim ms: median ${med(m).toFixed(3)} p95 ${pct(m, 0.95).toFixed(3)} max ${Math.max(0, ...m).toFixed(2)} (${m.length} steps)`);
  });
});

// Hand over to the bot of ROOT (its own table prints first; the probe table follows at exit).
process.argv = [process.argv[0], path.join(ROOT, 'tools', 'bot.js'), ...process.argv.slice(2).filter(a => !/^--(root|sample|perf)/.test(a))];
require(path.join(ROOT, 'tools', 'bot.js'));
