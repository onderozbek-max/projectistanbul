// Boot check (AUDIT-6 F2): every DOM id the HUD binds (js/view/ui.js) and every id the flow and screens look up
// (js/main.js, js/view/screens.js, js/view/ui.js) must exist as id="..." in index.html. Exits 1 with the list when not.
// Usage: node prototype/tools/check-ids.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const html = read('index.html');
const have = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));

// The HUD id list: `var IDS = [...]` in ui.js, or the literal array in front of `.forEach(function (id)` (older builds).
const ui = read('js/view/ui.js');
let hudIds = [];
const decl = ui.match(/var IDS = (\[[\s\S]*?\]);/);
const literal = ui.match(/(\[[^\[\]]*\])\s*\.forEach\(function \(id\)/);
if (decl) hudIds = eval(decl[1]);            // a literal array of strings from our own source
else if (literal) hudIds = eval(literal[1]);

const lookups = new Map();                  // id -> files that look it up
function note(id, file) { if (!lookups.has(id)) lookups.set(id, new Set()); lookups.get(id).add(file); }
hudIds.forEach(id => note(id, 'js/view/ui.js (HUD bind)'));
for (const f of ['js/main.js', 'js/view/screens.js', 'js/view/ui.js']) {
  const src = read(f);
  for (const m of src.matchAll(/\$\(\s*'([^']+)'\s*\)/g)) note(m[1], f);
  for (const m of src.matchAll(/getElementById\(\s*'([^']+)'\s*\)/g)) note(m[1], f);
}

const missing = [...lookups.keys()].filter(id => !have.has(id)).sort();
console.log(`ids bound: ${hudIds.length} (HUD) · looked up: ${lookups.size} · in index.html: ${have.size}`);
if (!hudIds.length) { console.log('FAIL: no HUD id list found in js/view/ui.js'); process.exit(1); }
if (missing.length) {
  missing.forEach(id => console.log(`missing id="${id}" <- ${[...lookups.get(id)].join(', ')}`));
  console.log(`FAIL: ${missing.length} id(s) missing from index.html`);
  process.exit(1);
}
console.log('PASS: every looked-up id is in index.html');
