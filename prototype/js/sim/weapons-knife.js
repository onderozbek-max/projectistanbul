// Load, cut and return share their actual swept geometry with the held blade. Rear cuts are separate backhands.
P.WeaponsKnife=(function(){
  var B={};
  function wrap(a){return Math.atan2(Math.sin(a),Math.cos(a));}
  function begin(s,lv){
    var h=s.hero,K=P.CFG.weapons.knife,A=P.Mods.act(s,'knife'),range=lv.range*A.area;
    var target=P.Weapons.nearestEnemy(s,h.x,h.y,range)||P.Combat.nearestProp(s,range);if(!target)return;
    var aim=Math.atan2(target.y-h.y,target.x-h.x),spin=!!(A.sig&&A.sig.extra==='spin');
    h.swingDir=-(h.swingDir||-1);
    var q={t:0,a:aim,side:h.swingDir,arc:(spin?360:lv.arcDeg)*Math.PI/180,range:range,A:A,
      strokes:!spin&&lv.back?2:1,stroke:0,active:false,hits:{},props:{},angle:aim};
    q.angle=aim-q.side*q.arc/2;q.aim=aim;
    q.T=(K.load+K.cut)*q.strokes+K.returnT;P.Weapons.state(s).knifeSwing=q;
    h.cds.knife=K.cooldown*A.cd*P.Weapons.cdMult(s,'knife');
    P.Weapons.fired(s,'knife',aim,q.strokes);s.events[s.events.length-1].actionT=q.T;
    P.Mods.announce(s,A,h.x,h.y,range);s.swings++;
  }
  function struck(s,q,e,r,a0,a1){
    var dx=e.x-s.hero.x,dy=e.y-s.hero.y,d=Math.hypot(dx,dy);
    if(d>q.range+r)return false;
    var a=wrap(Math.atan2(dy,dx)-q.aim),pad=Math.asin(Math.min(1,r/(d||1)));
    return a>=Math.min(a0,a1)-pad&&a<=Math.max(a0,a1)+pad;
  }
  function contact(s,q,lv,a0,a1){
    var K=P.CFG.weapons.knife,h=s.hero,dmg=P.Weapons.dmgFor(s,'knife',lv.dmg)*q.A.dmg;
    s.enemies.forEach(function(e){
      var key=q.stroke+':'+e.id;if(e.dead||e.state==='dormant'||q.hits[key]||!struck(s,q,e,e.r,a0,a1))return;
      q.hits[key]=true;var dx=e.x-h.x,dy=e.y-h.y,d=Math.hypot(dx,dy)||1;
      P.Mods.hit(s,e,dmg,dx/d,dy/d,K.knockback*P.Weapons.kbMult(s),'knife',q.A);
    });
    P.Combat.forEachProp(s,function(p){var key=q.stroke+':'+p.x+':'+p.y;
      if(q.props[key]||!struck(s,q,p,p.r,a0,a1))return;
      q.props[key]=true;P.Combat.damageProp(s,p,dmg,'knife');});
  }
  B.step=function(s,dt){
    var h=s.hero,lv=P.Weapons.level(h,'knife'),K=P.CFG.weapons.knife,W=P.Weapons.state(s);if(!lv)return;
    var ready=P.Weapons.ready(h,'knife',dt),q=W.knifeSwing;if(!q&&ready){begin(s,lv);q=W.knifeSwing;}if(!q)return;
    var old=q.t;q.t+=dt;var stride=K.load+K.cut,stroke=Math.min(q.strokes-1,Math.floor(q.t/stride));
    if(stroke!==q.stroke){q.stroke=stroke;s.events.push({type:'knifeBackhand',ang:q.a+Math.PI,actionT:stride+K.returnT,lv:h.weapons.knife});}
    q.aim=q.a+(q.stroke?Math.PI:0);var local=q.t-q.stroke*stride,before=old-q.stroke*stride;
    q.active=local>=K.load&&before<K.load+K.cut;
    var p0=Math.max(0,Math.min(1,(before-K.load)/K.cut)),p1=Math.max(0,Math.min(1,(local-K.load)/K.cut));
    var side=q.stroke?-q.side:q.side,a0=(-.5+p0)*q.arc*side,a1=(-.5+p1)*q.arc*side;q.previous=q.angle;q.angle=q.aim+a1;
    if(q.active){if(before<K.load)s.events.push({type:'swing',tag:'blade',x:h.x,y:h.y,ax:Math.cos(q.aim),ay:Math.sin(q.aim),range:q.range,arcDeg:q.arc*180/Math.PI,dir:side,back:!!q.stroke,physical:true});
      contact(s,q,lv,a0,a1);}
    if(q.t>=q.T)W.knifeSwing=null;
  };
  return B;
})();
