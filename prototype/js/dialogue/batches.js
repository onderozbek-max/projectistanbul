// Review batches (data only): which beats belong to which writing pass (BRIEF-DIALOGUE §4.3). An entry ending in "*" is a prefix.
// Used by tools/dialogue-export.js, tools/dialogue-import.js and tools/test-dialogue.js. A beat can sit in one batch only.
P.DLG = P.DLG || { beats: {}, tr: {}, en: {} };
P.DLG.batches = {
  A: [
    "bark*", "call*", "down.arda", "exit*", "pardon", "rule*", "s2", "s3", "s4", "O1*", "E5*", "L01*", "L02*", "L03*", "L04*", "L05*", "H01*",
    "flav.knife", "flav.shoes", "flav.torch", "flav.sawblade", "flav.cardoor", "flav.manhole",
    "BK.hd01.*", "BK.close", "BK.self", "BK.idle", "BK.low", "BK.heal", "BK.near", "BK.dash", "BK.nazar", "BK.mom", "BK.dad", "BK.still",
    "BK.frenzy", "BK.ult", "BK.ultr", "BK.zq", "BK.zr", "BK.zreact", "BK.elite", "BK.boss", "BK.boss.phase", "BK.mod", "BK.mastery",
    "BK.lvlA", "BK.lvlB", "BK.lvlC", "BK.lvlD", "BK.sig.*", "BK.streak.*", "BK.rescue", "BK.act.*",
    "BK.fk.walker", "BK.fk.runner", "BK.fk.crawler", "BK.fk.diner", "BK.fk.bloater", "BK.fk.brute", "BK.fk.spitter", "BK.fk.screamer",
    "BK.card.knife", "BK.card.shoes", "BK.card.torch", "BK.card.sawblade", "BK.card.cardoor", "BK.card.manhole", "BK.card.gen",
    "BK.card.nazar", "BK.card.jacket", "BK.card.medkit",
    "BK.env.*", "BK.obj.*", "BK.ev.*", "BK.evend.*",
    "BK.hack.atm.*", "BK.hack.traffic.*", "BK.hack.shutter.*", "BK.hack.tram.*", "BK.hack.booster.*"
  ],
  // Batch B (BRIEF §4.3): hoods H02-H06 (to Sirkeci, L30): story pages, pops, hood barks, level pops L06-L20, plus every Mom call (C*),
  // the Sirkeci caption (E30) and the first Kaan meeting (K20), because the call voice is shared across all hoods.
  B: [
    "H02*", "H03*", "H04*", "H05*", "H06*", "BK.hd02.*", "BK.hd03.*", "BK.hd04.*", "BK.hd05.*", "BK.hd06.*",
    "L06*", "L07*", "L08*", "L09*", "L10*", "L11*", "L12*", "L13*", "L14*", "L15*", "L16*", "L17*", "L18*", "L19*", "L20*",
    "C05*", "C15*", "C30*", "C50*", "C70*", "C90*", "E30*", "K20*"
  ],
  // Batch C: everything else. Story pages and pops of H07-H20, the finale (FIN*), the campfire (CMP*), the hood barks hd07-hd20,
  // the card, evolution, skill and enemy-type barks, and the alarm hack.
  C: [
    "H07*", "H08*", "H09*", "H10*", "H11*", "H12*", "H13*", "H14*", "H15*", "H16*", "H17*", "H18*", "H19*", "H20*",
    "BK.hd07.*", "BK.hd08.*", "BK.hd09.*", "BK.hd10.*", "BK.hd11.*", "BK.hd12.*", "BK.hd13.*", "BK.hd14.*", "BK.hd15.*", "BK.hd16.*",
    "BK.hd17.*", "BK.hd18.*", "BK.hd19.*", "BK.hd20.*",
    "BK.card.cable", "BK.card.canister", "BK.card.chain", "BK.card.chainsaw", "BK.card.energy", "BK.card.extinguisher", "BK.card.fireworks",
    "BK.card.gloves", "BK.card.magnet", "BK.card.molotov", "BK.card.nailgun", "BK.card.sledge", "BK.card.slingshot", "BK.card.speargun",
    "BK.fk.copci", "BK.fk.elite", "BK.fk.hardhat", "BK.fk.kasap", "BK.fk.kurye", "BK.fk.parkur", "BK.fk.zehirli", "BK.evo.*", "BK.skill.*", "BK.hack.alarm.*", "flav.finale", "FIN*", "CMP*"
  ],
  // Batch D (R1 wave 1): the two new enemy types' first-sighting barks (scanSightings in js/story/barks.js). Nothing else.
  D: [
    "BK.fk.cayci", "BK.fk.marti", "BK.fk.guvercin", "BK.fk.kedi"
  ]
};
