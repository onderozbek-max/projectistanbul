// Eczane heal station tests (R1-T4 part 14): headless, seeded, no DOM. Covers placement (never L1 or L2, never the boss stage,
// never a waterside or bazaar hood, at most one per level, the same placement for the same seed, the route stays open, the
// station stands clear of other blocks), the touch rule (dwell, reset on a gap, nothing at full HP), a single use with the heal
// capped at max HP, the heal outside drops.healCap (also when the budget is spent), the pickup event (healed, uncapped, capped),
// the boss-arena simit's event (uncapped, healed includes the grit bonus), the view's state read, and a lint of the sim files
// (no settings, no view, no decimal literals in sim/eczane.js; numbers live in config-env.js).
// Usage: node prototype/tools/test-eczane.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
// Same module list as bot.js and test-env.js: index.html's sim scripts (view, story and flow files excluded).
const NOT_SIM = /^js\/(view|story|dialogue)\/|^js\/main\.js$|^js\/meta\/meta-(ui|map|hub|gear|stats|arsenal|collect|daily|save)\.js$/;
const FILES = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)]
  .map(m => m[1]).filter(f => !NOT_SIM.test(f));
const store = {};
globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
FILES.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const P = globalThis.P;

const DT = 1 / 60, fails = [];
let passes = 0;
function check(cond, msg) { if (cond) passes++; else fails.push(msg); }
const C = P.CFG.env.eczane;

function mk(seed, idx) { return P.createSim(seed, { levelIndex: idx, loadout: null }); }
function started(seed, idx) { const s = mk(seed, idx); P.startPlay(s); s.enemies.length = 0; s.drops.length = 0; return s; }
// The lane-side point touching a station (hero centre 0.3 m off its near face).
function touchPoint(st) { const b = st.b, sg = Math.sign(b.x); return { x: b.x - sg * (b.w / 2 + 0.3), y: b.y }; }
function stationOf(s) { return s.eczane && s.eczane.list[0]; }
function healEvents(s) { return s.events.filter(e => e.type === 'pickup' && e.kind === 'eczane'); }

// ---------- 1. config ----------
check(C.heal === 30, 'config: env.eczane.heal is 30 (the owner-approved start)');
check(C.from >= 3 && C.stages.indexOf(5) < 0, 'config: stations start at L3 and never use stage 5 (the boss arena)');
check(C.perLevel === 1 && C.touchR > 0 && C.dwell > 0, 'config: one station per level, with a touch range and a dwell');
check(P.CFG.drops.healCap > 0 && C.heal > 0, 'config: drops.healCap and the station heal are both set');

