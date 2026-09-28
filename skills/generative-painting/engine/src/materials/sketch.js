/** Sketch: graphite pencil (or pen-and-ink) drawing, replayed from the recorded drawing.
 *
 *   fill / glaze   → hatching. Spacing tightens with value; a second (cross) direction appears for
 *                    mid-darks and a third for the darkest areas. Lines are hand-drawn: slightly
 *                    bowed, pressure-varied, sometimes overshooting the form.
 *   (any fill)     → a light "construction" outline of the form, the way sketches keep their edges.
 *   stroke / line  → searching contours: two or three offset passes with overshoot at the ends.
 *   hatch          → hatching along the recorded angle.
 *   warm reds      → red pencil on its own layer.
 * medium: 'graphite' (grey, paper tooth breaks light strokes) | 'ink' (near-black, crisp). */
import { opGeometry, lightness, isWarmAccent, noiseField, makeCanvas, applyTooth, tracePoly, dilate, backgroundOf, isGroundOp, rasterMask, area, bbox, axis, makeRng, inside } from './common.js';

export function createSketch({ W, H, density = 1, seed = 1, variant = 0, o = {} }) {
  const d = density; const cw = Math.round(W * d); const ch = Math.round(H * d);
  const ink = o.medium === 'ink';
  const paper = o.paper || (ink ? '#f1ede3' : '#f3f0e8');
  const LEAD = ink ? [18, 16, 20] : [52, 52, 58];
  const RED = [176, 36, 30];
  const u = o.unit ?? W / 1920; // size unit: marks are calibrated on a 1920-wide plate
  const angle0 = ((o.angle ?? 48) * Math.PI) / 180;
  const layers = { lead: makeCanvas(cw, ch), red: makeCanvas(cw, ch) };
  const X = Object.fromEntries(Object.entries(layers).map(([k, c]) => { const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); x.lineCap = 'round'; x.lineJoin = 'round'; return [k, x]; }));
  const tooth = ink ? null : noiseField(cw, ch, seed * 17 + 3, { scale: 2.2 * d * Math.max(0.5, u), octaves: 2, white: 0.35 });
  let hooks = {}; let marks = 0;
  const mark = () => { marks++; hooks.mark?.(); };
  const lw = (o.lineW ?? (ink ? 2.2 : 2.0)) * u; // calibrated for 1920-wide plates

  /** A hand-drawn segment from p to q: bowed, with pressure fading at the ends. */
  function handLine(ctx, rgb, p, q, w, alpha, R) {
    const mx = (p[0] + q[0]) / 2; const my = (p[1] + q[1]) / 2; const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const nx = -(q[1] - p[1]) / (L || 1); const ny = (q[0] - p[0]) / (L || 1); const bow = R.signed(L * 0.025);
    const c = [mx + nx * bow, my + ny * bow];
    // Three pressure segments: light start, full middle, light end.
    const seg = (t0, t1, a) => {
      const P = (t) => [(1 - t) * (1 - t) * p[0] + 2 * (1 - t) * t * c[0] + t * t * q[0], (1 - t) * (1 - t) * p[1] + 2 * (1 - t) * t * c[1] + t * t * q[1]];
      const A = P(t0); const B = P((t0 + t1) / 2); const C = P(t1);
      ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a.toFixed(3)})`; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.quadraticCurveTo(B[0], B[1], C[0], C[1]); ctx.stroke();
    };
    seg(0, 0.18, alpha * 0.55); seg(0.16, 0.84, alpha); seg(0.82, 1, alpha * 0.55);
    mark();
  }

  function hatchFill(poly, T, R, { red = false, angle = null } = {}) {
    if (T < 0.05) return;
    const A = area(poly); if (A < 6) return;
    const ctx = red ? X.red : X.lead; const rgb = red ? RED : LEAD;
    const [x0, y0, x1, y1] = bbox(poly);
    const long = Math.max(x1 - x0, y1 - y0); const short = Math.max(1, Math.min(x1 - x0, y1 - y0));
    const base = angle ?? (long / short > 3 && R.next() < 0.5 ? -axis(poly) + Math.PI / 2 * 0.35 : angle0 + R.signed(0.14));
    const passes = T > 0.72 ? 3 : T > 0.42 ? 2 : 1;
    const spacing = (o.spacing ?? 1) * (15 - 11.5 * Math.pow(T, 0.8)) * u;
    const M = poly.length > 48 || A > 40000 ? rasterMask(poly, 0) : null;
    const isIn = (x, y) => (M ? M.inside(x, y) : inside(x, y, poly));
    ctx.save(); tracePoly(ctx, dilate(poly, 3)); ctx.clip();
    for (let k = 0; k < passes; k++) {
      const a = base + [0, 1.25, 0.62][k] + R.signed(0.05);
      const ux = Math.cos(a); const uy = -Math.sin(a); const nx = -uy; const ny = ux;
      const cx = (x0 + x1) / 2; const cy = (y0 + y1) / 2; const half = Math.hypot(x1 - x0, y1 - y0) / 2 + 4;
      const sp = spacing * [1, 1.25, 1.5][k];
      for (let off = -half; off <= half; off += sp * R.float(0.8, 1.2)) {
        // find the chord of this hatch line inside the shape (sampled), then draw it by hand.
        let t0 = null; let t1 = null;
        for (let t = -half; t <= half; t += 3) { const x = cx + nx * off + ux * t; const y = cy + ny * off + uy * t; if (isIn(x, y)) { if (t0 === null) t0 = t; t1 = t; } }
        if (t0 === null || t1 - t0 < 3) continue;
        const over = R.float(-2, 6) * u;
        const p = [cx + nx * off + ux * (t0 - over), cy + ny * off + uy * (t0 - over)];
        const q = [cx + nx * off + ux * (t1 + over), cy + ny * off + uy * (t1 + over)];
        handLine(ctx, rgb, p, q, lw * R.float(0.75, 1.15), (0.42 + 0.4 * T) * R.float(0.75, 1.1), R);
      }
    }
    ctx.restore();
  }

  function contour(path, alpha, w, R, red = false, passes = 2) {
    const ctx = red ? X.red : X.lead; const rgb = red ? RED : LEAD;
    for (let k = 0; k < passes; k++) {
      const j = (k === 0 ? 0.8 : 2.2) * u;
      const ext = R.float(3, 10) * u;
      const pts = path.map(([x, y]) => [x + R.signed(j), y + R.signed(j)]);
      if (pts.length > 1) {
        const a = pts[0]; const b = pts[1]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        pts.unshift([a[0] - ((b[0] - a[0]) / L) * ext, a[1] - ((b[1] - a[1]) / L) * ext]);
        const y2 = pts[pts.length - 1]; const z = pts[pts.length - 2]; const L2 = Math.hypot(y2[0] - z[0], y2[1] - z[1]) || 1;
        pts.push([y2[0] + ((y2[0] - z[0]) / L2) * ext, y2[1] + ((y2[1] - z[1]) / L2) * ext]);
      }
      ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(alpha * (k ? 0.5 : 1)).toFixed(3)})`; ctx.lineWidth = w * (k ? 0.8 : 1);
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); mark();
    }
  }

  function run(ops, h) {
    hooks = h;
    for (const op of ops) {
      hooks.op?.(op.i);
      const R = makeRng(seed, 1 + op.i + variant * 100003);
      const { poly, path } = opGeometry(op, R);
      const ground = isGroundOp(op, poly, W, H);
      const paint = (col, alpha, kind) => {
        if (!poly || ground && lightness(col) > 0.55) return; // light grounds are the paper itself
        const L = lightness(col); const a = Math.min(1, (alpha / 255) * (kind === 'wash' ? 1 : 1.3));
        if (L > 0.88) return; // highlights: leave the paper
        const red = isWarmAccent(col);
        const T = red ? 0.35 + 0.45 * a : Math.pow(1 - L, 1.05) * a;
        hatchFill(poly, T, R, { red });
        if (!ground && T > 0.1 && area(poly) > 60 && (o.outlines ?? true)) contour(poly.concat([poly[0]]), 0.28 + 0.3 * T, lw * 0.9, R, red, 1);
      };
      if (op.wash) paint(op.wash.color, op.wash.alpha, 'wash');
      if (op.fill) paint(op.fill.color, op.fill.alpha, 'fill');
      if (poly && op.hatch) hatchFill(poly, 0.4, R, { red: isWarmAccent(op.hatch.color), angle: (op.hatch.angle * Math.PI) / 180 });
      if (path && op.stroke && !ground) {
        const L = lightness(op.stroke.color);
        const w = lw * (0.8 + (op.stroke.weight || 0.6) * 0.9) * (o.contourScale ?? 1.25);
        contour(path, Math.min(0.95, 0.45 + 0.55 * (1 - L)), w, R, isWarmAccent(op.stroke.color), op.stroke.brush === 'pen' || ink ? 1 : 2);
      }
    }
    return { marks, paper };
  }

  function compose() {
    const out = makeCanvas(cw, ch); const x = out.getContext('2d');
    x.fillStyle = paper; x.fillRect(0, 0, cw, ch);
    if (tooth) {
      x.drawImage(applyTooth(layers.lead, tooth, { g: o.tooth ?? 0.55, gain: 1.05 }), 0, 0);
      x.drawImage(applyTooth(layers.red, tooth, { g: o.tooth ?? 0.55, gain: 1.05 }), 0, 0);
    } else { x.drawImage(layers.lead, 0, 0); x.drawImage(layers.red, 0, 0); }
    return out;
  }
  return { run, compose };
}

export function paintSketch(log, o) {
  return { make: (variant) => createSketch({ ...o, variant, o: o.material || {} }), background: backgroundOf(log, '#f3f0e8') };
}
