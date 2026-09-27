/** Shot 18 — Manta monument. Near-black water; one immense manta ray spans beyond the square on an
 * asymmetric wing diagonal, cephalic fins forward, long tail trailing out of frame. Pale gold and
 * ivory wing plane sculpted by dense directional points, muted blue-violet shadow, a dark central
 * value structure (gill slits, back). The three-second hold. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';

export const mantaMonument = {
  id: 'manta-monument',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#060B12');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      const { R, G } = k;
      k.ground([['#08101a', 180], ['#04080e', 140]], { texture: 0.5, border: 0.2 });
      const m = o.manta(300, 318, -34, 720, 560);
      // Wing plane: ivory reserve and pale gold glaze; blue-violet shadow toward each trailing edge.
      k.reserve(m.wing, '#e8dcc0', 245, 0.45, 3);
      k.glaze(m.wing, '#d8c48a', 165, { bleed: 0.08, texture: 0.9, border: 0.8 });
      for (const s of [-1, 1]) {
        const shadow = [m.L(-0.05, s * 0.2), m.L(-0.14, s * 0.46), m.L(-0.2, s * 0.3), m.L(-0.26, s * 0.12), m.L(-0.1, s * 0.1)];
        k.glaze(shadow, '#7a78a8', 100, { bleed: 0.45, texture: 0.8 });
      }
      // Directional striation following the span (the points flow along each wing).
      for (let i = 0; i < 70; i++) {
        const s = R() < 0.5 ? -1 : 1; const v = R(0.08, 0.44); const u = R(-0.12, 0.26) * (1 - v);
        k.line(...m.L(u, s * v), ...m.L(u - R(0.03, 0.08), s * (v + R(0.03, 0.08))), { brush: 'crayon', color: k.pick(['#f4ecd8', '#c8b07a', '#8a88b0']), weight: R(0.3, 0.6) });
      }
      // Dark central value structure: a narrow spine band and two shoulder marks.
      k.glaze(m.spine, '#8a84a0', 110, { bleed: 0.35, texture: 0.7 });
      for (const sh of m.shoulders) k.glaze(sh, '#9a92a8', 100, { bleed: 0.35 });
      for (const part of [m.cephL, m.cephR]) { k.reserve(part, '#d8ccb0', 240, 0.5, 2); k.glaze(part, '#b8a878', 150, { bleed: 0.1 }); k.contour(part, { brush: 'HB', color: '#f4ecd8', weight: 0.35 }); }
      for (const e of m.eyes) { brush.noStroke(); brush.noFill(); brush.wash('#0a0a12', 250); brush.circle(...e, 2.6, 0.1); brush.noWash(); }
      k.contour(m.wing, { brush: 'HB', color: '#f4ecd8', weight: 0.45, open: 0.75, jitter: 0.6 });
      k.stem(m.tail, { brush: '2B', color: '#b8a878', weight: 1.1, curvature: 0.6 });
      // Remora-like pale marks and a few suspended particles in the black margins.
      for (let i = 0; i < 40; i++) { brush.noStroke(); brush.noFill(); brush.wash(k.pick(['#3a4a6a', '#5a5a7a']), R(120, 200)); brush.circle(R(600), R(600), R(0.6, 1.2), 0.2); brush.noWash(); }
      void G;
    };
  },
};
