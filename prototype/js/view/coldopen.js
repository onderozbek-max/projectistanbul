// Cold open (LD 4): letterboxed in-engine scene, S1-S10, TAP and SWIPE beats, hold-to-skip (0.6 s).
P.ColdOpen = (function () {
  var C = {}, $ = function (id) { return document.getElementById(id); };
  var st = null;
  var BEATS = [
    { at: 0, id: 'S1' }, { at: 6, id: 'S2', line: 's2' }, { at: 14, id: 'S3', line: 's3' }, { at: 22, id: 'S4', line: 's4' },
    { at: 30, id: 'S5' }, { at: 36, id: 'S6' }, { at: 42, id: 'S7' }, { at: 52, id: 'S8' },
  ];
  var NPC = { usta: { x: -3.7, y: -9.2 }, friend: { x: -7.2, y: -5.3 } };

  C.start = function (sim, onDone) {
    st = { sim: sim, t: 0, beat: -1, phase: 'timeline', onDone: onDone, swipeIdle: 0, outroT: 0, skipHold: 0, skipping: false, freeze: 0 };
    $('scr-cold').style.background = 'rgba(0,0,0,1)';
    ['comic', 'tap-fork', 'swipe-hint', 'lettering'].forEach(function (id) { $(id).classList.add('hidden'); });
    $('comic').innerHTML = '';
    setSub(null);
    $('tap-fork').onclick = function () { if (st && st.phase === 'tap') { P.Sfx.play('click'); toSwipe(); } };
    var skip = $('btn-skip');
    skip.onpointerdown = function (e) { e.stopPropagation(); if (st) st.skipping = true; };
    skip.onpointerup = skip.onpointerleave = skip.onpointercancel = function () { if (st) { st.skipping = false; st.skipHold = 0; } };
  };

  function setSub(id) {
    if (!id || !P.Settings.subs) { $('cold-speaker').textContent = ''; $('cold-text').textContent = ''; return; }
    var l = P.line(id);
    $('cold-speaker').textContent = l.speaker + ':'; $('cold-text').textContent = l.text;
  }

  function toSwipe() {
    st.phase = 'swipe'; st.swipeIdle = 0;
    $('tap-fork').classList.add('hidden'); $('swipe-hint').classList.remove('hidden');
    P.Input.onSwipe = function () { if (st && st.phase === 'swipe') stab(); };
    P.Input.onAnyTap = function () { if (st && st.phase === 'swipe' && st.swipeIdle >= 3) stab(); };
  }

  window.addEventListener('keydown', function (e) {
    if (!st || e.repeat) return;
    if (st.phase === 'tap' && (e.key === ' ' || e.key === 'Enter')) { P.Sfx.play('click'); toSwipe(); }
    else if (st.phase === 'swipe' && /^(arrow|[wasd ]|enter)/i.test(e.key)) stab();
  });

  function stab() {
    P.Input.onSwipe = null; P.Input.onAnyTap = null;
    st.phase = 'outro'; st.outroT = 0; st.freeze = P.CFG.feel.stabHitStop;
    $('swipe-hint').classList.add('hidden'); $('lettering').classList.remove('hidden');
    P.Sfx.play('stab'); P.Fx.punch(); P.Fx.addTrauma(0.25);
    var d = st.sim.enemies.filter(function (e) { return e.dinerIndex === 0; })[0];
    if (d) { d.flash = 0.06; d.x += 0.9; d.y += 0.6; }
    setSub(null);
  }

  function beat(b) {
    if (b.line) setSub(b.line); else setSub(null);
    if (b.id === 'S2') P.Sfx.play('click');
    if (b.id === 'S5') { var d = st.sim.enemies.filter(function (e) { return e.dinerIndex === 0; })[0]; if (d) { d.state = 'turning'; d.stateT = 99; } }
    if (b.id === 'S7') comic();
    if (b.id === 'S8') { $('comic').classList.add('hidden'); st.phase = 'tap'; $('tap-fork').classList.remove('hidden'); }
  }

  function comic() {
    var box = $('comic'); box.innerHTML = ''; box.classList.remove('hidden');
    ['rule1', 'rule2', 'rule3'].forEach(function (id, i) {
      var p = document.createElement('div'); p.textContent = P.line(id).text; box.appendChild(p);
      setTimeout(function () { p.classList.add('in'); if (st) setSub(id); }, i * 3000 + 50);
    });
  }

  C.finish = function (skipped) {
    if (!st) return;
    var done = st.onDone, t = st.t;
    P.Input.onSwipe = null; P.Input.onAnyTap = null;
    var d = st.sim.enemies.filter(function (e) { return e.dinerIndex === 0; })[0];
    if (d && d.state === 'turning') d.stateT = 0;
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
    var bg = st.t < 5 ? 1 : st.t < 6 ? 6 - st.t : 0;
    $('scr-cold').style.background = 'rgba(0,0,0,' + bg.toFixed(3) + ')';
    if (st.phase === 'timeline') {
      while (st.beat + 1 < BEATS.length && st.t >= BEATS[st.beat + 1].at) { st.beat++; beat(BEATS[st.beat]); }
    } else if (st.phase === 'swipe') {
      st.swipeIdle += dt;
      if (st.swipeIdle >= 3) $('swipe-hint').textContent = '⟵ ⟶ ⟵';
    } else if (st.phase === 'outro') {
      st.outroT += dt;
      if (st.outroT > 0.8) $('lettering').classList.add('hidden');
      if (st.outroT > 1.2 && st.outroT - dt <= 1.2) setSub('pardon');
      if (st.outroT >= 6) C.finish(false);
    }
  };

  C.active = function () { return !!st; };

  // Extra world drawing during the cold open: cook, friend, the TV glow on Arda.
  C.draw = function (R) {
    if (!st) return;
    var run = st.phase !== 'timeline' && st.phase !== 'tap';
    var fx = run ? NPC.friend.x - Math.min(1.6, (st.outroT || 0) * 1.2) : NPC.friend.x;
    R.circle(NPC.usta.x, NPC.usta.y, 0.37, '#F4EBDD', '#14151F', 2);
    R.circle(NPC.usta.x, NPC.usta.y + 0.42, 0.22, '#C9A27E', '#14151F', 2);
    R.circle(fx, NPC.friend.y, 0.37, '#3D8BFF', '#14151F', 2);
    R.circle(fx, NPC.friend.y + 0.42, 0.22, '#C9A27E', '#14151F', 2);
  };

  return C;
})();
