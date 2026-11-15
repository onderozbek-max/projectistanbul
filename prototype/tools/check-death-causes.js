// Death-cause string check (R1-B1): every cause the sim can report must have a TR and an EN string under cause.<key>,
// because the down screen reads P.t('cause.' + s.deathCause) (view/screens.js). Three sources feed the list:
//   1. literal causes in js/sim/*.js (damageHero(..., 'x') and cause: 'x');
//   2. every enemy type and boss archetype (contact and attack causes pass e.type);
//   3. a scripted scene per type: the real sim runs with one enemy (or boss) six metres from a standing hero, and every
//      damageHero cause is recorded (this also catches zone causes such as 'acid' and 'toxic').
// Usage: node prototype/tools/check-death-causes.js [--list]
'use strict';
const fs = require('fs'), path = require('path');
const { loadP, ROOT } = require('./lib-load.js');
const P = loadP();

const causes = new Map();                           // cause key -> where it came from (the first place wins)
const want = (key, from) => { if (!causes.has(key)) causes.set(key, from); };

// 1. Literal causes in the sim source. A damageHero call takes its cause as the last argument.
const simDir = path.join(ROOT, 'js', 'sim');
for (const f of fs.readdirSync(simDir).filter(f => f.endsWith('.js'))) {
  const lines = fs.readFileSync(path.join(simDir, f), 'utf8').split('\n');
  lines.forEach(line => {
    if (line.includes('damageHero(') && !line.includes('damageHero = function')) {
      const m = line.match(/'([A-Za-z]+)'\s*\)/);
      if (m) want(m[1], 'js/sim/' + f);
    }
    for (const m of line.matchAll(/cause:\s*'([A-Za-z]+)'/g)) want(m[1], 'js/sim/' + f);
  });
}

// 2. Enemy types and boss archetypes (e.type is the cause of contact and of boss attacks).
Object.keys(P.CFG.enemies).forEach(t => want(t, 'config enemies'));
Object.keys(P.CFG.bosses).forEach(t => want(t, 'config bosses'));

// 3. Scripted scenes: the real sim, a standing hero, one enemy or boss in front. Every cause that reaches the hero is seen.
const seen = new Set();
const realDamage = P.Combat.damageHero;
P.Combat.damageHero = function (s, raw, cause) {
  if (cause) seen.add(cause);
  return realDamage.apply(this, arguments);
};
function scene(type, steps, boss) {
  const s = P.createSim(4242, { levelIndex: 2, loadout: { modifiers: [] } });
  P.startPlay(s);
  const h = s.hero;
  if (boss) P.Bosses.spawn(s, type, h.x, h.y + 6, { nameKey: 'boss.' + type, hoodIdx: 0, skin: 'waiter', hoodId: null });
  else P.Combat.spawnEnemy(s, type, h.x, h.y + 6, { skin: 'waiter' });
  for (let k = 0; k < steps && s.mode !== 'dead'; k++) P.stepSim(s, 1 / 60);
}
Object.keys(P.CFG.enemies).forEach(t => scene(t, 900, false));           // 15 s each
Object.keys(P.CFG.bosses).forEach(t => scene(t, 2400, true));           // 40 s each: windups, phases, summons
P.Combat.damageHero = realDamage;
seen.forEach(k => want(k, 'scripted scene'));

// 4. Every cause needs a non-empty TR and EN string.
const problems = [];
for (const [key, from] of [...causes].sort((a, b) => a[0] < b[0] ? -1 : 1)) {
  for (const lang of ['tr', 'en']) {
    const v = P.STR[lang] && P.STR[lang]['cause.' + key];
    if (typeof v !== 'string' || !v.length) problems.push('missing ' + lang + ' "cause.' + key + '" <- ' + from);
  }
}

// 5. The down screen shows tip.<cause> (screens.js), so every enemy type needs its own tip in both languages (R1-B5).
Object.keys(P.CFG.enemies).forEach(t => {
  for (const lang of ['tr', 'en']) {
    const v = P.STR[lang] && P.STR[lang]['tip.' + t];
    if (typeof v !== 'string' || !v.length) problems.push('missing ' + lang + ' "tip.' + t + '" (down-screen tip for an enemy type)');
  }
});

console.log('death causes: ' + causes.size + ' keys (sim source, config, scripted scenes; TR and EN each)');
if (process.argv.includes('--list')) [...causes.keys()].sort().forEach(k => console.log('  cause ' + k + ' <- ' + causes.get(k)));
problems.forEach(p => console.log('  ' + p));
console.log(problems.length ? 'FAIL: ' + problems.length + ' problem(s)' : 'PASS: every cause the sim can report has TR and EN text');
process.exitCode = problems.length ? 1 : 0;
