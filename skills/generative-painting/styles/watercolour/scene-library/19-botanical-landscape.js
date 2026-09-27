/** Shot 19 — Botanical landscape (reconstructed). Pale cream-blue sky, faint blue mountain
 * ridges, green grassy foreground dense with red/blue/yellow flowers. Low-contrast distance and a
 * sharper, larger foreground build depth without photographic assets. */
import { createKit, plateSetup } from '../kit.js';

export const botanicalLandscape = {
  id: 'botanical-landscape',
  kind: 'reconstructed',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#f4efe2');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const { R, G, polar } = k;
      k.ground([['#f1ead8', 70]], { texture: 0.6, border: 0.2 });
      // Sky: soft blue glaze fading toward the horizon.
      k.glaze([[-20, -20], [620, -20], [620, 200], [300, 230], [-20, 210]], '#c9d8e8', 150, { bleed: 0.5, texture: 0.7, border: 0.2 });
      k.glaze([[-20, -20], [620, -20], [620, 90], [-20, 110]], '#b5c9e0', 110, { bleed: 0.5, texture: 0.7 });
      // Mountains: distant ridges, very pale and cool.
      const ridge = (base, peaks, col, alpha, lineCol) => {
        const pts = [[-20, 380]];
        const top = [];
        for (let x = -20; x <= 620; x += 12) {
          let h = 0;
          for (const [px, ph, pw] of peaks) h = Math.max(h, ph * Math.max(0, 1 - Math.abs(x - px) / pw));
          const y = base - h - Math.abs(G(0, 2.5));
          pts.push([x, y]); top.push([x, y]);
        }
        pts.push([620, 380]);
        k.glaze(pts, col, alpha, { bleed: 0.12, texture: 0.85, border: 0.7, curvature: 0.2 });
        k.stem(top.filter((_, i) => i % 3 === 0), { brush: '2H', color: lineCol, weight: 0.3, curvature: 0.3 });
      };
      ridge(262, [[90, 70, 170], [300, 128, 210], [470, 92, 180], [600, 60, 120]], '#b3c4de', 140, '#8ea3c6');
      ridge(292, [[180, 62, 190], [420, 48, 200], [560, 70, 150]], '#96acd0', 140, '#7f95bd');
      // Middle ground: soft green band and small blurred flowers.
      k.glaze([[-20, 300], [160, 285], [340, 300], [620, 280], [620, 620], [-20, 620]], '#a5c07d', 175, { bleed: 0.35, texture: 0.8 });
      k.glaze([[-20, 360], [220, 345], [460, 360], [620, 350], [620, 620], [-20, 620]], '#7ea35a', 185, { bleed: 0.35, texture: 0.8 });
      k.glaze([[-20, 450], [300, 430], [620, 445], [620, 620], [-20, 620]], '#4f7d38', 195, { bleed: 0.3, texture: 0.8 });
      for (let i = 0; i < 90; i++) {
        const x = R(-10, 610); const y = R(300, 400);
        k.glaze(k.petalCircle(x, y, R(2, 4), 6, 0.3), k.pick(['#d9534f', '#6f8fd0', '#f2c94c']), 190, { bleed: 0.3, texture: 0.5 });
      }
      // Grass strokes, denser and larger toward the viewer.
      for (let i = 0; i < 260; i++) {
        const y = R(360, 620);
        const near = (y - 360) / 260;
        const x = R(-10, 610);
        k.line(x, y, x + G(0, 5 + near * 8), y - (6 + near * 40) * R(0.6, 1.2), { brush: k.pick(['HB', 'cpencil']), color: k.pick(['#3f6d2c', '#5a8a3a', '#7ba350', '#2f5a24']), weight: 0.3 + near * 0.6 });
      }
      // Foreground flowers: red, blue and yellow, growing larger and sharper as they approach.
      for (let i = 0; i < 120; i++) {
        const y = 390 + Math.pow(R(), 0.7) * 225;
        const near = (y - 390) / 225;
        const x = R(-15, 615);
        const s = k.lerp(0.55, 2.6, near * near);
        const type = k.pick(['red', 'red', 'blue', 'blue', 'yellow']);
        const col = { red: ['#d9362b', '#e8553f'], blue: ['#3f66c4', '#5b82d6'], yellow: ['#f2c230', '#f5d24f'] }[type];
        k.stem([[x, y], [x + G(0, 3), y + 20 * s]], { brush: 'HB', color: '#3f6d2c', weight: 0.5 * s });
        k.flower(x, y, { petals: type === 'blue' ? 7 : 5, len: 8 * s, wid: 7 * s, colors: col, passes: near > 0.5 ? 2 : 1, alpha: 200, bleed: 0.2,
          notch: type === 'blue' ? 0.2 : 0, center: '#3a2410', centerR: 1.6 * s,
          contour: near > 0.55 ? '#2e2a22' : null, contourWeight: 0.25, contourChance: 0.6 });
      }
      k.stipple(300, 540, 280, 60, 140, '#f5d24f', { weight: 0.5 });
      k.stipple(300, 560, 280, 50, 120, '#d9362b', { weight: 0.5 });
    };
  },
};
