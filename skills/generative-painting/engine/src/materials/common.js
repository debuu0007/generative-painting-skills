/** Shared core for the replay materials (charcoal, sketch, woodcut, cel).
 *
 * A replay material walks the recorded p5.brush ops (capture.js) in order and paints each one with
 * its own marks. The recorder guarantees the underlying drawing (what and where) is the scene's
 * own; the material decides only how it becomes paint.
 *
 * Also here:
 *  - op geometry (identical to the pointillist replay, so every material agrees on shapes);
 *  - seeded value-noise fields for paper tooth and wood grain (physical surfaces, fixed per plate);
 *  - the tooth deposition model: light pressure catches only paper peaks, heavy pressure fills the
 *    valleys. It is applied to the layer of marks, never to the picture as a filter;
 *  - `runPainter`, which gives any painter draw-on snapshots (the drawing appearing stroke by
 *    stroke) and boil variants (2D line boil) as extra cached canvases. */
import { makeRng } from '../rng.js';
import { parseColor, rgbToHsl, catmull, densify, circlePoly, area, bbox, axis, rasterMask, inside } from '../pointillism.js';

export { parseColor, rgbToHsl, area, bbox, axis, rasterMask, inside, makeRng };

/** Polygon and/or path of an op, in plate coordinates (matches paintPointillist). */
export function opGeometry(op, R) {
  let poly = null; let path = null;
  if (op.type === 'shape') {
    const pts = op.curv > 0 ? catmull(op.pts, op.curv, true) : densify(op.pts, true, 3);
    poly = pts; path = op.closed ? pts.concat([pts[0]]) : (op.curv > 0 ? catmull(op.pts, op.curv, false) : densify(op.pts, false, 3));
  } else if (op.type === 'circle') {
    poly = circlePoly(op.c, op.r, op.irr, R); path = poly.concat([poly[0]]);
  } else if (op.type === 'arc') {
    const sweep = (((op.a1 - op.a0) % 360) + 360) % 360; const k = Math.max(6, Math.ceil(sweep / 4));
    path = Array.from({ length: k + 1 }, (_, i) => { const a = ((op.a0 + (sweep * i) / k) * Math.PI) / 180; return [op.c[0] + op.r * Math.cos(a), op.c[1] - op.r * Math.sin(a)]; });
  } else if (op.type === 'path') {
    path = op.curv > 0 ? catmull(op.pts, op.curv, false) : densify(op.pts, false, 2);
  } else if (op.type === 'flow') {
    const k = Math.max(4, Math.ceil(op.len / 3)); path = []; let [x, y] = op.c; let a = (op.dir * Math.PI) / 180; const ph = R.float(0, 6.28);
    for (let i = 0; i <= k; i++) { path.push([x, y]); a += Math.sin(ph + i * 0.35) * 0.09; x += Math.cos(a) * (op.len / k); y -= Math.sin(a) * (op.len / k); }
  }
  return { poly, path };
}

/** Relative luminance (0 black .. 1 white) of a CSS colour. */
export function lum(color) {
  const [r, g, b] = parseColor(color).map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
/** Perceptual lightness 0..1 (sRGB-ish), better for "how dark should this be drawn". */
export function lightness(color) { return Math.cbrt(lum(color)); }
export function hsl(color) { return rgbToHsl(parseColor(color)); }
/** Warm saturated reds/oranges: the anger accent that survives into monochrome media. */
export function isWarmAccent(color, { minS = 0.42, hueMax = 38 } = {}) {
  const [h, s, l] = hsl(color);
  return s >= minS && (h <= hueMax || h >= 335) && l > 0.18 && l < 0.82;
}

/** Seeded value noise in [0,1]: `scale` px cells, optional anisotropy (sx, sy multipliers). */
export function noiseField(w, h, seed, { scale = 3, octaves = 2, sx = 1, sy = 1, white = 0.35 } = {}) {
  const R = makeRng(seed, 911);
  const out = new Float32Array(w * h);
  let amp = 1; let total = 0; let sc = scale;
  for (let o = 0; o < octaves; o++) {
    const cx = sc * sx; const cy = sc * sy;
    const gw = Math.ceil(w / cx) + 2; const gh = Math.ceil(h / cy) + 2;
    const grid = new Float32Array(gw * gh); for (let i = 0; i < grid.length; i++) grid[i] = R.next();
    for (let y = 0; y < h; y++) {
      const gy = y / cy; const y0 = Math.floor(gy); const ty = gy - y0; const sy2 = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < w; x++) {
        const gx = x / cx; const x0 = Math.floor(gx); const tx = gx - x0; const sx2 = tx * tx * (3 - 2 * tx);
        const a = grid[y0 * gw + x0]; const b = grid[y0 * gw + x0 + 1]; const c = grid[(y0 + 1) * gw + x0]; const d = grid[(y0 + 1) * gw + x0 + 1];
        out[y * w + x] += amp * (a + (b - a) * sx2 + (c - a) * sy2 + (a - b - c + d) * sx2 * sy2);
      }
    }
    total += amp; amp *= 0.5; sc *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] = (out[i] / total) * (1 - white) + R.next() * white;
  return out;
}

