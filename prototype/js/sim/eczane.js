// Eczane (pharmacy) heal station (R1-T4 part 14). A one-use street prop: a solid block of kind 'eczane' on the side lane of a
// route stage (P.Eczane.place, called by P.Levels.build after the street blocks and before the layout slots). The hero who
// touches it and stands for env.eczane.dwell seconds (no button) is healed by env.eczane.heal HP, once; the station is then
// empty. The heal is a map pickup, not a drop: it sits outside drops.healCap (combat.js), so it neither spends the run's
// budget nor waits for it. Numbers live in config-env.js (env.eczane). Placement draws from its own RNG stream, so a level with
// no station is built exactly as before. The view reads P.Eczane.state (usable | empty) and the pickup event (healed, uncapped);
// nothing here reads settings, quality or the view.
(function () {
  P.Eczane = {};

  function cfg() { return P.CFG.env.eczane; }

  // Waterside hoods (a boat or ferry in the hood's vehicles) and the covered bazaar have no street pharmacy.
  P.Eczane.streetLike = function (hood) {
    var C = cfg();
    if (!hood || C.notThemes.indexOf(hood.theme) >= 0) return false;
    return !(hood.vehicles || []).some(function (v) { return C.noVehicles.indexOf(v) >= 0; });
  };

  // Distance from the hero's centre to a station footprint (0 when inside it).
  P.Eczane.touchDist = function (h, b) {
    var rc = b.rc, dx = Math.max(rc.xMin - h.x, 0, h.x - rc.xMax), dy = Math.max(rc.yMin - h.y, 0, h.y - rc.yMax);
    return Math.hypot(dx, dy);
  };

  function clashes(G, x, y, w, h, m) {
    return G.blocks.some(function (b) {
      return Math.abs(b.x - x) < (b.w + w) / 2 + m && Math.abs(b.y - y) < (b.h + h) / 2 + m;
    });
  }

  // One candidate spot on a street side of the route band, or null. Layout zones and clashes are refused (the layout owns them).
  function spot(G, C, rng) {
    var w = C.w, h = C.h, y = G.holdY * rng.range(C.span[0], C.span[1]), side = rng.int(0, 1) * 2 - 1;
    var x = side * (C.sideMin + w / 2 + rng.range(0, C.sideJit));
    if (P.Layouts.inZone(G, y) || Math.abs(x) + w / 2 > G.xMax - C.edge) return null;
    if (clashes(G, x, y, w, h, C.clear)) return null;
    return { x: x, y: y, w: w, h: h };
  }

  // Places up to perLevel stations on a generated route level (index >= env.eczane.from, stage in env.eczane.stages). Returns the
  // station records (also s.eczane.list), or null when none fits. Blocks go into s.geo.blocks; the path test keeps the route open.
  P.Eczane.place = function (s, index, info) {
    var C = cfg(), G = s.geo, rng, list = [], k, sp, b;
    if (!C || !G || G.boss || !(C.perLevel > 0) || index < C.from || !info) return null;
    if (C.stages.indexOf(info.stage) < 0 || !P.Eczane.streetLike(info.hood)) return null;
    rng = P.makeRng(((s.seed >>> 0) ^ C.seedSalt) + index * C.seedStep);
    for (k = 0; k < C.tries && list.length < C.perLevel; k++) {
      sp = spot(G, C, rng);
      if (!sp) continue;
      b = { kind: 'eczane', x: sp.x, y: sp.y, w: sp.w, h: sp.h,
        rc: { xMin: sp.x - sp.w / 2, xMax: sp.x + sp.w / 2, yMin: sp.y - sp.h / 2, yMax: sp.y + sp.h / 2 } };
      G.blocks.push(b);
      if (P.Env && P.Env.pathOpen && !P.Env.pathOpen(s)) { G.blocks.pop(); continue; }
      b.station = { b: b, used: false, dwell: 0 };
      list.push(b.station);
    }
    if (!list.length) return null;
    s.eczane = { list: list, heal: C.heal };
    return list;
  };

  // The heal: min(heal, missing HP). The pickup event carries the HP actually restored and uncapped, so the view reads +N HP.
  function use(s, st) {
    var h = s.hero, C = cfg(), before = h.hp;
    h.hp = Math.min(h.maxHp, h.hp + C.heal);
    st.used = true; st.dwell = 0;
    s.events.push({ type: 'pickup', kind: 'eczane', value: C.heal, healed: h.hp - before, uncapped: true, capped: false, x: st.b.x, y: st.b.y });
  }

  // Per tick (sim.js, after the drops). A touch counts while the hero is below full HP; a gap in the touch resets the dwell.
  P.Eczane.step = function (s, dt) {
    var E = s.eczane, C = cfg(), h = s.hero, i, st;
    if (!E) return;
    for (i = 0; i < E.list.length; i++) {
      st = E.list[i];
      if (st.used) continue;
      if (h.hp >= h.maxHp || P.Eczane.touchDist(h, st.b) > C.touchR) { st.dwell = 0; continue; }
      st.dwell += dt;
      if (st.dwell >= C.dwell) use(s, st);
    }
  };

  // The station's look, read by the view (consumables.js stationState): 'usable' or 'empty' for a station block, null otherwise.
  P.Eczane.state = function (s, b) {
    var st = b && b.station;
    if (!st || !s || !s.eczane) return null;
    return st.used ? 'empty' : 'usable';
  };
})();
