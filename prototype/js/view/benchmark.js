// The phone test runs 60 measured seconds per scene after a short warm-up.
// Cadence includes rendering and browser/compositor delays. Work time measures the JS frame body.
P.Bench = (function () {
  var B = {}, S = P.BenchScenes, C = S.config, art, id, index, sample, runScene, stopScene, panel, status, countdown, download;
  var $ = function (id) { return document.getElementById(id); };

  function select(i) {
    index = i;
    sample = { started: null, frame: [], work: [], capFrame: [], capWork: [], tiers: [0, 0, 0],
      peak: 0, drawn: 0, heap: null, graphics: 0, audio: [], second: -1 };
    runScene(C.scenes[i], C.seed);
  }

  function log(event, fields) {
    P.Tel.log(event, Object.assign({ bench_id: id, bench_version: 1, art: art }, fields));
  }

  function show(key) {
    sample = null;
    stopScene();
    countdown.classList.add('hidden');
    panel.classList.remove('hidden');
    status.textContent = P.t(key);
    download.classList.remove('hidden');
    download.focus();
  }

  B.mount = function (start, scene, stop) {
    art = P.ArtRaster.enabled() ? 'raster' : 'current';
    runScene = scene;
    stopScene = stop;
    panel = $('bench-panel'); status = $('bench-message'); countdown = $('bench-countdown'); download = $('bench-export');
    $('bench-art').textContent = P.t(art === 'raster' ? 'bench.new' : 'bench.current');
    status.textContent = P.t('bench.intro');
    $('bench-start').addEventListener('click', start);
    download.addEventListener('click', function () { P.Tel.exportJsonl('bench_'); });
    download.classList.toggle('hidden', !P.Tel.hasPrefix('bench_result'));
    panel.classList.remove('hidden');
  };

  B.start = function () {
    if (sample) return;
    id = art + '-' + Date.now().toString(36);
    panel.classList.add('hidden');
    countdown.classList.remove('hidden');
    select(0);
  };
  B.scene = function () { return C.scenes[index]; };
  B.interrupt = function (reason) {
    if (!sample) return;
    log('bench_interrupted', { reason: reason, scene: B.scene().id, frames: sample.frame.length });
    show('bench.interrupted');
  };

  function snapshot() {
    var canvas = P.Render.canvas, heap = performance.memory, audio = P.Sfx.audioStatus();
    var music = P.Music && P.Music.current(), playing = !!(P.Music && P.Music.playing());
    var audible = P.Music ? P.Music.audibleTracks() : [];
    var last = sample.audio[sample.audio.length - 1];
    if (!last || last.status !== audio || last.track !== music || last.playing !== playing || last.audible.join() !== audible.join()) {
      sample.audio.push({ status: audio, track: music, playing: playing, audible: audible });
    }
    if (heap && Number.isFinite(heap.usedJSHeapSize)) sample.heap = Math.max(sample.heap || 0, heap.usedJSHeapSize);
    var graphics = canvas.width * canvas.height * 4 + P.ArtRaster.estimatedBytes() + P.ArtRig.cacheBytes();
    sample.graphics = Math.max(sample.graphics, graphics);
  }

  function stats(values) {
    values.sort(function (a, b) { return a - b; });
    function at(frac) { return values.length ? +values[Math.ceil(values.length * frac) - 1].toFixed(3) : null; }
    return { count: values.length, p50: at(0.5), p95: at(0.95) };
  }

  function finish(s, elapsed) {
    log('bench_result', { scene: B.scene().id, level_id: s.levelInfo.id, elapsed_ms: Math.round(elapsed - C.warmupMs),
      sim_s: +s.runT.toFixed(2), boss_spawned: !!(s.gen && s.gen.bossSpawned), frame_ms: stats(sample.frame),
      work_ms: stats(sample.work), cap_frame_ms: stats(sample.capFrame), cap_work_ms: stats(sample.capWork),
      enemy_cap: S.cap, peak_enemies: sample.peak, peak_enemies_drawn: sample.drawn, quality_frames: sample.tiers,
      canvas_px: [P.Render.canvas.width, P.Render.canvas.height], audio: sample.audio, raster: P.ArtRaster.status(),
      memory: { page_bytes: null, js_heap_peak_bytes: sample.heap, estimated_graphics_peak_bytes: sample.graphics }
    });
    if (index + 1 < C.scenes.length) select(index + 1);
    else show('bench.done');
  }

  B.observe = function (ts, gap, work, s, drawn) {
    if (!sample) return;
    if (sample.started === null) sample.started = ts;
    var elapsed = ts - sample.started, left = Math.ceil((C.durationMs + C.warmupMs - elapsed) / 1000);
    if (sample.second !== left) {
      sample.second = left;
      countdown.textContent = P.t('bench.progress', { n: index + 1, total: C.scenes.length,
        scene: P.t('bench.' + B.scene().id), s: Math.max(0, left) });
      snapshot();
    }
    if (elapsed <= C.warmupMs) return;
    var enemies = s.enemies.length;
    sample.frame.push(gap); sample.work.push(work);
    sample.peak = Math.max(sample.peak, enemies); sample.drawn = Math.max(sample.drawn, drawn);
    sample.tiers[P.Quality.tier]++;
    if (enemies >= S.cap) { sample.capFrame.push(gap); sample.capWork.push(work); }
    if (elapsed >= C.durationMs + C.warmupMs) finish(s, elapsed);
  };
  return B;
})();
