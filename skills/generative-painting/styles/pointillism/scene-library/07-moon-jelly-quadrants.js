/** Shot 07 — Moon-jelly quadrants. Indigo; four large cropped moon jellies seen from above enclose a
 * quiet centre, each with a differently weighted interior (one dense, one ringed, one sparse, one
 * radial). Pearl, periwinkle, rose. Designed symmetry. */
import { createKit, plateSetup } from '../kit.js';

export const moonJellyQuadrants = {
  id: 'moon-jelly-quadrants',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#171A3F');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#1c2050', 150], ['#12143a', 110]], { texture: 0.55, border: 0.2 });
      const corners = [[60, 60, 20, 'dense'], [540, 60, 110, 'ring'], [60, 540, 290, 'sparse'], [540, 540, 200, 'radial']];
      corners.forEach(([x, y, rot, kind]) => {
        const r = R(225, 245);
        for (let t = 0; t < 120; t++) { const a = rot + (360 * t) / 120; k.line(...polar(x, y, a, r * 0.99), ...polar(x, y, a + G(0, 2), r * R(1.04, 1.12)), { brush: '2H', color: '#d8dcf8', weight: 0.2 }); }
        const rim = []; for (let s = 0; s < 72; s++) { const a = rot + (360 * s) / 72; rim.push(polar(x, y, a, r * (1 - (s % 9 === 0 ? 0.04 : 0)))); }
        k.reserve(rim, '#9aa4e0', 55, 0.5, 3);
        k.glaze(rim, '#b8c0f0', 70, { bleed: 0.12, texture: 0.9, border: 0.9 });
        k.contour(rim, { brush: 'HB', color: '#eef0ff', weight: 0.35, open: 0.85, jitter: 0.7 });
        if (kind === 'dense') k.reserve(k.shrink(rim, 0.55, x, y), '#e8eaff', 120, 0.5, 3);
        if (kind === 'ring') for (const s of [0.35, 0.55, 0.75]) k.contour(k.shrink(rim, s, x, y), { brush: 'pen', color: '#e8eaff', weight: 0.5, jitter: 0.5 });
        if (kind === 'sparse') for (let i = 0; i < 30; i++) { brush.noStroke(); brush.noFill(); brush.wash('#f4f0ff', 200); brush.circle(...polar(x, y, R(360), R(20, r * 0.8)), R(1, 2.5), 0.2); brush.noWash(); }
        if (kind === 'radial') for (let c = 0; c < 24; c++) { const a = rot + c * 15; k.line(...polar(x, y, a, r * 0.18), ...polar(x, y, a + G(0, 1.5), r * 0.94), { brush: 'pen', color: '#e0e4ff', weight: 0.35 }); }
        // Rose horseshoe gonads, weighted differently per jelly.
        const gw = { dense: 0.06, ring: 0.045, sparse: 0.03, radial: 0.05 }[kind];
        for (let g = 0; g < 4; g++) {
          const a = rot + 45 + g * 90; const [gx, gy] = polar(x, y, a, r * 0.24);
          const arc = []; for (let s = 0; s <= 8; s++) arc.push([...polar(gx, gy, a + 240 + s * 30, r * 0.09), 1]);
          const shoe = k.strip(arc, r * gw, 0.9);
          k.reserve(shoe, '#f0a0c0', 230, 0.6, 2); k.glaze(shoe, '#d8508a', 160, { bleed: 0.25 });
        }
      });
      // Quiet centre: a dotted crosshair and nothing else.
      for (let i = -3; i <= 3; i++) { k.line(300 + i * 6, 300, 300 + i * 6 + 2, 300, { brush: 'HB', color: '#8890c8', weight: 0.4 }); k.line(300, 300 + i * 6, 300, 300 + i * 6 + 2, { brush: 'HB', color: '#8890c8', weight: 0.4 }); }
    };
  },
};
