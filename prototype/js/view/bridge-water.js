// World-anchored water for bridge spans and waterfront routes. Collision stays in the layout.
P.BridgeWater = (function () {
  var W = {}, images = {}, tile = null, pattern = null, ctxOfPattern;
  var base = document.currentScript.src, streetEdge = 7, metresPerTile = 13;
  var ferryLength = 4.5, ferryBeam = 1.55, ferrySpeed = 1.7, gap = .3;

  function load(key, file) {
    var im = new Image();
    im.onload = function () { images[key] = im; };
    im.src = new URL('../../assets/bridge/' + file, base).href;
  }

  function edge(zone, side) {
    if (zone.kind === 'bridge') return P.CFG.layouts.bridge.deckHalf;
    return zone.kind === 'waterfront' && side > 0 ? P.CFG.layouts.waterfront.seaX : streetEdge;
  }

  W.applies = function (s, theme) {
    if (P.StreetArt && !P.StreetArt.current()) return false;
    return theme.L === 'water' || theme.R === 'water' || (s.geo && s.geo.zones || []).some(function (z) {
      return z.kind === 'waterfront' || z.kind === 'bridge';
    });
  };

  W.shore = function (s, y, side) {
    var zones = s.geo && s.geo.zones || [];
    var zone = zones.find(function (z) { return y >= z.y0 && y <= z.y1; });
    return zone ? edge(zone, side) : streetEdge;
  };

  function band(R, side, inner, outer, y0, y1) {
    R.ctx.rect(R.X(side > 0 ? inner : -outer), R.Y(y1), (outer - inner) * R.ppm, (y1 - y0) * R.ppm);
  }

  function mask(R, zones, reach, y0, y1, theme) {
    var c = R.ctx;
    c.beginPath();
    [-1, 1].forEach(function (side) {
      var water = !theme || theme[side > 0 ? 'R' : 'L'] === 'water';
      if (water) band(R, side, streetEdge, reach, y0, y1);
      zones.forEach(function (z) {
        var a = Math.max(y0, z.y0), b = Math.min(y1, z.y1), inner = edge(z, side);
        if (a < b && inner < streetEdge) band(R, side, inner, water ? streetEdge : reach, a, b);
      });
    });
    c.clip();
  }

  function texturedWater(R, reach, y0, y1) {
    var image = images.water, c = R.ctx, u = R.ppm;
    if (image && !tile) tile = mirroredTile(image);
    if (tile && ctxOfPattern !== c) { pattern = c.createPattern(tile, 'repeat'); ctxOfPattern = c; }
    if (!pattern) {
      c.fillStyle = '#34545E';
      c.fillRect(R.X(-reach), R.Y(y1), reach * 2 * u, (y1 - y0) * u);
      return;
    }
    var pixelsPerMetre = image.width / metresPerTile;
    c.save();
    c.translate(R.X(0), R.Y(0)); c.scale(u / pixelsPerMetre, u / pixelsPerMetre);
    c.fillStyle = pattern;
    c.fillRect(-reach * pixelsPerMetre, -y1 * pixelsPerMetre, reach * 2 * pixelsPerMetre, (y1 - y0) * pixelsPerMetre);
    c.restore();
  }

  function mirroredTile(image) {
    // Mirroring makes a continuous repeat even if the painted edges differ slightly.
    var cv = document.createElement('canvas'), w = image.width, h = image.height;
    cv.width = w * 2; cv.height = h * 2;
    var c = cv.getContext('2d');
    for (var row = 0; row < 2; row++) for (var col = 0; col < 2; col++) {
      c.setTransform(col ? -1 : 1, 0, 0, row ? -1 : 1, col * cv.width, row * cv.height);
      c.drawImage(image, 0, 0);
    }
    return cv;
  }

  function rim(R, zones, y0, y1) {
    var c = R.ctx, u = R.ppm;
    zones.forEach(function (z) {
      var a = Math.max(z.y0, y0), b = Math.min(z.y1, y1);
      if (a >= b) return;
      [-1, 1].forEach(function (side) {
        var inner = edge(z, side);
        if (inner >= streetEdge) return;
        var x = R.X(side > 0 ? inner : -inner - .22);
        c.fillStyle = '#263940'; c.fillRect(x, R.Y(b), .22 * u, (b - a) * u);
        c.fillStyle = '#A29B81'; c.fillRect(R.X(side > 0 ? inner : -inner - .065), R.Y(b), .065 * u, (b - a) * u);
      });
    });
  }

  function wake(R, x, y) {
    var c = R.ctx, u = R.ppm, sx = R.X(x), sy = R.Y(y);
    for (var i = 0; i < 4; i++) {
      var spread = (.33 + i * .17) * u, down = i * .28 * u;
      c.beginPath(); c.moveTo(sx - spread, sy + down + .12 * u);
      c.quadraticCurveTo(sx, sy + down + .58 * u, sx + spread, sy + down + .12 * u);
      c.strokeStyle = 'rgba(173,217,214,' + (.5 - i * .1) + ')';
      c.lineWidth = Math.max(1, (.044 - i * .006) * u); c.stroke();
    }
  }

  function ferry(R, s, zones, y0, y1, theme) {
    var image = images.ferry;
    var course = zones.find(function (z) { return edge(z, 1) < streetEdge; });
    if (!course && theme && theme.R === 'water' && s.geo) course = { y0: 0, y1: s.geo.length };
    if (!image || !course) return;
    var margin = ferryLength * .5 + 1.5, span = course.y1 - course.y0 - margin * 2;
    if (span <= 0) return;
    var distance = ((s.t || 0) * ferrySpeed + span * .36) % span;
    var y = course.y0 + margin + distance, x = edge(course, 1) + gap + ferryBeam / 2 + (course.moored ? 1.35 : 0);
    if (y + margin < y0 || y - margin > y1) return;
    var c = R.ctx, u = R.ppm;
    var scale = Math.min(ferryLength * u / image.height, ferryBeam * u / image.width);
    var w = image.width * scale, h = image.height * scale;
    c.save();
    c.globalAlpha *= Math.min(1, distance / 2, (span - distance) / 2);
    wake(R, x, y - h / (2 * u));
    c.drawImage(image, R.X(x) - w / 2, R.Y(y) - h / 2, w, h);
    c.restore();
  }

  function skiffs(R, s, zones, y0, y1, theme) {
    if (!P.StreetArt) return;
    zones.forEach(function (z) {
      if (z.kind !== 'waterfront') return;
      if (z.moored) {
        z.moored.forEach(function (y) {
          if (y >= y0 - 2 && y <= y1 + 2) P.StreetArt.hull(R, 'rowboat', edge(z, 1) + .67, y, .85, 2.45, false);
        });
        return;
      }
      if (!theme || theme.wprops.includes('ferry') || !theme.wprops.includes('rowboat')) return;
      for (var y = z.y0 + 6; y < z.y1 - 4; y += 15) {
        if (y < y0 - 2 || y > y1 + 2) continue;
        if (s.milestone && s.milestone.kind === 'ferryMooring' && Math.abs(y - s.milestone.y) < 15) continue;
        P.StreetArt.hull(R, 'rowboat', edge(z, 1) + .67, y, .85, 2.45, false);
      }
    });
  }

  W.draw = function (R, s, y0, y1, theme) {
    var c = R.ctx, zones = s.geo && s.geo.zones || [], reach = Math.max(16, R.cam.w + Math.abs(R.cam.x));
    c.save();
    mask(R, zones, reach, y0, y1, theme);
    texturedWater(R, reach, y0, y1);
    rim(R, zones, y0, y1);
    if (!theme || theme.wprops.includes('ferry')) ferry(R, s, zones, y0, y1, theme);
    skiffs(R, s, zones, y0, y1, theme);
    c.restore();
  };

  load('water', 'golden-horn-water.jpg');
  load('ferry', 'ferry-overhead.png');
  return W;
})();
