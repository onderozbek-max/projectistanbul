P.BridgeBossFx = (function () {
  var F = {}, C = P.CFG.bosses.bigFisher;
  function boss(s) {
    var e = s.gen && s.gen.boss;
    return e && !e.dead && e.bossPreset === 'bigFisher' ? e : null;
  }

  F.instruction = function (s, e) {
    if (e.bridgeCast && e.bridgeCast.lines.some(function (q) { return q.caught; })) return 'fisherReel';
    if (e.bridgeCast) return 'fisherCast';
    if (e.ai.m === 'windup' && e.ai.act === 'bridgeNet') return 'fisherNet';
    if (P.BridgeBoss.heroMul(s) < 1) return 'fisherEscape';
    return e.exposed ? 'fisherOpening' : 'fisher';
  };

  function net(c, x, y, r, alpha) {
    c.save(); c.globalAlpha = alpha; c.translate(x, y);
    c.beginPath(); c.arc(0, 0, r, 0, 2 * Math.PI);
    c.fillStyle = '#384C52'; c.fill(); c.clip();
    c.strokeStyle = '#D2BA81'; c.lineWidth = Math.max(1, r * .034);
    for (var i = -5; i <= 5; i++) {
      var d = i * r * .32;
      c.beginPath(); c.moveTo(-r, d - r * .8); c.lineTo(r, d + r * .8);
      c.moveTo(-r, d + r * .8); c.lineTo(r, d - r * .8); c.stroke();
    }
    c.beginPath(); c.arc(0, 0, r - c.lineWidth, 0, 2 * Math.PI);
    c.strokeStyle = '#EBC98C'; c.lineWidth *= 2; c.stroke();
    c.restore();
  }

  F.ground = function (R, s) {
    var e = boss(s), q = e && e.bridgeNet;
    if (q) net(R.ctx, R.X(q.x), R.Y(q.y), q.r * R.ppm, Math.min(.81, .4 + .8 * q.t));
  };

  function rod(R, e) {
    var hand=P.BossActing && P.BossActing.contact(e);
    if (hand) return { x: hand.tipX, y: hand.tipY };
    var c = R.ctx, u = R.ppm, side = e.ai.dir.x < 0 ? -1 : 1, x = R.X(e.x) + side * .42 * u, y = R.Y(e.y) - .83 * u;
    var tx = x + side * (e.bridgeCast ? 1.05 : .72) * u, ty = y - (e.bridgeCast ? .81 : 1.28) * u;
    c.beginPath(); c.moveTo(x - side * .16 * u, y + .18 * u);
    c.quadraticCurveTo(x + side * .77 * u, y - .49 * u, tx, ty);
    c.lineWidth = .112 * u; c.strokeStyle = '#262933'; c.stroke();
    c.lineWidth = .055 * u; c.strokeStyle = e.exposed ? '#F0CE8B' : '#A37A57'; c.stroke();
    c.beginPath(); c.arc(x, y, .13 * u, 0, 2 * Math.PI);
    c.fillStyle = '#D3BB80'; c.fill(); c.lineWidth = .066 * u; c.strokeStyle = '#2B2E37'; c.stroke();
    return { x: tx, y: ty };
  }

  function hook(R, s, tip, q) {
    var c = R.ctx, u = R.ppm, x = tip.x, y = tip.y;
    var d = q.dist >= q.len ? q.dist * (q.reel / C.cast.reel) : q.dist;
    var tx = q.caught ? R.X(s.hero.x) : R.X(q.x + q.dx * d);
    var ty = q.caught ? R.Y(s.hero.y) - .40 * u : R.Y(q.y + q.dy * d) - .15 * u;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + tx) * .5, (y + ty) * .5 + (q.caught ? .06 : .57) * u, tx, ty);
    c.lineWidth = .096 * u; c.strokeStyle = '#27313A'; c.stroke();
    c.lineWidth = .040 * u; c.strokeStyle = q.caught ? '#FAE2AB' : '#9CD2D0'; c.stroke();
    c.beginPath(); c.arc(tx, ty - .06 * u, .16 * u, Math.PI * .04, Math.PI * 1.65);
    c.lineWidth = .075 * u; c.strokeStyle = q.caught ? '#FFCC81' : '#BAD4CB'; c.stroke();
  }

  F.air = function (R, s) {
    var e = boss(s);
    if (!e) return;
    var c = R.ctx, u = R.ppm;
    c.save();
    var tip = rod(R, e);
    if (e.bridgeCast) e.bridgeCast.lines.forEach(function (q) { hook(R, s, tip, q); });
    s.enemyTele.forEach(function (t) {
      if (t.owner !== e.id || t.then !== 'bridgeNet') return;
      var grip=P.BossActing.contact(e),source=grip?{x:grip.x,y:grip.y}:tip;
      var p = Math.max(0, Math.min(1, (t.t / t.T - .48) / .52));
      if (p > 0) net(c, source.x + (R.X(t.x)-source.x)*p, source.y+(R.Y(t.y)-source.y)*p - Math.sin(p * Math.PI) * 1.7 * u,
        (.28 + p * (t.r - .28)) * u, .8);
    });
    c.restore();
  };
  return F;
})();
