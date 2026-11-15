// Arena evolution checks (view only; js/view/arena-evolve.js, arena-evolve-decals.js, js/config-arena-evolve.js).
// Node, no DOM: config shape and palette rules (design-system 3.1, 3.2, 6.4); the simulation never names the evolution code;
// every hood-level has a deterministic treatment and the 100 keys are distinct; the ratchet only rises; decal and dressing caps by
// quality tier; the sidewalk mix, the boss ramp and the plan; the sim state hash is the same with the view reading the evolution
// state and with the evolution off (golden trace, as in test-modes.js); the band and cache memory stays under 64 MB.
// Headless Chrome over CDP (skipped with a note when Chrome is not found): the treated floor stays mid-value for all 20 hoods and 5
// stages (worst case at the end light and the boss grade); Reduce motion holds the evolve layers still (the lamps and the boss ramp
// move without it); the sim state is the same with the evolution on and off while the renderer runs in both.
// Usage: node prototype/tools/test-arena-evolve.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto'), http = require('http'), net = require('net'), os = require('os');
const { spawn } = require('child_process');
const { loadP, ROOT } = require('./lib-load.js');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const fails = []; let passes = 0;
const ok = (c, m) => { if (c) passes++; else fails.push(m); };
// Floor band (design-system 6.4): mid value. stone_grey (#8A8F98) is about L* 59. The authored ground tiles (mortar included) span
// about L* 28 to 60, so the band is 30 to 72; the stronger check is that the treatment never darkens a floor by more than 4 L*
// against its own authored tile (see the browser part).
const FLOOR = [30, 72], FLOOR_DROP = 4;

// ---------- Node part ----------
const P = loadP();
['js/view/arena-evolve.js', 'js/view/arena-evolve-decals.js'].forEach(f => vm.runInThisContext(read(f), { filename: f }));
const E = P.ArenaEvolve, C = P.CFG.arenaEvolve;
const savedQ = P.Quality, savedS = P.Settings, savedOn = C.on;

// Static: config shape and palette rules.
ok(C.endLight.length === 20 && C.ground.length === 20 && C.level.length === 5, 'config: 20 end lights, 20 ground rows, 5 stage rows');
ok(C.endLight.every(r => r.length === 5 && r.slice(0, 3).every(v => v >= 0 && v <= 255) && r[3] >= 0 && r[3] <= 0.2 && r[4] >= 0.5 && r[4] <= 3),
  'config: end light colours 0..255, alpha up to 0.2, lantern gain 0.5..3');
const TOKENS = ['#8A8F98', '#B5651D', '#E9A23B', '#1B4965', '#F4EBDD'];   // stone_grey, tea_amber, simit_gold, bosphorus_blue, paper (3.1)
ok(C.ground.every(g => TOKENS.indexOf(g[0]) >= 0 && g[1] > 0 && g[1] <= 0.12), 'config: ground tints are brand tokens (3.1) at 12% or less');
ok(C.level.every(l => l.wear > 0 && l.wear <= 0.5 && l.tint > 0.5 && l.tint <= 1.3 && l.dens > 0.5 && l.dens <= 1.5), 'config: level wear, tint and density in range');
const meanDens = C.level.reduce((a, l) => a + l.dens, 0) / C.level.length;
ok(meanDens <= 1.0 + 1e-9, 'frame time: the mean prop density over the five stages is at most the authored 1.0 (got ' + meanDens.toFixed(3) + ')');
['decal', 'dressing', 'lamps'].forEach(k => {
  const a = C.cap[k];
  ok(a.length === 3 && a[0] >= a[1] && a[1] >= a[2], 'config: ' + k + ' caps fall with the quality tier');
});
ok(C.flicker.hz > 0 && C.flicker.hz < 3 && C.flicker.amp > 0 && C.flicker.amp <= 0.3, 'config: lamp flicker is under 3 Hz and within 30% alpha');
ok(C.boss.ramp >= 0.8 && C.boss.gradeA <= 0.15 && C.boss.vig <= 0.3, 'config: the boss mood eases in and stays gentle');
ok(C.band.maxBands >= 3 && C.band.h > 0 && C.band.w >= 9, 'config: decal bands cover the lane and the sidewalks');
// Memory: decal bands at the largest raster, and the composite ground cache (6 per tile, tiles up to 12 m), stay under 64 MB.
const bandBytes = C.band.w * C.band.kMax * C.band.h * C.band.kMax * 4 * C.band.maxBands;
const tileBytes = 12 * C.band.kMax * 12 * C.band.kMax * 4 * 6;
ok(bandBytes + tileBytes <= 64 * 1024 * 1024, 'memory: decal bands and ground composites under 64 MB (' + ((bandBytes + tileBytes) / 1048576).toFixed(1) + ' MB worst case)');
// Gameplay tokens (3.2) are never used for decoration: check the evolution sources and the config.
const GAMEPLAY = ['#3DDCFF', '#FF4D2E', '#5BD16E', '#3D8BFF', '#8E7CFF', '#FFD166', '#E040FB', '#7D8B6A', '#FFC93C'];
const srcUp = ['js/view/arena-evolve.js', 'js/view/arena-evolve-decals.js', 'js/config-arena-evolve.js'].map(f => read(f).toUpperCase());
ok(GAMEPLAY.every(h => srcUp.every(s => s.indexOf(h) < 0)), 'no gameplay token colour (design-system 3.2) in the evolution files');
ok(C.litter.every(k => /^[a-z]+$/.test(k)) && new Set(C.litter).size === C.litter.length, 'config: litter kinds are unique names');

