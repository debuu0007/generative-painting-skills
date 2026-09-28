# Style: 2D cel animation

`STYLE = 'cel'`

Hand-drawn 2D animation: flat opaque paint, a hard cel shadow on every figure, a thick-thin ink line, and **line boil** (the outline re-drawn with fresh jitter every drawing, shown on twos). It's a **replay** style (`engine/src/materials/cel.js`).

**See it first:** `examples/cel-demo-contact.jpg`, and the cel shots (04, 12, 21) in `../../references/mixed-film-example-six-materials.jpg`.

## What makes it read as cel animation (keep all of these)

1. **Flat paint, pushed opaque.** Glazes become solid colour. No texture on figures.
2. **A hard shadow.** Each figure is painted in a darker tone, then its base colour is offset up-left, which leaves a crescent of shadow on the lower right.
3. **An ink line around figures**, but not around the background or the ground.
4. **Boil on twos.** Cycle 3 jittered variants, one new drawing every two frames. Animate overlays (needles, hammers, shards) on twos too, and give them the same line.

## How the material works

| Recorded op | Painted as |
|---|---|
| fill (figure-sized, alpha ≥ 110) | flat paint + cel shadow + ink outline |
| fill (ground or huge) | flat background paint |
| stroke | ink line (in the stroke's colour if it's saturated) |

Parameters:
- `line` (ink colour);
- `lineW` (4.2 at 1920 wide), `lineScale`;
- `boil` (jitter, 1.8 px at 1920);
- `shadow` (true), `outlineAlpha` (110);
- `unit`.

Plate settings: `PLATES[id].boil = 3`; shot setting: `boil: true`.

## Mixing

- **Best at:** pressure and mechanism (gauges, clocks, calendars), impacts (glass breaking, a hammer on an anvil), and anything with parts that move.
- **Weaker at:** atmosphere and texture.
- **In a mixed film:** it's the "diagram of the feeling". It works well between painterly shots.

## Hard-won rules

- Draw each form **once** with one glaze. Layered glazes each get their own outline, which gets messy fast.
- Avoid `reserve()` in cel scenes: its wobbled layers become extra outlined shapes.
- Draw overlays with the same fill-plus-line helper, jittered by the drawing number, so they boil with the plate.
