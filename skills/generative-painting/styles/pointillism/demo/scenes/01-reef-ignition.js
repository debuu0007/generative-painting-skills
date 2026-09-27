/** Shot 01 / 21 — Reef ignition. Cobalt field; a dense diagonal fan of branching coral from lower
 * left to upper right (gold, coral, rose, turquoise), with a school of small reef fish streaming
 * through two clear channels that cross the fan. The immediate saturated hook. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';

export const reefIgnition = {
  id: 'reef-ignition',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#1736B8');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      const { R, G } = k;
      k.ground([['#1d40d0', 150], ['#12309f', 80]], { texture: 0.7, border: 0.3 });
      k.stains('#0f2690', 80, 5, 60, 130, { x: () => k.pick([R(-20, 160), R(440, 620)]) });
      // Two channels (kept clear of coral) run parallel to the fan's diagonal.
      const channels = [o.bez([-20, 360], [160, 300], [330, 160], [620, 60]), o.bez([-20, 520], [200, 470], [420, 330], [620, 250])];
      const nearChannel = (x, y) => channels.some((c) => c.some(([cx, cy]) => Math.hypot(cx - x, cy - y) < 26));
      // The fan: coral roots scattered along the lower-left -> upper-right diagonal band.
      const cols = [['#ffc400', '#ffe36a'], ['#ff6a3d', '#ffb08a'], ['#ff4f9a', '#ffc2de'], ['#1fc8c0', '#a8f0ea'], ['#ff9a1f', '#ffd49a']];
      for (let i = 0; i < 70; i++) {
        const t = R(); const x = 20 + t * 560 + G(0, 75); const y = 580 - t * 540 + G(0, 75);
        if (nearChannel(x, y)) continue;
        const [col, pale] = k.pick(cols);
        const branches = o.sea.coralBranches(x, y, -45 + G(0, 40), R(40, 75), R(9, 16), 3);
        for (const b of branches) {
          if (nearChannel(...b.tip)) continue;
          k.reserve(b.poly, pale, 230, 0.6, 2);
          k.glaze(b.poly, col, 200, { bleed: 0.2, texture: 0.8, border: 0.6 });
        }
      }
      // Brain and plate coral heads massed along the band.
      for (let i = 0; i < 40; i++) {
        const t = R(); const x = 40 + t * 520 + G(0, 60); const y = 560 - t * 510 + G(0, 60);
        if (nearChannel(x, y)) continue;
        const head = k.petalCircle(x, y, R(22, 48), 12, 0.2);
        k.reserve(head, '#ffe9a8', 235, 0.6, 2);
        k.glaze(head, k.pick(['#ffb800', '#ff8a2a', '#e8a72a']), 190, { bleed: 0.15, texture: 0.9, border: 0.7 });
        k.contour(head, { brush: 'pen', color: '#6a3a00', weight: 0.35, open: 0.6, jitter: 0.8 });
      }
      // The school: small fish flowing through both channels.
      for (const c of channels) {
        for (const f of o.school(c, 34, { len: 22, h: 8, spread: 9 })) {
          o.sea.paintFish(f, { colors: [k.pick(['#fff0a0', '#ffe066', '#a8f0ea']), '#ffffff'], reserve: '#fffbe0', fin: '#ffd23f', ink: '#0a1450', contourWeight: 0.3, finRays: false, open: 0.9 });
        }
      }
      // Energetic filaments and pigment drops thrown off the fan.
      for (let i = 0; i < 50; i++) {
        const t = R(); const [x, y] = [70 + t * 460, 530 - t * 460];
        const a = -45 + (R() < 0.5 ? 90 : -90) + G(0, 25);
        k.line(x, y, ...k.polar(x, y, a, R(30, 110)), { brush: 'pen', color: k.pick(['#fff27a', '#ffffff', '#ff9ad0', '#a8f0ea']), weight: R(0.2, 0.45) });
      }
      for (let i = 0; i < 40; i++) o.sea.bubble(R(20, 580), R(10, 300), R(1.5, 5), { ring: '#dff4ff', fillAlpha: 40 });
      k.stipple(300, 300, 220, 220, 260, '#ffe066', { weight: 0.55 });
      k.stipple(300, 300, 240, 240, 120, '#ff6fb0', { weight: 0.5 });
    };
  },
};
