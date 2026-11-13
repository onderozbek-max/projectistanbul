// Hint detectors (T4 part 10, view only): read the sim and report which interaction types are on screen now. They never write
// to the sim. Each type reports one anchor: a world point (x, y) inside the phone, or a HUD element id (hud) for the call strip
// and the dash chip. The first visible object of a type wins. ctx.inView(x, y) is supplied by hints.js.
P.HintsDetect = (function () {
  var D = {}, C = P.CFG.hints;

  // Live enemies within dashNearM of the hero: the dash hint waits for a crowd, since the dash button is always on screen.
  function crowdNear(s) {
    var h = s.hero, n = 0, i, e;
    for (i = 0; i < s.enemies.length; i++) {
      e = s.enemies[i];
      if (e.dead || e.state !== 'active') continue;
      if (Math.hypot(e.x - h.x, e.y - h.y) <= C.dashNearM + (e.r || 0)) n++;
    }
    return n;
  }

  // Returns { type: { type, x, y, hud } } for every type with something on screen now.
  D.scan = function (s, ctx) {
    var out = {}, objs;
    function see(type, x, y) { if (!out[type] && ctx.inView(x, y)) out[type] = { type: type, x: x, y: y, hud: null }; }
    s.drops.forEach(function (d) {
      if (d.kind === 'simit') see('heal', d.x, d.y);
      else if (d.kind === 'jeton') see('currency', d.x, d.y);
      else if (d.kind === 'chest') see('chest', d.x, d.y);
    });
    objs = P.Objectives && P.Objectives.items ? P.Objectives.items(s) : [];
    objs.forEach(function (it) { if (it.kind === 'crate' && !it.done) see('objective', it.x, it.y); });
    if (s.props && s.props.canisters) s.props.canisters.forEach(function (c) { if (c.alive) see('explosive', c.x, c.y); });
    if (s.env && s.env.recs) s.env.recs.forEach(function (r) {
      if (!r.alive) return;
      if (r.bomb || r.kind === 'gascan') see('explosive', r.x, r.y);
      else see('cover', r.x, r.y);
    });
    s.hacks.forEach(function (T) {
      if (T.state === 'done') return;
      see('link', T.x, T.y);
      if (T.rush > 0 || T.kind === 'tram') see('tram', T.x, T.y);
    });
    s.enemies.forEach(function (e) { if (e.door && !e.dead) see('door', e.x, e.y); });
    if (s.dir && s.dir.call && s.dir.call.active) out.call = { type: 'call', x: 0, y: 0, hud: C.callAnchor };
    if (s.hero.dashCd <= 0 && !(s.sk && s.sk.dash) && crowdNear(s) >= C.dashEnemies) out.dash = { type: 'dash', x: 0, y: 0, hud: C.dashAnchor };
    return out;
  };
  return D;
})();
