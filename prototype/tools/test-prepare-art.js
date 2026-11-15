#!/usr/bin/env node
// Tests for prepare-art.js and lib-art-image.js.
//   node prototype/tools/test-prepare-art.js           synthetic tests + checks on prototype/assets/art
//   node prototype/tools/test-prepare-art.js --full    also rebuilds into a temp dir and compares every file hash (about 2 minutes)
// Exit code 1 when any test fails.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const TOOLS = __dirname;
const ROOT = path.resolve(TOOLS, '..', '..');
const ART = path.join(ROOT, 'prototype', 'assets', 'art');
const L = require(path.join(TOOLS, 'lib-art-image.js'));
const P = require(path.join(TOOLS, 'prepare-art.js'));
const { C } = P;

const MAGENTA = [255, 0, 255], CYAN = [0, 255, 255];
const results = [];
function test(name, fn) {
  try {
    const info = fn();
    results.push({ name, ok: true, info });
  } catch (e) {
    results.push({ name, ok: false, info: e.message });
  }
}
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
function need(cond, msg) { if (!cond) throw new Error(msg); }
function blank(w, h, rgba) { return { w, h, rgba: rgba || new Uint8Array(w * h * 4) }; }
function fill(img, x0, y0, x1, y1, c) {
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const o = (y * img.w + x) * 4;
    img.rgba[o] = c[0]; img.rgba[o + 1] = c[1]; img.rgba[o + 2] = c[2]; img.rgba[o + 3] = 255;
  }
}
const px = (img, x, y) => { const o = (y * img.w + x) * 4; return [img.rgba[o], img.rgba[o + 1], img.rgba[o + 2], img.rgba[o + 3]]; };

// ---------- synthetic: matte, interior colour, enclosed pocket, fringe

function scene(key, clothing) {
  // 96x96 key-coloured background, dark outline box, body fill, clothing patch inside, a key-coloured pocket enclosed by the body.
  const img = blank(96, 96);
  fill(img, 0, 0, 96, 96, key);
  fill(img, 20, 16, 76, 84, [18, 18, 24]);          // outline
  fill(img, 23, 19, 73, 81, [70, 150, 80]);         // body
  fill(img, 30, 30, 66, 52, clothing);              // clothing patch, not key-coloured
  fill(img, 44, 62, 50, 68, key);                   // enclosed exact-key pocket (should clear)
  return img;
}

test('magenta matte is removed, outside and enclosed', () => {
  const img = scene(MAGENTA, [255, 105, 180]);
  const out = L.keyMatte(img, MAGENTA, {});
  const corner = out.rgba[3];
  need(corner === 0, `outside matte alpha ${corner}, want 0`);
  need(px({ w: 96, rgba: out.rgba }, 47, 65)[3] === 0, 'enclosed exact-key pocket was not cleared');
  need(px({ w: 96, rgba: out.rgba }, 48, 40)[3] === 255, 'body centre not opaque');
  return 'corner alpha 0, pocket cleared';
});

test('interior pink clothing survives keying (not within matte tolerance)', () => {
  const img = scene(MAGENTA, [255, 105, 180]);
  const out = L.keyMatte(img, MAGENTA, {});
  const p = px({ w: 96, rgba: out.rgba }, 48, 40);
  need(p[3] === 255, 'pink clothing alpha lost');
  need(Math.abs(p[0] - 255) <= 2 && Math.abs(p[1] - 105) <= 2 && Math.abs(p[2] - 180) <= 2, `pink colour changed to ${p.slice(0, 3)}`);
  return `pink kept at ${p.slice(0, 3)}`;
});

test('cyan key removes cyan matte and keeps magenta clothing', () => {
  const img = scene(CYAN, [255, 0, 255]);
  const out = L.keyMatte(img, CYAN, {});
  need(px({ w: 96, rgba: out.rgba }, 2, 2)[3] === 0, 'cyan background not removed');
  need(px({ w: 96, rgba: out.rgba }, 48, 40)[3] === 255, 'magenta clothing removed under cyan key');
  return 'cyan removed, magenta kept';
});

