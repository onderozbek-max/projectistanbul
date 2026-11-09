// Evolution and skill icons (W, view only). An evolution is its base icon scaled into the box, inside a gold ring, with a
// round tag badge at the lower right that shows its synergy element (fire, electric, blunt, blade, gas, water). The two
// active skills get their own icons: the simit ring (skill.shield) and the tulip tea glass (skill.tea). No text in icons.
// Loaded after icons.js; registers through P.Icons.register and reads base icons with P.Icons.raw.
(function () {
  if (!P.Icons || !P.Icons.register) return;
  var I = P.Icons, K = I.parts, INK = K.INK, OUT = K.OUT, GOLD = K.GOLD;
  var BADGE = {
    fire: { col: '#E9703B', glyph: '<path d="M38 31.5C36.5 34 40.5 35 39 38.5C38 40.5 35.5 40 35.5 38C35.5 36.5 37 36 37 34.5C37.5 33.5 38 32.8 38 31.5Z" fill="' + INK + '"/>' },
    electric: { col: '#3DDCFF', glyph: '<path d="M40 31L36 38H39L36 45" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>' },
    blunt: { col: '#8A8F98', glyph: '<rect x="34.5" y="34.5" width="7" height="7" rx="1" fill="' + INK + '"/>' },
    blade: { col: '#C9CED6', glyph: '<path d="M34 42L42 34" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' },
    gas: { col: '#8FD36E', glyph: '<circle cx="36.5" cy="36.5" r="1.8" fill="' + INK + '"/><circle cx="40" cy="36.5" r="1.8" fill="' + INK + '"/><circle cx="38.2" cy="40" r="1.8" fill="' + INK + '"/>' },
    water: { col: '#3FA7D6', glyph: '<path d="M38 31.5C38 31.5 34.5 36 34.5 38.5C34.5 40.4 36.1 42 38 42C39.9 42 41.5 40.4 41.5 38.5C41.5 36 38 31.5 38 31.5Z" fill="' + INK + '"/>' }
  };

  // Evolution: scaled base icon, gold ring, tag badge.
  function evoIcon(base, tag) {
    var b = BADGE[tag] || BADGE.blunt;
    return '<g transform="translate(6 6) scale(0.75)">' + I.raw(base) + '</g>' +
      '<circle cx="24" cy="24" r="22.5" fill="none" stroke="' + GOLD + '" stroke-width="2.5"/>' +
      '<circle cx="38" cy="38" r="8" fill="' + b.col + '" stroke="' + INK + '" stroke-width="2"/>' + b.glyph;
  }

  var EVO = {
    blacksmith: ['sledge', 'blunt'], stormshield: ['cable', 'electric'], foamstorm: ['extinguisher', 'water'],
    netspear: ['speargun', 'blade'], lake: ['molotov', 'fire'], twinsaw: ['sawblade', 'blade'],
    fireball: ['molotov', 'fire'], arcchain: ['chain', 'electric'], carbomb: ['canister', 'gas'],
    forge: ['torch', 'fire'], grinder: ['chainsaw', 'blade'], hookpull: ['olta', 'blade'], minibus: ['cardoor', 'blunt']
  };
  Object.keys(EVO).forEach(function (id) {
    I.register(id, function () { return evoIcon(EVO[id][0], EVO[id][1]); });
  });

  // Simit shield: a sesame-topped ring of bread, face on.
  I.register('skill.shield', function () {
    var dots = [[12, 22], [34, 22], [16, 32], [32, 32], [24, 34], [24, 18], [10, 27], [38, 27]], s = '', i;
    s += K.path('M24 13C34.5 13 41 18.6 41 26C41 33.4 34.5 39 24 39C13.5 39 7 33.4 7 26C7 18.6 13.5 13 24 13Z', '#C9873A');
    s += K.path('M24 20.5C29.9 20.5 33.6 23 33.6 26C33.6 29 29.9 31.5 24 31.5C18.1 31.5 14.4 29 14.4 26C14.4 23 18.1 20.5 24 20.5Z', '#F4EBDD');
    for (i = 0; i < dots.length; i++) s += K.pip(dots[i][0], dots[i][1], 1.5, '#F4E6C2');
    return s + K.hiLine('M10.5 20.5Q12 15.5 17.5 14', 1.6);
  });

  // Tea glass: tulip-shaped glass in a saucer, amber tea inside.
  I.register('skill.tea', function () {
    return K.path('M10 39H38L35 43H13Z', GOLD) +
      K.path('M14 13H34L31 34Q30 38 24 38Q18 38 17 34Z', '#F3E3C0') +
      K.path('M16.5 19H31.5L30 32Q29 35 24 35Q19 35 18 32Z', '#B5571F') +
      K.hiLine('M18 16.5Q19 14 22 13.5', 1.6);
  });
})();
