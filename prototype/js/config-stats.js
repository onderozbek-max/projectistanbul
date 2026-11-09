// Character attributes (v0.5, workstream C). PURE: no DOM. Also loaded by the headless bot.
// Six attributes per hero: str, pace, agg, int, cha, grit. Each runs 0..P.CFG.stats.max.
//  - LEARN BY DOING: each attribute has a training bar fed by playstyle (P.Stats.trainingFromTally).
//    A full bar makes that attribute READY: one point you may spend on that attribute only.
//  - STREET CRED (SC): lifetime kill milestones give SC points. SC can go to any attribute.
//  - EFFECTS: P.Stats.effects(levels) returns fractions for createSim (B applies the fields).
// Units: *Pct fields are fractions (0.30 = +30%). cooldownPct and dashCdPct are REDUCTIONS
// (0.20 = 20% shorter). critPct is an absolute crit chance added (0.02 = +2 points).
// Extra fields beyond the shared contract: xpPct (INT), dmgTakenPct (GRIT: incoming damage reduced).
var P = (typeof globalThis !== 'undefined' ? globalThis : window).P || {};
(typeof globalThis !== 'undefined' ? globalThis : window).P = P;

P.CFG = P.CFG || {};
P.CFG.stats = {
  ids: ['str', 'pace', 'agg', 'int', 'cha', 'grit'],
  max: 20,
  fields: ['maxHpPct', 'mightPct', 'movePct', 'cooldownPct', 'critPct', 'pickupPct', 'dashCdPct',
    'hackSpeedPct', 'civHelpPct', 'coinPct', 'luckPct', 'knockbackPct', 'xpPct', 'dmgTakenPct'],
  // Effect per attribute point. Total = perLevel * level. At L20 the primary is roughly +30..40%.
  perLevel: {
    str:  { mightPct: 0.015, knockbackPct: 0.02 },               // primary: might (+30% at L20)
    pace: { movePct: 0.015, dashCdPct: 0.01 },                   // primary: move speed (+30%)
    agg:  { cooldownPct: 0.015, critPct: 0.001 },                // primary: cooldowns (-30%)
    int:  { hackSpeedPct: 0.02, pickupPct: 0.01, xpPct: 0.005 }, // primary: hack speed (+40%)
    cha:  { civHelpPct: 0.02, coinPct: 0.015, luckPct: 0.01 },   // primary: civilian help (+40%)
    grit: { maxHpPct: 0.015, dmgTakenPct: 0.01 },                // primary: max HP (+30%)
  },
  primary: { str: 'mightPct', pace: 'movePct', agg: 'cooldownPct', int: 'hackSpeedPct', cha: 'civHelpPct', grit: 'maxHpPct' },
  // Weapon category for STR (melee kills) and general flavour. Unknown ids count as 'ranged'.
  category: {
    knife: 'melee', chain: 'melee', sledge: 'melee', cleaver: 'melee', cyclone: 'melee',
    nailgun: 'ranged', speargun: 'ranged', nailstorm: 'ranged',
    canister: 'gadget', molotov: 'gadget', fireworks: 'gadget', cable: 'gadget',
    extinguisher: 'gadget', cluster: 'gadget', finale: 'gadget',
  },
  // Training XP per unit of playstyle, read from the level tally. Typical level ~ one bar per stat.
  training: {
    str:  { melee: 0.35, elite: 3 },
    pace: { dash: 2.5, nearMiss: 1.0, meter: 0.1 },
    agg:  { streak: 0.15, crit: 1.0, ult: 12 },
    int:  { hack: 15 },
    cha:  { rescue: 15, event: 3 },
    grit: { dmgTaken: 0.12, boss: 30, survive: 20 },
  },
  // Training XP for the next READY point at effective level L (= attr + ready): round(base * (L+1)^exp).
  need: { base: 60, exp: 1.25 },
  // Street Cred milestone n is reached at lifetime kills round(base * n^exp). One SC per milestone.
  sc: { base: 450, exp: 1.35 },
};

P.Stats = P.Stats || {};

