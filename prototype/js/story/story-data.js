// Story beats and comic pages (workstream G, v0.4). P.Story.beat(level, when) says what happens at a level moment
// (when: intro | start | mid | boss | end). P.Story.play runs a beat through P.Comic. P.Story.pages holds the pages.
// P.Story.forLine maps a line id to its portrait, side and mood. Levels 1..100 come from journey.js: hood =
// floor((level - 1) / 5), stage 1..5, stage 5 is the boss. Beat results: {kind:'page', id} | {kind:'pop', line, opts}
// | {kind:'call', who, lines, opts:{bars}}. L30's call is a post-fight page; the other calls play at run start.
P.Story = (function () {
  var S = {}, PAD = function (n) { return n < 10 ? '0' + n : '' + n; };
  // Lines shown as Arda's thoughts (thought bubbles) rather than speech.
  var THINK = { O1b: 1, O1c: 1, O1d: 1, E5c: 1, E30c: 1, L02m: 1, FNb: 1, H03i1b: 1, H13i3a: 1, H15i2a: 1, H17i2a: 1, H18i2a: 1, H20i2a: 1 };
  // Mood and importance overrides by line id. Speaker keys set the portrait and side.
  var MOOD = { s2: 'happy', s3: 'scared', s4: 'shout', rule1: 'determined', rule2: 'scared', pardon: 'sad',
    E25a: 'grief', E25b: 'sad', E25c: 'steady', E25cover: 'sad', E25market: 'grief',
    barkGrab: 'determined', barkAttack: 'scared', barkDoor: 'determined', barkChestnut: 'happy', barkElite: 'scared',
    barkRunners: 'shout', barkShop: 'shout', callA2: 'sad', callB1: 'scared', callB3: 'sad', callC1: 'scared',
    callD1: 'sad', exit1: 'sad', exit2: 'scared', L18s: 'shout', H04i2a: 'scared', FNd: 'scared' };
  var IMPORTANT = { s4: 1, barkElite: 1, exit1: 1, exit2: 1 };
  var SPK = {
    'spk.arda': { who: 'arda', side: 'l' }, 'spk.phone': { who: null, side: 'l', mood: 'neutral' },
    'spk.anne': { who: 'anne', side: 'r' }, 'spk.baba': { who: 'baba', side: 'r' }, 'spk.usta': { who: 'usta', side: 'r' },
    // The diner in the cold open is not Kaan; they meet on the bridge at L20.
    'spk.friend': { who: 'stranger', side: 'r' }, 'spk.kaan': { who: 'kaan', side: 'r' },
    'spk.news': { who: 'news', side: 'r', mood: 'shout' },
    'spk.shop': { who: 'shopkeeper', side: 'r' }, 'spk.shopkeeper': { who: 'shopkeeper', side: 'r' },
    'spk.ahmet': { who: 'ahmet', side: 'r' }, 'spk.mila': { who: 'mila', side: 'r' }, 'spk.dede': { who: 'dede', side: 'r' }, 'spk.ada': { who: 'ada', side: 'r' },
    'spk.stranger': { who: 'stranger', side: 'r' }, 'spk.zombie': { who: 'zombie', side: 'r', mood: 'shout' }
  };
  // Calls: [line prefix, line count, bars per line]. A last line at 0 bars ends in "Sinyal yok" (dropped).
  var CALLS = { 5: ['C05', 5, [3, 3, 2, 2, 1]], 15: ['C15', 4, [2, 2, 1, 0]],
    50: ['C50', 4, [0, 1, 1, 0]], 70: ['C70', 5, [1, 2, 2, 3, 3]], 90: ['C90', 5, [3, 4, 4, 4, 4]] };
  // L100 has no end page here: P.Finale (story/finale.js) plays the arrival comic from main.js finishWin.
  var PAGE_END = { 1: 'l1_outro', 5: 'l5_end', 10: 'l10_end', 15: 'l15_end',
    20: 'kaan_join', 25: 'captain_end', 30: ['l30_call', 'l30_end'] };
  // Campfire: Haliç–Balat stage 4, Fatma Nine's garage (halic is walk position 11, so its stage 4 is L54; D-060).
  var PAGE_MID = { 54: 'campfire' };
  var ENCOUNTER_MID = { 25: 'L25m' };
  // Hood looks: three backgrounds and three tones per hood, keyed by hood id so a reorder keeps each look with its hood.
  var HOOD_LOOK = {
    istiklal: 'istiklal tram street|warm warm night', galata: 'galata galata street|night night warm',
    karakoy: 'cafe street yard|warm night red', bridge: 'bridge bridge bridge|night cold red',
    eminonu: 'quay quay fishquay|warm warm night', sirkeci: 'hall tunnel hall|cold night cold',
    kapalicarsi: 'bazaar bazaar bazaar|warm warm night', beyazit: 'square square square|warm cold warm',
    saray: 'square square walls|warm warm night', halic: 'shopwin yard fishquay|night warm night',
    kumkapi: 'fishquay fishquay fishquay|cold warm night', yenikapi: 'tunnel tunnel tunnel|night cold red',
    samatya: 'sea sea sea|warm cold warm', yedikule: 'walls walls walls|warm night night',
    zeytinburnu: 'yard yard yard|warm night red', kazlicesme: 'lawn lawn lawn|cold cold red',
    bakirkoy: 'arcade arcade arcade|warm cold night', bakirkoysahil: 'promenade promenade promenade|cold warm night',
    atakoysahil: 'marina marina marina|warm cold red', atakoy: 'apartment lobby lobby|warm night red'
  };

  // ---------- lines ----------
  function bossSpeaker(key) {
    return key === 'spk.b.atakoy' ? { who: 'ahmet', side: 'r', mood: 'sad' } : { who: 'zombie', side: 'r', mood: 'shout' };
  }
  // {who, side, mood, important} for a line, or null for narration and unknown lines.
  S.forLine = function (id) {
    var B = P.Dialogue.beat(id), spk = B && B.spk, base;
    if (!B || spk === 'spk.cap') return null;
    base = SPK[spk] || (spk.indexOf('spk.b.') === 0 ? bossSpeaker(spk) : null);
    if (!base) return null;
    return { who: base.who, side: base.side, mood: MOOD[id] || base.mood || 'neutral', important: !!IMPORTANT[id] };
  };

  // ---------- panels ----------
  function pn(bg, tone, ch, it, extra) { return Object.assign({ bg: bg, tone: tone, ch: ch, it: it }, extra || {}); }
  // Busts: left speakers first; one speaker sits at its side, several spread across the panel.
  function bustsFor(list) {
    var sorted = list.slice().sort(function (a, b) { return (a.side === 'l' ? 0 : 1) - (b.side === 'l' ? 0 : 1); });
    return sorted.map(function (b, i) {
      var n = sorted.length, x = n === 1 ? (b.side === 'l' ? 0.3 : 0.7) : 0.2 + 0.6 * i / (n - 1);
      return [b.who, b.mood, x, b.side === 'r', n > 1 ? 0.56 : 0.62];
    });
  }
  // Panel from line ids: narration becomes captions, thoughts and speech become bubbles, one bust per speaker.
  function auto(bg, tone, ids, extra) {
    var it = [], who = [];
    ids.forEach(function (id) {
      var f = S.forLine(id), seen;
      if (!f || !f.who) { it.push(['c', id]); return; }
      it.push([THINK[id] ? 't' : f.mood === 'shout' ? 's' : 'b', id]);
      seen = who.filter(function (b) { return b.who === f.who; })[0];
      if (seen) seen.mood = f.mood; else who.push({ who: f.who, mood: f.mood, side: f.side });
    });
    return pn(bg, tone, bustsFor(who), it, extra);
  }
  function linesWith(prefix) { return P.Dialogue.ids(prefix); }
  function hoodPages() {
    var out = {};
    P.Journey.hoods.forEach(function (h, hi) {
      var look = HOOD_LOOK[h.id].split('|'), bg = look[0].split(' '), tone = look[1].split(' '), panels = [];
      for (var p = 1; p <= 3; p++) panels.push(auto(bg[p - 1], tone[p - 1], linesWith('H' + PAD(hi + 1) + 'i' + p)));
      out['hood_' + h.id] = { hood: hi, panels: panels };
    });
    return out;
  }
  function specialPages() {
    return {
      l1_outro: { tag: 'cm.tag.l1', layout:'actionFirst', panels: [
        auto('shelter', 'warm', ['O1a', 'O1b'], { ch: [], actionTop:.66 }),
        auto('street', 'night', ['exit1', 'exit2']),
        pn('coast', 'none', [], [['t', 'O1c']]),
        auto('street', 'warm', ['O1d', 'O1e'], { speed: true })
      ] },
      l5_end: { panels: [
        pn('tram', 'red', [], [['c', 'E5a'], ['x', 'kut', 0.72, 0.42, -10, 'red']]),
        auto('tram', 'night', ['E5b']),
        auto('street', 'night', ['E5c'], { zoom: true })
      ] },
      l10_end: { panels: [
        auto('galata', 'night', ['G10a']),
        auto('street', 'night', ['G10b']),
        auto('street', 'warm', ['G10c'], { zoom: true })
      ] },
      l15_end: { panels: [
        auto('cafe', 'night', ['E15a']),
        auto('pasa', 'none', ['E15b'], { ch: [], actionTop: .62 }),
        auto('bridge', 'cold', ['E15c'])
      ] },
      kaan_join: { layout: 'conversation', panels: [
        pn('bridge', 'night', [], [['c', 'K20a']]),
        pn('bridge', 'cold', [['arda', 'scared', .25, false, .5], ['kaan', 'worried', .73, true, .64]], [['b', 'K20b']]),
        pn('bridge', 'warm', [['arda', 'neutral', .32, false, .64], ['kaan', 'neutral', .77, true, .5]], [['b', 'K20c']]),
        auto('quay', 'warm', ['K20e', 'K20f', 'K20d'], { zoom: true })
      ] },
      captain_end: { quiet: true, entranceCue: 'farewellMotif', panels: [
        auto('quay', 'night', ['E25a']),
        pn('quay', 'warm', [['arda', 'worried', .22, false, .50], ['kaan', 'steady', .73, true, .62]], [['b', 'E25b'], ['b', 'E25c']])
      ] },
      l30_call: { tag: 'cm.tag.momCall', layout: 'conversation', quiet: true, entranceCue: 'phoneRing', panels: [
        auto('dusk', 'cold', ['C30a']),
        auto('hall', 'cold', ['C30b']),
        auto('dusk', 'night', ['C30c']),
        pn('hall', 'night', [['arda', 'worried', .3, false, .62]], [['b', 'C30d'], ['b', 'C30e'], ['p', 0]])
      ] },
      l30_end: { quiet: true, entranceCue: 'homeMotif', panels: [
        auto('hall', 'cold', ['E30a']),
        pn('hall', 'night', [['arda', 'determined', .3, false, .62], ['kaan', 'neutral', .75, true, .49]], [['b', 'E30b']]),
        pn('tunnel', 'cold', [['arda', 'worried', .32, false, .57]], [['t', 'E30c']]),
        auto('road', 'warm', ['E30d'])
      ] },
      campfire: { layout: 'conversation', panels: [
        auto('campfire', 'warm', ['CMPa', 'CMPf']),
        auto('campfire', 'warm', ['CMPb']),
        auto('campfire', 'warm', ['CMPc']),
        auto('campfire', 'night', ['CMPd', 'CMPe'])
      ] }
    };
  }
  S.pages = Object.assign(hoodPages(), specialPages());
  S.pages.hood_karakoy.panels[1] = auto('pasa', 'none', ['H03i2a', 'H03i2b'], { ch: [], actionTop: .58 });
  S.pages.captain_end_covered = { quiet: true, entranceCue: 'farewellMotif', panels: [S.pages.captain_end.panels[0], auto('quay', 'warm', ['E25cover', 'E25c'])] };
  S.pages.captain_end_market = { quiet: true, entranceCue: 'farewellMotif', panels: [S.pages.captain_end.panels[0], auto('quay', 'warm', ['E25market', 'E25c'])] };

  // ---------- beats ----------
  // Level index (1..100) from a number or an id like 'H03-L2'. Returns null when out of range.
  function levelIndex(x) {
    var n = typeof x === 'number' ? x : null, m;
    if (n === null && (m = /^H(\d+)-L(\d+)$/.exec(String(x)))) n = (parseInt(m[1], 10) - 1) * 5 + parseInt(m[2], 10);
    return n >= 1 && n <= P.Journey.count() ? n : null;
  }
  function pop(id, opts) { return { kind: 'pop', line: id, opts: opts || {} }; }
  function page(id) { return { kind: 'page', id: id }; }
  function callFor(n) {
    var c = CALLS[n], lines = [], i;
    if (!c) return null;
    for (i = 0; i < c[1]; i++) lines.push(c[0] + 'abcde'.charAt(i));
    return { kind: 'call', who: 'anne', lines: lines, opts: { bars: c[2] } };
  }
  function ending(n, run) {
    if (n === 25 && run) {
      var save = P.Meta && P.Meta.state && P.Meta.state();
      if (save && save.flags && save.flags.kaanMarketCover) return page('captain_end_market');
      if (run.kaanCovered) return page('captain_end_covered');
    }
    return PAGE_END[n] ? page(PAGE_END[n]) : null;
  }
  // beat(level, when). Level 1 has no intro page: the cold open covers İstiklal.
  S.beat = function (level, when, run) {
    var n = levelIndex(level), L, hh, st;
    if (!n) return null;
    L = P.Journey.level(n); hh = PAD(L.hoodIndex + 1); st = L.stage;
    if (when === 'intro') return n > 1 && st === 1 ? page('hood_' + L.hood.id) : null;
    if (when === 'start') {
      if (n === 18) return { kind: 'pop', line: 'L18s', reply: 'L18m', opts: { important: true } };
      var authored = { 21: 'H05p1', 22: 'H05p2', 23: 'H05p3', 24: 'H05p4', 26: 'H06p1', 27: 'H06p2', 28: 'H06p3', 29: 'H06p4', 30: 'H06p5' };
      if (n >= 21 && n <= 30) return callFor(n) || (authored[n] && pop(authored[n])) || null;
      return callFor(n) || pop(n <= 20 ? 'L' + PAD(n) + 's' : 'H' + hh + 'p' + ((st - 1) % 4 + 1));
    }
    if (when === 'mid') {
      if (n === 18) return null; // Arda answers Kaan's bite question in the same exchange at entry.
      if (n >= 21 && n <= 25) return n === 25 ? pop('L25m') : null;
      if (n >= 26 && n <= 30) return pop('H06m' + st);
      return PAGE_MID[n] ? page(PAGE_MID[n]) : pop(ENCOUNTER_MID[n] || (n <= 20 ? 'L' + PAD(n) + 'm' : 'H' + hh + 'p' + (st % 4 + 1)));
    }
    if (when === 'boss') return st === 5 ? pop('H' + hh + 'b', { important: true }) : null;
    if (when === 'end') return ending(n, run);
    return null;
  };
  // Runs a beat. Pages block (onDone(skipped) after the last page); pops and calls are non-blocking and call
  // onDone when they end. Returns true when a blocking page was opened.
  S.play = function (level, when, onDone, run) {
    var b = S.beat(level, when, run), done = onDone || function () {};
    if (!b || !P.Comic) { done(false); return false; }
    if (b.kind === 'page') {
      P.Comic.page(b.id, function (skipped) {
        // Only the factually selected page is archived. Replay calls Comic directly and cannot settle a run.
        if (P.Meta && P.Meta.collect) [].concat(b.id).forEach(function (id) { P.Meta.collect('page:' + id); });
        done(skipped);
      });
      return true;
    }
    if (b.kind === 'pop') {
      P.Comic.pop(b.line, b.opts);
      if (b.reply) P.Comic.pop(b.reply, b.opts);
      done(false); return false;
    }
    P.Comic.call(b.who, b.lines, done, b.opts);
    return false;
  };
  S.levelIndex = levelIndex;
  P.Dialogue.onLang(function () { if (P.Comic && P.Comic.relang) P.Comic.relang(); });
  return S;
})();
