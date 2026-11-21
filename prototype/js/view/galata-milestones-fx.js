// Galata landmarks, companion and counterweight animations. Coordinates follow the route simulation.
P.GalataFx = (function () {
  var F = {}, C = P.CFG.levels.galataMilestones, INK = '#22212C', GOLD = '#FFD166', WOOD = '#967151', STONE = '#85908B';
  function box(c, x, y, w, h, fill) {
    c.fillStyle = fill; c.fillRect(x, y, w, h);
    c.lineWidth = 2; c.strokeStyle = INK; c.strokeRect(x, y, w, h);
  }
  function line(c, x, y, nx, ny, col, w) {
    c.beginPath(); c.moveTo(x, y); c.lineTo(nx, ny); c.strokeStyle = col; c.lineWidth = w; c.stroke();
  }
  function shot(R, x, y, pad) {
    var a = R.toScreen(x, y), k = pad * R.ppm;
    return a.y > -k && a.y < R.H + k;
  }
  function ring(R, p) {
    var c = R.ctx, x = R.X(p.x), y = R.Y(p.y), r = p.r * R.ppm;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.lineWidth = 5; c.strokeStyle = INK; c.stroke();
    c.lineWidth = 2; c.strokeStyle = GOLD; c.stroke();
    if (p.progress <= 0) return;
    c.beginPath(); c.arc(x, y, r, -Math.PI / 2, (p.progress * 2 - 0.5) * Math.PI);
    c.lineWidth = 4; c.strokeStyle = '#9DEDF9'; c.stroke();
  }
  function wheel(c, x, y, u, progress) {
    var r = .36 * u;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = '#35404A'; c.fill(); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
    for (var i = 0; i < 3; i++) {
      var a = i * Math.PI * 2 / 3 + progress * 4 * Math.PI;
      line(c, x, y, x + Math.cos(a) * r, y + Math.sin(a) * r, GOLD, 2.2);
    }
  }
  function weight(c, x, y, u) {
    box(c, x - .27 * u, y - .2 * u, .54 * u, .38 * u, '#75828C');
    box(c, x - .15 * u, y - .33 * u, .3 * u, .13 * u, '#B8AC93');
    line(c, x - .18 * u, y - .04 * u, x + .18 * u, y - .04 * u, '#D3B170', 2);
  }
  function bellPayoff(R, s, m) {
    if (!m.lure || s.t - m.rungAt >= C.bell.lureT) return;
    var c = R.ctx, u = R.ppm, x = R.X(m.lure.x), y = R.Y(m.lure.y);
    var age = Math.max(0, s.t - m.rungAt);
    c.save();
    c.globalAlpha = Math.min(.8, C.bell.lureT - age);
    for (var i = 1; i <= 3; i++) {
      c.beginPath(); c.ellipse(x, y, i * .34 * u, i * .19 * u, 0, 0, Math.PI * 2);
      c.strokeStyle = i === 1 ? GOLD : '#AE9C7A'; c.lineWidth = (.085 - i * .013) * u; c.stroke();
    }
    c.restore();
  }
  function bell(c, x, y, u, angle) {
    c.save(); c.translate(x, y); c.rotate(angle);
    c.beginPath(); c.moveTo(-.34 * u, .34 * u); c.quadraticCurveTo(-.18 * u, -.33 * u, 0, -.32 * u);
    c.quadraticCurveTo(.18 * u, -.33 * u, .34 * u, .34 * u); c.closePath();
    c.fillStyle = '#CF9B51'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke();
    line(c, -.37 * u, .34 * u, .37 * u, .34 * u, GOLD, 3);
    c.beginPath(); c.arc(0, .40 * u, .10 * u, 0, Math.PI * 2); c.fillStyle = INK; c.fill(); c.restore();
  }
  function instrument(R, guide) {
    var c = R.ctx, x = R.X(guide.x) + .16 * R.ppm, y = R.Y(guide.y) - .48 * R.ppm, u = R.ppm;
    c.beginPath(); c.ellipse(x, y, .24 * u, .14 * u, -.51, 0, Math.PI * 2); c.fillStyle = '#E5B675'; c.fill();
    c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
    line(c, x + .06 * u, y - .03 * u, x + .48 * u, y - .30 * u, '#674832', 4);
  }
  function stairs(c, L, X, R, y, u, open) {
    if (P.WorkStages.draw(c,'stairs',X,y+.18*u,u,4)) {
      if(open<1){c.save();c.beginPath();c.rect(X-2*u,y-2.4*u,4*u*(1-open),2.9*u);c.clip();
        P.StreetArt.cover('gate',c,X,y-.15*u,u,{w:4,h:.8});c.restore();}
      return;
    }
    box(c, L, y - 1.05 * u, R - L, 1.23 * u, '#817B6C');
    for (var i = 0; i < 4; i++) line(c, L, y - i * .28 * u, R, y - i * .28 * u, '#AFA891', 2);
    if (open < 1) {
      var gap = (R - L) * .5 * open;
      box(c, L, y - .36 * u, X - L - gap, .29 * u, WOOD);
      box(c, X + gap, y - .36 * u, R - X - gap, .29 * u, WOOD);
    }
  }
  function hoist(c, L, X, R, y, u, p) {
    var up = -p * 2.2 * u, h = .73 * u;
    box(c, L, y - .63 * u, R - L, .28 * u, STONE);
    box(c, L, y - .56 * u, X - L - 2 * u, .74 * u, STONE);
    box(c, X + 2 * u, y - .56 * u, R - X - 2 * u, .74 * u, STONE);
    line(c, X - 1.1 * u, y - 3.45 * u, X - 1.1 * u, y - 1.70*u + up, '#594E42', 3);
    line(c, X + 1.1 * u, y - 3.45 * u, X + 1.1 * u, y - 1.70*u + up, '#594E42', 3);
    if (P.WorkStages.draw(c,'load',X,y+up,u,4)) return;
    box(c, X - 2.0 * u, y - h + up, 4 * u, h, WOOD);
    for (var i = -1; i <= 1; i++) line(c, X + i * 1.1 * u, y - h + up, X + (i + .45) * u, y + up, '#D5A96F', 2.5);
  }
  function bridge(c, L, X, R, y, u, p) {
    box(c, L, y - 1.36 * u, R - L, 1.54 * u, '#333747');
    if (P.WorkStages.landing(c,'bridge',X,y,u,3.9,p)) return;
    var b = Math.max(.25 * u, p * 1.55 * u), w = 3.9 * u;
    box(c, X - w / 2, y - 1.4 * u, w, b, WOOD);
    for (var i = .2 * u; i < b; i += .21 * u) line(c, X - w / 2, y - 1.4 * u + i, X + w / 2, y - 1.4 * u + i, '#C59865', 2);
    if (p < 1) {
      line(c, X - w / 2, y - 2.1 * u, X - w / 2, y - 1.4 * u + b, '#D3B583', 2);
      line(c, X + w / 2, y - 2.1 * u, X + w / 2, y - 1.4 * u + b, '#D3B583', 2);
    }
  }
  function grille(c, L, X, R, y, u, p) {
    box(c, L, y - .36 * u, Math.max(0, X - L - 2.1 * u), .45 * u, STONE);
    box(c, X + 2.1 * u, y - .36 * u, R - X - 2.1 * u, .45 * u, STONE);
    if (p >= 1) return;
    var top = y - .93 * u, h = (1 - p) * .93 * u;
    for (var i = -5; i <= 5; i++) line(c, X + i * .38 * u, top, X + i * .38 * u, top + h, '#566F76', 4);
    line(c, X - 2.12 * u, top + h, X + 2.12 * u, top + h, '#D2B98C', 4);
  }
  F.world = function (R, s, m) {
    var c = R.ctx, u = R.ppm, p = m.point, y = R.Y(m.y), x = R.X(0), L = R.X(s.geo.xMin), right = R.X(s.geo.xMax);
    if (shot(R, 0, m.y, 4)) {
      if (m.kind === 'hoist') {
        hoist(c, L, x, right, y, u, m.opening);
        if (m.open && s.hero.y < m.y) {
          // Paint the newly exposed lane on the street itself, clear of the raised cargo.
          for (var i = 0; i < 3; i++) {
            var at = y + (.55 + i * .52) * u;
            line(c, x - .26 * u, at + .13 * u, x, at, '#FFDE91', .07 * u);
            line(c, x, at, x + .26 * u, at + .13 * u, '#FFDE91', .07 * u);
          }
        }
      }
      else if (m.kind === 'footbridge') bridge(c, L, x, right, y, u, m.opening);
      else if (m.kind === 'bell') stairs(c, L, x, right, y, u, m.opening);
      else grille(c, L, x, right, y, u, m.opening);
    }
    if(m.bellPosts)m.bellPosts.forEach(function(post){if(post!==p&&shot(R,post.x,post.y,2))P.WorkControls.draw(R,post,'bell',m.open);});
    if (m.lure && shot(R, m.lure.x, m.lure.y, 3)) bellPayoff(R, s, m);
    if (!m.open && m.kind !== 'musician' && shot(R, p.x, p.y, 2)) {
      if (!m.opening && (!m.weight || m.carrying)) ring(R, p);
      if (P.WorkControls.draw(R,p,m.kind,m.open)) { /* Current illustration owns the control. */ }
      else if (m.kind === 'bell') {
        var age = s.t - m.rungAt, turn = P.Settings && P.Settings.reduceMotion ? 0 : Math.sin(age * 12) * Math.max(0, .55 - age * .18);
        bell(c, R.X(p.x) + .5 * u, R.Y(p.y) - .62 * u, u * 1.08, m.rungAt === undefined ? p.progress * .30 : turn);
      } else wheel(c, R.X(p.x) + .4 * u, R.Y(p.y) - .37 * u, u, p.progress);
    }
    if (m.open && shot(R,p.x,p.y,2)) P.WorkControls.draw(R,p,m.kind,true);
    if (m.weight && !m.opening && !m.carrying && shot(R, m.weight.x, m.weight.y, 2)) {
      weight(c, R.X(m.weight.x), R.Y(m.weight.y) - .14 * u, u * 1.4);
    }
  };
  F.air = function (R, s) {
    var m = s.milestone;
    if (!m || !m.galata) return;
    if (m.guide && shot(R, m.guide.x, m.guide.y, 2)) {
      var v = m.guide;
      P.Sprites.civilian(R, { x: v.x, y: v.y, skin: 'musician', variant: 2, drift: 1, walk: v.walking ? v.y : 0, routeGuide: true });
      instrument(R, v);
    }
    if (m.weight && m.carrying && !m.opening) {
      var hand = P.InteractionActing.carryGrip(R, s);
      weight(R.ctx, hand.x, hand.y + .25 * R.ppm, R.ppm * .76);
    }
    s.enemyTele.forEach(function (tg) {
      if (!tg.counterweight) return;
      var p = Math.max(0, (tg.t / tg.T - .43) / .57), lift = 2.4 * (1 - p * p);
      line(R.ctx, R.X(tg.x), R.Y(tg.y + 3), R.X(tg.x), R.Y(tg.y + lift), '#907B6F', 1.5);
      weight(R.ctx, R.X(tg.x), R.Y(tg.y + lift), R.ppm);
    });
  };
  F.status = function (s, m, out) {
    if (m.kind === 'musician') {
      var g = m.guide;
      if (g.joined) out.key = g.pinned ? 'musicianPinned' : 'musicianEscort';
    } else if (m.rungAt !== undefined) {
      out.key = 'bellRinging'; out.detail = '';
    } else if (m.kind === 'footbridge' && m.carrying) out.key = 'footbridgeCarry';
    if (m.point.active) {
      out.key = m.kind + 'Use';
      out.detail = P.t('milestone.percent', { n: Math.floor(m.point.progress * 100) });
    }
    return out;
  };
  return F;
})();
