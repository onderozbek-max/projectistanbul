// Kaan has one continuous world position. No reward, combat clock or join fact is settled here.
P.Companion = (function () {
  var A={}, C=P.CFG.experience.people;
  function point(a){return{x:a.x,y:a.y};}
  A.init=function(s){
    if(!s.routeTrial||s.levelIndex<20||s.levelIndex>30)return;
    var joined=!!(s.loadout&&s.loadout.kaanJoined);
    if(s.levelIndex>20&&!joined)return;
    var h=s.hero,p=P.WalkPath.nearest(s,joined?{x:h.x+C.spacing,y:h.y-C.trail}:
      {x:C.watchX,y:s.geo.holdY+C.watchAhead},C.radius);
    if(p)s.companion={x:p.x,y:p.y,fx:0,fy:-1,walk:0,moving:false,joined:joined,path:[],repath:0};
  };
  function route(s,a,p){
    var goal=P.WalkPath.nearest(s,p,C.radius), path=goal&&P.WalkPath.find(s,a,goal,C.radius);
    if(path){a.path=path;a.repath=C.repath;}return path;
  }
  A.intercept=function(s,p){
    var a=s.companion;if(!a||!a.joined)return null;
    if(!route(s,a,p))return null;a.interceptUntil=s.t+C.interceptHold;return a;
  };
  A.step=function(s,dt){
    var a=s.companion,h=s.hero;if(!a||!a.joined||a.stage)return;
    a.repath-=dt;
    var working=P.EminonuTrial&&P.EminonuTrial.work(s,dt);
    var d=Math.hypot(h.x-a.x,h.y-a.y), hold=a.interceptUntil>s.t||working;
    if(!hold&&a.repath<=0&&d>C.followDistance)route(s,a,{x:h.x+(h.fx<0?-C.spacing:C.spacing),y:h.y-C.trail});
    if(!hold&&d<C.stopDistance)a.path=[];
    P.WalkPath.move(a,a.path,d>C.catchupDistance?C.catchupSpeed:C.speed,dt,s,C.radius);
    if(!a.moving){a.fx=h.x-a.x;a.fy=h.y-a.y;}
  };
  function marks(s,a,body,kind){
    var h=s.hero,avoid=function(p){return body&&Math.hypot(p.x-body.x,p.y-body.y)<body.r+C.bodyGap||
      s.zones.some(function(z){return z.t>0&&Math.hypot(p.x-z.x,p.y-z.y)<z.r+P.CFG.hero.radius;});};
    var near=kind==='farewell'&&body;
    var hp=P.WalkPath.nearest(s,near?{x:body.x-C.spacing,y:body.y-body.r-C.bodyGap}:{x:h.x-C.makeSpace,y:h.y},P.CFG.hero.radius,avoid);
    if(!hp)return null;
    var ap=P.WalkPath.nearest(s,near?{x:body.x+C.makeSpace,y:body.y-body.r-C.bodyGap}:{x:hp.x+C.spacing,y:hp.y+C.alongside},C.radius,avoid);
    var hpath=P.WalkPath.find(s,h,hp,P.CFG.hero.radius),apath=ap&&P.WalkPath.find(s,a,ap,C.radius);
    return hpath&&apath?{hero:hpath,friend:apath}:null;
  }
  A.beginScene=function(s,kind,body){
    if(!s.companion)A.init(s);
    var a=s.companion;if(!a)return null;
    var paths=marks(s,a,body,kind)||{hero:[],friend:[]};
    var approach=Math.max(C.minApproach,P.WalkPath.length(a,paths.friend)/C.sceneSpeed,
      P.WalkPath.length(s.hero,paths.hero)/C.sceneSpeed)+C.arrivalT;
    a.stage={kind:kind,hero:paths.hero,friend:paths.friend,lead:kind==='farewell'?C.griefLead:C.lead,
      approach:approach,pause:kind==='farewell'?C.griefPause:kind==='joining'?C.recognitionPause:C.pause,leaving:false};
    return a.stage;
  };
  function leave(s,a){
    var h=s.hero,top=Math.min(h.y+C.leaveDistance,s.geo.exitY-C.exitMargin);
    var service=a.stage.kind==='passage',hx=service?0:h.x,ax=service?C.spacing:a.x;
    var hp=P.WalkPath.nearest(s,{x:hx,y:top},P.CFG.hero.radius),ap=P.WalkPath.nearest(s,{x:ax,y:top+C.alongside},C.radius);
    a.stage.hero=hp&&P.WalkPath.find(s,h,hp,P.CFG.hero.radius)||[];
    a.stage.friend=ap&&P.WalkPath.find(s,a,ap,C.radius)||[];a.stage.leaving=true;
  }
  A.sceneStep=function(s,time,dt){
    var a=s.companion,z=a&&a.stage,h=s.hero;if(!z)return;
    h.moving=a.moving=false;
    if(time<z.lead)return;
    if(time>=z.lead+z.approach+z.pause&&!z.leaving)leave(s,a);
    if(time<z.lead+z.approach||z.leaving){
      P.WalkPath.move(h,z.hero,arrivalSpeed(h,z.hero),dt,s,P.CFG.hero.radius);P.WalkPath.move(a,z.friend,arrivalSpeed(a,z.friend),dt,s,C.radius);
    }
  };
  function arrivalSpeed(actor,path){return C.sceneSpeed*Math.min(1,.35+P.WalkPath.length(actor,path)/C.stopDistance*.65);}
  A.endScene=function(s){var a=s.companion;if(a){a.stage=null;a.joined=true;a.repath=0;a.path=[];}};
  A.point=point;
  return A;
})();
