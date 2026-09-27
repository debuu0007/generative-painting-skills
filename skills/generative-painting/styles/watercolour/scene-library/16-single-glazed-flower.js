/** Shot 16 (and 17) — Single glazed flower (reconstructed). One central flower: red/pink upper
 * petals, orange/yellow lower petals, green stem; many overlapping glazes, rough graphite
 * outlines, occasional black construction marks. Painted once (density 3) and reused by shot 17
 * as an extreme crop, so both shots share exactly the same geometry and seed. */
import { createKit, plateSetup } from '../kit.js';

export const singleGlazedFlower = {
  id: 'single-glazed-flower',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#f8f5ef');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#f4efe6', 60]], { texture: 0.7, border: 0.2 });
      const cx = 300; const cy = 262;
      // Stem and one leaf.
      const stemPts = k.stemPath(cx + 10, cy + 40, cx - 30, 640, 0.1, 7);
      const ribbon = k.strip(stemPts, 10, 0.8);
      k.glaze(ribbon, '#4f8a3a', 200, { bleed: 0.04, texture: 0.6, border: 0.6 });
      k.contour(ribbon, { brush: 'HB', color: '#2d3a22', weight: 0.4, open: 0.6 });
      const leaf = k.leafOutline(...stemPts[4].slice(0, 2), 200, 120, 44);
      k.glaze(leaf, '#5f9a44', 190, { bleed: 0.25, texture: 0.7 });
      k.glaze(k.shrink(leaf, 0.6, ...stemPts[4].slice(0, 2)), '#3f7a30', 150, { bleed: 0.2 });
      k.contour(leaf, { brush: 'HB', color: '#2d3a22', weight: 0.4, open: 0.8 });
      // Petals: upper fan red/pink, lower fan orange/yellow, each with 3-4 glazes.
      const petals = [];
      for (let i = 0; i < 9; i++) {
        const a = -90 + (i - 4) * 36 + G(0, 6);
        const upper = Math.sin(k.rad(a)) < 0.15;
        const len = (upper ? 190 : 165) * R(0.88, 1.08);
        const pts = k.petalOutline(cx, cy, a, len, len * R(0.62, 0.78), { ruffle: 0.1, notch: k.chance(0.5) ? 0.07 : 0, bend: R(-0.18, 0.18) });
        petals.push({ a, len, pts, upper });
      }
      petals.sort((a, b) => (a.upper === b.upper ? 0 : a.upper ? -1 : 1));
      for (const pet of petals) {
        const cols = pet.upper ? ['#d91e3a', '#e8457a', '#c2143a', '#f06292'] : ['#f28c28', '#f7c948', '#f5a623', '#e8742a'];
        k.glaze(pet.pts, cols[0], pet.upper ? 200 : 225, { bleed: 0.2, texture: 0.85, border: 0.8 });
        if (!pet.upper) k.glaze(pet.pts, '#f5b700', 190, { bleed: 0.12, texture: 0.9, border: 0.9 });
        for (let g = 0; g < 3; g++) {
          const inner = k.petalOutline(cx, cy, pet.a + G(0, 7), pet.len * R(0.45, 0.9), pet.len * R(0.3, 0.5), { ruffle: 0.1 });
          k.glaze(inner, k.pick(cols.slice(1)), R(140, 190), { bleed: R(0.2, 0.4), texture: 0.85, border: 0.6 });
        }
        k.glaze(k.petalOutline(cx, cy, pet.a, pet.len * 0.35, pet.len * 0.3), pet.upper ? '#8e0b2c' : '#d0561a', 170, { bleed: 0.3 });
        k.contour(pet.pts, { brush: k.pick(['HB', '2B']), color: '#2b2522', weight: R(0.45, 0.8), open: R(0.5, 0.9), jitter: 1.6 });
        for (let v = 0; v < 4; v++) k.line(...polar(cx, cy, pet.a + G(0, 6), 26), ...polar(cx, cy, pet.a + G(0, 10), pet.len * R(0.5, 0.85)), { brush: '2H', color: pet.upper ? '#7a0a22' : '#a04a10', weight: 0.3 });
      }
      // Magenta pigment blooms where paint pooled.
      for (let i = 0; i < 6; i++) {
        const [x, y] = polar(cx, cy, R(360), R(40, 130));
        k.glaze(k.petalCircle(x, y, R(10, 26), 8, 0.3), k.pick(['#c2185b', '#ad1457', '#ff5a1f']), 150, { bleed: 0.45, texture: 0.8 });
      }
      const disc = k.petalCircle(cx, cy, 30, 10, 0.12);
      k.glaze(disc, '#f7c948', 210, { bleed: 0.2 });
      k.glaze(k.petalCircle(cx, cy, 16, 8, 0.2), '#5a1a08', 210, { bleed: 0.2 });
      k.stipple(cx, cy, 16, 16, 90, '#2a0d04', { weight: 0.5 });
      // Occasional black construction marks and a scribble, kept to the margins of the form.
      k.line(cx - 250, cy + 190, cx - 120, cy + 184, { brush: 'rotring', color: '#141212', weight: 0.3 });
      k.line(cx + 190, cy - 215, cx + 196, cy - 110, { brush: 'rotring', color: '#141212', weight: 0.3 });
      for (const [x, y] of [[cx - 205, cy - 170], [cx + 205, cy + 150]]) {
        k.line(x - 9, y, x + 9, y, { brush: 'rotring', color: '#141212', weight: 0.35 });
        k.line(x, y - 9, x, y + 9, { brush: 'rotring', color: '#141212', weight: 0.35 });
      }
      brush.noFill(); brush.set('2H', '#141212', 0.3); brush.arc(cx, cy, 212, 200, 250);
      brush.set('pen', '#141212', 0.5);
      brush.beginStroke('curve', cx + 150, cy + 120);
      let a = R(360);
      for (let s = 0; s < 10; s++) { a += R(110, 190); brush.move(a, R(8, 22), R(0.6, 1.2)); }
      brush.endStroke(a, 0.5);
    };
  },
};
