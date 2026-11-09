// Shock, pull and evolution visuals (workstream E1): Live Cable bolts (30 Hz flicker) and stun crowns (2.5 Hz),
// Speargun harpoon with a rope that sags in flight and goes taut when stuck, Fire Extinguisher cone + foam
// residue, Usta's Cleaver blade with swoosh, Chain Cyclone blades + pull ring, Cluster splits.
// Drawn through P.WFx2.drawGround / drawAir. armPose supplies the spear and extinguisher arm animation.
P.WFx3 = (function () {
  var M = {}, INK = '#14151F', MAX_CROWNS = 24, MAX_FOAM = 40;
  var anim = { spear: 9, spearA: 0, ext: 9, extA: 0 };
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function hash(v) { var x = Math.sin(v * 12.9898) * 43758.5453; return x - Math.floor(x); }

  M.reset = function () { anim = { spear: 9, spearA: 0, ext: 9, extA: 0 }; };
  M.update = function (dt) { anim.spear += dt; anim.ext += dt; };

  function ring(x, y, r, col) { P.WFx.add({ k: 'shock', x: x, y: y, r: r, t: 0.3, T: 0.3, col: col }); }

  M.onEvent = function (ev, s) {
    var pn = P.WFx.pan(s, ev.x !== undefined ? ev.x : s.hero.x);
    switch (ev.type) {
      case 'cableArc': P.Sfx.play('zap', 40, { pan: pn }); break;
      case 'cableZap': ring(ev.x, ev.y, 1.2, '150,220,255'); break;
      case 'spearFire': anim.spear = 0; anim.spearA = ev.a; P.Sfx.play('spear', 60, { pan: pn }); break;
      case 'spearHit': P.WFx.add({ k: 'impact', x: ev.x, y: ev.y, t: 0.15, T: 0.15 }); break;
      case 'spearPin': pin(ev, pn); break;
      case 'extSpray': anim.ext = 0; anim.extA = ev.a; P.Sfx.play('extinguisher', 80, { pan: pn }); break;
      case 'extTick': puffs(ev); break;
      case 'cleaverSpin': ring(ev.x, ev.y, 2.4, '255,255,255'); break;
      case 'cleaverChop':
        P.WFx.add({ k: 'chop', x: ev.x, y: ev.y, a: ev.a, t: 0.16, T: 0.16 });
        P.Sfx.play('cleaver', 50, { pan: pn });
        break;
      case 'cyclone': P.Sfx.play('cyclone', 200, { pan: pn }); break;
      case 'clusterSplit': clusterSplit(ev); break;
    }
  };

  function pin(ev, pn) {
    var i;
    ring(ev.x, ev.y, 0.6, '255,230,160');
    for (i = 0; i < 5; i++) P.WFx.add({ k: 'fleck', x: ev.x, y: ev.y, z: 0.4, vx: rnd(-2, 2), vy: rnd(-2, 2), vz: rnd(1, 3), t: 0.4, T: 0.4 });
    P.Sfx.play('spearPin', 60, { pan: pn });
  }

  function puffs(ev) {
    var half = ev.arc * Math.PI / 360, i, th, d;
    for (i = 0; i < 12; i++) {
      th = ev.a + rnd(-half, half); d = ev.range * rnd(0.3, 0.9);
      P.WFx.add({ k: 'puff', x: ev.x + Math.cos(th) * d * 0.3, y: ev.y + Math.sin(th) * d * 0.3, z: 0.3,
        vx: Math.cos(th) * 2.6, vy: Math.sin(th) * 2.6, vz: 0.2, r: 0.2, t: 0.35, T: 0.35 });
    }
  }

  function clusterSplit(ev) {
    var i;
    ring(ev.x, ev.y, 0.9, '255,110,90');
    for (i = 0; i < 3; i++) P.WFx.add({ k: 'smoke', x: ev.x, y: ev.y, z: 0.2, vz: 0.6, vx: rnd(-0.5, 0.5), vy: rnd(-0.5, 0.5), r: 0.2, t: 0.6, T: 0.6 });
  }

  // ---------- arm poses (hero back hand, called from WFx.heroBackHand) ----------
  // Returns true when it drew the arm. Spear: pulled back (0-0.4) then thrust (0.4-1). Extinguisher: braced, pushed.
  M.armPose = function (c, sh, u, f, skin, sleeve) {
    if (anim.spear < 0.25) return spearArm(c, sh, u, skin, sleeve, anim.spear / 0.25);
    if (anim.ext < 0.3) return extArm(c, sh, u, skin, sleeve, anim.ext / 0.3);
    return false;
  };

  function spearArm(c, sh, u, skin, sleeve, p) {
    var sa = -anim.spearA, back = p < 0.4 ? p / 0.4 : 1 - (p - 0.4) / 0.6, reach = (0.34 - back * 0.22) * u;
    var hx = sh.x + Math.cos(sa) * reach, hy = sh.y + Math.sin(sa) * reach;
    P.WFx.limbI(c, sh.x, sh.y, hx, hy, sleeve, 0.09 * u);
    c.save(); c.translate(hx, hy); c.rotate(sa);
    c.strokeStyle = '#7A5230'; c.lineWidth = 3; c.beginPath(); c.moveTo(-0.5 * u, 0); c.lineTo(0.7 * u, 0); c.stroke();
    c.fillStyle = '#D0D6DE'; c.strokeStyle = INK; c.lineWidth = 2;
    c.beginPath(); c.moveTo(0.7 * u, -0.07 * u); c.lineTo(0.95 * u, 0); c.lineTo(0.7 * u, 0.07 * u); c.closePath(); c.fill(); c.stroke();
    c.restore();
    P.WFx.dot(c, hx, hy, 0.055 * u, skin);
    return true;
  }

  function extArm(c, sh, u, skin, sleeve, p) {
    var sa = -anim.extA, kick = Math.sin(Math.min(1, p) * Math.PI) * 0.1, reach = (0.36 - kick) * u;
    var hx = sh.x + Math.cos(sa) * reach, hy = sh.y + Math.sin(sa) * reach;
    P.WFx.limbI(c, sh.x, sh.y, hx, hy, sleeve, 0.09 * u);
    c.save(); c.translate(hx, hy); c.rotate(sa);
    c.fillStyle = '#D7263D'; c.strokeStyle = INK; c.lineWidth = 2;
    c.fillRect(-0.1 * u, -0.09 * u, 0.36 * u, 0.18 * u); c.strokeRect(-0.1 * u, -0.09 * u, 0.36 * u, 0.18 * u);
    c.fillStyle = '#F2F2F2'; c.fillRect(-0.02 * u, -0.09 * u, 0.06 * u, 0.18 * u);
    c.fillStyle = '#3A3A3A'; c.fillRect(0.26 * u, -0.03 * u, 0.16 * u, 0.06 * u);
    c.restore();
    P.WFx.dot(c, hx, hy, 0.055 * u, skin);
    return true;
  }

  // ---------- ground layer: extinguisher cone, foam residue ----------
  M.drawGround = function (R, s) {
    var c = R.ctx, u = R.ppm, t = performance.now() / 1000, n = 0;
    c.save();
    P.Weapons.state(s).sprays.forEach(function (sp) { drawCone(c, R, s, sp, u); });
    s.enemies.forEach(function (e) {
      if (n >= MAX_FOAM || e.dead || !e.st || !(e.st.foam > 0)) return;
      n++; drawFoam(c, R, e, u, t);
    });
    c.restore();
  };

  function drawCone(c, R, s, sp, u) {
    var h = s.hero, lv = sp.lv, a = 1 - sp.t / sp.T, half = lv.arcDeg * Math.PI / 360;
    var X = R.X(h.x), Y = R.Y(h.y), rr = lv.range * u, sa = -sp.a;
    c.fillStyle = 'rgba(200,236,255,' + (0.2 * a).toFixed(3) + ')';
    c.beginPath(); c.moveTo(X, Y); c.arc(X, Y, rr, sa - half, sa + half, false); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,' + (0.4 * a).toFixed(3) + ')'; c.lineWidth = 2; c.setLineDash([6, 6]);
    c.beginPath(); c.arc(X, Y, rr, sa - half, sa + half, false); c.stroke(); c.setLineDash([]);
  }

  function drawFoam(c, R, e, u, t) {
    var X = R.X(e.x), Y = R.Y(e.y) + e.r * u * 0.3, a = Math.min(1, e.st.foam / 0.6), rr = e.r * u * 1.1, k;
    c.fillStyle = 'rgba(255,255,255,' + (0.42 * a).toFixed(3) + ')';
    c.beginPath(); c.ellipse(X, Y, rr, rr * 0.45, 0, 0, Math.PI * 2); c.fill();
    for (k = 0; k < 4; k++) {
      c.fillStyle = 'rgba(255,255,255,' + (0.7 * a).toFixed(3) + ')';
      c.beginPath();
      c.arc(X + Math.cos(k * 1.6 + t * 1.3) * rr * 0.7, Y + Math.sin(k * 2.1 + t * 1.7) * rr * 0.3, 0.09 * u * (0.7 + 0.3 * Math.sin(t * 4 + k)), 0, Math.PI * 2);
      c.fill();
    }
  }

  // ---------- air layer: stun crowns, cable bolts, spears, cleaver, cyclone ----------
  M.drawAir = function (R, s) {
    var c = R.ctx, u = R.ppm, t = performance.now() / 1000, h = s.hero, st = P.Weapons.state(s);
    c.save();
    crowns(c, R, s, u, t);
    st.bolts.forEach(function (b) { drawBolt(c, R, b, u, t); });
    st.spears.forEach(function (sp) { drawSpear(c, R, s, sp, u); });
    if (h.weapons.cleaver) drawCleaver(c, R, s, u, t);
    if (h.weapons.cyclone) drawCyclone(c, R, s, u, t);
    c.restore();
  };

  function crowns(c, R, s, u, t) {
    var n = 0, pulse = 0.6 + 0.4 * Math.sin(t * Math.PI * 5);
    s.enemies.forEach(function (e) {
      if (n >= MAX_CROWNS || e.dead || !e.st || !(e.st.stun > 0)) return;
      n++;
      var X = R.X(e.x), Y = R.Y(e.y) - (e.r + 0.35) * u, k, a;
      for (k = 0; k < 3; k++) {
        a = t * 3 + k * 2.094;
        c.fillStyle = 'rgba(150,220,255,' + pulse.toFixed(3) + ')';
        c.beginPath(); c.arc(X + Math.cos(a) * 0.2 * u, Y + Math.sin(a) * 0.07 * u, 0.045 * u, 0, Math.PI * 2); c.fill();
      }
    });
  }

  // Jagged bolt between two points; the jitter is re-rolled at 30 Hz from a seeded hash (replay-safe).
  function drawBolt(c, R, b, u, t) {
    var a = Math.max(0, 1 - b.t / b.T), n = 9, k, q, j, dx = b.x1 - b.x0, dy = b.y1 - b.y0, L = Math.hypot(dx, dy) || 1;
    var nx = -dy / L, ny = dx / L, fr = Math.floor(t * 30), pts = [];
    for (k = 0; k <= n; k++) {
      q = k / n; j = (k === 0 || k === n) ? 0 : (hash(b.seed + k * 7.13 + fr * 3.1) - 0.5) * 0.5;
      pts.push([R.X(b.x0 + dx * q + nx * j), R.Y(b.y0 + dy * q + ny * j)]);
    }
    c.lineJoin = 'round'; c.lineCap = 'round';
    [[9, 'rgba(90,190,255,' + (0.35 * a).toFixed(3) + ')'], [4, 'rgba(180,235,255,' + (0.8 * a).toFixed(3) + ')'],
      [1.5, 'rgba(255,255,255,' + a.toFixed(3) + ')']].forEach(function (st) {
      c.strokeStyle = st[1]; c.lineWidth = st[0]; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
      for (k = 1; k <= n; k++) c.lineTo(pts[k][0], pts[k][1]);
      c.stroke();
    });
  }

  // Harpoon: the rope sags in flight and is taut once stuck; the shaft fades out with the stick time.
  function drawSpear(c, R, s, sp, u) {
    var h = s.hero, stuck = sp.phase === 'stuck', fade = stuck ? Math.max(0, 1 - sp.t / sp.T) : 1;
    var hx = R.X(h.x), hy = R.Y(h.y + 0.2), hx2 = R.X(sp.x), hy2 = R.Y(sp.y), sa = -Math.atan2(sp.dy, sp.dx);
    var mx = (hx + hx2) / 2, my = (hy + hy2) / 2 + (stuck ? 0 : 0.12 * u);
    c.strokeStyle = 'rgba(230,220,190,' + (0.9 * fade).toFixed(3) + ')'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo(mx, my, hx2, hy2); c.stroke();
    c.save(); c.globalAlpha = fade;
    c.strokeStyle = INK; c.lineWidth = 5;
    c.beginPath(); c.moveTo(hx2 - Math.cos(sa) * 0.7 * u, hy2 - Math.sin(sa) * 0.7 * u); c.lineTo(hx2, hy2); c.stroke();
    c.strokeStyle = '#8B5E3C'; c.lineWidth = 2.5; c.stroke();
    c.translate(hx2, hy2); c.rotate(sa);
    c.fillStyle = '#D0D6DE'; c.strokeStyle = INK; c.lineWidth = 2;
    c.beginPath(); c.moveTo(0.25 * u, 0); c.lineTo(-0.02 * u, -0.09 * u); c.lineTo(0.04 * u, 0); c.lineTo(-0.02 * u, 0.09 * u); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#D7263D';
    c.beginPath(); c.moveTo(-0.7 * u, 0); c.lineTo(-0.55 * u, -0.1 * u); c.lineTo(-0.5 * u, 0); c.lineTo(-0.55 * u, 0.1 * u); c.closePath(); c.fill();
    c.restore();
  }

  // Usta's Cleaver: blade at lv.radius, trailing swoosh arcs behind the edge.
  function drawCleaver(c, R, s, u, t) {
    var h = s.hero, lv = P.Weapons.level(h, 'cleaver'), a = h.cleaA || 0, rad = lv.radius * u;
    var cx = R.X(h.x), cy = R.Y(h.y + 0.2), sa = -a, k;
    for (k = 0; k < 6; k++) {
      c.strokeStyle = 'rgba(230,240,255,' + (0.3 * (1 - k / 6)).toFixed(3) + ')'; c.lineWidth = (0.3 - k * 0.03) * u;
      c.beginPath(); c.arc(cx, cy, rad, sa + k * 0.12, sa + (k + 1) * 0.12, false); c.stroke();
    }
    c.save(); c.translate(cx, cy); c.rotate(sa);
    c.fillStyle = '#5A3D2B'; c.strokeStyle = INK; c.lineWidth = 2.5;
    c.fillRect(0.3 * rad, -0.07 * u, 0.3 * rad, 0.14 * u); c.strokeRect(0.3 * rad, -0.07 * u, 0.3 * rad, 0.14 * u);
    c.fillStyle = '#B8C0CA';
    c.beginPath(); c.moveTo(0.58 * rad, -0.14 * u); c.lineTo(rad, -0.14 * u); c.lineTo(rad + 0.1 * u, 0); c.lineTo(rad, 0.14 * u); c.lineTo(0.58 * rad, 0.14 * u); c.closePath();
    c.fill(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,' + (0.6 + 0.2 * Math.sin(t * 9)).toFixed(3) + ')'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(0.6 * rad, -0.1 * u); c.lineTo(rad, -0.1 * u); c.stroke();
    c.restore();
  }

  // Chain Cyclone: ring of sprocket blades at lv.radius, dashed pull radius.
  function drawCyclone(c, R, s, u, t) {
    var h = s.hero, lv = P.Weapons.level(h, 'cyclone'), a = h.cycA || 0, cx = R.X(h.x), cy = R.Y(h.y + 0.2), rad = lv.radius * u, k, ang;
    c.save();
    c.setLineDash([5, 7]); c.lineDashOffset = -t * 30; c.strokeStyle = 'rgba(180,230,255,0.18)'; c.lineWidth = 2;
    c.beginPath(); c.arc(cx, cy, lv.pullR * u, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
    c.strokeStyle = 'rgba(200,235,255,0.5)'; c.lineWidth = 3;
    c.beginPath(); c.arc(cx, cy, rad, 0, Math.PI * 2); c.stroke();
    for (k = 0; k < lv.blades; k++) {
      ang = -(a + k * Math.PI * 2 / lv.blades);
      P.WFx.sprocket(c, cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, 0.2 * u, t * 14 + k);
    }
    c.restore();
  }

  return M;
})();
