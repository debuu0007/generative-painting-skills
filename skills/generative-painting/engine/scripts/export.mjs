#!/usr/bin/env node
/** Export a collision film.
 *   npm run export                  -> out/<id>/: <id>-native.mp4 (600², fidelity master), <id>.mp4 (1080² Lanczos
 *                                      upscale, delivery), <id>.wav, <id>-contact.png/.jpg, anchors/, manifest.json, checks.json
 *   npm run plates                  -> out/<id>/plates-contact.png + plates/<id>.png at full size (fast art review)
 *   npm run plates -- --only a,b    -> repaint just these plates (fast iteration on one painting)
 *   npm run export -- --out dir     -> custom output folder
 *   npm run export -- --no-video    -> frames/contact/wav/checks only (skip ffmpeg)
 * Every capture waits for window.__frames.ready. Checks fail loudly instead of publishing a broken film. */
import { createHash } from 'node:crypto';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { ID, TITLE, FPS, SIZE, TOTAL_FRAMES, PLATES, SHOTS, AUDIO_SEED, REFERENCE } from '../src/film.js';
import { encodeWav } from '../src/score.js';
import { renderSoftScore } from '../src/score-soft.js'; // lively alternative: renderBotanicalScore from '../src/score.js'

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (k) => argv.includes(`--${k}`);
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };
const out = path.resolve(opt('out', path.join(root, 'out', ID)));
if (REFERENCE && (out + path.sep).startsWith(path.resolve(REFERENCE.root) + path.sep)) throw new Error(`Refusing to export into the original project (${REFERENCE.root})`);
const port = Number(opt('port', 4187));
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const png = (dataUrl) => Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
const pad = (n, w = 5) => String(n).padStart(w, '0');
const seconds = TOTAL_FRAMES / FPS;

function run(bin, args, { quiet = false } = {}) {
  return new Promise((resolve, reject) => {
    let stdout = ''; let stderr = '';
    const child = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; if (!quiet) process.stderr.write(d); });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`${bin} exited ${code}\n${stderr.slice(-2000)}`))));
  });
}

async function probe(file) {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', file], { quiet: true });
  const j = JSON.parse(stdout);
  const v = j.streams.find((s) => s.codec_type === 'video');
  const a = j.streams.find((s) => s.codec_type === 'audio');
  return { codec: v.codec_name, pixFmt: v.pix_fmt, width: v.width, height: v.height, frameRate: v.r_frame_rate, frames: Number(v.nb_read_frames), duration: Number(j.format.duration), audio: a ? { codec: a.codec_name, sampleRate: Number(a.sample_rate), channels: a.channels } : null, sizeBytes: Number(j.format.size) };
}

/** Labelled grid of canvases, composed in the page from the real renderer. */
async function sheet(page, cells, heading) {
  return page.evaluate(async ({ cells, heading }) => {
    const cols = 6; const cell = 230; const label = 40; const padding = 10;
    const rows = Math.ceil(cells.length / cols);
    const s = document.createElement('canvas');
    s.width = cols * (cell + padding) + padding; s.height = rows * (cell + label + padding) + padding + 34;
    const c = s.getContext('2d');
    c.fillStyle = '#141210'; c.fillRect(0, 0, s.width, s.height);
    c.fillStyle = '#e8dcc8'; c.font = '600 15px ui-sans-serif, system-ui, sans-serif'; c.fillText(heading, padding, 23);
    for (let i = 0; i < cells.length; i++) {
      const { frame, plate, text } = cells[i];
      if (cells[i].original) window.__frames.showOriginal(cells[i].original); else if (plate) window.__frames.showPlate(plate); else window.__frames.seekFrame(frame);
      const x = padding + (i % cols) * (cell + padding); const y = 34 + padding + Math.floor(i / cols) * (cell + label + padding);
      c.drawImage(window.__frames.canvas, x, y, cell, cell);
      c.fillStyle = '#e8dcc8'; c.font = '600 12px ui-sans-serif, system-ui, sans-serif'; c.fillText(text[0], x, y + cell + 15, cell);
      c.fillStyle = '#a89c88'; c.font = '11px ui-sans-serif, system-ui, sans-serif'; c.fillText(text[1], x, y + cell + 31, cell);
    }
    return s.toDataURL('image/png');
  }, { cells, heading });
}

