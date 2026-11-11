// Player settings + tiny save (localStorage). The sim never reads these (ARCH 4.17).
// AUDIT-6 F5 adds view and comfort settings: music level (0-100, step 25), haptics, joystick side (HUD mirrors with it),
// screen shake (0, 50, 100%) and reduced flashing. Render and input read them; P.applySettings pushes the ones that
// have a live hook (music level, side, flashing class).
(function () {
  var KEY = 'istanbul_proto_v1';
  var MUSIC_BASE = 0.7;   // music level 100 = the prototype's default mix (P.Music starts at 0.7)
  var MUSIC_STEPS = [0, 25, 50, 75, 100], SHAKE_STEPS = [0, 50, 100];
  // First launch: the phone's language picks the script. Any tr* gives Turkish, anything else gives English (D-051). The result is
  // saved as the player's setting and the Settings control overrides it. ?lang=tr|en overrides for testing and is not saved.
  P.detectLang = function (list) {
    for (var i = 0; list && i < list.length; i++) if (/^tr([-_]|$)/i.test(String(list[i]))) return 'tr';
    return 'en';
  };
  var phoneLangs = typeof navigator === 'undefined' ? [] : navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  var defaults = { lang: P.detectLang(phoneLangs), sound: true, subs: true, reduceMotion: false, dmgNumbers: true, blood: true,
                   firstRunDone: false, l1Cleared: false, coldOpenSeen: false, installId: null,
                   musicVol: 100, haptics: true, joySide: 'right', shake: 100, reduceFlash: false, devTools: false };
  var LANGS = ['tr', 'en'];
  var BOOLS = ['sound', 'subs', 'reduceMotion', 'dmgNumbers', 'blood', 'firstRunDone', 'l1Cleared', 'coldOpenSeen',
               'haptics', 'reduceFlash', 'devTools'];
  var data = {};
  try { data = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { data = {}; }
  // A stored value that is not a plain object (null, a number, a string, an array) counts as no settings. Before this
  // check, 'reduceMotion' in data threw on null/5/"x" when the OS asked for reduced motion, and startup never got past
  // settings.js (AUDIT-7 CR-4).
  if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};
  P.Settings = Object.assign({}, defaults, data);
  // Every fixed-type key falls back to its default when the stored value has another type (a damaged save cannot break
  // the menu, the language or startup).
  BOOLS.forEach(function (k) { if (typeof P.Settings[k] !== 'boolean') P.Settings[k] = defaults[k]; });
  if (LANGS.indexOf(P.Settings.lang) < 0) P.Settings.lang = defaults.lang;
  if (typeof P.Settings.installId !== 'string' || !P.Settings.installId) P.Settings.installId = 'i-' + Math.random().toString(36).slice(2, 10);
  // Stored values outside the offered steps fall back to the default (a hand-edited save cannot break the menu).
  if (MUSIC_STEPS.indexOf(P.Settings.musicVol) < 0) P.Settings.musicVol = defaults.musicVol;
  if (SHAKE_STEPS.indexOf(P.Settings.shake) < 0) P.Settings.shake = defaults.shake;
  if (P.Settings.joySide !== 'left' && P.Settings.joySide !== 'right') P.Settings.joySide = defaults.joySide;
  P.SettingSteps = { music: MUSIC_STEPS, shake: SHAKE_STEPS };   // offered values (screens.js cycles through them)
  P.saveSettings = function () {
    try { localStorage.setItem(KEY, JSON.stringify(P.Settings)); } catch (e) { /* private mode: ignore */ }
  };
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches && !('reduceMotion' in data)) {
    P.Settings.reduceMotion = true;
  }
  // Pushes the settings that have a live hook: music level, HUD mirror (joystick side) and the flashing class.
  P.applySettings = function () {
    if (P.Music && P.Music.setVolume) P.Music.setVolume(MUSIC_BASE * P.Settings.musicVol / 100);
    var ph = typeof document !== 'undefined' ? document.getElementById('phone') : null;
    if (!ph) return;
    ph.classList.toggle('lefty', P.Settings.joySide === 'left');
    ph.classList.toggle('reduce-flash', !!P.Settings.reduceFlash);
  };
  // Gore colour: red blood (default, pending owner decision D-024) or DS 'ink splats'. View-only.
  P.goreRGB = function (shade) {
    if (P.Settings.blood === false) return ['20,21,31', '34,36,48', '48,50,64'][shade || 0];
    return ['86,14,20', '120,20,28', '160,24,36'][shade || 0];
  };
  var urlLang = typeof location !== 'undefined' && /[?&]lang=(tr|en)(&|$)/.exec(location.search);
  P.lang = urlLang ? urlLang[1] : P.Settings.lang;
  P.saveSettings();
})();
