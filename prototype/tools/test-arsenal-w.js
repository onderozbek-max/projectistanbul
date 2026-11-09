// W lane tests (AUDIT-6 W1-W3 and the depth pass): terrain evolutions, the four depth evolutions, the two active skills,
// the joystick flick guard and handedness, and the synergy tag contract. Split out of test-arsenal.js for the line limit.
// Loaded by test-arsenal.js with its helpers: module.exports = function (h) -> { terrainUnits, depthUnits, skillUnits, inputUnits, tagUnits }.
'use strict';
module.exports = function (h) {
  const { P, newSim, step, feed, check, notes, DT, ALL_W, ALL_W_L5, ALL_PASS, modPaths } = h;
// ---------- W lane (AUDIT-6 W1-W3 and the depth pass): terrain evolutions, depth evolutions, skills, input ----------
// Terrain evolutions: offered only after the base weapon hit that terrain this run, and only from journey level 8.
function terrainUnits() {
  const t = newSim(201, 7);
  P.Progression.debugGrant(t, { weapons: { molotov: 5 }, passives: {} });
  check(P.Progression.evolutionFor(t) === null, 'fireball offered before gas was hit');
  const hint0 = P.Weapons.evoHint('molotov', t);
  P.Weapons.state(t).seen = { 'molotov:gas': true };
  check(P.Progression.evolutionFor(t) === null, 'fireball offered below journey level 8');
  t.levelIndex = 8;
  const off = P.Progression.evolutionFor(t);
  check(off && off.item === 'fireball' && off.evo === 'molotov', 'fireball not offered at L8 after gas');
  const hint1 = P.Weapons.evoHint('molotov', t);
  check(typeof hint0 === 'string' && typeof hint1 === 'string' && hint0 !== hint1, 'evoHint did not change after the terrain was hit');

  // Carbomb: a parked car (Lane A record) or a gas can counts as terrain for the canister landing.
  const c = newSim(203, 8);
  P.Progression.debugGrant(c, { weapons: { canister: 5 }, passives: {} });
  if (c.env && c.env.recs) c.env.recs.push({ kind: 'car', x: 2, y: 0, r: 1, alive: true, bomb: false, fuseT: 0, fuseMax: 0, hp: 1, max: 1, flash: 0 });
  check(P.Weapons6.terrainAt(c, 2, 0).indexOf('car') >= 0, 'terrainAt did not see a parked car');
  check(P.Progression.evolutionFor(c) === null, 'carbomb offered before a car was hit');
  P.Weapons6.terrainHit(c, 'canister', 'gas', 2, 0);
  c.levelIndex = 8;
  check(P.Progression.evolutionFor(c) && P.Progression.evolutionFor(c).item === 'carbomb', 'carbomb not offered after the car was hit');

  // Base chain on wet ground records the terrain (the arcchain unlock must not depend on owning arcchain already).
  const w = newSim(204, 8);
  P.Progression.debugGrant(w, { weapons: { chain: 5 }, passives: {} });
  if (w.env && w.env.zones) w.env.zones.push({ kind: 'puddle', x: w.hero.x, y: w.hero.y, r: 8, arcT: 0, t: 99, T: 99 });
  feed(w, 40);
  for (let i = 0; i < 120; i++) step(w, { x: 0, y: 0 });
  check(!!(P.Weapons.state(w).seen && P.Weapons.state(w).seen['chain:wet']), 'base chain on wet ground did not record wet');

  // Seeded firing: each terrain evolution runs its own code and tags its wfire.
  [['fireball', 'molotov', 'fire'], ['arcchain', 'chain', 'electric'], ['carbomb', 'canister', 'gas']].forEach(([id, base, tag]) => {
    const f = newSim(206, 11);
    P.Progression.debugGrant(f, { weapons: { [id]: 1 }, passives: {} });
    f.enemies = []; feed(f, 40);
    if (f.env && f.env.zones) f.env.zones.push({ kind: 'puddle', x: f.hero.x, y: f.hero.y, r: 8, arcT: 0, t: 99, T: 99 });
    const ev = [];
    for (let i = 0; i < 300; i++) ev.push(...step(f, { x: 0, y: 0 }));
    check(ev.some(e => e.type === 'wfire' && e.variant === id && e.tag === tag), id + ' never fired a tagged wfire');
    check(ev.some(e => e.type === 'wfire' && e.w === base), id + ' wfire does not name base ' + base);
  });
  const arc = newSim(207, 11);
  P.Progression.debugGrant(arc, { weapons: { arcchain: 1 }, passives: {} });
  arc.enemies = []; feed(arc, 40);
  if (arc.env && arc.env.zones) arc.env.zones.push({ kind: 'puddle', x: arc.hero.x, y: arc.hero.y, r: 8, arcT: 0, t: 99, T: 99 });
  let arcs = 0;
  for (let i = 0; i < 300; i++) arcs += step(arc, { x: 0, y: 0 }).filter(e => e.type === 'arcZap' && e.tag === 'electric').length;
  check(arcs > 0, 'arcchain never arced');
}

// Depth evolutions: the four new ones (forge, grinder, hookpull, minibus) fire their own mechanic.
function depthUnits() {
  const fo = newSim(211, 11);
  P.Progression.debugGrant(fo, { weapons: { torch: 5, forge: 1 }, passives: {} });
  check(P.Weapons.evoHint('torch', fo) === null, 'evoHint still offers forge after it was owned');
  fo.enemies = []; P.Combat.spawnEnemy(fo, 'walker', fo.hero.x + 1.5, fo.hero.y, { state: 'active' }).hp = 1e6;
  const fe = [];
  for (let i = 0; i < 240; i++) fe.push(...step(fo, { x: 0, y: 0 }));
  check(fe.some(e => e.type === 'wfire' && e.variant === 'forge' && e.tag === 'fire'), 'forge never fired a tagged wfire');
  check(fe.some(e => e.type === 'forgeStain' && e.n === 1), 'forge did not lay its second scorch');

  const gr = newSim(212, 11);
  P.Progression.debugGrant(gr, { weapons: { chainsaw: 5, grinder: 1 }, passives: {} });
  gr.enemies = []; P.Combat.spawnEnemy(gr, 'walker', gr.hero.x + 1.0, gr.hero.y, { state: 'active' }).hp = 1e6;
  const ge = [];
  for (let i = 0; i < 300; i++) ge.push(...step(gr, { x: 0, y: 0 }));
  check(ge.some(e => e.type === 'sawRev' && e.variant === 'grinder'), 'grinder never revved');
  check(ge.some(e => e.type === 'grinderStack' && e.n >= 1 && e.tag === 'blade'), 'grinder built no grind stacks');
  // Stall: a rev that hits nothing stalls the base saw and not the grinder.
  [['chainsaw', true], ['grinder', false]].forEach(([id, stall]) => {
    const q = newSim(213, 11);
    P.Progression.debugGrant(q, { weapons: id === 'grinder' ? { chainsaw: 5, grinder: 1 } : { chainsaw: 5 }, passives: {} });
    q.enemies = []; P.Combat.spawnEnemy(q, 'walker', q.hero.x + 1.0, q.hero.y, { state: 'active' }).hp = 1e6;
    for (let i = 0; i < 120 && !P.Weapons.state(q).rev; i++) step(q, { x: 0, y: 0 });   // wait for the first rev
    if (!P.Weapons.state(q).rev) { check(false, id + ' never started a rev'); return; }
    q.enemies = []; P.Weapons.state(q).rev.hits = 0;             // from here on it hits nothing
    let end = null;
    for (let i = 0; i < 200 && !end; i++) end = step(q, { x: 0, y: 0 }).find(e => e.type === 'sawStall') || null;
    check(end && end.stalled === stall, id + ' stall flag wrong (want ' + stall + ')');
  });

  const hk = newSim(214, 11);
  P.Progression.debugGrant(hk, { weapons: { olta: 5, hookpull: 1 }, passives: {} });
  hk.enemies = [];
  P.Combat.spawnEnemy(hk, 'walker', hk.hero.x + 2.0, hk.hero.y, { state: 'active' }).hp = 1e6;
  P.Combat.spawnEnemy(hk, 'walker', hk.hero.x + 2.6, hk.hero.y + 0.4, { state: 'active' }).hp = 1e6;
  P.Combat.spawnEnemy(hk, 'walker', hk.hero.x + 3.4, hk.hero.y, { state: 'active' }).hp = 1e6;
  const he = [];
  for (let i = 0; i < 240; i++) he.push(...step(hk, { x: 0, y: 0 }));
  check(he.some(e => e.type === 'oltaSet'), 'hookpull hook never set');
  check(he.some(e => e.type === 'oltaHaul' && e.n >= 1 && e.tag === 'blade'), 'hookpull hauled nobody');

  const mb = newSim(215, 11);
  P.Progression.debugGrant(mb, { weapons: { cardoor: 5, minibus: 1 }, passives: {} });
  // A ring of walkers 1 m out: the door shoves the ones it presses, the rest stay in reach when it comes down.
  mb.enemies = [];
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4;
    P.Combat.spawnEnemy(mb, 'walker', mb.hero.x + Math.cos(a), mb.hero.y + Math.sin(a), { state: 'active' }).hp = 1e6;
  }
  const me = [];
  for (let i = 0; i < 200; i++) me.push(...step(mb, { x: 0, y: 0 }));
  check(me.some(e => e.type === 'doorDrop'), 'minibus door never dropped');
  check(me.some(e => e.type === 'doorSlam' && e.n >= 1 && e.tag === 'blunt'), 'minibus slam hit nothing');
}

