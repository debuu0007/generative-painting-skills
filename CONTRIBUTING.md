# Contributing

Thanks for helping these skills grow. The most valuable contributions are **new painting styles**, **new scene-library paintings**, and **fixes that keep films deterministic**.

## Ground rules

- **Determinism is non-negotiable.** Route all randomness through the seeded kit (`p.random`, `k.R`) or `makeRng(seed, salt)`, never `Math.random()`. Plates are painted once. Motion is a pure function of time.
- **Don't change existing output by accident.** Engine changes must leave both demos pixel-identical. Scaffold each demo, export it before and after your change, and compare the plate hashes in `out/<id>/manifest.json`. If a change is *meant* to alter output, say so in the PR and include before/after contact sheets.
- **Pinned libraries stay pinned** (p5 2.3.3, p5.brush 2.2.3) unless the PR is specifically about upgrading them, with hash comparisons.
- **Tactile, never filtered.** A style that blurs, posterises or adds noise to another style's output is a filter, not a style.
- **Everything is generated.** Don't add bitmaps, scans, samples or fonts into frames. Example contact sheets in `examples/` are fine.

## Adding a style

Follow `skills/generative-painting/references/adding-a-style.md` and start from `styles/_template/`. A style PR includes:

1. `styles/<name>/STYLE.md` (rules, parameters, limits, mixing guidance), `demo/`, and an `examples/<name>-contact.jpg`.
2. The material registered in `engine/src/plate-page.js`, and its renderer in `engine/src/<name>.js`.
3. Evidence:
   - `npm run export` passes on the demo;
   - for replay styles, the captured watercolour is pixel-identical to painting without the recorder;
   - the contact sheet reads as the style at about 96 px.
4. A row in the style tables of `SKILL.md` and the README.

## Adding scene-library paintings

- One painting per file, drawn with the kit.
- Name the archetype it demonstrates, in `editing.md`, `archetypes.md` or the style's docs.
- Paintings must be original, or ports of sketches you have the right to share. Say which in the file header.
- Include a plate PNG in the PR description.

## Before opening a PR

- [ ] Both demos export with all checks passing.
- [ ] Hashes are unchanged, or intentional changes are shown.
- [ ] The docs are updated where behaviour changed (`SKILL.md` stays the short entry point; details go in `references/`).
- [ ] There's no personal data, absolute paths or machine-specific settings.
