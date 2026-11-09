// Hood title card (workstream F). Stage 1 of a hood: a 3 s postcard with a landmark vignette, hood name, district,
// "km X.X / 17" and one local fact. Stages 2-5: a 1.5 s banner "KARAKÖY · 2/5 · Rıhtım Caddesi" (pointer-events none).
// API: P.HoodCard.show(levelInfo, {big: bool}, onDone). levelInfo = P.Journey.level(i) or sim.levelInfo.
// onDone runs exactly once (on timeout or tap). P.HoodCard.hide() removes any card without calling onDone.
P.HoodCard = (function () {
  var H = {}, cur = null, BIG_MS = 3000, SMALL_MS = 1500;
  var FACTS = {
    istiklal: ['Tünel, 1875’te açılmış, dünyanın en eski yeraltı şehir raylı sistemlerinden biridir.', 'The Tünel funicular opened in 1875 and is one of the world’s oldest underground urban railways.'],
    galata: ['Galata Kulesi, 1348’de Cenevizliler tarafından inşa edildi.', 'Galata Tower was built by the Genoese in 1348.'],
    karakoy: ['Karaköy iskelesi, Boğaz vapurlarının eski kalkış noktalarından biridir.', 'Karaköy pier is one of the old departure points for Bosphorus ferries.'],
    bridge: ['Galata Köprüsü’nün alt katında balık restoranları yer alır.', 'The lower deck of Galata Bridge is lined with fish restaurants.'],
    eminonu: ['Mısır Çarşısı, 17. yüzyılda kurulmuş kapalı bir baharat ve kuruyemiş pazarıdır.', 'The Spice Bazaar is a covered market of spices and nuts dating from the 17th century.'],
    sirkeci: ['Sirkeci Garı 1890’da açıldı; Avrupa’dan gelen demiryolu hattının İstanbul’daki son durağıydı.', 'Sirkeci Station opened in 1890 as the Istanbul end of the railway line from Europe.'],
    kapalicarsi: ['Kapalıçarşı’da 60’tan fazla sokak ve binlerce dükkân vardır.', 'The Grand Bazaar has more than 60 streets and thousands of shops.'],
    beyazit: ['Sahaflar, eski kitapların satıldığı Beyazıt’ın ünlü sokağıdır.', 'Sahaflar is Beyazıt’s famous lane of second-hand books.'],
    laleli: ['Laleli, 1980’lerden beri tekstil ve hazır giyim toptancılığıyla bilinir.', 'Laleli has been known for textile and ready-to-wear wholesale since the 1980s.'],
    aksaray: ['Aksaray, minibüs, otobüs ve metro bağlantılarının kesiştiği büyük bir kavşaktır.', 'Aksaray is a major junction where minibus, bus and metro lines meet.'],
    kumkapi: ['Kumkapı, meyhaneleri ve balık pazarıyla bilinen eski bir semttir.', 'Kumkapı is an old district known for its meyhanes and fish market.'],
    yenikapi: ['Yenikapı kazılarında Bizans dönemine ait ahşap gemi kalıntıları bulundu.', 'Excavations at Yenikapı uncovered wooden ship hulls from the Byzantine era.'],
    samatya: ['Samatya’nın ahşap evleri, eski Rum ve Ermeni mahallelerinin dokusunu taşır.', 'Samatya’s wooden houses keep the texture of its former Greek and Armenian neighbourhoods.'],
    yedikule: ['Yedikule Surları, Teodosyus surlarının güney ucunda yer alır.', 'The Yedikule walls mark the southern end of the Theodosian walls.'],
    zeytinburnu: ['Zeytinburnu, İstanbul’un deri ve tekstil atölyeleriyle bilinen ilçelerinden biridir.', 'Zeytinburnu is known for its leather and textile workshops.'],
    kazlicesme: ['Kazlıçeşme kıyısı, Marmara Denizi’ne bakan yeşil bir sahil parkıdır.', 'The Kazlıçeşme shore is a green coastal park facing the Sea of Marmara.'],
    bakirkoy: ['Bakırköy Çarşı, yaya caddesi ve eski meydanıyla semtin alışveriş merkezidir.', 'Bakırköy’s market has a pedestrian street and an old square at its heart.'],
    bakirkoysahil: ['Bakırköy sahili, Marmara kıyısı boyunca uzanan uzun bir yürüyüş yoludur.', 'The Bakırköy shore is a long promenade along the Sea of Marmara.'],
    atakoysahil: ['Ataköy Marina, İstanbul’un büyük yat limanlarından biridir.', 'Ataköy Marina is one of Istanbul’s large yacht harbours.'],
    atakoy: ['Ataköy’ün büyük konut siteleri 1960’lı ve 1970’li yıllarda inşa edildi.', 'Ataköy’s large housing estates were built in the 1960s and 1970s.']
  };
  if (P.STR) {
    Object.assign(P.STR.tr, { 'hc.km': 'km', 'hc.fact': 'BİLGİ', 'hc.skip': 'geçmek için dokun' });
    Object.assign(P.STR.en, { 'hc.km': 'km', 'hc.fact': 'DID YOU KNOW', 'hc.skip': 'tap to skip' });
  }

  function tx(k, v) { return P.t ? P.t(k, v) : k; }
  function upper(s) { return P.upper ? P.upper(s) : s.toUpperCase(); }
  function still() { return !!(P.Settings && P.Settings.reduceMotion); }
  function el(tag, cls, text) {
    var e = document.createElement(tag); if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function host() { return document.getElementById('phone') || document.body; }
  function sfx() { if (P.Sfx && P.Sfx.play) P.Sfx.play('hoodIntro'); }
  function en() { return P.lang === 'en'; }

  // Landmark vignette on a canvas (device-scaled), over a warm sky wash from the hood's time-of-day tint.
  function vignette(th, hi, w, h) {
    var k = window.devicePixelRatio || 1, cv = el('canvas', 'hc-art'), c, g, t = P.Themes.tint(hi);
    cv.width = Math.round(w * k); cv.height = Math.round(h * k);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, 0, 0);
    g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgb(' + Math.round(t[0]) + ',' + Math.round(t[1]) + ',' + Math.round(t[2]) + ')');
    g.addColorStop(1, '#F4EBDD');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    P.Landmarks.card(c, w, h, th, 0);
    return cv;
  }
  function bigCard(li, th, hood) {
    var card = el('div', 'hc-card'), sub = P.Themes.subOf(th, 0), hi = li.hoodIndex + 0.0, f = FACTS[hood.id] || FACTS.istiklal;
    card.appendChild(vignette(th, hi, 300, 170));
    card.appendChild(el('div', 'hc-district', hood.district));
    card.appendChild(el('div', 'hc-name', upper(hood.name)));
    card.appendChild(el('div', 'hc-km', tx('hc.km') + ' ' + hood.km.toFixed(1) + ' / ' + P.Journey.totalKm));
    var fact = el('div', 'hc-fact'); fact.appendChild(el('b', null, tx('hc.fact') + '  ')); fact.appendChild(document.createTextNode(en() ? f[1] : f[0]));
    card.appendChild(fact);
    var p = plan(li);
    if (p) card.appendChild(p);
    card.appendChild(el('div', 'hc-skip', tx('hc.skip')));
    card.setAttribute('data-sub', en() ? sub.en : sub.tr);
    return card;
  }
  // Objective and run condition of the level (lane P). Null on level 1, which has neither.
  function plan(li) {
    var ob = P.Objectives && P.Objectives.forLevel(li), md = P.Modifiers && P.Modifiers.forLevel(li), box;
    if (!ob && !md) return null;
    box = el('div', 'hc-plan');
    if (ob) box.appendChild(el('div', 'hc-obj', tx('hc.obj', { name: tx('obj.' + ob + '.title') })));
    if (md) box.appendChild(el('div', 'hc-mod', tx('hc.mod', { name: tx('hmod.' + md.id + '.name') })));
    return box;
  }
  function banner(li, th, hood) {
    var stage = li.stage || 1, sub = P.Themes.subOf(th, stage - 1), b = el('div', 'hc-banner', upper(hood.name) + ' · ' + stage + '/5 · ' + (en() ? sub.en : sub.tr));
    var p = plan(li);
    if (p) b.appendChild(p);
    return b;
  }
  function finish() {
    var c = cur; if (!c || c.done) return;
    c.done = true; clearTimeout(c.timer); H.hide(true);
    if (c.onDone) c.onDone();
  }
  H.hide = function (keepCb) {
    if (!cur) return;
    clearTimeout(cur.timer);
    if (cur.el && cur.el.parentNode) cur.el.parentNode.removeChild(cur.el);
    if (!keepCb) cur.done = true;
    cur = null;
  };
  // Show the card for a level. opts.big overrides the default (big at stage 1 only).
  H.show = function (li, opts, onDone) {
    var hood = li.hood, th = P.Themes.get(hood.theme), big = opts && typeof opts.big === 'boolean' ? opts.big : (li.stage || 1) === 1;
    H.hide();
    var ov = el('div', 'hc-overlay' + (big ? ' hc-big' : ' hc-small') + (still() ? ' hc-still' : ''));
    ov.appendChild(big ? bigCard(li, th, hood) : banner(li, th, hood));
    if (big) ov.addEventListener('click', finish);
    host().appendChild(ov);
    cur = { el: ov, done: false, onDone: onDone, timer: null };
    sfx();
    cur.timer = setTimeout(finish, big ? BIG_MS : SMALL_MS);
    return ov;
  };
  return H;
})();
