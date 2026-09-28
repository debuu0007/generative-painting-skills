/** Runs inside plate.html: one isolated document per plate, so p5.brush's module-level state
 * (scaleBrushes, fields, fill/hatch state) never leaks between paintings.
 *
 * The painting material is PLATES[id].style if the plate sets one, else the film's STYLE (film.js),
 * so one film can mix materials plate by plate. Replay materials (pointillism, charcoal, sketch,
 * woodcut, cel) all repaint the same recorded drawing:
 *   watercolour  the scene paints directly with p5.brush (glazes, washes, graphite, ink) and that
 *                painting is the plate.
 *   pointillism  the scene paints through a recording proxy (capture.js) that forwards every call
 *                unchanged; after the first draw the recorded geometry is replayed as divided-colour
 *                dots (pointillism.js). The untouched watercolour is kept as `original`.
 * A new style plugs in here: register a material in MATERIALS below (see
 * references/adding-a-style.md). */
import { plates } from './scenes/index.js';
import { PLATES, STYLE } from './film.js';
import { createRecorder } from './capture.js';
import { paintPointillist } from './pointillism.js';
import { paintCharcoal } from './materials/charcoal.js';
import { paintSketch } from './materials/sketch.js';
import { paintWoodcut } from './materials/woodcut.js';
import { paintCel } from './materials/cel.js';
import { runPainter } from './materials/common.js';

const q = new URLSearchParams(window.location.search);
const id = q.get('scene');
const scene = plates[id];
if (!scene) throw new Error(`Unknown plate ${id}: register it in src/scenes/index.js`);
const density = Number(q.get('density') || 1);
const spec = PLATES[id] || {};
const brush = window.brush;

/** Colour sampler over a painted canvas, in logical coordinates (3×3 average). */
function sampler(canvas) {
  const W = canvas.width;
  const px = canvas.getContext('2d').getImageData(0, 0, W, canvas.height).data;
  return (x, y) => {
    const out = [0, 0, 0];
    for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) {
      const X = Math.min(W - 1, Math.max(0, Math.round((x + dx * 0.8) * density)));
      const Y = Math.min(canvas.height - 1, Math.max(0, Math.round((y + dy * 0.8) * density)));
      const i = (Y * W + X) * 4; out[0] += px[i]; out[1] += px[i + 1]; out[2] += px[i + 2];
    }
    return out.map((v) => v / 9);
  };
}

/** Materials: how a scene's drawing becomes the plate. `record` wraps the brush before the scene
 * runs; `transform` receives the painted result and returns the plate (or the result unchanged). */
const MATERIALS = {
  watercolour: { record: false, transform: null },
  pointillism: {
    record: true,
    transform: (result, log) => {
      const t0 = performance.now();
      const canvas = document.createElement('canvas');
      const ref = spec.material?.reference === false ? null : sampler(result.canvas);
      const stats = paintPointillist(canvas, log, { density, W: result.logicalWidth, H: result.logicalHeight, seed: (spec.seed || 1) * 7919 + 17, ref, ...(spec.material || {}) });
      return { ...result, canvas, width: canvas.width, height: canvas.height, original: result.canvas, material: { ...stats, ops: log.ops.length, brushCalls: log.calls, ms: Math.round(performance.now() - t0), profile: spec.material?.profile || 'dense' } };
    },
  },
  charcoal: { record: true, transform: (r, log) => replay(paintCharcoal, r, log) },
  sketch: { record: true, transform: (r, log) => replay(paintSketch, r, log) },
  woodcut: { record: true, transform: (r, log) => replay(paintWoodcut, r, log) },
  cel: { record: true, transform: (r, log) => replay(paintCel, r, log) },
};

/** Replay materials (charcoal, sketch, woodcut, cel): paint the recorded ops with the material's own
 * marks. PLATES[id].drawOn = K adds K cumulative snapshots (the drawing appearing stroke by stroke;
 * drawOnTail = [nOps, k] gives the last ops their own k snapshots); PLATES[id].boil = V adds V
 * jittered variants (2D line boil). Both are returned as `frames` next to the finished plate. */
function replay(paintX, result, log) {
  const t0 = performance.now();
  const { make } = paintX(log, { W: result.logicalWidth, H: result.logicalHeight, density, seed: (spec.seed || 1) * 7919 + 31, material: spec.material || {} });
  const out = runPainter(make, log.ops, { drawOn: spec.drawOn || 0, boil: spec.boil || 0, drawOnTail: spec.drawOnTail || null });
  return { ...result, canvas: out.canvas, frames: out.frames || null, width: out.canvas.width, height: out.canvas.height, original: result.canvas, material: { ...(out.stats || {}), ops: log.ops.length, style: spec.style || STYLE, ms: Math.round(performance.now() - t0) } };
}
const style = spec.style || STYLE;
const material = MATERIALS[style];
if (!material) throw new Error(`Unknown style '${style}' for plate ${id} (PLATES[id].style or STYLE in film.js): expected one of ${Object.keys(MATERIALS).join(', ')}`);

let log = null;
if (material.transform) window.__plateTransform = (result) => material.transform(result, log);

new window.p5((p) => {
  brush.instance(p);
  if (!material.record) { scene.sketch(p, brush, { density }); return; }
  const rec = createRecorder(p, brush);
  log = rec.log;
  scene.sketch(p, rec.proxy, { density });
  const draw = p.draw;
  p.draw = (...a) => { rec.log.resetFrame(); return draw(...a); };
});
