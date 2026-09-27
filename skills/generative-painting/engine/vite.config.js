import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));

// The pinned UMD builds are served byte-for-byte as classic scripts, never transformed by Vite.
const raw = {
  'vendor/p5.min.js': 'node_modules/p5/lib/p5.min.js',
  'vendor/p5.brush.js': 'node_modules/p5.brush/dist/p5.brush.js',
};

function rawScripts() {
  return {
    name: 'raw-classic-scripts',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const key = (req.url || '').split('?')[0].replace(/^\//, '');
        if (!raw[key]) return next();
        res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(readFileSync(path.join(root, raw[key])));
      });
    },
  };
}

export default defineConfig({
  plugins: [rawScripts()],
  server: { port: 5173 },
  optimizeDeps: { entries: ['index.html'] },
});
