// The illustrated attack is cut at the hips and ankles. The shoulder and hip
// shifts travel through the legs, while the shoes stay on the ground.
P.HeroBody = (function () {
  var B = {};
  var bands = [{}, {}, {}], point = {};
  var waist = { side: [110,105,108,105,108], front: [110,109,110,110,110], back: [106,108,107,107,107] };
  B.waist = function (view, frame) { return waist[view][frame]; };
  function band(i, from, to, y0, y1, x0, x1) {
    var b = bands[i];
    b.from = from; b.to = to; b.y = y0; b.height = y1 - y0;
    b.x = x0; b.shear = (x1 - x0) / (to - from);
  }
  B.bands = function (r, view, frame, pose) {
    var cut = waist[view][frame], foot = r.sh - 13;
    var dx = Math.cos(pose.aim), dir = view === 'side' ? Math.abs(dx) : dx;
    var hipX = pose.hip * dir * r.sh, shoulderX = hipX + pose.lean * (view === 'side' && dx < 0 ? -1 : 1) * r.sh * .45;
    var hipY = Math.min(foot - 20, cut + (pose.bend - pose.depth * .14) * r.sh * .53);
    var top = hipY - cut * (1 + pose.height * .26), footX = pose.plant * dx * r.sh * .035;
    if (view === 'side') footX = Math.abs(footX);
    band(0,0,cut,top,hipY,shoulderX,hipX);
    band(1,cut,foot,hipY,foot,hipX,footX);
    band(2,foot,r.sh,foot,r.sh,footX,footX);
    return bands;
  };
  B.point = function (x,y,parts) {
    var b = y < parts[0].to ? parts[0] : y < parts[1].to ? parts[1] : parts[2];
    point.x = x + b.x + (y - b.from) * b.shear;
    point.y = b.y + (y - b.from) * b.height / (b.to - b.from);
    return point;
  };
  return B;
})();
