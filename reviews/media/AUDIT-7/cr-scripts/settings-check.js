// node /tmp/istanbul-review/settings-check.js : settings.js with stored non-object JSON + OS reduced motion
const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync(require('path').join(__dirname, '../../../../prototype/js/view/settings.js'), 'utf8');
for (const stored of ['null', '5', '"x"', '{}']) for (const reduce of [false, true]) {
  const ctx = { P: {}, Math, JSON, Object, localStorage: { getItem: () => stored, setItem: () => {} } };
  ctx.window = ctx; ctx.matchMedia = () => ({ matches: reduce }); vm.createContext(ctx);
  let err = null; try { vm.runInContext(src, ctx); } catch (e) { err = e.message; }
  console.log('stored', stored.padEnd(4), 'reduceMotion', reduce, err ? 'THROWS: ' + err + ' | applySettings=' + typeof ctx.P.applySettings + ' lang=' + ctx.P.lang : 'ok');
}
