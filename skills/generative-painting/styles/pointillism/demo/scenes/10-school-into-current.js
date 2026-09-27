/** Shot 10 — School into current (plate under moving particles). Sand ground; the plate paints only
 * the inner crescent of the school, which stays coherent. The outer arc of tiny fish is carried by
 * the particle set (particles.js, 'school'), which loosens tangentially outward into coloured points. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';
import { SCHOOL } from '../particles.js';

export const schoolIntoCurrent = {
  id: 'school-into-current',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#EEE2C8');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      const { R, G } = k;
      k.ground([['#e8dbbf', 80]], { texture: 0.7, border: 0.2 });
      k.stains('#dfcfae', 22, 4, 60, 130, { texture: 0.85 });
      // Inner crescent: an arc just inside the particle arc, painted as small teal/cobalt fish.
      const { cx, cy, r0 } = SCHOOL;
      const arc = [];
      for (let a = SCHOOL.a0; a <= SCHOOL.a1; a += 3) arc.push(k.polar(cx, cy, a, r0 - 22));
      for (const f of o.school(arc, 60, { len: 15, h: 5, spread: 8, jitterAngle: 5 })) {
        o.sea.paintFish(f, { colors: [k.pick(['#1f6f8b', '#2a5da8', '#1b8a8a']), '#3a9fb0'], fin: '#2a5da8', ink: '#0d2f4a', contourWeight: 0.2, finRays: false, open: 0.8, eyeRing: '#eef2f0', eye: '#081a2a' });
      }
      void R; void G;
    };
  },
};