// The simulation never names the evolution code, and the hooks are where they belong.
const simFiles = fs.readdirSync(path.join(ROOT, 'js/sim')).filter(f => f.endsWith('.js'));
ok(simFiles.every(f => !/ArenaEvolve|arenaEvolve|arena-evolve/.test(read('js/sim/' + f))), 'sim: no file in js/sim names the arena evolution');
const idx = read('index.html');
ok(idx.indexOf('config-arena-evolve.js') > 0 && idx.indexOf('config-arena-evolve.js') < idx.indexOf('js/view/arena-evolve.js'), 'index.html: config before the view');
ok(idx.indexOf('js/view/arena-evolve.js') > idx.indexOf('js/view/arena-sky.js') && idx.indexOf('js/view/arena-evolve-decals.js') > idx.indexOf('js/view/arena-evolve.js'),
  'index.html: the evolve files load after the arena files, decals after core');
const still = read('tools/arena-still.html');
ok(still.indexOf('arena-evolve-decals.js') > 0 && still.indexOf('config-arena-evolve.js') > 0, 'arena-still.html loads the evolution files');
const render = read('js/view/render.js');
ok(/hook\(P\.ArenaEvolve, 'drawGround', s\)/.test(render) && /hook\(P\.ArenaEvolve, 'drawLights', s\)/.test(render) && /hook\(P\.ArenaEvolve, 'screen', s\)/.test(render),
  'render.js: three hooks (ground, lights, screen)');
ok(/P\.ArenaEvolve\.ground\(R, th, s, g\)/.test(read('js/view/render-world.js')) && /P\.ArenaEvolve\.streetMix\(s, props\)/.test(read('js/view/istanbul.js')),
  'render-world.js and istanbul.js call the treatment hooks');
ok(!/ArenaEvolve/.test(read('js/view/quality.js')) && !/ArenaEvolve/.test(read('js/main.js')), 'quality.js and main.js are untouched by the evolution');

// Treatments: deterministic, 100 distinct keys, no two stages of one hood alike, all eight mirror and offset variants used.
const keys = new Set(); let det = true, sameWithin = 0; const offs = new Set();
for (let h = 0; h < 20; h++) {
  const seen = new Set();
  for (let L = 1; L <= 5; L++) {
    const t = E.treatment(h, L), t2 = E.treatment(h, L);
    if (t !== t2 || t.key !== t2.key) det = false;
    keys.add(t.key); offs.add(t.flipX + '' + t.flipY + t.shiftY);
    const vis = [t.flipX, t.flipY, t.shiftY, t.wear, t.tint, t.tintA, t.dens, t.sheen].join('|');   // what shows on the ground
    if (seen.has(vis)) sameWithin++;
    seen.add(vis);
    ok(t.end.length === 5 && t.tint && t.wear > 0, 'treatment ' + h + '.' + L + ' is complete');
  }
}
ok(det, 'treatments are deterministic (same object and key on every call)');
ok(keys.size === 100, '100 hood-levels, 100 distinct treatment keys (got ' + keys.size + ')');
ok(sameWithin === 0, 'no two stages of one hood share a visible ground treatment (' + sameWithin + ' clashes)');
ok(offs.size === 8, 'all eight mirror and offset variants are in use across the walk');

