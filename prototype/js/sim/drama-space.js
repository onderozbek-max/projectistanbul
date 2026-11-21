// Physical compositions use normal illustrated solids, collision, damage and existing objective facts.
P.DramaSpace=(function(){
  var D={},C=P.CFG.dramaSpace;
  function place(s,kind,x,y,w,h){
    var site=s.streetSite;
    if(site){var r=site.prop,home=r.street.home,pad=P.CFG.hero.radius+P.CFG.env.clashGap;
      if(x+w/2>Math.min(home.x,site.x)-r.b.w/2-pad&&x-w/2<Math.max(home.x,site.x)+r.b.w/2+pad&&
        y+h/2>Math.min(home.y,site.gripY)-r.b.h/2-pad&&y-h/2<Math.max(home.y,site.y)+r.b.h/2+pad)return null;}
    if(!P.Env.addSolid(s,kind,x,y,w,h))return null;
    var b=s.geo.blocks[s.geo.blocks.length-1];return b.rec||b;
  }
  D.init=function(s){
    var m=s.milestone,list=C.levels[s.levelIndex];
    if(!s.routeTrial||!s.env||!m||!list)return;
    var target=P.RouteMilestones.target(s),work=m.point||(target&&{x:target[0],y:target[1]});
    if(!work)return;
    s.dramaSpace={solids:[],work:{x:work.x,y:work.y}};
    list.forEach(function(q){
      for(var i=0;i<C.seek.length;i++){
        var r=place(s,q[0],q[1],work.y+q[2]+C.seek[i],q[3],q[4]);
        if(r){s.dramaSpace.solids.push(r);break;}
      }
    });
    if(s.tacticalReplay===25){
      var pillars=s.geo.blocks.filter(function(b){return b.kind==='bollard'||b.kind==='lx_pillar';}).filter(function(b){return b.y>=s.geo.holdY-4;}).slice(0,2);
      pillars.forEach(function(b){var i=s.geo.blocks.indexOf(b),dx=P.CFG.bosses.quayCaptain.mooringShift;
        s.geo.blocks.splice(i,1);if(!P.Env.addSolid(s,b.kind,b.x+dx,b.y,b.w,b.h))s.geo.blocks.splice(i,0,b);});
    }
    if(s.levelIndex===8&&!m.bellPosts){
      var at=P.WalkPath.nearest(s,{x:-C.bellSide,y:m.point.y},P.CFG.hero.radius);
      if(at&&Math.abs(at.x)>1.4){m.point.x=at.x;s.dramaSpace.work.x=at.x;}
    }
    if(s.levelIndex===22&&s.streetSite){
      var site=s.streetSite,sign=site.x<0?-1:1,k=C.domino;
      var r=place(s,'crates',-sign*k.x,site.y+k.ahead,k.w,k.h);
      if(r){r.domino=true;s.dramaSpace.domino=r;}
    }
  };
  D.impact=function(s,w){
    var p=w.to,damage=C.dominoDamage;
    // A blunt cart landing hits actual nearby breakable material, never unrelated remote objects.
    P.Combat.forEachProp(s,function(r){
      if(r===w.r||!r.alive||Math.hypot(r.x-p.x,r.y-p.y)>P.CFG.env.streetWeapon.landR+(r.r||0))return;
      P.Combat.damageProp(s,r,damage,'streetCart');
    });
  };
  return D;
})();
