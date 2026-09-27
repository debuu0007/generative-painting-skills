/** Shot 14 — Comb-jelly study. Deep petrol ground with a fine measurement grid; one narrow,
 * vertically oriented comb jelly whose eight dotted rib bands catch light through contrast (pearl,
 * lilac, cyan, coral), with its two lobes and tentacle sheaths. No bloom, no glow. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';

export const combJellyStudy = {
  id: 'comb-jelly-study',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#092D3C');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      const { R } = k;
      k.ground([['#0c3446', 150], ['#07222e', 100]], { texture: 0.55, border: 0.2 });
      const grid = '#2f5a6a';
      for (let x = 30; x < 600; x += 30) k.line(x, 0, x, 600, { brush: '2H', color: grid, weight: x % 150 === 0 ? 0.35 : 0.18 });
      for (let y = 30; y < 600; y += 30) k.line(0, y, 600, y, { brush: '2H', color: grid, weight: y % 150 === 0 ? 0.35 : 0.18 });
      const cx = 300; const cy = 280; const h = 190; const w = 78;
      const j = o.combJelly(cx, cy, h, w);
      k.reserve(j.body, '#9ab8c8', 55, 0.5, 3);
      k.contour(j.body, { brush: 'pen', color: '#e8f0f4', weight: 0.45, open: 0.95, jitter: 0.4 });
      for (const lobe of j.lobes) { k.reserve(lobe, '#b8a8d8', 60, 0.5, 2); k.contour(lobe, { brush: 'HB', color: '#d8d0f0', weight: 0.3, open: 0.85 }); }
      // Comb rows: bands of bright dots, iridescent through neighbouring hues.
      const iri = ['#f4f8ff', '#c9a8e8', '#6ee0f0', '#f0906a', '#e8f0ff'];
      j.rows.forEach((row, ri) => {
        for (let s = 1; s < row.length - 1; s++) {
          const [x, y] = row[s];
          brush.noStroke(); brush.noFill(); brush.wash(iri[(ri + s) % iri.length], 245); brush.circle(x, y, 1.6 + (s % 2) * 0.6, 0.15); brush.noWash();
        }
        k.stem(row, { brush: '2H', color: '#8ab8c8', weight: 0.25, curvature: 0.6 });
      });
      // Tentacle sheaths and two fine side-branched tentacles.
      for (const sd of [-1, 1]) {
        const t = [[cx + sd * w * 0.5, cy - 20], [cx + sd * w * 1.2, cy + 80], [cx + sd * w * 1.6, cy + 200], [cx + sd * w * 1.3, cy + 290]];
        k.stem(t, { brush: 'HB', color: '#f0c0a0', weight: 0.35, curvature: 0.7 });
        for (let i = 1; i < 10; i++) { const [x, y] = [t[1][0] + (t[2][0] - t[1][0]) * i / 10, t[1][1] + (t[2][1] - t[1][1]) * i / 10]; k.line(x, y, x + sd * R(6, 14), y + R(4, 10), { brush: '2H', color: '#f0c0a0', weight: 0.2 }); }
      }
      // Measurement marks.
      k.line(cx - w - 40, cy - h, cx - w - 40, cy + h, { brush: 'rotring', color: '#a8c8d4', weight: 0.35 });
      for (const y of [cy - h, cy, cy + h]) k.line(cx - w - 48, y, cx - w - 32, y, { brush: 'rotring', color: '#a8c8d4', weight: 0.35 });
      k.line(cx - w, cy + h + 30, cx + w, cy + h + 30, { brush: 'rotring', color: '#a8c8d4', weight: 0.35 });
    };
  },
};
