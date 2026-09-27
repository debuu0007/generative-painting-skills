/** Moving passages for both painting styles.
 *   dust    a painted form loosens: boundary particles drift outward while the core holds
 *   radial  a burst: particles release from a compressed core, overshoot slightly and settle
 *   school  an arc of point-built small fish loosens tangentially into coloured points
 *   jelly   a compressed cluster opens into a jelly bell; tentacle chains arrive last
 * Every particle's identity (base, colour, size, timing) is built once from the seed; its position
 * is a pure function of shot-local progress u, so any seek order yields the same frame and nothing
 * is re-randomised per frame. Geometry is shared with the plates through exported masks.
 * How the marks are painted follows the film's STYLE: watercolour = pigment dots and dashes with
 * multiply (they accumulate like paint); pointillism = rounded dabs, normal compositing. */
import { makeRng } from './rng.js';
import { particleMark } from './pointillism.js';
import { STYLE } from './film.js';

const TAU = Math.PI * 2;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t, s = 1.25) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);

/** Shot 10 flower: six uneven, notched petals around (300, 300). Returns the mask radius at angle. */
export const DUST = { cx: 300, cy: 306, r: 205 };
export function dustRadius(theta) {
  const petals = 6;
  const lobe = Math.pow(Math.abs(Math.cos((petals * theta) / 2)), 0.55);
  const uneven = 1 + 0.07 * Math.sin(theta * 2 + 0.7) + 0.05 * Math.sin(theta * 3 + 2.1);
  const notch = 1 - 0.1 * Math.pow(Math.abs(Math.cos((petals * theta) / 2)), 24);
  return DUST.r * (0.34 + 0.66 * lobe) * uneven * notch;
}

/** Shot 12 flower: a round bloom of ten scalloped petals around the centre. */
export const RADIAL = { cx: 300, cy: 300, r: 172 };
const RADIAL_ROT = 0.31;
export function radialRadius(theta) {
  const scallop = Math.pow(Math.abs(Math.cos((10 * theta) / 2)), 0.8);
  return RADIAL.r * (0.78 + 0.22 * scallop) * (1 + 0.03 * Math.sin(theta * 3 + 1));
}

function pickWeighted(R, list) {
  let total = 0;
  for (const [, w] of list) total += w;
  let v = R.float(0, total);
  for (const [c, w] of list) { if ((v -= w) <= 0) return c; }
  return list[0][0];
}

