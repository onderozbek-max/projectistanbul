P.EminonuBossFx = (function () {
  var F = {}, C = P.CFG.bosses.quayCaptain, INK = '#28303A';
  var base = document.currentScript && document.currentScript.src || document.baseURI;
  var actor = null, failed = false;
  // [foot x, foot y, grip x, grip y] in each 256px cell. The chain follows the painted hand.
  var anchors = [[121, 243, 194, 141], [115, 242, 55, 47], [123, 243, 232, 66],
    [129, 249, 166, 114], [106, 250, 157, 166], [126, 251, 111, 188]];
  function loadActor(retry) {
    failed = false;
    var img = new Image(), url = new URL('../../assets/landmarks/eminonu-captain.webp', base);
    if (retry) url.searchParams.set('retry', String(Date.now()));
    img.onload = function () { actor = img; };
    img.onerror = function () { failed = true; };
    img.src = url.href;
  }
  function scale(u) { return u * 2.68 / 240; }
  function pose(e) {
    var q = e.captainTow, a = e.ai;
    if (a.m === 'defeat') return 5;
    if (q) return q.phase === 'aim' ? 1 : q.phase === 'throw' ? 2 : 3;
    if (e.exposed || a.m === 'pause') return 4;
    if (a.m === 'windup') return a.act === 'captainSpice' ? e.windup<.38?0:e.windup<.53?1:2 : 1;
    return 0;
  }
  function face(e, f) {
    var a = e.ai;
    if (a.m === 'walk') return Math.abs(e.dvx || 0) > .08 ? Math.sign(e.dvx) : f;
    return a.dir && Math.abs(a.dir.x) > .08 ? Math.sign(a.dir.x) : f;
  }
  // Rotate and compress about the planted feet. The painted grip shares the exact transform.
  function motion(e, f, o) {
    o = o || {};
    var a = e.ai, stride = 0, lean = 0, flex = 0;
    if (P.Settings && P.Settings.reduceMotion) return { roll: 0, sx: 1, sy: 1 };
    if (a.m === 'walk' && Math.hypot(e.vx || 0, e.vy || 0) > .08) {
      stride = o.sceneEntry !== undefined ? o.phase : (e.walk || 0) * 7.8;
      lean = .06 * Math.sin(stride); flex = .05 * Math.abs(Math.sin(stride));
    } else if (e.captainTow && e.captainTow.phase === 'pull') {
      lean = -.13; flex = .055;
    } else if (a.m === 'windup') {
      lean = -.11 * (e.windup || 0); flex = .04 * (e.windup || 0);
    } else if (e.exposed) {
      flex = .075 * Math.min(1, Math.max(0, a.exposeT) / .4);
    }
    return { roll: lean, sx: 1, sy: 1, load: flex * 8 };
  }
  F.awaitArt = function (done) {
    if (actor) return true;
    if (failed) loadActor(true);
    var deadline = performance.now() + 6000;
    var dismiss = P.UI.toast(P.t('ui.art.captainWait'), null, 3.5);
    function check() {
      if (actor || failed || performance.now() >= deadline) { if (dismiss) dismiss(); done(!!actor); return; }
      setTimeout(check, 40);
    }
    setTimeout(check, 40);
    return false;
  };
  F.bossBody = function (c, e, o, x, y, u, facing) {
    if (e.bossPreset !== 'quayCaptain') return false;
    if (!actor) return true;
    var i = o.sceneEntry !== undefined ? o.sceneEntry < .7 ? 0 : 1 : pose(e), q = anchors[i], k = scale(u), f = face(e, facing), m = motion(e, f, o);
    c.save();
    c.translate(x, y); c.scale(f, 1);
    if (i === 0 && !o.stopped && (o.sceneEntry !== undefined || Math.hypot(e.dvx || 0, e.dvy || 0) >= .08)) {
      P.BossFootwork.stride(c, actor, [0, 0, 256, 256], q[0], q[1], [.78, .46], k, o.sceneEntry !== undefined ? o.phase : (e.walk || 0) * 7.8);
    } else P.BossJoints.draw(c,actor,[i%3*256,Math.floor(i/3)*256,256,256],q,k,m);
    c.restore();
    return true;
  };
  function grip(R, e, s) {
    var held=P.BossPuppet&&P.BossPuppet.contact(e);if(held)return{x:held.x,y:held.y,f:held.facing};
    var q = anchors[pose(e)], k = scale(R.ppm), f = face(e, s.hero.x >= e.x ? 1 : -1), m = motion(e, f);
    var point=P.BossJoints.point([0,0,256,256],q,k,f,q[2],q[3],m);
    return { x: R.X(e.x)+point.x, y: R.Y(e.y-e.r*.6)+point.y, f:f };
  }
  loadActor(false);
  function boss(s) {
    var e = s.gen && s.gen.boss;
    return e && !e.dead && e.bossPreset === 'quayCaptain' ? e : null;
  }

  F.instruction = function (s, e) {
    if (e.captainTow) return e.captainTow.phase === 'aim' ? 'captainAnchor' : 'captainTow';
    if (e.captainDust && e.captainDust.some(function (q) { return Math.hypot(s.hero.x - q.x, s.hero.y - q.y) <= q.r + P.CFG.hero.radius; })) {
      return 'captainDust';
    }
    if (e.exposed) return 'captainOpening';
    return e.ai.m === 'windup' && e.ai.act === 'captainSpice' ? 'captainSpice' : 'captain';
  };

  function dust(R, q) {
    var c = R.ctx, u = R.ppm, x = R.X(q.x), y = R.Y(q.y), r = q.r * u, age = 1 - q.t / C.spice.T;
    c.save(); c.globalAlpha = Math.min(1, q.t*2.7);
    c.beginPath(); c.ellipse(x, y, r, r, 0, 0, Math.PI*2);
    c.fillStyle = 'rgba(132,67,49,.28)'; c.fill();
    c.lineWidth = .065*u; c.strokeStyle = '#C47658'; c.stroke();
    for (var i = 0; i < 8; i++) {
      var a = i * 2.4 + age * (i%2 ? 0.6 : -0.35), d = r * (i%3 + 1) * .19;
      var w = r * (.24 + i%3*.04), cy = y + Math.sin(a)*d - .22*age*u;
      c.beginPath(); c.ellipse(x + Math.cos(a)*d, cy, w, w*.55, a, 0, Math.PI*2);
      c.fillStyle = i%2 ? 'rgba(222,153,88,.35)' : 'rgba(173,102,72,.38)'; c.fill();
    }
    c.restore();
  }
  F.ground = function (R, s) {
    var e = boss(s), q = e && e.captainTow, c = R.ctx, u = R.ppm;
    if (e && e.captainDust) e.captainDust.forEach(function (cloud) { dust(R, cloud); });
    if (!q || q.phase !== 'aim') return;
    var x = R.X(q.tx), y = R.Y(q.ty);
    c.beginPath(); c.arc(x, y, .48*u, 0, 2*Math.PI);
    c.lineWidth = .07*u; c.strokeStyle = '#E7AB77'; c.stroke();
    c.beginPath(); c.moveTo(x-.23*u,y); c.lineTo(x+.23*u,y); c.moveTo(x,y-.23*u); c.lineTo(x,y+.23*u); c.stroke();
  };

  function anchor(c, x, y, u, a) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.beginPath(); c.moveTo(0,-.39*u); c.lineTo(0,.35*u);
    c.moveTo(-.34*u,-.08*u); c.lineTo(.34*u,-.08*u);
    c.moveTo(-.42*u,.11*u); c.quadraticCurveTo(-.33*u,.41*u,0,.43*u); c.quadraticCurveTo(.33*u,.41*u,.42*u,.11*u);
    c.lineWidth = .145*u; c.lineCap = 'round'; c.strokeStyle = INK; c.stroke();
    c.lineWidth = .081*u; c.strokeStyle = '#9EA9A4'; c.stroke();
    [-1,1].forEach(function (side) {
      c.beginPath(); c.moveTo(side*.48*u,.08*u); c.lineTo(side*.25*u,.14*u); c.lineTo(side*.44*u,.29*u); c.closePath();
      c.fillStyle = '#7F918E'; c.fill(); c.lineWidth = .04*u; c.strokeStyle = INK; c.stroke();
    });
    c.beginPath(); c.arc(0,-.43*u,.123*u,0,Math.PI*2); c.lineWidth = .075*u; c.strokeStyle = '#CBD0AD'; c.stroke();
    c.restore();
  }

  function tow(R, q, hand) {
    var c = R.ctx, u = R.ppm, x = hand.x, y = hand.y;
    var f = q.phase === 'aim' ? 0 : Math.min(1, q.time / C.anchor.throwT);
    var tx = x + (R.X(q.tx) - x)*f + (1-f)*hand.f*.36*u;
    var ty = y + (R.Y(q.ty) - y)*f - Math.sin(Math.PI*f)*1.15*u - (1-f)*.32*u;
    var len = Math.hypot(tx-x, ty-y), direction = Math.atan2(ty-y, tx-x);
    c.save(); c.translate(x,y); c.rotate(direction);
    for (var d = .11*u, i = 0; d < len; d += .21*u, i++) {
      c.beginPath(); c.ellipse(d, 0, .126*u, (i%2 ? .041 : .070)*u, 0, 0, Math.PI*2);
      c.lineWidth = .055*u; c.strokeStyle = INK; c.stroke();
      c.lineWidth = .026*u; c.strokeStyle = '#C1B69C'; c.stroke();
    }
    c.restore();
    if(q.phase!=='aim'&&!(P.BossPuppet&&P.BossPuppet.tool(c,'quayCaptain',tx,ty,u,(1-f)*direction)))anchor(c,tx,ty,u*1.1,(1-f)*direction);
  }
  F.settle=function(R,s,e,p){
    if(e.bossPreset!=='quayCaptain')return;
    var q=e.settledTool,c=R.ctx,u=R.ppm,hand=grip(R,e,s);
    if(P.BossPuppet&&P.BossPuppet.ready('quayCaptain')&&(!q||!q.released))return;
    var tx=R.X(q&&q.released?q.x:e.x+.65),ty=R.Y(q&&q.released?q.y:e.y-.22);
    var sag=(.18+Math.min(1,p)*.9)*u,dx=tx-hand.x,dy=ty-hand.y;
    c.save();c.lineCap='round';
    c.beginPath();c.moveTo(hand.x,hand.y);c.quadraticCurveTo((hand.x+tx)*.5,(hand.y+ty)*.5+sag,tx,ty);
    c.strokeStyle=INK;c.lineWidth=.075*u;c.stroke();c.strokeStyle='#B9AB88';c.lineWidth=.028*u;c.stroke();
    if(!(P.BossPuppet&&P.BossPuppet.tool(c,'quayCaptain',tx,ty,u,.3*(1-Math.min(1,p)))))anchor(c,tx,ty,u*.76,.3*(1-Math.min(1,p)));c.restore();
  };

  F.air = function (R, s) {
    var e = boss(s);
    if (!e) return;
    var c = R.ctx, u = R.ppm, q = e.captainTow, hand = grip(R, e, s);
    c.save();
    if (q) tow(R, q, hand);
    else if (!(P.BossPuppet&&P.BossPuppet.ready('quayCaptain')) && (e.ai.act !== 'captainSpice' || e.ai.m !== 'windup')) anchor(c, hand.x, hand.y + .27*u, .69*u, -.18);
    s.enemyTele.forEach(function (t) {
      if (t.owner !== e.id || t.then !== 'captainSpice') return;
      var p = Math.max(0, Math.min(1, (t.t/t.T-.53)/.47));
      if (p <= 0) return;
      var x = hand.x + (R.X(t.x) - hand.x) * p;
      var y = hand.y + (R.Y(t.y) - hand.y) * p - Math.sin(Math.PI * p) * 1.75 * u;
      c.save(); c.translate(x,y); c.rotate(1.9*p);
      c.beginPath(); c.ellipse(0,0,.25*u,.36*u,0,0,Math.PI*2);
      c.fillStyle = '#BF8660'; c.fill(); c.lineWidth = .06*u; c.strokeStyle = INK; c.stroke();
      c.fillStyle = '#81564B'; c.fillRect(-.22*u,-.09*u,.44*u,.12*u); c.restore();
    });
    c.restore();
  };
  return F;
})();
