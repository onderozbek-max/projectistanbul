// Telemetry (GD 10, LD 12): events kept in memory + console, exportable as JSONL from the pause menu.
P.Tel = (function () {
  // Events are kept in memory and mirrored to localStorage (phone playtest: a reload or a crash lost the session). The mirror
  // holds the newest CAP events across sessions; export writes all of them. A blocked or full store is ignored.
  var KEY = 'nsi.tel.v1', CAP = 2500, FLUSH_MS = 2000;
  var events = [], session = 's-' + Date.now().toString(36), seed = 0, dirty = false, timer = 0;
  try { var old = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(old)) events = old.slice(-CAP); } catch (e) { events = []; }
  function flush() {
    timer = 0; if (!dirty) return; dirty = false;
    try { localStorage.setItem(KEY, JSON.stringify(events.slice(-CAP))); } catch (e) { /* private mode or full */ }
  }
  function later() { dirty = true; if (!timer) timer = setTimeout(flush, FLUSH_MS); }
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });
  }
  function log(event, fields) {
    var rec = Object.assign({
      ts: new Date().toISOString(), install_id: P.Settings.installId, session_id: session, build: 'proto-0.1',
      quality_tier: 'web', device_model: navigator.userAgent.slice(0, 80), event: event, level: 1, seed: seed,
    }, fields || {});
    events.push(rec); if (events.length > CAP * 2) events.splice(0, events.length - CAP);
    later();
    if (window.console && console.debug) console.debug('[tel]', event, fields || '');
  }
  return {
    setSeed: function (s) { seed = s; },
    log: log,
    count: function () { return events.length; },
    exportJsonl: function () {
      var blob = new Blob([events.map(function (e) { return JSON.stringify(e); }).join('\n') + '\n'], { type: 'application/x-ndjson' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'telemetry-' + session + '.jsonl';
      document.body.appendChild(a); a.click(); a.remove();
    },
  };
})();
