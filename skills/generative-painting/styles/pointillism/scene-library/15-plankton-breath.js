/** Shot 15 — Plankton breath. Near-white; five barely visible pale clusters (a diatom chain, two
 * copepods, a radiolarian, a tiny larva) and two small saturated accents. The sparsest plate. */
import { createKit, plateSetup } from '../kit.js';

export const planktonBreath = {
  id: 'plankton-breath',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#FBFAF6');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, polar } = k;
      k.ground([['#f9f7f0', 40]], { texture: 0.5, border: 0.1 });
      const pale = ['#f2cdb8', '#f4d2c0', '#efc8b8'];
      // Diatom chain.
      for (let i = 0; i < 6; i++) k.glaze([[118 + i * 11, 160], [127 + i * 11, 160], [127 + i * 11, 172], [118 + i * 11, 172]], k.pick(pale), 150, { bleed: 0.2, curvature: 0.3 });
      // Two copepods: teardrop body, two antennae.
      for (const [x, y, a] of [[420, 140, -20], [330, 450, 160]]) {
        k.glaze(k.petalOutline(x, y, a, 16, 8, { base: 0.6, widest: 0.4 }), k.pick(pale), 160, { bleed: 0.25 });
        for (const s of [-1, 1]) k.line(x, y, ...polar(x, y, a + 180 + s * 50, 16), { brush: '2H', color: '#e8b8a8', weight: 0.2 });
      }
      // Radiolarian: a ring with spines.
      k.glaze(k.petalCircle(160, 400, 8, 10, 0.05), k.pick(pale), 150, { bleed: 0.2 });
      for (let i = 0; i < 12; i++) k.line(...polar(160, 400, i * 30, 8), ...polar(160, 400, i * 30, 14), { brush: '2H', color: '#e8b8a8', weight: 0.2 });
      // Larva.
      k.glaze(k.petalOutline(500, 360, 200, 12, 6), k.pick(pale), 150, { bleed: 0.3 });
      // Two small saturated accents.
      brush.noStroke(); brush.noFill(); brush.wash('#ff2f7a', 255); brush.circle(420 + 3, 140, 2.2, 0.02); brush.wash('#e8207a', 255); brush.circle(160, 400, 2.6, 0.02); brush.noWash();
      void R;
    };
  },
};
