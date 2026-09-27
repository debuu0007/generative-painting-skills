/** Shot 14 — Measured pink flower (reconstructed). Pale paper with fine grids, rectangles and
 * crosshairs that show through a central translucent magenta/lavender/orange flower. Several
 * line weights keep the construction secondary to the painting. */
import { createKit, plateSetup } from '../kit.js';

export const measuredPink = {
  id: 'measured-pink',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#f5f1ea');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#f1ebe1', 70]], { texture: 0.7, border: 0.2 });
      const blue = '#7f93b8'; const lead = '#5a5560';
      // Fine grid (lightest weight) and a coarser grid.
      for (let x = 20; x < 600; x += 20) k.line(x, 0, x, 600, { brush: '2H', color: blue, weight: x % 100 === 0 ? 0.3 : 0.15 });
      for (let y = 20; y < 600; y += 20) k.line(0, y, 600, y, { brush: '2H', color: blue, weight: y % 100 === 0 ? 0.3 : 0.15 });
      const cx = 300; const cy = 292;
      // The flower: translucent layers so the grid reads through.
      const rot = R(360);
      for (let layer = 0; layer < 3; layer++) {
        const n = [5, 5, 6][layer];
        for (let i = 0; i < n; i++) {
          const a = rot + layer * 24 + (360 / n) * i + G(0, 6);
          const len = [195, 150, 95][layer] * R(0.9, 1.08);
          const pts = k.petalOutline(cx, cy, a, len, len * R(0.55, 0.7), { ruffle: 0.08, notch: layer === 0 ? 0.06 : 0 });
          const col = [['#b59ad8', '#c7b0e6'], ['#e0418a', '#d6246e'], ['#f0a060', '#f28c6a']][layer];
          k.glaze(pts, k.pick(col), [150, 175, 175][layer], { bleed: 0.2, texture: 0.85, border: 0.85 });
          if (layer === 1) k.glaze(k.shrink(pts, 0.6, cx, cy), '#b0105a', 150, { bleed: 0.2, texture: 0.85 });
          if (layer === 0) k.glaze(k.shrink(k.wobble(pts, 2), 0.75, cx, cy), '#9b7fd0', 110, { bleed: 0.3, texture: 0.8 });
          if (layer === 1) k.contour(pts, { brush: 'HB', color: '#6b2a4a', weight: 0.3, open: 0.7, jitter: 0.3 });
        }
      }
      const disc = k.petalCircle(cx, cy, 24, 10, 0.1);
      k.glaze(disc, '#f5b041', 190, { bleed: 0.2, texture: 0.6 });
      k.stipple(cx, cy, 10, 10, 50, '#7a2a10', { weight: 0.5 });
      // Construction over the paint: bounding rectangles, crosshairs, radius arcs, dimension lines.
      brush.noFill();
      brush.set('rotring', lead, 0.35);
      brush.rect(cx - 205, cy - 205, 410, 410);
      brush.set('2H', lead, 0.3);
      brush.rect(cx - 150, cy - 110, 300, 220);
      brush.rect(cx - 60, cy - 60, 120, 120);
      k.line(cx - 250, cy, cx + 250, cy, { brush: 'rotring', color: lead, weight: 0.3 });
      k.line(cx, cy - 250, cx, cy + 250, { brush: 'rotring', color: lead, weight: 0.3 });
      for (const [x, y] of [[cx - 205, cy - 205], [cx + 205, cy - 205], [cx - 205, cy + 205], [cx + 205, cy + 205], [cx + 150, cy - 110]]) {
        k.line(x - 12, y, x + 12, y, { brush: 'rotring', color: '#2f2a33', weight: 0.45 });
        k.line(x, y - 12, x, y + 12, { brush: 'rotring', color: '#2f2a33', weight: 0.45 });
      }
      brush.set('2H', lead, 0.3);
      for (const r of [60, 120, 190]) brush.arc(cx, cy, r, R(190, 230), R(300, 340));
      k.line(cx - 205, 556, cx + 205, 556, { brush: 'rotring', color: lead, weight: 0.35 });
      for (const x of [cx - 205, cx, cx + 205]) k.line(x, 548, x, 564, { brush: 'rotring', color: lead, weight: 0.35 });
      k.line(548, cy - 205, 548, cy + 205, { brush: 'rotring', color: lead, weight: 0.35 });
      for (const y of [cy - 205, cy + 205]) k.line(540, y, 556, y, { brush: 'rotring', color: lead, weight: 0.35 });
      for (let i = 0; i < 5; i++) {
        const a = rot + i * 72;
        k.line(...polar(cx, cy, a, 200), ...polar(cx, cy, a, 238), { brush: '2H', color: '#8a3a66', weight: 0.25 });
      }
    };
  },
};
