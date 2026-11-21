// Event deltas retain damage and healing separately; the authoritative HP always owns the fill.
P.HealthFeedback = (function () {
  var H = {}, K = P.CFG.experience.health, run, hp = 0, max = 1, trail = 0, wait = 0, hurt = 0, healed = 0;
  var restore = { from: 0, to: 0, t: 0 }, critical = false, shield = 0, direction, strength=0;
  H.reset = function (s) {
    run = s; hp = s.hero.hp; max = s.hero.maxHp; trail = hp; wait = hurt = healed = shield = 0;
    restore.t = 0; direction = null; critical = false;
  };
  H.event = function (ev, s) {
    if (run !== s) H.reset(s);
    if (ev.type === 'heroHit' && ev.dmg > 0) {
      trail = Math.max(trail, Math.min(max, ev.beforeHp === undefined ? ev.hp + ev.dmg : ev.beforeHp)); wait = K.trailHold; hurt = K.hitT;
      direction = ev.from && Math.hypot(ev.from.x - s.hero.x, ev.from.y - s.hero.y) > .05 ?
        Math.atan2(ev.from.y - s.hero.y, ev.from.x - s.hero.x) : null;
      strength=Math.min(1,ev.dmg/s.hero.maxHp/.18);
    }
    var gain = ev.type === 'pickup' ? ev.healed : ev.type === 'healPulse' ? ev.amount : 0;
    if (gain > 0) {
      var at = ev.hp === undefined ? s.hero.hp : ev.hp;
      restore.from = Math.max(0, at - gain); restore.to = at; restore.t = K.healT; healed = K.healT;
      restore.source=Number.isFinite(ev.x)&&Number.isFinite(ev.y)?{x:ev.x,y:ev.y}:null;
    }
    if (ev.type === 'shieldBlock') shield = K.hitT;
  };
  H.update = function (s, dt) {
    if (run !== s) H.reset(s);
    max = s.hero.maxHp; hp = s.hero.hp;
    wait = Math.max(0, wait - dt);
    if (!wait) trail = Math.max(hp, trail - max * dt / K.trailT);
    trail = Math.max(trail, hp);
    hurt = Math.max(0, hurt - dt); healed = Math.max(0, healed - dt); shield = Math.max(0, shield - dt);
    restore.t = Math.max(0, restore.t - dt);
    if (hp / max <= K.critical) critical = true;
    if (hp / max >= K.recovered) critical = false;
  };
  H.state = function () {
    return { hp: hp, max: max, trail: trail, hurt: hurt, heal: healed, shield: shield, critical: critical,
      direction: direction, restored: restore };
  };
  H.hud = function (fill, lag) {
    if (!fill || !lag) return;
    fill.style.width = Math.max(0, hp / max * 100) + '%';
    lag.style.transition = 'none'; lag.style.width = Math.min(100, trail / max * 100) + '%';
    var bar = fill.parentNode;
    bar.classList.toggle('hp-critical', critical);
    var restored = bar.querySelector('.hp-restored');
    if (!restored) { restored = document.createElement('i'); restored.className = 'hp-restored'; bar.appendChild(restored); }
    restored.style.left = (restore.from / max * 100) + '%';
    restored.style.width = (Math.max(0, Math.min(hp, restore.to) - restore.from) / max * 100) + '%';
    restored.style.opacity = restore.t > 0 ? '1' : '0';
  };
  H.draw = function (R, s) {
    if (run !== s) return;
    var c = R.ctx, x = R.X(s.hero.x), y = R.Y(s.hero.y), u = R.ppm;
    c.save();
    if (hurt > 0) {
      c.strokeStyle = '#FFE5D6'; c.lineWidth = 3+strength*2; c.globalAlpha = Math.min(1,hurt/K.hitT*1.8);
      c.beginPath();
      if (direction === null) c.ellipse(x, y + .04 * u, .64 * u, .25 * u, 0, 0, Math.PI * 2);
      else { var a = Math.atan2(R.Y(s.hero.y+Math.sin(direction))-y,R.X(s.hero.x+Math.cos(direction))-x); c.arc(x, y - .45 * u, .82 * u, a - .63, a + .63); }
      c.save();c.strokeStyle='#511f32';c.lineWidth+=4;c.stroke();c.restore();c.stroke();
    }
    if (healed > 0) heal(c,x,y,u,R);
    if (shield > 0) block(c,x,y,u);
    if (critical) criticalBody(c,x,y,u);
    c.restore();
  };
  function heal(c,x,y,u,R) {
    var q=1-healed/K.healT, still=P.Settings && P.Settings.reduceMotion;
    c.globalAlpha=(1-q)*.9; c.strokeStyle='#CBFFE3'; c.lineWidth=2.6;
    for (var i=0;i<3;i++) {
      var spread=(still?.34:.85*(1-q)) * u, py=y-(.18+i*.24+(still?0:q*.55))*u;
      c.beginPath(); c.moveTo(x-spread,py+.12*u); c.quadraticCurveTo(x,py-.12*u,x+spread,py+.12*u); c.stroke();
    }
    c.fillStyle='#D4FFDF'; c.fillRect(x-.05*u,y-.90*u,.10*u,.34*u);
    c.fillRect(x-.17*u,y-.78*u,.34*u,.10*u);
    if(restore.source){var sx=R.X(restore.source.x),sy=R.Y(restore.source.y);
      var at=1-Math.pow(1-q,2),px=sx+(x-sx)*at,py=sy+(y-.64*u-sy)*at-Math.sin(Math.PI*at)*u*.28;
      c.strokeStyle='#163d38';c.lineWidth=5;c.beginPath();c.arc(px,py,.085*u,0,Math.PI*2);c.stroke();
      c.fillStyle='#E2FFF2';c.fill();}
  }
  function criticalBody(c,x,y,u){
    c.globalAlpha=.96;c.beginPath();
    [-1,1].forEach(function(side){var px=x+side*.50*u;
      c.moveTo(px-side*.12*u,y-1.28*u);c.lineTo(px,y-1.16*u);c.lineTo(px,y-.30*u);c.lineTo(px-side*.12*u,y-.17*u);
      c.moveTo(px,y-.76*u);c.lineTo(px+side*.10*u,y-.64*u);c.lineTo(px,y-.53*u);
    });
    c.strokeStyle='#391a2b';c.lineWidth=6;c.stroke();c.strokeStyle='#FFD7CE';c.lineWidth=2.4;c.stroke();
  }
  function block(c,x,y,u) {
    c.globalAlpha=shield/K.hitT; c.strokeStyle='#91DFFF'; c.lineWidth=3;
    c.beginPath(); c.moveTo(x-.48*u,y-.76*u); c.lineTo(x,y-.95*u); c.lineTo(x+.48*u,y-.76*u);
    c.lineTo(x+.38*u,y-.24*u); c.lineTo(x,y+.04*u); c.lineTo(x-.38*u,y-.24*u); c.closePath(); c.stroke();
  }
  return H;
})();
