// Camera + game feel (DS 7): look-ahead, zoom, trauma shake, camera punch, damage numbers, particles.
P.Fx = (function () {
  var F = { cam: null, nums: [], parts: [], swings: [], rings: [], bursts: [], letters: [] };

  F.reset = function (s) {
    var w = P.CFG.view.widthM;
    F.cam = { x: -6, y: s.hero.y, w: w, trauma: 0, punchT: 0, ox: 0, oy: 0, rot: 0, zoom: 1 };
    F.cam.y = targetY(s, w);
    F.nums = []; F.parts = []; F.swings = []; F.rings = []; F.bursts = []; F.letters = [];
  };

  function targetX(s, w) {
    var h = s.hero, look = h.moving ? h.fx * P.CFG.view.lookAhead : 0;
    if (h.y < 0) return -6;
    var lim = Math.max(0, 7 - w / 2);
    return Math.min(lim, Math.max(-lim, h.x + look));
  }
  function targetY(s, w) {
    var h = s.hero, half = P.viewHalfH(w), look = h.moving ? h.fy * P.CFG.view.lookAhead : 0;
    if (s.mode === 'cutscene') return -5.2;
    var y = h.y + look;
    y = Math.max(y, -10 + half - 2.5);
    return Math.min(y, P.CFG.level.scaffoldY + 2 - half);
  }

  F.update = function (s, dt) {
    var c = F.cam, v = P.CFG.view, fe = P.CFG.feel, rm = P.Settings.reduceMotion;
    var wT = s.dir.zoomOut ? v.holdWidthM : v.widthM;
    var dw = (v.holdWidthM - v.widthM) / v.zoomTime * dt;
    c.w = c.w < wT ? Math.min(wT, c.w + dw) : Math.max(wT, c.w - dw);
    var k = 1 - Math.exp(-dt / v.smoothing);
    c.x += (targetX(s, c.w) - c.x) * k;
    c.y += (targetY(s, c.w) - c.y) * k;
    c.trauma = Math.max(0, c.trauma - fe.traumaDecay * dt);
    var sh = rm ? 0 : c.trauma * c.trauma;
    c.ox = fe.maxShakePx * sh * (Math.random() * 2 - 1);
    c.oy = fe.maxShakePx * sh * (Math.random() * 2 - 1);
    c.rot = fe.maxShakeDeg * Math.PI / 180 * sh * (Math.random() * 2 - 1);
    if (c.punchT > 0) c.punchT = Math.max(0, c.punchT - dt);
    var pp = c.punchT > 0 ? Math.sin((1 - c.punchT / (fe.punchTime * 2)) * Math.PI) : 0;
    c.zoom = 1 + (rm ? 0 : fe.punchZoom * pp);
    ageList(F.nums, dt); ageList(F.swings, dt); ageList(F.rings, dt); ageList(F.bursts, dt); ageList(F.letters, dt);
    F.parts.forEach(function (p) { p.t -= dt; p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt; });
    F.parts = F.parts.filter(function (p) { return p.t > 0; });
  };

  function ageList(list, dt) {
    for (var i = list.length - 1; i >= 0; i--) { list[i].t -= dt; if (list[i].t <= 0) list.splice(i, 1); }
  }

  F.addTrauma = function (a) { F.cam.trauma = Math.min(1, F.cam.trauma + a); };
  F.punch = function () { F.cam.punchT = P.CFG.feel.punchTime * 2; };
  F.letter = function (x, y, text) { F.letters.push({ x: x, y: y, text: text, t: 0.8, T: 0.8 }); };

  F.number = function (id, x, y, val, crit) {
    if (!P.Settings.dmgNumbers) return;
    var fe = P.CFG.feel;
    for (var i = F.nums.length - 1; i >= 0; i--) {
      var n = F.nums[i];
      if (n.id === id && n.T - n.t < fe.dmgMerge) { n.val += val; n.crit = n.crit || crit; return; }
    }
    if (F.nums.length >= fe.dmgNumberMax) F.nums.shift();
    F.nums.push({ id: id, x: x + (Math.random() - 0.5) * 0.3, y: y, val: val, crit: crit, t: fe.dmgNumberLife, T: fe.dmgNumberLife });
  };

  F.onEvent = function (ev, s) {
    switch (ev.type) {
      case 'hit': F.number(ev.id, ev.x, ev.y, ev.dmg, ev.crit); break;
      case 'kill':
        F.parts.push({ kind: 'splat', x: ev.x, y: ev.y, r: 0.35 + Math.random() * 0.2, t: 8, T: 8, a: Math.random() * 6 });
        F.parts.push({ kind: 'ash', x: ev.x, y: ev.y, t: 0.3, T: 0.3, r: 0.4 });
        break;
      case 'swing': F.swings.push({ x: ev.x, y: ev.y, ax: ev.ax, ay: ev.ay, range: ev.range, arc: ev.arcDeg, t: 0.12, T: 0.12 }); break;
      case 'teaLand': F.rings.push({ x: ev.x, y: ev.y, r: ev.r, t: 0.3, T: 0.3, color: '#B5651D' }); break;
      case 'explode':
        F.rings.push({ x: ev.x, y: ev.y, r: ev.r, t: 0.45, T: 0.45, color: '#FF4D2E' });
        for (var i = 0; i < 14; i++) {
          var a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 5;
          F.parts.push({ kind: 'spark', x: ev.x, y: ev.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 0.4, T: 0.4 });
        }
        F.addTrauma(ev.trauma); F.letter(ev.x, ev.y + 1, 'KÜT!');
        break;
      case 'heroHit': if (ev.dmg >= 0.1 * s.hero.maxHp || ev.cause !== 'canister') F.addTrauma(P.CFG.feel.traumaPlayerHit * (ev.dmg >= 10 ? 1 : 0.4)); break;
      case 'scaffold':
        F.addTrauma(ev.trauma);
        for (var j = 0; j < 20; j++) F.parts.push({ kind: 'dust', x: -6 + Math.random() * 12, y: 229 + Math.random() * 2, vx: (Math.random() - 0.5), vy: -Math.random() * 2, t: 1.5, T: 1.5 });
        break;
      case 'doorBurst': F.bursts.push({ x: ev.x, y: ev.y, t: 0.5, T: 0.5 }); break;
      case 'propBreak':
        for (var k = 0; k < 10; k++) F.parts.push({ kind: ev.kind === 'chestnut' ? 'ember' : 'shard', x: ev.x, y: ev.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, t: 0.6, T: 0.6 });
        break;
    }
  };

  return F;
})();
