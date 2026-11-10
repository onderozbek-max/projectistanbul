// Hood key check (v0.8, integration follow-up 1): story and bark content is keyed by hood POSITION (H##i#, H##p#, H##b,
// BK.hdNN.S beats of js/dialogue/), but it must belong to the HOOD. For every hood id this checks that its position's keys exist in TR and EN,
// that the hood's own intro line (or first bark) names the hood, that its comic page reads its own lines, and that the
// campfire sits in Aksaray. Loads the non-view scripts of index.html, as check-objective-strings.js does.
// Usage: node prototype/tools/check-hood-keys.js   (exit 1 with the list of problems)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const NOT_LOADED = /^js\/view\/|^js\/main\.js$/;

const store = {};
globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const FILES = [...read('index.html').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(f => !NOT_LOADED.test(f));
FILES.forEach(f => vm.runInThisContext(read(f), { filename: f }));
const P = globalThis.P;

// Words that name each hood in its own text (TR or EN). Checked against the hood's intro line and first bark pool.
const NAME = {
  istiklal: /İstiklal|Istiklal|tram/i, galata: /Galata(?! Köprü| Bridge)/i, karakoy: /Karaköy|Karakoy/i,
  bridge: /Köprü|Bridge/i, eminonu: /Eminönü|Eminonu/i, sirkeci: /Sirkeci/i, kapalicarsi: /Kapal[ıi]çarşı|Bazaar/i,
  beyazit: /Beyazıt|Beyazit/i, laleli: /Laleli/i, aksaray: /Aksaray/i, kumkapi: /Kumkapı|Kumkapi/i,
  yenikapi: /Yenikapı|Yenikapi/i, samatya: /Samatya/i, yedikule: /Yedikule/i, zeytinburnu: /Zeytinburnu/i,
  kazlicesme: /Kazlıçeşme|Kazlicesme/i, bakirkoy: /Bakırköy|Bakirkoy/i, bakirkoysahil: /Sahil|Seaside|promenade/i,
  atakoysahil: /Marina/i, atakoy: /Ataköy|Atakoy|Apartman|apartment|lobby/i,
};

const problems = [];
const pad = n => (n < 10 ? '0' : '') + n;
const J = P.Journey, hoods = J.hoods;
const poolTexts = (lang, key) => (P.DLG[lang] && P.DLG[lang][key] ? P.DLG[lang][key].map(l => l.t) : []);
const lineTexts = id => [poolTexts('tr', id)[0], poolTexts('en', id)[0]].filter(Boolean);

if (hoods.length !== 20) problems.push('expected 20 hoods, found ' + hoods.length);
if (new Set(hoods.map(h => h.id)).size !== hoods.length) problems.push('duplicate hood ids');

hoods.forEach((h, hi) => {
  const p = pad(hi + 1), where = `${h.id} (position ${hi + 1})`;
  if (!NAME[h.id]) { problems.push(`${where}: no NAME keyword in check-hood-keys.js`); return; }
  // 1. Story keys at this position exist in TR and EN.
  ['i1a', 'i2a', 'i3a'].forEach(k => {
    const id = 'H' + p + k, t = lineTexts(id);
    if (t.length < 2) problems.push(`${where}: story line ${id} missing TR or EN`);
  });
  // Hood pops (H##p1..p4) start at hood 5 (levels 21-100); every hood has a boss pop (H##b).
  const need = hi >= 4 ? ['p1', 'p2', 'p3', 'p4', 'b'] : ['b'];
  need.forEach(k => {
    const id = 'H' + p + k;
    if (!P.Dialogue.has(id)) problems.push(`${where}: story line ${id} missing`);
  });
  // 2a. The boss name banner key of this hood (boss.<id>, copied from spk.b.<id> in strings-journey.js) exists in TR and EN.
  ['tr', 'en'].forEach(lang => {
    if (!P.STR[lang] || !P.STR[lang]['boss.' + h.id]) problems.push(`${where}: boss.${h.id} name missing in ${lang}`);
  });
  // 2b. Bark pools for this position exist in both languages (5 stages each).
  ['tr', 'en'].forEach(lang => {
    for (let s = 1; s <= 5; s++) {
      const key = 'BK.hd' + p + '.' + s;
      if (poolTexts(lang, key).length < 2) problems.push(`${where}: bark pool ${key} missing or short in ${lang}`);
    }
  });
  // 3. The hood names itself: its intro line or its first bark pool mentions the hood.
  const named = [...lineTexts('H' + p + 'i1a'), ...poolTexts('tr', 'BK.hd' + p + '.1'), ...poolTexts('en', 'BK.hd' + p + '.1')]
    .some(t => t && NAME[h.id].test(t));
  if (!named) problems.push(`${where}: neither H${p}i1a nor BK.hd${p}.1 names the hood (content may be under the wrong position)`);
  // 4. The hood's comic page reads lines of this position.
  const page = P.Story && P.Story.pages && P.Story.pages['hood_' + h.id];
  if (!page) { problems.push(`${where}: no hood_${h.id} comic page`); return; }
  if (page.hood !== hi) problems.push(`${where}: comic page hood index ${page.hood} != ${hi}`);
  page.panels.forEach((panel, pi) => {
    panel.it.filter(x => x[0] !== 'c' || /^H\d\d/.test(x[1])).forEach(x => {
      if (x[1] && /^H\d\d/.test(x[1]) && x[1].indexOf('H' + p + 'i' + (pi + 1)) !== 0) {
        problems.push(`${where}: comic panel ${pi + 1} reads ${x[1]}`);
      }
    });
  });
});

// 5. No orphan positional keys: every H## story line and BK.hdNN pool belongs to position 1..20.
Object.keys(P.DLG.beats).forEach(id => {
  const m = /^H(\d\d)[ibp]/.exec(id) || /^H(\d\d)b$/.exec(id);
  if (m && (+m[1] < 1 || +m[1] > hoods.length)) problems.push('orphan story line ' + id);
});
['tr', 'en'].forEach(lang => Object.keys(P.DLG[lang] || {}).forEach(key => {
  const m = /^BK\.hd(\d\d)\./.exec(key);
  if (m && (+m[1] < 1 || +m[1] > hoods.length)) problems.push(`orphan bark pool ${lang} ${key}`);
}));

// 6. Level-pinned beats: the campfire is the Aksaray stage-4 mid beat (L54), and L49 is no longer a campfire.
const L54 = J.level(54);
if (L54.hood.id !== 'aksaray' || L54.stage !== 4) problems.push(`L54 is ${L54.hood.id} stage ${L54.stage}, expected aksaray stage 4`);
const mid54 = P.Story.beat(54, 'mid');
if (!mid54 || mid54.kind !== 'page' || mid54.id !== 'campfire') problems.push('L54 mid beat is not the campfire page');
const mid49 = P.Story.beat(49, 'mid');
if (mid49 && mid49.kind === 'page') problems.push('L49 still opens the campfire page');

// 7. Per-hood tables keyed by id name real hoods.
const idSet = new Set(hoods.map(h => h.id));
Object.keys(P.CFG && P.CFG.enemyRosterAdds || {}).forEach(k => { if (!idSet.has(k)) problems.push('enemyRosterAdds key is not a hood id: ' + k); });

// 8. The journey boss field of a hood is its runtime archetype (bossByHood, config-bosses.js; R1-B4).
hoods.forEach(h => {
  const rt = P.CFG && P.CFG.bossByHood && P.CFG.bossByHood[h.id];
  if (!rt) problems.push('no bossByHood entry for ' + h.id);
  else if (h.boss !== rt) problems.push(`journey boss of ${h.id} is ${h.boss}, runtime bossByHood is ${rt}`);
});

console.log(`hood keys: ${hoods.length} hoods · story beats ${Object.keys(P.DLG.beats).filter(k => /^H\d\d/.test(k)).length} · bark beats ${Object.keys(P.DLG.beats).filter(k => /^BK\.hd/.test(k)).length}`);
if (problems.length) { console.log('FAIL'); problems.forEach(x => console.log(' - ' + x)); process.exit(1); }
console.log('PASS: every hood keeps its story, bark, comic and roster content');
