# p5.brush notes: behaviour, determinism, kit API

Pinned: **p5 2.3.3 + p5.brush 2.2.3**, served as unmodified UMD builds. The look depends on these exact versions, so don't upgrade casually. If you must, re-render the demo and compare its plate hashes against the originals first.

## Library behaviour you will hit

- **Fills mix like pigment.** `brush.fill()` over a colour blends toward the mix: yellow on cobalt reads green, hot pink on dark green reads dark, white at alpha 200 over green reads mint. To keep a light or pure colour on a dark ground, paint `k.reserve(pts, lightColour)` first (a flat `brush.wash` underlayer), then glaze on top. This is the single most important trick for dark plates.
- **Low fill alpha disappears on light paper.** Below ~60 it barely shows. Build depth by overlapping several glazes at 130–200 instead.
- `brush.wash()` is flat and opaque-ish, with no bleed. Use it for reserves, crisp tiny accents (the magenta squares in "almost nothing") and dots.
- `endShape(true)` and `endShape(CLOSE)` both close the shape. Circle sizes are **radii**.
- `brush.scaleBrushes(3)` is called once per context in `plateSetup` (6 for plates wider than 1000 px). Never call it twice (it compounds).
- **Huge shapes misbehave.** A polygon far outside the canvas (a planet of radius 1600 centred below the frame) can silently vanish, so use `k.arcBand`. Very large `glaze()` fills also grow spiky triangular bleed; fill big bands with `reserve()` washes instead.
- Brushes you can use: `'pen'` (crisp ink), `'HB'`, `'2H'` (faint), `'2B'` (soft dark), `'crayon'` (dry striations), `'marker'`. `brush.field('waves')` + `brush.flowLine(x, y, len, angle)` makes flowing ink scribbles. Call `brush.noField()` afterwards.
- WEBGL origin is the centre: every scene starts `p.translate(-p.width/2, -p.height/2)` so it can draw in 0..600 (or 0..`k.W` × 0..`k.H` for other plate sizes).

## Determinism and isolation (why the engine is built this way)

- **One isolated document per plate** (`plate.html` in an iframe). p5.brush keeps module-level state (scale, fields, fill/hatch state), so painting two plates in one context leaks state between them.
- **Seed before setup.** `public/plate-hooks.js` calls `randomSeed(seed)` and `noiseSeed(seed)` in p5's `presetup` hook, and p5.brush follows p5's RNG. Route all randomness through `p.random`, `p.randomGaussian` or the kit's `R`/`G`/`pick`/`chance`. Never use `Math.random()` in a scene.
- **Capture after the flush.** The hook's `postdraw` runs after p5.brush flushes, copies the WEBGL canvas into a 2D canvas, and rejects blank or uniform plates. The renderer then hashes each plate. `ready` rejects on any error, so there are never silent blank frames.
- **Set `pixelDensity` after `createCanvas`.** In p5 2.x, `createCanvas` replaces the renderer, and a density set before it is lost. `plateSetup` already does this in the right order.
- **Scenes paint once** (`noLoop`). Frames are `drawImage` of cached plates, plus analytic particles. A plate painted at density 3 (1800 px) is downsampled for its own shot and cropped at full resolution for the crop shot.
- **Freeze seeds.** When placement matters, try a few seeds, pick one, and write it in `PLATES`. Never re-roll during export.
- **Supplied raw sketches** (someone's global-mode p5.brush code): port them to instance mode (`p.` prefixes) without changing any drawing call, argument or order. Add `p.pixelDensity(1)` after `createCanvas`. See `06/08/20` in the scene library for examples.

## Kit API (`src/kit.js`, `const k = createKit(p, brush)`)

| Call | What it makes |
|---|---|
| `k.R(a,b)`, `k.G(mean,sd)`, `k.pick(arr)`, `k.chance(p)` | seeded random helpers |
| `k.polar(x,y,deg,r)`, `k.lerp`, `k.mix(hexA,hexB,t)` | geometry and colour helpers |
| `k.petalOutline(x,y,angleDeg,len,wid,{asym,base,widest,notch,ruffle,bend,jitter,n})` | asymmetric tapered blade (petal, leaf, feather, flame, fin) |
| `k.leafOutline(x,y,angle,len,wid)` | pointed blade |
| `k.petalCircle(x,y,r,n,irregular)` | a hand-drawn irregular ring (discs, centres, planets) |
| `k.shrink(pts,k,cx,cy)`, `k.wobble(pts,amt)`, `k.centroid(pts)` | inner glaze shapes, looseness |
| `k.shape(pts,curvature,close)` | raw brush shape (curvature 0 gives hard polygons) |
| `k.glaze(pts,color,alpha,{bleed,dir,texture,border,curvature})` | watercolour glaze with bleed and granulation |
| `k.reserve(pts,color,alpha)` | opaque underlayer that keeps light colours pure on dark grounds |
| `k.contour(pts,{brush,color,weight,open,jitter})` | broken graphite or ink outline (`open` = fraction drawn) |
| `k.hatchIn(pts,{brush,color,weight,dist,angle,rand})` | hatching clipped to a form |
| `k.line(x1,y1,x2,y2,{brush,color,weight})` | single mark (veins, radials, rules, construction) |
| `k.stem(pts)`, `k.stemPath(x0,y0,x1,y1,bow,steps)`, `k.strip(path,width,taper)` | stems, tendrils, ribbons (glaze the `strip` polygon) |
| `k.stipple(cx,cy,rx,ry,count,color,{weight,len})` | gaussian pigment speckle |
| `k.scatter(count,minDist,x0,y0,x1,y1)` | dart-thrown placement (no grid) |
| `k.ground([[color,alpha],…],{texture,border,bleed})` | full-square ground glazes |
| `k.stains(color,alpha,count,rmin,rmax,{x,y})`, `k.fibers(color,count)` | static paper character |
| `k.flower(x,y,{petals,len,wid,colors,passes,alpha,reserve,edge,veins,contour,center,centerDark,stamens,…})` | a full radial cluster, all layers |
| `k.W`, `k.H` | the plate's logical size (600×600 unless `plateSetup` was given another size) |
| `k.arcBand(cx,cy,r0,r1)` | the visible band of a circle much larger than the plate (horizon, planet limb, ridge); fill it with `reserve`, not a large `glaze` |
| `plateSetup(p, brush, density, bg, w = 600, h = 600)` | canvas `w×h` WEBGL, density, DEGREES, `scaleBrushes(3)` (6 above 1000 px wide), background, `noLoop` |

The usual layer order in a plate: `ground` → `stains`/`fibers` → large under-forms (reserve + glaze) → stems and leaves → main forms (reserve + 2–3 glazes) → accents → contours, hatching, veins → structure (grids, construction lines, scribbles) → stipple and filaments last.
