'use strict';
// Shared pieces for the ChatGPT art prompt generators (tools/gen-art-prompts-*.js). Each generator builds one self-contained prompt
// file per asset under art/commission/chatgpt/prompts/<batch>/ from the game's own config, so the prompts match the code.
//   node prototype/tools/gen-art-prompts-characters.js     (hero, enemies, bosses)
//   node prototype/tools/gen-art-prompts-world.js          (ground, props, weapons, pickups)
// The owner pastes the "Paste this into ChatGPT" block of a file into the ChatGPT Project (see art/commission/chatgpt/README.md).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'art', 'commission', 'chatgpt', 'prompts');
const TRACKER = path.join(ROOT, 'art', 'commission', 'TRACKER.csv');

// Palette tokens (docs/design-system.md section 3). Hex in every prompt so ChatGPT has exact values.
const PALETTE = {
  ink: '#14151F', tramRed: '#D7263D', simitGold: '#E9A23B', teaAmber: '#B5651D', bosphorusBlue: '#1B4965', paper: '#F4EBDD',
  stoneGrey: '#8A8F98', zombieBase: '#7D8B6A', playerRing: '#3DDCFF', danger: '#FF4D2E', heal: '#FFD166', elite: '#E040FB',
};

// One paragraph, repeated in every prompt so each message stands alone even if the Project instructions are lost.
const STYLE =
  'Art style "Ink & Tea": bold comic-book ink outlines in near-black #14151F with the same line weight on every character (the outline is about 3% of the figure height), ' +
  'flat cel shading with exactly two or three tones per colour (base, shadow, optional highlight), no airbrush, no soft gradients on figures, no textures on figures, ' +
  'warm amber key light from the upper left, cool blue shadow (#1B4965 at low strength) on the lower right, stylised readable proportions with a big head (about three heads tall), ' +
  'slightly exaggerated hands and feet, a clean outer silhouette that stays readable when the figure is 50 pixels tall.';

const CAMERA_CHAR =
  'Camera: top-down three-quarter view, about 55 degrees above the ground: the viewer sees the top of the head and shoulders, the face and the front of the torso, and the feet; the ground plane is not foreshortened.';

const FACING = 'The figure faces RIGHT of the image (profile-leaning three-quarter, the near shoulder toward the viewer).';

const NEGATIVE =
  'Do not include: any text, letters, numbers, logos, real brand names, flags, religious symbols, gore, blood pools, exposed organs, photorealism, painterly brush texture, ' +
  'a watermark, a signature, a border or frame, a floor, a ground shadow, a cast shadow, a vignette, a gradient background or any background scenery.';

function bgLine(bg) {
  const hex = bg === 'cyan' ? '#00FFFF' : '#FF00FF', name = bg === 'cyan' ? 'cyan' : 'magenta';
  return 'Background: one perfectly flat, uniform ' + name + ' (' + hex + ') colour over the whole image, with no gradient, no noise, no vignette and no lighting on it; ' +
    'nothing of that colour inside the figure, and no soft glow or halo around the figure (hard clean edges, because the colour is removed afterwards).';
}

// A markdown prompt file. a = { id, file, batch, kind, size, bg, refs, message, checks, fails, notes }.
function frame(a) {
  const refs = (a.refs && a.refs.length) ? a.refs.map(r => '- ' + r).join('\n') : '- none (this is the first image of its kind)';
  const checks = (a.checks || []).map(c => '- [ ] ' + c).join('\n');
  const fails = (a.fails || []).map(c => '- ' + c).join('\n');
  return [
    '# ' + a.id + ': ' + a.file,
    '',
    '| | |',
    '|---|---|',
    '| Batch | ' + a.batch + ' |',
    '| Kind | ' + a.kind + ' |',
    '| Ask ChatGPT for | ' + a.size + ' |',
    '| Background | ' + (a.bg === 'none' ? 'none (a full picture)' : a.bg === 'cyan' ? 'flat cyan #00FFFF (this asset has magenta in it)' : 'flat magenta #FF00FF') + ' |',
    '| Save as | `art/commission/in/' + a.batch + '/' + a.file + '.png` |',
    '',
    '## Attach these files to the message',
    refs,
    '',
    '## Paste this into ChatGPT',
    '',
    '```text',
    a.message.trim(),
    '```',
    '',
    '## Accept the image only if',
    checks,
    '',
    '## If it fails',
    fails || '- Reply in the same chat with the one thing that is wrong and say "keep everything else identical". Do not start a new chat.',
    a.notes ? '\n## Notes\n' + a.notes : '',
    '',
  ].join('\n');
}

const written = [];
// Writes one file per item into prompts/<batch>/ and remembers it for the tracker.
function emit(items) {
  items.forEach((a, i) => {
    const dir = path.join(OUT, a.batch);
    fs.mkdirSync(dir, { recursive: true });
    const name = String(a.order !== undefined ? a.order : i + 1).padStart(3, '0') + '_' + a.file + '.md';
    fs.writeFileSync(path.join(dir, name), frame(a));
    written.push({ id: a.id, file: a.file, batch: a.batch, kind: a.kind, prompt: path.relative(ROOT, path.join(dir, name)) });
  });
}

// Merges this run into TRACKER.csv. An existing row keeps its status, so re-running never loses the owner's progress.
function track() {
  const head = 'id,file,batch,kind,prompt_file,status,owner_note';
  const rows = new Map();
  if (fs.existsSync(TRACKER)) fs.readFileSync(TRACKER, 'utf8').split('\n').slice(1).filter(Boolean).forEach(l => {
    const m = /^([^,]+),/.exec(l); if (m) rows.set(m[1], l);
  });
  written.forEach(w => {
    const old = rows.get(w.id), parts = old ? old.split(',') : null, status = parts && parts[5] ? parts[5] : 'todo', note = parts && parts[6] ? parts[6] : '';
    rows.set(w.id, [w.id, w.file, w.batch, w.kind, w.prompt, status, note].map(x => String(x).replace(/,/g, ';')).join(','));
  });
  fs.writeFileSync(TRACKER, head + '\n' + Array.from(rows.values()).sort().join('\n') + '\n');
  return written.length;
}

module.exports = { ROOT, OUT, PALETTE, STYLE, CAMERA_CHAR, FACING, NEGATIVE, bgLine, frame, emit, track };