// Progress, ratchet and the boss ramp on a fake level state.
const fake = (y, extra) => Object.assign({ levelIndex: 6, seed: 3, hero: { y: y }, geo: { exitY: 200, holdY: 188, blocks: [] }, props: { shutter: 0 }, enemies: [], gen: { seg: 'A' } }, extra || {});
ok(E.progress(fake(0)) === 0 && E.progress(fake(200)) === 0.85 && E.progress(fake(100)) > 0.4 && E.progress(fake(100)) < 0.5, 'progress runs 0 to 0.85 along the route');
ok(E.progress(fake(200, { props: { shutter: 1 } })) === 1, 'progress reaches 1 when the gate is open');
const bossS = fake(180, { geo: { exitY: 200, holdY: 188, boss: true, blocks: [] }, gen: { arena: true, seg: 'D', boss: { hp: 50, maxHp: 100, dead: false } } });
ok(E.progress(bossS) > 0.2 && E.progress(bossS) < 0.8, 'boss progress: approach then half for the fight');
bossS.hero.y = 188; bossS.gen.boss.hp = 0; bossS.gen.boss.dead = true;
ok(E.progress(bossS) === 1, 'boss progress reaches 1 at the hold line with the boss dead');
let rt = 0, mono = true;
const rs = fake(0, { levelIndex: 6 });
for (let y = 0; y <= 200; y += 5) {
  rs.hero.y = y; rs.gen.seg = ['A', 'B', 'C', 'D'][Math.min(3, Math.floor(y / 50))]; rs.enemies = new Array(Math.round(y / 3)).fill({});
  E.setRatchet(rs, E.ratchetTarget(rs)); const r = E.stats(rs).ratchet; if (r < rt - 1e-12) mono = false; rt = r;
}
ok(mono && rt <= 1 && rt > 0.5, 'the ratchet only rises along a run and reaches the upper range (got ' + rt.toFixed(2) + ')');
rs.hero.y = 0; rs.enemies = []; rs.gen.seg = 'A'; E.setRatchet(rs, 0);
ok(E.stats(rs).ratchet >= rt - 1e-9, 'the ratchet does not fall when the route or the horde ebbs');

// Boss ramp: none before the arena, eases in over boss.ramp s, Reduce motion jumps to full at once.
const realNow = performance.now.bind(performance); let clk = 1000;
performance.now = () => clk;
const bs = { gen: { arena: false } };
P.Settings = { reduceMotion: false };
ok(E.bossK(bs) === 0, 'boss mood is off before the arena starts');
bs.gen.arena = true;
const k0 = E.bossK(bs); clk += C.boss.ramp * 500; const k1 = E.bossK(bs); clk += C.boss.ramp * 1000; const k2 = E.bossK(bs);
ok(k0 === 0 && k1 > 0.2 && k1 < 0.9 && k2 === 1, 'boss mood eases in over the ramp (' + k0.toFixed(2) + ', ' + k1.toFixed(2) + ', ' + k2 + ')');
const bs2 = { gen: { arena: true } }; P.Settings = { reduceMotion: true };
ok(E.bossK(bs2) === 1, 'Reduce motion: the boss mood is at full at once');
performance.now = realNow;

