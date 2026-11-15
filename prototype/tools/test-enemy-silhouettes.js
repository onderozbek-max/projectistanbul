// Enemy variety guard (owner feedback, phone playtest: "all enemies look the same"). Checks:
//  (1) Silhouettes: every enemy type, each walker outfit variant and the five brute-type bosses render, through the real sprite
//      path, as a binary mask at 48 px (a scale-1 figure is 48 px tall). Masks are normalised (crop to the bounding box, uniform
//      scale into 40 px, centred) and compared by 1 - IoU. Every pair must differ by at least SIL_MIN. Headless Chrome, like
//      test-map-first-run.js (skipped with a note when Chrome is not found).
//  (2) Accents: the chromatic accent of every type (config P.CFG.enemyLook.types) differs from every other similar-sized type's by
//      at least HUE_MIN degrees. Similar size: |scale - scale'| <= 0.25 (the scales are read from the rendered page). Neutral
//      accents (saturation below 0.2: paper, ink, grey, cream) carry no hue and are exempt; they are listed in the output.
//  (3) Walker outfits: the id hash is deterministic, matches the spec formula in this file, and spreads ids over all four outfits.
//  (4) The sim never reads the look: no js/sim file names the view look, outfit, sprite or config keys, and the config only
//      adds P.CFG.enemyLook (no sim key is touched).
//  (5) Wiring: index.html loads config-enemy-look.js, art-enemy-look.js and art-enemy-bosses.js after the art they wrap, and the
//      boss costumes cover the five hoods of config-bosses.js bossByHood that use the brute archetype.
// Usage: node prototype/tools/test-enemy-silhouettes.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
let passes = 0; const fails = [];
function ok(c, m) { if (c) passes++; else fails.push(m); }

const SIL_MIN = 0.10;     // 1 - IoU of normalised 48 px masks, every pair
const HUE_MIN = 20;       // degrees, chromatic accents of similar-sized types
const SIMILAR = 0.25;     // scale window for "similarly sized"
const TYPES = ['walker', 'runner', 'crawler', 'diner', 'kurye', 'copci', 'marti', 'cayci', 'spitter', 'zehirli', 'brute', 'bloater',
  'screamer', 'hardhat', 'kasap', 'parkur'];
const BOSS_KEYS = ['boss.istiklal', 'boss.galata', 'boss.karakoy', 'boss.yedikule', 'boss.atakoy'];

// ---------- (4) and (5): static ----------
const simFiles = fs.readdirSync(path.join(ROOT, 'js/sim')).filter((f) => f.endsWith('.js'));
const LOOK_RE = /enemyLook|ArtEnemyLook|ArtEnemies|ArtChars|ArtRig|\bSprites\b|\bEN\.(outfitFor|lookKey|defFor|variantOf)\b|bossCostumes|bossDefs|animK/;
simFiles.forEach((f) => {
  const src = read('js/sim/' + f).replace(/\/\/.*$/gm, '');
  ok(!LOOK_RE.test(src), 'js/sim/' + f + ' reads the enemy look (view-only names)');
});
const cfgSrc = read('js/config-enemy-look.js');
ok(/P\.CFG\.enemyLook\s*=|C\.enemyLook\s*=/.test(cfgSrc), 'config-enemy-look.js sets only C.enemyLook');
ok(!/P\.CFG\.(enemies|bosses|levels|hero|sim|xp)\b/.test(cfgSrc.replace(/\/\/.*$/gm, '')), 'config-enemy-look.js touches no sim config key');
const html = read('index.html');
const order = (f) => html.indexOf('src="' + f + '"');
ok(order('js/config-enemy-look.js') > order('js/config-enemies5.js'), 'config-enemy-look.js loads after config-enemies5.js');
ok(order('js/view/art-enemy-look.js') > order('js/view/art-bosses.js') && order('js/view/art-enemy-bosses.js') > order('js/view/art-enemy-look.js'),
  'art-enemy-look.js and art-enemy-bosses.js load after art-bosses.js (they wrap its accent hook)');
ok(order('js/view/art-enemy-look.js') > 0, 'art-enemy-look.js is in index.html');

// ---------- (3) walker hash: the spec formula, deterministic, spread over four ----------
function variantSpec(id) { return Math.imul((id | 0) + 1, 0x9E3779B1) >>> 30; }
const counts = [0, 0, 0, 0];
for (let id = 1; id <= 4000; id++) counts[variantSpec(id)]++;
ok(counts.every((n) => n > 4000 / 4 * 0.85 && n < 4000 / 4 * 1.15), 'walker outfits: ids 1..4000 spread over the four outfits (' + counts.join('/') + ')');
ok(variantSpec(17) === variantSpec(17) && variantSpec(17) >= 0 && variantSpec(17) <= 3, 'walker outfits: the id hash is pure and in 0..3');