test('keyed edges are fringe-free (no key-tinted opaque pixel beside a transparent one)', () => {
  const img = scene(MAGENTA, [255, 105, 180]);
  const out = L.keyMatte(img, MAGENTA, {});
  const n = L.fringeCount(out.rgba, 96, 96, MAGENTA);
  need(n === 0, `${n} fringe pixel(s) left`);
  return '0 fringe pixels';
});

// ---------- synthetic: feet pivot and bounds

test('feet pivot sits at the bottom centre of the opaque figure', () => {
  const w = 64, h = 96, rgba = new Uint8Array(w * h * 4);
  for (let y = 20; y < 80; y++) for (let x = 10; x < 50; x++) rgba[(y * w + x) * 4 + 3] = 255;
  const box = L.alphaBox(rgba, w, h, 24);
  const band = Math.max(3, Math.round(C.feetBand * (box.y1 - box.y0)));
  const piv = L.feetPivot(rgba, w, box, band);
  need(Math.abs(piv.x - 30) < 0.5, `pivot x ${piv.x}, want 30`);
  need(piv.y === 80, `pivot y ${piv.y}, want 80`);
  return `pivot (${piv.x}, ${piv.y})`;
});

test('alpha bounding box ignores faint pixels below the threshold', () => {
  const w = 20, h = 20, rgba = new Uint8Array(w * h * 4);
  rgba[(5 * w + 5) * 4 + 3] = 255;
  rgba[(15 * w + 15) * 4 + 3] = 10;          // below 24: not part of the figure
  const box = L.alphaBox(rgba, w, h, 24);
  need(box && box.x0 === 5 && box.y0 === 5 && box.x1 === 6 && box.y1 === 6, JSON.stringify(box));
  return 'box 5,5 to 6,6';
});

// ---------- synthetic: determinism and PNG round trips

test('encoders are deterministic and round-trip exactly', () => {
  const w = 40, h = 30, rgba = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) { rgba[i * 4] = (i * 37) & 255; rgba[i * 4 + 1] = (i * 11) & 255; rgba[i * 4 + 2] = (i * 5) & 255; rgba[i * 4 + 3] = i % 7 ? 255 : 0; }
  const a = L.encodePng(w, h, rgba), b = L.encodePng(w, h, rgba);
  need(sha256(a) === sha256(b), 'encodePng not deterministic');
  const back = L.readPng(a);
  need(back.w === w && back.h === h, 'size mismatch');
  for (let i = 0; i < w * h * 4; i++) if (back.rgba[i] !== rgba[i]) throw new Error(`RGBA round trip differs at byte ${i}`);
  const q = L.quantize(rgba, w, h, 256);
  const p1 = L.encodePngPalette(w, h, q.indices, q.palette), p2 = L.encodePngPalette(w, h, q.indices, q.palette);
  need(sha256(p1) === sha256(p2), 'palette encode not deterministic');
  const pb = L.readPng(p1);
  for (let i = 0; i < w * h; i++) {
    const p = q.palette[q.indices[i]];
    const o = i * 4;
    if (pb.rgba[o] !== p[0] || pb.rgba[o + 1] !== p[1] || pb.rgba[o + 2] !== p[2] || pb.rgba[o + 3] !== p[3]) throw new Error(`palette round trip differs at pixel ${i}`);
  }
  return 'RGBA and palette round trips exact';
});

// ---------- real output checks (need a built prototype/assets/art)

