/** Shot 11 — Yellow engineering flower (reconstructed). Bright yellow ground; a big orange/red
 * flower cut across by black scribbles, radial construction strokes, vertical rules and tilted
 * geometric outlines: angular technical marks colliding with soft pigment. */
import { createKit, plateSetup } from '../kit.js';

export const engineeringFlower = {
  id: 'engineering-flower',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#ffd400');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#ffd000', 170], ['#ffdc1f', 110], ['#f5c400', 70]], { texture: 0.8, border: 0.3 });
      k.stains('#ffe45a', 80, 5, 40, 110);
      const cx = 292; const cy = 318;
      // Construction first, under the paint: radial rays across the whole square.
      for (let i = 0; i < 18; i++) {
        const a = i * (360 / 18) + G(0, 2);
        k.line(...polar(cx, cy, a, R(40, 120)), ...polar(cx, cy, a, R(250, 440)), { brush: 'rotring', color: '#141008', weight: R(0.15, 0.28) });
      }
      // The flower: orange body, red glazes, darker veining, scarlet heart.
      const petals = [];
      const rot = R(360);
      for (let i = 0; i < 6; i++) {
        const a = rot + i * 60 + G(0, 8);
        const len = R(175, 225);
        const pts = k.petalOutline(cx, cy, a, len, len * R(0.62, 0.78), { ruffle: 0.1, notch: k.chance(0.5) ? 0.08 : 0 });
        petals.push({ a, len, pts });
        k.reserve(pts, k.pick(['#ff6a00', '#ff7300', '#ff5c00']), 250, 0.5, 3);
        k.glaze(pts, k.pick(['#ff7a00', '#ff6a00', '#f25a00']), 200, { bleed: 0.2, texture: 0.9, border: 0.85 });
        k.glaze(k.petalOutline(cx, cy, a + G(0, 5), len * R(0.5, 0.75), len * 0.45, { ruffle: 0.08 }), k.pick(['#e8301c', '#d91e18', '#c8160f']), 210, { bleed: 0.3, texture: 0.9, border: 0.7 });
      }
      for (const pet of petals) {
        for (let v = 0; v < 5; v++) k.line(...polar(cx, cy, pet.a + G(0, 6), 30), ...polar(cx, cy, pet.a + G(0, 10), pet.len * R(0.5, 0.9)), { brush: 'HB', color: '#8a1004', weight: 0.35 });
      }
      const heart = k.petalCircle(cx, cy, 58, 11, 0.15);
      k.glaze(heart, '#b3100c', 220, { bleed: 0.3, texture: 0.7 });
      k.glaze(k.petalCircle(cx, cy, 20, 8, 0.2), '#2a0402', 220, { bleed: 0.2 });
      // Technical overlay: tilted rectangles, a triangle, arcs, vertical rules, dimension ticks.
      brush.noFill();
      for (let i = 0; i < 2; i++) {
        p.push(); p.translate(cx + G(0, 40), cy + G(0, 40)); p.rotate(R(-25, 25));
        brush.set('rotring', '#0b0906', R(0.5, 0.9));
        const w = R(120, 330); const h = R(90, 280);
        brush.rect(-w / 2, -h / 2, w, h);
        p.pop();
      }
      brush.set('rotring', '#0b0906', 0.7);
      k.shape([[cx - 190, cy + 170], [cx + 40, cy - 230], [cx + 210, cy + 150]], 0, true);
      for (const r of [95, 205, 262]) brush.arc(cx, cy, r, R(-80, 40), R(90, 250));
      for (let i = 0; i < 9; i++) {
        const x = k.pick([R(20, 120), R(470, 585)]);
        k.line(x, R(0, 200), x + G(0, 2), R(380, 600), { brush: k.pick(['rotring', 'pen', '2B']), color: '#0b0906', weight: R(0.3, 1.1) });
      }
      for (let i = 0; i < 14; i++) {
        const y = 40 + i * 38;
        k.line(566, y, 584, y, { brush: 'rotring', color: '#0b0906', weight: 0.4 });
      }
      k.line(40, 560, 300, 560, { brush: 'rotring', color: '#0b0906', weight: 0.5 });
      for (const x of [40, 105, 170, 235, 300]) k.line(x, 552, x, 568, { brush: 'rotring', color: '#0b0906', weight: 0.4 });
      k.line(cx - 22, cy, cx + 22, cy, { brush: 'rotring', color: '#fff4c0', weight: 0.5 });
      k.line(cx, cy - 22, cx, cy + 22, { brush: 'rotring', color: '#fff4c0', weight: 0.5 });
      // Black scribbles: fast, looping, heavy in places.
      for (let i = 0; i < 6; i++) {
        const x = cx + G(0, 150); const y = cy + G(0, 140);
        brush.set(k.pick(['pen', 'charcoal', '2B']), '#0a0806', R(0.5, 1.3));
        brush.beginStroke('curve', x, y);
        let a = R(360);
        for (let s = 0; s < k.pick([8, 14, 22]); s++) { a += R(95, 200); brush.move(a, R(12, 40), R(0.5, 1.4)); }
        brush.endStroke(a, 0.4);
      }
      for (let i = 0; i < 4; i++) {
        brush.set('charcoal', '#0a0806', R(1, 1.8));
        const x = R(80, 520); const y = R(80, 520);
        brush.line(x, y, x + R(-120, 120), y + R(-40, 40));
      }
    };
  },
};
