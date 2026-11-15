// Comic-book character busts for story panels (workstream B, view only). Bold ink outlines, flat colour,
// halftone dot shading on the shadow side, mood-driven brows/eyes/mouth and comic extras (sweat, tears,
// burst lines, stars). Unit box: x in [-0.5, 0.5], y in [-1, 0] (bottom centre anchor), total height = h.
P.Portraits = (function () {
  var PT = {}, INK = '#14151F', TAU = Math.PI * 2, SM = P.ArtRig.smooth, cache = {}, cacheN = 0, dots = null;
  PT.list = ['arda', 'anne', 'baba', 'usta', 'kaan', 'mila', 'ada', 'dede', 'ahmet', 'shopkeeper', 'news', 'stranger', 'zombie'];
  PT.moods = ['neutral', 'scared', 'angry', 'determined', 'sad', 'happy', 'shout', 'hurt'];

  // who -> look. Names: Arda (player), Anne = Mom Leyla, Baba = Dad Selim, Usta = the döner master (unnamed in docs),
  // friend = Kaan, shopkeeper = generic, news = generic anchor, stranger = generic, zombie = grotesque.
  var SPEC = {
    arda: { skin: '#E0AC80', skinS: '#C48A5E', hair: '#2A1A12', hairS: '#15100B', style: 'quiff', top: 'hoodie', topC: '#D7263D', topS: '#A81B2E', eyes: '#1E1712', buds: true, fw: 1, jw: 1 },
    anne: { skin: '#E8B894', skinS: '#C8906A', hair: '#4A3428', hairS: '#2B1E16', grey: '#B9B4AE', style: 'wavy', top: 'cardigan', topC: '#3A7C7A', topS: '#245B59', blouse: '#F4EBDD', earring: '#E9A23B', lines: true, fw: 0.97, jw: 0.98 },
    baba: { skin: '#C68B5E', skinS: '#A06B45', hair: '#3B3B40', hairS: '#222226', grey: '#9AA0A8', style: 'side', top: 'shirt', topC: '#9EC3DE', topS: '#7AA3C0', tie: '#2B3346', glasses: true, moustache: '#2A2A2E', lines: true, fw: 1, jw: 1.02 },
    usta: { skin: '#B88455', skinS: '#946338', hair: '#D9D9D9', hairS: '#AEAEAE', style: 'bald', top: 'chef', topC: '#F4F1EA', topS: '#CFC9BC', toque: true, moustache: '#E4E4E4', big: true, brow: '#D9D9D9', lines: true, fw: 1.05, jw: 1.05 },
    friend: { skin: '#C68B5E', skinS: '#9E6A40', hair: '#1E1712', hairS: '#0E0A07', style: 'buzz', beard: '#1E1712', top: 'jacket', topC: '#6B7A4A', topS: '#4E5A33', under: '#F4F1EA', fw: 1.12, jw: 1.1 },
    shopkeeper: { skin: '#D9A77C', skinS: '#B9825A', hair: '#8A8F98', hairS: '#66707A', style: 'bald', cap: '#5E5040', capS: '#40372B', top: 'apron', topC: '#E9E4D8', topS: '#CFC6B4', apron: '#2F5B8A', moustache: '#3B3B40', fw: 1, jw: 1 },
    news: { skin: '#F1C9A5', skinS: '#D4A07A', hair: '#14151F', hairS: '#0A0A10', style: 'side', top: 'suit', topC: '#2B3346', topS: '#1B2030', shirt: '#F4F1EA', tie: '#7A2E2E', fw: 1, jw: 1 },
    stranger: { skin: '#9C6B47', skinS: '#7A4F32', hair: '#2A2420', hairS: '#16120F', style: 'beanie', beanie: '#3D6E9E', beanieS: '#2B4A6F', beard: '#2A2420', top: 'jacket', topC: '#4F7A4A', topS: '#38573A', fw: 1, jw: 1 },
    zombie: { skin: '#9EAB7F', skinS: '#7A8A60', hair: '#3B3B2A', hairS: '#23231A', style: 'matted', top: 'torn', topC: '#5B6E7E', topS: '#44535F', zombie: true, fw: 1.02, jw: 0.98 }
  };
  // Brows: [inner dy, outer dy, tilt]. lid: eye height. mouth: smile (+) / frown (-). open: mouth open 0..1.
  var MOOD = {
    neutral: { brow: [0, 0, 0], lid: 1, mouth: 0.1, open: 0 },
    scared: { brow: [-0.05, -0.05, 0], lid: 1.25, mouth: -0.05, open: 0.45, sweat: true },
    angry: { brow: [0.05, 0.02, 0], lid: 0.7, mouth: -0.12, open: 0, teeth: true, vein: true, burst: '#D7263D' },
    determined: { brow: [0.03, 0.01, 0], lid: 0.78, mouth: 0, open: 0, line: true, glow: true },
    sad: { brow: [-0.06, 0.03, 0], lid: 0.85, mouth: -0.2, open: 0, tear: true },
    happy: { brow: [-0.02, -0.02, 0], lid: 0.5, mouth: 0.35, open: 0.35, arcs: true, sparkle: true },
    shout: { brow: [0.04, -0.03, 0], lid: 1, mouth: 0, open: 0.85, burst: '#FFD166' },
    hurt: { brow: [0.04, 0.02, 0], lid: 0.35, mouth: -0.25, open: 0, stars: true, bruise: true }
  };

  function dotPattern(ctx) {
    if (!ctx.createPattern || typeof DOMMatrix === 'undefined') return null;
    if (!dots) {
      var cv = document.createElement('canvas'), g; cv.width = 8; cv.height = 8; g = cv.getContext('2d');
      g.fillStyle = INK; g.beginPath(); g.arc(4, 4, 2.4, 0, TAU); g.fill(); dots = cv;
    }
    var p = ctx.createPattern(dots, 'repeat');
    if (p && p.setTransform) p.setTransform(new DOMMatrix().scale(0.034 / 8));
    return p;
  }
  // Fill a path in base colour, halftone its right-hand side, then ink-outline it.
  function part(ctx, path, col, lw, o, halftone) {
    ctx.fillStyle = col; ctx.fill(path);
    if (halftone && o.pat) {
      ctx.save(); ctx.clip(path); ctx.globalAlpha = 0.5; ctx.fillStyle = o.pat; ctx.fillRect(0.06, -1.3, 0.7, 1.4); ctx.restore();
    }
    if (o.outline !== false) { ctx.strokeStyle = INK; ctx.lineWidth = lw || 0.026; ctx.lineJoin = 'round'; ctx.stroke(path); }
  }
  function line(ctx, pts, w, col) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    if (pts.length === 3) ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
    else for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.strokeStyle = col || INK; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  }
  function poly(pts) { var p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
  function rect(x, y, w, h) { var p = new Path2D(); p.rect(x, y, w, h); return p; }

  function burst(ctx, col) {
    var i, a, r = 1.1;
    ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = col;
    for (i = 0; i < 18; i++) {
      a = i * TAU / 18;
      ctx.beginPath(); ctx.moveTo(0, -0.62); ctx.lineTo(Math.cos(a - 0.09) * r, -0.62 + Math.sin(a - 0.09) * r); ctx.lineTo(Math.cos(a + 0.09) * r, -0.62 + Math.sin(a + 0.09) * r); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function hair(ctx, S, o) {
    var st = S.style, c = S.hair, s = S.hairS, lw = 0.026;
    if (st === 'wavy' || st === 'matted') part(ctx, SM(st === 'wavy' ? [[-0.27, -0.9], [0, -1.04], [0.27, -0.9], [0.31, -0.5], [0.27, -0.2], [0.12, -0.24], [0, -0.18], [-0.12, -0.24], [-0.27, -0.2], [-0.31, -0.5]] : [[-0.26, -0.9], [-0.12, -1.0], [0.06, -1.01], [0.2, -0.92], [0.22, -0.7], [0.1, -0.84], [-0.04, -0.8], [-0.2, -0.74]]), c, lw, o, true);
  }
  function hairFront(ctx, S, o) {
    var st = S.style, c = S.hair, lw = 0.026, P1 = null;
    if (S.beanie) {
      part(ctx, SM([[-0.24, -0.7], [-0.25, -0.88], [-0.14, -1.0], [0, -1.06], [0.14, -1.0], [0.25, -0.88], [0.24, -0.72], [0.2, -0.76], [0, -0.8], [-0.2, -0.76]]), S.beanie, lw, o, true);
      line(ctx, [[-0.23, -0.77], [0.23, -0.77]], 0.04, S.beanieS); return;
    }
    if (st === 'bald') {
      part(ctx, SM([[-0.22, -0.66], [-0.24, -0.82], [-0.16, -0.9], [-0.14, -0.8], [-0.19, -0.7]]), c, lw, o, true);
      part(ctx, SM([[0.22, -0.66], [0.24, -0.82], [0.16, -0.9], [0.14, -0.8], [0.19, -0.7]]), c, lw, o, true); return;
    }
    if (st === 'buzz') { part(ctx, SM([[-0.21, -0.68], [-0.22, -0.86], [0, -1.0], [0.21, -0.86], [0.21, -0.7], [0.1, -0.76], [-0.1, -0.76]]), c, lw, o, true); return; }
    if (st === 'wavy' || st === 'bob') { part(ctx, SM([[-0.2, -0.7], [-0.22, -0.86], [-0.1, -0.97], [0.04, -0.99], [0.2, -0.9], [0.22, -0.72], [0.14, -0.8], [0, -0.78], [-0.12, -0.8]]), c, lw, o, true); return; }
    if (st === 'matted') return;
    P1 = SM([[-0.22, -0.66], [-0.23, -0.84], [-0.12, -0.96], [0.02, -1.02], [0.16, -0.96], [0.23, -0.82], [0.21, -0.68], [0.12, -0.74], [0.04, -0.7], [-0.06, -0.76], [-0.16, -0.7]]);
    if (st === 'side') { part(ctx, P1, c, lw, o, true); line(ctx, [[-0.05, -0.99], [0.02, -0.8]], 0.012, S.hairS); return; }
    part(ctx, P1, c, lw, o, true);
    if (st === 'quiff') part(ctx, SM([[-0.02, -0.98], [0.04, -1.18], [0.16, -1.2], [0.12, -1.08], [0.22, -1.0], [0.1, -0.96]]), c, lw, o, true);
    if (st === 'bun') part(ctx, R2(0, -1.04, 0.09, 0.09), c, 0.02, o, true);
  }
  function R2(x, y, rx, ry) { var p = new Path2D(); p.ellipse(x, y, rx, ry, 0, 0, TAU); return p; }

  // Build the head/face. mood + talk drive the features.
  function face(ctx, S, m, o, talk) {
    var fw = S.fw || 1, jw = S.jw || 1, zombie = !!S.zombie, open = Math.max(m.open || 0, talk || 0) * 0.9, ex = 0.085, ey = -0.68;
    part(ctx, SM([[0, -0.97], [0.13, -0.94], [0.2 * fw, -0.8], [0.21 * fw, -0.66], [0.17 * jw, -0.5], [0, -0.43], [-0.17 * jw, -0.5], [-0.21 * fw, -0.66], [-0.2 * fw, -0.8], [-0.13, -0.94]]), S.skin, 0.026, o, true);
    part(ctx, R2(-0.2 * fw, -0.66, 0.04, 0.07), S.skin, 0.02, o, false); part(ctx, R2(0.2 * fw, -0.66, 0.04, 0.07), S.skin, 0.02, o, false);
    if (zombie) zombieFace(ctx, S, m, o, open); else humanEyes(ctx, S, m, ex, ey, o);
    var by = -0.76;
    [-1, 1].forEach(function (s) {
      line(ctx, [[s * 0.035, by + m.brow[0]], [s * 0.14, by - 0.01 + m.brow[1]]], 0.03, S.brow || INK);
    });
    if (m.line) line(ctx, [[-0.04, -0.82], [0.04, -0.82]], 0.012, INK);
    line(ctx, [[0, -0.64], [0.03, -0.57]], 0.014, '#5A3A28');
    if (S.lines) { line(ctx, [[-0.11, -0.56], [-0.15, -0.5]], 0.012); line(ctx, [[0.11, -0.56], [0.15, -0.5]], 0.012); }
    mouthOf(ctx, S, m, open, zombie);
    if (S.moustache) moustache(ctx, S, o);
    if (S.beard) beard(ctx, S, o);
    if (S.big) line(ctx, [[-0.02, -0.53], [0.02, -0.53]], 0.01, INK);
  }
  function humanEyes(ctx, S, m, ex, ey, o) {
    var lid = m.lid, i, cx;
    for (i = -1; i <= 1; i += 2) {
      cx = i * ex;
      if (m.arcs) { line(ctx, [[cx - 0.05, ey + 0.01], [cx, ey - 0.05], [cx + 0.05, ey + 0.01]], 0.022); continue; }
      ctx.beginPath(); ctx.ellipse(cx, ey, 0.045, 0.034 * lid, 0, 0, TAU); ctx.fillStyle = '#FFFFFF'; ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 0.013; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 0.004, ey + 0.004, 0.022, 0, TAU); ctx.fillStyle = S.eyes || INK; ctx.fill();
      ctx.beginPath(); ctx.arc(cx - 0.008, ey - 0.008, 0.007, 0, TAU); ctx.fillStyle = '#FFFFFF'; ctx.fill();
      line(ctx, [[cx - 0.05, ey - 0.005], [cx + 0.05, ey - 0.005]], 0.02);
    }
  }
  function zombieFace(ctx, S, m, o, open) {
    var i, cx, ey = -0.68;
    for (i = -1; i <= 1; i += 2) {
      cx = i * 0.085;
      ctx.beginPath(); ctx.ellipse(cx, ey, 0.06, 0.05, 0, 0, TAU); ctx.fillStyle = '#2A2F22'; ctx.fill();
      ctx.save(); ctx.shadowColor = '#B8FF5A'; ctx.shadowBlur = 0.05 * (o.h || 200); ctx.beginPath(); ctx.arc(cx, ey, 0.03 * (0.8 + 0.2 * m.lid), 0, TAU); ctx.fillStyle = '#E8FF6B'; ctx.fill(); ctx.restore();
    }
    if (m.vein) line(ctx, [[0.2, -0.86], [0.26, -0.8], [0.22, -0.74]], 0.012, '#8A2A2A');
    if (m.bruise) { ctx.globalAlpha = 0.6; ctx.fillStyle = '#4A2A5A'; ctx.beginPath(); ctx.ellipse(-0.14, -0.6, 0.05, 0.035, 0.4, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  }
  function mouthOf(ctx, S, m, open, zombie) {
    var y = -0.5, w = 0.1, c = m.mouth;
    if (zombie || open > 0.12) {
      ctx.beginPath(); ctx.ellipse(0, y + 0.005, w * (0.6 + 0.4 * (zombie ? 1 : open)), 0.012 + 0.07 * (zombie ? 0.7 : open), 0, 0, TAU);
      ctx.fillStyle = '#3A1418'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.012; ctx.stroke();
      if (zombie) { ctx.fillStyle = '#E8E4CC'; for (var i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 0.025 - 0.012, y - 0.01); ctx.lineTo(i * 0.025, y + 0.02); ctx.lineTo(i * 0.025 + 0.012, y - 0.01); ctx.fill(); } }
      else if (m.teeth || open > 0.5) { ctx.fillStyle = '#F4F1EA'; ctx.fillRect(-w * 0.6, y - 0.03, w * 1.2, 0.03); }
      if (zombie) { ctx.fillStyle = 'rgba(184,216,140,0.8)'; ctx.beginPath(); ctx.ellipse(0.06, y + 0.12, 0.012, 0.03, 0, 0, TAU); ctx.fill(); }
      return;
    }
    if (m.teeth) { ctx.fillStyle = '#F4F1EA'; ctx.fillRect(-w * 0.7, y - 0.012, w * 1.4, 0.024); line(ctx, [[-w, y], [0, y + 0.01], [w, y]], 0.018); return; }
    line(ctx, [[-w, y - 0.005], [0, y + c * 0.2], [w, y - 0.005]], 0.02);
  }
  function moustache(ctx, S, o) {
    var col = S.moustache, big = S.big;
    part(ctx, SM([[-0.1, -0.545], [0, -0.53], [0.1, -0.545], [0.08, -0.505], [0, -0.52], [-0.08, -0.505]]), col, 0.014, o, big ? true : false);
    if (big) part(ctx, SM([[-0.14, -0.54], [-0.1, -0.5], [-0.12, -0.56]]), col, 0.01, o, false);
  }
  function beard(ctx, S, o) {
    part(ctx, SM([[-0.2, -0.66], [-0.17, -0.48], [0, -0.38], [0.17, -0.48], [0.2, -0.66], [0.13, -0.5], [0, -0.48], [-0.13, -0.5]]), S.beard, 0.014, o, true);
  }
  // Top (shoulders), neck, collars, accessories.
  function top(ctx, S, m, o) {
    var t = S.top, lw = 0.034, col = S.topC, sh = S.topS;
    if (t === 'torn') {
      part(ctx, poly([[-0.5, 0], [-0.46, -0.22], [-0.3, -0.3], [-0.14, -0.36], [0, -0.37], [0.14, -0.36], [0.3, -0.3], [0.46, -0.22], [0.5, 0], [0.4, -0.03], [0.3, -0.06], [0.2, -0.02], [0.1, -0.07], [-0.1, -0.03], [-0.2, -0.07], [-0.3, -0.02], [-0.4, -0.04]]), col, lw, o, true);
      part(ctx, poly([[-0.14, -0.36], [0, -0.3], [0.14, -0.36]]), '#8A9AA8', 0.014, o, false);
    } else {
      part(ctx, SM([[-0.5, 0], [-0.48, -0.2], [-0.36, -0.3], [-0.14, -0.36], [0, -0.37], [0.14, -0.36], [0.36, -0.3], [0.48, -0.2], [0.5, 0]]), col, lw, o, true);
    }
    part(ctx, rect(-0.09, -0.48, 0.18, 0.3), S.skinS, 0.018, o, false);
    if (t === 'hoodie') {
      line(ctx, [[-0.05, -0.34], [-0.06, -0.2]], 0.012, '#F4F1EA'); line(ctx, [[0.05, -0.34], [0.06, -0.2]], 0.012, '#F4F1EA');
      part(ctx, SM([[-0.16, -0.38], [0, -0.3], [0.16, -0.38], [0.12, -0.42], [-0.12, -0.42]]), sh, 0.014, o, false);
    }
    if (t === 'shirt' || t === 'suit') { var shirtC = S.shirt || S.blouse || '#F4F1EA'; part(ctx, poly([[-0.08, -0.36], [0, -0.28], [0.08, -0.36]]), shirtC, 0.014, o, false); }
    if (t === 'suit') { part(ctx, poly([[-0.14, -0.36], [-0.05, -0.36], [0, -0.26], [-0.2, -0.04], [-0.3, -0.2]]), sh, 0.02, o, true); part(ctx, poly([[0.14, -0.36], [0.05, -0.36], [0, -0.26], [0.2, -0.04], [0.3, -0.2]]), sh, 0.02, o, true); }
    if (S.tie) part(ctx, poly([[-0.03, -0.34], [0.03, -0.34], [0.02, -0.2], [0.0, -0.16], [-0.02, -0.2]]), S.tie, 0.012, o, false);
    if (t === 'cardigan') line(ctx, [[0, -0.34], [0, -0.02]], 0.014);
    if (t === 'apron') { part(ctx, rect(-0.25, -0.22, 0.5, 0.22), S.apron, 0.02, o, true); for (var k = -2; k <= 2; k++) line(ctx, [[k * 0.1 - 0.02, -0.2], [k * 0.1 + 0.02, -0.02]], 0.01, S.topS); }
    if (t === 'jacket' && S.under) part(ctx, poly([[-0.1, -0.36], [0, -0.28], [0.1, -0.36], [0.08, -0.04], [-0.08, -0.04]]), S.under, 0.014, o, false);
  }
  // Pieces that sit over the head: headwear, earbuds, earring, glasses. Drawn after the face.
  function overlay(ctx, S, o) {
    if (S.cap) { part(ctx, R2(0, -0.92, 0.22, 0.14), S.cap, 0.024, o, true); part(ctx, SM([[-0.1, -0.84], [0.1, -0.84], [0.32, -0.78], [0.3, -0.8], [0.05, -0.82], [-0.1, -0.82]]), S.capS, 0.02, o, true); }
    if (S.toque) part(ctx, rect(-0.2, -1.2, 0.4, 0.26), S.topC, 0.026, o, true);
    if (S.buds) { line(ctx, [[0.2, -0.66], [0.22, -0.4], [0.16, -0.12]], 0.024); line(ctx, [[0.2, -0.66], [0.22, -0.4], [0.16, -0.12]], 0.01, '#F4F1EA'); }
    if (S.earring) { ctx.beginPath(); ctx.arc(-0.2, -0.56, 0.02, 0, TAU); ctx.fillStyle = S.earring; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.008; ctx.stroke(); }
    if (S.glasses) glasses(ctx, o);
  }
  function glasses(ctx, o) {
    ctx.save(); ctx.lineWidth = 0.014; ctx.strokeStyle = INK; ctx.fillStyle = 'rgba(190,230,255,0.3)';
    [-1, 1].forEach(function (s) { ctx.beginPath(); ctx.rect(s * 0.085 - 0.05, -0.7, 0.1, 0.07); ctx.fill(); ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(-0.035, -0.67); ctx.lineTo(0.035, -0.67); ctx.stroke(); ctx.restore();
  }
  // Comic extras drawn over the head (sweat, tears, sparkles, stars).
  function extras(ctx, m, S, o) {
    if (m.sweat) drop(ctx, 0.25, -0.9, '#CFEFFF');
    if (m.tear) drop(ctx, -0.12, -0.6, '#9FE3FF');
    if (m.sparkle) { star(ctx, -0.3, -0.92, 0.05, '#FFD166'); star(ctx, 0.3, -0.96, 0.04, '#FFD166'); }
    if (m.stars) { star(ctx, -0.3, -0.98, 0.07, '#FFD166'); star(ctx, 0.3, -0.92, 0.06, '#FFD166'); star(ctx, 0.0, -1.14, 0.05, '#FFD166'); }
  }
  function drop(ctx, x, y, col) {
    ctx.beginPath(); ctx.moveTo(x, y - 0.06); ctx.quadraticCurveTo(x + 0.05, y, x, y + 0.04); ctx.quadraticCurveTo(x - 0.05, y, x, y - 0.06); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.012; ctx.stroke();
  }
  function star(ctx, x, y, r, col) {
    ctx.beginPath(); for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4, rr = i % 2 ? r * 0.4 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.012; ctx.stroke();
  }

  // Layer order: background burst/glow, shoulders, back hair, face, front hair, headwear and accessories, comic extras.
  function drawBust(ctx, S, m, o, talk) {
    if (m.burst) burst(ctx, m.burst);
    if (m.glow) { ctx.save(); ctx.globalAlpha = 0.35; var g = ctx.createRadialGradient(0, -0.6, 0.05, 0, -0.6, 0.6); g.addColorStop(0, '#FFF3C4'); g.addColorStop(1, 'rgba(255,243,196,0)'); ctx.fillStyle = g; ctx.fillRect(-0.6, -1.3, 1.2, 1.4); ctx.restore(); }
    o.pat = dotPattern(ctx);
    top(ctx, S, m, o);
    hair(ctx, S, o);
    face(ctx, S, m, o, talk);
    hairFront(ctx, S, o);
    overlay(ctx, S, o);
    extras(ctx, m, S, o);
  }
  // Draw a bust, bottom-centred at (x, y) in ctx pixels with total height h.
  PT.draw = function (ctx, who, mood, x, y, h, opts) {
    if (P.ComicBusts && P.ComicBusts.draw) { P.ComicBusts.draw(ctx, who, mood, x, y, h, opts || {}); return; }
    var o = opts || {}, S = SPEC[who] || SPEC.stranger, m = MOOD[mood] || MOOD.neutral;
    ctx.save(); ctx.translate(x, y); ctx.scale((o.flip ? -1 : 1) * h, h);
    if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    o.h = h;
    drawBust(ctx, S, m, o, o.talk || 0);
    ctx.restore();
  };
  // Cached transparent canvas for DOM use. Canvas is 1.12h wide and 1.26h tall; bust bottom sits 0.02h above the edge.
  PT.canvas = function (who, mood, h) {
    var key = who + '|' + mood + '|' + Math.round(h), e = cache[key], W, H, cv, g, dpr;
    if (e) return e;
    if (cacheN > 120) { cache = {}; cacheN = 0; }
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    W = Math.ceil(h * 1.12); H = Math.ceil(h * 1.26);
    cv = document.createElement('canvas'); cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    g = cv.getContext('2d'); g.scale(dpr, dpr);
    PT.draw(g, who, mood, W / 2, H - 0.02 * h, h, {});
    cache[key] = cv; cacheN++;
    return cv;
  };
  return PT;
})();
