// Street Tree (R1-T5, D-059): perks that hang off the six attributes. PURE: no DOM. Also loaded by the headless bot.
// RANK IS THE LOCK, STREET CRED IS THE KEY (docs/skill-tree.md): a perk needs a minimum attribute rank (spent ranks only,
// practice-earned) and costs Street Cred. Six branches (the attribute ids), four one-rank perks each in Chapter 1.
// Perk ids are '<attr>.<tier>', for example 'str.2'. Names and descriptions use the keys tree.<id>.name and tree.<id>.desc.
// Perk effects are NOT here yet (step 2). Numbers below are PROPOSED (D-059) and live only in this file.
var P = (typeof globalThis !== 'undefined' ? globalThis : window).P || {};
(typeof globalThis !== 'undefined' ? globalThis : window).P = P;

P.CFG = P.CFG || {};
P.CFG.tree = {
  // Tier t (1-based) needs attribute rank gate and costs cost Street Cred. A full branch costs 10, the Ch1 tree 60.
  tiers: [{ gate: 1, cost: 1 }, { gate: 2, cost: 2 }, { gate: 4, cost: 3 }, { gate: 6, cost: 4 }],
  respecPerChapter: 1,        // free respec uses per chapter; never sold (attributes.md 3.3)
  chapter: 1,                 // current chapter cap of the tree (Ch2 adds a tier at rank 8, Ch3 at rank 10)
  bonds: ['kaan', 'mila', 'ada'],
  bondMax: 100,
};

P.Tree = {};

P.Tree.ids = function () {
  var out = [], C = P.CFG, i, t;
  for (i = 0; i < C.stats.ids.length; i++) for (t = 1; t <= C.tree.tiers.length; t++) out.push(C.stats.ids[i] + '.' + t);
  return out;
};

// { id, attr, tier, gate, cost } or null for an unknown id.
P.Tree.node = function (id) {
  var m = /^([a-z]+)\.(\d+)$/.exec(String(id)), C = P.CFG, tier = m ? +m[2] : 0;
  if (!m || C.stats.ids.indexOf(m[1]) < 0 || tier < 1 || tier > C.tree.tiers.length) return null;
  return { id: m[0], attr: m[1], tier: tier, gate: C.tree.tiers[tier - 1].gate, cost: C.tree.tiers[tier - 1].cost };
};

P.Tree.newState = function () { return { learned: {}, respecs: {} }; };

// Sanitize a stored tree: unknown perks are dropped, respec counts become whole numbers. Used by save migration.
P.Tree.normalize = function (raw) {
  var out = P.Tree.newState(), r = raw || {}, k;
  for (k in (r.learned || {})) if (r.learned[k] && P.Tree.node(k)) out.learned[k] = 1;
  for (k in (r.respecs || {})) out.respecs[k] = Math.max(0, Math.floor(+r.respecs[k] || 0));
  return out;
};

// Street Cred paid for the perks currently learned.
P.Tree.spent = function (tree) {
  var total = 0, k, n;
  for (k in (tree && tree.learned)) { n = P.Tree.node(k); if (n) total += n.cost; }
  return total;
};

// Can this perk be learned now? { ok, why } with why in: unknown, owned, rank, sc.
P.Tree.canLearn = function (prog, tree, id) {
  var n = P.Tree.node(id), rank;
  if (!n) return { ok: false, why: 'unknown' };
  if (tree.learned[n.id]) return { ok: false, why: 'owned' };
  rank = P.Stats.clampLevel(prog.attr[n.attr]);
  if (rank < n.gate) return { ok: false, why: 'rank' };
  if ((prog.sc | 0) < n.cost) return { ok: false, why: 'sc' };
  return { ok: true, why: '' };
};

// Learn one perk. Returns { prog, tree } (new objects) or null. Never mutates the inputs.
P.Tree.learn = function (prog, tree, id) {
  var p = P.Stats.normalize(prog), t = P.Tree.normalize(tree), n = P.Tree.node(id);
  if (!P.Tree.canLearn(p, t, id).ok) return null;
  p.sc -= n.cost;
  t.learned[n.id] = 1;
  return { prog: p, tree: t };
};

// Respec: refund every perk's Street Cred and clear the tree. Free once per chapter (never sold).
// Returns { prog, tree, refunded } or null when this chapter's free respec is used or nothing is learned.
P.Tree.respec = function (prog, tree, chapter) {
  var p = P.Stats.normalize(prog), t = P.Tree.normalize(tree), ch = String(chapter || P.CFG.tree.chapter), refund = P.Tree.spent(t);
  if ((t.respecs[ch] | 0) >= P.CFG.tree.respecPerChapter || refund === 0) return null;
  p.sc += refund;
  t.learned = {};
  t.respecs[ch] = (t.respecs[ch] | 0) + 1;
  return { prog: p, tree: t, refunded: refund };
};

// Bond meters (narrative.md): earned by play, never bought, never gated by Street Cred. Values are whole numbers 0..bondMax.
P.Tree.newBonds = function () {
  var out = {}, b = P.CFG.tree.bonds, i;
  for (i = 0; i < b.length; i++) out[b[i]] = 0;
  return out;
};
P.Tree.normalizeBonds = function (raw) {
  var out = P.Tree.newBonds(), k;
  for (k in out) out[k] = Math.max(0, Math.min(P.CFG.tree.bondMax, Math.floor(+(raw && raw[k]) || 0)));
  return out;
};
