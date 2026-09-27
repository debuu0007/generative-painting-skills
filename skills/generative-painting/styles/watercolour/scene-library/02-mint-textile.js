/** Shot 02 — Mint flower textile (reconstructed). Pale sage field of many small, independently
 * drawn flowers: thin brown contours, muted orange/red/yellow/cream petals, varied size and
 * spacing, partial crops at every edge. Placement is dart-thrown, not a stamped grid. */
import { createKit, plateSetup } from '../kit.js';

export const mintTextile = {
  id: 'mint-textile',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#d3dfc8');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#c9d8bd', 120], ['#dbe5cf', 80]], { texture: 0.6, border: 0.2 });
      k.stains('#b7c9a8', 70, 8, 40, 110);
      k.fibers('#9fb096', 120);
      const petalsC = ['#d98a57', '#c1573f', '#e2b54e', '#f3e7cc', '#cf7a4a', '#b9493c'];
      const ink = '#5b3a22';
      const spots = k.scatter(95, 46, -25, -25, 625, 625);
      // Small sage leaves and sprigs sit between the flowers first.
      for (const [x, y] of spots.slice(0, 40)) {
        const a = R(360);
        const [lx, ly] = polar(x, y, a, R(18, 30));
        const leaf = k.leafOutline(lx, ly, a + R(-40, 40), R(14, 24), R(6, 10));
        k.glaze(leaf, k.pick(['#8ea37d', '#7f9870', '#9db18b']), 170, { bleed: 0.15, texture: 0.4 });
        k.contour(leaf, { brush: 'pen', color: ink, weight: 0.25, open: 0.7, jitter: 0.5 });
      }
      for (const [x, y] of spots) {
        const type = k.pick(['round', 'round', 'pointed', 'daisy', 'cup']);
        const size = Math.max(9, G(20, 5));
        const col = k.pick(petalsC);
        const second = k.pick(petalsC);
        const rot = R(360);
        const n = type === 'daisy' ? k.pick([8, 9, 10]) : type === 'cup' ? 3 : k.pick([4, 5, 5, 6]);
        const len = type === 'daisy' ? size * 1.1 : size;
        const wid = type === 'daisy' ? size * 0.36 : type === 'pointed' ? size * 0.6 : size * 0.85;
        const pale = col === '#f3e7cc';
        for (let i = 0; i < n; i++) {
          const a = type === 'cup' ? rot - 50 + i * 50 + G(0, 5) : rot + (360 / n) * i + G(0, 6);
          const pts = k.petalOutline(x, y, a, len * R(0.85, 1.12), wid * R(0.85, 1.12), { notch: type === 'round' && k.chance(0.5) ? 0.12 : 0, jitter: 0.05 });
          if (pale) k.reserve(pts, '#f6eedb', 230, 0.5, 2);
          k.glaze(pts, i % 3 === 2 ? second : col, pale ? 90 : 165, { bleed: R(0.08, 0.2), texture: 0.45, border: 0.5 });
          if (k.chance(0.8)) k.contour(pts, { brush: 'pen', color: ink, weight: R(0.22, 0.38), open: k.chance(0.5) ? 0.85 : false, jitter: 0.6 });
        }
        const cr = Math.max(2.5, size * 0.2);
        const disc = k.petalCircle(x, y, cr, 7, 0.2);
        k.glaze(disc, k.pick(['#8a4a2a', '#c98a2e', '#5b3a22', '#e0a43c']), 200, { bleed: 0.1, texture: 0.4 });
        if (k.chance(0.5)) k.stipple(x, y, cr * 0.4, cr * 0.4, 8, ink, { weight: 0.35 });
      }
    };
  },
};
