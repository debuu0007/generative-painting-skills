/** Shot 12 — Jelly constellation (plate under moving particles). Midnight violet with only a faint
 * scatter of distant points; the bell and trailing point chains are assembled by the 'jelly'
 * particle set, which opens from a compressed rose-and-lilac cluster and settles. Nothing solid is
 * painted under the moving dots. */
import { createKit, plateSetup } from '../kit.js';

export const jellyConstellation = {
  id: 'jelly-constellation',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#130F28');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R } = k;
      k.ground([['#181232', 150], ['#0e0b20', 110]], { texture: 0.55, border: 0.2 });
      k.stains('#1e1640', 60, 4, 80, 160);
      for (let i = 0; i < 70; i++) { brush.noStroke(); brush.noFill(); brush.wash(k.pick(['#6a5a9a', '#8a6a8a', '#4a4a7a']), R(120, 200)); brush.circle(R(600), R(600), R(0.6, 1.3), 0.2); brush.noWash(); }
    };
  },
};
