/** Shot 03 — Silver current. Nearly black ink-blue square; three staggered ribbons of sardines
 * cross it, with a wedge of empty water between them. Readable first as ribbons, then as fish. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';

export const silverCurrent = {
  id: 'silver-current',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#071727');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      const { R } = k;
      k.ground([['#0a1d30', 150], ['#051220', 110]], { texture: 0.55, border: 0.2 });
      k.stains('#0d2438', 70, 4, 80, 160);
      // Three ribbons, staggered, leaving an empty wedge between the second and third.
      const ribbons = [
        { path: o.bez([-40, 110], [150, 40], [360, 170], [640, 90]), n: 150, spread: 18 },
        { path: o.bez([-40, 250], [180, 200], [380, 300], [640, 230]), n: 120, spread: 13 },
        { path: o.bez([-40, 520], [200, 470], [420, 560], [640, 500]), n: 170, spread: 22 },
      ];
      for (const rb of ribbons) {
        for (const f of o.school(rb.path, rb.n, { len: R(16, 20), h: 5, spread: rb.spread, jitterAngle: 4 })) {
          o.sea.paintFish(f, { colors: [k.pick(['#c8d4dc', '#b0c4d0', '#dce6ea']), '#8aa8b8'], reserve: '#e8f0f4', reserveAlpha: 235, fin: '#7fa8b8', belly: '#f4f8fa', ink: '#1a2a38', contourWeight: 0.2, finRays: false, open: 0.7, eyeRing: '#e8f0f4', eye: '#05101a' });
          // A cyan lateral glint on some.
          if (R() < 0.35) k.line(...o.sea.toWorld(f.x, f.y, f.angle, [[f.len * 0.25, 0]])[0], ...o.sea.toWorld(f.x, f.y, f.angle, [[-f.len * 0.2, 0]])[0], { brush: 'pen', color: '#6ee0f0', weight: 0.25 });
        }
      }
      // A few muted ochre stragglers in the wedge, to make its emptiness felt.
      for (let i = 0; i < 3; i++) {
        const f = o.sea.fish(R(200, 420), R(360, 420), R(-10, 10), 18, 5);
        o.sea.paintFish(f, { colors: ['#b89a5a', '#9a7e48'], reserve: '#d8c090', fin: '#9a7e48', ink: '#1a2a38', contourWeight: 0.2, finRays: false });
      }
    };
  },
};
