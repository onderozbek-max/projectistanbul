// Repair held-tool ownership without changing Arda's authored running or the simulation's attacks.
P.HeroContact = (function () {
  var H = {}, twoHand = { chainsaw: true, grinder: true, sledge: true, blacksmith: true };
  var tracked = { knife: true, cleaver: true, chain: true, cyclone: true, arcchain: true,
    chainsaw: true, grinder: true, sledge: true, blacksmith: true };
  H.apply = function (r, view, frame, o, mirror, hands) {
    if (!tracked[o.attackId] || !o.attackStance || o.workPoint) return;
    var p=Math.max(0,Math.min(1,o.attackProgress || 0)), a=o.attackBladeAngle===undefined?o.attackStance.aim:o.attackBladeAngle;
    var main=(o.attackHand < 0)!==(mirror < 0)?0:1, names=['left','right'];
    var q=hands[main], worldX=Math.cos(a)/mirror, worldY=-Math.sin(a);
    var sweep=Math.sin(p*Math.PI*2), push=Math.sin(p*Math.PI)*r.sh*(o.attackBladeAngle===undefined?.065:.16);
    var saw=o.attackId==='chainsaw' || o.attackId==='grinder';
    var x=q[0]+worldX*push, y=q[1]+worldY*push+sweep*r.sh*.038;
    if (saw) { var bite=o.attackResistance||0;
      x=r.sw*.56+worldX*r.sh*(.10-.045*bite);y=r.sh*.53+worldY*r.sh*.045+push*.12; }
    var targets={}; targets[names[main]]={x:x,y:y};
    if (twoHand[o.attackId]) {var brace=saw?.14:-.10;targets[names[1-main]]={x:x+worldX*r.sh*brace,y:y+worldY*r.sh*brace+r.sh*.018};}
    o.motion.workTargets=targets; o.motion.handPoints=hands;
  };
  return H;
})();
