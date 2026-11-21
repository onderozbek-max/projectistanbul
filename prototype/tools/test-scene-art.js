'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { indexScripts, loadP, ROOT } = require('./lib-load');
const { readPng } = require('./lib-art-codecs');
const P = loadP();
const images = [];
const documentStub = { currentScript: { src: 'http://localhost/js/view/scene-art.js' } };

class Bitmap {
  set src(url) {
    const file = new URL(url).pathname;
    const bytes = fs.readFileSync(path.join(ROOT, file));
    images.push(file);
    if (file.endsWith('.png')) {
      const png = readPng(bytes);
      this.naturalWidth = png.w; this.naturalHeight = png.h;
      this.onload(); return;
    }
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', file);
    const format = bytes.toString('ascii', 12, 16);
    if (format === 'VP8X') {
      this.naturalWidth = bytes.readUIntLE(24, 3) + 1;
      this.naturalHeight = bytes.readUIntLE(27, 3) + 1;
    } else {
      assert.equal(format, 'VP8 ', file);
      this.naturalWidth = bytes.readUInt16LE(26) & 0x3fff;
      this.naturalHeight = bytes.readUInt16LE(28) & 0x3fff;
    }
    this.onload();
  }
}

for (const file of ['comic-raster.js', 'arena-sky.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/view', file), 'utf8'), { P, Image: Bitmap, document: documentStub, URL });
}
assert.equal(images.length, 12);
assert.ok(P.ComicRaster.ready() && P.ArenaSky.ready());
assert(images.includes('/assets/comic/scenes-a-story-v2.webp'));
assert(!images.includes('/assets/comic/scenes-a.webp'), 'Retired flagged scenery is never loaded');
assert.ok(!indexScripts().some(file => file.endsWith('arena-sky-data.js')));

const preview = {};
class MissingBitmap extends Bitmap {
  set src(url) {
    const file = new URL(url);
    if (file.pathname.endsWith('/scenes-d.webp') && !file.searchParams.has('retry')) { this.onerror(); return; }
    super.src = url;
  }
}
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/view/comic-raster.js'), 'utf8'), { P: preview, Image: MissingBitmap, document: documentStub, URL });
assert.equal(preview.ComicRaster.pageArt({ panels: [{ bg: 'istiklal', ch: [['arda', 'neutral']] }] }), 'ready');
const later = { panels: [{ bg: 'campfire', ch: [['kaan', 'grief']] }] };
assert.equal(preview.ComicRaster.pageArt(later), 'failed');
assert.equal(preview.ComicRaster.pageArt(later, true), 'ready');

const ctx = {
  draws: [], save() {}, restore() {}, translate() {}, scale() {}, beginPath() {}, rect() {}, clip() {},
  drawImage(...args) { this.draws.push(args); },
};
const sceneKeys = new Set(P.ComicRaster.sceneKeys());
const castKeys = new Set(P.ComicRaster.castKeys());
assert.equal(sceneKeys.size, 37);
assert.equal(castKeys.size, 13);
for (const page of Object.values(P.Story.pages)) {
  for (const panel of page.panels) {
    assert.ok(sceneKeys.has(panel.bg), panel.bg);
    for (const [who] of (panel.ch || [])) assert.ok(castKeys.has(who === 'friend' ? 'stranger' : who), who);
  }
}
for (const key of sceneKeys) {
  P.ComicRaster.scene(ctx, 390, 160, key);
  const [im, x, y, w, h] = ctx.draws.pop();
  assert.ok(x >= 0 && y >= 0 && x+w <= im.naturalWidth && y+h <= im.naturalHeight, key);
  assert.ok(Math.abs(w/h - 390/160) < .0001, 'panel art preserves orientation and scale');
}
for (const who of [...castKeys, 'friend']) {
  P.ComicRaster.bust(ctx, who, 'scared', 120, 160, 110, { flip: true });
  const [im, x, y, w, h, , , dw, dh] = ctx.draws.pop();
  assert.ok(x >= 0 && y >= 0 && x+w <= im.naturalWidth && y+h <= im.naturalHeight, who);
  assert.ok(Math.abs(w/h - dw/dh) < .0001, 'bust art has no stretching');
}

