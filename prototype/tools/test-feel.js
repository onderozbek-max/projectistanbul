// T4 feel rules that can be checked without a canvas: one hit-stop limiter at the design-system.md section 7 values,
// none for ordinary hits, and nothing at all when Reduce motion is on (main.js drops P.HitStop; checked in the source).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fails = 0, clock = 1000;
function ok(c, m) { if (!c) { fails++; console.log('FAIL ' + m); } }
const ctx = { performance: { now: () => clock }, Math, console, window: {}, document: undefined };
ctx.P = { Settings: { reduceMotion: false }, Fx: { cam: {} }, goreRGB: () => '0,0,0', CFG: {} };
vm.createContext(ctx);
['js/config-feel.js', 'js/view/feel.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }));
const P = ctx.P, K = P.CFG.feel2.hitStop;
ok(K.heavy === 0.04 && K.boss === 0.06 && K.critKill === 0.06 && K.minGap === 0.25, 'hit-stop values match design-system.md section 7');
P.Feel.reset && P.Feel.reset();
P.HitStop = 0; P.Feel.hitStop('heavy'); ok(P.HitStop === 0.04, 'heavy hit-stop is 40 ms');
P.HitStop = 0; clock += 100; P.Feel.hitStop('boss'); ok(P.HitStop === 0, 'a second hit-stop within 0.25 s is dropped');
clock += 200; P.Feel.hitStop('boss'); ok(P.HitStop === 0.06, 'boss hit-stop is 60 ms after the gap');
P.HitStop = 0; clock += 300; P.Feel.hitStop('critKill'); ok(P.HitStop === 0.06, 'crit kill hit-stop is 60 ms');
let n = 0; for (let i = 0; i < 100; i++) { clock += 50; P.HitStop = 0; P.Feel.hitStop('heavy'); if (P.HitStop) n++; }
ok(n <= 21, 'at most 4 hit-stops per second under a stream of heavy hits (got ' + n + ' in 5 s)');
const main = fs.readFileSync(path.join(ROOT, 'js/main.js'), 'utf8');
ok(/if \(!P\.Settings\.reduceMotion\) hitStop = Math\.max\(hitStop, P\.HitStop\)/.test(main), 'main.js ignores P.HitStop under Reduce motion');
ok(!/hitStopCritKill|hitStopMinGap/.test(fs.readFileSync(path.join(ROOT, 'js/config.js'), 'utf8')), 'no unused hit-stop keys in config.js');
console.log(fails ? fails + ' failure(s)' : 'test-feel: all pass');
process.exit(fails ? 1 : 0);
