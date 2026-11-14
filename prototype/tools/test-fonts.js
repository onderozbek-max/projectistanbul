// Font checks (design-system 4: one type set, comic display and body faces, Turkish glyphs). Static: reads css/*.css, the
// js/ sources (the canvas font strings and the CSS that js/view builds as strings), index.html, and the bundled font files
// in assets/fonts. No DOM, no browser. It proves:
//   (1) every @font-face has a font-display, a file that exists, and Bangers declares its weight range (no faux bold);
//   (2) the shared tokens (--hud-display, --hud-body, --display, --body, --m-display, --m-body) start with a comic face,
//       and their system fallbacks come after it and end with a generic family;
//   (3) every font / font-family declaration in css/ is a comic token or inherit, and no system family comes before one;
//   (4) every canvas or inline font string in js/ that names a system family has a comic family first (one allow-list
//       entry: the debug fps overlay in js/view/quality.js, a developer readout);
//   (5) button, input, select and textarea inherit the body face (a global rule per element, and any element rule that
//       sets a font sets a comic face or inherit);
//   (6) the Turkish sample and every non-ASCII character used in js/ and index.html is in BOTH bundled faces, except the
//       four symbols the comic faces lack (arrows, check, diamond), which must fall to the symbol faces in the token stacks.
// It cannot prove what a phone draws; see the playtest checklist in the report.
// Usage: node prototype/tools/test-fonts.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '');
const fails = [];
let passes = 0;
function check(cond, msg) { if (cond) passes++; else fails.push(msg); }

// ---- the vocabulary ----
// A comic token: a shared CSS variable that resolves to a bundled face, or a literal bundled family name.
const COMIC_RE = /var\(--(?:display|body|hud-display|hud-body|m-display|m-body|cm-title|cm-speech)\)|CM (?:Bangers|Comic Relief)|ComicArt\.TYPE/;
// A system family: anything that is not a bundled face. Impact, Comic Sans, cursive and the symbol faces are fallbacks, so
// they are only legal after a comic token.
const SYSTEM_RE = /Avenir|Barlow|Arial|Helvetica|Roboto|Segoe|Menlo|\bInter\b|Impact|Comic Sans|Chalkboard|\bcursive\b|\bserif\b|system-ui|apple-system|monospace|Noto Sans|Apple Symbols/;
const GENERIC_LAST = /(?:^|,)\s*(?:sans-serif|serif|cursive|monospace)\s*$/;

// Allow-lists. Each entry needs a rationale of 40+ characters; an entry that matches nothing is stale and fails.
const FONT_ALLOW = [
  { file: 'js/view/quality.js', match: 'ui-monospace,Menlo,monospace',
    why: 'Debug FPS overlay: a developer readout drawn only when the debug flag is on, not player-facing UI text.' },
];
const GLYPH_ALLOW = {
  '→': 'arrow in the evolution line and the route lines; not in either comic face, falls to the symbol faces in --hud-*',
  '←': 'back arrow on the settings and meta screens; not in either comic face, falls to the symbol faces in --hud-*',
  '✓': 'check mark for learned and on states; not in either comic face, falls to the symbol faces in --hud-*',
  '◆': 'diamond for the skill-tree point cost; not in either comic face, falls to the symbol faces in --hud-*',
};
const SYMBOL_FACES = ['Segoe UI Symbol', 'Apple Symbols', 'Noto Sans Symbols 2'];

// ---- a small CSS reader: rules with their at-rule context ----
function parseCss(css) {
  const out = [];
  let buf = '', i = 0;
  while (i < css.length) {
    if (css[i] !== '{') { buf += css[i++]; continue; }
    const pre = buf.trim(); buf = '';
    let d = 1, j = i + 1;
    while (j < css.length && d > 0) { if (css[j] === '{') d++; else if (css[j] === '}') d--; j++; }
    const body = css.slice(i + 1, j - 1);
    i = j;
    if (pre.startsWith('@media')) out.push(...parseCss(body));
    else if (pre.startsWith('@font-face')) out.push({ atFontFace: true, decls: decls(body) });
    else if (pre.startsWith('@')) continue;
    else out.push({ sel: pre, decls: decls(body) });
  }
  return out;
}
function decls(body) {
  return body.split(';').map(s => s.trim()).filter(Boolean).map(s => {
    const k = s.indexOf(':');
    return k < 0 ? null : { prop: s.slice(0, k).trim().toLowerCase(), value: s.slice(k + 1).trim() };
  }).filter(Boolean);
}
// Comic-first: the first comic token comes before any system family in the value.
function comicFirst(value) {
  const c = value.search(COMIC_RE), s = value.search(SYSTEM_RE);
  return c >= 0 && (s < 0 || c < s);
}