/** Capture fidelity: each watercolour painted during capture must equal the original film's plate. */
async function fidelity(plates) {
  const ref = JSON.parse(await readFile(REFERENCE.manifest, 'utf8'));
  const refHash = Object.fromEntries(ref.plates.map((p) => [p.plate, p.hash]));
  const rows = plates.map((p) => ({ plate: p.plate, capturedOriginalHash: p.originalHash, referenceHash: refHash[p.plate] || null, identical: !!p.originalHash && p.originalHash === refHash[p.plate], material: p.material }));
  return { reference: REFERENCE.manifest, allIdentical: rows.every((r) => r.identical), rows };
}

async function main(browser) {
  const page = await browser.newPage({ viewport: { width: 700, height: 700 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  const t0 = Date.now();
  const only = opt('only');
  if (only && !flag('plates-only')) throw new Error('--only works with plates mode (npm run plates -- --only a,b)');
  await page.goto(`http://127.0.0.1:${port}/?export=1${only ? `&only=${encodeURIComponent(only)}` : ''}`, { waitUntil: 'domcontentloaded', timeout: 0 });
  const info = await page.evaluate(() => window.__frames.ready);
  console.log(`${ID}: ${info.plates.length} plates painted in ${Date.now() - t0} ms`);
  await mkdir(out, { recursive: true });

  if (flag('plates-only')) {
    const ids = only ? only.split(',') : Object.keys(PLATES);
    const cells = ids.map((id) => ({ plate: id, text: [id, `seed ${PLATES[id].seed} · density ${PLATES[id].density}`] }));
    await writeFile(path.join(out, 'plates-contact.png'), png(await sheet(page, cells, `${TITLE} · plates`)));
    await mkdir(path.join(out, 'plates'), { recursive: true });
    await mkdir(path.join(out, 'originals'), { recursive: true });
    const withOriginal = [];
    for (const id of ids) {
      const data = await page.evaluate((plate) => { window.__frames.showPlate(plate); return window.__frames.canvas.toDataURL('image/png'); }, id);
      await writeFile(path.join(out, 'plates', `${id}.png`), png(data));
      const orig = await page.evaluate((plate) => { if (!window.__frames.hasOriginal(plate)) return null; window.__frames.showOriginal(plate); return window.__frames.canvas.toDataURL('image/png'); }, id);
      if (orig) { withOriginal.push(id); await writeFile(path.join(out, 'originals', `${id}.png`), png(orig)); }
    }
    if (REFERENCE) await writeFile(path.join(out, 'plates-fidelity.json'), `${JSON.stringify(await fidelity(info.plates), null, 2)}\n`);
    // Side-by-side only for plates that were transformed from an original (replay styles).
    const pairs = withOriginal.flatMap((id) => [{ original: id, text: [`${id} · ${REFERENCE ? 'watercolour' : 'underpainting'}`, REFERENCE ? 'captured original' : 'capture pass'] }, { plate: id, text: [`${id} · pointillist`, 'same geometry'] }]);
    if (pairs.length) await writeFile(path.join(out, 'plates-side-by-side.png'), png(await sheet(page, pairs, `${TITLE} · original vs pointillist`)));
    if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);
    console.log(`Wrote ${path.join(out, 'plates-contact.png')}`);
    return;
  }

  const staging = await mkdtemp(path.join(tmpdir(), `${ID}-`));
  const frameDir = path.join(staging, 'frames');
  await mkdir(frameDir);
  const hashes = [];
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const data = await page.evaluate((f) => { window.__frames.seekFrame(f); return window.__frames.canvas.toDataURL('image/png'); }, i);
    const buf = png(data);
    hashes.push(sha(buf));
    await writeFile(path.join(frameDir, `frame-${pad(i)}.png`), buf);
    if (i % 120 === 0) console.log(`${ID}: frame ${i}/${TOTAL_FRAMES}`);
  }

  // Checks: static holds never wobble, motion shots move, every cut changes the image, repeats match.
  const checks = { staticHolds: [], motion: [], cuts: [], repeats: [], determinism: null };
  for (const s of SHOTS) {
    const set = new Set(hashes.slice(s.start, s.end));
    if (s.motion) checks.motion.push({ shot: s.shot, distinctFrames: set.size, of: s.frames, ok: set.size > 1 });
    else checks.staticHolds.push({ shot: s.shot, ok: set.size === 1 });
    if (s.start > 0) checks.cuts.push({ at: s.start, ok: hashes[s.start] !== hashes[s.start - 1] });
    if (s.repeatOf) {
      const src = SHOTS.find((x) => x.shot === s.repeatOf);
      checks.repeats.push({ shot: s.shot, of: s.repeatOf, ok: hashes[s.start] === hashes[src.start] });
    }
  }
  const probeFrames = [TOTAL_FRAMES - 1, 0, Math.floor(TOTAL_FRAMES / 2), ...SHOTS.filter((s) => s.motion).map((s) => s.start + Math.floor(s.frames / 3))];
  const reseek = await page.evaluate((fs) => fs.map((f) => { window.__frames.seekFrame(f); return window.__frames.canvas.toDataURL('image/png'); }), probeFrames);
  checks.determinism = { outOfOrderSeeks: probeFrames.length, ok: reseek.every((d, i) => sha(png(d)) === hashes[probeFrames[i]]) };
  const failed = Object.entries(checks).flatMap(([k, v]) => (Array.isArray(v) ? v : [v]).filter((x) => !x.ok).map((x) => `${k}: ${JSON.stringify(x)}`));

  // Contact sheet: one mid-frame per shot, plus start/middle/end of each motion shot.
  const cells = SHOTS.map((s) => ({ frame: s.start + Math.floor(s.frames / 2), text: [`${s.shot} · ${s.title}`, `frames ${s.start}–${s.end - 1} (${s.frames}) · ${s.sound}${s.repeatOf ? ` · repeat of ${s.repeatOf}` : ''}${s.crop ? ' · crop' : ''}`] }));
  for (const s of SHOTS.filter((x) => x.motion)) for (const [w, f] of [['start', s.start], ['middle', s.start + Math.floor(s.frames / 2)], ['end', s.end - 1]]) cells.push({ frame: f, text: [`${s.shot} ${s.motion} · ${w}`, `frame ${f}`] });
  await writeFile(path.join(out, `${ID}-contact.png`), png(await sheet(page, cells, `${TITLE} · ${TOTAL_FRAMES} frames @ ${FPS} fps`)));
  await rm(path.join(out, 'anchors'), { recursive: true, force: true });
  await mkdir(path.join(out, 'anchors'));
  for (const s of SHOTS) { const f = s.start + Math.floor(s.frames / 2); await cp(path.join(frameDir, `frame-${pad(f)}.png`), path.join(out, 'anchors', `${s.shot}-${s.plate}-f${pad(f, 4)}.png`)); }
  if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);

  // Soundtrack. Translation mode (REFERENCE set) reuses the source film's sound unchanged: its WAV is
  // copied byte-for-byte and its AAC stream copied into the MP4s. Otherwise the score is rendered here.
  const score = renderSoftScore({ shots: SHOTS, fps: FPS, frames: TOTAL_FRAMES, sampleRate: 48000, seedString: AUDIO_SEED });
  const wav = path.join(out, `${ID}.wav`);
  const audio = { source: REFERENCE ? 'original soundtrack reused' : 'rendered' };
  if (REFERENCE) {
    await cp(REFERENCE.wav, wav);
    audio.referenceWavSha256 = sha(await readFile(REFERENCE.wav));
    audio.rerenderedWavSha256 = sha(Buffer.from(encodeWav(score)));
    // Informational: true only when this project's score and seed are the source film's own.
    audio.rerenderIdentical = audio.referenceWavSha256 === audio.rerenderedWavSha256;
  } else {
    await writeFile(wav, encodeWav(score));
  }

  const outputs = {};
  if (!flag('no-video')) {
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(out, `${ID}-contact.png`), '-q:v', '3', path.join(out, `${ID}-contact.jpg`)], { quiet: true });
    // Translation mode: the source AAC stream is copied (not re-encoded) so the delivered sound is unchanged.
    const audioIn = REFERENCE ? ['-i', REFERENCE.mp4] : ['-i', wav];
    const audioCodec = REFERENCE ? ['-c:a', 'copy'] : ['-c:a', 'aac', '-b:a', '256k', '-ar', '48000'];
    const input = ['-framerate', String(FPS), '-i', path.join(frameDir, 'frame-%05d.png'), ...audioIn];
    const x264 = ['-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-profile:v', 'high', ...audioCodec, '-movflags', '+faststart', '-r', String(FPS)];
    const native = path.join(out, `${ID}-native.mp4`);
    const delivery = path.join(out, `${ID}.mp4`);
    await run('ffmpeg', ['-y', '-loglevel', 'error', ...input, ...x264, native], { quiet: true });
    await run('ffmpeg', ['-y', '-loglevel', 'error', ...input, '-vf', 'scale=1080:1080:flags=lanczos', ...x264, delivery], { quiet: true });
    for (const [file, size, role] of [[native, SIZE, 'fidelity master: native frames'], [delivery, 1080, 'delivery: the same frames Lanczos-upscaled to 1080² (not a re-render)']]) {
      const pr = await probe(file);
      outputs[path.basename(file)] = { ...pr, role };
      if (pr.frames !== TOTAL_FRAMES || pr.width !== size || pr.codec !== 'h264' || pr.pixFmt !== 'yuv420p' || !pr.audio || Math.abs(pr.duration - seconds) > 0.05) failed.push(`${path.basename(file)} probe: ${JSON.stringify(pr)}`);
    }
    if (REFERENCE) {
      const md5 = async (f) => (await run('ffmpeg', ['-v', 'error', '-i', f, '-map', '0:a', '-c', 'copy', '-f', 'md5', '-'], { quiet: true })).stdout.trim();
      audio.referenceAacMd5 = await md5(REFERENCE.mp4);
      audio.nativeAacMd5 = await md5(native); audio.deliveryAacMd5 = await md5(delivery);
      audio.streamIdentical = audio.referenceAacMd5 === audio.nativeAacMd5 && audio.referenceAacMd5 === audio.deliveryAacMd5;
      if (!audio.streamIdentical) failed.push('soundtrack: AAC stream differs from the original MP4');
    }
    // Compression. The gate measures the encode in the video's own colour space: decoded native MP4
    // vs the lossless frame converted to yuv420p (Y/U/V PSNR >= 40 dB). RGB PSNR is reported too; it
    // is lower on dense complementary-dot plates because 4:2:0 halves colour resolution (inherent to
    // standard H.264 delivery; a lossless yuv420p encode scores the same RGB PSNR).
    const probeAt = [...SHOTS.map((s) => s.start + Math.floor(s.frames / 2)), ...SHOTS.filter((s) => s.motion).flatMap((s) => [s.start, s.end - 1])];
    checks.compression = [];
    for (const f of probeAt) {
      const frame = path.join(frameDir, `frame-${pad(f)}.png`);
      const yuv = (await run('ffmpeg', ['-v', 'info', '-i', native, '-i', frame, '-lavfi', `[0:v]select=eq(n\\,${f})[a];[1:v]format=yuv420p[b];[a][b]psnr`, '-frames:v', '1', '-f', 'null', '-'], { quiet: true })).stderr;
      const rgb = (await run('ffmpeg', ['-v', 'info', '-i', native, '-i', frame, '-lavfi', `[0:v]select=eq(n\\,${f}),format=rgb24[a];[1:v]format=rgb24[b];[a][b]psnr`, '-frames:v', '1', '-f', 'null', '-'], { quiet: true })).stderr;
      const num = (s, k) => { const m = s.match(new RegExp(`${k}:([\\d.]+|inf)`)); return m ? (m[1] === 'inf' ? 99 : Number(m[1])) : null; };
      const y = num(yuv, ' y'); const u = num(yuv, 'u'); const v = num(yuv, 'v');
      checks.compression.push({ frame: f, yuvPsnrDb: { y, u, v }, rgbPsnrDb: num(rgb, 'average'), ok: [y, u, v].every((q) => q !== null && q >= 40) });
    }
    for (const c of checks.compression) if (!c.ok) failed.push(`compression: frame ${c.frame} ${JSON.stringify(c.yuvPsnrDb)}`);
  }

  const manifest = {
    id: ID, title: TITLE, exportedAt: new Date().toISOString(), fps: FPS, frames: TOTAL_FRAMES, seconds, size: SIZE, audioSeed: AUDIO_SEED,
    audioDesign: score.design,
    versions: JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).dependencies,
    plates: info.plates, particles: info.particles, audio,
    material: 'pointillist translation: geometry captured from the unmodified watercolour scenes (capture.js) and replayed as dots (pointillism.js); dot colour references the captured original',
    fidelity: REFERENCE ? await fidelity(info.plates) : null,
    shots: SHOTS.map(({ shot, title, start, end, frames, plate, seed, sound, motion, crop, repeatOf }) => ({ shot, title, start, end, frames, plate, seed, sound, motion, crop, repeatOf })),
    outputs,
  };
  await writeFile(path.join(out, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(path.join(out, 'checks.json'), `${JSON.stringify({ ...checks, failed }, null, 2)}\n`);
  await rm(staging, { recursive: true, force: true });
  if (failed.length) throw new Error(`Checks failed (see checks.json):\n${failed.join('\n')}`);
  console.log(`Published ${out}: ${Object.keys(outputs).join(', ') || 'no video (--no-video)'}; all checks passed`);
}

let vite; let browser;
try {
  vite = await createServer({ root, logLevel: 'warn', server: { host: '127.0.0.1', port, strictPort: true } });
  await vite.listen();
  browser = await chromium.launch();
  await main(browser);
} finally {
  await browser?.close();
  await vite?.close();
}
process.exit(0);