P.Stats.clampLevel = function (v) {
  var n = Math.floor(+v || 0), max = P.CFG.stats.max;
  return n < 0 ? 0 : (n > max ? max : n);
};

// Attribute levels -> total effect fractions. Every field is present (0 when unset).
P.Stats.effects = function (stats) {
  var C = P.CFG.stats, out = {}, i, f, s, lv, per;
  for (i = 0; i < C.fields.length; i++) out[C.fields[i]] = 0;
  for (i = 0; i < C.ids.length; i++) {
    s = C.ids[i];
    lv = P.Stats.clampLevel(stats ? stats[s] : 0);
    per = C.perLevel[s];
    for (f in per) out[f] = Math.round((out[f] + per[f] * lv) * 1e6) / 1e6;
  }
  return out;
};

// Fresh per-hero attribute progress (save schema v2 keeps one of these per hero).
P.Stats.newProgress = function () {
  var C = P.CFG.stats, p = { attr: {}, train: {}, ready: {}, sc: 0, kills: 0, milestones: 0 }, i, s;
  for (i = 0; i < C.ids.length; i++) {
    s = C.ids[i];
    p.attr[s] = 0; p.train[s] = 0; p.ready[s] = 0;
  }
  return p;
};

// Copy and sanitize a stored progress object (missing or bad fields become 0). Used by save migration.
P.Stats.normalize = function (raw) {
  var C = P.CFG.stats, p = P.Stats.newProgress(), i, s, r = raw || {};
  for (i = 0; i < C.ids.length; i++) {
    s = C.ids[i];
    p.attr[s] = P.Stats.clampLevel(r.attr && r.attr[s]);
    p.ready[s] = Math.max(0, Math.floor(+(r.ready && r.ready[s]) || 0));
    p.train[s] = Math.max(0, +(r.train && r.train[s]) || 0);
  }
  p.sc = Math.max(0, Math.floor(+r.sc || 0));
  p.kills = Math.max(0, Math.floor(+r.kills || 0));
  p.milestones = P.Stats.scAt(p.kills);
  return p;
};

// Effective level = attribute level + ready points (ready points are not yet spent).
P.Stats.effLevel = function (prog, s) {
  return P.Stats.clampLevel(prog.attr[s]) + Math.max(0, prog.ready[s] | 0);
};

// Training XP needed for the next READY point on attribute s.
P.Stats.need = function (prog, s) {
  var c = P.CFG.stats.need;
  return Math.round(c.base * Math.pow(P.Stats.effLevel(prog, s) + 1, c.exp));
};

// Lifetime kills needed to reach SC milestone n.
P.Stats.scKills = function (n) {
  var c = P.CFG.stats.sc;
  return Math.round(c.base * Math.pow(n, c.exp));
};

// Number of SC milestones reached at a lifetime kill count.
P.Stats.scAt = function (kills) {
  var k = Math.max(0, Math.floor(+kills || 0)), c = P.CFG.stats.sc,
    n = Math.max(0, Math.floor(Math.pow(k / c.base, 1 / c.exp)));
  while (P.Stats.scKills(n + 1) <= k) n++;
  while (n > 0 && P.Stats.scKills(n) > k) n--;
  return n;
};

// Weapon category of a kill source. Uses A's P.Mastery.srcToWeapon when present. Returns null for non-weapon srcs.
P.Stats.categoryOf = function (src) {
  var id = String(src || '').replace(/^w:/, ''), mapped = id;
  if (P.Mastery && typeof P.Mastery.srcToWeapon === 'function') {
    mapped = P.Mastery.srcToWeapon(src);
    if (!mapped) return null;
  }
  return P.CFG.stats.category[mapped] || 'ranged';
};

// Kill counts per category from tally.bySrc: { melee, ranged, gadget }.
P.Stats.killsByCategory = function (bySrc) {
  var out = { melee: 0, ranged: 0, gadget: 0 }, k, cat;
  for (k in (bySrc || {})) {
    cat = P.Stats.categoryOf(k);
    if (cat && out[cat] !== undefined) out[cat] += +bySrc[k] || 0;
  }
  return out;
};

