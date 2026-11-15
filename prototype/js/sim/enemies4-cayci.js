// Cayci (çaycı, tea carrier). Walks with a tray and keeps about keep metres from the hero. Within range it winds up 0.7 s
// (a ground ring on the hero's spot, the telegraph), then throws a hot tea glob with the spitter's machinery (P.Enemies.lob,
// zone 'tea'). The glob lands as a slowing puddle (enemies4.js teaPuddle); it does no damage. Numbers: P.CFG.enemies5.cayci.
(function () {
  P.Cayci = {};

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  P.Cayci.think = function (s, e, dt) {
    var a = e.ai, C = P.CFG.enemies5.cayci, h = s.hero, d = dist(e, h), u, radial;
    a.cd = Math.max(0, a.cd - dt);
    if (a.m === 'windup') return windup(s, e, a, C, dt);
    if (a.cd <= 0 && d <= C.range && d >= C.minRange) return startWindup(s, e, a, C, h);
    u = P.Enemies.unit(h.x - e.x, h.y - e.y);
    radial = d > C.keep + C.band ? 1 : d < C.keep - C.band ? -1 : 0;
    e.dvx = u.x * radial * e.speed; e.dvy = u.y * radial * e.speed;
    return true;
  };

  // The ring marks where the glob will land (the hero's spot at the windup start): its radius is the puddle's radius.
  function startWindup(s, e, a, C, h) {
    a.m = 'windup'; a.t = 0; a.aimX = h.x; a.aimY = h.y;
    P.Enemies.ring(s, h.x, h.y, C.glob.r, C.windup + C.flight, null, 'danger');
    s.events.push({ type: 'teaWindup', id: e.id, x: e.x, y: e.y, T: C.windup });
    e.dvx = 0; e.dvy = 0;
    return true;
  }

  function windup(s, e, a, C, dt) {
    e.dvx = 0; e.dvy = 0; a.t += dt;
    e.windup = P.Enemies.clamp01(a.t / C.windup);
    if (a.t < C.windup) return true;
    e.windup = 0; a.m = 'walk'; a.cd = C.cd;
    P.Enemies.lob(s, e, a.aimX, a.aimY, C.glob, C.flight, 0, 'cayci');
    return true;
  }
})();