// Synergy tags: every wfire and area-damage event carries a tag from P.CFG.tagNames (Lane A reads them).
const TAGGED = ['wfire', 'swing', 'nailFire', 'canisterThrow', 'blast', 'clusterSplit', 'sledgeSlam', 'flaskShatter', 'poolBurn',
  'rocketBurst', 'sparkBurst', 'manholeBounce', 'scorchSizzle', 'torchJet', 'forgeStain', 'oltaCast', 'oltaSet', 'oltaSlam',
  'oltaHaul', 'doorShove', 'doorSlam', 'cableArc', 'cableZap', 'extSpray', 'extTick', 'cleaverChop', 'cyclone', 'spearHit',
  'sawCatch', 'sawRev', 'sawGrind', 'sawStall', 'grinderStack', 'stormZap', 'netLink', 'lakeMerge', 'arcZap', 'areaHit', 'marbleHit'];
function tagUnits() {
  const s = newSim(216, 11);
  P.Progression.debugGrant(s, { weapons: ALL_W_L5, passives: ALL_PASS, mods: MODS_L3A_ANY() });
  feed(s, 60);
  const seen = {};
  for (let i = 0; i < 600; i++) step(s, { x: Math.sin(i / 40), y: Math.cos(i / 53) * 0.6, dash: i % 200 === 0 }).forEach(e => {
    if (!TAGGED.includes(e.type)) return;
    seen[e.type] = true;
    if (P.CFG.tagNames.indexOf(e.tag) < 0) check(false, 'event ' + e.type + ' has no synergy tag (got ' + e.tag + ')');
  });
  notes.push('tagged event types seen: ' + Object.keys(seen).length + ' of ' + TAGGED.length);
}
function MODS_L3A_ANY() { return Object.fromEntries(ALL_W.map(f => [f, modPaths(f)[0]])); }

