// Dev helper: prints Batch A (or ids matching a regex) with current lines. Usage: node tools/dlg-show.js <tr|en> <regex> [--meta]
'use strict';
const { loadP } = require('./lib-load.js');
const Q = loadP(), lg = process.argv[2], re = new RegExp(process.argv[3] || '.');
Q.Dialogue.batch('A').filter(id => re.test(id)).forEach(id => {
  const b = Q.DLG.beats[id], l = Q.DLG[lg][id] || [];
  console.log(id + ' <' + b.spk.replace('spk.', '') + '> ' + b.use);
  l.forEach((x, i) => console.log('  ' + i + (x.j ? 'j' : ' ') + ' ' + x.t));
});