// Caps by tier: the decal layer never exceeds the tier's cap, the oldest go first, and a full layer stays full.
[0, 1, 2].forEach(t => {
  P.Quality = { tier: t };
  const s = fake(10, { seed: 11, levelIndex: 2 });
  for (let i = 0; i < 400; i++) E.addDecal(s, i % 3 ? 'blood' : 'scorch', (i % 9) - 4, i * 0.5, 0.4, i * 0.1, 0.3);
  const st = E.stats(s);
  ok(st.decals === C.cap.decal[t] && st.cap === C.cap.decal[t], 'tier ' + t + ': decals capped at ' + C.cap.decal[t] + ' (have ' + st.decals + ')');
  E.addDecal(s, 'rubble', 0, 999, 0.5, 1, 0, 'stone');
  ok(E.stats(s).decals === C.cap.decal[t], 'tier ' + t + ': a full layer stays full (oldest out, count held)');
});
P.Quality = { tier: 0 };

// The plan: bounded, sorted, seeded, clear of solid blocks, litter from the configured kinds.
const pl = E.plan(fake(0, { seed: 11, levelIndex: 2 }));
ok(pl.dress.length <= C.dress.litter + C.dress.bins + C.dress.sheen && pl.lamps.length <= C.dress.lamps, 'plan: items within the configured counts');
ok(pl.dress.every(it => it.t >= 0 && it.t <= 1) && pl.dress.every((it, i, a) => i === 0 || a[i - 1].t <= it.t), 'plan: items sorted by threshold');
ok(pl.dress.filter(it => it.kind === 'litter').every(it => C.litter.indexOf(it.k) >= 0), 'plan: litter uses the configured kinds only');
ok(pl.dress.filter(it => it.kind === 'litter').length >= 40, 'plan: litter count is high enough for the escalation to show');
const plA = E.plan(fake(0, { seed: 11, levelIndex: 2 }));
ok(plA.dress.length === pl.dress.length && plA.dress[0].x === pl.dress[0].x && plA.dress[5].y === pl.dress[5].y, 'plan: the same seed and level give the same plan');
const plB = E.plan(fake(0, { seed: 12, levelIndex: 7 }));
ok(plB.dress[0].x !== pl.dress[0].x || plB.dress[0].y !== pl.dress[0].y, 'plan: another seed or level gives another plan');
const blockS = fake(0, { seed: 11, levelIndex: 2, geo: { exitY: 200, holdY: 188, blocks: [{ rc: { xMin: -7, xMax: 7, yMin: 0, yMax: 200 } }] } });
const bp = E.plan(blockS);
ok(bp.dress.filter(it => it.kind !== 'sheen').length === 0 && bp.lamps.length === 0, 'plan: no litter, bin or lamp inside a solid block');

// Sidewalk mix: the level keeps the kinds, the density is bounded, and the off switch gives the hood's own weights.
const props = { cafe: 3, simit: 2, misir: 2, kestane: 2, cicek: 2, bin: 2, cat: 2 };
const mix = E.streetMix(fake(0, { levelIndex: 9 }), props);
ok(Object.keys(mix.w).join() === Object.keys(props).join() && mix.keep >= 0.3 && mix.keep <= 0.9, 'street mix: same kinds, density in range');
ok(E.streetMix(fake(0, { levelIndex: 9 }), props) === mix, 'street mix: cached per level and props');
ok(Object.values(mix.w).join() !== Object.values(props).join(), 'street mix: a level favours some kinds over the hood weights');
C.on = false;
ok(E.streetMix(fake(0, { levelIndex: 9 }), props).w === props && E.streetMix(fake(0, { levelIndex: 9 }), props).keep === 0.6, 'street mix: off means the hood weights and density');
C.on = true;

