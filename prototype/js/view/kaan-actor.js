// View-only Kaan acting. Real companion paths/actions supply position/time; no relationship or combat state is written.
P.KaanActor=(function(){
  var V={},figures=new WeakMap();
  function unit(t){return Math.max(0,Math.min(1,t));}
  function ease(t){t=unit(t);return t*t*(3-2*t);}
  function mix(a,b,t){return a+(b-a)*t;}
  V.pose=function(s,k,a){
    var p={hand:[.36,-.74],off:[-.22,-.79],tool:.02,roll:0,crouch:0,travel:0,headCell:13},lower=1;
    if(s.levelIndex===20&&!k.joined){
      lower=a&&a.kind==='joining'&&a.storyDone?ease((a.t-a.stage.lead-a.stage.approach-.35)/1.05):0;
      p.hand=[mix(.20,.36,lower),mix(-1.06,-.74,lower)];p.off=[mix(.46,-.22,lower),mix(-.92,-.79,lower)];
      p.tool=mix(-1.15,.02,lower);p.roll=mix(-.10,0,lower);p.crouch=.045*(1-lower);p.headCell=lower<.78?0:13;
    }
    if(a&&a.kind==='farewell'&&!a.stage.leaving){
      var bow=ease(a.t/.85);p.roll=.10*bow;p.crouch=.08*bow;p.hand=[.17,-.63];p.off=[.03,-.66];p.tool=-.08;p.headCell=12;p.headRoll=.04;
    }
    var support=s.kaanSupport,K=P.CFG.bond.kaan.support,age=support?s.t-support.start:-1;
    if(!a&&k.joined&&age>=0&&age<K.duration){
      var load=ease(age/K.windup),strike=ease((age-K.windup)/.22),back=ease((age-K.windup-.22)/Math.max(.1,K.duration-K.windup-.22));
      p.hand=[mix(.04,.67,strike)*(1-back)+.36*back,-.95-.20*load+.35*strike];
      p.off=[-.19,-.89];p.tool=mix(-.45,-1.85,load)+strike*2.9;p.roll=-.12*load+.30*strike*(1-back);p.crouch=.06*load;
    }
    var work=!a&&s.milestone&&s.milestone.work;
    if(work&&work.active&&!k.moving){var lift=ease(work.progress/.65);
      p.hand=[.36,-.45-lift*.37];p.off=[-.05,-.45-lift*.37];p.roll=.16*(1-lift);p.crouch=.12*(1-lift);p.release=true;p.loading=true;}
    p.hand=p.hand.map(function(v){return v*.75;});p.off=p.off.map(function(v){return v*.75;});
    p.crouch=(p.crouch+(k.moving?.05:0))*.75;p.lowering=lower;return p;
  };
  V.ready=function(){return!!(P.CFG.kaanParts&&P.StreetArt.image('kaan-parts-reset'));};
  V.draw=function(R,s,k,a){
    var spec=P.CFG.kaanParts,im=P.StreetArt.image('kaan-parts-reset');if(!spec||!im||!P.BossPuppet)return false;
    var e=figures.get(k);if(!e){e={id:'view-kaan',ai:{m:'walk'},rear:false,rearFrom:false,rearAt:-10};figures.set(k,e);}
    var age=a?a.t:s.t,p=V.pose(s,k,a),service=a&&a.kind==='passage'&&a.t>a.stage.lead;
    var rear=!!(k.moving&&k.fy>.3&&Math.abs(k.fy)>Math.abs(k.fx)||service&&!k.moving&&s.geo.exitY>k.y+Math.abs(k.x));
    if(age<(e.age||0)){e.rearAt=-10;e.rear=rear;e.rearFrom=rear;}
    if(rear!==e.rear){e.rearFrom=e.rear;e.rear=rear;e.rearAt=age;}
    var turn=unit((age-e.rearAt)/.28),showRear=turn<.5?e.rearFrom:e.rear,plane=1-.72*Math.sin(Math.PI*turn);
    if(showRear){p.headCell=14;p.torsoCell=15;}
    var attention=a&&!k.moving&&!a.stage.leaving;
    e.x=k.x;e.y=k.y;e.walk=k.walk||0;e.age=age;e.dvx=service?-k.x:attention?s.hero.x-k.x:k.fx||0;e.dvy=service?s.geo.exitY-k.y:attention?s.hero.y-k.y:k.fy||0;
    var c=R.ctx,u=R.ppm,x=R.X(k.x),y=R.Y(k.y);
    c.save();c.fillStyle='rgba(20,21,31,.18)';c.beginPath();c.ellipse(x,y,.28*u,.11*u,0,0,Math.PI*2);c.fill();c.restore();
    P.BossPuppet.draw(c,e,{actorStyle:spec.style,actorParts:spec,actorImage:im,actorPose:p,actorTurn:plane},x,y,u,e.dvx<0?-1:1);
    if(p.loading){var work=s.milestone.work,grip=P.BossPuppet.contact(e),f=spec.cells[3],pallet=s.milestone.pallet;
      c.save();c.translate(R.X(pallet.x-.72),R.Y(pallet.y+.28));c.rotate(.8);
      c.drawImage(im,f[0],f[1],f[2],f[3],-.12*u,-.32*u,.25*u,.64*u);c.restore();
      if(work.progress>.12&&grip&&P.EminonuFx)P.EminonuFx.workSack(c,(grip.x+grip.offX)*.5,(grip.y+grip.offY)*.5,u);}
    V.last={x:k.x,y:k.y,age:age,scene:a&&a.kind,pose:p,contacts:P.BossPuppet.contact(e),viewOnly:true};return true;
  };
  return V;
})();
