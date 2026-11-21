// Summarize exported local game events. Usage: node prototype/tools/playtest-report.js export1.jsonl export2.jsonl
'use strict';
const fs = require('node:fs');

function readExports(paths) {
  const seen = new Set(), events = [];
  let missing = 0, duplicates = 0;
  for (const path of paths) {
    for (const line of fs.readFileSync(path, 'utf8').split(/\r?\n/)) {
      if (!line.trim()) continue;
      let event;
      try { event = JSON.parse(line); } catch { missing++; continue; }
      if (!event || typeof event.event !== 'string') { missing++; continue; }
      const id = typeof event.event_id === 'string' ? event.event_id : JSON.stringify(event);
      if (seen.has(id)) { duplicates++; continue; }
      seen.add(id);
      events.push(event);
    }
  }
  events.sort((a, b) => Date.parse(a.ts || '') - Date.parse(b.ts || ''));
  return { events, missing, duplicates };
}

function group(rows, keyOf) {
  const grouped = new Map();
  for (const row of rows) {
    const key = keyOf(row);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }
  return grouped;
}

function breakdown(runs) {
  const results = Object.fromEntries(['win', 'lose', 'quit', 'restart', 'interrupted', 'unknown'].map(outcome => [outcome, 0]));
  for (const run of runs) results[run.result]++;
  return results;
}

function runSummary(events) {
  const start = events.find(event => event.event === 'level_start');
  if (!start) return null;
  const end = events.find(event => event.event === 'level_end');
  const left = events.some(event => event.event === 'run_interrupted');
  const result = end && ['win', 'lose', 'quit', 'restart'].includes(end.result) ? end.result : left ? 'interrupted' : 'unknown';
  return { start, end, result, events };
}

function median(seconds) {
  if (!seconds.length) return '—';
  seconds.sort((a, b) => a - b);
  const mid = Math.floor(seconds.length / 2);
  return `${(seconds.length % 2 ? seconds[mid] : (seconds[mid - 1] + seconds[mid]) / 2).toFixed(1)}s (${seconds.length})`;
}

function screenTimes(runs, open, close) {
  const durations = [];
  for (const run of runs) {
    let started = null;
    for (const event of run.events) {
      if (event.event === open && started === null) started = Date.parse(event.ts);
      if (event.event === close && started !== null) {
        const elapsed = (Date.parse(event.ts) - started) / 1000;
        if (elapsed >= 0 && Number.isFinite(elapsed)) durations.push(elapsed);
        started = null;
      }
    }
  }
  return durations;
}

function cardStats(runs) {
  const cards = new Map();
  for (const run of runs) {
    for (const event of run.events) {
      if (event.event !== 'card_offered' && event.event !== 'card_chosen') continue;
      const ids = event.event === 'card_offered' && Array.isArray(event.cards) ? [...new Set(event.cards)] : [event.chosen];
      for (const id of ids) {
        if (typeof id !== 'string') continue;
        if (!cards.has(id)) cards.set(id, { offers: 0, picks: 0 });
        cards.get(id)[event.event === 'card_offered' ? 'offers' : 'picks']++;
      }
    }
  }
  return [...cards].sort((a, b) => b[1].offers - a[1].offers || a[0].localeCompare(b[0]));
}

function returningAfterFirstWin(runs, level) {
  const normal = runs.filter(run => (run.start.mode || 'normal') === 'normal' && run.start.install_id);
  const installs = group(normal, run => run.start.install_id);
  let firstWins = 0, following = 0, onward = 0;
  for (const list of installs.values()) {
    const index = list.findIndex(run => run.start.level === level && run.result === 'win');
    if (index < 0) continue;
    firstWins++;
    const sameSession = list.slice(index + 1).filter(next => next.start.session_id === list[index].start.session_id);
    if (sameSession.length) following++;
    if (sameSession.some(next => next.start.level === level + 1)) onward++;
  }
  return { following, firstWins, onward };
}

