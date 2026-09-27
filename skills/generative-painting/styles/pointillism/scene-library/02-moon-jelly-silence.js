/** Shot 02 — Moon-jelly silence. Cool ivory; one small off-centre moon jelly (side view) and two
 * barely present companions, surrounded by pale space. The breath after the reef. */
import { createKit, plateSetup } from '../kit.js';
import { createOcean } from '../ocean.js';

export const moonJellySilence = {
  id: 'moon-jelly-silence',
  sketch(p, brush, { density = 1 } = {}) {
    p.setup = async () => plateSetup(p, brush, density, '#F5F3E9');
    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      const k = createKit(p, brush);
      const o = createOcean(k, brush);
      k.ground([['#f1efe3', 50]], { texture: 0.5, border: 0.15 });
      // Main jelly: lavender bell, dusty-rose gonads, fine blue-grey tentacles.
      o.sea.paintJelly(402, 212, 46, 262, { depth: 0.72, color: '#b9a8d8', alpha: 150, inner: '#d7cbe9', ink: '#7a6a98', contourWeight: 0.35, tentacle: '#8e9ab0', tentacleWeight: 0.3, tentacles: 13, tentacleLen: 150, arm: '#d49aae', arms: 3, gonads: '#c9899e', canal: '#9c8cc0' });
      // Companions: barely present.
      o.sea.paintJelly(148, 438, 17, 275, { depth: 0.75, color: '#cfc6e0', alpha: 90, inner: '#e2dcee', ink: '#aaa0c0', contourWeight: 0.22, tentacle: '#b8bfcc', tentacleWeight: 0.2, tentacles: 7, tentacleLen: 50, arm: '#e0bcc8', arms: 1, canal: '#c8c0dc' });
      o.sea.paintJelly(528, 486, 10, 280, { depth: 0.75, color: '#d6cfe4', alpha: 75, inner: '#e6e1f0', ink: '#b8b0cc', contourWeight: 0.2, tentacle: '#c4c9d4', tentacleWeight: 0.18, tentacles: 5, tentacleLen: 30, arms: 0, canal: '#d0c8e0' });
    };
  },
};
