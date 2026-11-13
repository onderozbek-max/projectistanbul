// Canvas accessibility guard (design-system 11: no flashing more than 3 times a second; Reduce flashing and Reduce motion).
// (1) Runtime: the screen flash budget (sprites.js), the low-HP heartbeat (fx.js), the blackout glitch rate (config-feel.js), and the
//     signature moments (T4 part 13) driven through the same budget.
// (2) Static heuristics over js/view. Each candidate is a time-based oscillator above 3 Hz, a sin-based on/off threshold, a parity
//     toggle, a floor(time * N) re-roll with N above 3, or a flash start. A candidate passes when it is quantised to 3 steps a
//     second, guarded by a Reduce flags token on the same or a neighbouring line, or listed in tools/a11y-canvas-allowlist.json
//     with a rationale. An allowlist entry that matches no candidate is stale and fails. The sim never reads these settings
//     (architecture 4.17); this test reads only the view and config files.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fails = 0;
function ok(c, m) { if (!c) { fails++; console.log('FAIL ' + m); } }
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

// ---------- (1) runtime ----------
let clock = 0;   // seconds; the sandboxes read it through performance.now()
function sandbox(p) {
  const ctx = { performance: { now: () => clock * 1000 }, Math, console, window: {}, document: undefined, WeakMap, Object, Array, Float32Array };
  ctx.P = Object.assign({ Settings: { reduceFlash: false, reduceMotion: false }, CFG: {} }, p || {});
  vm.createContext(ctx);
  return ctx;
}
function load(ctx, f) { vm.runInContext(read(f), ctx, { filename: f }); }
function countIn1s(times) {
  let worst = 0;
  times.forEach((t0) => { const n = times.filter((t1) => t1 >= t0 && t1 < t0 + 1).length; if (n > worst) worst = n; });
  return worst;
}

// Budget and per-object gates in sprites.js.
const sc = sandbox({ ArtRig: { TAU: Math.PI * 2, INK: '#14151F' }, ArtChars: {}, ArtEnemies: { def: () => ({}) } });
sc.P.CFG = { feel: { enemyFlashGap: 0.34, hitFlash: 0.06 }, view: {} };
load(sc, 'js/view/sprites.js');
const S = sc.P.Sprites, Pset = sc.P.Settings;
ok(S && typeof S.flashOk === 'function' && typeof S.flashForce === 'function', 'sprites.js exposes flashOk and flashForce');
clock = 10;
const first5 = [0, 0, 0, 0, 0].map(() => S.flashOk(clock)).filter(Boolean).length;
ok(first5 === 3, 'budget: five starts at one instant grant exactly 3 (got ' + first5 + ')');
ok(S.flashOk(10.5) === false, 'budget: a fourth start inside the same 1 s window is refused');
ok(S.flashOk(11.01) === true, 'budget: a new 1 s window grants again');

// Sliding windows: 400 requests, one every 25 ms over 10 s, never more than 3 grants in any 1 s window.
const sl = sandbox({ ArtRig: { TAU: Math.PI * 2, INK: '#14151F' }, ArtChars: {}, ArtEnemies: { def: () => ({}) } });
sl.P.CFG = { feel: { enemyFlashGap: 0.34, hitFlash: 0.06 }, view: {} };
load(sl, 'js/view/sprites.js');
const grantTimes = [];
for (let i = 0; i < 400; i++) { const t = 100 + i * 0.025; if (sl.P.Sprites.flashOk(t)) grantTimes.push(t); }
ok(countIn1s(grantTimes) <= 3, 'budget: no 1 s window holds more than 3 grants (worst ' + countIn1s(grantTimes) + ')');
ok(grantTimes.length >= 25, 'budget: a steady stream still gets its 3 a second (granted ' + grantTimes.length + ' in 10 s)');

// Reduce flashing: nothing granted, nothing counted.
clock = 20; Pset.reduceFlash = true;
ok(S.flashOk(20) === false && S.flashStarts(20) === 0, 'Reduce flashing: flashOk refuses and counts nothing');
Pset.reduceFlash = false;

// Forced starts (the heartbeat) take budget slots.
clock = 30; S.flashForce(30); S.flashForce(30.1);
ok(S.flashOk(30.2) === true && S.flashOk(30.3) === false, 'forced heartbeat starts use up slots (one left after two forced)');

