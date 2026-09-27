/** The film: the one file you edit to make a new video.
 *
 * Integer frame counts are the source of truth. Every shot is a hard cut to a finished painting
 * ("plate") painted once, then held; only `motion` shots move (seeded particles over the held
 * plate). `crop` makes an extreme close-up of an earlier plate (paint it at density 3), and
 * `repeatOf` returns to an earlier shot so the film loops.
 *
 * This demo is 228 frames / 9.5 s: a dense opener, a near-empty breath, a school, a long fish, two
 * particle passages, a monument hold, and the loop. A full film is typically 624 frames / 26 s,
 * about 21 shots (see references/composing.md). */
/** Painting style: 'watercolour' (glazes, graphite, ink on paper; the Beautiful Collisions look) or
 * 'pointillism' (the same drawing replayed as divided-colour dots). See styles/<name>/STYLE.md. */
export const STYLE = 'pointillism';
export const ID = 'pointillist-demo';
export const TITLE = 'Pointillist demo';

/** Translation mode only (references/translating.md): the source film this edition repaints.
 * Leave null for a new film. When set, the exporter proves the capture reproduces the source's
 * plates pixel-for-pixel, reuses the source soundtrack unchanged, and refuses to write into it.
 *   { root, manifest, mp4, wav }  — absolute paths to the source project and its exported files. */
export const REFERENCE = null;

export const FPS = 24;
export const SIZE = 600; // logical plate size: every scene draws in 0..600 coordinates
/** Random 20-char [a-z0-9] string drawn once per film; decides the score's scale, root and tempo.
 * `scripts/new-film.sh` sets a fresh one. */
export const AUDIO_SEED = 'demo0seed0pointillism';

/** Material per plate (references/material.md).
 *   profile   mark organisation: dense | fine | clustered | directional | airy
 *   refScale  how strongly dot colour follows the plate's own underpainting (new films ~0.45 for
 *             purer divided colour; translations 1, or > 1 where a hue must hold)
 *   washK / washGamma / fillK / fillGamma   coverage curves (raise on dark grounds)
 *   tune      overrides of the profile: { r: [min, max], hue, value, neighbour, complement, stretch, cluster }
 *   lineScale / chainGap / chainStep        dotted-line character (engraving: chainGap 0.15, chainStep 0.8) */
const M = (profile, extra = {}) => ({ profile, refScale: 0.45, ...extra });
export const PLATES = {
  'reef-ignition': { seed: 7101, density: 1, material: M('clustered', { washK: 2.0, fillK: 1.2 }) },
  'moon-jelly-silence': { seed: 7202, density: 1, material: M('airy') },
  'silver-current': { seed: 7303, density: 1, material: M('directional', { washK: 2.2 }) },
  'barracuda-diagonal': { seed: 7909, density: 1, material: M('directional', { washK: 2.4, fillK: 1.3 }) },
  'school-into-current': { seed: 8010, density: 1, material: M('fine') },
  'jelly-constellation': { seed: 8212, density: 1, material: M('airy') },
  'manta-monument': { seed: 8818, density: 1, material: M('directional', { washK: 2.4, fillK: 1.3, tune: { r: [0.8, 1.5] } }) },
};

/** [shot, start, end (exclusive), plate, title, sound, extras]. Cuts must tile [0, TOTAL_FRAMES). */
const rows = [
  ['01', 0, 30, 'reef-ignition', 'Reef ignition', 'exuberant'],
  ['02', 30, 54, 'moon-jelly-silence', 'Moon-jelly silence', 'specimen'],
  ['03', 54, 84, 'silver-current', 'Silver current', 'textile'],
  ['04', 84, 108, 'barracuda-diagonal', 'Barracuda diagonal', 'engraved'],
  ['05', 108, 132, 'school-into-current', 'School into current', 'dust', { motion: 'school' }],
  ['06', 132, 156, 'jelly-constellation', 'Jelly constellation', 'radial', { motion: 'jelly' }],
  ['07', 156, 204, 'manta-monument', 'Manta monument', 'monument'],
  ['08', 204, 228, 'reef-ignition', 'Return to reef ignition', 'exuberant', { repeatOf: '01' }],
  // Crop example: ['09', a, b, 'hero-plate', 'Inside the fin', 'inside', { crop: { x: 150, y: 250, w: 180, h: 180 } }],
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