// Playstyle -> training XP per attribute, from one level tally. Pure.
P.Stats.trainingFromTally = function (t, won) {
  var W = P.CFG.stats.training, cat, r = function (v) { return Math.round(v * 10) / 10; }, xp;
  t = t || {};
  cat = P.Stats.killsByCategory(t.bySrc);
  xp = {
    str: cat.melee * W.str.melee + (t.elites | 0) * W.str.elite,
    pace: (t.dashes | 0) * W.pace.dash + (t.nearMisses | 0) * W.pace.nearMiss + (+t.distance || 0) * W.pace.meter,
    agg: (t.maxStreak | 0) * W.agg.streak + (t.crits | 0) * W.agg.crit + (t.ults | 0) * W.agg.ult,
    int: (t.hacks | 0) * W.int.hack,
    cha: (t.rescues | 0) * W.cha.rescue + (t.events | 0) * W.cha.event,
    grit: (+t.dmgTaken || 0) * W.grit.dmgTaken + (t.bosses | 0) * W.grit.boss + (won ? W.grit.survive : 0),
  };
  for (var s in xp) xp[s] = r(xp[s]);
  return xp;
};

// Adds one level's tally to a progress object. Returns { prog, gains } and never mutates the input.
// gains: { xp:{s:n}, ready:{s:n} (points that became READY), sc:n (new SC), kills:n }.
P.Stats.applyLevel = function (prog, tally, won) {
  var C = P.CFG.stats, p = P.Stats.normalize(prog), xp = P.Stats.trainingFromTally(tally, won),
    gains = { xp: xp, ready: {}, sc: 0, kills: (tally && tally.kills | 0) || 0 }, i, s, n, k0;
  for (i = 0; i < C.ids.length; i++) {
    s = C.ids[i];
    gains.ready[s] = 0;
    p.train[s] += xp[s];
    n = P.Stats.need(p, s);
    while (p.train[s] >= n && P.Stats.effLevel(p, s) < C.max) {
      p.train[s] -= n;
      p.ready[s]++;
      gains.ready[s]++;
      n = P.Stats.need(p, s);
    }
    if (P.Stats.effLevel(p, s) >= C.max) p.train[s] = Math.min(p.train[s], n);
    p.train[s] = Math.round(p.train[s] * 10) / 10;
  }
  k0 = p.kills;
  p.kills += gains.kills;
  gains.sc = P.Stats.scAt(p.kills) - P.Stats.scAt(k0);
  p.sc += gains.sc;
  p.milestones = P.Stats.scAt(p.kills);
  return { prog: p, gains: gains };
};

// Spend a draft allocation { str: n, ... }. READY points on an attribute go first, the rest use SC.
// Returns the new progress object, or null when the draft is not affordable or would exceed max.
P.Stats.allocate = function (prog, draft) {
  var C = P.CFG.stats, p = P.Stats.normalize(prog), i, s, n, fromReady, fromSC;
  for (i = 0; i < C.ids.length; i++) {
    s = C.ids[i];
    n = Math.max(0, Math.floor(+(draft && draft[s]) || 0));
    if (!n) continue;
    fromReady = Math.min(n, p.ready[s]);
    fromSC = n - fromReady;
    if (fromSC > p.sc) return null;
    if (p.attr[s] + n > C.max) return null;
    p.ready[s] -= fromReady;
    p.sc -= fromSC;
    p.attr[s] += n;
  }
  return p;
};

// Street Cred a draft would consume (draft points beyond each attribute's READY count).
P.Stats.scNeeded = function (prog, draft) {
  var C = P.CFG.stats, total = 0, i, s, n;
  for (i = 0; i < C.ids.length; i++) {
    s = C.ids[i];
    n = Math.max(0, Math.floor(+(draft && draft[s]) || 0));
    total += Math.max(0, n - (prog.ready[s] | 0));
  }
  return total;
};

// Points that can be spent right now on any attribute (ready on all + SC).
P.Stats.spendable = function (prog) {
  var C = P.CFG.stats, total = prog.sc | 0, i;
  for (i = 0; i < C.ids.length; i++) total += prog.ready[C.ids[i]] | 0;
  return total;
};
