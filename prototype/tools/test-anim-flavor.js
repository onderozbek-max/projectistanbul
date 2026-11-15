// T4 part 6 (animation flavor), checks that can run without a canvas. View only: nothing here touches the sim.
//  - death collapse: the shared 0.45 s timeline starts upright and ends lying at rest; the shadow only shrinks;
//  - hero idle fidget and hit spring: off under Reduce motion, on otherwise;
//  - zombie walk: the arms swing (zswing) rather than hold a static reach;
//  - XP glint: a smooth pulse, at most 1 Hz (never a flash, design-system 11);
//  - signature moments (T4 part 13): the streak ladder (10, 25, 50) and the frenzy reset, the crit and impact gaps, the Reduce
//    flags, the last-stand pulse (0.5 Hz, one budget start a cycle), the journey-only level clear, and the view-only rule.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fails = 0, clock = 1000;
function ok(c, m) { if (!c) { fails++; console.log('FAIL ' + m); } }
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

// ---- feel.js: fidget and spring under Reduce motion ----
function feelSandbox(reduceMotion) {
  const ctx = { performance: { now: () => clock }, Math, console, window: {}, document: undefined,
    P: { Settings: { reduceMotion: reduceMotion }, Fx: { cam: {} }, goreRGB: () => '0,0,0', CFG: {} } };
  vm.createContext(ctx);
  ['js/config-feel.js', 'js/view/feel.js'].forEach((f) => vm.runInContext(read(f), ctx, { filename: f }));
  return ctx.P;
}
const quiet = feelSandbox(true);
let rolled = false, squashed = false;
for (let t = 0; t < 60000; t += 16) { clock = 1000 + t; const h = quiet.Feel.hero(); if (h.r !== 0) rolled = true; if (h.y !== 1) squashed = true; }
ok(!rolled, 'Reduce motion: the idle fidget never rolls the hero (60 s)');
ok(!squashed, 'Reduce motion: the hero is not squashed or stretched while idle');
const loud = feelSandbox(false);
let fid = false;
clock = 1000; loud.Feel.hero();
for (let t = 0; t < 60000; t += 16) { clock = 1000 + t; if (loud.Feel.hero().r !== 0) { fid = true; break; } }
ok(fid, 'the idle fidget rolls the hero at least once in 60 s');
const F = loud.CFG.feel2.hero;
ok(F.fidget.every[0] >= 6 && F.fidget.every[1] <= 10, 'fidget interval is 6 to 10 s');
ok(F.heavyMul > 1, 'heavy hits squash the hero more than light ones');

// ---- art-enemies5.js: the death collapse timeline ----
const dsP = { CFG: { enemies3: { deathPose: { fire: [], electric: [], blade: [], explosion: [], blunt: [], fallback: 'blunt', life: 6, cap: 40,
  slide: { default: 0.3, walker: 0.25 }, fade: 1.6 } }, enemies: { walker: { radius: 0.35 } }, view: { contactShadow: { alpha: 0.22, radius: 0.9, aspect: 0.36 } } },
  ArtRig: { TAU: Math.PI * 2 }, Sprites: { corpse() {}, contact() {} } };
const dctx = { Math, console, window: {}, document: undefined, P: dsP };
vm.createContext(dctx);
vm.runInContext(read('js/view/art-enemies5.js'), dctx, { filename: 'js/view/art-enemies5.js' });
const D = dsP.ArtDeath;
ok(D && typeof D.collapseOf === 'function', 'art-enemies5 exposes the collapse timeline');
if (D && D.collapseOf) {
  const a0 = D.collapseOf(0), aEnd = D.collapseOf(D.collapseEnd), mid = D.collapseOf(0.2);
  ok(a0.fall === 0 && a0.shadow === 1, 'collapse starts upright with a full shadow');
  ok(aEnd.fall === 1 && Math.abs(aEnd.sx - 1) < 1e-9 && Math.abs(aEnd.sy - 1) < 1e-9 && Math.abs(aEnd.lift) < 1e-9 && Math.abs(aEnd.push) < 1e-9,
    'collapse ends lying at rest (no squash, lift or push left)');
  ok(mid.fall > 0 && mid.fall < 1, 'the fall is in progress half way through the buckle');
  let prev = 2, shrinks = true;
  for (let a = 0; a <= D.collapseEnd; a += 0.01) { const s = D.collapseOf(a).shadow; if (s > prev + 1e-9) shrinks = false; prev = s; }
  ok(shrinks, 'the contact shadow only shrinks through the collapse');
  ok(Math.abs(D.collapseEnd - 0.45) < 1e-9, 'the collapse lasts 0.45 s');
}

