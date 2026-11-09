// Environment prop kinds (lane A): gas canister and fire extinguisher, registered into P.Props so the level's block
// pass draws them like every other street block (render-world.js genProps). Generic objects only: no brands, no
// signs with real words. Contract as istanbul-props.js: fn(c, X, Y, s, o) with X, Y the footprint centre in px and
// s px per metre. Overlays (fuse glow, cracks, steam) live in view/env-fx.js.
(function () {
  var H = P.Props.h, INK = '#14151F', TAU = Math.PI * 2;

  // Gas canister: a squat pale tank with an orange collar and a hazard band (no lettering).
  P.Props.reg('gascan', function (c, X, Y, s) {
    var w = 0.62 * s, hg = 0.7 * s;
    H.shadow(c, X, Y + 0.12 * s, w * 0.6, w * 0.3);
    c.fillStyle = '#D9D4C7'; c.strokeStyle = INK; c.lineWidth = 1.5;
    c.beginPath(); c.rect(X - w / 2, Y - hg * 0.6, w, hg); c.fill(); c.stroke();
    H.ell(c, X, Y - hg * 0.6, w / 2, w * 0.22, '#F1EEE6', 1.5);
    c.fillStyle = '#E07B2A'; c.fillRect(X - w / 2, Y - hg * 0.2, w, 0.12 * s);
    c.fillStyle = '#E9A23B'; c.fillRect(X - w / 2, Y + hg * 0.1, w, 0.08 * s);
    H.ell(c, X, Y - hg * 0.6 - 0.12 * s, 0.14 * s, 0.07 * s, '#8A8F98', 1);
  });

  // Fire extinguisher cabinet: red box on a short plinth, white band and a nozzle cap.
  P.Props.reg('extinguisher', function (c, X, Y, s) {
    var w = 0.7 * s, hg = 0.9 * s;
    H.shadow(c, X, Y + 0.1 * s, w * 0.6, w * 0.3);
    H.box(c, X, Y, w, 0.5 * s, hg, '#D8483A', '#A93226');
    c.fillStyle = '#F4EBDD'; c.fillRect(X - w / 2 + 0.06 * s, Y - hg * 0.55, w - 0.12 * s, 0.1 * s);
    c.fillStyle = INK; c.beginPath(); c.arc(X, Y - hg * 0.85, 0.07 * s, 0, TAU); c.fill();
  });
})();
