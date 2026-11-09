// UI strings added in AUDIT-6 lane F (boot fallback, settings that matter, map CTA). TR and EN. Down-screen and
// quit-note strings live in strings.js. Turkish caps are typed out in the source (İ, I): CSS uppercase is only right
// when the lang attribute is tr, so the source already carries the capitals.
Object.assign(P.STR.tr, {
  'ui.boot.fail': 'Yüklenemedi, tekrar dene',
  'ui.set.music': 'Müzik', 'ui.set.haptics': 'Titreşim', 'ui.set.joy': 'Joystick yönü',
  'ui.set.joyL': 'Sol', 'ui.set.joyR': 'Sağ', 'ui.set.shake': 'Ekran sarsıntısı',
  'ui.set.reduceFlash': 'Yanıp sönme azalt', 'ui.set.note': 'Bu ayarlar yalnızca görüntüyü ve dokunmayı etkiler; oyunu değiştirmez.',
  'meta.doneHead': 'Yolculuk',
});
Object.assign(P.STR.en, {
  'ui.boot.fail': 'Could not load. Try again.',
  'ui.set.music': 'Music', 'ui.set.haptics': 'Haptics', 'ui.set.joy': 'Joystick side',
  'ui.set.joyL': 'Left', 'ui.set.joyR': 'Right', 'ui.set.shake': 'Screen shake',
  'ui.set.reduceFlash': 'Reduce flashing', 'ui.set.note': 'These settings change the view and touch only; they never change the game.',
  'meta.doneHead': 'Journey',
});
