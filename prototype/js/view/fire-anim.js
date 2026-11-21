// Weapon fire animation core (view only). Attacks age as soon as they fire. Each new attack may claim
// a short readable body pose while the other weapons keep their live effects. Contract (simulation):
//   { type: 'wfire', w: weaponId, x, y, ang (world radians toward the target), lv 1..5, n projectile count }
//   s.hero.revving (seconds left, > 0) and s.hero.revAng (world radians) while the chainsaw revs.
// Data: fire-anim-held*.js (poses: T, held, rev), fire-anim-fx*.js (fire, tick, revTick, flight, track, draw).
// Drawing helpers: fire-anim-prim.js. Geometry is world metres (1 m = F.m px); pools are fixed size.
// Hooks: render.js calls heroOpts before the hero sprite, drawHeld after it, drawFx after projectiles;
// main.js calls onEvent from handleEvents and update in the frame loop.
P.FireAnim = (function () {
  var MAX = 220, MAX_FLY = 12, SHX_MAIN = 0.2, SHX_OFF = -0.128, SHY = 0.397;
  // Shoulders from Arda's centre (sprites.js: 0.165 and -0.105 figure units at shoulder height 0.53 units above the feet).
  var ALIAS = { tray: 'sawblade', simittray: 'manhole', cezve: 'torch', semsiye: 'cardoor', tavla: 'slingshot',
    kestane: 'chainsaw', cleaver: 'knife', nailstorm: 'nailgun', cluster: 'canister', cyclone: 'chain', finale: 'fireworks' };
  var cache = {};

  function defOf(id) {
    if (cache[id] !== undefined) return cache[id];
    var H = P.FireAnimHeld && P.FireAnimHeld[id], E = P.FireAnimFx && P.FireAnimFx[id];
    return (cache[id] = H ? { T: H.T, held: H.held, rev: H.rev, over: H.over, fire: E && E.fire, tick: E && E.tick, revTick: E && E.revTick, draw: E && E.draw } : null);
  }

  function makeGeom() {
    var G = { hx: 0, hy: 0, ang: 0, ca: 1, sa: 0, side: 1, mx: 0, my: 0, ox: 0, oy: 0, cx: 0, cy: 0, ext: 0, dx: 0, P: [] };
    for (var i = 0; i < 24; i++) G.P.push({ x: 0, y: 0 });
    // Point (fwd, up, lat) metres from a base: 0 = main shoulder, 1 = off shoulder, 2 = midline. Writes slot i.
    G.pt = function (i, base, fwd, up, lat) {
      var bx = base === 0 ? G.mx : base === 1 ? G.ox : G.cx, by = base === 0 ? G.my : base === 1 ? G.oy : G.cy, o = G.P[i];
      o.x = bx + G.ca * (fwd + G.ext) - G.sa * lat + G.dx; o.y = by + G.sa * (fwd + G.ext) + G.ca * lat + up; return o;
    };
    return G;
  }

  // The main hand is the shoulder on the aim side, so the shot arm always reaches outward.
  // Shoulder side with hysteresis: it flips only once the aim is clearly on the other side, so a target almost straight above or
  // below no longer swaps the shot arm (and teleports the weapon) from one shot to the next.
  // Aiming away from the camera (up the screen) the weapon would be painted across the face, so the whole grip slides out to the
  // aim side by `dx` and reaches a little further (`ext`); `away` ramps smoothly with the aim angle, so nothing pops.
  function setGeom(F, h, ang) {
    var G = F.G, cs = Math.cos(ang), sn = Math.sin(ang), away = Math.max(0, Math.min(1, (sn - 0.3) / 0.5)), side;
    // Aiming away from the camera the shot arm is the sprite's back arm (the side opposite its facing), the same one the resting
    // arm uses between shots (weapons-fx.js awayShift), so the weapon stays on one side of the head from shot to rest and back.
    if (F.awayMode ? away < 0.25 : away > 0.5) F.awayMode = !F.awayMode;
    if (F.awayMode) F.side = h.fx >= 0 ? -1 : 1;
    else if (cs > 0.22) F.side = 1; else if (cs < -0.22) F.side = -1; else if (!F.side) F.side = cs >= 0 ? 1 : -1;
    side = F.side;
    G.hx = h.x; G.hy = h.y; G.ang = ang; G.ca = cs; G.sa = sn; G.side = side;
    G.mx = h.x + side * SHX_MAIN; G.my = h.y + SHY; G.ox = h.x + side * SHX_OFF; G.oy = G.my;
    G.cx = h.x; G.cy = G.my;
    G.ext = 0.12 * away; G.dx = side * 0.26 * away;
    return G;
  }

  function lvOf(v) { v = v | 0; return v < 1 ? 1 : v > 5 ? 5 : v; }

  function create() {
    var F = { sim: null, R: null, c: null, m: 40, q: 1, rm: false, cur: 0, fcur: 0, G: makeGeom(), pool: [], flights: [],
      pose: { id: '', def: null, t: 0, T: 0, ang: 0, lv: 1, n: 1, on: false, f: {} }, kk: { t: 0, p: 0, T: 0, lv: 1, n: 1, ang: 0, id: '', f: null, rev: false },
      rf: {}, stance: {}, pending: [], hammerWindup: null, disc: null };
    var i;
    for (i = 0; i < MAX; i++) F.pool.push({ alive: false, k: '', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, t: 0, T: 1, r: 0, a: 0, va: 0, w: 0,
      op: 1, grav: 0, bounce: false, jit: false, add: false, col: '255,255,255', n: 0, pts: new Float32Array(16) });
    for (i = 0; i < MAX_FLY; i++) F.flights.push({ on: false, k: '', x: 0, y: 0, ox: 0, oy: 0, ang: 0, sp: 0, t: 0, T: 1, a: 0, w: 0, n: 0, f: null });

    F.reset = function (s) {
      var j; F.sim = s; F.pose.on = false; F.revId = 'chainsaw'; F.revLv = 1; F.revT = 0;
      F.hammerWindup = F.hammerPose = F.disc = null; F.pending.length = 0; F.side = 0; F.awayMode = false;
      F.lastShown = {}; F.clock = 0;
      F.contacts={};
      for (j = 0; j < MAX; j++) F.pool[j].alive = false;
      for (j = 0; j < MAX_FLY; j++) F.flights[j].on = false;
    };
    // Particle from the ring pool (oldest is recycled when full). Callers set motion fields after spawning.
    F.spawn = function (k, x, y, T, r, col) {
      var p = F.pool[F.cur];
      F.cur = (F.cur + 1) % MAX;
      p.alive = true; p.k = k; p.x = x; p.y = y; p.z = 0; p.vx = 0; p.vy = 0; p.vz = 0; p.t = T; p.T = T; p.r = r; p.a = 0; p.va = 0;
      p.op = 1; p.grav = 0; p.bounce = false; p.jit = false; p.w = 0;
      p.add = k === 'spark' || k === 'glint' || k === 'flame' || k === 'bolt';
      p.col = col || '255,255,255';
      return p;
    };
    // Moving projectile for effects that outlive the pose (rocket, marbles, discus). Trails come from fx.flight.
    F.launch = function (k, x, y, ang, sp, T) {
      var f = F.flights[F.fcur];
      F.fcur = (F.fcur + 1) % MAX_FLY;
      f.on = true; f.k = k; f.x = x; f.y = y; f.ox = x; f.oy = y; f.ang = ang; f.sp = sp; f.t = 0; f.T = T; f.a = 0; f.w = 0; f.n = 0; f.f = null;
      return f;
    };
    // Particle count and chance scaled by reduced motion (half density).
    F.count = function (n) { return Math.round(n * F.q); };
    F.chance = function (hz, dt) { return Math.random() < hz * dt * F.q; };

    function kOf(p) {
      var k = F.kk;
      k.t = p.t; k.T = p.T; k.p = p.T > 0 ? Math.min(1, p.t / p.T) : 1; k.lv = p.lv; k.n = p.n; k.ang = p.ang; k.id = p.id; k.f = p.f; k.rev = false;
      return k;
    }
    function revK(h) {
      var k = F.kk, elapsed = Math.max(0, F.revT - h.revving);
      k.t = elapsed; k.T = F.revT || 1; k.p = elapsed / k.T; k.lv = F.revLv; k.n = 1; k.ang = +h.revAng || 0; k.id = F.revId; k.f = F.rf; k.rev = true;
      k.f.contact=F.contacts.chainsaw;
      return k;
    }

    // A shot preempted before its first visual frame still gets a muzzle cue near the firing hand.
    function nailCue(p, h) {
      if (!p.on || (p.id !== 'nailgun' && p.id !== 'nailstorm') || p.f.muzzle || !P.FireAnimFx || !P.FireAnimFx.nailgun) return;
      var G = setGeom(F, h, p.ang), grip = G.pt(0, 0, 0.16, -0.02, 0);
      P.FireAnimFx.nailgun.muzzle(F, G, grip.x, grip.y, p.lv, p.id === 'nailstorm');
      p.f.muzzle = true;
    }

    var A = P.HeroAttacks;
    function hammer(id) { return id === 'sledge' || id === 'blacksmith'; }
    function show(p) {
      if (F.pose !== p) nailCue(F.pose, F.sim.hero);
      p.shownAt = p.t;
      F.pose = p;
      F.lastShown[p.id] = F.clock;
    }
    function selectPose() {
      var p = F.pose, style = A.style(p.id), min = style ? Math.max(.07, Math.min(.105, style.hold)) : .08;
      if (p.on && p.t - p.shownAt < min) return;
      if (!F.pending.length) return;
      var next = 0, best = Infinity, priority = -1;
      F.pending.forEach(function (q, i) {
        var last = F.lastShown[q.id], entry = A.style(q.id), weight = entry ? entry.priority : 0;
        if (last === undefined) last = -1;
        if (last < best || last === best && weight > priority) { best = last; priority = weight; next = i; }
      });
      show(F.pending.splice(next, 1)[0]);
    }
    function startPose(ev) {
      var id = ev.variant && (A.style(ev.variant) || defOf(ev.variant)) ? ev.variant : ALIAS[ev.w] || ev.w || '';
      var def = defOf(id) || defOf(ALIAS[id] || ev.w), side = F.side, away = F.awayMode;
      if (!def) return;
      var p = { id: id, def: def, ang: +ev.ang || 0, lv: lvOf(ev.lv), n: Math.max(1, ev.n | 0),
        t: 0, on: true, f: ev.windup ? { windup: ev.windup } : {} };
      if (ev.w === 'chainsaw') { F.revId = id; F.revLv = p.lv; F.revT = F.sim.hero.revving || 0; }
      p.T = ev.actionT || (typeof def.T === 'function' ? def.T(p.lv, p.n) : def.T);
      if (hammer(id) && ev.windup) p.T = ev.windup + 0.45;
      if (hammer(id)) F.hammerPose = p;
      if (ev.catchDisc) { p.f.catchDisc = true; p.T = 0.20 + 0.015 * (p.lv - 1); }
      else if (def.fire) def.fire(F, setGeom(F, F.sim.hero, p.ang), kOf(p));
      if (!F.pose.on || F.pose.id === id && !F.pose.f.catchDisc) { show(p); return; }
      nailCue(p, F.sim.hero); F.side = side; F.awayMode = away;
      var i = F.pending.findIndex(function (old) { return old.id === id; });
      if (i < 0) F.pending.push(p); else F.pending[i] = p;
      selectPose();
    }
    function catchDisc(ev) {
      var shot = F.disc, h = F.sim.hero;
      if (!shot || F.pose.f.catchDisc && F.pose.on) return;
      var dx = ev.x - h.x, dy = ev.y - h.y, ang = dx || dy ? Math.atan2(dy, dx) : shot.ang;
      startPose({ w: 'sawblade', variant: shot.id, ang: ang, lv: shot.lv, catchDisc: true });
    }
    function releaseHammer(ev) {
      var p = F.hammerPose, id = ev.variant || ev.src;
      if (!p || id && id !== p.id || p.f.impactAt !== undefined) return;
      var i = F.pending.indexOf(p);
      if (i >= 0) F.pending.splice(i, 1);
      p.on = true;
      show(p);
      p.f.impactAt = p.t;
      p.T = p.t + 0.18 + 0.014 * (p.lv - 1);
    }
    function releaseSaw(){
      var def=defOf(F.revId),p={id:F.revId,def:def,t:0,T:.20,ang:F.sim.hero.revAng,lv:F.revLv,n:1,on:true,f:{release:true}};
      if(!F.pose.on||F.pose.id===F.revId)show(p);
    }

    // wfire: the owned variant's own pose when it has one (evolutions), else the base family (ALIAS for old names).
    // skillUsed starts the skill's held pose ('skill_<id>'). Every other event goes to FireAnimFx.event (W3 evolution visuals).
    F.onEvent = function (ev, s) {
      if (!ev) return;
      if (s && s !== F.sim) F.reset(s);
      if (!F.sim) return;
      if(ev.type==='knifeBackhand'){startPose({w:'knife',ang:ev.ang,lv:ev.lv,actionT:ev.actionT});return;}
      if(ev.type==='hit'&&['knife','chain','chainsaw'].indexOf(ev.src)>=0)
        F.contacts[ev.src]={src:ev.src,x:ev.x,y:ev.y,at:F.clock,until:F.clock+.13,boss:ev.boss};
      if(ev.type==='sawStall')releaseSaw();
      if (ev.type === 'propStrike') startPose({ w: 'knife', ang: ev.a, lv: 1, n: 1 });
      if (ev.type === 'sledgeGroundStrike') releaseHammer(ev);
      if (ev.type === 'swing' && !ev.back && F.pose.on && F.pose.id === 'knife') {
        F.pose.f.dir = ev.dir;
        F.pose.f.arc = ev.arcDeg * Math.PI / 360;
        F.pose.f.range = ev.range;
      }
      if (ev.type === 'sawCatch') catchDisc(ev);
      if (ev.type === 'sledgeWindup') {
        if (!ev.repeat) { F.hammerWindup = ev.T; return; }
        ev = { type: 'wfire', w: 'sledge', variant: ev.variant, windup: ev.T,
          ang: Math.atan2(ev.ty - ev.y, ev.tx - ev.x), lv: F.sim.hero.weapons[ev.variant] || 1, n: ev.n };
      }
      else if (ev.type === 'skillUsed') ev = { type: 'wfire', w: 'skill_' + ev.id, ang: F.lastAng || 0, lv: 1, n: 1 };
      else if (ev.type !== 'wfire') { if (P.FireAnimFx && P.FireAnimFx.event) P.FireAnimFx.event(F, ev); return; }
      else F.lastAng = +ev.ang || 0;
      if (ev.w === 'sledge' && F.hammerWindup !== null) {
        ev = Object.assign({}, ev, { windup: F.hammerWindup }); F.hammerWindup = null;
      }
      if (ev.w === 'sawblade') F.disc = { id: ev.variant || ev.w, lv: ev.lv, ang: ev.ang || 0 };
      startPose(ev);
    };

    function followTool(p, s) {
      var W, active;
      if(p.id==='knife'&&s.ws&&s.ws.knifeSwing)p.ang=s.ws.knifeSwing.aim||s.ws.knifeSwing.a;
      if (p.id === 'torch' || p.id === 'forge') {
        W = P.Weapons.state(s).torches;
        active = W && W[W.length - 1];
        if (active && !active.done && active.id === p.id) p.ang = active.a;
      } else if (p.id === 'olta' || p.id === 'hookpull') {
        W = P.Weapons.state(s).hooks;
        active = W && W[0];
        if (active && active.phase !== 'cast') {
          p.T = Math.max(p.T, p.t + 0.14);
          p.ang = Math.atan2(active.e.y - s.hero.y, active.e.x - s.hero.x);
        }
      }
    }

    F.update = function (dt, s) {
      s = s || F.sim;
      if (!s) return;
      if (s !== F.sim) F.reset(s);
      F.clock += dt;
      Object.keys(F.contacts).forEach(function(id){if(F.clock>=F.contacts[id].until)delete F.contacts[id];});
      F.rm = !!(P.Settings && P.Settings.reduceMotion); F.q = F.rm ? 0.5 : 1;
      var p = F.pose, h = s.hero;
      if (p.on) {
        followTool(p, s);
        p.t += dt;
        if (p.t >= p.T) p.on = false;
        else if (p.def.tick && !p.f.catchDisc && !p.f.release) p.def.tick(F, setGeom(F, h, p.ang), kOf(p), dt);
      }
      for (var i = F.pending.length - 1; i >= 0; i--) {
        var waiting = F.pending[i];
        waiting.t += dt;
        if (waiting.t >= waiting.T || !hammer(waiting.id) && (waiting.T - waiting.t < .04 || waiting.t > .24)) F.pending.splice(i, 1);
      }
      if (F.hammerPose && F.hammerPose !== p && F.pending.indexOf(F.hammerPose) < 0) F.hammerPose.t += dt;
      selectPose();
      if (h.revving > 0) {
        var cs = defOf('chainsaw');
        if (cs && cs.revTick) cs.revTick(F, setGeom(F, h, +h.revAng || 0), dt);
      }
      if (P.FireAnimFx && P.FireAnimFx.track) P.FireAnimFx.track(F, s, dt);
      age(F, dt);
    };

    function age(F2, dt) {
      var i2, p2, f2;
      for (i2 = 0; i2 < MAX; i2++) {
        p2 = F2.pool[i2];
        if (!p2.alive) continue;
        p2.t -= dt;
        if (p2.t <= 0) { p2.alive = false; continue; }
        p2.x += p2.vx * dt; p2.y += p2.vy * dt; p2.a += p2.va * dt;
        if (p2.vz || p2.z > 0) {
          if (p2.grav) p2.vz -= 9.8 * dt;
          p2.z += p2.vz * dt;
          if (p2.z <= 0) { p2.z = 0; if (p2.bounce && p2.vz < -0.6) { p2.vz = -p2.vz * 0.35; p2.vx *= 0.6; p2.vy *= 0.6; } else p2.vz = 0; }
        }
      }
      for (i2 = 0; i2 < MAX_FLY; i2++) {
        f2 = F2.flights[i2];
        if (!f2.on) continue;
        f2.t += dt;
        if (f2.t >= f2.T) { f2.on = false; if (P.FireAnimFx && P.FireAnimFx.landed) P.FireAnimFx.landed(F2, f2); continue; }
        f2.x += Math.cos(f2.ang) * f2.sp * dt; f2.y += Math.sin(f2.ang) * f2.sp * dt;
        if (P.FireAnimFx && P.FireAnimFx.flight) P.FireAnimFx.flight(F2, f2, dt);
      }
    }

    // A held pose takes over equipment and the procedural sprite’s arms.
    function heldDoor(s) {
      if (!P.WTier || !P.WTier.enabled || !P.WSil || !P.WSil.drawHeldDoor) return null;
      var list = P.Weapons.state(s).doors;
      return list && list[0];
    }
    function bodyTool(s, door) {
      var p = F.pose;
      if (door && door.heave !== undefined) return 'door';
      if (s.hero.revving > 0 && !(p.on && p.id !== F.revId && p.t - p.shownAt < .11)) return 'rev';
      if (p.on) {
        if (door && door.id === p.id) return 'door';
        return 'pose';
      }
      if (door) return 'door';
      return null;
    }

    F.heldId=function(s){var door=heldDoor(s),kind=bodyTool(s,door);return kind==='rev'?F.revId:kind==='door'?door.id:kind==='pose'?F.pose.id:null;};
    F.heroOpts = function (s, o) {
      var p = F.pose, h = s.hero, door = heldDoor(s), tool = bodyTool(s, door);
      o.noArms = F.sim === s && !!tool;
      if (o.noArms) o.backHand = null;
      if (!o.noArms) return;
      if (tool === 'pose') o.attack = p;
      var k = tool === 'rev' ? revK(h) : tool === 'door'
        ? { id: door.id, lv: lvOf(door.grade), p: door.heave !== undefined ? .5 + .26 * door.heave :
          door.swing ? .34 + .43 * door.t / door.T : door.travel ? .82 : .16, ang: door.a }
        : kOf(p);
      var reduced = !!(P.Settings && P.Settings.reduceMotion);
      o.attackStance = A.sample(k, reduced, F.stance);
      o.attackId = k.id; o.attackProgress = k.p;
      var cut=s.ws&&(k.id==='knife'?s.ws.knifeSwing:k.id==='cleaver'?s.ws.cleaverSwing:null);
      if(cut){o.attackBladeAngle=cut.angle;o.attackStance.roll+=(Math.sin(cut.angle-cut.a))*.11;}
      o.attackResistance=F.contacts.chainsaw?Math.max(0,1-(F.clock-F.contacts.chainsaw.at)/.13):0;
      if (!o.attackStance) return;
      if (tool === 'door' && door.heave !== undefined && !reduced) {
        o.attackStance.arm = door.heave < .82 ? 'raise' : 'reach';
        o.attackStance.bend = .09 * (1 - door.heave);
        o.attackStance.height += .12 * door.heave;
      }
      o.attackHand = setGeom(F, h, k.ang).side;
      o.attackMotion = o.attackStance.lean;
    };

    function setCtx(R) { F.R = R; F.c = R.ctx; F.m = R.ppm; }

    function held(draw, G, k, grips) {
      if (!grips) { draw(F, G, k); return; }
      F.grip = G.side > 0 ? grips.right : grips.left;
      F.gripPlaced = false;
      F.c.save();
      try { draw(F, G, k); } finally {
        F.c.restore();
        F.grip = null;
      }
    }

    F.drawHeld = function (R, s, grips) {
      if (F.sim !== s) return;
      var h = s.hero, p = F.pose, G, cs, door = heldDoor(s), tool = bodyTool(s, door);
      if (tool === 'door') {
        G = setGeom(F, h, door.a);
        P.WSil.drawHeldDoor(R, h, door, grips && (G.side > 0 ? grips.right : grips.left));
      } else if (tool === 'rev') {
        cs = defOf(F.revId);
        if (cs) {
          setCtx(R); G = setGeom(F, h, +h.revAng || 0);
          held(cs.rev || cs.held, G, revK(h), grips);
          if (P.WTier) P.WTier.heldGlow(F, G, F.revId, s);
        }
      } else if (tool === 'pose') {
        setCtx(R); G = setGeom(F, h, p.ang);
        held(p.def.held, G, kOf(p), grips);
        if (P.WTier) P.WTier.heldGlow(F, G, p.id, s);
      }
    };

    F.drawFx = function (R, s) {
      if (F.sim !== s) return;
      var c = R.ctx, p = F.pose;
      setCtx(R);
      var door = heldDoor(s);
      if (door && bodyTool(s, door) !== 'door') P.WSil.drawHeldDoor(R, s.hero, door, null, true);
      P.FireAnimPrim.drawParts(F, 0);
      if (P.FireAnimFx && P.FireAnimFx.draw) P.FireAnimFx.draw(F, s);
      if (p.on && !p.f.catchDisc && p.def.draw) p.def.draw(F, setGeom(F, s.hero, p.ang), kOf(p));
      if (p.on && !p.f.catchDisc && p.def.over) p.def.over(F, setGeom(F, s.hero, p.ang), kOf(p));
      c.save(); c.globalCompositeOperation = 'lighter';
      P.FireAnimPrim.drawParts(F, 1);
      c.restore();
    };

    return F;
  }

  var api = create();
  api.create = create;
  return api;
})();
