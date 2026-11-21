// Protected acting follows walkable paths from the actors' real positions; no campaign facts settle here.
P.SceneActing = (function () {
  var A = {};
  function unit(n) { return Math.max(0, Math.min(1, n)); }
  function smooth(n) { n = unit(n); return n*n*(3-2*n); }
  A.prepare = function (a) {
    if (a.kind === 'entry') {
      var e=a.actor,from=P.WalkPath.nearest(a.run,{x:e.x+(e.x<0?-1:1)*1.1,y:e.y+1.2},e.r);
      var path=from&&P.WalkPath.find(a.run,from,{x:e.x,y:e.y},e.r);
      if(path){a.entryActor={x:from.x,y:from.y,walk:0,moving:false,age:0};a.entryPath=path;
        a.entrySpeed=P.WalkPath.length(from,path)/Math.max(.1,a.T*.78);}
      return;
    }
    a.stage = P.Companion.beginScene(a.run,a.kind,a.actor);
    if (a.stage && !a.repeated) a.T=a.stage.lead+a.stage.approach+a.stage.pause+P.CFG.experience.people.leaveT;
    P.StreetArt.image('kaan-parts-reset');
  };
  A.step=function(a,dt){
    if(a.entryActor){a.entryActor.age=a.t;P.WalkPath.move(a.entryActor,a.entryPath,a.entrySpeed,dt,a.run,a.actor.r);}
    if(a.stage&&!a.reading)P.Companion.sceneStep(a.run,a.t,dt);
  };
  A.state = function (a) {
    var k=a.run.companion,z=a.stage;if(!k||!z)return null;
    var pose=k.moving?(Math.floor(k.walk*5)&1):(a.kind==='farewell'?4:3);
    if(a.t<z.lead)pose=a.kind==='joining'&&a.t>z.lead*.85?3:2;
    if(z.leaving)pose=k.moving?7:6;
    return{x:k.x,y:k.y,pose:pose,visible:true,walking:k.moving};
  };
  A.heroAim = function (a) {
    var q = A.state(a), h = a.run.hero;
    if (!q || !h) return null;
    if (h.moving) return Math.atan2(h.fy,h.fx);
    if(a.kind==='passage'&&a.stage&&a.t>a.stage.lead)return Math.atan2(a.run.geo.exitY-h.y,-h.x);
    return a.t>a.stage.lead*.45?Math.atan2(q.y-h.y,q.x-h.x):null;
  };
  A.draw = function (R, a) {
    if(P.KaanActor&&a.run.companion)P.KaanActor.draw(R,a.run,a.run.companion,a);
  };
  return A;
})();
