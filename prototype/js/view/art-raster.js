// Raster art runtime (view only, D-066). Normal previews use the raster art, and ?art=current keeps the original art.
// The baseline benchmark opts in with ?art=raster. Reads assets/art/manifest.json (importer schema 1, see
// art/commission/IMPORTER.md) and draws rects from the atlases under assets/art/. Atlases load lazily, on the first request
// for their id. The title waits for Arda's atlas before a player run starts. File previews load a generated script with
// the same frame data because browsers block local JSON fetches.
// Pure view code: the simulation never reads it, and it never reads P.Quality.
//
// Public API (P.ArtRaster):
//   enabled()                       -> boolean. True when the preview uses raster art (decided once at load).
//   prepare()                       -> void. Loads the manifest once. Call at boot (main.js). No-op when disabled.
//   ready(category)                 -> boolean. The manifest is parsed and the category has entries. Per-sprite readiness
//                                      is rect(): the atlas for an id may still be loading after ready() is true.
//   entry(category, id)             -> the manifest entry (heightPx, scale, facing, atlas, ...) or null.
//   rect(category, id, frame)       -> {img, sx, sy, sw, sh, px, py, anchor} or null. img is the loaded atlas (an Image),
//                                      sx..sh the content rect in atlas pixels, px/py the pivot relative to the rect's top-left,
//                                      anchor is the pivot kind. poseScale corrects the scale of a separately drawn pose sheet. The first call for an id
//                                      starts its atlas load. The same object comes back on every call (no allocation).
//                                      frame is a dotted path: 'idle', 'walk1', 'hit', 'dead' (characters), 'side.walk1' (hero
//                                      views), 'hurt' (hero poses), 'a' (prop cells), 'icon' or 'tiers.l3' (weapons), 'frame' (vehicles).
//                                      Props take id '<hood>/<item>'. Ground and facade tiles take no frame (the whole file).
//   draw(ctx, category, id, frame, x, y, scale, opts) -> boolean. Draws the rect with its pivot at (x, y) in CSS px. scale is
//                                      CSS px per atlas px. Returns false (and draws nothing) when rect() is null. opts (all optional,
//                                      none allocated per call): mirror (flip about the pivot, for left-facing), rot (rad, screen space,
//                                      about the pivot), sx and sy (squash about the pivot), skew (horizontal shear in atlas space), alpha (0..1), flash (0..1: white silhouette
//                                      over the sprite), tint (CSS colour), tintAmount (0..1, default 0.5), outline (CSS colour, drawn
//                                      behind in four offsets) and outlineW (CSS px, default 2).
//   status()                        -> {enabled, manifest ('idle'|'loading'|'ready'|'failed'), atlases, loaded, failed}. Debug and tests.
// Silhouettes and tints are cached through P.ArtRig.bake, so they count against view.quality.spriteCacheMB (64 MB) with the
// procedural bake cache. Atlas images are decoded by the browser and are not counted there (see the risks in the work log).
P.ArtRaster = (function () {
  var A = {}, params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
  var art = params && params.get('art'), ON = !!params && (art === 'raster' || art === null && params.get('bench') !== '1');
  var base = null, index = null, mstate = 'idle', hasCat = Object.create(null), imgs = Object.create(null), cache = Object.create(null);
  var failed = [], manifestRequest = 0, NONE = {}, FALSE_RECT = null;
  try { base = new URL('../../assets/art/', document.currentScript.src); } catch (e) { base = null; }

  function acceptManifest(m) {
    if (!m || m.schema !== 1) throw new Error('manifest schema ' + (m && m.schema));
    index = m;
    Object.keys(m).forEach(function (k) { if (m[k] && typeof m[k] === 'object' && Object.keys(m[k]).length) hasCat[k] = true; });
    mstate = 'ready';
    A.rect('characters', 'hero_arda', 'front.idle');   // Start decoding Arda while the player is still in the menu.
    A.rect('characters', 'diner', 'idle');            // The first conversion must not wait until its reveal to decode.
  }
  function manifestFailed(e) { mstate = 'failed'; failed.push('manifest: ' + e.message); }
  function prepareFile(request) {
    var script = document.createElement('script');
    script.src = new URL('manifest-local.js', base).href;
    script.onerror = function () { if (request === manifestRequest) manifestFailed(new Error('local art manifest is missing')); };
    script.onload = function () {
      if (request === manifestRequest) {
        try { acceptManifest(P.LocalArtManifest); } catch (e) { manifestFailed(e); }
      }
      delete P.LocalArtManifest;
    };
    document.head.appendChild(script);
  }
  A.enabled = function () { return ON; };
  A.prepare = function (retry) {
    if (!ON || mstate !== 'idle') return;
    if (!base) { manifestFailed(new Error('cannot locate the art directory')); return; }
    mstate = 'loading';
    var request = ++manifestRequest;
    if (location.protocol === 'file:') { prepareFile(request); return; }
    if (typeof fetch !== 'function') { manifestFailed(new Error('fetch is unavailable')); return; }
    fetch(new URL('manifest.json', base).href, retry ? { cache: 'reload' } : undefined)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (m) { if (request === manifestRequest) acceptManifest(m); })
      .catch(function (e) { if (request === manifestRequest) manifestFailed(e); });
  };
  A.ready = function (category) { return mstate === 'ready' && !!hasCat[category]; };
  // The category's entry for an id. Props are keyed by file ('props/<hood>.png') with the item under items; the id is '<hood>/<item>'.
  function find(category, id) {
    var cat = index && index[category];
    if (!cat || typeof id !== 'string') return null;
    if (cat[id]) return { src: cat[id], base: cat[id] };
    var k = id.indexOf('/');
    if (category === 'props' && k > 0 && cat['props/' + id.slice(0, k) + '.png']) {
      var hood = cat['props/' + id.slice(0, k) + '.png'], item = hood.items && hood.items[id.slice(k + 1)];
      return item ? { src: hood, base: item } : null;
    }
    return null;
  }
  A.entry = function (category, id) { var f = find(category, id); return f ? f.src : null; };
  A.heroState = function () {
    if (!ON) return 'ready';
    if (mstate !== 'ready') return mstate === 'failed' ? 'failed' : 'loading';
    var hero = find('characters', 'hero_arda');
    if (!hero || !pick(hero.base, 'front.idle')) return 'failed';
    var img = imageFor(hero.src);
    if (!img || img.failed) return 'failed';
    return A.rect('characters', 'hero_arda', 'front.idle') ? 'ready' : 'loading';
  };
  A.retryHero = function () {
    var hero = find('characters', 'hero_arda');
    if (mstate !== 'ready' || !hero || !pick(hero.base, 'front.idle')) { mstate = 'idle'; A.prepare(true); return; }
    var path = hero.src.atlas || hero.src.file;
    delete imgs[path];
    if (cache.characters) delete cache.characters.hero_arda;
    imageFor(hero.src, true);
  };
  function walk(obj, path) {
    for (var i = 0; i < path.length; i++) { if (!obj || typeof obj !== 'object') return null; obj = obj[path[i]]; }
    return obj;
  }
  function isRect(o) { return !!o && typeof o.x === 'number' && typeof o.y === 'number' && typeof o.w === 'number' && typeof o.h === 'number'; }
  // Frame lookup: the dotted path as given, then under frames, cells, poses, and views.<view>.frames.<name> for two-part names.
  function pick(b, frame) {
    if (b.file && !b.frames && !b.cells && !b.x) return { x: 0, y: 0, w: b.w, h: b.h, px: 0, py: 0, anchor: 'tile' };
    var p = String(frame).split('.'), tries = [p, ['frames'].concat(p), ['cells'].concat(p), ['poses'].concat(p)], i, o;
    if (p.length === 2) tries.push(['views', p[0], 'frames', p[1]]);
    for (i = 0; i < tries.length; i++) { o = walk(b, tries[i]); if (isRect(o)) return o; }
    return null;
  }
  function imageFor(src, refresh) {
    var path = src.atlas || src.file;
    if (!path) return null;
    var s = imgs[path];
    if (s) return s;
    var el = new Image();
    s = imgs[path] = { el: el, path: path, failed: false };
    el.onerror = function () {
      if (imgs[path] !== s) return;
      s.failed = true; failed.push(path);
      if (refresh) return;
      setTimeout(function () {
        if (imgs[path] !== s) return;
        delete imgs[path]; cache = Object.create(null); imageFor(src, true);
      }, 500);
    };
    var url = new URL(path, base);
    if (refresh && location.protocol !== 'file:') url.searchParams.set('retry', Date.now());
    el.src = url.href;
    return s;
  }
  A.rect = function (category, id, frame) {
    if (mstate !== 'ready') return null;
    var byCat = cache[category] || (cache[category] = Object.create(null)), byId = byCat[id] || (byCat[id] = Object.create(null)), hit = byId[frame];
    if (hit !== undefined) return hit || FALSE_RECT;      // false: this frame does not exist (never retried)
    var f = find(category, id);
    if (!f) return null;                                  // unknown id: not cached, the lookup is cheap and the manifest is fixed
    var box = pick(f.base, frame), im = box ? imageFor(f.src) : null;
    if (!box) { byId[frame] = false; return null; }
    if (!im || im.failed) { if (im && im.failed) byId[frame] = false; return null; }
    if (!(im.el.complete && im.el.naturalWidth > 0)) return null;   // still loading
    var r = { img: im.el, sx: box.x, sy: box.y, sw: box.w, sh: box.h, px: box.px || 0, py: box.py || 0, anchor: box.anchor || 'feet',
      poseScale: box.poseScale || 1, key: im.path + '@' + box.x + ',' + box.y + ',' + box.w + ',' + box.h, keys: Object.create(null) };
    byId[frame] = r;
    return r;
  };
  // A variant canvas of the rect: 'in' is a solid silhouette of colour, 'atop' is the frame with colour laid over it at amount.
  // Built once per (rect, mode, colour, amount) through the rig's bake cache, so the LRU budget covers it.
  function variant(r, mode, colour, amount) {
    var B = P.ArtRig, kk = mode + colour + amount, key = r.keys[kk] || (r.keys[kk] = r.key + '|' + kk);
    if (!B || !B.bake) return null;
    return B.bake(key, 1, [0, r.sw, 0, r.sh], function (g) {
      g.drawImage(r.img, r.sx, r.sy, r.sw, r.sh, 0, 0, r.sw, r.sh);
      g.globalCompositeOperation = mode === 'in' ? 'source-in' : 'source-atop';
      g.globalAlpha = mode === 'in' ? 1 : amount;
      g.fillStyle = colour; g.fillRect(0, 0, r.sw, r.sh);
    }).cv;
  }
  function outline(ctx, r, dx, dy, w, h, o) {
    var cv = variant(r, 'in', o.outline, 1), d = o.outlineW || 2;
    if (!cv) return;
    ctx.drawImage(cv, dx - d, dy, w, h); ctx.drawImage(cv, dx + d, dy, w, h);
    ctx.drawImage(cv, dx, dy - d, w, h); ctx.drawImage(cv, dx, dy + d, w, h);
  }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function blit(ctx, r, src, scale, x, y, bands) {
    var img = src || r.img, ox = src ? 0 : r.sx, oy = src ? 0 : r.sy;
    if (!bands) {
      ctx.drawImage(img, ox, oy, r.sw, r.sh, x, y, r.sw * scale, r.sh * scale);
      return;
    }
    for (var i = 0; i < bands.length; i++) {
      var b = bands[i], h = b.to - b.from, sy = b.height / h;
      ctx.save();
      ctx.transform(1, 0, b.shear, sy, x + b.x * scale, y + b.y * scale);
      ctx.drawImage(img, ox, oy + b.from, r.sw, h, 0, 0, r.sw * scale, h * scale);
      ctx.restore();
    }
  }
  A.draw = function (ctx, category, id, frame, x, y, scale, o) {
    var r = A.rect(category, id, frame), w, h, dx, dy, a0, sx, sy;
    if (!r || !ctx || !(scale > 0)) return false;
    o = o || NONE;
    scale *= r.poseScale;
    w = r.sw * scale; h = r.sh * scale; dx = -r.px * scale; dy = -r.py * scale;
    sx = o.sx === undefined ? 1 : o.sx; sy = o.sy === undefined ? 1 : o.sy;
    // Ordinary forward-facing sprites can draw in world coordinates without touching the context transform.
    if (!o.bands && !o.mirror && !o.rot && !o.skew && !o.outline && !o.tint && !(o.flash > 0) && o.alpha === undefined && sx > 0 && sy > 0) {
      ctx.drawImage(r.img, r.sx, r.sy, r.sw, r.sh, x + dx * sx, y + dy * sy, w * sx, h * sy);
      return true;
    }
    ctx.save();
    ctx.translate(x, y);
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale((o.mirror ? -1 : 1) * sx, sy);
    if (o.skew) ctx.transform(1, 0, o.skew, 1, 0, 0);
    if (o.alpha !== undefined) ctx.globalAlpha *= clamp01(o.alpha);
    a0 = ctx.globalAlpha;
    if (o.outline) outline(ctx, r, dx, dy, w, h, o);
    var src = o.tint ? variant(r, 'atop', o.tint, o.tintAmount === undefined ? 0.5 : o.tintAmount) : null;
    if (src && !o.bands) ctx.drawImage(src, dx, dy, w, h);
    else blit(ctx, r, src, scale, dx, dy, o.bands);
    if (o.flash > 0) {
      var fv = variant(r, 'in', '#FFFFFF', 1);
      if (fv) {
        ctx.globalAlpha = a0 * Math.min(1, o.flash);
        if (o.bands) blit(ctx, r, fv, scale, dx, dy, o.bands);
        else ctx.drawImage(fv, dx, dy, w, h);
      }
    }
    ctx.restore();
    return true;
  };
  A.status = function () {
    var names = Object.keys(imgs), ok = names.filter(function (k) { return imgs[k].el.complete && imgs[k].el.naturalWidth > 0; });
    return { enabled: ON, manifest: mstate, atlases: names.length, loaded: ok.length, failed: failed.slice() };
  };
  // Estimate the loaded atlases as four bytes per pixel. The browser owns their actual decoded storage.
  A.estimatedBytes = function () {
    return Object.keys(imgs).reduce(function (bytes, name) {
      var el = imgs[name].el;
      return bytes + (el.complete ? el.naturalWidth * el.naturalHeight * 4 : 0);
    }, 0);
  };
  return A;
})();