// The sim: a golden trace with the view reading the evolution state (on and off) must match the plain run.
function traceSim(view, on) {
  C.on = on;
  const s = P.createSim(9, { levelIndex: 12, loadout: { gear: {}, stats: {} } });
  P.startPlay(s);
  let n = 0;
  while (s.runT < 25 && s.mode === 'play') {
    P.stepSim(s, 1 / 60, { x: Math.sin(n / 37) * 0.6, y: -1 });
    if (view && n % 7 === 0) {
      const w = E.where(s);
      E.progress(s); E.ratchetTarget(s); E.treatment(w.h, w.L); E.streetMix(s, { cafe: 1, bin: 2 }); E.plan(s); E.stats(s);
    }
    P.drainEvents(s);
    if (s.pendingLevels > 0) P.Progression.choose(s, P.Progression.makeOffer(s).cards[0]);
    while (s.pendingChests > 0) P.Progression.openChest(s, P.Progression.chestReward(s));
    n++;
  }
  const snap = { t: s.runT, hp: s.hero.hp, x: s.hero.x, y: s.hero.y, kills: s.kills, mode: s.mode, xp: s.xp, level: s.level,
    enemies: s.enemies.map(e => [e.type, +e.x.toFixed(6), +e.y.toFixed(6), +e.hp.toFixed(6)]), drops: s.drops.length,
    hold: s.dir.hold.t, gateOpen: s.props.shutterOpen, marks: s.gen ? s.gen.marks.length : 0, roster: s.gen ? s.gen.roster : null, tally: s.tally.kills };
  return crypto.createHash('sha256').update(JSON.stringify(snap)).digest('hex').slice(0, 16);
}
const hA = traceSim(false, true), hB = traceSim(true, true), hC = traceSim(true, false);
ok(hA === hB && hB === hC, 'sim state hash is the same with the evolution read on, read off and not read (' + hA + ' ' + hB + ' ' + hC + ')');
C.on = savedOn; P.Quality = savedQ; P.Settings = savedS;

