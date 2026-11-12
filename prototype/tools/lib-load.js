// Shared loader for the dialogue tools: runs the non-view scripts of index.html in this process and returns P.
// Used by dialogue-export.js and dialogue-import.js (and available to other node tools).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const NOT_LOADED = /^js\/view\/|^js\/main\.js$|^js\/meta\/meta-(ui|map|gear|stats|tree|arsenal)\.js$/;
function loadP() {
  const store = {};
  globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1])
    .filter(f => !NOT_LOADED.test(f) && fs.existsSync(path.join(ROOT, f)))
    .forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
  return globalThis.P;
}
module.exports = { loadP, ROOT };
