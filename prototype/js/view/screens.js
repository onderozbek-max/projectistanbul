// Menu screens: level-up cards (05), pause (07), settings (16 subset), down (09), results (08), title (01).
P.Screens = (function () {
  var S = {}, $ = function (id) { return document.getElementById(id); };
  var ALL = ['scr-title', 'scr-cold', 'scr-cards', 'scr-chest', 'scr-pause', 'scr-settings', 'scr-down', 'scr-slam', 'scr-results'];

  // Overlays take the HUD, the dash and nazar buttons and the subtitle layer off screen while they are up (AUDIT-6 F1).
  var OVERLAYS = ['scr-cards', 'scr-chest', 'scr-pause', 'scr-settings', 'scr-down'];
  S.show = function (id) {
    ALL.forEach(function (x) { $(x).classList.toggle('hidden', x !== id); });
    if (P.UI && P.UI.setOverlay) P.UI.setOverlay(OVERLAYS.indexOf(id) >= 0);
  };
  S.hideAll = function () { S.show(null); };
  // Dev export is for the team: ?debug=1 or the devTools setting. Players never see it (AUDIT-6 F3).
  S.devTools = function () { return !!P.Settings.devTools || /[?&]debug=1(&|$)/.test(location.search); };
  // The share of Jeton that survives a give-up or a quit (config: rewards.loseKeep), as a whole percent.
  S.keepPct = function () { return Math.round(P.CFG.rewards.loseKeep * 100); };

  function iconBox(item, cls) {
    var d = document.createElement('div');
    d.className = cls + ' kind-' + (P.Progression.isWeapon(item) ? 'w' : (item === 'simit' || item === 'jeton') ? 'f' : 'p');
    d.innerHTML = P.Icons.svg(item, cls === 'icon' ? 40 : 30);
    return d;
  }

  function pips(cur, next) {
    var w = document.createElement('div'); w.className = 'pips';
    w.setAttribute('aria-label', 'Level ' + next + ' / 5');
    for (var i = 1; i <= 5; i++) { var p = document.createElement('i'); if (i <= cur) p.className = 'on'; else if (i === next) p.className = 'next'; w.appendChild(p); }
    return w;
  }

  // ---------- weapon depth (v0.5 A): mastery chips, mod chips, fork rows, card builders ----------
  function mk(tag, cls, text) {
    var e = document.createElement(tag); e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  // Mods and mastery belong to the base family: an evolved weapon reads its base's entry (evolved[base] = evoId).
  function famOf(s, item, evo) {
    if (evo) return evo;
    var ev = s.hero.evolved || {};
    for (var k in ev) if (ev[k] === item) return k;
    return item;
  }
  function modChip(id, cls) {
    var m = mk('span', cls || 'chip mod-chip', P.t('mod.' + id));
    m.title = P.t('moddesc.' + id);
    return m;
  }
  // Mastery chip (e.g. "Usta III") for a weapon whose family has run rank > 0; null otherwise.
  function masteryChip(s, item, evo, cls) {
    if (!P.Progression.isWeapon(item)) return null;
    var B = P.Mastery.bonus(s, famOf(s, item, evo));
    if (B.rank <= 0) return null;
    var c = mk('span', cls || 'chip mastery');
    c.innerHTML = P.Icons.svg('mastery', 12);
    c.appendChild(document.createTextNode(P.t('mastery.chip', { rank: P.Mastery.roman(B.rank) })));
    c.title = P.t('mastery.bonus', { dmg: '+' + Math.round((B.dmg - 1) * 100) + '%', cd: '-' + Math.round((1 - B.cd) * 100) + '%' });
    return c;
  }
  // Weapon slot tags: mastery chip plus one chip per picked mod. Null when there is nothing to show.
  function slotTags(s, item) {
    if (!P.Progression.isWeapon(item)) return null;
    var t = mk('div', 'slot-tags'), mc = masteryChip(s, item, null, 'chip small mastery');
    if (mc) t.appendChild(mc);
    ((s.hero.mods || {})[famOf(s, item, null)] || []).forEach(function (id) { t.appendChild(modChip(id, 'chip small mod-chip')); });
    return t.childNodes.length ? t : null;
  }
  // Stat rows (name, from -> to) into el; shared by the level-up cards and the chest reveal.
  function fillStats(el, lines) {
    el.innerHTML = '';
    lines.forEach(function (l) {
      var r = document.createElement('span'); r.className = 'stat';
      r.innerHTML = '<em></em>' + (l.a !== null ? '<s></s><i>→</i>' : '') + '<b></b>';
      r.querySelector('em').textContent = P.t(l.k);
      if (l.a !== null) r.querySelector('s').textContent = l.a;
      r.querySelector('b').textContent = l.b;
      el.appendChild(r);
    });
    return el;
  }
  // Chest reveal tags (inside #chest-info, shown after the open beat): mastery chip, MOD badge, chosen mod.
  function chestTags(s, card, info) {
    var t = info.querySelector('.chest-tags');
    if (!t) { t = mk('div', 'chest-tags'); info.appendChild(t); }
    t.innerHTML = '';
    var mc = masteryChip(s, card.item, card.evo); if (mc) t.appendChild(mc);
    if (card.fork) t.appendChild(mk('span', 'badge mod', P.t('card.mod')));
    var pick = card.mods && card.mods[card.pick || 0];
    if (pick) t.appendChild(modChip(pick, 'chip mod-chip chosen'));
  }
  // Card offer state (AUDIT-7 U3, CR-3). gen counts offers on screen; curOffer is the one on screen; Reroll is refused
  // while a pick beat runs. A pick hands onPick the card looked up by id in curOffer, and a pick whose offer was replaced
  // during the beat is dropped (no stale card is applied after a reroll).
  var gen = 0, curOffer = null, canReroll = false, rr = null;
  function setRerollLock(on) { if (rr) rr.disabled = !!on || !canReroll; }
  function liveCard(c) {
    var cs = curOffer ? curOffer.cards : [], i;
    for (i = 0; i < cs.length; i++) if (cs[i].id === c.id) return cs[i];
    return null;
  }
  // Locks the card row, plays the pick beat, then hands the live card to onPick.
  function pickCard(box, b, c, onPick) {
    if (box.dataset.locked) return;
    var g = gen;
    box.dataset.locked = '1'; b.classList.add('picked'); box.classList.add('has-pick'); setRerollLock(true); P.Sfx.play('pick');
    setTimeout(function () {
      if (g !== gen) return;   // a newer offer is on screen: this pick belonged to the old one
      var live = liveCard(c);
      delete box.dataset.locked; box.classList.remove('has-pick'); setRerollLock(false);
      if (live) onPick(live);
    }, P.Settings.reduceMotion ? 0 : 320);
  }
  // Fork options (AUDIT-7 U2): the mods as two 44 pt buttons in the card's chip line. A tap on one picks it and the card.
  // Their descriptions are in the long-press sheet. onSub(i) runs on a sub-button click.
  function modRow(c, onSub) {
    var wrap = mk('div', 'mods'), row = mk('div', 'mods-row'), opts = [];
    function mark() {
      opts.forEach(function (o, j) { var on = j === (c.pick || 0); o.classList.toggle('is-pick', on); o.setAttribute('aria-pressed', String(on)); });
    }
    (c.mods || []).forEach(function (id, i) {
      var o = mk('span', 'mod-opt');
      o.setAttribute('role', 'button'); o.tabIndex = 0;
      o.appendChild(mk('span', 'mod-name', P.t('mod.' + id)));
      o.addEventListener('click', function (e) { e.stopPropagation(); onSub(i); mark(); });
      o.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault(); e.stopPropagation(); o.click();
      });
      opts.push(o); row.appendChild(o);
    });
    mark(); wrap.appendChild(row);
    return wrap;
  }
  // ---------- card face (AUDIT-7 U2, T3-8): icon; name + level; one-line effect; one chip ----------
  // Weapon stat changes come from the config levels (values read, not written); passives reuse statLines (formatted).
  function pctOf(r) { var p = Math.round((r - 1) * 100); return p === 0 ? '' : (p > 0 ? '+' : '') + p + '%'; }
  function signed(n) { return (n > 0 ? '+' : '') + n; }
  function plainVal(fmt, v) {
    switch (fmt) {
      case 'n': return String(v);
      case 'm': return v + ' m';
      case 's': return v + ' s';
      case 'deg': return v + '°';
      case 'ms': return v + ' m/s';
      case 'pct': return Math.round(v * 100) + '%';
    }
    return null;   // rate and ratio have no plain value
  }
  function statLabel(st) { var k = 'cfx.' + st[1], t = P.t(k); return t !== k ? t : P.t(st[0]); }
  // The changes of one weapon level as "value label" items (the first two shown on the face).
  function weaponDeltas(c) {
    var cfg = P.CFG.weapons[c.item], L = cfg && cfg.levels, n = c.next, out = [];
    if (!L || !cfg.stats) return out;
    var a = (n > 1 && !c.evo) ? L[Math.min(n, L.length) - 2] : null, b = c.evo ? L[0] : L[Math.min(n, L.length) - 1];
    cfg.stats.forEach(function (st) {
      var key = st[1], fmt = st[2], va = a ? a[key] : null, vb = b[key], val = null;
      if (fmt === 'bool' || (a && va === vb)) return;
      if (!a) { val = plainVal(fmt, vb); }
      else if (fmt === 'rate') { val = pctOf(va / vb); }                       // a lower interval is faster
      else if (fmt === 'ratio' || fmt === 'm' || fmt === 's' || fmt === 'deg' || fmt === 'ms') { val = va ? pctOf(vb / va) : signed(vb); }
      else if (fmt === 'pct') { val = signed(Math.round((vb - va) * 100)) + '%'; }
      else if (key === 'dmg') { val = pctOf(vb / va); }
      else { val = signed(vb - va); }
      if (val) out.push(val + ' ' + statLabel(st));
    });
    return out;
  }
  function passiveDeltas(c) {
    return P.Progression.statLines(c).map(function (r) { return (r.b + ' ' + P.t(r.k)).trim(); });
  }
  // Rules text (class B, P.STR desc.*) with the card's one-line flavour (class C, the dialogue beat flav.<item>) in front of it.
  function cardText(c) {
    var d = P.Progression.describe(c), id = 'flav.' + c.item;
    var fl = !P.Progression.isUpgrade(c) && P.Dialogue.has(id) ? P.Dialogue.text(id) : '';
    return fl ? fl + ' ' + d : d;
  }
  function cardEffect(c) {
    if (c.id[0] === 'f') return cardText(c);
    var items = c.id[0] === 'w' ? weaponDeltas(c) : passiveDeltas(c);
    return items.length ? items.slice(0, 2).join(' · ') : cardText(c);
  }
  // Evolution helpers (read-only mirror of weapons6.js evoHint): what an evolution still needs, and the first target.
  function evoNeeds(s, id) {
    var E = P.CFG.evolutions[id], h = s.hero, need = 0, max = P.CFG.maxItemLevel;
    if ((h.weapons[E.from] || 0) < max) need++;
    if (E.terrain) {
      if (!P.Weapons6.seen(s, E.from, E.terrain)) need++;
      if (!P.Weapons6.evoUnlocked(s, id)) need++;
    } else if (!((h.passives[E.passive] || 0) > 0)) need++;
    return need;
  }
  function evoTarget(s, base) {
    var h = s.hero, ids = Object.keys(P.CFG.evolutions);
    if ((h.evolved || {})[base] || !P.CFG.weapons[base] || P.CFG.weapons[base].evo || !P.Weapons6) return null;
    for (var i = 0; i < ids.length; i++) if (P.CFG.evolutions[ids[i]].from === base && !h.weapons[ids[i]]) return ids[i];
    return null;
  }
  // The chip on a card (or in the detail sheet when long): an evolution's recipe, the weapon's next evolution, or a
  // passive's synergy with a weapon the player owns. Null when there is nothing to say.
  function chipInfo(s, c, long) {
    var h = s.hero, E, id, need, name, i, ids = Object.keys(P.CFG.evolutions);
    if (c.evo) {
      E = P.CFG.evolutions[c.item];
      if (!E) return null;
      var what = E.passive ? P.t('item.' + E.passive) : (E.terrain ? P.t('terrain.' + E.terrain) : '');
      return { icons: [c.evo].concat(E.passive ? [E.passive] : []), cls: 'ready',
        text: long ? P.t('card.recipeHead') + ': ' + what : P.t('card.recipe', { what: what }) };
    }
    if (c.id[0] === 'w') {
      id = evoTarget(s, c.item);
      if (!id) return null;
      name = P.t('item.' + id); need = evoNeeds(s, id);
      if (long) return { icons: [id], cls: need ? '' : 'ready', text: (P.Weapons.evoHint && P.Weapons.evoHint(c.item, s)) || name };
      return need ? { icons: [id], cls: '', text: P.t('card.evoLeft', { name: name, n: need }) }
        : { icons: [id], cls: 'ready', text: P.t('card.evoReady', { name: name }) };
    }
    if (c.id[0] === 'p') {
      for (i = 0; i < ids.length; i++) {
        E = P.CFG.evolutions[ids[i]];
        if (E.passive === c.item && h.weapons[E.from] && !h.weapons[ids[i]]) {
          return { icons: [E.from], cls: 'syn', text: P.t('card.synergy', { weapon: P.t('item.' + E.from) }) };
        }
      }
    }
    return null;
  }
  function cardChip(s, c) {
    var info = chipInfo(s, c, false), ch;
    if (!info) return null;
    ch = mk('div', 'card-chip' + (info.cls ? ' ' + info.cls : ''));
    info.icons.forEach(function (id) { var ic = mk('span', 'chip-ico'); ic.innerHTML = P.Icons.svg(id, 16); ch.appendChild(ic); });
    ch.appendChild(document.createTextNode(info.text));
    return ch;
  }
  function cardBadge(c, kind) {
    var key = c.evo ? 'evo.label' : c.fork ? 'card.mod' : (c.next === 1 && kind !== 'f') ? 'ui.cards.new' : null;
    return key ? mk('span', 'badge' + (c.evo ? ' evo' : c.fork ? ' mod' : ''), P.t(key)) : null;
  }
  // Long press (450 ms) opens the detail sheet and cancels the pick; a short tap picks (AUDIT-7 U2).
  function longPress(b, onLong, onTap) {
    var timer = null, held = false;
    b.addEventListener('pointerdown', function () {
      held = false; clearTimeout(timer);
      timer = setTimeout(function () { held = true; onLong(); }, 450);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, function () { clearTimeout(timer); }); });
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    b.addEventListener('click', function (e) {
      if (held) { held = false; e.preventDefault(); return; }
      onTap(e);
    });
  }
  // One level-up card: icon (with its badge), then the three text lines.
  function buildCard(s, c, i, scripted, box, onPick) {
    var kind = c.id[0], b = document.createElement('button'), face = mk('div', 'card-face'), body = mk('div', 'card-body'), l1 = mk('div', 'card-l1');
    b.className = 'card kind-' + kind + (scripted && i === 0 ? ' highlight' : '') + (c.fork ? ' fork' : '') + (c.evo ? ' evo' : '');
    b.style.animationDelay = (P.Settings.reduceMotion ? 0 : i * 70) + 'ms';
    face.appendChild(iconBox(c.item, 'icon'));
    var badge = cardBadge(c, kind); if (badge) face.appendChild(badge);
    l1.appendChild(mk('span', 'name', P.t('item.' + c.item)));
    if (kind !== 'f') l1.appendChild(pips(c.next - 1, c.next));
    body.appendChild(l1);
    body.appendChild(mk('div', 'fx', cardEffect(c)));
    var chip = c.fork && c.mods && c.mods.length
      ? modRow(c, function (k) { if (box.dataset.locked) return; c.pick = k; pickCard(box, b, c, onPick); })
      : cardChip(s, c);
    if (chip) body.appendChild(chip);
    b.appendChild(face); b.appendChild(body);
    longPress(b, function () { showInfo(s, c); }, function () { pickCard(box, b, c, onPick); });
    return b;
  }

  // ---------- card detail sheet (AUDIT-7 U2): every stat row, the full text, the recipe or the fork's two options ----------
  function hideInfo() { $('card-info').classList.add('hidden'); }
  function showInfo(s, c) {
    var root = $('card-info'), kind = c.id[0], chip = $('ci-chip'), desc = cardText(c), info, mc;
    $('ci-type').textContent = P.t('card.type.' + kind) + (c.fork ? ' · ' + P.t('card.mod') : '');
    $('ci-name').textContent = P.t('item.' + c.item);
    if (c.evo) desc = P.t('evo.from', { from: P.t('item.' + c.evo), to: P.t('item.' + c.item) }) + '\n' + desc;
    (c.mods || []).forEach(function (id) { desc += '\n' + P.t('mod.' + id) + ': ' + P.t('moddesc.' + id); });
    $('ci-desc').textContent = desc;
    fillStats($('ci-stats'), P.Progression.statLines(c));
    chip.innerHTML = '';
    mc = masteryChip(s, c.item, c.evo, 'chip mastery'); if (mc) chip.appendChild(mc);
    info = chipInfo(s, c, true);
    if (info) chip.appendChild(document.createTextNode((mc ? ' ' : '') + info.text));
    $('btn-ci-close').onclick = hideInfo;
    root.onclick = function (e) { if (e.target === root) hideInfo(); };
    root.classList.remove('hidden');
  }

  S.buildSlots = function (s, container, split) {
    container.innerHTML = '';
    var h = s.hero, add = function (item, lv) {
      var d = document.createElement('div'); d.className = 'slot' + (item ? ' filled' : '');
      if (item) {
        d.classList.add(P.Progression.isWeapon(item) ? 'kind-w' : 'kind-p'); d.innerHTML = P.Icons.svg(item, 28);
        d.title = P.t('item.' + item);
        var sm = document.createElement('small'); sm.textContent = lv; d.appendChild(sm);
        var tags = slotTags(s, item); if (tags) d.appendChild(tags);
      }
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
    gen++; curOffer = offer; hideInfo();   // a new offer on screen: picks from the previous one are dropped (CR-3)
    $('cards-sub').textContent = P.t('ui.cards.sub', { n: s.level }) + ' · ' + P.t('ui.cards.hold');
    $('cards-tut').classList.toggle('hidden', !offer.scripted);
    var box = $('cards'); box.innerHTML = ''; delete box.dataset.locked; box.classList.remove('has-pick');
    offer.cards.forEach(function (c, i) { box.appendChild(buildCard(s, c, i, offer.scripted, box, onPick)); });
    rr = $('btn-reroll');
    canReroll = s.rerolls > 0 && !offer.scripted;
    rr.textContent = P.t('ui.cards.reroll', { n: s.rerolls });
    rr.disabled = !canReroll;
    rr.onclick = function () { if (box.dataset.locked || !canReroll) return; onReroll(); };   // refused during a pick beat
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

  // {hood, n (district number), s (stage)} for journey-aware labels.
  S.levelVars = function (s, extra) {
    var L = s.levelInfo || P.Journey.level(1), o = { hood: L.hood.name, n: L.hoodIndex + 1, s: L.stage };
    for (var k in extra) o[k] = extra[k];
    return o;
  };

  S.showPause = function (s) {
    $('pause-level').textContent = P.t('ui.pause.level', S.levelVars(s, { t: P.UI.fmt(s.runT) }));
    $('pause-quit-note').textContent = P.t('ui.pause.quitNote', { p: S.keepPct() });
    $('btn-export').classList.toggle('hidden', !S.devTools());
    S.buildSlots(s, $('pause-build'), false);
    S.show('scr-pause');
  };

  // Settings rows (AUDIT-6 F5). Every change persists, pushes to the live hooks (P.applySettings) and redraws the list.
  S.showSettings = function (onBack, onChange) {
    var list = $('settings-list'); list.innerHTML = '';
    function commit() { P.saveSettings(); if (P.applySettings) P.applySettings(); onChange(); S.showSettings(onBack, onChange); }
    function row(label, el) { var r = document.createElement('div'); r.className = 'kv'; var l = document.createElement('span'); l.textContent = label; r.appendChild(l); r.appendChild(el); list.appendChild(r); }
    function toggle(key) {
      var b = document.createElement('button'); b.className = 'toggle' + (P.Settings[key] ? ' on' : '');
      b.textContent = P.t(P.Settings[key] ? 'ui.set.on' : 'ui.set.off');
      b.setAttribute('aria-pressed', String(!!P.Settings[key]));
      b.onclick = function () { P.Settings[key] = !P.Settings[key]; commit(); };
      return b;
    }
    // Stepped value: each tap moves to the next offered value (wraps around).
    function step(key, values, fmt) {
      var b = document.createElement('button'); b.className = 'toggle step';
      b.textContent = fmt(P.Settings[key]);
      b.onclick = function () { var i = values.indexOf(P.Settings[key]); P.Settings[key] = values[(i + 1) % values.length]; commit(); };
      return b;
    }
    var lang = document.createElement('button'); lang.className = 'toggle on'; lang.textContent = P.lang === 'tr' ? 'TR' : 'EN';
    lang.onclick = function () { P.lang = P.Settings.lang = P.lang === 'tr' ? 'en' : 'tr'; commit(); };
    row(P.t('ui.set.lang'), lang);
    row(P.t('ui.set.sound'), toggle('sound'));
    row(P.t('ui.set.music'), step('musicVol', P.SettingSteps.music, function (v) { return '%' + v; }));
    row(P.t('ui.set.subs'), toggle('subs'));
    row(P.t('ui.set.reduceMotion'), toggle('reduceMotion'));
    row(P.t('ui.set.reduceFlash'), toggle('reduceFlash'));
    row(P.t('ui.set.shake'), step('shake', P.SettingSteps.shake, function (v) { return '%' + v; }));
    row(P.t('ui.set.dmgNumbers'), toggle('dmgNumbers'));
    row(P.t('ui.set.blood'), toggle('blood'));
    row(P.t('ui.set.haptics'), toggle('haptics'));
    row(P.t('ui.set.joy'), step('joySide', ['right', 'left'], function (v) { return P.t(v === 'left' ? 'ui.set.joyL' : 'ui.set.joyR'); }));
    $('settings-note').textContent = P.t('ui.set.note');
    $('btn-settings-back').onclick = onBack;
    S.show('scr-settings');
  };

  // Cause card art (AUDIT-6 F4): the killer as a zombie figure from P.Sprites; a canister blast keeps the skull.
  var KILLER_VARIANT = { walker: 0, diner: 1, runner: 3, crawler: 4 };
  function killerArt(box, cause) {
    box.innerHTML = '';
    var sp = P.Sprites, v = KILLER_VARIANT[cause];
    if (v === undefined && cause !== 'canister') v = 0;   // any other zombie kind reads as a walker; a blast keeps the skull
    if (v === undefined || !sp || !sp.person || !sp.palette) { box.innerHTML = P.Icons.svg('skull', 44); return; }
    var dpr = Math.min(window.devicePixelRatio || 1, 2), cv = document.createElement('canvas'), c, pal = sp.palette(v, true);
    cv.width = 72 * dpr; cv.height = 72 * dpr; cv.style.width = '72px'; cv.style.height = '72px';
    c = cv.getContext('2d'); c.scale(dpr, dpr);
    sp.person(c, 36, 70, { u: 30, face: -1, phase: 0.4, zombie: true, skin: pal.skin, shirt: pal.shirt, pants: pal.pants,
      hair: pal.hair, arms: 'reach', eyes: '#DDF5D0', blood: 1 });
    box.appendChild(cv);
  }
  // Down screen: cause card, then the revive and give-up choices in fixed labels (AUDIT-6 F4). The caller holds the
  // 0.8 s beat before this runs (main.js). handlers: { revive(kind), giveUp() }.
  S.showDown = function (s, handlers) {
    $('down-survived').textContent = P.t('ui.down.survived', S.levelVars(s, { t: P.UI.fmt(s.runT) }));
    var dl = P.Dialogue.line('down.arda');   // view RNG only; a rotating Arda line above the cause card
    $('down-line').textContent = dl ? dl.t : '';
    var cause = s.deathCause || 'walker';
    killerArt($('down-icon'), cause);
    $('down-cause').textContent = P.t('cause.' + cause);
    // A cause with no tip string falls back to the generic tip (never a raw key on screen).
    var tipKey = 'tip.' + cause, tip = P.t(tipKey);
    $('down-tip').textContent = tip !== tipKey ? tip : P.t('ui.down.tipGeneric');
    $('btn-revive-ad').textContent = P.t('ui.down.reviveAd');
    $('btn-revive-gold').textContent = P.t('ui.down.reviveGold');
    $('down-note').textContent = P.t('ui.down.note');
    $('btn-revive-ad').disabled = $('btn-revive-gold').disabled = s.reviveUsed;
    $('btn-revive-ad').onclick = function () { handlers.revive('ad'); };
    $('btn-revive-gold').onclick = function () { handlers.revive('gold'); };
    $('btn-giveup').textContent = P.t('ui.down.giveUp', { p: S.keepPct() });
    $('btn-giveup').onclick = handlers.giveUp;
    $('down-revive').classList.toggle('hidden', !!(P.Modifiers && P.Modifiers.reviveBlocked && P.Modifiers.reviveBlocked(s)));   // daily Iron: no revive choices (AUDIT-7 CR-1)
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
    $('res-label').textContent = P.t('ui.res.labelHood', { n: r.hoodN, s: r.stage, hood: P.upper(r.hood) });
    $('btn-next').classList.toggle('hidden', !r.win || !r.hasNext);
    var st = $('res-stars'); st.innerHTML = '';
    [48, 56, 48].forEach(function (sz, i) {
      var sv = star(sz, r.stars[i]); st.appendChild(sv);
      setTimeout(function () { sv.classList.add('in'); }, P.Settings.reduceMotion ? 0 : 250 + i * 300);
    });
    var crit = $('res-criteria'); crit.innerHTML = '';
    // Star goals come from P.Objectives.goals (lane P) when the run passes them; the old three-goal list is the fallback.
    var goals = r.goals || [{ key: 'ui.res.starClear', on: r.stars[0] }, { key: 'ui.res.starNoRevive', on: r.stars[1] },
      { key: 'ui.res.starHp', on: r.stars[2], hp: true }];
    goals.forEach(function (g, i) {
      var sp = document.createElement(g.on ? 'span' : 's'); sp.textContent = P.t(g.key, g.vars);
      crit.appendChild(sp);
      if (g.hp && !g.on && r.win) crit.appendChild(document.createTextNode(' ' + P.t('ui.res.endedAt', { n: r.hpPct })));
      if (i < goals.length - 1) crit.appendChild(document.createTextNode(' · '));
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
    kv(rn, 'İstanbul', P.t('ui.res.progress', { km: r.km }));
    var db = $('btn-double'); db.innerHTML = ''; db.appendChild(document.createTextNode(P.t('ui.res.double')));
    var tg = document.createElement('span'); tg.className = 'tag'; tg.textContent = P.t('ui.cards.ad') + ' · ' + P.t('ui.res.notInProto'); db.appendChild(tg);
    db.classList.toggle('hidden', !r.win);
    S.show('scr-results');
  };

  // Mini Chest: wooden crate with brass bands (canvas). lid 0..1 = closed..open.
  S.chestShape = function (c, X, Y, s, lid) {
    var INK = '#14151F';
    c.save(); c.translate(X, Y);
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(0, 0.05 * s, 0.75 * s, 0.18 * s, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#8B4A22'; c.strokeStyle = INK; c.lineWidth = Math.max(2, s * 0.06);
    c.beginPath(); c.rect(-0.6 * s, -0.7 * s, 1.2 * s, 0.7 * s); c.fill(); c.stroke();
    c.fillStyle = '#E9A23B'; c.fillRect(-0.6 * s, -0.42 * s, 1.2 * s, 0.1 * s); c.strokeRect(-0.6 * s, -0.42 * s, 1.2 * s, 0.1 * s);
    c.fillRect(-0.12 * s, -0.5 * s, 0.24 * s, 0.24 * s); c.strokeRect(-0.12 * s, -0.5 * s, 0.24 * s, 0.24 * s);
    c.save(); c.translate(0, -0.7 * s); c.rotate(-lid * 1.9 * 0.5); c.translate(0, -lid * 0.25 * s);
    c.fillStyle = '#A65A2A'; c.beginPath(); c.moveTo(-0.62 * s, 0); c.lineTo(-0.62 * s, -0.22 * s); c.quadraticCurveTo(0, -0.5 * s, 0.62 * s, -0.22 * s); c.lineTo(0.62 * s, 0); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#E9A23B'; c.fillRect(-0.08 * s, -0.36 * s, 0.16 * s, 0.36 * s); c.strokeRect(-0.08 * s, -0.36 * s, 0.16 * s, 0.36 * s);
    c.restore();
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(-0.5 * s, -0.62 * s, 0.08 * s, 0.5 * s);
    c.restore();
  };

  // Chest opening (wow beat): drop, 3 shakes, burst of rays, item rises, stats, tap to continue.
  S.showChest = function (s, card, onDone) {
    var scr = $('scr-chest'), cv = $('chest-canvas'), info = $('chest-info'), c = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = 390, H = 520, t0 = performance.now(), done = false, sh = 0;
    cv.width = W * dpr; cv.height = H * dpr;
    info.classList.remove('in');
    $('chest-icon').className = 'icon kind-' + (P.Progression.isWeapon(card.item) ? 'w' : card.id[0] === 'f' ? 'f' : 'p');
    $('chest-icon').innerHTML = P.Icons.svg(card.item, 72);
    $('chest-name').textContent = P.t('item.' + card.item);
    $('chest-level').textContent = card.next ? P.t('chest.level', { n: card.next }) : '';
    chestTags(s, card, info);
    fillStats($('chest-stats'), P.Progression.statLines(card));
    var rm = P.Settings.reduceMotion, OPEN = rm ? 0.1 : 1.5;
    S.show('scr-chest'); P.Sfx.play('chestDrop');
    function frame(now) {
      if (done) return;
      var t = (now - t0) / 1000;
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
      var cx = W / 2, cy = 475, drop = Math.min(1, t / 0.35), bounce = drop < 1 ? -300 * (1 - drop) * (1 - drop) : 0;
      var shake = 0;
      if (t > 0.45 && t < OPEN) { var k = Math.floor((t - 0.45) / 0.33); if (k !== sh) { sh = k; P.Sfx.play('chestShake'); } shake = Math.sin(t * 60) * (4 + k * 3); }
      var open = t >= OPEN ? Math.min(1, (t - OPEN) / 0.25) : 0;
      if (open > 0) {
        if (!S._opened) { S._opened = true; P.Sfx.play('chestOpen'); setTimeout(function () { info.classList.add('in'); }, rm ? 0 : 250); }
        c.save(); c.translate(cx, cy - 60); c.rotate(t * 0.6); c.globalCompositeOperation = 'lighter';
        for (var i = 0; i < 14; i++) {
          c.rotate(Math.PI * 2 / 14); var g = c.createLinearGradient(0, 0, 0, -330);
          g.addColorStop(0, 'rgba(255,209,102,' + (0.55 * open) + ')'); g.addColorStop(1, 'rgba(255,209,102,0)');
          c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(-26, -330); c.lineTo(26, -330); c.closePath(); c.fill();
        }
        c.restore();
        var rg = c.createRadialGradient(cx, cy - 60, 0, cx, cy - 60, 140); rg.addColorStop(0, 'rgba(255,250,220,' + (0.9 * open) + ')'); rg.addColorStop(1, 'rgba(255,200,80,0)');
        c.fillStyle = rg; c.fillRect(0, 0, W, H);
      }
      S.chestShape(c, cx + shake, cy + bounce, 110, open);
      requestAnimationFrame(frame);
    }
    S._opened = false;
    requestAnimationFrame(frame);
    scr.onclick = function () {
      if ((performance.now() - t0) / 1000 < OPEN + 0.5 || done) return;
      done = true; scr.onclick = null; P.Sfx.play('pick'); onDone(card);
    };
  };

  S.drawKeyArt = function (canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = 358, h = 472, c = canvas.getContext('2d'), sp = P.Sprites;
    canvas.width = w * dpr; canvas.height = h * dpr; c.scale(dpr, dpr);
    var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1B2A4A'); g.addColorStop(0.42, '#C2512E'); g.addColorStop(0.62, '#3A2033'); g.addColorStop(1, '#14151F');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,209,102,0.9)'; c.beginPath(); c.arc(250, 150, 34, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1A1424';
    c.beginPath(); c.moveTo(0, 230);
    [[30, 220], [60, 228], [80, 200], [96, 200], [110, 150], [118, 120], [126, 150], [140, 200], [170, 210], [200, 185], [230, 200], [260, 192], [300, 210], [330, 196], [358, 205], [358, 300], [0, 300]].forEach(function (p) { c.lineTo(p[0], p[1]); });
    c.fill();
    c.fillStyle = '#14151F';
    for (var x = -10; x < w; x += 52) { var bh = 120 + ((x * 37) % 70); c.fillRect(x, h - bh - 150, 50, bh + 20); }
    c.fillStyle = 'rgba(255,190,110,0.75)';
    for (var y = 0; y < 5; y++) for (var x2 = -4; x2 < w; x2 += 52) if (((x2 + 8) * 7 + y * 13) % 5 > 1) c.fillRect(x2 + 10 + (y % 2) * 16, h - 255 + y * 22, 8, 11);
    c.fillStyle = '#2A2C35'; c.fillRect(0, h - 150, w, 150);
    c.strokeStyle = '#8A8F98'; c.lineWidth = 2; c.beginPath(); c.moveTo(150, h - 150); c.lineTo(110, h); c.moveTo(208, h - 150); c.lineTo(248, h); c.stroke();
    c.fillStyle = '#D7263D'; c.strokeStyle = '#14151F'; c.lineWidth = 3;
    c.fillRect(150, h - 228, 120, 70); c.strokeRect(150, h - 228, 120, 70);
    c.fillStyle = '#FFE2A8'; for (var k = 0; k < 4; k++) c.fillRect(158 + k * 28, h - 218, 20, 22);
    c.fillStyle = '#14151F'; c.fillRect(150, h - 162, 120, 6);
    var horde = [];
    for (var i = 0; i < 22; i++) horde.push({ x: 20 + ((i * 71) % 320), y: h - 150 + 10 + ((i * 29) % 70), v: i % 8 });
    horde.sort(function (a, b) { return a.y - b.y; });
    horde.forEach(function (z, i) {
      var u = 26 + (z.y - (h - 150)) * 0.25, pal = sp.palette(z.v, true);
      sp.shadow(c, z.x, z.y, u);
      sp.person(c, z.x, z.y, { u: u, face: z.x < 179 ? 1 : -1, phase: i, zombie: true, skin: pal.skin, shirt: pal.shirt, pants: pal.pants, hair: pal.hair, arms: 'reach', eyes: i % 5 ? '#DDF5D0' : '#FF5A3D', blood: 1 + i % 3 });
    });
    var hg = c.createRadialGradient(179, h - 40, 0, 179, h - 40, 90); hg.addColorStop(0, 'rgba(61,220,255,0.25)'); hg.addColorStop(1, 'rgba(61,220,255,0)');
    c.fillStyle = hg; c.fillRect(80, h - 140, 200, 140);
    c.strokeStyle = '#3DDCFF'; c.lineWidth = 3.5; c.beginPath(); c.ellipse(179, h - 22, 26, 10, 0, 0, Math.PI * 2); c.stroke();
    sp.person(c, 179, h - 22, { u: 62, face: 1, phase: 0.6, skin: '#E0AC80', shirt: '#D7263D', pants: '#2B3346', hair: '#1E1712', arms: 'knife', knifeA: -0.5 });
    var v = c.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
    c.fillStyle = v; c.fillRect(0, 0, w, h);
  };

  return S;
})();
