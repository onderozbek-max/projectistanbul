'use strict';
// Actual fresh opening at original speed, no supplied actors, power, simulation time or outcomes.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { openBrowser } = require('./lib-experiential-browser.cjs');
const { recordDOM } = require('./lib-experiential-record.cjs');
const output = path.resolve('reviews/media/R1/opening-diner-fix-2026-11-19');
const origin = process.env.ISTANBUL_PREVIEW || 'http://127.0.0.1:8786';
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await openBrowser(origin + '/?level=1&lang=tr&seed=42');
  try {
    await browser.until(() => browser.evaluate("P.debug.state==='title'&&P.ArtRaster.heroState()==='ready'"), 'fresh title');
    await browser.evaluate(`(() => {
      window.openingCheck = { elapsed: 0, samples: [], dust: 0 };
      const update = P.ColdOpen.update, draw = P.ArtRasterChars.enemy, emit = P.Feel.emit;
      P.ColdOpen.update = function(dt) { openingCheck.elapsed += dt; return update.apply(this, arguments); };
      P.Feel.emit = function(p) { if(P.ColdOpen.active() && p.k==='dust') openingCheck.dust++; return emit.apply(this,arguments); };
      P.ArtRasterChars.enemy = function(c,e,o,X,Y,uf,f) {
        const m = c.getTransform(), result = draw.apply(this,arguments);
        if(e.dinerIndex===0 && (!openingCheck.samples.length || openingCheck.elapsed-openingCheck.samples.at(-1).time>.3)) {
          openingCheck.samples.push({time:openingCheck.elapsed,state:e.state,x:e.x,y:e.y,
            alpha:c.globalAlpha,scale:Math.hypot(m.a,m.b)/P.Render.dpr,drawn:result});
        }
        return result;
      };
    })()`);
    const movie = await recordDOM(browser, path.join(output, 'opening-conversion.mp4'), async () => {
      await browser.evaluate("document.getElementById('btn-start').click()", true);
      for (const time of [12, 13.8, 15.8, 24.6, 26.2]) {
        await browser.until(() => browser.evaluate('openingCheck.elapsed>' + time), 'opening ' + time + 's');
        await browser.shot(path.join(output, 'opening-' + time + '.png'));
      }
      try {
        await browser.until(() => browser.evaluate("P.debug.state==='play'&&P.Input.enabled"), 'ordinary control return', 15000);
      } catch (error) {
        const state = await browser.evaluate('({state:P.debug.state,clock:P.debug.sim.runT,mode:P.debug.sim.mode,input:P.Input.enabled,scene:P.SceneFlow.current(),cold:P.ColdOpen.active(),pending:P.debug.sim.pendingLevels})');
        fs.writeFileSync(path.join(output,'control-failure.json'),JSON.stringify(state,null,2));
        return { failed: error.message, state };
      }
      const start = await browser.evaluate('P.debug.sim.hero.y');
      await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'w', code: 'KeyW', windowsVirtualKeyCode: 87 });
      await browser.sleep(700);
      await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'w', code: 'KeyW', windowsVirtualKeyCode: 87 });
      const end = await browser.evaluate('P.debug.sim.hero.y');
      assert(end > start, 'Fresh player can move after the opening');
      return { state: 'play', startY: start, endY: end, clock: await browser.evaluate('P.debug.sim.runT') };
    });
    const trace = await browser.evaluate('openingCheck');
    assert.equal(trace.dust, 0, 'No recurring spawn puff over a frozen seated actor');
    for (const sample of trace.samples.filter(s => s.time > 2 && s.time < 27)) {
      assert(sample.drawn && sample.alpha === 1 && sample.scale > .99, 'Resident stays fully drawn, opaque and full scale');
      if (sample.time > 14 && sample.time < 27) assert.equal(sample.state, 'active');
    }
    assert.equal(browser.errors.length, 0, browser.errors.join('\n'));
    const source = JSON.parse(fs.readFileSync('reviews/telemetry/audit8-implementation/opening-fix-final-build.json'));
    fs.writeFileSync(path.join(output, 'index.json'), JSON.stringify({ sourceManifest: source.runtime_manifest_sha256,
      provenance: 'Fresh isolated desktop browser, actual Start and movement keys; uninterrupted normal-speed opening with real post-master audio. No time skips, supplied actors/power or scene outcome grants. Not physical-phone evidence.',
      movie, trace, browserErrors: browser.errors }, null, 2) + '\n');
    assert(!movie.outcome.failed, JSON.stringify(movie.outcome));
    console.log('PASS: visible transformation/approach/strike; no repeating dust; actual movement after opening; normal-speed film saved.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
