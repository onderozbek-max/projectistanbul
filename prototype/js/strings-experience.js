// Interface scope and comparison labels. Voice remains exclusively in js/dialogue/.
(function () {
  Object.assign(P.STR.tr, {
    'exp.plan.title': 'Bu koşunun silah planı',
    'exp.plan.help': 'Sahip olduğun bir silahı seç. Tarif desteği bu silahı izler; saldırıların değişmez. Teklifler yine çeşitlidir. Yalnızca bu koşu için geçerli.',
    'exp.plan.choose': '{weapon} için plan yap', 'exp.plan.following': 'Planın: {weapon}',
    'exp.gear.upgrade': 'Kuşanılmış → yükseltilmiş',
    'exp.gear.compare': 'Kuşanılmış {name} → seçilen eşya',
    'exp.run': 'Bu koşu', 'exp.permanent': 'Kalıcı donanım',
    'exp.loadout': 'Başlangıç silahı {weapon} · {n} kalıcı yetenek',
    'exp.persist': 'Kalıcı ilerleme ve kazançların kaydedildi. Koşu içi silah ve destek seviyeleri yeniden başlar.',
    'exp.boundary': 'İlk 30 bölümün sonu. Yeni bir silah düzeniyle tekrar oynayabilirsin.',
    'ui.art.bossFail': 'Karşılaşmanın çizimleri yüklenemedi. Tekrar deneyebilirsin.',
    'exp.mode.optional': 'Bunlar isteğe bağlı ek mücadeleler. Hikâyeye haritadan devam edebilirsin; hiçbir günlük ödül zorunlu değil.',
    'exp.mode.daily': 'Açılmış bir rotada değişen kurallar. Günde tek deneme; başlatınca hak kullanılır. Hikâyeyi ilerletmez.',
    'exp.mode.shift': 'Gittikçe zorlaşan skor mücadelesi; en fazla 12 dakika. Hikâye turundan daha ağır baskı var. En iyi skor bu cihazda tutulur.',
    'exp.result.ready': '{attr} için bir puan hazır: {effect}. Arda’yı geliştir ekranından kalıcı olarak uygula.',
    'exp.mastery.next': 'Ustalık {n}: {effect}', 'exp.mastery.catalogue': 'Silahlar ve kalıcı ustalık',
    'exp.memory.intention': 'Eve yürüyüşün sürüyor. Şimdiki rota: {hood}.',
    'exp.memory.future': 'Henüz keşfetmediklerin', 'exp.memory.replay': 'Anıyı tekrar oku'
  });
  Object.assign(P.STR.en, {
    'exp.plan.title': 'This run’s weapon plan',
    'exp.plan.help': 'Choose a weapon you own. Recipe help follows it; your attacks stay the same. Offers still vary. Applies only to this run.',
    'exp.plan.choose': 'Plan for {weapon}', 'exp.plan.following': 'Following {weapon}',
    'exp.gear.upgrade': 'Equipped → upgraded',
    'exp.gear.compare': 'Equipped {name} → selected item',
    'exp.run': 'This run', 'exp.permanent': 'Permanent loadout',
    'exp.loadout': 'Starter {weapon} · {n} permanent perks',
    'exp.persist': 'Permanent progress and earnings are saved. Run weapon and passive ranks start fresh.',
    'exp.boundary': 'You reached the end of the first 30 levels. Replay with a different build.',
    'ui.art.bossFail': 'The encounter illustrations did not load. Try again.',
    'exp.mode.optional': 'Optional extra challenges. Continue the story from the map; no daily reward is required.',
    'exp.mode.daily': 'A route you have unlocked, with different rules. One attempt per day, used when you start. Does not advance the story.',
    'exp.mode.shift': 'An escalating score challenge, up to 12 minutes. Heavier pressure than a story run. Best scores stay on this device.',
    'exp.result.ready': 'One {attr} point is ready: {effect}. Apply it permanently in Develop Arda.',
    'exp.mastery.next': 'Mastery {n}: {effect}', 'exp.mastery.catalogue': 'Weapons and permanent mastery',
    'exp.memory.intention': 'Your walk home continues. Current route: {hood}.',
    'exp.memory.future': 'Still to discover', 'exp.memory.replay': 'Read this memory again'
  });
})();
