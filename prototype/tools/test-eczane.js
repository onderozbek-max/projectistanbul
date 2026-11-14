// Heal station tests (R1-T4 part 14: the eczane; R1-T4 part 17: the kiosk): headless, seeded, no DOM. Covers the two variants
// (same rules, one module): config, placement (the pharmacy in street-like hoods, the kiosk in every other hood, including the
// covered bazaar; never L1, L2 or a boss stage; at most one per level; every non-boss route level L3+ can have one; the same seed
// gives the same spot; the pharmacy spots are the part-14 spots, unchanged), the touch rule (dwell, reset on a gap, nothing at full
// HP), a single use with the heal capped at max HP, the heal outside drops.healCap (also with the budget spent), the pickup event
// (kind, station, healed, uncapped, capped), the boss-arena simit's event, the view's state read, determinism, and a lint of the sim
// file (no settings, no view, no decimal literals in sim/eczane.js; numbers live in config-env.js).
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
const C = P.CFG.env.eczane, EV = C.variants.eczane, KV = C.variants.kiosk;
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];
// The hoods that get the kiosk (not street-like): the boat and ferry hoods and the covered bazaar. Stated here so a change shows.
const KIOSK_HOODS = 'karakoy,bridge,eminonu,kapalicarsi,kumkapi,halic,yenikapi,samatya,atakoysahil';

function mk(seed, idx) { return P.createSim(seed, { levelIndex: idx, loadout: null }); }
function started(seed, idx) { const s = mk(seed, idx); P.startPlay(s); s.enemies.length = 0; s.drops.length = 0; return s; }
// The lane-side point touching a station (hero centre 0.3 m off its near face).
function touchPoint(st) { const b = st.b, sg = Math.sign(b.x); return { x: b.x - sg * (b.w / 2 + 0.3), y: b.y }; }
function stationOf(s) { return s.eczane && s.eczane.list[0]; }
function stationEvents(s) { return s.events.filter(e => e.type === 'pickup' && e.station); }
// Route levels L3..L100 (stages 1 to 4, never a boss stage) of the variant's hood, and the first seed that gets a station there.
function routeLevels() {
  const out = [];
  for (let idx = C.from; idx <= 100; idx++) { const info = P.Journey.level(idx); if (!info.boss && C.stages.indexOf(info.stage) >= 0) out.push(idx); }
  return out;
}
function findStation(variant) {
  for (const idx of routeLevels()) {
    if (P.Eczane.variantOf(P.Journey.level(idx).hood) !== variant) continue;
    for (const sd of SEEDS) { const s = mk(sd, idx); if (s.eczane) return { idx, seed: sd }; }
  }
  return null;
}

// ---------- 1. config ----------
check(C.heal === 30, 'config: env.eczane.heal is 30 (the owner-approved start)');
check(C.from >= 3 && C.stages.indexOf(5) < 0, 'config: stations start at L3 and never use stage 5 (the boss arena)');
check(C.perLevel === 1 && C.touchR > 0 && C.dwell > 0, 'config: one station per level, with a touch range and a dwell');
check(P.CFG.drops.healCap > 0 && C.heal > 0, 'config: drops.healCap and the station heal are both set');
check(JSON.stringify(Object.keys(C.variants)) === '["eczane","kiosk"]', 'config: two variants, eczane and kiosk');
check(EV.kind === 'eczane' && KV.kind === 'bufe', 'config: block kinds are eczane (pharmacy) and bufe (kiosk)');
check(P.CFG.env.hp[KV.kind] === undefined, 'config: the kiosk block is not breakable (bufe is not an env hp kind; kiosk is the newspaper kiosk)');
check(EV.seedSalt !== KV.seedSalt, 'config: the variants draw from different placement streams');
check(['heal', 'dwell', 'touchR', 'from', 'stages', 'perLevel', 'bot'].every(k => EV[k] === undefined && KV[k] === undefined),
  'config: the sim rules live once, on the shared block, not on a variant');
