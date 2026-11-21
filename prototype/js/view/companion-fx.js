// One grounded, depth-sorted Kaan persists after the world/comic handoff.
P.CompanionFx = (function () {
  var V={};
  V.depth=function(R,s){
    var a=s.companion,scene=P.SceneFlow&&P.SceneFlow.current();
    if(!a||scene&&scene.kind!=='entry'||Math.abs(a.y-R.cam.y)>P.viewHalfH(R.cam.w)+3)return;
    R.depth(a.y,function(){
      if(P.KaanActor)P.KaanActor.draw(R,s,a,null);
    },false);
  };
  return V;
})();
