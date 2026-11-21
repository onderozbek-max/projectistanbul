P.EminonuFx = (function () {
  var F = {}, C = P.CFG.levels.eminonuMilestones;
  var INK = '#222731', WOOD = '#997451', BRASS = '#D7AA64', METAL = '#546B70';
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function ease(v) { return v * v * (3 - 2 * v); }
  function pct(v) { return P.t('milestone.percent', { n: Math.floor(clamp(v) * 100) }); }

  F.status = function (s, m, out) {
    if (m.cart && m.cart.started) {
      var q = m.cart;
      out.key = q.jammed ? 'marketCartClear' : q.walking ? 'marketCartMoving' : 'marketCartReturn';
      out.detail = pct((q.y - m.point.y) / (m.y - C.cart.loadingGap - m.point.y));
    } else if (m.sacks) {
      out.key = m.work&&m.work.active&&m.work.blocked ? 'kaanWorkBlocked' : m.carry ? 'marketSackCarry' : 'marketSacks';
      out.detail = m.delivered + ' / ' + m.sacks.length + (out.detail ? ' · ' + out.detail : '');
    } else if (m.signalT > 0) {
      var K = C.signal.cart;
      out.key = m.signalT <= K.lead ? 'marketSignalWarn' : 'marketSignalMoving';
    } else if (m.point.active) {
      out.key += 'Use'; out.detail = pct(m.point.progress);
    }
    return out;
  };

  F.camera = function (s, m) {
    if (m.open) return null;
    var h = s.hero, p = m.cart || m.point;
    var active = m.cart && m.cart.started ? 0.55 : m.signalT > 0 ? clamp(m.signalT * 2) : m.opening;
    if (!active) return null;
    var w = ease(clamp(1 - Math.hypot(h.x - p.x, h.y - p.y) / 6) * active);
    return { x: m.kind === 'marketAwning' ? C.awning.x * .4 : 0, y: (m.cart ? p.y + .6 : m.y - 1.35),
      zoom: 0.025, weight: w };
  };

  function box(c, x, y, w, h, fill) {
    c.fillStyle = fill; c.fillRect(x, y, w, h);
    c.strokeStyle = INK; c.lineWidth = 1.55; c.strokeRect(x, y, w, h);
  }
  function line(c, x, y, x1, y1, width, color) {
    c.beginPath(); c.moveTo(x, y); c.lineTo(x1, y1); c.lineWidth = width; c.strokeStyle = color; c.stroke();
  }
  function oval(c, x, y, w, h, fill) {
    c.beginPath(); c.ellipse(x, y, w, h, 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill();
  }

  function crank(R, p, done) {
    var c = R.ctx, u = R.ppm, x = R.X(p.x + .63), y = R.Y(p.y + .25);
    box(c, x - .24*u, y - .57*u, .48*u, .64*u, METAL);
    var a = p.progress * Math.PI * 2.6;
    oval(c, x, y - .36*u, .146*u, .146*u, INK);
    line(c, x, y - .36*u, x + Math.cos(a)*.33*u, y - .36*u + Math.sin(a)*.24*u, .087*u, BRASS);
    oval(c, x, y - .68*u, .095*u, .095*u, done ? '#B2DCA8' : BRASS);
  }

  function awning(R, s, m) {
    var c = R.ctx, u = R.ppm, A = C.awning, x = R.X(A.x), y = R.Y(m.y), half = A.half * u;
    box(c, R.X(s.geo.xMin), y - .48*u, x - half - R.X(s.geo.xMin), .63*u, '#917965');
    [x - half, x + half].forEach(function (side) {
      box(c, side - .09*u, y - 1.25*u, .18*u, 1.44*u, '#775C49');
    });
    var raise = ease(m.opening), top = y - 1.23*u, bottom = y + (.16 - 1.29*raise)*u;
    cloth(c, x - half, top, 2*half, Math.max(.10*u, bottom - top));
    line(c, x - half, top, x + half, top, .11*u, INK);
    line(c, x - half, bottom, x + half, bottom, .075*u, '#6D4A3D');
    if (raise > .08) {
      c.fillStyle = 'rgba(219,176,99,' + (.34*raise) + ')';
      c.fillRect(x - half + .17*u, y - .83*u, half*2 - .34*u, 1.22*u);
    }
  }

  function cloth(c, left, top, w, h) {
    if (P.StreetArt && P.StreetArt.current()) {
      if (!P.StreetArt.part(c, 'market-awning', left, top, w, h)) {
        c.fillStyle = '#806957'; c.fillRect(left, top, w, h);
      }
      return;
    }
    for (var i = 0; i < 8; i++) {
      c.fillStyle = i % 2 ? '#B5584A' : '#E2C59A';
      c.fillRect(left + i*w/8, top, w/8, h);
    }
  }

  function shutter(R, s, m) {
    var c = R.ctx, u = R.ppm, y = R.Y(m.y), a = R.X(s.geo.xMin), b = R.X(s.geo.xMax);
    var h = m.kind === 'marketGate' ? 1.45*u : .25*u, left = b - a, p = ease(m.opening);
    if (m.kind === 'marketGate') {
      if (P.StreetArt.current()) {
        var bays=Math.ceil(left/(4.2*u)),width=left/bays;
        c.save();c.beginPath();c.rect(a,y-h,left,Math.max(.16*u,h*(1-p)));c.clip();
        for(var bay=0;bay<bays;bay++) P.WorkStages.weather(c,3,a+(bay+.5)*width,y,u,width/u,h/u);
        c.restore();return;
      }
      var bottom = y - h*p;
      if (bottom > y - h + 1) {
        box(c, a, y - h, left, bottom - y + h, '#5F7176');
        for (var v = y-h + .14*u; v < bottom; v += .19*u) line(c, a, v, b, v, .035*u, '#354652');
      }
      box(c, a, y - h - .21*u, left, .25*u, '#AC8660');
    } else if (p < 0.999) {
      var w = (1-p)*left/2;
      box(c, a, y - h/2, w, h, WOOD);
      box(c, b-w, y - h/2, w, h, WOOD);
    }
  }

  var carryFrames = [[73,52,172,215],[393,52,174,216],[74,372,172,216],[348,436,263,117]];
  function marketPart(c, i, x, base, width) {
    var im = P.StreetArt.image('market-carry-reset'), f = carryFrames[i];
    if (!im) return;
    var h = width * f[3] / f[2];
    c.drawImage(im,f[0],f[1],f[2],f[3],x-width/2,base-h,width,h);
  }
  function sack(c, x, y, u, i, carried) {
    if (P.StreetArt.current()) {
      marketPart(c,i%3,x,y+(carried ? .65 : .18)*u,.64*u);
      return;
    }
    var color = ['#BE9164', '#A77C5E', '#C4A57D'][i % 3];
    c.beginPath(); c.moveTo(x-.19*u,y-.46*u); c.quadraticCurveTo(x-.43*u,y-.12*u,x-.32*u,y+.12*u);
    c.quadraticCurveTo(x,y+.24*u,x+.32*u,y+.12*u); c.quadraticCurveTo(x+.40*u,y-.14*u,x+.17*u,y-.46*u);
    c.closePath(); c.fillStyle = color; c.fill(); c.lineWidth = .047*u; c.strokeStyle = INK; c.stroke();
    line(c, x-.19*u, y-.39*u, x+.18*u, y-.39*u, .067*u, '#6F4B42');
    line(c, x-.16*u, y-.10*u, x+.13*u, y-.10*u, .057*u, i % 2 ? '#6D7F75' : '#9F6549');
  }
  F.workSack=function(c,x,y,u){marketPart(c,0,x,y+.20*u,.58*u);};

  function cart(R, x, y, horizontal, t, jammed) {
    if (P.StreetArt.current()) {
      var im=P.StreetArt.image('cart'), u=R.ppm, width=horizontal?2:1.65;
      if (im) R.ctx.drawImage(im,R.X(x)-width*.5*u,R.Y(y)-width*.56*u,width*u,width*im.naturalHeight/im.naturalWidth*u);
      return;
    }
    var c = R.ctx, u = R.ppm;
    var w = horizontal ? C.signal.cart.width : 1.45, l = horizontal ? C.signal.cart.length : 1.03;
    var px = R.X(x), py = R.Y(y), a = px - w*u/2, b = py - l*u/2;
    oval(c, px+.10*u, py+.13*u, w*.60*u, l*.60*u, 'rgba(25,29,37,.25)');
    [-1,1].forEach(function (side) {
      var wheel = px + side*w*.45*u, wy = py+l*.40*u;
      oval(c, wheel, wy, .20*u, .19*u, INK);
      oval(c, wheel, wy, .105*u, .104*u, '#97A09A');
      line(c, wheel-.101*u*Math.cos(t), wy-.101*u*Math.sin(t), wheel+.101*u*Math.cos(t), wy+.101*u*Math.sin(t), .035*u, INK);
    });
    box(c, a, b, w*u, l*u, horizontal ? '#587476' : WOOD);
    box(c, a+.10*u, b+.11*u, (w-.20)*u, (l-.19)*u, '#56534B');
    sack(c, px-.36*u, py-.09*u, u*.84, 0);
    sack(c, px+.36*u, py-.09*u, u*.84, 1);
    line(c, a, py+.42*l*u, a+w*u, py+.42*l*u, .083*u, horizontal ? '#ACC5AD' : BRASS);
    if (jammed) oval(c, px, b-.27*u, .091*u, .091*u, '#F7AB78');
  }

  function delivery(R, m) {
    var q = m.cart, c = R.ctx, u = R.ppm, t = (q.y - m.point.y)*4, gait = Math.sin(t*1.8)*.15*u;
    var x = R.X(q.x), y = R.Y(q.y - .95);
    cart(R, q.x, q.y, false, t, q.jammed);
    if (P.StreetArt.current()) {
      P.WorkStages.helper(c,q.walking?3+(Math.floor(q.y*4)&1):5,x,y,u,1);
      return;
    }
    [-1,1].forEach(function (side) {
      line(c, x + side*.36*u, y-.49*u, x + side*.33*u, y-.22*u, .072*u, '#69494A');
      line(c, x + side*.07*u, y+.08*u, x+side*.14*u, y+.29*u + side*gait, .151*u, '#394A55');
    });
    box(c, x-.22*u, y-.28*u, .44*u, .37*u, '#A96351');
    oval(c, x, y-.40*u, .18*u, .16*u, INK);
    oval(c, x, y-.43*u, .154*u, .127*u, '#A49D78');
    oval(c, x, y-.50*u, .16*u, .055*u, '#C3AE84');
  }

  function rails(R, s, m) {
    var c = R.ctx, u = R.ppm, K = C.signal.cart, y = R.Y(m.y - K.yBack);
    var a = R.X(s.geo.xMin), b = R.X(s.geo.xMax);
    if (m.point.progress >= 1 && !m.open && !m.opening) {
      c.fillStyle = 'rgba(213,141,77,.23)'; c.fillRect(a, y - K.length*u/2, b-a, K.length*u);
      c.setLineDash([.31*u,.18*u]);
      line(c, a, y+(K.length*.59)*u, b, y+(K.length*.59)*u, .075*u, '#F1BE78');
      c.setLineDash([]);
    }
    [-1,1].forEach(function (side) { line(c, a, y + side*.26*u, b, y + side*.26*u, .068*u, '#4F5A5C'); });
    var x = R.X(m.point.x + .65), sy = R.Y(m.point.y + .25);
    box(c, x-.17*u, sy-.76*u, .34*u, .64*u, INK);
    oval(c, x, sy-.55*u, .103*u, .103*u, m.open || m.opening ? '#92DEAC' : m.signalT ? '#F3BD69' : '#D26D55');
  }

  F.world = function (R, s, m) {
    var c = R.ctx, p = P.EminonuTrial.station(s, m);
    c.save();
    if (Math.abs(m.y - s.hero.y) < 24) {
      if (m.kind === 'marketAwning') awning(R, s, m); else shutter(R, s, m);
      if (m.kind === 'marketSignal') rails(R, s, m);
    }
    if (m.sacks) {
      var q = m.pallet, u = R.ppm;
      if (P.StreetArt.current()) marketPart(c,3,R.X(q.x),R.Y(q.y)+.43*u,1.26*u);
      else box(c, R.X(q.x)-.63*u, R.Y(q.y)-.44*u, 1.26*u, .86*u, WOOD);
      for (var i = 0; i < m.delivered; i++) {
        if(m.work&&m.work.active&&m.work.progress>.12&&i===m.work.finished)continue;
        sack(c, R.X(q.x)+(i-1)*.34*u, R.Y(q.y)+(m.work&&i>=m.work.finished?.18:-.15)*u, u*.58, i);
      }
      m.sacks.forEach(function (item, j) {
        if (item !== m.carry && !item.delivered) sack(c, R.X(item.x), R.Y(item.y), u, j);
      });
    } else if (!m.cart && Math.abs(p.y - s.hero.y) < 22) P.WorkControls.draw(R,p,m.kind,m.open);
    if (m.cart && m.cart.y - .95 >= s.hero.y && Math.abs(s.hero.y - m.cart.y) < 20) delivery(R, m);
    if (!m.open && !m.opening && !m.signalT && Math.abs(p.y - s.hero.y) < 23) {
      P.MilestoneFx.ring(R, p, m.cart && m.cart.started ? C.cart.followR : p.r, p.progress);
    }
    c.restore();
  };

  F.air = function (R, s) {
    var m = s.milestone, c = R.ctx;
    if (!m || !m.eminonu) return;
    c.save();
    if (m.cart && m.cart.y - .95 < s.hero.y && Math.abs(s.hero.y - m.cart.y) < 20) delivery(R, m);
    if (m.kind === 'marketSignal' && !m.open && Math.abs(s.hero.y - m.y) < 20) {
      cart(R, P.EminonuTrial.trolleyX(m.signalT), m.y - C.signal.cart.yBack, true, m.signalT*9, false);
    }
    if (m.carry) {
      var u = R.ppm, hand = P.InteractionActing.carryGrip(R, s);
      sack(c, hand.x, hand.y, u*.75, m.delivered, true);
    }
    c.restore();
  };

  F.tool = function (c, u, a) {
    c.rotate(-0.78 + ease(a.progress)*1.38);
    line(c, -.14*u, .07*u, .36*u, -.16*u, .134*u, INK);
    line(c, -.10*u, .05*u, .35*u, -.15*u, .062*u, BRASS);
  };
  return F;
})();