// A crowd: 25 enemies hit at one instant get 3 white flashes, not 25.
clock = 40;
let crowd = 0;
for (let i = 0; i < 25; i++) if (S.enemyFlashOk({ id: 'z' + i, flash: 0.06 }, 40)) crowd++;
ok(crowd === 3, 'crowd: 25 enemies hit at one instant get 3 white flashes (got ' + crowd + ')');
clock = 41.2;
ok(S.propFlashOk({ flash: 0.06 }) === true, 'prop flash: a free window grants a cart flash');
Pset.reduceFlash = true;
ok(S.propFlashOk({ flash: 0.06 }) === false && S.enemyFlashOk({ id: 'q', flash: 0.06 }, 41.3) === false, 'Reduce flashing: props and enemies get no white flash');
Pset.reduceFlash = false;

// Heartbeat (fx.js): one pulse per beat, at most 3 peaks in any second, period 60/72 s.
const fc = sandbox({ CFG: { feel: { hitFlash: 0.06 }, view: {} } });
load(fc, 'js/view/fx.js');
const Fx = fc.P.Fx;
ok(Math.abs(Fx.heartPeriod - 60 / 72) < 1e-9, 'heartbeat period is 60/72 s');
const peaks = [];
let rising = false, inRange = true;
for (let t = 0; t < 20; t += 0.001) {
  const v = Fx.heart(t);
  if (v < 0 || v > 1) inRange = false;
  if (v >= 0.5 && !rising) { rising = true; peaks.push(t); }
  if (v < 0.5) rising = false;
}
ok(inRange, 'heartbeat stays within 0..1');
ok(countIn1s(peaks) <= 3, 'heartbeat: no 1 s window holds more than 3 pulses (worst ' + countIn1s(peaks) + ')');
ok(peaks.length >= 22 && peaks.length <= 25, 'heartbeat: one pulse per beat over 20 s (got ' + peaks.length + ')');

// Blackout glitch and hit-stop limiter (config-feel.js).
const cc = sandbox();
load(cc, 'js/config-feel.js');
ok(cc.P.CFG.feel2.glitch.rate <= 3, 'glitch tear rate is at most 3 steps a second');
ok(cc.P.CFG.feel2.hitStop.minGap === 0.25, 'hit-stop limiter gap unchanged (0.25 s)');

// Signature moments (T4 part 13): a dense mix of bright starts (crit kills, boss hits, near misses, the last-stand pulse) through the
// real budget (fx.js flashGo, sprites.js flashOk). No 1 s window holds more than 3 starts, and the budget refuses some attempts.
function momentsMix(rf) {
  const mc = sandbox({ ArtRig: { TAU: Math.PI * 2, INK: '#14151F' }, ArtChars: {}, ArtEnemies: { def: () => ({}) } });
  mc.P.Settings.reduceFlash = rf;
  mc.P.CFG = { feel: { enemyFlashGap: 0.34, hitFlash: 0.06, lowHpFrac: 0.3 }, view: {}, skills: { frenzy: { window: 1.5 } } };
  clock = 200;
  ['js/config-feel.js', 'js/view/sprites.js', 'js/view/fx.js', 'js/view/moments.js'].forEach((f) => load(mc, f));
  const MP = mc.P, MS = MP.Sprites, grantT = [];
  const goReal = MP.Fx.flashGo;
  MP.Fx.flashGo = () => { const g = goReal(); if (g) grantT.push(clock); return g; };
  const forceReal = MS.flashForce;
  MS.flashForce = (now) => { forceReal(now); grantT.push(clock); };
  const sim = { t: 0, mode: 'play', levelIndex: 6, levelInfo: { hood: { name: 'X' } }, hero: { x: 0, y: 40, hp: 20, maxHp: 100 }, enemies: [] };
  let attempts = 0;
  for (let i = 0; i < 4 * 120; i++) {                       // 4 s at 1/120 s steps
    clock += 1 / 120; sim.t = clock - 200;
    MP.Moments.update(1 / 120, sim);
    if (i % 2 === 0) { attempts++; MP.Moments.onEvent({ type: 'kill', crit: true, x: 0, y: 40 }, sim); }
    if (i % 3 === 0) { attempts++; MP.Moments.onEvent({ type: 'hit', boss: true, id: i, x: 0, y: 40, src: 'x' }, sim); }
    if (i % 5 === 0) { attempts++; MP.Moments.onEvent({ type: 'nearMiss', x: 0, y: 40 }, sim); }
  }
  return { worst: countIn1s(grantT), grants: grantT.length, attempts, starts: MP.Moments.active().starts };
}
{
  const mix = momentsMix(false);
  ok(mix.worst <= 3, 'moments budget: no 1 s window of crit bursts, starbursts, ripples and the last-stand pulse holds more than 3 starts (worst ' + mix.worst + ')');
  ok(mix.grants >= 6, 'moments budget: the budget still grants a steady stream (' + mix.grants + ' in 4 s)');
  const used = mix.starts.crit + mix.starts.impact + mix.starts.ripple;
  ok(used < mix.attempts, 'moments budget: the budget refuses some attempts (' + used + ' bright starts of ' + mix.attempts + ' tries)');
  const quiet = momentsMix(true);
  ok(quiet.starts.crit + quiet.starts.impact + quiet.starts.ripple + quiet.starts.low === 0, 'moments budget: Reduce flashing starts nothing bright');
}

