// First-run map regression (owner bug, iPhone Safari: "the map screen seemed to be broken"). Three parts (part 3 is the
// ?debug=1 telemetry export on the settings screen and the pause menu, see debugExportCheck):
//  1. Node, no DOM: the fresh save and the map-card strings in TR and EN; the save with localStorage blocked (SecurityError).
//  2. Headless Chrome over CDP (skipped with a note when Chrome is not found): a fresh profile taps the title Start with
//     ?map=1 (the review shortcut) at 390x844 and 448x969, in TR and EN. The map must show the Istiklal node, the next-up card
//     with the hood name and BÖLÜM 1/100 (LEVEL 1/100 in EN), a PLAY label, the km line, the camera on the first hood, the card
//     inside the phone, and no thrown errors or boot_error. Also: storage blocked; a failing welcome-back step (the map still
//     renders, one boot_error); a failing open (the fallback lands on the title and closes the map).
// Writes /tmp/map_firstrun_tr.png (TR, 390x844). Usage: node prototype/tools/test-map-first-run.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), http = require('http'), net = require('net');
const { spawn } = require('child_process');
const ROOT = path.join(__dirname, '..');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SHOT = '/tmp/map_firstrun_tr.png';

const DOM_OBJECTS = /^js\/(view|story|dialogue)\/|^js\/main\.js$|^js\/meta\/meta-(ui|map|gear|stats|arsenal)\.js$/;
const fails = [];
let passes = 0;
function check(cond, msg) { if (cond) passes++; else fails.push(msg); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---- Part 1: Node, no DOM ----
function partNode() {
  const store = {};
  globalThis.localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
  };
  const files = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)]
    .map(m => m[1]).filter(f => !DOM_OBJECTS.test(f));
  files.forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
  const P = globalThis.P, M = P.Meta;
  const count = P.Journey.count();

  check(count === 100, 'node: journey count is not 100 (' + count + ')');
  for (const lang of ['tr', 'en']) {
    P.lang = lang;
    const tag = '[' + lang + '] ';
    const journey = P.t('ui.hud.journey', { n: 1, of: count });
    check(journey === (lang === 'tr' ? 'BÖLÜM 1/100' : 'LEVEL 1/100'), tag + 'journey chip is "' + journey + '"');
    const play = P.t('meta.playLevel', { L: 1 });
    check(play && play.indexOf('1') >= 0 && play !== 'meta.playLevel', tag + 'play label is "' + play + '"');
    check(P.t('meta.next') && P.t('meta.next') !== 'meta.next', tag + 'next-up head missing');
    check(P.t('meta.km', { a: '0', b: '17' }) !== 'meta.km', tag + 'km line key missing');
    check(P.upper(P.Journey.hoods[0].name).length > 0, tag + 'hood 0 has no name');
    check(P.t('meta.boss') !== 'meta.boss', tag + 'boss label missing');
  }
  P.lang = 'tr';

  // Fresh save: nothing cleared, level 1 is the next one and the first hood is the current one.
  const s = M.snapshot();
  check(s.done === 0 && s.cur === 0 && s.coins === 0 && s.unlocked >= 1, 'node: fresh snapshot is ' + JSON.stringify(s));
  check(M.currentLevel() === 1, 'node: fresh currentLevel is not 1');
  check(M.level(1).hood.id === P.Journey.hoods[0].id, 'node: level 1 is not in the first hood');
  check(Array.isArray(M.hoodXY(0)) && M.hoodXY(0).length === 2, 'node: hood 0 has no map position');

  // localStorage blocked (the property getter throws): the save falls back to memory and nothing throws.
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { const e = new Error('The operation is insecure.'); e.name = 'SecurityError'; throw e; } });
  let threw = null;
  try { M.Save.read(); M.Save.write({ x: 1 }); M.Save.wipe(); M.snapshot(); M.welcomeTake(Date.now()); } catch (e) { threw = e; }
  check(!threw, 'node: blocked storage threw: ' + (threw && threw.message));
  check(M.snapshot().cur === 0, 'node: blocked storage changed the first-run snapshot');
}

