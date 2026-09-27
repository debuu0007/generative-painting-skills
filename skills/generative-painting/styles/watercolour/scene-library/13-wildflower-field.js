/** Shot 13 — Wildflower field (reconstructed). Off-white upper air; stems rising from the bottom
 * at varied heights, coral poppies with blue, purple and yellow flowers, crowded lower foreground,
 * plants cropped at both sides. Translucent watercolour, imperfect stems, loose ink outlines. */
import { createKit, plateSetup } from '../kit.js';

export const wildflowerField = {
  id: 'wildflower-field',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#f6f2e8');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#f2ecdf', 80]], { texture: 0.7, border: 0.2 });
      k.stains('#e6dfcd', 50, 4, 60, 120);
      const ink = '#3b3226';
      // Soft green underwash across the lower third.
      k.glaze([[-20, 470], [150, 430], [330, 455], [480, 425], [620, 450], [620, 620], [-20, 620]], '#9dbb7a', 150, { bleed: 0.4, texture: 0.8, border: 0.4 });
      k.glaze([[-20, 530], [200, 505], [420, 520], [620, 500], [620, 620], [-20, 620]], '#6f9a55', 150, { bleed: 0.35, texture: 0.8 });
      // Plants, back to front: taller ones are thinner and paler.
      const plants = [];
      for (let i = 0; i < 52; i++) {
        const x = R(-30, 630);
        const top = i < 12 ? R(110, 300) : i < 26 ? R(260, 430) : R(410, 560);
        plants.push({ x, top, type: k.pick(['poppy', 'poppy', 'blue', 'purple', 'yellow', 'bud']), depth: i });
      }
      plants.sort((a, b) => a.top - b.top);
      for (const pl of plants) {
        const near = (pl.top - 110) / 430;
        const path = k.stemPath(pl.x + R(-40, 40), 640, pl.x, pl.top, R(-0.12, 0.12), 6);
        k.stem(path, { brush: 'HB', color: k.pick(['#5f8a3e', '#4d7a34', '#77994c']), weight: k.lerp(0.6, 1.3, near) });
        if (k.chance(0.6)) {
          const [lx, ly] = path[Math.floor(R(2, 5))];
          const leaf = k.leafOutline(lx, ly, R(180, 360), R(22, 44), R(5, 10));
          k.glaze(leaf, k.pick(['#6f9a55', '#86ad5f']), 170, { bleed: 0.15 });
        }
        const s = k.lerp(0.75, 1.35, near);
        const x = pl.x; const y = pl.top;
        if (pl.type === 'poppy') {
          k.flower(x, y, { petals: 4, len: 30 * s, wid: 34 * s, colors: ['#f0664f', '#e8553f', '#f58a6a'], passes: 2, alpha: 185, ruffle: 0.14, notch: 0.05, bleed: 0.3, rotation: R(-60, 0),
            contour: ink, contourWeight: 0.3, contourChance: 0.5, center: '#2a1a14', centerR: 6 * s, stamens: '#1a0f0a', stamenCount: 14 });
        } else if (pl.type === 'blue') {
          k.flower(x, y, { petals: 8, len: 16 * s, wid: 8 * s, colors: ['#4f74c8', '#3f5fb0', '#7b96da'], passes: 1, alpha: 200, notch: 0.25, bleed: 0.2,
            contour: '#23304f', contourWeight: 0.25, contourChance: 0.4, center: '#2b2f6b', centerR: 3.2 * s });
        } else if (pl.type === 'purple') {
          for (let j = 0; j < 9; j++) {
            const [bx, by] = [x + G(0, 3), y + j * 7 * s];
            k.glaze(k.petalCircle(bx, by, (5 - j * 0.3) * s, 6, 0.25), k.pick(['#8a5ab8', '#a27bcf', '#6e3f9e']), 190, { bleed: 0.2, texture: 0.5 });
          }
        } else if (pl.type === 'yellow') {
          for (let j = 0; j < 5; j++) {
            const [bx, by] = polar(x, y, R(360), R(0, 14) * s);
            k.flower(bx, by, { petals: 5, len: 7 * s, wid: 6 * s, colors: ['#f2c230', '#f5d24f'], passes: 1, alpha: 210, bleed: 0.1, center: '#b8741a', centerR: 1.6 * s });
          }
        } else {
          const bud = k.petalOutline(x, y + 10, -90 + G(0, 12), 24 * s, 13 * s, { jitter: 0.03 });
          k.glaze(bud, '#e8553f', 180, { bleed: 0.2 });
          k.glaze(k.petalOutline(x, y + 12, -90, 14 * s, 14 * s), '#6f9a55', 190, { bleed: 0.1 });
          k.contour(bud, { brush: 'pen', color: ink, weight: 0.3, open: 0.6 });
        }
      }
      // Dense grasses in the foreground, and a few flowers cut by the lower corners.
      for (let i = 0; i < 160; i++) {
        const x = R(-10, 610); const h = R(30, 130);
        k.line(x, 610, x + G(0, 14), 610 - h, { brush: k.pick(['HB', '2B', 'cpencil']), color: k.pick(['#4d7a34', '#6f9a55', '#3e6a2c', '#8aa860']), weight: R(0.3, 0.8) });
      }
      k.flower(18, 522, { petals: 4, len: 58, wid: 64, colors: ['#f0664f', '#f58a6a'], passes: 2, alpha: 190, ruffle: 0.14, contour: ink, contourWeight: 0.35, center: '#2a1a14', centerR: 12 });
      k.flower(590, 488, { petals: 8, len: 34, wid: 16, colors: ['#4f74c8', '#7b96da'], passes: 2, alpha: 200, notch: 0.25, contour: '#23304f', contourWeight: 0.3, center: '#2b2f6b', centerR: 6 });
      k.stipple(300, 560, 260, 40, 160, '#f2c230', { weight: 0.6 });
    };
  },
};
