// Chapter 1 arrival: comic backgrounds and Mila's bust (view only). Two decorators, nothing else changes:
//  - P.ComicArt.scene: the five finale scene keys (fin_*) are painted here; every other key goes to the original.
//  - P.ComicCast.spec: 'mila' (long dark hair, blue track top) is added; other busts are untouched.
// Coordinates are CSS px (the comic canvas is already scaled for the device pixel ratio). Flat, ink-friendly shapes.
(function () {
  var A = P.ComicArt, C = P.ComicCast, INK = '#14151F', TAU = Math.PI * 2;
  var orig = A.scene;

  function rr(c, x, y, w, h, fill, stroke) {
    c.fillStyle = fill; c.fillRect(x, y, w, h);
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2; c.strokeRect(x, y, w, h); }
  }
  function glow(c, x, y, r, col) {
    var g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }
  function grad(c, w, h, a, b) { var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  // Blue-shuttered window: frame, two shutters, glass (lit or dark).
  function window_(c, x, y, w, h, lit) {
    rr(c, x - 4, y - 3, w + 8, h + 6, '#2F6F9F', INK);
    rr(c, x, y, w, h, lit ? '#FFD98A' : '#3A4A60', INK);
    if (lit) glow(c, x + w / 2, y + h / 2, Math.max(w, h) * 1.4, 'rgba(255,217,138,0.35)');
  }
  // Facade band with a row of windows and shutters (used by the street and the balcony scenes).
  function facade(c, w, top, bottom, col, lit) {
    rr(c, 0, top, w, bottom - top, col);
    var rows = 2, cols = 4, i, j, gx = w / (cols + 0.4), gy = (bottom - top) / (rows + 0.6);
    for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) {
      var on = lit && (i === 1 && j === 0);
      window_(c, gx * (i + 0.45), top + gy * (j + 0.35), gx * 0.5, gy * 0.6, on);
    }
  }
  function laundry(c, w, y, col) {
    c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, y); c.quadraticCurveTo(w * 0.5, y + 16, w, y + 4); c.stroke();
    ['#E9EEF4', '#3D8BFF', '#FFD166', '#D7263D'].forEach(function (k, i) { rr(c, w * (0.14 + i * 0.2), y + 6 + (i % 2) * 4, 16, 20, k, INK); });
  }

  var PAINT = {
    // Arrival: dusk-warm street, beige stucco, blue shutters, laundry, the kapıcı booth with its empty bread basket.
    fin_street: function (c, w, h) {
      grad(c, w, h, '#F5C4A0', '#BFE3DF');
      facade(c, w, h * 0.08, h * 0.6, '#E9D6B4', false);
      laundry(c, w, h * 0.38, '#E9EEF4');
      rr(c, 0, h * 0.6, w, h * 0.4, '#B9A98E');
      c.strokeStyle = 'rgba(20,21,31,0.25)'; c.lineWidth = 1;
      for (var k = 1; k < 5; k++) { c.beginPath(); c.moveTo(0, h * 0.6 + k * h * 0.08); c.lineTo(w, h * 0.6 + k * h * 0.08); c.stroke(); }
      rr(c, w * 0.04, h * 0.5, w * 0.2, h * 0.14, '#D9C3A0', INK);                 // kapıcı booth
      rr(c, w * 0.07, h * 0.53, w * 0.06, h * 0.05, '#FFE9B0', INK);
      c.fillStyle = '#8B5E34'; c.beginPath(); c.ellipse(w * 0.14, h * 0.5, w * 0.1, h * 0.03, 0, 0, TAU); c.fill(); c.strokeStyle = INK; c.stroke();
      c.strokeStyle = INK; c.lineWidth = 2;
      for (var b = 0; b < 4; b++) { c.beginPath(); c.moveTo(w * (0.07 + b * 0.04), h * 0.495); c.lineTo(w * (0.07 + b * 0.04), h * 0.46); c.stroke(); }
      rr(c, w * 0.6, h * 0.42, w * 0.22, h * 0.08, '#2F6F9F', INK);               // shop awning, unnamed
    },
    // The balcony: night facade, one warm window on the third floor, a balcony rail and a pot plant.
    fin_balcony: function (c, w, h) {
      grad(c, w, h, '#1B2440', '#2C3A5E');
      facade(c, w, h * 0.14, h * 0.78, '#3A3F55', false);
      glow(c, w * 0.5, h * 0.42, w * 0.7, 'rgba(255,217,138,0.28)');
      rr(c, w * 0.36, h * 0.36, w * 0.28, h * 0.22, '#FFD98A', INK);              // the lit window
      rr(c, w * 0.3, h * 0.6, w * 0.4, h * 0.035, '#14151F');                     // balcony rail
      c.fillStyle = '#4E7D4E'; c.beginPath(); c.arc(w * 0.34, h * 0.58, w * 0.04, 0, TAU); c.arc(w * 0.66, h * 0.58, w * 0.04, 0, TAU); c.fill();
      rr(c, 0, h * 0.78, w, h * 0.22, '#262B3D');
    },
    // The call at the door: a night street with bokeh lamps. The signal bars are drawn by the comic layout.
    fin_phone: function (c, w, h) {
      grad(c, w, h, '#0E1430', '#29365A');
      [[0.18, 0.2, 14], [0.7, 0.14, 18], [0.42, 0.42, 10], [0.86, 0.5, 16], [0.12, 0.66, 12]].forEach(function (p) {
        glow(c, w * p[0], h * p[1], p[2] * 2.2, 'rgba(255,214,120,0.45)');
        c.fillStyle = '#FFE9B0'; c.beginPath(); c.arc(w * p[0], h * p[1], p[2] * 0.22, 0, TAU); c.fill();
      });
      rr(c, 0, h * 0.7, w, h * 0.3, '#1F2438');
      rr(c, w * 0.08, h * 0.45, w * 0.22, h * 0.25, '#2B3550', INK);
      rr(c, w * 0.7, h * 0.4, w * 0.22, h * 0.3, '#2B3550', INK);
    },
    // The flat: tiled kitchen wall, a blue tile band, the table with two dried-up cups and a night window.
    fin_flat: function (c, w, h) {
      rr(c, 0, 0, w, h, '#F1E7D3');
      rr(c, 0, h * 0.5, w, h * 0.06, '#2F6F9F');
      c.fillStyle = '#E9F1F5';
      for (var i = 0; i * 26 < w; i++) for (var j = 0; j * 18 < h * 0.45; j++) { c.beginPath(); c.arc(i * 26 + 13, j * 18 + 10, 2, 0, TAU); c.fill(); }
      window_(c, w * 0.08, h * 0.1, w * 0.3, h * 0.24, false);
      rr(c, 0, h * 0.62, w, h * 0.38, '#8B5E34', INK);                           // worktop
      c.strokeStyle = 'rgba(20,21,31,0.3)'; c.lineWidth = 1;
      for (var k = 1; k < 4; k++) { c.beginPath(); c.moveTo(0, h * 0.62 + k * h * 0.09); c.lineTo(w, h * 0.62 + k * h * 0.09); c.stroke(); }
      [0.62, 0.78].forEach(function (x) {                                         // two dried-up cups, saucers under
        c.fillStyle = '#F4EBDD'; c.beginPath(); c.ellipse(w * x, h * 0.74, w * 0.07, h * 0.03, 0, 0, TAU); c.fill(); c.stroke();
        rr(c, w * x - w * 0.035, h * 0.6, w * 0.07, h * 0.08, '#F4EBDD', INK);
        rr(c, w * x - w * 0.03, h * 0.61, w * 0.06, h * 0.02, '#8E3B20');
      });
    },
    // The door: a dark lobby, a wooden door with frosted glass and warm light behind it. The knock lands here.
    fin_door: function (c, w, h) {
      grad(c, w, h, '#2A2318', '#3E2F20');
      rr(c, w * 0.28, h * 0.14, w * 0.44, h * 0.8, '#6B4226', INK);             // door
      rr(c, w * 0.33, h * 0.2, w * 0.34, h * 0.26, '#FFD98A', INK);              // frosted glass, lit
      glow(c, w * 0.5, h * 0.33, w * 0.6, 'rgba(255,217,138,0.35)');
      rr(c, w * 0.33, h * 0.52, w * 0.34, h * 0.2, '#5A3920', INK);
      rr(c, w * 0.6, h * 0.5, w * 0.04, h * 0.04, '#E9C27A', INK);              // brass handle
      rr(c, w * 0.2, h * 0.94, w * 0.6, h * 0.06, '#8E6B3E');                    // mat
    }
  };

  A.scene = function (c, w, h, key, seed) {
    if (PAINT[key]) { PAINT[key](c, w, h, seed); return c; }
    return orig.apply(this, arguments);
  };

  // Mila: long dark hair (the 'wavy' back and sides), a blue track top, a white tee under it.
  var MILA = { skin: '#A8704B', skinS: '#86553A', hair: '#1E1712', hairS: '#0E0A07', hairHi: '#3A2A20', brow: '#1E1712',
    eyes: '#1E1712', style: 'wavy', top: 'jacket', topC: '#2E5E8C', topS: '#1F4368', under: '#F4F1EA', fw: 0.98, sw: 0.98 };
  var specOf = C.spec;
  C.spec = function (who) { return who === 'mila' ? MILA : specOf(who); };
})();
