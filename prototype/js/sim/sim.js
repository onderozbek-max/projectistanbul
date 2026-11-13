// Simulation state + fixed-step update. Pure logic: no DOM, no canvas, no settings (ARCH 4.17).
// Step order: hero -> skills -> director (L1 script or generated level) -> swarm -> weapons -> status
// -> enemy shots/telegraphs -> contact -> zones -> remove dead -> pickups -> flash timers.
// opts: { levelIndex = 1 (journey level 1..100), loadout = { gear:{maxHpPct,mightPct,movePct,pickupPct,
// cooldownPct}, startWeapon } }. levelIndex 1 is the scripted Istiklal level (unchanged behaviour).
P.createSim = function (seed, opts) {
  var C = P.CFG, L = C.level, o = opts || {}, idx = Math.max(1, Math.min(P.Journey.count(), o.levelIndex || 1));
  P.xpHand = idx === 1;   // R1-T4 part 4: L1 keeps its own XP curve (config xp.l1); the run's curve is read by P.xpNeed
  var s = {
    seed: seed, rng: P.makeStreams(seed), t: 0, runT: 0, mode: 'cutscene',
    hero: {
      x: L.heroStart.x, y: L.heroStart.y, hp: C.hero.maxHp, maxHp: C.hero.maxHp, fx: 0, fy: 1,
      moved: 0, invuln: 0, pickupRadius: C.hero.pickupRadius, weapons: { knife: 1 }, passives: {},
      cds: { knife: 0, nailgun: 0, canister: 0 }, moving: false, sinceHit: 99, chainA: 0, swingDir: 1,
      revving: 0, revAng: 0,
    },
    enemies: [], nextId: 1, drops: [], projs: [], nails: [], zones: [], events: [], enemyShots: [], enemyTele: [],
    props: P.World.createProps(),
    xp: 0, level: 1, pendingLevels: 0, cardPicks: 0, rerolls: C.cards.freeRerolls, levelUps: [],
    kills: 0, jeton: 0, xpPicked: 0, swings: 0, peakAlive: 0,
    reviveUsed: false, secondWindUsed: false, deathCause: null, dinersSpawned: false, pendingChests: 0, chestsOpened: 0,
    levelIndex: idx, levelInfo: P.Journey.level(idx), theme: null,
  };
  s.theme = s.levelInfo.hood.theme;
  s.fx = attrFx(o);
  s.perk = P.Perks ? P.Perks.set(o.loadout && o.loadout.perks) : {};   // Street Tree perks learned for this run (perks.js)
  s.pk = {};   // per-run perk state (counters, once-per-run flags); each perk uses its own key, e.g. s.pk.shock
  if (s.perk['cha.3']) s.rerolls += P.CFG.perks.regular.rerolls;   // Regular (cha.3): extra free card rerolls
  s.tally = P.Tally.create();
  s.loadout = o.loadout || null;
  P.Events.init(s);
  s.dir = P.Director.create();
  applyLoadout(s, o.loadout);
  if (idx > 1) {
    P.Levels.build(s, idx);
    if (P.Objectives) P.Objectives.attach(s);   // lane P: objective and run modifier (objectives.js)
    if (P.Env) P.Env.place(s, s.levelInfo);     // lane A: cover, canisters, cars, cables, doors (guarded; B may call it too)
  } else {
    L.diners.forEach(function (d, i) {
      var e = P.Combat.spawnEnemy(s, 'diner', d.x, d.y, { state: 'dormant' });
      e.dinerIndex = i;
    });
    s.dinersSpawned = true;
  }
  if (P.Modifiers && P.Modifiers.applyDaily) P.Modifiers.applyDaily(s);   // AUDIT-7 CR-1: daily modifiers (after the level build)
  if (P.Skills && P.Skills.init) P.Skills.init(s);
  return s;
};

// Meta gear and start weapon (meta workstream). Percent stats are stored as base fields the stat code reads:
// maxHp is multiplied here; might (Combat.might), move (stepHero), pickup (here), cooldown (baseCdr, read by E1).
// Gear and attribute effects add up (gear + s.fx). Attribute fractions for crit, knockback, coins, luck, XP,
// hack speed, help and damage taken are read from s.fx by their systems.
function applyLoadout(s, ld) {
  var h = s.hero, g = (ld && ld.gear) || {}, C = P.CFG, f = s.fx;
  h.gear = g;
  h.maxHp = C.hero.maxHp * (1 + (g.maxHpPct || 0) + f.maxHpPct + ((ld && ld.bondHpPct) || 0)); h.hp = h.maxHp;   // bondHpPct: Kaan bond 25 aura
  h.baseMight = (g.mightPct || 0) + f.mightPct; h.baseMove = (g.movePct || 0) + f.movePct;
  h.baseCdr = (g.cooldownPct || 0) + f.cooldownPct;
  h.pickupRadius = C.hero.pickupRadius * (1 + (g.pickupPct || 0) + f.pickupPct);
  var sw = ld && ld.startWeapon;
  if (sw && sw !== C.pool.signature && C.pool.weapons.indexOf(sw) >= 0) { h.weapons[sw] = 1; h.cds[sw] = 0; }
}

