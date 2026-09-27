# Choosing a style, and mixing styles in one film

Read this when the brief doesn't name a style, or when one film should use more than one material.

## 1. What each material is good at

| | Watercolour | Pointillism |
|---|---|---|
| **Reads as** | translucent glaze, graphite, ink on paper | thousands of divided-colour dabs |
| **Strong at** | pale papers, archival and diagram plates, fine ink line, engraving, delicate translucency, near-empty "breath" plates | saturated luminous fields, dense masses (reef, crowd, meadow, landform), glowing textures, anything "made of points" |
| **Line language** | crisp: contours, hatching, construction lines, scale bars | dotted chains; fine diagrams get soft |
| **Motion** | particles read as pigment flecks leaving a painting | particles are *the same material* as the plate, so a form can dissolve into dots and back with no change of medium |
| **Under text** | calm grounds keep type legible | busy; keep dots out of the text band or use an airy profile |
| **Dark grounds** | need `reserve()` underlayers (fills mix like pigment) | need more coverage (every gap shows the ground) |
| **Encoding** | robust | 4:2:0 video halves colour resolution and blends neighbouring complementary dots. Enlarge dots for big frames (`dotScale`) and judge the encode in YUV. |
| **Cost** | seconds per plate at 600² | ~5–20 s per plate at 600², 45–70 s at 1920×864 |

## 2. One style or several?

**Default: one style for the whole film.** The collision already comes from the six cut axes (ground value, palette, density, scale, mark organisation, composition). One material keeps the film reading as the work of one artist.

Choose from the brief:

| Brief sounds like | Choose |
|---|---|
| botanical, specimen, archive, notebook, delicate, quiet, "antique science" | watercolour |
| luminous, glowing, textured, reef, stars, crowds, "made of dots", Seurat | pointillism |
| an existing watercolour film to be "remade" | pointillism translation (`styles/pointillism/translating.md`) |
| a message about variety, discovery, many worlds; a launch; a montage with a sentence over it | **mixed** (below) |
| undecided and low stakes | watercolour, and say you picked it |

## 3. Mixed films: when a cut should change material

Mixing works when the change of material *means* something: variety, discovery, a transformation. It fails when it looks like indecision. A finished 22-second montage used these rules.

**See it:** `mixed-film-example.jpg` is the 20-shot montage of a 1920×1080 film: 5 pointillist plates (shots 05, 09, 13, 15, 19) among 15 watercolour, ink and engraving plates, with the sentence "There’s / much more to / discover" on a fixed anchor over the cuts. Notice the lower-edge motif (a limb, ridge or horizon) carrying through most shots.

1. **Watercolour is the body; pointillism is punctuation.** Use about one pointillist plate in four (5 of 20 in that film), never more than two in a row, and space them 2–4 shots apart. If pointillism becomes the default, make it the film's style instead.
2. **Change material only at a hard cut.** Never mid-shot. The one exception is a particle passage, where the plate's own marks move.
3. **A material switch counts as only one axis (M).** It still needs two more axes to change. Ground value is the strongest partner: watercolour pale paper → pointillist dark field hits hardest.
4. **Put pointillism where energy and saturation peak:** dense ridges, glowing fields, crowds, the "wow" beat. Keep watercolour or ink where the eye has to read or rest: text-bearing grounds, diagrams, faces at small size, the near-empty breath.
5. **If a form will move as dots, paint that shot in pointillism.** Stillness then turns into motion without any change of medium: a character that loosens into points and gathers back is one continuous material.
6. **Hold one thing constant across a material switch:** a fixed text anchor, a lower-edge motif (a ridge, horizon or limb that runs through several shots), or a palette bridge. A **motif-match cut**, where the same composition comes back in a new material and a new value, is the most striking collision the mix offers. Use it deliberately, two or three times at most.
7. **Vary the pointillist profile between its appearances** (`clustered` → `fine` → `airy` → `directional`). Otherwise every dotted shot feels identical, which is the mark-organisation (M) axis again.

### Setting it up

The engine picks the material per plate:

```js
// film.js
export const STYLE = 'watercolour';               // the film's dominant material (and the default)
export const PLATES = {
  'navy-horizon':  { seed: 18, density: 1 },       // watercolour (inherits STYLE)
  'cluster-ridge': { seed: 27, density: 1, style: 'pointillism',
                     material: { profile: 'clustered', refScale: 0.5 } },
};
```

- Particles on a shot follow the style of that shot's plate.
- The contact sheet and `checks.json` work unchanged.
- Label the material per shot in your shot table (for example "watercolour + ink", "pointillism (coarse)"), so the audit and the reader can see the pattern.

## 4. Planning checklist for a mixed film

- [ ] The shot table has a **material** column, and pointillist shots are spaced out.
- [ ] Every material switch also changes ground value, or two other axes.
- [ ] Text, diagrams and small faces sit on watercolour or ink grounds, or on a deliberately quiet pointillist band.
- [ ] Anything that moves in dots is pointillist in its still frames.
- [ ] One constant (text anchor, motif or palette) carries the eye through the switches.
- [ ] The pointillist plates use different profiles.
- [ ] Look at the contact sheet at about 96 px: the pattern should read as rhythm, not random alternation.
