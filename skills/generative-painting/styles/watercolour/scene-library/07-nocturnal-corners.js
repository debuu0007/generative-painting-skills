/** Shot 07 — Four nocturnal corners (reconstructed). Dark navy with a faint rectangular grid;
 * four large translucent white/lavender/blue flowers anchored at the corners with pink centres,
 * outer petals cropped by the frame, a quieter centre. Designed, poster-like symmetry. */
import { createKit, plateSetup } from '../kit.js';

export const nocturnalCorners = {
  id: 'nocturnal-corners',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#0d1838');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#13214a', 150], ['#0a1430', 110]], { texture: 0.6, border: 0.2 });
      k.stains('#1a2b5c', 70, 5, 60, 130);
      // Faint rectangular structure.
      brush.noFill();
      brush.set('2H', '#3a4f86', 0.35);
      for (let x = 50; x < 600; x += 50) brush.line(x, 0, x, 600);
      for (let y = 50; y < 600; y += 50) brush.line(0, y, 600, y);
      brush.set('HB', '#5c73b0', 0.5);
      brush.rect(36, 36, 528, 528);
      brush.rect(200, 200, 200, 200);
      const corners = [[70, 72, 42], [532, 66, 132], [66, 530, 312], [528, 534, 222]];
      const tints = [['#f3f0ff', '#d9ccff'], ['#e8f1ff', '#bcd2ff'], ['#f6f3ff', '#cdbdf5'], ['#eef4ff', '#aec8f5']];
      corners.forEach(([x, y, facing], i) => {
        const n = 7 + (i % 2);
        const rot = facing + R(-10, 10);
        const [c1, c2] = tints[i];
        for (let ring = 0; ring < 2; ring++) {
          for (let j = 0; j < n; j++) {
            const a = rot + (360 / n) * j + ring * (180 / n) + G(0, 5);
            const len = (ring ? 150 : 205) * R(0.9, 1.08);
            const pts = k.petalOutline(x, y, a, len, len * R(0.5, 0.62), { ruffle: 0.05, notch: k.chance(0.5) ? 0.06 : 0, jitter: 0.02 });
            k.reserve(pts, ring ? c1 : c2, ring ? 105 : 80, 0.5, 3);
            k.glaze(pts, k.pick(['#c9bdf5', '#b3c9f2', '#e2dcfb']), 90, { bleed: 0.12, texture: 0.95, border: 0.9 });
            k.reserve(k.shrink(k.wobble(pts, 3), R(0.35, 0.6), x, y), '#ffffff', 45, 0.5, 1);
            k.contour(pts, { brush: 'HB', color: '#e9e4ff', weight: 0.3, open: 0.75, jitter: 0.8 });
            for (let v = 0; v < 3; v++) k.line(...polar(x, y, a + G(0, 5), len * 0.2), ...polar(x, y, a + G(0, 8), len * R(0.55, 0.85)), { brush: '2H', color: '#f0ecff', weight: 0.22 });
          }
        }
        const disc = k.petalCircle(x, y, 30, 10, 0.12);
        k.reserve(disc, '#ff6f9f', 240, 0.6, 2);
        k.glaze(disc, '#e0366f', 180, { bleed: 0.3, texture: 0.6 });
        k.glaze(k.petalCircle(x, y, 13, 8, 0.2), '#9e1240', 200, { bleed: 0.2 });
        k.stipple(x, y, 12, 12, 40, '#ffd0e0', { weight: 0.5 });
        for (let s = 0; s < 22; s++) {
          const sa = R(360);
          const [sx, sy] = polar(x, y, sa, R(30, 52));
          k.line(...polar(x, y, sa, 20), sx, sy, { brush: 'pen', color: '#ffb8cf', weight: 0.3 });
          brush.noStroke(); brush.noFill(); brush.wash('#ffe0a0', 220); brush.circle(sx, sy, 1.4, 0.2); brush.noWash();
        }
      });
      // Quiet centre: a single crosshair mark in the grid.
      brush.set('HB', '#8095d0', 0.4);
      brush.line(288, 300, 312, 300);
      brush.line(300, 288, 300, 312);
    };
  },
};
