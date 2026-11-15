// Cost of the ambient fauna view per frame (R1 birds-cats packet): times P.Fauna.update + P.Fauna.props on a heavy level,
// next to the sim step, with a stub canvas context (so it measures the JS cost of the fauna, not the GPU). Not a test.
// Usage: node prototype/tools/bench-fauna.js [--level=43] [--frames=1800]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { loadP } = require('./lib-load.js');
const P = loadP();
const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')));
const LEVEL = parseInt(args.level || '43', 10), FRAMES = parseInt(args.frames || '1800', 10), DT = 1 / 60;
function loadView(file) { vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'view', file), 'utf8'), { filename: file }); }
loadView('fauna-art.js'); loadView('fauna.js');
const noop = () => {};
const ctx = new Proxy({}, { get: (t, k) => (k in t ? t[k] : k === 'createLinearGradient' ? () => ({ addColorStop: noop }) : noop),
  set: (t, k, v) => { t[k] = v; return true; } });
const cam = { x: 0, y: 0 };
const R = { ctx, ppm: 39, W: 390, H: 844, cam, X: x => (x - cam.x) * 39, Y: y => -(y - cam.y) * 39, depth(y, fn) { fn(); } };
const pct = (a, p) => { const b = a.slice().sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(b.length * p))]; };
const ms = () => Number(process.hrtime.bigint()) / 1e6;
const s = P.createSim(7, { levelIndex: LEVEL, loadout: null });
s.mode = 'play'; s.hero.invuln = 1e9;
const simT = [], fauT = [];
for (let i = 0; i < FRAMES; i++) {
  let t0 = ms();
  P.stepSim(s, DT, { x: 0, y: 1 });
  simT.push(ms() - t0);
  cam.y = s.hero.y;
  t0 = ms();
  P.Fauna.update(DT, s); P.Fauna.props(R, s);
  fauT.push(ms() - t0);
}
const f = n => n.toFixed(4);
console.log('level ' + LEVEL + ', ' + FRAMES + ' frames, enemies at end ' + s.enemies.length + ', hero y ' + s.hero.y.toFixed(0));
console.log('sim step   p50 ' + f(pct(simT, 0.5)) + ' ms   p95 ' + f(pct(simT, 0.95)) + ' ms');
console.log('fauna view p50 ' + f(pct(fauT, 0.5)) + ' ms   p95 ' + f(pct(fauT, 0.95)) + ' ms   (update + props, stub context)');
