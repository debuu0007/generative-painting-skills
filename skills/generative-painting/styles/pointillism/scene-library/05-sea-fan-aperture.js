/** Shot 05 — Sea-fan aperture. Deep teal; asymmetric red and gold sea fans grow in from the edges
 * and corners, their meshes framing a broad dark opening in the centre. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';

export const seaFanAperture = {
  id: 'sea-fan-aperture',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#073B3B');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      const { R, G } = k;
      k.ground([['#0a4442', 150], ['#052e2e', 110]], { texture: 0.6, border: 0.2 });
      k.stains('#0e504c', 60, 5, 60, 140, { x: () => R(150, 450), y: () => R(150, 450) });
      // Fans rooted off-frame at the edges, growing inward; the centre stays open.
      const roots = [[-10, 620, -60, 1.3, '#e8341c'], [120, 640, -80, 0.9, '#f2a41c'], [260, 650, -95, 0.8, '#e8341c'], [440, 650, -100, 0.8, '#f2a41c'], [620, 610, -125, 1.2, '#f2a41c'], [640, 470, 170, 0.9, '#e8341c'], [640, 260, 185, 0.9, '#f2a41c'], [610, -10, 130, 1.1, '#e8341c'], [420, -20, 100, 0.8, '#f2a41c'], [200, -20, 80, 0.8, '#e8341c'], [-20, 120, 10, 1.0, '#f2a41c'], [-20, 330, -5, 0.9, '#e8341c'], [-20, 480, -20, 0.8, '#f2a41c']];
      for (const [x, y, a, s, col] of roots) {
        const fan = o.seaFan(x, y, a + G(0, 5), 400 * s, { width: 5.5 * s, depth: 5 });
        for (const b of fan.branches) {
          if (Math.hypot(b.tip[0] - 300, b.tip[1] - 300) < 150) continue; // keep the aperture clear
          k.reserve(b.poly, col === '#e8341c' ? '#ff8a6a' : '#ffd88a', 220, 0.6, 1);
          k.glaze(b.poly, col, 195, { bleed: 0.12, texture: 0.8 });
        }
        for (const [a1, b1] of fan.links) {
          if (Math.hypot(a1[0] - 300, a1[1] - 300) < 150) continue;
          k.line(a1[0], a1[1], b1[0], b1[1], { brush: 'pen', color: col, weight: 0.8 });
        }
        // Polyps: pale mint dots along the branches.
        for (const b of fan.branches) if (R() < 0.6 && Math.hypot(b.tip[0] - 300, b.tip[1] - 300) >= 150) { brush.noStroke(); brush.noFill(); brush.wash('#c8f0dc', 230); brush.circle(...b.tip, R(1, 2.2), 0.2); brush.noWash(); }
      }
      
    };
  },
};
