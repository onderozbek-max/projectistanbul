// Commissioned Saray props for the raster review build. Atlas rectangles are in pixels;
// the draw sizes and anchors below translate the illustrated perspective into world metres.
P.SarayProps = (function () {
  var A = { enabled: new URLSearchParams(location.search).get('art') === 'raster' };
  var assetRoot = new URL('../../assets/saray/', document.currentScript.src);
  var images = Object.create(null);
  var poleHeight = 2.4, buntingEvery = 12;
  var art = {
    // [atlas, pixels in one metre across, pixels in one metre vertically, anchor X, anchor Y]
    barrier: ['stanchion', 255, 252, 38, 240],
    kiosk: ['ticketkiosk', 137, 198, 109, 205],
    cart: ['audioguidecart', 163, 232, 116, 198],
    tree: ['planetree', 48, 66, 120, 235],
    bench: ['stonebench', 140, 372, 126, 132],
    lx_stall: ['souvenirstand', 131, 210, 118, 221],
    flagpole: ['flagpole', 500, 252 / poleHeight, 29, 252],
    bunting: ['bunting', 42, 86, 126, 32]
  };
  var cells = {
    barrier: [[127,252],[127,252],[127,252],[221,183,40,163]],
    kiosk: [[219,237],[219,237],[219,237],[220,252,109,218]],
    cart: [[246,232],[246,232],[246,232],[252,224,116,196]],
    tree: [[240,235],[245,234,123,234],[252,240,126,240],[235,240,117,240]],
    bench: [[252,186],[252,186],[252,186],[197,228,98,155]],
    lx_stall: [[236,252],[236,252],[236,252],[246,251,123,219]],
    flagpole: [[58,252],[58,252],[58,252],[64,251,32,251]],
    bunting: [[252,32],[252,31,126,31],[252,32],[32,252]]
  };
  // These are heights of the lowest part over a walkable route. The full-height bare
  // pole stands beside the lane; the tree's grounded trunk keeps its own footprint.
  var clearance = { tree: 2.5, bunting: 2.5 };

  A.prepare = function () {
    if (!A.enabled || Object.keys(images).length) return;
    Object.keys(art).forEach(function (kind) {
      var image = new Image();
      image.src = new URL(art[kind][0] + '.png', assetRoot).href;
      images[kind] = image;
    });
  };
  A.ready = function () {
    return A.enabled && Object.keys(art).every(function (kind) { return imageReady(kind); });
  };
  function imageReady(kind) {
    var image = images[kind];
    return !!(image && image.complete && image.naturalWidth);
  }

  function draw(R, s, kind, x, y, v, height, fade, scaleX, scaleY) {
    if (!imageReady(kind)) return false;
    var d = art[kind], crop = cells[kind][v], sx = R.ppm / d[1] * (scaleX || 1), sy = R.ppm / d[2] * (scaleY || 1);
    var left = R.X(x) - (crop[2] == null ? d[3] : crop[2]) * sx;
    var top = R.Y(y) - height * R.ppm - (crop[3] == null ? d[4] : crop[3]) * sy;
    var w = crop[0] * sx, h = crop[1] * sy, c = R.ctx;
    c.save();
    if (fade) c.globalAlpha *= P.ArenaOverhead.opacity(R, s, 'saray|' + kind + '|' + x + '|' + y, left, top, left + w, top + h, height + (kind === 'tree' ? h / (2 * R.ppm) : 0));
    c.drawImage(images[kind], (v % 2) * 256, (v >> 1) * 256, crop[0], crop[1], left, top, w, h);
    c.restore();
    return true;
  }

  function trunk(R, s, b) {
    var c = R.ctx, u = R.ppm, X = R.X(b.x), Y = R.Y(b.y), top = Y - clearance.tree * u, w = b.w * u;
    c.save();
    c.globalAlpha *= P.ArenaOverhead.opacity(R, s, 'saray|trunk|' + b.x + '|' + b.y, X - w / 2, top, X + w / 2, Y);
    c.beginPath();
    c.moveTo(X - w / 3, top + 0.15 * u);
    c.lineTo(X + w / 3, top);
    c.lineTo(X + w * 0.44, Y + b.h * 0.20 * u);
    c.quadraticCurveTo(X, Y + b.h * 0.50 * u, X - w * 0.44, Y + b.h * 0.20 * u);
    c.closePath();
    c.fillStyle = '#B5651D'; c.fill();
    c.lineWidth = 0.04 * u; c.strokeStyle = '#14151F'; c.stroke();
    c.restore();
  }

  function variant(b) {
    if (b.v != null) return Math.min(2, Math.floor(b.v * 3));
    return Math.floor(Math.abs(b.x * 10 + b.y * 13)) % 3;
  }
  A.ground = function (R, s, b, broken) {
    if (!s.geo.sarayRaster || !imageReady(b.kind)) return false;
    if (b.kind === 'tree') { trunk(R, s, b); return true; }
    if (broken && b.kind === 'bench') return false;
    var sx = b.kind === 'lx_stall' ? b.w / P.CFG.levels.kinds.lx_stall[0] : 1;
    var sy = b.kind === 'lx_stall' ? b.h / P.CFG.levels.kinds.lx_stall[1] : 1;
    var frame = broken || (b.kind === 'bench' && b.h > b.w) ? 3 : variant(b);
    return draw(R, s, b.kind, b.x, b.y, frame, 0, false, sx, sy);
  };

  A.overhead = function (R, s, y0, y1) {
    if (!s.geo || !s.geo.sarayRaster || !imageReady('bunting')) return false;
    s.geo.blocks.forEach(function (b) {
      if (b.kind === 'tree' && b.y > y0 - 5 && b.y < y1 + 3) {
        draw(R, s, 'tree', b.x, b.y, variant(b), clearance.tree, true);
      }
    });
    var side = P.CFG.view.heroClampX + P.CFG.hero.radius + 0.08;
    for (var y = Math.max(buntingEvery, Math.ceil((y0 - 4) / buntingEvery) * buntingEvery);
         y < y1 && y < s.geo.exitY; y += buntingEvery) {
      var v = (y / buntingEvery) % 3;
      draw(R, s, 'bunting', 0, y, v, clearance.bunting, true);
      // These bare guide poles flank the route. Offset their bases from the walkable
      // boundary so a 1.2 m hero never has to pass through or under the shaft.
      draw(R, s, 'flagpole', -side, y + 1, v, 0, true);
      draw(R, s, 'flagpole', side, y + 1, v === 0 ? 3 : v, 0, true);
    }
    return true;
  };

  return A;
})();
