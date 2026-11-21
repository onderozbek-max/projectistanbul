// Presentation values and deliberate interaction timing for the approved first-30 brief.
(function (C) {
  C.experience = {
    through: 30,
    people: { radius:.31, grid:.45, sample:.18, epsilon:.015, rings:10, angles:16, finishDistance:1.5,
      searchSpan:40, searchNodes:2400, speed:4.4, catchupSpeed:7.2, catchupDistance:3.4,
      followDistance:1.45, stopDistance:.9, repath:.4, spacing:1.15, trail:.55, watchX:3.4,
      watchAhead:6, interceptHold:1.65, makeSpace:.5, alongside:.12, sceneSpeed:2.5,
      lead:1.2, griefLead:1.5, minApproach:1, arrivalT:.35, pause:.65, recognitionPause:1.8, griefPause:1.4,
      leaveDistance:1.2, exitMargin:2, leaveT:.8, bodyGap:.8 },
    choiceHold: .38, choiceMaxDelay: 2,
    health: { trailHold: .12, trailT: .38, healT: .65, hitT: .38, critical: .25, recovered: .36 },
    scenes: { entryT: 1.75, retryT: .38, kaanT: 5.2, farewellT: 6.4, passageT: 5.2, skipHold: .6, captionBias: .18 },
    gait: { contact: .54, lift: .065, stride: .17, hip: .014, chest: .035, turnT: .09, settleT: .14 },
    heroRig: {
      front: { waist: .615, split: .50, hip: [.365,.628,.615,.628], knee: [.35,.805,.66,.805], ankle: [.30,.929,.70,.929] },
      back: { waist: .625, split: .51, hip: [.37,.64,.65,.64], knee: [.36,.81,.67,.81], ankle: [.32,.94,.73,.94] },
      side: { waist: .60, split: .52, hip: [.39,.62,.64,.62], knee: [.32,.80,.65,.79], ankle: [.27,.934,.72,.90] }
    },
    heroPelvis: { side: [26,30.5,29,45,26], front: [38.5,34.5,38,43,38.5], back: [35.5,27.5,37.5,45.5,37.5] },
    civilians: { rows: 6, frames: 4, cell: 256, pivotX: 128, pivotY: 250, height: 230, metres:1.36,
      lookAhead: 8, lookStep: .5, laneEdge: 6.6 },
    openingCast: { cell:256, height:230, pivotX:128, pivotY:246,
      dinerVia:{x:-5.9,y:-5.4}, dinerStand:{x:-5.75,y:-7.1},
      bystanderStart:{x:-7.2,y:-5.3}, bystanderVia:{x:-6.1,y:-2.2}, bystanderExit:{x:-5.2,y:.65}, leaveT:3.05 },
    roleGait: {
      walker: [.64,.12,.035], diner: [.64,.10,.03], runner: [.48,.21,.075], crawler: [.62,.13,.025],
      brute: [.70,.13,.025], hardhat: [.61,.14,.032], spitter: [.63,.10,.03], zehirli: [.65,.10,.03],
      screamer: [.60,.12,.035], bloater: [.70,.10,.022], kasap: [.65,.13,.03], parkur: [.48,.20,.08],
      copci: [.67,.12,.028], cayci: [.61,.12,.028], kurye: [.55,.04,.01], marti: [.50,.04,.01]
    }
  };
})(P.CFG);
