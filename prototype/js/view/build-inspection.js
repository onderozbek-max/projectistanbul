// A compact inventory is an index; complete names and modification descriptions have their own readable surface.
P.BuildInspection = (function () {
  var B = {}, serial = 0;
  function el(tag, cls, text, parent) {
    var n = document.createElement(tag); n.className = cls; n.textContent = text || '';
    if (parent) parent.appendChild(n); return n;
  }
  B.family = function (s, item) {
    var ev = s.hero.evolved || {};
    return Object.keys(ev).find(function (base) { return ev[base] === item; }) || item;
  };
  B.tags = function (s, item) {
    if (!P.Progression.isWeapon(item)) return null;
    var mods = (s.hero.mods || {})[B.family(s, item)] || [];
    if (!mods.length) return null;
    var n = el('span', 'slot-tags slot-count', String(mods.length));
    n.setAttribute('aria-label', P.t('a9.build.mods', { n: mods.length })); return n;
  };
  B.bind = function (button, s, item, container) {
    button.dataset.buildItem = item;
    button.type = 'button'; button.setAttribute('aria-label', P.t('a9.build.inspect', { item: P.t('item.' + item) }));
    button.onclick = function () { B.open(s, item, container, button); };
  };
  B.open = function (s, item, container, button) {
    var parent = container.parentNode, old = parent.querySelector('.build-detail');
    if (old) old.remove();
    var box = el('section', 'build-detail', '', parent), id = 'build-detail-' + (++serial);
    box.id = id; box.setAttribute('role', 'region'); button.setAttribute('aria-controls', id);
    var title = el('h3', '', P.t('a9.build.detail', { item: P.t('item.' + item), n: s.hero.weapons[item] || s.hero.passives[item] }), box);
    title.tabIndex = -1; box.setAttribute('aria-labelledby', id + '-title'); title.id = id + '-title';
    el('p', 'caption', P.t('a9.build.scope'), box);
    var family = B.family(s, item), mods = (s.hero.mods || {})[family] || [];
    if (P.Progression.isWeapon(item)) {
      var bonus = P.Mastery.bonus(s, family);
      el('p', '', P.t('a9.build.bonus', { dmg: Math.round((bonus.dmg - 1) * 100), cd: Math.round((1 - bonus.cd) * 100) }), box);
      if (!mods.length) el('p', '', P.t('a9.build.none'), box);
      mods.forEach(function (mod) { el('h4', '', P.t('mod.' + mod), box); el('p', '', P.t('moddesc.' + mod), box); });
    } else el('p', '', P.t('desc.' + item), box);
    var close = el('button', 'btn small', P.t('a9.build.close'), box);
    close.type = 'button'; close.onclick = function () { box.remove(); button.focus({ preventScroll: true }); };
    title.focus({ preventScroll: true }); P.UIMotion.revealWithin(box.closest('.screen'),box);
  };
  return B;
})();