function writeBuild(build, runs) {
  console.log(`\n## Build ${build}`);
  const openings = group(runs.filter(run => run.start.level === 1 && (run.start.mode || 'normal') === 'normal' && run.start.install_id),
    run => run.start.install_id);
  const firstSeen = [...openings.values()].map(list => list[0]);
  const hasEvent = (run, name) => run.events.some(event => event.event === name);
  const moved = firstSeen.filter(run => hasEvent(run, 'first_move')).length;
  const card = firstSeen.filter(run => hasEvent(run, 'card_chosen')).length;
  const cleared = firstSeen.filter(run => run.result === 'win').length;
  const choiceTimes = firstSeen.map(run => run.events.find(event => event.event === 'card_chosen')?.t_s).filter(Number.isFinite);
  console.log(`\nFirst recorded L1 attempts: ${firstSeen.length} installs, ${moved} moved, ${card} chose a card, ${cleared} cleared.`);
  for (const level of [1, 5]) {
    const next = returningAfterFirstWin(runs, level);
    if (!next.firstWins) continue;
    console.log(`After a first recorded L${level} clear: ${next.following}/${next.firstWins} started another Normal run that session, including ${next.onward} who started L${level + 1}.`);
  }
  console.log(`Median active play time to first L1 pick: ${median(choiceTimes)}.`);
  const choices = screenTimes(runs, 'card_offered', 'card_chosen'), chests = screenTimes(runs, 'chest_shown', 'chest_opened');
  if (choices.length || chests.length) console.log(`Median time in completed prompts: cards ${median(choices)}, crates ${median(chests)}.`);

  console.log('\n| Level | Mode | Started | Won | Lost | Quit | Restarted | Page left | End unknown |');
  console.log('|---|---|---:|---:|---:|---:|---:|---:|---:|');
  for (const [label, list] of group(runs, run => `${run.start.level_id || run.start.level} | ${run.start.mode || 'normal'}`)) {
    const r = breakdown(list);
    console.log(`| ${label} | ${list.length} | ${r.win} | ${r.lose} | ${r.quit} | ${r.restart} | ${r.interrupted} | ${r.unknown} |`);
  }
  const sampled = runs.filter(run => run.events.some(event => event.event === 'perf_sample' && Number.isFinite(event.hp_pct)));
  for (const [level, list] of group(sampled, run => run.start.level_id || run.start.level)) {
    const low = list.filter(run => run.events.some(event => event.event === 'perf_sample' && event.low_hp));
    console.log(`- ${level}: low health appeared in ${low.length}/${list.length} sampled runs.`);
  }

  const endings = runs.filter(run => run.result === 'lose' || run.result === 'quit');
  const segments = group(endings, run => {
    const stages = run.events.filter(event => event.event === 'segment_reached');
    return `${run.start.level_id || run.start.level} / ${stages[stages.length - 1]?.segment_id || 'unrecorded'}`;
  });
  for (const [label, list] of segments) {
    const r = breakdown(list);
    console.log(`- ${label}: ${r.lose} lost, ${r.quit} quit.`);
  }
  const deaths = runs.flatMap(run => run.events.filter(event => event.event === 'death'));
  const causes = [...group(deaths, event => event.cause_id || 'unrecorded')].sort((a, b) => b[1].length - a[1].length);
  if (causes.length) console.log(`\nRecorded death causes: ${causes.map(([id, list]) => `${id} (${list.length})`).join(', ')}.`);
  const objectives = runs.flatMap(run => run.events.filter(event => event.event === 'objective'));
  if (objectives.length) {
    console.log('\n| Level | Objective | Started | Done | Missed |');
    console.log('|---|---|---:|---:|---:|');
    for (const [id, list] of group(objectives, event => `${event.level_id || event.level} | ${event.objective_id || 'unrecorded'}`)) {
      const counts = ['start', 'done', 'missed'].map(action => list.filter(event => event.action === action).length);
      console.log(`| ${id} | ${counts.join(' | ')} |`);
    }
  }
  const links = runs.flatMap(run => run.events.filter(event => event.objective_terminal));
  if (links.length) {
    console.log('\n| Level | Link starts | Full resets | Completed |');
    console.log('|---|---:|---:|---:|');
    for (const [level, list] of group(links, event => event.level_id || event.level)) {
      const counts = ['hack_start', 'hack_reset', 'hack_done'].map(name => list.filter(event => event.event === name && !event.kept).length);
      console.log(`| ${level} | ${counts.join(' | ')} |`);
    }
  }
  const cards = cardStats(runs);
  if (cards.length) {
    console.log('\n| Card | Offered | Picked |');
    console.log('|---|---:|---:|');
    for (const [id, { offers, picks }] of cards) console.log(`| ${id} | ${offers} | ${picks} |`);
  }
}

