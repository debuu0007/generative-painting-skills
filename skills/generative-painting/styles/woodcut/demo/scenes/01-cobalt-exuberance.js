/** Shot 01 / 21 — Cobalt exuberance (reconstructed). Saturated cobalt ground; huge yellow/gold
 * lobed botanical forms massed and overlapping in the centre, lime stems and tendrils, orange,
 * hot-pink and purple glazes colliding (pigment mixing makes coral and violet where they cross),
 * small translucent circles, black ink scribbles and speckle. Edges keep more breathing room. */
import { createKit, plateSetup } from '../kit.js';

export const cobaltExuberance = {
  id: 'cobalt-exuberance',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#1330b8');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      const cx = 296; const cy = 300;
      k.ground([['#1d43d8', 160], ['#0f2699', 80], ['#2b55f0', 60]], { texture: 0.7, border: 0.3 });
      k.stains('#26127a', 90, 7, 50, 120, { x: () => k.pick([R(-20, 150), R(450, 620)]), y: () => R(600) });
      k.stains('#3f68ff', 70, 6, 25, 70);
      k.stains('#0b1a70', 90, 4, 40, 90, { x: () => R(600), y: () => k.pick([R(-20, 90), R(510, 620)]) });

      // Purple and violet under-forms (purple over cobalt deepens to violet).
      for (let i = 0; i < 5; i++) {
        const [x, y] = polar(cx, cy, R(360), R(40, 150));
        const pts = k.petalOutline(x, y, R(360), R(110, 180), R(70, 110), { ruffle: 0.12, notch: 0.1 });
        k.reserve(pts, '#8e5cf5', R(110, 150));
        k.glaze(pts, k.pick(['#7b2cbf', '#5a189a', '#9d4edd']), 200, { bleed: 0.4, texture: 0.85, border: 0.7 });
      }
      // Lime stems and tendrils as painted ribbons, bent, rising from below.
      const heads = [[cx, cy], [214, 380], [392, 396]];
      for (const [hx, hy] of heads) {
        const path = k.stemPath(hx + R(-140, 140), 650, hx, hy, R(-0.3, 0.3), 8);
        const ribbon = k.strip(path, R(5, 9), 0.4);
        k.reserve(ribbon, '#d9ff8a', 240, 0.6);
        k.glaze(ribbon, k.pick(['#8fe03a', '#a7ef2a', '#62c32a']), 170, { bleed: 0.04, texture: 0.6, border: 0.6 });
      }
      for (let i = 0; i < 6; i++) {
        const x = cx + G(0, 150); const y = cy + G(0, 150);
        brush.set('marker', '#b6f23c', R(0.5, 0.9)); brush.noFill();
        brush.beginStroke('curve', x, y);
        let a = R(360);
        for (let s = 0; s < 7; s++) { a += R(25, 55); brush.move(a, R(10, 26), R(0.5, 1.2)); }
        brush.endStroke(a + 40, 0.4);
      }
      // Lime/green leaves.
      for (let i = 0; i < 7; i++) {
        const [x, y] = polar(cx, cy, R(360), R(40, 110));
        const a = Math.atan2(y - cy, x - cx) * 180 / Math.PI + G(0, 30);
        const pts = k.leafOutline(x, y, a, R(90, 150), R(22, 34));
        k.reserve(pts, '#e8ffb0', 245);
        k.glaze(pts, k.pick(['#8fe03a', '#b6ec3c', '#4fb02a']), 175, { bleed: 0.08, texture: 0.7 });
        k.line(...polar(x, y, a, 4), ...polar(x, y, a, 70), { brush: 'pen', color: '#1f4a0c', weight: 0.4 });
      }
      // Huge gold/yellow lobed forms, crossing each other in the centre.
      const forms = [];
      for (let i = 0; i < 13; i++) {
        const a = R(360);
        const [x, y] = polar(cx, cy, a, R(0, 45));
        forms.push(k.petalOutline(x, y, a + G(0, 30), R(100, 200), R(80, 140), { ruffle: 0.14, notch: k.chance(0.5) ? 0.1 : 0, bend: R(-0.3, 0.3), widest: R(0.5, 0.75) }));
      }
      for (const pts of forms) {
        k.reserve(pts, k.pick(['#ffd400', '#ffc800', '#ffe03d']), R(185, 225), 0.5);
        k.glaze(pts, k.pick(['#ffc400', '#f5a800', '#ffd21a']), 165, { bleed: 0.15, texture: 0.9, border: 0.8 });
        if (k.chance(0.6)) k.glaze(k.shrink(k.wobble(pts, 4), R(0.45, 0.7), ...k.centroid(pts)), k.pick(['#f09000', '#ffe04a', '#e98300']), 150, { bleed: 0.3, texture: 0.9 });
      }
      // Orange and hot-pink glazes over the gold (they mix toward coral / scarlet where they overlap).
      for (let i = 0; i < 12; i++) {
        const [x, y] = polar(cx, cy, R(360), R(0, 110));
        const pts = k.petalOutline(x, y, R(360), R(50, 120), R(34, 70), { ruffle: 0.12 });
        k.glaze(pts, k.pick(['#ff7a00', '#ff6a00', '#ff2d8f', '#ff8c1a']), R(150, 200), { bleed: 0.3, texture: 0.85, border: 0.7 });
      }
      // Botanical drawing over the paint: veined petal outlines in ink, pencil hatching in lobes.
      for (let i = 0; i < 7; i++) {
        const [x, y] = polar(cx, cy, R(360), R(0, 100));
        const a = R(360);
        const pts = k.petalOutline(x, y, a, R(70, 130), R(40, 70), { ruffle: 0.08 });
        k.contour(pts, { brush: 'pen', color: '#101030', weight: 0.45, open: 0.8, jitter: 1 });
        for (let v = 0; v < 5; v++) k.line(...polar(x, y, a + G(0, 8), 12), ...polar(x, y, a + G(0, 14), R(50, 110)), { brush: '2H', color: '#3a1600', weight: 0.35 });
      }
      for (let i = 0; i < 3; i++) {
        const pts = forms[i];
        k.hatchIn(k.shrink(pts, 0.6, ...k.centroid(pts)), { brush: 'HB', color: '#a04a00', weight: 0.35, dist: 3.5, angle: R(180), rand: 0.25 });
      }
      // Purple accents on top, reserved so they stay violet over the gold.
      for (let i = 0; i < 5; i++) {
        const [x, y] = polar(cx, cy, R(360), R(20, 140));
        const pts = k.petalOutline(x, y, R(360), R(22, 45), R(14, 26), { ruffle: 0.1 });
        k.reserve(pts, '#c9a3ff', 230);
        k.glaze(pts, '#7b2cbf', 190, { bleed: 0.25, texture: 0.7 });
      }
      // Separate hot-pink blossoms reserved so they stay pure pink on the blue.
      for (let i = 0; i < 2; i++) {
        const [x, y] = polar(cx, cy, R(360), R(120, 170));
        k.flower(x, y, { petals: k.pick([5, 6]), len: R(30, 50), wid: R(22, 34), colors: ['#ff2d8f', '#ff5aa8'], passes: 2, alpha: 190, reserve: '#ffd6ea', center: k.pick(['#6a1fb0', '#ff7a00']), centerR: 7, centerReserve: '#ffffff', stamens: '#ffe45c', stamenCount: 14 });
      }
      // Two dense flower hearts inside the gold mass.
      for (const [x, y, r] of [[cx + 8, cy - 6, 34], [cx - 70, cy + 64, 22], [cx + 92, cy + 88, 26]]) {
        k.flower(x, y, { petals: 7, len: r * 1.6, wid: r, colors: ['#ff4f1f', '#ff2d8f'], passes: 2, alpha: 185, reserve: '#ffe8d6', ruffle: 0.1 });
        const disc = k.petalCircle(x, y, r * 0.45, 9, 0.2);
        k.reserve(disc, '#e7d0ff', 240);
        k.glaze(disc, '#6a1fb0', 200, { bleed: 0.3, texture: 0.7 });
        k.stipple(x, y, r * 0.25, r * 0.25, 40, '#ffe45c', { weight: 0.7 });
      }
      // Graphite-dark ink scribbles and contours cutting across the mass.
      for (const pts of forms.slice(0, 6)) k.contour(pts, { brush: 'pen', color: '#0c0f36', weight: 0.4, open: 0.4, jitter: 1.8 });
      brush.field('waves');
      for (let i = 0; i < 10; i++) {
        brush.set('pen', k.pick(['#07092a', '#1b0a3a', '#000000']), R(0.35, 0.8));
        brush.flowLine(cx + G(0, 90), cy + G(0, 90), R(60, 180), R(360));
      }
      brush.noField();
      for (let i = 0; i < 3; i++) {
        const x = cx + G(0, 110); const y = cy + G(0, 110);
        brush.set('pen', '#06081f', 0.45); brush.noFill();
        brush.beginStroke('curve', x, y);
        let a = R(360);
        for (let s = 0; s < 14; s++) { a += R(100, 170); brush.move(a, R(6, 16), R(0.6, 1.2)); }
        brush.endStroke(a, 0.5);
      }
      // Exploded structure: pollen filaments radiating from the heart, pigment drops thrown outward.
      for (let i = 0; i < 70; i++) {
        const a = R(360); const r0 = R(20, 70); const r1 = r0 + R(60, 210);
        k.line(...polar(cx, cy, a, r0), ...polar(cx, cy, a + G(0, 3), r1), { brush: 'pen', color: k.pick(['#fff27a', '#ffd000', '#ff7ac0', '#c8ff7a', '#ffffff']), weight: R(0.2, 0.5) });
      }
      for (let i = 0; i < 90; i++) {
        const a = R(360); const r = Math.abs(G(0, 1)) * 150 + 60;
        const [x, y] = polar(cx, cy, a, r);
        brush.noStroke(); brush.noFill(); brush.wash(k.pick(['#ffd000', '#ff7a00', '#ff2d8f', '#b6ec3c', '#9d4edd']), R(170, 240));
        brush.circle(x, y, R(0.8, 3.4), 0.4); brush.noWash();
      }
      // Small translucent circles (some milky, some just drawn).
      for (let i = 0; i < 60; i++) {
        const r = Math.abs(G(0, 1)) * 8 + 2.5;
        const [x, y] = polar(cx, cy, R(360), Math.abs(G(0, 120)));
        if (k.chance(0.55)) {
          brush.noStroke(); brush.noFill(); brush.wash(k.pick(['#ffffff', '#fff39a', '#ffb3de', '#c8ff7a', '#ff9a3c']), R(60, 130));
          brush.circle(x, y, r, 0.15); brush.noWash();
        }
        brush.set('pen', k.pick(['#fff6c4', '#ffffff', '#ff9ad0', '#2a0a55']), R(0.35, 0.7)); brush.noFill();
        brush.circle(x + G(0, 1), y + G(0, 1), r, 0.2);
      }
      k.stipple(cx, cy, 120, 115, 300, '#ffe066', { weight: 0.6 });
      k.stipple(cx, cy, 160, 160, 150, '#ff4fa3', { weight: 0.5 });
      k.stipple(cx, cy, 200, 200, 110, '#c8ff7a', { weight: 0.5 });
      k.stipple(cx, cy, 90, 90, 90, '#0a0d33', { weight: 0.5 });
    };
  },
};
