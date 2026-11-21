"""Review original native frames; generated sheets are not inspection approval."""
from pathlib import Path
from PIL import Image, ImageDraw
import json, subprocess

root = Path(__file__).resolve().parents[2]
media = root / 'reviews/media/R1/audit11-implementation'
out = media / 'additional-frame-review'
rows = json.loads((out / 'index-advanced.json').read_text())['rows']
names = list(dict.fromkeys(row['id'] for row in rows))
sheets = []
for first in range(0, len(names), 3):
    pic = Image.new('RGB', (1170, 1560), '#161a23')
    draw = ImageDraw.Draw(pic)
    for j, name in enumerate(names[first:first + 3]):
        for k, row in enumerate(r for r in rows if r['id'] == name):
            im = Image.open(root / row['frame']).convert('RGB').crop((0, 180, 390, 670))
            pic.paste(im, (k * 390, j * 520 + 25))
            draw.text((k * 390 + 3, j * 520 + 3), name + ' ' + row['phase'], fill='white')
    path = out / ('advanced-contacts-' + str(first) + '.jpg')
    pic.save(path, quality=91)
    sheets.append(str(path.relative_to(root)))
(out / 'index-advanced-sheets.json').write_text(json.dumps({
    'forms': names, 'sheets': sheets,
    'method': 'Original native sparse hit/phase frames; source/sample mapping in index-advanced.json. Generated is not inspected.'
}, indent=2) + '\n')

for mode in ['default', 'reduced']:
    folder = media / ('final9-health-' + mode)
    row = json.loads((folder / 'index-health.json').read_text())[0]
    events = row['facts']['events']
    items = [e for e in events if e['type'] in ['heroHit', 'shieldBlock', 'healPulse']
             or (e['type'] == 'pickup' and e.get('healed', 0) > 0)]
    sheet = Image.new('RGB', (1170, ((len(items) + 2) // 3) * 330), '#161a23')
    draw, index = ImageDraw.Draw(sheet), []
    for i, event in enumerate(items):
        sample = min(row['recordingSamples'], key=lambda s: abs(s['t'] - event['t'] - .065))
        start = row['viewportStart'] - row.get('audioTrimSeconds', 0)
        second = max(.01, sample['wall'] - start)
        path = out / ('health9-' + mode + '-' + str(i) + '.jpg')
        subprocess.run(['ffmpeg', '-v', 'error', '-threads', '1', '-ss', str(second),
                        '-i', row['nativeCanvas']['file'], '-frames:v', '1', '-q:v', '3', '-y', str(path)], check=True)
        im = Image.open(path).convert('RGB').crop((0, 285, 390, 585))
        sheet.paste(im, (i % 3 * 390, i // 3 * 330 + 25))
        draw.text((i % 3 * 390 + 4, i // 3 * 330 + 3),
                  str(i) + ' ' + event['type'] + ' ' + str(event.get('cause', 'heal')), fill='white')
        index.append({'event': event, 'sample': sample, 'nativeSecond': second, 'file': str(path.relative_to(root))})
    sheet.save(out / ('health9-' + mode + '.jpg'), quality=91)
    (out / ('health9-' + mode + '-index.json')).write_text(json.dumps({
        'source': row['sourceManifest'], 'rows': index,
        'method': 'Nearest actual125ms sim/wall sample to event+65ms; original native capture. Sparse, not motion proof.'
    }, indent=2) + '\n')
print('65 advanced sheets and corrected health impact windows prepared')