function writeBenchmarks(results) {
  const plotted = results.filter(event => typeof event.scene === 'string');
  if (!plotted.length) return;
  console.log('\n## Scripted performance');
  console.log('Frame intervals describe how often the screen updated. Each row is one recorded scene.');
  console.log('\n| Capture | Build | Art | Scene | Frame p50 / p95 (ms) | At enemy cap p95 (ms) | Enemies drawn / cap | Estimated graphics (MiB) | Music |');
  console.log('|---:|---|---|---|---:|---:|---:|---:|---|');
  const number = n => Number.isFinite(n) ? n : '—';
  let capture = 0;
  for (const list of group(plotted, event => event.session_id || event.bench_id || 'unlabelled').values()) {
    capture++;
    for (const event of list) {
      const samples = Array.isArray(event.audio) ? event.audio : [];
      const overlap = samples.some(sample => Array.isArray(sample.audible) && sample.audible.length > 1);
      const expected = event.scene === 'boss' ? 'boss' : 'run_calm';
      const active = samples.some(sample => Array.isArray(sample.audible) ? sample.audible.includes(expected) :
        sample.track === expected && sample.playing === true);
      const audio = overlap ? 'Tracks overlapped' : active ? 'Expected track reported' : samples.length ? 'Expected track unconfirmed' : 'No sample';
      const graphics = event.memory?.estimated_graphics_peak_bytes;
      const mib = Number.isFinite(graphics) ? (graphics / (1024 * 1024)).toFixed(1) : '—';
      console.log(`| ${capture} | ${event.build || 'unlabelled'} | ${event.art || '—'} | ${event.scene} | ${number(event.frame_ms?.p50)} / ${number(event.frame_ms?.p95)} | ${number(event.cap_frame_ms?.p95)} | ${number(event.peak_enemies_drawn)} / ${number(event.enemy_cap)} | ${mib} | ${audio} |`);
    }
  }
}

function report({ events, duplicates, missing }) {
  const scripted = events.filter(event => event.event === 'bench_result');
  const gameplay = events.filter(event => !event.event.startsWith('bench_'));
  const recordedRuns = [...group(gameplay.filter(event => event.run_id), event => event.run_id).values()].map(runSummary).filter(Boolean);
  const runs = recordedRuns.filter(run => !run.start.route_trial);
  console.log('# Istanbul playtest report');
  console.log(`\nRead ${events.length} unique records. Skipped ${duplicates} duplicates and ${missing} unreadable records.`);
  console.log(`Scripted benchmarks are separate: ${scripted.length} scene results.`);
  const music = gameplay.filter(event => event.event === 'music_state' && Array.isArray(event.audible));
  if (music.length) console.log(`Browser music transitions: ${music.length} recorded, ${music.filter(event => event.audible.length > 1).length} with more than one track active.`);
  console.log(`Analyzable ordinary runs: ${runs.length}. Older or partial exports without an identifiable start cannot be assigned a run outcome.`);
  if (runs.length) {
    console.log('An unknown end can mean an interruption or an export captured mid-run. Counts describe the files provided.');
    for (const [build, list] of group(runs, run => run.start.build || 'unlabelled')) writeBuild(build, list);
  }
  const trials = recordedRuns.filter(run => run.start.route_trial);
  if (trials.length) {
    console.log('\n## Route trials');
    for (const [trial, list] of group(trials, run => {
      const name = run.start.route_trial === true ? 'tram-crossing' : run.start.route_trial;
      return run.start.route_trial_revision ? `${name} (revision ${run.start.route_trial_revision})` : name;
    })) {
      const outcomes = breakdown(list);
      const completed = list.filter(run => run.events.some(e => e.event === 'objective' && e.action === 'done')).length;
      console.log(`- ${trial}: ${list.length} runs, ${outcomes.win} clears, ${completed} bonus objectives completed.`);
      const beatCount = phase => list.filter(run => run.events.some(e => e.event === 'route_beat' && e.phase === phase)).length;
      const frenzy = beatCount('frenzy_start'), boss = beatCount('final_boss');
      if (frenzy || boss) console.log(`  Horde frenzy: ${frenzy}. Entered the final boss fight: ${boss}.`);
    }
  }
  writeBenchmarks(scripted);
}

if (require.main === module) {
  const paths = process.argv.slice(2);
  if (!paths.length) { console.error('Usage: node prototype/tools/playtest-report.js export1.jsonl [export2.jsonl …]'); process.exitCode = 1; }
  else {
    try { report(readExports(paths)); }
    catch (err) { console.error(err.message); process.exitCode = 1; }
  }
}