check(EV.w > 0 && EV.h > 0 && KV.w > 0 && KV.h > 0, 'config: both footprints are set');

// ---------- 2. placement ----------
{
  let l1 = true, l2 = true;
  for (const sd of SEEDS.slice(0, 4)) { if (mk(sd, 1).eczane) l1 = false; if (mk(sd, 2).eczane) l2 = false; }
  check(l1, 'placement: L1 never has a station (scripted level, no generated geometry)');
  check(l2, 'placement: L2 never has a station (tutorial and ramp)');
}
{
  let boss = 0, bossN = 0;
  for (let idx = 5; idx <= 100; idx += 5) {
    if (!P.Journey.level(idx).boss) continue;
    bossN++;
    for (const sd of SEEDS.slice(0, 2)) if (mk(sd, idx).eczane) boss++;
  }
  check(bossN === 20 && boss === 0, 'placement: no station on any boss stage (L5, L10 ... L100), ' + boss + ' found');
}
{
  // Every route level L3..L100 (78 of them): at most one station, the variant its hood gets, a clean spot, the route open.
  const levels = routeLevels();
  let placed = 0, multi = [], wrongVariant = [], open = [], notRoute = [], overlap = [], outside = [], noStation = [];
  for (const idx of levels) {
    const info = P.Journey.level(idx), want = P.Eczane.variantOf(info.hood), W = C.variants[want];
    let got = 0;
    for (const sd of SEEDS) {
      const s = mk(sd, idx), n = s.eczane ? s.eczane.list.length : 0;
      if (n > 1) multi.push(idx + ':' + sd);
      if (!n) continue;
      got++; placed++;
      const st = s.eczane.list[0], b = st.b;
      if (st.variant !== want || b.kind !== W.kind || s.eczane.variant !== want) wrongVariant.push(info.id + ':' + sd + ' ' + b.kind);
      if (!P.Env.pathOpen(s)) open.push(info.id + ':' + sd);
      if (b.y >= s.geo.holdY) notRoute.push(info.id + ':' + sd);
      if (Math.abs(b.x) + b.w / 2 > s.geo.xMax) outside.push(info.id + ':' + sd);
      const clash = s.geo.blocks.some(o => o !== b && Math.abs(o.x - b.x) < (o.w + b.w) / 2 && Math.abs(o.y - b.y) < (o.h + b.h) / 2);
      if (clash) overlap.push(info.id + ':' + sd);
    }
    if (!got) noStation.push(info.id);
  }
  check(multi.length === 0, 'placement: at most one station per level (' + multi.join(' ') + ')');
  check(wrongVariant.length === 0, 'placement: the variant follows the hood (eczane in street-like hoods, bufe elsewhere): ' + wrongVariant.join(' '));
  check(open.length === 0, 'placement: the route stays open with the station (' + open.join(' ') + ')');
  check(notRoute.length === 0, 'placement: the station sits below the hold zone (' + notRoute.join(' ') + ')');
  check(outside.length === 0, 'placement: the station is inside the corridor (' + outside.join(' ') + ')');
  check(overlap.length === 0, 'placement: the station does not overlap a block (' + overlap.join(' ') + ')');
  check(noStation.length === 0, 'placement: every non-boss route level L3+ can have one station, on some seed 1-8 (none: ' + noStation.join(' ') + ')');
  check(placed >= Math.floor(levels.length * SEEDS.length * 0.95), 'placement: at least 95% of (level, seed) pairs get a station (' + placed + ' of ' + levels.length * SEEDS.length + ')');
}
{
  const kioskHoods = P.Journey.hoods.filter(h => !P.Eczane.streetLike(h)).map(h => h.id).join(',');
  check(kioskHoods === KIOSK_HOODS, 'placement: the kiosk takes every non-street hood, the bazaar included (' + kioskHoods + ')');
  const baz = routeLevels().filter(idx => P.Journey.level(idx).hood.id === 'kapalicarsi');
  const bazKiosk = baz.filter(idx => SEEDS.some(sd => { const s = mk(sd, idx); return s.eczane && s.eczane.variant === 'kiosk'; }));
  check(baz.length === 4 && bazKiosk.length === 4, 'placement: the covered bazaar (Kapalıçarşı) is not excluded: a kiosk on all 4 route levels (' + bazKiosk.length + ')');
  const pharm = P.Journey.hoods.filter(h => P.Eczane.streetLike(h)).map(h => h.id);
  check(pharm.length === 11 && pharm.indexOf('kapalicarsi') < 0 && pharm.indexOf('karakoy') < 0 && pharm.indexOf('istiklal') >= 0,
    'placement: eleven street-like hoods get the pharmacy (' + pharm.join(',') + ')');
}
check(P.Eczane.streetLike(P.Journey.hoods.find(h => h.id === 'kapalicarsi')) === false, 'placement: the covered bazaar is not street-like');
check(P.Eczane.streetLike(P.Journey.hoods.find(h => h.id === 'karakoy')) === false, 'placement: a ferry hood is not street-like');
check(P.Eczane.streetLike(P.Journey.hoods.find(h => h.id === 'istiklal')) === true, 'placement: İstiklal is street-like');
check(P.Eczane.variantOf(P.Journey.hoods.find(h => h.id === 'istiklal')) === 'eczane' && P.Eczane.variantOf(P.Journey.hoods.find(h => h.id === 'samatya')) === 'kiosk',
  'placement: variantOf gives the pharmacy in street hoods and the kiosk in waterside ones');
{
  // The pharmacy spots (same stream and clearances as part 14; y moved with the P1 route stretch x1.25, T4 part 16): a regression guard, not a target.
  const a = mk(1, 3).eczane.list[0].b, b = mk(3, 3).eczane.list[0].b, c = mk(1, 26).eczane.list[0].b, d = mk(3, 6).eczane.list[0].b;
  const near = (p, x, y) => Math.abs(p.x - x) < 5e-4 && Math.abs(p.y - y) < 5e-4;
  check(near(a, 3.0179, 153.7176) && near(b, -3.1554, 142.4672) && near(c, 3.0575, 54.7793) && near(d, 3.5852, 104.3626),
    'placement: the pharmacy spots are stable (L3 seed 1 and 3, L26 seed 1, L6 seed 3), P1 positions');
}
{
  const sa = mk(7, 9), sb = mk(7, 9), a = sa.eczane && sa.eczane.list[0].b, b = sb.eczane && sb.eczane.list[0].b;
  check(!!a && !!b && a.x === b.x && a.y === b.y && a.w === b.w, 'placement: the same seed and level give the same spot');
  const xs = [1, 2, 3, 4].map(sd => { const st = mk(sd, 9).eczane; return st ? st.list[0].b.y : -1; });
  check(new Set(xs).size > 1, 'placement: a different seed moves the station (' + xs.join(',') + ')');
  const k1 = mk(1, 11).eczane, k2 = mk(1, 11).eczane;
  check(!!k1 && k1.variant === 'kiosk' && k1.list[0].b.x === k2.list[0].b.x && k1.list[0].b.y === k2.list[0].b.y,
    'placement: a kiosk level gives the same spot for the same seed (L11 seed 1)');
}
{
  const saved = C.perLevel;
  C.perLevel = 0;
  const off = mk(1, 9).eczane, offK = mk(1, 11).eczane;
  C.perLevel = saved;
  check(!off && !offK, 'placement: perLevel 0 turns placement off for both variants (the before-part-14 build)');
}
{
  const s = P.createSim(2, { levelIndex: 1, loadout: null });
  check(s.eczane === undefined && P.Eczane.place(s, 1, { stage: 1, hood: P.Journey.hoods[0] }) === null, 'L1: no station and place() refuses index 1');
}

