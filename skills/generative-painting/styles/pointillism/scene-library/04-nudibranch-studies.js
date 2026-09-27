/** Shot 04 — Nudibranch studies. Warm shell paper; six small, different soft-bodied sea slugs in a
 * measured 3×2 specimen grid with dotted construction corners. Rust, plum, muted teal. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';

export const nudibranchStudies = {
  id: 'nudibranch-studies',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#F1E4CD');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      const { R, G } = k;
      k.ground([['#ecdcc0', 70]], { texture: 0.7, border: 0.2 });
      k.stains('#e0cca8', 22, 4, 60, 130, { texture: 0.9 });
      k.fibers('#c8b08a', 60);
      const ink = '#4a3228';
      const kinds = [
        { body: '#b8502e', edge: '#f0c060', cer: '#e08a3a', spots: '#f6e2b0', cerata: 11 },
        { body: '#6e2f5e', edge: '#e8d8f0', cer: '#a8508a', spots: '#f0d0e8', cerata: 0 },
        { body: '#3f7a78', edge: '#f2c872', cer: '#2c5a58', spots: '#1a2a28', cerata: 8 },
        { body: '#c8683e', edge: '#ffffff', cer: '#7a3a5a', spots: '#f8e8d0', cerata: 14 },
        { body: '#5a4a7a', edge: '#e89a4a', cer: '#e89a4a', spots: '#f0e0c0', cerata: 6 },
        { body: '#9a3a2a', edge: '#6aa8a0', cer: '#6aa8a0', spots: '#f2d8b0', cerata: 10 },
      ];
      const cells = [[150, 190], [300, 190], [450, 190], [150, 410], [300, 410], [450, 410]];
      cells.forEach(([cx, cy], i) => {
        const s = kinds[i];
        // Dotted construction corners around the cell.
        for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
          const x = cx + sx * 66; const y = cy + sy * 80;
          k.line(x, y, x - sx * 14, y, { brush: 'HB', color: ink, weight: 0.4 });
          k.line(x, y, x, y - sy * 14, { brush: 'HB', color: ink, weight: 0.4 });
        }
        const n = o.nudibranch(cx, cy, -20 + i * 13 + G(0, 6), R(96, 120), R(26, 34), { cerata: s.cerata, ruffle: i % 2 ? 0.28 : 0.14 });
        for (const c of n.cerata) { k.glaze(c, s.cer, 185, { bleed: 0.12 }); k.contour(c, { brush: 'HB', color: ink, weight: 0.2, open: 0.8 }); }
        k.glaze(n.body, s.body, 190, { bleed: 0.12, texture: 0.7, border: 0.8 });
        k.glaze(k.shrink(n.body, 1.0, cx, cy), s.edge, 120, { bleed: 0.05, dir: 'in', texture: 0.3, border: 1 });
        k.stipple(cx, cy, 30, 8, 26, s.spots, { weight: 0.7 });
        for (const r of n.rhino) { k.glaze(r, s.cer, 200, { bleed: 0.08 }); k.contour(r, { brush: 'HB', color: ink, weight: 0.25 }); }
        if (!s.cerata) k.glaze(n.gills, s.edge, 190, { bleed: 0.2 });
        k.contour(n.body, { brush: 'HB', color: ink, weight: 0.35, open: 0.85, jitter: 0.5 });
        // Scale tick under each specimen.
        k.line(cx - 22, cy + 70, cx + 22, cy + 70, { brush: '2H', color: ink, weight: 0.4 });
      });
    };
  },
};