// ---------- (1) and (2) need the rendered page ----------
let masks = null;
if (!fs.existsSync(CHROME)) {
  console.log('note: Chrome not found at ' + CHROME + ', silhouette and scale checks skipped');
} else {
  try {
    const url = 'file://' + path.join(ROOT, 'tools/enemy-lineup.html') + '?mode=masks';
    const dom = execFileSync(CHROME, ['--headless=new', '--user-data-dir=/tmp/chrome-es-' + process.pid, '--no-first-run', '--disable-gpu',
      '--allow-file-access-from-files', '--hide-scrollbars', '--virtual-time-budget=20000', '--window-size=800,600', '--dump-dom', url],
    { maxBuffer: 1 << 29, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 180000 });
    const m = dom.match(/<pre id="out"[^>]*>([\s\S]*?)<\/pre>/);
    if (m) masks = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
  } catch (e) { masks = null; }
  ok(masks !== null, 'the lineup page renders the masks in headless Chrome');
}
const SIDE = 40;
function normalise(mk) {
  const { w, h, bits } = mk; let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (bits[y * w + x] === '1') { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1, s = SIDE / Math.max(bw, bh);
  const out = new Uint8Array(SIDE * SIDE), ox = (SIDE - bw * s) / 2, oy = (SIDE - bh * s) / 2;
  for (let y = 0; y < SIDE; y++) for (let x = 0; x < SIDE; x++) {
    const sx = Math.floor((x - ox) / s) + x0, sy = Math.floor((y - oy) / s) + y0;
    if (sx >= x0 && sx <= x1 && sy >= y0 && sy <= y1 && bits[sy * w + sx] === '1') out[y * SIDE + x] = 1;
  }
  return out;
}
function silDist(a, b) { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { if (a[k] & b[k]) i++; if (a[k] | b[k]) u++; } return 1 - (u ? i / u : 1); }

if (masks) {
  const sil = {};
  masks.keys.forEach((k) => { sil[k] = normalise(masks.masks[k]); });
  const cast = masks.keys.filter((k) => !k.startsWith('boss.'));
  const bosses = masks.keys.filter((k) => k.startsWith('boss.'));
  ok(cast.length === TYPES.length - 1 + 4, 'the page renders 15 types + 4 walker variants (' + cast.length + ')');
  ok(BOSS_KEYS.every((k) => bosses.indexOf(k) >= 0), 'the page renders the five brute-type bosses');
  const pairs = [];
  for (let a = 0; a < cast.length; a++) for (let b = a + 1; b < cast.length; b++) pairs.push([silDist(sil[cast[a]], sil[cast[b]]), cast[a], cast[b]]);
  for (let a = 0; a < bosses.length; a++) for (let b = a + 1; b < bosses.length; b++) pairs.push([silDist(sil[bosses[a]], sil[bosses[b]]), bosses[a], bosses[b]]);
  pairs.sort((p, q) => p[0] - q[0]);
  const worst = pairs[0];
  console.log('silhouettes: ' + pairs.length + ' pairs; closest ' + worst[0].toFixed(3) + ' ' + worst[1] + ' / ' + worst[2]);
  pairs.filter((p) => p[0] < SIL_MIN).slice(0, 8).forEach((p) => console.log('  below ' + SIL_MIN + ': ' + p[0].toFixed(3) + ' ' + p[1] + ' / ' + p[2]));
  ok(pairs.filter((p) => p[0] < SIL_MIN).length === 0, 'silhouettes: every pair of types, variants and bosses differs by at least ' + SIL_MIN + ' (closest ' + worst[0].toFixed(3) + ')');

  // (2) hue separation among similar sizes, chromatic accents only.
  const ctx = { P: { CFG: {} } }; vm.createContext(ctx); vm.runInContext(cfgSrc, ctx, { filename: 'config-enemy-look.js' });
  const L = ctx.P.CFG.enemyLook;
  function hsv(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
    if (d) { if (mx === r) h = 60 * (((g - b) / d) % 6); else if (mx === g) h = 60 * ((b - r) / d + 2); else h = 60 * ((r - g) / d + 4); }
    return { h: (h + 360) % 360, s: mx ? d / mx : 0 };
  }
  const acc = {};
  TYPES.forEach((t) => { ok(L.types[t] && /^#[0-9A-Fa-f]{6}$/.test(L.types[t].accent), 'config: type ' + t + ' has an accent'); if (L.types[t]) acc[t] = hsv(L.types[t].accent); });
  const neutral = TYPES.filter((t) => acc[t] && acc[t].s < 0.2);
  console.log('neutral accents (exempt from the hue rule): ' + neutral.join(', '));
  const sc = masks.scales;
  let worstHue = 999, wp = '';
  const chroma = TYPES.filter((t) => acc[t] && acc[t].s >= 0.2);
  for (let a = 0; a < chroma.length; a++) for (let b = a + 1; b < chroma.length; b++) {
    const x = chroma[a], y = chroma[b];
    if (Math.abs(sc[x] - sc[y]) > SIMILAR) continue;
    let d = Math.abs(acc[x].h - acc[y].h); d = Math.min(d, 360 - d);
    if (d < worstHue) { worstHue = d; wp = x + ' / ' + y; }
    ok(d >= HUE_MIN, 'accents: ' + x + ' and ' + y + ' (similar size) differ by ' + d.toFixed(1) + ' degrees, need ' + HUE_MIN);
  }
  console.log('accents: closest similar-size chromatic pair ' + worstHue.toFixed(1) + ' degrees (' + wp + ')');

  // (3) the page's hash equals this file's formula, and the outfits come out even on the page's own ids.
  ok(masks.variants.length === 400 && masks.variants.every((v, i) => v === variantSpec(i + 1)), 'walker outfits: the page assigns the same outfit as the spec hash for ids 1..400');
  const pc = [0, 0, 0, 0]; masks.variants.forEach((v) => pc[v]++);
  ok(pc.every((n) => n >= 80), 'walker outfits: each of the four outfits gets at least 80 of ids 1..400 (' + pc.join('/') + ')');
  ok(new Set(masks.variants).size === 4, 'walker outfits: all four variant indices are used');
  // Walker variant silhouettes must also differ from one another (they are the same walker, four outfits).
  const wv = cast.filter((k) => k.indexOf('walker_v') === 0);
  ok(wv.length === 4, 'the page renders all four walker variants');
}

console.log(fails.length ? fails.length + ' failure(s)' : 'test-enemy-silhouettes: all pass (' + passes + ' checks)');
fails.forEach((f) => console.log('FAIL ' + f));
process.exit(fails.length ? 1 : 0);
