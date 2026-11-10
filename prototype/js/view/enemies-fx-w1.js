// Wave 1 enemy visuals (R1, view only). Wraps P.EnemyFx.drawGround and P.EnemyFx.onEvent (enemies-fx.js) for the new types
// and skins: the tea puddle (zone kind 'tea'), the musician's faint aura ring, the hook line while the hero is dragged, and the
// cues and call-outs for the hook, the dive, the steal and its return, the tea and the crate. Nothing here changes the sim.
// Telegraphs (the hook lane, the dive shadow, the tea ring) are drawn by enemies-fx.js from the sim's telegraph list.
(function () {
  var EF = P.EnemyFx;
  if (!EF || !EF.drawGround || !EF.onEvent) return;
  var TAU = Math.PI * 2, prevGround = EF.drawGround, prevEvent = EF.onEvent;

  EF.drawGround = function (R, s) { prevGround(R, s); ground(R, s); };
  EF.onEvent = function (ev, s) { if (!event(ev, s)) prevEvent(ev, s); };

  // Ground layer: slow, faint, no flashing (design-system 7: at most 3 flashes a second).
  function ground(R, s) {
    var t = performance.now() / 1000, i, z, e;
    for (i = 0; i < s.zones.length; i++) {
      z = s.zones[i];
      if (z.kind === 'tea') puddle(R, z, t);
    }
    for (i = 0; i < s.enemies.length; i++) {
      e = s.enemies[i];
      if (e.skinBeh === 'musician' && !e.dead) aura(R, e, t);
    }
    if (s.skinPull) pullLine(R, s);
  }

  // Tea: a brown-amber puddle with a lighter rim, fading over its last second. The rim wobbles slowly.
  function puddle(R, z, t) {
    var c = R.ctx, X = R.X(z.x), Y = R.Y(z.y), rx = z.r * R.ppm, ry = rx * 0.55;
    var a = Math.min(1, z.t / 1.0) * 0.55, wob = 1 + 0.03 * Math.sin(t * 1.6 + z.x);
    c.save();
    c.fillStyle = 'rgba(170,96,32,' + a + ')';
    c.beginPath(); c.ellipse(X, Y, rx * wob, ry * wob, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(233,162,59,' + (a * 1.2) + ')'; c.lineWidth = Math.max(1, rx * 0.06);
    c.beginPath(); c.ellipse(X, Y, rx * 0.92 * wob, ry * 0.92 * wob, 0, 0, TAU); c.stroke();
    c.restore();
  }

  // Musician: a dotted ring at its buff radius (the walkers inside it move faster).
  function aura(R, e, t) {
    var c = R.ctx, X = R.X(e.x), Y = R.Y(e.y), r = P.CFG.skins.musician.radius * R.ppm;
    c.save();
    c.strokeStyle = 'rgba(244,211,94,0.22)'; c.lineWidth = Math.max(1, R.ppm * 0.05);
    c.setLineDash([R.ppm * 0.3, R.ppm * 0.4]); c.lineDashOffset = -t * R.ppm * 0.5;
    c.beginPath(); c.ellipse(X, Y, r, r * 0.55, 0, 0, TAU); c.stroke();
    c.restore();
  }

  // Hook: the line from the fisher to the hero, while the hero is dragged.
  function pullLine(R, s) {
    var c = R.ctx, p = s.skinPull, hx = R.X(s.hero.x), hy = R.Y(s.hero.y), fx = R.X(p.fx), fy = R.Y(p.fy);
    c.save();
    c.strokeStyle = 'rgba(216,210,192,0.9)'; c.lineWidth = Math.max(1, R.ppm * 0.04);
    c.beginPath(); c.moveTo(fx, fy); c.lineTo(hx, hy); c.stroke();
    c.restore();
  }

  // Events: returns true when the event is one of the wave 1 ones (the default handler is then skipped). A marti's kill
  // makes a swish and no walker corpse (no feather effect yet).
  function event(ev, s) {
    switch (ev.type) {
      case 'hookCast': sfx('swish', 300, s, ev.x); return true;
      case 'hookHit': P.Fx.letter(s.hero.x, s.hero.y + 1.6, label('ev.hookHit', 'Olta!', 'Hook!')); sfx('swish', 0, s, ev.x); return true;
      case 'hookBreak': case 'hookMiss': return true;
      case 'martiShadow': sfx('swish', 250, s, ev.x); return true;
      case 'martiSteal': P.Fx.letter(ev.x, ev.y + 0.8, label('ev.steal', 'Kaptı!', 'Snatched!')); sfx('tink', 0, s, ev.x); return true;
      case 'martiReturn': sfx('tink', 0, s, ev.x); return true;
      case 'martiGone': return true;
      case 'teaWindup': sfx('hiss', 200, s, ev.x); return true;
      case 'teaLand': sfx('spit', 150, s, ev.x); return true;
      case 'crateDrop': sfx('rattle', 200, s, ev.x); return true;
      case 'crateGone': return true;
      case 'kill': if (ev.enemy === 'marti') { sfx('swish', 120, s, ev.x); return true; } return false;
      default: return false;
    }
  }
  function label(key, tr, en) { var v = P.t(key); return v !== key ? v : (P.lang === 'tr' ? tr : en); }
  function sfx(name, gap, s, x) {
    var pan = x === undefined ? 0 : Math.max(-1, Math.min(1, (x - s.hero.x) / 6));
    if (P.Sfx && P.Sfx.play) P.Sfx.play(name, gap || 0, { pan: pan });
  }
})();
