// Applies an editor's verdicts from a review CSV back into the data files (BRIEF-DIALOGUE §5). The agent never runs this on its own
// lines: only the owner or a native editor approves, and they do it here.
// Reads the columns id ("<beat>#<variant>"), verdict and replacement:
//   verdict keep (or approve / ok)  -> the line is marked approved (ok: 1)
//   verdict rewrite                 -> the line text becomes "replacement" and is marked approved (the editor wrote it)
//   verdict accept                  -> like rewrite, but the text comes from the "proposed" column (sheets that carry a proposal)
//   verdict cut                     -> the variant is removed (a beat must keep at least one line)
// A row with an empty verdict changes nothing. Usage: node prototype/tools/dialogue-import.js --lang=tr|en <file.csv> [--dry]
'use strict';
const fs = require('fs');
const { loadP } = require('./lib-load.js');
const { apply } = require('./dialogue-apply.js');
const args = process.argv.slice(2), lang = (args.find(a => a.indexOf('--lang=') === 0) || '').slice(7), file = args.find(a => a[0] !== '-'), dry = args.includes('--dry');
if ((lang !== 'tr' && lang !== 'en') || !file) { console.error('usage: dialogue-import.js --lang=tr|en <file.csv> [--dry]'); process.exit(1); }

function parseCsv(text) {
  const rows = []; let row = [], f = '', inQ = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else inQ = false; } else f += c; }
    else if (c === '"') inQ = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); f = ''; if (row.some(x => x !== '')) rows.push(row); row = []; }
    else f += c;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  return rows;
}
const rows = parseCsv(fs.readFileSync(file, 'utf8')), head = rows.shift().map(h => h.trim().toLowerCase());
const col = n => head.indexOf(n);
if (col('id') < 0 || col('verdict') < 0) { console.error('the CSV needs "id" and "verdict" columns'); process.exit(1); }
const P = loadP();
const work = {}, problems = [], tally = { keep: 0, rewrite: 0, cut: 0, skipped: 0 };
rows.forEach((r, n) => {
  const m = /^(.+)#(\d+)$/.exec((r[col('id')] || '').trim());
  const verdict = (r[col('verdict')] || '').trim().toLowerCase();
  if (!verdict) { tally.skipped++; return; }
  if (!m) { problems.push(`row ${n + 2}: bad id "${r[col('id')]}"`); return; }
  const id = m[1], i = +m[2], list = work[id] || (work[id] = (P.DLG[lang][id] || []).map(e => Object.assign({}, e)));
  if (!list[i]) { problems.push(`row ${n + 2}: ${id}#${i} does not exist`); return; }
  if (['keep', 'approve', 'ok'].indexOf(verdict) >= 0) { list[i].ok = 1; tally.keep++; }
  else if (verdict === 'rewrite' || verdict === 'accept') {
    const t = (r[col(verdict === 'accept' ? 'proposed' : 'replacement')] || '').trim();
    if (!t) { problems.push(`row ${n + 2}: ${id}#${i} ${verdict} without text`); return; }
    list[i].t = t; list[i].ok = 1; tally.rewrite++;
  } else if (verdict === 'cut') { list[i].cut = true; tally.cut++; }
  else problems.push(`row ${n + 2}: unknown verdict "${verdict}"`);
});
Object.keys(work).forEach(id => {
  work[id] = work[id].filter(e => !e.cut);
  if (!work[id].length) { problems.push(`${id}: every variant was cut; a beat must keep one line`); delete work[id]; }
});
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`verdicts: ${tally.keep} keep, ${tally.rewrite} rewrite, ${tally.cut} cut, ${tally.skipped} rows without a verdict`);
if (dry) { console.log('dry run: nothing written'); process.exit(0); }
const r = apply({ lang, lines: work, allowOk: true });
console.log(`written: ${r.beats} beats -> ${r.files.join(', ')}`);
