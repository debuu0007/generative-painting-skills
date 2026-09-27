#!/usr/bin/env bash
# Scaffold a new film (or single painting) in a chosen painting style.
#   new-film.sh --style <style> <target-dir> [film-id]
#   new-film.sh --list                       # show available styles
# Copies the shared engine plus the style's demo film and scenes, sets the film id and a fresh random
# audio seed, and installs dependencies (p5 2.3.3 + p5.brush 2.2.3 pinned, Vite, Playwright +
# Chromium). Needs Node 18+ and ffmpeg; Python 3 with numpy/scipy for the analysis tools.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
styles() { for d in "$here"/styles/*/; do [ -f "$d/demo/film.js" ] && basename "$d"; done; }
if [ "${1:-}" = "--list" ]; then styles; exit 0; fi
[ "${1:-}" = "--style" ] || { echo "usage: new-film.sh --style <$(styles | paste -sd'|' -)> <target-dir> [film-id]" >&2; exit 1; }
style="${2:?missing style}"; target="${3:?missing target dir}"; id="${4:-$(basename "$target")}"
[ -f "$here/styles/$style/demo/film.js" ] || { echo "unknown style '$style'; available: $(styles | paste -sd' ' -)" >&2; exit 1; }
if [ -e "$target" ] && [ -n "$(ls -A "$target" 2>/dev/null)" ]; then echo "refusing to overwrite non-empty $target" >&2; exit 1; fi
mkdir -p "$target"
cp -R "$here/engine/." "$target/"
cp "$here/styles/$style/demo/film.js" "$target/src/film.js"
mkdir -p "$target/src/scenes" && cp "$here/styles/$style/demo/scenes/"*.js "$target/src/scenes/"
seed="$(head -c 400 /dev/urandom | LC_ALL=C tr -dc 'a-z0-9' | head -c 20)"
sed -i.bak -e "s/^export const ID = .*/export const ID = '$id';/" \
           -e "s/^export const AUDIO_SEED = .*/export const AUDIO_SEED = '$seed';/" "$target/src/film.js"
rm -f "$target/src/film.js.bak"
cd "$target"
npm install --no-audit --no-fund
npx playwright install chromium >/dev/null 2>&1 || echo "note: run 'npx playwright install chromium' if export cannot launch a browser"
command -v ffmpeg >/dev/null || echo "note: ffmpeg not found; install it or export with --no-video"
echo "Ready: $target  (style '$style', film id '$id', audio seed '$seed')"
echo "  npm run dev      # preview at http://localhost:5173  (?plate=<id> shows one painting)"
echo "  npm run plates   # every plate as a lossless PNG + contact sheet (-- --only a,b for a subset)"
echo "  npm run export   # frames, native 600 + 1080 MP4, WAV, contact sheet, checks"
