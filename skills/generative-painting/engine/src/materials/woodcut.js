/** Woodcut / linocut print, replayed from the recorded drawing (the Expressionist print of anger).
 *
 * Printmaker's logic, op by op in layer order on one block:
 *   dark fill        → inked (the block surface left standing);
 *   light fill       → carved away (paper shows);
 *   mid-value fill   → inked, then gouged: parallel tapered cuts that follow the form, denser for
 *                      lighter values (this is how woodcuts make grey);
 *   warm red fill    → a second block printed in red, slightly misregistered;
 *   dark stroke      → a bold cut line left standing (tapered ends);
 *   light stroke     → a single V-gouge through the ink;
 *   hatch            → a run of parallel gouges.
 * Printing: the wood grain of each block (a seeded anisotropic field) makes ink skip in streaks,
 * and the paper has its own slight texture. Both are fixed surfaces, not per-frame noise. */
import { opGeometry, lightness, isWarmAccent, noiseField, makeCanvas, tracePoly, dilate, backgroundOf, isGroundOp, rasterMask, area, bbox, axis, makeRng, inside, hsl } from './common.js';

export function createWoodcut({ W, H, density = 1, seed = 1, variant = 0, o = {} }) {
  const d = density; const cw = Math.round(W * d); const ch = Math.round(H * d);
  const PAPER = o.paper || '#ece3cf';
  const INK = o.ink || '#15110e';
  const RED = o.red || '#b3261b';
  const black = makeCanvas(cw, ch); const red = makeCanvas(cw, ch);
  const B = black.getContext('2d'); const Rd = red.getContext('2d');
  for (const x of [B, Rd]) { x.setTransform(d, 0, 0, d, 0, 0); x.lineCap = 'round'; x.lineJoin = 'round'; }
  const grainAngle = o.grainAngle ?? 0;
  const grain = noiseField(cw, ch, seed * 29 + 11, { scale: 2.2 * d * Math.max(0.5, W / 1920), octaves: 2, sx: 14, sy: 1, white: 0.22 });
  let hooks = {}; let marks = 0;
  const mark = () => { marks++; hooks.mark?.(); };
  const u = o.unit ?? W / 1920; // size unit: marks are calibrated on a 1920-wide plate
  const cut = (o.cutScale ?? 1) * u;

  /** A tapered gouge (or standing line) from p to q as a filled lens-shaped polygon. */
  function taper(ctx, p, q, w, color, R, bend = 0.06) {
    const dx = q[0] - p[0]; const dy = q[1] - p[1]; const L = Math.hypot(dx, dy) || 1; const nx = -dy / L; const ny = dx / L;
    const b = R.signed(L * bend); const k = 10; const left = []; const right = [];
    for (let i = 0; i <= k; i++) {
      const t = i / k; const ww = w * Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.02)) ** 0.7 * (0.5 + 0.5 * Math.min(1, t * 4));
      const cx = p[0] + dx * t + nx * b * 4 * t * (1 - t); const cy = p[1] + dy * t + ny * b * 4 * t * (1 - t);
      left.push([cx + nx * ww / 2, cy + ny * ww / 2]); right.push([cx - nx * ww / 2, cy - ny * ww / 2]);
    }
    ctx.fillStyle = color; tracePoly(ctx, left.concat(right.reverse())); ctx.fill(); mark();
  }

  function gouges(ctx, poly, lightness01, R, angle) {
    const A = area(poly); if (A < 40) return;
    const M = poly.length > 48 || A > 40000 ? rasterMask(poly, 0) : null;
    const isIn = (x, y) => (M ? M.inside(x, y) : inside(x, y, poly));
    const [x0, y0, x1, y1] = bbox(poly);
    const ux = Math.cos(angle); const uy = -Math.sin(angle); const nx = -uy; const ny = ux;
    const cx = (x0 + x1) / 2; const cy = (y0 + y1) / 2; const half = Math.hypot(x1 - x0, y1 - y0) / 2 + 4;
    const spacing = (22 - 15 * lightness01) * cut; const w = (2.5 + 6 * lightness01) * cut;
    ctx.save(); tracePoly(ctx, poly); ctx.clip();
    ctx.globalCompositeOperation = 'destination-out';
    for (let off = -half; off <= half; off += spacing * R.float(0.8, 1.2)) {
      let t = -half; let run0 = null;
      while (t <= half) {
        const x = cx + nx * off + ux * t; const y = cy + ny * off + uy * t; const ins = isIn(x, y);
        if (ins && run0 === null) run0 = t;
        if ((!ins || t + 4 > half) && run0 !== null) {
          // break long runs into chisel strokes of 40–140 px
          let a = run0; const b = t;
          while (a < b - 6) { const len = Math.min(b - a, R.float(40, 140) * cut); if (R.next() < 0.88) taper(ctx, [cx + nx * off + ux * a, cy + ny * off + uy * a], [cx + nx * off + ux * (a + len), cy + ny * off + uy * (a + len)], w * R.float(0.7, 1.2), '#000', R, 0.03); a += len + R.float(3, 14) * cut; }
          run0 = null;
        }
        t += 4;
      }
    }
    ctx.restore();
  }

  function run(ops, h) {
    hooks = h;
    for (const op of ops) {
      hooks.op?.(op.i);
      const R = makeRng(seed, 1 + op.i + variant * 100003);
      const { poly, path } = opGeometry(op, R);
      const ground = isGroundOp(op, poly, W, H);
      const place = (col, alpha, kind) => {
        if (!poly) return;
        const a = Math.min(1, (alpha / 255) * (kind === 'wash' ? 1 : 1.35));
        if (a < (o.minAlpha ?? 0.3)) return; // faint glazes and paper stains don't reach the block
        const L = lightness(col);
        if (isWarmAccent(col, { minS: 0.38, hueMax: 42 }) && L < 0.72) {
          Rd.fillStyle = RED; tracePoly(Rd, poly); Rd.fill(); mark();
          // carve the black block under the red so the colour prints clean (registration gap)
          B.save(); B.globalCompositeOperation = 'destination-out'; tracePoly(B, dilate(poly, -1)); B.fill(); B.restore();
          if (L > 0.6) gouges(Rd, poly, (L - 0.6) * 1.5, R, -axis(poly));
          return;
        }
        if (L < (o.inkBelow ?? 0.42)) { B.fillStyle = INK; tracePoly(B, poly); B.fill(); mark(); if (!ground) Rd.save(), Rd.globalCompositeOperation = 'destination-out', tracePoly(Rd, poly), Rd.fill(), Rd.restore(); return; }
        if (L > (o.paperAbove ?? 0.74)) {
          // carved away: both blocks cleared
          for (const x of [B, Rd]) { x.save(); x.globalCompositeOperation = 'destination-out'; tracePoly(x, poly); x.fill(); x.restore(); }
          mark(); return;
        }
        // mid value: ink then gouge (lighter → more cutting)
        B.fillStyle = INK; tracePoly(B, poly); B.fill(); mark();
        const long = bbox(poly); const elong = Math.max(long[2] - long[0], long[3] - long[1]) / Math.max(1, Math.min(long[2] - long[0], long[3] - long[1]));
        const ang = ground ? ((grainAngle + (o.gougeAngle ?? 8)) * Math.PI) / 180 : elong > 2 ? -axis(poly) : ((o.gougeAngle ?? 8) * Math.PI) / 180 + R.signed(0.5);
        gouges(B, poly, (L - (o.inkBelow ?? 0.42)) / ((o.paperAbove ?? 0.74) - (o.inkBelow ?? 0.42)), R, ang);
      };
      if (op.wash) place(op.wash.color, op.wash.alpha, 'wash');
      if (op.fill) place(op.fill.color, op.fill.alpha, 'fill');
      if (poly && op.hatch) gouges(B, poly, 0.55, R, (op.hatch.angle * Math.PI) / 180);
      if (path && op.stroke && !ground) {
        const L = lightness(op.stroke.color); const w = (2.4 + (op.stroke.weight || 0.6) * 3.2) * (o.lineScale ?? 1.4) * u;
        const warm = isWarmAccent(op.stroke.color);
        const ctx = warm ? Rd : B;
        // Standing line (dark or red) or a white gouge (light), in chisel segments.
        const light = L > 0.7 && !warm;
        if (light) { ctx.save(); ctx.globalCompositeOperation = 'destination-out'; }
        for (let i = 0; i < path.length - 1;) {
          const j = Math.min(path.length - 1, i + Math.max(2, Math.round(R.float(16, 40)))); // long chisel runs, not stitches
          taper(light ? B : ctx, path[i], path[j], w * R.float(0.8, 1.2), light ? '#000' : warm ? RED : INK, R, 0.04);
          i = j;
        }
        if (light) ctx.restore();
      }
    }
    return { marks };
  }

  function compose() {
    const out = makeCanvas(cw, ch); const x = out.getContext('2d');
    x.fillStyle = PAPER; x.fillRect(0, 0, cw, ch);
    const print = (layer, dx, dy, ink, k) => {
      const c = makeCanvas(cw, ch); const cx = c.getContext('2d'); cx.drawImage(layer, dx, dy);
      const img = cx.getImageData(0, 0, cw, ch); const px = img.data; const [r, g, b] = hexRgb(ink);
      for (let i = 0, j = 0; i < grain.length; i++, j += 4) {
        if (!px[j + 3]) continue;
        const skip = grain[i] > k ? Math.min(1, (grain[i] - k) * 5) : 0; // ink skipping on the grain
        px[j] = r; px[j + 1] = g; px[j + 2] = b; px[j + 3] = px[j + 3] * (1 - skip * 0.85);
      }
      cx.putImageData(img, 0, 0); x.drawImage(c, 0, 0);
    };
    print(red, Math.round(3 * d), Math.round(2 * d), RED, o.redSkip ?? 0.8);
    print(black, 0, 0, INK, o.inkSkip ?? 0.84);
    return out;
  }
  return { run, compose };
}
function hexRgb(h) { const s = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)); }

export function paintWoodcut(log, o) {
  return { make: (variant) => createWoodcut({ ...o, variant, o: o.material || {} }), background: backgroundOf(log, '#ece3cf') };
}
