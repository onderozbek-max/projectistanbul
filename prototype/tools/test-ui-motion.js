// UI motion checks (T4 part 2; docs/design-system.md 7, 11, 13). Static: reads css/*.css, the CSS strings that
// js/view/objectives-hud.js injects, and the JS that touches motion. No DOM, no browser.
// It proves: every transition and animation duration is a --m-* token (or 0); the token set sits in the DS ranges; no
// loop runs faster than 0.5 Hz or on a full-screen container; keyframe names are unique and used; the reduce-motion
// switches (OS query and #phone.reduce-motion) turn every animation off except an opacity fade of --m-rm or less; a
// screen that is fading out lets taps through. It cannot prove real timing or the flash rate on a device (see the packet).
// It also checks the T4 part 4 effects (toast and panel exits, call card, page turns, death beat), the 48 px tap targets and
// the text-size setting (DS 4: 100, 125, 150%; every UI font size reads --ui-text). The exit helpers in ui-motion.js run in a
// vm sandbox with a fake clock. Canvas lettering is not checked here (it is outside DS 4's text size; see the review).
// Usage: node prototype/tools/test-ui-motion.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '');
const CSS_FILES = ['css/motion.css', 'css/proto.css', 'css/meta.css', 'css/comic.css', 'css/hood.css', 'css/progress.css'];
const INJECTED = ['js/view/objectives-hud.js'];   // these files build CSS as strings
const fails = [];
let passes = 0;
function check(cond, msg) { if (cond) passes++; else fails.push(msg); }

// ---- a small CSS reader: every rule with its @media context, and every @keyframes block ----
function rulesOf(css, media) {
  const out = [];
  let buf = '', i = 0;
  while (i < css.length) {
    if (css[i] !== '{') { buf += css[i++]; continue; }
    const pre = buf.trim();
    buf = '';
    let d = 1, j = i + 1;
    while (j < css.length && d > 0) { if (css[j] === '{') d++; else if (css[j] === '}') d--; j++; }
    const body = css.slice(i + 1, j - 1);
    i = j;
    if (pre.startsWith('@media')) out.push(...rulesOf(body, (media ? media + ' ' : '') + pre));
    else if (pre.startsWith('@keyframes')) out.push({ kind: 'keyframes', name: pre.split(/\s+/)[1], body: body, media: media || '' });
    else if (pre.startsWith('@')) continue;   // @font-face and friends
    else out.push({ kind: 'rule', sel: pre, body: body, media: media || '' });
  }
  return out;
}
function decls(body) {
  return body.split(';').map(s => s.trim()).filter(Boolean).map(s => {
    const k = s.indexOf(':');
    return k < 0 ? null : [s.slice(0, k).trim(), s.slice(k + 1).replace(/!important/g, '').trim(), /!important/.test(s)];
  }).filter(Boolean);
}

// ---- the token set (css/motion.css :root) ----
const TOK = {};
const motionRoot = rulesOf(strip(read('css/motion.css'))).find(r => r.kind === 'rule' && r.sel === ':root');
check(!!motionRoot, 'css/motion.css has a :root token block');
if (motionRoot) decls(motionRoot.body).forEach(([p, v]) => { if (p.startsWith('--m-')) TOK[p] = v; });
const toMs = v => { const m = /^(\d*\.?\d+)(ms|s)$/.exec(v || ''); return m ? parseFloat(m[1]) * (m[2] === 's' ? 1000 : 1) : null; };
const resolve = v => { const m = /^var\((--m-[a-z-]+)\)$/.exec(v); return m ? TOK[m[1]] : v; };

// Design-system ranges (docs/design-system.md 7 and 13; the user's brief for T4 part 2).
const RANGE = { '--m-press': [80, 120], '--m-enter': [180, 250], '--m-exit': [180, 250], '--m-stagger': [0, 40],
  '--m-count': [0, 800], '--m-rm': [0, 100], '--m-loop': [2000, Infinity], '--m-trail': [0, 1000], '--m-select': [0, 1000],
  '--m-pop': [0, 400], '--m-banner': [1000, 1500] };   // T4 part 5: the XP pop is a single pulse; the level-up banner is about 1.2 s
Object.keys(RANGE).forEach(k => {
  const ms = toMs(TOK[k]), r = RANGE[k];
  check(ms !== null && ms >= r[0] && ms <= r[1], `token ${k} must be ${r[0]}-${r[1]} ms (is ${TOK[k]})`);
});
Object.keys(TOK).forEach(k => {
  if (!/ease-(in|out)$/.test(k)) return;
  check(/^ease-(in|out)$/.test(TOK[k]), `${k} must be the keyword ${k.slice(-6)} (is ${TOK[k]})`);
});
check(TOK['--m-ease-in'] === 'ease-in' && TOK['--m-ease-out'] === 'ease-out', 'exits use ease-in and enters use ease-out');

