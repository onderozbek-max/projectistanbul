// XP, run levels, level-up card offers, weapon mod forks, evolutions and chests (GD 4.5, 5.3-5.7; mirrors
// game/core/card_offer.gd). Unlocks: P.CFG.unlock (journey level index). Evolutions: P.CFG.evolutions.
// Forks (v0.5): an upgrade to L3 or L5 of a weapon carries card.fork ('L3'|'L5'), card.mods (2 mod ids, plus
// 'usta' at mastery rank 3+) and card.pick (default 0, set by the UI). choose() stores the pick in hero.mods[fam].
P.Hero = {};
P.Hero.speed = function (s) {
  return P.CFG.hero.speed * (1 + (s.hero.passives.shoes || 0) * P.CFG.passives.shoes.movePct) * (s.mod ? s.mod.moveMul : 1);
};

P.Progression = {};

// Level-up heal + douse (kolonya): fire near Arda goes out.
P.Progression.levelHeal = function (s) {
  var h = s.hero, lv = h.passives.kolonya || 0, K = P.CFG.passives.kolonya;
  if (!lv) return;
  var heal = K.healBase + lv * K.healPerLevel;
  h.hp = Math.min(h.maxHp, h.hp + heal);
  P.Mods.douse(s, h.x, h.y, K.radius);
  s.events.push({ type: 'kolonya', x: h.x, y: h.y, r: K.radius, heal: heal });
};

// Crowd cost (config xp.crowd, AUDIT-7 G-1): gem XP is divided by 1 + mul x alive / ref, so a horde adds threat, not picks.
// The number of level-ups per route level then stays near the pre-horde count at any hood (see tools/bot.js lvl-ups).
P.Progression.crowdCost = function (s) {
  var C = P.CFG.xp.crowd;
  return 1 + C.mul * s.enemies.length / C.ref;
};

P.Progression.addXp = function (s, v) {
  s.xp += v * (1 + (s.hero.passives.lokum || 0) * P.CFG.passives.lokum.xpPerLevel) / P.Progression.crowdCost(s);
  while (s.xp >= P.xpNeed(s.level)) {
    s.xp -= P.xpNeed(s.level);
    s.level++;
    s.pendingLevels++;
    s.levelUps.push(s.runT);
    s.events.push({ type: 'levelup', level: s.level });
    P.Progression.levelHeal(s);
    P.Progression.shock(s);
  }
};

function isWeapon(id) {
  return P.CFG.arsenal.weapons.indexOf(id) >= 0 || !!(P.CFG.weapons[id] && P.CFG.weapons[id].evo);
}
P.Progression.isWeapon = isWeapon;

// Debug (?arsenal=1) unlocks everything; otherwise an item enters the pool at its unlock level.
P.Progression.unlocked = function (s, kind, id) {
  if (P.CFG.debugAllWeapons) return true;
  return (P.CFG.unlock[kind][id] || 1) <= (s.levelIndex || 1);
};

// Evolution eligible for a chest: base weapon at max level + paired passive owned. Oldest-owned first.
P.Progression.evolutionFor = function (s) {
  var h = s.hero, max = P.CFG.maxItemLevel, evo = h.evolved || {}, owned = Object.keys(h.weapons);
  for (var i = 0; i < owned.length; i++) {
    var base = owned[i];
    if ((h.weapons[base] || 0) < max || evo[base]) continue;
    for (var id in P.CFG.evolutions) {
      var E = P.CFG.evolutions[id];
      if (E.from !== base || h.weapons[id] || !(h.passives[E.passive] > 0)) continue;
      return { id: 'w:' + id, item: id, next: max, evo: base, w: 0 };
    }
  }
  return null;
};

// ---------- mod forks ----------
function branchOf(picks) {
  var d = picks[0] && P.CFG.modDefs[picks[0]];
  return d ? d.branch : 'U';
}

// Options for an upgrade to level `next`: L3 offers A/B; L5 offers the pair under the first pick (U when the
// first pick was usta or none). Mastery rank 3+ adds 'usta' (every 4th action doubled) until it is taken.
function forkOptions(s, fam, next) {
  var C = P.CFG, picks = (s.hero.mods || {})[fam] || [], opts;
  opts = next === 3 ? C.mods[fam].L3.slice() : C.mods[fam].L5[branchOf(picks)].slice();
  if (P.Mastery.runRank(s, fam) >= C.mastery.thirdOptionRank && picks.indexOf('usta') < 0) opts.push('usta');
  return opts;
}

