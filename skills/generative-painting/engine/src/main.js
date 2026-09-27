/** Preview + automation API.
 *   /                 play the film (click for sound; space pauses; ←/→ step a frame; R restarts)
 *   /?plate=<id>      paint and show one plate only (fast iteration on a single painting)
 *   /?export=1&only=a,b  paint only these plates (used by `npm run plates -- --only a,b`)
 *   /?export=1        prepare and wait; the exporter drives window.__frames */
import { FPS, SHOTS, TOTAL_FRAMES, ID, AUDIO_SEED } from './film.js';
import { createRenderer } from './renderer.js';
import { renderSoftScore } from './score-soft.js'; // default. Lively alternative: renderBotanicalScore from './score.js'

const q = new URLSearchParams(window.location.search);
const canvas = document.getElementById('c');
const hud = document.getElementById('hud');
const onlyPlate = q.get('plate');
const onlyList = q.get('only') ? q.get('only').split(',') : null;
const renderer = createRenderer(canvas, {
  only: onlyPlate ? [onlyPlate] : onlyList || undefined,
  onProgress: ({ index, total, plate, phase }) => {
    hud.textContent = phase === 'ready' ? `${ID} · ${total} plates ready` : `${ID} · painting ${index + 1}/${total} · ${plate}`;
  },
});

const api = { canvas, readyState: 'preparing', frames: TOTAL_FRAMES, fps: FPS, shots: SHOTS };
window.__frames = api;
api.seekFrame = (f) => renderer.renderFrame(f);
api.seek = (t) => renderer.render(t);
api.showPlate = (id) => renderer.renderPlate(id);
api.showOriginal = (id) => renderer.renderOriginal(id);
api.hasOriginal = (id) => renderer.hasOriginal(id);
api.renderScore = () => renderSoftScore({ shots: SHOTS, fps: FPS, frames: TOTAL_FRAMES, sampleRate: 48000, seedString: AUDIO_SEED });
api.ready = renderer.ready.then((info) => { api.readyState = 'ready'; api.prepared = info; return info; }, (error) => {
  api.readyState = 'failed';
  api.error = error.message;
  hud.style.color = '#ff8a7a';
  hud.textContent = `preparation failed: ${error.message}`;
  throw error;
});
api.ready.catch(() => {});

api.ready.then(() => {
  if (onlyPlate) { renderer.renderPlate(onlyPlate); hud.textContent = `plate ${onlyPlate}`; return; }
  if (q.has('export')) { if (!onlyList) renderer.renderFrame(0); return; }
  play();
}, () => {});

function play() {
  let frame = 0; let paused = false; let last = performance.now(); let acc = 0;
  let audioCtx = null; let source = null; let buffer = null;
  const startAudio = (at) => {
    if (!audioCtx || !buffer) return;
    source?.stop();
    source = audioCtx.createBufferSource();
    source.buffer = buffer; source.loop = true; source.connect(audioCtx.destination);
    source.start(0, at / FPS);
  };
  window.addEventListener('pointerdown', async () => {
    if (audioCtx) return;
    audioCtx = new AudioContext({ sampleRate: 48000 });
    const s = api.renderScore();
    buffer = audioCtx.createBuffer(2, s.L.length, s.sampleRate);
    buffer.copyToChannel(s.L, 0); buffer.copyToChannel(s.R, 1);
    frame = 0; startAudio(0);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') { paused = !paused; if (paused) source?.stop(); else startAudio(frame); }
    if (e.key === 'ArrowRight') { paused = true; source?.stop(); frame = (frame + 1) % TOTAL_FRAMES; }
    if (e.key === 'ArrowLeft') { paused = true; source?.stop(); frame = (frame - 1 + TOTAL_FRAMES) % TOTAL_FRAMES; }
    if (e.key === 'r') { frame = 0; if (!paused) startAudio(0); }
  });
  const tick = (now) => {
    if (!paused) {
      acc += (now - last) / 1000;
      while (acc >= 1 / FPS) { acc -= 1 / FPS; frame = (frame + 1) % TOTAL_FRAMES; }
    }
    last = now;
    const { shot } = renderer.renderFrame(frame);
    hud.textContent = `${String(frame).padStart(4, '0')}/${TOTAL_FRAMES} · ${shot.shot} ${shot.title}${paused ? ' · paused' : ''}${audioCtx ? '' : ' · click for sound'}`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