// The opening diner cannot look like the stranger Arda only meets at L20.
assert.notEqual(P.Story.forLine('s3').who, P.Story.forLine('K20b').who);
function portraitCrop(who) {
  P.ComicRaster.bust(ctx, who, 'neutral', 120, 160, 110, {});
  const [im, ...args] = ctx.draws.pop();
  return { bitmap: im, crop: args.slice(0, 4) };
}
const dinerPortrait = portraitCrop('friend'), kaanPortrait = portraitCrop('kaan');
assert.ok(dinerPortrait.bitmap !== kaanPortrait.bitmap ||
  JSON.stringify(dinerPortrait.crop) !== JSON.stringify(kaanPortrait.crop));
assert.deepEqual(portraitCrop('mom'),portraitCrop('anne'),'Mom alias must resolve to Mom, never the stranger');
for (const who of ['arda', 'anne']) {
  const restrained = portraitCrop(who);
  for (const mood of ['sad', 'worried', 'determined']) {
    P.ComicRaster.bust(ctx, who, mood, 120, 160, 110, {});
    const [im, ...args] = ctx.draws.pop();
    assert.equal(im, restrained.bitmap, who + ' listens without a smile or scream');
    assert.deepEqual(args.slice(0, 4), restrained.crop);
  }
  P.ComicRaster.bust(ctx, who, 'happy', 120, 160, 110, {});
  assert.notEqual(ctx.draws.pop()[0], restrained.bitmap, 'Happy expression remains an explicit choice');
}
assert.equal(P.Story.pages.l10_end.panels[2].bg, 'street');
assert.equal(P.Story.pages.l15_end.panels[0].bg, 'cafe');
for (const panel of [P.Story.pages.hood_karakoy.panels[1], P.Story.pages.l15_end.panels[1]]) {
  assert.equal(panel.bg, 'pasa', 'The introduced cat is visible');
  assert.equal(panel.ch.length, 0, 'A separate bust cannot obscure Paşa');
  assert(panel.actionTop > .5, 'Reserve the cat illustration above the lettering');
}
for(const mood of ['neutral','worried','scared','shout','hurt','angry','determined']){
  P.ComicRaster.bust(ctx,'arda',mood,120,160,110,{});
  const [bitmap,...args]=ctx.draws.pop();
  assert(bitmap!==dinerPortrait.bitmap||JSON.stringify(args.slice(0,4))!==JSON.stringify(dinerPortrait.crop),'Arda mood must retain Arda identity');
}
for(const unknown of ['not-a-character','hero-typo',null,undefined]){
  const n=ctx.draws.length;P.ComicRaster.bust(ctx,unknown,'neutral',120,160,110,{});
  assert.equal(ctx.draws.length,n,'An unknown portrait must stay neutral instead of impersonating a stranger');
}
assert.equal(P.ComicRaster.pageArt({panels:[{bg:'street',ch:[['hero-typo','neutral']]}]}),'ready','Unknown identities must not block a readable neutral page');
const ardaBeats=Object.keys(P.DLG.beats).filter(id=>P.DLG.beats[id].spk==='spk.arda');
assert(ardaBeats.length>300);
ardaBeats.forEach(id=>assert.equal(P.Story.forLine(id).who,'arda','Hero dialogue must retain Arda: '+id));
P.ComicArt = { TYPE: { lead: 1.2 }, setFont(c, _kind, px) { c.px = px; } };
for (const file of ['comic-text.js', 'comic-layout.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/view', file), 'utf8'), { P });
}
const layout = P.ComicLayout;
const lettering = { measureText(text) {
  return { width: text.length * this.px * 0.58, actualBoundingBoxAscent: this.px * 0.75, actualBoundingBoxDescent: this.px * 0.25 };
} };
const heights = p => p.busts.map(b => b.h).join(',');
for (const lang of ['tr', 'en']) {
  P.lang = lang;
  for (const page of Object.values(P.Story.pages)) {
    const panels = page.panels.map((data, i) => ({ ...layout.panelRect(page.panels.length, i, page.layout), c: lettering, data }));
    for (const panel of layout.layoutPage(panels)) {
      if (panel.data.actionTop) assert(panel.steps.every(step => step.ok), 'Reserved artwork keeps a fitted text band');
      const empty = layout.layoutPanel({ ...panel, data: { ...panel.data, it: [] } });
      assert.equal(heights(panel), heights(empty), 'authored portrait sizes are independent of all lettering');
    }
  }
}
const short = { who: 'arda', text: 'One line.' };
const long = { ...short, text: 'We still have to find a safe way back to the bridge. '.repeat(8).trim() };
const base = { w: 171, h: 220, c: lettering };
const ch = [['arda', 'neutral', 0.3, false, 0.62]];
const shortPanel = layout.layoutPanel({ ...base, data: { ch, it: [['b', short]] } });
const longPanel = layout.layoutPanel({ ...base, data: { ch, it: [['b', long], ['p', 3]] } });
assert.equal(heights(shortPanel), heights(longPanel));
assert.ok(longPanel.steps.length > 1 && longPanel.steps.every(step => step.ok));
assert.ok(longPanel.steps.every(step => step.items.some(item => item.kind === 'bars' && item.n === 3)));
assert.equal(longPanel.steps.flatMap(step => step.items.filter(item => item.kind === 'bubble').flatMap(item => item.lines)).join(' '), P.upper(long.text));

