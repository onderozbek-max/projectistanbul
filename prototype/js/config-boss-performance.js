// View-only anatomical scale, stride and physical acting. Damage/timing stay in boss simulation config.
P.CFG.bossPerformance = {
  turnT:.24, stepLift:.16, contactShare:.61, settleT:.14,
  cook:{height:2.25,wide:.88,stride:.74,hip:.99,torso:.74,head:.59,arm:.46,forearm:.43,thigh:.51,shin:.54,tool:.82,grip:[.31,.86],tip:[.62,.12],death:1.65},
  switchkeeper:{height:2.55,wide:1.03,stride:.57,hip:1.03,torso:.82,head:.64,arm:.50,forearm:.47,thigh:.53,shin:.56,tool:1.8,grip:[.45,.19],tip:[.68,.88],death:1.74},
  roaster:{height:2.55,wide:1.05,stride:.78,hip:1.02,torso:.82,head:.63,arm:.50,forearm:.48,thigh:.53,shin:.55,tool:1.68,grip:[.5,.85],tip:[.5,.13],death:1.9},
  linekeeper:{height:2.55,wide:.90,stride:.60,hip:1.06,torso:.79,head:.66,arm:.49,forearm:.47,thigh:.55,shin:.56,tool:.75,grip:[.53,.79],tip:[.51,.12],death:1.58},
  vatman:{height:2.70,wide:1.13,stride:.86,hip:1.08,torso:.88,head:.66,arm:.54,forearm:.51,thigh:.57,shin:.58,tool:1.65,grip:[.5,.83],tip:[.5,.10],death:2.05},
  bellkeeper:{height:2.70,wide:1.08,stride:.80,hip:1.09,torso:.90,head:.64,arm:.55,forearm:.52,thigh:.57,shin:.58,tool:1.4,grip:[.5,.80],tip:[.5,.15],death:2.15},
  dockBride:{robe:true,height:2.48,wide:.76,stride:.68,hip:1.13,torso:.70,head:.61,arm:.47,forearm:.44,thigh:.56,shin:.58,tool:.9,grip:[.5,.83],tip:[.5,.16],death:1.92},
  bigFisher:{height:2.65,wide:1.05,stride:.70,hip:1.05,torso:.86,head:.66,arm:.54,forearm:.50,thigh:.55,shin:.58,tool:2.05,grip:[.5,.82],tip:[.5,.07],death:1.95},
  quayCaptain:{height:2.68,wide:1.11,stride:.90,hip:1.06,torso:.90,head:.64,arm:.56,forearm:.53,thigh:.55,shin:.58,tool:1.15,grip:[.5,.12],tip:[.5,.86],death:2.3},
  ticketMan:{height:2.66,wide:.97,stride:.65,hip:1.12,torso:.83,head:.64,arm:.52,forearm:.48,thigh:.58,shin:.59,tool:.72,grip:[.5,.81],tip:[.5,.13],death:1.82}
};

P.CFG.bossPerformance.switchkeeper.control={cell:0,grip:[.5,.12],height:.54};
P.CFG.bossPerformance.linekeeper.control={cell:3,grip:[.5,.13],height:.60};
P.CFG.bossPerformance.vatman.control={cell:1,grip:[.5,.18],height:.58};
P.CFG.bossPerformance.bellkeeper.control={cell:2,grip:[.5,.13],height:.62};
P.CFG.bossPerformance.ticketMan.control={cell:0,grip:[.5,.12],height:.48};
// Arena floor values quiet the paving beneath the physical actor; no character aura or hitbox change.
P.CFG.bossFloor = {
  cook:[229,215,188,.34], switchkeeper:[222,220,199,.44], roaster:[202,218,219,.37],
  linekeeper:[230,221,199,.43], vatman:[217,218,197,.39], bellkeeper:[231,222,195,.56],
  dockBride:[31,47,57,.34], bigFisher:[229,222,194,.54], quayCaptain:[231,218,191,.54], ticketMan:[225,222,195,.55]
};