function buildWatercolourParticles(kind, seed) {
  const R = makeRng(seed, kind === 'dust' ? 10 : 12);
  const out = [];
  if (kind === 'dust') {
    const n = 5200;
    while (out.length < n) {
      const theta = R.float(0, TAU);
      const rho = Math.sqrt(R.next());
      const rm = dustRadius(theta);
      const r = rho * rm;
      const x = DUST.cx + Math.cos(theta) * r;
      const y = DUST.cy + Math.sin(theta) * r;
      // Denser pigment toward petal edges and in the heart, sparser mid-petal.
      const keep = 0.45 + 0.55 * Math.max(smooth(0.7, 1, rho), 1 - smooth(0.05, 0.3, rho));
      if (R.next() > keep) continue;
      const color = rho < 0.2
        ? pickWeighted(R, [['#8c0f22', 3], ['#b3122b', 3], ['#4a0a10', 1], ['#e0a030', 1]])
        : rho < 0.65
          ? pickWeighted(R, [['#d7263d', 3], ['#e8553f', 3], ['#f0664f', 2], ['#c2185b', 1]])
          : pickWeighted(R, [['#f0664f', 3], ['#f58a6a', 2], ['#f06292', 2], ['#f5a623', 1.5], ['#f7c948', 0.8]]);
      const loosen = smooth(0.5, 1, rho) * R.float(0.35, 1);
      out.push({
        x, y, color,
        size: R.float(0.7, 1.9) * (rho < 0.2 ? 0.9 : 1),
        dash: R.next() < 0.32,
        angle: theta + R.signed(0.9),
        len: R.float(2, 5.5),
        alpha: R.float(0.55, 0.92),
        dir: theta + R.signed(0.55),
        travel: loosen * R.float(22, 78),
        swirl: R.signed(0.35) * loosen,
        delay: (1 - rho) * 0.55 + R.float(0, 0.2),
        fade: loosen,
      });
    }
  } else {
    const n = 5200;
    for (let i = 0; i < n; i++) {
      const halo = R.next() < 0.22;
      const rho = halo ? R.float(1.02, 1.5) : Math.pow(R.next(), 0.7);
      // Particles gather into ten petal rays (wider toward the tips) so the settled state reads as a bloom.
      const petal = Math.floor(R.float(0, 10));
      // Petal half-width grows from the heart and rounds off at the tip (a wedge with a rounded end).
      const spread = halo ? 0.3 : 0.1 + 0.22 * Math.sin(Math.min(1, rho) * Math.PI * 0.62);
      const theta = (petal / 10) * TAU + RADIAL_ROT + (R.next() - R.next()) * spread * 1.35;
      const r = rho * radialRadius(theta);
      const color = halo
        ? pickWeighted(R, [['#f5a623', 3], ['#f7c948', 3], ['#f28c28', 2], ['#e8553f', 1]])
        : rho < 0.3
          ? pickWeighted(R, [['#b3122b', 3], ['#f5a623', 1], ['#7a0c1c', 1]])
          : pickWeighted(R, [['#d7263d', 3], ['#e0457a', 3], ['#f06292', 2], ['#f28c28', 1], ['#f7c948', 0.6]]);
      out.push({
        theta, r, color,
        size: R.float(0.7, halo ? 1.6 : 2.0),
        dash: R.next() < (halo ? 0.55 : 0.3),
        angle: theta + R.signed(0.4),
        len: R.float(2, halo ? 7 : 5),
        alpha: R.float(0.55, 0.92),
        start: R.float(0.06, 0.2),
        delay: rho * 0.18 + R.float(0, 0.1),
        span: R.float(0.42, 0.55),
        wobble: R.signed(0.05),
      });
    }
  }
  return out;
}

/** Position of one particle at shot-local progress u in [0, 1]. Pure function of (particle, u). */
function watercolourParticleAt(kind, p, u) {
  if (kind === 'dust') {
    const t = easeInOut(clamp01((u - p.delay * 0.6) / (1 - p.delay * 0.6)));
    const d = p.travel * t;
    const a = p.dir + p.swirl * t;
    return { x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, alpha: p.alpha * (1 - 0.45 * p.fade * t), angle: p.angle + p.swirl * t };
  }
  // Radial release from a compressed core, capped overshoot, then settled for the rest of the shot.
  const s = clamp01((u - p.delay) / p.span);
  const k = p.start + (1 - p.start) * Math.min(1.08, easeOutBack(s, 1.2));
  const a = p.theta + p.wobble * (1 - s);
  const r = p.r * k;
  return { x: RADIAL.cx + Math.cos(a) * r, y: RADIAL.cy + Math.sin(a) * r, alpha: p.alpha * (0.55 + 0.45 * Math.min(1, s * 1.6)), angle: p.angle };
}


const D2R = Math.PI / 180;

/** The school's arc (shared with the plate so the painted crescent sits just inside it). */
export const SCHOOL = { cx: -60, cy: 660, r0: 430, width: 78, a0: -80, a1: -6 };
/** The jelly's settled form. */
export const JELLY = { cx: 300, cy: 230, r: 128, depth: 0.78 };

function pickWeightedOcean(R, list) {
  let total = 0; for (const [, w] of list) total += w;
  let v = R.float(0, total);
  for (const [c, w] of list) { if ((v -= w) <= 0) return c; }
  return list[0][0];
}

