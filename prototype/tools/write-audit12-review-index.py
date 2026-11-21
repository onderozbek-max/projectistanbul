"""Index original-time evidence. Never labels captured motion as watched/accepted."""
from pathlib import Path
import json
import html

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'reviews/media/R1/audit12-implementation'
MANIFEST = json.loads((ROOT / 'reviews/telemetry/first30-reset/audit12-integrated14.json').read_text())
CURRENT = 'integrated12-earned-walk'
chapters = []


def read(folder, index='index.json'):
    return json.loads((OUT / folder / index).read_text())


def clip(title, folder, row, start=0, length=15, note=''):
    file = row.get('file', row.get('id', '') + '.mp4')
    if not file or not (OUT / folder / file).is_file():
        raise ValueError((folder, file))
    duration = row['seconds']
    start = max(0, min(start, duration - .1))
    end = min(duration, start + length)
    source = row.get('sourceManifest', row.get('source'))
    if isinstance(source, dict):
        source = source.get('runtime_manifest_sha256', source.get('source'))
    chapters.append(dict(title=title, file=folder + '/' + file, start=start,
                         end=end, source=source,
                         note=note, motionAccepted=False, audioAccepted=False))


def earned(folder, title, level=1):
    rows = read(folder)['records']
    row = next(r for r in rows if r['level'] == level and r['outcome'] == 'won')
    detail = read(folder, row['id'] + '.json')
    events = detail['facts']['events']
    samples = detail['facts']['samples']
    aftermath = [s for s in samples if str(s.get('scene', '')).startswith('E10-')]
    if level in [20, 25, 30] and aftermath:
        sample = aftermath[0]
    else:
        event = next((e for e in events if e['type'] == ('kaanSupport' if level == 21 else 'bossWindup')), None)
        if level == 23:
            event = next((e for e in events if e.get('phase') == 'kaan_covered_by_arda'), None)
            event = event or next((e for e in events if e.get('phase') == 'marketSacks_pickup'), None)
        target = event['t'] - 1 if event else max(0, detail['facts']['t'] - 25)
        sample = min(samples, key=lambda s: abs(s['t'] - target))
    start = sample['wall'] - detail['viewportStart']
    clip(title, folder, dict(detail, file=row['file']), start, 22,
         'Earned browser play through actual public inputs and offered choices. ' +
         ('Declared genuine pre26 history copy followed by ordinary26–30 play; not an unbroken fresh14 campaign. '
          if folder == 'integrated14-earned-suffix26-30' else '') +
         'Not a human/phone test. Final run weapons (not necessarily the opening-frame ranks): ' + str(detail['facts']['weapons']))
    if level in [20, 25, 30] and aftermath:
        last = aftermath[-1]['wall'] - detail['viewportStart']
        clip(title + ' — departure and control', folder, dict(detail, file=row['file']),
             max(start, last - 2), 10,
             'Separate original-time window at the end of the protected sequence and subsequent handback. '
             'The first frame can still be a native page. Full film retains all reading; no speedup.')


earned('integrated7-before-earned-L1', '1. Before: earned first Cook encounter')
fresh = read(CURRENT)['records'] if (OUT / CURRENT / 'index.json').exists() else []
if any(r['level'] == 1 and r['outcome'] == 'won' for r in fresh):
    earned(CURRENT, '2. Candidate12: earned Cook response and punish')
else:
    earned('integrated10-earned-walk', '2. Earlier10: earned Cook response and punish')
boss = next(r for r in read('integrated7-bosses', 'index-bosses.json') if r['id'] == 'boss-L4')
clip('3. Linekeeper: another early boss', 'integrated7-bosses', boss, 1, 18,
     'Source7 real AI; supplied invulnerable/no-weapon observer and later phase/lethal hits. '
     'Body/tool code unchanged in12; not earned difficulty proof.')
coop = 'integrated12-cooperation' if (OUT / 'integrated12-cooperation/index.json').exists() else 'integrated10-cooperation'
for folder, title in [('integrated10-cart-counter', '4. Bride: bait, sidestep, real cart counter'),
                      (coop, '6. Kaan: interrupted work, actual help, resumed loading')]:
    row = read(folder)
    row = row[0] if isinstance(row, list) else row
    file = next((OUT / folder).glob('*.mp4')).name
    clip(title, folder, dict(row, file=file), 0, 18,
         'Disclosed supplied setup on the recorded actual source. Actual movement, contact and consequence; '
         'no forced counter/help result. Read original index for all supplied conditions.')
for level, title in [(20, '5. Recognition'), (25, '7. Captain aftermath'), (30, '8. Station climax')]:
    for folder, label in [('before10-major-scenes', 'Before'), ('integrated10-major-scenes', 'Candidate10')]:
        row = next(r for r in read(folder) if r['level'] == level)
        clip(title + ' — ' + label, folder, row, 2, min(28, row['seconds'] - 2),
             'Matched scene-entry/lethal fixture, not earned fight. Native prose unchanged. '
             'Protected approach/reading/departure timing is real; full clip available via controls.')
for weapon in ['knife', 'chain', 'chainsaw']:
    for folder, label in [('before10-priority-arsenal', 'Before'), ('after9-priority-arsenal', 'After9, applicable to12')]:
        row = next(r for r in read(folder, 'index-arsenal.json') if r['id'] == 'weapon-' + weapon + '-r5')
        clip('9. ' + weapon + ' rank5 — ' + label, folder, row, 0, 15,
             'Matched supplied rank5/crowd/adversarial movement. Not earned mastery. '
             'Later boss-death and Canister changes do not change these ordinary Knife/Chain/Saw targets.')

