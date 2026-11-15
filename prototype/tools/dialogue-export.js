// Writes a review CSV of one batch and language for the editor (BRIEF-DIALOGUE §5).
// Columns: id, beat intent, speaker, line, joke flag, characters/limit, status, editor note, then verdict, replacement (the editor's input).
// One row per line variant; the id is "<beat>#<variant>". status is "draft" until an editor approves it through dialogue-import.js.
// Usage: node prototype/tools/dialogue-export.js --lang=tr|en --batch=A [--out=reviews/dialogue/tr-A.csv]
'use strict';
const fs = require('fs'), path = require('path');
const { loadP, ROOT } = require('./lib-load.js');
const arg = n => { const m = process.argv.slice(2).find(a => a.indexOf('--' + n + '=') === 0); return m ? m.slice(n.length + 3) : null; };
const lang = arg('lang'), batch = arg('batch') || 'A';
if (lang !== 'tr' && lang !== 'en') { console.error('usage: --lang=tr|en --batch=A [--out=file]'); process.exit(1); }
const P = loadP(), D = P.Dialogue;
const out = arg('out') || path.join(ROOT, '..', 'reviews', 'dialogue', lang + '-' + batch + '.csv');
const limitOf = id => (P.DLG.beats[id].max || (/^BK\.|^flav\./.test(id) ? 60 : 90));
const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
const rows = [['id', 'beat intent', 'speaker', 'line', 'joke flag', 'characters/limit', 'status', 'editor note', 'verdict', 'replacement']];
D.batch(batch).forEach(id => {
  const b = P.DLG.beats[id], list = P.DLG[lang][id] || [];
  list.forEach((e, i) => rows.push([id + '#' + i, P.DLG.intent && P.DLG.intent[id] || b.use, P.STR[lang][e.spk || b.spk] || e.spk || b.spk, e.t,
    e.j ? 'joke' : '', e.t.length + '/' + limitOf(id), e.ok ? 'approved' : 'draft', '', '', '']));
});
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, '﻿' + rows.map(r => r.map(q).join(',')).join('\r\n') + '\r\n');
console.log(`${path.relative(process.cwd(), out)}: ${rows.length - 1} lines of batch ${batch} (${lang})`);
