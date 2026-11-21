// View-only take-up and settlement. World translation and attack timing stay with the simulation.
P.HeroMotion = (function () {
  var H = {}, run, lastT = 0, x = 0, y = 0, gait = 0, gain = 0, heading = 0, turn = 0, deadAt = null;
  function angle(a, b) { return Math.atan2(Math.sin(b - a), Math.cos(b - a)); }
  H.apply = function (s, o) {
    var h = s.hero, K = P.CFG.experience.gait;
    if (run !== s) { run = s; lastT = s.t; x = h.x; y = h.y; gait = gain = turn = 0; deadAt = null; heading = Math.atan2(h.fy, h.fx); }
    var dt = Math.max(0, Math.min(.05, s.t - lastT)), distance = Math.hypot(h.x - x, h.y - y);
    lastT = s.t; x = h.x; y = h.y;
    if (distance < 1 && !h.dashing) gait += distance * 5;
    var moving = h.moving && !h.dashing;
    gain += ((moving ? 1 : 0) - gain) * Math.min(1, dt / (moving ? .10 : K.settleT));
    var desired = Math.atan2(h.fy, h.fx), difference = angle(heading, desired);
    heading += difference * Math.min(1, dt / K.turnT);
    turn += (difference - turn) * Math.min(1, dt / K.turnT);
    o.phase = h.dashing ? Math.PI * .15 : gait; o.gaitGain = gain; o.settling = !moving && gain > .025;
    o.motion = { start: moving ? 1 - gain : 0, turn: Math.max(-.13, Math.min(.13, turn * .08)), dash: !!h.dashing };
    if (h.moving && !o.attackStance) { o.back = Math.sin(heading) > .4; o.side = Math.abs(Math.cos(heading)) > .6; }
    if (h.hp <= 0) { if (deadAt === null) deadAt = performance.now(); o.defeat = Math.min(1, (performance.now() - deadAt) / 450); }
    else deadAt = null;
    var feedback = P.HealthFeedback && P.HealthFeedback.state();
    if(feedback&&feedback.hurt>0)o.motion.injury=feedback.hurt/P.CFG.experience.health.hitT;
  };
  return H;
})();