function buildOceanParticles(kind, seed) {
  const R = makeRng(seed, kind === 'school' ? 10 : 12);
  const out = [];
  if (kind === 'school') {
    const nFish = 170;
    for (let f = 0; f < nFish; f++) {
      const a = R.float(SCHOOL.a0, SCHOOL.a1);
      const band = R.next(); // 0 = inner edge of the moving arc, 1 = outer edge
      const rr = SCHOOL.r0 + band * SCHOOL.width;
      const fx = SCHOOL.cx + Math.cos(a * D2R) * rr; const fy = SCHOOL.cy + Math.sin(a * D2R) * rr;
      const heading = (a + 90) * D2R + R.signed(0.12); // swimming along the arc
      const len = R.float(13, 18); const h = len * 0.32;
      const body = pickWeightedOcean(R, [['#1f6f8b', 3], ['#2a5da8', 3], ['#1b8a8a', 2], ['#3b3f9e', 1]]);
      const delay = ((a - SCHOOL.a0) / (SCHOOL.a1 - SCHOOL.a0)) * 0.35 + R.float(0, 0.12);
      for (let i = 0; i < 20; i++) {
        // Sample the fish silhouette: an ellipse body plus a small forked tail.
        let lx; let ly;
        if (i < 16) { const t = R.float(0, TAU); const q = Math.sqrt(R.next()); lx = Math.cos(t) * q * len * 0.42 + len * 0.08; ly = Math.sin(t) * q * h * 0.5; }
        else { lx = -len * R.float(0.38, 0.52); ly = (i % 2 ? 1 : -1) * h * R.float(0.15, 0.45); }
        const x = fx + Math.cos(heading) * lx - Math.sin(heading) * ly;
        const y = fy + Math.sin(heading) * lx + Math.cos(heading) * ly;
        const color = i === 3 ? '#081a2a' : R.next() < 0.1 ? pickWeightedOcean(R, [['#f0664f', 2], ['#f5a623', 1]]) : R.next() < 0.3 ? '#5bb4c8' : body;
        out.push({
          x, y, color, size: R.float(0.7, 1.25), dash: false, angle: heading, len: 0, alpha: R.float(0.8, 1),
          dir: heading + R.signed(0.35) - 0.25 * band, // tangential, bending outward
          travel: (18 + 120 * band) * R.float(0.7, 1.15),
          swirl: R.signed(0.3),
          delay,
        });
      }
    }
  } else {
    const { cx, cy, r, depth } = JELLY;
    const n = 5600;
    for (let i = 0; i < n; i++) {
      const role = pickWeightedOcean(R, [['rim', 34], ['interior', 18], ['gonad', 6], ['tentacle', 30], ['arm', 12]]);
      let tx; let ty; let color; let delay; let size = R.float(0.75, 1.35);
      if (role === 'rim' || role === 'interior') {
        const th = R.float(Math.PI, TAU); // upper dome
        const q = role === 'rim' ? R.float(0.93, 1.02) : Math.sqrt(R.next()) * 0.9;
        tx = cx + Math.cos(th) * r * q; ty = cy + Math.sin(th) * r * depth * q + (role === 'rim' && R.next() < 0.3 ? R.float(0, r * 0.08) : 0);
        if (role === 'rim' && R.next() < 0.25) { const s = R.float(-1, 1); tx = cx + s * r; ty = cy + Math.abs(Math.sin(s * 9)) * r * 0.08; }
        color = role === 'rim' ? pickWeightedOcean(R, [['#f2b8d0', 3], ['#c9a8e8', 3], ['#fff0f6', 2], ['#f5cf8a', 0.6]]) : pickWeightedOcean(R, [['#8a6ab8', 2], ['#c9a8e8', 2], ['#e8a0c0', 1]]);
        delay = R.float(0, 0.12);
      } else if (role === 'gonad') {
        const g = Math.floor(R.float(0, 4)); const ga = (200 + g * 47) * D2R; const t = R.float(0, TAU); const q = Math.sqrt(R.next());
        tx = cx + Math.cos(ga) * r * 0.42 + Math.cos(t) * q * r * 0.12; ty = cy + Math.sin(ga) * r * depth * 0.42 + 6 + Math.sin(t) * q * r * 0.09;
        color = pickWeightedOcean(R, [['#e0457a', 3], ['#f5a623', 1]]); delay = R.float(0.05, 0.15); size = R.float(0.9, 1.5);
      } else if (role === 'tentacle') {
        const k = Math.floor(R.float(0, 12)); const off = (k / 11 - 0.5) * 1.8 * r; const t = Math.pow(R.next(), 0.8);
        const L = r * (2.1 + (k % 3) * 0.35);
        tx = cx + off + Math.sin(t * 7 + k) * 12 * t; ty = cy + r * 0.06 + t * L;
        color = pickWeightedOcean(R, [['#c9a8e8', 3], ['#f2b8d0', 2], ['#8a6ab8', 1]]); delay = 0.18 + t * 0.3 + R.float(0, 0.06); size = R.float(0.6, 1.0);
      } else {
        const k = Math.floor(R.float(0, 4)); const off = (k - 1.5) * r * 0.18; const t = R.next(); const w = (1 - t) * r * 0.1;
        tx = cx + off + Math.sin(t * 5 + k * 2) * 16 * t + R.signed(w); ty = cy + r * 0.1 + t * r * 1.5;
        color = pickWeightedOcean(R, [['#e0457a', 2], ['#f2b8d0', 2], ['#c2185b', 1]]); delay = 0.12 + t * 0.22; size = R.float(0.8, 1.4);
      }
      // Start: a compressed cluster just below the bell's centre.
      const sa = R.float(0, TAU); const sr = Math.abs(R.signed(1)) * 22;
      out.push({ sx: cx + Math.cos(sa) * sr, sy: cy + 40 + Math.sin(sa) * sr * 0.8, tx, ty, color, size, dash: false, angle: R.float(0, Math.PI), len: 0, alpha: R.float(0.82, 1), delay, span: R.float(0.38, 0.5) });
    }
  }
  return out;
}

