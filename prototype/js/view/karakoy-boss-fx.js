P.KarakoyBossFx = (function () {
  var F = {}, C = P.CFG.bosses.dockBride;
  F.instruction = function (s, b) {
    if (b.exposed) return b.cartOpening ? 'brideCartOpening' : 'brideOpening';
    if (b.dockRope) return 'brideRope';
    if ((b.dockCarts && b.dockCarts.length) ||
        s.enemyTele.some(function (t) { return t.owner === b.id && t.then === 'dockCarts'; })) return 'brideCarts';
    return 'bride';
  };

  function cart(R, q) {
    var c = R.ctx, u = R.ppm, x = R.X(q.x), y = R.Y(q.y+(q.dir||-1)*q.gone);
    if(P.StreetArt.current()){
      var im=P.StreetArt.image('cart');if(!im)return;
      c.save();if(q.wreck!==undefined){var fall=1-q.wreck/C.carts.wreckT;c.globalAlpha=1-fall;c.translate(x,y);c.rotate(.45*fall);c.translate(-x,-y);}
      c.drawImage(im,x-C.carts.w*u/2,y-C.carts.depth*u*.70,C.carts.w*u,C.carts.depth*u);c.restore();return;
    }
    var w = C.carts.w * u, d = C.carts.depth * u, left = x - w / 2, top = y - d * .70;
    c.save();
    if (q.wreck !== undefined) {
      var age = 1 - q.wreck / C.carts.wreckT;
      c.globalAlpha = 1 - age;
      if (!P.Settings.reduceMotion) { c.translate(x, y); c.rotate(.45 * age); c.translate(-x, -y); }
    }
    c.fillStyle = '#26242F'; c.fillRect(left + .06 * u, top + .18 * u, w, d + .12 * u);
    c.fillStyle = '#93674F'; c.fillRect(left, top, w, d);
    c.strokeStyle = '#242531'; c.lineWidth = .065 * u; c.strokeRect(left, top, w, d);
    c.fillStyle = '#D1AB79'; c.fillRect(left + .12 * u, top + .10 * u, w - .24 * u, d * .72);
    c.strokeStyle = '#8E624C'; c.lineWidth = .055 * u; c.beginPath(); c.moveTo(left + .12 * u, top + d * .70);
    c.lineTo(left + w - .13 * u, top + .12 * u); c.stroke();
    for (var i = 0; i < 3; i++) {
      var dx = (i - 1) * .39 * u;
      c.strokeStyle = '#C6A28C'; c.lineWidth = .04 * u; c.beginPath();
      c.moveTo(x + dx, y + d * .48); c.lineTo(x + dx, y + d * (.73 + i * .11)); c.stroke();
    }
    c.restore();
  }

  function rope(R, a, b) {
    var c = R.ctx, u = R.ppm, x = R.X(a.x), y = R.Y(a.y), r = a.r * u;
    if (a.t < 0) {
      c.beginPath(); c.arc(x, y, r, -a.start, -a.start - a.span, a.span > 0);
      c.strokeStyle = 'rgba(235,123,108,.36)'; c.lineWidth = a.thickness * 2 * u; c.stroke();
      c.setLineDash([.15 * u, .10 * u]); c.lineWidth = .075 * u; c.strokeStyle = '#FFD3B6'; c.stroke(); c.setLineDash([]);
      return;
    }
    var dir = a.start + a.span * a.t / a.T;
    var tipX = x + Math.cos(dir) * r, tipY = y - Math.sin(dir) * r;
    c.beginPath(); c.arc(x, y, r, -(dir - a.span * .15 * Math.min(1, a.t / .15)), -dir, a.span > 0);
    c.lineWidth = .19 * u; c.strokeStyle = 'rgba(255,215,178,.74)'; c.stroke();
    var hand=P.BossActing.contact(b)||{x:x,y:y-.5*u};
    c.beginPath(); c.moveTo(hand.x,hand.y); c.quadraticCurveTo((hand.x + tipX) * .5, (hand.y + tipY) * .5 - .38 * u, tipX, tipY);
    c.strokeStyle = '#2F2632'; c.lineWidth = .11 * u; c.stroke();
    c.strokeStyle = '#E9D7AD'; c.lineWidth = .05 * u; c.stroke();
    c.beginPath(); c.ellipse(tipX, tipY, .23 * u, .15 * u, -dir, 0, 2 * Math.PI);
    c.fillStyle = '#D97E93'; c.fill(); c.lineWidth = .045 * u; c.strokeStyle = '#342B37'; c.stroke();
  }

  F.air = function (R, s) {
    var b = s.gen && s.gen.boss;
    if (!b || b.dead || b.bossPreset !== 'dockBride') return;
    R.ctx.save();
    if (b.dockRope) rope(R, b.dockRope, b);
    if(b.ropeSlack){var q=b.ropeSlack,c=R.ctx,u=R.ppm,hand=P.BossActing.contact(b),fall=1-q.t/q.T;
      if(hand){var x=R.X(q.x),y=R.Y(q.y)+fall*.16*u;c.beginPath();c.moveTo(hand.x,hand.y);
        c.quadraticCurveTo((hand.x+x)*.5,(hand.y+y)*.5+(fall+.15)*u,x,y);
        c.strokeStyle='#2F2632';c.lineWidth=.10*u;c.stroke();c.strokeStyle='#E9D7AD';c.lineWidth=.045*u;c.stroke();
        c.fillStyle='#BA7183';c.beginPath();c.ellipse(x,y,.23*u,.12*u,0,0,Math.PI*2);c.fill();}}
    if (b.dockCarts) b.dockCarts.forEach(function (q) { cart(R, q); });
    R.ctx.restore();
  };
  return F;
})();
