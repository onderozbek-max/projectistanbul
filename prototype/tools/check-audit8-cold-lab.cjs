'use strict';
// Cold browser/DOM check. This deliberately uses the supplied weapon-preview mode, not earned play.
const fs = require('node:fs');
const { openBrowser } = require('./lib-experiential-browser.cjs');
(async () => {
  const browser = await openBrowser((process.env.ISTANBUL_PREVIEW || 'http://127.0.0.1:8785') + '/?weaponlab=1&lang=en');
  const records = [];
  try {
    await browser.until(() => browser.evaluate("P.debug.state==='lab'&&!!document.getElementById('weapon-lab-start')"), 'cold lab controls');
    async function select(id, rank) {
      await browser.evaluate(`document.getElementById('weapon-lab-weapon').value=${JSON.stringify(id)};document.getElementById('weapon-lab-weapon').dispatchEvent(new Event('change'));document.getElementById('weapon-lab-${rank === 5 ? 'five' : 'one'}').click();document.getElementById('weapon-lab-start').click()`, true);
      await browser.until(() => browser.evaluate(`P.debug.state==='play'&&P.debug.sim.t>1&&P.debug.sim.hero.weapons[${JSON.stringify(id)}]===${rank}`), id + ' active');
      const start = await browser.evaluate('({clock:P.debug.sim.t,mode:P.debug.sim.mode,input:P.Input.enabled})');
      await browser.sleep(1200);
      const end = await browser.evaluate('({clock:P.debug.sim.t,mode:P.debug.sim.mode,input:P.Input.enabled})');
      if (!(end.clock > start.clock + 0.5) || !end.input || end.mode !== 'play') throw Error(id + ' failed active clock/input check: ' + JSON.stringify({ start, end }));
      records.push({ weapon: id, rank, start, end });
    }
    await select('sledge', 1);
    await select('torch', 5);
    if (browser.errors.length) throw Error(browser.errors.join('\n'));
    fs.writeFileSync('reviews/telemetry/audit8-implementation/verified-cold-lab.json', JSON.stringify({ complete: true, provenance: 'Desktop cold browser, actual DOM selection/start/rank controls; supplied weapon-preview mode, no earned-play claim.', records, browserErrors: browser.errors }, null, 2) + '\n');
    console.log('Cold weapon preview: both actual selections advance with live input, zero browser errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
