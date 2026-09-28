/** 2D cel animation, replayed from the recorded drawing.
 *
 *   fill / glaze   → flat opaque paint (alpha pushed toward opaque, as cel paint is), with a hard
 *                    cel shadow: the form is painted in a darker tone, then its base colour offset
 *                    up-left, leaving a crescent of shadow on the lower right;
 *   outline        → thick-thin ink line around every figure-sized form;
 *   stroke / line  → ink line (coloured if the stroke colour is saturated);
 *   ground         → flat background paint.
 * Boil: each variant re-draws every outline with fresh jitter (seeded by the variant), so cycling
 * variants on twos gives hand-drawn "line boil". Variant 0 is the reference plate. */
import { opGeometry, lightness, hsl, makeCanvas, tracePoly, backgroundOf, isGroundOp, area, makeRng, parseColor } from './common.js';

function shade(color, k) {
  const [h, s, l] = hsl(color);
  return `hsl(${(h + (k < 0 ? 8 : -4)).toFixed(1)},${Math.min(100, s * 100 * (k < 0 ? 1.08 : 0.95)).toFixed(1)}%,${Math.max(0, Math.min(100, (l + k) * 100)).toFixed(1)}%)`;
}

export function createCel({ W, H, density = 1, seed = 1, variant = 0, o = {}, bg = '#f2e6cf' }) {
  const d = density; const cw = Math.round(W * d); const ch = Math.round(H * d);
  const canvas = makeCanvas(cw, ch); const x = canvas.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, cw, ch);
  x.setTransform(d, 0, 0, d, 0, 0); x.lineJoin = 'round'; x.lineCap = 'round';
  const LINE = o.line || '#1f1619';
  const u = o.unit ?? W / 1920; // size unit: marks are calibrated on a 1920-wide plate
  const boilAmp = (o.boil ?? 1.8) * u;
  let hooks = {}; let marks = 0;
  const mark = () => { marks++; hooks.mark?.(); };

  /** Smooth per-variant jitter along a polygon (every ~10 vertices, interpolated). */
  function boil(poly, R) {
    if (!variant && !o.boilZero) return poly;
    const n = poly.length; const step = 10; const k = Math.ceil(n / step) + 1;
    const jx = Array.from({ length: k }, () => R.signed(boilAmp)); const jy = Array.from({ length: k }, () => R.signed(boilAmp));
    return poly.map(([px, py], i) => { const t = i / step; const a = Math.floor(t); const f = t - a; const b = (a + 1) % k; return [px + jx[a] * (1 - f) + jx[b] * f, py + jy[a] * (1 - f) + jy[b] * f]; });
  }
  function inkLine(path, w, color, R, closed = false) {
    // thick-thin: two passes, the second thinner and offset, gives a brushed ink line
    x.strokeStyle = color;
    x.lineWidth = w; x.beginPath(); path.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); if (closed) x.closePath(); x.stroke();
    x.lineWidth = w * 0.55; x.beginPath(); path.forEach(([px, py], i) => (i ? x.lineTo(px + 0.9 * u, py + 1.1 * u) : x.moveTo(px + 0.9 * u, py + 1.1 * u))); if (closed) x.closePath(); x.stroke();
    mark();
  }

  function run(ops, h) {
    hooks = h;
    for (const op of ops) {
      hooks.op?.(op.i);
      const R0 = makeRng(seed, 1 + op.i); // geometry stream: identical across variants
      const RB = makeRng(seed, 500000 + op.i + variant * 100003); // boil stream: per variant
      const { poly, path } = opGeometry(op, R0);
      const ground = isGroundOp(op, poly, W, H);
      const paint = (col, alpha, kind) => {
        if (!poly) return;
        const a = Math.min(1, Math.pow(alpha / 255, 0.55) * (kind === 'wash' ? 1.1 : 1.25));
        if (a < 0.15) return;
        const P = ground ? poly : boil(poly, RB);
        x.globalAlpha = a;
        const A = area(poly);
        const figure = !ground && A > 250 * u * u && A < W * H * 0.4 && alpha >= (o.outlineAlpha ?? 110);
        if (figure && (o.shadow ?? true)) {
          x.fillStyle = shade(col, -0.14); tracePoly(x, P); x.fill();
          x.save(); tracePoly(x, P); x.clip();
          const off = Math.max(4 * u, Math.min(14 * u, Math.sqrt(A) * 0.06));
          x.fillStyle = col; x.translate(-off, -off); tracePoly(x, P); x.fill(); x.restore();
        } else { x.fillStyle = col; tracePoly(x, P); x.fill(); }
        x.globalAlpha = 1; mark();
        if (figure) inkLine(P.concat([P[0]]), (o.lineW ?? 4.2) * u * (A > 60000 * u * u ? 1.25 : 1), LINE, RB, true);
      };
      if (op.wash) paint(op.wash.color, op.wash.alpha, 'wash');
      if (op.fill) paint(op.fill.color, op.fill.alpha, 'fill');
      if (path && op.stroke && !ground) {
        const [, s] = hsl(op.stroke.color); const L = lightness(op.stroke.color);
        const col = s > 0.35 || L > 0.8 ? op.stroke.color : LINE;
        inkLine(boil(path, RB), (1.6 + (op.stroke.weight || 0.6) * 2.4) * (o.lineScale ?? 1.3) * u, col, RB);
      }
    }
    return { marks };
  }
  return { run, compose: () => { const c = makeCanvas(cw, ch); c.getContext('2d').drawImage(canvas, 0, 0); return c; } };
}

export function paintCel(log, o) {
  const bg = backgroundOf(log, '#f2e6cf');
  return { make: (variant) => createCel({ ...o, variant, bg, o: o.material || {} }), background: bg };
}
export { parseColor };
