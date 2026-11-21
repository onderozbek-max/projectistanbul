// Live work owns the hands while feet and all danger remain under ordinary player control.
P.InteractionActing = (function () {
  var F = {};
  function subject(s) {
    var m = s.milestone;
    if (m && (m.carry || m.carrying && !m.open)) return { kind: 'carry', x: s.hero.x, y: s.hero.y + .15 };
    if (s.hero.moving || s.hero.dashing) return null;
    if (s.streetGrab) return { kind: 'lift', x: s.streetGrab.r.x, y: s.streetGrab.r.y };
    if (s.propIntent) return { kind: 'break', x: s.propIntent.prop.x, y: s.propIntent.prop.y };
    var station = s.eczane && s.eczane.list.find(function (st) { return st.dwell > 0 && !st.used; });
    if (station) return { kind: 'heal', x: station.b.x, y: station.b.y };
    var hack = s.activeHack && s.hacks && s.hacks.find(function (h) { return h.id === s.activeHack; });
    if (hack) return { kind: 'call', x: hack.x, y: hack.y };
    return null;
  }
  F.pose = function (s, o) {
    var a = subject(s);
    if (!a) return null;
    a.aim = Math.atan2(a.y - s.hero.y, a.x - s.hero.x);
    o.noArms = true; o.backHand = null; o.attackHand = Math.cos(a.aim) < 0 ? -1 : 1;
    var effort = a.kind === 'carry' || a.kind === 'lift';
    o.attackStance = { aim: a.aim, arm: effort ? 'brace' : 'reach', hip: effort ? -.045 : .035,
      bend: effort ? .12 : .04, spread: effort ? .16 : .04, plant: .7,
      lean: effort ? -.07 : .12, roll: 0, depth: .05, height: effort ? -.06 : 0 };
    return a;
  };
  F.tool = function (R, s, a, grips) {
    if (!grips || a.kind === 'carry') return;
    var c = R.ctx, u = R.ppm, hand = Math.cos(a.aim) < 0 ? grips.left : grips.right;
    var end = { x: R.X(a.x), y: R.Y(a.y) - .45 * u };
    var d = Math.hypot(end.x - hand.x, end.y - hand.y), max = .85 * u;
    if (d > max) { end.x = hand.x + (end.x - hand.x) * max / d; end.y = hand.y + (end.y - hand.y) * max / d; }
    c.save(); c.lineCap = 'round'; c.lineWidth = 3; c.strokeStyle = '#D2B383';
    c.beginPath(); c.moveTo(hand.x, hand.y); c.lineTo(end.x, end.y); c.stroke();
    if (a.kind === 'heal' && P.ArtRasterItems && P.ArtRasterItems.pickup(c, 'simit', end.x, end.y, .32 * u)) { c.restore(); return; }
    c.fillStyle = '#E7D5B5';
    c.beginPath(); c.ellipse(end.x, end.y, .095 * u, .05 * u, -a.aim, 0, Math.PI * 2); c.fill(); c.restore();
  };
  F.carryGrip = function (R, s) {
    var g = R.heroGrips;
    if (!g) return { x: R.X(s.hero.x), y: R.Y(s.hero.y) - .65 * R.ppm };
    return { x: (g.left.x + g.right.x) * .5, y: (g.left.y + g.right.y) * .5 + .15 * R.ppm };
  };
  return F;
})();
