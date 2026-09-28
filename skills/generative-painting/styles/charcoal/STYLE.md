# Style: charcoal (with red conté)

`STYLE = 'charcoal'`

A charcoal drawing on toothy paper, the medium of Käthe Kollwitz and every life-drawing room. It uses black charcoal, one warm accent (red conté), smudged tone, and highlights lifted with an eraser. It is a **replay** style: the scene is drawn with the normal kit, recorded, and repainted as charcoal marks (`engine/src/materials/charcoal.js`).

**See it first:** `examples/charcoal-demo-contact.jpg`, and the charcoal shots (05, 11, 16, 20) in `../../references/mixed-film-example-six-materials.jpg`.

## What makes it read as charcoal (keep all of these)

1. **Directional strokes build the tone.** Strokes follow a right-hander's diagonal by default (`angle`, 62°), or the form's own axis for long shapes. Darker areas get more layers, not blacker marks.
2. **Smudge under the strokes.** Wide, low-alpha "blending stump" drags fill the paper's valleys, so masses read as tone and not as hatching alone.
3. **Paper tooth.** A fixed seeded surface: light pressure catches only the peaks (broken, grainy strokes), and heavy pressure fills the valleys. It belongs to the paper, never per frame.
4. **Highlights are erased, not painted.** A light, opaque fill (a `reserve` of a pale colour) becomes eraser strokes that lift charcoal back to the paper.
5. **One accent colour.** Warm saturated reds and oranges become red conté on its own layer. Everything else is value.

## How the material works

| Recorded op | Painted as |
|---|---|
| glaze / fill | smudge + directional strokes; darkness = (1 − lightness) × alpha |
| light opaque wash / reserve | eraser strokes (destination-out on every layer) |
| stroke / line / contour | a broken line: two jittered passes, weight from the brush (`2B` heavy, `2H` faint) |
| hatch | charcoal hatching along the recorded angle |
| warm red fill or line | red conté |
| light full-frame ground | the paper itself |

Per-plate parameters (`PLATES[id].material`):
- `angle` (stroke direction, degrees);
- `strokeW` (4.2 at 1920 wide);
- `lineScale` (1.7);
- `tooth` (0.95; lower is smoother);
- `paper` (`#ebe6dc`);
- `groundK` (darkens a dark ground);
- `unit` (size unit, default plate width / 1920).

## Motion that belongs to it

**Draw-on** (`PLATES[id].drawOn = K`, shot `drawOn: true`): the drawing appears stroke by stroke, one new drawing every two frames. Put the key mark last and give it its own drawings with `drawOnTail`. See `../../references/motion-in-the-medium.md`.

## Mixing

- **Best at:** tension, weight, grief, aftermath (ash, smoke, knots, figures), and anything where one red accent should hit hard.
- **Weaker at:** saturated colour fields (everything but red becomes grey) and tiny detail at 600².
- **In a mixed film:** it's the medium of consequence and of making (a mountain drawn, then the path up it). Cut into it from colour for a value collision.

## Hard-won rules

- Keep light shapes opaque if you want them erased. Low-alpha pale glazes simply vanish.
- Big dark grounds take thousands of strokes. They're capped, and the smudge layer carries the rest.
- Paper stains in a scene become faint tone; keep them sparse.
