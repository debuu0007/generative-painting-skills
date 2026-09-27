/** Shot 13 — Seagrass meadow. Pale seafoam; tall eelgrass blades rise from a crowded lower edge in
 * vertical point chains, sharp in front and spare above, with a few small fish in the open water.
 * Olive, teal, dusty coral. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';

export const seagrassMeadow = {
  id: 'seagrass-meadow',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#EEF4E9');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      const { R } = k;
      k.ground([['#e8f0e2', 60]], { texture: 0.55, border: 0.15 });
      const ink = '#34402a';
      // Back layer: paler, thinner, shorter; front: darker, taller, sharper.
      for (const [n, hMin, hMax, w, cols, a] of [[60, 120, 260, [2, 3.5], ['#a8c0a0', '#9ab8b0', '#b8c8a0'], 130], [55, 200, 420, [3, 5.5], ['#6f8a3a', '#4a7a6a', '#7a8a40'], 175]]) {
        for (let i = 0; i < n; i++) {
          const fr = o.sea.frond(R(-10, 610), 625, R(hMin, hMax), { width: R(w[0], w[1]), amp: R(4, 14), lean: R(-0.18, 0.18), taper: 0.25 });
          k.glaze(fr.poly, k.pick(cols), a, { bleed: 0.12, texture: 0.6 });
          if (a > 150 && R() < 0.5) k.contour(fr.poly, { brush: 'HB', color: ink, weight: 0.22, open: 0.5, jitter: 0.4 });
        }
      }
      // Dusty-coral epiphytes and a few small anemones in the crowded base.
      for (let i = 0; i < 26; i++) k.glaze(k.petalCircle(R(0, 600), R(560, 610), R(3, 7), 8, 0.25), k.pick(['#d98a7a', '#c8786a', '#e0a08a']), 185, { bleed: 0.2 });
      for (let i = 0; i < 6; i++) k.flower(R(20, 580), R(575, 600), { petals: 14, len: R(9, 14), wid: 3, colors: ['#d98a7a', '#e0a08a'], passes: 1, alpha: 180, center: '#7a3a3a', centerR: 3 });
      // Three small fish in the spare upper water.
      for (const [x, y, a, l] of [[180, 120, 8, 40], [250, 96, 14, 32], [440, 160, 190, 36]]) {
        o.sea.paintFish(o.sea.fish(x, y, a, l, l * 0.34), { colors: ['#4a7a8a', '#7aa0a8'], fin: '#d98a7a', ink, contourWeight: 0.3, finRays: false });
      }
    };
  },
};