P.Progression.upgradeCard = function (s, id, next, w) {
  var card = { id: 'w:' + id, item: id, next: next, w: w || 0 };
  if (next === 3 || next === 5) {
    card.fork = next === 3 ? 'L3' : 'L5';
    card.mods = forkOptions(s, id, next);
    card.pick = 0;
  }
  return card;
};

// Store the picked mod (card.pick indexes card.mods) for the family.
P.Progression.pickMod = function (s, card) {
  var h = s.hero, id = (card.mods || [])[card.pick || 0];
  if (!id) return;
  h.mods = h.mods || {};
  h.mods[card.item] = (h.mods[card.item] || []).concat([id]);
  s.events.push({ type: 'modChosen', weapon: card.item, mod: id, level: card.next, fork: card.fork });
};

P.Progression.candidates = function (s) {
  var C = P.CFG, h = s.hero, out = [], max = C.maxItemLevel, c = C.cards, evo = h.evolved || {};
  var wCount = Object.keys(h.weapons).length, pCount = Object.keys(h.passives).length;
  C.arsenal.weapons.forEach(function (id) {
    if (evo[id] || !P.Progression.unlocked(s, 'weapons', id)) return;
    var lv = h.weapons[id] || 0;
    var road = lv + 1 <= 3 ? C.forkRoadBoost : 1;
    if (lv > 0 && lv < max) out.push(P.Progression.upgradeCard(s, id, lv + 1, c.wUpgradeWeapon * road));
    else if (lv === 0 && id !== C.pool.signature && wCount < c.slotsWeapon) out.push(P.Progression.upgradeCard(s, id, 1, c.wNewWeapon));
  });
  C.arsenal.passives.forEach(function (id) {
    if (!P.Progression.unlocked(s, 'passives', id)) return;
    var lv = h.passives[id] || 0;
    if (lv > 0 && lv < max) out.push({ id: 'p:' + id, item: id, next: lv + 1, w: c.wUpgradePassive });
    else if (lv === 0 && pCount < c.slotsPassive) out.push({ id: 'p:' + id, item: id, next: 1, w: c.wNewPassive });
  });
  return out;
};

// The scripted L1 trio (config scriptedFirstCard) is the first offer of a fresh level 1 only (AUDIT-6 P1). The loadout
// (P.Meta.loadout) says whether L1 was cleared. Without a loadout (headless bot) L1 counts as fresh.
P.Progression.scriptedFirst = function (s) {
  return s.levelIndex === 1 && !(s.loadout && s.loadout.l1Cleared);
};

// Every other first offer opens with the starter weapon's upgrade, then weighted picks, so it varies by seed and level.
P.Progression.makeOffer = function (s) {
  var C = P.CFG, rng = s.rng.cards, picks = [], pool = P.Progression.candidates(s), start, i;
  if (s.cardPicks === 0 && P.Progression.scriptedFirst(s)) {
    picks = C.scriptedFirstCard.map(function (id) { return P.Progression.cardFor(s, id); });
    return { cards: picks, scripted: true };
  }
  if (s.cardPicks === 0) {
    start = 'w:' + ((s.loadout && s.loadout.startWeapon) || C.pool.signature);
    for (i = 0; i < pool.length; i++) if (pool[i].id === start) { picks.push(pool.splice(i, 1)[0]); break; }
  }
  while (picks.length < C.cards.count && pool.length) {
    var total = pool.reduce(function (a, b) { return a + b.w; }, 0), r = rng.next() * total, i = 0;
    while (r >= pool[i].w) { r -= pool[i].w; i++; }
    picks.push(pool.splice(i, 1)[0]);
  }
  var filler = 0;
  while (picks.length < C.cards.count) {
    picks.push(filler % 2 === 0 ? { id: 'f:simit', item: 'simit', next: 0 } : { id: 'f:jeton', item: 'jeton', next: 0 });
    filler++;
  }
  return { cards: picks, scripted: false };
};

P.Progression.cardFor = function (s, id) {
  var parts = id.split(':'), item = parts[1];
  if (parts[0] === 'f') return { id: id, item: item, next: 0 };
  var max = P.CFG.maxItemLevel;
  if (parts[0] === 'w') return P.Progression.upgradeCard(s, item, Math.min(max, (s.hero.weapons[item] || 0) + 1));
  return { id: id, item: item, next: Math.min(max, (s.hero.passives[item] || 0) + 1) };
};

