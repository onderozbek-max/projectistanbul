// Enemy look config (view only, procedural art). Read by js/view/art-enemy-look.js, art-enemy-bosses.js, sprites.js and
// art-enemies4/5 (per-type gait, stagger and corpse multipliers). The sim never reads P.CFG.enemyLook (tools/test-enemy-silhouettes.js
// checks this). accent: the signature colour of a type on its clothing or gear. Design-system 3.1 tokens where they fit, an extra
// hue where they run out; never a gameplay semantic token (3.2) and never the hero's tram red on a crowd enemy. feature: the
// silhouette cue that survives as a black shape at 48 px. animK: multipliers on CFG.view.anim (bob, squash, step). flinchK,
// windupK, slideK: multipliers on the stagger lean, the wind-up lean and back-hop, and the blunt-death slide.
// walkerVariants: the four walker outfits, picked by enemy id (view only). bossCostumes: the five brute-type bosses (one body,
// their own costume; keyed by the hood boss nameKey 'boss.<hood>', story names in js/story/strings-story.js spk.b.*).
(function (C) {
  C.enemyLook = {
    walkerVariants: ['walk_office', 'walk_student', 'walk_shopper', 'walk_tourist'],
    types: {
      walker:   { accent: '#1F4E79', feature: 'walker: four outfits (briefcase, backpack, two bags, sun hat with camera)', animK: { bob: 1, squash: 1, step: 1 } },
      runner:   { accent: '#6B4FA0', feature: 'hood up, forward lean, one arm pumped', animK: { bob: 1.7, squash: 1.2, step: 1.5 }, flinchK: 1.3, windupK: 0.8, slideK: 1.6 },
      crawler:  { accent: '#8A8F98', feature: 'legless, dragging on the street', animK: { bob: 0.6, squash: 1.1, step: 1 }, flinchK: 0.8 },
      diner:    { accent: '#F4EBDD', feature: 'squat, bib, plate held at the waist', animK: { bob: 0.8, squash: 0.9, step: 0.8 }, flinchK: 0.9, windupK: 1 },
      kurye:    { accent: '#E8782A', feature: 'scooter with a delivery box, leaning into it', animK: { bob: 1.3, squash: 0.8, step: 1.3 }, flinchK: 1.2 },
      copci:    { accent: '#B9D636', feature: 'broad and hunched, broom out front, plods', animK: { bob: 0.5, squash: 1.5, step: 0.6 }, flinchK: 0.6, windupK: 0.7, slideK: 0.6 },
      marti:    { accent: '#F4F1EA', feature: 'gull in flight, gold beak (pigeon in inland hoods)', animK: { bob: 1, squash: 1, step: 1 } },
      cayci:    { accent: '#2FA59A', feature: 'copper tray of glasses held out, teal vest', animK: { bob: 0.8, squash: 1, step: 0.8 }, flinchK: 0.9 },
      spitter:  { accent: '#4FC48A', feature: 'hunched, throat sac swelling before the spit', animK: { bob: 0.7, squash: 1, step: 0.7 }, flinchK: 0.9, windupK: 1.3 },
      zehirli:  { accent: '#76E340', feature: 'tall spray tank on the back, gas respirator, upright', animK: { bob: 0.7, squash: 1, step: 0.7 }, flinchK: 0.9, windupK: 1.2, hunch: 0.02, lean: 0.0 },
      brute:    { accent: '#3A3F4D', feature: 'huge shoulders, arms dragging, boiler suit', animK: { bob: 0.5, squash: 1.3, step: 0.5 }, flinchK: 0.45, windupK: 0.5, slideK: 0.5 },
      bloater:  { accent: '#D9749B', feature: 'round swollen belly, short legs, waddles', animK: { bob: 1.6, squash: 1.5, step: 0.5 }, flinchK: 0.6, windupK: 0.8 },
      screamer: { accent: '#EFE7DA', feature: 'gaunt, long hair, arms up, mouth open, recoils', animK: { bob: 1.2, squash: 0.9, step: 1.3 }, flinchK: 1.5, windupK: 2.0 },
      hardhat:  { accent: '#F2D54B', feature: 'yellow hard hat, bulky hi-vis vest', animK: { bob: 0.6, squash: 1.2, step: 0.6 }, flinchK: 0.5, windupK: 0.8 },
      kasap:    { accent: '#EDE6D6', feature: 'cream apron, cleaver held out, slow wall', animK: { bob: 0.5, squash: 1.2, step: 0.5 }, flinchK: 0.4, windupK: 0.6, slideK: 0.5 },
      parkur:   { accent: '#C240B7', feature: 'slim, crouched, bandana, leaps', animK: { bob: 1.9, squash: 1.3, step: 1.6 }, flinchK: 1.3, windupK: 1.4, slideK: 1.4 }
    },
    // The five brute-type bosses share one body (config-bosses.js bossByHood). Costume keys are read by art-enemy-bosses.js.
    bossCostumes: {
      'boss.istiklal': { costume: 'vatman', accent: '#D7263D', feature: 'peaked cap, tram-red jacket, long tram hook' },
      'boss.galata':   { costume: 'guide', accent: '#E9A23B', feature: 'gold visor cap, megaphone, guide lanyard' },
      'boss.karakoy':  { costume: 'bride', accent: '#F4EBDD', feature: 'long white gown, trailing veil, bouquet' },
      'boss.yedikule': { costume: 'keeper', accent: '#7E8A9A', feature: 'grey coveralls, a ring of keys at the hip' },
      'boss.atakoy':   { costume: 'bigbro', accent: '#1B4965', feature: 'white vest, gold chain, sunglasses, blue track pants' }
    }
  };
})(P.CFG);
