// Checks for the generated-SFX route (D-063, proposed). Runs without a browser.
//  1. The brief (audio/sfx-gen/BRIEF.md) matches the bank: every cue exists, batches, prompts, no keep cue in the brief.
//  2. Runtime (js/view/sfx.js + sfx-gen.js) in a vm sandbox with fake WebAudio, fetch and timers:
//     a file is used when present, the synth recipe when missing, round robin over takes, hit kinds, pitch jitter and
//     design-level gain, no crash when fetch fails, file:// and ?sfx=synth stay silent, the cue cap, beds (pending,
//     loaded, synth fallback), a start that throws drops the cue to synth.
//  3. prepare-sfx.js on synthetic files made by ffmpeg in the OS temp folder (not the repo): names, takes, silence,
//     clipping, bed length and seam, partial re-run keeps other entries. sfx-provenance.js refuses without the licence flag.
// Usage: node prototype/tools/test-sfx-gen.js [--quick]   (--quick skips part 3)
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), vm = require('vm');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const quick = process.argv.includes('--quick');
let fails = 0, warns = 0;
function ok(c, m) { if (!c) { fails++; console.log('FAIL ' + m); } }
function warn(m) { warns++; console.log('WARN ' + m); }
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// ---- 1. the brief against the bank

const prep = require('./prepare-sfx.js');
const { ids: VALID } = prep.validIds();
const KEEP = ['tink', 'coin', 'star', 'magnet'];
{
  const brief = read('audio/sfx-gen/BRIEF.md');
  const rows = [...brief.matchAll(/^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|(.*)$/gm)].map(m => ({ n: +m[1], cue: m[2], line: m[3] }));
  ok(rows.length === 45, `brief lists 45 cues (found ${rows.length})`);
  ok(rows.every((r, i) => r.n === i + 1), 'brief rows are numbered 1 to 45 in order');
  const seen = new Set(rows.map(r => r.cue));
  ok(seen.size === rows.length, 'no cue appears twice in the brief');
  rows.forEach(r => ok(VALID.indexOf(r.cue) >= 0, `brief cue ${r.cue} is a valid file id (bank or hit kind)`));
  KEEP.forEach(k => ok(!seen.has(k), `keep cue ${k} is not in the brief`));
  ok(!seen.has('speech') && !seen.has('hit'), 'speech and the bare hit cue are not in the brief');
  const batches = [0, 0, 0, 0];
  for (const b of brief.matchAll(/^#{2,3}\s*Batch\s*(\d)/gm)) batches[+b[1] - 1] = 1;
  ok(batches.every(Boolean), 'four batches are headed in the brief');
  // Each row: a prompt with negative guidance, a take count of 1 to 4 and a target length of 3 s or less.
  for (const r of rows) {
    const cells = r.line.split('|').map(s => s.trim());
    // Columns after the cue: when it plays | gap ms | at once | target s | takes | prompt
    const takes = Number(cells[4]), target = parseFloat(cells[3]), prompt = cells[5] || '';
    ok(takes >= 1 && takes <= 4, `${r.cue}: takes 1 to 4 (got ${cells[4]})`);
    ok(target > 0 && target <= 3, `${r.cue}: target length 3 s or less (got ${cells[3]})`);
    ok(prompt.length > 40, `${r.cue}: has a prompt`);
    ok(/no music|no song/i.test(prompt), `${r.cue}: prompt says no music (or no song for stingers)`);
    ok(/no speech|no words|no vocals|no voices|non-verbal/i.test(prompt), `${r.cue}: prompt says no speech or words`);
  }
  const beds = [...brief.matchAll(/`amb_(street|waterfront|bazaar|wind|night)`/g)].map(m => m[1]);
  ok(new Set(beds).size === 5, 'brief has the five ambience beds');
  ok(brief.indexOf('music stays') >= 0 || brief.indexOf('Music stays') >= 0, 'brief says music stays Suno');
  console.log(`brief: ${rows.length} cues, ${brief.length} characters`);
}

// ---- 2. runtime in a vm sandbox

function sandbox(o) {
  o = o || {};
  const st = { clock: 1000, timers: [], starts: [], fetches: [], logs: [], errs: [] };
  const files = {};
  const man = o.manifest || null;
  if (man) {
    Object.values(man.cues || {}).forEach(l => l.forEach(e => { files[e.file] = e.seconds; }));
    Object.values(man.beds || {}).forEach(e => { files[e.file] = e.seconds; });
  }
  const fpar = (v) => ({ value: v, setValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {} });
  const node = (props) => Object.assign({ connect(to) { this._to = to; if (to && to.gain) this._g = to; return to; }, disconnect() {} }, props);
  class FakeBuffer { constructor(n, sr, file) { this.length = n; this.sampleRate = sr; this.duration = n / sr; this.file = file || null; this.d = new Float32Array(n); } getChannelData() { return this.d; } }
  class FakeCtx {
    constructor() { this.sampleRate = 48000; this.destination = {}; this.state = 'running'; }
    get currentTime() { return st.clock / 1000; }
    resume() { this.state = 'running'; }
    decodeAudioData(ab, ok2, err) { return decodeFake(ab, ok2, err); }   // a live context decodes too
    createBuffer(ch, n, sr) { return new FakeBuffer(n, sr || 48000, null); }
    createGain() { return node({ gain: fpar(1) }); }
    createDynamicsCompressor() { return node({ threshold: fpar(0), knee: fpar(0), ratio: fpar(0), attack: fpar(0), release: fpar(0) }); }
    createConvolver() { return node({ buffer: null }); }
    createStereoPanner() { return node({ pan: fpar(0) }); }
    createBufferSource() {
      const s = node({ buffer: null, loop: false, playbackRate: fpar(1), onended: null });
      s.start = function () {
        if (o.throwOnStart && st.starts.length === 0 && s.buffer && s.buffer.file) throw new Error('context refused the buffer');
        st.starts.push({ buf: s.buffer, rate: s.playbackRate.value, gain: s._g ? s._g.gain.value : null, loop: s.loop });
      };
      s.stop = function () {};
      return s;
    }
  }
  class FakeOffline { constructor(ch, len, sr) { this.sampleRate = sr; } decodeAudioData(ab, ok2, err) { return decodeFake(ab, ok2, err); } }
  function decodeFake(ab, ok2, err) {
    if (!ab || !ab.file) { const e = new Error('decode'); if (err) err(e); return Promise.reject(e); }
    const b = new FakeBuffer(Math.round(ab.seconds * 48000), 48000, ab.file);
    if (ok2) ok2(b);
    return Promise.resolve(b);
  }
  function fetchFake(url) {
    st.fetches.push(url);
    if (o.fail) return Promise.reject(new TypeError('Failed to fetch'));
    const name = String(url).split('/').pop();
    if (name === 'manifest.json') return Promise.resolve(man ? { ok: true, json: () => Promise.resolve(man) } : { ok: false });
    if (files[name] !== undefined) return Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve({ file: name, seconds: files[name] }) });
    return Promise.resolve({ ok: false });
  }
  const consoleFake = { log: (...a) => st.logs.push(a.join(' ')), warn: (...a) => st.logs.push(a.join(' ')), error: (...a) => st.errs.push(a.join(' ')) };
  const win = { AudioContext: FakeCtx, webkitAudioContext: FakeCtx, OfflineAudioContext: FakeOffline, fetch: fetchFake };
  const ctx = { P: {}, console: consoleFake, performance: { now: () => st.clock }, setTimeout: (f) => { st.timers.push(f); return st.timers.length; },
    clearTimeout() {}, Math, Promise, Float32Array, Date, window: win, fetch: fetchFake,
    location: { search: o.search || '', protocol: o.protocol || 'https:' } };
  return { ctx, st, P: ctx.P };
}
function load(o) {
  const sb = sandbox(o);
  vm.createContext(sb.ctx);
  for (const f of ['js/view/sfx-bank.js', 'js/view/sfx-bank2.js', 'js/view/sfx.js', 'js/view/sfx-gen.js']) {
    vm.runInContext(read(f), sb.ctx, { filename: f });
  }
  return sb;
}
async function flush(st, n) {
  for (let i = 0; i < (n || 40); i++) {
    await new Promise(r => setImmediate(r));
    st.timers.splice(0).forEach(f => f());
  }
}
const tick = (st) => { st.clock += 1600; };         // longer than the longest test clip (1 s), so the voice limits free up
const manifestOf = (cues, beds) => ({ tool: 'test', version: 1, cues: cues || {}, beds: beds || {} });
const entry = (file, variant, seconds, db, peak) => ({ file, variant, seconds, db, peak, bytes: 1000, source: file });

