# Composition archetypes

Twelve archetypes cover the original film. None of them is tied to flowers: each is a *way of arranging marks on the square*. For a new subject, pick an archetype per shot and then translate the subject into kit marks. The "Start from" column names the recipe in this style's `scene-library/`. Copy it into your project's `src/scenes/`, rename its `id` and export, register it in `scenes/index.js`, then change the subject, palette and placement.

| # | Archetype | Arrangement | Start from | Sound |
|---|---|---|---|---|
| A | **Exuberant mass** | 100+ overlapping forms massed in the centre, edges breathe, ink scribbles and filaments explode outward | `01-cobalt-exuberance.js` | exuberant |
| B | **Textile / pattern** | 30–60 small independent motifs, dart-thrown (`k.scatter`), cropped at every edge, size and rotation varied, no stamp grid | `02-mint-textile.js` | textile |
| C | **Engraved diagonal** | 3–5 large subjects on a lower-left→upper-right diagonal in fine line only: contour hatching, radial filaments, one burnt accent colour | `03-engraved-diagonals.js` | engraved |
| D | **Specimens in a void** | near-black ground, 12–20 small luminous subjects with large gaps; light colours over a `reserve` | `04-night-specimens.js` | night |
| E | **Wreath / perimeter** | material only around the edge, centre genuinely empty; built from overlapping branch runs, never a circle mask | `05-watercolor-wreath.js` | wreath |
| F | **Dark lush canopy** | dark ground, translucent layered glazes you can see through, clusters | `06-hibiscus-canopy.js` (supplied sketch, raw p5.brush) | canopy |
| G | **Four-corner poster** | four large subjects anchored in the corners and cropped by the frame, a faint grid, a quiet centre; designed symmetry | `07-nocturnal-corners.js` | corners |
| H | **Archival grid / sheet** | exact 3×3 (or 2×3) placement, halos, corner border marks, faded palette | `08-ornament-grid.js` (supplied, raw p5.brush) | ornament |
| I | **Sparse specimen plate** | 2–3 objects of different visual weight (small, large, diagram) on a huge cream field, with a scale bar and leader lines | `09-specimen-plate.js` | specimen |
| J | **Particle shot** | a painted core under seeded particles: *dust* loosens the silhouette outward; *radial* blooms out from a compressed core and settles | `10-dust-flower.js`, `12-radial-bloom.js` + `particles.js` | dust / radial |
| K | **Technical / punk** | a hot saturated ground, one big soft form cut across by black scribbles, radial construction strokes, rules and tilted outlines | `11-engineering-flower.js` | engineering |
| L | **Field / crowd** | subjects rising from the bottom at varied heights, a crowded foreground, empty air above, crops on both sides | `13-wildflower-field.js` | wildflower |
| M | **Measured** | one translucent central form over fine grids, rectangles and crosshairs that show through the pigment | `14-measured-pink.js` | measured |
| N | **Almost nothing** | near-white ground, 4–8 pale fragments drifting diagonally, each with one tiny saturated geometric accent; the most whitespace in the film | `15-almost-nothing.js` | nothing |
| O | **Hero → crop** | one richly glazed central subject painted at density 3; the next shot is an abrupt extreme crop (`crop: {x,y,w,h}` in 600 units) that turns it abstract | `16-single-glazed-flower.js` | single → inside |
| P | **Monument** | one gigantic subject running past every edge on near-black, uneven luminous pigment, a dense dark centre, fine radial lines; the ~3 s hold | `18-black-yellow.js` | monument |
| Q | **Landscape** | a quiet pale sky, faint far ridges, a dense sharp foreground; depth from contrast and scale | `19-botanical-landscape.js` | landscape |
| R | **Field journal** | tea-stained paper, graph grid, one central drawn subject, parts connected by leaders, a scale bar, stains | `20-field-journal.js` (supplied, raw p5.brush) | journal |

(That's 18 rows because a few archetypes have variants. Any 12–16 of them make a strong 20-shot film.)

## Translating a new subject

Name the subject's parts, then map each part to kit marks:

| Subject | Blade (`petalOutline`) | Cluster (`flower`) | Ribbon (`strip`+`stemPath`) | Dots (`stipple`/particles) |
|---|---|---|---|---|
| Birds | feathers, wings, tail | a bird seen as a radial fan, a flock | flight paths | seeds, flock dust |
| Ocean | fins, waves, kelp fronds | anemone, jellyfish bell | currents, tentacles | plankton, foam |
| City | building shards, awnings | rooftop clusters | roads, rivers, wires | windows, lights |
| Food / fruit | slices, leaves, peel | citrus section, cut pomegranate | noodles, vines | seeds, sugar, spice |
| Space | flares, nebula lobes | star bursts, planets with rings (use `petalCircle`) | orbits | star fields |
| A product / brand | the product silhouette as a blade or polygon | exploded parts diagram (use archetype R or M) | cables, packaging ribbons | confetti in brand colours |

Keep the subject **drawn**, not literal. Silhouettes, glazes and annotation beat detailed rendering. If a subject needs a hard polygon (a bottle, a building), use `k.shape(pts, 0)` with low curvature, then glaze and contour it like everything else so it belongs to the same world.

## Plate review questions

- Would this plate look good printed alone?
- Does it match its row in the shot table: ground, family, density, focal position?
- Against both neighbours, does it change at least three axes?
- Is there anything clean, vector-like, symmetric by accident, or generic?
- On dark grounds, do the light colours stay light (reserved), not muddy?
