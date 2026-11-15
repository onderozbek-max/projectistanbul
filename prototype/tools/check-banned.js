// Banned-list check (D-051, BRIEF-DIALOGUE Phase 2). Runs tools/dialogue-banned.json over every line of P.DLG (TR and EN).
// Report-only by default (exit 0) while the lists are PROPOSED. With --strict, any 'guardrail' hit exits 1 (Phase 3 wires this in).
// Also reports the joke ratio per pool, over-long barks and profanity tier counts, so the Phase 3 caps have a baseline.
// Usage: node prototype/tools/check-banned.js [--strict] [--verbose]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const NOT_LOADED = /^js\/view\/|^js\/main\.js$|^js\/meta\/meta-(ui|map|gear|stats|arsenal)\.js$/;
const STRICT = process.argv.includes('--strict'), VERBOSE = process.argv.includes('--verbose');

const store = {};
globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
[...read('index.html').matchAll(/<script src="([^"]+)"/g)].map(m => m[1])
  .filter(f => !NOT_LOADED.test(f) && fs.existsSync(path.join(ROOT, f))).forEach(f => vm.runInThisContext(read(f), { filename: f }));
const P = globalThis.P;
const L = JSON.parse(fs.readFileSync(path.join(__dirname, 'dialogue-banned.json'), 'utf8'));
const rx = (re, f) => new RegExp(re, f || 'iu');

const LIMIT = { bark: 60, pop: 90, flav: 60 };
const limitOf = id => (P.DLG.beats[id] && P.DLG.beats[id].max) || (/^BK\./.test(id) ? LIMIT.bark : /^flav\./.test(id) ? LIMIT.flav : LIMIT.pop);
const exceptionsOf = (lg, tag) => ((L.ownerExceptions || {})[lg] || {})[tag] || [];
const out = { guardrail: [], flag: [], review: [] }, prof = { tr: [0, 0, 0], en: [0, 0, 0] }, over = [], ratios = [];
let lines = 0;

['tr', 'en'].forEach(lg => {
  const sets = {};
  ['guardrail', 'flag', 'review'].forEach(k => { sets[k] = (L[k][lg] || []).map(e => Object.assign({}, e, { r: rx(e.re), x: e.except ? rx(e.except) : null })); });
  const pr = ['tier1', 'tier2', 'tier3'].map(t => rx(L.profanity[lg][t]));
  const texts = new Map();
  Object.keys(P.DLG[lg] || {}).forEach(id => {
    const pool = P.DLG[lg][id];
    let jokes = 0;
    pool.forEach((l, i) => {
      lines++;
      if (l.j) jokes++;
      const t = l.t || '';
      if (t.length > limitOf(id)) over.push(`${lg} ${id}#${i} (${t.length}/${limitOf(id)})`);
      if (texts.has(t)) out.flag.push({ lg, id: id + '#' + i, rule: 'duplicate', why: 'same text as ' + texts.get(t) });
      else texts.set(t, id + '#' + i);
      ['guardrail', 'flag', 'review'].forEach(k => sets[k].forEach(e => {
        const m = e.r.exec(t);
        if (m && !(e.x && e.x.test(m[0])) && exceptionsOf(lg, id + '#' + i).indexOf(e.id) < 0) out[k].push({ lg, id: id + '#' + i, rule: e.id, why: e.why, hit: m[0], text: t });
      }));
      pr.forEach((r, ti) => { if (r.test(t)) prof[lg][ti]++; });
    });
    if (pool.length >= 4 && (P.DLG.beats[id] || {}).ratio !== 'exempt') ratios.push({ lg, id, ratio: jokes / pool.length });
  });
});

const by = a => a.reduce((o, x) => { const k = x.lg + ' ' + x.rule; o[k] = (o[k] || 0) + 1; return o; }, {});
console.log(`banned-list check: ${lines} lines (TR+EN)`);
['guardrail', 'flag', 'review'].forEach(k => {
  const c = by(out[k]);
  console.log(`${k}: ${out[k].length}` + (out[k].length ? '  ' + Object.keys(c).map(x => `${x}=${c[x]}`).join(', ') : ''));
  if (VERBOSE || k === 'guardrail') out[k].slice(0, 40).forEach(x => console.log(`   ${x.lg} ${x.id} [${x.rule}] "${x.hit || ''}": ${x.text || x.why}`));
});
console.log(`over the length limit: ${over.length}` + (VERBOSE ? '\n   ' + over.join('\n   ') : ''));
const hi = ratios.filter(r => r.ratio > 0.3).length;
console.log(`pools (>=4 lines) with joke ratio > 30%: ${hi} of ${ratios.length}`);
['tr', 'en'].forEach(lg => console.log(`profanity ${lg}: tier1 ${prof[lg][0]}, tier2 ${prof[lg][1]}, tier3 ${prof[lg][2]} lines`));
if (STRICT && out.guardrail.length) { console.log('FAIL (--strict): guardrail hits'); process.exit(1); }
console.log(STRICT ? 'PASS (--strict)' : 'report only (use --strict to fail on guardrail hits)');
