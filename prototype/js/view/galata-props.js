// Commissioned Galata sprites. The canvas has no z axis: height is a screen-space
// offset in world metres, and collision remains on the ground plane in s.geo.
P.GalataProps = (function () {
  var G = {};
  var specs = {
    stairrail:     { width: 2,    depth: 0.1, height: 0.9 },
    flowerpot:     { width: 0.5,  depth: 0.5, height: 0.5, round: true },
    tavlatable:    { width: 0.9,  depth: 0.9, height: 0.8, breakable: true },
    bench:         { width: 0.6,  depth: 1.8, height: 0.9, breakable: true },
    planter:       { width: 1.2,  depth: 1.2, height: 0.9, breakable: true },
    bollard:       { width: 0.35, depth: 0.35, height: 0.9, round: true },
    balconylantern:{ width: 0.4,  depth: 0.4, height: 0.6, clearance: 2.5 }
  };
  var frames = {}, pending = Object.keys(specs).length;
  var diagonal = Math.SQRT1_2, foreshorten = Math.sin(55 * Math.PI / 180);
  var atlasCell = 128, frameSize = 102, gutter = (atlasCell - frameSize) / 2;

  Object.keys(specs).forEach(function (kind) {
    var image = new Image();
    image.onload = function () { frames[kind] = image; pending--; };
    image.onerror = function () { pending--; };
    image.src = 'assets/galata/' + kind + '.png';
  });

  G.ready = function () { return pending === 0; };
  G.spec = function (kind) { return specs[kind]; };
  G.draw = function (R, kind, x, y, opts) {
    var spec = specs[kind], sprite = frames[kind], o = opts || {};
    if (!sprite || (o.broken && !spec.breakable)) return false;
    var frame = o.broken || o.turned ? 3 : Math.min(2, Math.floor((o.v || 0) * 3));
    var w = spec.width, d = spec.depth, s = R.ppm;
    var span = spec.round ? w : (w + d) * diagonal;
    var floorDepth = (spec.round ? d : span) * foreshorten;
    var elevation = spec.clearance || 0;
    // Cap the visible silhouette at its brief height. The baked top faces already
    // carry perspective, so adding the whole floor depth would make cover dwarf Arda.
    var height = o.broken ? Math.min(spec.height, floorDepth / 2 + spec.height * 0.2) : spec.height;
    var left = R.X(x) - span * s / 2;
    var bottom = R.Y(y) + (elevation ? -elevation : floorDepth / 2) * s;
    var top = bottom - height * s;
    var c = R.ctx;
    c.save();
    if (elevation && o.scene) c.globalAlpha *= P.ArenaOverhead.opacity(R, o.scene, kind + ':' + x + ':' + y, left, top, left + span * s, bottom);
    // Equal padded atlas cells preserve the scale of individual silhouettes in each state.
    var cell = atlasCell, factor = cell / frameSize;
    c.drawImage(sprite, (frame % 2) * cell, Math.floor(frame / 2) * cell, cell, cell,
      left - gutter / frameSize * span * s, top - gutter / frameSize * height * s, span * s * factor, height * s * factor);
    c.restore();
    return true;
  };

  // Dress the edges of the stairs in the ground pass, away from the centre lane.
  G.street = function (R, s, y0, y1) {
    var rail = specs.stairrail;
    for (var y = 5 + 18 * Math.max(0, Math.ceil((y0 - 7) / 18)); y <= y1 + 2 && y < s.geo.exitY; y += 18) {
      var row = Math.round((y - 5) / 18), side = row % 2 ? -1 : 1, v = (row % 3 + 0.5) / 3;
      var x = side * 4.05;
      if (!s.geo.blocks.some(function (b) { return Math.abs(b.x - x) < (b.w + rail.width) / 2 && Math.abs(b.y - y) < (b.h + rail.depth) / 2; })) {
        G.draw(R, 'stairrail', x, y, { v: v, turned: row % 4 === 3 });
      }
      G.draw(R, 'flowerpot', -side * 4.55, y + 1, { v: v, turned: row % 4 === 3 });
    }
  };

  G.overhead = function (R, s, y0, y1) {
    for (var y = 8 + 12 * Math.max(0, Math.ceil((y0 - 9) / 12)); y <= y1 + 4 && y < s.geo.exitY; y += 12) {
      var row = Math.round((y - 8) / 12), side = row % 2 ? -1 : 1;
      G.draw(R, 'balconylantern', side * 4.25, y, { v: (row % 3 + 0.5) / 3, turned: row % 4 === 3, scene: s });
    }
  };
  return G;
})();
