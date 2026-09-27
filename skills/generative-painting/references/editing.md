# Editing: rhythm, cuts, archetypes, motion (all styles)

## Rhythm template (26 s, 624 frames, about 21 shots at 24 fps)

The same skeleton powered the example film; reuse it, then adjust.

| Frames | Role |
|---|---|
| 0–30 | **dense saturated opener** (doubles as the loop point) |
| 30–54 | a near-empty **breath** straight after |
| … | alternate dark/pale, crowded/sparse, designed/organic; 18–42 frames per shot |
| middle third | two **particle passages** (one loosening, one gathering) |
| around 17 s | a near-empty **"almost nothing"**, then a **hero** painted at density 3, then an abrupt **crop** of it (18 frames) |
| 456–528 | the **monument**: the most graphic image, held for 3 s |
| near the end | a quiet archival plate (field notes, specimen sheet) |
| last 24 frames | **repeat the opener exactly** (`repeatOf`) so the loop closes |

Hard cuts only: no fades, zooms or reveals. No text inside frames.

## The cut rule: at least three of six axes change on every ordinary cut

| Axis | Measures |
|---|---|
| **G** | ground value (dark ↔ pale) |
| **P** | palette and saturation |
| **D** | occupied density |
| **S** | subject scale (tiny specimens ↔ one cropped giant) |
| **M** | mark organisation / line language (watercolour: glaze, engraving, diagram, particles; pointillism: stipple, clusters, directional, chains, airy) |
| **C** | composition (centroid, spread, corners, grid, diagonal) |

Plan the axes in the shot table. Then measure them with `python3 tools/cut_audit.py out/<film>`, which uses conservative thresholds and flags anything below 3. The hero→crop pair and the loop seam are exempt by design. The audit undercounts a change of hue family between two pale grounds, so confirm any flagged cut by eye before changing it.

## Plate archetypes (subject-agnostic)

Each row is an arrangement; any subject fits in any style. The example plates are from `styles/pointillism/scene-library/`; the watercolour equivalents are listed in `styles/watercolour/archetypes.md`.

| Archetype | Example plate | Material |
|---|---|---|
| Dense diagonal mass with clear channels | `01-reef-ignition` | clustered |
| Sparse single subject in pale space | `02-moon-jelly-silence` | airy |
| Ribbons or schools across a dark field | `03-silver-current` | directional |
| Measured specimen grid (2×3, 3×3) | `04-nudibranch-studies`, `08-reef-fish-atlas` | fine |
| Perimeter frame with an open aperture | `05-sea-fan-aperture` | fine |
| Large portrait in negative space | `06-leafy-seadragon` | directional |
| Four cropped corners, quiet centre | `07-moon-jelly-quadrants` | airy |
| One long subject on a diagonal | `09-barracuda-diagonal` | directional |
| Particle: things loosen into points | `10-school-into-current` + `particles.js` (`school`) | fine |
| Technical diagram interrupted by a big form | `11-puffer-diagram` | dense, coarse |
| Particle: points gather into a form | `12-jelly-constellation` + `particles.js` (`jelly`) | airy |
| Field rising from the lower edge | `13-seagrass-meadow` | directional |
| One form over a measurement grid | `14-comb-jelly-study` | fine |
| Almost nothing (sparsest plate) | `15-plankton-breath` | airy |
| Hero, then crop | `16-lionfish-fan` (density 3) | directional |
| Monument past every edge | `18-manta-monument` | directional |
| Layered quiet distance | `19-quiet-reef-distance` | dense, fine |
| Field-notes page | `20-octopus-field-notes` | fine |

## Drawing subjects

- **Silhouette first.** A recognisable eye, bell rim or fin outline matters more than extra dots. Check every plate at about 96 px.
- **The kit** (`kit.js`, `createKit(p, brush)`):
  - `petalOutline` (any tapered blade: petal, fin, leaf, wing, arm);
  - `petalCircle`, `strip`/`stemPath` (ribbons, tentacles, stems);
  - `glaze`, `reserve` (light on dark), `contour`, `hatchIn`, `line`, `stipple`, `scatter`;
  - `ground`, `stains` (keep alpha ≤ 25 in pointillism, or they become visible dotted discs), `fibers`.
- **Marine helpers:**
  - `sea.js`: `fish`, `paintFish`, `scaleArcs`, `paintJelly`, `spiralShell`, `starfish`, `paintUrchin`, `coralBranches`, `frond`, `bubble`.
  - `ocean.js`: `school`, `barracuda`, `lionfish`, `manta`, `seadragon`, `nudibranch`, `octopus`, `combJelly`, `seaFan`, `ribbon`, `bez`.
- **Other subjects** reuse the same primitives. Birds are blades plus a flock `school`; cities are strips and polygons; space is rings and particle gathers. Keep the subject drawn, not literal.
- **Anatomy.** `sea.fish` builds anatomy in a y-down local frame. Face fish right (angle near 0°) where dorsal/ventral order matters. Keep marine casts plausible: no freshwater species in "ocean" briefs (use a barracuda, not a piranha), and no vessels or divers unless asked.

## Motion (particles)

Four kinds ship in `src/particles.js`. Set `motion: '<kind>'` on a shot. They work in both styles: watercolour draws them as multiply-blended pigment dots and dashes, pointillism as rounded dabs with normal compositing.

| Kind | Movement | Plate underneath paints | Recipe |
|---|---|---|---|
| `dust` | a form loosens outward while its core holds | the same mask the particles sample (`DUST`, `dustRadius`) | watercolour `10-dust-flower` |
| `radial` | a burst releases from a compressed core, overshoots, settles | only the heart (`RADIAL`, `radialRadius`) | watercolour `12-radial-bloom` |
| `school` | point-built small fish loosen tangentially into points | only the inner crescent that stays (`SCHOOL`) | pointillism `10-school-into-current` |
| `jelly` | a compressed cluster gathers into a bell; tentacles arrive last | nothing solid under the moving dots (`JELLY`) | pointillism `12-jelly-constellation` |

Rules for new kinds:
- Build identities once, in `buildParticles`.
- Make positions pure functions of shot-local `u`, in `particleAt`, with no frame-to-frame simulation.
- Change a subject by editing its mask (radius-by-angle, or sampled silhouettes) and colour lists.
- Never paint a solid silhouette under dots that move away.

## Sound

- The default is `src/score-soft.js`, with a `sound` character per shot:
  - `exuberant` · `textile` · `engraved` · `night` · `wreath` · `canopy` · `corners` · `ornament` · `specimen`;
  - `dust` / `radial` for the moving passages;
  - `wildflower` · `measured` · `nothing` for the sparsest plate;
  - `single` / `inside` for the hero and crop, `monument`, `landscape`, `journal`.
- A `repeatOf` shot reuses its source's sound.
- To re-roll the music, change `AUDIO_SEED`.
