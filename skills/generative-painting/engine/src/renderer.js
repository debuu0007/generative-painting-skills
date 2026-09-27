/** Full-colour plate compositor.
 *
 * Readiness contract: `ready` resolves only after every plate has been painted in its own isolated
 * p5 + p5.brush WEBGL document (plate.html), that page has signalled the first draw() was flushed
 * and copied, and the result is copied into a stable 2D canvas and hashed. Any page error, blank
 * plate or timeout rejects `ready`; there is no blank fallback. Until then renderFrame() throws.
 *
 * After preparation seeking is synchronous and deterministic: a frame is drawImage of a cached
 * plate (optionally cropped) plus, for motion shots, particles evaluated analytically from the
 * shot-local progress. Nothing is re-randomised per frame. */
import { FPS, SIZE, TOTAL_FRAMES, PLATES, SHOTS, frameToShot, timeToFrame } from './film.js';
import { buildParticles, drawParticles } from './particles.js';

async function sha256(canvas) {
  const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function paintPlate(id, spec, { host, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;left:-20000px;top:0;width:640px;height:640px;border:0;visibility:hidden;pointer-events:none';
    const started = performance.now();
    let done = false;
    const finish = (fn, value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      clearInterval(poll);
      frame.remove();
      fn(value);
    };
    const timer = setTimeout(() => finish(reject, new Error(`Plate ${id} timed out after ${timeoutMs} ms`)), timeoutMs);
    const poll = setInterval(() => {
      const win = frame.contentWindow;
      if (!win || !win.__plate || win.__plateWatched) return;
      win.__plateWatched = true;
      win.__plate.ready.then((result) => {
        const copy = document.createElement('canvas');
        copy.width = result.width;
        copy.height = result.height;
        copy.getContext('2d').drawImage(result.canvas, 0, 0);
        let original = null;
        if (result.original) {
          original = document.createElement('canvas');
          original.width = result.original.width;
          original.height = result.original.height;
          original.getContext('2d').drawImage(result.original, 0, 0);
        }
        finish(resolve, { canvas: copy, original, meta: { plate: id, seed: spec.seed, density: result.density, width: result.width, height: result.height, material: result.material || null, ms: Math.round(performance.now() - started) } });
      }, (error) => finish(reject, new Error(`Plate ${id} failed: ${error.message}`)));
    }, 15);
    frame.src = `/plate.html?scene=${encodeURIComponent(id)}&seed=${spec.seed}&density=${spec.density}`;
    host.appendChild(frame);
  });
}

export function createRenderer(canvas, { host = document.body, timeoutMs = 180000, onProgress, only } = {}) {
  const ctx = canvas.getContext('2d');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const full = new Map();
  const fitted = new Map();
  const particles = new Map();
  const originals = new Map();
  const meta = [];
  let prepared = false;

  const ready = (async () => {
    const ids = only ? only : [...new Set(SHOTS.map((s) => s.plate))];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      onProgress?.({ index: i, total: ids.length, plate: id, phase: 'painting' });
      const { canvas: plate, original, meta: m } = await paintPlate(id, PLATES[id], { host, timeoutMs });
      if (original) { originals.set(id, original); m.originalHash = await sha256(original); }
      if (m.width !== SIZE * PLATES[id].density) throw new Error(`Plate ${id} is ${m.width}px, expected ${SIZE * PLATES[id].density}px`);
      full.set(id, plate);
      let fit = plate;
      if (plate.width !== SIZE) {
        fit = document.createElement('canvas');
        fit.width = SIZE;
        fit.height = SIZE;
        const f = fit.getContext('2d');
        f.imageSmoothingEnabled = true;
        f.imageSmoothingQuality = 'high';
        f.drawImage(plate, 0, 0, SIZE, SIZE);
      }
      fitted.set(id, fit);
      meta.push({ ...m, hash: await sha256(plate) });
    }
    for (const s of SHOTS) {
      if (s.motion && !particles.has(s.shot)) particles.set(s.shot, buildParticles(s.motion, s.seed));
    }
    prepared = true;
    onProgress?.({ index: ids.length, total: ids.length, phase: 'ready' });
    return { plates: meta, particles: [...particles].map(([shot, list]) => ({ shot, count: list.length })), frames: TOTAL_FRAMES, fps: FPS };
  })();
  ready.catch(() => {});

  function renderFrame(frame) {
    if (!prepared) throw new Error('Renderer is not ready: await window.__frames.ready before seeking');
    const { frame: f, shot, local, u, index } = frameToShot(frame);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'copy';
    if (shot.crop) {
      const src = full.get(shot.plate);
      const k = src.width / SIZE;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(src, shot.crop.x * k, shot.crop.y * k, shot.crop.w * k, shot.crop.h * k, 0, 0, SIZE, SIZE);
    } else {
      ctx.drawImage(fitted.get(shot.plate), 0, 0);
    }
    ctx.globalCompositeOperation = 'source-over';
    if (shot.motion) drawParticles(ctx, shot.motion, particles.get(shot.shot), u, PLATES[shot.plate]?.style);
    return { frame: f, t: f / FPS, u, index, local, shot };
  }

  /** Draw one prepared plate full-frame (plate review, without the edit). */
  function renderPlate(id) {
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(fitted.get(id), 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }

  /** Draw the untouched watercolour original of a plate (fidelity comparison). */
  function renderOriginal(id) {
    const src = originals.get(id);
    ctx.globalCompositeOperation = 'copy';
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, 0, 0, SIZE, SIZE);
    ctx.globalCompositeOperation = 'source-over';
  }

  return { ready, isReady: () => prepared, renderFrame, renderPlate, renderOriginal, hasOriginal: (id) => originals.has(id), render: (time) => renderFrame(timeToFrame(time)), plateMeta: () => meta.slice() };
}
