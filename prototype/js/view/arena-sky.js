// Street-edge artwork has one fixed ground anchor per hood and uses the same projection as the street.
P.ArenaSky = (function () {
  var A = {}, images = {}, pending = 0;
  var FRAMES = {
    clock: [60,14,268,469], firetower: [423,15,284,469], gate: [750,103,420,369], crane: [1188,50,333,427],
    wall: [13,558,357,430], chimney: [404,536,289,453], masts: [718,539,403,450], trees: [1119,548,410,441],
  };
  var root = document.currentScript && document.currentScript.src || document.baseURI;

  function load(key) {
    var im = new Image();
    pending++;
    im.onload = function () { images[key] = im; pending--; };
    im.onerror = function () { pending--; };
    im.src = new URL('../../assets/landmarks/' + key + '.webp', root).href;
  }

  A.ready = function () { return pending === 0; };
  A.position = function (s, id) {
    var p = s && s.geo && s.geo.districtLandmark;
    return p && p.theme === id ? p : null;
  };

  function bounds(kind) {
    var im = images[kind === 'mosque' ? 'mosque' : 'structures'];
    if (!im) return null;
    var r = kind === 'mosque' ? [204,4,925,1185] : FRAMES[kind];
    return { im: im, x: r[0], y: r[1], w: r[2], h: r[3] };
  }

  A.draw = function (R, s, th, y0, y1) {
    var p = A.position(s, th.id);
    if (!p || p.y < y0 - p.height || p.y > y1 + 1) return;
    if (p.kind === 'trees' && P.StreetArt) {
      R.depth(p.y, function () { P.StreetArt.tree('plane', R, p.x, p.y, 3.5); });
      return;
    }
    var b = bounds(p.kind);
    if (!b) return;
    var h = p.height * R.ppm, w = b.w / b.h * h;
    R.depth(p.y, function () {
      R.ctx.drawImage(b.im, b.x, b.y, b.w, b.h, R.X(p.x) - w / 2, R.Y(p.y) - h, w, h);
    });
  };

  load('mosque');
  load('structures');
  return A;
})();