// ---------- 2. placement ----------
{
  let l1 = true, l2 = true;
  for (let sd = 1; sd <= 4; sd++) { if (mk(sd, 1).eczane) l1 = false; if (mk(sd, 2).eczane) l2 = false; }
  check(l1, 'placement: L1 never has a station (scripted level, no generated geometry)');
  check(l2, 'placement: L2 never has a station (tutorial and ramp)');
}
{
  let boss = 0, bossN = 0;
  for (let idx = 5; idx <= 100; idx += 5) {
    if (!P.Journey.level(idx).boss) continue;
    bossN++;
    for (let sd = 1; sd <= 2; sd++) if (mk(sd, idx).eczane) boss++;
  }
  check(bossN === 20 && boss === 0, 'placement: no station on any boss stage (L5, L10 ... L100), ' + boss + ' found');
}
{
  let placed = 0, eligible = 0, multi = 0, badHood = [], open = [], overlap = [], notRoute = [];
  for (let idx = 3; idx <= 100; idx++) {
    const info = P.Journey.level(idx);
    const s = mk(1, idx), n = s.eczane ? s.eczane.list.length : 0;
    if (!info.boss && C.stages.indexOf(info.stage) >= 0 && P.Eczane.streetLike(info.hood)) eligible++;
    if (n > 1) multi++;
    if (!n) continue;
    placed++;
    const hood = info.hood;
    if (C.stages.indexOf(info.stage) < 0 || !P.Eczane.streetLike(hood)) badHood.push(info.id);
    if (hood.vehicles.some(v => C.noVehicles.indexOf(v) >= 0) || C.notThemes.indexOf(hood.theme) >= 0) badHood.push(info.id + ' (vehicles/theme)');
    if (!P.Env.pathOpen(s)) open.push(info.id);
    const b = s.eczane.list[0].b;
    if (b.y >= s.geo.holdY) notRoute.push(info.id);
    const clash = s.geo.blocks.some(o => o !== b && Math.abs(o.x - b.x) < (o.w + b.w) / 2 && Math.abs(o.y - b.y) < (o.h + b.h) / 2);
    if (clash) overlap.push(info.id);
  }
  check(multi === 0, 'placement: at most one station per level (' + multi + ' levels with more)');
  check(badHood.length === 0, 'placement: only stages 1-4 of street-like hoods (' + badHood.join(' ') + ')');
  check(open.length === 0, 'placement: the route stays open with the station (' + open.join(' ') + ')');
  check(notRoute.length === 0, 'placement: the station sits below the hold zone (' + notRoute.join(' ') + ')');
  check(overlap.length === 0, 'placement: the station does not overlap a block (' + overlap.join(' ') + ')');
  check(placed >= Math.floor(eligible * 0.9), 'placement: covers most eligible levels (' + placed + ' of ' + eligible + ')');
}
{
  const sa = mk(7, 9), sb = mk(7, 9), a = sa.eczane && sa.eczane.list[0].b, b = sb.eczane && sb.eczane.list[0].b;
  check(!!a && !!b && a.x === b.x && a.y === b.y && a.w === b.w, 'placement: the same seed and level give the same spot');
  const xs = [1, 2, 3, 4].map(sd => { const st = mk(sd, 9).eczane; return st ? st.list[0].b.y : -1; });
  check(new Set(xs).size > 1, 'placement: a different seed moves the station (' + xs.join(',') + ')');
}
{
  const saved = C.perLevel;
  C.perLevel = 0;
  const off = mk(1, 9).eczane;
  C.perLevel = saved;
  check(!off, 'placement: perLevel 0 turns placement off (the before-part-14 build)');
}
check(P.Eczane.streetLike(P.Journey.hoods.find(h => h.id === 'kapalicarsi')) === false, 'placement: the covered bazaar is not street-like');
check(P.Eczane.streetLike(P.Journey.hoods.find(h => h.id === 'karakoy')) === false, 'placement: a ferry hood is not street-like');
check(P.Eczane.streetLike(P.Journey.hoods.find(h => h.id === 'istiklal')) === true, 'placement: İstiklal is street-like');

