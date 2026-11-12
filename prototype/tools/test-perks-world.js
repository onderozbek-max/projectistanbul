// Street Tree perk effects in the sim (R1-T5 step 2): int.1-int.4, cha.1-cha.4, cha.3 and grit.2. Each perk is checked
// learned and not learned (the base behaviour). Also the int.3 marker view (view/perk-mark.js) on a fake canvas context.
// Headless: loads index.html's non-view scripts (lib-load.js), then the two view files named below.
// Usage: node prototype/tools/test-perks-world.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { loadP, ROOT } = require('./lib-load.js');
const P = loadP();
['js/view/events-fx.js', 'js/view/perk-mark.js'].forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const DT = 1 / 60;
const problems = [];
const check = (cond, msg) => { if (!cond) problems.push(msg); };
const C = P.CFG, PK = C.perks;
const near = (a, b, tol) => Math.abs(a - b) <= tol;

function sim(perks, level) {
  const s = P.createSim(7, { levelIndex: level || 1, loadout: { perks: perks || [] } });
  s.mode = 'play'; s.hero.invuln = 1e9; s.hero.hp = s.hero.maxHp = 1e9;
  return s;
}
// Hack clock: one step of the hack system (the hero stands where the hack tells him to).
function stepHack(s) { s.t += DT; P.Hack.step(s, DT); }
function holdOn(s, H, secs) {
  s.hero.x = H.x; s.hero.y = H.y;
  for (let i = 0; i < Math.round(secs / DT) && H.state !== 'done'; i++) stepHack(s);
}
function walkAway(s, H) { s.hero.x = H.x + 1000; s.hero.y = H.y; }
const eventsOf = (s, type) => s.events.filter(e => e.type === type);

// ---------- int.1 Quick Fingers: a started hack makes no wave and lures nobody ----------
for (const learned of [false, true]) {
  const s = sim(learned ? ['int.1'] : []);
  const H = P.Hack.place(s, 'atm', 0, s.hero.y);
  const z = P.Combat.spawnEnemy(s, 'walker', H.x + 1.5, H.y + 0.5, {});
  z.state = 'active';
  const before = s.enemies.length;
  holdOn(s, H, 0.1);
  const spawned = s.enemies.length - before, noise = eventsOf(s, 'hackNoise').length;
  check(H.state === 'active', 'int.1 (' + learned + '): the hack did not start');
  if (learned) check(spawned === 0 && noise === 0 && !z.lure, 'int.1: a quiet hack still made a wave (' + spawned + ') or lured');
  else check(spawned > 0 && spawned <= C.hack.noise.wave && noise === 1 && z.lure, 'int.1 off: the noise wave changed (spawned ' + spawned + ')');
}

// ---------- int.2 Second Look: the first lost hack per run keeps its progress; the next one decays as before ----------
{
  const s = sim(['int.2']);
  const H = P.Hack.place(s, 'atm', 0, s.hero.y);
  holdOn(s, H, 1);
  const p0 = H.prog;
  walkAway(s, H); stepHack(s);
  check(H.state === 'idle' && H.prog === p0, 'int.2: the first lost hack did not keep its progress (' + H.prog + ' vs ' + p0 + ')');
  check(eventsOf(s, 'hackFail').length === 1 && eventsOf(s, 'hackFail')[0].kept === true, 'int.2: the kept loss was not reported as kept');
  for (let i = 0; i < 600; i++) stepHack(s);
  check(H.prog === p0, 'int.2: the kept progress decayed while the hero was away');
  holdOn(s, H, 0.1);
  check(H.state === 'active' && H.prog > p0, 'int.2: the kept hack did not resume from its progress');
  const H2 = P.Hack.place(s, 'atm', 0, s.hero.y + 40);
  holdOn(s, H2, 1);
  const q0 = H2.prog;
  walkAway(s, H2); stepHack(s);
  check(H2.state === 'active' && H2.prog < q0, 'int.2: the second lost hack in a run was kept (only the first is)');
}
{
  const s = sim([]);
  const H = P.Hack.place(s, 'atm', 0, s.hero.y);
  holdOn(s, H, 1);
  walkAway(s, H); stepHack(s);
  check(H.state === 'active' && H.prog < 1 / 6, 'int.2 off: the first lost hack did not decay at once');
  for (let i = 0; i < 600; i++) stepHack(s);
  const ev = eventsOf(s, 'hackFail');
  check(H.state === 'idle' && H.prog === 0 && ev.length === 1 && ev[0].kept === undefined, 'int.2 off: a lost hack did not decay to 0 and fail');
}