async function runtimeTests() {
  // a. a file is used when present
  {
    const man = manifestOf({ splat: [entry('splat.mp3', 0, 0.3, -18, -4)] });
    const sb = load({ manifest: man });
    await flush(sb.st);
    sb.P.Sfx.play('splat', 0, {}); tick(sb.st);
    const last = sb.st.starts[sb.st.starts.length - 1];
    ok(last && last.buf && last.buf.file === 'splat.mp3', 'a. a present file plays instead of the synth recipe');
    ok(sb.st.fetches.some(u => /audio\/sfx-gen\/ready\/manifest\.json$/.test(u)), 'a. manifest is fetched from audio/sfx-gen/ready/');
  }
  // b. a missing cue falls back to the synth recipe
  {
    const sb = load({ manifest: manifestOf({ splat: [entry('splat.mp3', 0, 0.3, -18, -4)] }) });
    await flush(sb.st);
    ok(sb.P.SfxGen.pick('bell') === null, 'b. pick returns null for a cue with no file');
    sb.P.Sfx.play('bell', 0, {});
    const last = sb.st.starts[sb.st.starts.length - 1];
    ok(last && last.buf && last.buf.file === null, 'b. a missing cue plays the synthesized buffer');
  }
  // c. round robin over takes, with the variant order 0 1 2 0 1 2
  {
    const man = manifestOf({ nail: [entry('nail.mp3', 0, 0.2, -16, -3), entry('nail_2.mp3', 1, 0.2, -16, -3), entry('nail_3.mp3', 2, 0.2, -16, -3)] });
    const sb = load({ manifest: man });
    await flush(sb.st);
    const order = [];
    for (let i = 0; i < 6; i++) { sb.P.Sfx.play('nail', 0, {}); tick(sb.st); order.push(sb.st.starts[sb.st.starts.length - 1].buf.file); }
    ok(order.join(',') === 'nail.mp3,nail_2.mp3,nail_3.mp3,nail.mp3,nail_2.mp3,nail_3.mp3', `c. round robin over three takes (got ${order.join(',')})`);
  }
  // d. hit kinds: hit_<kind> files, the default kind is body
  {
    const man = manifestOf({ hit_blade: [entry('hit_blade.mp3', 0, 0.15, -17, -3)], hit_body: [entry('hit_body.mp3', 0, 0.3, -17, -3)] });
    const sb = load({ manifest: man });
    await flush(sb.st);
    sb.P.Sfx.play('hit', 0, { kind: 'blade' }); tick(sb.st);
    ok(sb.st.starts[sb.st.starts.length - 1].buf.file === 'hit_blade.mp3', 'd. hit with kind blade plays hit_blade.mp3');
    sb.P.Sfx.play('hit', 0, {}); tick(sb.st);
    ok(sb.st.starts[sb.st.starts.length - 1].buf.file === 'hit_body.mp3', 'd. hit with no kind plays hit_body.mp3');
    sb.P.Sfx.play('hit', 0, { kind: 'pierce' }); tick(sb.st);
    ok(sb.st.starts[sb.st.starts.length - 1].buf.file === null, 'd. a hit kind with no file plays the synth recipe');
  }
  // e. pitch jitter stays within +-4% and the gain follows the design table (bell: design -18 dB, file -17 dB)
  {
    const sb = load({ manifest: manifestOf({ bell: [entry('bell.mp3', 0, 1.0, -17, -10)] }) });
    await flush(sb.st);
    const rates = [];
    for (let i = 0; i < 60; i++) { sb.P.Sfx.play('bell', 0, {}); tick(sb.st); rates.push(sb.st.starts[sb.st.starts.length - 1].rate); }
    ok(rates.every(r => r >= 0.96 - 1e-9 && r <= 1.04 + 1e-9), 'e. pitch jitter stays within +-4%');
    ok(new Set(rates.map(r => r.toFixed(4))).size > 10, 'e. pitch varies between plays');
    const g = sb.st.starts[sb.st.starts.length - 1].gain;
    ok(Math.abs(g - Math.pow(10, -1 / 20)) < 1e-6, `e. gain is the design-table difference (got ${g})`);
  }
  // f. a failed fetch is silent: no throw, no console output, the synth still plays
  {
    const sb = load({ manifest: manifestOf({ splat: [entry('splat.mp3', 0, 0.3, -18, -4)] }), fail: true });
    await flush(sb.st);
    let threw = false;
    try { sb.P.Sfx.play('splat', 0, {}); tick(sb.st); } catch (e) { threw = true; }
    ok(!threw, 'f. play does not throw when fetch fails');
    ok(sb.st.starts.length === 1 && sb.st.starts[0].buf.file === null, 'f. with fetch blocked the synth recipe plays');
    ok(sb.st.errs.length === 0 && sb.st.logs.length === 0, 'f. nothing is logged when fetch fails');
  }
  // g. file:// and ?sfx=synth make no requests and use the synth recipe
  {
    const a = load({ manifest: manifestOf({ splat: [entry('splat.mp3', 0, 0.3, -18, -4)] }), protocol: 'file:' });
    await flush(a.st);
    a.P.Sfx.play('splat', 0, {}); tick(a.st);
    ok(a.st.fetches.length === 0, 'g. file:// makes no fetch');
    ok(a.st.starts[0].buf.file === null, 'g. file:// plays the synth recipe');
    const b = load({ manifest: manifestOf({ splat: [entry('splat.mp3', 0, 0.3, -18, -4)] }), search: '?lang=tr&sfx=synth' });
    await flush(b.st);
    b.P.Sfx.play('splat', 0, {}); tick(b.st);
    ok(b.st.fetches.length === 0, 'g. ?sfx=synth makes no fetch');
    ok(b.st.starts[0].buf.file === null && b.P.SfxGen.pick('splat') === null, 'g. ?sfx=synth plays the synth recipe');
  }
  // h. the cue cap: a long list is cut short and the decoded total stays under the cap
  {
    const list = [];
    for (let i = 0; i < 300; i++) list.push(entry('splat_' + i + '.mp3', 0, 1.0, -17, -3));
    const cues = {}, cueIds = prep.validIds().ids.filter(id => id.indexOf('amb_') !== 0);
    cueIds.forEach(id => { cues[id] = [entry(id + '.mp3', 0, 1.0, -17, -3), entry(id + '_2.mp3', 1, 1.0, -17, -3)]; });
    const sb = load({ manifest: manifestOf(cues) });
    await flush(sb.st, 400);
    const s = sb.P.SfxGen.stats();
    ok(s.decodedBytes <= s.capBytes, `h. decoded bytes ${s.decodedBytes} within the cap ${s.capBytes}`);
    ok(s.skipped > 0 && s.loaded + s.skipped === 2 * cueIds.length,
      `h. files over the cap are skipped (loaded ${s.loaded}, skipped ${s.skipped} of ${2 * cueIds.length})`);
    ok(s.capBytes + 20 * 48000 * 4 < 20000000, 'h. cue cap plus the largest bed stays under 20 MB');
    console.log(`memory: decoded ${(s.decodedBytes / 1e6).toFixed(2)} MB of cues after the cap test (cap ${(s.capBytes / 1e6).toFixed(1)} MB); a bed adds at most 3.84 MB`);
  }
  // i. beds: a generated bed starts when decoded; a missing one starts the synth bed at once
  {
    const sb = load({ manifest: manifestOf({ splat: [entry('splat.mp3', 0, 0.3, -18, -4)] }, { street: { file: 'amb_street.mp3', seconds: 9.5, rmsDb: -26, peak: -10, bytes: 1, source: 'x' } }) });
    await flush(sb.st);
    sb.P.Sfx.play('splat', 0, {}); tick(sb.st);
    const before = sb.st.starts.length;
    sb.P.Sfx.ambience('istiklal');
    ok(sb.st.starts.length === before, 'i. a generated bed waits for its decode (no synth start in between)');
    await flush(sb.st);
    const bedStart = sb.st.starts.slice(before).find(s => s.loop);
    ok(bedStart && bedStart.buf.file === 'amb_street.mp3', 'i. the generated bed starts after decode, looped');
    sb.P.Sfx.ambience('karakoy');
    await flush(sb.st);
    const wb = sb.st.starts.slice(before).filter(s => s.loop);
    ok(wb.length >= 2 && wb[wb.length - 1].buf.file === null, 'i. a theme with no bed file starts the synth bed');
  }
  // j. a start the context refuses drops that cue to the synth recipe
  {
    const sb = load({ manifest: manifestOf({ bell: [entry('bell.mp3', 0, 1.0, -17, -10)] }), throwOnStart: true });
    await flush(sb.st);
    let threw = false;
    try { sb.P.Sfx.play('bell', 0, {}); } catch (e) { threw = true; }
    tick(sb.st);
    ok(!threw, 'j. a refused buffer does not throw out of play');
    sb.P.Sfx.play('bell', 0, {}); tick(sb.st);
    ok(sb.st.starts.length === 1 && sb.st.starts[0].buf.file === null, 'j. after a refused start the cue uses the synth recipe');
  }
  // k. the synth recipe for a cue with no file is unchanged in length (warm skips only covered cues)
  {
    const sb = load({ manifest: manifestOf({ splat: [entry('splat.mp3', 0, 0.3, -18, -4)] }) });
    await flush(sb.st);
    ok(sb.P.SfxGen.has('splat') && !sb.P.SfxGen.has('bell'), 'k. has() reports covered cues only');
    ok(sb.P.SfxGen.has('hit') === false, 'k. has("hit") is false with no hit kind');
  }
}

