// The Bride stays light on her feet, sends dock carts down the quay and sweeps a weighted mooring line.
P.KarakoyBoss = (function () {
  var B = {}, C = P.CFG.bosses.dockBride;

  function carts(s, e, a) {
    var K = C.carts, h = s.hero, g = s.geo;
    var lane = Math.max(-1, Math.min(1, Math.round(h.x / K.gap)));
    var dir=s.tacticalReplay===15?1:-1;
    var y = dir<0?Math.min(g.exitY-1,h.y+K.sourceAhead):Math.max(g.holdY-5,h.y-K.sourceAhead);
    var lanes = e.phase === 1 ? [lane] : [lane, lane === 0 ? a.side : 0];
    lanes.forEach(function (i) {
      var t = P.Enemies.lane(s,i*K.gap,y,0,dir,Math.min(K.len,dir<0?y-g.holdY+6:g.exitY-y),K.w,a.W);
      t.then = 'dockCarts'; t.owner = e.id; t.dmg = P.Enemies.dmgOf(s, e, K.dmg);
    });
  }

  B.attack = function (s, e, a, name, tele) {
    if (name === 'dockCarts') {
      a.W = tele(C.carts.windup * a.wm);
      carts(s, e, a);
      return true;
    }
    if (name !== 'ropeSweep') return false;
    a.W = tele(C.rope.windup * a.wm);
    var dir = Math.atan2(a.dir.y, a.dir.x), span = e.phase === 1 ? C.rope.first : C.rope.second;
    e.dockRope = { x: e.x, y: e.y, start: dir - span / 2 * a.side, span: span * a.side,
      r: C.rope.r, thickness: C.rope.thickness, t: -a.W, T: C.rope.T, hit: false };
    return true;
  };

  B.launch = function (s, tele) {
    var e = s.gen && s.gen.boss;
    if (!e || e.dead || e.id !== tele.owner) return;
    (e.dockCarts || (e.dockCarts = [])).push({ x: tele.x, y: tele.y, len: tele.len, dir:tele.dy||-1, gone: 0, dmg: tele.dmg, struck: {} });
  };

  function roll(s, boss, cart, dt) {
    var K = C.carts, h = s.hero, hr = P.CFG.hero.radius;
    if (cart.wreck !== undefined) { cart.wreck -= dt; return cart.wreck > 0; }
    var direction=cart.dir||-1,prev=cart.y+direction*cart.gone;
    cart.gone = Math.min(cart.len, cart.gone + K.speed * dt);
    function touches(a, r) {
      return Math.abs(a.x - cart.x) <= K.w / 2 + r &&
        a.y < Math.max(prev,cart.y+direction*cart.gone)+r+K.depth/2 && a.y > Math.min(prev,cart.y+direction*cart.gone)-r-K.depth/2;
    }
    if (!cart.hit && touches(h, hr)) {
      cart.hit = true; P.Combat.damageHero(s, cart.dmg, 'dockBride');
    }
    s.enemies.forEach(function (e) {
      if (e.dead || e.boss || e.state !== 'active' || cart.struck[e.id] || !touches(e, e.r)) return;
      cart.struck[e.id] = true;
      P.Combat.damageEnemy(s, e, K.crowdDmg, 0, direction, K.crowdPush, false, 'dockCart');
    });
    if (!cart.hit && !boss.cartOpening && touches(boss, boss.r)) {
      s.enemyTele=s.enemyTele.filter(function(t){return !(t.owner===boss.id&&t.then==='dockCarts');});
      var rope=boss.dockRope;
      if(rope){var angle=rope.start+rope.span*Math.max(0,rope.t)/rope.T;
        boss.ropeSlack={x:rope.x+Math.cos(angle)*rope.r,y:rope.y+Math.sin(angle)*rope.r,t:C.rope.slackT,T:C.rope.slackT};}
      boss.dockRope=null;boss.windup=0;
      P.Bosses.exposeFor(s, boss, K.brideReset);
      P.Combat.shove(boss,0,direction,K.bridePush,true);
      boss.cartOpening = true;boss.cartCounterAge=boss.age;
      s.events.push({type:"bossCounter",boss:"dockBride",source:"dockCart",x:boss.x,y:boss.y});
      cart.wreck = K.wreckT;
    }
    return cart.gone < cart.len;
  }

  function sweep(s, e, rope, dt) {
    if (e.ai.m === 'windup' && e.ai.act === 'ropeSweep') { rope.t = e.ai.t - e.ai.W; return; }
    var old = Math.max(0, rope.t) / rope.T;
    rope.t = Math.min(rope.T, Math.max(0, rope.t) + dt);
    var dx = s.hero.x - rope.x, dy = s.hero.y - rope.y, dir = Math.sign(rope.span), tau = 2 * Math.PI;
    var pos = ((Math.atan2(dy, dx) - rope.start) * dir + tau * 2) % tau;
    var margin = (P.CFG.hero.radius + rope.thickness) / rope.r;
    var start = Math.abs(rope.span) * old - margin, end = Math.abs(rope.span) * rope.t / rope.T + margin;
    var swept = pos >= start && pos <= end || pos - tau >= start && pos - tau <= end || pos + tau >= start && pos + tau <= end;
    if (!rope.hit && Math.abs(Math.hypot(dx, dy) - rope.r) <= rope.thickness + P.CFG.hero.radius &&
        swept) {
      rope.hit = true; P.Combat.damageHero(s, P.Enemies.dmgOf(s, e, C.rope.dmg), 'dockBride');
    }
    if (rope.t >= rope.T) { e.dockRope = null; P.Bosses.exposeFor(s, e, C.rope.reset); }
  }

  B.step = function (s, e, dt) {
    if (e.dead) { e.dockRope = null; e.dockCarts = []; return; }
    if (e.cartOpening && !e.exposed) e.cartOpening = false;
    if(e.ropeSlack&&(e.ropeSlack.t-=dt)<=0)e.ropeSlack=null;
    if (e.dockCarts) e.dockCarts = e.dockCarts.filter(function (cart) { return roll(s, e, cart, dt); });
    if (e.dockRope) sweep(s, e, e.dockRope, dt);
  };

  return B;
})();
