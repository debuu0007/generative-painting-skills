/** Shot 03 — Engraved diagonals (reconstructed). Warm off-white paper; several large flowers
 * on a lower-left to upper-right diagonal in fine brown-black line: contours, contour-following
 * hatches, cross-hatched shadows, radial filaments, burnt-orange centres. Paper dominates. */
import { createKit, plateSetup } from '../kit.js';

export const engravedDiagonals = {
  id: 'engraved-diagonals',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#f3ecdc');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#efe5cf', 90]], { texture: 0.7, border: 0.2 });
      k.stains('#d9c7a2', 60, 6, 40, 120, { texture: 0.85 });
      k.fibers('#b8a888', 90);
      const ink = '#2a1c13';
      const flowers = [
        { x: 128, y: 468, len: 118, n: 6, rot: 205 },
        { x: 300, y: 302, len: 150, n: 7, rot: 215 },
        { x: 478, y: 128, len: 112, n: 5, rot: 230 },
      ];
      // Stems first: paired fine lines, diagonal, leaving off the edge.
      for (const f of flowers) {
        const path = k.stemPath(f.x, f.y, f.x - 150 + R(-30, 30), f.y + 190 + R(-20, 40), R(-0.15, 0.15), 6);
        k.stem(path, { brush: 'rotring', color: ink, weight: 0.35, curvature: 0.7 });
        k.stem(path.map(([x, y, w]) => [x + 3, y + 1.5, w]), { brush: 'rotring', color: ink, weight: 0.3, curvature: 0.7 });
        // A leaf off each stem with midrib and vein hatching.
        const [lx, ly] = path[3];
        const la = f.rot + R(-80, -30);
        const leaf = k.leafOutline(lx, ly, la, R(80, 120), R(30, 42));
        k.contour(leaf, { brush: 'rotring', color: ink, weight: 0.4, jitter: 0.5 });
        k.hatchIn(leaf, { brush: 'rotring', color: ink, weight: 0.25, dist: 3.2, angle: la + 55, rand: 0.1 });
        k.line(...polar(lx, ly, la, 3), ...polar(lx, ly, la + 3, 95), { brush: 'rotring', color: ink, weight: 0.35 });
      }
      for (const f of flowers) {
        const petals = [];
        for (let i = 0; i < f.n; i++) {
          const a = f.rot + (360 / f.n) * i + G(0, 6);
          const len = f.len * R(0.85, 1.1);
          const pts = k.petalOutline(f.x, f.y, a, len, f.len * R(0.55, 0.7), { notch: k.chance(0.5) ? 0.07 : 0, ruffle: 0.06, jitter: 0.02 });
          petals.push({ a, len, pts });
        }
        for (const pet of petals) {
          // Occlude what lies behind (engraved petals overlap cleanly), then engrave this petal.
          k.reserve(pet.pts, '#f3ecdc', 255, 0.5, 1);
          const base = k.petalOutline(f.x, f.y, pet.a, pet.len * 0.62, f.len * 0.5, { base: 0.3, jitter: 0.02 });
          k.hatchIn(base, { brush: 'rotring', color: ink, weight: 0.17, dist: R(2.4, 3.0), angle: pet.a + 90 + G(0, 6), rand: 0.08, gradient: 0.45 });
          if (k.chance(0.5)) k.hatchIn(k.petalOutline(f.x, f.y, pet.a, pet.len * 0.3, f.len * 0.28, { base: 0.4 }), { brush: 'rotring', color: ink, weight: 0.15, dist: 2.0, angle: pet.a + 40, rand: 0.08 });
          k.contour(pet.pts, { brush: 'rotring', color: ink, weight: 0.55, jitter: 0.35 });
          for (let v = 0; v < 3; v++) {
            const da = (v - 1) * 9 + G(0, 3);
            const path = [polar(f.x, f.y, pet.a + da * 0.4, pet.len * 0.25), polar(f.x, f.y, pet.a + da * 0.8, pet.len * 0.55), polar(f.x, f.y, pet.a + da, pet.len * R(0.75, 0.88))];
            k.stem(path, { brush: 'rotring', color: ink, weight: 0.16, curvature: 0.6 });
          }
        }
        const cr = f.len * 0.24;
        const disc = k.petalCircle(f.x, f.y, cr, 10, 0.1);
        k.glaze(disc, '#c4561d', 210, { bleed: 0.2, texture: 0.6, border: 0.6 });
        k.glaze(k.petalCircle(f.x, f.y, cr * 0.6, 9, 0.15), '#9a3512', 180, { bleed: 0.2, texture: 0.6 });
        // Radial filaments with anther dots.
        for (let i = 0; i < 16; i++) {
          const a = R(360);
          const [x1, y1] = polar(f.x, f.y, a, cr * R(1.25, 1.9));
          k.line(...polar(f.x, f.y, a, cr * 0.95), x1, y1, { brush: 'rotring', color: ink, weight: 0.16 });
          brush.noStroke(); brush.noFill(); brush.wash('#2a1c13', 230); brush.circle(x1, y1, R(0.9, 1.6), 0.2); brush.noWash();
        }
        k.stipple(f.x, f.y, cr * 0.35, cr * 0.35, 45, ink, { weight: 0.35 });
        k.contour(disc, { brush: 'rotring', color: ink, weight: 0.4, jitter: 0.4 });
      }
      // A small closed bud on the diagonal's continuation.
      const bud = k.petalOutline(528, 462, 250, 58, 30, { jitter: 0.02 });
      k.contour(bud, { brush: 'rotring', color: ink, weight: 0.45, jitter: 0.4 });
      k.hatchIn(bud, { brush: 'rotring', color: ink, weight: 0.18, dist: 2.8, angle: 340, rand: 0.2, gradient: 0.4 });
      k.glaze(k.petalOutline(528, 462, 250, 22, 16), '#c4561d', 150, { bleed: 0.2 });
      k.stem(k.stemPath(528, 462, 600, 560, 0.1, 4), { brush: 'rotring', color: ink, weight: 0.35 });
    };
  },
};
