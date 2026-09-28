# Style: sketch (graphite pencil, or pen and ink)

`STYLE = 'sketch'` · `material: { medium: 'ink' }` for pen and ink

A drawing from a sketchbook: hatching and cross-hatching for value, "searching" contours drawn two or three times with overshooting ends, and an optional red pencil. It's a **replay** style (`engine/src/materials/sketch.js`).

**See it first:** `examples/sketch-demo-contact.jpg`, and the sketch shots (01, 02, 13, 15, 23) in `../../references/mixed-film-example-six-materials.jpg`.

## What makes it read as a sketch (keep all of these)

1. **Value is hatching.** Spacing tightens as the form darkens. A second direction appears for mid-darks and a third for the darkest areas. Never flat grey fill.
2. **Hand-drawn lines.** Each hatch line is slightly bowed, fades at both ends (pressure) and sometimes overshoots the form.
3. **Searching contours.** Outlines are drawn two or three times, slightly offset, with a light construction outline around every filled form.
4. **Lots of paper.** Light grounds are the paper itself, and highlights are simply left empty.
5. **Graphite is grey; ink is black.** Graphite breaks on the paper tooth; ink is crisp and single-pass.

## How the material works

| Recorded op | Painted as |
|---|---|
| glaze / fill | 1–3 passes of hatching by value + a light outline |
| stroke / line | a searching contour (1 pass for `pen` or ink, 2 for pencil) |
| hatch | hatching along the recorded angle |
| warm red | red pencil |
| light ground | the paper |

Parameters:
- `medium` (`graphite` | `ink`);
- `angle` (hatch direction, 48°);
- `spacing` (1 = default density);
- `lineW` (2.0 graphite / 2.2 ink at 1920 wide);
- `contourScale`;
- `tooth` (0.55);
- `outlines` (true);
- `paper`;
- `unit`.

## Motion that belongs to it

- **Draw-on** is natural here: a calm horizon drawn line by line, a crack running across the page, tally marks accumulating.
- Draw order is the scene's order, so write scenes in the order an artist would draw.

## Mixing

- **Best at:** calm openings, diagrams, notes, aftermath studies, figures in landscape, and lines that grow.
- **Weaker at:** saturated colour and big dark masses (very dense hatching gets heavy).
- Ink is the sharper cousin: cracks, thorns, stamped rejections.

## Hard-won rules

- Very light fills (lightness > 0.88) are left as paper.
- Many overlapping glazes of the same shape each hatch again, which gets dark fast. Use one fill per form.
