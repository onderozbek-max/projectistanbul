// R1-T2 pipeline A: a stronger procedural style. Same canvas primitives as today's engine, plus (1) extra detail layers
// and (2) a post pass that gives every flat shape a night_ink outline, bands the colour into cel tones, and adds paper
// grain. No image files, no generation. Sample code only; if A is picked it moves into prototype/js/view/.
(function () {
  var A = P.ComicArt, INK = '#14151F', TAU = Math.PI * 2;
  var S = {};
  P.StyleA = S;

  function rr(c, x, y, w, h, fill, line) {
    c.fillStyle = fill; c.fillRect(x, y, w, h);
    if (line) { c.strokeStyle = INK; c.lineWidth = line; c.strokeRect(x, y, w, h); }
  }
  function poly(c, pts, fill) { c.beginPath(); pts.forEach(function (p, i) { i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.closePath(); c.fillStyle = fill; c.fill(); }

  function facade(c) {
    rr(c, 24, 148, 342, 574, '#EBD6AE');
    rr(c, 276, 160, 90, 562, 'rgba(124,110,154,.30)');
    var xs = [84, 195, 306], ys = [164, 276, 388, 500];
    ys.forEach(function (y) { xs.forEach(function (x) {
      rr(c, x - 27, y + 22, 54, 64, '#2B3550');
      rr(c, x - 53, y + 22, 24, 64, '#2F6FA3'); rr(c, x + 29, y + 22, 24, 64, '#275C8A');
      rr(c, x - 31, y + 86, 62, 8, '#D9C39C');
    }); });
    rr(c, 24, 598, 342, 124, '#D8C095');
    rr(c, 36, 626, 150, 96, '#3A3F56'); poly(c, [[30, 600], [192, 600], [186, 632], [36, 632]], '#D7263D');
    rr(c, 206, 632, 64, 90, '#6B4A2B'); rr(c, 284, 648, 70, 74, '#C9B084');
    rr(c, 44, 688, 134, 12, '#B5651D');
    [68, 96, 124, 152].forEach(function (x) { c.fillStyle = '#E9A23B'; c.beginPath(); c.ellipse(x, 682, 14, 8, 0, 0, TAU); c.fill(); });
    rr(c, 0, 722, 390, 122, '#7A808B');
    poly(c, [[24, 722], [-6, 790], [180, 844], [270, 844], [170, 722]], 'rgba(60,63,102,.30)');
  }
  function flat(c) {
    rr(c, 0, 0, 390, 600, '#F1D9AE');
    rr(c, 0, 420, 390, 120, '#4B86B8'); rr(c, 0, 392, 390, 30, '#8A6A44'); rr(c, 0, 540, 390, 60, '#6B4A2B');
    rr(c, 226, 96, 136, 172, '#262C4D');
    rr(c, 196, 80, 34, 206, '#D7263D'); rr(c, 360, 80, 34, 206, '#D7263D');
    rr(c, 0, 600, 390, 244, '#A47A4A');
    poly(c, [[28, 660], [362, 660], [384, 796], [6, 796]], '#9E2F3F');
    c.fillStyle = '#D9B17A'; c.beginPath(); c.ellipse(195, 700, 128, 26, 0, 0, TAU); c.fill();
    [[161, 676], [231, 680]].forEach(function (p) { rr(c, p[0] - 12, p[1] - 8, 24, 14, '#F4EBDD'); });
    rr(c, 40, 130, 84, 104, '#8A5A2B'); rr(c, 50, 140, 64, 84, '#E9D9B7');
    var g = c.createRadialGradient(190, 290, 10, 190, 290, 230); g.addColorStop(0, 'rgba(255,213,138,.7)'); g.addColorStop(1, 'rgba(255,213,138,0)');
    c.fillStyle = g; c.fillRect(0, 0, 390, 600);
  }
  function panel(c) {
    c.fillStyle = '#F4EBDD'; c.fillRect(0, 0, 390, 844);
    c.save(); c.translate(12, 64); c.beginPath(); c.rect(0, 0, 366, 704); c.clip();
    A.scene(c, 366, 704, 'bridge', 7); A.wash(c, 366, 704, 'warm');
    c.restore();
  }

  // Post pass at device resolution, backgrounds only (busts are drawn after it): ink edges (thickened) and grain.
  function post(c, W, H, rgn) {
    var im = c.getImageData(0, 0, W, H), d = im.data, n = W * H, edge = new Uint8Array(n), i, x, y;
    for (y = 0; y < H - 1; y++) for (x = 0; x < W - 1; x++) {
      i = (y * W + x) * 4;
      var r = i + 4, b = i + W * 4;
      var dd = Math.abs(d[i] - d[r]) + Math.abs(d[i + 1] - d[r + 1]) + Math.abs(d[i + 2] - d[r + 2]) +
               Math.abs(d[i] - d[b]) + Math.abs(d[i + 1] - d[b + 1]) + Math.abs(d[i + 2] - d[b + 2]);
      if (dd > 80) edge[y * W + x] = 1;
    }
    var rad = Math.round(W / 390 * 1.4), thick = new Uint8Array(n);
    for (y = rad; y < H - rad; y++) for (x = rad; x < W - rad; x++) if (edge[y * W + x])
      for (var oy = -rad; oy <= rad; oy++) for (var ox = -rad; ox <= rad; ox++) thick[(y + oy) * W + x + ox] = 1;
    for (i = 0; i < n; i++) {
      var p = i * 4;
      if (thick[i]) { d[p] = 20; d[p + 1] = 21; d[p + 2] = 31; continue; }
      var g = (rgn() - 0.5) * 22; d[p] += g; d[p + 1] += g; d[p + 2] += g;
    }
    c.putImageData(im, 0, 0);
  }

  S.draw = function (c, subj, DPR) {
    if (subj === 'building') {
      A.scene(c, 390, 844, 'apartment', 7); facade(c); A.wash(c, 390, 844, 'warm');
    } else if (subj === 'flat') flat(c);
    else panel(c);
    var rgn = A.rng(5);
    post(c, 390 * DPR, 844 * DPR, rgn);
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (subj === 'panel') {
      c.save(); c.translate(12, 64); c.beginPath(); c.rect(0, 0, 366, 704); c.clip();
      A.bust(c, 'arda', 'neutral', 100, 690, 300, {});
      A.bust(c, 'kaan', 'neutral', 270, 690, 300, { flip: true });
      c.restore(); c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(12, 64, 366, 704); }
    else { c.strokeStyle = INK; c.lineWidth = 6; c.strokeRect(0, 0, 390, 844); }
  };
})();
