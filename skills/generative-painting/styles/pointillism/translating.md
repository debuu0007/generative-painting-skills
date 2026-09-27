# Translating an existing film into pointillism

**Goal:** the same film in a different painting material. Subjects, positions, silhouettes, layer order, crops, timing, particle trajectories, loop and soundtrack stay identical; only the marks change. Pixel equality with the source is impossible by definition, so fidelity is proven where it can be: at geometry capture.

## Fast path: a watercolour film made with this engine

1. Copy the project to a new folder, excluding `out/` and `node_modules/`, then run `npm install`.
2. In the copy's `src/film.js`:
   - set `STYLE = 'pointillism'`;
   - give it a new `ID`;
   - set `REFERENCE = { root, manifest, mp4, wav }`, pointing at the watercolour project and its `out/<id>/` files.
3. Run `npm run export`.

That's all it takes. The exporter:
- proves every captured plate is pixel-identical to the watercolour film's plate;
- stream-copies its soundtrack;
- runs all checks.

The particles keep their records and trajectories and are simply painted as dabs. Then calibrate each plate's `material` (step 5 below) and re-export.

## Requirements (bringing in a film from elsewhere)

The source paints with **p5 2.x + p5.brush 2.x** (instance mode), one scene per plate, with each scene drawing once. That's the shape of a Beautiful Collisions-style project: `src/scenes/*.js`, `kit.js`, helpers, `film.js`, `particles.js`. The engine pins p5 2.3.3 and p5.brush 2.2.3; use the source's exact versions if they differ.

## Why it's exact: the recording proxy

`src/capture.js` wraps p5.brush in a proxy that logs each call and then **forwards it unchanged**, in the same order, to the real brush. It also tracks the p5 transform (push, pop, translate, rotate, scale). The watercolour therefore paints exactly as before, and it consumes the random stream exactly as before. This matters because geometry and painting usually share one seeded p5 random stream: if you rewrote the painting functions, their different number of random calls would shift every later object.

The proof is mechanical. The exporter hashes the watercolour painted during capture and compares it with the source's exported plate hash. **They must be identical for every plate** (`plates-fidelity.json`, `manifest.json → fidelity`).

## Steps

1. **Protect the source.**
   - Record SHA-256 hashes of its MP4s, WAV, manifest and source files, e.g. `shasum -a 256 … > baseline.txt`.
   - Work in a separate project: `scripts/new-film.sh --style pointillism <dir> <id>-pointillist`.
   - Never export into the source. The exporter refuses when `REFERENCE` is set.
2. **Bring the source in.**
   - Replace `src/scenes/`, and copy over `src/kit.js` and any helper modules (`sea.js`, etc.), with the source's own files.
   - Copy the source's `particles.js` and keep its `buildParticles`/`particleAt` (and records) unchanged. Change only the drawing: `drawParticles` must call `particleMark` from `pointillism.js` with normal compositing.
   - Copy `film.js`'s shot rows, `PLATES` seeds and densities, crops and repeats exactly. Keep `AUDIO_SEED` and the source's score file if you want the exporter to prove the audio re-render is identical (informational).
3. **Set `REFERENCE`** in `film.js`: `{ root, manifest, mp4, wav }`, with absolute paths to the source project and its exported manifest, delivery MP4 and WAV.
4. **Capture check:** run `npm run plates`. `plates-fidelity.json → allIdentical` must be `true`. If a plate differs, something consumed or skipped a random call, or a dependency differs. Fix that before anything else.
5. **Material per plate** (`material.md`):
   - Start with `refScale: 1` and a profile matched to what the plate *is*.
   - Calibrate with `tools/thumb_delta.py out/<id>`, aiming for ΔE ≤ ~5.
   - Look at `plates-side-by-side.png` (source vs pointillist).
   - Then run `tools/cut_audit.py` on both the source (on a copy of its manifest and anchors; don't write into the source) and the translation:
     - A cut that was weak in the source is **inherited**: document it and don't fix it.
     - A cut that became weak in translation usually lost **M** (mark organisation). Give the neighbours different profiles or chain settings.
6. **Export:** run `npm run export`. With `REFERENCE` set:
   - The source WAV is copied byte for byte.
   - The source AAC stream is **stream-copied** into both MP4s, and its MD5 is verified against the source's.
   - The capture proof is embedded in the manifest.
7. **Deliver a shot-level side-by-side sheet.** Pair the source's `anchors/*` with the translation's (ffmpeg `hstack` plus `xstack`). Re-verify the baseline hashes at the end.

## What may and may not change

| May change (material) | Must not change (film) |
|---|---|
| dot size, density, colour family, profile, chain character, particle mark shape | objects, positions, silhouettes, layer order, crops, shot boundaries, particle records and trajectories, repeat mapping, soundtrack |

Never "improve" a source composition, symmetry or anatomy inside the replica. Such changes belong in a new film.

## Known residuals

Dark or saturated grounds keep ΔE around 6–7 after calibration, because colour division lowers averaged saturation and a few ground gaps remain. Report this as a material difference. Don't flatten the dots into solid fills to hide it.
