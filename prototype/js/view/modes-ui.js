// Replay tiers view (R1-T4 part 18): the HUD moon mark and the steady Nightmare vignette, and the results rows for
// Nightmare and Night Shift. View only: it reads the sim and the pending result and never writes to either.
// The vignette is a static gradient (no animation, so reduce-motion has nothing to stop) and is shown on Nightmare runs only.
P.ModesUI = {};
(function (V) {
  var last = null;
  function $(id) { return document.getElementById(id); }
  function t(k, v) { return P.t(k, v); }

  // Cached: the classes are written only when the run's mode changes (once per run, not per frame).
  V.hud = function (s) {
    var on = !!s && s.runMode === 'nightmare';
    if (on === last) return;
    last = on;
    var v = $('mode-vignette'), m = $('hud-moon');
    if (v) v.classList.toggle('is-on', on);
    if (m) {
      m.classList.toggle('hidden', !on);
      m.setAttribute('aria-label', on ? t('mode.hud') : '');
    }
  };

  function fmtTime(sec) {
    var s = Math.max(0, Math.floor(sec || 0)), m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  // Result rows, appended by screens.js through kv(parent, label, value). rw is the reward block.
  V.results = function (r, rw, kv) {
    var m = r.meta || {}, n = m.nightmare, q = m.nightshift;
    if (r.mode === 'nightmare' && n) {
      if (n.first) kv(rw, t('res.nm.cred'), t('res.nm.credV', { n: P.CFG.nightmare.cred }));
      if (n.moon) kv(rw, t('mode.moon'), t('res.nm.moonV'));
      if (n.title) kv(rw, t('res.nm.title'), t('mode.title'));
    }
    if (r.mode === 'nightshift' && q) {
      kv(rw, t('res.ns.score'), String(q.score));
      kv(rw, t('res.ns.time'), fmtTime(r.time));
      kv(rw, t('res.ns.today'), String(q.dayBest));
      kv(rw, t('res.ns.best'), String(q.best));
      kv(rw, t('res.ns.streak'), String(q.streak));
      if (q.first && q.pay) kv(rw, t('res.ns.pay'), t('res.ns.payV', { k: q.pay.coins }));
    }
  };
  V.fmtTime = fmtTime;
})(P.ModesUI);
