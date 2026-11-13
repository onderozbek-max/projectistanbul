// Progress UI checks (T4 part 5; docs/retention.md sections 3 and 4; docs/design-system.md 4, 5, 7, 13). Static: the new
// files and their wiring, the 600-line limit, the "// TR owner check" comments, the term collisions (Lv, Bölüm, Aşama,
// chapter), the ids the views read and the sim formulas the power strip mirrors. VM: the strings exist in TR and EN, the
// "Your power" numbers are the ones P.createSim applies, and the next-unlock, Street Cred and partial-km readouts hold.
// No browser: the DOM parts are checked as source. Usage: node prototype/tools/test-progress-ui.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const code = f => read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');   // source without comments
const fails = [], notes = [];
let passes = 0;
function check(cond, msg) { if (cond) passes++; else fails.push(msg); }
const near = (a, b) => Math.abs(a - b) < 1e-9;
const NEW_JS = ['js/meta/meta-progress.js', 'js/strings-progress-ui.js', 'js/view/ui-progress.js'];
const TOUCHED = ['js/view/ui.js', 'js/view/screens.js', 'js/view/hood-card.js', 'js/meta/meta-ui.js', 'js/meta/meta-data.js', 'js/main.js'];

// ---- files exist, and every owned file stays within 600 lines (AGENTS.md) ----
NEW_JS.concat(['css/progress.css']).forEach(f => check(fs.existsSync(path.join(ROOT, f)), f + ' exists'));
const owned = [].concat(
  fs.readdirSync(path.join(ROOT, 'js')).filter(n => /^strings.*\.js$/.test(n)).map(n => 'js/' + n),
  fs.readdirSync(path.join(ROOT, 'js/meta')).filter(n => /\.js$/.test(n)).map(n => 'js/meta/' + n),
  fs.readdirSync(path.join(ROOT, 'js/view')).filter(n => /^(ui|screens|objectives-hud)/.test(n)).map(n => 'js/view/' + n),
  fs.readdirSync(path.join(ROOT, 'css')).filter(n => /\.css$/.test(n)).map(n => 'css/' + n),
  ['index.html'], TOUCHED);
[...new Set(owned)].forEach(f => {
  const n = read(f).replace(/\n$/, '').split('\n').length;
  check(n <= 600, `${f} is ${n} lines (600 max)`);
});

// ---- the meta layer reads the config and the sim's functions; it restates no number ----
const mp = code('js/meta/meta-progress.js');
check(!/0\.0\d|\b450\b|1\.35|\b500\b/.test(mp), 'meta-progress.js restates no config number (it reads P.Power, P.Stats and P.Meta)');
check(/(P\.Stats|St)\.effects\(lo\.stats\)/.test(mp) && /Pw\.gearTotal\(M\.gearItems\(\)\)/.test(mp) && /M\.loadout\(\)/.test(mp),
  'meta-progress.js: the power strip reads the loadout, the gear total and the attribute effects the sim is given');
// the sim formulas the strip mirrors (sim.js applyLoadout and attrFx): if the sim changes, this fails and the strip follows
const simCode = code('js/sim/sim.js');
check(/h\.baseMight = \(g\.mightPct \|\| 0\) \+ f\.mightPct/.test(simCode), 'sim.js: baseMight = gear mightPct + attribute mightPct (the strip mirrors this)');
check(/h\.maxHp = C\.hero\.maxHp \* \(1 \+ \(g\.maxHpPct \|\| 0\) \+ f\.maxHpPct \+ \(\(ld && ld\.bondHpPct\) \|\| 0\)\)/.test(simCode),
  'sim.js: maxHp = base x (1 + gear + attribute + bond aura) (the strip mirrors this)');
check(/P\.Stats\.effects\(levels\)/.test(simCode) && /o\.loadout\.stats/.test(simCode), 'sim.js: attribute effects come from P.Stats.effects on the loadout stats');

