// Icon shapes for consumables, hint callouts and the hack zone (T4 part 10, view only). Each icon is a short list of
// primitives in units of its radius (about -1 to 1). The same list draws on the canvas and builds the SVG for a callout,
// so a world icon and its hint icon never drift apart. Shapes differ in silhouette, not only in colour (colour-blind safe).
P.ConsumablesIcons = (function () {
  var I = {}, TAU = Math.PI * 2, INK = '#14151F';
  function star(n, r0, r1) {
    var p = [], k, a, r;
    for (k = 0; k < n * 2; k++) { a = -Math.PI / 2 + k * Math.PI / n; r = k % 2 ? r0 : r1; p.push([Math.cos(a) * r, Math.sin(a) * r]); }
    return p;
  }
  var S = {
    cross: [{ t: 'poly', p: [[-0.3, -1], [0.3, -1], [0.3, -0.3], [1, -0.3], [1, 0.3], [0.3, 0.3], [0.3, 1], [-0.3, 1], [-0.3, 0.3], [-1, 0.3], [-1, -0.3], [-0.3, -0.3]] }],
    star: [{ t: 'poly', p: star(5, 0.46, 1) }],
    coin: [{ t: 'circle', x: 0, y: 0, r: 1 }, { t: 'circle', x: 0, y: 0, r: 0.62, ring: true }],
    pin: [{ t: 'poly', p: [[0, 1.05], [-0.62, 0.1], [-0.72, -0.35], [-0.5, -0.82], [0, -1.05], [0.5, -0.82], [0.72, -0.35], [0.62, 0.1]] },
      { t: 'circle', x: 0, y: -0.3, r: 0.26, hole: true }],
    crate: [{ t: 'rect', x: -0.85, y: -0.6, w: 1.7, h: 1.2 }, { t: 'rect', x: -0.55, y: -0.3, w: 1.1, h: 0.6, hole: true }],
    link: [{ t: 'ell', x: -0.28, y: 0, rx: 0.5, ry: 0.25, rot: 45, stroke: true }, { t: 'ell', x: 0.28, y: 0, rx: 0.5, ry: 0.25, rot: 45, stroke: true }],
    phone: [{ t: 'rect', x: -0.55, y: -1, w: 1.1, h: 2 }, { t: 'rect', x: -0.38, y: -0.7, w: 0.76, h: 1.2, hole: true }],
    flame: [{ t: 'poly', p: [[0, -1], [0.25, -0.45], [0.7, -0.7], [0.5, 0], [0.95, 0.2], [0.45, 0.55], [0.5, 1], [0, 0.7], [-0.5, 1], [-0.45, 0.55], [-0.95, 0.2], [-0.5, 0], [-0.7, -0.7], [-0.25, -0.45]] }],
    tram: [{ t: 'rect', x: -0.6, y: -1, w: 1.2, h: 2 }, { t: 'rect', x: -0.4, y: -0.7, w: 0.8, h: 0.4, hole: true }],
    door: [{ t: 'rect', x: -0.5, y: -1, w: 1, h: 2 }, { t: 'circle', x: 0.25, y: 0.1, r: 0.09, hole: true }],
    chevron: [{ t: 'poly', p: [[-1, -0.7], [-0.45, 0], [-1, 0.7], [-0.7, 0.7], [-0.15, 0], [-0.7, -0.7]] },
      { t: 'poly', p: [[-0.1, -0.7], [0.45, 0], [-0.1, 0.7], [0.15, 0.7], [0.7, 0], [0.15, -0.7]] }]
  };
  I.names = Object.keys(S);

  // Canvas: centre (x, y), radius r, fill colour, ink outline. Stroke-only shapes (the chain links) draw ink first, then fill.
  I.draw = function (c, name, x, y, r, fill, ink) {
    var prims = S[name] || S.crate, k, p, i, lw = Math.max(1.5, r * 0.14);
    for (k = 0; k < prims.length; k++) {
      p = prims[k];
      c.beginPath();
      if (p.t === 'poly') { c.moveTo(x + p.p[0][0] * r, y + p.p[0][1] * r); for (i = 1; i < p.p.length; i++) c.lineTo(x + p.p[i][0] * r, y + p.p[i][1] * r); c.closePath(); }
      else if (p.t === 'circle') c.arc(x + p.x * r, y + p.y * r, p.r * r, 0, TAU);
      else if (p.t === 'rect') c.rect(x + p.x * r, y + p.y * r, p.w * r, p.h * r);
      else if (p.t === 'ell') c.ellipse(x + p.x * r, y + p.y * r, p.rx * r, p.ry * r, (p.rot || 0) * Math.PI / 180, 0, TAU);
      if (p.stroke) {
        c.strokeStyle = ink; c.lineWidth = r * 0.42; c.stroke(); c.beginPath();
        if (p.t === 'ell') c.ellipse(x + p.x * r, y + p.y * r, p.rx * r, p.ry * r, (p.rot || 0) * Math.PI / 180, 0, TAU);
        c.strokeStyle = fill; c.lineWidth = r * 0.22; c.stroke();
      } else if (p.hole) { c.fillStyle = ink; c.fill(); }
      else if (p.ring) { c.strokeStyle = ink; c.lineWidth = lw; c.stroke(); }
      else { c.fillStyle = fill; c.fill(); c.strokeStyle = ink; c.lineWidth = lw; c.stroke(); }
    }
  };

  // SVG markup for a callout icon. Same primitives; the viewBox covers the shapes with a little room.
  function pts(p) { return p.map(function (q) { return q[0].toFixed(3) + ',' + q[1].toFixed(3); }).join(' '); }
  I.svg = function (name, fill, ink) {
    var prims = S[name] || S.crate, out = [], lw = 0.16;
    prims.forEach(function (p) {
      if (p.t === 'poly') out.push('<polygon points="' + pts(p.p) + '" fill="' + fill + '" stroke="' + ink + '" stroke-width="' + lw + '"/>');
      else if (p.t === 'circle') out.push(p.ring ? '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + p.r + '" fill="none" stroke="' + ink + '" stroke-width="' + lw + '"/>'
        : '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + p.r + '" fill="' + (p.hole ? ink : fill) + '" stroke="' + ink + '" stroke-width="' + lw + '"/>');
      else if (p.t === 'rect') out.push('<rect x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '" fill="' + (p.hole ? ink : fill) + '" stroke="' + ink + '" stroke-width="' + lw + '"/>');
      else if (p.t === 'ell') {
        var e = '<ellipse cx="' + p.x + '" cy="' + p.y + '" rx="' + p.rx + '" ry="' + p.ry + '" transform="rotate(' + (p.rot || 0) + ' ' + p.x + ' ' + p.y + ')" fill="none" stroke-linecap="round" ';
        out.push(e + 'stroke="' + ink + '" stroke-width="0.42"/>' + e + 'stroke="' + fill + '" stroke-width="0.22"/>');
      }
    });
    return '<svg class="hint-ico-svg" viewBox="-1.25 -1.25 2.5 2.5" aria-hidden="true">' + out.join('') + '</svg>';
  };
  return I;
})();
