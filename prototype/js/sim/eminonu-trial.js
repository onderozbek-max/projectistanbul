P.EminonuTrial = (function () {
  var E = {}, C = P.CFG.levels.eminonuMilestones, M = P.RouteMilestones;
  function point(x, y, r) { return { x: x, y: y, r: r || C.r, progress: 0 }; }

  E.init = function (s) {
    var spec = P.CFG.levels.eminonuRoutes[s.levelIndex], g = s.geo, kind = spec.kind;
    var zone = g.zones.find(function (z) {
      return kind === 'marketAwning' && z.kind === 'waterfront' || kind === 'marketCart' && z.kind === 'market';
    });
    var ideal = Math.round(zone ? zone.y0 + 0.39 * zone.len : g.holdY * spec.at);
    var back = kind === 'marketSacks' ? C.sacks.back : C.padY;
    var y = M.clearLane(s, ideal, spec.gap, back, C, zone ? zone.y0 + 1.5 : 0, zone ? zone.y1 - spec.gap - 1 : Infinity);
    var x = kind === 'marketAwning' ? C.awning.x : kind === 'marketSignal' ? C.signal.x : 0;
    var m = { kind: kind, eminonu: true, y: y + spec.gap, point: point(x, y),
      pressure: spec.pressure, useT: spec.useT, openT: spec.openT, open: false, opening: 0 };
    s.milestone = m;
    if (kind === 'marketAwning') passage(s, m);
    if (kind === 'marketCart') m.cart = point(C.cart.x, y);
    if (kind === 'marketSacks') {
      m.sacks = C.sacks.offsets.map(function (offset) { return point(offset[0], y + offset[1], C.sacks.pickup); });
      m.pallet = point(C.sacks.palletX, y, C.sacks.pickup); m.delivered = 0;
      sackSpace(s,m);
    }
    if (kind === 'marketSignal') m.signalT = 0;
  };

  function passage(s, m) {
    var g = s.geo, A = C.awning;
    var strip = { yMin: m.y - 0.14, yMax: m.y + A.depth };
    s.props.routeEdges = [
      Object.assign({ xMin: g.xMin, xMax: A.x - A.half }, strip),
      Object.assign({ xMin: A.x + A.half, xMax: g.xMax }, strip),
    ];
  }

  function beat(s, m, p, suffix) {
    s.events.push({ type: 'routeBeat', phase: m.kind + '_' + suffix, x: p.x, y: p.y });
  }

  function pack(s, y, types) {
    types.forEach(function (type, i) {
      var q = { x: i - (types.length - 1) / 2, y: y + i * 0.8 };
      P.World.clampGeo(q, P.CFG.enemies[type].radius, s.props);
      P.Events.spawn(s, null, type, q.x, q.y, { skin: 'vendor' });
    });
  }

  function escort(s, m, dt) {
    var q = m.cart, K = C.cart;
    if (!q.started && M.inRing(s, q, q.r)) {
      q.started = true; pack(s, q.y - K.back, K.packs[0]); beat(s, m, q, 'start');
    }
    if (!q.started) return false;
    q.jammed = P.Events.near(s, q.x, q.y, K.jamR).some(function (e) { return e.state === 'active'; });
    q.walking = !q.jammed && M.inRing(s, q, K.followR);
    if (q.walking) q.y = Math.min(m.y - K.loadingGap, q.y + K.speed * dt);
    if (!q.second && q.y >= m.point.y + K.waveAt) {
      q.second = true; pack(s, m.y + K.ahead, K.packs[1]);
    }
    return q.y >= m.y - K.loadingGap;
  }

  function sacks(s, m) {
    if (m.carry) {
      if (!M.inRing(s, m.pallet, m.pallet.r)) return false;
      m.carry.delivered = true; m.carry = null; m.delivered++;
      if(s.companion&&!m.work)m.work={finished:0,progress:0,targets:[],active:false};
      sackSpace(s,m);
      beat(s, m, m.pallet, 'delivered');
      return m.delivered === m.sacks.length;
    }
    var q = nearestSack(s, m);
    if (q && !s.hero.streetHolding && M.inRing(s, q, q.r)) { m.carry = q; sackSpace(s,m);workThreat(s,m);beat(s, m, q, 'pickup'); }
    return false;
  }
  function workThreat(s,m){
    if(!s.companion||m.workArrival)return;m.workArrival=true;
    var K=P.CFG.bond.kaan.support.work,g=s.geo,p=m.pallet;
    var at=P.WalkPath.nearest(s,{x:g.xMin+K.edge,y:p.y+K.threatAhead},P.CFG.enemies[K.threat].radius);
    if(!at||Math.hypot(at.x-p.x,at.y-p.y)<K.radius*2)return;
    var e=P.Events.spawn(s,null,K.threat,at.x,at.y,{state:'active',skin:'vendor'});
    if(e)e.lure={x:p.x,y:p.y,t:K.lureT};
  }
  // Optional physical loading continues while Arda fetches the remaining sacks; it never gates progression.
  E.work=function(s,dt){
    var m=s.milestone,k=s.companion,w=m&&m.work,K=P.CFG.bond.kaan.support.work;
    if(!w||!k)return false;
    w.active=false;
    if(s.kaanSupport&&s.t-s.kaanSupport.start<P.CFG.bond.kaan.support.duration)return false;
    if(w.finished>=m.delivered||Math.hypot(s.hero.x-m.pallet.x,s.hero.y-m.pallet.y)>K.leave)return false;
    var target=P.WalkPath.nearest(s,{x:m.pallet.x+K.side,y:m.pallet.y+K.ahead},P.CFG.experience.people.radius);
    if(!target)return false;
    if(Math.hypot(k.x-target.x,k.y-target.y)>K.reach){if(k.repath<=0)P.Companion.intercept(s,target);return true;}
    k.path=[];w.active=true;
    var near=P.Events.near(s,m.pallet.x,m.pallet.y,K.radius).filter(function(e){return !e.dead&&e.state==='active';});
    if(near.length){w.blocked=true;w.targets=near.map(function(e){return e.id;});k.fx=near[0].x-k.x;k.fy=near[0].y-k.y;return true;}
    if(w.blocked&&w.helped&&!w.ack){w.ack=true;s.kaanRepay=true;
      s.events.push({type:'routeBeat',phase:'kaan_covered_by_arda',x:k.x,y:k.y,reason:'loading-resumed'});}
    w.blocked=false;w.progress=Math.min(1,w.progress+dt/K.T);k.fx=m.pallet.x-k.x;k.fy=m.pallet.y-k.y;
    if(w.progress>=1){w.finished++;w.progress=0;s.events.push({type:'routeBeat',phase:'kaan_sack_loaded',x:k.x,y:k.y});}
    return true;
  };
  E.workKill=function(s,e,src){
    var w=s.milestone&&s.milestone.work;if(!w||w.targets.indexOf(e.id)<0)return;
    if(P.Progression.isWeapon(src)||src==='streetCart'||src==='dot'&&Object.keys(e.dotSources||{}).some(P.Progression.isWeapon))w.helped=true;
  };

  function sackSpace(s,m) {
    var K=C.sacks;
    s.props.routeEdges=m.sacks.filter(function(q){return !q.delivered&&q!==m.carry;}).map(function(q){
      return {xMin:q.x-K.width/2,xMax:q.x+K.width/2,yMin:q.y-K.depth/2,yMax:q.y+K.depth/2};
    });
    if(m.delivered)s.props.routeEdges.push({xMin:m.pallet.x-K.palletW/2,xMax:m.pallet.x+K.palletW/2,
      yMin:m.pallet.y-K.palletD/2,yMax:m.pallet.y+K.palletD/2});
  }

  function nearestSack(s, m) {
    var best, distance = Infinity, h = s.hero;
    m.sacks.forEach(function (q) {
      if (q.delivered) return;
      var d = Math.hypot(q.x - h.x, q.y - h.y);
      if (d < distance) { best = q; distance = d; }
    });
    return best;
  }

  function signal(s, m, dt) {
    if (!M.hold(s, m.point, m.useT, dt)) return false;
    var K = C.signal.cart, h = s.hero, before = m.signalT;
    if (before === 0) beat(s, m, m.point, 'armed');
    m.signalT = Math.min(m.signalT + dt, K.lead + K.T);
    var y = m.y - K.yBack, r = P.CFG.hero.radius;
    if (m.signalT > K.lead) sweepCrowd(s,m,before,y,K);
    if (!m.trolleyHit && m.signalT > K.lead && Math.abs(h.y - y) <= K.length / 2 + r &&
        h.x >= E.trolleyX(m.signalT) - K.width / 2 - r && h.x <= E.trolleyX(before) + K.width / 2 + r) {
      m.trolleyHit = P.Combat.damageHero(s, K.dmg, 'marketTrolley') > 0;
    }
    return m.signalT >= K.lead + K.T;
  }

  function sweepCrowd(s,m,before,y,K) {
    var struck=m.trolleyStruck || (m.trolleyStruck={}), left=E.trolleyX(m.signalT)-K.width/2;
    var right=E.trolleyX(before)+K.width/2;
    s.enemies.forEach(function(e) {
      if (e.dead || e.boss || e.state!=='active' || struck[e.id]) return;
      if (e.x+e.r<left || e.x-e.r>right || Math.abs(e.y-y)>K.length/2+e.r) return;
      struck[e.id]=true;
      P.Combat.damageEnemy(s,e,K.crowdDmg,-1,0,K.crowdPush,false,'marketTrolley');
      s.events.push({type:'routeBeat',phase:'marketSignal_crowd_hit',id:e.id,x:e.x,y:e.y});
    });
  }

  E.trolleyX = function (t) {
    var K = C.signal.cart, q = Math.max(0, Math.min(1, (t - K.lead) / K.T));
    return K.from + (K.to - K.from) * q * q * (3 - 2 * q);
  };
  E.station = function (s, m) {
    if (m.cart) return m.cart;
    if (m.sacks) return m.carry ? m.pallet : nearestSack(s, m) || m.pallet;
    return m.point;
  };
  E.target = function (s, m) {
    if (m.open) return m.kind === 'marketAwning' && s.hero.y < m.y + C.awning.depth ? [C.awning.x, m.y + C.awning.depth + 1] : null;
    var p = E.station(s, m), q = m.cart;
    if (q && q.walking && s.hero.y + 1.7 >= q.y) return [q.x, Math.min(m.y - C.cart.loadingGap, q.y + 1.1)];
    return [p.x, p.y];
  };
  E.pressure = function (s, m) {
    return m.pressure * (!m.open && M.inRing(s, E.station(s, m), C.route.stationRadius) ? C.route.stationPressure : 1);
  };
  E.ready = function (s, m, dt) {
    if (m.cart) return escort(s, m, dt);
    if (m.sacks) return sacks(s, m);
    if (m.kind === 'marketSignal') return signal(s, m, dt);
    return M.hold(s, m.point, m.useT, dt);
  };
  return E;
})();
