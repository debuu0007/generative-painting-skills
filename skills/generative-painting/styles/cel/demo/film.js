/** The film: the one file you edit to make a new video.
 *
 * Integer frame counts are the source of truth. Every shot is a hard cut to a finished painting
 * ("plate") that is painted once, then held; only `motion` shots move (seeded particles over the
 * held plate). A plate may be reused: `crop` makes an extreme close-up of the same painting and
 * `repeatOf` returns to an earlier shot so the film loops.
 *
 * This demo is 192 frames / 8 s. The original film was 624 frames / 26 s with 21 shots. */
/** Painting style: watercolour | pointillism | charcoal | sketch | woodcut | cel (see styles/<name>/STYLE.md).
 * A plate can override it with PLATES[id].style. drawOn / boil: see references/motion-in-the-medium.md. */
export const STYLE = 'cel';
export const ID = 'cel-demo';
export const TITLE = 'Cel demo';
/** Translation mode only (pointillism): the source film this edition repaints. Null otherwise. */
export const REFERENCE = null;
export const FPS = 24;
export const SIZE = 600; // logical plate size: every scene draws in 0..600 coordinates
/** Random 20-char [a-z0-9] string drawn once per film (e.g. `head -c 200 /dev/urandom | LC_ALL=C tr -dc a-z0-9 | head -c 20`).
 * It decides the score's mode, root, tempo and timbres. Change it to re-roll the music. */
export const AUDIO_SEED = 'c3l2d4nim8demo0seedz';

/** plate id -> { seed, density }. density 3 only for a plate that a later shot crops into. */
export const PLATES = {
  'cobalt-exuberance': { seed: 1101, density: 1, boil: 3 },
  'almost-nothing': { seed: 2515, density: 1 },
  'black-yellow': { seed: 2818, density: 1 },
  'specimen-plate': { seed: 1909, density: 1 },
  'dust-flower': { seed: 2010, density: 1 },
  'radial-bloom': { seed: 2212, density: 1, boil: 3 },
};

/** [shot, start, end (exclusive), plate, title, sound, extras]. Cuts must tile [0, TOTAL_FRAMES). */
const rows = [
  ['01', 0, 30, 'cobalt-exuberance', 'Dense saturated opener', 'exuberant', { boil: true }],
  ['02', 30, 48, 'almost-nothing', 'Almost nothing', 'nothing'],
  ['03', 48, 96, 'black-yellow', 'Monument hold', 'monument'],
  ['04', 96, 120, 'specimen-plate', 'Sparse specimen sheet', 'specimen'],
  ['05', 120, 144, 'dust-flower', 'Becoming dust', 'dust', { motion: 'dust' }],
  ['06', 144, 168, 'radial-bloom', 'Radial bloom', 'radial', { motion: 'radial', boil: true }],
  ['07', 168, 192, 'cobalt-exuberance', 'Return to the opener', 'exuberant', { repeatOf: '01', boil: true }],
  // Crop example: ['08', a, b, 'hero-plate', 'Inside the petal', 'inside', { crop: { x: 112, y: 88, w: 200, h: 200 } }],
];
export const TOTAL_FRAMES = rows[rows.length - 1][2];

export const SHOTS = rows.map(([shot, start, end, plate, title, sound, extra = {}]) => ({
  shot, start, end, frames: end - start, plate, title, sound, seed: PLATES[plate]?.seed,
  motion: null, crop: null, repeatOf: null, ...extra,
}));

export function validateFilm() {
  let cursor = 0;
  for (const s of SHOTS) {
    if (s.start !== cursor || s.end <= s.start) throw new Error(`Shot ${s.shot} does not start where the previous shot ends (${cursor})`);
    if (!PLATES[s.plate]) throw new Error(`Shot ${s.shot} uses unknown plate ${s.plate}`);
    if (s.crop && PLATES[s.plate].density < 2) throw new Error(`Shot ${s.shot} crops ${s.plate}: paint that plate at density 3`);
    cursor = s.end;
  }
  return true;
}
validateFilm();

/** Exact frame -> shot. Frames outside the film clamp (export never renders past the end). */
export function frameToShot(frame) {
  const f = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(frame)));
  for (let i = 0; i < SHOTS.length; i++) {
    const s = SHOTS[i];
    if (f >= s.start && f < s.end) return { frame: f, index: i, shot: s, local: f - s.start, u: s.frames > 1 ? (f - s.start) / (s.frames - 1) : 0 };
  }
  throw new Error(`No shot for frame ${f}`);
}

/** Seconds -> frame. The epsilon guards float drift (i/24 must map back to i). */
export function timeToFrame(t) {
  return Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(t * FPS + 1e-6)));
}