// ---------- int.3 Signal Boost: a cell booster marks the next terminal not yet hacked, for markT seconds ----------
{
  const s = sim(['int.3']);
  const cell = P.Hack.place(s, 'cell', 0, s.hero.y);
  const a = P.Hack.place(s, 'atm', 20, s.hero.y);
  const b = P.Hack.place(s, 'atm', -20, s.hero.y);
  holdOn(s, cell, 7);
  check(cell.state === 'done', 'int.3: the cell booster did not finish');
  check(s.pk.mark && s.pk.mark.id === a.id, 'int.3: the next terminal after the booster was not marked');
  check(s.pk.mark && near(s.pk.mark.until - s.t, PK.signalBoost.markT, DT), 'int.3: the mark does not last markT seconds');
  walkAway(s, a);
  for (let i = 0; i < Math.round((PK.signalBoost.markT - 1) / DT); i++) stepHack(s);
  check(s.pk.mark && s.pk.mark.id === a.id, 'int.3: the mark ended early');
  for (let i = 0; i < Math.round(2 / DT); i++) stepHack(s);
  check(!s.pk.mark, 'int.3: the mark did not end after markT seconds');
  check(b.state === 'idle', 'int.3: the far terminal was touched');
}
{ // the mark wraps round the list, and ends when its terminal is hacked
  const s = sim(['int.3']);
  const a = P.Hack.place(s, 'atm', 0, s.hero.y);
  const cell = P.Hack.place(s, 'cell', 20, s.hero.y);
  holdOn(s, cell, 7);
  check(s.pk.mark && s.pk.mark.id === a.id, 'int.3: the mark did not wrap to the first terminal in the list');
  holdOn(s, a, 7);
  check(a.state === 'done' && !s.pk.mark, 'int.3: the mark stayed on a terminal that is hacked');
}
{
  const s = sim([]);
  const cell = P.Hack.place(s, 'cell', 0, s.hero.y);
  P.Hack.place(s, 'atm', 20, s.hero.y);
  holdOn(s, cell, 7);
  check(cell.state === 'done' && !s.pk.mark, 'int.3 off: a cell booster marked a terminal');
}

// ---------- int.4 Backdoor: the traffic stun and the tram rush are multiplied; the ATM payout is not ----------
for (const learned of [false, true]) {
  const mul = learned ? PK.backdoor.mul : 1, T = C.hack.traffic;
  const s = sim(learned ? ['int.4'] : []);
  const H = P.Hack.place(s, 'traffic', 0, s.hero.y);
  holdOn(s, H, 7);
  const stun = eventsOf(s, 'stunWave')[0];
  check(stun && near(stun.T, T.stunT * mul, 1e-9), 'int.4 (' + learned + '): traffic stun is ' + (stun && stun.T) + ', expected ' + T.stunT * mul);
  const s2 = sim(learned ? ['int.4'] : []);
  s2.fx.hackSpeedPct = C.hack.bonusAt;
  const H2 = P.Hack.place(s2, 'traffic', 0, s2.hero.y);
  holdOn(s2, H2, 7);
  const stun2 = eventsOf(s2, 'stunWave')[0];
  check(stun2 && near(stun2.T, (T.stunT + T.bonusT) * mul, 1e-9), 'int.4 (' + learned + '): bonus traffic stun is ' + (stun2 && stun2.T));
  const s3 = sim(learned ? ['int.4'] : []);
  const H3 = P.Hack.place(s3, 'tram', 0, s3.hero.y);
  holdOn(s3, H3, 7);
  check(H3.rush > 0 && near(H3.rush, C.hack.tram.rushT, 1e-9), 'int.4 (' + learned + '): the tram rush time never changes (' + H3.rush + ')');
  check(near(H3.lane, C.hack.tram.len * mul, 1e-9), 'int.4 (' + learned + '): tram lane is ' + H3.lane + ', expected ' + C.hack.tram.len * mul);
  const s5 = sim(learned ? ['int.4'] : []);
  const H5 = P.Hack.place(s5, 'tram', 0, s5.hero.y);
  const far = P.Combat.spawnEnemy(s5, 'walker', H5.x, H5.y + C.hack.tram.len * 1.25, {});
  far.speed = 0; far.hp = far.maxHp = 1;
  holdOn(s5, H5, 7);
  check(far.dead === learned, 'int.4 (' + learned + '): an enemy 25% past the base lane is ' + (far.dead ? 'crushed' : 'safe') + ', expected ' + (learned ? 'crushed' : 'safe'));
  const s4 = sim(learned ? ['int.4'] : []);
  const H4 = P.Hack.place(s4, 'atm', 0, s4.hero.y);
  holdOn(s4, H4, 7);
  const coins = s4.drops.filter(d => d.kind === 'jeton').length;
  check(coins === C.hack.atm.coins, 'int.4 (' + learned + '): ATM payout changed (' + coins + ' coins)');
}

