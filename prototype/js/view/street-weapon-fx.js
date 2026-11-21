// The street prop follows the painted grip during the lift and swings, then follows the simulated throw.
P.StreetWeaponFx = (function () {
  var F = {}, C = P.CFG.env.streetWeapon;
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function mix(a, b, t) { return a + (b - a) * t; }
  function easy(t) { return t * t * (3 - 2 * t); }
  function reduced() { return P.Settings && P.Settings.reduceMotion; }

  F.pose = function (s, o) {
    var w = s.streetWeapon;
    if (!w || !s.hero.streetHolding) return false;
    var swing = w.phase === 'swing', lift = w.phase === 'lift', fly = w.phase === 'flight';
    var p = lift ? clamp(w.t / C.lift) : swing ? clamp((w.t - C.windup) / C.strike) : fly ? 1 : clamp(w.t / C.heft);
    var angle = swing ? P.StreetWeapon.angle(w, w.t) : w.aim, ease = reduced() ? 0 : 1;
    var press = lift ? Math.sin(p * Math.PI) : swing ? Math.sin(p * Math.PI) : fly ? 0 : easy(p);
    var arm = lift ? 'pull' : fly ? 'reach' : w.phase === 'carry' ? 'brace' : !swing ? 'raise' : w.t < C.windup ? 'pull' : p < 1 ? 'reach' : 'brace';
    o.attackStance = { aim: angle, arm: arm, hip: ease * press * .32, spread: ease * press * .34,
      lean: ease * Math.cos(angle) * (.08 + press * .24), roll: ease * Math.cos(angle) * press * .18,
      height: ease * press * (lift ? -.17 : .07), depth: ease * press * .18, bend: ease * press * (lift ? .19 : .07),
      plant: ease * press };
    o.attackHand = Math.cos(angle) < 0 ? -1 : 1;
    o.noArms = true; o.backHand = null;
    return true;
  };

  function pivot(b) { return Math.max(b.w, b.h) * .34; }
  function prop(R, s, b, x, y, rotation, squash) {
    var c = R.ctx, u = R.ppm, foot = pivot(b) * u, view = Object.create(R);
    view.X = function (wx) { return (wx - b.x) * u; };
    view.Y = function (wy) { return foot - (wy - b.y) * u; };
    c.save();
    c.translate(x, y); c.rotate(rotation); c.scale(1, squash);
    P.RenderWorld.blockProp(view, s, b, true);
    c.restore();
  }

  F.held = function (R, s, hands) {
    var w = s.streetWeapon, h = s.hero, u = R.ppm, c = R.ctx;
    if (!w || w.phase === 'flight') return;
    var swing = w.phase === 'swing', a = swing ? P.StreetWeapon.angle(w, w.t) : w.aim;
    var hand = hands && (Math.cos(a) < 0 ? hands.left : hands.right);
    var handleReach = Math.max(.36, Math.max(w.r.b.w, w.r.b.h) * .55 - .24);
    var reach = (handleReach + (swing ? w.swing * .10 : -.12)) * u;
    var x = (hand ? hand.x : R.X(h.x)) + Math.cos(a) * reach;
    var y = (hand ? hand.y : R.Y(h.y) - .56 * u) - Math.sin(a) * reach * .65;
    var rotation = -a + .14 * Math.cos(a), squash = .81 + .19 * Math.abs(Math.cos(a));
    if (w.phase === 'lift') {
      var lift = easy(clamp(w.t / C.lift));
      x = mix(R.X(w.r.x), x, lift); y = mix(R.Y(w.r.y) - pivot(w.r.b) * u, y, lift);
      rotation *= lift; squash = mix(1, squash, lift);
    } else if (w.phase === 'heft') {
      y -= u * .60 * easy(clamp(w.t / C.heft));
    }
    if (swing && w.t >= C.windup && w.t < C.windup + C.strike) ribbon(c, R, h, w, a);
    if (hand && w.phase !== 'lift') {
      c.save();
      c.beginPath(); c.moveTo(hand.x, hand.y); c.lineTo(x, y);
      c.lineCap = 'round'; c.strokeStyle = '#211C1B'; c.lineWidth = 4; c.stroke();
      c.strokeStyle = '#C78752'; c.lineWidth = 1.8; c.stroke(); c.restore();
    }
    prop(R, s, w.r.b, x, y, rotation, squash);
    scars(R, x, y, w.r.b.w, w.r.street ? w.r.street.wear : w.swing, rotation);
  };

  function ribbon(c, R, h, w, a) {
    var u = R.ppm, x = R.X(h.x), y = R.Y(h.y) - .44 * u;
    var before = P.StreetWeapon.angle(w, Math.max(C.windup, w.t - .085));
    var left = -Math.max(a, before), right = -Math.min(a, before);
    if (right - left < .01) return;
    c.save(); c.translate(x, y); c.scale(1, .62);
    c.lineCap = 'round';
    c.beginPath(); c.arc(0, 0, P.StreetWeapon.reach(w) * u, left, right);
    c.strokeStyle = 'rgba(90,39,26,.65)'; c.lineWidth = (5 + w.swing * 2); c.stroke();
    c.strokeStyle = 'rgba(255,214,131,.87)'; c.lineWidth = 2 + w.swing; c.stroke();
    c.restore();
  }

  F.air = function (R, s) {
    var w = s.streetWeapon, c = R.ctx, g = s.streetGrab, u = R.ppm;
    choicePads(R, s);
    var placed = s.streetSite;
    if (placed && placed.until > s.t && placed.prop.alive) {
      var age = 1 - (placed.until - s.t) / C.coverT;
      scars(R, R.X(placed.x), R.Y(placed.y) - .24 * u, placed.prop.b.w, 1 + age * 2, 0);
    }
    if (g) {
      var x = R.X(g.r.x), y = R.Y(g.r.y), r = (g.r.r + .17) * u;
      c.beginPath(); c.ellipse(x, y, r, r * .6, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(g.t / C.hold));
      c.strokeStyle = '#8DEBFF'; c.lineWidth = 3; c.stroke();
    }
    if (w && w.phase === 'heft' && w.to) footprint(R, w.to.x, w.to.y, C.landR, '#FFD18F', 1);
    var p = s.streetSite;
    if (p && !p.used && w && w.r === p.prop && w.phase !== 'flight') {
      footprint(R, p.x, p.y, .77, '#A4EAFF', 1);
      footprint(R, p.x, p.gripY, .44, '#A4EAFF', p.fill);
    }
    if (w && w.phase === 'flight') {
      var p = clamp(w.t / C.flight), X = R.X(mix(w.from.x, w.to.x, p)), Y = R.Y(mix(w.from.y, w.to.y, p));
      c.beginPath(); c.ellipse(X, Y, .62 * u, .24 * u, 0, 0, Math.PI * 2);
      c.fillStyle = 'rgba(31,22,18,.25)'; c.fill();
      var height = 1.28 * (1 - p) + 1.7 * 4 * p * (1 - p);
      prop(R, s, w.r.b, X, Y - height * u, -w.aim + (reduced() ? 0 : p * Math.PI * 2), .9);
    }
    var impact = s.streetImpact;
    if (impact && s.t - impact.at < .33) landing(R, impact, (s.t - impact.at) / .33);
  };

  function scars(R, x, y, width, wear, rotation) {
    if (!(wear > 0)) return;
    var c = R.ctx, u = R.ppm, reach = Math.min(.6, width * .38) * u;
    c.save(); c.translate(x, y); c.rotate(rotation); c.lineCap = 'round';
    for (var i = 0; i < Math.min(3, Math.ceil(wear)); i++) {
      var start = -reach + i * reach * .8, size = u * (.07 + wear * .035);
      c.beginPath(); c.moveTo(start, -.11 * u); c.lineTo(start + size, .02 * u);
      c.lineTo(start + size * .4, .10 * u); c.lineTo(start + size * 1.2, .18 * u);
      c.strokeStyle = '#342D28'; c.lineWidth = 3; c.stroke();
      c.strokeStyle = '#E4C395'; c.lineWidth = 1; c.stroke();
    }
    c.restore();
  }
  function choicePads(R, s) {
    var m = s.milestone;
    if (!P.LocalChoices || !m || !m.point || Math.abs(m.point.y - s.hero.y) > 13 || P.Speech && P.Speech.warningNear(s)) return;
    var c = R.ctx;
    P.LocalChoices.pads(s).forEach(function (p) {
      if (Math.abs(s.hero.y - p.y) > 8) return;
      var intent = s.localChoiceIntent;
      footprint(R, p.x, p.y, p.r, '#A4EAFF', intent && intent.id === p.id ? intent.t / P.CFG.experience.choiceHold : 0);
      c.save(); c.textAlign = 'center'; c.font = '800 11px "CM Comic Relief", sans-serif';
      c.strokeStyle = '#14151F'; c.fillStyle = '#FFF0D9'; c.lineJoin = 'round'; c.lineWidth = 3;
      var label = P.t('choice.' + p.id), x = R.X(p.x), y = R.Y(p.y) - 13;
      c.strokeText(label, x, y); c.fillText(label, x, y); c.restore();
    });
  }

  F.instruction = function (s) {
    var w = s.streetWeapon, p = s.streetSite;
    if (w && s.hero.streetHolding && p && !p.used && w.r === p.prop) return 'choice.ready.' + p.role;
    if (w && s.hero.streetHolding && w.r.street) return 'choice.escape';
    var pads = P.LocalChoices ? P.LocalChoices.pads(s) : [];
    if (pads.length && Math.abs(s.hero.y - pads[0].y) < 6) return s.levelIndex === 29 ? 'choice.station' : 'choice.escort';
    if (s.streetGrab && s.streetGrab.r.street) return 'choice.lift';
    var memory = s.runT < 3 && P.LocalChoices.memory(s);
    return memory || null;
  };

  function footprint(R, x, y, r, color, fill) {
    var c = R.ctx, u = R.ppm, X = R.X(x), Y = R.Y(y);
    c.save(); c.translate(X, Y); c.scale(1, .64); c.setLineDash([4, 3]);
    c.beginPath(); c.arc(0, 0, r * u, 0, Math.PI * 2);
    c.strokeStyle = '#222832'; c.lineWidth = 4; c.stroke();
    c.setLineDash([]); c.beginPath(); c.arc(0, 0, r * u, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (fill || .16));
    c.strokeStyle = color; c.lineWidth = 2; c.stroke(); c.restore();
  }

  function landing(R, hit, p) {
    var c = R.ctx, X = R.X(hit.x), Y = R.Y(hit.y), u = R.ppm, r = u * hit.r * mix(.34, 1, easy(p));
    c.save(); c.globalAlpha = 1 - p; c.translate(X, Y); c.scale(1, .67);
    c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2);
    c.lineWidth = 5 * (1 - p) + 1; c.strokeStyle = '#FFD18F'; c.stroke();
    for (var i = 0; i < 10; i++) {
      var a = i * Math.PI * .2, x = Math.cos(a), y = Math.sin(a);
      c.beginPath(); c.moveTo(x * r * .64, y * r * .64); c.lineTo(x * r * .91, y * r * .91);
      c.strokeStyle = i % 2 ? '#CC8450' : '#F6BB79'; c.stroke();
    }
    c.restore();
  }

  F.event = function (ev) {
    var cue = ev.beat;
    if (cue === 'lift') P.Sfx.play('footstep', 50, { rate: .78 });
    if (cue === 'swing') P.Sfx.play('swish', 0, { rate: .82 - ev.swing * .09 });
    if (cue === 'contact') {
      P.Sfx.play('hit', 0, { kind: 'blunt', rate: .91 });
      if (P.Feel && !reduced()) P.Feel.hitStop('heavy');
    }
    if (cue === 'throw') P.Sfx.play('lob', 0, { rate: .83 });
    if (cue === 'lure') P.Sfx.play('bell', 160);
    if (cue === 'cover' || cue === 'wedge' || cue === 'drop') P.Sfx.play('hit', 150, { kind: 'blunt', rate: .8 });
    if (cue === 'land') {
      P.Sfx.play('bruteStomp', 0, { rate: .78 });
      if (P.Feel && !reduced()) P.Feel.hitStop('heavy');
      if (P.Fx && !reduced()) P.Fx.addTrauma(.19);
    }
  };

  return F;
})();