const R = { ctx, ppm: 42, cam: { x: 0, y: 0 }, depth(y, draw) { this.depthY = y; draw(); },
  X(x) { return (x - this.cam.x) * this.ppm; }, Y(y) { return (this.cam.y - y) * this.ppm; } };
for (let level = 2; level <= 100; level++) {
  const s = P.createSim(42, { levelIndex: level }), id = s.levelInfo.hood.theme, th = { id };
  const anchor = P.ArenaSky.position(s, id);
  if (!anchor) continue;
  const pad = s.geo.blocks.find(b => b.kind === 'districtLandmark');
  assert.equal(pad.x, anchor.x);
  assert.ok(Math.abs(pad.rc.yMin - anchor.y) < .0001);
  let projection;
  for (const cam of [{ x: 0, y: anchor.y - 2 }, { x: 1.2, y: anchor.y + 3 }]) {
    R.cam = cam;
    s.hero.x = cam.x; s.hero.y = cam.y;
    P.ArenaSky.draw(R, s, th, cam.y - 9, cam.y + 9);
    assert.equal(ctx.draws.length, 1, 'one landmark per view');
    const [im, sx, sy, sw, sh, x, y, w, h] = ctx.draws.pop();
    assert.equal(R.depthY, anchor.y, 'scenery and actors sort by their ground positions');
    assert.ok(sx >= 0 && sy >= 0 && sx+sw <= im.naturalWidth && sy+sh <= im.naturalHeight);
    assert.ok(Math.abs(y + h - R.Y(anchor.y)) < .0001);
    if (projection) {
      assert.ok(Math.abs(x - projection.x + 1.2*R.ppm) < .0001);
      assert.ok(Math.abs(y - projection.y - 5*R.ppm) < .0001);
    }
    projection = { x, y, w, h };
  }
  P.ArenaSky.draw(R, s, th, anchor.y + 35, anchor.y + 55);
  assert.equal(ctx.draws.length, 0, 'landmark leaves the view after passing it');
}
for (const level of [6, 11]) {
  const s = P.createSim(42, { levelIndex: level, tramRhythm: true });
  assert.equal(P.ArenaSky.position(s, s.levelInfo.hood.theme).kind, 'mosque');
}
// Exercise the bridge through the regular street prop entry point, even before its art loads.
const bridgeAssets = [];
class BridgeBitmap {
  set src(url) {
    this.file = new URL(url).pathname;
    bridgeAssets.push(this);
  }
}
const bridgeContext = { P, Image: BridgeBitmap, document: documentStub, URL };
for (const file of ['istanbul-themes.js', 'istanbul-props.js', 'bridge-props.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/view', file), 'utf8'), bridgeContext);
}
const bridge = P.Themes.get('bridge');
for (let stage = 0; stage < 5; stage++) assert.ok(!P.Themes.subOf(bridge, stage).lm.includes('pier:deck'));
const posts = bridgeAssets.find(im => im.file.endsWith('/bollard-v2.png'));
assert(posts, 'bridge loads the replacement bollard');
const sheet = readPng(fs.readFileSync(path.join(ROOT, posts.file)));
assert.equal(sheet.rgba[3], 0, 'the sheet starts with a transparent pixel');
Object.assign(ctx, { ellipse() {}, fill() {}, stroke() {} });
P.ArtRasterItems = { block() { throw new Error('Bridge bollards must bypass the older prop renderer'); } };
P.Props.draw('bollard', R, -1.5, 42, { w: .6, h: .6, theme: 'bridge' });
assert.equal(ctx.draws.length, 0, 'the loading footprint uses no old sprite');
posts.onload();
for (const v of [0, .4, .8]) {
  P.Props.draw('bollard', R, -1.5, 42, { w: .6, h: .6, theme: 'bridge', v });
  assert.equal(ctx.draws.length, 1, 'the painted post has no separate overlay');
  const [bitmap, sx, sy, sw, sh, , , dw, dh] = ctx.draws.pop();
  assert.equal(bitmap, posts);
  assert.ok(sx >= 0 && sy >= 0 && sx + sw <= sheet.w && sy + sh <= sheet.h);
  assert.ok(Math.abs(dw / dh - sw / sh) < .0001, 'the sprite keeps its painted proportions');
  assert.ok(Math.abs(dw - .6 * R.ppm) < .0001, 'the base matches the collision width');
}
P.Props.draw('bollard', R, 5.5, 42, { rt: 'bridge', k: 3 });
assert.equal(ctx.draws.pop()[0], posts, 'the sidewalk uses the same art');

