# Adding a painting style

The six styles (watercolour, pointillism, charcoal, sketch, woodcut, cel) are instances of one pattern. A new style (risograph, mosaic, ink wash, cross-stitch, pixel art…) reuses nearly everything and replaces only one layer.

## 1. The three layers of every film

```
 scene (src/scenes/*.js)   →   material (plate-page.js MATERIALS)   →   edit (film.js, renderer, export)
 WHAT is drawn, WHERE          HOW the drawing becomes paint            WHEN it is shown, with checks and sound
 shared kit, seeded             ← a new style lives here                 shared: cuts, holds, particles, score
```

- **Shared, and never changed by a style:** the scene kit, determinism, the editing rules (the cut rule, holds, the rhythm), particles, the score, export and checks.
- **Owned by the style:** the material, its parameters, its documentation, a demo, a scene library and examples.

Because scenes are shared, **every existing scene in the library is instantly available in your new style.** That's the fastest way to test it.

## 2. Pick the kind of style

| Kind | How it works | Use when | Example |
|---|---|---|---|
| **Replay** (`record: true`) | the scene paints through a recording proxy; your `transform` replays the recorded geometry (shapes, lines, fills, hatches) with new marks | the style is a different *mark* over the same drawing | pointillism, charcoal, sketch, woodcut, cel; mosaic, risograph, cross-stitch |
| **Direct** (`record: false`) | the scene library for this style calls its own primitives (a new kit or library) and that painting is the plate | the style needs a different *drawing*, not just different marks | watercolour (p5.brush directly); ink wash with a sumi-e kit; pixel art on a cell grid |
| **Canvas sampling** (a `transform` that reads `result.canvas`) | new marks take their colour by *sampling* the painted plate | as a helper inside a replay style (pointillism's `refScale` does this) | never on its own as a filter |

A style that only blurs, posterises or adds noise to the watercolour output is a filter, not a style. It fails the acceptance test in §6.

## 3. Step by step (replay style)

1. **Create the folder** from the template: `cp -R styles/_template styles/<name>`. Copy an existing `demo/` (usually `styles/pointillism/demo/`), then set `STYLE = '<name>'` in its `film.js`. `scripts/new-film.sh --list` now shows your style.
2. **Register the material** in `engine/src/plate-page.js`:

   ```js
   import { paintMosaic } from './mosaic.js';
   const MATERIALS = {
     // …watercolour, pointillism…
     mosaic: {
       record: true,
       transform: (result, log) => {
         const canvas = document.createElement('canvas');
         const stats = paintMosaic(canvas, log, {
           density, W: result.logicalWidth, H: result.logicalHeight,
           seed: (spec.seed || 1) * 7919 + 29,           // its own stream: tuning never moves a subject
           ...(spec.material || {}),                     // per-plate parameters from film.js
         });
         return { ...result, canvas, width: canvas.width, height: canvas.height,
                  original: result.canvas, material: stats };  // `original` enables side-by-side sheets
       },
     },
   };
   ```

3. **Write the renderer** (`engine/src/<name>.js`). Walk `log.ops` in order: layer order is the scene's own.
   - `op.type`: `shape` (polygon points, with `op.rect` for rectangles), `circle`, `arc`, `path` (lines, splines, strokes), `flow` (flow-field lines).
   - Each op carries the active fill, wash, hatch and stroke state, with transforms already applied, in 0..W × 0..H coordinates. `op.i` is its index.
   - `log.background` is the plate ground.
   - Map each kind of op to your mark: fills to tiles, gouges or halftone; hatches to parallel cuts; strokes to your line language. The shortest worked examples are `engine/src/materials/*.js` (built on `materials/common.js`: `opGeometry`, `runPainter` for draw-on and boil, paper-tooth and grain fields); `engine/src/pointillism.js` is the most elaborate one.
   - **Sizes:** calibrate marks in pixels on a 1920-wide plate and multiply by `u = W / 1920`, so the same material works on the 600² default and on 1080p.
   - **Randomness:** use `makeRng(seed, 1 + op.i)` per op (`engine/src/rng.js`), never `p.random`, so the watercolour underneath stays pixel-identical and changing one op can't reshuffle the rest.
4. **Particles (optional):** if moving marks should look like your material, branch on `style` in `drawParticles` (`engine/src/particles.js`), as pointillism does with `particleMark`.
5. **Calibrate on three plates before anything else:** one dark and dense (for example `01-cobalt-exuberance` or `01-reef-ignition`), one pale and sparse (`15-almost-nothing`), and one line diagram (`09-specimen-plate`). Run `npm run plates -- --only a,b,c` and look at full size and at about 96 px. Most styles break on dark grounds (coverage) or on fine line work (legibility).
6. **Give the style several mark organisations**, the way pointillism has `dense`, `fine`, `clustered`, `directional` and `airy`. Films need the mark-organisation axis (M) to vary between shots; a style with one texture makes every cut feel the same.
7. **Write `STYLE.md`** from the template. Then add a demo, a few library plates and a contact sheet in `examples/`.

### Direct style instead

Put the new drawing primitives in `engine/src/<name>-kit.js`, register `<name>: { record: false, transform: null }`, and write the demo and library scenes against that kit. Keep the same `plateSetup` and seeding rules, so determinism and caching work unchanged.

## 4. Style ideas and how they map onto recorded ops

Charcoal, sketch, woodcut and cel are implemented (`engine/src/materials/`); read them as worked examples. They're small, share `common.js`, and show replay (all four), boil variants (cel) and draw-on snapshots (all). Remaining ideas:

| Style | Fills | Lines / hatch | Notes |
|---|---|---|---|
| Risograph / screen print | halftone per colour plate, offset registration | solid ink lines | limited spot palette, overprint multiply |
| Mosaic / tessera | tiles packed inside each shape, grout gaps | tile chains along lines | tile size per profile |
| Ink wash (sumi-e) | graded single-hue washes, dry-brush edges | pressure-varied brush strokes | mostly monochrome, lots of empty paper (direct style) |
| Cross-stitch / textile | stitched cells on a grid | back-stitch lines | grid-snapped, thread palette |
| Pixel art | cells on an integer grid, value bands, selective outlines | stepped lines | integer upscale only; see `widescreen-and-titles.md` §4 (direct style) |

## 5. Decide how the style mixes with others

Add a short section to `STYLE.md`: what the style is best at, what it is bad at (text? dark grounds? compression?), and where it belongs in a mixed film. `choosing-and-mixing-styles.md` shows the pattern for watercolour and pointillism.

## 6. Acceptance before publishing a style

1. The demo exports with all checks passing (`npm run export`).
2. **Replay styles:** the watercolour painted during capture is pixel-identical to painting without the recorder. Export the same scenes with `STYLE = 'watercolour'` and compare the plate hashes in `manifest.json`.
3. The contact sheet reads as the style at about 96 px and at full size, and **not as a filter** over watercolour. Show the side-by-side sheet (`plates-side-by-side.png`) to someone who hasn't seen the code.
4. The style has at least three mark organisations, and a demo cut sequence that varies them.
5. `STYLE.md` states the rules, parameters, known limits (compression, dark grounds, small sizes) and mixing guidance.
6. Add a row to the style table in `SKILL.md` and in the repository README, and add a contact sheet to `examples/`.
