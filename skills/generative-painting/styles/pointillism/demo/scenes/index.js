/** Plate id -> scene module. Add one file per painting and register it here. Each scene exports
 * { id, sketch(p, brush, { density }) } and draws in 0..600 coordinates through the kit
 * (kit.js), sea.js and ocean.js; the capture/pointillism pipeline turns it into dots. */
import { reefIgnition } from './01-reef-ignition.js';
import { moonJellySilence } from './02-moon-jelly-silence.js';
import { silverCurrent } from './03-silver-current.js';
import { barracudaDiagonal } from './09-barracuda-diagonal.js';
import { schoolIntoCurrent } from './10-school-into-current.js';
import { jellyConstellation } from './12-jelly-constellation.js';
import { mantaMonument } from './18-manta-monument.js';

export const plates = {
  'reef-ignition': reefIgnition,
  'moon-jelly-silence': moonJellySilence,
  'silver-current': silverCurrent,
  'barracuda-diagonal': barracudaDiagonal,
  'school-into-current': schoolIntoCurrent,
  'jelly-constellation': jellyConstellation,
  'manta-monument': mantaMonument,
};
