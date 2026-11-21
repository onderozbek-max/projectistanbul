"""Verify local delivery identities and evidence links; no perceptual acceptance claim."""
import difflib
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'reviews/telemetry/audit8-implementation'


def read(name):
    return json.loads((OUT / name).read_text())


def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def manifest(name):
    return dict((path, digest) for digest, path in
                (line.split('  ', 1) for line in (OUT / name).read_text().splitlines()))


def snapshot_file(snapshot, name):
    # Frozen servers expose prototype/ as their document root.
    return snapshot / name.removeprefix('prototype/')


def command(args):
    result = subprocess.run(args, cwd=ROOT, text=True, capture_output=True)
    return {'exit': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr}


build = read('verified-build.json')
current = manifest('verified-build-runtime.sha256')
before = manifest('before-runtime.sha256')
v1 = manifest('final-build-runtime.sha256')
frozen = Path(build['snapshot'])
mismatches = [name for name, digest in current.items()
              if not (ROOT / name).exists() or sha(ROOT / name) != digest or
              not snapshot_file(frozen, name).exists() or sha(snapshot_file(frozen, name)) != digest]
changed = sorted(name for name in current if current[name] != v1.get(name))
baseline = Path(read('before.json')['snapshot'])
limits = []
for name in current:
    path = ROOT / name
    if path.suffix not in ['.js', '.css', '.html']:
        continue
    count = len(path.read_text().splitlines())
    old = snapshot_file(baseline, name)
    if count > 600 and (not old.exists() or len(old.read_text().splitlines()) <= 600):
        limits.append({'file': name, 'lines': count})
syntax = [str(path.relative_to(ROOT)) for path in (ROOT / 'prototype/js').rglob('*.js')
          if subprocess.run(['node', '--check', str(path)], capture_output=True).returncode]
voices = [name for name in current if name.startswith('prototype/js/dialogue/') and
          Path(name).name != 'dialogue.js' and current[name] != before.get(name)]
retained = {name: current[name] == before[name] for name in [
    'prototype/js/view/hero-motion.js', 'prototype/js/view/hero-footwork.js',
    'prototype/js/view/civilian-acting.js']}
local = command(['shasum', '-a', '256', '-c', 'art/commission/LOCAL-SOURCES.sha256', '--quiet'])
diff_check = command(['git', 'diff', '--check'])
status = command(['git', 'status', '--short', '--branch'])
(OUT / 'git-status.txt').write_text(status['stdout'])
checks = {'runtimeManifest': build, 'runtimeMatchesFrozen': not mismatches,
          'frozenMismatches': mismatches, 'changesSinceV1': changed,
          'nativeVoiceFilesChangedSinceBaseline': voices, 'retainedBaselineFiles': retained,
          'introducedFileLimitViolations': limits, 'javascriptSyntaxErrors': syntax,
          'localSourcesChecksum': local, 'gitDiffCheck': diff_check,
          'branch': command(['git', 'branch', '--show-current'])['stdout'].strip(),
          'head': command(['git', 'rev-parse', 'HEAD'])['stdout'].strip(), 'dirty': True}
write('source-checks.json', checks)
diffs = {name: list(difflib.unified_diff(
    snapshot_file(Path(read('final-build.json')['snapshot']), name).read_text().splitlines(True),
    (ROOT / name).read_text().splitlines(True), fromfile='V1/' + name,
    tofile='verified/' + name)) for name in changed}
write('candidate-deltas.json', {'from': read('final-build.json'), 'to': build,
      'changedFiles': changed, 'diff': diffs,
      'policy': 'Earlier movies keep actual source hashes. Final Main-only asset-await startup changes no simulation, artwork or native voice files relative to earned e538 recordings. Targeted cold lab/three-scene benchmark and full suite verify that change. Explicit owned-plan and roadside-car evidence is separately indexed; automatic commitment was retained.'})

# Tool and art provenance are outside the served runtime manifest.
groups = {
    'verified-tools.sha256': sorted(path for path in (ROOT / 'prototype/tools').rglob('*')
                                   if path.is_file() and path.suffix in ['.js', '.cjs', '.py', '.sh']),
    'verified-art-sources.sha256': sorted(
        [ROOT / 'art/PROVENANCE.csv'] + [path for path in
         (ROOT / 'art/commission/generated/2026-11-18-audit8').rglob('*') if path.is_file()]),
    'verified-movies.sha256': sorted((ROOT / 'reviews/media/R1/audit8-implementation').rglob('*.mp4'))}
for name, paths in groups.items():
    (OUT / name).write_text(''.join(sha(path) + '  ' + str(path.relative_to(ROOT)) + '\n' for path in paths))

reports = [ROOT / 'reviews' / name for name in ['AUDIT8-IMPLEMENTATION-2026-11-18.md',
           'AUDIT8-COVERAGE-2026-11-18.md', 'AUDIT8-PACING-2026-11-18.md']]
broken = []
for report in reports:
    for target in re.findall(r'\]\(([^)]+)\)', report.read_text()):
        if target.startswith(('http', '#', 'mailto:')):
            continue
        if not (report.parent / target.split('#')[0]).exists():
            broken.append({'report': str(report.relative_to(ROOT)), 'target': target})
write('delivery-links.json', {'broken': broken, 'reports': [str(p.relative_to(ROOT)) for p in reports]})
summary = read('verification-summary.json')
log = (OUT / 'verified-full-suite.log').read_text()
passes = re.findall(r'^(?:ok|flaky)\s+(\S+)', log, re.M)
summary.update({'build': build, 'fullSuite': {'log': 'verified-full-suite.log',
                'passedGroups': len(passes), 'groups': passes,
                'complete': log.rstrip().endswith('0 failing') and not re.search(r'^FAIL', log, re.M)},
                'focused': (OUT / 'verified-focused.log').read_text(),
                'desktopBenchmark': read('verified-desktop-benchmark.json'),
                'coldPreview': read('verified-cold-lab.json')})
write('verification-summary.json', summary)
assert not mismatches and not voices and all(retained.values()) and not limits and not syntax
assert local['exit'] == 0 and diff_check['exit'] == 0 and not broken
assert summary['desktopBenchmark']['complete'] and summary['coldPreview']['complete']
print(json.dumps({'runtimeMatches': True, 'nativeVoicesRetained': True,
                  'gaitRetained': True, 'brokenLinks': len(broken),
                  'fullSuiteComplete': summary['fullSuite']['complete'],
                  'passedGroups': len(passes), 'manifests': {k: len(v) for k, v in groups.items()}}))
