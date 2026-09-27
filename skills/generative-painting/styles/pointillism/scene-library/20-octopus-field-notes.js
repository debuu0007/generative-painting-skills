/** Shot 20 — Octopus field notes. Tea paper with a subdued dotted graph; a curled-arm octopus study
 * in the centre, two smaller details (a sucker ring close-up and a single curling arm tip) joined
 * by dotted leaders, a scale bar and stains. Umber, terracotta, muted plum. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';

export const octopusFieldNotes = {
  id: 'octopus-field-notes',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#E9DDC4');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      const { R, polar } = k;
      const umber = '#4a3222'; const terra = '#b8603a'; const plum = '#7a4a62';
      for (let x = 40; x <= 560; x += 40) k.line(x, 40, x, 560, { brush: '2H', color: '#9a8a70', weight: 0.15 });
      for (let y = 40; y <= 560; y += 40) k.line(40, y, 560, y, { brush: '2H', color: '#9a8a70', weight: 0.15 });
      k.stains('#a88a6a', 18, 5, 30, 90, { texture: 0.85 });
      // Main study.
      const oc = o.octopus(270, 250, 48);
      for (const arm of oc.arms) {
        k.glaze(arm.rib.poly, terra, 160, { bleed: 0.15, texture: 0.7 });
        k.contour(arm.rib.poly, { brush: 'HB', color: umber, weight: 0.4, open: 0.9, jitter: 0.4 });
        // Sucker rings along the inner edge.
        for (let i = 2; i < arm.path.length - 4; i += 2) { const [x, y] = arm.rib.left[i]; brush.noFill(); brush.set('HB', plum, 0.35); brush.circle(x, y, Math.max(0.8, 3.2 * (1 - i / arm.path.length)), 0.1); }
      }
      k.glaze(oc.mantle, '#c8704a', 185, { bleed: 0.15, texture: 0.8, border: 0.7 });
      k.hatchIn(k.shrink(oc.mantle, 0.7, 270, 200), { brush: 'HB', color: umber, weight: 0.22, dist: 4, angle: 60 });
      k.contour(oc.mantle, { brush: 'HB', color: umber, weight: 0.5, jitter: 0.4 });
      k.glaze(k.petalCircle(...oc.eye, 6, 8, 0.1), '#e8c07a', 220, { bleed: 0.05 });
      brush.noStroke(); brush.noFill(); brush.wash('#1a0e08', 250); brush.circle(...oc.eye, 2.6, 0.1); brush.noWash();
      // Detail 1: sucker ring close-up (upper right).
      brush.noFill(); brush.set('HB', umber, 0.45); brush.circle(470, 120, 46, 0.02);
      for (const r of [30, 20, 10]) { brush.set('HB', r === 10 ? plum : umber, 0.4); brush.circle(470, 120, r, 0.05); }
      for (let i = 0; i < 24; i++) k.line(...polar(470, 120, i * 15, 20), ...polar(470, 120, i * 15, 30), { brush: '2H', color: umber, weight: 0.25 });
      // Detail 2: a single arm tip curling (lower left).
      const tip = []; for (let i = 0; i <= 16; i++) { const t = i / 16; tip.push([...polar(120, 470, 20 + t * 480, 50 * (1 - t * 0.85)), 1]); }
      const rib = o.ribbon(tip, (t) => 14 * (1 - t) + 1.5);
      k.glaze(rib.poly, terra, 150, { bleed: 0.15 });
      k.contour(rib.poly, { brush: 'HB', color: umber, weight: 0.35 });
      // Dotted leaders with tick ends, and a scale bar.
      for (const [a, b] of [[[360, 190], [428, 146]], [[190, 360], [150, 420]]]) {
        k.line(...a, ...b, { brush: '2H', color: umber, weight: 0.35 });
        brush.noStroke(); brush.noFill(); brush.wash(umber, 220); brush.circle(...a, 1.6, 0.1); brush.noWash();
      }
      k.line(420, 548, 540, 548, { brush: 'HB', color: umber, weight: 0.45 });
      for (const x of [420, 450, 480, 510, 540]) k.line(x, 543, x, 553, { brush: 'HB', color: umber, weight: 0.35 });
      k.stains('#8b6b4a', 14, 3, 20, 50, { texture: 0.9 });
      void R;
    };
  },
};
