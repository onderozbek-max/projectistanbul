// Immediate player goals for authored arrivals. Specific live states take over once play starts.
(function () {
  var tr = [
    'Lokantayı temizle, sokağa çık.', 'Durağa ulaş ve tramvayı çağır.', 'Rayları geç, simit arabasının yanından ilerle.',
    'Canlı kabloları kesip yolu aç.', 'Depo kepengini aç, Vatman’la yüzleş.', 'Karşı ağırlığı çalıştırıp geçidi aç.',
    'Müzisyeni güvenli yere götür.', 'Çanı kullanıp kalabalığı başka yöne çek.', 'Karşı ağırlığı taşı, köprüyü indir.',
    'Avluya gir, Kule Bekçisi’nin hamlelerini oku.', 'Yük vincini çalıştır, geçidi aç.', 'Vapuru palamarından çöz.',
    'Ray makasını değiştir, geçişi aç.', 'Balıkçı kepenklerini açıp yolu değiştir.', 'Rampayı indir, Gelin’le yüzleş.',
    'Oltaların menzilinden çıkıp köprüde ilerle.', 'Mahsur kalan kişiye ulaş ve onu çekip çıkar.', 'Siperleri indirip kalabalığın yönünü kes.',
    'Dalga yaklaşırken sağlam noktalara geç.', 'Köprü mekanizmasını çalıştır, Balıkçı’yla yüzleş.', 'Tenteyi kaldırıp Kaan’la ilerle.',
    'Pazar arabasını geçişte kullan.', 'Çuvalları kaldırırken Kaan’ın açtığı alanı koru.', 'Pazar sinyaliyle geçişi aç.',
    'Avluya gir, Kaptan’ın çapasından sakın.', 'Peronu boşaltmak için treni gönder.', 'Gar rehberinin önünü aç.',
    'Saati çalıştırıp uygun geçiş anını yakala.', 'Işıkları kullanıp perondan geç.', 'Rayları değiştir, Biletçi’yi geç.'
  ];
  var en = [
    'Clear the restaurant and get outside.', 'Reach the stop and call the tram.', 'Cross the tracks and push past the simit cart.',
    'Cut the live wires to clear the street.', 'Open the depot shutter and face the Vatman.', 'Move the counterweight to clear the passage.',
    'Escort the musician to safety.', 'Ring the bell to draw the crowd away.', 'Carry the counterweight to lower the footbridge.',
    'Enter the courtyard and read the Tower Keeper’s attacks.', 'Use the cargo hook to open the passage.', 'Release the ferry’s mooring.',
    'Switch the tram points to clear the route.', 'Use the fish shutters to redirect the crowd.', 'Lower the dock ramp and face the Bride.',
    'Keep clear of the rods as you cross the bridge.', 'Reach the stranded person and pull them to safety.', 'Lower the screens to break the crowd’s approach.',
    'Find a brace point before the wave hits.', 'Operate the lift and face the Fisherman.', 'Lift the awning and move through with Kaan.',
    'Use the market cart to get through.', 'Move the sacks and protect the space Kaan opens.', 'Signal the trolley to clear the market passage.',
    'Enter the yard and evade the Captain’s anchor.', 'Send the train on to clear the platform.', 'Make a path for the station guide.',
    'Set the clock and cross in the opening.', 'Use the station lights to find a way through.', 'Switch the tracks and get past the Ticket Man.'
  ];
  tr.forEach(function (line, i) { P.STR.tr['slice.goal.' + (i + 1)] = line; });
  en.forEach(function (line, i) { P.STR.en['slice.goal.' + (i + 1)] = line; });
  Object.assign(P.STR.tr, { 'pause.health': 'Can {hp} / {max}', 'pause.focus': 'Evrim planı · {step}', 'pause.run': 'BU KOŞU', 'pause.options': 'Koşu seçenekleri' });
  Object.assign(P.STR.en, { 'pause.health': 'Health {hp} / {max}', 'pause.focus': 'Evolution plan · {step}', 'pause.run': 'THIS RUN', 'pause.options': 'Run options' });
  Object.assign(P.STR.tr, {
    'choice.shelter': 'Siperli yol', 'choice.direct': 'Kısa yol', 'choice.lit': 'Aydınlık yol', 'choice.lure': 'Kalabalığı çek',
    'choice.escort': 'Rehber için bir yol seç', 'choice.station': 'Geçişi aydınlat ya da kalabalığı çek',
    'choice.lift': 'Almak için yanında dur', 'choice.escape': 'Depar · Elindekini bırak',
    'choice.ready.wedge': 'Arabayı işarete bırak · Geçişi koru', 'choice.ready.cover': 'İşaretli siper noktasına bırak',
    'choice.ready.lure': 'İşarete bırak · Kalabalığı çek',
    'choice.memory.7.shelter': 'Müzisyen siperli yoldan geçti.', 'choice.memory.7.direct': 'Müzisyen açık geçitten kurtuldu.',
    'choice.memory.22.place': 'Pazar geçidi arabanın gerisinde güvende.', 'choice.memory.22.offense': 'Pazar yolundaki kalabalık dağıldı.',
    'choice.memory.29.lit': 'Açtığın ışıklarla perona kadar geldik.', 'choice.memory.29.lure': 'Kalabalık o sesi duyunca yan koridora gitti.',
    'ui.down.pressure': 'Daha önce hasar aldığın kaynak ({cause})'
  });
  Object.assign(P.STR.en, {
    'choice.shelter': 'Sheltered lane', 'choice.direct': 'Direct lane', 'choice.lit': 'Lit passage', 'choice.lure': 'Draw them away',
    'choice.escort': 'Choose a lane for the guide', 'choice.station': 'Light the route or draw the crowd away',
    'choice.lift': 'Stand beside it to lift', 'choice.escape': 'Dash to drop what you’re holding',
    'choice.ready.wedge': 'Set the cart down at the crossing', 'choice.ready.cover': 'Set it down at the shelter mark',
    'choice.ready.lure': 'Set it down to draw the crowd',
    'choice.memory.7.shelter': 'The musician made it through the sheltered lane.', 'choice.memory.7.direct': 'The musician made it through the open crossing.',
    'choice.memory.22.place': 'The cart sheltered the market crossing.', 'choice.memory.22.offense': 'The crowd at the market crossing broke up.',
    'choice.memory.29.lit': 'Those lights got us all the way to the platform.', 'choice.memory.29.lure': 'The crowd followed the noise into the side passage.',
    'ui.down.pressure': 'Earlier damage from {cause}'
  });
})();
