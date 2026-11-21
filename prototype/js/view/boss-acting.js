// Authored boss steps/contact poses. State, direction, position and attack time remain simulation-owned.
P.BossActing = (function () {
  var B = {}, defs = P.CFG.bossActing, clocks = new WeakMap(), contacts = new WeakMap();
  function unit(n) { return Math.max(0,Math.min(1,n)); }
  function state(e) {
    var a=e.ai || {}, previous=clocks.get(e), age=e.age || 0;
    if (!previous || previous.mode!==a.m || previous.act!==a.act) {
      previous={mode:a.m,act:a.act,at:age}; clocks.set(e,previous);
    }
    return { age: Math.max(0,age-previous.at), mode:a.m, act:a.act };
  }
  B.pose = function (e,o) {
    var a=e.ai || {}, st=state(e);
    if (a.m==='defeat' || e.dead) return 7;
    if (o.sceneEntry!==undefined) return o.sceneEntry < .55 ? 0 : 3;
    var gesture=P.BossGestures&&P.BossGestures.pose(e,st);
    if(gesture!==null&&gesture!==undefined)return gesture;
    if (a.m==='windup') return 3;
    if (a.m==='charge') return 4;
    if (a.m==='switchRecover' || a.m==='recover') return st.age < .22 ? 4 : 5;
    if (e.exposed || a.m==='stall' || a.m==='pause') return 5;
    if (!o.stopped && Math.hypot(e.dvx || e.vx || 0,e.dvy || e.vy || 0)>.08)
      return 1+(Math.floor((e.walk || 0)*3.7)%2);
    return 0;
  };
  B.draw = function (c,e,o,x,y,u,f) {
    var d=defs[e.bossPreset]; if (!d || !P.StreetArt.current()) return false;
    var im=P.StreetArt.image(d.sheet); if (!im) return true;
    var i=B.pose(e,o), q=d.frames[i], k=u*d.metres/d.heightPx, a=e.ai || {};
    var lock=a.m!=='walk' && a.dir, direction=lock ? a.dir.x : e.dvx || e.vx;
    if (Math.abs(direction || 0)>.12) f=direction<0?-1:1;
    var motion=P.BossGestures?P.BossGestures.motion(e,i):{},mark=P.BossGestures&&P.BossGestures.mark(e,i);
    c.save(); c.translate(x,y); c.scale(f,1);
    if(a.m==='charge'&&P.BossFootwork){
      c.save();c.beginPath();c.rect(-q[4]*k,(q[3]*.67-q[5])*k,q[2]*k,q[3]*.33*k);c.clip();
      P.BossFootwork.stride(c,im,q,q[4],q[5],[.71,.51],k,(a.dist||0)*5);c.restore();
      c.save();c.beginPath();c.rect(-q[4]*k,-q[5]*k,q[2]*k,q[3]*.67*k);c.clip();
      P.BossJoints.draw(c,im,q,[q[4],q[5]],k,motion);c.restore();
    }else P.BossJoints.draw(c,im,q,[q[4],q[5]],k,motion);
    c.restore();
    if(mark){var hand=P.BossJoints.point(q,[q[4],q[5]],k,f,mark[0],mark[1],motion),
      tip=P.BossJoints.point(q,[q[4],q[5]],k,f,mark[2],mark[3],motion);
      contacts.set(e,{x:x+hand.x,y:y+hand.y,tipX:x+tip.x,tipY:y+tip.y,pose:i,facing:f});}
    return true;
  };
  B.contact = function (e) { return P.BossPuppet && P.BossPuppet.contact(e) || contacts.get(e); };
  B.covers = function (e) { return !!defs[e.bossPreset]; };
  B.awaitArt = function(done,level) {
    var id={1:'cook',25:'quayCaptain',30:'ticketMan',2:'switchkeeper',3:'roaster',4:'linekeeper',5:'vatman',10:'bellkeeper',15:'dockBride',20:'bigFisher'}[level];
    var parts=id && P.CFG.bossParts && P.CFG.bossParts[id];
    return !id || !parts&&!defs[id] || P.StreetArt.awaitList(parts?['boss-parts-'+id,'boss-controls-reset','boss-torsos-reset']:[defs[id].sheet],done);
  };
  B.wrapAtlas = function(base) {
    return {base:base,awaitArt:function(done,level){
      var keys=level>=20&&level<=30?['kaan-parts-reset']:[];
      if (level === 23) keys.push('market-carry-reset');
      if (level === 18 || level === 19 || level === 25) keys.push('weather-controls-reset','work-stages-audit8');
      if (!P.StreetArt.awaitList(keys,function(ready){
        if(!ready){done(false);return;}
        if(base.awaitArt(done,level))done(true);
      })) return false;
      return base.awaitArt(done,level);
    }};
  };
  B.ready = function () { return Object.keys(defs).every(function (id) { return !!P.StreetArt.image(defs[id].sheet); }); };
  return B;
})();
