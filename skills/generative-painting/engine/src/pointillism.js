/** Pointillist material: replays a captured plate (see capture.js) as painted dots on Canvas 2D.
 *
 * The geometry, object inventory and layer order are the capture's own; only the material changes.
 *   fill / glaze  -> stippled colour field; coverage from alpha, rim weight from `border`,
 *                    a few dots escaping the edge from `bleed`
 *   wash/reserve  -> denser, near-opaque stipple of the reserve colour
 *   hatch         -> parallel dotted lines clipped to the shape
 *   stroke        -> dotted chains along the path (brush type sets size, gaps and tone)
 *   ground        -> a solid base colour plus restrained, sparse fixed texture
 * Colour per dot comes from a small local family around the source colour: neighbouring hues,
 * value steps and rare complementary accents, so volume is carried by the mix of dots rather than
 * a smooth gradient under identical marks.
 *
 * `refScale` (per plate) scales how strongly dot colour follows the colour reference (1 = default;
 * new films use < 1 for purer divided colour; a translation can use > 1 on a plate whose hue must hold).
 *
 * Randomness: an independent deterministic stream per operation (plate seed × op index), never the
 * p5 stream, so changing mark density cannot move any subject. Marks are rounded, slightly
 * irregular dabs with bounded size variation, drawn once; the plate is then cached as pixels. */
import { makeRng } from './rng.js';

/** Material profiles: how marks are organised on a plate. Sizes are radii in 600-unit space. */
export const PROFILES = {
  // default body texture: 1.4–2.8-unit dabs
  dense: { r: [0.7, 1.4], coverage: 1, hue: 9, value: 0.07, neighbour: 0.22, complement: 0.035, cluster: 0, stretch: 1 },
  // fine stipple for drawn, archival and small-motif plates
  fine: { r: [0.45, 0.85], coverage: 1, hue: 6, value: 0.05, neighbour: 0.15, complement: 0.02, cluster: 0, stretch: 1 },
  // coarse clustered colour: groups of dabs, for exuberant saturated masses
  clustered: { r: [0.8, 1.6], coverage: 1, hue: 12, value: 0.08, neighbour: 0.3, complement: 0.05, cluster: 4, stretch: 1 },
  // dabs elongated along each form's main axis (fronds, arms, fins, blades)
  directional: { r: [0.7, 1.35], coverage: 1, hue: 9, value: 0.07, neighbour: 0.22, complement: 0.03, cluster: 0, stretch: 1.9 },
  // open, airy spacing for translucent bodies and near-empty plates
  airy: { r: [0.55, 1.1], coverage: 0.78, hue: 7, value: 0.06, neighbour: 0.18, complement: 0.03, cluster: 0, stretch: 1 },
};

// ---------- colour ----------
const NAMED = { black: '#000000', white: '#ffffff' };
export function parseColor(c) {
  if (Array.isArray(c)) return c.slice(0, 3).map(Number);
  let s = String(c).trim().toLowerCase();
  if (NAMED[s]) s = NAMED[s];
  if (s[0] === '#') {
    if (s.length === 4) s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
    return [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  }
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) return m[1].split(',').slice(0, 3).map((v) => parseFloat(v));
  return [128, 128, 128];
}
export function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b); const mn = Math.min(r, g, b); const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn; const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
export function hslToCss(h, s, l) {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s; const x = c * (1 - Math.abs(((h / 60) % 2) - 1)); const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return `rgb(${Math.round((r + m) * 255)},${Math.round((g + m) * 255)},${Math.round((b + m) * 255)})`;
}
/** A local colour family around `base`. Returns a picker drawing one CSS colour per dot.
 * With `o.ref` (a sampler of the source watercolour) and a position, each dot's base colour is the
 * op's pigment mixed with the source colour at that spot (weight `o.w`), so the optical mix of the
 * dots matches the original's colour impression; the variation below is then applied around it. */
