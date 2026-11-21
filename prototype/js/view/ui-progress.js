// Progress on screen (T4 part 5; docs/retention.md sections 3 and 4, docs/design-system.md 5, 7 and 13): the "Your power"
// strip, the Street Cred meter in the HUD, the XP bar's milestone ticks and level-up pop, the level-up banner, the results
// recap and the next-unlock line. Numbers come from P.Progress (js/meta/meta-progress.js); words from P.STR keys
// (js/strings-progress-ui.js). View only: nothing here writes to the sim or the save.
P.UIProgress = (function () {
  var V = {}, TICKS = [25, 50, 75], nodes = {}, skLabel = '', pending = null, shown = false, bannerT = 0, popT = 0;

  function $(id) { return document.getElementById(id); }
  function tr() { return P.lang === 'tr'; }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  // A percent with one decimal when it is not whole (8, 1.6). Turkish uses a comma. Values are fractions (0.016 = 1.6%).
  function pct(v) {
    var n = Math.round(v * 1000) / 10, s = n % 1 ? n.toFixed(1) : String(n);
    return tr() ? s.replace('.', ',') : s;
  }
  function km(v) { var s = (Math.round(v * 10) / 10).toFixed(1); return tr() ? s.replace('.', ',') : s; }
  // A label and a value row (the .kv style). Returns the value node, so a count-up can write into it. wide: the value goes
  // under the label. line: one compact row (the recap's time and walk, T4 part 9).
  function kv(parent, k, v, wide, line) {
    var d = el('div', 'kv' + (wide ? ' kv-wide' : '') + (line ? ' kv-line' : '')), val = el('span', null, v);
    d.appendChild(el('span', null, k));
    d.appendChild(val);
    parent.appendChild(d);
    return val;
  }
  function ready() { return !!(P.Progress && P.Meta && P.Journey); }

  // ---- "Your power" strip: damage and HP the walk gives, from P.Progress.power() ----
  function powerText(p) {
    return [P.t('prog.powerLabel'), P.t('prog.dmg', { v: pct(p.dmg) }), P.t('prog.hp', { v: pct(p.hp) }),
      P.t('prog.perks', { n: p.perks })].join(' · ');
  }
  // The strip as HTML, for the level sheet (meta-ui.js renders the sheet as one string).
  V.powerHtml = function () {
    return ready() ? '<p class="pw-strip">' + esc(powerText(P.Progress.power())) + '</p>' : '';
  };

  // ---- Next unlock: "Level 13 · KARAKÖY · Rıhtım Caddesi" (the boss stage adds BOSS). Map card and hood card. ----
  V.unlockText = function (info) {
    var sub = info.sub ? (tr() ? info.sub.tr : info.sub.en) : '';
    return [P.t('prog.levelN', { n: info.index }), P.upper(info.hood.name), sub, info.boss ? P.t('meta.boss') : '']
      .filter(Boolean).join(' · ');
  };
  // Arrival shows the current action. The route's next unlock belongs on the results screen.
  V.hoodNode = function (li) {
    if (li.index <= 30) return el('p', 'hc-obj', P.t('slice.goal.' + li.index));
    if (!ready()) return null;
    var box = el('div', 'hc-power'), nx = P.Progress.nextAfter(li.index, true);
    box.appendChild(el('p', 'pw-strip', powerText(P.Progress.power())));
    if (nx) box.appendChild(el('div', 'hc-next', P.t('hc.next', { unlock: V.unlockText(nx) })));
    return box;
  };

  // ---- HUD: Street Cred meter (balance with this run's kills, bar toward the next milestone) ----
  V.hud = function (s) {
    if (!nodes.skLabel || !ready()) return;
    // The chip shows the icon and the number only (DS 13 currency chip); the words are the aria label (hud.skLabel below).
    var sc = P.Progress.streetCred(s.kills | 0), label = String(sc.balance);
    if (label !== skLabel) { skLabel = label; nodes.skLabel.textContent = label; }
    nodes.sk.setAttribute('aria-label', P.t('hud.skLabel', { n: sc.balance, k: sc.next }));
    nodes.skFill.style.width = (sc.frac * 100).toFixed(1) + '%';
  };

  // ---- XP bar: quarter ticks (built once) and one pop on every level-up (--m-pop, no loop; Reduce motion: none) ----
  V.levelUp = function () {
    var bar = nodes.xp;
    if (!bar || P.UIMotion.reduced()) return;
    bar.classList.remove('is-pop'); void bar.offsetWidth; bar.classList.add('is-pop');
    clearTimeout(popT);
    popT = setTimeout(function () { bar.classList.remove('is-pop'); }, P.UIMotion.ms('--m-pop'));
  };

  // ---- Level-up banner: queued when a card is picked, shown in play once no overlay is up, for --m-banner. No taps. ----
  V.queueLevelUp = function (s, card) {
    var name = P.t('item.' + card.item);
    pending = { title: P.t('lvb.title', { n: s.level }),
      line: card.id[0] === 'f' ? P.t('lvb.lineF', { name: name }) : P.t('lvb.line', { name: name, n: card.next }) };
  };
  function hideBanner() {
    var b = nodes.banner;
    shown = false; bannerT = 0;
    if (b) P.UIMotion.leave(b, 'is-out', function () { b.classList.add('hidden'); b.classList.remove('is-out'); });
  }
  function showBanner(p) {
    pending = null; shown = true;
    nodes.title.textContent = p.title; nodes.line.textContent = p.line;
    nodes.banner.classList.remove('hidden', 'is-out');
    bannerT = P.UIMotion.ms('--m-banner') / 1000;
  }
  V.tick = function (dt) {
    if (!nodes.banner) return;
    if (shown) { bannerT -= dt; if (bannerT <= 0) hideBanner(); }
    if (pending && !shown && !(P.UI && P.UI.isOverlay && P.UI.isOverlay())) showBanner(pending);
  };
  // The run ended or a new one starts: nothing from the last run is left on screen.
  V.reset = function () {
    pending = null; shown = false; bannerT = 0; skLabel = '';
    if (nodes.banner) { nodes.banner.classList.add('hidden'); nodes.banner.classList.remove('is-out'); }
  };

  V.recipeAdvice = function (recipe) {
    if (!recipe || recipe.status === 'evolved') return '';
    var key = !recipe.rank ? 'weapon' : recipe.rank < 3 || recipe.paired ? 'rank' : 'passive';
    if (recipe.status === 'ready') key = 'chest';
    return P.t('res.recipe.' + key, { weapon: P.t('item.' + recipe.weapon), passive: P.t('item.' + recipe.passive),
      rank: P.CFG.maxItemLevel, evo: P.t('item.' + recipe.evo) });
  };
  V.liveRecipe = function (recipe, offer) {
    if (!recipe) return '';
    var key = recipe.status === 'evolved' ? 'evolved' : recipe.status === 'ready' ? 'chest' :
      !recipe.rank ? 'weapon' : recipe.rank < 3 || recipe.paired ? 'rank' : 'passive';
    var cards = offer && offer.cards || [];
    var card = cards.find(function (c) { return c.evo === recipe.weapon; });
    if (!card && key !== 'evolved') card = cards.find(function (c) { return c.item === recipe.passive && !recipe.paired; });
    if (!card && recipe.rank < P.CFG.maxItemLevel) card = cards.find(function (c) { return c.item === recipe.weapon; });
    if (card) key = card.evo ? 'evolveNow' : card.item === recipe.passive ? 'passiveNow' : !recipe.rank ? 'weaponNow' : 'rankNow';
    return P.t('live.recipe.' + key, { weapon: P.t('item.' + recipe.weapon), passive: P.t('item.' + recipe.passive),
      rank: P.CFG.maxItemLevel, next: card && card.next, evo: P.t('item.' + (card && card.evo ? card.item : recipe.evo)) });
  };
  function earnedPractice(rc, meta) {
    if (!meta) return;
    var gains = meta.statGains && meta.statGains.gains, xp = gains && gains.xp;
    var trained = xp && Object.keys(xp).filter(function (id) { return xp[id] > 0; });
    if (trained && trained.length) {
      var ready = trained.filter(function (id) { return gains.ready[id] > 0; });
      var strongest = trained.reduce(function (a, b) { return xp[b] > xp[a] ? b : a; });
      kv(rc, P.t('res.recap.training'), ready.length ? ready.map(function (id) {
        return P.t('growth.attributeReady', { attr: P.t('stat.' + id), n: gains.ready[id] });
      }).join(' · ') : P.t('res.recap.practice', { attr: P.t('stat.' + strongest), n: xp[strongest].toLocaleString(P.lang) }));
    }
    var lifts = meta.masteryUps || [], kills = meta.masteryKills || {};
    var lead = Object.keys(kills).reduce(function (a, b) { return !a || kills[b] > kills[a] ? b : a; }, null);
    if (lifts.length || lead) kv(rc, P.t('res.recap.mastery'), lifts.length ? lifts.map(function (u) {
      return P.t('res.recap.masteryRank', { weapon: P.t('item.' + u.id), n: u.to });
    }).join(' · ') : P.t('res.recap.masteryKills', { weapon: P.t('item.' + lead), n: kills[lead] }));
  }
  // ---- Results: power strip, run recap and the next unlock ----
  function experiment(idx,r){
    var b=$('btn-res-experiment'),M=P.Meta;if(!b||!M)return;
    b.classList.add('hidden');if(!r.win||M.starterIds().length===1)return;
    var rematch=idx===30?25:idx;
    if(M.tacticalAllowed(rematch,'normal')){b.textContent=P.t('a12.next.rematch',{n:rematch});b.dataset.target='rematch:'+rematch;}
    else {var id=M.starter()==='knife'?'nailgun':'knife';b.textContent=P.t('a12.next.starter',{weapon:P.t('item.'+id)});b.dataset.target='arsenal';}
    b.classList.remove('hidden');
  }
  function lossAdvice(r){
    var cause=r.deathCause||'',group=/tram|traffic|car|Trolley/i.test(cause)?'crossing':/acid|toxic|fire|spit|spice/i.test(cause)?'hazard':
      /cook|kasap|boss|bride|fisher|captain|ticket|keeper|vatman|roaster/i.test(cause)?'boss':'crowd';
    var key='cause.'+cause,label=P.t(key);if(label===key){key='enemy.'+cause;label=P.t(key);}
    return P.t('a12.loss.'+group)+(label===key?'':' '+P.t('a12.loss.source',{name:label}));
  }
  V.results = function (r) {
    var idx = (r.hoodN - 1) * P.Journey.levelsPerHood + r.stage, label = $('res-label');
    if (label) label.textContent = P.t('ui.res.labelLevel', { n: idx, hood: P.upper(r.hood) });   // "LEVEL 12 · İSTİKLAL"
    var strip = $('res-power'), rc = $('res-recap');
    if (!ready() || !strip || !rc) return;
    var meta = r.meta || null, pw = P.Progress.power(), earned = meta && meta.statGains ? meta.statGains.gains.sc : 0;
    strip.textContent = powerText(pw);
    var next = $('res-next-step');
    if (next) {
      var unlocked = r.hasNext && r.win && Object.keys(P.CFG.unlock.weapons).find(function (id) { return P.CFG.unlock.weapons[id] === idx + 1; });
      var note = unlocked ? P.t('res.next.weapon', { name: P.t('item.' + unlocked) }) : V.recipeAdvice(r.recipe);
      var district = '';
      if (r.mode === 'normal' && r.win) {
        district = r.stage === P.Journey.levelsPerHood ? P.t('res.districtClear', { hood: r.hood }) :
          P.t('res.districtStage', { hood: r.hood, stage: r.stage, total: P.Journey.levelsPerHood });
      }
      if(!r.win)note=lossAdvice(r);
      next.textContent = [district, note].filter(Boolean).join(' ');
      next.classList.toggle('hidden', !next.textContent);
    }
    experiment(idx,r);rc.innerHTML = '';
    rc.appendChild(el('p', 'caption res-head', P.t('res.recap.head')));
    rc.appendChild(el('p', 'res-reached', P.t('res.recap.reached', { n: r.level, kills: r.kills, streak: r.streak | 0 })));
    if (idx <= 5) rc.appendChild(el('p', 'caption', P.t('res.recap.resetWeapons')));
    kv(rc, P.t('ui.res.time'), P.UI.fmt(r.time), false, true);
    kv(rc, P.t('ui.res.walk'), P.t('ui.res.progress', { km: km(+r.km || 0), total: P.Journey.totalKm }), false, true);   // km with the part of the next district
    earnedPractice(rc, meta);
    var scNode = kv(rc, P.t('res.recap.sc'), '');
    P.UIMotion.countUp(scNode, earned, function (v) { return P.t('res.recap.scVal', { n: v, k: P.Progress.streetCred(0).next }); });
    var g = meta ? P.Progress.hoodGain(meta.before.done, meta.after.done) : null;
    kv(rc, P.t('res.recap.power'), g && g.rank > 0 ? [P.t('prog.gainDmg', { v: pct(g.dmg) }), P.t('prog.gainHp', { v: pct(g.hp) })].join(' · ')
      : P.t('res.recap.noPower'));
    var boundary = r.win && P.CFG.experience && idx >= P.CFG.experience.through;
    var nx = boundary ? null : P.Progress.nextAfter(idx, !!r.win), nextTxt = P.t(boundary ? 'exp.boundary' : 'meta.allDone');
    if (nx) nextTxt = r.win ? V.unlockText(nx) : P.t('res.recap.retry', { unlock: V.unlockText(nx) });
    kv(rc, P.t('res.recap.next'), nextTxt, true);
  };

  V.init = function () {
    nodes = { sk: $('sk-meter'), skLabel: $('sk-label'), skFill: $('sk-fill'), xp: document.querySelector('.xp-bar'),
      banner: $('lvl-banner'), title: $('lvl-title'), line: $('lvl-line') };
    if (nodes.xp) TICKS.forEach(function (t) { var i = el('i', 'xp-tick'); i.style.left = t + '%'; nodes.xp.appendChild(i); });
  };
  return V;
})();