// ---------- (2) static heuristics over js/view ----------
const AUDIO = /\/(sfx|sfx-bank|sfx-bank2|music|telemetry)\.js$/;
// Audio and DOM menus are out of this canvas audit: sound is not a visual flash, and the menu and HUD motion (CSS, screens.js,
// objectives-hud.js) belongs to the UI motion pass (js/view/ui-motion.js, tools/test-ui-motion.js).
const DOM_UI = /\/(screens|ui|ui-motion|objectives-hud|skill-button|input|settings|speech|telemetry)\.js$/;
const viewFiles = fs.readdirSync(path.join(ROOT, 'js/view')).filter((f) => f.endsWith('.js')).map((f) => 'js/view/' + f).filter((f) => !AUDIO.test(f) && !DOM_UI.test(f));
const TIME = /(^|[^\w.])(t|now|T|tt|t0|b\.t|rec\.T|k\.t|p\.t|performance\.now\(\))(?!\w)/;
// Tokens that show a Reduce flag (or the local that holds one) is consulted nearby. 'Math.floor' is NOT a guard: quantisation is
// checked separately on the same line (QUANT), so a bare floor() does not excuse a flicker.
const GUARD = /reduceFlash|reduceMotion|\bcalm\b|reduced\(\)|\brm\(\)|\brm\b|\bstill\(\)|flashGo|flashOk|flashForce/;
const QUANT = /Math\.floor\([^()]*\*\s*3\)/;   // time sampled to 3 steps a second
const ALLOW = JSON.parse(read('tools/a11y-canvas-allowlist.json')).entries;
const usedAllow = new Set();
const flagged = [];
let candidates = 0;

