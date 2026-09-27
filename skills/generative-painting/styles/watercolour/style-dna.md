# Style DNA

The film reads as an **experimental archive made by one artist**. It combines antique scientific illustration, watercolour sketchbooks, generative art, psychedelic abstraction, field notes and editorial graphic design. The mood is artistic, tactile, mysterious, slightly strange, highly detailed and handmade, never commercially polished.

## 1. The collision (between frames)

Each hard cut should change **at least three** of these axes. The table shows the extremes the original film uses.

| Axis | Extremes used |
|---|---|
| Ground value | near-black `#060504` ↔ near-white `#fbfaf6` |
| Saturation | electric cobalt/neon ↔ faded archival cream/pale pink |
| Density | ~200 overlapping forms ↔ 6 tiny fragments |
| Scale | 30 small specimens ↔ one flower cropped past every edge |
| Line language | watercolour glaze ↔ fine engraving ↔ particles ↔ technical diagram ↔ pencil notebook |
| Composition type | pattern, centred specimen, wreath, corners, grid, diagonal, field, landscape, crop |
| Symmetry | designed four-corner/3×3 symmetry ↔ loose scatter ↔ diagonal drift |

These pairs from the original cut especially hard: cobalt/neon → mint textile; engraved cream → black void; muted ornament grid → sparse specimen; yellow punk poster → cream particle bloom; near-empty peach → a single saturated flower; huge yellow on black (3 s hold) → quiet pale landscape.

**Alternate.** Dense then sparse. Dark then pale. Designed then organic. Don't run two centred-specimen-on-cream plates back to back.

## 2. Control (within a frame)

- One palette family per plate: 3–6 hues plus the ground.
- One clear focal weight (or a deliberate distribution such as four corners or a 3×3 grid). Negative space is designed, not left over.
- Saturated plates need pale neighbours. Near-black plates need readable subjects, not a lifted grey ground.

## 3. Palette families (the actual values)

| Family | Ground | Key colours | Used in |
|---|---|---|---|
| Psychedelic cobalt | `#1330b8` + glazes `#1d43d8 #2b55f0` | gold `#ffd000 #ffc400`, orange `#ff7a00`, hot pink `#ff2d8f`, lime `#b6ec3c #8fe03a`, violet `#9d4edd #7b2cbf` | 01 opener / loop |
| Vintage sage | `#d3dfc8` | brown line `#5b3a22`, dusty orange `#d98a57 #cf7a4a`, ochre `#e2b54e`, cream `#f3e7cc` | 02 textile |
| Scientific ink | cream `#f3ecdc` | ink `#2a1c13`, burnt orange `#c4561d #9a3512`, paper tones `#d9c7a2` | 03 engraved |
| Night void | `#0a0908` | gold `#ffcf2e #ffdc4a`, orange core `#ff7a12`, translucent white `#fff6c8` | 04 specimens |
| Ivory wreath | `#f7f1e3` | dusty blue-green `#86a29a`, pink `#d98f94 #e7b2b0`, orange `#d98c5a`, brown `#6b4f36` | 05 wreath |
| Dark canopy | forest `#0b2e13` | hibiscus pink `#ff1694`, red `#c40000`, yellow `#ffeb3b`, indigo `#4b0082` | 06 canopy |
| Nocturne poster | navy `#0d1838` | lavender-whites `#f3f0ff #eef4ff`, pink centres `#ff6f9f` | 07 corners |
| Archival sheet | `#fdf9f0` | teal `#5E8C8A`, rose `#B97D78`, crimson `#991F25`, gold `#C5A059` | 08 grid |
| Punk engineering | yellow `#ffd400` | orange `#ff6a00`, black `#0b0906` | 11 |
| Pigment particles | beige `#efe2c8` / cream `#f7f0e0` | crimson `#b3122b #d7263d`, coral `#e86a5a`, pink `#e0457a`, gold `#f7c948` | 10, 12 |
| Measured magenta | `#f5f1ea` | magenta `#d6246e #e0418a`, lavender `#c7b0e6`, orange `#f5b041`, ink `#2f2a33` | 14 |
| Almost nothing | `#fbfaf6` | peach `#f6c6a4 #f1b38e`, one magenta `#ff0f7b` | 15 |
| Monument | `#060504` | yellows `#ffd21a #f2b300`, red ring `#a3150b`, black heart, white radials | 18 |
| Field / landscape | `#f4efe2 #f6f2e8` | coral `#f0664f`, blue `#4f74c8`, green `#3f6d2c #6f9a55`, yellow `#f2c230` | 13, 19 |

For a new subject, pick 8–12 families, spread across dark, pale and saturated. Take the values from here or derive new ones with the same logic. Keep one near-white "almost nothing" plate and one near-black monument.

## 4. Texture: what "hand-made" means in code

Do:
- **Glaze by overlap.** Translucent shapes accumulate colour where they cross. Use 2–4 passes per form, each inner pass shrunk and wobbled.
- **Bleed and granulate.** Use `fillBleed` 0.1–0.4 and `fillTexture` 0.35–0.95 with a darker border. Vary these within a plate.
- **Reserve light on dark.** Paint an opaque underlayer first, like leaving the paper unpainted (see p5brush-notes).
- **Broken contours.** Open runs covering 40–85% of the outline, jittered and slightly off-register from the paint, with limited overshoot.
- **Local hatching** clipped to a form, following its direction. Stipple and speckle in gaussian clouds.
- **Static paper.** Ground glazes, a few stains, sparse fibres. Paper differs per plate (clean ivory, mint, tea-stained notebook, dark painted ground).

Don't:
- Use clean vector fills, perfect circles as flowers, or identical petals around a centre.
- Use blur plus global noise as a substitute for watercolour.
- Add per-frame noise or grain, jitter held paintings, or use slideshow zooms, fades or circle reveals.
- Use glossy digital illustration, glow effects, 3D shading, stock or photographic assets, or fonts inside frames.
- Share one paper texture across every plate.
- Add title or caption cards inside the master (attribution goes in files beside the export).

## 5. Organic vs geometric

This is the most important contrast after colour. Soft forms keep colliding with structure:
- graph-paper grids and faint rectangular grids behind flowers (07, 14, 20)
- crosshairs, construction rectangles, radial construction strokes, compass arcs (11, 14)
- scale bars, leader lines, specimen labels drawn as marks (09, 20)
- black scribbles and flow-field ink lines, used only on the loud plates (01, 11)
- tiny crisp geometric accents (squares, triangles, discs) against soft glaze (15)
- the 3×3 grid and the four-corner layout as *designed* compositions (07, 08)

Use several line weights so the structure stays secondary to the paint.

## 6. Motion and time

- Most shots are held still. A held painting is the intended look, not missing animation.
- Only particle shots move. Their positions are analytic functions of shot-local time, rendered as pigment (multiply), with a coherent core.
- Shot lengths are mostly 18–42 frames at 24 fps. There is one long hold (about 72 frames) on the most graphic image, and the shortest shots sit beside the loudest.
- The last shot repeats the opener exactly, so the loop is seamless in both picture and sound.
