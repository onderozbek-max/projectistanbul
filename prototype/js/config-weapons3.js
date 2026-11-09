// Workstream W (AUDIT-6 W1, W2, depth pass): synergy tags, nine new evolutions and the two active skills. Extends P.CFG; pure data.
// Passive evolutions: base weapon at L5 + the paired passive owned (like the first five). Terrain evolutions: base at L5 +
// the run has hit that terrain with that weapon (envHit, kind gas | wet | car) + journey level >= unlock. A new evolution
// copies its base weapon's config (cooldown, shape, mods family) and overrides the level and the stat rows, so the shared
// fire code runs it through P.Weapons.variantOf. Evolved weapons have one level (L[0]).
(function (C) {
  // Synergy tag per weapon family. Evolutions use their base's tag (see P.Weapons.tagOf). Tags ride on wfire and areaHit.
  C.tags = { knife: 'blade', nailgun: 'blade', canister: 'gas', chain: 'blunt', sledge: 'blunt', molotov: 'fire',
    fireworks: 'fire', cable: 'electric', speargun: 'blade', extinguisher: 'water', sawblade: 'blade', manhole: 'blunt',
    torch: 'fire', olta: 'blade', cardoor: 'blunt', slingshot: 'blunt', chainsaw: 'blade' };
  C.tagNames = ['fire', 'electric', 'blunt', 'blade', 'gas', 'water'];
  // Evolutions carry their own tag (a combo reads by its element): blacksmith blunt, stormshield electric, foamstorm water,
  // netspear blade, lake fire, twinsaw blade, fireball fire, arcchain electric, carbomb gas.
  Object.assign(C.tags, { blacksmith: 'blunt', stormshield: 'electric', foamstorm: 'water', netspear: 'blade', lake: 'fire',
    twinsaw: 'blade', fireball: 'fire', arcchain: 'electric', carbomb: 'gas' });

  function evo(id, from, over) {
    var b = C.weapons[from], o = {}, k;
    for (k in b) o[k] = b[k];
    for (k in over) o[k] = over[k];
    o.evo = true; o.from = from;
    C.weapons[id] = o;
    return o;
  }

  // ---------- passive evolutions (base L5 + passive) ----------
  evo('blacksmith', 'sledge', {                  // Demirci Vuruşu: each slam heals a little per enemy it hits
    heavy: true,
    levels: [{ dmg: 60, r: 2.0, stun: 0.9, kb: 1.8, slams: 1, cdMult: 0.85, heal: 1, healMax: 8 }],
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.heal', 'heal', 'n'], ['stat.radius', 'r', 'm'], ['stat.stun', 'stun', 's']],
  });
  evo('stormshield', 'cable', {                  // Şimşek Kalkanı: an arc orbits Arda and zaps the nearest; a dodge zaps too
    levels: [{ dmg: 9, zapR: 2.3, every: 0.5, zaps: 2, orbitR: 1.1, dodgeZap: 1, stun: 0.2 }],
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.zaps', 'zaps', 'n'], ['stat.radius', 'zapR', 'm'], ['stat.every', 'every', 's']],
  });
  evo('foamstorm', 'extinguisher', {             // Köpük Fırtınası: a wider, stickier cone that also blocks spit
    levels: [{ dmg: 7, range: 3.0, arcDeg: 100, push: 1.6, slow: 0.5, slowT: 2.0, cdMult: 0.9, spitBlock: 2.0 }],
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.range', 'range', 'm'], ['stat.slow', 'slow', 'pct'], ['stat.block', 'spitBlock', 's']],
  });
  evo('netspear', 'speargun', {                  // Zıpkın Ağı: pinned enemies are roped; a share of each hit goes to the rope
    levels: [{ dmg: 22, pierce: 2, root: 1.6, cdMult: 1, netShare: 0.4, netR: 2.4 }],
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.netShare', 'netShare', 'pct'], ['stat.root', 'root', 's'], ['stat.pierce', 'pierce', 'n']],
  });
  evo('lake', 'molotov', {                       // Ateş Gölü: pools that touch merge into a lake that lasts longer and slows
    levels: [{ dmg: 12, r: 1.5, life: 5.0, bottles: 1, cdMult: 0.9, lakeLife: 6.0, lakeSlow: 0.4, lakeMerge: 1.25 }],
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.pool', 'r', 'm'], ['stat.lasts', 'lakeLife', 's'], ['stat.slow', 'lakeSlow', 'pct']],
  });
  evo('twinsaw', 'sawblade', {                   // İkiz Disk: two blades go out side by side and come back
    levels: [{ dmg: 14, range: 6.0, sparks: 3, cdMult: 1, blades: 2, spread: 0.22 }],
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.blades', 'blades', 'n'], ['stat.range', 'range', 'm'], ['stat.sparks', 'sparks', 'n']],
  });

  // ---------- terrain evolutions (base L5 + the terrain hit this run, from L8) ----------
  evo('fireball', 'molotov', {                   // Ateş Topu: every bottle is a fireball and sets its victims alight
    unlock: 8, terrain: 'gas',
    levels: [{ dmg: 16, r: 1.4, life: 4.0, bottles: 1, cdMult: 1, blastMul: 1.6, dmgMul: 1.2, burn: 2 }],
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.pool', 'r', 'm'], ['stat.burn', 'burn', 'n']],
  });
  evo('arcchain', 'chain', {                     // Elektrik Zinciri: a blade hit arcs to the nearest; wet ground arcs further
    unlock: 8, terrain: 'wet',
    levels: [Object.assign({}, C.weapons.chain.levels[4], { arcN: 2, arcR: 2.5, arcDmg: 6, wetArcs: 1 })],
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.blades', 'blades', 'n'], ['stat.arcs', 'arcN', 'n'], ['stat.radius', 'arcR', 'm']],
  });
  evo('carbomb', 'canister', {                   // Patlayan Araba Turu: a canister that lands by a car blows bigger
    unlock: 8, terrain: 'car',
    levels: [Object.assign({}, C.weapons.canister.levels[4], { blastMul: 1.35, carMul: 1.5 })],
    stats: [['stat.dmg', 'dmg', 'n'], ['stat.blast', 'blast', 'm'], ['stat.carBlast', 'carMul', 'n']],
  });

  C.evolutions = C.evolutions || {};
  Object.assign(C.evolutions, {
    blacksmith: { from: 'sledge', passive: 'medkit', name: 'blacksmith' },
    stormshield: { from: 'cable', passive: 'nazar', name: 'stormshield' },
    foamstorm: { from: 'extinguisher', passive: 'medkit', name: 'foamstorm' },
    netspear: { from: 'speargun', passive: 'gloves', name: 'netspear' },
    lake: { from: 'molotov', passive: 'energy', name: 'lake' },
    twinsaw: { from: 'sawblade', passive: 'powerbank', name: 'twinsaw' },
    fireball: { from: 'molotov', terrain: 'gas', unlock: 8, name: 'fireball' },
    arcchain: { from: 'chain', terrain: 'wet', unlock: 8, name: 'arcchain' },
    carbomb: { from: 'canister', terrain: 'car', unlock: 8, name: 'carbomb' },
  });
  // Terrain names for hints and the discovery banner (kind -> string key).
  C.terrainKinds = ['gas', 'wet', 'car'];
  C.terrainR = { gas: 0.6, car: 0.6, wet: 0.4 };   // a hit counts when the point is this far inside the terrain (m)

  // ---------- W3 and W1 knobs read by the sim (named here, no literals in sim/) ----------
  C.evoFx = {
    netLinkT: 0.2,            // a rope keeps sharing damage this long after the pin ends (s)
    lakeMergePad: 0.05,       // extra overlap before two pools merge (m)
    lakeSlowHold: 0.12,       // a lake slow lasts this long and is refreshed every step inside (s)
    envHitEvery: 0.4,         // one terrain kind repeats at most this often per weapon (s)
  };

  // ---------- W2: active skills (one per loadout; Q is the ult, so the active skill key is E) ----------
  C.skills.active = {
    shield: { T: 3.0, cooldown: 25, absorb: 1 },                      // Simit Kalkanı: absorbs one hit for 3 s
    tea: { T: 4.0, cooldown: 30, heal: 0.25, slow: 0.4, slowR: 3.0, slowHold: 0.12 },   // Çay Molası: 25% over 4 s, 40% slow in 3 m
  };
  C.skills.activeList = ['shield', 'tea'];
  C.skills.activeDefault = 'shield';
  // W3: flick guard. A flick dashes only when the stick was near rest where the swipe started.
  C.skills.dash.flickRestM = 0.2;   // stick offset (fraction of the stick radius) that still counts as rest
  C.skills.dash.handedZone = 0.55;  // joystick zone for the chosen side (fraction of the screen width)
  C.skills.dash.designW = 390;      // design width in input coordinates (pt)
})(P.CFG);
