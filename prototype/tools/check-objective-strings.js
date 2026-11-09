// Objective string check (AUDIT-7 item 7): every key the objective HUD reads, and every title, line, goal and marker key
// the sim can emit, must have a non-empty TR and EN string in P.STR (js/strings*.js). The check loads the same scripts as
// test-meta.js (index.html minus views, story and the meta panels), runs the real sim on levels 2..100, forces the
// mid-run states (defend upload, escort lost) and reads marker keys from item.label, as objectives-hud.js does.
// Usage: node prototype/tools/check-objective-strings.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const NOT_LOADED = /^js\/(view|story)\/|^js\/main\.js$|^js\/meta\/meta-(ui|map|gear|stats|arsenal)\.js$/;

// A node-side localStorage, as in test-meta.js (meta-save.js reads it at call time).
const store = {};
globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const FILES = [...read('index.html').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(f => !NOT_LOADED.test(f));
FILES.forEach(f => vm.runInThisContext(read(f), { filename: f }));
const P = globalThis.P;

// key -> where it was found (the first place wins, for the message).
const need = new Map();
const want = (key, from) => { if (!need.has(key)) need.set(key, from); };
const problems = [];

// 1. Literal keys the HUD reads (obj.*, hmod.*, unlock.*, res.*, ui.res.*). Keys built at run time are covered below.
const hudSrc = read('js/view/objectives-hud.js');
for (const m of hudSrc.matchAll(/'((?:obj|hmod|unlock|hc|res|ui\.res)\.[A-Za-z0-9_.]*[A-Za-z0-9])'/g)) want(m[1], 'objectives-hud.js');
// The marker key is read from item.label (the kind is only the fallback for civilians).
if (!/\.label\b/.test(hudSrc)) problems.push('objectives-hud.js does not read item.label for world markers');

// 2. Run-time keys from the sim: the status line and title, the mid-run lines, the results row, the star goals, the
//    markers, the unlock-preview kinds and the in-run modifier names.
const N = P.Journey.count();
let objLevels = 0;
for (let i = 2; i <= N; i++) {
  const id = P.Objectives.forLevel(P.Journey.level(i));
  const s = P.createSim(1000 + i, { levelIndex: i, loadout: { modifiers: [] } });
  P.startPlay(s);
  const where = 'level ' + i + ' (' + id + ')';
  if (!id) continue;
  if (!s.obj) { problems.push('no objective attached on ' + where); continue; }
  objLevels++;
  const add = st => { if (st) { want(st.title, where); want(st.line, where); } };
  add(P.Objectives.status(s));
  add(P.Objectives.results(s));
  if (s.obj.kind === 'defend') { s.obj.b.up = 0.5; add(P.Objectives.status(s)); s.obj.b.up = 0; }
  if (s.obj.kind === 'escort') { s.obj.civ.alive = false; add(P.Objectives.status(s)); }
  P.Objectives.goals(s, true).forEach(g => want(g.key, where));
  if (P.Objectives.status(s)) want('obj.goal.' + P.Objectives.status(s).id, where);
  P.Objectives.items(s).forEach(it => want('obj.marker.' + (it.label || it.kind), where + ' marker ' + (it.label || it.kind)));
  const mod = P.Modifiers && P.Modifiers.forLevel ? P.Modifiers.forLevel(P.Journey.level(i)) : null;
  if (mod) want('hmod.' + mod.id + '.name', where);
}
for (let i = 1; i < N; i++) P.Progress.unlockPreview(i).forEach(u => want('unlock.kind.' + u.kind, 'unlock preview ' + i));
if (!objLevels) problems.push('no level produced an objective');

// 3. Every wanted key needs a TR and an EN string.
for (const [key, from] of need) {
  for (const lang of ['tr', 'en']) {
    const v = P.STR[lang] && P.STR[lang][key];
    if (typeof v !== 'string' || !v.length) problems.push('missing ' + lang + ' "' + key + '" <- ' + from);
  }
}

console.log('objective strings: ' + need.size + ' keys over ' + objLevels + ' levels (TR and EN each)');
if (process.argv.includes('--list')) [...need.keys()].sort().forEach(k => console.log('  key ' + k));
problems.forEach(p => console.log('  ' + p));
console.log(problems.length ? 'FAIL: ' + problems.length + ' problem(s)' : 'PASS: every objective key has TR and EN text');
process.exitCode = problems.length ? 1 : 0;
