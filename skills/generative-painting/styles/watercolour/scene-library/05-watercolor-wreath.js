/** Shot 05 — Watercolour wreath (reconstructed). Ivory ground; irregular perimeter branches with
 * muted blue-green leaves and pink/orange/brown flowers. The centre stays genuinely empty; the
 * wreath is built from overlapping branch runs, never a circular mask or drawn circle. */
import { createKit, plateSetup } from '../kit.js';

export const watercolorWreath = {
  id: 'watercolor-wreath',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#f7f1e3');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#f3ead6', 80]], { texture: 0.7, border: 0.2 });
      k.stains('#e8dcc2', 70, 5, 50, 120, { texture: 0.85 });
      const cx = 300 + R(-8, 8); const cy = 304 + R(-8, 8);
      const radius = (a) => 208 + 14 * Math.sin(k.rad(a * 3 + 40)) + 9 * Math.sin(k.rad(a * 5));
      const leafC = ['#6f8f86', '#86a29a', '#5b7a78', '#9bb2a2', '#7c9a7c'];
      const flowerC = [['#d98f94', '#e7b2b0'], ['#d98c5a', '#e9b07e'], ['#9a6446', '#c28a62'], ['#cf7f86', '#b86468']];
      // Six branch runs of uneven length, overlapping ends, with gaps left open.
      let a0 = R(360);
      for (let b = 0; b < 9; b++) {
        const span = R(55, 88);
        const lift = b % 2 ? R(8, 18) : R(-18, -6);
        const pts = [];
        for (let i = 0; i <= 8; i++) {
          const a = a0 + (span * i) / 8;
          const r = radius(a) + lift + G(0, 4) + (i === 0 || i === 8 ? R(-18, 18) : 0);
          pts.push([...polar(cx, cy, a, r), k.lerp(1.1, 0.6, i / 8)]);
        }
        k.stem(pts, { brush: '2B', color: '#6b4f36', weight: 0.9, curvature: 0.8 });
        // Leaves alternate out and in along the branch.
        for (let i = 1; i < 12; i++) {
          const t = i / 12;
          const a = a0 + span * t;
          const [bx, by] = polar(cx, cy, a, radius(a) + lift);
          const side = i % 2 ? 1 : -1;
          const la = a + 90 * (b % 2 ? 1 : -1) + side * R(40, 75);
          const leaf = k.leafOutline(bx, by, la, R(34, 62), R(14, 24));
          k.glaze(leaf, k.pick(leafC), R(150, 190), { bleed: R(0.2, 0.4), texture: 0.6, border: 0.6 });
          if (k.chance(0.4)) k.glaze(k.shrink(leaf, 0.6, bx, by), k.pick(leafC), 120, { bleed: 0.3 });
          if (k.chance(0.5)) k.line(...polar(bx, by, la, 2), ...polar(bx, by, la + 4, 30), { brush: 'HB', color: '#4a5a4e', weight: 0.25 });
        }
        // Two or three blossoms and a berry cluster per run.
        for (let f = 0; f < k.pick([2, 3]); f++) {
          const a = a0 + span * R(0.15, 0.85);
          const [fx, fy] = polar(cx, cy, a, radius(a) + R(-10, 10));
          const [c1, c2] = k.pick(flowerC);
          k.flower(fx, fy, { petals: k.pick([5, 6]), len: R(20, 36), wid: R(17, 28), colors: [c1, c2], passes: 2, alpha: 175, bleed: 0.3, center: '#7a4a2e', centerR: 4, stamens: '#4a2c1a', stamenCount: 10, contour: '#6b4f36', contourWeight: 0.25, contourChance: 0.5 });
        }
        const a = a0 + span * R(0.2, 0.8);
        const [bx, by] = polar(cx, cy, a, radius(a) + R(8, 20));
        for (let i = 0; i < 5; i++) {
          const [x, y] = [bx + G(0, 7), by + G(0, 7)];
          k.glaze(k.petalCircle(x, y, R(3, 5), 7, 0.1), k.pick(['#7f95b0', '#9aa9c0', '#6c7f9e']), 190, { bleed: 0.2 });
        }
        a0 += span * R(0.5, 0.75);
      }
      // A few loose pigment drops at the outer edge (not the centre).
      for (let i = 0; i < 10; i++) {
        const a = R(360);
        const [x, y] = polar(cx, cy, a, radius(a) + R(30, 70));
        k.glaze(k.petalCircle(x, y, R(2, 6), 6, 0.3), k.pick(['#86a29a', '#d98f94', '#d98c5a']), 110, { bleed: 0.5, texture: 0.8 });
      }
    };
  },
};
