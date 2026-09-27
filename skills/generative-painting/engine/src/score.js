/** Code-generated soundtrack for a collision film (from Beautiful Collisions).
 *
 * Everything is derived from one random string (AUDIO_SEED_STRING, generated once with
 * /dev/urandom): the root, mode, tempo, FM-bell ratio, pluck brightness, reverb size and every note.
 * The *structure* follows the edit: each shot declares a `sound` character matching its painting,
 * changes land exactly on frame boundaries, and a `repeatOf` shot reuses its source shot's
 * generator so the loop sounds like the start again. The buffer is circular: tails past the end
 * wrap to 0 and drones complete whole cycles over the film, so the file loops without a click.
 * Pure JS (no Web Audio), so Node export and browser preview render identical samples. */
import { hashString, mulberry32 } from './rng.js';

/** Default only; every film sets its own random `audioSeed` in film.js. */
export const AUDIO_SEED_STRING = '3l5ngyddysc7gxx58uy6';
const TAU = Math.PI * 2;

/** Sound characters a shot can declare (`sound` in film.js). Each maps a painting type to a voice
 * recipe; the seed string decides notes and timbres. Pick by what the painting *is*, not its subject:
 *   exuberant (dense saturated opener)  textile (repeat pattern)    engraved (fine linework)
 *   night (dark ground, sparse)         wreath (ring / perimeter)   canopy (dark lush glazes)
 *   corners (four-corner poster)        ornament (grid sheet)       specimen (few isolated objects)
 *   dust (particles loosening)          engineering (technical/punk) radial (particle bloom)
 *   wildflower (field / crowd)          measured (diagram + paint)  nothing (near-empty)
 *   single (one hero object)            inside (extreme crop of the hero) monument (long huge hold)
 *   landscape (depth, horizon)          journal (notebook page) */
export const SOUNDS = ['exuberant', 'textile', 'engraved', 'night', 'wreath', 'canopy', 'corners', 'ornament', 'specimen', 'dust',
  'engineering', 'radial', 'wildflower', 'measured', 'nothing', 'single', 'inside', 'monument', 'landscape', 'journal'];

const MODES = {
  lydian: [0, 2, 4, 6, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10],
  pentatonic: [0, 2, 4, 7, 9], hirajoshi: [0, 2, 3, 7, 8], wholeTone: [0, 2, 4, 6, 8, 10],
};

/** All choices the string makes, exposed for the manifest. */
export function audioDesign(seedString = AUDIO_SEED_STRING) {
  const r = mulberry32(hashString(seedString));
  const pick = (a) => a[Math.floor(r() * a.length)];
  const modeName = pick(Object.keys(MODES));
  return {
    seedString,
    seed: hashString(seedString),
    modeName,
    mode: MODES[modeName],
    rootMidi: 45 + Math.floor(r() * 10),
    bpm: 84 + Math.floor(r() * 48),
    bellRatio: pick([1.4, 2.0, 2.76, 3.5, 4.2]),
    bellIndex: 1.2 + r() * 2.4,
    pluckBright: 0.35 + r() * 0.5,
    reverbSize: 0.72 + r() * 0.2,
    swing: r() * 0.18,
  };
}

const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

