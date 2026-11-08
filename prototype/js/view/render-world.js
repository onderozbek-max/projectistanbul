// Static environment drawing: street, facades, doors, restaurant, props (LD 3, 6; gameplay-peak.svg palette).
P.RenderWorld = (function () {
  var W = {}, L = function () { return P.CFG.level; };
  var SHOPS = [ { side: 1, y: 22, name: 'Pera Kitap' }, { side: -1, y: 44, name: 'Telefon Tamir' },
    { side: 1, y: 58, name: 'Çiçek Optik' }, { side: -1, y: 98, name: 'Pastane' },
    { side: 1, y: 122, name: 'Beyoğlu Plak' }, { side: -1, y: 196, name: 'Çiçekçi' } ];

  function rect(R, x0, y0, x1, y1, fill, stroke, lw) {
    var c = R.ctx, X = R.X(x0), Y = R.Y(y1), w = (x1 - x0) * R.ppm, h = (y1 - y0) * R.ppm;
    if (fill) { c.fillStyle = fill; c.fillRect(X, Y, w, h); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2; c.strokeRect(X, Y, w, h); }
  }
  W.rect = rect;

  W.drawGround = function (R, s, y0, y1) {
    var c = R.ctx, lv = L(), cor = lv.corridor, i;
    rect(R, cor.xMin, Math.max(0, y0), cor.xMax, Math.min(cor.yMax + 4, y1), '#8A8F98');
    c.strokeStyle = '#7C818A'; c.lineWidth = 1;
    c.beginPath();
    for (var y = Math.ceil(Math.max(0, y0) / 0.8) * 0.8; y < Math.min(y1, cor.yMax + 4); y += 0.8) { c.moveTo(R.X(cor.xMin), R.Y(y)); c.lineTo(R.X(cor.xMax), R.Y(y)); }
    for (var x = cor.xMin; x <= cor.xMax; x += 0.8) { c.moveTo(R.X(x), R.Y(Math.max(0, y0))); c.lineTo(R.X(x), R.Y(Math.min(y1, cor.yMax + 4))); }
    c.stroke();
    c.strokeStyle = '#5E636B'; c.lineWidth = Math.max(2, 0.09 * R.ppm);
    lv.rails.forEach(function (rx) { c.beginPath(); c.moveTo(R.X(rx), R.Y(Math.max(0, y0))); c.lineTo(R.X(rx), R.Y(Math.min(y1, cor.yMax + 4))); c.stroke(); });
    for (i = -1; i <= 1; i += 2) drawFacade(R, i, y0, y1);
    P.World.doors().forEach(function (d) { if (d.y > y0 - 2 && d.y < y1 + 2) drawDoor(R, d); });
    drawShutter(R, s);
  };

  function drawFacade(R, side, y0, y1) {
    var c = R.ctx, x0 = side > 0 ? 7 : -9.6, x1 = side > 0 ? 9.6 : -7, ys = Math.max(-0.2, y0), ye = Math.min(232, y1);
    rect(R, x0, ys, x1, ye, '#4B4F57');
    for (var y = Math.ceil(ys / 3) * 3; y < ye; y += 3) {
      var wx = side > 0 ? 7.7 : -9.0;
      rect(R, wx, y + 0.6, wx + 1.3, y + 1.8, '#5A5F68', '#3B3E45', 1);
    }
    c.font = 'bold ' + Math.round(0.42 * R.ppm) + 'px system-ui, sans-serif';
    SHOPS.forEach(function (sh) {
      if (sh.side !== side || sh.y < y0 - 4 || sh.y > y1 + 4) return;
      var bx = side > 0 ? 7 : -7.35;
      rect(R, bx, sh.y - 2.2, bx + 0.35, sh.y + 2.2, 'rgba(233,162,59,0.55)');
      c.save(); c.translate(R.X(side > 0 ? 8.6 : -8.6), R.Y(sh.y)); c.rotate(side > 0 ? Math.PI / 2 : -Math.PI / 2);
      c.fillStyle = '#F4EBDD'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sh.name, 0, 0); c.restore();
    });
  }

  function drawDoor(R, d) {
    var x0 = d.side > 0 ? 7 : -8.33, x1 = d.side > 0 ? 8.33 : -7;
    rect(R, x0, d.y - 1, x1, d.y + 1, '#2A2C31', '#14151F', 2);
    var b = P.Fx.bursts.filter(function (q) { return q.x === d.x && q.y === d.y; })[0];
    if (b) rect(R, x0, d.y - 1, x1, d.y + 1, 'rgba(255,77,46,' + (0.5 * b.t / b.T) + ')');
  }

  function drawShutter(R, s) {
    var sh = L().shutter, open = s.props.shutter;
    rect(R, sh.xMin, sh.yMin, sh.xMax, sh.yMax, '#2A2C31');
    rect(R, sh.xMin, sh.yMin + (sh.yMax - sh.yMin) * open, sh.xMin + 0.35, sh.yMax, '#B8B8B8', '#3A3A3A', 1);
    if (open > 0 && open < 1) rect(R, sh.xMin - 0.2, sh.yMin, sh.xMin - 0.05, sh.yMin + (sh.yMax - sh.yMin) * open, '#E9A23B');
    if (s.props.shutterOpen) rect(R, sh.xMin + 0.4, sh.yMin + 0.4, sh.xMax - 0.2, sh.yMax - 0.4, 'rgba(255,209,102,0.35)');
  }

  W.drawRestaurant = function (R, s) {
    var c = R.ctx, rm = L().room, d = L().door;
    rect(R, rm.xMin, rm.yMin, rm.xMax, rm.yMax, '#6B4F3A');
    c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 1;
    for (var x = rm.xMin; x < rm.xMax; x += 1) { c.beginPath(); c.moveTo(R.X(x), R.Y(rm.yMin)); c.lineTo(R.X(x), R.Y(rm.yMax)); c.stroke(); }
    rect(R, -5.2, -9.8, -2.2, -8.9, '#3A2A1E', '#14151F', 2);
    [[-7.2, -6.2], [-4.4, -6.8], [-8.4, -3.2], [-3.8, -2.4]].forEach(function (t) {
      c.fillStyle = '#C9B79C'; c.strokeStyle = '#14151F'; c.lineWidth = 2;
      c.beginPath(); c.arc(R.X(t[0]), R.Y(t[1]), 0.55 * R.ppm, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = '#B5651D'; c.beginPath(); c.arc(R.X(t[0] + 0.15), R.Y(t[1] + 0.1), 0.12 * R.ppm, 0, Math.PI * 2); c.fill();
    });
    var flick = 0.55 + 0.25 * Math.sin(performance.now() / 180);
    rect(R, -9.95, -4.2, -9.7, -2.2, 'rgba(61,139,255,' + flick + ')', '#14151F', 2);
    c.lineWidth = Math.max(3, 0.25 * R.ppm); c.strokeStyle = '#14151F';
    c.beginPath();
    c.moveTo(R.X(rm.xMin), R.Y(rm.yMin)); c.lineTo(R.X(rm.xMin), R.Y(rm.yMax)); c.lineTo(R.X(d.xMin), R.Y(rm.yMax));
    c.moveTo(R.X(d.xMax), R.Y(rm.yMax)); c.lineTo(R.X(rm.xMax), R.Y(rm.yMax)); c.lineTo(R.X(rm.xMax), R.Y(rm.yMin)); c.lineTo(R.X(rm.xMin), R.Y(rm.yMin));
    c.stroke();
    if (!s.props.doorOpen) rect(R, d.xMin, -0.15, d.xMax, 0.15, '#8B5A2B', '#14151F', 2);
    c.save(); c.translate(R.X(-6), R.Y(0.75)); c.fillStyle = '#E9A23B'; c.font = 'bold ' + Math.round(0.45 * R.ppm) + 'px system-ui';
    c.textAlign = 'center'; c.fillText('Lezzet Dürüm Salonu', 0, 0); c.restore();
  };

  W.drawProps = function (R, s) {
    var c = R.ctx, lv = L(), t = performance.now() / 1000;
    c.fillStyle = '#3A3E45'; c.strokeStyle = '#14151F'; c.lineWidth = 2;
    c.beginPath(); c.arc(R.X(lv.manhole.x), R.Y(lv.manhole.y), 0.55 * R.ppm, 0, Math.PI * 2); c.fill(); c.stroke();
    if (!s.dir.flags.cat || s.dir.bubbles.length) {
      c.fillStyle = '#E9A23B'; c.beginPath(); c.ellipse(R.X(lv.cat.x), R.Y(lv.cat.y), 0.35 * R.ppm, 0.2 * R.ppm, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    }
    s.props.carts.forEach(function (k) {
      if (!k.alive) { rect(R, k.x - 0.7, k.y - 0.4, k.x + 0.7, k.y + 0.4, 'rgba(20,21,31,0.35)'); return; }
      var col = k.flash > 0 ? '#FFFFFF' : (k.kind === 'simit' ? '#C0392B' : '#3A2A1E');
      rect(R, k.x - 0.9, k.y - 0.6, k.x + 0.9, k.y + 0.6, col, '#14151F', 2);
      if (k.kind === 'simit') rect(R, k.x - 0.7, k.y - 0.1, k.x + 0.7, k.y + 0.5, 'rgba(255,255,255,0.45)', '#14151F', 1);
      else { c.fillStyle = 'rgba(255,120,40,' + (0.6 + 0.3 * Math.sin(t * 8)) + ')'; c.beginPath(); c.arc(R.X(k.x), R.Y(k.y + 0.1), 0.3 * R.ppm, 0, Math.PI * 2); c.fill(); }
    });
    s.props.canisters.forEach(function (k) {
      if (!k.alive) return;
      rect(R, k.x - 0.28, k.y - 0.43, k.x + 0.28, k.y + 0.43, k.flash > 0 ? '#FFFFFF' : '#C0392B', '#14151F', 2);
      rect(R, k.x - 0.12, k.y + 0.43, k.x + 0.12, k.y + 0.6, '#14151F');
      c.fillStyle = '#14151F'; c.font = 'bold ' + Math.round(0.28 * R.ppm) + 'px system-ui'; c.textAlign = 'center';
      c.fillText(P.lang === 'tr' ? 'TÜP' : 'GAS', R.X(k.x), R.Y(k.y - 0.75));
    });
  };

  W.drawTram = function (R, s) {
    var tr = L().tram, h = s.hero;
    var beside = Math.abs(h.y - (tr.yMin + tr.yMax) / 2) < 8 && Math.abs(h.x) < 5;
    R.ctx.globalAlpha = beside ? 0.3 : 1;
    rect(R, tr.xMin, tr.yMin, tr.xMax, tr.yMax, '#C0392B', '#14151F', 3);
    rect(R, tr.xMin + 0.25, tr.yMin + 0.4, tr.xMax - 0.25, tr.yMax - 0.4, '#F4EBDD', '#14151F', 1.5);
    for (var y = tr.yMin + 1; y < tr.yMax - 0.5; y += 1.6) rect(R, tr.xMin + 0.5, y, tr.xMax - 0.5, y + 0.9, '#C0392B');
    R.ctx.globalAlpha = 1;
  };

  W.drawScaffold = function (R, s) {
    var c = R.ctx, y = L().scaffoldY;
    if (!s.props.scaffoldDown) {
      c.globalAlpha = 0.55;
      rect(R, -7, y - 2.5, 7, y + 0.5, null, '#6E6E6E', 3);
      c.globalAlpha = 1;
      return;
    }
    rect(R, -7, y - 0.5, 7, y + 1.2, '#6E6E6E', '#3A3A3A', 2);
    c.strokeStyle = '#3A3A3A'; c.lineWidth = 4;
    for (var x = -7; x < 7; x += 1.2) { c.beginPath(); c.moveTo(R.X(x), R.Y(y - 0.5)); c.lineTo(R.X(x + 0.9), R.Y(y + 1.2)); c.stroke(); }
  };

  return W;
})();