// ---- wiring: index.html order and the hooks each view calls ----
const html = read('index.html');
const at = s => html.indexOf(s);
check(at('css/progress.css') > at('css/hood.css') && at('css/progress.css') > 0, 'index.html: css/progress.css after css/hood.css');
check(at('js/strings-progress-ui.js') > at('js/strings-horde.js') && at('js/strings-progress-ui.js') > 0, 'index.html: strings-progress-ui.js after strings-horde.js');
check(at('js/meta/meta-progress.js') > at('js/meta/meta-power.js') && at('js/meta/meta-progress.js') > 0, 'index.html: meta-progress.js after meta-power.js (it reads P.Power at load)');
check(at('js/view/ui-progress.js') > at('js/view/ui-motion.js') && at('js/view/ui-progress.js') < at('js/view/screens.js') && at('js/view/ui-progress.js') > 0,
  'index.html: ui-progress.js after ui-motion.js (countUp, leave) and before screens.js');
[['js/view/ui.js', 'P.UIProgress.init()'], ['js/view/ui.js', 'P.UIProgress.reset()'], ['js/view/ui.js', 'P.UIProgress.hud(s)'],
 ['js/view/ui.js', 'P.UIProgress.levelUp()'], ['js/view/ui.js', 'P.UIProgress.tick(dt)'], ['js/view/ui.js', "P.t('ui.hud.lv'"],
 ['js/main.js', 'P.UIProgress.queueLevelUp(sim, card)'], ['js/main.js', 'P.Meta.progress().kmShown'], ['js/main.js', 'streak: sim.tally.maxStreak'],
 ['js/view/screens.js', 'P.UIProgress.results(r)'], ['js/view/screens.js', "$('cards-title')"], ['js/view/hood-card.js', 'P.UIProgress.hoodNode(li)'],
 ['js/meta/meta-ui.js', 'P.UIProgress.powerHtml()'], ['js/meta/meta-ui.js', 'P.UIProgress.unlockText('], ['js/meta/meta-ui.js', 'setKm(v.kmShown)'],
 ['js/meta/meta-ui.js', 'tweenKm(b0.kmShown, b1.kmShown, 1400)'], ['js/meta/meta-ui.js', 'setKm(b0.kmShown)'], ['js/meta/meta-ui.js', 'setKm(p.after.kmShown)'],
 ['js/meta/meta-data.js', 'kmShown: km + (next - km) * frac'], ['js/meta/meta-data.js', 'kmWalked: snap.km, kmShown: snap.kmShown']
].forEach(([f, s]) => check(code(f).indexOf(s) >= 0, `${f} must contain ${s}`));
check(code('js/view/ui-progress.js').indexOf('P.UI && P.UI.isOverlay && P.UI.isOverlay()') >= 0, 'ui-progress.js: the banner waits while an overlay is up');
check(!/ui\.hud\.level|ui\.res\.labelHood|ui\.res\.runLevel|ui\.cards\.title/.test(code('js/view/screens.js') + code('js/view/ui.js')),
  'screens.js and ui.js no longer read the retired keys (ui.hud.level, ui.res.labelHood, ui.res.runLevel, ui.cards.title)');

// ---- term collisions: Lv is the in-run and item level; Bölüm is the journey level; a hood is never a chapter ----
const allJs = [];
(function walk(d) { fs.readdirSync(d).forEach(n => { const p = path.join(d, n); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.js$/.test(n)) allJs.push(path.relative(ROOT, p)); }); })(path.join(ROOT, 'js'));
const liveCode = allJs.map(code).join('\n');
check(!/'ui\.hud\.level'|'ui\.res\.labelHood'|'ui\.res\.runLevel'|'ui\.cards\.title'|'meta\.level'|'meta\.nextLine'|'İstanbul'/.test(liveCode),
  'a retired key or the literal "İstanbul" is still used in code');
const progCode = ['js/view/ui-progress.js', 'js/meta/meta-progress.js', 'js/strings-progress-ui.js', 'js/view/hood-card.js', 'js/meta/meta-ui.js',
  'js/view/screens.js', 'js/view/ui.js'].map(code).join('\n');
