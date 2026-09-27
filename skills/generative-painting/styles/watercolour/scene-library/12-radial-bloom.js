/** Shot 12 — Radial particle bloom (reconstructed plate under animated particles). Cream ground
 * with only the painted red/pink heart; the bloom itself is assembled by the radial release. */
import { createKit, plateSetup } from '../kit.js';
import { RADIAL } from '../particles.js';

export const radialBloom = {
  id: 'radial-bloom',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#f7f0e0');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { polar, R } = k;
      k.ground([['#f3ead6', 70]], { texture: 0.7, border: 0.2 });
      k.stains('#eadfc6', 50, 4, 60, 130, { texture: 0.85 });
      const { cx, cy } = RADIAL;
      k.glaze(k.petalCircle(cx, cy, 70, 14, 0.08), '#f4b6c2', 90, { bleed: 0.35, texture: 0.8 });
      k.flower(cx, cy, { petals: 10, len: 46, wid: 24, colors: ['#d7263d', '#e0457a'], passes: 2, alpha: 190, ruffle: 0.08, bleed: 0.25, rotation: R(360) });
      k.glaze(k.petalCircle(cx, cy, 20, 10, 0.1), '#7a0c1c', 210, { bleed: 0.2 });
      for (let i = 0; i < 30; i++) {
        const a = R(360);
        const [x, y] = polar(cx, cy, a, R(16, 32));
        k.line(...polar(cx, cy, a, 8), x, y, { brush: 'pen', color: '#f5b400', weight: 0.4 });
      }
      k.stipple(cx, cy, 8, 8, 40, '#f7c948', { weight: 0.6 });
    };
  },
};
