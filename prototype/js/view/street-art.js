// Illustrated street cover, verge trees and overhead vehicles. Every piece uses a fixed world anchor.
P.StreetArt = (function () {
  var A = {}, images = {}, vehicles = { car: 'car', taxi: 'taxi', dolmus: 'dolmus', minibus: 'dolmus', lx_truck: 'truck' };
  var locations = { 'kaan-parts-reset':'../../assets/landmarks/first30-reset/kaan-parts-v2.png', 'boss-torsos-reset':'../../assets/landmarks/first30-reset/boss-torsos-v2.png', 'boss-controls-reset':'../../assets/landmarks/first30-reset/boss-controls-v1.png', ferry: '../../assets/bridge/ferry-overhead.png', 'cook-poses': '../../assets/landmarks/cook-poses.webp',
    'market-carry-reset': '../../assets/landmarks/first30-reset/market-carry-v1.png',
    'weather-controls-reset': '../../assets/landmarks/first30-reset/weather-controls-v1.png',
    'civilian-runners': '../../assets/streets/civilian-runners.png',
    'civilian-idle': '../../assets/streets/civilian-idle-v1.png',
    'restaurant-cast': '../../assets/streets/restaurant-cast-v2.png',
    'world-controls-audit8': '../../assets/landmarks/world-controls-audit8.png',
    'work-stages-audit8': '../../assets/landmarks/work-stages-audit8.png',
    'helper-roles-audit8': '../../assets/landmarks/helper-roles-audit8.png',
    'opening-action-audit8': '../../assets/landmarks/opening-action-audit8.png',
    'boss-acting-audit8': '../../assets/landmarks/boss-acting-audit8.png',
    'boss-heavy-audit8': '../../assets/landmarks/boss-heavy-audit8.png',
    'kaan-scenes-audit8': '../../assets/landmarks/kaan-scenes-audit8.png' };
  Object.keys(P.CFG.bossParts || {}).forEach(function(id){ locations['boss-parts-'+id]='../../'+P.CFG.bossParts[id].file; });
  var opening = ['cook-poses', 'restaurant-floor', 'restaurant-serving-counter', 'restaurant-fridge',
    'restaurant-table', 'restaurant-chair-front', 'restaurant-chair-side', 'restaurant-cast', 'civilian-runners', 'civilian-idle',
    'opening-action-audit8', 'boss-torsos-reset', 'boss-parts-cook'];
  var covers = { booth: [1, .45], tea: [.94, .34], pyramid: [.92, .39], fountain: [.90, .40],
    rack: [.94, .24], cart: [.95, .32], gate: [.99, .16], grill: [.93, .36], garden: [.93, .42], drums: [.89, .38] };
  var shared = { cafe: 'tea', tables: 'tea', tavlatable: 'tea', cart: 'cart', planter: 'garden', kiosk: 'booth' };
  var root = typeof document !== 'undefined' && (document.currentScript && document.currentScript.src || document.baseURI);
  function image(kind, retry) {
    if (!root) return null;
    if (!images[kind] || retry) {
      var im = new Image(), url = new URL(locations[kind] || '../../assets/streets/' + kind + '.webp', root);
      if (retry) url.searchParams.set('retry', String(Date.now()));
      im.src = url.href;
      images[kind] = im;
    }
    return images[kind].naturalWidth ? images[kind] : null;
  }
  A.current = function () { return !!root && (!P.ArtRaster || P.ArtRaster.enabled()); };
  A.image = function (kind) { return A.current() ? image(kind) : null; };
  A.awaitOpening = function (done) { return A.awaitList(opening,done); };
  A.awaitList = function (keys,done) {
    if (!A.current()) return true;
    keys.forEach(function (key) {
      var cached = images[key];
      image(key, cached && cached.complete && !cached.naturalWidth);
    });
    function ready() { return keys.every(function (key) { return !!images[key].naturalWidth; }); }
    if (ready()) return true;
    var deadline = performance.now() + 4500;
    var dismiss = P.UI.toast(P.t('ui.art.openingWait'), null, 3.5);
    setTimeout(function check() {
      if (ready()) { if (dismiss) dismiss(); done(true); return; }
      if (performance.now() >= deadline || keys.some(function (key) { return images[key].complete && !images[key].naturalWidth; })) {
        keys.forEach(function (key) { if (!images[key].complete) delete images[key]; });
        if (dismiss) dismiss();
        done(false); return;
      }
      setTimeout(check, 80);
    }, 80);
    return false;
  };
  A.part = function (c, kind, x, y, w, h) {
    var im = image(kind);
    if (!im) return false;
    c.drawImage(im, x, y, w, h);
    return true;
  };
  A.footprint = function (c, X, Y, w, h) {
    c.fillStyle = '#424649'; c.strokeStyle = '#202326'; c.lineWidth = 1.5;
    c.fillRect(X - w / 2, Y - h / 2, w, h); c.strokeRect(X - w / 2, Y - h / 2, w, h);
  };
  function overhead(c, kind, X, Y, w, h, solid) {
    var im = image(kind);
    if (!im) {
      if (solid) A.footprint(c, X, Y, w, h);
      return;
    }
    var scale = Math.min(w / im.naturalWidth, h / im.naturalHeight);
    var dw = im.naturalWidth * scale, dh = im.naturalHeight * scale;
    c.drawImage(im, X - dw / 2, Y - dh / 2, dw, dh);
  }
  function anchored(c, kind, X, Y, w) {
    var im = image(kind);
    if (!im) return false;
    var h = w * im.naturalHeight / im.naturalWidth;
    c.drawImage(im, X - w / 2, Y - h, w, h);
    return true;
  }
  A.tree = function (kind, R, x, y, w) {
    var X = R.X(x), Y = R.Y(y), u = R.ppm;
    anchored(R.ctx, kind === 'palm' ? 'palm' : 'plane', X, Y, w * u);
  };
  A.vehicle = function (kind, R, x, y, w, h) {
    if (!vehicles[kind] || !A.current()) return false;
    var u = R.ppm;
    overhead(R.ctx, vehicles[kind], R.X(x), R.Y(y), w * u, h * u, true);
    return true;
  };
  A.hull = function (R, kind, x, y, w, h, solid) {
    overhead(R.ctx, kind, R.X(x), R.Y(y), w * R.ppm, h * R.ppm, solid);
  };
  A.tram = function (c, X, Y, w, h, heading) {
    if (!A.current()) return false;
    c.save(); c.translate(X, Y);
    if (heading) c.rotate(heading);
    overhead(c, 'tram', 0, 0, w, h, true);
    c.restore();
    return true;
  };
  A.cover = function (kind, c, X, Y, u, o) {
    var spec = covers[kind];
    if (!spec || !root) return false;
    var drawn = anchored(c, kind, X, Y + (o.h || 3) * spec[1] * u, (o.w || 3) * spec[0] * u);
    if (!drawn && !o.decorative && o.w && o.h) A.footprint(c, X, Y, o.w * u, o.h * u);
    return true;
  };
  A.shared = function (kind, c, X, Y, u, o) {
    return A.current() && !!shared[kind] && A.cover(shared[kind], c, X, Y, u,
      { w: o.w || 1.35, h: o.h || .9, decorative: !o.w || !o.h });
  };
  A.prop = function (kind, R, x, y, o) {
    if (!A.current()) return false;
    if (kind === 'tree' || kind === 'cinar' || kind === 'palm') {
      A.tree(kind, R, x, y - (o.h ? o.h * .28 : 0), o.w ? Math.max(2.4, o.w * 1.15) : 2.35);
      return true;
    }
    if (kind === 'bench' || kind === 'lx_pillar' || kind === 'lx_wall') {
      furniture(kind, R, x, y, o);
      return true;
    }
    if (kind === 'lx_boat' || kind === 'rowboat' || kind === 'ferry') {
      if (kind === 'lx_boat' && o.w && o.h) boatStand(R, x, y, o.w, o.h);
      A.hull(R, kind === 'lx_boat' ? 'rowboat' : kind, x, y, o.w || 1.65, o.h || 4.6, !!o.w);
      return true;
    }
    return A.vehicle(kind, R, x, y, o.w || 1.9, o.h || 4.2);
  };

  function furniture(kind, R, x, y, o) {
    var c = R.ctx, X = R.X(x), Y = R.Y(y), u = R.ppm, w = o.w || .60, h = o.h || 1.8;
    var key = kind === 'bench' ? w > h ? 'bench' : 'bench-lengthwise' : kind === 'lx_pillar' ? 'pillar' : 'shop-wall';
    var im = image(key);
    if (!im) {
      if (o.w && o.h) A.footprint(c, X, Y, w * u, h * u);
      return;
    }
    var width = key === 'bench-lengthwise' ? Math.min(w * 1.55, h * im.naturalWidth / im.naturalHeight) : w;
    var height = width * im.naturalHeight / im.naturalWidth;
    var base = key === 'bench-lengthwise' ? Y + height * .48 * u : Y + h * .45 * u;
    if (P.Props && !o.airborne) P.Props.h.shadow(c, X, Y, w * .5 * u, h * .35 * u);
    c.save(); c.translate(X, base);
    if (key === 'bench-lengthwise' && x < 0) c.scale(-1, 1);
    c.drawImage(im, -width * u / 2, -height * u, width * u, height * u);
    c.restore();
  }

  function boatStand(R, x, y, w, h) {
    var c = R.ctx, u = R.ppm;
    [-1,1].forEach(function (side) {
      var Y = R.Y(y + side * h * .27);
      c.fillStyle = '#3D3B38'; c.fillRect(R.X(x - w / 2), Y, w * u, .20 * u);
      c.fillStyle = '#96765A'; c.fillRect(R.X(x - w / 2), Y, w * u, .075 * u);
    });
  }

  if (A.current()) {
    ['tram', 'bench', 'bench-lengthwise', 'pillar', 'shop-wall', 'truck', 'ferry', 'rowboat',
      'dock-crane', 'dock-crate', 'market-awning', 'tunnel-arch'].concat(opening, Object.keys(covers)).forEach(function (key) { image(key); });
  }
  return A;
})();
