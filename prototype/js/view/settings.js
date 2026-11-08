// Player settings + tiny save (localStorage). The sim never reads these (ARCH 4.17).
(function () {
  var KEY = 'istanbul_proto_v1';
  var defaults = { lang: 'tr', sound: true, subs: true, reduceMotion: false, dmgNumbers: true, blood: true,
                   firstRunDone: false, l1Cleared: false, coldOpenSeen: false, installId: null };
  var data = {};
  try { data = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { data = {}; }
  P.Settings = Object.assign({}, defaults, data);
  if (!P.Settings.installId) P.Settings.installId = 'i-' + Math.random().toString(36).slice(2, 10);
  P.saveSettings = function () {
    try { localStorage.setItem(KEY, JSON.stringify(P.Settings)); } catch (e) { /* private mode: ignore */ }
  };
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches && !('reduceMotion' in data)) {
    P.Settings.reduceMotion = true;
  }
  // Gore colour: red blood (default, pending owner decision D-024) or DS 'ink splats'. View-only.
  P.goreRGB = function (shade) {
    if (P.Settings.blood === false) return ['20,21,31', '34,36,48', '48,50,64'][shade || 0];
    return ['86,14,20', '120,20,28', '160,24,36'][shade || 0];
  };
  P.lang = P.Settings.lang;
  P.saveSettings();
})();
