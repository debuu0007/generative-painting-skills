/** Shot 09 — Barracuda diagonal. Charcoal-blue open water; one long narrow silver barracuda crosses
 * the square on a rising diagonal, pointed jaw and forked tail legible, with long clean margins. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';

export const barracudaDiagonal = {
  id: 'barracuda-diagonal',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#101B25');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      const { sea } = o;
      k.ground([['#132230', 150], ['#0b141c', 110]], { texture: 0.55, border: 0.2 });
      k.stains('#18293a', 60, 3, 90, 170);
      const f = o.barracuda(300, 318, -28, 470, 58);
      for (const fin of [f.tail, f.dorsal, f.anal, f.pectoral]) {
        k.reserve(fin, '#8a9aa8', 210, 0.5, 2);
        k.glaze(fin, '#6a7c8c', 170, { bleed: 0.15, texture: 0.8 });
        k.contour(fin, { brush: 'HB', color: '#c8d4dc', weight: 0.3, open: 0.8 });
      }
      k.reserve(f.body, '#c8d2da', 240, 0.5, 3);
      k.glaze(f.body, '#9aaab8', 170, { bleed: 0.1, texture: 0.9, border: 0.8 });
      // Darker slate back, pale belly: a tight longitudinal value structure.
      const back = f.body.slice(0, Math.floor(f.body.length / 2)).concat([[f.x, f.y]]);
      k.glaze(back, '#4a5a6a', 170, { bleed: 0.2, texture: 0.8 });
      k.reserve(k.shrink(f.body.slice(Math.floor(f.body.length / 2)), 0.9, f.x, f.y), '#eef2f4', 150, 0.5, 2);
      for (const bar of f.bars) k.glaze(bar, '#2a3644', 170, { bleed: 0.1 });
      k.reserve(f.jaw, '#c8d2da', 240, 0.3, 2);
      k.contour(f.jaw, { brush: 'pen', color: '#e8eef2', weight: 0.35 });
      k.contour(f.body, { brush: 'pen', color: '#e8eef2', weight: 0.35, open: 0.7, jitter: 0.6 });
      // Lateral line in silver-cyan, and the restrained ochre eye.
      k.line(...sea.toWorld(f.x, f.y, f.angle, [[f.len * 0.3, -f.height * 0.02]])[0], ...sea.toWorld(f.x, f.y, f.angle, [[-f.len * 0.26, f.height * 0.02]])[0], { brush: 'pen', color: '#9ae0ea', weight: 0.35 });
      const [ex, ey] = f.eye;
      k.reserve(k.petalCircle(ex, ey, 5.5, 9, 0.05), '#c8a050', 250, 0.5, 2);
      brush.noStroke(); brush.noFill(); brush.wash('#05080a', 250); brush.circle(ex, ey, 2.8, 0.1); brush.noWash();
    };
  },
};
