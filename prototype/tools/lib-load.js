// Shared index.html script order for Node tools. loadP runs the non-view scripts with in-memory storage.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const NOT_LOADED = /^js\/view\/|^js\/main\.js$|^js\/meta\/meta-(ui|map|gear|stats|tree|bond-ui|arsenal)\.js$/;
function indexScripts() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  return [...html.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
}
function loadP() {
  const store = {};
  globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
  indexScripts()
    .filter(f => !NOT_LOADED.test(f) && fs.existsSync(path.join(ROOT, f)))
    .forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
  return globalThis.P;
}
module.exports = { indexScripts, loadP, ROOT };
