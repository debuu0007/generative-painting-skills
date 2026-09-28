/** Shot 15 — Almost nothing (reconstructed). Near-white ground; a few pale peach organic
 * fragments crossing diagonally lower-left to upper-right, each punctuated by a tiny saturated
 * magenta geometric centre. The most whitespace of the sequence. */
import { createKit, plateSetup } from '../kit.js';

export const almostNothing = {
  id: 'almost-nothing',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#fbfaf6');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#f9f6f0', 50]], { texture: 0.6, border: 0.15 });
      const stops = [[92, 508, 34], [178, 432, 22], [262, 330, 44], [372, 262, 18], [452, 170, 30], [526, 96, 14]];
      stops.forEach(([x0, y0, size], i) => {
        const x = x0 + G(0, 6); const y = y0 + G(0, 6);
        const n = k.pick([3, 4, 5]);
        const rot = -45 + R(-40, 40);
        for (let j = 0; j < n; j++) {
          const a = rot + (360 / n) * j + G(0, 14);
          const pts = k.petalOutline(x, y, a, size * R(0.7, 1.3), size * R(0.5, 0.8), { ruffle: 0.12, bend: R(-0.3, 0.3) });
          k.glaze(pts, k.pick(['#f6c6a4', '#f1b38e', '#f5cdb2']), R(140, 175), { bleed: 0.35, texture: 0.6, border: 0.7 });
        }
        if (i % 2 === 0) k.glaze(k.petalOutline(x, y, rot + 180, size * 1.4, size * 0.35, { bend: 0.3 }), '#f3c4a6', 90, { bleed: 0.4 });
        // Tiny saturated magenta geometry: square, triangle or disc, crisp.
        const g = size * 0.14 + 2.5;
        brush.noStroke(); brush.noFill();
        brush.wash(i === 2 ? '#ff0f7b' : '#e0107a', 255);
        const shape = ['square', 'tri', 'disc'][i % 3];
        if (shape === 'square') k.shape([[x - g, y - g], [x + g, y - g], [x + g, y + g], [x - g, y + g]], 0);
        else if (shape === 'tri') k.shape([polar(x, y, -90, g * 1.3), polar(x, y, 30, g * 1.3), polar(x, y, 150, g * 1.3)], 0);
        else brush.circle(x, y, g, 0.02);
        brush.noWash();
      });
    };
  },
};
