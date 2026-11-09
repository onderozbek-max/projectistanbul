// v0.7 strings (lane C): names and death causes for kurye, copci and the taksici / kasapBoss archetypes, and the call-outs for
// phases, weak spots and spawn entrances. Boss names come from js/story/strings-story.js (spk.b.*), not from here.
// TR is the spine; EN is written for English players.
(function () {
  Object.assign(P.STR.tr, {
    'enemy.kurye': 'Kurye', 'enemy.copci': 'Çöpçü',
    'cause.kurye': 'Kurye', 'cause.copci': 'Çöpçü', 'cause.taksici': 'Taksici', 'cause.kasapBoss': 'Kasap',
    'ev.phase2': 'FAZ 2!', 'ev.phase3': 'FAZ 3!', 'ev.exposed': 'Açık nokta!', 'ev.bin': 'Çöp kutusu!',
    'ev.manhole': 'Rögardan çıktı!', 'ev.window': 'Pencereden!', 'ev.balcony': 'Balkondan!', 'ev.tram': 'Tramvaydan!',
  });
  Object.assign(P.STR.en, {
    'enemy.kurye': 'Courier', 'enemy.copci': 'Street sweeper',
    'cause.kurye': 'Courier', 'cause.copci': 'Street sweeper', 'cause.taksici': 'Taxi driver', 'cause.kasapBoss': 'Butcher',
    'ev.phase2': 'PHASE 2!', 'ev.phase3': 'PHASE 3!', 'ev.exposed': 'Weak spot!', 'ev.bin': 'Bin!',
    'ev.manhole': 'From the drain!', 'ev.window': 'Through the window!', 'ev.balcony': 'From the balcony!', 'ev.tram': 'From the tram!',
  });
})();
