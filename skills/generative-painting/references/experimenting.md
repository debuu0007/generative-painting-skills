# Experimenting: what is fixed, what is a default, and what to try

Every film this skill has made follows the same pattern: open dense and saturated, cut hard, alternate dark and pale, hold still, move rarely, stay quiet. **Most of that pattern is a default, not a law.** This page separates the three and says which dials give the most for the least work.

## Tier 1: invariants (never break; they keep the tool working)

| Invariant | Why |
|---|---|
| Integer frames; plates painted once and cached | held frames stay bit-identical, and seeking is exact |
| All randomness through the seeded kit (`p.random`, `k.R`); never `Math.random()` | a seed reproduces a plate forever |
| Motion is a pure function of time; no per-frame simulation or re-randomising | any frame renders the same in any order |
| p5 2.3.3 + p5.brush 2.2.3 pinned | the look depends on these exact builds |
| `npm run export` checks pass | holds, motion, cuts, determinism and encode fidelity are proven, not assumed |
| Honest reporting | say "upscale" when it is one; say what you measured versus actually watched or heard |

## Tier 2: style laws (break them only on purpose, and say so)

| Law | What you lose if you break it |
|---|---|
| **Tactile, never digital:** real glazes, dabs and lines; no blur-as-watercolour, glow, noise filters or stock images | the hand-made look; it turns into a filter |
| **Each plate is internally controlled:** one palette family, 3–6 colours, one focal weight | the chaos moves inside frames, where it reads as mess instead of collision |
| **Silhouette first:** a subject reads at about 96 px before texture is added | subjects turn into texture soup |
| **Cuts are collisions:** hard cuts, no fades or zooms-as-transitions | the rhythm and the "archive" feel |
| **Stillness is the default:** motion is rare and meaningful | motion stops meaning anything |

## Tier 3: the house pattern (defaults you are free to change)

These are listed roughly by **leverage per unit of work**. Start at the top.

| Dial | Default | Why it works | Try instead | Watch for |
|---|---|---|---|---|
| **Shot order** (no repainting needed) | a contrast chain: dense opener → breath → alternate | every cut maximises difference | order by colour temperature; build from empty to dense; group by subject | cuts that change under 3 axes (`tools/cut_audit.py`) |
| **Opener** | dense, saturated, dark or electric | hooks in the first half-second; doubles as the loop point | open on "almost nothing" and let the first collision be the hook; open pale | a slow start on social feeds |
| **Ground-value alternation** | dark ↔ pale on most cuts | the strongest single axis | run three pales in a row, then one black hit; a mid-tone stretch | flatness; the audit undercounts pale-to-pale hue changes, so check by eye |
| **Palette families** | the palette families in `styles/watercolour/style-dna.md` | tested, internally consistent | derive a family from your subject; a monochrome film where only value and marks change | muddy mixes (fills mix like pigment), and low alpha vanishing on paper |
| **Cut rule strength** | ≥ 3 of 6 axes | collisions without chaos | 2 for a calm, meditative film; 5 for an aggressive one | the audit's thresholds are conservative |
| **Rhythm** | 12–42-frame shots, one ~72-frame monument | quick but readable | one long take per plate; a metronomic 12-frame run; accelerate into a climax | shots under 10 frames stop reading as paintings |
| **Material** | one style per film | coherence | mix materials (`choosing-and-mixing-styles.md`); pointillist profiles per shot; `refScale` from 0.3 (pure divided colour) to 1 (follows the underpainting) | arbitrary-looking alternation |
| **Motion** | two particle passages, pure functions of `u` | rare, meaningful movement | an analytic push or pan on a still plate; a character that expands and gathers; a new particle kind | solid silhouettes left under moving dots; drift in "held" frames |
| **Format** | 600² square, 24 fps, about 26 s, loop | social-friendly and fast to render | 16:9 1920×1080 with letterbox, a finite ending, other lengths (`widescreen-and-titles.md`) | square coordinates in scenes; line weight at 1080p |
| **Text** | none inside frames | the paintings speak | a fixed-anchor phrase track over the cuts; title cards (`widescreen-and-titles.md`) | contrast under the glyphs; the anchor jumping between shots |
| **Sound** | quiet soft score, about −22 LUFS, one character per shot | supports the image and never shouts | re-roll `AUDIO_SEED`; the livelier `score.js`; a finite score that resolves | loud spikes at reveals, and wrap clicks |

## How to run an experiment

1. **Change one dial at a time.** Keep every plate seed fixed, so the only difference is the dial.
2. **Branch cheaply.** Copy `film.js` to try an order or rhythm; reordering needs no repainting. Paint single plates with `npm run plates -- --only <id>`.
3. **Compare contact sheets side by side at about 96 px and at full size.** The contact sheet is where a film is won.
4. **Measure, then look.** Run `tools/cut_audit.py` for the axes and the export checks for determinism. Then look at the frames yourself and write concrete observations.
5. **Keep a log** (a table in the project README): dial, before, after, verdict. Good experiments become new defaults or new recipes in the scene library.

## Good first experiments

- Re-order an existing film to open on its emptiest plate.
- Make a monochrome variant: one palette family, where only value, density and marks change.
- Make a calm variant with the cut rule at 2 axes and 36–60-frame shots.
- Mix one pointillist plate into a watercolour film at its energy peak.
- Add a phrase track: one short sentence split across three phrases, anchored over the cuts.
- Invent a new particle kind for your subject, for example birds lifting off a branch.
