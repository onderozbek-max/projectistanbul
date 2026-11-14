#!/usr/bin/env bash
# Runs the prototype's Node tests one at a time and prints one line per test with its exit code.
# A test that fails is rerun once, alone: the Chrome tests (test-map-first-run, test-enemy-silhouettes, test-art-raster*,
# test-arena-evolve) flake when the machine is loaded. Exit code is non-zero if any test still fails after its rerun.
# Usage:  prototype/tools/run-tests.sh              all tests (about 20 minutes: test-modes and test-meta are the slow ones)
#         prototype/tools/run-tests.sh art-raster fonts quality      only those (names without "test-" and ".js")
# Needs Node 20+, and Google Chrome at /Applications/Google Chrome.app (or CHROME_BIN) for the browser tests.
cd "$(dirname "$0")/.." || exit 2
if [ "$#" -gt 0 ]; then names=("$@"); else names=(); for f in tools/test-*.js; do b=$(basename "$f" .js); names+=("${b#test-}"); done; fi
fails=0
for n in "${names[@]}"; do
  log="/tmp/proto_test_$n.log"
  if node "tools/test-$n.js" >"$log" 2>&1; then echo "ok    $n"; continue; fi
  if node "tools/test-$n.js" >"$log" 2>&1; then echo "flaky $n (passed on rerun)"; continue; fi
  echo "FAIL  $n   (log: $log)"; tail -5 "$log" | sed 's/^/        /'; fails=$((fails + 1))
done
echo "$fails failing"
[ "$fails" -eq 0 ]