function family(base, prof, R, o = {}) {
  const pig = parseColor(base);
  const fixed = rgbToHsl(pig);
  return (x, y) => {
    let [h, s, l] = fixed;
    if (o.ref && x !== undefined) {
      const src = o.ref(x, y); const w = Math.min(1, (o.w ?? 0.6) * (o.refScale ?? 1));
      [h, s, l] = rgbToHsl(pig.map((v, i) => v * (1 - w) + src[i] * w));
    }
    const grey = s < 0.08;
    const u = R.next();
    let hh = h + R.signed(prof.hue); let ss = s * (1 + R.signed(0.12)); let ll = l + R.signed(prof.value);
    if (!grey && u < prof.complement && !o.noComplement) { hh = h + 180 + R.signed(15); ss = s * 0.55; ll = l * 0.92; }
    else if (!grey && u < prof.complement + prof.neighbour) { hh = h + (R.next() < 0.5 ? -1 : 1) * R.float(14, 30); }
    if (o.shade) ll += o.shade;
    return hslToCss(hh, grey ? s : ss, ll);
  };
}

// ---------- geometry ----------
export function catmull(pts, curv, closed, step = 2.5) {
  if (curv <= 0 || pts.length < 3) return densify(pts, closed, step);
  const out = []; const n = pts.length;
  const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1); const p1 = P(i); const p2 = P(i + 1); const p3 = P(i + 2);
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const k = Math.max(2, Math.ceil(len / step));
    for (let j = 0; j < k; j++) {
      const t = j / k; const t2 = t * t; const t3 = t2 * t;
      const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      const lin = (b, c) => b + (c - b) * t;
      out.push([lin(p1[0], p2[0]) * (1 - curv) + cr(p0[0], p1[0], p2[0], p3[0]) * curv, lin(p1[1], p2[1]) * (1 - curv) + cr(p0[1], p1[1], p2[1], p3[1]) * curv]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
export function densify(pts, closed, step) {
  const out = []; const n = pts.length; const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i]; const b = pts[(i + 1) % n];
    const k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
export function circlePoly(c, r, irr, R) {
  const n = Math.max(14, Math.min(90, Math.round(r * 1.2)));
  const off = R.float(0, Math.PI * 2);
  const wob = irr ? Math.min(0.12, 0.04 + irr * 0.08) : 0.012;
  const ph = R.float(0, 6.28);
  return Array.from({ length: n }, (_, i) => {
    const a = off + (i / n) * Math.PI * 2; const rr = r * (1 + wob * Math.sin(a * 3 + ph) * 0.6 + wob * Math.sin(a * 5 + ph * 2) * 0.4);
    return [c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr];
  });
}
export function area(poly) { let s = 0; for (let i = 0; i < poly.length; i++) { const a = poly[i]; const b = poly[(i + 1) % poly.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s / 2); }
export function bbox(poly) { let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity; for (const [x, y] of poly) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; }
export function inside(px, py, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]; const [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
export function edgeDist(px, py, poly) {
  let d = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j]; const [bx, by] = poly[i];
    const vx = bx - ax; const vy = by - ay; const l2 = vx * vx + vy * vy || 1;
    const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l2));
    const dx = px - ax - t * vx; const dy = py - ay - t * vy; const dd = dx * dx + dy * dy;
    if (dd < d) d = dd;
  }
  return Math.sqrt(d);
}
/** Raster mask of a polygon (native canvas fill): O(1) inside tests and ring-probed edge distance.
 * Used for large shapes, where exact per-point polygon tests cost O(vertices) each. */
export function rasterMask(poly, pad) {
  const [x0, y0, x1, y1] = bbox(poly);
  const ox = Math.floor(x0 - pad - 2); const oy = Math.floor(y0 - pad - 2);
  const w = Math.ceil(x1 - x0 + 2 * pad + 5); const h = Math.ceil(y1 - y0 + 2 * pad + 5);
  const c = new OffscreenCanvas(Math.max(1, w), Math.max(1, h)); const g = c.getContext('2d');
  g.beginPath(); g.moveTo(poly[0][0] - ox, poly[0][1] - oy); for (let i = 1; i < poly.length; i++) g.lineTo(poly[i][0] - ox, poly[i][1] - oy); g.closePath();
  g.fillStyle = '#fff'; g.fill();
  const a = g.getImageData(0, 0, w, h).data;
  const at = (x, y) => { const xi = Math.floor(x - ox); const yi = Math.floor(y - oy); return xi >= 0 && yi >= 0 && xi < w && yi < h && a[(yi * w + xi) * 4 + 3] > 127; };
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];
  const edgeDist = (x, y, inside) => {
    for (const r of inside ? [1.2, 2.4] : [1, 2, 4, 8, 16, 32]) for (const [dx, dy] of DIRS) if (at(x + dx * r, y + dy * r) !== inside) return r;
    return inside ? 3 : 64;
  };
  return { inside: at, edgeDist };
}

