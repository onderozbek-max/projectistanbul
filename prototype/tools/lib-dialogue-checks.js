// Dialogue style checks (BRIEF-DIALOGUE §6 checks 3-7), used by tools/test-dialogue.js.
// Strict for the beats of the review batches that are already written (P.DLG.batches; today A); the beats of later batches are only
// counted as notes, except the guardrail list, which must have zero hits everywhere. Lists live in tools/dialogue-banned.json.
'use strict';
const fs = require('fs'), path = require('path');
const L = JSON.parse(fs.readFileSync(path.join(__dirname, 'dialogue-banned.json'), 'utf8'));
const rx = (re, f) => new RegExp(re, f || 'iu');
const baseLimit = id => (/^BK\./.test(id) || /^flav\./.test(id) ? 60 : 90);
const exceptionsOf = (lg, tag) => ((L.ownerExceptions || {})[lg] || {})[tag] || [];
const SILENT = { 'spk.anne': 1, 'spk.baba': 1, 'spk.ada': 1, 'spk.cap': 1, 'spk.news': 1, 'spk.usta': 1, 'spk.b.atakoy': 1 };
const NO_TIER1 = { 'spk.anne': 1, 'spk.baba': 1, 'spk.ada': 1, 'spk.cap': 1, 'spk.news': 1, 'spk.b.atakoy': 1 };

// A small TR -> EN stem glossary for the pair detector (a heuristic: flags go to review, they are not failures).
const GLOSS = {
  anne: ['mom', 'mum'], baba: ['dad'], yemek: ['eat', 'ate', 'eaten', 'food', 'meal'], yedin: ['ate', 'eat', 'eaten'], mont: ['jacket', 'coat'],
  ayakkab: ['shoes', 'shoe', 'sneakers'], yürü: ['walk', 'walking'], koş: ['run', 'running'], kafa: ['head'], kural: ['rule'], zombi: ['zombie', 'zombies'],
  telefon: ['phone'], sinyal: ['signal'], çubuk: ['bars', 'bar'], simit: ['simit'], dürüm: ['dürüm', 'wrap'], çay: ['tea', 'çay'], bıçak: ['knife', 'blade'],
  usta: ['usta', 'master', 'cook'], tramvay: ['tram'], vatman: ['vatman'], kestane: ['chestnut', 'chestnuts'], elektrik: ['power', 'electricity'],
  ışık: ['light', 'lights'], kaç: ['run', 'escape', 'flee'], dur: ['stop'], yakın: ['close', 'near'], yaklaş: ['approach', 'close', 'closer'],
  geri: ['back'], sakin: ['calm'], tamam: ['okay', 'ok', 'fine'], abi: ['bro', 'man', 'abi', 'pal'], hadi: ['come', 'go', 'let'], bir: ['one', 'a'],
  iki: ['two'], üç: ['three'], ev: ['home', 'house'], eve: ['home'], gel: ['come'], git: ['go'], bak: ['look'], gör: ['see', 'saw'], duy: ['hear', 'heard'],
  söyle: ['say', 'tell'], konuş: ['talk', 'speak'], düşün: ['think'], bekle: ['wait'], bitti: ['over', 'done', 'finished'], geldi: ['came', 'here', 'arrived'],
  gitti: ['gone', 'went'], sonra: ['later', 'then', 'after'], şimdi: ['now'], yine: ['again'], hâlâ: ['still'], bile: ['even'], çok: ['very', 'much', 'so'],
  büyük: ['big', 'huge', 'large'], küçük: ['small', 'little'], iyi: ['good', 'well', 'fine'], kötü: ['bad'], yok: ['no', 'not', 'none'], var: ['have', 'there', 'got'],
  ben: ['i', 'me', 'my'], sen: ['you', 'your'], bu: ['this'], şu: ['that'], o: ['it', 'he', 'she'], ve: ['and'], ama: ['but'], de: ['too', 'also'],
  can: ['health', 'life', 'hp'], seviye: ['level'], nefes: ['breath', 'breathe'], korku: ['fear', 'scared'], kapı: ['door'], araba: ['car', 'cart'],
  sokak: ['street'], yol: ['road', 'way', 'path'], kalabalık: ['crowd'], patron: ['boss'], pusu: ['ambush'], sandık: ['chest'], vapur: ['ferry'],
  iskele: ['pier'], tüp: ['canister', 'tank'], rögar: ['manhole'], tükür: ['spit', 'spat'], bağır: ['scream', 'yell', 'shout'], çığlık: ['scream'], yürüyen: ['walker'],
  koşucu: ['runner'], sürün: ['crawler', 'crawl'], garson: ['waiter'], lokanta: ['restaurant', 'diner'], nazar: ['nazar', 'evil', 'charm'], boncuk: ['bead'],
};
const GKEYS = Object.keys(GLOSS).sort((a, b) => b.length - a.length);
const words = (s, re) => (s.toLowerCase().match(re) || []);
function glossOf(t) {
  const out = new Set();
  words(t, /[a-zçğıöşüâîû]+/g).forEach(w => { const k = GKEYS.find(g => w.indexOf(g) === 0 && (g.length >= 3 || w === g)); if (k) GLOSS[k].forEach(e => out.add(e)); });
  return out;
}
const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'it', 'to', 'of', 'and', 'in', 'on', 'i', 'my', 'me', 'you', 'this', 'that', 'but', 'no', 'not', 'for', 'with', 'be', 'at']);

