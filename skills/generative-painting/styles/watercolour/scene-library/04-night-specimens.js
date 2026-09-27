/** Shot 04 — Night specimens (reconstructed). Near-black ground; independent small flowers
 * scattered with large gaps: gold/yellow petals, orange/red cores, occasional translucent white
 * petals. Specimens floating in a void, not a canopy. */
import { createKit, plateSetup } from '../kit.js';

export const nightSpecimens = {
  id: 'night-specimens',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#0a0908');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#11100c', 170], ['#070606', 120]], { texture: 0.6, border: 0.2 });
      k.stains('#17140e', 90, 6, 60, 140);
      const spots = k.scatter(17, 118, 30, 30, 570, 570, 200);
      spots.forEach(([x, y], i) => {
        const size = k.pick([R(10, 18), R(20, 34), R(30, 48)]);
        const white = i % 5 === 2;
        const n = k.pick([5, 5, 6, 7, 8]);
        const rot = R(360);
        const petals = [];
        for (let j = 0; j < n; j++) {
          const a = rot + (360 / n) * j + G(0, 7);
          petals.push(k.petalOutline(x, y, a, size * R(0.85, 1.12), size * R(0.5, 0.75), { notch: k.chance(0.4) ? 0.1 : 0, ruffle: 0.05 }));
        }
        if (!white && k.chance(0.4)) {
          // A ghost ring of translucent white petals behind the gold.
          for (let j = 0; j < n; j++) {
            const a = rot + (360 / n) * (j + 0.5);
            const ghost = k.petalOutline(x, y, a, size * R(1.1, 1.4), size * 0.55);
            k.reserve(ghost, '#f7f4ee', 38, 0.5, 2);
            k.contour(ghost, { brush: 'pen', color: '#f4f0e6', weight: 0.25, open: 0.8, jitter: 0.4 });
          }
        }
        for (const pts of petals) {
          if (white) {
            k.reserve(pts, '#f4f1ea', 165, 0.5, 2);
            k.reserve(k.shrink(pts, 0.6, x, y), '#ffffff', 90, 0.5, 1);
            k.contour(pts, { brush: 'pen', color: '#ffffff', weight: 0.3, open: 0.8, jitter: 0.5 });
            k.line(x, y, ...k.centroid(pts), { brush: '2H', color: '#ffffff', weight: 0.2 });
          } else {
            k.reserve(pts, k.pick(['#ffcf2e', '#f5b400', '#ffdc4a']), 245, 0.5, 3);
            k.glaze(pts, k.pick(['#f2a900', '#ffcc00', '#e39a00']), 160, { bleed: 0.1, texture: 0.95, border: 0.9 });
            k.glaze(k.shrink(pts, R(0.4, 0.65), x, y), k.pick(['#e57f00', '#d98a00']), 150, { bleed: 0.3, texture: 0.8 });
            if (k.chance(0.5)) k.reserve(k.shrink(k.wobble(pts, 1), R(0.7, 0.9), ...k.centroid(pts)), '#fff6c8', 55, 0.5, 1);
            if (k.chance(0.35)) k.contour(pts, { brush: 'pen', color: '#5a3200', weight: 0.25, open: 0.5, jitter: 0.5 });
          }
          if (!white && k.chance(0.15)) {
            k.reserve(k.shrink(pts, 1.08, x, y), '#f7f4ee', 120, 0.5, 2);
          }
        }
        // Orange/red core and a few dark stamens.
        const cr = size * R(0.2, 0.3);
        const disc = k.petalCircle(x, y, cr, 8, 0.15);
        k.reserve(disc, white ? '#e8402a' : '#ff7a12', 250, 0.6, 2);
        k.glaze(disc, white ? '#c8102e' : k.pick(['#d6300f', '#e2560f']), 190, { bleed: 0.25, texture: 0.6 });
        k.stipple(x, y, cr * 0.35, cr * 0.35, 18, '#3a0702', { weight: 0.5 });
        for (let s = 0; s < 8; s++) k.line(...polar(x, y, R(360), cr * 0.9), ...polar(x, y, R(360), cr * R(1.3, 1.9)), { brush: 'pen', color: '#ffd28a', weight: 0.25 });
        // Some specimens keep a short cut stem.
        if (k.chance(0.45)) {
          const a = R(60, 120);
          const path = k.stemPath(x, y, ...polar(x, y, a, size * R(1.4, 2.4)), R(-0.2, 0.2), 4);
          k.stem(path, { brush: 'HB', color: '#8a9a4a', weight: 0.7 });
        }
      });
      // A few specimens carry fine pale pencil annotation: a leader line and a tick.
      for (const [x, y] of spots.slice(0, 4)) {
        const a = R(360);
        const [lx, ly] = polar(x, y, a, R(60, 90));
        k.line(...polar(x, y, a, 30), lx, ly, { brush: '2H', color: '#8a8270', weight: 0.25 });
        k.line(lx, ly, lx + (Math.cos(k.rad(a)) > 0 ? 24 : -24), ly, { brush: '2H', color: '#8a8270', weight: 0.25 });
      }
      k.stipple(300, 300, 240, 240, 90, '#8c7a3a', { weight: 0.4 });
    };
  },
};
