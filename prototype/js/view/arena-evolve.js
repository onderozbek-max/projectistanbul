// Arena evolution, core (view only; the simulation never reads this, tools/test-arena-evolve.js checks it). Three things change
// the arena: (1) each hood-level has a treatment (ground tint and paving wear, tile mirror and offset, prop density and the
// litter set; config-arena-evolve.js); (2) the screen light drifts across a level from the hood's own light toward its end
// light, and the boss stage gets a grade and a vignette when it starts; (3) the decal and dressing layers (arena-evolve-decals.js)
// fill in as the run goes on. Nothing here is time-driven except the boss ramp and the lamp flicker, and both stop under Reduce motion.
// Hooks: render.js (drawGround, drawLights, screen), render-world.js (the ground tile), istanbul.js (sidewalk weights).
P.ArenaEvolve = (function () {
  var E = {}, TAU = Math.PI * 2, GROUND = new WeakMap(), TR = {}, BOSS = new WeakMap(), VIG = { key: '', cv: null };
  var SEGS = ['A', 'B', 'C', 'D'];

  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(p) { return p * p * (3 - 2 * p); }
  function cfg() { return P.CFG.arenaEvolve || { on: false }; }
  E.hash = hash; E.ease = ease; E.clamp = clamp;
  E.enabled = function () { return !!cfg().on; };
  // Reduce motion (Settings, or the reduce-motion class on #phone): nothing in the arena is time-driven then.
  E.reduced = function () {
    if (P.Settings && P.Settings.reduceMotion) return true;
    var ph = typeof document !== 'undefined' && document.getElementById ? document.getElementById('phone') : null;
    return !!(ph && ph.classList && ph.classList.contains('reduce-motion'));
  };

  // Hood (0..19) and stage (1..5) of a sim. Level index is 1-based: level = hood x 5 + stage.
  E.where = function (s) {
    var li = s.levelInfo;
    if (li && li.hoodIndex !== undefined) return { h: li.hoodIndex, L: li.stage || 1 };
    var i = Math.max(1, s.levelIndex || 1) - 1;
    return { h: Math.floor(i / 5), L: (i % 5) + 1 };
  };

  // The treatment of one hood-level: every value a player can see on the ground and in the light. Pure and cached.
  E.treatment = function (h, L) {
    var k = h + '|' + L, t = TR[k], c = cfg(), lv, g, o;
    if (t) return t;
    lv = c.level[L - 1] || c.level[0];
    g = c.ground[h] || c.ground[0];
    o = (3 * h + L) % 8;                      // 8 mirror and offset variants; consecutive stages never share one within a hood
    t = { h: h, L: L, flipX: o & 1, flipY: (o >> 1) & 1, shiftY: (o >> 2) ? 0.5 : 0, wear: lv.wear, tint: g[0],
      tintA: +(g[1] * lv.tint).toFixed(4), dens: lv.dens, litter: lv.litter, sheen: (h + L) % 3 === 0 ? 1 : 0,
      seed: hash(h * 31 + L * 7) * 1000, end: c.endLight[h] || c.endLight[0] };
    t.key = [h, L, o, lv.wear, g[0], t.tintA, lv.dens, t.sheen].join(':');
    TR[k] = t;
    return t;
  };

  // Progress through the level, 0 at the start and 1 at the gate (route), or 0..1 across the approach and the boss fight.
  // Read from the sim state only (hero.y, geo, gen, props); a level without geo (the scripted L1) runs over the corridor.
  E.progress = function (s) {
    var G = s.geo, y = s.hero ? s.hero.y : 0, g = s.gen, sh = (s.props && s.props.shutter) || 0, b, pr;
    if (!G || !(G.exitY > 0)) return clamp(y / P.CFG.level.corridor.yMax, 0, 1);
    if (G.boss) {
      pr = 0.5 * clamp(y / (G.holdY || G.exitY), 0, 1);
      b = g && g.boss;
      if (g && g.arena && b) pr += 0.5 * (b.dead ? 1 : clamp(1 - b.hp / b.maxHp, 0, 1));
      return clamp(pr, 0, 1);
    }
    return clamp(0.85 * clamp(y / G.exitY, 0, 1) + 0.15 * sh, 0, 1);
  };
  E.segIndex = function (s) { var i = s.gen && s.gen.seg ? SEGS.indexOf(s.gen.seg) : 0; return i < 0 ? 0 : i; };
  // Where the ratchet is heading: route, segment (A..D) and horde density. The ratchet itself never falls (see decals file).
  E.ratchetTarget = function (s) {
    var R = cfg().ratchet, dens = clamp((s.enemies ? s.enemies.length : 0) / R.densRef, 0, 1);
    return clamp(R.route * E.progress(s) + R.seg * (E.segIndex(s) / 3) + R.horde * dens, 0, 1);
  };

  // Boss mood (0..1): 0 until the arena starts, then eases in over boss.ramp s. Reduce motion jumps straight to 1.
  E.bossK = function (s) {
    var g = s.gen, B = cfg().boss, t0, now, x;
    if (!g || !g.arena) return 0;
    now = performance.now() / 1000;
    t0 = BOSS.get(g);
    if (t0 === undefined) { t0 = now; BOSS.set(g, t0); }
    if (E.reduced() || !(B.ramp > 0)) return 1;
    x = clamp((now - t0) / B.ramp, 0, 1);
    return ease(x);
  };

  // Colours: '#RRGGBB' tokens and [r, g, b] arrays both become rgba() strings.
  function rgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a.toFixed(3) + ')';
  }
  function rgbaN(v, a) { return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + a.toFixed(3) + ')'; }
  E.rgba = rgba;

  // Wrapped draw: the image in nine copies so a mirrored or offset tile still covers the whole canvas seamlessly.
  function wrapDraw(c, img, W, H, fx, fy, ox, oy) {
    for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) {
      c.save(); c.translate(ox + i * W + (fx ? W : 0), oy + j * H + (fy ? H : 0)); c.scale(fx ? -1 : 1, fy ? -1 : 1);
      c.drawImage(img, 0, 0, W, H); c.restore();
    }
  }
  // Repaired patches: a few soft blobs where the same paving is laid again, mirrored and offset by half a tile with a little
  // grime on top. Same material, so the lane reads as patched rather than as a second colour.
  function wearPatches(c, base, tr, W, H) {
    var k = base.k, n = Math.round(tr.wear * base.w * base.h / 1.5), i, x, y, r, rot, ox, oy, bx, by, bw, bh;
    for (i = 0; i < n; i++) {
      x = hash(i * 3.1 + tr.seed) * base.w; y = hash(i * 5.7 + tr.seed * 2) * base.h;
      r = 0.35 + 0.45 * hash(i * 7.3 + tr.seed); rot = hash(i + 9 + tr.seed) * Math.PI;
      for (ox = -base.w; ox <= base.w; ox += base.w) for (oy = -base.h; oy <= base.h; oy += base.h) {
        if ((x + ox - r) * k > W || (x + ox + r) * k < 0 || (y + oy - r) * k > H || (y + oy + r) * k < 0) continue;
        c.save(); c.beginPath(); c.ellipse((x + ox) * k, (y + oy) * k, r * k, r * 0.6 * k, rot, 0, TAU); c.clip();
        wrapDraw(c, base.cv, W, H, !(i & 1), false, base.w * 0.5 * k, base.h * 0.25 * k);
        c.fillStyle = 'rgba(20,21,31,0.07)'; bx = (x + ox - r) * k; by = (y + oy - r) * k; bw = 2 * r * k; bh = 2 * r * k; c.fillRect(bx, by, bw, bh);
        c.restore();
      }
    }
  }
  function sheenStreaks(c, base, tr, W, H) {
    var k = base.k, i, x, y;
    c.strokeStyle = 'rgba(236,244,250,0.10)'; c.lineWidth = 0.05 * k;
    for (i = 0; i < 6; i++) {
      x = hash(i * 4.1 + tr.seed) * base.w * k; y = hash(i * 2.3 + tr.seed) * base.h * k;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + 0.8 * k, y - 0.25 * k); c.stroke();
      c.beginPath(); c.moveTo(x - W, y); c.lineTo(x + 0.8 * k - W, y - 0.25 * k); c.stroke();
    }
  }
  // The treated ground tile for one hood-level: the authored (or baked) tile, mirrored and offset, tinted with the hood's
  // design-system token, with repaired patches and (on wet levels) sheen. Same size and scale as the base, so the caller's
  // fillTile works unchanged. Cached per base tile and treatment key.
  function composite(base, tr) {
    var W = base.cv.width, H = base.cv.height, cv = document.createElement('canvas'), c;
    cv.width = W; cv.height = H; c = cv.getContext('2d');
    wrapDraw(c, base.cv, W, H, tr.flipX, tr.flipY, 0, tr.shiftY * H);
    c.fillStyle = rgba(tr.tint, tr.tintA); c.fillRect(0, 0, W, H);
    if (tr.wear > 0) wearPatches(c, base, tr, W, H);
    if (tr.sheen) sheenStreaks(c, base, tr, W, H);
    return { w: base.w, h: base.h, k: base.k, cv: cv, pat: null, art: true, treated: tr.key };
  }
  // Replaces a ground tile record for the current hood-level. Returns the base when the treatment is off or the base is missing.
  E.ground = function (R, th, s, base) {
    var w, tr, m, rec;
    if (!E.enabled() || !base || !base.cv || !th) return base;
    w = E.where(s); tr = E.treatment(w.h, w.L);
    m = GROUND.get(base);
    if (!m) { m = new Map(); GROUND.set(base, m); }
    rec = m.get(tr.key);
    if (!rec) {
      if (m.size >= 6) m.delete(m.keys().next().value);
      rec = composite(base, tr);
      rec.pat = R.ctx.createPattern(rec.cv, 'repeat');
      m.set(tr.key, rec);
    }
    return rec;
  };

  // Screen layer (render.js, after RenderOverlay.screen): the drift toward the level's end light, then the boss grade and vignette.
  E.screen = function (R, s) {
    var c = R.ctx, W = R.W, H = R.H, w, tr, a, k, B;
    if (!E.enabled()) return;
    w = E.where(s); tr = E.treatment(w.h, w.L);
    a = tr.end[3] * ease(E.progress(s));
    if (a > 0.002) { c.fillStyle = rgbaN(tr.end, a); c.fillRect(0, 0, W, H); }
    k = E.bossK(s);
    if (k > 0) {
      B = cfg().boss;
      c.fillStyle = rgbaN(B.grade, B.gradeA * k); c.fillRect(0, 0, W, H);
      c.drawImage(vignette(R, B.vig * k), 0, 0, W, H);
    }
  };
  // The edge darkening for the boss mood: one canvas per 0.02 of alpha, so the ramp rebuilds it at most about 12 times.
  function vignette(R, a) {
    var key = Math.round(a * 50) + '|' + R.dpr + '|' + R.W + 'x' + R.H, W = R.W, H = R.H, g, g2;
    if (VIG.key !== key) {
      if (!VIG.cv) VIG.cv = document.createElement('canvas');
      VIG.cv.width = Math.round(W * R.dpr); VIG.cv.height = Math.round(H * R.dpr);
      g2 = VIG.cv.getContext('2d'); g2.setTransform(R.dpr, 0, 0, R.dpr, 0, 0);
      g = g2.createRadialGradient(W / 2, H * 0.65, 0, W / 2, H * 0.65, H * 0.75);
      g.addColorStop(0.55, 'rgba(10,8,14,0)'); g.addColorStop(1, 'rgba(10,8,14,' + (Math.round(a * 50) / 50).toFixed(2) + ')');
      g2.fillStyle = g; g2.fillRect(0, 0, W, H);
      VIG.key = key;
    }
    return VIG.cv;
  }

  // Sidewalk weights for one level (istanbul.js genStreet): the theme's weights with one kind favoured and one thinned, and the
  // share of slots that keep a prop (the theme's 0.6 scaled by the level's density). Cached per props object and level.
  var MIX = new WeakMap();
  E.streetMix = function (s, props) {
    var w, tr, keys = Object.keys(props || {}), out = {}, a, b, memo, key;
    if (!E.enabled() || keys.length < 2) return { w: props, keep: 0.6 };
    w = E.where(s); tr = E.treatment(w.h, w.L);
    key = w.h + '|' + w.L;
    memo = MIX.get(props);
    if (memo && memo[key]) return memo[key];
    if (!memo) { memo = {}; MIX.set(props, memo); }
    a = (w.h * 7 + w.L * 3) % keys.length; b = (w.h * 5 + w.L * 5 + 2) % keys.length; if (b === a) b = (b + 1) % keys.length;
    keys.forEach(function (k, i) { out[k] = props[k] * (i === a ? 2.2 : i === b ? 0.4 : 1); });
    memo[key] = { w: out, keep: clamp(0.6 * tr.dens, 0.3, 0.9) };
    return memo[key];
  };

  return E;
})();
