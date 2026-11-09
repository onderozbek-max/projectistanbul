// Indoor zones (view only). One answer to "is this covered space?" for gulls, pigeons, rain, fog and the ambience bed.
// Data: L1 has explicit zones (config.js: level.room.indoor, level.segments[].indoor). Generated levels are one sub-location
// each, flagged in istanbul-themes.js (theme.indoor or the sub row's 'indoor' flag).
P.Indoor = (function () {
  var I = {};

  function themeOf(s) {
    return P.Themes.get(s.theme || (s.levelInfo && s.levelInfo.hood && s.levelInfo.hood.theme) || 'istiklal');
  }
  function isL1(s) { return !s || !s.levelIndex || s.levelIndex === 1; }

  // Generated level: the whole level is one covered or open sub-location.
  I.level = function (s) {
    if (!s || isL1(s) || !P.Themes) return false;
    var th = themeOf(s);
    return P.Themes.isIndoor(th, P.Themes.subOf(th, P.Themes.subIndex(s)));
  };

  // Level 1: the restaurant (room, north of the door at y = 0), the passage and the underpass segments.
  function l1At(y) {
    var lv = P.CFG.level, seg = null, i;
    if (lv.room && lv.room.indoor && y < lv.room.yMax + 0.5) return true;
    for (i = 0; i < lv.segments.length; i++) if (y >= lv.segments[i].y0) seg = lv.segments[i];
    return !!(seg && seg.indoor);
  }

  // Is world height y inside an indoor zone of this level?
  I.at = function (s, y) {
    if (!s) return false;
    if (isL1(s)) return l1At(y);
    return I.level(s);
  };

  // Hero or camera centre indoors: gulls, pigeons and the bird calls go quiet (faded by the caller).
  I.near = function (s) {
    if (!s || !s.hero) return false;
    if (I.at(s, s.hero.y)) return true;
    return !!(P.Fx && P.Fx.cam && I.at(s, P.Fx.cam.y));
  };

  // Ambience bed: covered levels use the bazaar bed (no baked-in gull calls); others keep their own bed.
  I.bed = function (s, id) {
    if (I.level(s) || (isL1(s) && s.hero && l1At(s.hero.y))) return 'bazaar';
    return id;
  };

  return I;
})();
