// Exercise the real comic controller through its page API, animation frames and reader input.
// Stub rendering only: this verifies cue placement and quiet reading, not visual fit or subjective audio quality.
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const { loadP, ROOT } = require('./lib-load');
const game = loadP();
assert.equal(game.Story.forLine('s3').who, 'arda', 'Arda reacts to the turning diner');
for (const id of ['captain_end', 'captain_end_covered', 'captain_end_market', 'l30_call', 'l30_end'])
  assert(game.Story.pages[id].quiet, id + ' retains quiet direction');
const arrival = game.Finale.PAGES.flatMap(id => game.Story.pages[id].panels.flatMap(p => p.it.map(it => it[1])));
assert(arrival.indexOf('FINc4') < arrival.indexOf('FINc5'), 'Mila hears the destination before the shared plan');
for (const lang of ['tr', 'en']) {
  game.lang = lang;
  assert(game.Dialogue.text('C05e').includes('Sarıyer'));
  assert(game.Dialogue.text('C15c').includes('Sarıyer'), 'Mom answers the destination question explicitly');
  const exchange = [];
  game.Comic = { pop: id => exchange.push([id, game.Story.forLine(id).who]) };
  game.Story.play(18, 'start');
  assert.deepEqual(exchange, [['L18s', 'kaan'], ['L18m', 'arda']], 'The bite question gets an immediate answer');
  assert.equal(game.Story.beat(18, 'mid'), null, 'Do not repeat the answer halfway through the level');
}

const noop = () => {}, cues = [], events = [], frames = [], lines = {};
let clock = 0;
const ctx = new Proxy({}, { get: (o, k) => o[k] || noop });
function node(tag) {
  return { tag, children: [], style: { setProperty: noop }, classList: { add: noop, remove: noop, toggle: noop }, handlers: {},
    get childElementCount() { return this.children.length; },
    appendChild(n) { this.children.push(n); n.parentNode = this; return n; },
    insertBefore(n) { this.appendChild(n); },
    remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(n => n !== this); },
    setAttribute: noop, getContext: () => ctx,
    addEventListener(ev, cb) { this.handlers[ev] = cb; }, querySelector: () => ({ style: {} }) };
}
const phone = node('phone');
const document = { documentElement: node('html'), body: phone, createElement: node,
  getElementById: () => phone, addEventListener: noop, removeEventListener: noop };
const panel = (kind, shape, zoom) => ({ bg: 'street', tone: 'night', kind, shape, zoom });
const pages = {
  first: { panels: [panel('caption'), panel('bubble', 'thought')] },
  second: { panels: [panel('bubble', 'speech')] },
  quiet: { quiet: true, entranceCue: 'farewellMotif', panels: [panel('bubble', 'speech', true)] }
};
const P = { Story: { pages }, Settings: { reduceMotion: false }, t: x => x, upper: x => x,
  Dialogue: { has: id => Object.hasOwn(lines, id) },
  Sfx: { play: (name, gap, opts) => { cues.push(name); events.push({ name, gap, voice: opts.voice, at: clock }); } }, UIMotion: { ms: () => 0 },
  ComicArt: { ready: true, TYPE: {}, scene: noop, wash: noop, halftone: noop, bust: noop, burst: noop,
    contact: () => node('portrait'), static: noop, rng: () => () => 0.5 },
  ComicText: { partial: a => a, balloon: noop, caption: noop },
  ComicLayout: { CPS: 42, POP: { w: 390, h: 240, boxW: 200 }, AREA: { w: 390 },
    resolve: src => typeof src === 'string' ? lines[src] : src,
    popGeom: () => ({ top: 0, band: 100, bh: 80, base: 100 }),
    popFit: (c, text) => ({ lines: [text], px: 14, lh: 16, h: 50, ok: true }),
    panelRect: () => ({ x: 0, y: 0, w: 300, h: 200 }),
    layoutPage: ps => ps.map(p => {
      const text = p.data.text || 'A SAMPLE LINE WITH MORE WORDS.', duration = text.length / 42;
      return Object.assign(p, { T: 0, total: duration + 0.1, done: false, busts: [], step: 0, steps: [{}],
        items: [{ kind: p.data.kind, shape: p.data.shape, who: 'arda', start: 0, dur: duration,
          len: text.length, caps: text, lines: [text] }] });
    }) }
};
vm.runInNewContext(fs.readFileSync(ROOT + '/js/view/comic.js', 'utf8'), {
  P, document, window: { devicePixelRatio: 1 }, performance: { now: () => clock },
  requestAnimationFrame: fn => frames.push(fn)
});
function tick(n = 1, ms = 50) { for (let i = 0; i < n; i++) { clock += ms; const f = frames.shift(); if (f) f(); } }
function tap() { const root = phone.children.find(n => n.className.startsWith('cm-page')); root.handlers.pointerup(); }
P.Comic.page(['first', 'second']);
assert.deepEqual(cues, ['hoodIntro', 'comicPop']);
tick(2); assert(!cues.includes('speech'), 'Narration is silent');
tap(); tap(); // Finish caption, reveal thought panel.
assert.equal(cues.filter(c => c === 'comicPage').length, 0, 'A panel reveal is not a page turn');
assert.equal(cues.filter(c => c === 'comicPop').length, 2);
tick(2); assert(!cues.includes('speech'), 'Thoughts are silent');
tap(); tap(); // Finish thought, turn actual page.
assert.equal(cues.at(-1), 'comicPage');
assert.equal(cues.filter(c => c === 'comicPage').length, 1);
tick(2); assert(cues.includes('speech'), 'Ordinary spoken dialogue retains its voice cue');
P.Comic.skipPage(); tick();
cues.length = 0;
P.Comic.page('quiet'); tick(3); tap(); tap(); tick(60);
assert.deepEqual(cues, ['farewellMotif'], 'Quiet speech and zoom retain only the authored entrance cue');
P.Comic.skipPage();

