// v0.7 enemy world FX (lane C, view only): the 6 s corpse list (death poses, art-enemies5.js), spawn-entrance props
// (window, A5 door, balcony slab, tram door), rolling wheelie bins and crates, the boss thrown objects (cleaver, audio guide, vase),
// electric sparks and the death puffs. Hooks: P.EnemiesFx2.drawUnder (ground, under enemies) and drawOver (air).
// Sim state read: s.e3 (bins, blades), s.enemies (entrance), s.dir.telegraphs, s.t (sim time).
P.EnemiesFx2 = (function () {
  var F2 = { corpses: [], keys: {}, sparks: [] }, POSE = P.CFG.enemies3.deathPose;
  var COL = { dust: '#B9AE9A', blood: '#7A1518', ember: '#FF8A3D', smoke: '#3A3A40', blast: '#FFD166', grime: '#8A7F70' };
  var METAL = '#D9DEE5', WALL = '#3B3F4D', WINDOW = '#14151F', TRAM = '#E0B23C', TRAM_RED = '#B5361F';
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function keyOf(x, y, etype) { return x.toFixed(4) + '|' + y.toFixed(4) + '|' + etype; }

  F2.reset = function () { F2.corpses = []; F2.keys = {}; F2.sparks = []; };

  // ---------- kills: corpse record (owned, 6 s) and death FX per pose ----------
  F2.onKill = function (s, ev) {
    var etype = ev.enemy || 'walker', pose = P.ArtDeath.poseFor(ev.src), key = keyOf(ev.x, ev.y, etype);
    var rec = { key: key, x: ev.x, y: ev.y, dx: ev.dx || 0, dy: ev.dy || 1, etype: etype, variant: ev.variant || 0, skin: ev.skin,
      pose: pose, t0: s.t, dur: POSE.life };
    F2.corpses.push(rec); F2.keys[key] = true;
    while (F2.corpses.length > POSE.cap) { var old = F2.corpses.shift(); delete F2.keys[old.key]; }
    deathFx(s, rec, ev);
  };

  // Corpse particles from fx.js are drawn by drawUnder instead, for the full 6 s.
  F2.ownsCorpse = function (p) { return !!(p && p.x !== undefined && F2.keys[keyOf(p.x, p.y, p.etype || 'walker')]); };

  function deathFx(s, rec, ev) {
    var P1 = P.EnemyFx, x = ev.x, y = ev.y, i, a;
    if (rec.pose === 'electric') {
      for (i = 0; i < 3; i++) F2.sparks.push({ x: x, y: y, ang: i * 2.1 + (s.t % 1), len: 0.5 + 0.2 * i, t0: s.t, dur: 0.35 });
    } else if (rec.pose === 'fire') {
      for (i = 0; i < 6; i++) {
        a = i * 1.05;
        P1.puffs.push({ x: x, y: y, vx: Math.cos(a) * 0.4, vy: 1.2 + 0.15 * i, r: 0.12, col: COL.ember, t0: s.t, dur: 0.9 });
      }
      for (i = 0; i < 4; i++) P1.puffs.push({ x: x + (i - 1.5) * 0.2, y: y, vx: 0.1 * (i - 1.5), vy: 0.8, r: 0.35, col: COL.smoke, t0: s.t, dur: 1.4 });
    } else if (rec.pose === 'blade') {
      for (i = 0; i < 8; i++) { a = i / 8 * Math.PI * 2; P1.puffs.push({ x: x, y: y, vx: Math.cos(a) * 1.6, vy: Math.sin(a) * 1.6, r: 0.22, col: COL.blood, t0: s.t, dur: 0.6 }); }
      P1.splats.push({ x: x, y: y, r: 0.8, col: COL.blood, t0: s.t, dur: 6, a: 0 });
    } else if (rec.pose === 'explosion') {
      P1.rings.push({ x: x, y: y, r: 1.2, col: COL.blast, t0: s.t, dur: 0.4 });
      for (i = 0; i < 8; i++) { a = i / 8 * Math.PI * 2; P1.puffs.push({ x: x, y: y, vx: Math.cos(a) * 1.4, vy: Math.sin(a) * 1.4, r: 0.3, col: COL.grime, t0: s.t, dur: 0.8 }); }
    } else {
      P1.rings.push({ x: x, y: y, r: 0.6, col: COL.dust, t0: s.t, dur: 0.3 });
      for (i = 0; i < 6; i++) { a = i / 6 * Math.PI * 2; P1.puffs.push({ x: x, y: y, vx: Math.cos(a) * 0.9, vy: Math.sin(a) * 0.9, r: 0.2, col: COL.dust, t0: s.t, dur: 0.5 }); }
    }
  }

  // ---------- ground layer ----------
  F2.drawUnder = function (R, s) {
    var i, rec, age;
    for (i = F2.corpses.length - 1; i >= 0; i--) {
      rec = F2.corpses[i]; age = s.t - rec.t0;
      if (age > rec.dur) { delete F2.keys[rec.key]; F2.corpses.splice(i, 1); }
    }
    F2.corpses.forEach(function (r) { P.ArtDeath.draw(R, r, s.t - r.t0); });
    s.enemies.forEach(function (e) { if (e.state === 'rising' && e.entrance) drawEntrance(R, e); });
    if (s.e3) s.e3.bins.forEach(function (b) { drawBin(R, b); });
  };

  // ---------- air layer ----------
  F2.drawOver = function (R, s) {
    var c = R.ctx, u = R.ppm, i, sp;
    for (i = F2.sparks.length - 1; i >= 0; i--) { sp = F2.sparks[i]; if (s.t - sp.t0 > sp.dur) F2.sparks.splice(i, 1); }
    F2.sparks.forEach(function (k) { drawSpark(c, R, k, s.t); });
    if (s.e3) s.e3.blades.forEach(function (b) { drawBlade(R, b); });
  };

  function drawSpark(c, R, k, t) {
    var f = (t - k.t0) / k.dur, u = R.ppm, x0 = R.X(k.x), y0 = R.Y(k.y), pts = 4, j, a, r;
    c.globalAlpha = 1 - f; c.strokeStyle = '#FFF3A0'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x0, y0);
    for (j = 1; j <= pts; j++) {
      r = k.len * u * j / pts * (1 + 0.5 * f); a = k.ang + (j % 2 ? 0.45 : -0.45);
      c.lineTo(x0 + Math.cos(a) * r, y0 + Math.sin(a) * r);
    }
    c.stroke(); c.globalAlpha = 1;
  }

  function rectW(R, x0, y0, x1, y1, fill, stroke) {
    var c = R.ctx, X = R.X(x0), Y = R.Y(y1), w = (x1 - x0) * R.ppm, h = (y1 - y0) * R.ppm;
    c.fillStyle = fill; c.fillRect(X, Y, w, h);
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2; c.strokeRect(X, Y, w, h); }
  }

  // Spawn entrance props under the rising enemy. e.x/e.y: the feature's centre; the sill or ground is the feet line.
  function drawEntrance(R, e) {
    var E = e.entrance, p = clamp01(1 - e.stateT / E.T), side = e.x >= 0 ? 1 : -1, sill = e.y - e.r * 0.6;
    if (E.kind === 'window') {
      rectW(R, e.x - 1.2, sill - 0.35, e.x + 1.2, sill + 1.6, WALL, '#14151F');
      rectW(R, e.x - 0.45, sill, e.x + 0.45, sill + 0.9, WINDOW, '#F4EBDD');
    } else if (E.kind === 'balcony') {
      var by = e.y + E.drop;
      rectW(R, e.x - 1.3, by - 0.2, e.x + 1.3, by + 1.1, WALL, '#14151F');
      rectW(R, e.x - 1.4, by - 0.22, e.x + 1.4, by + 0.02, '#6B6F7B', '#14151F');
      for (var b = -1.2; b <= 1.21; b += 0.4) rectW(R, e.x + b - 0.03, by + 0.02, e.x + b + 0.03, by + 0.5, '#8A8F98');
    } else if (E.kind === 'door') {
      // A5 door (env-portal.js): a doorway in the wall; the leaf swings open as the enemy steps out.
      var sw = e.x >= 0 ? 1 : -1, leaf = e.x + sw * (0.5 - 0.35 * p);
      rectW(R, e.x - 0.9, e.y - 1.0, e.x + 0.9, e.y + 1.0, WALL, '#14151F');
      rectW(R, e.x - 0.5, e.y - 0.9, e.x + 0.5, e.y + 0.95, WINDOW);
      rectW(R, Math.min(leaf, e.x + sw * 0.5), e.y - 0.9, Math.max(leaf, e.x + sw * 0.5), e.y + 0.95, '#6B4A2E', '#14151F');
    } else if (E.kind === 'tram') {
      var inner = side * 3.4, outer = side * 5.6, x0 = Math.min(inner, outer), x1 = Math.max(inner, outer);
      rectW(R, x0, e.y - 3, x1, e.y + 3, TRAM, '#14151F');
      rectW(R, x0, e.y - 2.2, x1, e.y - 1.9, TRAM_RED);
      rectW(R, x0, e.y + 1.9, x1, e.y + 2.2, TRAM_RED);
      var door = 0.7 * p;                                     // doors slide apart
      rectW(R, inner - 0.02, e.y - 0.7 - door * 0.0, inner + 0.02, e.y + 0.7, WINDOW);
      rectW(R, inner - 0.06, e.y + 0.05 + door * 0.2, inner + 0.02, e.y + 0.7 + door * 0.2, '#6B6F7B');
    }
  }

  // Rolling wheelie bin (copci): a green bin on two wheels, a lid line, sway with the roll.
  function drawBin(R, b) {
    if (b.kind === 'crate') return drawCrate(R, b);
    var c = R.ctx, u = R.ppm, X = R.X(b.x), Y = R.Y(b.y), w = 0.7 * u, h = 0.95 * u, calm = !!(P.Settings && P.Settings.reduceMotion),
      sw = calm ? 0 : Math.sin(b.t * 14) * 0.04 * u;
    c.save(); c.translate(X + sw, Y); c.rotate(calm ? 0 : Math.sin(b.t * 9) * 0.06);
    c.fillStyle = '#2F7D4F'; c.strokeStyle = '#14151F'; c.lineWidth = 2;
    c.beginPath(); c.roundRect ? c.roundRect(-w / 2, -h, w, h, 0.08 * u) : c.rect(-w / 2, -h, w, h); c.fill(); c.stroke();
    c.fillStyle = '#25613D'; c.fillRect(-w / 2, -h, w, 0.14 * u);
    c.fillStyle = '#14151F'; c.beginPath(); c.arc(-w / 3, 0.02 * u, 0.07 * u, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(w / 3, 0.02 * u, 0.07 * u, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  // Crate (copci, every second push): a wooden box, two planks and a nail, tumbling a little as it rolls.
  function drawCrate(R, b) {
    var c = R.ctx, u = R.ppm, X = R.X(b.x), Y = R.Y(b.y), w = 0.8 * u, h = 0.8 * u, calm = !!(P.Settings && P.Settings.reduceMotion),
      sw = calm ? 0 : Math.sin(b.t * 11) * 0.03 * u;
    c.save(); c.translate(X + sw, Y - h / 2); c.rotate(calm ? 0 : Math.sin(b.t * 7) * 0.09);
    c.fillStyle = '#8B6B3E'; c.strokeStyle = '#14151F'; c.lineWidth = 2;
    c.fillRect(-w / 2, -h / 2, w, h); c.strokeRect(-w / 2, -h / 2, w, h);
    c.strokeStyle = '#5E4628'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-w / 2, -h / 6); c.lineTo(w / 2, -h / 6); c.moveTo(-w / 2, h / 6); c.lineTo(w / 2, h / 6); c.stroke();
    c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2, h / 2); c.stroke();
    c.restore();
  }

  // Thrown object (boss throw): flies from the boss to the spot and lifts on an arc. The boss kind (b.kind, set by the sim)
  // picks the sprite: the audio guide and the vase (art-bosses.js); the kasapBoss cleaver is drawn here. Reduce motion sways.
  function drawBlade(R, b) {
    var c = R.ctx, u = R.ppm, f = clamp01(b.t / b.dur), x = b.x0 + (b.x1 - b.x0) * f, y = b.y0 + (b.y1 - b.y0) * f;
    var lift = Math.sin(Math.PI * f) * 1.6, X = R.X(x), Y = R.Y(y) - lift * u;
    if (P.ArtBosses && P.ArtBosses.drawThrown(c, u, X, Y, b)) return;
    c.save(); c.translate(X, Y); c.rotate(P.Settings && P.Settings.reduceMotion ? 0.4 * Math.sin(b.t * 5) : b.t * 13);
    c.fillStyle = METAL; c.strokeStyle = '#14151F'; c.lineWidth = 2;
    c.fillRect(-0.05 * u, -0.22 * u, 0.36 * u, 0.36 * u); c.strokeRect(-0.05 * u, -0.22 * u, 0.36 * u, 0.36 * u);
    c.fillStyle = '#6B4A2E'; c.fillRect(-0.2 * u, -0.05 * u, 0.2 * u, 0.1 * u); c.strokeRect(-0.2 * u, -0.05 * u, 0.2 * u, 0.1 * u);
    c.restore();
  }

  return F2;
})();