check(!/chapter/i.test(progCode), 'the progress code never says "chapter" (a hood is a district; a journey level is a level)');
// The chapter is "Kısım" in TR (T4 part 8). "Bölüm" with a capital B is a journey level, so it may not stand for the chapter in
// the finale or the title. The lower-case "bölüm" in the finale's stat rows counts levels and is allowed.
const finaleSrc = read('js/story/strings-finale.js');
check(!/BÖLÜM|Bölüm/.test(finaleSrc), 'strings-finale.js: TR never says "Bölüm" for the chapter (the chapter is "Kısım"; "bölüm" is a level)');
check(!/Bölüm\s+\d|BÖLÜM\s+\d/.test(read('js/strings.js')), 'strings.js: no "Bölüm N" chapter title (the title reads "Kısım 1")');
const htmlHud = read('index.html');
check(htmlHud.indexOf('id="sk-meter"') > htmlHud.indexOf('class="hud-xp"') && htmlHud.indexOf('id="sk-meter"') < htmlHud.indexOf('class="hud-sub"'),
  'index.html: Street Cred starts in the XP line (settings.js moves it to HUD row 2 at 150% text)');
check(/textSize >= 150 \? sub : xp/.test(read('js/view/settings.js')), 'settings.js: Street Cred moves to HUD row 2 at 150% text (the XP bar keeps 120 px at 150%)');

// ---- the ids the views read exist in index.html ----
const idsUsed = new Set(['sk-meter', 'sk-label', 'sk-fill', 'lvl-banner', 'lvl-title', 'lvl-line', 'res-power', 'res-recap', 'res-run', 'res-label', 'cards-title']);
['js/view/ui-progress.js', 'js/view/screens.js'].forEach(f => { for (const m of code(f).matchAll(/\$\('([\w-]+)'\)/g)) idsUsed.add(m[1]); });
idsUsed.forEach(id => check(html.indexOf(`id="${id}"`) >= 0, `index.html has no id="${id}" (a view reads it)`));

// ---- VM: the real game scripts (lib-load runs the non-view scripts in index.html order), then the progress module ----
const { loadP } = require('./lib-load.js');
const P = loadP();
// the two view files that only define code and strings at load time (no DOM is touched until a screen is built)
['js/view/hood-card.js', 'js/view/ui-progress.js'].forEach(f => vm.runInThisContext(read(f), { filename: f }));
const TR = P.STR.tr, EN = P.STR.en;
// the finale and the title: the TR chapter is "Kısım", the EN chapter stays "Chapter" (T4 part 8)
check(TR['fin.credits.kicker'] === '1. Kısım Sonu' && TR['fin.next.text'] === "2. Kısım · Sarıyer'e Yolculuk.",
  'TR finale (T4 part 9 wording): chapter 1 ends with "1. Kısım Sonu", and the next line reads "2. Kısım · Sarıyer\'e Yolculuk."');
check(TR['hud.skLabel'] === 'Sokak Kredisi {n}, sonraki için {k} öldür' && TR['res.recap.scVal'] === '+{n} · sonraki için {k} öldür',
  'TR Street Cred strings (T4 part 9 wording): the HUD label and the recap value both say "öldür" (kill), not "öldürme"');
check(EN['fin.credits.kicker'] === 'CHAPTER 1 COMPLETE' && /^Chapter 2 · /.test(EN['fin.next.text']), 'EN finale keeps "Chapter"');
check(!/Bölüm/.test(TR['ui.title.proto']), 'TR title (the live value, after strings-journey.js): no "Bölüm" for the chapter');

