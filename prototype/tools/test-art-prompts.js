'use strict';
// Checks the generated ChatGPT art prompts (art/commission/chatgpt/prompts/) and the tracker: every prompt stands alone, names a
// unique save-as file, carries the style, background and negative blocks, uses only allowed canvas sizes, and the batches cover
// every enemy type, boss, hood and weapon in the game's config. Run the generators first:
//   node tools/gen-art-prompts-characters.js && node tools/gen-art-prompts-world.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..');
const PROMPTS = path.join(ROOT, 'art', 'commission', 'chatgpt', 'prompts');
const TRACKER = path.join(ROOT, 'art', 'commission', 'TRACKER.csv');
let fails = 0, checks = 0;
function ok(c, m) { checks++; if (!c) { fails++; console.log('FAIL ' + m); } }

['js/config.js', 'js/config-weapons.js', 'js/config-levels.js', 'js/config-enemies3.js', 'js/config-bosses.js', 'js/config-enemies5.js',
  'js/config-weapons2.js', 'js/config-weapons3.js', 'js/config-weapon-tiers.js', 'js/journey.js'].forEach(f => {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'prototype', f), 'utf8'), { filename: f });
});
const P = globalThis.P, CFG = P.CFG;

const files = [];
(function walk(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.md') && !/^ORDER-/.test(e.name)) files.push(p);
  });
})(PROMPTS);
ok(files.length >= 400, 'at least 400 prompt files exist (got ' + files.length + '): run the two generators first');

