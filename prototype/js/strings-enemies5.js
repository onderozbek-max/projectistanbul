// Wave 1 strings (R1, audit section 10): names, death causes, down-screen tips for marti (seagull thief) and cayci (tea
// carrier), and the in-run call-outs for the fisher's hook and the marti's steal. TR is the spine, written natively; EN is
// written for English players (not a translation of the TR lines).
(function () {
  Object.assign(P.STR.tr, {
    'enemy.marti': 'Martı', 'enemy.cayci': 'Çaycı',
    'cause.marti': 'Martı', 'cause.cayci': 'Çaycı',
    'tip.marti': 'İpucu: Martı yerdeki XP parçasını kapıp kaçar. Öldürürsen parça geri düşer.',
    'tip.cayci': 'İpucu: Çaycı sıcak çay fırlatır, yere ıslak bir daire bırakır. Dairenin dışında kal.',
    'ev.hookHit': 'Olta!', 'ev.steal': 'Kaptı!',
  });
  Object.assign(P.STR.en, {
    'enemy.marti': 'Seagull', 'enemy.cayci': 'Tea carrier',
    'cause.marti': 'Seagull', 'cause.cayci': 'Tea carrier',
    'tip.marti': 'Tip: the seagull grabs a loose XP drop and flees. Kill it and the drop comes back.',
    'tip.cayci': 'Tip: the tea carrier throws hot tea that leaves a wet ring. The ring slows you, so stay out.',
    'ev.hookHit': 'Hook!', 'ev.steal': 'Snatched!',
  });
})();
