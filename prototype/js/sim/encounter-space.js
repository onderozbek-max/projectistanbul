// Bounded existing noise/lure and cover rules. Never affect bosses, an already committed attack, HP or spawn budgets.
P.EncounterSpace=(function(){
  var A={},C=P.CFG.encounterSpace;
  function carrySpace(s,x,y){
    var q=s.streetSite;if(!q)return false;
    var r=q.prop,h=r.street.home,dx=q.x-h.x,dy=q.gripY-h.y,d2=dx*dx+dy*dy;
    var t=d2?Math.max(0,Math.min(1,((x-h.x)*dx+(y-h.y)*dy)/d2)):0;
    var clearance=Math.max(r.b.w,r.b.h)/2+P.CFG.hero.radius+Math.max(C.coverW,C.coverH)/2;
    return Math.hypot(x-q.x,y-q.y)<clearance||Math.hypot(x-h.x-t*dx,y-h.y-t*dy)<clearance;
  }
  A.init=function(s){
    var p=C.profiles[s.levelIndex],m=s.milestone;
    if(!s.routeTrial||!p||!m)return;
    s.encounterSpace={profile:p,events:0,opened:false,cut:0};
    var supply=C.supplyAdvance[s.levelIndex],mark=s.gen.marks.find(function(q){return q.kind==='seg'&&q.id==='D';});
    if(supply&&mark){s.gen.marks.push({kind:'supply',slot:'D',y:Math.min(m.y+supply.afterGate,mark.y-supply.beforeC)});
      s.gen.marks.sort(function(a,b){return a.y-b.y;});}
    if(!p.cover||!s.env)return;
    for(var i=0;i<C.coverBack.length;i++)for(var j=0;j<C.coverSides.length;j++){
      var x=p.cover*C.coverSides[j],y=m.point.y-C.coverBack[i];
      if(carrySpace(s,x,y))continue;
      if(P.Env.addSolid(s,'crates',x,y,C.coverW,C.coverH)){
        s.encounterSpace.cover=s.env.recs[s.env.recs.length-1];return;
      }
    }
  };
  A.release=function(s,p,reason){
    if(!s.encounterSpace||!p)return;
    var from=P.WalkPath.nearest(s,{x:p.x,y:p.y-C.sourceBack},P.CFG.enemies.walker.radius);
    if(!from)return;
    var changed=[];
    s.enemies.forEach(function(e){
      if(e.dead||e.boss||e.elite||e.anchored||e.state!=='active'||e.windup>0||e.ai&&e.ai.m&&e.ai.m!=='walk')return;
      if(Math.hypot(e.x-p.x,e.y-p.y)>C.radius)return;
      e.lure={x:from.x,y:from.y,t:C.time};changed.push(e.id);
    });
    s.encounterSpace.release={x:from.x,y:from.y,at:s.t,until:s.t+C.time,reason:reason,targets:changed};
    s.events.push({type:'routeSpace',phase:reason,x:from.x,y:from.y,targets:changed});
  };
  A.step=function(s){
    var q=s.encounterSpace,m=s.milestone;if(!q||!m)return;
    if(!q.opened&&m.open){
      q.opened=true;
      // Bell, wave, trolley and tram already have a concrete group-displacing consequence.
      if(['bell','wave','trolley','tram','rescue','escort','guide'].indexOf(q.profile.release)<0)
        A.release(s,m.point,q.profile.release);
    }
  };
  return A;
})();