// Frequency in Hz of the time term in a sin/cos argument; null when a factor is a variable (the caller then decides).
function hzOf(arg) {
  const m = TIME.exec(arg);
  if (!m) return null;
  let rest = arg.slice(m.index + m[0].length);
  const cut = rest.search(/[+\-),;]/);
  if (cut >= 0) rest = rest.slice(0, cut);
  let omega = 1, op = '*';
  for (const p of rest.split(/\s*([*\/])\s*/).map((s) => s.trim()).filter((s) => s !== '')) {
    if (p === '*' || p === '/') { op = p; continue; }
    let v;
    if (/^\d+(\.\d+)?$/.test(p)) v = parseFloat(p);
    else if (p === 'TAU') v = 2 * Math.PI;
    else if (p === 'Math.PI') v = Math.PI;
    else return null;
    omega = op === '*' ? omega * v : omega / v;
  }
  return omega / (2 * Math.PI);
}
function guarded(lines, i) {
  for (let k = Math.max(0, i - 2); k <= Math.min(lines.length - 1, i + 2); k++) if (GUARD.test(lines[k])) return true;
  return false;
}
// A candidate is passed by quantisation or a guard; otherwise it must be allowlisted or it is a failure.
function judge(file, lines, i, kind, text) {
  candidates++;
  if (guarded(lines, i)) return;
  const line = lines[i];
  const entry = ALLOW.find((e) => e.file === file && line.indexOf(e.match) >= 0);
  if (entry) { usedAllow.add(entry); return; }
  flagged.push(file + ':' + (i + 1) + ' ' + kind + ' ' + text + ' | ' + line.trim().slice(0, 140));
}
viewFiles.forEach((file) => {
  const lines = read(file).split('\n');
  lines.forEach((line, i) => {
    if (/^\s*\/\//.test(line)) return;
    // (a) sin/cos of time: faster than 3 Hz, or an on/off threshold on the result.
    const trig = /(Math\.sin|Math\.cos)\(([^;]*)/.exec(line);
    if (trig && TIME.test(trig[2]) && !QUANT.test(trig[2])) {
      const hz = hzOf(trig[2]);
      const threshold = /[<>]=?\s*-?[\d.]+\s*\?/.test(line);
      if (hz !== null && hz > 3) judge(file, lines, i, '>3Hz', hz.toFixed(1) + ' Hz');
      else if (threshold) judge(file, lines, i, 'on/off', 'threshold');
    }
    // (b) a product of two oscillators on time, thresholded (the blackout lamp dip, the neon lamp).
    if (/Math\.sin\([^;]*\)\s*\*\s*Math\.sin\(/.test(line) && TIME.test(line) && /[<>]=?\s*-?[\d.]+\s*\?/.test(line)) {
      judge(file, lines, i, 'product', 'thresholded');
    }
    // (c) parity toggle on time: Math.floor(time ...) % 2.
    if (/Math\.floor\([^;]*\)\s*%\s*2\b/.test(line) && TIME.test(line)) judge(file, lines, i, 'parity', 'toggle');
    // (d) a re-roll seeded by floor(time * N): N above 3 is a strobe.
    const re = /Math\.floor\(\s*(t|now|T|tt|rec\.T|k\.t|p\.t|b\.t)\s*\*\s*([\d.]+)\s*\)/g;
    let mm;
    while ((mm = re.exec(line))) if (parseFloat(mm[2]) > 3) judge(file, lines, i, 'reroll', mm[2] + '/s');
    // (e) every flash start is granted by the budget: a bright disc or a white flash pushed without flashGo/flashOk nearby.
    if (/kind:\s*'flash'|flashes\.push\(/.test(line)) {
      candidates++;
      const near = lines.slice(Math.max(0, i - 2), i + 1).join('\n');
      if (!/flashGo|flashOk/.test(near)) flagged.push(file + ':' + (i + 1) + ' flash start not granted by the budget | ' + line.trim().slice(0, 140));
    }
  });
});
flagged.forEach((f) => { fails++; console.log('FAIL unguarded flicker: ' + f); });
ALLOW.forEach((e) => {
  if (!usedAllow.has(e)) { fails++; console.log('FAIL stale allowlist entry (matches no candidate): ' + e.file + ' "' + e.match + '"'); }
  if (!e.why || e.why.length < 40) { fails++; console.log('FAIL allowlist entry needs a rationale: ' + e.file + ' "' + e.match + '"'); }
});

// Signature moments (T4 part 13). The generic scan above reads only literal time names (t, now, T), so the moments files get their own
// audit: each sin or cos of time must be one of the four config rates checked here (at most 3 Hz); the angle terms are not time at all.
const MOM = ['js/view/moments.js', 'js/view/moments-screen.js'];
let momTrig = 0;
MOM.forEach((file) => {
  read(file).split('\n').forEach((line, i) => {
    if (/^\s*\/\//.test(line) || !/Math\.(sin|cos)\(/.test(line)) return;
    if (/Math\.(sin|cos)\((ang|a\)|n \* 127\.1)/.test(line)) return;           // polygon and blob angles, and the grain hash: not time
    if (/pulseHz|wobbleHz|bounceHz|p\.fv/.test(line)) { momTrig++; return; }    // a config rate (checked below)
    fails++; console.log('FAIL moments trig is not tied to a checked rate: ' + file + ':' + (i + 1) + ' | ' + line.trim().slice(0, 120));
  });
});
const momCfg = cc.P.CFG.moments;
const fvBase = parseFloat((/p\.fv = ([\d.]+) \+ Math\.random\(\)/.exec(read('js/view/moments-screen.js')) || [0, NaN])[1]);
const momRates = { 'low.pulseHz': momCfg.low.pulseHz, 'ripple.wobbleHz': momCfg.ripple.wobbleHz, 'clear.bounceHz': momCfg.clear.bounceHz,
  'dash.tearRate (steps a second)': momCfg.dash.tearRate, 'confetti flip (|cos| bumps a second)': (fvBase + 1) / Math.PI };
Object.keys(momRates).forEach((k) => { if (!(momRates[k] <= 3)) { fails++; console.log('FAIL moments rate above 3 Hz: ' + k + ' = ' + momRates[k]); } });
ok(momTrig === 4, 'moments: the trig audit finds the four time terms (pulse, ripple wobble, ribbon spring, confetti flip) (got ' + momTrig + ')');

// Wiring: each flash source takes a budget slot, and each flicker reads a Reduce flag.
const has = (f, re) => re.test(read(f));
const count = (f, re) => (read(f).match(re) || []).length;
const wiring = [
  ['enemy and prop white flashes take a budget slot', count('js/view/sprites.js', /enemyFlashGap && S\.flashOk\(now\)/g) === 2],
  ['hero hit flash takes a budget slot', has('js/view/fx.js', /heroFlashGap && flashGo\(\)/)],
  ['edge pulse takes a budget slot', has('js/view/fx.js', /edgePulseGap && flashGo\(\)/)],
  ['blast disc takes a budget slot', has('js/view/fx.js', /if \(flashGo\(\)\) F\.parts\.push\(\{ kind: 'flash'/)],
  ['burst disc takes a budget slot', has('js/view/weapons-fx2.js', /if \(P\.Fx\.flashGo\(\)\) flashes\.push/)],
  ['the low-HP heartbeat is counted against the budget', has('js/view/render.js', /countHeartbeat\(performance\.now\(\) \/ 1000\)/)],
  ['the heartbeat is steady under Reduce flashing', has('js/view/render.js', /reduceFlash\)? \? 0\.5/)],
  ['screen shake is zero under Reduce motion and scaled by the shake setting', has('js/view/fx.js', /var sh = rm \? 0 : c\.trauma \* c\.trauma \* shk;/)],
  ['camera kick is scaled by the shake setting', has('js/view/fx.js', /c\.ox \+= \(c\.kx \|\| 0\) \* shk/)],
  ['camera kick is off under Reduce motion', has('js/view/feel.js', /F\.kick = function[\s\S]{0,120}if \(rm\(\)\) return;/)],
  ['an active kick decays to zero under Reduce motion', has('js/view/feel.js', /c\.kx = rm\(\) \? 0 : /)],
  ['window flicker reads Reduce flashing', has('js/view/istanbul.js', /reduceFlash/)],
  ['lamp flicker reads Reduce flashing', has('js/view/istanbul-props2.js', /reduceFlash/)],
  ['vehicle alarm reads Reduce flashing', has('js/view/istanbul-props.js', /reduceFlash/)],
  ['fuse blink and blackout tear read Reduce flashing', has('js/view/events-fx.js', /reduceFlash/)],
  ['call static reads Reduce flashing', has('js/view/comic.js', /reduceFlash/)],
  ['cable bolt reads Reduce flashing', has('js/view/weapons-fx3.js', /reduceFlash/)],
  ['storm bolts and blowtorch read Reduce flashing', has('js/view/weapons-fx4.js', /reduceFlash/)],
  ['weather drift freezes under Reduce motion', has('js/view/istanbul-landmarks.js', /reduceMotion \? 0 : performance\.now/)],
  // T4 part 13: signature moments. Each bright start takes a budget slot, and each Reduce flag is read where its moment starts.
  ['dash tear takes a budget slot', has('js/view/moments-screen.js', /S\.tear = function \(\) \{ if \(go\(\)\)/)],
  ['dash ghosts and tear are off under Reduce motion and Reduce flashing', has('js/view/moments.js', /if \(rm\(\) \|\| rf\(\)\) return;\s*M\.starts\.dash\+\+/)],
  ['kill-streak mark takes a budget slot, and a waiting word retries through the budget', has('js/view/moments-screen.js', /if \(go\(\)\) showStreak\(n, true\)/) && has('js/view/moments-screen.js', /else if \(go\(\)\) showStreak\(S\.pending\.n, true\)/)],
  ['kill-streak word is steady and wipe-free under Reduce flashing', has('js/view/moments-screen.js', /if \(rf\(\)\) \{ showStreak\(n, false\); return; \}/)],
  ['kill-streak ink wipe is off under Reduce motion', has('js/view/moments-screen.js', /if \(wipe && !rm\(\)\) S\.wipe/)],
  ['kill-streak word does not pop under Reduce motion or Reduce flashing', has('js/view/moments-screen.js', /sc = rm\(\) \|\| rf\(\) \? 1 :/)],
  ['crit burst takes a budget slot and at most one per gap', has('js/view/moments.js', /function crit\(ev\) \{[\s\S]{0,260}!go\(\)\) return;/)],
  ['crit burst is off under Reduce motion and Reduce flashing', has('js/view/moments.js', /function crit\(ev\) \{\s*var k = C\(\)\.crit;\s*if \(rm\(\) \|\| rf\(\)/)],
  ['impact starburst takes a budget slot and at most one per gap', has('js/view/moments.js', /function impact\(ev\) \{[\s\S]{0,260}!go\(\)\) return;/)],
  ['impact starburst is off under Reduce motion and Reduce flashing', has('js/view/moments.js', /function impact\(ev\) \{\s*var k = C\(\)\.impact;\s*if \(rm\(\) \|\| rf\(\)/)],
  ['near-miss ripple takes a budget slot and is off under Reduce motion', has('js/view/moments.js', /function ripple\(ev\) \{\s*if \(rm\(\) \|\| !go\(\)\) return;/)],
  ['ripple fringe is off under Reduce flashing', has('js/view/moments.js', /fr = rf\(\) \? 0 :/)],
  ['last-stand pulse takes one budget slot a cycle (holds high when refused), and not under Reduce flashing', has('js/view/moments.js', /if \(M\.lowOn && !rf\(\)\)[\s\S]{0,260}M\.lowGranted = go\(\)/) && has('js/view/moments.js', /if \(!M\.lowGranted\) M\.pulse = 1;/)],
  ['last-stand ring holds at the upper alpha under Reduce flashing', has('js/view/moments.js', /a = rf\(\) \? k\.alpha\[1\]/)],
  ['ground-shock ring is off under Reduce motion and gapped', has('js/view/moments.js', /if \(rm\(\) \|\| M\.t - M\.shockAt < k\.gap\) return;/)],
  ['ground-shock lens is off under Reduce motion', has('js/view/moments-screen.js', /function drawLens\(c, R\) \{[\s\S]{0,400}if \(rm\(\) \|\| !list\.length\) return;/)],
  ['level-clear confetti is not spawned under Reduce motion', has('js/view/moments-screen.js', /n = rm\(\) \? 0 : k\.n/)],
  ['hood ribbon is static under Reduce motion', has('js/view/moments-screen.js', /sc = rm\(\) \? 1 :/)],
  ['moments read both Reduce flags', has('js/view/moments.js', /reduceMotion/) && has('js/view/moments.js', /reduceFlash/) && has('js/view/moments-screen.js', /reduceMotion/) && has('js/view/moments-screen.js', /reduceFlash/)],
  ['moments take the budget only through P.Fx.flashGo (no direct sprites flashOk)', !has('js/view/moments.js', /P\.Sprites\.flashOk/) && !has('js/view/moments-screen.js', /P\.Sprites\.flashOk/)],
];
wiring.forEach(([why, pass]) => { if (!pass) { fails++; console.log('FAIL wiring: ' + why); } });

console.log(fails ? fails + ' failure(s)' : 'test-a11y-canvas: all pass (' + viewFiles.length + ' view files, ' + candidates + ' candidates, ' + ALLOW.length + ' allowlisted, ' + wiring.length + ' wiring checks)');
process.exit(fails ? 1 : 0);
