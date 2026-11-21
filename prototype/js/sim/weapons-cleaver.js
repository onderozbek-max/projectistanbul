// Deliberate body-led Cleaver cuts. The same swept segment drives contacts and the visible action.
P.WeaponsCleaver=(function(){
  var C={};
  function angle(x){return Math.atan2(Math.sin(x),Math.cos(x));}
  function begin(s,lv){
    var h=s.hero,K=P.CFG.weapons.cleaver,A=P.Mods.act(s,'knife'),r=lv.radius*A.area;
    var target=P.Weapons.nearestEnemy(s,h.x,h.y,r);
    var prop=!target&&P.Combat.nearestProp(s,r);if(!target&&!prop)return;
    target=target||prop;var aim=Math.atan2(target.y-h.y,target.x-h.x),side=-(h.cleaverSide||-1);h.cleaverSide=side;
    var swing={t:0,T:K.load+K.cut+K.returnT,a:aim,side:side,arc:(A.sig?360:K.arc)*Math.PI/180,
      range:r,A:A,hit:{},propHit:{},angle:aim-side*(A.sig?360:K.arc)*Math.PI/360,previous:null,active:false};
    P.Weapons.state(s).cleaverSwing=swing;h.cds.cleaver=lv.spinT*A.cd*P.Weapons.cdMult(s,'knife');
    P.Weapons.fired(s,'knife',aim,1,'cleaver');P.Mods.announce(s,A,h.x,h.y,r);
    s.events.push({type:'cleaverCut',x:h.x,y:h.y,a:aim,side:side,range:r,arc:swing.arc,T:swing.T});
  }
  function crosses(s,e,q,from,to,radius){
    var h=s.hero,dx=e.x-h.x,dy=e.y-h.y,d=Math.hypot(dx,dy);
    if(d>q.range+radius)return false;
    var a=angle(Math.atan2(dy,dx)-q.a),pad=Math.asin(Math.min(1,(radius+P.CFG.weapons.cleaver.edgeRadius)/(d||1)));
    var low=Math.min(from,to)-pad,high=Math.max(from,to)+pad;
    return a>=low&&a<=high;
  }
  function contact(s,q,lv,from,to){
    var h=s.hero,dmg=P.Weapons.dmgFor(s,'knife',lv.dmg)*q.A.dmg;
    s.enemies.forEach(function(e){
      if(e.dead||e.state==='dormant'||q.hit[e.id]||!crosses(s,e,q,from,to,e.r))return;
      q.hit[e.id]=true;var dx=e.x-h.x,dy=e.y-h.y,d=Math.hypot(dx,dy)||1;
      P.Mods.hit(s,e,dmg,dx/d,dy/d,P.CFG.weapons.cleaver.knockback*P.Weapons.kbMult(s),'cleaver',q.A);
      s.events.push({type:'cleaverChop',x:e.x,y:e.y,a:Math.atan2(dy,dx),tag:'blade'});
    });
    P.Combat.forEachProp(s,function(p){
      var key=p.id===undefined?p.x+':'+p.y:p.id;
      if(q.propHit[key]||!crosses(s,p,q,from,to,p.r||.4))return;
      q.propHit[key]=true;P.Combat.damageProp(s,p,dmg,'cleaver');
    });
  }
  C.step=function(s,dt){
    var h=s.hero,lv=P.Weapons.level(h,'cleaver'),W=P.Weapons.state(s),K=P.CFG.weapons.cleaver;
    if(!lv)return;
    var ready=P.Weapons.ready(h,'cleaver',dt),q=W.cleaverSwing;
    if(!q&&ready&&!h.streetHolding){begin(s,lv);q=W.cleaverSwing;}
    if(!q)return;
    var old=q.t;q.t+=dt;var from=-q.arc/2,to=q.arc/2;
    if(q.t>=K.load&&old<=K.load+K.cut){
      var p0=Math.max(0,Math.min(1,(old-K.load)/K.cut)),p1=Math.max(0,Math.min(1,(q.t-K.load)/K.cut));
      var a0=from+(to-from)*p0,a1=from+(to-from)*p1;
      if(q.side<0){a0=-a0;a1=-a1;}
      q.previous=q.a+a0;q.angle=q.a+a1;q.active=true;h.cleaA=q.angle;contact(s,q,lv,a0,a1);
    }else q.active=false;
    if(q.t>=q.T)W.cleaverSwing=null;
  };
  return C;
})();
