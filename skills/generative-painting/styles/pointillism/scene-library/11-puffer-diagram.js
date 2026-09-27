/** Shot 11 — Puffer diagram. Hot yellow; one oversized orange pufferfish, cropped low right,
 * interrupting black dotted measuring arcs that radiate from the upper-left corner, with rules,
 * ticks and a dimension line. Coarse dense body dabs versus thin engineering marks. */
import { createKit, plateSetup } from '../kit.js';

export const pufferDiagram = {
  id: 'puffer-diagram',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#FFD400');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#ffd000', 170], ['#ffdc1f', 100]], { texture: 0.8, border: 0.3 });
      const ink = '#141008';
      // Measuring arcs from the upper-left corner (behind the fish), plus radial rules.
      brush.noFill();
      for (const r of [120, 190, 260, 330, 400, 470, 540]) { brush.set('rotring', ink, 0.45); brush.arc(0, 0, r, -90, 0); }
      for (let i = 0; i <= 6; i++) { const a = -i * 15; k.line(0, 0, ...polar(0, 0, -a, 560), { brush: 'rotring', color: ink, weight: 0.25 }); }
      const cx = 372; const cy = 392; const r = 220;
      // Tail and fins.
      const tail = k.petalOutline(cx - r * 0.95, cy - 10, 185, 110, 120, { base: 0.25, widest: 0.8, ruffle: 0.14, notch: 0.12 });
      const finTop = k.petalOutline(cx - r * 0.45, cy - r * 0.86, 215, 70, 60, { base: 0.4, widest: 0.6, ruffle: 0.15 });
      for (const fin of [tail, finTop]) { k.reserve(fin, '#ff8a2a', 240, 0.5, 2); k.glaze(fin, '#e8420e', 180, { bleed: 0.2, texture: 0.9 }); }
      const body = k.petalCircle(cx, cy, r, 22, 0.04);
      k.reserve(body, '#ff6a00', 250, 0.5, 3);
      k.glaze(body, '#ff7a00', 190, { bleed: 0.15, texture: 0.9, border: 0.85 });
      for (let i = 0; i < 7; i++) k.glaze(k.petalCircle(...polar(cx, cy, R(360), R(30, 140)), R(50, 110), 12, 0.15), k.pick(['#e8301c', '#d91e18', '#ff9a2a']), R(140, 190), { bleed: 0.3, texture: 0.9 });
      k.glaze(k.petalCircle(cx + 20, cy + 120, 120, 12, 0.08), '#fff0c0', 160, { bleed: 0.3 });
      for (let i = 0; i < 180; i++) { const a = R(360); const rr = Math.sqrt(R()) * r; const [x, y] = polar(cx, cy, a, rr); k.line(x, y, ...polar(x, y, a + G(0, 10), rr > r * 0.88 ? R(14, 26) : R(4, 9)), { brush: 'pen', color: '#3a0a02', weight: R(0.3, 0.7) }); }
      const ex = cx - 70; const ey = cy - 90;
      k.reserve(k.petalCircle(ex, ey, 34, 12, 0.05), '#fff4c0', 250, 0.5, 2);
      k.glaze(k.petalCircle(ex - 5, ey, 18, 10, 0.08), '#2a0402', 230, { bleed: 0.12 });
      brush.noStroke(); brush.noFill(); brush.wash('#ffffff', 240); brush.circle(ex - 10, ey - 7, 4, 0.1); brush.noWash();
      k.contour(k.petalCircle(ex, ey, 34, 12, 0.03), { brush: 'pen', color: ink, weight: 0.6 });
      // Dimension line and ticks above the fish.
      k.line(cx - r, 118, cx + r * 0.6, 118, { brush: 'rotring', color: ink, weight: 0.5 });
      for (const x of [cx - r, cx, cx + r * 0.6]) k.line(x, 108, x, 128, { brush: 'rotring', color: ink, weight: 0.45 });
      for (let i = 0; i < 14; i++) k.line(20, 180 + i * 28, 34, 180 + i * 28, { brush: 'rotring', color: ink, weight: 0.4 });
      k.line(cx - 18, cy, cx + 18, cy, { brush: 'rotring', color: '#fff4c0', weight: 0.5 });
      k.line(cx, cy - 18, cx, cy + 18, { brush: 'rotring', color: '#fff4c0', weight: 0.5 });
    };
  },
};
