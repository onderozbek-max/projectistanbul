// Telemetry (GD 10, LD 12): events kept in memory + console, exportable as JSONL from the pause menu.
P.Tel = (function () {
  var events = [], session = 's-' + Date.now().toString(36), seed = 0;
  function log(event, fields) {
    var rec = Object.assign({
      ts: new Date().toISOString(), install_id: P.Settings.installId, session_id: session, build: 'proto-0.1',
      quality_tier: 'web', device_model: navigator.userAgent.slice(0, 80), event: event, level: 1, seed: seed,
    }, fields || {});
    events.push(rec);
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
