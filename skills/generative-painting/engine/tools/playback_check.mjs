#!/usr/bin/env node
/** Real-time playback measurement of the preview (not a substitute for a human watching and
 * listening). Opens the normal preview, waits for readiness, samples the HUD frame counter against
 * wall time for ~6 s (crossing the loop point), and reports the effective rate, the loop wrap and
 * any browser errors. Usage: node tools/playback_check.mjs [--port 4195] */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { FPS, TOTAL_FRAMES } from '../src/film.js';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const i = process.argv.indexOf('--port'); const port = i > 0 ? Number(process.argv[i + 1]) : 4195;
const vite = await createServer({ root, logLevel: 'warn', server: { host: '127.0.0.1', port, strictPort: true } });
await vite.listen();
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 700, height: 700 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded', timeout: 0 });
  await page.evaluate(() => window.__frames.ready);
  const samples = [];
  const t0 = Date.now();
  while (Date.now() - t0 < 6000) {
    const f = await page.evaluate(() => Number((document.getElementById('hud').textContent.match(/^(\d+)\//) || [])[1]));
    samples.push([Date.now() - t0, f]);
    await new Promise((r) => setTimeout(r, 100));
  }
  // Unwrap the loop to measure advance.
  let adv = 0; let wraps = 0;
  for (let k = 1; k < samples.length; k++) { let d = samples[k][1] - samples[k - 1][1]; if (d < 0) { d += TOTAL_FRAMES; wraps++; } adv += d; }
  const secs = (samples[samples.length - 1][0] - samples[0][0]) / 1000;
  const rate = adv / secs;
  console.log(JSON.stringify({ wallSeconds: +secs.toFixed(2), framesAdvanced: adv, effectiveFps: +rate.toFixed(2), targetFps: FPS, speed: +(rate / FPS).toFixed(3), loopWraps: wraps, errors }, null, 1));
} finally {
  await browser.close(); await vite.close();
}
process.exit(0);