const tileCopies = [];
documentStub.createElement = () => ({ getContext: () => ({ setTransform() {}, drawImage(im) { tileCopies.push(im); } }) });
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/view/bridge-water.js'), 'utf8'), bridgeContext);
const water = bridgeAssets.find(im => im.file.endsWith('/golden-horn-water.jpg'));
const ferry = bridgeAssets.find(im => im.file.endsWith('/ferry-overhead.png'));
assert.equal(fs.readFileSync(path.join(ROOT, water.file)).readUInt16BE(0), 0xffd8);
const hull = readPng(fs.readFileSync(path.join(ROOT, ferry.file)));
assert.equal(hull.rgba[3], 0);
assert.ok(hull.h > hull.w * 3, 'the new source points along the route');
Object.assign(water, { width: 384, height: 384 });
Object.assign(ferry, { width: hull.w, height: hull.h });
Object.assign(ctx, {
  fillRect() {}, moveTo() {}, quadraticCurveTo() {}, globalAlpha: 1,
  createPattern(tile, repeat) { assert.equal(repeat, 'repeat'); assert.equal(tile.width, 768); return {}; },
});
water.onload(); ferry.onload();
const crossing = P.createSim(42, { levelIndex: 19, tramRhythm: true });
const span = crossing.geo.zones.find(z => z.kind === 'bridge');
const shore = P.CFG.layouts.bridge.deckHalf;
assert.equal(P.BridgeWater.shore(crossing, span.y0 - 1, 1), 7);
assert.equal(P.BridgeWater.shore(crossing, span.y0 + 1, 1), shore);
assert.equal(P.BridgeWater.shore(crossing, span.y0 + 1, -1), shore);
const quay = P.createSim(42, { levelIndex: 17, tramRhythm: true });
const bank = quay.geo.zones.find(z => z.kind === 'waterfront');
assert.equal(P.BridgeWater.shore(quay, bank.y0 + 1, 1), P.CFG.layouts.waterfront.seaX);
assert.equal(P.BridgeWater.shore(quay, bank.y0 + 1, -1), 7);
R.cam = { x: 0, y: (span.y0 + span.y1) / 2, w: 10 };
function ferryPosition() {
  ctx.globalAlpha = 1;
  P.BridgeWater.draw(R, crossing, R.cam.y - 13, R.cam.y + 13);
  assert.equal(ctx.draws.length, 1, 'one ferry in the water');
  const [im, x, y, w, h] = ctx.draws.pop();
  assert.equal(im, ferry);
  assert.ok(x > R.X(shore) && x + w < R.X(5));
  assert.ok(Math.abs(w / h - hull.w / hull.h) < .0001);
  return { x, y };
}
const firstPass = ferryPosition();
R.cam.y += 2;
assert.ok(Math.abs(ferryPosition().y - firstPass.y - 2 * R.ppm) < .0001, 'the ferry is anchored to the world');
crossing.t += 1;
const underway = ferryPosition();
assert.equal(underway.x, firstPass.x);
assert.ok(underway.y < firstPass.y + 2 * R.ppm, 'the ferry moves bow-first');
assert.deepEqual(tileCopies, [water, water, water, water]);

