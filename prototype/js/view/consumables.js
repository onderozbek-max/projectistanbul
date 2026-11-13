// Consumables and pickups (T4 part 10, view only): one visual grammar for everything the hero picks up or uses.
//   heal      green + white cross   simit drop (+25 HP); the eczane station uses the same cross
//   power     gold + star           mini chest (Kutu): an upgrade
//   currency  amber + coin          jeton
//   objective blue + map pin        collect items of an objective (the crate)
// Colour and silhouette differ for every class (colour-blind safe). Each has a soft glow ring, a bobbing icon (none under
// Reduce motion), a use burst, a floating amount in the damage-number style and a sound cue (P.Sfx names heal, star, coin, pick).
// XP gems keep their green diamond (design-system 3.2) and are outside this grammar. Pickups are drawn in an overlay pass
// after the actors (render.js), so an enemy never hides one. The sim never reads anything here.
P.Consumables = (function () {
  var M = {}, C = P.CFG.consumables, TAU = Math.PI * 2, INK = '#14151F';
  var CLASS = {
    heal: { cue: 'heal', rgb: '46,189,107', fill: '#2EBD6B', icon: 'cross' },
    power: { cue: 'star', rgb: '255,209,102', fill: '#FFD166', icon: 'star' },
    currency: { cue: 'coin', rgb: '233,162,59', fill: '#E9A23B', icon: 'coin' },
    objective: { cue: 'pick', rgb: '61,139,255', fill: '#3D8BFF', icon: 'pin' }
  };
  var KIND = { simit: 'heal', chest: 'power', jeton: 'currency' };   // sim drop kinds (combat.js updateDrops)
  var OBJ = { crate: 'objective' };                                    // sim objective item kinds (objectives-kinds.js)
  var bursts = [], floats = [], lastSim = null;

  M.CLASS = CLASS;
  M.handles = function (kind) { return !!KIND[kind]; };                // main.js skips its generic pickup click for these
  M.classOf = function (kind) { return KIND[kind] || null; };
  M.pickupCue = function (kind) { return KIND[kind] ? CLASS[KIND[kind]].cue : (kind === 'xp' ? 'tink' : 'click'); };
  function reduceMotion() { return !!(P.Settings && P.Settings.reduceMotion); }
  function reduceFlash() { return !!(P.Settings && P.Settings.reduceFlash); }
  function play(name) { if (P.Sfx) P.Sfx.play(name, 30); }

  M.reset = function (s) { bursts.length = 0; floats.length = 0; lastSim = s || null; };
  function sync(s) { if (s !== lastSim) M.reset(s); }
  function burst(s, cls, x, y) { bursts.push({ cls: cls, x: x, y: y, t0: s.runT || 0, T: C.burstT }); }
  function float(s, cls, text, x, y) { floats.push({ cls: cls, text: text, x: x, y: y, t0: s.runT || 0, T: C.floatT }); }

  // The amount on a heal pickup: FULL at full HP, CAP when the run's drop-heal budget (drops.healCap) is spent, else +N HP.
  function healText(s, amount) {
    var h = s.hero, D = P.CFG.drops, capped = s.levelIndex >= P.CFG.levels.rampFrom && (s.dropHealed || 0) >= D.healCap;
    if (h.hp >= h.maxHp) return P.t('consume.full');
    if (capped) return P.t('consume.cap');
    return P.t('consume.heal', { n: amount });
  }

  // Sim events in (main.js handleEvents). Pickups are magnetised to the hero, so the burst and text start at him.
  M.onEvent = function (ev, s) {
    if (!s || !s.hero) return;
    sync(s);
    var h = s.hero, cls;
    if (ev.type === 'pickup' && KIND[ev.kind]) {
      cls = CLASS[KIND[ev.kind]];
      play(cls.cue);
      burst(s, cls, h.x, h.y);
      float(s, cls, ev.kind === 'simit' ? healText(s, ev.value) : ev.kind === 'chest' ? P.t('consume.chest') : '+' + ev.value, h.x, h.y + 0.9);
    } else if (ev.type === 'objPickup') {
      cls = CLASS.objective;
      play(cls.cue);
      burst(s, cls, h.x, h.y);
    }
  };

  // World overlay (render.js, after the hero). Reads the sim only.
  M.drawOver = function (R, s) {
    if (!s || !s.drops) return;
    sync(s);
    var c = R.ctx, t = s.runT || 0, motion = !reduceMotion(), u = R.ppm, items;
    s.drops.forEach(function (d, i) { var k = KIND[d.kind]; if (k) drawDrop(c, R, s, CLASS[k], d, i, t, motion); });
    items = P.Objectives && P.Objectives.items ? P.Objectives.items(s) : [];
    items.forEach(function (it, i) { if (OBJ[it.kind] && !it.done) drawAt(c, CLASS[OBJ[it.kind]], R.X(it.x), R.Y(it.y), i + 7, t, motion, u); });
    drawBursts(c, R, t, motion);
    drawFloats(c, R, t, motion);
  };

  function drawDrop(c, R, s, cls, d, i, t, motion) {
    var u = R.ppm, X = R.X(d.x), Y = R.Y(d.y), lift = 0, pk = P.CFG.feel2.pickup, h = s.hero, hd, tx, ty;
    if (d.pop > 0 && d.pop <= pk.popT && motion) {   // the sim holds a fresh drop for `pop` s: it arcs out on a small shadow
      lift = Math.sin(Math.PI * (1 - d.pop / pk.popT)) * pk.lift;
      c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.ellipse(X, Y, 0.14 * u, 0.06 * u, 0, 0, TAU); c.fill();
    }
    if (d.mag && motion) {                           // flying to the hero: a short streak behind it
      hd = Math.hypot(h.x - d.x, h.y - d.y) || 1;
      tx = R.X(d.x - (h.x - d.x) / hd * C.trailM); ty = R.Y(d.y - (h.y - d.y) / hd * C.trailM);
      c.strokeStyle = 'rgba(' + cls.rgb + ',0.5)'; c.lineWidth = 0.12 * u; c.lineCap = 'round';
      c.beginPath(); c.moveTo(tx, ty); c.lineTo(X, Y - lift * u); c.stroke();
    }
    drawAt(c, cls, X, Y - lift * u, i, t, motion, u);
  }

  // One consumable: glow disc, ink-edged ring, icon. Radius never below consumables.minRPx (28 px across).
  function drawAt(c, cls, X, Y, i, t, motion, u) {
    var r = Math.max(C.minRPx, C.glowM * u), ic = Math.max(C.iconMinPx, C.iconM * u), bob = motion ? Math.sin(TAU * C.bobHz * t + i) * C.bobM * u : 0;
    var pulse = motion && !reduceFlash() ? 1 + C.pulseAmp * Math.sin(TAU * C.pulseHz * t + i) : 1, g;
    g = c.createRadialGradient(X, Y, 0, X, Y, r);
    g.addColorStop(0, 'rgba(' + cls.rgb + ',' + (0.5 * pulse).toFixed(3) + ')');
    g.addColorStop(0.65, 'rgba(' + cls.rgb + ',0.2)');
    g.addColorStop(1, 'rgba(' + cls.rgb + ',0)');
    c.fillStyle = g; c.beginPath(); c.arc(X, Y, r, 0, TAU); c.fill();
    c.beginPath(); c.arc(X, Y, r * 0.9, 0, TAU); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.arc(X, Y, r * 0.9, 0, TAU); c.lineWidth = 2; c.strokeStyle = 'rgba(' + cls.rgb + ',0.95)'; c.stroke();
    P.ConsumablesIcons.draw(c, cls.icon, X, Y + bob, ic, cls.fill, INK);
  }

  function drawBursts(c, R, t, motion) {
    var u = R.ppm, i, b, a, k, rad;
    for (i = bursts.length - 1; i >= 0; i--) {
      b = bursts[i]; a = t - b.t0;
      if (a < 0) continue;
      if (a > b.T) { bursts.splice(i, 1); continue; }
      k = a / b.T;
      rad = (motion ? C.burstR0M + (C.burstR1M - C.burstR0M) * k : C.burstR0M) * u;   // Reduce motion: the ring fades in place
      c.beginPath(); c.arc(R.X(b.x), R.Y(b.y), rad, 0, TAU);
      c.lineWidth = 3; c.strokeStyle = 'rgba(' + b.cls.rgb + ',' + (0.9 * (1 - k)).toFixed(3) + ')'; c.stroke();
    }
  }

  // Floating amount: the damage-number style (italic 900, night-ink outline) with the class icon beside it.
  function drawFloats(c, R, t, motion) {
    var i, f, a, k, alpha, X, Y, w, x0;
    c.font = 'italic 900 ' + C.floatPx + 'px "Avenir Next Condensed", "Arial Narrow", system-ui';
    c.textAlign = 'left'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = INK;
    for (i = floats.length - 1; i >= 0; i--) {
      f = floats[i]; a = t - f.t0;
      if (a < 0) continue;
      if (a > f.T) { floats.splice(i, 1); continue; }
      k = a / f.T;
      alpha = k < 0.15 ? k / 0.15 : k < 0.6 ? 1 : (1 - k) / 0.4;
      X = R.X(f.x); Y = R.Y(f.y) - (motion ? C.floatRisePx * k : 0);
      w = c.measureText(f.text).width; x0 = X - (w + 16) / 2;
      c.globalAlpha = alpha;
      P.ConsumablesIcons.draw(c, f.cls.icon, x0 + 7, Y, 7, f.cls.fill, INK);
      c.strokeText(f.text, x0 + 16, Y); c.fillStyle = '#FFFFFF'; c.fillText(f.text, x0 + 16, Y);
    }
    c.globalAlpha = 1;
  }

  // The sign of the eczane (pharmacy) heal station: a cream plate with a green cross. usable = pulsing green glow;
  // empty = grey cross and the short EMPTY label; idle = steady green. Reduce motion or Reduce flashing: steady.
  M.stationSign = function (c, X, Y, s, state, t, motion) {
    var w = s * 0.9, h = s * 0.66, usable = state === 'usable', empty = state === 'empty', fill = usable ? '#2EBD6B' : empty ? '#8A8F86' : '#3FA06A', g;
    if (usable) {
      var pulse = motion && !reduceFlash() ? 1 + C.pulseAmp * Math.sin(TAU * C.pulseHz * t) : 1;
      g = c.createRadialGradient(X, Y, 0, X, Y, w * 0.9);
      g.addColorStop(0, 'rgba(46,189,107,' + (0.5 * pulse).toFixed(3) + ')'); g.addColorStop(1, 'rgba(46,189,107,0)');
      c.fillStyle = g; c.beginPath(); c.arc(X, Y, w * 0.9, 0, TAU); c.fill();
    }
    c.fillStyle = '#FFF4DF'; c.fillRect(X - w / 2, Y - h / 2, w, h);
    c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(X - w / 2, Y - h / 2, w, h);
    P.ConsumablesIcons.draw(c, 'cross', X, Y, h * 0.36, fill, INK);
    if (empty) {
      c.font = '800 ' + Math.round(s * 0.3) + 'px "Avenir Next Condensed", "Arial Narrow", system-ui';
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = INK;
      c.strokeText(P.t('consume.empty'), X, Y + h / 2 + s * 0.22); c.fillStyle = '#FFF4DF'; c.fillText(P.t('consume.empty'), X, Y + h / 2 + s * 0.22);
    }
  };
  return M;
})();