// Per-run tally (meta): attribute training (config-stats.js trainingFromTally) and street cred. Filled by combat, events, hack.
P.Tally = {};
P.Tally.create = function () {
  return { kills: 0, bySrc: {}, byType: {}, elites: 0, bosses: 0, crits: 0, ults: 0, maxStreak: 0, dashes: 0,
    nearMisses: 0, distance: 0, hacks: 0, rescues: 0, events: 0, dmgTaken: 0 };
};

// Attribute effects for this run (config-stats.js P.Stats.effects). Levels: opts.attrs or loadout.attrs.
// Zero-filled, so every s.fx field exists even without P.Stats (headless bot).
function attrFx(o) {
  var levels = o.attrs || (o.loadout && (o.loadout.stats || o.loadout.attrs)) || null, fx = {}, fields = (P.CFG.stats && P.CFG.stats.fields) || [], i;
  if (P.Stats && P.Stats.effects) fx = P.Stats.effects(levels);
  for (i = 0; i < fields.length; i++) if (fx[fields[i]] === undefined) fx[fields[i]] = 0;
  return fx;
}

// Hand control to the player at the end of the cold open (LD 4 S10, 7).
P.startPlay = function (s) {
  s.mode = 'play';
  s.enemies.forEach(function (e) {
    if (e.type !== 'diner') return;
    var d = P.CFG.level.diners[e.dinerIndex];
    if (d.delay > 0) { e.state = 'turning'; e.stateT = d.delay; } else e.state = 'active';
  });
  if (!s.geo) P.Director.prompt(s, 't_move', 'prompt.t_move');
  s.events.push({ type: 'controlStart' });
};

P.revive = function (s, kind) {
  var h = s.hero;
  if (P.Modifiers && P.Modifiers.reviveBlocked && P.Modifiers.reviveBlocked(s)) return;   // daily Iron: no revive at all
  h.hp = h.maxHp;
  h.invuln = P.CFG.hero.secondWindInvuln;
  s.mode = 'play';
  if (kind === 'secondWind') s.secondWindUsed = true; else s.reviveUsed = true;
  s.events.push({ type: 'revive', kind: kind });
};

function stepHero(s, dt, input) {
  var h = s.hero, mx = input ? input.x : 0, my = input ? input.y : 0, m = Math.hypot(mx, my);
  if (m > 1) { mx /= m; my /= m; m = 1; }
  h.moving = m > 0.08;
  if (h.moving) {
    var sp = P.Hero.speed(s) * (1 + (h.baseMove || 0)) * (P.Env ? P.Env.heroMul(s) : 1) * P.Enemies4.heroMul(s), ox = h.x, oy = h.y;
    h.fx = mx / m; h.fy = my / m;
    h.x += mx * sp * dt; h.y += my * sp * dt;
    P.World.clampHero(s, h);
    h.moved += Math.hypot(h.x - ox, h.y - oy);
  }
  h.invuln = Math.max(0, h.invuln - dt);
  h.sinceHit += dt;
  var mk = P.CFG.passives.medkit, lv = h.passives.medkit || 0, delay = s.perk['grit.2'] ? P.CFG.perks.teaBreak.delay : mk.regenDelay;   // Tea Break (grit.2)
  h.regenOn = lv > 0 && h.sinceHit >= delay && h.hp < h.maxHp;
  if (h.regenOn) h.hp = Math.min(h.maxHp, h.hp + lv * mk.regenPerLevel * dt);
}

P.stepSim = function (s, dt, input) {
  if (s.mode !== 'play' || s.pendingLevels > 0 || s.pendingChests > 0) return;
  s.t += dt; s.runT += dt;
  var m0 = s.hero.moved;
  stepHero(s, dt, input);
  if (P.Skills && P.Skills.step) P.Skills.step(s, dt, input);
  s.tally.distance += s.hero.moved - m0;
  P.Director.step(s, dt);
  if (s.mode !== 'play') return;
  P.Events.step(s, dt);
  P.Hack.step(s, dt);
  P.Combat.updateEnemies(s, dt);
  P.Weapons.step(s, dt);
  if (P.Env && s.env) P.Env.step(s, dt);   // lane A: after weapons, so this tick's molotov and canister events count
  if (P.Status && P.Status.step) P.Status.step(s, dt);
  P.Enemies.frame(s, dt);
  P.Combat.contact(s);
  P.Combat.updateBurnAndZones(s, dt);
  P.Combat.removeDead(s);
  P.Combat.updateDrops(s, dt);
  if (s.eczane) P.Eczane.step(s, dt);   // R1-T4 part 14: eczane stations (generated levels only)
  s.props.carts.forEach(function (c) { c.flash = Math.max(0, c.flash - dt); });
  s.props.canisters.forEach(function (c) { c.flash = Math.max(0, c.flash - dt); });
};

// Skill-side tallies (dash, near miss, ult, crit) are counted here so attribute training sees them.
var TALLY_EV = { dash: 'dashes', nearMiss: 'nearMisses', ult: 'ults' };
P.drainEvents = function (s) {
  var ev = s.events;
  if (s.tally) ev.forEach(function (e) { var k = TALLY_EV[e.type]; if (k) s.tally[k]++; });
  s.events = [];
  return ev;
};