export function renderBotanicalScore({ shots, fps, frames, sampleRate = 48000, seedString = AUDIO_SEED_STRING }) {
  const D = audioDesign(seedString);
  const duration = frames / fps;
  const N = Math.round(duration * sampleRate);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  const sr = sampleRate;
  const note = (degree, octave = 0) => {
    const m = D.mode;
    const o = Math.floor(degree / m.length);
    const d = ((degree % m.length) + m.length) % m.length;
    return midiHz(D.rootMidi + 12 * (octave + o) + m[d]);
  };
  const pans = (p) => [Math.cos((Math.max(-1, Math.min(1, p)) + 1) * Math.PI / 4), Math.sin((Math.max(-1, Math.min(1, p)) + 1) * Math.PI / 4)];
  const put = (i, s, gl, gr) => { const k = ((i % N) + N) % N; L[k] += s * gl; R[k] += s * gr; };

  // ---- voices ----
  function bell(t, f, gain, pan = 0, decay = 3.2, dark = 1) {
    const [gl, gr] = pans(pan); const s0 = Math.round(t * sr); const n = Math.round(Math.min(4, 5.5 / decay) * sr);
    for (let i = 0; i < n; i++) {
      const tm = i / sr; const env = Math.min(1, tm / 0.003) * Math.exp(-tm * decay);
      const mod = Math.sin(TAU * f * D.bellRatio * tm) * D.bellIndex * dark * Math.exp(-tm * decay * 1.6);
      put(s0 + i, Math.sin(TAU * f * tm + mod) * env * gain, gl, gr);
    }
  }
  function pluck(t, f, gain, pan = 0, rnd, len = 1.6, bright = D.pluckBright) {
    const [gl, gr] = pans(pan); const s0 = Math.round(t * sr); const p = Math.max(2, Math.round(sr / f));
    const buf = new Float32Array(p); for (let i = 0; i < p; i++) buf[i] = rnd() * 2 - 1;
    const n = Math.round(len * sr); let idx = 0; let lp = 0;
    for (let i = 0; i < n; i++) {
      const a = buf[idx]; const b = buf[(idx + 1) % p];
      const y = (a + b) * 0.5 * 0.996; buf[idx] = y; idx = (idx + 1) % p;
      lp = lp + (y - lp) * bright;
      put(s0 + i, lp * gain * Math.min(1, i / 40), gl, gr);
    }
  }
  function grain(t, f, gain, pan, dur) {
    const [gl, gr] = pans(pan); const s0 = Math.round(t * sr); const n = Math.max(8, Math.round(dur * sr));
    for (let i = 0; i < n; i++) { const w = Math.sin(Math.PI * i / n); put(s0 + i, Math.sin(TAU * f * i / sr) * w * w * gain, gl, gr); }
  }
  function noise(t, dur, gain, pan, rnd, { lo = 0.02, hi = 0.3, attack = 0.05, release = 0.2, shape = null } = {}) {
    const [gl, gr] = pans(pan); const s0 = Math.round(t * sr); const n = Math.round(dur * sr);
    let a = 0; let b = 0;
    for (let i = 0; i < n; i++) {
      const tm = i / sr; const env = Math.min(1, tm / attack) * Math.min(1, (dur - tm) / release) * (shape ? shape(tm / dur) : 1);
      const w = rnd() * 2 - 1; a += (w - a) * hi; b += (a - b) * lo; // band-ish: smoothed minus slower
      put(s0 + i, (a - b) * env * gain, gl, gr);
    }
  }
  function thump(t, gain, f0 = 70, f1 = 38) {
    const s0 = Math.round(t * sr); const n = Math.round(0.6 * sr); let ph = 0;
    for (let i = 0; i < n; i++) { const tm = i / sr; const f = f1 + (f0 - f1) * Math.exp(-tm * 9); ph += TAU * f / sr; put(s0 + i, Math.sin(ph) * Math.exp(-tm * 6) * gain, 0.7, 0.7); }
  }
  /** Chord bed for one shot with short fades so the hard cut stays hard but click-free. */
  function pad(t, dur, freqs, gain, rnd, { bright = 0.5, fadeIn = 0.02, fadeOut = 0.35 } = {}) {
    const s0 = Math.round(t * sr); const n = Math.round((dur + fadeOut) * sr);
    const voices = freqs.flatMap((f) => [[f * (1 - 0.0025), -0.4], [f * (1 + 0.0025), 0.4]]);
    const phase = voices.map(() => rnd() * TAU);
    for (let i = 0; i < n; i++) {
      const tm = i / sr; const env = Math.min(1, tm / fadeIn) * (tm > dur ? Math.max(0, 1 - (tm - dur) / fadeOut) : 1);
      voices.forEach(([f, p], v) => {
        const s = (Math.sin(TAU * f * tm + phase[v]) + bright * 0.3 * Math.sin(TAU * 2 * f * tm + phase[v])) * env * gain / voices.length;
        const [gl, gr] = pans(p); put(s0 + i, s, gl, gr);
      });
    }
  }

  // ---- continuous drone: whole cycles per loop, so the wrap is seamless ----
  const loopHz = (f) => Math.max(1, Math.round(f * duration)) / duration;
  const droneF = [note(0, -1), note(4, -1), note(0, 0)].map(loopHz);
  const lfo = 3 / duration;
  for (let i = 0; i < N; i++) {
    const tm = i / sr; const w = 0.5 + 0.5 * Math.sin(TAU * lfo * tm);
    let s = 0; droneF.forEach((f, k) => { s += Math.sin(TAU * f * tm + k) * (k === 2 ? 0.25 * w : 0.5); });
    L[i] += s * 0.018; R[i] += s * 0.018 * (0.9 + 0.1 * w);
  }

  // ---- per shot ----
  const beat = 60 / D.bpm;
  for (const s of shots) {
    const key = s.repeatOf || s.shot;
    const rnd = mulberry32((D.seed ^ hashString(`shot-${key}`)) >>> 0);
    const t0 = s.start / fps; const len = s.frames / fps;
    const deg = () => Math.floor(rnd() * 12) - 2;
    const pn = () => rnd() * 1.6 - 0.8;
    const chord = [0, 2, 4].map((x) => note(x + Math.floor(rnd() * 4)));
    switch (s.sound) {
      case 'exuberant': {
        thump(t0, 0.16); pad(t0, len, chord.map((f) => f * 2), 0.09, rnd, { bright: 1 });
        for (let i = 0; i * beat / 4 < len; i++) {
          const t = t0 + i * beat / 4 + (i % 2 ? D.swing * beat / 4 : 0);
          if (i % 3) pluck(t, note(deg() + 7), 0.16, pn(), rnd); else bell(t, note(deg() + 7), 0.08, pn(), 3.2);
        }
        for (let i = 0; i < 40; i++) grain(t0 + rnd() * len, note(deg() + 21), 0.02, pn(), 0.01 + rnd() * 0.02);
        break;
      }
      case 'textile': {
        pad(t0, len, chord, 0.05, rnd, { bright: 0.2 });
        const cell = [0, 2, 1, 4].map((x) => x + deg());
        for (let i = 0; i * beat / 2 < len; i++) pluck(t0 + i * beat / 2, note(cell[i % 4] + 7), 0.1, (i % 4) / 2 - 0.75, rnd, 1.1, 0.25);
        break;
      }
      case 'engraved': {
        bell(t0, note(deg() + 7), 0.1, -0.3, 1.8, 0.5);
        for (let i = 0; i < 90; i++) grain(t0 + rnd() * len, 2500 + rnd() * 5000, 0.025, pn(), 0.002 + rnd() * 0.004);
        noise(t0 + 0.2, len - 0.3, 0.05, 0.3, rnd, { hi: 0.6, lo: 0.2, shape: (u) => 0.5 + 0.5 * Math.sin(u * 40) });
        break;
      }
      case 'night': {
        pad(t0, len, [note(0, -1), note(2, -1)], 0.14, rnd, { bright: 0 });
        for (let i = 0; i < 5; i++) bell(t0 + 0.1 + i * len / 5 + rnd() * 0.1, note(deg() + 14), 0.06, pn(), 4);
        break;
      }
      case 'wreath': {
        pad(t0, len, chord, 0.06, rnd, { bright: 0.3 });
        const ring = [0, 2, 4, 6, 7, 6, 4, 2];
        for (let i = 0; i * beat / 3 < len; i++) pluck(t0 + i * beat / 3, note(ring[i % 8] + 5), 0.09, Math.sin(i * TAU / 8) * 0.8, rnd, 1.4);
        break;
      }
      case 'canopy': {
        pad(t0, len, [note(0, -1), note(3, -1), note(5, -1)], 0.16, rnd, { bright: 0.1 });
        noise(t0, len, 0.08, 0, rnd, { hi: 0.05, lo: 0.01, attack: 0.3, release: 0.4 });
        for (let i = 0; i < 6; i++) pluck(t0 + i * len / 6 + rnd() * 0.1, note(deg() - 3), 0.14, pn(), rnd, 1.8, 0.15);
        break;
      }
      case 'corners': {
        pad(t0, len, chord, 0.05, rnd, { bright: 0.1 });
        [-0.9, 0.9, -0.9, 0.9].forEach((p, i) => bell(t0 + i * len / 4, note([0, 4, 2, 7][i] + 7), 0.11, p, 2.4));
        break;
      }
      case 'ornament': {
        pad(t0, len, chord, 0.04, rnd, { bright: 0.2 });
        for (let i = 0; i < 9; i++) pluck(t0 + i * len / 9, note([0, 2, 4][i % 3] + Math.floor(i / 3) * 2 + 7), 0.1, ((i % 3) - 1) * 0.7, rnd, 1.2, 0.3);
        break;
      }
      case 'specimen': {
        bell(t0, note(0, -1), 0.12, -0.6, 1.5); bell(t0 + len * 0.35, note(4 + 7), 0.07, 0.6, 2.5); bell(t0 + len * 0.65, note(2 + 14), 0.04, -0.2, 4);
        break;
      }
      case 'dust': {
        pad(t0, len, [note(0), note(4)], 0.05, rnd, { bright: 0.2 });
        for (let i = 0; i < 220; i++) { const u = Math.pow(rnd(), 0.8); grain(t0 + u * len, note(deg() + 14) * (1 + u * 0.5), 0.03 * (1 - u * 0.5), (rnd() * 2 - 1) * u, 0.008 + rnd() * 0.02); }
        noise(t0, len, 0.05, 0, rnd, { hi: 0.4, lo: 0.08, attack: 0.3, release: 0.1, shape: (u) => u });
        break;
      }
      case 'engineering': {
        thump(t0, 0.18, 90, 45);
        for (let i = 0; i * beat / 4 < len; i++) grain(t0 + i * beat / 4, i % 4 ? 3200 : 1100, i % 4 ? 0.07 : 0.14, ((i % 5) - 2) / 3, 0.004);
        for (let i = 0; i < 4; i++) noise(t0 + rnd() * len * 0.8, 0.12, 0.3, pn(), rnd, { hi: 0.9, lo: 0.3, attack: 0.002, release: 0.08 });
        pad(t0, len, [note(0), note(1), note(6)], 0.07, rnd, { bright: 1 });
        break;
      }
      case 'radial': {
        for (let i = 0; i < 180; i++) { const u = Math.pow(rnd(), 1.8) * 0.55; grain(t0 + u * len, note(deg() + 12), 0.035, (rnd() * 2 - 1) * Math.min(1, u * 3), 0.01 + rnd() * 0.02); }
        pad(t0 + len * 0.35, len * 0.65, chord.map((f) => f * 2), 0.08, rnd, { bright: 0.6, fadeIn: 0.25 });
        bell(t0, note(0, 1), 0.08, 0, 2);
        break;
      }
      case 'wildflower': {
        pad(t0, len, chord, 0.06, rnd, { bright: 0.4 });
        for (let i = 0; i < 22; i++) pluck(t0 + rnd() * len, note(deg() + 7), 0.06 + rnd() * 0.06, pn(), rnd, 1.5);
        break;
      }
      case 'measured': {
        pad(t0, len, chord.map((f) => f * 2), 0.07, rnd, { bright: 0.8 });
        for (let i = 0; i * beat / 2 < len; i++) grain(t0 + i * beat / 2, 1900, 0.06, i % 2 ? 0.5 : -0.5, 0.003);
        break;
      }
      case 'nothing': {
        grain(t0 + len * 0.3, note(4, 3), 0.05, 0.5, 0.05); bell(t0 + len * 0.55, note(2, 2), 0.025, -0.4, 5);
        break;
      }
      case 'single': case 'inside': {
        const inside = s.sound === 'inside';
        // 'inside' shares its hero shot's chord: key on the plate, which the crop reuses.
        const r2 = mulberry32((D.seed ^ hashString(`plate-${s.plate}`)) >>> 0);
        const c16 = [0, 2, 4].map((x) => note(x + Math.floor(r2() * 4)));
        pad(t0, len, inside ? c16.map((f) => f / 2) : c16, inside ? 0.16 : 0.1, r2, { bright: inside ? 0 : 0.6 });
        if (inside) noise(t0, len, 0.07, 0, rnd, { hi: 0.04, lo: 0.01, attack: 0.02 }); else bell(t0, c16[2] * 2, 0.1, 0.2, 1.6);
        break;
      }
      case 'monument': {
        thump(t0, 0.22, 60, 32);
        pad(t0, len, [note(0, -1), note(4, -1), note(0), note(4), note(2, 1)], 0.2, rnd, { bright: 0.9, fadeIn: 0.02 });
        for (let i = 0; i < 6; i++) bell(t0 + i * len / 6, note([0, 4, 7, 9, 11, 14][i] + 7), 0.06, pn(), 1.2);
        noise(t0, len, 0.04, 0, rnd, { hi: 0.2, lo: 0.05, attack: 1.2, release: 0.6 });
        break;
      }
      case 'landscape': {
        pad(t0, len, [note(0, -1), note(4, -1), note(0)], 0.1, rnd, { bright: 0.2 });
        noise(t0, len, 0.05, -0.3, rnd, { hi: 0.03, lo: 0.006, attack: 0.4, release: 0.4 });
        for (let i = 0; i < 8; i++) pluck(t0 + rnd() * len, note(deg() + 7), 0.05, pn(), rnd, 1.8, 0.2);
        break;
      }
      case 'journal': {
        for (let i = 0; i < 9; i++) noise(t0 + rnd() * (len - 0.3), 0.08 + rnd() * 0.2, 0.18, pn(), rnd, { hi: 0.85, lo: 0.35, attack: 0.01, release: 0.05 });
        for (let i = 0; i < 4; i++) grain(t0 + i * len / 4 + 0.1, 1400, 0.05, 0, 0.004);
        pad(t0, len, [note(0), note(2)], 0.04, rnd, { bright: 0 });
        break;
      }
      default: break;
    }
  }

  // ---- circular Schroeder reverb (two passes so tails wrap into the loop start) ----
  const combs = [1557, 1617, 1491, 1422].map((d) => Math.round(d * sr / 44100));
  const wetL = new Float32Array(N); const wetR = new Float32Array(N);
  combs.forEach((d, c) => {
    const bufL = new Float32Array(d); const bufR = new Float32Array(d + 23); let iL = 0; let iR = 0;
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < N; i++) {
      const yl = bufL[iL]; bufL[iL] = L[i] + yl * D.reverbSize; iL = (iL + 1) % d;
      const yr = bufR[iR]; bufR[iR] = R[i] + yr * D.reverbSize; iR = (iR + 1) % (d + 23);
      if (pass === 1) { wetL[i] += yl / combs.length; wetR[i] += yr / combs.length; }
      void c;
    }
  });
  // Level: percentile-based gain with a soft limiter so accents don't flatten the quiet shots.
  const mixL = new Float32Array(N); const mixR = new Float32Array(N);
  const mags = new Float32Array(Math.ceil(N / 8));
  for (let i = 0; i < N; i++) {
    mixL[i] = L[i] + wetL[i] * 0.35; mixR[i] = R[i] + wetR[i] * 0.35;
    if (i % 8 === 0) mags[i / 8] = Math.max(Math.abs(mixL[i]), Math.abs(mixR[i]));
  }
  mags.sort();
  const pre = 0.7 / Math.max(1e-6, mags[Math.floor(mags.length * 0.995)]);
  let peak = 1e-6;
  for (let i = 0; i < N; i++) {
    L[i] = Math.tanh(mixL[i] * pre); R[i] = Math.tanh(mixR[i] * pre);
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  const g = 0.6 / peak; // about -4.4 dBFS sample peak: ~-16 LUFS, true peak below -1 dBTP
  for (let i = 0; i < N; i++) { L[i] *= g; R[i] *= g; }
  return { L, R, sampleRate: sr, design: D, duration };
}

/** 16-bit stereo PCM WAV bytes from a rendered score. */
export function encodeWav({ L, R, sampleRate }) {
  const n = L.length;
  const view = new DataView(new ArrayBuffer(44 + n * 4));
  const str = (o, t) => { for (let i = 0; i < t.length; i++) view.setUint8(o + i, t.charCodeAt(i)); };
  str(0, 'RIFF'); view.setUint32(4, 36 + n * 4, true); str(8, 'WAVE'); str(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 2, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 4, true);
  view.setUint16(32, 4, true); view.setUint16(34, 16, true); str(36, 'data'); view.setUint32(40, n * 4, true);
  const q = (v) => { const x = Math.max(-1, Math.min(1, v)); return x < 0 ? x * 0x8000 : x * 0x7fff; };
  for (let i = 0, o = 44; i < n; i++, o += 4) { view.setInt16(o, q(L[i]), true); view.setInt16(o + 2, q(R[i]), true); }
  return new Uint8Array(view.buffer);
}
