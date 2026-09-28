/** Shot 18 — Black and enormous yellow (reconstructed). Near-black ground; one gigantic yellow
 * flower whose broad petals run past every edge, a dense red/orange/black centre, and fine
 * white/orange radial lines through luminous, unevenly pigmented petals. */
import { createKit, plateSetup } from '../kit.js';

export const blackYellow = {
  id: 'black-yellow',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#060504');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#0d0a07', 200], ['#050404', 160], ['#140d06', 90]], { texture: 0.6, border: 0.2 });
      const cx = 322; const cy = 286;
      const rot = R(360);
      const rings = [
        { n: 7, len: 470, wid: 205, offset: 25, base: '#f2b300', glazes: ['#e39400', '#f5b800'] },
        { n: 6, len: 395, wid: 190, offset: 0, base: '#ffd21a', glazes: ['#ffcf00', '#f7b400', '#ffe04a'] },
      ];
      const front = [];
      for (const ring of rings) {
        for (let i = 0; i < ring.n; i++) {
          const a = rot + ring.offset + (360 / ring.n) * i + G(0, 5);
          const len = ring.len * R(0.9, 1.08);
          const wid = ring.wid * R(0.88, 1.08);
          const pts = k.petalOutline(cx, cy, a, len, wid, { base: 0.16, widest: R(0.58, 0.72), ruffle: 0.05, notch: k.chance(0.45) ? 0.07 : 0, bend: R(-0.12, 0.12), jitter: 0.018 });
          k.reserve(pts, ring.base, 255, 0.45);
          // Uneven pigment: a granulating body glaze, a deeper pool near the base, a darker edge.
          k.glaze(pts, k.pick(ring.glazes), 170, { bleed: 0.1, texture: 0.95, border: 0.9 });
          k.glaze(k.petalOutline(cx, cy, a + G(0, 4), len * R(0.4, 0.6), wid * 0.7, { base: 0.25, jitter: 0.04 }), '#dc6f00', 165, { bleed: 0.35, texture: 0.8, border: 0.5 });
          const side = k.petalOutline(cx, cy, a + k.pick([-1, 1]) * R(6, 12), len * R(0.7, 0.95), wid * 0.45, { base: 0.1, jitter: 0.04 });
          k.glaze(side, k.pick(['#cf8200', '#ffe873', '#b86c00']), 150, { bleed: 0.25, texture: 0.9, border: 0.6 });
          // Lifted, paler water marks near the tips.
          for (let j = 0; j < 2; j++) {
            const [tx, ty] = polar(cx, cy, a + G(0, 3), len * R(0.45, 0.72));
            brush.noStroke(); brush.noFill(); brush.wash('#fff4b0', R(35, 70)); brush.circle(tx, ty, wid * R(0.1, 0.22), 0.6); brush.noWash();
          }
          // Dry-brush striations along the petal.
          for (let j = 0; j < 7; j++) {
            const da = G(0, wid / len * 18);
            const [x0, y0] = polar(cx, cy, a + da, len * R(0.25, 0.45));
            const [x1, y1] = polar(cx, cy, a + da * 1.1, len * R(0.6, 0.9));
            k.line(x0, y0, x1, y1, { brush: 'crayon', color: k.pick(['#c77700', '#e0a000', '#b56500']), weight: R(0.3, 0.6) });
          }
          if (ring.n === 6) front.push({ a, len, pts });
        }
      }
      // Petal edges catching the dark: broken sepia contour on the front ring only.
      for (const pet of front) k.contour(pet.pts, { brush: '2B', color: '#3a1a00', weight: 0.5, open: 0.4, jitter: 1.2 });
      // Fine radial marks: white and orange, broken, pressure-varied.
      for (let i = 0; i < 90; i++) {
        const a = rot + R(360);
        const r0 = R(95, 150); const r1 = r0 + R(60, 320);
        const [x0, y0] = polar(cx, cy, a, r0); const [x1, y1] = polar(cx, cy, a + G(0, 1.2), r1);
        k.line(x0, y0, x1, y1, { brush: k.chance(0.6) ? 'pen' : '2H', color: k.pick(['#fffbe6', '#fff6d0', '#ff9a1f', '#ff7b00', '#ffffff']), weight: R(0.2, 0.5) });
      }
      // Centre: a halo of orange, a red ring, a black heart; stamens and pollen over it.
      const halo = k.petalCircle(cx, cy, 128, 16, 0.12);
      k.glaze(halo, '#f07a00', 170, { bleed: 0.45, texture: 0.8, border: 0.4 });
      const ring = k.petalCircle(cx, cy, 88, 14, 0.12);
      k.reserve(ring, '#c42a0a', 230, 0.6);
      k.glaze(ring, '#a3150b', 190, { bleed: 0.4, texture: 0.9, border: 0.7 });
      for (let i = 0; i < 18; i++) {
        const [x, y] = polar(cx, cy, R(360), R(20, 80));
        k.glaze(k.petalCircle(x, y, R(10, 28), 8, 0.25), k.pick(['#e8420e', '#7a0b06', '#ff6a14', '#3a0804']), R(130, 210), { bleed: 0.3, texture: 0.8, border: 0.6 });
      }
      const heart = k.petalCircle(cx, cy, 44, 12, 0.18);
      k.reserve(heart, '#1a0503', 250, 0.6);
      k.glaze(heart, '#0c0201', 220, { bleed: 0.3, texture: 0.7, border: 0.8 });
      for (let i = 0; i < 140; i++) {
        const a = R(360); const r0 = R(30, 70); const r1 = r0 + R(10, 55);
        const [x0, y0] = polar(cx, cy, a, r0); const [x1, y1] = polar(cx, cy, a + G(0, 3), r1);
        k.line(x0, y0, x1, y1, { brush: 'pen', color: k.pick(['#ffb02e', '#ffdd66', '#ff5a1f', '#fff4d6', '#140302']), weight: R(0.3, 0.8) });
      }
      for (let i = 0; i < 60; i++) {
        const [x, y] = polar(cx, cy, R(360), 48 + R(0, 40));
        brush.noStroke(); brush.noFill(); brush.wash(k.pick(['#ffd23f', '#ff8a1c', '#ffefb0']), 230); brush.circle(x, y, R(1.2, 3), 0.3); brush.noWash();
      }
      k.stipple(cx, cy, 26, 26, 160, '#ffcf3a', { weight: 0.7 });
      k.stipple(cx, cy, 70, 70, 160, '#1a0402', { weight: 0.8 });
    };
  },
};
