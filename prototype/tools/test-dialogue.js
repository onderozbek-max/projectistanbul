// Dialogue store checks (D-051, BRIEF-DIALOGUE-2026-11-09 §6). Checks 1, 2 and 8 cover the whole store; checks 3-7 (length, joke ratio,
// banned lists, pair detector, duplicates, profanity caps) are strict for the beats of the written review batches (P.DLG.batches) and
// counted as notes for the rest, except guardrail words, which must have zero hits everywhere (tools/lib-dialogue-checks.js).
// 1. Every beat a trigger can fire has >= 1 line in TR and in EN; no orphan lines; no unknown speaker keys; no empty text.
// 2. No class-C text left in P.LINES / P.STR; no P.LangText, P.BarkPools or P.FinaleLang; no fallback path in barks.js; every script
//    tag in index.html points at a file that exists (the four old mechanisms are really gone).
// 8. The sim does not change with the language: the same seeded L1 run in TR and in EN gives the same digest.
// Usage: node prototype/tools/test-dialogue.js   (exit 1 with the list of problems)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const NOT_LOADED = /^js\/view\/|^js\/main\.js$|^js\/meta\/meta-(ui|map|gear|stats|arsenal)\.js$/;

const store = {};
globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const html = read('index.html');
const SCRIPTS = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
const problems = [], notes = [];
SCRIPTS.forEach(f => { if (!fs.existsSync(path.join(ROOT, f))) problems.push('index.html loads a missing file: ' + f); });
SCRIPTS.filter(f => !NOT_LOADED.test(f) && fs.existsSync(path.join(ROOT, f))).forEach(f => vm.runInThisContext(read(f), { filename: f }));
const P = globalThis.P, D = P.Dialogue, B = P.DLG.beats;
const pad = n => (n < 10 ? '0' : '') + n;

// ---------- 2. the old mechanisms are gone ----------
['LINES', 'LangText', 'BarkPools', 'FinaleLang', 'line'].forEach(k => { if (P[k] !== undefined) problems.push('P.' + k + ' still exists (old voice mechanism)'); });
['story/lang-apply.js', 'story/story-lang-tr.js', 'story/story-lang-en.js', 'story/strings-barks.js', 'story/strings-barks-tr.js',
 'story/strings-barks-en.js', 'story/finale-lang-tr.js', 'story/finale-lang-en.js'].forEach(f => {
  if (fs.existsSync(path.join(ROOT, 'js', f))) problems.push('old file still on disk: js/' + f);
});
const barksSrc = read('js/story/barks.js');
['P.LINES', 'BarkPools', 'pickFallback', 'keysOf'].forEach(w => { if (barksSrc.includes(w)) problems.push('barks.js still contains ' + w); });
const CLASS_C_KEY = /^(BK\.|flav\.|FIN|H\d\d[ibp]|L\d\d[sm]$|C\d+[a-e]$|O1|E5|K20|E30|CMP|bark[A-Z]|call[A-D]|rule\d|s[234]$|pardon$|exit\d$)/;
['tr', 'en'].forEach(lg => Object.keys(P.STR[lg]).forEach(k => { if (CLASS_C_KEY.test(k)) problems.push(`P.STR.${lg}['${k}'] is voice text (class C)`); }));
// Card flavour is split from the rules: every flav.<item> beat has a desc.<item> rules string that does not repeat it.
Object.keys(B).filter(k => k.indexOf('flav.') === 0).forEach(k => {
  const item = k.slice(5);
  ['tr', 'en'].forEach(lg => {
    const rules = P.STR[lg]['desc.' + item], fl = D.pool(k, lg);
    if (!rules) problems.push(`${k}: no desc.${item} rules text in ${lg}`);
    else if (fl && rules.indexOf(fl[0].t) >= 0) problems.push(`${k}: the flavour line is still inside desc.${item} (${lg})`);
  });
});

