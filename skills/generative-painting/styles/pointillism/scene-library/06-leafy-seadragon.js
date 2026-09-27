/** Shot 06 — Leafy seadragon portrait. Pale sage; one large, gently curved leafy seadragon (a cool
 * Australian rocky-reef animal, given its own plate) with leaf-like appendages, long snout and
 * curling tail, in substantial negative space. Olive, ochre, blue-grey. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';

export const leafySeadragon = {
  id: 'leafy-seadragon',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#DCE5D2');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      const { R } = k;
      k.ground([['#d6e0cb', 70]], { texture: 0.6, border: 0.2 });
      k.stains('#cad6bd', 50, 4, 70, 150, { texture: 0.9 });
      // Spine: head upper left, arched trunk, tail curling down to the lower right.
      const spine = o.bez([110, 150], [250, 90], [330, 330], [430, 380], 34)
        .concat(o.bez([430, 380], [530, 430], [540, 540], [460, 540], 18).slice(1));
      const d = o.seadragon(spine, 1.75);
      const ink = '#3a4030';
      for (const lf of d.leaves) {
        k.line(...lf.stalk[0], ...lf.stalk[1], { brush: '2B', color: '#7a6a3a', weight: 0.9 });
        for (const leaf of lf.cluster) {
          k.glaze(leaf, k.pick(['#8a9a4a', '#a8a050', '#c89a4a', '#7a8a58']), 175, { bleed: 0.2, texture: 0.7, border: 0.6 });
          k.contour(leaf, { brush: 'HB', color: ink, weight: 0.25, open: 0.7, jitter: 0.5 });
          k.line(...k.centroid(leaf), ...leaf[Math.floor(leaf.length / 2)], { brush: '2H', color: '#5a5a30', weight: 0.2 });
        }
      }
      k.glaze(d.body.poly, '#c8a050', 190, { bleed: 0.15, texture: 0.8, border: 0.7 });
      k.glaze(k.shrink(d.body.poly, 0.85, 330, 300), '#9aa060', 130, { bleed: 0.25 });
      // Body rings and blue-grey banding.
      for (let i = 2; i < d.body.left.length - 1; i += 2) k.line(...d.body.left[i], ...d.body.right[i], { brush: 'HB', color: '#6a7a8a', weight: 0.35 });
      for (const part of [d.head, d.snout]) { k.glaze(part, '#c8a050', 190, { bleed: 0.12 }); k.contour(part, { brush: 'HB', color: ink, weight: 0.35 }); }
      k.contour(d.body.poly, { brush: 'HB', color: ink, weight: 0.4, open: 0.9, jitter: 0.6 });
      brush.noStroke(); brush.noFill(); brush.wash('#1a1a14', 240); brush.circle(...d.eye, 2.4, 0.1); brush.noWash();
      k.stipple(300, 300, 150, 110, 90, '#f0e0a0', { weight: 0.5 });
      void R;
    };
  },
};
