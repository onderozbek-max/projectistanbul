// Jointed pieces retain the approved source pixels. Each leg has its own hip, knee, ankle and planted shoe.
P.ActorRig = (function () {
  var A = {}, K = P.CFG.experience.gait, TAU = Math.PI * 2;
  function point(x, y) { return { x: x, y: y }; }
  function joint(points, offset, w, h) { return point(points[offset] * w, points[offset + 1] * h); }
  function knee(hip, ankle, upper, lower, bend) {
    var dx = ankle.x - hip.x, dy = ankle.y - hip.y, d = Math.hypot(dx, dy) || 1;
    var reach = Math.min(d, upper + lower - .01), along = (upper * upper - lower * lower + reach * reach) / (2 * reach);
    var side = Math.sqrt(Math.max(0, upper * upper - along * along)) * bend;
    return point(hip.x + dx / d * along + dy / d * side, hip.y + dy / d * along - dx / d * side);
  }
  function rotate(c, from, to, at) {
    c.translate(at.x, at.y);
    c.rotate(Math.atan2(to.y, to.x) - Math.atan2(from.y, from.x));
  }
  function piece(c, r, poly, source, target, sourceEnd, targetEnd) {
    c.save();
    rotate(c, point(sourceEnd.x - source.x, sourceEnd.y - source.y), point(targetEnd.x - target.x, targetEnd.y - target.y), target);
    c.translate(-source.x, -source.y);
    c.beginPath(); c.moveTo(poly[0][0], poly[0][1]);
    for (var i = 1; i < poly.length; i++) c.lineTo(poly[i][0], poly[i][1]);
    c.closePath(); c.clip();
    c.drawImage(r.img, r.sx, r.sy, r.sw, r.sh, 0, 0, r.sw, r.sh);
    c.restore();
  }
  function leg(c, r, rig, i, phase, stride, lift, hipShift, front) {
    var w = r.sw, h = r.sh, split = w * rig.split, left = i === 0;
    var x0 = left ? w * .19 : split - 1, x1 = left ? split + 1 : w * .84;
    var hp = joint(rig.hip, i * 2, w, h), kn = joint(rig.knee, i * 2, w, h), an = joint(rig.ankle, i * 2, w, h);
    var contact = rig.contact || K.contact, cycle = (phase / TAU + i * .5) % 1, stance = cycle < contact;
    var t = stance ? cycle / contact : (cycle - contact) / (1 - contact);
    var travel = stance ? 1 - 2 * t : -Math.cos(Math.PI * t);
    var raised = stance ? 0 : Math.sin(Math.PI * t) * lift * h;
    var end = point(an.x + travel * stride * h * (front ? .23 : 1), an.y - raised + (front ? travel * h * .022 : 0));
    var start = point(hp.x + hipShift.x, hp.y + hipShift.y);
    var bend = front ? (left ? -1 : 1) : 1;
    var mid = knee(start, end, Math.hypot(kn.x - hp.x, kn.y - hp.y), Math.hypot(an.x - kn.x, an.y - kn.y), bend);
    var y0 = rig.waist * h - 2, y1 = kn.y + h * .035, foot = an.y - h * .025;
    piece(c, r, [[x0,y0],[x1,y0],[x1,y1],[x0,y1]], hp, start, kn, mid);
    piece(c, r, [[x0,kn.y - h * .03],[x1,kn.y - h * .03],[x1,foot + 2],[x0,foot + 2]], kn, mid, an, end);
    x0 = left ? w * .08 : split - 1; x1 = left ? split + 1 : w * .97;
    c.save(); c.translate(end.x - an.x, end.y - an.y);
    c.drawImage(r.img, r.sx + x0, r.sy + foot, x1 - x0, h - foot, x0, foot, x1 - x0, h - foot);
    c.restore();
  }
  function arm(c, r, sourceHand, target, side, hip, chest, waist, centerX) {
    var w = r.sw, h = r.sh, shoulder = point(w * (side ? .73 : .27), h * .43);
    var hand = point(sourceHand[0], sourceHand[1]);
    var elbow = point((shoulder.x + hand.x) * .5 + (side ? 1 : -1) * w * .05, (shoulder.y + hand.y) * .52);
    var dx = shoulder.x - centerX, dy = shoulder.y - waist;
    var start = point(centerX + hip.x + dx * Math.cos(chest) - dy * Math.sin(chest),
      waist + hip.y + dx * Math.sin(chest) + dy * Math.cos(chest));
    var upper = Math.hypot(elbow.x - shoulder.x, elbow.y - shoulder.y), lower = Math.hypot(hand.x - elbow.x, hand.y - elbow.y);
    var distance = Math.hypot(target.x - start.x, target.y - start.y), reach = Math.min(1, (upper + lower - .2) / Math.max(1, distance));
    var end = point(start.x + (target.x - start.x) * reach, start.y + (target.y - start.y) * reach);
    var middle = knee(start, end, upper, lower, side ? -1 : 1), wide = w * .13;
    function strip(from, to, start, end) {
      var length = Math.hypot(to.x - from.x, to.y - from.y), nx = -(to.y - from.y) / length * wide, ny = (to.x - from.x) / length * wide;
      var extra = point(to.x + (to.x - from.x) / length * wide, to.y + (to.y - from.y) / length * wide);
      piece(c, r, [[from.x+nx,from.y+ny],[extra.x+nx,extra.y+ny],[extra.x-nx,extra.y-ny],[from.x-nx,from.y-ny]], from, start, to, end);
    }
    strip(shoulder, elbow, start, middle); strip(elbow, hand, middle, end);
    return end;
  }
  // The hero's painted stride already contains correct knees and crossed depth.
  // Keep that entire lower silhouette intact; weight shifts shear from the hip to a fixed sole.
  function authoredLegs(c, r, lower, hip) {
    var f = lower.rect, height = r.py - lower.upperCut - hip.y;
    var scaleY = height / (f.py - lower.cut);
    c.save(); c.translate(lower.upperHip + hip.x, lower.upperCut + hip.y);
    c.transform(1, 0, -hip.x / height, 1, 0, 0);
    c.drawImage(f.img, f.sx, f.sy + lower.cut, f.sw, f.sh - lower.cut,
      -lower.hip, 0, f.sw, (f.sh - lower.cut) * scaleY);
    c.restore();
  }
  A.draw = function (c, r, x, y, scale, facing, view, phase, intensity, settings, attack, customRig) {
    var rig = customRig || P.CFG.experience.heroRig[view], front = view !== 'side';
    if (!rig || !r || !r.img) return false;
    var gain = Math.max(0, Math.min(1, intensity)), stride = (rig.stride || K.stride) * gain;
    var hip = point(Math.sin(phase) * r.sh * .010 * gain, (1 + Math.abs(Math.sin(phase))) * r.sh * K.hip * gain);
    if (attack) { hip.x += (attack.hip || 0) * r.sh * .35; hip.y += (attack.bend || 0) * r.sh * .12; }
    var chest = -Math.sin(phase) * K.chest * gain + (attack ? (attack.lean || 0) * .23 : 0);
    if (settings && settings.dash) { hip.x += r.sh * .035; hip.y += r.sh * .025; chest += .15; }
    if (settings) chest += (settings.turn || 0) + (settings.start || 0) * .07 - (settings.recoil || 0) * .09 + (settings.injury || 0) * .19;
    c.save(); c.translate(x, y); c.scale(scale * facing, scale); c.translate(-r.px, -r.py);
    var lower = settings && settings.lowerBody;
    if (lower) authoredLegs(c, r, lower, hip);
    else {
      leg(c, r, rig, 1, phase, stride, (rig.lift || K.lift) * gain, hip, front);
      leg(c, r, rig, 0, phase, stride, (rig.lift || K.lift) * gain, hip, front);
    }
    var waist = lower ? lower.upperCut : r.sh * rig.waist + 2;
    var center = point(lower ? lower.upperHip : r.sw * .5, waist);
    var targets = settings && settings.workTargets, resolved = {};
    if (targets) {
      ['left','right'].forEach(function (name, i) {
        if (targets[name]) resolved[name] = arm(c, r, settings.handPoints[i], targets[name], i, hip, chest, waist, center.x);
      });
    }
    c.save(); c.translate(hip.x + center.x, hip.y + center.y); c.rotate(chest); c.translate(-center.x, -center.y);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(r.sw, 0); c.lineTo(r.sw, waist + r.sh * .12);
    c.lineTo(r.sw * .83, waist + r.sh * .12); c.lineTo(r.sw * .83, waist);
    c.lineTo(r.sw * .19, waist); c.lineTo(r.sw * .19, waist + r.sh * .12); c.lineTo(0, waist + r.sh * .12);
    c.closePath(); c.clip();
    if (targets) {
      c.beginPath(); c.rect(0, 0, r.sw, r.sh);
      if (targets.left) c.rect(0, r.sh * .42, r.sw * .28, waist - r.sh * .42 + r.sh * .12);
      if (targets.right) c.rect(r.sw * .72, r.sh * .42, r.sw * .28, waist - r.sh * .42 + r.sh * .12);
    }
    if (targets) c.clip('evenodd');
    c.drawImage(r.img, r.sx, r.sy, r.sw, r.sh, 0, 0, r.sw, r.sh);
    c.restore(); c.restore();
    A.pose = { hip: hip, chest: chest, waist: waist, centerX: center.x, width: r.sw, height: r.sh, phase: phase, targets: resolved };
    return true;
  };
  A.hand = function (x, y) {
    var p = A.pose;
    if (p.targets && Object.keys(p.targets).length) {
      var key = x < p.width * .5 ? 'left' : 'right';
      if (p.targets[key]) return p.targets[key];
    }
    var dx = x - p.centerX, dy = y - p.waist, co = Math.cos(p.chest), si = Math.sin(p.chest);
    return point(p.centerX + p.hip.x + dx * co - dy * si, p.waist + p.hip.y + dx * si + dy * co);
  };
  A.solveKnee = knee;
  return A;
})();
