// Raster props, vehicles, pickups, effects and weapon cards behind ?art=raster (D-066). View only: the simulation never reads it,
// and it never reads P.Quality. Every entry point is a guarded hook: it returns false (and draws nothing) when the flag is off,
// the category is not ready, the id has no mapping, or the handoff keeps that element procedural (IMPLEMENTATION-HANDOFF.md).
// The caller then keeps its code art, so the flag-off draw-call log is unchanged. Atlases load on first use (P.ArtRaster.rect),
// so a level decodes only the hoods and kinds it draws.
//
// Entry points (P.ArtRasterItems):
//   block(R, kind, x, y, o)   a street block or a sidewalk slot (istanbul-props.js M.draw). The hood comes from o.theme (blocks)
//                             or o.rt (dressing). o.w, o.h are the sim footprint in metres (blocks). Vehicles draw here too.
//   tram(R, x, yR, yF, w)     the tram body (vehicles.js drawCar). The art has its own pantograph: the caller skips its live one.
//   xp(c, X, Y, value, u)     an XP gem (render.js drawDrops). Replaces the green diamond and its glint.
//   pickup(c, kind, X, Y, px) a consumable or objective icon inside its glow ring (consumables.js drawAt). px = icon size.
//   fxPart(R, p, a)           a blood splat (kind splat), a rubble chip (shard) or a dust puff (dust) (render.js).
//   icon(id, lv, px)          an <img> for a level-up card (a weapon's tier lv 1..5, or an evolution's icon) or the clean HUD icon
//                             of a weapon, or a passive (screens.js). '' when not ready or unknown.
// Kept procedural on purpose: hit sparks (fx_hit_sparks: WTier impacts), every live weapon shape (the tier sheets bake a motion
// trail and a halo, so in-world use would draw the trail twice), the held poses (no grip anchors in the manifest), the ring glow
// round pickups, and the enemy-specific effects. Unused manifest entries are listed in tools/test-art-raster-items.js.
P.ArtRasterItems = (function () {
  var I = {}, A = P.ArtRaster, TIER = ['tiers.l1', 'tiers.l2', 'tiers.l3', 'tiers.l4', 'tiers.l5'], FR = ['a', 'b', 'c'];
  var PROPS = 'props', VEH = 'vehicles', WPN = 'weapons', PK = 'pickups', FX = 'effects', LOOT = 'pk_loot_consumables';
  var K = {
    // View theme -> hood id (journey.js). Galata, Bridge and Saray are hand-wired and stay on their own loaders.
    themeHood: { istiklal: 'istiklal', karakoy: 'karakoy', eminonu: 'eminonu', sirkeci: 'sirkeci', bazaar: 'kapalicarsi',
      beyazit: 'beyazit', kumkapi: 'kumkapi', halic: 'halic', yenikapi: 'yenikapi', samatya: 'samatya', yedikule: 'yedikule',
      kazlicesme: 'kazlicesme', zeytinburnu: 'zeytinburnu', bakirkoy: 'bakirkoy', sahil: 'bakirkoysahil', marina: 'atakoysahil',
      atakoy: 'atakoy' },
    // Sim kind -> vehicle asset. The vehicle set is the canonical car, taxi and boat art. The taxi boss and the courier keep
    // their composite character frames (art-raster-chars covers them), so scooter_kurye and taksici_yellow stay unused there.
    vehicleOf: { car: 'car_parked', taxi: 'taksici_yellow', dolmus: 'dolmus', ferry: 'ferry', yacht: 'boat_yacht', rowboat: 'boat_fishing' },
    // Sim kind -> prop item candidates; the first one the hood's atlas has is drawn. Kit kinds (journey.js) and sidewalk dressing.
    propItems: {
      tables: ['cafetable', 'teatable', 'mezetable'], tavlatable: ['teatable', 'cafetable'], cafe: ['cafetable'],
      cart: ['simitcart', 'chestnutcart', 'teacart', 'gozlemecart', 'fabriccart', 'luggagecart', 'gardencart', 'handcart', 'corncart', 'fishicecart', 'icecreamcart'],
      simit: ['simitcart'], kestane: ['chestnutcart'], misir: ['corncart'], dondurma: ['icecreamcart'], cay: ['teacart', 'teaglasses'],
      bin: ['bin'], bench: ['bench'], planter: ['planter'], bollard: ['bollard'], barrier: ['safetybarrier', 'tramstopbarrier'],
      tree: ['tree', 'planetree', 'palmtree'], cinar: ['tree', 'planetree'], palm: ['palmtree'], geranium: ['flowerpot'], cicek: ['flowerpot'],
      crates: ['fishcrate', 'breadcrate', 'bookcrate', 'gearcrate'], lx_stall: ['spicestall', 'bookstall', 'pastrystall'],
      baharat: ['spicestall', 'spicesacks'], kiosk: ['ticketkiosk', 'tostkiosk'], antique: ['antiquestand'], mangal: ['barbecue'],
      hali: ['kilim', 'rolledcarpets'], lx_boat: ['mooredboat', 'fishingboat'], lx_truck: ['truck'], meyhane: ['mezetable']
    },
    tram: 'tram_red',
    across: 0.6,                                        // share of a vehicle's art height that is its footprint breadth (measured on the art)
    tramShadow: 0.2, tramShadowDx: 0.12,                // the code tram's ground shadow (alpha, offset in m, lower right)
    tramPadW: 0.2, tramPadL: 0.1,                       // the shadow's extra breadth and length (m) round the body
    xpM: { small: 0.42, medium: 0.5, large: 0.6 },      // XP gem size, tip to tip (m)
    xpMedAt: 4, xpLargeAt: 9,                           // XP values (combat.js: enemy xp x (1 + xpPct)) at which the size steps up
    splatK: 2.6, splatSmallAt: 0.2, splatLargeAt: 0.5,  // blood decal width per metre of radius; the cell follows the radius
    splatAlpha: 0.6, dustAlpha: 0.5,                    // decal alpha share (of the particle's life) for blood splats and dust puffs
    chipM: 0.2,                                         // rubble chip size (m, longest side)
    puffK: 2,                                           // dust puff diameter per metre of particle radius (render.js dust: 0.5 * (1.5 - a))
    iconDpr: 2,                                         // card and HUD images are drawn at this multiple of their CSS size
    iconRetry: { ms: 250, max: 40 }                     // a card or slot whose atlas is still decoding retries this often, this often
  };
  var SPLAT = { small: ['small_a', 'small_b'], medium: ['medium_a', 'medium_b'], large: ['large_a', 'large_b'] };
  var XPF = { small: 'xp_small_a', medium: 'xp_medium_a', large: 'xp_large_a' };
  var CHIP = { wood: ['wood_a', 'wood_b'], glass: ['plaster_a', 'plaster_b'], stone: ['stone_a', 'stone_b'] };
  var PICKUP = { simit: 'simit', jeton: 'jeton', chest: 'chest_closed', eczane: 'heal_cross', crate: 'objective_pin' };
  var PICK = Object.create(null), ICONS = Object.create(null);

  function on(cat) { return !!(A && A.enabled() && A.ready(cat)); }
  // Draws rect r centred on (X, Y): kx and ky are CSS px per atlas px along the local x and y, turned by rot (rad, screen space).
  // Source-over always (the air pass is additive and the art is not); the context state is restored after the draw.
  function place(c, r, X, Y, kx, ky, rot, alpha) {
    var w = r.sw * kx, h = r.sh * ky;
    c.save();
    c.globalCompositeOperation = 'source-over';
    if (alpha !== undefined) c.globalAlpha *= alpha;
    c.translate(X, Y);
    if (rot) c.rotate(rot);
    c.drawImage(r.img, r.sx, r.sy, r.sw, r.sh, -w / 2, -h / 2, w, h);
    c.restore();
    return true;
  }
  // Uniform fit: px is the rect's longest side in CSS px.
  function fit(c, r, X, Y, px, alpha) { var k = px / Math.max(r.sw, r.sh); return place(c, r, X, Y, k, k, 0, alpha); }

  // ---- props ----
  // The manifest keys props by hood (the hood's atlas and its items under 'items'), so an item is a frame of the hood entry:
  // rect(props, hood, 'items.<item>.cells.<variant>'). Per hood and kind: { frames: [a, b, c], pxPerM } for the first candidate
  // item the hood has, or null. Cached once the manifest is ready (callers check on() first).
  function propId(hood, kind) {
    var by = PICK[hood] || (PICK[hood] = Object.create(null)), cands = K.propItems[kind] || [], h, i, name, hit = null;
    if (by[kind] !== undefined) return by[kind];
    h = A.entry(PROPS, hood);
    for (i = 0; i < cands.length && !hit; i++) {
      name = cands[i];
      if (h && h.items && h.items[name]) hit = { frames: FR.map(function (v) { return 'items.' + name + '.cells.' + v; }), pxPerM: h.cellPx * h.scale };
    }
    return (by[kind] = hit);
  }
  I.itemOf = function (hood, kind) { return on(PROPS) ? !!propId(hood, kind) : false; };
  // Variant index from the block's pick (o.v, 0..1) or the dressing slot (o.k, 0..3): 0 a, 1 b, 2 c.
  function variantOf(o) {
    var v = o.v !== undefined ? o.v : (o.k || 0) / 4;
    return Math.min(FR.length - 1, Math.max(0, Math.floor(v * FR.length)));
  }
  // Feet anchor: the prop's pivot (px, py: bottom centre of the lowest rows) lands on the footprint centre (X, Y). The scale is the
  // hood's atlas pixels per metre (cellPx x scale in the manifest). A variant the item lacks falls back to cell a.
  function propDraw(R, kind, x, y, o) {
    var hood = K.themeHood[o.theme || o.rt], id, r, s, X, Y;
    if (!hood || !on(PROPS)) return false;
    id = propId(hood, kind);
    if (!id) return false;
    r = A.rect(PROPS, hood, id.frames[variantOf(o)]) || A.rect(PROPS, hood, id.frames[0]);
    if (!r) return false;
    s = R.ppm / id.pxPerM; X = R.X(x); Y = R.Y(y);
    return place(R.ctx, r, X - r.px * s + r.sw * s / 2, Y - r.py * s + r.sh * s / 2, s, s, 0, undefined);
  }

  // ---- vehicles ----
  // Drawn by length (o.h, the block's footprint along the street) and breadth (o.w). Water craft without a footprint take the
  // manifest's metres. The art is landscape, so it is turned a quarter turn: the long side runs along the street (y).
  function vehicleDraw(R, kind, x, y, o) {
    var vid = K.vehicleOf[kind], V, r, len, wid, fp;
    if (!vid || !on(VEH)) return false;
    V = A.entry(VEH, vid);
    r = A.rect(VEH, vid, 'frame');
    if (!V || !r) return false;
    fp = o.w && o.h;                    // a block carries its footprint (o.w, o.h); a dressing slot's o.h is not one
    len = fp ? o.h : V.metres.long;
    wid = fp ? o.w : V.metres.wide;
    return place(R.ctx, r, R.X(x), R.Y(y), len * R.ppm / r.sw, wid * R.ppm / (r.sh * K.across), Math.PI / 2, 1);
  }
  // A street block or a sidewalk slot: a vehicle when the kind has one, else a prop of the hood. False: the caller draws the code art.
  I.block = function (R, kind, x, y, o) {
    if (!R || !R.ctx || !o) return false;
    return vehicleDraw(R, kind, x, y, o) || propDraw(R, kind, x, y, o);
  };
  // The tram body from the rear edge yR to the front yF (metres), w wide, shifted sway px (the rush). The art is the whole tram,
  // pantograph included, and has no ground shadow: the code tram's soft shadow is painted first, lower right, as before.
  I.tram = function (R, x, yR, yF, w, sway) {
    var r, c = R.ctx, L = yF - yR, u = R.ppm, X = R.X(x) + (sway || 0), Y = R.Y((yR + yF) / 2);
    if (!on(VEH)) return false;
    r = A.rect(VEH, K.tram, 'frame');
    if (!r) return false;
    c.save();
    c.fillStyle = 'rgba(0,0,0,' + K.tramShadow + ')';
    c.fillRect(X + K.tramShadowDx * u - (w + K.tramPadW) * u / 2, Y + K.tramShadowDx * u - (L + K.tramPadL) * u / 2,
      (w + K.tramPadW) * u, (L + K.tramPadL) * u);
    c.restore();
    return place(c, r, X, Y, L * u / r.sw, w * u / (r.sh * K.across), Math.PI / 2, 1);
  };

  // ---- pickups ----
  I.xp = function (c, X, Y, value, u) {
    var tier = value >= K.xpLargeAt ? 'large' : value >= K.xpMedAt ? 'medium' : 'small', r;
    if (!on(PK)) return false;
    r = A.rect(PK, 'pk_xp_droplets', XPF[tier]);
    return !!r && fit(c, r, X, Y, K.xpM[tier] * u);
  };
  I.pickup = function (c, kind, X, Y, px) {
    var name = PICKUP[kind], r;
    if (!name || !on(PK)) return false;
    r = A.rect(PK, LOOT, name);
    return !!r && fit(c, r, X, Y, px);
  };

  // ---- effects ----
  function splatCell(p) {
    var cell = p.r < K.splatSmallAt ? 'small' : p.r > K.splatLargeAt ? 'large' : 'medium';
    return SPLAT[cell][(p.seed || 0) < 0.5 ? 0 : 1];
  }
  function cellOf(p) { if (p.ri === undefined) p.ri = Math.random() < 0.5 ? 0 : 1; return p.ri; }   // the particle keeps its cell
  function splatPart(R, p, a) {
    var r, w = p.r * K.splatK * R.ppm;
    if (P.Settings && P.Settings.blood === false) return false;   // the ink setting keeps the code splat
    r = A.rect(FX, 'fx_blood_splats', splatCell(p));
    return !!r && place(R.ctx, r, R.X(p.x), R.Y(p.y), w / r.sw, w / r.sw, p.a, a * K.splatAlpha);
  }
  function chipPart(R, p) {
    var name = CHIP[p.col === 'glass' ? 'glass' : p.col === 'wood' ? 'wood' : 'stone'][cellOf(p)], r = A.rect(FX, 'fx_rubble_chips', name);
    return !!r && fit(R.ctx, r, R.X(p.x), R.Y(p.y), K.chipM * R.ppm);
  }
  function dustPart(R, p, a) {
    var r = A.rect(FX, 'fx_dust_smoke', cellOf(p) ? 'dust_b' : 'dust_a'), d = 0.5 * (1.5 - a) * K.puffK * R.ppm;
    return !!r && fit(R.ctx, r, R.X(p.x), R.Y(p.y), d, K.dustAlpha * a);
  }
  // Render.js particles, called before their code draw. a: the particle's life fraction (p.t / p.T).
  I.fxPart = function (R, p, a) {
    if (!on(FX) || !R || !R.ctx) return false;
    if (p.kind === 'splat') return splatPart(R, p, a);
    if (p.kind === 'shard') return chipPart(R, p);
    if (p.kind === 'dust') return dustPart(R, p, a);
    return false;
  };

  // ---- cards and HUD ----
  // A cell drawn into a small canvas once and cached as a data URL (the DOM cannot draw from an atlas directly).
  function cellUrl(cat, id, frame, px) {
    var key = cat + '|' + id + '|' + frame + '|' + px, u = ICONS[key], r, cv, g, k;
    if (u !== undefined) return u;
    r = A.rect(cat, id, frame);
    if (!r) return null;
    cv = document.createElement('canvas'); cv.width = cv.height = px;
    g = cv.getContext('2d'); k = px / Math.max(r.sw, r.sh);
    g.drawImage(r.img, r.sx, r.sy, r.sw, r.sh, (px - r.sw * k) / 2, (px - r.sh * k) / 2, r.sw * k, r.sh * k);
    return (ICONS[key] = cv.toDataURL('image/png'));
  }
  // [category, id, frame] for an item id: an evolution's icon cell, a base weapon's tier (lv 1..5) or its clean icon, or a passive.
  function iconSource(id, lv) {
    var evo = P.CFG.evolutions && P.CFG.evolutions[id];
    if (evo) return [WPN, evo.from, 'evolutions.' + id + '.icon'];
    if (A.entry(WPN, id)) return [WPN, id, lv >= 1 && lv <= TIER.length ? TIER[lv - 1] : 'icon'];
    if (A.rect(PK, 'pk_passive_icons', id)) return [PK, 'pk_passive_icons', id];
    return null;
  }
  I.icon = function (id, lv, px) {
    var src, u;
    if (!on(WPN) || typeof id !== 'string') return '';
    src = iconSource(id, lv);
    u = src ? cellUrl(src[0], src[1], src[2], Math.round(px * K.iconDpr)) : null;
    return u ? '<img src="' + u + '" alt="" width="' + px + '" height="' + px + '">' : '';
  };
  // Cards and HUD slots are built once, so an icon whose atlas is still decoding is retried (K.iconRetry) and swapped in when it
  // arrives. Until then the box shows the code icon. Flag off: no retry, the code icon only (the same markup as before).
  I.iconInto = function (box, id, lv, px, tries) {
    var html = I.icon(id, lv, px), n = tries || 0;
    box.innerHTML = html || P.Icons.svg(id, px);
    if (!html && on(WPN) && n < K.iconRetry.max) {
      setTimeout(function () { if (box.isConnected) I.iconInto(box, id, lv, px, n + 1); }, K.iconRetry.ms);
    }
  };
  I.config = K;   // read-only view for the tests and tools
  return I;
})();