// ---------- 3. touch, dwell and the heal ----------
{
  const s = started(3, 3), st = stationOf(s), h = s.hero, t = touchPoint(st);
  check(!!st, 'touch: L3 seed 3 has a station to test');
  if (st) {
    h.x = t.x; h.y = t.y; h.hp = h.maxHp - 50;
    check(P.Eczane.state(s, st.b) === 'usable', 'state: a fresh station reads usable');
    P.Eczane.step(s, 0.3);                                       // 0.3 s of touch: not yet
    check(!st.used && h.hp === h.maxHp - 50, 'touch: no use before the dwell');
    P.Eczane.step(s, 0.2);                                       // 0.5 s in total: used
    check(st.used && Math.abs(h.hp - (h.maxHp - 20)) < 1e-9, 'heal: the touch uses the station and heals the heal amount (' + h.hp + ')');
    check(P.Eczane.state(s, st.b) === 'empty', 'state: a used station reads empty');
    const ev = healEvents(s);
    check(ev.length === 1 && ev[0].value === C.heal && ev[0].healed === C.heal, 'event: one pickup with value and healed = heal');
    check(ev.length === 1 && ev[0].uncapped === true && ev[0].capped === false, 'event: the station heal is uncapped and not capped');
    h.hp = 20; for (let i = 0; i < 300; i++) P.Eczane.step(s, DT);
    check(h.hp === 20, 'single use: a used station heals nothing more, however long the hero stands by it');
  }
}
{
  const s = started(3, 3), st = stationOf(s), h = s.hero, t = touchPoint(st);
  h.x = t.x; h.y = t.y; h.hp = h.maxHp - 50;
  P.Eczane.step(s, 0.3);
  h.x = 0; h.y = t.y;                                            // step away: the dwell resets
  P.Eczane.step(s, DT);
  check(st.dwell === 0, 'touch: a gap in the touch resets the dwell');
  h.x = t.x; for (let i = 0; i < 20; i++) P.Eczane.step(s, DT);  // 0.33 s again: still not used
  check(!st.used, 'touch: the dwell starts again from zero after a gap');
}
{
  const s = started(3, 3), st = stationOf(s), h = s.hero, t = touchPoint(st);
  h.x = t.x; h.y = t.y; h.hp = h.maxHp;
  for (let i = 0; i < 120; i++) P.Eczane.step(s, DT);
  check(!st.used && P.Eczane.state(s, st.b) === 'usable', 'touch: a hero at full HP does not use the station');
  h.hp = h.maxHp - 10;
  for (let i = 0; i < 30; i++) P.Eczane.step(s, DT);
  check(st.used && h.hp === h.maxHp, 'heal: a partial need is healed to max HP, never past it');
  check(healEvents(s)[0].healed === 10, 'event: healed is the HP actually restored (10 of 30)');
}
{
  const s = started(3, 3), st = stationOf(s), h = s.hero;
  h.x = 0; h.y = st.b.y;                                         // far from the station
  for (let i = 0; i < 120; i++) P.Eczane.step(s, DT);
  check(!st.used && st.dwell === 0, 'touch: a hero away from the station never uses it');
}
{
  // Outside the drop budget: the heal lands even when drops.healCap is spent, and it does not spend the budget.
  const s = started(3, 3), st = stationOf(s), h = s.hero, t = touchPoint(st);
  s.dropHealed = P.CFG.drops.healCap;
  h.x = t.x; h.y = t.y; h.hp = h.maxHp - 30;
  for (let i = 0; i < 40; i++) P.Eczane.step(s, DT);
  check(st.used && h.hp === h.maxHp, 'cap: the station heals with the drop budget spent');
  check(s.dropHealed === P.CFG.drops.healCap, 'cap: the station does not count toward drops.healCap');
}
{
  // The sim path (stepSim) runs the station too: a hurt hero who stands by it is healed within a second.
  const s = started(4, 3), st = stationOf(s), h = s.hero, t = touchPoint(st);
  h.x = t.x; h.y = t.y; h.hp = h.maxHp - 40;
  for (let i = 0; i < 60; i++) P.stepSim(s, DT, { x: 0, y: 0 });
  check(st.used && healEvents(s).length === 1, 'stepSim: the station is stepped by the sim each tick (one heal event)');
}

