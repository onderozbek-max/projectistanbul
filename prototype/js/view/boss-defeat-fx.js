// A brief three-beat boss defeat along the same world anchors as combat: last stand, signature break, collapse.
// Wall clock keeps the choreography legible during the existing camera slow-down. It does not change the damage outcome.
P.BossDefeatFx = (function () {
  var F = {}, active, TAU = Math.PI * 2, INK = '#231922', LENGTH = 1.47;
  function unit(t) { return Math.max(0, Math.min(1, t)); }
  function smooth(t) { t = unit(t); return t*t*(3-2*t); }
  function reduced() { return P.Settings && (P.Settings.reduceMotion || P.Settings.reduceFlash); }
  function duration(e){return P.CFG.bossPerformance&&P.CFG.bossPerformance[e.bossPreset]?P.CFG.bossPerformance[e.bossPreset].death:LENGTH;}
  F.reset = function () { active = null; };
  F.onEvent = function (ev, s) {
    if (ev.type !== 'bossDie' || !ev.body) return false;
    var hood = s.levelInfo && s.levelInfo.hood.id;
    active = { run: s, e: ev.body, p: P.BossDefeatProfiles(hood, ev.body.bossPreset), t: 0,
      face: (ev.body.deathPose&&ev.body.deathPose.facing || ev.body.kbx || s.hero.x - ev.x) >= 0 ? 1 : -1, heard: false };
    return true;
  };
  F.running = function (s) { return !!(active && active.run === s); };
  F.step = function (s, dt) {
    if (!F.running(s)) return;
    var a = active;
    a.t += dt;
    if (!a.heard && a.t >= a.p[8]) { a.heard = true; if (P.Sfx && a.e.bossPreset!=='quayCaptain') P.Sfx.play(a.p[1], 0); }
    if (a.t > duration(a.e)) active = null;
  };
  function body(R, a, turn, drop, still) {
    var e = a.e, p = a.p, u = R.ppm, c = R.ctx, V = P.CFG.view, def = P.ArtEnemies.defFor(e);
    var f = a.face, leap = Math.sin(Math.PI * turn), k = still ? .28 : 1;
    var anchored=e.bossPreset==='quayCaptain';
    var x = R.X(e.x) + (anchored?0:p[4] * f * u * turn * k), y = R.Y(e.y - e.r * .6) - (anchored?0:p[5] * leap * u * k);
    if(P.BossPuppet&&P.BossPuppet.ready(e.bossPreset)){
      P.BossPuppet.draw(c,e,{stopped:true,defeatProgress:unit(a.t/duration(e))},R.X(e.x),R.Y(e.y-e.r*.6),u,f);if(P.BossPropContinuity)P.BossPropContinuity.settle(R,e,unit(a.t/duration(e)));return;
    }
    var uf = u * def.scale * (V.spriteScale[e.type] || 1) * 2.2;
    c.save(); c.translate(x, y); c.rotate(anchored?0:f * (p[6] * drop - .17 * (1 - turn)) * k);
    if(!anchored)c.scale(1 + p[7] * drop * .30, 1 - p[7] * drop);
    c.globalAlpha *= a.rest ? .85 : anchored?1:1 - smooth((a.t - 1.08) / .39);
    var o = { stopped: true, noWhite: true, phase: 0, flash: 0, outline: null };
    if (!P.Sprites.bossBody(c, e, o, 0, 0, u, f) &&
        !(P.ArtRasterChars && P.ArtRasterChars.enemy(c, e, o, 0, 0, uf, f))) {
      c.translate(-R.X(e.x), -R.Y(e.y - e.r * .6));
      var view = Object.create(R); view.noGround = true; P.Sprites.enemy(view, e, a.run.hero);
    }
    c.restore();
  }
  F.rest = function (R, s, e) {
    var a = { run: s, e: e, p: P.BossDefeatProfiles(s.levelInfo.hood.id, e.bossPreset),
      t: duration(e), face: s.hero.x >= e.x ? 1 : -1, rest: true };
    body(R, a, 1, 1, reduced());
    if(P.EminonuBossFx)P.EminonuBossFx.settle(R,s,e,1);
  };
  var STYLE = {
    split:['slice',1,1.8], ember:['burst',10,.86], grid:['bolt',4,.87], cross:['slice',2,1.7], rails:['tracks',2,1.8],
    bell:['wave',3,1.55], ribbons:['ribbon',4,1.56], tide:['tide',3,2.08], crates:['chip',9,1.6], tickets:['ticket',15,1.9],
    curtain:['ribbon',2,1.92], pages:['paper',14,1.95], net:['lattice',8,1.2], tiles:['tile',12,1.6], vases:['glass',13,1.72],
    wheels:['wheel',2,1.9], clatter:['plate',5,1.63], rampart:['tracks',3,1.19], wind:['tide',2,2.05],
    forge:['burst',18,1.78], awning:['ribbon',3,1.46], buoys:['plate',4,2.0], mooring:['lattice',5,1.65], paving:['tile',8,1.43]
  };
  function gesture(c, style, n, d, u, p) {
    var x, y, j;
    c.beginPath();
    for (j = 0; j < n; j++) {
      x = (j - (n - 1) / 2) * u * .30;
      y = (j - (n - 1) / 2) * u * .17;
      if (style === 'wave') c.ellipse(0, 2*y, d * (1 - .15*j), d * (.62 - .1*j), 0, 0, TAU);
      else if (style === 'slice') { c.moveTo(-d, .67*d + y); c.quadraticCurveTo(-.12*d, -d*.12, d, -.89*d + y); }
      else if (style === 'tracks') { c.moveTo(x - .57*d, .84*d); c.lineTo(x + .53*d, -.95*d); }
      else if (style === 'lattice') {
        c.moveTo(x*.94, .48*d); c.quadraticCurveTo(-x, 0, -x, -.78*d);
        c.moveTo(-d*.65, y); c.quadraticCurveTo(0, y*.54, d*.65, y);
      }
      else if (style === 'tide') {
        c.moveTo(-d, .39*d + y);
        c.bezierCurveTo(-d*.45, .69*d+y, d*.58, -.90*d+y, d*.75, -.44*d+y);
        c.quadraticCurveTo(d*.89, -.09*d+y, d*.39, -.20*d+y);
      }
      else if (style === 'ribbon') {
        c.moveTo(-d, y * 2 + .45*d);
        c.bezierCurveTo(-.86*d, y - .99*d, .87*d, y - .63*d, d, y + .34*d);
      }
      else if (style === 'bolt') { c.moveTo(x*.6, .36*d); c.lineTo(x*1.9, -.05*d); c.lineTo(x*.85, -.4*d); c.lineTo(x*2.45, -.84*d); }
      else {
        c.moveTo(-d, y + .34*d);
        c.bezierCurveTo(-.34*d, y - .82*d, .57*d, y + .40*d*Math.sin(p*2.5), d, y - .33*d);
      }
    }
    c.stroke();
  }
  function fragments(c, style, n, d, u, p, tint) {
    for (var j = 0; j < n; j++) {
      var a = j * 2.399 + n * .17, fly = d * (.51 + (j % 7) * .075), w = u * (.09 + (j % 4) * .06);
      if (n <= 5) w *= 2.4;
      c.save(); c.translate(Math.cos(a)*fly, Math.sin(a)*fly*.68 - Math.sin(p*Math.PI)*u*.84); c.rotate(a+p*3);
      c.fillStyle = j % 2 ? tint[3] : tint[2]; c.strokeStyle = INK; c.lineWidth = 1.25; c.beginPath();
      if (style === 'plate' || style === 'wheel' || style === 'burst') c.ellipse(0, 0, w, w*.55, 0, 0, TAU);
      else if (style === 'glass') { c.moveTo(-w,-w*.43); c.lineTo(0,w); c.lineTo(w,-w); c.closePath(); }
      else c.roundRect(-w*.79,-w*.49,w*1.58,w*.98,style==='tile'?1:2);
      c.fill(); c.stroke();
      if (style === 'ticket' || style === 'paper') { c.beginPath(); c.moveTo(-w*.56,0); c.lineTo(w*.53,0); c.stroke(); }
      c.restore();
    }
  }
  function effect(R, a, p, still) {
    var c = R.ctx, u = R.ppm, spec = STYLE[a.p[0]], d = spec[2] * u * (.28 + .72 * smooth(p * 1.42));
    c.save(); c.translate(R.X(a.e.x), R.Y(a.e.y) - .36 * u); c.scale(a.face, 1);
    c.globalAlpha *= (1-p) * (still ? .63 : .96);
    c.lineWidth = (1.4 + (1-p)*4) * (still ? .7 : 1); c.strokeStyle = a.p[3]; c.lineCap = 'round';
    if (['wave','slice','tracks','lattice','bolt','tide','ribbon'].indexOf(spec[0]) >= 0) gesture(c, spec[0], spec[1], d, u, p);
    else fragments(c, spec[0], spec[1], d, u, p, a.p);
    c.restore();
  }
  function focus(R, a) {
    var c = R.ctx, X = R.X(a.e.x), Y = R.Y(a.e.y) - .8 * R.ppm;
    var power = smooth(a.t / .23) * (1 - smooth((a.t - 1.07) / .4));
    var wash = c.createRadialGradient(X, Y, R.ppm * 2.0, X, Y, R.ppm * 6.8);
    wash.addColorStop(0, 'rgba(19,16,26,.08)'); wash.addColorStop(1, 'rgba(19,16,26,.38)');
    c.save(); c.globalAlpha *= power; c.fillStyle = wash;
    c.fillRect(-R.W, -R.H, R.W * 2, R.H * 2); c.restore();
  }
  F.air = function (R, s) {
    if (!F.running(s)) return;
    var a = active, still = reduced(), m = a.p[8], p = unit((a.t - m) / (LENGTH - m));
    if (!still) focus(R, a);
    body(R, a, smooth((a.t - m * .67) / .56), smooth((a.t - m) / .63), still);
    if(P.EminonuBossFx)P.EminonuBossFx.settle(R,s,a.e,p);
    if (a.t >= m && !(P.BossPuppet&&P.BossPuppet.ready(a.e.bossPreset))) effect(R, a, p, still);
  };
  return F;
})();