// ---- art-rig.js: the zombie arm swing ----
const rctx = { Math, console, window: {}, document: undefined, Path2D: function () {}, P: {} };
vm.createContext(rctx);
vm.runInContext(read('js/view/art-rig.js'), rctx, { filename: 'js/view/art-rig.js' });
const RIG = rctx.P.ArtRig;
const B = { hipY: -0.5, hipX: 0.1, shY: -0.6, shX: 0.2, torsoTop: 0.2, torsoBot: 0.2, headC: [0, -0.8], headRx: 0.1, headRy: 0.1,
  thigh: 0.2, shin: 0.2, legR: 0.07, shinR: 0.06, upper: 0.25, fore: 0.25, stride: 0.13, lift: 0.05 };
const w0 = RIG.solve(B, { arms: "zswing", walk: Math.PI / 2, gait: 'walk', strideK: 1, liftK: 1 }).RW;
const w1 = RIG.solve(B, { arms: "zswing", walk: -Math.PI / 2, gait: 'walk', strideK: 1, liftK: 1 }).RW;
const moved = Math.hypot(w0[0] - w1[0], w0[1] - w1[1]);
ok(moved > 0.3, 'zswing: the hand moves through the walk cycle (' + moved.toFixed(2) + ' units)');
ok(w0[0] > 0.2, 'zswing: the hand reaches forward (x > 0.2 units at phase 0)');

// ---- hud glint and pickup bob: smooth and slow ----
const pk = dsP.CFG && loud.CFG.feel2.pickup;
ok(pk && pk.glint && pk.glint.pulse <= 1 && pk.glint.spin > 0, 'XP glint pulse is at most 1 Hz (a smooth swell, not a flash)');

