// P.Dialogue: the one store and API for voice text (class C: barks, story pages, pops, calls, captions, finale, card flavour).
// Data lives in beats-*.js (P.DLG.beats[id]), tr/*.js and en/*.js (P.DLG.tr[id], P.DLG.en[id] = [{ t, j?, spk?, mood? }]).
// Each language is written natively from the beat; nothing is translated and nothing falls back to the other language:
// a missing beat or a missing language line returns null (and is recorded, see D.misses) and tools/test-dialogue.js fails.
// A line is a draft until an editor approves it through tools/dialogue-import.js (which sets ok: 1 on the line).
// Picks use the VIEW random stream only (own mulberry, or opts.rng from the caller); dialogue never touches the sim.
P.DLG = P.DLG || { beats: {}, tr: {}, en: {} };
P.Dialogue = (function () {
  var D = {}, used = {}, last = {}, missed = {}, listeners = [], rng = mulberry(1337);
  function mulberry(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0; var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function miss(id, lg) { missed[lg + '|' + id] = true; return null; }
  function langOf(o) { return (o && o.lang) || P.lang; }

  D.has = function (id) { return !!P.DLG.beats[id]; };
  D.beat = function (id) { return P.DLG.beats[id] || null; };
  D.ids = function (prefix) {
    return Object.keys(P.DLG.beats).filter(function (k) { return !prefix || k.indexOf(prefix) === 0; }).sort();
  };
  // The lines of a beat in one language (the current one by default), or null. Never the other language.
  D.pool = function (id, lg) {
    var l = (P.DLG[lg || P.lang] || {})[id];
    return l && l.length ? l : null;
  };
  // The beat ids of a review batch (P.DLG.batches[name]; entries ending in "*" are prefixes), sorted.
  D.batch = function (name) {
    var list = (P.DLG.batches || {})[name] || [];
    return Object.keys(P.DLG.beats).filter(function (id) {
      return list.some(function (e) { return e.charAt(e.length - 1) === '*' ? id.indexOf(e.slice(0, -1)) === 0 : id === e; });
    }).sort();
  };
  D.size = function (id, lg) { var l = D.pool(id, lg); return l ? l.length : 0; };

  // A random line: every variant once before any repeats, never the one shown last, jokes only when allowed.
  // opts: { pin: fixed index, noJoke, rng, lang }. Returns { id, i, key, t, j, spk, mood } or null.
  D.line = function (id, opts) {
    var o = opts || {}, lg = langOf(o), list = D.pool(id, lg), r = o.rng || rng, sk = lg + '|' + id, u, cand = [], i, e, b;
    if (!list) return miss(id, lg);
    u = used[sk] || (used[sk] = {});
    function ok(n, fresh) {
      var x = list[n];
      if (!x || !x.t || (o.noJoke && x.j) || (list.length > 1 && last[sk] === n)) return false;
      return !fresh || !u[n];
    }
    if (o.pin != null && ok(o.pin, false)) i = o.pin;
    else {
      for (i = 0; i < list.length; i++) if (ok(i, true)) cand.push(i);
      if (!cand.length) { u = used[sk] = {}; for (i = 0; i < list.length; i++) if (ok(i, false)) cand.push(i); }
      if (!cand.length) return null;
      i = cand[Math.floor(r() * cand.length)];
    }
    u[i] = true; last[sk] = i; e = list[i]; b = P.DLG.beats[id] || {};
    return { id: id, i: i, key: id + '#' + i, t: e.t, j: e.j ? 1 : 0, spk: e.spk || b.spk || 'spk.arda', mood: e.mood || null };
  };
  // The fixed line of a beat (variant 0): story pages, pops and calls, where the text must not change between views.
  // Returns { id, spk, speaker (display name), text, mood } or null.
  D.get = function (id, lg) {
    var list = D.pool(id, lg), e, b;
    if (!list) return miss(id, lg || P.lang);
    e = list[0]; b = P.DLG.beats[id] || {};
    return { id: id, spk: e.spk || b.spk || 'spk.arda', speaker: P.t(e.spk || b.spk || 'spk.arda'), text: e.t, mood: e.mood || null };
  };
  D.text = function (id, lg) { var l = D.get(id, lg); return l ? l.text : ''; };
  // Clears the no-repeat memory and reseeds the default view stream (a new run).
  D.reset = function (seed) { used = {}; last = {}; rng = mulberry(seed || 1337); };
  // Beats or languages a caller asked for that do not exist (the tests read this).
  D.misses = function () { return Object.keys(missed); };
  D.clearMisses = function () { missed = {}; };
  // Language switch: the settings control, the title buttons and ?lang= call langChanged(); open pops and pages subscribe.
  D.onLang = function (fn) { listeners.push(fn); };
  D.langChanged = function () { listeners.forEach(function (fn) { try { fn(P.lang); } catch (e) { if (window.console) console.error(e); } }); };
  return D;
})();
