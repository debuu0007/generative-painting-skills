---
name: generative-painting
description: Make hand-painted-looking generative paintings and short art films in code, in a chosen painting style — watercolour (translucent glazes, graphite and ink on paper, the "Beautiful Collisions" look), pointillism (Seurat-style divided-colour dots), charcoal with red conté, graphite or pen-and-ink sketch, woodcut / linocut print, or 2D cel animation — or several mixed plate by plate, with hard-cut collision editing, deterministic particle motion, a soft code-generated score, and a self-contained runnable engine (p5 + p5.brush + Vite + Playwright + ffmpeg) that exports lossless plates, MP4s, a WAV and automated checks. Also covers 16:9 1080p films, fixed-anchor on-screen text and pixel characters, repainting an existing film in another style with provably identical geometry, and adding brand-new painting styles. Use it whenever someone wants a painted or illustrated video, reel, loop, montage, launch film, animated artwork or generative painting of any subject (flowers, ocean, birds, cities, a product…), mentions watercolour, pointillism, stippling, dots, Seurat, charcoal, sketching, pencil, ink, woodcut, linocut, printmaking, 2D animation, botanical illustration or "Beautiful Collisions", wants an artwork remade in a different painting style, or wants to invent a new generative art style — even if they never name a style.
---

# Generative painting

One engine, several painting styles. Every film is a sequence of finished **plates** (paintings drawn once by code, then held), edited with hard cuts, with rare deterministic particle motion and a quiet score. The **style** decides how a plate's drawing becomes paint, and it can be set per film or per plate.

All paths are relative to this skill's folder.

## 1. Choose a style

| Style | Look | Best for | Read |
|---|---|---|---|
| `watercolour` | translucent glazes that bleed and mix like pigment; graphite and ink lines, hatching and speckle on varied paper; antique scientific illustration colliding with editorial design | botanical, archival, delicate or tactile subjects; pale papers, diagrams, grounds under text | `styles/watercolour/STYLE.md` |
| `pointillism` | thousands of distinct divided-colour dabs; form, light and edges built from dot density and colour families | luminous, textural, "made of dots" work; forms that dissolve into points; repainting an existing film | `styles/pointillism/STYLE.md` |
| `charcoal` | directional charcoal strokes and smudge on toothy paper, eraser highlights, one red conté accent | weight, tension, grief, aftermath, figures; things drawn on stroke by stroke | `styles/charcoal/STYLE.md` |
| `sketch` | graphite hatching and searching contours, or crisp pen and ink; red pencil accent | calm openings, notes, diagrams, cracks, counts; draw-on | `styles/sketch/STYLE.md` |
| `woodcut` | relief print: standing ink, carved paper, gouged greys, a misregistered red block, wood grain | force, violence, declaration: lightning, a charge, a hammer, stairs | `styles/woodcut/STYLE.md` |
| `cel` | 2D animation: flat paint, hard cel shadow, thick-thin ink line, line boil on twos | gauges, clocks, machines, impacts; anything with moving parts | `styles/cel/STYLE.md` |
| **mixed** | any of the above chosen per plate, switched at cuts | montages about variety or change, emotional arcs, launches | `references/choosing-and-mixing-styles.md` |

Look at each style's `examples/` before choosing. If the user doesn't name a style:
- ask when the choice matters;
- otherwise choose watercolour for delicate or archival briefs and pointillism for luminous or textural ones;
- say which you picked.

`references/choosing-and-mixing-styles.md` has the decision table and the rules for when a cut should change material.

Run `scripts/new-film.sh --list` to see the installed styles. New styles plug in without changing the engine (`references/adding-a-style.md`).

## 2. Shared workflow (every style)

1. **Plan the shot list before code.**
   - Default length is 26 s at 24 fps (624 frames), about 21 shots.
   - Columns: shot · frames · archetype · subject · ground/palette · material and mark treatment · sound.
   - Follow the rhythm template and the cut rule in `references/editing.md`:
     - a dense opener, which also closes the loop;
     - a near-empty breath;
     - alternating dark/pale and crowded/sparse;
     - two particle passages;
     - an "almost nothing" beat;
     - a hero plate and then a crop of it;
     - a 3-second monument;
     - a quiet archival close;
     - a repeat of the opener.
   - Every ordinary cut changes at least 3 of 6 axes.
   - This pattern is the house default, not a law: `references/experimenting.md` says what is fixed and what to vary.
   - Show the table to the user.
