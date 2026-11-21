// Connected anatomical targets, driven by factual action phase rather than generic body-band deformation.
P.BossPerformance = (function () {
  var B={}, TAU=Math.PI*2;
  function clamp(x){return Math.max(0,Math.min(1,x));}
  function ease(x){x=clamp(x);return x*x*(3-2*x);}
  function blend(a,b,t){return a+(b-a)*ease(t);}
  function reach(p,x,y,roll,tool){p.hand=[x,y];p.roll=roll;p.tool=tool;}
  function attack(e,p,q,commit){
    var a=e.ai||{},id=e.bossPreset,load=ease(Math.min(1,q/.70)),hit=ease((q-.70)/.30);
    if(id==='cook'){
      if(a.act==='throw'){reach(p,blend(.45,-.20,load)+hit*.95,blend(-1.5,-2.05,load)+hit*.75,-.18*load+.34*hit,-.65+hit*2.15);p.release=!!(a.cookToss&&a.cookToss.released);}
      else {var back=a.combo===1;reach(p,blend(.55,back?-.60:.05,load)+hit*(back?1.40:.92),blend(-1.25,-2.18,load)+hit*.99,-.18*load+.38*hit,back?1.7-hit*2.8:-.85+hit*2.25);}
    }else if(id==='switchkeeper'){
      if(a.act==='switchRails'){reach(p,.54,-1.38-.30*load,.11*load,.30);p.off=[-.26,-1.55-.20*load];p.relay=true;}
      else reach(p,blend(.37,-.28,load)+hit*1.02,-1.42-.37*load+hit*.36,-.20*load+.31*hit,-.50+hit*1.9);
    }else if(id==='roaster'){
      if(a.act==='charge'){reach(p,.50,-1.12+.20*load,.32*load,1.48);p.crouch=.20*load;}
      else {reach(p,.42,-1.38-.22*load,.10*load,.25+hit*.45);p.off=[-.25,-1.28];}
    }else if(id==='linekeeper'){
      reach(p,a.act==='arcKnot'?.25:.68,-1.47-.26*load,-.12*load+hit*.16,-.30+hit*.65);p.off=[.22,-1.55];p.relay=true;
    }else if(id==='vatman'){
      if(a.act==='vatmanLever'){reach(p,blend(.75,.27,load),-1.20-.55*load,-.23*load,.28);p.off=[.36,-1.51];p.relay=true;}
      else if(a.act==='vatmanBell'){reach(p,.43,-1.74-.26*load,-.09*load,.05+hit*.85);p.off=[-.35,-1.05];p.relay=true;}
      else {reach(p,.50,-1.05,.30*load,1.12);p.crouch=.22*load;}
    }else if(id==='bellkeeper'){
      if(a.act==='counterweights'){reach(p,.32,-1.75-.35*load,-.24*load,.18);p.off=[-.20,-1.96];p.crouch=.14*load;}
      else {reach(p,.56,-1.25,.26*load,1.12);p.crouch=.19*load;}
    }else if(id==='dockBride'){
      if(a.act==='ropeSweep'){var sweep=commit?q*TAU:q*1.3;reach(p,.33+Math.cos(sweep)*.33,-1.28-Math.sin(sweep)*.29,Math.sin(sweep)*.17,-.4+sweep);p.off=[-.33,-1.05];p.pivot=sweep;}
      else {reach(p,.65,-1.72,.12*load,.45);p.off=[-.27,-1.05];p.relay=true;}
    }else if(id==='bigFisher'){
      if(a.act==='bridgeCast'){reach(p,blend(-.20,.88,hit),blend(-1.98,-1.21,hit),-.24*load+.30*hit,-.78+hit*2.0);p.off=[p.hand[0]-.27,p.hand[1]+.15];}
      else {reach(p,.73,-1.42,.18*load,.72);p.off=[-.35,-1.48];p.release=hit>.7;}
    }else if(id==='quayCaptain'){
      var tow=e.captainTow;
      if(tow&&tow.phase==='pull'){reach(p,blend(.88,.21,q),-1.28-q*.24,-.26*q,1.2);p.off=[p.hand[0]-.22,p.hand[1]+.05];p.release=true;p.crouch=.18;}
      else if(a.act==='captainSpice'){reach(p,.72,-1.43,-.07+hit*.25,.55);p.off=[-.13,-1.24];p.release=true;}
      else {reach(p,blend(-.22,.93,hit),blend(-2.0,-1.10,hit),-.22*load+.38*hit,-.60+hit*2.0);p.release=!!(tow&&tow.phase!=='aim');p.off=[p.hand[0]-.22,p.hand[1]+.12];}
    }else if(id==='ticketMan'){
      if(a.act==='stationSignal'){p.off=[-.26,-2.10-.13*load];reach(p,.32,-1.02,.06,.4);p.relay=true;}
      else reach(p,blend(.15,.94,hit),-1.44+hit*.20,-.21*load+.32*hit,1.25);
    }
  }
  // Deliberate spent poses, not a shared crouch. Each resolves its particular source/tool.
  function recovery(e,p){
    var a=e.ai||{},id=e.bossPreset,poses={
      cook:{hand:[.84,-.63],off:[-.38,-1.14],roll:.24,crouch:.15,tool:1.72},
      switchkeeper:{hand:[.62,-.88],off:[-.20,-1.42],roll:-.16,crouch:.07,tool:.88},
      roaster:{hand:[.58,-.71],off:[-.12,-1.01],roll:.31,crouch:.22,tool:1.46},
      linekeeper:{hand:[.29,-1.02],off:[-.42,-1.37],roll:-.11,crouch:.04,tool:.18},
      vatman:{hand:[.34,-1.20],off:[-.40,-.93],roll:.19,crouch:.19,tool:.74},
      bellkeeper:{hand:[.67,-.86],off:[-.32,-1.04],roll:.27,crouch:.23,tool:.97},
      dockBride:{hand:[.57,-1.06],off:[-.48,-1.22],roll:-.19,crouch:.08,tool:1.14},
      bigFisher:{hand:[.67,-1.04],off:[.19,-1.12],roll:-.22,crouch:.13,tool:-.17},
      quayCaptain:{hand:[.35,-.95],off:[.09,-1.03],roll:.28,crouch:.25,tool:1.24},
      ticketMan:{hand:[.81,-1.07],off:[-.36,-1.42],roll:.18,crouch:.08,tool:1.44}
    },pose=poses[id];
    if(pose)Object.assign(p,pose,{hand:pose.hand.slice(),off:pose.off.slice()});
    if(id==='switchkeeper'&&a.act==='switchRails'){p.off=[-.28,-1.57];p.roll=-.10;}
    if(id==='vatman'&&a.act==='vatmanBell'){p.hand=[.42,-1.56];p.tool=.65;}
    if(id==='linekeeper'&&a.act==='arcKnot'){p.hand=[.31,-.88];p.off=[-.26,-1.04];p.crouch=.12;}
    p.spent=true;
  }
  function travel(e,p){
    var id=e.bossPreset,dx=e.dvx||e.vx||0,dy=e.dvy||e.vy||0,speed=Math.hypot(dx,dy);
    if(speed<.08)return;
    var pace=(e.walk||0)*Math.PI*2/P.CFG.bossPerformance[id].stride,step=Math.sin(pace);
    if(id==='cook'){p.roll=.13;p.hand=[.40+step*.12,-1.47];p.off=[-.34-step*.10,-1.13];p.tool=-.12;}
    else if(id==='switchkeeper'){p.roll=-.06;p.hand=[.58,-1.19];p.off=[-.28,-1.46];p.tool=.38;}
    else if(id==='roaster'){p.roll=.22;p.hand=[.46,-1.08];p.off=[-.12,-1.18];p.crouch=.07;p.tool=1.22;}
    else if(id==='linekeeper'){p.roll=.07;p.hand=[.53+step*.09,-1.32];p.off=[-.24-step*.08,-1.35];p.tool=.14;}
    else if(id==='vatman'){p.roll=.10;p.hand=[.40,-1.18];p.off=[-.34,-1.34];p.tool=.64;}
    else if(id==='bellkeeper'){p.roll=.16;p.hand=[.39,-1.44];p.off=[-.22,-1.42];p.tool=.15;}
    else if(id==='dockBride'){p.roll=-.07;p.hand=[.69,-1.31];p.off=[-.42,-1.20];p.tool=.95;p.headRoll=.04;}
    else if(id==='bigFisher'){p.roll=-.09;p.hand=[.51,-1.36];p.off=[.15,-1.31];p.tool=-.33;}
    else if(id==='quayCaptain'){p.roll=.18;p.hand=[.27,-1.08];p.off=[-.03,-1.18];p.crouch=.07;p.tool=.98;}
    else if(id==='ticketMan'){p.roll=.04;p.hand=[.45+step*.07,-1.25];p.off=[-.34-step*.14,-1.42];p.tool=.92;}
  }
  function defeat(e,p,original,d){
    var id=e.bossPreset,fall=ease((d-.09)/.62),settle=ease((d-.57)/.38);
    p.crouch=original.crouch+fall*.70;p.roll=original.roll+fall*.58;p.hand=[blend(original.hand[0],.72,fall),blend(original.hand[1],-.12,fall)];
    p.off=[-.32,-1.18+fall*.84];p.death=d;p.settle=settle;
    var targets={
      cook:{roll:.74,off:[-.10,-.38]},switchkeeper:{roll:-.47,off:[-.48,-.46]},
      roaster:{roll:.82,hand:[.84,-.30],off:[.28,-.37],travel:.34},
      linekeeper:{roll:.23,hand:[.38,-.32],off:[-.32,-.65]},
      vatman:{roll:-.58,off:[-.48,-.15],crouch:.12},
      bellkeeper:{roll:.45,hand:[.52,-.31],off:[-.23,-.36]},
      dockBride:{roll:-.72,hand:[.24,-.27],off:[-.48,-.31],travel:-.17},
      bigFisher:{roll:.54,hand:[.55,-.24],off:[.20,-.27]},
      quayCaptain:{roll:.31,hand:[.38,-.29],off:[.12,-.35],crouch:.16},
      ticketMan:{roll:-.54,hand:[.39,-.32],off:[-.32,-.30]}
    },target=targets[id];
    if(target){
      p.roll=blend(original.roll,target.roll,fall);p.travel=(target.travel||0)*fall;p.crouch+=(target.crouch||0)*fall;
      ['hand','off'].forEach(function(key){var end=target[key];if(end)p[key]=[blend(original[key][0],end[0],fall),blend(original[key][1],end[1],fall)];});
    }
    if(!original.release){var drop=ease((d-.14)/.48),grip=original.toolHand==='off'?original.off:original.hand;
      p.dropped={x:grip[0]+.26*drop,y:blend(grip[1],-.10,drop*drop),a:blend(original.tool,Math.PI/2,drop)};p.release=true;}
  }
  B.pose=function(e,o){
    var a=e.ai||{},p={hand:[.48,-1.32],off:[-.32,-1.26],roll:0,crouch:0,tool:.4,release:false},q=e.windup||0;
    if(o.sceneEntry!==undefined){
      var entries={cook:[.36,-1.95,-.55],switchkeeper:[.69,-1.38,.35],roaster:[.38,-1.14,1.2],linekeeper:[.56,-1.65,-.2],
        vatman:[.28,-1.60,.2],bellkeeper:[.30,-1.96,.1],dockBride:[.73,-1.37,.9],bigFisher:[.36,-1.45,-.4],quayCaptain:[.18,-1.52,.25],ticketMan:[.68,-1.32,1.1]};
      var ent=entries[e.bossPreset],show=Math.sin(Math.PI*clamp(o.sceneEntry));
      if(ent){p.hand=[blend(p.hand[0],ent[0],show),blend(p.hand[1],ent[1],show)];p.tool=blend(p.tool,ent[2],show);}
      if(e.bossPreset==='ticketMan')p.off=[-.28,-1.26-show*.68];
      if(e.bossPreset==='bellkeeper')p.off=[-.23,-1.30-show*.52];return p;
    }
    var tow=e.captainTow,cast=e.bridgeCast;
    var committed=a.m==='captainTow'||a.m==='charge'||a.m==='switchRecover'&&!e.exposed;
    if(a.m==='walk'||a.m==='cookStep')travel(e,p);
    if(a.m==='windup')attack(e,p,q,false);
    else if(committed){
      q=tow?clamp(tow.phase==='pull'?1-Math.hypot(tow.tx-e.x,tow.ty-e.y)/(tow.distance||1):tow.time/P.CFG.bosses.quayCaptain.anchor.throwT):cast?1:a.act==='ropeSweep'?clamp(1-a.t/(P.CFG.bosses.dockBride.rope.T||1)):1;
      attack(e,p,q,true);if(a.m==='charge')p.roll=.29;
    }else if(e.exposed||a.m==='pause'||a.m==='recover'){
      recovery(e,p);
    }
    if(cast&&cast.lines.length&&a.m!=='windup'){
      var tension=cast.lines.some(function(l){return l.caught;});
      p.hand=[.57,-1.35];p.off=[.28,-1.30];p.roll=tension?-.27:-.12;p.crouch=tension?.17:.08;p.tool=-.35;
    }
    if(e.dockRope&&e.dockRope.t>=0){
      var rope=e.dockRope,sweep=rope.start+rope.span*rope.t/rope.T;
      p.hand=[.30+Math.cos(sweep)*.30,-1.30-Math.sin(sweep)*.24];p.roll=Math.sin(sweep)*.18;p.tool=sweep-.4;p.off=[-.33,-1.05];
    }
    if(e.cartOpening){var caught=1-clamp(((e.age||0)-(e.cartCounterAge||0))/.7);
      p.roll=-.26-.38*caught;p.crouch=.18+.16*caught;p.hand=[.30,-.72];p.off=[-.44,-.93];p.tool=.9;}
    if(e.bossPreset==='quayCaptain'&&a.act==='captainSpice'){p.toolHand='off';p.release=false;}
    if(e.bossPreset==='bigFisher'&&a.act==='bridgeNet'){p.toolHand='off';p.release=false;p.off=[-.27,-1.18];}
    if(e.bossPreset==='cook'&&a.cookToss&&a.cookToss.released&&a.act==='throw'){
      p.release=a.m==='windup'||a.m==='pause'&&a.t/P.CFG.bosses.cook.throw.recover>.18;
      if(a.m==='pause'){var catchP=clamp(1-a.t/P.CFG.bosses.cook.throw.recover);p.hand=[.82-.34*ease(catchP),-1.10-.22*ease(catchP)];p.tool=.80-.40*ease(catchP);}
    }
    if(e.deathPose){
      var d=o.defeatProgress||0,old=e.deathPose;
      var actor={bossPreset:e.bossPreset,x:old.x,y:old.y,age:old.age,ai:old.ai,windup:old.windup,exposed:old.exposed,captainTow:old.captainTow,bridgeCast:old.bridgeCast,dockRope:old.dockRope,cartOpening:old.cartOpening};
      var original=o.deathFrom||B.pose(actor,{});p=Object.assign({},original);defeat(e,p,original,d);
    }
    return p;
  };
  return B;
})();
