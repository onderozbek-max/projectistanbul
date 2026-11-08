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
    var l = P.line(id);
    $('cold-speaker').textContent = l.speaker + ':'; $('cold-text').textContent = l.text;
  }

  function diner() { return st.sim.enemies.filter(function (e) { return e.dinerIndex === 0; })[0]; }

  function strike() {
    st.phase = 'outro'; st.outroT = 0; st.freeze = P.CFG.feel.stabHitStop;
    $('lettering').classList.remove('hidden');
    P.Sfx.play('stab'); P.Sfx.play('swish'); P.Fx.punch(); P.Fx.addTrauma(0.35);
    var h = st.sim.hero, d = diner();
    if (d) {
      var dx = d.x - h.x, dy = d.y - h.y, l = Math.hypot(dx, dy) || 1;
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
    var box = $('comic'); box.innerHTML = ''; box.classList.remove('hidden');
    ['rule1', 'rule2', 'rule3'].forEach(function (id, i) {
      var p = document.createElement('div'); p.textContent = P.line(id).text; box.appendChild(p);
      setTimeout(function () { if (!st) return; p.classList.add('in'); setSub(id); P.Sfx.play('click'); }, i * 2200 + 50);
    });
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
  C.hasKnife = function () { return !st || st.grab > 0; };

  // Extra world drawing during the cold open: cook at the döner spit, friend, the knife waiting on the spit.
  C.draw = function (R) {
    if (!st) return;
    var c = R.ctx, u = R.ppm, run = st.phase === 'outro', sp = P.Sprites, dn = P.CFG.level.doner;
    var fx = run ? NPC.friend.x - Math.min(1.6, st.outroT * 1.2) : NPC.friend.x;
    var X = R.X(dn.x), Y = R.Y(dn.y);
    c.fillStyle = '#7A3E1C'; c.strokeStyle = '#14151F'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(X - 0.22 * u, Y - 0.1 * u); c.lineTo(X + 0.22 * u, Y - 0.1 * u); c.lineTo(X + 0.14 * u, Y - 1.1 * u); c.lineTo(X - 0.14 * u, Y - 1.1 * u); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#B8C0CA'; c.lineWidth = 3; c.beginPath(); c.moveTo(X, Y); c.lineTo(X, Y - 1.3 * u); c.stroke();
    if (st.grab === 0) {
      c.fillStyle = '#E6EBF0'; c.strokeStyle = '#14151F'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(X + 0.25 * u, Y - 0.5 * u); c.lineTo(X + 0.7 * u, Y - 0.62 * u); c.lineTo(X + 0.25 * u, Y - 0.6 * u); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,240,200,' + (0.4 + 0.4 * Math.sin(performance.now() / 120)) + ')'; c.lineWidth = 2;
      c.beginPath(); c.arc(X + 0.45 * u, Y - 0.56 * u, 0.3 * u, 0, Math.PI * 2); c.stroke();
    }
    var pu = sp.palette(2, false), pf = sp.palette(0, false);
    sp.person(c, R.X(NPC.usta.x), R.Y(NPC.usta.y), { u: u, face: 1, skin: pu.skin, shirt: '#F4EBDD', pants: '#3E3A35', hair: '#3B2A1E', arms: 'idle', still: true });
    sp.person(c, R.X(fx), R.Y(NPC.friend.y), { u: u, face: run ? -1 : 1, phase: st.outroT * 12, skin: pf.skin, shirt: '#3D8BFF', pants: '#2B3346', hair: '#1E1712', arms: run ? 'pump' : 'idle', still: !run });
  };

  return C;
})();
