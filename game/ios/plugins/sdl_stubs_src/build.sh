#!/usr/bin/env bash
# Rebuilds ../SDLStubs.a (device arm64). Usage: game/ios/plugins/sdl_stubs_src/build.sh
set -euo pipefail
cd "$(dirname "$0")"
xcrun -sdk iphoneos clang++ -arch arm64 -miphoneos-version-min=15.0 -fobjc-arc -O2 -c sdl_stubs.mm -o /tmp/sdl_stubs.o
rm -f ../SDLStubs.a
xcrun ar rcs ../SDLStubs.a /tmp/sdl_stubs.o
