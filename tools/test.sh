#!/usr/bin/env bash
# Runs the whole Godot test suite headless (GUT). Usage: tools/test.sh [extra GUT args]
# Exit code is non-zero if any test fails, so CI and agents can rely on it.
set -euo pipefail
cd "$(dirname "$0")/../game"

# First run (or after adding class_name scripts): build the global class cache.
godot --headless --import >/dev/null 2>&1 || true

godot --headless -s addons/gut/gut_cmdln.gd -gconfig=res://.gutconfig.json "$@"