// ---------- 1. coverage ----------
const known = spk => !!(spk && P.STR.tr[spk] && P.STR.en[spk]);
Object.keys(B).forEach(id => {
  const b = B[id];
  if (!known(b.spk)) problems.push(`${id}: unknown speaker key ${b.spk}`);
  ['tr', 'en'].forEach(lg => {
    const list = P.DLG[lg][id];
    if (!list || !list.length) { problems.push(`${id}: no line in ${lg}`); return; }
    list.forEach((e, i) => {
      if (!e || typeof e.t !== 'string' || !e.t.trim()) problems.push(`${id}#${i}: empty text in ${lg}`);
      if (e && e.spk && !known(e.spk)) problems.push(`${id}#${i}: unknown speaker key ${e.spk} in ${lg}`);
    });
  });
});
['tr', 'en'].forEach(lg => Object.keys(P.DLG[lg]).forEach(id => { if (!B[id]) problems.push(`orphan ${lg} line set: ${id} has no beat`); }));
function need(id, where) { if (!D.has(id)) problems.push(`${where}: beat ${id} does not exist`); }
// Story pages: every id on every panel.
Object.keys(P.Story.pages).forEach(pg => P.Story.pages[pg].panels.forEach((panel, pi) => (panel.it || []).forEach(it => {
  if (['c', 't', 'b', 's'].indexOf(it[0]) >= 0) need(it[1], `page ${pg} panel ${pi + 1}`);
  if (it[0] === 'l') it[1].forEach(id => need(id, `page ${pg} panel ${pi + 1} letter`));
})));
// Level beats: pops and calls for levels 1..100.
for (let n = 1; n <= 100; n++) ['intro', 'start', 'mid', 'boss', 'end'].forEach(when => {
  const b = P.Story.beat(n, when);
  if (!b) return;
  if (b.kind === 'pop') need(b.line, `level ${n} ${when}`);
  if (b.kind === 'call') b.lines.forEach(id => need(id, `level ${n} ${when} call`));
  if (b.kind === 'page' && !P.Story.pages[b.id]) problems.push(`level ${n} ${when}: page ${b.id} does not exist`);
});
// L1: call lines, cold open, director barks.
Object.keys(P.CFG.callDur).forEach(id => need(id, 'P.CFG.callDur'));
['s2', 's3', 's4', 'barkGrab', 'pardon', 'rule1', 'rule2', 'rule3', 'exit1', 'exit2'].forEach(id => need(id, 'cold open / L1 exit'));
const simSrc = fs.readdirSync(path.join(ROOT, 'js/sim')).map(f => read('js/sim/' + f)).join('\n') + read('js/config-levels.js');
new Set([...simSrc.matchAll(/'(bark[A-Z][A-Za-z]*|call[A-D]\d?|callHack\d)'/g)].map(m => m[1])).forEach(id => need(id, 'sim / config reference'));
// Bark pools the bark engine can ask for (the families it builds from events, level position and registries).
const POOLS = ['boss', 'boss.phase', 'elite', 'low', 'heal', 'lvlA', 'lvlB', 'lvlC', 'lvlD', 'mod', 'mastery', 'ult', 'ultr', 'dash', 'near', 'nazar',
  'frenzy', 'rescue', 'sig.lost', 'sig.back', 'self', 'mom', 'dad', 'close', 'still', 'idle', 'zq', 'zr', 'zreact', 'evo.gen', 'card.gen',
  'obj.start', 'obj.done', 'obj.fail', 'skill.shield', 'skill.tea', 'streak.10', 'streak.25', 'streak.50', 'streak.100'];
