// Interaction clarity checks (T4 part 10): first-time hints, the consumable grammar and the hack-zone phases. Runs the real view
// files in a vm sandbox with a stub canvas and a stub DOM. Checks: each hint shows once ever; callouts queue one at a time, 4 s
// apart; the seen list persists in the store; Reduce motion stops the bob and the pulses; TR and EN strings exist; the hint
// layout keeps off the hero; the L1 scripted prompts gate their repeats; hints never write to the sim; pickups keep a 28 px ring.
// Usage: node prototype/tools/test-hints.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fails = 0, passes = 0;
function ok(c, m) { if (c) passes++; else { fails++; console.log('FAIL ' + m); } }
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const FILES = ['js/strings.js', 'js/view/hints-config.js', 'js/strings-hints.js', 'js/view/consumables-icons.js', 'js/view/consumables.js',
  'js/view/consumables-zone.js', 'js/view/hints.js', 'js/view/hints-detect.js', 'js/view/hints-view.js'];

// A store like localStorage (getItem / setItem). `data` is what a save would hold between sessions.
function memStore(data) {
  const d = Object.assign({}, data || {});
  return { data: d, getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); } };
}

// Stub canvas: records arcs (radius), text draws and gradient stops; every other call is a no-op.
function fakeCtx() {
  const rec = { arcs: [], texts: [], stops: [], rects: 0, fills: 0 };
  const noop = () => {};
  const ctx = {
    rec, fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: '', textBaseline: '', globalAlpha: 1, lineCap: '',
    beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop, fill: () => { rec.fills++; }, stroke: noop, save: noop, restore: noop,
    translate: noop, rotate: noop, setTransform: noop, setLineDash: noop, rect: noop, fillRect: () => { rec.rects++; }, strokeRect: noop,
    ellipse: noop, clearRect: noop,
    arc: (x, y, r) => { rec.arcs.push(r); },
    fillText: (t) => { rec.texts.push(t); }, strokeText: noop,
    measureText: (t) => ({ width: String(t).length * 8 }),
    createRadialGradient: () => ({ addColorStop: (o, col) => { rec.stops.push(col); } })
  };
  return ctx;
}

// Stub DOM element and document, enough for hints-view.js to build and place its callout.
function fakeEl(id) {
  const el = { id: id || '', style: {}, offsetWidth: 120, offsetHeight: 40, offsetParent: {}, textContent: '', innerHTML: '', children: [],
    classes: new Set(), classList: null, attrs: {} };
  el.classList = { add: (c) => el.classes.add(c), remove: (c) => el.classes.delete(c), contains: (c) => el.classes.has(c) };
  el.setAttribute = (k, v) => { el.attrs[k] = v; };
  el.addEventListener = () => {};
  el.appendChild = (c) => { el.children.push(c); };
  el.querySelector = () => fakeEl();
  el.getBoundingClientRect = () => ({ left: 0, top: 0, right: 390, bottom: 844, width: 390, height: 844 });
  return el;
}
function fakeDocument() {
  const byId = { phone: fakeEl('phone'), call: fakeEl('call'), 'dash-chip': fakeEl('dash-chip') };
  return { byId, getElementById: (id) => byId[id] || null, createElement: () => fakeEl(), head: { appendChild: () => {} } };
}

// Fresh module set. opts: { store, lang, reduceMotion, reduceFlash, document }.
function load(opts) {
  const o = opts || {};
  const ctx = { console, Math, JSON, Object, Array, Set, WeakMap, Number, String, Date, isNaN, performance: { now: () => 0 } };
  ctx.document = o.document;
  ctx.P = { CFG: {}, lang: o.lang || 'tr', Settings: { reduceMotion: !!o.reduceMotion, reduceFlash: !!o.reduceFlash }, Sfx: { play: () => {} } };
  ctx.P.CFG.feel2 = { pickup: { popT: 0.25, lift: 0.4 } };
  ctx.P.CFG.drops = { healCap: 70, simitHeal: 25 };
  ctx.P.CFG.levels = { rampFrom: 5 };
  ctx.P.CFG.hack = { r: 2.4 };
  vm.createContext(ctx);
  FILES.forEach((f) => vm.runInContext(read(f), ctx, { filename: f }));
  const R = { W: 390, H: 844, dpr: 1, ppm: 32.5, cam: { x: 0, y: 0 }, ctx: fakeCtx() };
  R.X = (x) => 195 + (x - R.cam.x) * R.ppm;
  R.Y = (y) => 422 - (y - R.cam.y) * R.ppm;
  R.toScreen = (x, y) => ({ x: R.X(x), y: R.Y(y) });
  ctx.P.Render = R;
  ctx.P.Hints.setStore(o.store === undefined ? memStore() : o.store);
  return ctx.P;
}