// ---- (1) the bundled faces ----
const cssFiles = fs.readdirSync(path.join(ROOT, 'css')).filter(f => f.endsWith('.css')).map(f => 'css/' + f);
const cssRules = {};
cssFiles.forEach(f => { cssRules[f] = parseCss(strip(read(f))); });
const faces = [];
cssFiles.forEach(f => cssRules[f].forEach(r => { if (r.atFontFace) faces.push({ file: f, decls: r.decls }); }));
const faceOf = (d, p) => { const x = d.find(z => z.prop === p); return x ? x.value.replace(/['"]/g, '').trim() : null; };
check(faces.length >= 3, 'font: expected the three bundled @font-face rules (CM Comic Relief x2, CM Bangers), found ' + faces.length);
faces.forEach(({ file, decls: d }) => {
  const fam = faceOf(d, 'font-family') || '?';
  const src = (faceOf(d, 'src') || '').match(/url\((.*?)\)/);
  const rel = src ? src[1].replace(/['"]/g, '') : '';
  check(!!faceOf(d, 'font-display'), file + ': @font-face "' + fam + '" has no font-display');
  check(!!rel && fs.existsSync(path.resolve(ROOT, 'css', rel)), file + ': @font-face "' + fam + '" file is missing: ' + rel);
  if (fam === 'CM Bangers') {
    const w = (faceOf(d, 'font-weight') || '').split(/\s+/).map(Number);
    check(w.length === 2 && w[0] <= 400 && w[1] >= 900,
      file + ': CM Bangers must declare font-weight 100 900 (the HUD and menus ask for 400-900; a single 400 face gets faux bold)');
  }
});

// ---- (2) the shared tokens ----
const proto = cssRules['css/proto.css'], meta = cssRules['css/meta.css'];
const rootDecls = (rules) => { const r = rules.find(x => x.sel === ':root'); return r ? r.decls : []; };
const tok = (decls, name) => { const x = decls.find(d => d.prop === name); return x ? x.value : null; };
const P = rootDecls(proto), M = (meta.find(x => x.sel === '.meta-root') || { decls: [] }).decls;
check(comicFirst(tok(P, '--hud-display') || ''), '--hud-display must start with CM Bangers, found: ' + tok(P, '--hud-display'));
check(comicFirst(tok(P, '--hud-body') || ''), '--hud-body must start with CM Comic Relief, found: ' + tok(P, '--hud-body'));
check(/^'CM Bangers'/.test(tok(P, '--hud-display') || ''), '--hud-display first family is CM Bangers');
check(/^'CM Comic Relief'/.test(tok(P, '--hud-body') || ''), '--hud-body first family is CM Comic Relief');
check(tok(P, '--display') === 'var(--hud-display)', '--display must alias --hud-display, found: ' + tok(P, '--display'));
check(tok(P, '--body') === 'var(--hud-body)', '--body must alias --hud-body, found: ' + tok(P, '--body'));
check(tok(M, '--m-display') === 'var(--hud-display)', 'meta.css --m-display must alias --hud-display, found: ' + tok(M, '--m-display'));
check(tok(M, '--m-body') === 'var(--hud-body)', 'meta.css --m-body must alias --hud-body, found: ' + tok(M, '--m-body'));
[['--hud-display', tok(P, '--hud-display')], ['--hud-body', tok(P, '--hud-body')]].forEach(([n, v]) => {
  const list = (v || '').split(',').map(s => s.trim());
  check(GENERIC_LAST.test(list[list.length - 1] || ''), n + ' must end with a generic family (sans-serif), found last: ' + list[list.length - 1]);
  SYMBOL_FACES.forEach(f => check(list.indexOf("'" + f + "'") > 0, n + ' must list the symbol face ' + f + ' after the comic face'));
});
check(/var\(--body\)/.test((cssRules['css/proto.css'].find(x => x.sel === 'body') || { decls: [] }).decls.map(d => d.value).join(' ')),
  'body must set its font from var(--body)');

// ---- (3) every font / font-family declaration in css/ ----
cssFiles.forEach(f => cssRules[f].forEach(r => {
  if (r.atFontFace) return;
  r.decls.forEach(d => {
    if (d.prop !== 'font' && d.prop !== 'font-family') return;
    if (/^(inherit|unset|initial)$/.test(d.value)) return;
    check(comicFirst(d.value), f + ' "' + r.sel + '" { ' + d.prop + ': ' + d.value + ' } has no comic face first');
  });
}));

// ---- (4) js/: canvas and inline font strings ----
function jsFiles(dir) {
  const out = [];
  fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).forEach(e => {
    const p = dir + '/' + e.name;
    if (e.isDirectory()) out.push(...jsFiles(p));
    else if (e.name.endsWith('.js')) out.push(p);
  });
  return out;
}
const JS = jsFiles('js');
check(JS.length > 100, 'font: expected to scan the js/ tree, found ' + JS.length + ' files');
const flagged = [];
JS.forEach(f => {
  read(f).split('\n').forEach(line => {
    const t = line.trim();
    if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return;
    if (!(/font/i.test(line) || /\bFONT\b|\bFAMILY\b/.test(line))) return;
    if (!SYSTEM_RE.test(line)) return;
    if (comicFirst(line)) return;
    flagged.push({ f, line: t });
  });
});
const usedAllow = new Set();
flagged.forEach(x => {
  const a = FONT_ALLOW.find(e => e.file === x.f && x.line.indexOf(e.match) >= 0);
  if (a) usedAllow.add(a); else check(false, x.f + ': a font string names a system family with no comic face first: ' + x.line.slice(0, 140));
});
FONT_ALLOW.forEach(a => {
  check(a.why.length >= 40, 'FONT_ALLOW entry ' + a.file + ' needs a rationale of 40+ characters');
  check(usedAllow.has(a), 'FONT_ALLOW entry ' + a.file + ' matches no flagged line (stale)');
});
// Inline CSS strings in js/ that style a form control or a button also need a comic face or inherit.
JS.forEach(f => {
  const src = strip(read(f));
  const re = /([^{}'"`;()\n]*\b(?:button|input|select|textarea)\b[^{}'"`\n]*)\{([^{}'"`\n]*)\}/g;
  let m;
  while ((m = re.exec(src))) {
    const body = m[2];
    if (!/font/.test(body)) continue;
    const fd = decls(body).filter(d => d.prop === 'font' || d.prop === 'font-family');
    fd.forEach(d => check(/^inherit$/.test(d.value) || comicFirst(d.value), f + ' "' + m[1].trim() + '" sets a non-comic font: ' + d.value));
  }
});

// ---- (5) button, input, select, textarea inherit the body face ----
const STATE_RE = /:(?:focus|focus-visible|hover|active|disabled|checked|visited|before|after|placeholder)/;
const elemOf = (sel) => {
  const base = sel.replace(/:where\(([^)]*)\)/g, ' $1 ').replace(/::?[\w-]+(\([^)]*\))?/g, '').trim();
  const last = base.split(/\s+|>|\+|~/).filter(Boolean).pop() || '';
  return last;
};
const globalInherit = {};
cssFiles.forEach(f => cssRules[f].forEach(r => {
  if (r.atFontFace || !r.sel) return;
  r.sel.split(',').map(s => s.trim()).forEach(s => {
    const e = elemOf(s);
    if (!/^(button|input|select|textarea)$/.test(e)) return;
    const fd = r.decls.filter(d => d.prop === 'font' || d.prop === 'font-family');
    if (STATE_RE.test(s)) return;   // a state rule (focus ring, hover) does not set the face
    check(fd.length > 0, f + ' "' + s + '" sets no font: a ' + e + ' does not inherit the body face by default');
    fd.forEach(d => { if (!/^inherit$/.test(d.value) && !comicFirst(d.value)) check(false, f + ' "' + s + '" font: ' + d.value); });
    if (fd.some(d => /^inherit$/.test(d.value))) globalInherit[e] = true;
  });
}));
['button', 'input', 'select', 'textarea'].forEach(e => check(!!globalInherit[e], 'no css rule sets font: inherit on ' + e));

// ---- (6) glyph coverage: a cmap reader for TrueType (formats 4 and 12) ----
function cmapOf(file) {
  const buf = fs.readFileSync(file), map = new Map();
  const n = buf.readUInt16BE(4);
  let off = -1;
  for (let i = 0; i < n; i++) { const rec = 12 + 16 * i; if (buf.toString('latin1', rec, rec + 4) === 'cmap') off = buf.readUInt32BE(rec + 8); }
  if (off < 0) return map;
  const nt = buf.readUInt16BE(off + 2);
  for (let i = 0; i < nt; i++) {
    const pid = buf.readUInt16BE(off + 4 + 8 * i), eid = buf.readUInt16BE(off + 6 + 8 * i), st = off + buf.readUInt32BE(off + 8 + 8 * i);
    if (!(pid === 0 || (pid === 3 && (eid === 1 || eid === 10)))) continue;
    const fmt = buf.readUInt16BE(st);
    if (fmt === 4) {
      const segX2 = buf.readUInt16BE(st + 6), seg = segX2 / 2;
      const endAt = st + 14, startAt = st + 16 + segX2, deltaAt = st + 16 + 2 * segX2, roAt = st + 16 + 3 * segX2;
      for (let s = 0; s < seg; s++) {
        const end = buf.readUInt16BE(endAt + 2 * s), start = buf.readUInt16BE(startAt + 2 * s);
        const delta = buf.readInt16BE(deltaAt + 2 * s), ro = buf.readUInt16BE(roAt + 2 * s);
        for (let c = start; c <= end && c < 0xFFFF; c++) {
          let g;
          if (ro === 0) g = (c + delta) & 0xFFFF;
          else { g = buf.readUInt16BE(roAt + 2 * s + ro + 2 * (c - start)); if (g) g = (g + delta) & 0xFFFF; }
          if (g && !map.has(c)) map.set(c, g);
        }
      }
    } else if (fmt === 12) {
      const ng = buf.readUInt32BE(st + 12);
      for (let k = 0; k < ng; k++) {
        const s0 = buf.readUInt32BE(st + 16 + 12 * k), e0 = buf.readUInt32BE(st + 20 + 12 * k), g0 = buf.readUInt32BE(st + 24 + 12 * k);
        for (let c = s0; c <= e0; c++) if (!map.has(c)) map.set(c, g0 + (c - s0));
      }
    }
  }
  return map;
}
const comicFaces = {
  'CM Bangers': cmapOf(path.join(ROOT, 'assets/fonts/Bangers-Regular.ttf')),
  'CM Comic Relief Regular': cmapOf(path.join(ROOT, 'assets/fonts/ComicRelief-Regular.ttf')),
  'CM Comic Relief Bold': cmapOf(path.join(ROOT, 'assets/fonts/ComicRelief-Bold.ttf')),
};
Object.keys(comicFaces).forEach(k => check(comicFaces[k].size > 100, 'glyph: could not read the cmap of ' + k));
// The Turkish sample from docs/design-system.md 4 must be complete in every face.
const TURKISH = 'ĞÜŞİÖÇğüşıöç İstanbul ılık şoför Çatal ŞANGIR';
Object.keys(comicFaces).forEach(k => {
  const miss = [...TURKISH].filter(ch => ch !== ' ' && !comicFaces[k].has(ch.codePointAt(0)));
  check(miss.length === 0, 'glyph: Turkish sample missing in ' + k + ': ' + miss.join(' '));
});
// Every non-ASCII character in js/ and index.html.
const nonAscii = new Map();
[...JS, 'index.html'].forEach(f => {
  [...read(f)].forEach(ch => {
    const cp = ch.codePointAt(0);
    if (cp > 127) { if (!nonAscii.has(ch)) nonAscii.set(ch, new Set()); nonAscii.get(ch).add(f); }
  });
});
const gapsSeen = new Set();
nonAscii.forEach((files, ch) => {
  const cp = ch.codePointAt(0);
  const gaps = Object.keys(comicFaces).filter(k => !comicFaces[k].has(cp));
  if (gaps.length === 0) return;
  if (GLYPH_ALLOW[ch]) { gapsSeen.add(ch); return; }
  check(false, 'glyph: ' + ch + ' (U+' + cp.toString(16).toUpperCase().padStart(4, '0') + ') is missing from ' + gaps.join(', ') +
    ' and is not in GLYPH_ALLOW; used in ' + [...files].slice(0, 3).join(', '));
});
Object.keys(GLYPH_ALLOW).forEach(ch => check(gapsSeen.has(ch),
  'glyph: GLYPH_ALLOW entry ' + ch + ' is stale (js/ and index.html no longer use it, or a comic face now covers it)'));

console.log('test-fonts: ' + passes + ' checks passed, ' + fails.length + ' failed');
fails.forEach(m => console.log('FAIL ' + m));
process.exit(fails.length ? 1 : 0);