// Active skills (W2): the skill key (E) and the button start the one loadout skill; the cooldown runs on the HUD.
function skillUnits() {
  const k = newSim(221, 11);
  P.Skills.step(k, DT, { x: 0, y: 0, skill: true });
  check(P.Skills.shieldUp(k), 'shield did not start on the skill input');
  const hp0 = k.hero.hp;
  P.Combat.damageHero(k, 10, 'walker');
  check(k.hero.hp === hp0, 'shield did not absorb the hit');
  check(!P.Skills.shieldUp(k), 'shield still up after its one absorb');
  P.Skills.step(k, DT, { x: 0, y: 0, skill: true });
  check(!P.Skills.shieldUp(k) && P.Skills.hud(k).active.ready === false, 'shield re-armed inside its cooldown');
  for (let i = 0; i < 1500; i++) P.Skills.step(k, DT, { x: 0, y: 0 });
  check(P.Skills.hud(k).active.ready === true, 'shield cooldown never ended');

  const t = newSim(222, 11, { active: 'tea' });
  check(P.Skills.activeId(t) === 'tea', 'loadout active skill not read');
  t.hero.hp = t.hero.maxHp * 0.5;
  const hp1 = t.hero.hp, e = P.Combat.spawnEnemy(t, 'walker', t.hero.x + 1.5, t.hero.y, { state: 'active' });
  P.Skills.step(t, DT, { x: 0, y: 0, skill: true });
  for (let i = 0; i < 240; i++) P.Skills.step(t, DT, { x: 0, y: 0 });
  check(t.hero.hp >= hp1 + t.hero.maxHp * 0.2, 'tea break did not heal');
  check(P.Status.speedMul(e) < 1 || e.dead, 'tea break did not slow an enemy within 3 m');

  // The keyboard and the button share one request; Q stays the ultimate.
  P.Input.enabled = true; P.Input.reset();
  P.Input.requestSkill();
  check(P.Input.get().skill === true && P.Input.get().skill === false, 'skill request is not one-shot');
}

