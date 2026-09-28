/** Plate id -> scene module. Add one file per new painting and register it here.
 * Each scene exports { id, sketch(p, brush, { density }) } and draws in 0..600 coordinates. */
import { cobaltExuberance } from './01-cobalt-exuberance.js';
import { specimenPlate } from './09-specimen-plate.js';
import { dustFlower } from './10-dust-flower.js';
import { radialBloom } from './12-radial-bloom.js';
import { almostNothing } from './15-almost-nothing.js';
import { blackYellow } from './18-black-yellow.js';

export const plates = {
  'cobalt-exuberance': cobaltExuberance,
  'almost-nothing': almostNothing,
  'black-yellow': blackYellow,
  'specimen-plate': specimenPlate,
  'dust-flower': dustFlower,
  'radial-bloom': radialBloom,
};
