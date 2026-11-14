// Input and hero-movement checks (phone playtest: "the character takes baby steps, then moves"). Four parts:
//  1. The floating stick (js/view/input.js) with synthetic pointer events on a fake #phone: a second finger does not steal the
//     stick, a lifted or cancelled stick releases at once, a button touch never starts or drops it, and a finger that was on the
//     stick when an overlay called reset() re-anchors on its next move (no jump) once play resumes.
//  2. The hint callout (js/view/hints-view.js): a tap on the pill skips it but the touch still reaches #phone, so the stick can start.
//  3. The sim: a held stick in a dense crowd (120 walkers around the hero, L2) moves the hero at the speed the terrain allows.
//  4. The evolution beat (js/main.js): the 1.6 s world crawl stays on Level 1 only (design-system 7: camera punch, no slow-mo).
// Usage: node prototype/tools/test-input.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const { loadP } = require('./lib-load.js');
let fails = 0, passes = 0;
function ok(c, m) { if (c) passes++; else { fails++; console.log('FAIL ' + m); } }
function near(a, b, eps) { return Math.abs(a - b) <= eps; }

// ---------- fake DOM: just enough for input.js and hints-view.js ----------
function classSet(el) {
  return {
    add(c) { const s = el.className.split(' ').filter(Boolean); if (!s.includes(c)) s.push(c); el.className = s.join(' '); },
    remove(c) { el.className = el.className.split(' ').filter(x => x && x !== c).join(' '); },
    contains(c) { return el.className.split(' ').includes(c); },
  };
}
function makeEl(tag) {
  const el = { tag, className: '', style: {}, children: [], listeners: {}, parent: null, attrs: {}, innerHTML: '', textContent: '', offsetWidth: 0, offsetHeight: 0 };
  el.classList = classSet(el);
  el.firstElementChild = { style: {} };
  el.addEventListener = (t, fn) => { (el.listeners[t] = el.listeners[t] || []).push(fn); };
  el.setAttribute = (k, v) => { el.attrs[k] = v; };
  el.appendChild = (c) => { c.parent = el; el.children.push(c); return c; };
  el.querySelector = () => makeEl('span');
  el.closest = sel => { for (let n = el; n; n = n.parent) if (n.tag === sel) return n; return null; };
  el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 });
  return el;
}
// Event dispatch with bubbling: the target's listeners, then each ancestor's, unless a listener stopped propagation.
function dispatch(target, type, ev) {
  let node = target;
  ev.type = type; ev.target = target; ev.cancelBubble = false;
  ev.stopPropagation = () => { ev.cancelBubble = true; };
  while (node && !ev.cancelBubble) {
    (node.listeners[type] || []).slice().forEach(fn => fn(ev));
    node = node.parent;
  }
}

// ---------- 1. the stick ----------
const P = loadP();
const phone = makeEl('div'), joy = makeEl('div'), joyKnob = makeEl('div');
joy.className = 'joy hidden'; joy.firstElementChild = joyKnob;
const btn = makeEl('button');
phone.appendChild(btn);               // a button inside #phone, as in index.html
const docEls = { joy, phone };
globalThis.document = { getElementById: id => docEls[id] || null, createElement: makeEl, head: { appendChild() {} } };
globalThis.window = { addEventListener() {} };
P.Settings = { joySide: 'right', reduceMotion: false };
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'js/view/input.js'), 'utf8'), { filename: 'js/view/input.js' });
const I = P.Input;
let clock = 1000;
I.now = () => clock;
I.init(phone, e => ({ x: e.clientX, y: e.clientY }));
I.enabled = true;

const TARGET = phone;                 // a touch on the playfield
const ptrEv = (id, x, y, target) => ({ pointerId: id, clientX: x, clientY: y, target: target || TARGET });
const down = (id, x, y, target) => dispatch(target || TARGET, 'pointerdown', ptrEv(id, x, y, target));
const move = (id, x, y) => dispatch(TARGET, 'pointermove', ptrEv(id, x, y));
const up = (id, x, y) => dispatch(TARGET, 'pointerup', ptrEv(id, x, y));
const cancel = (id, x, y) => dispatch(TARGET, 'pointercancel', ptrEv(id, x, y));
const shown = () => !joy.className.split(' ').includes('hidden');
const RAD = 31;
const CX = 250, CY = 620;             // right side, lower field (the default handedness keeps the stick right of x = 175.5)