const streetImages = new Map();
class StreetBitmap {
  set src(url) {
    this.file = new URL(url).pathname;
    streetImages.set(path.basename(this.file), this);
  }
}
const streetContext = { P, Image: StreetBitmap, document: documentStub, URL };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/view/street-art.js'), 'utf8'), streetContext);
for (const name of ['bench', 'bench-lengthwise', 'pillar', 'rowboat', 'shop-wall', 'tram', 'truck']) {
  const bitmap = streetImages.get(name + '.webp');
  const bytes = fs.readFileSync(path.join(ROOT, bitmap.file));
  assert.equal(bytes.toString('ascii', 8, 16), 'WEBPVP8X');
  assert.ok(bytes[20] & 16, name + ' has an alpha channel');
  bitmap.naturalWidth = bytes.readUIntLE(24, 3) + 1;
  bitmap.naturalHeight = bytes.readUIntLE(27, 3) + 1;
}
assert.ok(streetImages.get('bench.webp').naturalWidth > streetImages.get('bench.webp').naturalHeight);
assert.ok(streetImages.get('bench-lengthwise.webp').naturalWidth < streetImages.get('bench-lengthwise.webp').naturalHeight);
const rotations = [], mirrors = [], footprints = [], origins = [];
Object.assign(ctx, {
  rotate(a) { rotations.push(a); }, scale(x, y) { mirrors.push([x,y]); }, translate(x, y) { origins.push([x,y]); },
  fillRect(...args) { footprints.push(args); }, strokeRect() {},
});
for (const [x, w, h, variant] of [[-4, .6, 1.8, 'bench-lengthwise'], [3, 1.8, .6, 'bench']]) {
  assert.ok(P.StreetArt.prop('bench', R, x, 75, { w, h }));
  assert.equal(ctx.draws.pop()[0], streetImages.get(variant + '.webp'));
  assert.equal(origins.pop()[0], R.X(x));
}
assert.deepEqual(mirrors, [[-1,1]]);
assert.deepEqual(rotations, [], 'benches use geometry-specific artwork');
assert.ok(P.StreetArt.tram(ctx, 54, 72, 52, 255, .12));
const [streetcar, dx, dy, dw, dh] = ctx.draws.pop();
assert.equal(streetcar, streetImages.get('tram.webp'));
assert.equal(dx + dw / 2, 0);
assert.equal(dy + dh / 2, 0);
assert.deepEqual(origins.pop(), [54, 72]);
assert.deepEqual(rotations, [.12]);
streetcar.naturalWidth = 0;
assert.ok(P.StreetArt.tram(ctx, 0, 0, 52, 255), 'a missing tram never hands control back to the legacy painter');
assert.deepEqual(footprints.pop(), [-26, -127.5, 52, 255]);
assert.equal(ctx.draws.length, 0);
console.log('Scene art: portrait framing, anchored landmarks, water and current overhead vehicles and props');