// strings: every literal key the progress code reads exists in both tables
const usedKeys = new Set();
['js/view/ui-progress.js', 'js/meta/meta-progress.js', 'js/view/screens.js', 'js/view/ui.js', 'js/view/hood-card.js', 'js/meta/meta-ui.js', 'js/main.js']
  .forEach(f => { for (const m of code(f).matchAll(/\b(?:P\.t|tx|t)\(\s*'([^']+)'\s*[,)]/g)) usedKeys.add(m[1]); });
usedKeys.forEach(k => { check(k in TR, `TR has no string for ${k}`); check(k in EN, `EN has no string for ${k}`); });
['hud.skLabel', 'lvb.title', 'lvb.line', 'lvb.lineF', 'prog.powerLabel', 'prog.dmg', 'prog.hp', 'prog.perks', 'prog.gainDmg', 'prog.gainHp',
  'prog.levelN', 'ui.res.labelLevel', 'ui.res.walk', 'res.recap.head', 'res.recap.reached', 'res.recap.sc', 'res.recap.scVal', 'res.recap.power',
  'res.recap.noPower', 'res.recap.next', 'res.recap.retry', 'hc.next'].forEach(k => check(k in TR && k in EN, `progress string ${k} needs TR and EN`));
const psrc = read('js/strings-progress-ui.js');
const trBlock = psrc.slice(psrc.indexOf('Object.assign(P.STR.tr'), psrc.indexOf('Object.assign(P.STR.en'));
// T4 part 9: the owner approved every TR line in this file, so no "// TR owner check" tag is left here (a new unapproved line
// would carry one again)
const tagged = trBlock.split('\n').filter(l => /TR owner check/.test(l));
check(tagged.length === 0, 'strings-progress-ui.js: the owner-approved TR lines carry no "TR owner check" tag: ' + tagged.join(' | '));

// terms in the tables: a hood is never a chapter or Bölüm; the banner is "LEVEL UP"; no range-style HUD values
const HOOD_KEY = /^(meta\.district|meta\.hood\.|hc\.)/;
Object.keys(EN).forEach(k => {
  if (HOOD_KEY.test(k)) check(!/chapter/i.test(EN[k]), `${k}: a hood is never a "chapter" (EN "${EN[k]}")`);
  if (HOOD_KEY.test(k) && TR[k] !== undefined) check(!/bölüm/i.test(TR[k]), `${k}: a hood is never "Bölüm" (TR "${TR[k]}")`);
  if (/^(ui|lvb)\./.test(k)) check(!/Level up/.test(EN[k]), `${k}: the level-up words are "LEVEL UP" (EN "${EN[k]}")`);
});
Object.keys(TR).concat(Object.keys(EN)).forEach(k => {
  if (/^(ui\.hud\.|hud\.)/.test(k)) check(!/\d-\d/.test((TR[k] || '') + (EN[k] || '')), `${k}: no range-style value in the HUD (${TR[k]} / ${EN[k]})`);
});

// exact readouts, English then Turkish
const savedLang = P.lang;
P.lang = 'en';
check(P.t('ui.hud.lv', { n: 3 }) === 'Lv 3', 'the HUD keeps "Lv N"');
check(P.t('lvb.title', { n: 5 }) === 'LEVEL UP · Lv 5', 'the level-up banner reads "LEVEL UP · Lv N"');
check(P.t('ui.res.labelLevel', { n: 12, hood: 'İSTİKLAL' }) === 'LEVEL 12 · İSTİKLAL', 'the results headline reads the journey level');
check(P.t('res.recap.reached', { n: 7, kills: 30, streak: 4 }).indexOf('Reached Lv 7') === 0, 'the recap says "Reached Lv N" for the in-run level');
check(P.t('ui.hud.stage', { s: 2, of: 5 }) === '2/5', 'the HUD stage chip reads stage/of');
P.lang = 'tr';
check(P.t('ui.hud.lv', { n: 3 }) === 'Lv 3', 'the Turkish HUD keeps "Lv N"');
check(P.upper('istiklal') === 'İSTİKLAL', 'P.upper gives Turkish capitals (İ)');
P.lang = savedLang;

// the power strip against the sim: the same loadout goes to P.createSim, and the sim's numbers are the strip's numbers
const lo = P.Meta.loadout(), pw = P.Progress.power();
const sm = P.createSim(7, { levelIndex: 1, loadout: lo });
check(near(sm.hero.baseMight, pw.dmg), `strip damage ${pw.dmg} is not the sim's damage ${sm.hero.baseMight}`);
check(near(sm.hero.maxHp, P.CFG.hero.maxHp * (1 + pw.hp)), `strip HP ${pw.hp} is not the sim's max HP ${sm.hero.maxHp}`);
check(near(pw.dmg, lo.gear.mightPct + P.Stats.effects(lo.stats).mightPct), 'strip damage is the gear mightPct plus the attribute mightPct');
check(near(pw.parts.attr.dmg, P.Stats.effects(lo.stats).mightPct), 'strip attribute part is P.Stats.effects on the loadout stats');
check(P.UIProgress.powerHtml().indexOf('pw-strip') >= 0, 'powerHtml renders the strip');
check(P.UIProgress.powerHtml().indexOf('++') < 0 && /hasar \+\d/.test(P.UIProgress.powerHtml()), 'the strip prints one plus sign per value ("hasar +8%", never "++8%")');

// next unlock: the level after a win, the same level after a loss, nothing after the last
const COUNT = P.Journey.count();
check(P.Progress.nextAfter(COUNT, true) === null, 'the journey ends: no next level after the last one');
check(P.Progress.nextAfter(1, true).index === 2 && P.Progress.nextAfter(5, false).index === 5, 'a win moves on one level; a loss plays the same level again');
const b5 = P.Progress.levelInfo(5);
check(b5.boss === true && b5.hoodN === 1 && b5.stage === P.Journey.levelsPerHood, 'level 5 is the boss stage of district 1');
const u13 = P.UIProgress.unlockText(P.Progress.levelInfo(13));
check(u13.indexOf(P.t('prog.levelN', { n: 13 })) === 0 && u13.indexOf(P.upper(P.Progress.levelInfo(13).hood.name)) >= 0,
  'the next-unlock line names the journey level and the district in capitals');
check(P.UIProgress.unlockText(b5).indexOf(P.t('meta.boss')) >= 0, 'the next-unlock line marks a boss stage');

// Street Cred: the balance never falls as kills come in, the next milestone is always ahead, and it reads the stats
const base = P.Meta.heroStats();
check(P.Progress.streetCred(0).balance === (base.sc | 0), 'Street Cred with no kills this run is the saved balance');
check(P.Progress.streetCred(0).next === P.Stats.scKills(P.Stats.scAt(base.kills | 0) + 1) - (base.kills | 0), 'Street Cred: kills to the next milestone come from P.Stats');
let prev = -1, mono = true, where = '';
for (let k = 0; k <= 3000; k += 25) {
  const sc = P.Progress.streetCred(k);
  if (sc.balance < prev || !(sc.next >= 1) || sc.frac < 0 || sc.frac > 1) { mono = false; where = 'at ' + k + ' kills'; break; }
  prev = sc.balance;
}
check(mono, 'Street Cred is monotonic in kills and its bar stays in 0..1 (' + where + ')');

// partial km: the saved km is the km of the last cleared district; the shown km adds the share of the next district walked
const J = P.Journey, realIsCleared = P.Meta.isCleared;
try {
  P.Meta.isCleared = i => i === 1 || i === 2;   // two of the five levels of district 1
  const sn = P.Meta.snapshot();
  check(sn.done === 0 && near(sn.km, 0), 'partial walk: no district is done, so the saved km stays 0');
  check(near(sn.kmShown, J.hoods[0].km * 2 / J.levelsPerHood), `partial walk: 2 of ${J.levelsPerHood} levels is ${2 / J.levelsPerHood} of the way (is ${sn.kmShown})`);
  check(sn.kmShown > sn.km && sn.kmShown < J.hoods[0].km, 'partial walk: the shown km sits between the saved km and the next district');
  check(P.Meta.progress().kmWalked === sn.km && P.Meta.progress().kmShown === sn.kmShown, 'M.progress carries the saved km and the shown km');
  P.Meta.isCleared = i => i <= J.levelsPerHood;   // district 1 cleared
  const sd = P.Meta.snapshot();
  check(sd.done === 1 && near(sd.km, J.hoods[0].km) && near(sd.kmShown, J.hoods[0].km), 'a cleared district: the saved km and the shown km both sit at its km');
} finally { P.Meta.isCleared = realIsCleared; }

if (!fails.length) notes.push(`power at the start: damage +${(pw.dmg * 100).toFixed(1)}%, HP +${(pw.hp * 100).toFixed(1)}%, ${pw.perks} perks`);
console.log(fails.length ? fails.length + ' failure(s)' : 'test-progress-ui: all pass (' + passes + ' checks)');
notes.forEach(n => console.log('note: ' + n));
fails.forEach(m => console.log('FAIL ' + m));
process.exit(fails.length ? 1 : 0);
