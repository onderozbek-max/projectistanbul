// Generated SFX loader (D-063, proposed). Plays the owner's AI-generated files from audio/sfx-gen/ready/ (written by
// tools/prepare-sfx.js and listed in ready/manifest.json) and falls back to the synthesized recipe per cue when a file
// is missing. Fast start: the manifest and the files are fetched and decoded in idle time, short files first, under a
// memory cap (CUE_CAP). A bed (ambience loop) decodes when its theme starts and only the last one is kept.
// Silent by design: no UI, no console. Off when fetch is missing (file://), when there is no manifest, or with ?sfx=synth.
// API: pick(name, kind) -> {buf, gain, jitter} | null  (round robin over the cue's files; null = use the synth recipe)
//      drop(name, kind) | has(name) | bed(group, cb) -> AudioBuffer | null | undefined (cb(buf|null) comes later)
//      attach(ctx) | setEnabled(on) -> bool | stats()
P.SfxGen = (function () {
  var R = P.SfxRecipes || null;
  var BASE = 'audio/sfx-gen/ready/', MANIFEST = BASE + 'manifest.json';
  var DECODE_SR = 48000, BYTES = 4;             // decoded buffers are mono float32; the budget assumes 48 kHz
  var CUE_CAP = 15500000, BED_MAX_SEC = 20;     // bytes of decoded cue audio; one bed (at most 3.84 MB) on top: under 20 MB
  var GAIN_MIN = 0.25, GAIN_MAX = 4, JITTER = 0.04;   // gain is clamped to -12 .. +12 dB; pitch jitter +-4%
  var BEDS = ['street', 'waterfront', 'bazaar', 'wind', 'night'];
  var on = true, booted = false, cues = {}, beds = {}, queue = [], rr = {}, bedKeep = null, waiting = false;
  var live = null, offline = null, decodedBytes = 0, nLoaded = 0, nFailed = 0, nSkipped = 0;
  function loc() { return typeof location !== 'undefined' ? location : null; }
  function fileProto() { var l = loc(); return !!(l && l.protocol === 'file:'); }
  function synthForced() { var l = loc(); return !!(l && /[?&]sfx=synth(&|$)/.test(l.search || '')); }
  function canFetch() { return on && typeof fetch === 'function' && !fileProto() && !synthForced() && !!R; }
  function idle(fn) {
    if (typeof window !== 'undefined' && window.requestIdleCallback) window.requestIdleCallback(fn, { timeout: 1000 });
    else setTimeout(fn, 30);
  }
  function fileOk(f) { return typeof f === 'string' && /^[A-Za-z0-9_]+\.(mp3|wav|ogg|m4a)$/.test(f); }
  function validId(id) {
    if (id === 'hit' || id === 'speech') return false;      // 'hit' is played per kind (hit_body ...); speech stays synthesized
    if (id.indexOf('hit_') === 0) return R.HIT_KINDS.indexOf(id.slice(4)) >= 0;
    return R.has(id);
  }
  function idOf(name, kind) { return name === 'hit' ? 'hit_' + (kind || 'body') : name; }
  // Level match: the file is set to the cue's design level (db) and peak cap (pk), so the mix keeps the table's balance.
  function gainFor(id, e) {
    var m = R.meta[id.indexOf('hit_') === 0 ? 'hit' : id];
    if (!m || typeof e.db !== 'number') return 1;
    var g = Math.pow(10, (m.db - e.db) / 20);
    if (typeof e.peak === 'number') g = Math.min(g, Math.pow(10, (m.pk - e.peak) / 20));
    return Math.min(GAIN_MAX, Math.max(GAIN_MIN, g));
  }
  function getJson(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r || !r.ok) throw new Error('http'); return r.json(); });
  }
  function getBytes(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r || !r.ok) throw new Error('http'); return r.arrayBuffer(); });
  }
  // Decoder: the live context once sfx.js has one, else a small offline context (no user gesture needed, so boot can decode).
  function decoder() {
    if (live) return live;
    if (offline) return offline;
    var OC = typeof window !== 'undefined' ? (window.OfflineAudioContext || window.webkitOfflineAudioContext) : null;
    if (!OC) return null;
    try { offline = new OC(1, 1, DECODE_SR); } catch (e) { offline = null; }
    return offline;
  }
  function decodeBytes(ab) {
    var c = decoder();
    if (!c) return Promise.reject(new Error('no decoder'));
    return new Promise(function (res, rej) {
      var p = c.decodeAudioData(ab, res, rej);
      if (p && typeof p.then === 'function') p.then(res, rej);
    });
  }
  // One file per idle slot, sequential, short files first. Over the cap a file is skipped (the synth recipe plays).
  function step() {
    var e = queue.shift();
    if (!e) return;
    if (decodedBytes + e.sec * DECODE_SR * BYTES > CUE_CAP) { nSkipped++; return idle(step); }
    if (!decoder()) { queue.unshift(e); waiting = true; return; }   // attach(ctx) restarts the queue
    getBytes(e.url).then(decodeBytes).then(function (buf) {
      if (buf && buf.length) { e.buf = buf; decodedBytes += buf.length * BYTES; nLoaded++; cues[e.cue].ready.push(e); }
      else nFailed++;
    }, function () { nFailed++; }).then(function () { idle(step); });
  }
  function parse(m) {
    var cs = m && m.cues, bs = m && m.beds;
    if (cs && typeof cs === 'object') Object.keys(cs).forEach(function (id) {
      if (!validId(id) || !cs[id] || !cs[id].length) return;
      cues[id] = cues[id] || { ready: [] };
      cs[id].forEach(function (x) {
        if (!x || !fileOk(x.file) || !(x.seconds > 0)) return;
        var e = { cue: id, url: BASE + x.file, sec: x.seconds, db: x.db, peak: x.peak, gain: 1, buf: null };
        e.gain = gainFor(id, e);
        queue.push(e);
      });
    });
    queue.sort(function (a, b) { return a.sec - b.sec; });
    if (bs && typeof bs === 'object') Object.keys(bs).forEach(function (g) {
      var x = bs[g];
      if (BEDS.indexOf(g) < 0 || !x || !fileOk(x.file) || !(x.seconds > 0) || x.seconds > BED_MAX_SEC) return;
      beds[g] = { url: BASE + x.file, sec: x.seconds, busy: false };
    });
  }
  function boot() {
    if (booted || !canFetch()) return;
    booted = true;
    getJson(MANIFEST).then(function (m) { parse(m); if (queue.length) idle(step); }, function () { /* no manifest: synth only */ });
  }
  return {
    pick: function (name, kind) {
      if (!canFetch()) return null;
      var id = idOf(name, kind), c = cues[id];
      if (!c || !c.ready.length) return null;
      var i = rr[id] === undefined ? 0 : (rr[id] + 1) % c.ready.length;   // round robin over the decoded variants
      rr[id] = i;
      return { buf: c.ready[i].buf, gain: c.ready[i].gain, jitter: JITTER };
    },
    drop: function (name, kind) { var c = cues[idOf(name, kind)]; if (c) c.ready = []; },   // the synth recipe takes over
    has: function (name) {
      if (!canFetch()) return false;
      if (name === 'hit') return Object.keys(cues).some(function (k) { return k.indexOf('hit_') === 0 && cues[k].ready.length > 0; });
      return !!(cues[name] && cues[name].ready.length);
    },
    bed: function (group, cb) {
      var b = beds[group];
      if (!b || !canFetch()) return null;
      if (bedKeep && bedKeep.group === group) return bedKeep.buf;
      if (b.busy) return undefined;
      b.busy = true;
      getBytes(b.url).then(decodeBytes).then(function (buf) {
        b.busy = false;
        if (buf && buf.length) { bedKeep = { group: group, buf: buf }; cb(buf); } else cb(null);
      }, function () { b.busy = false; cb(null); });
      return undefined;
    },
    attach: function (c) {
      if (c && !live) live = c;
      if (waiting) { waiting = false; idle(step); }
    },
    setEnabled: function (v) { on = !!v; boot(); return canFetch(); },
    stats: function () {
      return { on: canFetch(), booted: booted, loaded: nLoaded, pending: queue.length, skipped: nSkipped, failed: nFailed,
        decodedBytes: decodedBytes, capBytes: CUE_CAP, bed: bedKeep ? bedKeep.group : null, beds: Object.keys(beds) };
    }
  };
})();
// Starts after the first frames. Nothing is fetched on file:// or with ?sfx=synth.
setTimeout(function () { if (P.SfxGen) P.SfxGen.setEnabled(true); }, 600);
