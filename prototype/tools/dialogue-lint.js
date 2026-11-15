// Lints an authored-lines JSON (the input of dialogue-apply.js) before it is applied: length limits, joke ratio per pool,
// banned/translationese lists (tools/dialogue-banned.json), duplicate lines and profanity counts.
// Usage: node prototype/tools/dialogue-lint.js <lines.json> [...]   (exit 1 on any error; warnings do not fail)
'use strict';
const fs = require('fs'), path = require('path');
const L = JSON.parse(fs.readFileSync(path.join(__dirname, 'dialogue-banned.json'), 'utf8'));
const rx = (re, f) => new RegExp(re, f || 'iu');
const limitOf = id => (/^BK\./.test(id) || /^flav\./.test(id) ? 60 : 90);
let bad = 0;
process.argv.slice(2).forEach(file => {
  const job = JSON.parse(fs.readFileSync(file, 'utf8')), lg = job.lang, errs = [], warns = [], seen = new Map(), prof = [0, 0, 0];
  const g = (L.guardrail[lg] || []).map(e => [e, rx(e.re)]), f = (L.flag[lg] || []).map(e => [e, rx(e.re), e.except ? rx(e.except) : null]);
  const pr = ['tier1', 'tier2', 'tier3'].map(t => rx(L.profanity[lg][t]));
  let lines = 0, ratioBad = 0, pools = 0;
  Object.keys(job.lines).forEach(id => {
    const list = job.lines[id]; let jokes = 0;
    list.forEach((e, i) => {
      lines++; if (e.j) jokes++;
      const t = e.t, tag = id + '#' + i;
      if (t.length > limitOf(id)) errs.push(`${tag}: ${t.length} > ${limitOf(id)} chars: ${t}`);
      if (seen.has(t)) errs.push(`${tag}: duplicate of ${seen.get(t)}`); else seen.set(t, tag);
      g.forEach(([x, r]) => { const m = r.exec(t); if (m) errs.push(`${tag}: guardrail ${x.id} "${m[0]}": ${t}`); });
      f.forEach(([x, r, ex]) => { const m = r.exec(t); if (m && !(ex && ex.test(m[0]))) warns.push(`${tag}: ${x.id} "${m[0]}": ${t}`); });
      pr.forEach((r, k) => { if (r.test(t)) prof[k]++; });
    });
    if (list.length >= 4) { pools++; const r = jokes / list.length; if (r < 0.15 || r > 0.30) { ratioBad++; errs.push(`${id}: joke ratio ${jokes}/${list.length} = ${(r * 100).toFixed(0)}% (needs 15-30%)`); } }
    else if (jokes > 1) warns.push(`${id}: ${jokes} jokes in a ${list.length}-line pool`);
  });
  console.log(`${file}: ${lg}, ${Object.keys(job.lines).length} beats, ${lines} lines, ${pools} pools >= 4 (${ratioBad} off-ratio); profanity tier1/2/3 lines: ${prof.join('/')}`);
  warns.forEach(w => console.log('  warn  ' + w)); errs.forEach(e => console.log('  ERROR ' + e));
  if (errs.length) bad++;
});
process.exit(bad ? 1 : 0);