// ---- Part 2: headless Chrome ----
function freePort() {
  return new Promise((res, rej) => { const srv = net.createServer(); srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => res(p)); }); srv.on('error', rej); });
}
function serve() {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml' };
  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(res => srv.listen(0, '127.0.0.1', () => res(srv)));
}
function cdpClient(wsUrl) {
  const ws = new WebSocket(wsUrl); let id = 0; const pend = new Map(), listeners = [];
  const ready = new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
    else if (m.method) listeners.forEach(f => f(m));
  };
  return {
    ready, on: f => listeners.push(f),
    send: (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); }),
    close: () => ws.close(),
  };
}
const BLOCK_STORAGE = "Object.defineProperty(window,'localStorage',{configurable:true,get(){var e=new Error('The operation is insecure.');e.name='SecurityError';throw e}});";
const SCENARIOS = [
  { id: 'tr-390', lang: 'tr', w: 390, h: 844, expect: 'map' },
  { id: 'en-390', lang: 'en', w: 390, h: 844, expect: 'map' },
  { id: 'tr-448', lang: 'tr', w: 448, h: 969, expect: 'map' },
  { id: 'en-448', lang: 'en', w: 448, h: 969, expect: 'map' },
  { id: 'tr-blocked-storage', lang: 'tr', w: 390, h: 844, expect: 'map', init: BLOCK_STORAGE },
  { id: 'en-blocked-storage', lang: 'en', w: 390, h: 844, expect: 'map', init: BLOCK_STORAGE },
  { id: 'tr-welcome-fails', lang: 'tr', w: 390, h: 844, expect: 'map', beforeStart: "P.Meta.Hub.welcomeInfo = function () { throw new Error('test: welcome'); };", bootErrors: ['map.welcome'] },
  { id: 'tr-sound-fails', lang: 'tr', w: 390, h: 844, expect: 'map', beforeStart: "P.Sfx.play = function () { throw new Error('test: sfx'); };", bootErrors: ['map.audio'] },
  { id: 'tr-open-fails', lang: 'tr', w: 390, h: 844, expect: 'title', beforeStart: "var o = P.Meta.open; P.Meta.open = function (cb) { o(cb); throw new Error('test: open'); };", bootErrors: ['startGame'] },
];
// Reads the first-run map from the page. Returns plain values only.
const READ = `(() => {
  const q = s => (document.querySelector(s) || {}).textContent || '';
  const r = e => { const b = e.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, h: b.height }; };
  const root = document.querySelector('.meta-root'), phone = document.getElementById('phone');
  const h0 = document.querySelector('.meta-hood[data-h="0"]');
  const screens = [...document.querySelectorAll('.screen')].filter(e => !e.classList.contains('hidden')).map(e => e.id);
  return JSON.stringify({
    rootVisible: !!root && !root.classList.contains('meta-hidden'),
    screens: screens,
    hoods: document.querySelectorAll('.meta-hood').length,
    hood0Class: h0 ? h0.className : '', badge0: h0 ? h0.firstChild.textContent : '',
    hood0Name: h0 ? q('.meta-hood[data-h="0"] .meta-name') : '',
    next: q('.meta-nextline'), play: q('.meta-play'), km: q('.meta-kmtxt'),
    hood0Rect: h0 ? r(h0.querySelector('.meta-badge')) : null, phone: phone ? r(phone) : null,
    bottom: document.querySelector('.meta-bottom') ? r(document.querySelector('.meta-bottom')) : null,
    hoodName: P.upper(P.Journey.hoods[0].name), lang: P.lang
  });
})()`;

