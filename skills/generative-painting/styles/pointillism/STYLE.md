# Style: pointillism

`STYLE = 'pointillism'`

Pictures made of **distinct coloured dabs**, not smooth fills, in the tradition of Seurat and Signac's colour division. Up close you see the marks; at a distance they mix optically into form, light and colour. The scene is drawn with the same kit as watercolour. Every drawing call is recorded (`src/capture.js`), then replayed as dots (`src/pointillism.js`), so **geometry (what is drawn and where) is separate from material (how it is painted)**.

**See it first:**
- `examples/ocean-of-points-contact.jpg`: a complete 26 s pointillist film.
- `examples/translation-watercolour-vs-pointillist.jpg`: one film painted in both styles, shot by shot.

## What makes it read as pointillism (keep all of these)

1. **Divided colour.** Each region is a local family of dots: its colour, neighbouring hues, value steps and rare complements (about 3%). Form comes from changing those proportions. Reject "one flat colour with speckle on top".
2. **Density carries value and edges.** Denser dots make darker or stronger areas. Edges resolve through dense-to-sparse boundaries and dotted contour chains, not cartoon outlines.
3. **Rounded, slightly irregular dabs with bounded sizes.** In a 600-unit frame, use radii of about 0.45–0.85 for detail, 0.7–1.4 for body, and occasional 1.5–2 accents. Never identical vector discs, confetti, a printer screen or noise.
4. **Vary mark organisation between shots:** tight stipple, loose clusters, directional dabs, dotted chains, airy fields. Otherwise every shot feels texturally identical.
5. **Frozen marks.** Plates are cached once. Moving dots keep their identities and are pure functions of time. Nothing re-randomises per frame.

## How the material works

| Recorded op | Painted as |
|---|---|
| glaze / fill | stippled colour field; coverage rises steeply with alpha; denser rim; a few dots escape the edge (bleed) |
| wash / reserve | dense, near-opaque stipple |
| hatch | parallel dotted lines clipped to the shape |
| stroke / line / contour | dotted chain; brush type sets size, gaps and tone |
| full-frame ground | solid base colour plus sparse, restrained texture |

Each plate sets `PLATES[id].material` in `film.js`:
- **`profile`**: `dense`, `fine`, `clustered`, `directional` or `airy`.
- **`refScale`**: how strongly dot colour follows the plate's own painted underpainting. Use about 0.45 for new films (purer divided colour) and 1 for translations.
- **Coverage** (`washK`, `fillK`, …): raise on dark grounds.
- **Dot size and chain character** (`tune`, `lineScale`, `chainGap`, `chainStep`).

Every parameter and the calibration loop are in `material.md`.

## Two ways in

- **A new pointillist film:** scaffold with `scripts/new-film.sh --style pointillism <dir> <id>`, then follow the shared workflow in `SKILL.md`. Start plates from `scene-library/`: 19 finished ocean paintings covering every archetype, plus the `school` and `jelly` particle passages.
- **Translating an existing watercolour or p5.brush film:** copy its scenes in, set `REFERENCE`, and the exporter proves the captured watercolour is pixel-identical to the source before any dot is placed. The source soundtrack is stream-copied unchanged. See `translating.md`.

## Mixing with other styles

- **Best at:** saturated, luminous fields, dense masses, glowing textures, and forms that dissolve into moving points (the still plate and the particles are the same material).
- **Weaker at:** fine line diagrams and small text bands (dotted chains soften them), and very small playback sizes (4:2:0 chroma blending).
- **In a mixed film:** use it as punctuation: about one plate in four, spaced out, with a different profile each time, and always with a ground-value change at the cut. Set `style: 'pointillism'` on those plates only. See `../../references/choosing-and-mixing-styles.md`.
- **At 1920 wide:** set `material.dotScale` to about 2.2 so dabs survive encoding. Large plates switch to raster masks automatically.

## Hard-won rules

- **Dark grounds need more coverage:** every gap shows the ground. Keep low-alpha glazes light on pale grounds; the default curves do this.
- **Normal compositing only** for dots. Multiply hides light marks on dark grounds, and additive glow is off-style.
- **Keep `stains` alpha at or below 25.** Otherwise the paper stains become visible dotted discs.
- **Face fish right (angle near 0°) when anatomy matters,** because `sea.fish` rotates bodies upside down at about 180°.
- **Standard MP4 video stores colour at half resolution (4:2:0), which blends neighbouring complementary dots.** Judge the encode in YUV and on a zoomed crop, not by RGB PSNR. See `../../references/verifying.md`.