function run(P, D) {
  const problems = [], notes = [], lg2 = ['tr', 'en'];
  const limitOf = id => (P.DLG.beats[id] && P.DLG.beats[id].max) || baseLimit(id);
  const batch = new Set(Object.keys(P.DLG.batches || {}).reduce((a, k) => a.concat(D.batch(k)), []));
  const ids = Object.keys(P.DLG.beats);
  const strict = id => batch.has(id);
  const loose = { len: 0, ratio: 0, flag: 0, dup: 0 };
  lg2.forEach(lg => {
    const g = (L.guardrail[lg] || []).map(e => [e, rx(e.re)]);
    const f = (L.flag[lg] || []).map(e => [e, rx(e.re), e.except ? rx(e.except) : null]);
    const pr = ['tier1', 'tier2', 'tier3'].map(t => rx(L.profanity[lg][t]));
    const seen = new Map(), count = [0, 0, 0, 0]; let any = 0;
    ids.forEach(id => (P.DLG[lg][id] || []).forEach((e, i) => {
      const t = e.t, tag = `${lg} ${id}#${i}`, st = strict(id), spk = e.spk || P.DLG.beats[id].spk;
      const ex = exceptionsOf(lg, `${id}#${i}`);
      g.forEach(([x, r]) => { const m = r.exec(t); if (m && ex.indexOf(x.id) < 0) problems.push(`${tag}: guardrail ${x.id} "${m[0]}": ${t}`); });
      if (t.length > limitOf(id)) { if (st) problems.push(`${tag}: ${t.length} > ${limitOf(id)} chars: ${t}`); else loose.len++; }
      f.forEach(([x, r, xr]) => { const m = r.exec(t); if (m && !(xr && xr.test(m[0])) && ex.indexOf(x.id) < 0) { if (st) problems.push(`${tag}: ${x.id} "${m[0]}": ${t}`); else loose.flag++; } });
      if (seen.has(t)) { if (st && strict(seen.get(t).id)) problems.push(`${tag}: duplicate of ${seen.get(t).tag}`); else loose.dup++; } else seen.set(t, { tag, id });
      if (st) {
        count[3]++; const hit = pr.map(r => r.test(t));
        hit.forEach((h, k) => { if (h) count[k]++; }); if (hit.some(Boolean)) any++;
        if ((hit[1] || hit[2]) && SILENT[spk]) problems.push(`${tag}: ${spk} never swears (tier 2/3): ${t}`);
        if (hit[0] && NO_TIER1[spk]) problems.push(`${tag}: ${spk} never swears: ${t}`);
      }
    }));
    if (count[3]) {
      if (any / count[3] > 1 / 6) problems.push(`${lg}: ${any} of ${count[3]} batch lines contain profanity (cap one in six)`);
      if (count[1] / count[3] > 0.03) problems.push(`${lg}: tier-2 profanity in ${count[1]} of ${count[3]} batch lines (cap 3%)`);
      if (count[2] / count[3] > 0.005) problems.push(`${lg}: tier-3 profanity in ${count[2]} of ${count[3]} batch lines (cap about 0.5%)`);
    }
    ids.forEach(id => {
      const list = P.DLG[lg][id] || [];
      if (list.length < 4) return;
      if (P.DLG.beats[id].joke === false || P.DLG.beats[id].joke === 0 || P.DLG.beats[id].ratio === 'exempt') return;
      const r = list.filter(e => e.j).length / list.length;
      if (r < 0.15 || r > 0.30) { if (strict(id)) problems.push(`${lg} ${id}: joke ratio ${(r * 100).toFixed(0)}% (needs 15-30%)`); else loose.ratio++; }
    });
  });
  // 6. translation-pair detector: single-line beats whose English words are mostly the gloss of the Turkish words (flags only).
  const pairs = [];
  ids.filter(strict).forEach(id => {
    const a = (P.DLG.tr[id] || []), b = (P.DLG.en[id] || []);
    if (a.length !== 1 || b.length !== 1) return;
    const gl = glossOf(a[0].t), en = words(b[0].t, /[a-zçğıöşüÇĞİÖŞÜ]+/g).filter(w => !STOP.has(w) && w.length > 2);
    if (en.length < 4) return;
    const hit = en.filter(w => gl.has(w)).length / en.length;
    if (hit >= 0.6) pairs.push(`${id} (${(hit * 100).toFixed(0)}%)`);
  });
  if (pairs.length) notes.push('translation-pair flags for review: ' + pairs.join(', '));
  notes.push(`batch lines are strict; later batches pending: ${loose.len} over the limit, ${loose.ratio} pools off-ratio, ${loose.flag} translationese/Britishism flags, ${loose.dup} duplicates`);
  return { problems, notes, batchBeats: batch.size };
}
module.exports = { run };
