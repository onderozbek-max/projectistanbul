#!/usr/bin/env bash
# Local checks for changes to input, saves, visuals, localization and the performance export.
set -e
cd "$(dirname "$0")/.."

for test in input tel progress-ui ui-motion dialogue a11y-canvas anim-flavor benchmark; do
  node "tools/test-$test.js"
done
node tools/test-art-raster.js --no-chrome
node tools/check-objective-strings.js
