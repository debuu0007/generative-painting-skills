# The pointillist material

Everything here is in `src/pointillism.js` and is set per plate in `src/film.js → PLATES[id].material`.

## Profiles (mark organisation)

Radii are in 600-unit logical space. Neighbouring shots should use different profiles; otherwise the film goes texturally flat.

| Profile | Dab radius | Character | Good for |
|---|---|---|---|
| `dense` | 0.7–1.4 | default body texture | solid subjects, puffers, landscapes |
| `fine` | 0.45–0.85 | tight stipple | archival sheets, small motifs, diagrams, engraving |
| `clustered` | 0.8–1.6, groups of up to 4 | coarse jewel-like clusters | exuberant saturated masses, reef openers |
| `directional` | 0.7–1.35, stretched ×1.9 along each form's main axis | strokes that follow the form | fronds, fins, arms, wings, seagrass, sun-star arms |
| `airy` | 0.55–1.1 at 78% coverage | open spacing | translucent jellies, near-empty plates |

`tune` overrides any profile field: `{ r: [min, max], hue, value, neighbour, complement, stretch, cluster, coverage }`.
- `hue` is the ± hue jitter in degrees.
- `value` is the ± lightness jitter.
- `neighbour` is the share of dots shifted 14–30° in hue.
- `complement` is the share of complementary accents.

## Colour: the local family

Each dot picks from a family built around a base colour:
- **hue jitter** within the profile's `hue` range;
- **value jitter** within `value`;
- a **neighbour** share, shifted 14–30° in hue;
- a rare **complement**, at +180°, desaturated and slightly darker.

Near-greys stay grey. Rim dots within about 2.4 units of an edge are darkened slightly (`border`), which gives painted edges without outlines.

**Colour reference (`refScale`).** A dot's base colour can mix the op's own pigment with the plate's captured underpainting at that spot:
- weight 0.68 for fills, 0.6 for washes, 0.35 for lines, 0.85 for grounds;
- the weight is scaled by `refScale` and capped at 1.

| Use | `refScale` |
|---|---|
| New film: purer divided colour, underpainting only guides value | ~0.45 |
| Translation: keep the source's colour impression | 1 |
| A translated plate whose hue drifts (e.g. yellow drifting orange under orange glazes) | 1.2–1.4 |
| Pure pigment, no reference at all | `reference: false` |

## Coverage (how many dots)

Coverage is expected dab area divided by shape area, derived from the op's alpha `a` (0–1):

- glaze/fill: `fillK · a^fillGamma` (defaults 1.05, 1.15), capped at 1.15
- wash/reserve: `washK · a^washGamma` (defaults 1.7, 1.0), capped at 1.5
- full-frame ground: `0.05 + 0.2·a`, a restrained texture, scaled by `groundTexture`

The steep curve keeps light glazes light. On **dark grounds**, every uncovered gap shows the ground, so raise `washK` (2.0–2.8) and `fillK` (1.2–1.6). Examples: a moon jelly on navy used `washK 2.0, washGamma 0.95`; a kelp forest used `washK 2.8, fillK 1.4`.

Placement is stratified: one jittered sample per cell of size √(area/n). That spreads dots evenly but irregularly: never a grid, never white noise.

## Lines

Strokes become dotted chains. Each brush has its own size, gap rate, opacity and value shift:

| Brush | Size | Gap rate | Opacity | Notes |
|---|---|---|---|---|
| `2H` | 0.8 | 0.3 | 0.6 | faint pencil |
| `HB` | 0.95 | 0.18 | 0.78 | |
| `2B` | 1.15 | 0.2 | 0.8 | |
| `pen` / `rotring` | ~0.85 | 0.1 | 0.92 | crisp ink |
| `charcoal` | 1.5 | 0.25 | | |
| `crayon` | 1.2 | 0.45 | | broken |

Per-plate overrides:
- `lineScale` scales dot size.
- `chainGap` (< 1 closes gaps) and `chainStep` (< 1 packs beads) set line character. For engraving-like beads, use `chainGap 0.15, chainStep 0.8, lineScale 1.05`.

## Particles

`particleMark` paints each particle as a rounded dab, and dashes become chains of three touching beads. It uses normal compositing, and opacity is `0.78 + 0.22·alpha`.

## Calibration loop (for translations, or any plate with a target look)

1. Run `npm run plates -- --only <id>`.
2. Run `python3 tools/thumb_delta.py out/<film> <id>`. It reports ΔE and ΔL at 24×24 against `originals/<id>.png`.
3. Interpret the result:
   - **ΔL strongly negative** (too dark): raise coverage.
   - **ΔL positive** (too light): lower the wash coverage.
   - **Hue drift:** raise `refScale`.
4. Look at the full-size PNG. Stop when ΔE is at most ~5 and the dots still read as dots. On dark or saturated grounds a residual ΔE of ~7 is inherent to colour division (averaged saturation drops), so don't flatten the dots to chase it.