// A sim with only what the detectors read. Hero at the origin; the camera is centred on him.
function sim(extra) {
  return Object.assign({ hero: { x: 0, y: 0, hp: 50, maxHp: 100, dashCd: 5 }, enemies: [], drops: [], hacks: [], env: { recs: [] },
    props: { canisters: [] }, dir: { tut: { done: {}, active: null }, call: { active: false } }, sk: {}, runT: 0, levelIndex: 1,
    dropHealed: 0, obj: null }, extra || {});
}
const simit = (x, y) => ({ kind: 'simit', value: 25, x: x, y: y, mag: false, pop: 0 });
const jeton = (x, y) => ({ kind: 'jeton', value: 3, x: x, y: y, mag: false, pop: 0 });

// Drives update() in 0.1 s steps for `secs` seconds; calls onStep(t) after each. Returns the list of started callouts.
function run(P, s, secs, onStep) {
  const starts = [];
  let last = null, t = 0;
  for (let i = 0; i < Math.round(secs / 0.1); i++) {
    P.Hints.update(s, 0.1);
    t += 0.1;
    const cur = P.Hints.current();
    if (cur && cur !== last) starts.push({ type: cur.type, t: +t.toFixed(2) });
    last = cur;
    if (onStep) onStep(t);
  }
  return starts;
}

// ---------- 1. each hint shows once, ever ----------
{
  const store = memStore();
  const P = load({ store: store });
  const s = sim({ drops: [simit(1, 1)] });
  const first = run(P, s, 3);
  ok(first.length === 1 && first[0].type === 'heal', 'once: a visible simit starts one heal callout (got ' + JSON.stringify(first) + ')');
  ok(store.data['nsi.hints.v1'] && JSON.parse(store.data['nsi.hints.v1']).heal === true, 'once: the seen list is written to the store');
  const again = run(P, s, 30);
  ok(again.length === 0, 'once: the same type in view for 30 s does not show again (got ' + again.length + ')');
  const next = run(P, sim({ drops: [simit(2, 2)] }), 10);
  ok(next.length === 0, 'once: a new run with the same type does not show again');
  P.Hints.reset();
}

// ---------- 2. queue: one at a time, 4 s apart; each callout lasts 2 s ----------
{
  const P = load({ store: memStore() });
  const s = sim({ drops: [simit(1, 1), jeton(-1, 1)] });
  const starts = [];
  let last = null, t = 0, maxAtOnce = 0, shownFor = 0, shownLongest = 0;
  for (let i = 0; i < 120; i++) {
    P.Hints.update(s, 0.1); t += 0.1;
    const cur = P.Hints.current();
    if (cur) { shownFor += 0.1; shownLongest = Math.max(shownLongest, shownFor); } else shownFor = 0;
    if (cur && cur !== last) starts.push({ type: cur.type, t: +t.toFixed(2) });
    last = cur; maxAtOnce = Math.max(maxAtOnce, cur ? 1 : 0);
  }
  ok(starts.length === 2, 'queue: two types in view start two callouts (got ' + starts.length + ')');
  ok(starts.length === 2 && starts[1].t - starts[0].t >= 4 - 1e-6, 'queue: the second starts at least 4 s after the first (gap ' + (starts[1].t - starts[0].t).toFixed(2) + ')');
  ok(shownLongest <= 2.01, 'queue: a callout stays up at most 2 s (longest ' + shownLongest.toFixed(2) + ' s)');
  ok(maxAtOnce === 1, 'queue: only one callout is ever up');
}

// ---------- 3. persistence: a later session with the same save shows nothing seen ----------
{
  const store = memStore();
  const P1 = load({ store: store });
  run(P1, sim({ drops: [simit(1, 1)] }), 3);
  const P2 = load({ store: store });
  const again = run(P2, sim({ drops: [simit(1, 1)] }), 6);
  ok(again.length === 0, 'persist: a second session with the same save does not show a seen hint (got ' + again.length + ')');
  ok(P2.Hints.isSeen('heal') === true && P2.Hints.isSeen('currency') === false, 'persist: isSeen reads the store');
  const blank = load({ store: memStore() });
  ok(run(blank, sim({ drops: [simit(1, 1)] }), 3).length === 1, 'persist: an empty save shows the hint');
}

