// Menu screens: level-up cards (05), pause (07), settings (16 subset), down (09), results (08), title (01).
P.Screens = (function () {
  var S = {}, $ = function (id) { return document.getElementById(id); };
  var ICON = { fork: '#3A3A3A', tea: '#B5651D', sneakers: '#3D8BFF', ayran: '#8A8F98', butter: '#E9A23B', simit: '#C98A3A', jeton: '#E9A23B' };
  var ALL = ['scr-title', 'scr-cold', 'scr-cards', 'scr-pause', 'scr-settings', 'scr-down', 'scr-slam', 'scr-results'];

  S.show = function (id) { ALL.forEach(function (x) { $(x).classList.toggle('hidden', x !== id); }); };
  S.hideAll = function () { S.show(null); };

  function iconBox(item, cls) {
    var d = document.createElement('div');
    d.className = cls; d.style.background = ICON[item] || '#6E6E6E';
    d.textContent = P.t('icon.' + item);
    return d;
  }

  function pips(cur, next) {
    var w = document.createElement('div'); w.className = 'pips';
    w.setAttribute('aria-label', 'Level ' + next + ' / 5');
    for (var i = 1; i <= 5; i++) { var p = document.createElement('i'); if (i <= cur) p.className = 'on'; else if (i === next) p.className = 'next'; w.appendChild(p); }
    return w;
  }

  S.buildSlots = function (s, container, split) {
    container.innerHTML = '';
    var h = s.hero, add = function (item, lv) {
      var d = document.createElement('div'); d.className = 'slot' + (item ? ' filled' : '');
      if (item) { d.textContent = P.t('icon.' + item); var sm = document.createElement('small'); sm.textContent = 'L' + lv; d.appendChild(sm); }
      container.appendChild(d);
    };
    var ws = Object.keys(h.weapons), ps = Object.keys(h.passives);
    if (split) {
      for (var i = 0; i < 6; i++) add(ws[i], h.weapons[ws[i]]);
      for (var j = 0; j < 6; j++) add(ps[j], h.passives[ps[j]]);
    } else {
      ws.concat(ps).slice(0, 6).forEach(function (k) { add(k, h.weapons[k] || h.passives[k]); });
      for (var k = ws.length + ps.length; k < 6; k++) add(null);
    }
  };

  S.showCards = function (s, offer, onPick, onReroll) {
    $('cards-sub').textContent = P.t('ui.cards.sub', { n: s.level });
    $('cards-tut').classList.toggle('hidden', !offer.scripted);
    var box = $('cards'); box.innerHTML = '';
    offer.cards.forEach(function (c, i) {
      var b = document.createElement('button'); b.className = 'card' + (offer.scripted && i === 0 ? ' highlight' : '');
      if (c.next === 1 && c.id[0] !== 'f') { var bd = document.createElement('span'); bd.className = 'badge'; bd.textContent = P.t('ui.cards.new'); b.appendChild(bd); }
      b.appendChild(iconBox(c.item, 'icon'));
      var nm = document.createElement('div'); nm.className = 'name'; nm.textContent = P.t('item.' + c.item); b.appendChild(nm);
      if (c.id[0] !== 'f') b.appendChild(pips(c.next - 1, c.next));
      var ds = document.createElement('div'); ds.className = 'desc'; ds.textContent = P.Progression.describe(c); b.appendChild(ds);
      b.addEventListener('click', function () {
        if (box.dataset.locked) return;
        box.dataset.locked = '1'; b.classList.add('picked'); P.Sfx.play('click');
        setTimeout(function () { delete box.dataset.locked; onPick(c); }, P.Settings.reduceMotion ? 0 : 250);
      });
      box.appendChild(b);
    });
    var rr = $('btn-reroll');
    rr.textContent = P.t('ui.cards.reroll', { n: s.rerolls });
    rr.disabled = s.rerolls <= 0 || offer.scripted;
    rr.onclick = onReroll;
    var ad = $('btn-reroll-ad');
    ad.innerHTML = ''; ad.appendChild(document.createTextNode(P.t('ui.cards.rerollAd')));
    var tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = P.t('ui.cards.ad'); ad.appendChild(tag);
    ad.title = P.t('ui.res.notInProto');
    var bp = $('cards-build'); bp.innerHTML = '';
    var cap = document.createElement('p'); cap.className = 'caption';
    cap.textContent = P.t('ui.cards.build', { w: Object.keys(s.hero.weapons).length, p: Object.keys(s.hero.passives).length });
    var slots = document.createElement('div'); slots.className = 'slots';
    bp.appendChild(cap); bp.appendChild(slots); S.buildSlots(s, slots, true);
    S.show('scr-cards');
  };

  S.showPause = function (s) {
    $('pause-level').textContent = P.t('ui.pause.level', { t: P.UI.fmt(s.runT) });
    S.buildSlots(s, $('pause-build'), false);
    S.show('scr-pause');
  };

  S.showSettings = function (onBack, onChange) {
    var list = $('settings-list'); list.innerHTML = '';
    function row(label, el) { var r = document.createElement('div'); r.className = 'kv'; var l = document.createElement('span'); l.textContent = label; r.appendChild(l); r.appendChild(el); list.appendChild(r); }
    function toggle(key) {
      var b = document.createElement('button'); b.className = 'toggle' + (P.Settings[key] ? ' on' : '');
      b.textContent = P.t(P.Settings[key] ? 'ui.set.on' : 'ui.set.off');
      b.setAttribute('aria-pressed', String(!!P.Settings[key]));
      b.onclick = function () { P.Settings[key] = !P.Settings[key]; P.saveSettings(); onChange(); S.showSettings(onBack, onChange); };
      return b;
    }
    var lang = document.createElement('button'); lang.className = 'toggle on'; lang.textContent = P.lang === 'tr' ? 'TR' : 'EN';
    lang.onclick = function () { P.lang = P.Settings.lang = P.lang === 'tr' ? 'en' : 'tr'; P.saveSettings(); onChange(); S.showSettings(onBack, onChange); };
    row(P.t('ui.set.lang'), lang);
    row(P.t('ui.set.sound'), toggle('sound'));
    row(P.t('ui.set.subs'), toggle('subs'));
    row(P.t('ui.set.reduceMotion'), toggle('reduceMotion'));
    row(P.t('ui.set.dmgNumbers'), toggle('dmgNumbers'));
    $('btn-settings-back').onclick = onBack;
    S.show('scr-settings');
  };

  S.showDown = function (s, keepJeton, handlers) {
    $('down-survived').textContent = P.t('ui.down.survived', { t: P.UI.fmt(s.runT) });
    var cause = s.deathCause || 'walker';
    var ic = $('down-icon'); ic.textContent = P.upper(P.t('cause.' + cause)).slice(0, 6);
    $('down-cause').textContent = P.t('cause.' + cause);
    $('down-tip').textContent = P.t('tip.' + cause);
    function label(btn, key, tag) {
      btn.innerHTML = ''; btn.appendChild(document.createTextNode(P.t(key)));
      var t = document.createElement('span'); t.className = 'tag'; t.textContent = tag; btn.appendChild(t);
    }
    label($('btn-revive-ad'), 'ui.down.reviveAd', P.t('ui.cards.ad') + ' · ' + P.t('ui.down.stub'));
    label($('btn-revive-gold'), 'ui.down.reviveGold', P.t('ui.down.stub'));
    $('btn-revive-ad').disabled = $('btn-revive-gold').disabled = s.reviveUsed;
    $('btn-revive-ad').onclick = function () { handlers.revive('ad'); };
    $('btn-revive-gold').onclick = function () { handlers.revive('gold'); };
    $('btn-giveup').textContent = P.t('ui.down.giveUp', { n: keepJeton });
    $('btn-giveup').onclick = handlers.giveUp;
    S.show('scr-down');
  };

  function star(size, on) {
    var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', size); svg.setAttribute('height', size); svg.setAttribute('viewBox', '0 0 24 24');
    var p = document.createElementNS(ns, 'polygon');
    p.setAttribute('points', '12,1.5 15,9 23,9 16.5,14 19,22.5 12,17.5 5,22.5 7.5,14 1,9 9,9');
    p.setAttribute('fill', on ? '#E9A23B' : '#DEDEDE'); p.setAttribute('stroke', '#14151F'); p.setAttribute('stroke-width', '1.2');
    svg.appendChild(p); return svg;
  }

  S.showResults = function (r) {
    $('res-title').textContent = P.t(r.win ? 'ui.res.clear' : 'ui.res.fail');
    var st = $('res-stars'); st.innerHTML = '';
    [48, 56, 48].forEach(function (sz, i) {
      var sv = star(sz, r.stars[i]); st.appendChild(sv);
      setTimeout(function () { sv.classList.add('in'); }, P.Settings.reduceMotion ? 0 : 250 + i * 300);
    });
    var crit = $('res-criteria'); crit.innerHTML = '';
    [['ui.res.starClear', r.stars[0]], ['ui.res.starNoRevive', r.stars[1]], ['ui.res.starHp', r.stars[2]]].forEach(function (c, i) {
      var sp = document.createElement(c[1] ? 'span' : 's'); sp.textContent = P.t(c[0]);
      crit.appendChild(sp);
      if (i === 2 && !c[1] && r.win) crit.appendChild(document.createTextNode(' ' + P.t('ui.res.endedAt', { n: r.hpPct })));
      if (i < 2) crit.appendChild(document.createTextNode(' · '));
    });
    var rw = $('res-rewards'); rw.innerHTML = '';
    function kv(parent, k, v) { var d = document.createElement('div'); d.className = 'kv'; var a = document.createElement('span'); a.textContent = k; var b = document.createElement('span'); b.textContent = v; d.appendChild(a); d.appendChild(b); parent.appendChild(d); }
    kv(rw, P.t('ui.res.jeton'), '+' + r.jeton + ' ' + (r.firstClear ? P.t('ui.res.firstClear') : r.win ? '' : P.t('ui.res.partial')));
    if (r.win) kv(rw, P.t('ui.res.hurda'), '+' + r.hurda);
    kv(rw, P.t('ui.res.kills'), String(r.kills));
    if (r.firstClear) kv(rw, P.t('ui.res.gear'), P.t('ui.res.commonGear'));
    var rn = $('res-run'); rn.innerHTML = '';
    kv(rn, P.t('ui.res.time'), P.UI.fmt(r.time));
    kv(rn, P.t('ui.res.runLevel'), String(r.level));
    if (r.win) kv(rn, 'İstanbul', P.t('ui.res.progress'));
    var db = $('btn-double'); db.innerHTML = ''; db.appendChild(document.createTextNode(P.t('ui.res.double')));
    var tg = document.createElement('span'); tg.className = 'tag'; tg.textContent = P.t('ui.cards.ad') + ' · ' + P.t('ui.res.notInProto'); db.appendChild(tg);
    db.classList.toggle('hidden', !r.win);
    S.show('scr-results');
  };

  S.drawKeyArt = function (canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = 358, h = 472, c = canvas.getContext('2d');
    canvas.width = w * dpr; canvas.height = h * dpr; c.scale(dpr, dpr);
    var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1B4965'); g.addColorStop(0.55, '#B5651D'); g.addColorStop(1, '#14151F');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#14151F';
    for (var x = 0; x < w; x += 46) { var bh = 150 + ((x * 37) % 90); c.fillRect(x, h - bh - 120, 44, bh); }
    c.fillStyle = 'rgba(233,162,59,0.7)';
    for (var y = 0; y < 6; y++) for (var x2 = 6; x2 < w; x2 += 46) if ((x2 + y * 3) % 4) c.fillRect(x2 + 6, h - 250 + y * 22, 8, 10);
    c.fillStyle = '#8A8F98'; c.fillRect(0, h - 120, w, 120);
    c.fillStyle = '#C0392B'; c.fillRect(214, h - 205, 120, 70); c.fillStyle = '#F4EBDD'; c.fillRect(222, h - 196, 104, 22);
    c.fillStyle = '#14151F'; c.fillRect(214, h - 140, 120, 6);
    for (var i = 0; i < 26; i++) {
      var zx = (i * 53) % w, zy = h - 110 + (i * 29) % 90;
      c.fillStyle = '#4E5A44'; c.strokeStyle = '#20251C'; c.lineWidth = 2;
      c.beginPath(); c.arc(zx, zy, 9, 0, Math.PI * 2); c.fill(); c.stroke();
    }
    c.strokeStyle = '#3DDCFF'; c.lineWidth = 3.5; c.beginPath(); c.ellipse(179, h - 52, 24, 10, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#D7263D'; c.strokeStyle = '#14151F'; c.lineWidth = 3; c.beginPath(); c.arc(179, h - 62, 13, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = '#F4EBDD'; c.beginPath(); c.arc(179, h - 78, 8, 0, Math.PI * 2); c.fill(); c.stroke();
  };

  return S;
})();
