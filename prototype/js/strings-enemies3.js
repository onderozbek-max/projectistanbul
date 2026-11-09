// v0.6 strings (workstream D): death causes for the enemy types the walk now uses. Names of the new types and
// affixes are in config-levels.js (C.levelStrings). TR is the spine, EN is written for English players.
(function () {
  Object.assign(P.STR.tr, {
    'cause.bloater': 'Şişman zombi', 'cause.brute': 'İri zombi', 'cause.spitter': 'Tükürükçü', 'cause.screamer': 'Çığlıkçı',
    'cause.hardhat': 'Baretli', 'cause.kasap': 'Kasap', 'cause.parkur': 'Parkurcu', 'cause.patlayan': 'Patlayan zombi',
  });
  Object.assign(P.STR.en, {
    'cause.bloater': 'Fat zombie', 'cause.brute': 'Big zombie', 'cause.spitter': 'Spitter', 'cause.screamer': 'Screamer',
    'cause.hardhat': 'Hardhat', 'cause.kasap': 'Butcher', 'cause.parkur': 'Free-runner', 'cause.patlayan': 'Volatile zombie',
  });
})();