// Weapon swap: the evolved weapon takes the base weapon's slot (the base is removed).
P.Progression.evolve = function (s, card) {
  var h = s.hero;
  delete h.weapons[card.evo];
  h.weapons[card.item] = 1;
  h.evolved = h.evolved || {};
  h.evolved[card.evo] = card.item;
  P.Weapons.onAcquire(s, card.item);
  s.events.push({ type: 'evolve', from: card.evo, to: card.item, T: P.CFG.evoCutsceneT });
};

P.Progression.choose = function (s, card) {
  var h = s.hero, parts = card.id.split(':'), pc = P.CFG.passives;
  if (card.evo) P.Progression.evolve(s, card);
  else if (parts[0] === 'w') {
    h.weapons[card.item] = card.next;
    if (card.next === 1) P.Weapons.onAcquire(s, card.item);
    if (card.fork) P.Progression.pickMod(s, card);
  }
  else if (parts[0] === 'p') {
    h.passives[card.item] = card.next;
    if (card.item === 'medkit') h.hp = Math.min(h.maxHp, h.hp + pc.medkit.healOnPick);
    if (card.item === 'jacket' && card.next >= 4) { h.maxHp += pc.jacket.hpFromLevel4; h.hp += pc.jacket.hpFromLevel4; }
  }
  else if (card.item === 'simit') h.hp = Math.min(h.maxHp, h.hp + P.CFG.cards.fillerSimitHeal);
  else s.jeton += P.CFG.cards.fillerJeton;
  s.cardPicks++;
  s.pendingLevels--;
  s.events.push({ type: 'cardChosen', id: card.id, item: card.item, level: card.next, evo: card.evo || null });
};

// ---------- card text: stat rows built from config (C.weapons[id].stats) ----------
var pct = function (v) { return Math.round(v * 100) + '%'; };

function fmtVal(kind, v, ref) {
  switch (kind) {
    case 'm': return v + ' m';
    case 's': return v + ' s';
    case 'ms': return v + ' m/s';
    case 'deg': return v + '°';
    case 'pct': return pct(v);
    case 'bool': return v ? '✓' : '–';
    case 'rate': return '×' + (ref / v).toFixed(1);
    case 'ratio': return '×' + (v / ref).toFixed(1);
  }
  return String(v);
}

function weaponStats(card) {
  var cfg = P.CFG.weapons[card.item], L = cfg.levels, n = card.next, out = [];
  var a = (n > 1 && !card.evo) ? L[Math.min(n, L.length) - 2] : null, b = card.evo ? L[0] : L[Math.min(n, L.length) - 1];
  cfg.stats.forEach(function (st) {
    var key = st[1], fmt = st[2], ref = L[0][key], va = a ? a[key] : null, vb = b[key];
    if (a && va === vb) return;
    if (!a && ((fmt === 'bool' && !vb) || (fmt === 'rate' && vb === 1))) return;
    out.push({ k: st[0], a: a ? fmtVal(fmt, va, ref) : null, b: fmtVal(fmt, vb, ref) });
  });
  return out.slice(0, 3);
}

function passiveStats(item, lv) {
  var pc = P.CFG.passives;
  if (lv === 0) return [];
  switch (item) {
    case 'shoes': return [['stat.speed', '+' + pct(lv * pc.shoes.movePct)]];
    case 'jacket': return [['stat.armor', '-' + Math.min(pc.jacket.armorCap, lv * pc.jacket.armorPerLevel)], ['stat.maxHp', '+' + Math.max(0, lv - 3) * pc.jacket.hpFromLevel4]];
    case 'gloves': return [['stat.dmg', '+' + pct(lv * pc.gloves.might)], ['stat.kb', '+' + pct(lv * pc.gloves.knockbackPct)]];
    case 'energy': return [['stat.cd', '-' + pct(lv * pc.energy.cdr)]];
    case 'medkit': return [['stat.regen', (lv * pc.medkit.regenPerLevel).toFixed(1) + '/s'], ['stat.heal', '+' + pc.medkit.healOnPick]];
    case 'nazar': return [['stat.crit', '+' + pct(lv * pc.nazar.critPerLevel)], ['stat.dodge', pct(Math.min(pc.nazar.dodgeCap, lv * pc.nazar.dodgePerLevel))]];
    case 'magnet': return [['stat.pickup', '+' + (lv * pc.magnet.radiusPerLevel).toFixed(1) + ' m'], ['stat.pulse', P.Skills.magnetInterval(lv).toFixed(0) + ' s']];
    case 'kolonya': return [['stat.heal', '+' + (pc.kolonya.healBase + lv * pc.kolonya.healPerLevel)], ['stat.douse', pc.kolonya.radius + ' m']];
    case 'cay': return [['stat.regen', (lv * pc.cay.regenPerLevel).toFixed(1) + '/s'], ['stat.still', pc.cay.delay + ' s']];
    case 'lokum': return [['stat.xp', '+' + pct(lv * pc.lokum.xpPerLevel)]];
    case 'powerbank': return [['stat.cd', '-' + pct(lv * pc.powerbank.cdPerLevel)], ['stat.dash', '-' + pct(lv * pc.powerbank.dashPerLevel)]];
    case 'kask': return [['stat.bigHit', '-' + (lv * pc.kask.reducePerLevel) + ' (≥' + pc.kask.minHit + ')']];
  }
  return [];
}

