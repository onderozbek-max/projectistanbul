// Placeholder sound effects synthesized with WebAudio (no audio files). Signature cues per DS 15 / LD 10.
P.Sfx = (function () {
  var ctx = null, last = {}, tinkStreak = 0, tinkT = 0;
  function ensure() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    return ctx;
  }
  function env(g, t0, a, d, peak) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  }
  function tone(type, f0, f1, dur, vol) {
    var c = ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    env(g, t, 0.005, dur, vol); o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, freq, q) {
    var c = ctx, t = c.currentTime, n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), ch = buf.getChannelData(0);
    for (var i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q || 1;
    env(g, t, 0.004, dur, vol); src.connect(f).connect(g).connect(c.destination); src.start(t);
  }
  var bank = {
    cat: function () { noise(0.07, 0.25, 2600, 3); tone('square', 900, 500, 0.05, 0.05); },
    tink: function () { tinkStreak = (performance.now() - tinkT < 400) ? Math.min(tinkStreak + 1, 12) : 0; tinkT = performance.now(); tone('sine', 1200 + tinkStreak * 60, 1500 + tinkStreak * 60, 0.08, 0.06); },
    glass: function () { tone('triangle', 2400, 1800, 0.12, 0.08); noise(0.1, 0.08, 5000, 2); },
    boom: function () { noise(0.6, 0.5, 120, 0.7); tone('sine', 90, 30, 0.5, 0.4); },
    hurt: function () { tone('square', 180, 90, 0.12, 0.12); },
    level: function () { tone('triangle', 660, 990, 0.18, 0.15); setTimeout(function () { ctx && tone('triangle', 990, 1320, 0.2, 0.12); }, 90); },
    hiss: function () { noise(0.9, 0.18, 4200, 4); },
    rattle: function () { for (var i = 0; i < 5; i++) setTimeout(function () { ctx && noise(0.05, 0.25, 300, 2); }, i * 160); },
    bell: function () { tone('sine', 1320, 1300, 0.9, 0.12); tone('sine', 1980, 1950, 0.6, 0.05); },
    shutter: function () { noise(1.2, 0.2, 400, 0.5); },
    slam: function () { noise(0.3, 0.5, 200, 0.6); tone('square', 70, 40, 0.3, 0.2); },
    stab: function () { noise(0.05, 0.4, 1800, 1.5); tone('square', 300, 120, 0.08, 0.2); },
    nosignal: function () { tone('sine', 480, 480, 0.25, 0.08); setTimeout(function () { ctx && tone('sine', 380, 380, 0.4, 0.08); }, 300); },
    click: function () { tone('square', 800, 600, 0.03, 0.05); },
  };
  return {
    unlock: function () { var c = ensure(); if (c && c.state === 'suspended') c.resume(); },
    play: function (name, minGap) {
      if (!P.Settings.sound || !ensure() || !bank[name]) return;
      var now = performance.now();
      if (minGap && last[name] && now - last[name] < minGap) return;
      last[name] = now;
      try { bank[name](); } catch (e) { /* audio not ready */ }
    },
  };
})();
