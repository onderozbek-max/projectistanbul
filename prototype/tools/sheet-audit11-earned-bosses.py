"""Sparse actual final9 earned encounter/reward states, never continuous craft approval."""
from pathlib import Path
from PIL import Image, ImageDraw
import json, subprocess
root = Path(__file__).resolve().parents[2]
folder = root / 'reviews/media/R1/audit11-implementation/candidate9-earned-journey'
out = folder / 'frame-review'
index = json.loads((folder / 'index.json').read_text())
rows = []
for level in [1, 2, 3, 4, 5, 10, 15, 20, 25, 30]:
    run = next(r for r in reversed(index['records']) if r['level'] == level and r['outcome'] == 'won')
    detail = json.loads((folder / (run['id'] + '.json')).read_text())
    events, samples = detail['facts']['events'], detail['facts']['samples']
    intro = next(e for e in events if e['type'] == 'bossIntro')
    death = next(e for e in events if e['type'] == 'bossDie')
    first = min(samples, key=lambda s: abs(s['t'] - intro['t']))
    end = min(samples, key=lambda s: abs(s['t'] - death['t']))
    times = [('entrance', first['wall'] - detail['viewportStart']),
             ('first-live', first['wall'] - detail['viewportStart'] + 1.8),
             ('encounter', (first['wall'] + end['wall']) / 2 - detail['viewportStart']),
             ('defeat', end['wall'] - detail['viewportStart'] + .3),
             ('aftermath', end['wall'] - detail['viewportStart'] + 2.6),
             ('handback', end['wall'] - detail['viewportStart'] + 7)]
    pic = Image.new('RGB', (1200, 1300), '#161a23')
    draw = ImageDraw.Draw(pic)
    for i, (label, second) in enumerate(times):
        second = max(.01, min(detail['seconds'] - .15, second))
        path = out / (run['id'] + '-boss-' + label + '.jpg')
        subprocess.run(['ffmpeg', '-v', 'error', '-threads', '1', '-ss', str(second),
                        '-i', str(folder / run['file']), '-frames:v', '1', '-q:v', '3', '-y', str(path)], check=True)
        im = Image.open(path).convert('RGB'); im.thumbnail((300, 625))
        pic.paste(im, (i % 4 * 300, i // 4 * 650 + 25))
        draw.text((i % 4 * 300 + 4, i // 4 * 650 + 4), 'L' + str(level) + ' ' + label, fill='white')
        rows.append({'level': level, 'id': run['id'], 'label': label, 'movieSecond': second,
                     'source': detail['sourceManifest'], 'intro': intro, 'death': death,
                     'file': str(path.relative_to(root)), 'fixture': False})
    for i, suffix in enumerate(['-results.png', '-after-chest.png']):
        path = folder / (run['id'] + suffix)
        if not path.exists(): continue
        im = Image.open(path).convert('RGB'); im.thumbnail((300, 625))
        pic.paste(im, ((i + 2) * 300, 675)); draw.text(((i + 2) * 300 + 4, 654), 'Actual ' + suffix, fill='white')
    pic.save(out / ('earned-boss-L' + str(level) + '.jpg'), quality=91)
(out / 'boss-index.json').write_text(json.dumps({'source': index['sourceManifest'], 'rows': rows,
    'method': 'Real earned final9 runs, no grants. Nearest500ms observer sample to actual boss intro/death, DOM wall-time extraction with request-latency bounds. Labels describe nominal event windows; frames can show another physical stage/scene. No native first-frame origin, retiming, synthetic outcome or continuous craft inference.'}, indent=2) + '\n')
print('Ten actual earned boss/aftermath/reward sheets prepared')
