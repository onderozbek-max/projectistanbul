// Seeded RNG streams (ARCH 4.10): same seed + same inputs = same run.
P.makeRng = function (seed) {
  var a = seed >>> 0;
  return {
    next: function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range: function (lo, hi) { return lo + (hi - lo) * this.next(); },
    int: function (lo, hi) { return lo + Math.floor(this.next() * (hi - lo + 1)); },
    chance: function (p) { return this.next() < p; },
    pick: function (arr) { return arr[Math.floor(this.next() * arr.length)]; },
  };
};

P.makeStreams = function (seed) {
  var s = {};
  ['spawn', 'loot', 'cards', 'combat', 'ai'].forEach(function (name, i) {
    s[name] = P.makeRng((Math.imul(seed, 2654435761) + (i + 1) * 40503) >>> 0);
  });
  return s;
};
