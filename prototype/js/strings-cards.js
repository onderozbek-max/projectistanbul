// Level-up card text (AUDIT-7 U2, lane U): the one-line effect labels ("+20% hasar") and the chip lines.
// Keys: cfx.<stat key> is the short label for a weapon stat delta (config-weapons*.js); card.* is the chip and
// detail text. Passives use their stat.* label (strings.js). TR is written natively; EN is the same meaning.
Object.assign(P.STR.tr, {
  'cfx.dmg': 'hasar', 'cfx.r': 'alan', 'cfx.blast': 'patlama', 'cfx.arcR': 'menzil', 'cfx.zapR': 'menzil',
  'cfx.radius': 'yarıçap', 'cfx.arcDeg': 'açı', 'cfx.spreadDeg': 'yayılma', 'cfx.arcN': 'ark', 'cfx.blades': 'bıçak',
  'cfx.spanX': 'genişlik', 'cfx.stun': 'sersemlik', 'cfx.slamStun': 'sersemlik', 'cfx.slams': 'darbe',
  'cfx.spitBlock': 'engel', 'cfx.every': 'aralık', 'cfx.bottles': 'şişe', 'cfx.bounces': 'sekme', 'cfx.burn': 'yanma',
  'cfx.carMul': 'çarpan', 'cfx.haulR': 'çekme', 'cfx.heal': 'can', 'cfx.life': 'süre', 'cfx.lakeLife': 'süre',
  'cfx.marbles': 'bilye', 'cfx.shots': 'çivi', 'cfx.netShare': 'ağ payı', 'cfx.openT': 'açılış', 'cfx.pierce': 'delme',
  'cfx.proj': 'tüp', 'cfx.pullSpeed': 'çekim', 'cfx.push': 'itme', 'cfx.range': 'menzil', 'cfx.cdMult': 'hız',
  'cfx.tickGap': 'hız', 'cfx.reel': 'makara', 'cfx.rockets': 'roket', 'cfx.root': 'çivileme', 'cfx.slamR': 'darbe alanı',
  'cfx.slow': 'yavaşlatma', 'cfx.lakeSlow': 'yavaşlatma', 'cfx.sparks': 'kıvılcım', 'cfx.speed': 'dönüş hızı',
  'cfx.spinT': 'dönüş süresi', 'cfx.stackMax': 'yığın', 'cfx.stains': 'iz', 'cfx.subs': 'alt patlama', 'cfx.jumps': 'hedef',
  'cfx.zaps': 'şok',
  'card.type.w': 'SİLAH', 'card.type.p': 'PASİF', 'card.type.f': 'DOLGU',
  'card.recipe': 'Tarif: {what}',
  'card.evoReady': 'EVRİM · hazır', 'card.evoLeft': 'EVRİM · {n} şart',
  'card.synergy': 'Sinerji: {weapon}',
  'card.recipeHead': 'Evrim tarifi',
});
Object.assign(P.STR.en, {
  'cfx.dmg': 'damage', 'cfx.r': 'area', 'cfx.blast': 'blast', 'cfx.arcR': 'reach', 'cfx.zapR': 'reach',
  'cfx.radius': 'radius', 'cfx.arcDeg': 'arc', 'cfx.spreadDeg': 'spread', 'cfx.arcN': 'arc', 'cfx.blades': 'blade',
  'cfx.spanX': 'width', 'cfx.stun': 'stun', 'cfx.slamStun': 'stun', 'cfx.slams': 'slam', 'cfx.spitBlock': 'block',
  'cfx.every': 'interval', 'cfx.bottles': 'bottle', 'cfx.bounces': 'bounce', 'cfx.burn': 'burn', 'cfx.carMul': 'car bonus',
  'cfx.haulR': 'pull', 'cfx.heal': 'heal', 'cfx.life': 'duration', 'cfx.lakeLife': 'duration', 'cfx.marbles': 'marble',
  'cfx.shots': 'nail', 'cfx.netShare': 'net share', 'cfx.openT': 'open time', 'cfx.pierce': 'pierce', 'cfx.proj': 'canister',
  'cfx.pullSpeed': 'pull', 'cfx.push': 'push', 'cfx.range': 'range', 'cfx.cdMult': 'rate', 'cfx.tickGap': 'rate',
  'cfx.reel': 'reel', 'cfx.rockets': 'rocket', 'cfx.root': 'pin', 'cfx.slamR': 'slam area', 'cfx.slow': 'slow',
  'cfx.lakeSlow': 'slow', 'cfx.sparks': 'spark', 'cfx.speed': 'spin speed', 'cfx.spinT': 'spin time',
  'cfx.stackMax': 'stack', 'cfx.stains': 'stain', 'cfx.subs': 'sub-blast', 'cfx.jumps': 'target', 'cfx.zaps': 'zap',
  'card.type.w': 'WEAPON', 'card.type.p': 'PASSIVE', 'card.type.f': 'BONUS',
  'card.recipe': 'Recipe: {what}',
  'card.evoReady': 'EVO · ready', 'card.evoLeft': 'EVO · {n} to go',
  'card.synergy': 'Synergy: {weapon}',
  'card.recipeHead': 'Evolution recipe',
});