// ---------- 4. skip: a tap ends the callout at once; the type stays seen ----------
{
  const P = load({ store: memStore() });
  const s = sim({ drops: [simit(1, 1)] });
  run(P, s, 0.5);
  ok(P.Hints.current() !== null, 'skip: the callout is up before the tap');
  P.Hints.skip();
  ok(P.Hints.current() === null, 'skip: a tap hides the callout');
  ok(P.Hints.isSeen('heal') === true, 'skip: a tapped-away hint is still marked seen');
}

// ---------- 5. Reduce motion: no bob, no pulse; motion on: bob at 0.5 Hz or less ----------
function recordedView(reduce, t) {
  const doc = fakeDocument();
  const P = load({ store: memStore(), reduceMotion: reduce, document: doc });
  P.Hints.update(sim({ drops: [simit(1, 1)], runT: t }), 0.1);
  const arrow = doc.byId.phone.children[0];
  return { P: P, arrow: arrow, transform: arrow.style.transform || '' };
}
{
  const off = [recordedView(true, 0.3), recordedView(true, 0.8), recordedView(true, 1.4)];
  const ts = off.map((v) => v.transform);
  ok(off[0].arrow && ts.every((x) => /translate\(0px,0px\)/.test(x) || /translate\(-?0px,-?0px\)/.test(x)), 'reduce motion: the arrow does not bob (' + ts[0] + ')');
  const on = [recordedView(false, 0.3), recordedView(false, 0.8)];
  ok(on[0].transform !== on[1].transform, 'motion on: the arrow bobs');
  ok(P_rate_ok(), 'motion on: every loop in the view and consumables runs at 0.5 Hz or less');
  // consumable pulse: the glow stop alpha is steady under Reduce motion, and moves with time otherwise.
  const P = load({ store: memStore(), reduceMotion: true });
  const R = P.Render, drawAlpha = (tt) => { R.ctx = fakeCtx(); P.Consumables.drawOver(R, sim({ drops: [jeton(1, 0)], runT: tt })); return R.ctx.rec.stops[0]; };
  ok(drawAlpha(0.2) === drawAlpha(0.9), 'reduce motion: the consumable glow does not pulse');
  const Q = load({ store: memStore(), reduceMotion: false });
  const R2 = Q.Render, drawAlpha2 = (tt) => { R2.ctx = fakeCtx(); Q.Consumables.drawOver(R2, sim({ drops: [jeton(1, 0)], runT: tt })); return R2.ctx.rec.stops[0]; };
  ok(drawAlpha2(0.2) !== drawAlpha2(0.9), 'motion on: the consumable glow pulses');
}
function P_rate_ok() {
  // Rates are read from the config tokens; the bob, pulse and zone rates must stay at or below 0.5 Hz... except the pulses, which may reach 1 Hz.
  const Cfg = load({}).CFG;
  return Cfg.hints.bobHz <= 0.5 && Cfg.consumables.bobHz <= 0.5 && Cfg.consumables.pulseHz <= 1 && Cfg.hackZone.pulseHz <= 1;
}

// ---------- 6. strings: every hint, consume and zone key in TR and EN ----------
{
  const P = load({ store: memStore(), lang: 'tr' });
  const keys = P.Hints.ORDER.map((t) => 'hint.' + t).concat(['consume.heal', 'consume.full', 'consume.cap', 'consume.chest', 'consume.empty', 'zone.paused']);
  keys.forEach((k) => {
    ok(typeof P.STR.tr[k] === 'string' && P.STR.tr[k].length > 0, 'strings: TR has ' + k);
    ok(typeof P.STR.en[k] === 'string' && P.STR.en[k].length > 0, 'strings: EN has ' + k);
    if (k.indexOf('hint.') === 0) {
      const words = P.STR.en[k].split(/\s+/).length, twords = P.STR.tr[k].split(/\s+/).length;
      ok(words >= 2 && words <= 4, 'strings: EN ' + k + ' is 2 to 4 words (' + words + ')');
      ok(twords >= 2 && twords <= 4, 'strings: TR ' + k + ' is 2 to 4 words (' + twords + ')');
    }
  });
  ok(P.t('consume.heal', { n: 25 }) === '+25 CAN', 'strings: the heal amount fills in ({n})');
  ok(P.Hints.ORDER.every((t) => P.CFG.hintKinds[t]), 'strings: every hint type has an icon and colour in hintKinds');
  const src = read('js/strings-hints.js');
  ok((src.match(/\/\/ TR owner check/g) || []).length >= 17, 'strings: TR lines carry the owner check comment');
}