// ---- T4 part 13: signature moments (view only) ----
// One sandbox runs the real config-feel.js, sprites.js (the budget), fx.js (flashGo), moments.js and moments-screen.js. Time steps at
// 1/120 s and the drawing is skipped, so these checks cover the events, the budget, the Reduce flags and the timing.
const parseNum = (src, re) => { const m = re.exec(src); return m ? parseFloat(m[1]) : NaN; };
const FRENZY_WINDOW = parseNum(read('js/config-weapons.js'), /frenzy: \{ threshold: 60, window: ([\d.]+)/);
const LOW_FRAC = parseNum(read('js/config.js'), /lowHpFrac: ([\d.]+)/);
ok(FRENZY_WINDOW > 0 && LOW_FRAC > 0, 'moments: the frenzy window and the low-HP fraction parse from the source');
const DT = 1 / 120;
function countIn1s(times) {   // the most times in any 1 s window
  let worst = 0;
  times.forEach((t0) => { const n = times.filter((t1) => t1 >= t0 && t1 < t0 + 1).length; if (n > worst) worst = n; });
  return worst;
}
function momentsWorld(opt) {
  clock = 100;
  const ctx = { performance: { now: () => clock * 1000 }, Math, console, window: {}, document: undefined, WeakMap, Object, Array, Float32Array, Number, String };
  ctx.P = { Settings: { reduceFlash: !!opt.rf, reduceMotion: !!opt.rm }, kicks: 0, ArtRig: { TAU: Math.PI * 2, INK: '#14151F' }, ArtChars: {},
    ArtEnemies: { def: () => ({}) }, Feel: { kick() { ctx.P.kicks++; } },
    CFG: { skills: { frenzy: { window: FRENZY_WINDOW } }, feel: { hitFlash: 0.06, enemyFlashGap: 0.34, lowHpFrac: LOW_FRAC }, view: {} } };
  vm.createContext(ctx);
  ['js/config-feel.js', 'js/view/sprites.js', 'js/view/fx.js', 'js/view/moments.js', 'js/view/moments-screen.js'].forEach((f) => vm.runInContext(read(f), ctx, { filename: f }));
  const P = ctx.P, S = P.Sprites, M = P.Moments, SC = P.MomentsScreen, grants = [], streaks = [], hitG = [], momG = [], momAsk = [], momRef = [];
  // Every granted bright start, counted at the budget with its pool (T4 part 15): moments ask the 'moment' pool, everything else is a hit.
  const okReal = S.flashOk;
  S.flashOk = function (now, kind) {
    const g = okReal(now, kind);
    if (kind === 'moment') { momAsk.push(clock); if (g) momG.push(clock); else momRef.push(clock); }
    if (g) { grants.push(clock); if (kind !== 'moment') hitG.push(clock); }
    return g;
  };
  const forceReal = S.flashForce;                    // the last-stand pulse is a forced start (a hit, in the hit pool)
  S.flashForce = function (now) { forceReal(now); grants.push(clock); hitG.push(clock); };
  const scStreak = SC.streak;
  const W = { P, S, M, SC, grants, streaks, hitG, momG, momAsk, momRef, kills: 0, sim: { t: 0, mode: 'play', levelIndex: 6, levelInfo: { hood: { name: 'GALATA' } }, hero: { x: 0, y: 40, hp: 100, maxHp: 100 }, enemies: [] } };
  SC.streak = function (n) { streaks.push({ n: n, kill: W.kills }); scStreak(n); };
  W.tick = function (dt) { clock += dt; W.sim.t = clock - 100; M.update(dt, W.sim); };
  W.wait = function (sec) { const n = Math.round(sec / DT); for (let i = 0; i < n; i++) W.tick(DT); };
  W.ev = function (e) { W.sim.t = clock - 100; M.onEvent(e, W.sim); };
  W.kill = function (crit) { W.kills++; W.ev({ type: 'kill', crit: !!crit, x: 0, y: 40, id: 900 + W.kills, src: 'nailgun' }); };
  return W;
}
const dashEv = { type: 'dash', x: 0, y: 40, ax: 1, ay: 0, dist: 3.2, T: 0.16 };
const bossHit = (i) => ({ type: 'hit', boss: true, id: i, x: 0, y: 40, dx: 1, dy: 0, dmg: 20, crit: false, src: 'sledge' });

{ // Config: every key the moments read is a finite number, and the rates are within the limits
  const K = momentsWorld({}).P.CFG.moments;
  const need = ['dash.ghostN', 'dash.tearRate', 'dash.tearT', 'dash.fringe', 'shock.max', 'shock.zoom', 'shock.life', 'shock.slamKick',
    'shock.stompKick', 'shock.gap', 'streak.bannerT', 'streak.wipeT', 'streak.queueT', 'crit.gap', 'crit.hold', 'crit.life',
    'ripple.life', 'ripple.wobbleHz', 'ripple.fringe', 'clear.n', 'clear.life', 'clear.bounceHz', 'clear.grav', 'low.pulseHz',
    'low.max', 'low.veil', 'low.veilIn', 'impact.gap', 'impact.hold', 'impact.life', 'impact.spikes'];
  const missing = need.filter((p) => { const v = p.split('.').reduce((o, k) => (o ? o[k] : undefined), K); return typeof v !== 'number' || !isFinite(v); });
  ok(missing.length === 0, 'moments: every config key the moments read is a finite number (missing: ' + missing.join(', ') + ')');
  ok(K.streak.marks.join(',') === '10,25,50', 'moments: streak marks are 10, 25 and 50');
  ok(K.low.pulseHz <= 0.5, 'moments: the last-stand pulse is at most 0.5 Hz');
}

{ // Streak ladder: 25 kills 0.1 s apart reach marks 10 and 25, but only one word shows inside the gap (gapT, phone playtest)
  const W = momentsWorld({}), K = W.P.CFG.moments;
  for (let i = 0; i < 25; i++) { W.wait(0.1); W.kill(false); }
  ok(W.streaks.map((x) => x.n).join(',') === '10', 'streak: 25 kills 0.1 s apart show the first word only, the 25 word waits out the gap (got ' + W.streaks.map((x) => x.n).join(',') + ')');
  ok(K.streak.gapT >= 20, 'moments: streak words are at least gapT seconds apart (config streak.gapT)');
  const V = momentsWorld({});
  for (let i = 0; i < 10; i++) { V.wait(0.1); V.kill(false); }
  V.wait(K.streak.gapT + 1);
  for (let i = 0; i < 10; i++) { V.wait(0.1); V.kill(false); }
  ok(V.streaks.map((x) => x.n).join(',') === '10,10', 'streak: after the gap a new streak shows its word again (got ' + V.streaks.map((x) => x.n).join(',') + ')');
}
{ // A frenzy restarts the count: 9 kills, a frenzy, then 18 kills give one mark, on the 10th kill after the frenzy (kill 19)
  const W = momentsWorld({});
  for (let i = 0; i < 9; i++) { W.wait(0.1); W.kill(false); }
  W.wait(0.1); W.ev({ type: 'frenzy', on: true });
  for (let i = 0; i < 18; i++) { W.wait(0.1); W.kill(false); }
  ok(W.streaks.length === 1 && W.streaks[0].n === 10 && W.streaks[0].kill === 19, 'streak: a frenzy restarts the count (first mark on kill 19)');
}
{ // A gap longer than the frenzy window ends the streak
  const W = momentsWorld({});
  for (let i = 0; i < 9; i++) { W.wait(0.1); W.kill(false); }
  W.wait(FRENZY_WINDOW + 0.5);
  for (let i = 0; i < 9; i++) { W.wait(0.1); W.kill(false); }
  ok(W.streaks.length === 0, 'streak: a gap longer than the frenzy window restarts the count');
}

{ // Crit bursts and impact starbursts: at most one per gap, each through the budget
  const W = momentsWorld({}), C = W.P.CFG.moments;
  for (let i = 0; i < 30; i++) { W.wait(0.05); W.kill(true); }
  const cap = Math.ceil(1.5 / C.crit.gap) + 1;
  ok(W.M.starts.crit >= 1 && W.M.starts.crit <= cap, 'crit: 30 crit kills in 1.5 s give at most one burst per gap (' + W.M.starts.crit + ', cap ' + cap + ')');
  for (let i = 0; i < 30; i++) { W.wait(0.05); W.ev(bossHit(500 + i)); }
  const capI = Math.ceil(1.5 / C.impact.gap) + 1;
  ok(W.M.starts.impact >= 1 && W.M.starts.impact <= capI, 'impact: 30 boss hits in 1.5 s give at most one starburst per gap (' + W.M.starts.impact + ', cap ' + capI + ')');
  ok(countIn1s(W.grants) <= 3, 'budget: the crit and impact starts together hold to 3 a second (worst ' + countIn1s(W.grants) + ')');
}

{ // Dash: a ghost pair and the screen tear start together, and both are gone within 0.3 s
  const W = momentsWorld({});
  W.ev(dashEv);
  ok(W.M.starts.dash === 1 && W.SC.active().tear === true, 'dash: the ghost pair and the tear start together');
  W.wait(0.3);
  ok(W.SC.active().tear === false && W.M.active().ghosts === 0, 'dash: the tear and the ghosts are gone within 0.3 s');
  W.ev({ type: 'nearMiss', x: 0, y: 40 });
  ok(W.M.starts.ripple === 1 && W.M.active().ripples === 1, 'near miss: one ripple ring starts (the flag tests below rely on this)');
  W.wait(0.7);
  ok(W.M.active().ripples === 0, 'near miss: the ripple ring is gone after its life');
}

{ // Reduce flashing: no dash, crit, ripple or impact start, no last-stand flash; the streak word shows steady with no wipe
  const W = momentsWorld({ rf: true });
  W.ev(dashEv); W.kill(true); W.ev({ type: 'nearMiss', x: 0, y: 40 }); W.ev(bossHit(7));
  for (let i = 0; i < 10; i++) { W.wait(0.1); W.kill(false); }
  const a = W.SC.active();
  ok(W.M.starts.dash === 0 && W.M.starts.crit === 0 && W.M.starts.ripple === 0 && W.M.starts.impact === 0,
    'Reduce flashing: no dash, crit, ripple or impact start (' + JSON.stringify(W.M.starts) + ')');
  ok(a.tear === false && a.wipe === false && a.word === 'mo.streak10', 'Reduce flashing: the streak word shows steady, with no tear and no wipe (word ' + a.word + ')');
  W.sim.hero.hp = 20; W.wait(4);
  ok(W.M.starts.low === 0 && countIn1s(W.grants) <= 3, 'Reduce flashing: no last-stand flash start');
}

{ // Reduce motion: no ghosts, tear, ground ring, crit, impact or ripple; no wipe; no confetti; the ribbon stays (static)
  const W = momentsWorld({ rm: true });
  W.ev(dashEv); W.ev({ type: 'bossSlam', x: 0, y: 42, r: 2.2 }); W.ev({ type: 'explode', x: 0, y: 42, r: 2.2, trauma: 0.3 });
  W.kill(true); W.ev({ type: 'nearMiss', x: 0, y: 40 }); W.ev(bossHit(8));
  for (let i = 0; i < 10; i++) { W.wait(0.1); W.kill(false); }
  W.ev({ type: 'win' });
  const a = W.SC.active();
  ok(W.M.starts.dash === 0 && W.M.starts.crit === 0 && W.M.starts.ripple === 0 && W.M.starts.impact === 0 && W.M.starts.shock === 0,
    'Reduce motion: no dash, crit, ripple, impact or ground-ring start (' + JSON.stringify(W.M.starts) + ')');
  ok(a.tear === false && a.wipe === false && a.word === 'mo.streak10', 'Reduce motion: the streak word shows with no wipe');
  ok(a.pieces === 0 && a.ribbon === 'GALATA', 'Reduce motion: no confetti is spawned, and the hood ribbon stays (static)');
}

{ // Level clear: confetti and ribbon on journey levels only; the pieces end within their life
  const W1 = momentsWorld({}); W1.sim.levelIndex = 1; W1.ev({ type: 'win' });
  ok(W1.SC.active().pieces === 0 && W1.SC.active().ribbon === null, 'level clear: L1 gets no confetti and no ribbon');
  const W6 = momentsWorld({}); W6.ev({ type: 'win' });
  const a = W6.SC.active();
  ok(a.pieces === 36 && a.ribbon === 'GALATA', 'level clear: a journey level gets 36 pieces and the hood ribbon (got ' + a.pieces + ')');
  W6.wait(2.5);
  ok(W6.SC.active().pieces === 0, 'level clear: every piece has gone after 2.5 s');
}

{ // Last stand: a 0.5 Hz swell (one peak every 2 s), one budget start a cycle, and never more than 3 starts a second
  const W = momentsWorld({});
  W.sim.hero.hp = 20;
  const peaks = []; let above = false;
  for (let i = 0; i < 20 * 120; i++) {
    W.tick(DT);
    if (W.M.pulse >= 0.9 && !above) { above = true; peaks.push(clock); }
    if (W.M.pulse < 0.9) above = false;
  }
  ok(peaks.length >= 9 && peaks.length <= 11, 'last stand: one swell peak every 2 s (got ' + peaks.length + ' in 20 s)');
  ok(countIn1s(peaks) <= 1, 'last stand: no 1 s window holds more than one swell peak');
  ok(W.M.starts.low >= 9 && W.M.starts.low <= 11, 'last stand: one budget start per 2 s cycle (got ' + W.M.starts.low + ')');
  ok(countIn1s(W.grants) <= 3, 'last stand: the pulse and the other starts hold to 3 a second (worst ' + countIn1s(W.grants) + ')');
}

{ // Ground shock: a chain of six blasts in 0.9 s starts a ring at most once per gap (the lens is motion, not a flash)
  const W = momentsWorld({}), C = W.P.CFG.moments;
  for (let i = 0; i < 6; i++) { W.wait(0.15); W.ev({ type: 'explode', x: 0, y: 42, r: 2.2, trauma: 0.3 }); }
  const cap = Math.ceil(0.9 / C.shock.gap) + 1;
  ok(W.M.starts.shock >= 2 && W.M.starts.shock <= cap, 'ground shock: a chain of six blasts starts at most one ring per gap (' + W.M.starts.shock + ', cap ' + cap + ')');
  ok(W.M.active().shocks <= C.shock.max, 'ground shock: at most ' + C.shock.max + ' rings live at once');
}

{ // T4 part 15, flash reserve: a crowd flood of hit starts (six enemies, a prop, a hero hit and a blast every 1/120 s) does not starve the
  // moments. Crit kills, heavy hits, near misses and dashes (the screen tear) ask the moment pool. Every refused moment ask has a moment
  // start in the second before it (there is no forced heartbeat in this sandbox), no window holds more than 3 starts or 2 hits, and
  // Reduce flashing grants nothing (checked below).
  const W = momentsWorld({});
  const S = W.S;
  for (let i = 0; i < 4 * 120; i++) {                                // 4 s at 1/120 s steps
    if (i % 12 === 0) W.kill(true);
    if (i % 12 === 6) W.ev(bossHit(900 + i));
    if (i % 30 === 15) W.ev({ type: 'nearMiss', x: 0, y: 40 });
    if (i % 60 === 45) W.ev(dashEv);
    for (let k = 0; k < 6; k++) S.enemyFlashOk({ id: 'g' + i + '_' + k, flash: 0.06 }, clock);   // the crowd flood
    S.propFlashOk({ flash: 0.06 });
    W.P.Fx.flashGo();                                                  // a hero hit or a blast
    W.tick(DT);
  }
  let unanswered = 0;
  W.momRef.forEach((t) => { if (!W.momG.some((g) => g <= t + 1e-9 && g > t - 1 - 1e-9)) unanswered++; });
  ok(countIn1s(W.grants) <= 3, 'flash reserve: no 1 s window holds more than 3 starts under the flood (worst ' + countIn1s(W.grants) + ')');
  ok(countIn1s(W.hitG) <= 2, 'flash reserve: no 1 s window holds more than 2 hit starts under the flood (worst ' + countIn1s(W.hitG) + ')');
  ok(W.momG.length >= 4, 'flash reserve: the moments still start at least once a second under the flood (' + W.momG.length + ' in 4 s)');
  ok(unanswered === 0, 'flash reserve: every refused moment ask has a moment start in the second before it (' + unanswered + ' without one)');
  ok(W.M.starts.crit >= 1 && W.M.starts.impact >= 1 && W.M.starts.ripple >= 1, 'flash reserve: crit, starburst and ripple all start under the flood (' + JSON.stringify(W.M.starts) + ')');
  ok(W.momRef.length > 0, 'flash reserve: the flood is saturated, so the reserve is what keeps the moments going (' + W.momRef.length + ' moment asks refused)');
  const Q = momentsWorld({ rf: true });                              // Reduce flashing: the same flood starts nothing
  for (let i = 0; i < 4 * 120; i++) {
    if (i % 12 === 0) Q.kill(true);
    if (i % 30 === 15) Q.ev({ type: 'nearMiss', x: 0, y: 40 });
    if (i % 60 === 45) Q.ev(dashEv);
    for (let k = 0; k < 6; k++) Q.S.enemyFlashOk({ id: 'q' + i + '_' + k, flash: 0.06 }, clock);
    Q.P.Fx.flashGo();
    Q.tick(DT);
  }
  ok(Q.grants.length === 0 && Q.M.starts.crit === 0 && Q.M.starts.ripple === 0 && Q.SC.active().tear === false,
    'flash reserve: Reduce flashing grants nothing under the flood (' + Q.grants.length + ' starts)');
}

// ---- T4 part 13: the moments files are view only (no assignment to the sim, no push or splice on sim arrays) ----
['js/view/moments.js', 'js/view/moments-screen.js'].forEach((f) => {
  read(f).split('\n').forEach((line, i) => {
    if (/^\s*\/\//.test(line)) return;
    const code = line.replace(/===|!==|==|!=|<=|>=/g, ' ');
    const writes = /\b(?:s|hero|ev|enemy)\.[\w.]+\s*[-+*\/]?=(?!=)/.test(code) || /\b(?:s|hero)\.[\w.]+\.(?:push|splice|pop|shift)\(/.test(code);
    ok(!writes, 'sim read-only: ' + f + ':' + (i + 1) + ' writes to the sim | ' + line.trim().slice(0, 120));
  });
});

console.log(fails ? fails + ' failure(s)' : 'test-anim-flavor: all pass');
process.exit(fails ? 1 : 0);