P.Progression.statLines = function (card) {
  var out = [], item = card.item, n = card.next;
  if (card.id[0] === 'f') return out;
  if (card.id[0] === 'w') return weaponStats(card);
  var A = passiveStats(item, n - 1), B = passiveStats(item, n);
  B.forEach(function (row, i) {
    if (A[i] && A[i][1] === row[1]) return;
    if (row[1] === '+0') return;
    out.push({ k: row[0], a: A[i] ? A[i][1] : null, b: row[1] });
  });
  return out;
};

// A weapon card that raises an owned weapon (its .up text) rather than offering the weapon itself.
P.Progression.isUpgrade = function (card) { return card.id[0] === 'w' && card.next > 1 && !card.evo; };
// The rules text only (class B). The card's flavour line is a dialogue beat ('flav.<item>'); the view adds it (screens.js).
P.Progression.describe = function (card) {
  return P.t('desc.' + card.item + (P.Progression.isUpgrade(card) ? '.up' : ''));
};

// Level-up shockwave: shove nearby enemies away from the hero (no damage).
P.Progression.shock = function (s) {
  var h = s.hero, c = P.CFG.levelUpShock, T = P.CFG.knockbackTime;
  s.enemies.forEach(function (e) {
    if (e.dead || e.state !== 'active') return;
    var dx = e.x - h.x, dy = e.y - h.y, d = Math.hypot(dx, dy) || 1;
    if (d > c.radius) return;
    var k = c.knockback * (1 - d / c.radius * 0.5) * (1 - e.kbResist);
    e.kbx = dx / d * 2 * k / T; e.kby = dy / d * 2 * k / T; e.kbT = T;
  });
  s.events.push({ type: 'shockwave', x: h.x, y: h.y, r: c.radius });
};

// Chest reward: an eligible evolution first; otherwise one random upgrade (owned items first).
P.Progression.chestReward = function (s) {
  var evo = P.Progression.evolutionFor(s);
  if (evo) return evo;
  var all = P.Progression.candidates(s), up = all.filter(function (c) { return c.next > 1; });
  var pool = up.length ? up : all;
  if (!pool.length) return { id: 'f:simit', item: 'simit', next: 0 };
  return pool[s.rng.cards.int(0, pool.length - 1)];
};

P.Progression.openChest = function (s, card) {
  s.pendingLevels++;
  P.Progression.choose(s, card);
  s.cardPicks--;
  s.pendingChests--; s.chestsOpened++;
  s.events.push({ type: 'chestOpened', item: card.item, level: card.next, evo: card.evo || null });
};

// Debug grant (tools/test-arsenal.js, ?arsenal=1 tooling): { weapons: {id: lvl}, passives: {id: lvl},
// mods: {fam: [modId, ...]} }. Evolution ids in weapons grant the evolved weapon and remove its base weapon.
P.Progression.debugGrant = function (s, grant) {
  var h = s.hero;
  h.evolved = h.evolved || {};
  Object.keys(grant.weapons || {}).forEach(function (id) {
    var cfg = P.CFG.weapons[id];
    if (cfg && cfg.evo) {
      delete h.weapons[cfg.from];
      h.evolved[cfg.from] = id;
      h.weapons[id] = 1;
    } else {
      h.weapons[id] = Math.min(P.CFG.maxItemLevel, grant.weapons[id]);
    }
    P.Weapons.onAcquire(s, id);
  });
  Object.keys(grant.passives || {}).forEach(function (id) {
    h.passives[id] = Math.min(P.CFG.maxItemLevel, grant.passives[id]);
  });
  Object.keys(grant.mods || {}).forEach(function (fam) {
    h.mods = h.mods || {};
    h.mods[fam] = grant.mods[fam].slice();
  });
  return s;
};
