# Style: <name>

`STYLE = '<name>'`

> Template. Copy this folder to `styles/<name>/` and fill in every section. See `../../references/adding-a-style.md`.
> A style appears in `scripts/new-film.sh --list` once `demo/film.js` exists.

One paragraph: what the pictures are made of up close, and what they read as from a distance. Name the tradition it draws on.

**See it first:** `examples/<name>-contact.jpg`.

## What makes it read as <name> (keep all of these)

1. **The mark:** its shape, size range in 600-unit space, and edge character.
2. **How value and form are built:** density, overlap, colour division, line weight…
3. **How edges resolve.**
4. **The mark organisations** (at least three), used to vary the M axis between shots: `profileA`, `profileB`, `profileC`.
5. **What never happens:** the filter looks and the anti-patterns specific to this style.

## How the material works

| Recorded op | Painted as |
|---|---|
| glaze / fill | … |
| wash / reserve | … |
| hatch | … |
| stroke / line / contour | … |
| full-frame ground | … |

Per-plate parameters (`PLATES[id].material` in `film.js`): list each one, its range and its default.

## Mixing with other styles

- **Best at:** …
- **Bad at:** … (text, dark grounds, fine lines, 4:2:0 compression, small sizes)
- **In a mixed film it belongs:** … (see `../../references/choosing-and-mixing-styles.md`)

## Hard-won rules

Calibration notes: coverage on dark grounds, dot or tile size at 1080p, compression behaviour, and anything that surprised you.
