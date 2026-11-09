// Native tr story text overrides (v0.7, workstream W2-TR). Format: P.LangText.tr[lineId or STR key] = 'text'.
// Only lines that read as translated, nonsensical or forced are rewritten here (the cake and cat panels,
// the karma and GPS jokes, the sneeze and hair-day lines, and a few flat ones). Plot beats and facts are unchanged.
// Applied by lang-apply.js after all string files. Lengths stay within the original +15%.
P.LangText = P.LangText || {};
P.LangText.tr = {};
(function (T) {
  // Wedding café (H03). Arda hungry at the cake window; the Paşa cat leads the way.
  T['H03i1b'] = "Düğün pastası. Gelin de damat da yok. Bir dilim?";
  T['H03i2b'] = "Paşa önden gidiyor. Mahalle onun, biz misafiriz.";
  // Bloater and Eminönü: the captain beat (Kaan's captain is gone).
  T['H05i2a'] = "Kaptanımın teknesi burada bağlıydı. Tekne yerinde, kaptan yerinde değil.";
  // Kaan sneezes; nobody says "çok yaşa" (the sneeze blessing), so he says it to himself.
  T['H05p3'] = "Hapşu! Çok yaşa diyen yok. Kendime diyorum.";
  // Pigeon Man: the birds now wait for him.
  T['H08i3a'] = "Güvercinci her sabah kuş beslerdi. Şimdi kuşlar onu bekliyor. Sıra değişti.";
  // Yedikule: the Key Keeper's keyring.
  T['H14i3a'] = "Anahtarcının halkası her adımda çınlıyor. Gizlice yürümek için en kötü aksesuar.";
  // Bakırköy Sahil: the ice-cream debt (kepçe is the Turkish word for one scoop).
  T['H18i2a'] = "Bir keresinde bana bedava dondurma vermişti. Bir kepçe borcum var.";
  // Kapalıçarşı: shutters closing behind Arda.
  T['H07p1'] = "Kepenkler iniyor! Arkamdan da bir tane indi!";
  // Yenikapı: the stair hold.
  T['H12p2'] = "Merdivende sıra olmuşlar. Basamağı tut, çıkmasınlar.";
  // Level 18: enemy at the bridge. Plain Turkish, no imported idiom.
  T['L18m'] = "Enfekte değilim abi! Sabah kahvemi içmedim, o kadar.";
  // Mom's call: the signal dies like Dede's old radio.
  T['C15b'] = "Anne! Yavaş konuş, kesiliyorsun. Dede'nin radyosu gibi cızırdıyor.";
})(P.LangText.tr);
