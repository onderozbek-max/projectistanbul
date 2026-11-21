// Role-specific jointed motion uses current atlas pixels and actual movement/AI state.
P.EnemyActing = (function () {
  var E = {}, K = P.CFG.experience.roleGait;
  var profiles = {
    runner: [.64, .48, .21], walker: [.66, .76, .10], diner: [.65, .76, .10], brute: [.73,.58,.08],
    hardhat: [.66,.69,.12], spitter: [.67,.66,.08], zehirli: [.68,.62,.08], screamer: [.64,.72,.09],
    bloater: [.73,.56,.075], kasap: [.66,.64,.11], parkur: [.61,.90,.19], copci: [.70,.59,.08], cayci: [.66,.63,.09]
  };
  function crop(c, r, x0, y0, w, h, px, py, angle, dx, dy) {
    c.save(); c.translate(px + dx, py + dy); c.rotate(angle); c.translate(-px, -py);
    c.drawImage(r.img, r.sx + x0, r.sy + y0, w, h, x0, y0, w, h); c.restore();
  }
  E.draw = function (c, r, e, o, x, y, scale, facing) {
    if (!K[e.type] && !e.boss) return false;
    var phase = o.phase || 0, moving = !o.stopped && (e.state === 'active' || o.sceneEntry !== undefined);
    var mode = e.ai && e.ai.m, wind = Math.max(0, Math.min(1, e.windup || 0));
    if (e.type === 'marti' || e.type === 'kurye') return false;
    if (e.type === 'crawler') return crawl(c, r, x, y, scale, facing, phase, moving);
    var profile = profiles[e.type] || profiles.brute;
    if (moving && !wind && mode !== 'charge') {
      var gait = K[e.type] || K.brute;
      var rig = { contact: gait[0], stride: gait[1], lift: gait[2], waist: profile[0], split: .52, hip: [.39,profile[0] + .01,.64,profile[0] + .01],
        knee: [.34,.83,.68,.83], ankle: [.30,.95,.73,.95] };
      return P.ActorRig.draw(c, r, x, y, scale, facing, 'side', phase * profile[1], .60, null, null, rig);
    }
    if (wind > 0 || mode === 'windup') return prepare(c, r, e, x, y, scale, facing, wind);
    return false;
  };
  function prepare(c, r, e, x, y, scale, facing, q) {
    var w = r.sw, h = r.sh, role = e.bossPreset || e.type;
    var mouth = ['spitter','zehirli','screamer','bloater'].indexOf(role) >= 0;
    var lift = ['kasap','parkur','copci'].indexOf(role) >= 0 ? -.75 * q : mouth ? -.17 * q : -.34 * q;
    c.save(); c.translate(x, y); c.scale(scale * facing, scale); c.translate(-r.px, -r.py);
    // The supporting legs remain planted as shoulders load and the tool hand draws back.
    c.drawImage(r.img, r.sx, r.sy + h * .66, w, h * .34, 0, h * .66, w, h * .34);
    crop(c,r,0,0,w*.26,h*.67,w*.25,h*.36,-lift*.65,0,0);
    crop(c,r,w*.76,0,w*.24,h*.67,w*.77,h*.35,lift,0,0);
    crop(c,r,w*.25,0,w*.52,h*.67,w*.51,h*.65,(mouth ? .13 : -.12)*q,0,0);
    if (role === 'screamer') {
      c.strokeStyle = '#F5D2A2'; c.lineWidth = 1.5 / scale;
      c.beginPath(); c.arc(w * .6,h * .28,h * (.15 + .12 * q),-.65,.65); c.stroke();
    }
    c.restore(); return true;
  }
  function crawl(c, r, x, y, scale, facing, phase, moving) {
    var w=r.sw, h=r.sh, wave=moving ? Math.sin(phase*1.2) : 0;
    c.save(); c.translate(x,y); c.scale(scale*facing,scale); c.translate(-r.px,-r.py);
    crop(c,r,0,0,w*.62,h,w*.46,h*.70,wave*.035,wave*w*.015,0);
    crop(c,r,w*.61,0,w*.39,h,w*.66,h*.47,-wave*.13,wave*w*.025,-Math.max(0,wave)*h*.025);
    c.restore(); return true;
  }
  E.profile = function (id) { return profiles[id] || null; };
  return E;
})();