const SIZES = ['1024 x 1024', '1024 x 1536', '1536 x 1024'];
const BANNED = /\b(nike|adidas|coca[- ]?cola|pepsi|starbucks|mcdonald|galatasaray|fenerbah|be[sş]ikta[sş]|turkcell|apple logo|disney|marvel|pokemon|ghibli)\b/i;
const saveAs = new Map(), byBatch = {};
files.forEach(f => {
  const rel = path.relative(PROMPTS, f), s = fs.readFileSync(f, 'utf8');
  const m = /Save as \| `art\/commission\/in\/([^/]+)\/([^`]+)\.png`/.exec(s);
  ok(!!m, rel + ': has a Save as line');
  if (!m) return;
  const batch = m[1], file = m[2];
  ok(batch === '00-style' ? /^F[123]$/.test(file) : /^[a-z0-9_]+$/.test(file), rel + ': file name is lowercase letters, digits and underscores (F1 to F3 for the style lock) (' + file + ')');
  ok(!saveAs.has(batch + '/' + file), rel + ': save-as path is unique (' + batch + '/' + file + ')');
  saveAs.set(batch + '/' + file, rel);
  byBatch[batch] = (byBatch[batch] || 0) + 1;
  const blk = /## Paste this into ChatGPT\s+```text\n([\s\S]*?)\n```/.exec(s);
  ok(!!blk, rel + ': has a paste block');
  if (!blk) return;
  const msg = blk[1];
  ok(msg.length >= 900 && msg.length <= 6500, rel + ': paste block length is between 900 and 6500 characters (' + msg.length + ')');
  ok(/Do not include:/.test(msg), rel + ': paste block carries the negative block');
  ok(/Generate the image now\. Do not ask me questions\./.test(msg), rel + ': paste block ends with the generate line');
  ok(/#14151F/.test(msg), rel + ': paste block names the ink colour');
  ok(/Ink & Tea|joints and cracks|ink line/i.test(msg), rel + ': paste block carries the style');
  ok(SIZES.some(z => msg.indexOf(z.replace(' x ', ' x ')) >= 0 || msg.indexOf(z.replace(/ x /, 'x')) >= 0), rel + ': paste block names an allowed canvas size');
  ok(!/\bTODO\b|\bTBD\b|undefined|NaN|\[object|\{\{|\}\}/.test(msg), rel + ': no placeholder leftovers');
  ok(!BANNED.test(msg), rel + ': no real brand names');
  const ground = /^10-ground-/.test(batch) || /^12-facades-/.test(batch) || batch === '00-style';
  if (!ground) ok(/#FF00FF|#00FFFF/.test(msg), rel + ': characters, props and items name a flat key colour');
  ok(/## Accept the image only if\n(- \[ \] .+\n){4,}/.test(s), rel + ': at least four accept checks');
  ok(/## If it fails\n- /.test(s), rel + ': has a failure reply');
});

// Coverage against the game's config.
const has = (batch, re) => files.some(f => f.indexOf('/' + batch + '/') >= 0 && re.test(path.basename(f)));
const enemies = Object.keys(CFG.enemies || {}).filter(k => !/^boss/.test(k));
ok(enemies.length >= 16, 'config lists the enemy types (' + enemies.length + ')');
['walker', 'runner', 'crawler', 'diner', 'kurye', 'copci', 'marti', 'cayci', 'spitter', 'zehirli', 'brute', 'bloater', 'screamer', 'hardhat', 'kasap', 'parkur']
  .forEach(id => { ok(has('02-enemies', new RegExp('enm_' + id + '_(a_)?base|enm_' + id + '_[a-z0-9]*_?base')), 'enemy ' + id + ' has a base design prompt'); ok(has('02-enemies', new RegExp('enm_' + id + '.*sheet')), 'enemy ' + id + ' has a pose sheet prompt'); });
const hoods = P.Journey.hoods.map(h => h.id);
ok(hoods.length === 20, 'journey has 20 hoods (' + hoods.length + ')');
hoods.forEach(id => {
  ok(fs.existsSync(path.join(PROMPTS, '10-ground-' + id)), 'ground prompts exist for ' + id);
  ok(fs.existsSync(path.join(PROMPTS, '11-props-' + id)), 'prop prompts exist for ' + id);
  ok(fs.existsSync(path.join(PROMPTS, '12-facades-' + id)), 'facade prompts exist for ' + id);
  ok(has('10-ground-' + id, /_a\.md$/) && has('10-ground-' + id, /_d\.md$/), 'ground ' + id + ' has variants A to D');
});
const weapons = Object.keys(CFG.weapons || {});
ok(weapons.length >= 17, 'config lists the weapons (' + weapons.length + ')');
const evolutions = Object.keys(CFG.evolutions || {});
weapons.filter(id => evolutions.indexOf(id) < 0).forEach(id => { ok(has('20-weapons', new RegExp('wpn_' + id + '_icon')) && has('20-weapons', new RegExp('wpn_' + id + '_tiers')), 'weapon ' + id + ' has an icon prompt and a tier sheet prompt'); });
evolutions.forEach(id => { ok(has('20-weapons', new RegExp('wpn_evo_' + id + '\\.md')), 'evolution ' + id + ' has a prompt'); });
['00-style', '01-hero', '03-bosses', '13-vehicles', '21-pickups-effects'].forEach(b => ok((byBatch[b] || 0) > 0, 'batch ' + b + ' has prompts'));
ok((byBatch['00-style'] || 0) === 3, 'the style lock has three prompts (F1, F2, F3)');
ok(fs.existsSync(path.join(PROMPTS, 'ORDER-characters.md')) && fs.existsSync(path.join(PROMPTS, 'ORDER-world.md')), 'both ORDER files exist');

// Tracker.
const rows = fs.readFileSync(TRACKER, 'utf8').split('\n').slice(1).filter(Boolean);
ok(rows.length === files.length, 'tracker has one row per prompt file (' + rows.length + ' rows, ' + files.length + ' files)');
const ids = new Set(rows.map(r => r.split(',')[0]));
ok(ids.size === rows.length, 'tracker ids are unique');
rows.forEach(r => { const c = r.split(','); ok(c.length >= 6 && /^(todo|generated|approved|rejected)$/.test(c[5]), 'tracker row has a valid status: ' + c[0]); ok(fs.existsSync(path.join(ROOT, c[4])), 'tracker prompt file exists: ' + c[4]); });

console.log('art prompt tests: ' + (checks - fails) + ' checks passed, ' + fails + ' failed (' + files.length + ' prompts)');
process.exit(fails ? 1 : 0);
