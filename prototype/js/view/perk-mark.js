// Signal Boost marker (R1-T5 int.3, view only). A solid ring and a down arrow over the terminal in s.pk.mark (hack.js).
// The shape is the cue, not colour alone. Nothing animates, so Reduce motion and the flash limit need no handling (design-system 7).
// Wraps P.EventsFx.drawGround, as enemies-fx-w1.js wraps P.EnemyFx.drawGround. Numbers: P.CFG.perks.C_mark.
P.PerkMark = (function () {
  var M = function () { return P.CFG.perks.C_mark; };

  function draw(R, s) {
    var m = s.pk && s.pk.mark, H = m && s.hacks.filter(function (x) { return x.id === m.id; })[0];
    if (!H || H.state === 'done') return;
    var c = R.ctx, V = M(), u = R.ppm, X = R.X(H.x), Y = R.Y(H.y), r = P.CFG.hack.r * V.ringMul * u, hw = V.arrowW * u / 2;
    c.strokeStyle = V.col + V.a + ')'; c.fillStyle = c.strokeStyle; c.lineWidth = V.lineW; c.setLineDash([]);
    c.beginPath(); c.arc(X, Y, r, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(X, Y - r); c.lineTo(X - hw, Y - r - V.arrowH * u); c.lineTo(X + hw, Y - r - V.arrowH * u);
    c.closePath(); c.fill();
  }

  var EV = P.EventsFx, prev = EV && EV.drawGround;
  if (prev) EV.drawGround = function (R, s) { prev(R, s); draw(R, s); };
  return { draw: draw };
})();
