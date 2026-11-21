// View of Kaan's brief interception. The sweep radius and contact time come from the same action as the sim.
P.KaanSupportFx = (function () {
  var V = {}, K = P.CFG.bond.kaan.support;
  var sheet = new Image();
  sheet.src = new URL('../../assets/companions/kaan-assist.png', document.currentScript.src).href;
  var poses = [[22, 14, 136, 232], [161, 39, 174, 207], [355, 12, 135, 234]];

  function actor(c, x, y, u, facing, pose, phase) {
    if (!sheet.complete || !sheet.naturalWidth) return;
    var calm = pose >= 3, grieving = pose === 4;
    var frame = poses[calm ? 2 : pose], scale = 1.7 * u / poses[0][3];
    var w = frame[2] * scale, h = frame[3] * scale;
    c.save(); c.translate(x, y); c.scale(facing, 1);
    if (calm) {
      calmActor(c, frame, scale, grieving, phase);
    } else if (phase && P.BossFootwork) P.BossFootwork.stride(c, sheet, frame, frame[2] / 2, frame[3], [.70,.53], scale, phase);
    else c.drawImage(sheet, frame[0], frame[1], frame[2], frame[3], -w * .5, -h, w, h);
    c.restore();
  }

  function calmActor(c, f, k, grieving, phase) {
    var w = f[2], h = f[3];
    function part(x0, y0, width, height, px, py, rotation) {
      c.save(); c.translate((px-w*.5)*k,(py-h)*k); c.rotate(rotation);
      c.drawImage(sheet,f[0]+x0,f[1]+y0,width,height,(x0-px)*k,(y0-py)*k,width*k,height*k); c.restore();
    }
    // The neutral lower body is planted. The two arm pieces release their guard separately.
    if (phase && P.BossFootwork) {
      c.save(); c.beginPath(); c.rect(-w*.5*k,-h*.42*k,w*k,h*.42*k); c.clip();
      P.BossFootwork.stride(c,sheet,f,w*.5,h,[.70,.53],k,phase); c.restore();
    } else part(0,h*.58,w,h*.42,w*.5,h,0);
    part(0,h*.27,w*.34,h*.34,w*.31,h*.34,-.48);
    part(w*.71,h*.27,w*.29,h*.34,w*.73,h*.34,.63);
    part(w*.32,h*.25,w*.40,h*.37,w*.52,h*.58,grieving?.045:0);
    part(0,0,w,h*.28,w*.48,h*.25,grieving?.10:0);
  }
  V.actor = actor;
  V.draw = function (R, s) {
    if (s.companion) return;
    if (P.SceneFlow && P.SceneFlow.current() && P.SceneFlow.current().kind !== 'entry') return;
    var a = s.kaanSupport;
    if (!a) return;
    var age = s.t - a.start;
    var end = a.repaidAt === undefined ? a.repayUntil : a.repaidAt + K.repay.relief;
    var life = Math.max(K.duration, (end || a.start) - a.start);
    if (age < 0 || age >= life) return;
    var c = R.ctx, u = R.ppm, reduced = P.Settings && P.Settings.reduceMotion;
    var step = reduced ? 1 : Math.min(1, age / K.windup);
    var x = R.X(a.fromX + (a.x - a.fromX) * step), y = R.Y(a.fromY + (a.y - a.fromY) * step);
    c.save();
    c.globalAlpha = Math.min(1, (life - age) * 6);
    var pose = a.hit ? (age < K.windup + .23 ? 1 : 2) : 0;
    actor(c, x, y, u, a.facing, reduced && a.hit ? 2 : pose);
    c.fillStyle = '#BCEFFC'; c.strokeStyle = '#14151F'; c.lineWidth = 2.5; c.textAlign = 'center';
    c.font = '900 13px "CM Comic Relief", "Comic Relief", sans-serif';
    var name = P.t('spk.kaan');
    c.strokeText(name, x, y - 1.86 * u); c.fillText(name, x, y - 1.86 * u);
    if (a.hit && age < K.duration) {
      var p = Math.min(1, (age - K.windup) / (K.duration - K.windup));
      c.globalAlpha *= (1 - p) * .72;
      var r = (reduced ? K.radius : K.radius * (.25 + .75 * p)) * u;
      c.beginPath(); c.ellipse(x, y, r, r * .65, 0, 0, Math.PI * 2);
      c.strokeStyle = '#8DEBFF'; c.lineWidth = 3; c.stroke();
    }
    c.restore();
  };

  V.instruction = function (s) {
    var a = s.kaanSupport;
    if (s.mode !== 'play' || !a || Math.hypot(s.hero.x - a.x, s.hero.y - a.y) > K.radius) return null;
    if (a.repaidAt !== undefined && s.t - a.repaidAt < K.repay.relief) return 'ui.kaanCovered';
    return P.KaanSupport.canRepay(s) ? 'ui.kaanCover' : null;
  };

  function offerFollow(R, s) {
    if (!s || s.mode !== 'play' || !P.KaanSupport.canFollow(s)) return;
    var c = R.ctx, point = R.toScreen(s.hero.x, s.hero.y), label = P.t('ui.kaanDash');
    c.save();
    c.font = '700 14px "CM Comic Relief", sans-serif';
    var w = Math.ceil(c.measureText(label).width) + 24;
    c.restore();
    P.Speech.offer({
      id: 'kaan-dash', kind: 'invitation', prio: P.Speech.PRIO.invitation, ax: point.x, ay: point.y, w: Math.min(R.W - 20, w), h: 27,
      place: function (p) { V.follow = p ? { slot: p, label: label } : null; }
    });
  }

  V.screen = function (R) {
    var follow = V.follow;
    V.follow = null;
    if (!follow) return;
    var c = R.ctx, p = follow.slot;
    c.save();
    c.fillStyle = '#17252E'; c.beginPath(); c.roundRect(p.x, p.y, p.w, p.h, 8); c.fill();
    c.font = '700 14px "CM Comic Relief", sans-serif'; c.fillStyle = '#BCEFFC';
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(follow.label, p.x + p.w / 2, p.y + p.h / 2, p.w - 16);
    c.restore();
  };
  if (P.Speech) P.Speech.provider(offerFollow);
  return V;
})();
