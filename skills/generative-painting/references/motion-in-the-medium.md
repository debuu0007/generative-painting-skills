# Motion that belongs to the medium: draw-on and boil

The replay materials (charcoal, sketch, woodcut, cel) can hand back **extra drawings** as well as the finished plate. They're painted once, cached like any plate, and chosen per frame, so every frame stays a pure function of its number.

## Draw-on: the drawing appears stroke by stroke

```js
PLATES['specimen-plate'] = { seed: 1909, density: 1, drawOn: 12 };                   // 12 cumulative drawings
['04', 96, 120, 'specimen-plate', 'Sparse specimen sheet', 'specimen', { drawOn: true }],
```

- The material paints the plate twice. The first pass counts marks; the second takes K snapshots at equal mark intervals. The last snapshot is the finished plate.
- Frame `local` shows snapshot `min(K − 1, floor(local / 2))`, one new drawing every two frames ("on twos"), like hand-drawn animation. After `2K` frames the finished drawing holds, and the export checks the hold is bit-identical.
- **Stroke order is the scene's layer order.** Write the scene the way an artist would draw it: big lines first, tone, details, and the key mark last.
- **`drawOnTail: [nOps, k]`** gives the last `nOps` recorded ops their own `k` drawings. Without it, a few important strokes drawn after thousands of tone strokes would appear in a single frame. In the anger film, the red path up the mountain is 24 short strokes with `drawOnTail: [26, 5]`, so it's seen climbing.
- Works with charcoal and sketch (natural), and with woodcut and cel.
- Sound tip: a soft pencil or charcoal scratch under the draw-on helps it read.

## Boil: the hand-drawn line never quite holds still

```js
PLATES['pressure-gauge'] = { seed: 7104, density: 1, style: 'cel', boil: 3 };
['04', 84, 108, 'pressure-gauge', 'Pressure', 'measured', { boil: true }],
```

- V variants (3 is classic) re-draw every outline with fresh smooth jitter. Geometry and colour are identical; only the line moves. Frame `f` shows variant `floor(f / 2) % V`.
- Use it on cel shots with animated parts. It makes still 2D feel drawn, and it's a declared motion, so it's exempt from the static-hold check.
- A repeat of a boil shot matches its source when both start on the same variant.

## Checks

`scripts/export.mjs` verifies:
- a draw-on shot shows exactly `min(K, ceil(frames / 2))` distinct drawings, on twos, followed by an exact hold;
- boil shots change;
- out-of-order seeks match sequential capture.

## When to use which

| Moment | Motion |
|---|---|
| calm opening, a thought forming, a plan, a crack spreading, a count accumulating | draw-on (sketch, charcoal) |
| a gauge, a clock, a machine, an impact, anything "animated" | boil (cel) + overlays on twos |
| a form dissolving or gathering | particles (`editing.md`); in pointillism the dots are the same material as the plate |