// 1a. basic: a stick, a deflection, a lift
down(1, CX, CY);
ok(shown(), '1a: a touch in the lower right field shows the stick');
move(1, CX + 12, CY);
ok(near(I.vec.x, 12 / RAD, 1e-9) && I.vec.y === 0, '1a: a 12 pt drag gives 12/31 of full deflection (got ' + I.vec.x + ')');
up(1, CX + 12, CY);
ok(I.vec.x === 0 && I.vec.y === 0 && !shown(), '1a: lifting the stick releases it at once');

// 1b. a second finger on the field does not steal the stick, and lifting it does nothing
down(1, CX, CY);
down(2, 300, 660);
move(2, 330, 660);                    // the second finger moves (under 40 pt, so no flick)
ok(I.vec.x === 0, '1b: a second finger on the field does not steer the hero');
move(1, CX + 6, CY);
ok(near(I.vec.x, 6 / RAD, 1e-9), '1b: the first finger still steers while a second is down');
up(2, 330, 660);
ok(shown() && near(I.vec.x, 6 / RAD, 1e-9), '1b: lifting the second finger leaves the stick alone');
up(1, CX + 6, CY);
ok(!shown() && I.vec.x === 0, '1b: lifting the first finger releases the stick');

// 1c. pointercancel (iOS takes the touch) releases the stick; a new touch starts fresh at zero offset
down(1, CX, CY);
move(1, CX, CY + 20);
ok(near(I.vec.y, -20 / RAD, 1e-9), '1c: a drop of 20 pt points the stick down (vec.y negative, got ' + I.vec.y + ')');
cancel(1, CX, CY + 20);
ok(I.vec.x === 0 && I.vec.y === 0 && !shown(), '1c: pointercancel releases the stick and zeroes the vector');
down(3, CX, CY);
ok(I.vec.x === 0 && I.vec.y === 0, '1c: a new touch starts at zero offset, never with the old vector');
move(3, CX, CY - 5);
ok(near(I.vec.y, 5 / RAD, 1e-9), '1c: the new touch steers from its own anchor');
up(3, CX, CY - 5);

// 1d. a touch on a button never starts or drops the stick
down(4, CX, CY);
down(5, 330, 760, btn);               // dash, ult or pause: a button
move(4, CX + 8, CY);
ok(near(I.vec.x, 8 / RAD, 1e-9), '1d: a button touch does not drop the stick');
up(5, 330, 760);
ok(shown(), '1d: lifting a button touch does not release the stick');
up(4, CX + 8, CY);

// 1e. a finger held through an overlay: reset() drops the stick; the finger re-anchors on its next move once play resumes
down(6, CX, CY);
move(6, CX + 10, CY);
ok(near(I.vec.x, 10 / RAD, 1e-9), '1e: setup, the stick is steering');
I.reset();                            // a card pick or pause opens: the input is reset and disabled
I.enabled = false;
move(6, CX + 20, CY);
ok(I.vec.x === 0, '1e: nothing steers while the overlay is up');
I.enabled = true;                     // the overlay closes; the finger is still down
move(6, CX + 26, CY);                 // its next move re-anchors the stick here: no jump
ok(I.vec.x === 0 && shown(), '1e: the held finger re-anchors on its next move, with zero offset (no jump)');
move(6, CX + 36, CY);
ok(near(I.vec.x, 10 / RAD, 1e-9), '1e: after re-anchoring the stick steers from the new anchor');
up(6, CX + 36, CY);
ok(!shown() && I.vec.x === 0, '1e: lifting the re-anchored finger releases the stick');

// 1f. a finger that lifted while the input was reset is not revived; a different finger starts a new stick
down(7, CX, CY);
I.reset();
up(7, CX, CY);                        // lifted while the overlay was up
I.enabled = true;
move(7, CX + 15, CY);
ok(I.vec.x === 0 && !shown(), '1f: a lifted finger does not come back to life');
down(8, CX, CY);
move(8, CX + 10, CY);
ok(near(I.vec.x, 10 / RAD, 1e-9), '1f: a new touch after the overlay starts the stick normally');
up(8, CX + 10, CY);

// 1g. the same finger across two resets keeps its claim
down(9, CX, CY);
I.reset();
I.reset();
I.enabled = true;
move(9, CX + 4, CY);
ok(shown(), '1g: a second reset before resume keeps the held finger');
move(9, CX + 14, CY);
ok(near(I.vec.x, 10 / RAD, 1e-9), '1g: the held finger steers after two resets');
up(9, CX + 14, CY);