function reset() {
  P.Comic.skipPage(); P.Comic.clearRunDialogue(); tick(20);
  cues.length = 0; events.length = 0;
}
function voices() { return events.filter(e => e.name === 'speech'); }
function spaced(label) {
  const v = voices();
  for (let i = 1; i < v.length; i++) assert(v[i].at - v[i - 1].at >= 150, label + ': no overlapping 100 ms syllables');
  assert(v.every(e => e.gap >= 150), label + ': downstream cue throttle preserves spacing');
}
function read(text) {
  reset(); pages.cadence = { panels: [{ ...panel('bubble', 'speech'), text }] };
  const start = clock; P.Comic.page('cadence');
  tick(Math.ceil((text.length / 42 + 0.2) / 0.025), 25);
  spaced('page'); return { start, voice: voices() };
}
const longWord = read('ANLAŞILAMAYANLARDANMIŞSINIZ GÜZEL');
assert.equal(longWord.voice.length, 2, 'Long words receive an onset accent, not continuous character chatter');
assert(read('İSTANBUL ÇOK İYİ').voice.length >= 2, 'Turkish dotted İ and accented letters can start a voice accent');
for (const [mark, pause] of [['.', 280], ['?', 280], ['…', 280], [',', 160], [';', 160]]) {
  const result = read('İ' + mark + ' A A A A A A A A A A A A A A A A A A A A');
  assert(result.voice.length >= 2, mark + ': speech resumes after the pause');
  assert(result.voice.every(e => e.at - result.start < 50 || e.at - result.start >= 50 + pause), mark + ': punctuation creates breathing room');
}
assert.equal(read('    ... ! ? , ').voice.length, 0, 'Whitespace and punctuation never chatter');
assert.equal(read('[CIZIRTI] [HAT KESİLDİ]').voice.length, 0, 'Bracketed signal directions never chatter');
reset(); pages.cadence.panels[0].text = 'ARDA ÖNCE DUR SONRA SAKİNCE BANA DOĞRU GEL.';
P.Comic.page('cadence'); tick(2); const beforeTap = voices().length; tap(); tick(40);
assert.equal(voices().length, beforeTap, 'Completing a panel never catches up skipped voice accents');

function line(text, who) { return { caps: text, text, who, tag: who, side: who === 'arda' ? 'l' : 'r', mood: 'neutral' }; }
reset(); P.Comic.compactPops(true);
P.Comic.pop(line('ARDA BENİ DUYUYOR MUSUN? SAKİNCE GEL.', 'kaan')); tick(100);
assert.equal(voices().length, 0, 'Compact live pops retain their silent text presentation');
reset(); P.Comic.pop(line('ARDA BENİ DUYUYOR MUSUN? SAKİNCE GEL.', 'kaan')); tick(100);
assert(voices().length >= 2, 'Illustrated pops retain sparse voice identity'); spaced('pop');
assert(voices().every(e => e.voice === 'friend'), 'Kaan keeps his existing voice preset');

reset(); lines.anne = line('ARDA İYİ MİSİN? ÖNCE BİR SOLUKLAN. BİZ BURADAYIZ.', 'anne');
lines.arda = line('İYİYİM ANNE. KAAN YANIMDA. BİRLİKTE GELİYORUZ.', 'arda');
P.Comic.call('anne', ['anne', 'arda'], null, { blocking: true }); tick(240);
assert(voices().some(e => e.voice === 'anne') && voices().some(e => e.voice === 'arda'), 'Phone replies retain both voice identities');
spaced('call');
reset(); P.Comic.call('anne', ['anne'], null, { blocking: true }); tick(42);
const callBeforeTap = voices().length;
phone.children.find(n => n.className.startsWith('cm-call ')).handlers.pointerup(); tick(4);
assert.equal(voices().length, callBeforeTap, 'Completing a phone line never catches up skipped accents');
reset();
console.log('PASS: comic routing and quiet pages; sparse Turkish word accents; punctuation/static silence; page/pop/call cadence; completion without catch-up');
