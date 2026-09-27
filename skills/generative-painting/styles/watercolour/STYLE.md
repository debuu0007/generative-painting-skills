# Style: watercolour (the "Beautiful Collisions" look)

`STYLE = 'watercolour'`

Hand-made-looking paintings built from:
- translucent **watercolour glazes** that pool, bleed and mix like pigment;
- **graphite and ink** contours, contour-following hatching and pigment speckle;
- per-plate **paper** (clean ivory, mint, tea-stained notebook, dark painted grounds).

The subjects come from antique scientific illustration, sketchbooks and editorial design. The edit collides radically different paintings with hard cuts.

**See it first:**
- `examples/beautiful-collisions-contact.jpg`: the original 26 s botanical film, one frame per shot.
- `examples/tidal-collisions-contact.jpg`: the same style applied to the ocean.

## The five rules

1. **Each cut changes at least three things:** ground value, saturation, density, scale, line language, composition. A palette swap alone isn't a collision.
2. **Each painting is internally controlled:** one palette family, 3–6 colours, a clear focal weight.
3. **Organic versus geometric.** Soft glazed forms collide with grids, crosshairs, construction lines, scribbles and scale bars.
4. **Tactile, never vector.** Glazes that bleed, broken pressure-varied contours, local hatching, speckle, static paper stains. No clean fills, no blur standing in for watercolour, no per-frame noise, no glow.
5. **Stillness is a feature.** Most shots hold still; motion is rare (`dust`, `radial` particles). The film loops by repeating the opener.

The full version, with every palette family's hex values and the anti-patterns, is in `style-dna.md`. The 12+ composition archetypes and the recipe file for each are in `archetypes.md`.

## How the material works

The scene paints directly with p5.brush, and that painting is the plate; nothing replays it. Everything that matters is in the drawing kit, so read `../../references/drawing-kit.md` before painting. Three rules decide most outcomes:
- **Fills mix like pigment.** Yellow over blue turns green, so light colours on dark grounds need `k.reserve()` first.
- **Fill alpha below ~60 disappears on light paper.** Build depth by overlapping glazes at 130–200.
- **Paint each plate in its own isolated document** (the engine does this), because p5.brush keeps module-level state.

## Recipes

`scene-library/` holds 19 finished paintings (the original film). Copy any into `src/scenes/` and register it in `src/scenes/index.js`: they import `../kit.js` and `../particles.js`. Three of them (06 hibiscus canopy, 08 ornament grid, 20 field journal) are faithful instance-mode ports of hand-written p5.brush sketches, useful as a reference for porting someone's global-mode sketch without changing a drawing call.

The demo film (`demo/film.js`, 8 s, created by `scripts/new-film.sh --style watercolour`) uses six of them. Its plates reproduce the original film's pixels exactly.

## Sound

The soft score is the default (`src/score-soft.js`). The livelier original (`src/score.js`: thumps, plucks, bells) is available on request; see `../../references/sound.md`.

## Mixing with other styles

- **Best at:** pale papers, archival and diagram plates, fine ink and engraving, delicate translucency, near-empty breaths, and calm grounds under text.
- **Weaker at:** very dense luminous fields (they can go muddy, because fills mix like pigment) and anything meant to read as "made of points".
- **In a mixed film:** watercolour is the body. Pointillist plates are punctuation at the energy peaks. See `../../references/choosing-and-mixing-styles.md`.

## Converting to pointillism

Any watercolour film made with this engine can be repainted as pointillism with geometry proven identical. See `../pointillism/translating.md`.
