// XP, run levels and level-up card offers (GD 4.5, 5.3; mirrors game/core/card_offer.gd weights).
P.Hero = {};
P.Hero.speed = function (s) {
  return P.CFG.hero.speed * (1 + (s.hero.passives.sneakers || 0) * P.CFG.passives.sneakers.movePct);
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
  var h = s.hero, parts = card.id.split(':');
  if (parts[0] === 'w') { h.weapons[card.item] = card.next; if (card.item === 'tea' && card.next === 1) h.cds.tea = 0.3; }
  else if (parts[0] === 'p') h.passives[card.item] = card.next;
  else if (card.item === 'simit') h.hp = Math.min(h.maxHp, h.hp + P.CFG.cards.fillerSimitHeal);
  else s.jeton += P.CFG.cards.fillerJeton;
  s.cardPicks++;
  s.pendingLevels--;
  s.events.push({ type: 'cardChosen', id: card.id, level: card.next });
};

P.Progression.describe = function (card) {
  if (card.item === 'fork' || card.item === 'tea') return P.t('desc.' + card.item + '.' + card.next);
  return P.t('desc.' + card.item);
};

P.Progression.isWeapon = isWeapon;