/** Position of one particle at shot-local progress u in [0, 1]. Pure function of (particle, u). */
function oceanParticleAt(kind, p, u) {
  if (kind === 'school') {
    const t = easeInOut(clamp01((u - p.delay) / (1 - p.delay)));
    const d = p.travel * t; const a = p.dir + p.swirl * t;
    return { x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, alpha: p.alpha, angle: p.angle + p.swirl * t };
  }
  const s = clamp01((u - p.delay) / p.span);
  const k = Math.min(1.06, easeOutBack(s, 1.1));
  return { x: p.sx + (p.tx - p.sx) * k, y: p.sy + (p.ty - p.sy) * k, alpha: p.alpha * (0.65 + 0.35 * Math.min(1, s * 1.5)), angle: p.angle };
}


const OCEAN = new Set(['school', 'jelly']);

export function buildParticles(kind, seed) {
  return OCEAN.has(kind) ? buildOceanParticles(kind, seed) : buildWatercolourParticles(kind, seed);
}

/** Position of one particle at shot-local progress u in [0, 1]. Pure function of (particle, u). */
export function particleAt(kind, p, u) {
  return OCEAN.has(kind) ? oceanParticleAt(kind, p, u) : watercolourParticleAt(kind, p, u);
}

/** Draw pigment-like marks with multiply so overlaps accumulate like paint, never glow. */
function drawWatercolourParticles(ctx, kind, particles, u) {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.lineCap = 'round';
  for (const p of particles) {
    const q = watercolourParticleAt(kind, p, u);
    ctx.globalAlpha = q.alpha;
    if (p.dash) {
      const dx = Math.cos(q.angle) * p.len * 0.5;
      const dy = Math.sin(q.angle) * p.len * 0.5;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size * 0.8;
      ctx.beginPath();
      ctx.moveTo(q.x - dx, q.y - dy);
      ctx.lineTo(q.x + dx, q.y + dy);
      ctx.stroke();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(q.x, q.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** `style` defaults to the film's STYLE; mixed films pass the shot's plate style. */
export function drawParticles(ctx, kind, particles, u, style = STYLE) {
  if (style !== 'pointillism') return drawWatercolourParticles(ctx, kind, particles, u);
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  for (const p of particles) particleMark(ctx, p, particleAt(kind, p, u));
  ctx.restore();
}