// ---------- 3. the rules, run for each variant ----------
// Each variant gets the same battery: touch and dwell, the heal, the event, one use, the cap, the sim path, determinism.
function rules(label, found, kind) {
  const L = (m) => check(false, label + ': ' + m);
  if (!found) { L('no route level with a ' + label + ' station on seeds 1-8'); return; }
  const { idx, seed } = found;
  const W = label === 'pharmacy' ? EV : KV;
  // touch, dwell, heal, event, state
  {
    const s = started(seed, idx), st = stationOf(s), h = s.hero, t = touchPoint(st);
    check(!!st && st.variant === (label === 'pharmacy' ? 'eczane' : 'kiosk') && st.b.kind === W.kind, label + ': the station is the right variant and block kind');
    h.x = t.x; h.y = t.y; h.hp = h.maxHp - 50;
    check(P.Eczane.state(s, st.b) === 'usable', label + ': a fresh station reads usable');
    P.Eczane.step(s, 0.3);
    check(!st.used && h.hp === h.maxHp - 50, label + ': no use before the dwell');
    P.Eczane.step(s, 0.2);
    check(st.used && Math.abs(h.hp - (h.maxHp - 20)) < 1e-9, label + ': the touch uses the station and heals the heal amount (' + h.hp + ')');
    check(P.Eczane.state(s, st.b) === 'empty', label + ': a used station reads empty');
    const ev = stationEvents(s);
    check(ev.length === 1 && ev[0].value === C.heal && ev[0].healed === C.heal, label + ': one pickup event with value and healed = heal');
    check(ev.length === 1 && ev[0].kind === W.kind && ev[0].station === (label === 'pharmacy' ? 'eczane' : 'kiosk'),
      label + ': the event carries the block kind and the variant');
    check(ev.length === 1 && ev[0].uncapped === true && ev[0].capped === false, label + ': the station heal is uncapped and not capped');
    h.hp = 20; for (let i = 0; i < 300; i++) P.Eczane.step(s, DT);
    check(h.hp === 20, label + ': single use: a used station heals nothing more, however long the hero stands by it');
  }
  // a gap in the touch resets the dwell
  {
    const s = started(seed, idx), st = stationOf(s), h = s.hero, t = touchPoint(st);
    h.x = t.x; h.y = t.y; h.hp = h.maxHp - 50;
    P.Eczane.step(s, 0.3);
    h.x = 0; h.y = t.y;
    P.Eczane.step(s, DT);
    check(st.dwell === 0, label + ': a gap in the touch resets the dwell');
    h.x = t.x; for (let i = 0; i < 20; i++) P.Eczane.step(s, DT);
    check(!st.used, label + ': the dwell starts again from zero after a gap');
  }
  // full HP does not spend it; a partial need is healed to max, never past it
  {
    const s = started(seed, idx), st = stationOf(s), h = s.hero, t = touchPoint(st);
    h.x = t.x; h.y = t.y; h.hp = h.maxHp;
    for (let i = 0; i < 120; i++) P.Eczane.step(s, DT);
    check(!st.used && P.Eczane.state(s, st.b) === 'usable', label + ': a hero at full HP does not use the station');
    h.hp = h.maxHp - 10;
    for (let i = 0; i < 30; i++) P.Eczane.step(s, DT);
    check(st.used && h.hp === h.maxHp, label + ': a partial need is healed to max HP, never past it');
    check(stationEvents(s)[0].healed === 10, label + ': healed is the HP actually restored (10 of 30)');
  }
  // away from the station never uses it
  {
    const s = started(seed, idx), st = stationOf(s), h = s.hero;
    h.x = 0; h.y = st.b.y;
    for (let i = 0; i < 120; i++) P.Eczane.step(s, DT);
    check(!st.used && st.dwell === 0, label + ': a hero away from the station never uses it');
  }
  // outside the drop budget: the heal lands with the budget spent, and does not spend it
  {
    const s = started(seed, idx), st = stationOf(s), h = s.hero, t = touchPoint(st);
    s.dropHealed = P.CFG.drops.healCap;
    h.x = t.x; h.y = t.y; h.hp = h.maxHp - 30;
    for (let i = 0; i < 40; i++) P.Eczane.step(s, DT);
    check(st.used && h.hp === h.maxHp, label + ': the station heals with the drop budget spent');
    check(s.dropHealed === P.CFG.drops.healCap, label + ': the station does not count toward drops.healCap');
  }
  // the sim path (stepSim) runs the station each tick: a hurt hero who stands by it is healed within a second
  {
    const s = started(seed, idx), st = stationOf(s), h = s.hero, t = touchPoint(st);
    h.x = t.x; h.y = t.y; h.hp = h.maxHp - 40;
    // the P1 route crates (levels.pace.crateSeg) open a chest on a segment mark and pause the sim; the test teleports past the marks
    const crates = P.CFG.levels.pace.crateSeg; P.CFG.levels.pace.crateSeg = [];
    for (let i = 0; i < 60; i++) P.stepSim(s, DT, { x: 0, y: 0 });
    P.CFG.levels.pace.crateSeg = crates;
    check(st.used && stationEvents(s).length === 1, label + ': stepSim steps the station (one heal event)');
  }
  // determinism: the same seed gives the same run with the station in it
  {
    const a = mk(seed, idx), b = mk(seed, idx);
    P.startPlay(a); P.startPlay(b);
    a.enemies.length = 0; b.enemies.length = 0;
    for (let i = 0; i < 600; i++) { P.stepSim(a, DT, { x: 0, y: 1 }); P.stepSim(b, DT, { x: 0, y: 1 }); }
    check(a.hero.hp === b.hero.hp && a.hero.y === b.hero.y && a.eczane.list[0].used === b.eczane.list[0].used,
      label + ': the same seed gives the same run');
  }
}
rules('pharmacy', findStation('eczane'), 'eczane');
rules('kiosk', findStation('kiosk'), 'bufe');

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
  // Non-heal pickups keep their old event shape (no healed field, no station).
  const s = started(3, 3), h = s.hero;
  s.drops.push({ kind: 'jeton', value: 2, x: h.x, y: h.y, mag: false, pop: 0 });
  P.Combat.updateDrops(s, DT);
  const ev = s.events.filter(e => e.type === 'pickup')[0];
  check(ev && ev.kind === 'jeton' && ev.healed === undefined && ev.value === 2 && ev.station === undefined, 'drops: a jeton pickup keeps its event shape');
}