// ---------- 4. drop heals: the pickup event (combat.js updateDrops) ----------
{
  const s = started(3, 3), h = s.hero;
  s.dropHealed = P.CFG.drops.healCap; h.hp = h.maxHp - 25;
  s.drops.push({ kind: 'simit', value: P.CFG.drops.simitHeal, x: h.x, y: h.y, mag: false, pop: 0 });
  P.Combat.updateDrops(s, DT);
  const ev = s.events.filter(e => e.type === 'pickup' && e.kind === 'simit')[0];
  check(ev && ev.healed === 0 && ev.capped === true && ev.uncapped === false, 'drops: a simit with the budget spent reads capped (CAP), healed 0');
  check(h.hp === h.maxHp - 25, 'drops: a capped simit restores nothing');
}
{
  // The boss-arena simit: uncapped, so it heals with the budget spent and the event says so (no CAP).
  const s = started(3, 3), h = s.hero;
  s.dropHealed = P.CFG.drops.healCap; h.hp = h.maxHp - 40;
  s.drops.push({ kind: 'simit', value: P.CFG.levels.bossHeal.value, x: h.x, y: h.y, mag: false, pop: 0, uncapped: true });
  P.Combat.updateDrops(s, DT);
  const ev = s.events.filter(e => e.type === 'pickup' && e.kind === 'simit')[0];
  check(ev && ev.uncapped === true && ev.capped === false && ev.healed === P.CFG.levels.bossHeal.value, 'drops: the boss-arena simit is uncapped and reads its healed amount');
  check(s.dropHealed === P.CFG.drops.healCap, 'drops: the uncapped simit does not count toward the budget');
}
{
  // The grit bonus (Iron Stomach, grit.3) is in the healed amount, not only in the sim's heal.
  const s = started(3, 3), h = s.hero, bonus = P.CFG.perks.ironStomach.simitHeal;
  s.perk = { 'grit.3': true }; h.hp = h.maxHp - 60;
  s.drops.push({ kind: 'simit', value: P.CFG.drops.simitHeal, x: h.x, y: h.y, mag: false, pop: 0, uncapped: true });
  P.Combat.updateDrops(s, DT);
  const ev = s.events.filter(e => e.type === 'pickup' && e.kind === 'simit')[0];
  check(ev && ev.healed === P.CFG.drops.simitHeal + bonus, 'grit: the event carries the grit bonus in healed (' + (ev && ev.healed) + ')');
}
{
  // Non-heal pickups keep their old event shape (no healed field).
  const s = started(3, 3), h = s.hero;
  s.drops.push({ kind: 'jeton', value: 2, x: h.x, y: h.y, mag: false, pop: 0 });
  P.Combat.updateDrops(s, DT);
  const ev = s.events.filter(e => e.type === 'pickup')[0];
  check(ev && ev.kind === 'jeton' && ev.healed === undefined && ev.value === 2, 'drops: a jeton pickup keeps its event shape');
}

// ---------- 5. L1 untouched, determinism, the sim's isolation ----------
{
  const a = mk(5, 3), b = mk(5, 3);
  P.startPlay(a); P.startPlay(b);
  a.enemies.length = 0; b.enemies.length = 0;
  for (let i = 0; i < 600; i++) { P.stepSim(a, DT, { x: 0, y: 1 }); P.stepSim(b, DT, { x: 0, y: 1 }); }
  check(!!a.eczane && a.hero.hp === b.hero.hp && a.hero.y === b.hero.y && a.eczane.list[0].used === b.eczane.list[0].used,
    'determinism: the same seed gives the same run with a station in it');
}
{
  const s = P.createSim(2, { levelIndex: 1, loadout: null });
  check(s.eczane === undefined && P.Eczane.place(s, 1, { stage: 1, hood: P.Journey.hoods[0] }) === null, 'L1: no station and place() refuses index 1');
}
// The view reads the sim; the sim reads nothing from settings or the view.
{
  const src = fs.readFileSync(path.join(ROOT, 'js/sim/eczane.js'), 'utf8');
  const code = src.replace(/\/\/.*$/gm, '').replace(/'[^'\n]*'/g, "''");
  check(!/P\.Settings|quality|QualityProfile|P\.Consumables|P\.Props|P\.Hints|P\.Render|document\.|window\./.test(code), 'lint: js/sim/eczane.js reads no settings, quality or view');
  const dec = code.match(/\b\d+\.\d+|\b\d+e-\d+|0x[0-9a-fA-F]+/g) || [];
  check(dec.length === 0, 'lint: js/sim/eczane.js has no decimal or hex literal (numbers live in config-env.js): ' + dec.join(' '));
  const hack = fs.readFileSync(path.join(ROOT, 'js/sim/hack.js'), 'utf8');
  check(/if \(b\.station\) return;/.test(hack), 'hack.js: the signal box shortcut skips an eczane station');
}

console.log('eczane tests: ' + passes + ' checks passed, ' + fails.length + ' failed');
fails.forEach(f => console.log('  FAIL ' + f));
process.exitCode = fails.length ? 1 : 0;
