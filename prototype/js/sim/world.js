// Level 1 geometry, walkable area and props (LD 6, level-001-map.svg). Units: meters, +y toward Tünel.
// Generated levels (2..100) use s.geo (levels.js): corridor, AABB blocks and the exit gate (props.shutterOpen).
P.World = {};

P.World.createProps = function () {
  var L = P.CFG.level, pc = P.CFG.props;
  return {
    carts: [
      { kind: 'simit', x: L.simitCart.x, y: L.simitCart.y, r: pc.cartRadius, hp: pc.cartHp, alive: true, flash: 0 },
      { kind: 'chestnut', x: L.chestnutCart.x, y: L.chestnutCart.y, r: pc.cartRadius, hp: pc.cartHp, alive: true, flash: 0 },
    ],
    canisters: L.canisters.map(function (c) {
      return { x: c.x, y: c.y, r: pc.canister.radius, hp: pc.canister.hp, alive: true, flash: 0 };
    }),
    doorOpen: false,
    shutter: 0,
    shutterOpen: false,
    scaffoldDown: false,
  };
};

P.World.doors = function () {
  var L = P.CFG.level, out = [];
  L.doorsRight.forEach(function (y) { out.push({ x: L.corridor.xMax, y: y, side: 1 }); });
  L.doorsLeft.forEach(function (y) { out.push({ x: L.corridor.xMin, y: y, side: -1 }); });
  return out;
};

function inDoorGap(x, r) {
  var d = P.CFG.level.door;
  return x > d.xMin + r && x < d.xMax - r;
}

// Clamp a circle (p.x, p.y, radius r) into the walkable area. Mutates p.
// props.geo (generated levels) switches to the geo clamp.
P.World.clampWalk = function (p, r, props) {
  if (props.geo) { P.World.clampGeo(p, r, props); return; }
  var L = P.CFG.level, c = L.corridor, room = L.room, sh = L.shutter;
  var gapOpen = props.doorOpen && inDoorGap(p.x, r);
  if (p.y < 0) {
    p.x = Math.min(Math.max(p.x, room.xMin + r), room.xMax - r);
    p.y = Math.max(p.y, room.yMin + r);
    if (!gapOpen) p.y = Math.min(p.y, -r);
  } else {
    var xMax = c.xMax - r;
    if (props.shutterOpen && p.y > sh.yMin + r && p.y < sh.yMax - r) xMax = sh.xMax - r;
    p.x = Math.min(Math.max(p.x, c.xMin + r), xMax);
    if (!gapOpen) p.y = Math.max(p.y, r);
    p.y = Math.min(p.y, c.yMax - r);
  }
  P.World.pushOutRect(p, r, L.tram);
  for (var i = 0; i < props.carts.length; i++) {
    var k = props.carts[i];
    if (k.alive) P.World.pushOutCircle(p, r, k.x, k.y, k.r);
  }
};

// Generated level walkable area: corridor walls, blocks (AABB), and the exit gate while it is shut.
// The gate sits at g.exitY; behind it the corridor runs to g.length (the win trigger is just past it).
P.World.clampGeo = function (p, r, props) {
  var g = props.geo, bl = g.blocks, i;
  for (i = 0; i < bl.length; i++) P.World.pushOutRect(p, r, bl[i].rc);
  p.x = Math.min(Math.max(p.x, g.xMin + r), g.xMax - r);
  var top = props.shutterOpen ? g.length - r : g.exitY - r;
  p.y = Math.min(Math.max(p.y, r), top);
};

// Hero clamp used by movement and dashes (E1): geo-aware for generated levels, L1 walk otherwise.
P.World.clampHero = function (s, h) {
  P.World.clampWalk(h, P.CFG.hero.radius, s.props);
  if (s.props.geo) {                      // G1: the hero stays inside the camera's visible width (enemies are not clamped)
    var hx = P.CFG.view.heroClampX;
    for (var i = 0; i < 2; i++) {         // a block push can move him back out; resolve both once more
      h.x = Math.min(Math.max(h.x, -hx), hx);
      P.World.clampWalk(h, P.CFG.hero.radius, s.props);
    }
    h.x = Math.min(Math.max(h.x, -hx), hx);
  }
};

P.World.pushOutRect = function (p, r, rc) {
  var cx = Math.min(Math.max(p.x, rc.xMin), rc.xMax);
  var cy = Math.min(Math.max(p.y, rc.yMin), rc.yMax);
  var dx = p.x - cx, dy = p.y - cy, d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return;
  if (d2 > 1e-8) {
    var d = Math.sqrt(d2), push = r - d;
    p.x += dx / d * push; p.y += dy / d * push;
    return;
  }
  var left = p.x - rc.xMin, right = rc.xMax - p.x, down = p.y - rc.yMin, up = rc.yMax - p.y;
  var m = Math.min(left, right, down, up);
  if (m === left) p.x = rc.xMin - r; else if (m === right) p.x = rc.xMax + r;
  else if (m === down) p.y = rc.yMin - r; else p.y = rc.yMax + r;
};

P.World.pushOutCircle = function (p, r, cx, cy, cr) {
  var dx = p.x - cx, dy = p.y - cy, d2 = dx * dx + dy * dy, min = r + cr;
  if (d2 >= min * min) return;
  var d = Math.sqrt(d2);
  if (d2 < 1e-8) { dx = 1; dy = 0; d = 1; }
  p.x = cx + dx / d * min; p.y = cy + dy / d * min;
};

P.World.segmentAt = function (y) {
  var segs = P.CFG.level.segments, id = y < 0 ? 'restaurant' : 'A';
  for (var i = 0; i < segs.length; i++) if (y >= segs[i].y0) id = segs[i].id;
  return id;
};

P.World.inShutter = function (p) {
  var sh = P.CFG.level.shutter;
  return p.x > sh.xMin - 0.1 && p.y > sh.yMin && p.y < sh.yMax;
};
