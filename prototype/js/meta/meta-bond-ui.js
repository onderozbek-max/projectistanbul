// Bond page of the Yetenekler screen (R1-T5 step 4, D-059 section 6): Kaan's meter with its four thresholds, plus locked teasers
// for Mila and Ada. Drawn by meta-tree.js. No cost, no store link: bonds are earned by play only and never sold.
P.Meta = P.Meta || {};
(function (M) {
  var B = M.BondUI = {};
  // Threshold rows: the first two do something in the slice; 75 and 100 are stubs for a later chapter.
  var ROWS = [{ at: 0, key: 'bond.t25' }, { at: 1, key: 'bond.t50' }, { at: 2, key: 'bond.later' }, { at: 3, key: 'bond.later' }];
  function el(tag, cls, parent) {
    var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e;
  }
  function t(k, v) { return P.t(k, v); }
  function meter(card, kaan) {
    var T = P.CFG.bond.kaan.thresholds, bar = el('div', 'meta-bond-bar', card), i, tick;
    el('div', 'meta-bond-fill', bar).style.width = Math.min(100, kaan.value / kaan.max * 100).toFixed(1) + '%';
    for (i = 0; i < T.length - 1; i++) { tick = el('i', 'meta-bond-tick', bar); tick.style.left = (T[i] / kaan.max * 100) + '%'; }
    el('div', 'meta-bond-val', card).textContent = t('bond.meter', { n: kaan.value, max: kaan.max });
  }
  function row(box, kaan, r) {
    var at = P.CFG.bond.kaan.thresholds[r.at], on = kaan.value >= at, d = el('div', 'meta-bond-row' + (on ? ' is-on' : ' is-off'), box);
    el('span', 'meta-bond-at', d).textContent = at;
    var txt = el('div', 'meta-bond-txt', d);
    el('b', null, txt).textContent = t(r.key + '.name');
    el('span', null, txt).textContent = t(r.key + '.desc');
    el('em', 'meta-bond-state', d).textContent = on ? '✓' : '·';
    d.setAttribute('aria-label', t(r.key + '.name') + ', ' + (on ? t('tree.learned') : at));
  }
  function teaser(box, id) {
    var d = el('div', 'meta-bond-teaser', box);
    el('b', null, d).textContent = t('bond.' + id);
    el('span', null, d).textContent = t('bond.soon');
  }
  // Draws into box. kaan: P.Meta.bondState().kaan.
  B.draw = function (box, kaan) {
    box.innerHTML = '';
    var card = el('div', 'meta-bond-card', box);
    el('div', 'meta-bond-name', card).textContent = t('bond.kaan');
    meter(card, kaan);
    ROWS.forEach(function (r) { row(box, kaan, r); });
    teaser(box, 'mila'); teaser(box, 'ada');
    el('p', 'meta-bond-note', box).textContent = t('bond.hint');
  };
})(P.Meta);
