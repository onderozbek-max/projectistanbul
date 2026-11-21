// Consumables and pickups (T4 part 10, view only): one visual grammar for everything the hero picks up or uses.
//   heal      green + white cross   simit drop (+25 HP); the eczane station (one use, sim/eczane.js) uses the same cross; the
//                                    kiosk station (bufe, R1-T4 part 17) keeps the green heal ring with an awning and tea glass icon
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
  var KIND = { simit: 'heal', chest: 'power', jeton: 'currency', eczane: 'heal', bufe: 'heal' };   // sim pickup kinds (combat.js updateDrops; sim/eczane.js)
  var OBJ = { crate: 'objective' };                                    // sim objective item kinds (objectives-kinds.js)
  var bursts = [], floats = [], lastSim = null;

  M.CLASS = CLASS;
  M.handles = function (kind) { return !!KIND[kind]; };                // main.js skips its generic pickup click for these
  M.classOf = function (kind) { return KIND[kind] || null; };
  M.pickupCue = function (kind) { return KIND[kind] ? CLASS[KIND[kind]].cue : (kind === 'xp' ? 'tink' : 'click'); };
  function reduceMotion() { return !!(P.Settings && P.Settings.reduceMotion); }
  function reduceFlash() { return !!(P.Settings && P.Settings.reduceFlash); }
  function fillOf(cls) { return cls === CLASS.heal && P.SemanticColors ? P.SemanticColors.heal : cls.fill; }
  function rgbOf(cls) { return cls === CLASS.heal && P.SemanticColors ? P.SemanticColors.healRGB : cls.rgb; }
  function play(name) { if (P.Sfx) P.Sfx.play(name, 30); }

  M.reset = function (s) { bursts.length = 0; floats.length = 0; lastSim = s || null; };
  function sync(s) { if (s !== lastSim) M.reset(s); }
  function burst(s, cls, x, y) { bursts.push({ cls: cls, x: x, y: y, t0: s.runT || 0, T: C.burstT }); }
  function float(s, cls, text, x, y) { floats.push({ cls: cls, text: text, x: x, y: y, t0: s.runT || 0, T: C.floatT }); }

  // The amount on a heal pickup, from the sim's event (R1-T4 part 14): +N HP for the HP actually restored (grit bonus included),
  // CAP only when the run's drop-heal budget stopped it (never for an uncapped pickup), else FULL at full HP.
  function healText(ev) {
    if (ev.healed > 0) return P.t('consume.heal', { n: Math.round(ev.healed) });
    if (ev.capped && !ev.uncapped) return P.t('consume.cap');
    return P.t('consume.full');
  }

  // The look of an eczane station, read from the sim (P.Eczane.state): 'usable', 'empty', or null for any other block.
  // Called from render-world.js when it draws a block; the view never writes to the sim.
  M.stationState = function (s, b) { return P.Eczane && P.Eczane.state ? P.Eczane.state(s, b) : null; };

  // Sim events in (main.js handleEvents). Pickups are magnetised to the hero, so the burst and text start at him.
  M.onEvent = function (ev, s) {
    if (!s || !s.hero) return;
    sync(s);
    var h = s.hero, cls;
    if (ev.type === 'pickup' && KIND[ev.kind]) {
      cls = CLASS[KIND[ev.kind]];
      if (cls !== CLASS.heal || ev.healed > 0) { play(cls.cue); burst(s, cls, h.x, h.y); }
      float(s, cls, cls === CLASS.heal ? healText(ev) : ev.kind === 'chest' ? P.t('consume.chest') : '+' + ev.value, h.x, h.y + 0.9);
    } else if (ev.type === 'objPickup') {
      cls = CLASS.objective;
      play(cls.cue);
      burst(s, cls, h.x, h.y);
    }
  };

  // World overlay (render.js, after the hero). Reads the sim only.
  M.drawOver = function (R, s) {
    if (P.SceneFlow && P.SceneFlow.current() && P.SceneFlow.current().kind !== 'entry') return;
    if (!s || !s.drops) return;
    sync(s);
    var c = R.ctx, t = s.runT || 0, motion = !reduceMotion(), u = R.ppm, items;
    var coins = s.drops.reduce(function (n, d) { return n + (d.kind === 'jeton' ? 1 : 0); }, 0);
    s.drops.forEach(function (d, i) { var k = KIND[d.kind]; if (!k) return;
      if (k === 'currency' && coins > 12 && Math.hypot(s.hero.x - d.x, s.hero.y - d.y) > 2.3) {
        P.ConsumablesIcons.draw(c, 'coin', R.X(d.x), R.Y(d.y), Math.max(5, .16 * u), '#FFD166', INK);
      } else drawDrop(c, R, s, CLASS[k], d, i, t, motion); });
    items = P.Objectives && P.Objectives.items ? P.Objectives.items(s) : [];
    items.forEach(function (it, i) { if (OBJ[it.kind] && !it.done) drawAt(c, CLASS[OBJ[it.kind]], R.X(it.x), R.Y(it.y), i + 7, t, motion, u, it.kind); });
    drawBursts(c, R, t, motion);
    drawFloats(c, R, t, motion);
  };

  M.healState = function (s, d) {
    if (!d.uncapped && !P.Combat.dropHealRoom(s)) return 'spent';
    return s.hero.hp >= s.hero.maxHp ? 'saved' : 'ready';
  };

  function drawDrop(c, R, s, cls, d, i, t, motion) {
    var u = R.ppm, X = R.X(d.x), Y = R.Y(d.y), lift = 0, pk = P.CFG.feel2.pickup, h = s.hero, hd, tx, ty;
    if(d.origin && d.pop>0){var flown=1-Math.min(1,d.pop/P.CFG.ev.dropPop);X=R.X(d.origin.x+(d.x-d.origin.x)*flown);Y=R.Y(d.origin.y+(d.y-d.origin.y)*flown);}
    if (d.pop > 0 && d.pop <= pk.popT && motion) {   // the sim holds a fresh drop for `pop` s: it arcs out on a small shadow
      lift = Math.sin(Math.PI * (1 - d.pop / pk.popT)) * pk.lift;
      c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.ellipse(X, Y, 0.14 * u, 0.06 * u, 0, 0, TAU); c.fill();
    }
    if (d.mag && motion) {                           // flying to the hero: a short streak behind it
      hd = Math.hypot(h.x - d.x, h.y - d.y) || 1;
      tx = R.X(d.x - (h.x - d.x) / hd * C.trailM); ty = R.Y(d.y - (h.y - d.y) / hd * C.trailM);
      c.strokeStyle = 'rgba(' + rgbOf(cls) + ',0.5)'; c.lineWidth = 0.12 * u; c.lineCap = 'round';
      c.beginPath(); c.moveTo(tx, ty); c.lineTo(X, Y - lift * u); c.stroke();
    }
    var state = d.kind === 'simit' ? M.healState(s, d) : 'ready';
    if (state === 'ready') { drawAt(c, cls, X, Y - lift * u, i, t, motion, u, d.kind); return; }
    c.save(); c.globalAlpha *= state === 'spent' ? .35 : .76;
    Y -= lift * u;
    var size = Math.max(9, C.iconM * u);
    if (!P.ArtRasterItems || !P.ArtRasterItems.pickup(c, d.kind, X, Y, 2 * size)) {
      P.ConsumablesIcons.draw(c, 'cross', X, Y, size, '#D9DBCF', INK);
    }
    c.restore();
  }

  // One consumable: glow disc, ink-edged ring, icon. Radius never below consumables.minRPx (28 px across).
  function drawAt(c, cls, X, Y, i, t, motion, u, kind) {
    if (kind === 'chest') { M.chest(c, X, Y, u, t, false); return; }
    var r = Math.max(C.minRPx, C.glowM * u), ic = Math.max(C.iconMinPx, C.iconM * u), bob = motion ? Math.sin(TAU * C.bobHz * t + i) * C.bobM * u : 0;
    var pulse = motion && !reduceFlash() ? 1 + C.pulseAmp * Math.sin(TAU * C.pulseHz * t + i) : 1, g, rgb = rgbOf(cls);
    g = c.createRadialGradient(X, Y, 0, X, Y, r);
    g.addColorStop(0, 'rgba(' + rgb + ',' + (0.5 * pulse).toFixed(3) + ')');
    g.addColorStop(0.65, 'rgba(' + rgb + ',0.2)');
    g.addColorStop(1, 'rgba(' + rgb + ',0)');
    c.fillStyle = g; c.beginPath(); c.arc(X, Y, r, 0, TAU); c.fill();
    c.beginPath(); c.arc(X, Y, r * 0.9, 0, TAU); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.arc(X, Y, r * 0.9, 0, TAU); c.lineWidth = 2; c.strokeStyle = 'rgba(' + rgb + ',0.95)'; c.stroke();
    if (kind && P.ArtRasterItems && P.ArtRasterItems.pickup(c, kind, X, Y + bob, 2 * ic)) return;
    P.ConsumablesIcons.draw(c, cls.icon, X, Y + bob, ic, fillOf(cls), INK);
  }

  // Gold beacon against a dark pavement marker. The chest keeps the same silhouette when it opens.
  M.chest = function (c, X, Y, u, t, guarded) {
    var s = Math.max(24, 0.84 * u), lift = !guarded && !reduceMotion() && !reduceFlash()
      ? s * 0.16 * (1 + Math.sin(TAU * 0.85 * t)) : 0;
    c.save();
    c.fillStyle = 'rgba(20,21,31,.78)'; c.strokeStyle = guarded ? '#AFB4BD' : '#FFD166'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(X, Y, s * 0.94, s * 0.46, 0, 0, TAU); c.fill(); c.stroke();
    if (!guarded) {
      var g = c.createLinearGradient(0, Y - 2.5 * s, 0, Y);
      g.addColorStop(0, 'rgba(255,209,102,0)'); g.addColorStop(1, 'rgba(255,209,102,0.45)');
      c.fillStyle = g; c.beginPath(); c.moveTo(X - 0.41 * s, Y - 2.5 * s);
      c.lineTo(X + 0.41 * s, Y - 2.5 * s); c.lineTo(X + 0.68 * s, Y); c.lineTo(X - 0.68 * s, Y); c.closePath(); c.fill();
    }
    P.Screens.chestShape(c, X, Y - lift, s, 0, guarded ? 'guarded' : 'ready');
    if (!guarded) {
      var py = Y - lift - 1.58 * s, a = 0.17 * s;
      c.fillStyle = '#FFF0B1'; c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath();
      c.moveTo(X, py - a); c.lineTo(X + a, py); c.lineTo(X, py + a); c.lineTo(X - a, py); c.closePath(); c.fill(); c.stroke();
    }
    c.restore();
  };

  function drawBursts(c, R, t, motion) {
    var u = R.ppm, i, b, a, k, rad;
    for (i = bursts.length - 1; i >= 0; i--) {
      b = bursts[i]; a = t - b.t0;
      if (a < 0) continue;
      if (a > b.T) { bursts.splice(i, 1); continue; }
      k = a / b.T;
      rad = (motion ? C.burstR0M + (C.burstR1M - C.burstR0M) * k : C.burstR0M) * u;   // Reduce motion: the ring fades in place
      c.beginPath(); c.arc(R.X(b.x), R.Y(b.y), rad, 0, TAU);
      c.lineWidth = 3; c.strokeStyle = 'rgba(' + rgbOf(b.cls) + ',' + (0.9 * (1 - k)).toFixed(3) + ')'; c.stroke();
    }
  }

  // Floating amount: the damage-number style (italic 900, night-ink outline) with the class icon beside it.
  function drawFloats(c, R, t, motion) {
    var i, f, a, k, alpha, X, Y, w, x0;
    c.font = 'italic 900 ' + C.floatPx + 'px "CM Bangers", Bangers, Impact, sans-serif';
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
      P.ConsumablesIcons.draw(c, f.cls.icon, x0 + 7, Y, 7, fillOf(f.cls), INK);
      c.strokeText(f.text, x0 + 16, Y); c.fillStyle = '#FFFFFF'; c.fillText(f.text, x0 + 16, Y);
    }
    c.globalAlpha = 1;
  }

  // The sign of a heal station: a cream plate with a green icon. The eczane (pharmacy) uses the green cross; the kiosk (bufe)
  // passes its awning and tea-glass icon. usable = pulsing green glow at C.stationPulseHz (0.5 Hz or less); empty = grey icon and
  // the short EMPTY label; idle = steady green. Reduce motion or Reduce flashing: steady.
  M.stationSign = function (c, X, Y, s, state, t, motion, icon) {
    var w = s * 0.9, h = s * 0.66, usable = state === 'usable', empty = state === 'empty', fill = usable ? fillOf(CLASS.heal) : empty ? '#8A8F86' : '#3FA06A', g;
    if (usable) {
      var pulse = motion && !reduceFlash() ? 1 + C.pulseAmp * Math.sin(TAU * C.stationPulseHz * t) : 1;
      g = c.createRadialGradient(X, Y, 0, X, Y, w * 0.9);
      var rgb = rgbOf(CLASS.heal);
      g.addColorStop(0, 'rgba(' + rgb + ',' + (0.5 * pulse).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
      c.fillStyle = g; c.beginPath(); c.arc(X, Y, w * 0.9, 0, TAU); c.fill();
    }
    c.fillStyle = '#FFF4DF'; c.fillRect(X - w / 2, Y - h / 2, w, h);
    c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(X - w / 2, Y - h / 2, w, h);
    P.ConsumablesIcons.draw(c, icon || 'cross', X, Y, h * 0.36, fill, INK);
    if (empty) {
      c.font = '800 ' + Math.round(s * 0.3) + 'px "CM Bangers", Bangers, Impact, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 3; c.strokeStyle = INK;
      c.strokeText(P.t('consume.empty'), X, Y + h / 2 + s * 0.22); c.fillStyle = '#FFF4DF'; c.fillText(P.t('consume.empty'), X, Y + h / 2 + s * 0.22);
    }
  };
  return M;
})();