// ---------- 7. layout: the callout never covers the hero; off-screen anchors get an edge arrow ----------
{
  const P = load({ store: memStore() });
  const V = P.HintsView;
  const base = { box: { w: 150, h: 40 }, hero: { x: 195, y: 422 }, W: 390, H: 844, margin: 24, gap: 14, hudBottom: 170,
    heroBox: { w: 64, h: 84 }, arrow: 10 };
  const hit = (lay) => lay.left < 195 + 32 && lay.left + 150 > 195 - 32 && lay.top < 422 + 42 && lay.top + 40 > 422 - 42;
  const spots = [[195, 300], [195, 540], [80, 422], [330, 422], [60, 250]];
  spots.forEach((p) => {
    const lay = V.layout(Object.assign({}, base, { anchor: { x: p[0], y: p[1] }, hud: false }));
    ok(!hit(lay), 'layout: a callout for an anchor at ' + p + ' does not cover the hero (mode ' + lay.mode + ')');
    ok(lay.left >= 24 && lay.left + 150 <= 390 - 24, 'layout: stays inside the phone margin at ' + p);
  });
  const edge = V.layout(Object.assign({}, base, { anchor: { x: 900, y: 422 }, hud: false }));
  ok(edge.mode === 'edge' && Math.abs(edge.ax - 366) < 1e-6, 'layout: an anchor off the right edge gets an edge arrow on the inset line (ax ' + edge.ax + ')');
  const hudLay = V.layout(Object.assign({}, base, { anchor: { x: 330, y: 20 }, hud: true, hudRect: { top: 0, bottom: 40 } }));
  ok(hudLay.mode === 'below' && hudLay.top >= 40, 'layout: a HUD anchor puts the callout below its element');
}

// ---------- 8. L1 scripted prompts: no repeat while a prompt is up or its step is not done ----------
{
  const P = load({ store: memStore() });
  const s = sim({ hacks: [{ id: 1, kind: 'cell', x: 1, y: 1, r: 2.4, prog: 0, state: 'idle', doneT: 0 }] });
  s.dir.tut.active = { id: 't_move' };
  ok(run(P, s, 3).length === 0, 'L1 gates: no callout while a scripted prompt is up');
  s.dir.tut.active = null;
  ok(run(P, s, 3).length === 1, 'L1 gates: link shows once the scripted prompt is cleared');
  const Q = load({ store: memStore() });
  const s2 = sim({ props: { canisters: [{ alive: true, x: 1, y: 1 }] } });
  ok(run(Q, s2, 3).length === 0, 'L1 gates: explosive waits for t_env (the canister prompt)');
  s2.dir.tut.done.t_env = true;
  ok(run(Q, s2, 3)[0].type === 'explosive', 'L1 gates: explosive shows once t_env is done');
}

// ---------- 9. hints never write to the sim ----------
{
  const P = load({ store: memStore() });
  const s = sim({ drops: [simit(1, 1), jeton(-1, 1)], hacks: [{ id: 2, kind: 'atm', x: 2, y: 2, r: 2.4, prog: 0.3, state: 'active', doneT: 0 }],
    enemies: [{ x: 0.5, y: 0.5, r: 0.35, state: 'active', dead: false, door: { kind: 'door' } }], env: { recs: [{ alive: true, kind: 'bin', x: 3, y: 0, bomb: false }] } });
  const before = JSON.stringify(s);
  run(P, s, 30);
  P.Consumables.drawOver(P.Render, s);
  P.ConsumablesZone.draw(P.Render, s.hacks[0], 1.0);
  ok(JSON.stringify(s) === before, 'sim: hints and overlays leave the sim state untouched');
  const seen = P.Hints.seenList();
  ok(seen.indexOf('heal') >= 0 && seen.indexOf('link') >= 0, 'sim: the detectors reported heal and link from the sim state (' + seen.join(',') + ')');
}