// ---------- 2. the hint callout does not swallow the touch ----------
// The pill sits in #phone (as hints-view.js builds it). A tap on it skips the hint and the touch still reaches #phone.
P.CFG = P.CFG || {};
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'js/view/hints-config.js'), 'utf8'), { filename: 'js/view/hints-config.js' });
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'js/view/hints-view.js'), 'utf8'), { filename: 'js/view/hints-view.js' });
let skips = 0;
P.Hints = { skip() { skips++; } };
P.HintsView.render(null, null, null);      // builds #hint-callout inside #phone
const pill = P.HintsView.root();
ok(pill && pill.parent === phone, '2: the hint pill is built inside #phone');
// Show the pill over the lower playfield where a thumb rests, then touch it.
let stoppedHere = false;
pill.listeners.pointerdown.forEach(fn => { /* probe: does the handler stop propagation? */
  const probe = { stopPropagation() { stoppedHere = true; } };
  fn(probe);
});
ok(!stoppedHere, '2: the pill handler does not stop propagation');
skips = 0;
const pe = ptrEv(20, CX, CY, pill);
dispatch(pill, 'pointerdown', pe);
ok(skips === 1, '2: a tap on the pill skips the hint');
ok(shown() && I.vec.x === 0, '2: the same touch starts the stick under the pill (joystick shown)');
move(20, CX + 9, CY);
ok(near(I.vec.x, 9 / RAD, 1e-9), '2: the stick started on the pill steers');
up(20, CX + 9, CY);
ok(!shown(), '2: lifting releases it');

// ---------- 3. the sim: a held stick in a dense crowd keeps the hero at the terrain speed ----------
const LEVEL = 2, STEP = 1 / P.CFG.sim.hz;
const s = P.createSim(7, { levelIndex: LEVEL, loadout: P.Power.expectedLoadout(LEVEL) });
P.startPlay(s);
const hx = s.hero.x, hy = s.hero.y;
let placed = 0;
for (let i = 0; i < 160; i++) {
  const a = i * 2.399963, r = 1.6 + (i % 7) * 0.45;                  // a golden-angle ring, 1.6 to 4.3 m around the hero
  const e = P.Combat.spawnEnemy(s, 'walker', hx + Math.cos(a) * r, hy + 2 + Math.sin(a) * r, {});
  if (e) { e.state = 'active'; placed++; }
}
const alive = () => s.enemies.filter(e => !e.dead && e.state === 'active').length;
ok(placed >= 120 && alive() >= 120, '3: a dense crowd is placed around the hero (' + alive() + ' active)');
let moved = 0, expected = 0, steps = 0;
const input = () => ({ x: 0, y: 1, dash: false, ult: false, skill: false });   // a stick held north
for (let i = 0; i < 120; i++) {
  s.hero.invuln = 1e9;                                              // the crowd hits, the hero stays up for the measurement
  const before = s.hero.moved;
  const sp = P.Hero.speed(s) * (1 + (s.hero.baseMove || 0)) * P.Env.heroMul(s) * P.Enemies4.heroMul(s);
  P.stepSim(s, STEP, input());
  if (s.mode !== 'play') break;
  moved += s.hero.moved - before; expected += sp * STEP; steps++;
}
const ratio = moved / expected;
ok(steps === 120, '3: the hero stayed in play for the whole measurement');
ok(ratio >= 0.98 && ratio <= 1.02, '3: held north in a 120-enemy crowd the hero moves at the terrain speed (ratio ' + ratio.toFixed(3) + ', want 0.98-1.02)');
ok(s.hero.y > hy + 1.5, '3: the hero actually walked north (' + (s.hero.y - hy).toFixed(2) + ' m)');

// ---------- 4. the evolution beat stays off generated levels ----------
const mainSrc = fs.readFileSync(path.join(ROOT, 'js/main.js'), 'utf8');
ok(/case 'evolve': if \(levelIndex === 1\) slow\(ev\.T \|\| 1\.6, 0\.2\);/.test(mainSrc), '4: the 1.6 s evolution crawl is Level 1 only (main.js)');
ok(!/case 'evolve': slow\(/.test(mainSrc), '4: no unconditional evolution slow-mo remains');

console.log(fails ? fails + ' failure(s), ' + passes + ' passed' : 'test-input: all ' + passes + ' checks pass');
process.exit(fails ? 1 : 0);
