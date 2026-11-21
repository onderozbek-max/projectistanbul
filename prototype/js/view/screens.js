// Menu screens: level-up cards (05), pause (07), settings (16 subset), down (09), results (08), title (01).
P.Screens = (function () {
  var S = {}, $ = function (id) { return document.getElementById(id); };
  var ALL = ['scr-title', 'scr-cold', 'scr-cards', 'scr-chest', 'scr-pause', 'scr-settings', 'scr-down', 'scr-slam', 'scr-results'];

  // Overlays take the HUD, the dash and nazar buttons and the subtitle layer off screen while they are up (AUDIT-6 F1).
  var OVERLAYS = ['scr-cards', 'scr-chest', 'scr-pause', 'scr-settings', 'scr-down'];
  S.show = function (id) {
    ALL.forEach(function (x) { P.UIMotion.screen($(x), x === id); });   // fade in and out (css/motion.css, ui-motion.js)
    if (id === 'scr-title' && P.UI && P.UI.titleStart) P.UI.titleStart();
    if (P.UI && P.UI.setOverlay) P.UI.setOverlay(OVERLAYS.indexOf(id) >= 0);
  };
  S.hideAll = function () { S.show(null); };
  // Dev export is for the team: ?debug=1 or the devTools setting. Players never see it (AUDIT-6 F3).
  S.devTools = function () { return !!P.Settings.devTools || /[?&]debug=1(&|$)/.test(location.search); };
  // The share of Jeton that survives a give-up or a quit (config: rewards.loseKeep), as a whole percent.
  S.keepPct = function () { return Math.round(P.CFG.rewards.loseKeep * 100); };

  // The item's icon in box d: the raster icon when it is decoded (D-066), else the code icon (art-raster-items.js iconInto retries).
  function artIcon(d, item, lv, px) {
    if (P.ArtRasterItems) P.ArtRasterItems.iconInto(d, item, item === 'knife' ? 0 : lv, px);
    else d.innerHTML = P.Icons.svg(item, px);
  }
  // lv: a weapon card shows its tier art at that level (D-066, raster on); the slots and the other cards show the clean icon.
  function iconBox(item, cls, lv) {
    var d = document.createElement('div'), px = cls === 'icon' ? 40 : 30;
    d.className = cls + ' kind-' + (P.Progression.isWeapon(item) ? 'w' : (item === 'simit' || item === 'jeton') ? 'f' : 'p');
    artIcon(d, item, lv, px);
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
    return P.BuildInspection.tags(s, item);
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
  // The mastery chip describes a bonus independent of the choice in this crate.
  function chestTags(s, card, info) {
    var t = info.querySelector('.chest-tags');
    if (!t) { t = mk('div', 'chest-tags'); info.appendChild(t); }
    t.innerHTML = '';
    var mc = masteryChip(s, card.item, card.evo); if (mc) t.appendChild(mc);
  }
  // Card offer state (AUDIT-7 U3, CR-3). gen counts offers on screen; curOffer is the one on screen; Reroll is refused
  // while a pick beat runs. A pick hands onPick the card looked up by id in curOffer, and a pick whose offer was replaced
  // during the beat is dropped (no stale card is applied after a reroll).
  var gen = 0, curOffer = null, canReroll = false, rr = null, focusButton = null;
  function setRerollLock(on) {
    if (rr) rr.disabled = !!on || !canReroll;
    if (focusButton) focusButton.disabled = !!on || !canReroll;
  }
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
    }, P.UIMotion.wait('--m-select'));
  }
  // Fork choices are separate buttons, with the effect visible before the pick.
  function modRow(c, onSub) {
    var wrap = mk('div', 'mods'), row = mk('div', 'mods-row'), opts = [];
    function mark() { opts.forEach(function (o, j) { var on = j === c.pick; o.classList.toggle('is-pick', on); o.setAttribute('aria-pressed', String(on)); }); }
    (c.mods || []).forEach(function (id, i) {
      var o = mk('button', 'mod-opt'); o.type = 'button';
      o.appendChild(mk('span', 'mod-name', P.t('mod.' + id)));
      o.appendChild(mk('span', 'mod-desc', P.t('moddesc.' + id)));
      o.addEventListener('click', function (e) { e.stopPropagation(); onSub(i); mark(); });
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
    if (c.id[0] === 'w' && (c.next === 1 || c.evo || c.fork)) return P.t('desc.' + c.item);
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
      E = P.CFG.evolutions[id];
      var missing = [];
      if ((h.weapons[c.item] || 0) < P.CFG.maxItemLevel) {
        var rank = P.t('card.needRank', { n: P.CFG.maxItemLevel });
        missing.push(rank === 'card.needRank' ? P.t('evo.need.level', { lv: P.CFG.maxItemLevel }) : rank);
      }
      if (E.passive && !h.passives[E.passive]) missing.push(P.t('item.' + E.passive));
      if (E.terrain && !P.Weapons6.seen(s, E.from, E.terrain)) missing.push(P.t('terrain.' + E.terrain));
      if (E.terrain && !P.Weapons6.evoUnlocked(s, id)) missing.push(P.t('card.detailsUnlock'));
      return need ? { icons: [id], cls: '', text: missing.join(' + ') }
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
    var key = c.evo ? 'evo.label' : c.fork ? 'card.mod' : c.recipe ? 'card.recipePick' : (c.next === 1 && kind !== 'f') ? 'ui.cards.new' : null;
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
    var kind = c.id[0], fork = !!(c.fork && c.mods && c.mods.length), b = document.createElement(fork ? 'div' : 'button');
    var face = mk('div', 'card-face'), body = mk('div', 'card-body'), l1 = mk('div', 'card-l1');
    b.className = 'card kind-' + kind + (scripted && i === 0 ? ' highlight' : '') + (c.fork ? ' fork' : '') + (c.evo ? ' evo' : '');
    b.style.animationDelay = P.UIMotion.stagger(i) + 'ms';
    face.appendChild(iconBox(c.item, 'icon', c.next));
    var badge = cardBadge(c, kind); if (badge) face.appendChild(badge);
    l1.appendChild(mk('span', 'name', P.t('item.' + c.item)));
    if (kind !== 'f') l1.appendChild(pips(c.next - 1, c.next));
    body.appendChild(l1);
    body.appendChild(mk('div', 'fx', cardEffect(c)));
    if (fork) c.pick = -1;
    var chip = fork
      ? modRow(c, function (k) { if (box.dataset.locked) return; c.pick = k; pickCard(box, b, c, onPick); })
      : cardChip(s, c);
    if (chip) body.appendChild(chip);
    b.appendChild(face); b.appendChild(body);
    if (fork) {
      var details = mk('button', 'link card-details', P.t('ui.cards.details'));
      details.onclick = function () { if (!box.dataset.locked) showInfo(s, c, details); };
      body.appendChild(details);
    } else longPress(b, function () { showInfo(s, c, b); }, function () { pickCard(box, b, c, onPick); });
    return b;
  }

  // ---------- card detail sheet (AUDIT-7 U2): every stat row, the full text, the recipe or the fork's two options ----------
  function hideInfo() { $('card-info').classList.add('hidden'); $('cards-content').inert = false; }
  function showInfo(s, c, anchor) {
    var root = $('card-info'), kind = c.id[0], chip = $('ci-chip'), desc = cardText(c), close = $('btn-ci-close'), info, mc;
    $('ci-type').textContent = P.t('card.type.' + kind) + (c.fork ? ' · ' + P.t('card.mod') : '');
    $('ci-name').textContent = P.t('item.' + c.item);
    if (c.evo) desc = P.t('evo.from', { from: P.t('item.' + c.evo), to: P.t('item.' + c.item) }) + '\n' + desc;
    if (kind === 'w') {
      var category = P.Stats.categoryOf(c.item), tag = P.Weapons.tagOf(c.item);
      if (category) desc += '\n' + P.t('card.training.' + category);
      if (tag) desc += ' · ' + P.t('card.impact.' + tag);
      desc += '\n' + P.t(P.Combat.isHeavy(c.item) ? 'card.heavy.yes' : 'card.heavy.no', { perk: P.t('tree.str.1.name') });
    }
    (c.mods || []).forEach(function (id) { desc += '\n' + P.t('mod.' + id) + ': ' + P.t('moddesc.' + id); });
    $('ci-desc').textContent = desc;
    fillStats($('ci-stats'), P.Progression.statLines(c));
    chip.innerHTML = '';
    mc = masteryChip(s, c.item, c.evo, 'chip mastery'); if (mc) chip.appendChild(mc);
    info = chipInfo(s, c, true);
    if (info) chip.appendChild(document.createTextNode((mc ? ' ' : '') + info.text));
    function dismiss() { hideInfo(); if (anchor && anchor.isConnected) anchor.focus({ preventScroll: true }); }
    close.onclick = dismiss;
    root.onclick = function (e) { if (e.target === root) dismiss(); };
    root.onkeydown = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); dismiss(); }
      if (e.key === 'Tab') { e.preventDefault(); close.focus({ preventScroll: true }); }
    };
    $('cards-content').inert = true; root.classList.remove('hidden'); close.focus({ preventScroll: true });
  }

  S.buildSlots = function (s, container, split) {
    container.innerHTML = '';
    var h = s.hero, add = function (item, lv) {
      var d = document.createElement(item ? 'button' : 'div'); d.className = 'slot' + (item ? ' filled' : '');
      if (item) {
        d.classList.add(P.Progression.isWeapon(item) ? 'kind-w' : 'kind-p');
        var icon = mk('span', 'slot-icon'); d.appendChild(icon); artIcon(icon, item, 0, 28);
        d.title = P.t('item.' + item);
        var sm = document.createElement('small'); sm.textContent = lv; d.appendChild(sm);
        var tags = slotTags(s, item); if (tags) d.appendChild(tags);
        P.BuildInspection.bind(d, s, item, container);
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
    var sameScroll=$('scr-cards').scrollTop,samePlan=$('cards-plan')&&$('cards-plan').open,freshOffer=curOffer!==offer; gen++; curOffer = offer; hideInfo();   // a new offer on screen: picks from the previous one are dropped (CR-3)
    $('cards-title').textContent = P.t('lvb.title', { n: s.level });
    var step = P.UIProgress.liveRecipe(P.Progression.buildState(s), offer);
    $('cards-recipe').classList.toggle('hidden', !step); $('cards-recipe').textContent = step ? P.t('pause.focus', { step: step }) : '';
    $('cards-sub').textContent = P.t('ui.cards.sub', { n: s.level }) + ' · ' + P.t('ui.cards.hold');
    $('cards-tut').classList.toggle('hidden', !offer.scripted);
    var box = $('cards'); box.innerHTML = ''; delete box.dataset.locked; box.classList.remove('has-pick');
    offer.cards.forEach(function (c, i) { box.appendChild(buildCard(s, c, i, offer.scripted, box, onPick)); });
    rr = $('btn-reroll');
    canReroll = s.rerolls > 0 && !offer.scripted;
    rr.textContent = P.t('ui.cards.reroll', { n: s.rerolls });
    rr.disabled = !canReroll;
    rr.onclick = function () { if (box.dataset.locked || !canReroll) return; onReroll(); };   // refused during a pick beat
    focusButton = $('btn-reroll-focus');
    if (focusButton) {
      var target = canReroll && P.Progression.focusCandidate(s);
      var focus = target && !offer.cards.some(function (c) { return c.id === target.id; }) && s.recipeFocus;
      focusButton.classList.toggle('hidden', !focus);
      focusButton.disabled = !focus;
      if (focus) {
        var key = target.evo || target.id[0] === 'p' ? 'ui.cards.focusItem' : 'ui.cards.focusRank';
        focusButton.textContent = P.t(key, { item: P.t('item.' + target.item), rank: target.next });
      }
      focusButton.onclick = function () { if (focus && !box.dataset.locked && canReroll) onReroll(focus); };
    }
    var bp = $('cards-build'); bp.innerHTML = '';
    var cap = document.createElement('p'); cap.className = 'caption';
    cap.textContent = P.t('ui.cards.build', { w: Object.keys(s.hero.weapons).length, p: Object.keys(s.hero.passives).length });
    var slots = document.createElement('div'); slots.className = 'slots';
    bp.appendChild(cap); bp.appendChild(slots); S.buildSlots(s, slots, true);
    P.ExperienceUI.cards(s, bp, function () { S.showCards(s, offer, onPick, onReroll); });if(!freshOffer&&$('cards-plan'))$('cards-plan').open=samePlan;
    S.show('scr-cards');
    if(freshOffer){$('scr-cards').scrollTop=0;$('cards-title').tabIndex=-1;$('cards-title').focus({preventScroll:true});}else $('scr-cards').scrollTop=sameScroll;
  };

  // {hood, n (district number), s (stage)} for journey-aware labels.
  S.levelVars = function (s, extra) {
    var L = s.levelInfo || P.Journey.level(1), o = { hood: L.hood.name, n: L.hoodIndex + 1, s: L.stage, of: P.Journey.levelsPerHood };
    for (var k in extra) o[k] = extra[k];
    return o;
  };

  S.showPause = function (s) {
    $('pause-level').textContent = P.t('ui.pause.level', S.levelVars(s, { t: P.UI.fmt(s.runT) }));
    var step = P.UIProgress.liveRecipe(P.Progression.buildState(s)), goal = P.UI.routeContext(s);
    $('pause-objective').textContent = goal || P.t(s.levelIndex <= 30 ? 'slice.goal.' + s.levelIndex : 'route.exit');
    $('pause-health').textContent = P.t('pause.health', { hp: Math.ceil(s.hero.hp), max: Math.round(s.hero.maxHp) });
    $('pause-recipe').classList.toggle('hidden', !step);
    $('pause-recipe').textContent = step ? P.t('pause.focus', { step: step }) : '';
    $('pause-options').open = false;
    $('pause-quit-note').textContent = P.t('ui.pause.quitNote', { p: S.keepPct() });
    $('btn-export').classList.toggle('hidden', !S.devTools());
    S.buildSlots(s, $('pause-build'), true);
    if (P.ExperienceUI) P.ExperienceUI.pause(s);
    S.show('scr-pause');
    $('btn-resume').focus({ preventScroll: true });
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
    // Volume slider, 0-100 in 10% steps (T4 part 8). Dragging is live (P.applySettings); the value is saved when the finger lifts.
    function volume(key, label) {
      var wrap = mk('div', 'vol'), inp = document.createElement('input'), out = mk('span', 'vol-val', P.Settings[key] + '%');
      inp.type = 'range'; inp.min = '0'; inp.max = '100'; inp.step = '10'; inp.value = String(P.Settings[key]);
      inp.setAttribute('aria-label', label); inp.setAttribute('aria-valuetext', P.Settings[key] + '%');
      inp.oninput = function () {
        P.Settings[key] = +inp.value; out.textContent = inp.value + '%'; inp.setAttribute('aria-valuetext', inp.value + '%');
        if (P.applySettings) P.applySettings();
      };
      inp.onchange = function () { P.saveSettings(); };
      wrap.appendChild(inp); wrap.appendChild(out);
      return wrap;
    }
    var lang = document.createElement('button'); lang.className = 'toggle on'; lang.textContent = P.lang === 'tr' ? 'TR' : 'EN';
    lang.onclick = function () { P.lang = P.Settings.lang = P.lang === 'tr' ? 'en' : 'tr'; commit(); };
    row(P.t('ui.set.lang'), lang);
    row(P.t('ui.set.music'), volume('musicVol', P.t('ui.set.music')));
    row(P.t('ui.set.sound'), volume('sfxVol', P.t('ui.set.sound')));
    row(P.t('ui.set.subs'), toggle('subs'));
    row(P.t('ui.set.reduceMotion'), toggle('reduceMotion'));
    row(P.t('ui.set.reduceFlash'), toggle('reduceFlash'));
    var colors = document.createElement('select');
    colors.className = 'color-vision'; colors.setAttribute('aria-label', P.t('ui.set.colorVision'));
    P.SettingSteps.colorVision.forEach(function (key) {
      var option = mk('option', '', P.t('ui.set.colorVision.' + key));
      option.value = key; colors.appendChild(option);
    });
    colors.value = P.Settings.colorVision;
    colors.onchange = function () { P.Settings.colorVision = colors.value; P.saveSettings(); P.applySettings(); };
    row(P.t('ui.set.colorVision'), colors);
    row(P.t('ui.set.shake'), step('shake', P.SettingSteps.shake, function (v) { return '%' + v; }));
    row(P.t('ui.set.textSize'), step('textSize', P.SettingSteps.text, function (v) { return '%' + v; }));
    row(P.t('ui.set.dmgNumbers'), toggle('dmgNumbers'));
    row(P.t('ui.set.blood'), toggle('blood'));
    row(P.t('ui.set.haptics'), toggle('haptics'));
    row(P.t('ui.set.joy'), step('joySide', ['any', 'right', 'left'], function (v) { return P.t(v === 'left' ? 'ui.set.joyL' : v === 'right' ? 'ui.set.joyR' : 'ui.set.joyA'); }));
    $('settings-note').textContent = P.t('ui.set.note');
    $('btn-settings-export').classList.toggle('hidden', !S.devTools());   // team export (?debug=1): the map has no pause menu
    $('btn-settings-back').onclick = onBack;
    S.show('scr-settings');
  };

  function killerArt(box, actor) {
    box.innerHTML = P.Icons.svg('skull', 44);
    if (!actor || !P.ArtRasterChars) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), cv = document.createElement('canvas'), c;
    cv.width = 72 * dpr; cv.height = 72 * dpr; cv.style.width = '72px'; cv.style.height = '72px';
    c = cv.getContext('2d'); c.scale(dpr, dpr);
    var marker = box.firstChild;
    function paint(tries) {
      if (box.firstChild !== marker) return;
      if (P.ArtRasterChars.portrait(c, actor, 36, 71, 69)) box.replaceChildren(cv);
      else if (tries < 12 && P.ArtRaster.enabled()) setTimeout(function () { paint(tries + 1); }, 100);
    }
    paint(0);
  }
  S.showDown = function (s, handlers) {
    $('down-survived').textContent = P.t('ui.down.survived', S.levelVars(s, { t: P.UI.fmt(s.runT) }));
    var dl = P.Dialogue.line('down.arda');   // view RNG only; a rotating Arda line above the cause card
    $('down-line').textContent = dl ? dl.t : '';
    var cause = s.deathCause, actor = s.deathActor;
    killerArt($('down-icon'), actor || (P.CFG.enemies[cause] && cause !== 'walker' ? { type: cause } : null));
    var key = actor && actor.boss && actor.nameKey || 'cause.' + cause, name = P.t(key);
    $('down-cause').textContent = name === key ? P.t('ui.down.causeUnknown') : name;
    var pressureKey = 'cause.' + s.deathPressure, pressure = P.t(pressureKey);
    $('down-pressure').textContent = pressure === pressureKey ? '' : P.t('ui.down.pressure', { cause: pressure });
    var tipKey = 'tip.' + cause, tip = P.t(tipKey);
    $('down-tip').textContent = tip !== tipKey ? tip : P.t('ui.down.tipGeneric');
    $('btn-revive').textContent = P.t('ui.down.revive');
    $('down-note').textContent = P.t('ui.down.note');
    $('btn-revive').disabled = s.reviveUsed;
    $('btn-revive').onclick = handlers.revive;
    $('btn-giveup').textContent = P.t('ui.down.giveUp', { p: s.runMode === 'nightshift' ? 100 : S.keepPct() });
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
    // R1-T4 part 18: Night Shift has its own titles, no stars and no criteria; a Nightmare run has four stars.
    var ns = r.mode === 'nightshift';
    $('res-title').textContent = P.t(ns ? (r.win ? 'ui.ns.done' : 'ui.ns.over') : r.win ? 'ui.res.clear' : 'ui.res.fail');
    $('btn-next').classList.toggle('hidden', !r.win || !r.hasNext);
    $('btn-res-growth').classList.toggle('hidden', !r.meta || !P.Meta || !P.Meta.hasGrowth || !P.Meta.hasGrowth());
    var st = $('res-stars'); st.innerHTML = ''; st.classList.toggle('hidden', ns);
    var sizes = r.stars.length > 3 ? [40, 52, 52, 40] : [48, 56, 48];
    if (!ns) sizes.forEach(function (sz, i) {
      var sv = star(sz, r.stars[i]); st.appendChild(sv);
      setTimeout(function () { sv.classList.add('in'); }, P.UIMotion.wait('--m-enter') + i * P.UIMotion.wait('--m-beat'));
    });
    var crit = $('res-criteria'); crit.innerHTML = ''; crit.classList.toggle('hidden', ns);
    // Star goals come from P.Objectives.goals (lane P) when the run passes them; the old three-goal list is the fallback.
    var goals = ns ? [] : r.goals || [{ key: 'ui.res.starClear', on: r.stars[0] }, { key: 'ui.res.starNoRevive', on: r.stars[1] },
      { key: 'ui.res.starHp', on: r.stars[2], hp: true }];
    if (!ns && !r.goals && r.stars.length > 3) goals.push({ key: 'res.star4', vars: { n: Math.round(P.CFG.levels.nightmare.fourthHp * 100) }, on: r.stars[3] });
    goals.forEach(function (g, i) {
      var sp = document.createElement(g.on ? 'span' : 's'); sp.textContent = P.t(g.key, g.vars);
      crit.appendChild(sp);
      if (g.hp && !g.on && r.win) crit.appendChild(document.createTextNode(' ' + P.t('ui.res.endedAt', { n: r.hpPct })));
      if (i < goals.length - 1) crit.appendChild(document.createTextNode(' · '));
    });
    if (P.ExperienceUI) P.ExperienceUI.result(r);
    var rw = $('res-rewards'); rw.innerHTML = '';
    function kv(parent, k, v) { var d = document.createElement('div'); d.className = 'kv'; var a = document.createElement('span'); a.textContent = k; var b = document.createElement('span'); b.textContent = v; d.appendChild(a); d.appendChild(b); parent.appendChild(d); return b; }
    var jetonTail = r.firstClear ? P.t('ui.res.firstClear') : r.win ? '' : P.t('ui.res.partial');
    P.UIMotion.countUp(kv(rw, P.t('ui.res.jeton'), ''), r.jeton, function (v) { return '+' + v + ' ' + jetonTail; });   // count-up, tap to finish
    if (r.hurda > 0) P.UIMotion.countUp(kv(rw, P.t('ui.res.hurda'), ''), r.hurda, function (v) { return '+' + v; });
    if (r.firstClear) kv(rw, P.t('ui.res.gear'), P.t('ui.res.commonGear'));
    if (P.UIProgress) P.UIProgress.results(r);   // level headline, power strip, run recap and the walk (ui-progress.js)
    if (P.ModesUI) P.ModesUI.results(r, rw, kv);   // Nightmare and Night Shift rows (view/modes-ui.js)
    S.show('scr-results');
  };

  // One illustrated chest for ground pickups and the reward reveal.
  S.chestShape = function (c, X, Y, s, lid, state) {
    c.save();
    var locked = state === 'guarded', art = P.ArtRasterItems;
    if (locked) c.globalAlpha *= .58;
    var ready = art && art.chest(c, X, Y, 1.58 * s, lid);
    if (!ready) P.ConsumablesIcons.draw(c, 'star', X, Y - .38 * s, .47 * s, locked ? '#AFB4BD' : '#FFD166', '#14151F');
    c.restore();
  };

  function chestReward(s, card, info) {
    $('chest-icon').className = 'icon kind-' + (P.Progression.isWeapon(card.item) ? 'w' : card.id[0] === 'f' ? 'f' : 'p');
    artIcon($('chest-icon'), card.item, card.next, 72);
    $('chest-name').textContent = P.t('item.' + card.item);
    $('chest-level').textContent = card.next ? P.t('chest.level', { n: card.next }) : '';
    chestTags(s, card, info);
    fillStats($('chest-stats'), P.Progression.statLines(card));
  }
  S.showChest = function (s, card, onDone) {
    var scr = $('scr-chest'), cv = $('chest-canvas'), info = $('chest-info'), next = $('btn-chest-continue'), choices = $('chest-choices');
    var actions = $('chest-actions'), hint = $('chest-choice-hint');
    var showBeat = !P.Settings.reduceMotion, done = false, shown = false;
    cv.classList.toggle('hidden', !showBeat); info.classList.remove('in'); info.inert = true; info.scrollTop = 0;
    actions.classList.add('hidden'); hint.classList.toggle('hidden', !card.fork);
    if (card.fork) card.pick = -1;
    chestReward(s, card, info); choices.innerHTML = '';
    next.disabled = !!card.fork;
    if (card.fork) choices.appendChild(modRow(card, function (pick) { card.pick = pick; next.disabled = false; }));
    function reveal() {
      if (shown) return;
      shown = true; scr.onclick = null; info.inert = false; info.classList.add('in'); actions.classList.remove('hidden'); P.Sfx.play('chestOpen');
      if (card.fork) hint.tabIndex = -1;
      (card.fork ? hint : next).focus({ preventScroll: true });
    }
    S.show('scr-chest');
    next.onclick = function () {
      if (done || !shown || next.disabled) return;
      done = true; P.Sfx.play('pick'); onDone(card);
    };
    if (showBeat) animateChest(cv, reveal, scr, card.evo ? 1 : 2.3); else reveal();
  };
  function animateChest(cv, reveal, scr, speed) {
    var c = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2), W = 390, H = 520, t0 = performance.now(), sh = 0;
    cv.width = W * dpr; cv.height = H * dpr; P.Sfx.play('chestDrop');
    scr.onclick = function () { t0 = performance.now() - 1750; };
    function frame(now) {
      var t = (now - t0) * speed / 1000, drop = Math.max(0, 1 - t / 0.35), open = Math.min(1, Math.max(0, (t - 1.35) / 0.35));
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
      if (!sh && t > .52 && t < 1.35) { sh = 1; P.Sfx.play('chestShake'); }
      var halo = c.createRadialGradient(195, 395, 10, 195, 395, 170);
      halo.addColorStop(0, 'rgba(255,237,185,' + (0.8 * open) + ')'); halo.addColorStop(1, 'rgba(255,200,80,0)');
      c.fillStyle = halo; c.fillRect(0, 0, W, H);
      S.chestShape(c, 195 + (sh && !open ? Math.sin(t * 49) * 6 : 0), 475 - 300 * drop * drop, 110, open);
      if (open >= 1) reveal(); else requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  return S;
})();
