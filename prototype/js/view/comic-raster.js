// ImageGen atlases used by story pages, live dialogue, contacts and character menus.
P.ComicRaster = (function () {
  var C = {}, images = {}, active = {}, waiting = [], pending = 0;
  var base = document.currentScript && document.currentScript.src || document.baseURI;
  var cast = {
    arda: [0,11,26,364,468], anne: [0,399,30,355,464], baba: [0,777,21,363,473], usta: [0,1166,41,363,453],
    kaan: [0,11,517,373,488], mila: [0,384,530,381,475], ada: [0,779,541,356,464], dede: [0,1156,531,373,474],
    ahmet: [1,16,40,363,444], shopkeeper: [1,398,32,361,452], news: [1,778,29,359,455], stranger: [1,1157,31,363,454],
    zombie: [1,16,549,354,444],
  };
  var expressive = { arda: [1,395,534,366,459], anne: [1,777,546,359,447], kaan: [1,1153,535,367,458] };
  var farewell = { grief: [2,44,6,410,487], steady: [2,658,4,457,489] };
  var listening = { arda: [3,0,5,384,502], anne: [3,398,10,370,497] };
  var restrained = ['neutral', 'sad', 'worried', 'determined', 'steady'];
  var moods = ['scared', 'worried', 'shout', 'hurt', 'angry'];
  var castFiles = ['cast-core', 'cast-support', 'kaan-farewell', 'cast-listening-v1'];
  var sceneFiles = ['scenes-a-story-v2', 'scenes-b', 'scenes-c', 'scenes-d', 'shelter-action', 'pasa-street-v1'];
  var sceneRows = [
    ['istiklal','tram','street','galata','cafe','pier','bridge','quay','hall'],
    ['tunnel','bazaar','square','shopwin','road','fishquay','sea','walls','yard'],
    ['lawn','arcade','promenade','marina','apartment','lobby','window','horde','night'],
    ['campfire','coast','dusk','fin_street','fin_balcony','fin_phone','fin_flat','fin_door'],
  ];
  var scenes = {};
  sceneRows.forEach(function (keys, i) {
    keys.forEach(function (key, j) { scenes[key] = [i, j % 3, Math.floor(j / 3)]; });
  });
  scenes.shelter = [4, 0, 0, true];
  scenes.pasa = [5, 0, 0, true];

  function load(key, retry) {
    var im = new Image();
    active[key] = im;
    function finish(loaded) {
      if (active[key] === im) { active[key] = null; if (loaded) images[key] = im; }
      pending--;
      if (!pending) waiting.splice(0).forEach(function (fn) { fn(); });
    }
    pending++;
    im.onload = function () { finish(true); };
    im.onerror = function () { finish(false); };
    var url = new URL('../../assets/comic/' + key + (key === 'shelter-action' ? '.png' : '.webp'), base);
    if (retry) url.searchParams.set('retry', String(Date.now()));
    im.src = url.href;
  }
  C.ready = function () { return pending === 0; };
  C.whenReady = function (fn) { if (C.ready()) fn(); else waiting.push(fn); };
  C.sceneKeys = function () { return Object.keys(scenes); };
  C.castKeys = function () { return Object.keys(cast); };

  C.actorId = function (who) {
    var actor = who === 'friend' ? 'stranger' : who === 'mom' ? 'anne' : who;
    return Object.prototype.hasOwnProperty.call(cast, actor) ? actor : null;
  };
  function portrait(who, mood) {
    var actor = C.actorId(who);
    if (!actor) return null; // Unknown identity stays neutral; it must never impersonate the stranger.
    return actor === 'kaan' && farewell[mood] || restrained.indexOf(mood) >= 0 && listening[actor] ||
      moods.indexOf(mood) >= 0 && expressive[actor] || cast[actor];
  }
  C.pageArt = function (page, retry) {
    var files = {};
    page.panels.forEach(function (panel) {
      files[sceneFiles[(scenes[panel.bg] || scenes.street)[0]]] = true;
      (panel.ch || []).forEach(function (ch) { var p = portrait(ch[0], ch[1]); if (p) files[castFiles[p[0]]] = true; });
    });
    var missing = Object.keys(files).filter(function (key) { return !images[key]; });
    if (retry) missing.forEach(function (key) { load(key, true); });
    if (missing.every(function (key) { return !!images[key]; })) return 'ready';
    return missing.some(function (key) { return !!active[key]; }) ? 'loading' : 'failed';
  };

  C.scene = function (c, w, h, key) {
    var p = scenes[key] || scenes.street, im = images[sceneFiles[p[0]]];
    if (!im) { c.fillStyle = '#303745'; c.fillRect(0, 0, w, h); return c; }
    var cellW = im.naturalWidth / (p[3] ? 1 : 3), cellH = im.naturalHeight / (p[3] ? 1 : 3), inset = 2;
    var sw = cellW - inset * 2, sh = cellH - inset * 2;
    var scale = Math.max(w / sw, h / sh), cw = w / scale, ch = h / scale;
    c.drawImage(im, p[1] * cellW + inset + (sw - cw) / 2,
      p[2] * cellH + inset + (sh - ch) / 2, cw, ch, 0, 0, w, h);
    return c;
  };

  C.bust = function (c, who, mood, x, y, h, opts) {
    var o = opts || {}, p = portrait(who, mood);
    if (!p) return;
    var im = images[castFiles[p[0]]];
    if (!im) return;
    var w = h * p[3] / p[4];
    var talk = P.Settings && P.Settings.reduceMotion ? 0 : (o.talk || 0) * h * .008;
    c.save();
    c.translate(x, y - talk);
    if (!!o.flip !== (p === listening.anne)) c.scale(-1, 1);
    if (o.alpha !== undefined) c.globalAlpha *= o.alpha;
    c.drawImage(im, p[1], p[2], p[3], p[4], -w / 2, -h, w, h);
    c.restore();
  };

  castFiles.concat(sceneFiles).forEach(function (key) { load(key, false); });
  return C;
})();
