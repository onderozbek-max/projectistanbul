// Speech and overlay arbiter (view only). Every on-screen text bubble goes through P.Speech: Arda's barks, zombie
// groans, tutorial hints, story pops, banners, toasts, the legacy L1 bubbles and the call card. HUD controls (#hud,
// #skills, #subs) are obstacles, never covered.
// Per frame (R.frame, after the signs are drawn and before the bubbles): providers and banners offer candidates,
// then resolve(R, s) places the movable ones in a free slot (above / below / side, then a scan of the play band),
// never overlapping a fixed item, a control or another placed bubble, and calls cand.place(slot | null).
// Priority: tutorial 5 > story pop 4 (fixed) > banner, toast 3.5 > bark 3 > groan, cat '!' 2. A bubble with no slot
// waits (place(null)); barks give up after a short wait (barks.js). World labels (signs, event callouts) never move:
// label(key, rect) fades them while a bubble covers them.
// Audit: P.Speech.audit(seconds) lists the overlaps seen in the last N seconds (bubble vs bubble, bubble vs control).
P.Speech = (function () {
  var SP = {}, PAD = 6, PF_TOP = 170, BOTTOM = 16, W = 390, H = 844, WIN = 10, MAX_HIST = 2000;
  var PRIO = { danger: 8, tutorial: 5, pop: 4, invitation: 2, banner: 3.5, toast: 3.5, bark: 3, legacy: 3, groan: 2, cat: 2 };
  var CONTROLS = ['#hud', '#skills', '#subs', '.obj-row'];
  var offers = [], providers = [], placed = [], labels = {}, banners = [], hist = [], frames = [];
  var frameN = 0, lid = 0, stats = { placed: 0, waited: 0, dropped: 0 };
  SP.PRIO = PRIO;

  SP.offer = function (c) { if (c && c.kind) offers.push(c); };
  SP.provider = function (fn) { if (typeof fn === 'function') providers.push(fn); };
  SP.noteDrop = function () { stats.dropped++; };
  SP.reset = function () { offers = []; placed = []; labels = {}; banners = []; hist = []; frames = []; };

  // Screen box of a DOM element inside #phone (offset* ignore the phone's scale transform). Null when hidden.
  function domRect(sel) {
    if (typeof document === 'undefined') return null;
    var el = document.querySelector(sel);
    if (!el || !el.offsetWidth) return null;
    return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
  }
  SP.domRect = domRect;

  function warningHits(tg, h) {
    var x = h.x - tg.x, y = h.y - tg.y, reach;
    var margin = 0.85;
    if (tg.kind === 'lane') {
      var forward = x * tg.dx + y * tg.dy;
      reach = tg.w / 2 + margin;
      return forward >= -margin && forward <= tg.len + margin && Math.abs(x * tg.dy - y * tg.dx) <= reach;
    }
    reach = tg.r + margin;
    return x * x + y * y <= reach * reach;
  }
  SP.warningNear = function (s) {
    if (!s || !s.hero) return false;
    var ring = s.dir && s.dir.telegraphs, enemy = s.enemyTele, h = s.hero;
    function near(tg) { return warningHits(tg, h); }
    return !!((ring && ring.some(near)) || (enemy && enemy.some(near)) || bloaterWarnings(s).some(near));
  };

  function bloaterWarnings(s) {
    if (!P.Enemies || !P.Enemies.bloaterPressure(s)) return [];
    var b = P.CFG.enemies.bloater;
    return s.enemies.filter(function (e) {
      return e.type === 'bloater' && !e.boss && !e.dead && e.swell > 0;
    }).map(function (e) { return { x: e.x, y: e.y, r: e.mini ? b.mini.burstR : b.burstR }; });
  }

  function overlap(a, b, gap) {
    return a.x < b.x + b.w + gap && a.x + a.w + gap > b.x && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y;
  }
  function free(x, y, w, h, list) {
    var r = { x: x, y: y, w: w, h: h }, i;
    for (i = 0; i < list.length; i++) if (overlap(r, list[i], PAD)) return false;
    return true;
  }

  function protectFight(R, s, list) {
    if (!s || !s.hero || !R.toScreen) return;
    function add(x, y, w, h, kind) {
      if (x + w >= 0 && y + h >= 0 && x <= R.W && y <= R.H)
        list.push({ x: x, y: y, w: w, h: h, id: kind, kind: kind, bubble: false });
    }
    function centered(x, y, w, h, kind) { var p = R.toScreen(x, y); add(p.x - w / 2, p.y - h / 2, w, h, kind); }
    centered(s.hero.x, s.hero.y + .42, 62, 65, 'hero');
    var work=s.milestone&&s.milestone.work,k=s.companion;
    if(work&&work.active&&k){centered(k.x,k.y+.6,86,100,'companion-work');
      centered(s.milestone.pallet.x,s.milestone.pallet.y+.3,86,66,'pallet-work');}
    var boss = s.dir && s.dir.trialBoss || s.gen && s.gen.boss;
    if (boss && !boss.dead && (boss.windup || boss.exposed || boss.ai && boss.ai.m !== 'walk')) {
      var size = (R.ppm || 32.5) * (boss.r + .5);
      centered(boss.x, boss.y + .8, size * 2.6, size * 2, 'boss');
    }
    var goal = P.RunGuide && (P.RunGuide.destination(s) || P.RunGuide.required(s));
    if (goal) {
      var p = R.toScreen(goal.x, goal.y);
      var hud = domRect('#hud'), top = hud ? Math.max(180, hud.y + hud.h + 18) : 180;
      var x = Math.max(22, Math.min(R.W - 22, p.x)), y = Math.max(top, Math.min(R.H - 72, p.y));
      add(x - 25, y - 22, 50, 44, 'destination');
    }
    var warnings = (s.enemyTele || []).concat(s.dir && s.dir.telegraphs || [], bloaterWarnings(s)), u = R.ppm || 32.5;
    warnings.forEach(function (tg) {
      if (tg.kind === 'lane') {
        var a = R.toScreen(tg.x, tg.y), b = R.toScreen(tg.x + tg.dx * tg.len, tg.y + tg.dy * tg.len);
        var pad = tg.w * u / 2 + 8;
        add(Math.min(a.x,b.x) - pad, Math.min(a.y,b.y) - pad, Math.abs(a.x-b.x) + 2*pad, Math.abs(a.y-b.y) + 2*pad, 'warning');
      } else if (tg.r) {
        var size = tg.r * u * 2 + 14;
        centered(tg.x, tg.y, size, size, 'warning');
      }
    });
  }

  SP.clearBox = function (r, action) {
    return !placed.some(function (p) { return action && p.actionable || overlap(p, r, PAD); });
  };

  // Candidate slots for a movable item: beside its anchor first (above, below, sides, then higher or lower), then
  // a scan of the play band. The item it was in last frame is tried first (no jitter).
  function findSlot(c, list) {
    var cands = [], w = c.w, h = c.h, lim = H - BOTTOM - h, i, n, x, y, ax = c.ax, ay = c.ay, lift = c.lift == null ? 58 : c.lift;
    if (ax != null && ay != null) {
      cands.push(['above', ax - w / 2, ay - lift - h], ['below', ax - w / 2, ay + 14], ['right', ax + 18, ay - h / 2],
                 ['left', ax - 18 - w, ay - h / 2], ['above2', ax - w / 2, ay - lift - h - 70], ['below2', ax - w / 2, ay + 74]);
    }
    if (c.x != null && c.y != null) cands.push(['home', c.x, c.y]);
    for (y = PF_TOP; y <= lim; y += 10) cands.push(['scan-c', (W - w) / 2, y], ['scan-l', 8, y], ['scan-r', W - 8 - w, y]);
    if (c.prev) for (i = 0; i < cands.length; i++) if (cands[i][0] === c.prev) { cands.unshift(cands.splice(i, 1)[0]); break; }
    for (i = 0; i < cands.length; i++) {
      n = cands[i][0]; y = cands[i][2]; x = Math.max(8, Math.min(W - 8 - w, cands[i][1]));
      if (y < PF_TOP || y > lim) continue;
      if (free(x, y, w, h, list)) return { n: n, x: x, y: y, w: w, h: h, ax: ax, ay: ay };
    }
    return null;
  }

  // Tail target for a placed slot: the speaker's head (anchor) or the slot's own centre when there is no anchor.
  SP.tailTarget = function (slot, lift) {
    if (!slot) return null;
    var L = lift == null ? 58 : lift;
    if (slot.ax == null) return { tx: slot.x + slot.w / 2, ty: slot.y + slot.h / 2 };
    if (slot.n === 'above' || slot.n === 'above2') return { tx: slot.ax, ty: slot.ay - L + 10 };
    if (slot.n === 'below' || slot.n === 'below2') return { tx: slot.ax, ty: slot.ay - 14 };
    return { tx: slot.ax, ty: slot.ay - 30 };
  };

  function controls(list) {
    CONTROLS.forEach(function (sel) {
      var r = domRect(sel);
      if (r) list.push({ x: r.x, y: r.y, w: r.w, h: r.h, id: sel, kind: 'control', bubble: false, prio: 9 });
    });
  }

  function offerBanner(b, R) {
    var c = R.ctx, w = 200, h = 64, lbl = P.t(b.key);
    if (c && c.measureText) { c.save(); c.font = 'italic 900 52px "CM Bangers", Bangers, Impact, sans-serif'; w = c.measureText(lbl).width + 28; c.restore(); }
    offers.push({ id: b.id, kind: 'banner', prio: PRIO.banner, w: w, h: h, x: (R.W - w) / 2, y: (b.yFrac || 0.3) * R.H - h / 2,
                  age: b.T - b.t, prev: b.prev,
                  place: function (slot) { b.slot = slot ? (slot.y + h / 2) / R.H : null; b.prev = slot ? slot.n : null; } });
  }

  // One frame of arbitration. Fixed items keep their place; movable ones are sorted by priority, then age.
  SP.resolve = function (R, s) {
    var fixed = [], mov = [], i, c, slot, quiet, actionShown = false;
    frameN++;
    offers = [];
    if (P.SceneFlow && P.SceneFlow.running(s)) { placed=[]; return; }
    var boss=s.dir&&s.dir.trialBoss||s.gen&&s.gen.boss,combat=!!(boss&&!boss.dead);
    var work=s.milestone&&s.milestone.work,working=work&&work.finished<s.milestone.delivered;
    var departure=s.levelIndex===26&&s.loadout&&s.loadout.kaanJoined;
    providers.forEach(function (fn) { try { fn(R, s); } catch (e) { if (typeof console!=='undefined') console.error('speech_provider',e); } });
    banners.forEach(function (b) { offerBanner(b, R); });
    controls(fixed);
    protectFight(R, s, fixed);
    quiet = offers.length && (SP.warningNear(s) || offers.some(function (c) { return c.kind === 'tutorial'; }));
    for (i = 0; i < offers.length; i++) {
      c = offers[i];
      if(departure&&!c.important&&['banner','toast','pop'].indexOf(c.kind)>=0){if(c.place)c.place(null);continue;}
      if(combat&&['tutorial','bark','groan','banner','toast','pop'].indexOf(c.kind)>=0){if(c.place)c.place(null);continue;}
      if(working&&(['bark','groan','banner','toast'].indexOf(c.kind)>=0||c.kind==='pop'&&!c.important)){if(c.place)c.place(null);continue;}
      if (c.fixed) fixed.push({ x: c.rect.x, y: c.rect.y, w: c.rect.w, h: c.rect.h, id: c.id, kind: c.kind, bubble: true, prio: c.prio || 0 });
      else mov.push(c);
    }
    offers = [];
    placed = fixed;
    mov.sort(function (a, b) { return ((b.prio || 0) - (a.prio || 0)) || ((b.age || 0) - (a.age || 0)); });
    var onCall = s.levelIndex === 1 && s.dir && s.dir.call && s.dir.call.sub;
    for (i = 0; i < mov.length; i++) {
      c = mov[i];
      var aside = ['bark', 'groan', 'cat', 'legacy'].indexOf(c.kind) >= 0;
      var defer = onCall && aside || quiet && (aside || ['banner', 'toast', 'invitation'].indexOf(c.kind) >= 0);
      if (quiet && c.kind === 'pop' && !c.important) defer = true;
      slot = defer || c.actionable && actionShown ? null : findSlot(c, placed);
      if (slot) {
        actionShown = actionShown || c.actionable;
        placed.push({ x: slot.x, y: slot.y, w: c.w, h: c.h, id: c.id, kind: c.kind, bubble: true, prio: c.prio || 0, actionable: c.actionable });
        stats.placed++;
      }
      else stats.waited++;
      c.prev = slot ? slot.n : null;
      if (c.place) c.place(slot);
    }
    record(placed);
    prune();
  };

  function record(list) {
    var t = performance.now() / 1000, i, j, a, b;
    frames.push(t);
    for (i = 0; i < list.length; i++) for (j = i + 1; j < list.length; j++) {
      a = list[i]; b = list[j];
      if ((a.bubble || b.bubble) && overlap(a, b, 0)) hist.push({ t: t, a: a.id, ka: a.kind, b: b.id, kb: b.kind });
    }
    while (hist.length && hist[0].t < t - WIN) hist.shift();
    while (hist.length > MAX_HIST) hist.shift();
    while (frames.length && frames[0] < t - WIN) frames.shift();
  }
  function prune() {
    Object.keys(labels).forEach(function (k) { if (frameN - labels[k].seen > 120) delete labels[k]; });
  }

  // World label (sign, callout): returns its alpha. Fades toward 0.2 while a placed bubble covers its screen box.
  SP.label = function (key, x, y, w, h) {
    var L = labels[key] || (labels[key] = { a: 1, target: 1, seen: frameN }), i, o, cov = false;
    for (i = 0; i < placed.length && !cov; i++) {
      o = placed[i];
      cov = o.bubble && o.prio >= 2 && x < o.x + o.w && x + w > o.x && y < o.y + o.h && y + h > o.y;
    }
    L.target = cov ? 0.2 : 1; L.seen = frameN;
    return L.a;
  };
  SP.labelKey = function (o) { return o._lid || (o._lid = 'l' + (++lid)); };

  // Banners (milestone and mode lettering, screen space). Timers run in tick(); drawn at the slot the arbiter chose.
  SP.banner = function (key, T, yFrac, col) {
    var i, b = null;
    for (i = 0; i < banners.length; i++) if (banners[i].key === key) b = banners[i];
    if (!b) { b = { key: key, id: 'banner:' + key, t: T, T: T, yFrac: yFrac, col: col, slot: null, prev: null }; banners.push(b); }
    else { b.t = T; b.T = T; b.yFrac = yFrac; b.col = col; }
    return b;
  };
  SP.drawBanners = function (c, R) {
    banners.forEach(function (b) { if (b.slot != null && P.WFx && P.WFx.banner) P.WFx.banner(c, R, b.key, b.t, b.T, b.slot, b.col); });
  };

  // Plain bubbles (legacy L1 bark, cat '!'): wrap at maxW px, 14 px type, same box as the old world bubbles.
  SP.measurePlain = function (c, text, maxW) {
    c.font = '600 14px "CM Comic Relief", "Comic Relief", "Comic Sans MS", sans-serif';
    var words = text.split(' '), lines = [], cur = '', w;
    words.forEach(function (wd) { var t = cur ? cur + ' ' + wd : wd; if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = t; });
    lines.push(cur);
    w = Math.max.apply(null, lines.map(function (l) { return c.measureText(l).width; })) + 16;
    return { lines: lines, w: w, h: lines.length * 18 + 10 };
  };
  SP.drawPlain = function (c, r, lines) {
    c.save();
    c.fillStyle = '#FFFFFF'; c.strokeStyle = '#14151F'; c.lineWidth = 2;
    c.beginPath(); c.roundRect ? c.roundRect(r.x, r.y, r.w, r.h, 10) : c.rect(r.x, r.y, r.w, r.h); c.fill(); c.stroke();
    if (r.tx != null && r.ty != null) {
      var bx = Math.max(r.x + 6, Math.min(r.x + r.w - 6, r.tx)), by = r.ty >= r.y + r.h ? r.y + r.h : r.y;
      c.beginPath(); c.moveTo(bx - 6, by); c.lineTo(r.tx, r.ty); c.lineTo(bx + 6, by); c.closePath(); c.fill(); c.stroke();
    }
    c.fillStyle = '#14151F'; c.textAlign = 'center'; c.textBaseline = 'top'; c.font = '600 14px "CM Comic Relief", "Comic Relief", "Comic Sans MS", sans-serif';
    lines.forEach(function (l, i) { c.fillText(l, r.x + r.w / 2, r.y + 6 + i * 18); });
    c.restore();
  };

  // Dev audit: overlaps in the last `seconds` (default 10). Bubble-bubble and bubble-control pairs, plus the live DOM
  // boxes of the tutorial hint and the toast against every placed bubble.
  SP.audit = function (seconds) {
    var win = seconds || WIN, t = performance.now() / 1000, rows = hist.filter(function (h) { return h.t >= t - win; }), pairs = {}, dom = [];
    ['#prompt', '#toast'].forEach(function (sel) {
      var r = domRect(sel), id = sel.slice(1);
      if (!r) return;
      placed.forEach(function (o) { if (o.bubble && o.id !== id && overlap(r, o, 0)) dom.push({ t: t, a: id, ka: 'dom', b: o.id, kb: o.kind }); });
    });
    rows = rows.concat(dom);
    rows.forEach(function (h) { var k = h.a + ' x ' + h.b; pairs[k] = (pairs[k] || 0) + 1; });
    return { seconds: win, frames: frames.filter(function (f) { return f >= t - win; }).length, overlaps: rows.length, pairs: pairs,
             sample: rows.slice(-8), stats: { placed: stats.placed, waited: stats.waited, dropped: stats.dropped }, clean: rows.length === 0 };
  };

  SP.tick = function (dt) {
    var k;
    for (k in labels) labels[k].a += (labels[k].target - labels[k].a) * Math.min(1, dt * 8);
    banners.forEach(function (b) { b.t -= dt; });
    banners = banners.filter(function (b) { return b.t > 0; });
  };

  return SP;
})();