2. **Scaffold:** run `scripts/new-film.sh --style <style> <project-dir> <film-id>`, then `npm run export` once to confirm the machine works. Each style's demo exercises every feature.
3. **Paint plates:**
   - Write one file per painting in `src/scenes/` and register it in `src/scenes/index.js`.
   - Start from the closest recipe in `styles/<style>/scene-library/`; the recipes copy straight in, and any scene works in any style.
   - Draw with the kit and helpers in `references/drawing-kit.md`. Build silhouettes before texture.
   - Run `npm run plates -- --only <id>`, then **look at `out/<film>/plates/<id>.png` at full size.**
   - Fix generic or empty plates before moving on.
4. **Set style-specific settings:**
   - Pointillism: `PLATES[id].material` (profile, coverage, dot size).
   - Watercolour: palette and paper choices inside each scene.
   - Mixed: `PLATES[id].style` per plate.
   - See the style's `STYLE.md`.
5. **Add motion (optional):** `dust`, `radial`, `school` or `jelly` particles (`references/editing.md` → Motion). The replay materials also have motion of their own: **draw-on** (the drawing appears stroke by stroke) and **boil** (the hand-drawn 2D line). See `references/motion-in-the-medium.md`.
6. **Sound:** the soft score is the default, about −22 LUFS (`references/sound.md`). Each shot declares a `sound` character.
7. **Export and verify:**
   - Run `npm run export`. It refuses to finish if any check fails.
   - Run `python3 tools/cut_audit.py out/<film>`.
   - Do the visual review in `references/verifying.md`.
   - Report concrete per-shot observations, and say plainly what you measured versus actually watched or listened to.

**A single painting** is the same flow with one shot covering all frames; the deliverable is the plate PNG from `npm run plates`.

**16:9, on-screen text or characters:** plates can be any size (`plateSetup(…, 1920, 864)`). Read `references/widescreen-and-titles.md` for the compositor, the phrase track, glyph-mask contrast, locked fonts and pixel characters.

## 3. Rules that hold in every style

- Integer frames are the source of truth. Plates are painted once and cached, so held frames are bit-identical. Particles are pure functions of time, with no per-frame re-randomising.
- All randomness goes through the seeded kit (`p.random`/`k.R`) so a plate's seed controls it. Never use `Math.random()` in a scene.
- By default there's no text inside frames. When a brief needs words, use a fixed-anchor phrase track or title cards (`references/widescreen-and-titles.md`), never text painted into plates.
- For square films, the 1080 MP4 is a Lanczos upscale of the 600 master. Always call it that. Call a film "rendered at 1080p" only when its plates really were.
- The default sound is quiet and low. Use the livelier score only on request.

## 4. Files

| Path | Contents |
|---|---|
| `engine/` | the runnable project copied into every film: `src/` (capture, pointillism, `materials/` charcoal · sketch · woodcut · cel, kit, sea, ocean, particles, renderer, scores), `scripts/export.mjs`, `tools/` (cut audit, ΔE, playback check) |
| `styles/<style>/STYLE.md` | how the style looks, how its material works, how it mixes, its hard rules |
| `styles/<style>/demo/` | the style's demo `film.js` and scenes (used by `new-film.sh`) |
| `styles/<style>/scene-library/` | finished paintings to copy and adapt |
| `styles/<style>/examples/` | contact sheets of finished films |
| `styles/_template/` | the starting point for a new style |
| `styles/watercolour/style-dna.md`, `archetypes.md` | palette families and composition archetypes |
| `styles/pointillism/material.md`, `translating.md` | material parameters and calibration; repainting a film |
| `references/choosing-and-mixing-styles.md` | which style for which brief; when a cut changes material |
| `references/motion-in-the-medium.md` | draw-on (with `drawOnTail`) and line boil |
| `references/experimenting.md` | invariants versus style laws versus defaults; the dials worth changing first |
| `references/editing.md` | rhythm, cut rule, archetypes, motion |
| `references/drawing-kit.md` | the drawing kit, p5.brush behaviour, determinism rules |
| `references/widescreen-and-titles.md` | 16:9 at 1080p, phrase tracks, text contrast, fonts, pixel characters |
| `references/sound.md` | score characters and seeds |
| `references/verifying.md` | automated checks, compression, audit, review checklist |
| `references/adding-a-style.md` | how to add a new painting style |
