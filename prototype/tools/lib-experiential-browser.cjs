'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

async function openBrowser(url, options = {}) {
  const dir = options.profileDir || fs.mkdtempSync(path.join(os.tmpdir(), 'istanbul-experience-'));
  // Chrome retains this port file after normal shutdown; a resumed earned profile
  // must wait for the newly launched browser rather than contacting yesterday's port.
  if (options.profileDir) fs.rmSync(path.join(dir, 'DevToolsActivePort'), { force: true });
  const proc = spawn(process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + dir,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking',
    '--autoplay-policy=no-user-gesture-required', 'about:blank'
  ], { stdio: 'ignore' });
  let ws, serial = 0;
  const pending = new Map(), errors = [], messages = [], bindings = new Map();
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function until(read, label, timeout = 45000) {
    const end = Date.now() + timeout;
    while (Date.now() < end) { const value = await read(); if (value) return value; await sleep(100); }
    throw Error('Timed out waiting for ' + label + '\n' + errors.join('\n'));
  }
  async function close() {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({id:++serial,method:'Browser.close'}));
    await sleep(250);
    if (ws) ws.close(); proc.kill();
  }
  try {
    const active = path.join(dir, 'DevToolsActivePort');
    await until(() => fs.existsSync(active), 'Chrome');
    const port = fs.readFileSync(active, 'utf8').split('\n')[0];
    const pages = await until(async () => {
      try { const list=await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
        return list.some(p=>p.type==='page') ? list : null; } catch (_) { return null; }
    }, 'Chrome debug page');
    ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.id && pending.has(m.id)) {
        const p = pending.get(m.id); pending.delete(m.id);
        if (m.error) p.reject(Error(JSON.stringify(m.error))); else p.resolve(m.result);
      } else if (m.method === 'Runtime.bindingCalled' && bindings.has(m.params.name)) {
        try { bindings.get(m.params.name)(m.params.payload); }
        catch (error) { errors.push('Capture binding: ' + String(error)); }
      } else {
        messages.push(m);
        if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
        if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning' && m.params.args.some(a => String(a.value).includes('boot_error')))) errors.push(m.params.args.map(a => a.value || a.description).join(' '));
      }
    };
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const requestMs = Math.max(45000, +(process.env.ISTANBUL_BROWSER_TIMEOUT_MS || 45000));
        const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error('Chrome request timed out: '+method));},requestMs);
        pending.set(id, { resolve(value){clearTimeout(timer);resolve(value);},reject(error){clearTimeout(timer);reject(error);} });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }
    async function evaluate(expression, gesture = false) {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: gesture });
      if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    }
    async function binding(name, callback) {
      bindings.set(name, callback); await send('Runtime.addBinding', { name });
      return async () => { await send('Runtime.removeBinding', { name }); bindings.delete(name); };
    }
    async function shot(file) {
      const r = await send('Page.captureScreenshot', { format: 'png' });
      fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
    }
    async function ensureViewport() {
      const width=options.width||390,height=options.height||844;
      const info=await send('Browser.getWindowForTarget');
      await send('Browser.setWindowBounds',{windowId:info.windowId,bounds:{width,height}});
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false,screenWidth:width,screenHeight:height});
      await send('Emulation.setVisibleSize',{width,height});
    }
    await send('Runtime.enable'); await send('Page.enable');
    await ensureViewport();
    await send('Page.navigate', { url });
    if (options.waitForGame !== false) await until(() => evaluate('!!window.P?.debug'), 'game boot');
    return { send, evaluate, shot, until, sleep, close, ensureViewport, binding, errors, messages, dir };
  } catch (error) { await close(); throw error; }
}
module.exports = { openBrowser };
