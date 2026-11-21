// Cold open (LD 4, shortened per AUDIT-2026-11-08 P0-3): about 28 s, letterboxed in-engine scene.
// S1 dinner -> S2 cook -> S4 news -> S5 diner turns -> S6 three rules -> S7 Arda grabs the döner knife: "ŞAK!" -> play.
// No manual input beat: the first thing the player does is move; the knife attacks on its own (matches the core loop).
P.ColdOpen = (function () {
  var C = {}, $ = function (id) { return document.getElementById(id); };
  var st = null;
  var BEATS = [
    { at: 0, id: 'S1' }, { at: 2.5, id: 'S2', line: 's2' }, { at: 6.5, id: 'S4', line: 's4' },
    { at: 13, id: 'S5', line: 's3' }, { at: 16.5, id: 'S6' }, { at: 23.5, id: 'S7' }, { at: 24.2, id: 'S8' },
  ];
  var NPC = { usta: { x: -3.7, y: -9.2 }, friend: { x: -7.2, y: -5.3 } };

  C.start = function (sim, onDone) {
    st = { sim: sim, t: 0, beat: -1, phase: 'timeline', onDone: onDone, outroT: 0, skipHold: 0, skipping: false, freeze: 0, grab: 0 };
    $('scr-cold').style.background = 'rgba(0,0,0,1)';
    ['comic', 'lettering'].forEach(function (id) { $(id).classList.add('hidden'); });
    $('comic').innerHTML = '';
    setSub(null);
    var skip = $('btn-skip');
    skip.onpointerdown = function (e) { e.stopPropagation(); if (st) st.skipping = true; };
    skip.onpointerup = skip.onpointerleave = skip.onpointercancel = function () { if (st) { st.skipping = false; st.skipHold = 0; } };
  };

  function setSub(id) {
    if (!id || !P.Settings.subs) { $('cold-speaker').textContent = ''; $('cold-text').textContent = ''; return; }
    var l = P.Dialogue.get(id) || { speaker: '', text: '' };
    $('cold-speaker').textContent = l.speaker + ':'; $('cold-text').textContent = l.text;
  }

  function diner() { return st.sim.enemies.filter(function (e) { return e.dinerIndex === 0; })[0]; }

  function strike() {
    st.phase = 'outro'; st.outroT = 0; st.freeze = P.CFG.feel.stabHitStop;
    $('lettering').classList.remove('hidden');
    P.Sfx.play('stab'); P.Sfx.play('swish'); P.Fx.punch(); P.Fx.addTrauma(0.35);
    var h = C.heroPoint(st.sim), d = diner(), target = d && C.dinerPoint(d);
    if (d) {
      var dx = target.x - h.x, dy = target.y - h.y, l = Math.hypot(dx, dy) || 1;
      P.Fx.onEvent({ type: 'swing', x: h.x, y: h.y, ax: dx / l, ay: dy / l, range: 1.8, arcDeg: 110, dir: 1 }, st.sim);
      d.flash = 0.08; d.x += dx / l * 0.9; d.y += dy / l * 0.9;
    }
    setSub(null);
  }

  function beat(b) {
    if (b.line) setSub(b.line); else setSub(null);
    if (b.id === 'S2') P.Sfx.play('click');
    if (b.id === 'S5') { var d = diner(); if (d) { d.state = 'turning'; d.stateT = 99; } P.Sfx.play('hurt'); }
    if (b.id === 'S6') comic();
    if (b.id === 'S7') { $('comic').classList.add('hidden'); st.grab = 0.01; setSub('barkGrab'); }
    if (b.id === 'S8') strike();
  }

  function comic() {
    var box = $('comic'), scene = st; box.innerHTML = ''; box.classList.remove('hidden');
    ['rule1', 'rule2', 'rule3'].forEach(function (id, i) {
      var p = memoryPanel(id, i); box.appendChild(p);
      p.dataset.showAt = String(16.55 + i * 2.2);
    });
  }

  function memoryPanel(id, index) {
    var panel = document.createElement('div'), caption = document.createElement('span');
    var art = P.ComicRaster;
    var actor = P.Story.forLine(id);
    panel.className = 'cold-memory'; caption.textContent = P.Dialogue.text(id);
    if (art && art.ready()) {
      var cv = document.createElement('canvas'); cv.width = 720; cv.height = 220; cv.setAttribute('aria-hidden', 'true');
      var c = cv.getContext('2d');
      art.scene(c, cv.width, cv.height, ['street', 'tram', 'istiklal'][index]);
      art.bust(c, actor.who, actor.mood || 'worried', index === 1 ? 542 : 142, 242, 231, { flip: index === 1 });
      panel.appendChild(cv);
    }
    panel.appendChild(caption);
    return panel;
  }

  C.finish = function (skipped) {
    if (!st) return;
    var done = st.onDone, t = st.t;
    var d = diner();
    if (d && d.state === 'turning') d.stateT = 0;
    $('lettering').classList.add('hidden'); $('comic').classList.add('hidden');
    st = null;
    done(skipped, t);
  };

  C.update = function (dt) {
    if (!st) return;
    if (st.skipping) {
      st.skipHold += dt;
      $('btn-skip').firstElementChild.style.width = Math.min(100, st.skipHold / 0.6 * 100) + '%';
      if (st.skipHold >= 0.6) { C.finish(true); return; }
    } else $('btn-skip').firstElementChild.style.width = '0%';
    if (st.freeze > 0) { st.freeze -= dt; return; }
    st.t += dt;
    $('comic').querySelectorAll('[data-show-at]').forEach(function (p) {
      if (st.t >= Number(p.dataset.showAt) && !p.classList.contains('in')) { p.classList.add('in'); P.Sfx.play('click'); }
    });
    if (st.grab > 0) st.grab = Math.min(1, st.grab + dt / 0.6);
    var bg = st.t < 1.5 ? 1 : st.t < 2.5 ? 2.5 - st.t : 0;
    $('scr-cold').style.background = 'rgba(0,0,0,' + bg.toFixed(3) + ')';
    if (st.phase === 'timeline') {
      while (st.beat + 1 < BEATS.length && st.t >= BEATS[st.beat + 1].at) { st.beat++; beat(BEATS[st.beat]); }
    } else if (st.phase === 'outro') {
      st.outroT += dt;
      if (st.outroT > 0.9) $('lettering').classList.add('hidden');
      if (st.outroT > 1.0 && st.outroT - dt <= 1.0) setSub('pardon');
      if (st.outroT >= 3.2) C.finish(false);
    }
  };

  C.active = function () { return !!st; };
  C.cancelHold = function () { if (st) { st.skipping = false; st.skipHold = 0; } };
  C.hasKnife = function () { return !st || st.grab >= .85; };
  C.drawHero = function (R,h) {
    if (!st) return false;
    var t=st.t, q=st.grab, strike=st.phase==='outro' && st.outroT<.45;
    if (t>=13 && q<.01 || st.phase==='outro' && !strike) return false;
    var i=strike?5:q>=.85?4:q>0?3:t<6.5?0:t<11.5?1:2;
    var im=P.StreetArt.image('opening-action-audit8'); if (!im) return false;
    var cw=im.naturalWidth/3,ch=im.naturalHeight/2,k=R.ppm*P.CFG.view.spriteScale.hero/(ch*.93);
    R.ctx.drawImage(im,i%3*cw,Math.floor(i/3)*ch,cw,ch,R.X(h.x)-cw*.5*k,R.Y(h.y-.25)-ch*.98*k,cw*k,ch*k);
    return true;
  };

  C.heroPoint = function (s) {
    if (!st || st.sim !== s) return s.hero;
    var h = s.hero, approach = Math.max(0, Math.min(1, (st.t - 13) / 3.5));
    var leave = st.phase === 'outro' ? Math.max(0, Math.min(1, (st.outroT - .6) / 2.6)) : 0;
    var q = approach * (1 - leave), out = Object.create(h);
    out.x = h.x + (-5.55 - h.x) * q; out.y = h.y + (-8.22 - h.y) * q;
    return out;
  };
  C.dinerPoint = function (e) {
    if (!st || e.dinerIndex !== 0 || st.t < 13) return e;
    var q = Math.max(0, Math.min(1, (st.t - 13.5) / 3)),K=P.CFG.experience.openingCast;
    var leave = st.phase === 'outro' ? Math.min(1, st.outroT / 2.8) : 0;
    var out=Object.create(e),b=K.dinerVia,d=K.dinerStand,first=Math.hypot(b.x-e.x,b.y-e.y),last=Math.hypot(d.x-b.x,d.y-b.y);
    var distance=q*(1-leave)*(first+last),from=distance<first?e:b,to=distance<first?b:d;
    var along=distance<first?distance/first:(distance-first)/last;
    out.x=from.x+(to.x-from.x)*along;out.y=from.y+(to.y-from.y)*along;
    out.walk=(q+leave)*(first+last);out.state=q>.05?'active':e.state;
    out.sceneMoving=q>0&&q<1||leave>0&&leave<1;
    out.flash = st.phase === 'outro' && st.outroT < P.CFG.feel.hitFlash ? e.flash : 0;
    return out;
  };
  C.heroOpts = function (s, o) {
    if (!st || st.sim !== s) return;
    var walking = st.t > 13 && st.t < 16.5 || st.phase === 'outro' && st.outroT > .6;
    o.still = !walking; o.phase = walking ? st.t * 4.2 : 0; o.gaitGain = .65;
    o.noArms = true; o.backHand = null; o.back = st.t > 13 && st.t < 24.2;
    var q = st.grab, strike = st.phase === 'outro' && st.outroT < .6;
    o.attackHand = 1;
    o.attackStance = q > 0 || strike ? { aim: strike ? Math.PI / 2 : -Math.PI / 2,
      arm: strike ? 'reach' : 'pull', hip: strike ? .14 : -.025, bend: .09,
      spread: .09, plant: .8, lean: strike ? .13 : .08, roll: 0, height: 0, depth: .04 } : null;
  };
  C.bystanderPoint = function () {
    var K=P.CFG.experience.openingCast,a=K.bystanderStart,b=K.bystanderVia,d=K.bystanderExit;
    var first=Math.hypot(b.x-a.x,b.y-a.y),last=Math.hypot(d.x-b.x,d.y-b.y);
    var distance=st&&st.phase==='outro'?Math.min(1,st.outroT/K.leaveT)*(first+last):0;
    var from=distance<first?a:b,to=distance<first?b:d,q=distance<first?distance/first:(distance-first)/last;
    return{x:from.x+(to.x-from.x)*q,y:from.y+(to.y-from.y)*q};
  };
  function patron(c,R,retreat,run) {
    if(!P.CivilianActing||!P.StreetArt.current())return false;
    var p=C.bystanderPoint(),column=run?2+Math.floor(st.outroT*8)%4:retreat?1:0;
    P.Sprites.shadow(c,R.X(p.x),R.Y(p.y),R.ppm*.85);
    return P.CivilianActing.restaurant(c,R.X(p.x),R.Y(p.y),R.ppm,1,2,column);
  }

  // Extra world drawing during the cold open: cook at the döner spit, friend, the knife waiting on the spit.
  C.draw = function (R) {
    if (!st) return;
    var c = R.ctx, u = R.ppm, run = st.phase === 'outro', sp = P.Sprites, room = P.RestaurantArt;
    var painted = room && room.illustrated, dn = painted ? room.LAYOUT.counter.knife : P.CFG.level.doner;
    var fx = run ? NPC.friend.x - Math.min(1.6, st.outroT * 1.2) : NPC.friend.x;
    var X = R.X(dn.x), Y = R.Y(dn.y);
    if (!painted) {
      c.fillStyle = '#7A3E1C'; c.strokeStyle = '#14151F'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(X - 0.22 * u, Y - 0.1 * u); c.lineTo(X + 0.22 * u, Y - 0.1 * u); c.lineTo(X + 0.14 * u, Y - 1.1 * u); c.lineTo(X - 0.14 * u, Y - 1.1 * u); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#B8C0CA'; c.lineWidth = 3; c.beginPath(); c.moveTo(X, Y); c.lineTo(X, Y - 1.3 * u); c.stroke();
    }
    if (st.grab === 0) {
      if (!painted) {
        c.fillStyle = '#E6EBF0'; c.strokeStyle = '#14151F'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(X + 0.25 * u, Y - 0.5 * u); c.lineTo(X + 0.7 * u, Y - 0.62 * u); c.lineTo(X + 0.25 * u, Y - 0.6 * u); c.closePath(); c.fill(); c.stroke();
      }
      c.strokeStyle = 'rgba(255,240,200,' + (0.4 + 0.4 * Math.sin(performance.now() / 120)) + ')'; c.lineWidth = 2;
      c.beginPath(); c.arc(X + 0.45 * u, Y - 0.56 * u, 0.3 * u, 0, Math.PI * 2); c.stroke();
    }
    if (st.grab > 0 && st.grab < .85 && R.heroGrips) {
      var hand = R.heroGrips.right, q = Math.min(1, st.grab / .85);
      var px = X + .45 * u + (hand.x - X - .45 * u) * q;
      var py = Y - .56 * u + (hand.y - Y + .56 * u) * q;
      sp.knifeAt(c, px, py, u * .7, st.phase === 'outro' ? -1.2 + Math.min(1, st.outroT / .24) * 1.6 : -.9);
    }
    var pu = sp.palette(2, false), pf = sp.palette(0, false);
    if (!(painted && P.CookFx && P.CookFx.bossBody(c, { bossPreset: 'cook', ai: { m: 'idle' } }, {}, R.X(-3.06), R.Y(-9.01), u * .57, -1))) {
      sp.person(c, R.X(NPC.usta.x), R.Y(NPC.usta.y), { u: u, face: 1, skin: pu.skin, shirt: '#F4EBDD', pants: '#3E3A35', hair: '#3B2A1E', arms: 'idle', still: true });
    }
    if (!patron(c, R, run || st.beat >= 3, run) && !painted) {
      sp.person(c, R.X(fx), R.Y(NPC.friend.y), { u: u, face: run ? -1 : 1, phase: st.outroT * 12, skin: pf.skin, shirt: '#3D8BFF', pants: '#2B3346', hair: '#1E1712', arms: run ? 'pump' : 'idle', still: !run });
    }
  };

  return C;
})();
