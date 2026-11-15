// Comic art (workstream D, v0.5; drawing base from G, v0.4): lettering font config (bundled OFL faces, ready gate),
// scene backdrops, busts, contact photos, bursts, signal bars, static. Coordinates are CSS px; the caller sets the
// device-pixel-ratio transform. Lettering (measure, fit, balloons, captions) is in comic-text.js; panel layout and the
// audit are in comic-layout.js.
P.ComicArt = (function () {
  var A = {};
  // ONE FONT CONFIG for all lettering. Each stack starts with the bundled OFL face declared in css/comic.css
  // ("CM Comic Relief", "CM Bangers"; files in assets/fonts), then system fallbacks. Layout waits for A.ready, so a
  // panel is measured with the face it is drawn with. Dialogue, captions, balloons: Comic Relief Bold (700).
  // Titles, SFX and name tags: Bangers. Paper letters: Comic Relief Regular. Turkish glyphs verified in each file.
  A.TYPE = {
    speech: "'CM Comic Relief', 'Comic Relief', 'Comic Sans MS', 'Chalkboard SE', cursive",
    title: "'CM Bangers', Bangers, Impact, 'Arial Black', sans-serif",
    hand: "'CM Comic Relief', 'Comic Relief', 'Segoe Print', 'Comic Sans MS', cursive",
    weight: 700, lead: 1.2
  };
  A.FACES = ['700 16px "CM Comic Relief"', '400 16px "CM Comic Relief"', '400 16px "CM Bangers"'];
  var INK = '#14151F', TAU = Math.PI * 2;
  var WASH = { warm: 'rgba(255,160,70,.16)', night: 'rgba(20,30,70,.36)', red: 'rgba(215,38,61,.22)',
               cold: 'rgba(70,150,210,.16)', sepia: 'rgba(190,140,80,.40)', none: null };
  var PAL = { arda: '#3D8BFF', anne: '#E9A23B', baba: '#5C6B7A', usta: '#F4EBDD', friend: '#D7263D', kaan: '#D7263D',
              mila: '#F2B632', ada: '#7FC8C0', dede: '#4E6A84', ahmet: '#B98A5A', shopkeeper: '#8A8F98', news: '#1B4965', stranger: '#2C2F42', zombie: '#7D8B6A' };
  var INIT = { arda: 'A', anne: 'L', baba: 'S', usta: 'U', friend: 'K', kaan: 'K', mila: 'M', ada: 'D', dede: 'H', ahmet: 'A', shopkeeper: 'A', news: 'H', stranger: '?', zombie: 'Z' };
  var KIND = { body: 'speech', speech: 'speech', display: 'title', title: 'title', hand: 'hand' };
  var halfPat = null, waiting = [];
  A.ready = false;   // true once the faces have loaded or failed (the fallback stack is then final)
  A.faces = [];      // [{family, weight, status}] after the load settles (the audit reports it)

  A.font = function (kind, px) {
    var T = A.TYPE, k = KIND[kind] || 'speech';
    if (k === 'title') return '400 ' + px + 'px ' + T.title;
    if (k === 'hand') return '400 ' + px + 'px ' + T.hand;
    return T.weight + ' ' + px + 'px ' + T.speech;
  };
  // Sets the font for drawing and measuring (no letter-spacing: the measured width is the drawn width).
  A.setFont = function (c, kind, px) { c.font = A.font(kind, px); };
  // Runs fn once the bundled faces have settled (loaded or failed). Layout must run after this.
  A.whenReady = function (fn) { if (A.ready) fn(); else waiting.push(fn); };
  A.loadFonts = function () {
    var fonts = typeof document !== 'undefined' ? document.fonts : null;
    function settle() {
      if (fonts && fonts.forEach) {
        fonts.forEach(function (f) {
          if (/CM (Comic Relief|Bangers)/.test(f.family)) A.faces.push({ family: f.family, weight: f.weight, status: f.status });
        });
      }
      A.ready = true;
      waiting.splice(0).forEach(function (fn) { fn(); });
    }
    if (!fonts || !fonts.load) return settle();
    Promise.all(A.FACES.map(function (f) { return fonts.load(f, 'ÇĞÜŞİÖçğüşıöI'); })).then(settle, settle);
  };
  A.rng = function (seed) {   // mulberry32: deterministic scenery per panel
    var s = (seed | 0) >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0; var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  A.loadFonts();

  // ---------- backgrounds ----------
  function grad(c, w, h, cols) {
    var g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]); c.fillStyle = g; c.fillRect(0, 0, w, h);
  }
  function farLayer(c, w, h, p, rnd) {
    var base = h * 0.62, x = -8, col = p.col || '#C9A08F', col2 = p.col2 || '#B98C7C';
    if (p.kind === 'facades' || p.kind === 'blocks') {
      while (x < w + 10) {
        var bw = 44 + rnd() * 34, top = base - h * (0.26 + rnd() * 0.22);
        c.fillStyle = rnd() < 0.5 ? col : col2; c.fillRect(x, top, bw, h);
        c.fillStyle = 'rgba(20,21,31,.3)'; c.fillRect(x, top, bw, 5);
        for (var r = 0; r < 2; r++) for (var k = 0; k < 2; k++) {
          c.fillStyle = p.kind === 'blocks' ? '#2F6F9F' : (rnd() < 0.35 ? '#FFD98A' : 'rgba(20,21,31,.5)');
          c.fillRect(x + 8 + k * (bw - 24), top + 14 + r * 26, 12, 16);
        }
        if (rnd() < 0.4) { c.fillStyle = p.col3 || '#E9A23B'; c.fillRect(x, top + 42, bw, 7); }
        x += bw + 2;
      }
    } else if (p.kind === 'skyline' || p.kind === 'towers') {
      c.fillStyle = col;
      if (p.kind === 'towers') { c.beginPath(); c.moveTo(w * 0.62, base); c.lineTo(w * 0.66, h * 0.12); c.lineTo(w * 0.7, base); c.fill(); }
      while (x < w) { var sw = 28 + rnd() * 30, sh = h * (0.2 + rnd() * 0.3); c.fillRect(x, base - sh, sw, h); x += sw + 3; }
      for (var d = 0; d < 14; d++) { c.fillStyle = 'rgba(255,217,138,.6)'; c.fillRect(rnd() * w, base - rnd() * h * 0.4, 2, 2); }
    } else if (p.kind === 'walls') {
      c.fillStyle = col; c.fillRect(0, base - h * 0.14, w, h * 0.2);
      for (var m = 0; m < w; m += 14) c.fillRect(m, base - h * 0.2, 8, h * 0.07);
      [0.15, 0.55, 0.9].forEach(function (f) { c.beginPath(); c.arc(w * f, base - h * 0.1, 22, Math.PI, 0); c.fillRect(w * f - 22, base - h * 0.1, 44, h * 0.4); c.fill(); });
    } else if (p.kind === 'arches' || p.kind === 'hall' || p.kind === 'tiles') {
      c.fillStyle = col; c.fillRect(0, 0, w, base);
      for (var a = 0; a < w + 40; a += 64) { c.fillStyle = col2; c.beginPath(); c.arc(a, base, 30, Math.PI, 0); c.fill(); }
      if (p.kind === 'hall') { c.strokeStyle = '#E8D9B0'; c.lineWidth = 3; c.beginPath(); c.arc(w * 0.5, h * 0.22, h * 0.09, 0, TAU); c.stroke(); }
      if (p.kind === 'tiles') { c.fillStyle = '#2E6FA3'; c.fillRect(0, base * 0.55, w, 6); c.fillRect(0, base * 0.8, w, 4); }
    } else if (p.kind === 'sea' || p.kind === 'boats' || p.kind === 'masts' || p.kind === 'bridge') {
      c.fillStyle = col; c.fillRect(0, base - h * 0.04, w, h);
      if (p.kind === 'boats') for (var b = 0; b < 4; b++) { var bx = 30 + b * w / 4; c.fillStyle = col2; c.beginPath(); c.moveTo(bx, base + 6); c.lineTo(bx + 40, base + 6); c.lineTo(bx + 34, base + 16); c.lineTo(bx + 6, base + 16); c.fill(); c.fillRect(bx + 20, base - 30, 2, 36); }
      if (p.kind === 'masts') for (var s = 0; s < 6; s++) { c.fillStyle = col2; c.fillRect(20 + s * w / 6, h * 0.12, 2, base - h * 0.12); }
      if (p.kind === 'bridge') { c.fillStyle = col2; c.fillRect(0, base - h * 0.2, w, 8); for (var q = 0; q < w; q += 70) c.fillRect(q, base - h * 0.2, 6, h * 0.2); }
    } else if (p.kind === 'palms') {
      c.strokeStyle = col; c.lineWidth = 6; [0.12, 0.45, 0.82].forEach(function (f) { c.beginPath(); c.moveTo(w * f, base); c.quadraticCurveTo(w * f + 14, base - h * 0.3, w * f - 6, base - h * 0.42); c.stroke(); });
    } else if (p.kind === 'stalls') {
      for (var t = 0; t < w; t += 80) { c.fillStyle = t % 160 ? col : col2; c.fillRect(t, base - h * 0.16, 74, h * 0.2); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(t, base - h * 0.16, 74, 10); }
    }
  }
  function nearLayer(c, w, h, kind, rnd) {
    var y = h * 0.5;
    if (kind === 'lamps') for (var i = 0; i < 3; i++) { var lx = w * (0.1 + i * 0.4); c.fillStyle = '#14151F'; c.fillRect(lx, h * 0.18, 4, h * 0.6); glow(c, lx + 2, h * 0.18, 60, 'rgba(255,214,120,.45)'); }
    if (kind === 'lanterns' || kind === 'strings') {
      c.strokeStyle = 'rgba(20,21,31,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, h * 0.12); c.quadraticCurveTo(w * 0.5, h * 0.3, w, h * 0.1); c.stroke();
      for (var l = 0; l < 7; l++) { var lxp = w * (l / 6), lyp = h * 0.12 + Math.sin(l / 6 * Math.PI) * h * 0.12; glow(c, lxp, lyp, 26, 'rgba(255,200,110,.5)'); c.fillStyle = kind === 'lanterns' ? '#FFB347' : '#FFF1C4'; c.beginPath(); c.arc(lxp, lyp, kind === 'lanterns' ? 7 : 3, 0, TAU); c.fill(); }
    }
    if (kind === 'lines') wires(c, w, h);
    if (kind === 'laundry') { c.strokeStyle = '#14151F'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, h * 0.2); c.lineTo(w, h * 0.28); c.stroke(); ['#E9EEF4', '#3D8BFF', '#FFD166', '#D7263D'].forEach(function (col, j) { c.fillStyle = col; c.fillRect(w * (0.12 + j * 0.22), h * 0.23, 22, 30); }); }
    if (kind === 'fog') { var fg = c.createLinearGradient(0, h * 0.3, 0, h * 0.8); fg.addColorStop(0, 'rgba(230,236,240,0)'); fg.addColorStop(0.5, 'rgba(230,236,240,.38)'); fg.addColorStop(1, 'rgba(230,236,240,0)'); c.fillStyle = fg; c.fillRect(0, h * 0.3, w, h * 0.5); }
    if (kind === 'horde') horde(c, w, h, rnd);
    if (kind === 'drums') drums(c, w, h, y);
    if (kind === 'mannequins') mannequins(c, w, h);
    if (kind === 'kilims') for (var kk = 0; kk < 4; kk++) { c.fillStyle = ['#9E1528', '#E9A23B', '#1B4965', '#14151F'][kk]; c.fillRect(w * (0.08 + kk * 0.24), 0, 30, h * 0.55); }
  }
  // Overhead wires: poles at fixed spacing with sagging wires between them (a street, not scratches).
  function wires(c, w, h) {
    var xs = [0.05, 0.36, 0.7, 1.02];
    c.fillStyle = 'rgba(20,21,31,.7)';
    xs.forEach(function (f) { c.fillRect(w * f - 2, 0, 4, h * 0.62); });
    c.strokeStyle = 'rgba(20,21,31,.55)'; c.lineWidth = 1.5;
    [0.12, 0.2].forEach(function (dy) {
      for (var i = 0; i < xs.length - 1; i++) {
        c.beginPath(); c.moveTo(w * xs[i], h * dy);
        c.quadraticCurveTo(w * (xs[i] + xs[i + 1]) / 2, h * (dy + 0.07), w * xs[i + 1], h * dy); c.stroke();
      }
    });
  }
  function glow(c, x, y, r, col) {
    var g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }
  function horde(c, w, h, rnd) {
    for (var i = 0; i < 9; i++) {
      var x = rnd() * w, y = h * (0.5 + rnd() * 0.42), s = h * (0.1 + rnd() * 0.06);
      c.fillStyle = 'rgba(20,21,31,' + (0.7 + rnd() * 0.3).toFixed(2) + ')';
      c.beginPath(); c.arc(x, y - s * 1.9, s * 0.42, 0, TAU); c.fill();
      c.fillRect(x - s * 0.45, y - s * 1.45, s * 0.9, s * 1.1);
      c.strokeStyle = c.fillStyle; c.lineWidth = s * 0.16;
      c.beginPath(); c.moveTo(x - s * 0.4, y - s * 1.3); c.lineTo(x - s * 0.9, y - s * 1.8); c.moveTo(x + s * 0.4, y - s * 1.3); c.lineTo(x + s * 0.8, y - s * 1.9); c.stroke();
      c.fillRect(x - s * 0.4, y - s * 0.35, s * 0.3, s * 0.9); c.fillRect(x + s * 0.1, y - s * 0.35, s * 0.3, s * 0.9);
    }
  }
  function drums(c, w, h, y) {
    ['#2E9FA0', '#C2185B', '#E9C23B', '#2E9FA0', '#C2185B'].forEach(function (col, i) {
      c.fillStyle = col; c.beginPath(); c.ellipse(30 + i * w / 5, y + h * 0.18, 26, 34, 0, 0, TAU); c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
    });
  }
  function mannequins(c, w, h) {
    for (var i = 0; i < 4; i++) {
      var x = w * (0.15 + i * 0.24), y = h * 0.78;
      c.fillStyle = '#E9E2D6'; c.beginPath(); c.arc(x, y - h * 0.58, h * 0.05, 0, TAU); c.fill();
      c.fillRect(x - h * 0.05, y - h * 0.5, h * 0.1, h * 0.36); c.fillRect(x - h * 0.04, y - h * 0.14, h * 0.08, h * 0.16);
    }
  }
  // Scene recipe: sky [top, bottom]; far: {kind, col, col2}; ground colour; rails; near: layer kinds; wash: tone.
  var SCENES = {
    istiklal: { sky: ['#F8D2B0', '#B7DCD2'], far: { kind: 'facades', col: '#EBC4A6', col2: '#B9DCD2' }, ground: '#8A8F98', rails: 1, near: ['strings'], wash: 'warm' },
    tram: { sky: ['#F2B39B', '#D7263D'], far: { kind: 'facades', col: '#E3A08A', col2: '#B07265' }, ground: '#7D8189', rails: 1, near: [], wash: 'red' },
    street: { sky: ['#1B2440', '#2C3A5E'], far: { kind: 'facades', col: '#3A3F55', col2: '#262B40', col3: '#5B4A2E' }, ground: '#4A4F5E', rails: 0, near: ['lamps'], wash: 'night' },
    galata: { sky: ['#1E2A4A', '#3B4670'], far: { kind: 'towers', col: '#2B3350' }, ground: '#3C4256', rails: 0, near: ['lanterns'], wash: 'night' },
    cafe: { sky: ['#F7D0C4', '#F1B6A8'], far: { kind: 'arches', col: '#FCEBDD', col2: '#E9A99A' }, ground: '#B9796B', rails: 0, near: ['lanterns'], wash: 'warm' },
    pier: { sky: ['#FBE3C3', '#86C5C2'], far: { kind: 'boats', col: '#7EBAB8', col2: '#14151F' }, ground: '#C9A07A', rails: 0, near: ['lines'], wash: 'cold' },
    bridge: { sky: ['#2B3B57', '#5D6C7E'], far: { kind: 'bridge', col: '#4C5A6B', col2: '#2C3A4B' }, ground: '#3E4A58', rails: 0, near: ['fog', 'lines'], wash: 'night' },
    quay: { sky: ['#2E2440', '#E3923D'], far: { kind: 'boats', col: '#14151F', col2: '#2C3A5E' }, ground: '#6E4E3A', rails: 0, near: ['lanterns'], wash: 'warm' },
    hall: { sky: ['#DDE6EE', '#B9C5D1'], far: { kind: 'hall', col: '#C9D3DC', col2: '#8FA0B0' }, ground: '#7F8A97', rails: 0, near: ['lamps'], wash: 'cold' },
    tunnel: { sky: ['#DDE7EC', '#A9BCC8'], far: { kind: 'tiles', col: '#EFE7D3', col2: '#CFC3A8' }, ground: '#6F7A84', rails: 0, near: ['lamps'], wash: 'cold' },
    bazaar: { sky: ['#4A2A1C', '#A9652A'], far: { kind: 'arches', col: '#6E3B22', col2: '#8F4B2A' }, ground: '#5A3A28', rails: 0, near: ['kilims', 'lanterns'], wash: 'warm' },
    square: { sky: ['#2E3F5C', '#7A8CA6'], far: { kind: 'stalls', col: '#2F6F9F', col2: '#E9A23B' }, ground: '#7B7E86', rails: 0, near: ['lamps'], wash: 'cold' },
    shopwin: { sky: ['#4B2D16', '#E09A3E'], far: { kind: 'facades', col: '#8C5A2C', col2: '#6B4220' }, ground: '#3C2A1C', rails: 0, near: ['mannequins'], wash: 'warm' },
    road: { sky: ['#1A2238', '#33405E'], far: { kind: 'blocks', col: '#55606F', col2: '#434C5C' }, ground: '#2F3442', rails: 0, near: ['lamps'], wash: 'night' },
    fishquay: { sky: ['#2A1B2E', '#7A2C2F'], far: { kind: 'boats', col: '#1E1A2A', col2: '#4A2A2A' }, ground: '#4B3A36', rails: 0, near: ['lanterns'], wash: 'warm' },
    sea: { sky: ['#F7B7A0', '#F3D9A4'], far: { kind: 'sea', col: '#3F8FB2', col2: '#2D6F95' }, ground: '#D7C2A0', rails: 0, near: ['lines'], wash: 'warm' },
    walls: { sky: ['#B9D6E8', '#E6EDD9'], far: { kind: 'walls', col: '#B99C7A', col2: '#8F7458' }, ground: '#8E9B7A', rails: 0, near: ['laundry'], wash: 'none' },
    yard: { sky: ['#C9D4D6', '#B9B2A1'], far: { kind: 'blocks', col: '#8C7A6A', col2: '#6F6052' }, ground: '#8F8A82', rails: 0, near: ['drums'], wash: 'none' },
    lawn: { sky: ['#CFE7F5', '#9BD0A6'], far: { kind: 'palms', col: '#3F6B45' }, ground: '#6FAE5E', rails: 0, near: [], wash: 'none' },
    arcade: { sky: ['#EDE7DA', '#CDBEA7'], far: { kind: 'facades', col: '#CDB9A3', col2: '#B8A18C' }, ground: '#A39886', rails: 0, near: ['lamps'], wash: 'cold' },
    promenade: { sky: ['#FFD9C7', '#A9DDE0'], far: { kind: 'palms', col: '#4C7B4E' }, ground: '#E9DCC4', rails: 0, near: [], wash: 'warm' },
    marina: { sky: ['#FFD7A8', '#7FC8C2'], far: { kind: 'masts', col: '#F4F8FA', col2: '#9CB7C2' }, ground: '#CFC3AE', rails: 0, near: [], wash: 'warm' },
    apartment: { sky: ['#FFE2B8', '#BFE3DF'], far: { kind: 'blocks', col: '#EAD7B9', col2: '#D8C2A2' }, ground: '#B9A98E', rails: 0, near: ['laundry'], wash: 'warm' },
    lobby: { sky: ['#2A2318', '#6B5030'], far: { kind: 'facades', col: '#4D3B26', col2: '#3A2C1C' }, ground: '#3A2E22', rails: 0, near: ['lamps'], wash: 'sepia' },
    window: { sky: ['#2B2A36', '#4A3F3A'], far: { kind: 'facades', col: '#3D3A46', col2: '#34313D' }, ground: '#2A2630', rails: 0, near: ['lamps'], wash: 'sepia' },
    horde: { sky: ['#5A1E26', '#14151F'], far: { kind: 'skyline', col: '#1E1B2A' }, ground: '#2A2A34', rails: 0, near: ['horde'], wash: 'red' },
    night: { sky: ['#0E1430', '#29365A'], far: { kind: 'skyline', col: '#1B2440' }, ground: '#262B3D', rails: 0, near: [], wash: 'night' },
    campfire: { sky: ['#1A0F0A', '#4A2412'], far: { kind: 'arches', col: '#3A1E10', col2: '#5A2E18' }, ground: '#2A160C', rails: 0, near: ['lanterns'], wash: 'warm' },
    coast: { sky: ['#D9E9EF', '#F3EAD6'], far: null, ground: '#F3EAD6', rails: 0, near: [], wash: 'none', map: true },
    dusk: { sky: ['#F59E6B', '#2B3B57'], far: { kind: 'skyline', col: '#2B3550' }, ground: '#3E4A58', rails: 0, near: [], wash: 'warm' }
  };
  A.scene = function (c, w, h, key, seed) {
    var r = SCENES[key] || SCENES.street, rnd = A.rng(seed || 7);
    if (r.map) return mapScene(c, w, h);
    grad(c, w, h, r.sky);
    if (r.far) farLayer(c, w, h, r.far, rnd);
    c.fillStyle = r.ground; c.fillRect(0, h * 0.62, w, h * 0.38);
    if (r.rails) rails(c, w, h);
    (r.near || []).forEach(function (k) { nearLayer(c, w, h, k, rnd); });
    return c;
  };
  function rails(c, w, h) {
    c.strokeStyle = '#5E6470'; c.lineWidth = 3;
    [0.38, 0.62].forEach(function (f) { c.beginPath(); c.moveTo(w * f, h); c.lineTo(w * 0.5 + (f - 0.5) * w * 0.25, h * 0.62); c.stroke(); });
  }
  // Mood wash and halftone are drawn after the scene. Wash names: warm, night, red, cold, sepia, none.
  A.wash = function (c, w, h, tone) {
    var col = WASH[tone || 'none']; if (!col) return;
    c.fillStyle = col; c.fillRect(0, 0, w, h);
  };
  A.halftone = function (c, w, h, alpha) {
    if (!halfPat) {
      var pc = document.createElement('canvas'); pc.width = 6; pc.height = 6; var px = pc.getContext('2d');
      px.fillStyle = INK; px.beginPath(); px.arc(3, 3, 1.2, 0, TAU); px.fill(); halfPat = c.createPattern(pc, 'repeat');
    }
    c.save(); c.globalAlpha = alpha; c.fillStyle = halfPat;
    c.fillRect(0, h * 0.7, w, h * 0.3);
    c.restore();
  };
  A.speed = function (c, cx, cy, w, h, alpha) {
    c.save(); c.strokeStyle = 'rgba(20,21,31,' + alpha + ')'; c.lineWidth = 2; c.beginPath();
    for (var i = 0; i < 28; i++) { var a = i / 28 * TAU, r0 = Math.max(w, h) * 0.3, r1 = Math.max(w, h) * 0.9; c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); }
    c.stroke(); c.restore();
  };
  A.vignette = function (c, w, h, a) {
    var g = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + a + ')'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  };
  function mapScene(c, w, h) {
    c.fillStyle = '#E6EFF0'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#B9D6DE'; c.beginPath(); c.moveTo(0, h * 0.55); c.quadraticCurveTo(w * 0.45, h * 0.5, w * 0.5, h * 0.7); c.quadraticCurveTo(w * 0.6, h * 0.92, w, h * 0.9); c.lineTo(w, h); c.lineTo(0, h); c.fill();
    c.strokeStyle = '#14151F'; c.setLineDash([6, 6]); c.lineWidth = 3; c.beginPath();
    c.moveTo(w * 0.8, h * 0.06); c.quadraticCurveTo(w * 0.62, h * 0.3, w * 0.55, h * 0.45); c.quadraticCurveTo(w * 0.42, h * 0.62, w * 0.22, h * 0.82); c.stroke(); c.setLineDash([]);
    [[0.8, 0.06, 'Taksim'], [0.55, 0.45, 'Eminönü'], [0.22, 0.82, 'Ataköy']].forEach(function (p) {
      c.fillStyle = p[0] === 0.22 ? '#D7263D' : '#14151F'; c.beginPath(); c.arc(w * p[0], h * p[1], 7, 0, TAU); c.fill();
      A.setFont(c, 'body', 14); c.fillStyle = '#14151F'; c.fillText(p[2], w * p[0] + 12, h * p[1] + 5);
    });
    return c;
  }

  // ---------- busts ----------
  // Draws P.ComicBusts.draw (comic-busts.js) when present, otherwise an ink silhouette bust with a coloured initial.
  A.bust = function (c, who, mood, x, y, h, o) {
    o = o || {};
    if (P.ComicBusts && P.ComicBusts.draw) { P.ComicBusts.draw(c, who, mood, x, y, h, o); return; }
    c.save(); c.globalAlpha = o.alpha == null ? 1 : o.alpha; c.translate(x, y); if (o.flip) c.scale(-1, 1);
    var hr = h * 0.2, lw = Math.max(2, h * 0.025);
    c.fillStyle = PAL[who] || '#888'; c.strokeStyle = INK; c.lineWidth = lw;
    c.beginPath(); c.moveTo(-h * 0.42, 0); c.quadraticCurveTo(-h * 0.42, -h * 0.42, 0, -h * 0.44); c.quadraticCurveTo(h * 0.42, -h * 0.42, h * 0.42, 0); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#FFF'; A.setFont(c, 'title', Math.round(h * 0.2)); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(INIT[who] || '?', 0, -h * 0.16);
    c.fillStyle = '#F2C9A0'; c.beginPath(); c.arc(0, -h * 0.74, hr, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc(0, -h * 0.76, hr * 1.02, Math.PI * 1.05, Math.PI * 1.95); c.fill();
    c.fillRect(-hr * 0.35, -h * 0.74 + hr * 0.4, hr * 0.22, hr * 0.22); c.fillRect(hr * 0.13, -h * 0.74 + hr * 0.4, hr * 0.22, hr * 0.22);
    c.fillStyle = INK; c.beginPath(); c.ellipse(0, -h * 0.61, hr * 0.32, Math.max(1, hr * 0.12 + hr * 0.3 * (o.talk || 0)), 0, 0, TAU); c.fill();
    c.restore();
  };
  // Contact-photo canvas for the call card (P.ComicBusts.canvas when present).
  A.contact = function (who, mood, size, dpr) {
    if (P.ComicBusts && P.ComicBusts.canvas) return P.ComicBusts.canvas(who, mood, size, dpr);
    var cv = document.createElement('canvas'); cv.width = size * dpr; cv.height = size * dpr;
    var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = PAL[who] || '#888'; c.fillRect(0, 0, size, size);
    A.bust(c, who, mood, size / 2, size * 1.02, size * 0.95, {});
    return cv;
  };

  // Ink burst behind a bust: jagged star of radius r, n spikes, fill colour.
  A.burst = function (c, cx, cy, r, fill, n) {
    if (r <= 0) return;
    c.save(); c.fillStyle = fill; c.strokeStyle = INK; c.lineWidth = 3; c.lineJoin = 'round'; c.beginPath();
    for (var i = 0; i <= n * 2; i++) {
      var a = i / (n * 2) * TAU, rr = i % 2 ? r * 0.6 : r;
      if (i) c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); else c.moveTo(cx + r, cy);
    }
    c.closePath(); c.fill(); c.stroke(); c.restore();
  };
  // Signal bars: n of 4 lit, at x,y (bottom-left), height hPx.
  A.bars = function (c, x, y, n, hPx, lit) {
    for (var i = 0; i < 4; i++) {
      c.fillStyle = i < n && lit !== false ? '#FFF8EC' : 'rgba(255,248,236,.25)';
      c.fillRect(x + i * 6, y - hPx * (i + 1) / 4, 4, hPx * (i + 1) / 4);
    }
  };
  // Static snow for dropped calls: a few hundred px of noise.
  A.static = function (c, w, h, rnd, alpha) {
    c.save(); c.globalAlpha = alpha;
    for (var i = 0; i < 70; i++) { c.fillStyle = rnd() < 0.5 ? '#FFF8EC' : INK; c.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 26, 1 + rnd() * 3); }
    c.restore();
  };
  // Cat silhouette (Paşa, companion): base centre x, y (ground), size s.
  A.cat = function (c, x, y, s, col) {
    c.fillStyle = col || INK; c.beginPath(); c.ellipse(x, y - s * 0.35, s * 0.5, s * 0.3, 0, 0, TAU); c.fill();
    c.beginPath(); c.arc(x + s * 0.42, y - s * 0.62, s * 0.2, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(x + s * 0.3, y - s * 0.8); c.lineTo(x + s * 0.36, y - s * 1.0); c.lineTo(x + s * 0.5, y - s * 0.8); c.fill();
    c.lineWidth = s * 0.08; c.strokeStyle = c.fillStyle; c.beginPath(); c.moveTo(x - s * 0.5, y - s * 0.3); c.quadraticCurveTo(x - s * 0.9, y - s * 0.8, x - s * 0.7, y - s * 0.95); c.stroke();
  };
  return A;
})();