// Flick guard and handedness (W3). Scripted pointer events with a scripted clock and a stub joystick element.
function inputUnits() {
  const joy = { style: {}, classList: { add() {}, remove() {} }, firstElementChild: { style: {} } };
  const phone = { l: {}, addEventListener(type, fn) { this.l[type] = fn; }, setPointerCapture() {} };
  const win = {};
  const hadWin = globalThis.window, hadDoc = globalThis.document, hadSet = P.Settings;
  globalThis.window = { addEventListener(type, fn) { win[type] = fn; } };
  globalThis.document = { getElementById: () => joy };
  let clock = 0;
  P.Input.now = () => clock;
  P.Input.init(phone, e => ({ x: e.clientX, y: e.clientY }));
  P.Input.enabled = true; P.Input.reset(); P.Settings = {};
  const down = (x, y) => phone.l.pointerdown({ pointerId: 1, clientX: x, clientY: y, target: { closest: () => null } });
  const move = (x, y) => phone.l.pointermove({ pointerId: 1, clientX: x, clientY: y });
  const up = () => phone.l.pointerup({ pointerId: 1, clientX: 0, clientY: 0 });
  const dashed = () => P.Input.get().dash;
  for (let n = 0; n < 10; n++) {                                  // deliberate swipes: 60 px in 100 ms from the stick base
    clock += 1000; down(200, 700); clock += 50; move(230, 700); clock += 50; move(260, 700);
    check(dashed() === true, 'deliberate swipe ' + n + ' did not dash');
    up();
  }
  for (let n = 0; n < 10; n++) {                                  // steering: the stick is held off-centre, then flicked
    clock += 1000; down(200, 700); clock += 50; move(225, 700); clock += 250; move(230, 700); clock += 150; move(300, 700);
    check(dashed() === false, 'steering motion ' + n + ' dashed');
    up();
  }
  clock += 1000; down(200, 700); up(); clock += 150; down(205, 705);   // double-tap still dashes
  check(dashed() === true, 'double-tap did not dash');
  up();
  P.Settings.joySide = 'left';                                    // handedness: a left stick ignores the right half
  clock += 1000; down(350, 700); move(350, 690);                  // short moves: a long one would be a flick, which is legal anywhere
  check(P.Input.get().y === 0, 'left-hand setting let a stick start on the right');
  up(); clock += 1000; down(100, 700); move(100, 690);
  check(P.Input.get().y > 0, 'left-hand stick did not start on the left');
  up();
  P.Input.enabled = false; P.Input.reset(); P.Settings = hadSet;
  if (hadWin === undefined) delete globalThis.window; else globalThis.window = hadWin;
  if (hadDoc === undefined) delete globalThis.document; else globalThis.document = hadDoc;
  P.Input.now = () => performance.now();
}


  return { terrainUnits, depthUnits, skillUnits, inputUnits, tagUnits };
};
