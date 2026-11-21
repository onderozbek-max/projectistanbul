P.SirkeciBoss = (function () {
  var B = {}, C = P.CFG.bosses.ticketMan;

  function punch(s, e, a, minimum) {
    var K = C.punch;
    a.W = minimum(K.windup * a.wm);
    P.Enemies.ring(s, e.x + a.dir.x * K.reach, e.y + a.dir.y * K.reach, K.r, a.W, 'swing', 'slam',
      { owner: e.id, dmg: P.Enemies.dmgOf(s, e, K.dmg), kb: K.kb, cause: 'ticketMan' });
  }

  function signals(s, e, a, minimum) {
    var K = C.signals, g = s.geo;
    var y = Math.max(g.holdY + K.edge, Math.min(g.exitY - K.edge, s.hero.y));
    a.W = minimum(K.windup * a.wm);
    var bands = e.phase === 1 ? [y] : [y, y + K.spacing > g.exitY - K.edge ? y - K.spacing : y + K.spacing];
    e.ticketSignal = { left: bands.length, clear: true };
    bands.forEach(function (at, i) {
      var t = P.Enemies.lane(s, g.xMin, at, 1, 0, g.xMax - g.xMin, K.width, a.W + i * K.stagger);
      t.owner = e.id; t.then = 'switchRails'; t.dmg = P.Enemies.dmgOf(s, e, K.dmg); t.life = K.sparkT; t.cause = 'ticketMan';
    });
  }

  B.attack = function (s, e, a, name, minimum) {
    if (name === 'ticketPunch') { punch(s, e, a, minimum); return true; }
    if (name === 'stationSignal') { signals(s, e, a, minimum); return true; }
    return false;
  };
  B.recover = function (s, e, a) {
    if (a.act === 'ticketPunch') { P.Bosses.exposeFor(s, e, C.punch.reset); return; }
    a.m = 'switchRecover'; a.t = Infinity;
  };
  B.railResolved = function (s, t, touchesHero) {
    var e = s.gen && s.gen.boss, q = e && e.ticketSignal;
    if (!q || e.dead || e.id !== t.owner) return;
    q.clear = q.clear && !touchesHero;
    if (--q.left > 0) return;
    if (q.clear) P.Bosses.exposeFor(s, e, C.punch.reset);
    else { e.ai.m = 'switchRecover'; e.ai.t = C.signals.reset; e.ai.cd = e.ai.t; }
    e.ticketSignal = null;
  };
  return B;
})();
