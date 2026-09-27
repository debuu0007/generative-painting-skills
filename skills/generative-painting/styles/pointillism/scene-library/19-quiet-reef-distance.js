/** Shot 19 — Quiet reef distance. Mist-pale water fills the upper two thirds; layered low reef
 * silhouettes (blue-grey far, sage middle, faded coral near) along the bottom, and one small distant
 * school. Sparse low-contrast distance, finer articulated foreground. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';

export const quietReefDistance = {
  id: 'quiet-reef-distance',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#EDF3EF');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      const { R } = k;
      k.ground([['#e8efec', 60]], { texture: 0.5, border: 0.15 });
      for (const [base, amp, col, a] of [[410, 26, '#b8c8d0', 120], [450, 34, '#9ab0a8', 140], [500, 40, '#c8a898', 160]]) {
        const pts = [[-20, 640]];
        for (let x = -20; x <= 620; x += 24) pts.push([x, base - Math.abs(Math.sin(x * 0.02 + base)) * amp - R(0, 14)]);
        pts.push([620, 640]);
        k.glaze(pts, col, a, { bleed: 0.2, texture: 0.8, border: 0.4, curvature: 0.5 });
      }
      // Foreground coral heads and fans, finer and sharper.
      for (let i = 0; i < 10; i++) {
        const x = R(0, 600);
        for (const b of o.sea.coralBranches(x, 620, -90 + R(-15, 15), R(24, 40), R(4, 7), 3)) k.glaze(b.poly, k.pick(['#c8786a', '#9ab0a8', '#d8a88a']), 175, { bleed: 0.15 });
      }
      for (let i = 0; i < 18; i++) k.glaze(k.petalCircle(R(0, 600), R(560, 610), R(5, 12), 10, 0.2), k.pick(['#b89a8a', '#8aa098', '#c8a898']), 170, { bleed: 0.2 });
      // A small distant school, high in the open water.
      const path = o.bez([330, 170], [370, 150], [420, 170], [470, 150]);
      for (const f of o.school(path, 26, { len: 7, h: 2.4, spread: 9 })) o.sea.paintFish(f, { colors: ['#8a9aa8', '#a8b4bc'], fin: '#8a9aa8', ink: '#6a7a88', contourWeight: 0.15, finRays: false, contour: false, eyeRing: '#a8b4bc', eye: '#6a7a88' });
    };
  },
};