function readManifest() {
  const f = path.join(ART, 'manifest.json');
  need(fs.existsSync(f), `missing ${f}; run node prototype/tools/prepare-art.js first`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function pngSize(file) {
  const b = fs.readFileSync(file);
  need(b.slice(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${file} is not a PNG`);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
let manifest = null;
try { manifest = readManifest(); } catch (e) { manifest = null; results.push({ name: 'manifest present', ok: false, info: e.message }); }

if (manifest) {
  test('file existence, sizes and sha256 match the manifest', () => {
    let n = 0;
    for (const [rel, meta] of Object.entries(manifest.files)) {
      const f = path.join(ART, rel);
      need(fs.existsSync(f), `missing ${rel}`);
      const b = fs.readFileSync(f);
      need(b.length === meta.bytes, `${rel}: ${b.length} bytes, manifest says ${meta.bytes}`);
      need(sha256(b) === meta.sha256, `${rel}: sha256 differs`);
      n++;
    }
    // no stray outputs: every file under the art dir is in the manifest, or is the cache, the manifest, or .gitignore
    const stray = [];
    const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else {
        const rel = path.relative(ART, p);
        if (!manifest.files[rel] && !['manifest.json', '.cache.json', '.gitignore'].includes(rel)) stray.push(rel);
      } } };
    walk(ART);
    need(stray.length === 0, `stray files: ${stray.slice(0, 5).join(', ')}`);
    return `${n} files verified`;
  });

  test('atlas rects lie inside their atlas and keep the gutter', () => {
    const g = C.gutter;
    const atlases = {};
    const collect = (node, atlas, out) => {
      if (node && typeof node === 'object') {
        const a = typeof node.atlas === 'string' ? node.atlas : atlas;
        if (['x', 'y', 'w', 'h'].every(k => typeof node[k] === 'number')) { if (a) (out[a] = out[a] || []).push({ x: node.x, y: node.y, w: node.w, h: node.h }); return; }
        for (const v of Object.values(node)) collect(v, a, out);
      }
    };
    for (const cat of ['characters', 'props', 'weapons', 'pickups', 'effects', 'vehicles']) collect(manifest[cat], null, atlases);
    let rects = 0;
    for (const [atlas, list] of Object.entries(atlases)) {
      const { w: W, h: H } = pngSize(path.join(ART, atlas));
      for (const r of list) {
        rects++;
        need(r.x >= g && r.y >= g && r.x + r.w <= W - g && r.y + r.h <= H - g, `${atlas}: rect ${JSON.stringify(r)} outside ${W}x${H} minus gutter`);
      }
    }
    return `${rects} rects across ${Object.keys(atlases).length} atlases`;
  });

  test('frames are padded: content rects in one atlas are at least 2 gutters apart', () => {
    const g = C.gutter;
    const atlases = {};
    const collect = (node, atlas, out) => {
      if (node && typeof node === 'object') {
        const a = typeof node.atlas === 'string' ? node.atlas : atlas;
        if (['x', 'y', 'w', 'h'].every(k => typeof node[k] === 'number')) { if (a) (out[a] = out[a] || []).push({ x: node.x, y: node.y, w: node.w, h: node.h }); return; }
        for (const v of Object.values(node)) collect(v, a, out);
      }
    };
    for (const cat of ['characters', 'props', 'weapons', 'pickups', 'effects', 'vehicles']) collect(manifest[cat], null, atlases);
    let pairs = 0;
    for (const [atlas, list] of Object.entries(atlases)) {
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
        const A = list[i], B = list[j];
        const sepX = Math.max(B.x - (A.x + A.w), A.x - (B.x + B.w));
        const sepY = Math.max(B.y - (A.y + A.h), A.y - (B.y + B.h));
        need(Math.max(sepX, sepY) >= 2 * g, `${atlas}: rects ${JSON.stringify(A)} and ${JSON.stringify(B)} are closer than ${2 * g}px`);
        pairs++;
      }
    }
    return `${pairs} rect pairs checked`;
  });

  test('characters: one scale per entity, idle frame height matches heightPx', () => {
    let n = 0;
    for (const [id, e] of Object.entries(manifest.characters)) {
      need(typeof e.scale === 'number' && e.scale > 0, `${id}: no scale`);
      const expect = e.srcHeightPx * e.scale;
      need(Math.abs(expect - e.heightPx) < 0.6, `${id}: srcHeightPx*scale ${expect.toFixed(1)} vs heightPx ${e.heightPx}`);
      n++;
    }
    return `${n} characters`;
  });

  test('manifest rows cover the inventory: every prompt output has a source row', () => {
    const invFile = path.join(ROOT, 'art', 'commission', 'asset-inventory.json');
    need(fs.existsSync(invFile), 'missing asset-inventory.json');
    const inv = JSON.parse(fs.readFileSync(invFile, 'utf8'));
    const want = new Set(inv.prompt_outputs.map(p => p.id));
    const got = new Set(manifest.sources.map(s => s.id));
    const missing = [...want].filter(id => !got.has(id));
    need(missing.length === 0, `${missing.length} prompt outputs without a source row: ${missing.slice(0, 5).join(', ')}`);
    const bad = manifest.sources.filter(s => !['used', 'skipped', 'rejected', 'not-built'].includes(s.status));
    need(bad.length === 0, bad.length ? `unknown source status on ${bad[0].id}` : '');
    const rejected = manifest.sources.filter(s => s.status === 'rejected');
    need(rejected.length === 0, `${rejected.length} rejected source(s)`);
    return `${want.size} prompt outputs, ${manifest.sources.filter(s => s.status === 'used').length} used`;
  });

  test('budget: total under the 60 MiB limit and equal to the sum of files', () => {
    const sum = Object.values(manifest.files).reduce((a, f) => a + f.bytes, 0);
    need(sum === manifest.budget.totalBytes, `files sum ${sum} vs budget total ${manifest.budget.totalBytes}`);
    need(manifest.budget.totalBytes <= manifest.budget.limitBytes, `total ${manifest.budget.totalBytes} over limit ${manifest.budget.limitBytes}`);
    const catSum = Object.values(manifest.budget.categoryBytes).reduce((a, b) => a + b, 0);
    need(catSum === manifest.budget.totalBytes, 'category sums do not add up to the total');
    // the directory total also holds manifest.json and .gitignore (the cache is git-ignored but still on disk)
    const dir = ['manifest.json', '.gitignore', '.cache.json'].reduce((a, f) => a + fs.statSync(path.join(ART, f)).size, sum);
    need(dir < manifest.budget.limitBytes, `directory ${dir} bytes over limit ${manifest.budget.limitBytes}`);
    const mib = (dir / (1024 * 1024)).toFixed(2);
    const [lo, hi] = manifest.budget.goalBytes.map(b => (b / (1024 * 1024)).toFixed(0));
    return `${mib} MiB on disk incl. manifest and cache (goal ${lo}-${hi} MiB)`;
  });

  test('cache is keyed to the current recipe', () => {
    const cache = JSON.parse(fs.readFileSync(path.join(ART, '.cache.json'), 'utf8'));
    need(cache.recipe && cache.recipe.startsWith(manifest.recipe), `cache recipe ${String(cache.recipe).slice(0, 12)} vs manifest ${manifest.recipe}`);
    need(fs.readFileSync(path.join(ART, '.gitignore'), 'utf8').includes('.cache.json'), '.gitignore does not list .cache.json');
    return 'recipe matches, .cache.json ignored';
  });
}

// ---------- optional: full rebuild into a temp dir, compare every hash

if (process.argv.includes('--full')) {
  test('full rebuild is byte-identical to prototype/assets/art', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'art-det-'));
    const r = spawnSync(process.execPath, [path.join(TOOLS, 'prepare-art.js'), '--force', `--dst=${tmp}`], { encoding: 'utf8', maxBuffer: 1 << 26 });
    need(r.status === 0, `prepare-art exit ${r.status}: ${r.stderr.slice(0, 300)}`);
    const list = dir => { const out = []; const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else out.push(path.relative(dir, p)); } }; walk(dir); return out.filter(f => f !== '.cache.json').sort(); };
    const a = list(ART), b = list(tmp);
    need(a.join('\n') === b.join('\n'), 'file lists differ');
    for (const f of a) need(sha256(fs.readFileSync(path.join(ART, f))) === sha256(fs.readFileSync(path.join(tmp, f))), `${f} differs between builds`);
    fs.rmSync(tmp, { recursive: true, force: true });
    return `${a.length} files identical`;
  });
}

// ---------- report

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.info ? '  (' + r.info + ')' : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exitCode = failed ? 1 : 0;