// ---------- Chrome part (skipped without Chrome) ----------
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));
function freePort() { return new Promise((res, rej) => { const srv = net.createServer(); srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => res(p)); }); srv.on('error', rej); }); }
function serve() {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml' };
  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html', file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(res => srv.listen(0, '127.0.0.1', () => res(srv)));
}
function cdpClient(wsUrl) {
  const ws = new WebSocket(wsUrl); let id = 0; const pend = new Map(), listeners = [];
  const ready = new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } else if (m.method) listeners.forEach(f => f(m)); };
  return { ready, on: f => listeners.push(f), send: (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); }), close: () => ws.close() };
}
// Page-side checks (runs inside arena-still.html after its own first frame). Returns JSON.
const PAGE = `(async () => {
  const R = P.Render, E = P.ArenaEvolve, CFG = P.CFG.arenaEvolve, out = { lum: [], base: [] };
  const W = R.W, H = R.H, savedCtx = R.ctx, savedCam = R.cam, savedPpm = R.ppm, savedDpr = R.dpr, savedOn = CFG.on;
  const savedSet = P.Settings ? P.Settings.reduceMotion : undefined;
  if (!P.Settings) P.Settings = {};
  CFG.on = true;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const lstar = (r, g, b) => {
    const f = c => { c = Math.min(255, Math.max(0, c)) / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const Y = 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    return Y > 0.008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y;
  };
  const scratch = document.createElement('canvas'); scratch.width = W * 2; scratch.height = H * 2;
  const sctx = scratch.getContext('2d');
  const hashCanvas = () => { const d = sctx.getImageData(0, 0, scratch.width, scratch.height).data; let h = 2166136261; for (let i = 0; i < d.length; i += 4) { h ^= d[i] | (d[i + 1] << 8) | (d[i + 2] << 16); h = Math.imul(h, 16777619) >>> 0; } return h; };
  const mkLevel = lvl => { const li = P.Journey.level(lvl);
    return { li: li, th: P.Themes.get(li.hood.theme), s: { levelIndex: lvl, levelInfo: li, theme: li.hood.theme, seed: 5, geo: { exitY: 230, holdY: 218, blocks: [], sub: li.stage }, hero: { y: 0 }, props: { shutter: 0 }, enemies: [], gen: { seg: 'A' }, dir: { hold: {} } } }; };

  // (1) floor value: the treated ground tile for every hood and stage, at the worst case of the level (end light at full alpha, and
  // on the boss stage the boss grade at full). Mortar joints are included, so the band is for the whole tile.
  const k = Math.max(8, Math.round(R.ppm / 4) * 4);
  // Mean L* of a tile canvas; with an end light (and boss grade) painted over it, as the screen does at the end of the level.
  const meanL = (cv, end, bg) => {
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let sum = 0, n = 0;
    for (let i = 0; i < d.length; i += 16) {
      let r = d[i], gg = d[i + 1], b = d[i + 2];
      if (end) { r = r * (1 - end[3]) + end[0] * end[3]; gg = gg * (1 - end[3]) + end[1] * end[3]; b = b * (1 - end[3]) + end[2] * end[3]; }
      if (bg) { r = r * (1 - bg.gradeA) + bg.grade[0] * bg.gradeA; gg = gg * (1 - bg.gradeA) + bg.grade[1] * bg.gradeA; b = b * (1 - bg.gradeA) + bg.grade[2] * bg.gradeA; }
      sum += lstar(r, gg, b); n++;
    }
    return sum / n;
  };
  for (let h = 0; h < 20; h++) for (let Lv = 1; Lv <= 5; Lv++) {
    const m = mkLevel(h * 5 + Lv), tr = E.treatment(h, Lv);
    const base = P.ArenaArt.tileFor(m.th.id, m.s, 'ground', k) || P.Themes.tile(m.th, 'ground', k);
    const g = E.ground(R, m.th, m.s, base) || base;
    const bg = Lv === 5 ? CFG.boss : null;
    out.lum.push([h, Lv, +meanL(g.cv, tr.end, bg).toFixed(1)]);
    out.base.push([h, Lv, +meanL(base.cv, null, null).toFixed(1)]);
  }

  // Painting the evolve layers alone onto the scratch canvas, at a given camera height.
  const frameCam = y => { R.cam = { x: 0, y: y, w: P.CFG.view.widthM, zoom: 1, ox: 0, oy: 0, rot: 0, trauma: 0, punchT: 0, kx: 0, ky: 0 }; R.ppm = W / R.cam.w; };
  const paint = (s, y) => {
    frameCam(y); R.ctx = sctx; R.dpr = 2;
    sctx.setTransform(1, 0, 0, 1, 0, 0); sctx.fillStyle = '#000'; sctx.fillRect(0, 0, scratch.width, scratch.height);
    sctx.setTransform(2, 0, 0, 2, 0, 0);
    E.drawGround(R, s); E.drawLights(R, s); E.screen(R, s);
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    return hashCanvas();
  };
  const warm = (s, y) => { for (let i = 0; i < 6; i++) paint(s, y); };   // bands are baked over a few frames (two a frame)
  const mkSim = (lvl, seed) => { const s = P.createSim(seed, { levelIndex: lvl, loadout: null }); P.Fx.reset(s); s.mode = 'play'; s.hero.hp = s.hero.maxHp = 1e9; return s; };
  // The frame loop's event path (main.js handleEvents): sim events go to the view, which makes the blood, scorch and rubble.
  const pump = s => P.drainEvents(s).forEach(ev => P.Fx.onEvent(ev, s));
  // The view renders during the walk as it does in play (decals are made from the particles while they live, so the view must see them).
  const walk = (s, secs, y) => { s.hero.y = Math.max(2, y); for (let i = 0; i < secs * 60; i++) { P.stepSim(s, 1 / 60, { x: 0, y: 0 }); pump(s); if (i % 20 === 0) { R.ctx = savedCtx; R.dpr = savedDpr; P.Render.frame(s, null); } } };

  // (2) hood 4 (eminonu) stage 4 after a walk to the gate: the lamps are lit and the decals and dressing are on.
  const s4 = mkSim(4 * 5 + 4, 5);
  walk(s4, 15, 0.97 * s4.geo.exitY);
  // A fight at the gate: kill and blast events through the same handler as the frame loop, so the view makes the blood and the
  // scorch marks the decal layer then keeps (the test sim has no attack input, so the events are fed in directly).
  for (let i = 0; i < 24; i++) {
    const x = (i % 7 - 3) * 0.9, y = s4.hero.y - 6 + i * 0.5;
    P.Fx.onEvent({ type: 'kill', x: x, y: y, dx: 0, dy: 0, enemy: 'walker' }, s4);
    if (i % 3 === 0) P.Fx.onEvent({ type: 'blast', x: x, y: y, r: 1.4 }, s4);
  }
  P.Settings.reduceMotion = false;
  warm(s4, s4.hero.y);
  const lamps = E.plan(s4).lamps.filter(l => l.on);
  const yl = lamps.length ? lamps[0].y : s4.hero.y;
  warm(s4, yl);
  P.Settings.reduceMotion = true;
  const a1 = paint(s4, yl); await sleep(330); const a2 = paint(s4, yl);
  out.still = a1 === a2;
  P.Settings.reduceMotion = false;
  const m1 = paint(s4, yl); await sleep(530); const m2 = paint(s4, yl); await sleep(530); const m3 = paint(s4, yl);
  out.moving = m1 !== m2 || m2 !== m3;
  out.lamps = lamps.length;
  out.stats = E.stats(s4);

  // (3) the boss stage: under Reduce motion the grade and vignette are at full at once (still); without it they ease in (moving).
  const sb = mkSim(4 * 5 + 5, 6); sb.gen.arena = true;
  warm(sb, sb.hero.y);
  P.Settings.reduceMotion = true;
  const b1 = paint(sb, sb.hero.y); await sleep(330); const b2 = paint(sb, sb.hero.y);
  out.bossStill = b1 === b2;
  const sm = mkSim(4 * 5 + 5, 7); sm.gen.arena = true;
  P.Settings.reduceMotion = false;
  const c1 = paint(sm, sm.hero.y); await sleep(700); const c2 = paint(sm, sm.hero.y);
  out.bossMoving = c1 !== c2;

  // (4) the sim state with the evolution on and off, with the renderer running in both (frames drawn every 30 steps).
  const run = on => {
    CFG.on = on;
    const s = mkSim(2 * 5 + 3, 21);
    for (let i = 0; i < 600; i++) {
      P.stepSim(s, 1 / 60, { x: Math.sin(i / 41) * 0.5, y: -1 }); pump(s);
      if (i % 30 === 0) { R.ctx = savedCtx; R.dpr = savedDpr; P.Render.frame(s, null); }
    }
    return JSON.stringify([s.hero.x, s.hero.y, s.hero.hp, s.kills, s.enemies.length, s.enemies.slice(0, 40).map(e => [e.x, e.y, e.hp]), s.runT]);
  };
  const sOn = run(true), sOff = run(false);
  out.simSame = sOn === sOff;

  R.ctx = savedCtx; R.cam = savedCam; R.ppm = savedPpm; R.dpr = savedDpr; CFG.on = savedOn;
  P.Settings.reduceMotion = savedSet;
  return JSON.stringify(out);
})()`;

