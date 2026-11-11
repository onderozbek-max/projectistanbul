// v0.7 enemy art and motion (lane C, view only). Bodies and motion for kurye (courier on a scooter with a delivery box),
// copci (street sweeper with a broom), taksici (taxi driver over a yellow car) and kasapBoss (the butcher, bigger). Wraps
// P.Sprites.enemy (sprites.js; art-enemies3 wraps it too) for: hit flinch, wind-up lean, idle head twitch, shamble,
// scale-in for ordinary spawns, and the entrance transforms (window, door, balcony, tram). Numbers: P.CFG.enemies3.feel.
// Wave 2: the flinch is a stagger of feel.flinchT seconds (sim time, enemies-fx.js hitAt), not a 60 ms blip.
(function () {
  var EN = P.ArtEnemies, R = P.ArtRig, CH = P.ArtChars;
  if (!EN || !R || !CH || !P.Sprites || !EN.DEFS.kasap) return;
  var INK = R.INK, TAU = R.TAU, FL = P.CFG.enemies3.feel;
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  EN.DEFS.kurye = { body: 'slim', gait: 'run', arms: 'pump', scale: 1.0, strideK: 1.4, liftK: 1.2, lean: 0.16, hunch: 0.05,
    sway: 0.03, eyes: '#FF5A3D', brow: 'angry', torn: true, wounds: 1, scooter: true };
  EN.DEFS.copci = { body: 'bulky', gait: 'stomp', arms: 'drag', scale: 1.2, strideK: 0.6, liftK: 0.45, lean: 0.04, hunch: 0.1,
    sway: 0.02, eyes: '#FFB347', brow: 'worried', torn: true, wounds: 1, broom: true };
  EN.DEFS.taksici = { body: 'brute', gait: 'stomp', arms: 'drag', scale: 1.5, strideK: 0.5, liftK: 0.35, lean: 0.06, hunch: 0.08,
    sway: 0.02, eyes: '#FFD27A', brow: 'angry', torn: true, wounds: 2, car: true };
  EN.DEFS.kasapBoss = Object.assign({}, EN.DEFS.kasap, { scale: 1.6, eyes: '#FF3B2E' });

  // Hit flinch (stagger): the last hit's direction (enemies-fx.js hitX) leans the figure away from the blow, decaying over
  // feel.flinchT seconds of sim time (hitAt, read at EF.nowT). Bosses lean 35%. Sim time, so a pause freezes it.
  function flinchOf(e) {
    var EF = P.EnemyFx, dx = EF && EF.hitX ? (EF.hitX[e.id] || 0) : 0, at = EF && EF.hitAt ? EF.hitAt[e.id] : undefined;
    if (dx === 0 || at === undefined) return 0;
    var f = clamp01(1 - (EF.nowT - at) / FL.flinchT);
    return (dx > 0 ? 1 : -1) * FL.flinchLean * f * (e.boss ? 0.35 : 1);
  }

  // Scale for the figure: the same unit S.enemy uses (scale, elite, boss).
  function unitOf(Rd, e) { return Rd.ppm * EN.def(e.type).scale * (e.boss ? 2.2 : 1) * (e.elite ? 1.25 : 1); }

  var prevEnemy = P.Sprites.enemy;
  P.Sprites.enemy = function (Rd, e, hero) {
    var c = Rd.ctx, u = Rd.ppm, uf = unitOf(Rd, e), X = Rd.X(e.x), Y = Rd.Y(e.y - e.r * 0.6);
    var f = hero.x >= e.x ? 1 : -1, def = EN.def(e.type);
    if (e.state === 'rising' && e.entrance) { drawRising(Rd, e, hero, X, Y, uf, f); return; }
    var wl = clamp01(e.windup || 0), id = e.id || 0;
    var rot = flinchOf(e) - f * FL.windupLean * wl, sq = 1 - FL.windupSquash * wl;
    var tw = (e.age + id * 0.37) % FL.twitchEvery < FL.twitchT ? FL.twitchAmp * (id % 2 ? 1 : -1) : 0;
    var sway = Math.sin((e.walk || 0) * 1.1 + id) * FL.shamble * u, sc = e.age < FL.scaleIn ? 0.5 + 0.5 * e.age / FL.scaleIn : 1;
    c.save();
    if (sc < 1) c.globalAlpha = sc;
    c.translate(X + sway, Y); c.rotate(rot); c.scale(sc, sc * sq); c.translate(-X, -Y);
    if (tw) { var nk = Y - 0.9 * uf; c.translate(X, nk); c.rotate(tw); c.translate(-X, -nk); }
    if (def.scooter) scooter(c, X, Y, uf, f);
    if (def.car) taxiCar(c, Rd, e, X, Y, uf);
    prevEnemy(Rd, e, hero);
    if (def.broom) broom(c, X, Y, uf, f, wl);
    if (e.exposed) weakSpot(c, e, X, Y, uf, def);
    c.restore();
  };

  // Entrance (rising): clip above the opening, offset up or down by the rise progress; drops fall from balcony height.
  function drawRising(Rd, e, hero, X, Y, uf, f) {
    var c = Rd.ctx, u = Rd.ppm, E = e.entrance, p = clamp01(1 - e.stateT / E.T), k = 1 - p;
    c.save();
    if (E.kind === 'window') {
      c.beginPath(); c.rect(X - 0.45 * u, Y - 0.9 * u, 0.9 * u, 0.9 * u + 0.02 * uf); c.clip();
      c.translate(0, k * 0.6 * uf);
    } else if (E.kind === 'balcony') {
      c.globalAlpha = clamp01(p / 0.15);
      c.translate(0, -(E.drop || 2) * u * k * k);
    } else if (E.kind === 'door') {                           // A5 door: steps out of the doorway toward the street
      c.globalAlpha = clamp01(p / 0.3);
      c.translate((e.x >= 0 ? 1 : -1) * k * 0.8 * u, 0);
    } else if (E.kind === 'tram') {
      c.globalAlpha = clamp01(p / 0.3);
      c.translate(-(e.x >= 0 ? 1 : -1) * k * 0.8 * u, 0);
    }
    prevEnemy(Rd, e, hero);
    c.restore();
  }

  // Scooter under the courier: two wheels, a deck, and a delivery box on the back (generic, no brand).
  function scooter(c, X, Y, uf, f) {
    var wr = 0.14 * uf, ly = Y + 0.12 * uf;
    c.strokeStyle = INK; c.lineWidth = 2; c.fillStyle = '#2A2D38';
    c.beginPath(); c.arc(X + f * 0.42 * uf, ly, wr, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.arc(X - f * 0.42 * uf, ly, wr, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#3D6E9E';
    c.fillRect(X - 0.46 * uf, Y - 0.02 * uf, 0.92 * uf, 0.08 * uf);
    c.fillStyle = '#E8782A'; c.strokeStyle = INK;
    c.fillRect(X - f * 0.62 * uf - 0.18 * uf, Y - 0.62 * uf, 0.36 * uf, 0.34 * uf);
    c.strokeRect(X - f * 0.62 * uf - 0.18 * uf, Y - 0.62 * uf, 0.36 * uf, 0.34 * uf);
  }

  // Broom held out in front (copci). It sways a little with the wind-up lean.
  function broom(c, X, Y, uf, f, wl) {
    var hx = X + f * 0.34 * uf, hy = Y - 0.5 * uf, tx = X + f * (0.62 + 0.06 * wl) * uf, ty = Y + 0.3 * uf;
    c.strokeStyle = INK; c.lineWidth = 0.05 * uf + 2; c.beginPath(); c.moveTo(hx, hy); c.lineTo(tx, ty); c.stroke();
    c.strokeStyle = '#8B6B3E'; c.lineWidth = 0.035 * uf; c.beginPath(); c.moveTo(hx, hy); c.lineTo(tx, ty); c.stroke();
    c.fillStyle = '#C9A13B'; c.strokeStyle = INK; c.lineWidth = 2;
    c.beginPath(); c.moveTo(tx - 0.18 * uf, ty); c.lineTo(tx + 0.18 * uf, ty); c.lineTo(tx + 0.24 * uf, ty + 0.16 * uf);
    c.lineTo(tx - 0.24 * uf, ty + 0.16 * uf); c.closePath(); c.fill(); c.stroke();
  }

  // Taxi (taksici): a yellow car body under the driver, nose along the heading; a roof sign, windscreen and headlights.
  // The car is drawn in metres (Rd.ppm) so it reads at the arena scale.
  function taxiCar(c, Rd, e, X, Y, uf) {
    var u = Rd.ppm, d = e.ai && e.ai.dir ? e.ai.dir : { x: 0, y: 1 }, ang = Math.atan2(-d.y, d.x) + Math.PI / 2;
    var L = 3.6 * u, W = 1.9 * u, cx = X, cy = Y + 0.25 * uf;
    c.save(); c.translate(cx, cy); c.rotate(ang);
    c.fillStyle = '#FFC93C'; c.strokeStyle = INK; c.lineWidth = 2.5;
    roundRect(c, -W / 2, -L / 2, W, L, 0.25 * u); c.fill(); c.stroke();
    c.fillStyle = '#1B1D26'; c.fillRect(-W / 2 + 0.12 * u, -L / 2 + 0.85 * u, W - 0.24 * u, L - 1.7 * u);
    c.fillStyle = '#9BD3E8'; c.fillRect(-W / 2 + 0.2 * u, -L / 2 + 0.2 * u, W - 0.4 * u, 0.5 * u);
    c.fillStyle = '#F4EBDD'; c.strokeStyle = INK; c.lineWidth = 1.5;
    c.fillRect(-0.36 * u, -0.1 * u, 0.72 * u, 0.22 * u); c.strokeRect(-0.36 * u, -0.1 * u, 0.72 * u, 0.22 * u);
    c.fillStyle = e.exposed ? 'rgba(255,190,70,' + (0.55 + 0.4 * Math.sin(performance.now() / 190)) + ')' : '#FFF3C4';
    c.beginPath(); c.arc(-W / 2 + 0.22 * u, -L / 2 + 0.12 * u, 0.12 * u, 0, TAU); c.fill();
    c.beginPath(); c.arc(W / 2 - 0.22 * u, -L / 2 + 0.12 * u, 0.12 * u, 0, TAU); c.fill();
    c.restore();
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }

  // Weak spot tell (exposed bosses): a slow pulse (1.2 Hz) on a red-orange ring around the torso. Never faster than 3/s.
  function weakSpot(c, e, X, Y, uf, def) {
    var p = 0.5 + 0.5 * Math.sin(performance.now() / 1000 * TAU * 1.2);
    c.save(); c.globalAlpha = 0.45 + 0.4 * p; c.strokeStyle = '#FF8A3D'; c.lineWidth = 3 + 2 * p;
    c.beginPath(); c.ellipse(X, Y - 0.55 * uf, 0.55 * uf, 0.7 * uf, 0, 0, TAU); c.stroke(); c.restore();
  }

  P.ArtEnemies4 = { flinchOf: flinchOf };
})();
