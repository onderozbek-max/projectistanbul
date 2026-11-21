// Illustrated street services use the same ground position as the interaction.
// The renderer remembers a spent terminal after the play state drops its ring.
P.StreetServiceArt = (function () {
  var A = {}, art = {}, scene, terminals = new Map();
  var root = typeof document !== 'undefined' && (document.currentScript && document.currentScript.src || document.baseURI);
  var sizes = { atm: [0.98,1.34], traffic: [0.77,1.19], cell: [0.85,1.47],
    shutter: [0.82,1.19], tram: [0.60,1.36], car: [0.86,1.16] };
  function image(kind) {
    if (!root) return null;
    if (!art[kind]) {
      var img = new Image();
      img.src = new URL('../../assets/services/' + kind + '.webp', root).href;
      art[kind] = img;
    }
    var ready = art[kind];
    return ready.complete && ready.naturalWidth ? ready : null;
  }
  function draw(c, kind, X, Y, w, h, used) {
    var img = image(kind);
    if (!img) return false;
    c.save();
    if (used) c.filter = 'saturate(.48) brightness(.84)';
    c.drawImage(img, X - w / 2, Y - h, w, h);
    c.restore();
    return true;
  }
  A.heal = function (kind, c, X, Y, u, opts) {
    var state = opts.state || 'idle', width = (opts.w || 1.4) * u, depth = (opts.h || 1) * u;
    var h = width * (kind === 'bufe' ? 1.02 : 1.17), base = Y + depth * .38;
    P.Props.h.shadow(c, X, Y, width * .57, depth * .45);
    if (!draw(c, kind, X, base, width, h, state === 'empty') && P.StreetArt) P.StreetArt.footprint(c, X, Y, width, depth);
    P.Consumables.stationSign(c, X, base - h - .27 * u, u, state, performance.now() / 1000,
      !(P.Settings && P.Settings.reduceMotion), kind === 'bufe' ? 'bufe' : 'cross');
  };
  A.terminals = function (R, s) {
    if (scene !== s) { scene = s; terminals.clear(); }
    s.hacks.forEach(function (h) { if (sizes[h.kind]) terminals.set(h.id, h); });
    terminals.forEach(function (h) {
      var size = sizes[h.kind], u = R.ppm, ground = h.y + .55, X = R.X(h.x), Y = R.Y(ground);
      if (Math.abs(Y) > R.H / 2 + 2 * u || Math.abs(X) > R.W / 2 + u) return;
      R.depth(ground, function () {
        P.Props.h.shadow(R.ctx, X, Y - .10 * u, size[0] * .55 * u, .13 * u);
        if (!draw(R.ctx, h.kind, X, Y, size[0] * u, size[1] * u, h.state === 'done') && P.StreetArt) {
          P.StreetArt.footprint(R.ctx, X, Y, size[0] * u, .46 * u);
        }
      });
    });
  };
  ['eczane', 'bufe'].concat(Object.keys(sizes)).forEach(image);
  return A;
})();