/** Main-axis angle of a polygon (PCA), for directional dabs. */
export function axis(poly) {
  let cx = 0; let cy = 0; for (const [x, y] of poly) { cx += x; cy += y; } cx /= poly.length; cy /= poly.length;
  let sxx = 0; let syy = 0; let sxy = 0;
  for (const [x, y] of poly) { const dx = x - cx; const dy = y - cy; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
  return 0.5 * Math.atan2(2 * sxy, sxx - syy);
}

// ---------- marks ----------
function dab(ctx, x, y, r, color, alpha, R, stretch = 1, angle = null) {
  const a = angle === null ? R.float(0, Math.PI) : angle + R.signed(0.25);
  const rx = r * (stretch > 1 ? stretch * R.float(0.85, 1.15) : R.float(0.9, 1.12));
  const ry = r * (stretch > 1 ? R.float(0.75, 0.95) : R.float(0.72, 1));
  ctx.globalAlpha = alpha; ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); ctx.fill();
}

const BRUSHES = {
  // [size multiplier, gap probability, alpha, colour value shift]
  // Pencils are grainy and light in the source (2H faintest), inks crisp and dark.
  '2H': [0.8, 0.3, 0.6, 0.05], HB: [0.95, 0.18, 0.78, 0.02], '2B': [1.15, 0.2, 0.8, -0.02], pen: [0.9, 0.08, 0.92, 0],
  rotring: [0.8, 0.1, 0.92, 0], charcoal: [1.5, 0.25, 0.85, -0.04], crayon: [1.2, 0.45, 0.72, 0], marker: [1.3, 0.12, 0.88, 0],
};