async function runScenario(sc, chromeArgs) {
  const port = await freePort();
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'map-firstrun-'));
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--no-first-run',
    '--no-default-browser-check', '--disable-gpu', ...chromeArgs, 'about:blank'], { stdio: 'ignore' });
  try {
    let wsUrl = null;
    for (let i = 0; i < 150 && !wsUrl; i++) {
      try { const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const pg = list.find(x => x.type === 'page'); if (pg) wsUrl = pg.webSocketDebuggerUrl; } catch (e) { /* not up yet */ }
      if (!wsUrl) await sleep(100);
    }
    if (!wsUrl) throw new Error('Chrome did not start');
    const c = cdpClient(wsUrl); await c.ready;
    const errors = [], bootErrors = [];
    c.on(m => {
      if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; errors.push('exception: ' + ((d.exception && d.exception.description) || d.text).split('\n')[0]); }
      if (m.method === 'Runtime.consoleAPICalled') {
        const text = m.params.args.map(a => a.value || a.description || '').join(' ');
        if (m.params.type === 'error') errors.push('console.error: ' + text.slice(0, 200));
        if (m.params.type === 'warning' && text.indexOf('[boot_error]') === 0) bootErrors.push(text.replace('[boot_error] ', '').slice(0, 200));
      }
    });
    await c.send('Runtime.enable'); await c.send('Page.enable');
    await c.send('Emulation.setDeviceMetricsOverride', { width: sc.w, height: sc.h, deviceScaleFactor: 3, mobile: true });
    if (sc.init) await c.send('Page.addScriptToEvaluateOnNewDocument', { source: sc.init });
    await c.send('Page.navigate', { url: `${sc.base}/index.html?lang=${sc.lang}&map=1` });
    await sleep(2000);
    if (sc.beforeStart) await c.send('Runtime.evaluate', { expression: sc.beforeStart });
    await c.send('Runtime.evaluate', { expression: "document.getElementById('btn-start').click()" });
    await sleep(2500);
    const read = JSON.parse((await c.send('Runtime.evaluate', { expression: READ, returnByValue: true })).result.value);
    let shotOk = false;
    if (sc.id === 'tr-390') {
      const shot = await c.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(SHOT, Buffer.from(shot.data, 'base64')); shotOk = true;
    }
    c.close();
    return { read, errors, bootErrors, shotOk };
  } finally {
    proc.kill();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function checkScenario(sc, out) {
  const { read, errors, bootErrors } = out, tag = '[' + sc.id + '] ';
  check(errors.length === 0, tag + 'thrown errors: ' + errors.join(' | '));
  const want = (sc.bootErrors || []);
  check(bootErrors.length === want.length && want.every((w, i) => bootErrors[i].indexOf(w) === 0),
    tag + 'boot_error expected ' + JSON.stringify(want) + ' got ' + JSON.stringify(bootErrors));
  if (sc.expect === 'title') {
    check(read.screens.indexOf('scr-title') >= 0 && !read.rootVisible, tag + 'fallback did not land on the title (screens ' + read.screens + ', map visible ' + read.rootVisible + ')');
    return;
  }
  const journey = sc.lang === 'tr' ? 'BÖLÜM 1/100' : 'LEVEL 1/100';
  check(read.rootVisible, tag + 'map root is hidden');
  check(read.hoods === 20, tag + 'hood buttons: ' + read.hoods + ' (want 20)');
  check(read.hood0Class.indexOf('is-cur') >= 0, tag + 'Istiklal is not the current node: "' + read.hood0Class + '"');
  check(read.badge0 === '1', tag + 'Istiklal badge is "' + read.badge0 + '" (want 1)');
  check(read.hood0Name === read.hoodName, tag + 'Istiklal label "' + read.hood0Name + '"');
  check(read.next.indexOf(journey) === 0, tag + 'next-up line "' + read.next + '" lacks "' + journey + '"');
  check(read.next.indexOf(read.hoodName) >= 0, tag + 'next-up line has no hood name: "' + read.next + '"');
  check(/\b1\b/.test(read.play) && read.play.length > 4, tag + 'play label is "' + read.play + '"');
  check(read.km.length > 0, tag + 'km line is empty');
  const ph = read.phone, hr = read.hood0Rect, bt = read.bottom;
  if (ph && hr) {
    const cx = (hr.l + hr.r) / 2, pc = (ph.l + ph.r) / 2;
    check(Math.abs(cx - pc) < ph.w * 0.05, tag + 'camera is not on the first hood (node centre ' + Math.round(cx) + ', phone centre ' + Math.round(pc) + ')');
  }
  if (ph && bt) check(bt.b <= ph.b + 1 && bt.t >= ph.t, tag + 'next-up card is cut by the phone (bottom ' + Math.round(bt.b) + ' > ' + Math.round(ph.b) + ')');
}

// ---- Part 3: the team telemetry export (?debug=1, owner report "I don't see the telemetry button") at 390x844. With debug on
// the button is on the settings screen (reached from the title gear) and on the pause menu of a level (the map has no pause
// menu); each is visible, inside the viewport, not covered, at least 44 px, and a tap downloads the JSONL. Without debug the
// settings button stays hidden.
const VISIBLE = id => `JSON.stringify((function () {
  var e = document.getElementById('${id}'); if (!e) return null;
  var b = e.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2, hit = document.elementFromPoint(x, y);
  return { hidden: e.classList.contains('hidden') || getComputedStyle(e).display === 'none', w: b.width, h: b.height, x: x, y: y,
    inside: b.left >= 0 && b.top >= 0 && b.right <= innerWidth && b.bottom <= innerHeight, hit: !!hit && (hit === e || e.contains(hit)) };
})())`;
const TAP_TARGET = `JSON.stringify((function () { var e = document.querySelector('.meta-play'); if (!e) return null;
  var b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })())`;
async function tapAt(c, x, y) {
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await sleep(60);
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
function exportCheck(tag, p) {
  check(p && !p.hidden, tag + 'telemetry button is hidden');
  check(p && p.inside, tag + 'telemetry button is outside the viewport: ' + JSON.stringify(p));
  check(p && p.hit, tag + 'telemetry button is covered by another element at its centre');
  check(p && p.w >= 44 && p.h >= 44, tag + 'telemetry button is under 44 px: ' + (p && p.w) + 'x' + (p && p.h));
}
async function debugExportCheck(base) {
  const port = await freePort();
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'debug-export-'));
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--no-first-run',
    '--no-default-browser-check', '--disable-gpu', '--window-size=500,1000', 'about:blank'], { stdio: 'ignore' });
  try {
    let wsUrl = null;
    for (let i = 0; i < 150 && !wsUrl; i++) {
      try { const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const pg = list.find(x => x.type === 'page'); if (pg) wsUrl = pg.webSocketDebuggerUrl; } catch (e) { /* not up yet */ }
      if (!wsUrl) await sleep(100);
    }
    if (!wsUrl) throw new Error('Chrome did not start');
    const c = cdpClient(wsUrl); await c.ready;
    const errors = [];
    c.on(m => { if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; errors.push(((d.exception && d.exception.description) || d.text).split('\n')[0]); } });
    await c.send('Runtime.enable'); await c.send('Page.enable');
    await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__exports = 0; (function () { var o = URL.createObjectURL; URL.createObjectURL = function (b) { window.__exports++; return o.call(URL, b); }; })();' });
    const evalV = async expr => (await c.send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value;
    const tapId = async id => { const p = JSON.parse(await evalV(VISIBLE(id))); await tapAt(c, p.x, p.y); await sleep(400); };
    // Debug on: title gear -> settings shows the export; a tap downloads.
    await c.send('Page.navigate', { url: `${base}/index.html?lang=en&debug=1&map=1` }); await sleep(2000);
    await tapId('btn-title-settings'); await sleep(700);
    exportCheck('[debug settings] ', JSON.parse(await evalV(VISIBLE('btn-settings-export'))));
    await tapId('btn-settings-export'); await sleep(300);
    check((await evalV('window.__exports')) === 1, '[debug settings] tap did not download the JSONL');
    await tapId('btn-settings-back'); await sleep(500);
    // Debug on: start, the map (map=1), play the first level, pause; the pause menu shows the export and a tap downloads.
    await tapId('btn-start'); await sleep(1500);
    for (let i = 0; i < 80; i++) {
      const st = await evalV('P.debug && P.debug.state');
      if (st === 'play') break;
      if (st === 'map') { const t = JSON.parse(await evalV(TAP_TARGET)); if (t) await tapAt(c, t.x, t.y); }
      else if (st === 'cold' || st === 'story' || st === 'dying') await tapAt(c, 195, 400);
      await sleep(500);
    }
    await tapId('btn-pause'); await sleep(1000);
    check((await evalV('P.debug && P.debug.state')) === 'paused', '[debug pause] the level did not pause');
    exportCheck('[debug pause] ', JSON.parse(await evalV(VISIBLE('btn-export'))));
    await tapId('btn-export'); await sleep(300);
    check((await evalV('window.__exports')) === 2, '[debug pause] tap did not download the JSONL');
    // Debug off (control): the settings export stays hidden.
    await c.send('Page.navigate', { url: `${base}/index.html?lang=en&map=1` }); await sleep(2000);
    await tapId('btn-title-settings'); await sleep(700);
    check(JSON.parse(await evalV(VISIBLE('btn-settings-export'))).hidden === true, '[no debug] settings export is shown without ?debug=1');
    check(errors.length === 0, 'debug export: thrown errors: ' + errors.join(' | '));
    console.log('  debug export: pause and settings checked at 390x844');
    c.close();
  } finally {
    proc.kill();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function partBrowser() {
  if (typeof WebSocket === 'undefined') { console.log('browser part: SKIPPED (no WebSocket in this Node)'); return; }
  if (!fs.existsSync(CHROME)) { console.log('browser part: SKIPPED (Chrome not found at ' + CHROME + '; set CHROME_BIN)'); return; }
  const srv = await serve();
  const base = 'http://127.0.0.1:' + srv.address().port;
  try {
    for (const sc of SCENARIOS) {
      const out = await runScenario(Object.assign({ base }, sc), ['--window-size=500,1000']);
      checkScenario(sc, out);
      if (sc.id === 'tr-390') check(out.shotOk, 'screenshot was not written');
      console.log('  ' + sc.id + ': ' + JSON.stringify(out.read.next || out.read.screens) + ' | play "' + (out.read.play || '') + '"');
    }
    await debugExportCheck(base);
  } finally { srv.close(); }
}

(async () => {
  partNode();
  await partBrowser();
  console.log('map first-run tests: ' + passes + ' checks passed, ' + fails.length + ' failed');
  fails.forEach(f => console.log('  FAIL ' + f));
  process.exitCode = fails.length ? 1 : 0;
})().catch(e => { console.log('map first-run tests: crashed: ' + (e && e.stack || e)); process.exitCode = 1; });