// ---------- cha.1 Good Name: the rescue hold is holdT seconds ----------
// Starts a rescue, kills its trappers, stands the hero on the cage and steps until it is freed. Returns the time taken.
function rescueTime(perks, civHelp, stopAt) {
  const s = sim(perks);
  s.fx.civHelpPct = civHelp || 0;
  const ev = P.Events.start(s, 'rescue', {});
  s.enemies.forEach(e => { if (e.evId === ev.id) e.dead = true; });
  s.hero.x = ev.x; s.hero.y = ev.y;
  let t = 0;
  while (!ev.done && t < 60 && !(stopAt && t >= stopAt)) { s.t += DT; t += DT; P.Events.step(s, DT); }
  return { s, ev, t };
}
{
  const on = rescueTime(['cha.1']), off = rescueTime([]);
  check(on.ev.result === 'freed' && off.ev.result === 'freed', 'cha.1: a rescue was not freed');
  check(near(on.t, PK.goodName.holdT, 2 * DT), 'cha.1: learned hold took ' + on.t.toFixed(3) + ' s, expected ' + PK.goodName.holdT);
  check(near(off.t, C.ev.rescue.holdT, 2 * DT), 'cha.1 off: hold took ' + off.t.toFixed(3) + ' s, expected ' + C.ev.rescue.holdT);
  const half = rescueTime(['cha.1'], 0, 1);   // the cage arc (events-fx: hold / holdT) reads the time held as a share of the hold
  check(near(half.ev.hold / C.ev.rescue.holdT, 1 / PK.goodName.holdT, 0.02), 'cha.1: the cage arc does not fill with the time held');
}

// ---------- cha.4 Neighbourhood: every rescue brings a helper for helpT seconds, even below the civHelpPct gate ----------
function helperStart(res) { return eventsOf(res.s, 'helperStart')[0]; }
function rescueDone(res) { return eventsOf(res.s, 'rescueDone')[0]; }
{
  const low = rescueTime(['cha.4'], 0), lowOff = rescueTime([], 0);
  check(helperStart(low) && helperStart(low).t === PK.neighbourhood.helpT, 'cha.4: a rescue below the gate brought no helper for helpT');
  check(rescueDone(low).helper === true, 'cha.4: rescueDone did not report the helper');
  check(!helperStart(lowOff) && rescueDone(lowOff).helper === false, 'cha.4 off: a rescue below the gate brought a helper');
  const gate = C.ev.rescue.helperMin;
  const high = rescueTime([], gate), highOn = rescueTime(['cha.4'], gate);
  check(helperStart(high) && helperStart(high).t === C.ev.rescue.helperT, 'cha.4 off: a gated rescue lost its helperT');
  check(helperStart(highOn) && helperStart(highOn).t === C.ev.rescue.helperT, 'cha.4: a rescue that already brings a helper (charm gate) keeps the full helper time');
}

