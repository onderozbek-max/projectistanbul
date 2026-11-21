// Persistent world markers plus one instruction near the hero. Sim distances and readiness own eligibility.
P.StreetInvitations = (function () {
  var I = {}, line, INK = '#14151F', CUE = {
    blast: ['flame', '#FFAB66', 'engage.blast'], breakable: ['breakable', '#F5DEA5', 'engage.break'],
    cartWeapon: ['wield', '#8DEBFF', 'engage.cartWeapon'],
    fuse: ['flame', '#FFC07E', 'engage.fuse'],
    foam: ['cross', '#BFE9FF', 'engage.foam'],
    heal: ['cross', '#92F2B0', 'engage.heal'], chest: ['star', '#FFDA7D', 'engage.chest'],
    healSpent: ['cross', '#C5CCD2', 'engage.healSpent'],
    healSaved: ['cross', '#D9DBCF', 'engage.healSaved'],
    coin: ['coin', '#FFDA7D', 'engage.coin'], crate: ['pin', '#9FDBFF', 'engage.crate'],
    atm: ['coin', '#FFDA7D', 'engage.atm'], cell: ['phone', '#9FDBFF', 'engage.cell'],
    shutter: ['door', '#9FDBFF', 'engage.shutter'], tram: ['tram', '#9FDBFF', 'engage.tram'],
    traffic: ['link', '#9FDBFF', 'engage.traffic'], car: ['flame', '#FFBE86', 'engage.car']
  };
  I.nearRing = function (h, z) { return Math.hypot(h.x - z.x, h.y - z.y) <= z.r + .8; };
  function marker(c, x, y, cue) {
    c.beginPath(); c.moveTo(x - 5, y + 7); c.lineTo(x, y + 15); c.lineTo(x + 5, y + 7); c.closePath();
    c.fillStyle = cue[1]; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
    c.beginPath(); c.arc(x, y, 11, 0, Math.PI * 2); c.fillStyle = INK; c.fill(); c.strokeStyle = cue[1]; c.stroke();
    P.ConsumablesIcons.draw(c, cue[0], x, y, 6.6, cue[1], INK);
  }
  function visible(R, sp) { return sp.x >= -4 && sp.x <= R.W + 4 && sp.y >= R.H * .19 && sp.y <= R.H * .89; }
  function propCue(p) { return p.bomb || !p.kind || p.kind === 'gascan' || p.kind === 'canister' ? 'blast' : p.kind === 'extinguisher' ? 'foam' : 'breakable'; }
  function props(s, fn) {
    var list = [];
    P.Combat.forEachProp(s, function (prop) { list.push(prop); });
    var candidate = s.env && !s.hero.streetHolding && P.StreetWeapon.candidate(s, 3);
    list.forEach(function (p) {
      if (!p.alive || p.gripAfter > s.t || Math.hypot(s.hero.x - p.x, s.hero.y - p.y) > 7.0) return;
      var tall = p.kind === 'lx_stall' || p.kind && p.kind.indexOf('cm_booth') === 0;
      if (P.StreetWeapon.eligible(s, p)) { if (p !== candidate) return; fn(p, 'cartWeapon', tall ? 1.52 : .65); }
      else if (p.fuseT > 0 || P.Combat.canInteractProp(s, p)) fn(p, propCue(p), tall ? 1.52 : .65);
    });
  }
  function propProgress(s, p) {
    var intent = s.propIntent;
    return intent && intent.prop === p ? intent.t / P.CFG.env.propIntent.hold : null;
  }
  function picks(R, s, consider) {
    var h = s.hero, ds = s.drops || [];
    ds.forEach(function (d) {
      if (d.mag || d.pop > 0) return;
      if (d.kind === 'chest') consider(d, 'chest', 3.4, 3, 1.30);
      else if (d.kind === 'simit') {
        var state = P.Consumables.healState(s, d);
        consider(d, state === 'saved' ? 'healSaved' : state === 'spent' ? 'healSpent' : 'heal',
          state === 'ready' ? 2.35 : 1.1, state === 'ready' ? 1 : -.5, .58);
      }
      else if (d.kind === 'jeton') consider(d, 'coin', 1.65, 0, .58);
    });
    (P.Objectives && P.Objectives.items ? P.Objectives.items(s) : []).forEach(function (d) {
      if (d.kind === 'crate' && !d.done) consider(d, 'crate', 3.25, 3, .62);
    });
  }
  I.target = function (R, s) {
    if (P.SceneFlow && P.SceneFlow.running(s)) return null;
    var h = s.hero, chosen;
    function consider(d, k, reach, priority, lift, dist) {
      var boss=s.gen&&s.gen.boss||s.dir.trialBoss,required=P.RouteMilestones&&P.RouteMilestones.target(s);
      var work=required&&Math.hypot(h.x-required[0],h.y-required[1])<3;
      var danger=boss&&!boss.dead&&boss.ai.m==='windup'||h.hp/h.maxHp<P.CFG.experience.health.critical;
      if((work||danger)&&['coin','chest','breakable','blast','foam','cartWeapon','healSaved'].indexOf(k)>=0)return;
      if(work&&d.state!=='active'&&['atm','traffic','car','cell','shutter'].indexOf(k)>=0&&Math.hypot(d.x-required[0],d.y-required[1])>d.r)return;
      if (dist == null) dist = Math.hypot(h.x - d.x, h.y - d.y);
      if (dist > reach) return;
      var sp = R.toScreen(d.x, d.y + lift), score = dist - priority;
      if (visible(R, sp) && (!chosen || score < chosen.score)) {
        chosen = { sp: sp, score: score, cue: CUE[k], fuse: k === 'fuse' ? d.fuseT : 0,
          progress: k === 'cartWeapon' ? P.StreetWeapon.progress(s, d) : d.state === 'active' ? d.prog : propProgress(s, d) };
      }
    }
    (s.hacks || []).forEach(function (z) {
      if (z.state !== 'done' && CUE[z.kind]) consider(z, z.kind, z.r + 1.0, z.state === 'active' ? 7 : 2, .8);
    });
    if (s.eczane && h.hp < h.maxHp) s.eczane.list.forEach(function (st) {
      if (!st.used) consider(st.b, 'heal', 2.4, 2, (st.b.w || 1.4) * 1.12 + .38, P.Eczane.touchDist(h, st.b));
    });
    props(s, function (p, key, lift) {
      if (p.fuseT > 0) consider(p, 'fuse', P.CFG.env.blast.r + .85, 9, lift);
      else if (key === 'cartWeapon') consider(p, key, 2.35, 2, lift);
      else consider(p, key, 1.65, -.55, lift, P.Combat.propGap(h, p));
    });
    picks(R, s, consider);
    return chosen || null;
  };
  I.draw = function (R, s) {
    if (P.SceneFlow && P.SceneFlow.running(s)) return;
    if (s.mode && s.mode !== 'play' || !s.hero || (P.BossDefeatFx && P.BossDefeatFx.running(s))) return;
    var c = R.ctx;
    c.save(); c.setTransform(R.dpr || 1, 0, 0, R.dpr || 1, 0, 0);
    (s.hacks || []).forEach(function (z) {
      if (z.state === 'done' || !CUE[z.kind]) return;
      if(Math.hypot(s.hero.x-z.x,s.hero.y-z.y)>z.r+1)return;
      var req=P.RouteMilestones&&P.RouteMilestones.target(s);
      if(req&&Math.hypot(s.hero.x-req[0],s.hero.y-req[1])<7&&z.state!=='active'&&Math.hypot(z.x-req[0],z.y-req[1])>z.r)return;
      var sp = R.toScreen(z.x, z.y + .80);
      if (visible(R, sp)) marker(c, Math.max(14, Math.min(R.W - 14, sp.x)), sp.y, CUE[z.kind]);
    });
    props(s, function (p, key, lift) {
      var sp = R.toScreen(p.x, p.y + lift);
      if (!visible(R, sp)) return;
      sp.x = Math.max(14, Math.min(R.W - 14, sp.x));
      marker(c, sp.x, sp.y, CUE[key]);
      var grab = key === 'cartWeapon' ? P.StreetWeapon.progress(s, p) : propProgress(s, p);
      if (grab) {
        c.beginPath(); c.arc(sp.x, sp.y, 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * grab);
        c.strokeStyle = CUE[key][1]; c.lineWidth = 3; c.stroke();
      }
      if (p.fuseT > 0) {
        c.beginPath(); c.arc(sp.x, sp.y, 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - p.fuseT / p.fuseMax));
        c.strokeStyle = '#FFAE69'; c.lineWidth = 2; c.stroke();
      }
    });
    if (line && line.slot) chip(c, line);
    c.restore();
  };

  function offer(R, s) {
    line = null;
    if (P.SceneFlow && P.SceneFlow.running(s)) return;
    if (s.mode !== 'play' || P.BossDefeatFx && P.BossDefeatFx.running(s)) return;
    var a = I.target(R, s), guide = P.RunGuide, required = guide && guide.required(s);
    var nearRequired = required && Math.hypot(s.hero.x - required.x, s.hero.y - required.y) < 4.5;
    if (!a || !a.fuse && (nearRequired || guide && guide.destination(s) ||
      P.Hints && P.Hints.current && P.Hints.current())) return;
    var msg = P.t(s.levelIndex > 30 || P.Modes.of(s) !== 'normal' ? a.cue[2] :
      { 'engage.break': 'engage.standBreak', 'engage.blast': 'engage.standBlast', 'engage.foam': 'engage.standFoam' }[a.cue[2]] || a.cue[2]);
    if (a.fuse) msg += ' · ' + a.fuse.toFixed(1).replace('.', P.lang === 'tr' ? ',' : '.') + P.t('engage.sec');
    if (a.progress !== null) msg += ' · ' + Math.floor(a.progress * 100) + '%';
    var c = R.ctx, font = '800 ' + (13 * ((P.Settings && P.Settings.textSize || 100) / 100)) + 'px "CM Comic Relief", "Comic Relief", "Comic Sans MS", sans-serif';
    c.save(); c.font = font;
    var w = Math.min(R.W - 20, Math.ceil(c.measureText(msg).width + 24));
    c.restore();
    line = { msg: msg, col: a.cue[1], font: font, slot: null };
    P.Speech.offer({ id: 'street-action', kind: a.fuse ? 'danger' : 'invitation', actionable: true,
      prio: a.fuse ? P.Speech.PRIO.danger : P.Speech.PRIO.invitation, w: w, h: 26, ax: a.sp.x, ay: a.sp.y, lift: 15,
      place: function (slot) { line.slot = slot; } });
  }

  function chip(c, a) {
    var s = a.slot;
    c.font = a.font;
    c.fillStyle = INK; c.strokeStyle = a.col; c.lineWidth = 1.5;
    c.beginPath(); c.roundRect(s.x, s.y, s.w, s.h, 7); c.fill(); c.stroke();
    c.fillStyle = '#FFF4DF'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(a.msg, s.x + s.w / 2, s.y + s.h / 2, s.w - 14);
  }

  if (P.Speech) P.Speech.provider(offer);
  return I;
})();
