// Local release comes from the operated apparatus, not deleted enemies or a minimum clear time.
(function(C){
  C.encounterSpace={radius:6.2,time:3.8,sourceBack:1.1,watchAhead:8,coverW:1.25,coverH:.75,
    profiles:{
      2:{release:'tram'},3:{release:'cart'},4:{release:'wire'},5:{release:'lever'},
      6:{release:'hoist',cover:-1},7:{release:'escort'},8:{release:'bell'},9:{release:'counterweight'},10:{release:'gate'},
      11:{release:'cargo',cover:1},12:{release:'ferry'},13:{release:'points'},14:{release:'shutters'},15:{release:'ramp',cover:-1},
      16:{release:'line'},17:{release:'rescue',cover:-1},18:{release:'screens'},19:{release:'wave'},20:{release:'lift'},
      21:{release:'awning',cover:-1},22:{release:'cart'},23:{release:'sacks',cover:1},24:{release:'trolley'},25:{release:'gate'},
      26:{release:'railcar'},27:{release:'guide'},28:{release:'clock'},29:{release:'lights'},30:{release:'points'}
    },coverSides:[3.2,3.8,4.2],coverBack:[2.6,3.6,4.6,6.6,8.6],
    supplyAdvance:{2:{afterGate:4,beforeC:16},3:{afterGate:4,beforeC:12},4:{afterGate:4,beforeC:16},5:{afterGate:-8,beforeC:12},6:{afterGate:4,beforeC:8},8:{afterGate:4,beforeC:16},26:{afterGate:4,beforeC:8}}};
  // Remove an empty boulevard stretch; the counterweight pickup/socket and risky carry remain unchanged.
  C.levels.galataRoutes[9].len=198;
  C.levels.istiklalFinales[4].stunT=2.2;
  C.levels.karakoyMilestones.shutterLure.time=4.6;
  C.levels.galataMilestones.bell.lureT=6.4;
})(P.CFG);
