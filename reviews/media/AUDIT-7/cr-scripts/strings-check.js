// node /tmp/istanbul-review/strings-check.js : static string keys referenced in code vs P.STR.tr / P.STR.en
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = require('path').join(__dirname, '../../../../prototype');
const files = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
// load only data files (strings*, config*, journey, story strings) so no DOM is needed
const sandbox = { console, Math, Object, Array, String, Number, JSON, Date, RegExp, Error, parseInt, parseFloat, isFinite };
sandbox.globalThis = sandbox; sandbox.window = sandbox; vm.createContext(sandbox);
files.filter(f => /strings|config|journey|lang/.test(f) && !/lang-apply/.test(f)).forEach(f => { try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f }); } catch (e) { console.log('load fail', f, e.message); } });
try { vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/story/lang-apply.js'), 'utf8'), sandbox); } catch (e) { console.log('lang-apply', e.message); }
const P = sandbox.P, TR = P.STR.tr, EN = P.STR.en;
console.log('keys tr', Object.keys(TR).length, 'en', Object.keys(EN).length);
const onlyTr = Object.keys(TR).filter(k => !(k in EN)), onlyEn = Object.keys(EN).filter(k => !(k in TR));
console.log('in TR not EN:', onlyTr.length, onlyTr.slice(0, 25).join(' '));
console.log('in EN not TR:', onlyEn.length, onlyEn.slice(0, 25).join(' '));
// literal references
const refs = new Map();
files.concat(['js/main.js']).forEach(f => {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of src.matchAll(/P\.t\(\s*'([^'{}+]+)'\s*[,)]/g)) refs.set(m[1], f);
  for (const m of src.matchAll(/\b(?:nameKey|descKey|titleKey|key)\s*:\s*'([a-z][\w.]+)'/g)) refs.set(m[1], f);
  for (const m of src.matchAll(/data-i18n="([^"]+)"/g)) refs.set(m[1], f);
});
for (const m of fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/data-i18n[\w-]*="([^"]+)"/g)) refs.set(m[1], 'index.html');
const missTr = [], missEn = [];
refs.forEach((f, k) => { if (!(k in TR)) missTr.push(k + ' (' + f + ')'); if (!(k in EN)) missEn.push(k + ' (' + f + ')'); });
console.log('literal refs', refs.size, '| missing in TR:', missTr.length, '| missing in EN:', missEn.length);
console.log('  TR missing:', missTr.slice(0, 30).join('\n    '));
console.log('  EN missing:', missEn.slice(0, 30).join('\n    '));
// dynamic families used by new modules
const fam = [];
Object.keys(P.CFG.objectives.types).forEach(id => ['obj.' + id + '.title', 'obj.goal.' + id].forEach(k => fam.push(k)));
['obj.reach.line', 'obj.survive.line', 'obj.collect.line', 'obj.escort.line', 'obj.escort.lost', 'obj.defend.upload', 'obj.defend.go', 'obj.hack.line', 'obj.boss.line'].forEach(k => fam.push(k));
Object.keys(P.CFG.modifiers.defs).forEach(id => fam.push('hmod.' + id + '.name', 'hmod.' + id + '.desc'));
P.Journey.hoods.forEach(h => fam.push('boss.' + h.id, 'spk.b.' + h.id));
['horde', 'glass', 'elite', 'nodash', 'coinrush', 'iron'].forEach(id => fam.push('mod.' + id + '.n', 'mod.' + id + '.d'));
const famMiss = fam.filter(k => !(k in TR) || !(k in EN)).map(k => k + (k in TR ? '' : ' [noTR]') + (k in EN ? '' : ' [noEN]'));
console.log('dynamic families checked', fam.length, 'missing:', famMiss.length, famMiss.slice(0, 40).join(', '));
// families 2: achievements, items, enemy causes, tips
const fam2 = [];
const collectSrc = fs.readFileSync(path.join(ROOT, 'js/meta/meta-collect.js'), 'utf8');
for (const m of collectSrc.matchAll(/id: '(a_\w+)'/g)) fam2.push('ach.' + m[1], 'ach.' + m[1] + '.d');
Object.keys(P.CFG.enemies).forEach(t => fam2.push('cause.' + t));
Object.keys(P.CFG.bosses || {}).forEach(t => fam2.push('cause.' + t));
(P.CFG.arsenal.weapons || []).forEach(w => fam2.push('item.' + w, 'desc.' + w));
Object.keys(P.CFG.passives).forEach(p => fam2.push('item.' + p));
const m2 = fam2.filter(k => !(k in TR) || !(k in EN)).map(k => k + (k in TR ? '' : ' [noTR]') + (k in EN ? '' : ' [noEN]'));
console.log('families2 checked', fam2.length, 'missing:', m2.length, m2.join(', '));
