// T4 part 6 (animation flavor), checks that can run without a canvas. View only: nothing here touches the sim.
//  - death collapse: the shared 0.45 s timeline starts upright and ends lying at rest; the shadow only shrinks;
//  - hero idle fidget and hit spring: off under Reduce motion, on otherwise;
//  - zombie walk: the arms swing (zswing) rather than hold a static reach;
//  - XP glint: a smooth pulse, at most 1 Hz (never a flash, design-system 11).
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

console.log(fails ? fails + ' failure(s)' : 'test-anim-flavor: all pass');
process.exit(fails ? 1 : 0);
