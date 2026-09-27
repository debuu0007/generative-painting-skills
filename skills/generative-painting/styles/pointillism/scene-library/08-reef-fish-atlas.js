/** Shot 08 — Reef-fish colour atlas. Ivory sheet; nine small fish portraits in an exact 3×3, each
 * a different body plan and marking (tang, butterflyfish, wrasse, clownfish, angelfish, goby,
 * grouper, boxfish, damsel). Teal, ochre, brick red, muted blue. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';

export const reefFishAtlas = {
  id: 'reef-fish-atlas',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#F7F0E2');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      const { sea } = o;
      k.ground([['#f2e9d6', 60]], { texture: 0.7, border: 0.15 });
      k.fibers('#d8c8a8', 50);
      const ink = '#3a3028';
      const specs = [
        { len: 92, h: 62, o: { widest: 0.45, tail: 0.18, fork: 0.1 }, p: { colors: ['#3f7fa8', '#6aa0c8'], fin: '#e8b83a', stripes: [-0.26], stripeColor: '#e8b83a', stripeW: 0.04 } },
        { len: 80, h: 68, o: { widest: 0.5, tail: 0.14, fork: 0 }, p: { colors: ['#f2d27a', '#fff0c0'], fin: '#e8b83a', stripes: [0.3], stripeColor: '#2a2a2a', stripeW: 0.05, spots: 1, spotColor: '#2a2a2a' } },
        { len: 110, h: 30, o: { widest: 0.32, tail: 0.2, fork: 0.2 }, p: { colors: ['#4aa89a', '#7fcaba'], fin: '#c85a3a', stripes: [0.1, -0.1], stripeColor: '#c85a3a', stripeW: 0.03 } },
        { len: 84, h: 42, o: { widest: 0.38, tail: 0.2, fork: 0.1 }, p: { colors: ['#e8702a', '#f09040'], fin: '#e8702a', stripes: [0.28, 0.02, -0.22], stripeColor: '#fff8ee', stripeW: 0.05 } },
        { len: 88, h: 72, o: { widest: 0.42, tail: 0.16, fork: 0 }, p: { colors: ['#3a4a8a', '#5a6aa8'], fin: '#e8c83a', stripes: [0.2, 0, -0.2], stripeColor: '#f0e070', stripeW: 0.025 } },
        { len: 104, h: 26, o: { widest: 0.3, tail: 0.18, fork: 0 }, p: { colors: ['#d8c090', '#e8d8b0'], fin: '#a85a3a', spots: 14, spotColor: '#a8402a' } },
        { len: 100, h: 50, o: { widest: 0.4, tail: 0.18, fork: 0.05 }, p: { colors: ['#a8483a', '#c8684a'], fin: '#8a3a2a', spots: 24, spotColor: '#4a8aa8' } },
        { len: 76, h: 56, o: { widest: 0.6, tail: 0.12, fork: 0 }, p: { colors: ['#e8c83a', '#f0d860'], fin: '#e8c83a', spots: 10, spotColor: '#2a2a3a' } },
        { len: 78, h: 40, o: { widest: 0.4, tail: 0.2, fork: 0.5 }, p: { colors: ['#6a8ab8', '#8aa8d0'], fin: '#b84a3a' } },
      ];
      let i = 0;
      for (const cy of [140, 300, 460]) for (const cx of [140, 300, 460]) {
        const s = specs[i++];
        k.glaze(k.petalCircle(cx, cy, 64, 16, 0.02), '#e8dcc4', 90, { bleed: 0.2, texture: 0.6 });
        brush.noFill(); brush.set('2H', ink, 0.3); brush.circle(cx, cy, 68, 0.02);
        const f = sea.fish(cx, cy, i % 2 ? 4 : -4, s.len, s.h, s.o); // facing right keeps the anatomy upright
        sea.paintFish(f, { ...s.p, ink, contourWeight: 0.35, open: 0.95, eye: '#1a1410' });
        k.line(cx - 20, cy + 80, cx + 20, cy + 80, { brush: 'HB', color: '#b89a5a', weight: 0.45 });
      }
      for (const [x, y, sx, sy] of [[24, 24, 1, 1], [576, 24, -1, 1], [24, 576, 1, -1], [576, 576, -1, -1]]) {
        k.line(x, y, x + sx * 30, y, { brush: 'HB', color: ink, weight: 0.4 });
        k.line(x, y, x, y + sy * 30, { brush: 'HB', color: ink, weight: 0.4 });
      }
    };
  },
};