async function browserPart() {
  if (typeof WebSocket === 'undefined') { console.log('browser part: SKIPPED (no WebSocket in this Node)'); return; }
  if (!fs.existsSync(CHROME)) { console.log('browser part: SKIPPED (Chrome not found at ' + CHROME + '; set CHROME_BIN)'); return; }
  const srv = await serve(), port = srv.address().port, dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arena-evolve-'));
  const chromePort = await freePort();
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${chromePort}`, `--user-data-dir=${dir}`, '--no-first-run',
    '--no-default-browser-check', '--disable-gpu', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  try {
    let wsUrl = null;
    for (let i = 0; i < 150 && !wsUrl; i++) {
      try { const list = await (await fetch(`http://127.0.0.1:${chromePort}/json/list`)).json(); const pg = list.find(x => x.type === 'page'); if (pg) wsUrl = pg.webSocketDebuggerUrl; } catch (e) { /* not up yet */ }
      if (!wsUrl) await sleep(100);
    }
    if (!wsUrl) throw new Error('Chrome did not start');
    const c = cdpClient(wsUrl); await c.ready;
    const errs = [];
    c.on(m => { if (m.method === 'Runtime.exceptionThrown') errs.push(((m.params.exceptionDetails.exception || {}).description || m.params.exceptionDetails.text || '').split('\n')[0]); });
    await c.send('Runtime.enable'); await c.send('Page.enable');
    await c.send('Page.navigate', { url: `http://127.0.0.1:${port}/tools/arena-still.html?hood=4&stage=4&live=1&secs=0&dpr=2&seed=5` });
    const ready = `(function(){ return !!(window.P && P.Render && P.ArenaEvolve && P.Journey && P.ArenaArt && P.ArenaArt.ready() && P.ArenaProps.ready() && P.ArenaOverhead.ready() && P.ArenaSky.ready() && P.Render.ctx); })()`;
    for (let i = 0; i < 200; i++) { const r = await c.send('Runtime.evaluate', { expression: ready, returnByValue: true }); if (r.result && r.result.value) break; await sleep(100); }
    await sleep(800);   // the harness draws its first frame about 100 ms after the art is ready
    const ex = await c.send('Runtime.evaluate', { expression: PAGE, awaitPromise: true, returnByValue: true, timeout: 180000 });
    if (ex.exceptionDetails) { ok(false, 'browser: page check threw ' + ((ex.exceptionDetails.exception || {}).description || ex.exceptionDetails.text)); return; }
    const o = JSON.parse(ex.result.value);
    const L = o.lum.map(x => x[2]), lo = Math.min(...L), hi = Math.max(...L);
    o.lum.filter(x => x[2] < FLOOR[0] || x[2] > FLOOR[1]).forEach(x => fails.push('floor outside the mid-value band: hood ' + x[0] + ' stage ' + x[1] + ' L* ' + x[2]));
    ok(o.lum.length === 100, 'browser: 100 hood-stages measured');
    const dropWorst = Math.min(...o.lum.map((x, i) => x[2] - o.base[i][2]));
    ok(dropWorst >= -FLOOR_DROP, 'the treatment does not darken any floor by more than ' + FLOOR_DROP + ' L* against its authored tile (worst ' + dropWorst.toFixed(1) + ')');
    ok(o.still === true, 'reduce motion: the lamps and the light hold still (same pixels at two moments)');
    ok(o.lamps > 0 && o.moving === true, 'without Reduce motion the lamp flicker moves the pixels (' + o.lamps + ' lamps on; the check is not vacuous)');
    ok(o.bossStill === true, 'reduce motion: the boss grade and vignette are static');
    ok(o.bossMoving === true, 'without Reduce motion the boss mood eases in over time');
    ok(o.stats.ratchet > 0.5 && o.stats.decals > 0 && o.stats.dressing > 0, 'stage 4 at the gate: the ratchet is up, decals and dressing are on (ratchet ' + o.stats.ratchet.toFixed(2) + ', decals ' + o.stats.decals + ', dressing ' + o.stats.dressing + ')');
    ok(o.stats.bands <= P.CFG.arenaEvolve.band.maxBands, 'decal bands: at most ' + P.CFG.arenaEvolve.band.maxBands + ' kept');
    ok(o.stats.dressing <= P.CFG.arenaEvolve.cap.dressing[0] && o.stats.lamps <= P.CFG.arenaEvolve.cap.lamps[0], 'dressing and lamps on stay within the tier-0 caps');
    ok(o.simSame === true, 'sim state is the same with the evolution on and off, with the renderer running in both');
    ok(errs.length === 0, 'no exceptions in the page (' + errs.slice(0, 2).join(' | ') + ')');
    const B = o.base.map(x => x[2]), bdiff = o.lum.map((x, i) => x[2] - o.base[i][2]);
    console.log('floor L* treated (worst case) ' + lo.toFixed(1) + ' to ' + hi.toFixed(1) + '; untreated base ' + Math.min(...B).toFixed(1) + ' to ' + Math.max(...B).toFixed(1) +
      '; treated minus base ' + Math.min(...bdiff).toFixed(1) + ' to ' + Math.max(...bdiff).toFixed(1) + ' (band ' + FLOOR.join('-') + ')');
    if (process.env.ARENA_EVOLVE_DUMP) console.log(JSON.stringify({ lum: o.lum, base: o.base }));
    console.log('stats ' + JSON.stringify(o.stats) + ' lamps ' + o.lamps);
    c.close();
  } finally {
    proc.kill(); srv.close();
  }
}

(async () => {
  try { await browserPart(); } catch (e) { fails.push('browser part threw: ' + (e && e.stack || e)); }
  if (fails.length) { console.log('test-arena-evolve: ' + fails.length + ' failure(s)'); fails.forEach(m => console.log('FAIL ' + m)); process.exit(1); }
  console.log('test-arena-evolve: all pass (' + passes + ' checks)');
})();
