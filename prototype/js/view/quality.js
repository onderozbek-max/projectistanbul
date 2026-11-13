// Adaptive quality (view only; T4 part 12). Tier 0 is the full look: the world canvas uses min(devicePixelRatio, view.maxDpr).
// Tier 1 and tier 2 trade pixels, particles and glows for frame time. P.Quality.tier is read by the view only: the sim never
// reads it (architecture 4.17; tools/test-quality.js and test-env.js check this).
// Governor: the frame time is an EMA (view.quality.emaS seconds) of the interval between rendered live frames (performance.now
// deltas, measured in main.js). It steps down a tier after the EMA stays above view.quality.downMs for downHoldS, and steps back
// up only after the EMA stays below upMs for upHoldS. Each step restarts the measurement, so one slow stretch cannot step twice.
// Debug flags: ?quality=0|1|2 locks the tier (no governor); ?fps=1 shows a small FPS / ms readout on the phone.
P.Quality = (function () {
  var Q = {}, MAXT = 2, TIER_DPR = [Infinity, 1.5, 1.25], STEP_LOG = 12;
  var tier = 0, locked = false, ema = null, hiT = 0, loT = 0, lastDt = 0, onChange = null, hud = null, hudT = 0, hudText = '';
  var steps = [];
  function cfg() { return P.CFG.view.quality; }
  Q.MAX = MAXT;
  Q.tier = 0;
  Q.locked = function () { return locked; };
  // Device-pixel cap for a tier (tier 0 is view.maxDpr alone). Used by R.resize in render.js.
  Q.dprCap = function (t) { return Math.min(P.CFG.view.maxDpr || 2, TIER_DPR[t === undefined ? tier : t]); };
  // Particle and gib divisor: render.js draws every k-th optional particle when k > 1 (tier 1: 1 in 2, tier 2: 1 in 3).
  Q.partStep = function () { return tier + 1; };
  // Glow gradients (window glows, lamp pools, fog) run at tier 0 only, except lamp pools which run at every tier.
  Q.glows = function () { return tier === 0; };
  Q.fog = function () { return tier < 2; };
  Q.ambientOcclusion = function () { return tier < 2; };
  Q.set = function (t) {
    t = Math.max(0, Math.min(MAXT, t | 0));
    if (t === tier) return false;
    steps.push({ to: t, ema: ema === null ? null : Math.round(ema * 10) / 10 });
    if (steps.length > STEP_LOG) steps.shift();
    tier = Q.tier = t;
    ema = null; hiT = 0; loT = 0;
    if (onChange) onChange(t);
    return true;
  };
  Q.lock = function (t) { locked = true; return Q.set(t); };
  Q.unlock = function () { locked = false; };
  Q.onChange = function (fn) { onChange = fn; };
  Q.steps = function () { return steps.slice(); };
  Q.ema = function () { return ema; };
  // Called once per rendered live frame with the interval since the previous one (ms). live = the sim runs this frame.
  Q.feed = function (dtMs, live) {
    if (!live || !(dtMs > 0) || dtMs > 250) { ema = null; hiT = 0; loT = 0; lastDt = 0; return tier; }   // paused, hidden or a long stall: start over
    lastDt = dtMs;
    var c = cfg(), a = 1 - Math.exp(-(dtMs / 1000) / c.emaS);
    ema = ema === null ? dtMs : ema + (dtMs - ema) * a;
    if (locked) return tier;
    if (ema > c.downMs) { hiT += dtMs; loT = 0; if (hiT >= c.downHoldS * 1000 && tier < MAXT) Q.set(tier + 1); }
    else if (ema < c.upMs) { loT += dtMs; hiT = 0; if (loT >= c.upHoldS * 1000 && tier > 0) Q.set(tier - 1); }
    else { hiT = 0; loT = 0; }
    return tier;
  };
  // Debug readout (?fps=1): a small box on the phone, updated twice a second, text written only when it changes.
  Q.showFps = function (host) {
    if (!host || hud) return;
    hud = host.ownerDocument.createElement('div');
    hud.id = 'fps-hud'; hud.setAttribute('aria-hidden', 'true');
    hud.style.cssText = 'position:absolute;left:6px;bottom:6px;z-index:99;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,0.55);' +
      'color:#7CF08E;font:600 calc(11px * var(--ui-text, 1))/1.3 ui-monospace,Menlo,monospace;pointer-events:none;white-space:nowrap';
    host.appendChild(hud);
  };
  Q.debugText = function (nowMs, canvas, dpr) {
    if (!hud || nowMs - hudT < 500) return;
    hudT = nowMs;
    var fps = lastDt > 0 ? Math.round(1000 / lastDt) : 0, ms = lastDt > 0 ? lastDt.toFixed(1) : '-', txt = fps + ' fps  ' +
      (ema === null ? '-' : ema.toFixed(1)) + ' ms ema  t' + tier + (locked ? ' (locked)' : '') + '  dpr ' + (+dpr || 1).toFixed(2) +
      '  ' + (canvas ? canvas.width + 'x' + canvas.height : '');
    if (txt !== hudText) { hudText = txt; hud.textContent = txt; }
    return ms;
  };
  // ?quality=N and ?fps=1 are read once, when the script loads (the phone is built after the scripts run).
  var qs = (typeof location !== 'undefined' && location.search) ? new URLSearchParams(location.search) : null;
  if (qs && qs.get('quality') !== null) Q.lock(parseInt(qs.get('quality'), 10) || 0);
  Q.debugFps = !!(qs && qs.get('fps') === '1');
  return Q;
})();
