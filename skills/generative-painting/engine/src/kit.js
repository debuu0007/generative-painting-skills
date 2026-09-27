/** Drawing helpers for the reconstructed (inferred) botanical plates. p5.brush WEBGL, DEGREES.
 * The supplied sketches (06, 08, 20) never pass through these helpers.
 *
 * Pinned-build behaviour this relies on (see harness/diag-*.html):
 * - brush.fill() mixes like pigment (yellow over cobalt reads green), so light colour on a dark
 *   ground is painted over a flat brush.wash() "reserve" first, like leaving paper unpainted.
 * - fill alpha below ~60 nearly disappears on light paper; glazes accumulate by overlap instead.
 * All randomness goes through p.random / p.randomGaussian so the plate seed controls everything. */
export function createKit(p, brush) {
  const W = p.width; const H = p.height; // logical plate size: 600×600 by default, any size via plateSetup
  const R = (a = 1, b) => (b === undefined ? p.random(a) : p.random(a, b));
  const G = (mean = 0, sd = 1) => p.randomGaussian(mean, sd);
  const pick = (arr) => arr[Math.floor(p.random(arr.length))];
  const chance = (k) => p.random() < k;
  const rad = (deg) => (deg * Math.PI) / 180;
  const polar = (x, y, deg, r) => [x + Math.cos(rad(deg)) * r, y + Math.sin(rad(deg)) * r];
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (a, b, t) => {
    const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const A = h(a); const B = h(b);
    return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
  };

  /** Asymmetric petal outline from its base (x, y) pointing along `angle`. Returns world points. */
  function petalOutline(x, y, angle, len, wid, o = {}) {
    const asym = o.asym ?? R(-0.22, 0.22);
    const base = o.base ?? 0.1;
    const widest = o.widest ?? R(0.55, 0.72);
    const notch = o.notch ?? 0;
    const ruffle = o.ruffle ?? 0;
    const bend = o.bend ?? R(-0.12, 0.12);
    const jitter = o.jitter ?? 0.035;
    const n = o.n ?? 7;
    const phase = R(360);
    const profile = (t) => {
      const w = t <= widest
        ? base + (1 - base) * Math.pow(Math.sin((Math.PI / 2) * (t / widest)), 0.85)
        : Math.sqrt(Math.max(0, 1 - Math.pow((t - widest) / (1 - widest), 2)));
      return w * (1 + ruffle * Math.sin(rad(t * 900 + phase)));
    };
    const local = [];
    const side = (sign, from, to, step) => {
      for (let i = from; step > 0 ? i <= to : i >= to; i += step) {
        const t = i / n;
        const hw = (wid / 2) * profile(t) * (1 + sign * asym);
        const ax = len * t;
        const ay = bend * len * t * t + sign * hw;
        local.push([ax + G(0, jitter * wid), ay + G(0, jitter * wid)]);
      }
    };
    local.push([0, 0]);
    side(-1, 1, n - 1, 1);
    if (notch > 0) {
      local.push([len * 0.99, bend * len - wid * 0.12]);
      local.push([len * (1 - notch), bend * len]);
      local.push([len * 0.99, bend * len + wid * 0.12]);
    } else {
      local.push([len, bend * len + G(0, jitter * wid)]);
    }
    side(1, n - 1, 1, -1);
    const c = Math.cos(rad(angle));
    const s = Math.sin(rad(angle));
    return local.map(([lx, ly]) => [x + lx * c - ly * s, y + lx * s + ly * c]);
  }

  /** Scale an outline about a point (for inner glazes that stay inside a petal). */
  function shrink(pts, k, cx, cy) {
    return pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
  }
  function wobble(pts, amt) {
    return pts.map(([x, y]) => [x + G(0, amt), y + G(0, amt)]);
  }
  function centroid(pts) {
    let x = 0; let y = 0;
    for (const q of pts) { x += q[0]; y += q[1]; }
    return [x / pts.length, y / pts.length];
  }

  function shape(pts, curvature = 0.5, close = true) {
    brush.beginShape(curvature);
    for (const q of pts) brush.vertex(q[0], q[1], q[2]);
    brush.endShape(close);
  }

  /** Watercolour glaze (pigment-mixing fill with bleed and granulation). */
  function glaze(pts, color, alpha, o = {}) {
    brush.noStroke();
    brush.noHatch();
    brush.fill(color, alpha);
    brush.fillBleed(o.bleed ?? 0.2, o.dir ?? 'out');
    brush.fillTexture(o.texture ?? 0.35, o.border ?? 0.35);
    shape(pts, o.curvature ?? 0.5);
    brush.noFill();
  }

  /** Flat opaque-ish underlayer so later glazes keep their hue on dark grounds. */
  function reserve(pts, color, alpha = 255, curvature = 0.5, layers = 3) {
    brush.noStroke();
    brush.noFill();
    brush.noHatch();
    const [cx, cy] = centroid(pts);
    const size = Math.sqrt(Math.abs(area(pts)));
    // A core pass at full strength inside the outline, then wobbled translucent margins:
    // the hue stays pure in the body while the edge is irregular and soft like pooled paint.
    brush.wash(color, alpha);
    shape(layers > 1 ? shrink(pts, 0.95, cx, cy) : pts, curvature);
    for (let i = 1; i < layers; i++) {
      brush.wash(color, alpha * (0.62 - 0.12 * i));
      shape(wobble(shrink(pts, 1.005 - 0.01 * i, cx, cy), size * 0.014), curvature);
    }
    brush.noWash();
  }
  function area(pts) {
    let s = 0;
    for (let i = 0; i < pts.length; i++) { const a = pts[i]; const b = pts[(i + 1) % pts.length]; s += a[0] * b[1] - b[0] * a[1]; }
    return s / 2;
  }

  /** Graphite / ink outline, slightly off-register from the paint with limited overshoot. */
  function contour(pts, o = {}) {
    brush.noFill();
    brush.noHatch();
    brush.set(o.brush ?? 'HB', o.color ?? '#3a2f28', o.weight ?? 0.6);
    const q = wobble(pts, o.jitter ?? 1.2);
    if (o.open) {
      const start = Math.floor(R(q.length));
      const run = [];
      const count = Math.max(3, Math.floor(q.length * (o.open === true ? R(0.55, 0.85) : o.open)));
      for (let i = 0; i < count; i++) run.push(q[(start + i) % q.length]);
      shape(run, o.curvature ?? 0.5, false);
    } else {
      shape(q, o.curvature ?? 0.5, true);
    }
    brush.noStroke();
  }

  /** Hatching clipped to a closed outline, direction chosen to follow the form. */
  function hatchIn(pts, o = {}) {
    brush.noStroke();
    brush.noFill();
    brush.hatchStyle(o.brush ?? 'HB', o.color ?? '#2d2620', o.weight ?? 0.4);
    brush.hatch(o.dist ?? 4, o.angle ?? 45, { rand: o.rand ?? 0.15, gradient: o.gradient ?? false });
    shape(pts, o.curvature ?? 0.5);
    brush.noHatch();
  }

  function line(x1, y1, x2, y2, o = {}) {
    brush.noFill();
    brush.set(o.brush ?? 'HB', o.color ?? '#2d2620', o.weight ?? 0.5);
    brush.line(x1, y1, x2, y2);
  }

  function stem(pts, o = {}) {
    brush.noFill();
    brush.set(o.brush ?? 'HB', o.color ?? '#4d6b2a', o.weight ?? 1);
    brush.spline(pts, o.curvature ?? 0.6);
  }

  /** Curved stem from (x0, y0) to (x1, y1) with a lateral bow. */
  function stemPath(x0, y0, x1, y1, bow = R(-0.25, 0.25), steps = 5) {
    const dx = x1 - x0; const dy = y1 - y0;
    const nx = -dy; const ny = dx;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const b = Math.sin(Math.PI * t) * bow;
      pts.push([x0 + dx * t + nx * b + G(0, 1.2), y0 + dy * t + ny * b + G(0, 1.2), lerp(1.2, 0.8, t)]);
    }
    return pts;
  }

  /** Closed ribbon polygon along a path (stems, tendrils, strokes of paint), tapering to the end. */
  function strip(path, width, taper = 0.35) {
    const left = []; const right = [];
    for (let i = 0; i < path.length; i++) {
      const a = path[Math.max(0, i - 1)]; const b = path[Math.min(path.length - 1, i + 1)];
      const dx = b[0] - a[0]; const dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1;
      const w = (width / 2) * lerp(1, taper, i / (path.length - 1)) * (1 + G(0, 0.08));
      left.push([path[i][0] - (dy / l) * w, path[i][1] + (dx / l) * w]);
      right.push([path[i][0] + (dy / l) * w, path[i][1] - (dx / l) * w]);
    }
    return left.concat(right.reverse());
  }

  /** Seeded dart-throwing placement with a minimum spacing (no stamp grid). */
  function scatter(count, minDist, x0 = 0, y0 = 0, x1 = W, y1 = H, tries = 40) {
    const pts = [];
    for (let i = 0; i < count; i++) {
      for (let t = 0; t < tries; t++) {
        const q = [R(x0, x1), R(y0, y1)];
        if (pts.every((o) => Math.hypot(o[0] - q[0], o[1] - q[1]) >= minDist)) { pts.push(q); break; }
      }
    }
    return pts;
  }

  /** Pigment speckle: tiny marks scattered with a gaussian falloff. */
  function stipple(cx, cy, rx, ry, count, color, o = {}) {
    brush.noFill();
    brush.set(o.brush ?? 'pen', color, o.weight ?? 0.5);
    for (let i = 0; i < count; i++) {
      const x = cx + G(0, rx);
      const y = cy + G(0, ry);
      const a = R(360);
      const l = o.len ?? R(0.6, 1.8);
      brush.line(x, y, x + Math.cos(rad(a)) * l, y + Math.sin(rad(a)) * l);
    }
  }

  /** Full-square glaze passes for a ground colour, with local pigment variation. */
  function ground(colors, o = {}) {
    brush.noStroke();
    brush.noHatch();
    for (const [color, alpha] of colors) {
      brush.fill(color, alpha);
      brush.fillBleed(o.bleed ?? 0.05, 'out');
      brush.fillTexture(o.texture ?? 0.4, o.border ?? 0.2);
      brush.rect(-20, -20, W + 40, H + 40);
    }
    brush.noFill();
  }

  /** Localized blooms/stains in the paper (static, never time-varying). */
  function stains(color, alpha, count, rmin, rmax, o = {}) {
    brush.noStroke();
    for (let i = 0; i < count; i++) {
      brush.fill(color, alpha);
      brush.fillBleed(o.bleed ?? 0.5, 'out');
      brush.fillTexture(o.texture ?? 0.7, o.border ?? 0.6);
      brush.circle(o.x ? o.x() : R(W), o.y ? o.y() : R(H), R(rmin, rmax), 0.4);
    }
    brush.noFill();
  }

  /** Sparse paper fibres. */
  function fibers(color, count, o = {}) {
    brush.noFill();
    brush.set(o.brush ?? '2H', color, o.weight ?? 0.2);
    for (let i = 0; i < count; i++) {
      const x = R(W); const y = R(H); const a = R(360); const l = R(4, 14);
      brush.line(x, y, x + Math.cos(rad(a)) * l, y + Math.sin(rad(a)) * l);
    }
  }

  /** A flower from asymmetric petals: glazes accumulate, edges bleed, contours overshoot. */
  function flower(x, y, o = {}) {
    const n = o.petals ?? 5;
    const rot = o.rotation ?? R(360);
    const out = [];
    const colors = o.colors ?? ['#e0542f'];
    const passes = o.passes ?? 2;
    for (let i = 0; i < n; i++) {
      const a = rot + (360 / n) * i + G(0, o.spread ?? 7);
      const len = (o.len ?? 60) * R(0.82, 1.15);
      const wid = (o.wid ?? 42) * R(0.85, 1.15);
      const pts = petalOutline(x, y, a, len, wid, { notch: o.notch ?? 0, ruffle: o.ruffle ?? 0.04, bend: R(-0.18, 0.18) });
      out.push({ pts, a, len, wid });
    }
    const order = o.stack === 'random' ? out.slice().sort(() => R() - 0.5) : out;
    for (const pet of order) {
      if (o.reserve) reserve(pet.pts, o.reserve, o.reserveAlpha ?? 255, 0.5);
      for (let k = 0; k < passes; k++) {
        const col = colors[(k + Math.floor(R(colors.length))) % colors.length];
        const pts = k === 0 ? pet.pts : shrink(wobble(pet.pts, 1.5), R(0.55, 0.85), x, y);
        glaze(pts, col, (o.alpha ?? 150) * (k === 0 ? 1 : 0.8), { bleed: o.bleed ?? R(0.12, 0.3), texture: o.texture ?? 0.35, border: o.border ?? 0.45 });
      }
      if (o.edge) glaze(shrink(pet.pts, 1.0, x, y), o.edge, o.edgeAlpha ?? 70, { bleed: 0.08, dir: 'in', texture: 0.2, border: 0.9 });
      if (o.veins) {
        const vc = o.veins;
        for (let v = 0; v < (o.veinCount ?? 3); v++) {
          const da = G(0, 9);
          const [x2, y2] = polar(x, y, pet.a + da, pet.len * R(0.45, 0.8));
          line(...polar(x, y, pet.a + da, pet.len * 0.12), x2, y2, { brush: o.veinBrush ?? '2H', color: vc, weight: o.veinWeight ?? 0.35 });
        }
      }
      if (o.contour && chance(o.contourChance ?? 0.85)) {
        contour(pet.pts, { color: o.contour, weight: o.contourWeight ?? 0.55, brush: o.contourBrush ?? 'HB', open: o.contourOpen ?? true, jitter: 1.4 });
      }
    }
    if (o.center) {
      const cr = o.centerR ?? (o.len ?? 60) * 0.22;
      const disc = petalCircle(x, y, cr, 9, 0.18);
      if (o.centerReserve) reserve(disc, o.centerReserve, 255, 0.6);
      glaze(disc, o.center, o.centerAlpha ?? 200, { bleed: 0.25, texture: 0.5, border: 0.6 });
      if (o.centerDark) glaze(shrink(disc, 0.55, x, y), o.centerDark, 180, { bleed: 0.2, texture: 0.6, border: 0.5 });
      if (o.stamens) stipple(x, y, cr * 0.45, cr * 0.45, o.stamenCount ?? 40, o.stamens, { weight: 0.7 });
    }
    return out;
  }

  /** Irregular closed ring of points (a hand-drawn circle outline). */
  function petalCircle(x, y, r, n = 10, irregular = 0.12) {
    const pts = [];
    const off = R(360);
    for (let i = 0; i < n; i++) {
      const a = off + (360 / n) * i;
      pts.push(polar(x, y, a, r * (1 + G(0, irregular))));
    }
    return pts;
  }

  /** Leaf: pointed ellipse with midrib. */
  function leafOutline(x, y, angle, len, wid) {
    return petalOutline(x, y, angle, len, wid, { base: 0.02, widest: R(0.35, 0.5), bend: R(-0.2, 0.2), jitter: 0.02 });
  }

  /** The visible band of a circle far larger than the plate (a planet limb, a horizon, a ridge):
   * top edge y(x) = cy - sqrt(r0² - (x - cx)²), sampled only across the plate width. p5.brush breaks
   * on huge off-canvas polygons, so never draw such a circle directly. r1 = null closes the band
   * along the bottom edge; otherwise the band runs between radii r0 and r1. Fill big bands with
   * reserve() washes rather than glaze(): large glazes grow spiky "mountain" bleed. */
  function arcBand(cx, cy, r0, r1 = null, step = 24) {
    const top = (x, r) => cy - Math.sqrt(Math.max(0, r * r - (x - cx) * (x - cx)));
    const a = []; for (let x = -40; x <= W + 40; x += step) a.push([x, top(x, r0)]);
    if (r1 === null) return a.concat([[W + 40, H + 40], [-40, H + 40]]);
    const b = []; for (let x = W + 40; x >= -40; x -= step) b.push([x, top(x, r1)]);
    return a.concat(b);
  }

  return {
    W, H, arcBand,
    R, G, pick, chance, rad, polar, lerp, mix,
    petalOutline, leafOutline, petalCircle, shrink, wobble, centroid,
    shape, glaze, reserve, contour, hatchIn, line, stem, stemPath, strip, stipple, scatter,
    ground, stains, fibers, flower,
  };
}

/** Common setup for reconstructed plates: canvas at the plate density, DEGREES, brush scale. */
export function plateSetup(p, brush, density = 1, background = '#f6efe0', w = 600, h = 600) {
  p.createCanvas(w, h, p.WEBGL);
  p.pixelDensity(density);
  p.angleMode(p.DEGREES);
  // Brush scale is calibrated per frame width: 3 for the 600 square, 6 for a 1920-wide plate
  // (otherwise lines read hair-thin at 1080p).
  brush.scaleBrushes(w > 1000 ? 6 : 3);
  p.background(background);
  p.noLoop();
}