// ---- 3. the tool, on synthetic files in the OS temp folder

async function toolTests() {
  if (spawnSync('ffmpeg', ['-version']).status !== 0) { warn('ffmpeg not found: skipping the tool tests'); return; }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'test-sfx-gen-'));
  const src = path.join(tmp, 'src'), dst = path.join(tmp, 'ready');
  fs.mkdirSync(src);
  const ff = (args) => { const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args]); ok(r.status === 0, 'ffmpeg made ' + args[args.length - 1]); };
  ff(['-f', 'lavfi', '-i', 'anoisesrc=d=0.25:c=pink:a=0.5', '-af', 'adelay=150,afade=t=out:st=0.15:d=0.1', '-ac', '1', path.join(src, 'splat.wav')]);
  ff(['-f', 'lavfi', '-i', 'sine=f=220:d=0.2', '-af', 'afade=t=out:st=0.05:d=0.15,volume=0.4', '-ac', '1', path.join(src, 'splat_2.mp3')]);
  ff(['-f', 'lavfi', '-i', 'anoisesrc=d=0.15:c=white:a=0.4', '-af', 'afade=t=out:st=0.02:d=0.13', '-ac', '1', path.join(src, 'hit_blade.wav')]);
  ff(['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', '0.2', path.join(src, 'uiTap.wav')]);
  ff(['-f', 'lavfi', '-i', 'sine=f=1000:d=0.3', '-af', 'volume=12', '-ac', '1', path.join(src, 'click.wav')]);
  ff(['-f', 'lavfi', '-i', 'anoisesrc=d=0.3:c=pink:a=0.5', '-ac', '1', path.join(src, 'hit.wav')]);
  ff(['-f', 'lavfi', '-i', 'anoisesrc=d=0.3:c=pink:a=0.5', '-ac', '1', path.join(src, 'speech_arda.wav')]);
  ff(['-f', 'lavfi', '-i', 'anoisesrc=d=0.3:c=pink:a=0.5', '-ac', '1', path.join(src, 'boom_5.wav')]);
  ff(['-f', 'lavfi', '-i', 'anoisesrc=d=0.3:c=pink:a=0.5', '-ac', '1', path.join(src, 'Blast.wav')]);
  ff(['-f', 'lavfi', '-i', 'anoisesrc=d=8.8:c=brown:a=0.5', '-af', 'lowpass=f=900,volume=0.6', '-ac', '1', path.join(src, 'amb_street.wav')]);
  // a smooth, non-periodic 9.5 s bed for the seam check (the blend must join it with a normal step)
  const rep = prep.prepare({ src, dst });
  const byId = Object.fromEntries(rep.rows.map(r => [r.id + '|' + r.variant, r]));
  ok(byId['splat|0'] && byId['splat|0'].status === 'written', 'tool: splat take 1 written');
  ok(byId['splat|1'] && byId['splat|1'].status === 'written', 'tool: splat take 2 written (the _2 name)');
  ok(byId['hit_blade|0'] && byId['hit_blade|0'].status === 'written', 'tool: hit_blade written');
  ok(byId['uiTap|0'] && byId['uiTap|0'].status === 'rejected', 'tool: a silent take is rejected');
  ok(byId['click|0'] && byId['click|0'].warn.some(w => /clips/.test(w)), 'tool: clipping is reported');
  ok(rep.notes.some(n => /hit\.wav/.test(n) && /hit_body/.test(n)), 'tool: a bare hit file is refused with the kind names');
  ok(rep.notes.some(n => /speech_arda/.test(n)), 'tool: speech is refused');
  ok(rep.notes.some(n => /boom_5/.test(n)), 'tool: take 5 is refused');
  ok(rep.notes.some(n => /Blast\.wav/.test(n) && /blast/.test(n)), 'tool: a wrong-case name is pointed to the exact id');
  const m = JSON.parse(fs.readFileSync(path.join(dst, 'manifest.json'), 'utf8'));
  ok(m.cues.splat && m.cues.splat.length === 2, 'tool: manifest lists both splat takes');
  ok(m.cues.splat && m.cues.splat[0].file === 'splat.mp3' && m.cues.splat[1].file === 'splat_2.mp3', 'tool: take file names are splat.mp3 and splat_2.mp3');
  ok(m.beds.street && Math.abs(m.beds.street.seconds - 8.3) < 0.1, `tool: bed is the source less the 0.5 s blend (got ${m.beds.street && m.beds.street.seconds})`);
  ok(m.cues.splat[0].seconds > 0 && m.cues.splat[0].seconds <= 0.8, 'tool: a short splat take is 0.8 s or less');
  ok(m.budget && m.budget.cueEstimateBytes < m.budget.cueCapBytes, 'tool: budget estimate is under the cap');
  const lv = m.cues.hit_blade[0].db;
  ok(Math.abs(lv - -17) < 0.6, `tool: impact class lands near -17 dBFS loudest 50 ms (got ${lv})`);
  // seam: the blend joins the bed's last sample to its first with a normal step
  const seam = prep.loopBlend(Float32Array.from({ length: 44100 * 2 }, (_, i) => 0.4 * Math.sin(2 * Math.PI * 110 * i / 44100) + 0.2 * Math.sin(2 * Math.PI * 233.3 * i / 44100)));
  const out = seam.out;
  let d = [];
  for (let i = 1; i < out.length; i++) d.push(Math.abs(out[i] - out[i - 1]));
  d.sort((a, b) => a - b);
  const typical = d[Math.floor(d.length * 0.99)], wrap = Math.abs(out[0] - out[out.length - 1]);
  ok(wrap / typical < 3, `tool: loop wrap step is a normal step (ratio ${(wrap / typical).toFixed(2)})`);
  ok(prep.loopBlend(new Float32Array(44100)).out.length === 44100 - 22050, 'tool: loop output is the source less the blend');
  // partial re-run: only splat is rewritten, the others stay in the manifest
  fs.unlinkSync(path.join(src, 'splat_2.mp3'));
  prep.prepare({ src, dst, only: ['splat'] });
  const m2 = JSON.parse(fs.readFileSync(path.join(dst, 'manifest.json'), 'utf8'));
  ok(m2.cues.hit_blade && m2.beds.street, 'tool: a partial run keeps the other entries');
  ok(m2.cues.splat.length === 2, 'tool: a partial run keeps the take whose source is gone but whose file is ready');
  // provenance: refuses without the licence flag, writes rows with it (into a temp CSV)
  const csv = path.join(tmp, 'PROVENANCE.csv');
  fs.writeFileSync(csv, 'asset,tool,model_version,prompt_id,date,license_notes,human_edits\n');
  const prov = path.join(ROOT, 'tools', 'sfx-provenance.js');
  const refuse = spawnSync('node', [prov, '--tool=x', '--plan=y', '--manifest=' + path.join(dst, 'manifest.json'), '--csv=' + csv]);
  ok(refuse.status === 1, 'provenance: refuses without --commercial-ok');
  const write = spawnSync('node', [prov, '--tool=ExampleTool', '--plan=Pro', '--commercial-ok', '--manifest=' + path.join(dst, 'manifest.json'), '--csv=' + csv, '--date=2026-11-13']);
  ok(write.status === 0, 'provenance: runs with the flags');
  const rows = fs.readFileSync(csv, 'utf8').trim().split('\n');
  ok(rows.length === 1 + Object.values(m2.cues).reduce((s, l) => s + l.length, 0) + Object.keys(m2.beds).length, `provenance: one row per file (${rows.length - 1})`);
  ok(rows.some(r => /ready\/splat_2\.mp3/.test(r) && /commercial/.test(r)), 'provenance: row names the file and the licence note');
  const again = spawnSync('node', [prov, '--tool=ExampleTool', '--plan=Pro', '--commercial-ok', '--manifest=' + path.join(dst, 'manifest.json'), '--csv=' + csv]);
  ok(fs.readFileSync(csv, 'utf8').trim().split('\n').length === rows.length, 'provenance: a second run adds nothing');
  fs.rmSync(tmp, { recursive: true, force: true });
}

(async function main() {
  try {
    await runtimeTests();
    if (!quick) await toolTests(); else warn('--quick: tool tests skipped');
    // Wiring: the page loads the loader after sfx.js
    const html = read('index.html');
    ok(/sfx\.js"><\/script>\s*\n<script src="js\/view\/sfx-gen\.js"><\/script>/.test(html), 'index.html loads sfx-gen.js right after sfx.js');
    ok(/gen\.jitter/.test(read('js/view/sfx.js')), 'sfx.js applies the generated-file jitter');
    // Ids: the bank exposes 95 file ids (90 cues + 5 beds)
    ok(VALID.length === 95, `file ids: 90 cues (hit split into kinds, speech excluded) and 5 beds (got ${VALID.length})`);
  } catch (e) {
    fails++; console.log('FAIL exception: ' + (e && e.stack || e));
  }
  console.log(fails ? fails + ' failure(s), ' + warns + ' warning(s)' : `test-sfx-gen: all pass${warns ? ' (' + warns + ' warning(s))' : ''}`);
  process.exit(fails ? 1 : 0);
})();
