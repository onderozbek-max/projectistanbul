// Separate a hook's loaded swing, a signal hand, a haul and an actual moving charge.
P.BossGestures=(function(){
  var B={},C=P.CFG.bossActionGestures;
  B.action=function(e){return C[e.ai&&e.ai.act]||null;};
  B.pose=function(e,st){
    var a=e.ai,z=B.action(e);if(!z)return null;
    if(a.m==='windup'){
      var p=e.windup||0;
      if(z.release&&p>=z.release)return z.commit;
      return z.late&&p>=z.lateAt?z.late:z.prep;
    }
    if(a.m==='charge')return z.commit;
    if(e.bridgeCast&&e.bridgeCast.lines.length)return e.bridgeCast.lines.some(function(q){return q.caught;})?3:4;
    if(e.dockRope&&e.dockRope.t>=0)return 4;
    if(a.m==='switchRecover'||a.m==='recover'||e.exposed||a.m==='pause'||a.m==='stall')
      return st.age<z.returnT?z.commit:5;
    return null;
  };
  B.motion=function(e,i){
    var z=B.action(e),a=e.ai||{},p=Math.max(0,Math.min(1,e.windup||0)),load=0,roll=0;
    if(z&&a.m==='windup'){load=z.load*p;roll=z.roll*p;}
    if(z&&a.m==='charge'){load=z.load*.45;roll=-z.roll*.7;}
    if(e.bridgeCast&&e.bridgeCast.caught){load=1.15;roll=-.12;}
    if(e.exposed||i===5){load=.65;roll=.055;}
    if(P.Settings&&P.Settings.reduceMotion)roll*=.35;
    return{load:load,roll:roll};
  };
  B.mark=function(e,i){
    var d=P.CFG.bossGestures[e.bossPreset];
    return i===3?d.load:i===4?d.strike:i===6?d.signal:d.idle;
  };
  return B;
})();
