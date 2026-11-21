// Independent painted limbs, two-bone articulation and world-planted feet. Accepted hero gait is untouched.
P.BossPuppet=(function(){
  var B={},states=new Map(),grips=new WeakMap(),C=P.CFG.bossPerformance;
  B.reset=function(){states=new Map();grips=new WeakMap();};
  function clamp(x){return Math.max(0,Math.min(1,x));}
  function point(x,y){return{x:x,y:y};}
  function two(a,b,l1,l2,side){
    var dx=b.x-a.x,dy=b.y-a.y,d=Math.min(l1+l2-.001,Math.max(.03,Math.hypot(dx,dy))),ang=Math.atan2(dy,dx);
    var q=Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d))));
    return point(a.x+Math.cos(ang+side*q)*l1,a.y+Math.sin(ang+side*q)*l1);
  }
  function stamp(c,img,cell,x,y,w,h,angle,px,py){
    c.save();c.translate(x,y);c.rotate(angle||0);c.drawImage(img,cell[0],cell[1],cell[2],cell[3],-w*(px===undefined?.5:px),-h*(py===undefined?.5:py),w,h);c.restore();
  }
  function bone(c,img,cell,a,b,width,reverse){
    var upper=reverse==='near'||reverse==='far';
    var custom=Array.isArray(reverse);
    var from=custom?reverse.slice(0,2):upper?(reverse==='near'?[.22,.15]:[.78,.15]):reverse?[.21,.81]:[.50,.13];
    var to=custom?reverse.slice(2):upper?(reverse==='near'?[.78,.86]:[.22,.86]):reverse?[.76,.19]:[.50,.87];
    var sx=(to[0]-from[0])*cell[2],sy=(to[1]-from[1])*cell[3],dx=b.x-a.x,dy=b.y-a.y;
    var k=Math.hypot(dx,dy)/Math.hypot(sx,sy),angle=Math.atan2(dy,dx)-Math.atan2(sy,sx);
    stamp(c,img,cell,a.x,a.y,cell[2]*k,cell[3]*k,angle,from[0],from[1]);
  }
  function motion(e,f,o){
    var key=e.id===undefined?e:e.id,st=states.get(key),age=e.age||0;
    if(!st){st={at:age,face:f,pivot:0,feet:[null,null],swing:[null,null],prev:[0,0],x:e.x,y:e.y};states.set(key,st);}
    if(age<st.at){st.at=age;st.changed=age-C.settleT;}
    var dt=Math.max(0,Math.min(.08,age-st.at)),a=e.ai||{},dir=a.m==='walk'?(e.dvx||e.vx||0):a.dir&&a.dir.x;
    var goal=Math.abs(dir||0)>.12?Math.sign(dir):st.face;
    if(goal!==st.face&&!st.turnTo){st.turnTo=goal;st.turnFrom=st.face;st.pivot=0;}
    if(st.turnTo){st.pivot+=dt;var progress=clamp(st.pivot/C.turnT),face=progress>=.5?st.turnTo:st.turnFrom;
      if(face!==st.face){st.feet.forEach(function(q){if(q)q.x=-q.x;});st.swing.forEach(function(q){if(q)q.x=-q.x;});st.face=face;}
      if(progress>=1){st.turnTo=0;st.pivot=0;}}
    st.at=age;st.turn=1-.76*Math.sin(Math.PI*clamp(st.pivot/C.turnT));return st;
  }
  function feet(e,st,d,p,f){
    var dx=e.x-st.x,dy=e.y-st.y,dist=Math.hypot(dx,dy),phase=(e.walk||0)/d.stride,contact=d.contactShare||C.contactShare;
    if(e.age!==st.posAge){st.moving=dist>.0001;st.posAge=e.age;}
    var moving=st.moving;if(dist>.0001){st.dirX=dx/dist*f;st.dirY=-dy/dist;}
    st.x=e.x;st.y=e.y;
    return [0,1].map(function(side){
      var q=(phase+side*.5)%1,swing=q>contact,base=d.footBase?d.footBase[side]:side?.22:-.24;
      if(!st.feet[side])st.feet[side]=point(base,0);
      var foot=st.feet[side];
      if(p.death!==undefined){var fall=clamp(p.death*1.7);return point(foot.x*(1-fall)+(base+(side?.24:-.13))*fall,foot.y*(1-fall)+(.05+side*.025)*fall);}
      if(!moving)return point(foot.x,foot.y);
      if(!swing){st.swing[side]=null;foot.x-=dx*f;foot.y+=dy;foot.x=Math.max(-.62,Math.min(.62,foot.x));}
      else{if(!st.swing[side])st.swing[side]=point(foot.x,foot.y);
        var t=(q-contact)/(1-contact),start=st.swing[side];
        foot.x=start.x+(base+(st.dirX||0)*(d.stepReach||.32)-start.x)*t;
        foot.y=start.y+((st.dirY||0)*(d.stepReach||.22)-start.y)*t-Math.sin(Math.PI*t)*(d.stepLift||C.stepLift);}
      st.prev[side]=q;return point(foot.x,foot.y+side*.035);
    });
  }
  function leg(c,img,cells,d,hip,foot,side){
    if(d.robe){var shoe=cells[side?11:9].slice();shoe[1]+=shoe[3]*.70;shoe[3]*=.30;
      stamp(c,img,shoe,foot.x,foot.y,.40,.19,0,.5,.9);return;}
    var ankle=point(foot.x,foot.y-(d.ankleHeight||.12)),knee=two(hip,ankle,d.thigh,d.shin,-1);
    bone(c,img,cells[side?10:8],hip,knee,d.wide*.34,false);
    bone(c,img,cells[side?11:9],knee,point(foot.x,foot.y-.02),d.wide*.38,false);
  }
  function render(c,img,cells,d,p,foot,torso,torsoCell){
    var hip=point(p.roll*.08,-d.hip+p.crouch),offset=d.hipOffset||[-.13,.16],farHip=point(hip.x+offset[0],hip.y),nearHip=point(hip.x+offset[1],hip.y+.025);
    var neck=point(hip.x+Math.sin(p.roll)*d.torso,hip.y-Math.cos(p.roll)*d.torso);
    var shoulder=point(neck.x+.32*d.wide,neck.y+.26*d.torso),back=point(neck.x-.35*d.wide,neck.y+.26*d.torso),hand=point(p.hand[0],p.hand[1]+p.crouch*.6),off=point(p.off[0],p.off[1]+p.crouch*.6);
    leg(c,img,cells,d,farHip,foot[0],0);
    leg(c,img,cells,d,nearHip,foot[1],1);
    var farElbow=two(back,off,d.arm,d.forearm,-1),nearElbow=two(shoulder,hand,d.arm,d.forearm,1);
    bone(c,img,cells[4],back,farElbow,d.wide*.29,d.sameArms?'near':'far');bone(c,img,cells[6],shoulder,nearElbow,d.wide*.29,'near');
    if(d.robe){
      stamp(c,img,cells[8],hip.x-.19,hip.y+.55,d.wide*.60,.86,p.roll*.18+foot[0].x*.08);
      stamp(c,img,cells[10],hip.x+.19,hip.y+.55,d.wide*.60,.86,p.roll*.18+foot[1].x*.08);
    }
    stamp(c,img,cells[2],hip.x,hip.y+(d.robe?.29:.05),d.wide*(d.robe?1.06:.88),d.robe?.88:.46,p.roll*.35);
    stamp(c,torso||img,torsoCell||cells[1],(hip.x+neck.x)/2,(hip.y+neck.y)/2,d.wide,d.torso*1.16,p.roll,.5,.5);
    if(d.control&&P.CFG.bossControls){var control=P.StreetArt.image('boss-controls-reset'),v=d.control,cell=P.CFG.bossControls.cells[v.cell];
      if(control)stamp(c,control,cell,off.x,off.y,v.height*cell[2]/cell[3],v.height,p.death?-.5*p.death:0,v.grip[0],v.grip[1]);}
    bone(c,img,cells[5],farElbow,off,d.wide*.27,d.forearmAnchors||true);
    stamp(c,img,cells[p.headCell||0],neck.x+.05,neck.y+.03,d.head*.90,d.head,p.roll*.32+(p.headRoll||0),.5,.87);
    var toolHand=p.toolHand==='off'?off:hand,held=p.dropped||{x:toolHand.x,y:toolHand.y,a:p.tool};
    if(!p.release||p.dropped){var gr=d.grip;
      stamp(c,img,cells[3],held.x,held.y,d.tool*cells[3][2]/cells[3][3],d.tool,held.a,gr[0],gr[1]);}
    bone(c,img,cells[7],nearElbow,hand,d.wide*.27,d.forearmAnchors||true);
    return{hand:hand,off:off,neck:neck,hip:hip,tool:held};
  }
  function performance(st,e,o){
    var age=e.age||0,key=o.sceneEntry!==undefined?'entry':(e.ai&&e.ai.m)+'|'+(e.ai&&e.ai.act)+'|'+(e.ai&&e.ai.combo||0);
    if(e.deathPose){if(!st.deathFrom&&st.lastPose)st.deathFrom=st.lastPose;o.deathFrom=st.deathFrom;}
    var p=P.BossPerformance.pose(e,o);
    if(key!==st.mode){st.from=st.lastPose;st.changed=age;st.mode=key;}
    var t=Math.max(0,Math.min(1,(age-(st.changed||0))/C.settleT));t=t*t*(3-2*t);
    if(!e.deathPose&&o.sceneEntry===undefined&&st.from&&t<1){
      ['hand','off'].forEach(function(k){p[k]=p[k].map(function(v,i){return st.from[k][i]+(v-st.from[k][i])*t;});});
      ['roll','crouch','travel'].forEach(function(k){p[k]=(st.from[k]||0)+((p[k]||0)-(st.from[k]||0))*t;});
      var delta=Math.atan2(Math.sin(p.tool-st.from.tool),Math.cos(p.tool-st.from.tool));p.tool=st.from.tool+delta*t;
    }
    st.lastPose=Object.assign({},p,{hand:p.hand.slice(),off:p.off.slice()});return p;
  }
  B.draw=function(c,e,o,x,y,u,f){
    var id=e.bossPreset,d=o.actorStyle||C[id],art=o.actorParts||P.CFG.bossParts&&P.CFG.bossParts[id];if(!d||!art||!P.StreetArt.current())return false;
    var img=o.actorImage||P.StreetArt.image('boss-parts-'+id),actor=!!o.actorStyle;if(!img||!actor&&P.CFG.bossTorsos&&!P.StreetArt.image('boss-torsos-reset'))return true;
    var st=motion(e,f,o),p=o.actorPose||performance(st,e,o),foot=feet(e,st,d,p,st.face),marks,turn=st.turn*(o.actorTurn||1);
    foot.forEach(function(q){q.x/=turn;});
    c.save();c.translate(x+(p.travel||0)*u*st.face,y);c.scale(u*st.face*turn,u);marks=render(c,img,art.cells,d,p,foot,actor?img:P.StreetArt.image('boss-torsos-reset'),actor?art.cells[p.torsoCell||1]:P.CFG.bossTorsos&&P.CFG.bossTorsos.cells[id]);c.restore();
    var gr=d.grip,tip=d.tip,w=d.tool*art.cells[3][2]/art.cells[3][3],tx=(tip[0]-gr[0])*w,ty=(tip[1]-gr[1])*d.tool;
    var tipX=marks.tool.x+tx*Math.cos(marks.tool.a)-ty*Math.sin(marks.tool.a),tipY=marks.tool.y+tx*Math.sin(marks.tool.a)+ty*Math.cos(marks.tool.a);
    grips.set(o.contactOwner||e,{x:x+marks.hand.x*u*st.face*turn,y:y+marks.hand.y*u,offX:x+marks.off.x*u*st.face*turn,offY:y+marks.off.y*u,
      tipX:x+tipX*u*st.face*turn,tipY:y+tipY*u,facing:st.face,parts:true,released:p.release&&!p.dropped,
      feet:foot.map(function(q){return{x:x+q.x*u*st.face*turn,y:y+q.y*u};})});return true;
  };
  B.tool=function(c,id,x,y,u,a){var d=C[id],art=P.CFG.bossParts[id],im=P.StreetArt.image('boss-parts-'+id);if(!im)return false;
    stamp(c,im,art.cells[3],x,y,d.tool*art.cells[3][2]/art.cells[3][3]*u,d.tool*u,a,d.grip[0],d.grip[1]);return true;};
  B.contact=function(e){return grips.get(e);};
  B.ground=function(R,s){
    var e=s.dir.trialBoss||s.gen&&s.gen.boss;if(!e||!C[e.bossPreset])return;
    var c=R.ctx,u=R.ppm,K=P.CFG.bossFloor[e.bossPreset],geo=s.geo;
    if(!K)return;
    var lo=geo?geo.holdY-5:197,hi=geo?geo.exitY+1:226,top=R.Y(hi),bottom=R.Y(lo),h=bottom-top;
    var fade=Math.min(1,(e.age||0)/.8),rgb=K.slice(0,3).join(','),alpha=K[3]*fade;
    c.save();var g=c.createLinearGradient(0,top,0,bottom);
    g.addColorStop(0,'rgba('+rgb+',0)');g.addColorStop(.15,'rgba('+rgb+','+alpha+')');
    g.addColorStop(.85,'rgba('+rgb+','+alpha+')');g.addColorStop(1,'rgba('+rgb+',0)');
    c.fillStyle=g;c.fillRect(R.X(geo?geo.xMin:-6),top,(geo?geo.xMax-geo.xMin:12)*u,h);c.restore();
  };
  B.ready=function(id){return!!(P.CFG.bossParts&&P.CFG.bossParts[id]&&P.StreetArt.image('boss-parts-'+id)&&(!P.CFG.bossTorsos||P.StreetArt.image('boss-torsos-reset')));};
  return B;
})();