// ---------- 5. the sim's isolation ----------
{
  // The sim reads nothing from settings or the view. Lint on the comment-stripped source of the sim file.
  const src = fs.readFileSync(path.join(ROOT, 'js/sim/eczane.js'), 'utf8');
  const code = src.replace(/\/\/.*$/gm, '').replace(/'[^'\n]*'/g, "''");
  check(!/P\.Settings|quality|QualityProfile|P\.Consumables|P\.Props|P\.Hints|P\.Render|document\.|window\./.test(code), 'lint: js/sim/eczane.js reads no settings, quality or view');
  const dec = code.match(/\b\d+\.\d+|\b\d+e-\d+|0x[0-9a-fA-F]+/g) || [];
  check(dec.length === 0, 'lint: js/sim/eczane.js has no decimal or hex literal (numbers live in config-env.js): ' + dec.join(' '));
  const hack = fs.readFileSync(path.join(ROOT, 'js/sim/hack.js'), 'utf8');
  check(/if \(b\.station\) return;/.test(hack), 'hack.js: the signal box shortcut skips a station (either variant)');
}

console.log('heal station tests (eczane and kiosk): ' + passes + ' checks passed, ' + fails.length + ' failed');
fails.forEach(f => console.log('  FAIL ' + f));
process.exitCode = fails.length ? 1 : 0;
