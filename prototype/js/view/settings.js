// Player settings + tiny save (localStorage). The sim never reads these (ARCH 4.17).
// AUDIT-6 F5 adds view and comfort settings: haptics, joystick side (HUD mirrors with it), screen shake (0, 50, 100%) and
// reduced flashing. T4 part 8 adds two volume sliders, 0-100 in 10% steps: Music (musicVol: P.Music) and Sound effects
// (sfxVol: the sfx, ui, ambience and voice buses). The game has no voice acting, so comic speech blips and zombie groans are
// sound effects and follow the Sound effects slider (sfx.js routes the voice bus through the sfx bus). T4 part 9 removed the
// Voice slider; a saved voiceVol is ignored. Render and input read them; P.applySettings pushes the ones that have a live hook.
(function () {
  var KEY = 'istanbul_proto_v1';
  var MUSIC_BASE = 0.5;   // music level 100 = the default mix: -6 dB from the file level, so effects stay clearly above it (phone playtest: music masked the SFX at 0.7)
  var SHAKE_STEPS = [0, 50, 100], TEXT_STEPS = [100, 125, 150];   // shake and text size: DS 4
  // First launch: the phone's language picks the script. Any tr* gives Turkish, anything else gives English (D-051). The result is
  // saved as the player's setting and the Settings control overrides it. ?lang=tr|en overrides for testing and is not saved.
  P.detectLang = function (list) {
    for (var i = 0; list && i < list.length; i++) if (/^tr([-_]|$)/i.test(String(list[i]))) return 'tr';
    return 'en';
  };
  var phoneLangs = typeof navigator === 'undefined' ? [] : navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  var defaults = { lang: P.detectLang(phoneLangs), sound: true, subs: true, reduceMotion: false, dmgNumbers: true, blood: true,
                   firstRunDone: false, l1Cleared: false, coldOpenSeen: false, installId: null,
                   musicVol: 100, sfxVol: 100, haptics: true, joySide: 'any', shake: 100, reduceFlash: false,
                   devTools: false, textSize: 100 };
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
  // The old "Sound effects" on/off switch muted every bus. Its replacement, the Sound effects slider, starts at 0 for a
  // player who had it off. The flag itself is retired and stays true.
  if (P.Settings.sound === false && !('sfxVol' in data)) P.Settings.sfxVol = 0;
  P.Settings.sound = true;
  if (LANGS.indexOf(P.Settings.lang) < 0) P.Settings.lang = defaults.lang;
  if (typeof P.Settings.installId !== 'string' || !P.Settings.installId) P.Settings.installId = 'i-' + Math.random().toString(36).slice(2, 10);
  // Volumes: a saved number is clamped to 0-100 and rounded to the 10% step (a 25 from the old steps becomes 30); anything
  // that is not a number is the default. Stored values outside the offered steps fall back to the default too.
  function volume(v, d) { return typeof v === 'number' && isFinite(v) ? Math.round(Math.min(100, Math.max(0, v)) / 10) * 10 : d; }
  P.Settings.musicVol = volume(P.Settings.musicVol, defaults.musicVol);
  P.Settings.sfxVol = volume(P.Settings.sfxVol, defaults.sfxVol);
  // The Voice slider is retired (T4 part 9): a saved voiceVol is dropped here, so it is not written back on the next save.
  delete P.Settings.voiceVol;
  if (SHAKE_STEPS.indexOf(P.Settings.shake) < 0) P.Settings.shake = defaults.shake;
  if (TEXT_STEPS.indexOf(P.Settings.textSize) < 0) P.Settings.textSize = defaults.textSize;
  if (P.Settings.joySide !== 'left' && P.Settings.joySide !== 'right' && P.Settings.joySide !== 'any') P.Settings.joySide = defaults.joySide;
  // The old default was 'right', which silently ignored every touch in the left 45% of the screen (design: the stick spawns anywhere in
  // the lower 60%). A save made before this migration moves to 'any' once; the choice made afterwards is kept.
  if (data.joyMig !== 2) { P.Settings.joySide = 'any'; P.Settings.joyMig = 2; }
  P.SettingSteps = { shake: SHAKE_STEPS, text: TEXT_STEPS };   // offered values (screens.js cycles through them)
  P.saveSettings = function () {
    try { localStorage.setItem(KEY, JSON.stringify(P.Settings)); } catch (e) { /* private mode: ignore */ }
  };
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches && !('reduceMotion' in data)) {
    P.Settings.reduceMotion = true;
  }
  // Pushes the settings that have a live hook: the two volumes (at boot too), HUD mirror (joystick side), the flashing
  // class, the motion class and the UI text size.
  P.applySettings = function () {
    if (P.Music && P.Music.setVolume) P.Music.setVolume(MUSIC_BASE * P.Settings.musicVol / 100);
    if (P.Sfx && P.Sfx.setVolume) {
      var fx = P.Settings.sfxVol / 100;   // the voice bus is not set here: it sits inside the sfx bus (sfx.js)
      P.Sfx.setVolume('sfx', fx); P.Sfx.setVolume('ui', fx); P.Sfx.setVolume('ambience', fx);
    }
    var ph = typeof document !== 'undefined' ? document.getElementById('phone') : null;
    if (!ph) return;
    ph.classList.toggle('lefty', P.Settings.joySide === 'left');
    ph.classList.toggle('reduce-flash', !!P.Settings.reduceFlash);
    ph.classList.toggle('reduce-motion', !!P.Settings.reduceMotion);   // the in-game switch does what the OS query does
    ph.style.setProperty('--ui-text', String(P.Settings.textSize / 100));   // UI text scale (css: calc(Npx * var(--ui-text))); canvas art does not scale
    // Street Cred: in the XP line below 150% text; in HUD row 2 at 150%, so the streak chip keeps the XP bar at least 120 px
    // wide (at 150% it was 58 px). Row 2 is the objective and the call strip; the move is a DOM move, never mid-run.
    // At 125% the move would cut the objective title (58 px), so 125% keeps the XP-line placement.
    var sk = document.getElementById('sk-meter'), xp = document.querySelector('.hud-xp'), sub = document.querySelector('.hud-sub');
    if (sk && xp && sub) {
      var host = P.Settings.textSize >= 150 ? sub : xp;
      if (sk.parentNode !== host) host.insertBefore(sk, host === sub ? sub.firstChild : xp.querySelector('.xp-bar'));
    }
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
