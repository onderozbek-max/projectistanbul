// The Cook's artwork shares one foot anchor and unit scale across all eight poses.
P.CookFx = (function () {
  var F = {}, flights=new WeakMap(), released={};
  F.reset=function(){flights=new WeakMap();released={};};
  F.toolPose=function(id){return released[id];};
  F.rememberTool=function(id,x,y,a){released[id]={x:x,y:y,a:a};};
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function reduced() { return !!(P.Settings && P.Settings.reduceMotion); }

  F.camera = function (s, e) {
    var h = s.hero, d = Math.hypot(e.x - h.x, e.y - h.y);
    var close = clamp((7 - d) / 4), enter = clamp(e.age / .85);
    return { x: h.x * .65 + e.x * .35, y: h.y * .65 + e.y * .35 + .65,
      zoom: .16, weight: close * enter };
  };

  function pose(e, stopped) {
    var a = e.ai, hit = a.cookContact, age = hit && e.age - hit.age;
    if (a.m === 'defeat') return 7;
    if (hit && age < .24 && hit.move === 'combo') return 5;
    if (a.m === 'windup') {
      if (a.act === 'throw' && a.cookToss && a.cookToss.released) return 6;
      if(a.act==='throw'&&e.windup<.15)return 0;
      return e.windup < .23 ? 3 : 4;
    }
    if (e.exposed || a.m === 'pause' && a.act === 'throw') return 7;
    if (a.m === 'recover') return 3;
    if (stopped || Math.hypot(e.vx || 0, e.vy || 0) < .13) return 0;
    return Math.floor((e.walk || 0) * 5.6) % 2 ? 2 : 1;
  }

  function facing(e, f) {
    var a = e.ai, x = a.m === 'walk' ? e.vx : a.dir && a.dir.x;
    return Math.abs(x || 0) > .12 ? Math.sign(x) : f;
  }

  F.bossBody = function (c, e, o, x, y, u, f) {
    if (e.bossPreset !== 'cook' || !P.StreetArt) return false;
    var img = P.StreetArt.image('cook-poses');
    if (!img) return false;
    var i = o.sceneEntry !== undefined ? o.sceneEntry < .72 ? 1 : 3 : pose(e, o.stopped), k = u * 2.25 / 250, dir = facing(e, f), a = e.ai;
    var lean = i === 4 ? -.10 * (e.windup || 0) : i === 5 ? .15 * (1 - clamp((e.age - a.cookContact.age) / .24)) : 0;
    if (i === 1 || i === 2) lean = (a.m === 'cookStep' ? .12 : .035) + .026 * Math.sin((e.walk || 0) * 18);
    c.save(); c.translate(x, y); c.scale(dir, 1);
    if ((i === 1 || i === 2) && P.ActorRig) {
      // The illustrated opposing steps carry the whole body and cleaver together.
      c.drawImage(img, i*320, 0, 320, 320, -160*k, -308*k, 320*k, 320*k);
    } else P.BossJoints.draw(c,img,[i%4*320,Math.floor(i/4)*320,320,320],[160,308],k,
      { roll: reduced()?lean*.3:lean, load: i===4?e.windup || 0:i===7?.5:0 });
    c.restore();
    return true;
  };

  F.ground = function (R, e) {
    var hit = e.ai.cookContact, age = hit && e.age - hit.age;
    if (!hit || age > .28) return;
    var c = R.ctx, u = R.ppm, a = e.ai.dir, r = hit.r * u, throwHit = hit.move === 'throw';
    c.save(); c.translate(R.X(hit.x), R.Y(hit.y)); c.globalAlpha *= 1 - age / .28;
    c.rotate(Math.atan2(-a.y, a.x));
    c.beginPath();
    if (throwHit) c.ellipse(0, 0, r * .72, r * .42, 0, 0, Math.PI * 2);
    else c.ellipse(-.32 * r, 0, r, r * .76, 0, -1.34, 1.34);
    c.lineWidth = u * .15; c.strokeStyle = '#512A29'; c.stroke();
    c.lineWidth = u * .085; c.strokeStyle = '#FFBA69'; c.stroke();
    c.lineWidth = u * .025; c.strokeStyle = '#FFF1C6'; c.stroke();
    c.restore();
  };

  F.blade = function (R, b, f,s) {
    if(P.BossPuppet&&P.BossPuppet.ready('cook')){
      var start=flights.get(b),e=s&&(s.dir.trialBoss||s.gen&&s.gen.boss),hand=e&&P.BossPuppet.contact(e),u=R.ppm;
      if(!start){start=hand?{x:b.x0+(hand.x-R.X(b.x0))/u,y:b.y0-(hand.y-R.Y(b.y0))/u}:{x:b.x0,y:b.y0+1.2};flights.set(b,start);}
      var x=start.x+(b.x1-start.x)*f,y=start.y+(b.y1-start.y)*f+Math.sin(Math.PI*f)*.70;
      F.rememberTool(b.owner,x,y,f*Math.PI*1.5);P.BossPuppet.tool(R.ctx,'cook',R.X(x),R.Y(y),u,f*Math.PI*1.5);return;
    }
    var c = R.ctx, u = R.ppm, dx = b.x1 - b.x0, dy = b.y1 - b.y0, sign = dx < 0 ? -1 : 1;
    var X = R.X(b.x0 + dx * f) + sign * u * .83 * (1 - f);
    var Y = R.Y(b.y0 + dy * f) - u * ((1 - f) * 1.28 + Math.sin(Math.PI * f) * .88);
    c.save(); c.translate(X, Y); c.rotate(reduced() ? 0 : sign * f * Math.PI * 1.5);
    c.scale(sign * u, u); c.lineWidth = .045; c.strokeStyle = '#25232C'; c.lineJoin = 'round';
    c.fillStyle = '#6E4230'; c.fillRect(-.39, -.04, .32, .11); c.strokeRect(-.39, -.04, .32, .11);
    c.beginPath(); c.moveTo(-.12, -.05); c.lineTo(-.10, -.28); c.lineTo(.34, -.23); c.lineTo(.30, .15);
    c.lineTo(.01, .14); c.closePath(); c.fillStyle = '#D1D0C4'; c.fill(); c.stroke();
    c.beginPath(); c.moveTo(.31, -.18); c.lineTo(.26, .11); c.lineTo(.02, .10); c.strokeStyle = '#FFF5DE'; c.stroke();
    c.restore();
  };
  return F;
})();
