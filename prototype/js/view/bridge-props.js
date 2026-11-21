// Galata Bridge raster sheets. Frame coordinates and deck anchors are in source pixels.
P.BridgeProps = (function () {
  // [sheet x, sheet y, width, height, anchor x, anchor y, optional metres per pixel]
  var FRAMES = {
    bin: [[152,66,208,379,104,338],[662,65,212,381,106,340],[152,577,208,382,104,341],[564,603,408,329,243,164]],
    bollard: [[30,31,169,158,84.5,136],[235,31,168,158,84,136],[439,31,169,158,84.5,136]],
    fishingline: [[67,110,378,291,189,145],[578,130,380,252,190,126],[65,606,382,323,191,161],[577,619,381,297,190,148]],
    lanternstring: [[60,57,391,397,194.712,334.378,0.0175006],[572,57,391,397,194.712,334.378,0.0175006],[60,569,391,397,194.712,334.378,0.0175006],[577,564,382,408,191.394,338.159,0.0177993]],
    rodholder: [[100,52,311,408,150,374],[610,52,315,408,150,374],[100,566,311,404,150,371],[654,564,227,407,96,370]],
    stairbarrier: [[52,112,408,287,201,221],[564,112,408,287,201,221],[52,624,408,288,201,221],[613,587,309,361,154,270]],
    tacklecrate: [[90,70,332,372,158,325],[602,70,332,372,158,325],[90,582,332,372,158,325],[584,564,367,408,168,304]],
  };
  var BODY_SCALE = { bin: 1 / 282, crates: 0.7 / 258 };
  var LINE_LENGTH = [430, 430, 434, 437];
  var SOLIDS = { bin: 'bin', crates: 'tacklecrate', barrier: 'stairbarrier' };
  var images = {}, pending = 0;

  function load() {
    Object.keys(FRAMES).forEach(function (name) {
      var image = new Image();
      pending++;
      image.onload = function () { images[name] = image; pending--; };
      image.onerror = function () { pending--; };
      var file = name === 'bollard' ? 'bollard-v2' : name;
      image.src = new URL('../../assets/bridge/' + file + '.png', document.currentScript.src).href;
    });
  }

  function paint(R, name, frame, x, y, sx, sy) {
    var image = images[name], f = FRAMES[name][frame];
    if (!image) return false;
    sx *= R.ppm; sy *= R.ppm;
    R.ctx.drawImage(image, f[0], f[1], f[2], f[3], R.X(x) - f[4] * sx, R.Y(y) - f[5] * sy, f[2] * sx, f[3] * sy);
    return true;
  }

  function drawBlock(R, kind, x, y, o) {
    if (kind === 'bollard') return drawBollard(R, x, y, o);
    var name = SOLIDS[kind], v, sx, sy;
    if (!name || !o.w || !o.h || !images[name]) return false;
    // Barrier art follows the long axis of the collision rectangle. Its rotated view is for a north-south footprint.
    v = kind === 'barrier' && o.h > o.w ? 3 : Math.min(2, Math.floor((o.v || 0) * 3));
    if (kind === 'barrier') {
      sx = (v === 3 ? o.h : o.w) / FRAMES.stairbarrier[0][2];
      sy = 1 / 151;
    } else {
      sx = sy = BODY_SCALE[kind];
    }
    P.Props.h.shadow(R.ctx, R.X(x), R.Y(y), o.w * R.ppm / 2, o.h * R.ppm * 0.3);
    return paint(R, name, v, x, y, sx, sy);
  }

  function drawBollard(R, x, y, o) {
    var frames = FRAMES.bollard, w = o.w || P.CFG.levels.kinds.bollard[0], h = o.h || w;
    var variant = o.v == null ? (o.k || 0) % frames.length : Math.min(frames.length - 1, Math.floor(o.v * frames.length));
    var scale = w / frames[variant][2], c = R.ctx;
    P.Props.h.shadow(c, R.X(x), R.Y(y), w * R.ppm / 2, h * R.ppm * .3);
    if (!paint(R, 'bollard', variant, x, y, scale, scale) && o.w) {
      // A footprint remains visible if the sprite is still loading or unavailable.
      P.Props.h.ell(c, R.X(x), R.Y(y), w * R.ppm / 2, h * R.ppm / 2, '#414B50', 1.5);
    }
    return true;
  }

  function drawRail(R, s, y0, y1) {
    if (s.levelIndex !== 16 || !images.rodholder) return;
    var zones = s.geo && s.geo.zones || [], rail = P.CFG.layouts.bridge.deckHalf;
    zones.forEach(function (z) {
      if (z.kind !== 'bridge') return;
      for (var y = z.y0 + 4, i = 0; y < z.y1 - 2; y += 7, i++) {
        if (y < y0 - 2 || y > y1 + 2) continue;
        // Seat the outer edge on the deck so the water pass cannot cut off the rail.
        var v = i % 4, f = FRAMES.rodholder[v], right = i % 2, scale = 1 / 151;
        var outer = (right ? f[2] - f[4] : f[4]) * scale;
        paint(R, 'rodholder', v, (right ? 1 : -1) * (rail - outer - 0.05), y, scale, scale);
      }
    });
  }

  function drawFishing(R, s, y0, y1) {
    if (s.levelIndex !== 17 || !s.obj || s.obj.id !== 'collect.cut' || s.obj.state === 'failed') return;
    s.obj.items.forEach(function (item, i) {
      if (item.got || item.y < y0 - 2 || item.y > y1 + 2) return;
      // Keep the central float on the existing objective's interaction point.
      var v = i % 4, scale = 3 / LINE_LENGTH[v];
      paint(R, 'fishingline', v, item.x, item.y + 0.10, scale, scale);
    });
  }

  function drawBroken(R, zone) {
    var kind = zone.rec.kind;
    if (kind !== 'bin' && kind !== 'crates') return false;
    var scale = BODY_SCALE[kind];
    return paint(R, SOLIDS[kind], 3, zone.x, zone.y, scale, scale);
  }

  function drawLanterns(R, s, y0, y1) {
    if (s.levelIndex !== 17 || !images.lanternstring) return;
    var last = s.geo && s.geo.exitY || 0;
    for (var i = Math.max(0, Math.ceil((y0 - 12) / 16)); 12 + i * 16 < Math.min(y1 + 2, last - 3); i++) {
      var y = 12 + i * 16, v = i % 4, f = FRAMES.lanternstring[v], u = f[6] * R.ppm;
      var x0 = R.X(0) - f[4] * u, y0px = R.Y(y) - f[5] * u;
      R.ctx.save();
      R.ctx.globalAlpha *= P.ArenaOverhead.opacity(R, s, 'bridge-lantern:' + i, x0, y0px, x0 + f[2] * u, y0px + f[3] * u);
      paint(R, 'lanternstring', v, 0, y, f[6], f[6]);
      R.ctx.restore();
    }
  }

  load();
  return {
    ready: function () { return pending === 0; },
    hasRail: function () { return !!images.rodholder; },
    drawBlock: drawBlock, drawRail: drawRail, drawFishing: drawFishing,
    drawBroken: drawBroken, drawLanterns: drawLanterns,
  };
})();
