// Death beat zoom (T4 part 4; design-system.md 7; AUDIT-6 F4). View only. main.js freezes the run and adds #phone.dying, and
// css/proto.css desaturates the world over --m-beat. This adds the zoom: the world eases in 5% on the hero for --m-beat, around
// the hero's screen point. It reads the sim and the camera and writes two CSS variables on the game canvas. It never changes time
// or the sim, and under Reduce motion it writes nothing (css/proto.css and css/motion.css keep the zoom still).
P.DeathBeat = (function () {
  var D = {};
  D.focus = function (sim) {
    var game = document.getElementById('game'), R = P.Render;
    if (!game || !R || !R.toScreen || !sim || !sim.hero || (P.Settings && P.Settings.reduceMotion)) return;
    var a = R.toScreen(sim.hero.x, sim.hero.y);
    game.style.setProperty('--death-x', (100 * a.x / R.W).toFixed(1) + '%');
    game.style.setProperty('--death-y', (100 * a.y / R.H).toFixed(1) + '%');
  };
  return D;
})();
