// Weapon tier look (view only; owner feedback: weapons look alike and do not visibly grow). The numbers are config-weapon-tiers.js
// (P.CFG.wtier); the shapes are weapon-sil.js / weapon-sil-evo.js (P.WSil), primitives in weapon-sil-prim.js. Channels:
//   1. live shapes: each frame, every flying or sustained entity in the sim (blades, flasks, bolts, spears, the chainsaw bar ...)
//      draws with its owned variant's silhouette at the table's level (an evolution reads its base's mastery rank)
//   2. shots: one-off shapes started by a wfire event (the knife swing, the nail burst, the nailstorm fan)
//   3. impacts: hit sparks shaped by class (slash, pierce, blunt, fire, chemical, electric); the bright flash takes a
//      P.Fx.flashGo('hit') slot (3 a second at most, none under Reduce flashing)
// Plus the hero cue (a halo round the ring that grows with the sum of owned weapon levels, drawn under the ring) and the held-weapon
// glow (FireAnim.drawHeld). Density: above caps.effects effects the player's alpha drops to caps.playerAlpha and secondary
// particles (trails, afterimages, extra sparks, motes) are culled. The sim never reads this file (tests enforce it).
P.WTier = (function () {
  var T = { enabled: true }, C = P.CFG.wtier, TAU = Math.PI * 2, shots = [], parts = [], hist = new WeakMap(), ages = new WeakMap(), lookCache = {};
  var st = T.stats = { spawned: 0, impacts: 0, flashes: 0, culled: 0, denseFrames: 0, frames: 0, maxParts: 0, peak: 0 };
  var impactsFrame = 0, dense = false, mod = null, nowS = 0;
  // Live lists: the P.Weapons.state key each variant draws from. DOWN lists count their timer down (progress 1 at the end).
  var LIVE = { blades: 'sawblade', manholes: 'manhole', torches: 'torch', hooks: 'olta', doors: 'cardoor', marbles: 'slingshot',
    spears: 'speargun', sprays: 'extinguisher', bolts: 'cable', slams: 'sledge', flasks: 'molotov', pools: 'molotov',
    rockets: 'fireworks', finale: 'fireworks' };
  // Lists whose entries carry no position of their own: drawn at the hero (their shapes read the hero and the target from the entry).
  var HERO_AT = { hooks: 1, doors: 1, sprays: 1, torches: 1 };
  var DOWN = { slams: 1, pools: 1 };
  var SHIELD_SPIN = 2.4;   // stormshield orbit, radians a second (a view clock: the sim keeps no orbit angle)

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function spec(id) { return id ? (C.weapons[id] || C.evos[id] || null) : null; }
  function baseOf(id) { return P.CFG.evolutions[id] ? P.CFG.evolutions[id].from : id; }
  function hexRgb(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(a, b, t) { return [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }); }
  // Three-stop ramp (steel -> simit gold -> white-hot, or the weapon's own) at t in 0..1, as 'r,g,b'.
  function rampRgb(r, t) {
    var a = hexRgb(r[0]), b = hexRgb(r[1]), c = hexRgb(r[2]);
    return (t < 0.5 ? mix(a, b, t * 2) : mix(b, c, (t - 0.5) * 2)).join(',');
  }

  // Owned level of an id: a base weapon uses its owned level; an evolution uses its base's mastery rank (at least 1, since an
  // evolution is one level in the sim and its wfire carries lv 1).
  function levelOf(s, id, evLv) {
    var h = s && s.hero, lv;
    if (C.evos[id]) lv = Math.max(1, s && P.Mastery && P.Mastery.runRank ? P.Mastery.runRank(s, baseOf(id)) : 0);
    else lv = (h && h.weapons && h.weapons[id]) || evLv || 1;
    return clamp(lv | 0, 1, C.levels);
  }
  // The table row for an id at a level: the numbers, the ramp colour and the silhouette id. Cached (plain values).
  function look(id, lv) {
    var key = id + '#' + lv, sp = spec(id), i, t;
    if (lookCache[key]) return lookCache[key];
    i = clamp(lv | 0, 1, C.levels) - 1; t = i / (C.levels - 1);
    return (lookCache[key] = { id: id, lv: i + 1, sil: sp.sil, cls: sp.cls, live: sp.live, life: sp.life, scale: sp.scale[i],
      count: sp.count[i], trail: sp.trail[i], glow: sp.glow[i], edge: sp.edge[i], after: sp.after[i], ring: sp.ring[i],
      col: rampRgb(sp.ramp, t), alpha: 1 });
  }
  T.look = look;
  T.levelOf = levelOf;
  T.spec = spec;

  // Frame modifiers: quality tier, Reduce motion, Reduce flashing and density, read once per frame.
  function modsNow() {
    var tier = P.Quality && P.Quality.tier ? P.Quality.tier | 0 : 0, rm = !!(P.Settings && P.Settings.reduceMotion), Q = C.quality, R = C.reduce;
    return { tier: tier, reduceMotion: rm, reduceFlash: !!(P.Settings && P.Settings.reduceFlash), dense: dense,
      trailOn: tier <= Q.trailsMaxTier && !dense, trailScale: rm ? R.trailScale : 1,
      afterOn: tier <= Q.afterMaxTier && !rm && !dense, countMul: rm ? R.countScale : 1,
      alpha: dense ? C.caps.playerAlpha : 1, secondary: !dense,
      partStep: P.Quality && P.Quality.partStep ? P.Quality.partStep() : 1 };
  }
  // The numbers a drawer uses: the table row after the frame modifiers (shared with the tests).
  function adjust(lk, m) {
    var o = {}, k;
    for (k in lk) o[k] = lk[k];
    o.trail = m.trailOn ? lk.trail * m.trailScale : 0;
    o.after = m.afterOn ? lk.after : 0;
    o.count = Math.max(1, Math.round(lk.count * m.countMul));
    o.edge = m.secondary ? Math.max(1, Math.round(lk.edge * m.countMul)) : 1;
    o.alpha = m.alpha;
    o.reduceFlash = m.reduceFlash;
    return o;
  }
  // Draw parameters for an id at a level under given modifiers (the tests compare level 1 with level 5 through this).
  T.params = function (id, lv, opts) {
    var m = Object.assign({ tier: 0, reduceMotion: false, reduceFlash: false, dense: false, trailOn: true, trailScale: 1,
      afterOn: true, countMul: 1, alpha: 1, secondary: true, partStep: 1 }, opts || {});
    if (opts && opts.reduceMotion) { m.trailScale = C.reduce.trailScale; m.countMul = C.reduce.countScale; m.afterOn = false; }
    return adjust(look(id, lv), m);
  };

  T.reset = function () { shots = []; parts = []; impactsFrame = 0; dense = false; mod = null; nowS = 0; };

  // ---------- events ----------
  // The half-width of a shot in radians: the owned level's arc (knife) or spread (nailstorm), else a default by class.
  function halfOf(s, id, sp) {
    var Lv = P.Weapons.level(s.hero, id), deg = Lv ? (Lv.arcDeg || Lv.spreadDeg || 0) : 0;
    return deg ? deg * Math.PI / 360 : (sp.cls === 'slash' ? 0.9 : 0.3);
  }
  // wfire for the one-off shapes (live 'shot' in the table). The owned variant names the shape; the level comes from the table.
  T.onWfire = function (ev, s) {
    if (!T.enabled) return;
    var id = ev.variant && spec(ev.variant) ? ev.variant : ev.w, sp = spec(id), lv, lk, Lv;
    if (!sp || sp.live !== 'shot') return;
    lv = levelOf(s, id, ev.lv);
    lk = look(id, lv);
    Lv = P.Weapons.level(s.hero, id);
    shots.push({ sil: lk.sil, lk: lk, E: { x: ev.x, y: ev.y, a: +ev.ang || 0, t: 0, T: lk.life, n: (ev.n | 0) || 1,
      half: halfOf(s, id, sp), range: Lv && Lv.range ? Lv.range : 1.3, seed: Math.random() * 1000, q: 0, age: 0, hist: [], hx: ev.x, hy: ev.y, src: null } });
    if (shots.length > C.caps.maxShots) shots.shift();
    st.spawned++;
  };

  // Impact sparks for one hit, shaped by the weapon's class. Primary = the class burst; secondary = the look's edge sparks.
  T.onHit = function (ev, s) {
    if (!T.enabled) return;
    var sp = spec(ev.src), cls = sp ? sp.cls : 'blunt', im = C.impact[cls], lv, lk, m, n, i, p;
    if (!im || impactsFrame >= C.caps.maxImpactsPerFrame) return;
    impactsFrame++;
    lv = sp ? levelOf(s, ev.src) : 1; lk = look(sp ? ev.src : 'knife', lv); m = mod || modsNow();
    if ((ev.crit || (ev.dmg || 0) >= C.flash.heavyDmg) && !m.reduceFlash && P.Fx && P.Fx.flashGo && P.Fx.flashGo('hit')) {
      parts.push({ k: 'flash', x: ev.x, y: ev.y, r: lk.glow * 1.6, t: 0.06, T: 0.06, col: lk.col });
      st.flashes++;
    }
    n = im.n + (m.secondary ? lk.edge : 0);
    for (i = 0; i < n; i++) {
      if (i >= im.n && m.partStep > 1 && i % m.partStep) continue;   // tiers 1 and 2: secondary sparks 1 in 2 or 3
      if (parts.length >= C.caps.maxParts) { st.culled++; break; }
      p = { k: 'imp', shape: im.shape, x: ev.x, y: ev.y, dx: ev.dx || 0, dy: ev.dy || 0, a: Math.random() * TAU,
        sp: im.speed * (0.5 + Math.random() * 0.5), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 20,
        seed: Math.random() * 1000, col: im.col, T: im.life * (0.7 + Math.random() * 0.3), t: 0 };
      p.t = p.T;
      parts.push(p);
    }
    if (m.secondary && lk.ring > 0) parts.push({ k: 'ring', x: ev.x, y: ev.y, r: lk.glow, t: 0.22, T: 0.22, col: lk.col });
    st.impacts++;
  };

  // ---------- per-frame state ----------
  // [key, entities] for each live list with entries. Enemy blades share the 'blades' list (they carry kind); hero blades carry lv.
  // The chainsaw bar is one object (W.rev, null when off); projectiles live on s.projs.
  function liveLists(s) {
    var W = P.Weapons.state(s), out = [], k;
    for (k in LIVE) if (W[k] && W[k].length) out.push([k, W[k].filter(function (e) { return !e.kind; })]);
    if (W.rev) out.push(['rev', [W.rev]]);
    if (s.projs && s.projs.length) out.push(['projs', s.projs]);
    return out;
  }
  function ageOf(e) { return ages.get(e) || 0; }
  // Progress 0..1 of a live entity: its own timer (DOWN lists count t down), else its age over its life, else half way.
  function progress(key, e) {
    if (e.T > 0) { var q = clamp(e.t / e.T, 0, 1); return DOWN[key] ? 1 - q : q; }
    if (e.life > 0) return clamp(ageOf(e) / e.life, 0, 1);
    return 0.5;
  }
  // Where a live entity is, in metres: its own position, the hero for the entries that have none, or along its flight.
  function anchorOf(key, e, q, h) {
    if (key === 'rev' || HERO_AT[key]) return { x: h.x, y: h.y };
    return P.WSil.prim.pos(e, q);
  }

  T.update = function (dt, s) {
    var i, p, fa = 0, fx = P.WFx && P.WFx.parts ? P.WFx.parts.length : 0, lists, total = 0, pool = P.FireAnim && P.FireAnim.pool || [];
    impactsFrame = 0; nowS += dt;
    for (i = shots.length - 1; i >= 0; i--) { shots[i].E.t += dt; if (shots[i].E.t >= shots[i].E.T) shots.splice(i, 1); }
    for (i = parts.length - 1; i >= 0; i--) { p = parts[i]; p.t -= dt; if (p.t <= 0) parts.splice(i, 1); }
    for (i = 0; i < pool.length; i++) if (pool[i].alive) fa++;
    lists = s ? liveLists(s) : [];
    lists.forEach(function (kv) { kv[1].forEach(function (e) { ages.set(e, ageOf(e) + dt); total++; }); });
    total += fx + fa + shots.length + parts.length;
    dense = total > C.caps.effects;
    mod = modsNow();
    st.frames++; if (dense) st.denseFrames++;
    st.maxParts = Math.max(st.maxParts, parts.length); st.peak = Math.max(st.peak, total);
    if (s && mod.trailOn) sampleTrails(lists, s.hero);
  };
  function sampleTrails(lists, h) {
    var n = C.caps.trailSamples;
    lists.forEach(function (kv) {
      if (kv[0] === 'rev') return;
      kv[1].forEach(function (e) {
        var hi = hist.get(e), p = anchorOf(kv[0], e, progress(kv[0], e), h);
        if (!hi) { hi = []; hist.set(e, hi); }
        hi.push({ x: p.x, y: p.y });
        if (hi.length > n) hi.shift();
      });
    });
  }

  // Hero-centred shapes: the chain blades (the owned chain, arc-chain or cyclone), the cleaver ring, the stormshield orbit.
  function heroShapes(s, now) {
    var h = s.hero, Wp = P.Weapons, out = [], lv, a, k, cid, rad;
    cid = Wp.variantOf(h, 'chain');
    if (h.weapons[cid] || h.weapons.chain) {
      lv = Wp.level(h, cid) || Wp.level(h, 'chain');
      if (lv) for (k = 0; k < lv.blades; k++) {
        a = (h.chainA || 0) + k * TAU / lv.blades;
        out.push({ id: cid, e: { x: h.x + Math.cos(a) * lv.radius, y: h.y + Math.sin(a) * lv.radius, a: a, rad: lv.radius,
          pullR: lv.pullR || 0, idx: k, n: lv.blades } });
      }
    }
    if (h.weapons.cleaver) {
      lv = Wp.level(h, 'cleaver');
      if (lv) out.push({ id: 'cleaver', e: { x: h.x, y: h.y, a: h.cleaA || 0, rad: lv.radius, idx: 0, n: 1 } });
    }
    if (h.weapons.stormshield) {
      lv = Wp.level(h, 'stormshield');
      rad = lv && lv.orbitR ? lv.orbitR : 1.1;
      out.push({ id: 'stormshield', e: { x: h.x, y: h.y, a: now * SHIELD_SPIN, rad: rad, idx: 0, n: 1 } });
    }
    return out;
  }

  // Draws one layer ('ground' before Arda, 'air' after) of every live entity and hero shape. A shape is drawn in the pass it belongs
  // to, or in both. The drawer gets E (the entity in metres, its progress and clock) and the adjusted row.
  function drawList(c, R, s, layer) {
    var h = s.hero, Wp = P.Weapons, out = [], m = mod || modsNow(), now = nowS;
    liveLists(s).forEach(function (kv) {
      var key = kv[0], list = kv[1], base = LIVE[key];
      list.forEach(function (e) {
        var id, sp, lk, sil, E, q, pos, lay, ok;
        if (key === 'projs') { id = e.id; ok = !!spec(id) && spec(id).live === 'projs'; }
        else if (key === 'rev') { id = Wp.variantOf(h, 'chainsaw'); ok = true; }
        else { id = Wp.variantOf(h, base); ok = !!spec(id) && spec(id).live === key; }
        if (!ok || (e.delay && e.t < e.delay)) return;
        sp = spec(id); lk = look(id, levelOf(s, id)); sil = P.WSil[lk.sil];
        if (!sil || !sp) return;
        lay = P.WSil.layer[lk.sil] || 'air';
        if (lay !== 'both' && lay !== layer) return;
        q = key === 'rev' ? 0.5 : progress(key, e);
        pos = anchorOf(key, e, q, h);
        E = { x: pos.x, y: pos.y, a: key === 'rev' ? +h.revAng || 0 : (e.a !== undefined ? +e.a : Math.atan2((e.y1 || 0) - (e.y0 || 0), (e.x1 || 0) - (e.x0 || 0))),
          q: q, t: e.t || 0, T: e.T || 0, age: ageOf(e), hist: hist.get(e) || [], seed: e.seed || 0, hx: h.x, hy: h.y, key: key,
          src: e, now: now, layer: layer, rad: 0, pullR: 0, half: 0, n: 1, idx: 0 };
        out.push([sil, E, lk]);
      });
    });
    heroShapes(s, now).forEach(function (hs) {
      var lk = look(hs.id, levelOf(s, hs.id)), sil = P.WSil[lk.sil], lay = P.WSil.layer[lk.sil] || 'air', e = hs.e;
      if (!sil || (lay !== 'both' && lay !== layer)) return;
      out.push([sil, { x: e.x, y: e.y, a: e.a, q: 0.5, t: 0, T: 0, age: now, hist: [], seed: 0, hx: h.x, hy: h.y, key: 'hero', src: null,
        now: now, layer: layer, rad: e.rad, pullR: e.pullR, half: 0, n: e.n, idx: e.idx }, lk]);
    });
    out.forEach(function (o) { o[0](c, R, o[1], adjust(o[2], m)); });
  }

  // One-off shots: their silhouette drawers, on the layer they belong to. The hero position is live, so a swing follows Arda.
  function drawShots(c, R, layer, s) {
    var m = mod || modsNow();
    shots.forEach(function (sh) {
      var sil = P.WSil[sh.sil], lay = P.WSil.layer[sh.sil] || 'air', E = sh.E;
      if (!sil || (lay !== 'both' && lay !== layer)) return;
      E.q = clamp(E.t / E.T, 0, 1); E.age = E.t; E.now = nowS; E.layer = layer;
      if (s && s.hero) { E.hx = s.hero.x; E.hy = s.hero.y; }
      sil(c, R, E, adjust(sh.lk, m));
    });
  }

  // Impact particles. Positions follow their age; the flash and the ring each have their own pass.
  function drawParts(c, R, layer) {
    parts.forEach(function (p) {
      var age = p.T - p.t, a = clamp(p.t / p.T, 0, 1), X, Y, ang, k, u = R.ppm;
      if (p.k === 'flash') {
        if (layer !== 'air') return;
        c.fillStyle = 'rgba(255,255,255,' + (0.45 * a).toFixed(3) + ')'; c.beginPath(); c.arc(R.X(p.x), R.Y(p.y), p.r * u, 0, TAU); c.fill();
        return;
      }
      if (p.k === 'ring') {
        if (layer !== 'ground') return;
        c.strokeStyle = 'rgba(' + p.col + ',' + (0.6 * a).toFixed(3) + ')'; c.lineWidth = 2 + 3 * a;
        c.beginPath(); c.ellipse(R.X(p.x), R.Y(p.y), p.r * u * (1.6 - a), p.r * u * 0.5 * (1.6 - a), 0, 0, TAU); c.stroke();
        return;
      }
      if (layer !== 'air') return;
      X = R.X(p.x); Y = R.Y(p.y);
      c.globalAlpha = a * (mod ? mod.alpha : 1);
      switch (p.shape) {
        case 'crescent': ang = -Math.atan2(p.dy, p.dx);
          c.strokeStyle = 'rgb(' + p.col + ')'; c.lineWidth = 2.2; c.lineCap = 'round';
          c.beginPath(); c.arc(X, Y, (0.18 + 0.4 * age) * u, ang - 0.7, ang + 0.7); c.stroke(); break;
        case 'spike': ang = -p.a;
          c.strokeStyle = 'rgb(' + p.col + ')'; c.lineWidth = 2; c.lineCap = 'round';
          c.beginPath(); c.moveTo(X, Y); c.lineTo(X + Math.cos(ang) * 0.22 * u * (1.2 - a), Y + Math.sin(ang) * 0.22 * u * (1.2 - a)); c.stroke(); break;
        case 'chip': k = 0.06 * u;
          X += Math.cos(p.a) * p.sp * age * u; Y += Math.sin(p.a) * p.sp * age * u - 2.2 * age * age * u;
          c.save(); c.translate(X, Y); c.rotate(p.rot + p.vr * age);
          c.fillStyle = 'rgb(' + p.col + ')'; c.fillRect(-k, -k * 0.5, 2 * k, k); c.restore(); break;
        case 'ember':
          X += Math.sin(p.seed + age * 9) * 0.05 * u; Y -= (0.2 + p.sp * 0.3) * age * u;
          c.fillStyle = 'rgb(' + p.col + ')'; c.beginPath(); c.arc(X, Y, (0.035 + 0.03 * a) * u, 0, TAU); c.fill(); break;
        case 'bubble': Y -= 0.25 * age * u;
          c.strokeStyle = 'rgb(' + p.col + ')'; c.lineWidth = 1.5;
          c.beginPath(); c.arc(X, Y, (0.05 + 0.08 * (1 - a)) * u, 0, TAU); c.stroke(); break;
        case 'zig':
          if (mod && mod.reduceFlash) break;
          c.strokeStyle = 'rgb(' + p.col + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(X, Y);
          c.lineTo(X + Math.cos(p.a) * 0.12 * u, Y + Math.sin(p.a) * 0.12 * u);
          c.lineTo(X + Math.cos(p.a + 1.2) * 0.22 * u, Y + Math.sin(p.a + 1.2) * 0.22 * u); c.stroke(); break;
        default:
          c.strokeStyle = 'rgb(' + p.col + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(X, Y);
          c.lineTo(X + Math.cos(p.a) * 0.15 * u, Y + Math.sin(p.a) * 0.15 * u); c.stroke();
      }
      c.globalAlpha = 1;
    });
  }

  // ---------- draw hooks (WFx2.drawGround / drawAir call these) ----------
  T.drawGround = function (R, s) {
    if (!T.enabled || !s) return;
    var c = R.ctx;
    c.save(); drawList(c, R, s, 'ground'); drawShots(c, R, 'ground', s); drawParts(c, R, 'ground'); c.restore();
  };
  T.drawAir = function (R, s) {
    if (!T.enabled || !s) return;
    var c = R.ctx;
    c.save(); c.globalCompositeOperation = 'lighter';
    drawList(c, R, s, 'air'); drawShots(c, R, 'air', s); drawParts(c, R, 'air');
    c.restore();
  };

  // Hero cue: a halo round the ring (radius rBase..rBase+rStep at most, so the ring stays clear), motes at high totals. f = the sum
  // of owned weapon levels over aura.full. A slow pulse; none under Reduce motion or Reduce flashing.
  T.auraFraction = function (s) {
    var h = s && s.hero, sum = 0, k;
    if (!h || !h.weapons) return 0;
    for (k in h.weapons) if (h.weapons[k]) sum += levelOf(s, k, h.weapons[k]);
    return clamp(sum / C.aura.full, 0, 1);
  };
  T.drawAura = function (R, s) {
    if (!T.enabled || !s || !s.hero) return;
    var A = C.aura, f = T.auraFraction(s), m = mod || modsNow(), c = R.ctx, t = nowS, u = R.ppm;
    if (f <= 0) return;
    var still = m.reduceMotion || m.reduceFlash, pulse = still ? 1 : 0.85 + 0.15 * Math.sin(t * TAU * A.pulseHz);
    var al = (A.alphaMin + (A.alphaMax - A.alphaMin) * f) * pulse * m.alpha, rr = (A.rBase + A.rStep * f) * u;
    var X = R.X(s.hero.x), Y = R.Y(s.hero.y - 0.25), col = rampRgb(['#DDE6F0', '#FFD166', '#FFFFFF'], f);
    var n = m.secondary ? Math.round(A.motesMax * f) : 0, rot = still ? 0 : t * 1.2, i, a, mx, my;
    c.save();
    c.strokeStyle = 'rgba(' + col + ',' + al.toFixed(3) + ')'; c.lineWidth = 2 + 2 * f; c.setLineDash([4, 6]);
    c.beginPath(); c.ellipse(X, Y, rr, rr * 0.4, 0, 0, TAU); c.stroke(); c.setLineDash([]);
    for (i = 0; i < n; i++) {
      a = rot + i * TAU / n; mx = X + Math.cos(a) * A.moteR * u; my = Y + Math.sin(a) * A.moteR * 0.4 * u;
      c.fillStyle = 'rgba(' + col + ',' + Math.min(1, al * 1.6).toFixed(3) + ')'; c.beginPath(); c.arc(mx, my, 0.035 * u, 0, TAU); c.fill();
    }
    c.restore();
  };

  // Held weapon: a small glow at the hand, brighter with the level (table glow x held.glowMul, in metres). G is FireAnim's geometry.
  T.heldGlow = function (F, G, id, s) {
    if (!T.enabled || !id || !spec(id) || !F.c || !F.R) return;
    var lv = levelOf(s, id), lk = look(id, lv), H = C.held, f = (lv - 1) / (C.levels - 1), m = mod || modsNow(), c = F.c, R = F.R;
    var X = R.X(G.hx + G.ca * 0.5), Y = R.Y(G.hy + G.sa * 0.5), rr = Math.max(0.05, lk.glow * H.glowMul) * R.ppm;
    var a = (H.alphaMin + (H.alphaMax - H.alphaMin) * f) * m.alpha, g = c.createRadialGradient(X, Y, 0, X, Y, rr);
    g.addColorStop(0, 'rgba(' + lk.col + ',' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + lk.col + ',0)');
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.beginPath(); c.arc(X, Y, rr, 0, TAU); c.fill(); c.restore();
  };

  // Test hooks: the counts the density rule reads, and a way to set density for a check.
  T.counts = function () { return { shots: shots.length, parts: parts.length, dense: dense }; };
  T.setDense = function (v) { dense = !!v; mod = modsNow(); };
  T.mods = modsNow;
  T.adjust = adjust;
  return T;
})();
