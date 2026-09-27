# Widescreen, on-screen text and characters

The engine's default film is a 600² square loop with no text. This page covers what changes when you need a 16:9 film at a genuine 1920×1080, a sentence or title cards over the paintings, or recurring characters. It comes from a finished 22-second 1080p launch-style montage.

## 1. What the engine already supports

- **Plates of any size.** Call `plateSetup(p, brush, density, bg, 1920, 864)`. The kit's `W`/`H` follow the canvas, and `ground`, `stains`, `fibers` and `scatter` fill the whole plate. Brush scale becomes 6 automatically above 1000 px wide; otherwise lines look hair-thin at 1080p.
- **Pointillism at any size:**
  - It reads the plate size from the painted result.
  - It switches on raster masks automatically for plates larger than 600² (`fastMask`), because exact polygon tests become minutes per plate.
  - `material.dotScale` (about 2.2 at 1920 wide) keeps dabs visible after 4:2:0 encoding.
- **`k.arcBand(cx, cy, r0, r1)`** draws horizons, planet limbs and ridges from circles far larger than the frame. **Never draw such circles directly:** p5.brush breaks on huge off-canvas polygons and the shape silently disappears.
- **Per-plate style** for mixed films (`choosing-and-mixing-styles.md`).

## 2. What you build per project

The square renderer (`renderer.js`) and exporter assume a 600 master. For a 16:9 film, write a small compositor in the project:

1. **Canvas 1920×1080, active area 1920×864** (fixed 108-px letterbox bars drawn *last*, pure black). Paint plates at the active size, 1920×864, so nothing is upscaled.
2. **Analytic camera moves.** A push or pan is a pure function of the frame, for example `scale = lerp(1, 1.035, smoothstep(u))` around a focus point. Paint push plates with overscan (for example 2400×1080) so edges never show.
3. **Separate time tracks.** Keep the shots (backgrounds) and the text track independent in `film.js`, and validate that the shots tile every frame and no shot straddles a phrase boundary.
4. **Export checks to keep:**
   - static holds are bit-identical per interval, with declared motion intervals exempt;
   - letterbox rows are pure black;
   - out-of-order seeks match;
   - compression is measured in YUV (Y/U/V PSNR ≥ 40 dB against the lossless frames);
   - text contrast is measured under the glyphs (§3).
5. **Say how it was made:** "rendered at 1920×1080" only if it was; pixel sprites are "deliberately low resolution, enlarged with nearest-neighbour sampling".

## 3. Text over paintings

- **A phrase track with a fixed anchor.** Split one sentence into 2–4 phrases (for example "There's" / "much more to" / "discover"). Draw them at one fixed position while the backgrounds cut underneath. **Only the polarity changes** (ivory or charcoal), and only at a background cut. The anchor never jumps, so the words become the constant that makes a mixed montage feel intentional.
- **Keep the text band quiet in every plate under a phrase.** Paint the subject low (a lower-edge ridge, horizon or field), and keep the band behind the words to one ground value. This "lower-edge motif" also gives you motif-match cuts for free.
- **Measure contrast under the glyph mask**, not on the plate average. Render the text alone to a mask, then take the 5th-percentile WCAG contrast of the pixels under it. Aim for at least 4.5:1. Mid-value grounds (dusty blue, mid grey) fail with **both** ivory and charcoal. Fix the ground's value in the scene; don't add a shadow or glow.
- **Lock the font:**
  - Ship the woff2 file in `public/fonts/` with its licence (OFL fonts are ideal) and a SHA-256.
  - Verify the hash and a measured width against the fallback fonts before capturing any frame, so a font that fails to load fails the export.
  - Store the exact strings in one `STRINGS` object, and never spell them elsewhere.
- **Title cards.** Put the title at a fixed position on every card, with one ground per card chosen for the subject's legibility (a white-suited character on pale paper needs its outline, and a dark character needs a dark-but-lighter ground).

## 4. Characters and mascots

- **Pixel characters as canonical grids.** Build each character once as a cell grid (for example 128×160) in code: silhouette, facial landmarks, 3–5 value bands per colour cluster, light from the upper left and selective outlines. Enlarge by integers (2×, 3×) with `imageSmoothingEnabled = false`. Integer scaling keeps the steps crisp and survives encoding.
- **Pose changes are separate grids** (for example a flame that flickers once), swapped on exact frames and declared as motion in the checks.
- **Keep identity cues fixed across every appearance:** silhouette, eye shape and colour clusters. Check each character at 480×270; if a face disappears, enlarge that feature, not the bitrate.
- **Characters that dissolve into dots:**
  - Derive every mark from the canonical grid.
  - Split them into a static set (face, core, anything that must stay recognisable) and a moving set (rings, sparkles, limb tips).
  - Draw the static set once into a cached layer; each moving mark's position is a pure function of the frame.
  - Ease out and back along a *different* arc, with exactly zero displacement outside the motion interval, so the reassembled frame is bit-identical to the first.
  - Keep displacement modest (about 10–20% of the body width): a recognisable character beats an anonymous point cloud.
  - Put back/body/front depth layers so rings pass behind and in front of the body.

## 5. Checklist for a 1080p film with text

- [ ] Plates are painted at the active size (and overscanned for camera moves), not upscaled.
- [ ] Big arcs use `arcBand` plus `reserve` washes. Large glazes grow spiky triangular bleed, so avoid them on huge shapes.
- [ ] The phrase anchor is fixed; polarity changes only at cuts; no shot straddles a phrase boundary.
- [ ] Glyph-mask contrast is at least 4.5:1 for every phrase and title.
- [ ] The font file is hashed, licensed and verified before capture.
- [ ] Character sprites use integer scale with no smoothing; faces read at 480×270.
- [ ] A finite film's score ends in silence on the last sample, with no wrap.
