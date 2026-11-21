// Telemetry (GD 10, LD 12): events kept in memory + console, exportable as JSONL from the pause menu.
P.Tel = (function () {
  // Events are kept in memory and mirrored to localStorage (phone playtest: a reload or a crash lost the session). The mirror
  // holds the newest CAP events across sessions; export writes all of them. A blocked or full store is ignored.
  var KEY = 'nsi.tel.v1', CAP = 2500, FLUSH_MS = 2000, BUILD = 'proto-0.2-playtest';
  var benchmark = typeof location !== 'undefined' && /[?&]bench=1(&|$)/.test(location.search);
  var weaponLab = !benchmark && typeof location !== 'undefined' && /[?&]weaponlab=1(&|$)/.test(location.search);
  var events = [], session = 's-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  var seed = 0, dirty = false, timer = 0, serial = 0, attempt = 0, run = null, ended = true;
  try { var old = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(old)) events = old.slice(-CAP); } catch (e) { events = []; }
  function flush() {
    if (timer) clearTimeout(timer);
    timer = 0; if (!dirty) return; dirty = false;
    try { localStorage.setItem(KEY, JSON.stringify(events.slice(-CAP))); } catch (e) { /* private mode or full */ }
  }
  function later() { dirty = true; if (!timer) timer = setTimeout(flush, FLUSH_MS); }
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('pagehide', function (e) {
      if (!e.persisted && run && !ended) log('run_interrupted', { reason: 'page_left' });
      flush();
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });
  }
  function log(event, fields) {
    if (weaponLab || benchmark && event.indexOf('bench_') !== 0) return;
    var rec = Object.assign({
      ts: new Date().toISOString(), install_id: P.Settings.installId, session_id: session, build: BUILD,
      event_id: session + '-e' + (++serial), quality_tier: 'web', event: event, seed: seed
    }, run, fields || {});
    events.push(rec); if (events.length > CAP * 2) events.splice(0, events.length - CAP);
    var terminal = event === 'level_end' || event === 'run_interrupted';
    if (terminal) ended = true;
    if (benchmark || terminal) { dirty = true; flush(); } else later();
    if (window.console && console.debug) console.debug('[tel]', event, fields || '');
  }
  function startsWith(record, prefix) { return typeof record.event === 'string' && record.event.indexOf(prefix) === 0; }
  return {
    setSeed: function (s) { seed = s; },
    startRun: function (level, info, mode) {
      run = { run_id: session + '-r' + (++attempt), level: level, level_id: info.id, mode: mode || 'normal' };
      ended = false;
      return run.run_id;
    },
    clearRun: function () { run = null; },
    log: log,
    count: function () { return events.length; },
    hasPrefix: function (prefix) { return events.some(function (e) { return e && startsWith(e, prefix); }); },
    exportJsonl: function (prefix) {
      var rows = prefix ? events.filter(function (e) { return e && startsWith(e, prefix); }) : events;
      var blob = new Blob([rows.map(function (e) { return JSON.stringify(e); }).join('\n') + '\n'], { type: 'application/x-ndjson' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = prefix ? 'istanbul-phone-test.jsonl' : 'telemetry-' + session + '.jsonl';
      document.body.appendChild(a); a.click(); a.remove();
    },
  };
})();