// ---- every declaration in css/ and in the injected CSS strings ----
const sources = CSS_FILES.map(f => ({ f: f, css: strip(read(f)) }));
const all = [];       // { f, sel, media, prop, value, important }
const keyframes = []; // { f, name, body, media }
sources.forEach(({ f, css }) => rulesOf(css).forEach(r => {
  if (r.kind === 'keyframes') { keyframes.push({ f: f, name: r.name, body: r.body, media: r.media }); return; }
  decls(r.body).forEach(([p, v, imp]) => all.push({ f: f, sel: r.sel, media: r.media, prop: p, value: v, important: imp }));
}));
INJECTED.forEach(f => {
  const src = read(f);
  for (const m of src.matchAll(/(transition|animation):\s*([^;}'"]+)/g)) all.push({ f: f, sel: '(injected)', media: '', prop: m[1], value: m[2].trim(), important: false });
  for (const m of src.matchAll(/@keyframes ([\w-]+)/g)) keyframes.push({ f: f, name: m[1], body: '', media: '' });
});

// 2. durations: literal times are not allowed; every var() must be a declared token
const TIME_PROP = /^(transition|animation)(-duration|-delay)?$/;
const LIT = /(^|[^\w.-])(\d*\.?\d+)(ms|s)\b/g;
all.filter(d => TIME_PROP.test(d.prop)).forEach(d => {
  const lit = [...d.value.replace(/var\(--m-[a-z-]+\)/g, '').matchAll(LIT)].map(m => m[2] + m[3]).filter(x => parseFloat(x) !== 0);
  check(lit.length === 0, `${d.f} ${d.sel}: literal time ${lit.join(', ')} in "${d.prop}: ${d.value}" (use a --m-* token)`);
  for (const m of d.value.matchAll(/var\((--m-[a-z-]+)\)/g)) check(m[1] in TOK, `${d.f} ${d.sel}: undeclared token ${m[1]}`);
});

// 3. loops: each animation shorthand names its keyframes, its first time is the cycle; infinite cycles are >= 2 s
const KEYWORD = /^(ease|ease-in|ease-out|ease-in-out|linear|infinite|forwards|backwards|both|none|normal|alternate|running|steps\(.*\)|cubic-bezier\(.*\))$/;
const FULL_SCREEN = /(^|[\s,>+~(])(\.screen|#phone|#game|\.cm-page|\.hc-overlay)(?![\w-])/;
const usedNames = new Set();
let loops = 0;
all.filter(d => d.prop === 'animation' && d.value !== 'none').forEach(d => {
  d.value.split(/,(?![^(]*\))/).map(s => s.trim()).filter(Boolean).forEach(part => {
    const toks = part.split(/\s+(?![^(]*\))/);
    const name = toks.find(t => !/^(var\(|\d*\.?\d+(ms|s)$)/.test(t) && !KEYWORD.test(t));
    if (name) usedNames.add(name);
    const cycle = toMs(resolve(toks.find(t => /^(var\(|\d)/.test(t)) || '')) || 0;
    if (/\binfinite\b/.test(part)) {
      loops++;
      check(cycle >= RANGE['--m-loop'][0], `${d.f} ${d.sel}: loop "${name}" cycles every ${cycle} ms (0.5 Hz is 2000 ms)`);
      check(!FULL_SCREEN.test(d.sel), `${d.f} ${d.sel}: a loop runs on a full-screen container`);
    }
  });
});
check(loops > 0, 'the loop check found no infinite animation (parser problem?)');

// 5. keyframes: unique names, every one used, every used name declared
const kfNames = keyframes.map(k => k.name);
check(new Set(kfNames).size === kfNames.length, 'duplicate @keyframes name(s): ' + kfNames.filter((n, i) => kfNames.indexOf(n) !== i).join(', ') + ' (the later one silently wins)');
keyframes.forEach(k => check(usedNames.has(k.name), `@keyframes ${k.name} (${k.f}) is never used`));
usedNames.forEach(n => check(kfNames.indexOf(n) >= 0, `animation uses undeclared keyframes ${n}`));

// 4. reduce motion: one block for the OS query, one for the in-game class; each turns every animation off
const rules = [];
sources.forEach(({ f, css }) => rulesOf(css).forEach(r => { if (r.kind === 'rule') rules.push(Object.assign({ f: f }, r)); }));
const reduceOS = rules.find(r => /prefers-reduced-motion: reduce/.test(r.media) && r.sel.indexOf('*') === 0);
const reduceCls = rules.find(r => r.sel.indexOf('#phone.reduce-motion *') === 0);
const offIn = r => !!r && decls(r.body).some(([p, v, imp]) => p === 'animation' && v === 'none' && imp) &&
  decls(r.body).some(([p, v, imp]) => p === 'transition' && v === 'none' && imp);
check(offIn(reduceOS), 'css/motion.css: the OS reduce-motion query turns every animation and transition off (*)');
check(offIn(reduceCls), 'css/motion.css: #phone.reduce-motion turns every animation and transition off (*)');
check(!!reduceOS && reduceOS.f === 'css/motion.css' && !!reduceCls && reduceCls.f === 'css/motion.css', 'reduce-motion rules live in css/motion.css only');
// what may still animate under reduce motion: an opacity fade of --m-rm (or less) and nothing else
all.filter(d => d.prop === 'animation' && d.value !== 'none' && (/prefers-reduced-motion/.test(d.media) || d.sel.indexOf('#phone.reduce-motion') === 0))
  .forEach(d => {
    check(/^ui-fade var\(--m-rm\)/.test(d.value), `${d.f} ${d.sel}: under reduce motion only ui-fade at --m-rm may run (is "${d.value}")`);
  });
const uiFade = keyframes.find(k => k.name === 'ui-fade');
check(!!uiFade && !/transform|translate|scale|rotate|skew|top|left/.test(uiFade.body), 'ui-fade is opacity only');
// only a media query or a #phone.reduce-motion selector is a reduce-motion rule; a gate such as
// #phone.dying:not(.reduce-motion) #game is a normal rule (the zoom is simply not set under the in-game switch)
check(!all.some(d => d.f !== 'css/motion.css' && (/prefers-reduced-motion/.test(d.media) || /^#phone\.reduce-motion/.test(d.sel))),
  'no css file other than css/motion.css has a reduce-motion rule (a media query or #phone.reduce-motion selector)');
check(kfNames.length > 0, 'keyframes found');
// the global reduce override covers every keyframes name, so no animation can escape it
if (reduceOS && reduceCls) console.log(`reduce-motion covers ${kfNames.length} keyframes names through the global override; ui-fade is the only one allowed`);

// input: a screen that fades in keeps taps live; a screen that fades out lets them pass
all.filter(d => /\.screen\b/.test(d.sel) && d.prop === 'animation' && !/is-leaving/.test(d.sel))
  .forEach(d => check(!all.some(e => e.sel === d.sel && e.prop === 'pointer-events'), `${d.f} ${d.sel}: an entering screen must not block taps`));
const leaving = all.find(d => /\.screen\.is-leaving/.test(d.sel) && d.prop === 'pointer-events');
check(!!leaving && leaving.value === 'none', 'a leaving screen has pointer-events none (taps pass through at once)');

// 6. JS: tokens named in JS exist; the screens and the helper use the shared timings; the wiring is in index.html
const jsFiles = [];
(function walk(dir) {
  fs.readdirSync(dir).forEach(n => {
    const p = path.join(dir, n);
    if (fs.statSync(p).isDirectory()) walk(p); else if (/\.js$/.test(n)) jsFiles.push(path.relative(ROOT, p));
  });
})(path.join(ROOT, 'js'));
const jsTokens = new Set();
jsFiles.forEach(f => { for (const m of read(f).matchAll(/--m-[a-z]+(-[a-z]+)*/g)) jsTokens.add(m[0]); });
jsTokens.forEach(t => check(t in TOK, `JS names an undeclared token ${t}`));
const helper = read('js/view/ui-motion.js');
check(!/setTimeout\([^;]*,\s*\d+\s*\)/.test(helper), 'ui-motion.js: no literal timer delay (use a token)');
const screens = read('js/view/screens.js');
check(/P\.UIMotion\.stagger\(i\)/.test(screens) && !/\* 70\b/.test(screens), 'screens.js: the card stagger comes from the token (no literal 70 ms step)');
check(/P\.UIMotion\.screen\(/.test(screens), 'screens.js: screens show and hide through P.UIMotion.screen (fade out)');
check(/P\.UIMotion\.countUp\(/.test(screens), 'screens.js: the results rewards count up through P.UIMotion.countUp');
check(/reduce-motion/.test(read('js/view/settings.js')) && /prefers-reduced-motion/.test(read('js/view/settings.js')),
  'settings.js sets the reduce-motion class and reads the OS query');
const html = read('index.html');
const at = s => html.indexOf(s);
check(at('css/motion.css') >= 0 && at('css/motion.css') < at('css/proto.css'), 'index.html loads css/motion.css before css/proto.css');
check(at('js/view/ui-motion.js') >= 0 && at('js/view/ui-motion.js') < at('js/view/screens.js'), 'index.html loads js/view/ui-motion.js before js/view/screens.js');

// ---- T4 part 4: exits, call card, page turns, death beat ----
const cssOf = f => sources.find(s => s.f === f).css;
const codeOf = f => strip(read(f)).replace(/\/\/[^\n]*/g, '');   // JS without comments
const motionCss = cssOf('css/motion.css'), protoCss = cssOf('css/proto.css'), metaCss = cssOf('css/meta.css'), comicCss = cssOf('css/comic.css');
check(/\.is-out\s*\{[^}]*opacity:\s*0/.test(motionCss) && /\.is-out\s*\{[^}]*var\(--m-exit\)/.test(motionCss), 'css/motion.css: .is-out fades over --m-exit');
check(/\.toast\.is-out\s*\{/.test(protoCss) && /\.meta-toast\.is-out\s*\{/.test(metaCss), 'the HUD toast and the meta toast each have an is-out rule (their own transform is kept)');
check(/leave\(el\.toast, 'is-out'/.test(read('js/view/ui.js')), 'ui.js: the HUD toast leaves through P.UIMotion.leave');
check(/leave\(n, 'is-out'/.test(read('js/meta/meta-hub.js')), 'meta-hub.js: the reward toast leaves through P.UIMotion.leave');
check(/classList\.add\('is-out'\)[\s\S]{0,160}P\.UIMotion\.ms\('--m-exit'\)/.test(read('js/meta/meta-ui.js')), 'meta-ui.js: the meta toast fades out for --m-exit');
['js/meta/meta-hub.js', 'js/meta/meta-tree.js', 'js/meta/meta-stats.js', 'js/meta/meta-arsenal.js', 'js/meta/meta-gear.js'].forEach(f => {
  const s = read(f);
  check(/UIMotion\.panelShow\(/.test(s) && /UIMotion\.panelHide\(/.test(s) && /UIMotion\.panelOpen\(/.test(s), f + ': panels show, hide and report open through P.UIMotion.panel*');
});
// the meta root and the level-up sheet still hide without an exit (listed as not built in REVIEW-R1); any other direct hide fails
const directHide = jsFiles.filter(f => /^js\/meta\//.test(f) && /classList\.add\('meta-hidden'\)/.test(read(f))).sort();
check(JSON.stringify(directHide) === JSON.stringify(['js/meta/meta-stats.js', 'js/meta/meta-ui.js']),
  'direct meta-hidden hides: ' + directHide.join(', ') + ' (expected only the level-up sheet in meta-stats.js and the meta root in meta-ui.js)');
const comicJs = codeOf('js/view/comic.js');
check(/\.cm-call\.is-enter-from\s*\{[^}]*translate:\s*0 -16px[^}]*opacity:\s*0/.test(comicCss), 'comic.css: the call card enters from 16 px above, faded out');
check(/\.cm-call\.is-leaving\s*\{[^}]*translate:\s*0 -16px[^}]*opacity:\s*0/.test(comicCss), 'comic.css: the call card leaves the same way');
check(!/\.cm-call\.is-(enter-from|leaving)\s*\{[^}]*transform/.test(comicCss), 'the call card uses translate, not transform (the ring shake keeps transform)');
check(/reduced\(\) \? ' cm-reduce' : ' is-enter-from'/.test(comicJs) && /void card\.offsetHeight;\s*card\.classList\.remove\('is-enter-from'\)/.test(comicJs),
  'comic.js: the call card enters from the offset state, and never under Reduce motion');
check(/rec\.leaving \|\| reduced\(\)/.test(comicJs) && /classList\.add\('is-leaving'\)/.test(comicJs), 'comic.js: the call exit is skipped under Reduce motion');
check(/OUT_HOLD = [\d.]+, TURN_GAP = 0\.5\b/.test(comicJs), 'comic.js: TURN_GAP is 0.5 s, so two page slides a second at most');
check(/function turnGrid\(/.test(comicJs) && /function turnUpdate\(/.test(comicJs) && /P\.UIMotion\.ms\('--m-enter'\)/.test(comicJs), 'comic.js: page turns are JS-driven over --m-enter (turnGrid, turnUpdate)');
check(/if \(!old \|\| !old\.childElementCount \|\| reduced\(\) \|\| book\.turnIn > 0\)/.test(comicJs), 'comic.js: a page change is instant under Reduce motion or within TURN_GAP of the last');
const dbCode = codeOf('js/view/death-beat.js');
check(/P\.Settings\.reduceMotion/.test(dbCode) && /--death-x/.test(dbCode) && /--death-y/.test(dbCode), 'death-beat.js: sets the zoom origin, and does nothing under Reduce motion');
check(!/\bsim\.[\w.]+\s*(\+\+|--|[+\-*\/]?=(?!=))/.test(dbCode) && !/\bdt\b|setTimeout|requestAnimationFrame|P\.Time/.test(dbCode),
  'death-beat.js is view only (no sim write, no timer, no dt)');
const mainJs = codeOf('js/main.js');
check(mainJs.indexOf('P.DeathBeat.focus(sim)') > 0 && mainJs.indexOf('P.DeathBeat.focus(sim)') < mainJs.indexOf("phone.classList.add('dying')"),
  'main.js: the zoom origin is set before the dying class starts the transition');
check(at('js/view/death-beat.js') > at('js/view/render.js') && at('js/view/death-beat.js') >= 0, 'index.html loads js/view/death-beat.js after render.js');
const zoom = /#phone\.dying:not\(\.reduce-motion\) #game\s*\{[^}]*scale\((\d*\.?\d+)\)/.exec(protoCss);
check(!!zoom && +zoom[1] > 1 && +zoom[1] <= 1.1, 'proto.css: the death zoom is a scale between 1 and 1.1 (5 percent), gated by the in-game switch');
check(/#game\s*\{[^}]*transform var\(--m-beat\)/.test(protoCss), 'proto.css: the death zoom eases over --m-beat');
check(/#phone\.dying #game\s*\{\s*transform:\s*none !important/.test(motionCss), 'css/motion.css: the death zoom stays still under the OS reduce query');
check(!/#phone\.dying[^{]*\{[^}]*animation:/.test(protoCss), 'the death zoom is a transition, not a loop');

// ---- tap targets (DS 5, 11: 48 dp) ----
const sizeOf = (sel, prop, px) => all.some(d => d.prop === prop && d.value === px + 'px' && d.sel.split(',').map(s => s.trim()).indexOf(sel) >= 0);
[['.cm-skip', 'width', 48], ['.cm-skip', 'height', 48], ['.toggle', 'min-height', 48], ['#btn-reroll', 'min-height', 48],
 ['.meta-iconbtn', 'width', 48], ['.meta-iconbtn', 'height', 48], ['.meta-attr-btn', 'width', 48], ['.meta-attr-btn', 'height', 48],
 ['.meta-tab', 'min-height', 48]].forEach(([sel, prop, px]) => check(sizeOf(sel, prop, px), sel + ' is ' + px + ' px (' + prop + '; 48 dp tap target)'));
// buttons and role=button spans: the hub tabs, the cold-open skip, the mod options. Text blocks (.cm-call-sub, .cold-subs) are not targets.
['.skip', '.mod-opt', '.meta-hub-tab'].forEach(sel => check(sizeOf(sel, 'min-height', 48), sel + ' is at least 48 px tall (min-height; 48 dp tap target)'));
check(!all.some(d => d.prop === 'min-height' && /^(36|40|44|46)px$/.test(d.value) && d.sel.indexOf('.cm-call-sub') < 0 && d.sel.indexOf('.cold-subs') < 0),
  'no button-sized min-height of 36, 40, 44 or 46 px');

// ---- text size (DS 4, 11; settings textSize 100, 125 or 150) ----
check(/:root\s*\{[^}]*--ui-text:\s*1;/.test(motionCss), 'css/motion.css: --ui-text defaults to 1 on :root');
// the value with every calc() that reads --ui-text removed (balanced parentheses); any px left over is an unscaled UI size
const unscaled = value => {
  let out = '', i = 0;
  while (i < value.length) {
    const k = value.indexOf('calc(', i);
    if (k < 0) { out += value.slice(i); break; }
    out += value.slice(i, k);
    let depth = 0, j = k + 4;
    for (; j < value.length; j++) { if (value[j] === '(') depth++; else if (value[j] === ')' && --depth === 0) break; }
    const inner = value.slice(k, j + 1);
    if (!/--ui-text/.test(inner)) out += inner;
    i = j + 1;
  }
  return out;
};
const fontBad = [];
all.filter(d => /^(font-size|font|line-height)$/.test(d.prop)).forEach(d => {
  if (/\d(\.\d+)?px\b/.test(unscaled(d.value))) fontBad.push(d.f + ' ' + d.sel + ': ' + d.value);
});
// CSS built as strings in JS (the HUD and the finale), and any colon-style font in js/ (canvas text uses .font = and is not UI)
jsFiles.forEach(f => {
  for (const m of read(f).matchAll(/font(?:-size)?:\s*([^;'"}]+)/g)) if (/\d(\.\d+)?px\b/.test(unscaled(m[1]))) fontBad.push(f + ': ' + m[1].trim());
});
check(fontBad.length === 0, 'every UI font size reads --ui-text (calc(Npx * var(--ui-text, 1))); unscaled: ' + fontBad.slice(0, 3).join(' | '));
check(/#scr-settings \.list\s*\{[^}]*flex:\s*none/.test(protoCss), 'proto.css: the settings list does not shrink (at 150% the screen scrolls, no row is cut)');
check(/\.meta-tabs\s*\{[^}]*overflow-x:\s*auto/.test(metaCss), 'meta.css: the meta tab row scrolls sideways at 150%');
check(/\.screen\.overlay\s*\{[^}]*overflow-y:\s*auto/.test(protoCss) && /\.screen\.overlay > :first-child\s*\{[^}]*margin-top:\s*auto/.test(protoCss),
  'proto.css: overlays scroll and centre with auto margins (the top of a tall card is never cut at 150%)');
const settingsJs = read('js/view/settings.js');
check(/TEXT_STEPS = \[100, 125, 150\]/.test(settingsJs) && /textSize: 100/.test(settingsJs), 'settings.js: text size offers 100, 125 and 150 and defaults to 100');
check(/TEXT_STEPS\.indexOf\(P\.Settings\.textSize\) < 0/.test(settingsJs), 'settings.js: a saved text size that is not offered falls back to 100');
check(/setProperty\('--ui-text', String\(P\.Settings\.textSize \/ 100\)\)/.test(settingsJs), 'settings.js: applySettings sets --ui-text on #phone');
check(/localStorage\.setItem\(KEY, JSON\.stringify\(P\.Settings\)\)/.test(settingsJs), 'settings.js: the settings object (text size included) is saved to localStorage');
check(/row\(P\.t\('ui\.set\.textSize'\), step\('textSize', P\.SettingSteps\.text/.test(read('js/view/screens.js')), 'screens.js: the Settings screen has a text size row');
const strings = read('js/strings-ui2.js');
const trAt = strings.indexOf('P.STR.tr'), enAt = strings.indexOf('P.STR.en');
check(strings.indexOf("'ui.set.textSize': 'Yazı boyutu'") > trAt && strings.indexOf("'ui.set.textSize': 'Yazı boyutu'") < enAt
  && strings.indexOf("'ui.set.textSize': 'Text size'") > enAt, 'strings-ui2.js: ui.set.textSize has a TR ("Yazı boyutu") and an EN ("Text size") entry');
check(!/\/\/ TR owner check/.test(strings), 'the TR text-size label is owner-approved (T4 part 9): no "// TR owner check" comment in strings-ui2.js');

// ---- T4 part 5: the level-up banner, the XP pop and the results count-up (css/progress.css, js/view/ui-progress.js) ----
const progCss = cssOf('css/progress.css'), progJs = codeOf('js/view/ui-progress.js');
check(/\.lvl-banner\s*\{[^}]*pointer-events:\s*none/.test(progCss), 'progress.css: the level-up banner takes no taps (pointer-events none)');
check(/\.lvl-banner\s*\{[^}]*var\(--m-enter\)/.test(progCss) && /\.lvl-banner\.is-out\s*\{[^}]*opacity:\s*0/.test(progCss),
  'progress.css: the banner enters over --m-enter and leaves faded over --m-exit');
check(/\.xp-bar\.is-pop\s*\{\s*animation:\s*xp-pop var\(--m-pop\) var\(--m-ease-pop\) 1;?\s*\}/.test(progCss),
  'progress.css: the XP pop is one pulse over --m-pop (iteration count 1, no loop)');
check(!/infinite/.test(progCss), 'progress.css: nothing in the progress styles loops');
check(/prefers-reduced-motion: reduce\)[\s\S]*?\.lvl-banner[\s\S]*?ui-fade/.test(motionCss) && /#phone\.reduce-motion :is\([\s\S]*?\.lvl-banner[\s\S]*?ui-fade/.test(motionCss),
  'css/motion.css: the level-up banner is in both reduce-motion lists (it fades only)');
check(/#phone\.overlay-up \.lvl-banner\s*\{[^}]*display:\s*none/.test(progCss), 'progress.css: the banner is hidden while an overlay is up');
check(/if \(!bar \|\| P\.UIMotion\.reduced\(\)\) return;/.test(progJs), 'ui-progress.js: the XP pop is skipped under Reduce motion');
check(/P\.UIMotion\.ms\('--m-banner'\)/.test(progJs) && /P\.UIMotion\.ms\('--m-pop'\)/.test(progJs), 'ui-progress.js: the banner and the pop take their time from the tokens');
check(/P\.UIMotion\.countUp\(/.test(progJs), 'ui-progress.js: the results recap counts up through P.UIMotion.countUp');
check(!/setTimeout\([^;]*,\s*\d+\s*\)/.test(progJs), 'ui-progress.js: no literal timer delay (the banner and pop use tokens)');
check(/\.xp-tick\s*\{/.test(progCss) && /TICKS = \[25, 50, 75\]/.test(progJs), 'the XP bar has milestone ticks at 25, 50 and 75 percent');

// ---- behaviour: the exit helpers in js/view/ui-motion.js, run in a vm sandbox with a fake clock and a fake node ----
const vm = require('vm');
const helperSrc = read('js/view/ui-motion.js');
function fakeNode() {
  const names = new Set();
  return { names: names, _leave: 0, classList: {
    add: (...c) => c.forEach(x => names.add(x)),
    remove: (...c) => c.forEach(x => names.delete(x)),
    contains: c => names.has(c) } };
}
function helperWith(reduced, exitMs) {
  const timers = [];
  let nextId = 1;
  const ctx = {
    P: { Settings: { reduceMotion: reduced } },
    document: { documentElement: {}, getElementById: () => null },
    window: { getComputedStyle: () => ({ getPropertyValue: n => (n === '--m-exit' ? exitMs + 'ms' : '') }) },
    setTimeout: (fn, ms) => { const id = nextId++; timers.push({ id: id, fn: fn, ms: ms }); return id; },
    clearTimeout: id => { const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); }
  };
  vm.createContext(ctx);
  vm.runInContext(helperSrc, ctx);
  return { U: ctx.P.UIMotion, timers: timers, run: () => timers.splice(0).forEach(t => t.fn()) };
}
{
  const h = helperWith(false, 180), n = fakeNode();
  const id = h.U.leave(n, 'is-out', () => { n.done = true; });
  check(n.names.has('is-out') && !n.done && id !== 0, 'leave: the class goes on at once and done waits');
  check(h.timers.length === 1 && h.timers[0].ms === 180, 'leave: done waits --m-exit (180 ms)');
  h.run();
  check(n.done === true, 'leave: done runs when the exit has run');
}
{
  const h = helperWith(true, 180), n = fakeNode();
  const id = h.U.leave(n, 'is-out', () => { n.done = true; });
  check(n.done === true && id === 0 && !n.names.has('is-out') && h.timers.length === 0, 'leave under Reduce motion: done at once, no class, no timer');
}
{
  const h = helperWith(false, 180), n = fakeNode();
  h.U.panelShow(n);
  check(h.U.panelOpen(n), 'panelShow: the panel is open');
  h.U.panelHide(n);
  check(!h.U.panelOpen(n) && n.names.has('is-out') && !n.names.has('meta-hidden'), 'panelHide: the panel is leaving, not yet hidden, and not open');
  h.run();
  check(n.names.has('meta-hidden') && !n.names.has('is-out') && !h.U.panelOpen(n), 'panelHide: after the exit the panel is meta-hidden');
  h.U.panelShow(n);
  h.U.panelHide(n); h.U.panelShow(n);
  check(h.timers.length === 0 && h.U.panelOpen(n), 'panelShow during an exit cancels it (no timer left, panel open)');
}
{
  const h = helperWith(true, 180), n = fakeNode();
  h.U.panelShow(n); h.U.panelHide(n);
  check(n.names.has('meta-hidden') && !h.U.panelOpen(n), 'panelHide under Reduce motion hides at once');
  h.U.panelHide(n);
  check(h.timers.length === 0, 'panelHide on a hidden panel does nothing');
}
{
  const h = helperWith(false, 180), n = fakeNode();
  h.U.screen(n, false);
  check(n.names.has('is-leaving') && !n.names.has('hidden'), 'screen: a hide fades out first (is-leaving, not hidden)');
  h.run();
  check(n.names.has('hidden') && !n.names.has('is-leaving'), 'screen: hidden after --m-exit');
  h.U.screen(n, true);
  check(!n.names.has('hidden') && !n.names.has('is-leaving'), 'screen: showing it again removes hidden');
}

// ---- T4 part 8 follow-ups, revised in T4 part 9 (Voice slider removed): the sound sliders, the results screen, the HUD at 150% ----
const settingsCode = codeOf('js/view/settings.js'), screensCode = codeOf('js/view/screens.js');
const sfxSrc = read('js/view/sfx.js');
check(/musicVol: 100, sfxVol: 100, haptics/.test(settingsCode), 'settings.js: musicVol and sfxVol default to 100 (no voiceVol default)');
check(/delete P\.Settings\.voiceVol;/.test(settingsCode) && !/voiceVol/.test(settingsCode.replace(/delete P\.Settings\.voiceVol;/, '')),
  'settings.js: the Voice slider is retired; a saved voiceVol is deleted at load and never read or written');
check(/Math\.round\(Math\.min\(100, Math\.max\(0, v\)\) \/ 10\) \* 10/.test(settingsCode), 'settings.js: a saved volume is clamped to 0-100 and rounded to the 10% step');
check(/P\.Settings\.sound === false && !\('sfxVol' in data\)/.test(settingsCode) && /P\.Settings\.sound = true;/.test(settingsCode),
  'settings.js: the old Sound effects switch (off) becomes 0% sound effects; the flag itself stays true');
check(/P\.Sfx\.setVolume\('sfx', fx\); P\.Sfx\.setVolume\('ui', fx\); P\.Sfx\.setVolume\('ambience', fx\);/.test(settingsCode) && !/setVolume\('voice'/.test(settingsCode),
  'settings.js: applySettings sets the sfx, ui and ambience buses from Sound effects; the voice bus is not set separately');
check(/bus\[k\]\.connect\(k === 'voice' \? bus\.sfx : comp\)/.test(sfxSrc) && /CATS = \{ sfx: 0\.85, ui: 0\.8, voice: 0\.95, ambience: 0\.5 \}/.test(sfxSrc),
  'sfx.js: the voice bus sits inside the sfx bus, so Sound effects covers speech blips and groans (setVolume("voice") still works as a trim inside it)');
check(/P\.Music\.setVolume\(MUSIC_BASE \* P\.Settings\.musicVol \/ 100\)/.test(settingsCode), 'settings.js: applySettings sets the music level from Music (P.Music.setVolume exists; music.js is untouched)');
check(/row\(P\.t\('ui\.set\.music'\), volume\('musicVol'/.test(screensCode) && /row\(P\.t\('ui\.set\.sound'\), volume\('sfxVol'/.test(screensCode)
  && !/ui\.set\.voice|voiceVol/.test(screensCode), 'screens.js: Settings has Music and Sound effects sliders and no Voice row');
check(!/toggle\('sound'\)/.test(screensCode) && !/P\.SettingSteps\.music/.test(screensCode), 'screens.js: the old sound toggle and the music step row are gone');
check(/inp\.type = 'range'; inp\.min = '0'; inp\.max = '100'; inp\.step = '10'/.test(screensCode) && /inp\.onchange = function \(\) \{ P\.saveSettings\(\); \}/.test(screensCode),
  'screens.js: the slider is a 0-100 range in 10% steps, saved when released');
check(!/oninput = function \(\) \{[^}]*showSettings/.test(screensCode), 'screens.js: dragging a slider does not redraw the list (no re-render mid-drag)');
check(/\.vol input\[type=range\]\s*\{[^}]*height:\s*48px/.test(protoCss) && /\.vol\s*\{[^}]*min-height:\s*48px/.test(protoCss),
  'proto.css: the volume slider is a 48 px tap band');
check(/::-webkit-slider-thumb\s*\{[^}]*width:\s*28px/.test(protoCss) && /::-moz-range-thumb\s*\{[^}]*width:\s*28px/.test(protoCss), 'proto.css: the slider thumb is 28 px (WebKit and Firefox)');
check(!/\.vol[^{]*\{[^}]*(transition|animation)/.test(protoCss), 'proto.css: the volume sliders have no transition or animation (nothing to stop under Reduce motion)');
// T4 part 9: the results body scrolls on its own and the actions are a footer under it (a sticky block covered the recap)
check(/#scr-results \.res-body\s*\{[^}]*overflow-y:\s*auto/.test(progCss) && /\.res-actions\s*\{[^}]*flex:\s*none/.test(progCss) && !/position:\s*sticky/.test(progCss),
  'progress.css: the results body scrolls and the actions are a footer (no sticky block over the recap)');
const resultsHtml = read('index.html').slice(read('index.html').indexOf('id="scr-results"'), read('index.html').indexOf('</section>', read('index.html').indexOf('id="scr-results"')));
check(/<div class="res-body">/.test(resultsHtml) && /<div class="res-actions">/.test(resultsHtml) && resultsHtml.indexOf('res-body') < resultsHtml.indexOf('res-actions') && !/class="spacer"/.test(resultsHtml),
  'index.html: the results head, rewards and recap sit in .res-body, the actions after it, no spacer');
check(/<div id="res-run" class="hidden"><\/div>/.test(resultsHtml) && /getElementById\('res-run'\)/.test(read('js/view/objectives-hud.js')) && !/res-run/.test(read('js/view/ui-progress.js')),
  'index.html: res-run is only the hidden anchor for the objective panel (objectives-hud.js); the time and walk rows are in the recap');
check(!/kv\(rw, P\.t\('ui\.res\.kills'\)/.test(screensCode) && /kv\(rw, P\.t\('ui\.res\.hurda'\)/.test(screensCode),
  'screens.js: the rewards list has no kills row (the run recap already shows kills); Hurda stays');
check(!/'ui\.set\.voice'/.test(strings) && !/'ui\.set\.voice'/.test(read('js/strings.js')), 'the Voice label key is gone from both string tables (T4 part 9)');
check(/'ui\.set\.music': 'Müzik'/.test(strings) && !/TR owner check/.test(strings), 'strings-ui2.js: the owner-approved TR labels (Müzik, Yazı boyutu) carry no "TR owner check" comment');
const stringsMain = read('js/strings.js');
check(/'ui\.set\.sound': 'Ses efektleri'/.test(stringsMain) && !/TR owner check/.test(stringsMain), 'strings.js: the owner-approved TR Ses efektleri label carries no "TR owner check" comment');
check(/'ui\.set\.sound': 'Sound effects'/.test(stringsMain), 'strings.js: the EN Sound effects label exists');
// the HUD: at 150% text Street Cred moves to row 2 (settings.js), so the streak chip keeps the XP line and the XP bar room
const htmlNow = read('index.html');
check(htmlNow.indexOf('id="sk-meter"') > htmlNow.indexOf('class="hud-xp"') && htmlNow.indexOf('id="sk-meter"') < htmlNow.indexOf('class="hud-sub"'),
  'index.html: Street Cred (sk-meter) starts in the XP line');
check(htmlNow.indexOf('id="streak"') > htmlNow.indexOf('class="hud-xp"') && htmlNow.indexOf('id="streak"') < htmlNow.indexOf('class="hud-sub"'),
  'index.html: the streak chip stays in the XP line');
check(/#streak-label\s*\{[^}]*max-width:\s*112px/.test(protoCss), 'proto.css: the streak label is 112 px wide at most (COMBO 12/60 is not clipped at 150%)');
check(/textSize >= 150 \? sub : xp/.test(settingsJs) && /insertBefore\(sk, host === sub/.test(settingsJs),
  'settings.js: at 150% text applySettings moves Street Cred into HUD row 2 (a DOM move, not a re-render)');

// settings behaviour (vm, a stored save and fake audio): the boot values, the 10% rounding, the old on/off switch and the retired voice key
function bootSettings(stored) {
  const pushed = { sfx: [], music: [] }, ctx = {
    P: { Sfx: { setVolume: (c, v) => pushed.sfx.push([c, v]) }, Music: { setVolume: v => pushed.music.push(v) } },
    Math, JSON, Object, Array, isFinite,
    localStorage: { getItem: () => stored, setItem: (k, v) => { ctx.saved = v; } }, matchMedia: () => ({ matches: false }) };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(settingsJs, ctx);
  ctx.P.applySettings();
  return { S: ctx.P.Settings, pushed: pushed, saved: ctx.saved };
}
{
  const d = bootSettings('null');
  check(d.S.musicVol === 100 && d.S.sfxVol === 100 && !('voiceVol' in d.S), 'settings (vm): the two volumes default to 100 with no save, and there is no voice volume');
  check(JSON.stringify(d.pushed.sfx) === JSON.stringify([['sfx', 1], ['ui', 1], ['ambience', 1]]) && Math.abs(d.pushed.music[0] - 0.7) < 1e-9,
    'settings (vm): at boot the sfx, ui and ambience buses are set to 1 (voice rides the sfx bus) and the music level to 0.7 (the default mix)');
  check(typeof d.saved === 'string' && d.saved.indexOf('"sfxVol":100') >= 0 && d.saved.indexOf('voiceVol') < 0, 'settings (vm): the volumes are saved with the other settings, and no voice value is written');
  const o = bootSettings(JSON.stringify({ musicVol: 25, sfxVol: 55 }));
  check(o.S.musicVol === 30 && o.S.sfxVol === 60, 'settings (vm): saved volumes round to the 10% step (25 to 30, 55 to 60)');
  const old = bootSettings(JSON.stringify({ musicVol: 80, sfxVol: 70, voiceVol: 0 }));
  check(old.S.sfxVol === 70 && !('voiceVol' in old.S) && old.pushed.sfx.every(p => p[0] !== 'voice') && old.saved.indexOf('voiceVol') < 0,
    'settings (vm): an old saved voice value (0) is ignored: sound effects keep their own value and the voice key is dropped on save');
  const off = bootSettings(JSON.stringify({ sound: false }));
  check(off.S.sfxVol === 0 && off.S.sound === true && off.pushed.sfx.some(p => p[0] === 'sfx' && p[1] === 0),
    'settings (vm): the old Sound effects switch set to off becomes 0% sound effects, and the sfx bus is pushed at 0');
  const offSlider = bootSettings(JSON.stringify({ sound: false, sfxVol: 40 }));
  check(offSlider.S.sfxVol === 40, 'settings (vm): a saved sfxVol wins over the old switch');
  const bad = bootSettings(JSON.stringify({ musicVol: 'abc', sfxVol: 250 }));
  check(bad.S.musicVol === 100 && bad.S.sfxVol === 100, 'settings (vm): a non-number falls back to 100; numbers clamp to 0-100');
}

console.log(fails.length ? fails.length + ' failure(s)' : 'test-ui-motion: all pass (' + passes + ' checks)');
fails.forEach(m => console.log('FAIL ' + m));
process.exit(fails.length ? 1 : 0);
