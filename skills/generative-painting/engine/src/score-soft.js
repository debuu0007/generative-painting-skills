/** Soft score (the default): quiet, low, soothing and exploratory.
 *
 * Built around a grain cloud: thousands of tiny windowed sine grains. Every shot declares a `sound`
 * character (film.js) that picks a shade of that cloud — denser, sparser, higher, lower, widening,
 * drifting — over a low drone bed, with one slow melodic line that wanders through the whole film
 * across the cuts. No thumps, noise bursts or bright pads; a slow leveller caps any passage that
 * would rise above the rest, landing around -22 LUFS. Seeded by AUDIO_SEED (film.js), deterministic,
 * and circular so the file loops seamlessly. The livelier alternative is score.js. */
import { hashString, mulberry32 } from './rng.js';

const TAU = Math.PI * 2;
/** Soft, consonant scales only (no tritones or semitone clashes). */
const MODES = { pentatonic: [0, 2, 4, 7, 9], minorPentatonic: [0, 3, 5, 7, 10], dorianSoft: [0, 2, 3, 7, 9], suspended: [0, 2, 5, 7, 10] };

export function softDesign(seedString) {
  const r = mulberry32(hashString(`soft:${seedString}`));
  const pick = (a) => a[Math.floor(r() * a.length)];
  const modeName = pick(Object.keys(MODES));
  return {
    seedString, seed: hashString(`soft:${seedString}`), modeName, mode: MODES[modeName],
    rootMidi: 40 + Math.floor(r() * 6), // E2..A2: keep it low
    bpm: 58 + Math.floor(r() * 14), // slow walking pace for the exploring line
    reverbSize: 0.8 + r() * 0.08,
  };
}

/** How each painting type colours the grain cloud. density = grains/s, lo/hi = scale degrees above
 * the root (+ octave offsets), widen = how far the cloud drifts upward/outward over the shot,
 * pad = soft chord level, bell = number of soft low bells. All levels are deliberately small. */
const SHADES = {
  exuberant: { density: 55, lo: 10, hi: 22, widen: 0.4, gain: 0.022, pad: 0.05, bell: 2 },
  textile: { density: 26, lo: 12, hi: 18, widen: 0.1, gain: 0.02, pad: 0.035, bell: 0, pulse: 2 },
  engraved: { density: 30, lo: 16, hi: 24, widen: 0.1, gain: 0.014, pad: 0.02, bell: 1 },
  night: { density: 10, lo: 14, hi: 22, widen: 0.2, gain: 0.02, pad: 0.05, bell: 2, dark: true },
  wreath: { density: 24, lo: 10, hi: 18, widen: 0.3, gain: 0.02, pad: 0.04, bell: 0, circle: true },
  canopy: { density: 22, lo: 6, hi: 14, widen: 0.2, gain: 0.022, pad: 0.055, bell: 1, dark: true },
  corners: { density: 16, lo: 12, hi: 20, widen: 0.1, gain: 0.018, pad: 0.035, bell: 2, corners: true },
  ornament: { density: 18, lo: 12, hi: 18, widen: 0, gain: 0.018, pad: 0.03, bell: 0, pulse: 3 },
  specimen: { density: 8, lo: 12, hi: 20, widen: 0.1, gain: 0.018, pad: 0.03, bell: 3 },
  dust: { density: 90, lo: 14, hi: 22, widen: 0.5, gain: 0.026, pad: 0.035, bell: 0, spread: true }, // the liked one
  engineering: { density: 40, lo: 16, hi: 22, widen: 0, gain: 0.014, pad: 0.03, bell: 0, pulse: 4 },
  radial: { density: 75, lo: 12, hi: 24, widen: 0.6, gain: 0.022, pad: 0.04, bell: 1, bloom: true },
  wildflower: { density: 34, lo: 10, hi: 20, widen: 0.3, gain: 0.02, pad: 0.04, bell: 0 },
  measured: { density: 20, lo: 14, hi: 20, widen: 0, gain: 0.016, pad: 0.035, bell: 0, pulse: 2 },
  nothing: { density: 4, lo: 18, hi: 22, widen: 0, gain: 0.014, pad: 0.015, bell: 0 },
  single: { density: 28, lo: 10, hi: 18, widen: 0.2, gain: 0.02, pad: 0.05, bell: 1 },
  inside: { density: 36, lo: 5, hi: 12, widen: 0.1, gain: 0.02, pad: 0.06, bell: 0, dark: true },
  monument: { density: 45, lo: 7, hi: 21, widen: 0.8, gain: 0.02, pad: 0.06, bell: 3, swell: true },
  landscape: { density: 22, lo: 8, hi: 18, widen: 0.3, gain: 0.02, pad: 0.05, bell: 1 },
  journal: { density: 14, lo: 14, hi: 20, widen: 0, gain: 0.014, pad: 0.025, bell: 1 },
};

