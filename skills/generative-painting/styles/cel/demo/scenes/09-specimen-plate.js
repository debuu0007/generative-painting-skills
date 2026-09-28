/** Shot 09 — Sparse specimen plate (reconstructed). Cream sheet with three distinct weights:
 * a small leaf upper-left, a larger pink/red flower on the right, and a small circular floral
 * diagram lower-left. The circle is drawn artwork (a floral diagram), not a viewport mask. */
import { createKit, plateSetup } from '../kit.js';

export const specimenPlate = {
  id: 'specimen-plate',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#f4ecd8');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#efe4cb', 80]], { texture: 0.75, border: 0.2 });
      k.stains('#e0cfab', 55, 4, 60, 140, { texture: 0.9 });
      k.fibers('#c4b392', 70);
      const graphite = '#4a4540';
      // 1. Small leaf, upper left, with petiole, midrib and pencil veins.
      const lx = 118; const ly = 150; const la = -38;
      const leaf = k.leafOutline(lx, ly, la, 98, 42);
      k.glaze(leaf, '#7f9160', 170, { bleed: 0.2, texture: 0.6, border: 0.6 });
      k.glaze(k.shrink(leaf, 0.7, lx + 30, ly - 22), '#5f7446', 130, { bleed: 0.25 });
      k.contour(leaf, { brush: 'HB', color: graphite, weight: 0.45, jitter: 0.5 });
      k.line(...polar(lx, ly, la + 180, 26), ...polar(lx, ly, la, 92), { brush: 'HB', color: graphite, weight: 0.5 });
      for (let i = 1; i < 7; i++) {
        const [mx, my] = polar(lx, ly, la, i * 13);
        for (const s of [-1, 1]) k.line(mx, my, ...polar(mx, my, la + s * 48, 15 - i), { brush: '2H', color: graphite, weight: 0.3 });
      }
      // 2. The larger pink/red flower, right of centre, on a stem leaving the bottom edge.
      const fx = 432; const fy = 318;
      k.stem(k.stemPath(fx + 4, fy + 30, fx - 30, 640, 0.08, 6), { brush: 'HB', color: '#58703c', weight: 1.1 });
      k.stem(k.stemPath(fx + 7, fy + 30, fx - 26, 640, 0.08, 6), { brush: '2H', color: graphite, weight: 0.35 });
      const sl = k.leafOutline(fx - 16, fy + 170, 200, 70, 26);
      k.glaze(sl, '#7f9160', 150, { bleed: 0.2 });
      k.contour(sl, { brush: 'HB', color: graphite, weight: 0.35, open: 0.7 });
      k.flower(fx, fy, {
        petals: 6, len: 112, wid: 82, colors: ['#d9536b', '#e27d8c', '#c23b4f'], passes: 3, alpha: 170, ruffle: 0.08, notch: 0.06,
        edge: '#9e1f35', edgeAlpha: 90, veins: '#8a2236', veinCount: 4, contour: graphite, contourWeight: 0.4, contourChance: 1,
        center: '#e8b23a', centerR: 17, centerDark: '#7a3a12', stamens: '#3a1a08', stamenCount: 50,
      });
      // 3. Floral diagram, lower left: whorls drawn as rings of arcs, all in graphite and faint tint.
      const dx = 150; const dy = 452; const dr = 74;
      brush.noFill();
      brush.set('HB', graphite, 0.5);
      brush.circle(dx, dy, dr, 0.05);
      brush.set('2H', graphite, 0.3);
      brush.circle(dx, dy, dr * 0.78, 0.04);
      k.line(dx - dr - 10, dy, dx + dr + 10, dy, { brush: '2H', color: graphite, weight: 0.25 });
      k.line(dx, dy - dr - 10, dx, dy + dr + 10, { brush: '2H', color: graphite, weight: 0.25 });
      for (let i = 0; i < 5; i++) {
        const a = -90 + i * 72;
        const [px, py] = polar(dx, dy, a, dr * 0.58);
        const pet = k.petalOutline(...polar(dx, dy, a, dr * 0.34), a, dr * 0.42, dr * 0.34, { jitter: 0.01, asym: 0, bend: 0 });
        k.glaze(pet, '#e7a0ab', 110, { bleed: 0.05, texture: 0.3 });
        k.contour(pet, { brush: 'HB', color: graphite, weight: 0.35, jitter: 0.2 });
        const [sx, sy] = polar(dx, dy, a + 36, dr * 0.3);
        brush.noStroke(); brush.noFill(); brush.wash('#b9804a', 220); brush.circle(sx, sy, 3.2, 0.1); brush.noWash();
        brush.set('HB', graphite, 0.3); brush.circle(sx, sy, 3.4, 0.1);
        k.line(...polar(dx, dy, a + 36, dr * 0.8), ...polar(dx, dy, a + 36, dr * 0.95), { brush: 'HB', color: graphite, weight: 0.3 });
        void px; void py;
      }
      const carpel = k.petalCircle(dx, dy, 10, 8, 0.05);
      k.glaze(carpel, '#9fb07a', 160, { bleed: 0.05 });
      k.contour(carpel, { brush: 'HB', color: graphite, weight: 0.4, jitter: 0.2 });
      for (let i = 0; i < 3; i++) k.line(dx, dy, ...polar(dx, dy, 90 + i * 120, 9), { brush: '2H', color: graphite, weight: 0.3 });
      // Leader lines and a scale tick — annotation marks without lettering.
      k.line(dx + dr * 0.72, dy - dr * 0.72, dx + dr + 40, dy - dr - 24, { brush: '2H', color: graphite, weight: 0.3 });
      k.line(dx + dr + 40, dy - dr - 24, dx + dr + 70, dy - dr - 24, { brush: '2H', color: graphite, weight: 0.3 });
      k.line(fx - 110, fy - 110, fx - 170, fy - 170, { brush: '2H', color: graphite, weight: 0.3 });
      k.line(470, 560, 560, 560, { brush: 'HB', color: graphite, weight: 0.4 });
      for (const x of [470, 515, 560]) k.line(x, 555, x, 565, { brush: 'HB', color: graphite, weight: 0.35 });
    };
  },
};
