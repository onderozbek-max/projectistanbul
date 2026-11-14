// Weapon tier stills (owner feedback: "interactions and weapons look similar"). Renders every base weapon at level 1, 3 and 5,
// and every evolution at mastery rank 1, 3 and 5, with the real renderer (tools/weapon-tier-still.html), into
// /tmp/weapon_tiers/<id>_L<n>.png, plus contact sheets (rows: weapon at L1, L3, L5 and its evolution; evolution rows: base L5
// and the evolution at ranks 1, 3, 5). Headless Chrome over CDP, the same pattern as test-map-first-run.js; skipped with a
// note when Chrome is not found. Usage: node prototype/tools/weapon-tier-still.js [--only=knife,nailgun] [--out=/tmp/weapon_tiers]
//   [--no-evo] [--no-sheets]. Prints the frame time of each still and exits 1 on a thrown error or a missing still.
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), net = require('net');
const { spawn } = require('child_process');
const ROOT = path.join(__dirname, '..');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v === undefined ? true : v]));
const OUT = args.out || '/tmp/weapon_tiers', ONLY = args.only ? String(args.only).split(',') : null;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function freePort() {
  return new Promise((res, rej) => { const srv = net.createServer(); srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => res(p)); }); srv.on('error', rej); });
}
function serve() {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml' };
  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nope'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
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
async function evalJson(c, expr) {
  const r = await c.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: false });
  if (r.exceptionDetails) throw new Error('page: ' + ((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text).split('\n')[0]);
  return r.result.value;
}
const png = (dir, name, dataUrl) => fs.writeFileSync(path.join(dir, name), Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));

async function main() {
  if (!fs.existsSync(CHROME)) { console.log('weapon-tier-still: Chrome not found at ' + CHROME + ' (set CHROME_BIN); skipped'); return; }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serve(), base = 'http://127.0.0.1:' + srv.address().port;
  const port = await freePort(), dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'weapon-tier-'));
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--no-first-run',
    '--no-default-browser-check', '--disable-gpu', '--window-size=500,1000', 'about:blank'], { stdio: 'ignore' });
  const errors = [];
  let code = 0;
  try {
    let wsUrl = null;
    for (let i = 0; i < 150 && !wsUrl; i++) {
      try { const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const pg = list.find(x => x.type === 'page'); if (pg) wsUrl = pg.webSocketDebuggerUrl; } catch (e) { /* not up yet */ }
      if (!wsUrl) await sleep(100);
    }
    if (!wsUrl) throw new Error('Chrome did not start');
    const c = cdpClient(wsUrl); await c.ready;
    c.on(m => {
      if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; errors.push('exception: ' + ((d.exception && d.exception.description) || d.text).split('\n')[0]); }
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console.error: ' + m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 200));
    });
    await c.send('Runtime.enable'); await c.send('Page.enable');
    await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
    await c.send('Page.navigate', { url: `${base}/tools/weapon-tier-still.html` });
    let ready = false;
    for (let i = 0; i < 600 && !ready; i++) {
      await sleep(100);
      ready = await evalJson(c, 'window.__still && window.__still.ready === true').catch(() => false);
    }
    const err = await evalJson(c, 'window.__still && (window.__still.error || (window.__still.errs || []).slice(0, 3).join(" | ") + " LOADED " + (window.__still.loaded||[]).length + " last " + (window.__still.loaded||[]).slice(-1)) || null').catch(() => null);
    if (!ready) throw new Error('stills page did not load' + (err ? ': ' + err : '') + (errors.length ? ' (' + [...new Set(errors)].slice(0, 3).join(' | ') + ')' : ''));
    const list = JSON.parse(await evalJson(c, `JSON.stringify({ base: P.CFG.arsenal.weapons, evo: Object.keys(P.CFG.evolutions).map(k => [k, P.CFG.evolutions[k].from]) })`));
    const bases = list.base.filter(id => !ONLY || ONLY.includes(id));
    const evos = args['no-evo'] ? [] : list.evo.filter(([id, from]) => !ONLY || ONLY.includes(id) || ONLY.includes(from)).map(([id]) => id);
    const rows = [], fail = [];
    const shoot = async (id, lv, evo, name) => {
      const r = JSON.parse(await evalJson(c, `JSON.stringify(window.__still.render(${JSON.stringify(id)}, ${lv}, ${evo}))`));
      if (r.error) { fail.push(name + ': ' + r.error); return null; }
      png(OUT, name, r.png);
      return r;
    };
    for (const id of bases) {
      const cells = [];
      for (const lv of [1, 3, 5]) {
        const r = await shoot(id, lv, false, `${id}_L${lv}.png`);
        if (r) console.log(`${id} L${lv}: fired at step ${r.fired}, still at step ${r.steps}`);
        cells.push([id, lv, false]);
      }
      rows.push(cells);
    }
    const evoRows = [];
    for (const id of evos) {
      const from = list.evo.find(([k]) => k === id)[1];
      const cells = [[from, 5, false]];
      for (const rank of [1, 3, 5]) {
        const r = await shoot(id, rank, true, `${id}_L${rank}.png`);
        if (r) console.log(`${id} (evo) rank ${rank}: fired at step ${r.fired}`);
        cells.push([id, rank, true]);
      }
      evoRows.push(cells);
    }
    if (!args['no-sheets']) {
      const all = rows.concat(evoRows), per = 6;
      for (let i = 0; i < all.length; i += per) {
        const chunk = all.slice(i, i + per), r = JSON.parse(await evalJson(c, `JSON.stringify(window.__still.sheet(${JSON.stringify(chunk)}))`));
        if (r.error) fail.push('sheet ' + i + ': ' + r.error); else png(OUT, `sheet_${String(i / per + 1).padStart(2, '0')}.png`, r.png);
      }
    }
    c.close();
    console.log(`stills: ${bases.length} weapons x 3 levels, ${evos.length} evolutions x 3 ranks -> ${OUT}`);
    if (errors.length) console.log('page errors:\n  ' + [...new Set(errors)].slice(0, 10).join('\n  '));
    if (fail.length) console.log('FAILED stills:\n  ' + fail.join('\n  '));
    if (errors.length || fail.length) code = 1;
  } catch (e) {
    console.log('weapon-tier-still: ' + e.message);
    code = 1;
  } finally {
    proc.kill();
    srv.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
  process.exitCode = code;
}
main();
