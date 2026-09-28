/** Charcoal (with a red conté accent), replayed from the recorded drawing.
 *
 *   fill / glaze   → value from the colour's darkness × alpha. Directional charcoal strokes build
 *                    the tone (a right-hander's diagonal, or along the form's axis for long shapes),
 *                    plus wide low-alpha blending-stump smudges that fill the paper's valleys.
 *   light wash     → an eraser: strokes that lift charcoal back to the paper (destination-out).
 *   stroke / line  → a broken charcoal line: two jittered passes, weight from the brush.
 *   hatch          → charcoal hatching along the recorded angle.
 *   warm reds      → red conté on its own layer (the only colour charcoal is allowed here).
 * Paper tooth is a fixed seeded surface: light pressure catches only its peaks, heavy pressure and
 * smudges fill the valleys. Every mark is placed per op with its own RNG stream. */
import { opGeometry, lightness, isWarmAccent, hsl, noiseField, makeCanvas, applyTooth, tracePoly, dilate, pointIn, backgroundOf, isGroundOp, rasterMask, area, bbox, axis, makeRng } from './common.js';

const INK = [22, 20, 18];
const CONTE = [158, 38, 24];
const BRUSH_W = { pen: [0.8, 0.95], HB: [1, 0.8], '2H': [0.8, 0.45], '2B': [1.5, 0.95], crayon: [1.8, 0.7], marker: [1.6, 0.9], charcoal: [1.8, 0.9], cpencil: [1.1, 0.8], rotring: [0.8, 0.95], spray: [2, 0.4] };

