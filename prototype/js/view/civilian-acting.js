// Fleeing crowds use six illustrated identities and authored strides. The named restaurant actor stays separate.
P.CivilianActing = (function () {
  var C = {}, looks = new WeakMap(), motion = new WeakMap(), residentRows = {};
  C.height = function (unit) { return unit*P.CFG.experience.civilians.metres; };
  C.moving = function (actor,clock) {
    var now=clock===undefined?performance.now()/1000:clock,previous=motion.get(actor);
    if(!previous){motion.set(actor,{x:actor.x,y:actor.y,at:now,moving:!!actor.walk});return !!actor.walk;}
    if(previous.at===now)return previous.moving;
    previous.moving=Math.hypot(actor.x-previous.x,actor.y-previous.y)>.0001;
    previous.x=actor.x;previous.y=actor.y;previous.at=now;return previous.moving;
  };
  C.resetResidents = function () { residentRows = {}; };
  // Heights refer to painted crown/sole landmarks, never a legacy rig unit or
  // pose bounding box. A customer's identity survives conversion and death.
  C.restaurant = function (c,x,y,unit,facing,row,column) {
    var image=P.StreetArt&&P.StreetArt.image('restaurant-cast'),K=P.CFG.experience.openingCast;
    if(!image)return true;
    var k=C.height(unit)/K.height;
    c.save();c.translate(x,y);c.scale(facing,1);
    c.drawImage(image,column*K.cell,row*K.cell,K.cell,K.cell,-K.pivotX*k,-K.pivotY*k,K.cell*k,K.cell*k);
    c.restore();return true;
  };
  C.diner = function (c,e,o,x,y,unit,facing) {
    if(e.type!=='diner'||e.dinerIndex===undefined)return false;
    var row=e.dinerIndex===0?0:1,human=e.state==='dormant'||e.state==='turning';
    residentRows[e.id]=row;
    var moving=e.sceneMoving===undefined?!o.stopped:e.sceneMoving;
    var column=human?(e.state==='turning'?1:0):!moving?2:3+(Math.floor((e.walk||0)*5.5/Math.PI)%2);
    return C.restaurant(c,x,y,unit,facing,row,column);
  };
  C.restaurantCorpse = function(c,p,fall,facing,x,y,unit) {
    var row=residentRows[p.id];
    if(p.etype!=='diner'||row===undefined)return false;
    var a=Math.max(0,Math.min(1,(fall-.4)/.4)),elapsed=p.T-p.t;
    if(p.fling){
      c.save();c.translate(x+(p.dx||0)*elapsed*.25*unit,y-Math.max(0,6*elapsed-10*elapsed*elapsed)*unit);
      c.rotate(facing*elapsed*9);C.restaurant(c,0,0,unit,facing,row,5);c.restore();return true;
    }
    if(a<1){c.save();c.translate(x+facing*fall*.25*unit,y);c.rotate(facing*fall*Math.PI*.475);
      c.globalAlpha*=1-a;C.restaurant(c,0,0,unit,facing,row,2);c.restore();}
    if(a>0){c.save();c.globalAlpha*=a;C.restaurant(c,x,y,unit,facing,row,5);c.restore();}
    return true;
  };
  function separation(a, b) {
    var K = P.CFG.experience.civilians, closest = Infinity;
    for (var t = 0; t <= K.lookAhead; t += K.lookStep) {
      if (t >= (a.life || K.lookAhead) || t >= (b.life || K.lookAhead)) break;
      var ta = Math.max(0, t - (a.delay || 0)), tb = Math.max(0, t - (b.delay || 0));
      var ay = a.y - (a.sp || 0) * ta, by = b.y - (b.sp || 0) * tb;
      if (ay < -.5 || by < -.5) break;
      var ax = Math.max(-K.laneEdge, Math.min(K.laneEdge, a.x + (a.drift || 0) * ta));
      var bx = Math.max(-K.laneEdge, Math.min(K.laneEdge, b.x + (b.drift || 0) * tb));
      closest = Math.min(closest, (ax-bx)*(ax-bx) + (ay-by)*(ay-by));
    }
    return closest;
  }
  C.look = function (actor) { return looks.has(actor) ? looks.get(actor) : C.frame(actor.variant, 0).row; };
  // Pick once per person, considering nearby runners and their approach. Identity never changes mid-run.
  C.prepare = function (actors) {
    var K = P.CFG.experience.civilians;
    actors.forEach(function (actor) {
      if (looks.has(actor)) return;
      var wanted = C.frame(actor.variant, 0).row, best = wanted, bestDistance = -1;
      for (var i = 0; i < K.rows; i++) {
        var candidate = (wanted + i) % K.rows, nearest = Infinity;
        actors.forEach(function (other) {
          if (other !== actor && looks.has(other) && looks.get(other) === candidate) nearest = Math.min(nearest, separation(actor, other));
        });
        if (nearest > bestDistance) { best = candidate; bestDistance = nearest; }
      }
      looks.set(actor, best);
    });
  };
  C.draw = function (c, x, y, height, facing, phase, moving, tense, variant) {
    if (moving) return C.flee(c, x, y, height, facing, phase, variant);
    var image = P.StreetArt && P.StreetArt.image('civilian-idle');
    if (!image) return true; // Current-art loading never revives a retired human drawing.
    var K=P.CFG.experience.civilians,row=C.frame(variant,0).row,k=height/K.height;
    c.save(); c.translate(x,y); c.scale(facing,1);
    c.drawImage(image,tense?K.cell:0,row*K.cell,K.cell,K.cell,-K.pivotX*k,-K.pivotY*k,K.cell*k,K.cell*k);
    c.restore(); return true;
  };
  C.frame = function (variant, phase) {
    var K = P.CFG.experience.civilians, cycle = (phase / (Math.PI * 2) % 1 + 1) % 1;
    return { row: ((variant | 0) % K.rows + K.rows) % K.rows, column: Math.floor(cycle * K.frames) };
  };
  C.flee = function (c, x, y, height, facing, phase, variant) {
    var image = P.StreetArt && P.StreetArt.image('civilian-runners');
    if (!image) return true;
    var K = P.CFG.experience.civilians, frame = C.frame(variant, phase), k = height / K.height;
    c.save(); c.translate(x, y); c.scale(facing, 1);
    c.drawImage(image, frame.column * K.cell, frame.row * K.cell, K.cell, K.cell,
      -K.pivotX * k, -K.pivotY * k, K.cell * k, K.cell * k);
    c.restore(); return true;
  };
  return C;
})();
