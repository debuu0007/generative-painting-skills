/** Shot 10 — A flower becoming dust (reconstructed plate under animated particles). Beige
 * ground with a static painted heart following the same petal mask the particles sample, so the
 * core stays coherent while the seeded dots and dashes loosen the outer contour. */
import { createKit, plateSetup } from '../kit.js';
import { DUST, dustRadius } from '../particles.js';

export const dustFlower = {
  id: 'dust-flower',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#efe2c8');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      k.ground([['#eadbbd', 90]], { texture: 0.75, border: 0.2 });
      k.stains('#dfcca8', 60, 5, 60, 130, { texture: 0.85 });
      k.fibers('#b9a47e', 60);
      const mask = (scale) => {
        const pts = [];
        for (let i = 0; i < 72; i++) {
          const t = (i / 72) * Math.PI * 2;
          const r = dustRadius(t) * scale;
          pts.push([DUST.cx + Math.cos(t) * r, DUST.cy + Math.sin(t) * r]);
        }
        return pts;
      };
      k.glaze(mask(0.62), '#eea493', 135, { bleed: 0.3, texture: 0.8, border: 0.4, curvature: 0.3 });
      k.glaze(mask(0.42), '#e86a5a', 165, { bleed: 0.25, texture: 0.85, border: 0.6, curvature: 0.3 });
      k.glaze(mask(0.22), '#b3122b', 200, { bleed: 0.2, texture: 0.8, border: 0.6, curvature: 0.3 });
      k.glaze(k.petalCircle(DUST.cx, DUST.cy, 18, 9, 0.15), '#4a0a10', 200, { bleed: 0.15 });
      k.stipple(DUST.cx, DUST.cy, 12, 12, 60, '#e0a030', { weight: 0.6 });
    };
  },
};