export function createCharcoal({ W, H, density = 1, seed = 1, variant = 0, o = {}, log }) {
  const d = density; const cw = Math.round(W * d); const ch = Math.round(H * d);
  const paper = o.paper || '#ebe6dc';
  const u = o.unit ?? W / 1920; // size unit: marks are calibrated on a 1920-wide plate
  const angle0 = ((o.angle ?? 62) * Math.PI) / 180; // stroke direction (up-right diagonal)
  const layers = { ink: makeCanvas(cw, ch), conte: makeCanvas(cw, ch), smudge: makeCanvas(cw, ch), conteSmudge: makeCanvas(cw, ch) };
  const X = Object.fromEntries(Object.entries(layers).map(([k, c]) => { const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); x.lineCap = 'round'; x.lineJoin = 'round'; return [k, x]; }));
  const tooth = noiseField(cw, ch, seed * 13 + 5, { scale: 2.6 * d * Math.max(0.5, u), octaves: 2, white: 0.3 });
  let hooks = {}; let marks = 0;
  const mark = () => { marks++; hooks.mark?.(); };
  const scale = (o.lineScale ?? 1.7) * u;

  /** One charcoal stroke: a slightly bowed line with round ends. */
  function stroke(x, y, a, len, w, alpha, ctx, rgb, R) {
    const dx = Math.cos(a) * len * 0.5; const dy = -Math.sin(a) * len * 0.5;
    const bow = R.signed(len * 0.06);
    ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha.toFixed(3)})`; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x - dx, y - dy); ctx.quadraticCurveTo(x - dy * 0.0 + Math.sin(a) * bow, y + Math.cos(a) * bow, x + dx, y + dy); ctx.stroke();
    mark();
  }

  function toneFill(poly, T, R, { conte = false, dirAngle = null } = {}) {
    if (T < 0.04) return;
    const A = area(poly); if (A < 4) return;
    const M = poly.length > 48 || A > 40000 ? rasterMask(poly, 0) : null;
    const ctx = conte ? X.conte : X.ink; const rgb = conte ? CONTE : INK;
    const [x0, y0, x1, y1] = bbox(poly);
    const long = Math.max(x1 - x0, y1 - y0); const short = Math.max(1, Math.min(x1 - x0, y1 - y0));
    const baseA = dirAngle ?? (long / short > 2.6 && R.next() < 0.65 ? -axis(poly) : angle0 + R.signed(0.2));
    // Smudge first (tonal mass), on its own layer — not affected by tooth.
    if (T > 0.12 && A > 1500) {
      const sctx = conte ? X.conteSmudge : X.smudge;
      const sw = Math.min(70 * u, Math.max(14 * u, Math.sqrt(A) * 0.12));
      const n = Math.min(2400, Math.ceil((A / (sw * sw * 4)) * 3.5));
      sctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(0.025 + 0.06 * T).toFixed(3)})`;
      for (let i = 0; i < n; i++) {
        const p = pointIn(poly, R, M); if (!p) continue;
        const a = baseA + R.signed(0.25); const len = sw * R.float(3, 7);
        sctx.lineWidth = sw * R.float(0.6, 1.1);
        sctx.beginPath(); sctx.moveTo(p[0] - Math.cos(a) * len / 2, p[1] + Math.sin(a) * len / 2); sctx.lineTo(p[0] + Math.cos(a) * len / 2, p[1] - Math.sin(a) * len / 2); sctx.stroke();
        mark();
      }
    }
    // Strokes: coverage target from T (alpha stacking: 1 - (1 - a)^k = T).
    const w0 = (o.strokeW ?? 4.2) * u; const len0 = Math.min(90 * u, Math.max(14 * u, Math.sqrt(A) * 0.35));
    const sa = 0.3 + 0.25 * T;
    const layersK = Math.min(9, Math.log(1 - Math.min(0.97, T)) / Math.log(1 - sa));
    const n = Math.min(40000, Math.ceil((A * layersK) / (w0 * len0 * 0.85)));
    ctx.save(); tracePoly(ctx, dilate(poly, 1.5)); ctx.clip();
    for (let i = 0; i < n; i++) {
      const p = pointIn(poly, R, M, 12); if (!p) continue;
      const a = baseA + R.signed(0.12) + (R.next() < 0.12 ? R.signed(0.9) : 0);
      stroke(p[0], p[1], a, len0 * R.float(0.5, 1.4), w0 * R.float(0.6, 1.4), sa * R.float(0.7, 1.2), ctx, rgb, R);
    }
    ctx.restore();
  }

  function erase(poly, strength, R, salt) {
    const A = area(poly); if (A < 4) return;
    const M = poly.length > 48 || A > 40000 ? rasterMask(poly, 0) : null;
    const w0 = 9 * u; const len0 = Math.min(80 * u, Math.max(12 * u, Math.sqrt(A) * 0.4));
    const n = Math.min(12000, Math.ceil((A * 2.2) / (w0 * len0)));
    for (const key of ['ink', 'conte', 'smudge', 'conteSmudge']) {
      const ctx = X[key]; ctx.save(); tracePoly(ctx, dilate(poly, 1)); ctx.clip(); ctx.globalCompositeOperation = 'destination-out';
      const RR = makeRng(seed, 70000 + salt * 7 + variant * 100003); // same strokes lift every layer
      for (let i = 0; i < n; i++) {
        const p = pointIn(poly, RR, M, 10); if (!p) continue;
        stroke(p[0], p[1], angle0 + 0.3 + RR.signed(0.25), len0 * RR.float(0.6, 1.3), w0 * RR.float(0.8, 1.5), strength * RR.float(0.6, 1), ctx, [0, 0, 0], RR);
      }
      ctx.restore();
    }
  }

  function line(path, st, R, { conte = false, alphaK = 1 } = {}) {
    const [wm, am] = BRUSH_W[st.brush] || BRUSH_W.HB;
    const ctx = conte ? X.conte : X.ink; const rgb = conte ? CONTE : INK;
    const w = Math.max(1.2 * u, (0.9 + (st.weight || 0.6) * 1.4) * wm * scale);
    const L = lightness(st.color);
    const alpha = Math.min(0.95, (0.35 + 0.65 * (1 - L)) * am * alphaK);
    if (alpha < 0.05) return;
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(alpha * (pass ? 0.55 : 1)).toFixed(3)})`;
      ctx.lineWidth = w * (pass ? 0.7 : 1) * R.float(0.85, 1.15);
      ctx.beginPath();
      const j = (pass ? 1.6 : 0.7) * u;
      path.forEach(([x, y], i) => { const px = x + R.signed(j); const py = y + R.signed(j); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
      ctx.stroke(); mark();
    }
  }

  function hatch(poly, h, R) {
    const M = poly.length > 48 ? rasterMask(poly, 0) : null;
    const [x0, y0, x1, y1] = bbox(poly);
    const a = (h.angle * Math.PI) / 180; const ux = Math.cos(a); const uy = -Math.sin(a); const nx = -uy; const ny = ux;
    const cx = (x0 + x1) / 2; const cy = (y0 + y1) / 2; const half = Math.hypot(x1 - x0, y1 - y0) / 2 + 2;
    const conte = isWarmAccent(h.color);
    for (let off = -half; off <= half; off += Math.max(3 * u, h.dist * 1.1) * (1 + R.signed(h.rand || 0))) {
      let run = [];
      const flush = () => { if (run.length > 1) line(run, { brush: h.brush, color: h.color, weight: h.weight }, R, { conte, alphaK: 0.8 }); run = []; };
      for (let t = -half; t <= half; t += 3) {
        const x = cx + nx * off + ux * t; const y = cy + ny * off + uy * t;
        if (M ? M.inside(x, y) : inside2(x, y, poly)) run.push([x, y]); else flush();
      }
      flush();
    }
  }
  const inside2 = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i]; const [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };

  function run(ops, h) {
    hooks = h;
    for (const op of ops) {
      hooks.op?.(op.i);
      const R = makeRng(seed, 1 + op.i + variant * 100003);
      const { poly, path } = opGeometry(op, R);
      const ground = isGroundOp(op, poly, W, H);
      const paint = (col, alpha, kind) => {
        if (!poly) return;
        const L = lightness(col); const a = Math.min(1, (alpha / 255) * (kind === 'wash' ? 1 : 1.25));
        if (isWarmAccent(col)) { const [, s] = hsl(col); toneFill(poly, Math.min(0.95, (0.35 + 0.5 * s) * a), R, { conte: true }); return; }
        if (L > 0.86 && a > 0.55 && !ground) { erase(poly, Math.min(0.95, (L - 0.7) * 3 * a), R, op.i); return; }
        const T = Math.pow(Math.max(0, 1 - L), 1.1) * a * (ground ? (o.groundK ?? 1) : 1);
        toneFill(poly, T, R);
      };
      if (op.wash) paint(op.wash.color, op.wash.alpha, 'wash');
      if (op.fill) paint(op.fill.color, op.fill.alpha, 'fill');
      if (poly && op.hatch) hatch(poly, op.hatch, R);
      if (path && op.stroke && !ground) line(path, op.stroke, R, { conte: isWarmAccent(op.stroke.color) });
    }
    return { marks, paper };
  }

  function compose() {
    const out = makeCanvas(cw, ch); const x = out.getContext('2d');
    x.fillStyle = paper; x.fillRect(0, 0, cw, ch);
    // Paper tooth shows faintly as a surface (fixed, seeded).
    x.globalAlpha = 1; x.drawImage(paperTexture(), 0, 0);
    x.drawImage(layers.smudge, 0, 0); x.drawImage(layers.conteSmudge, 0, 0);
    x.drawImage(applyTooth(layers.ink, tooth, { g: o.tooth ?? 0.95 }), 0, 0);
    x.drawImage(applyTooth(layers.conte, tooth, { g: o.tooth ?? 0.95 }), 0, 0);
    return out;
  }
  let paperTex = null;
  function paperTexture() {
    if (paperTex) return paperTex;
    paperTex = makeCanvas(cw, ch); const x = paperTex.getContext('2d'); const img = x.createImageData(cw, ch); const px = img.data;
    for (let i = 0, j = 0; i < tooth.length; i++, j += 4) { px[j] = 60; px[j + 1] = 52; px[j + 2] = 44; px[j + 3] = Math.max(0, tooth[i] - 0.55) * 60; }
    x.putImageData(img, 0, 0); return paperTex;
  }
  return { run, compose };
}

export function paintCharcoal(log, o) {
  return { make: (variant) => createCharcoal({ ...o, variant, log, o: o.material || {} }), background: backgroundOf(log, '#ebe6dc') };
}
