"""All30 pacing from retained earned numerical outcomes; no claim of human enjoyment."""
from pathlib import Path
import json
import statistics

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'reviews/telemetry/audit12-implementation'
SOURCE = json.loads((ROOT / 'reviews/telemetry/first30-reset/audit12-integrated14.json').read_text())['runtime_manifest_sha256']
rows = []
for file in sorted(OUT.glob('distinct14-*.jsonl')):
    for line in file.read_text().splitlines():
        row = json.loads(line)
        if row.get('kind') == 'earnedCampaign' and row.get('result') == 'win':
            rows.append(dict(row, sourceFile=file.name))
assert len(rows) == 360


def stats(values):
    values = sorted(values)
    return dict(n=len(values), min=round(values[0], 2),
                median=round(statistics.median(values), 2), max=round(values[-1], 2))


levels = []
for level in range(1, 31):
    raw = []
    for row in (r for r in rows if r['level'] == level):
        trace = row['experienceTrace']
        beats = trace.get('beats', [])
        boss = [e for e in beats if e.get('type') == 'bossDie']
        opened = [e for e in beats if e.get('type') == 'routeBeat' and str(e.get('phase', '')).endswith('_open')]
        event = (boss or opened)[-1] if boss or opened else None
        raw.append(dict(file=row['sourceFile'], attempt=row['attempt'], seed=row['seed'],
                        time=row['time'], movement=trace['move'],
                        nearbyEnemyProxy=trace['combat'], noNearbyEnemyProxy=trace['quiet'],
                        decision=row.get('worldDecision'), routeEvents=beats,
                        decisiveType=event.get('type') if event else None,
                        decisiveToWin=row['time']-event['t'] if event else None,
                        evolutions=trace.get('evolvedTargets')))
    assert len(raw) == 12
    decisive = [r['decisiveToWin'] for r in raw if r['decisiveToWin'] is not None]
    levels.append(dict(level=level, duration=stats([r['time'] for r in raw]),
                       noNearbyEnemyProxy=stats([r['noNearbyEnemyProxy'] for r in raw]),
                       decisiveToWin=stats(decisive) if decisive else None, raw=raw))
report = dict(source=SOURCE, method='Twelve fresh final14 earned numerical campaigns, all360 winning level records including retries. '
              'Pacing medians use statistics.median. Protected reading excluded. No-nearby-enemy is a controller distance proxy, not '
              'visible threat or boredom. Last bossDie/required opening is not always the end of combat. Bots do not prove enjoyment.', levels=levels)
(OUT / 'integrated14-all30-pacing.json').write_text(json.dumps(report, indent=2)+'\n')
text = '# Audit12 all30 pacing inspection\n\nSource integrated14, all360 winning level records in twelve fresh earned campaigns. '
text += 'Read with [raw records/method](telemetry/audit12-implementation/integrated14-all30-pacing.json) and [physical coverage](AUDIT12-COVERAGE-2026-11-20.md). '
text += 'These are simulation durations, excluding protected reading, with standard median; they do not prove enjoyment or absence of repetition.\n\n'
text += '| L | Duration median (range),s | No nearby enemy proxy median,s | Last boss defeat/required opening to win median (range),s |\n|---:|---:|---:|---:|\n'


def label(value):
    return f"{value['median']:.1f} ({value['min']:.1f}–{value['max']:.1f})" if value else 'no event'


for row in levels:
    text += f"| {row['level']} | {label(row['duration'])} | {row['noNearbyEnemyProxy']['median']:.1f} | {label(row['decisiveToWin'])} |\n"
old = (OUT / 'source12-before14/AUDIT12-PACING-2026-11-20.md').read_text()
text += '\n'+old[old.index('The last column must not'):]
text += '\n\nFinal14 extends the L26 service-car breathing space through8m beyond its real aperture. Existing enemies and finite actors remain live; '
text += 'new recurring route/ambient/surge arrivals pause, then ordinary pressure resumes. Actual before12/speech-only13/physical14 samples observe0 kills '
text += 'before the new car opening versus96/100 previously; first frenzy follows opening. This is a real local pacing correction, not proof of emotional acceptance. '
text += '[Actual comparison](media/R1/audit12-implementation/integrated14-relief-review/index.json). Original12 distributions remain archived unchanged.\n'
(ROOT / 'reviews/AUDIT12-PACING-2026-11-20.md').write_text(text)
print('Summarized360 final14 wins across all30 levels')
