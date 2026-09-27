/** Shot 16 (and 17) — Lionfish fan. Pale shell paper; one large lionfish with its fins spread
 * asymmetrically: burnt-coral and cream stripes, a crown of long dorsal spines, huge banded pectoral
 * fans with dotted membranes, room around the outline. Painted at density 3; shot 17 crops into the
 * fin rays and stripes. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';

export const lionfishFan = {
  id: 'lionfish-fan',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#F5EAD8');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      const { R } = k;
      k.ground([['#f0e2cc', 60]], { texture: 0.6, border: 0.15 });
      const ink = '#3a2418'; const coral = '#c8502e'; const cream = '#f6d4b4';
      const f = o.lionfish(352, 292, -6, 330, 130);
      // Pectoral fans: membrane glaze between rays, banded rays over it.
      for (const fan of f.fans) {
        for (let i = 0; i < fan.length - 1; i++) {
          const a = fan[i]; const b = fan[i + 1];
          const web = [a.base, a.tip, [(a.tip[0] + b.tip[0]) / 2, (a.tip[1] + b.tip[1]) / 2], b.tip];
          k.glaze(web, i % 2 ? '#e0a080' : '#f0bc98', 165, { bleed: 0.2, texture: 0.8, curvature: 0.4 });
        }
        for (const ray of fan) {
          const n = 7;
          for (let s = 0; s < n; s++) {
            const t0 = s / n; const t1 = (s + 0.55) / n;
            const p0 = [ray.base[0] + (ray.tip[0] - ray.base[0]) * t0, ray.base[1] + (ray.tip[1] - ray.base[1]) * t0];
            const p1 = [ray.base[0] + (ray.tip[0] - ray.base[0]) * t1, ray.base[1] + (ray.tip[1] - ray.base[1]) * t1];
            k.line(...p0, ...p1, { brush: '2B', color: s % 2 ? coral : '#7a2a18', weight: 1.4 });
          }
        }
      }
      // Tail and the soft rear dorsal/anal fins.
      for (const fin of [f.tail, f.anal]) { k.glaze(fin, '#f0c8a8', 140, { bleed: 0.2 }); k.contour(fin, { brush: 'HB', color: ink, weight: 0.3, open: 0.8 }); }
      for (let s = 0; s < 9; s++) k.line(...k.centroid(f.tail), ...f.tail[Math.floor((s / 9) * f.tail.length)], { brush: 'pen', color: s % 2 ? coral : ink, weight: 0.5 });
      // Body: cream base, burnt-coral stripes.
      k.reserve(f.body, cream, 250, 0.5, 3);
      k.glaze(f.body, '#f0c098', 150, { bleed: 0.1, texture: 0.7, border: 0.9 });
      f.stripes.forEach((st, i) => { k.reserve(st, i % 2 ? '#a8401e' : '#d8603a', 245, 0.3, 2); k.glaze(st, i % 2 ? '#8a3018' : coral, 200, { bleed: 0.08, texture: 0.7 }); });
      k.contour(f.body, { brush: '2B', color: ink, weight: 0.7, open: 1, jitter: 0.5 });
      k.stem(f.gill, { brush: '2B', color: ink, weight: 0.6 });
      // Dorsal spines with membrane dots and bands.
      for (const sp of f.spines) {
        k.line(...sp.base, ...sp.tip, { brush: 'pen', color: ink, weight: 0.55 });
        for (let s = 1; s < 5; s++) { const t = s / 5; brush.noStroke(); brush.noFill(); brush.wash(s % 2 ? coral : cream, 240); brush.circle(sp.base[0] + (sp.tip[0] - sp.base[0]) * t, sp.base[1] + (sp.tip[1] - sp.base[1]) * t, 1.6, 0.1); brush.noWash(); }
      }
      // Face: eye with a dark bar through it, frilled tentacle over the eye.
      const [ex, ey] = f.eye;
      k.glaze(k.petalCircle(ex, ey, 9, 10, 0.05), '#e8a02a', 220, { bleed: 0.08 });
      brush.noStroke(); brush.noFill(); brush.wash('#140a06', 250); brush.circle(ex, ey, 4.5, 0.1); brush.noWash();
      k.line(ex - 10, ey - 16, ex + 6, ey + 18, { brush: '2B', color: '#6a1a0a', weight: 1 });
      k.stem([[ex + 2, ey - 8], [ex + 8, ey - 22], [ex + 4, ey - 34]], { brush: 'pen', color: coral, weight: 0.6 });
      k.stipple(352, 292, 50, 26, 50, '#6a1a0a', { weight: 0.5 });
      void R;
    };
  },
};