export function renderSoftScore({ shots, fps, frames, sampleRate = 48000, seedString }) {
  const D = softDesign(seedString);
  const sr = sampleRate;
  const duration = frames / fps;
  const N = Math.round(duration * sr);
  const L = new Float32Array(N); const R = new Float32Array(N);
  const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const note = (degree, octave = 0) => {
    const m = D.mode; const o = Math.floor(degree / m.length); const d = ((degree % m.length) + m.length) % m.length;
    return midiHz(D.rootMidi + 12 * (octave + o) + m[d]);
  };
  const pans = (p) => { const q = Math.max(-1, Math.min(1, p)); return [Math.cos((q + 1) * Math.PI / 4), Math.sin((q + 1) * Math.PI / 4)]; };
  const put = (i, s, gl, gr) => { const k = ((i % N) + N) % N; L[k] += s * gl; R[k] += s * gr; };

  // ---- voices (all soft attacks) ----
  /** The liked voice: a tiny windowed sine grain. */
  function grain(t, f, gain, pan, dur) {
    const [gl, gr] = pans(pan); const s0 = Math.round(t * sr); const n = Math.max(16, Math.round(dur * sr));
    for (let i = 0; i < n; i++) { const w = Math.sin(Math.PI * i / n); put(s0 + i, Math.sin(TAU * f * i / sr) * w * w * gain, gl, gr); }
  }
  /** A longer glassy tone for the exploring line: slow attack, long gentle tail, faint octave shimmer. */
  function glass(t, f, gain, pan, dur) {
    const [gl, gr] = pans(pan); const s0 = Math.round(t * sr); const n = Math.round(dur * sr);
    for (let i = 0; i < n; i++) {
      const tm = i / sr; const env = Math.min(1, tm / 0.12) * Math.exp(-tm * 2.2 / dur);
      put(s0 + i, (Math.sin(TAU * f * tm) + 0.18 * Math.sin(TAU * 2 * f * tm + 0.7)) * env * gain, gl, gr);
    }
  }
  /** A dark, soft FM bell: low modulation index, slow decay. */
  function bell(t, f, gain, pan) {
    const [gl, gr] = pans(pan); const s0 = Math.round(t * sr); const n = Math.round(3.2 * sr);
    for (let i = 0; i < n; i++) {
      const tm = i / sr; const env = Math.min(1, tm / 0.02) * Math.exp(-tm * 1.4);
      const mod = Math.sin(TAU * f * 2 * tm) * 0.6 * Math.exp(-tm * 2);
      put(s0 + i, Math.sin(TAU * f * tm + mod) * env * gain, gl, gr);
    }
  }
  /** Soft chord bed: detuned sines only, gentle fades so the cut is felt, not heard as a click. */
  function pad(t, dur, freqs, gain, rnd, { fadeIn = 0.15, fadeOut = 0.5 } = {}) {
    const s0 = Math.round(t * sr); const n = Math.round((dur + fadeOut) * sr);
    const voices = freqs.flatMap((f) => [[f * 0.998, -0.5], [f * 1.002, 0.5]]);
    const ph = voices.map(() => rnd() * TAU);
    for (let i = 0; i < n; i++) {
      const tm = i / sr; const env = Math.min(1, tm / fadeIn) * (tm > dur ? Math.max(0, 1 - (tm - dur) / fadeOut) : 1);
      voices.forEach(([f, p], v) => { const [gl, gr] = pans(p); put(s0 + i, Math.sin(TAU * f * tm + ph[v]) * env * gain / voices.length, gl, gr); });
    }
  }

  // ---- low drone bed: root + fifth an octave down, whole cycles per loop ----
  const loopHz = (f) => Math.max(1, Math.round(f * duration)) / duration;
  const drone = [note(0, -1), note(3, -1), note(0, 0)].map(loopHz);
  const lfo = 2 / duration;
  for (let i = 0; i < N; i++) {
    const tm = i / sr; const w = 0.5 + 0.5 * Math.sin(TAU * lfo * tm);
    const s = Math.sin(TAU * drone[0] * tm) * 0.55 + Math.sin(TAU * drone[1] * tm + 1) * 0.3 + Math.sin(TAU * drone[2] * tm + 2) * 0.15 * w;
    L[i] += s * 0.03; R[i] += s * 0.03 * (0.92 + 0.08 * w);
  }

  // ---- per shot: a shade of the grain cloud, a soft pad, a few low bells ----
  for (const s of shots) {
    const key = s.repeatOf || s.shot;
    const rnd = mulberry32((D.seed ^ hashString(`shot-${key}`)) >>> 0);
    const t0 = s.start / fps; const len = s.frames / fps;
    const sh = SHADES[s.sound] || SHADES.wildflower;
    const deg = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
    const chord = [0, 2, 4].map((x) => note(x + Math.floor(rnd() * 3), sh.dark ? -1 : 0));
    pad(t0, len, chord, sh.pad, rnd, sh.swell ? { fadeIn: len * 0.6, fadeOut: 0.8 } : {});
    const count = Math.round(sh.density * len);
    for (let i = 0; i < count; i++) {
      let u = rnd();
      if (sh.spread) u = Math.pow(u, 0.8); // the dust cloud: denser early, widening later
      if (sh.bloom) u = Math.pow(u, 1.6) * 0.8; // burst then settle
      if (sh.pulse) u = (Math.floor(u * len * sh.pulse) + 0.02 * rnd()) / (len * sh.pulse); // gentle quantised ticks
      const f = note(deg(sh.lo, sh.hi)) * (1 + u * sh.widen * 0.5);
      const pan = sh.corners ? [-0.8, 0.8][i % 2] : sh.circle ? Math.sin(u * TAU) * 0.8 : (rnd() * 2 - 1) * (sh.spread ? u : 0.7);
      grain(t0 + u * len, f, sh.gain * (sh.spread ? 1 - u * 0.4 : 1) * (0.6 + 0.4 * rnd()), pan, 0.012 + rnd() * 0.03);
    }
    for (let b = 0; b < sh.bell; b++) bell(t0 + (b + 0.15) * len / Math.max(1, sh.bell), note(deg(5, 12), sh.dark ? -1 : 0), 0.035, rnd() * 1.2 - 0.6);
  }

  // ---- the exploring line: one slow melodic walk through the whole film ----
  const walk = mulberry32((D.seed ^ hashString('explore')) >>> 0);
  const beat = 60 / D.bpm;
  let degree = 5; let t = 0.4;
  while (t < duration - 0.2) {
    const step = walk() < 0.15 ? (walk() < 0.5 ? -3 : 3) : Math.floor(walk() * 3) - 1; // mostly stepwise, occasional leap
    degree = Math.max(2, Math.min(11, degree + step));
    const dur = beat * (walk() < 0.3 ? 3 : 2);
    if (walk() > 0.18) glass(t, note(degree, 1), 0.045, Math.sin(t * 0.37) * 0.6, dur * 1.8); // leave rests
    t += dur;
  }

  // ---- circular reverb (tails wrap into the loop start) ----
  const combs = [1557, 1617, 1491, 1422, 1277].map((d) => Math.round(d * sr / 44100));
  const wetL = new Float32Array(N); const wetR = new Float32Array(N);
  for (const d of combs) {
    const bL = new Float32Array(d); const bR = new Float32Array(d + 23); let iL = 0; let iR = 0; let lpL = 0; let lpR = 0;
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < N; i++) {
      const yl = bL[iL]; lpL += (yl - lpL) * 0.35; bL[iL] = L[i] + lpL * D.reverbSize; iL = (iL + 1) % d;
      const yr = bR[iR]; lpR += (yr - lpR) * 0.35; bR[iR] = R[i] + lpR * D.reverbSize; iR = (iR + 1) % (d + 23);
      if (pass === 1) { wetL[i] += yl / combs.length; wetR[i] += yr / combs.length; }
    }
  }
  for (let i = 0; i < N; i++) { L[i] += wetL[i] * 0.5; R[i] += wetR[i] * 0.5; }

  // ---- slow leveller: no passage may rise more than ~2 dB above the typical level ----
  const block = Math.round(0.05 * sr); const nb = Math.ceil(N / block);
  const rms = new Float32Array(nb);
  for (let b = 0; b < nb; b++) {
    let acc = 0; let c = 0;
    for (let i = b * block; i < Math.min(N, (b + 1) * block); i++) { acc += L[i] * L[i] + R[i] * R[i]; c += 2; }
    rms[b] = Math.sqrt(acc / Math.max(1, c));
  }
  // 400 ms window (momentary-loudness scale), circular so the loop join is levelled too.
  const win = 8; const mom = new Float32Array(nb);
  for (let b = 0; b < nb; b++) { let a = 0; for (let j = -win / 2; j < win / 2; j++) { const v = rms[(b + j + nb) % nb]; a += v * v; } mom[b] = Math.sqrt(a / win); }
  const sorted = Array.from(mom).sort((a, b) => a - b);
  const ceiling = sorted[Math.floor(nb * 0.5)] * Math.pow(10, 2 / 20);
  const gains = Array.from(mom, (m) => Math.min(1, ceiling / Math.max(1e-9, m)));
  // Smooth the gain (attack/release ~0.5 s) so levelling is never audible as pumping.
  const smooth = new Float32Array(nb); let g = gains[0];
  for (let pass = 0; pass < 2; pass++) for (let b = 0; b < nb; b++) { g += (gains[b] - g) * (gains[b] < g ? 0.35 : 0.1); if (pass) smooth[b] = g; }
  for (let i = 0; i < N; i++) {
    const x = i / block - 0.5; const b0 = Math.floor(x); const fr = x - b0;
    const gi = smooth[(b0 + nb) % nb] * (1 - fr) + smooth[(b0 + 1) % nb] * fr;
    L[i] *= gi; R[i] *= gi;
  }
  // Final level: quiet. Normalise the typical (median) momentary level, then a soft ceiling.
  let acc = 0; for (let i = 0; i < N; i++) acc += L[i] * L[i] + R[i] * R[i];
  const overall = Math.sqrt(acc / (2 * N));
  const pre = 0.07 / Math.max(1e-9, overall); // ~ -21 LUFS for this material
  let peak = 0;
  for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * pre * 1.2) / 1.2; R[i] = Math.tanh(R[i] * pre * 1.2) / 1.2; peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
  if (peak > 0.5) { const k = 0.5 / peak; for (let i = 0; i < N; i++) { L[i] *= k; R[i] *= k; } }
  return { L, R, sampleRate: sr, design: D, duration };
}