export function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/** Tooth deposition: a layer of marks (colour in RGB, pressure in alpha) meets the paper surface.
 * out = clamp(a·gain − g·tooth·(1 − a)), where tooth is high in the paper's valleys: light pressure
 * leaves the valleys white, heavy pressure fills them. Returns the processed layer canvas (new). */
export function applyTooth(layer, tooth, { g = 0.9, gain = 1.15 } = {}) {
  const w = layer.width; const h = layer.height;
  const out = makeCanvas(w, h); const octx = out.getContext('2d');
  const img = layer.getContext('2d').getImageData(0, 0, w, h); const px = img.data;
  for (let i = 0, j = 3; i < tooth.length; i++, j += 4) {
    const a = px[j] / 255; if (!a) continue;
    const v = a * gain - g * tooth[i] * (1 - a);
    px[j] = v <= 0 ? 0 : v >= 1 ? 255 : v * 255;
  }
  octx.putImageData(img, 0, 0);
  return out;
}

/** Trace a polygon path on a 2D context (closed). */
export function tracePoly(ctx, poly) { ctx.beginPath(); ctx.moveTo(poly[0][0], poly[0][1]); for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]); ctx.closePath(); }
export function tracePath(ctx, path) { ctx.beginPath(); ctx.moveTo(path[0][0], path[0][1]); for (let i = 1; i < path.length; i++) ctx.lineTo(path[i][0], path[i][1]); }

/** Offset a polygon outward from its centroid by `d` px (cheap dilation for soft clip edges). */
export function dilate(poly, d) {
  let cx = 0; let cy = 0; for (const [x, y] of poly) { cx += x; cy += y; } cx /= poly.length; cy /= poly.length;
  return poly.map(([x, y]) => { const dx = x - cx; const dy = y - cy; const L = Math.hypot(dx, dy) || 1; return [x + (dx / L) * d, y + (dy / L) * d]; });
}

/** Random point inside a polygon (rejection sampling in its bbox; mask for big shapes). */
export function pointIn(poly, R, M = null, tries = 30) {
  const [x0, y0, x1, y1] = bbox(poly);
  for (let t = 0; t < tries; t++) { const x = R.float(x0, x1); const y = R.float(y0, y1); if (M ? M.inside(x, y) : inside(x, y, poly)) return [x, y]; }
  return null;
}

/** Background colour of the plate as CSS. */
export function backgroundOf(log, fallback) {
  if (!log.background) return fallback;
  return Array.isArray(log.background) ? `rgb(${parseColor(log.background).join(',')})` : log.background;
}

/** Full-frame ground rectangles are handled as paper/ground tone, not as a drawn shape. */
export function isGroundOp(op, poly, W, H) { return op.type === 'shape' && op.rect && poly && area(poly) > W * H * 0.9; }

/** Run a painter with optional draw-on snapshots or boil variants.
 * `make(variant)` returns a painter { run(ops, hooks), compose() → canvas }.
 * - drawOn = K: painted twice; the first pass counts marks, the second composes K snapshots at
 *   equal mark intervals (the last is the finished plate). Stroke order is the scene's layer order.
 * - boil = V: V complete paintings with different jitter (variant 0 is the reference plate). */
export function runPainter(make, ops, { drawOn = 0, boil = 0, drawOnTail = null } = {}) {
  if (boil > 1) {
    const frames = []; let stats = null;
    for (let v = 0; v < boil; v++) { const P = make(v); stats = P.run(ops, {}) || stats; frames.push(P.compose()); }
    return { canvas: frames[0], frames, stats: { ...stats, boil } };
  }
  if (!drawOn) { const P = make(0); const stats = P.run(ops, {}); return { canvas: P.compose(), stats }; }
  // drawOnTail = [nOps, kSnapshots]: the last nOps ops (e.g. the key stroke drawn last) get their own
  // k snapshots, so a few important marks are seen being drawn instead of appearing in one frame.
  const tailStart = drawOnTail ? ops.length - drawOnTail[0] : Infinity; const kTail = drawOnTail ? drawOnTail[1] : 0;
  let head = 0; let tail = 0; let cur = 0;
  const P1 = make(0); P1.run(ops, { op: (i) => { cur = i; }, mark: () => { if (cur >= tailStart) tail++; else head++; } });
  const kHead = drawOn - kTail; const thresholds = [];
  for (let s = 1; s <= kHead; s++) thresholds.push((head * s) / kHead);
  for (let s = 1; s < kTail; s++) thresholds.push(head + (tail * s) / kTail);
  const P2 = make(0); const frames = []; let count = 0; let next = 0;
  const stats = P2.run(ops, { mark: () => { count++; while (next < thresholds.length && count >= thresholds[next] - 1e-9 && frames.length < drawOn - 1) { frames.push(P2.compose()); next++; } } });
  const total = head + tail;
  frames.push(P2.compose());
  return { canvas: frames[frames.length - 1], frames, stats: { ...stats, marks: total, drawOn } };
}
