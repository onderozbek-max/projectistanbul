// Writes authored lines into the data files of js/dialogue/<lang>/ (the files stay generated-format: one record per beat).
// Input: a JSON file { "lang": "tr"|"en", "lines": { "<beatId>": [ { "t": "...", "j": 1?, "spk": "...?", "mood": "...?" }, ... ] } }.
// Every id must exist in the beat table; a beat that already has lines in the file is replaced, a new one is added to the file
// it is listed in (or the first file of the language). A line is saved WITHOUT ok: only tools/dialogue-import.js approves (job.allowOk).
// Usage: node prototype/tools/dialogue-apply.js <lines.json> [more.json ...]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const DLG = path.join(__dirname, '..', 'js', 'dialogue');
const KEYS = ['t', 'j', 'spk', 'mood', 'ok'];

function fileIds(file) {
  const sb = { P: { DLG: { beats: {}, tr: {}, en: {} } } };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sb);
  return Object.keys(sb.P.DLG.tr).concat(Object.keys(sb.P.DLG.en));
}
function loadFile(file, lang) {
  const sb = { P: { DLG: { beats: {}, tr: {}, en: {} } } };
  const src = fs.readFileSync(file, 'utf8');
  vm.runInNewContext(src, sb);
  return { src, head: src.split('\n').filter(l => l.indexOf('//') === 0), data: sb.P.DLG[lang] };
}
const rec = e => '{ ' + KEYS.filter(k => e[k] !== undefined && e[k] !== null && e[k] !== '').map(k => k + ': ' + JSON.stringify(e[k])).join(', ') + ' }';
function serialize(head, lang, data) {
  const out = head.slice();
  out.push('Object.assign(P.DLG.' + lang + ', {');
  Object.keys(data).forEach(id => {
    const list = data[id];
    if (list.length === 1) out.push('  ' + JSON.stringify(id) + ': [' + rec(list[0]) + '],');
    else { out.push('  ' + JSON.stringify(id) + ': ['); list.forEach(e => out.push('    ' + rec(e) + ',')); out.push('  ],'); }
  });
  out.push('});');
  return out.join('\n') + '\n';
}

function apply(job) {
  const lang = job.lang, dir = path.join(DLG, lang);
  if (lang !== 'tr' && lang !== 'en') throw new Error('lang must be tr or en');
  const beatsSb = { P: { DLG: { beats: {}, tr: {}, en: {} } } };
  fs.readdirSync(DLG).filter(f => /^beats-.*\.js$/.test(f)).forEach(f => vm.runInNewContext(fs.readFileSync(path.join(DLG, f), 'utf8'), beatsSb));
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort().map(f => path.join(dir, f));
  const where = {}; files.forEach(f => fileIds(f).forEach(id => { if (!where[id]) where[id] = f; }));
  const loaded = {}, touched = new Set(), problems = [];
  Object.keys(job.lines).forEach(id => {
    const list = job.lines[id];
    if (!beatsSb.P.DLG.beats[id]) { problems.push('unknown beat ' + id); return; }
    if (!Array.isArray(list) || !list.length || list.some(e => !e || typeof e.t !== 'string' || !e.t.trim())) { problems.push('bad lines for ' + id); return; }
    const f = where[id] || files[0];
    loaded[f] = loaded[f] || loadFile(f, lang);
    loaded[f].data[id] = list.map(e => { const o = {}; KEYS.forEach(k => { if ((k !== 'ok' || job.allowOk) && e[k] !== undefined) o[k] = e[k]; }); return o; });
    touched.add(f);
  });
  if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
  touched.forEach(f => fs.writeFileSync(f, serialize(loaded[f].head, lang, loaded[f].data)));
  return { lang, beats: Object.keys(job.lines).length, files: [...touched].map(f => path.relative(DLG, f)) };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (!args.length) { console.error('usage: node dialogue-apply.js <lines.json> ...'); process.exit(1); }
  args.forEach(a => { const r = apply(JSON.parse(fs.readFileSync(a, 'utf8'))); console.log(`${a}: ${r.lang} ${r.beats} beats -> ${r.files.join(', ')}`); });
}
module.exports = { apply };