for rank in [1, 3, 5]:
    for folder, label in [('before11-canister', 'Before11'), ('integrated12-canister', 'Candidate12')]:
        index = OUT / folder / 'index-arsenal.json'
        if index.exists():
            row = next(r for r in read(folder, 'index-arsenal.json') if r['id'] == 'weapon-canister-r' + str(rank))
            clip('Canister rank' + str(rank) + ' — ' + label, folder, row, 0, 8,
                 'Matched supplied rank/targets/input. Candidate12 uses fixed global cooldown1.8s, '
                 'flight0.5s and rank1–2 radius1.8m; damage unchanged. No earned-power claim.')

for level, title in [(20, 'Earned recognition and joined departure'), (21, '10. Earned first joined passage'), (23, '11. Earned sack cooperation'),
                     (25, '12. Earned Captain and grief'), (30, '13. Earned station conclusion')]:
    if (OUT / CURRENT / 'index.json').exists():
        rows = read(CURRENT)['records']
        if any(r['level'] == level and r['outcome'] == 'won' for r in rows):
            earned(CURRENT, title, level)

departure = OUT / 'integrated13-departure-review/index.json'
if departure.exists():
    for row in json.loads(departure.read_text())['records']:
        folder = row['film'].split('/')[-2]
        original = read(folder, 'L26-attempt0.json')
        clip('14. Quiet26 departure — ' + row['label'], folder,
             dict(original, file='L26-attempt0.mp4'), row['start'], 18,
             row['method'] + ' Source13 is view-only; required context, upgrades and actual threat/injury cues remain.')

relief = OUT / 'integrated14-relief-review/index.json'
if relief.exists():
    for row in json.loads(relief.read_text())['records']:
        folder = row['film'].split('/')[-2]
        original = read(folder, 'L26-attempt0.json')
        clip('15. Service-car breathing space — ' + row['label'], folder,
             dict(original, file='L26-attempt0.mp4'), row['times'][2]['wall'], 18,
             row['method'] + ' Actual kills before car opening: ' + str(row['killsBeforeCarOpen']) +
             '. Source14 changes recurring arrivals through8m beyond the aperture, keeps existing threats and later combat.')
if (OUT / 'integrated14-earned-suffix26-30/index.json').exists():
    earned('integrated14-earned-suffix26-30', '16. Final14 earned-history station ending and departure', 30)

(OUT / 'review-index.json').write_text(json.dumps(dict(
    candidate=MANIFEST['runtime_manifest_sha256'],
    method='Original wall-time media excerpts; no speedup, interpolation, dubbed audio or fabricated input. '
           'HTML seeks within retained complete films. Before/after L1 use different lawful earned builds; '
           'they are not identical-DPS comparisons. Screenshots were sampled; continuous motion/audio were not perceived.',
    chapters=chapters), indent=2) + '\n')

cards = []
for i, c in enumerate(chapters):
    src = html.escape(c['file'])
    cards.append('<article id="c' + str(i) + '"><h2>' + html.escape(c['title']) + '</h2>'
                 '<p>' + html.escape(c['note']) + '</p><p class="source">Actual source: '
                 + html.escape(str(c['source'])) + '</p><video controls preload="none" playsinline '
                 'data-start="' + str(c['start']) + '" data-end="' + str(c['end']) + '" '
                 'src="' + src + '#t=' + str(c['start']) + ',' + str(c['end']) + '"></video>'
                 '<p>Original excerpt ' + str(round(c['start'], 2)) + '–' + str(round(c['end'], 2))
                 + ' seconds. <a href="' + src + '">Open complete retained film</a></p></article>')
page = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Project Istanbul — Audit12 evidence review</title><style>
body{margin:24px auto;max-width:1100px;padding:0 18px;background:#171923;color:#f5eedf;font:17px/1.5 system-ui}
h1{font-size:28px}h2{font-size:21px}a{color:#8ed8ff}article{border-top:1px solid #626373;padding:20px 0}
video{display:block;max-width:100%;max-height:650px;background:#000}.source{font:12px monospace;overflow-wrap:anywhere}
.warning{padding:18px;background:#392e20;border:1px solid #b99557}nav{display:flex;gap:14px;flex-wrap:wrap}
</style><h1>Audit12 — short indexed review</h1><p class="warning">Captured original-time evidence, not artistic acceptance.
The implementation agent sampled stills and machine outcomes; it did not perceive continuous video or listen.
The full-viewport recording cadence is sampled and is not a 60fps claim. Each film keeps its actual source and fixture/earned status.
Use native canvas companion files where available to assess motion; inspect the live candidate on a physical phone separately.</p>
<p><a href="http://127.0.0.1:8828/?lang=en">Play candidate14 on this Mac</a> ·
<a href="review-index.json">Exact excerpt/source index</a> ·
<a href="../../../AUDIT12-ACCEPTANCE-2026-11-20.md">Pending acceptance scripts</a></p><nav>'''
page += ''.join('<a href="#c' + str(i) + '">' + html.escape(c['title']) + '</a>' for i, c in enumerate(chapters))
page += '</nav>' + ''.join(cards)
page += '''<script>document.querySelectorAll('video').forEach(v=>{
v.addEventListener('loadedmetadata',()=>{v.currentTime=+v.dataset.start});
v.addEventListener('play',()=>document.querySelectorAll('video').forEach(w=>{if(w!==v)w.pause()}));
v.addEventListener('timeupdate',()=>{if(v.currentTime>+v.dataset.end&&!v.seeking)v.pause()});
});</script></html>'''
(OUT / 'review.html').write_text(page)
print(str(OUT / 'review.html'), len(chapters), 'indexed excerpts')
