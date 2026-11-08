// XP, run levels and level-up card offers (GD 4.5, 5.3; mirrors game/core/card_offer.gd weights).
P.Hero = {};
P.Hero.speed = function (s) {
  return P.CFG.hero.speed * (1 + (s.hero.passives.shoes || 0) * P.CFG.passives.shoes.movePct);
};

P.Progression = {};

P.Progression.addXp = function (s, v) {
  s.xp += v;
  while (s.xp >= P.xpNeed(s.level)) {
    s.xp -= P.xpNeed(s.level);
    s.level++;
    s.pendingLevels++;
    s.levelUps.push(s.runT);
    s.events.push({ type: 'levelup', level: s.level });
    P.Progression.shock(s);
  }
};

function isWeapon(id) { return P.CFG.pool.weapons.indexOf(id) >= 0; }

P.Progression.candidates = function (s) {
  var C = P.CFG, h = s.hero, out = [], max = C.maxItemLevel, c = C.cards;
  var wCount = Object.keys(h.weapons).length, pCount = Object.keys(h.passives).length;
  C.pool.weapons.forEach(function (id) {
    var lv = h.weapons[id] || 0;
    if (lv > 0 && lv < max) out.push({ id: 'w:' + id, item: id, next: lv + 1, w: c.wUpgradeWeapon });
    else if (lv === 0 && id !== C.pool.signature && wCount < c.slotsWeapon) out.push({ id: 'w:' + id, item: id, next: 1, w: c.wNewWeapon });
  });
  C.pool.passives.forEach(function (id) {
    var lv = h.passives[id] || 0;
    if (lv > 0 && lv < max) out.push({ id: 'p:' + id, item: id, next: lv + 1, w: c.wUpgradePassive });
    else if (lv === 0 && pCount < c.slotsPassive) out.push({ id: 'p:' + id, item: id, next: 1, w: c.wNewPassive });
  });
  return out;
};

P.Progression.makeOffer = function (s) {
  var C = P.CFG, rng = s.rng.cards, picks = [];
  if (s.cardPicks === 0) {
    picks = C.scriptedFirstCard.map(function (id) { return P.Progression.cardFor(s, id); });
    return { cards: picks, scripted: true };
  }
  var pool = P.Progression.candidates(s);
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
  var owned = parts[0] === 'w' ? s.hero.weapons : s.hero.passives;
  return { id: id, item: item, next: (owned[item] || 0) + 1 };
};

P.Progression.choose = function (s, card) {
  var h = s.hero, parts = card.id.split(':'), pc = P.CFG.passives;
  if (parts[0] === 'w') { h.weapons[card.item] = card.next; if (card.next === 1) P.Weapons.onAcquire(s, card.item); }
  else if (parts[0] === 'p') {
    h.passives[card.item] = card.next;
    if (card.item === 'medkit') h.hp = Math.min(h.maxHp, h.hp + pc.medkit.healOnPick);
    if (card.item === 'jacket' && card.next >= 4) { h.maxHp += pc.jacket.hpFromLevel4; h.hp += pc.jacket.hpFromLevel4; }
  }
  else if (card.item === 'simit') h.hp = Math.min(h.maxHp, h.hp + P.CFG.cards.fillerSimitHeal);
  else s.jeton += P.CFG.cards.fillerJeton;
  s.cardPicks++;
  s.pendingLevels--;
  s.events.push({ type: 'cardChosen', id: card.id, item: card.item, level: card.next });
};

// Before -> after stat lines for a card: [{ k: labelKey, a: before|null, b: after }].
var pct = function (v) { return Math.round(v * 100) + '%'; };
var STATS = {
  knife: [['stat.dmg', 'dmg'], ['stat.range', 'range', function (v) { return v + ' m'; }], ['stat.arc', 'arcDeg', function (v) { return v + '°'; }], ['stat.back', 'back', 'bool']],
  nailgun: [['stat.dmg', 'dmg'], ['stat.shots', 'shots'], ['stat.pierce', 'pierce'], ['stat.rate', 'cdMult', function (v) { return '×' + (1 / v).toFixed(1); }]],
  canister: [['stat.dmg', 'dmg'], ['stat.proj', 'proj'], ['stat.blast', 'blast', function (v) { return v + ' m'; }], ['stat.fire', 'fire', 'bool']],
  chain: [['stat.dmg', 'dmg'], ['stat.blades', 'blades'], ['stat.radius', 'radius', function (v) { return v + ' m'; }], ['stat.spin', 'speed', function (v) { return '×' + (v / 3.4).toFixed(1); }]],
};
function passiveStats(item, lv) {
  var pc = P.CFG.passives;
  if (lv === 0) return [];
  switch (item) {
    case 'shoes': return [['stat.speed', '+' + pct(lv * pc.shoes.movePct)]];
    case 'jacket': return [['stat.armor', '-' + Math.min(pc.jacket.armorCap, lv * pc.jacket.armorPerLevel)], ['stat.maxHp', '+' + Math.max(0, lv - 3) * pc.jacket.hpFromLevel4]];
    case 'gloves': return [['stat.dmg', '+' + pct(lv * pc.gloves.might)], ['stat.kb', '+' + pct(lv * pc.gloves.knockbackPct)]];
    case 'energy': return [['stat.cd', '-' + pct(lv * pc.energy.cdr)]];
    case 'medkit': return [['stat.regen', (lv * pc.medkit.regenPerLevel).toFixed(1) + '/s'], ['stat.heal', '+' + pc.medkit.healOnPick]];
  }
  return [];
}

P.Progression.statLines = function (card) {
  var out = [], item = card.item, n = card.next;
  if (card.id[0] === 'f') return out;
  if (card.id[0] === 'w') {
    var L = P.CFG.weapons[item].levels, a = n > 1 ? L[n - 2] : null, b = L[n - 1];
    STATS[item].forEach(function (st) {
      var key = st[1], fmt = st[2], va = a ? a[key] : null, vb = b[key];
      if (a && va === vb) return;
      if (!a && (fmt === 'bool' && !vb)) return;
      if (!a && key === 'cdMult') return;
      var f = fmt === 'bool' ? function (v) { return v ? '✓' : '–'; } : (fmt || String);
      out.push({ k: st[0], a: a ? f(va) : null, b: f(vb) });
    });
    return out.slice(0, 3);
  }
  var A = passiveStats(item, n - 1), B = passiveStats(item, n);
  B.forEach(function (row, i) {
    if (A[i] && A[i][1] === row[1]) return;
    if (row[1] === '+0') return;
    out.push({ k: row[0], a: A[i] ? A[i][1] : null, b: row[1] });
  });
  return out;
};

P.Progression.describe = function (card) {
  return P.t('desc.' + card.item + (card.next <= 1 || card.id[0] !== 'w' ? '' : '.up'));
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

// Mini Chest (CC 8): one free upgrade, owned items first; falls back to any candidate, then a simit.
P.Progression.chestReward = function (s) {
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
  s.events.push({ type: 'chestOpened', item: card.item, level: card.next });
};

P.Progression.isWeapon = isWeapon;
