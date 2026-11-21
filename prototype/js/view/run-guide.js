// Source of truth for navigational cues in the run view.
P.RunGuide = (function () {
  var G = {};

  G.shutter = function () {
    var shutter = P.CFG.level.shutter;
    return { x: (shutter.xMin + shutter.xMax) / 2, y: (shutter.yMin + shutter.yMax) / 2, key: 'route.sideExit' };
  };

  G.destination = function (s) {
    if (s.mode !== 'play') return null;
    var L = P.CFG.level;
    if (s.levelIndex === 1 && s.props.shutterOpen) return G.shutter();
    if (s.levelIndex === 1 && s.props.doorOpen && s.hero.y < 0) {
      return { x: (L.door.xMin + L.door.xMax) / 2, y: .12, key: 'route.leave' };
    }
    return null;
  };

  G.required = function (s) {
    if (!s.milestone || !P.MilestoneFx || !P.MilestoneFx.markers) return null;
    var mark = P.MilestoneFx.markers(s, [])[0];
    return mark && mark.required ? mark : null;
  };

  G.prompt = function (s) {
    var prompt = s.dir.tut.active;
    if (s.mode !== 'play' || !prompt || prompt.id === 't_card' || prompt.id === 'exit') return null;
    if (prompt.id === 't_hold' && (!s.dir.hold.active || s.dir.trialBoss || s.props.shutterOpen)) return null;
    if (prompt.id === 't_hack') {
      // A generic hint points to its actual terminal while the player is using it.
      // The required route already explains its own controls and has priority.
      if (G.required(s) || !prompt.target || prompt.target.state !== 'active') return null;
      if (s.hacks.indexOf(prompt.target) === -1 || Math.hypot(s.hero.x - prompt.target.x, s.hero.y - prompt.target.y) > prompt.target.r) return null;
    }
    if ((G.destination(s) && (prompt.id !== 't_move' || s.hero.y >= 0)) || (G.required(s) && prompt.target)) return null;
    return prompt;
  };

  G.mark = function (R, s) {
    if (P.SceneFlow && P.SceneFlow.running(s)) return;
    var goal = G.destination(s);
    if (!goal) return;
    var sp = R.toScreen(goal.x, goal.y), hero = R.toScreen(s.hero.x, s.hero.y);
    var x = Math.min(R.W - 20, Math.max(20, sp.x)), y = Math.min(R.H - 96, Math.max(180, sp.y));
    var dx = sp.x - hero.x, dy = sp.y - hero.y, c = R.ctx;
    c.save(); c.setTransform(R.dpr || 1, 0, 0, R.dpr || 1, 0, 0);
    c.translate(x, y);
    c.beginPath(); c.roundRect(-16, -16, 32, 32, 7);
    c.fillStyle = '#202B24'; c.fill(); c.strokeStyle = '#FFD166'; c.lineWidth = 2.5; c.stroke();
    if (Math.hypot(dx, dy) < 2) { dx = 0; dy = -1; }
    c.rotate(Math.atan2(dy, dx));
    c.beginPath(); c.moveTo(-7, 0); c.lineTo(6, 0); c.moveTo(0, -6); c.lineTo(6, 0); c.lineTo(0, 6);
    c.lineWidth = 3; c.lineCap = 'round'; c.stroke();
    c.restore();
  };

  return G;
})();
