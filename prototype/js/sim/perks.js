// Street Tree perks in the sim (R1-T5 step 2, D-059). s.perk is a set { 'str.1': 1, ... } of learned perk ids for this run,
// built from the loadout. Hooks elsewhere test s.perk['<id>'] and read numbers from P.CFG.perks (config-perks.js).
P.Perks = {};

// Learned ids from a loadout: unknown ids are dropped, so a bad save cannot switch on a hook.
P.Perks.set = function (ids) {
  var out = {}, i;
  for (i = 0; i < (ids || []).length; i++) if (P.Tree && P.Tree.node(ids[i])) out[ids[i]] = 1;
  return out;
};

// Instant shove ring at (x, y): every live enemy inside ring.r is pushed ring.kb metres away. No damage, no telegraph.
// Used by str.3 Shockwave and agg.4 Last Laugh. Resisted by each enemy's knockback resist (Combat.shove).
P.Perks.ring = function (s, x, y) {
  var R = P.CFG.perks.ring, i, e, dx, dy, d;
  for (i = 0; i < s.enemies.length; i++) {
    e = s.enemies[i];
    if (e.dead || e.state === 'dormant') continue;
    dx = e.x - x; dy = e.y - y; d = Math.sqrt(dx * dx + dy * dy);
    if (d > R.r) continue;
    if (d < 1e-6) { dx = 0; dy = 1; d = 1; }
    P.Combat.shove(e, dx / d, dy / d, R.kb, true);
  }
  s.events.push({ type: 'perkRing', x: x, y: y, r: R.r });
};
