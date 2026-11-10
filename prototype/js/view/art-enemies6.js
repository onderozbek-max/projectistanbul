// Wave 1 enemy art (R1, view only): marti (a seagull drawn in flight, white with a gold beak and a grey wing, silhouette
// wide and low) and cayci (a tea carrier with a copper tray and amber glasses held out in front, teal cloth). Skin overlays on
// walkers: fisher (a rod), musician (a note above the head), hamal (a crate on the back). Wraps P.Sprites.enemy (sprites.js,
// art-enemies3..5 wrap it too; this file loads last). Accent colours: marti #FFB23F, cayci #2FA59A, hamal crate #A0643A.
(function () {
  var EN = P.ArtEnemies, R = P.ArtRig;
  if (!EN || !R || !P.Sprites || !EN.DEFS.spitter) return;
  var TAU = Math.PI * 2, INK = '#14151F';

  EN.DEFS.marti = { custom: true, body: 'human', scale: 0.9, eyes: INK, accent: '#FFB23F', flier: true };
  EN.DEFS.cayci = { body: 'human', gait: 'shamble', arms: 'hold', scale: 1.14, strideK: 0.7, liftK: 0.6, lean: 0.03, hunch: 0.04,
    sway: 0.02, eyes: '#FFB347', brow: 'worried', torn: false, wounds: 0, accent: '#2FA59A', tray: true };

  function facing(e) { return (e.vx || 0) < -0.05 ? -1 : 1; }

  var prevEnemy = P.Sprites.enemy;
  P.Sprites.enemy = function (Rd, e, hero) {
    if (e.type === 'marti') { drawMarti(Rd, e); return; }
    prevEnemy(Rd, e, hero);
    if (e.type === 'cayci') trayOver(Rd, e);
    if (e.skinBeh === 'fisher') rodOver(Rd, e);
    else if (e.skinBeh === 'musician') noteOver(Rd, e);
    else if (e.skinBeh === 'hamal') crateOver(Rd, e);
  };

  // Marti: flies at about 0.55 m, a slow bob, the wing flaps; a faint shadow on the ground under it.
  function drawMarti(Rd, e) {
    var c = Rd.ctx, u = Rd.ppm, X = Rd.X(e.x), G = Rd.Y(e.y), t = performance.now() / 1000;
    var uf = u * EN.DEFS.marti.scale, f = facing(e), bob = Math.sin(t * 5 + e.id) * 0.06;
    var Y = G - uf * (0.55 + bob), flap = Math.sin(t * 14 + e.id);
    c.save();
    c.globalAlpha = 0.22; c.fillStyle = INK;
    c.beginPath(); c.ellipse(X, G, uf * 0.36, uf * 0.11, 0, 0, TAU); c.fill();
    c.globalAlpha = 1;
    wing(c, X, Y, uf, f, flap, '#8E9BAA');                       // far wing, darker
    c.fillStyle = '#F3F5F7'; c.strokeStyle = INK; c.lineWidth = Math.max(1, uf * 0.05);
    c.beginPath(); c.ellipse(X, Y, uf * 0.36, uf * 0.19, 0, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.arc(X + f * uf * 0.34, Y - uf * 0.1, uf * 0.16, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#FFB23F';
    c.beginPath(); c.moveTo(X + f * uf * 0.46, Y - uf * 0.12); c.lineTo(X + f * uf * 0.68, Y - uf * 0.06);
    c.lineTo(X + f * uf * 0.46, Y - uf * 0.02); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc(X + f * uf * 0.38, Y - uf * 0.15, uf * 0.03, 0, TAU); c.fill();
    wing(c, X, Y, uf, f, flap, '#B7C3CF');                       // near wing, with black tips
    if (e.ai && e.ai.carry > 0) {                                // the stolen drop, gold, in the beak
      c.fillStyle = '#FFC93C'; c.beginPath(); c.arc(X + f * uf * 0.7, Y + uf * 0.05, uf * 0.09, 0, TAU); c.fill();
    }
    c.restore();
  }
  // One wing: a leading edge that rises and falls with flap (-1..1), black primaries at the tip.
  function wing(c, X, Y, uf, f, flap, col) {
    var tipY = Y - uf * (0.2 + 0.4 * flap);
    c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = Math.max(1, uf * 0.045);
    c.beginPath(); c.moveTo(X - f * uf * 0.06, Y - uf * 0.04);
    c.quadraticCurveTo(X - f * uf * 0.3, Y - uf * 0.3 - uf * 0.2 * flap, X - f * uf * 0.78, tipY);
    c.quadraticCurveTo(X - f * uf * 0.3, Y + uf * 0.08, X - f * uf * 0.06, Y + uf * 0.1);
    c.closePath(); c.fill(); c.stroke();
    if (col === '#B7C3CF') {
      c.fillStyle = INK; c.beginPath(); c.arc(X - f * uf * 0.78, tipY, uf * 0.07, 0, TAU); c.fill();
    }
  }

  // Cayci: the tray out in front at chest height, three amber glasses on a teal cloth. A windup tilts the glasses up.
  function trayOver(Rd, e) {
    var c = Rd.ctx, u = Rd.ppm, X = Rd.X(e.x), G = Rd.Y(e.y), uf = u * EN.DEFS.cayci.scale, f = facing(e);
    var tx = X + f * uf * 0.5, ty = G - uf * 0.74, lift = e.windup > 0 ? uf * 0.08 * e.windup : 0;
    c.save();
    c.fillStyle = '#B8733A'; c.strokeStyle = INK; c.lineWidth = Math.max(1, uf * 0.045);
    c.beginPath(); c.ellipse(tx, ty - lift, uf * 0.36, uf * 0.08, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#2FA59A';
    c.beginPath(); c.ellipse(tx, ty - lift - uf * 0.02, uf * 0.26, uf * 0.04, 0, 0, TAU); c.fill();
    for (var i = -1; i <= 1; i++) glass(c, tx + i * uf * 0.2, ty - lift - uf * 0.04, uf);
    c.restore();
  }
  function glass(c, x, y, uf) {
    c.fillStyle = '#E9A23B'; c.strokeStyle = INK; c.lineWidth = Math.max(1, uf * 0.03);
    c.beginPath(); c.moveTo(x - uf * 0.05, y); c.lineTo(x + uf * 0.05, y); c.lineTo(x + uf * 0.035, y - uf * 0.15);
    c.lineTo(x - uf * 0.035, y - uf * 0.15); c.closePath(); c.fill(); c.stroke();
  }

  // Fisher: a rod in the forward hand, the line hangs from its tip (the hook line itself is the lane telegraph).
  function rodOver(Rd, e) {
    var c = Rd.ctx, u = Rd.ppm, X = Rd.X(e.x), G = Rd.Y(e.y), uf = u * (EN.def(e.type).scale || 1), f = facing(e);
    c.save();
    c.strokeStyle = '#8B5E34'; c.lineWidth = Math.max(1, uf * 0.05);
    c.beginPath(); c.moveTo(X + f * uf * 0.3, G - uf * 0.7); c.lineTo(X + f * uf * 0.95, G - uf * 1.55); c.stroke();
    c.strokeStyle = '#D8D2C0'; c.lineWidth = Math.max(1, uf * 0.02);
    c.beginPath(); c.moveTo(X + f * uf * 0.95, G - uf * 1.55); c.lineTo(X + f * uf * 0.95, G - uf * 0.9); c.stroke();
    c.restore();
  }

  // Musician: a note above the head (a head and a stem with a flag: no text, so it reads without the font).
  function noteOver(Rd, e) {
    var c = Rd.ctx, u = Rd.ppm, X = Rd.X(e.x), G = Rd.Y(e.y), uf = u * (EN.def(e.type).scale || 1);
    var x = X + uf * 0.28, y = G - uf * 1.5, r = uf * 0.11;
    c.save();
    c.fillStyle = '#F4D35E'; c.strokeStyle = INK; c.lineWidth = Math.max(1, uf * 0.04);
    c.beginPath(); c.ellipse(x, y, r, r * 0.8, -0.3, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(x + r * 0.9, y - r * 0.2); c.lineTo(x + r * 0.9, y - uf * 0.34); c.stroke();
    c.beginPath(); c.moveTo(x + r * 0.9, y - uf * 0.34); c.lineTo(x + r * 2.0, y - uf * 0.24); c.lineTo(x + r * 2.0, y - uf * 0.16); c.stroke();
    c.restore();
  }

  // Hamal: a crate on the back (the rear is the armoured side, skins.js hitMul).
  function crateOver(Rd, e) {
    var c = Rd.ctx, u = Rd.ppm, X = Rd.X(e.x), G = Rd.Y(e.y), uf = u * (EN.def(e.type).scale || 1), f = facing(e);
    var w = uf * 0.36, h = uf * 0.4, x = X - f * uf * 0.34 - w / 2, y = G - uf * 0.98;
    c.save();
    c.fillStyle = '#A0643A'; c.strokeStyle = INK; c.lineWidth = Math.max(1, uf * 0.04);
    c.fillRect(x, y, w, h); c.strokeRect(x, y, w, h);
    c.beginPath(); c.moveTo(x, y + h * 0.5); c.lineTo(x + w, y + h * 0.5); c.stroke();
    c.restore();
  }
})();