// ---------- cha.2 Friendly Faces: escort contact HP is escortT seconds, not 4 ----------
for (const learned of [false, true]) {
  const s = sim(learned ? ['cha.2'] : [], 7);   // escort needs the generated level's rng.level
  s.enemies = [];
  const o = { id: 'escort', state: 'active' };
  P.ObjKinds.escort.init(s, o);
  const hp = learned ? PK.friendlyFaces.escortT : C.objectives.types.escort.hp;
  check(o.civ.hp === hp && o.civ.max === hp, 'cha.2 (' + learned + '): escort HP is ' + o.civ.hp + ', expected ' + hp);
  const z = P.Combat.spawnEnemy(s, 'walker', o.civ.x, o.civ.y, {});
  z.state = 'active';
  let t = 0;
  while (o.state === 'active' && t < 30) { P.ObjKinds.escort.step(s, o, DT); t += DT; }
  check(o.state === 'failed' && near(t, hp, 2 * DT), 'cha.2 (' + learned + '): escort lasted ' + t.toFixed(3) + ' s in contact, expected ' + hp);
}

// ---------- cha.3 Regular: extra free rerolls per run ----------
{
  check(sim([]).rerolls === C.cards.freeRerolls, 'cha.3 off: free rerolls changed');
  check(sim(['cha.3']).rerolls === C.cards.freeRerolls + PK.regular.rerolls, 'cha.3: free rerolls not raised by regular.rerolls');
}

// ---------- grit.2 Tea Break: the medkit regen delay is teaBreak.delay for medkit holders ----------
function regenAfter(perks, sinceHit, medkit) {
  const s = sim(perks), h = s.hero;
  h.passives = medkit ? { medkit: 1 } : {};
  h.hp = h.maxHp - 10; h.sinceHit = sinceHit;
  P.stepSim(s, DT, null);
  return h.regenOn === true;
}
{
  check(regenAfter(['grit.2'], 2.5, true) === true, 'grit.2: regen did not start after teaBreak.delay');
  check(regenAfter([], 2.5, true) === false, 'grit.2 off: regen started before the base 3 s');
  check(regenAfter([], 3.5, true) === true && regenAfter(['grit.2'], 3.5, true) === true, 'grit.2: regen did not start after 3 s');
  check(regenAfter(['grit.2'], 5, false) === false, 'grit.2: a hero without a medkit regenerates');
}

// ---------- learned ids: unknown ids are dropped (a bad loadout cannot switch a hook on) ----------
check(JSON.stringify(P.Perks.set(['int.1', 'nope.9', 'int.9'])) === '{"int.1":1}', 'P.Perks.set kept an unknown perk id');

// ---------- int.3 marker (view): a ring and an arrow over the marked terminal only, nothing else ----------
function fakeCtx(log) {
  const store = {};
  return new Proxy(store, {
    get: (t, k) => (k in t ? t[k] : (...a) => { log.push([k, ...a]); }),
    set: (t, k, v) => { t[k] = v; return true; },
  });
}
{
  const s = sim(['int.3']);
  const cell = P.Hack.place(s, 'cell', 0, s.hero.y);
  const a = P.Hack.place(s, 'atm', 20, s.hero.y);
  const R = { ppm: 10, X: x => 400 + x * 10, Y: y => 800 - y * 10 };
  let log = [];
  R.ctx = fakeCtx(log);
  P.PerkMark.draw(R, s);
  check(log.length === 0, 'int.3 view: a terminal with no mark was drawn');
  holdOn(s, cell, 7);
  log = []; R.ctx = fakeCtx(log);
  P.PerkMark.draw(R, s);
  const r = C.hack.r * PK.C_mark.ringMul * R.ppm;
  const ring = log.filter(c => c[0] === 'arc' && near(c[3], r, 1e-9));
  check(ring.length === 1 && near(ring[0][1], R.X(a.x), 1e-9) && near(ring[0][2], R.Y(a.y), 1e-9), 'int.3 view: the marked ring is not on the marked terminal');
  check(log.some(c => c[0] === 'moveTo' && near(c[2], R.Y(a.y) - r, 1e-9)), 'int.3 view: the arrow does not point at the marked terminal');
  log = []; R.ctx = fakeCtx(log);
  P.EventsFx.drawGround(R, s);
  check(log.some(c => c[0] === 'arc' && near(c[3], r, 1e-9)), 'int.3 view: the marker is not drawn through the EventsFx ground pass');
}

if (problems.length) { console.log('perks-world: FAIL'); problems.forEach(p => console.log('  - ' + p)); process.exit(1); }
console.log('perks-world: ok (int.1-int.4, cha.1-cha.4, cha.3, grit.2 learned and not learned; int.3 marker)');