export function paintPointillist(canvas, log, o = {}) {
  const d = o.density || 1; const PW = o.W || 600; const PH = o.H || 600; // logical plate size
  canvas.width = Math.round(PW * d); canvas.height = Math.round(PH * d);
  // Large plates (e.g. 1920×864) use raster masks for inside/edge tests: exact polygon tests cost
  // O(vertices) per dot and become minutes per plate. Off by default at 600² so output is unchanged.
  const fast = o.fastMask ?? PW * PH > 600 * 600;
  const ctx = canvas.getContext('2d');
  const prof0 = { ...PROFILES.dense, ...(PROFILES[o.profile] || {}), ...(o.tune || {}) };
  // dotScale enlarges every dab (fields and chains) for plates shown bigger than the 600 square.
  const prof = o.dotScale ? { ...prof0, r: prof0.r.map((v) => v * o.dotScale) } : prof0;
  const seed = (o.seed || 1) >>> 0;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  const bg = log.background ? (Array.isArray(log.background) ? `rgb(${parseColor(log.background).join(',')})` : log.background) : '#f4efe6';
  ctx.fillStyle = bg; ctx.fillRect(0, 0, PW, PH);
  let dots = 0;
  const bgL = rgbToHsl(parseColor(bg))[2];

  const stipple = (poly, color, alpha, R, kind, extra = {}) => {
    const A = area(poly); if (A < 0.5) return;
    const isGround = extra.ground;
    const rr = isGround ? [prof.r[0] * 0.7, prof.r[1] * 0.8] : prof.r;
    const rMean = (rr[0] + rr[1]) / 2;
    const a = Math.max(0, Math.min(255, alpha)) / 255;
    // coverage = expected dab area / shape area. Reserves are denser and opaque.
    // Calibrated against the watercolour plates at thumbnail scale (tools/thumb_delta.py): light
    // glazes must stay light, so coverage rises steeply with alpha rather than linearly.
    let cov = (kind === 'wash' ? (o.washK ?? 1.7) * Math.pow(a, o.washGamma ?? 1.0) : (o.fillK ?? 1.05) * Math.pow(a, o.fillGamma ?? 1.15)) * prof.coverage;
    if (isGround) cov = (0.05 + 0.2 * a) * (o.groundTexture ?? 1);
    cov = Math.min(kind === 'wash' ? 1.5 : 1.15, cov);
    const n = Math.min(Math.round((60000 * PW * PH) / 360000), Math.round((cov * A) / (Math.PI * rMean * rMean * (prof.stretch > 1 ? prof.stretch * 0.85 : 0.9))));
    if (n < 1) return;
    const pick = family(color, prof, R, { noComplement: isGround || kind === 'wash' && a > 0.9, ref: o.ref, refScale: o.refScale, w: isGround ? 0.85 : kind === 'wash' ? 0.6 : 0.68 });
    const [x0, y0, x1, y1] = bbox(poly);
    const bleedPad = !isGround && extra.bleed ? extra.bleed * 9 : 0;
    const border = extra.border ?? 0.4;
    const dir = prof.stretch > 1 ? axis(poly) : null;
    const alphaMark = isGround ? 0.55 : kind === 'wash' ? 0.92 + 0.08 * a : 0.82 + 0.16 * a;
    // Stratified (jittered-cell) placement: even but irregular, never a grid or white noise.
    const cell = Math.sqrt(A / n);
    const clusterN = prof.cluster && !isGround ? prof.cluster : 0;
    const M = fast && (poly.length > 48 || A > 40000) ? rasterMask(poly, bleedPad) : null;
    const needEdge = !isGround && (border > 0.05 || bleedPad > 0) && (M || poly.length < 400);
    for (let gy = y0 - bleedPad; gy < y1 + bleedPad; gy += cell) {
      for (let gx = x0 - bleedPad; gx < x1 + bleedPad; gx += cell) {
        const x = gx + R.float(-0.15, 1.15) * cell; const y = gy + R.float(-0.15, 1.15) * cell;
        const inPoly = M ? M.inside(x, y) : inside(x, y, poly);
        let keep = inPoly;
        let shade = 0;
        if (needEdge) {
          const e = M ? M.edgeDist(x, y, inPoly) : edgeDist(x, y, poly);
          if (!inPoly) keep = bleedPad > 0 && R.next() < 0.45 * Math.exp(-e / Math.max(0.5, bleedPad * 0.35));
          else if (e < 2.4) { shade = -0.06 * border; if (R.next() < border * 0.45) dab(ctx, x + R.signed(0.8), y + R.signed(0.8), R.float(rr[0], rr[1]), pick(x, y), alphaMark, R, prof.stretch, dir); }
        }
        if (!keep) continue;
        const r = R.next() < 0.03 && !isGround ? R.float(rr[1] * 1.2, rr[1] * 1.6) : R.float(rr[0], rr[1]);
        const col = shade ? family(color, prof, R, { shade, ref: o.ref, refScale: o.refScale, w: 0.68 })(x, y) : pick(x, y);
        if (clusterN) {
          const k = 1 + Math.floor(R.next() * clusterN);
          for (let j = 0; j < k; j++) { const cx2 = x + R.signed(r * 2.2); const cy2 = y + R.signed(r * 2.2); dab(ctx, cx2, cy2, r * R.float(0.7, 1), j ? pick(cx2, cy2) : col, alphaMark, R, prof.stretch, dir); }
          dots += k;
        } else { dab(ctx, x, y, r, col, alphaMark, R, prof.stretch, dir); dots++; }
      }
    }
  };

  const chain = (path, s, R, gapExtra = 0) => {
    const [mult, gap0, alpha, dv] = BRUSHES[s.brush] || BRUSHES.HB;
    // Per-plate chain character: chainGap < 1 closes the gaps (engraving-like beads), chainStep < 1 packs them.
    const gap = gap0 * (o.chainGap ?? 1);
    const r = Math.max(0.32, Math.min(1.7, (0.3 + (s.weight || 0.5) * 0.55) * mult)) * (o.lineScale || 1) * (o.dotScale || 1);
    const step = r * 1.55 * (o.chainStep ?? 1);
    const pick = family(s.color, { ...prof, hue: 4, neighbour: 0.08, complement: 0 }, R, { shade: dv, ref: o.ref, refScale: o.refScale, w: 0.35 });
    let acc = 0;
    for (let i = 1; i < path.length; i++) {
      const [ax, ay] = path[i - 1]; const [bx, by] = path[i];
      const len = Math.hypot(bx - ax, by - ay); if (!len) continue;
      const ang = Math.atan2(by - ay, bx - ax);
      while (acc < len) {
        const t = acc / len;
        if (R.next() > gap + gapExtra) {
          const j = R.signed(r * 0.35);
          const px = ax + (bx - ax) * t - Math.sin(ang) * j; const py = ay + (by - ay) * t + Math.cos(ang) * j;
          dab(ctx, px, py, r * R.float(0.8, 1.1), pick(px, py), alpha, R, 1.25, ang);
          dots++;
        }
        acc += step * R.float(0.85, 1.2);
      }
      acc -= len;
    }
  };

  const hatchLines = (poly, h, R) => {
    const [x0, y0, x1, y1] = bbox(poly);
    const a = (h.angle * Math.PI) / 180; const ux = Math.cos(a); const uy = -Math.sin(a); const nx = -uy; const ny = ux;
    const cx = (x0 + x1) / 2; const cy = (y0 + y1) / 2; const half = Math.hypot(x1 - x0, y1 - y0) / 2 + 2;
    const HM = fast && poly.length > 48 ? rasterMask(poly, 0) : null; const ins = (x, y) => (HM ? HM.inside(x, y) : inside(x, y, poly));
    for (let off = -half; off <= half; off += h.dist * (1 + R.signed(h.rand || 0))) {
      // Walk the line and keep the runs inside the shape.
      let run = [];
      for (let t = -half; t <= half; t += 1.2) {
        const x = cx + nx * off + ux * t; const y = cy + ny * off + uy * t;
        if (ins(x, y)) run.push([x, y]); else if (run.length) { if (run.length > 1) chain(run, { brush: h.brush, color: h.color, weight: h.weight }, R, 0.05); run = []; }
      }
      if (run.length > 1) chain(run, { brush: h.brush, color: h.color, weight: h.weight }, R, 0.05);
    }
  };

  for (const op of log.ops) {
    const R = makeRng(seed, 1 + op.i);
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
      // Flow-field line: follows a gentle wave along its direction (field geometry is approximated).
      const k = Math.max(4, Math.ceil(op.len / 3)); path = []; let [x, y] = op.c; let a = (op.dir * Math.PI) / 180; const ph = R.float(0, 6.28);
      for (let i = 0; i <= k; i++) { path.push([x, y]); a += Math.sin(ph + i * 0.35) * 0.09; x += Math.cos(a) * (op.len / k); y -= Math.sin(a) * (op.len / k); }
    }
    const isGround = op.type === 'shape' && op.rect && area(poly) > PW * PH * 0.9;
    if (poly && op.wash) stipple(poly, op.wash.color, op.wash.alpha, R, 'wash');
    if (poly && op.fill) stipple(poly, op.fill.color, op.fill.alpha, R, 'fill', { bleed: op.fill.bleed, border: op.fill.border, ground: isGround });
    if (poly && op.hatch) hatchLines(poly, op.hatch, R);
    if (path && op.stroke && !isGround) chain(path, op.stroke, R);
  }
  ctx.globalAlpha = 1;
  return { dots, background: bg, backgroundLightness: bgL };
}

/** Paint one moving particle as a pointillist mark (positions and timing are the caller's, untouched). */
export function particleMark(ctx, p, q) {
  const a = 0.78 + 0.22 * q.alpha;
  ctx.globalAlpha = a; ctx.fillStyle = p.color;
  if (p.dash) {
    // A short dash becomes a chain of three touching beads along its original direction.
    const dx = Math.cos(q.angle) * p.len * 0.5; const dy = Math.sin(q.angle) * p.len * 0.5;
    const r = Math.max(0.55, p.size * 0.55);
    for (const t of [-0.7, 0, 0.7]) { ctx.beginPath(); ctx.ellipse(q.x + dx * t, q.y + dy * t, r, r * 0.82, q.angle, 0, Math.PI * 2); ctx.fill(); }
  } else {
    ctx.beginPath(); ctx.ellipse(q.x, q.y, p.size * 0.95, p.size * 0.8, q.angle, 0, Math.PI * 2); ctx.fill();
  }
}
