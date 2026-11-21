// The six bounded opportunities use ordinary movement and the existing route actors.
P.LocalChoices = (function () {
  var L = {}, C = P.CFG.env.streetWeapon.opportunity;
  var kinds = { 7: ['shelter', 'direct'], 12: ['place', 'offense'], 17: ['place', 'offense'],
    22: ['place', 'offense'], 27: ['shelter', 'lit'], 29: ['lit', 'lure'] };
  function active(s) { return s.routeTrial && kinds[s.levelIndex]; }
  function choose(s, value, p) {
    if (s.localChoice || !L.valid(s.levelIndex, value)) return false;
    s.localChoice = value;
    s.events.push({ type: 'routeBeat', phase: 'choice_' + s.levelIndex + '_' + value, x: p.x, y: p.y });
    return true;
  }
  L.valid = function (level, choice) { return !!kinds[level] && kinds[level].indexOf(choice) >= 0; };
  L.pads = function (s) {
    var m = s.milestone, list = active(s);
    if (!m || !m.point || !list || C.propLevels.indexOf(s.levelIndex) >= 0 || m.open || s.localChoice) return [];
    var y = m.point.y - C.back;
    return list.map(function (id, i) {
      var x = (i * 2 - 1) * C.x;
      var yy = [y, y - C.back, y - 2 * C.back].find(function (at) { return !P.Events.blocked(s, x, at); });
      return yy === undefined ? null : { id: id, x: x, y: yy, r: C.radius };
    }).filter(Boolean);
  };
  L.step = function (s, dt) {
    var m = s.milestone;
    if (!m || !m.point || m.open || Math.abs(s.hero.y - m.point.y) > 8 + 3 * C.back) return;
    var p = L.pads(s).find(function (q) { return P.RouteMilestones.inRing(s, q, q.r); });
    if (!p || s.hero.moving || s.hero.dashing) { s.localChoiceIntent = null; return; }
    var intent = s.localChoiceIntent && s.localChoiceIntent.id === p.id ? s.localChoiceIntent : { id: p.id, t: 0 };
    s.localChoiceIntent = intent;
    intent.t += dt || 0;
    if (intent.t < P.CFG.experience.choiceHold || !choose(s, p.id, p)) return;
    s.localChoiceIntent = null;
    if (p.id === 'lure') P.StreetPlaces.repel(s, p, p.x, p.y);
    if (m.guide) {
      m.guide.laneX = p.x;
      if (p.id === 'shelter') P.StreetPlaces.repel(s, m.guide, -p.x, p.y);
    }
  };
  L.guide = function (s, guide, dt) {
    if (guide.laneX === undefined) return 1;
    var x = guide.x + Math.max(-C.drift * dt, Math.min(C.drift * dt, guide.laneX - guide.x));
    if (!P.Events.blocked(s, x, guide.y)) guide.x = x;
    return s.localChoice === 'shelter' ? C.shelteredSpeed : 1;
  };
  L.prop = function (s, r, value) {
    if (!active(s) || s.milestone.open || !s.streetSite || s.streetSite.prop !== r) return;
    if (value === 'place') { choose(s, value, s.hero); return; }
    if (s.streetChoiceHit) return;
    s.streetChoiceHit = { x: s.hero.x, y: s.hero.y };
    if (s.levelIndex === 17) P.StreetPlaces.repel(s, s.milestone.point, s.hero.x, s.hero.y);
  };
  L.resolve = function (s) {
    if (s.streetChoiceHit) choose(s, 'offense', s.streetChoiceHit);
  };
  L.record = function (s) {
    if (!s.milestone || !s.milestone.open || !L.valid(s.levelIndex, s.localChoice)) return null;
    return s.localChoice;
  };
  L.memory = function (s) {
    var level = C.callbacks[s.levelIndex], key = s.loadout && s.loadout.streetMemories && s.loadout.streetMemories[level];
    return L.valid(level, key) ? 'choice.memory.' + level + '.' + key : null;
  };
  L.aftercare = function (s) {
    if (!s.localChoice) return null;
    if (s.levelIndex === 17) return s.localChoice === 'place' ? 'L17SafeCover' : 'L17SafeLure';
    if (s.levelIndex === 27) return s.localChoice === 'shelter' ? 'L27SafeCover' : 'L27SafeLight';
    return null;
  };
  return L;
})();
