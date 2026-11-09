// UI strings added in AUDIT-6 lane F (boot fallback, settings that matter, map CTA). TR and EN. Down-screen and
// quit-note strings live in strings.js. Turkish caps are typed out in the source (İ, I): CSS uppercase is only right
// when the lang attribute is tr, so the source already carries the capitals.
Object.assign(P.STR.tr, {
  'ui.boot.fail': 'Yüklenemedi, tekrar dene',
  'ui.set.music': 'Müzik', 'ui.set.haptics': 'Titreşim', 'ui.set.joy': 'Joystick yönü',
  'ui.set.joyL': 'Sol', 'ui.set.joyR': 'Sağ', 'ui.set.shake': 'Ekran sarsıntısı',
  'ui.set.reduceFlash': 'Yanıp sönme azalt', 'ui.set.note': 'Bu ayarlar yalnızca görüntüyü ve dokunmayı etkiler; oyunu değiştirmez.',
  'ui.down.tipGeneric': 'İpucu: Durma. Hareket et, sonra vur.',
  'tip.bloater': 'İpucu: Şişman zombi patlayınca zehirli bulut bırakır. Uzak dur.',
  'tip.brute': 'İpucu: İri zombi yüklenir ve yere vurur. Yan adım at, sonra vur.',
  'tip.spitter': 'İpucu: Tükürükçü uzaktan vurur. Asit birikintisinden kaç.',
  'tip.screamer': 'İpucu: Çığlıkçı sürüyü çağırır. Önce onu vur.',
  'meta.doneHead': 'Yolculuk',
  'ui.cards.close': 'Kapat', 'ui.cards.hold': 'Ayrıntı için basılı tut',
});
Object.assign(P.STR.en, {
  'ui.boot.fail': 'Could not load. Try again.',
  'ui.set.music': 'Music', 'ui.set.haptics': 'Haptics', 'ui.set.joy': 'Joystick side',
  'ui.set.joyL': 'Left', 'ui.set.joyR': 'Right', 'ui.set.shake': 'Screen shake',
  'ui.set.reduceFlash': 'Reduce flashing', 'ui.set.note': 'These settings change the view and touch only; they never change the game.',
  'ui.down.tipGeneric': 'Tip: keep moving, then strike.',
  'tip.bloater': 'Tip: a fat zombie bursts into a toxic cloud. Keep your distance.',
  'tip.brute': 'Tip: the big zombie charges and stomps. Sidestep, then strike.',
  'tip.spitter': 'Tip: the spitter shoots from range. Get out of the acid pools.',
  'tip.screamer': 'Tip: the screamer calls the horde. Take it out first.',
  'meta.doneHead': 'Journey',
  'ui.cards.close': 'Close', 'ui.cards.hold': 'Hold a card for details',
});