['explode', 'chain', 'shock', 'door', 'extinguish', 'fuse', 'break'].forEach(k => POOLS.push('env.' + k));
['bloaterSwell', 'bossSlam', 'bruteCharge', 'bruteRoar', 'spit', 'summon'].forEach(k => POOLS.push('act.' + k));
['alarm', 'atm', 'booster', 'shutter', 'traffic', 'tram'].forEach(k => ['start', 'done', 'fail'].forEach(ph => POOLS.push('hack.' + k + '.' + ph)));
['ambush', 'barricade', 'blackout', 'burningCar', 'chest', 'defend', 'lootRunner', 'pier', 'rescue', 'stampede'].forEach(k => { POOLS.push('ev.' + k, 'evend.' + k); });
Object.keys(P.STR.tr).filter(k => /^enemy\./.test(k)).forEach(() => {});
['bloater', 'brute', 'copci', 'crawler', 'diner', 'elite', 'hardhat', 'kasap', 'kurye', 'parkur', 'runner', 'screamer', 'spitter', 'walker', 'zehirli'].forEach(k => POOLS.push('fk.' + k));
for (let h = 1; h <= 20; h++) for (let s = 1; s <= 5; s++) POOLS.push('hd' + pad(h) + '.' + s);
POOLS.forEach(k => { need('BK.' + k, 'bark engine'); if (D.has('BK.' + k) && D.size('BK.' + k, 'tr') < 2) problems.push(`BK.${k}: fewer than 2 TR variants`); });
// Pool keys the engine can ask for with no pool at all (they fall to the generic card/evo pool, or stay silent). Informational.
const gaps = [];
Object.keys(P.STR.tr).filter(k => /^item\./.test(k)).forEach(k => { const it = k.slice(5); if (!D.has('BK.card.' + it)) gaps.push('BK.card.' + it); });
notes.push('bark pools with no beat (fall to BK.card.gen / BK.evo.gen): ' + gaps.length + ' card keys; BK.ev.blast, BK.ev.set and their evend twins stay silent');

// ---------- misses at runtime ----------
D.clearMisses();
['tr', 'en'].forEach(lg => { P.lang = lg; Object.keys(B).slice(0, 50).forEach(id => D.get(id)); });
if (D.misses().length) problems.push('P.Dialogue.get missed: ' + D.misses().slice(0, 5).join(', '));
D.clearMisses();
if (D.get('no.such.beat') !== null || D.line('no.such.beat') !== null) problems.push('a missing beat must return null');
P.DLG.beats.__probe = { spk: 'spk.arda', use: 'test' }; P.DLG.tr.__probe = [{ t: 'x' }];
P.lang = 'en';
if (D.get('__probe') !== null) problems.push('a beat with no EN line fell back to TR');
delete P.DLG.beats.__probe; delete P.DLG.tr.__probe;
D.clearMisses();

// ---------- 8. the sim is identical in TR and EN ----------
function digest(lang) {
  P.lang = lang; D.reset(1);
  const h = crypto.createHash('sha1'); let s, t;
  s = P.createSim(4242); P.startPlay(s);
  s.dir.call.active = true;
  for (let i = 0; i < 3600; i++) {
    t = i / 60;
    if (s.pendingLevels > 0) { const o = P.Progression.makeOffer(s); P.Progression.choose(s, o.cards[0]); }
    P.stepSim(s, 1 / 60, { x: Math.sin(t * 0.7) * 0.6, y: 0.8 });
    P.drainEvents(s).forEach(ev => h.update(JSON.stringify(ev)));
    if (i % 30 === 0) h.update(JSON.stringify([s.hero.x, s.hero.y, s.hero.hp, s.enemies.length, s.dir.call.sub && s.dir.call.sub.id, s.dir.call.sub && s.dir.call.sub.t, s.dir.call.queue.length]));
  }
  return { hex: h.digest('hex'), callsShown: s.dir.call.queue.length };
}
const dTr = digest('tr'), dEn = digest('en');
if (dTr.hex !== dEn.hex) problems.push(`sim digest differs between TR (${dTr.hex.slice(0, 10)}) and EN (${dEn.hex.slice(0, 10)})`);
P.lang = 'tr';

// ---------- 3-7. length, joke ratio, banned lists, pair detector, duplicates (strict for written batches, notes for the rest) ----------
const ids = Object.keys(B);
const style = require('./lib-dialogue-checks.js').run(P, D);
style.problems.forEach(x => problems.push(x));
style.notes.forEach(x => notes.push(x));

console.log(`dialogue: ${ids.length} beats · TR ${ids.reduce((n, id) => n + D.size(id, 'tr'), 0)} lines · EN ${ids.reduce((n, id) => n + D.size(id, 'en'), 0)} lines · sim digest TR=EN ${dTr.hex.slice(0, 10)}`);
notes.forEach(n => console.log('  note: ' + n));
if (problems.length) { console.log('FAIL'); problems.slice(0, 60).forEach(x => console.log(' - ' + x)); if (problems.length > 60) console.log(` ... ${problems.length - 60} more`); process.exit(1); }
console.log('PASS: every beat has TR and EN lines, the four old mechanisms are gone, the sim ignores the language');
