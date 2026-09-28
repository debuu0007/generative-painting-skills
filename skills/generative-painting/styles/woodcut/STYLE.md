# Style: woodcut (linocut, relief print)

`STYLE = 'woodcut'`

A relief print: black ink standing on the block, paper where the block was carved away, grey made from rows of gouges, and a second red block printed slightly out of register. It's the German Expressionist print. It's a **replay** style (`engine/src/materials/woodcut.js`).

**See it first:** `examples/woodcut-demo-contact.jpg`, and the woodcut shots (07, 10, 22) in `../../references/mixed-film-example-six-materials.jpg`.

## What makes it read as a woodcut (keep all of these)

1. **Two values plus cuts.** Dark forms are ink and light forms are carved away. Mid values are ink crossed by parallel **gouges** that follow the form: lighter means more cutting. There is no grey fill.
2. **Tapered chisel marks.** Every cut and every standing line is lens-shaped: it starts thin, swells and ends sharp.
3. **A red block, misregistered.** Strong warm reds print from a second block, offset by a few pixels, with the black block carved away beneath.
4. **The grain shows.** Ink skips along a seeded wood-grain field, so big black areas are never digitally flat.

## How the material works

| Recorded op | Printed as |
|---|---|
| fill with lightness < `inkBelow` (0.42) | solid ink |
| fill with lightness > `paperAbove` (0.74) | carved away |
| fill in between | ink + gouges (direction: form axis, or `gougeAngle`) |
| warm red (strong, lightness < 0.72) | the red block |
| dark stroke | a standing cut line |
| light stroke | a single white gouge |
| hatch | a run of gouges |
| faint fills (alpha < `minAlpha`, 0.3) | ignored: they never reach the block |

Parameters:
- `inkBelow`, `paperAbove`, `gougeAngle`, `grainAngle`;
- `cutScale` (gouge size), `lineScale`;
- `inkSkip`, `redSkip` (grain threshold);
- `paper`, `ink`, `red`, `minAlpha`, `unit`.

## Mixing

- **Best at:** violence, force and declaration: lightning, a charging animal, a hammer, a raised fist, stairs, a manifesto.
- **Weaker at:** subtle colour, soft light and small detail.
- **In a mixed film:** use it for the hardest hits. It collides with watercolour and pointillism on every axis.

## Hard-won rules

- Design scenes in **three values**: ink, gouged mid, paper. A mid-grey sky over a black hill reads; black over black doesn't.
- Put a pale band behind silhouettes you need to read.
- Long carved lines need long chisel runs, or they read as stitches.