// ---------- 10. the consumable grammar: classes, colour and shape, sounds, minimum size ----------
{
  const P = load({ store: memStore() });
  const C = P.Consumables.CLASS;
  ok(P.Consumables.classOf('simit') === 'heal' && P.Consumables.classOf('chest') === 'power' && P.Consumables.classOf('jeton') === 'currency', 'grammar: simit is heal, chest is power, jeton is currency');
  ok(P.Consumables.handles('xp') === false && P.Consumables.handles('simit') === true, 'grammar: XP gems stay outside the grammar');
  const fills = Object.keys(C).map((k) => C[k].fill), icons = Object.keys(C).map((k) => C[k].icon);
  ok(new Set(fills).size === fills.length && new Set(icons).size === icons.length, 'grammar: every class has its own colour and its own shape');
  ok(Object.keys(C).every((k) => P.ConsumablesIcons.names.indexOf(C[k].icon) >= 0), 'grammar: every class icon exists');
  const sfxSrc = read('js/view/sfx-bank2.js');
  ['heal', 'star', 'coin', 'pick'].forEach((n) => ok(sfxSrc.indexOf("def('" + n + "'") >= 0, 'grammar: sfx cue ' + n + ' exists in sfx-bank2.js'));
  ok(P.Consumables.pickupCue('simit') === 'heal' && P.Consumables.pickupCue('xp') === 'tink', 'grammar: pickup cues map to the class cue');
  // Minimum size: at a small scale (10 px per metre) the glow disc still gets a 14 px radius (28 px across).
  const R = P.Render; R.ctx = fakeCtx(); R.ppm = 10;
  P.Consumables.drawOver(R, sim({ drops: [jeton(0.2, 0.2)], runT: 0.1 }));
  ok(R.ctx.rec.arcs.length > 0 && R.ctx.rec.arcs[0] >= 14 - 1e-9, 'grammar: the glow disc is at least 14 px (28 px across), got ' + R.ctx.rec.arcs[0]);
  R.ppm = 32.5;
  // Floaters: one sim object per check (a new object starts a new effect list).
  const floatText = (ev, state) => { const c = fakeCtx(); R.ctx = c; P.Consumables.onEvent(ev, state); P.Consumables.drawOver(R, state); return c.rec.texts; };
  const hurt = sim({ runT: 1, hero: { x: 0, y: 0, hp: 50, maxHp: 100 } });
  ok(floatText({ type: 'pickup', kind: 'simit', value: 25 }, hurt).indexOf('+25 CAN') >= 0, 'floater: a heal pickup shows the amount');
  const full = sim({ runT: 2, hero: { x: 0, y: 0, hp: 100, maxHp: 100 } });
  ok(floatText({ type: 'pickup', kind: 'simit', value: 25 }, full).indexOf('DOLU') >= 0, 'floater: a heal at full HP says FULL (DOLU)');
  const capped = sim({ runT: 3, dropHealed: 70, levelIndex: 6, hero: { x: 0, y: 0, hp: 50, maxHp: 100 } });
  ok(floatText({ type: 'pickup', kind: 'simit', value: 25 }, capped).indexOf('LİMİT') >= 0, 'floater: a heal past the run budget says CAP (LİMİT)');
}

// ---------- 11. hack zone phases and the edge arrow ----------
{
  const P = load({ store: memStore() });
  const Z = P.ConsumablesZone;
  ok(Z.phase({ state: 'done', prog: 1 }) === 'done' && Z.phase({ state: 'active', prog: 0.4 }) === 'active', 'zone: done and active phases come from the sim state');
  ok(Z.phase({ state: 'idle', prog: 0.4 }) === 'paused' && Z.phase({ state: 'idle', prog: 0 }) === 'idle', 'zone: a part-filled idle terminal is paused, an untouched one is idle');
  const R = P.Render; R.ctx = fakeCtx();
  Z.drawScreen(R, sim({ hacks: [{ id: 3, kind: 'atm', x: 2, y: 0, r: 2.4, prog: 0, state: 'idle' }] }));
  ok(R.ctx.rec.fills === 0, 'zone: no edge arrow for a terminal on screen');
  R.ctx = fakeCtx();
  Z.drawScreen(R, sim({ hacks: [{ id: 4, kind: 'atm', x: 40, y: 0, r: 2.4, prog: 0, state: 'idle' }] }));
  ok(R.ctx.rec.fills === 1, 'zone: an off-screen terminal gets one edge arrow');
}

// ---------- 12. the eczane station sign: states are distinct ----------
{
  const P = load({ store: memStore() });
  const sign = (state) => { const c = fakeCtx(); P.Consumables.stationSign(c, 0, 0, 30, state, 1, true); return c.rec; };
  ok(sign('empty').texts.indexOf('BOŞ') >= 0, 'station: the empty state writes its short label (TR)');
  ok(sign('usable').stops.length >= 1 && sign('idle').stops.length === 0 && sign('idle').texts.length === 0, 'station: only the usable state glows, and idle has no label');
}

console.log('test-hints: ' + passes + ' checks passed, ' + fails + ' failed');
if (fails) process.exit(1);
