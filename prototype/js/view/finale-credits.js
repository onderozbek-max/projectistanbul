// "Bölüm 1 tamam" / "Chapter 1 complete" card (view). Shown after the arrival comic (story/finale.js). A full-height
// overlay in #phone with the chapter title, the run's stats and a short tease of Chapter 2. Styles are injected once, so
// no stylesheet changes are needed. P.FinaleCredits.show(stats, onDone): stats = {km, levels, hoods, kills, bosses,
// runKills, runTime (seconds)}. onDone runs once, when the player taps Continue.
P.FinaleCredits = (function () {
  var CR = {}, STYLE_ID = 'fin-credits-css', INK = '#14151F', PAPER = '#F4EBDD', GOLD = '#FFD166';

  function css() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style'); s.id = STYLE_ID;
    s.textContent = [
      '.fin-cr{position:absolute;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;',
      'padding:28px 22px;box-sizing:border-box;background:radial-gradient(120% 70% at 50% 25%,#2C3A5E 0%,#14151F 70%);color:' + PAPER + ';',
      'font-family:system-ui,sans-serif;text-align:center}',
      '.fin-cr .k{font-size:13px;letter-spacing:.18em;color:' + GOLD + ';font-weight:800}',
      '.fin-cr .t{font-family:"CM Bangers",Bangers,Impact,"Arial Black",sans-serif;font-size:58px;line-height:1;margin:22px 0 6px;',
      'text-shadow:3px 3px 0 ' + INK + ',-1px -1px 0 ' + INK + ';transform:rotate(-2deg)}',
      '.fin-cr .r{font-size:13px;opacity:.8;margin-bottom:22px}',
      '.fin-cr .g{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:340px}',
      '.fin-cr .c{background:rgba(244,235,221,.08);border:2px solid rgba(244,235,221,.22);border-radius:12px;padding:12px 8px}',
      '.fin-cr .n{font-size:26px;font-weight:900;color:' + PAPER + ';font-variant-numeric:tabular-nums}',
      '.fin-cr .l{font-size:12px;opacity:.75;margin-top:2px}',
      '.fin-cr .nx{margin-top:22px;max-width:340px;background:' + PAPER + ';color:' + INK + ';border-radius:12px;padding:12px 14px;',
      'box-shadow:4px 4px 0 ' + INK + '}',
      '.fin-cr .nx .k{color:#D7263D}',
      '.fin-cr .nx p{margin:4px 0 0;font-size:15px;font-weight:700;line-height:1.3}',
      '.fin-cr .note{margin-top:14px;font-size:11px;opacity:.6;max-width:320px}',
      '.fin-cr button{margin-top:18px;min-width:220px;border:0;border-radius:14px;padding:14px 22px;background:#D7263D;color:#FFF;',
      'font:800 18px system-ui,sans-serif;box-shadow:0 4px 0 #8A1424;cursor:pointer}',
      '.fin-cr button:active{transform:translateY(2px);box-shadow:0 2px 0 #8A1424}'
    ].join('');
    document.head.appendChild(s);
  }
  function fmtNum(v) { return (Math.round(v) || 0).toLocaleString(P.lang === 'tr' ? 'tr-TR' : 'en-US'); }
  function fmtKm(v) { var s = (+v || 0).toFixed(1); return P.lang === 'tr' ? s.replace('.', ',') : s; }
  function fmtTime(sec) { var s = Math.max(0, Math.floor(sec || 0)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
  function cell(n, l) { return '<div class="c"><div class="n">' + n + '</div><div class="l">' + l + '</div></div>'; }

  // Shows the card in #phone. Idempotent per call: a second show replaces the first.
  CR.show = function (st, onDone) {
    css();
    var host = document.getElementById('phone') || document.body, old = document.getElementById('fin-cr');
    if (old) old.remove();
    var root = document.createElement('div'); root.id = 'fin-cr'; root.className = 'fin-cr'; root.setAttribute('role', 'dialog');
    root.innerHTML =
      '<div class="k">' + P.t('fin.credits.kicker') + '</div>' +
      '<div class="t">' + P.t('fin.credits.title') + '</div>' +
      '<div class="r">' + P.t('fin.credits.route') + '</div>' +
      '<div class="g">' +
        cell(fmtKm(st.km), P.t('fin.stat.km') + ' (km)') +
        cell(fmtNum(st.levels), P.t('fin.stat.levels')) +
        cell(fmtNum(st.hoods), P.t('fin.stat.hoods')) +
        cell(fmtNum(st.bosses), P.t('fin.stat.bosses')) +
        cell(fmtNum(st.runKills), P.t('fin.stat.runKills')) +
        cell(fmtTime(st.runTime), P.t('fin.stat.runTime')) +
      '</div>' +
      '<div class="nx"><div class="k">' + P.t('fin.next.kicker') + '</div><p>' + P.t('fin.next.text') + '</p></div>' +
      '<div class="note">' + P.t('fin.credits.note') + ' · ' + P.t('fin.stat.kills') + ': ' + fmtNum(st.kills) + '</div>' +
      '<button type="button">' + P.t('fin.credits.go') + '</button>';
    host.appendChild(root);
    var btn = root.querySelector('button'), fired = false;
    function go() { if (fired) return; fired = true; root.remove(); if (onDone) onDone(); }
    btn.addEventListener('click', go);
    return root;
  };
  return CR;
})();
